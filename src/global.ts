interface Global {
  prevAt: number;
  currentAt: number;
  dt: number;
  
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
}
 
const dt = 1/ 60;
const currentAt = performance.now() / 1000;
const prevAt = currentAt - dt;
const canvas = document.querySelector('canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d');
if (ctx === null) {
  throw new Error('2Dコンテキストが取得できません');
}

const g = {
  dt,
  currentAt,
  prevAt,
  canvas,
  ctx
}

export { g };
