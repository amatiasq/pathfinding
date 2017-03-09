import Tile from "./tile";
import { Area } from "./area";
import Vector from "../core/vector";


export class World extends Area {
  public readonly tileSize: number;


  constructor(
    data: number[][],
    tileSize: number,
    diagonalMovementCost: number,
  ) {
    const grid = [] as Tile[][];

    data.forEach((row, j) => {
      let tiles = grid[j] = [] as Tile[];
      row.forEach((value, i) => {
        tiles[i] = new Tile(new Vector(i, j), tileSize, value, diagonalMovementCost)
      });
    });

    super(grid);
    this.tileSize = tileSize;
    this.forEach(tile => tile.setWorld(this));
  }
}
