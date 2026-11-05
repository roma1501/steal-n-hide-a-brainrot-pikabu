// GameCosmetics.js — косметика магазина «Brainrot Hide and Seek»: следы, ауры, эффекты победы, окраска искателей.
// Контракт (docs/GAME-SPEC.md, раздел «Монетизация»). Всё безопасно до init и без app.fx (тихо ничего не делает).
//
//   GameCosmetics.trail(id, target)       след за героем (trail_*) -> { stop() }. target: () => ({ x, y, h, speed }) —
//                                          карта px, speed px/с: на бегу (speed > 60) частицы идут густо, стоя — редкие.
//                                          Одна система на слой на весь след, позицию и частоту ведёт follow ParticleFX.
//   GameCosmetics.aura(id, view, getPos)  «аура» под ногами (aura_*) -> { update(dt), stop() }: светящийся знак на земле
//                                          (меши в слое OVERLAY, текстура рисуется на canvas) + у редких частицы. getPos: () => ({ x, y, h }).
//   GameCosmetics.emote(id, pos)          эффект победы (win_*), разовый 1.5–3 с вокруг героя pos { x, y, h } -> { stop() }.
//   GameCosmetics.tint(root, hex)         окраска модели искателя-варианта: клоны материалов + свечение + искры;
//                                          handle { stop() } — и в root.metadata.cosmeticTint.
//
// Формы частиц — assets/fx/*.webp: Kenney Particle Pack (CC0) и силуэты, нарисованные tools/shop/fx_sprites.py
// (пламя, сердце, нота, лист, снежинка, банан, пиксель, монета, конфета, призрак, цветок, лепесток, пузырь, корона, шар, диско).
// Размеры — px мира (рост героя ~150). Слой с opt: true пропускается на телефонах и на «низком» качестве.

const CX_TEX = {
    glint: 'assets/fx/glint.webp', star: 'assets/fx/star.webp', ring: 'assets/fx/ring.webp', puff: 'assets/fx/puff.webp',
    debris: 'assets/fx/debris.webp', streak: 'assets/fx/streak.webp', flash: 'assets/fx/flash.webp', dot: 'assets/fx/dot.webp',
    rune: 'assets/fx/rune.webp', halo: 'assets/fx/halo.webp', confetti: 'assets/fx/confetti.webp',
    heart: 'assets/fx/heart.webp', note: 'assets/fx/note.webp', leaf: 'assets/fx/leaf.webp', snow: 'assets/fx/snow.webp',
    banana: 'assets/fx/banana.webp', pixel: 'assets/fx/pixel.webp', coin: 'assets/fx/coin.webp', candy: 'assets/fx/candy.webp',
    ghost: 'assets/fx/ghost.webp', flower: 'assets/fx/flower.webp', petal: 'assets/fx/petal.webp', bubble: 'assets/fx/bubble.webp',
    crown: 'assets/fx/crown.webp', balloon: 'assets/fx/balloon.webp', disco: 'assets/fx/disco.webp',
    flame: 'assets/fx/flame.webp', bolt: 'assets/fx/bolt.webp', burst: 'assets/fx/burst.webp', swirl: 'assets/fx/swirl.webp',
};

const CX_SND = {
    coin: ['assets/sounds/coin-1.ogg', 'assets/sounds/coin-2.ogg', 'assets/sounds/coin-3.ogg'],
    whoosh: ['assets/sounds/whoosh-1.ogg', 'assets/sounds/whoosh-2.ogg', 'assets/sounds/whoosh-3.ogg'],
    hit: ['assets/sounds/hit-1.ogg', 'assets/sounds/hit-2.ogg'],
    bonk: ['assets/sounds/bonk.ogg'],
    shield: ['assets/sounds/shield.ogg'],
    ghost: ['assets/sounds/orb-ghost.ogg'],
    dash: ['assets/sounds/orb-dash.ogg'],
    decoy: ['assets/sounds/decoy-1.ogg'],
    equip: ['assets/sounds/equip.ogg'],
    buyOk: ['assets/sounds/buy-ok.ogg'],
    tick: ['assets/sounds/tick.ogg'],
};

// Светлая земля съедает аддитивное смешивание: искры-лучи и звёзды по умолчанию рисуются обычным (add: true — свечением).
const CX_STD_TEX = new Set(['glint', 'star', 'swirl', 'bolt', 'burst']);
const CX_RAINBOW = [[0, '#ff4d6d', 0.9], [0.2, '#ffa94d', 1], [0.4, '#ffe14d', 1], [0.6, '#4dff88', 0.9], [0.8, '#4dc9ff', 0.7], [1, '#b06bff', 0]];
const CX_PARTY = ['#ff4d6d', '#ffd23d', '#4dd8ff', '#7dff7a', '#b06bff'];
const CX_NOOP = { stop() {}, update(dt) {} };

// --- Короткие помощники для описаний слоёв -----------------------------------------------------

/** Эмиттер-коробка: полуширина w, высота y0..y1, полуглубина d. */
const cxBox = (w, y0, y1, d) => [[-w, y0, -(d == null ? w : d)], [w, y1, d == null ? w : d]];
/** Конус направлений. */
const cxDir = (x1, y1, z1, x2, y2, z2) => [[x1, y1, z1], [x2, y2, z2]];
const CX_UP = cxDir(-0.45, 0.7, -0.45, 0.45, 1.4, 0.45);
const CX_SPRAY = cxDir(-1, 0.25, -1, 1, 1.3, 1);
/** Ёмкость слоя по скорости эмиссии (ParticleFX сам режет по бюджету). */
const cxCap = (L) => L.cap || (L.burst != null ? Math.ceil(L.burst) + 2 : Math.ceil((L.rate == null ? 60 : L.rate) * (L.life ? L.life[1] : 1) * 1.25) + 2);
/** Кольцо-волна на земле. */
const cxWave = (c, to, life, delay, a) => ({ tex: 'ring', flat: true, burst: 1, life: [life, life], size: [24, 24], speed: [0, 0], delay: delay || 0,
    at: [0, 4, 0], sg: [[0, 0.3], [1, to / 24]], cg: [[0, c, a == null ? 0.95 : a], [1, c, 0]] });
/** Большая вспышка-«солнце». */
const cxFlash = (c, size, life, delay, at) => ({ tex: 'flash', burst: 1, life: [life, life], size: [size, size], speed: [0, 0], delay: delay || 0, at: at || [0, 70, 0],
    c, a: 0.95, sg: [[0, 0.3], [0.25, 1.1], [1, 0]] });

// =================================================================================================
//   СЛЕДЫ. Слой: tex, rate (частиц/с на полном беге), life, size, speed, dir, grav, c/c2, cg, sg, spin, box, dy (над ногами),
//   side (боковое смещение от курса, px), std (обычное смешивание), fade [вход, спад] — плавная прозрачность при случайном цвете c..c2.
// =================================================================================================

const CX_TRAIL_K = 1.2;       // общий множитель размера частиц следа: на камере игры мелочь не читается
const CX_FEET = cxBox(10, 0, 4);

