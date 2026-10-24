/* Готовлю как умею — связь страницы с Supabase.
   Страница общается с базой через небольшой интерфейс (db / who / assets), который раньше давал claude.ai.
   Здесь тот же интерфейс, но поверх Supabase: вход, профили, рецепты, «Получилось»/«Упс», комментарии, лайки, личное меню, фото. */
const SB_URL = "https://ljpzvbvpnfrvcedjdkga.supabase.co";
const SB_KEY = "sb_publishable_sOPyjfHTkFmkZdt_BXVkxw_dN9EiHD3"; // публичный ключ, доступ ограничен правилами в базе
const sb = window.supabase.createClient(SB_URL, SB_KEY);

let ME = null, PROFILE = null;
const PROFILES = {};

const ms = t => (t ? Date.parse(t) : 0);
async function chk(p) { const { data, error } = await p; if (error) { const e = new Error(error.message); e.code = error.code; throw e; } return data; }

/* фото: пути из хранилища, перенесённые картинки из img/ и полные ссылки */
function blobUrl(id) {
  id = String(id || "");
  if (!id) return "";
  if (/^(https?:|img\/|data:)/.test(id)) return id;
  return sb.storage.from("photos").getPublicUrl(id).data.publicUrl;
}

/* кружок с первой буквой имени, если нет аватара */
const AV_COLORS = ["#F04D36", "#4A5800", "#765500", "#3A6EA5", "#7A4FA0", "#2F8F6B"];
function avatarFor(name) {
  const n = String(name || "?").trim() || "?", ch = n[0].toUpperCase();
  let h = 0; for (const c of n) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const bg = AV_COLORS[h % AV_COLORS.length];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><circle cx="20" cy="20" r="20" fill="${bg}"/><text x="20" y="26" text-anchor="middle" font-family="system-ui,sans-serif" font-size="18" font-weight="700" fill="#fff">${ch.replace(/[<&>"]/g, "")}</text></svg>`;
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}
function profileOf(id) { const p = PROFILES[id]; return { id, name: p ? p.name : "", avatarUrl: (p && p.avatar_url) ? blobUrl(p.avatar_url) : avatarFor(p ? p.name : "") }; }
async function loadProfiles() { (await chk(sb.from("profiles").select("id,name,avatar_url,people,country,currency"))).forEach(p => (PROFILES[p.id] = p)); }

/* живой запрос: загрузить, потом перезагружать при изменениях в таблице */
function snap(rows, map) { return { docs: rows.map(r => { const o = map(r); return { id: o.id, data: () => { const { id, ...rest } = o; return rest; } }; }) }; }
function live(table, filter, load, cb, err) {
  let t = null, dead = false;
  const run = async () => { try { const v = await load(); if (!dead) cb(v); } catch (e) { if (err) err(e); } };
  run();
  const ch = sb.channel(table + ":" + (filter || "all") + ":" + Math.random().toString(36).slice(2))
    .on("postgres_changes", { event: "*", schema: "public", table, ...(filter ? { filter } : {}) }, () => { clearTimeout(t); t = setTimeout(() => { if (!dead) run(); }, 150); })
    .subscribe();
  return () => { dead = true; sb.removeChannel(ch); };
}

/* гость (без входа) может только смотреть: любая запись открывает окно входа */
function need() { if (ME) return; openAuth("up"); const e = new Error("Войди или зарегистрируйся, чтобы это сделать"); e.code = "auth"; throw e; }
const guarded = fn => (...a) => { need(); return fn(...a); };
const recMap = r => ({ id: r.id, ...(r.data || {}), owner: r.owner, copiedFrom: r.copied_from || null, createdAt: ms(r.created_at) });
const strip = o => { const { id, owner, copiedFrom, createdAt, ...rest } = o || {}; return rest; };
/* меню другого человека: видно только тем, кто вошёл */
async function planOf(uid) { if (!ME) return null; const rows = await chk(sb.from("plans").select("data").eq("owner", uid)); return rows[0] ? rows[0].data || {} : {}; }

/* аватар: квадрат 400×400 из середины фото */
async function squareAvatar(file) {
  const bmp = await createImageBitmap(file), s = Math.min(bmp.width, bmp.height), out = 400;
  const c = document.createElement("canvas"); c.width = c.height = out;
  c.getContext("2d").drawImage(bmp, (bmp.width - s) / 2, (bmp.height - s) / 2, s, s, 0, 0, out, out);
  return await new Promise(res => c.toBlob(res, "image/jpeg", 0.88));
}
async function setAvatar(file) {
  let path = "";
  if (file) {
    const blob = await squareAvatar(file);
    path = ME.id + "/avatar-" + Date.now() + ".jpg";
    await chk(sb.storage.from("photos").upload(path, blob, { contentType: "image/jpeg", upsert: false }));
  }
  const old = PROFILE.avatar_url;
  await chk(sb.from("profiles").update({ avatar_url: path || null }).eq("id", ME.id));
  PROFILE = { ...PROFILE, avatar_url: path || null }; PROFILES[ME.id] = { ...PROFILES[ME.id], avatar_url: path || null };
  if (old && old.startsWith(ME.id + "/")) sb.storage.from("photos").remove([old]).catch(() => {});
  drawProfBtn(); if (typeof render === "function") render();
}

const sbDb = {
  collection(path) {
    const seg = path.split("/");
    if (path === "recipes") return {
      onSnapshot(cb, err) { return live("recipes", null, async () => snap(await chk(sb.from("recipes").select("*").order("created_at")), recMap), cb, err); },
      add: guarded(async o => { const row = await chk(sb.from("recipes").insert({ data: strip(o), copied_from: o.copiedFrom || null }).select("id").single()); return { id: row.id }; }),
      doc(id) { return {
        update: guarded(p => chk(sb.rpc("patch_recipe", { rid: id, patch: strip(p) }))),
        set: guarded(o => chk(sb.from("recipes").update({ data: strip(o) }).eq("id", id))),
        delete: guarded(() => chk(sb.from("recipes").delete().eq("id", id))) }; }
    };
    if (path === "templates") return {
      onSnapshot(cb, err) { if (!ME) { cb({ docs: [] }); return () => {}; } return live("templates", "owner=eq." + ME.id, async () => snap(await chk(sb.from("templates").select("*").eq("owner", ME.id)), r => ({ id: r.id, name: r.name, ...(r.data || {}), created: ms(r.created_at) })), cb, err); },
      add: guarded(async o => { const { name, ...rest } = o; const row = await chk(sb.from("templates").insert({ name: name || "", data: rest }).select("id").single()); return { id: row.id }; }),
      doc(id) { return { delete: guarded(() => chk(sb.from("templates").delete().eq("id", id))) }; }
    };
    if (seg[0] === "recipes" && seg.length === 3) {
      const rid = seg[1], kind = seg[2], f = "recipe_id=eq." + rid;
      if (kind === "notes") return {
        onSnapshot(cb, err) { return live("notes", f, async () => snap(await chk(sb.from("notes").select("*").eq("recipe_id", rid)), r => ({ id: r.id, kind: r.kind, text: r.text, photo: r.photo, by: r.by, at: ms(r.at) })), cb, err); },
        add: guarded(async o => { const row = await chk(sb.from("notes").insert({ recipe_id: rid, kind: o.kind, text: o.text || "", photo: o.photo || "" }).select("id").single()); return { id: row.id }; }),
        doc(id) { return { delete: guarded(() => chk(sb.from("notes").delete().eq("id", id))) }; }
      };
      if (kind === "comments") return {
        onSnapshot(cb, err) { return live("comments", f, async () => snap(await chk(sb.from("comments").select("*").eq("recipe_id", rid)), r => ({ id: r.id, note: r.note_id, text: r.text, by: r.by, at: ms(r.at) })), cb, err); },
        add: guarded(async o => { const row = await chk(sb.from("comments").insert({ recipe_id: rid, note_id: o.note, text: o.text }).select("id").single()); return { id: row.id }; }),
        doc(id) { return { delete: guarded(() => chk(sb.from("comments").delete().eq("id", id))) }; }
      };
      if (kind === "likes") return {
        onSnapshot(cb, err) { return live("likes", f, async () => snap(await chk(sb.from("likes").select("*").eq("recipe_id", rid)), r => ({ id: r.note_id + "__" + r.by, note: r.note_id, by: r.by, at: ms(r.at) })), cb, err); },
        doc(lid) { const [nid, by] = lid.split("__"); return {
          set: guarded(() => chk(sb.from("likes").insert({ note_id: nid, recipe_id: rid }))),
          delete: guarded(() => chk(sb.from("likes").delete().eq("note_id", nid).eq("by", by))) }; }
      };
    }
    throw new Error("Неизвестная коллекция: " + path);
  },
  doc(path) {
    if (path === "plan/week") return {
      onSnapshot(cb, err) { if (!ME) { cb({ exists: true, data: () => ({ people: 2 }) }); return () => {}; } return live("plans", "owner=eq." + ME.id, async () => { const rows = await chk(sb.from("plans").select("*").eq("owner", ME.id)); const d = rows[0] ? rows[0].data : {}; return { exists: true, data: () => ({ people: PROFILE.people || 2, ...(d || {}) }) }; }, cb, err); },
      set: guarded(o => chk(sb.from("plans").upsert({ owner: ME.id, data: o, updated_at: new Date().toISOString() })))
    };
    throw new Error("Неизвестный документ: " + path);
  }
};

const whoApi = {
  async id() { return ME ? ME.id : null; },
  async me() { return { id: ME.id, name: PROFILE.name }; },
  can() { return !!ME; },
  canEdit() { return false; },
  isOwner() { return false; },
  async profiles(ids) { if (ids.some(i => !PROFILES[i])) { try { await loadProfiles(); } catch (e) {} } const o = {}; ids.forEach(i => (o[i] = profileOf(i))); return o; }
};

/* уменьшаем большие фото перед загрузкой: быстрее и экономит место */
async function shrink(file) {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type) || file.size < 600 * 1024) return file;
  try {
    const bmp = await createImageBitmap(file);
    const k = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));
    const c = document.createElement("canvas"); c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k);
    c.getContext("2d").drawImage(bmp, 0, 0, c.width, c.height);
    const out = await new Promise(res => c.toBlob(res, "image/jpeg", 0.85));
    return out && out.size < file.size ? out : file;
  } catch (e) { return file; }
}
const assetsApi = {
  async upload(file) {
    const blob = await shrink(file);
    const ext = blob.type === "image/jpeg" ? "jpg" : (blob.type.split("/")[1] || "jpg");
    const path = ME.id + "/" + crypto.randomUUID() + "." + ext;
    await chk(sb.storage.from("photos").upload(path, blob, { contentType: blob.type, upsert: false }));
    return { id: path, url: blobUrl(path) };
  }
};

