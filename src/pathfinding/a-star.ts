import { ITile } from "./i-tile";
import { IPathfindingAlgorithm } from "./i-pathfinding-algorithm";
import { IArea } from "./i-area";


export default class AStar<T extends ITile> implements IPathfindingAlgorithm {
  private pool: AStarNodePool<T>;


  constructor(
    private readonly diagonalMovementCost: number,
    closerModifier: number,
  ) {
    this.pool = new AStarNodePool<T>(closerModifier);
  }


  calculate(map: IArea, start: T, end: T): T[] {
    const before = performance.now();
    const result = this.calculateInternal(map, start, end);
    const after = performance.now();
    AStar.log(after - before, result && result.length);
    return result;
  }

  private calculateInternal(map: IArea, start: T, end: T): T[] {
    const open = new Set<AStarNode<T>>();
    const closed = new Set<AStarNode<T>>();

    let current: AStarNode<T>;
    open.add(this.pool.getNode(start));

    while (open.size) {
      current = this.getNext(open, closed);

      if (current.tile === end)
        return this.retrace(start, current);
      
      // if (current.tile.isEmpty && !this.hasRampBelow(current))
      //  continue;

      const neighbors = map
        .getNeighbors(current.tile)
        .map(tile => this.pool.getNode(tile as T));

      for (const neighbor of neighbors)
        if (this.parseNeighbor(neighbor, current, start, end, open, closed))
          open.add(neighbor);
    }
  }

  *debug(map: IArea, start: T, end: T, {
    visited = 0x777777,
    neighbor: neighborColor = 0x0000FF,
    active = 0xFF00FF,
  } = {}): IterableIterator<T> {
    const open = new Set<AStarNode<T>>();
    const closed = new Set<AStarNode<T>>();
    let current: AStarNode<T>;

    open.add(this.pool.getNode(start));
    // this.paint(start, neighborColor);

    while (open.size) {
      // if (current)
      //   this.paint(current, visited);

      current = this.getNext(open, closed);
      // this.paint(current, active);

      if (current.tile === end)
        return this.retrace(start, current);

      // if (current.isEmpty && !this.hasRampBelow(current))
      //   continue;

      const neighbors = map
        .getNeighbors(current.tile)
        .map(tile => this.pool.getNode(tile as T));

      for (const neighbor of neighbors) {
        if (this.parseNeighbor(neighbor, current, start, end, open, closed)) {
          open.add(neighbor);
          // this.paint(neighbor, neighborColor);
        }
      }

      yield;
    }
  }


  /*
   * Shared code
   */

  parseNeighbor(
    neighbor: AStarNode<T>,
    current: AStarNode<T>,
    start: T,
    end: T,
    open: NodeSet<T>,
    closed: NodeSet<T>
  ): boolean {

    if (neighbor.tile.isObstacle || closed.has(neighbor))
      return false;

    const movement = (current.gCost || 0) + this.getDistance(current.tile, neighbor.tile);

    if (movement < neighbor.gCost || !open.has(neighbor)) {
      neighbor.gCost = movement;
      neighbor.hCost = this.getDistance(neighbor.tile, end);
      neighbor.parent = current;
      return !open.has(neighbor);
    }
  }


  /*
   * Helpers
   */

  getDistance(nodeA: T, nodeB: T): number {
    const x = Math.abs(nodeA.x - nodeB.x);
    const y = Math.abs(nodeA.y - nodeB.y);

    const layerMovement = x > y ?
      this.diagonalMovementCost * 10 * y + 10 * (x - y) :
      this.diagonalMovementCost * 10 * x + 10 * (y - x);

    return layerMovement; // + z * LAYER_CHANGE_COST;
  }

  getNext(open: NodeSet<T>, closed: NodeSet<T>): AStarNode<T> {
    let best: AStarNode<T> = null;

    for (let item of open) {
      if (!best || (item.fCost < best.fCost || (item.fCost === best.fCost && item.hCost < best.hCost)))
        best = item;
    }

    open.delete(best);
    closed.add(best);
    return best;
  }

  retrace(start: T, end: AStarNode<T>): T[] {
    const path = [] as T[];
    let current = end;

    while (current.tile !== start) {
      path.push(current.tile);
      current = current.parent;
    }

    return path.reverse();
  }


  /*
   * PERFORMANCE
   */
  private static logs = [] as number[];

  private static log(time: number, steps: number) {
    this.logs.push(time);
    const total = this.logs.reduce((sum, current) => sum + current);
    const average = total / this.logs.length;
    // console.log(`[A*] ${this.round(time)}ms for ${steps} steps (avg ${this.round(average)}ms)`);
  }
  
  private static round(value: number) {
    return Math.round(value * 100) / 100;
  }

}


class AStarNode<T> {
  public parent: AStarNode<T>;
  public gCost: number;
  public hCost: number;
  private _isDisposed = false;


  constructor(
    private _tile: T,
    private closerModifier: number,
  ) {}


  get tile(): T {
    this.checkDisposed();
    return this._tile;
  }

  get fCost(): number {
    this.checkDisposed();
    return this.gCost + this.hCost * this.closerModifier;
  }

  get isDisposed(): boolean {
    return this._isDisposed;
  }


  init() {
    this._isDisposed = false;
  }

  dispose() {
    this.gCost = null;
    this.hCost = null;
    this.parent = null;
    this._isDisposed = true;
  }

  private checkDisposed() {
    if (this.isDisposed)
      throw new DisposedInstanceInvocationError(`Instance of ${this.constructor.name} is disposed!`);
  }
}


class AStarNodePool<T extends object> {
  private pool = new WeakMap<T, AStarNode<T>>();
  private using = new Set<AStarNode<T>>();

  constructor(
    private closerModifier: number,
  ) {}


  get liveInstancesCount() {
    return this.using.size;
  }


  getNode(tile: T): AStarNode<T> {
    let instance;

    if (this.pool.has(tile))
      instance = this.pool.get(tile)
    else
      instance = new AStarNode<T>(tile, this.closerModifier);

    this.pool.set(tile, instance);
    this.using.add(instance);
    instance.init();
    return instance;
  }

  dispose(node: AStarNode<T> | AStarNode<T>[]) {
    if (Array.isArray(node)) {
      node.forEach(entry => this.dispose(entry));
      return;
    }
    
    this.using.delete(node);
    node.dispose();
  }
}


interface NodeSet<T> extends Set<AStarNode<T>> {}


class DisposedInstanceInvocationError extends Error {}