/** @type {Record<string, any[]>} */
const CX_TRAILS = {
    // --- common
    trail_dust: [
        { tex: 'puff', std: true, rate: 30, life: [0.5, 0.9], size: [26, 42], speed: [10, 34], dir: cxDir(-0.8, 0.25, -0.8, 0.8, 1, 0.8), c: '#d8c7a2', c2: '#bfae8c', a: 0.62, fade: [0.1, 0.35],
            sg: [[0, 0.5], [1, 1.7]], spin: [-1, 1], box: CX_FEET, dy: 6 },
        { tex: 'debris', std: true, rate: 9, life: [0.4, 0.7], size: [10, 16], speed: [40, 110], grav: [0, -420, 0], dir: cxDir(-1, 0.5, -1, 1, 1.5, 1), c: '#b49a74', c2: '#e0d0ac', spin: [-8, 8], box: CX_FEET, dy: 8, opt: true },
    ],
    trail_sparks: [
        { tex: 'glint', std: true, rate: 38, life: [0.3, 0.55], size: [16, 26], speed: [50, 140], grav: [0, -380, 0], dir: CX_SPRAY, c: '#ffb02e', c2: '#fff2a0', sg: [[0, 0.6], [0.3, 1], [1, 0]], spin: [-6, 6], box: CX_FEET, dy: 10 },
        { tex: 'dot', rate: 16, life: [0.25, 0.4], size: [22, 34], speed: [0, 10], c: '#ff8a1f', a: 0.4, sg: [[0, 0.6], [1, 0.1]], box: CX_FEET, dy: 12, opt: true },
    ],
    trail_bubbles: [
        { tex: 'bubble', rate: 11, life: [0.9, 1.5], size: [16, 32], speed: [8, 26], grav: [0, 40, 0], dir: cxDir(-0.6, 0.4, -0.6, 0.6, 1, 0.6), c: '#bfefff', c2: '#ffd6f5', a: 0.9,
            sg: [[0, 0.3], [0.15, 1], [1, 1.12]], box: cxBox(14, 0, 8), dy: 10 },
        { tex: 'glint', rate: 8, life: [0.4, 0.7], size: [8, 14], speed: [10, 30], c: '#ffffff', sg: [[0, 0.5], [0.3, 1], [1, 0]], box: CX_FEET, dy: 14, opt: true },
    ],
    trail_leaves: [
        { tex: 'leaf', std: true, rate: 12, life: [0.9, 1.5], size: [18, 28], speed: [20, 60], grav: [0, -70, 0], dir: cxDir(-1, 0.4, -1, 1, 1.2, 1), c: '#58b83a', c2: '#e3a02c', fade: [0.08, 0.72],
            spin: [-5, 5], initRot: [0, 6.28], box: cxBox(12, 0, 6), dy: 10 },
        { tex: 'leaf', std: true, rate: 5, life: [0.9, 1.4], size: [14, 22], speed: [20, 60], grav: [0, -60, 0], dir: cxDir(-1, 0.4, -1, 1, 1.2, 1), c: '#9be45f', c2: '#d6c63a', fade: [0.08, 0.72],
            spin: [-6, 6], initRot: [0, 6.28], box: cxBox(12, 0, 6), dy: 10, opt: true },
    ],
    trail_pixels: [
        { tex: 'pixel', std: true, rate: 12, life: [0.5, 0.9], size: [9, 15], speed: [30, 90], grav: [0, -300, 0], dir: cxDir(-1, 0.4, -1, 1, 1.3, 1), c: '#4dff7a', c2: '#2fd0ff', fade: [0.05, 0.6], box: CX_FEET, dy: 10 },
        { tex: 'pixel', std: true, rate: 12, life: [0.5, 0.9], size: [9, 15], speed: [30, 90], grav: [0, -300, 0], dir: cxDir(-1, 0.4, -1, 1, 1.3, 1), c: '#ff4df0', c2: '#ffe14d', fade: [0.05, 0.6], box: CX_FEET, dy: 10 },
    ],
    trail_smoke: [
        { tex: 'puff', std: true, rate: 22, life: [0.7, 1.1], size: [28, 46], speed: [8, 26], dir: cxDir(-0.5, 0.3, -0.5, 0.5, 1, 0.5), a: 0.7, spin: [-1, 1], box: CX_FEET, dy: 10,
            cg: [[0, '#ff5fd2', 0], [0.15, '#ff5fd2', 0.7], [0.5, '#a96bff', 0.55], [1, '#4dc9ff', 0]], sg: [[0, 0.5], [1, 1.9]] },
        { tex: 'puff', std: true, rate: 12, life: [0.7, 1.1], size: [24, 40], speed: [8, 26], dir: cxDir(-0.5, 0.3, -0.5, 0.5, 1, 0.5), a: 0.7, spin: [-1, 1], box: CX_FEET, dy: 12,
            cg: [[0, '#ffe14d', 0], [0.15, '#ffa94d', 0.65], [0.5, '#ff6a8a', 0.5], [1, '#8a6bff', 0]], sg: [[0, 0.5], [1, 1.8]], opt: true },
    ],
    // --- rare
    trail_hearts: [
        { tex: 'heart', std: true, rate: 8, life: [1, 1.6], size: [22, 34], speed: [20, 50], grav: [0, 35, 0], dir: cxDir(-0.5, 0.6, -0.5, 0.5, 1.2, 0.5), c: '#ff4f8b', c2: '#ff9ac0', fade: [0.15, 0.65],
            sg: [[0, 0.2], [0.2, 1.15], [0.35, 1], [1, 0.75]], spin: [-0.8, 0.8], box: cxBox(12, 0, 6), dy: 18 },
        { tex: 'glint', rate: 18, life: [0.4, 0.7], size: [9, 16], speed: [10, 40], c: '#ff9ac0', c2: '#ffffff', sg: [[0, 0.5], [0.3, 1], [1, 0]], box: cxBox(16, 0, 10), dy: 14, opt: true },
    ],
    trail_stars: [
        { tex: 'star', std: true, rate: 9, life: [0.7, 1.1], size: [20, 30], speed: [20, 70], grav: [0, -60, 0], dir: CX_UP, c: '#ffd23d', c2: '#fff3a0', spin: [-4, 4], sg: [[0, 0.3], [0.25, 1], [0.7, 1], [1, 0]], box: cxBox(12, 0, 6), dy: 14 },
        { tex: 'glint', std: true, rate: 16, life: [0.4, 0.7], size: [10, 18], speed: [20, 60], c: '#ffffff', c2: '#ffe27a', sg: [[0, 0.5], [0.3, 1], [1, 0]], spin: [-5, 5], box: cxBox(16, 0, 10), dy: 14, opt: true },
    ],
    trail_notes: [
        { tex: 'note', std: true, rate: 3.2, life: [1.2, 1.8], size: [24, 34], speed: [20, 50], grav: [0, 28, 0], dir: cxDir(-0.6, 0.6, -0.6, 0.6, 1.2, 0.6), c: '#5fd8ff', c2: '#4d8dff', fade: [0.12, 0.7],
            spin: [-1.4, 1.4], sg: [[0, 0.3], [0.2, 1.1], [1, 0.9]], box: cxBox(12, 0, 6), dy: 20 },
        { tex: 'note', std: true, rate: 3.2, life: [1.2, 1.8], size: [22, 32], speed: [20, 50], grav: [0, 28, 0], dir: cxDir(-0.6, 0.6, -0.6, 0.6, 1.2, 0.6), c: '#ff6ad5', c2: '#ffb03d', fade: [0.12, 0.7],
            spin: [-1.4, 1.4], sg: [[0, 0.3], [0.2, 1.1], [1, 0.9]], box: cxBox(12, 0, 6), dy: 20 },
        { tex: 'glint', rate: 12, life: [0.4, 0.7], size: [8, 14], speed: [10, 40], c: '#ffffff', c2: '#bfe8ff', sg: [[0, 0.5], [0.3, 1], [1, 0]], box: cxBox(16, 0, 10), dy: 16, opt: true },
    ],
    trail_snow: [
        { tex: 'snow', std: true, rate: 15, life: [1, 1.6], size: [14, 24], speed: [10, 40], grav: [0, -34, 0], dir: cxDir(-1, 0.3, -1, 1, 1, 1), c: '#f2fbff', c2: '#bfe3ff', fade: [0.1, 0.65],
            spin: [-3, 3], initRot: [0, 6.28], box: cxBox(14, 0, 6), dy: 18 },
        { tex: 'dot', rate: 10, life: [0.6, 1], size: [26, 42], speed: [4, 14], c: '#9fd8ff', a: 0.3, sg: [[0, 0.4], [0.3, 1], [1, 0.5]], box: CX_FEET, dy: 10, opt: true },
    ],
    trail_candy: [
        { tex: 'candy', std: true, rate: 4.5, life: [1.1, 1.6], size: [22, 30], speed: [30, 80], grav: [0, -130, 0], dir: CX_UP, c: '#ff5fa8', c2: '#4dd8ff', fade: [0.08, 0.7], spin: [-5, 5], box: cxBox(12, 0, 6), dy: 14 },
        { tex: 'candy', std: true, rate: 4.5, life: [1.1, 1.6], size: [20, 28], speed: [30, 80], grav: [0, -130, 0], dir: CX_UP, c: '#ffe14d', c2: '#b06bff', fade: [0.08, 0.7], spin: [-5, 5], box: cxBox(12, 0, 6), dy: 14 },
        { tex: 'glint', rate: 12, life: [0.4, 0.7], size: [9, 15], speed: [20, 60], c: '#ffffff', c2: '#ffd6f5', sg: [[0, 0.5], [0.3, 1], [1, 0]], box: cxBox(16, 0, 10), dy: 14, opt: true },
    ],
    trail_confetti: [
        { tex: 'confetti', std: true, rate: 10, life: [0.9, 1.4], size: [9, 15], speed: [60, 160], grav: [0, -300, 0], dir: CX_SPRAY, c: '#ff4d6d', c2: '#ffd23d', fade: [0.05, 0.7], spin: [-9, 9], initRot: [0, 6.28], box: CX_FEET, dy: 12 },
        { tex: 'confetti', std: true, rate: 10, life: [0.9, 1.4], size: [9, 15], speed: [60, 160], grav: [0, -300, 0], dir: CX_SPRAY, c: '#4dd8ff', c2: '#7dff7a', fade: [0.05, 0.7], spin: [-9, 9], initRot: [0, 6.28], box: CX_FEET, dy: 12 },
        { tex: 'confetti', std: true, rate: 8, life: [0.9, 1.4], size: [9, 15], speed: [60, 160], grav: [0, -300, 0], dir: CX_SPRAY, c: '#b06bff', c2: '#ff8ad8', fade: [0.05, 0.7], spin: [-9, 9], initRot: [0, 6.28], box: CX_FEET, dy: 12, opt: true },
    ],
    trail_flowers: [
        { tex: 'flower', std: true, rate: 4.5, life: [1.1, 1.6], size: [22, 32], speed: [14, 40], grav: [0, -50, 0], dir: CX_UP, c: '#ff8ac6', c2: '#ffd1e6', fade: [0.1, 0.7], spin: [-2.5, 2.5], initRot: [0, 6.28], box: cxBox(12, 0, 6), dy: 12 },
        { tex: 'flower', std: true, rate: 3.5, life: [1.1, 1.6], size: [18, 26], speed: [14, 40], grav: [0, -50, 0], dir: CX_UP, c: '#ffe14d', c2: '#ffffff', fade: [0.1, 0.7], spin: [-2.5, 2.5], initRot: [0, 6.28], box: cxBox(12, 0, 6), dy: 12 },
        { tex: 'petal', std: true, rate: 8, life: [1, 1.5], size: [12, 20], speed: [14, 40], grav: [0, -45, 0], dir: CX_SPRAY, c: '#ff9ac6', c2: '#ffffff', fade: [0.1, 0.7], spin: [-5, 5], initRot: [0, 6.28], box: cxBox(14, 0, 6), dy: 14, opt: true },
    ],
    // --- epic
    trail_fire: [
        { tex: 'flame', std: true, rate: 38, life: [0.4, 0.75], size: [38, 60], speed: [10, 40], dir: cxDir(-0.3, 0.8, -0.3, 0.3, 1.6, 0.3), box: cxBox(12, 0, 4), dy: 14,
            cg: [[0, '#fff0a0', 0], [0.12, '#ffd23d', 0.95], [0.45, '#ff7a1f', 0.8], [0.8, '#e02a10', 0.35], [1, '#400800', 0]], sg: [[0, 0.5], [0.3, 1], [1, 0.3]], initRot: [-0.3, 0.3] },
        { tex: 'glint', std: true, rate: 14, life: [0.5, 0.9], size: [8, 14], speed: [40, 110], grav: [0, 40, 0], dir: CX_UP, c: '#ffb02e', c2: '#fff0a0', sg: [[0, 0.7], [0.3, 1], [1, 0]], box: cxBox(14, 0, 6), dy: 14 },
        { tex: 'puff', std: true, rate: 8, life: [0.8, 1.2], size: [30, 50], speed: [14, 34], dir: cxDir(-0.3, 0.8, -0.3, 0.3, 1.4, 0.3), c: '#3b2a22', a: 0.4, fade: [0.15, 0.4], sg: [[0, 0.5], [1, 1.8]], box: cxBox(10, 0, 4), dy: 34, opt: true },
    ],
    trail_ice: [
        { tex: 'puff', std: true, rate: 14, life: [0.6, 1], size: [30, 50], speed: [8, 24], dir: cxDir(-0.6, 0.2, -0.6, 0.6, 0.8, 0.6), c: '#cfeeff', c2: '#a8dcff', a: 0.4, fade: [0.12, 0.35], sg: [[0, 0.5], [1, 1.6]], box: CX_FEET, dy: 8 },
        { tex: 'snow', std: true, rate: 9, life: [0.9, 1.4], size: [18, 28], speed: [20, 60], grav: [0, -50, 0], dir: CX_SPRAY, c: '#9fdcff', c2: '#e8fbff', fade: [0.08, 0.7], spin: [-3, 3], initRot: [0, 6.28], box: cxBox(12, 0, 6), dy: 12 },
        { tex: 'glint', std: true, rate: 24, life: [0.4, 0.8], size: [10, 20], speed: [20, 80], c: '#7fe4ff', c2: '#ffffff', sg: [[0, 0.5], [0.3, 1], [1, 0]], spin: [-4, 4], dir: CX_SPRAY, box: cxBox(14, 0, 8), dy: 12 },
    ],
    trail_coins: [
        { tex: 'coin', std: true, rate: 6, life: [1, 1.4], size: [22, 30], speed: [90, 160], grav: [0, -430, 0], dir: cxDir(-0.4, 0.9, -0.4, 0.4, 1.3, 0.4), c: '#ffd23d', c2: '#ffe98a', fade: [0.05, 0.75], spin: [-8, 8], box: cxBox(10, 0, 4), dy: 14 },
        { tex: 'glint', std: true, rate: 16, life: [0.4, 0.8], size: [10, 18], speed: [20, 70], c: '#ffe27a', c2: '#ffffff', sg: [[0, 0.5], [0.3, 1], [1, 0]], spin: [-4, 4], dir: CX_SPRAY, box: cxBox(14, 0, 8), dy: 14, opt: true },
    ],
    trail_ghost: [
        { tex: 'ghost', std: true, rate: 3.2, life: [1.2, 1.8], size: [30, 42], speed: [14, 30], grav: [0, 25, 0], dir: cxDir(-0.5, 0.6, -0.5, 0.5, 1.1, 0.5), c: '#e8f0ff', c2: '#bfe9ff', a: 0.72, fade: [0.2, 0.55],
            spin: [-0.6, 0.6], sg: [[0, 0.4], [0.3, 1], [1, 1.1]], box: cxBox(10, 0, 4), dy: 22 },
        { tex: 'puff', rate: 12, life: [0.8, 1.2], size: [30, 52], speed: [10, 26], dir: cxDir(-0.5, 0.3, -0.5, 0.5, 1, 0.5), c: '#7fffd4', c2: '#b8f0ff', a: 0.28, fade: [0.15, 0.4], sg: [[0, 0.5], [1, 1.5]], box: CX_FEET, dy: 12 },
        { tex: 'glint', std: true, rate: 8, life: [0.5, 0.9], size: [9, 16], speed: [10, 40], grav: [0, 40, 0], c: '#9bffd8', c2: '#ffffff', sg: [[0, 0.5], [0.3, 1], [1, 0]], box: cxBox(14, 0, 8), dy: 20, opt: true },
    ],
    trail_magic: [
        { tex: 'swirl', std: true, rate: 5, life: [0.5, 0.8], size: [40, 60], speed: [0, 10], c: '#d68bff', c2: '#7d5bff', a: 0.9, spin: [3, 6], sg: [[0, 0.4], [0.3, 1], [1, 1.4]], box: CX_FEET, dy: 16 },
        { tex: 'glint', std: true, rate: 28, life: [0.5, 0.9], size: [10, 20], speed: [20, 70], grav: [0, 30, 0], dir: CX_SPRAY, c: '#f0b0ff', c2: '#8fa8ff', sg: [[0, 0.5], [0.3, 1], [1, 0]], spin: [-5, 5], box: cxBox(14, 0, 8), dy: 14 },
        { tex: 'star', std: true, rate: 7, life: [0.7, 1.1], size: [16, 24], speed: [14, 40], grav: [0, 45, 0], dir: CX_UP, c: '#ff8ae8', c2: '#c8a0ff', spin: [-3, 3], sg: [[0, 0.3], [0.3, 1], [1, 0]], box: cxBox(12, 0, 6), dy: 18, opt: true },
        { tex: 'dot', rate: 12, life: [0.4, 0.7], size: [30, 48], speed: [0, 10], c: '#8a5bff', a: 0.35, sg: [[0, 0.5], [0.3, 1], [1, 0.4]], box: CX_FEET, dy: 14, opt: true },
    ],
    trail_bananas: [
        { tex: 'banana', std: true, rate: 5, life: [1, 1.4], size: [26, 36], speed: [100, 170], grav: [0, -450, 0], dir: cxDir(-0.4, 0.9, -0.4, 0.4, 1.3, 0.4), c: '#ffe135', c2: '#ffd000', fade: [0.05, 0.75],
            spin: [-8, 8], initRot: [0, 6.28], box: cxBox(10, 0, 4), dy: 14 },
        { tex: 'glint', std: true, rate: 14, life: [0.4, 0.7], size: [10, 18], speed: [20, 70], c: '#fff3a0', c2: '#ffffff', sg: [[0, 0.5], [0.3, 1], [1, 0]], spin: [-4, 4], dir: CX_SPRAY, box: cxBox(14, 0, 8), dy: 14, opt: true },
        { tex: 'puff', std: true, rate: 10, life: [0.4, 0.7], size: [20, 34], speed: [10, 30], c: '#fff0b0', a: 0.4, fade: [0.1, 0.35], sg: [[0, 0.5], [1, 1.5]], box: CX_FEET, dy: 6, opt: true },
    ],
    // --- legendary
    trail_rainbow: [
        { tex: 'dot', std: true, rate: 72, life: [0.6, 0.9], size: [46, 54], speed: [0, 6], c: '#ff3d5e', c2: '#ff9a3d', a: 0.9, fade: [0.12, 0.55], side: -26, box: cxBox(3, 0, 2), dy: 8 },
        { tex: 'dot', std: true, rate: 72, life: [0.6, 0.9], size: [46, 54], speed: [0, 6], c: '#ffe93d', c2: '#5dff7a', a: 0.9, fade: [0.12, 0.55], side: 0, box: cxBox(3, 0, 2), dy: 8 },
        { tex: 'dot', std: true, rate: 72, life: [0.6, 0.9], size: [46, 54], speed: [0, 6], c: '#3dc8ff', c2: '#b06bff', a: 0.9, fade: [0.12, 0.55], side: 26, box: cxBox(3, 0, 2), dy: 8 },
        { tex: 'glint', rate: 26, life: [0.5, 0.9], size: [12, 22], speed: [10, 50], grav: [0, 30, 0], dir: CX_SPRAY, cg: CX_RAINBOW, sg: [[0, 0.5], [0.3, 1], [1, 0]], spin: [-5, 5], box: cxBox(30, 0, 10), dy: 14, opt: true },
    ],
    trail_lightning: [
        { tex: 'bolt', std: true, rate: 8, life: [0.22, 0.4], size: [80, 120], speed: [0, 0], c: '#fff6a0', c2: '#8fd8ff', box: cxBox(26, 0, 6), dy: 40, initRot: [-0.4, 0.4], sg: [[0, 0.7], [0.2, 1.1], [1, 0.8]] },
        { tex: 'burst', std: true, rate: 9, life: [0.22, 0.4], size: [44, 66], speed: [0, 0], c: '#bfe8ff', c2: '#fff6a0', box: cxBox(20, 0, 6), dy: 14, initRot: [0, 6.28], sg: [[0, 0.6], [0.25, 1.1], [1, 0.7]] },
        { tex: 'dot', rate: 24, life: [0.3, 0.5], size: [28, 46], speed: [0, 8], c: '#4da8ff', c2: '#fff2a0', a: 0.38, sg: [[0, 0.5], [0.3, 1], [1, 0.3]], box: CX_FEET, dy: 14 },
        { tex: 'glint', std: true, rate: 22, life: [0.3, 0.6], size: [10, 18], speed: [50, 150], grav: [0, -200, 0], dir: CX_SPRAY, c: '#fff6a0', c2: '#9fe0ff', sg: [[0, 0.6], [0.3, 1], [1, 0]], spin: [-6, 6], box: cxBox(16, 0, 6), dy: 12, opt: true },
    ],
    trail_lava: [
        { tex: 'flame', std: true, rate: 24, life: [0.4, 0.7], size: [30, 48], speed: [10, 40], dir: cxDir(-0.3, 0.8, -0.3, 0.3, 1.4, 0.3), box: cxBox(14, 0, 4), dy: 10,
            cg: [[0, '#ffd070', 0], [0.12, '#ffa02e', 0.95], [0.45, '#ff4a12', 0.8], [0.8, '#a01408', 0.4], [1, '#200400', 0]], sg: [[0, 0.5], [0.3, 1], [1, 0.4]], initRot: [-0.3, 0.3] },
        { tex: 'dot', std: true, rate: 6, life: [0.7, 1.1], size: [12, 18], speed: [100, 200], grav: [0, -520, 0], dir: cxDir(-0.6, 0.9, -0.6, 0.6, 1.4, 0.6), c: '#ff6a1a', c2: '#ffcf3a', fade: [0.05, 0.7], box: cxBox(10, 0, 4), dy: 10 },
        { tex: 'glint', std: true, rate: 16, life: [0.5, 0.9], size: [8, 14], speed: [40, 110], grav: [0, 50, 0], dir: CX_UP, c: '#ff9a2e', c2: '#fff0a0', sg: [[0, 0.7], [0.3, 1], [1, 0]], box: cxBox(14, 0, 6), dy: 12 },
        { tex: 'puff', std: true, rate: 9, life: [0.8, 1.3], size: [34, 54], speed: [12, 34], dir: cxDir(-0.4, 0.8, -0.4, 0.4, 1.4, 0.4), c: '#2a1410', a: 0.5, fade: [0.15, 0.4], sg: [[0, 0.5], [1, 1.8]], box: cxBox(12, 0, 4), dy: 30, opt: true },
    ],
    // --- mythic
    trail_galaxy: [
        { tex: 'puff', std: true, rate: 18, life: [0.9, 1.4], size: [54, 84], speed: [6, 20], dir: cxDir(-0.5, 0.2, -0.5, 0.5, 0.9, 0.5), c: '#3a1a9e', c2: '#d8349e', a: 0.5, fade: [0.15, 0.4], sg: [[0, 0.5], [1, 1.5]], spin: [-0.6, 0.6], box: cxBox(14, 0, 6), dy: 16 },
        { tex: 'star', std: true, rate: 14, life: [0.8, 1.4], size: [12, 22], speed: [10, 50], grav: [0, 18, 0], dir: CX_SPRAY, c: '#ffffff', c2: '#9fe8ff', spin: [-3, 3], sg: [[0, 0.2], [0.2, 1.1], [0.5, 0.5], [0.7, 1], [1, 0]], box: cxBox(26, 0, 14), dy: 16 },
        { tex: 'glint', std: true, rate: 18, life: [0.8, 1.3], size: [12, 22], speed: [14, 50], grav: [0, 20, 0], dir: CX_SPRAY, cg: CX_RAINBOW, sg: [[0, 0.5], [0.3, 1], [1, 0.1]], spin: [-4, 4], box: cxBox(22, 0, 12), dy: 14 },
        { tex: 'swirl', std: true, rate: 2.8, life: [0.8, 1.2], size: [56, 76], speed: [0, 6], c: '#a8c8ff', c2: '#e0a8ff', a: 0.55, spin: [1.5, 3], sg: [[0, 0.4], [0.4, 1], [1, 1.3]], box: CX_FEET, dy: 12, opt: true },
    ],
    trail_neon: [
        { tex: 'dot', std: true, rate: 80, life: [0.5, 0.8], size: [28, 34], speed: [0, 4], c: '#00f0ff', a: 0.95, cg: [[0, '#00f0ff', 0], [0.1, '#00f0ff', 1], [0.55, '#00b8ff', 0.7], [1, '#0050ff', 0]], sg: [[0, 1], [1, 0.4]], side: -17, box: cxBox(2, 0, 2), dy: 8 },
        { tex: 'dot', std: true, rate: 80, life: [0.5, 0.8], size: [28, 34], speed: [0, 4], c: '#ff2bd6', a: 0.95, cg: [[0, '#ff2bd6', 0], [0.1, '#ff2bd6', 1], [0.55, '#c000ff', 0.7], [1, '#5000ff', 0]], sg: [[0, 1], [1, 0.4]], side: 17, box: cxBox(2, 0, 2), dy: 8 },
        { tex: 'dot', rate: 60, life: [0.35, 0.6], size: [14, 18], speed: [0, 4], cg: [[0, '#ffffff', 0], [0.1, '#ffffff', 1], [1, '#ffffff', 0]], sg: [[0, 1], [1, 0.3]], side: 0, box: cxBox(2, 0, 2), dy: 8 },
        { tex: 'glint', std: true, rate: 22, life: [0.4, 0.8], size: [14, 24], speed: [20, 80], grav: [0, 20, 0], dir: CX_SPRAY, c: '#00f0ff', c2: '#ff2bd6', sg: [[0, 0.5], [0.3, 1], [1, 0]], spin: [-6, 6], box: cxBox(24, 0, 8), dy: 12, opt: true },
    ],
};

// =================================================================================================
//   АУРЫ. m — знаки на земле (меши, текстура рисуется painter-ом на canvas), p — частицы у редких.
//   Меш: draw (имя painter-а), size (px, диаметр), spin (рад/с), pulse (доля), y (над землёй), up: true — «верх» знака от камеры.
// =================================================================================================

