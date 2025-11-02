// 副作用モジュール：アプリ起動時に1回だけ実行させる
import { g } from "../global";

// 描画用のプロトタイプ定義。
Object.defineProperty(Number.prototype, 'canvasScale', {
  get() { return (g.canvas.width / 2) * this; },
});
