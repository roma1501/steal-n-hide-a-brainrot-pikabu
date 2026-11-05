// GameCollect.js — сбор брейнротов «Steal n Hide a Brainrot»: брейнроты на карте раунда (идут по красной дорожке
// и стоят на постаментах), подбор стоянием рядом (время по редкости), инвентарь, кодекс, мини-база игрока:
// постаменты, доход в минуту (копится и офлайн, с потолком), плиты сбора, продажа, открытие постаментов.
// Состояние — save.br в едином сохранении игры (Game.persist). Числа — ST_* в Constants.js.

const ST_C = {
    get pickDist() { return typeof ST_PICK_DIST !== 'undefined' ? ST_PICK_DIST : 115; },
    get walkSpeed() { return typeof ST_WALK_SPEED !== 'undefined' ? ST_WALK_SPEED : 55; },
    get walkerEvery() { return typeof ST_WALKER_EVERY !== 'undefined' ? ST_WALKER_EVERY : 11; },
    get maxActive() { return typeof ST_MAX_ACTIVE !== 'undefined' ? ST_MAX_ACTIVE : 5; },
    get slots() { return typeof ST_BASE_SLOTS !== 'undefined' ? ST_BASE_SLOTS : 10; },
    get freeSlots() { return typeof ST_BASE_FREE !== 'undefined' ? ST_BASE_FREE : 6; },
    get capMin() { return typeof ST_BANK_CAP_MIN !== 'undefined' ? ST_BANK_CAP_MIN : 180; },
};
/** Интерфейс с методами этапа «сбор» (GameUI.pickup и др.; их пишет UI-агент — проверяем наличие). */
function stUi() { return /** @type {any} */ (GameUI); }

/** Цена открытия постаментов сверх бесплатных (по порядку). */
const ST_SLOT_PRICES = [2000, 5000, 12000, 30000, 60000, 100000];

Object.assign(LANG_STRINGS.ru, {
    'st.yourBase': 'ТВОЯ БАЗА',
    'st.collected': 'Собрано',
});
Object.assign(LANG_STRINGS.en, {
    'st.yourBase': 'YOUR BASE',
    'st.collected': 'Collected',
});

