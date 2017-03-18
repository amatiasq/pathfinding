import { IPathfindingAlgorithm } from "./i-pathfinding-algorithm";
import { IArea } from "./i-area";
import { INode, ITile } from "./i-node";
import { Node, TemporalNode } from "./node";
import { Cluster } from "./cluster";
import Vector from "../core/vector";


export class Pathfinding {
  private readonly nodes = [] as Node[];
  private readonly clusters: Cluster[][];
  private readonly tempNodes = new WeakMap<INode, TemporalNode>();
  public readonly size: Vector;


  constructor(
    private readonly world: IArea,
    private readonly algorithm: IPathfindingAlgorithm,
    public readonly clusterSize: number,
  ) {
    if (clusterSize < 3)
      throw new Error('Cluster size has to be an integer bigger than 2');

    this.size = new Vector(world.size.x / clusterSize, world.size.y / clusterSize)
    this.clusters = [];
    const areaSize = new Vector(clusterSize, clusterSize);

    for (let j = 0; j < this.size.y; j++) {
      this.clusters[j] = [];

      for (let i = 0; i < this.size.x; i++) {
        const range = world.getRange(areaSize.multiply(i, j), areaSize);
        this.clusters[j][i] = new Cluster(world, algorithm, new Vector(i, j), range);
      }
    }

    this.processConnections();
  }


  resolve(start: ITile, end: ITile) {
    if (start.isObstacle || end.isObstacle)
      return null;

    const startCluster = this.getClusterFor(start);

    if (startCluster === this.getClusterFor(end)) {
      return {
        levels: [],
        tiles: startCluster.resolve(start, end),
      };
    }

    const startNode = this.getTempNodeFor(start);
    const endNode = this.getTempNodeFor(end);
    const result = this.resolveInternal(startNode, endNode);
    startNode.disconnect();
    endNode.disconnect();
    return result;
  }

  private resolveInternal(startNode: TemporalNode, endNode: TemporalNode) {
    const path = this.algorithm.getPath(startNode, endNode) as Node[];
    if (!path)
      return null;

    const tiles = [] as INode[][];
    let prev = startNode as Node;

    for (const step of path) {
      const between = this.fixBridges(
        last(tiles),
        this.getTilesBetween(prev, step),
      );

      tiles.push(between);
      prev = step;
    }

    return {
      levels: [ path ],
      tiles: [].concat(...tiles),
    };
  }

  private fixBridges(prev: INode[], current: INode[]): INode[] {
    if (!prev)
      return current;

    const lastTile = last(prev);
    const firstTile = current[0];

    if (lastTile.isNeighbor(firstTile))
      return current;

    return [
      ...this.algorithm.getPath(lastTile, current[0]),
      ...current.slice(1),
    ];
  }

  private getTilesBetween(start: Node, end: Node): INode[] {
    const { childA, childB } = start.getRelation(end);
    const isSorted = start.hasChild(childA);
    const startTile = isSorted ? childA : childB;
    const endTile = isSorted ? childB : childA;
    const cluster = this.getClusterFor(startTile);

    if (this.getClusterFor(endTile) !== cluster)
      throw new Error('Tiles are from different clusters');

    return cluster.resolve(startTile, endTile);
  }


  processConnections() {
    this.forEach(cluster => {
      for (const entrance of cluster.processEntrances()) {
        const node = this.getNodeFor(entrance);

        for (const [ connection, path ] of cluster.getConnections(entrance)) {
          const connectionNode = this.getNodeFor(connection);
          const relation = {
            cost: this.algorithm.getCost(entrance, path),
            childA: entrance,
            childB: connection,
          };

          node.setNeighbor(connectionNode, relation);
          connectionNode.setNeighbor(node, relation);
        }
      }
    });

    /*
    this.nodes.map(node => {
      let message = '';

      for (let [ neighbor, relation ] of node.getNeighbors()) {
        message += `${node.id} - ${(neighbor as Node).id} = ${relation.cost}\n`;
      }

      console.log(message);
    });
    */
  }

  private findNode(child: INode) {
    return this.nodes.find(node => node.hasChild(child));
  }

  private getNodeFor(child: INode) {
    let node = this.findNode(child);

    if (!node) {
      node = new Node();
      node.addChild(child);
      this.nodes.push(node);
    }

    return node;
  }

  private getTempNodeFor(child: INode) {
    if (this.tempNodes.has(child))
      return this.tempNodes.get(child).reconnect();

    const cluster = this.getClusterFor(child);
    const node = new TemporalNode();
    node.addChild(child);

    for (const [ connection, path ] of cluster.getConnections(child)) {
      node.setNeighbor(this.getNodeFor(connection), {
        cost: this.algorithm.getCost(child, path),
        childA: child,
        childB: connection,
      });
    }

    const overlappingNode = this.findNode(child);
    if (overlappingNode) {
      node.setNeighbor(overlappingNode, {
        cost: 0,
        childA: child,
        childB: child,
      });
    }

    this.tempNodes.set(child, node);
    return node.reconnect();
  }

  private getClusterFor(child: INode) {
    const index = child.location
      .divide(this.clusterSize)
      .apply(Math.floor);
    
    return this.clusters[index.y][index.x];
  }

  forEach(iterator: (cluster: Cluster, pathfinding: Pathfinding) => void) {
    for (let row of this.clusters)
      for (let cluster of row)
        iterator(cluster, this);
  }
}


function last<T>(list: T[]): T {
  return list[list.length - 1];
}