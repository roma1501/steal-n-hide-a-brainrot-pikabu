// GameKit.js — коллизии набора стен (Nav.register) и классификация объектов карты.
// Точные фигуры из Blender лежат в docs/kit/<тема>.json; tools/kit/build-kit.mjs переносит их
// в HS_KIT_SHAPES ниже. Модель без точной фигуры получает фигуру по имени детали (размеры —
// docs/GAME-SPEC.md). Укрытия (-hide) и декор — без коллизий.

const HS_THEMES = ['mint', 'citrus', 'block', 'candy', 'tropic', 'toy', 'ice', 'neon', 'space', 'carnival'];

/** Точные фигуры из docs/kit (пишет tools/kit/build-kit.mjs). @type {Record<string, any[]>} */
const HS_KIT_SHAPES = {
    ['assets/' + 'models/kit/block-wall1.glb']: [{t: 'box', x: 0, y: 0, w: 200, d: 40}],
    ['assets/' + 'models/kit/block-wall2.glb']: [{t: 'box', x: 0, y: 0, w: 400, d: 40}],
    ['assets/' + 'models/kit/block-post.glb']: [{t: 'box', x: 0, y: 0, w: 50, d: 50}],
    ['assets/' + 'models/kit/block-border.glb']: [{t: 'box', x: 0, y: 0, w: 400, d: 70}],
    ['assets/' + 'models/kit/block-block.glb']: [{t: 'box', x: 0, y: 0, w: 200, d: 200}],
    ['assets/' + 'models/kit/block-prop1.glb']: [{t: 'box', x: 0, y: 0, w: 160, d: 46}],
    ['assets/' + 'models/kit/block-prop2.glb']: [{t: 'box', x: 0, y: 0, w: 90, d: 90}],
    ['assets/' + 'models/kit/block-prop3.glb']: [{t: 'circle', x: 0, y: 0, r: 16}],
    ['assets/' + 'models/kit/candy-wall1.glb']: [{t: 'box', x: 0, y: 0, w: 200, d: 40}],
    ['assets/' + 'models/kit/candy-wall2.glb']: [{t: 'box', x: 0, y: 0, w: 400, d: 40}],
    ['assets/' + 'models/kit/candy-post.glb']: [{t: 'box', x: 0, y: 0, w: 50, d: 50}],
    ['assets/' + 'models/kit/candy-border.glb']: [{t: 'box', x: 0, y: 0, w: 400, d: 70}],
    ['assets/' + 'models/kit/candy-block.glb']: [{t: 'circle', x: 0, y: 0, r: 100}],
    ['assets/' + 'models/kit/candy-prop1.glb']: [{t: 'box', x: 0, y: 0, w: 100, d: 100}],
    ['assets/' + 'models/kit/candy-prop2.glb']: [{t: 'circle', x: 0, y: 0, r: 25}],
    ['assets/' + 'models/kit/candy-prop3.glb']: [{t: 'circle', x: 0, y: 0, r: 34}],
    ['assets/' + 'models/kit/carnival-wall1.glb']: [{t: 'box', x: 0, y: 0, w: 200, d: 40}],
    ['assets/' + 'models/kit/carnival-wall2.glb']: [{t: 'box', x: 0, y: 0, w: 400, d: 40}],
    ['assets/' + 'models/kit/carnival-post.glb']: [{t: 'box', x: 0, y: 0, w: 50, d: 50}],
    ['assets/' + 'models/kit/carnival-border.glb']: [{t: 'box', x: 0, y: 0, w: 400, d: 70}],
    ['assets/' + 'models/kit/carnival-block.glb']: [{t: 'circle', x: 0, y: 0, r: 100}],
    ['assets/' + 'models/kit/carnival-prop1.glb']: [{t: 'circle', x: 0, y: 0, r: 45}],
    ['assets/' + 'models/kit/carnival-prop2.glb']: [{t: 'box', x: 0, y: 0, w: 74, d: 74}],
    ['assets/' + 'models/kit/carnival-prop3.glb']: [{t: 'circle', x: 0, y: 0, r: 38}],
    ['assets/' + 'models/kit/citrus-wall1.glb']: [{t: 'box', x: 0, y: 0, w: 200, d: 40}],
    ['assets/' + 'models/kit/citrus-wall2.glb']: [{t: 'box', x: 0, y: 0, w: 400, d: 40}],
    ['assets/' + 'models/kit/citrus-post.glb']: [{t: 'box', x: 0, y: 0, w: 50, d: 50}],
    ['assets/' + 'models/kit/citrus-border.glb']: [{t: 'box', x: 0, y: 0, w: 400, d: 70}],
    ['assets/' + 'models/kit/citrus-block.glb']: [{t: 'box', x: 0, y: 0, w: 200, d: 200}],
    ['assets/' + 'models/kit/citrus-prop1.glb']: [{t: 'box', x: 0, y: 0, w: 110, d: 76}],
    ['assets/' + 'models/kit/citrus-prop2.glb']: [{t: 'box', x: 72.9, y: 68.4, w: 57.2, d: 40, a: -99},{t: 'box', x: 56.5, y: 17.8, w: 57.2, d: 40, a: -117},{t: 'box', x: 25.2, y: -25.2, w: 57.2, d: 40, a: -135},{t: 'box', x: -17.8, y: -56.5, w: 57.2, d: 40, a: -153},{t: 'box', x: -68.4, y: -72.9, w: 57.2, d: 40, a: -171}],
    ['assets/' + 'models/kit/citrus-prop3.glb']: [{t: 'circle', x: 0, y: 0, r: 48}],
    ['assets/' + 'models/kit/ice-wall1.glb']: [{t: 'box', x: 0, y: 0, w: 200, d: 40}],
    ['assets/' + 'models/kit/ice-wall2.glb']: [{t: 'box', x: 0, y: 0, w: 400, d: 40}],
    ['assets/' + 'models/kit/ice-post.glb']: [{t: 'box', x: 0, y: 0, w: 50, d: 50}],
    ['assets/' + 'models/kit/ice-border.glb']: [{t: 'box', x: 0, y: 0, w: 400, d: 70}],
    ['assets/' + 'models/kit/ice-block.glb']: [{t: 'box', x: 0, y: 0, w: 200, d: 200}],
    ['assets/' + 'models/kit/ice-prop1.glb']: [{t: 'box', x: 8.6, y: 0.1, w: 142.9, d: 111.9}],
    ['assets/' + 'models/kit/ice-prop2.glb']: [{t: 'box', x: 0.5, y: -3.8, w: 165, d: 122.4}],
    ['assets/' + 'models/kit/ice-prop3.glb']: [{t: 'circle', x: 0, y: 0, r: 38}],
    ['assets/' + 'models/kit/mint-wall1.glb']: [{t: 'box', x: 0, y: 0, w: 200, d: 40}],
    ['assets/' + 'models/kit/mint-wall2.glb']: [{t: 'box', x: 0, y: 0, w: 400, d: 40}],
    ['assets/' + 'models/kit/mint-post.glb']: [{t: 'box', x: 0, y: 0, w: 50, d: 50}],
    ['assets/' + 'models/kit/mint-border.glb']: [{t: 'box', x: 0, y: 0, w: 400, d: 70}],
    ['assets/' + 'models/kit/mint-block.glb']: [{t: 'box', x: 0, y: 0, w: 200, d: 200}],
    ['assets/' + 'models/kit/mint-prop1.glb']: [{t: 'box', x: 0, y: 0, w: 200, d: 22}],
    ['assets/' + 'models/kit/mint-prop2.glb']: [{t: 'box', x: 0, y: 0, w: 84, d: 84}],
    ['assets/' + 'models/kit/mint-prop3.glb']: [{t: 'circle', x: 0, y: 0, r: 32}],
    ['assets/' + 'models/kit/neon-wall1.glb']: [{t: 'box', x: 0, y: 0, w: 200, d: 40}],
    ['assets/' + 'models/kit/neon-wall2.glb']: [{t: 'box', x: 0, y: 0, w: 400, d: 40}],
    ['assets/' + 'models/kit/neon-post.glb']: [{t: 'box', x: 0, y: 0, w: 50, d: 50}],
    ['assets/' + 'models/kit/neon-border.glb']: [{t: 'box', x: 0, y: 0, w: 400, d: 70}],
    ['assets/' + 'models/kit/neon-block.glb']: [{t: 'box', x: 0, y: 0, w: 200, d: 200}],
    ['assets/' + 'models/kit/neon-prop1.glb']: [{t: 'box', x: 0, y: 0, w: 100, d: 80}],
    ['assets/' + 'models/kit/neon-prop2.glb']: [{t: 'box', x: 0, y: 0, w: 86, d: 86}],
    ['assets/' + 'models/kit/neon-prop3.glb']: [{t: 'box', x: 0, y: 0, w: 40, d: 120}],
    ['assets/' + 'models/kit/space-wall1.glb']: [{t: 'box', x: 0, y: 0, w: 200, d: 40}],
    ['assets/' + 'models/kit/space-wall2.glb']: [{t: 'box', x: 0, y: 0, w: 400, d: 40}],
    ['assets/' + 'models/kit/space-post.glb']: [{t: 'box', x: 0, y: 0, w: 50, d: 50}],
    ['assets/' + 'models/kit/space-border.glb']: [{t: 'box', x: 0, y: 0, w: 400, d: 70}],
    ['assets/' + 'models/kit/space-block.glb']: [{t: 'box', x: 0, y: 0, w: 200, d: 200}],
    ['assets/' + 'models/kit/space-prop1.glb']: [{t: 'box', x: 0, y: 0, w: 64, d: 110}],
    ['assets/' + 'models/kit/space-prop2.glb']: [{t: 'circle', x: 0, y: 0, r: 40}],
    ['assets/' + 'models/kit/space-prop3.glb']: [{t: 'box', x: 0, y: 0, w: 64, d: 64}],
    ['assets/' + 'models/kit/toy-wall1.glb']: [{t: 'box', x: 0, y: 0, w: 200, d: 40}],
    ['assets/' + 'models/kit/toy-wall2.glb']: [{t: 'box', x: 0, y: 0, w: 400, d: 40}],
    ['assets/' + 'models/kit/toy-post.glb']: [{t: 'box', x: 0, y: 0, w: 50, d: 50}],
    ['assets/' + 'models/kit/toy-border.glb']: [{t: 'box', x: 0, y: 0, w: 400, d: 70}],
    ['assets/' + 'models/kit/toy-block.glb']: [{t: 'box', x: 0, y: 0, w: 200, d: 200}],
    ['assets/' + 'models/kit/toy-prop1.glb']: [{t: 'box', x: 0, y: 0, w: 200, d: 100}],
    ['assets/' + 'models/kit/toy-prop2.glb']: [{t: 'box', x: 6.3, y: -5.8, w: 137.9, d: 106.9}],
    ['assets/' + 'models/kit/toy-prop3.glb']: [{t: 'circle', x: 8, y: 0, r: 42}],
    ['assets/' + 'models/kit/tropic-wall1.glb']: [{t: 'box', x: 0, y: 0, w: 200, d: 40}],
    ['assets/' + 'models/kit/tropic-wall2.glb']: [{t: 'box', x: 0, y: 0, w: 400, d: 40}],
    ['assets/' + 'models/kit/tropic-post.glb']: [{t: 'box', x: 0, y: 0, w: 50, d: 50}],
    ['assets/' + 'models/kit/tropic-border.glb']: [{t: 'box', x: 0, y: 0, w: 400, d: 70}],
    ['assets/' + 'models/kit/tropic-block.glb']: [{t: 'circle', x: 0, y: 0, r: 96}],
    ['assets/' + 'models/kit/tropic-prop1.glb']: [{t: 'circle', x: 0, y: 0, r: 32}],
    ['assets/' + 'models/kit/tropic-prop2.glb']: [{t: 'box', x: 0, y: 0, w: 82, d: 82}],
    ['assets/' + 'models/kit/tropic-prop3.glb']: [{t: 'box', x: 0, y: 0, w: 92, d: 62}],
    ['assets/' + 'models/kit2/block-plotwall1.glb']: [{t: 'box', x: 0, y: 0, w: 200, d: 40}],
    ['assets/' + 'models/kit2/block-plotwall2.glb']: [{t: 'box', x: 0, y: 0, w: 400, d: 40}],
    ['assets/' + 'models/kit2/block-post.glb']: [{t: 'box', x: 0, y: 0, w: 50, d: 50}],
    ['assets/' + 'models/kit2/block-border.glb']: [{t: 'box', x: 0, y: 0, w: 400, d: 70}],
    ['assets/' + 'models/kit2/block-gate.glb']: [{t: 'box', x: -88, y: 0, w: 24, d: 40},{t: 'box', x: 88, y: 0, w: 24, d: 40}],
    ['assets/' + 'models/kit2/block-gateframe.glb']: [{t: 'box', x: -88, y: 0, w: 24, d: 40},{t: 'box', x: 88, y: 0, w: 24, d: 40}],
    ['assets/' + 'models/kit2/block-sign.glb']: [{t: 'circle', x: 0, y: 0, r: 10}],
    ['assets/' + 'models/kit2/block-lockbtn.glb']: [{t: 'circle', x: 0, y: 0, r: 20}],
    ['assets/' + 'models/kit2/block-podium.glb']: [{t: 'circle', x: 0, y: 0, r: 45}],
    ['assets/' + 'models/kit2/block-cave.glb']: [{t: 'box', x: 0, y: 165, w: 300, d: 90},{t: 'box', x: 0, y: -165, w: 300, d: 90}],
    ['assets/' + 'models/kit2/block-exit.glb']: [{t: 'box', x: 0, y: 210, w: 60, d: 60},{t: 'box', x: 0, y: -210, w: 60, d: 60}],
    ['assets/' + 'models/kit2/block-crate.glb']: [{t: 'box', x: 0, y: 0, w: 80, d: 80}],
    ['assets/' + 'models/kit2/block-lamp.glb']: [{t: 'circle', x: 0, y: 0, r: 14}],
    ['assets/' + 'models/kit2/block-shop.glb']: [{t: 'box', x: 0, y: 0, w: 200, d: 160}],
    ['assets/' + 'models/kit2/candy-plotwall1.glb']: [{t: 'box', x: 0, y: 0, w: 200, d: 40}],
    ['assets/' + 'models/kit2/candy-plotwall2.glb']: [{t: 'box', x: 0, y: 0, w: 400, d: 40}],
    ['assets/' + 'models/kit2/candy-post.glb']: [{t: 'box', x: 0, y: 0, w: 50, d: 50}],
    ['assets/' + 'models/kit2/candy-border.glb']: [{t: 'box', x: 0, y: 0, w: 400, d: 70}],
    ['assets/' + 'models/kit2/candy-gate.glb']: [{t: 'box', x: -88, y: 0, w: 24, d: 40},{t: 'box', x: 88, y: 0, w: 24, d: 40}],
    ['assets/' + 'models/kit2/candy-gateframe.glb']: [{t: 'box', x: -88, y: 0, w: 24, d: 40},{t: 'box', x: 88, y: 0, w: 24, d: 40}],
    ['assets/' + 'models/kit2/candy-sign.glb']: [{t: 'circle', x: 0, y: 0, r: 10}],
    ['assets/' + 'models/kit2/candy-lockbtn.glb']: [{t: 'circle', x: 0, y: 0, r: 20}],
    ['assets/' + 'models/kit2/candy-podium.glb']: [{t: 'circle', x: 0, y: 0, r: 45}],
    ['assets/' + 'models/kit2/candy-cave.glb']: [{t: 'box', x: 0, y: 165, w: 300, d: 90},{t: 'box', x: 0, y: -165, w: 300, d: 90}],
    ['assets/' + 'models/kit2/candy-exit.glb']: [{t: 'box', x: 0, y: 210, w: 60, d: 60},{t: 'box', x: 0, y: -210, w: 60, d: 60}],
    ['assets/' + 'models/kit2/candy-crate.glb']: [{t: 'box', x: 0, y: 0, w: 80, d: 80}],
    ['assets/' + 'models/kit2/candy-lamp.glb']: [{t: 'circle', x: 0, y: 0, r: 14}],
    ['assets/' + 'models/kit2/candy-shop.glb']: [{t: 'box', x: 0, y: 0, w: 200, d: 160}],
    ['assets/' + 'models/kit2/carnival-plotwall1.glb']: [{t: 'box', x: 0, y: 0, w: 200, d: 40}],
    ['assets/' + 'models/kit2/carnival-plotwall2.glb']: [{t: 'box', x: 0, y: 0, w: 400, d: 40}],
    ['assets/' + 'models/kit2/carnival-post.glb']: [{t: 'box', x: 0, y: 0, w: 50, d: 50}],
    ['assets/' + 'models/kit2/carnival-border.glb']: [{t: 'box', x: 0, y: 0, w: 400, d: 70}],
    ['assets/' + 'models/kit2/carnival-gate.glb']: [{t: 'box', x: -88, y: 0, w: 24, d: 40},{t: 'box', x: 88, y: 0, w: 24, d: 40}],
    ['assets/' + 'models/kit2/carnival-gateframe.glb']: [{t: 'box', x: -88, y: 0, w: 24, d: 40},{t: 'box', x: 88, y: 0, w: 24, d: 40}],
    ['assets/' + 'models/kit2/carnival-sign.glb']: [{t: 'circle', x: 0, y: 0, r: 10}],
    ['assets/' + 'models/kit2/carnival-lockbtn.glb']: [{t: 'circle', x: 0, y: 0, r: 20}],
    ['assets/' + 'models/kit2/carnival-podium.glb']: [{t: 'circle', x: 0, y: 0, r: 45}],
    ['assets/' + 'models/kit2/carnival-cave.glb']: [{t: 'box', x: 0, y: -165, w: 300, d: 90},{t: 'box', x: 0, y: 165, w: 300, d: 90}],
    ['assets/' + 'models/kit2/carnival-exit.glb']: [{t: 'box', x: 0, y: -210, w: 80, d: 70},{t: 'box', x: 0, y: 210, w: 80, d: 70}],
    ['assets/' + 'models/kit2/carnival-crate.glb']: [{t: 'box', x: 0, y: 0, w: 90, d: 90}],
    ['assets/' + 'models/kit2/carnival-lamp.glb']: [{t: 'circle', x: 0, y: 0, r: 14}],
    ['assets/' + 'models/kit2/carnival-shop.glb']: [{t: 'box', x: 0, y: 0, w: 200, d: 160}],
    ['assets/' + 'models/kit2/citrus-plotwall1.glb']: [{t: 'box', x: 0, y: 0, w: 200, d: 40}],
    ['assets/' + 'models/kit2/citrus-plotwall2.glb']: [{t: 'box', x: 0, y: 0, w: 400, d: 40}],
    ['assets/' + 'models/kit2/citrus-post.glb']: [{t: 'box', x: 0, y: 0, w: 50, d: 50}],
    ['assets/' + 'models/kit2/citrus-border.glb']: [{t: 'box', x: 0, y: 0, w: 400, d: 70}],
    ['assets/' + 'models/kit2/citrus-gate.glb']: [{t: 'box', x: -88, y: 0, w: 24, d: 40},{t: 'box', x: 88, y: 0, w: 24, d: 40}],
    ['assets/' + 'models/kit2/citrus-gateframe.glb']: [{t: 'box', x: -88, y: 0, w: 24, d: 40},{t: 'box', x: 88, y: 0, w: 24, d: 40}],
    ['assets/' + 'models/kit2/citrus-sign.glb']: [{t: 'circle', x: 0, y: 0, r: 10}],
    ['assets/' + 'models/kit2/citrus-lockbtn.glb']: [{t: 'circle', x: 0, y: 0, r: 20}],
    ['assets/' + 'models/kit2/citrus-podium.glb']: [{t: 'circle', x: 0, y: 0, r: 45}],
    ['assets/' + 'models/kit2/citrus-cave.glb']: [{t: 'box', x: 0, y: 165, w: 300, d: 90},{t: 'box', x: 0, y: -165, w: 300, d: 90}],
    ['assets/' + 'models/kit2/citrus-exit.glb']: [{t: 'box', x: 0, y: 210, w: 60, d: 60},{t: 'box', x: 0, y: -210, w: 60, d: 60}],
    ['assets/' + 'models/kit2/citrus-crate.glb']: [{t: 'box', x: 0, y: 0, w: 80, d: 80}],
    ['assets/' + 'models/kit2/citrus-lamp.glb']: [{t: 'circle', x: 0, y: 0, r: 14}],
    ['assets/' + 'models/kit2/citrus-shop.glb']: [{t: 'box', x: 0, y: 0, w: 200, d: 160}],
    ['assets/' + 'models/kit2/ice-plotwall1.glb']: [{t: 'box', x: 0, y: 0, w: 200, d: 40}],
    ['assets/' + 'models/kit2/ice-plotwall2.glb']: [{t: 'box', x: 0, y: 0, w: 400, d: 40}],
    ['assets/' + 'models/kit2/ice-post.glb']: [{t: 'box', x: 0, y: 0, w: 50, d: 50}],
    ['assets/' + 'models/kit2/ice-border.glb']: [{t: 'box', x: 0, y: 0, w: 400, d: 70}],
    ['assets/' + 'models/kit2/ice-gate.glb']: [{t: 'box', x: -88, y: 0, w: 24, d: 40},{t: 'box', x: 88, y: 0, w: 24, d: 40}],
    ['assets/' + 'models/kit2/ice-gateframe.glb']: [{t: 'box', x: -88, y: 0, w: 24, d: 40},{t: 'box', x: 88, y: 0, w: 24, d: 40}],
    ['assets/' + 'models/kit2/ice-sign.glb']: [{t: 'circle', x: 0, y: 0, r: 10}],
    ['assets/' + 'models/kit2/ice-lockbtn.glb']: [{t: 'circle', x: 0, y: 0, r: 20}],
    ['assets/' + 'models/kit2/ice-podium.glb']: [{t: 'circle', x: 0, y: 0, r: 45}],
    ['assets/' + 'models/kit2/ice-cave.glb']: [{t: 'box', x: 0, y: -165, w: 300, d: 90},{t: 'box', x: 0, y: 165, w: 300, d: 90}],
    ['assets/' + 'models/kit2/ice-exit.glb']: [{t: 'box', x: 0, y: -205, w: 80, d: 60},{t: 'box', x: 0, y: 205, w: 80, d: 60}],
    ['assets/' + 'models/kit2/ice-crate.glb']: [{t: 'box', x: 0, y: 0, w: 90.8, d: 90.8}],
    ['assets/' + 'models/kit2/ice-lamp.glb']: [{t: 'circle', x: 0, y: 0, r: 14}],
    ['assets/' + 'models/kit2/ice-shop.glb']: [{t: 'box', x: 0, y: 0, w: 200, d: 160}],
    ['assets/' + 'models/kit2/mint-plotwall1.glb']: [{t: 'box', x: 0, y: 0, w: 200, d: 40}],
    ['assets/' + 'models/kit2/mint-plotwall2.glb']: [{t: 'box', x: 0, y: 0, w: 400, d: 40}],
    ['assets/' + 'models/kit2/mint-post.glb']: [{t: 'box', x: 0, y: 0, w: 50, d: 50}],
    ['assets/' + 'models/kit2/mint-border.glb']: [{t: 'box', x: 0, y: 0, w: 400, d: 70}],
    ['assets/' + 'models/kit2/mint-gate.glb']: [{t: 'box', x: -88, y: 0, w: 24, d: 40},{t: 'box', x: 88, y: 0, w: 24, d: 40}],
    ['assets/' + 'models/kit2/mint-gateframe.glb']: [{t: 'box', x: -88, y: 0, w: 24, d: 40},{t: 'box', x: 88, y: 0, w: 24, d: 40}],
    ['assets/' + 'models/kit2/mint-sign.glb']: [{t: 'circle', x: 0, y: 0, r: 10}],
    ['assets/' + 'models/kit2/mint-lockbtn.glb']: [{t: 'circle', x: 0, y: 0, r: 20}],
    ['assets/' + 'models/kit2/mint-podium.glb']: [{t: 'circle', x: 0, y: 0, r: 45}],
    ['assets/' + 'models/kit2/mint-cave.glb']: [{t: 'box', x: 0, y: 165, w: 300, d: 90},{t: 'box', x: 0, y: -165, w: 300, d: 90}],
    ['assets/' + 'models/kit2/mint-exit.glb']: [{t: 'box', x: 0, y: 210, w: 60, d: 60},{t: 'box', x: 0, y: -210, w: 60, d: 60}],
    ['assets/' + 'models/kit2/mint-crate.glb']: [{t: 'box', x: 0, y: 0, w: 80, d: 80}],
    ['assets/' + 'models/kit2/mint-lamp.glb']: [{t: 'circle', x: 0, y: 0, r: 14}],
    ['assets/' + 'models/kit2/mint-shop.glb']: [{t: 'box', x: 0, y: 0, w: 200, d: 160}],
    ['assets/' + 'models/kit2/neon-plotwall1.glb']: [{t: 'box', x: 0, y: 0, w: 200, d: 40}],
    ['assets/' + 'models/kit2/neon-plotwall2.glb']: [{t: 'box', x: 0, y: 0, w: 400, d: 40}],
    ['assets/' + 'models/kit2/neon-post.glb']: [{t: 'box', x: 0, y: 0, w: 50, d: 50}],
    ['assets/' + 'models/kit2/neon-border.glb']: [{t: 'box', x: 0, y: 0, w: 400, d: 70}],
    ['assets/' + 'models/kit2/neon-gate.glb']: [{t: 'box', x: -88, y: 0, w: 24, d: 40},{t: 'box', x: 88, y: 0, w: 24, d: 40}],
    ['assets/' + 'models/kit2/neon-gateframe.glb']: [{t: 'box', x: -88, y: 0, w: 24, d: 40},{t: 'box', x: 88, y: 0, w: 24, d: 40}],
    ['assets/' + 'models/kit2/neon-sign.glb']: [{t: 'circle', x: 0, y: 0, r: 10}],
    ['assets/' + 'models/kit2/neon-lockbtn.glb']: [{t: 'circle', x: 0, y: 0, r: 20}],
    ['assets/' + 'models/kit2/neon-podium.glb']: [{t: 'circle', x: 0, y: 0, r: 45}],
    ['assets/' + 'models/kit2/neon-cave.glb']: [{t: 'box', x: 0, y: -165, w: 300, d: 90},{t: 'box', x: 0, y: 165, w: 300, d: 90}],
    ['assets/' + 'models/kit2/neon-exit.glb']: [{t: 'box', x: 0, y: -205, w: 80, d: 60},{t: 'box', x: 0, y: 205, w: 80, d: 60}],
    ['assets/' + 'models/kit2/neon-crate.glb']: [{t: 'box', x: 0, y: 0, w: 90.1, d: 90.1}],
    ['assets/' + 'models/kit2/neon-lamp.glb']: [{t: 'circle', x: 0, y: 0, r: 14}],
    ['assets/' + 'models/kit2/neon-shop.glb']: [{t: 'box', x: 0, y: 0, w: 200, d: 160}],
    ['assets/' + 'models/kit2/space-plotwall1.glb']: [{t: 'box', x: 0, y: 0, w: 200, d: 40}],
    ['assets/' + 'models/kit2/space-plotwall2.glb']: [{t: 'box', x: 0, y: 0, w: 400, d: 40}],
    ['assets/' + 'models/kit2/space-post.glb']: [{t: 'box', x: 0, y: 0, w: 50, d: 50}],
    ['assets/' + 'models/kit2/space-border.glb']: [{t: 'box', x: 0, y: 0, w: 400, d: 70}],
    ['assets/' + 'models/kit2/space-gate.glb']: [{t: 'box', x: -88, y: 0, w: 24, d: 40},{t: 'box', x: 88, y: 0, w: 24, d: 40}],
    ['assets/' + 'models/kit2/space-gateframe.glb']: [{t: 'box', x: -88, y: 0, w: 24, d: 40},{t: 'box', x: 88, y: 0, w: 24, d: 40}],
    ['assets/' + 'models/kit2/space-sign.glb']: [{t: 'circle', x: 0, y: 0, r: 10}],
    ['assets/' + 'models/kit2/space-lockbtn.glb']: [{t: 'circle', x: 0, y: 0, r: 20}],
    ['assets/' + 'models/kit2/space-podium.glb']: [{t: 'circle', x: 0, y: 0, r: 45}],
    ['assets/' + 'models/kit2/space-cave.glb']: [{t: 'box', x: 0, y: -165, w: 300, d: 90},{t: 'box', x: 0, y: 165, w: 300, d: 90}],
    ['assets/' + 'models/kit2/space-exit.glb']: [{t: 'box', x: 0, y: -205, w: 84, d: 62},{t: 'box', x: 0, y: 205, w: 84, d: 62}],
    ['assets/' + 'models/kit2/space-crate.glb']: [{t: 'box', x: 0, y: 0, w: 90.1, d: 90.1}],
    ['assets/' + 'models/kit2/space-lamp.glb']: [{t: 'circle', x: 0, y: 0, r: 14}],
    ['assets/' + 'models/kit2/space-shop.glb']: [{t: 'box', x: 0, y: 0, w: 200, d: 160}],
    ['assets/' + 'models/kit2/toy-plotwall1.glb']: [{t: 'box', x: 0, y: 0, w: 200, d: 40}],
    ['assets/' + 'models/kit2/toy-plotwall2.glb']: [{t: 'box', x: 0, y: 0, w: 400, d: 40}],
    ['assets/' + 'models/kit2/toy-post.glb']: [{t: 'box', x: 0, y: 0, w: 50, d: 50}],
    ['assets/' + 'models/kit2/toy-border.glb']: [{t: 'box', x: 0, y: 0, w: 400, d: 70}],
    ['assets/' + 'models/kit2/toy-gate.glb']: [{t: 'box', x: -88, y: 0, w: 24, d: 40},{t: 'box', x: 88, y: 0, w: 24, d: 40}],
    ['assets/' + 'models/kit2/toy-gateframe.glb']: [{t: 'box', x: -88, y: 0, w: 24, d: 40},{t: 'box', x: 88, y: 0, w: 24, d: 40}],
    ['assets/' + 'models/kit2/toy-sign.glb']: [{t: 'circle', x: 0, y: 0, r: 10}],
    ['assets/' + 'models/kit2/toy-lockbtn.glb']: [{t: 'circle', x: 0, y: 0, r: 20}],
    ['assets/' + 'models/kit2/toy-podium.glb']: [{t: 'circle', x: 0, y: 0, r: 45}],
    ['assets/' + 'models/kit2/toy-cave.glb']: [{t: 'box', x: 0, y: -165, w: 300, d: 90},{t: 'box', x: 0, y: 165, w: 300, d: 90}],
    ['assets/' + 'models/kit2/toy-exit.glb']: [{t: 'box', x: 0, y: -205, w: 80, d: 60},{t: 'box', x: 0, y: 205, w: 80, d: 60}],
    ['assets/' + 'models/kit2/toy-crate.glb']: [{t: 'box', x: 0, y: 0, w: 91, d: 91}],
    ['assets/' + 'models/kit2/toy-lamp.glb']: [{t: 'circle', x: 0, y: 0, r: 14}],
    ['assets/' + 'models/kit2/toy-shop.glb']: [{t: 'box', x: 0, y: 0, w: 200, d: 160}],
    ['assets/' + 'models/kit2/tropic-plotwall1.glb']: [{t: 'box', x: 0, y: 0, w: 200, d: 40}],
    ['assets/' + 'models/kit2/tropic-plotwall2.glb']: [{t: 'box', x: 0, y: 0, w: 400, d: 40}],
    ['assets/' + 'models/kit2/tropic-post.glb']: [{t: 'box', x: 0, y: 0, w: 50, d: 50}],
    ['assets/' + 'models/kit2/tropic-border.glb']: [{t: 'box', x: 0, y: 0, w: 400, d: 70}],
    ['assets/' + 'models/kit2/tropic-gate.glb']: [{t: 'box', x: -88, y: 0, w: 24, d: 40},{t: 'box', x: 88, y: 0, w: 24, d: 40}],
    ['assets/' + 'models/kit2/tropic-gateframe.glb']: [{t: 'box', x: -88, y: 0, w: 24, d: 40},{t: 'box', x: 88, y: 0, w: 24, d: 40}],
    ['assets/' + 'models/kit2/tropic-sign.glb']: [{t: 'circle', x: 0, y: 0, r: 10}],
    ['assets/' + 'models/kit2/tropic-lockbtn.glb']: [{t: 'circle', x: 0, y: 0, r: 20}],
    ['assets/' + 'models/kit2/tropic-podium.glb']: [{t: 'circle', x: 0, y: 0, r: 45}],
    ['assets/' + 'models/kit2/tropic-cave.glb']: [{t: 'box', x: 0, y: 165, w: 300, d: 90},{t: 'box', x: 0, y: -165, w: 300, d: 90}],
    ['assets/' + 'models/kit2/tropic-exit.glb']: [{t: 'box', x: 0, y: 210, w: 60, d: 60},{t: 'box', x: 0, y: -210, w: 60, d: 60}],
    ['assets/' + 'models/kit2/tropic-crate.glb']: [{t: 'box', x: 0, y: 0, w: 80, d: 80}],
    ['assets/' + 'models/kit2/tropic-lamp.glb']: [{t: 'circle', x: 0, y: 0, r: 14}],
    ['assets/' + 'models/kit2/tropic-shop.glb']: [{t: 'box', x: 0, y: 0, w: 200, d: 160}],
};