/* ---------- вход, регистрация, профиль ---------- */
const COUNTRIES = [["Германия", "EUR"], ["Россия", "RUB"], ["Казахстан", "KZT"], ["Беларусь", "BYN"], ["Украина", "UAH"], ["Армения", "AMD"], ["Грузия", "GEL"], ["Израиль", "ILS"], ["Другая страна", "EUR"]];
const CURRENCIES = ["EUR", "RUB", "KZT", "BYN", "UAH", "AMD", "GEL", "ILS", "USD", "GBP"];
const hEsc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const AUTH_ERR = { "Invalid login credentials": "Неверная почта или пароль.", "User already registered": "Эта почта уже зарегистрирована — попробуй войти.", "Email not confirmed": "Почта ещё не подтверждена — проверь письмо." };
const authMsg = e => AUTH_ERR[e && e.message] || (e && /Password should be/.test(e.message) ? "Пароль — минимум 6 символов." : (e && e.message) || "Что-то пошло не так.");

function profileFields(p) {
  p = p || { name: "", people: 2, country: "Германия", currency: "EUR" };
  return `<label>Как тебя зовут<input id="pf_name" required maxlength="40" value="${hEsc(p.name)}" placeholder="Имя"></label>
    <label>Сколько вас обычно за столом<input id="pf_people" type="number" min="1" max="20" value="${hEsc(p.people || 2)}"></label>
    <div class="arow"><label>Страна<select id="pf_country">${COUNTRIES.map(([c]) => `<option ${p.country === c ? "selected" : ""}>${c}</option>`).join("")}</select></label>
    <label>Валюта<select id="pf_cur">${CURRENCIES.map(c => `<option ${p.currency === c ? "selected" : ""}>${c}</option>`).join("")}</select></label></div>`;
}
function bindCountry() { const c = document.getElementById("pf_country"), cur = document.getElementById("pf_cur"); if (c) c.onchange = () => { const m = COUNTRIES.find(x => x[0] === c.value); if (m) cur.value = m[1]; }; }
const readProfile = () => ({ name: document.getElementById("pf_name").value.trim(), people: Math.max(1, Math.min(20, parseInt(document.getElementById("pf_people").value, 10) || 2)), country: document.getElementById("pf_country").value, currency: document.getElementById("pf_cur").value });

