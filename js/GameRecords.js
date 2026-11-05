// GameRecords.js — окно «Рекорды» (лидерборд площадки Score: Яндекс, Playgama) и межстраничная реклама
// на кнопках интерфейса в сборке YouTube Playables (просьба пользователя); во время раунда — нет.
// Таблица — Platform.leaderboard() (ник, аватар, очки); нет таблицы у площадки — кнопки нет.
// Неавторизованному — кнопка «Войдите в аккаунт» (Platform.canLogin / login).

Object.assign(LANG_STRINGS.ru, {
    'rec.title': 'РЕКОРДЫ',
    'rec.button': 'РЕКОРДЫ',
    'rec.empty': 'Пока нет лучших игроков',
    'rec.loading': 'Загрузка…',
    'rec.login': 'Войдите в аккаунт',
    'rec.loginHint': 'Чтобы попасть в таблицу со своим именем',
    'rec.you': 'Ты',
    'rec.points': 'очков',
    'rec.loginWait': 'Входим…',
    'rec.loginFail': 'Не удалось войти. Попробуйте ещё раз.',
});
Object.assign(LANG_STRINGS.en, {
    'rec.title': 'LEADERBOARD',
    'rec.button': 'RECORDS',
    'rec.empty': 'No top players yet',
    'rec.loading': 'Loading…',
    'rec.login': 'Sign in',
    'rec.loginHint': 'To appear on the leaderboard with your name',
    'rec.you': 'You',
    'rec.points': 'pts',
    'rec.loginWait': 'Signing in…',
    'rec.loginFail': 'Could not sign in. Please try again.',
});

const HS_REC_CSS = '.hs-rec{position:fixed;inset:0;z-index:40;display:none;align-items:center;justify-content:center;background:rgba(14,4,40,.6);font-family:Nunito,Rubik,system-ui,sans-serif;color:#fff}'
    + '.hs-rec.on{display:flex}'
    + '.hs-rec-p{position:relative;width:min(440px,92%);max-height:86%;display:flex;flex-direction:column;border-radius:22px;padding:14px 14px 16px;background:linear-gradient(180deg,#5b2bc0,#2a0f66);border:4px solid #12042b;box-shadow:0 7px 0 #12042b,inset 0 3px 0 rgba(255,255,255,.16),0 0 30px rgba(167,123,255,.4);animation:hs-rec-in .35s cubic-bezier(.3,1.6,.5,1)}'
    + '.hs-rec-h{font-size:26px;font-weight:900;text-align:center;letter-spacing:.04em;color:#ffe45c;text-shadow:0 3px 0 #12042b;margin:2px 0 10px}'
    + '.hs-rec-x{position:absolute;right:-10px;top:-10px;width:44px;height:44px;border:3.5px solid #12042b;border-radius:13px;background:linear-gradient(180deg,#ff9fd2,#e0207f);box-shadow:0 4px 0 #12042b,inset 0 -3px 0 rgba(0,0,0,.18);cursor:pointer;color:#fff;font:1000 22px/1 Nunito,system-ui,sans-serif;text-shadow:0 2px 0 #12042b}'
    + '.hs-rec-x::before{content:"\\2715"}'
    + '.hs-rec-l{overflow:auto;display:flex;flex-direction:column;gap:6px;min-height:80px}'
    + '.hs-rec-r{display:flex;align-items:center;gap:10px;padding:7px 10px;border-radius:12px;background:rgba(14,4,40,.45);border:2px solid rgba(18,4,43,.6);font-weight:800;font-size:15px}'
    + '.hs-rec-r.me{background:linear-gradient(90deg,rgba(194,255,74,.38),rgba(194,255,74,.1));border:2px solid #c2ff4a}'
    + '.hs-rec-r b{min-width:28px;text-align:center;font-size:17px;color:#ffe45c;text-shadow:0 2px 0 #12042b}'
    + '.hs-rec-r img,.hs-rec-r i{width:34px;height:34px;border-radius:50%;flex:none;background:#6c3fe0;object-fit:cover}'
    + '.hs-rec-r span{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}'
    + '.hs-rec-r em{font-style:normal;color:#c2ff4a}'
    + '.hs-rec-e{padding:24px 8px;text-align:center;font-weight:800;opacity:.85}'
    + '.hs-rec-in{margin-top:12px;display:flex;flex-direction:column;align-items:center;gap:6px;font-size:13px;opacity:.95}'
    + '.hs-rec-in[hidden]{display:none}'
    + '.hs-rec-in button:disabled{filter:grayscale(.6) brightness(.85)}'
    + '.hs-rec-in button{border:0;border-radius:14px;padding:12px 22px;font:900 17px Nunito,Rubik,system-ui,sans-serif;color:#12042b;background:linear-gradient(180deg,#c2ff4a,#7be82a);border:3px solid #12042b;box-shadow:0 4px 0 #12042b;cursor:pointer}'
    + '@keyframes hs-rec-in{from{transform:scale(.7);opacity:0}}';

