import { Side } from "../config";
import { IPathfindingTile } from "./i-pathfinding-node";
import { Vector3D } from "../core/vector3d";
import * as ndarray from "ndarray";


export interface IArea {
  readonly size: Vector3D;
  getRange(position: Vector3D, size: Vector3D): IArea;
  getNeighbor(tile: IPathfindingTile, direction: Side): IPathfindingTile;
  getNeighbors(tile: IPathfindingTile): IPathfindingTile[];
  getEdge(faceA: Side, faceB: Side): IPathfindingTile[];
  getFace(face: Side): IPathfindingTile[];
}


export class Area<T extends IPathfindingTile> implements IArea {
  public readonly size: Vector3D;
  private readonly offset: Vector3D;
  private readonly grid: ndarray<IPathfindingTile>;


  constructor(grid: T[][][]) {
    const flattenGrid = [] as T[];
    for (let i = 0; i < grid.length; i++)
      flattenGrid.concat(...grid[i]);
    
    this.size = new Vector3D(grid[0][0].length, grid[0].length, grid.length);
    this.grid = ndarray(flattenGrid, [ this.size.z, this.size.y, this.size.x ]);
    this.offset = this.grid.get(0, 0, 0).location;
  }


  get(z: number, x: number, y: number): IPathfindingTile {
    return this.grid.get(z, x, y) || null;
  }

  /**
   * Takes two adjacent faces of a cube and returns all tiles at the edge
   * between the two faces.
   */
  getEdge(faceA: Side, faceB: Side): IPathfindingTile[] {
    let z = null as number;
    let x = null as number;
    let y = null as number;

    if (faceA === faceB)
      throw new Error('faceA and faceB should be different');

    if (faceA === Side.UP || faceB === Side.UP)
      z = 0;
    
    if (faceA === Side.DOWN || faceB === Side.DOWN)
      z = this.size.z - 1;

    if (faceA === Side.NORTH || faceB === Side.NORTH)
      y = 0
    
    if (faceA === Side.SOUTH || faceB === Side.SOUTH)
      y = this.size.y - 1;
    
    if (faceA === Side.WEST || faceB === Side.WEST)
      x = 0;
    
    if (faceA === Side.EAST || faceB === Side.EAST)
      x = this.size.x - 1;

    if (x !== null && y !== null)
      return this.grid.map(layer => layer[y][x])

    if (z !== null && x !== null)
      return this.grid[z].map(row => row[x]);

    if (z !== null && y !== null)
      return this.grid[z][y] || null;
    
    throw new Error('Invalid Side calculation');
  }

  getFace(face: Side): Tile[] {
    if (face == null)
      throw new Error('Argument can\'t be null');

    if (face === Side.UP || face === Side.DOWN) {
      const z = face === Side.UP ? 0 : this.size.z - 1;
      return [].concat(...this.grid[z]);
    }

    // if only one layer .getEdge() is cheapest
    if (this.size.z === 1)
      return this.getEdge(Side.UP, face);
    
    if (face === Side.NORTH || face === Side.SOUTH) {
      const y = face === Side.NORTH ? 0 : this.size.y - 1;
      return [].concat(...this.grid.map(layer => layer[y]));
    }
    
    if (face === Side.WEST || face === Side.EAST) {
      const x = face === Side.WEST ? 0 : this.size.y - 1;
      const result = [];

      for (let k = 0; k < this.size.z; k++)
        for (let j = 0; j < this.size.y; j++)
          result.push(this.get(k, x, j));
      
      return result;
    }
  }

  getRange(point: Vector3D, size: Vector3D): Area {
    const result = [] as Tile[][][];

    for (let k = 0; k < size.z; k++) {
      const layer = this.grid[k + point.z];
      if (!layer) continue;
      result[k] = [];

      for (let j = 0; j < size.y; j++) {
        const row = layer[j + point.y];
        if (!row) continue;
        result[k][j] = [];

        for (let i = 0; i < size.x; i++) {
          const tile = row[i + point.x];
          if (!tile) break;
          result[k][j][i] = tile;
        }
      }
    }

    return new Area(result);
  }

  getNeighbor(tile: Tile, direction: Side): Tile {
    const index = Vector3D.diff(tile.location, this.offset);

    switch (direction) {
      case Side.UP:
      case Side.DOWN:
        const neighbor = this.get(index.z + (direction === Side.UP ? -1 : +1), index.x, index.y);
        const isValid = neighbor && (
          (direction === Side.UP && tile.canTravelUp && neighbor.canTravelDown) ||
          (direction === Side.DOWN && tile.canTravelDown && neighbor.canTravelUp)
        );
        return isValid ? neighbor : null;

      case Side.NORTH:      
      case Side.SOUTH:
        return this.get(index.z, index.x, index.y + (direction === Side.NORTH ? -1 : +1));
      
      case Side.EAST:
      case Side.WEST:
        return this.get(index.z, index.x + (direction === Side.WEST ? -1 : +1), index.y);
    }
  }

  getNeighbors(tile: Tile): Tile[] {
    const index = Vector3D.diff(tile.location, this.offset);
    const result = [];

    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        if (i === 0 && j === 0)
          continue;

        const cell = this.get(index.z, index.x + j, index.y + i);
        if (cell)
          result.push(cell);
      }
    }

    if (tile.canTravelUp) {
      const up = this.get(index.z - 1, index.x, index.y);
      if (up && up.canTravelDown)
        result.push(up);
    }

    if (tile.canTravelDown) {
      const down = this.get(index.z + 1, index.x, index.y);
      if (down && down.canTravelUp)
        result.push(down);
    }

    return result;
  }

  forEach(iterator: (tile: Tile, z: number, x: number, y: number, area: Area) => void): void {
    this.grid.forEach((layer, k) => {
      layer.forEach((row, i) => {
        row.forEach((tile, j) => iterator(tile, k, j, i, this))
      });
    });
  }
}
