// tslint:disable:prefer-function-over-method
// tslint:disable:max-classes-per-file

import { Area } from './area';
import { INode } from './node';

const DEBUG = true;


export class AStar<T extends INode> {
  private pool: AStarNodePool<T>;
  private getNeighborCost: DistanceCalculator<T>;
  private estimateDistance: DistanceCalculator<T>;


  constructor({ getNeighborCost, estimateDistance }: IMeasurer<T>, closerModifier = 1) {
    this.pool = new AStarNodePool<T>(closerModifier);
    this.getNeighborCost = getNeighborCost;
    this.estimateDistance = estimateDistance;
  }


  getPath(start: T, end: T, area: Area<T>): T[] {
    if (start === end)
      return [];

    const open = new Set<AStarNodeContainer<T>>();
    const closed = new Set<AStarNodeContainer<T>>();

    let current: AStarNodeContainer<T>;
    open.add(this.pool.getNode(start));

    while (open.size) {
      current = this.getNext(open, closed);

      if (current.child === end)
        return this.retrace(start, current);

      for (const child of area.getNeighbors(current.child)) {
        const neighbor = this.pool.getNode(child);
        const cost = this.getNeighborCost(current.child, child);
        const movement = (current.pathCost || 0) + cost;

        if (DEBUG) {
          if (child.isObstacle)
            throw new Error('No obstacle tiles should make it to A* algorithm');
        }

        if (closed.has(neighbor))
          continue;

        if (movement < neighbor.pathCost || !open.has(neighbor)) {
          neighbor.pathCost = movement;
          neighbor.estimatedCost = this.estimateDistance(child, end);
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

  private getNext(open: NodeSet<T>, closed: NodeSet<T>): AStarNodeContainer<T> {
    let best: AStarNodeContainer<T> = null;

    for (const item of open) {
      if (!best || (item.cost < best.cost || (item.cost === best.cost && item.cost < best.cost)))
        best = item;
    }

    open.delete(best);
    closed.add(best);
    return best;
  }


  private retrace(start: T, end: AStarNodeContainer<T>): T[] {
    const path = [] as T[];
    let current = end;

    while (current.child !== start) {
      path.push(current.child);
      current = current.parent;
    }

    return path.reverse();
  }
}


class AStarNodeContainer<T> {
  parent: AStarNodeContainer<T>;
  pathCost: number;
  estimatedCost: number;
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


class AStarNodePool<T extends INode> {
  private pool = new WeakMap<T, AStarNodeContainer<T>>();
  private using = new Set<AStarNodeContainer<T>>();

  constructor(
    private closerModifier: number,
  ) {}


  get liveInstancesCount() {
    return this.using.size;
  }


  getNode(tile: T): AStarNodeContainer<T> {
    let instance;

    if (this.pool.has(tile))
      instance = this.pool.get(tile);
    else
      instance = new AStarNodeContainer<T>(tile, this.closerModifier);

    this.pool.set(tile, instance);
    this.using.add(instance);
    instance.init();
    return instance;
  }

  dispose(node: AStarNodeContainer<T>) {
    this.using.delete(node);
    node.dispose();
  }
}


type NodeSet<T> = Set<AStarNodeContainer<T>>;
type DistanceCalculator<T> = (from: T, to: T) => number;

interface IMeasurer<T> {
  getNeighborCost: DistanceCalculator<T>;
  estimateDistance: DistanceCalculator<T>;
}

class DisposedInstanceInvocationError extends Error {}
