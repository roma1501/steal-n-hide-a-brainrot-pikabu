// GameGates.js — лазерные ворота баз «Steal n Hide a Brainrot», как в Steal a Brainrot.
// На карте стоит рама ворот (kit2/<тема>-gateframe.glb), лазеры рисует и включает игра.
// База то заперта (лазеры горят, пройти нельзя никому — ни игроку, ни искателю, ни ботам), то открыта (лазеры погашены).
// Кнопка блокировки внутри базы (lockbtn): встал на неё — база запирается на ST_LOCK_SEC (потом перезарядка).
// Взлом: постоять у запертых ворот ST_HACK_SEC — лазеры гаснут на ST_HACKED_OPEN_SEC. Искатель-бот тоже взламывает.
// Запертые ворота — невидимые стены Nav (маркеры block в копии карты): пути и движение их обходят.
// На своей базе (карта base) лазеры горят, но хозяина пропускают.

const ST_G = {
    get lockSec() { return typeof ST_LOCK_SEC !== 'undefined' ? ST_LOCK_SEC : 30; },
    get hackSec() { return typeof ST_HACK_SEC !== 'undefined' ? ST_HACK_SEC : 2.5; },
    get hackedOpen() { return typeof ST_HACKED_OPEN_SEC !== 'undefined' ? ST_HACKED_OPEN_SEC : 15; },
    get exitSec() { return typeof ST_EXIT_SEC !== 'undefined' ? ST_EXIT_SEC : 1; },
};
/** Лазеры модели gate (отчёты Blender-наборов): высоты осей от пола и длина, px. Темы 1–5 и 6–10 разные. */
const ST_LASERS = {
    a: { h: [26, 50, 74, 98, 122], len: 146 },
    b: { h: [32, 61, 90, 119, 148], len: 142 },
};
const ST_LASER_B = /\/(toy|ice|neon|space|carnival)-/;

Object.assign(LANG_STRINGS.ru, {
    'gate.hack': 'Взлом…',
    'gate.locked': 'Заперто: {n} с',
    'gate.lockedNow': 'База заперта на {n} с!',
    'gate.hacked': 'Лазеры отключены!',
    'gate.exit': 'Открываю…',
});
Object.assign(LANG_STRINGS.en, {
    'gate.hack': 'Hacking…',
    'gate.locked': 'Locked: {n} s',
    'gate.lockedNow': 'Base locked for {n} s!',
    'gate.hacked': 'Lasers disabled!',
    'gate.exit': 'Opening…',
});

const ST_GATE_CSS = '.st-gate{position:fixed;left:0;top:0;z-index:5;pointer-events:none;display:none;flex-direction:column;align-items:center;gap:3px;transform:translate(-50%,-100%);font:900 13px Nunito,Rubik,system-ui,sans-serif;color:#fff;text-shadow:0 2px 0 #1a0010,0 0 6px #1a0010;white-space:nowrap}'
    + '.st-gate-ring{width:42px;height:42px;border-radius:50%;padding:5px;box-sizing:border-box;background:conic-gradient(#ff3d5a var(--p,0%),rgba(30,5,15,.78) 0);box-shadow:0 0 0 3px #2a0614,0 0 14px rgba(255,61,90,.65)}'
    + '.st-gate-ring b{display:flex;width:100%;height:100%;border-radius:50%;background:#3a0a1c;align-items:center;justify-content:center;font-size:16px}'
    + '.st-gate.on .st-gate-ring{animation:st-gate-pulse .4s ease-in-out infinite alternate}'
    + '@keyframes st-gate-pulse{to{transform:scale(1.12)}}';

