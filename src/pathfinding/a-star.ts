import { IPathfindingAlgorithm } from "./i-pathfinding-algorithm";
import { IArea } from "./i-area";
import { INode } from "./i-node";
import { round } from "../utils";


export default class AStar<T extends INode> implements IPathfindingAlgorithm {
  private pool: AStarNodePool<T>;


  constructor(closerModifier: number) {
    this.pool = new AStarNodePool<T>(closerModifier);
  }


  getCost(start: T, path: T[]): number {
    let cost = 0;
    let prev = null;

    for (const step of path) {
      if (prev)
        cost += prev.getCostTo(step);
      prev = step;
    }

    return round(cost);
  }

  getPath(start: T, end: T, area?: IArea): T[] {
  /*
    const before = performance.now();
    const result = this.getPathInternal(start, end, area);
    const after = performance.now();
    AStar.log(after - before, result && result.length);
    return result;
  }

  private getPathInternal(start: T, end: T, area?: IArea): T[] {
  */
    const open = new Set<AStarNode<T>>();
    const closed = new Set<AStarNode<T>>();

    let current: AStarNode<T>;
    open.add(this.pool.getNode(start));

    while (open.size) {
      current = this.getNext(open, closed);

      if (current.child === end)
        return this.retrace(start, current);
      
      // if (current.tile.isEmpty && !this.hasRampBelow(current))
      //  continue;

      for (const [ child, relation ] of current.child.getNeighbors(area)) {
        const neighbor = this.pool.getNode(child as T);
        const movement = (current.pathCost || 0) + relation.cost;

        if (child.isObstacle)
          throw new Error('No obstacle tiles should make it to A* algorithm');

        if (closed.has(neighbor))
          continue;

        if (movement < neighbor.pathCost || !open.has(neighbor)) {
          neighbor.pathCost = movement;
          neighbor.estimatedCost = child.estimateDistanceTo(end);
          neighbor.parent = current;

          if (!open.has(neighbor))
            open.add(neighbor);
        }

        if (!open.has(neighbor))
          neighbor.dispose();
      }
    }

    for (const node of closed)
      node.dispose();
  }


  /*
   * Helpers
   */

  getNext(open: NodeSet<T>, closed: NodeSet<T>): AStarNode<T> {
    let best: AStarNode<T> = null;

    for (let item of open) {
      if (!best || (item.cost < best.cost || (item.cost === best.cost && item.cost < best.cost)))
        best = item;
    }

    open.delete(best);
    closed.add(best);
    return best;
  }

  retrace(start: T, end: AStarNode<T>): T[] {
    const path = [] as T[];
    let current = end;

    while (current.child !== start) {
      path.push(current.child);
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
  public pathCost: number;
  public estimatedCost: number;
  private _isDisposed = false;


  constructor(
    private _child: T,
    private closerModifier: number,
  ) {}


  get child(): T {
    this.checkDisposed();
    return this._child;
  }

  get cost(): number {
    this.checkDisposed();
    return this.pathCost + this.estimatedCost * this.closerModifier;
  }

  get isDisposed(): boolean {
    return this._isDisposed;
  }


  init() {
    this._isDisposed = false;
  }

  dispose() {
    this.pathCost = null;
    this.estimatedCost = null;
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
