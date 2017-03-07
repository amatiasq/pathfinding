import Tile from "./tile";
import { Side } from "../config";
import { IArea } from "../pathfinding/i-area";


export class Area implements IArea {
  public readonly width: number;
  public readonly height: number;
  private readonly offsetX: number;
  private readonly offsetY: number;


  constructor(
    private readonly grid: Tile[][],
  ) {
    this.height = grid.length;

    const firstRow = grid[0];
    this.width = firstRow.length;

    const firstTile = grid[0][0];
    this.offsetX = firstTile.x;
    this.offsetY = firstTile.y;
  }


  get(x: number, y: number): Tile {
    const entry = this.grid[y];
    return entry ? entry[x] : null;
  }

  getRow(y: number): Tile[] {
    if (y < 0)
      y = this.height + y;

    return this.grid[y] || null;
  }

  getCol(x: number): Tile[] {
    if (x < 0)
      x = this.width + x;

    if (x < 0 || x >= this.width)
      return null;

    return this.grid.map(row => row[x]);
  }

  getRange(x: number, y: number, width: number, height: number): Area {
    const result = [] as Tile[][];

    for (let i = 0; i < width; i++) {
      result[i] = [];
      const row = this.grid[i + x];
      if (!row) continue;

      for (let j = 0; j < height; j++) {
        const tile = row[j + y];
        if (!tile) break;
        result[i][j] = tile;
      }
    }

    return new Area(result);
  }

  getNeighbor(tile: Tile, direction: Side): Tile {
    const x = tile.x - this.offsetX;
    const y = tile.y - this.offsetY;

    switch (direction) {
      // case Side.UP:
      // case Side.DOWN:
      case Side.NORTH:      
      case Side.SOUTH:
        return this.get(x, y + (direction === Side.NORTH ? -1 : +1));
      
      case Side.EAST:
      case Side.WEST:
        return this.get(x + (direction === Side.WEST ? -1 : +1), y);
    }
  }

  getNeighbors(tile: Tile): Tile[] {
    const x = tile.x - this.offsetX;
    const y = tile.y - this.offsetY;
    const result = [];

    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        if (i === 0 && j === 0)
          continue;

        const cell = this.get(x + j, y + i);
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