/** @satisfies {Record<string, any>} */
const GameGates = {
    /** @type {any[]} */ gates: [],
    /** @type {any} */ app: null,
    owner: false,          // своя база: лазеры видны, но хозяина пропускают
    dirty: false,
    /** @type {HTMLElement | null} */ el: null,
    /** @type {any} */ mat: null,
    /** @type {any} */ glow: null,

    /** Найти ворота на карте, связать с кнопками блокировки, построить лазеры. */
    build(app, opts) {
        this.dispose();
        this.app = app;
        this.owner = !!(opts && opts.owner);
        const loc = app.location;
        const objs = loc.map.objects;
        const buttons = objs.filter(d => d.model && /-lockbtn\.glb$/.test(d.model));
        let n = 0;
        for (const d of objs) {
            if (!d.model || !/-gate(frame)?\.glb$/.test(d.model)) continue;
            const head = (d.rot ? d.rot[1] : 0) * Math.PI / 180;
            let btn = null, bd = 320;
            for (const b of buttons) { const dist = Math.hypot(b.x - d.x, b.y - d.y); if (dist < bd) { bd = dist; btn = b; } }
            const g = { id: n++, x: d.x, y: d.y, h: Number(d.h) || 0, head, btn, btnCd: 0, state: '', t: 0, hack: 0, inner: false, core: null, halo: null, vis: 1,
                half: Math.abs(Math.cos(head)) * 100 + 24, inSide: 0 };
            // сторона базы — там, где кнопка блокировки: взламывать можно только снаружи
            if (btn) g.inSide = Math.sign(this.side(g, btn.x, btn.y));
            // у старой модели gate лазеры свои — поверх не рисуем
            if (/-gateframe\.glb$/.test(d.model)) this.makeLasers(g, ST_LASERS[ST_LASER_B.test(d.model) ? 'b' : 'a'], loc.view.scene);
            this.gates.push(g);
        }
        for (const g of this.gates) this.set(g, this.owner || Math.random() < 0.5 ? 'locked' : 'open', this.randLocked());
        this.rebuildNav();
    },

    randLocked() { return 16 + Math.random() * 14; },
    randOpen() { return 14 + Math.random() * 12; },

    /** Пять полос: яркая сердцевина и мягкое свечение — по одному мешу на ворота. */
    makeLasers(g, spec, scene) {
        if (!this.mat) {
            const m = new BABYLON.StandardMaterial('st-laser-core', scene);
            m.disableLighting = true; m.emissiveColor = BABYLON.Color3.FromHexString('#ff1f35'); m.metadata = { toon: false };
            const gl = new BABYLON.StandardMaterial('st-laser-glow', scene);
            gl.disableLighting = true; gl.emissiveColor = BABYLON.Color3.FromHexString('#ff8a94'); gl.alpha = 0.35;
            gl.backFaceCulling = false; gl.metadata = { toon: false };
            this.mat = m; this.glow = gl;
        }
        const bars = [], halos = [];
        for (const h of spec.h) {
            const b = BABYLON.MeshBuilder.CreateBox('st-laser', { width: spec.len, height: 5.6, depth: 5.6 }, scene);
            b.position.y = h; bars.push(b);
            const q = BABYLON.MeshBuilder.CreateBox('st-laser-glow', { width: spec.len, height: 12, depth: 1 }, scene);
            q.position.y = h; halos.push(q);
        }
        g.core = BABYLON.Mesh.MergeMeshes(bars, true);
        g.halo = BABYLON.Mesh.MergeMeshes(halos, true);
        for (const [mesh, mat] of [[g.core, this.mat], [g.halo, this.glow]]) {
            mesh.material = mat;
            mesh.isPickable = false;
            mesh.position.set(g.x, g.h, g.y);
            mesh.rotation.y = -g.head;
        }
    },

    /** Состояние ворот: locked | open; t — сколько держать. */
    set(g, state, t) {
        if (g.state !== state) this.dirty = true;
        g.state = state;
        g.t = t;
        g.hack = 0;
        if (g.core) g.core.setEnabled(state === 'locked');
        if (g.halo) g.halo.setEnabled(state === 'locked');
    },

    /** Запертые ворота — маркеры block в копии карты (Nav читает их при build). */
    rebuildNav() {
        if (!this.app) return;
        const list = this.app.location.map.objects;
        for (let i = list.length - 1; i >= 0; i--) if (list[i].kind === 'marker' && /^block-gate/.test(String(list[i].name))) list.splice(i, 1);
        if (!this.owner) {
            for (const g of this.gates) {
                if (g.state !== 'locked') continue;
                list.push({ name: 'block-gate' + g.id, kind: 'marker', x: g.x, y: g.y, h: 0, rot: [0, g.head * 180 / Math.PI, 0], scale: [1.8, 1, 0.34] });
            }
        }
        Nav.build(this.app.location);
        this.dirty = false;
    },

    /** По какую сторону ворот точка: знак — сторона, 0 — на линии ворот. */
    side(g, x, y) { return -(x - g.x) * Math.sin(g.head) + (y - g.y) * Math.cos(g.head); },

    /** Снаружи базы (или у ворот без кнопки) — можно взламывать. */
    outside(g, a) { return !g.inSide || Math.sign(this.side(g, a.x, a.y)) !== g.inSide; },

    /** Кто-то стоит в проёме — запирать нельзя (иначе застрянет в стене). */
    occupied(g, agents) {
        for (const a of agents) if (a && Math.hypot(a.x - g.x, a.y - g.y) < 70) return true;
        return false;
    },

    /**
     * Кадр раунда. P — игрок (кнопка и подсказка взлома), agents — все, кто ходит,
     * hackers — кто умеет взламывать (игрок и искатель-бот).
     * @param {number} dt @param {any} P @param {any[]} agents @param {any[]} hackers @param {boolean} running
     */
    update(dt, P, agents, hackers, running) {
        if (!this.gates.length) return;
        if (this.glow) this.glow.alpha = 0.28 + Math.sin(performance.now() / 90) * 0.1;
        this.fadeBehind(dt, P);
        if (!running || this.owner) { this.ui(null); return; }
        const view = this.app.location.view;
        let hint = null;
        for (const g of this.gates) {
            g.t -= dt;
            if (g.btnCd > 0) g.btnCd -= dt;
            if (g.t <= 0) {
                if (g.state === 'locked') this.set(g, 'open', this.randOpen());
                else if (!this.occupied(g, agents)) this.set(g, 'locked', this.randLocked());
                else g.t = 1;
            }
            // кнопка блокировки: игрок встал на неё — база заперта, потом перезарядка
            if (P && !P.caught && g.btn && g.state === 'open' && g.btnCd <= 0
                && Math.hypot(P.x - g.btn.x, P.y - g.btn.y) < 50 && !this.occupied(g, agents)) {
                this.set(g, 'locked', ST_G.lockSec);
                g.btnCd = ST_G.lockSec + 20;
                GameFX.sfx('alarm');
                GameFX.shield({ x: g.x, y: g.y, h: 80 });
                const sp = view.projectToScreen(P.x, P.y, 200);
                if (sp.visible) GameUI.floatText(sp.x, sp.y, Lang.t('gate.lockedNow', { n: Math.round(ST_G.lockSec) }), 'power');
            }
            // взлом запертых ворот снаружи (hackers) и выход изнутри (быстро, любой, кто заперт в базе)
            if (g.state !== 'locked') continue;
            let rate = 0;
            for (const a of hackers) if (a && !a.caught && Math.hypot(a.x - g.x, a.y - g.y) < 100 && this.outside(g, a)) rate = Math.max(rate, 1 / ST_G.hackSec);
            for (const a of agents) if (a && !a.caught && Math.hypot(a.x - g.x, a.y - g.y) < 100 && !this.outside(g, a)) rate = 1 / ST_G.exitSec;
            g.inner = rate === 1 / ST_G.exitSec;
            if (!rate) { g.hack = Math.max(0, g.hack - dt * 0.5); continue; }
            g.hack += dt * rate;
            if (g.hack >= 1) {
                this.set(g, 'open', ST_G.hackedOpen);
                GameFX.decoy({ x: g.x, y: g.y, h: 80 });
                GameFX.sfx('whoosh');
                const sp = view.projectToScreen(g.x, g.y, 200);
                if (sp.visible) GameUI.floatText(sp.x, sp.y, Lang.t('gate.hacked'), 'power');
            }
        }
        if (this.dirty) this.rebuildNav();
        // подсказка — над ближайшими запертыми воротами у игрока
        if (P && !P.caught) {
            for (const g of this.gates) {
                if (g.state !== 'locked') continue;
                const d = Math.hypot(P.x - g.x, P.y - g.y);
                if (d < 220 && (!hint || d < hint.d)) hint = { g, d };
            }
        }
        this.ui(hint ? hint.g : null);
    },

    /**
     * Камера смотрит на север (сверху-сзади): персонаж севернее ворот и рядом — лазеры рисовались бы поверх него.
     * Такие ворота почти прозрачны (рама растворяется сама — CameraSight).
     */
    fadeBehind(dt, P) {
        if (!P) return;
        const k = Math.min(1, dt * 10);
        for (const g of this.gates) {
            if (!g.core) continue;
            const dy = g.y - P.y;
            const behind = Math.abs(P.x - g.x) < g.half + 30 && dy > -30 && dy < 300;
            g.vis += ((behind ? 0.12 : 1) - g.vis) * k;
            g.core.visibility = g.vis;
            g.halo.visibility = g.vis;
        }
    },

    /** Кольцо взлома и таймер над запертыми воротами. */
    ui(g) {
        let el = this.el;
        if (!el) {
            if (!g) return;
            el = this.el = document.createElement('div');
            el.className = 'st-gate';
            el.innerHTML = '<div class="st-gate-ring"><b>⚡</b></div><span></span>';
            const st = document.createElement('style');
            st.textContent = ST_GATE_CSS;
            document.head.appendChild(st);
            document.body.appendChild(el);
        }
        if (!g || !this.app) { el.style.display = 'none'; return; }
        const p = this.app.location.view.projectToScreen(g.x, g.y, 230);
        if (!p.visible) { el.style.display = 'none'; return; }
        el.style.display = 'flex';
        el.style.left = p.x + 'px'; el.style.top = p.y + 'px';
        el.style.setProperty('--p', Math.round(g.hack * 100) + '%');
        el.classList.toggle('on', g.hack > 0);
        const label = /** @type {HTMLElement} */ (el.lastElementChild);
        const txt = g.hack > 0 ? Lang.t(g.inner ? 'gate.exit' : 'gate.hack') : Lang.t('gate.locked', { n: Math.ceil(g.t) });
        if (label.textContent !== txt) label.textContent = txt;
    },

    /** Точка внутри базы этих ворот (по сторону кнопки блокировки, в пределах участка 600×600). */
    inside(g, a) {
        if (!g.inSide || !a) return false;
        const s = this.side(g, a.x, a.y), along = (a.x - g.x) * Math.cos(g.head) + (a.y - g.y) * Math.sin(g.head);
        return Math.sign(s) === g.inSide && Math.abs(s) < 640 && Math.abs(along) < 640;
    },

    /** Начало раунда: состояния заново, кнопки перезаряжены; база, где кто-то стоит, открыта — никто не заперт на старте. */
    reset(agents) {
        for (const g of this.gates) {
            g.btnCd = 0;
            if ((agents || []).some(a => this.inside(g, a))) this.set(g, 'open', 20 + Math.random() * 10);
            else if (Math.random() < 0.5) this.set(g, 'locked', 6 + Math.random() * 14);
            else this.set(g, 'open', 8 + Math.random() * 14);
        }
        this.rebuildNav();
    },

    dispose() {
        for (const g of this.gates) { if (g.core) g.core.dispose(); if (g.halo) g.halo.dispose(); }
        this.gates = [];
        if (this.el) this.el.style.display = 'none';
        if (this.mat) { this.mat.dispose(); this.glow.dispose(); this.mat = null; this.glow = null; }
    },
};
