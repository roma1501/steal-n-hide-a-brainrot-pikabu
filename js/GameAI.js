// GameAI.js — логика персонажей: движение по Nav, восприятие искателя (конус + видимость + укрытия),
// мозг искателя (обход, погоня, поиск, обманка, оглушение щитом) и мозг ботов-прячущихся.
// Чистая логика: Babylon не спрашивается (инвариант 4). Числа — HS_* в Constants.js.


const HsCfg = {
    get hiderSpeed() { return typeof HS_HIDER_SPEED !== 'undefined' ? HS_HIDER_SPEED : 330; },
    get seekerPatrol() { return typeof HS_SEEKER_PATROL_SPEED !== 'undefined' ? HS_SEEKER_PATROL_SPEED : 210; },
    get seekerChase() { return typeof HS_SEEKER_CHASE_SPEED !== 'undefined' ? HS_SEEKER_CHASE_SPEED : 345; },
    get seekerPlayer() { return typeof HS_SEEKER_PLAYER_SPEED !== 'undefined' ? HS_SEEKER_PLAYER_SPEED : 370; },
    get levelSpeedUp() { return typeof HS_LEVEL_SPEEDUP !== 'undefined' ? HS_LEVEL_SPEEDUP : 0.025; },
    get visionRange() { return typeof HS_VISION_RANGE !== 'undefined' ? HS_VISION_RANGE : 620; },
    get visionHalfDeg() { return typeof HS_VISION_HALF_DEG !== 'undefined' ? HS_VISION_HALF_DEG : 34; },
    get senseRadius() { return typeof HS_SENSE_RADIUS !== 'undefined' ? HS_SENSE_RADIUS : 110; },
    get hideReveal() { return typeof HS_HIDE_REVEAL !== 'undefined' ? HS_HIDE_REVEAL : 55; },
    get spotTime() { return typeof HS_SPOT_TIME !== 'undefined' ? HS_SPOT_TIME : 0.45; },
    get loseTime() { return typeof HS_LOSE_TIME !== 'undefined' ? HS_LOSE_TIME : 1.8; },
    get catchDist() { return typeof HS_CATCH_DIST !== 'undefined' ? HS_CATCH_DIST : 70; },
    get dashSpeed() { return typeof HS_DASH_SPEED !== 'undefined' ? HS_DASH_SPEED : 980; },
    get dashTime() { return typeof HS_DASH_TIME !== 'undefined' ? HS_DASH_TIME : 0.28; },
    get dashCooldown() { return typeof HS_DASH_COOLDOWN !== 'undefined' ? HS_DASH_COOLDOWN : 6; },
    get decoyTime() { return typeof HS_DECOY_TIME !== 'undefined' ? HS_DECOY_TIME : 3.5; },
    get stunTime() { return typeof HS_STUN_TIME !== 'undefined' ? HS_STUN_TIME : 2; },
};

const HS_RADIUS = 26;

/** Логическое тело персонажа. */
class HsAgent {
    /** @param {'hider'|'seeker'} role @param {string} id */
    constructor(role, id, x, y) {
        this.role = role;
        this.id = id;
        this.x = x; this.y = y; this.h = 0;
        this.heading = 0;        // курс модели (сглаженный)
        this.vx = 0; this.vy = 0;
        this.speed = 0;
        this.radius = HS_RADIUS;
        this.caught = false;
        this.hidden = false;     // стоит в укрытии
        this.hideRec = null;
        this.dashT = 0;          // осталось рывка, с
        this.dashCd = 0;         // перезарядка рывка, с
        this.dashDir = 0;
        /** @type {{x:number,y:number}[] | null} */ this.path = null;
        this.pathT = 0;
        this.stuck = 0;
        this.name = '';
        this.isPlayer = false;
        this.anim = 'idle';
        this.view = null;
        this.skin = 'default';
        this.alive = true;       // обманка: ещё бежит
        this.life = 0;
        /** @type {{x:number,y:number} | null} */ this.goal = null;
        this.seenBy = 0;         // 0..1: насколько искатель его замечает
        this.betrayed = false;   // искатель видел, как он залез в укрытие — укрытие его не спасёт
        this._wasHidden = false;
        this._stepAcc = 0;
        this._rustle = 0;
        /** @type {{x:number,y:number} | null} */ this._goal = null;
    }

