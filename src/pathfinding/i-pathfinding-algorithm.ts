import { ITile } from "./i-tile";
import { IArea } from "./i-area";


export interface IPathfindingAlgorithm  {
  calculate(map: IArea, start: ITile, end: ITile): ITile[];

  /*
  debug(map: IArea, start: ITile, end: ITile, {
    visited,
    neighbor,
    active,
  }: {
    visited: number,
    neighbor: number,
    active: number,
  } | null): IterableIterator<ITile>;
  */
}
