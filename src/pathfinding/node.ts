import { Vector3D } from '../core/vector3d';


export interface INode {
  isObstacle: boolean;
  canTravelUp: boolean;
  isEmpty: boolean;
  location: Vector3D;
}
