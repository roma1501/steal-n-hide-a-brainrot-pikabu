// GameUI.js — интерфейс «Steal n Hide a Brainrot»: меню, HUD, баннеры, ники, результат, магазин, настройки, Кодекс, база,
// инвентарь, подбор брейнротов в раунде. DOM поверх холста, стили вставляются из этого файла (<style id="hs-ui-css">).
// Контракт — docs/GAME-SPEC.md, раздел «GameUI (вызывает Game)», и docs/STEAL-SPEC.md, «API для UI». Тексты — ключи «ui.*», «hud.*»,
// «cx.*», «bs.*», «iv.*» (ru и en).
//
// Образ: «касса-наклейка». Фиолетовые пластиковые плашки с золотыми заклёпками (как на красной дорожке), чернильная обводка
// и жёсткая тень без свечения, наклонённые кнопки с бликом, лаймовые деньги, малиновые акценты, шрифт Nunito Black.
// Редкости — цвет --rc; «Бог брейнрота» переливается радугой, «Секрет» — белое на чёрном.
//
// Размеры. Меню, магазин, результат и баннеры меряются в «u» — единице текущего экрана (--u на #hs-ui, считает
// resize()); в CSS ниже запись «18u» превращается в calc(var(--u)*18). HUD раскладывает HudLayout: каждый блок
// — рамка data-hl, внутри .hs-fit проектного размера, масштаб --fit = размер блока / проектный размер.
// Анимации — transform, opacity и (на малых кнопках) фон; при prefers-reduced-motion тряска и бесконечные петли отключены.

// ---------------------------------------------------------------------------------------------------------
// Тексты
// ---------------------------------------------------------------------------------------------------------

Object.assign(LANG_STRINGS.ru, {
    'ui.logo1': 'STEAL N HIDE',
    'ui.logo2': 'A BRAINROT',
    'ui.play': 'ИГРАТЬ',
    'ui.roleHide': 'ПРЯТАТЬСЯ',
    'ui.roleSeek': 'ИСКАТЬ',
    'ui.shop': 'МАГАЗИН',
    'ui.skins': 'ОБЛИКИ',
    'ui.settings': 'НАСТРОЙКИ',
    'ui.seeker': 'Ищет',
    'ui.level': 'УРОВЕНЬ {n}',
    'ui.close': 'Закрыть',
    'ui.back': 'НАЗАД',
    'ui.tab.seekers': 'ПЕРСОНАЖИ',
    'ui.tab.skins': 'ОБЛИКИ',
    'ui.tab.power': 'УСИЛЕНИЯ',
    'ui.kind.seekers': 'Персонаж',
    'ui.kind.skins': 'Облик',
    'ui.kind.power': 'Усиление',
    'ui.owned': 'ПОЛУЧЕН',
    'ui.equipped': 'ВЫБРАН',
    'ui.buy': 'КУПИТЬ',
    'ui.wear': 'НАДЕТЬ',
    'ui.pick': 'ВЫБРАТЬ',
    'ui.free': 'БЕСПЛАТНО',
    'ui.noCoins': 'Не хватает монет!',
    'ui.noGems': 'Не хватает кристаллов!',
    'ui.noBuy': 'Не получилось купить',
    'ui.have': 'Есть: {n}',
    'ui.pack': '×{n}',
    'ui.sfx': 'Звуки',
    'ui.music': 'Музыка',
    'ui.quality': 'Графика',
    'ui.q.auto': 'АВТО',
    'ui.q.low': 'НИЗКАЯ',
    'ui.q.medium': 'СРЕДНЯЯ',
    'ui.q.high': 'ВЫСОКАЯ',
    'ui.on': 'ВКЛ',
    'ui.off': 'ВЫКЛ',
    'ui.howto': 'КАК ИГРАТЬ',
    'ui.prev': 'Назад',
    'ui.next': 'Вперёд',
    'hud.hide': 'ПРЯЧЬСЯ!',
    'hud.seek': 'ИЩЕТ!',
    'hud.wait': 'ЖДИ!',
    'hud.hunt': 'ЛОВИ!',
    'hud.caught': 'Поймано {a}/{b}',
    'hud.dash': 'РЫВОК',
    'hud.lunge': 'ВЫПАД',
    'hud.decoy': 'ОБМАНКА',
    'hud.hidden': 'В УКРЫТИИ',
    'hud.shield': 'ЩИТ',
    'hud.keySpace': 'Пробел',
    'bn.hide': 'ПРЯЧЬСЯ!',
    'bn.hideSeeker': 'ВСЕ ПРЯЧУТСЯ!',
    'bn.seek': 'ИЩЕТ!',
    'bn.hunt': 'ИЩИ!',
    'bn.spotted': 'ТЕБЯ ЗАМЕТИЛИ!',
    'bn.caught': 'ПОЙМАН!',
    'bn.saved': 'ЩИТ СПАС!',
    'bn.last10': '10 СЕКУНД!',
    'bn.botCaught': 'ПОЙМАН!',
    'bn.sufCaught': 'пойман!',
    'bn.sufFound': 'найден!',
    'hud.tutorial': 'ОБУЧЕНИЕ',
    'bn.found': 'НАШЁЛ!',
    'res.winHide': 'ТЫ СПРЯТАЛСЯ!',
    'res.winSeek': 'ВСЕ НАЙДЕНЫ!',
    'res.loseHide': 'ТЕБЯ НАШЛИ!',
    'res.loseSeek': 'ВРЕМЯ ВЫШЛО',
    'res.next': 'ДАЛЕЕ',
    'res.retry': 'ЕЩЁ РАЗ',
    'res.menu': 'МЕНЮ',
    'res.shop': 'МАГАЗИН',
    'res.newLevel': 'НОВЫЙ УРОВЕНЬ!',
    'res.unlocked': 'НОВАЯ КАРТА ОТКРЫТА!',
    'res.survived': 'Спрятались: {a}/{b}',
    'res.caught': 'Поймано: {a}/{b}',
    'res.time': 'Время {t}',
    'res.reward': 'НАГРАДА',
    'res.xp': 'ОПЫТ',
});
Object.assign(LANG_STRINGS.en, {
    'ui.logo1': 'STEAL N HIDE',
    'ui.logo2': 'A BRAINROT',
    'ui.play': 'PLAY',
    'ui.roleHide': 'HIDE',
    'ui.roleSeek': 'SEEK',
    'ui.shop': 'SHOP',
    'ui.skins': 'SKINS',
    'ui.settings': 'SETTINGS',
    'ui.seeker': 'Seeker',
    'ui.level': 'LEVEL {n}',
    'ui.close': 'Close',
    'ui.back': 'BACK',
    'ui.tab.seekers': 'CHARACTERS',
    'ui.tab.skins': 'SKINS',
    'ui.tab.power': 'POWER-UPS',
    'ui.kind.seekers': 'Character',
    'ui.kind.skins': 'Skin',
    'ui.kind.power': 'Power-up',
    'ui.owned': 'OWNED',
    'ui.equipped': 'SELECTED',
    'ui.buy': 'BUY',
    'ui.wear': 'WEAR',
    'ui.pick': 'SELECT',
    'ui.free': 'FREE',
    'ui.noCoins': 'Not enough coins!',
    'ui.noGems': 'Not enough gems!',
    'ui.noBuy': 'Could not buy it',
    'ui.have': 'Owned: {n}',
    'ui.pack': '×{n}',
    'ui.sfx': 'Sounds',
    'ui.music': 'Music',
    'ui.quality': 'Graphics',
    'ui.q.auto': 'AUTO',
    'ui.q.low': 'LOW',
    'ui.q.medium': 'MEDIUM',
    'ui.q.high': 'HIGH',
    'ui.on': 'ON',
    'ui.off': 'OFF',
    'ui.howto': 'HOW TO PLAY',
    'ui.prev': 'Previous',
    'ui.next': 'Next',
    'hud.hide': 'HIDE!',
    'hud.seek': 'SEEKING!',
    'hud.wait': 'WAIT!',
    'hud.hunt': 'CATCH!',
    'hud.caught': 'Caught {a}/{b}',
    'hud.dash': 'DASH',
    'hud.lunge': 'LUNGE',
    'hud.decoy': 'DECOY',
    'hud.hidden': 'HIDDEN',
    'hud.shield': 'SHIELD',
    'hud.keySpace': 'Space',
    'bn.hide': 'HIDE!',
    'bn.hideSeeker': 'EVERYONE IS HIDING!',
    'bn.seek': 'SEEKING!',
    'bn.hunt': 'SEEK!',
    'bn.spotted': 'YOU WERE SPOTTED!',
    'bn.caught': 'CAUGHT!',
    'bn.saved': 'SHIELD SAVED!',
    'bn.last10': '10 SECONDS!',
    'bn.botCaught': 'CAUGHT!',
    'bn.sufCaught': 'caught!',
    'bn.sufFound': 'found!',
    'hud.tutorial': 'TUTORIAL',
    'bn.found': 'FOUND ONE!',
    'res.winHide': 'YOU HID WELL!',
    'res.winSeek': 'ALL FOUND!',
    'res.loseHide': 'YOU WERE FOUND!',
    'res.loseSeek': 'TIME IS UP',
    'res.next': 'NEXT',
    'res.retry': 'AGAIN',
    'res.menu': 'MENU',
    'res.shop': 'SHOP',
    'res.newLevel': 'LEVEL UP!',
    'res.unlocked': 'NEW MAP UNLOCKED!',
    'res.survived': 'Hidden: {a}/{b}',
    'res.caught': 'Caught: {a}/{b}',
    'res.time': 'Time {t}',
    'res.reward': 'REWARD',
    'res.xp': 'XP',
});

// Этап 2: монетизация — магазин из 7 вкладок, реклама, подарок дня, колесо, предложения в раунде.
Object.assign(LANG_STRINGS.ru, {
    'ui.gift': 'ПОДАРОК',
    'ui.wheel': 'КОЛЕСО',
    'ui.locked': 'ЗАКРЫТО',
    'ui.bought': 'КУПЛЕНО',
    'ui.wearing': 'НАДЕТО',
    'ui.unequip': 'СНЯТЬ',
    'ui.exclusive': 'ПОДАРОК ДНЯ',
    'ui.adProg': 'За рекламу {a}/{b}',
    'ui.watchAd': 'ПОСМОТРЕТЬ РЕКЛАМУ',
    'ui.forAd': 'ЗА РЕКЛАМУ',
    'ui.adRunning': 'РЕКЛАМА…',
    'ui.wait': 'ПОДОЖДИ…',
    'ui.waitN': 'Через {n} с',
    'ui.adFail': 'Реклама не засчиталась. Прогресс сохранён, попробуй ещё раз.',
    'ui.adNone': 'Реклама сейчас недоступна. Попробуй позже.',
    'ui.needCoins': 'Не хватает монет: {n}',
    'ui.coinsAd': '+{n} монет за рекламу',
    'ui.coinsAd0': 'Монеты за рекламу',
    'ui.gemsAd': '+{n} кристаллов за рекламу',
    'ui.gemsAd0': 'Кристаллы за рекламу',
    'ui.popCoins': 'монет',
    'ui.popGems': 'кристаллов',
    'ui.popSub': 'за просмотр рекламы',
    'ui.opened': 'ОТКРЫТО!',
    'ui.peek': 'Посмотреть на сцене',
    'ui.empty': 'Здесь пока пусто',
    'ui.shopSoon': 'Магазин скоро откроется',
    'ui.gotIt': 'КРУТО!',
    'ui.got': 'ТЫ ПОЛУЧИЛ!',
    'ui.dup': 'Такой предмет уже есть, вместо него монеты',
    'ui.mystery': 'Случайный предмет',
    'ui.dg.title': 'ПОДАРОК ДНЯ',
    'ui.dg.claim': 'ЗАБРАТЬ',
    'ui.dg.x2': '×2 ЗА РЕКЛАМУ',
    'ui.dg.done': 'ПОЛУЧЕНО',
    'ui.dg.next': 'Следующий подарок через {t}',
    'ui.dg.goal': 'ЭКСКЛЮЗИВНЫЙ СКИН',
    'ui.dg.goalSub': 'Нигде больше не продаётся',
    'ui.dg.big': 'КРУПНАЯ НАГРАДА',
    'ui.dg.today': 'СЕГОДНЯ',
    'ui.dg.tomorrow': 'ЗАВТРА',
    'ui.dg.got': 'ПОЛУЧЕНО',
    'ui.wh.title': 'КОЛЕСО ФОРТУНЫ',
    'ui.wh.free': 'КРУТИТЬ БЕСПЛАТНО',
    'ui.wh.freeIn': 'Бесплатно через {t}',
    'ui.wh.ad': 'ЕЩЁ ВРАЩЕНИЕ ЗА РЕКЛАМУ',
    'ui.wh.left': 'Осталось {a} из {b}',
    'ui.wh.spinning': 'КРУТИТСЯ…',
    'ui.wh.win': 'ВЫИГРЫШ!',
    'res.x2': '×2 МОНЕТ ЗА РЕКЛАМУ',
    'res.x2done': 'УДВОЕНО!',
    'res.x2sub': 'ещё +{n}',
    'offer.revive.t': 'ТЕБЯ ПОЙМАЛИ!',
    'offer.revive.s': 'Продолжить за рекламу',
    'offer.revive.b': 'ПРОДОЛЖИТЬ',
    'offer.time.t': 'ВРЕМЯ ВЫШЛО!',
    'offer.time.s': '+20 секунд за рекламу',
    'offer.time.b': '+20 СЕКУНД',
    'offer.no': 'Нет, спасибо',
    'hud.decoyAd': '+1 ЗА РЕКЛАМУ',
});
Object.assign(LANG_STRINGS.en, {
    'ui.gift': 'GIFT',
    'ui.wheel': 'WHEEL',
    'ui.locked': 'LOCKED',
    'ui.bought': 'OWNED',
    'ui.wearing': 'EQUIPPED',
    'ui.unequip': 'TAKE OFF',
    'ui.exclusive': 'DAILY GIFT',
    'ui.adProg': 'Watch ads {a}/{b}',
    'ui.watchAd': 'WATCH AD',
    'ui.forAd': 'WATCH AD',
    'ui.adRunning': 'AD PLAYING…',
    'ui.wait': 'WAIT…',
    'ui.waitN': 'In {n} s',
    'ui.adFail': 'The ad was not counted. Your progress is saved, try again.',
    'ui.adNone': 'No ad right now. Try again later.',
    'ui.needCoins': 'Not enough coins: {n}',
    'ui.coinsAd': '+{n} coins: watch an ad',
    'ui.coinsAd0': 'Coins: watch an ad',
    'ui.gemsAd': '+{n} gems: watch an ad',
    'ui.gemsAd0': 'Gems: watch an ad',
    'ui.popCoins': 'coins',
    'ui.popGems': 'gems',
    'ui.popSub': 'for watching an ad',
    'ui.opened': 'UNLOCKED!',
    'ui.peek': 'See it on stage',
    'ui.empty': 'Nothing here yet',
    'ui.shopSoon': 'The shop opens soon',
    'ui.gotIt': 'AWESOME!',
    'ui.got': 'YOU GOT!',
    'ui.dup': 'You already have it, coins instead',
    'ui.mystery': 'Random item',
    'ui.dg.title': 'DAILY GIFT',
    'ui.dg.claim': 'CLAIM',
    'ui.dg.x2': '×2: WATCH AD',
    'ui.dg.done': 'CLAIMED',
    'ui.dg.next': 'Next gift in {t}',
    'ui.dg.goal': 'EXCLUSIVE SKIN',
    'ui.dg.goalSub': 'Not sold anywhere else',
    'ui.dg.big': 'BIG REWARD',
    'ui.dg.today': 'TODAY',
    'ui.dg.tomorrow': 'TOMORROW',
    'ui.dg.got': 'CLAIMED',
    'ui.wh.title': 'WHEEL OF FORTUNE',
    'ui.wh.free': 'SPIN FOR FREE',
    'ui.wh.freeIn': 'Free in {t}',
    'ui.wh.ad': 'SPIN AGAIN: WATCH AD',
    'ui.wh.left': '{a} of {b} left',
    'ui.wh.spinning': 'SPINNING…',
    'ui.wh.win': 'YOU WON!',
    'res.x2': '×2 COINS: WATCH AD',
    'res.x2done': 'DOUBLED!',
    'res.x2sub': '+{n} more',
    'offer.revive.t': 'YOU WERE CAUGHT!',
    'offer.revive.s': 'Continue: watch an ad',
    'offer.revive.b': 'CONTINUE',
    'offer.time.t': 'TIME IS UP!',
    'offer.time.s': '+20 seconds: watch an ad',
    'offer.time.b': '+20 SECONDS',
    'offer.no': 'No, thanks',
    'hud.decoyAd': '+1: WATCH AD',
});
Object.assign(LANG_STRINGS.ru, {
    'ui.dg.excl': 'ЭКСКЛЮЗИВ',
    'ui.dg.in': 'Через {n} дн.',
    'ui.wh.ready': 'Бесплатное вращение готово!',
    'ui.wh.nextFree': 'Следующее бесплатное через',
});
Object.assign(LANG_STRINGS.en, {
    'ui.dg.excl': 'EXCLUSIVE',
    'ui.dg.in': 'In {n} days',
    'ui.wh.ready': 'Your free spin is ready!',
    'ui.wh.nextFree': 'Next free spin in',
});

// Steal n Hide a Brainrot: сбор брейнротов, кодекс, база, инвентарь, подбор в раунде, мутации.
Object.assign(LANG_STRINGS.ru, {
    'ui.base': 'МОЯ БАЗА',
    'ui.codex': 'КОДЕКС',
    'ui.seekFor': 'ЗА КОГО ИСКАТЬ',
    'ui.seekNone': 'Найди брейнрота в раунде',
    'ui.seekNoneSub': 'Пойманный брейнрот появится здесь, и за него можно играть',
    'ui.seekMap': 'по умолчанию',
    'ui.rarity': 'Редкость',
    'cx.title': 'КОДЕКС БРЕЙНРОТОВ',
    'cx.found': 'Собрано {a}/{b}',
    'cx.all': 'ВСЕ',
    'cx.unknown': '???',
    'cx.hint': 'Подбирай брейнротов в раундах: встань рядом и жди',
    'cx.new': 'НОВЫЙ',
    'bs.title': 'МОЯ БАЗА',
    'bs.bank': 'КАССА',
    'bs.income': '+{n} в минуту',
    'bs.cap': 'до {n}',
    'bs.full': 'КАССА ПОЛНА!',
    'bs.empty': 'Поставь брейнротов на постаменты',
    'bs.collect': 'ЗАБРАТЬ ВСЁ',
    'bs.collectIn': 'ЧЕРЕЗ {n} С',
    'bs.x2': '×2 ЗА РЕКЛАМУ',
    'bs.menu': 'В МЕНЮ',
    'bs.inv': 'ИНВЕНТАРЬ',
    'bs.tip': 'Наступи на плиту у постамента',
    'iv.title': 'ИНВЕНТАРЬ',
    'iv.tabInv': 'БРЕЙНРОТЫ',
    'iv.tabSlots': 'ПОСТАМЕНТЫ',
    'iv.place': 'ПОСТАВИТЬ',
    'iv.sell': 'ПРОДАТЬ',
    'iv.sure': 'Точно продать?',
    'iv.yes': 'ДА',
    'iv.no': 'НЕТ',
    'iv.pick': 'Выбери постамент',
    'iv.noFree': 'Нет свободных постаментов',
    'iv.empty': 'Инвентарь пуст. Подбирай брейнротов в раундах!',
    'iv.income': '{n}/мин',
    'iv.slot': 'Постамент {n}',
    'iv.free': 'Свободно',
    'iv.remove': 'УБРАТЬ',
    'iv.unlock': 'ОТКРЫТЬ',
    'iv.locked': 'Закрыт',
    'iv.order': 'Сначала открой предыдущий постамент',
    'iv.fail': 'Не получилось',
    'iv.sold': 'Продано',
    'iv.on': 'на постаменте',
    'pk.sec': '{n} с',
    'cl.new': 'НОВЫЙ БРЕЙНРОТ!',
    'cl.plus': '+1 В КОЛЛЕКЦИЮ',
    'mu.gold': 'ЗОЛОТОЙ!',
    'mu.diamond': 'АЛМАЗНЫЙ!',
    'mu.rainbow': 'РАДУЖНЫЙ!',
    'mu.galaxy': 'ГАЛАКТИКА!',
    'hud.ghost': 'ПРИЗРАК',
});
Object.assign(LANG_STRINGS.en, {
    'ui.base': 'MY BASE',
    'ui.codex': 'CODEX',
    'ui.seekFor': 'PLAY AS',
    'ui.seekNone': 'Find a brainrot in a round',
    'ui.seekNoneSub': 'A brainrot you pick up shows up here, and you can seek as it',
    'ui.seekMap': 'default',
    'ui.rarity': 'Rarity',
    'cx.title': 'BRAINROT CODEX',
    'cx.found': 'Collected {a}/{b}',
    'cx.all': 'ALL',
    'cx.unknown': '???',
    'cx.hint': 'Pick up brainrots in rounds: stand close and wait',
    'cx.new': 'NEW',
    'bs.title': 'MY BASE',
    'bs.bank': 'CASH REGISTER',
    'bs.income': '+{n} per minute',
    'bs.cap': 'up to {n}',
    'bs.full': 'REGISTER FULL!',
    'bs.empty': 'Put brainrots on the podiums',
    'bs.collect': 'COLLECT ALL',
    'bs.collectIn': 'WAIT {n}S',
    'bs.x2': '×2: WATCH AD',
    'bs.menu': 'TO MENU',
    'bs.inv': 'INVENTORY',
    'bs.tip': 'Step on a pad by a podium',
    'iv.title': 'INVENTORY',
    'iv.tabInv': 'BRAINROTS',
    'iv.tabSlots': 'PODIUMS',
    'iv.place': 'PLACE',
    'iv.sell': 'SELL',
    'iv.sure': 'Really sell it?',
    'iv.yes': 'YES',
    'iv.no': 'NO',
    'iv.pick': 'Choose a podium',
    'iv.noFree': 'No free podiums',
    'iv.empty': 'Nothing here. Pick up brainrots in rounds!',
    'iv.income': '{n}/min',
    'iv.slot': 'Podium {n}',
    'iv.free': 'Free',
    'iv.remove': 'REMOVE',
    'iv.unlock': 'UNLOCK',
    'iv.locked': 'Locked',
    'iv.order': 'Unlock the previous podium first',
    'iv.fail': 'Did not work',
    'iv.sold': 'Sold',
    'iv.on': 'on a podium',
    'pk.sec': '{n} s',
    'cl.new': 'NEW BRAINROT!',
    'cl.plus': '+1 TO COLLECTION',
    'mu.gold': 'GOLDEN!',
    'mu.diamond': 'DIAMOND!',
    'mu.rainbow': 'RAINBOW!',
    'mu.galaxy': 'GALAXY!',
    'hud.ghost': 'GHOST',
});

// ---------------------------------------------------------------------------------------------------------
// Иконки (инлайн SVG, свои): плотная чернильная обводка, плоская заливка, блик. Палитра:
// лайм #c2ff4a/#7be82a, золото #ffe45c/#ffb81c, малина #ff7cc6/#f0348f, фиалка #a77bff/#6c3fe0, лёд #7ff0ff/#27b8f5.
// Монета и кристалл — файлы assets/ui/steal/coin.svg, gem.svg (нужны и как <img>, и как фон).
// ---------------------------------------------------------------------------------------------------------

const HSUI_K = '#12042b';
const HSUI_COIN = 'assets/ui/steal/coin.svg';
const HSUI_GEM = 'assets/ui/steal/gem.svg';

/** Фигура с чернильным контуром: shapes — path/circle/rect без fill и stroke. */
function hsuiOl(shapes, fill, w) {
    w = w || 3.2;
    return '<g fill="' + HSUI_K + '" stroke="' + HSUI_K + '" stroke-width="' + w + '" stroke-linejoin="round" stroke-linecap="round">' + shapes + '</g><g fill="' + fill + '">' + shapes + '</g>';
}
function hsuiSvg(vb, body) { return '<svg viewBox="' + vb + '">' + body + '</svg>'; }
/** Линия с контуром: d — путь, c — цвет, w — толщина цвета (контур толще на 2.6). */
function hsuiLn(d, c, w) {
    w = w || 2.6;
    const o = '" fill="none" stroke-linecap="round" stroke-linejoin="round" d="' + d + '"';
    return '<path stroke="' + HSUI_K + '" stroke-width="' + (w + 2.8) + o + '/><path stroke="' + c + '" stroke-width="' + w + o + '/>';
}
function hsuiPlayIc(ol) { return hsuiSvg('0 0 24 24', '<path d="M6.4 3.6L20 12 6.4 20.4z" fill="#fff" stroke="' + ol + '" stroke-width="2.6" stroke-linejoin="round"/>'); }
function hsuiDataUri(svg) { return 'data:image/svg+xml,' + encodeURIComponent(svg.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ')); }

const HSUI_ICON = {
    eyeOff: hsuiSvg('0 0 24 24', hsuiOl('<path d="M1.8 12S5.4 5.8 12 5.8 22.2 12 22.2 12 18.6 18.2 12 18.2 1.8 12 1.8 12z"/>', '#fff', 3) + '<circle cx="12" cy="12" r="3.7" fill="#7be82a" stroke="' + HSUI_K + '" stroke-width="1.4"/><circle cx="13.1" cy="10.9" r="1.1" fill="#fff"/>' + hsuiLn('M4 3.8l16 16.4', '#ff5cb8', 2.8)),
    search: hsuiSvg('0 0 24 24', hsuiLn('M15 15l6 6', '#ffb81c', 3.2) + hsuiOl('<circle cx="10" cy="10" r="6.8"/>', '#7ff0ff', 3) + '<path d="M6.2 9.4a4 4 0 0 1 3.4-3.4" fill="none" stroke="#fff" stroke-width="1.9" stroke-linecap="round"/>'),
    shield: hsuiSvg('0 0 24 24', hsuiOl('<path d="M12 1.8l8.4 3v6.3c0 5.2-3.6 9.2-8.4 11.1C7.2 20.3 3.6 16.3 3.6 11.1V4.8z"/>', '#27b8f5', 3) + '<path d="M12 4.5L6.4 6.5v4.6c0 3.7 2.4 6.6 5.6 8.1z" fill="#7ff0ff"/><path d="M12 7.4l1.3 2.8 3 .4-2.2 2 .6 3-2.7-1.5-2.7 1.5.6-3-2.2-2 3-.4z" fill="#fff"/>'),
    check: hsuiSvg('0 0 24 24', hsuiLn('M4.5 12.8l5 5 10-11', '#fff', 3.4)),
    cart: hsuiSvg('0 0 24 24', hsuiLn('M1.8 3.4h3.4l2.5 11h11l2.4-8H6.4', '#fff', 2.4) + '<circle cx="9.2" cy="19.4" r="2.2" fill="#fff" stroke="' + HSUI_K + '" stroke-width="1.5"/><circle cx="17.6" cy="19.4" r="2.2" fill="#fff" stroke="' + HSUI_K + '" stroke-width="1.5"/>'),
    shirt: hsuiSvg('0 0 24 24', hsuiOl('<path d="M8.4 3.2L2.2 6.4l2.2 4.6 2.4-1V20.6h10.4V10l2.4 1 2.2-4.6-6.2-3.2c-.6 1.6-1.9 2.4-3.6 2.4s-3-.8-3.6-2.4z"/>', '#ff7cc6', 2.8) + '<path d="M8.4 5.2L4.6 7l1 2.2 1.4-.6z" fill="#ffc2e4"/>'),
    bolt: hsuiSvg('0 0 24 24', hsuiOl('<path d="M13.8 1.6L4.2 13.4h6.2l-1.4 9 9.8-12.4h-6.4z"/>', '#ffe45c', 2.8) + '<path d="M12.6 4.6L7.6 11h4.4z" fill="#fffbd0"/>'),
    ghost: hsuiSvg('0 0 24 24', hsuiOl('<path d="M4.8 21.6V11.4a7.2 7.2 0 0 1 14.4 0v10.2l-2.4-2-2.4 2-2.4-2-2.4 2-2.4-2z"/>', '#f4efff', 2.8) + '<circle cx="9.4" cy="11" r="1.7" fill="' + HSUI_K + '"/><circle cx="14.6" cy="11" r="1.7" fill="' + HSUI_K + '"/><path d="M10.4 14.4c.9.7 2.3.7 3.2 0" fill="none" stroke="' + HSUI_K + '" stroke-width="1.5" stroke-linecap="round"/><path d="M7 8.4a5 5 0 0 1 2.6-2.2" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/>'),
    magnet: hsuiSvg('0 0 24 24', '<path d="M5.4 3.6v8.4a6.6 6.6 0 0 0 13.2 0V3.6" fill="none" stroke="' + HSUI_K + '" stroke-width="7.8" stroke-linejoin="round"/><path d="M5.4 3.6v8.4a6.6 6.6 0 0 0 13.2 0V3.6" fill="none" stroke="#ff4d6e" stroke-width="4.6"/><path d="M5.4 3.4v3.8M18.6 3.4v3.8" stroke="#f4f0ff" stroke-width="4.6"/>'),
    person: hsuiSvg('0 0 24 24', hsuiOl('<circle cx="12" cy="7.4" r="4.2"/><path d="M3.6 21.6c0-4.9 3.7-7.8 8.4-7.8s8.4 2.9 8.4 7.8z"/>', '#fff', 2.8)),
    house: hsuiSvg('0 0 24 24', hsuiOl('<path d="M2.6 11.6L12 3l9.4 8.6h-2.6V20.6h-4.6v-6H9.2v6H4.6V11.6z"/>', '#7ff0ff', 2.8)),
    base: hsuiSvg('0 0 24 24', hsuiOl('<path d="M3.4 11.4L12 4l8.6 7.4V21H3.4z"/>', '#fff3d6', 2.8) + hsuiOl('<path d="M1.6 12.4L12 2.6l10.4 9.8-1.6 1.7L12 6l-8.8 8.1z"/>', '#ffb81c', 2.4) + '<rect x="9.6" y="13.4" width="4.8" height="7.6" rx="1" fill="#ff5cb8" stroke="' + HSUI_K + '" stroke-width="1.5"/><circle cx="13.2" cy="17.4" r=".8" fill="#ffe45c"/>'),
    arrowL: hsuiSvg('0 0 24 24', hsuiLn('M15.4 4.6L7.6 12l7.8 7.4', '#fff', 3.4)),
    arrowR: hsuiSvg('0 0 24 24', hsuiLn('M8.6 4.6L16.4 12l-7.8 7.4', '#fff', 3.4)),
    play: hsuiPlayIc(HSUI_K),
    playY: hsuiPlayIc('#5c3300'),
    playG: hsuiPlayIc('#123a0a'),
    star: hsuiSvg('0 0 24 24', '<path d="M12 1.6l3.1 6.7 7.3.9-5.4 5 1.4 7.2L12 17.8 5.6 22.4 7 15.2 1.6 10.2l7.3-.9z" fill="currentColor" stroke="' + HSUI_K + '" stroke-width="1.8" stroke-linejoin="round"/>'),
    note: hsuiSvg('0 0 24 24', hsuiLn('M9 4.2l11-2v13.6M9.6 17V4.4', '#ff7cc6', 2.2) + hsuiOl('<circle cx="6.4" cy="17.6" r="3.4"/><circle cx="17.4" cy="15.6" r="3.2"/>', '#ff7cc6', 2.6)),
    speaker: hsuiSvg('0 0 24 24', hsuiOl('<path d="M3 9.2h4L12 4.6v14.8L7 14.8H3z"/>', '#c2ff4a', 2.6) + hsuiLn('M15.6 8.6a5 5 0 0 1 0 6.8M18.4 5.8a9 9 0 0 1 0 12.4', '#c2ff4a', 2)),
    gfx: hsuiSvg('0 0 24 24', hsuiOl('<rect x="2.6" y="4.4" width="18.8" height="12.6" rx="2.4"/>', '#7ff0ff', 2.6) + hsuiLn('M8 20.6h8M12 17.4v3', '#7ff0ff', 2.4)),
    question: hsuiSvg('0 0 24 24', hsuiOl('<circle cx="12" cy="12" r="9.6"/>', '#ffe45c', 2.4) + '<path d="M8.6 9.4c0-2 1.4-3.2 3.4-3.2s3.4 1.2 3.4 3c0 2.6-3.4 2.6-3.4 5.2" fill="none" stroke="' + HSUI_K + '" stroke-width="2.6" stroke-linecap="round"/><circle cx="12" cy="17.6" r="1.6" fill="' + HSUI_K + '"/>'),
    grid: hsuiSvg('0 0 24 24', '<path d="M3 3h18v18H3zM9 3v18M15 3v18M3 9h18M3 15h18" fill="none" stroke="#e8e0ff" stroke-width="2"/>'),
    /** Стрелка-указатель: цвет — currentColor (редкость, искатель). */
    arrow: hsuiSvg('0 0 48 40', '<path d="M44 20L10 2.4c-1.8-.9-3.6.8-2.8 2.6L13 20 7.2 35c-.8 1.8 1 3.5 2.8 2.6z" fill="currentColor" stroke="' + HSUI_K + '" stroke-width="3.4" stroke-linejoin="round" paint-order="stroke"/><path d="M40 20L13 6.6l4 13.4-4 13.4z" fill="rgba(255,255,255,.28)"/>'),
    /** Брейнрот-заглушка: тело — currentColor (редкость). Пока нет иконки модели и для силуэта «???». */
    silhouette: hsuiSvg('0 0 64 64', '<path d="M32 5C19.6 5 11.4 14 11.4 26.6c0 6.6 2.4 10.4 2.4 15.6 0 5.8-3.6 7.8-3.6 11C10.2 56.2 13 58.6 17 58.6h30c4 0 6.8-2.4 6.8-5.8 0-3.2-3.6-5.2-3.6-11 0-5.2 2.4-9 2.4-15.6C52.6 14 44.4 5 32 5z" fill="currentColor" stroke="' + HSUI_K + '" stroke-width="3.6" stroke-linejoin="round"/><path d="M19 17c3.2-5 8.6-7.2 13.4-6.8" fill="none" stroke="rgba(255,255,255,.55)" stroke-width="3.2" stroke-linecap="round"/><circle cx="24" cy="29" r="7" fill="#fff" stroke="' + HSUI_K + '" stroke-width="2.6"/><circle cx="41" cy="29" r="7" fill="#fff" stroke="' + HSUI_K + '" stroke-width="2.6"/><circle cx="25.6" cy="30.4" r="3" fill="' + HSUI_K + '"/><circle cx="42.6" cy="30.4" r="3" fill="' + HSUI_K + '"/><path d="M25 42c4 3.4 10 3.4 14 0" fill="none" stroke="' + HSUI_K + '" stroke-width="3" stroke-linecap="round"/>'),
    hat: hsuiSvg('0 0 24 24', hsuiOl('<path d="M3 19h18l-1.4-3.4H4.4z"/>', '#ff7cc6', 2.4) + hsuiOl('<path d="M6.6 15.6L8 6.8C8.3 5 9.7 4 12 4s3.7 1 4 2.8l1.4 8.8z"/>', '#ffb81c', 2.6) + '<path d="M7.2 12.4h9.6" stroke="' + HSUI_K + '" stroke-width="1.8"/>'),
    trail: hsuiSvg('0 0 24 24', hsuiLn('M13.4 10.6L2.6 21.4M12 12.8L6 22.4M15.8 12.4L10.6 22.4', '#7ff0ff', 2.2) + hsuiOl('<circle cx="17" cy="7" r="4.4"/>', '#ffe45c', 2.4)),
    aura: hsuiSvg('0 0 24 24', '<ellipse cx="12" cy="16.4" rx="9.4" ry="4.6" fill="none" stroke="' + HSUI_K + '" stroke-width="5"/><ellipse cx="12" cy="16.4" rx="9.4" ry="4.6" fill="none" stroke="#c2ff4a" stroke-width="2.6"/>' + hsuiOl('<path d="M12 1.8l1.7 4.2 4.2 1.7-4.2 1.7L12 13.6 10.3 9.4 6.1 7.7 10.3 6z"/>', '#ffe45c', 1.8)),
    trophy: hsuiSvg('0 0 24 24', hsuiLn('M7 5H3.6c0 4 1.6 5.6 3.8 5.8M17 5h3.4c0 4-1.6 5.6-3.8 5.8', '#ffb81c', 1.8) + hsuiOl('<path d="M7 2.6h10v6.8a5 5 0 0 1-10 0z"/>', '#ffe45c', 2.6) + hsuiLn('M12 14.4V18M8.4 21.2h7.2M9.6 18h4.8', '#ffb81c', 2.2)),
    lock: hsuiSvg('0 0 24 24', hsuiLn('M8 11V8a4 4 0 018 0v3', '#e8e0ff', 2.2) + hsuiOl('<rect x="4.6" y="10.6" width="14.8" height="11" rx="2.6"/>', '#ffd23d', 2.2) + '<circle cx="12" cy="16" r="1.7" fill="' + HSUI_K + '"/>'),
    eye: hsuiSvg('0 0 24 24', hsuiOl('<path d="M1.8 12S5.4 5.8 12 5.8 22.2 12 22.2 12 18.6 18.2 12 18.2 1.8 12 1.8 12z"/>', '#fff', 2.6) + '<circle cx="12" cy="12" r="3.9" fill="#27b8f5" stroke="' + HSUI_K + '" stroke-width="1.4"/><circle cx="13.2" cy="10.8" r="1.2" fill="#fff"/>'),
    gift: hsuiSvg('0 0 48 48', hsuiLn('M24 15C15 3 6 6 10 12c2.6 3.6 9 3 14 3zM24 15c9-12 18-9 14-3-2.6 3.6-9 3-14 3z', '#ffe45c', 3) + hsuiOl('<rect x="7" y="21" width="34" height="22" rx="3"/>', '#f0348f', 3) + hsuiOl('<rect x="4" y="14.6" width="40" height="9" rx="2.8"/>', '#ff7cc6', 3) + '<rect x="20.4" y="14.6" width="7.2" height="28.4" fill="#ffe45c" stroke="' + HSUI_K + '" stroke-width="1.8"/>'),
    giftQ: hsuiSvg('0 0 48 48', hsuiLn('M24 14.6C16 4 8 7 11.4 12c2.4 3 8.6 2.6 12.6 2.6zM24 14.6c8-10.6 16-7.6 12.6-2.6-2.4 3-8.6 2.6-12.6 2.6z', '#ffe45c', 3) + hsuiOl('<rect x="7" y="21" width="34" height="22" rx="3"/>', '#6c3fe0', 3) + hsuiOl('<rect x="4" y="14.6" width="40" height="9" rx="2.8"/>', '#a77bff', 3) + hsuiLn('M19.4 30.4c0-2.8 2-4.4 4.6-4.4s4.6 1.6 4.6 4c0 3.6-4.6 3.4-4.6 7', '#fff', 2.6) + '<circle cx="24" cy="40" r="1.9" fill="#fff"/>'),
    closeX: hsuiSvg('0 0 24 24', hsuiLn('M5.4 5.4l13.2 13.2M18.6 5.4L5.4 18.6', '#fff', 3.6)),
    cup: hsuiSvg('0 0 48 48', hsuiLn('M13 10H6.5c0 6.5 3.4 10 8.8 10M35 10h6.5c0 6.5-3.4 10-8.8 10', '#ffb81c', 2.6) + hsuiOl('<path d="M13 5.6h22v10.2c0 8-5 13.4-11 13.4S13 23.8 13 15.8z"/>', '#ffe45c', 3) + hsuiOl('<rect x="20.5" y="29" width="7" height="6"/>', '#ffb81c', 2.4) + hsuiOl('<rect x="12.5" y="34.6" width="23" height="8" rx="2.4"/>', '#f0348f', 2.8) + '<path d="M24 10.4l1.8 3.7 4 .6-2.9 2.8.7 4-3.6-1.9-3.6 1.9.7-4-2.9-2.8 4-.6z" fill="#fff"/>'),
    book: hsuiSvg('0 0 24 24', hsuiOl('<path d="M2.4 5.4C5.4 4 9 4 12 5.8c3-1.8 6.6-1.8 9.6-.4v14c-3-1.4-6.6-1.4-9.6.4-3-1.8-6.6-1.8-9.6-.4z"/>', '#7ff0ff', 2.6) + '<path d="M12 5.8v14" stroke="' + HSUI_K + '" stroke-width="2"/><path d="M4.6 8.2c2-.6 4-.4 5.6.6M4.6 11.6c2-.6 4-.4 5.6.6M13.8 8.8c1.6-1 3.6-1.2 5.6-.6M13.8 12.2c1.6-1 3.6-1.2 5.6-.6" fill="none" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/><path d="M16.4 4.6v6l1.7-1.4 1.7 1.4v-6.4" fill="#ff5cb8" stroke="' + HSUI_K + '" stroke-width="1.4" stroke-linejoin="round"/>'),
    bag: hsuiSvg('0 0 24 24', hsuiOl('<rect x="3" y="9.4" width="18" height="11.6" rx="2.2"/>', '#ffb81c', 2.6) + hsuiOl('<path d="M3 9.4V7.4c0-1.6 1-2.6 2.6-2.6h12.8c1.6 0 2.6 1 2.6 2.6v2z"/>', '#ff7cc6', 2.6) + '<rect x="10" y="9" width="4" height="5.4" rx="1" fill="#ffe45c" stroke="' + HSUI_K + '" stroke-width="1.5"/><path d="M3.6 12.2h6M14.4 12.2h6" stroke="' + HSUI_K + '" stroke-width="1.4" opacity=".5"/>'),
    gear: hsuiSvg('0 0 24 24', hsuiOl('<rect x="10" y="1.4" width="4" height="21.2" rx="1.4"/><rect x="10" y="1.4" width="4" height="21.2" rx="1.4" transform="rotate(45 12 12)"/><rect x="10" y="1.4" width="4" height="21.2" rx="1.4" transform="rotate(90 12 12)"/><rect x="10" y="1.4" width="4" height="21.2" rx="1.4" transform="rotate(135 12 12)"/><circle cx="12" cy="12" r="7.6"/>', '#d8ccff', 2.8) + '<circle cx="12" cy="12" r="3.2" fill="#5b2bc0" stroke="' + HSUI_K + '" stroke-width="1.6"/>'),
    shop: hsuiSvg('0 0 24 24', hsuiOl('<rect x="3.6" y="10" width="16.8" height="11"/>', '#fff3d6', 2.6) + hsuiOl('<path d="M2 10l1.8-6.2h16.4L22 10z"/>', '#f0348f', 2.6) + '<path d="M8.4 10l.7-6.2M15.6 10l-.7-6.2M12 10V3.8" stroke="#fff" stroke-width="1.6"/><rect x="9.6" y="14" width="4.8" height="7" rx=".8" fill="#27b8f5" stroke="' + HSUI_K + '" stroke-width="1.4"/>'),
    plus: hsuiSvg('0 0 24 24', hsuiLn('M12 4.6v14.8M4.6 12h14.8', '#fff', 3.6)),
    tag: hsuiSvg('0 0 24 24', hsuiOl('<path d="M2.8 12.4V4.8c0-1 .8-2 2-2h7.6l9 9a2 2 0 0 1 0 2.8l-7 7a2 2 0 0 1-2.8 0z"/>', '#c2ff4a', 2.4) + '<circle cx="7.6" cy="7.6" r="1.7" fill="' + HSUI_K + '"/>'),
    podium: hsuiSvg('0 0 24 24', hsuiOl('<path d="M4 19.6c0-1.6 3.6-2.8 8-2.8s8 1.2 8 2.8-3.6 2.8-8 2.8-8-1.2-8-2.8z"/>', '#a77bff', 2.4) + hsuiOl('<path d="M5.6 12.8h12.8V18c0 1.2-2.9 2.2-6.4 2.2S5.6 19.2 5.6 18z"/>', '#6c3fe0', 2.4) + hsuiOl('<ellipse cx="12" cy="12.6" rx="6.4" ry="2.4"/>', '#d8ccff', 2.2)),
    chevD: hsuiSvg('0 0 24 24', hsuiLn('M5.4 8.4L12 15.4l6.6-7', '#fff', 3.2)),
    cash: hsuiSvg('0 0 24 24', hsuiOl('<rect x="1.8" y="5.6" width="20.4" height="12.8" rx="2.4"/>', '#7be82a', 2.4) + '<circle cx="12" cy="12" r="3.6" fill="#c2ff4a" stroke="' + HSUI_K + '" stroke-width="1.4"/><path d="M5.4 9v6M18.6 9v6" stroke="' + HSUI_K + '" stroke-width="1.6" stroke-linecap="round"/>'),
    clock: hsuiSvg('0 0 24 24', hsuiOl('<circle cx="12" cy="13" r="9"/>', '#fff', 2.8) + hsuiOl('<rect x="9.4" y="1.8" width="5.2" height="3.4" rx="1"/>', '#ff7cc6', 2) + '<circle cx="12" cy="13" r="6.4" fill="#f4efff" stroke="' + HSUI_K + '" stroke-width="1.2"/>' + '<path d="M12 13V8.6M12 13l3.2 2" fill="none" stroke="' + HSUI_K + '" stroke-width="1.9" stroke-linecap="round"/>' + '<path d="M18.6 5.6l1.8-1.8" stroke="' + HSUI_K + '" stroke-width="2.4" stroke-linecap="round"/>'),
    sparkle: hsuiSvg('0 0 24 24', '<path d="M12 1l2.6 8.4L23 12l-8.4 2.6L12 23l-2.6-8.4L1 12l8.4-2.6z" fill="currentColor"/>'),
};

/** Банкнота для денежного дождя на фоне меню (data-URI, без файлов). */
const HSUI_BILL = hsuiDataUri('<svg viewBox="0 0 64 36"><rect x="2" y="2" width="60" height="32" rx="5" fill="#7be82a" stroke="#12042b" stroke-width="3"/><rect x="7" y="7" width="50" height="22" rx="3" fill="none" stroke="#c2ff4a" stroke-width="1.6" stroke-dasharray="4 3"/><circle cx="32" cy="18" r="8.4" fill="#c2ff4a" stroke="#12042b" stroke-width="2.4"/><path d="M35.4 14.8c-.7-1.4-1.9-2-3.4-2-1.9 0-3.1 1-3.1 2.4 0 3.4 6.4 1.8 6.4 5.4 0 1.6-1.4 2.6-3.3 2.6-1.7 0-3-.7-3.5-2.1M32 10.6v14.8" fill="none" stroke="#12042b" stroke-width="2" stroke-linecap="round"/></svg>');

// ---------------------------------------------------------------------------------------------------------
// CSS. «Nu» = N × единица экрана (--u). Путь картинок — от корня игры, литералом.
// Образ: «касса-наклейка» — пластиковые фиолетовые плашки с золотыми заклёпками (как на красной дорожке),
// жирная чернильная обводка, жёсткая тень без свечения, наклонённые кнопки с бликом, лайм-деньги и малиновые акценты.
// Редкости: .r-<id> задаёт --rc; god переливается радугой, secret — белое на чёрном.
// ---------------------------------------------------------------------------------------------------------

const HSUI_CSS = `
@font-face{font-family:'HsNunito';src:url('assets/fonts/nunito.ttf') format('truetype');font-weight:200 1000;font-display:swap}
/* псевдоним: оверлеи Game.js и GameRecords.js просят шрифт Rubik — отдаём им Nunito */
@font-face{font-family:'Rubik';src:url('assets/fonts/nunito.ttf') format('truetype');font-weight:200 1000;font-display:swap}

#hs-ui{position:fixed;inset:0;z-index:20;pointer-events:none;overflow:hidden;--u:1px;font-family:'HsNunito','Nunito',system-ui,sans-serif;font-weight:900;color:#fff;
  -webkit-user-select:none;user-select:none;-webkit-tap-highlight-color:transparent;text-rendering:optimizeLegibility;
  --ink:#12042b;--v0:#5b2bc0;--v1:#3d1790;--v2:#2a0f66;--v3:#1b0a45;--v4:#0e0428;
  --lime:#c2ff4a;--lime2:#7be82a;--gold:#ffe45c;--gold2:#ffb81c;--pink:#ff7cc6;--pink2:#f0348f;--ice:#7ff0ff;--ice2:#27b8f5;--vio:#a77bff;--vio2:#6c3fe0;
  --rbw:linear-gradient(90deg,#ff4d6d,#ffb02e,#fff04d,#5cf05c,#3de0ff,#7a6bff,#e04dff,#ff4d6d);
  --rv:radial-gradient(circle at 13u 13u,#ffe45c 0 2.2u,#7a4a00 2.6u 4u,transparent 4.4u),radial-gradient(circle at calc(100% - 13u) 13u,#ffe45c 0 2.2u,#7a4a00 2.6u 4u,transparent 4.4u),
  radial-gradient(circle at 13u calc(100% - 13u),#ffe45c 0 2.2u,#7a4a00 2.6u 4u,transparent 4.4u),radial-gradient(circle at calc(100% - 13u) calc(100% - 13u),#ffe45c 0 2.2u,#7a4a00 2.6u 4u,transparent 4.4u)}
#hs-ui *,#hs-ui *::before,#hs-ui *::after{box-sizing:border-box}
:where(#hs-ui) button{font:inherit;color:inherit;border:0;padding:0;margin:0;background:none;cursor:pointer;touch-action:manipulation;outline:none;-webkit-appearance:none;appearance:none}
:where(#hs-ui) img{display:block;pointer-events:none;-webkit-user-drag:none}
:where(#hs-ui) svg{display:block}
#hs-ui [hidden]{display:none!important}

/* ---------- редкости: --rc (цвет), god — радуга, secret — белое на чёрном ---------- */
.r-common{--rc:#b8c4d0}.r-rare{--rc:#3d9bff}.r-epic{--rc:#b24dff}.r-legendary{--rc:#ffb02e}.r-mythic{--rc:#ff3d6e}.r-god{--rc:#ff7ae0}.r-secret{--rc:#ffffff}
.hs-rr{display:inline-flex;align-items:center;justify-content:center;padding:1u 9u 2u;border-radius:99u;background:var(--rc,#b8c4d0);color:var(--ink);border:2u solid var(--ink);font-weight:1000;font-size:11u;line-height:1.2;white-space:nowrap;letter-spacing:.02em;text-shadow:none}
.r-god .hs-rr,.r-god.hs-rr{background:var(--rbw);background-size:300% 100%;animation:hs-rbw 3s linear infinite}
.r-secret .hs-rr,.r-secret.hs-rr{background:#000;color:#fff;border-color:#fff;box-shadow:0 0 0 1.5u #000,0 0 8u rgba(255,255,255,.55)}

/* обводка текста: чернильный контур 8 направлений + глубина */
.hs-o{--s:2u;--ol:var(--ink);text-shadow:var(--s) 0 0 var(--ol),calc(var(--s)*-1) 0 0 var(--ol),0 var(--s) 0 var(--ol),0 calc(var(--s)*-1) 0 var(--ol),
  var(--s) var(--s) 0 var(--ol),calc(var(--s)*-1) var(--s) 0 var(--ol),var(--s) calc(var(--s)*-1) 0 var(--ol),calc(var(--s)*-1) calc(var(--s)*-1) 0 var(--ol),0 calc(var(--s)*1.7) 0 var(--ol),0 calc(var(--s)*2.4) calc(var(--s)*1.4) rgba(0,0,0,.35)}
/* большой заголовок: слой контура (3D-глубина) под слоем с градиентом. <span class="hs-big" data-text><span class="tx"> */
.hs-big{position:relative;display:block;isolation:isolate;font-weight:1000;line-height:1;text-align:center}
.hs-big .tx{position:relative;z-index:1;background:linear-gradient(180deg,var(--g1,#fff6a8) 0,var(--g2,#ffd43b) 48%,var(--g3,#ff9a1c) 100%);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:transparent}
.hs-big.rbw .tx{background:var(--rbw);background-size:300% 100%;-webkit-background-clip:text;background-clip:text;animation:hs-rbw 2.2s linear infinite}
.hs-big::before,.hs-big::after{content:attr(data-text);position:absolute;left:0;right:0;top:0;padding:inherit;z-index:0;color:var(--ol,var(--ink));-webkit-text-fill-color:var(--ol,var(--ink));-webkit-text-stroke:var(--sk,10u) var(--ol,var(--ink));pointer-events:none}
.hs-big::before{transform:translateY(var(--dp,5u));text-shadow:0 calc(var(--dp,5u)*1.4) calc(var(--dp,5u)*1.6) rgba(0,0,0,.4)}

/* ---------- панели и кнопки ---------- */
.hs-panel{position:relative;border-radius:16u;border:4u solid var(--ink);
  background:var(--rv),repeating-linear-gradient(135deg,rgba(255,255,255,.045) 0 10u,transparent 10u 20u),linear-gradient(180deg,#5428b8 0,#3a1688 9%,#2a0f66 46%,#1a0a45 100%);
  box-shadow:0 8u 0 var(--ink),0 14u 26u rgba(0,0,0,.5),inset 0 3u 0 rgba(255,255,255,.28),inset 0 -5u 0 rgba(0,0,0,.28),inset 0 0 0 2u rgba(0,0,0,.2)}
.hs-inset{border-radius:12u;background:rgba(10,2,32,.55);border:3u solid rgba(8,1,26,.7);box-shadow:inset 0 4u 0 rgba(0,0,0,.32),0 2u 0 rgba(255,255,255,.1)}
.hs-pill{position:relative;display:flex;align-items:center;gap:6u;height:38u;padding:0 14u 0 38u;border-radius:11u;background:linear-gradient(180deg,#22094f,#0e0428);border:3u solid var(--ink);
  box-shadow:0 4u 0 var(--ink),inset 0 2u 0 rgba(255,255,255,.16),inset 0 0 0 2u rgba(255,184,28,.55);font-size:21u;line-height:1;min-width:96u;font-weight:1000}
.hs-pill.gem{box-shadow:0 4u 0 var(--ink),inset 0 2u 0 rgba(255,255,255,.16),inset 0 0 0 2u rgba(255,92,184,.6)}
.hs-pill-ic{position:absolute;left:-8u;top:50%;height:48u;width:48u;object-fit:contain;transform:translateY(-52%) rotate(-8deg);filter:drop-shadow(0 3u 0 rgba(0,0,0,.45))}
.hs-pill-n{flex:1;text-align:right;font-variant-numeric:tabular-nums;color:var(--lime);--s:1.5u;--ol:#16400a;text-shadow:var(--s) 0 0 var(--ol),calc(var(--s)*-1) 0 0 var(--ol),0 var(--s) 0 var(--ol),0 calc(var(--s)*-1) 0 var(--ol),var(--s) var(--s) 0 var(--ol),calc(var(--s)*-1) var(--s) 0 var(--ol),0 calc(var(--s)*1.8) 0 var(--ol)}
.hs-pill.gem .hs-pill-n{color:#ffa6dc;--ol:#5c0a36}
.hs-pill.bump{animation:hs-bump .45s cubic-bezier(.3,1.6,.5,1)}

/* кнопка: наклонённая «наклейка» с бликом; цвет — --b1 (свет) --b2 (тело) --b3 (низ) --bo (контур) */
.hs-btn{--b1:#d9ff70;--b2:#78e526;--b3:#2f9410;--bo:#123a0a;--th:6u;--rd:12u;position:relative;display:flex;align-items:center;justify-content:center;gap:8u;border-radius:var(--rd);isolation:isolate;
  transition:transform .09s,filter .15s;font-weight:1000;text-transform:uppercase;letter-spacing:.03em;pointer-events:auto;color:#fff}
.hs-btn::before{content:'';position:absolute;inset:0;z-index:-2;border-radius:var(--rd);border:3.5u solid var(--bo);transform:skewX(-7deg);
  background:linear-gradient(180deg,rgba(255,255,255,.5) 0,rgba(255,255,255,.5) 44%,rgba(255,255,255,0) 45%),linear-gradient(180deg,var(--b1) 0,var(--b2) 58%,var(--b3) 100%);
  box-shadow:0 var(--th) 0 var(--bo),0 calc(var(--th) + 6u) 12u rgba(0,0,0,.35),inset 0 -4u 0 rgba(0,0,0,.16);transition:box-shadow .09s}
.hs-btn:active:not(.off){transform:translateY(var(--th))}
.hs-btn:active:not(.off)::before{box-shadow:0 0 0 var(--bo),0 3u 6u rgba(0,0,0,.3),inset 0 -4u 0 rgba(0,0,0,.16)}
.hs-btn.yellow{--b1:#fff39a;--b2:#ffc21f;--b3:#d58700;--bo:#5c3300}
.hs-btn.red{--b1:#ff9fd2;--b2:#f0348f;--b3:#a50f58;--bo:#4a0628}
.hs-btn.blue{--b1:#a4f6ff;--b2:#27b8f5;--b3:#0b78b5;--bo:#052e4a}
.hs-btn.navy{--b1:#b090ff;--b2:#6c3fe0;--b3:#43209a;--bo:#1a0a4d}
.hs-btn.off{filter:saturate(.3) brightness(.78);cursor:default}
.hs-btn svg{width:1.15em;height:1.15em;flex:none;filter:drop-shadow(0 2u 0 rgba(0,0,0,.3))}
.hs-btn .t{position:relative;z-index:1;--s:2u;--ol:var(--bo);text-shadow:var(--s) 0 0 var(--ol),calc(var(--s)*-1) 0 0 var(--ol),0 var(--s) 0 var(--ol),0 calc(var(--s)*-1) 0 var(--ol),var(--s) var(--s) 0 var(--ol),calc(var(--s)*-1) var(--s) 0 var(--ol),var(--s) calc(var(--s)*-1) 0 var(--ol),calc(var(--s)*-1) calc(var(--s)*-1) 0 var(--ol),0 calc(var(--s)*1.8) 0 var(--ol)}
/* блик, пробегающий по кнопке */
.hs-shine::after{content:'';position:absolute;inset:3.5u;z-index:-1;border-radius:calc(var(--rd) - 3u);transform:skewX(-7deg);pointer-events:none;
  background:linear-gradient(105deg,transparent 0,transparent 38%,rgba(255,255,255,.7) 48%,transparent 58%,transparent 100%) no-repeat;background-size:300% 100%;background-position:100% 0;animation:hs-shine 3.4s ease-in-out infinite;animation-delay:var(--sd,0s)}
.hs-shake{animation:hs-shake .42s cubic-bezier(.36,.07,.19,.97) both}

.hs-hint{min-height:1.3em;color:#ff8aa6;font-size:15u;text-align:center;text-shadow:0 2u 0 #3a0620;opacity:0;transition:opacity .2s}
.hs-hint.on{opacity:1}

/* экраны */
.hs-screen{position:absolute;inset:0;display:none;pointer-events:none}
.hs-screen.on{display:block}
.hs-screen.out{opacity:0;transform:scale(1.03);transition:opacity .22s ease-in,transform .22s ease-in}
.hs-screen.in .hs-a{animation:hs-pop .62s cubic-bezier(.2,.9,.3,1) backwards;animation-delay:calc(var(--d,0)*70ms)}
.hs-screen.in .hs-a.left{animation-name:hs-slideL}
.hs-screen.in .hs-a.right{animation-name:hs-slideR}
.hs-screen.in .hs-a.top{animation-name:hs-slideT}
.hs-screen.in .hs-a.bottom{animation-name:hs-slideB}

/* ---------- ГЛАВНОЕ МЕНЮ ---------- */
.hs-menu{--mp:14u;padding:calc(var(--mp) + env(safe-area-inset-top,0px)) calc(var(--mp) + env(safe-area-inset-right,0px)) calc(var(--mp) + env(safe-area-inset-bottom,0px)) calc(var(--mp) + env(safe-area-inset-left,0px))}
.hs-menu::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse 72% 60% at 52% 46%,transparent 54%,rgba(24,4,60,.5) 100%),linear-gradient(180deg,rgba(24,4,60,.5) 0,transparent 28%,transparent 56%,rgba(24,4,60,.66) 100%)}
.hs-rain{position:absolute;inset:0;overflow:hidden}
.hs-bill{position:absolute;bottom:-60u;width:calc(46u*var(--sz,1));height:calc(26u*var(--sz,1));left:var(--x,50%);opacity:0;background:url("${HSUI_BILL}") center/contain no-repeat;animation:hs-rain var(--t,12s) linear infinite;animation-delay:var(--dl,0s)}
.hs-logo{position:absolute;left:calc(var(--mp) + env(safe-area-inset-left,0px) + 4u);top:calc(var(--mp) + env(safe-area-inset-top,0px) + 6u);display:flex;flex-direction:column;align-items:flex-start;--ol:var(--ink)}
.hs-logo-in{position:relative;display:flex;flex-direction:column;align-items:flex-start;transform-origin:0 60%;transform:rotate(-3deg);animation:hs-logo 4.6s ease-in-out infinite}
.hs-logo-1{font-size:56u;letter-spacing:.01em;--sk:12u;--dp:6u;padding:0 8u;white-space:nowrap}
.hs-ribbon{position:relative;display:inline-block;margin:-4u 0 0 26u;padding:3u 20u 6u;font-size:27u;letter-spacing:.16em;white-space:nowrap;font-weight:1000;color:#fff;
  background:linear-gradient(180deg,rgba(255,255,255,.4) 0,rgba(255,255,255,.4) 44%,rgba(255,255,255,0) 45%),linear-gradient(180deg,#ff8ccb,#f0348f 68%,#c01a70);border:4u solid var(--ink);border-radius:9u;box-shadow:0 6u 0 var(--ink);transform:skewX(-8deg) rotate(1.4deg);
  --s:2u;--ol:#5c0a36;text-shadow:var(--s) 0 0 var(--ol),calc(var(--s)*-1) 0 0 var(--ol),0 var(--s) 0 var(--ol),0 calc(var(--s)*-1) 0 var(--ol),var(--s) var(--s) 0 var(--ol),calc(var(--s)*-1) var(--s) 0 var(--ol),0 calc(var(--s)*1.8) 0 var(--ol)}
.hs-lcoin{position:absolute;width:34u;height:34u;object-fit:contain;filter:drop-shadow(0 3u 0 rgba(0,0,0,.4));animation:hs-coinbob 2.6s ease-in-out infinite}
.hs-lcoin.c1{right:-14u;top:-6u}
.hs-lcoin.c2{right:34u;top:-20u;width:24u;height:24u;animation-delay:-1.2s}
.hs-lspark{position:absolute;width:20u;height:20u;color:#fff8b0;animation:hs-twinkle 2.2s ease-in-out infinite}
.hs-lspark.s1{left:-14u;top:2u}
.hs-lspark.s2{left:42%;top:-12u;animation-delay:-1s;color:#c2ff4a}
.hs-lspark.s3{right:6u;bottom:-8u;animation-delay:-.5s;color:#ff9fd2}
.hs-mapcard{position:absolute;left:calc(var(--mp) + env(safe-area-inset-left,0px) + 6u);top:calc(var(--mp) + env(safe-area-inset-top,0px) + 130u);display:flex;align-items:center;gap:9u;height:52u;padding:0 14u 0 6u;border-radius:11u;max-width:380u;
  background:linear-gradient(180deg,#4a2096,#24095a);border:4u solid var(--ink);box-shadow:0 5u 0 var(--ink),inset 0 2u 0 rgba(255,255,255,.22),inset 0 -4u 0 var(--mc,#c2ff4a)}
.hs-mapnum{flex:none;display:flex;align-items:center;justify-content:center;width:38u;height:38u;border-radius:9u;background:var(--mc,#c2ff4a);color:var(--ink);font-size:21u;font-weight:1000;border:3u solid var(--ink);box-shadow:inset 0 3u 0 rgba(255,255,255,.55)}
.hs-mapname{display:flex;flex-direction:column;min-width:0;line-height:1.05}
.hs-mapname b{font-size:17u;font-weight:1000;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:220u}
.hs-mapname small{font-size:max(9px,11.5u);font-weight:800;color:#cdbcff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:220u}
.hs-seekic{flex:none;width:36u;height:36u;border-radius:50%;background:radial-gradient(circle at 50% 38%,#6c3fe0,#24095a);border:3u solid var(--ink);box-shadow:0 0 0 2.5u var(--mc,#c2ff4a);overflow:hidden;display:flex;align-items:center;justify-content:center}
.hs-seekic .hs-ic{width:100%;height:100%}
.hs-m-wallet{position:absolute;right:calc(var(--mp) + env(safe-area-inset-right,0px));top:calc(var(--mp) + env(safe-area-inset-top,0px));display:flex;gap:18u;padding-left:6u}
.hs-m-side{position:absolute;right:calc(var(--mp) + env(safe-area-inset-right,0px));top:calc(var(--mp) + env(safe-area-inset-top,0px) + 62u);display:flex;flex-direction:row-reverse;gap:12u;align-items:flex-start}
.hs-m-tools{position:absolute;left:calc(var(--mp) + env(safe-area-inset-left,0px));bottom:calc(var(--mp) + env(safe-area-inset-bottom,0px));display:flex;gap:11u;align-items:flex-end}

/* плитка-кнопка меню: квадрат с бликом, значок и ярлык-наклейка */
.hs-tool{--t1:#b090ff;--t2:#6c3fe0;--tr:0deg;position:relative;width:76u;height:80u;border-radius:17u;border:4u solid var(--ink);pointer-events:auto;transition:transform .1s;transform:rotate(var(--tr));
  background:linear-gradient(180deg,rgba(255,255,255,.4) 0,rgba(255,255,255,.4) 40%,rgba(255,255,255,0) 41%),linear-gradient(180deg,var(--t1),var(--t2));
  box-shadow:0 6u 0 var(--ink),0 10u 14u rgba(0,0,0,.35),inset 0 -4u 0 rgba(0,0,0,.18)}
.hs-tool:active{transform:rotate(var(--tr)) translateY(5u);box-shadow:0 1u 0 var(--ink),0 3u 6u rgba(0,0,0,.3),inset 0 -4u 0 rgba(0,0,0,.18)}
.hs-tool .ic{position:absolute;left:14%;right:14%;top:6%;height:56%;display:flex;align-items:center;justify-content:center}
.hs-tool .ic svg{width:100%;height:100%;filter:drop-shadow(0 3u 0 rgba(0,0,0,.28))}
.hs-tool span{position:absolute;left:5%;right:5%;bottom:6%;height:24%;display:flex;align-items:center;justify-content:center;border-radius:6u;background:var(--ink);font-size:max(8.5px,10.5u);font-weight:1000;letter-spacing:-.01em;line-height:1;white-space:nowrap;overflow:hidden}
.hs-tool span b{display:inline-block;font:inherit;white-space:nowrap;transform-origin:50% 50%}
.hs-tool.shop{--t1:#ffe45c;--t2:#ffa91a;--tr:-2deg}
.hs-tool.skins{--t1:#ff9fd2;--t2:#e0207f;--tr:1.5deg}
.hs-tool.codex{--t1:#a4f6ff;--t2:#1f9ee0;--tr:-1.5deg}
.hs-tool.rec{--t1:#ffe45c;--t2:#ff8a1a;--tr:1deg}
.hs-tool.gear{--t1:#d8ccff;--t2:#8466e0;--tr:2deg}
.hs-tool.fr{--tr:-2deg}
.hs-tool.fr.gift{--t1:#ff9fd2;--t2:#e0207f}
.hs-tool.fr.wheel{--t1:#d9ff70;--t2:#4fc415;--tr:2deg}
.hs-tool .dot{position:absolute;right:-9u;top:-9u;width:22u;height:22u;border-radius:50%;background:#ff3a6e;border:3.5u solid var(--ink);animation:hs-pulse 1.1s ease-in-out infinite;box-shadow:inset 0 3u 0 rgba(255,255,255,.4)}
.hs-tool.fr.attn .ic{animation:hs-wiggle 1.6s ease-in-out infinite}
.hs-tool.fr.attn{animation:hs-tpulse 1.4s ease-in-out infinite}
.hs-tool.close{width:46u;height:46u;--t1:#ff9fd2;--t2:#e0207f;border-radius:13u;border-width:3.5u;box-shadow:0 5u 0 var(--ink),inset 0 -3u 0 rgba(0,0,0,.18)}
.hs-tool.close .ic{left:14%;right:14%;top:14%;height:72%}
.hs-tool.close:active{transform:translateY(4u)}

/* главные действия: роль, игра, база */
.hs-m-main{position:absolute;right:calc(var(--mp) + env(safe-area-inset-right,0px));bottom:calc(var(--mp) + env(safe-area-inset-bottom,0px));width:min(350u,48%);display:flex;flex-direction:column;align-items:stretch;gap:9u}
.hs-m-main>.hs-a{display:flex;justify-content:center;width:100%}
.hs-seg{position:relative;display:grid;grid-template-columns:1fr 1fr;width:100%;height:50u;padding:4u;border-radius:14u;background:linear-gradient(180deg,#14043a,#26095f);border:4u solid var(--ink);box-shadow:0 5u 0 var(--ink),inset 0 3u 0 rgba(0,0,0,.4);pointer-events:auto}
.hs-seg i{position:absolute;left:4u;top:4u;bottom:4u;width:calc(50% - 4u);border-radius:9u;transform:skewX(-6deg);background:linear-gradient(180deg,rgba(255,255,255,.5) 0 44%,transparent 45%),linear-gradient(180deg,#d9ff70,#78e526);border:3u solid var(--ink);box-shadow:inset 0 -3u 0 rgba(0,0,0,.15);transition:left .32s cubic-bezier(.3,1.5,.5,1)}
.hs-seg.seek i{left:50%}
.hs-seg button{position:relative;z-index:1;display:flex;align-items:center;justify-content:center;gap:6u;font-size:max(10px,16u);font-weight:1000;letter-spacing:.02em;color:#bda8ff;transition:color .2s}
.hs-seg button.on{color:var(--ink)}
.hs-seg button svg{width:22u;height:22u}
.hs-play{width:100%;height:88u;font-size:46u;--rd:18u;--th:9u;animation:hs-play 1.6s ease-in-out infinite}
.hs-play svg{width:.85em;height:.85em}
.hs-basebtn{width:100%;height:58u;font-size:25u;--rd:14u;--th:7u}
.hs-basebtn .bdg{position:absolute;right:-6u;top:-12u;z-index:2;display:flex;align-items:center;gap:4u;padding:2u 9u 3u 6u;border-radius:99u;background:linear-gradient(180deg,#d9ff70,#5cc81a);border:3u solid var(--ink);color:var(--ink);font-size:max(10px,14u);font-weight:1000;box-shadow:0 3u 0 var(--ink);animation:hs-pulse 1.5s ease-in-out infinite;letter-spacing:0}
.hs-basebtn .bdg img{width:18u;height:18u}
.hs-seekpick{display:none;width:100%;flex-direction:column;gap:4u;padding:6u 8u 8u;border-radius:13u;pointer-events:auto;background:linear-gradient(180deg,#34127f,#1d0a4d);border:4u solid var(--ink);box-shadow:0 5u 0 var(--ink),inset 0 2u 0 rgba(255,255,255,.2)}
.hs-m-main.seek .hs-seekpick{display:flex;animation:hs-popin .35s cubic-bezier(.3,1.5,.5,1)}
.hs-sp-top{display:flex;align-items:center;justify-content:space-between;gap:8u;font-size:max(9px,12u);color:#d6c8ff;font-weight:900;line-height:1.1}
.hs-sp-top b{color:var(--gold);font-weight:1000;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0}
.hs-sp-row{display:flex;gap:7u;overflow-x:auto;overflow-y:hidden;padding:4u 3u 6u;scrollbar-width:thin;scrollbar-color:#a77bff #14043a;-webkit-overflow-scrolling:touch;touch-action:pan-x;overscroll-behavior:contain}
.hs-sp-row::-webkit-scrollbar{height:6px}.hs-sp-row::-webkit-scrollbar-thumb{background:#a77bff;border-radius:6px}.hs-sp-row::-webkit-scrollbar-track{background:#14043a;border-radius:6px}
.hs-sp-chip{--rc:#b8c4d0;position:relative;flex:none;width:46u;height:46u;border-radius:13u;background:radial-gradient(circle at 50% 36%,rgba(255,255,255,.22),transparent 70%),linear-gradient(180deg,#2a0f66,#14043a);border:3u solid var(--ink);box-shadow:0 0 0 2.5u var(--rc),0 3u 0 2.5u var(--ink);transition:transform .12s}
.hs-sp-chip:active{transform:scale(.94)}
.hs-sp-chip.sel{transform:translateY(-3u);box-shadow:0 0 0 3.5u var(--lime),0 0 12u 2u rgba(194,255,74,.6),0 3u 0 3.5u var(--ink)}
.hs-sp-chip .hs-ic{width:100%;height:100%;padding:2u}
.hs-sp-chip .tk{position:absolute;right:-8u;bottom:-8u;width:20u;height:20u;border-radius:50%;background:var(--lime2);border:2.5u solid var(--ink);display:none;align-items:center;justify-content:center}
.hs-sp-chip.sel .tk{display:flex}
.hs-sp-chip .tk svg{width:12u;height:12u}
.hs-sp-none{display:flex;align-items:center;gap:9u;padding:4u 4u 2u;font-size:max(10px,13.5u);line-height:1.15;color:#e4d9ff;font-weight:900}
.hs-sp-none svg{width:34u;height:34u;flex:none;color:#a77bff;opacity:.9}
.hs-sp-none small{display:block;font-size:max(9px,11u);font-weight:800;color:#b9a6f0;margin-top:2u}
.hs-lvl{position:absolute;left:calc(var(--mp) + env(safe-area-inset-left,0px));bottom:calc(var(--mp) + env(safe-area-inset-bottom,0px) + 102u);width:322u;height:46u;display:flex;align-items:center;gap:8u;padding:0 12u 0 8u;border-radius:11u;
  background:linear-gradient(180deg,#4a2096,#24095a);border:4u solid var(--ink);box-shadow:0 5u 0 var(--ink),inset 0 2u 0 rgba(255,255,255,.22)}
.hs-lvl>svg{width:30u;height:30u;flex:none;color:var(--gold)}
.hs-lvl>div{flex:1;min-width:0;display:flex;flex-direction:column;gap:3u}
.hs-lvl b{font-size:14.5u;font-weight:1000;line-height:1;letter-spacing:.04em}
.hs-bar{position:relative;width:100%;height:13u;border-radius:99u;background:#0a0120;border:2.5u solid var(--ink);box-shadow:inset 0 3u 0 rgba(0,0,0,.6);overflow:hidden}
.hs-bar i{position:absolute;left:0;top:0;bottom:0;width:100%;border-radius:99u;background:linear-gradient(180deg,#e8ff9a,#7be82a 55%,#3fae12);transform-origin:0 50%;transform:scaleX(var(--f,0));transition:transform .5s cubic-bezier(.3,1.2,.5,1);box-shadow:inset 0 2u 0 rgba(255,255,255,.5)}
.hs-bar i::after{content:'';position:absolute;top:0;bottom:0;width:30%;left:0;background:linear-gradient(100deg,transparent,rgba(255,255,255,.6),transparent);animation:hs-barshine 2.4s linear infinite}
.hs-bar.gold i{background:linear-gradient(180deg,#fff08a,#ffc61f 55%,#ee9a0a)}

/* ---------- ОКНА (магазин, подарок, колесо, настройки, результат) ---------- */
.hs-win{background:radial-gradient(ellipse at 50% 40%,rgba(70,24,150,.62),rgba(10,2,32,.92));pointer-events:auto;z-index:10}
.hs-win::before{content:'';position:absolute;inset:0;background:repeating-linear-gradient(135deg,rgba(255,255,255,.025) 0 14u,transparent 14u 28u);pointer-events:none}
.hs-shopwin{position:absolute;inset:calc(2.2% + env(safe-area-inset-top,0px)) calc(2% + env(safe-area-inset-right,0px)) calc(2.2% + env(safe-area-inset-bottom,0px)) calc(2% + env(safe-area-inset-left,0px));margin:auto;max-width:1120u;max-height:660u;display:flex;flex-direction:column;padding:12u 14u 16u;gap:9u;transition:opacity .22s,transform .22s}
.hs-sh-head{display:flex;align-items:center;gap:12u;flex:none;min-height:52u}
.hs-sh-title{font-size:32u;letter-spacing:.01em;--ol:var(--ink);--sk:9u;--dp:4u;margin-right:6u;flex:none;padding:0 4u}
.hs-tabs{display:flex;gap:7u;flex:none;min-width:0;padding:0 4u 6u}
.hs-tab{position:relative;display:flex;align-items:center;justify-content:center;gap:6u;height:42u;padding:0 8u;font-size:max(9.5px,14u);font-weight:1000;color:#d6c8ff;white-space:nowrap;flex:1 1 0;min-width:0;isolation:isolate;transition:transform .12s}
.hs-tab::before{content:'';position:absolute;inset:0;z-index:-1;transform:skewX(-8deg);border-radius:11u;border:3u solid var(--ink);background:linear-gradient(180deg,rgba(255,255,255,.22) 0 44%,rgba(255,255,255,0) 45%),linear-gradient(180deg,#4a2096,#2a0f66);box-shadow:0 4u 0 var(--ink)}
.hs-tab svg{width:22u;height:22u;flex:none}
.hs-tab span{overflow:hidden;text-overflow:ellipsis}
.hs-tab:active{transform:translateY(3u)}
.hs-tab.on{flex:1.5 1 0;color:var(--ink);animation:hs-tabin .4s cubic-bezier(.3,1.6,.5,1)}
.hs-tab.on::before{background:linear-gradient(180deg,rgba(255,255,255,.55) 0 44%,rgba(255,255,255,0) 45%),linear-gradient(180deg,#d9ff70,#78e526);box-shadow:0 4u 0 var(--ink)}
.hs-sh-wallet{display:flex;gap:22u;flex:none;margin-left:auto;padding:0 8u 0 8u}
.hs-sh-wallet .hs-pill{min-width:0;font-size:19u}
.hs-sh-body{flex:1;min-height:0;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,36%);gap:12u}
.hs-sh-body.power{grid-template-columns:minmax(0,1fr)}
.hs-sh-body.power .hs-sh-grid{--cols:4;align-content:stretch;grid-auto-rows:minmax(0,1fr)}
.hs-sh-grid{--cols:3;min-height:0;overflow-y:auto;overflow-x:hidden;overscroll-behavior:contain;padding:6u 8u 12u;display:grid;grid-template-columns:repeat(var(--cols,3),minmax(0,1fr));gap:13u;align-content:start;scrollbar-width:thin;scrollbar-color:#a77bff #14043a;-webkit-overflow-scrolling:touch;touch-action:pan-y}
.hs-sh-grid::-webkit-scrollbar{width:8px}
.hs-sh-grid::-webkit-scrollbar-thumb{background:#a77bff;border-radius:8px}
.hs-sh-grid::-webkit-scrollbar-track{background:#14043a;border-radius:8px}
.hs-sh-empty{grid-column:1/-1;align-self:center;text-align:center;padding:30u;font-size:20u;color:#cdbcff}

/* карточка товара: наклейка с рамкой цвета редкости */
.hs-card{--rc:#b8c4d0;--rca:rgba(184,196,208,.4);position:relative;aspect-ratio:275/340;width:100%;border-radius:14u;border:3.5u solid var(--ink);text-align:center;transition:transform .15s cubic-bezier(.3,1.5,.5,1);
  background:linear-gradient(180deg,rgba(255,255,255,.14) 0,rgba(255,255,255,.14) 22%,rgba(255,255,255,0) 23%),linear-gradient(180deg,#3a1688,#1b0a45);
  box-shadow:inset 0 0 0 3u var(--rc),0 5u 0 var(--ink);animation:hs-cardin .5s cubic-bezier(.2,1,.3,1) backwards;animation-delay:calc(var(--i,0)*38ms);pointer-events:auto}
.hs-card::before{content:'';position:absolute;left:8%;right:8%;top:20%;bottom:18%;border-radius:50%;background:radial-gradient(ellipse at 50% 55%,var(--rca),transparent 70%);pointer-events:none}
.hs-card:active{transform:scale(.97)}
.hs-card.sel{transform:translateY(-4u) scale(1.04);z-index:2;box-shadow:inset 0 0 0 3u var(--rc),0 0 0 3u var(--lime),0 9u 0 var(--ink),0 0 16u 2u rgba(194,255,74,.55)}
.hs-card .nm{position:absolute;left:7%;right:7%;top:5%;font-size:13.5u;font-weight:1000;line-height:1.05;text-shadow:0 2u 0 #12042b;overflow:hidden;height:2.1em;display:flex;align-items:center;justify-content:center}
.hs-card .rr{position:absolute;left:50%;top:21.5%;transform:translateX(-50%);font-size:10.5u;z-index:1}
.hs-card .im{position:absolute;left:8%;right:8%;top:30%;bottom:24%;display:flex;align-items:center;justify-content:center}
.hs-card.locked .im .hs-ic{opacity:.85}
.hs-card .rd{display:none;position:absolute;left:8%;top:21%;width:12u;height:12u;border-radius:50%;background:var(--rc);border:2.5u solid var(--ink);z-index:2}
.hs-low .hs-card .rd{display:block}
.hs-card .lk{position:absolute;right:9%;top:31%;width:24u;height:24u;z-index:2}
.hs-card .lk svg{width:100%;height:100%;filter:drop-shadow(0 2u 0 rgba(0,0,0,.5))}
.hs-card .st{position:absolute;left:9%;right:9%;top:78%;height:13.5%;display:flex;align-items:center;justify-content:center;gap:5u;font-size:max(9px,14u);font-weight:1000;line-height:1;border-radius:9u;border:2.5u solid var(--ink);background:#0e0428;box-shadow:0 3u 0 var(--ink)}
.hs-card .st.own{background:linear-gradient(180deg,#a8f35a,#4fc415);color:var(--ink)}
.hs-card .st.eq{background:linear-gradient(180deg,#a4f6ff,#27b8f5);color:var(--ink)}
.hs-card .st.own svg,.hs-card .st.eq svg{width:15u;height:15u;flex:none}
.hs-card .st img{height:20u;width:20u;object-fit:contain}
.hs-card .st.cant{color:#ff8aa6}
.hs-card .st.ad{overflow:hidden;color:#fff;font-size:max(9px,11.5u);white-space:nowrap}
.hs-card .st.ad i{position:absolute;left:0;top:0;bottom:0;width:calc(var(--p,0)*100%);background:linear-gradient(180deg,#fff08a,#ffb81c);opacity:.6;transition:width .5s cubic-bezier(.3,1.2,.5,1)}
.hs-card .st.ad span{position:relative;z-index:1;text-shadow:0 1.5u 0 var(--ink)}
.hs-card .st.ex{background:linear-gradient(180deg,#ff9fd2,#e0207f);color:#fff;font-size:max(8px,11u);white-space:nowrap}
.hs-card .st.ex svg{width:16u;height:16u;flex:none}
.hs-card .sp{position:absolute;inset:0;pointer-events:none;overflow:hidden;border-radius:12u}
.hs-spk{position:absolute;left:var(--x);top:var(--y);width:calc(8u*var(--z,1));height:calc(8u*var(--z,1));background:var(--rc);clip-path:polygon(50% 0,62% 38%,100% 50%,62% 62%,50% 100%,38% 62%,0 50%,38% 38%);opacity:0;animation:hs-twinkle var(--t,2.2s) ease-in-out infinite;animation-delay:var(--dl,0s)}
.hs-ic{position:relative;width:100%;height:100%;display:flex;align-items:center;justify-content:center}
.hs-ic img{max-width:100%;max-height:100%;width:auto;height:auto;object-fit:contain;filter:drop-shadow(0 6u 6u rgba(0,0,0,.45))}
.hs-ic.miss{color:var(--rc,#b8c4d0)}
.hs-ic.miss svg{width:68%;height:68%;filter:drop-shadow(0 4u 0 rgba(0,0,0,.35))}
.hs-card.r-legendary::before,.hs-card.r-mythic::before,.hs-card.r-god::before{animation:hs-glowpulse 2s ease-in-out infinite}
.hs-card.r-legendary .nm,.hs-card.r-mythic .nm{color:#fff3c4}
.hs-card.r-epic .shn,.hs-card.r-legendary .shn,.hs-card.r-mythic .shn,.hs-card.r-god .shn{position:absolute;inset:4% 5% 10%;overflow:hidden;border-radius:12u;pointer-events:none}
.hs-card .shn::after{content:'';position:absolute;top:-20%;bottom:-20%;left:-30%;width:26%;background:linear-gradient(100deg,transparent,rgba(255,255,255,.28),transparent);transform:translateX(-140%) skewX(-18deg);animation:hs-sheen 4.2s ease-in-out infinite;animation-delay:var(--sd,0s)}
/* god: рамка-радуга; secret: чёрная плашка с белой рамкой */
.hs-card.r-god{border-color:transparent;background:linear-gradient(180deg,rgba(255,255,255,.14) 0,rgba(255,255,255,.14) 22%,rgba(255,255,255,0) 23%) padding-box,linear-gradient(180deg,#3a1688,#1b0a45) padding-box,var(--rbw) border-box;background-size:100% 100%,100% 100%,300% 100%;box-shadow:0 5u 0 var(--ink);animation:hs-cardin .5s cubic-bezier(.2,1,.3,1) backwards,hs-rbwb3 3s linear infinite;animation-delay:calc(var(--i,0)*38ms),0s}
.hs-card.r-secret{background:linear-gradient(180deg,rgba(255,255,255,.1) 0,rgba(255,255,255,.1) 22%,rgba(255,255,255,0) 23%),linear-gradient(180deg,#14141c,#000);box-shadow:inset 0 0 0 3u #fff,0 5u 0 var(--ink),0 0 14u rgba(255,255,255,.4)}

/* предпросмотр */
.hs-prev{--rc:#b8c4d0;--rca:rgba(184,196,208,.5);position:relative;display:flex;flex-direction:column;align-items:center;min-height:0;padding:10u 12u 12u;gap:5u;border-radius:16u;background:radial-gradient(ellipse at 50% 46%,#6a37d8 0,#3a1688 42%,#1b0a45 100%);border:4u solid var(--ink);box-shadow:inset 0 0 0 3u var(--rc),0 5u 0 var(--ink)}
.hs-prev-name{font-size:27u;font-weight:1000;line-height:1.05;text-align:center;max-width:100%;overflow:hidden;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;padding-bottom:3u}
.hs-prev-kind{display:flex;align-items:center;gap:8u;font-size:max(9px,13u);color:#d6c8ff;font-weight:900}
.hs-prev-kind .rr{font-size:max(9px,12u)}
.hs-stage{position:relative;flex:1;min-height:0;width:100%;display:flex;align-items:center;justify-content:center}
.hs-glow{position:absolute;left:50%;top:48%;width:92%;aspect-ratio:1;transform:translate(-50%,-50%);border-radius:50%;background:radial-gradient(circle,var(--rca) 0,transparent 66%);animation:hs-glowpulse 2.6s ease-in-out infinite}
.hs-platform{position:absolute;left:50%;bottom:2%;width:86%;height:22%;transform:translateX(-50%)}
.hs-platform::before{content:'';position:absolute;inset:0;border-radius:50%;background:radial-gradient(ellipse at 50% 40%,#8a5cf0,#4a1fb0 62%,#2a0f66);border:3u solid var(--ink);box-shadow:0 7u 0 var(--ink),0 0 0 6u var(--rc)}
.hs-platform i{position:absolute;inset:12% 6%;border-radius:50%;background:conic-gradient(from 0deg,transparent 0,var(--rc) 12%,transparent 30%,transparent 50%,var(--rc) 62%,transparent 80%);opacity:.85;animation:hs-spin 3.2s linear infinite;-webkit-mask:radial-gradient(ellipse closest-side,transparent 78%,#000 82%);mask:radial-gradient(ellipse closest-side,transparent 78%,#000 82%)}
.hs-prev-img{position:relative;width:78%;height:86%;margin-bottom:8%;animation:hs-bob 2.8s ease-in-out infinite}
.hs-prev-img.swap{animation:hs-swap .45s cubic-bezier(.3,1.5,.5,1),hs-bob 2.8s ease-in-out .45s infinite}
.hs-prev-img .hs-ic img{filter:drop-shadow(0 12u 10u rgba(0,0,0,.5))}
.hs-prev .hs-spk{opacity:0}
.hs-prev-state{position:absolute;left:2u;top:2u;z-index:3;display:flex;align-items:center;gap:5u;padding:2u 10u 3u 7u;border-radius:99u;font-size:max(9px,12u);font-weight:1000;line-height:1.1;background:#0e0428;border:2.5u solid var(--ink);color:#e0d6ff;box-shadow:0 3u 0 var(--ink)}
.hs-prev-state svg{width:15u;height:15u;flex:none}
.hs-prev-state.own{background:linear-gradient(180deg,#a8f35a,#4fc415);color:var(--ink)}
.hs-prev-state.eq{background:linear-gradient(180deg,#a4f6ff,#27b8f5);color:var(--ink)}
.hs-eye{position:absolute;right:2u;top:2u;z-index:3;width:40u;height:40u;border-radius:12u;background:linear-gradient(180deg,#8a5cf0,#4a1fb0);border:3u solid var(--ink);box-shadow:0 4u 0 var(--ink);display:flex;align-items:center;justify-content:center;pointer-events:auto;transition:transform .1s}
.hs-eye svg{width:24u;height:24u}
.hs-eye:active{transform:translateY(3u)}
.hs-nav{position:absolute;top:46%;width:34u;height:44u;border-radius:12u;background:linear-gradient(180deg,#8a5cf0,#4a1fb0);border:3u solid var(--ink);box-shadow:0 4u 0 var(--ink);display:flex;align-items:center;justify-content:center;pointer-events:auto;z-index:3}
.hs-nav svg{width:18u;height:18u}
.hs-nav.l{left:-2u}
.hs-nav.r{right:-2u}
.hs-nav:active{transform:translateY(3u)}
.hs-prev-price{display:flex;align-items:center;justify-content:center;gap:8u;width:78%;min-height:44u;border-radius:12u;background:#0e0428;border:3u solid var(--ink);font-size:28u;font-weight:1000;box-shadow:inset 0 3u 0 rgba(0,0,0,.5),0 3u 0 rgba(255,255,255,.12);position:relative;z-index:1;color:var(--lime)}
.hs-prev-price img{height:32u;width:32u;object-fit:contain}
.hs-prev-price.cant{color:#ff8aa6}
.hs-prev-price.own{color:#a8f35a;font-size:21u}
.hs-prev-price.eq{color:var(--ice);font-size:21u}
.hs-prev-price.ex{color:#ffb6dd;font-size:17u}
.hs-prev-price.ex svg{width:30u;height:30u;flex:none}
.hs-prev-price.ad{position:relative;flex-direction:column;gap:3u;padding:5u 10u 6u;font-size:max(10px,15u);overflow:hidden;color:#fff}
.hs-prev-price.ad .bar{position:relative;width:100%;height:12u;border-radius:99u;background:#0a0120;border:2.5u solid var(--ink);box-shadow:inset 0 3u 0 rgba(0,0,0,.6);overflow:hidden}
.hs-prev-price.ad .bar i{position:absolute;left:0;top:0;bottom:0;width:calc(var(--p,0)*100%);border-radius:99u;background:linear-gradient(180deg,#fff08a,#ffc61f 55%,#ee9a0a);box-shadow:inset 0 2u 0 rgba(255,255,255,.55);transition:width .6s cubic-bezier(.3,1.2,.5,1)}
.hs-prev-price.bump{animation:hs-bump .45s cubic-bezier(.3,1.6,.5,1)}
.hs-act{width:100%;height:56u;font-size:25u;margin-top:1u;flex:none}
.hs-act.eq,.hs-act.owned{--b1:#a4f6ff;--b2:#27b8f5;--b3:#0b78b5;--bo:#052e4a}
.hs-act.eq{cursor:default}
.hs-act.eq::after{display:none}
.hs-act.small,.hs-prev-ad{height:38u;font-size:14u}
.hs-prev-ad{width:100%;flex:none;gap:6u;line-height:1.05}
.hs-prev-ad img{width:22u;height:22u;object-fit:contain;flex:none}
.hs-prev .hs-hint,.hs-peek .hs-hint{min-height:0;display:none;font-size:max(10px,13.5u);line-height:1.12}
.hs-prev .hs-hint.on,.hs-peek .hs-hint.on{display:block}
.hs-hint.good{color:#a8f35a;text-shadow:0 2u 0 #123a0a}
.hs-btn .t.sm{font-size:.82em}
.hs-btn.busy{filter:saturate(.5) brightness(.85)}
.hs-prev.r-god{border-color:transparent;background:radial-gradient(ellipse at 50% 46%,#6a37d8 0,#3a1688 42%,#1b0a45 100%) padding-box,var(--rbw) border-box;background-size:100% 100%,300% 100%;box-shadow:0 5u 0 var(--ink);animation:hs-rbwb 3s linear infinite}
.hs-prev.r-secret{background:radial-gradient(ellipse at 50% 46%,#2a2a36 0,#0c0c12 55%,#000 100%);box-shadow:inset 0 0 0 3u #fff,0 5u 0 var(--ink),0 0 18u rgba(255,255,255,.4)}

/* режим «на сцене»: окно прячется, остаётся нижняя панель, 3D-герой виден за ней */
.hs-shop.peek{background:radial-gradient(ellipse at 50% 40%,rgba(40,12,100,.06),rgba(10,2,32,.4))}
.hs-shop.peek .hs-shopwin{opacity:0;transform:scale(.96);pointer-events:none}
.hs-peek{position:absolute;left:50%;bottom:calc(14u + env(safe-area-inset-bottom,0px));transform:translate(-50%,40u);opacity:0;pointer-events:none;width:min(94%,640u);display:flex;align-items:center;gap:10u;padding:10u 12u;flex-wrap:wrap;justify-content:center;transition:opacity .22s,transform .25s cubic-bezier(.3,1.4,.5,1)}
.hs-shop.peek .hs-peek{opacity:1;transform:translate(-50%,0);pointer-events:auto}
.hs-peek .pi{flex:1 1 150u;min-width:0;display:flex;flex-direction:column;align-items:center;gap:3u}
.hs-peek .pn{font-size:22u;font-weight:1000;line-height:1.05;text-align:center}
.hs-peek .pr{font-size:12u}
.hs-peek .hs-btn{height:52u;font-size:21u;padding:0 16u;flex:1 1 150u}
.hs-peek .hs-btn.back{flex:0 0 auto}
.hs-peek .hs-hint{flex:1 0 100%}

/* усиления */
.hs-pcard{--rc:#b8c4d0;--rca:rgba(184,196,208,.5);position:relative;display:flex;flex-direction:column;align-items:center;min-height:0;padding:10u 10u 10u;gap:6u;border-radius:15u;background:linear-gradient(180deg,#3a1688,#1b0a45);border:3.5u solid var(--ink);box-shadow:inset 0 0 0 3u var(--rc),0 5u 0 var(--ink);
  animation:hs-cardin .5s cubic-bezier(.2,1,.3,1) backwards;animation-delay:calc(var(--i,0)*70ms);pointer-events:auto}
.hs-pcard h3{margin:0;font-size:22u;font-weight:1000;line-height:1;text-shadow:0 2u 0 var(--ink)}
.hs-pcard p{margin:0;font-size:12.5u;font-weight:800;color:#d6c8ff;text-align:center;line-height:1.15;min-height:2.3em;max-width:100%}
.hs-pcard .stg{position:relative;flex:1;min-height:0;width:100%;display:flex;align-items:center;justify-content:center}
.hs-pcard .stg .hs-glow{width:100%}
.hs-pcard .stg .hs-platform{height:24%;bottom:6%;width:78%}
.hs-pcard .stg .pi{position:relative;width:62%;height:78%;margin-bottom:10%;animation:hs-bob 2.6s ease-in-out infinite;animation-delay:var(--i,0)s}
.hs-pcard .stg .pi svg{width:100%;height:100%;filter:drop-shadow(0 8u 6u rgba(0,0,0,.45))}
.hs-pcard .pk{display:flex;gap:6u;align-items:center;justify-content:center;flex-wrap:wrap;position:relative;z-index:1}
.hs-pcard .pk span{padding:2u 12u 3u;border-radius:99u;background:#0e0428;border:2.5u solid var(--ink);font-size:16u;font-weight:1000}
.hs-pcard .pk span.have{color:var(--ice);font-size:max(9px,12.5u)}
.hs-pcard .pk span.have.bump{animation:hs-bump .45s cubic-bezier(.3,1.6,.5,1)}
.hs-pcard .pr{display:flex;align-items:center;justify-content:center;gap:8u;width:100%;height:34u;border-radius:11u;background:#0e0428;border:3u solid var(--ink);font-size:21u;font-weight:1000;color:var(--lime);box-shadow:inset 0 3u 0 rgba(0,0,0,.5);position:relative;z-index:1;flex:none}
.hs-pcard .pr img{height:26u;width:26u;object-fit:contain}
.hs-pcard .pr.cant{color:#ff8aa6}
.hs-pcard .hs-btn{width:100%;height:42u;font-size:18u;flex:none}
.hs-pcard .hs-btn.ad{height:42u;font-size:max(9.5px,14.5u);line-height:1.05}
.hs-pcard .hs-hint{min-height:0;font-size:max(10px,12.5u);display:none;text-align:center;line-height:1.1}
.hs-pcard .hs-hint.on{display:block}
.hs-pcard.flash::after,.hs-prev.flash::after{content:'';position:absolute;inset:-3u;border-radius:inherit;background:radial-gradient(circle,#fff,rgba(255,255,255,.2) 60%,transparent);opacity:0;animation:hs-flash .55s ease-out;pointer-events:none;z-index:5}

/* слои эффектов поверх окон: монеты, всплески */
.hs-fxl{position:absolute;inset:0;pointer-events:none;z-index:70;overflow:hidden}
.hs-fly{position:absolute;left:0;top:0;width:28u;height:28u;margin:-14u 0 0 -14u;background:url('${HSUI_COIN}') center/contain no-repeat;pointer-events:none;will-change:transform,opacity}
.hs-star{pointer-events:none}
.hs-bst{position:absolute;left:0;top:0;width:calc(16u*var(--z,1));height:calc(16u*var(--z,1));margin:calc(-8u*var(--z,1)) 0 0 calc(-8u*var(--z,1));background:var(--c,#ffe45c);clip-path:polygon(50% 0,62% 38%,100% 50%,62% 62%,50% 100%,38% 62%,0 50%,38% 38%);will-change:transform,opacity}

/* кнопки «+» у кошелька и всплывающее предложение рекламы */
.hs-pill.hasplus{padding-right:30u}
.hs-plus{position:absolute;right:-10u;top:50%;width:32u;height:32u;margin-top:-16u;border-radius:10u;pointer-events:auto;background:linear-gradient(180deg,rgba(255,255,255,.45) 0 44%,rgba(255,255,255,0) 45%),linear-gradient(180deg,#d9ff70,#4fc415);border:3u solid var(--ink);box-shadow:0 4u 0 var(--ink);color:var(--ink);font-size:25u;font-weight:1000;line-height:1;display:flex;align-items:center;justify-content:center;transition:transform .1s;padding-bottom:2u;transform:rotate(6deg)}
.hs-plus:active{transform:translateY(3u) rotate(6deg)}
.hs-plus.glow{animation:hs-pulse 1.4s ease-in-out infinite}
.hs-pop{position:absolute;z-index:50;display:flex;flex-direction:column;gap:8u;padding:12u 14u 16u;width:min(310u,94%);border-radius:16u;pointer-events:auto;animation:hs-popin .3s cubic-bezier(.3,1.6,.5,1) backwards;transform-origin:90% 0}
.hs-pop .row{display:flex;align-items:center;gap:10u}
.hs-pop .pi{width:46u;height:46u;object-fit:contain;flex:none;filter:drop-shadow(0 3u 0 rgba(0,0,0,.4))}
.hs-pop .pt{display:flex;flex-direction:column;min-width:0;line-height:1.1}
.hs-pop .pt b{font-size:25u;font-weight:1000}
.hs-pop .pt small{font-size:13u;font-weight:800;color:#d6c8ff}
.hs-pop .hs-btn{height:46u;font-size:16u;width:100%}
.hs-pop .hs-hint{min-height:0;display:none;font-size:13u}
.hs-pop .hs-hint.on{display:block}

/* окно награды */
.hs-prize{position:absolute;inset:0;z-index:55;display:flex;align-items:center;justify-content:center;background:radial-gradient(ellipse at 50% 45%,rgba(80,28,170,.78),rgba(10,2,32,.95));pointer-events:auto;animation:hs-fadein .25s ease-out}
.hs-prize .rays{position:absolute;left:50%;top:50%;width:max(150%,1100u);aspect-ratio:1;margin:calc(max(150%,1100u)/-2) 0 0 calc(max(150%,1100u)/-2);opacity:.55;border-radius:50%;background:repeating-conic-gradient(from 0deg,rgba(255,236,150,.55) 0 8deg,transparent 8deg 24deg);-webkit-mask:radial-gradient(circle,#000 0,transparent 52%);mask:radial-gradient(circle,#000 0,transparent 52%);animation:hs-spin 24s linear infinite;pointer-events:none;will-change:transform}
.hs-pz-card{position:relative;display:flex;flex-direction:column;align-items:center;gap:12u;width:min(94%,520u);max-height:96%;padding:46u 20u 20u;animation:hs-pop .6s cubic-bezier(.2,1.2,.3,1) backwards}
.hs-pz-title{position:absolute;left:50%;top:-28u;transform:translateX(-50%);max-width:112%;pointer-events:none;font-size:40u;--sk:9u;--dp:4u;--ol:var(--ink);padding:0 10u;white-space:nowrap}
.hs-pz-row{display:flex;flex-wrap:wrap;gap:12u;justify-content:center;align-items:flex-start}
.hs-pz-it{--rc:#ffd23d;position:relative;display:flex;flex-direction:column;align-items:center;gap:4u;width:130u;padding:12u 8u 10u;border-radius:14u;background:radial-gradient(circle at 50% 38%,rgba(255,255,255,.2),transparent 66%),linear-gradient(180deg,#3a1688,#1b0a45);border:3.5u solid var(--ink);box-shadow:inset 0 0 0 3u var(--rc),0 5u 0 var(--ink);animation:hs-pop .6s cubic-bezier(.2,1.4,.3,1) backwards;animation-delay:calc(var(--k,0)*160ms + 200ms)}
.hs-pz-it .big{width:84u;height:84u;display:flex;align-items:center;justify-content:center;animation:hs-bob 2.4s ease-in-out infinite}
.hs-pz-it .big img{max-width:100%;max-height:100%;object-fit:contain;filter:drop-shadow(0 6u 6u rgba(0,0,0,.45))}
.hs-pz-it .big .hs-ic{width:100%;height:100%}
.hs-pz-it b{font-size:26u;font-weight:1000;line-height:1}
.hs-pz-it small{font-size:12.5u;font-weight:800;color:#e0d6ff;text-align:center;line-height:1.1;max-width:100%}
.hs-pz-it .rr{font-size:11u}
.hs-pz-it.coin b{color:var(--lime)}
.hs-pz-it.gem b{color:#ffa6dc}
.hs-pz-note{font-size:13u;color:#d6c8ff;text-align:center}
.hs-pz-card .hs-btn{width:min(100%,300u);height:58u;font-size:26u}

/* ---------- ПОДАРОК ДНЯ ---------- */
.hs-dgwin{position:absolute;inset:0;margin:auto;width:min(96%,900u);height:max-content;max-height:96%;padding:12u 16u 18u;display:flex;flex-direction:column;gap:11u}
.hs-dg-head{display:flex;align-items:center;gap:12u;min-height:50u;flex:none}
.hs-dg-title{font-size:34u;--ol:var(--ink);--sk:9u;--dp:4u;padding:0 4u;margin-right:auto;white-space:nowrap}
.hs-dg-head .hs-sh-wallet{margin-left:0}
.hs-dg-body{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,32%);gap:12u;min-height:0;flex:1 1 auto;overflow-y:auto;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;padding:2u 4u 8u}
.hs-dg-days{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:11u}
.hs-dg-day{position:relative;display:flex;flex-direction:column;align-items:center;justify-content:space-between;gap:4u;min-height:116u;padding:8u 6u 8u;border-radius:14u;background:linear-gradient(180deg,#3a1688,#1b0a45);border:3.5u solid var(--ink);box-shadow:0 5u 0 var(--ink),inset 0 0 0 2.5u rgba(167,123,255,.55);animation:hs-cardin .5s cubic-bezier(.2,1,.3,1) backwards;animation-delay:calc(var(--i,0)*60ms)}
.hs-dg-day .dt{font-size:max(9px,13u);font-weight:1000;letter-spacing:.04em;color:#d6c8ff}
.hs-dg-day .dr{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4u;min-height:0}
.hs-dg-day .rc{display:flex;align-items:center;gap:5u;font-size:max(11px,19u);font-weight:1000;line-height:1}
.hs-dg-day .rc img{width:27u;height:27u;object-fit:contain;flex:none;filter:drop-shadow(0 2u 0 rgba(0,0,0,.4))}
.hs-dg-day .rc .hs-ic{width:34u;height:34u;flex:none}
.hs-dg-day .rc svg{width:32u;height:32u;flex:none}
.hs-dg-day .rc.gem b{color:#ffa6dc}
.hs-dg-day .rc.coin b{color:var(--lime)}
.hs-dg-day .ds{padding:1u 10u 2u;border-radius:99u;font-size:max(8.5px,11u);font-weight:1000;line-height:1.1;background:#0e0428;border:2u solid var(--ink);color:#d6c8ff;white-space:nowrap}
.hs-dg-day.claimed{background:linear-gradient(180deg,#1f6a3a,#0d3a22);box-shadow:0 5u 0 var(--ink),inset 0 0 0 2.5u rgba(123,232,42,.6)}
.hs-dg-day.claimed .dr,.hs-dg-day.claimed .dt{opacity:.4}
.hs-dg-day.claimed .ds{background:linear-gradient(180deg,#a8f35a,#4fc415);color:var(--ink)}
.hs-dg-day .ck{position:absolute;right:5u;top:5u;width:30u;height:30u;border-radius:50%;background:linear-gradient(180deg,#d9ff70,#4fc415);border:3u solid var(--ink);box-shadow:0 3u 0 var(--ink);display:none;align-items:center;justify-content:center}
.hs-dg-day .ck svg{width:20u;height:20u}
.hs-dg-day.claimed .ck{display:flex;animation:hs-starpop .6s cubic-bezier(.2,1.8,.4,1) backwards}
.hs-dg-day.today{background:linear-gradient(180deg,#6a37d8,#3a1688);box-shadow:0 5u 0 var(--ink),inset 0 0 0 3u var(--gold),0 0 0 3u var(--gold);animation:hs-cardin .5s cubic-bezier(.2,1,.3,1) backwards,hs-todayglow 1.4s ease-in-out .6s infinite;animation-delay:calc(var(--i,0)*60ms),0s;z-index:1}
.hs-dg-day.today .ds{background:linear-gradient(180deg,#fff39a,#ffc21f);color:var(--ink)}
.hs-dg-day.tomorrow{box-shadow:0 5u 0 var(--ink),inset 0 0 0 2.5u var(--ice)}
.hs-dg-day.tomorrow .ds{color:var(--ice)}
.hs-dg-day.locked{opacity:.88}
.hs-dg-day.locked .dr{opacity:.75}
.hs-dg-goal{--rc:#ff3d6e;--rca:rgba(255,61,110,.5);position:relative;display:flex;flex-direction:column;align-items:center;gap:4u;padding:10u 10u 10u;border-radius:16u;background:radial-gradient(ellipse at 50% 38%,#7a2fe0 0,#3d1496 55%,#1d0852 100%);border:4u solid var(--ink);box-shadow:inset 0 0 0 3u var(--rc),0 6u 0 var(--ink);overflow:hidden;animation:hs-cardin .5s cubic-bezier(.2,1,.3,1) .45s backwards}
.hs-dg-goal .gt{display:flex;align-items:center;gap:8u;font-size:max(10px,14u);font-weight:1000;color:#ffe9f0;position:relative;z-index:1}
.hs-dg-goal .gt b{padding:1u 10u 2u;border-radius:99u;background:linear-gradient(180deg,#ff9fd2,#e0207f);border:2.5u solid var(--ink);font-size:max(9px,12u)}
.hs-dg-goal .gs{position:relative;flex:1;min-height:90u;width:100%;display:flex;align-items:center;justify-content:center}
.hs-dg-goal .gs .rays{position:absolute;left:50%;top:50%;width:150%;aspect-ratio:1;margin-left:-75%;margin-top:-75%;border-radius:50%;background:repeating-conic-gradient(from 0deg,rgba(255,200,230,.45) 0 8deg,transparent 8deg 24deg);-webkit-mask:radial-gradient(circle,#000 0,transparent 58%);mask:radial-gradient(circle,#000 0,transparent 58%);animation:hs-spin 20s linear infinite;will-change:transform}
.hs-dg-goal .gs .gi{position:relative;width:78%;height:92%;animation:hs-bob 2.8s ease-in-out infinite}
.hs-dg-goal .gn{font-size:21u;font-weight:1000;line-height:1.05;text-align:center;position:relative;z-index:1}
.hs-dg-goal .gh{font-size:max(9px,12u);font-weight:800;color:#f0e0ff;text-align:center;line-height:1.1;position:relative;z-index:1}
.hs-dg-goal .ds{position:relative;z-index:1;padding:1u 12u 2u;border-radius:99u;font-size:max(9px,12u);font-weight:1000;background:#0e0428;border:2u solid var(--ink);color:#d6c8ff}
.hs-dg-goal.claimed .ds{background:linear-gradient(180deg,#a8f35a,#4fc415);color:var(--ink)}
.hs-dg-goal.today{box-shadow:inset 0 0 0 3u var(--rc),0 6u 0 var(--ink),0 0 24u 2u var(--rc)}
.hs-dg-goal .big{position:relative;z-index:1;display:flex;align-items:center;gap:8u;font-size:34u;font-weight:1000;color:var(--lime)}
.hs-dg-goal .big img{width:54u;height:54u;object-fit:contain}
.hs-dg-foot{display:flex;gap:14u;align-items:stretch;flex:none;padding:0 6u}
.hs-dg-foot .hs-btn{height:62u;min-width:0}
.hs-dg-claim{flex:1.15 1 0;font-size:30u}
.hs-dg-x2{flex:1 1 0;font-size:19u;flex-direction:column;gap:1u;line-height:1.05;padding:0 8u}
.hs-dg-x2 .row{display:flex;align-items:center;gap:7u}
.hs-dg-x2 .sub{display:flex;gap:10u;align-items:center;font-size:max(10px,14u);color:var(--ink);text-shadow:none;font-weight:1000}
.hs-dg-x2 .sub img{width:20u;height:20u;object-fit:contain}
.hs-dg-x2 .sub svg{width:20u;height:20u}
.hs-dg-x2 .sub span{display:flex;align-items:center;gap:3u}
.hs-dg-next{text-align:center;font-size:max(10px,17u);color:#d6c8ff;min-height:1.2em;font-variant-numeric:tabular-nums}
.hs-dg-win .hs-hint{min-height:0;display:none;font-size:max(10px,13.5u)}
.hs-dg-win .hs-hint.on{display:block}
.hs-dg-win .hs-hint.neutral{color:#d6c8ff;text-shadow:none}

/* ---------- КОЛЕСО ФОРТУНЫ ---------- */
.hs-whwin{position:absolute;inset:0;margin:auto;width:min(96%,860u);height:max-content;max-height:96%;padding:12u 16u 18u;display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,1fr);grid-template-areas:'head head' 'disk side';gap:8u 18u;align-items:center}
.hs-wh-head{grid-area:head;display:flex;align-items:center;gap:12u;min-height:50u}
.hs-wh-title{font-size:32u;--ol:var(--ink);--sk:9u;--dp:4u;padding:0 4u;margin-right:auto;white-space:nowrap}
.hs-wh-head .hs-sh-wallet{margin-left:0}
.hs-wh-area{grid-area:disk;display:flex;justify-content:center;align-items:center;min-width:0;padding-top:16u}
.hs-wh-stage{position:relative;width:var(--ds,260px);height:var(--ds,260px);flex:none}
.hs-wh-rim{position:absolute;inset:0;border-radius:50%;background:radial-gradient(circle,#2a0f66 0,#2a0f66 70%,#ffe45c 71%,#ffa91a 100%);box-shadow:0 0 0 5u var(--ink),0 10u 0 5u var(--ink),0 18u 26u rgba(0,0,0,.55)}
.hs-wh-rim::after{content:'';position:absolute;inset:1.2%;border-radius:50%;background:repeating-conic-gradient(from 0deg,#fff6a8 0 2.5deg,transparent 2.5deg 15deg);-webkit-mask:radial-gradient(circle,transparent 90%,#000 91%,#000 97%,transparent 98%);mask:radial-gradient(circle,transparent 90%,#000 91%,#000 97%,transparent 98%);animation:hs-bulbs 1s steps(2) infinite}
.hs-wh-disk{position:absolute;inset:5.5%;border-radius:50%;overflow:hidden;box-shadow:0 0 0 3u var(--ink),inset 0 0 22u rgba(0,0,0,.35);will-change:transform;background:#2a0f66}
.hs-wh-disk svg{position:absolute;inset:0;width:100%;height:100%;display:block}
.hs-wh-disk .wd{stroke:#12042b;stroke-width:1.1;transition:filter .2s}
.hs-wh-disk .wd.win{animation:hs-wedge .5s ease-in-out infinite alternate}
.hs-wh-pz{position:absolute;left:50%;top:50%;width:0;height:0}
.hs-wh-pz .in{position:absolute;left:0;top:calc(var(--ds)*-.335);transform:translate(-50%,-50%);display:flex;flex-direction:column;align-items:center;gap:1px;width:calc(var(--ds)*.25)}
.hs-wh-pz .in img{width:calc(var(--ds)*.115);height:calc(var(--ds)*.115);object-fit:contain;filter:drop-shadow(0 2px 0 rgba(0,0,0,.35))}
.hs-wh-pz .in .hs-ic{width:calc(var(--ds)*.15);height:calc(var(--ds)*.15)}
.hs-wh-pz .in .hs-ic img{width:100%;height:100%}
.hs-wh-pz .in b{font-size:max(9px,calc(var(--ds)*.052));font-weight:1000;line-height:1;color:#fff;text-shadow:1px 0 0 #12042b,-1px 0 0 #12042b,0 1px 0 #12042b,0 -1px 0 #12042b,0 2px 0 #12042b;font-variant-numeric:tabular-nums}
.hs-wh-pz.item .in{top:calc(var(--ds)*-.34)}
.hs-wh-pz.item .ring{padding:calc(var(--ds)*.006);border-radius:50%;background:radial-gradient(circle,rgba(255,255,255,.85),rgba(255,255,255,.25) 70%,transparent);box-shadow:0 0 0 2px var(--rc),0 0 10px var(--rc)}
.hs-wh-hub{position:absolute;left:50%;top:50%;width:19%;aspect-ratio:1;margin:-9.5% 0 0 -9.5%;border-radius:50%;background:radial-gradient(circle at 40% 30%,#fff3a0,#ffc61f 55%,#c47a00);border:calc(var(--ds)*.016) solid var(--ink);box-shadow:0 5u 0 var(--ink),inset 0 3u 0 rgba(255,255,255,.6);z-index:2;display:flex;align-items:center;justify-content:center}
.hs-wh-hub::after{content:'';width:42%;height:42%;border-radius:50%;background:radial-gradient(circle at 40% 30%,#fff,#c9d2e8);box-shadow:inset 0 -3u 0 rgba(0,0,0,.2)}
.hs-wh-ptr{position:absolute;left:50%;top:-5.5%;width:12%;aspect-ratio:48/56;margin-left:-6%;z-index:3;transform-origin:50% 25%;filter:drop-shadow(0 4u 3u rgba(0,0,0,.5))}
.hs-wh-ptr svg{width:100%;height:100%}
.hs-wh-ptr.flick{animation:hs-flick .12s ease-out}
.hs-wh-side{grid-area:side;display:flex;flex-direction:column;gap:11u;min-width:0;justify-content:center;padding:0 6u}
.hs-wh-info{padding:10u 12u;text-align:center;font-size:max(10px,16u);color:#d6c8ff;font-weight:900;line-height:1.2}
.hs-wh-info b{display:block;font-size:22u;color:#fff;font-weight:1000}
.hs-wh-side .hs-btn{height:62u;font-size:22u;width:100%;line-height:1.05;min-width:0}
.hs-wh-ad{flex-direction:column;gap:1u;font-size:17u}
.hs-wh-ad .row{display:flex;align-items:center;gap:7u}
.hs-wh-ad .sub{font-size:max(10px,13u);color:var(--ink);text-shadow:none;font-weight:1000}
.hs-wh-side .hs-hint{min-height:0;display:none;font-size:max(10px,13.5u)}
.hs-wh-side .hs-hint.on{display:block}
.hs-wh-side .hs-hint.neutral{color:#d6c8ff;text-shadow:none}

/* ---------- ПРЕДЛОЖЕНИЕ В РАУНДЕ ---------- */
.hs-offer{position:absolute;inset:0;z-index:45;display:flex;align-items:center;justify-content:center;background:radial-gradient(ellipse at 50% 45%,rgba(60,16,140,.5),rgba(10,2,32,.84));pointer-events:auto;animation:hs-fadein .22s ease-out}
.hs-offer.out{opacity:0;transition:opacity .2s}
.hs-of-card{position:relative;display:flex;flex-direction:column;align-items:center;gap:10u;width:min(92%,430u);padding:60u 20u 20u;animation:hs-pop .55s cubic-bezier(.2,1.3,.3,1) backwards}
.hs-of-ring{position:absolute;left:50%;top:-44u;width:92u;height:92u;margin-left:-46u;filter:drop-shadow(0 6u 0 rgba(0,0,0,.45))}
.hs-of-ring svg{width:100%;height:100%;transform:rotate(-90deg)}
.hs-of-ring .bg{fill:#2a0f66;stroke:#12042b;stroke-width:12}
.hs-of-ring .tr{fill:none;stroke:#4a2096;stroke-width:9}
.hs-of-ring .pg{fill:none;stroke:#c2ff4a;stroke-width:9;stroke-linecap:round;transition:stroke .3s}
.hs-of-ring.low .pg{stroke:#ff5577}
.hs-of-ring b{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:40u;font-weight:1000;font-variant-numeric:tabular-nums}
.hs-of-ring.low{animation:hs-pulse .5s ease-in-out infinite}
.hs-of-title{font-size:38u;--sk:9u;--dp:4u;--ol:#4a0628;--g1:#ffd0e6;--g2:#ff5c9e;--g3:#d4146f;padding:0 8u;margin-top:4u;max-width:100%}
.hs-offer.time .hs-of-title{--g1:#fff6a8;--g2:#ffd43b;--g3:#ff9a1c;--ol:#4a2a00}
.hs-of-sub{font-size:20u;font-weight:900;color:#e0d6ff;text-align:center;line-height:1.15}
.hs-of-card .hs-btn.go{width:100%;height:auto;min-height:68u;padding:6u 12u;box-sizing:border-box;font-size:26u;flex-direction:column;gap:2u;line-height:1.05}
.hs-of-card .hs-btn.go .row{display:flex;align-items:center;gap:8u;max-width:100%;white-space:nowrap}
.hs-of-card .hs-btn.go .sub{font-size:max(11px,15u)}
.hs-of-no{padding:8u 18u;border-radius:99u;font-size:17u;font-weight:900;color:#d6c8ff;background:rgba(14,4,40,.6);border:3u solid var(--ink);pointer-events:auto}
.hs-of-no:active{transform:translateY(2u)}
.hs-of-card .hs-hint{min-height:0;display:none;font-size:14u}
.hs-of-card .hs-hint.on{display:block}

/* результат: кошелёк, x2 */
.hs-rtop{display:flex;flex-direction:column;align-items:center;gap:6u;width:100%}
.hs-rtop .hs-sh-wallet{margin:0;padding:0 10u 0 8u;gap:22u}
.hs-rtop .hs-sh-wallet .hs-pill{font-size:16u;height:34u;padding-left:34u}
.hs-rtop .hs-pill-ic{height:40u;width:40u}
.hs-x2{width:100%;height:auto;min-height:56u;padding:5u 10u;box-sizing:border-box;font-size:21u;flex-direction:column;gap:1u;line-height:1.05;flex:none}
.hs-x2 .row{display:flex;align-items:center;gap:6u;max-width:100%;white-space:nowrap}
.hs-x2 .row .t{overflow:hidden;text-overflow:ellipsis}
.hs-x2 .sub{font-size:max(10px,14u);color:var(--ink);text-shadow:none;font-weight:1000}
.hs-x2.done{--b1:#d9ff70;--b2:#78e526;--b3:#2f9410;--bo:#123a0a;cursor:default}
.hs-x2 .hs-hint{display:none}

/* настройки */
.hs-setwin{position:absolute;inset:0;margin:auto;width:min(94%,460u);height:max-content;max-height:94%;padding:16u 20u 20u;display:flex;flex-direction:column;gap:12u}
.hs-set-title{font-size:34u;text-align:center;--ol:var(--ink);--sk:8u;--dp:3u;align-self:center;padding:0 4u}
.hs-row{display:flex;align-items:center;gap:12u;min-height:50u;padding:6u 12u;font-size:20u;font-weight:1000}
.hs-row>svg{width:28u;height:28u;flex:none}
.hs-row .lb{flex:1;min-width:0}
.hs-switch{position:relative;width:78u;height:38u;border-radius:11u;background:linear-gradient(180deg,#3a3358,#27213f);border:3.5u solid var(--ink);box-shadow:inset 0 3u 0 rgba(0,0,0,.55),0 3u 0 var(--ink);transition:background .2s;pointer-events:auto;flex:none}
.hs-switch::before{content:'';position:absolute;left:3u;top:50%;width:26u;height:26u;margin-top:-13u;border-radius:8u;background:linear-gradient(180deg,#fff,#c9c0e8);border:2.5u solid var(--ink);box-shadow:0 3u 0 rgba(0,0,0,.35);transition:transform .25s cubic-bezier(.3,1.6,.5,1)}
.hs-switch.on{background:linear-gradient(180deg,#a8f35a,#4fc415)}
.hs-switch.on::before{transform:translateX(38u)}
.hs-qrow{display:flex;flex-direction:column;gap:8u;padding:8u 12u 12u}
.hs-qrow .hd{display:flex;align-items:center;gap:12u;font-size:20u;font-weight:1000}
.hs-qrow .hd svg{width:28u;height:28u}
.hs-qseg{display:grid;grid-template-columns:repeat(4,1fr);gap:7u}
.hs-qseg button{position:relative;height:38u;font-size:max(9px,12.5u);font-weight:1000;color:#d6c8ff;pointer-events:auto;padding:0 2u;min-width:0;overflow:hidden;text-overflow:ellipsis;isolation:isolate}
.hs-qseg button::before{content:'';position:absolute;inset:0;z-index:-1;transform:skewX(-8deg);border-radius:10u;border:3u solid var(--ink);background:linear-gradient(180deg,rgba(255,255,255,.2) 0 44%,transparent 45%),linear-gradient(180deg,#4a2096,#2a0f66);box-shadow:0 3u 0 var(--ink)}
.hs-qseg button.on{color:var(--ink)}
.hs-qseg button.on::before{background:linear-gradient(180deg,rgba(255,255,255,.55) 0 44%,transparent 45%),linear-gradient(180deg,#d9ff70,#78e526)}
.hs-set-btns{display:flex;gap:10u;margin-top:2u}
.hs-set-btns .hs-btn{flex:1;height:54u;font-size:19u}
.hs-set-close{position:absolute;right:-10u;top:-14u}
`;

const HSUI_CSS2 = `
/* ---------- КОДЕКС ---------- */
.hs-cxwin{position:absolute;inset:calc(2.2% + env(safe-area-inset-top,0px)) calc(2% + env(safe-area-inset-right,0px)) calc(2.2% + env(safe-area-inset-bottom,0px)) calc(2% + env(safe-area-inset-left,0px));margin:auto;max-width:1120u;max-height:660u;display:flex;flex-direction:column;padding:12u 14u 16u;gap:8u}
.hs-cx-head{display:flex;align-items:center;gap:12u;flex:none;min-height:52u}
.hs-cx-title{font-size:30u;--ol:var(--ink);--sk:8u;--dp:4u;padding:0 4u;margin-right:4u;white-space:nowrap}
.hs-cx-prog{margin-left:auto;display:flex;flex-direction:column;gap:4u;width:min(230u,32%);min-width:120u}
.hs-cx-prog b{font-size:max(11px,16u);font-weight:1000;text-align:right;white-space:nowrap}
.hs-cx-prog b em{font-style:normal;color:var(--lime)}
.hs-cx-filt{display:flex;flex-wrap:wrap;gap:8u 8u;padding:2u 6u 9u;flex:none}
.hs-cx-chip{--rc:#fff;position:relative;flex:0 0 auto;display:flex;align-items:center;gap:5u;height:32u;padding:0 12u 0 9u;font-size:max(9.5px,12.5u);font-weight:1000;color:#d6c8ff;isolation:isolate;white-space:nowrap}
.hs-cx-chip::before{content:'';position:absolute;inset:0;z-index:-1;transform:skewX(-8deg);border-radius:9u;border:3u solid var(--ink);background:linear-gradient(180deg,rgba(255,255,255,.2) 0 44%,transparent 45%),linear-gradient(180deg,#4a2096,#2a0f66);box-shadow:0 3u 0 var(--ink)}
.hs-cx-chip i{width:13u;height:13u;border-radius:50%;background:var(--rc);border:2.5u solid var(--ink);flex:none}
.hs-cx-chip.r-god i{background:var(--rbw);background-size:300% 100%;animation:hs-rbw 3s linear infinite}
.hs-cx-chip.r-secret i{background:#000;border-color:#fff}
.hs-cx-chip b{font-weight:1000;opacity:.8;font-size:.9em}
.hs-cx-chip.on{color:var(--ink)}
.hs-cx-chip.on::before{background:linear-gradient(180deg,rgba(255,255,255,.55) 0 44%,transparent 45%),linear-gradient(180deg,#d9ff70,#78e526)}
.hs-cx-grid{--cols:6;flex:1;min-height:0;overflow-y:auto;overflow-x:hidden;overscroll-behavior:contain;display:grid;grid-template-columns:repeat(var(--cols,6),minmax(0,1fr));gap:13u;align-content:start;padding:6u 8u 12u;scrollbar-width:thin;scrollbar-color:#a77bff #14043a;-webkit-overflow-scrolling:touch;touch-action:pan-y}
.hs-cx-grid::-webkit-scrollbar{width:8px}.hs-cx-grid::-webkit-scrollbar-thumb{background:#a77bff;border-radius:8px}.hs-cx-grid::-webkit-scrollbar-track{background:#14043a;border-radius:8px}
.hs-cxc{--rc:#b8c4d0;--rca:rgba(184,196,208,.4);position:relative;width:100%;aspect-ratio:1/1.14;border-radius:14u;border:3.5u solid var(--ink);text-align:center;
  background:linear-gradient(180deg,rgba(255,255,255,.14) 0,rgba(255,255,255,.14) 22%,rgba(255,255,255,0) 23%),linear-gradient(180deg,#3a1688,#1b0a45);box-shadow:inset 0 0 0 3u var(--rc),0 5u 0 var(--ink);
  animation:hs-cardin .5s cubic-bezier(.2,1,.3,1) backwards;animation-delay:calc(var(--i,0)*28ms);pointer-events:auto}
.hs-cxc::before{content:'';position:absolute;left:8%;right:8%;top:22%;bottom:16%;border-radius:50%;background:radial-gradient(ellipse at 50% 55%,var(--rca),transparent 70%);pointer-events:none}
.hs-cxc .nm{position:absolute;left:5%;right:5%;top:5%;font-size:max(9px,12u);font-weight:1000;line-height:1.05;height:2.1em;overflow-wrap:anywhere;hyphens:auto;display:flex;align-items:center;justify-content:center;text-shadow:0 2u 0 var(--ink);overflow:hidden}
.hs-cxc .im{position:absolute;left:10%;right:10%;top:23%;bottom:24%;display:flex;align-items:center;justify-content:center}
.hs-cxc .bt{position:absolute;left:0;right:0;bottom:6%;display:flex;align-items:center;justify-content:center;gap:5u}
.hs-cxc .hs-rr{font-size:max(8.5px,10.5u)}
.hs-cxc .ct{position:absolute;right:-7u;top:-9u;z-index:2;min-width:26u;height:22u;padding:0 6u;border-radius:99u;background:linear-gradient(180deg,#fff39a,#ffc21f);border:2.5u solid var(--ink);box-shadow:0 2u 0 var(--ink);color:var(--ink);font-size:max(9px,12.5u);font-weight:1000;display:flex;align-items:center;justify-content:center}
.hs-cxc.unk{box-shadow:inset 0 0 0 3u rgba(255,255,255,.14),0 5u 0 var(--ink);background:linear-gradient(180deg,#2a1063,#12062e)}
.hs-cxc.unk::before{display:none}
.hs-cxc.unk .nm{color:#a78fe0;font-size:max(12px,18u)}
.hs-cxc.unk .hs-rr{opacity:.6}
.hs-cxc.unk .hs-ic.miss{color:#6c4fb8}
.hs-cxc.r-god:not(.unk){border-color:transparent;background:linear-gradient(180deg,rgba(255,255,255,.14) 0,rgba(255,255,255,.14) 22%,rgba(255,255,255,0) 23%) padding-box,linear-gradient(180deg,#3a1688,#1b0a45) padding-box,var(--rbw) border-box;background-size:100% 100%,100% 100%,300% 100%;box-shadow:0 5u 0 var(--ink);animation:hs-cardin .5s cubic-bezier(.2,1,.3,1) backwards,hs-rbwb3 3s linear infinite;animation-delay:calc(var(--i,0)*28ms),0s}
.hs-cxc.r-secret:not(.unk){background:linear-gradient(180deg,rgba(255,255,255,.1) 0,rgba(255,255,255,.1) 22%,rgba(255,255,255,0) 23%),linear-gradient(180deg,#14141c,#000);box-shadow:inset 0 0 0 3u #fff,0 5u 0 var(--ink),0 0 14u rgba(255,255,255,.4)}
.hs-cx-note{flex:none;text-align:center;font-size:max(10px,13.5u);color:#cdbcff;font-weight:800}

/* ---------- БАЗА: HUD и инвентарь ---------- */
.hs-basehud{position:absolute;inset:0;pointer-events:none;--u:1px;z-index:1}
.hs-hb.bk-back .hs-fit{width:152px;height:50px}
.hs-hb.bk-bank .hs-fit{width:304px;height:160px}
.hs-hb.bk-wallet .hs-fit{width:262px;height:42px}
.hs-hb.bk-inv .hs-fit{width:184px;height:66px}
.hs-bk-back{position:absolute;inset:0 0 6px 0;width:100%;height:calc(100% - 6px);font-size:16px}
.hs-bk-back svg{width:22px;height:22px}
.hs-bk-inv{position:absolute;left:0;top:0;width:100%;height:calc(100% - 8px);font-size:17px;--rd:14px}
.hs-bk-inv svg{width:30px;height:30px}
.hs-bk-inv .cnt{position:absolute;right:-3px;top:-11px;z-index:2;min-width:28px;height:28px;padding:0 7px;border-radius:99px;background:linear-gradient(180deg,#ff9fd2,#e0207f);border:3px solid var(--ink);box-shadow:0 3px 0 var(--ink);font-size:15px;font-weight:1000;display:flex;align-items:center;justify-content:center;letter-spacing:0}
.hs-bank{position:absolute;inset:0 0 8px 0;display:flex;flex-direction:column;gap:5px;padding:10px 14px 12px}
.hs-bank .r1{display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:13px;color:#d6c8ff;font-weight:1000;line-height:1}
.hs-bank .r1 b{color:var(--gold);letter-spacing:.06em;font-size:14px}
.hs-bank .r1 span{white-space:nowrap}
.hs-bank .r2{display:flex;align-items:center;gap:8px;line-height:1;min-height:34px}
.hs-bank .r2 img{width:34px;height:34px;flex:none;filter:drop-shadow(0 3px 0 rgba(0,0,0,.4))}
.hs-bank .r2 b{font-size:32px;font-weight:1000;color:var(--lime);font-variant-numeric:tabular-nums;--s:2px;--ol:#16400a}
.hs-bank .r2 small{font-size:13px;font-weight:900;color:#bda8ff;margin-left:auto;white-space:nowrap}
.hs-bank .hs-bar{height:14px}
.hs-bank.full .hs-bar i{background:linear-gradient(180deg,#ff9fd2,#e0207f);animation:hs-pulse .8s ease-in-out infinite}
.hs-bank .r3{font-size:11.5px;color:#bda8ff;font-weight:800;min-height:13px;line-height:1.1;text-align:center}
.hs-bank.full .r3{color:#ff9fd2;font-weight:1000}
.hs-bank .r4{display:flex;gap:8px;margin-top:auto}
.hs-bank .r4 .hs-btn{flex:1;min-width:0;height:40px;font-size:13.5px;--th:5px;--rd:11px;line-height:1.02;padding:0 4px;text-align:center}
.hs-bank .r4 .hs-btn svg{width:15px;height:15px}
.hs-bank .r4 .hs-btn .t{white-space:normal;text-align:center}
.hs-bank .r4 .hs-btn.x2{flex:1.05}
.hs-bank.pop{animation:hs-bump .4s cubic-bezier(.3,1.6,.5,1)}
.hs-basewal{position:absolute;inset:0;display:flex;gap:16px;justify-content:flex-end;align-items:center;padding-left:6px}
.hs-basewal .hs-pill{flex:1;height:38px;font-size:20px;padding:0 12px 0 36px;min-width:0}
.hs-basewal .hs-pill.hasplus{padding-right:28px}
.hs-basewal .hs-pill-ic{left:-6px;height:44px;width:44px}

.hs-invwin{position:absolute;inset:calc(2.2% + env(safe-area-inset-top,0px)) calc(2% + env(safe-area-inset-right,0px)) calc(2.2% + env(safe-area-inset-bottom,0px)) calc(2% + env(safe-area-inset-left,0px));margin:auto;max-width:1040u;max-height:640u;display:flex;flex-direction:column;padding:12u 14u 16u;gap:9u}
.hs-iv-head{display:flex;align-items:center;gap:12u;flex:none;min-height:52u}
.hs-iv-title{font-size:30u;--ol:var(--ink);--sk:8u;--dp:4u;padding:0 4u;margin-right:auto;white-space:nowrap}
.hs-iv-tabs{display:none;gap:8u;flex:none;padding:0 4u 6u}
.hs-iv-tabs .hs-tab{flex:1 1 0}
.hs-iv-tabs .hs-tab.on{flex:1 1 0}
.hs-iv-body{flex:1;min-height:0;display:grid;grid-template-columns:minmax(0,1.12fr) minmax(0,1fr);gap:14u}
.hs-iv-col{min-height:0;display:flex;flex-direction:column;gap:6u}
.hs-iv-colh{display:flex;align-items:center;gap:8u;font-size:max(11px,15u);font-weight:1000;color:var(--gold);letter-spacing:.05em;padding:0 6u;flex:none}
.hs-iv-colh svg{width:22u;height:22u}
.hs-iv-list{flex:1;min-height:0;overflow-y:auto;overflow-x:hidden;overscroll-behavior:contain;display:flex;flex-direction:column;gap:11u;padding:4u 8u 12u;scrollbar-width:thin;scrollbar-color:#a77bff #14043a;-webkit-overflow-scrolling:touch;touch-action:pan-y}
.hs-iv-list::-webkit-scrollbar{width:8px}.hs-iv-list::-webkit-scrollbar-thumb{background:#a77bff;border-radius:8px}.hs-iv-list::-webkit-scrollbar-track{background:#14043a;border-radius:8px}
.hs-iv-empty{margin:auto;text-align:center;padding:24u 16u;font-size:max(11px,17u);color:#cdbcff;font-weight:900;line-height:1.25;display:flex;flex-direction:column;align-items:center;gap:10u}
.hs-iv-empty svg{width:64u;height:64u;color:#6c4fb8}
.hs-ivrow{--rc:#b8c4d0;position:relative;display:flex;flex-wrap:wrap;align-items:center;gap:6u 10u;padding:8u 10u;border-radius:13u;background:linear-gradient(180deg,#3a1688,#1b0a45);border:3.5u solid var(--ink);box-shadow:inset 0 0 0 2.5u var(--rc),0 4u 0 var(--ink);pointer-events:auto;animation:hs-cardin .45s cubic-bezier(.2,1,.3,1) backwards;animation-delay:calc(var(--i,0)*36ms)}
.hs-ivrow.r-god{border-color:transparent;background:linear-gradient(180deg,#3a1688,#1b0a45) padding-box,var(--rbw) border-box;background-size:100% 100%,300% 100%;box-shadow:0 4u 0 var(--ink);animation:hs-cardin .45s cubic-bezier(.2,1,.3,1) backwards,hs-rbwb 3s linear infinite;animation-delay:calc(var(--i,0)*36ms),0s}
.hs-ivrow.r-secret{background:linear-gradient(180deg,#14141c,#000);box-shadow:inset 0 0 0 2.5u #fff,0 4u 0 var(--ink)}
.hs-ivrow .ic{width:52u;height:52u;flex:none}
.hs-ivrow .tx{flex:1 1 90u;min-width:0;display:flex;flex-direction:column;gap:3u}
.hs-ivrow .nm{font-size:max(11px,16u);font-weight:1000;line-height:1.05;overflow:hidden;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}
.hs-ivrow .meta{display:flex;align-items:center;gap:6u;flex-wrap:wrap;font-size:max(9.5px,12u);color:#d6c8ff;font-weight:900;line-height:1.1}
.hs-ivrow .meta .inc{color:var(--lime)}
.hs-ivrow .meta .mu{padding:0 7u 1u;border-radius:99u;background:linear-gradient(180deg,#fff39a,#ffc21f);border:2u solid var(--ink);color:var(--ink);font-size:max(8.5px,10.5u)}
.hs-ivrow .meta img{width:14u;height:14u;display:inline-block;vertical-align:-2u;margin-right:2u}
.hs-ivrow .acts{display:flex;gap:7u;flex:none;align-items:center}
.hs-ivrow .acts .hs-btn{height:40u;padding:0 13u;font-size:max(10px,13.5u);--th:5u;--rd:10u;white-space:nowrap}
.hs-ivrow .acts .hs-btn svg{width:17u;height:17u}
.hs-ivrow .acts .sure{font-size:max(10px,12.5u);color:#ffd0e6;font-weight:1000;max-width:80u;line-height:1.05;text-align:right}
.hs-ivpick{flex:1 0 100%;display:flex;flex-wrap:wrap;gap:7u;align-items:center;padding-top:2u}
.hs-ivpick .lb{font-size:max(10px,12u);color:#d6c8ff;font-weight:900;margin-right:2u}
.hs-ivpick button{position:relative;width:38u;height:38u;border-radius:10u;font-size:max(11px,16u);font-weight:1000;color:var(--ink);pointer-events:auto;background:linear-gradient(180deg,rgba(255,255,255,.5) 0 44%,transparent 45%),linear-gradient(180deg,#d9ff70,#78e526);border:3u solid var(--ink);box-shadow:0 4u 0 var(--ink);transition:transform .08s}
.hs-ivpick button:active{transform:translateY(3u);box-shadow:0 1u 0 var(--ink)}
.hs-ivrow .hs-hint{flex:1 0 100%;min-height:0;display:none;font-size:max(10px,12.5u);text-align:left}
.hs-ivrow .hs-hint.on{display:block}
.hs-slotrow{--rc:#6c4fb8;position:relative;display:flex;align-items:center;gap:10u;padding:7u 10u;border-radius:13u;background:linear-gradient(180deg,#2a0f66,#14043a);border:3.5u solid var(--ink);box-shadow:inset 0 0 0 2.5u var(--rc),0 4u 0 var(--ink);pointer-events:auto;flex-wrap:wrap}
.hs-slotrow.busy{background:linear-gradient(180deg,#3a1688,#1b0a45)}
.hs-slotrow.lock{background:repeating-linear-gradient(135deg,rgba(255,255,255,.04) 0 8u,transparent 8u 16u),linear-gradient(180deg,#22103f,#0e0428);--rc:#4a3a78}
.hs-slotrow .no{flex:none;display:flex;align-items:center;justify-content:center;width:38u;height:38u;border-radius:10u;background:var(--ink);font-size:max(11px,17u);font-weight:1000;color:#d6c8ff}
.hs-slotrow .ic{width:44u;height:44u;flex:none}
.hs-slotrow .tx{flex:1 1 80u;min-width:0;display:flex;flex-direction:column;gap:2u}
.hs-slotrow .nm{font-size:max(11px,15u);font-weight:1000;line-height:1.05;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.hs-slotrow .meta{font-size:max(9.5px,12u);color:#cdbcff;font-weight:900;line-height:1.1}
.hs-slotrow .meta .inc{color:var(--lime)}
.hs-slotrow .acts{display:flex;gap:7u;flex:none}
.hs-slotrow .acts .hs-btn{height:38u;padding:0 12u;font-size:max(10px,13u);--th:5u;--rd:10u;white-space:nowrap}
.hs-slotrow .acts .hs-btn img{width:20u;height:20u}
.hs-slotrow .hs-hint{flex:1 0 100%;min-height:0;display:none;font-size:max(10px,12.5u);text-align:left}
.hs-slotrow .hs-hint.on{display:block}

/* ---------- HUD раунда ---------- */
.hs-hud{position:absolute;inset:0;pointer-events:none;--u:1px;z-index:1}
.hs-hb{pointer-events:none}
.hs-fit{position:absolute;left:0;top:0;transform-origin:0 0;transform:scale(var(--fit,1))}
.hs-hb.map .hs-fit{width:250px;height:44px}
.hs-hb.players .hs-fit{width:128px;height:40px}
.hs-hb.timer .hs-fit{width:176px;height:80px}
.hs-hb.wallet .hs-fit{width:262px;height:42px}
.hs-hb.level .hs-fit{width:250px;height:50px}
.hs-hb.abil .hs-fit{width:198px;height:104px}
.hs-hb.status .hs-fit{width:170px;height:38px}
.hs-plate{position:absolute;inset:0 0 4px 0;display:flex;align-items:center;gap:8px;padding:0 12px 0 5px;border-radius:10px;background:linear-gradient(180deg,#4a2096,#24095a);border:3px solid var(--ink);box-shadow:0 4px 0 var(--ink),inset 0 2px 0 rgba(255,255,255,.24),inset 0 -4px 0 var(--mc,#c2ff4a)}
.hs-plate .num{flex:none;display:flex;align-items:center;justify-content:center;min-width:30px;height:28px;padding:0 4px;border-radius:7px;background:var(--mc,#c2ff4a);color:var(--ink);font-size:16px;font-weight:1000;border:2.5px solid var(--ink);box-shadow:inset 0 2px 0 rgba(255,255,255,.55)}
.hs-plate .nm{flex:1;min-width:0;font-size:15px;font-weight:1000;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;letter-spacing:.01em}
.hs-hud .hs-pill{height:38px;padding:0 12px 0 36px;border-width:3px;font-size:20px;min-width:0;gap:4px;border-radius:10px}
.hs-hud .hs-pill-ic{left:-6px;height:44px;width:44px}
.hs-wal{position:absolute;inset:0;display:flex;gap:16px;justify-content:flex-end;align-items:center;padding-left:6px}
.hs-wal .hs-pill{flex:1}
.hs-hb.players .hs-pill{position:absolute;inset:1px 0 1px 0;height:auto;padding-left:34px;justify-content:center}
.hs-hb.players .hs-pill .hs-pill-n{text-align:center;flex:none;color:#fff;--ol:var(--ink)}
.hs-hb.players .hs-pill-ic{height:auto;width:auto;left:6px;top:50%;transform:translateY(-50%);filter:none}
.hs-hb.players .hs-pill-ic svg{width:24px;height:24px}
.hs-hb.players.seeker .hs-pill{padding-left:12px;font-size:15px}
.hs-hb.players.seeker .hs-pill-ic{display:none}
.hs-time{position:absolute;left:8px;right:8px;top:0;height:52px;display:flex;align-items:center;justify-content:center;gap:8px;padding:0 14px 0 6px;border-radius:12px;background:linear-gradient(180deg,#22094f,#0e0428);border:4px solid var(--ink);box-shadow:0 5px 0 var(--ink),inset 0 0 0 2.5px rgba(255,184,28,.7),inset 0 3px 0 rgba(255,255,255,.14)}
.hs-time svg{width:34px;height:34px;flex:none;filter:drop-shadow(0 2px 0 rgba(0,0,0,.4))}
.hs-time b{font-size:34px;font-weight:1000;line-height:1;font-variant-numeric:tabular-nums;letter-spacing:.02em;display:block;color:var(--gold);--ol:#5c3300}
.hs-time.low{background:linear-gradient(180deg,#8a0b3e,#3a0420);animation:hs-tshake .5s ease-in-out infinite,hs-redpulse 1s ease-in-out infinite}
.hs-time.low b{color:#ff9fb8}
.hs-phase{position:absolute;left:50%;top:50px;min-width:116px;height:27px;padding:0 14px;transform:translateX(-50%) skewX(-8deg);display:flex;align-items:center;justify-content:center;border-radius:8px;font-size:15px;font-weight:1000;color:var(--ink);white-space:nowrap;letter-spacing:.04em;
  background:linear-gradient(180deg,rgba(255,255,255,.5) 0 44%,transparent 45%),linear-gradient(180deg,#fff39a,#ffc21f);border:3px solid var(--ink);box-shadow:0 3px 0 var(--ink)}
.hs-phase.seek{color:#fff;background:linear-gradient(180deg,rgba(255,255,255,.4) 0 44%,transparent 45%),linear-gradient(180deg,#ff9fd2,#e0207f);text-shadow:0 1.5px 0 #4a0628}
.hs-phase.pop{animation:hs-phasepop .5s cubic-bezier(.3,1.7,.5,1)}
.hs-hlvl{position:absolute;left:0;right:0;bottom:0;height:46px;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;padding:6px 14px 0;border-radius:11px 11px 14px 14px;background:linear-gradient(180deg,#4a2096,#24095a);border:3px solid var(--ink);box-shadow:0 4px 0 var(--ink),inset 0 2px 0 rgba(255,255,255,.2)}
.hs-hlvl b{font-size:14.5px;line-height:1;font-weight:1000;letter-spacing:.05em}
.hs-hlvl .hs-bar{height:13px;margin-top:5px}
/* рывок и обманка: пластиковые кнопки со значком, счётчиком-пузырём и подсказкой клавиши */
.hs-ab{--a1:#fff39a;--a2:#ffa91a;position:absolute;top:0;width:94px;height:98px;pointer-events:auto;transition:transform .08s,filter .2s;border-radius:24px;border:4px solid var(--ink);
  background:linear-gradient(180deg,rgba(255,255,255,.45) 0,rgba(255,255,255,.45) 40%,rgba(255,255,255,0) 41%),linear-gradient(180deg,var(--a1),var(--a2));box-shadow:0 6px 0 var(--ink),0 10px 12px rgba(0,0,0,.35),inset 0 -4px 0 rgba(0,0,0,.16)}
.hs-ab.dash{left:0}
.hs-ab.decoy{right:0;--a1:#c9b0ff;--a2:#6c3fe0}
.hs-ab:active{transform:translateY(4px) scale(.97)}
.hs-ab.empty{filter:saturate(.35) brightness(.78)}
.hs-ab .ico{position:absolute;left:16%;right:16%;top:7%;height:56%;display:flex;align-items:center;justify-content:center}
.hs-ab .ico svg{width:100%;height:100%;filter:drop-shadow(0 3px 0 rgba(0,0,0,.3))}
.hs-ab .lb{position:absolute;left:8%;right:8%;bottom:6%;height:22%;display:flex;align-items:center;justify-content:center;border-radius:6px;background:var(--ink);font-size:11.5px;font-weight:1000;line-height:1;letter-spacing:.03em;white-space:nowrap;overflow:hidden}
.hs-ab .cd{position:absolute;left:6%;top:5%;width:88%;height:62%;border-radius:50%;background:conic-gradient(rgba(14,4,40,.72) var(--cd,0%),transparent 0);pointer-events:none}
.hs-ab .rg{position:absolute;left:6%;top:4%;width:88%;height:64%;border-radius:50%;border:3px solid #fff;opacity:0;pointer-events:none}
.hs-ab.ready .rg{animation:hs-ready .7s ease-out}
.hs-ab .nn{position:absolute;right:-9px;top:-11px;min-width:30px;height:30px;padding:0 6px;display:flex;align-items:center;justify-content:center;border-radius:99px;font-size:17px;font-weight:1000;line-height:1;color:#fff;background:linear-gradient(180deg,#ff9fd2,#e0207f);border:3px solid var(--ink);box-shadow:0 3px 0 var(--ink);--s:1.5px;--ol:#4a0628}
.hs-ab .nn.pop{animation:hs-bump .4s cubic-bezier(.3,1.7,.5,1)}
.hs-ab .nn svg{width:18px;height:18px}
.hs-ab.ad .lb{font-size:8.6px;letter-spacing:0;white-space:normal;text-align:center;line-height:.95}
.hs-ab.decoy.ad .nn{background:linear-gradient(180deg,#d9ff70,#4fc415);animation:hs-pulse 1.1s ease-in-out infinite}
.hs-ab.decoy.ad:not(.empty){animation:hs-pulse 1.6s ease-in-out infinite}
.hs-ab .key{position:absolute;left:-4px;top:-8px;min-width:26px;height:24px;padding:0 6px;display:none;align-items:center;justify-content:center;border-radius:7px;background:#f4f0ff;color:var(--ink);border:2.5px solid var(--ink);font-size:12px;font-weight:1000;box-shadow:0 3px 0 var(--ink);white-space:nowrap}
.hs-kb .hs-ab .key{display:flex}
.hs-chips{position:absolute;inset:0;display:flex;gap:8px;justify-content:center;align-items:center}
.hs-chip{display:flex;align-items:center;gap:6px;height:32px;padding:0 12px 0 8px;border-radius:9px;background:linear-gradient(180deg,#4a2096,#24095a);border:3px solid var(--ink);box-shadow:0 3px 0 var(--ink);font-size:13px;font-weight:1000;white-space:nowrap;animation:hs-chipin .4s cubic-bezier(.3,1.6,.5,1)}
.hs-chip svg{width:22px;height:22px;flex:none}
.hs-chip.sh{box-shadow:0 3px 0 var(--ink),0 0 12px #27b8f5}
.hs-chip.sh svg{animation:hs-pulse 1.1s ease-in-out infinite}

/* виньетка опасности, стрелка к искателю, ники, всплывающий текст */
.hs-vig{position:absolute;inset:0;opacity:0;pointer-events:none;transition:opacity .18s linear;z-index:0;will-change:opacity}
.hs-vig i{position:absolute;inset:-2%;background:radial-gradient(ellipse at 50% 50%,transparent 46%,rgba(255,30,110,.3) 80%,rgba(200,0,70,.62) 100%);transform-origin:50% 50%;animation:hs-vig var(--vp,1.1s) ease-in-out infinite;will-change:transform}
.hs-arrow{position:absolute;left:0;top:0;width:52u;height:44u;margin:-22u 0 0 -26u;pointer-events:none;opacity:0;will-change:transform,opacity;z-index:2;color:#ff3d7a;filter:drop-shadow(0 3u 3u rgba(0,0,0,.4))}
.hs-arrow.on{opacity:1}
.hs-arrow svg{width:100%;height:100%;animation:hs-arrowpulse .55s ease-in-out infinite alternate}
.hs-tags{position:absolute;inset:0;pointer-events:none;overflow:hidden;z-index:1}
.hs-tag{position:absolute;left:0;top:0;will-change:transform}
.hs-tag-in{position:absolute;left:0;top:0;transform:translate(-50%,-100%);display:flex;align-items:center;gap:4px;padding:3px 10px 4px;border-radius:8px;background:linear-gradient(180deg,#3a1688,#1b0a45);border:3px solid var(--ink);box-shadow:0 3px 0 var(--ink);font-size:13px;font-weight:1000;line-height:1.1;white-space:nowrap;color:#fff;margin-top:-6px}
.hs-tag-in::after{content:'';position:absolute;left:50%;bottom:-8px;margin-left:-5px;border:5px solid transparent;border-top-color:var(--ink);border-bottom:0}
.hs-tag.k-me .hs-tag-in{background:linear-gradient(180deg,#d9ff70,#5cc81a);color:var(--ink);font-size:15px;padding:3px 13px 4px}
.hs-tag.k-seeker .hs-tag-in{background:linear-gradient(180deg,#ff9fd2,#e0207f);color:#fff;font-size:14px;text-shadow:0 1.5px 0 #4a0628}
.hs-tag.s-hidden{opacity:.55}
.hs-tag.s-caught .hs-tag-in{background:linear-gradient(180deg,#6a6580,#443f5a);color:#d8d2ee}
.hs-tag.k-cash .hs-tag-in{background:linear-gradient(180deg,#22094f,#0e0428);color:var(--lime);box-shadow:0 3px 0 var(--ink),inset 0 0 0 2px rgba(255,184,28,.7);font-size:14px}
.hs-tag .gr{width:13px;height:13px;flex:none}
.hs-tag .bang{position:absolute;left:50%;top:-32px;margin-left:-12px;width:24px;height:26px;border-radius:50% 50% 50% 8px;background:linear-gradient(180deg,#ff8aa6,#e0182c);border:3px solid var(--ink);color:#fff;font-size:16px;font-weight:1000;display:none;align-items:center;justify-content:center;animation:hs-bang .5s cubic-bezier(.3,1.8,.5,1) both,hs-bangloop .7s ease-in-out .5s infinite alternate;box-shadow:0 2px 0 var(--ink)}
.hs-tag.s-spotted .bang{display:flex}
.hs-tag.s-spotted .hs-tag-in{background:linear-gradient(180deg,#ff6b88,#c4112a);color:#fff}
.hs-floats{position:absolute;inset:0;pointer-events:none;overflow:hidden;z-index:3}
.hs-float{position:absolute;left:0;top:0;display:flex;align-items:center;gap:3px;font-size:25u;font-weight:1000;white-space:nowrap;will-change:transform,opacity;--s:2u;--ol:#16400a;color:var(--lime)}
.hs-float img{height:27u;width:27u;object-fit:contain}
.hs-float.coin{color:var(--lime)}
.hs-float.gem{color:#ffa6dc;--ol:#5c0a36}
.hs-float.xp{color:var(--ice);--ol:#052e4a}
.hs-float.power{color:#fff;--ol:#2a0a5a}

/* ---------- ПОДБОР БРЕЙНРОТОВ: полосы над головой, стрелки у края, баннер ---------- */
.hs-picks{position:absolute;inset:0;pointer-events:none;overflow:hidden;z-index:2}
.hs-pk{--rc:#b8c4d0;position:absolute;left:0;top:0;will-change:transform}
.hs-pk-in{position:absolute;left:0;top:0;transform:translate(-50%,-100%);display:flex;flex-direction:column;align-items:center;gap:4u;transition:opacity .2s}
.hs-pk-mu{display:none;padding:0 8u 1u;border-radius:99u;background:linear-gradient(180deg,#fff39a,#ffc21f);border:2.5u solid var(--ink);color:var(--ink);font-size:max(9px,11u);font-weight:1000;letter-spacing:.04em;white-space:nowrap;box-shadow:0 2u 0 var(--ink)}
.hs-pk.mut .hs-pk-mu{display:block}
.hs-pk-name{display:flex;align-items:center;gap:6u;padding:3u 10u 4u;border-radius:9u;background:linear-gradient(180deg,#3a1688,#1b0a45);border:3.5u solid var(--ink);box-shadow:inset 0 0 0 2.5u var(--rc),0 4u 0 var(--ink);font-size:max(10px,14u);font-weight:1000;white-space:nowrap;max-width:260u;line-height:1.1}
.hs-pk-name b{overflow:hidden;text-overflow:ellipsis;font-weight:1000;text-shadow:0 2u 0 var(--ink)}
.hs-pk-name .hs-rr{font-size:max(8px,9.5u);flex:none}
.hs-pk-ring{position:relative;width:56u;height:56u;border-radius:50%;background:conic-gradient(var(--rc) var(--pp,0%),rgba(10,1,32,.78) 0);box-shadow:0 0 0 3.5u var(--ink),0 5u 0 3.5u var(--ink),0 0 14u var(--rca,transparent);display:flex;align-items:center;justify-content:center}
.hs-pk-ring::before{content:'';position:absolute;inset:7u;border-radius:50%;background:radial-gradient(circle at 50% 35%,#4a2096,#1b0a45);box-shadow:inset 0 2u 0 rgba(255,255,255,.22)}
.hs-pk-ring b{position:relative;font-size:max(10px,15u);font-weight:1000;line-height:1;font-variant-numeric:tabular-nums;--s:1.5u}
.hs-pk-ring b small{display:block;font-size:.62em;text-align:center;margin-top:1u;opacity:.9}
.hs-pk.near .hs-pk-ring{animation:hs-pkpulse .7s ease-in-out infinite}
.hs-pk:not(.near) .hs-pk-ring{display:none}
.hs-pk:not(.near) .hs-pk-in{opacity:.82}
.hs-pk:not(.near) .hs-pk-name{font-size:max(9px,12u);padding:2u 8u 3u}
.hs-pk.r-god .hs-pk-name{border-color:transparent;background:linear-gradient(180deg,#3a1688,#1b0a45) padding-box,var(--rbw) border-box;background-size:100% 100%,300% 100%;box-shadow:0 4u 0 var(--ink);animation:hs-rbwb 3s linear infinite}
.hs-pk.r-god .hs-pk-ring{background:conic-gradient(#ff7ae0 var(--pp,0%),rgba(10,1,32,.78) 0);animation:hs-hue 2.4s linear infinite}
.hs-pk.r-secret .hs-pk-name{background:#000;color:#fff;box-shadow:inset 0 0 0 2.5u #fff,0 4u 0 var(--ink),0 0 12u rgba(255,255,255,.6)}
.hs-pk.r-secret .hs-pk-ring{background:conic-gradient(#fff var(--pp,0%),rgba(0,0,0,.85) 0);box-shadow:0 0 0 3.5u var(--ink),0 0 0 6u #fff,0 0 18u rgba(255,255,255,.7)}
.hs-pk.r-secret .hs-pk-ring::before{background:#000}

.hs-marks{position:absolute;inset:0;pointer-events:none;overflow:hidden;z-index:2}
.hs-mk{--rc:#b8c4d0;position:absolute;left:0;top:0;width:46u;height:40u;margin:-20u 0 0 -23u;opacity:0;will-change:transform,opacity;color:var(--rc);filter:drop-shadow(0 3u 0 rgba(0,0,0,.45))}
.hs-mk.on{opacity:1}
.hs-mk svg{width:100%;height:100%}
.hs-mk.hot svg{animation:hs-arrowpulse .6s ease-in-out infinite alternate}
.hs-mk.r-god svg{animation:hs-hue 2.2s linear infinite,hs-arrowpulse .6s ease-in-out infinite alternate}
.hs-mk.r-god{color:#ff7ae0}
.hs-mk.r-secret svg{animation:hs-secret .9s steps(2) infinite,hs-arrowpulse .5s ease-in-out infinite alternate}
.hs-mk.r-secret{color:#fff;filter:drop-shadow(0 0 6u rgba(255,255,255,.7)) drop-shadow(0 3u 0 #000)}

.hs-got{position:absolute;inset:0;pointer-events:none;overflow:hidden;z-index:7}
.hs-got-fl{position:absolute;inset:0;opacity:0;background:radial-gradient(circle at 50% 38%,var(--fc,#fff) 0,transparent 62%);animation:hs-gotflash .9s ease-out both}
.hs-got-c{--rc:#b8c4d0;--ms:2800;position:absolute;left:50%;top:calc(max(104px,19%));transform:translateX(-50%);width:min(94%,520u);display:flex;flex-direction:column;align-items:center;animation:hs-gotin calc(var(--ms)*1ms) both}
.hs-got-rays{position:absolute;left:50%;top:44%;width:min(150%,900u);aspect-ratio:1;margin:calc(min(150%,900u)/-2) 0 0 calc(min(150%,900u)/-2);border-radius:50%;opacity:0;background:repeating-conic-gradient(from 0deg,rgba(255,255,255,.55) 0 7deg,transparent 7deg 20deg);-webkit-mask:radial-gradient(circle,#000 0,transparent 62%);mask:radial-gradient(circle,#000 0,transparent 62%);animation:hs-rays calc(var(--ms)*1ms) linear both;max-width:none}
.hs-got-t{font-size:var(--fs,42u);--sk:9u;--dp:4u;--ol:var(--ink);padding:0 8u;white-space:nowrap;max-width:100%}
.hs-got-card{position:relative;margin-top:6u;display:flex;align-items:center;gap:12u;padding:10u 18u 12u 10u;border-radius:16u;background:linear-gradient(180deg,#4a2096,#1b0a45);border:4u solid var(--ink);box-shadow:inset 0 0 0 3u var(--rc),0 6u 0 var(--ink),0 0 26u 2u var(--rca,transparent);max-width:100%}
.hs-got-ic{position:relative;width:84u;height:84u;flex:none;animation:hs-bob 2s ease-in-out infinite}
.hs-got-ic::before{content:'';position:absolute;inset:-14%;border-radius:50%;background:radial-gradient(circle,var(--rca,rgba(255,255,255,.4)) 0,transparent 66%);animation:hs-glowpulse2 1.6s ease-in-out infinite}
.hs-got-tx{display:flex;flex-direction:column;align-items:flex-start;gap:4u;min-width:0}
.hs-got-nm{font-size:max(14px,24u);font-weight:1000;line-height:1.05;max-width:300u;overflow:hidden;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}
.hs-got-row{display:flex;align-items:center;gap:7u;flex-wrap:wrap}
.hs-got-row .hs-rr{font-size:max(10px,13u)}
.hs-got-mu{padding:0 10u 1u;border-radius:99u;background:linear-gradient(180deg,#fff39a,#ffc21f);border:2.5u solid var(--ink);color:var(--ink);font-size:max(10px,13u);font-weight:1000;box-shadow:0 2u 0 var(--ink);animation:hs-pulse 1s ease-in-out infinite}
.hs-got-pl{font-size:max(10px,14u);font-weight:1000;color:var(--lime);--s:1.5u;--ol:#16400a}
.hs-got.new .hs-got-t{--g1:#e6ffd0;--g2:#a8f35a;--g3:#2fae12;--ol:#0e3a0a}
.hs-got.big .hs-got-c{--fs:52u}
.hs-got.big .hs-got-ic{width:104u;height:104u}
.hs-got.big .hs-got-nm{font-size:max(15px,28u)}
.hs-got.shake{animation:hs-bnshake .08s linear 10 .25s}
.hs-got-c.r-god .hs-got-card{border-color:transparent;background:linear-gradient(180deg,#4a2096,#1b0a45) padding-box,var(--rbw) border-box;background-size:100% 100%,300% 100%;box-shadow:0 6u 0 var(--ink),0 0 26u 2u rgba(255,122,224,.5);animation:hs-rbwb 3s linear infinite}
.hs-got-c.r-secret .hs-got-card{background:linear-gradient(180deg,#16161e,#000);box-shadow:inset 0 0 0 3u #fff,0 6u 0 var(--ink),0 0 30u 4u rgba(255,255,255,.6)}
.hs-got-conf{position:absolute;inset:0;overflow:hidden}
.hs-got-conf i{position:absolute;top:-6%;left:var(--x);width:var(--w,9px);height:calc(var(--w,9px)*1.6);background:var(--c);border-radius:2px;opacity:0;animation:hs-fall var(--t,3s) linear forwards;animation-delay:var(--dl,0s);will-change:transform}

/* баннеры */
.hs-banner{position:absolute;left:0;right:0;top:0;bottom:0;pointer-events:none;z-index:6}
.hs-bn{position:absolute;left:0;right:0;top:26%;display:flex;justify-content:center;align-items:center;height:0}
.hs-bn-rays{position:absolute;left:50%;top:50%;width:min(150%,1100u);aspect-ratio:1;margin:calc(min(150%,1100u)/-2) 0 0 calc(min(150%,1100u)/-2);border-radius:50%;opacity:0;
  background:repeating-conic-gradient(from 0deg,rgba(255,255,255,.55) 0 7deg,transparent 7deg 20deg);-webkit-mask:radial-gradient(circle,#000 0,transparent 62%);mask:radial-gradient(circle,#000 0,transparent 62%);animation:hs-rays calc(var(--ms,1800)*1ms) linear both;will-change:transform,opacity;max-width:none}
.hs-bn-in{position:relative;max-width:94%;text-align:center;transform-origin:50% 60%;animation:hs-bnin calc(var(--ms,1800)*1ms) both;will-change:transform,opacity}
.hs-bn-txt{font-size:var(--fs,66u);letter-spacing:.015em;line-height:.98;--sk:12u;--dp:5u;--ol:var(--ink);padding:0 10u}
.hs-bn.shaking .hs-bn-in{animation:hs-bnin calc(var(--ms,1800)*1ms) both,hs-bnshake .08s linear 8 .3s}
.hs-bn.yellow .hs-bn-txt{--g1:#fff6a8;--g2:#ffd43b;--g3:#ff9a1c}
.hs-bn.red .hs-bn-txt{--g1:#ffd0e6;--g2:#ff5c9e;--g3:#d4146f;--ol:#3a0620}
.hs-bn.green .hs-bn-txt{--g1:#e6ffd0;--g2:#a8f35a;--g3:#2fae12;--ol:#0e3a0a}
.hs-bn.orange .hs-bn-txt{--g1:#fff0b8;--g2:#ffa63a;--g3:#f0580e;--ol:#4a1a00}
.hs-bn.blue .hs-bn-txt{--g1:#e0fcff;--g2:#7ff0ff;--g3:#27b8f5;--ol:#052e4a}
.hs-bn.small .hs-bn-txt{--fs:44u;--sk:9u;--dp:4u}
.hs-p .hs-bn-txt{--fs:50u;--sk:10u}
.hs-p .hs-bn.small .hs-bn-txt{--fs:36u}
.hs-bn.small{top:30%}

/* результат */
.hs-resultwin{background:radial-gradient(ellipse at 50% 45%,rgba(80,28,170,.74),rgba(10,2,32,.93))}
.hs-resultwin.lose{background:radial-gradient(ellipse at 50% 45%,rgba(90,10,60,.7),rgba(14,2,24,.95))}
.hs-r-rays{position:absolute;left:50%;top:38%;width:max(160%,1200u);aspect-ratio:1;margin:calc(max(160%,1200u)/-2) 0 0 calc(max(160%,1200u)/-2);opacity:.5;border-radius:50%;
  background:repeating-conic-gradient(from 0deg,rgba(255,236,150,.5) 0 8deg,transparent 8deg 24deg);-webkit-mask:radial-gradient(circle,#000 0,transparent 55%);mask:radial-gradient(circle,#000 0,transparent 55%);animation:hs-spin 26s linear infinite;pointer-events:none;will-change:transform}
.hs-resultwin.lose .hs-r-rays{opacity:.18;background:repeating-conic-gradient(from 0deg,rgba(255,120,170,.5) 0 8deg,transparent 8deg 24deg)}
.hs-confetti{position:absolute;inset:0;overflow:hidden;pointer-events:none}
.hs-confetti i{position:absolute;top:-6%;left:var(--x);width:var(--w,9px);height:calc(var(--w,9px)*1.6);background:var(--c);border-radius:2px;opacity:0;animation:hs-fall var(--t,3.2s) linear infinite;animation-delay:var(--dl,0s);will-change:transform}
.hs-rpanel{position:absolute;inset:0;margin:auto;width:min(94%,560u);height:max-content;max-height:96%;padding:48u 22u 22u;display:flex;flex-direction:column;align-items:center;gap:12u}
.hs-rtitle{position:absolute;left:50%;top:-30u;transform:translateX(-50%);width:max-content;max-width:112%;display:flex;justify-content:center;pointer-events:none;z-index:2}
.hs-rtitle .hs-big{font-size:44u;--sk:10u;--dp:5u;line-height:.95;padding:0 10u;--ol:var(--ink)}
.hs-resultwin.lose .hs-rtitle .hs-big{--g1:#ffd0e6;--g2:#ff5c9e;--g3:#d4146f;--ol:#3a0620}
.hs-rmap{font-size:14u;color:#d6c8ff;font-weight:900;letter-spacing:.04em;margin-top:6u}
.hs-stars{display:flex;gap:6u;align-items:flex-end;justify-content:center;height:70u}
.hs-star{width:56u;height:56u;color:#3a2a78;transform:scale(.4);opacity:.6}
.hs-star:nth-child(2){width:70u;height:70u;margin-bottom:6u}
.hs-star.got{animation:hs-starpop .7s cubic-bezier(.2,1.8,.4,1) both;animation-delay:calc(var(--k,0)*220ms + 450ms);color:#ffd23d;filter:drop-shadow(0 0 10u rgba(255,210,60,.7))}
.hs-star.no{transform:scale(1);opacity:1;color:#1a0d40}
.hs-rcols{display:grid;grid-template-columns:1fr;gap:10u;width:100%}
.hs-rrows{display:flex;gap:10u;width:100%;justify-content:center}
.hs-rrow{position:relative;flex:1;min-width:0;display:flex;flex-direction:column;align-items:center;gap:4u;padding:12u 6u 9u;opacity:0}
.hs-rrow img{height:36u;width:36u;object-fit:contain}
.hs-rrow .xpic{height:36u;min-width:36u;padding:0 10u;border-radius:10u;background:linear-gradient(180deg,#a4f6ff,#27b8f5);border:3u solid var(--ink);display:flex;align-items:center;justify-content:center;font-size:15u;font-weight:1000;color:var(--ink)}
.hs-rrow b{font-size:28u;font-weight:1000;line-height:1;font-variant-numeric:tabular-nums}
.hs-rrow.coin b{color:var(--lime);--ol:#16400a}
.hs-rrow.gem b{color:#ffa6dc;--ol:#5c0a36}
.hs-rrow.xp b{color:var(--ice);--ol:#052e4a}
.hs-resultwin.in .hs-rrow{animation:hs-pop .55s cubic-bezier(.2,1.3,.3,1) both;animation-delay:calc(var(--k,0)*160ms + 700ms)}
.hs-rxp{width:100%;padding:8u 14u 12u;display:flex;flex-direction:column;gap:6u;align-items:center;position:relative}
.hs-rxp b{font-size:17u;font-weight:1000;letter-spacing:.04em}
.hs-rxp .hs-bar{height:16u}
.hs-rxp .hs-bar i{transition:transform 1s cubic-bezier(.25,.9,.3,1)}
.hs-rxp b{align-self:flex-start}
.hs-lvlup{position:absolute;right:10u;top:6u;padding:3u 12u 5u;border-radius:99u;background:linear-gradient(180deg,#ff9fd2,#e0207f);border:3u solid var(--ink);font-size:13u;font-weight:1000;box-shadow:0 4u 0 var(--ink);transform:scale(0) rotate(-8deg);white-space:nowrap}
.hs-lvlup.on{animation:hs-lvlup .7s cubic-bezier(.2,1.8,.4,1) both}
.hs-rstat{display:flex;gap:14u;flex-wrap:wrap;justify-content:center;font-size:14u;color:#d6c8ff;font-weight:900}
.hs-unlocked{padding:3u 12u 4u;border-radius:99u;background:linear-gradient(180deg,#a8f35a,#4fc415);border:3u solid var(--ink);font-size:13u;font-weight:1000;color:var(--ink);box-shadow:0 3u 0 var(--ink);animation:hs-pulse 1.2s ease-in-out infinite}
.hs-rbtns{display:flex;gap:11u;width:100%;align-items:stretch;margin-top:4u;flex-wrap:wrap}
.hs-rbtns .hs-btn{height:62u;font-size:21u;flex:1;min-width:0}
.hs-rbtns .hs-btn.main{flex:1 0 100%;height:70u;font-size:30u}
.hs-rbtns .hs-btn.small{flex:.9;font-size:15u;flex-direction:column;gap:2u}
.hs-rbtns .hs-btn.small svg{width:26u;height:26u}
`;

const HSUI_CSS3 = `
.hs-bank .r2 b.hs-pop2{animation:hs-bump .35s cubic-bezier(.3,1.6,.5,1)}
.hs-slotrow .no svg{width:62%;height:62%}
.hs-slotrow .ic svg{width:100%;height:100%;filter:drop-shadow(0 3u 0 rgba(0,0,0,.35))}
.hs-slotrow .hs-ic{width:100%;height:100%}
.hs-m-main:not(.seek) .sp-wrap{display:none}
.hs-ic.dark img,.hs-ic.dark svg{filter:brightness(0) drop-shadow(0 0 3u rgba(167,123,255,.75))}

/* ---------- РАЗМЕТКА ПО ЭКРАНУ ---------- */
/* портрет (эталон 420×800u) */
.hs-p .hs-logo{left:0;right:0;top:calc(var(--mp) + env(safe-area-inset-top,0px) + 56u);align-items:center}
.hs-p .hs-logo-in{align-items:center;transform-origin:50% 60%}
.hs-p .hs-logo-1{font-size:46u;--sk:10u;--dp:5u}
.hs-p .hs-ribbon{margin:-3u 0 0 0;font-size:23u;padding:3u 16u 5u}
.hs-p .hs-mapcard{left:0;right:0;margin:0 auto;width:max-content;max-width:min(400u,96%);top:calc(var(--mp) + env(safe-area-inset-top,0px) + 178u)}
.hs-p .hs-lvl{left:calc(var(--mp) + env(safe-area-inset-left,0px));top:calc(var(--mp) + env(safe-area-inset-top,0px));bottom:auto;width:158u;height:46u;padding:0 8u 0 6u;gap:6u}
.hs-p .hs-lvl>svg{width:26u;height:26u}
.hs-p .hs-lvl b{font-size:13u}
.hs-p .hs-m-wallet{gap:16u}
.hs-p .hs-m-wallet .hs-pill{font-size:19u;height:36u;padding-left:34u}
.hs-p .hs-m-wallet .hs-pill-ic{height:42u;width:42u}
.hs-p .hs-m-side{right:calc(var(--mp) + env(safe-area-inset-right,0px));top:calc(var(--mp) + env(safe-area-inset-top,0px) + 262u);flex-direction:column;gap:12u}
.hs-p .hs-m-side .hs-tool{width:66u;height:72u}
.hs-p .hs-m-tools{left:0;right:0;justify-content:center;gap:9u}
.hs-p .hs-m-tools .hs-tool{width:68u;height:74u}
.hs-p .hs-m-main{left:0;right:0;margin:0 auto;width:min(350u,94%);bottom:calc(var(--mp) + env(safe-area-inset-bottom,0px) + 88u);gap:8u}
.hs-p .hs-play{height:78u;font-size:40u}
.hs-p .hs-basebtn{height:54u;font-size:23u}
.hs-p .hs-seg{height:46u}
.hs-p .hs-seg button{font-size:max(10px,15u)}
.hs-p .hs-seg button svg{display:none}
/* низкий альбомный (640×360, 568×320): те же пропорции, но тексты не мельче читаемого */
.hs-low .hs-tool{width:86u;height:84u}
.hs-low .hs-tool.close{width:46u;height:46u}
.hs-low .hs-tool span{font-size:max(8px,10u)}
.hs-p .hs-tool span{font-size:max(8.5px,9.5u)}
.hs-low .hs-mapname small{display:none}
.hs-low .hs-seekpick{padding:5u 8u 6u}

/* ---- магазин, подарок, колесо, предложения, кодекс, инвентарь: портрет ---- */
.hs-p .hs-shopwin,.hs-p .hs-cxwin,.hs-p .hs-invwin{max-width:640u;max-height:none;padding:10u 10u 14u;gap:6u}
.hs-p .hs-sh-head,.hs-p .hs-cx-head,.hs-p .hs-iv-head{gap:8u}
.hs-p .hs-sh-title{font-size:30u;--sk:7u}
.hs-p .hs-tab{flex:1 1 0;padding:0 4u;font-size:max(9.5px,12.5u);height:40u;gap:4u}
.hs-p .hs-tab.on{flex:3.1 1 0}
.hs-p .hs-tab:not(.on) span{display:none}
.hs-p .hs-tab svg{width:20u;height:20u}
.hs-p .hs-sh-wallet{gap:22u;padding:0 10u;order:3;flex:1 0 100%;justify-content:center;margin-left:0}
.hs-p .hs-sh-head,.hs-p .hs-dg-head,.hs-p .hs-wh-head,.hs-p .hs-cx-head,.hs-p .hs-iv-head{flex-wrap:wrap;row-gap:6u}
.hs-p .hs-sh-title,.hs-p .hs-dg-title,.hs-p .hs-wh-title,.hs-p .hs-cx-title,.hs-p .hs-iv-title{order:1;margin-right:auto}
.hs-p .hs-sh-head .hs-tool.close,.hs-p .hs-dg-head .hs-tool.close,.hs-p .hs-wh-head .hs-tool.close,.hs-p .hs-cx-head .hs-tool.close,.hs-p .hs-iv-head .hs-tool.close{order:2}
.hs-p .hs-sh-wallet .hs-pill{padding-left:32u;font-size:16u;height:34u}
.hs-p .hs-sh-wallet .hs-pill-ic{height:38u;width:38u}
.hs-p .hs-sh-body{grid-template-columns:minmax(0,1fr);grid-template-rows:auto minmax(0,1fr)}
.hs-p .hs-prev{order:-1;display:grid;grid-template-columns:42% minmax(0,1fr);grid-template-rows:auto auto 1fr auto auto auto;column-gap:10u;row-gap:4u;padding:10u;align-items:center;justify-items:center}
.hs-p .hs-stage{grid-column:1;grid-row:1/7;height:100%;min-height:150u;align-self:stretch}
.hs-p .hs-prev-name{grid-column:2;grid-row:1;font-size:20u;width:100%}
.hs-p .hs-prev-kind{grid-column:2;grid-row:2}
.hs-p .hs-prev .hs-hint{grid-column:2;grid-row:3;align-self:end;font-size:max(10px,12.5u)}
.hs-p .hs-prev-price{grid-column:2;grid-row:4;width:100%;min-height:36u;font-size:22u}
.hs-p .hs-prev-price.ad{font-size:max(10px,13.5u)}
.hs-p .hs-prev-ad{grid-column:2;grid-row:5;height:36u;font-size:12.5u}
.hs-p .hs-act{grid-column:2;grid-row:6;height:48u;font-size:20u}
.hs-p .hs-nav{top:auto;bottom:4u;width:30u;height:36u}
.hs-p .hs-nav.l{left:4u}
.hs-p .hs-nav.r{right:4u}
.hs-p .hs-sh-grid{--cols:2;gap:11u}
.hs-p .hs-sh-body.power{grid-template-rows:minmax(0,1fr)}
.hs-p .hs-sh-body.power .hs-sh-grid{--cols:2;grid-auto-rows:auto}
.hs-p .hs-card .nm{font-size:14u}
.hs-p .hs-card .st{font-size:max(10px,14u)}
.hs-p .hs-peek{bottom:calc(10u + env(safe-area-inset-bottom,0px))}
.hs-p .hs-dgwin{padding:10u 10u 14u;gap:8u}
.hs-p .hs-dg-title{font-size:28u;--sk:7u}
.hs-p .hs-dg-body{grid-template-columns:minmax(0,1fr);gap:10u}
.hs-p .hs-dg-day{min-height:84u;padding:6u 4u}
.hs-p .hs-dg-goal{display:grid;grid-template-columns:40% minmax(0,1fr);grid-template-rows:auto 1fr auto auto;column-gap:10u;align-items:center;justify-items:center;padding:8u 10u}
.hs-p .hs-dg-goal .gs{grid-column:1;grid-row:1/5;min-height:84u;height:100%}
.hs-p .hs-dg-goal .gt{grid-column:2;grid-row:1}
.hs-p .hs-dg-goal .gn{grid-column:2;grid-row:2;align-self:end}
.hs-p .hs-dg-goal .gh{grid-column:2;grid-row:3}
.hs-p .hs-dg-goal .ds{grid-column:2;grid-row:4}
.hs-p .hs-dg-goal .big{grid-column:2;grid-row:2/4}
.hs-p .hs-dg-foot{flex-direction:column;gap:8u}
.hs-p .hs-dg-foot .hs-btn{flex:none;height:54u;min-height:54u}
.hs-p .hs-whwin{grid-template-columns:minmax(0,1fr);grid-template-areas:'head' 'disk' 'side';padding:10u 10u 14u;gap:6u}
.hs-p .hs-wh-side .hs-btn{height:58u}
.hs-p .hs-wh-ad{font-size:14.5u}
.hs-p .hs-wh-title{font-size:26u;--sk:7u}
.hs-p .hs-rtop{flex-direction:column}
.hs-p .hs-of-title{font-size:32u}
.hs-p .hs-setwin{padding-top:18u}
.hs-p .hs-rpanel{padding-top:52u}
.hs-p .hs-rtitle .hs-big{font-size:36u;--sk:8u}
.hs-p .hs-cx-title{font-size:26u;--sk:7u}
.hs-p .hs-cx-prog{width:100%;order:3;flex:1 0 100%;margin-left:0}
.hs-p .hs-cx-prog b{text-align:center}
.hs-p .hs-cx-filt{gap:6u 5u;padding:2u 4u 8u}
.hs-p .hs-cx-chip{height:29u;padding:0 7u 0 6u;gap:4u;font-size:max(9.5px,11u)}
.hs-p .hs-cx-chip i{width:11u;height:11u}
.hs-p .hs-cx-chip b{display:none}
.hs-p .hs-iv-title{font-size:26u;--sk:7u}
.hs-p .hs-iv-tabs{display:flex}
.hs-p .hs-iv-tabs .hs-tab span{display:inline}
.hs-p .hs-iv-tabs .hs-tab{font-size:max(10px,13u);padding:0 6u}
.hs-p .hs-iv-body{grid-template-columns:minmax(0,1fr)}
.hs-p .hs-iv-body.t-inv .hs-iv-col.slots,.hs-p .hs-iv-body.t-slots .hs-iv-col.inv{display:none}
.hs-p .hs-iv-colh{display:none}
.hs-p .hs-got-c{top:calc(max(96px,16%))}
.hs-p .hs-got-t{--fs:32u}
.hs-p .hs-got.big .hs-got-c{--fs:38u}

/* ---- низкий альбомный (640×360, 568×320) ---- */
.hs-low .hs-tab{height:36u;font-size:max(9.5px,13u)}
.hs-low .hs-tab:not(.on) span{display:none}
.hs-low .hs-tab:not(.on){padding:0 6u}
.hs-low .hs-tab.on{flex:2.4 1 0}
.hs-low .hs-shopwin,.hs-low .hs-cxwin,.hs-low .hs-invwin{inset:calc(1.5% + env(safe-area-inset-top,0px)) calc(1.5% + env(safe-area-inset-right,0px)) calc(1.5% + env(safe-area-inset-bottom,0px)) calc(1.5% + env(safe-area-inset-left,0px));max-height:none;padding:7u 10u 11u;gap:5u;max-width:none}
.hs-low .hs-sh-head,.hs-low .hs-cx-head,.hs-low .hs-iv-head{min-height:40u}
.hs-low .hs-sh-title{font-size:28u;--sk:7u}
.hs-low .hs-sh-wallet .hs-pill{height:32u;font-size:16u;padding-left:32u}
.hs-low .hs-sh-wallet .hs-pill-ic{height:38u;width:38u}
.hs-low .hs-sh-body{grid-template-columns:minmax(0,1fr) minmax(0,34%);gap:8u}
.hs-low .hs-sh-grid{--cols:3;gap:9u;padding:4u 6u 10u}
.hs-low .hs-card .nm{font-size:max(9.5px,12u);top:5.5%}
.hs-low .hs-card .rr{display:none}
.hs-low .hs-card .im{top:20%;bottom:25%}
.hs-low .hs-card .st{font-size:max(9px,12u)}
.hs-low .hs-card .lk{top:20%;width:20u;height:20u}
.hs-low .hs-prev{padding:6u 8u 8u;gap:3u}
.hs-low .hs-prev-name{font-size:19u}
.hs-low .hs-prev-kind{font-size:max(9px,11u)}
.hs-low .hs-prev-price{min-height:32u;font-size:22u;width:90%}
.hs-low .hs-prev-price.ad{font-size:max(9px,13u);padding:3u 8u 4u}
.hs-low .hs-prev-price.ad .bar{height:9u}
.hs-low .hs-act{height:42u;font-size:19u}
.hs-low .hs-prev-ad{height:32u;font-size:max(10px,11.5u)}
.hs-low .hs-prev .hs-hint{font-size:max(10px,11.5u)}
.hs-low .hs-eye{width:32u;height:32u}
.hs-low .hs-eye svg{width:20u;height:20u}
.hs-low .hs-prev-state{font-size:max(9px,10.5u)}
.hs-low .hs-pcard{padding:6u;gap:3u}
.hs-low .hs-pcard h3{font-size:16u}
.hs-low .hs-pcard p{display:none}
.hs-low .hs-pcard .pr{height:28u;font-size:17u}
.hs-low .hs-pcard .hs-btn{height:34u;font-size:15u}
.hs-low .hs-pcard .hs-btn.ad{height:34u;font-size:max(9.5px,12u)}
.hs-low .hs-dgwin{padding:8u 12u 12u;gap:6u}
.hs-low .hs-dg-head{min-height:40u}
.hs-low .hs-dg-title{font-size:26u;--sk:7u}
.hs-low .hs-dg-day{min-height:96u;padding:5u 4u}
.hs-low .hs-dg-day .rc{font-size:max(10px,17u)}
.hs-low .hs-dg-foot .hs-btn{height:48u}
.hs-low .hs-dg-claim{font-size:24u}
.hs-low .hs-dg-x2{font-size:15u}
.hs-low .hs-dg-next{font-size:max(10px,14u)}
.hs-low .hs-dg-goal .gn{font-size:17u}
.hs-low .hs-whwin{padding:6u 12u 10u;gap:4u 14u}
.hs-low .hs-wh-head{min-height:38u}
.hs-low .hs-wh-title{font-size:24u;--sk:7u}
.hs-low .hs-wh-area{padding-top:10u}
.hs-low .hs-wh-side .hs-btn{height:46u;font-size:17u}
.hs-low .hs-wh-info{padding:6u 8u;font-size:max(9.5px,13u)}
.hs-low .hs-wh-info b{font-size:17u}
.hs-low .hs-wh-ad{font-size:14u}
.hs-low .hs-pz-card{padding:40u 16u 14u;gap:8u}
.hs-low .hs-pz-it{width:104u;padding:8u 6u}
.hs-low .hs-pz-it .big{width:60u;height:60u}
.hs-low .hs-pz-card .hs-btn{height:46u;font-size:21u}
.hs-low .hs-of-card{padding:54u 18u 16u;gap:8u}
.hs-low .hs-of-title{font-size:30u}
.hs-low .hs-of-card .hs-btn.go{height:56u;font-size:22u}
.hs-low .hs-cx-title{font-size:24u;--sk:6u}
.hs-low .hs-iv-title{font-size:24u;--sk:6u}
.hs-low .hs-cx-chip{height:27u;padding:0 9u 0 7u;font-size:max(9px,11.5u)}
.hs-low .hs-cx-filt{gap:5u 6u;padding-bottom:6u}
.hs-low .hs-ivrow{padding:6u 8u}
.hs-low .hs-ivrow .ic{width:44u;height:44u}
.hs-low .hs-bn.small{top:32%}
.hs-low .hs-setwin{padding:14u 18u 16u;gap:6u}
.hs-low .hs-row{min-height:40u;padding:2u 10u}
.hs-low .hs-qseg button{height:32u}
.hs-low .hs-set-btns .hs-btn{height:44u}
.hs-low .hs-set-title{font-size:26u}
/* альбомный результат */
.hs-l .hs-rpanel{width:min(96%,760u);padding:36u 16u 16u;display:grid;grid-template-columns:1fr 1fr;grid-template-areas:'map map' 'stars cols' 'stat cols' 'btns btns';gap:6u 14u;align-items:center}
.hs-l .hs-rtitle{top:-22u}
.hs-l .hs-rtitle .hs-big{font-size:34u;--sk:8u}
.hs-l .hs-stars{grid-area:stars;transform:scale(.8);height:56u}
.hs-l .hs-rcols{grid-area:cols}
.hs-l .hs-rstat{grid-area:stat}
.hs-l .hs-rbtns{grid-area:btns;margin-top:0;flex-wrap:nowrap}
.hs-l .hs-rbtns .hs-btn.main{flex:1.8}
.hs-l .hs-rbtns .hs-btn{height:48u;font-size:18u}
.hs-l .hs-rbtns .hs-btn.main{height:54u;font-size:24u}
.hs-l .hs-rrow b{font-size:22u}
.hs-l .hs-rrow{padding:6u 4u}
.hs-l .hs-rrow img{height:28u;width:28u}
.hs-l .hs-rrow .xpic{height:28u;min-width:28u;font-size:12u}
.hs-l .hs-rxp{padding:2u 8u 6u}
.hs-l .hs-rtop{flex-direction:row;justify-content:space-between;grid-area:map}
.hs-l .hs-rtop .hs-rmap{flex:1;text-align:left;padding-left:8u}
.hs-l .hs-x2{height:44u;font-size:16u}
.hs-l .hs-x2 .sub{font-size:max(9px,11u)}
.hs-l .hs-rtop .hs-sh-wallet .hs-pill{height:28u;font-size:14u;padding-left:30u}
.hs-l .hs-rtop .hs-sh-wallet .hs-pill-ic{height:34u;width:34u}
/* малые экраны вообще */
.hs-tiny .hs-card .nm{font-size:11px}
.hs-lowfx .hs-bill,.hs-lowfx .hs-spk,.hs-lowfx .hs-confetti i:nth-child(3n),.hs-lowfx .hs-got-conf{display:none}
.hs-lowfx .hs-shine::after{animation:none}

/* ---------- ДЖОЙСТИК Input: рисуем поверх стилей движка ---------- */
html .lory-input-layer .lory-stick{border:0;border-radius:50%;background:radial-gradient(circle at 50% 50%,rgba(26,6,70,.5) 0 56%,rgba(167,123,255,.5) 57% 100%);box-shadow:0 0 0 4px #12042b,inset 0 0 0 4px rgba(255,255,255,.4),0 8px 0 4px rgba(18,4,43,.4)}
html .lory-input-layer .lory-stick.idle{opacity:.62}
html .lory-input-layer .lory-stick.on{opacity:.95}
html .lory-input-layer .lory-stick i{background:linear-gradient(180deg,rgba(255,255,255,.5) 0,rgba(255,255,255,.5) 42%,rgba(255,255,255,0) 43%),linear-gradient(180deg,#d9ff70,#4fc415);border:4px solid #12042b;border-radius:50%;box-shadow:0 5px 0 #12042b,inset 0 -5px 0 rgba(0,0,0,.18);opacity:1;width:41%;height:41%;margin:-20.5% 0 0 -20.5%}
html .lory-input-layer .lory-ctx{-webkit-tap-highlight-color:transparent}

/* ---------- Кадры ---------- */
@keyframes hs-pop{0%{opacity:0;transform:translateY(24u) scale(.62)}55%{opacity:1;transform:translateY(-5u) scale(1.07)}78%{transform:translateY(1u) scale(.985)}100%{opacity:1;transform:none}}
@keyframes hs-slideL{0%{opacity:0;transform:translateX(-90u) scale(.8)}60%{opacity:1;transform:translateX(8u) scale(1.04)}100%{opacity:1;transform:none}}
@keyframes hs-slideR{0%{opacity:0;transform:translateX(90u) scale(.8)}60%{opacity:1;transform:translateX(-8u) scale(1.04)}100%{opacity:1;transform:none}}
@keyframes hs-slideT{0%{opacity:0;transform:translateY(-70u) scale(.85)}60%{opacity:1;transform:translateY(6u) scale(1.03)}100%{opacity:1;transform:none}}
@keyframes hs-slideB{0%{opacity:0;transform:translateY(90u) scale(.8)}60%{opacity:1;transform:translateY(-8u) scale(1.04)}100%{opacity:1;transform:none}}
@keyframes hs-cardin{0%{opacity:0;transform:translateY(26u) scale(.7) rotate(-3deg)}60%{opacity:1;transform:translateY(-4u) scale(1.05) rotate(1deg)}100%{opacity:1;transform:none}}
@keyframes hs-play{0%,100%{transform:scale(1)}50%{transform:scale(1.045)}}
@keyframes hs-pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.16)}}
@keyframes hs-shine{0%,38%{background-position:100% 0}100%{background-position:0% 0}}
@keyframes hs-sheen{0%,55%{transform:translateX(-140%) skewX(-18deg)}100%{transform:translateX(620%) skewX(-18deg)}}
@keyframes hs-logo{0%,100%{transform:rotate(-3deg) translateY(0)}50%{transform:rotate(-1.6deg) translateY(-5u)}}
@keyframes hs-bump{0%{transform:scale(1)}35%{transform:scale(1.3)}100%{transform:scale(1)}}
@keyframes hs-shake{10%,90%{transform:translateX(-2u)}20%,80%{transform:translateX(4u)}30%,50%,70%{transform:translateX(-7u)}40%,60%{transform:translateX(7u)}}
@keyframes hs-tshake{0%,100%{transform:translate(0,0) rotate(0)}25%{transform:translate(-2px,1px) rotate(-1.4deg)}50%{transform:translate(2px,-1px) rotate(1.4deg)}75%{transform:translate(-1px,-1px) rotate(-.8deg)}}
@keyframes hs-redpulse{0%,100%{box-shadow:0 5px 0 var(--ink),inset 0 0 0 2.5px rgba(255,100,160,.8),0 0 10px rgba(255,60,120,.4)}50%{box-shadow:0 5px 0 var(--ink),inset 0 0 0 2.5px rgba(255,100,160,.8),0 0 26px rgba(255,60,120,.95)}}
@keyframes hs-phasepop{0%{transform:translateX(-50%) skewX(-8deg) scale(.3)}60%{transform:translateX(-50%) skewX(-8deg) scale(1.25)}100%{transform:translateX(-50%) skewX(-8deg) scale(1)}}
@keyframes hs-barshine{0%{transform:translateX(-120%)}100%{transform:translateX(420%)}}
@keyframes hs-rain{0%{opacity:0;transform:translate3d(0,0,0) rotate(var(--r0,-18deg))}10%{opacity:.55}85%{opacity:.5}100%{opacity:0;transform:translate3d(var(--dx,20u),-115vh,0) rotate(var(--r1,34deg))}}
@keyframes hs-glowpulse{0%,100%{opacity:.75;transform:translate(-50%,-50%) scale(.95)}50%{opacity:1;transform:translate(-50%,-50%) scale(1.06)}}
@keyframes hs-glowpulse2{0%,100%{opacity:.7;transform:scale(.95)}50%{opacity:1;transform:scale(1.1)}}
@keyframes hs-spin{to{transform:rotate(360deg)}}
@keyframes hs-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-9u)}}
@keyframes hs-coinbob{0%,100%{transform:translateY(0) rotate(-8deg)}50%{transform:translateY(-6u) rotate(8deg)}}
@keyframes hs-swap{0%{transform:scale(.4) rotate(-8deg);opacity:0}60%{transform:scale(1.12) rotate(2deg);opacity:1}100%{transform:scale(1)}}
@keyframes hs-twinkle{0%,100%{opacity:0;transform:scale(.3) rotate(0)}50%{opacity:1;transform:scale(1) rotate(90deg)}}
@keyframes hs-tabin{0%{transform:scale(.88)}100%{transform:scale(1)}}
@keyframes hs-flash{0%{opacity:.95}100%{opacity:0}}
@keyframes hs-ready{0%{opacity:.95;transform:scale(.9)}100%{opacity:0;transform:scale(1.5)}}
@keyframes hs-chipin{0%{transform:scale(.3);opacity:0}100%{transform:scale(1);opacity:1}}
@keyframes hs-vig{0%,100%{transform:scale(1)}50%{transform:scale(1.07)}}
@keyframes hs-arrowpulse{from{transform:scale(.88)}to{transform:scale(1.2)}}
@keyframes hs-bang{0%{transform:scale(0) translateY(10px)}100%{transform:scale(1) translateY(0)}}
@keyframes hs-bangloop{from{transform:translateY(0)}to{transform:translateY(-4px)}}
@keyframes hs-bnin{0%{opacity:0;transform:scale(.15) rotate(-8deg)}14%{opacity:1;transform:scale(1.35) rotate(3deg)}24%{transform:scale(.92) rotate(-1deg)}32%{transform:scale(1.06)}40%,82%{opacity:1;transform:scale(1)}100%{opacity:0;transform:scale(1.2) translateY(-18u)}}
@keyframes hs-bnshake{0%{transform:translateX(0)}25%{transform:translateX(-8u)}50%{transform:translateX(0)}75%{transform:translateX(8u)}100%{transform:translateX(0)}}
@keyframes hs-rays{0%{opacity:0;transform:rotate(0) scale(.3)}14%{opacity:.9}70%{opacity:.7}100%{opacity:0;transform:rotate(60deg) scale(1.1)}}
@keyframes hs-fall{0%{opacity:0;transform:translate3d(0,0,0) rotate(0)}8%{opacity:1}100%{opacity:.9;transform:translate3d(var(--dx,0),112vh,0) rotate(var(--r,720deg))}}
@keyframes hs-starpop{0%{transform:scale(.2) rotate(-40deg);opacity:0}60%{transform:scale(1.35) rotate(8deg);opacity:1}100%{transform:scale(1) rotate(0);opacity:1}}
@keyframes hs-lvlup{0%{transform:scale(0) rotate(-8deg)}60%{transform:scale(1.25) rotate(4deg)}100%{transform:scale(1) rotate(-3deg)}}
@keyframes hs-popin{0%{opacity:0;transform:scale(.6) translateY(-10u)}100%{opacity:1;transform:none}}
@keyframes hs-fadein{from{opacity:0}to{opacity:1}}
@keyframes hs-todayglow{0%,100%{box-shadow:0 5u 0 var(--ink),inset 0 0 0 3u var(--gold),0 0 0 3u var(--gold),0 0 12u 0 rgba(255,228,92,.4)}50%{box-shadow:0 5u 0 var(--ink),inset 0 0 0 3u var(--gold),0 0 0 3u var(--gold),0 0 28u 6u rgba(255,228,92,.95)}}
@keyframes hs-bulbs{0%{opacity:1}100%{opacity:.35}}
@keyframes hs-wedge{from{filter:brightness(1)}to{filter:brightness(1.55) saturate(1.3)}}
@keyframes hs-flick{0%{transform:rotate(0)}40%{transform:rotate(-24deg)}100%{transform:rotate(0)}}
@keyframes hs-wiggle{0%,60%,100%{transform:rotate(0) scale(1)}70%{transform:rotate(-9deg) scale(1.08)}80%{transform:rotate(8deg) scale(1.08)}90%{transform:rotate(-4deg)}}
@keyframes hs-tpulse{0%,100%{box-shadow:0 6u 0 var(--ink),0 10u 14u rgba(0,0,0,.35),inset 0 -4u 0 rgba(0,0,0,.18),0 0 0 0 rgba(255,228,92,0)}50%{box-shadow:0 6u 0 var(--ink),0 10u 14u rgba(0,0,0,.35),inset 0 -4u 0 rgba(0,0,0,.18),0 0 18u 5u rgba(255,228,92,.9)}}
@keyframes hs-rbw{to{background-position:150% 0}}
@keyframes hs-rbwb{from{background-position:0 0,0% 0}to{background-position:0 0,150% 0}}
@keyframes hs-rbwb3{from{background-position:0 0,0 0,0% 0}to{background-position:0 0,0 0,150% 0}}
@keyframes hs-hue{to{filter:hue-rotate(360deg)}}
@keyframes hs-pkpulse{0%,100%{transform:scale(1)}50%{transform:scale(1.1)}}
@keyframes hs-secret{0%{filter:drop-shadow(0 0 6px #fff) brightness(1)}50%{filter:drop-shadow(0 0 2px #fff) brightness(.55)}100%{filter:drop-shadow(0 0 8px #fff) brightness(1.1)}}
@keyframes hs-gotin{0%{opacity:0;transform:translateX(-50%) translateY(-34u) scale(.4)}12%{opacity:1;transform:translateX(-50%) scale(1.14)}22%{transform:translateX(-50%) scale(.96)}30%,84%{opacity:1;transform:translateX(-50%) scale(1)}100%{opacity:0;transform:translateX(-50%) translateY(-26u) scale(.92)}}
@keyframes hs-gotflash{0%{opacity:0}12%{opacity:.8}100%{opacity:0}}

@media (prefers-reduced-motion:reduce){
  .hs-shake,.hs-time.low,.hs-bn.shaking .hs-bn-in,.hs-logo-in,.hs-play,.hs-shine::after,.hs-bill,.hs-confetti i,.hs-bn-rays,.hs-tag .bang,.hs-prev-img,.hs-pcard .stg .pi,.hs-prize .rays,.hs-wh-rim::after,.hs-dg-goal .gs .rays,.hs-dg-goal .gs .gi,.hs-pz-it .big,.hs-tool.fr.attn .ic,.hs-tool.fr.attn,.hs-dg-day.today,.hs-of-ring.low,.hs-lcoin,.hs-lspark,.hs-pk.near .hs-pk-ring,.hs-got-ic,.hs-got-conf i,.hs-bank.full .hs-bar i,.hs-basebtn .bdg{animation:none!important}
  .hs-time.low{border-color:#ff6b78}
  .hs-bn-in{animation-duration:calc(var(--ms,1800)*1ms)!important}
}
`;

// ---------------------------------------------------------------------------------------------------------
// Оформление Tutorial (init({ css })): фиолетовая плашка с золотыми заклёпками, лаймовые акценты, шрифт игры
// ---------------------------------------------------------------------------------------------------------

const HSUI_TUT_CSS = `
.lory-tut{--tut-bg:#2a0f66;--tut-fg:#ffffff;--tut-accent:#c2ff4a;--tut-border:#12042b;--tut-font:'HsNunito','Nunito',system-ui,sans-serif;--tut-radius:16px;--tut-accent-bg:linear-gradient(180deg,#d9ff70,#78e526);font-weight:900}
.lory-tut-card{background:radial-gradient(circle at 13px 13px,#ffe45c 0 2.2px,#7a4a00 2.6px 4px,transparent 4.4px),radial-gradient(circle at calc(100% - 13px) 13px,#ffe45c 0 2.2px,#7a4a00 2.6px 4px,transparent 4.4px),linear-gradient(180deg,#5428b8 0,#3a1688 10%,#2a0f66 46%,#1a0a45 100%);border:4px solid #12042b;
  box-shadow:0 7px 0 #12042b,0 12px 24px rgba(0,0,0,.5),inset 0 3px 0 rgba(255,255,255,.28),inset 0 -4px 0 rgba(0,0,0,.25)}
.lory-tut-card.lory-tut-ok{border-color:#12042b;box-shadow:0 7px 0 #12042b,0 0 0 4px #7be82a,0 12px 24px rgba(0,0,0,.5),inset 0 3px 0 rgba(255,255,255,.28)}
.lory-tut-title{font-weight:1000;color:#ffe45c;text-shadow:0 2px 0 #12042b,2px 0 0 #12042b,-2px 0 0 #12042b,0 -2px 0 #12042b}
.lory-tut-hint{font-weight:800;text-shadow:0 2px 0 rgba(18,4,43,.9)}
.lory-tut-key{background:linear-gradient(180deg,#fff,#d8ccff);color:#12042b;border:2px solid #12042b;box-shadow:0 3px 0 #12042b;text-shadow:none}
.lory-tut-bar{background:#0a0120;border:2px solid #12042b;box-shadow:inset 0 2px 3px rgba(0,0,0,.6)}
.lory-tut-bar i{background:linear-gradient(180deg,#e8ff9a,#7be82a)}
.lory-tut-skip{background:linear-gradient(180deg,#fff39a,#ffc21f);color:#12042b;border:3px solid #12042b;box-shadow:0 4px 0 #12042b;text-shadow:none;font-weight:1000}
.lory-tut-skip:active{transform:translateY(3px);box-shadow:0 1px 0 #12042b}
.lory-tut-skip kbd{background:#12042b;color:#ffe9a0}
.lory-tut-dots i{background:rgba(255,255,255,.25)}
.lory-tut-dots i.done{background:#c2ff4a}
.lory-tut-final{background:linear-gradient(180deg,#5428b8,#2a0f66);border:3px solid #7be82a;font-weight:1000}
.lory-tut-hl{outline:4px solid #ffe45c;outline-offset:3px;border-radius:26%}
`;

// ---------------------------------------------------------------------------------------------------------
// Помощники
// ---------------------------------------------------------------------------------------------------------

/** «18u» -> calc(var(--u)*18) */
function hsuiCss(src) {
    return src.replace(/(^|[^\w.#-])(-?(?:\d+\.?\d*|\.\d+))u(?![\w-])/g, (m, a, n) => a + 'calc(var(--u)*' + n + ')');
}

/** @param {string} tag @param {string} [cls] @param {Element} [parent] @param {string} [html] @returns {HTMLElement} */
function hsuiEl(tag, cls, parent, html) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    if (parent) parent.appendChild(e);
    return e;
}

/** @param {string} cls @param {Element} [parent] @param {string} [html] @returns {HTMLButtonElement} */
function hsuiBtn(cls, parent, html) {
    const b = /** @type {HTMLButtonElement} */ (hsuiEl('button', cls, parent, html));
    b.type = 'button';
    return b;
}

/** @param {string} src @param {string} [cls] @param {Element} [parent] @returns {HTMLImageElement} */
function hsuiImg(src, cls, parent) {
    const img = /** @type {HTMLImageElement} */ (hsuiEl('img', cls, parent));
    img.alt = '';
    img.draggable = false;
    img.src = src;
    return img;
}

/**
 * Иконка товара или брейнрота: картинка; нет файла — заглушка цвета редкости (брейнрот-болванчик или значок вкладки),
 * а не битая картинка. tab 'br' — брейнрот; power — усиление (рисуется значком по id, файлы старые синие).
 */
function hsuiIcon(src, parent, color, tab, dark) {
    const box = hsuiEl('div', 'hs-ic', parent);
    if (color) box.style.setProperty('--rc', color);
    if (dark) box.classList.add('dark');
    const glyph = () => (tab === 'skin' || tab === 'seeker' || tab === 'br' || !tab ? HSUI_ICON.silhouette : (HSUI_TABIC[tab] || HSUI_ICON.silhouette));
    if (!src) { box.classList.add('miss'); box.innerHTML = glyph(); return box; }
    const img = hsuiImg(src, '', box);
    img.onerror = () => { img.remove(); box.classList.add('miss'); box.innerHTML = glyph(); };
    return box;
}

/** Иконка усиления: свой рисунок по id (старые webp-кнопки голубые и в стиль не годятся). */
const HSUI_POWER_IC = { dash: HSUI_ICON.bolt, decoy: HSUI_ICON.ghost, shield: HSUI_ICON.shield, magnet: HSUI_ICON.magnet };

/** Крупный заголовок с контуром и градиентом. */
function hsuiBig(text, cls, parent) {
    const el = hsuiEl('span', 'hs-big' + (cls ? ' ' + cls : ''), parent);
    el.dataset.text = text;
    hsuiEl('span', 'tx', el).textContent = text;
    return el;
}

function hsuiGame() { return typeof Game !== 'undefined' ? Game : null; }

/** Значок вкладки магазина по её id (запасной значок предмета без файла иконки — тот же). */
const HSUI_TABIC = {
    skin: HSUI_ICON.shirt, seeker: HSUI_ICON.person, hat: HSUI_ICON.hat, trail: HSUI_ICON.trail,
    aura: HSUI_ICON.aura, emote: HSUI_ICON.trophy, power: HSUI_ICON.bolt,
};

/** Сектор круга: путь «клина» от угла a0 до a1 (градусы по часовой от верха), радиус r, центр в (0,0). */
function hsuiWedge(r, a0, a1) {
    const p = (a) => { const t = a * Math.PI / 180; return (r * Math.sin(t)).toFixed(2) + ' ' + (-r * Math.cos(t)).toFixed(2); };
    return 'M0 0L' + p(a0) + 'A' + r + ' ' + r + ' 0 0 1 ' + p(a1) + 'Z';
}

/** Цвета секторов колеса: лайм, малина, золото, фиалка, лёд — без повторов подряд. */
const HSUI_WHEEL_COLS = ['#ff5cb8', '#ffd43b', '#6ee86a', '#a77bff', '#3fc7ff', '#ff9a3c', '#c2ff4a', '#f0348f'];

/** Значок колеса для кнопки меню: 8 цветных секторов, ободок, стрелка. */
function hsuiWheelIcon() {
    const cols = HSUI_WHEEL_COLS;
    let s = '<svg viewBox="-27 -29 54 56"><circle r="25" fill="' + HSUI_K + '"/><circle r="22.4" fill="#ffd43b"/><g>';
    for (let i = 0; i < 8; i++) s += '<path d="' + hsuiWedge(19.2, (i - 0.5) * 45, (i + 0.5) * 45) + '" fill="' + cols[i] + '" stroke="' + HSUI_K + '" stroke-width=".9"/>';
    s += '</g><circle r="5" fill="#fff3a6" stroke="' + HSUI_K + '" stroke-width="1.8"/><circle r="1.8" fill="' + HSUI_K + '"/>';
    s += '<path d="M0-20.4l-4.2-6.4h8.4z" fill="#ff3d7a" stroke="' + HSUI_K + '" stroke-width="1.8" stroke-linejoin="round"/></svg>';
    return s;
}

// ---------------------------------------------------------------------------------------------------------
// Редкости (7) и мутации брейнротов. Цвет — --rc; god переливается радугой (класс r-god), secret — белое на чёрном (r-secret).
// Названия и множители берутся из GameBrainrots.js (ST_RARITY, ST_MUTATIONS), если он подключён; здесь — запасные.
// ---------------------------------------------------------------------------------------------------------

const HSUI_RAR = {
    common: { color: '#b8c4d0', ru: 'Обычный', en: 'Common' },
    rare: { color: '#3d9bff', ru: 'Редкий', en: 'Rare' },
    epic: { color: '#b24dff', ru: 'Эпик', en: 'Epic' },
    legendary: { color: '#ffb02e', ru: 'Легенда', en: 'Legendary' },
    mythic: { color: '#ff3d6e', ru: 'Миф', en: 'Mythic' },
    god: { color: '#ff7ae0', ru: 'Бог брейнрота', en: 'Brainrot God' },
    secret: { color: '#ffffff', ru: 'Секрет', en: 'Secret' },
};
const HSUI_RAR_ORDER = ['common', 'rare', 'epic', 'legendary', 'mythic', 'god', 'secret'];
const HSUI_MUT = { gold: '#ffd23d', diamond: '#9fe8ff', rainbow: '#ff7ae0', galaxy: '#8a5cff' };

/** Редкость: цвет, имена. Неизвестная — обычная. */
function hsuiRar(id) { return HSUI_RAR[id] || (typeof HS_RARITY !== 'undefined' && HS_RARITY[id]) || HSUI_RAR.common; }
function hsuiRarName(id) { const r = hsuiRar(id); return Lang.code === 'en' ? r.en : r.ru; }
/** Класс редкости на элементе: r-<id> (знакомые ids), иначе r-common. */
function hsuiRarCls(id) { return 'r-' + (HSUI_RAR[id] ? id : 'common'); }
/** Свечение под значком: rgba цвета редкости. god/secret — белёсое. */
function hsuiRarGlow(id) { const c = hsuiRar(id).color; return hsuiRgba(c, id === 'common' ? 0.3 : 0.55); }
/** Мутация: 'gold' | 'diamond' | 'rainbow' | 'galaxy' | '' -> текст «ЗОЛОТОЙ!» и т. п. */
function hsuiMutName(id) { return id && HSUI_MUT[id] ? Lang.t('mu.' + id) : ''; }

// ---------------------------------------------------------------------------------------------------------
// Магазин, реклама: доступ к модулям движка и Game. Любой из них может быть ещё не готов — код не падает.
// ---------------------------------------------------------------------------------------------------------

/** Shop, если он подключён (init с каталогом), иначе null. */
function hsuiShop() {
    try { return typeof Shop !== 'undefined' && Shop.items().length ? Shop : null; } catch (e) { return null; }
}
/** Game.ads или null. */
function hsuiAds() {
    const G = /** @type {any} */ (hsuiGame());
    return G && G.ads ? G.ads : null;
}
/** Есть ли что показывать: Game.ads готов и площадка умеет rewarded (в Telegram и т. п. кнопки «за рекламу» прячутся). */
function hsuiAdsOn() {
    if (!hsuiAds()) return false;
    try { if (typeof Platform !== 'undefined' && typeof Platform.rewardedSupported === 'function' && !Platform.rewardedSupported()) return false; } catch (e) { /* площадка не ответила — не прячем */ }
    return true;
}
/** «Через N с» во время общей паузы между rewarded, иначе ''. */
function hsuiAdWait() {
    const a = hsuiAds();
    if (!a || typeof a.label !== 'function') return '';
    try { return String(a.label() || ''); } catch (e) { return ''; }
}
/** Можно ли смотреть рекламу прямо сейчас (нет паузы и ничего не идёт). */
function hsuiAdReady() {
    const a = hsuiAds();
    if (!a) return false;
    try { return typeof a.ready === 'function' ? !!a.ready() : true; } catch (e) { return false; }
}
/** Сколько даёт «+» у кошелька. Game.ads.amount(kind) — если есть; иначе формула Game.ads (120 + 20 за уровень монет, 8 кристаллов). */
function hsuiAdAmount(kind) {
    const a = /** @type {any} */ (hsuiAds());
    try { if (a && typeof a.amount === 'function') { const v = Number(a.amount(kind)); if (v > 0) return Math.floor(v); } } catch (e) { /* ниже запасное */ }
    const G = /** @type {any} */ (hsuiGame());
    const lvl = G && G.save ? G.save.level | 0 : 1;
    return kind === 'gems' ? 8 : 120 + lvl * 20;
}
/** Монеты игрока: Shop.coins (единственный источник), пока Shop не готов — копия в Game.save. */
function hsuiCoins() {
    const S = hsuiShop();
    if (S) return S.coins | 0;
    const G = /** @type {any} */ (hsuiGame());
    return G && G.save ? G.save.coins | 0 : 0;
}
function hsuiGems() {
    const G = /** @type {any} */ (hsuiGame());
    return G && G.save ? G.save.gems | 0 : 0;
}

function hsuiSfx(name) {
    try { if (typeof GameFX !== 'undefined' && GameFX && typeof GameFX.sfx === 'function') GameFX.sfx(name); } catch (e) { /* звук не обязателен */ }
}

/** 1250 -> «1 250» (неразрывный пробел). */
function hsuiFmt(n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' '); }
function hsuiPad2(n) { return (n < 10 ? '0' : '') + n; }
/** Таймер: вверх до целой секунды, m:ss. */
function hsuiTimer(sec) { const s = Math.max(0, Math.ceil(sec)); return Math.floor(s / 60) + ':' + hsuiPad2(s % 60); }
function hsuiClock(sec) { const s = Math.max(0, Math.round(sec)); return Math.floor(s / 60) + ':' + hsuiPad2(s % 60); }
function hsuiClamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

function hsuiRgba(hex, a) {
    const h = String(hex).replace('#', '');
    const n = parseInt(h.length === 3 ? h.replace(/(.)/g, '$1$1') : h, 16) || 0;
    return 'rgba(' + ((n >> 16) & 255) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + a + ')';
}

/** Перезарядка «Забрать всё» на базе, с. */
const HSUI_COLLECT_CD = 3;

/** Подписи плиток меню («НАСТРОЙКИ», «SETTINGS»): не влезла — сжать по ширине, а не обрезать. */
function hsuiFitLabels(root) {
    if (!root) return;
    for (const b of root.querySelectorAll('.hs-tool span > b')) {
        const el = /** @type {HTMLElement} */ (b);
        el.style.transform = '';
        const box = /** @type {HTMLElement} */ (el.parentElement);
        const room = box.clientWidth - 4, need = el.scrollWidth;
        if (need > room && room > 0) el.style.transform = 'scaleX(' + (room / need).toFixed(3) + ')';
    }
}

/** Брейнрот по id: имя, иконка, редкость (ростер GameBrainrots.js; запасной — старые искатели). */
function hsuiBr(id) {
    try {
        const b = typeof stBrainrot === 'function' ? stBrainrot(id) : null;
        if (b) return { id, name: hsText(b.name), icon: b.icon, rarity: b.rarity };
    } catch (e) { /* ростер не готов */ }
    const s = typeof hsSeeker === 'function' && id ? hsSeeker(id) : null;
    return s ? { id, name: hsText(s.name), icon: s.icon, rarity: s.rarity || 'common' } : { id, name: String(id || ''), icon: '', rarity: 'common' };
}
/** Game.collect (сбор, кодекс, база) или null. */
function hsuiCollect() {
    const G = /** @type {any} */ (hsuiGame());
    return G && G.collect ? G.collect : null;
}
/** Вкладки магазина из данных каталога (HS_SHOP_TABS): [{ id, name }]. */
function hsuiShopTabs() {
    return (typeof HS_SHOP_TABS !== 'undefined' ? HS_SHOP_TABS : []).map(t => ({ id: t.id, name: hsText(t.name) }));
}
/** 1234 -> «1.2K», 1500000 -> «1.5M»: короткая запись для бейджей. */
function hsuiCompact(n) {
    n = Math.max(0, Math.floor(n));
    if (n < 1000) return String(n);
    if (n < 1e6) return (n < 10000 ? (n / 1000).toFixed(1).replace(/\.0$/, '') : String(Math.round(n / 1000))) + 'K';
    return (n / 1e6).toFixed(1).replace(/\.0$/, '') + 'M';
}

/** 12 -> «12», 12.5 -> «12.5»: доход в минуту бывает дробным. */
function hsuiFmt10(n) { n = Number(n) || 0; return Math.abs(n - Math.round(n)) < 0.05 ? hsuiFmt(n) : n.toFixed(1); }

/** Имя из строки или { ru, en }. */
function hsuiName(v) { return v && typeof v === 'object' ? hsText(v) : String(v == null ? '' : v); }

function hsuiReduced() { return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches; }

/** Счётчик валюты: плашка с иконкой, числа считаются «вверх/вниз» и подпрыгивают при изменении. */
class HsCounter {
    /** @param {Element} parent @param {string} icon @param {string} [cls] @param {boolean} [plus] */
    constructor(parent, icon, cls, plus) {
        const gem = icon.indexOf('gem') >= 0;
        this.el = hsuiEl('div', 'hs-pill' + (gem ? ' gem' : '') + (cls ? ' ' + cls : ''), parent);
        // иконка — файл (монета, кристалл) или готовый SVG (значок «игроки»)
        this.icon = icon.charAt(0) === '<' ? hsuiEl('span', 'hs-pill-ic', this.el, icon) : hsuiImg(icon, 'hs-pill-ic', this.el);
        this.num = hsuiEl('span', 'hs-pill-n', this.el, '0');
        /** Кнопка «+» (реклама за монеты / кристаллы). */
        this.plus = null;
        if (plus) {
            this.el.classList.add('hasplus');
            this.plus = hsuiBtn('hs-plus', this.el);
            this.plus.textContent = '+';
            this.plus.hidden = true;
        }
        this.val = 0; this.shown = 0; this.from = 0; this.t0 = 0; this.dur = 0; this.raf = 0; this.fallback = 0;
    }
    /** @param {number} v @param {boolean} [anim] */
    set(v, anim) {
        v = Math.max(0, Math.round(Number(v) || 0));
        if (v === this.val) return;
        this.val = v;
        if (!anim) { this._stop(); this.shown = v; this.num.textContent = hsuiFmt(v); return; }
        this.bump();
        this.from = this.shown;
        this.t0 = performance.now();
        this.dur = Math.min(900, 280 + Math.abs(v - this.from) * 5);
        clearTimeout(this.fallback);
        this.fallback = window.setTimeout(() => { this._stop(); this.shown = this.val; this.num.textContent = hsuiFmt(this.val); }, this.dur + 150);
        if (!this.raf) this.raf = requestAnimationFrame(() => this._tick());
    }
    _stop() { if (this.raf) cancelAnimationFrame(this.raf); this.raf = 0; clearTimeout(this.fallback); }
    _tick() {
        this.raf = 0;
        const p = hsuiClamp((performance.now() - this.t0) / this.dur, 0, 1), e = 1 - Math.pow(1 - p, 3);
        this.shown = Math.round(this.from + (this.val - this.from) * e);
        this.num.textContent = hsuiFmt(this.shown);
        if (p < 1) this.raf = requestAnimationFrame(() => this._tick());
        else { this.shown = this.val; clearTimeout(this.fallback); }
    }
    bump() {
        this.el.classList.remove('bump');
        void this.el.offsetWidth;
        this.el.classList.add('bump');
    }
}

const HSUI_BANNERS = {
    hide: { k: 'bn.hide', c: 'yellow', ms: 2300 },
    seek: { k: 'bn.seek', c: 'red', ms: 2000, shake: true },
    hunt: { k: 'bn.hunt', c: 'green', ms: 1900 },
    spotted: { k: 'bn.spotted', c: 'red', ms: 1800, shake: true },
    caught: { k: 'bn.caught', c: 'red', ms: 2100, shake: true },
    saved: { k: 'bn.saved', c: 'blue', ms: 1800 },
    last10: { k: 'bn.last10', c: 'orange', ms: 1600, shake: true },
    botCaught: { k: 'bn.botCaught', c: 'blue', ms: 1700, small: true, suf: 'bn.sufCaught' },
    found: { k: 'bn.found', c: 'green', ms: 1700, small: true, suf: 'bn.sufFound' },
};

// ---------------------------------------------------------------------------------------------------------
// GameUI
// ---------------------------------------------------------------------------------------------------------

/** @satisfies {Record<string, any>} */
const GameUI = {
    /** Строка для Tutorial.init({ css }). */
    tutorialCss: HSUI_TUT_CSS,
    app: null,
    root: null,
    W: 960, H: 540, u: 1, portrait: false,
    /** 'hider' | 'seeker' — выбор в меню. */
    role: 'hider',
    _inited: false,
    _menuWanted: false,
    _hudOn: false,
    _open: '',          // 'shop' | 'settings' | 'daily' | 'wheel' | 'codex' | 'inv' | ''
    _from: 'menu',      // куда вернуться из окна: 'menu' | 'result'
    _timers: new WeakMap(),
    _hb: /** @type {Record<string, any>} */ ({}),
    _c: /** @type {Record<string, any>} */ ({}),
    _tags: new Map(),
    _flo: /** @type {HTMLElement[]} */ ([]),
    _counters: /** @type {HsCounter[]} */ ([]),
    _hudMode: '',
    _resultOn: false,
    _rt: /** @type {number[]} */ ([]),
    _baseOn: false,
    /** Метки подбора над брейнротами: id -> запись. */
    _picks: new Map(),
    /** Стрелки к брейнротам за краем экрана (пул). */
    _marks: /** @type {any[]} */ ([]),

    // =====================================================================================
    // Запуск
    // =====================================================================================

    init(app) {
        if (this._inited || typeof document === 'undefined') return;
        this._inited = true;
        this.app = app;
        const st = document.createElement('style');
        st.id = 'hs-ui-css';
        st.textContent = hsuiCss(HSUI_CSS + HSUI_CSS2 + HSUI_CSS3);
        document.head.appendChild(st);
        try { const stored = Store.get(GAME_ID + '.role'); if (stored === 'seeker' || stored === 'hider') this.role = stored; } catch (e) { /* без хранилища */ }

        const root = hsuiEl('div');
        root.id = 'hs-ui';
        document.body.appendChild(root);
        this.root = root;
        this.vig = hsuiEl('div', 'hs-vig', root);
        hsuiEl('i', '', this.vig);
        this.hud_el = hsuiEl('div', 'hs-hud', root);
        this.hud_el.hidden = true;
        this.base_el = hsuiEl('div', 'hs-basehud', root);
        this.base_el.hidden = true;
        this.tagsEl = hsuiEl('div', 'hs-tags', root);
        this.picksEl = hsuiEl('div', 'hs-picks', root);
        this.marksEl = hsuiEl('div', 'hs-marks', root);
        this.arrow = hsuiEl('div', 'hs-arrow', root, HSUI_ICON.arrow);
        this.floats = hsuiEl('div', 'hs-floats', root);
        this.banner_el = hsuiEl('div', 'hs-banner', root);
        this.fxl = hsuiEl('div', 'hs-fxl', root);
        if (typeof HudLayout !== 'undefined' && !HudLayout._inited) HudLayout.init({ app });
        this._buildHud();
        this._buildBaseHud();
        this._buildMenu();
        this.resize();
        window.addEventListener('resize', () => this.resize());
        window.addEventListener('orientationchange', () => setTimeout(() => this.resize(), 250));
        window.addEventListener('lory-viewcap', () => this.resize());
        window.addEventListener('lory-input-device', () => this._syncKeys());
        this._syncKeys();
        window.addEventListener('hs-save', () => this.refresh());
        if (typeof HudLayout !== 'undefined') HudLayout.onChange(() => this._fitAll());
        if (typeof Quality !== 'undefined' && Quality.onChange) Quality.onChange(() => this._fxLevel());
        this._fxLevel();
        this._startTicker();
    },

    /** Единица экрана и классы раскладки. */
    resize() {
        if (!this.root) return;
        const r = this.root.getBoundingClientRect();
        const W = Math.max(200, r.width || window.innerWidth), H = Math.max(200, r.height || window.innerHeight);
        const portrait = H > W * 1.02;
        const u = portrait ? hsuiClamp(Math.min(W / 420, H / 800), 0.6, 1.4) : hsuiClamp(Math.min(W / 960, H / 540), 0.5, 1.4);
        this.W = W; this.H = H; this.u = u; this.portrait = portrait;
        this.root.style.setProperty('--u', u.toFixed(3) + 'px');
        this.root.style.setProperty('--hh', H.toFixed(0) + 'px');
        const cl = this.root.classList;
        cl.toggle('hs-p', portrait);
        cl.toggle('hs-l', !portrait);
        cl.toggle('hs-low', !portrait && H < 430);
        requestAnimationFrame(() => hsuiFitLabels(this.root));
        cl.toggle('hs-tiny', Math.min(W, H) < 340);
        this._fitAll();
        if (this._open === 'wheel') this._wheelSize();
        if (this._open === 'codex') this._cxLayout();
    },

    /** Подсказки клавиш на кнопках HUD: пока устройство не сенсорное (мышь-как-палец тоже с клавиатурой). */
    _syncKeys() {
        if (!this.root) return;
        const dev = typeof Input !== 'undefined' ? Input.device : 'keyboard';
        this.root.classList.toggle('hs-kb', dev !== 'touch');
    },

    _fxLevel() {
        if (!this.root) return;
        const lvl = typeof Quality !== 'undefined' ? Quality.level : 2;
        this.root.classList.toggle('hs-lowfx', lvl === 0 || hsuiReduced());
    },

    /** @param {HTMLElement} el @param {boolean} on */
    _show(el, on) {
        const prev = this._timers.get(el);
        if (prev) clearTimeout(prev);
        if (on) {
            el.classList.remove('out', 'in');
            el.classList.add('on');
            void el.offsetWidth;
            el.classList.add('in');
        } else {
            if (!el.classList.contains('on')) return;
            el.classList.add('out');
            this._timers.set(el, window.setTimeout(() => { el.classList.remove('on', 'out', 'in'); }, 240));
        }
    },

    /** Кнопка: звук клика и обработчик. */
    _bind(el, fn, sound) {
        el.addEventListener('click', e => {
            e.stopPropagation();
            if (sound !== false) hsuiSfx('click');
            fn(e);
        });
    },

    /** kind: 'coins' | 'gems' — у счётчика появляется «+» (реклама за валюту). */
    _counter(parent, icon, cls, kind) {
        const c = new HsCounter(parent, icon, cls, !!kind);
        this._counters.push(c);
        if (kind && c.plus) this._bind(c.plus, () => this._adPop(kind, c));
        return c;
    },

    // =====================================================================================
    // HUD
    // =====================================================================================

    _buildHud() {
        const hud = this.hud_el;
        const blk = (id, cls, dock, w, h, extra) => {
            const el = hsuiEl('div', 'hs-hb ' + cls, hud);
            const fit = hsuiEl('div', 'hs-fit', el);
            fit.style.width = w + 'px'; fit.style.height = h + 'px';
            this._hb[id] = { el, fit, dw: w, dh: h };
            if (typeof HudLayout !== 'undefined') HudLayout.block(id, Object.assign({ dock, w, h, el }, extra || {}));
            return fit;
        };
        // карта
        const fMap = blk('hs-map', 'map', 'tl', 250, 44);
        const plate = hsuiEl('div', 'hs-plate', fMap);
        this.hMapNum = hsuiEl('span', 'num', plate, '01');
        this.hMapName = hsuiEl('span', 'nm hs-o', plate);
        this.hMapName.style.setProperty('--s', '1.5px');
        this.hMapPlate = plate;
        // игроки / поймано
        const fPl = blk('hs-players', 'players', 'tl', 128, 40, { order: 1 });
        this.hPlayers = this._counter(fPl, HSUI_ICON.person, '');
        this.hPlayers.num.textContent = '4/4';
        // таймер и фаза
        const fT = blk('hs-timer', 'timer', 'tc', 176, 80);
        const time = hsuiEl('div', 'hs-time', fT);
        time.dataset.hs = 'timer';
        hsuiEl('span', 'tic', time, HSUI_ICON.clock);
        this.hTimeB = hsuiEl('b', 'hs-o', time, '0:00');
        this.hTimeB.style.setProperty('--s', '2px');
        this.hTime = time;
        this.hPhase = hsuiEl('div', 'hs-phase', fT, '');
        // кошелёк
        const fW = blk('hs-wallet', 'wallet', 'tr', 262, 42);
        const wal = hsuiEl('div', 'hs-wal', fW);
        this.hCoin = this._counter(wal, 'assets/ui/steal/coin.svg', '');
        this.hCoin.el.dataset.hs = 'coins';
        this.hGem = this._counter(wal, 'assets/ui/steal/gem.svg', '');
        // уровень
        const fL = blk('hs-level', 'level', 'bc', 250, 50);
        const lv = hsuiEl('div', 'hs-hlvl', fL);
        this.hLvl = hsuiEl('b', 'hs-o', lv, '');
        this.hLvl.style.setProperty('--s', '1.5px');
        const bar = hsuiEl('div', 'hs-bar', lv);
        this.hBar = hsuiEl('i', '', bar);
        // состояние: в укрытии, щит
        const fS = blk('hs-status', 'status', 'bc', 170, 38, { order: 1, visible: () => this._hudOn && !!this._c.chips });
        this.hChips = hsuiEl('div', 'hs-chips', fS);
        this.chHide = hsuiEl('div', 'hs-chip', this.hChips, HSUI_ICON.eyeOff + '<span class="hs-o"></span>');
        this.chHide.lastElementChild.textContent = Lang.t('hud.hidden');
        this.chShield = hsuiEl('div', 'hs-chip sh', this.hChips, HSUI_ICON.shield + '<span class="hs-o"></span>');
        this.chShield.lastElementChild.textContent = Lang.t('hud.shield');
        this.chHide.hidden = true; this.chShield.hidden = true;
        // рывок и обманка
        const fA = blk('hs-abil', 'abil', 'br', 198, 102);
        this.abil = {};
        for (const k of ['dash', 'decoy']) {
            const b = hsuiBtn('hs-ab ' + k, fA);
            b.dataset.hs = k;
            b.setAttribute('aria-label', Lang.t('hud.' + k));
            hsuiEl('span', 'ico', b, k === 'dash' ? HSUI_ICON.bolt : HSUI_ICON.ghost);
            const cd = hsuiEl('i', 'cd', b);
            hsuiEl('i', 'rg', b);
            const lb = hsuiEl('span', 'lb', b);
            lb.textContent = Lang.t('hud.' + k);
            const nn = hsuiEl('span', 'nn hs-o', b);
            nn.style.setProperty('--s', '1.5px');
            const key = hsuiEl('span', 'key', b);
            key.textContent = k === 'dash' ? Lang.t('hud.keySpace') : 'E';
            this.abil[k] = { b, cd, lb, nn, key, count: -1, cdPct: -1 };
            b.addEventListener('pointerdown', e => {
                e.preventDefault(); e.stopPropagation();
                const G = hsuiGame();
                if (!G) return;
                if (k === 'dash' && G.useDash) G.useDash();
                // с 0 обманок кнопка — «+1 за рекламу» (Game.ads.extraDecoy), не Game.useDecoy
                if (k === 'decoy') { if (this.abil.decoy.ad) this._decoyAd(); else if (G.useDecoy) G.useDecoy(); }
            });
            b.addEventListener('click', e => e.stopPropagation());
        }
    },

    /** Масштаб внутренних слоёв блока = размер, который дал HudLayout, к проектному. */
    _fitAll() {
        if (typeof HudLayout === 'undefined') return;
        const mode = HudLayout.mode;
        if (mode && mode !== this._hudMode) {
            this._hudMode = mode;
            const mp = this._hb['hs-map'];
            if (mp) {
                const w = mode === 'tall' ? 296 : 250;
                mp.dw = w; mp.fit.style.width = w + 'px';
                HudLayout.block('hs-map', { w });
            }
        }
        for (const id of Object.keys(this._hb)) {
            const h = this._hb[id], r = HudLayout.rect(id);
            if (!r) continue;
            const f = Math.min(r.w / h.dw, r.h / h.dh);
            if (!(f > 0) || Math.abs(f - (h.f || 0)) < 0.002) continue;
            h.f = f;
            h.fit.style.setProperty('--fit', f.toFixed(4));
        }
    },

    hud(show) {
        if (!this.root) return;
        show = !!show;
        if (show === this._hudOn) { if (show) this._hudReset(); return; }
        this._hudOn = show;
        this.hud_el.hidden = !show;
        if (show) {
            if (this._baseOn) this.baseHud(false);
            this._menuHide(true);
            this._resultHide(true);
            this._hudReset();
        } else {
            this.vig.style.opacity = '0';
            this.arrow.classList.remove('on');
            this._offerEnd(this._offerRec, 'silent');
            this._clearBanners();
            this._clearTags();
        }
    },

    _hudReset() {
        this._c = { first: true };
        this._hudMode = '';
        for (const k of Object.keys(this.abil)) { this.abil[k].count = -1; this.abil[k].cdPct = -1; }
        if (typeof HudLayout !== 'undefined') {
            HudLayout.block('input-action', { visible: false });   // контекстная кнопка Input не нужна: свои кнопки HUD
            HudLayout.block('input-stick', { w: 200, h: 200 });    // стик крупнее: он виден и на ПК (мышь как палец)
            HudLayout.refresh();
        }
        this._fitAll();
    },

    /** Каждый кадр из Game.update. */
    hudUpdate(s) {
        if (!this._hudOn || !s) return;
        const c = this._c;
        const first = !!c.first;
        const seeker = s.role === 'seeker';
        if (c.seeker !== seeker) {
            c.seeker = seeker;
            this._hb['hs-players'].el.classList.toggle('seeker', seeker);
            this.abil.decoy.b.hidden = seeker;
            this.abil.dash.lb.textContent = Lang.t(seeker ? 'hud.lunge' : 'hud.dash');
            const w = seeker ? 98 : 198;
            const ab = this._hb['hs-abil'];
            ab.dw = w; ab.fit.style.width = w + 'px';
            if (typeof HudLayout !== 'undefined') HudLayout.block('hs-abil', { w });
            c.mapKey = null; c.plKey = null; c.phKey = null;
        }
        // карта и уровень
        const mapKey = s.mapIndex + '|' + s.mapName;
        if (c.mapKey !== mapKey) {
            c.mapKey = mapKey;
            const mi = HS_MAPS[s.mapIndex] || HS_MAPS[0];
            this.hMapNum.textContent = hsuiPad2((s.mapIndex || 0) + 1);
            this.hMapName.textContent = hsuiName(s.mapName).toUpperCase();
            this.hMapPlate.style.setProperty('--mc', mi.color);
        }
        const lvKey = s.level + '|' + Math.round((s.xpFrac || 0) * 100);
        if (c.lvKey !== lvKey) {
            c.lvKey = lvKey;
            this.hLvl.textContent = Lang.t('ui.level', { n: s.level });
            this.hBar.style.setProperty('--f', hsuiClamp(s.xpFrac || 0, 0, 1).toFixed(3));
        }
        // валюты
        this.hCoin.set(s.coins, !first);
        this.hGem.set(s.gems, !first);
        // игроки
        const alive = Math.max(0, s.alive | 0), total = Math.max(1, s.total | 0);
        const caught = typeof s.caught === 'number' ? s.caught : total - alive;
        const plKey = seeker ? 'c' + caught + '/' + total : alive + '/' + total;
        if (c.plKey !== plKey) {
            c.plKey = plKey;
            this.hPlayers.num.textContent = seeker ? Lang.t('hud.caught', { a: caught, b: total }) : alive + '/' + total;
            this._hb['hs-players'].el.classList.toggle('seeker', seeker);
            if (!first) this.hPlayers.bump();
        }
        // таймер и фаза
        const tut = !!s.tutorial;
        const t = Math.max(0, Number(s.time) || 0), sec = Math.ceil(t);
        if (c.sec !== sec) { c.sec = sec; this.hTimeB.textContent = hsuiTimer(t); }
        const low = !tut && s.phase === 'seek' && sec <= 10 && sec > 0;
        if (c.low !== low) { c.low = low; this.hTime.classList.toggle('low', low); }
        const phKey = (tut ? 'tut' : s.phase) + (seeker ? 'S' : 'H');
        if (c.phKey !== phKey) {
            c.phKey = phKey;
            this.hPhase.classList.toggle('seek', s.phase === 'seek' && !tut);
            this.hPhase.textContent = tut ? Lang.t('hud.tutorial') : Lang.t(s.phase === 'seek' ? (seeker ? 'hud.hunt' : 'hud.seek') : (seeker ? 'hud.wait' : 'hud.hide'));
            if (!first) { this.hPhase.classList.remove('pop'); void this.hPhase.offsetWidth; this.hPhase.classList.add('pop'); }
        }
        // кнопки
        this._abil('dash', s.dash, first);
        if (!seeker) this._abil('decoy', s.decoy, first, !!s.decoyAd, s.adLabel);
        // состояния
        const hid = !!s.hidden, sh = !!s.shield;
        if (c.hid !== hid || c.sh !== sh) {
            c.hid = hid; c.sh = sh;
            this.chHide.hidden = !hid; this.chShield.hidden = !sh;
            c.chips = hid || sh;
            if (typeof HudLayout !== 'undefined') HudLayout.schedule();
        }
        // опасность
        const d = hsuiClamp(Number(s.danger) || 0, 0, 1);
        const dq = Math.round(d * 20);
        if (c.dq !== dq) {
            c.dq = dq;
            this.vig.style.opacity = dq === 0 ? '0' : (Math.min(1, 0.2 + d * 0.8)).toFixed(2);
            const vp = d > 0.85 ? 0.42 : d > 0.55 ? 0.65 : 1.1;
            if (c.vp !== vp) { c.vp = vp; this.vig.style.setProperty('--vp', vp + 's'); }
        }
        // стрелка к искателю
        this._arrow(s.seekerDir);
        c.first = false;
    },

    _abil(k, st, first, ad, wait) {
        const a = this.abil[k];
        if (!a) return;
        st = st || { count: 0, cd: 0 };
        const cdPct = Math.round(hsuiClamp(st.cd || 0, 0, 1) * 100);
        if (a.cdPct !== cdPct) {
            if (a.cdPct > 0 && cdPct === 0 && !first) { a.b.classList.remove('ready'); void a.b.offsetWidth; a.b.classList.add('ready'); }
            a.cdPct = cdPct;
            a.cd.style.setProperty('--cd', cdPct + '%');
        }
        const n = st.count | 0;
        if (a.count !== n) {
            const was = a.count;
            a.count = n;
            a.nn.textContent = String(n);
            a.nn.hidden = k === 'dash' && n <= 0;
            a.nnAd = false;
            a.adKey = '';
            if (was >= 0 && !first) { a.nn.classList.remove('pop'); void a.nn.offsetWidth; a.nn.classList.add('pop'); }
        }
        if (k === 'decoy') {
            // обманок нет и реклама доступна: на кнопке значок ▶ и «+1 за рекламу» (или «Через N с» во время паузы)
            const adOn = !!ad && n <= 0, w = adOn ? String(wait || '') : '';
            const key = (adOn ? 1 : 0) + '|' + w + '|' + n;
            if (a.adKey !== key) {
                a.adKey = key;
                a.ad = adOn;
                a.b.classList.toggle('ad', adOn);
                a.b.classList.toggle('empty', n <= 0 && (!adOn || !!w));
                a.lb.textContent = adOn ? (w ? w.toUpperCase() : Lang.t('hud.decoyAd')) : Lang.t('hud.decoy');
                if (adOn) { a.nn.innerHTML = HSUI_ICON.playG; a.nnAd = true; }
                else if (a.nnAd) { a.nn.textContent = String(n); a.nnAd = false; }
                if (!adOn) a.b.classList.toggle('empty', n <= 0);
            }
        }
    },

    /** Стрелка у края экрана в сторону искателя за кадром; ang — радианы на экране (0 — вправо, + вниз). */
    _arrow(ang) {
        const el = this.arrow;
        if (ang == null || !isFinite(ang)) { if (this._c.arr) { this._c.arr = false; el.classList.remove('on'); } return; }
        const W = this.W, H = this.H, u = this.u;
        const mx = 46 * u, mt = 96 * u, mb = 120 * u;
        const cx = W / 2, cy = H / 2, ca = Math.cos(ang), sa = Math.sin(ang);
        const tx = Math.abs(ca) > 1e-4 ? (ca > 0 ? (W - mx - cx) : (mx - cx)) / ca : 1e9;
        const ty = Math.abs(sa) > 1e-4 ? (sa > 0 ? (H - mb - cy) : (mt - cy)) / sa : 1e9;
        const t = Math.max(0, Math.min(tx, ty));
        el.style.transform = 'translate(' + (cx + ca * t).toFixed(1) + 'px,' + (cy + sa * t).toFixed(1) + 'px) rotate(' + ang.toFixed(3) + 'rad)';
        if (!this._c.arr) { this._c.arr = true; el.classList.add('on'); }
    },

    // =====================================================================================
    // Баннеры, ники, всплывающий текст
    // =====================================================================================

    banner(kind, text) {
        if (!this.root) return;
        const cfg = HSUI_BANNERS[kind] || HSUI_BANNERS.hide;
        const G = hsuiGame();
        let msg = '';
        if (cfg.suf && text) msg = hsuiName(text) + ' ' + Lang.t(cfg.suf);
        else if (text) msg = hsuiName(text);
        else if (kind === 'hide' && G && G.role === 'seeker') msg = Lang.t('bn.hideSeeker');
        else msg = Lang.t(cfg.k);
        if (!cfg.small) this._clearBanners(true);
        const bn = hsuiEl('div', 'hs-bn ' + cfg.c + (cfg.small ? ' small' : '') + (cfg.shake && !hsuiReduced() ? ' shaking' : ''), this.banner_el);
        bn.style.setProperty('--ms', String(cfg.ms));
        if (!cfg.small) hsuiEl('div', 'hs-bn-rays', bn);
        const inn = hsuiEl('div', 'hs-bn-in', bn);
        hsuiBig(msg.toUpperCase(), 'hs-bn-txt', inn);
        window.setTimeout(() => bn.remove(), cfg.ms + 60);
    },

    _clearBanners(onlyBig) {
        if (!this.banner_el) return;
        for (const b of Array.from(this.banner_el.children)) if (!onlyBig || !b.classList.contains('small')) b.remove();
    },

    /** Ники над головами: каждый кадр. */
    tags(list) {
        if (!this.root) return;
        if ((!this._hudOn && !this._baseOn) || !list || !list.length) { if (this._tags.size) this._clearTags(); return; }
        const seen = new Set();
        for (const t of list) {
            seen.add(t.id);
            let rec = this._tags.get(t.id);
            if (!rec) {
                const el = hsuiEl('div', 'hs-tag', this.tagsEl);
                const inn = hsuiEl('div', 'hs-tag-in', el);
                const bang = hsuiEl('span', 'bang', inn, '!');
                const gr = hsuiEl('span', 'gr', inn, HSUI_ICON.grid);
                gr.hidden = true;
                const tx = hsuiEl('span', 'tx', inn);
                rec = { el, inn, bang, gr, tx, text: null, kind: '', state: '', px: -1e9, py: -1e9 };
                this._tags.set(t.id, rec);
            }
            if (rec.text !== t.text) { rec.text = t.text; rec.tx.textContent = t.text || ''; }
            let kind = t.kind || 'bot';
            const state = t.state || 'normal';
            if (kind === 'bot' && typeof t.text === 'string' && t.text.charAt(0) === '$') kind = 'cash';   // деньги над постаментом базы
            if (rec.kind !== kind || rec.state !== state) {
                rec.kind = kind; rec.state = state;
                rec.el.className = 'hs-tag k-' + kind + ' s-' + state;
                rec.gr.hidden = state !== 'caught';
            }
            if (Math.abs(rec.px - t.x) > 0.3 || Math.abs(rec.py - t.y) > 0.3) {
                rec.px = t.x; rec.py = t.y;
                rec.el.style.transform = 'translate3d(' + t.x.toFixed(1) + 'px,' + t.y.toFixed(1) + 'px,0)';
            }
        }
        for (const [id, rec] of Array.from(this._tags)) if (!seen.has(id)) { rec.el.remove(); this._tags.delete(id); }
    },

    _clearTags() {
        for (const rec of this._tags.values()) rec.el.remove();
        this._tags.clear();
    },

    /** «+1» с иконкой: поднимается над точкой и улетает к своему счётчику. */
    floatText(x, y, text, kind) {
        if (!this.root || !this.floats || !isFinite(x) || !isFinite(y)) return;
        kind = kind || 'coin';
        while (this._flo.length > 14) { const o = this._flo.shift(); if (o) o.remove(); }
        const el = hsuiEl('div', 'hs-float ' + kind, this.floats);
        if (kind === 'coin') hsuiImg('assets/ui/steal/coin.svg', '', el);
        else if (kind === 'gem') hsuiImg('assets/ui/steal/gem.svg', '', el);
        const tx = hsuiEl('span', 'hs-o', el);
        tx.textContent = String(text);
        this._flo.push(el);
        // цель: счётчик монет / кристаллов, полоса уровня, кнопки усилений
        let target = null, counter = null;
        if (this._hudOn) {
            if (kind === 'coin') { target = this.hCoin.el; counter = this.hCoin; }
            else if (kind === 'gem') { target = this.hGem.el; counter = this.hGem; }
            else if (kind === 'xp') target = this.hLvl;
            else if (kind === 'power') target = this.abil.dash.b;
        } else if (this._baseOn && this.bCoin) {
            if (kind === 'coin') { target = this.bCoin.el; counter = this.bCoin; }
            else if (kind === 'gem') { target = this.bGem.el; counter = this.bGem; }
        }
        const rr = this.root.getBoundingClientRect();
        let ex = x, ey = y - 70 * this.u;
        if (target) {
            const r = target.getBoundingClientRect();
            if (r.width > 0) { ex = r.left - rr.left + r.width * 0.3; ey = r.top - rr.top + r.height / 2; }
        }
        const done = () => { el.remove(); const i = this._flo.indexOf(el); if (i >= 0) this._flo.splice(i, 1); if (counter) counter.bump(); };
        if (typeof el.animate !== 'function') { window.setTimeout(done, 700); return; }
        const rise = 46 * this.u;
        const at = (px, py, sc) => 'translate(' + px.toFixed(1) + 'px,' + py.toFixed(1) + 'px) translate(-50%,-50%) scale(' + sc + ')';
        const a = el.animate([
            { transform: at(x, y, 0.4), opacity: 0 },
            { transform: at(x, y - rise * 0.7, 1.25), opacity: 1, offset: 0.2 },
            { transform: at(x, y - rise, 1), opacity: 1, offset: 0.45 },
            { transform: at(ex, ey, 0.45), opacity: 0.2 },
        ], { duration: target ? 1050 : 800, easing: 'cubic-bezier(.4,0,.6,1)', fill: 'forwards' });
        a.onfinish = done;
        a.oncancel = done;
    },

    // =====================================================================================
    // Главное меню
    // =====================================================================================

    _buildMenu() {
        const root = this.root;
        const m = hsuiEl('div', 'hs-screen hs-menu', root);
        this.menu_el = m;
        // денежный дождь на фоне
        const rain = hsuiEl('div', 'hs-rain', m);
        for (let i = 0; i < 9; i++) {
            const c = hsuiEl('i', 'hs-bill', rain);
            c.style.setProperty('--x', (6 + i * 10.5 + (i % 2) * 3) + '%');
            c.style.setProperty('--t', (10 + (i * 7) % 6) + 's');
            c.style.setProperty('--dl', (-((i * 1.9) % 11)).toFixed(1) + 's');
            c.style.setProperty('--sz', (0.8 + (i % 3) * 0.3).toFixed(2));
            c.style.setProperty('--dx', ((i % 2 ? 1 : -1) * (14 + i * 3)) + 'px');
            c.style.setProperty('--r0', ((i % 2 ? 1 : -1) * (12 + i * 3)) + 'deg');
            c.style.setProperty('--r1', ((i % 2 ? -1 : 1) * (28 + i * 5)) + 'deg');
        }
        // логотип: «STEAL N HIDE» золотом, «A BRAINROT» малиновой лентой, монеты и искры
        const logo = hsuiEl('div', 'hs-logo', m);
        const la = hsuiEl('div', 'hs-a top', logo);
        la.style.setProperty('--d', '0');
        const li = hsuiEl('div', 'hs-logo-in', la);
        const ruLogo = String(GAME_PLATFORM) === 'pikabu';   // Пикабу: название только по-русски
        this.logo1 = hsuiBig(ruLogo ? 'ПРЯТКИ' : Lang.t('ui.logo1'), 'hs-logo-1', li);
        this.logo2 = hsuiEl('div', 'hs-ribbon', li);
        this.logo2.textContent = ruLogo ? 'УКРАДИ И СПРЯЧЬ' : Lang.t('ui.logo2');
        hsuiImg(HSUI_COIN, 'hs-lcoin c1', li);
        hsuiImg(HSUI_COIN, 'hs-lcoin c2', li);
        for (let k = 1; k <= 3; k++) hsuiEl('span', 'hs-lspark s' + k, li, HSUI_ICON.sparkle);
        // карта и искатель (билетик под логотипом)
        const mc = hsuiEl('div', 'hs-mapcard hs-a left', m);
        mc.style.setProperty('--d', '1');
        this.mNum = hsuiEl('span', 'hs-mapnum', mc, '01');
        const nm = hsuiEl('div', 'hs-mapname', mc);
        this.mName = hsuiEl('b', 'hs-o', nm);
        this.mName.style.setProperty('--s', '1.5px');
        this.mSub = hsuiEl('small', '', nm);
        this.mSeekIc = hsuiEl('div', 'hs-seekic', mc);
        // кошелёк
        const wal = hsuiEl('div', 'hs-m-wallet hs-a right', m);
        wal.style.setProperty('--d', '1');
        this.mCoin = this._counter(wal, HSUI_COIN, '', 'coins');
        this.mGem = this._counter(wal, HSUI_GEM, '', 'gems');
        // подарок дня и колесо (красная точка — можно забрать / крутить бесплатно)
        const side = hsuiEl('div', 'hs-m-side', m);
        const tile = (parent, cls, label, svg, d, dir, fn, withDot) => {
            const w = hsuiEl('div', 'hs-a ' + dir, parent);
            w.style.setProperty('--d', String(d));
            const b = hsuiBtn('hs-tool ' + cls, w);
            b.setAttribute('aria-label', label);
            hsuiEl('div', 'ic', b, svg);
            hsuiEl('b', '', hsuiEl('span', '', b)).textContent = label;   // длинную подпись сжимает hsuiFitLabels
            const dot = hsuiEl('i', 'dot', b);
            dot.hidden = true;
            if (!withDot) dot.remove();
            this._bind(b, fn);
            return { el: b, dot };
        };
        this.btnGift = tile(side, 'fr gift', Lang.t('ui.gift'), HSUI_ICON.gift, 2, 'right', () => this.dailyOpen(), true);
        this.btnWheel = tile(side, 'fr wheel', Lang.t('ui.wheel'), hsuiWheelIcon(), 3, 'right', () => this.wheelOpen(), true);
        // инструменты: магазин, облики, кодекс, рекорды (если есть у площадки), настройки
        const tools = hsuiEl('div', 'hs-m-tools', m);
        tile(tools, 'shop', Lang.t('ui.shop'), HSUI_ICON.shop, 2, 'left', () => this.openShop(hsuiShopTabs().some(t => t.id === 'hat') ? 'hat' : 'power', 'menu'));
        tile(tools, 'skins', Lang.t('ui.skins'), HSUI_ICON.shirt, 3, 'left', () => this.openShop('skin', 'menu'));
        this.btnCodex = tile(tools, 'codex', Lang.t('ui.codex'), HSUI_ICON.book, 4, 'left', () => this.openCodex('menu'));
        if (typeof GameRecords !== 'undefined' && GameRecords.supported) tile(tools, 'rec', Lang.t('rec.button'), HSUI_ICON.cup, 5, 'left', () => GameRecords.open());
        tile(tools, 'gear', Lang.t('ui.settings'), HSUI_ICON.gear, 6, 'left', () => this.openSettings());
        // уровень
        const lw = hsuiEl('div', 'hs-lvl hs-a left', m);
        lw.style.setProperty('--d', '5');
        lw.insertAdjacentHTML('afterbegin', HSUI_ICON.star);
        const lc = hsuiEl('div', '', lw);
        this.mLvl = hsuiEl('b', 'hs-o', lc);
        this.mLvl.style.setProperty('--s', '1.5px');
        const bar = hsuiEl('div', 'hs-bar', lc);
        this.mBar = hsuiEl('i', '', bar);
        // главное: за кого искать, роль, играть, моя база
        const main = hsuiEl('div', 'hs-m-main', m);
        this.mMain = main;
        const spw = hsuiEl('div', 'hs-a bottom sp-wrap', main);
        spw.style.setProperty('--d', '2');
        const sp = hsuiEl('div', 'hs-seekpick', spw);
        const spTop = hsuiEl('div', 'hs-sp-top', sp);
        hsuiEl('span', '', spTop).textContent = Lang.t('ui.seekFor');
        const spName = hsuiEl('b', '', spTop);
        const spRow = hsuiEl('div', 'hs-sp-row', sp);
        // ряд прокручивается и колесом мыши, и перетаскиванием (на касании — свайпом)
        spRow.addEventListener('wheel', e => {
            if (Math.abs(e.deltaY) > Math.abs(e.deltaX) && spRow.scrollWidth > spRow.clientWidth) { spRow.scrollLeft += e.deltaY; e.preventDefault(); }
        }, { passive: false });
        let drag = null;
        spRow.addEventListener('pointerdown', e => { if (e.pointerType === 'mouse') drag = { x: e.clientX, l: spRow.scrollLeft, moved: false }; });
        window.addEventListener('pointermove', e => {
            if (!drag) return;
            const dx = e.clientX - drag.x;
            if (Math.abs(dx) > 4) drag.moved = true;
            if (drag.moved) spRow.scrollLeft = drag.l - dx;
        });
        window.addEventListener('pointerup', () => { if (drag && drag.moved) { spRow.dataset.dragged = '1'; window.setTimeout(() => { delete spRow.dataset.dragged; }, 60); } drag = null; });
        spRow.addEventListener('click', e => { if (spRow.dataset.dragged) { e.stopPropagation(); e.preventDefault(); } }, true);
        const spNone = hsuiEl('div', 'hs-sp-none', sp, HSUI_ICON.silhouette);
        const spTx = hsuiEl('div', '', spNone);
        spTx.textContent = Lang.t('ui.seekNone');
        hsuiEl('small', '', spTx).textContent = Lang.t('ui.seekNoneSub');
        this.seekBox = { el: sp, name: spName, row: spRow, none: spNone };
        this._seekKey = '';
        const sw = hsuiEl('div', 'hs-a bottom', main);
        sw.style.setProperty('--d', '3');
        const seg = hsuiEl('div', 'hs-seg', sw);
        this.seg = seg;
        hsuiEl('i', '', seg);
        this.segHide = hsuiBtn('', seg, HSUI_ICON.eyeOff + '<span></span>');
        this.segHide.lastElementChild.textContent = Lang.t('ui.roleHide');
        this.segSeek = hsuiBtn('', seg, HSUI_ICON.search + '<span></span>');
        this.segSeek.lastElementChild.textContent = Lang.t('ui.roleSeek');
        this._bind(this.segHide, () => this.setRole('hider'));
        this._bind(this.segSeek, () => this.setRole('seeker'));
        const pw = hsuiEl('div', 'hs-a bottom', main);
        pw.style.setProperty('--d', '4');
        this.playBtn = hsuiBtn('hs-btn hs-play hs-shine', pw, HSUI_ICON.play + '<span class="t"></span>');
        this.playBtn.lastElementChild.textContent = Lang.t('ui.play');
        this.playBtn.style.setProperty('--sd', '.4s');
        this._bind(this.playBtn, () => this._play());
        const bw = hsuiEl('div', 'hs-a bottom', main);
        bw.style.setProperty('--d', '5');
        this.baseBtn = hsuiBtn('hs-btn yellow hs-basebtn hs-shine', bw, HSUI_ICON.base + '<span class="t"></span>');
        this.baseBtn.lastElementChild.textContent = Lang.t('ui.base');
        this.baseBtn.style.setProperty('--sd', '1.6s');
        this.baseBdg = hsuiEl('span', 'bdg', this.baseBtn, '<img src="assets/ui/steal/coin.svg" alt=""><i></i>');
        this.baseBdg.hidden = true;
        this._bind(this.baseBtn, () => this._openBase());
        this._setSeg();
    },

    _setSeg() {
        const seek = this.role === 'seeker';
        this.seg.classList.toggle('seek', seek);
        this.segHide.classList.toggle('on', !seek);
        this.segSeek.classList.toggle('on', seek);
        if (this.mMain) this.mMain.classList.toggle('seek', seek);
        if (seek) this._seekFill();
    },

    /** Брейнрот-искатель: выбранный из найденных, иначе искатель карты. */
    _seekCur() {
        const G = /** @type {any} */ (hsuiGame()), C = hsuiCollect();
        let id = G && G.save ? G.save.seekerBr : '';
        try { if (!(id && C && C.found(id))) id = ''; } catch (e) { id = ''; }
        return id || this._mapInfo().seeker;
    },

    /** Полоса «за кого искать»: найденные брейнроты (Game.collect.codex()), выбор — Game.setSeekerBrainrot(id). */
    _seekFill() {
        const box = this.seekBox;
        if (!box) return;
        const C = hsuiCollect(), G = /** @type {any} */ (hsuiGame());
        let list = [];
        try { list = C ? C.codex().filter(x => x.found) : []; } catch (e) { list = []; }
        const chosen = G && G.save ? G.save.seekerBr || '' : '';
        const cur = this._seekCur();
        const key = list.map(x => x.id).join(',') + '|' + chosen + '|' + cur + '|' + Lang.code;
        if (key === this._seekKey) return;
        this._seekKey = key;
        box.name.textContent = hsuiBr(cur).name;
        box.none.hidden = list.length > 0;
        box.row.hidden = list.length === 0;
        box.row.innerHTML = '';
        for (const it of list) {
            const b = hsuiBtn('hs-sp-chip ' + hsuiRarCls(it.rarity) + (chosen === it.id ? ' sel' : ''), box.row);
            b.setAttribute('aria-label', it.name);
            b.title = it.name;
            b.style.setProperty('--rc', hsuiRar(it.rarity).color);
            hsuiIcon(it.icon, b, hsuiRar(it.rarity).color, 'br');
            hsuiEl('i', 'tk', b, HSUI_ICON.check);
            this._bind(b, () => {
                let ok = false;
                try { ok = !!(G && typeof G.setSeekerBrainrot === 'function' && G.setSeekerBrainrot(it.id)); } catch (e) { ok = false; }
                if (ok) { hsuiSfx('equip'); this._seekKey = ''; this._seekFill(); this._menuFillMap(); }
            }, false);
        }
        const sel = box.row.querySelector('.sel');
        if (sel && sel.scrollIntoView) setTimeout(() => { try { sel.scrollIntoView({ block: 'nearest', inline: 'center' }); } catch (e) { /* не критично */ } }, 30);
    },

    /** «Моя база»: перейти на базу (Game.openBase). */
    _openBase() {
        const G = /** @type {any} */ (hsuiGame());
        if (!G || typeof G.openBase !== 'function') { this._shake(this.baseBtn); hsuiSfx('error'); return; }
        try { const r = G.openBase(); if (r && typeof r.catch === 'function') r.catch(e => console.error('openBase:', e)); } catch (e) { console.error('openBase:', e); }
    },

    /** Накопленное на базе (бейдж на кнопке «Моя база»). */
    _baseBadge() {
        if (!this.baseBdg) return;
        const C = hsuiCollect();
        let bank = 0;
        try { bank = C && typeof C.base === 'function' ? C.base().bank | 0 : 0; } catch (e) { bank = 0; }
        const key = bank > 0 ? hsuiCompact(bank) : '';
        if (this.baseBdg.dataset.k === key) return;
        this.baseBdg.dataset.k = key;
        this.baseBdg.hidden = !key;
        if (key) this.baseBdg.lastElementChild.textContent = key;
    },

    setRole(role) {
        if (this.role === role) return;
        this.role = role;
        try { Store.set(GAME_ID + '.role', role); } catch (e) { /* без хранилища */ }
        this._setSeg();
        const G = hsuiGame();
        // Game.setRole меняет роль сразу, пересобирает персонажа и мгновенно наводит камеру
        try { if (G && typeof G.setRole === 'function') G.setRole(role); } catch (e) { /* без Game */ }
    },

    _play() {
        const G = hsuiGame();
        if (!G || typeof G.play !== 'function') return;
        G.play(this.role);
    },

    _mapInfo() {
        const G = hsuiGame();
        if (G && typeof G.mapInfo === 'function') { try { return G.mapInfo(); } catch (e) { /* ниже запасной */ } }
        const i = G && G.save ? G.save.mapIndex | 0 : 0, m = HS_MAPS[i] || HS_MAPS[0];
        return { index: i, total: HS_MAPS.length, id: m.id, name: hsText(m.name), color: m.color, seeker: m.seeker };
    },

    _levelInfo() {
        const G = hsuiGame();
        if (G && typeof G.levelInfo === 'function') { try { return G.levelInfo(); } catch (e) { /* ниже запасной */ } }
        return { level: 1, xp: 0, need: 100, frac: 0 };
    },

    _wallet(anim) {
        if (this._hold) return;
        const coins = hsuiCoins(), gems = hsuiGems(), on = hsuiAdsOn();
        for (const c of [this.mCoin, this.shCoin, this.dgCoin, this.whCoin, this.rCoin, this.cxCoin, this.ivCoin, this.bCoin]) if (c) { c.set(coins, anim); if (c.plus) c.plus.hidden = !on; }
        for (const c of [this.mGem, this.shGem, this.dgGem, this.whGem, this.rGem, this.cxGem, this.ivGem, this.bGem]) if (c) { c.set(gems, anim); if (c.plus) c.plus.hidden = !on; }
    },

    /** Билетик карты: номер, имя, искатель (в режиме «Искать» — выбранный брейнрот, иначе искатель карты). */
    _menuFillMap() {
        const mi = this._mapInfo();
        const col = mi.color || '#c2ff4a';
        this.menu_el.style.setProperty('--mc', col);
        this.mNum.textContent = hsuiPad2((mi.index | 0) + 1);
        this.mName.textContent = hsuiName(mi.name).toUpperCase();
        const sk = hsuiBr(this.role === 'seeker' ? this._seekCur() : mi.seeker);
        this.mSub.textContent = Lang.t('ui.seeker') + ': ' + sk.name;
        this.mSeekIc.innerHTML = '';
        hsuiIcon(sk.icon, this.mSeekIc, hsuiRar(sk.rarity).color, 'br');
    },

    _menuFill() {
        const lv = this._levelInfo();
        this._menuFillMap();
        this.mLvl.textContent = Lang.t('ui.level', { n: lv.level });
        this.mBar.style.setProperty('--f', hsuiClamp(lv.frac || 0, 0, 1).toFixed(3));
        this._wallet(false);
        this._setSeg();
        this._baseBadge();
    },

    menu(show) {
        if (!this.root) return;
        this._menuWanted = !!show;
        if (show) {
            if (this._hudOn) this.hud(false);
            if (this._baseOn) this.baseHud(false);
            this._resultHide(true);
            // окно подарка или колеса, которое Game открыл раньше меню, остаётся: меню вернётся по закрытии
            if (this._open === 'daily' || this._open === 'wheel') { this._from = 'menu'; this._menuFill(); this._menuHide(true); return; }
            this._closeWindows(true);
            const G = hsuiGame();
            if (G && (G.role === 'hider' || G.role === 'seeker') && G.role !== this.role) {
                this.role = G.role;
                try { Store.set(GAME_ID + '.role', this.role); } catch (e) { /* без хранилища */ }
            }
            this._seekKey = '';
            this._menuFill();
            requestAnimationFrame(() => hsuiFitLabels(this.root));
            this._show(this.menu_el, true);
            this._badges();
        } else this._menuHide(false);
    },

    _menuHide(fast) {
        if (!this.menu_el) return;
        if (fast) { clearTimeout(this._timers.get(this.menu_el)); this.menu_el.classList.remove('on', 'in', 'out'); }
        else this._show(this.menu_el, false);
    },

    /** Общее обновление после любой смены сохранения (событие hs-save). */
    refresh() {
        if (!this.root) return;
        this._wallet(true);
        if (this.menu_el.classList.contains('on')) {
            const lv = this._levelInfo();
            this.mLvl.textContent = Lang.t('ui.level', { n: lv.level });
            this.mBar.style.setProperty('--f', hsuiClamp(lv.frac || 0, 0, 1).toFixed(3));
        }
        if (this._open === 'shop') this._shopRefresh();
        if (this._open === 'settings') this._setRefresh();
        if (this._open === 'daily' && !this._hold) this._dailyFill();
        if (this._open === 'codex') this._cxFill();
        if (this._open === 'inv') this._ivRefresh();
        this._badges();
    },

    // =====================================================================================
    // Реклама: общий тик, «+» у кошелька, полёт монет, окно награды
    // =====================================================================================

    _tk: 0,
    _hold: false,
    _holdT: 0,
    _pop: null,
    _prz: null,
    _offerRec: null,

    /** Раз в 0.5 с и по паузе между rewarded: подписи «Через N с», таймеры, значки на кнопках меню. */
    _startTicker() {
        if (this._tk) return;
        this._tk = window.setInterval(() => this._tick(), 500);
        try { if (typeof Platform !== 'undefined' && typeof Platform.onRewardedCooldown === 'function') Platform.onRewardedCooldown(() => this._tick()); } catch (e) { /* без платформы */ }
        document.addEventListener('pointerdown', e => {
            const p = this._pop;
            if (!p) return;
            const t = /** @type {Node} */ (e.target);
            if (!p.el.contains(t) && !(p.anchorBtn && p.anchorBtn.contains(t))) this._popClose();
        }, true);
    },

    _tick() {
        if (!this.root) return;
        try {
            const o = this._open;
            if (o === 'shop') this._shopRefresh();
            else if (o === 'daily') this._dailyFill();
            else if (o === 'wheel') this._wheelRefresh();
            else if (o === 'codex') this._cxFill();
            else if (o === 'inv') this._ivRefresh();
            this._popRefresh();
            this._offerRefresh();
            this._badges();
            this._x2Refresh();
        } catch (e) { console.error('GameUI: обновление окон:', e); }
    },

    /** Красные точки на «Подарок» и «Колесо», плюсы у кошелька — по готовности рекламы. */
    _badges() {
        const on = hsuiAdsOn();
        for (const c of this._counters) if (c.plus) c.plus.hidden = !on;
        if (!this.menu_el || !this.menu_el.classList.contains('on')) return;
        let g = 0, w = 0;
        try { if (typeof DailyGift !== 'undefined' && DailyGift._rewards && DailyGift._rewards.length && !DailyGift.tutorialActive()) g = DailyGift.badge(); } catch (e) { /* не готов */ }
        try { if (typeof Wheel !== 'undefined' && Wheel._sectors && Wheel._sectors.length > 1) w = Wheel.badge(); } catch (e) { /* не готов */ }
        for (const [b, n] of [[this.btnGift, g], [this.btnWheel, w]]) if (b) { b.dot.hidden = !n; b.el.classList.toggle('attn', !!n); }
        this._baseBadge();
    },

    /** Кошелёк не обновляется, пока показывается награда: число растёт, когда монеты долетают. */
    _holdWallet(on) {
        clearTimeout(this._holdT);
        this._hold = !!on;
        if (on) this._holdT = window.setTimeout(() => { this._hold = false; this._wallet(true); }, 15000);
    },

    _shake(el) {
        if (!el) return;
        el.classList.remove('hs-shake'); void el.offsetWidth; el.classList.add('hs-shake');
    },

    /** Красная (good — зелёная, neutral — серая) подсказка на 2.6 с. */
    _hintOn(el, text, kind) {
        if (!el) return;
        el.textContent = text;
        el.classList.toggle('good', kind === 'good');
        el.classList.toggle('neutral', kind === 'neutral');
        el.classList.add('on');
        const old = this._timers.get(el);
        if (old) clearTimeout(old);
        this._timers.set(el, window.setTimeout(() => { el.classList.remove('on'); this._timers.delete(el); }, 2600));
    },

    /** Счётчики того окна, что сейчас на экране: куда летят монеты. */
    _curCounters() {
        const o = this._open;
        if (o === 'daily') return { coin: this.dgCoin, gem: this.dgGem };
        if (o === 'wheel') return { coin: this.whCoin, gem: this.whGem };
        if (o === 'shop') return { coin: this.shCoin, gem: this.shGem };
        if (o === 'codex') return { coin: this.cxCoin, gem: this.cxGem };
        if (o === 'inv') return { coin: this.ivCoin, gem: this.ivGem };
        if (this._baseOn) return { coin: this.bCoin, gem: this.bGem };
        if (this._resultOn && !this._menuWanted) return { coin: this.rCoin, gem: this.rGem };
        return { coin: this.mCoin, gem: this.mGem };
    },

    /** Монеты или кристаллы вылетают из прямоугольника from и влетают в счётчик target; onLand — когда все долетели. */
    _fly(icon, from, target, n, onLand) {
        const el = target && target.el ? target.el : target;
        const done = () => { if (onLand) onLand(); };
        if (!this.root || !el || typeof el.getBoundingClientRect !== 'function' || typeof Element.prototype.animate !== 'function') { done(); return; }
        const t = el.getBoundingClientRect();
        if (!(t.width > 0)) { done(); return; }
        const rr = this.root.getBoundingClientRect();
        const sx = from.left + from.width / 2 - rr.left, sy = from.top + from.height / 2 - rr.top;
        const ex = t.left + Math.min(t.width * 0.3, 30 * this.u) - rr.left, ey = t.top + t.height / 2 - rr.top;
        n = hsuiReduced() ? Math.min(3, n) : Math.max(1, Math.min(12, n));
        let landed = 0;
        for (let i = 0; i < n; i++) {
            const c = hsuiEl('i', 'hs-fly', this.fxl);
            c.style.backgroundImage = "url('" + icon + "')";
            const ang = Math.random() * Math.PI * 2, rad = (20 + Math.random() * 46) * this.u;
            const mx = sx + Math.cos(ang) * rad, my = sy + Math.sin(ang) * rad - 20 * this.u;
            const an = c.animate([
                { transform: 'translate(' + sx + 'px,' + sy + 'px) scale(.4)', opacity: 0 },
                { transform: 'translate(' + mx + 'px,' + my + 'px) scale(1.15)', opacity: 1, offset: 0.3 },
                { transform: 'translate(' + ex + 'px,' + ey + 'px) scale(.6)', opacity: 1, offset: 0.92 },
                { transform: 'translate(' + ex + 'px,' + ey + 'px) scale(.3)', opacity: 0 },
            ], { duration: 950, delay: i * 55, easing: 'cubic-bezier(.45,0,.55,1)', fill: 'both' });
            const fin = () => { c.remove(); if (++landed === n) done(); };
            an.onfinish = fin;
            an.oncancel = fin;
        }
    },

    /** Всплеск звёздочек из центра элемента. */
    _burst(el, n, colors) {
        if (!this.root || !el || typeof Element.prototype.animate !== 'function') return;
        const rr = this.root.getBoundingClientRect(), r = el.getBoundingClientRect();
        const cx = r.left - rr.left + r.width / 2, cy = r.top - rr.top + r.height / 2;
        const cols = colors && colors.length ? colors : ['#ffe45c', '#ffffff', '#7ff0ff', '#ff9fd2', '#c2ff4a'];
        n = hsuiReduced() ? 5 : (n || 18);
        for (let i = 0; i < n; i++) {
            const s = hsuiEl('i', 'hs-bst', this.fxl);
            s.style.setProperty('--c', cols[i % cols.length]);
            s.style.setProperty('--z', (0.6 + Math.random() * 0.9).toFixed(2));
            const a = Math.random() * Math.PI * 2, d = (46 + Math.random() * 90) * this.u;
            const x1 = cx + Math.cos(a) * d, y1 = cy + Math.sin(a) * d - 18 * this.u;
            const an = s.animate([
                { transform: 'translate(' + cx + 'px,' + cy + 'px) scale(.2) rotate(0deg)', opacity: 1 },
                { transform: 'translate(' + x1 + 'px,' + y1 + 'px) scale(1) rotate(160deg)', opacity: 1, offset: 0.55 },
                { transform: 'translate(' + x1 + 'px,' + (y1 + 46 * this.u) + 'px) scale(.2) rotate(320deg)', opacity: 0 },
            ], { duration: 750 + Math.random() * 400, easing: 'cubic-bezier(.2,.8,.3,1)', fill: 'forwards' });
            an.onfinish = () => s.remove();
            an.oncancel = () => s.remove();
        }
    },

    // ---- «+» у кошелька: что даёт, за что, одна кнопка ----

    /** @param {'coins'|'gems'} kind @param {HsCounter} counter */
    _adPop(kind, counter) {
        if (this._pop && this._pop.kind === kind && this._pop.anchor === counter.el) { this._popClose(); return; }
        this._popClose();
        const gems = kind === 'gems';
        const el = hsuiEl('div', 'hs-pop hs-panel', this.root);
        const row = hsuiEl('div', 'row', el);
        hsuiImg(gems ? 'assets/ui/steal/gem.svg' : 'assets/ui/steal/coin.svg', 'pi', row);
        const pt = hsuiEl('div', 'pt', row);
        const t1 = hsuiEl('b', 'hs-o', pt);
        t1.style.setProperty('--s', '1.5px');
        const t2 = hsuiEl('small', '', pt);
        const n = hsuiAdAmount(kind);
        t1.textContent = '+' + hsuiFmt(n) + ' ' + Lang.t(gems ? 'ui.popGems' : 'ui.popCoins');
        t2.textContent = Lang.t('ui.popSub');
        const btn = hsuiBtn('hs-btn hs-shine', el, HSUI_ICON.playG + '<span class="t hs-o" style="--s:2px"></span>');
        const hint = hsuiEl('div', 'hs-hint', el);
        this._bind(btn, () => this._popGo(), false);
        this._pop = { kind, el, btn, hint, anchor: counter.el, anchorBtn: counter.plus, busy: false, key: '' };
        const rr = this.root.getBoundingClientRect(), a = counter.el.getBoundingClientRect();
        const w = el.offsetWidth || 300 * this.u;
        const left = hsuiClamp(a.right - rr.left - w + 10 * this.u, 8, Math.max(8, this.W - w - 8));
        el.style.left = left.toFixed(0) + 'px';
        el.style.top = (a.bottom - rr.top + 12 * this.u).toFixed(0) + 'px';
        this._popRefresh();
    },

    _popClose() {
        const p = this._pop;
        if (!p) return;
        this._pop = null;
        p.el.remove();
    },

    _popRefresh() {
        const p = this._pop;
        if (!p) return;
        if (!p.anchor.getClientRects().length) { this._popClose(); return; }
        const wait = hsuiAdWait(), ready = hsuiAdReady() && !p.busy;
        const text = p.busy ? Lang.t('ui.adRunning') : wait ? wait.toUpperCase() : Lang.t('ui.watchAd');
        const key = text + '|' + ready;
        if (p.key === key) return;
        p.key = key;
        p.btn.lastElementChild.textContent = text;
        p.btn.classList.toggle('off', !ready);
        p.btn.querySelector('svg').style.display = wait ? 'none' : '';
    },

    async _popGo() {
        const p = this._pop, a = hsuiAds();
        if (!p || p.busy || !a) return;
        if (!hsuiAdReady()) { this._shake(p.btn); return; }
        p.busy = true;
        this._holdWallet(true);
        this._popRefresh();
        let r = null;
        try { r = await (p.kind === 'gems' ? a.gems() : a.coins()); } catch (e) { r = null; }
        p.busy = false;
        if (r && r.ok) {
            const n = r.amount | 0, from = p.el.getBoundingClientRect();
            const gems = p.kind === 'gems';
            hsuiSfx('buy');
            if (this._pop === p) this._popClose();
            this._flyReward(gems ? 'gems' : 'coins', n, from, gems ? this._curCounters().gem : this._curCounters().coin);
        } else {
            this._holdWallet(false);
            if (this._pop === p) {
                this._popRefresh();
                this._hintOn(p.hint, Lang.t(r && (r.reason === 'cooldown' || r.reason === 'busy') ? 'ui.adNone' : 'ui.adFail'));
            }
        }
    },

    /** Награда валютой: «+N» над местом, монеты летят в счётчик, число растёт по прилёту. */
    _flyReward(kind, n, from, counter) {
        const gems = kind === 'gems';
        const icon = gems ? 'assets/ui/steal/gem.svg' : 'assets/ui/steal/coin.svg';
        const rr = this.root.getBoundingClientRect();
        if (n > 0) this.floatText(from.left + from.width / 2 - rr.left, from.top + from.height / 2 - rr.top, '+' + hsuiFmt(n), gems ? 'gem' : 'coin');
        this._fly(icon, from, counter, Math.min(12, 4 + Math.floor(n / 40)), () => {
            this._holdWallet(false);
            this._wallet(true);
            if (counter && counter.bump) counter.bump();
        });
    },

    // ---- окно награды (подарок дня, колесо) ----

    /**
     * @param {{ title?: string, items: Array<{ kind: 'coins'|'gems'|'item', amount?: number, id?: string, note?: string }>, note?: string, onClose?: () => void }} o
     */
    _prize(o) {
        this._prizeClose(true);
        const S = hsuiShop();
        const el = hsuiEl('div', 'hs-prize', this.root);
        hsuiEl('div', 'rays', el);
        const card = hsuiEl('div', 'hs-panel hs-pz-card', el);
        hsuiBig((o.title || Lang.t('ui.got')).toUpperCase(), 'hs-pz-title', card);
        const row = hsuiEl('div', 'hs-pz-row', card);
        let notes = '';
        o.items.forEach((it, k) => {
            const box = hsuiEl('div', 'hs-pz-it', row);
            box.style.setProperty('--k', String(k));
            const big = hsuiEl('div', 'big', box);
            if (it.kind === 'item') {
                const item = S ? S.item(it.id) : null;
                const col = hsuiRar(item ? item.rarity : 'common').color;
                box.style.setProperty('--rc', col);
                box.classList.add(hsuiRarCls(item ? item.rarity : 'common'));
                hsuiIcon(item ? item.icon : '', big, col, item ? item.tab : '');
                hsuiEl('small', '', box).textContent = S ? S.name(it.id) : String(it.id);
                if (item) hsuiEl('span', 'hs-rr rr', box).textContent = hsuiRarName(item.rarity);
            } else {
                box.classList.add(it.kind === 'gems' ? 'gem' : 'coin');
                hsuiImg(it.kind === 'gems' ? 'assets/ui/steal/gem.svg' : 'assets/ui/steal/coin.svg', '', big);
                const b = hsuiEl('b', 'hs-o', box);
                b.style.setProperty('--s', '2px');
                b.textContent = '+' + hsuiFmt(it.amount || 0);
            }
            if (it.note) notes = it.note;
        });
        if (notes || o.note) hsuiEl('div', 'hs-pz-note', card).textContent = o.note || notes;
        const btn = hsuiBtn('hs-btn hs-shine', card, '<span class="t hs-o" style="--s:2px"></span>');
        btn.lastElementChild.textContent = Lang.t('ui.gotIt');
        this._bind(btn, () => this._prizeClose(false), false);
        this._prz = { el, o, card };
        hsuiSfx('buy');
        window.setTimeout(() => { if (this._prz && this._prz.el === el) this._burst(card, 22); }, 120);
    },

    /** Закрыть окно награды; монеты и кристаллы летят в счётчик окна под ним. */
    _prizeClose(silent) {
        const p = this._prz;
        if (!p) return;
        this._prz = null;
        const from = p.card.getBoundingClientRect();
        p.el.remove();
        const cn = this._curCounters();
        if (silent) { this._holdWallet(false); this._wallet(true); return; }
        hsuiSfx('click');
        let coins = 0, gems = 0;
        for (const it of p.o.items) { if (it.kind === 'coins') coins += it.amount || 0; else if (it.kind === 'gems') gems += it.amount || 0; }
        let pend = (coins > 0 ? 1 : 0) + (gems > 0 ? 1 : 0);
        const land = () => { if (--pend <= 0) { this._holdWallet(false); this._wallet(true); } };
        if (coins > 0) this._fly('assets/ui/steal/coin.svg', from, cn.coin, Math.min(12, 4 + Math.floor(coins / 40)), () => { if (cn.coin) cn.coin.bump(); land(); });
        if (gems > 0) this._fly('assets/ui/steal/gem.svg', from, cn.gem, Math.min(8, 3 + Math.floor(gems / 4)), () => { if (cn.gem) cn.gem.bump(); land(); });
        if (pend <= 0) { this._holdWallet(false); this._wallet(true); }
        try { if (p.o.onClose) p.o.onClose(); } catch (e) { console.error(e); }
    },

    /** got из DailyGift.claim()/Wheel.finish() -> карточки награды (валюта суммируется). */
    _gotItems(got, extraGems) {
        let coins = 0, gems = extraGems | 0, conv = false;
        const items = [];
        for (const g of got || []) {
            if (!g) continue;
            if (g.type === 'coins') { coins += g.amount | 0; if (g.converted) conv = true; }
            else if (g.type === 'gems') gems += g.amount | 0;
            else if ((g.type === 'item' || g.type === 'exclusive') && g.id) items.push({ kind: /** @type {'item'} */ ('item'), id: g.id });
        }
        const out = [];
        if (coins > 0) out.push({ kind: /** @type {'coins'} */ ('coins'), amount: coins, note: conv ? Lang.t('ui.dup') : '' });
        if (gems > 0) out.push({ kind: /** @type {'gems'} */ ('gems'), amount: gems });
        return out.concat(items);
    },

    // =====================================================================================
    // Магазин: 6 вкладок каталога (HS_SHOP_TABS) и «Усиления»
    // =====================================================================================

    _shopState: { tab: 'skin', sel: {} },
    _shopBusy: false,
    _peekOn: false,
    _unShop: null,

    _tabList() {
        const tabs = hsuiShopTabs();
        tabs.push({ id: 'power', name: Lang.t('ui.tab.power') });
        return tabs;
    },

    _buildShop() {
        const win = hsuiEl('div', 'hs-screen hs-win hs-shop', this.root);
        this.shop_el = win;
        const pn = hsuiEl('div', 'hs-panel hs-shopwin hs-a', win);
        pn.style.setProperty('--d', '0');
        this.shopPanel = pn;
        const head = hsuiEl('div', 'hs-sh-head', pn);
        hsuiBig(Lang.t('ui.shop'), 'hs-sh-title', head);
        const wal = hsuiEl('div', 'hs-sh-wallet', head);
        this.shCoin = this._counter(wal, 'assets/ui/steal/coin.svg', '', 'coins');
        this.shGem = this._counter(wal, 'assets/ui/steal/gem.svg', '', 'gems');
        const close = hsuiBtn('hs-tool close', head, '<div class="ic">' + HSUI_ICON.closeX + '</div>');
        close.setAttribute('aria-label', Lang.t('ui.close'));
        this._bind(close, () => this.closeShop());
        const tabs = hsuiEl('div', 'hs-tabs', pn);
        this.shTabs = {};
        for (const t of this._tabList()) {
            const b = hsuiBtn('hs-tab', tabs, (HSUI_TABIC[t.id] || HSUI_ICON.grid) + '<span></span>');
            b.lastElementChild.textContent = t.name.toUpperCase();
            b.setAttribute('aria-label', t.name);
            this._bind(b, () => this._shopTab(t.id));
            this.shTabs[t.id] = b;
        }
        this.shBody = hsuiEl('div', 'hs-sh-body', pn);
        // нижняя панель режима «на сцене»
        const pk = hsuiEl('div', 'hs-panel hs-peek', win);
        const back = hsuiBtn('hs-btn navy back', pk, HSUI_ICON.arrowL + '<span class="t"></span>');
        back.lastElementChild.textContent = Lang.t('ui.back');
        this._bind(back, () => this._peek(false));
        const info = hsuiEl('div', 'pi', pk);
        const pnm = hsuiEl('div', 'pn hs-o', info);
        pnm.style.setProperty('--s', '1.5px');
        const prr = hsuiEl('div', 'hs-rr pr', info);
        const pact = hsuiBtn('hs-btn hs-shine', pk);
        this._bind(pact, () => this._shopAct(this._shopState.sel[this._shopState.tab]), false);
        const phint = hsuiEl('div', 'hs-hint', pk);
        this.peek = { el: pk, nm: pnm, rr: prr, act: pact, hint: phint };
        // клик по затемнению мимо панели
        win.addEventListener('click', e => {
            if (e.target !== win) return;
            if (win.classList.contains('peek')) this._peek(false); else this.closeShop();
        });
    },

    /** from: 'menu' | 'result' — куда вернуться при закрытии. */
    openShop(tab, from) {
        if (!this.root) return;
        if (!this.shop_el) this._buildShop();
        this._shopSub();
        this._popClose();
        this._from = from || 'menu';
        this._open = 'shop';
        if (from === 'result') this._show(this.result_el, false); else this._menuHide(false);
        this._wallet(false);
        const map = { seekers: 'seeker', skins: 'skin' };
        const id = map[tab] || tab;
        this._peek(false);
        this._shopTab(this.shTabs[id] ? id : (this._shopState.tab || 'skin'), true);
        this._show(this.shop_el, true);
        hsuiSfx('whoosh');
    },

    closeShop() {
        if (this._open !== 'shop') return;
        this._open = '';
        this._peek(false);
        this._popClose();
        this._show(this.shop_el, false);
        this._gPreviewReset();
        this._back();
    },

    /** Вернуться на экран, с которого открыли окно. */
    _back() {
        if (this._from === 'result' && this._resultOn) { this._show(this.result_el, true); this._resultReplayLight(); }
        else if (this._menuWanted) { this._menuFill(); this._show(this.menu_el, true); }
        // с базы окно закрывается к самой базе: HUD базы остаётся на месте
    },

    _closeWindows(fast) {
        this._open = '';
        this._popClose();
        this._prizeClose(true);
        this._peekOn = false;
        this._ivPause(false);
        for (const el of [this.shop_el, this.set_el, this.daily_el, this.wheel_el, this.codex_el, this.inv_el]) {
            if (!el) continue;
            el.classList.remove('peek');
            if (fast) { clearTimeout(this._timers.get(el)); el.classList.remove('on', 'in', 'out'); } else this._show(el, false);
        }
    },

    /** Shop.init сбрасывает слушателей, поэтому подписываемся при каждом открытии. */
    _shopSub() {
        try {
            if (this._unShop) this._unShop();
            this._unShop = typeof Shop !== 'undefined' ? Shop.on(() => { if (this._open === 'shop') this._shopRefresh(); }) : null;
        } catch (e) { this._unShop = null; }
    },

    /** Предпросмотр предмета на 3D-сцене меню. */
    _gPreview(id) {
        const G = /** @type {any} */ (hsuiGame());
        if (!G) return;
        try {
            if (typeof G.shopPreview === 'function') G.shopPreview(id);
            else if (typeof G.setMenuPreview === 'function') {
                const S = hsuiShop(), it = S ? S.item(id) : null;
                if (it && (it.tab === 'skin' || it.tab === 'seeker')) G.setMenuPreview(it.tab, id);
            }
        } catch (e) { /* предпросмотр не обязателен */ }
    },

    /** Вернуть на сцену надетое. */
    _gPreviewReset() {
        const G = /** @type {any} */ (hsuiGame());
        if (!G) return;
        try {
            if (typeof G.shopPreview === 'function') G.shopPreview(null);
            else if (typeof G.setMenuPreview === 'function' && G.shop && G.shop.equipped) {
                const kind = this.role === 'seeker' ? 'seeker' : 'skin';
                G.setMenuPreview(kind, G.shop.equipped(kind));
            }
        } catch (e) { /* предпросмотр не обязателен */ }
    },

    /** Режим «на сцене»: окно прячется, виден 3D-герой, снизу — купить / надеть и «Назад». */
    _peek(on) {
        const w = this.shop_el;
        if (!w) return;
        on = !!on && this._shopState.tab !== 'power';
        this._peekOn = on;
        w.classList.toggle('peek', on);
        if (on) this._peekFill(this._model());
    },

    _tabSel(tab) { return this._shopState.sel[tab]; },

    _shopTab(tab, quiet) {
        const st = this._shopState;
        st.tab = tab;
        for (const id of Object.keys(this.shTabs)) this.shTabs[id].classList.toggle('on', id === tab);
        const S = hsuiShop();
        const body = this.shBody;
        body.innerHTML = '';
        body.className = 'hs-sh-body' + (tab === 'power' ? ' power' : '');
        this.cards = [];
        this.pcards = [];
        this.prev = null;
        const grid = hsuiEl('div', 'hs-sh-grid', body);
        this.shGrid = grid;
        if (tab === 'power') {
            HS_POWERUPS.forEach((it, i) => this._mkPower(grid, it, i));
            this._gPreviewReset();
        } else {
            const models = S ? S.cards(tab) : [];
            if (!models.length) {
                hsuiEl('div', 'hs-sh-empty', grid).textContent = Lang.t(S ? 'ui.empty' : 'ui.shopSoon');
                this._shopRefresh();
                return;
            }
            if (!st.sel[tab] || !models.some(m => m.id === st.sel[tab])) {
                const eq = models.find(m => m.equipped);
                st.sel[tab] = eq ? eq.id : models[0].id;
            }
            models.forEach((m, i) => this._mkCard(grid, tab, m, i));
            this._mkPrev(body);
            this._selectItem(st.sel[tab], !!quiet);
            const cur = this.cards.find(c => c.id === st.sel[tab]);
            if (cur) setTimeout(() => cur.el.scrollIntoView({ block: 'nearest' }), 60);
        }
        this._shopRefresh();
    },

    _model(id) {
        const S = hsuiShop();
        if (!S) return null;
        const st = this._shopState;
        return S.card(id || st.sel[st.tab]);
    },

    _mkCard(grid, tab, m, i) {
        const r = hsuiRar(m.rarity);
        const el = hsuiBtn('hs-card r-' + (m.rarity || 'common'), grid);
        el.style.setProperty('--rc', r.color);
        el.style.setProperty('--rca', hsuiRgba(r.color, m.rarity === 'common' ? 0.28 : 0.5));
        el.style.setProperty('--i', String(Math.min(i, 14)));
        hsuiEl('span', 'nm', el).textContent = m.name;
        hsuiEl('span', 'hs-rr rr', el).textContent = hsuiRarName(m.rarity);
        const im = hsuiEl('span', 'im', el);
        hsuiIcon(m.item.icon, im, r.color, tab);
        const lk = hsuiEl('span', 'lk', el, HSUI_ICON.lock);
        hsuiEl('i', 'rd', el);   // метка редкости: в низком альбомном вместо пилюли
        if (m.rarity && m.rarity !== 'common') {
            const sp = hsuiEl('span', 'sp', el);
            for (let k = 0; k < 3; k++) {
                const s = hsuiEl('i', 'hs-spk', sp);
                s.style.setProperty('--x', (14 + ((k * 37 + i * 11) % 70)) + '%');
                s.style.setProperty('--y', (26 + ((k * 23 + i * 7) % 40)) + '%');
                s.style.setProperty('--z', (0.9 + k * 0.35).toFixed(2));
                s.style.setProperty('--t', (1.8 + k * 0.5).toFixed(1) + 's');
                s.style.setProperty('--dl', (-(k * 0.7 + i * 0.2)).toFixed(1) + 's');
            }
            if (m.rarity !== 'rare') { hsuiEl('span', 'shn', el); el.style.setProperty('--sd', (-(i % 5)) + 's'); }
        }
        const st = hsuiEl('span', 'st', el);
        const rec = { id: m.id, el, st, lk, tab, key: '' };
        this.cards.push(rec);
        this._bind(el, () => this._selectItem(m.id, false), true);
        el.addEventListener('dblclick', () => { const c = this._model(m.id); if (c && c.action === 'equip') this._shopAct(m.id); });
    },

    _cardFill(c, m) {
        c.el.classList.toggle('sel', c.id === this._shopState.sel[c.tab]);
        const key = [m.state, m.kind, m.progress, m.need, m.affordable ? 1 : 0].join('|');
        if (c.key === key) return;
        c.key = key;
        c.el.classList.toggle('locked', !m.owned);
        c.lk.hidden = m.owned;
        const st = c.st;
        st.className = 'st';
        st.innerHTML = '';
        st.style.removeProperty('--p');
        if (m.equipped) { st.classList.add('eq'); st.innerHTML = HSUI_ICON.check + '<span></span>'; st.lastElementChild.textContent = Lang.t('ui.wearing'); }
        else if (m.owned) { st.classList.add('own'); st.innerHTML = HSUI_ICON.check + '<span></span>'; st.lastElementChild.textContent = Lang.t('ui.bought'); }
        else if (m.kind === 'coins') {
            hsuiImg('assets/ui/steal/coin.svg', '', st);
            hsuiEl('span', '', st).textContent = hsuiFmt(m.price);
            st.classList.toggle('cant', !m.affordable);
        } else if (m.kind === 'ads') {
            st.classList.add('ad');
            st.style.setProperty('--p', (m.need ? m.progress / m.need : 0).toFixed(3));
            hsuiEl('i', '', st);
            hsuiEl('span', '', st).textContent = Lang.t('ui.adProg', { a: m.progress, b: m.need });
        } else if (m.kind === 'exclusive') {
            st.classList.add('ex');
            st.innerHTML = HSUI_ICON.gift + '<span></span>';
            st.lastElementChild.textContent = Lang.t('ui.exclusive');
        }
    },

    _mkPrev(body) {
        const pv = hsuiEl('div', 'hs-prev hs-a', body);
        pv.style.setProperty('--d', '2');
        const nm = hsuiEl('div', 'hs-prev-name hs-o', pv);
        nm.style.setProperty('--s', '2px');
        const kind = hsuiEl('div', 'hs-prev-kind', pv);
        const kt = hsuiEl('span', '', kind);
        const rr = hsuiEl('span', 'hs-rr rr', kind);
        const stage = hsuiEl('div', 'hs-stage', pv);
        hsuiEl('div', 'hs-glow', stage);
        const pf = hsuiEl('div', 'hs-platform', stage);
        hsuiEl('i', '', pf);
        const img = hsuiEl('div', 'hs-prev-img', stage);
        for (let k = 0; k < 6; k++) {
            const s = hsuiEl('i', 'hs-spk', stage);
            s.style.setProperty('--x', (10 + k * 15) + '%');
            s.style.setProperty('--y', (14 + ((k * 31) % 60)) + '%');
            s.style.setProperty('--z', (1 + (k % 3) * 0.5).toFixed(2));
            s.style.setProperty('--t', (1.6 + k * 0.3).toFixed(1) + 's');
            s.style.setProperty('--dl', (-k * 0.5).toFixed(1) + 's');
        }
        const state = hsuiEl('div', 'hs-prev-state', stage);
        const nl = hsuiBtn('hs-nav l', stage, HSUI_ICON.arrowL);
        const nr = hsuiBtn('hs-nav r', stage, HSUI_ICON.arrowR);
        nl.setAttribute('aria-label', Lang.t('ui.prev')); nr.setAttribute('aria-label', Lang.t('ui.next'));
        this._bind(nl, () => this._step(-1));
        this._bind(nr, () => this._step(1));
        const eye = hsuiBtn('hs-eye', stage, HSUI_ICON.eye);
        eye.setAttribute('aria-label', Lang.t('ui.peek'));
        eye.title = Lang.t('ui.peek');
        this._bind(eye, () => this._peek(true));
        const price = hsuiEl('div', 'hs-prev-price hs-o', pv);
        price.style.setProperty('--s', '2px');
        const hint = hsuiEl('div', 'hs-hint', pv);
        const adc = hsuiBtn('hs-btn yellow hs-prev-ad', pv);
        adc.hidden = true;
        this._bind(adc, () => this._prevAdCoins(adc, hint), false);
        const act = hsuiBtn('hs-btn hs-act hs-shine', pv);
        this._bind(act, () => this._shopAct(this._shopState.sel[this._shopState.tab]), false);
        this.prev = { el: pv, nm, kt, rr, img, price, hint, act, adc, state, stage, imgId: '', priceKey: '', adcKey: '' };
    },

    _step(d) {
        const list = this.cards;
        if (!list.length) return;
        const st = this._shopState;
        const i = list.findIndex(x => x.id === st.sel[st.tab]);
        const n = list[(i + d + list.length) % list.length];
        this._selectItem(n.id, false);
        n.el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    },

    _selectItem(id, quiet) {
        const st = this._shopState, tab = st.tab;
        st.sel[tab] = id;
        for (const c of this.cards) c.el.classList.toggle('sel', c.id === id);
        this._prevFill(!quiet);
        this._gPreview(id);
    },

    _prevFill(swap) {
        const p = this.prev, m = this._model();
        if (!p || !m) return;
        const r = hsuiRar(m.rarity);
        p.el.style.setProperty('--rc', r.color);
        p.el.style.setProperty('--rca', hsuiRgba(r.color, m.rarity === 'common' ? 0.32 : 0.6));
        for (const k of HSUI_RAR_ORDER) p.el.classList.toggle('r-' + k, k === m.rarity);
        p.nm.textContent = m.name;
        const tab = this._tabList().find(t => t.id === m.tab);
        p.kt.textContent = tab ? tab.name : '';
        p.rr.textContent = hsuiRarName(m.rarity);
        if (p.imgId !== m.id) {
            p.imgId = m.id;
            p.priceKey = ''; p.adcKey = ''; p.actKey = '';
            p.img.innerHTML = '';
            hsuiIcon(m.item.icon, p.img, r.color, m.tab);
            p.el.querySelectorAll('.hs-stage .hs-spk').forEach(s => { /** @type {HTMLElement} */ (s).style.display = m.rarity === 'common' ? 'none' : ''; });
            p.hint.classList.remove('on');
            if (swap) { p.img.classList.remove('swap'); void p.img.offsetWidth; p.img.classList.add('swap'); }
        }
        this._prevState();
    },

    /** Состояние выбранного: плашка, цена или прогресс, подсказка, кнопки. Каждую секунду — без лишних перерисовок. */
    _prevState() {
        const p = this.prev, m = this._model();
        if (!p || !m) return;
        // плашка: закрыто / куплено / надето
        const sk = m.equipped ? 'eq' : m.owned ? 'own' : 'lock';
        if (p.stateKey !== sk) {
            p.stateKey = sk;
            p.state.className = 'hs-prev-state ' + sk;
            p.state.innerHTML = (sk === 'lock' ? HSUI_ICON.lock : HSUI_ICON.check) + '<span></span>';
            p.state.lastElementChild.textContent = Lang.t(sk === 'eq' ? 'ui.wearing' : sk === 'own' ? 'ui.bought' : 'ui.locked');
        }
        // цена или прогресс
        const pk = [m.id, m.state, m.kind, m.progress, m.need, m.affordable ? 1 : 0].join('|');
        if (p.priceKey !== pk) {
            const was = p.priceKey.split('|');
            p.priceKey = pk;
            p.price.innerHTML = '';
            p.price.className = 'hs-prev-price hs-o';
            p.price.hidden = m.owned;   // куплено / надето уже сказано плашкой на иконке и кнопкой
            if (m.owned) { /* цена не нужна */ }
            else if (m.kind === 'coins') {
                hsuiImg('assets/ui/steal/coin.svg', '', p.price);
                hsuiEl('span', '', p.price).textContent = hsuiFmt(m.price);
                p.price.classList.toggle('cant', !m.affordable);
            } else if (m.kind === 'ads') {
                p.price.classList.add('ad');
                p.price.style.setProperty('--p', (m.need ? m.progress / m.need : 0).toFixed(3));
                hsuiEl('span', '', p.price).textContent = Lang.t('ui.adProg', { a: m.progress, b: m.need });
                const bar = hsuiEl('div', 'bar', p.price);
                hsuiEl('i', '', bar);
                if (was[0] === m.id && was[3] !== String(m.progress)) { void p.price.offsetWidth; p.price.classList.add('bump'); }
            } else if (m.kind === 'exclusive') {
                p.price.classList.add('ex');
                p.price.innerHTML = HSUI_ICON.gift + '<span></span>';
                p.price.lastElementChild.textContent = Lang.t('ui.exclusive');
            }
        }
        // подсказка: нет денег, «Через N с», реклама недоступна (не для эксклюзива: там это не ошибка)
        let hintText = m.kind === 'exclusive' ? '' : (m.hint || '');
        if (m.action === 'watch' && /\d/.test(m.actionLabel || '')) hintText = '';   // «Через N с» уже на кнопке
        if (!this._timers.get(p.hint)) {
            p.hint.textContent = hintText;
            p.hint.classList.toggle('on', !!hintText);
            p.hint.classList.remove('good', 'neutral');
        }
        // «+монеты за рекламу», когда не хватает на предмет
        const showAd = m.kind === 'coins' && !m.owned && !m.affordable && hsuiAdsOn();
        const wait = hsuiAdWait(), ready = hsuiAdReady();
        const ak = showAd + '|' + wait + '|' + ready;
        if (p.adcKey !== ak) {
            p.adcKey = ak;
            p.adc.hidden = !showAd;
            if (showAd) {
                const n = hsuiAdAmount('coins');
                p.adc.innerHTML = (wait ? '' : HSUI_ICON.playY) + '<img src="assets/ui/steal/coin.svg" alt=""><span class="t"></span>';
                p.adc.lastElementChild.textContent = wait ? wait.toUpperCase() : Lang.t('ui.coinsAd', { n: hsuiFmt(n) }).toUpperCase();
                p.adc.classList.toggle('off', !ready);
            }
        }
        this._actApply(p.act, m, 'hs-btn hs-act hs-shine', p);
        this._peekFill(m);
    },

    /** Что показать на главной кнопке по модели карточки. */
    _actCfg(m) {
        if (this._shopBusy || m.busy) return { text: Lang.t('ui.adRunning'), cls: 'off busy', icon: '' };
        if (m.action === 'buy') return { text: Lang.t('ui.buy'), cls: m.enabled ? '' : 'off', icon: HSUI_ICON.cart };
        if (m.action === 'watch') {
            const wait = /\d/.test(m.actionLabel || '') ? m.actionLabel : '';
            return { text: wait ? wait.toUpperCase() : Lang.t('ui.watchAd'), cls: 'yellow' + (m.enabled ? '' : ' off'), icon: m.enabled ? HSUI_ICON.playY : '' };
        }
        if (m.action === 'equip') return { text: Lang.t('ui.wear'), cls: 'blue', icon: m.tab === 'skin' ? HSUI_ICON.shirt : HSUI_ICON.check };
        if (m.action === 'unequip') return { text: Lang.t('ui.unequip'), cls: 'navy', icon: '' };
        if (m.equipped) return { text: Lang.t('ui.wearing'), cls: 'eq', icon: HSUI_ICON.check };
        if (m.kind === 'exclusive') return { text: Lang.t('ui.exclusive'), cls: 'yellow', icon: HSUI_ICON.gift };
        return { text: '', cls: 'off', icon: '' };
    },

    _actApply(btn, m, base, store) {
        const c = this._actCfg(m);
        const key = c.text + '|' + c.cls + '|' + (c.icon ? 1 : 0) + '|' + m.id;
        const holder = store || btn;
        if (holder.actKey === key) return;
        holder.actKey = key;
        btn.className = base + (c.cls ? ' ' + c.cls : '');
        const big = btn.classList.contains('hs-act') || btn.classList.contains('hs-peek-act');
        btn.innerHTML = c.icon + '<span class="t" style="--s:' + (big ? 2 : 1.5) + 'px"></span>';
        btn.lastElementChild.textContent = c.text;
        btn.setAttribute('aria-disabled', /off/.test(c.cls) ? 'true' : 'false');
    },

    _peekFill(m) {
        const pk = this.peek;
        if (!pk || !this._peekOn || !m) return;
        const r = hsuiRar(m.rarity);
        pk.el.style.setProperty('--rc', r.color);
        for (const k of HSUI_RAR_ORDER) pk.el.classList.toggle('r-' + k, k === m.rarity);
        pk.nm.textContent = m.name;
        pk.rr.textContent = hsuiRarName(m.rarity);
        this._actApply(pk.act, m, 'hs-btn hs-shine hs-peek-act', pk);
        pk.hint.textContent = m.kind === 'exclusive' ? '' : (m.hint || '');
        pk.hint.classList.toggle('on', !!pk.hint.textContent);
    },

    _shopRefresh() {
        if (!this.shBody) return;
        this._wallet(true);
        if (this._shopState.tab === 'power') { for (const pc of this.pcards || []) this._powerFill(pc); return; }
        const S = hsuiShop();
        if (!S) return;
        for (const c of this.cards || []) { const m = S.card(c.id); if (m) this._cardFill(c, m); }
        this._prevState();
    },

    /** Нажатие главной кнопки: купить / открыть за рекламу / надеть / снять. */
    async _shopAct(id) {
        const S = hsuiShop();
        if (!S || !id || this._shopBusy) return;
        const m = S.card(id);
        if (!m) return;
        if (m.action === 'none') { if (m.kind === 'exclusive') { this.closeShop(); this.dailyOpen(); } return; }
        if (!m.enabled) { this._shopDenied(m); return; }
        hsuiSfx('click');
        this._shopBusy = true;
        this._prevState();
        let r = null;
        try { r = await S.act(id); } catch (e) { console.error('Shop.act:', e); r = { ok: false, reason: 'error' }; }
        this._shopBusy = false;
        const p = this.prev;
        if (r && r.ok) {
            const stage = p ? p.stage : null;
            if (m.action === 'buy') { hsuiSfx('buy'); if (p) this._buyFx(p.el); this._burst(stage || this.shop_el, 14); }
            else if (m.action === 'watch') {
                if (r.unlocked) {
                    hsuiSfx('buy');
                    if (p) { p.el.classList.remove('flash'); void p.el.offsetWidth; p.el.classList.add('flash'); this._hintOn(p.hint, Lang.t('ui.opened'), 'good'); }
                    this._burst(stage || this.shop_el, 26);
                } else { hsuiSfx('equip'); if (p) { p.price.classList.remove('bump'); void p.price.offsetWidth; p.price.classList.add('bump'); } this._burst(stage || this.shop_el, 8); }
            } else { hsuiSfx('equip'); if (p) { p.el.classList.remove('flash'); void p.el.offsetWidth; p.el.classList.add('flash'); } }
        } else if (r) {
            const rs = r.reason;
            if (rs === 'noCoins') this._shopDenied(m);
            else if (rs === 'busy' || rs === 'owned' || rs === 'none') { /* ничего: состояние обновится */ }
            else if (rs === 'cooldown') { /* «Через N с» уже на кнопке */ }
            else if (p) this._hintOn(p.hint, rs === 'adUnavailable' ? Shop.t('shop.adUnavailable') : rs === 'adFailed' ? Lang.t('ui.adFail') : Lang.t('ui.noBuy'));
            if (this.peek && this._peekOn && rs === 'adFailed') this._hintOn(this.peek.hint, Lang.t('ui.adFail'));
        }
        if (this._open === 'shop') this._shopRefresh();
    },

    /** Нет денег / реклама недоступна: кнопка трясётся, красная подсказка. */
    _shopDenied(m) {
        const p = this.prev;
        hsuiSfx('error');
        const text = m.kind === 'coins' ? Lang.t('ui.needCoins', { n: hsuiFmt(Math.max(1, m.price - hsuiCoins())) }) : (m.hint || Lang.t('ui.adNone'));
        if (p) { this._shake(p.act); this._hintOn(p.hint, text); }
        if (this.peek && this._peekOn) { this._shake(this.peek.act); this._hintOn(this.peek.hint, text); }
        if (m.kind === 'coins' && this.shCoin) this.shCoin.bump();
    },

    /** «+монеты за рекламу» под ценой, когда не хватает. */
    async _prevAdCoins(btn, hint) {
        const a = hsuiAds();
        if (!a || this._shopBusy) return;
        if (!hsuiAdReady()) { this._shake(btn); return; }
        this._shopBusy = true;
        btn.classList.add('off');
        this._holdWallet(true);
        let r = null;
        try { r = await a.coins(); } catch (e) { r = null; }
        this._shopBusy = false;
        if (r && r.ok) {
            hsuiSfx('buy');
            const from = btn.getBoundingClientRect();
            this._flyReward('coins', r.amount | 0, from, this.shCoin);
        } else { this._holdWallet(false); this._hintOn(hint, Lang.t('ui.adFail')); }
        if (this._open === 'shop') { if (this.prev) this.prev.adcKey = ''; this._shopRefresh(); }
    },

    /** Покупка: вспышка и монеты, улетающие из кошелька к товару. */
    _buyFx(target) {
        target.classList.remove('flash'); void target.offsetWidth; target.classList.add('flash');
        if (!this.root || typeof target.animate !== 'function' || !this.shCoin) return;
        const rr = this.root.getBoundingClientRect(), a = this.shCoin.el.getBoundingClientRect(), b = target.getBoundingClientRect();
        const sx = a.left - rr.left + a.width * 0.2, sy = a.top - rr.top + a.height / 2;
        const ex = b.left - rr.left + b.width / 2, ey = b.top - rr.top + b.height * 0.45;
        const n = hsuiReduced() ? 4 : 9;
        for (let i = 0; i < n; i++) {
            const c = hsuiEl('i', 'hs-fly', this.fxl);
            const ang = (i / n) * Math.PI * 2, rad = (26 + (i % 3) * 14) * this.u;
            const mx = ex + Math.cos(ang) * rad, my = ey + Math.sin(ang) * rad;
            const an = c.animate([
                { transform: 'translate(' + sx + 'px,' + sy + 'px) scale(.5)', opacity: 0 },
                { transform: 'translate(' + (sx + (mx - sx) * 0.35) + 'px,' + (sy + (my - sy) * 0.35 - 30 * this.u) + 'px) scale(1.2)', opacity: 1, offset: 0.3 },
                { transform: 'translate(' + mx + 'px,' + my + 'px) scale(1)', opacity: 1, offset: 0.7 },
                { transform: 'translate(' + (mx + Math.cos(ang) * 40 * this.u) + 'px,' + (my - 80 * this.u) + 'px) scale(.3)', opacity: 0 },
            ], { duration: 900, delay: i * 40, easing: 'ease-out', fill: 'both' });
            an.onfinish = () => c.remove();
            an.oncancel = () => c.remove();
        }
    },

    // ---- усиления (расходники) ----

    _mkPower(grid, it, i) {
        const r = hsuiRar(it.rarity);
        const el = hsuiEl('div', 'hs-pcard', grid);
        el.style.setProperty('--rc', r.color);
        el.style.setProperty('--rca', hsuiRgba(r.color, 0.5));
        el.style.setProperty('--i', String(i));
        hsuiEl('h3', 'hs-o', el).textContent = hsText(it.name);
        hsuiEl('p', '', el).textContent = hsText(it.desc);
        const stg = hsuiEl('div', 'stg', el);
        hsuiEl('div', 'hs-glow', stg);
        const pf = hsuiEl('div', 'hs-platform', stg);
        hsuiEl('i', '', pf);
        const pi = hsuiEl('div', 'pi', stg, HSUI_POWER_IC[it.id] || HSUI_ICON.bolt);
        const pk = hsuiEl('div', 'pk', el);
        hsuiEl('span', 'hs-o', pk).textContent = Lang.t('ui.pack', { n: it.pack || 1 });
        const have = hsuiEl('span', 'have', pk);
        const pr = hsuiEl('div', 'pr hs-o', el);
        pr.style.setProperty('--s', '1.5px');
        const hint = hsuiEl('div', 'hs-hint', el);
        const buy = hsuiBtn('hs-btn hs-shine', el, HSUI_ICON.cart + '<span class="t hs-o" style="--s:2px"></span>');
        buy.lastElementChild.textContent = Lang.t('ui.buy');
        const ad = hsuiBtn('hs-btn yellow ad', el, HSUI_ICON.playY + '<span class="t hs-o" style="--s:1.5px"></span>');
        const rec = { it, el, have, pr, hint, buy, ad, haveN: -1, key: '' };
        this.pcards.push(rec);
        this._bind(buy, () => this._buyPower(rec), false);
        this._bind(ad, () => this._adPower(rec), false);
    },

    _powerFill(pc) {
        const G = /** @type {any} */ (hsuiGame()), n = G && G.save && G.save.power ? G.save.power[pc.it.id] | 0 : 0;
        const price = pc.it.price && pc.it.price.coins ? pc.it.price.coins : 0;
        const can = hsuiCoins() >= price;
        const wait = hsuiAdWait(), ready = hsuiAdReady(), on = hsuiAdsOn();
        const key = [n, price, can, wait, ready, on].join('|');
        if (pc.key === key) return;
        const bump = pc.haveN >= 0 && n > pc.haveN;
        pc.key = key; pc.haveN = n;
        pc.have.textContent = Lang.t('ui.have', { n });
        if (bump) { pc.have.classList.remove('bump'); void pc.have.offsetWidth; pc.have.classList.add('bump'); }
        pc.pr.innerHTML = '';
        hsuiImg('assets/ui/steal/coin.svg', '', pc.pr);
        hsuiEl('span', '', pc.pr).textContent = hsuiFmt(price);
        pc.pr.classList.toggle('cant', !can);
        pc.buy.classList.toggle('off', !can);
        pc.ad.hidden = !on;
        pc.ad.classList.toggle('off', !ready);
        pc.ad.innerHTML = (wait ? '' : HSUI_ICON.playY) + '<span class="t hs-o" style="--s:1.5px"></span>';
        pc.ad.lastElementChild.textContent = wait ? wait.toUpperCase() : Lang.t('ui.forAd') + ' ' + Lang.t('ui.pack', { n: pc.it.pack || 1 });
    },

    _buyPower(pc) {
        const G = /** @type {any} */ (hsuiGame());
        hsuiSfx('click');
        let r = null;
        try { r = G && G.shop && G.shop.buyPowerup ? G.shop.buyPowerup(pc.it.id) : null; } catch (e) { r = null; }
        if (r && r.ok) { hsuiSfx('buy'); this._buyFx(pc.el); this._burst(pc.el, 12); this._shopRefresh(); }
        else {
            hsuiSfx('error');
            this._shake(pc.buy);
            const price = pc.it.price && pc.it.price.coins ? pc.it.price.coins : 0;
            this._hintOn(pc.hint, hsuiCoins() < price ? Lang.t('ui.needCoins', { n: hsuiFmt(price - hsuiCoins()) }) : Lang.t('ui.noBuy'));
            if (this.shCoin) this.shCoin.bump();
        }
    },

    async _adPower(pc) {
        const a = hsuiAds();
        if (!a || this._shopBusy) return;
        if (!hsuiAdReady()) { this._shake(pc.ad); return; }
        this._shopBusy = true;
        pc.ad.classList.add('off');
        let r = null;
        try { r = await a.powerup(pc.it.id); } catch (e) { r = null; }
        this._shopBusy = false;
        if (r && r.ok) { hsuiSfx('buy'); this._burst(pc.el, 14); pc.el.classList.remove('flash'); void pc.el.offsetWidth; pc.el.classList.add('flash'); }
        else this._hintOn(pc.hint, Lang.t(r && r.reason === 'cooldown' ? 'ui.adNone' : 'ui.adFail'));
        pc.key = '';
        if (this._open === 'shop') this._shopRefresh();
    },

    // =====================================================================================
    // Подарок дня (7 дней)
    // =====================================================================================

    _dgBusy: false,

    /** Награда дня (монеты, кристаллы, предмет, случайный предмет) — плашки с иконками. mult 2 — с удвоением. */
    _chipsInto(parent, rw, mult) {
        const S = hsuiShop(), m = mult || 1;
        if (rw.coins > 0) {
            const c = hsuiEl('div', 'rc coin', parent);
            hsuiImg('assets/ui/steal/coin.svg', '', c);
            hsuiEl('b', '', c).textContent = hsuiFmt(rw.coins * m);
        }
        if (rw.gems > 0) {
            const c = hsuiEl('div', 'rc gem', parent);
            hsuiImg('assets/ui/steal/gem.svg', '', c);
            hsuiEl('b', '', c).textContent = hsuiFmt(rw.gems * m);
        }
        if (rw.item) {
            const it = S ? S.item(rw.item) : null;
            const c = hsuiEl('div', 'rc item', parent);
            hsuiIcon(it ? it.icon : '', c, it ? hsuiRar(it.rarity).color : '#8fb6d9', it ? it.tab : '');
        }
        if (rw.randomItems > 0) {
            const n = rw.randomItems * m;
            const c = hsuiEl('div', 'rc', parent, HSUI_ICON.giftQ);
            if (n > 1) hsuiEl('b', '', c).textContent = '×' + n;
        }
    },

    _buildDaily() {
        const win = hsuiEl('div', 'hs-screen hs-win hs-dg-win', this.root);
        this.daily_el = win;
        const pn = hsuiEl('div', 'hs-panel hs-dgwin hs-a', win);
        pn.style.setProperty('--d', '0');
        const head = hsuiEl('div', 'hs-dg-head', pn);
        hsuiBig(Lang.t('ui.dg.title'), 'hs-dg-title', head);
        const wal = hsuiEl('div', 'hs-sh-wallet', head);
        this.dgCoin = this._counter(wal, 'assets/ui/steal/coin.svg', '');
        this.dgGem = this._counter(wal, 'assets/ui/steal/gem.svg', '');
        const close = hsuiBtn('hs-tool close', head, '<div class="ic">' + HSUI_ICON.closeX + '</div>');
        close.setAttribute('aria-label', Lang.t('ui.close'));
        this._bind(close, () => this.closeDaily());
        const body = hsuiEl('div', 'hs-dg-body', pn);
        const days = hsuiEl('div', 'hs-dg-days', body);
        this.dgDays = [];
        for (let d = 1; d <= 6; d++) {
            const el = hsuiEl('div', 'hs-dg-day', days);
            el.style.setProperty('--i', String(d - 1));
            const t = hsuiEl('div', 'dt', el);
            const r = hsuiEl('div', 'dr', el);
            const s = hsuiEl('div', 'ds', el);
            hsuiEl('div', 'ck', el, HSUI_ICON.check);
            this.dgDays.push({ el, t, r, s, key: '' });
        }
        const g = hsuiEl('div', 'hs-dg-goal', body);
        const gt = hsuiEl('div', 'gt', g);
        const gs = hsuiEl('div', 'gs', g);
        hsuiEl('div', 'rays', gs);
        const gi = hsuiEl('div', 'gi', gs);
        const gn = hsuiEl('div', 'gn hs-o', g);
        gn.style.setProperty('--s', '1.5px');
        const gh = hsuiEl('div', 'gh', g);
        const gds = hsuiEl('div', 'ds', g);
        this.dgGoal = { el: g, gt, gs, gi, gn, gh, ds: gds, key: '' };
        const foot = hsuiEl('div', 'hs-dg-foot', pn);
        this.dgClaim = hsuiBtn('hs-btn hs-shine hs-dg-claim', foot, '<span class="t hs-o" style="--s:2px"></span>');
        this.dgX2 = hsuiBtn('hs-btn yellow hs-shine hs-dg-x2', foot);
        this._bind(this.dgClaim, () => this._dailyClaim(), false);
        this._bind(this.dgX2, () => this._dailyX2(), false);
        this.dgNext = hsuiEl('div', 'hs-dg-next', pn);
        this.dgHint = hsuiEl('div', 'hs-hint', pn);
        this.dgX2Key = '';
        win.addEventListener('click', e => { if (e.target === win) this.closeDaily(); });
    },

    /** Открыть окно подарка дня. false — нельзя сейчас (туториал, идёт раунд, другое окно, модуль не готов). */
    dailyOpen() {
        if (!this.root) return false;
        const D = typeof DailyGift !== 'undefined' ? DailyGift : null;
        if (!D || !D._rewards || !D._rewards.length) return false;
        try { if (typeof Tutorial !== 'undefined' && Tutorial.active) return false; } catch (e) { /* без туториала */ }
        if (this._hudOn) return false;
        if (this._open === 'daily') return true;
        if (this._open) return false;
        if (!this.daily_el) this._buildDaily();
        this._popClose();
        this._from = this._resultOn && !this._menuWanted ? 'result' : 'menu';
        this._open = 'daily';
        if (this._from === 'result') this._show(this.result_el, false); else this._menuHide(false);
        this._wallet(false);
        this._dgBusy = false;
        this.dgX2Key = '';
        this._dailyFill(true);
        this._show(this.daily_el, true);
        try { D.markOffered(); } catch (e) { /* не критично */ }
        hsuiSfx('whoosh');
        return true;
    },

    closeDaily() {
        if (this._open !== 'daily' || this._dgBusy || this._prz) return;
        this._open = '';
        this._show(this.daily_el, false);
        this._back();
    },

    _dailyFill(force) {
        const D = typeof DailyGift !== 'undefined' ? DailyGift : null;
        if (!D || !this.daily_el || this._open !== 'daily') return;
        let v = null;
        try { v = D.view(); } catch (e) { return; }
        const S = hsuiShop();
        const days = v.days;
        for (let i = 0; i < 6; i++) {
            const d = days[i], c = this.dgDays[i];
            if (!d || !c) continue;
            const key = d.state + '|' + JSON.stringify(d.reward) + '|' + Lang.code;
            if (!force && c.key === key) continue;
            c.key = key;
            c.el.className = 'hs-dg-day ' + d.state;
            c.t.textContent = d.dayLabel.toUpperCase();
            c.r.innerHTML = '';
            this._chipsInto(c.r, d.reward, 1);
            const label = d.state === 'today' ? Lang.t('ui.dg.today') : d.state === 'tomorrow' ? Lang.t('ui.dg.tomorrow') : d.state === 'claimed' ? Lang.t('ui.dg.got') : '';
            c.s.textContent = label;
            c.s.hidden = !label;
        }
        // 7-й день: эксклюзивный скин — цель
        const g7 = days[6], G = this.dgGoal;
        if (g7 && G) {
            const skinId = g7.skin || v.goal || '';
            const key = g7.state + '|' + skinId + '|' + (g7.reward.coins || 0) + '|' + v.nextDay + '|' + v.canClaim;
            if (force || G.key !== key) {
                G.key = key;
                G.el.className = 'hs-dg-goal ' + g7.state;
                const it = skinId && S ? S.item(skinId) : null;
                const col = hsuiRar(it ? it.rarity : 'mythic').color;
                G.el.style.setProperty('--rc', col);
                G.el.style.setProperty('--rca', hsuiRgba(col, 0.5));
                G.gt.innerHTML = '';
                hsuiEl('span', 'hs-o', G.gt).textContent = g7.dayLabel.toUpperCase();
                hsuiEl('b', 'hs-o', G.gt).textContent = Lang.t(it ? 'ui.dg.excl' : 'ui.dg.big');
                G.gi.innerHTML = '';
                G.gn.hidden = false;
                if (it) {
                    hsuiIcon(it.icon, G.gi, col, it.tab);
                    G.gn.textContent = S.name(skinId);
                    G.gh.textContent = Lang.t('ui.dg.goalSub');
                } else {
                    const big = hsuiEl('div', 'big hs-o', G.gi);
                    hsuiImg('assets/ui/steal/coin.svg', '', big);
                    hsuiEl('span', '', big).textContent = hsuiFmt(g7.reward.coins || 0);
                    G.gn.textContent = Lang.t('ui.dg.big');
                    G.gh.textContent = '';
                }
                let left = 0;
                if (g7.state !== 'claimed') { left = v.canClaim ? 7 - v.nextDay : 8 - v.nextDay; }
                G.ds.textContent = g7.state === 'today' ? Lang.t('ui.dg.today') : g7.state === 'claimed' ? Lang.t('ui.dg.got') : g7.state === 'tomorrow' ? Lang.t('ui.dg.tomorrow') : Lang.t('ui.dg.in', { n: Math.max(1, left) });
            }
        }
        // кнопки
        const can = !!v.canClaim, busy = this._dgBusy;
        const ck = can + '|' + busy;
        if (force || this.dgClaimKey !== ck) {
            this.dgClaimKey = ck;
            this.dgClaim.classList.toggle('off', !can || busy);
            this.dgClaim.lastElementChild.textContent = can ? Lang.t('ui.dg.claim') : Lang.t('ui.dg.done');
        }
        const x2 = v.x2;
        const showX2 = can && x2.available;
        this.dgX2.hidden = !showX2;
        if (showX2) {
            const wait = x2.label !== D.t('daily.claimX2') ? x2.label : '';
            const today = days.find(d => d.state === 'today');
            const off = !x2.enabled || busy;
            const k = [wait, off, busy, JSON.stringify(today ? today.reward : 0)].join('|');
            if (force || this.dgX2Key !== k) {
                this.dgX2Key = k;
                this.dgX2.classList.toggle('off', off);
                this.dgX2.innerHTML = '';
                const row = hsuiEl('div', 'row', this.dgX2, (wait ? '' : HSUI_ICON.playY) + '<span class="t hs-o" style="--s:1.5px"></span>');
                row.lastElementChild.textContent = busy ? Lang.t('ui.adRunning') : wait ? wait.toUpperCase() : Lang.t('ui.dg.x2');
                if (!wait && today) {
                    const sub = hsuiEl('div', 'sub', this.dgX2);
                    const rw = today.reward;
                    if (rw.coins > 0) { const s = hsuiEl('span', '', sub); hsuiImg('assets/ui/steal/coin.svg', '', s); hsuiEl('b', '', s).textContent = hsuiFmt(rw.coins * 2); }
                    if (rw.gems > 0) { const s = hsuiEl('span', '', sub); hsuiImg('assets/ui/steal/gem.svg', '', s); hsuiEl('b', '', s).textContent = hsuiFmt(rw.gems * 2); }
                    if (rw.randomItems > 0) { const s = hsuiEl('span', '', sub, HSUI_ICON.giftQ); hsuiEl('b', '', s).textContent = '×' + (rw.randomItems * 2); }
                }
            }
        }
        this.dgNext.textContent = can ? '' : Lang.t('ui.dg.next', { t: D.formatTime(v.msToNext) });
        // пояснение (день 7: «без удвоения»; нет рекламы), пока нет временной ошибки
        if (!this._timers.get(this.dgHint)) {
            const wait = x2.label !== D.t('daily.claimX2') ? x2.label : '';
            const ht = can ? (x2.hint && x2.hint !== wait ? x2.hint : '') : '';
            this.dgHint.textContent = ht;
            this.dgHint.classList.toggle('on', !!ht);
            this.dgHint.classList.add('neutral');
        }
    },

    _dailyClaim() {
        const D = DailyGift;
        if (this._dgBusy) return;
        let can = false;
        try { can = D.canClaim(); } catch (e) { can = false; }
        if (!can) { this._shake(this.dgClaim); return; }
        this._dgBusy = true;
        this._holdWallet(true);
        let r = null;
        try { r = D.claim(); } catch (e) { console.error('DailyGift.claim:', e); r = null; }
        this._dgBusy = false;
        if (!r || !r.ok) { this._holdWallet(false); this._dailyFill(true); return; }
        this._dailyDone(r);
    },

    async _dailyX2() {
        const D = DailyGift;
        if (this._dgBusy) return;
        let v = null;
        try { v = D.view(); } catch (e) { return; }
        if (!v.x2.enabled) { this._shake(this.dgX2); hsuiSfx('error'); return; }
        this._dgBusy = true;
        this._holdWallet(true);
        this._dailyFill(true);
        let r = null;
        try { r = await D.claimX2(); } catch (e) { console.error('DailyGift.claimX2:', e); r = null; }
        this._dgBusy = false;
        if (r && r.ok) { this._dailyDone(r); return; }
        this._holdWallet(false);
        this.dgX2Key = '';
        this._dailyFill(true);
        const rs = r ? r.reason : '';
        if (rs === 'claimed') return;
        this._hintOn(this.dgHint, rs === 'adFailed' ? Lang.t('ui.adFail').replace(/ Прогресс.*$/, '') + ' ' + (Lang.code === 'en' ? 'You can still claim the gift.' : 'Подарок можно забрать без неё.') : Lang.t('ui.adNone'), 'neutral');
    },

    _dailyDone(r) {
        this.dgX2Key = '';
        this._dailyFill(true);
        hsuiSfx('equip');
        this._prize({ title: Lang.t('ui.got'), items: this._gotItems(r.got, r.reward && r.reward.gems ? r.reward.gems * (r.mult || 1) : 0), note: r.mult === 2 ? 'x2' : '' });
    },

    // =====================================================================================
    // Колесо фортуны
    // =====================================================================================

    _whBusy: false,
    _whAngle: 0,

    _buildWheel() {
        const win = hsuiEl('div', 'hs-screen hs-win hs-wh-win', this.root);
        this.wheel_el = win;
        const pn = hsuiEl('div', 'hs-panel hs-whwin hs-a', win);
        pn.style.setProperty('--d', '0');
        const head = hsuiEl('div', 'hs-wh-head', pn);
        hsuiBig(Lang.t('ui.wh.title'), 'hs-wh-title', head);
        const wal = hsuiEl('div', 'hs-sh-wallet', head);
        this.whCoin = this._counter(wal, 'assets/ui/steal/coin.svg', '');
        this.whGem = this._counter(wal, 'assets/ui/steal/gem.svg', '');
        const close = hsuiBtn('hs-tool close', head, '<div class="ic">' + HSUI_ICON.closeX + '</div>');
        close.setAttribute('aria-label', Lang.t('ui.close'));
        this._bind(close, () => this.closeWheel());
        const area = hsuiEl('div', 'hs-wh-area', pn);
        const stage = hsuiEl('div', 'hs-wh-stage', area);
        this.whStage = stage;
        hsuiEl('div', 'hs-wh-rim', stage);
        this.whDisk = hsuiEl('div', 'hs-wh-disk', stage);
        hsuiEl('div', 'hs-wh-hub', stage);
        this.whPtr = hsuiEl('div', 'hs-wh-ptr', stage, '<svg viewBox="0 0 48 56"><path d="M24 54L5.6 21C-.6 9.6 7.6 1.6 24 1.6s24.6 8 18.4 19.4z" fill="#f0348f" stroke="' + HSUI_K + '" stroke-width="4.4" stroke-linejoin="round"/><path d="M24 48L10 22C6 13 12 6 24 6z" fill="#ff9fd2"/><circle cx="24" cy="19" r="6.5" fill="#fff" stroke="' + HSUI_K + '" stroke-width="2.4"/></svg>');
        const side = hsuiEl('div', 'hs-wh-side', pn);
        this.whInfo = hsuiEl('div', 'hs-wh-info hs-inset', side);
        this.whFree = hsuiBtn('hs-btn hs-shine', side, '<span class="t hs-o" style="--s:2px"></span>');
        this.whAd = hsuiBtn('hs-btn yellow hs-shine hs-wh-ad', side);
        this.whHint = hsuiEl('div', 'hs-hint', side);
        this._bind(this.whFree, () => this._wheelSpin('free'), false);
        this._bind(this.whAd, () => this._wheelSpin('ad'), false);
        this.whKey = '';
        win.addEventListener('click', e => { if (e.target === win) this.closeWheel(); });
    },

    wheelOpen() {
        if (!this.root) return false;
        const W = typeof Wheel !== 'undefined' ? Wheel : null;
        if (!W || !W._sectors || W._sectors.length < 2) return false;
        try { if (typeof Tutorial !== 'undefined' && Tutorial.active) return false; } catch (e) { /* без туториала */ }
        if (this._hudOn) return false;
        if (this._open === 'wheel') return true;
        if (this._open) return false;
        if (!this.wheel_el) this._buildWheel();
        this._popClose();
        this._from = this._resultOn && !this._menuWanted ? 'result' : 'menu';
        this._open = 'wheel';
        if (this._from === 'result') this._show(this.result_el, false); else this._menuHide(false);
        this._wallet(false);
        this._whBusy = false;
        this._wheelBuildDisk();
        this.whKey = '';
        this._wheelRefresh(true);
        this._show(this.wheel_el, true);
        this._wheelSize();
        hsuiSfx('whoosh');
        // вращение, чей приз ещё не выдан (вкладку закрыли): диск встаёт на сектор, приз выдаётся один раз
        try {
            const pend = W.pendingSpin();
            if (pend) {
                this._whAngle = W.angleFrom(0, pend) % 360;
                this._wheelSet(this._whAngle);
                this._wheelFinish();
            }
        } catch (e) { console.error('Wheel pending:', e); }
        return true;
    },

    closeWheel() {
        if (this._open !== 'wheel' || this._whBusy || this._prz) return;
        this._open = '';
        this._show(this.wheel_el, false);
        this._back();
    },

    /** Размер диска в px: по ширине колонки и по высоте экрана (в портрете под диском ещё кнопки). */
    _wheelSize() {
        const st = this.whStage;
        if (!st || !this.W) return;
        const aw = st.parentElement ? st.parentElement.clientWidth : 300;
        const reserve = this.portrait ? 330 * this.u : 118 * this.u;
        const ds = hsuiClamp(Math.min(aw - 12, this.H * 0.96 - reserve), 120, 600);
        st.style.setProperty('--ds', ds.toFixed(0) + 'px');
    },

    _wheelSet(a) {
        this.whDisk.style.transform = 'rotate(' + a.toFixed(2) + 'deg)';
    },

    /** Диск: секторы с призами (монеты, кристаллы, предмет — иконка), собирается заново при каждом открытии. */
    _wheelBuildDisk() {
        const W = Wheel, S = hsuiShop();
        const secs = W.sectors(), n = secs.length, step = 360 / n;
        const pal = HSUI_WHEEL_COLS;
        const disk = this.whDisk;
        disk.innerHTML = '';
        this.whDiskN = n;
        let svg = '<svg viewBox="-100 -100 200 200">';
        for (let i = 0; i < n; i++) {
            let col = pal[i % pal.length];
            if (i === n - 1 && n % pal.length === 1) col = pal[3];
            svg += '<path class="wd" data-i="' + i + '" d="' + hsuiWedge(100, (i - 0.5) * step, (i + 0.5) * step) + '" fill="' + col + '"/>';
        }
        svg += '<circle r="100" fill="url(#hsw)" pointer-events="none"/><defs><radialGradient id="hsw"><stop offset="55%" stop-color="#fff" stop-opacity="0"/><stop offset="100%" stop-color="#000" stop-opacity=".28"/></radialGradient></defs></svg>';
        disk.insertAdjacentHTML('afterbegin', svg);
        secs.forEach((s, i) => {
            const kind = s.kind === 'item' ? 'item' : (s.prize && s.prize.type === 'gems') || (s.data && s.data.gems > 0 && !(s.coins > 0)) ? 'gems' : 'coins';
            const pz = hsuiEl('div', 'hs-wh-pz' + (kind === 'item' ? ' item' : ''), disk);
            pz.style.transform = 'rotate(' + (i * step).toFixed(2) + 'deg)';
            const inn = hsuiEl('div', 'in', pz);
            if (kind === 'item') {
                const it = S ? S.item(s.itemId) : null;
                const col = hsuiRar(it ? it.rarity : 'common').color;
                pz.style.setProperty('--rc', col);
                const ring = hsuiEl('div', 'ring', inn);
                hsuiIcon(it ? it.icon : '', ring, col, it ? it.tab : '');
            } else {
                const amount = kind === 'gems' ? ((s.prize && s.prize.amount) || (s.data && s.data.gems) || 0) : (s.coins || (s.prize && s.prize.amount) || 0);
                hsuiImg(kind === 'gems' ? 'assets/ui/steal/gem.svg' : 'assets/ui/steal/coin.svg', '', inn);
                hsuiEl('b', '', inn).textContent = hsuiFmt(amount);
            }
        });
        this._wheelSet(this._whAngle);
    },

    _wheelRefresh(force) {
        const W = typeof Wheel !== 'undefined' ? Wheel : null;
        if (!W || !this.wheel_el || this._open !== 'wheel') return;
        let st = null;
        try { st = W.status(); } catch (e) { return; }
        const busy = this._whBusy;
        const wait = !st.canSpinAd ? (hsuiAdWait() || '') : '';
        const k = [st.canSpinFree, st.canSpinAd, st.nextFreeLabel, st.adLeft, st.banked, st.adLimit, wait, busy, st.hint, st.freeAvailable].join('|');
        if (!force && this.whKey === k) return;
        this.whKey = k;
        this.whInfo.innerHTML = '';
        if (st.freeAvailable) hsuiEl('b', 'hs-o', this.whInfo).textContent = Lang.t('ui.wh.ready');
        else {
            hsuiEl('span', '', this.whInfo).textContent = Lang.t('ui.wh.nextFree');
            hsuiEl('b', 'hs-o', this.whInfo).textContent = st.nextFreeLabel;
        }
        // бесплатное вращение
        const fo = !st.canSpinFree || busy;
        this.whFree.classList.toggle('off', fo);
        this.whFree.lastElementChild.textContent = busy ? Lang.t('ui.wh.spinning') : st.freeAvailable ? Lang.t('ui.wh.free') : Lang.t('ui.wh.freeIn', { t: st.nextFreeLabel });
        // вращение за рекламу
        const left = st.adLeft + st.banked;
        this.whAd.classList.toggle('off', !st.canSpinAd || busy);
        this.whAd.innerHTML = '';
        const row = hsuiEl('div', 'row', this.whAd, (wait || busy ? '' : HSUI_ICON.playY) + '<span class="t hs-o" style="--s:1.5px"></span>');
        row.lastElementChild.textContent = wait ? wait.toUpperCase() : Lang.t('ui.wh.ad');
        hsuiEl('div', 'sub', this.whAd).textContent = Lang.t('ui.wh.left', { a: left, b: st.adLimit });
        // пояснение: вращения кончились, реклама недоступна
        if (!this._timers.get(this.whHint)) {
            const ht = busy ? '' : (st.hint && st.hint !== wait ? st.hint : '');
            this.whHint.textContent = ht;
            this.whHint.classList.toggle('on', !!ht);
            this.whHint.classList.add('neutral');
        }
    },

    async _wheelSpin(kind) {
        const W = Wheel;
        if (this._whBusy) return;
        let st = null;
        try { st = W.status(); } catch (e) { return; }
        if (kind === 'free' ? !st.canSpinFree : !st.canSpinAd) { this._shake(kind === 'free' ? this.whFree : this.whAd); hsuiSfx('error'); return; }
        this._whBusy = true;
        this._holdWallet(true);
        this._wheelRefresh(true);
        let r = null;
        try { r = kind === 'ad' ? await W.spinAd() : W.spinFree(); } catch (e) { console.error('Wheel spin:', e); r = { ok: false, reason: 'error' }; }
        if (!r || !r.ok) {
            this._whBusy = false;
            this._holdWallet(false);
            this._wheelRefresh(true);
            const rs = r ? r.reason : '';
            if (rs === 'adFailed') this._hintOn(this.whHint, Lang.t('ui.adFail').replace(/ Прогресс.*$/, ''), 'neutral');
            else if (rs && rs !== 'cooldown' && rs !== 'busy') this._hintOn(this.whHint, Lang.t('ui.adNone'), 'neutral');
            return;
        }
        this.whKey = '';
        this._wheelRefresh(true);
        hsuiSfx('go');
        await this._wheelAnimate(r);
        this._wheelFinish(r);
    },

    /** Диск крутится до r.angle за r.durationMs (замедление к концу), на каждом секторе под стрелкой — щелчок. */
    _wheelAnimate(r) {
        const W = Wheel;
        const from = this._whAngle, to = W.angleFrom(from, r);
        const dur = hsuiReduced() ? Math.min(1200, r.durationMs || 5500) : (r.durationMs || 5500);
        return new Promise(resolve => {
            let t0 = 0, last = W.sectorAt(from), lastTick = 0, finished = false;
            const end = () => {
                if (finished) return;
                finished = true;
                this._whAngle = to;
                this._wheelSet(to);
                resolve(undefined);
            };
            const frame = (now) => {
                if (finished) return;
                if (!t0) t0 = now;
                const p = hsuiClamp((now - t0) / dur, 0, 1);
                const e = 1 - Math.pow(1 - p, 4);
                const a = from + (to - from) * e;
                this._wheelSet(a);
                const idx = W.sectorAt(a);
                if (idx !== last) {
                    last = idx;
                    if (now - lastTick > 70) { lastTick = now; hsuiSfx('tick'); }
                    if (this.whPtr) { this.whPtr.classList.remove('flick'); void this.whPtr.offsetWidth; this.whPtr.classList.add('flick'); }
                }
                if (p < 1) requestAnimationFrame(frame); else end();
            };
            requestAnimationFrame(frame);
            window.setTimeout(end, dur + 1200);   // запасной выход, если вкладка была скрыта
        });
    },

    /** Анимация кончилась: Wheel.finish() начисляет приз один раз, окно приза и монеты в счётчик. */
    _wheelFinish(r) {
        const W = Wheel;
        let f = null;
        try { f = W.finish(); } catch (e) { console.error('Wheel.finish:', e); }
        this._whBusy = false;
        if (!f || !f.ok) { this._holdWallet(false); this._wheelRefresh(true); return; }
        this._holdWallet(true);
        const sec = f.sector != null ? f.sector : (r ? r.sector : -1);
        const sd = W._sectors[sec];   // кристаллы сектора выдаёт Game по событию prize, в got их нет
        const gemsWon = sd && sd.gems > 0 ? sd.gems | 0 : 0;
        const wd = this.whDisk.querySelector('.wd[data-i="' + sec + '"]');
        if (wd) wd.classList.add('win');
        hsuiSfx('equip');
        this._burst(this.whDisk, 20);
        window.setTimeout(() => {
            if (wd) wd.classList.remove('win');
            this._prize({ title: Lang.t('ui.wh.win'), items: this._gotItems(f.got, gemsWon), onClose: () => { this._wheelBuildDisk(); this.whKey = ''; this._wheelRefresh(true); } });
        }, 900);
        this.whKey = '';
        this._wheelRefresh(true);
    },

    // =====================================================================================
    // Предложения посреди раунда: «Тебя поймали» и «Время вышло»
    // =====================================================================================

    /**
     * @param {'revive'|'time'} kind
     * @param {{ seconds?: number, onAccept?: () => Promise<boolean> | boolean, onDecline?: () => void }} o
     */
    offer(kind, o) {
        o = o || {};
        if (!this.root) { if (o.onDecline) o.onDecline(); return; }
        this._offerEnd(this._offerRec, 'silent');
        if (!hsuiAdsOn()) { if (o.onDecline) o.onDecline(); return; }
        kind = kind === 'time' ? 'time' : 'revive';
        const total = Math.max(3, Number(o.seconds) || 7);
        const el = hsuiEl('div', 'hs-offer ' + kind, this.root);
        const card = hsuiEl('div', 'hs-panel hs-of-card', el);
        const ring = hsuiEl('div', 'hs-of-ring', card, '<svg viewBox="0 0 100 100"><circle class="bg" cx="50" cy="50" r="46"/><circle class="tr" cx="50" cy="50" r="38"/><circle class="pg" cx="50" cy="50" r="38" stroke-dasharray="238.76" stroke-dashoffset="0"/></svg><b class="hs-o"></b>');
        const num = /** @type {HTMLElement} */ (ring.querySelector('b'));
        num.style.setProperty('--s', '2px');
        const pg = /** @type {SVGElement} */ (ring.querySelector('.pg'));
        hsuiBig(Lang.t('offer.' + kind + '.t'), 'hs-of-title', card);
        hsuiEl('div', 'hs-of-sub hs-o', card).textContent = Lang.t('offer.' + kind + '.s');
        const go = hsuiBtn('hs-btn hs-shine go', card);
        const hint = hsuiEl('div', 'hs-hint', card);
        const no = hsuiBtn('hs-of-no', card);
        no.textContent = Lang.t('offer.no');
        const rec = { kind, el, ring, num, pg, go, no, hint, total, left: total, last: performance.now(), busy: false, done: false, o, raf: 0, key: '' };
        this._offerRec = rec;
        this._bind(go, async () => {
            if (rec.done || rec.busy) return;
            if (!hsuiAdReady()) { this._shake(go); hsuiSfx('error'); return; }
            rec.busy = true;
            this._offerRefresh();
            try { if (o.onAccept) await o.onAccept(); } catch (e) { console.error('GameUI.offer onAccept:', e); }
            rec.busy = false;
            this._offerEnd(rec, 'accept');
        }, false);
        this._bind(no, () => { if (!rec.busy) this._offerEnd(rec, 'decline'); }, true);
        this._offerRefresh();
        const loop = () => {
            if (rec.done) return;
            const now = performance.now();
            if (!rec.busy) rec.left -= Math.min(0.25, (now - rec.last) / 1000);
            rec.last = now;
            const f = hsuiClamp(rec.left / rec.total, 0, 1);
            pg.setAttribute('stroke-dashoffset', (238.76 * (1 - f)).toFixed(1));
            const s = Math.max(0, Math.ceil(rec.left));
            if (rec.num.textContent !== String(s)) rec.num.textContent = String(s);
            ring.classList.toggle('low', rec.left <= 3 && !rec.busy);
            if (rec.left <= 0 && !rec.busy) { this._offerEnd(rec, 'decline'); return; }
            rec.raf = requestAnimationFrame(loop);
        };
        rec.raf = requestAnimationFrame(loop);
        hsuiSfx('alarm');
    },

    _offerRefresh() {
        const r = this._offerRec;
        if (!r || r.done) return;
        const wait = hsuiAdWait(), ready = hsuiAdReady() && !r.busy;
        const key = wait + '|' + ready + '|' + r.busy;
        if (r.key === key) return;
        r.key = key;
        r.go.classList.toggle('off', !ready);
        r.go.innerHTML = '';
        const row = hsuiEl('div', 'row', r.go, (wait || r.busy ? '' : HSUI_ICON.playG) + '<span class="t hs-o" style="--s:2px"></span>');
        row.lastElementChild.textContent = r.busy ? Lang.t('ui.adRunning') : wait ? wait.toUpperCase() : Lang.t('offer.' + r.kind + '.b');
        if (!wait && !r.busy) hsuiEl('div', 'sub', r.go).textContent = Lang.t('ui.forAd');
    },

    /** why: 'accept' (Game сам всё сделал) | 'decline' (Нет / время вышло: onDecline) | 'silent' (раунд кончился). */
    _offerEnd(r, why) {
        if (!r || r.done) return;
        r.done = true;
        cancelAnimationFrame(r.raf);
        if (this._offerRec === r) this._offerRec = null;
        r.el.classList.add('out');
        window.setTimeout(() => r.el.remove(), 220);
        if (why === 'decline') { try { if (r.o.onDecline) r.o.onDecline(); } catch (e) { console.error('GameUI.offer onDecline:', e); } }
    },

    // ---- HUD: обманка за рекламу ----

    async _decoyAd() {
        const a = hsuiAds(), d = this.abil.decoy;
        if (!a || this._decoyBusy) return;
        if (!hsuiAdReady()) { this._shake(d.b); hsuiSfx('error'); return; }
        this._decoyBusy = true;
        try { await a.extraDecoy(); } catch (e) { console.error('extraDecoy:', e); }
        this._decoyBusy = false;
    },

    // ---- результат: x2 монет за рекламу ----

    _decoyBusy: false,
    _x2Busy: false,

    _x2Refresh() {
        const b = this.rX2, r = this._r;
        if (!b || !this._resultOn || !r) return;
        const show = (r.coins | 0) > 0 && hsuiAdsOn() && typeof (/** @type {any} */ (hsuiAds())).doubleReward === 'function';
        b.hidden = !show;
        if (!show) return;
        const wait = hsuiAdWait(), ready = hsuiAdReady() && !this._x2Busy;
        const key = [r.x2done, wait, ready, this._x2Busy, r.coins].join('|');
        if (b.dataset.k === key) return;
        b.dataset.k = key;
        b.classList.toggle('done', !!r.x2done);
        b.classList.toggle('off', !r.x2done && !ready);
        b.innerHTML = '';
        const row = hsuiEl('div', 'row', b, (r.x2done || wait || this._x2Busy ? (r.x2done ? HSUI_ICON.check : '') : HSUI_ICON.playY) + '<span class="t hs-o" style="--s:2px"></span>');
        row.lastElementChild.textContent = r.x2done ? Lang.t('res.x2done') : this._x2Busy ? Lang.t('ui.adRunning') : wait ? wait.toUpperCase() : Lang.t('res.x2');
        if (!r.x2done && !wait && !this._x2Busy) {
            const sub = hsuiEl('div', 'sub', b);
            sub.textContent = Lang.t('res.x2sub', { n: hsuiFmt(r.coins | 0) });
        }
    },

    async _resX2() {
        const a = /** @type {any} */ (hsuiAds()), r = this._r;
        if (!a || !r || r.x2done || this._x2Busy || typeof a.doubleReward !== 'function') return;
        if (!hsuiAdReady()) { this._shake(this.rX2); hsuiSfx('error'); return; }
        this._x2Busy = true;
        this._holdWallet(true);
        this._x2Refresh();
        let res = null;
        try { res = await a.doubleReward(); } catch (e) { console.error('doubleReward:', e); res = null; }
        this._x2Busy = false;
        if (res && res.ok && this._r === r) {
            const old = r.coins | 0;
            const total = res.coins > old ? res.coins | 0 : old * 2;
            r.coins = total;
            r.x2done = true;
            hsuiSfx('buy');
            this._countTo(this.rowCoin, old, total, 0, 1100);
            this._burst(this.rowCoin.row, 18);
            this._flyReward('coins', total - old, this.rowCoin.row.getBoundingClientRect(), this.rCoin);
        } else {
            this._holdWallet(false);
            if (this.rX2) this.rX2.dataset.k = '';
        }
        this._x2Refresh();
    },

    /** Число в плашке награды плавно растёт from -> to. */
    _countTo(o, from, to, delay, dur) {
        const run = () => {
            const t0 = performance.now();
            const tick = () => {
                if (!this._resultOn) return;
                const p = hsuiClamp((performance.now() - t0) / dur, 0, 1);
                o.b.textContent = '+' + hsuiFmt(Math.round(from + (to - from) * (1 - Math.pow(1 - p, 3))));
                if (p < 1) requestAnimationFrame(tick); else o.b.textContent = '+' + hsuiFmt(to);
            };
            requestAnimationFrame(tick);
        };
        if (delay > 0) this._rt.push(window.setTimeout(run, delay)); else run();
    },


    // =====================================================================================
    // Настройки
    // =====================================================================================

    _buildSettings() {
        const win = hsuiEl('div', 'hs-screen hs-win hs-settingswin', this.root);
        this.set_el = win;
        const pn = hsuiEl('div', 'hs-panel hs-setwin hs-a', win);
        pn.style.setProperty('--d', '0');
        hsuiBig(Lang.t('ui.settings'), 'hs-set-title', pn);
        const close = hsuiBtn('hs-tool close hs-set-close', pn, '<div class="ic">' + HSUI_ICON.closeX + '</div>');
        close.setAttribute('aria-label', Lang.t('ui.close'));
        this._bind(close, () => this.closeSettings());
        this.sw = {};
        for (const [id, icon] of [['sfx', HSUI_ICON.speaker], ['music', HSUI_ICON.note]]) {
            const row = hsuiEl('div', 'hs-row hs-inset', pn, icon);
            hsuiEl('span', 'lb hs-o', row).textContent = Lang.t('ui.' + id);
            const sw = hsuiBtn('hs-switch', row);
            sw.setAttribute('role', 'switch');
            this._bind(sw, () => this._toggleSetting(id));
            this.sw[id] = sw;
        }
        const q = hsuiEl('div', 'hs-qrow hs-inset', pn);
        const hd = hsuiEl('div', 'hd', q, HSUI_ICON.gfx);
        hsuiEl('span', 'hs-o', hd).textContent = Lang.t('ui.quality');
        const seg = hsuiEl('div', 'hs-qseg', q);
        this.qb = {};
        for (const id of ['auto', 'low', 'medium', 'high']) {
            const b = hsuiBtn('', seg);
            b.textContent = Lang.t('ui.q.' + id);
            this._bind(b, () => this._setQuality(id));
            this.qb[id] = b;
        }
        const btns = hsuiEl('div', 'hs-set-btns', pn);
        const how = hsuiBtn('hs-btn yellow hs-shine', btns, HSUI_ICON.question + '<span class="t"></span>');
        how.lastElementChild.textContent = Lang.t('ui.howto');
        this._bind(how, () => this._howTo());
        win.addEventListener('click', e => { if (e.target === win) this.closeSettings(); });
    },

    openSettings() {
        if (!this.root) return;
        if (!this.set_el) this._buildSettings();
        this._from = this._resultOn && !this._menuWanted ? 'result' : 'menu';
        this._open = 'settings';
        if (this._from === 'result') this._show(this.result_el, false); else this._menuHide(false);
        this._setRefresh();
        this._show(this.set_el, true);
        hsuiSfx('whoosh');
    },

    closeSettings(silent) {
        if (this._open !== 'settings') return;
        this._open = '';
        this._show(this.set_el, false);
        if (!silent) this._back();
    },

    _setRefresh() {
        const G = hsuiGame(), s = G && G.save && G.save.settings ? G.save.settings : { sfx: true, music: true };
        for (const id of ['sfx', 'music']) {
            const on = s[id] !== false;
            this.sw[id].classList.toggle('on', on);
            this.sw[id].setAttribute('aria-checked', String(on));
        }
        const cur = typeof Quality !== 'undefined' ? Quality.choice : 'auto';
        for (const id of Object.keys(this.qb)) this.qb[id].classList.toggle('on', id === cur);
    },

    _toggleSetting(id) {
        const G = hsuiGame();
        if (!G || !G.save) return;
        if (!G.save.settings) G.save.settings = { music: true, sfx: true };
        const s = G.save.settings;
        s[id] = s[id] === false;
        try { if (typeof G.persist === 'function') G.persist(); } catch (e) { /* сохранение не обязательно */ }
        try { if (typeof G.applySettings === 'function') G.applySettings(); } catch (e) { /* нет настроек звука */ }
        if (id === 'music' && typeof GameFX !== 'undefined' && typeof GameFX.music === 'function') {
            try { GameFX.music(s.music !== false ? (G.state === 'menu' ? 'menu' : null) : null); } catch (e) { /* музыка не обязательна */ }
        }
        this._setRefresh();
    },

    _setQuality(id) {
        if (typeof Quality !== 'undefined') Quality.set(id);
        this._setRefresh();
        this._fxLevel();
    },

    _howTo() {
        const G = hsuiGame();
        if (G && typeof G.howToPlay === 'function') { this.closeSettings(true); this._menuHide(false); G.howToPlay(); }
        else this.closeSettings();
    },

    // =====================================================================================
    // Экран результата
    // =====================================================================================

    _buildResult() {
        const win = hsuiEl('div', 'hs-screen hs-win hs-resultwin', this.root);
        this.result_el = win;
        hsuiEl('div', 'hs-r-rays', win);
        this.confetti = hsuiEl('div', 'hs-confetti', win);
        const pn = hsuiEl('div', 'hs-panel hs-rpanel hs-a', win);
        pn.style.setProperty('--d', '0');
        this.rPanel = pn;
        this.rTitle = hsuiEl('div', 'hs-rtitle', pn);
        const top = hsuiEl('div', 'hs-rtop', pn);
        this.rMap = hsuiEl('div', 'hs-rmap', top);
        const rw = hsuiEl('div', 'hs-sh-wallet', top);
        this.rCoin = this._counter(rw, 'assets/ui/steal/coin.svg', '', 'coins');
        this.rGem = this._counter(rw, 'assets/ui/steal/gem.svg', '', 'gems');
        this.rStars = hsuiEl('div', 'hs-stars', pn);
        for (let i = 0; i < 3; i++) hsuiEl('div', 'hs-star', this.rStars, HSUI_ICON.star);
        const cols = hsuiEl('div', 'hs-rcols', pn);
        this.rRows = hsuiEl('div', 'hs-rrows', cols);
        this.rowCoin = this._mkRRow('coin', 'assets/ui/steal/coin.svg', 0);
        this.rowGem = this._mkRRow('gem', 'assets/ui/steal/gem.svg', 1);
        this.rowXp = this._mkRRow('xp', '', 2);
        const xp = hsuiEl('div', 'hs-rxp hs-inset', cols);
        this.rLvl = hsuiEl('b', 'hs-o', xp);
        this.rLvl.style.setProperty('--s', '1.5px');
        const bar = hsuiEl('div', 'hs-bar', xp);
        this.rBar = hsuiEl('i', '', bar);
        this.rLvlUp = hsuiEl('div', 'hs-lvlup hs-o', xp);
        this.rLvlUp.style.setProperty('--s', '1.5px');
        this.rLvlUp.textContent = Lang.t('res.newLevel');
        // x2 монет за рекламу: один раз, конкретная награда на кнопке
        this.rX2 = hsuiBtn('hs-btn yellow hs-shine hs-x2', cols);
        this.rX2.hidden = true;
        this._bind(this.rX2, () => this._resX2(), false);
        this.rStat = hsuiEl('div', 'hs-rstat', pn);
        this.rBtns = hsuiEl('div', 'hs-rbtns', pn);
    },

    _mkRRow(cls, icon, k) {
        const row = hsuiEl('div', 'hs-rrow hs-inset ' + cls, this.rRows);
        row.style.setProperty('--k', String(k));
        if (icon) hsuiImg(icon, '', row);
        else hsuiEl('div', 'xpic', row, Lang.t('res.xp'));
        const b = hsuiEl('b', 'hs-o', row, '+0');
        b.style.setProperty('--s', '2px');
        return { row, b };
    },

    /** r: { win, role, coins, gems, xp, levelUp, stars?, survived, botsCaught, total, mapName, mapIndex, time, unlocked, level, xpFrac } */
    result(r) {
        if (!this.root || !r) return;
        if (!this.result_el) this._buildResult();
        this._rt.forEach(t => clearTimeout(t));
        this._rt = [];
        this._hudOnHide();
        this._menuHide(true);
        this._closeWindows(true);
        this._offerEnd(this._offerRec, 'silent');
        this._holdWallet(false);
        this._x2Busy = false;
        this._menuWanted = false;
        const seeker = r.role === 'seeker', win = !!r.win;
        this._resultOn = true;
        this._r = Object.assign({}, r, { x2done: false });
        this._wallet(false);
        if (this.rX2) this.rX2.dataset.k = '';
        const el = this.result_el;
        el.classList.toggle('lose', !win);
        // заголовок и карта
        this.rTitle.innerHTML = '';
        hsuiBig(Lang.t(win ? (seeker ? 'res.winSeek' : 'res.winHide') : (seeker ? 'res.loseSeek' : 'res.loseHide')), '', this.rTitle);
        const mi = HS_MAPS[r.mapIndex | 0] || HS_MAPS[0];
        this.rMap.textContent = hsuiPad2((r.mapIndex | 0) + 1) + ' · ' + hsuiName(r.mapName || mi.name).toUpperCase();
        this.rMap.style.color = mi.color;
        // звёзды
        let stars = typeof r.stars === 'number' ? r.stars : 0;
        if (typeof r.stars !== 'number' && win) stars = seeker ? (r.time <= 30 ? 3 : r.time <= 45 ? 2 : 1) : (r.botsCaught === 0 ? 3 : r.botsCaught <= 1 ? 2 : 1);
        stars = hsuiClamp(stars | 0, 0, 3);
        Array.from(this.rStars.children).forEach((s, i) => {
            s.classList.remove('got', 'no');
            s.style.setProperty('--k', String(i));
            void /** @type {HTMLElement} */ (s).offsetWidth;
            if (i < stars) s.classList.add('got'); else s.classList.add('no');
        });
        // награды
        this.rowGem.row.hidden = !(r.gems > 0);
        this.rowXp.row.hidden = !(r.xp > 0);
        this.rowCoin.b.textContent = '+0'; this.rowGem.b.textContent = '+0'; this.rowXp.b.textContent = '+0';
        // статистика
        this.rStat.innerHTML = '';
        const total = r.total || 3;
        if (seeker) hsuiEl('span', '', this.rStat).textContent = Lang.t('res.caught', { a: r.botsCaught | 0, b: total });
        else hsuiEl('span', '', this.rStat).textContent = Lang.t('res.survived', { a: (total - (r.botsCaught | 0)) + (win ? 1 : 0), b: total + 1 });
        if (typeof r.time === 'number') hsuiEl('span', '', this.rStat).textContent = Lang.t('res.time', { t: hsuiClock(r.time) });
        if (r.unlocked) hsuiEl('span', 'hs-unlocked', this.rStat).textContent = Lang.t('res.unlocked');
        // кнопки
        this.rBtns.innerHTML = '';
        const mk = (cls, label, icon, fn) => {
            const b = hsuiBtn('hs-btn ' + cls, this.rBtns, (icon || '') + '<span class="t"></span>');
            b.lastElementChild.textContent = label;
            this._bind(b, fn);
            return b;
        };
        const G = hsuiGame();
        const go = (name) => { this._resultHide(false); if (G && typeof G[name] === 'function') G[name](); };
        if (win) {
            mk('main hs-shine', Lang.t('res.next'), HSUI_ICON.play, () => go('next'));
            mk('yellow small', Lang.t('res.retry'), '', () => go('retry'));
        } else {
            mk('main hs-shine', Lang.t('res.retry'), HSUI_ICON.play, () => go('retry'));
        }
        mk('blue small', Lang.t('res.menu'), HSUI_ICON.house, () => go('toMenu'));
        mk('navy small', Lang.t('res.shop'), HSUI_ICON.cart, () => this.openShop('power', 'result'));
        this._x2Refresh();
        // конфетти
        this._confetti(win);
        this._show(el, true);
        this._resultReplayLight();
    },

    /** Анимация наград и опыта (при показе и при возврате из магазина). */
    _resultReplayLight() {
        const r = this._r;
        if (!r) return;
        this._rt.forEach(t => clearTimeout(t));
        this._rt = [];
        const after = (ms, fn) => { this._rt.push(window.setTimeout(fn, ms)); };
        const count = (o, to, delay) => {
            after(delay, () => {
                const t0 = performance.now(), dur = 900;
                const tick = () => {
                    if (!this._resultOn) return;
                    const p = hsuiClamp((performance.now() - t0) / dur, 0, 1);
                    o.b.textContent = '+' + hsuiFmt(Math.round(to * (1 - Math.pow(1 - p, 3))));
                    if (p < 1) requestAnimationFrame(tick);
                };
                requestAnimationFrame(tick);
                after(dur + 80, () => { o.b.textContent = '+' + hsuiFmt(to); });
            });
        };
        count(this.rowCoin, r.coins | 0, 800);
        count(this.rowGem, r.gems | 0, 960);
        count(this.rowXp, r.xp | 0, 1120);
        // полоса уровня
        const G = hsuiGame();
        let need = 100;
        try { need = G && G.levelInfo ? G.levelInfo().need : 100; } catch (e) { /* нет Game */ }
        const frac = hsuiClamp(typeof r.xpFrac === 'number' ? r.xpFrac : this._levelInfo().frac, 0, 1);
        const level = r.level || this._levelInfo().level;
        const bar = this.rBar;
        const setF = (f, anim) => {
            bar.style.transition = anim ? '' : 'none';
            bar.style.setProperty('--f', hsuiClamp(f, 0, 1).toFixed(3));
            if (!anim) { void bar.offsetWidth; bar.style.transition = ''; }
        };
        this.rLvlUp.classList.remove('on');
        if (!r.levelUp) {
            this.rLvl.textContent = Lang.t('ui.level', { n: level });
            setF(frac - (r.xp | 0) / Math.max(1, need), false);
            after(1300, () => setF(frac, true));
        } else {
            const prevNeed = Math.max(60, need - 60);
            const f0 = hsuiClamp((prevNeed - ((r.xp | 0) - frac * need)) / prevNeed, 0, 0.95);
            this.rLvl.textContent = Lang.t('ui.level', { n: Math.max(1, level - 1) });
            setF(f0, false);
            after(1300, () => setF(1, true));
            after(2400, () => {
                this.rLvl.textContent = Lang.t('ui.level', { n: level });
                this.rLvlUp.classList.add('on');
                hsuiSfx('equip');
                setF(0, false);
            });
            after(2600, () => setF(frac, true));
        }
    },

    _confetti(win) {
        const c = this.confetti;
        c.innerHTML = '';
        if (!win || hsuiReduced()) return;
        const cols = ['#ffd23d', '#ff5a8a', '#59d4ff', '#76f067', '#ff9a1c', '#c06bff', '#ffffff'];
        const n = this.root.classList.contains('hs-lowfx') ? 18 : 40;
        for (let i = 0; i < n; i++) {
            const e = hsuiEl('i', '', c);
            e.style.setProperty('--x', (Math.random() * 100).toFixed(1) + '%');
            e.style.setProperty('--c', cols[i % cols.length]);
            e.style.setProperty('--w', (6 + Math.random() * 7).toFixed(1) + 'px');
            e.style.setProperty('--t', (2.6 + Math.random() * 2.2).toFixed(2) + 's');
            e.style.setProperty('--dl', (-Math.random() * 4).toFixed(2) + 's');
            e.style.setProperty('--dx', ((Math.random() - 0.5) * 140).toFixed(0) + 'px');
            e.style.setProperty('--r', ((Math.random() < 0.5 ? -1 : 1) * (360 + Math.random() * 540)).toFixed(0) + 'deg');
        }
    },

    _resultHide(fast) {
        if (!this.result_el) return;
        this._resultOn = false;
        this._rt.forEach(t => clearTimeout(t));
        this._rt = [];
        if (fast) { clearTimeout(this._timers.get(this.result_el)); this.result_el.classList.remove('on', 'in', 'out'); }
        else this._show(this.result_el, false);
    },

    _hudOnHide() { if (this._hudOn) this.hud(false); },

    // =====================================================================================
    // База: HUD (касса, доход, назад, инвентарь), инвентарь и постаменты
    // =====================================================================================

    _bc: /** @type {Record<string, any>} */ ({}),
    _bkBusy: false,
    _ivPaused: false,
    _ivSure: '',
    _ivPick: '',
    _ivSig: '',
    _ivT: 0,

    /** Блок HUD: рамка для HudLayout и внутренний слой проектного размера (как в _buildHud). */
    _blk(parent, id, cls, dock, w, h, extra) {
        const el = hsuiEl('div', 'hs-hb ' + cls, parent);
        const fit = hsuiEl('div', 'hs-fit', el);
        fit.style.width = w + 'px'; fit.style.height = h + 'px';
        this._hb[id] = { el, fit, dw: w, dh: h };
        if (typeof HudLayout !== 'undefined') HudLayout.block(id, Object.assign({ dock, w, h, el }, extra || {}));
        return fit;
    },

    _buildBaseHud() {
        const hud = this.base_el;
        const blk = (id, cls, dock, w, h, extra) => this._blk(hud, id, cls, dock, w, h, extra);
        // назад в меню
        const fb = blk('hs-b-back', 'bk-back', 'tl', 152, 56);
        const back = hsuiBtn('hs-btn navy hs-bk-back', fb, HSUI_ICON.house + '<span class="t"></span>');
        back.lastElementChild.textContent = Lang.t('bs.menu');
        back.setAttribute('aria-label', Lang.t('bs.menu'));
        this._bind(back, () => this._baseBack());
        this.bkBack = back;
        // касса: накоплено, доход, потолок, «забрать всё» и «×2 за рекламу»
        const fk = blk('hs-b-bank', 'bk-bank', { tall: 'tl', default: 'tc' }, 304, 168, { order: 1 });
        const pn = hsuiEl('div', 'hs-panel hs-bank', fk);
        this.bkPanel = pn;
        const r1 = hsuiEl('div', 'r1', pn);
        hsuiEl('b', '', r1).textContent = Lang.t('bs.bank');
        this.bkInc = hsuiEl('span', '', r1);
        const r2 = hsuiEl('div', 'r2', pn);
        hsuiImg(HSUI_COIN, '', r2);
        this.bkNum = hsuiEl('b', 'hs-o', r2, '0');
        this.bkNum.style.setProperty('--s', '2px');
        this.bkCap = hsuiEl('small', '', r2);
        const bw = hsuiEl('div', 'hs-bar', pn);
        this.bkBar = hsuiEl('i', '', bw);
        this.bkHint = hsuiEl('div', 'r3', pn);
        const r4 = hsuiEl('div', 'r4', pn);
        this.bkCollect = hsuiBtn('hs-btn hs-shine', r4, '<span class="t"></span>');
        this.bkCollect.lastElementChild.textContent = Lang.t('bs.collect');
        this.bkX2 = hsuiBtn('hs-btn yellow x2', r4);
        this._bind(this.bkCollect, () => this._bankCollect(), false);
        this._bind(this.bkX2, () => this._bankX2(), false);
        // кошелёк
        const fw = blk('hs-b-wallet', 'bk-wallet', 'tr', 262, 42);
        const wal = hsuiEl('div', 'hs-basewal', fw);
        this.bCoin = this._counter(wal, HSUI_COIN, '', 'coins');
        this.bGem = this._counter(wal, HSUI_GEM, '', 'gems');
        // инвентарь
        const fi = blk('hs-b-inv', 'bk-inv', 'br', 184, 72);
        const inv = hsuiBtn('hs-btn yellow hs-shine hs-bk-inv', fi, HSUI_ICON.bag + '<span class="t"></span><i class="cnt"></i>');
        inv.querySelector('.t').textContent = Lang.t('bs.inv');
        inv.setAttribute('aria-label', Lang.t('bs.inv'));
        this.bkInv = inv;
        this.bkInvCnt = /** @type {HTMLElement} */ (inv.querySelector('.cnt'));
        this._bind(inv, () => this.openInventory());
    },

    /** HUD базы: показать, когда Game.state === 'base' (Game.openBase), спрятать при Game.closeBase. */
    baseHud(show) {
        if (!this.root) return;
        show = !!show;
        if (show === this._baseOn) return;
        this._baseOn = show;
        this.base_el.hidden = !show;
        if (show) {
            if (this._hudOn) this.hud(false);
            this._menuHide(true);
            this._resultHide(true);
            this._closeWindows(true);
            this._bc = { first: true, t: 0 };
            this._bkBusy = false;
            if (typeof HudLayout !== 'undefined') {
                HudLayout.block('input-action', { visible: false });   // контекстная кнопка не нужна: ходим стиком
                HudLayout.block('input-stick', { w: 200, h: 200 });
                HudLayout.refresh();
            }
            this._wallet(false);
            this._fitAll();
            this._baseTip();
        } else {
            this._closeWindows(true);
            this._popClose();
            this._clearTags();
        }
    },

    /** Подсказка при входе на базу: один раз всплывает над кассой. */
    _baseTip() {
        if (this._bc && this.bkHint) this._bc.tipT = 7;
    },

    /** Каждый кадр на базе: { bank, incomePerMin, cap }. */
    baseUpdate(s) {
        if (!this._baseOn || !s) return;
        const c = this._bc;
        const first = !!c.first;
        const now = performance.now();
        const dt = c.last ? Math.min(0.25, (now - c.last) / 1000) : 0;
        c.last = now;
        const bank = Math.max(0, Math.floor(Number(s.bank) || 0));
        const cap = Math.max(0, Math.floor(Number(s.cap) || 0));
        const inc = Math.round((Number(s.incomePerMin) || 0) * 10) / 10;
        if (c.bank !== bank) {
            const up = c.bank != null && bank > c.bank;
            c.bank = bank;
            this.bkNum.textContent = hsuiFmt(bank);
            if (up && !first && !hsuiReduced()) { this.bkNum.classList.remove('hs-pop2'); void this.bkNum.offsetWidth; this.bkNum.classList.add('hs-pop2'); }
        }
        const frac = cap > 0 ? hsuiClamp(bank / cap, 0, 1) : 0;
        const fq = Math.round(frac * 200);
        if (c.fq !== fq) { c.fq = fq; this.bkBar.style.setProperty('--f', frac.toFixed(3)); }
        const full = cap > 0 && bank >= cap;
        if (c.full !== full) { c.full = full; this.bkPanel.classList.toggle('full', full); }
        if (c.inc !== inc || c.cap !== cap) {
            c.inc = inc; c.cap = cap;
            this.bkInc.textContent = inc > 0 ? Lang.t('bs.income', { n: hsuiFmt10(inc) }) : '';
            this.bkCap.textContent = cap > 0 ? Lang.t('bs.cap', { n: hsuiFmt(cap) }) : '';
            c.hk = null;
        }
        // подсказка: касса полна / пуста / как забирать деньги
        const tip = c.tipT > 0;
        if (tip) c.tipT -= dt;
        const hk = full ? 'full' : inc <= 0 ? 'empty' : tip ? 'tip' : '';
        if (c.hk !== hk) {
            c.hk = hk;
            this.bkHint.textContent = hk === 'full' ? Lang.t('bs.full') : hk === 'empty' ? Lang.t('bs.empty') : hk === 'tip' ? Lang.t('bs.tip') : '';
        }
        // кнопки
        const wait = hsuiAdWait(), ready = hsuiAdReady() && !this._bkBusy, ads = hsuiAdsOn();
        const cd = Math.max(0, Math.ceil(((this._bkCd || 0) - performance.now()) / 1000));
        const bk = [bank >= 1, wait, ready, ads, this._bkBusy, Lang.code, cd].join('|');
        if (c.bk !== bk) {
            c.bk = bk;
            this.bkCollect.classList.toggle('off', bank < 1 || cd > 0);
            this.bkCollect.lastElementChild.textContent = cd > 0 ? Lang.t('bs.collectIn', { n: cd }) : Lang.t('bs.collect');
            this.bkX2.hidden = !ads;
            this.bkX2.classList.toggle('off', bank < 1 || !ready);
            this.bkX2.innerHTML = (wait || this._bkBusy ? '' : HSUI_ICON.playY) + '<span class="t"></span>';
            this.bkX2.lastElementChild.textContent = this._bkBusy ? Lang.t('ui.adRunning') : wait ? wait.toUpperCase() : Lang.t('bs.x2');
        }
        // деньги и число брейнротов: реже, раз в полсекунды
        c.t = (c.t || 0) + dt;
        if (first || c.t >= 0.5) {
            c.t = 0;
            this._wallet(!first);
            const C = hsuiCollect();
            let n = 0;
            try { n = C ? C.inventory().length : 0; } catch (e) { n = 0; }
            if (c.inv !== n) { c.inv = n; this.bkInvCnt.textContent = String(n); this.bkInvCnt.hidden = n <= 0; }
        }
        c.first = false;
    },

    _baseBack() {
        const G = /** @type {any} */ (hsuiGame());
        if (!G || typeof G.closeBase !== 'function') return;
        this._closeWindows(true);
        try { const r = G.closeBase(); if (r && typeof r.catch === 'function') r.catch(e => console.error('closeBase:', e)); } catch (e) { console.error('closeBase:', e); }
    },

    /** «Забрать всё»: деньги со всех постаментов в кошелёк, монеты летят в счётчик. */
    _bankCollect() {
        const C = hsuiCollect();
        if (!C || this._bkBusy) return;
        if (performance.now() < (this._bkCd || 0)) { hsuiSfx('error'); this._shake(this.bkCollect); return; }
        let r = null;
        try { r = C.collectBank(); } catch (e) { console.error('collectBank:', e); r = null; }
        if (r && r.ok && r.coins > 0) {
            hsuiSfx('buy');
            this._holdWallet(true);
            this._burst(this.bkCollect, 14);
            this._flyReward('coins', r.coins, this.bkCollect.getBoundingClientRect(), this.bCoin);
            this.bkPanel.classList.remove('pop'); void this.bkPanel.offsetWidth; this.bkPanel.classList.add('pop');
            this._bc.bank = null;
            this._bkCd = performance.now() + HSUI_COLLECT_CD * 1000;   // перезарядка кнопки
        } else {
            hsuiSfx('error');
            this._shake(this.bkCollect);
        }
    },

    /** «×2 за рекламу»: Game.collect.bankX2() забирает кассу и удваивает. */
    async _bankX2() {
        const C = hsuiCollect();
        if (!C || typeof C.bankX2 !== 'function' || this._bkBusy) return;
        if (!hsuiAdReady() || (this._bc.bank | 0) < 1) { this._shake(this.bkX2); hsuiSfx('error'); return; }
        this._bkBusy = true;
        this._holdWallet(true);
        this._bc.bk = null;
        let r = null;
        try { r = await C.bankX2(); } catch (e) { console.error('bankX2:', e); r = null; }
        this._bkBusy = false;
        this._bc.bk = null;
        if (r && r.ok) {
            hsuiSfx('buy');
            const from = this.bkX2.getBoundingClientRect();
            this._burst(this.bkX2, 22);
            this._flyReward('coins', (r.coins | 0) || 0, from, this.bCoin);
            this._bc.bank = null;
        } else {
            this._holdWallet(false);
            this._shake(this.bkX2);
            this._hintBank(Lang.t('ui.adFail').replace(/ Прогресс.*$/, ''));
        }
    },

    _hintBank(text) {
        const el = this.bkHint;
        if (!el) return;
        el.textContent = text;
        const old = this._timers.get(el);
        if (old) clearTimeout(old);
        this._timers.set(el, window.setTimeout(() => { this._bc.hk = null; this._timers.delete(el); }, 2600));
    },

    // ---------- окно «Инвентарь» (брейнроты и постаменты) ----------

    _buildInv() {
        const win = hsuiEl('div', 'hs-screen hs-win hs-inv', this.root);
        this.inv_el = win;
        const pn = hsuiEl('div', 'hs-panel hs-invwin hs-a', win);
        pn.style.setProperty('--d', '0');
        const head = hsuiEl('div', 'hs-iv-head', pn);
        hsuiBig(Lang.t('iv.title'), 'hs-iv-title', head);
        const wal = hsuiEl('div', 'hs-sh-wallet', head);
        this.ivCoin = this._counter(wal, HSUI_COIN, '', 'coins');
        this.ivGem = this._counter(wal, HSUI_GEM, '', 'gems');
        const close = hsuiBtn('hs-tool close', head, '<div class="ic">' + HSUI_ICON.closeX + '</div>');
        close.setAttribute('aria-label', Lang.t('ui.close'));
        this._bind(close, () => this.closeInventory());
        // вкладки (портрет): брейнроты / постаменты
        const tabs = hsuiEl('div', 'hs-iv-tabs', pn);
        this.ivTabs = {};
        for (const [id, key, ic] of [['inv', 'iv.tabInv', HSUI_ICON.bag], ['slots', 'iv.tabSlots', HSUI_ICON.podium]]) {
            const b = hsuiBtn('hs-tab' + (id === 'inv' ? ' on' : ''), tabs, ic + '<span></span>');
            b.lastElementChild.textContent = Lang.t(key);
            this._bind(b, () => this._ivTab(id));
            this.ivTabs[id] = b;
        }
        const body = hsuiEl('div', 'hs-iv-body t-inv', pn);
        this.ivBody = body;
        const mk = (cls, key, ic) => {
            const col = hsuiEl('div', 'hs-iv-col ' + cls, body);
            const h = hsuiEl('div', 'hs-iv-colh', col, ic + '<span></span>');
            h.lastElementChild.textContent = Lang.t(key);
            const list = hsuiEl('div', 'hs-iv-list', col);
            return { col, head: h, list };
        };
        this.ivInvCol = mk('inv', 'iv.tabInv', HSUI_ICON.bag);
        this.ivSlotCol = mk('slots', 'iv.tabSlots', HSUI_ICON.podium);
        win.addEventListener('click', e => { if (e.target === win) this.closeInventory(); });
    },

    _ivTab(id) {
        if (!this.ivBody) return;
        this.ivBody.classList.toggle('t-inv', id === 'inv');
        this.ivBody.classList.toggle('t-slots', id === 'slots');
        for (const k of Object.keys(this.ivTabs)) this.ivTabs[k].classList.toggle('on', k === id);
    },

    /** Пауза игры на время окна (правило: окно посреди игры ставит паузу, закрытие снимает). */
    _ivPause(on) {
        try {
            if (typeof Pause === 'undefined') return;
            if (on) { if (!Pause.has('manual')) { Pause.set('manual', true); this._ivPaused = true; } }
            else if (this._ivPaused) { Pause.set('manual', false); this._ivPaused = false; }
        } catch (e) { /* пауза не обязательна */ }
    },

    openInventory() {
        if (!this.root || !this._baseOn) return false;
        if (this._open === 'inv') return true;
        if (this._open) return false;
        if (!this.inv_el) this._buildInv();
        this._popClose();
        this._open = 'inv';
        this._ivSig = '';
        this._ivSure = '';
        this._ivPick = '';
        this._ivTab('inv');
        this._wallet(false);
        this._ivPause(true);
        this._ivRefresh(true);
        this._show(this.inv_el, true);
        hsuiSfx('whoosh');
        return true;
    },

    closeInventory() {
        if (this._open !== 'inv') return;
        this._open = '';
        this._ivPause(false);
        this._show(this.inv_el, false);
        this._popClose();
    },

    /** Перерисовать списки, если изменились данные (инвентарь, постаменты, хватает ли монет на открытие). */
    _ivRefresh(force) {
        if (this._open !== 'inv' || !this.inv_el) return;
        const C = hsuiCollect();
        let inv = [], base = null;
        try { if (C) { inv = C.inventory(); base = C.base(); } } catch (e) { console.error('GameUI: инвентарь:', e); }
        const slots = base ? base.slots : [];
        const coins = hsuiCoins();
        const next = slots.find(s => !s.unlocked);
        const sig = JSON.stringify([inv.map(i => [i.uid, i.mutation]), slots.map(s => [s.unlocked ? 1 : 0, s.item ? s.item.uid : 0]), next ? coins >= next.price : 0, this._ivSure, this._ivPick, Lang.code]);
        if (!force && sig === this._ivSig) { this._wallet(true); return; }
        this._ivSig = sig;
        this._wallet(true);
        this._ivFillInv(inv, slots, C);
        this._ivFillSlots(slots, C, coins);
        this.ivTabs.inv.lastElementChild.textContent = Lang.t('iv.tabInv') + ' · ' + inv.length;
        this.ivInvCol.head.lastElementChild.textContent = Lang.t('iv.tabInv') + ' · ' + inv.length;
    },

    _ivFillInv(inv, slots, C) {
        const list = this.ivInvCol.list;
        const keep = list.scrollTop;
        list.innerHTML = '';
        if (!inv.length) {
            const e = hsuiEl('div', 'hs-iv-empty', list, HSUI_ICON.silhouette);
            hsuiEl('span', '', e).textContent = Lang.t('iv.empty');
            return;
        }
        const free = slots.filter(s => s.unlocked && !s.item);
        inv.forEach((it, i) => {
            const col = hsuiRar(it.rarity).color;
            const row = hsuiEl('div', 'hs-ivrow ' + hsuiRarCls(it.rarity), list);
            row.style.setProperty('--rc', col);
            row.style.setProperty('--i', String(Math.min(i, 8)));
            hsuiIcon(it.icon, hsuiEl('div', 'ic', row), col, 'br');
            const tx = hsuiEl('div', 'tx', row);
            hsuiEl('div', 'nm', tx).textContent = it.name;
            const meta = hsuiEl('div', 'meta', tx);
            hsuiEl('span', 'hs-rr', meta).textContent = hsuiRarName(it.rarity);
            if (it.mutation) hsuiEl('span', 'mu', meta).textContent = hsuiMutName(it.mutation).replace('!', '');
            hsuiEl('span', 'inc', meta).textContent = '+' + Lang.t('iv.income', { n: hsuiFmt10(it.income) });
            const price = it.sell != null ? it.sell : (C ? C.sellPrice(it.id, it.mutation) : 0);
            const sp = hsuiEl('span', '', meta, '<img src="' + HSUI_COIN + '" alt="">');
            sp.appendChild(document.createTextNode(hsuiFmt(price)));
            const acts = hsuiEl('div', 'acts', row);
            const hint = hsuiEl('div', 'hs-hint', row);
            if (this._ivSure === it.uid) {
                hsuiEl('span', 'sure', acts).textContent = Lang.t('iv.sure');
                const yes = hsuiBtn('hs-btn red', acts, '<span class="t"></span>');
                yes.lastElementChild.textContent = Lang.t('iv.yes');
                const no = hsuiBtn('hs-btn navy', acts, '<span class="t"></span>');
                no.lastElementChild.textContent = Lang.t('iv.no');
                this._bind(yes, () => this._ivSell(it, row), false);
                this._bind(no, () => { this._ivSure = ''; this._ivRefresh(true); });
            } else {
                const place = hsuiBtn('hs-btn', acts, HSUI_ICON.podium + '<span class="t"></span>');
                place.lastElementChild.textContent = Lang.t('iv.place');
                const sell = hsuiBtn('hs-btn yellow', acts, '<span class="t"></span>');
                sell.lastElementChild.textContent = Lang.t('iv.sell');
                this._bind(place, () => this._ivPlace(it, free, place, hint), false);
                this._bind(sell, () => this._ivSellAsk(it, row), false);
            }
            // выбор постамента, если свободных несколько
            if (this._ivPick === it.uid && free.length > 1) {
                const pk = hsuiEl('div', 'hs-ivpick', row);
                hsuiEl('span', 'lb', pk).textContent = Lang.t('iv.pick');
                for (const s of free) {
                    const b = hsuiBtn('', pk);
                    b.textContent = String(s.index + 1);
                    b.setAttribute('aria-label', Lang.t('iv.slot', { n: s.index + 1 }));
                    this._bind(b, () => this._ivPut(it, s.index, row), false);
                }
            }
        });
        list.scrollTop = keep;
    },

    _ivFillSlots(slots, C, coins) {
        const list = this.ivSlotCol.list;
        const keep = list.scrollTop;
        list.innerHTML = '';
        const firstLocked = slots.find(s => !s.unlocked);
        slots.forEach((s, i) => {
            const it = s.item;
            const cls = it ? 'busy ' + hsuiRarCls(it.rarity) : s.unlocked ? '' : 'lock';
            const row = hsuiEl('div', 'hs-slotrow ' + cls, list);
            if (it) row.style.setProperty('--rc', hsuiRar(it.rarity).color);
            row.style.setProperty('--i', String(Math.min(i, 9)));
            hsuiEl('div', 'no', row, s.unlocked ? '' : HSUI_ICON.lock).appendChild(document.createTextNode(s.unlocked ? String(s.index + 1) : ''));
            const ic = hsuiEl('div', 'ic', row);
            const tx = hsuiEl('div', 'tx', row);
            const acts = hsuiEl('div', 'acts', row);
            const hint = hsuiEl('div', 'hs-hint', row);
            if (it) {
                hsuiIcon(it.icon, ic, hsuiRar(it.rarity).color, 'br');
                hsuiEl('div', 'nm', tx).textContent = it.name;
                const m = hsuiEl('div', 'meta', tx);
                hsuiEl('span', 'inc', m).textContent = '+' + Lang.t('iv.income', { n: hsuiFmt10(s.income) });
                const un = hsuiBtn('hs-btn navy', acts, '<span class="t"></span>');
                un.lastElementChild.textContent = Lang.t('iv.remove');
                this._bind(un, () => this._ivUnplace(s.index, row), false);
            } else if (s.unlocked) {
                ic.innerHTML = HSUI_ICON.podium;
                hsuiEl('div', 'nm', tx).textContent = Lang.t('iv.slot', { n: s.index + 1 });
                hsuiEl('div', 'meta', tx).textContent = Lang.t('iv.free');
            } else {
                ic.innerHTML = HSUI_ICON.lock;
                hsuiEl('div', 'nm', tx).textContent = Lang.t('iv.slot', { n: s.index + 1 });
                hsuiEl('div', 'meta', tx).textContent = Lang.t('iv.locked');
                const can = s === firstLocked;
                const ub = hsuiBtn('hs-btn yellow' + (can && coins >= s.price ? '' : ' off'), acts, '<img src="' + HSUI_COIN + '" alt=""><span class="t"></span>');
                ub.lastElementChild.textContent = Lang.t('iv.unlock') + ' ' + hsuiFmt(s.price);
                this._bind(ub, () => this._ivUnlock(s, can, row, hint), false);
            }
        });
        list.scrollTop = keep;
    },

    /** Поставить на постамент: один свободный — сразу, несколько — выбор, нет — подсказка. */
    _ivPlace(it, free, btn, hint) {
        if (!free.length) { hsuiSfx('error'); this._shake(btn); this._hintOn(hint, Lang.t('iv.noFree')); return; }
        if (free.length === 1) { this._ivPut(it, free[0].index, btn.closest('.hs-ivrow')); return; }
        this._ivPick = this._ivPick === it.uid ? '' : it.uid;
        this._ivSure = '';
        hsuiSfx('click');
        this._ivRefresh(true);
    },

    _ivPut(it, index, row) {
        const C = hsuiCollect();
        let r = null;
        try { r = C ? C.place(it.uid, index) : null; } catch (e) { console.error('place:', e); r = null; }
        this._ivPick = '';
        if (r && r.ok) {
            hsuiSfx('equip');
            if (row) this._burst(row, 12);
            this._ivSig = '';
            this._ivRefresh(true);
            this._bc.inv = null;
        } else {
            hsuiSfx('error');
            if (row) { this._shake(row); const h = row.querySelector('.hs-hint'); if (h) this._hintOn(h, Lang.t('iv.fail')); }
            this._ivPick = '';
        }
    },

    _ivUnplace(index, row) {
        const C = hsuiCollect();
        let r = null;
        try { r = C ? C.unplace(index) : null; } catch (e) { console.error('unplace:', e); r = null; }
        if (r && r.ok) { hsuiSfx('click'); this._ivSig = ''; this._ivRefresh(true); this._bc.inv = null; }
        else { hsuiSfx('error'); this._shake(row); }
    },

    _ivUnlock(s, can, row, hint) {
        if (!can) { hsuiSfx('error'); this._shake(row); this._hintOn(hint, Lang.t('iv.order')); return; }
        if (hsuiCoins() < s.price) { hsuiSfx('error'); this._shake(row); this._hintOn(hint, Lang.t('ui.needCoins', { n: hsuiFmt(s.price - hsuiCoins()) })); if (this.ivCoin) this.ivCoin.bump(); return; }
        const C = hsuiCollect();
        let r = null;
        try { r = C ? C.unlockSlot(s.index) : null; } catch (e) { console.error('unlockSlot:', e); r = null; }
        if (r && r.ok) {
            hsuiSfx('buy');
            this._burst(row, 20);
            this._ivSig = '';
            this._ivRefresh(true);
        } else {
            hsuiSfx('error');
            this._shake(row);
            this._hintOn(hint, r && r.reason === 'order' ? Lang.t('iv.order') : r && r.reason === 'money' ? Lang.t('ui.needCoins', { n: hsuiFmt(Math.max(1, s.price - hsuiCoins())) }) : Lang.t('iv.fail'));
        }
    },

    /** Продажа: обычных — сразу, редких и выше — после подтверждения. */
    _ivSellAsk(it, row) {
        hsuiSfx('click');
        if (HSUI_RAR_ORDER.indexOf(it.rarity) >= 1) {
            this._ivSure = it.uid;
            this._ivPick = '';
            this._ivRefresh(true);
            const uid = it.uid;
            window.setTimeout(() => { if (this._ivSure === uid) { this._ivSure = ''; this._ivRefresh(true); } }, 4500);
        } else this._ivSell(it, row);
    },

    _ivSell(it, row) {
        const C = hsuiCollect();
        let r = null;
        const from = row ? row.getBoundingClientRect() : null;
        try { r = C ? C.sell(it.uid) : null; } catch (e) { console.error('sell:', e); r = null; }
        this._ivSure = '';
        if (r && r.ok) {
            hsuiSfx('buy');
            this._holdWallet(true);
            if (from) this._flyReward('coins', r.coins | 0, from, this.ivCoin);
            else this._holdWallet(false);
            this._ivSig = '';
            this._ivRefresh(true);
            this._bc.inv = null;
        } else {
            hsuiSfx('error');
            this._ivRefresh(true);
        }
    },

    // =====================================================================================
    // Кодекс: все 24 брейнрота, найденные и силуэты
    // =====================================================================================

    _cxState: { filter: 'all' },

    _buildCodex() {
        const win = hsuiEl('div', 'hs-screen hs-win hs-codex', this.root);
        this.codex_el = win;
        const pn = hsuiEl('div', 'hs-panel hs-cxwin hs-a', win);
        pn.style.setProperty('--d', '0');
        const head = hsuiEl('div', 'hs-cx-head', pn);
        hsuiBig(Lang.t('cx.title'), 'hs-cx-title', head);
        const pr = hsuiEl('div', 'hs-cx-prog', head);
        this.cxProg = hsuiEl('b', 'hs-o', pr);
        this.cxProg.style.setProperty('--s', '1.5px');
        const bar = hsuiEl('div', 'hs-bar gold', pr);
        this.cxBar = hsuiEl('i', '', bar);
        const close = hsuiBtn('hs-tool close', head, '<div class="ic">' + HSUI_ICON.closeX + '</div>');
        close.setAttribute('aria-label', Lang.t('ui.close'));
        this._bind(close, () => this.closeCodex());
        this.cxFilt = hsuiEl('div', 'hs-cx-filt', pn);
        this.cxGrid = hsuiEl('div', 'hs-cx-grid', pn);
        hsuiEl('div', 'hs-cx-note', pn).textContent = Lang.t('cx.hint');
        this._cxSig = '';
        win.addEventListener('click', e => { if (e.target === win) this.closeCodex(); });
    },

    /** from: 'menu' | 'result' — куда вернуться. */
    openCodex(from) {
        if (!this.root) return false;
        if (this._open === 'codex') return true;
        if (this._open || this._hudOn) return false;
        if (!this.codex_el) this._buildCodex();
        this._popClose();
        this._from = from || (this._resultOn && !this._menuWanted ? 'result' : 'menu');
        this._open = 'codex';
        if (this._from === 'result') this._show(this.result_el, false); else this._menuHide(false);
        this._cxSig = '';
        this._cxFill(true);
        this._show(this.codex_el, true);
        this._cxLayout();
        hsuiSfx('whoosh');
        return true;
    },

    closeCodex() {
        if (this._open !== 'codex') return;
        this._open = '';
        this._show(this.codex_el, false);
        this._back();
    },

    /** Число колонок сетки по ширине: карточки ~125u. */
    _cxLayout() {
        const g = this.cxGrid;
        if (!g) return;
        const w = g.clientWidth || this.W * 0.9;
        const cols = hsuiClamp(Math.floor(w / (126 * this.u)), 3, 8);
        g.style.setProperty('--cols', String(cols));
    },

    _cxFill(force) {
        if (!this.codex_el || (this._open !== 'codex' && !force)) return;
        const C = hsuiCollect();
        let list = [];
        try { list = C ? C.codex() : []; } catch (e) { console.error('GameUI: кодекс:', e); }
        const f = this._cxState.filter;
        const sig = list.map(x => (x.found ? x.count || 1 : 0)).join(',') + '|' + f + '|' + Lang.code;
        if (!force && sig === this._cxSig) return;
        this._cxSig = sig;
        const got = list.filter(x => x.found).length;
        this.cxProg.innerHTML = Lang.t('cx.found', { a: '<em>' + got + '</em>', b: list.length });
        this.cxBar.style.setProperty('--f', (list.length ? got / list.length : 0).toFixed(3));
        // фильтр по редкости: «Все» и 7 редкостей со счётом найденных
        this.cxFilt.innerHTML = '';
        const chip = (id, label, cnt) => {
            const b = hsuiBtn('hs-cx-chip' + (id !== 'all' ? ' ' + hsuiRarCls(id) : '') + (f === id ? ' on' : ''), this.cxFilt);
            if (id !== 'all') { b.style.setProperty('--rc', hsuiRar(id).color); hsuiEl('i', '', b); }
            hsuiEl('span', '', b).textContent = label;
            if (cnt) hsuiEl('b', '', b).textContent = cnt;
            this._bind(b, () => { this._cxState.filter = id; this._cxFill(true); this.cxGrid.scrollTop = 0; });
        };
        chip('all', Lang.t('cx.all'), got + '/' + list.length);
        for (const id of HSUI_RAR_ORDER) {
            const of = list.filter(x => x.rarity === id);
            if (of.length) chip(id, hsuiRarName(id), of.filter(x => x.found).length + '/' + of.length);
        }
        // карточки
        const grid = this.cxGrid;
        grid.innerHTML = '';
        const shown = list.filter(x => f === 'all' || x.rarity === f);
        shown.forEach((it, i) => {
            const r = hsuiRar(it.rarity);
            const el = hsuiEl('div', 'hs-cxc ' + hsuiRarCls(it.rarity) + (it.found ? '' : ' unk'), grid);
            el.style.setProperty('--rc', r.color);
            el.style.setProperty('--rca', hsuiRarGlow(it.rarity));
            el.style.setProperty('--i', String(Math.min(i, 24)));
            hsuiEl('div', 'nm', el).textContent = it.found ? it.name : Lang.t('cx.unknown');
            hsuiIcon(it.icon, hsuiEl('div', 'im', el), r.color, 'br', !it.found);
            const bt = hsuiEl('div', 'bt', el);
            hsuiEl('span', 'hs-rr', bt).textContent = hsuiRarName(it.rarity);
            if (it.found && (it.count | 0) > 0) hsuiEl('span', 'ct', el).textContent = '×' + (it.count | 0);
            if (it.found) el.addEventListener('click', () => { hsuiSfx('click'); this._burst(el, 6); });
        });
        this._cxLayout();
    },

    // =====================================================================================
    // Подбор брейнротов в раунде: полоса над головой, стрелки у края, баннер «Новый брейнрот!»
    // =====================================================================================

    /** Каждый кадр: [{ id, x, y, frac, rarity, mutation?, name, active, seconds? }] — экранные px над брейнротом. */
    pickup(list) {
        if (!this.root) return;
        if (!list || !list.length) {
            if (this._picks.size) { for (const r of this._picks.values()) r.el.remove(); this._picks.clear(); }
            return;
        }
        const seen = new Set(), cnt = {};
        for (const p of list) {
            if (!p || !isFinite(p.x) || !isFinite(p.y)) continue;
            const n = (cnt[p.id] = (cnt[p.id] || 0) + 1);
            const key = p.id + '#' + n;
            seen.add(key);
            let rec = this._picks.get(key);
            if (!rec) {
                const el = hsuiEl('div', 'hs-pk', this.picksEl);
                const inn = hsuiEl('div', 'hs-pk-in', el);
                const mu = hsuiEl('span', 'hs-pk-mu', inn);
                const nm = hsuiEl('div', 'hs-pk-name', inn);
                const nmT = hsuiEl('b', '', nm);
                const rr = hsuiEl('span', 'hs-rr', nm);
                const ring = hsuiEl('div', 'hs-pk-ring', inn);
                const num = hsuiEl('b', 'hs-o', ring);
                rec = { el, mu, nmT, rr, ring, num, name: null, rarity: '', mut: '', near: null, pct: -1, sec: '', px: -1e9, py: -1e9 };
                this._picks.set(key, rec);
            }
            const rarity = HSUI_RAR[p.rarity] ? p.rarity : 'common';
            if (rec.rarity !== rarity) {
                rec.rarity = rarity;
                rec.el.className = 'hs-pk ' + hsuiRarCls(rarity) + (rec.mut ? ' mut' : '') + (rec.near ? ' near' : '');
                rec.el.style.setProperty('--rc', hsuiRar(rarity).color);
                rec.el.style.setProperty('--rca', hsuiRarGlow(rarity));
                rec.rr.textContent = hsuiRarName(rarity);
            }
            if (rec.name !== p.name) { rec.name = p.name; rec.nmT.textContent = p.name || ''; }
            const mut = p.mutation && HSUI_MUT[p.mutation] ? p.mutation : '';
            if (rec.mut !== mut) {
                rec.mut = mut;
                rec.el.classList.toggle('mut', !!mut);
                rec.mu.textContent = hsuiMutName(mut).replace('!', '');
            }
            const near = !!p.active;
            if (rec.near !== near) { rec.near = near; rec.el.classList.toggle('near', near); }
            const frac = hsuiClamp(Number(p.frac) || 0, 0, 1);
            const pct = Math.round(frac * 100);
            const sec = typeof p.seconds === 'number' && isFinite(p.seconds) ? Lang.t('pk.sec', { n: p.seconds.toFixed(1) }) : '';
            if (rec.pct !== pct || rec.sec !== sec) {
                rec.pct = pct; rec.sec = sec;
                rec.ring.style.setProperty('--pp', (frac * 100).toFixed(1) + '%');
                rec.num.innerHTML = pct + '%' + (sec && near ? '<small>' + sec + '</small>' : '');
            }
            if (Math.abs(rec.px - p.x) > 0.3 || Math.abs(rec.py - p.y) > 0.3) {
                rec.px = p.x; rec.py = p.y;
                rec.el.style.transform = 'translate3d(' + p.x.toFixed(1) + 'px,' + p.y.toFixed(1) + 'px,0)';
            }
        }
        for (const [k, rec] of Array.from(this._picks)) if (!seen.has(k)) { rec.el.remove(); this._picks.delete(k); }
    },

    /** Стрелки у края экрана к брейнротам за кадром: [{ x, y, ang, rarity, offscreen }]. Редкие пульсируют. */
    brainrotMarks(list) {
        if (!this.root) return;
        const pool = this._marks;
        let n = 0;
        const W = this.W, H = this.H, u = this.u;
        const mx = 34 * u, mt = 86 * u, mb = 118 * u;
        const cx = W / 2, cy = H / 2;
        for (const m of list || []) {
            if (!m || m.offscreen === false || !isFinite(m.ang)) continue;
            let rec = pool[n];
            if (!rec) {
                const el = hsuiEl('div', 'hs-mk', this.marksEl, HSUI_ICON.arrow);
                rec = { el, rarity: '', on: false };
                pool.push(rec);
            }
            n++;
            const rarity = HSUI_RAR[m.rarity] ? m.rarity : 'common';
            if (rec.rarity !== rarity) {
                rec.rarity = rarity;
                rec.el.className = 'hs-mk ' + hsuiRarCls(rarity) + (rarity !== 'common' ? ' hot' : '') + (rec.on ? ' on' : '');
                rec.el.style.setProperty('--rc', hsuiRar(rarity).color);
            }
            const ca = Math.cos(m.ang), sa = Math.sin(m.ang);
            const tx = Math.abs(ca) > 1e-4 ? (ca > 0 ? (W - mx - cx) : (mx - cx)) / ca : 1e9;
            const ty = Math.abs(sa) > 1e-4 ? (sa > 0 ? (H - mb - cy) : (mt - cy)) / sa : 1e9;
            const t = Math.max(0, Math.min(tx, ty));
            rec.el.style.transform = 'translate(' + (cx + ca * t).toFixed(1) + 'px,' + (cy + sa * t).toFixed(1) + 'px) rotate(' + m.ang.toFixed(3) + 'rad)';
            if (!rec.on) { rec.on = true; rec.el.classList.add('on'); }
        }
        for (let i = n; i < pool.length; i++) if (pool[i].on) { pool[i].on = false; pool[i].el.classList.remove('on'); }
    },

    /**
     * Брейнрот собран: баннер «НОВЫЙ БРЕЙНРОТ!» (впервые) или «+1 В КОЛЛЕКЦИЮ», иконка, редкость, мутация.
     * Эффект растёт с редкостью: от плашки до лучей, вспышки, тряски и конфетти для «Бога брейнрота» и «Секрета».
     * @param {{ id: string, name?: string, rarity?: string, mutation?: string, icon?: string, isNew?: boolean, income?: number }} item
     */
    collected(item) {
        if (!this.root || !item) return;
        const br = hsuiBr(item.id);
        const rarity = HSUI_RAR[item.rarity] ? item.rarity : (HSUI_RAR[br.rarity] ? br.rarity : 'common');
        const idx = HSUI_RAR_ORDER.indexOf(rarity);
        const r = hsuiRar(rarity);
        const isNew = typeof item.isNew === 'boolean' ? item.isNew : false;
        const mut = item.mutation && HSUI_MUT[item.mutation] ? item.mutation : '';
        const big = idx >= 5, mid = idx >= 3;
        const ms = big ? 4300 : mid ? 3500 : 2800;
        for (const o of Array.from(this.root.querySelectorAll('.hs-got'))) o.remove();   // показывается только последний
        const wrap = hsuiEl('div', 'hs-got' + (isNew ? ' new' : '') + (big ? ' big' : '') + (idx >= 4 && !hsuiReduced() ? ' shake' : ''), this.root);
        if (mid) {
            const fl = hsuiEl('div', 'hs-got-fl', wrap);
            fl.style.setProperty('--fc', rarity === 'secret' ? '#ffffff' : r.color);
        }
        const c = hsuiEl('div', 'hs-got-c ' + hsuiRarCls(rarity), wrap);
        c.style.setProperty('--rc', r.color);
        c.style.setProperty('--rca', hsuiRarGlow(rarity));
        c.style.setProperty('--ms', String(ms));
        if (idx >= 2) hsuiEl('div', 'hs-got-rays', c);
        const t = hsuiBig(Lang.t(isNew ? 'cl.new' : 'cl.plus'), 'hs-got-t' + (rarity === 'god' ? ' rbw' : ''), c);
        if (rarity === 'secret') { t.style.setProperty('--g1', '#ffffff'); t.style.setProperty('--g2', '#e6e6ee'); t.style.setProperty('--g3', '#9a9aae'); t.style.setProperty('--ol', '#000'); }
        const card = hsuiEl('div', 'hs-got-card', c);
        const ic = hsuiEl('div', 'hs-got-ic', card);
        hsuiIcon(item.icon || br.icon, ic, r.color, 'br');
        const tx = hsuiEl('div', 'hs-got-tx', card);
        hsuiEl('div', 'hs-got-nm', tx).textContent = item.name || br.name;
        const row = hsuiEl('div', 'hs-got-row', tx);
        hsuiEl('span', 'hs-rr', row).textContent = hsuiRarName(rarity);
        if (mut) hsuiEl('span', 'hs-got-mu', row).textContent = hsuiMutName(mut);
        if (typeof item.income === 'number' && item.income > 0) hsuiEl('span', 'hs-got-pl', row).textContent = '+' + Lang.t('iv.income', { n: hsuiFmt10(item.income) });
        // конфетти и звёздные всплески: от «Эпика» заметно, у god/secret — много
        if (idx >= 2) this._gotFx(wrap, card, rarity, big ? 34 : mid ? 22 : 12);
        window.setTimeout(() => wrap.remove(), ms + 120);
    },

    _gotFx(wrap, card, rarity, n) {
        if (hsuiReduced()) { this._burst(card, 6); return; }
        const cols = rarity === 'god' ? ['#ff4d6d', '#ffb02e', '#fff04d', '#5cf05c', '#3de0ff', '#7a6bff', '#e04dff'] :
            rarity === 'secret' ? ['#ffffff', '#000000', '#c8c8d8', '#ffffff'] :
            [hsuiRar(rarity).color, '#ffffff', '#ffe45c', hsuiRar(rarity).color];
        if (HSUI_RAR_ORDER.indexOf(rarity) >= 4) {
            const cf = hsuiEl('div', 'hs-got-conf', wrap);
            for (let i = 0; i < n + 12; i++) {
                const e = hsuiEl('i', '', cf);
                e.style.setProperty('--x', (Math.random() * 100).toFixed(1) + '%');
                e.style.setProperty('--c', cols[i % cols.length]);
                e.style.setProperty('--w', (6 + Math.random() * 7).toFixed(1) + 'px');
                e.style.setProperty('--t', (2.2 + Math.random() * 1.8).toFixed(2) + 's');
                e.style.setProperty('--dl', (Math.random() * 0.6).toFixed(2) + 's');
                e.style.setProperty('--dx', ((Math.random() - 0.5) * 140).toFixed(0) + 'px');
                e.style.setProperty('--r', ((Math.random() < 0.5 ? -1 : 1) * (360 + Math.random() * 540)).toFixed(0) + 'deg');
            }
        }
        this._burst(card, n, cols);
        window.setTimeout(() => { if (wrap.isConnected) this._burst(card, Math.round(n * 0.6), cols); }, 520);
    },
};
