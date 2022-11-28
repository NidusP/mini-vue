import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    // 全局api 无需手动引入
    globals: true,
  },
  resolve: {
    alias: [
      {
        find: /@mini-vue\/([\w-]*)/,
        replacement: path.resolve(__dirname, "packages") + "/$1/src",
      },
    ],
  },
});
