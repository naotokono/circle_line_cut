import { defineConfig } from "vite";
export default defineConfig({
  server: {
    port: 5173,
    hmr: false,
  },
  build: {
    target: "es2023",
    sourcemap: false,
    minify: "esbuild",
  }
});
