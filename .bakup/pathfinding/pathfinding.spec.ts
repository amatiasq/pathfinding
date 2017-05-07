import { assert } from "chai";
import { AStar } from "./a-star";
import { Pathfinding } from "./pathfinding";
import { IPathfindingTile } from "./i-pathfinding-node";
import { IArea } from "./i-area";
import { Side } from "../config";
import { Vector3D } from "../core/vector3d";


describe.skip('Pathfinding library', () => {
  let sut: Pathfinding;
  let world: IArea;
  let algorithm: AStar<NodeMock>;

  beforeEach(() => {
    algorithm = new AStar<NodeMock>();
    world = new MockArea();
  });

  it("should return null if there is no path", () => {});
  it("should return empty array if the origin and destination are the same", () => {});
  it("should return an array with only the destination if it's origin's direct neighbor", () => {});
  it("should return an array with the middle steps and the destination if possible", () => {});
  it("should return the shortest path", () => {});
  it("should return avoid obstacles", () => {});
  it("should allow to move up or down if both are not obstacles", () => {});
});


class MockArea implements IArea {
  size: Vector3D;
  private content: NodeMock[][][];

  get(z: number, y: number, x: number) {
    const layer = this.content[z];
    if (!layer) return null;
    const row = layer[y];
    if (!row) return null;
    return row[x] || null;
  }

  getNeighbors(tile: IPathfindingTile) {
    if (tile.isObstacle)
      return [];

    return [
      this.get(tile.location.z, tile.location.y - 1, tile.location.x - 1),
      this.get(tile.location.z, tile.location.y - 1, tile.location.x),
      this.get(tile.location.z, tile.location.y - 1, tile.location.x + 1),
      this.get(tile.location.z, tile.location.y, tile.location.x - 1),
      this.get(tile.location.z, tile.location.y, tile.location.x + 1),
      this.get(tile.location.z, tile.location.y + 1, tile.location.x - 1),
      this.get(tile.location.z, tile.location.y + 1, tile.location.x),
      this.get(tile.location.z, tile.location.y + 1, tile.location.x + 1),
      this.get(tile.location.z - 1, tile.location.y, tile.location.x),
      this.get(tile.location.z + 1, tile.location.y, tile.location.x),
    ].filter(tile => tile && !tile.isObstacle);
  }

  getEdge(faceA: Side, faceB: Side) {
    let z = null as number;
    let x = null as number;
    let y = null as number;

    if (faceA === faceB)
      throw new Error('faceA and faceB should be different');

    if (faceA === Side.UP || faceB === Side.UP)
      z = 0;
    
    if (faceA === Side.DOWN || faceB === Side.DOWN)
      z = this.size.z - 1;

    if (faceA === Side.NORTH || faceB === Side.NORTH)
      y = 0
    
    if (faceA === Side.SOUTH || faceB === Side.SOUTH)
      y = this.size.y - 1;
    
    if (faceA === Side.WEST || faceB === Side.WEST)
      x = 0;
    
    if (faceA === Side.EAST || faceB === Side.EAST)
      x = this.size.x - 1;

    if (x !== null && y !== null)
      return this.content.map(layer => layer[y][x])

    if (z !== null && x !== null)
      return this.content[z].map(row => row[x]);

    if (z !== null && y !== null)
      return this.content[z][y] || null;
    
    throw new Error('Invalid Side calculation');
  }

  getFace(face: Side) {
    if (face == null)
      throw new Error('Argument can\'t be null');

    if (face === Side.UP || face === Side.DOWN) {
      const z = face === Side.UP ? 0 : this.size.z - 1;
      return [].concat(...this.content[z]);
    }

    // if only one layer .getEdge() is cheapest
    if (this.size.z === 1)
      return this.getEdge(Side.UP, face);
    
    if (face === Side.NORTH || face === Side.SOUTH) {
      const y = face === Side.NORTH ? 0 : this.size.y - 1;
      return [].concat(...this.content.map(layer => layer[y]));
    }
    
    if (face === Side.WEST || face === Side.EAST) {
      const x = face === Side.WEST ? 0 : this.size.y - 1;
      const result = [];

      for (let k = 0; k < this.size.z; k++)
        for (let j = 0; j < this.size.y; j++)
          result.push(this.get(k, x, j));
      
      return result;
    }
  }
  
