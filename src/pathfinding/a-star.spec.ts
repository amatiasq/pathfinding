import AStar from './a-star';
import { INode, INodeRelation } from "./i-node";
import Vector3D from "../core/vector3d";
import { IArea } from "./i-area";
import { assert } from "chai";

describe('A* algorithm', () => {
  it('should return null if there is no connection', () => {
    const sut = new AStar<NodeMock>(1);
    const start = new NodeMock(0, 0, 0);
    const end = new NodeMock(0, 0, 1);

    const result = sut.getPath(start, end);
    assert(result == null, 'Return value is not null');
  });

  it('should return a array with the last argument if they are direct neighbors', () => {
    const sut = new AStar<NodeMock>(1);
    const start = new NodeMock(0, 0, 0);
    const end = new NodeMock(0, 0, 1);

    setNeighbor(start, end, 1);

    const result = sut.getPath(start, end);
    assert.isArray(result);
    assert.equal(result.length, 1);
    assert.equal(result[0], end, "Last cell isn't end");
  });

  it('should return a array with the last path for more complex networks', () => {
    const sut = new AStar<NodeMock>(1);
    const start = new NodeMock(0, 0, 0);
    const middle = new NodeMock(0, 0, 1);
    const end = new NodeMock(0, 0, 2);

    setNeighbor(start, middle, 1);
    setNeighbor(middle, end, 1);

    const result = sut.getPath(start, end);
    assert.isArray(result);
    assert.equal(result.length, 2);
    assert.equal(result[0], middle, "First cell isn't the network");
    assert.equal(result[1], end, "Last cell isn't end");
  });

  it('should not return dead ends', () => {
    const sut = new AStar<NodeMock>(1);
    const start = new NodeMock(0, 0, 0);
    const middle = new NodeMock(0, 0, 1);
    const dead = new NodeMock(0, 1, 0);
    const end = new NodeMock(0, 0, 2);

    setNeighbor(start, middle, 1);
    setNeighbor(start, dead, 1);
    setNeighbor(middle, end, 1);

    const result = sut.getPath(start, end);
    assert.isArray(result);
    assert.equal(result.length, 2);
    assert.equal(result[0], middle, "First cell isn't the network");
    assert.equal(result[1], end, "Last cell isn't end");
  })
});


function setNeighbor(nodeA: NodeMock, nodeB: NodeMock, cost: number) {
  const relation = {
    cost: 1,
    childA: nodeA,
    childB: nodeB,
  };

  nodeA.neighbors.set(nodeB, relation);
  nodeB.neighbors.set(nodeA, relation);
}

class NodeMock implements INode {
  location: Vector3D;
  travelCost = 1;
  isObstacle = false;
  neighbors: Map<INode, INodeRelation>;

  constructor(z: number, y: number, x: number) {
    this.location = new Vector3D(x, y, z);
    this.neighbors = new Map();
  }

  getCostTo(node: INode) {
    return this.location.diff(node.location).magnitude;
  }

  estimateDistanceTo(node: INode) {
    return this.location.diff(node.location).magnitude;
  }

  isNeighbor(node: INode) {
    return this.neighbors.has(node);
  }

  getNeighbors(area?: IArea) {
    return this.neighbors;
  }
}