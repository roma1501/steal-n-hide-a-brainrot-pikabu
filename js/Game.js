// Game.js — «Brainrot Hide and Seek»: меню на живой сцене, раунды пряток (прячься / ищи),
// игрок, боты, искатель-брейнрот, монеты и бонусы, награды, уровни, магазин, сохранение.
// Интерфейс — GameUI.js, эффекты и звук — GameFX.js, персонажи — GameActors.js, ИИ — GameAI.js.
// Контракт модулей — docs/GAME-SPEC.md.

Object.assign(LANG_STRINGS.ru, {
    'title': 'Steal n Hide a Brainrot',
    'tut.coin.t': 'Собирай монеты',
    'tut.coin.h': 'Подбери монету — за них покупаются облики и персонажи',
    'tut.dash.t': 'Рывок',
    'tut.dash.hk': 'Пробел — резкий рывок вперёд',
    'tut.dash.ht': 'Кнопка «Рывок» — резкий бросок вперёд',
    'tut.hide.t': 'Спрячься в укрытии',
    'tut.hide.h': 'В кустах и коробках искатель не видит тебя издалека',
    'tut.decoy.t': 'Обманка',
    'tut.decoy.hk': 'E — пустить призрачную копию, искатель погонится за ней',
    'tut.decoy.ht': 'Кнопка «Обманка» — призрачная копия отвлечёт искателя',
    'tut.cone.t': 'Не попадай в красный конус!',
    'tut.cone.h': 'Это взгляд искателя. Заметит — побежит за тобой. Продержись до конца таймера',
    'hs.you': 'ТЫ',
    'hs.chest': 'Сундук!',
    'hs.waitTitle': 'Жди! Все прячутся',
    'hs.waitHint': 'Двигаться можно через',
    'hs.standToFree': 'Встань рядом — освободить',
    'hs.freeing': 'Освобождаю…',
    'hs.freed': '{name} свободен!',
    'hs.escaped': '{name} сбежал!',
});
Object.assign(LANG_STRINGS.en, {
    'title': 'Steal n Hide a Brainrot',
    'tut.coin.t': 'Collect coins',
    'tut.coin.h': 'Grab a coin — coins buy skins and characters',
    'tut.dash.t': 'Dash',
    'tut.dash.h': 'Space — a quick dash forward',
    'tut.dash.hk': 'Space — a quick dash forward',
    'tut.dash.ht': 'The Dash button — a quick burst forward',
    'tut.hide.t': 'Hide in cover',
    'tut.hide.h': 'In bushes and boxes the seeker can’t see you from afar',
    'tut.decoy.t': 'Decoy',
    'tut.decoy.hk': 'E — send a ghost copy, the seeker chases it',
    'tut.decoy.ht': 'The Decoy button — a ghost copy distracts the seeker',
    'tut.cone.t': 'Stay out of the red cone!',
    'tut.cone.h': 'That is the seeker’s gaze. If spotted, it chases you. Survive until the timer ends',
    'hs.you': 'YOU',
    'hs.chest': 'Treasure!',
    'hs.waitTitle': 'Wait! Everyone is hiding',
    'hs.waitHint': 'You can move in',
    'hs.standToFree': 'Stand close to free',
    'hs.freeing': 'Freeing…',
    'hs.freed': '{name} is free!',
    'hs.escaped': '{name} escaped!',
});

/** Кольцо «освободить» над клеткой. */
const HS_RESCUE_CSS = '.hs-rescue{position:fixed;left:0;top:0;z-index:5;pointer-events:none;display:none;flex-direction:column;align-items:center;gap:4px;transform:translate(-50%,-100%);font:900 13px Nunito,Rubik,system-ui,sans-serif;color:#fff;text-shadow:0 2px 0 #12042b,0 0 6px #12042b;white-space:nowrap}'
    + '.hs-rescue-ring{position:relative;width:46px;height:46px;border-radius:50%;padding:5px;box-sizing:border-box;background:conic-gradient(#c2ff4a var(--p,0%),rgba(18,4,43,.78) 0);box-shadow:0 0 0 3px #12042b,0 0 14px rgba(194,255,74,.55)}'
    + '.hs-rescue-ring b{position:relative;display:block;width:100%;height:100%;border-radius:50%;background:#3d1790}'
    + '.hs-rescue-ring b::before{content:"";position:absolute;left:50%;top:55%;width:16px;height:12px;margin:-6px 0 0 -8px;border-radius:3px;background:#ffe45c}'
    + '.hs-rescue-ring b::after{content:"";position:absolute;left:50%;top:55%;width:6px;height:8px;margin:-15px 0 0 -6px;border:3px solid #ffe45c;border-bottom:0;border-radius:6px 6px 0 0}'
    + '.hs-rescue.on .hs-rescue-ring{animation:hs-rescue-pulse .45s ease-in-out infinite alternate}'
    + '@keyframes hs-rescue-pulse{to{transform:scale(1.12)}}';

/** Уведомление по центру в режиме «Искать»: ждать, пока все спрячутся. */
const HS_WAIT_CSS = '.hs-wait{position:fixed;left:50%;top:50%;z-index:6;pointer-events:none;display:none;flex-direction:column;align-items:center;gap:6px;transform:translate(-50%,-50%);padding:16px 28px 14px;border-radius:22px;'
    + 'background:linear-gradient(180deg,rgba(91,43,192,.96),rgba(42,15,102,.96));border:4px solid #12042b;box-shadow:0 6px 0 #12042b,inset 0 3px 0 rgba(255,255,255,.18),0 0 24px rgba(167,123,255,.45);font-family:Nunito,Rubik,system-ui,sans-serif;color:#fff;text-align:center;'
    + 'text-shadow:0 2px 0 #12042b;animation:hs-wait-in .35s cubic-bezier(.3,1.6,.5,1)}'
    + '.hs-wait b{font-size:clamp(18px,4.2vmin,30px);font-weight:900;letter-spacing:.02em}'
    + '.hs-wait span{font-size:clamp(12px,2.6vmin,16px);font-weight:800;opacity:.85}'
    + '.hs-wait i{font-style:normal;font-size:clamp(44px,11vmin,84px);font-weight:900;line-height:1;color:#ffe45c;text-shadow:0 4px 0 #12042b,0 0 18px rgba(255,228,92,.55)}'
    + '.hs-wait i.pop{animation:hs-wait-pop .5s cubic-bezier(.3,1.7,.5,1)}'
    + '@keyframes hs-wait-in{from{transform:translate(-50%,-50%) scale(.6);opacity:0}}'
    + '@keyframes hs-wait-pop{from{transform:scale(1.6)}}';

