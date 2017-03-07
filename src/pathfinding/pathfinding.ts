import Cluster from "./cluster";
import { IPathfindingAlgorithm } from "./i-pathfinding-algorithm";
import { IArea } from "./i-area";


export default class Pathfinding {
  private readonly clusters: Cluster[][];
  public readonly width: number;
  public readonly height: number;


  constructor(
    private readonly world: IArea,
    private readonly algorithm: IPathfindingAlgorithm,
    public readonly clusterSize: number,
  ) {
    this.width = Math.ceil(world.width / clusterSize);
    this.height = Math.ceil(world.height / clusterSize);
    this.clusters = [];

    for (let i = 0; i < this.width; i++) {
      this.clusters[i] = [];

      for (let j = 0; j < this.height; j++) {
        const range = world.getRange(
          i * clusterSize,
          j * clusterSize,
          clusterSize,
          clusterSize,
        );

        const cluster = new Cluster(world, algorithm, i, j, range);
        this.clusters[i][j] = cluster;
        cluster.processEntrances();
      }
    }
  }


  forEach(iterator: (cluster: Cluster, pathfinding: Pathfinding) => void) {
    for (let row of this.clusters)
      for (let cluster of row)
        iterator(cluster, this);
  }
}