    /** Шаг со скольжением по стенам; направление (dx, dy) — единичный вектор или 0. */
    step(dx, dy, speed, dt) {
        let vx = dx * speed, vy = dy * speed;
        if (this.dashT > 0) {
            this.dashT -= dt;
            vx = Math.cos(this.dashDir) * HsCfg.dashSpeed; vy = Math.sin(this.dashDir) * HsCfg.dashSpeed;
        }
        const ox = this.x, oy = this.y;
        if (vx || vy) {
            const p = Nav.ready ? Nav.move(this.x, this.y, vx * dt, vy * dt, this.radius) : { x: this.x + vx * dt, y: this.y + vy * dt };
            this.x = p.x; this.y = p.y;
        }
        const mx = this.x - ox, my = this.y - oy;
        this.speed = dt > 0 ? Math.hypot(mx, my) / dt : 0;
        this.vx = dt > 0 ? mx / dt : 0; this.vy = dt > 0 ? my / dt : 0;
        if (this.speed > 20) {
            const want = Math.atan2(my, mx);
            let d = want - this.heading;
            d = Math.atan2(Math.sin(d), Math.cos(d));
            this.heading += d * Math.min(1, dt * 14);
        }
        this.h = Nav.ready ? Nav.height(this.x, this.y) : 0;
        if (this.dashCd > 0) this.dashCd = Math.max(0, this.dashCd - dt);
    }

    dash(dir) {
        this.dashT = HsCfg.dashTime;
        this.dashDir = dir;
    }

    /** Идти к точке по пути Nav (пересчёт пути по таймеру). Возвращает расстояние до цели. */
    goTo(tx, ty, speed, dt, repath) {
        this.pathT -= dt;
        if (!this.path || this.pathT <= 0 || this._goal == null || Math.hypot(this._goal.x - tx, this._goal.y - ty) > 60) {
            this.path = Nav.ready ? Nav.path(this.x, this.y, tx, ty, this.radius, { partial: true }) : [{ x: tx, y: ty }];
            this._goal = { x: tx, y: ty };
            this.pathT = repath || 0.6;
        }
        const d = Math.hypot(tx - this.x, ty - this.y);
        let wp = this.path && this.path[0];
        while (wp && Math.hypot(wp.x - this.x, wp.y - this.y) < 18 && this.path.length > 1) { this.path.shift(); wp = this.path[0]; }
        if (!wp) wp = { x: tx, y: ty };
        const dx = wp.x - this.x, dy = wp.y - this.y, l = Math.hypot(dx, dy);
        if (l < 6) { this.step(0, 0, 0, dt); return d; }
        const sp = Math.min(speed, l / Math.max(dt, 1e-3));
        const bx = this.x, by = this.y;
        this.step(dx / l, dy / l, sp, dt);
        // застряли — новый путь
        if (Math.hypot(this.x - bx, this.y - by) < sp * dt * 0.2) { this.stuck += dt; if (this.stuck > 0.5) { this.pathT = 0; this.stuck = 0; } } else this.stuck = 0;
        return d;
    }
}

