import Tile from "./tile";
import { Area } from "./area";


export class World extends Area {
  public readonly tileSize: number;


  constructor(
    data: number[][],
    tileSize: number,
  ) {
    const grid = [] as Tile[][];

    data.forEach((row, i) => {
      let tiles = grid[i] = [] as Tile[];
      row.forEach((value, j) => tiles[j] = new Tile(j, i, tileSize, value));
    });

    super(grid);
    this.tileSize = tileSize;
  }
}
