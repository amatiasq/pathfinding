import Point = Phaser.Point;
import { CELL_SIZE } from "../constants";


export default class Grid<T extends INode> {
  private data: T[][];

  constructor(public cols: number, public rows: number) {}

  fill(creator: (row: number, col: number) => T) {
    this.data = [];

    for (let i = 0; i < this.rows; i++) {
      this.data[ i ] = [];
      for (let j = 0; j < this.cols; j++)
        this.data[ i ][ j ] = creator(i, j);
    }
  }

  getCell(x: number, y: number): T {
    const row = this.data[x];
    return row ? (row[y] || null) : null;
  }

  forEach(iterator: (cell: T, x: number, y: number, grid: Grid<T>) => void) {
    for (let i = 0; i < this.rows; i++)
      for (let j = 0; j < this.cols; j++)
        iterator(this.data[i][j], i, j, this);
  }

  getNodeFromPoint(point: Point) {
    const coords = point.clone().divide(CELL_SIZE, CELL_SIZE).floor();
    return this.getCell(coords.x, coords.y);
  }

  getNeighbours(node: T): T[] {
    const x = node.gridPosition.x;
    const y = node.gridPosition.y;
    const neighbours = <T[]>[];

    for (let i = -1; i <= 1; i++)
      for (let j = -1; j <= 1; j++)
        if ((i || j) && this.getCell(x + i, y + j))
          neighbours.push(this.getCell(x + i, j + y));

    return neighbours;
  }
}


export interface INode {
  gridPosition: Point;
  isObstacle: boolean,
  weight: number,
  parentNode: INode,
  fCost: number,
  gCost: number,
  hCost: number,
}