/** Места карты: укрытия, точки обхода, точки пряток. */
const HsPlaces = {
    hides: /** @type {{x:number,y:number,rec:any}[]} */ ([]),
    spots: /** @type {{x:number,y:number}[]} */ ([]),
    patrol: /** @type {{x:number,y:number}[]} */ ([]),
    arena: { x0: 500, y0: 500, x1: 3300, y1: 2300 },

    build(location) {
        this.hides = [];
        for (const def of location.map.objects) if (GameKit.isHide(def)) this.hides.push({ x: def.x, y: def.y, rec: def });
        this.spots = location.markers('hide-spot').map(m => ({ x: m.x, y: m.y }));
        this.patrol = location.markers('patrol').map(m => ({ x: m.x, y: m.y }));
        if (!this.patrol.length) {
            for (let i = 0; i < 10; i++) this.patrol.push(this.randomFree());
        }
    },

    randomFree() {
        const a = this.arena;
        for (let k = 0; k < 40; k++) {
            const x = a.x0 + 100 + Math.random() * (a.x1 - a.x0 - 200), y = a.y0 + 100 + Math.random() * (a.y1 - a.y0 - 200);
            if (!Nav.ready || !Nav.blocked(x, y, HS_RADIUS + 6)) return { x, y };
        }
        return { x: (a.x0 + a.x1) / 2, y: (a.y0 + a.y1) / 2 };
    },

    /** Укрытие, в котором стоит точка (или null). */
    hideAt(x, y) {
        for (const h of this.hides) if (Math.hypot(h.x - x, h.y - y) < 62) return h;
        return null;
    },
};

/** Видит ли искатель цель сейчас: 0 — нет, иначе сила (быстрее вблизи). */
function hsSees(seeker, target, range, half) {
    if (target.caught) return 0;
    const dx = target.x - seeker.x, dy = target.y - seeker.y, d = Math.hypot(dx, dy);
    // в укрытии не видно — только вплотную; если искатель видел, как туда залезли, укрытие не спасает
    if (target.hidden && !target.betrayed) return d < HsCfg.hideReveal ? 3 : 0;
    if (d < HsCfg.senseRadius) return 3;
    if (d > range) return 0;
    let a = Math.atan2(dy, dx) - seeker.heading;
    a = Math.atan2(Math.sin(a), Math.cos(a));
    if (Math.abs(a) > half) return 0;
    if (Nav.ready && !Nav.los(seeker.x, seeker.y, target.x, target.y)) return 0;
    return 1 + (1 - d / range) * 2.5;
}

/**
 * Мозг искателя (ИИ). События наружу — через hooks: onSpot(target), onCatch(target), onLose(), onState(s).
 */
class HsSeekerBrain {
    /** @param {HsAgent} body @param {{ level: number, hooks: any }} opts */
    constructor(body, opts) {
        this.b = body;
        this.state = 'wait';
        this.t = 0;
        this.level = opts.level || 0;
        this.hooks = opts.hooks || {};
        /** @type {HsAgent | null} */ this.target = null;
        this.lastSeen = null;
        this.unseen = 0;
        /** @type {Map<HsAgent, number>} */ this.aware = new Map();
        this.goal = null;
        this.visited = [];
        this.decoy = null;
        this.lookT = 0;
        this.searchSpin = 0;
        this.goalT = 0;
        this.goalBest = 1e9;
        this.clock = 0;
        /** @type {{x:number,y:number,until:number}[]} */ this.cool = [];   // места, где уже «принюхивался»
        this.suspectAt = null;
        this.chaseBest = 1e9;
        this.chaseT = 0;
    }

    get speedMul() { return 1 + this.level * HsCfg.levelSpeedUp; }

    set(state, t) { this.state = state; this.t = t || 0; if (this.hooks.onState) this.hooks.onState(state); }

    start() { this.set('patrol'); this.goal = null; }

    stun() { this.target = null; this.set('stun', HsCfg.stunTime); }

    /** Перцепция: копит «замеченность» по каждой цели. */
    perceive(targets, dt) {
        const range = HsCfg.visionRange, half = HsCfg.visionHalfDeg * Math.PI / 180;
        let best = null, bestA = 0;
        for (const t of targets) {
            if (t.caught) { this.aware.delete(t); continue; }
            if (t.hidden && !t._wasHidden) t.betrayed = this.target === t || (this.aware.get(t) || 0) > 0.5;
            if (!t.hidden) t.betrayed = false;
            t._wasHidden = t.hidden;
            const s = hsSees(this.b, t, range, half);
            let a = this.aware.get(t) || 0;
            a = s > 0 ? a + dt * s / HsCfg.spotTime : Math.max(0, a - dt * 0.6);
            this.aware.set(t, a);
            if (a >= 1 && a > bestA) { best = t; bestA = a; }
            t.seenBy = Math.max(t.seenBy || 0, Math.min(1, a));
        }
        return best;
    }

