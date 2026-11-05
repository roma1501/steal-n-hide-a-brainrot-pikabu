// GameBrainrots.js — ростер брейнротов «Steal n Hide a Brainrot»: 24 персонажа, редкости, мутации.
// Числа правил (время подбора, доход, цена продажи, вес появления) — в таблицах ниже по docs/STEAL-SPEC.md.
// Пути моделей и иконок — литералы (сборщик берёт в архив только их).

/** Редкости: подбор (с), доход (монет/мин), продажа (монет), вес появления, цвет, имя. */
const ST_RARITY = {
    common: { pick: 1.5, income: 4, sell: 60, weight: 46, color: '#b8c4d0', ru: 'Обычный', en: 'Common', glow: '' },
    rare: { pick: 3, income: 10, sell: 180, weight: 26, color: '#3d9bff', ru: 'Редкий', en: 'Rare', glow: 'rare' },
    epic: { pick: 5, income: 25, sell: 500, weight: 14, color: '#b24dff', ru: 'Эпик', en: 'Epic', glow: 'epic' },
    legendary: { pick: 8, income: 60, sell: 1400, weight: 8, color: '#ffb02e', ru: 'Легенда', en: 'Legendary', glow: 'legendary' },
    mythic: { pick: 12, income: 150, sell: 4000, weight: 4, color: '#ff3d6e', ru: 'Миф', en: 'Mythic', glow: 'mythic' },
    god: { pick: 17, income: 350, sell: 10000, weight: 1.6, color: '#2ef5c8', ru: 'Бог брейнрота', en: 'Brainrot God', glow: 'mythic' },
    secret: { pick: 24, income: 900, sell: 30000, weight: 0.4, color: '#ffffff', ru: 'Секрет', en: 'Secret', glow: 'mythic' },
};
const ST_RARITY_ORDER = ['common', 'rare', 'epic', 'legendary', 'mythic', 'god', 'secret'];

/** Мутации: шанс при появлении, множители дохода и времени подбора, окраска. */
const ST_MUTATIONS = {
    gold: { chance: 0.07, income: 1.25, pick: 1.2, tint: '#ffd23d', ru: 'Золотой', en: 'Gold' },
    diamond: { chance: 0.03, income: 1.5, pick: 1.35, tint: '#9fe8ff', ru: 'Алмазный', en: 'Diamond' },
    rainbow: { chance: 0.01, income: 3, pick: 1.6, tint: '#ff7ae0', ru: 'Радужный', en: 'Rainbow' },
    galaxy: { chance: 0.005, income: 5, pick: 1.8, tint: '#5b3d9e', ru: 'Галактика', en: 'Galaxy' },
};