function openAuth(mode) {
  mode = mode || "in";
  const old = document.getElementById("authOv"); if (old) old.remove();
  const ov = document.createElement("div"); ov.className = "pov"; ov.id = "authOv"; ov.setAttribute("role", "dialog"); ov.setAttribute("aria-modal", "true");
  ov.innerHTML = `<form class="auth ppanel" id="authForm">
    <div class="seg" role="tablist"><button type="button" data-am="in" ${mode === "in" ? 'aria-current="page"' : ""}>Вход</button><button type="button" data-am="up" ${mode === "up" ? 'aria-current="page"' : ""}>Регистрация</button></div>
    <p class="muted" style="margin:0">${mode === "up" ? "Чтобы копировать рецепты, вести своё меню и писать «упсы». Регистрация бесплатная." : "С возвращением!"}</p>
    <label>Почта<input id="au_email" type="email" required autocomplete="email"></label>
    <label>Пароль<input id="au_pass" type="password" required minlength="6" autocomplete="${mode === "up" ? "new-password" : "current-password"}" placeholder="${mode === "up" ? "минимум 6 символов" : ""}"></label>
    ${mode === "up" ? profileFields() : ""}
    <div class="arow"><button class="btn primary" type="submit">${mode === "up" ? "Зарегистрироваться" : "Войти"}</button><button class="btn" type="button" id="auClose">Не сейчас</button></div>
    <p class="aerr" id="au_err" role="alert"></p>
  </form>`;
  document.body.appendChild(ov); bindCountry();
  const close = () => ov.remove();
  ov.addEventListener("click", e => { if (e.target === ov) close(); });
  document.getElementById("auClose").onclick = close;
  ov.querySelectorAll("[data-am]").forEach(b => (b.onclick = () => openAuth(b.dataset.am)));
  setTimeout(() => { const i = document.getElementById("au_email"); if (i) i.focus(); }, 30);
  document.getElementById("authForm").onsubmit = async e => {
    e.preventDefault();
    const er = document.getElementById("au_err"), btn = e.target.querySelector("button[type=submit]");
    er.textContent = ""; btn.disabled = true;
    const email = document.getElementById("au_email").value.trim(), password = document.getElementById("au_pass").value;
    try {
      if (mode === "up") {
        const p = readProfile(); if (!p.name) throw new Error("Напиши, как тебя зовут.");
        const { data, error } = await sb.auth.signUp({ email, password, options: { data: p } });
        if (error) throw error;
        if (!data.session) { er.textContent = "Почти готово: проверь почту и нажми ссылку из письма, потом войди."; btn.disabled = false; return; }
      } else {
        const { error } = await sb.auth.signInWithPassword({ email, password }); if (error) throw error;
      }
      er.textContent = "Готово, открываю…";
    } catch (err) { er.textContent = authMsg(err); btn.disabled = false; }
  };
}

