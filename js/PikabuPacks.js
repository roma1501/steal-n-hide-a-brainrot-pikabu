// @ts-nocheck
// PikabuPacks.js — наборы за рубли в сборке Пикабу Игр (js/PikabuShop.js). Цены и названия товаров — в Студии
// (каталог CSV: coins_s 19 ₽, coins_m 49 ₽, coins_l 99 ₽, starter 29 ₽, no_ads 59 ₽), здесь — что игрок получает.
// Монеты — Shop.addCoins, кристаллы — save.gems, облики набора — из HS_SHOP_ITEMS (Shop.grant).
const PIKABU_GIVE = (coins, gems) => {
    if (coins) Shop.addCoins(coins, { reason: 'pikabu', save: false });
    if (gems) Game.save.gems = (Number(Game.save.gems) || 0) + gems;
    Game.persist();
};
PikabuShop.setup({
    colors: ['#00c2a8', '#7c4dff'],
    ready: () => !!(typeof Game !== 'undefined' && Game.save && Game.save.econ && typeof Shop !== 'undefined' && Shop.state),
    visible: () => Game.state === 'menu' || Game.state === 'base',
    persist: () => Game.persist(),
    button: { corner: 'tl', x: 32, y: 296 },   // справа сверху в меню тесно (валюта, «Колесо», «Подарок»)
    packs: [
        { id: 'coins_s', type: 'consumable', icon: '🪙', name: 'Горсть монет', desc: '1 000 монет на облики и умения', grant: () => PIKABU_GIVE(1000, 0) },
        { id: 'coins_m', type: 'consumable', icon: '💰', name: 'Мешок монет', desc: '3 000 монет и 20 кристаллов', grant: () => PIKABU_GIVE(3000, 20) },
        { id: 'coins_l', type: 'consumable', icon: '💎', name: 'Сундук сокровищ', desc: '8 000 монет и 80 кристаллов', best: true, grant: () => PIKABU_GIVE(8000, 80) },
        {
            id: 'starter', type: 'non_consumable', icon: '🚀', name: 'Набор астронавта', best: 'Один раз',
            desc: '1 500 монет, 30 кристаллов, облик «Астронавт», корона и радужный след',
            grant: () => PIKABU_GIVE(1500, 30),
            apply: () => ['astro', 'crown', 'trail_rainbow'].forEach((id) => { if (!Shop.owns(id)) Shop.grant(id); }),
        },
        { id: 'no_ads', type: 'non_consumable', icon: '🚫', name: 'Без рекламы', desc: 'Убирает рекламу между раундами навсегда. Награды за рекламу остаются', noAds: true },
    ],
});