/** Ростер: id, имя, редкость, модель, иконка, масштаб модели на карте. */
const ST_BRAINROTS = [
    { id: 'noobini', rarity: 'common', name: { ru: 'Нубини Пиццанини', en: 'Noobini Pizzanini' }, model: 'assets/models/brainrots/noobini.glb', icon: 'assets/ui/icons/br-noobini.webp' },
    { id: 'tim_cheese', rarity: 'common', name: { ru: 'Тим Чиз', en: 'Tim Cheese' }, model: 'assets/models/brainrots/tim_cheese.glb', icon: 'assets/ui/icons/br-tim_cheese.webp' },
    { id: 'pipi_kiwi', rarity: 'common', name: { ru: 'Пипи Киви', en: 'Pipi Kiwi' }, model: 'assets/models/brainrots/pipi_kiwi.glb', icon: 'assets/ui/icons/br-pipi_kiwi.webp' },
    { id: 'svinina', rarity: 'common', name: { ru: 'Свинина Бомбардино', en: 'Svinina Bombardino' }, model: 'assets/models/brainrots/svinina.glb', icon: 'assets/ui/icons/br-svinina.webp' },
    { id: 'gangster_footera', rarity: 'rare', name: { ru: 'Гангстер Футера', en: 'Gangster Footera' }, model: 'assets/models/brainrots/gangster_footera.glb', icon: 'assets/ui/icons/br-gangster_footera.webp' },
    { id: 'bandito_bobritto', rarity: 'rare', name: { ru: 'Бандито Бобритто', en: 'Bandito Bobritto' }, model: 'assets/models/brainrots/bandito_bobritto.glb', icon: 'assets/ui/icons/br-bandito_bobritto.webp' },
    { id: 'cacto_hipopotamo', rarity: 'rare', name: { ru: 'Както Гиппопотамо', en: 'Cacto Hipopotamo' }, model: 'assets/models/brainrots/cacto_hipopotamo.glb', icon: 'assets/ui/icons/br-cacto_hipopotamo.webp' },
    { id: 'tatata_sahur', rarity: 'rare', name: { ru: 'Та Та Та Сахур', en: 'Ta Ta Ta Sahur' }, model: 'assets/models/brainrots/tatata_sahur.glb', icon: 'assets/ui/icons/br-tatata_sahur.webp' },
    { id: 'trulimero', rarity: 'epic', name: { ru: 'Трулимеро Труличина', en: 'Trulimero Trulicina' }, model: 'assets/models/brainrots/trulimero.glb', icon: 'assets/ui/icons/br-trulimero.webp' },
    { id: 'bananita', rarity: 'epic', name: { ru: 'Бананита Дельфинита', en: 'Bananita Dolphinita' }, model: 'assets/models/brainrots/bananita.glb', icon: 'assets/ui/icons/br-bananita.webp' },
    { id: 'salamino', rarity: 'epic', name: { ru: 'Саламино Пингвино', en: 'Salamino Penguino' }, model: 'assets/models/brainrots/salamino.glb', icon: 'assets/ui/icons/br-salamino.webp' },
    { id: 'avocadini', rarity: 'epic', name: { ru: 'Авокадини Гуффо', en: 'Avocadini Guffo' }, model: 'assets/models/brainrots/avocadini.glb', icon: 'assets/ui/icons/br-avocadini.webp' },
    { id: 'chef_crab', rarity: 'legendary', name: { ru: 'Шеф Крабракадабра', en: 'Chef Crabracadabra' }, model: 'assets/models/brainrots/chef_crab.glb', icon: 'assets/ui/icons/br-chef_crab.webp' },
    { id: 'glorbo', rarity: 'legendary', name: { ru: 'Глорбо Фруттодрилло', en: 'Glorbo Fruttodrillo' }, model: 'assets/models/brainrots/glorbo.glb', icon: 'assets/ui/icons/br-glorbo.webp' },
    { id: 'blueberrinni', rarity: 'legendary', name: { ru: 'Блюберинни Октопусини', en: 'Blueberrinni Octopusini' }, model: 'assets/models/brainrots/blueberrinni.glb', icon: 'assets/ui/icons/br-blueberrinni.webp' },
    { id: 'strawberelli', rarity: 'legendary', name: { ru: 'Строберелли Фламингелли', en: 'Strawberelli Flamingelli' }, model: 'assets/models/brainrots/strawberelli.glb', icon: 'assets/ui/icons/br-strawberelli.webp' },
    { id: 'rhino_toaster', rarity: 'mythic', name: { ru: 'Рино Тостерино', en: 'Rhino Toasterino' }, model: 'assets/models/brainrots/rhino_toaster.glb', icon: 'assets/ui/icons/br-rhino_toaster.webp' },
    { id: 'cavallo', rarity: 'mythic', name: { ru: 'Кавалло Виртуозо', en: 'Cavallo Virtuoso' }, model: 'assets/models/brainrots/cavallo.glb', icon: 'assets/ui/icons/br-cavallo.webp' },
    { id: 'gorillo', rarity: 'mythic', name: { ru: 'Горилло Арбузодрилло', en: 'Gorillo Watermelondrillo' }, model: 'assets/models/brainrots/gorillo.glb', icon: 'assets/ui/icons/br-gorillo.webp' },
    { id: 'cocofanto', rarity: 'god', name: { ru: 'Кокофанто Элефанто', en: 'Cocofanto Elefanto' }, model: 'assets/models/brainrots/cocofanto.glb', icon: 'assets/ui/icons/br-cocofanto.webp' },
    { id: 'girafa', rarity: 'god', name: { ru: 'Жирафа Селестре', en: 'Girafa Celestre' }, model: 'assets/models/brainrots/girafa.glb', icon: 'assets/ui/icons/br-girafa.webp' },
    { id: 'gattatino', rarity: 'god', name: { ru: 'Гаттатино Неонино', en: 'Gattatino Neonino' }, model: 'assets/models/brainrots/gattatino.glb', icon: 'assets/ui/icons/br-gattatino.webp' },
    { id: 'graipuss', rarity: 'secret', name: { ru: 'Граипусс Медусси', en: 'Graipuss Medussi' }, model: 'assets/models/brainrots/graipuss.glb', icon: 'assets/ui/icons/br-graipuss.webp' },
    { id: 'nuclearo', rarity: 'secret', name: { ru: 'Нуклеаро Динозавро', en: 'Nuclearo Dinossauro' }, model: 'assets/models/brainrots/nuclearo.glb', icon: 'assets/ui/icons/br-nuclearo.webp' },
];

