export class Color {
  public static readonly TILE = new Color(0x00FF00);
  public static readonly CLUSTER = [
    new Color(0xFF0000),
    new Color(0x0000FF),
    new Color(0xFFFF00),
    new Color(0xFF00FF),
    new Color(0x00FFFF),
  ];


  private constructor(public value: number) {}


  toString(): string {
    let value = this.value.toString(16);
    
    while (value.length < 6)
      value = '0' + value;

    return `#${value}`;
  }
}


export enum Side {
  NORTH,
  SOUTH,
  EAST,
  WEST,
  UP,
  DOWN,
}