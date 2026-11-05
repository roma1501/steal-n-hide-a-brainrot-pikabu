// GameData.js — данные игры «Brainrot Hide and Seek»: карты-темы, искатели, облики, усиления.
// Пути ассетов — литералами (сборщик берёт в архив только их). Числа правил — в Constants.js (блок HS_*).

/** @typedef {{ ru: string, en: string }} LocText */
/** @typedef {'common' | 'rare' | 'epic' | 'legendary' | 'mythic'} Rarity */

/** Карты по порядку прохождения: id карты в Maps.js, искатель, цвет темы (UI, конус). */
const HS_MAPS = [
    { id: 'mint', seeker: 'cacto_hipopotamo', name: { ru: 'Классика', en: 'Classic' }, color: '#3ddc5a', sky: '#8fd8ff' },
    { id: 'citrus', seeker: 'chef_crab', name: { ru: 'Закат', en: 'Sunset' }, color: '#ff8a3d', sky: '#ffb38a' },
    { id: 'block', seeker: 'glorbo', name: { ru: 'Карамель', en: 'Candy' }, color: '#ff9ed2', sky: '#ffd6f0' },
    { id: 'candy', seeker: 'gorillo', name: { ru: 'Лава', en: 'Lava' }, color: '#ff5a1f', sky: '#3a1a1a' },
    { id: 'tropic', seeker: 'rhino_toaster', name: { ru: 'Тропики', en: 'Tropical' }, color: '#2fd4c4', sky: '#7fdcff' },
    { id: 'toy', seeker: 'cavallo', name: { ru: 'Золото', en: 'Gold' }, color: '#ffd23d', sky: '#fff1c4' },
    { id: 'ice', seeker: 'cocofanto', name: { ru: 'Снег', en: 'Snow' }, color: '#9fd8ff', sky: '#d8f1ff' },
    { id: 'neon', seeker: 'girafa', name: { ru: 'Неон', en: 'Neon' }, color: '#ff3df0', sky: '#1a0f3a' },
    { id: 'space', seeker: 'nuclearo', name: { ru: 'Галактика', en: 'Galaxy' }, color: '#9a6bff', sky: '#0c0f2a' },
    { id: 'carnival', seeker: 'graipuss', name: { ru: 'Радуга', en: 'Rainbow' }, color: '#3de0ff', sky: '#b9a8ff' },
];

/**
 * Запасной искатель: в этой версии искатели — брейнроты (GameBrainrots.js, hsSeekerDef).
 * Старые модели seekers/ не грузятся; запись нужна только неизвестным id из старых сохранений.
 */
const HS_SEEKERS = [
    { id: 'tung', model: 'assets/models/brainrots/tatata_sahur.glb', icon: 'assets/ui/icons/br-tatata_sahur.webp', name: { ru: 'Та Та Та Сахур', en: 'Ta Ta Ta Sahur' }, rarity: 'rare', price: { coins: 0 }, default: true, color: '#c98a4b' },
];

