export interface Industry {
  id: string;
  name: string;
  code: string;
  enabled: boolean;
  createdAt: string;
}

export interface Domain {
  id: string;
  name: string;
  code: string;
  enabled: boolean;
  createdAt: string;
}

export interface Scenario {
  id: string;
  name: string;
  code: string;
  enabled: boolean;
  createdAt: string;
}

export interface Relationship {
  id: string;
  industryId: string;
  domainId: string;
  scenarioId: string;
  enabled: boolean;
  createdAt: string;
  usedByProjects?: boolean; // 是否被项目使用
}

// 知识形态枚举
export enum KnowledgeFormType {
  QA = "问答库",
  GLOSSARY = "术语库",
  UNSTRUCTURED = "非结构化切片",
  TABLE = "二维表",
  TREE = "分类树",
  DECISION = "决策表",
  SOP = "SOP",
  GRAPH = "知识图谱",
}

// 知识类目
export interface KnowledgeCategory {
  id: string;
  name: string;
  parentId: string | null; // 父级类目ID，null表示根类目
  formTypes: KnowledgeFormType[]; // 知识形态（可多选）
  templateId: string; // 归属的模板ID
  order: number; // 排序
  level: number; // 层级（1-5）
}

// 知识构建方案模板
export interface Template {
  id: string;
  name: string;
  description?: string;
  relationshipId?: string; // 关联的场景组合ID(可选)
  enabled: boolean;
  createdAt: string;
  usedByProjects?: boolean; // 是否被项目使用
}

// 项目知识空间
export interface Project {
  id: string;
  name: string;
  description?: string;
  relationshipId: string; // 关联的场景组合ID（必选）
  templateId?: string; // 关联的模板ID（可选）
  enabled: boolean;
  createdAt: string;
  hasContent?: boolean; // 是否已有知识成果（原始材料、知识包等）
  hasSolution?: boolean; // 是否已配置项目方案
}

// 项目方案（M-PRD-4）
export interface ProjectSolution {
  id: string;
  projectId: string; // 所属项目ID
  enabled: boolean; // 启用状态
  status: "draft" | "active"; // 方案状态：草稿/已启用
  createdAt: string;
  updatedAt: string;
}

// 项目方案中的知识类目（M-PRD-4）
export interface ProjectCategory {
  id: string;
  solutionId: string; // 所属项目方案ID
  name: string;
  parentId: string | null; // 父级类目ID，null表示根类目
  formTypes: KnowledgeFormType[]; // 知识形态（可多选）
  order: number; // 排序
  level: number; // 层级（1-5）
  hasContent?: boolean; // 是否已有知识构建结果
}

// 上传状态枚举（C-PRD-1）
export enum UploadStatus {
  UPLOADING = "上传中",
  SUCCESS = "上传成功",
  FAILED = "上传失败",
}

// 原始材料（C-PRD-1）
export interface RawMaterial {
  id: string;
  projectId: string; // 所属项目ID
  fileName: string; // 文件名
  fileSize: number; // 文件大小（字节）
  fileType: string; // 文件类型/扩展名
  uploadTime: string; // 上传时间
  uploader: string; // 上传人（模拟用户）
  sourceType: string; // 来源类型（固定为"客户端上传"）
  status: UploadStatus; // 上传状态
  fileUrl?: string; // 文件URL（模拟）
}

// 验收状态枚举（C-PRD-2）
export enum AcceptanceStatus {
  PENDING = "待验收",
  ACCEPTED = "已验收",
  FEEDBACK = "已反馈",
}

// 反馈类型枚举（C-PRD-2）
export enum FeedbackType {
  CONTENT = "内容问题",
  FORMAT = "格式问题",
  OTHER = "其他",
}

// 知识包（M-PRD-10 / C-PRD-2）
export interface KnowledgePackage {
  id: string;
  projectId: string; // 所属项目ID
  name: string; // 知识包名称
  description?: string; // 描述
  knowledgeObjectTypes: KnowledgeFormType[]; // 包含的知识对象类型
  totalItems: number; // 知识条目总数
  enabled: boolean; // 启用状态
  status: "可用" | "构建中" | "已停用"; // 知识包状态
  createdAt: string; // 创建时间
}

// 验收结果（C-PRD-2）
export interface AcceptanceResult {
  id: string;
  projectId: string; // 所属项目ID
  packageId: string; // 所属知识包ID
  acceptor: string; // 验收人
  acceptanceTime: string; // 验收时间
  status: AcceptanceStatus; // 验收状态
  confirmed: boolean; // 是否确认验收
}

// 反馈记录（C-PRD-2）
export interface FeedbackRecord {
  id: string;
  projectId: string; // 所属项目ID
  packageId: string; // 所属知识包ID
  feedbacker: string; // 反馈人
  feedbackTime: string; // 反馈时间
  content: string; // 反馈内容
  type: FeedbackType; // 反馈类型
}

// 用户角色枚举
export enum UserRole {
  ADMIN = "管理端",
  CLIENT = "客户端",
}

// 用户信息
export interface User {
  id: string;
  username: string;
  role: UserRole;
  displayName: string;
}

// 知识类目（用于知识包详情）
export interface KnowledgeCategoryWithCount {
  id: string;
  name: string;
  count: number;
  children?: KnowledgeCategoryWithCount[];
}

// 知识对象（用于知识包详情）
export interface KnowledgeObject {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  categoryName: string;
  formType: KnowledgeFormType;
  updateTime: string;
  sourceFile: string;
  dataType: string;
  wordCount?: number;
}