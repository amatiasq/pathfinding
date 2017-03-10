import { drawSquare } from "./utils";
import { Color } from "./config";
import MAP_DATA from "./map-data";
import AStar from "./pathfinding/a-star";
import { World } from "./world/world";
import Tile from "./world/tile";
import { Pathfinding } from "./pathfinding/pathfinding";
import * as constants from "./constants";


console.log(JSON.stringify(constants, null, '  '));


let world: World;
let aStar: AStar<Tile>;
let pathfinding: Pathfinding;
let canvas: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D;
let prevPath: IPrintablePath = null;


init();
const failure = [ world.get(25, 0), world.get(56, 25) ];
const successful = [ world.get(25, 2), world.get(33, 30) ];


if (constants.PERF_ITERATIONS)
  performanceTest(constants.PERF_ITERATIONS);

frame();

if (constants.RANDOM_PATH_INTERVAL)
  setInterval(randomPath, constants.RANDOM_PATH_INTERVAL)



function init() {
  measure('INIT', () => {
    world = new World(MAP_DATA, constants.TILE_SIZE, constants.DIAGONAL_MOVEMENT_COST);
    aStar = new AStar<Tile>(constants.CLOSER_MODIFIER);
    pathfinding = new Pathfinding(world, aStar, constants.CLUSTER_SIZE);
  });

  canvas = document.querySelector('canvas');
  ctx = canvas.getContext('2d');
  canvas.width = document.body.clientWidth;
  canvas.height = document.body.clientHeight;
  ctx.translate(constants.TILE_SIZE, constants.TILE_SIZE);
}


function frame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  world.forEach(tile => tile.print(ctx, constants.DRAW_GRID));

  if (constants.DRAW_CLUSTERS)
    drawClusters();
  
  requestAnimationFrame(frame);
}


function drawClusters() {
  pathfinding.forEach((cluster, pathfinding) => {
    const depth = 0;
    const size = (constants.CLUSTER_SIZE ** (depth + 1)) * constants.TILE_SIZE;
    const coords = cluster.location.multiply(size);

    drawSquare(ctx, coords.x, coords.y, size, {
      color: Color.CLUSTER[depth].toString(),
      width: (depth + 1) * 2,
    });
  });
}


function randomPath() {
  if (prevPath)
    prevPath.remove();
  
  const end = world.get(random(60), random(60));
  prevPath = drawPath(randomTile(), randomTile())
}


function drawPath(from: Tile, to: Tile): IPrintablePath {
  const result = pathfinding.resolve(from, to) || { tiles: [] as Tile[] };

  for (const tile of result.tiles)
    tile.color = constants.PATH_COLOR;

  from.color = constants.START_COLOR;
  to.color = constants.END_COLOR;
  
  (result as any).remove = () => {
    from.color = null;
    to.color = null;

    for (const tile of result.tiles)
      tile.color = null;
  }
    
  return result as IPrintablePath;
}


function performanceTest(repetitions: number) {
  const cases: { [key: string]: () => void } = {
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
  };

  for (const key of Object.keys(cases))
    measure(key, cases[key]);
}


function randomTile() {
  return world.get(random(world.size.x), random(world.size.y))
}

function random(max: number = 1, min: number = 0) {
  return Math.floor(Math.random() * (max - min)) + min
}

function measure(message: string, operation: Function) {
  const before = performance.now();
  operation();
  const after = performance.now();
  console.log(`${message} = ${after - before}ms`);
}


interface IPrintablePath {
  tiles: Tile[];
  remove(): void;
}