/** Облики прячущегося (вкладка «Облики»). Редкие и выше — со следом/аурой (GameFX.skinAura). */
const HS_SKINS = [
    { id: 'default', model: 'assets/models/chars/skin-default.glb', icon: 'assets/ui/icons/skin-default.webp', name: { ru: 'Новичок', en: 'Rookie' }, rarity: 'common', price: { coins: 0 }, default: true },
    { id: 'neon', model: 'assets/models/chars/skin-neon.glb', icon: 'assets/ui/icons/skin-neon.webp', name: { ru: 'Неон', en: 'Neon' }, rarity: 'rare', price: { coins: 250 } },
    { id: 'skater', model: 'assets/models/chars/skin-skater.glb', icon: 'assets/ui/icons/skin-skater.webp', name: { ru: 'Скейтер', en: 'Skater' }, rarity: 'common', price: { coins: 400 } },
    { id: 'pilot', model: 'assets/models/chars/skin-pilot.glb', icon: 'assets/ui/icons/skin-pilot.webp', name: { ru: 'Пилот', en: 'Pilot' }, rarity: 'common', price: { coins: 350 } },
    { id: 'hoodie_pink', model: 'assets/models/chars/skin-hoodie_pink.glb', icon: 'assets/ui/icons/skin-hoodie_pink.webp', name: { ru: 'Розовое худи', en: 'Pink Hoodie' }, rarity: 'common', price: { coins: 300 } },
    { id: 'sport', model: 'assets/models/chars/skin-sport.glb', icon: 'assets/ui/icons/skin-sport.webp', name: { ru: 'Спортсмен', en: 'Athlete' }, rarity: 'common', price: { coins: 450 } },
    { id: 'chef', model: 'assets/models/chars/skin-chef.glb', icon: 'assets/ui/icons/skin-chef.webp', name: { ru: 'Шеф', en: 'Chef' }, rarity: 'rare', price: { coins: 600 } },
    { id: 'explorer', model: 'assets/models/chars/skin-explorer.glb', icon: 'assets/ui/icons/skin-explorer.webp', name: { ru: 'Исследователь', en: 'Explorer' }, rarity: 'rare', price: { coins: 650 } },
    { id: 'ninja', model: 'assets/models/chars/skin-ninja.glb', icon: 'assets/ui/icons/skin-ninja.webp', name: { ru: 'Ниндзя', en: 'Ninja' }, rarity: 'epic', price: { coins: 500 } },
    { id: 'cyber', model: 'assets/models/chars/skin-cyber.glb', icon: 'assets/ui/icons/skin-cyber.webp', name: { ru: 'Кибер', en: 'Cyber' }, rarity: 'epic', price: { coins: 600 } },
    { id: 'robot', model: 'assets/models/chars/skin-robot.glb', icon: 'assets/ui/icons/skin-robot.webp', name: { ru: 'Робот', en: 'Robot' }, rarity: 'rare', price: { coins: 800 } },
    { id: 'pirate', model: 'assets/models/chars/skin-pirate.glb', icon: 'assets/ui/icons/skin-pirate.webp', name: { ru: 'Пират', en: 'Pirate' }, rarity: 'epic', price: { coins: 1000 } },
    { id: 'cowboy', model: 'assets/models/chars/skin-cowboy.glb', icon: 'assets/ui/icons/skin-cowboy.webp', name: { ru: 'Ковбой', en: 'Cowboy' }, rarity: 'rare', price: { coins: 900 } },
    { id: 'zombie_fun', model: 'assets/models/chars/skin-zombie_fun.glb', icon: 'assets/ui/icons/skin-zombie_fun.webp', name: { ru: 'Зомби', en: 'Zombie' }, rarity: 'epic', price: { coins: 1200 } },
    { id: 'astro', model: 'assets/models/chars/skin-astro.glb', icon: 'assets/ui/icons/skin-astro.webp', name: { ru: 'Астронавт', en: 'Astronaut' }, rarity: 'legendary', price: { gems: 50 } },
    { id: 'knight', model: 'assets/models/chars/skin-knight.glb', icon: 'assets/ui/icons/skin-knight.webp', name: { ru: 'Рыцарь', en: 'Knight' }, rarity: 'mythic', price: { gems: 120 } },
];

/** Усиления (вкладка «Усиления»): расходники, копятся в save.power; тратятся в раунде. */
const HS_POWERUPS = [
    { id: 'dash', icon: 'assets/ui/btn-dash.webp', name: { ru: 'Рывок', en: 'Dash' }, desc: { ru: 'Резкий бросок вперёд', en: 'A quick burst forward' }, rarity: 'common', price: { coins: 150 }, pack: 3 },
    { id: 'decoy', icon: 'assets/ui/btn-decoy.webp', name: { ru: 'Обманка', en: 'Decoy' }, desc: { ru: 'Отвлекает искателя на 3 сек.', en: 'Distracts the seeker for 3 s' }, rarity: 'epic', price: { coins: 200 }, pack: 3 },
    { id: 'shield', icon: 'assets/ui/icons/power-shield.webp', name: { ru: 'Щит', en: 'Shield' }, desc: { ru: 'Спасает от одной поимки', en: 'Saves you from one catch' }, rarity: 'rare', price: { coins: 300 }, pack: 1 },
    { id: 'magnet', icon: 'assets/ui/icons/power-magnet.webp', name: { ru: 'Магнит', en: 'Magnet' }, desc: { ru: 'Монеты летят к тебе весь раунд', en: 'Coins fly to you all round' }, rarity: 'rare', price: { coins: 250 }, pack: 1 },
];

/** Цвета редкости: рамка карточки, свечение, след. */
const HS_RARITY = {
    common: { color: '#8fb6d9', ru: 'Обычный', en: 'Common' },
    rare: { color: '#3d9bff', ru: 'Редкий', en: 'Rare' },
    epic: { color: '#b24dff', ru: 'Эпик', en: 'Epic' },
    legendary: { color: '#ffb02e', ru: 'Легенда', en: 'Legendary' },
    mythic: { color: '#ff3d6e', ru: 'Миф', en: 'Mythic' },
};

