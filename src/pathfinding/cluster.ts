import { Side } from "../config";
import { IPathfindingAlgorithm } from "./i-pathfinding-algorithm";
import { IArea } from "./i-area";
import { INode } from "./i-node";
import Vector from "../core/vector";


export class Cluster {
  private entrances: Set<INode>;
  private paths = new WeakMap<INode, Map<INode, INode[]>>();


  constructor(
    private readonly world: IArea,
    private readonly algorithm: IPathfindingAlgorithm,
    public readonly location: Vector,
    public readonly area: IArea,
  ) {}


  resolve(start: INode, end: INode): INode[] {
    if (this.paths.has(start) && this.paths.get(start).has(end))
      return this.paths.get(start).get(end);
    return this.algorithm.getPath(start, end, this.area);
  }

  processEntrances(): INode[] {
    this.entrances = new Set<INode>([
      ...this.processSideEntrances(Side.NORTH),
      ...this.processSideEntrances(Side.SOUTH),
      ...this.processSideEntrances(Side.EAST),
      ...this.processSideEntrances(Side.WEST),
      // this.processSideEntrances(world, Side.UP);
      // this.processSideEntrances(world, Side.DOWN);
    ]);

    this.resolveEntrancesPaths();
    return this.getEntrances();
  }

  private resolveEntrancesPaths(): void {
    const paths = this.paths = new WeakMap();

    for (const entrance of this.entrances)
      for (const other of this.entrances)
        if (entrance !== other && (!paths.has(other) || !paths.get(other).has(entrance)))
          this.addPathsToCache(entrance, other);
  }

  getEntrances(): INode[] {
    return [ ...this.entrances ];
  }

  getConnections(node: INode): Map<INode, INode[]> {
    if (!this.paths.has(node))
      for (const entrance of this.entrances)
        this.addPathsToCache(node, entrance);
    
    return this.paths.get(node);
  }

  addPathsToCache(start: INode, end: INode) {
    const paths = this.paths;
    const path = this.resolve(start, end);
    if (!path) return;

    if (!paths.has(start))
      paths.set(start, new Map());
    
    if (!paths.has(end))
      paths.set(end, new Map());

    path.unshift(start);
    paths.get(start).set(end, path);
    paths.get(end).set(start, [ ...path ].reverse());

    /*
    const color = COLORS[index++ % COLORS.length];

    for (const step of path)
      if (!step.color)
        step.color = color;
    */
  }

  private processSideEntrances(direction: Side) {
    const tiles = this.getSideTiles(direction);
    const entrances = [];

    for (const tile of tiles) {
      const neighbor = this.world.getNeighbor(tile, direction);

      if (neighbor && !tile.isObstacle && !neighbor.isObstacle)
        entrances.push(tile);
    }

    return this.reduceEntrances(entrances, direction);
  }

  private reduceEntrances(entrances: INode[], direction: Side): INode[] {
    const result = [] as INode[];

    for (const tile of entrances) {
      let neighborsCount = 0;

      for (const other of entrances) {
        if (tile !== other && tile.isNeighbor(other))
          neighborsCount++;
      }

      if (neighborsCount === 0 || neighborsCount === 1) {
        (tile as any).color = 'blue';
        result.push(tile);
      }
    }

    return result;
  }

  private getSideTiles(direction: Side) {
    switch (direction) {
      // case Side.UP:
      // case Side.DOWN:
      //   return [].concat(...this.area);

      case Side.NORTH: 
        return this.area.getRow(0);
      
      case Side.SOUTH:
        return this.area.getRow(-1);
      
      case Side.EAST:
        return this.area.getCol(-1);

      case Side.WEST:
        return this.area.getCol(0);
    }

    throw new Error(`Unknown side: [${direction}]`);
  }
}


const COLORS = [ 'green', 'orange', 'gray', 'cyan', 'pink', 'purple' ];
