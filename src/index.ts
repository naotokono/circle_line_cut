import { g } from "./global";
import { Circle } from "./circle";
import { Wall } from "./wall";
import { detectCollisions, collide } from "./collision";
import { Line } from "./line";

// HMR ではなく普通のリロードにする
(import.meta as any).hot?.accept(() => location.reload());

// 描画用のプロトタイプ定義。
// TODO: これをここに書くのは良くない気がする…。
Object.defineProperty(Number.prototype, 'canvasScale', {
  get() { return (g.canvas.width / 2) * this; },
});

declare global {
  interface Number {
    readonly canvasScale: number;
  }
}

// 内部解像度の設定
g.canvas.width = 1000;
g.canvas.height = 1000;
// 座標系の調整
g.ctx.translate(g.canvas.width / 2, g.canvas.height / 2);
g.ctx.scale(1, -1);
// cssリサイズ
g.canvas.style.width  = '300px';
g.canvas.style.height = '300px';

Wall.create();
const circleSpeed = 0.3;
const circleRadius = 0.05;
['red', 'cyan', 'magenta', 'yellow', 'lime', 'pink'].forEach((color, index) => {
  // ランダムな初期位置と速度方向にするが、スピードは同じにする。
  const positionAngle = Math.random() * Math.PI * 2;
  const positionAngleDot = Math.random() * Math.PI * 2;
  const distanceFromCenter = Math.random() * (Wall.wall.radius - circleRadius);
  Circle.create(
    distanceFromCenter * Math.cos(positionAngle),
    distanceFromCenter * Math.sin(positionAngle),
    circleSpeed * Math.cos(positionAngleDot + Math.PI / 2),
    circleSpeed * Math.sin(positionAngleDot + Math.PI / 2),
    circleRadius,
    color
  );
});

const step = () => {
  g.prevAt = g.currentAt;
  g.currentAt = performance.now() / 1000;
  g.dt = g.currentAt - g.prevAt;

  // （衝突のトンネル防ぐための）サブステップ
  // 1ステップ中の最大移動距離が、円の半径の半分以下になるようにステップ数を決定する。
  const maxCircleSpeed = Math.max(...Object.values(Circle.idToCircle).map(c => Math.hypot(c.positionXDot, c.positionYDot)));
  const maxAllowedMove = circleRadius * 0.5;
  let subStepsCount = 1;
  if (maxCircleSpeed * g.dt > maxAllowedMove) {
    subStepsCount = Math.ceil((maxCircleSpeed * g.dt) / maxAllowedMove);
  }
  const MAX_SUB_STEPS_COUNT = 100;
  subStepsCount = Math.min(subStepsCount, MAX_SUB_STEPS_COUNT);
  // TODO: デバッグ用なので消す
  console.log(`subStepsCount: ${subStepsCount}`);
  const subStepDt = g.dt / subStepsCount;

  for (let s = 0; s < subStepsCount; s++) {
    // 遷移（サブステップ）
    for (const circle of Object.values(Circle.idToCircle)) {
      circle.translate(subStepDt);
    }

    // 衝突判定・解決（サブステップ）
    const collisions = detectCollisions();
    collide(
      collisions[0],
      collisions[1],
      collisions[2]
    );
  }

  // 描画（フレームごとに一度だけ）
  // 背景クリア
  g.ctx.fillStyle = 'black';
  g.ctx.fillRect(-g.canvas.width / 2, -g.canvas.height / 2, g.canvas.width, g.canvas.height); // 画面クリア
  // オブジェクト
  Wall.wall.draw();
  for (const circle of Object.values(Circle.idToCircle)) {
    circle.draw();
  }
  for (const line of Object.values(Line.idToLine)) {
    line.draw();
  }

  requestAnimationFrame(step);
}

requestAnimationFrame(step);
