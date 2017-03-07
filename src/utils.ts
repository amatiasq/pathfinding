export function drawSquare(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  {
    color = 'black',
    width = null as number,
  } = {},
): void {

  ctx.save();
  ctx.strokeStyle = color;

  if (width)
    ctx.lineWidth = width;

  ctx.strokeRect(x, y, size, size);
  ctx.restore();
}


export function fillSquare(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  { color = 'black' } = {},
): void {

  // ctx.save();
  ctx.fillStyle = color;
  ctx.fillRect(x, y, size, size);
  // ctx.restore();
}
