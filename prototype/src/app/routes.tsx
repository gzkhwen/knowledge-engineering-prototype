import { createBrowserRouter } from "react-router";
import { AdminLayout } from "./components/AdminLayout";
import { OpsLayout } from "./components/OpsLayout";
import { ClientLayout } from "./components/ClientLayout";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { NotFound } from "./pages/NotFound";
import { Login } from "./pages/Login";

// Admin pages
import { IndustryManagement } from "./pages/IndustryManagement";
import { DomainManagement } from "./pages/DomainManagement";
import { ScenarioManagement } from "./pages/ScenarioManagement";
import { RelationshipManagement } from "./pages/RelationshipManagement";
import { ClassificationManagement } from "./pages/ClassificationManagement";
import { TemplateManagement } from "./pages/TemplateManagement";
import { TemplateEditor } from "./pages/TemplateEditor";
import { ToolHubDetailPage, ToolHubPage, ToolHubRunRecordsPage } from "./pages/ToolHubPage";
import { StylePreview } from "./components/StylePreview";

// Ops pages
import { ProjectManagement } from "./pages/ProjectManagement";
import { ProjectWorkspace } from "./pages/ProjectWorkspace";
import { ProjectSolutionEditor } from "./pages/ProjectSolutionEditor";
import { ProjectSolutionViewer } from "./pages/ProjectSolutionViewer";
import { FileUploadPage } from "./pages/FileUploadPage";
import { QALibraryPage } from "./pages/QALibraryPage";
import { TermsLibraryPage } from "./pages/TermsLibraryPage";
import { UnstructuredSliceBuilding } from "./pages/UnstructuredSliceBuilding";
import { KnowledgePackageManagement } from "./pages/KnowledgePackageManagement";
import { KnowledgePackageView } from "./pages/KnowledgePackageView";
import { BuildResultVerification } from "./pages/BuildResultVerification";

// Client pages
import { ClientProjects } from "./pages/ClientProjects";
import { ClientProjectDetail } from "./pages/ClientProjectDetail";
import { ClientFileUpload } from "./pages/ClientFileUpload";
import { ClientUploadHistory } from "./pages/ClientUploadHistory";
import { ClientAcceptanceHistory } from "./pages/ClientAcceptanceHistory";
import { ClientKnowledgePackage } from "./pages/ClientKnowledgePackage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
    ErrorBoundary,
  },

  // ── 管理端 ─────────────────────────────────────────────────────────────────
  {
    path: "/admin",
    Component: AdminLayout,
    ErrorBoundary,
    children: [
      { index: true,          Component: ToolHubPage },
      { path: "tool-hub",     Component: ToolHubPage },
      { path: "tool-hub/run-records", Component: ToolHubRunRecordsPage },
      { path: "tool-hub/:toolId", Component: ToolHubDetailPage },
      { path: "classification", Component: ClassificationManagement },
      { path: "industry",      Component: IndustryManagement },
      { path: "domain",        Component: DomainManagement },
      { path: "scenario",      Component: ScenarioManagement },
      { path: "relationship",  Component: RelationshipManagement },
      { path: "template",      Component: TemplateManagement },
      { path: "template/:id/edit", Component: TemplateEditor },
      { path: "style-preview", Component: StylePreview },
    ],
  },

  // ── 运营端 ─────────────────────────────────────────────────────────────────
  {
    path: "/ops",
    Component: OpsLayout,
    ErrorBoundary,
    children: [
      { index: true,      Component: ProjectManagement },  // 默认显示项目空间管理
      { path: "projects", Component: ProjectManagement },
      // 项目方案详情（只读）- 独立路由
      { path: "projects/:projectId/solution/view", Component: ProjectSolutionViewer },
      {
        path: "project/:projectId",
        Component: ProjectWorkspace,
        children: [
          { index: true,                   Component: ProjectSolutionEditor },
          // 原始材料接入与标准化处理 - 文件上传
          { path: "materials/upload",      Component: FileUploadPage },
          // Redirect /materials to /materials/upload (via FileUploadPage)
          { path: "materials",             Component: FileUploadPage },
          // 结构化知识构建 - 问答库 & 术语库
          { path: "structured/qa",         Component: QALibraryPage },
          { path: "structured/terms",      Component: TermsLibraryPage },
          // 非结构化切片构建
          { path: "unstructured",          Component: UnstructuredSliceBuilding },
          // 知识包管理
          { path: "packages",              Component: KnowledgePackageManagement },
          // 构建结果验证
          { path: "verification",          Component: BuildResultVerification },
        ],
      },
      { path: "project/:projectId/package",             Component: KnowledgePackageView },
      { path: "project/:projectId/package/:packageId",  Component: KnowledgePackageView },
    ],
  },

  // ── 客户端 ─────────────────────────────────────────────────────────────────
  {
    path: "/client",
    Component: ClientLayout,
    ErrorBoundary,
    children: [
      { index: true, Component: ClientProjects },
      {
        path: "project/:projectId",
        Component: ClientProjectDetail,
        children: [
          { index: true,              Component: ClientFileUpload },
          { path: "upload",           Component: ClientFileUpload },
          { path: "history",          Component: ClientUploadHistory },
          { path: "package",          Component: ClientKnowledgePackage },
          { path: "package/:packageId", Component: ClientKnowledgePackage },
          { path: "acceptance-history", Component: ClientAcceptanceHistory },
        ],
      },
    ],
  },

  { path: "*", Component: NotFound },
]);
