import AStar, { IAStarNode } from './a-star';
import { IArea } from "./i-area";
import { assert } from "chai";

describe.skip('A* algorithm', () => {
  let sut: AStar<NodeMock>;
  beforeEach(() => sut = new AStar<NodeMock>(1));


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


class NodeMock implements IAStarNode {
  private neighbors = new Map<IAStarNode, number>();

  constructor(private distanceToEnd: number) {}

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