/** @satisfies {Record<string, any>} */
const Game = {
    /** @type {LoryApp | null} */
    app: null,
    /** @type {any} */
    save: null,
    state: 'menu',            // menu | tutorial | hide | seek | result
    role: 'hider',            // hider | seeker
    mapIndex: 0,
    time: 0,
    /** @type {HsAgent | null} */ player: null,
    /** @type {HsAgent | null} */ seeker: null,
    /** @type {HsAgent[]} */ bots: [],
    /** @type {HsSeekerBrain | null} */ seekerBrain: null,
    /** @type {HsBotBrain[]} */ botBrains: [],
    /** @type {HsVisionCone | null} */ cone: null,
    /** @type {HsGroundRing | null} */ ring: null,
    /** @type {HsPickups | null} */ pickups: null,
    /** @type {any[]} */ cages: [],
    /** @type {any} */ decoy: null,
    round: { coins: 0, gems: 0, caughtBots: 0, spotted: false, shieldUsed: false, magnet: false, decoys: 0, extraDash: 0, startedAt: 0 },
    shieldOn: false,
    menuT: 0,
    /** @type {any} */ aura: null,
    /** @type {HTMLElement | null} */ _rescueEl: null,
    /** @type {HTMLElement | null} */ _waitEl: null,
    /** @type {HsChest | null} */ chest: null,
    /** @type {any} */ chestGlow: null,
    _waitN: -1,
    /** @type {any} */ trailFx: null,
    /** @type {any} */ auraFx: null,
    auraId: '',
    trailId: '',
    invuln: 0,
    /** @type {any} */ lastReward: null,
    emotePreviewT: 0,
    busy: false,

    // ------------------------------------------------------------------ сохранение

    defaults() {
        return {
            coins: typeof HS_START_COINS !== 'undefined' ? HS_START_COINS : 150, gems: 10, xp: 0, level: 1, mapIndex: 0,
            skin: 'default', seeker: 'tung', owned: { skins: ['default'], seekers: ['tung'] },
            power: { dash: 0, decoy: 0, shield: 0, magnet: 0 }, settings: { music: true, sfx: true },
            tutorialDone: false, best: 0, wins: 0, rounds: 0, seekerBr: '',
        };
    },

    normalize(s) {
        const d = this.defaults();
        s = s && typeof s === 'object' ? s : {};
        const out = Object.assign({}, d, s);
        out.owned = Object.assign({}, d.owned, s.owned || {});
        out.power = Object.assign({}, d.power, s.power || {});
        out.settings = Object.assign({}, d.settings, s.settings || {});
        for (const k of ['skins', 'seekers']) if (!Array.isArray(out.owned[k])) out.owned[k] = d.owned[k].slice();
        if (out.owned.skins.indexOf('default') < 0) out.owned.skins.push('default');
        if (out.owned.seekers.indexOf('tung') < 0) out.owned.seekers.push('tung');
        out.mapIndex = Math.max(0, Math.min(HS_MAPS.length - 1, out.mapIndex | 0));
        return out;
    },

    persist() {
        try { Platform.save(this.save); } catch (e) { console.warn('save', e); }
        window.dispatchEvent(new CustomEvent('hs-save'));
    },

    async firstMap() {
        this.save = this.normalize(await Platform.load());
        this.mapIndex = this.save.mapIndex;
        return HS_MAPS[this.mapIndex].id;
    },

    // ------------------------------------------------------------------ запуск

    async init(app) {
        this.app = app;
        if (!this.save) this.save = this.normalize(await Platform.load());
        this.mapIndex = Math.max(0, HS_MAPS.findIndex(m => m.id === app.map.id));
        GameKit.register();
        this.initEconomy();
        GameCollect.st();
        GameCollect.accrue();
        await GameRecords.init();
        HudLayout.init({ app });
        Input.init({
            app, mouse: 'none', camera: true,
            // джойстик везде: палец на телефоне, мышь на ПК (ЛКМ слева — стик); клавиатура тоже работает
            mouseTouch: true, stickIdle: true,
            actions: {
                forward: { keys: ['KeyW', 'ArrowUp'], pad: [12] },
                back: { keys: ['KeyS', 'ArrowDown'], pad: [13] },
                left: { keys: ['KeyA', 'ArrowLeft'], pad: [14] },
                right: { keys: ['KeyD', 'ArrowRight'], pad: [15] },
                dash: { keys: ['Space', 'ShiftLeft', 'ShiftRight'], pad: [0] },
                decoy: { keys: ['KeyE', 'KeyQ'], pad: [2] },
                pause: { keys: ['KeyP'], pad: [9], rebind: false },
            },
        });
        Input.configure({ controls: false });
        // камера только следует за героем: ни средняя кнопка (панорама), ни колесо, ни щипок её не двигают
        app.camera.ignorePointer = () => true;
        const canvas = document.getElementById('world3d');
        window.addEventListener('wheel', e => { if (e.target === canvas) { e.stopPropagation(); e.preventDefault(); } }, { capture: true, passive: false });
        window.addEventListener('mousedown', e => { if (e.button === 1) e.preventDefault(); }, { capture: true });   // без автопрокрутки браузера
        GameFX.init(app);
        GameUI.init(app);
        this.applySettings();
        this.initTutorial();
        app.onUpdate(dt => Rig.updateAll(dt));
        window.addEventListener('lory-release-input', () => { /* Input сам отпускает клавиши */ });
        await this.prepareMap(app);
    },

    async ready() {
        this.enterMenu();
    },

    applySettings() {
        const s = this.save.settings;
        if (typeof Sound.setMuted === 'function') Sound.setMuted(!s.sfx && !s.music);
    },

    initTutorial() {
        const isTouch = () => Input.device === 'touch' || Input.mouseTouch;
        const near = (list) => {
            const p = this.player;
            if (!p || !list.length) return null;
            let best = null, bd = 1e9;
            for (const it of list) { const d = Math.hypot(it.x - p.x, it.y - p.y); if (d < bd) { bd = d; best = it; } }
            return best;
        };
        Tutorial.init({
            app: this.app,
            css: GameUI.tutorialCss || '',
            steps: [
                Tutorial.preset('move'),
                { id: 'coin', title: 'tut.coin.t', hint: 'tut.coin.h', world: () => { const c = near(this.pickups ? this.pickups.items.filter(i => i.alive && i.kind === 'coin') : []); return c ? { x: c.x, y: c.y, h: 40 } : null; } },
                { id: 'dash', title: 'tut.dash.t', hint: { keyboard: 'tut.dash.hk', touch: 'tut.dash.ht', mouse: 'tut.dash.ht', pad: 'tut.dash.hk' }, action: 'dash', target: () => document.querySelector('[data-hs="dash"]') },
                { id: 'hide', title: 'tut.hide.t', hint: 'tut.hide.h', world: () => { const h = near(HsPlaces.hides); return h ? { x: h.x, y: h.y, h: 120 } : null; } },
                { id: 'decoy', title: 'tut.decoy.t', hint: { keyboard: 'tut.decoy.hk', touch: 'tut.decoy.ht', mouse: 'tut.decoy.ht', pad: 'tut.decoy.hk' }, action: 'decoy', target: () => document.querySelector('[data-hs="decoy"]') },
            ],
            state: () => this.save, field: 'tutorialDone',
            persist: () => this.persist(),
            onFinish: () => { if (this.state === 'tutorial') this.beginHide(Math.min(6, this.hideTime())); },
        });
        void isTouch;
    },

    howToPlay() {
        this.save.tutorialDone = false;
        this.persist();
        this.play('hider');
    },

    // ------------------------------------------------------------------ карта и персонажи

    hideTime() { return typeof HS_HIDE_TIME !== 'undefined' ? HS_HIDE_TIME : 10; },
    seekTime() { return typeof HS_SEEK_TIME !== 'undefined' ? HS_SEEK_TIME : 50; },
    huntTime() { return typeof HS_HUNT_TIME !== 'undefined' ? HS_HUNT_TIME : 60; },

    /** Подготовка карты под экраном загрузки (повторяемая). */
    async prepareMap(app) {
        this.disposeActors();
        const loc = app.location;
        Nav.build(loc);
        HsPlaces.build(loc);
        GameGates.build(app);
        const info = this.mapInfo();
        this.pickups = new HsPickups(loc.view);
        this.cone = new HsVisionCone(loc.view.scene, '#ff3b3b');
        this.ring = new HsGroundRing(loc.view.scene, '#38d6ff', 46);
        this.auraFx = null; this.auraId = ''; this.trailFx = null; this.trailId = '';
        this.applyMapLight();
        const sp = loc.marker('spawn') || { x: 900, y: 900 };
        const sk = loc.marker('seeker') || { x: loc.width / 2, y: loc.height / 2 };
        this.player = new HsAgent('hider', 'me', sp.x, sp.y);
        this.player.isPlayer = true;
        this.player.name = Lang.t('hs.you');
        this.seeker = new HsAgent('seeker', 'seeker', sk.x, sk.y);
        this.seeker.radius = 28;
        this.bots = [];
        const names = (HS_BOT_NAMES[Lang.code] || HS_BOT_NAMES.ru).slice().sort(() => Math.random() - 0.5);
        const skins = HS_SKINS.map(s => s.id).filter(id => id !== this.save.skin).sort(() => Math.random() - 0.5);
        for (let i = 1; i <= 3; i++) {
            const m = loc.marker('bot-' + i) || HsPlaces.randomFree();
            const b = new HsAgent('hider', 'bot' + i, m.x, m.y);
            b.name = names[i - 1];
            b.skin = skins[i - 1] || 'default';
            this.bots.push(b);
        }
        await this.buildViews();
        this.spawnPickups();
        this.aimMenuCamera();
        app.camera.follow(this.camTarget);
        app.camera.snap();
    },

    /** Объект, за которым следит камера (меню — между героем и искателем). */
    camTarget: {
        x: 0, y: 0, h: 0, frameHeight: 1250, frameWidth: 1050,
    },

    async buildViews() {
        const view = this.app.location.view;
        const look = this.look();
        const playerSkin = this.role === 'seeker' ? null : look.skin;
        const tasks = [];
        // игрок: облик (прячется) или искатель (ищет)
        const big = typeof ST_SEEKER_SCALE !== 'undefined' ? ST_SEEKER_SCALE : 1.3;
        if (this.role === 'seeker') {
            this.player.view = new HsSeekerView(view, look.seeker, { scale: 1.15 });
            this.seeker.view = null;
        } else {
            this.player.view = new HsHiderView(view, playerSkin || 'default');
            this.seeker.view = new HsSeekerView(view, this.mapInfo().seeker, { scale: big });
        }
        tasks.push(this.player.view.ready);
        if (this.seeker.view) tasks.push(this.seeker.view.ready);
        const hats = HS_SHOP_ITEMS.filter(i => i.tab === 'hat');
        for (const b of this.bots) {
            b.view = new HsHiderView(view, b.skin); tasks.push(b.view.ready);
            if (Math.random() < 0.55) b.view.setHat(hats[Math.floor(Math.random() * hats.length)].id);   // боты тоже наряжаются
        }
        await Promise.all(tasks);
        if (this.role === 'hider' && look.hat) await this.player.view.setHat(look.hat);
        this.syncAura();
        this.syncAuraFx(look.aura);
        this.syncTrail(look.trail);
        this.placeAll(0);
    },

    syncAura() {
        if (this.aura) { this.aura.stop(); this.aura = null; }
        if (this.role !== 'hider' || !this.player || !this.player.view) return;
        const skin = hsSkin(this.look().skin || this.save.skin);
        if (skin.rarity !== 'common') {
            const p = this.player;
            this.aura = GameFX.skinAura(() => new BABYLON.Vector3(p.x, p.h + 60, p.y), skin.rarity);
        }
    },

    // ------------------------------------------------------------------ экономика: магазин, подарок дня, колесо

    initEconomy() {
        const s = this.save;
        const persist = () => this.persist();
        Shop.init({
            tabs: HS_SHOP_TABS, items: HS_SHOP_ITEMS, state: s.shop, persist,
            adsAvailable: () => Platform.rewardedSupported(),
        });
        s.shop = Shop.state;
        // перенос старого сохранения: монеты и купленное до магазина
        if (!s.econ) {
            if (s.coins > 0) Shop.addCoins(s.coins, { reason: 'migrate', save: false });
            for (const id of (s.owned.skins || []).concat(s.owned.seekers || [])) if (hsItem(id) && !Shop.owns(id)) Shop.grant(id, { reason: 'migrate', save: false });
            if (Shop.owns(s.skin)) Shop.equip(s.skin);
            if (Shop.owns(s.seeker)) Shop.equip(s.seeker);
            s.econ = 1;
        }
        s.coins = Shop.coins;
        Shop.on(e => {
            s.coins = Shop.coins;
            if (e.type === 'equip' || e.type === 'unequip') {
                const look = Shop.look();
                s.skin = look.skin || 'default'; s.seeker = look.seeker || 'tung';
            }
            if (e.type === 'equip' || e.type === 'unequip' || e.type === 'preview' || e.type === 'grant') this.applyLook();
            window.dispatchEvent(new CustomEvent('hs-save'));
        });
        DailyGift.init({ rewards: HS_DAILY_REWARDS, exclusive: HS_DAILY_EXCLUSIVE, rewardsSink: Shop, state: s.daily, persist });
        s.daily = DailyGift.state;
        DailyGift.on(e => {
            if (e.type === 'claim' && e.reward && e.reward.gems) { s.gems += e.reward.gems * (e.mult || 1); persist(); }
        });
        Wheel.init({ sectors: HS_WHEEL_SECTORS, rewardsSink: Shop, state: s.wheel, persist });
        s.wheel = Wheel.state;
        Wheel.on(e => {
            if (e.type !== 'prize') return;
            const sec = typeof e.sector === 'number' ? HS_WHEEL_SECTORS[e.sector] : e.sector;
            if (sec && sec.gems) { s.gems += sec.gems; persist(); }
        });
    },

    /** Что надето (с примеркой магазина): { skin, seeker, hat, trail, aura, emote }. */
    look() {
        const l = typeof Shop !== 'undefined' && Shop.look ? Shop.look() : {};
        const seeker = this.save.seekerBr && GameCollect.found(this.save.seekerBr) ? this.save.seekerBr : this.mapInfo().seeker;
        return { skin: l.skin || this.save.skin || 'default', seeker, hat: l.hat || '', trail: l.trail || '', aura: l.aura || 'aura_basic', emote: l.emote || 'win_confetti' };
    },

    /** Применить надетое к сцене: облик, шапка, аура, след, искатель (меню и раунд). */
    async applyLook() {
        if (!this.app || !this.player) return;
        const look = this.look();
        const view = this.app.location.view;
        if (this.role === 'hider') {
            if (!this.player.view || this.player.view.skinId !== look.skin) {
                const old = this.player.view;
                const nv = new HsHiderView(view, look.skin);
                this.player.view = nv;
                await nv.ready;
                if (this.player.view !== nv) { nv.dispose(); return; }
                if (old) old.dispose();
                nv.play(this.state === 'menu' ? 'wave' : 'idle');
                this.placeAll(0);
                this.syncAura();
            }
            if (this.player.view.setHat) this.player.view.setHat(look.hat);
        } else if (!this.player.view || this.player.view.seekerId !== look.seeker) {
            const old = this.player.view;
            const nv = new HsSeekerView(view, look.seeker, { scale: 1.15 });
            this.player.view = nv;
            await nv.ready;
            if (old) old.dispose();
            this.placeAll(0);
        }
        this.syncAuraFx(look.aura);
        this.syncTrail(look.trail);
    },

    syncAuraFx(id) {
        if (this.role !== 'hider') id = '';
        if (this.auraId === id && this.auraFx) return;
        if (this.auraFx) { this.auraFx.stop(); this.auraFx = null; }
        this.auraId = id;
        const P = this.player;
        if (id) this.auraFx = GameCosmetics.aura(id, this.app.location.view, () => ({ x: P.x, y: P.y, h: P.h }));
        if (this.auraFx && this.auraFx.stub) this.auraFx = null;
    },

    syncTrail(id) {
        if (this.trailId === id && (this.trailFx || !id)) return;
        if (this.trailFx) { this.trailFx.stop(); this.trailFx = null; }
        this.trailId = id;
        const P = this.player;
        if (id) this.trailFx = GameCosmetics.trail(id, () => ({ x: P.x, y: P.y, h: P.h, speed: this.state === 'menu' && this.previewRun ? 320 : P.speed }));
    },

    /** Магазин: примерка предмета на сцене меню (null — вернуть надетое). */
    shopPreview(id) {
        const it = id ? hsItem(id) : null;
        Shop.clearPreview();
        this.previewRun = false;
        this.emotePreviewT = 0;
        this.previewSeekerUntil = 0;
        if (it) {
            if (it.tab === 'seeker') {
                if (this.role === 'hider') { this.setMenuPreview('seeker', id); return; }
            }
            Shop.preview(id);
            if (it.tab === 'trail') this.previewRun = true;
            if (it.tab === 'emote') { this.emotePreviewT = 0.01; this._emoteId = id; }
        } else if (this.role === 'hider' && this.seeker.view && this.seeker.view.seekerId !== this.mapInfo().seeker) {
            this.setMenuPreview('seeker', this.mapInfo().seeker);
        }
        this.applyLook();
    },

    // ------------------------------------------------------------------ реклама за награду

    ads: {
        busy: false,
        ready() { return !Game.ads.busy && (typeof Platform.rewardedReady !== 'function' || Platform.rewardedReady()); },
        label() { return typeof Platform.rewardedCooldownLeft === 'function' && Platform.rewardedCooldownLeft() > 0 ? Platform.rewardedCooldownLabel() : ''; },
        /** Один rewarded: награда только по true, повторные нажатия во время показа игнорируются. */
        async run(id, give) {
            if (!this.ready()) return { ok: false, reason: this.busy ? 'busy' : 'cooldown' };
            this.busy = true;
            try {
                const ok = await Platform.rewarded(id);
                if (!ok) return { ok: false, reason: 'ad' };
                const extra = give() || {};
                Game.persist();
                return Object.assign({ ok: true }, extra);
            } catch (e) {
                return { ok: false, reason: 'error' };
            } finally { this.busy = false; }
        },
        /** Сколько даёт «+» у кошелька: 'coins' | 'gems'. */
        amount(kind) { return kind === 'gems' ? 8 : 120 + Game.save.level * 20; },
        coins() {
            return this.run('bonus-coins', () => {
                const n = this.amount('coins');
                Shop.addCoins(n, { reason: 'ad' });
                GameFX.sfx('buy');
                return { amount: n };
            });
        },
        gems() {
            return this.run('bonus-gems', () => { const n = this.amount('gems'); Game.save.gems += n; GameFX.sfx('buy'); return { amount: n }; });
        },
        doubleReward() {
            const r = Game.lastReward;
            if (!r || r.doubled || !(r.coins > 0)) return Promise.resolve({ ok: false, reason: 'none' });
            return this.run('round-x2', () => {
                r.doubled = true;
                Shop.addCoins(r.coins, { reason: 'x2' });
                GameFX.sfx('buy');
                return { coins: r.coins * 2 };
            });
        },
        extraDecoy() {
            if (Game.role !== 'hider' || (Game.state !== 'hide' && Game.state !== 'seek')) return Promise.resolve({ ok: false, reason: 'state' });
            return this.run('extra-decoy', () => { Game.round.decoys++; GameFX.orb({ x: Game.player.x, y: Game.player.y, h: 60 }, 'ghost'); });
        },
        powerup(id) {
            const p = HS_POWERUPS.find(i => i.id === id);
            if (!p) return Promise.resolve({ ok: false, reason: 'unknown' });
            return this.run('powerup', () => { Game.save.power[id] = (Game.save.power[id] || 0) + (p.pack || 1); GameFX.sfx('buy'); });
        },
    },

    /** Предложение посреди раунда (поймали / время вышло). Без UI или рекламы — сразу отказ. */
    offer(kind, accept, decline) {
        const ui = /** @type {any} */ (GameUI);
        if (typeof ui.offer !== 'function' || !Platform.rewardedSupported()) { decline(); return; }
        const prev = this.state;
        this.state = 'offer';
        this.offerPrev = prev;
        ui.offer(kind, {
            seconds: 7,
            onAccept: async () => {
                const r = await this.ads.run(kind === 'revive' ? 'revive' : 'extra-time', accept);
                if (!r.ok) decline();
                return r.ok;
            },
            onDecline: () => decline(),
        });
    },

    /** Продолжить после поимки: клетка улетает, искатель оглушён, 3 с неуязвимости. */
    revive() {
        const P = this.player;
        const c = this.cages.find(x => x.agent === P);
        if (c) c.lift = 0;
        P.caught = false; P.hidden = false; P.betrayed = false;
        P.dashCd = 0;
        if (P.view) { P.view.setAlpha(1); P.view.play('cheer', { restart: true }); }
        this.invuln = 3;
        this.round.revived = true;
        if (this.seekerBrain) { this.seekerBrain.aware.delete(P); this.seekerBrain.stun(); }
        GameFX.shield({ x: P.x, y: P.y, h: 80 });
        GameUI.banner('saved');
        this.state = 'seek';
        GameFX.music('game');
    },

    spawnPickups() {
        const loc = this.app.location;
        this.pickups.clear();
        for (const m of loc.markers('coin')) this.pickups.spawn('coin', m.x, m.y);
        for (const m of loc.markers('orb-dash')) this.pickups.spawn('dash', m.x, m.y);
        for (const m of loc.markers('orb-ghost')) this.pickups.spawn('ghost', m.x, m.y);
        GameGates.reset([this.player, this.seeker].concat(this.bots));   // в меню своя база открыта
    },

    disposeActors() {
        for (const a of [this.player, this.seeker].concat(this.bots)) if (a && a.view) a.view.dispose();
        if (this.decoy && this.decoy.view) this.decoy.view.dispose();
        this.decoy = null;
        this.removeChest();
        GameCollect.clearRound();
        GameGates.dispose();
        for (const c of this.cages) c.node.dispose();
        this.cages = [];
        if (this.cone) this.cone.dispose();
        if (this.ring) this.ring.dispose();
        if (this.pickups) this.pickups.dispose();
        if (this.aura) { this.aura.stop(); this.aura = null; }
        if (this.auraFx) { this.auraFx.stop(); this.auraFx = null; }
        if (this.trailFx) { this.trailFx.stop(); this.trailFx = null; }
        this.auraId = ''; this.trailId = '';
        this.cone = null; this.ring = null; this.pickups = null;
    },

    /** Небо, туман и свет темы карты (ночные темы темнее и холоднее). */
    applyMapLight() {
        const m = this.state === 'base' ? HS_MAPS[0] : (HS_MAPS[this.mapIndex] || HS_MAPS[0]);
        const night = m.id === 'neon' || m.id === 'space' || m.id === 'candy';
        World3D.setLighting({
            WORLD3D_SKY_COLOR: parseInt(m.sky.slice(1), 16),
            WORLD3D_FOG_DENSITY: 0.00012,
            WORLD3D_SUN_INTENSITY: night ? 0.62 : 0.82,
            WORLD3D_SKYLIGHT_INTENSITY: night ? 0.55 : 0.46,
            WORLD3D_SKYLIGHT_COLOR: night ? 0xb9a8ff : 0xc4e4ff,
            WORLD3D_SUN_COLOR: night ? 0xffd6f2 : 0xfff1d6,
        }, this.app.location.view);
    },

    /** @param {string} id */
    hasMap(id) { return this.app.maps.some(m => m.id === id); },

    mapInfo() {
        const m = HS_MAPS[this.mapIndex] || HS_MAPS[0];
        return { index: this.mapIndex, total: HS_MAPS.length, id: m.id, name: hsText(m.name), color: m.color, seeker: m.seeker, sky: m.sky };
    },

    levelInfo() {
        const s = this.save;
        const need = 100 + (s.level - 1) * 60;
        return { level: s.level, xp: s.xp, need, frac: Math.max(0, Math.min(1, s.xp / need)) };
    },

    // ------------------------------------------------------------------ меню

    /** Цель камеры меню — на герое сразу (даже если игра на автопаузе и кадров update нет). */
    aimMenuCamera() {
        const P = this.player, ct = this.camTarget;
        if (!P) return;
        ct.x = P.x; ct.y = P.y + 40; ct.h = 0;
        ct.frameHeight = 720; ct.frameWidth = 640;
    },

    enterMenu() {
        this.state = 'menu';
        Platform.gameplay(false);
        Input.configure({ controls: false });
        this.resetPositions();
        if (this.cone) this.cone.setVisible(false);
        GameUI.hud(false);
        GameUI.tags([]);
        this.rescueUi(null);
        this.waitUi(0);
        this.removeChest();
        GameCollect.clearRound();
        GameUI.menu(true);
        GameFX.music('menu');
        this.menuT = 0;
        this.aimMenuCamera();
        this.app.camera.snap();
        if (this.player.view) this.player.view.play(this.role === 'seeker' ? 'idle' : 'wave');
        if (this.seeker.view) this.seeker.view.play('idle');
        this.applyLook();
        // подарок дня — в меню, не во время обучения
        Tutorial.whenIdle(() => {
            const ui = /** @type {any} */ (GameUI);
            if (this.state === 'menu' && DailyGift.shouldOffer() && typeof ui.dailyOpen === 'function') { ui.dailyOpen(); DailyGift.markOffered(); }
        });
    },

    resetPositions() {
        const loc = this.app.location;
        const sp = loc.marker('spawn') || { x: 900, y: 900 };
        const sk = loc.marker('seeker') || { x: loc.width / 2, y: loc.height / 2 };
        const P = this.player, S = this.seeker;
        if (this.role === 'seeker') { P.x = sk.x; P.y = sk.y; S.x = -9999; S.y = -9999; } else { P.x = sp.x; P.y = sp.y; S.x = sk.x; S.y = sk.y; }
        P.caught = false; P.hidden = false; P.dashT = 0; P.dashCd = 0; P.heading = Math.PI / 2;
        S.caught = false; S.heading = Math.PI / 2;
        this.bots.forEach((b, i) => {
            const m = loc.marker('bot-' + (i + 1)) || HsPlaces.randomFree();
            b.x = m.x; b.y = m.y; b.caught = false; b.hidden = false; b.dashT = 0; b.dashCd = 0; b.path = null;
            if (b.view) { b.view.setAlpha(1); b.view.play('idle'); }
        });
        for (const c of this.cages) c.node.dispose();
        this.cages = [];
        this.placeAll(0);
    },

    /** Магазин: показать облик/искателя на сцене меню. */
    async setMenuPreview(kind, id) {
        if (this.state !== 'menu' && this.state !== 'result') return;
        const view = this.app.location.view;
        if (kind === 'skin' && this.role === 'hider') {
            const sid = id || this.save.skin;
            if (this.player.view && this.player.view.skinId === sid) return;
            const old = this.player.view;
            const nv = new HsHiderView(view, sid);
            this.player.view = nv;
            await nv.ready;
            if (old) old.dispose();
            nv.play('wave');
            this.placeAll(0);
            this.syncAuraPreview(sid);
        } else if (kind === 'seeker') {
            const sid = id || this.save.seeker;
            const target = this.role === 'seeker' ? this.player : this.seeker;
            if (target.view && target.view.seekerId === sid) return;
            const old = target.view;
            const nv = new HsSeekerView(view, sid);
            target.view = nv;
            await nv.ready;
            if (old) old.dispose();
            nv.play('cheer');
            this.placeAll(0);
            this.previewSeekerUntil = 4;
        }
    },

    syncAuraPreview(skinId) {
        if (this.aura) { this.aura.stop(); this.aura = null; }
        const skin = hsSkin(skinId);
        if (skin.rarity !== 'common') {
            const p = this.player;
            this.aura = GameFX.skinAura(() => new BABYLON.Vector3(p.x, p.h + 60, p.y), skin.rarity);
        }
    },

    // ------------------------------------------------------------------ раунд

    async play(role) {
        if (this.busy) return;
        this.busy = true;
        try {
            role = role === 'seeker' ? 'seeker' : 'hider';
            const needMap = HS_MAPS[this.save.mapIndex].id !== this.app.map.id && this.hasMap(HS_MAPS[this.save.mapIndex].id);
            const roleChanged = role !== this.role;
            this.role = role;
            GameUI.menu(false);
            if (needMap) {
                this.mapIndex = this.save.mapIndex;
                await this.app.loadMap(HS_MAPS[this.mapIndex].id, { prepare: app => this.prepareMap(app), label: this.mapInfo().name });
            } else if (roleChanged || (this.player.view && this.role === 'hider' && this.player.view.skinId !== this.save.skin)) {
                await this.rebuildViews();
            }
            this.startRound();
        } finally { this.busy = false; }
    },

    // ------------------------------------------------------------------ сбор брейнротов и база

    collect: GameCollect,

    /** За кого играть в режиме «Искать» (только найденный брейнрот). */
    setSeekerBrainrot(id) {
        if (!GameCollect.found(id)) return false;
        this.save.seekerBr = id;
        this.persist();
        if (this.state === 'menu' && this.role === 'seeker') this.applyLook();
        return true;
    },

    /** Перейти на свою базу (карта base). */
    async openBase() {
        if (this.busy || this.state !== 'menu' || !this.hasMap('base')) return;
        this.busy = true;
        try {
            GameUI.menu(false);
            this.state = 'base';
            await this.app.loadMap('base', { prepare: app => this.prepareBase(app), label: Lang.t('st.yourBase') });
            Input.configure({ controls: true });
            if (typeof stUi().baseHud === 'function') stUi().baseHud(true);
            GameFX.music('base');
            Platform.gameplay(true);
        } finally { this.busy = false; }
    },

    async prepareBase(app) {
        this.disposeActors();
        GameCollect.clearBase();
        const loc = app.location;
        Nav.build(loc);
        HsPlaces.build(loc);
        GameGates.build(app, { owner: true });
        this.ring = new HsGroundRing(loc.view.scene, '#38d6ff', 46);
        this.applyMapLight();
        const sp = loc.marker('spawn') || { x: loc.width / 2, y: loc.height - 300 };
        this.player = new HsAgent('hider', 'me', sp.x, sp.y);
        this.player.isPlayer = true;
        this.player.heading = -Math.PI / 2;
        this.seeker = null;
        this.bots = [];
        const look = this.look();
        this.player.view = new HsHiderView(loc.view, look.skin);
        await this.player.view.ready;
        if (look.hat) await this.player.view.setHat(look.hat);
        this.auraFx = null; this.auraId = ''; this.trailFx = null; this.trailId = '';
        this.syncAuraFx(look.aura);
        this.syncTrail(look.trail);
        GameCollect.app = app;
        GameCollect.syncPodiums();
        await Promise.all(GameCollect.podViews.filter(Boolean).map(pv => pv.view.ready));
        this.placeAll(0);
        const ct = this.camTarget;
        ct.x = this.player.x; ct.y = this.player.y - 120; ct.h = 0; ct.frameHeight = 1100; ct.frameWidth = 950;
        app.camera.follow(ct);
        app.camera.snap();
    },

    updateBase(dt) {
        const P = this.player, cam = this.app.camera;
        cam.azimuth += (-Math.PI / 2 - cam.azimuth) * Math.min(1, dt * 4);
        const ct = this.camTarget;
        ct.x = P.x; ct.y = P.y - 120;
        const m = this.moveDir();
        P.step(m.x, m.y, HsCfg.hiderSpeed * m.len, dt);
        P.anim = P.speed > 30 ? 'run' : 'idle';
        GameCollect.updateBase(dt, P);
        GameGates.update(dt, P, [P], [], false);
        this.placeAll(dt);
        this.stepFx(P, dt);
    },

    /** С базы — обратно в меню на текущую карту. */
    async closeBase() {
        if (this.busy || this.state !== 'base') return;
        this.busy = true;
        try {
            GameCollect.clearBase();
            if (typeof stUi().baseHud === 'function') stUi().baseHud(false);
            GameUI.tags([]);
            Platform.gameplay(false);
            Input.configure({ controls: false });
            this.state = 'menu';
            await this.app.loadMap(HS_MAPS[this.mapIndex].id, { prepare: app => this.prepareMap(app), label: this.mapInfo().name });
        } finally { this.busy = false; }
        this.enterMenu();
    },

    /** Переключатель «Прятаться / Искать» в меню: роль меняется сразу, персонаж на сцене — тот, за кого играем. */
    async setRole(role) {
        role = role === 'seeker' ? 'seeker' : 'hider';
        if (role === this.role || this.busy || this.state !== 'menu') { this.role = role; return; }
        this.busy = true;
        try {
            this.role = role;
            this.previewSeekerUntil = 0;
            await this.rebuildViews();
            this.resetPositions();
            await this.applyLook();
            this.aimMenuCamera();
            this.app.camera.snap();
            if (this.player.view) this.player.view.play(role === 'seeker' ? 'cheer' : 'wave');
        } finally { this.busy = false; }
    },

    async rebuildViews() {
        for (const a of [this.player, this.seeker].concat(this.bots)) if (a && a.view) { a.view.dispose(); a.view = null; }
        await this.buildViews();
    },

    startRound() {
        const s = this.save;
        this.resetPositions();
        this.spawnPickups();
        this.spawnChest();
        GameCollect.spawnRound(this.app, this.mapIndex);
        GameGates.reset([this.player, this.seeker].concat(this.bots));
        this.round = { coins: 0, gems: 0, caughtBots: 0, spotted: false, shieldUsed: false, magnet: false, decoys: 1, extraDash: 0, startedAt: performance.now() };
        // воронка для аналитики площадки: карта и роль — ограниченный step_id (Telemetry.js)
        if (typeof Telemetry !== 'undefined') Telemetry.progress('started', this.mapInfo().id + '_' + this.role, { step_index: this.mapIndex + 1, role: this.role });
        // усиления из запаса: щит и магнит тратятся в начале раунда
        this.shieldOn = false;
        if (this.role === 'hider') {
            if (s.power.shield > 0) { s.power.shield--; this.shieldOn = true; }
            if (s.power.magnet > 0) { s.power.magnet--; this.round.magnet = true; }
            this.round.decoys = 1 + (s.power.decoy || 0); s.power.decoy = 0;
            this.round.extraDash = s.power.dash || 0; s.power.dash = 0;
        } else {
            this.round.extraDash = s.power.dash || 0; s.power.dash = 0;
        }
        this.persist();
        const taken = new Set();
        this.botBrains = this.bots.map((b, i) => new HsBotBrain(b, { skill: 0.35 + i * 0.25 + Math.min(0.3, this.mapIndex * 0.03), taken }));
        this.botBrains.forEach(br => { br.onDash = () => GameFX.dash(br.b); });
        this.seekerBrain = null;
        const hooks = {
            onSpot: t => this.onSpot(t),
            onCatch: t => this.onCatch(t),
            onLose: () => { if (this.role === 'hider') GameFX.music('game'); },
            onDecoyPop: d => { GameFX.decoy({ x: d.x, y: d.y, h: 0 }); },
            onSuspect: () => {
                const S = this.seeker, sp = this.app.location.view.projectToScreen(S.x, S.y, S.h + 300);
                if (sp.visible) GameUI.floatText(sp.x, sp.y, '?', 'power');
            },
        };
        if (this.role === 'hider') {
            this.seekerBrain = new HsSeekerBrain(this.seeker, { level: this.mapIndex, hooks });
        } else {
            // игрок — искатель: «мозг» нужен только для восприятия (кого видит конус)
            this.seekerBrain = new HsSeekerBrain(this.player, { level: 0, hooks: {} });
        }
        this.cone.setVisible(true);
        this.cone.setColor(this.role === 'seeker' ? '#ffcf3b' : '#ff3b3b', 1);
        GameUI.hud(true);
        Input.configure({ controls: true });
        Platform.gameplay(true);
        GameFX.sfx('go');
        GameFX.music('game');
        if (this.role === 'hider' && !s.tutorialDone && !Tutorial.active) {
            this.state = 'tutorial';
            this.time = this.hideTime();
            Tutorial.autoStart();
            if (!Tutorial.active) this.beginHide(this.hideTime());
        } else {
            this.beginHide(this.hideTime());
        }
        this.hudTick();   // HUD заполнен сразу, даже если игра стоит на автопаузе
    },

    beginHide(t) {
        this.state = 'hide';
        this.time = this.role === 'seeker' ? Math.min(t, typeof HS_HIDE_TIME_SEEKER !== 'undefined' ? HS_HIDE_TIME_SEEKER : 5) : t;
        GameUI.banner('hide');
        if (this.seekerBrain) this.seekerBrain.set('wait');
    },

    beginSeek() {
        this.state = 'seek';
        this.time = this.role === 'seeker' ? this.huntTime() : this.seekTime();
        GameUI.banner(this.role === 'seeker' ? 'hunt' : 'seek');
        GameFX.sfx('alarm');
        if (this.role === 'hider') this.seekerBrain.start();
        if (this.seeker.view) this.seeker.view.bump();
    },

    onSpot(t) {
        const pos = { x: t.x, y: t.y, h: t.h + 190 };
        GameFX.spotted(pos);
        if (t.isPlayer) {
            this.round.spotted = true;
            GameUI.banner('spotted');
            GameFX.music('chase');
        }
    },

    onCatch(t) {
        if (t.isPlayer && this.invuln > 0) { this.seekerBrain.stun(); return; }
        if (t.isPlayer && this.shieldOn) {
            this.shieldOn = false;
            this.round.shieldUsed = true;
            GameFX.shield({ x: t.x, y: t.y, h: t.h + 80 });
            GameUI.banner('saved');
            this.seekerBrain.stun();
            t.dash(Math.atan2(t.y - this.seeker.y, t.x - this.seeker.x));
            return;
        }
        this.catchAgent(t);
        if (this.seeker.view) { this.seeker.view.play('swing', { restart: true, loop: false }); this.seeker.view.bump(); }
        GameFX.swing({ x: t.x, y: t.y, h: 0 });
    },

    catchAgent(t) {
        t.caught = true; t.hidden = false;
        if (t.view) { t.view.setAlpha(1); t.view.play('caught', { loop: false, holdLast: true }); }
        GameFX.caught({ x: t.x, y: t.y, h: t.h + 60 });
        const cage = { node: null, x: t.x, y: t.y, t: 0, agent: t, rescue: 0, lift: -1 };
        this.cages.push(cage);
        hsSpawnCage(this.app.location.view, t.x, t.y).then(n => { if (this.cages.indexOf(cage) >= 0) cage.node = n; else n.dispose(); });
        if (t.isPlayer) {
            GameUI.banner('caught');
            setTimeout(() => {
                if (this.state === 'result') return;
                if (!this.round.revived) this.offer('revive', () => this.revive(), () => this.endRound(false));
                else this.endRound(false);
            }, 1100);
        } else {
            this.round.caughtBots++;
            GameUI.banner(this.role === 'seeker' ? 'found' : 'botCaught', t.name);
            if (this.role === 'seeker') {
                this.round.coins += 15;
                const sp = this.app.location.view.projectToScreen(t.x, t.y, t.h + 160);
                GameUI.floatText(sp.x, sp.y, '+15', 'coin');
                if (this.bots.every(b => b.caught)) setTimeout(() => this.endRound(true), 1200);
            }
        }
    },

    useDash() {
        const p = this.player;
        if (!p || (this.state !== 'hide' && this.state !== 'seek' && this.state !== 'tutorial') || p.caught) return false;
        if (p.dashCd > 0) {
            if (this.round.extraDash <= 0) { GameFX.sfx('error'); return false; }
            this.round.extraDash--;
        } else p.dashCd = typeof HS_DASH_COOLDOWN !== 'undefined' ? HS_DASH_COOLDOWN : 6;
        const m = this.moveDir();
        const dir = m.len > 0.1 ? Math.atan2(m.y, m.x) : p.heading;
        p.dash(dir);
        p.hidden = false;
        GameFX.dash(p);
        GameFX.sfx('whoosh');
        if (this.state === 'tutorial') Tutorial.complete('dash');
        return true;
    },

    useDecoy() {
        const p = this.player;
        if (this.role !== 'hider' || !p || (this.state !== 'hide' && this.state !== 'seek' && this.state !== 'tutorial') || p.caught) return false;
        if (this.round.decoys <= 0 || (this.decoy && this.decoy.alive)) { GameFX.sfx('error'); return false; }
        this.round.decoys--;
        if (this.decoy && this.decoy.view) this.decoy.view.dispose();
        const d = new HsAgent('hider', 'decoy', p.x, p.y);
        d.heading = p.heading;
        d.alive = true;
        d.life = typeof HS_DECOY_TIME !== 'undefined' ? HS_DECOY_TIME : 3.5;
        d.view = new HsHiderView(this.app.location.view, this.save.skin, { ghost: true });
        d.view.play('run');
        // бежит в сторону, противоположную искателю, по коридору
        const away = Math.atan2(p.y - this.seeker.y, p.x - this.seeker.x);
        d.goal = this.decoyGoal(p, p.heading, away);
        this.decoy = d;
        if (this.seekerBrain) this.seekerBrain.decoy = d;
        GameFX.decoy({ x: p.x, y: p.y, h: 60 });
        if (this.state === 'tutorial') Tutorial.complete('decoy');
        return true;
    },

    decoyGoal(p, heading, away) {
        let best = null, bs = -1e9;
        for (const c of HsPlaces.patrol.concat(HsPlaces.spots)) {
            const d = Math.hypot(c.x - p.x, c.y - p.y);
            if (d < 250 || d > 1100) continue;
            const a = Math.atan2(c.y - p.y, c.x - p.x);
            const s = Math.cos(a - heading) * 400 + Math.random() * 200 - Math.abs(d - 600) * 0.3;
            if (s > bs) { bs = s; best = c; }
        }
        void away;
        return best || HsPlaces.randomFree();
    },

    moveDir() {
        const m = Input.move();
        const az = this.app.camera.azimuth;
        // вперёд на экране = (cos az, sin az), вправо = (−sin az, cos az)
        const fx = Math.cos(az), fy = Math.sin(az), rx = -Math.sin(az), ry = Math.cos(az);
        const x = rx * m.x + fx * m.y, y = ry * m.x + fy * m.y;
        const len = Math.min(1, Math.hypot(x, y));
        return { x: len > 0 ? x / Math.hypot(x, y) * len : 0, y: len > 0 ? y / Math.hypot(x, y) * len : 0, len };
    },

    // ------------------------------------------------------------------ кадр

    update(dt) {
        if (!this.player || !this.app) return;
        // стик и кнопка на экране — только в игре: в окнах (итоги, предложение за рекламу, меню) их нет
        const play = this.state === 'hide' || this.state === 'seek' || this.state === 'tutorial' || this.state === 'base';
        if (Input.controls !== play) Input.configure({ controls: play });
        if (this.state === 'base') { this.updateBase(dt); return; }
        if (this.pickups) this.pickups.update(dt);
        this.updateCages(dt);
        if (this.state === 'menu' || this.state === 'result') this.updateMenu(dt);
        else this.updateRound(dt);
        this.placeAll(dt);
        this.updateTags();
    },

    updateMenu(dt) {
        this.menuT += dt;
        const P = this.player, S = this.seeker;
        P.step(0, 0, 0, dt);
        const focusSeeker = this.previewSeekerUntil > 0 && this.role === 'hider';
        if (this.previewSeekerUntil > 0) this.previewSeekerUntil -= dt;
        const target = focusSeeker ? S : P;
        const ct = this.camTarget;
        ct.x = target.x; ct.y = target.y + 40; ct.h = 0;
        ct.frameHeight = 720; ct.frameWidth = 640;
        // медленное покачивание камеры в меню
        this.app.camera.azimuth = -Math.PI / 2 + Math.sin(this.menuT * 0.25) * 0.35;
        if (P.view && this.state === 'menu') P.view.play(this.previewRun ? 'run' : this.role === 'seeker' ? 'cheer' : (Math.sin(this.menuT * 0.4) > 0.6 ? 'wave' : 'idle'));
        if (this.emotePreviewT > 0) {
            this.emotePreviewT -= dt;
            if (this.emotePreviewT <= 0) { GameCosmetics.emote(this._emoteId, { x: P.x, y: P.y, h: P.h }); this.emotePreviewT = 3; }
        }
        if (this.state === 'result') return;
        for (const b of this.bots) b.step(0, 0, 0, dt);
    },

    updateRound(dt) {
        const P = this.player, S = this.seeker, cam = this.app.camera;
        // камера: строго сверху-сзади, ориентация «север вверх»
        cam.azimuth += (-Math.PI / 2 - cam.azimuth) * Math.min(1, dt * 4);
        const ct = this.camTarget;
        ct.x = P.x; ct.y = P.y - 70; ct.h = 0;   // герой чуть ниже центра: сверху таймер и плашки HUD
        ct.frameHeight += (1250 - ct.frameHeight) * Math.min(1, dt * 3);
        ct.frameWidth += (1050 - ct.frameWidth) * Math.min(1, dt * 3);

        if (this.invuln > 0) this.invuln -= dt;
        const running = this.state === 'hide' || this.state === 'seek' || this.state === 'tutorial';
        if (running && this.state !== 'tutorial') {
            this.time -= dt;
            if (this.state === 'seek' && this.time <= 10 && Math.ceil(this.time) !== Math.ceil(this.time + dt)) {
                GameFX.sfx('tick');
                if (Math.ceil(this.time) === 10) GameUI.banner('last10');
            }
            if (this.time <= 0) {
                if (this.state === 'hide') this.beginSeek();
                else if (this.state === 'seek') {
                    if (this.role === 'seeker' && !this.round.timeAdded && this.bots.some(b => !b.caught)) {
                        this.time = 0;
                        this.offer('time', () => { this.time = 20; this.round.timeAdded = true; this.state = 'seek'; GameFX.sfx('go'); }, () => this.endRound(false));
                    } else this.endRound(this.role === 'hider');
                    return;
                }
            }
        }

        this.waitUi(this.role === 'seeker' && this.state === 'hide' ? Math.ceil(this.time) : 0);

        // игрок
        if (!P.caught) {
            const m = this.moveDir();
            const speed = this.role === 'seeker'
                ? (this.state === 'hide' ? 0 : (typeof HS_SEEKER_PLAYER_SPEED !== 'undefined' ? HS_SEEKER_PLAYER_SPEED : 370))
                : HsCfg.hiderSpeed;
            P.step(m.x, m.y, speed * m.len, dt);
            if (m.len > 0.1 && this.role === 'hider' && this.state === 'tutorial') { /* шаг move считает Tutorial */ }
            if (this.role === 'hider') {
                const h = HsPlaces.hideAt(P.x, P.y);
                const was = P.hidden;
                P.hidden = !!h && P.dashT <= 0;
                if (P.hidden && !was) { GameFX.footDust({ x: P.x, y: P.y, h: 40 }); if (this.state === 'tutorial') Tutorial.complete('hide'); }
            }
            P.anim = P.dashT > 0 ? 'dash' : P.speed > 30 ? (P.hidden ? 'sneak' : 'run') : (P.hidden ? 'sneak' : 'idle');
            if (this.role === 'seeker') P.anim = P.speed > 30 ? 'run' : (this.state === 'hide' ? 'look' : 'idle');
        }

        // клавиши и кнопки геймпада: Пробел/Shift — рывок, E/Q — обманка (экранные кнопки зовут то же)
        if (Input.pressed('dash')) this.useDash();
        if (Input.pressed('decoy')) this.useDecoy();

        // лазерные ворота баз: заперты/открыты, кнопка блокировки, взлом (игрок и искатель-бот)
        GameGates.update(dt, P, [P, S].concat(this.bots), this.role === 'hider' ? [P, S] : [P], running);

        // монеты и бонусы, спасение из клеток
        this.collectPickups(dt);
        // брейнротов подбирает только прячущийся: искатель их не трогает
        GameCollect.update(dt, P, this.state === 'hide' || this.state === 'seek' || this.state === 'tutorial', this.role === 'hider');
        this.updateRescue(dt);
        this.updateChest(dt);

        // искатель-ИИ и боты
        const seekPhase = this.state === 'seek';
        if (this.role === 'hider') {
            const targets = [P].concat(this.bots);
            if (this.state === 'seek') this.seekerBrain.update(targets, dt);
            else { S.step(0, 0, 0, dt); S.anim = 'look'; S.heading += Math.sin(performance.now() / 600) * dt * 0.8; }
            this.assignRescuers(S);
            for (const br of this.botBrains) {
                const b = br.b;
                const threatened = seekPhase && !b.caught && (this.seekerBrain.target === b || ((b.seenBy || 0) > 0.35 && Math.hypot(S.x - b.x, S.y - b.y) < 520));
                br.update(S, threatened, seekPhase, dt);
            }
        } else {
            // игрок-искатель: восприятие конусом раскрывает и пугает ботов
            const sb = this.seekerBrain;
            if (seekPhase) sb.perceive(this.bots, dt);
            this.assignRescuers(P);
            for (const br of this.botBrains) {
                const b = br.b;
                const aware = sb.aware.get(b) || 0;
                const threatened = seekPhase && !b.caught && (aware > 0.6 || (!b.hidden && Math.hypot(P.x - b.x, P.y - b.y) < 240 && Nav.los(P.x, P.y, b.x, b.y)));
                br.update(P, threatened, seekPhase, dt);
                if (seekPhase && !b.caught && !P.caught && Math.hypot(P.x - b.x, P.y - b.y) < HsCfg.catchDist + 10) {
                    P.anim = 'swing';
                    if (P.view) { P.view.play('swing', { restart: true, loop: false }); P.view.bump(); }
                    GameFX.swing({ x: b.x, y: b.y, h: 0 });
                    this.catchAgent(b);
                }
            }
        }

        // обманка
        this.updateDecoy(dt);

        // конус обзора
        const eye = this.role === 'seeker' ? P : S;
        const half = HsCfg.visionHalfDeg * Math.PI / 180;
        if (this.cone) this.cone.update(eye.x, eye.y, eye.heading, HsCfg.visionRange, half, eye.h);

        // музыка погони
        if (this.role === 'hider' && this.seekerBrain && this.seekerBrain.state !== 'chase' && this.round.spotted && this._chaseMusic) { GameFX.music('game'); this._chaseMusic = false; }
        if (this.role === 'hider' && this.seekerBrain && this.seekerBrain.target === P) this._chaseMusic = true;

        // шаги
        this.stepFx(P, dt); this.stepFx(S, dt);

        this.hudTick();
    },

    /** Боты идут выручать пойманных, если искатель далеко от клетки. */
    assignRescuers(seeker) {
        if (this.state !== 'seek') return;
        for (const br of this.botBrains) {
            const b = br.b;
            if (b.caught) { br.rescue = null; continue; }
            const c = br.rescue;
            if (c && (c.lift >= 0 || this.cages.indexOf(c) < 0 || Math.hypot(seeker.x - c.x, seeker.y - c.y) < 380)) br.rescue = null;
            if (br.rescue || br.state === 'flee') continue;
            for (const cg of this.cages) {
                if (cg.lift >= 0 || !cg.agent || cg.agent.isPlayer || cg.agent === b || cg.t < 1.5) continue;
                if (Math.hypot(cg.x - b.x, cg.y - b.y) < 900 && Math.hypot(seeker.x - cg.x, seeker.y - cg.y) > 750 && Math.random() < 0.02) { br.rescue = cg; break; }
            }
        }
    },

    stepFx(a, dt) {
        if (!a || a.speed < 120) return;
        a._stepAcc = (a._stepAcc || 0) + a.speed * dt;
        if (a._stepAcc > (a.role === 'seeker' ? 150 : 110)) { a._stepAcc = 0; GameFX.footDust({ x: a.x, y: a.y, h: 0 }); }
    },

    updateDecoy(dt) {
        const d = this.decoy;
        if (!d) return;
        if (d.alive) {
            d.life -= dt;
            const dist = d.goTo(d.goal.x, d.goal.y, HsCfg.hiderSpeed * 0.95, dt, 0.6);
            if (dist < 40) d.goal = HsPlaces.randomFree();
            if (d.life <= 0) { d.alive = false; GameFX.decoy({ x: d.x, y: d.y, h: 60 }); }
            if (d.view) { d.view.setPose(d.x, d.y, d.h, d.heading, d.speed, dt); d.view.setAlpha(0.5 + Math.sin(performance.now() / 90) * 0.12); }
        } else {
            if (d.view) d.view.dispose();
            if (this.seekerBrain && this.seekerBrain.decoy === d) this.seekerBrain.decoy = null;
            this.decoy = null;
        }
    },

    collectPickups(dt) {
        const P = this.player;
        if (!this.pickups || P.caught) return;
        const reach = 52;
        for (const it of this.pickups.items) {
            if (!it.alive || it.fly) continue;
            const d = Math.hypot(it.x - P.x, it.y - P.y);
            if (this.round.magnet && it.kind === 'coin' && d < 300) {
                const k = Math.min(1, dt * 7);
                it.x += (P.x - it.x) * k; it.y += (P.y - it.y) * k;
            }
            if (d < reach) {
                this.pickups.take(it);
                const pos = { x: it.x, y: it.y, h: 30 };
                const sp = this.app.location.view.projectToScreen(it.x, it.y, 60);
                if (it.kind === 'coin') {
                    this.round.coins++;
                    GameFX.coin(pos);
                    GameUI.floatText(sp.x, sp.y, '+1', 'coin');
                    if (this.state === 'tutorial') Tutorial.complete('coin');
                } else if (it.kind === 'dash') {
                    this.round.extraDash++;
                    P.dashCd = 0;
                    GameFX.orb(pos, 'dash');
                    GameUI.floatText(sp.x, sp.y, '+1', 'power');
                } else {
                    if (this.role === 'hider') this.round.decoys++;
                    else this.round.coins += 5;
                    GameFX.orb(pos, 'ghost');
                    GameUI.floatText(sp.x, sp.y, '+1', 'power');
                }
            }
        }
    },

    updateCages(dt) {
        for (const c of this.cages.slice()) {
            c.t += dt;
            if (c.lift >= 0) {
                // освобождён: клетка взлетает, крутится и тает
                c.lift += dt;
                if (c.node) {
                    c.node.position.set(c.x, c.lift * c.lift * 1400 + c.lift * 200, c.y);
                    const sc = Math.max(0.01, 1 - c.lift * 1.6);
                    c.node.scaling.set(sc, sc, sc);
                    c.node.rotation.y += dt * 9;
                }
                if (c.lift > 0.6) { if (c.node) c.node.dispose(); this.cages.splice(this.cages.indexOf(c), 1); }
                continue;
            }
            if (!c.node) continue;
            const k = Math.min(1, c.t / 0.35);
            const bounce = k < 1 ? 260 * (1 - k * k) : Math.max(0, Math.sin((c.t - 0.35) * 18) * 14 * Math.exp(-(c.t - 0.35) * 6));
            c.node.position.set(c.x, bounce, c.y);
            if (c.rescue > 0) c.node.position.x = c.x + Math.sin(c.t * 60) * 3 * c.rescue;   // клетку трясёт, пока её открывают
        }
    },

    /**
     * Спасение: свободный прячущийся стоит у клетки — она открывается за HS_RESCUE_TIME (бот — дольше).
     * Игрок видит кольцо прогресса над ближайшей клеткой.
     */
    updateRescue(dt) {
        const need = typeof HS_RESCUE_TIME !== 'undefined' ? HS_RESCUE_TIME : 1.5;
        const reach = typeof HS_RESCUE_DIST !== 'undefined' ? HS_RESCUE_DIST : 115;
        const rescuers = (this.role === 'hider' ? [this.player] : []).concat(this.bots).filter(a => !a.caught);
        let show = null;
        for (const c of this.cages.slice()) {
            if (c.lift >= 0 || !c.agent || !c.agent.caught || c.agent.isPlayer || c.t < 0.5) continue;
            let rate = 0;
            for (const a of rescuers) {
                if (a === c.agent || Math.hypot(a.x - c.x, a.y - c.y) > reach || a.dashT > 0) continue;
                rate = Math.max(rate, a.isPlayer ? 1 : 0.6);
            }
            c.rescue = rate > 0 ? c.rescue + dt * rate / need : Math.max(0, c.rescue - dt * 0.8);
            if (c.rescue >= 1) { this.freeCage(c); continue; }
            if (this.role === 'hider' && !this.player.caught) {
                const d = Math.hypot(this.player.x - c.x, this.player.y - c.y);
                if (d < 320 && (!show || d < show.d)) show = { c, d };
            }
        }
        this.rescueUi(show ? show.c : null);
    },

    freeCage(c) {
        const t = c.agent;
        c.lift = 0;
        c.rescue = 0;
        t.caught = false; t.hidden = false; t.betrayed = false; t.dashCd = 0;
        if (t.view) { t.view.setAlpha(1); t.view.play('cheer', { restart: true }); }
        if (this.seekerBrain) this.seekerBrain.aware.delete(t);
        const br = this.botBrains.find(x => x.b === t);
        if (br) { br.state = 'go'; br.goal = null; br.rescue = null; br.pickHide(this.role === 'hider' ? this.seeker : this.player); }
        for (const o of this.botBrains) if (o.rescue === c) o.rescue = null;
        if (this.role === 'seeker') this.round.caughtBots = Math.max(0, this.round.caughtBots - 1);
        GameFX.shield({ x: c.x, y: c.y, h: 90 });
        GameFX.sfx('buy');
        const sp = this.app.location.view.projectToScreen(c.x, c.y, 200);
        if (this.role === 'hider') {
            this.round.coins += 10;
            if (sp.visible) GameUI.floatText(sp.x, sp.y, Lang.t('hs.freed', { name: t.name }), 'power');
        } else if (sp.visible) GameUI.floatText(sp.x, sp.y, Lang.t('hs.escaped', { name: t.name }), 'power');
    },

    /** Сундук с монетами: одно случайное место на раунд (маркеры монет, укромные места, точки обхода). */
    spawnChest() {
        this.removeChest();
        const loc = this.app.location;
        const sp = loc.marker('spawn') || { x: 0, y: 0 };
        const sk = loc.marker('seeker') || { x: loc.width / 2, y: loc.height / 2 };
        const cand = loc.markers('hide-spot').concat(loc.markers('coin'), loc.markers('patrol'))
            .filter(m => Math.hypot(m.x - sp.x, m.y - sp.y) > 500 && Math.hypot(m.x - sk.x, m.y - sk.y) > 250 && !HsPlaces.hideAt(m.x, m.y));
        if (!cand.length) return;
        const m = cand[Math.floor(Math.random() * cand.length)];
        // монету под сундуком убрать, чтобы не мешала
        if (this.pickups) for (const it of this.pickups.items) if (it.alive && Math.hypot(it.x - m.x, it.y - m.y) < 40) this.pickups.take(it);
        this.chest = new HsChest(loc.view, m.x, m.y, Math.random() * Math.PI * 2);
        const c = this.chest;
        this.chestGlow = GameFX.skinAura(() => new BABYLON.Vector3(c.x, 50, c.y), 'legendary');
    },

    removeChest() {
        if (this.chestGlow) { this.chestGlow.stop(); this.chestGlow = null; }
        if (this.chest) { this.chest.dispose(); this.chest = null; }
    },

    updateChest(dt) {
        const c = this.chest;
        if (!c) return;
        c.update(dt);
        if (c.opened) {
            // открытый сундук через 1.8 с исчезает с облачком
            c.openT = (c.openT || 0) + dt;
            if (c.openT > 1.8 && c.vanish < 0) { c.vanish = 0; GameFX.decoy({ x: c.x, y: c.y, h: 40 }); }
            if (c.gone) this.removeChest();
            return;
        }
        const P = this.player;
        if (c.opened || P.caught || this.role !== 'hider' && this.state === 'hide') return;
        if (Math.hypot(P.x - c.x, P.y - c.y) > 95) return;
        c.open();
        if (this.chestGlow) { this.chestGlow.stop(); this.chestGlow = null; }
        GameFX.orb({ x: c.x, y: c.y, h: 60 }, 'dash');
        GameFX.coin({ x: c.x, y: c.y, h: 70 });
        GameFX.sfx('buy');
        // монеты высыпаются вокруг и ложатся на пол — их можно собрать
        const n = 8 + Math.floor(Math.random() * 5);
        for (let i = 0; i < n; i++) {
            const a = (i / n) * Math.PI * 2 + Math.random() * 0.5, r = 70 + Math.random() * 110;
            let tx = c.x + Math.cos(a) * r, ty = c.y + Math.sin(a) * r;
            if (Nav.ready && Nav.blocked(tx, ty, 14)) { tx = c.x + Math.cos(a) * 45; ty = c.y + Math.sin(a) * 45; }
            setTimeout(() => {
                if (!this.pickups || this.state === 'menu') return;
                this.pickups.spawn('coin', c.x, c.y).then(it => { it.fly = { t: 0, dur: 0.55 + Math.random() * 0.2, x0: c.x, y0: c.y, x1: tx, y1: ty, h0: 40, arc: 120 + Math.random() * 60 }; });
            }, 120 + i * 45);
        }
        const sp = this.app.location.view.projectToScreen(c.x, c.y, 160);
        if (sp.visible) GameUI.floatText(sp.x, sp.y, Lang.t('hs.chest'), 'coin');
    },

    /** «Жди! Все прячутся» с обратным отсчётом (режим «Искать», фаза пряток). n <= 0 — спрятать. */
    waitUi(n) {
        let el = this._waitEl;
        if (!el) {
            el = this._waitEl = document.createElement('div');
            el.className = 'hs-wait';
            el.innerHTML = '<b></b><i></i><span></span>';
            const st = document.createElement('style');
            st.textContent = HS_WAIT_CSS;
            document.head.appendChild(st);
            document.body.appendChild(el);
        }
        if (n <= 0) { if (el.style.display !== 'none') el.style.display = 'none'; this._waitN = -1; return; }
        if (el.style.display !== 'flex') {
            el.style.display = 'flex';
            /** @type {HTMLElement} */ (el.children[0]).textContent = Lang.t('hs.waitTitle');
            /** @type {HTMLElement} */ (el.children[2]).textContent = Lang.t('hs.waitHint');
        }
        if (n !== this._waitN) {
            this._waitN = n;
            const num = /** @type {HTMLElement} */ (el.children[1]);
            num.textContent = String(n);
            num.classList.remove('pop'); void num.offsetWidth; num.classList.add('pop');
            if (this.state === 'hide') GameFX.sfx('tick');
        }
    },

    /** Кольцо прогресса над ближайшей клеткой (DOM поверх холста). */
    rescueUi(c) {
        let el = this._rescueEl;
        if (!el) {
            el = this._rescueEl = document.createElement('div');
            el.className = 'hs-rescue';
            el.innerHTML = '<div class="hs-rescue-ring"><b></b></div><span></span>';
            const st = document.createElement('style');
            st.textContent = HS_RESCUE_CSS;
            document.head.appendChild(st);
            document.body.appendChild(el);
        }
        if (!c || this.state === 'menu' || this.state === 'result') { el.style.display = 'none'; return; }
        const p = this.app.location.view.projectToScreen(c.x, c.y, 360);   // выше ников над клеткой
        if (!p.visible) { el.style.display = 'none'; return; }
        el.style.display = 'flex';
        el.style.left = p.x + 'px'; el.style.top = p.y + 'px';
        el.style.setProperty('--p', Math.round(c.rescue * 100) + '%');
        el.classList.toggle('on', c.rescue > 0);
        const label = /** @type {HTMLElement} */ (el.lastElementChild);
        const txt = Lang.t(c.rescue > 0 ? 'hs.freeing' : 'hs.standToFree');
        if (label.textContent !== txt) label.textContent = txt;
    },

    /** Позы видов по логике. */
    placeAll(dt) {
        const all = [this.player, this.seeker].concat(this.bots);
        const viewerSeeks = this.role === 'seeker';
        for (const a of all) {
            if (!a || !a.view) continue;
            a.view.setPose(a.x, a.y, a.h, a.heading, a.speed, dt);
            if (a.view.play) a.view.play(a.anim || 'idle');
            if (a.role === 'hider' && a.view.setAlpha) {
                let alpha = 1;
                if (a.hidden && !a.caught) {
                    if (a.isPlayer) alpha = 0.5;
                    else if (viewerSeeks) alpha = (this.seekerBrain && (this.seekerBrain.aware.get(a) || 0) > 0.5) ? 0.6 : 0;
                    else alpha = 0.45;
                }
                a.view.setAlpha(alpha);
                // подсказка игроку-искателю: куст иногда шевелится
                if (viewerSeeks && a.hidden && !a.caught && this.state === 'seek') {
                    a._rustle = (a._rustle || 2 + Math.random() * 4) - dt;
                    if (a._rustle <= 0) { a._rustle = 3 + Math.random() * 4; GameFX.footDust({ x: a.x, y: a.y, h: 70 }); }
                }
            }
        }
        if (this.ring && this.player) {
            this.ring.update(this.player.x, this.player.y, this.player.h, dt);
            this.ring.setVisible(!this.auraFx && this.role === 'hider' && !this.player.caught);
            if (this.auraFx && this.auraFx.update) this.auraFx.update(dt);
        }
    },

    updateTags() {
        if (this.state === 'menu' || !this.app) { return; }
        const view = this.app.location.view;
        const list = [];
        const push = (a, kind, text, state, h) => {
            const p = view.projectToScreen(a.x, a.y, a.h + h);
            if (!p.visible) return;
            list.push({ id: a.id, x: p.x, y: p.y, text, kind, state });
        };
        const P = this.player;
        if (this.role === 'hider') {
            push(P, 'me', Lang.t('hs.you'), P.caught ? 'caught' : P.hidden ? 'hidden' : (P.seenBy || 0) > 0.3 ? 'spotted' : 'normal', 185);
            for (const b of this.bots) push(b, 'bot', b.name, b.caught ? 'caught' : b.hidden ? 'hidden' : (b.seenBy || 0) > 0.5 ? 'spotted' : 'normal', 185);
            push(this.seeker, 'seeker', hsText(hsSeekerDef(this.mapInfo().seeker).name), 'normal', 285);
        } else {
            push(P, 'me', Lang.t('hs.you'), 'normal', 285);
            for (const b of this.bots) {
                const aware = this.seekerBrain ? (this.seekerBrain.aware.get(b) || 0) : 0;
                if (b.hidden && !b.caught && aware < 0.5) continue;
                push(b, 'bot', b.name, b.caught ? 'caught' : aware > 0.6 ? 'spotted' : 'normal', 185);
            }
        }
        GameUI.tags(list);
    },

    hudTick() {
        const P = this.player, S = this.seeker;
        const view = this.app.location.view;
        let danger = 0, seekerDir = null;
        if (this.role === 'hider' && !P.caught && this.state !== 'tutorial') {
            const d = Math.hypot(S.x - P.x, S.y - P.y);
            const aware = this.seekerBrain ? (this.seekerBrain.aware.get(P) || 0) : 0;
            danger = Math.max(Math.min(1, aware), this.state === 'seek' ? Math.max(0, 1 - d / 900) * 0.6 : 0);
            if (this.seekerBrain && this.seekerBrain.target === P) danger = 1;
            const sp = view.projectToScreen(S.x, S.y, 120);
            if (!sp.visible && this.state === 'seek') {
                const pp = view.projectToScreen(P.x, P.y, 60);
                seekerDir = Math.atan2(sp.y - pp.y, sp.x - pp.x);
            }
        }
        const dashMax = typeof HS_DASH_COOLDOWN !== 'undefined' ? HS_DASH_COOLDOWN : 6;
        const lvl = this.levelInfo();
        GameUI.hudUpdate({
            phase: this.state === 'seek' ? 'seek' : 'hide',
            time: Math.max(0, this.time),
            coins: Shop.coins + this.round.coins,
            gems: this.save.gems,
            alive: (this.role === 'hider' ? [P].concat(this.bots) : this.bots).filter(a => !a.caught).length,
            total: this.role === 'hider' ? 4 : 3,
            caught: this.round.caughtBots,
            role: this.role,
            dash: { count: this.round.extraDash, cd: P.dashCd / dashMax },
            decoy: { count: this.round.decoys, cd: this.decoy && this.decoy.alive ? 1 : 0 },
            decoyAd: this.role === 'hider' && this.round.decoys <= 0 && Platform.rewardedSupported(),
            adLabel: this.ads.label(),
            level: lvl.level, xpFrac: lvl.frac,
            mapIndex: this.mapIndex, mapName: this.mapInfo().name,
            danger, seekerDir,
            hidden: !!P.hidden, shield: this.shieldOn,
            tutorial: this.state === 'tutorial',
        });
    },

    // ------------------------------------------------------------------ итоги

    endRound(win) {
        if (this.state === 'result') return;
        this.state = 'result';
        const s = this.save, r = this.round;
        Platform.gameplay(false);
        if (typeof Tutorial !== 'undefined' && Tutorial.active) Tutorial.finish('abort');
        Input.configure({ controls: false });
        if (this.cone) this.cone.setVisible(false);
        GameUI.tags([]);
        this.rescueUi(null);
        this.waitUi(0);
        GameCollect.clearRound();
        if (typeof Telemetry !== 'undefined') Telemetry.progress(win ? 'completed' : 'failed', this.mapInfo().id + '_' + this.role, { step_index: this.mapIndex + 1, role: this.role });
        const winBonus = win ? (typeof HS_WIN_COINS !== 'undefined' ? HS_WIN_COINS : 60) + this.mapIndex * 10 : 0;
        const coins = r.coins + winBonus;
        const gems = win ? (this.role === 'hider' ? (r.spotted ? 2 : 4) : 3) : 0;
        const xp = win ? 45 + this.mapIndex * 5 : 15;
        Shop.addCoins(coins, { reason: 'round', save: false });
        s.coins = Shop.coins;
        s.gems += gems; s.xp += xp;
        this.lastReward = { coins, doubled: false };
        s.rounds = (s.rounds || 0) + 1;
        // очки рекордов: всё заработанное за раунды (монеты раунда + победа), в таблицу — после каждого раунда
        s.score = (s.score || 0) + coins + (win ? 50 : 0) + r.caughtBots * 15;
        Platform.submitScore(s.score);
        let levelUp = false;
        for (let need = 100 + (s.level - 1) * 60; s.xp >= need; need = 100 + (s.level - 1) * 60) { s.xp -= need; s.level++; levelUp = true; s.gems += 5; }
        let unlocked = false;
        if (win) {
            s.wins = (s.wins || 0) + 1;
            if (this.role === 'hider' && s.mapIndex === this.mapIndex && s.mapIndex < HS_MAPS.length - 1) { s.mapIndex++; unlocked = true; }
        }
        this.persist();
        Platform.ads.roundEnded(win);
        if (win) { GameFX.win(); GameCosmetics.emote(this.look().emote, { x: this.player.x, y: this.player.y, h: this.player.h }); } else GameFX.lose();
        GameFX.music(null);
        // поза победы/поражения
        const P = this.player;
        if (P.view) P.view.play(win ? 'cheer' : (this.role === 'hider' ? 'caught' : 'idle'), win ? {} : { loop: false, holdLast: true });
        if (this.seeker.view && this.role === 'hider') this.seeker.view.play(win ? 'look' : 'cheer');
        const stars = win ? (this.role === 'hider' ? (r.spotted ? 2 : 3) - (r.shieldUsed ? 1 : 0) : Math.max(1, Math.min(3, 1 + Math.floor(this.time / 15)))) : 0;
        setTimeout(() => {
            GameUI.hud(false);
            GameUI.result({
                win, role: this.role, coins, gems, xp, levelUp, stars: Math.max(win ? 1 : 0, stars),
                survived: this.role === 'hider' ? win : undefined,
                botsCaught: this.role === 'hider' ? this.bots.filter(b => b.caught).length : r.caughtBots,
                total: 3, mapName: this.mapInfo().name, mapIndex: this.mapIndex,
                time: this.role === 'seeker' ? this.huntTime() - this.time : (performance.now() - r.startedAt) / 1000,
                unlocked, nextAvailable: s.mapIndex !== this.mapIndex || this.role === 'seeker' || !win ? true : false,
                level: s.level, xpFrac: this.levelInfo().frac,
            });
        }, win ? 600 : 900);
    },

    next() {
        Platform.ads.next(() => {
            if (this.save.mapIndex !== this.mapIndex) this.play(this.role);
            else this.play(this.role);
        });
    },

    retry() { Platform.ads.next(() => this.play(this.role)); },

    toMenu() {
        Platform.ads.next(async () => {
            if (this.save.mapIndex !== this.mapIndex && !this.busy && this.hasMap(HS_MAPS[this.save.mapIndex].id)) {
                this.busy = true;
                try {
                    this.mapIndex = this.save.mapIndex;
                    await this.app.loadMap(HS_MAPS[this.mapIndex].id, { prepare: app => this.prepareMap(app), label: this.mapInfo().name });
                } finally { this.busy = false; }
            }
            this.enterMenu();
        });
    },

    // ------------------------------------------------------------------ магазин

    shop: {
        /** @param {'skin'|'seeker'} kind @param {string} id */
        owns(kind, id) { return Shop.owns(id); },
        /** @param {'skin'|'seeker'} kind */
        equipped(kind) { return Game.look()[kind]; },
        canAfford(price) {
            if (!price) return true;
            if (price.gems) return Game.save.gems >= price.gems;
            return Shop.coins >= (price.coins || 0);
        },
        pay(price) {
            if (price.gems) Game.save.gems -= price.gems; else Shop.spend(price.coins || 0, { reason: 'powerup', save: false });
        },
        /** @param {'skin'|'seeker'} kind @param {string} id */
        buy(kind, id) { const r = Shop.buy(id); GameFX.sfx(r.ok ? 'buy' : 'error'); return r; },
        /** @param {'skin'|'seeker'} kind @param {string} id */
        equip(kind, id) { const r = Shop.equip(id); if (r.ok) GameFX.sfx('equip'); return r; },
        buyPowerup(id) {
            const p = HS_POWERUPS.find(i => i.id === id);
            if (!p) return { ok: false, reason: 'unknown' };
            if (!this.canAfford(p.price)) { GameFX.sfx('error'); return { ok: false, reason: 'money' }; }
            this.pay(p.price);
            Game.save.power[id] = (Game.save.power[id] || 0) + (p.pack || 1);
            Game.persist();
            GameFX.sfx('buy');
            return { ok: true };
        },
    },
};
