import { Side } from "../config";
import { ITile } from "./i-tile";
import { IPathfindingAlgorithm } from "./i-pathfinding-algorithm";
import { IArea } from "./i-area";


export default class Cluster {
  private entrances = [] as ITile[];
  private paths = new Map<ITile, Map<ITile, ITile[]>>();


  constructor(
    private readonly world: IArea,
    private readonly algorithm: IPathfindingAlgorithm,
    public readonly x: number,
    public readonly y: number,
    public readonly area: IArea,
  ) {}


  processEntrances() {
    this.entrances = [
      ...this.processSideEntrances(Side.NORTH),
      ...this.processSideEntrances(Side.SOUTH),
      ...this.processSideEntrances(Side.EAST),
      ...this.processSideEntrances(Side.WEST),
      // this.processSideEntrances(world, Side.UP);
      // this.processSideEntrances(world, Side.DOWN);
    ];

    this.resolveEntrancesPaths();
  }

  resolveEntrancesPaths() {
    const paths = this.paths = new Map();
    let index = 0;

    for (const entrance of this.entrances) {
      for (const other of this.entrances) {
        if (entrance === other) continue;

        if (!paths.has(entrance))
          paths.set(entrance, new Map());
        
        if (!paths.has(other))
          paths.set(other, new Map());

        if (paths.has(other) && paths.get(other).has(entrance))
          continue;

        const path = this.algorithm.calculate(this.area, entrance, other);
        if (!path) continue;

        paths.get(entrance).set(other, path);
        paths.get(other).set(entrance, [ ...path ].reverse());

        const color = COLORS[index++ % COLORS.length];

        for (const step of path)
          if (!step.color)
            step.color = color;
      }
    }
  }

  getEntrances() {
    return [ ...this.entrances ];
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

  private reduceEntrances(entrances: ITile[], direction: Side): ITile[] {
    const result = [] as ITile[];

    for (const tile of entrances) {
      let neighborsCount = 0;

      for (const other of entrances) {
        if (tile !== other && tile.isNeighbor(other))
          neighborsCount++;
      }

      if (neighborsCount === 0 || neighborsCount === 1) {
        tile.color = 'blue';
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


const COLORS = [ 'red', 'green', 'orange', 'gray', 'cyan', 'pink', 'purple' ];
