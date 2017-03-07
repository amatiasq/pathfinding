import Pathfinding from "./pathfinding/pathfinding";
import { drawSquare } from "./utils";
import { Color } from "./config";
import MAP_DATA from "./map-data";
import AStar from "./pathfinding/a-star";
import { World } from "./world/world";
import Tile from "./world/tile";


const TILE_SIZE = 15;
const CLUSTER_SIZE = 10;
const DIAGONAL_MOVEMENT_COST = 1.4;
const CLOSER_MODIFIER = 2;

const world = new World(MAP_DATA, TILE_SIZE);
const aStar = new AStar<Tile>(DIAGONAL_MOVEMENT_COST, CLOSER_MODIFIER);
const pathfinding = new Pathfinding(world, aStar, CLUSTER_SIZE);
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

canvas.width = document.body.clientWidth;
canvas.height = document.body.clientHeight;
ctx.translate(TILE_SIZE, TILE_SIZE);
frame();


function frame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  world.forEach(tile => tile.print(ctx));

  pathfinding.forEach((cluster, pathfinding) => {
    const depth = 0;
    const size = (CLUSTER_SIZE ** (depth + 1)) * TILE_SIZE;
    const x = size * cluster.x;
    const y = size * cluster.y;

    drawSquare(ctx, x, y, size, {
      color: Color.CLUSTER[depth].toString(),
      width: (depth + 1) * 2,
    });
  });

  // requestAnimationFrame(frame);
}
