import Quadtree from 'immutable-quadtrees';
import { Map as map } from 'immutable';

function boundary(x, y, width, height) {
  return map({ x, y, width, height });
}

function colored(color) {
  return map({ color });
}

function ranged(x, y, w, h) {
  return map({ range: boundary(x - w, y - h, 2 * w, 2 * h) });
}

function goblin(x, y) {
  return boundary(x, y, 1, 1).merge(colored('#b1c686')).merge(ranged(x, y, 12, 12));
}

function cow(x, y) {
  return boundary(x, y, 1, 2).merge(colored('#675246')).merge(ranged(x, y, 8, 8));
}

function player(x, y) {
  return boundary(x, y, 1, 1).merge(colored('#FFFFFF'));
}

function hans(x, y) {
  return boundary(x, y, 1, 1).merge(colored('#f5df0d')).merge(ranged(x, y, 5, 5));
}

function move(npc) {
  const bound = npc.get('range');
  let dx = Math.round(Math.random() * 2 - 1);
  let dy = Math.round(Math.random() * 2 - 1);

  if (
    npc.get('x') + dx < bound.get('x') ||
    npc.get('x') + dx > bound.get('x') + bound.get('width')
  ) {
    dx = -1 * dx;
  }

  if (
    npc.get('y') + dy < bound.get('y') ||
    npc.get('y') + dy > bound.get('y') + bound.get('height')
  ) {
    dy = -1 * dy;
  }

  return npc
    .update('x', (x) => x + dx)
    .update('y', (y) => y + dy);
}

function generateBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function range(n) {
  return Array.apply(null, { length: n }).map(Number.call, Number);
}

function generateMap(quadtree, items) {
  const temp = Quadtree.clear(quadtree);

  return Quadtree.batchInsert(temp, items);
}

function viewport(p, w, h) {
  return boundary(
    p.get('x') - Math.floor(w / 2),
    p.get('y') - Math.floor(h / 2),
    w,
    h
  );
}

function absoluteToRelativeCoords(item, view) {
  return map({
    x: item.get('x') - view.get('x'),
    y: item.get('y') - view.get('y'),
  });
}

function drawMap(context, creatures, width, height, tileSize, view) {
  // 73be51
  context.fillStyle = '#73be51';
  context.fillRect(0, 0, width, height);

  creatures.map((creature) => {
    const coords = absoluteToRelativeCoords(creature, view);

    context.fillStyle = creature.get('color');
    context.fillRect((coords.get('x') - 1) * tileSize, (coords.get('y') - 1) * tileSize, creature.get('width') * tileSize, creature.get('height') * tileSize);
  });
}

const width = 192;
const height = 128;

let cows = range(50).map(() => cow(generateBetween(0, width), generateBetween(0, height)));
let goblins = range(70).map(() => goblin(generateBetween(0, width), generateBetween(0, height)));
let Hans = hans(width / 2 - 3, height / 2 - 5);
const Player = player(width / 2, height / 2);

let quadtree = Quadtree.create(boundary(0, 0, width, height));

const stage = viewport(Player, 48, 32);

const canvas = document.getElementById('game');
const context = canvas.getContext('2d');

setInterval(() => {
  cows = cows.map((c) => move(c));
  goblins = goblins.map((g) => move(g));
  Hans = move(Hans);

  const gameobjects = cows.concat(goblins).concat(Hans).concat(Player);
  quadtree = generateMap(quadtree, gameobjects);

  const items = Quadtree.search(quadtree, stage);
  console.log(items.toJS());

  drawMap(context, items, 768, 512, 16, stage);
}, 600);
