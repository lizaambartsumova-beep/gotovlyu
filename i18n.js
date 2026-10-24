/* Готовлю как умею — английская версия.
   Язык хранится в браузере (localStorage "lang"). Русский — основной: рецепты пишутся и редактируются по-русски,
   а английский перевод лежит в рецепте в поле `en`. Надписи интерфейса переводятся словарём ниже. */
let LANG = "ru";
try { if (localStorage.getItem("lang") === "en") LANG = "en"; } catch (e) {}
const EN = LANG === "en";

/* ---------- словарь интерфейса: точная фраза → перевод ---------- */
const UI = {
  "Готовлю как умею": "Cooking As Best I Can",
  "Рецепты, которые получились и не очень, меню на неделю и список покупок. Готовим, делимся с друзьями и учимся на своих «упсах».": "Recipes that worked out and some that didn't, a weekly menu and a shopping list. We cook, share with friends and learn from our \"oops\" moments.",
  "Рецепты, меню на неделю и список покупок — вместе с друзьями.": "Recipes, a weekly menu and a shopping list — together with friends.",
  "Рецепты": "Recipes", "Рецепт": "Recipe", "Рецепт:": "Recipe:", "рецепт": "recipe", "рецепта": "recipes", "рецептов": "recipes",
  "Меню и покупки": "Menu & shopping", "Разделы": "Sections",
  "Новый рецепт": "New recipe", "Войти": "Log in", "Выйти": "Log out", "Вход": "Log in", "Регистрация": "Sign up",
  "Все рецепты": "All recipes", "Все": "All", "Получилось": "Worked out", "Получилось ✓": "Worked out ✓", "В плане": "Planned", "Хочу попробовать": "Want to try",
  "🌿 Бережно для желудка": "🌿 Gentle on the stomach", "Скрыть базовые": "Hide basics", "Базовые скрыты": "Basics hidden",
  "🌿 бережно": "🌿 gentle", "бережно": "gentle", "базовый": "basic", "лёгкий": "easy", "▶ видео": "▶ video", "Видео": "Video",
  "🌿 Запечённое или варёное, мало жира, без острого, мало кислого и сырого лука/чеснока. Это общие правила, а не медицинский совет: ориентируйся на то, как реагирует желудок.": "🌿 Baked or boiled, low in fat, not spicy, little acid and raw onion/garlic. These are general rules, not medical advice: go by how your stomach reacts.",
  "Что есть дома": "What's at home", "например: картошка, сметана": "e.g. potatoes, sour cream", "ещё продукт…": "another ingredient…", "Сбросить": "Reset",
  "Сверху — где совпало больше всего. Соль, специи и мелочи вроде чеснока или лимона для соуса не считаются.": "Best matches first. Salt, spices and small things like garlic or lemon for a sauce don't count.",
  "С этими продуктами пока ничего не нашлось. Попробуй убрать один из них.": "Nothing found with these ingredients yet. Try removing one.",
  "В этом разделе пока пусто.": "Nothing here yet.", "Рецептов пока нет. Нажми «Новый рецепт», чтобы добавить первый.": "No recipes yet. Press \"New recipe\" to add the first one.",
  "всё есть 🎉": "you have everything 🎉", "докупить": "to buy",
  "Загружаю рецепты…": "Loading recipes…", "Загружаю рецепт…": "Loading recipe…", "Загружаю меню…": "Loading menu…", "Загружаю фото…": "Uploading photo…",
  "Чем полезно": "Why it's good for you", "💚 Чем полезно": "💚 Why it's good for you", "Продукты": "Ingredients", "Продукты:": "Ingredients:", "Ингредиенты": "Ingredients", "Ингредиенты:": "Ingredients:",
  "Шаги": "Steps", "Шаги:": "Steps:", "Шаг": "Step", "Заранее": "In advance", "Как понять, что готово": "How to tell it's done", "Хранение": "Storage", "Заметки": "Notes",
  "Чтобы не испортить": "How not to ruin it", "Фото процесса": "Process photos", "🔥 Духовка": "🔥 Oven", "Духовка": "Oven",
  "Смотреть видео": "Watch video", "▶ Видео:": "▶ Video:", "🔗 Рецепт:": "🔗 Recipe:", "🔗 Добавить ссылку на рецепт": "🔗 Add a link to the recipe",
  "Видео пока нет — добавь ссылку в «Изменить».": "No video yet — add a link in \"Edit\".",
  "Список ещё не заполнен.": "The list isn't filled in yet.", "Шаги ещё не записаны.": "The steps aren't written yet.",
  "Рецепт на": "Recipe for", "порции": "servings", "порций": "servings", "порцию": "serving", "как в рецепте": "as in the recipe", "в меню на неделю": "in the weekly menu",
  "Количество порций": "Number of servings", "Меньше порций": "Fewer servings", "Больше порций": "More servings",
  "Все рецепты ": "All recipes", "Назад": "Back", "Изменить": "Edit", "Готово": "Done", "Поделиться": "Share", "Ещё": "More", "Все поля": "All fields",
  "Редактирование.": "Editing.", "Нажми на любой текст, чтобы изменить. Фото: выдели карточку и нажми Ctrl+V.": "Click any text to change it. Photos: select a card and press Ctrl+V.",
  "📋 Сделать копию": "📋 Make a copy", "— чтобы изменить": "— to edit it", "★ Убрать из избранного недели": "★ Remove from this week's favourites", "☆ В избранное недели": "☆ Add to this week's favourites",
  "Статус": "Status", "Статус сохранён": "Status saved", "Копия рецепта": "Copy of the recipe", "Добавила:": "Added by:", "Открыть страничку": "Open profile page",
  "Сохранено": "Saved", "Сохранено ✓": "Saved ✓", "Удалено": "Deleted", "Удалить": "Delete", "Убрать": "Remove", "Отмена": "Cancel", "Сохранить": "Save", "Закрыть": "Close", "Добавить": "Add",
  "Фото блюда": "Dish photo", "Заменить": "Replace", "Заменить фото": "Replace photo", "заменить фото": "replace photo", "вставить фото": "paste photo", "Фото шага": "Step photo", "Фото ингредиентов": "Ingredients photo",
  "Убрать фото": "Remove photo", "Убрать фото шага": "Remove step photo", "Убрать фото ингредиентов": "Remove ingredients photo", "Фото сохранено": "Photo saved", "Фото сохранено ✓": "Photo saved ✓", "Фото убрано": "Photo removed",
  "Выдели карточку, фото которой заменить": "Select the card whose photo you want to replace",
  "Продукт": "Ingredient", "по-немецки": "in German", "пояснение": "note", "кол-во": "qty", "Удалить продукт": "Delete ingredient", "Удалить шаг": "Delete step", "Удалить совет": "Delete tip",
  "Выше": "Up", "Ниже": "Down", "Заголовок": "Title", "Что сделать": "What to do", "Совет": "Tip", "подпись": "caption", "Название": "Title", "порции ": "servings", "время": "time",
  "Пусто — нажми, чтобы написать": "Empty — click to write", "Откуда рецепт, что я поменяла": "Where the recipe is from, what I changed", "вставь ссылку": "paste a link", "вставь ссылку на рецепт": "paste a link to the recipe",
  "Убрать ссылку": "Remove link", "режим, уровень": "mode, rack", "Готовится целиком (пирог, киш, торт) — в меню не делится на людей": "Cooked whole (pie, quiche, cake) — not split per person in the menu",
  "История: откуда рецепт, кто рассказал, где пробовали": "Story: where the recipe is from, who told you, where you tried it",
  "Получилось! 🎉": "It worked out! 🎉", "Получилось!": "It worked out!", "Ожидание и реальность 🙈": "Expectation vs reality 🙈", "Ожидание и реальность": "Expectation vs reality",
  "🎉 Похвастаться": "🎉 Show it off", "🙈 Упс, рассказать": "🙈 Share an oops", "Пока никто не хвастался. Приготовь и покажи! 🍰": "Nobody has shown off yet. Cook it and show us! 🍰",
  "Пока без «упс». Если что-то пошло не так — покажи, разберёмся 🕵️": "No \"oops\" yet. If something went wrong, show us and we'll figure it out 🕵️",
  "Покажи, что вышло: фото и пара слов.": "Show what came out: a photo and a few words.", "Упс! Что пошло не по плану и почему. Фото провалов особенно ценятся 😅": "Oops! What didn't go to plan and why. Photos of fails are especially welcome 😅",
  "Что получилось? Что понравилось?": "What worked? What did you like?", "Что вышло не так, как ожидалось?": "What didn't turn out as expected?", "Что вышло": "What came out",
  "Опубликовать": "Post", "Публикую…": "Posting…", "Публикация удалена": "Post deleted", "Ура! 🎉": "Hooray! 🎉", "Упс записан 🙈": "Oops recorded 🙈",
  "Нравится": "Like", "Комментировать": "Comment", "Комментарий": "Comment", "Добавьте комментарий…": "Add a comment…", "Войди, чтобы ставить лайки": "Log in to like",
  "Напиши пару слов или добавь фото": "Write a few words or add a photo", "Этот отзыв уже удалён": "This post has already been deleted", "Кто-то": "Someone", "друг": "friend",
  "отметка «нравится»": "like", "отметок «нравится»": "likes", "Посмотреть все комментарии": "View all comments",
  "Ссылка на рецепт скопирована": "Recipe link copied", "Скопируй ссылку:": "Copy the link:", "Создаю копию…": "Creating a copy…", "Копия готова — можно менять": "Copy ready — you can edit it",
  "Не получилось": "Didn't work", "Не получилось сохранить": "Couldn't save", "Не получилось удалить": "Couldn't delete",
  /* меню */
  "Пн": "Mon", "Вт": "Tue", "Ср": "Wed", "Чт": "Thu", "Пт": "Fri", "Сб": "Sat", "Вс": "Sun",
  "Понедельник": "Monday", "Вторник": "Tuesday", "Среда": "Wednesday", "Четверг": "Thursday", "Пятница": "Friday", "Суббота": "Saturday", "Воскресенье": "Sunday",
  "Завтрак": "Breakfast", "Обед": "Lunch", "Ужин": "Dinner", "Нас": "We are", "Нас:": "We are:", "Сколько человек": "How many people", "человек": "people", "человека": "people",
  "Найти рецепт: название или продукт…": "Find a recipe: name or ingredient…", "Найти рецепт": "Find a recipe", "Ничего не нашлось.": "Nothing found.", "Найдено:": "Found:",
  "★ Избранное для этой недели": "★ Favourites for this week", "Хочется попробовать:": "Want to try:", "＋ своё блюдо": "＋ your own dish", "пример": "example",
  "Пусто. Нажми ☆ на карточке рецепта в списке — он появится здесь.": "Empty. Press ☆ on a recipe card in the list and it'll appear here.",
  "Перетащи блюдо в день · на телефоне: нажми на блюдо, потом на ячейку": "Drag a dish to a day · on a phone: tap the dish, then the cell",
  "Пока пусто. Перетащи блюдо в любой день.": "Empty for now. Drag a dish to any day.", "Пока пусто.": "Empty for now.",
  "Всё, что стоит в расписании, попадает в список покупок. Одно блюдо можно поставить в несколько ячеек, например котлеты на два ужина: оно готовится один раз, а продуктов берётся на все приёмы.": "Everything in the schedule goes into the shopping list. You can put one dish in several cells, e.g. patties for two dinners: it's cooked once, but you buy ingredients for every meal.",
  "Число у блюда — порции для закупки: люди × сколько раз блюдо стоит в меню. Пироги и киши — целыми формами: вторая добавится, только когда одной не хватит на всех.": "The number on a dish is servings to shop for: people × how many times the dish is in the menu. Pies and quiches count as whole dishes: a second one is added only when one isn't enough for everyone.",
  "Как это работает": "How it works", "Что купить": "What to buy", "Скопировать": "Copy", "Список скопирован": "List copied", "Выделено — нажми «Копировать»": "Selected — press \"Copy\"",
  "Одинаковые продукты сложены. Отметь то, что уже есть дома: продукт": "Identical ingredients are added up. Tick what you already have at home: the item",
  "зачеркнётся": "gets crossed out", "и не попадёт в скопированный список. Соль и перец уже зачёркнуты — сними отметку, если нужно купить.": "and won't be in the copied list. Salt and pepper are already crossed out — untick them if you need to buy them.",
  "Список появится, когда поставишь блюда в расписание.": "The list will appear when you add dishes to the schedule.", "По желанию": "Optional", "по желанию": "optional",
  "Отметь, что включить в список покупок — отмеченное добавится выше.": "Tick what to include in the shopping list — ticked items are added above.",
  "Сохранённые недели": "Saved weeks", "Сохранить эту неделю": "Save this week", "Сохрани удачное расписание, чтобы в другой раз загрузить его одним нажатием.": "Save a good schedule to load it with one click next time.",
  "Пока нет сохранённых недель.": "No saved weeks yet.", "Название, напр. «Обычная неделя»": "Name, e.g. \"Normal week\"", "Загрузить": "Load", "Да, загрузить": "Yes, load it",
  "Заменить текущую неделю?": "Replace the current week?", "Очистить неделю": "Clear the week", "Неделя очищена": "Week cleared", "Неделя сохранена": "Week saved", "Неделя от": "Week of",
  "В избранное недели": "Add to this week's favourites", "В избранном недели": "In this week's favourites", "Убрать из избранного недели": "Remove from this week's favourites",
  "Добавлено в избранное недели": "Added to this week's favourites", "Убрано из избранного": "Removed from favourites", "Убрано из расписания": "Removed from the schedule",
  "Добавлено в расписание и в базовые": "Added to the schedule and to basics", "из расписания": "from the schedule", "В расписании": "In the schedule",
  "Название, напр. Омлет": "Name, e.g. Omelette", "Напиши название": "Write a name", "Быстро добавлено из расписания.": "Quickly added from the meal plan.",
  "Не получилось сохранить план:": "Couldn't save the plan:",
  /* люди */
  "Позвать": "Invite", "Скопировать ссылку на сайт": "Copy the site link", "Ссылка на сайт скопирована — отправь друзьям": "Site link copied — send it to your friends", "Скопируй ссылку на сайт:": "Copy the site link:",
  "Чьи рецепты": "Whose recipes", "Рецепты друзей": "Friends' recipes", "Метки": "Tags", "Без статуса": "No status", "Рекомендую 👍": "Recommend 👍", "Рекомендую": "Recommend", "рекомендует:": "recommends:", "＋ статус": "＋ status", "Изменить метки": "Change tags", "Метки рецепта": "Recipe tags", "Форма аватара": "Avatar shape", "Круг": "Circle", "Яблоко": "Apple", "Груша": "Pear", "Лимон": "Lemon", "Клубника": "Strawberry", "Тыква": "Pumpkin", "🗓 На этой неделе": "🗓 This week", "Меню на неделю видят только друзья, которые вошли.": "Only friends who are logged in can see the weekly menu.",
  "Меню пока пустое.": "The menu is empty for now.", "Составить меню →": "Plan the menu →", "Открыть меню и покупки →": "Open menu & shopping →",
  "На этой неделе пока ничего не запланировано.": "Nothing planned for this week yet.", "Изменить профиль": "Edit profile", "Пока нет рецептов.": "No recipes yet.",
  "Здесь появятся рецепты, которые ты добавишь.": "The recipes you add will appear here.", "получилось:": "worked out:",
  /* вход и профиль */
  "Почта": "Email", "Пароль": "Password", "минимум 6 символов": "at least 6 characters", "Зарегистрироваться": "Sign up", "Не сейчас": "Not now", "С возвращением!": "Welcome back!",
  "Чтобы копировать рецепты, вести своё меню и писать «упсы». Регистрация бесплатная.": "To copy recipes, keep your own menu and post \"oopses\". Signing up is free.",
  "Как тебя зовут": "Your name", "Имя": "Name", "Сколько вас обычно за столом": "How many of you usually eat together", "Страна": "Country", "Валюта": "Currency",
  "Германия": "Germany", "Россия": "Russia", "Казахстан": "Kazakhstan", "Беларусь": "Belarus", "Украина": "Ukraine", "Армения": "Armenia", "Грузия": "Georgia", "Израиль": "Israel", "Другая страна": "Other country",
  "Профиль": "Profile", "Выбрать фото": "Choose photo", "Аватар": "Avatar", "Фото сохранено ✓ ": "Photo saved ✓",
  "Имя не может быть пустым.": "The name can't be empty.", "Напиши, как тебя зовут.": "Write your name.", "Готово, открываю…": "Done, opening…",
  "Неверная почта или пароль.": "Wrong email or password.", "Эта почта уже зарегистрирована — попробуй войти.": "This email is already registered — try logging in.",
  "Почта ещё не подтверждена — проверь письмо.": "Email not confirmed yet — check your inbox.", "Пароль — минимум 6 символов.": "Password must be at least 6 characters.",
  "Почти готово: проверь почту и нажми ссылку из письма, потом войди.": "Almost done: check your email, click the link, then log in.", "Что-то пошло не так.": "Something went wrong.",
  "Войди или зарегистрируйся, чтобы это сделать": "Log in or sign up to do that",
  /* форма и импорт */
  "Изменить рецепт": "Edit recipe", "Главное фото": "Main photo", "Обложка": "Cover", "Другое фото": "Another photo", "Фото": "Photo", "Фото шагов": "Step photos",
  "Время": "Time", "Порции": "Servings", "Порции:": "Servings:", "Режим и уровень": "Mode and rack", "Лёгкий рецепт": "Easy recipe", "Базовый рецепт (знаю наизусть — можно скрывать)": "Basic recipe (I know it by heart — can be hidden)",
  "Ссылка на видео": "Video link", "Ссылка на рецепт": "Recipe link", "Импорт рецепта": "Import a recipe", "Разобрать рецепт": "Parse the recipe", "Скриншоты рецепта": "Recipe screenshots", "Скриншот": "Screenshot",
  "Новый продукт": "New ingredient", "Новый шаг": "New step", "Новый совет": "New tip", "Фильтр": "Filter", "Больше": "More", "Меньше": "Fewer",
  "Ctrl+V — вставить фото": "Ctrl+V — paste photo", "Ctrl+V — заменить фото": "Ctrl+V — replace photo",
  "Нажми на фото, чтобы приблизить": "Click the photo to zoom in", "Импорт с ИИ недоступен в этом просмотре": "AI import isn't available here",
  "Для формы": "For the dish", "Для смазки": "For brushing", "Для подачи": "For serving"
};

