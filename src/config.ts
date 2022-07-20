export class Color {
  public static readonly TILE = new Color(0x101010);
  public static readonly CLUSTER = [
    new Color(0x0000ff),
    new Color(0x0000ff),
    new Color(0xffff00),
    new Color(0xff00ff),
    new Color(0x00ffff),
  ];

  private constructor(public value: number) {}

  toString(): string {
    let value = this.value.toString(16);

    while (value.length < 6) value = '0' + value;

    return `#${value}`;
  }
}

export enum Side {
  NORTH,
  SOUTH,
  EAST,
  WEST,
  // UP,
  // DOWN,
}
