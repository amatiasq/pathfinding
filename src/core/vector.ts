import { degreesToRadians, round, DEGREES_IN_PI_RADIANS, MAX_DEGREES } from './helpers';


export interface IVector {
  readonly DIMENSIONS: number;
  readonly x: number;
  readonly y: number;
  readonly isZero: boolean;
  readonly magnitude: number;

  /*
  readonly radians: number;
  readonly degrees: number;
  */

  is({ x, y }: VectorSetter): boolean;
  set({ x, y }: VectorSetter): IVector;
  add({ x, y }: VectorSetter): IVector;
  sustract({ x, y }: VectorSetter): IVector;
  multiply({ x, y }: VectorSetter): IVector;
  divide({ x, y }: VectorSetter): IVector;

  isValue(x: number, y?: number): boolean;
  setValue(x: number, y?: number): IVector;
  addValue(x: number, y?: number): IVector;
  sustractValue(x: number, y?: number): IVector;
  multiplyValue(x: number, y?: number): IVector;
  divideValue(x: number, y?: number): IVector;

  apply(operation: (coord: number) => number): IVector;
  every(operation: VectorTest): boolean;
  some(operation: VectorTest): boolean;

  clone(): IVector;
  toImmutable(): IVector;
  toMutable(): IVector;
  toString(): string;
  toArray(): number[];
  toJSON(): string;
}


abstract class BaseVector<T extends IVector> implements IVector {
  static readonly round = round;

  static *iterate(vectorA: IVector, vectorB: IVector = new Vector(0, 0)) {
    const start = this.apply(Math.min, vectorA, vectorB);
    const end = this.apply(Math.max, vectorA, vectorB);
    const current = start.toMutable() as MutableVector;

    for (current.y = start.y; current.y < end.y; current.y++)
      for (current.x = start.x; current.x < end.x; current.x++)
        yield current.toImmutable();
  }

  static apply(action: (...values: number[]) => number, ...vectors: IVector[]) {
    return new Vector(
      action(...vectors.map(vector => vector.x)),
      action(...vectors.map(vector => vector.y)),
    );
  }

  /*
  static fromRadians(radians: number): BaseVector<IVector> {
    return this.construct(Math.cos(radians), Math.sin(radians));
  }

  static fromDegrees(degrees: number): BaseVector<IVector> {
    return this.fromRadians(degreesToRadians(degrees));
  }

  static fromMagnitude(value: number): BaseVector<IVector> {
    return this.construct(value, 0);
  }

  static from(degrees: number, magnitude: number): BaseVector<IVector> {
    const vector = this.fromDegrees(degrees);
    return this.construct(vector.x * magnitude, vector.y * magnitude);
  }
  */

  static merge(vectorA: IVector, vectorB: IVector, ...others: IVector[]): BaseVector<IVector> {
    let x = vectorA.x + vectorB.x;
    let y = vectorA.y + vectorB.y;

    if (others.length) {
      for (const vector of others) {
        x += vector.x;
        y += vector.y;
      }
    }

    return this.construct(x, y);
  }

  static diff(vectorA: IVector, vectorB: IVector, ...others: IVector[]): BaseVector<IVector> {
    let x = vectorA.x - vectorB.x;
    let y = vectorA.y - vectorB.y;

    if (others.length) {
      for (const vector of others) {
        x -= vector.x;
        y -= vector.y;
      }
    }

    return this.construct(x, y);
  }

  private static construct(x: number, y: number): BaseVector<IVector> {
    // We need to use any because it's going to be a subclass and we can't use
    //   BaseVector because it's abstract
    // tslint:disable-next-line:no-any
    return new (this as any)(x, y);
  }


  readonly DIMENSIONS: 2;
  readonly x: number;
  readonly y: number;


  constructor(x: number, y: number) {
    this.x = round(x);
    this.y = round(y);
  }


  get isZero(): boolean {
    return this.x === 0 && this.y === 0;
  }

  get radians(): number {
    if (this.isZero)
      return 0;

    let arctan = Math.atan(this.y / this.x);

    if (arctan < 0)
      arctan += Math.PI;

    if (this.y < 0 || (this.y === 0 && this.x < 0))
      arctan += Math.PI;

    return arctan;
  }