/* фразы с числами и склеенные строки */
const UIRX = [
  [/^Посмотреть все комментарии \((\d+)\)$/, "View all $1 comments"],
  [/^Неделя «(.+)» загружена$/, "Week \"$1\" loaded"],
  [/^Страничка: (.+)$/, "Profile: $1"],
  [/^(Не получилось|Не сохранилось|Не получилось сохранить|Фото не загрузилось|Не получилось сохранить план):\s*(.*)$/, (m, a, b) => (UI[a + ":"] || UI[a] || a) + ": " + b],
  [/^(.*) \(копия\)$/, "$1 (copy)"],
  [/^Смотреть видео: (.+)$/, "Watch video: $1"],
  [/^Рецепт на (\d+) (порци[а-яё]*|кусоч[а-яё]*|шт\.?|[а-яё]+)(.*)$/i, (m, n, u, rest) => "Recipe for " + n + " " + (/^порци/.test(u) ? (n === "1" ? "serving" : "servings") : amtT(u)) + rest],
  [/^Убрать фото шага (\d+)$/, "Remove photo of step $1"], [/^Шаг (\d+) выше$/, "Move step $1 up"], [/^Шаг (\d+) ниже$/, "Move step $1 down"],
  [/^Удалить шаг (\d+)$/, "Delete step $1"], [/^Шаг (\d+)$/, "Step $1"], [/^Убрать (.+) из расписания$/, "Remove $1 from the schedule"],
  [/^Убрать (.+)$/, "Remove $1"], [/^В избранное недели: (.+)$/, "Add to this week's favourites: $1"]
];
Object.assign(UI, { "Соль": "Salt", "Перец": "Pepper", "Специи": "Spices", "Зелень": "Herbs", "Мускатный орех": "Nutmeg", "Соль, перец": "Salt, pepper", "Вода": "Water", "Сахар": "Sugar", "Яйца": "Eggs" });
UI["Не сохранилось:"] = "Not saved:"; UI["Фото не загрузилось:"] = "Photo didn't upload:"; UI["Не получилось:"] = "Didn't work:";

