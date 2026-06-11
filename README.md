# 知识工程产品原型仓库

本仓库用于维护知识工程项目的产品原型，并通过 GitHub Actions 发布到 GitHub Pages。

当前原型基于历史旧版知识工程原型维护，Tool Hub 一期作为知识工程定制模块补充在其中。后续原型设计默认使用 Product Design 插件，React/Vite/TypeScript 仅作为可运行原型承载层。

## 默认原型方案

- Product Design 负责原型 brief、视觉目标确认、原型实现辅助和设计 QA。
- 不再默认使用旧的 `react-prototype-builder` / 自定义 React 原型生成工作流。
- PRD 与原型说明文档仍使用原有文档方案，不由 Product Design 接管。
- 具体执行规则见 `PRODUCT_DESIGN_WORKFLOW.md`。

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