  get degrees(): number {
    const degrees = (this.radians / Math.PI * DEGREES_IN_PI_RADIANS) % MAX_DEGREES;
    return degrees < 0 ? degrees + MAX_DEGREES : degrees;
  }

  get magnitude(): number {
    return this.isZero ? 0 : round(Math.hypot(this.x, this.y));
  }


  is({ x = this.x, y = this.y }: VectorSetter): boolean {
    return this.x === x && this.y === y;
  }
  isValue(x: number, y = x): boolean {
    return this.x === x && this.y === y;
  }

  set({ x = this.x, y = this.y }: VectorSetter): T {
    return this.setValue(x, y);
  }
  abstract setValue(x: number, y?: number): T;

  add({ x = 0, y = 0 }: VectorSetter): T {
    return this.setValue(this.x + x, this.y + y);
  }
  addValue(x: number, y = x): T {
    return this.setValue(this.x + x, this.y + y);
  }

  sustract({ x = 0, y = 0 }: VectorSetter): T {
    return this.setValue(this.x - x, this.y - y);
  }
  sustractValue(x: number, y = x): T {
    return this.setValue(this.x - x, this.y - y);
  }

  multiply({ x = 1, y = 1 }: VectorSetter): T {
    return this.setValue(this.x * x, this.y * y);
  }
  multiplyValue(x: number, y = x): T {
    return this.setValue(this.x * x, this.y * y);
  }

  divide({ x = 1, y = 1 }: VectorSetter): T {
    return this.setValue(this.x / x, this.y / y);
  }
  divideValue(x: number, y = x): T {
    return this.setValue(this.x / x, this.y / y);
  }


  apply(operation: (coord: number) => number): T {
    return this.setValue(operation(this.x), operation(this.y));
  }
  every(operation: VectorTest): boolean {
    return operation(this.x) && operation(this.y);
  }
  some(operation: VectorTest): boolean {
    return operation(this.x) || operation(this.y);
  }

  abstract clone(): T;
  toImmutable(): Vector {
    return new Vector(this.x, this.y);
  }
  toMutable(): MutableVector {
    return new MutableVector(this.x, this.y);
  }

  toString(): string {
    return `[Vector(${this.x},${this.y})]`;
  }
  toArray(): number[] {
    return [ this.x, this.y ];
  }
  toJSON(): string {
    return `{x:${this.x},y:${this.y}}`;
  }

}


/**
 * This version of Vector is immutable, any method that requires a modification
 * of the properties will return a new Vector.
 * If you want mutability you can import { MutableVector } instead
 */
export class Vector extends BaseVector<Vector> implements IVector {
  static ZERO = new Vector(0, 0);
  static MAX = new Vector(Infinity, Infinity);

  // This method doesn't use this because this implementation is inmutable
  //   It can be mutable in other implementations.
  // tslint:disable-next-line:prefer-function-over-method
  setValue(x: number, y = x): Vector {
    return new Vector(x, y);
  }

  clone() {
    return this.toImmutable();
  }
}


export class MutableVector extends BaseVector<MutableVector> implements IVector {
  x: number;
  y: number;


  set radians(value: number) {
    const magnitude = this.magnitude;
    this.x = Math.cos(value) * magnitude;
    this.y = Math.sin(value) * magnitude;
  }

  set degrees(value: number) {
    this.radians = degreesToRadians(value);
  }

  set magnitude(value: number) {
    const prevMagnitude = this.magnitude;
    this.x = Math.cos(value) * prevMagnitude;
    this.y = Math.sin(value) * prevMagnitude;
  }


  setValue(x: number, y = x): this {
    this.x = x;
    this.y = y;
    return this;
  }

  clone() {
    return this.toMutable();
  }
}


interface IXSetter {
  x: number;
  y?: number;
  z?: number;
}

interface IYSetter {
  x?: number;
  y: number;
  z?: number;
}

export type VectorSetter = IXSetter | IYSetter;
export type VectorTest = (coord: number) => boolean;