/** @satisfies {Record<string, any>} */
const GameRecords = {
    /** @type {HTMLElement | null} */ el: null,
    supported: false,

    async init() {
        try { this.supported = (await Platform.leaderboard()) !== null; } catch (e) { this.supported = false; }
        return this.supported;
    },

    _build() {
        if (this.el) return this.el;
        const st = document.createElement('style');
        st.textContent = HS_REC_CSS;
        document.head.appendChild(st);
        const el = this.el = document.createElement('div');
        el.className = 'hs-rec';
        el.innerHTML = '<div class="hs-rec-p"><button class="hs-rec-x" type="button"></button><div class="hs-rec-h"></div><div class="hs-rec-l"></div><div class="hs-rec-in" hidden><span></span><button type="button"></button></div></div>';
        document.body.appendChild(el);
        const close = () => this.close();
        /** @type {HTMLElement} */ (el.querySelector('.hs-rec-x')).addEventListener('click', close);
        el.addEventListener('click', e => { if (e.target === el) close(); });
        const loginBtn = /** @type {HTMLButtonElement} */ (el.querySelector('.hs-rec-in button'));
        loginBtn.addEventListener('click', async () => {
            if (loginBtn.disabled) return;
            const hint = /** @type {HTMLElement} */ (el.querySelector('.hs-rec-in span'));
            loginBtn.disabled = true;
            hint.textContent = Lang.t('rec.loginWait');
            let ok = false;
            try { ok = await Platform.login(); } catch (e) { ok = false; }
            loginBtn.disabled = false;
            if (ok) { try { await Platform.load(); } catch (e) { /* сохранение — по-старому */ } this.open(); }
            else hint.textContent = Lang.t('rec.loginFail');
        });
        return el;
    },

    async open() {
        const el = this._build();
        el.classList.add('on');
        /** @type {HTMLElement} */ (el.querySelector('.hs-rec-h')).textContent = Lang.t('rec.title');
        const list = /** @type {HTMLElement} */ (el.querySelector('.hs-rec-l'));
        list.innerHTML = '<div class="hs-rec-e"></div>';
        /** @type {HTMLElement} */ (list.firstElementChild).textContent = Lang.t('rec.loading');
        const login = /** @type {HTMLElement} */ (el.querySelector('.hs-rec-in'));
        const canLogin = !Platform.authorized() && Platform.canLogin();
        login.hidden = !canLogin;
        if (canLogin) {
            /** @type {HTMLElement} */ (login.querySelector('span')).textContent = Lang.t('rec.loginHint');
            /** @type {HTMLElement} */ (login.querySelector('button')).textContent = Lang.t('rec.login');
        }
        let rows = null;
        try { rows = await Platform.leaderboard({ avatarSize: 'medium' }); } catch (e) { rows = null; }
        list.innerHTML = '';
        if (!rows || !rows.length) {
            const e = document.createElement('div');
            e.className = 'hs-rec-e'; e.textContent = Lang.t('rec.empty');
            list.appendChild(e);
            return;
        }
        for (const r of rows) {
            const row = document.createElement('div');
            row.className = 'hs-rec-r' + (r.me ? ' me' : '');
            const rank = document.createElement('b'); rank.textContent = String(r.rank);
            let av;
            if (r.avatar) { av = document.createElement('img'); /** @type {HTMLImageElement} */ (av).src = r.avatar; /** @type {HTMLImageElement} */ (av).alt = ''; } else av = document.createElement('i');
            const name = document.createElement('span'); name.textContent = r.name || (r.me ? Lang.t('rec.you') : '—');
            const pts = document.createElement('em'); pts.textContent = String(r.score);
            row.append(rank, av, name, pts);
            list.appendChild(row);
        }
    },

    close() { if (this.el) this.el.classList.remove('on'); },

    /**
     * Playables: межстраничная реклама при нажатии кнопок интерфейса (не кнопок раунда «Рывок» / «Обманка»).
     * Запрос идёт ПОСЛЕ обработчика кнопки: если кнопка сама запустила рекламу за награду (Platform занят),
     * межстраничная не запрашивается — награда не срывается. Показ решает YouTube (SDK может ничего не показать).
     */
    uiAds: false,

    adsOnUiClicks() {
        if (this.uiAds) return;
        this.uiAds = true;
        document.addEventListener('click', e => {
            const t = /** @type {HTMLElement} */ (e.target);
            const btn = t && t.closest ? t.closest('button, [role="button"]') : null;
            if (!btn || btn.closest('.hs-ab')) return;
            if (!(Platform.name === 'playables' || location.search.indexOf('uiads') >= 0)) return;   // только Playables (uiads — проверка локально)
            // во время игрового процесса (раунд, обучение, предложение «продолжить») — никогда
            if (typeof Game !== 'undefined' && ['hide', 'seek', 'tutorial', 'offer'].indexOf(Game.state) >= 0) return;
            setTimeout(() => {
                if (Platform.adActive || Platform._adBusy || Platform.ads.busy) return;
                Platform.interstitial();
            }, 0);
        }, true);
    },
};

if (typeof document !== 'undefined') GameRecords.adsOnUiClicks();