/* количества и единицы */
const AMT = [
  [/по вкусу/g, "to taste"], [/щепотк[аи]/g, "a pinch"], [/по желанию/g, "optional"], [/совсем немного/g, "just a little"], [/немного/g, "a little"], [/горсть/g, "a handful"],
  [/для жарки/g, "for frying"], [/для обвалки/g, "for coating"], [/для подачи/g, "for serving"], [/для верха/g, "for the top"], [/по рецепту/g, "as per recipe"],
  [/([\d½¼¾⅓⅔⅛])\s*шт\.?(?![а-яё])/gi, "$1"], [/(?<![а-яё])шт\.?(?![а-яё])/gi, "pcs"],
  [/ст\.\s?л\./g, "tbsp"], [/ч\.\s?л\./g, "tsp"],
  [/(\d|\s)кг(?![а-яё])/g, "$1kg"], [/(\d|\s)мл(?![а-яё])/g, "$1ml"], [/(\d|\s)дл(?![а-яё])/g, "$1dl"], [/(\d|\s)г(?![а-яё])/g, "$1g"], [/(\d|\s)л(?![а-яё])/g, "$1l"],
  [/(\d|\s)мин(?![а-яё])/g, "$1min"], [/(\d|\s)ч(?![а-яё])/g, "$1h"],
  [/(\d),(\d)/g, "$1.$2"], [/(?<![а-яё])до (?=\d)/g, "up to "],
  [/зубчик(а|ов)?/g, (m, e) => e ? "cloves" : "clove"], [/ломтик(а|ов)?/g, "slices"], [/кусочек/g, "piece"], [/кусочк(а|ов)/g, "pieces"], [/пакетик(а|ов)?/g, "sachet"], [/банк[аи]/g, "can"], [/рулон/g, "roll"],
  [/лист(а|ов)/g, "leaves"], [/кочанчик|кочан/g, "head"], [/активно/g, "hands-on"]
];
function amtT(s) { if (!EN || !s) return s; s = String(s); for (const [re, to] of AMT) s = s.replace(re, to); return s; }