/** @type {Record<string, { m: any[], p?: any[] }>} */
const CX_AURAS = {
    aura_basic: { m: [{ draw: 'ring', c: '#38d6ff', size: 100, pulse: 0.06 }] },
    aura_green: { m: [{ draw: 'ring', c: '#43e06b', size: 104, pulse: 0.06 }] },
    aura_pink: { m: [{ draw: 'ring', c: '#ff5fb0', size: 104, pulse: 0.06 }] },
    aura_gold: { m: [{ draw: 'ring', c: '#ffcf3a', size: 108, pulse: 0.05, fill: 0.25 }, { draw: 'ticks', c: '#fff0a0', size: 138, spin: 0.7, y: 4 }],
        p: [{ tex: 'glint', rate: 8, life: [0.6, 1], size: [10, 18], speed: [6, 20], grav: [0, 30, 0], c: '#ffe27a', c2: '#ffffff', sg: [[0, 0.5], [0.3, 1], [1, 0]], emitter: 'ring', radius: 54, spin: [-3, 3], opt: true }] },
    aura_double: { m: [{ draw: 'ring', c: '#6fd6ff', size: 112, pulse: 0.05 }, { draw: 'dashes', c: '#b8f0ff', size: 148, spin: -1.1, y: 4 }, { draw: 'dashes', c: '#6fd6ff', size: 84, spin: 1.5, y: 5, dots: true }] },
    aura_star: { m: [{ draw: 'ring', c: '#ffd23d', size: 116, pulse: 0.04, fill: 0.12, w: 0.025 }, { draw: 'star', c: '#ffe27a', size: 120, spin: 0.6, y: 4, pulse: 0.05 }],
        p: [{ tex: 'star', rate: 5, life: [0.7, 1.1], size: [12, 20], speed: [10, 30], grav: [0, 50, 0], c: '#ffe27a', c2: '#ffffff', spin: [-3, 3], sg: [[0, 0.3], [0.3, 1], [1, 0]], emitter: 'ring', radius: 52 }] },
    aura_heart: { m: [{ draw: 'ring', c: '#ff5f9a', size: 116, pulse: 0.04, fill: 0.12, w: 0.025 }, { draw: 'heart', c: '#ff5f9a', size: 112, pulse: 0.1, y: 4, up: true }],
        p: [{ tex: 'heart', std: true, rate: 3.5, life: [1, 1.6], size: [14, 22], speed: [8, 20], grav: [0, 40, 0], c: '#ff5f9a', c2: '#ffb0cc', fade: [0.15, 0.6], sg: [[0, 0.2], [0.2, 1.1], [1, 0.8]], emitter: 'ring', radius: 48 }] },
    aura_flame: { m: [{ draw: 'flame', c: '#ff7a1f', size: 132, spin: 0.9, pulse: 0.05 }],
        p: [{ tex: 'flame', std: true, rate: 26, life: [0.5, 0.85], size: [34, 56], speed: [4, 14], grav: [0, 95, 0], dir: cxDir(-0.2, 0.6, -0.2, 0.2, 1.2, 0.2), emitter: 'ring', radius: 46,
            cg: [[0, '#fff0a0', 0], [0.15, '#ffd23d', 0.9], [0.5, '#ff7a1f', 0.7], [1, '#a01808', 0]], sg: [[0, 0.5], [0.3, 1], [1, 0.3]], initRot: [-0.3, 0.3] },
            { tex: 'glint', rate: 8, life: [0.6, 1], size: [8, 13], speed: [20, 50], grav: [0, 60, 0], c: '#ffb02e', c2: '#fff0a0', sg: [[0, 0.7], [0.3, 1], [1, 0]], emitter: 'ring', radius: 46, opt: true }] },
    aura_frost: { m: [{ draw: 'frost', c: '#9fe4ff', size: 140, spin: 0.35, pulse: 0.03 }],
        p: [{ tex: 'snow', std: true, rate: 7, life: [1, 1.5], size: [12, 20], speed: [4, 12], grav: [0, 10, 0], c: '#f2fbff', c2: '#a8dcff', fade: [0.1, 0.65], spin: [-2, 2], initRot: [0, 6.28], emitter: 'ring', radius: 50 },
            { tex: 'puff', std: true, rate: 8, life: [0.8, 1.2], size: [30, 48], speed: [2, 8], grav: [0, 14, 0], c: '#cfeeff', a: 0.3, fade: [0.15, 0.4], sg: [[0, 0.5], [1, 1.5]], emitter: 'ring', radius: 48, opt: true },
            { tex: 'glint', rate: 12, life: [0.5, 0.9], size: [8, 14], speed: [6, 20], grav: [0, 24, 0], c: '#7fe4ff', c2: '#ffffff', sg: [[0, 0.5], [0.3, 1], [1, 0]], emitter: 'ring', radius: 52, opt: true }] },
    aura_toxic: { m: [{ draw: 'toxic', c: '#7dff3a', size: 136, spin: -0.6, pulse: 0.05 }],
        p: [{ tex: 'bubble', rate: 9, life: [0.9, 1.4], size: [12, 26], speed: [4, 14], grav: [0, 50, 0], c: '#a8ff5a', c2: '#e0ff9a', a: 0.9, sg: [[0, 0.3], [0.2, 1], [1, 1.1]], emitter: 'ring', radius: 46 },
            { tex: 'puff', std: true, rate: 10, life: [0.8, 1.2], size: [30, 50], speed: [2, 10], grav: [0, 22, 0], c: '#4cc41a', c2: '#9be82a', a: 0.32, fade: [0.15, 0.4], sg: [[0, 0.5], [1, 1.6]], emitter: 'ring', radius: 44, opt: true }] },
    aura_vortex: { m: [{ draw: 'vortex', c: '#6fe8ff', size: 150, spin: -2.2, pulse: 0.03 }, { draw: 'vortex', c: '#b8a0ff', size: 112, spin: 3, y: 4, alpha: 0.85 }],
        p: [{ tex: 'glint', rate: 22, life: [0.5, 0.9], size: [10, 18], speed: [4, 14], grav: [0, 120, 0], c: '#8ff0ff', c2: '#ffffff', sg: [[0, 0.5], [0.3, 1], [1, 0]], emitter: 'ring', radius: 50, spin: [-6, 6] },
            { tex: 'swirl', rate: 3, life: [0.8, 1.2], size: [46, 66], speed: [0, 4], grav: [0, 70, 0], c: '#8ff0ff', c2: '#b8a0ff', a: 0.6, spin: [2, 5], sg: [[0, 0.4], [0.3, 1], [1, 0.8]], emitter: 'ring', radius: 30, opt: true }] },
    aura_crown: { m: [{ draw: 'royal', c: '#ffcf3a', size: 148, spin: 0.5, pulse: 0.04 }],
        p: [{ tex: 'crown', std: true, rate: 1.8, life: [1.2, 1.8], size: [20, 28], speed: [8, 18], grav: [0, 40, 0], c: '#ffcf3a', c2: '#fff0a0', fade: [0.15, 0.6], sg: [[0, 0.3], [0.2, 1.1], [1, 0.8]], emitter: 'ring', radius: 44 },
            { tex: 'glint', rate: 14, life: [0.6, 1], size: [10, 18], speed: [6, 24], grav: [0, 50, 0], c: '#ffe27a', c2: '#ffffff', sg: [[0, 0.5], [0.3, 1], [1, 0]], emitter: 'ring', radius: 52, spin: [-4, 4] }] },
    aura_rainbow: { m: [{ draw: 'rainbow', size: 140, spin: 0.8, pulse: 0.04 }],
        p: [{ tex: 'glint', rate: 22, life: [0.7, 1.2], size: [10, 18], speed: [6, 20], grav: [0, 60, 0], cg: CX_RAINBOW, sg: [[0, 0.5], [0.3, 1], [1, 0.1]], emitter: 'ring', radius: 54, spin: [-5, 5] },
            { tex: 'dot', rate: 10, life: [0.7, 1.1], size: [18, 30], speed: [4, 12], grav: [0, 40, 0], a: 0.5, cg: CX_RAINBOW, sg: [[0, 0.6], [1, 0.1]], emitter: 'ring', radius: 50, opt: true }] },
    aura_galaxy: { m: [{ draw: 'galaxy', size: 156, spin: 0.35, pulse: 0.02 }, { draw: 'twinkle', size: 150, spin: -0.2, y: 5 }],
        p: [{ tex: 'star', rate: 10, life: [0.8, 1.4], size: [10, 18], speed: [6, 24], grav: [0, 45, 0], c: '#ffffff', c2: '#9fe8ff', spin: [-3, 3], sg: [[0, 0.2], [0.2, 1.1], [0.5, 0.5], [0.7, 1], [1, 0]], emitter: 'ring', radius: 56 },
            { tex: 'glint', rate: 14, life: [0.8, 1.3], size: [10, 18], speed: [6, 24], grav: [0, 50, 0], cg: CX_RAINBOW, sg: [[0, 0.5], [0.3, 1], [1, 0.1]], emitter: 'ring', radius: 50, opt: true }] },
    aura_electric: { m: [{ draw: 'electric', c: '#7fdcff', size: 140, spin: 1.4, pulse: 0.03, flicker: 8 }],
        p: [{ tex: 'burst', rate: 5, life: [0.14, 0.26], size: [26, 42], speed: [0, 0], c: '#bfe8ff', c2: '#fff6a0', initRot: [0, 6.28], sg: [[0, 0.6], [0.25, 1.1], [1, 0.7]], emitter: 'ring', radius: 48 },
            { tex: 'bolt', rate: 3, life: [0.14, 0.26], size: [46, 74], speed: [0, 0], c: '#fff6a0', c2: '#8fd8ff', grav: [0, 0, 0], initRot: [-0.3, 0.3], emitter: 'ring', radius: 44, opt: true },
            { tex: 'glint', rate: 14, life: [0.3, 0.6], size: [8, 14], speed: [20, 60], grav: [0, -80, 0], c: '#9fe0ff', c2: '#ffffff', sg: [[0, 0.6], [0.3, 1], [1, 0]], emitter: 'ring', radius: 48, opt: true }] },
    aura_petals: { m: [{ draw: 'petals', c: '#ff9ac6', size: 138, spin: 0.5, pulse: 0.04 }],
        p: [{ tex: 'petal', std: true, rate: 9, life: [1.2, 1.8], size: [12, 20], speed: [6, 18], grav: [0, -30, 0], c: '#ff9ac6', c2: '#ffe0ee', fade: [0.1, 0.7], spin: [-4, 4], initRot: [0, 6.28], emitter: 'ring', radius: 50, dy: 70 }] },
    aura_bubbles: { m: [{ draw: 'bubbles', c: '#bfefff', size: 132, spin: 0.4, pulse: 0.04 }],
        p: [{ tex: 'bubble', rate: 8, life: [0.9, 1.5], size: [12, 26], speed: [3, 10], grav: [0, 55, 0], c: '#bfefff', c2: '#ffd6f5', a: 0.9, sg: [[0, 0.3], [0.2, 1], [1, 1.1]], emitter: 'ring', radius: 50 }] },
    aura_shadow: { m: [{ draw: 'shadow', c: '#7b3dff', size: 150, spin: -0.5, pulse: 0.05 }],
        p: [{ tex: 'puff', std: true, rate: 12, life: [0.9, 1.4], size: [34, 56], speed: [4, 14], grav: [0, 30, 0], c: '#1b0f2e', c2: '#3b1d6e', a: 0.55, fade: [0.15, 0.4], sg: [[0, 0.5], [1, 1.7]], emitter: 'ring', radius: 46 },
            { tex: 'glint', rate: 8, life: [0.6, 1], size: [8, 14], speed: [6, 20], grav: [0, 50, 0], c: '#b07bff', c2: '#ffffff', sg: [[0, 0.5], [0.3, 1], [1, 0]], emitter: 'ring', radius: 50, opt: true }] },
    aura_angel: { m: [{ draw: 'angel', c: '#fff0a0', size: 152, spin: 0.35, pulse: 0.04 }],
        p: [{ tex: 'glint', rate: 16, life: [0.8, 1.3], size: [10, 18], speed: [4, 14], grav: [0, 55, 0], c: '#fff6c0', c2: '#ffffff', sg: [[0, 0.5], [0.3, 1], [1, 0]], emitter: 'ring', radius: 54, spin: [-3, 3] },
            { tex: 'petal', std: true, rate: 5, life: [1.3, 2], size: [12, 18], speed: [4, 12], grav: [0, 20, 0], c: '#ffffff', c2: '#fff0c0', a: 0.9, fade: [0.15, 0.6], spin: [-2, 2], initRot: [0, 6.28], emitter: 'ring', radius: 48 },
            { tex: 'halo', rate: 1.5, life: [0.9, 1.2], size: [60, 80], speed: [0, 4], grav: [0, 20, 0], c: '#fff0a0', a: 0.4, sg: [[0, 0.5], [0.4, 1], [1, 1.3]], emitter: 'ring', radius: 16, opt: true }] },
    aura_pixel: { m: [{ draw: 'pixel', c: '#4dff9a', size: 132, spin: 0.7, pulse: 0.03 }],
        p: [{ tex: 'pixel', std: true, rate: 9, life: [0.7, 1.1], size: [8, 13], speed: [4, 14], grav: [0, 70, 0], c: '#4dff9a', c2: '#2fd0ff', fade: [0.05, 0.6], emitter: 'ring', radius: 50 }] },
    aura_candy: { m: [{ draw: 'candy', size: 136, spin: 0.9, pulse: 0.04 }],
        p: [{ tex: 'candy', std: true, rate: 2.5, life: [1.1, 1.6], size: [16, 22], speed: [6, 16], grav: [0, 40, 0], c: '#ff5fa8', c2: '#4dd8ff', fade: [0.1, 0.65], spin: [-3, 3], emitter: 'ring', radius: 46 },
            { tex: 'confetti', std: true, rate: 8, life: [0.8, 1.3], size: [7, 12], speed: [6, 16], grav: [0, 30, 0], c: '#ffe14d', c2: '#ff8ad8', fade: [0.05, 0.7], spin: [-8, 8], initRot: [0, 6.28], emitter: 'ring', radius: 52, opt: true }] },
    aura_cosmic: { m: [{ draw: 'cosmic', size: 168, spin: 0.3, pulse: 0.02 }, { draw: 'orbits', size: 156, spin: -0.8, y: 5 }],
        p: [{ tex: 'star', rate: 10, life: [0.8, 1.4], size: [10, 18], speed: [6, 24], grav: [0, 45, 0], c: '#ffffff', c2: '#ffd0ff', spin: [-3, 3], sg: [[0, 0.2], [0.2, 1.1], [0.5, 0.5], [0.7, 1], [1, 0]], emitter: 'ring', radius: 58 },
            { tex: 'swirl', rate: 2.4, life: [0.9, 1.4], size: [54, 76], speed: [0, 4], grav: [0, 40, 0], c: '#a8c8ff', c2: '#e0a8ff', a: 0.55, spin: [1.5, 3], sg: [[0, 0.4], [0.4, 1], [1, 1.2]], emitter: 'ring', radius: 30, opt: true },
            { tex: 'glint', rate: 14, life: [0.8, 1.3], size: [10, 18], speed: [6, 24], grav: [0, 50, 0], cg: CX_RAINBOW, sg: [[0, 0.5], [0.3, 1], [1, 0.1]], emitter: 'ring', radius: 54, opt: true }] },
};

const CX_AURA_PLAIN = ['aura_basic', 'aura_green', 'aura_pink'];

// --- Рисование знаков на canvas (S — сторона, центр S/2) ---------------------------------------

function cxRgba(hex, a) {
    const h = String(hex || '#ffffff').replace('#', '');
    const n = parseInt(h.length === 3 ? h.replace(/./g, '$&$&') : h, 16) || 0;
    return 'rgba(' + ((n >> 16) & 255) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + (a == null ? 1 : a) + ')';
}

/** Светящаяся линия: цвет + белая сердцевина. */
function cxGlow(ctx, S, path, color, width, glow, core) {
    ctx.save();
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.shadowColor = cxRgba(color, 0.9); ctx.shadowBlur = glow * S;
    ctx.strokeStyle = cxRgba(color, 0.95); ctx.lineWidth = width * S;
    path(); ctx.stroke();
    ctx.shadowBlur = 0;
    if (core !== false) { ctx.strokeStyle = 'rgba(255,255,255,0.65)'; ctx.lineWidth = width * S * 0.32; path(); ctx.stroke(); }
    ctx.restore();
}
function cxDisc(ctx, S, r, inner, outer) {
    const g = ctx.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, r * S);
    g.addColorStop(0, inner); g.addColorStop(1, outer);
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(S / 2, S / 2, r * S, 0, Math.PI * 2); ctx.fill();
}
const cxCircle = (ctx, S, r) => () => { ctx.beginPath(); ctx.arc(S / 2, S / 2, r * S, 0, Math.PI * 2); };
function cxStarPath(ctx, cx, cy, ro, ri, n, rot) {
    ctx.beginPath();
    for (let i = 0; i < n * 2; i++) {
        const a = rot + i * Math.PI / n, r = i % 2 ? ri : ro;
        i ? ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r) : ctx.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
    }
    ctx.closePath();
}
function cxHeartPath(ctx, cx, cy, s) {
    ctx.beginPath();
    for (let i = 0; i <= 64; i++) {
        const t = i / 64 * Math.PI * 2;
        const x = 16 * Math.pow(Math.sin(t), 3), y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
        i ? ctx.lineTo(cx + x * s, cy + y * s) : ctx.moveTo(cx + x * s, cy + y * s);
    }
    ctx.closePath();
}
function cxRand(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }

