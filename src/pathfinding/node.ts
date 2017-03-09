import { INode, INodeRelation } from "./i-node";
import { SubclassExpectedError } from "./errors";
import { Pathfinding } from "./pathfinding";
import Vector from "../core/vector";


export class Node<T extends INode> implements INode {
  private static idCounter = 0;
  private readonly children = new Set<T>();
  private readonly neighbors = new Map<INode, INodeRelation>();
  private dirty = true;
  private _travelCost: number;
  private sampleChild: T;
  id: string;


  constructor() {
    this.id = `${Node.idCounter++}`;
  }


  get location(): Vector {
    return this.sampleChild ? this.sampleChild.location : null;
  }

  get travelCost(): number {
    if (this.dirty) {
      // TODO: Consider using the highest travelCost instead of an average
      //       To improve what isObstacle means
      this._travelCost = average(this.children, 'travelCost');
    }

    return this._travelCost;
  }

  get isObstacle() : boolean {
    return this.travelCost === 1;
  }

  
  addChild(child: T): void {
    this.dirty = true;
    this.children.add(child);
    this.sampleChild = child;
    // child.color = 'brown';
    // child.content = this.id;
  }

  hasChild(child: T): boolean {
    if (this.children.has(child))
      return true;
    
    for (const entry of this.children) {
      if (entry.isNeighbor(child)) {
        this.addChild(child);
        return true;
      }
    }

    return false;
  }

  setNeighbor(node: INode, relation: INodeRelation): void {
    const current = this.neighbors.get(node);

    if (!current || current.cost > relation.cost)
      this.neighbors.set(node, relation);
  }

  removeNeighbor(node: INode): void {
    this.neighbors.delete(node);
  }

  getNeighbors(): Map<INode, INodeRelation> {
    return this.neighbors;
  }

  getRelation(neighbor: INode): INodeRelation {
    if (!this.isNeighbor(neighbor))
      throw new Error('Argument should be a neighbor');
    
    return this.neighbors.get(neighbor);
  }

  isNeighbor(node: INode): boolean {
    return this.neighbors.has(node);
  }

  getCostTo(neighbor: INode): number {
    return this.getRelation(neighbor).cost;
  }

  estimateDistanceTo(node: INode): number {
    if (!(node instanceof Node))
      throw new SubclassExpectedError(`Expected Node but ${node.constructor.name} found`);
    return this.sampleChild.estimateDistanceTo((node as Node<T>).sampleChild);
  }

  getClosestChildrenTo(point: Vector): INode {
    let bestNode = null;
    let bestDistance = null;

    for (const child of this.children) {
      const distance = point.diff(child.location).magnitude;

      if (!bestNode || distance < bestDistance) {
        bestNode = child;
        bestDistance = distance;
      }
    }

    return bestNode;
  }
}


export class TemporalNode<T extends INode> extends Node<T> {
  reconnect(): this {
    for (const [ neighbor, relation ] of this.getNeighbors())
      (neighbor as Node<T>).setNeighbor(this, relation);

    return this;
  }

  disconnect() {
    for (const [ neighbor, relation ] of this.getNeighbors())
      (neighbor as Node<T>).removeNeighbor(this);
  }
}


function average<T>(list: Set<T>, property: keyof T) {
  let sum = 0;

  for (const entry of list)
    sum += entry[property] as any as number;
  
  return sum / list.size;
}