    update(targets, dt) {
        const b = this.b;
        this.t -= dt;
        this.clock += dt;
        this.cool = this.cool.filter(c => c.until > this.clock);
        for (const t of targets) t.seenBy = 0;
        if (this.state === 'wait') { b.step(0, 0, 0, dt); b.anim = 'look'; return; }
        if (this.state === 'stun') {
            b.step(0, 0, 0, dt); b.anim = 'idle';
            if (this.t <= 0) this.set('search', 1.5);
            return;
        }
        if (this.state === 'catch') {
            b.step(0, 0, 0, dt); b.anim = 'swing';
            if (this.t <= 0) { this.target = null; this.set('patrol'); this.goal = null; }
            return;
        }

        // обманка — приоритетнее патруля и поиска, но не погони вплотную
        if (this.decoy && this.decoy.alive && this.state !== 'chase') {
            const d = this.decoy;
            const dd = Math.hypot(d.x - b.x, d.y - b.y);
            if (dd < 900 && (dd < 300 || !Nav.ready || Nav.los(b.x, b.y, d.x, d.y))) {
                if (this.state !== 'decoy') { this.set('decoy'); if (this.hooks.onDecoy) this.hooks.onDecoy(); }
            }
        }

        const spotted = this.perceive(targets, dt);
        if (spotted && spotted !== this.target && this.state !== 'decoy') {
            this.target = spotted;
            this.chaseBest = 1e9; this.chaseT = 0;
            this.set('chase');
            if (this.hooks.onSpot) this.hooks.onSpot(spotted);
        }
        if (this.state === 'suspect') {
            // стоит у укрытия, принюхивается 2–3 с, потом уходит искать в другое место
            b.step(0, 0, 0, dt);
            const sa = this.suspectAt;
            const face = sa ? Math.atan2(sa.y - b.y, sa.x - b.x) : b.heading;
            let dh = face + Math.sin(this.t * 4) * 0.7 - b.heading;
            dh = Math.atan2(Math.sin(dh), Math.cos(dh));
            b.heading += dh * Math.min(1, dt * 6);
            b.anim = 'look';
            if (this.t <= 0) { this.set('patrol'); this.goal = this.pickGoal(targets, sa); this.goalT = 0; this.goalBest = 1e9; }
            return;
        }

        const sp = this.speedMul;
        if (this.state === 'chase' && this.target) {
            const tg = this.target;
            if (tg.caught) { this.target = null; this.set('patrol'); return; }
            if (tg.hidden && !tg.betrayed) { this.suspect(tg.x, tg.y); return; }
            const dT = Math.hypot(tg.x - b.x, tg.y - b.y);
            if (dT < this.chaseBest - 15) { this.chaseBest = dT; this.chaseT = 0; } else this.chaseT += dt;
            if (this.chaseT > 1.4 && dT < 300) { tg.betrayed = false; this.suspect(tg.x, tg.y); return; }   // не подобраться — сдаётся
            const visible = hsSees(b, tg, HsCfg.visionRange * 1.15, Math.PI * 0.55) > 0 || (Nav.ready && Math.hypot(tg.x - b.x, tg.y - b.y) < 260 && Nav.los(b.x, b.y, tg.x, tg.y) && !tg.hidden);
            if (visible) { this.unseen = 0; this.lastSeen = { x: tg.x, y: tg.y }; } else this.unseen += dt;
            const gx = visible ? tg.x : this.lastSeen.x, gy = visible ? tg.y : this.lastSeen.y;
            b.goTo(gx, gy, HsCfg.seekerChase * sp, dt, 0.22);
            b.anim = 'run';
            if (Math.hypot(tg.x - b.x, tg.y - b.y) < HsCfg.catchDist && (!Nav.ready || Nav.los(b.x, b.y, tg.x, tg.y))) {
                this.set('catch', 0.85);
                b.heading = Math.atan2(tg.y - b.y, tg.x - b.x);
                if (this.hooks.onCatch) this.hooks.onCatch(tg);
                return;
            }
            if (this.unseen > HsCfg.loseTime) {
                this.target = null;
                this.set('search', 2.6);
                if (this.hooks.onLose) this.hooks.onLose();
            }
            return;
        }
        if (this.state === 'decoy') {
            const d = this.decoy;
            if (!d || !d.alive) { this.set('search', 1.4); return; }
            const dist = b.goTo(d.x, d.y, HsCfg.seekerChase * sp, dt, 0.3);
            b.anim = 'run';
            if (dist < 70) { d.alive = false; if (this.hooks.onDecoyPop) this.hooks.onDecoyPop(d); this.set('search', 1.6); }
            return;
        }
        if (this.state === 'search') {
            if (this.lastSeen && Math.hypot(this.lastSeen.x - b.x, this.lastSeen.y - b.y) > 40 && this.t > 1.2) {
                b.goTo(this.lastSeen.x, this.lastSeen.y, HsCfg.seekerPatrol * sp, dt, 0.5); b.anim = 'walk';
            } else {
                b.step(0, 0, 0, dt);
                b.heading += Math.sin(this.t * 3.2) * dt * 2.4;   // оглядывается
                b.anim = 'look';
            }
            if (this.t <= 0) { this.lastSeen = null; this.set('patrol'); this.goal = null; }
            return;
        }
        // patrol: рядом укрытие, в котором кто-то сидит, — остановиться и принюхаться (но не лезть внутрь)
        for (const t of targets) {
            if (t.caught || !t.hidden || t.betrayed) continue;
            const dd = Math.hypot(t.x - b.x, t.y - b.y);
            if (dd < 230 && !this.isCool(t.x, t.y)) { this.suspect(t.x, t.y); return; }
        }
        if (!this.goal) { this.goal = this.pickGoal(targets, null); this.goalT = 0; this.goalBest = 1e9; }
        const d = b.goTo(this.goal.x, this.goal.y, HsCfg.seekerPatrol * sp, dt, 0.8);
        b.anim = 'walk';
        // нет пути или топчется на месте — другая цель
        this.goalT += dt;
        if (d < this.goalBest - 20) { this.goalBest = d; this.goalT = 0; }
        const last = b.path && b.path[b.path.length - 1];
        const unreachable = last && Math.hypot(last.x - this.goal.x, last.y - this.goal.y) > 90;
        if (this.goalT > 1.5 || (unreachable && d < 60 + Math.hypot(last.x - this.goal.x, last.y - this.goal.y))) { this.goal = null; return; }
        if (d < 45) {
            this.visited.push(this.goal); if (this.visited.length > 4) this.visited.shift();
            this.goal = null;
            if (Math.random() < 0.45) { this.set('search', 1.2 + Math.random()); this.lastSeen = null; }
        }
    }