/* перевод одной строки интерфейса (для всплывающих сообщений, prompt и т.п.) */
function trS(s) {
  if (!EN || s == null) return s;
  const str = String(s), core = str.trim();
  if (!/[а-яё]/i.test(core)) return str;
  if (UI[core] != null) return str.replace(core, UI[core]);
  const tm = core.match(/^(.*?)\s*([·:,])$/); if (tm && UI[tm[1]] != null) return str.replace(core, UI[tm[1]] + " " + tm[2]);
  for (const [re, to] of UIRX) if (re.test(core)) return str.replace(core, core.replace(re, to));
  const parts = core.split(/( · |: |, )/);
  if (parts.length > 1 && parts.every((p, i) => i % 2 || !/[а-яё]/i.test(p) || UI[p.trim()] != null || /^\d/.test(p)))
    return str.replace(core, parts.map((p, i) => i % 2 ? p : (UI[p.trim()] != null ? UI[p.trim()] : /[а-яё]/i.test(p) ? amtT(p) : p)).join(""));
  if (core.length < 40 && /^[~≈]?\s*[\d½¼¾⅓⅔⅛]/.test(core)) return str.replace(core, amtT(core));
  return str;
}

/* рецепт → английская версия (если перевод есть) */
const TXT = ["title", "story", "source", "health", "before", "done", "storage", "notes", "oven", "ovenNote", "servings", "time", "servesUnit"];
function locR(r) {
  if (!EN) return r;
  const e = r.en;
  if (!e) return { ...r, _untr: true };
  const o = { ...r };
  TXT.forEach(k => { if (e[k] != null) o[k] = e[k]; else if (r[k] && /^[~≈\d]/.test(String(r[k]))) o[k] = amtT(r[k]); });
  ["tips", "steps", "stepTitles"].forEach(k => { if (Array.isArray(e[k])) o[k] = e[k]; });
  if (Array.isArray(e.ing) && typeof normIng === "function") o.ingredients = (r.ingredients || []).map((x, k) => {
    const n = normIng(x), t = e.ing[k]; if (!t) return n;
    let name = t[0] || n.name; if (n.de) name = name.replace(/\s*\(([^()]*)\)\s*$/, "");
    return { ...n, name, amount: t[1] != null ? t[1] : n.amount, note: t[2] != null ? t[2] : n.note, group: t[3] != null && t[3] !== "" ? t[3] : (n.group ? (UI[n.group] || n.group) : "") };
  });
  if (Array.isArray(e.gallery) && r.gallery) o.gallery = r.gallery.map((g, k) => ({ ...g, caption: e.gallery[k] != null ? e.gallery[k] : g.caption }));
  return o;
}

