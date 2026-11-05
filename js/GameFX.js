// GameFX.js — эффекты и звук «Steal n Hide a Brainrot»: частицы (app.fx = ParticleFX), звуки, музыка.
// Контракт (docs/GAME-SPEC.md, раздел GameFX); вызывает Game. pos — { x, y, h } в px карты:
// Babylon (x, h, y); нет h — высота земли в точке. Всё безопасно до init и без app.fx (тихо ничего не делает).
//
//   GameFX.init(app)                 один раз в Game.init; прогрев шейдеров сделает сам, когда снимется загрузка
//   GameFX.coin(pos)                 золотые искры + звёздочка + кольцо; серия монет подряд — звук выше
//   GameFX.orb(pos, kind)            вспышка сферы-бонуса: 'dash' голубая/жёлтая, 'ghost' фиолетовая
//   GameFX.dash(actor)               рывок: пыль назад, спидлайны, голубой след 0.35 с за actor ({ x, y, h, heading } —
//                                    геттеры; курс — радианы, вперёд = (cos, sin) по карте) -> { stop() }
//   GameFX.decoy(pos)                фиолетовый пуф, искры, голограммные кубики
//   GameFX.spotted(pos)              красная вспышка и «!» над головой (pos — ноги персонажа, поднимается сам)
//   GameFX.caught(pos)               удар: вспышка, звёзды, щепки, пыль, ударная волна, тряска камеры
//   GameFX.shield(pos)               голубой купол и руна
//   GameFX.swing(pos)                замах искателя: свист сразу, удар о землю через 0.14 с (пыль, искры-трещины)
//   GameFX.footDust(pos)             пыль и тихий шаг; одна постоянная система, частота ограничена внутри
//   GameFX.skinAura(target, rarity)  непрерывная аура: rare/epic/legendary/mythic -> { stop() }; target —
//                                    mesh Babylon, { x, y, h } карты, { x, y, z } Babylon или функция, их возвращающая
//   GameFX.win() / lose()            конфетти и фанфары / грустный звук
//   GameFX.sfx(name)                 'click' | 'buy' | 'equip' | 'error' | 'tick' | 'go' | 'whoosh' | 'alarm', сбор и база:
//                                    'pickup-tick' (тихий тик подбора; подряд идущие поднимаются по высоте) |
//                                    'pickup-done' | 'pickup-rare' (брейнрот собран / редкий, мутация) | 'cash' (забрал деньги
//                                    на базе) | 'place' (поставил на постамент) | 'sell' | 'codex' (открыл кодекс / новая запись)
//   GameFX.music(kind)               'menu' | 'game' | 'chase' | 'base' | null — плавная смена; настройки Game.save.settings
//
// Звуки — Kenney и Juhani Junkala (CC0): выбраны в Sound Pack, обрезаны, выровнены по громкости и перекодированы
// tools/music/sfx_build.py, список — assets/ASSET-SOURCES.json; свисток старта синтезируется здесь же. Музыка — своя, четыре
// бесшовных цикла (мандолина, аккордеон, пиццикато, бит, вокальные синт-слоги): tools/music/compose_steal.py.
// Спрайты частиц — Kenney Particle Pack (CC0, перекодированы в WebP) и несколько форм, нарисованных здесь же.
// Числа размеров — px мира (рост героя ~150).

const GFX_TEX = {
    glint: 'assets/fx/glint.webp',      // четырёхлучевая искра
    star: 'assets/fx/star.webp',        // пятиконечная звезда
    ring: 'assets/fx/ring.webp',        // тонкое кольцо
    puff: 'assets/fx/puff.webp',        // клуб пыли
    debris: 'assets/fx/debris.webp',    // россыпь щепок и камешков
    streak: 'assets/fx/streak.webp',    // вертикальная светящаяся черта (спидлайн)
    flash: 'assets/fx/flash.webp',      // лучистая вспышка
    dot: 'assets/fx/dot.webp',          // мягкая точка
    rune: 'assets/fx/rune.webp',        // круг с остриями
    halo: 'assets/fx/halo.webp',        // светящееся кольцо-купол
    confetti: 'assets/fx/confetti.webp', // прямоугольник конфетти
    alert: 'assets/fx/alert.webp',      // восклицательный знак с чёрной обводкой
};

// Варианты частых звуков — массивы литералов (Sound.play берёт случайный без повтора подряд).
const GFX_SND = {
    coin: ['assets/sounds/coin-1.ogg', 'assets/sounds/coin-2.ogg', 'assets/sounds/coin-3.ogg'],
    orbDash: ['assets/sounds/orb-dash.ogg'],
    orbGhost: ['assets/sounds/orb-ghost.ogg'],
    whoosh: ['assets/sounds/whoosh-1.ogg', 'assets/sounds/whoosh-2.ogg', 'assets/sounds/whoosh-3.ogg'],
    decoy: ['assets/sounds/decoy-1.ogg'],
    decoyTail: ['assets/sounds/decoy-2.ogg'],
    alarm: ['assets/sounds/alarm.ogg'],
    hit: ['assets/sounds/hit-1.ogg', 'assets/sounds/hit-2.ogg'],
    bonk: ['assets/sounds/bonk.ogg'],
    oof: ['assets/sounds/oof-1.ogg', 'assets/sounds/oof-2.ogg', 'assets/sounds/oof-3.ogg'],
    shield: ['assets/sounds/shield.ogg'],
    swish: ['assets/sounds/swing-swish.ogg'],
    thud: ['assets/sounds/swing-thud.ogg'],
    step: ['assets/sounds/step-1.ogg', 'assets/sounds/step-2.ogg', 'assets/sounds/step-3.ogg', 'assets/sounds/step-4.ogg'],
    click: ['assets/sounds/click.ogg'],
    buy: ['assets/sounds/buy.ogg'],
    buyOk: ['assets/sounds/buy-ok.ogg'],
    equip: ['assets/sounds/equip.ogg'],
    equipCloth: ['assets/sounds/equip-cloth.ogg'],
    error: ['assets/sounds/error.ogg'],
    tick: ['assets/sounds/tick.ogg'],
    win: ['assets/sounds/win.ogg'],
    lose: ['assets/sounds/lose.ogg'],
    // сбор брейнротов и база
    pickupTick: ['assets/sounds/pickup-tick.ogg'],
    pickupDone: ['assets/sounds/pickup-done.ogg'],
    pickupRare: ['assets/sounds/pickup-rare.ogg'],
    cash: ['assets/sounds/cash.ogg'],
    cashChips: ['assets/sounds/cash-chips.ogg'],
    place: ['assets/sounds/place-1.ogg', 'assets/sounds/place-2.ogg', 'assets/sounds/place-3.ogg'],
    sell: ['assets/sounds/sell.ogg'],
    sellChips: ['assets/sounds/sell-chips.ogg'],
    codex: ['assets/sounds/codex.ogg'],
    codexPage: ['assets/sounds/codex-page.ogg'],
};

