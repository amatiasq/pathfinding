import { INode } from './node';


const LAYER_CHANGE_COST = 2;
const DIAGONAL_MOVEMENT_COST = Math.SQRT2;


export const measurer = {

  estimateDistance(from: INode, to: INode) {
    return from.location.sustract(to.location).magnitude;
  },

  getNeighborCost(from: INode, to: INode) {
    const distance = from.location.sustract(to.location).apply(Math.abs);

    if (distance.z === 1)
      return LAYER_CHANGE_COST;

    if (distance.y === 1 && distance.x === 1)
      return DIAGONAL_MOVEMENT_COST;

    return 1;
  },
};
