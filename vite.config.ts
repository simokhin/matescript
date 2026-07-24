import { defineConfig } from "vite";

export default defineConfig({
  root: "web",
  base: "/tsengine/",
  build: {
    outDir: "../dist",
    emptyOutDir: true,
  },
});
