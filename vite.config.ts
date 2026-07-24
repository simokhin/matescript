import { defineConfig } from "vite";

export default defineConfig({
  root: "web",
  base: "/matescript/",
  build: {
    outDir: "../dist",
    emptyOutDir: true,
  },
});