function openProfile() {
  const ov = document.createElement("div"); ov.className = "pov"; ov.setAttribute("role", "dialog"); ov.setAttribute("aria-modal", "true");
  ov.innerHTML = `<form class="auth ppanel" id="profForm"><h2>Профиль</h2>
    <div class="avrow"><img class="avbig" id="pfAv" src="${profileOf(ME.id).avatarUrl}" alt="Аватар"><div class="avbtns"><label class="btn">Выбрать фото<input type="file" accept="image/*" id="pfAvIn" hidden></label>${PROFILE.avatar_url ? '<button class="btn link" type="button" id="pfAvDel">Убрать фото</button>' : ""}</div></div>
    ${profileFields(PROFILE)}
    <p class="muted" style="margin:0;font-size:.85rem">${hEsc(ME.email || "")}</p>
    <div class="arow"><button class="btn primary" type="submit">Сохранить</button><button class="btn" type="button" id="pfClose">Закрыть</button></div>
    <button class="btn link" type="button" id="pfOut" style="align-self:flex-start">Выйти</button><p class="aerr" id="pf_err" role="alert"></p></form>`;
  document.body.appendChild(ov); bindCountry();
  const close = () => ov.remove();
  ov.addEventListener("click", e => { if (e.target === ov) close(); });
  document.getElementById("pfClose").onclick = close;
  const avErr = m => (document.getElementById("pf_err").textContent = m);
  document.getElementById("pfAvIn").onchange = async e => { const f = e.target.files[0]; if (!f) return; avErr("Загружаю фото…");
    try { await setAvatar(f); document.getElementById("pfAv").src = profileOf(ME.id).avatarUrl; avErr("Фото сохранено ✓"); } catch (err) { avErr("Фото не загрузилось: " + err.message); } };
  const avDel = document.getElementById("pfAvDel");
  if (avDel) avDel.onclick = async () => { try { await setAvatar(null); document.getElementById("pfAv").src = profileOf(ME.id).avatarUrl; avDel.remove(); avErr(""); } catch (err) { avErr("Не получилось: " + err.message); } };
  document.getElementById("pfOut").onclick = async () => { close(); await sb.auth.signOut(); location.hash = ""; location.reload(); };
  document.getElementById("profForm").onsubmit = async e => {
    e.preventDefault(); const p = readProfile();
    if (!p.name) { document.getElementById("pf_err").textContent = "Имя не может быть пустым."; return; }
    try {
      await chk(sb.from("profiles").update(p).eq("id", ME.id));
      PROFILE = { ...PROFILE, ...p }; PROFILES[ME.id] = { ...PROFILES[ME.id], ...p };
      if (typeof plan !== "undefined" && typeof savePlan === "function") { plan = { ...plan, people: p.people }; savePlan(plan); }
      drawProfBtn(); close(); if (typeof render === "function") render();
    } catch (err) { document.getElementById("pf_err").textContent = "Не получилось сохранить: " + err.message; }
  };
}
function drawProfBtn() {
  const pb = document.getElementById("profBtn"); if (!pb) return;
  if (!ME) { pb.hidden = false; pb.classList.add("guest"); pb.innerHTML = "<span>Войти</span>"; pb.onclick = () => openAuth("in"); return; }
  pb.classList.remove("guest");
  pb.hidden = false; pb.innerHTML = `<img class="av" src="${profileOf(ME.id).avatarUrl}" alt=""><span>${hEsc(PROFILE.name || "Профиль")}</span>`;
  pb.onclick = openProfile;
}