/** @type {Record<string, (ctx: any, S: number, o: any) => void>} */
const CX_PAINT = {
    ring(ctx, S, o) {
        cxDisc(ctx, S, 0.43, cxRgba(o.c, (o.fill == null ? 0.22 : o.fill) * 0.4), cxRgba(o.c, o.fill == null ? 0.22 : o.fill));
        cxGlow(ctx, S, cxCircle(ctx, S, 0.42), o.c, o.w || 0.04, 0.045);
    },
    ticks(ctx, S, o) {
        cxGlow(ctx, S, cxCircle(ctx, S, 0.44), o.c, 0.012, 0.03, false);
        for (let i = 0; i < 36; i++) {
            const a = i / 36 * Math.PI * 2, r1 = i % 3 ? 0.4 : 0.37, r2 = 0.44;
            cxGlow(ctx, S, () => { ctx.beginPath(); ctx.moveTo(S / 2 + Math.cos(a) * r1 * S, S / 2 + Math.sin(a) * r1 * S); ctx.lineTo(S / 2 + Math.cos(a) * r2 * S, S / 2 + Math.sin(a) * r2 * S); }, o.c, i % 3 ? 0.012 : 0.02, 0.02, false);
        }
    },
    dashes(ctx, S, o) {
        const n = o.dots ? 14 : 12;
        for (let i = 0; i < n; i++) {
            const a0 = i / n * Math.PI * 2, a1 = a0 + (o.dots ? 0.06 : 0.3);
            cxGlow(ctx, S, () => { ctx.beginPath(); ctx.arc(S / 2, S / 2, 0.44 * S, a0, a1); }, o.c, o.dots ? 0.035 : 0.025, 0.035);
        }
    },
    star(ctx, S, o) {
        cxStarPath(ctx, S / 2, S / 2, 0.44 * S, 0.19 * S, 5, -Math.PI / 2);
        ctx.fillStyle = cxRgba(o.c, 0.2); ctx.fill();
        cxGlow(ctx, S, () => cxStarPath(ctx, S / 2, S / 2, 0.44 * S, 0.19 * S, 5, -Math.PI / 2), o.c, 0.032, 0.04);
    },
    heart(ctx, S, o) {
        cxHeartPath(ctx, S / 2, S / 2 + 0.02 * S, S * 0.0245);
        const g = ctx.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S * 0.45);
        g.addColorStop(0, cxRgba(o.c, 0.45)); g.addColorStop(1, cxRgba(o.c, 0.14));
        ctx.fillStyle = g; ctx.fill();
        cxGlow(ctx, S, () => cxHeartPath(ctx, S / 2, S / 2 + 0.02 * S, S * 0.0245), o.c, 0.034, 0.045);
    },
    flame(ctx, S, o) {
        cxDisc(ctx, S, 0.36, 'rgba(255,120,30,0.12)', 'rgba(255,90,20,0.3)');
        const n = 14;
        for (let i = 0; i < n; i++) {
            const a = i / n * Math.PI * 2, w = Math.PI / n * 0.8;
            const g = ctx.createRadialGradient(S / 2, S / 2, S * 0.3, S / 2, S / 2, S * 0.5);
            g.addColorStop(0, '#ff3a10'); g.addColorStop(0.5, '#ff9a2a'); g.addColorStop(1, 'rgba(255,230,120,0.5)');
            ctx.fillStyle = g; ctx.beginPath();
            ctx.moveTo(S / 2 + Math.cos(a - w) * 0.31 * S, S / 2 + Math.sin(a - w) * 0.31 * S);
            ctx.quadraticCurveTo(S / 2 + Math.cos(a - w * 0.3) * 0.42 * S, S / 2 + Math.sin(a - w * 0.3) * 0.42 * S, S / 2 + Math.cos(a + 0.12) * 0.5 * S, S / 2 + Math.sin(a + 0.12) * 0.5 * S);
            ctx.quadraticCurveTo(S / 2 + Math.cos(a + w * 0.6) * 0.4 * S, S / 2 + Math.sin(a + w * 0.6) * 0.4 * S, S / 2 + Math.cos(a + w) * 0.31 * S, S / 2 + Math.sin(a + w) * 0.31 * S);
            ctx.fill();
        }
        cxGlow(ctx, S, cxCircle(ctx, S, 0.31), '#ffc23d', 0.03, 0.04);
    },
    frost(ctx, S, o) {
        cxDisc(ctx, S, 0.43, 'rgba(160,225,255,0.1)', 'rgba(160,225,255,0.28)');
        cxGlow(ctx, S, cxCircle(ctx, S, 0.42), o.c, 0.028, 0.04);
        for (let k = 0; k < 6; k++) {
            const a = k * Math.PI / 3;
            const L = (f, w) => { const dx = Math.cos(a), dy = Math.sin(a); return [S / 2 + dx * f * S, S / 2 + dy * f * S, dx, dy, w]; };
            cxGlow(ctx, S, () => { ctx.beginPath(); ctx.moveTo(S / 2, S / 2); ctx.lineTo(S / 2 + Math.cos(a) * 0.4 * S, S / 2 + Math.sin(a) * 0.4 * S); }, '#e8fbff', 0.026, 0.035);
            for (const f of [0.18, 0.3]) {
                const [x, y] = L(f);
                for (const s of [-1, 1]) {
                    const b = a + s * 0.85;
                    cxGlow(ctx, S, () => { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(b) * 0.09 * S, y + Math.sin(b) * 0.09 * S); }, '#e8fbff', 0.02, 0.03, false);
                }
            }
        }
    },
    toxic(ctx, S, o) {
        cxDisc(ctx, S, 0.43, 'rgba(120,255,60,0.1)', 'rgba(110,230,40,0.3)');
        cxGlow(ctx, S, cxCircle(ctx, S, 0.42), o.c, 0.03, 0.045);
        for (let k = 0; k < 3; k++) {
            const a = k * Math.PI * 2 / 3 - Math.PI / 2;
            cxGlow(ctx, S, () => { ctx.beginPath(); ctx.arc(S / 2 + Math.cos(a) * 0.12 * S, S / 2 + Math.sin(a) * 0.12 * S, 0.2 * S, a - 0.9, a + 0.9); }, '#c8ff6a', 0.05, 0.03);
            ctx.fillStyle = cxRgba('#c8ff6a', 0.9); ctx.beginPath(); ctx.arc(S / 2 + Math.cos(a) * 0.12 * S, S / 2 + Math.sin(a) * 0.12 * S, 0.035 * S, 0, 7); ctx.fill();
        }
        ctx.fillStyle = 'rgba(40,90,10,0.9)'; ctx.beginPath(); ctx.arc(S / 2, S / 2, 0.04 * S, 0, 7); ctx.fill();
        const r = cxRand(7);
        for (let i = 0; i < 9; i++) { const a = r() * 6.28, d = 0.3 + r() * 0.1; ctx.fillStyle = cxRgba('#d8ff8a', 0.7); ctx.beginPath(); ctx.arc(S / 2 + Math.cos(a) * d * S, S / 2 + Math.sin(a) * d * S, (0.01 + r() * 0.018) * S, 0, 7); ctx.fill(); }
    },
    vortex(ctx, S, o) {
        cxDisc(ctx, S, 0.15, cxRgba(o.c, 0.55), cxRgba(o.c, 0));
        for (let arm = 0; arm < 4; arm++) {
            cxGlow(ctx, S, () => {
                ctx.beginPath();
                for (let i = 0; i <= 40; i++) {
                    const t = i / 40, a = arm * Math.PI / 2 + t * 3.2, r = (0.06 + t * 0.38) * S;
                    i ? ctx.lineTo(S / 2 + Math.cos(a) * r, S / 2 + Math.sin(a) * r) : ctx.moveTo(S / 2 + Math.cos(a) * r, S / 2 + Math.sin(a) * r);
                }
            }, o.c, 0.034, 0.04);
        }
    },
    royal(ctx, S, o) {
        cxDisc(ctx, S, 0.4, 'rgba(255,220,100,0.1)', 'rgba(255,200,60,0.26)');
        cxGlow(ctx, S, cxCircle(ctx, S, 0.34), o.c, 0.032, 0.04);
        cxGlow(ctx, S, cxCircle(ctx, S, 0.27), '#fff0a0', 0.012, 0.02, false);
        for (let i = 0; i < 8; i++) {
            const a = i / 8 * Math.PI * 2, w = 0.2;
            const px = (r, aa) => [S / 2 + Math.cos(aa) * r * S, S / 2 + Math.sin(aa) * r * S];
            ctx.beginPath();
            const p0 = px(0.34, a - w), p1 = px(0.47, a), p2 = px(0.34, a + w);
            ctx.moveTo(p0[0], p0[1]); ctx.lineTo(p1[0], p1[1]); ctx.lineTo(p2[0], p2[1]); ctx.closePath();
            ctx.fillStyle = cxRgba('#ffcf3a', 0.85); ctx.fill();
            cxGlow(ctx, S, () => { ctx.beginPath(); ctx.moveTo(p0[0], p0[1]); ctx.lineTo(p1[0], p1[1]); ctx.lineTo(p2[0], p2[1]); }, '#fff0a0', 0.012, 0.02, false);
            const g = px(0.47, a);
            ctx.fillStyle = i % 2 ? '#ff4d6d' : '#4dd8ff'; ctx.beginPath(); ctx.arc(g[0], g[1], 0.022 * S, 0, 7); ctx.fill();
        }
    },
    rainbow(ctx, S, o) {
        const cols = ['#ff3d5e', '#ff9a3d', '#ffe93d', '#4dff7a', '#3dc8ff', '#7a5bff', '#d84dff'];
        cxDisc(ctx, S, 0.4, 'rgba(255,255,255,0.1)', 'rgba(255,255,255,0.16)');
        cols.forEach((c, i) => cxGlow(ctx, S, cxCircle(ctx, S, 0.44 - i * 0.045), c, 0.036, 0.02, false));
    },
    galaxy(ctx, S, o) {
        cxDisc(ctx, S, 0.46, 'rgba(120,60,220,0.55)', 'rgba(30,20,90,0.45)');
        for (let arm = 0; arm < 3; arm++) {
            for (let i = 0; i < 46; i++) {
                const t = i / 46, a = arm * Math.PI * 2 / 3 + t * 4.2, r = (0.05 + t * 0.38) * S;
                const g = ctx.createRadialGradient(S / 2 + Math.cos(a) * r, S / 2 + Math.sin(a) * r, 0, S / 2 + Math.cos(a) * r, S / 2 + Math.sin(a) * r, 0.05 * S);
                g.addColorStop(0, cxRgba(arm % 2 ? '#ff7ae8' : '#7ad8ff', 0.5 * (1 - t * 0.5))); g.addColorStop(1, cxRgba('#5030c0', 0));
                ctx.fillStyle = g; ctx.beginPath(); ctx.arc(S / 2 + Math.cos(a) * r, S / 2 + Math.sin(a) * r, 0.05 * S, 0, 7); ctx.fill();
            }
        }
        cxDisc(ctx, S, 0.12, 'rgba(255,240,255,0.95)', 'rgba(255,200,255,0)');
        cxGlow(ctx, S, cxCircle(ctx, S, 0.45), '#a8a0ff', 0.016, 0.035, false);
    },
    twinkle(ctx, S) {
        const r = cxRand(11);
        for (let i = 0; i < 38; i++) {
            const a = r() * 6.28, d = Math.sqrt(r()) * 0.45, x = S / 2 + Math.cos(a) * d * S, y = S / 2 + Math.sin(a) * d * S, s = (0.006 + r() * 0.014) * S;
            ctx.fillStyle = 'rgba(255,255,255,0.95)'; ctx.shadowColor = '#fff'; ctx.shadowBlur = s * 3;
            if (i % 5 === 0) { cxStarPath(ctx, x, y, s * 2.4, s * 0.6, 4, 0); ctx.fill(); } else { ctx.beginPath(); ctx.arc(x, y, s, 0, 7); ctx.fill(); }
        }
        ctx.shadowBlur = 0;
    },
    electric(ctx, S, o) {
        cxDisc(ctx, S, 0.42, 'rgba(100,200,255,0.06)', 'rgba(100,200,255,0.2)');
        const r = cxRand(3);
        for (let k = 0; k < 2; k++) {
            cxGlow(ctx, S, () => {
                ctx.beginPath();
                const n = 38;
                for (let i = 0; i <= n; i++) {
                    const a = i / n * Math.PI * 2, rr = (0.4 + (i % 2 ? 0.035 : -0.035) + (r() - 0.5) * 0.04 - k * 0.07) * S;
                    i ? ctx.lineTo(S / 2 + Math.cos(a) * rr, S / 2 + Math.sin(a) * rr) : ctx.moveTo(S / 2 + Math.cos(a) * rr, S / 2 + Math.sin(a) * rr);
                }
            }, k ? '#bfefff' : o.c, k ? 0.014 : 0.024, 0.04);
        }
    },
    petals(ctx, S, o) {
        cxDisc(ctx, S, 0.4, 'rgba(255,170,210,0.08)', 'rgba(255,150,200,0.2)');
        for (let layer = 0; layer < 2; layer++) {
            const n = 8, off = layer * Math.PI / n;
            for (let i = 0; i < n; i++) {
                const a = i / n * Math.PI * 2 + off, r0 = layer ? 0.16 : 0.2;
                ctx.save(); ctx.translate(S / 2 + Math.cos(a) * r0 * S, S / 2 + Math.sin(a) * r0 * S); ctx.rotate(a);
                const g = ctx.createLinearGradient(0, 0, 0.26 * S, 0);
                g.addColorStop(0, layer ? '#ffd0e4' : '#ff7ab0'); g.addColorStop(1, layer ? 'rgba(255,230,240,0.7)' : 'rgba(255,170,210,0.8)');
                ctx.fillStyle = g; ctx.shadowColor = '#ff9ac6'; ctx.shadowBlur = 0.03 * S;
                ctx.beginPath(); ctx.ellipse(0.12 * S, 0, (layer ? 0.1 : 0.14) * S, (layer ? 0.045 : 0.06) * S, 0, 0, 7); ctx.fill();
                ctx.restore();
            }
        }
        cxDisc(ctx, S, 0.06, 'rgba(255,240,150,1)', 'rgba(255,200,80,0.9)');
    },
    bubbles(ctx, S, o) {
        cxDisc(ctx, S, 0.42, 'rgba(170,230,255,0.06)', 'rgba(170,230,255,0.2)');
        cxGlow(ctx, S, cxCircle(ctx, S, 0.42), o.c, 0.014, 0.03, false);
        const r = cxRand(5);
        for (let i = 0; i < 12; i++) {
            const a = i / 12 * Math.PI * 2, d = 0.3 + (i % 2) * 0.08, rad = (0.045 + r() * 0.04) * S, x = S / 2 + Math.cos(a) * d * S, y = S / 2 + Math.sin(a) * d * S;
            ctx.fillStyle = 'rgba(190,240,255,0.18)'; ctx.beginPath(); ctx.arc(x, y, rad, 0, 7); ctx.fill();
            ctx.strokeStyle = 'rgba(230,250,255,0.95)'; ctx.lineWidth = 0.012 * S; ctx.stroke();
            ctx.fillStyle = 'rgba(255,255,255,0.95)'; ctx.beginPath(); ctx.arc(x - rad * 0.35, y - rad * 0.35, rad * 0.22, 0, 7); ctx.fill();
        }
    },
    shadow(ctx, S, o) {
        cxDisc(ctx, S, 0.48, 'rgba(10,0,25,0.8)', 'rgba(40,10,90,0.0)');
        cxDisc(ctx, S, 0.4, 'rgba(0,0,0,0.55)', 'rgba(30,0,70,0.5)');
        cxGlow(ctx, S, cxCircle(ctx, S, 0.38), o.c, 0.03, 0.05);
        const r = cxRand(9);
        for (let i = 0; i < 9; i++) {
            const a = i / 9 * Math.PI * 2 + r() * 0.3, len = 0.12 + r() * 0.1;
            ctx.strokeStyle = 'rgba(10,0,20,0.85)'; ctx.lineWidth = 0.028 * S; ctx.lineCap = 'round';
            ctx.beginPath(); ctx.moveTo(S / 2 + Math.cos(a) * 0.38 * S, S / 2 + Math.sin(a) * 0.38 * S);
            ctx.quadraticCurveTo(S / 2 + Math.cos(a + 0.4) * (0.38 + len / 2) * S, S / 2 + Math.sin(a + 0.4) * (0.38 + len / 2) * S, S / 2 + Math.cos(a + 0.2) * (0.38 + len) * S, S / 2 + Math.sin(a + 0.2) * (0.38 + len) * S);
            ctx.stroke();
        }
    },
    angel(ctx, S, o) {
        cxDisc(ctx, S, 0.46, 'rgba(255,250,220,0.22)', 'rgba(255,230,140,0.28)');
        cxGlow(ctx, S, cxCircle(ctx, S, 0.3), '#fff0a0', 0.03, 0.05);
        cxGlow(ctx, S, cxCircle(ctx, S, 0.2), '#ffffff', 0.016, 0.03, false);
        for (let i = 0; i < 12; i++) {
            const a = i / 12 * Math.PI * 2;
            ctx.save(); ctx.translate(S / 2 + Math.cos(a) * 0.32 * S, S / 2 + Math.sin(a) * 0.32 * S); ctx.rotate(a);
            const g = ctx.createLinearGradient(0, 0, 0.16 * S, 0);
            g.addColorStop(0, 'rgba(255,255,255,0.95)'); g.addColorStop(1, 'rgba(255,240,170,0.15)');
            ctx.fillStyle = g; ctx.shadowColor = '#fff6c0'; ctx.shadowBlur = 0.02 * S;
            ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(0.08 * S, -0.06 * S, 0.17 * S, 0); ctx.quadraticCurveTo(0.08 * S, 0.06 * S, 0, 0); ctx.fill();
            ctx.restore();
        }
    },
    pixel(ctx, S, o) {
        const cell = S / 24, cx = S / 2;
        ctx.fillStyle = cxRgba(o.c, 0.14);
        for (let j = -12; j < 12; j++) for (let i = -12; i < 12; i++) {
            const d = Math.hypot(i + 0.5, j + 0.5);
            const x = cx + i * cell, y = cx + j * cell;
            if (d < 9.2) { ctx.fillStyle = cxRgba(o.c, 0.12); ctx.fillRect(x + 1, y + 1, cell - 2, cell - 2); }
            if (d > 8.2 && d < 9.5) {
                const k = (Math.atan2(j, i) * 3.2 | 0) & 3;
                ctx.fillStyle = ['#4dff9a', '#2fd0ff', '#b6ff4d', '#ffffff'][k]; ctx.shadowColor = '#4dff9a'; ctx.shadowBlur = cell * 0.9;
                ctx.fillRect(x + 1, y + 1, cell - 2, cell - 2); ctx.shadowBlur = 0;
            }
        }
    },
    candy(ctx, S) {
        cxDisc(ctx, S, 0.44, 'rgba(255,255,255,0.14)', 'rgba(255,200,230,0.3)');
        const n = 24;
        for (let i = 0; i < n; i++) {
            ctx.strokeStyle = i % 2 ? '#ffffff' : '#ff3d7a'; ctx.lineWidth = 0.05 * S; ctx.lineCap = 'butt';
            ctx.shadowColor = i % 2 ? '#ffd0e4' : '#ff3d7a'; ctx.shadowBlur = 0.02 * S;
            ctx.beginPath(); ctx.arc(S / 2, S / 2, 0.4 * S, i / n * Math.PI * 2, (i + 1.02) / n * Math.PI * 2); ctx.stroke();
        }
        ctx.shadowBlur = 0;
        for (let arm = 0; arm < 2; arm++) {
            ctx.strokeStyle = arm ? '#ffffff' : '#4dc9ff'; ctx.lineWidth = 0.04 * S; ctx.lineCap = 'round';
            ctx.beginPath();
            for (let i = 0; i <= 30; i++) { const t = i / 30, a = arm * Math.PI + t * 4.6, r = (0.03 + t * 0.28) * S; i ? ctx.lineTo(S / 2 + Math.cos(a) * r, S / 2 + Math.sin(a) * r) : ctx.moveTo(S / 2 + Math.cos(a) * r, S / 2 + Math.sin(a) * r); }
            ctx.stroke();
        }
    },
    cosmic(ctx, S) {
        cxDisc(ctx, S, 0.47, 'rgba(60,30,150,0.7)', 'rgba(15,10,60,0.5)');
        const r = cxRand(21), blobs = ['#ff4fd8', '#4d8dff', '#9b5bff', '#2fe0ff'];
        for (let i = 0; i < 9; i++) {
            const a = r() * 6.28, d = r() * 0.3, x = S / 2 + Math.cos(a) * d * S, y = S / 2 + Math.sin(a) * d * S, rad = (0.1 + r() * 0.12) * S;
            const g = ctx.createRadialGradient(x, y, 0, x, y, rad);
            g.addColorStop(0, cxRgba(blobs[i % 4], 0.5)); g.addColorStop(1, cxRgba(blobs[i % 4], 0));
            ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, rad, 0, 7); ctx.fill();
        }
        cxDisc(ctx, S, 0.1, 'rgba(255,255,255,0.95)', 'rgba(255,220,255,0)');
        cxGlow(ctx, S, cxCircle(ctx, S, 0.46), '#c0a8ff', 0.014, 0.035, false);
    },
    orbits(ctx, S) {
        const cols = ['#7ad8ff', '#ff9ae8', '#ffe27a'];
        for (let k = 0; k < 3; k++) {
            ctx.save(); ctx.translate(S / 2, S / 2); ctx.rotate(k * Math.PI / 3 + 0.3);
            ctx.strokeStyle = cxRgba(cols[k], 0.8); ctx.lineWidth = 0.012 * S; ctx.shadowColor = cols[k]; ctx.shadowBlur = 0.03 * S;
            ctx.beginPath(); ctx.ellipse(0, 0, 0.44 * S, 0.17 * S, 0, 0, 7); ctx.stroke();
            ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0.44 * S * Math.cos(1 + k * 2), 0.17 * S * Math.sin(1 + k * 2), 0.03 * S, 0, 7); ctx.fill();
            ctx.restore();
        }
    },
};

