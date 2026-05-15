# 工具Hub 1.0 原型仓库

本仓库用于维护工具Hub 1.0 的 React/Vite 原型源码，并通过 GitHub Actions 发布到 GitHub Pages。

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
