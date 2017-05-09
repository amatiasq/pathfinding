import { IVector } from "./vector";

export class Matrix<T> {
  private readonly operator: number[];
  public readonly dimensions: number;

  constructor(
    private readonly data: T[],
    public readonly shape: number[]
  ) {
    this.operator = [];
    let accumulator = 1;
    this.dimensions = shape.length;

    for (let i = shape.length - 1; i >= 0; i--) {
      this.operator[i] = accumulator;
      accumulator *= shape[i];
    }
  }


  get(...coords: number[]): T {
    const index = this.getIndex(coords);
    return this.data[index];
  }


  set(value: T, ...coords: number[]): T {
    const index = this.getIndex(coords);
    this.data[index] = value;
    return value;
  }


  getRange(offset: number[], size: number[] = null): Matrix<T> {
    this.checkDimensions(offset);

    if (size)
      this.checkDimensions(size);
    else
      size = this.shape.map((dimension, index) => dimension - offset[index]);

    const result = this.data.filter((value, index) => {
      for (let i = 0; i < this.operator.length; i++) {
        const operator = this.operator[i];
        const axisValue = Math.floor(index / operator);
        index = index % operator;

        if (axisValue < offset[i] || axisValue - offset[i] >= size[i])
          return false;
      }

      return true;
    });

    return new Matrix(result, size);
  }


  public getIndex(coords: number[]): number {
    this.checkDimensions(coords);
    let index = 0;

    for (let i = 0; i < coords.length; i++)
      index += coords[i] * this.operator[i];

    return index;
  }


  protected checkDimensions(array: number[]) {
    if (array.length !== this.shape.length)
      throw new Error(`${this.shape.length} dimensions are required but ${array.length} provided`);
  }
}



export class VectorMatrix<T> extends Matrix<T> {
  get(vector: IVector): T;
  get(...coords: number[]): T;
  get(...coords: (IVector | number)[]) {
    return super.get(...this.normalizeCoords(coords));
  }

  set(value: T, vector: IVector): T;
  set(value: T, ...coords: number[]): T;
  set(value: T, ...coords: (IVector | number)[]) {
    return super.set(value, ...this.normalizeCoords(coords));
  }

  private normalizeCoords(coords: (IVector | number)[]): number[] {
    return typeof coords[0] === 'number' ?
      coords as number[] :
      (coords[0] as IVector).toArray().reverse();
  }
}