// =================================================================================================
//   ЭФФЕКТЫ ПОБЕДЫ. Каждый — функция (p) -> { layers, snd?, shake?, run? }: p — ноги героя (Babylon), слой с at — смещением от p,
//   delay — задержка (игровые секунды). snd — [[список, громкость, rate, задержка с]].
// =================================================================================================

const CX_EMOTE_K = 1.35;      // общий множитель размера частиц эффектов победы
const cxSnd = (key, vol, rate, delay) => [key, vol == null ? 0.6 : vol, rate == null ? 1 : rate, delay || 0];

/** @type {Record<string, (X: any) => any>} */
const CX_EMOTES = {
    win_confetti() {
        /** @type {any[]} */
        const layers = CX_PARTY.map((c, i) => ({ tex: 'confetti', std: true, delay: i * 0.05, burst: 28, life: [1.7, 2.5], size: [10, 17], speed: [260, 520], grav: [0, -430, 0],
            dir: cxDir(-0.6, 1, -0.6, 0.6, 1.5, 0.6), c, c2: c, fade: [0.03, 0.8], spin: [-9, 9], initRot: [0, 6.28], at: [0, 40, 0] }));
        layers.push({ tex: 'glint', burst: 30, life: [0.6, 1.2], size: [14, 26], speed: [200, 420], grav: [0, -200, 0], emitter: 'sphere', radius: 8, at: [0, 90, 0], c: '#ffffff', c2: '#ffe27a', sg: [[0, 0.6], [0.3, 1], [1, 0]], spin: [-6, 6] },
            cxFlash('#fff0b0', 240, 0.35, 0, [0, 90, 0]), cxWave('#ffe27a', 360, 0.6),
            { tex: 'confetti', std: true, delay: 0.5, rate: 40, duration: 0.9, life: [1.4, 2], size: [10, 16], speed: [10, 50], grav: [0, -120, 0], box: cxBox(250, 330, 360, 220), dir: cxDir(-0.2, -1, -0.2, 0.2, -0.6, 0.2),
                c: '#ff8ad8', c2: '#7dff7a', fade: [0.05, 0.8], spin: [-9, 9], initRot: [0, 6.28], opt: true });
        return { layers, snd: [cxSnd('buyOk', 0.6, 1.2, 0), cxSnd('whoosh', 0.35, 1.4, 0.05)] };
    },
    win_fireworks(X) {
        /** @type {any[][]} */
        const spots = [[-160, 300, -70, 0.15, '#ff4d6d', '#ffd23d'], [150, 350, 90, 0.75, '#4dd8ff', '#b06bff'], [-10, 400, -150, 1.3, '#7dff7a', '#ffe14d']];
        /** @type {any[]} */
        const layers = [], snd = [];
        spots.forEach(([x, y, z, t, a, b]) => {
            layers.push({ tex: 'streak', stretch: true, burst: 3, life: [0.32, 0.36], size: [14, 18], speed: [y / 0.34, y / 0.34], dir: cxDir(0, 1, 0, 0, 1, 0), scaleY: [8, 12], c: '#ffe9b0', c2: '#ffffff',
                sg: [[0, 1], [1, 0.5]], delay: t - 0.34, at: [x, 0, z] });
            layers.push(cxFlash('#fff6c0', 230, 0.3, t, [x, y, z]));
            layers.push({ tex: 'glint', burst: 46, life: [0.9, 1.4], size: [18, 30], speed: [170, 270], grav: [0, -110, 0], emitter: 'sphere', radius: 4, delay: t, at: [x, y, z], c: a, c2: b,
                sg: [[0, 0.6], [0.3, 1], [1, 0]], spin: [-4, 4] });
            layers.push({ tex: 'star', burst: 14, life: [0.9, 1.4], size: [20, 32], speed: [100, 190], grav: [0, -90, 0], emitter: 'sphere', radius: 4, delay: t, at: [x, y, z], c: b, c2: '#ffffff',
                sg: [[0, 0.5], [0.3, 1], [0.8, 0.8], [1, 0]], spin: [-3, 3], opt: true });
            layers.push({ tex: 'glint', burst: 26, life: [0.8, 1.2], size: [10, 16], speed: [10, 60], grav: [0, -50, 0], emitter: 'sphere', radius: 70, delay: t + 0.25, at: [x, y, z], c: '#ffffff', c2: a,
                sg: [[0, 0.5], [0.3, 1], [1, 0]], opt: true });
            snd.push(cxSnd('whoosh', 0.4, 1.5, Math.max(0, t - 0.34)), cxSnd('hit', 0.4, 1.3, t));
        });
        return { layers, snd, shake: [0.15, 140, 0.004] };
    },
    win_coinrain() {
        const snd = [0, 0.25, 0.5, 0.8, 1.1, 1.4].map(t => cxSnd('coin', 0.5, 0.95 + t * 0.12, t));
        return { snd, layers: [
            { tex: 'coin', std: true, rate: 38, duration: 1.8, life: [1.3, 1.7], size: [24, 34], speed: [120, 220], grav: [0, -260, 0], box: cxBox(270, 400, 440, 230), dir: cxDir(-0.1, -1, -0.1, 0.1, -0.8, 0.1),
                c: '#ffd23d', c2: '#ffe98a', fade: [0.05, 0.85], spin: [-7, 7], at: [0, 0, 0] },
            { tex: 'glint', rate: 40, delay: 0.2, duration: 1.8, life: [0.3, 0.6], size: [12, 22], speed: [20, 90], grav: [0, -120, 0], box: cxBox(270, 4, 30, 230), c: '#ffe27a', c2: '#ffffff', sg: [[0, 0.5], [0.3, 1], [1, 0]], spin: [-5, 5] },
            { tex: 'coin', std: true, burst: 14, delay: 0.1, life: [1, 1.6], size: [22, 30], speed: [220, 360], grav: [0, -520, 0], dir: cxDir(-0.5, 1, -0.5, 0.5, 1.4, 0.5), c: '#ffd23d', c2: '#fff0a0', fade: [0.05, 0.8], spin: [-8, 8], at: [0, 40, 0] },
            cxWave('#ffd23d', 380, 0.6, 0.05), cxFlash('#ffe27a', 200, 0.3, 0.05, [0, 60, 0]),
        ] };
    },
    win_hearts() {
        return { snd: [cxSnd('equip', 0.5, 1.3, 0), cxSnd('buyOk', 0.4, 1.5, 0.15)], layers: [
            { tex: 'heart', std: true, burst: 20, life: [1.6, 2.4], size: [26, 46], speed: [90, 190], grav: [0, 22, 0], dir: cxDir(-0.9, 0.6, -0.9, 0.9, 1.5, 0.9), c: '#ff4f8b', c2: '#ffb0cc', fade: [0.1, 0.75],
                sg: [[0, 0.2], [0.18, 1.15], [0.3, 1], [1, 0.8]], spin: [-1, 1], at: [0, 70, 0] },
            { tex: 'heart', std: true, burst: 1, life: [1.3, 1.3], size: [120, 120], speed: [0, 0], c: '#ff3d7a', a: 0.95, fade: [0.12, 0.6], sg: [[0, 0.2], [0.2, 1.1], [0.4, 0.92], [0.55, 1.05], [1, 1.2]], at: [0, 230, 0] },
            { tex: 'glint', burst: 34, life: [0.6, 1.2], size: [12, 22], speed: [80, 220], grav: [0, 20, 0], emitter: 'sphere', radius: 8, at: [0, 80, 0], c: '#ff9ac0', c2: '#ffffff', sg: [[0, 0.6], [0.3, 1], [1, 0]], spin: [-5, 5] },
            cxFlash('#ff7aa8', 240, 0.4, 0, [0, 80, 0]), cxWave('#ff6a9a', 340, 0.7, 0),
            { tex: 'heart', std: true, delay: 0.4, rate: 14, duration: 1.2, life: [1.3, 1.9], size: [16, 28], speed: [30, 70], grav: [0, 40, 0], box: cxBox(150, 0, 40, 130), c: '#ffb0cc', c2: '#ff5f9a', fade: [0.1, 0.75], opt: true },
        ] };
    },
    win_stars() {
        return { snd: [cxSnd('equip', 0.5, 1.5, 0), cxSnd('tick', 0.4, 1.6, 0.3)], layers: [
            { tex: 'star', rate: 26, duration: 1.8, life: [1.2, 1.6], size: [24, 40], speed: [160, 280], grav: [0, -200, 0], box: cxBox(290, 400, 450, 240), dir: cxDir(-0.15, -1, -0.15, 0.15, -0.8, 0.15),
                c: '#ffd23d', c2: '#fff3a0', spin: [-4, 4], sg: [[0, 0.4], [0.15, 1], [0.8, 1], [1, 0.2]] },
            { tex: 'glint', rate: 40, duration: 1.8, life: [0.5, 0.9], size: [12, 22], speed: [0, 40], box: cxBox(290, 40, 440, 240), c: '#ffffff', c2: '#ffe27a', sg: [[0, 0.5], [0.3, 1], [1, 0]], spin: [-5, 5], opt: true },
            { tex: 'star', burst: 16, delay: 0.1, life: [0.9, 1.4], size: [26, 42], speed: [150, 290], grav: [0, -260, 0], dir: cxDir(-0.6, 1, -0.6, 0.6, 1.5, 0.6), c: '#ff9ad0', c2: '#ffe27a', spin: [-5, 5], sg: [[0, 0.5], [0.2, 1], [1, 0]], at: [0, 70, 0] },
            cxWave('#ffe27a', 380, 0.7, 0), cxFlash('#fff0a0', 230, 0.35, 0, [0, 80, 0]),
        ] };
    },
    win_balloons() {
        const cols = [['#ff4d6d', '#ff8aa0'], ['#ffd23d', '#fff08a'], ['#4dd8ff', '#9fe8ff'], ['#7dff7a', '#c0ffb0'], ['#b06bff', '#d8b0ff']];
        /** @type {any[]} */
        const layers = cols.map(([a, b], i) => ({ tex: 'balloon', std: true, delay: i * 0.12, burst: 3, life: [2.5, 3], size: [48, 66], speed: [80, 150], grav: [0, 8, 0], dir: cxDir(-0.35, 1, -0.35, 0.35, 1.2, 0.35),
            c: a, c2: b, fade: [0.04, 0.82], spin: [-0.4, 0.4], box: cxBox(100, 0, 20, 90), sg: [[0, 0.4], [0.12, 1.05], [0.2, 1], [1, 1.1]], initRot: [-0.25, 0.25] }));
        layers.push({ tex: 'confetti', std: true, delay: 0.3, burst: 30, life: [1.5, 2.2], size: [9, 15], speed: [60, 220], grav: [0, -200, 0], dir: cxDir(-1, 0.8, -1, 1, 1.4, 1), c: '#ff8ad8', c2: '#4dd8ff', fade: [0.05, 0.8], spin: [-8, 8], initRot: [0, 6.28], at: [0, 60, 0], opt: true },
            cxWave('#ffe27a', 300, 0.6, 0));
        return { layers, snd: [cxSnd('equip', 0.5, 1.1, 0), cxSnd('tick', 0.4, 1.4, 0.4)] };
    },
    win_rainbow() { return { rainbow: true, snd: [cxSnd('shield', 0.5, 1.2, 0), cxSnd('buyOk', 0.5, 1, 0.5)], layers: [
        { tex: 'glint', rate: 70, delay: 0.3, duration: 1.7, life: [0.5, 1], size: [14, 26], speed: [10, 70], grav: [0, 20, 0], box: cxBox(230, 10, 220, 30), dir: CX_SPRAY, cg: CX_RAINBOW, sg: [[0, 0.5], [0.3, 1], [1, 0.1]], spin: [-5, 5], at: [0, 0, 0] },
        { tex: 'puff', std: true, burst: 8, delay: 0.1, life: [1.8, 2.4], size: [60, 90], speed: [4, 14], c: '#ffffff', c2: '#e6f4ff', a: 0.8, fade: [0.2, 0.6], sg: [[0, 0.4], [1, 1.5]], box: cxBox(30, 0, 30, 30), at: [-215, 20, 0] },
        { tex: 'puff', std: true, burst: 8, delay: 0.1, life: [1.8, 2.4], size: [60, 90], speed: [4, 14], c: '#ffffff', c2: '#e6f4ff', a: 0.8, fade: [0.2, 0.6], sg: [[0, 0.4], [1, 1.5]], box: cxBox(30, 0, 30, 30), at: [215, 20, 0] },
        { tex: 'star', burst: 14, delay: 0.5, life: [0.9, 1.5], size: [20, 34], speed: [60, 150], grav: [0, -80, 0], emitter: 'sphere', radius: 160, c: '#ffffff', c2: '#ffe27a', spin: [-3, 3], sg: [[0, 0.3], [0.3, 1], [1, 0]], at: [0, 200, 0], opt: true },
        cxWave('#ffffff', 400, 0.7, 0.1, 0.7),
    ] }; },
    win_lightning() {
        const strikes = [[-110, -60, 0.1], [130, 70, 0.55], [10, -140, 1], [-30, 100, 1.35]], layers = [], snd = [];
        layers.push({ tex: 'streak', stretch: true, rate: 140, duration: 1.8, life: [0.3, 0.45], size: [10, 14], speed: [600, 800], scaleY: [8, 12], box: cxBox(330, 300, 330, 260), dir: cxDir(-0.05, -1, -0.05, 0.05, -1, 0.05), c: '#a8d4ff', c2: '#d8ecff', a: 0.55, sg: [[0, 1], [1, 0.7]], opt: true });
        strikes.forEach(([x, z, t], i) => {
            layers.push({ tex: 'bolt', burst: 1, life: [0.26, 0.26], size: [330, 330], speed: [0, 0], delay: t, at: [x, 150, z], c: '#fff6c0', c2: '#fff6c0', sg: [[0, 0.8], [0.15, 1.05], [0.6, 1], [1, 0.9]], initRot: [i % 2 ? 0.08 : -0.08, i % 2 ? 0.08 : -0.08] });
            layers.push(cxFlash('#d8e8ff', 300, 0.3, t, [x, 40, z]));
            layers.push({ tex: 'burst', burst: 1, life: [0.3, 0.3], size: [120, 120], speed: [0, 0], delay: t, at: [x, 20, z], c: '#bfe8ff', sg: [[0, 0.5], [0.3, 1.1], [1, 0.8]], initRot: [0, 6.28] });
            layers.push({ tex: 'glint', burst: 16, life: [0.4, 0.8], size: [12, 22], speed: [120, 260], grav: [0, -380, 0], dir: cxDir(-1, 0.4, -1, 1, 1.4, 1), delay: t, at: [x, 14, z], c: '#fff6a0', c2: '#9fe0ff', sg: [[0, 0.6], [0.3, 1], [1, 0]], spin: [-6, 6] });
            layers.push({ ...cxWave('#bfe8ff', 220, 0.45, t), at: [x, 4, z] });
            snd.push(cxSnd('hit', 0.55, 0.7 + i * 0.08, t), cxSnd('bonk', 0.3, 0.8, t + 0.02));
        });
        return { layers, snd, shake: [0.1, 380, 0.007] };
    },
    win_snow() {
        return { snd: [cxSnd('shield', 0.3, 1.6, 0)], layers: [
            { tex: 'snow', std: true, rate: 36, duration: 2.1, life: [2, 2.6], size: [14, 26], speed: [30, 70], grav: [0, -20, 0], box: cxBox(300, 380, 420, 250), dir: cxDir(-0.35, -1, -0.35, 0.35, -0.7, 0.35),
                c: '#f2fbff', c2: '#bfe3ff', fade: [0.05, 0.8], spin: [-3, 3], initRot: [0, 6.28] },
            { tex: 'dot', rate: 22, duration: 2, life: [1.2, 1.8], size: [12, 20], speed: [10, 40], grav: [0, -30, 0], box: cxBox(300, 300, 400, 250), dir: cxDir(-0.3, -1, -0.3, 0.3, -0.7, 0.3), c: '#ffffff', a: 0.6, sg: [[0, 0.5], [0.2, 1], [1, 0.3]], opt: true },
            { tex: 'snow', std: true, burst: 14, life: [1, 1.6], size: [16, 28], speed: [80, 190], grav: [0, -120, 0], dir: cxDir(-1, 0.6, -1, 1, 1.4, 1), c: '#ffffff', c2: '#a8dcff', fade: [0.05, 0.8], spin: [-4, 4], initRot: [0, 6.28], at: [0, 90, 0] },
            cxWave('#bfe8ff', 360, 0.7, 0), cxFlash('#cfeaff', 200, 0.35, 0, [0, 80, 0]),
        ] };
    },
    win_bubbles() {
        return { snd: [cxSnd('decoy', 0.3, 1.8, 0), cxSnd('tick', 0.35, 1.8, 0.3)], layers: [
            { tex: 'bubble', rate: 20, duration: 1.7, life: [1.6, 2.4], size: [24, 62], speed: [40, 100], grav: [0, 18, 0], box: cxBox(160, 0, 30, 140), dir: cxDir(-0.3, 0.8, -0.3, 0.3, 1.3, 0.3), c: '#bfefff', c2: '#ffd6f5', a: 0.9,
                sg: [[0, 0.3], [0.1, 1], [0.9, 1.05], [1, 1.3]] },
            { tex: 'bubble', burst: 12, life: [1.4, 2.2], size: [34, 70], speed: [100, 200], grav: [0, 20, 0], dir: cxDir(-1, 0.4, -1, 1, 1.3, 1), c: '#ffe0f5', c2: '#bfefff', a: 0.9, sg: [[0, 0.3], [0.1, 1], [1, 1.2]], at: [0, 60, 0] },
            { tex: 'glint', rate: 24, delay: 0.2, duration: 1.5, life: [0.4, 0.8], size: [10, 18], speed: [20, 80], grav: [0, 40, 0], box: cxBox(160, 0, 200, 140), c: '#ffffff', c2: '#bfefff', sg: [[0, 0.5], [0.3, 1], [1, 0]], opt: true },
            cxWave('#bfefff', 340, 0.7, 0),
        ] };
    },
    win_flames() {
        return { snd: [cxSnd('whoosh', 0.55, 0.7, 0), cxSnd('hit', 0.35, 0.8, 0.1)], shake: [0.05, 240, 0.005], layers: [
            { tex: 'flame', std: true, rate: 120, duration: 1.7, life: [0.6, 1.05], size: [64, 110], speed: [200, 360], dir: cxDir(-0.07, 1, -0.07, 0.07, 1.2, 0.07), box: cxBox(30, 0, 6, 30), at: [0, 10, 0],
                cg: [[0, '#fff3b0', 0], [0.1, '#ffd23d', 0.95], [0.4, '#ff7a1f', 0.85], [0.8, '#d02a10', 0.4], [1, '#300400', 0]], sg: [[0, 0.5], [0.35, 1], [1, 0.4]], initRot: [-0.25, 0.25] },
            { tex: 'flame', std: true, rate: 50, duration: 1.7, life: [0.5, 0.9], size: [40, 70], speed: [60, 140], dir: cxDir(-0.8, 0.6, -0.8, 0.8, 1.2, 0.8), box: cxBox(40, 0, 6, 40), at: [0, 10, 0], opt: true,
                cg: [[0, '#ffd23d', 0], [0.15, '#ff9a2a', 0.9], [0.6, '#e03a10', 0.5], [1, '#200400', 0]], sg: [[0, 0.5], [0.3, 1], [1, 0.4]], initRot: [-0.25, 0.25] },
            { tex: 'glint', rate: 50, duration: 1.7, life: [0.8, 1.4], size: [10, 18], speed: [80, 200], grav: [0, 60, 0], dir: cxDir(-0.4, 1, -0.4, 0.4, 1.5, 0.4), box: cxBox(30, 0, 40, 30), c: '#ffb02e', c2: '#fff0a0', sg: [[0, 0.7], [0.3, 1], [1, 0]] },
            { tex: 'puff', std: true, delay: 0.3, rate: 22, duration: 1.5, life: [1, 1.5], size: [50, 90], speed: [20, 60], dir: cxDir(-0.3, 1, -0.3, 0.3, 1.4, 0.3), c: '#2a1a14', a: 0.5, fade: [0.15, 0.45], sg: [[0, 0.5], [1, 1.8]], at: [0, 230, 0], box: cxBox(30, 0, 20, 30), opt: true },
            cxFlash('#ffb04d', 300, 0.4, 0, [0, 100, 0]), cxWave('#ff7a1f', 400, 0.6, 0), cxWave('#ffd23d', 260, 0.5, 0.15),
        ] };
    },
    win_magic() {
        return { snd: [cxSnd('ghost', 0.55, 1.1, 0), cxSnd('shield', 0.35, 1.5, 0.3)], layers: [
            { tex: 'rune', flat: true, burst: 1, life: [1.4, 1.4], size: [30, 30], speed: [0, 0], spin: [2, 2], at: [0, 4, 0], sg: [[0, 0.5], [0.3, 12], [1, 13]], cg: [[0, '#d68bff', 0.95], [0.7, '#9b6bff', 0.7], [1, '#7d5bff', 0]] },
            { tex: 'rune', flat: true, delay: 0.2, burst: 1, life: [1.3, 1.3], size: [30, 30], speed: [0, 0], spin: [-3, -3], at: [0, 5, 0], sg: [[0, 0.5], [0.3, 8], [1, 9]], cg: [[0, '#ff8ae8', 0.9], [0.7, '#d68bff', 0.6], [1, '#d68bff', 0]] },
            { tex: 'glint', rate: 80, duration: 1.3, life: [0.9, 1.5], size: [12, 22], speed: [8, 24], grav: [0, 140, 0], emitter: 'ring', radius: 130, c: '#f0b0ff', c2: '#8fa8ff', sg: [[0, 0.5], [0.3, 1], [1, 0.1]], spin: [-5, 5], at: [0, 6, 0] },
            { tex: 'swirl', burst: 3, life: [1.3, 1.3], size: [200, 200], speed: [0, 0], spin: [3, 3], c: '#d68bff', c2: '#ff8ae8', a: 0.8, sg: [[0, 0.3], [0.3, 1], [1, 1.2]], at: [0, 90, 0] },
            { tex: 'star', burst: 12, delay: 0.3, life: [0.9, 1.4], size: [20, 34], speed: [60, 140], grav: [0, 60, 0], emitter: 'sphere', radius: 60, c: '#ffffff', c2: '#ff8ae8', spin: [-3, 3], sg: [[0, 0.3], [0.3, 1], [1, 0]], at: [0, 100, 0] },
            cxFlash('#d68bff', 280, 0.45, 0.1, [0, 90, 0]),
        ] };
    },
    win_bananas() {
        return { snd: [cxSnd('equip', 0.5, 1.4, 0), cxSnd('tick', 0.3, 1.2, 0.35)], layers: [
            { tex: 'banana', std: true, rate: 20, duration: 1.7, life: [1.5, 2], size: [30, 44], speed: [140, 240], grav: [0, -300, 0], box: cxBox(270, 400, 440, 230), dir: cxDir(-0.1, -1, -0.1, 0.1, -0.8, 0.1),
                c: '#ffe135', c2: '#ffd000', fade: [0.05, 0.85], spin: [-7, 7], initRot: [0, 6.28] },
            { tex: 'banana', std: true, burst: 8, life: [1, 1.6], size: [28, 40], speed: [220, 340], grav: [0, -480, 0], dir: cxDir(-0.5, 1, -0.5, 0.5, 1.4, 0.5), c: '#ffe135', c2: '#fff08a', fade: [0.05, 0.8], spin: [-8, 8], at: [0, 40, 0] },
            { tex: 'glint', rate: 36, duration: 1.8, life: [0.3, 0.6], size: [12, 20], speed: [20, 90], grav: [0, -100, 0], box: cxBox(270, 4, 30, 230), c: '#fff3a0', c2: '#ffffff', sg: [[0, 0.5], [0.3, 1], [1, 0]], spin: [-5, 5], opt: true },
            cxWave('#ffe135', 360, 0.6, 0), cxFlash('#fff08a', 200, 0.35, 0, [0, 70, 0]),
        ] };
    },
    win_disco() {
        const cols = ['#ff3d9a', '#3dd8ff', '#ffe93d', '#7dff5a', '#b06bff', '#ff7a3d', '#3dffb0', '#ff3d5e'];
        /** @type {any[]} */
        const layers = [];
        for (let i = 0; i < 8; i++) {
            const a = i * 2.4, r = 70 + (i % 3) * 55, x = Math.cos(a) * r, z = Math.sin(a) * r;
            layers.push({ tex: 'halo', flat: true, burst: 1, delay: 0.1 + i * 0.22, life: [0.7, 0.7], size: [30, 30], speed: [0, 0], at: [x, 3 + i * 0.1, z], sg: [[0, 0.5], [0.2, 6], [1, 5]], cg: [[0, cols[i], 0], [0.15, cols[i], 0.9], [1, cols[i], 0]] });
            layers.push({ tex: 'glint', burst: 8, delay: 0.1 + i * 0.22, life: [0.4, 0.8], size: [12, 22], speed: [60, 160], grav: [0, 60, 0], emitter: 'sphere', radius: 6, at: [x, 20, z], c: cols[i], c2: '#ffffff', sg: [[0, 0.5], [0.3, 1], [1, 0]], opt: i % 2 === 1 });
        }
        layers.push({ tex: 'disco', std: true, burst: 1, life: [2.5, 2.5], size: [96, 96], speed: [0, 0], c: '#ffffff', a: 1, fade: [0.08, 0.88], sg: [[0, 0.3], [0.1, 1.05], [0.16, 1], [1, 1]], at: [0, 310, 0], spin: [0.5, 0.5] },
            { tex: 'flash', burst: 1, life: [2.4, 2.4], size: [230, 230], speed: [0, 0], c: '#ffffff', a: 0.55, spin: [0.9, 0.9], sg: [[0, 0.3], [0.15, 1], [0.85, 1], [1, 0]], at: [0, 310, 0] },
            { tex: 'glint', rate: 60, duration: 2, life: [0.6, 1.1], size: [12, 22], speed: [60, 190], grav: [0, -140, 0], emitter: 'sphere', radius: 24, cg: CX_RAINBOW, sg: [[0, 0.6], [0.3, 1], [1, 0]], spin: [-6, 6], at: [0, 310, 0] },
            { tex: 'confetti', std: true, rate: 22, delay: 0.3, duration: 1.7, life: [1.2, 1.8], size: [9, 14], speed: [10, 60], grav: [0, -100, 0], box: cxBox(180, 320, 340, 160), c: '#ff4df0', c2: '#4dd8ff', fade: [0.05, 0.8], spin: [-8, 8], initRot: [0, 6.28], opt: true });
        return { layers, snd: [cxSnd('equip', 0.5, 1.2, 0), cxSnd('buyOk', 0.5, 1.1, 0.25), cxSnd('tick', 0.4, 1.3, 0.55), cxSnd('tick', 0.4, 1.5, 0.8)] };
    },
    win_ghosts() {
        return { snd: [cxSnd('ghost', 0.5, 0.8, 0)], layers: [
            { tex: 'ghost', std: true, burst: 8, life: [1.8, 2.4], size: [40, 62], speed: [60, 130], grav: [0, 34, 0], dir: cxDir(-1, 0.5, -1, 1, 1.2, 1), c: '#e8f0ff', c2: '#bfe9ff', a: 0.78, fade: [0.15, 0.6], spin: [-0.8, 0.8],
                sg: [[0, 0.3], [0.2, 1.05], [1, 1.25]], at: [0, 40, 0] },
            { tex: 'ghost', std: true, burst: 3, delay: 0.25, life: [1.6, 2.2], size: [60, 80], speed: [40, 90], grav: [0, 50, 0], dir: cxDir(-0.7, 0.8, -0.7, 0.7, 1.4, 0.7), c: '#d6ffe8', c2: '#bfe9ff', a: 0.6, fade: [0.15, 0.6], spin: [-0.5, 0.5],
                sg: [[0, 0.3], [0.2, 1.05], [1, 1.3]], at: [0, 60, 0], opt: true },
            { tex: 'puff', rate: 40, duration: 1.2, life: [1, 1.6], size: [50, 90], speed: [10, 40], dir: cxDir(-1, 0.1, -1, 1, 0.6, 1), c: '#7fffd4', c2: '#b8f0ff', a: 0.3, fade: [0.15, 0.4], sg: [[0, 0.5], [1, 1.5]], box: cxBox(60, 0, 10, 60), at: [0, 10, 0] },
            { tex: 'glint', rate: 36, duration: 1.4, life: [0.7, 1.3], size: [10, 18], speed: [20, 80], grav: [0, 50, 0], box: cxBox(120, 0, 120, 110), c: '#9bffd8', c2: '#ffffff', sg: [[0, 0.5], [0.3, 1], [1, 0]], opt: true },
            cxWave('#9bffd8', 360, 0.8, 0, 0.8), cxFlash('#9bffd8', 220, 0.4, 0, [0, 80, 0]),
        ] };
    },
    win_crown() {
        return { snd: [cxSnd('whoosh', 0.4, 1.2, 0), cxSnd('shield', 0.55, 1.3, 0.5), cxSnd('buyOk', 0.5, 1.2, 0.55)], layers: [
            { tex: 'crown', std: true, burst: 1, life: [0.5, 0.5], size: [96, 96], speed: [330, 330], dir: cxDir(0, -1, 0, 0, -1, 0), c: '#ffcf3a', a: 0.95, fade: [0.1, 1], sg: [[0, 0.5], [1, 1]], at: [0, 345, 0] },
            { tex: 'crown', std: true, delay: 0.5, burst: 1, life: [1.9, 1.9], size: [96, 96], speed: [0, 0], c: '#ffcf3a', a: 1, fade: [0.02, 0.85], sg: [[0, 1.2], [0.08, 0.95], [0.16, 1.03], [0.3, 1], [1, 1.05]], at: [0, 180, 0] },
            { tex: 'flash', delay: 0.5, burst: 1, life: [1.8, 1.8], size: [190, 190], speed: [0, 0], c: '#fff0a0', a: 0.3, spin: [0.8, 0.8], sg: [[0, 0.3], [0.15, 1.1], [0.8, 0.9], [1, 0]], at: [0, 190, 0] },
            { tex: 'glint', delay: 0.5, rate: 46, duration: 1.4, life: [0.6, 1.1], size: [12, 22], speed: [20, 90], grav: [0, 30, 0], box: cxBox(70, 150, 230, 70), c: '#ffe27a', c2: '#ffffff', sg: [[0, 0.5], [0.3, 1], [1, 0]], spin: [-5, 5] },
            { tex: 'confetti', std: true, delay: 0.5, burst: 40, life: [1.3, 2], size: [9, 15], speed: [120, 300], grav: [0, -260, 0], dir: cxDir(-1, 0.8, -1, 1, 1.5, 1), c: '#ffcf3a', c2: '#fff0a0', fade: [0.05, 0.8], spin: [-9, 9], initRot: [0, 6.28], at: [0, 190, 0] },
            { tex: 'star', delay: 0.5, burst: 10, life: [0.8, 1.3], size: [22, 36], speed: [90, 180], grav: [0, -40, 0], emitter: 'sphere', radius: 20, c: '#ffd23d', c2: '#ffffff', spin: [-3, 3], sg: [[0, 0.3], [0.3, 1], [1, 0]], at: [0, 190, 0], opt: true },
            cxWave('#ffd23d', 380, 0.7, 0.5),
        ] };
    },
    win_galaxy() {
        const cols = ['#ffffff', '#4dd8ff', '#ff4dd8', '#ffe14d'];
        return { snd: [cxSnd('shield', 0.6, 0.7, 0), cxSnd('hit', 0.5, 0.6, 0.05), cxSnd('buyOk', 0.5, 0.9, 0.3)], shake: [0.05, 320, 0.008], layers: [
            { tex: 'flash', burst: 1, life: [0.7, 0.7], size: [460, 460], speed: [0, 0], c: '#ffffff', a: 0.95, sg: [[0, 0.1], [0.15, 1.1], [1, 0]], at: [0, 100, 0] },
            { tex: 'dot', burst: 1, life: [0.6, 0.6], size: [120, 120], speed: [0, 0], c: '#ffffff', sg: [[0, 0.3], [0.2, 1.2], [1, 0]], at: [0, 100, 0] },
            ...cols.map((c, i) => cxWave(i ? c : '#c8b8ff', 560 + i * 80, 0.8 + i * 0.1, i * 0.12, 0.9)),
            { tex: 'glint', burst: 90, life: [1, 1.7], size: [14, 26], speed: [260, 460], grav: [0, -20, 0], emitter: 'sphere', radius: 6, cg: CX_RAINBOW, sg: [[0, 0.6], [0.3, 1], [1, 0.1]], spin: [-5, 5], at: [0, 100, 0] },
            { tex: 'star', burst: 24, life: [1, 1.6], size: [24, 40], speed: [150, 300], grav: [0, -30, 0], emitter: 'sphere', radius: 6, c: '#ffffff', c2: '#ffd0ff', spin: [-4, 4], sg: [[0, 0.3], [0.2, 1], [0.8, 0.8], [1, 0]], at: [0, 100, 0] },
            { tex: 'swirl', burst: 2, life: [1.4, 1.4], size: [300, 300], speed: [0, 0], c: '#9b7bff', c2: '#ff7ae8', a: 0.8, spin: [-2.5, -2.5], sg: [[0, 0.2], [0.3, 1], [1, 1.5]], at: [0, 100, 0] },
            { tex: 'puff', delay: 0.15, burst: 24, life: [1.2, 1.9], size: [80, 140], speed: [60, 180], emitter: 'sphere', radius: 10, c: '#5b2bd1', c2: '#ff4fd8', a: 0.4, fade: [0.15, 0.5], sg: [[0, 0.5], [1, 1.6]], at: [0, 100, 0] },
            { tex: 'star', delay: 0.6, rate: 28, duration: 1.2, life: [0.9, 1.4], size: [14, 26], speed: [10, 50], grav: [0, -40, 0], box: cxBox(240, 160, 330, 200), c: '#ffffff', c2: '#9fe8ff', spin: [-3, 3], sg: [[0, 0.2], [0.2, 1.1], [0.5, 0.5], [0.7, 1], [1, 0]], opt: true },
        ] };
    },
    win_pixels() {
        const cols = [['#4dff7a', '#b6ff4d'], ['#2fd0ff', '#4d8dff'], ['#ff4df0', '#ff8ad8'], ['#ffe14d', '#ff9a3d'], ['#ffffff', '#c0c8ff']];
        /** @type {any[]} */
        const layers = cols.map(([a, b], i) => ({ tex: 'pixel', std: true, delay: i * 0.03, burst: 20, life: [0.9, 1.5], size: [14, 24], speed: [200, 400], grav: [0, -520, 0], emitter: 'sphere', radius: 6, c: a, c2: b, fade: [0.03, 0.75], at: [0, 90, 0] }));
        layers.push({ tex: 'pixel', burst: 1, life: [0.35, 0.35], size: [210, 210], speed: [0, 0], c: '#ffffff', a: 0.8, sg: [[0, 0.3], [0.3, 1], [1, 1.2]], at: [0, 90, 0] },
            { tex: 'pixel', std: true, delay: 0.3, rate: 30, duration: 0.9, life: [0.8, 1.2], size: [10, 16], speed: [10, 40], grav: [0, -240, 0], box: cxBox(200, 300, 340, 180), dir: cxDir(-0.2, -1, -0.2, 0.2, -0.6, 0.2), c: '#4dff7a', c2: '#ff4df0', fade: [0.05, 0.75], opt: true },
            cxWave('#4dff9a', 340, 0.5, 0));
        return { layers, snd: [cxSnd('tick', 0.5, 1.8, 0), cxSnd('tick', 0.4, 2, 0.08), cxSnd('coin', 0.35, 1.5, 0.12)] };
    },
    win_candy() {
        const cols = [['#ff5fa8', '#ff9ac6'], ['#4dd8ff', '#9fe8ff'], ['#ffe14d', '#fff08a'], ['#b06bff', '#d8b0ff']];
        /** @type {any[]} */
        const layers = cols.map(([a, b], i) => ({ tex: 'candy', std: true, delay: i * 0.04, burst: 8, life: [1.4, 2], size: [28, 42], speed: [220, 420], grav: [0, -480, 0], dir: cxDir(-0.8, 1, -0.8, 0.8, 1.5, 0.8), c: a, c2: b, fade: [0.04, 0.8], spin: [-6, 6], initRot: [0, 6.28], at: [0, 60, 0] }));
        layers.push({ tex: 'confetti', std: true, burst: 30, life: [1.3, 2], size: [9, 14], speed: [160, 340], grav: [0, -300, 0], dir: cxDir(-1, 0.8, -1, 1, 1.5, 1), c: '#ff4d6d', c2: '#7dff7a', fade: [0.05, 0.8], spin: [-9, 9], initRot: [0, 6.28], at: [0, 60, 0], opt: true },
            { tex: 'glint', burst: 30, life: [0.6, 1.1], size: [14, 24], speed: [140, 300], grav: [0, -120, 0], emitter: 'sphere', radius: 8, c: '#ffffff', c2: '#ffd6f5', sg: [[0, 0.6], [0.3, 1], [1, 0]], spin: [-5, 5], at: [0, 80, 0] },
            { tex: 'star', burst: 8, life: [0.8, 1.2], size: [26, 40], speed: [100, 200], grav: [0, -100, 0], emitter: 'sphere', radius: 8, c: '#ffe14d', c2: '#ff8ad8', spin: [-4, 4], sg: [[0, 0.3], [0.3, 1], [1, 0]], at: [0, 80, 0], opt: true },
            cxFlash('#ff9ac6', 260, 0.35, 0, [0, 80, 0]), cxWave('#ff7ab8', 380, 0.6, 0), cxWave('#4dd8ff', 280, 0.5, 0.12));
        return { layers, snd: [cxSnd('buyOk', 0.5, 1.3, 0), cxSnd('equip', 0.4, 1.6, 0.1)] };
    },
    win_meteor(X) {
        const t0 = X.fx ? X.fx.clock : 0, dur = 0.7;
        const sx = 420, sy = 620, sz = 300, ix = 40, iz = 30;
        const at = (k) => { const e = Math.min(1, k); return { x: X.p.x + (sx + (ix - sx) * e), y: X.p.y + sy * (1 - e * e) + 20 * e, z: X.p.z + (sz + (iz - sz) * e) }; };
        const follow = () => at(((X.fx ? X.fx.clock : 0) - t0) / dur);
        return { snd: [cxSnd('whoosh', 0.6, 0.6, 0), cxSnd('hit', 0.8, 0.55, dur), cxSnd('bonk', 0.5, 0.7, dur + 0.02)], shake: [dur, 420, 0.014], layers: [
            { tex: 'flame', std: true, follow, rate: 150, duration: dur, life: [0.4, 0.7], size: [70, 110], speed: [0, 20], cg: [[0, '#fff0a0', 0], [0.1, '#ffd23d', 1], [0.4, '#ff7a1f', 0.85], [1, '#400800', 0]], sg: [[0, 0.7], [0.4, 1], [1, 0.4]], initRot: [-0.3, 0.3], box: cxBox(14, -14, 14, 14) },
            { tex: 'dot', follow, rate: 60, duration: dur, life: [0.2, 0.3], size: [90, 120], speed: [0, 0], c: '#ffffff', c2: '#ffd070', sg: [[0, 1], [1, 0.4]] },
            { tex: 'puff', std: true, follow, rate: 70, duration: dur, life: [0.8, 1.3], size: [50, 90], speed: [10, 40], c: '#3a2a22', c2: '#6a5448', a: 0.5, fade: [0.1, 0.4], sg: [[0, 0.5], [1, 1.8]], box: cxBox(16, -10, 16, 16), opt: true },
            { tex: 'glint', follow, rate: 80, duration: dur, life: [0.4, 0.8], size: [10, 18], speed: [20, 80], grav: [0, -100, 0], c: '#ffb02e', c2: '#fff0a0', sg: [[0, 0.7], [0.3, 1], [1, 0]], dir: CX_SPRAY, box: cxBox(18, -10, 18, 18) },
            // удар
            cxFlash('#fff6c0', 420, 0.5, dur, [ix, 70, iz]),
            { tex: 'dot', burst: 1, delay: dur, life: [0.5, 0.5], size: [150, 150], speed: [0, 0], c: '#ffffff', sg: [[0, 0.4], [0.2, 1.2], [1, 0]], at: [ix, 60, iz] },
            { ...cxWave('#ffffff', 700, 0.65, dur), at: [ix, 4, iz] }, { ...cxWave('#ffb040', 520, 0.8, dur + 0.1), at: [ix, 5, iz] },
            { tex: 'flame', std: true, burst: 14, delay: dur, life: [0.7, 1.2], size: [70, 120], speed: [60, 190], dir: cxDir(-1, 0.2, -1, 1, 1.2, 1), at: [ix, 20, iz], cg: [[0, '#fff0a0', 0], [0.1, '#ffd23d', 1], [0.45, '#ff7a1f', 0.8], [1, '#300400', 0]], sg: [[0, 0.5], [0.3, 1], [1, 0.5]], initRot: [-0.4, 0.4] },
            { tex: 'debris', std: true, burst: 26, delay: dur, life: [0.8, 1.4], size: [14, 28], speed: [220, 520], grav: [0, -900, 0], dir: cxDir(-1, 0.5, -1, 1, 1.6, 1), c: '#7a5a42', c2: '#c8a070', spin: [-9, 9], at: [ix, 20, iz] },
            { tex: 'glint', burst: 50, delay: dur, life: [0.7, 1.3], size: [16, 28], speed: [200, 480], grav: [0, -400, 0], dir: cxDir(-1, 0.4, -1, 1, 1.6, 1), c: '#ffb02e', c2: '#fff6c0', sg: [[0, 0.6], [0.3, 1], [1, 0]], spin: [-6, 6], at: [ix, 20, iz] },
            { tex: 'puff', std: true, burst: 16, delay: dur, life: [1.2, 1.8], size: [80, 150], speed: [30, 120], dir: cxDir(-1, 0.1, -1, 1, 0.7, 1), c: '#4a3a30', c2: '#8a7468', a: 0.55, fade: [0.12, 0.45], sg: [[0, 0.5], [1, 1.7]], at: [ix, 20, iz] },
        ] };
    },
};

