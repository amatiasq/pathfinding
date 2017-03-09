import { drawSquare } from "./utils";
import { Color } from "./config";
import MAP_DATA from "./map-data";
import AStar from "./pathfinding/a-star";
import { World } from "./world/world";
import Tile from "./world/tile";
import { Pathfinding } from "./pathfinding/pathfinding";


const TILE_SIZE = 15;
const CLUSTER_SIZE = 10;
const DIAGONAL_MOVEMENT_COST = 1.4;
const CLOSER_MODIFIER = 2;

const world = new World(MAP_DATA, TILE_SIZE, DIAGONAL_MOVEMENT_COST);
const aStar = new AStar<Tile>(CLOSER_MODIFIER);
const pathfinding = new Pathfinding(world, aStar, CLUSTER_SIZE);
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

canvas.width = document.body.clientWidth;
canvas.height = document.body.clientHeight;
ctx.translate(TILE_SIZE, TILE_SIZE);

/*
const result = pathfinding.resolve(world.get(10, 0), world.get(40, 0));

if (result)
  for (const tile of result.tiles)
    (tile as Tile).color = 'green';
*/


const failure = [ world.get(10, 0), world.get(35, 0) ];
const successful = [ world.get(10, 0), world.get(35, 25) ];


test({
  'successful hierarchical': (repetitions: number) => {
    for (let i = 0; i < repetitions; i++)
      pathfinding.resolve(successful[0], successful[1]);
  },
  'failure hierarchical': (repetitions: number) => {
    for (let i = 0; i < repetitions; i++)
      pathfinding.resolve(failure[0], failure[1]);
  },
  'successful non-hierarchical': (repetitions: number) => {
    for (let i = 0; i < repetitions; i++)
      aStar.getPath(successful[0], successful[1]);
  },
  'failure non-hierarchical': (repetitions: number) => {
    for (let i = 0; i < repetitions; i++)
      aStar.getPath(failure[0], failure[1]);
  },
});


function test(cases: any) {
  const REPETITIONS = 100;
  const keys = Object.keys(cases);

  for (const key of keys) {
    const before = performance.now();
    const result = cases[key](REPETITIONS);
    const after = performance.now();
    console.log(`${key} = ${after - before}ms`);
  }
}


frame();


function frame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  world.forEach(tile => tile.print(ctx));

  pathfinding.forEach((cluster, pathfinding) => {
    const depth = 0;
    const size = (CLUSTER_SIZE ** (depth + 1)) * TILE_SIZE;
    const coords = cluster.location.multiply(size);

    drawSquare(ctx, coords.x, coords.y, size, {
      color: Color.CLUSTER[depth].toString(),
      width: (depth + 1) * 2,
    });
  });

  // requestAnimationFrame(frame);
}
