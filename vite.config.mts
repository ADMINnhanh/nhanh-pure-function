import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import dts from "vite-plugin-dts";
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js";

export default defineConfig({
  // 配置 TypeScript 路径别名
  plugins: [
    tsconfigPaths(),
    dts({
      insertTypesEntry: true, // 插入类型入口
    }),
    cssInjectedByJsPlugin(), // 将 CSS 注入到 JS 中
  ],
  // 构建配置
  build: {
    // 输出目录
    outDir: "dist",
    // 库模式配置
    lib: {
      // 入口文件
      entry: "src/index.ts",
      // 库名称
      name: "nhanh-pure-function",
      // 生成的文件名
      fileName: (format) => `index.${format}.js`,
      // 支持的模块格式
      formats: ["es", "cjs"],
    },
    rollupOptions: {
      // 确保外部化处理那些你不想打包进库的依赖
      external: [],
      output: {
        // 在 UMD 构建模式下为这些外部化的依赖提供全局变量
        globals: {},
      },
    },
  },
  // 配置 Less
  css: {
    preprocessorOptions: {
      less: {
        // 可以在这里添加 Less 相关的配置，例如全局变量等
        javascriptEnabled: true,
      },
    },
  },
});