    /** Принюхаться у места (x, y) 2–3 с и уйти; место остывает 15 с. */
    suspect(x, y) {
        this.target = null;
        this.suspectAt = { x, y };
        this.cool.push({ x, y, until: this.clock + 15 });
        this.set('suspect', 2 + Math.random());
        if (this.hooks.onSuspect) this.hooks.onSuspect(x, y);
    }

    isCool(x, y) { return this.cool.some(c => Math.hypot(c.x - x, c.y - y) < 420); }

    /** Следующая точка обхода: дальше от недавно посещённых и «остывших» мест, иногда — укрытие (проверить). */
    pickGoal(targets, awayFrom) {
        const b = this.b;
        // «чутьё»: иногда идёт в район, где кто-то прячется (иначе в большом лабиринте встреч мало)
        this.hunch = (this.hunch || 0) + 1;
        const alive = (targets || []).filter(t => !t.caught && !this.isCool(t.x, t.y));
        if (alive.length && (this.hunch % 3 === 0 || Math.random() < 0.2 + this.level * 0.03)) {
            const t = alive[Math.floor(Math.random() * alive.length)];
            const r = 120 + Math.random() * 220, a = Math.random() * Math.PI * 2;
            const gx = t.x + Math.cos(a) * r, gy = t.y + Math.sin(a) * r;
            if (!Nav.ready || !Nav.blocked(gx, gy, b.radius + 4)) return { x: gx, y: gy };
            return { x: t.x, y: t.y };
        }
        const pool = [];
        for (const p of HsPlaces.patrol) pool.push({ p, w: 1 });
        for (const h of HsPlaces.hides) pool.push({ p: h, w: 0.85 });
        for (const s of HsPlaces.spots) pool.push({ p: s, w: 0.45 });
        let best = null, bestS = -1e9;
        for (const it of pool) {
            const d = Math.hypot(it.p.x - b.x, it.p.y - b.y);
            if (d < 150) continue;
            let s = it.w * (300 + Math.min(d, 1400) * 0.4) + Math.random() * 600;
            for (const v of this.visited) if (Math.hypot(v.x - it.p.x, v.y - it.p.y) < 120) s -= 900;
            if (this.isCool(it.p.x, it.p.y)) s -= 1500;
            if (awayFrom && Math.hypot(it.p.x - awayFrom.x, it.p.y - awayFrom.y) < 700) s -= 1200;
            if (s > bestS) { bestS = s; best = it.p; }
        }
        return best ? { x: best.x, y: best.y } : HsPlaces.randomFree();
    }
}

