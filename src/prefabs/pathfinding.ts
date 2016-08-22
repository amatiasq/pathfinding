import Grid, { INode } from "./grid";
import Point = Phaser.Point;
import Sprite = Phaser.Sprite;


const DIAGONAL_COST = 1.4;


export default class Pathfinding<T extends INode> {
  private start: T;
  private end: T;
  open: T[];
  closed: T[];
  private current: T;
  private neighbours: T[];
  private neighbourIndex: number;

  constructor(
    private grid: Grid<T>,
    startPoint: Point,
    endPoint: Point
  ) {
    this.start = grid.getNodeFromPoint(startPoint);
    this.end = grid.getNodeFromPoint(endPoint);
    this.open = <T[]>[];
    this.closed = <T[]>[];
    this.setOpen(this.start);
  }

  next() {
    return this.neighbours ?
      this.processNeighbour() :
      this.processOpen();
  }

  private processOpen() {
    let best = 0;

    for (let i = 1; i < this.open.length; i++) {
      const bestNode = this.open[best];
      const entry = this.open[i];

      if (entry.fCost < bestNode.fCost || (entry.fCost === bestNode.fCost && entry.hCost < bestNode.hCost))
        best = i;
    }

    if (this.current)
      (<Sprite><any>this.current).tint = 0x888888;

    this.current = this.open[best];
    this.setClosed(this.current, best);
    (<Sprite><any>this.current).tint = 0x00FFFF;

    if (this.current === this.end)
      return Pathfinding.retrace(this.start, this.end);

    this.neighbours = this.grid.getNeighbours(this.current);
    console.log(`current x:${this.current.gridPosition.x} y:${this.current.gridPosition.y} neighbors:${this.neighbours.length}`);
    this.neighbourIndex = 0;

    while (this.neighbours)
      this.processNeighbour();
  }

  private processNeighbour() {
    const neighbour = this.neighbours[ this.neighbourIndex++ ];
    console.log(`processsing x:${neighbour.gridPosition.x} y:${neighbour.gridPosition.y}`);

    if (this.neighbourIndex >= this.neighbours.length)
      this.neighbours = null;

    if (neighbour.isObstacle || this.closed.indexOf(neighbour) !== -1)
      return;

    const movement = this.current.gCost + Pathfinding.getDistance(this.current, neighbour);
    if (movement < neighbour.gCost || this.open.indexOf(neighbour) === -1) {
      neighbour.gCost = movement;
      neighbour.hCost = Pathfinding.getDistance(neighbour, this.end);
      neighbour.parentNode = this.current;

      if (this.open.indexOf(neighbour) === -1)
        this.setOpen(neighbour);
    }
  }

  private setClosed(node: T, openIndex: number) {
    this.open.splice(openIndex, 1);
    this.closed.push(node);
  }

  private setOpen(node: T) {
    this.open.push(node);
    (<Sprite><any>node).tint = 0x00FF00;
  }

  private static getDistance<U extends INode>(nodeA: U, nodeB: U) {
    const x = Math.abs(nodeA.gridPosition.x - nodeB.gridPosition.x);
    const y = Math.abs(nodeA.gridPosition.y - nodeB.gridPosition.y);

    return x > y ?
      DIAGONAL_COST * 10 * y + 10 * (x - y) :
      DIAGONAL_COST * 10 * x + 10 * (y - x);
  }

  private static retrace<U extends INode>(start: U, end: U) {
    const path: U[] = [];
    let current = end;

    while (current !== start) {
      path.push(current);
      current = <U>current.parentNode;
    }

    return path.reverse();
  }
}