/** @satisfies {Record<string, any>} */
const GameCollect = {
    /** @type {any[]} */ active: [],       // брейнроты на карте раунда
    walkerT: 0,
    /** @type {any} */ app: null,
    /** @type {any[]} */ podViews: [],     // виды брейнротов на постаментах базы
    accT: 0,

    // ------------------------------------------------------------------ сохранение

    st() {
        const s = Game.save;
        const n = ST_C.slots;
        if (!s.br || typeof s.br !== 'object') s.br = {};
        const b = s.br;
        if (!Array.isArray(b.inv)) b.inv = [];
        if (!b.codex || typeof b.codex !== 'object') b.codex = {};
        if (!Array.isArray(b.slots)) b.slots = [];
        if (!Array.isArray(b.banks)) b.banks = [];
        while (b.slots.length < n) b.slots.push(null);
        while (b.banks.length < n) b.banks.push(0);
        if (typeof b.unlocked !== 'number') b.unlocked = ST_C.freeSlots;
        if (typeof b.last !== 'number') b.last = Date.now();
        if (typeof b.seq !== 'number') b.seq = 1;
        return b;
    },

    item(uid) { return this.st().inv.find(i => i.uid === uid) || null; },

    view(it) {
        const b = stBrainrot(it.id);
        if (!b) return null;
        return {
            uid: it.uid, id: it.id, rarity: b.rarity, mutation: it.mut || '', name: hsText(b.name), icon: b.icon,
            income: stIncome(it.id, it.mut), sell: stSellPrice(it.id, it.mut),
            slot: this.st().slots.indexOf(it.uid),
        };
    },

    // ------------------------------------------------------------------ API для UI (Game.collect)

    inventory() {
        const s = this.st();
        return s.inv.filter(i => s.slots.indexOf(i.uid) < 0).map(i => this.view(i)).filter(Boolean);
    },

    all() { return this.st().inv.map(i => this.view(i)).filter(Boolean); },

    codex() {
        const c = this.st().codex;
        return ST_BRAINROTS.map(b => ({ id: b.id, name: hsText(b.name), rarity: b.rarity, icon: b.icon, found: (c[b.id] || 0) > 0, count: c[b.id] || 0 }));
    },

    base() {
        const s = this.st();
        this.accrue();
        let per = 0;
        const slots = s.slots.map((uid, index) => {
            const it = uid ? this.item(uid) : null;
            const unlocked = index < s.unlocked;
            const income = it ? stIncome(it.id, it.mut) : 0;
            per += income;
            return { index, unlocked, price: unlocked ? 0 : (ST_SLOT_PRICES[index - ST_C.freeSlots] || 0), item: it ? this.view(it) : null, income, bank: Math.floor(s.banks[index] || 0) };
        });
        const bank = Math.floor(s.banks.reduce((a, v) => a + (v || 0), 0));
        return { slots, incomePerMin: Math.round(per * 10) / 10, bank, cap: Math.round(per * ST_C.capMin) };
    },

    place(uid, index) {
        const s = this.st();
        if (!this.item(uid)) return { ok: false, reason: 'unknown' };
        if (index < 0 || index >= s.slots.length || index >= s.unlocked) return { ok: false, reason: 'locked' };
        if (s.slots[index]) return { ok: false, reason: 'busy' };
        const prev = s.slots.indexOf(uid);
        this.accrue();
        if (prev >= 0) { this.collectSlot(prev); s.slots[prev] = null; }
        s.slots[index] = uid;
        s.banks[index] = 0;
        Game.persist();
        GameFX.sfx('place');
        this.syncPodiums();
        return { ok: true };
    },

    unplace(index) {
        const s = this.st();
        if (!s.slots[index]) return { ok: false, reason: 'empty' };
        this.accrue();
        this.collectSlot(index);
        s.slots[index] = null;
        Game.persist();
        this.syncPodiums();
        return { ok: true };
    },

    sell(uid) {
        const s = this.st();
        const it = this.item(uid);
        if (!it) return { ok: false, reason: 'unknown' };
        const slot = s.slots.indexOf(uid);
        if (slot >= 0) { this.accrue(); this.collectSlot(slot); s.slots[slot] = null; }
        const coins = stSellPrice(it.id, it.mut);
        s.inv.splice(s.inv.indexOf(it), 1);
        Shop.addCoins(coins, { reason: 'sell' });
        Game.persist();
        GameFX.sfx('sell');
        this.syncPodiums();
        return { ok: true, coins };
    },

    sellPrice(id, mut) { return stSellPrice(id, mut); },

    unlockSlot(index) {
        const s = this.st();
        if (index !== s.unlocked || index >= s.slots.length) return { ok: false, reason: 'order' };
        const price = ST_SLOT_PRICES[index - ST_C.freeSlots] || 0;
        if (Shop.coins < price) { GameFX.sfx('error'); return { ok: false, reason: 'money' }; }
        Shop.spend(price, { reason: 'slot' });
        s.unlocked++;
        Game.persist();
        GameFX.sfx('buy');
        this.syncPodiums();
        return { ok: true };
    },

    /** Забрать деньги одного постамента (плита сбора на базе). */
    collectSlot(index) {
        const s = this.st();
        const n = Math.floor(s.banks[index] || 0);
        if (n <= 0) return 0;
        s.banks[index] -= n;
        Shop.addCoins(n, { reason: 'base', save: false });
        return n;
    },

    /** Забрать всю кассу — ровно столько, сколько она показывает (сумма, а не сумма округлённых постаментов). */
    collectBank() {
        const s = this.st();
        this.accrue();
        const sum = s.banks.reduce((a, v) => a + (v || 0), 0);
        const total = Math.floor(sum);
        if (total <= 0) return { ok: false, coins: 0 };
        for (let i = 0; i < s.banks.length; i++) s.banks[i] = 0;
        const keep = s.slots.findIndex(Boolean);   // доли монеты не пропадают — копятся дальше
        if (keep >= 0) s.banks[keep] = sum - total;
        Shop.addCoins(total, { reason: 'base', save: false });
        Game.persist();
        GameFX.sfx('cash');
        return { ok: true, coins: total };
    },

    async bankX2() {
        const s = this.st();
        this.accrue();
        const total = Math.floor(s.banks.reduce((a, v) => a + (v || 0), 0));
        if (total <= 0) return { ok: false, reason: 'empty' };
        const r = await Game.ads.run('base-x2', () => {
            const got = this.collectBank().coins;
            Shop.addCoins(got, { reason: 'base-x2' });
            return { coins: got * 2 };
        });
        return r;
    },

    /** Доход копится по времени (и пока игра закрыта), каждый постамент — до своего потолка. */
    accrue() {
        const s = this.st();
        const now = Date.now();
        const min = Math.max(0, (now - s.last) / 60000);
        s.last = now;
        if (min <= 0) return;
        for (let i = 0; i < s.slots.length; i++) {
            const it = s.slots[i] ? this.item(s.slots[i]) : null;
            if (!it) continue;
            const inc = stIncome(it.id, it.mut);
            s.banks[i] = Math.min(inc * ST_C.capMin, (s.banks[i] || 0) + inc * min);
        }
    },

    /** Добавить брейнрота в инвентарь и кодекс. @returns {{ isNew: boolean, item: any }} */
    add(id, mut) {
        const s = this.st();
        const isNew = !(s.codex[id] > 0);
        s.codex[id] = (s.codex[id] || 0) + 1;
        const it = { uid: 'b' + (s.seq++), id, mut: mut || '', t: Date.now() };
        s.inv.push(it);
        Game.persist();
        return { isNew, item: it };
    },

    found(id) { return (this.st().codex[id] || 0) > 0; },

    // ------------------------------------------------------------------ брейнроты на карте раунда

    clearRound() {
        for (const a of this.active) this.dropView(a);
        this.active = [];
        if (typeof stUi().pickup === 'function') stUi().pickup([]);
        if (typeof stUi().brainrotMarks === 'function') stUi().brainrotMarks([]);
    },

    dropView(a) {
        if (a.glow) { a.glow.stop(); a.glow = null; }
        if (a.view) { a.view.dispose(); a.view = null; }
    },

    spawnRound(app, mapIndex) {
        this.app = app;
        this.clearRound();
        this.mapIndex = mapIndex;
        const loc = app.location;
        const spots = loc.markers('br-spot').slice().sort(() => Math.random() - 0.5);
        // на постаментах — 2 стоящих, по дорожке сразу идёт один
        for (const m of spots.slice(0, 2)) this.spawnOne(m.x, m.y, 40, 'stand', null);
        this.spawnWalker();
        this.walkerT = ST_C.walkerEvery * (0.6 + Math.random() * 0.5);
    },

    spawnWalker() {
        const loc = this.app.location;
        const a = loc.marker('carpet-a'), b = loc.marker('carpet-b');
        if (!a || !b) return;
        const lane = (Math.random() - 0.5) * 120;
        this.spawnOne(a.x, a.y + lane, 6, 'walk', { x: b.x, y: b.y + lane });
    },

    spawnOne(x, y, h, mode, goal) {
        if (this.active.length >= ST_C.maxActive) return;
        const roll = stRollBrainrot(this.mapIndex || 0);
        const b = stBrainrot(roll.id);
        const mut = roll.mut ? ST_MUTATIONS[roll.mut] : null;
        // высота — по поверхности (пол базы, дорожка) + постамент
        h = (Nav.ready ? Nav.height(x, y) : 0) + (mode === 'stand' ? 40 : 0);
        const a = {
            id: roll.id, rarity: roll.rarity, mut: roll.mut, x, y, h, mode, goal,
            heading: goal ? Math.atan2(goal.y - y, goal.x - x) : Math.random() * Math.PI * 2,
            prog: 0, need: stPickTime(roll.id, roll.mut), speed: 0, tick: 0, gone: false,
            name: hsText(b.name), view: null, glow: null,
        };
        a.view = new HsSeekerView(this.app.location.view, roll.id, { scale: 1, tint: mut ? mut.tint : '' });
        a.view.play(mode === 'walk' ? 'walk' : 'idle');
        const glow = ST_RARITY[roll.rarity].glow || (mut ? 'rare' : '');
        if (glow) a.glow = GameFX.skinAura(() => new BABYLON.Vector3(a.x, a.h + 70, a.y), glow);
        this.active.push(a);
    },

    /** Кадр раунда: движение по дорожке, подбор игроком. pick — false: подбирать нельзя (игрок — искатель). */
    update(dt, P, running, pick = true) {
        if (!this.app || !this.active.length && !running) return;
        if (running) {
            this.walkerT -= dt;
            if (this.walkerT <= 0) { this.walkerT = ST_C.walkerEvery * (0.8 + Math.random() * 0.5); this.spawnWalker(); }
        }
        for (const a of this.active.slice()) {
            const near = pick && running && P && !P.caught && Math.hypot(P.x - a.x, P.y - a.y) < ST_C.pickDist;
            // идёт по дорожке, пока его не подбирают
            if (a.mode === 'walk' && !near) {
                const dx = a.goal.x - a.x, dy = a.goal.y - a.y, d = Math.hypot(dx, dy);
                const step = ST_C.walkSpeed * dt;
                if (d <= step) { this.vanish(a); continue; }
                a.x += dx / d * step; a.y += dy / d * step;
                if (Nav.ready) a.h = Nav.height(a.x, a.y);
                a.heading = Math.atan2(dy, dx);
                a.speed = ST_C.walkSpeed;
            } else a.speed = 0;
            if (near) {
                a.prog += dt / a.need;
                a.heading = Math.atan2(P.y - a.y, P.x - a.x);
                a.tick -= dt;
                if (a.tick <= 0) { a.tick = 0.45; GameFX.sfx('pickup-tick'); }
                if (a.prog >= 1) { this.collect(a); continue; }
            } else a.prog = Math.max(0, a.prog - dt * 0.15);
            if (a.view) {
                a.view.setPose(a.x, a.y, a.h, a.heading, a.speed * 3, dt);
                a.view.play(near ? 'cheer' : a.mode === 'walk' ? 'walk' : 'idle');
            }
        }
        this.feedUi(P, running && pick);
    },

    vanish(a) {
        GameFX.decoy({ x: a.x, y: a.y, h: 40 });
        this.remove(a);
    },

    remove(a) {
        this.dropView(a);
        const i = this.active.indexOf(a);
        if (i >= 0) this.active.splice(i, 1);
    },

    collect(a) {
        const r = this.add(a.id, a.mut);
        const pos = { x: a.x, y: a.y, h: a.h + 60 };
        GameFX.orb(pos, 'dash');
        GameFX.coin(pos);
        const rare = ST_RARITY_ORDER.indexOf(a.rarity) >= 3 || !!a.mut;
        Platform.analytics('brainrot_collected', { rarity: a.rarity, mutation: a.mut || 'none', is_new: r.isNew });
        GameFX.sfx(rare ? 'pickup-rare' : 'pickup-done');
        if (rare && typeof GameCosmetics !== 'undefined') GameCosmetics.emote(a.rarity === 'god' || a.rarity === 'secret' ? 'win_galaxy' : 'win_stars', pos);
        if (typeof stUi().collected === 'function') {
            const b = stBrainrot(a.id);
            stUi().collected({ id: a.id, name: a.name, rarity: a.rarity, mutation: a.mut, icon: b ? b.icon : '', isNew: r.isNew,
                mutationName: a.mut ? hsText(ST_MUTATIONS[a.mut]) : '', rarityName: hsText(ST_RARITY[a.rarity]) });
        }
        this.remove(a);
    },

    /** Полосы подбора над брейнротами и стрелки к ним за краем экрана. */
    feedUi(P, running) {
        if (!this.app) return;
        const view = this.app.location.view;
        const picks = [], marks = [];
        const pp = P ? view.projectToScreen(P.x, P.y, 60) : null;
        for (const a of running ? this.active : []) {
            const s = view.projectToScreen(a.x, a.y, a.h + 230);
            const near = running && P && Math.hypot(P.x - a.x, P.y - a.y) < ST_C.pickDist;
            if (s.visible) picks.push({ id: a.id, x: s.x, y: s.y, frac: Math.min(1, a.prog), rarity: a.rarity, mutation: a.mut, name: a.name, active: !!near, seconds: Math.max(0, a.need * (1 - a.prog)) });
            else if (pp && running) marks.push({ x: s.x, y: s.y, ang: Math.atan2(s.y - pp.y, s.x - pp.x), rarity: a.rarity, offscreen: true });
        }
        if (typeof stUi().pickup === 'function') stUi().pickup(picks);
        if (typeof stUi().brainrotMarks === 'function') stUi().brainrotMarks(marks);
    },

    // ------------------------------------------------------------------ база

    /** Виды брейнротов на постаментах базы (карта base). */
    syncPodiums() {
        if (Game.state !== 'base' || !this.app) return;
        const loc = this.app.location;
        const s = this.st();
        for (let i = 0; i < s.slots.length; i++) {
            const m = loc.marker('podium-' + (i + 1));
            const uid = s.slots[i];
            const cur = this.podViews[i];
            const it = uid ? this.item(uid) : null;
            if (cur && (!it || cur.uid !== uid)) { if (cur.glow) cur.glow.stop(); cur.view.dispose(); this.podViews[i] = null; }
            if (it && m && !this.podViews[i]) {
                const mut = it.mut ? ST_MUTATIONS[it.mut] : null;
                const v = new HsSeekerView(loc.view, it.id, { scale: 0.9, tint: mut ? mut.tint : '' });
                const pv = { uid, view: v, x: m.x, y: m.y, h: (Nav.ready ? Nav.height(m.x, m.y) : 8) + 40, heading: Math.PI / 2, glow: null };
                const r = stBrainrot(it.id);
                const glow = r ? ST_RARITY[r.rarity].glow : '';
                if (glow) pv.glow = GameFX.skinAura(() => new BABYLON.Vector3(pv.x, pv.h + 70, pv.y), glow);
                v.play('idle');
                this.podViews[i] = pv;
            }
        }
    },

    clearBase() {
        for (const pv of this.podViews) if (pv) { if (pv.glow) pv.glow.stop(); pv.view.dispose(); }
        this.podViews = [];
    },

    /** Кадр базы: позы на постаментах, плиты сбора под ногами, подписи с деньгами. */
    updateBase(dt, P) {
        const loc = this.app.location;
        const s = this.st();
        this.accT -= dt;
        if (this.accT <= 0) { this.accT = 0.5; this.accrue(); }
        const view = loc.view;
        const tags = [];
        let collected = 0;
        for (let i = 0; i < this.podViews.length; i++) {
            const pv = this.podViews[i];
            if (pv) {
                pv.view.setPose(pv.x, pv.y, pv.h, pv.heading, 0, dt);
                const sp = view.projectToScreen(pv.x, pv.y, 300);
                const it = this.item(pv.uid);
                if (sp.visible && it) tags.push({ id: 'pod' + i, x: sp.x, y: sp.y, text: '$' + Math.floor(s.banks[i] || 0) + ' · ' + stIncome(it.id, it.mut) + '/' + (Lang.code === 'en' ? 'min' : 'мин'), kind: 'bot', state: 'normal' });
            }
            const pad = loc.marker('collect-' + (i + 1));
            if (pad && P && Math.hypot(P.x - pad.x, P.y - pad.y) < 55 && (s.banks[i] || 0) >= 1) {
                const n = this.collectSlot(i);
                if (n > 0) {
                    collected += n;
                    GameFX.coin({ x: pad.x, y: pad.y, h: 30 });
                    const sp = view.projectToScreen(pad.x, pad.y, 80);
                    if (sp.visible) GameUI.floatText(sp.x, sp.y, '+' + n, 'coin');
                }
            }
        }
        if (collected > 0) { GameFX.sfx('cash'); Game.persist(); }
        GameUI.tags(tags);
        const b = this.base();
        if (typeof stUi().baseUpdate === 'function') stUi().baseUpdate({ bank: b.bank, incomePerMin: b.incomePerMin, cap: b.cap, coins: Shop.coins, gems: Game.save.gems });
    },
};