/** Мозг бота-прячущегося. threat() — от кого бежать (искатель-ИИ или игрок-искатель). */
class HsBotBrain {
    /** @param {HsAgent} body @param {{ skill: number, taken: Set<any> }} opts */
    constructor(body, opts) {
        this.b = body;
        this.skill = opts.skill;
        this.taken = opts.taken;
        this.state = 'go';
        this.goal = null;
        this.fleeGoal = null;
        this.fleeT = 0;
        this.calm = 0;
        this.idleT = Math.random() * 3;
        /** @type {(() => void) | null} */ this.onDash = null;
        /** @type {any} */ this.rescue = null;   // клетка, которую бот идёт открывать (ставит Game)
    }

    /** Выбрать укрытие подальше от искателя и не занятое. */
    pickHide(seeker) {
        const b = this.b;
        let best = null, bestS = -1e9;
        const cand = HsPlaces.hides.map(h => ({ x: h.x, y: h.y, hide: h })).concat(HsPlaces.spots.map(s => ({ x: s.x, y: s.y, hide: null })));
        for (const c of cand) {
            if (this.taken.has(c.hide || c)) continue;
            const ds = seeker ? Math.hypot(c.x - seeker.x, c.y - seeker.y) : 800;
            const dm = Math.hypot(c.x - b.x, c.y - b.y);
            const s = Math.min(ds, 1600) * 0.8 - dm * 0.35 + (c.hide ? 260 : 0) + Math.random() * 500;
            if (s > bestS) { bestS = s; best = c; }
        }
        if (this.goal) this.taken.delete(this.goal.key);
        if (!best) best = Object.assign(HsPlaces.randomFree(), { hide: null });
        const key = best.hide || best;
        this.taken.add(key);
        this.goal = { x: best.x, y: best.y, key };
    }

