import Tile from "./tile";
import { Area } from "./area";
import { Vector3D } from "../core";


export class World extends Area {
  public readonly tileSize: number;


  constructor(
    data: number[][][],
    tileSize: number,
    diagonalMovementCost: number,
    layerChangeCost: number,
  ) {
    const grid = [] as Tile[][][];

    data.forEach((layer, k) => {
      let rows = grid[k] = [] as Tile[][];
      layer.forEach((row, j) => {
        let tiles = rows[j] = [] as Tile[];
        row.forEach((value, i) => {
          tiles[i] = new Tile(new Vector3D(i, j, k), tileSize, value, diagonalMovementCost, layerChangeCost)
        });
      });
    });

    super(grid);
    this.tileSize = tileSize;
    this.forEach(tile => tile.setWorld(this));
  }
}
