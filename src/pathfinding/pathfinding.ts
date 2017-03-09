import { IPathfindingAlgorithm } from "./i-pathfinding-algorithm";
import { IArea } from "./i-area";
import { INode } from "./i-node";
import { Node, TemporalNode } from "./node";
import { Cluster } from "./cluster";
import Vector from "../core/vector";


export class Pathfinding {
  private readonly nodes = [] as Node<INode>[];
  private readonly clusters: Cluster[][];
  private readonly tempNodes = new WeakMap<INode, TemporalNode<INode>>();
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


  resolve(start: INode, end: INode) {
    const startCluster = this.getClusterFor(start);
    const endCluster = this.getClusterFor(end);

    if (startCluster === endCluster) {
      return {
        levels: [],
        tiles: startCluster.resolve(start, end),
      };
    }

    const startNode = this.getTempNodeFor(start);
    const endNode = this.getTempNodeFor(end);
    const path = this.algorithm.getPath(startNode, endNode) as Node<INode>[];

    if (!path) {
      startNode.disconnect();
      endNode.disconnect();
      return null;
    }

    let tiles = [] as INode[];
    let prev = startNode as Node<INode>;

    for (const step of path) {
      tiles = [ ...tiles, ...this.getTilesBetween(prev, step) ];
      prev = step;
    }

    startNode.disconnect();
    endNode.disconnect();

    return {
      levels: [ path ],
      tiles,
    };
  }

  private getTilesBetween(start: Node<INode>, end: Node<INode>): INode[] {
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
        message += `${node.id} - ${(neighbor as Node<INode>).id} = ${relation.cost}\n`;
      }

      console.log(message);
    });
    */
  }

  private getNodeFor(child: INode) {
    let node = this.nodes.find(node => node.hasChild(child));

    if (!node) {
      node = new Node<INode>();
      node.addChild(child);
      this.nodes.push(node);
    }

    return node;
  }

  private getTempNodeFor(child: INode) {
    if (this.tempNodes.has(child))
      return this.tempNodes.get(child).reconnect();

    const cluster = this.getClusterFor(child);
    const node = new TemporalNode<INode>();
    node.addChild(child);

    for (const [ connection, path ] of cluster.getConnections(child)) {
      node.setNeighbor(this.getNodeFor(connection), {
        cost: this.algorithm.getCost(child, path),
        childA: child,
        childB: connection,
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