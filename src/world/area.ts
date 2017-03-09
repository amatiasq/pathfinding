import Tile from "./tile";
import { Side } from "../config";
import { IArea } from "../pathfinding/i-area";
import Vector from "../core/vector";


export class Area implements IArea {
  public readonly size: Vector;
  private readonly offset: Vector;


  constructor(
    private readonly grid: Tile[][],
  ) {
    const firstRow = grid[0];
    const firstTile = grid[0][0];
    this.size = new Vector(firstRow.length, grid.length)
    this.offset = firstTile.location;
  }


  get(x: number, y: number): Tile {
    const entry = this.grid[y];
    return entry ? entry[x] : null;
  }

  getRow(y: number): Tile[] {
    if (y < 0)
      y = this.size.y + y;

    return this.grid[y] || null;
  }

  getCol(x: number): Tile[] {
    if (x < 0)
      x = this.size.x + x;

    if (x < 0 || x >= this.size.x)
      return null;

    return this.grid.map(row => row[x]);
  }

  getRange(point: Vector, size: Vector): Area {
    const result = [] as Tile[][];

    for (let j = 0; j < size.y; j++) {
      result[j] = [];
      const row = this.grid[j + point.y];
      if (!row) continue;

      for (let i = 0; i < size.x; i++) {
        const tile = row[i + point.x];
        if (!tile) break;
        result[j][i] = tile;
      }
    }

    return new Area(result);
  }

  getNeighbor(tile: Tile, direction: Side): Tile {
    const index = Vector.diff(tile.location, this.offset);

    switch (direction) {
      // case Side.UP:
      // case Side.DOWN:
      case Side.NORTH:      
      case Side.SOUTH:
        return this.get(index.x, index.y + (direction === Side.NORTH ? -1 : +1));
      
      case Side.EAST:
      case Side.WEST:
        return this.get(index.x + (direction === Side.WEST ? -1 : +1), index.y);
    }
  }

  getNeighbors(tile: Tile): Tile[] {
    const index = Vector.diff(tile.location, this.offset);
    const result = [];

    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        if (i === 0 && j === 0)
          continue;

        const cell = this.get(index.x + j, index.y + i);
        if (cell)
          result.push(cell);
      }
    }

    return result;
  }

  forEach(iterator: (tile: Tile, x: number, y: number, area: Area) => void): void {
    this.grid.forEach((row, i) => row.forEach((tile, j) => iterator(tile, j, i, this)));
  }
}