// --- Окраска искателей-вариантов ---------------------------------------------------------------
// mix — доля цвета в материале, emi — свечение (emissive), spec — блик, sparks — частицы вокруг.
const CX_TINTS = {
    '#ffd23d': { mix: 0.7, emi: 0.2, spec: '#fff2a8', power: 18, sparks: [
        { tex: 'glint', rate: 10, life: [0.6, 1.1], size: [12, 22], speed: [4, 18], grav: [0, 24, 0], c: '#ffe27a', c2: '#ffffff', sg: [[0, 0.5], [0.3, 1], [1, 0]], spin: [-3, 3] }] },
    '#3dfff0': { mix: 0.62, emi: 0.55, spec: '#bfffff', power: 30, sparks: [
        { tex: 'glint', rate: 14, life: [0.6, 1.1], size: [12, 22], speed: [4, 20], grav: [0, 30, 0], c: '#00f0ff', c2: '#ff2bd6', sg: [[0, 0.5], [0.3, 1], [1, 0]], spin: [-4, 4] },
        { tex: 'dot', rate: 6, life: [0.8, 1.3], size: [26, 44], speed: [2, 10], c: '#00f0ff', a: 0.28, sg: [[0, 0.5], [0.4, 1], [1, 0.4]], opt: true }] },
    '#9fe8ff': { mix: 0.55, emi: 0.38, spec: '#ffffff', power: 64, sparks: [
        { tex: 'star', rate: 8, life: [0.6, 1.1], size: [12, 22], speed: [4, 16], grav: [0, 24, 0], c: '#ffffff', c2: '#9fe8ff', spin: [-3, 3], sg: [[0, 0.2], [0.2, 1.1], [0.5, 0.5], [0.7, 1], [1, 0]] },
        { tex: 'glint', rate: 12, life: [0.5, 1], size: [10, 18], speed: [4, 18], grav: [0, 20, 0], c: '#c8f4ff', c2: '#ffffff', sg: [[0, 0.5], [0.3, 1], [1, 0]], spin: [-5, 5], opt: true }] },
    '#5b3d9e': { mix: 0.72, emi: 0.12, spec: '#a888ff', power: 12, sparks: [
        { tex: 'puff', std: true, rate: 9, life: [0.9, 1.4], size: [40, 66], speed: [4, 14], grav: [0, 24, 0], c: '#1b0f2e', c2: '#3b1d6e', a: 0.45, fade: [0.15, 0.4], sg: [[0, 0.5], [1, 1.7]], spin: [-0.6, 0.6] },
        { tex: 'glint', rate: 6, life: [0.6, 1], size: [10, 16], speed: [4, 14], grav: [0, 30, 0], c: '#b07bff', c2: '#ffffff', sg: [[0, 0.5], [0.3, 1], [1, 0]], opt: true }] },
    '#ff5a1f': { mix: 0.7, emi: 0.5, spec: '#ffb070', power: 20, sparks: [
        { tex: 'flame', std: true, rate: 14, life: [0.45, 0.8], size: [34, 56], speed: [4, 16], grav: [0, 50, 0], dir: cxDir(-0.3, 0.8, -0.3, 0.3, 1.4, 0.3), cg: [[0, '#fff0a0', 0], [0.15, '#ffd23d', 0.85], [0.5, '#ff7a1f', 0.65], [1, '#a01808', 0]], sg: [[0, 0.5], [0.3, 1], [1, 0.3]], initRot: [-0.3, 0.3] },
        { tex: 'glint', rate: 14, life: [0.6, 1.2], size: [8, 14], speed: [10, 40], grav: [0, 60, 0], c: '#ffb02e', c2: '#fff0a0', sg: [[0, 0.7], [0.3, 1], [1, 0]] }] },
    '#bfe9ff': { mix: 0.6, emi: 0.28, spec: '#ffffff', power: 40, sparks: [
        { tex: 'snow', std: true, rate: 7, life: [1, 1.6], size: [12, 20], speed: [4, 14], grav: [0, 8, 0], c: '#f2fbff', c2: '#a8dcff', fade: [0.1, 0.65], spin: [-2, 2], initRot: [0, 6.28] },
        { tex: 'glint', rate: 10, life: [0.5, 1], size: [10, 16], speed: [4, 18], grav: [0, 20, 0], c: '#9fe4ff', c2: '#ffffff', sg: [[0, 0.5], [0.3, 1], [1, 0]], opt: true }] },
};

