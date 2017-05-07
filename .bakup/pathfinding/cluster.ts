import { Side } from "../config";
import { IPathfindingAlgorithm } from "./i-pathfinding-algorithm";
import { IArea } from "./i-area";
import { INode } from "./i-node";
import { Vector3D } from "../core";


export class Cluster {
  private entrances: Set<INode>;
  private paths = new WeakMap<INode, Map<INode, INode[]>>();


  constructor(
    private readonly world: IArea,
    private readonly algorithm: IPathfindingAlgorithm,
    public readonly location: Vector3D,
    public readonly area: IArea,
  ) {}


  resolve(start: INode, end: INode): INode[] {
    if (this.paths.has(start) && this.paths.get(start).has(end))
      return this.paths.get(start).get(end);
    return this.algorithm.getPath(start, end, this.area);
  }

  processEntrances(): INode[] {
    this.entrances = new Set<INode>([
      ...this.processFaceEntrances(Side.NORTH),
      ...this.processFaceEntrances(Side.SOUTH),
      ...this.processFaceEntrances(Side.EAST),
      ...this.processFaceEntrances(Side.WEST),
      ...this.processFaceEntrances(Side.UP),
      ...this.processFaceEntrances(Side.DOWN),
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
        if (entrance !== node)
          this.addPathsToCache(node, entrance);
    
    // TODO: this default return used to be an issue
    return this.paths.get(node) || new Map();
  }

  addPathsToCache(start: INode, end: INode) {
    // TODO: this is a bug
    if (start === end) debugger;

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
  }

  private processFaceEntrances(direction: Side) {
    const tiles = this.area.getFace(direction);
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

      // TODO: this probably causes issues since third dimension is added
      if (neighborsCount === 0 || neighborsCount === 1) {
        // (tile as any).color = 'blue';
        result.push(tile);
      }
    }

    return result;
  }
}

