import { defineConfig } from "vite";
export default defineConfig({
  server: {
    port: 5173,
  },
  build: {
    target: "es2023",
    sourcemap: false,           // 本番はソースマップなし
    minify: "esbuild",          // ここはVite内部で使うだけ。別インストール不要
    rollupOptions: {
      input: "src/index.ts",
      output: {
        format: "iife",         // 単一ファイルの自己実行形式
        entryFileNames: "bundle.js",
        dir: "dist"
      }
    }
  }
});
