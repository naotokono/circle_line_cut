export {};

// Number をグローバルに型汚染するのはどうかと思うが、無いとあまりにも不便。
declare global {
  interface Number {
    readonly canvasScale: number;
  }
}