/* старт: гостем или под своим именем; смена входа перезагружает страницу */
const guestWho = { async id() { return null; }, async me() { return { id: null, name: "" }; }, can() { return false; }, canEdit() { return false; }, isOwner() { return false }, profiles: (ids) => whoApi.profiles(ids) };
let startedAs;
async function startWith(session) {
  const key = session ? session.user.id : "guest";
  if (startedAs !== undefined) { if (startedAs !== key) location.reload(); return; }
  startedAs = key;
  ME = session ? session.user : null;
  try { await loadProfiles(); } catch (e) {}
  PROFILE = ME ? (PROFILES[ME.id] || { id: ME.id, name: (ME.user_metadata || {}).name || "", people: 2, country: "", currency: "EUR" }) : null;
  drawProfBtn();
  /* новые друзья появляются сразу, без перезагрузки */
  live("profiles", null, loadProfiles, () => { if (typeof render === "function") render(); }, () => {});
  window.__startApp({ db: sbDb, assets: ME ? assetsApi : null, sample: null, who: ME ? whoApi : guestWho });
  if (!ME) { const ib = document.getElementById("impBtn"); if (ib) ib.hidden = true; }
}
sb.auth.onAuthStateChange((_ev, session) => { setTimeout(() => startWith(session), 0); });
