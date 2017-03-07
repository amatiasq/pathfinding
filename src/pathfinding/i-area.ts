import { ITile } from "./i-tile";
import { Side } from "../config";


export interface IArea {
  readonly width: number;
  readonly height: number;

  getRange(x: number, y: number, width: number, height: number): IArea;
  getNeighbor(tile: ITile, direction: Side): ITile;
  getNeighbors(tile: ITile): ITile[];
  getRow(y: number): ITile[];
  getCol(x: number): ITile[];
}
