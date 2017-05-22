import { IVector } from './vector';

export class Matrix<T> {
  private readonly operator: number[];
  readonly dimensions: number;

  constructor(
    private readonly data: T[],
    public readonly shape: number[],
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
    return this.data[index] || null;
  }


  set(value: T, ...coords: number[]): T {
    const index = this.getIndex(coords);

    // tslint:disable-next-line:strict-type-predicates
    if (index == null)
      throw new Error('Index out of range');

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


  private getIndex(coords: number[]): number {
    this.checkDimensions(coords);
    let index = 0;

    for (let i = 0; i < coords.length; i++) {
      if (coords[i] >= this.shape[i])
        return null;

      index += coords[i] * this.operator[i];
    }

    return index;
  }


  protected checkDimensions(array: number[]) {
    if (array.length !== this.shape.length)
      throw new Error(`${this.shape.length} dimensions are required but ${array.length} provided`);
  }
}


export class VectorMatrix<T, U extends IVector> extends Matrix<T> {
  constructor(
    data: T[],
    public readonly size: U,
  ) {
    super(data, size.toArray().reverse());
  }


  getVector(vector: U): T {
    return this.get(...vector.toArray().reverse());
  }

  setVector(value: T, vector: U): T {
    return this.set(value, ...vector.toArray().reverse());
  }
}