const GFX_MUSIC = {
    menu: 'assets/sounds/music-menu.ogg',
    game: 'assets/sounds/music-game.ogg',
    chase: 'assets/sounds/music-chase.ogg',
    base: 'assets/sounds/music-base.ogg',
};
const GFX_MUSIC_VOLUME = { menu: 0.9, game: 0.7, chase: 0.8, base: 0.75 };
const GFX_CHASE_TEMPO = 1;       // 1 — погоня в своём темпе (трек уже быстрый); больше — быстрее и выше тоном
const GFX_HEAD = 175;              // высота «над головой» у spotted, px над pos
const GFX_SCALE = 1.5;            // общий множитель размеров частиц (спрайты Kenney с широкими полями — на экране мельче, чем кажется)
const GFX_SPEED = 1.2;            // и скоростей
const GFX_NO_HANDLE = { stop() {}, dispose() {} };

// Палитры бонусов: a — основной цвет, b — акцент.
const GFX_ORB = {
    dash: { a: '#35c8ff', b: '#ffe14d' },
    ghost: { a: '#a24dff', b: '#e8b8ff' },
};
const GFX_CONFETTI = ['#ff4d6d', '#ffd23d', '#4dd8ff', '#7dff7a', '#b06bff'];
const GFX_RAINBOW = [[0, '#ff4d6d', 1], [0.2, '#ffa94d', 1], [0.4, '#ffe14d', 1], [0.6, '#4dff88', 0.9], [0.8, '#4dc9ff', 0.7], [1, '#b06bff', 0]];