    pickFlee(seeker) {
        const b = this.b;
        let best = null, bestS = -1e9;
        const cand = HsPlaces.patrol.concat(HsPlaces.spots, HsPlaces.hides);
        for (const c of cand) {
            const ds = Math.hypot(c.x - seeker.x, c.y - seeker.y), dm = Math.hypot(c.x - b.x, c.y - b.y);
            if (dm < 120) continue;
            // точка за спиной у искателя — плохо: проверяем, что идём «от» него
            const away = ((c.x - b.x) * (b.x - seeker.x) + (c.y - b.y) * (b.y - seeker.y)) / Math.max(1, dm * Math.hypot(b.x - seeker.x, b.y - seeker.y));
            const s = ds - dm * 0.25 + away * 500 + Math.random() * 120;
            if (s > bestS) { bestS = s; best = c; }
        }
        this.fleeGoal = best ? { x: best.x, y: best.y } : HsPlaces.randomFree();
        this.fleeT = 0.7;
    }

    /** @param {HsAgent} seeker @param {boolean} threatened @param {number} dt */
    update(seeker, threatened, seekPhase, dt) {
        const b = this.b;
        if (b.caught) { b.step(0, 0, 0, dt); b.anim = 'caught'; return; }
        const speed = HsCfg.hiderSpeed * (0.9 + 0.1 * this.skill);
        if (threatened) {
            if (this.state !== 'flee') { this.state = 'flee'; this.pickFlee(seeker); b.hidden = false; }
            this.calm = 0;
        } else if (this.state === 'flee') {
            this.calm += dt;
            if (this.calm > 1.6 && Math.hypot(seeker.x - b.x, seeker.y - b.y) > 420) { this.state = 'go'; this.pickHide(seeker); }
        }
        if (this.state === 'flee') {
            this.fleeT -= dt;
            if (this.fleeT <= 0 || !this.fleeGoal || Math.hypot(this.fleeGoal.x - b.x, this.fleeGoal.y - b.y) < 60) this.pickFlee(seeker);
            const dS = Math.hypot(seeker.x - b.x, seeker.y - b.y);
            if (dS < 190 && b.dashCd <= 0 && Math.random() < dt * (2 + this.skill * 4)) {
                b.dash(Math.atan2(b.y - seeker.y, b.x - seeker.x) * 0.5 + Math.atan2(this.fleeGoal.y - b.y, this.fleeGoal.x - b.x) * 0.5);
                b.dashCd = HsCfg.dashCooldown * 1.3;
                if (this.onDash) this.onDash();
            }
            b.goTo(this.fleeGoal.x, this.fleeGoal.y, speed, dt, 0.35);
            b.anim = b.dashT > 0 ? 'dash' : 'run';
            b.hidden = false;
            return;
        }
        if (this.rescue) {
            // выручить пойманного: подойти вплотную к клетке и стоять, пока не откроется
            const r = this.rescue;
            const dr = b.goTo(r.x + 40, r.y + 40, speed, dt, 0.5);
            b.hidden = false;
            b.anim = dr > 30 ? 'run' : 'idle';
            return;
        }
        if (!this.goal) this.pickHide(seeker);
        const d = b.goTo(this.goal.x, this.goal.y, seekPhase ? speed * 0.55 : speed, dt, 0.7);
        if (d < 22) {
            b.step(0, 0, 0, dt);
            const h = HsPlaces.hideAt(b.x, b.y);
            b.hidden = !!h; b.hideRec = h;
            b.anim = b.hidden ? 'sneak' : 'idle';
            // во время поиска иногда перепрятаться, пока искатель далеко (на открытом месте — чаще)
            this.idleT -= dt;
            if (seekPhase && this.idleT <= 0) {
                this.idleT = b.hidden ? 18 + Math.random() * 12 : 8 + Math.random() * 8;
                if (Math.hypot(seeker.x - b.x, seeker.y - b.y) > (b.hidden ? 950 : 700)) this.pickHide(seeker);
            }
        } else {
            b.hidden = !!HsPlaces.hideAt(b.x, b.y);
            b.anim = seekPhase ? 'sneak' : 'run';
        }
    }
}
