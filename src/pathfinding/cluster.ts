import { Vector3D } from '../core/vector3d';
import { Area } from './area';
import { INode } from './node';
import { IPathfindingAlgorithm } from './pathfinding';


export class Cluster {
  constructor(
    world: Area<INode>,
    public readonly area: Area<INode>,
    private readonly algorithm: IPathfindingAlgorithm<INode>,
  ) {}


  resolve(start: INode, end: INode) {
    return this.algorithm.resolve(start, end, this.area) || null;
  }


  getEntrances(): INode[] {
    const entrances = [
      ...this.processEntrances(Side.UP),
      ...this.processEntrances(Side.DOWN),
      ...this.processEntrances(Side.NORTH),
      ...this.processEntrances(Side.SOUTH),
      ...this.processEntrances(Side.EAST),
      ...this.processEntrances(Side.WEST),
    ];

    const result = [];

    for (const entrance of entrances)
      if (result.indexOf(entrance) === -1)
        result.push(entrance);

    return result;
  }


  getConnections(node: INode): Map<INode, INode[]> {
    const entrances = this.getEntrances();
    const result = new Map<INode, INode[]>();

    for (const entrance of entrances) {
      const path = this.algorithm.resolve(node, entrance, this.area);
      if (path)
        result.set(entrance, path);
    }

    return result;
  }


  private processEntrances(side: Side): INode[] {
    const entrances = [];
    const tiles = this.getFace(side)
      .filter(tile => !tile.isObstacle);

    for (const tile of tiles) {
      let neighborsCount = 0;

      for (const other of tiles)
        if (tile !== other && this.area.areNeighbors(tile, other))
          neighborsCount++;

      if (neighborsCount < 2)
        entrances.push(tile);
    }

    return entrances;
  }


  private getFace(side: Side) {
    const { start, end } = getSideVectors(side, this.area.size);
    const face = [];

    for (const index of Vector3D.iterate(start, end))
      face.push(this.area.get(index));

    return face;
  }
}


enum Side {
  UP,
  DOWN,
  NORTH,
  SOUTH,
  EAST,
  WEST,
}


function getSideVectors(face: Side, size: Vector3D) {
    const start = new Vector3D(0, 0, 0).toMutable();
    const end = size.toMutable();

    switch (face) {
      case Side.UP:
        start.set({ z: end.z - 1 });
        break;

      case Side.DOWN:
        end.set({ z: 1 });
        break;

      case Side.NORTH:
        end.set({ y: 1 });
        break;

      case Side.SOUTH:
        start.set({ y: end.y - 1 });
        break;

      case Side.EAST:
        start.set({ x: end.x - 1 });
        break;

      case Side.WEST:
        end.set({ x: 1 });
        break;
    }

    return {
      start: start.toImmutable(),
      end: end.toImmutable(),
    };
}
