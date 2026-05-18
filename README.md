# 知识工程产品原型仓库

本仓库用于维护知识工程项目的产品原型，并通过 GitHub Actions 发布到 GitHub Pages。

当前原型基于历史旧版知识工程原型维护，Tool Hub 一期作为知识工程定制模块补充在其中。后续原型默认在 `prototype/` 下生成，技术栈采用 React/Vite/TypeScript。

## 本地预览

```bash
cd prototype
npm install
npm run dev
```

## 构建验证

```bash
cd prototype
npm run build
```

## GitHub Pages

仓库 Pages 发布源建议配置为 `GitHub Actions`。推送到 `main` 后，`.github/workflows/pages.yml` 会自动构建 `prototype/dist` 并发布。