/** Ники ботов (по языку): как у живых игроков, без пометки «бот». */
const HS_BOT_NAMES = {
    ru: ['Кексик228', 'ТёмаПро', 'Лисичка_07', 'НиндзяВаня', 'Мармеладка', 'Сашка2013', 'КотБатон', 'Пельмешка', 'Димон_ТОП',
        'ЗайкаЛиза', 'Барсик777', 'ТурбоКирилл', 'Ромашка_12', 'Тихоня', 'Шустрик2014', 'КапитанМакс', 'Печенька', 'Ёжик_Соня',
        'Бублик99', 'Арсений_Про', 'Малинка', 'ГромМатвей', 'Пончик_Аня', 'СуперЛёха'],
    en: ['xXShadowXx', 'PizzaKid_09', 'LilyBloom', 'NoobSlayer22', 'CoolDude2013', 'BunnyHop', 'ZoeyPlays', 'TacoMaster',
        'Sk8rBoi', 'MintyFresh', 'JaxonGG', 'Pixel_Panda', 'SneakyPete', 'Cupcake_Queen', 'TurboTyler', 'MiaMoon',
        'BlazeRunner', 'Nugget_77', 'EllaBear', 'CaptainLeo', 'Waffle_Wizard', 'LunaLight', 'DashDylan', 'SoupLord'],
};

/** @param {{ ru: string, en: string }} t */
function hsText(t) { return t ? (t[Lang.code === 'en' ? 'en' : 'ru'] || t.ru) : ''; }

/** @param {string} id */
function hsMap(id) { return HS_MAPS.find(m => m.id === id) || HS_MAPS[0]; }
/** @param {string} id */
function hsSeeker(id) { return HS_SEEKERS.find(s => s.id === id) || HS_SEEKERS[0]; }
/** Облик: из каталога магазина (там и новые, и эксклюзивы), иначе из HS_SKINS. @param {string} id */
function hsSkin(id) {
    const it = typeof HS_SHOP_ITEMS !== 'undefined' ? HS_SHOP_ITEMS.find(i => i.id === id && i.tab === 'skin') : null;
    if (it) return /** @type {any} */ (it);
    return HS_SKINS.find(s => s.id === id) || HS_SKINS[0];
}
/** Искатель для игрока или карты: модель, окраска варианта, имя. @param {string} id */
function hsSeekerDef(id) {
    // брейнроты этой версии (GameBrainrots.js) — главнее старых искателей
    const br = typeof stBrainrot === 'function' ? stBrainrot(id) : null;
    if (br) return { id, model: br.model, tint: '', name: br.name, color: ST_RARITY[br.rarity].color };
    const it = typeof HS_SHOP_ITEMS !== 'undefined' ? HS_SHOP_ITEMS.find(i => i.id === id && i.tab === 'seeker') : null;
    const base = hsSeeker((it && it.base) || id);
    return { id, model: it ? it.model : base.model, tint: it ? it.tint || '' : '', name: it ? it.name : base.name, color: base.color };
}
/** Предмет магазина по id. @param {string} id */
function hsItem(id) { return typeof HS_SHOP_ITEMS !== 'undefined' ? HS_SHOP_ITEMS.find(i => i.id === id) || null : null; }

/** Daily Gift: дни 1–6 (по нарастающей), день 7 — эксклюзивный скин (очередь HS_DAILY_EXCLUSIVE). */
const HS_DAILY_REWARDS = [
    { coins: 100 }, { coins: 150, gems: 5 }, { coins: 200, randomItems: 1, maxRarity: 'rare' },
    { coins: 300, gems: 10 }, { coins: 400, randomItems: 1, maxRarity: 'epic' }, { coins: 600, gems: 20 },
];
const HS_DAILY_EXCLUSIVE = ['daily_dragon', 'daily_king', 'daily_galaxy'];

/** Колесо фортуны: в основном валюта, реже кристаллы и предметы магазина. */
const HS_WHEEL_SECTORS = [
    { coins: 50, weight: 22 }, { coins: 10, gems: 5, weight: 12 }, { coins: 120, weight: 18 }, { randomItem: true, maxRarity: 'rare', weight: 9 },
    { coins: 250, weight: 12 }, { coins: 20, gems: 15, weight: 5 }, { coins: 500, weight: 5 }, { randomItem: true, maxRarity: 'legendary', weight: 3 },
];