/** @satisfies {Record<string, any>} */
const GameFX = {
    /** @type {LoryApp | null} */
    app: null,
    _inited: false,
    _warmed: false,
    _silent: false,         // прогрев: без звука, тряски и отложенных вызовов
    /** @type {{ t: number, fn: () => void }[]} */
    _later: [],
    _clock: 0,
    _musicKind: null,
    _musicUrl: null,
    _comboAt: 0,
    _combo: 0,
    _tickAt: 0,             // pickup-tick: время и номер тика в серии (высота растёт с каждым)
    _tickN: 0,
    /** @type {{ t: number, h: any, list: any }[]} */
    _recent: [],            // последние эффекты: «тада» сбора заглушает звуки орба и монеты, начатые в тот же кадр
    _stepAt: 0,
    _dustAt: 0,
    /** @type {any} */
    _dust: null,

    // --- Служебное ------------------------------------------------------------------------------

    get fx() { return this.app && this.app.fx ? this.app.fx : null; },

    // Game объявляет js/Game.js игры; до его загрузки (и в тестах) его нет.
    _game() {
        // @ts-ignore
        return typeof Game !== 'undefined' ? Game : null;
    },

    // Настройка игрока: нет Game или поля — включено.
    _on(key) {
        const g = this._game(), s = g && g.save && g.save.settings;
        return !s || (s[key] !== false && s[key] !== 0);
    },

    get _mobile() { return typeof IS_MOBILE !== 'undefined' && !!IS_MOBILE; },

    init(app) {
        if (this._inited) return;
        this._inited = true;
        this.app = app || null;
        if (app && typeof app.onUpdate === 'function') app.onUpdate(dt => this._tick(dt));
        const fx = this.fx;
        if (fx) for (const url of Object.values(GFX_TEX)) fx.texture(url);
        try { this._buildSynth(); } catch (e) { console.warn('GameFX: синтез свистка не удался', e); }
        if (typeof Sound !== 'undefined') {
            Sound.preload([GFX_SND.coin, GFX_SND.click, GFX_SND.whoosh, GFX_SND.step, GFX_SND.hit, GFX_SND.oof, GFX_SND.bonk,
                GFX_SND.error, GFX_SND.tick, GFX_SND.buy, GFX_SND.buyOk, GFX_SND.equip, GFX_SND.alarm, GFX_SND.orbDash, GFX_SND.orbGhost,
                GFX_SND.decoy, GFX_SND.shield, GFX_SND.swish, GFX_SND.thud, GFX_SND.win, GFX_SND.lose,
                GFX_SND.pickupTick, GFX_SND.pickupDone, GFX_SND.pickupRare, GFX_SND.cash, GFX_SND.cashChips, GFX_SND.place,
                GFX_SND.sell, GFX_SND.sellChips, GFX_SND.codex, GFX_SND.codexPage, GFX_MUSIC.menu]);
        }
        window.addEventListener('hs-save', () => this._applyMusic());
        if (typeof Pause !== 'undefined') {
            // Прогрев шейдеров частиц — когда снимется загрузка: первый настоящий эффект без подтормаживания.
            Pause.onChange(() => { if (!Pause.active && !this._warmed) setTimeout(() => this.warmup(), 50); });
            if (!Pause.active) setTimeout(() => this.warmup(), 50);
        }
    },

    // Отложенные вызовы идут по игровому времени: на паузе замирают вместе с частицами.
    _tick(dt) {
        this._clock += Math.min(0.1, dt);
        if (!this._later.length) return;
        const due = this._laterDue(this._clock);
        for (const job of due) { try { job.fn(); } catch (e) { console.warn('GameFX:', e); } }
    },
    _laterDue(now) {
        const due = [], rest = [];
        for (const j of this._later) (j.t <= now ? due : rest).push(j);
        this._later = rest;
        return due;
    },
    _after(sec, fn) {
        if (this._silent) return;
        if (this.app && this._inited) this._later.push({ t: this._clock + sec, fn });
        else setTimeout(fn, sec * 1000);
    },

    _ground(x, y) {
        const t = this.app && this.app.location && this.app.location.terrain;
        return t ? t.heightAt(x, y) : 0;
    },

    // pos карты -> Babylon { x, y, z }
    _pt(pos, dy = 0) {
        const x = Number(pos && pos.x) || 0, y = Number(pos && pos.y) || 0;
        const h = pos && Number.isFinite(pos.h) ? pos.h : this._ground(x, y);
        return { x, y: h + dy, z: y };
    },

    // Цель камеры: где игрок смотрит; от неё глушатся далёкие звуки и тряска.
    _near(pos) {
        const cam = this.app && this.app.camera;
        const t = cam && cam.target;
        if (!t || !pos) return 0;
        return Math.hypot((pos.x || 0) - t.x, (pos.y || 0) - t.y);
    },
    // 1 вблизи, до 0.25 вдали
    _gain(pos) {
        const d = this._near(pos);
        return d < 700 ? 1 : Math.max(0.25, 1 - (d - 700) / 1900);
    },

    // --- Слои частиц ----------------------------------------------------------------------------
    // Слой — параметры ParticleFX.create плюс свои поля: flat — лежит на земле (не к камере), stretch — вытянут
    // вдоль скорости (спидлайн), scaleY, initRot, emitter ('hemi' | 'ring' | 'sphere', radius), at — смещение
    // от точки, opt — на телефонах пропускается.
    _emit(layers, p) {
        const fx = this.fx;
        if (!fx || !p) return GFX_NO_HANDLE;
        /** @type {any[]} */
        const handles = [];
        for (let layer of layers) {
            if (layer.opt && this._mobile) continue;
            let pos = p;
            if (layer.at) pos = { x: p.x + layer.at[0], y: p.y + layer.at[1], z: p.z + layer.at[2] };
            if (layer.flat) layer = { ...layer, speed: [0.01, 0.01], direction: [[0, 1, 0], [0, 1, 0]] };
            layer = { ...layer, size: layer.size && layer.size.map(v => v * GFX_SCALE), speed: layer.flat || !layer.speed ? layer.speed : layer.speed.map(v => v * GFX_SPEED) };
            let h = null;
            try { h = fx.create({ ...layer, position: pos }); } catch (e) { console.warn('GameFX: слой не создан', e); }
            if (!h) continue;
            this._tune(h.system, layer);
            handles.push(h);
        }
        return {
            handles,
            stop() { for (const h of handles) h.stop(); },
            dispose() { for (const h of handles) h.dispose(); },
            setPosition(v) { for (const h of handles) h.setPosition(v); },
        };
    },

    _tune(ps, o) {
        if (o.flat) ps.isBillboardBased = false;   // лежит на земле: ориентация по направлению частицы — в слое speed ~0 и direction вверх
        if (o.stretch) ps.billboardMode = BABYLON.ParticleSystem.BILLBOARDMODE_STRETCHED;
        if (o.scaleY) { ps.minScaleY = o.scaleY[0]; ps.maxScaleY = o.scaleY[1]; }
        if (o.initRot) { ps.minInitialRotation = o.initRot[0]; ps.maxInitialRotation = o.initRot[1]; }
        if (o.emitter === 'hemi') ps.createHemisphericEmitter(o.radius || 10, 1);
        else if (o.emitter === 'sphere') ps.createSphereEmitter(o.radius || 10, 1);
        else if (o.emitter === 'ring') ps.createCylinderEmitter(o.radius || 20, 0.01, 0.4, 0.15);
    },

    // --- Звук -----------------------------------------------------------------------------------

    _snd(list, opts) {
        if (this._silent || typeof Sound === 'undefined' || !this._on('sfx')) return null;
        const h = Sound.play(list, opts);
        if (h) {
            this._recent.push({ t: performance.now(), h, list });
            if (this._recent.length > 8) this._recent.shift();
        }
        return h;
    },
    // Убрать звуки из lists, начатые за последние ms: подбор брейнрота зовёт орб, монету и «тада» разом — чисто звучит одно «тада».
    _supersede(lists, ms = 120) {
        const now = performance.now();
        for (const r of this._recent) if (now - r.t < ms && lists.includes(r.list) && r.h && r.h.fade) r.h.fade(0.02);
    },
    // Звук в точке мира: громкость падает с расстоянием до камеры.
    _sndAt(list, pos, volume = 1, rate = 1) {
        return this._snd(list, { volume: volume * this._gain(pos), rate });
    },
    // Приглушить музыку под джингл или удар.
    duck(sec = 1.5, level = 0.3) {
        if (typeof Sound !== 'undefined') Sound.duck(level, 0.05, sec, 0.7);
    },
    _shake(pos, ms, power) {
        if (this._silent) return;
        const cam = this.app && this.app.camera;
        if (!cam || typeof cam.shake !== 'function') return;
        const k = this._near(pos) < 900 ? 1 : 0.3;
        cam.shake(ms, power * k);
    },

    sfx(name) {
        switch (name) {
            case 'click': this._snd(GFX_SND.click, { volume: 0.7 }); break;
            case 'buy':
                this._snd(GFX_SND.buy, { volume: 0.8 });
                this._snd(GFX_SND.buyOk, { volume: 0.7 });
                break;
            case 'equip':
                this._snd(GFX_SND.equip, { volume: 0.8 });
                this._snd(GFX_SND.equipCloth, { volume: 0.6 });
                break;
            case 'error': this._snd(GFX_SND.error, { volume: 0.7 }); break;
            case 'tick': this._snd(GFX_SND.tick, { volume: 0.6 }); break;
            case 'go': this._snd('synth:whistle', { volume: 0.55 }); break;
            case 'whoosh': this._snd(GFX_SND.whoosh, { volume: 0.7 }); break;
            case 'alarm': this._snd(GFX_SND.alarm, { volume: 0.8 }); break;
            // --- сбор брейнротов: тик во время подбора (серия поднимается по высоте), «тада», редкий — крупнее и с кассой ---
            case 'pickup-tick': {
                const now = performance.now();
                this._tickN = now - this._tickAt < 900 ? Math.min(12, this._tickN + 1) : 0;
                this._tickAt = now;
                this._snd(GFX_SND.pickupTick, { volume: 0.5, rate: 1 + this._tickN * 0.045 });
                break;
            }
            case 'pickup-done':
                this._supersede([GFX_SND.orbDash, GFX_SND.coin]);
                this._snd(GFX_SND.pickupDone, { volume: 0.85 });
                this.duck(0.8, 0.6);
                break;
            case 'pickup-rare':
                this._supersede([GFX_SND.orbDash, GFX_SND.coin]);
                this._snd(GFX_SND.pickupRare, { volume: 1 });
                this._after(0.1, () => this._snd(GFX_SND.cashChips, { volume: 0.5 }));
                this.duck(1.7, 0.3);
                break;
            // --- база ---
            case 'cash':          // забрал деньги: стук фишек и каскад монет
                this._snd(GFX_SND.cashChips, { volume: 0.7 });
                this._after(0.05, () => this._snd(GFX_SND.cash, { volume: 0.7 }));
                this._after(0.3, () => this._snd(GFX_SND.coin, { volume: 0.45, rate: 1.25 }));
                break;
            case 'place':         // поставил на постамент: глухой «тук» и искорка
                this._snd(GFX_SND.place, { volume: 0.9 });
                this._after(0.06, () => this._snd(GFX_SND.pickupTick, { volume: 0.5, rate: 1.9 }));
                break;
            case 'sell':          // продал: «чпок» фишек, монеты, добавочная монетка
                this._snd(GFX_SND.sellChips, { volume: 0.7 });
                this._snd(GFX_SND.sell, { volume: 0.7 });
                this._after(0.14, () => this._snd(GFX_SND.coin, { volume: 0.5, rate: 1.15 }));
                break;
            case 'codex':         // кодекс: шелест страницы и звон новой записи
                this._snd(GFX_SND.codexPage, { volume: 0.75 });
                this._after(0.1, () => this._snd(GFX_SND.codex, { volume: 0.6 }));
                break;
        }
    },

    // Свисток-горошина старта: «пи-пи-пииии», выше тоном и с быстрым дрожанием (синтез — файла нет, лицензия не нужна).
    _buildSynth() {
        if (typeof Sound === 'undefined') return;
        const rate = 44100, n = Math.floor(rate * 0.84), out = new Float32Array(n);
        const blasts = [[0, 0.1, 3250, 0], [0.14, 0.25, 3350, 0], [0.31, 0.8, 3520, 0.05]];   // начало, конец, тон, подъём тона к концу
        let seed = 54321;
        const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296 * 2 - 1; };
        for (const [t0, t1, f0, rise] of blasts) {
            let phase = 0, lp = 0;
            for (let i = Math.floor(t0 * rate); i < Math.min(n, Math.floor(t1 * rate)); i++) {
                const t = i / rate - t0, len = t1 - t0;
                const env = Math.min(1, t / 0.008) * Math.min(1, (len - t) / 0.06);
                const trill = 1 + 0.06 * Math.sin(2 * Math.PI * 46 * t);                  // горошина в свистке
                phase += 2 * Math.PI * f0 * (1 + rise * t / len) * trill / rate;
                lp += (rnd() - lp) * 0.3;                                                    // дыхание
                const tone = Math.sin(phase) + 0.22 * Math.sin(2 * phase) + 0.08 * Math.sin(3 * phase);
                out[i] += env * (tone * 0.55 + lp * 0.14);
            }
        }
        let peak = 0;
        for (let i = 0; i < n; i++) peak = Math.max(peak, Math.abs(out[i]));
        if (peak > 0) for (let i = 0; i < n; i++) out[i] = out[i] / peak * 0.8;
        const buf = Sound.makeBuffer(out, rate);
        if (buf) Sound.putBuffer('whistle', buf);
    },

    // --- Музыка ---------------------------------------------------------------------------------

    music(kind) {
        this._musicKind = GFX_MUSIC[kind] ? kind : null;
        this._applyMusic();
    },

    _applyMusic() {
        if (typeof Sound === 'undefined') return;
        const kind = this._musicKind;
        const url = kind && this._on('music') ? GFX_MUSIC[kind] : null;
        if (url === this._musicUrl) return;
        this._musicUrl = url;
        if (!url) { Sound.stopMusic(); return; }
        Sound.music(url, { volume: GFX_MUSIC_VOLUME[kind], fade: kind === 'chase' ? 0.35 : kind === 'base' ? 1.2 : 0.9 });
        if (kind === 'chase') this._tempo(url, GFX_CHASE_TEMPO);
    },

    // Sound.music не знает про скорость: дорожка стартует асинхронно, поэтому ждём её источник.
    _tempo(url, rate, tries = 40) {
        const m = Sound._music;
        if (m && m.url === url && m.source) {
            try { m.source.playbackRate.setTargetAtTime(rate, Sound.ctx.currentTime, 0.4); } catch (e) { /* без разгона */ }
            return;
        }
        if (tries > 0 && this._musicUrl === url) setTimeout(() => this._tempo(url, rate, tries - 1), 100);
    },

    // --- Эффекты --------------------------------------------------------------------------------

    coin(pos) {
        const p = this._pt(pos, 30);
        const now = performance.now();
        this._combo = now - this._comboAt < 700 ? Math.min(8, this._combo + 1) : 0;
        this._comboAt = now;
        this._sndAt(GFX_SND.coin, pos, 0.75, 1 + this._combo * 0.07);
        this._emit([
            { texture: GFX_TEX.glint, burst: 9, capacity: 12, life: [0.3, 0.55], size: [14, 26], speed: [70, 170], spin: [-6, 6],
                direction: [[-1, 0.35, -1], [1, 1.2, 1]], gravity: [0, -260, 0], color: '#ffd23d', color2: '#fff3a0', sizeGradient: [[0, 0.5], [0.25, 1], [1, 0]] },
            { texture: GFX_TEX.star, burst: 1, capacity: 2, life: [0.5, 0.5], size: [34, 34], speed: [28, 28], direction: [[0, 1, 0], [0, 1, 0]],
                at: [0, 16, 0], color: '#fff070', sizeGradient: [[0, 0.2], [0.25, 1.15], [0.55, 1], [1, 0]] },
            { texture: GFX_TEX.ring, flat: true, burst: 1, capacity: 2, life: [0.38, 0.38], size: [26, 26], speed: [0, 0], at: [0, -20, 0],
                sizeGradient: [[0, 0.4], [1, 4.2]], colorGradient: [[0, '#ffe27a', 0.9], [1, '#ffe27a', 0]] },
        ], p);
    },

    orb(pos, kind) {
        const ghost = kind === 'ghost' || kind === 'decoy';
        const c = ghost ? GFX_ORB.ghost : GFX_ORB.dash;
        const p = this._pt(pos, 30);
        this._sndAt(ghost ? GFX_SND.orbGhost : GFX_SND.orbDash, pos, 0.8);
        this._emit([
            { texture: GFX_TEX.flash, burst: 1, capacity: 2, life: [0.38, 0.38], size: [170, 170], speed: [0, 0], color: c.a, alpha: 0.95,
                sizeGradient: [[0, 0.3], [0.25, 1.1], [1, 0]] },
            { texture: GFX_TEX.dot, burst: 1, capacity: 2, life: [0.28, 0.28], size: [64, 64], speed: [0, 0], color: '#ffffff',
                sizeGradient: [[0, 0.5], [0.3, 1], [1, 0]] },
            { texture: GFX_TEX.ring, flat: true, burst: 1, capacity: 2, life: [0.5, 0.5], size: [30, 30], speed: [0, 0], at: [0, -20, 0],
                sizeGradient: [[0, 0.3], [1, 5.5]], colorGradient: [[0, c.a, 0.95], [1, c.a, 0]] },
            { texture: GFX_TEX.ring, flat: true, opt: true, delay: 0.1, burst: 1, capacity: 2, life: [0.6, 0.6], size: [30, 30], speed: [0, 0], at: [0, -20, 0],
                sizeGradient: [[0, 0.3], [1, 8]], colorGradient: [[0, c.b, 0.7], [1, c.b, 0]] },
            { texture: GFX_TEX.glint, burst: 16, capacity: 20, life: [0.5, 0.9], size: [12, 22], speed: [90, 210], spin: [-5, 5], emitter: 'hemi', radius: 8,
                gravity: [0, 24, 0], color: c.a, color2: c.b, sizeGradient: [[0, 0.6], [0.3, 1], [1, 0]] },
        ], p);
    },

    dash(actor) {
        if (!actor) return GFX_NO_HANDLE;
        const heading = Number(actor.heading) || 0;
        const bx = -Math.cos(heading), bz = -Math.sin(heading);   // назад по курсу
        const feet = this._pt(actor, 6), chest = this._pt(actor, 55);
        this._sndAt(GFX_SND.whoosh, actor, 0.85);
        this._emit([
            // пыль-взрыв назад
            { texture: GFX_TEX.puff, blend: 'standard', burst: 10, capacity: 12, life: [0.4, 0.75], size: [30, 50], speed: [140, 260], alpha: 0.7,
                direction: [[bx * 0.7 - 0.45, 0.05, bz * 0.7 - 0.45], [bx * 1.2 + 0.45, 0.5, bz * 1.2 + 0.45]], color: '#e3d4b5',
                sizeGradient: [[0, 0.5], [0.4, 1], [1, 1.5]], spin: [-2, 2] },
            // голубое кольцо на земле
            { texture: GFX_TEX.ring, flat: true, burst: 1, capacity: 2, life: [0.36, 0.36], size: [30, 30], speed: [0, 0], at: [0, 4, 0],
                sizeGradient: [[0, 0.5], [1, 5.5]], colorGradient: [[0, '#35c8ff', 0.9], [1, '#35c8ff', 0]] },
            // спидлайны назад
            { texture: GFX_TEX.streak, stretch: true, burst: 9, capacity: 10, life: [0.2, 0.32], size: [16, 22], speed: [420, 640], alpha: 1,
                box: [[-35, 25, -35], [35, 105, 35]], direction: [[bx * 1 - 0.12, 0, bz * 1 - 0.12], [bx * 1 + 0.12, 0.06, bz * 1 + 0.12]],
                scaleY: [6, 10], color: '#d6f4ff', color2: '#7fd8ff', sizeGradient: [[0, 1], [1, 0.2]], opt: true },
        ], feet);
        // непрерывный след: две системы за actor ~0.35 с, дальше сами гаснут
        const follow = () => this._pt(actor, 48);
        const trail = this._emit([
            { texture: GFX_TEX.dot, rate: 240, capacity: 90, life: [0.3, 0.45], size: [30, 40], speed: [0, 6], duration: 0.35, follow,
                colorGradient: [[0, '#d6f6ff', 0.9], [0.4, '#35c8ff', 0.65], [1, '#1e6bff', 0]], sizeGradient: [[0, 1], [1, 0.1]] },
            { texture: GFX_TEX.glint, rate: 45, capacity: 28, life: [0.35, 0.55], size: [10, 18], speed: [0, 40], duration: 0.35, follow, spin: [-4, 4],
                direction: [[-1, 0.2, -1], [1, 1, 1]], color: '#ffffff', color2: '#9fe6ff', sizeGradient: [[0, 1], [1, 0]], opt: true },
        ], chest);
        return { stop: () => trail.stop(), dispose: () => trail.dispose() };
    },

    decoy(pos) {
        const p = this._pt(pos, 45);
        this._sndAt(GFX_SND.decoy, pos, 0.85);
        this._after(0.08, () => this._sndAt(GFX_SND.decoyTail, pos, 0.5));
        this._emit([
            { texture: GFX_TEX.flash, burst: 1, capacity: 2, life: [0.4, 0.4], size: [190, 190], speed: [0, 0], color: '#c070ff', alpha: 0.9,
                sizeGradient: [[0, 0.3], [0.25, 1.1], [1, 0]] },
            { texture: GFX_TEX.ring, flat: true, burst: 1, capacity: 2, life: [0.55, 0.55], size: [30, 30], speed: [0, 0], at: [0, -35, 0],
                sizeGradient: [[0, 0.4], [1, 6.5]], colorGradient: [[0, '#c070ff', 0.9], [1, '#c070ff', 0]] },
            // фиолетовый пуф
            { texture: GFX_TEX.puff, burst: 14, capacity: 16, life: [0.6, 1], size: [30, 56], speed: [30, 90], emitter: 'sphere', radius: 14, alpha: 0.5,
                gravity: [0, 20, 0], color: '#9b4dff', color2: '#e0b0ff', sizeGradient: [[0, 0.5], [1, 1.5]], spin: [-2, 2] },
            // искры
            { texture: GFX_TEX.glint, burst: 20, capacity: 24, life: [0.5, 0.9], size: [12, 22], speed: [80, 220], emitter: 'sphere', radius: 10, spin: [-5, 5],
                gravity: [0, -50, 0], color: '#d9a0ff', color2: '#ffffff', sizeGradient: [[0, 0.6], [0.3, 1], [1, 0]] },
            // голограммные кубики: парят и мерцают голубым и фиолетовым
            { texture: GFX_TEX.confetti, burst: 10, capacity: 12, life: [0.8, 1.3], size: [11, 17], speed: [40, 100], emitter: 'sphere', radius: 16, spin: [-6, 6],
                gravity: [0, 30, 0], colorGradient: [[0, '#7fd8ff', 0], [0.15, '#7fd8ff', 0.9], [0.5, '#c07fff', 0.7], [0.8, '#7fd8ff', 0.55], [1, '#c07fff', 0]], opt: true },
        ], p);
    },

    spotted(pos) {
        const p = this._pt(pos, GFX_HEAD);
        this.sfx('alarm');
        this._emit([
            { texture: GFX_TEX.flash, burst: 1, capacity: 2, life: [0.32, 0.32], size: [190, 190], speed: [0, 0], color: '#ff3030', color2: '#ff7a50', alpha: 0.95,
                sizeGradient: [[0, 0.3], [0.25, 1.1], [1, 0]] },
            { texture: GFX_TEX.ring, burst: 1, capacity: 2, life: [0.4, 0.4], size: [24, 24], speed: [0, 0],
                sizeGradient: [[0, 0.4], [1, 6]], colorGradient: [[0, '#ff4040', 0.95], [1, '#ff4040', 0]] },
            // «!» подпрыгивает и тает
            { texture: GFX_TEX.alert, blend: 'standard', burst: 1, capacity: 2, life: [0.9, 0.9], size: [46, 46], speed: [24, 24], direction: [[0, 1, 0], [0, 1, 0]],
                at: [0, 6, 0], color: '#ff3b30',
                sizeGradient: [[0, 0.2], [0.12, 1.25], [0.22, 0.95], [0.7, 1], [1, 0.7]], colorGradient: [[0, '#ff3b30', 1], [0.7, '#ff3b30', 1], [1, '#ff3b30', 0]] },
            { texture: GFX_TEX.glint, burst: 6, capacity: 8, life: [0.4, 0.6], size: [18, 30], speed: [70, 140], direction: [[-0.5, 0.6, -0.5], [0.5, 1.4, 0.5]],
                color: '#ff5050', color2: '#ffb090', sizeGradient: [[0, 0.7], [0.3, 1], [1, 0]], opt: true },
        ], p);
    },

    caught(pos) {
        const p = this._pt(pos, 60);
        this._sndAt(GFX_SND.hit, pos, 0.95);
        this._sndAt(GFX_SND.bonk, pos, 0.55);
        this._after(0.07, () => this._sndAt(GFX_SND.oof, pos, 0.85));
        this.duck(0.9, 0.45);
        this._shake(pos, 260, 0.012);
        this._emit([
            { texture: GFX_TEX.flash, burst: 1, capacity: 2, life: [0.3, 0.3], size: [260, 260], speed: [0, 0], color: '#fff6c0', alpha: 1,
                sizeGradient: [[0, 0.3], [0.2, 1.1], [1, 0]] },
            { texture: GFX_TEX.halo, burst: 1, capacity: 2, life: [0.45, 0.45], size: [70, 70], speed: [0, 0], color: '#ffb040', alpha: 0.9,
                sizeGradient: [[0, 0.4], [1, 4.4]], colorGradient: [[0, '#ffd070', 0.9], [1, '#ff9030', 0]] },
            // ударная волна по земле
            { texture: GFX_TEX.ring, flat: true, burst: 1, capacity: 2, life: [0.55, 0.55], size: [40, 40], speed: [0, 0], at: [0, -50, 0],
                sizeGradient: [[0, 0.3], [1, 9]], colorGradient: [[0, '#ffffff', 0.95], [0.4, '#ffd060', 0.7], [1, '#ffb040', 0]] },
            // звёзды
            { texture: GFX_TEX.star, burst: 8, capacity: 10, life: [0.7, 1], size: [26, 40], speed: [140, 300], spin: [-8, 8], gravity: [0, -420, 0],
                direction: [[-1, 0.4, -1], [1, 1.5, 1]], color: '#ffe14d', color2: '#fff3a0',
                sizeGradient: [[0, 0.6], [0.2, 1], [0.75, 1], [1, 0]] },
            // щепки
            { texture: GFX_TEX.debris, blend: 'standard', burst: 14, capacity: 16, life: [0.6, 1], size: [10, 22], speed: [120, 330], spin: [-10, 10], gravity: [0, -700, 0],
                direction: [[-1, 0.3, -1], [1, 1.4, 1]], color: '#b0794a', color2: '#e8d6b0', sizeGradient: [[0, 1], [0.8, 1], [1, 0.2]], opt: true },
            // пыль по кругу
            { texture: GFX_TEX.puff, blend: 'standard', burst: 14, capacity: 16, life: [0.6, 1.1], size: [40, 70], speed: [60, 160], emitter: 'ring', radius: 30, alpha: 0.8,
                at: [0, -48, 0], color: '#e0d2b4', sizeGradient: [[0, 0.5], [0.5, 1], [1, 1.3]], spin: [-1.5, 1.5] },
        ], p);
    },

    shield(pos) {
        const p = this._pt(pos, 70);
        this._sndAt(GFX_SND.shield, pos, 0.8);
        this._emit([
            { texture: GFX_TEX.halo, burst: 1, capacity: 2, life: [0.7, 0.7], size: [60, 60], speed: [0, 0], alpha: 0.9,
                sizeGradient: [[0, 0.5], [0.3, 3.2], [1, 3.6]], colorGradient: [[0, '#bff0ff', 0.9], [0.3, '#4fc3ff', 0.8], [1, '#4fc3ff', 0]] },
            { texture: GFX_TEX.flash, burst: 1, capacity: 2, life: [0.3, 0.3], size: [170, 170], speed: [0, 0], color: '#9fe6ff', alpha: 0.9,
                sizeGradient: [[0, 0.3], [0.25, 1.1], [1, 0]] },
            { texture: GFX_TEX.rune, flat: true, burst: 1, capacity: 2, life: [0.85, 0.85], size: [40, 40], speed: [0, 0], spin: [2.5, 2.5], at: [0, -60, 0],
                sizeGradient: [[0, 0.5], [0.4, 5], [1, 6]], colorGradient: [[0, '#9fe6ff', 0.9], [0.6, '#4fc3ff', 0.7], [1, '#4fc3ff', 0]] },
            { texture: GFX_TEX.ring, flat: true, burst: 1, capacity: 2, life: [0.5, 0.5], size: [30, 30], speed: [0, 0], at: [0, -60, 0],
                sizeGradient: [[0, 0.3], [1, 7]], colorGradient: [[0, '#4fc3ff', 0.95], [1, '#4fc3ff', 0]] },
            { texture: GFX_TEX.glint, burst: 14, capacity: 16, life: [0.5, 0.9], size: [12, 22], speed: [100, 200], spin: [-4, 4], emitter: 'sphere', radius: 40,
                color: '#9fe6ff', color2: '#ffffff', sizeGradient: [[0, 0.6], [0.3, 1], [1, 0]], opt: true },
        ], p);
    },

    swing(pos) {
        this._sndAt(GFX_SND.swish, pos, 0.85);
        const p = this._pt(pos, 8);
        this._after(0.14, () => {
            this._sndAt(GFX_SND.thud, pos, 0.9);
            this._shake(pos, 140, 0.005);
        });
        this._emit([
            { texture: GFX_TEX.puff, blend: 'standard', delay: 0.14, burst: 10, capacity: 12, life: [0.5, 0.9], size: [34, 58], speed: [60, 150], emitter: 'ring', radius: 22, alpha: 0.75,
                color: '#e0d2b4', sizeGradient: [[0, 0.5], [0.5, 1], [1, 1.3]], spin: [-1.5, 1.5] },
            { texture: GFX_TEX.ring, flat: true, delay: 0.14, burst: 1, capacity: 2, life: [0.32, 0.32], size: [30, 30], speed: [0, 0], at: [0, 4, 0],
                sizeGradient: [[0, 0.4], [1, 5.5]], colorGradient: [[0, '#fff0d0', 0.7], [1, '#fff0d0', 0]] },
            // трещины-искры: вытянутые лучи расходятся по земле
            { texture: GFX_TEX.streak, stretch: true, delay: 0.14, burst: 10, capacity: 12, life: [0.2, 0.34], size: [10, 14], speed: [220, 360], emitter: 'ring', radius: 8,
                scaleY: [4, 7], color: '#ffd9a0', color2: '#fff3d0', alpha: 0.9, sizeGradient: [[0, 1], [1, 0.2]], opt: true },
            { texture: GFX_TEX.debris, blend: 'standard', delay: 0.14, burst: 6, capacity: 8, life: [0.4, 0.7], size: [8, 16], speed: [90, 220], spin: [-8, 8], gravity: [0, -600, 0],
                direction: [[-1, 0.5, -1], [1, 1.3, 1]], color: '#c9a070', color2: '#ead6b0', opt: true },
        ], p);
    },

    // Пыль шага: одна постоянная система на всю игру (создаётся заново после смены карты), каждый шаг — несколько
    // частиц из неё. Частота ограничена: не чаще раза в 60 мс на всех персонажей разом.
    footDust(pos, opts) {
        const fx = this.fx;
        if (!pos) return;
        const now = performance.now();
        if (!(opts && opts.sound === false) && now - this._stepAt > 90 && this._near(pos) < 1000) {
            this._stepAt = now;
            this._sndAt(GFX_SND.step, pos, 0.3);
        }
        if (!fx || now - this._dustAt < 60) return;
        this._dustAt = now;
        let d = this._dust;
        if (!d || !this._alive(d)) {
            d = this._dust = fx.create({ texture: GFX_TEX.puff, blend: 'standard', rate: 0, capacity: 40, life: [0.35, 0.65], size: [28, 46], speed: [10, 36], alpha: 0.8,
                direction: [[-0.6, 0.3, -0.6], [0.6, 1, 0.6]], color: '#e9dfc7', sizeGradient: [[0, 0.5], [1, 1.6]], spin: [-1.5, 1.5] });
            if (!d) return;
        }
        d.setPosition(this._pt(pos, 6));
        d.system.manualEmitCount = this._mobile ? 3 : 4;
    },
    _alive(handle) {
        const fx = this.fx;
        if (!fx) return false;
        for (const e of fx.effects) if (e.system === handle.system) return true;
        return false;
    },

    // Аура скина: непрерывная система(ы), следуют за target. Обычные скины — без ауры.
    skinAura(target, rarity) {
        const fx = this.fx;
        if (!fx || !target) return GFX_NO_HANDLE;
        const follow = this._follower(target);
        const base = { follow, box: [[-26, 8, -26], [26, 110, 26]], direction: [[-0.3, 0.4, -0.3], [0.3, 1, 0.3]], capacity: 40 };
        /** @type {any[]} */
        let layers = [];
        if (rarity === 'rare') {
            layers = [{ ...base, texture: GFX_TEX.glint, rate: 24, life: [0.6, 1], size: [12, 22], speed: [10, 30], spin: [-3, 3],
                color: '#6fd6ff', color2: '#2f9bff', sizeGradient: [[0, 0.5], [0.3, 1], [1, 0]] }];
        } else if (rarity === 'epic') {
            layers = [
                { ...base, texture: GFX_TEX.star, rate: 10, life: [0.9, 1.3], size: [16, 26], speed: [8, 24], spin: [-3, 3], gravity: [0, 25, 0],
                    color: '#c06bff', color2: '#7d3dff', sizeGradient: [[0, 0.3], [0.25, 1], [0.8, 1], [1, 0]] },
                { ...base, texture: GFX_TEX.glint, rate: 8, life: [0.5, 0.9], size: [8, 14], speed: [10, 30], color: '#e8b8ff', color2: '#ffffff', opt: true },
            ];
        } else if (rarity === 'legendary') {
            layers = [
                { ...base, texture: GFX_TEX.glint, rate: 12, life: [0.6, 1.1], size: [16, 28], speed: [12, 36], spin: [-2, 2],
                    color: '#ffcf3a', color2: '#fff0a0', sizeGradient: [[0, 0.4], [0.3, 1], [1, 0]] },
                // золотые лучи: редкие крупные пульсации
                { ...base, texture: GFX_TEX.flash, rate: 2.5, life: [0.8, 1.1], size: [60, 90], speed: [0, 6], alpha: 0.4, spin: [-0.6, 0.6],
                    box: [[-14, 30, -14], [14, 90, 14]], color: '#ffd24a', sizeGradient: [[0, 0.3], [0.4, 1], [1, 0]], capacity: 8 },
            ];
        } else if (rarity === 'mythic') {
            layers = [
                { ...base, texture: GFX_TEX.glint, rate: 20, life: [0.9, 1.4], size: [10, 20], speed: [14, 40], spin: [-4, 4],
                    colorGradient: GFX_RAINBOW, sizeGradient: [[0, 0.5], [0.3, 1], [1, 0.1]] },
                { ...base, texture: GFX_TEX.dot, rate: 12, life: [0.8, 1.2], size: [14, 24], speed: [6, 22], alpha: 0.7,
                    colorGradient: GFX_RAINBOW, sizeGradient: [[0, 0.6], [1, 0.1]], opt: true },
                { ...base, texture: GFX_TEX.star, rate: 5, life: [1, 1.5], size: [14, 22], speed: [8, 20], spin: [-3, 3], gravity: [0, 20, 0],
                    colorGradient: GFX_RAINBOW, sizeGradient: [[0, 0.3], [0.3, 1], [1, 0]], opt: true },
            ];
        }
        if (!layers.length) return GFX_NO_HANDLE;
        const group = this._emit(layers, follow());
        return { stop: () => group.stop(), dispose: () => group.dispose() };
    },

    // target -> функция Babylon-позиции { x, y, z } (на высоте стоп героя)
    _follower(target) {
        if (typeof target === 'function') return () => this._asBabylon(target());
        if (target.getAbsolutePosition) {
            return () => {
                if (typeof target.isDisposed === 'function' && target.isDisposed()) return null;
                return target.getAbsolutePosition();
            };
        }
        return () => this._asBabylon(target);
    },
    _asBabylon(p) {
        if (!p) return null;
        if (p.getAbsolutePosition) return p.getAbsolutePosition();
        if (p.z !== undefined) return p;                    // уже Babylon
        return this._pt(p, 0);                              // карта { x, y, h }
    },

    win() {
        this._snd(GFX_SND.win, { volume: 0.9 });
        this.duck(2.2, 0.25);
        const cam = this.app && this.app.camera, t = cam && cam.target;
        if (!t) return;
        const base = { x: t.x, y: (Number.isFinite(t.h) ? t.h : this._ground(t.x, t.y)) + 520, z: t.y };
        /** @type {any[]} */
        const layers = [];
        GFX_CONFETTI.forEach((color, i) => {
            layers.push({ texture: GFX_TEX.confetti, blend: 'standard', delay: i * 0.14, burst: 40, capacity: 44, life: [2.6, 3.6], size: [9, 15],
                speed: [70, 150], spin: [-7, 7], gravity: [0, -40, 0], direction: [[-0.35, -1, -0.35], [0.35, -0.6, 0.35]],
                box: [[-520, 0, -460], [520, 80, 460]], color, color2: color, sizeGradient: [[0, 1], [0.85, 1], [1, 0.3]] });
        });
        // залпы звёзд над героем
        for (let i = 0; i < 3; i++) {
            const a = i * 2.1 + 0.4;
            layers.push({ texture: GFX_TEX.glint, delay: 0.1 + i * 0.28, burst: 36, capacity: 40, life: [0.8, 1.3], size: [18, 32], speed: [180, 300], spin: [-4, 4],
                emitter: 'sphere', radius: 6, gravity: [0, -120, 0], at: [Math.cos(a) * 260, -300 + i * 40, Math.sin(a) * 200],
                color: GFX_CONFETTI[(i * 2) % 5], color2: '#ffffff', sizeGradient: [[0, 0.6], [0.3, 1], [1, 0]] });
        }
        this._emit(layers, base);
    },

    lose() {
        this._snd(GFX_SND.lose, { volume: 0.9 });
        this.duck(2, 0.25);
    },

    // Прогрев: один раз создаёт под землёй (не виден) по одной системе каждого вида, чтобы шейдеры
    // собрались до первого настоящего эффекта. Тихий: ни звуков, ни тряски.
    warmup() {
        const fx = this.fx;
        if (this._warmed || !fx || !this.app || !this.app.location) return;
        this._warmed = true;
        const p = { x: 0, y: -4000, h: -4000 };
        this._silent = true;
        try {
            this.coin(p); this.orb(p, 'dash'); this.decoy(p); this.spotted(p); this.caught(p); this.shield(p); this.swing(p);
            this.footDust(p, { sound: false });
        } finally { this._silent = false; }
    },
};