/** @satisfies {Record<string, any>} */
const GameKit = {
    PREFIX: 'assets/' + 'models/kit/',

    /** Фигура по имени детали, если точной нет. */
    defaultShapes(part) {
        if (part === 'wall1') return [{ t: 'box', x: 0, y: 0, w: 200, d: 40 }];
        if (part === 'wall2') return [{ t: 'box', x: 0, y: 0, w: 400, d: 40 }];
        if (part === 'post') return [{ t: 'box', x: 0, y: 0, w: 50, d: 50 }];
        if (part === 'border') return [{ t: 'box', x: 0, y: 0, w: 400, d: 70 }];
        if (part === 'block') return [{ t: 'box', x: 0, y: 0, w: 190, d: 190 }];
        if (/^prop\d$/.test(part)) return [{ t: 'box', x: 0, y: 0, w: 120, d: 120 }];
        return null;
    },

    /** Фигуры JSON-формата { box: {...} } | { circle: {...} } | { t: ... } → формат Nav. */
    normalize(list) {
        const out = [];
        for (const s of list || []) {
            if (s.t) { out.push(s); continue; }
            if (s.box) out.push(Object.assign({ t: 'box' }, s.box));
            else if (s.circle) out.push(Object.assign({ t: 'circle' }, s.circle));
        }
        return out;
    },

    PREFIX2: 'assets/' + 'models/kit2/',

    /** kit2 (Steal n Hide): фигуры по имени детали, если точной нет; пол базы и дорожка — ходибельные. */
    defaultShapes2(part) {
        if (part === 'plotwall1') return [{ t: 'box', x: 0, y: 0, w: 200, d: 40 }];
        if (part === 'plotwall2') return [{ t: 'box', x: 0, y: 0, w: 400, d: 40 }];
        if (part === 'post') return [{ t: 'box', x: 0, y: 0, w: 50, d: 50 }];
        if (part === 'border') return [{ t: 'box', x: 0, y: 0, w: 400, d: 70 }];
        if (part === 'podium') return [{ t: 'circle', x: 0, y: 0, r: 45 }];
        if (part === 'lockbtn') return [{ t: 'circle', x: 0, y: 0, r: 20 }];
        if (part === 'gate' || part === 'gateframe') return [{ t: 'box', x: -88, y: 0, w: 24, d: 40 }, { t: 'box', x: 88, y: 0, w: 24, d: 40 }];
        if (part === 'lamp') return [{ t: 'circle', x: 0, y: 0, r: 14 }];
        if (part === 'crate') return [{ t: 'box', x: 0, y: 0, w: 80, d: 80 }];
        if (part === 'shop') return [{ t: 'box', x: 0, y: 0, w: 200, d: 160 }];
        if (part === 'cave') return [{ t: 'box', x: 0, y: 165, w: 300, d: 90 }, { t: 'box', x: 0, y: -165, w: 300, d: 90 }];
        if (part === 'exit') return [{ t: 'circle', x: 0, y: 210, r: 30 }, { t: 'circle', x: 0, y: -210, r: 30 }];
        return null;
    },

    /** Ходибельные поверхности kit2: пол участка (8 px) и красная дорожка (6 px). */
    walkShapes2(part) {
        if (part === 'plotfloor') return [{ t: 'walk', x: 0, y: 0, w: 600, d: 600, h: 8 }];
        if (part === 'carpet') return [{ t: 'walk', x: 0, y: 0, w: 400, d: 360, h: 6 }];
        if (part === 'collect') return [{ t: 'walk', x: 0, y: 0, w: 70, d: 70, h: 6 }];
        return null;
    },

    register() {
        const reg = {};
        for (const theme of HS_THEMES) {
            for (const part of ['plotwall1', 'plotwall2', 'post', 'border', 'gate', 'gateframe', 'sign', 'lockbtn', 'podium', 'cave', 'exit', 'crate', 'lamp', 'shop', 'plotfloor', 'carpet', 'collect']) {
                const path = this.PREFIX2 + theme + '-' + part + '.glb';
                const exact = HS_KIT_SHAPES[path];
                const solid = exact && exact.length ? this.normalize(exact) : this.defaultShapes2(part);
                const walk = this.walkShapes2(part);
                const shapes = (solid || []).concat(walk || []);
                if (shapes.length) reg[path] = shapes;
            }
        }
        for (const theme of HS_THEMES) {
            for (const part of ['wall1', 'wall2', 'post', 'border', 'block', 'prop1', 'prop2', 'prop3']) {
                const path = this.PREFIX + theme + '-' + part + '.glb';
                const exact = HS_KIT_SHAPES[path];
                const shapes = exact && exact.length ? this.normalize(exact) : this.defaultShapes(part);
                if (shapes) reg[path] = shapes;
            }
        }
        Nav.register(reg);
    },

    /** Объект карты — укрытие? */
    isHide(def) { return !!(def && def.model && /-(hide|bush)\.glb$/.test(def.model)); },
};