/** @satisfies {Record<string, any>} */
const GameCosmetics = {
    /** @type {Array<{ age: number, fn: (age: number, dt: number) => any, end?: () => void }>} */
    _tasks: [],
    _hooked: false,

    // --- Служебное ------------------------------------------------------------------------------

    _app() { return (typeof window !== 'undefined' && window.app) || (typeof GameFX !== 'undefined' ? GameFX.app : null) || null; },
    _fx() { const a = this._app(); return a && a.fx ? a.fx : null; },
    get _lite() { return (typeof IS_MOBILE !== 'undefined' && IS_MOBILE) || (typeof Quality !== 'undefined' && Quality.level === 0); },

    _ground(x, y) {
        const a = this._app(), t = a && a.location && a.location.terrain;
        return t ? t.heightAt(x, y) : 0;
    },
    // pos карты { x, y, h } -> Babylon { x, y, z }
    _pt(pos, dy) {
        const x = Number(pos && pos.x) || 0, y = Number(pos && pos.y) || 0;
        const h = pos && Number.isFinite(pos.h) ? pos.h : this._ground(x, y);
        return { x, y: h + (dy || 0), z: y };
    },

    // Раз на сессию: задачи эффектов идут по игровому времени (пауза замораживает).
    _hook() {
        if (this._hooked) return;
        const a = this._app();
        if (!a || typeof a.onUpdate !== 'function') return;
        this._hooked = true;
        a.onUpdate(dt => this._tick(dt));
    },
    _tick(dt) {
        if (!this._tasks.length) return;
        for (const t of this._tasks.slice()) {
            t.age += dt;
            let r = true;
            try { r = t.fn(t.age, dt); } catch (e) { console.warn('GameCosmetics:', e); r = false; }
            if (r === false) {
                this._tasks.splice(this._tasks.indexOf(t), 1);
                if (t.end) { try { t.end(); } catch (e) { /* уже снят */ } }
            }
        }
    },
    _task(fn, end) {
        this._hook();
        const t = { age: 0, fn, end };
        this._tasks.push(t);
        return () => { const i = this._tasks.indexOf(t); if (i >= 0) { this._tasks.splice(i, 1); if (end) { try { end(); } catch (e) { /* уже снят */ } } } };
    },

    _sound(list, opts) {
        if (typeof GameFX !== 'undefined' && GameFX._snd) return GameFX._snd(list, opts);
        return null;
    },

    // --- Слои частиц ----------------------------------------------------------------------------

    // Слой (формат CX_*) -> параметры ParticleFX.create
    _opts(L, pos) {
        const o = {
            texture: CX_TEX[L.tex], rate: L.rate, burst: L.burst, delay: L.delay, duration: L.duration, life: L.life, size: L.size, speed: L.speed, spin: L.spin,
            gravity: L.grav, direction: L.dir, box: L.box, color: L.c, color2: L.c2, alpha: L.a, sizeGradient: L.sg, colorGradient: L.cg,
            follow: L.follow, blend: L.std || (!L.add && CX_STD_TEX.has(L.tex)) ? 'standard' : undefined, position: pos,
        };
        if (L.flat) { o.speed = [0.01, 0.01]; o.direction = [[0, 1, 0], [0, 1, 0]]; }
        o.capacity = cxCap(L);
        return o;
    },

    // Особенности слоя, которых нет в ParticleFX.create
    _tune(ps, L) {
        if (L.flat) ps.isBillboardBased = false;
        if (L.stretch) ps.billboardMode = BABYLON.ParticleSystem.BILLBOARDMODE_STRETCHED;
        if (L.scaleY) { ps.minScaleY = L.scaleY[0]; ps.maxScaleY = L.scaleY[1]; }
        if (L.initRot) { ps.minInitialRotation = L.initRot[0]; ps.maxInitialRotation = L.initRot[1]; }
        if (L.emitter === 'sphere') ps.createSphereEmitter(L.radius || 10, 1);
        else if (L.emitter === 'hemi') ps.createHemisphericEmitter(L.radius || 10, 1);
        else if (L.emitter === 'ring') ps.createCylinderEmitter(L.radius || 40, 0.01, 0, 0);
        if (L.fade && !L.cg) {
            // плавный вход и спад при случайном цвете c..c2 (градиент по жизни сам выбирает цвет между двумя)
            const a = L.a == null ? 1 : L.a;
            const c1 = BABYLON.Color3.FromHexString(L.c || '#ffffff'), c2 = BABYLON.Color3.FromHexString(L.c2 || L.c || '#ffffff');
            const col = (c, al) => new BABYLON.Color4(c.r, c.g, c.b, al);
            const [f0, f1] = L.fade;
            ps.addColorGradient(0, col(c1, 0), col(c2, 0));
            ps.addColorGradient(f0, col(c1, a), col(c2, a));
            ps.addColorGradient(f1, col(c1, a), col(c2, a));
            ps.addColorGradient(1, col(c1, 0), col(c2, 0));
        }
    },

    /** Один слой -> handle ParticleFX | null. pos — Babylon { x, y, z } (без follow). */
    _layer(L, pos) {
        const fx = this._fx();
        if (!fx || (L.opt && this._lite)) return null;
        let h = null;
        try { h = fx.create(this._opts(L, pos)); } catch (e) { console.warn('GameCosmetics: слой не создан', e); }
        if (!h) return null;
        try { this._tune(h.system, L); } catch (e) { console.warn('GameCosmetics: слой не настроен', e); }
        return h;
    },

    /** Слои вокруг точки p (Babylon); at в слое — смещение. -> { handles, stop, dispose } */
    _group(layers, p) {
        const handles = [];
        for (const L of layers) {
            const pos = L.at ? { x: p.x + L.at[0], y: p.y + L.at[1], z: p.z + L.at[2] } : p;
            const h = this._layer(L, L.follow ? p : pos);
            if (h) handles.push(h);
        }
        return {
            handles,
            stop() { for (const h of handles) h.stop(); },
            dispose() { for (const h of handles) h.dispose(); },
        };
    },

    // --- Следы ----------------------------------------------------------------------------------

    trail(id, target) {
        const fx = this._fx(), layers = CX_TRAILS[id];
        if (!fx || !layers || typeof target !== 'function') return { stop() {} };
        const st = { t: -1, x: 0, y: 0, z: 0, px: null, pz: null, dx: 0, dz: 1, run: 0, gone: false, stopped: false };
        const handles = [];
        const sample = () => {
            const now = fx.clock;
            if (st.t === now) return;
            const dt = st.t < 0 ? 0.016 : Math.max(0.001, now - st.t);
            st.t = now;
            let p = null;
            try { p = target(); } catch (e) { p = null; }
            if (!p || !Number.isFinite(p.x)) { st.gone = true; return; }
            const x = p.x, z = p.y, y = Number.isFinite(p.h) ? p.h : this._ground(x, z);
            if (st.px != null) {
                const vx = x - st.px, vz = z - st.pz, d = Math.hypot(vx, vz);
                if (d > 0.4) {
                    st.dx += (vx / d - st.dx) * 0.35; st.dz += (vz / d - st.dz) * 0.35;
                    const n = Math.hypot(st.dx, st.dz) || 1; st.dx /= n; st.dz /= n;
                }
            }
            st.px = x; st.pz = z; st.x = x; st.y = y; st.z = z;
            const speed = Number(p.speed) || 0;
            const want = speed > 60 ? Math.min(1.3, 0.55 + speed / 450) : 0.07;
            st.run += (want - st.run) * Math.min(1, dt * 10);
        };
        for (const L of layers) {
            if (L.opt && this._lite) continue;
            let h = null;
            const follow = () => {
                sample();
                if (st.gone || st.stopped) { if (st.gone && !st.stopped) { st.stopped = true; handles.forEach(q => q.stop()); } return null; }
                if (h) h.setRate(L.rate * st.run);
                const side = L.side || 0;
                return { x: st.x - st.dz * side, y: st.y + (L.dy || 0), z: st.z + st.dx * side };
            };
            h = this._layer({ ...L, size: L.size.map(v => v * CX_TRAIL_K), follow, cap: cxCap(L), rate: L.rate * 0.07 }, { x: 0, y: -9999, z: 0 });
            if (h) handles.push(h);
        }
        return { stop() { st.stopped = true; handles.forEach(h => h.stop()); } };
    },

    // --- Ауры -----------------------------------------------------------------------------------

    _auraTexture(scene, spec) {
        const S = this._lite ? 128 : 256;
        const tex = new BABYLON.DynamicTexture('aura-' + spec.draw, { width: S, height: S }, scene, true);
        const ctx = tex.getContext();
        ctx.clearRect(0, 0, S, S);
        const paint = CX_PAINT[spec.draw] || CX_PAINT.ring;
        paint(ctx, S, spec);
        tex.hasAlpha = true;
        tex.wrapU = BABYLON.Texture.CLAMP_ADDRESSMODE; tex.wrapV = BABYLON.Texture.CLAMP_ADDRESSMODE;
        tex.update(true);
        return tex;
    },

    aura(id, view, getPos) {
        const def = CX_AURAS[id] || CX_AURAS.aura_basic;
        const app = this._app();
        const scene = (view && view.scene) || (app && app.location && app.location.view && app.location.view.scene);
        if (!scene || typeof getPos !== 'function') return { update(dt) {}, stop() {} };
        const group = (typeof World3D !== 'undefined' && World3D.LAYER && World3D.LAYER.OVERLAY !== undefined) ? World3D.LAYER.OVERLAY : 1;
        const K = CX_AURA_PLAIN.includes(id) ? 1 : 1.3;   // простые кольца — как HsGroundRing; знаки крупнее, чтобы читались
        const parts = def.m.map((spec, i) => {
            const tex = this._auraTexture(scene, spec);
            const size = spec.size * K;
            const mesh = BABYLON.MeshBuilder.CreateGround('aura-' + id + '-' + i, { width: size, height: size, subdivisions: 1 }, scene);
            const mat = new BABYLON.StandardMaterial('aura-mat-' + id + '-' + i, scene);
            mat.disableLighting = true;
            mat.diffuseColor = new BABYLON.Color3(0, 0, 0);
            mat.specularColor = new BABYLON.Color3(0, 0, 0);
            mat.emissiveTexture = tex;
            mat.opacityTexture = tex;
            mat.backFaceCulling = false;
            mat.zOffset = -3;
            if (spec.alpha) mat.alpha = spec.alpha;
            mat.metadata = { toon: false };
            mesh.material = mat;
            mesh.isPickable = false;
            mesh.renderingGroupId = group;
            mesh.alwaysSelectAsActiveMesh = true;
            return { spec, mesh, mat, tex, phase: i * 1.7 };
        });
        let pos = null, t = 0, stopped = false, last = null;
        const read = () => { let p = null; try { p = getPos(); } catch (e) { p = null; } if (p && Number.isFinite(p.x)) last = p; return last; };
        let fxGroup = null;
        if (def.p) {
            fxGroup = this._group(def.p.map(L => ({ ...L, radius: (L.radius || 0) * K, size: L.size && L.size.map(v => v * (K > 1 ? 1.2 : 1)), grav: L.grav && [L.grav[0], L.grav[1] * 2.5, L.grav[2]], follow: () => {
                const p = read();
                return p && !stopped ? this._pt(p, 4 + (L.dy || 0)) : null;
            } })), { x: 0, y: -9999, z: 0 });
        }
        const place = () => {
            pos = read();
            if (!pos) return;
            const cam = app && app.camera, az = cam && Number.isFinite(cam.azimuth) ? cam.azimuth : -Math.PI / 2;
            const h = Number.isFinite(pos.h) ? pos.h : this._ground(pos.x, pos.y);
            for (const q of parts) {
                const s = q.spec;
                const pulse = 1 + Math.sin(t * 4 + q.phase) * (s.pulse || 0);
                let flick = 1;
                if (s.flicker) flick = 0.94 + 0.12 * Math.abs(Math.sin(t * s.flicker + q.phase * 5));
                q.mesh.position.set(pos.x, h + 3 + (s.y || 0) * 0.5, pos.y);
                q.mesh.scaling.set(pulse * flick, 1, pulse * flick);
                q.mesh.rotation.y = s.up ? -az + Math.PI / 2 : t * (s.spin || 0) + q.phase;
            }
        };
        place();
        return {
            update(dt) {
                if (stopped) return;
                t += dt || 0;
                place();
            },
            setVisible(on) { for (const q of parts) q.mesh.setEnabled(!!on); },
            stop() {
                if (stopped) return;
                stopped = true;
                if (fxGroup) fxGroup.stop();
                for (const q of parts) q.mesh.dispose(false, true);
                parts.length = 0;
            },
        };
    },

    // --- Эффекты победы -------------------------------------------------------------------------

    emote(id, pos) {
        const fx = this._fx();
        const make = CX_EMOTES[id] || CX_EMOTES.win_confetti;
        if (!fx) return { stop() {} };
        const p = this._pt(pos, 0);
        const def = make({ p, fx, gc: this });
        const grp = this._group((def.layers || []).map(L => (L.flat || !L.size ? L : { ...L, size: L.size.map(v => v * CX_EMOTE_K) })), p);
        const stops = [];
        for (const [key, vol, rate, delay] of def.snd || []) {
            const play = () => this._sound(CX_SND[key], { volume: vol, rate });
            if (delay > 0) stops.push(this._task(age => { if (age >= delay) { play(); return false; } return true; })); else play();
        }
        if (def.shake && typeof GameFX !== 'undefined' && GameFX._shake) {
            const [delay, ms, power] = def.shake;
            stops.push(this._task(age => { if (age >= delay) { GameFX._shake(pos, ms, power); return false; } return true; }));
        }
        if (def.rainbow) stops.push(this._rainbow(p));
        return { stop() { grp.stop(); stops.forEach(s => s()); } };
    },

    // Радуга-арка за героем: семь труб, лицом к камере (billboard по Y), вырастает, держится, гаснет. ~2.6 с.
    _rainbow(p) {
        const app = this._app(), scene = app && app.location && app.location.view && app.location.view.scene;
        if (!scene) return () => {};
        const group = (typeof World3D !== 'undefined' && World3D.LAYER && World3D.LAYER.OVERLAY !== undefined) ? World3D.LAYER.OVERLAY : 1;
        const cols = ['#ff3d5e', '#ff9a3d', '#ffe93d', '#4dff7a', '#3dc8ff', '#7a5bff', '#d84dff'];
        const root = new BABYLON.TransformNode('rainbow-root', scene);
        root.position.set(p.x, p.y, p.z);
        root.billboardMode = BABYLON.AbstractMesh.BILLBOARDMODE_Y;
        const meshes = [], mats = [];
        cols.forEach((c, i) => {
            const R = 235 - i * 13, path = [];
            for (let k = 0; k <= 32; k++) { const a = Math.PI * k / 32; path.push(new BABYLON.Vector3(Math.cos(a) * R, Math.sin(a) * R * 0.78, 0)); }
            const tube = BABYLON.MeshBuilder.CreateTube('rainbow-' + i, { path, radius: 7.5, tessellation: 8, cap: BABYLON.Mesh.CAP_ALL }, scene);
            const mat = new BABYLON.StandardMaterial('rainbow-mat-' + i, scene);
            mat.disableLighting = true; mat.emissiveColor = BABYLON.Color3.FromHexString(c); mat.diffuseColor = new BABYLON.Color3(0, 0, 0); mat.specularColor = new BABYLON.Color3(0, 0, 0);
            mat.metadata = { toon: false };
            tube.material = mat; tube.isPickable = false; tube.renderingGroupId = group; tube.parent = root;
            tube.alwaysSelectAsActiveMesh = true;
            meshes.push(tube); mats.push(mat);
        });
        const total = 2.7;
        return this._task(age => {
            const grow = Math.min(1, age / 0.55), ease = 1 - Math.pow(1 - grow, 3);
            const fade = age > total - 0.7 ? Math.max(0, (total - age) / 0.7) : 1;
            meshes.forEach((m, i) => {
                const k = Math.min(1, Math.max(0, (age - i * 0.04) / 0.55));
                m.scaling.set(1, 0.05 + 0.95 * (1 - Math.pow(1 - k, 3)), 1);
                m.visibility = fade * Math.min(1, 0.2 + ease);
            });
            return age < total;
        }, () => { meshes.forEach(m => m.dispose()); mats.forEach(m => m.dispose()); root.dispose(); });
    },

    // --- Окраска искателя -----------------------------------------------------------------------

    tint(root, hex) {
        if (!root || !hex || typeof BABYLON === 'undefined') return { stop() {} };
        const key = String(hex).toLowerCase();
        const style = CX_TINTS[key] || { mix: 0.6, emi: 0.25, spec: '#ffffff', power: 24, sparks: [
            { tex: 'glint', rate: 8, life: [0.6, 1.1], size: [12, 20], speed: [4, 18], grav: [0, 24, 0], c: hex, c2: '#ffffff', sg: [[0, 0.5], [0.3, 1], [1, 0]], spin: [-3, 3] }] };
        const prev = root.metadata && root.metadata.cosmeticTint;
        if (prev && typeof prev.stop === 'function') prev.stop();
        const color = BABYLON.Color3.FromHexString(key);
        const spec = BABYLON.Color3.FromHexString(style.spec);
        const clones = new Map();
        const paint = (mat) => {
            if (!mat) return mat;
            if (clones.has(mat)) return clones.get(mat);
            let c = null;
            if (mat.subMaterials) {
                c = mat.clone(mat.name + '-tint', false);
                if (c) c.subMaterials = mat.subMaterials.map(sm => paint(sm));
            } else {
                c = mat.clone(mat.name + '-tint');
                if (c) {
                    const base = c.diffuseColor || new BABYLON.Color3(1, 1, 1);
                    c.diffuseColor = BABYLON.Color3.Lerp(base, color, style.mix);
                    c.emissiveColor = (c.emissiveColor || BABYLON.Color3.Black()).add(color.scale(style.emi));
                    c.specularColor = spec.scale(0.85);
                    c.specularPower = style.power;
                }
            }
            clones.set(mat, c || mat);
            return c || mat;
        };
        const meshes = [root].concat(root.getChildMeshes ? root.getChildMeshes(false) : []);
        for (const m of meshes) { if (m.material) m.material = paint(m.material); }
        // искры вокруг фигуры: одни системы на весь вариант, следуют за корнем модели
        const h = this._sparks(root, style.sparks);
        const handle = { stop() { h.stop(); } };
        root.metadata = Object.assign(root.metadata || {}, { cosmeticTint: handle });
        return handle;
    },

    _sparks(root, layers) {
        const fx = this._fx();
        if (!fx || !layers || !layers.length) return { stop() {} };
        let stopped = false;
        const follow = () => {
            if (stopped) return null;
            if (typeof root.isDisposed === 'function' && root.isDisposed()) { stopped = true; handles.forEach(q => q.stop()); return null; }
            return root.getAbsolutePosition();
        };
        const handles = [];
        for (const L of layers) {
            const h = this._layer({ ...L, follow, box: L.box || cxBox(50, 30, 190, 40) }, { x: 0, y: -9999, z: 0 });
            if (h) handles.push(h);
        }
        return { stop() { stopped = true; handles.forEach(h => h.stop()); } };
    },
};
