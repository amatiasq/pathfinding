export interface ITile {
  readonly x: number;
  readonly y: number;
  readonly isObstacle: boolean;
  color: string;
  isNeighbor(other: ITile): boolean;
}