  getRange(position: Vector3D, size: Vector3D) {
    const range = [] as NodeMock[][][];

    for (let i = 0; i < size.z; i++) {
      range[i] = [];
      for (let j = 0; j < size.y; j++) {
        range[i][j] = [];
        for (let k = 0; k < size.x; k++)
          range[i][j][k] = this.get(position.z + i, position.y + j, position.x + k);
      }
    }

    const area = new MockArea();
    area.content = range;
    return area;
  }

  getNeighbor(tile: IPathfindingTile, side: Side): IPathfindingTile {
    switch (side) {
      case Side.UP:
        return this.get(tile.location.z - 1, tile.location.y, tile.location.x);
      case Side.DOWN:
        return this.get(tile.location.z + 1, tile.location.y, tile.location.x);
      case Side.NORTH:
        return this.get(tile.location.z, tile.location.y - 1, tile.location.x);
      case Side.SOUTH:
        return this.get(tile.location.z, tile.location.y + 1, tile.location.x);
      case Side.EAST:
        return this.get(tile.location.z, tile.location.y, tile.location.x - 1);
      case Side.WEST:
        return this.get(tile.location.z, tile.location.y, tile.location.x + 1);
    }
  }
}


class NodeMock implements IPathfindingTile {
  location: Vector3D;
  travelCost = 0;
  private neighbors = new Map<IPathfindingNode, number>();

  get isObstacle() {
    return this.travelCost === 0;
  }

  constructor(private distanceToEnd: number) {}

  isNeighbor(other: NodeMock) {
    return this.getNeighbors().indexOf(other) !== -1;
  }

  getNeighbors(area?: IArea) {
    return [ ... this.neighbors.keys() ];
  }

  getCostTo(node: NodeMock): number {
    return this.neighbors.get(node);
  }

  estimateDistanceTo(node: NodeMock) {
    return this.distanceToEnd;
  }

  _setNeighbor(neighbor: NodeMock, cost: number) {
    this.neighbors.set(neighbor, cost);
    neighbor.neighbors.set(this, cost);
  }
}




  beforeEach(() => {
    algorithm = new AStar(1);
    sut = new Pathfinding(1);

  });


  it('should return null if there is no connection', () => {
    const start = new NodeMock(1);
    const end = new NodeMock(0);
    const result = sut.getPath(start, end);
    assert(result == null, 'Return value is not null');
  });


  it('should return empty array if start equals end', () => {
    const start = new NodeMock(0);
    const result = sut.getPath(start, start);
    assert.isArray(result);
    assert.equal(result.length, 0);
  })


  it('should return a array with the last argument if they are direct neighbors', () => {
    const start = new NodeMock(1);
    const end = new NodeMock(0);
    start._setNeighbor(end, 1);
    const result = sut.getPath(start, end);

    assert.isArray(result);
    assert.equal(result.length, 1);
    assert.equal(result[0], end, "Last cell isn't end");
  });


  it('should return a array with the last path for more complex networks', () => {
    const start = new NodeMock(2);
    const middle = new NodeMock(1);
    const end = new NodeMock(0);
    start._setNeighbor(middle, 1);
    middle._setNeighbor(end, 1);
    const result = sut.getPath(start, end);

    assert.isArray(result);
    assert.equal(result.length, 2);
    assert.equal(result[0], middle, "First cell isn't the network");
    assert.equal(result[1], end, "Last cell isn't end");
  });


  it('should not return dead ends', () => {
    const start = new NodeMock(2);
    const middle = new NodeMock(1);
    const dead = new NodeMock(1);
    const end = new NodeMock(0);
    start._setNeighbor(middle, 1);
    start._setNeighbor(dead, 1);
    middle._setNeighbor(end, 1);
    const result = sut.getPath(start, end);

    assert.isArray(result);
    assert.equal(result.length, 2);
    assert.equal(result[0], middle, "First cell isn't the expected path");
    assert.equal(result[1], end, "Last cell isn't end");
  });


  it('should pick the shortest path', () => {
    const start = new NodeMock(3);
    const a1 = new NodeMock(1);
    const a2 = new NodeMock(1);
    const b1 = new NodeMock(2);
    const end = new NodeMock(0);
    start._setNeighbor(a1, 1);
    a1._setNeighbor(a2, 1);
    a2._setNeighbor(end, 1);
    start._setNeighbor(b1, 1);
    b1._setNeighbor(end, 1);
    const result = sut.getPath(start, end);

    assert.isArray(result);
    assert.equal(result.length, 2);
    assert.equal(result[0], b1, "First cell isn't the expected path");
    assert.equal(result[1], end, "Last cell isn't end");
  })
});


