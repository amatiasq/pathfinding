import { drawSquare } from "./utils";
import { Color } from "./config";
import MAP_DATA from "./map-data";
import AStar from "./pathfinding/a-star";
import { World } from "./world/world";
import Tile from "./world/tile";
import { Pathfinding } from "./pathfinding/pathfinding";


const TILE_SIZE = 10;
const CLUSTER_SIZE = 4;
const DIAGONAL_MOVEMENT_COST = 1.4;
const CLOSER_MODIFIER = 0.2;

let world: World;
let aStar: AStar<Tile>;
let pathfinding: Pathfinding;

measure('INIT', () => {
  world = new World(MAP_DATA, TILE_SIZE, DIAGONAL_MOVEMENT_COST);
  aStar = new AStar<Tile>(CLOSER_MODIFIER);
  pathfinding = new Pathfinding(world, aStar, CLUSTER_SIZE);
});

const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
canvas.width = document.body.clientWidth;
canvas.height = document.body.clientHeight;
ctx.translate(TILE_SIZE, TILE_SIZE);

const failure = [ world.get(25, 0), world.get(56, 25) ];
const successful = [ world.get(25, 0), world.get(56, 35) ];
samplePath();
// performanceTest(10);
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


function samplePath() {
  const result = pathfinding.resolve(successful[0], successful[1]);

  if (result)
    for (const tile of result.tiles)
      (tile as Tile).color = 'green';
}


function performanceTest(repetitions: number) {
  test({
    'successful non-hierarchical': () => {
      for (let i = 0; i < repetitions; i++)
        aStar.getPath(successful[0], successful[1]);
    },
    'failure non-hierarchical': () => {
      for (let i = 0; i < repetitions; i++)
        aStar.getPath(failure[0], failure[1]);
    },
    'successful hierarchical': () => {
      for (let i = 0; i < repetitions; i++)
        pathfinding.resolve(successful[0], successful[1]);
    },
    'failure hierarchical': () => {
      for (let i = 0; i < repetitions; i++)
        pathfinding.resolve(failure[0], failure[1]);
    },
  });


  function test(cases: any) {
    for (const key of Object.keys(cases))
      measure(key, cases[key]);
  }
}


function measure(message: string, operation: Function) {
  const before = performance.now();
  operation();
  const after = performance.now();
  console.log(`${message} = ${after - before}ms`);
}