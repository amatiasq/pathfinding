import { drawSquare } from "./utils";
import { Color } from "./config";
import MAP_DATA from "./map-data";
import AStar from "./pathfinding/a-star";
import { World } from "./world/world";
import Tile from "./world/tile";
import { Pathfinding } from "./pathfinding/pathfinding";
import * as constants from "./constants";
import { Vector3D } from "./core";


console.log(JSON.stringify(constants, null, '  '));


let world: World;
let aStar: AStar<Tile>;
let pathfinding: Pathfinding;
let canvas: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D;
let prevPath: IPrintablePath = null;
const timeCost = [] as number[];


init();
const failure = [ world.get(0, 25, 0), world.get(0, 56, 25) ];
const successful = [ world.get(0, 25, 2), world.get(0, 33, 30) ];


if (constants.PERF_ITERATIONS)
  performanceTest(constants.PERF_ITERATIONS);

frame();
//randomPath();
//debugger;
// drawPath(world.get(1, 0, 4), world.get(3, 15, 15))

if (constants.RANDOM_PATH_INTERVAL)
  setInterval(randomPath, constants.RANDOM_PATH_INTERVAL)


function init() {
  measure(() => {
    /*
    const data = constants.GRID_MULTIPLIER ?
      multiplyGrid(MAP_DATA, constants.GRID_MULTIPLIER) :
      MAP_DATA;
    */

    world = new World(MAP_DATA, constants.TILE_SIZE, constants.DIAGONAL_MOVEMENT_COST, constants.LAYER_CHANGE_COST);
    aStar = new AStar<Tile>(constants.CLOSER_MODIFIER);
    pathfinding = new Pathfinding(world, aStar, constants.CLUSTER_SIZE);
  }, {
    message: 'INIT',
  });

  canvas = document.querySelector('canvas');
  ctx = canvas.getContext('2d');
  canvas.width = document.body.clientWidth;
  canvas.height = document.body.clientHeight;
  ctx.translate(constants.TILE_SIZE, constants.TILE_SIZE);
}


function frame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  world.forEach(tile => {
    // grid display
    const x = (constants.TILE_SIZE * world.size.x + constants.TILE_SIZE) * (tile.location.z % constants.LAYERS_PER_ROW);
    const y = (constants.TILE_SIZE * world.size.x + constants.TILE_SIZE) * Math.floor(tile.location.z / constants.LAYERS_PER_ROW);
    ctx.save();
    ctx.translate(x, y);
    tile.print(ctx, constants.DRAW_GRID)
    ctx.restore();
  });

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
  
  const start = new Vector3D(random(world.size.x), random(world.size.y), random(world.size.z));
  const end = new Vector3D(random(world.size.x), random(world.size.y), random(world.size.z));
  console.log(`drawPath(world.get(${start.z}, ${start.x}, ${start.y}), world.get(${end.z}, ${end.x}, ${end.y}))`);

  prevPath = drawPath(
    world.get(start.z, start.x, start.y),
    world.get(start.z, end.x, end.y),
  );
}


function drawPath(from: Tile, to: Tile): IPrintablePath {
  const {
    duration,
    result,
  } = measure(() => pathfinding.resolve(from, to) || { tiles: [] as Tile[] }, {
    log: false,
  });

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

  if (constants.LOG_AVERAGE) {
    timeCost.push(duration);
    const average = timeCost.reduce((prev, current) => prev + current) / timeCost.length;
    console.log('AVERAGE A*', average, result.tiles.length);
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
    measure(cases[key], { message: key });
}


function random(max: number = 1, min: number = 0) {
  return Math.floor(Math.random() * (max - min)) + min
}


function measure(operation: Function, {
  message = 'Operation',
  log = true,
} = {}) {
  const before = performance.now();
  const result = operation();
  const after = performance.now();
  const duration = after - before;

  if (log)
    console.log(`${message} = ${duration}ms`);
  
  return { duration, result };
}


function multiplyGrid(grid: number[][], multiplier: number) {
  if (multiplier === 0) return [];
  if (multiplier === 1) return grid;

  const result = [] as number[][];

  grid.forEach((row, y) => {
    for (let i = 0; i < multiplier; i++)
      result[y * multiplier + i] = [] as number[];
    
    row.forEach((value, x) => {
      for (let i = 0; i < multiplier; i++)
        for (let j = 0; j < multiplier; j++)
          result[y * multiplier + i][x * multiplier + j] = value;
    });
  });

  return result;
}


interface IPrintablePath {
  tiles: Tile[];
  remove(): void;
}