/** @param {string} id */
function stBrainrot(id) { return ST_BRAINROTS.find(b => b.id === id) || null; }

/** Доход брейнрота (монет/мин) с учётом мутации. @param {string} id @param {string} [mut] */
function stIncome(id, mut) {
    const b = stBrainrot(id);
    if (!b) return 0;
    const m = mut && ST_MUTATIONS[mut] ? ST_MUTATIONS[mut].income : 1;
    return Math.round(ST_RARITY[b.rarity].income * m * 10) / 10;
}

/** Цена продажи с учётом мутации. @param {string} id @param {string} [mut] */
function stSellPrice(id, mut) {
    const b = stBrainrot(id);
    if (!b) return 0;
    const m = mut && ST_MUTATIONS[mut] ? ST_MUTATIONS[mut].income : 1;
    return Math.round(ST_RARITY[b.rarity].sell * m);
}

/** Время подбора (с) с учётом мутации. @param {string} id @param {string} [mut] */
function stPickTime(id, mut) {
    const b = stBrainrot(id);
    if (!b) return 2;
    const m = mut && ST_MUTATIONS[mut] ? ST_MUTATIONS[mut].pick : 1;
    return ST_RARITY[b.rarity].pick * m;
}

/**
 * Случайный брейнрот для появления на карте: редкость по весам (на дальних картах редкие чуть чаще),
 * затем персонаж этой редкости и мутация. @param {number} mapIndex @param {() => number} [rng]
 */
function stRollBrainrot(mapIndex, rng) {
    const r = rng || Math.random;
    const boost = 1 + (mapIndex || 0) * 0.12;
    let total = 0;
    const w = ST_RARITY_ORDER.map((k, i) => { const v = ST_RARITY[k].weight * (i >= 2 ? boost : 1); total += v; return v; });
    let x = r() * total, rarity = 'common';
    for (let i = 0; i < w.length; i++) { x -= w[i]; if (x <= 0) { rarity = ST_RARITY_ORDER[i]; break; } }
    const pool = ST_BRAINROTS.filter(b => b.rarity === rarity);
    const b = pool[Math.floor(r() * pool.length)] || ST_BRAINROTS[0];
    let mut = '';
    const m = r();
    let acc = 0;
    for (const k of ['galaxy', 'rainbow', 'diamond', 'gold']) { acc += ST_MUTATIONS[k].chance; if (m < acc) { mut = k; break; } }
    return { id: b.id, rarity, mut };
}