/* перевод страницы: текст и подсказки, кроме полей, которые сейчас редактируются */
const SKIP_SEL = "script,style,textarea,[data-ed],[contenteditable],[data-nt]";
const ATTRS = ["placeholder", "title", "aria-label", "data-ph"];
function trAttrs(el) { for (const a of ATTRS) { const v = el.getAttribute(a); if (v && /[а-яё]/i.test(v)) { const t = trS(v); if (t !== v) el.setAttribute(a, t); } } }
function trText(n) { const p = n.parentElement; if (!p || p.closest(SKIP_SEL)) return; const v = n.nodeValue; if (!/[а-яё]/i.test(v)) return; const t = trS(v); if (t !== v) n.nodeValue = t; }
function trNode(n) {
  if (n.nodeType === 3) return trText(n);
  if (n.nodeType !== 1) return;
  trAttrs(n);
  const w = document.createTreeWalker(n, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
  let c; while ((c = w.nextNode())) { if (c.nodeType === 1) trAttrs(c); else trText(c); }
}
if (EN) {
  document.documentElement.lang = "en";
  const start = () => {
    document.title = UI[document.title] || document.title;
    trNode(document.body);
    new MutationObserver(ms => ms.forEach(m => { if (m.type === "characterData") trText(m.target); else if (m.type === "attributes") trAttrs(m.target); else m.addedNodes.forEach(trNode); }))
      .observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRS });
    const _t = window.toast; if (typeof _t === "function") window.toast = s => _t(trS(s));
    const _p = window.prompt; window.prompt = (a, b) => _p.call(window, trS(a), b);
    const _c = window.confirm; window.confirm = a => _c.call(window, trS(a));
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
}

/* кнопка языка */
function setLang(l) { try { localStorage.setItem("lang", l); } catch (e) {} location.reload(); }
document.addEventListener("DOMContentLoaded", () => {
  const box = document.querySelector("header.top"); if (!box || document.getElementById("langBtn")) return;
  const b = document.createElement("button"); b.type = "button"; b.id = "langBtn"; b.className = "langbtn"; b.setAttribute("data-nt", "");
  b.textContent = EN ? "RU" : "EN"; b.title = EN ? "Читать по-русски" : "Read in English"; b.setAttribute("aria-label", b.title);
  b.onclick = () => setLang(EN ? "ru" : "en");
  box.appendChild(b);
});
