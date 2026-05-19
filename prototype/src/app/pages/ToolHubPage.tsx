import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Drawer,
  FormControl,
  InputAdornment,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  Select,
  Switch,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tabs,
  TextField,
  Typography,
  Tooltip,
  LinearProgress,
  FormControlLabel,
  GlobalStyles,
} from "@mui/material";
import {
  Add,
  ArrowDownward,
  ArrowUpward,
  Category,
  CheckCircle,
  Delete,
  Edit,
  FactCheck,
  History,
  Hub,
  MoreHoriz,
  RocketLaunch,
  Search,
  Close,
  ContentCopy,
  WarningAmber,
} from "@mui/icons-material";
import { Fragment, type ReactNode } from "react";
import { toast } from "sonner";

type ToolStatus = "enabled" | "disabled";
type VersionStatus = "wait_debug" | "pending" | "published" | "stopped";
type CategoryEditorMode = "create" | "edit";
interface ToolVersion {
  id: string;
  versionCode?: string;
  version: string;
  status: VersionStatus;
  recommended: boolean;
  lastDebug: string;
  configFields: VersionConfigField[];
  summary: string;
  versionDesc?: string;
  applicableNote?: string;
  supportFileTypes?: string[];
  supportKnowledgeTypes?: string[];
  callLimitNote?: string;
  recommendHint?: boolean;
  callRule?: string;
  inputMaterialTypes?: string[];
  supportSample?: boolean;
  supportBatch?: boolean;
  preconditionNote?: string;
  failureAdvice?: string;
  callConstraintNote?: string;
  params?: ToolParam[];
  externalMappings?: ExternalMappingItem[];
  resultConfig?: ResultConfig;
  operationDisplay?: OperationDisplayConfig;
  progressNodes?: ProgressNodeConfig[];
  debugStatus?: DebugStatus;
  rawResultFields?: RawResultField[];
  deliveryMethod?: DeliveryMethod;
  deliveryName?: string;
  deliveryDesc?: string;
  usageLimit?: string;
  riskNote?: string;
  sampleMaterial?: string;
  maintainer?: string;
  packageFile?: string;
  packageName?: string;
  packageVersion?: string;
  packageDesc?: string;
  deploymentWorkdir?: string;
  deploymentCommand?: string;
  deploymentEnv?: string;
  deploymentTimeout?: string;
  deploymentSuccessRule?: string;
  deploymentSuccessContent?: string;
  entryNote?: string;
  runtimeNote?: string;
  authNote?: string;
  githubRepo?: string;
  repoVisibility?: string;
  versionRefType?: string;
  versionRef?: string;
  ossLicenseNote?: string;
  gitlabRepo?: string;
  gitlabType?: string;
  gitlabVisibility?: string;
  maintainTeam?: string;
  executionAccessMode?: ExecutionAccessMode;
  connectorId?: string;
  connectorName?: string;
  connectorBaseUrlSnapshot?: string;
  connectorAuthType?: string;
  serviceEnvironment?: string;
  httpContentType?: string;
  httpAuthConfig?: string;
  asyncMode?: string;
  callbackPolicy?: CallbackPolicy;
  callbackUrl?: string;
  resultPathStrategy?: ResultPathStrategy;
  asyncTaskIdField?: string;
  progressStatusField?: string;
  resultFileField?: string;
  functionListPath?: string;
  externalServiceRemark?: string;
  isDeployed?: YesNo;
  deployedServerAddress?: string;
  deployedDirectory?: string;
  runtimeMode?: RuntimeMode;
  runtimeWorkdir?: string;
  runtimeCommand?: string;
  runtimeTimeout?: string;
  httpStartCommand?: string;
  httpServiceAddress?: string;
  httpPort?: string;
  httpHealthcheck?: string;
  httpPath?: string;
  httpMethod?: string;
  httpTimeout?: string;
  scriptWorkdir?: string;
  scriptEntryFile?: string;
  scriptEntryFunction?: string;
  scriptTimeout?: string;
  runtimeEnv?: string;
  modelResourceRequired?: YesNo;
  modelDependencies?: ModelDependencyItem[];
  rawInputParams?: RawInputParam[];
  inputSubmissionMode?: InputSubmissionMode;
  inputSubmissionVariable?: string;
  inputSubmissionRule?: string;
  outputReadStrategy?: OutputReadStrategy;
  outputStatusRule?: string;
  outputResultLocation?: string;
  outputErrorSource?: string;
  activePlanRefs?: number;
  inactivePlanRefs?: number;
  linkedPlanRefs?: number;
  lastRunAt?: string;
  runCount?: number;
  failureCount?: number;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
  activePlanUsages?: string[];
}

interface VersionConfigField {
  name: string;
  type: string;
  value: string;
  editable: boolean;
}

type ParamType = "文本" | "数字" | "下拉" | "开关" | "多选" | "标签";
type DebugStatus = "not_started" | "running" | "success" | "failed";
type DeliveryMethod = "local" | "github" | "gitlab";
type RuntimeMode = "command" | "http" | "script";
type ExecutionAccessMode = "toolhub_managed" | "external_http";
type YesNo = "yes" | "no";
type CallbackPolicy = "不启用回调" | "ToolHub 自动生成回调地址" | "使用固定回调地址";
type ResultPathStrategy = "不读取结果文件" | "记录结果文件地址" | "读取结果文件内容";
type RepoVisibility = "Public" | "Internal" | "Private";
type VersionRefType = "Branch" | "Tag" | "Commit";
type ModelResourceSource = "local" | "gitlab" | "deployed";
type ModelDependencyMode = "local_dir" | "remote_service" | "shared_storage";
type RawInputType = "文件" | "文本" | "数字" | "布尔" | "对象" | "数组" | "URL";
type RawInputHandlingMode = "mapped" | "fixed";
type InputSubmissionMode = "逐项命令参数" | "JSON 配置文件" | "标准输入 JSON" | "环境变量" | "HTTP JSON Body" | "HTTP FormData" | "Query 参数" | "函数参数对象" | "位置参数";
type RawResultFieldType = "文本" | "数字" | "布尔" | "对象" | "数组" | "文件" | "错误信息";
type ResultReadMode = "退出码读取" | "标准输出读取" | "标准错误读取" | "返回值读取" | "JSON 文件读取" | "输出文件读取" | "输出目录读取" | "HTTP 响应读取" | "日志关键字读取";
type OutputReadStrategy = "退出码 + 标准输出" | "JSON 文件读取" | "输出文件/目录读取" | "HTTP 响应读取" | "日志/错误流读取";
type ResultRequiredMode = "是" | "否" | "失败时必返";
type VersionOutputMapping = "执行状态" | "结果摘要" | "主要结果内容" | "结构化结果" | "文件或中间产物" | "错误信息" | "耗时信息" | "调用记录标识" | "不映射";
type ToolUiComponent = "不展示" | "单行文本" | "多行文本" | "文件上传" | "开关" | "数字输入" | "单选" | "下拉选择" | "多选" | "标签输入";
type ProgressRuleMatchMode = "status" | "event_code" | "node_key" | "result.code";
type LegacyProgressStatusSource = "工具包主动上报" | "日志关键字识别" | "ToolHub 自动推断";
type RunRecordType = "调试运行" | "Agent调用" | "Flow调用";
type RunRecordEndpoint = "管理端" | "运营端";
type RunResultStatus = "成功" | "失败" | "运行中";

const TOOL_VERSION_CONNECTORS = [
  { id: "conn-rag", name: "RAG 算法服务", baseUrl: "http://rag-server-dev3-admin.maip.test", authType: "Bearer Token", status: "正常" },
  { id: "conn-knowledge", name: "知识工程核心 API", baseUrl: "https://api.knowledge.internal/v1", authType: "Bearer Token", status: "正常" },
  { id: "conn-material", name: "原始素材服务", baseUrl: "https://material.internal/api", authType: "API Key", status: "正常" },
  { id: "conn-check", name: "构建结果校验服务", baseUrl: "https://verify.internal/api", authType: "Basic Auth", status: "异常" },
];

interface ToolParam {
  id: string;
  paramName: string;
  paramDesc: string;
  paramType: ParamType;
  groupName: string;
  defaultValue: string;
  required: boolean;
  editableInOperation: boolean;
  validationRule: string;
  displayCondition: string;
}

interface RawInputParam {
  id: string;
  sourceName: string;
  inputType: RawInputType;
  required: boolean;
  description: string;
  passingMode: string;
  handlingMode: RawInputHandlingMode | "";
  mappedParamName: string;
  mappedParamDescription: string;
  mappedDefaultValue: string;
  editableInOperation: boolean;
  validationRule: string;
  fixedValue: string;
  fixedValueDescription: string;
}

interface RawResultField {
  id: string;
  sourceField: string;
  fieldType: RawResultFieldType;
  readMode: ResultReadMode | "";
  requiredMode: ResultRequiredMode | "";
  description: string;
  outputMapping: VersionOutputMapping | "";
}

interface ModelDependencyItem {
  id: string;
  purpose: string;
  mode: ModelDependencyMode;
  name: string;
  path: string;
  credential: string;
}

interface ResultConfig {
  status: string;
  summary: string;
  content: string;
  structuredResult: string;
  artifacts: string;
  errorMessage: string;
  duration: string;
  versionInfo: string;
  traceId: string;
}

interface OperationDisplayField {
  id: string;
  sourceField: string;
  displayName: string;
  description: string;
  required: boolean;
  editable: boolean;
  order: number;
  groupName: string;
  readonlyFormat: string;
  displayCondition: string;
  uiComponent?: ToolUiComponent;
  optionItems?: ToolUiOption[];
  uiDefaultValue?: string | string[];
}

interface OperationDisplayConfig {
  editableFields: OperationDisplayField[];
  readonlyFields: OperationDisplayField[];
}

interface ToolUiOption {
  id: string;
  label: string;
  value: string;
}

type OperationFieldValue = string | boolean | string[];
type OperationFieldValues = Record<string, OperationFieldValue>;

interface ProgressNodeConfig {
  id: string;
  key: string;
  name: string;
  description: string;
  order: number;
  statuses: ProgressStatusConfig[];
  statusSource?: LegacyProgressStatusSource;
  runningRule?: string;
  successRule?: string;
  failureRule?: string;
  defaultMessage?: string;
  failureMessage?: string;
}

interface ProgressStatusConfig {
  id: string;
  key: string;
  name: string;
  matchMode: ProgressRuleMatchMode;
  rule: string;
  message: string;
  statusSource?: LegacyProgressStatusSource;
}

interface ExternalMappingItem {
  id: string;
  toolParam: string;
  externalParam: string;
  mappingNote: string;
  defaultHandler: string;
}

interface ToolItem {
  id: string;
  toolCode: string;
  name: string;
  category: string;
  sourceType: string;
  owner: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  status: ToolStatus;
  description: string;
  capabilitySummary: string;
  detailedDescription: string;
  latestVersion: string;
  lastCalledAt: string;
  callCount24h: number;
  failureCount24h: number;
  deleted?: boolean;
  deletedAt?: string;
  versions: ToolVersion[];
}

interface ToolRunRecord {
  id: string;
  type: RunRecordType;
  trigger: string;
  endpoint: RunRecordEndpoint;
  projectSpace?: string;
  version: string;
  result: RunResultStatus;
  startedAt?: string;
  finishedAt?: string;
  packageInfo?: string;
  config: string;
  input: string;
  output: string;
  flowTrace?: string;
  executedAt: string;
}

const BLUE = "#3b82f6";
const SECONDARY_DRAWER_Z_INDEX = 1600;
const TOOL_STORAGE_KEY = "toolHub_tools_v10";
const CATEGORY_STORAGE_KEY = "toolHub_categories_v2";
const CATEGORY_SELECTION_STORAGE_KEY = "toolHub_selected_category_v1";
const TOOL_CODE_PATTERN = /^[a-z][a-z0-9_]*$/;
const dialogGlobalStyles = (
  <GlobalStyles
    styles={{
      "body .MuiDialogTitle-root + .MuiDialogContent-root": {
        paddingTop: "24px",
      },
    }}
  />
);

const TOOL_STATUS: Record<ToolStatus, { label: string; bg: string; color: string }> = {
  enabled: { label: "启用", bg: "#dcfce7", color: "#166534" },
  disabled: { label: "停用", bg: "#f3f4f6", color: "#4b5563" },
};

const VERSION_STATUS: Record<VersionStatus, { label: string; bg: string; color: string }> = {
  wait_debug: { label: "待调试", bg: "#e0f2fe", color: "#0369a1" },
  pending: { label: "待发布", bg: "#fff7ed", color: "#c2410c" },
  published: { label: "已发布", bg: "#dcfce7", color: "#166534" },
  stopped: { label: "已停用", bg: "#f3f4f6", color: "#6b7280" },
};

const DELETABLE_VERSION_STATUSES: VersionStatus[] = ["wait_debug", "pending", "stopped"];

const INITIAL_CATEGORIES = ["文档解析", "内容处理", "智能生成", "质量评估"];

const FIELD_COMPONENTS: VersionConfigField[] = [
  { name: "OCR 模型", type: "下拉单选", value: "qwen3.5-plus", editable: true },
  { name: "文档内容提取", type: "开关", value: "开启", editable: true },
  { name: "表格深度解析", type: "开关", value: "开启", editable: true },
  { name: "提取文档图片", type: "开关", value: "关闭", editable: false },
];

function buildDefaultVersionConfig(toolName: string): VersionConfigField[] {
  if (toolName.includes("切片")) {
    return [
      { name: "切片长度", type: "数字输入", value: "800", editable: true },
      { name: "Overlap", type: "数字输入", value: "120", editable: true },
      { name: "按标题层级切片", type: "开关", value: "开启", editable: true },
      { name: "最小段落长度", type: "数字输入", value: "120", editable: false },
    ];
  }

  if (toolName.includes("问答")) {
    return [
      { name: "问答对数量上限", type: "数字输入", value: "30", editable: true },
      { name: "答案完整性阈值", type: "数字输入", value: "0.8", editable: true },
      { name: "协作词", type: "标签组", value: "理财, 额度, 账单", editable: true },
      { name: "重复问答过滤", type: "开关", value: "开启", editable: false },
    ];
  }

  return FIELD_COMPONENTS.map((field) => ({ ...field }));
}

function buildVersionSummary(fields: VersionConfigField[]) {
  return fields.slice(0, 3).map((field) => `${field.name}=${field.value}`).join("；");
}

const FILE_TYPE_OPTIONS = ["PDF", "Word", "Excel", "TXT", "图片"];
const KNOWLEDGE_TYPE_OPTIONS = ["QA", "文本切片", "术语库", "二维表"];
const INPUT_TYPE_OPTIONS = ["文件", "文本", "结构化参数"];
const PARAM_TYPE_OPTIONS: ParamType[] = ["文本", "数字", "下拉", "开关", "多选", "标签"];
const RAW_INPUT_TYPE_OPTIONS: RawInputType[] = ["文本", "数字", "布尔", "数组", "对象", "文件", "URL"];
const RAW_INPUT_HANDLING_OPTIONS: Array<{ key: RawInputHandlingMode; label: string }> = [
  { key: "mapped", label: "标准参数" },
  { key: "fixed", label: "固定值" },
];
const RAW_RESULT_FIELD_TYPE_OPTIONS: RawResultFieldType[] = ["文本", "数字", "布尔", "对象", "数组", "文件", "错误信息"];
const RESULT_READ_MODE_OPTIONS: ResultReadMode[] = ["退出码读取", "标准输出读取", "标准错误读取", "返回值读取", "JSON 文件读取", "输出文件读取", "输出目录读取", "HTTP 响应读取", "日志关键字读取"];
const OUTPUT_READ_STRATEGY_OPTIONS: OutputReadStrategy[] = ["退出码 + 标准输出", "JSON 文件读取", "输出文件/目录读取", "HTTP 响应读取", "日志/错误流读取"];
const RESULT_REQUIRED_MODE_OPTIONS: ResultRequiredMode[] = ["是", "否", "失败时必返"];
const VERSION_OUTPUT_MAPPING_OPTIONS: VersionOutputMapping[] = ["执行状态", "结果摘要", "主要结果内容", "结构化结果", "文件或中间产物", "错误信息", "耗时信息", "调用记录标识", "不映射"];
const TOOL_UI_COMPONENT_OPTIONS: ToolUiComponent[] = ["不展示", "单行文本", "多行文本", "文件上传", "开关", "数字输入", "单选", "多选", "标签输入"];
const SELECTABLE_UI_COMPONENTS: ToolUiComponent[] = ["单选", "下拉选择", "多选"];
const DELIVERY_METHOD_OPTIONS: Array<{ key: DeliveryMethod; label: string }> = [
  { key: "local", label: "本地上传文件包" },
  { key: "gitlab", label: "GitLab 仓库" },
];
const CONTENT_TYPE_OPTIONS = ["application/json", "multipart/form-data", "application/x-www-form-urlencoded", "text/plain"];
const RUNTIME_MODE_OPTIONS: Array<{ key: RuntimeMode; label: string }> = [
  { key: "command", label: "命令行运行" },
  { key: "http", label: "HTTP 服务运行" },
  { key: "script", label: "函数入口运行" },
];
const EXECUTION_ACCESS_OPTIONS: Array<{ key: ExecutionAccessMode; label: string; desc: string }> = [
  { key: "external_http", label: "连接器调用", desc: "通过已配置连接器调用外部 API，并由 ToolHub 统一转换为 MCP 工具。" },
];
const REPO_VISIBILITY_OPTIONS: RepoVisibility[] = ["Public", "Internal", "Private"];
const VERSION_REF_TYPE_OPTIONS: VersionRefType[] = ["Branch", "Tag", "Commit"];
const MODEL_RESOURCE_SOURCE_OPTIONS: Array<{ key: ModelResourceSource; label: string }> = [
  { key: "local", label: "本地上传" },
  { key: "gitlab", label: "GitLab 仓库" },
  { key: "deployed", label: "已部署模型目录" },
];
const PROGRESS_RULE_MATCH_MODE_OPTIONS: ProgressRuleMatchMode[] = ["status", "event_code", "node_key", "result.code"];
const SYSTEM_EVENT_OPTIONS = [
  "任务创建",
  "入参标准化完成",
  "入参标准化失败",
  "工具包开始执行",
  "工具包执行完成",
  "工具包执行失败",
  "工具包执行超时",
  "返回结果标准化完成",
  "返回结果标准化失败",
  "任务完成",
  "任务失败",
];
const DEFAULT_PROGRESS_STATUS_DEFS = [
  { key: "running", name: "处理中", ruleSuffix: "start", message: "正在处理当前节点" },
  { key: "success", name: "成功", ruleSuffix: "done", message: "当前节点处理完成" },
  { key: "failed", name: "失败", ruleSuffix: "failed", message: "当前节点处理失败，请查看日志" },
];

function getRawInputPassingModeOptions(runtimeMode: RuntimeMode): string[] {
  switch (runtimeMode) {
    case "http":
      return ["JSON", "文件上传", "表单"];
    case "script":
      return ["函数参数", "配置对象"];
    case "command":
    default:
      return ["命令参数", "文件路径", "标准输入"];
  }
}

function getInputSubmissionModeOptions(runtimeMode: RuntimeMode): InputSubmissionMode[] {
  switch (runtimeMode) {
    case "http":
      return ["HTTP JSON Body", "HTTP FormData", "Query 参数"];
    case "script":
      return ["函数参数对象", "位置参数", "JSON 配置文件"];
    case "command":
    default:
      return ["JSON 配置文件", "逐项命令参数", "标准输入 JSON", "环境变量"];
  }
}

function getDefaultInputSubmission(runtimeMode: RuntimeMode): { mode: InputSubmissionMode; variable: string; rule: string } {
  if (runtimeMode === "http") {
    return { mode: "HTTP JSON Body", variable: "request_body", rule: "默认按标准参数名组装 JSON Body；文件类参数传文件 URL 或文件标识。" };
  }
  if (runtimeMode === "script") {
    return { mode: "函数参数对象", variable: "params", rule: "默认按标准参数名组装函数参数对象，作为入口函数的第一个参数。" };
  }
  return { mode: "JSON 配置文件", variable: "input_json", rule: "默认按标准参数名组装 JSON 文件，命令中通过 {{input_json}} 传入文件路径。" };
}

function getDefaultOutputRead(runtimeMode: RuntimeMode): { strategy: OutputReadStrategy; statusRule: string; resultLocation: string; errorSource: string } {
  if (runtimeMode === "http") {
    return { strategy: "HTTP 响应读取", statusRule: "HTTP 2xx 且 response.status != 'failed' 为成功", resultLocation: "response.body", errorSource: "response.error_message" };
  }
  return { strategy: "退出码 + 标准输出", statusRule: "exit_code = 0 为成功；exit_code != 0 为失败", resultLocation: "{{output_dir}} 或 stdout", errorSource: "stderr" };
}

function getExternalHttpDefaultInputSubmission() {
  return {
    mode: "HTTP JSON Body" as InputSubmissionMode,
    variable: "request_body",
    rule: "按标准入参组装 HTTP JSON Body；系统字段、回调地址等可通过请求映射规则注入。",
  };
}

function getExternalHttpDefaultOutputRead() {
  return {
    strategy: "HTTP 响应读取" as OutputReadStrategy,
    statusRule: "按响应状态字段或业务状态码判断成功；例如 $.status == \"success\" 或 $.code == 0。",
    resultLocation: "$.result / $.data",
    errorSource: "$.message / $.msg / $.error",
  };
}

function normalizeCallbackPolicy(policy?: string): CallbackPolicy {
  if (policy === "ToolHub 自动生成 callback_url") return "ToolHub 自动生成回调地址";
  if (policy === "使用固定 callback_url") return "使用固定回调地址";
  if (policy === "不启用回调" || policy === "使用固定回调地址") return policy;
  return "ToolHub 自动生成回调地址";
}

function normalizeResultPathStrategy(strategy?: string): ResultPathStrategy {
  if (strategy === "记录 result_path") return "记录结果文件地址";
  if (strategy === "读取 result_path 内容并标准化" || strategy === "读取结果文件内容并标准化") return "读取结果文件内容";
  if (strategy === "不读取结果文件" || strategy === "读取结果文件内容") return strategy;
  return "记录结果文件地址";
}

function normalizeToolUiComponent(component?: ToolUiComponent): ToolUiComponent | undefined {
  return component === "下拉选择" ? "单选" : component;
}

function inferToolUiComponent(param: ToolParam): ToolUiComponent {
  switch (param.paramType) {
    case "开关":
      return "开关";
    case "数字":
      return "数字输入";
    case "下拉":
      return "单选";
    case "多选":
      return "多选";
    case "标签":
      return "标签输入";
    case "文本":
    default:
      return param.paramName.includes("文件") ? "文件上传" : "单行文本";
  }
}

function createDefaultUiOptions(field: OperationDisplayField): ToolUiOption[] {
  const baseName = field.sourceField || field.displayName || "param";
  return [
    { id: `${field.id}-opt-1`, label: "选项一", value: `${baseName}_option_1` },
    { id: `${field.id}-opt-2`, label: "选项二", value: `${baseName}_option_2` },
  ];
}

function getUiOptions(field: OperationDisplayField): ToolUiOption[] {
  return field.optionItems && field.optionItems.length > 0 ? field.optionItems : createDefaultUiOptions(field);
}

function suggestNextVersion(tool: ToolItem | null) {
  const fallback = "1.0";
  if (!tool || tool.versions.length === 0) return fallback;

  const source = tool.latestVersion && tool.latestVersion !== "-" ? tool.latestVersion : tool.versions[0]?.version;
  const matches = source?.match(/\d+/g);
  if (!matches || matches.length === 0) return fallback;

  const major = Number(matches[0] ?? 1);
  const minor = Number(matches[1] ?? 0);
  if (Number.isNaN(major) || Number.isNaN(minor)) return fallback;
  return `${major}.${minor + 1}`;
}

function createDefaultParams(toolName: string): ToolParam[] {
  if (toolName.includes("切片")) {
    return [
      { id: "p-1", paramName: "切片长度", paramDesc: "单个切片的目标长度", paramType: "数字", groupName: "切片参数", defaultValue: "800", required: true, editableInOperation: true, validationRule: "100-2000", displayCondition: "" },
      { id: "p-2", paramName: "Overlap", paramDesc: "相邻切片重叠长度", paramType: "数字", groupName: "切片参数", defaultValue: "120", required: true, editableInOperation: true, validationRule: "0-500", displayCondition: "" },
      { id: "p-3", paramName: "按标题层级切片", paramDesc: "是否优先按标题层级切片", paramType: "开关", groupName: "切片参数", defaultValue: "开启", required: false, editableInOperation: true, validationRule: "", displayCondition: "" },
    ];
  }

  if (toolName.includes("问答")) {
    return [
      { id: "p-1", paramName: "问答对数量上限", paramDesc: "单文档最大抽取问答数", paramType: "数字", groupName: "抽取参数", defaultValue: "30", required: true, editableInOperation: true, validationRule: "1-100", displayCondition: "" },
      { id: "p-2", paramName: "答案完整性阈值", paramDesc: "低于该阈值的问题不纳入结果", paramType: "数字", groupName: "抽取参数", defaultValue: "0.8", required: true, editableInOperation: true, validationRule: "0-1", displayCondition: "" },
      { id: "p-3", paramName: "协作词", paramDesc: "辅助识别的业务关键词", paramType: "标签", groupName: "抽取参数", defaultValue: "理财,额度,账单", required: false, editableInOperation: true, validationRule: "最多10个", displayCondition: "" },
    ];
  }

  return [
    { id: "p-1", paramName: "OCR 模型", paramDesc: "用于识别的模型版本", paramType: "下拉", groupName: "模型参数", defaultValue: "qwen3.5-plus", required: true, editableInOperation: true, validationRule: "必须选择1项", displayCondition: "" },
    { id: "p-2", paramName: "文档内容提取", paramDesc: "是否提取正文内容", paramType: "开关", groupName: "解析参数", defaultValue: "开启", required: false, editableInOperation: true, validationRule: "", displayCondition: "" },
    { id: "p-3", paramName: "表格深度解析", paramDesc: "是否做表格结构化识别", paramType: "开关", groupName: "解析参数", defaultValue: "开启", required: false, editableInOperation: true, validationRule: "", displayCondition: "文档内容提取=开启" },
  ];
}

function createDefaultRawInputs(toolName = ""): RawInputParam[] {
  if (toolName.includes("切片") || toolName.includes("拆分")) {
    return [
      {
        id: "raw-content",
        sourceName: "content",
        inputType: "文本",
        required: true,
        description: "待切分的标准化文本内容",
        passingMode: "HTTP JSON Body",
        handlingMode: "mapped",
        mappedParamName: "content",
        mappedParamDescription: "",
        mappedDefaultValue: "",
        editableInOperation: true,
        validationRule: "",
        fixedValue: "",
        fixedValueDescription: "",
      },
      {
        id: "raw-chunk-size",
        sourceName: "chunk_size",
        inputType: "数字",
        required: false,
        description: "单个切片的目标长度",
        passingMode: "HTTP JSON Body",
        handlingMode: "mapped",
        mappedParamName: "chunk_size",
        mappedParamDescription: "",
        mappedDefaultValue: "800",
        editableInOperation: true,
        validationRule: "",
        fixedValue: "",
        fixedValueDescription: "",
      },
      {
        id: "raw-overlap",
        sourceName: "overlap",
        inputType: "数字",
        required: false,
        description: "相邻切片的重叠长度",
        passingMode: "HTTP JSON Body",
        handlingMode: "mapped",
        mappedParamName: "overlap",
        mappedParamDescription: "",
        mappedDefaultValue: "120",
        editableInOperation: true,
        validationRule: "",
        fixedValue: "",
        fixedValueDescription: "",
      },
    ];
  }

  if (toolName.includes("问答")) {
    return [
      {
        id: "raw-content",
        sourceName: "content",
        inputType: "文本",
        required: true,
        description: "待抽取问答的文本内容",
        passingMode: "HTTP JSON Body",
        handlingMode: "mapped",
        mappedParamName: "content",
        mappedParamDescription: "",
        mappedDefaultValue: "",
        editableInOperation: true,
        validationRule: "",
        fixedValue: "",
        fixedValueDescription: "",
      },
      {
        id: "raw-max-pairs",
        sourceName: "max_pairs",
        inputType: "数字",
        required: false,
        description: "最大问答对数量",
        passingMode: "HTTP JSON Body",
        handlingMode: "mapped",
        mappedParamName: "max_pairs",
        mappedParamDescription: "",
        mappedDefaultValue: "30",
        editableInOperation: true,
        validationRule: "",
        fixedValue: "",
        fixedValueDescription: "",
      },
      {
        id: "raw-keywords",
        sourceName: "keywords",
        inputType: "数组",
        required: false,
        description: "辅助抽取的业务关键词",
        passingMode: "HTTP JSON Body",
        handlingMode: "mapped",
        mappedParamName: "keywords",
        mappedParamDescription: "",
        mappedDefaultValue: "[\"理财\", \"额度\", \"账单\"]",
        editableInOperation: true,
        validationRule: "",
        fixedValue: "",
        fixedValueDescription: "",
      },
    ];
  }

  return [
    {
      id: "raw-1",
      sourceName: "file_url",
      inputType: "文件",
      required: true,
      description: "待处理文件地址",
      passingMode: "HTTP JSON Body",
      handlingMode: "mapped",
      mappedParamName: "file_url",
      mappedParamDescription: "",
      mappedDefaultValue: "",
      editableInOperation: true,
      validationRule: "",
      fixedValue: "",
      fixedValueDescription: "",
    },
    {
      id: "raw-2",
      sourceName: "language",
      inputType: "文本",
      required: false,
      description: "识别语言",
      passingMode: "HTTP JSON Body",
      handlingMode: "mapped",
      mappedParamName: "language",
      mappedParamDescription: "",
      mappedDefaultValue: "zh",
      editableInOperation: true,
      validationRule: "",
      fixedValue: "",
      fixedValueDescription: "",
    },
    {
      id: "raw-3",
      sourceName: "enable_table",
      inputType: "布尔",
      required: false,
      description: "是否提取表格",
      passingMode: "HTTP JSON Body",
      handlingMode: "mapped",
      mappedParamName: "enable_table",
      mappedParamDescription: "",
      mappedDefaultValue: "true",
      editableInOperation: true,
      validationRule: "",
      fixedValue: "",
      fixedValueDescription: "",
    },
    {
      id: "raw-4",
      sourceName: "retry_count",
      inputType: "数字",
      required: false,
      description: "重试次数",
      passingMode: "HTTP JSON Body",
      handlingMode: "fixed",
      mappedParamName: "",
      mappedParamDescription: "",
      mappedDefaultValue: "",
      editableInOperation: false,
      validationRule: "",
      fixedValue: "3",
      fixedValueDescription: "",
    },
    {
      id: "raw-5",
      sourceName: "mode",
      inputType: "文本",
      required: false,
      description: "运行模式",
      passingMode: "HTTP JSON Body",
      handlingMode: "fixed",
      mappedParamName: "",
      mappedParamDescription: "",
      mappedDefaultValue: "",
      editableInOperation: false,
      validationRule: "",
      fixedValue: "standard",
      fixedValueDescription: "",
    },
  ];
}

function createDefaultModelDependency(index = 1): ModelDependencyItem {
  return {
    id: `model-${Date.now()}-${index}`,
    purpose: "",
    mode: "local_dir",
    name: "",
    path: "",
    credential: "",
  };
}

function mapRawInputTypeToParamType(inputType: RawInputType): ParamType {
  switch (inputType) {
    case "文件":
    case "文本":
    case "URL":
      return "文本";
    case "数字":
      return "数字";
    case "布尔":
      return "开关";
    case "对象":
      return "标签";
    case "数组":
      return "多选";
    default:
      return "文本";
  }
}

function createDefaultRawResultFields(): RawResultField[] {
  return [
    {
      id: "result-raw-text",
      sourceField: "raw_text",
      fieldType: "文本",
      readMode: "标准输出读取",
      requiredMode: "是",
      description: "解析出的正文内容",
      outputMapping: "主要结果内容",
    },
    {
      id: "result-tables",
      sourceField: "tables",
      fieldType: "数组",
      readMode: "返回值读取",
      requiredMode: "否",
      description: "识别出的表格数据",
      outputMapping: "结构化结果",
    },
    {
      id: "result-output-file",
      sourceField: "output_file",
      fieldType: "文件",
      readMode: "输出文件读取",
      requiredMode: "否",
      description: "工具处理后生成的结果文件",
      outputMapping: "文件或中间产物",
    },
    {
      id: "result-duration",
      sourceField: "duration",
      fieldType: "数字",
      readMode: "返回值读取",
      requiredMode: "否",
      description: "本次处理耗时，单位秒",
      outputMapping: "耗时信息",
    },
    {
      id: "result-error-msg",
      sourceField: "error_msg",
      fieldType: "错误信息",
      readMode: "日志关键字读取",
      requiredMode: "失败时必返",
      description: "工具执行失败时返回的错误信息",
      outputMapping: "错误信息",
    },
  ];
}

function buildResultConfigFromRawResults(fields: RawResultField[], toolName: string, version: string): ResultConfig {
  const findValue = (mapping: VersionOutputMapping, fallback: string) => {
    const field = fields.find((item) => item.outputMapping === mapping);
    return field ? `${field.sourceField}：${field.description}` : fallback;
  };

  return {
    status: findValue("执行状态", "已完成 / 已失败"),
    summary: findValue("结果摘要", toolName.includes("问答") ? "抽取问答草稿并给出校验结果" : "返回处理摘要，供 Agent 和运营端理解结果"),
    content: findValue("主要结果内容", "主要结果内容示例"),
    structuredResult: findValue("结构化结果", toolName.includes("切片") ? "切片列表、段落元数据" : "结构化结果对象"),
    artifacts: findValue("文件或中间产物", "结果文件、切片文件或中间产物链接"),
    errorMessage: findValue("错误信息", "失败原因与处理建议"),
    duration: findValue("耗时信息", "执行耗时（ms）"),
    versionInfo: `${toolName} / ${version || "未命名版本"}`,
    traceId: findValue("调用记录标识", `trace-${Date.now().toString().slice(-6)}`),
  };
}

function buildVersionParamsFromRawInputs(rawInputs: RawInputParam[]): ToolParam[] {
  return rawInputs
    .filter((item) => item.handlingMode === "mapped")
    .map((item, index) => ({
      id: `p-raw-${index + 1}`,
      paramName: item.mappedParamName.trim(),
      paramDesc: item.mappedParamDescription.trim() || item.description.trim(),
      paramType: mapRawInputTypeToParamType(item.inputType),
      groupName: "接口参数",
      defaultValue: item.mappedDefaultValue.trim(),
      required: item.required,
      editableInOperation: true,
      validationRule: "",
      displayCondition: "",
    }));
}

function createDefaultExternalMappings(params: ToolParam[]): ExternalMappingItem[] {
  return params.slice(0, 2).map((param, index) => ({
    id: `m-${index + 1}`,
    toolParam: param.paramName,
    externalParam: `external_${index + 1}`,
    mappingNote: "按默认规则映射",
    defaultHandler: "缺省时使用默认值",
  }));
}

function createDefaultResultConfig(toolName: string, version: string): ResultConfig {
  return {
    status: "已完成 / 已失败",
    summary: toolName.includes("问答") ? "抽取问答草稿并给出校验结果" : "返回处理摘要，供 Agent 和运营端理解结果",
    content: "主要结果内容示例",
    structuredResult: toolName.includes("切片") ? "切片列表、段落元数据" : "结构化结果对象",
    artifacts: "结果文件、切片文件或中间产物链接",
    errorMessage: "失败原因与处理建议",
    duration: "执行耗时（ms）",
    versionInfo: `${toolName} / ${version || "未命名版本"}`,
    traceId: `trace-${Date.now().toString().slice(-6)}`,
  };
}

function createDefaultOperationDisplay(params: ToolParam[], resultConfig: ResultConfig, rawResultFields: RawResultField[] = [], previousConfig?: OperationDisplayConfig): OperationDisplayConfig {
  const previousEditableFields = new Map((previousConfig?.editableFields ?? []).map((field) => [field.sourceField, field]));
  const editableFields = params
    .map((param, index) => {
      const previousField = previousEditableFields.get(param.paramName);
      return {
        id: previousField?.id ?? `op-e-${index + 1}`,
        sourceField: param.paramName,
        displayName: previousField?.displayName ?? param.paramName,
        description: param.paramDesc,
        required: param.required,
        editable: param.editableInOperation,
        order: previousField?.order ?? index + 1,
        groupName: param.groupName || "接口参数",
        readonlyFormat: `${param.paramName}：{{value}}`,
        displayCondition: param.displayCondition,
        uiComponent: normalizeToolUiComponent(previousField?.uiComponent) ?? inferToolUiComponent(param),
      };
    })
    .sort((left, right) => left.order - right.order)
    .map((field, index) => ({ ...field, order: index + 1 }));

  const mappedReadonlyFields = rawResultFields
    .filter((field) => field.outputMapping && field.outputMapping !== "不映射")
    .map((field, index) => ({
      id: `op-r-${field.id}`,
      sourceField: field.sourceField,
      displayName: field.outputMapping,
      description: field.description,
      required: field.requiredMode === "是",
      editable: false,
      order: editableFields.length + index + 1,
      groupName: "结果信息",
      readonlyFormat: `${field.outputMapping}：{{${field.sourceField}}}`,
      displayCondition: "",
    }));

  const readonlyFields = mappedReadonlyFields.length > 0
    ? mappedReadonlyFields
    : [
        ...editableFields.slice(0, 2),
        {
          id: "op-r-summary",
          sourceField: "结果摘要",
          displayName: "结果摘要",
          description: "展示本次工具执行结果摘要",
          required: false,
          editable: false,
          order: editableFields.length + 1,
          groupName: "结果信息",
          readonlyFormat: resultConfig.summary,
          displayCondition: "",
        },
      ];

  return { editableFields, readonlyFields };
}

function createDefaultProgressStatuses(nodeName: string, nodeKey: string): ProgressStatusConfig[] {
  return DEFAULT_PROGRESS_STATUS_DEFS.map((status) => ({
    id: `${nodeKey}-${status.key}`,
    key: status.key,
    name: status.name,
    matchMode: "status",
    rule: status.key,
    message: status.message,
  }));
}

function inferProgressMatchMode(statusSource?: LegacyProgressStatusSource): ProgressRuleMatchMode {
  return statusSource ? "status" : "status";
}

function normalizeProgressMatchField(matchMode?: string): ProgressRuleMatchMode {
  return PROGRESS_RULE_MATCH_MODE_OPTIONS.includes(matchMode as ProgressRuleMatchMode)
    ? matchMode as ProgressRuleMatchMode
    : "status";
}

function normalizeSystemEventRule(rule: string, statusKey?: string): string {
  if (SYSTEM_EVENT_OPTIONS.includes(rule)) return rule;
  if (rule === "运行记录创建后进入处理中") return "任务创建";
  if (rule === "输入材料校验通过") return "入参标准化完成";
  if (rule.includes("超时")) return "工具包执行超时";
  if (rule.includes("失败") || statusKey === "failed") return "任务失败";
  if (rule.includes("完成") || rule.includes("成功") || statusKey === "success") return "任务完成";
  if (rule.includes("开始") || rule.includes("处理中") || statusKey === "running") return "工具包开始执行";
  return "任务创建";
}

function getProgressStatusMatchMode(status: Partial<ProgressStatusConfig>): ProgressRuleMatchMode {
  return normalizeProgressMatchField(status.matchMode ?? inferProgressMatchMode(status.statusSource));
}

function getProgressStatusRule(status: Partial<ProgressStatusConfig>): string {
  return status.rule ?? "";
}

function normalizeProgressStatus(status: Partial<ProgressStatusConfig>, fallback: ProgressStatusConfig): ProgressStatusConfig {
  const matchMode = getProgressStatusMatchMode(status);
  const legacyMatchMode = status.matchMode && !PROGRESS_RULE_MATCH_MODE_OPTIONS.includes(status.matchMode as ProgressRuleMatchMode);
  const rule = legacyMatchMode ? status.key ?? fallback.key : status.rule ?? fallback.rule;
  return {
    ...fallback,
    ...status,
    matchMode,
    rule,
    message: status.message ?? fallback.message,
  };
}

function normalizeProgressNode(node: Partial<ProgressNodeConfig>, index: number): ProgressNodeConfig {
  const nodeName = node.name || `处理节点 ${index + 1}`;
  const nodeKey = node.key || `node_${index + 1}`;
  const legacyStatuses: ProgressStatusConfig[] = [
    node.runningRule ? {
      id: `${node.id ?? nodeKey}-running`,
      key: "running",
      name: "处理中",
      matchMode: inferProgressMatchMode(node.statusSource),
      rule: "running",
      message: node.defaultMessage ?? "正在处理当前节点",
    } : null,
    node.successRule ? {
      id: `${node.id ?? nodeKey}-success`,
      key: "success",
      name: "成功",
      matchMode: inferProgressMatchMode(node.statusSource),
      rule: "success",
      message: node.defaultMessage ?? "当前节点处理完成",
    } : null,
    node.failureRule ? {
      id: `${node.id ?? nodeKey}-failed`,
      key: "failed",
      name: "失败",
      matchMode: inferProgressMatchMode(node.statusSource),
      rule: "failed",
      message: node.failureMessage ?? "当前节点处理失败，请查看日志",
    } : null,
  ].filter(Boolean) as ProgressStatusConfig[];
  const defaultStatuses = createDefaultProgressStatuses(nodeName, nodeKey);
  const statuses = node.statuses && node.statuses.length > 0
    ? node.statuses.map((status, statusIndex) => normalizeProgressStatus(status, defaultStatuses[statusIndex] ?? defaultStatuses[0]))
    : (legacyStatuses.length > 0 ? legacyStatuses : defaultStatuses);

  return {
    id: node.id || `progress-${index + 1}`,
    key: nodeKey,
    name: nodeName,
    description: node.description ?? "",
    order: index + 1,
    statuses,
  };
}

function createDefaultProgressNodes(toolName: string): ProgressNodeConfig[] {
  const nodeNames = toolName.includes("切片")
    ? ["原始文件接入", "内容清洗 / 标准化", "文本切片", "切片结果生成"]
    : toolName.includes("问答")
      ? ["原始内容接入", "候选问答抽取", "问答质量校验", "问答结果生成"]
      : ["原始文件接入", "表格解析 / OCR 识别", "内容清洗 / 标准化", "结果生成"];

  return nodeNames.map((name, index) => {
    const key = name
      .replace(/\s+/g, "")
      .replace(/[\/（）()]/g, "_")
      .replace(/_+/g, "_")
      .toLowerCase();
	    return {
	      id: `progress-${index + 1}`,
	      key: key || `node_${index + 1}`,
	      name,
	      description: index === 0 ? "读取并校验输入材料" : index === nodeNames.length - 1 ? "生成标准化处理结果" : "执行工具内部处理步骤",
		      order: index + 1,
		      statuses: createDefaultProgressStatuses(name, key || `node_${index + 1}`),
		    };
  });
}

function createInitialProgressNodes(): ProgressNodeConfig[] {
  const nodeKey = "node_1";
  return [{
    id: `progress-${Date.now()}`,
    key: nodeKey,
    name: "",
    description: "",
    order: 1,
    statuses: createDefaultProgressStatuses("", nodeKey),
  }];
}

function normalizeVersion(version: ToolVersion, toolName: string, toolCode?: string): ToolVersion {
  const rawInputParams = version.rawInputParams ?? createDefaultRawInputs(toolName);
  const params = version.params && version.params.length > 0 ? version.params : buildVersionParamsFromRawInputs(rawInputParams);
  const configFields = version.configFields && version.configFields.length > 0
    ? version.configFields
    : params.map((param) => ({ name: param.paramName, type: param.paramType, value: param.defaultValue, editable: param.editableInOperation }));
  const summary = version.summary || buildVersionSummary(configFields);
  const rawResultFields = version.rawResultFields ?? createDefaultRawResultFields();
  const resultConfig = version.resultConfig ?? buildResultConfigFromRawResults(rawResultFields, toolName, version.version);
  const operationDisplay = createDefaultOperationDisplay(params, resultConfig, rawResultFields, version.operationDisplay);
  const progressNodes = (version.progressNodes && version.progressNodes.length > 0 ? version.progressNodes : createDefaultProgressNodes(toolName)).map((node, index) => normalizeProgressNode(node, index));
  const fallbackFailureCount = version.status === "stopped" ? 3 : 0;
  const failureCount = version.failureCount ?? fallbackFailureCount;
  const fallbackRunCount = version.status === "published" ? 186 : version.status === "stopped" ? 24 : failureCount;
  const runCount = Math.max(version.runCount ?? fallbackRunCount, failureCount);

  return {
    ...version,
    versionCode: version.versionCode ?? buildVersionCode(toolCode || buildToolCodeSeed(toolName), version.version),
    configFields,
    summary,
    versionDesc: version.versionDesc ?? `${version.version} 版本配置说明`,
    applicableNote: version.applicableNote ?? "适用于当前工具默认场景",
    supportFileTypes: version.supportFileTypes ?? ["PDF", "Word"],
    supportKnowledgeTypes: version.supportKnowledgeTypes ?? ["QA", "文本切片"],
    callLimitNote: version.callLimitNote ?? "默认单文件 20MB 内，建议在 2 分钟内完成",
    recommendHint: version.recommendHint ?? version.recommended,
    callRule: version.callRule ?? "由 Agent 或业务系统按接口参数配置发起调用",
    inputMaterialTypes: version.inputMaterialTypes ?? ["文件"],
    supportSample: version.supportSample ?? true,
    supportBatch: version.supportBatch ?? false,
    preconditionNote: version.preconditionNote ?? "",
    failureAdvice: version.failureAdvice ?? "建议调整参数后重试，必要时切换其他工具",
    callConstraintNote: version.callConstraintNote ?? "受文件大小、页数和模型耗时影响",
    params,
    externalMappings: version.externalMappings ?? createDefaultExternalMappings(params),
    resultConfig,
    rawResultFields,
    operationDisplay,
    progressNodes,
    debugStatus: version.debugStatus ?? (version.status === "pending" || version.status === "published" ? "success" : "not_started"),
    deliveryMethod: version.deliveryMethod ?? "local",
    deliveryName: version.deliveryName ?? `${toolName} 交付包`,
    deliveryDesc: version.deliveryDesc ?? "用于描述当前工具版本的外部交付方式和使用边界。",
    usageLimit: version.usageLimit ?? "",
    riskNote: version.riskNote ?? "",
    sampleMaterial: version.sampleMaterial ?? "",
    maintainer: version.maintainer ?? "工具维护人",
    packageFile: version.packageFile ?? "tool-package.zip",
    packageName: version.packageName ?? `${toolName}-package`,
    packageVersion: version.packageVersion ?? version.version,
    packageDesc: version.packageDesc ?? "交付文件包说明",
    deploymentWorkdir: version.deploymentWorkdir ?? "",
    deploymentCommand: version.deploymentCommand ?? "",
    deploymentEnv: version.deploymentEnv ?? "",
    deploymentTimeout: version.deploymentTimeout ?? "300",
    deploymentSuccessRule: version.deploymentSuccessRule ?? "部署命令执行成功",
    deploymentSuccessContent: version.deploymentSuccessContent ?? "",
    entryNote: version.entryNote ?? "说明工具包启动入口、主脚本或执行文件位置",
    runtimeNote: version.runtimeNote ?? "说明运行环境、依赖条件和基础资源要求",
    authNote: version.authNote ?? "",
    githubRepo: version.githubRepo ?? "",
    repoVisibility: version.repoVisibility ?? "Public",
    versionRefType: version.versionRefType ?? "Branch",
    versionRef: version.versionRef ?? "",
    ossLicenseNote: version.ossLicenseNote ?? "",
    gitlabRepo: version.gitlabRepo ?? "",
    gitlabType: version.gitlabType ?? "公共 GitLab",
    gitlabVisibility: version.gitlabVisibility ?? "Public",
    maintainTeam: version.maintainTeam ?? "",
    executionAccessMode: version.executionAccessMode ?? "toolhub_managed",
    connectorId: version.connectorId ?? (version.httpServiceAddress === RAGFLOW_API_BASE ? "conn-rag" : "conn-knowledge"),
    connectorName: version.connectorName ?? (version.httpServiceAddress === RAGFLOW_API_BASE ? "RAG 算法服务" : "知识工程核心 API"),
    connectorBaseUrlSnapshot: version.connectorBaseUrlSnapshot ?? version.httpServiceAddress ?? "",
    connectorAuthType: version.connectorAuthType ?? "Bearer Token",
    serviceEnvironment: version.serviceEnvironment ?? "dev3",
    httpContentType: version.httpContentType ?? "application/json",
    httpAuthConfig: version.httpAuthConfig ?? "",
    asyncMode: version.asyncMode ?? "同步/异步均支持",
    callbackPolicy: normalizeCallbackPolicy(version.callbackPolicy),
    callbackUrl: version.callbackUrl ?? "",
    resultPathStrategy: normalizeResultPathStrategy(version.resultPathStrategy),
    asyncTaskIdField: version.asyncTaskIdField ?? "$.task_id",
    progressStatusField: version.progressStatusField ?? "$.status",
    resultFileField: version.resultFileField ?? "$.result_path",
    functionListPath: version.functionListPath ?? "",
    externalServiceRemark: version.externalServiceRemark ?? "",
    isDeployed: version.isDeployed ?? "yes",
    deployedServerAddress: version.deployedServerAddress ?? "toolhub-runner-01",
    deployedDirectory: version.deployedDirectory ?? `/opt/toolhub/${toolName}`,
    runtimeMode: version.runtimeMode ?? "command",
    runtimeWorkdir: version.runtimeWorkdir ?? `/opt/toolhub/${toolName}`,
    runtimeCommand: version.runtimeCommand ?? "python main.py",
    runtimeTimeout: version.runtimeTimeout ?? "120",
    httpStartCommand: version.httpStartCommand ?? "",
    httpServiceAddress: version.httpServiceAddress ?? "",
    httpPort: version.httpPort ?? "8000",
    httpHealthcheck: version.httpHealthcheck ?? "/health",
    httpPath: version.httpPath ?? "/parse",
    httpMethod: version.httpMethod ?? "POST",
    httpTimeout: version.httpTimeout ?? "120",
    scriptWorkdir: version.scriptWorkdir ?? `/opt/toolhub/${toolName}`,
    scriptEntryFile: version.scriptEntryFile ?? "main.py",
    scriptEntryFunction: version.scriptEntryFunction ?? "run",
    scriptTimeout: version.scriptTimeout ?? "120",
    runtimeEnv: version.runtimeEnv ?? "",
    modelResourceRequired: version.modelResourceRequired ?? "no",
    modelDependencies: version.modelDependencies ?? [],
    rawInputParams,
    inputSubmissionMode: version.inputSubmissionMode ?? getDefaultInputSubmission(version.runtimeMode ?? "command").mode,
    inputSubmissionVariable: version.inputSubmissionVariable ?? getDefaultInputSubmission(version.runtimeMode ?? "command").variable,
    inputSubmissionRule: version.inputSubmissionRule ?? getDefaultInputSubmission(version.runtimeMode ?? "command").rule,
    outputReadStrategy: version.outputReadStrategy ?? getDefaultOutputRead(version.runtimeMode ?? "command").strategy,
    outputStatusRule: version.outputStatusRule ?? getDefaultOutputRead(version.runtimeMode ?? "command").statusRule,
    outputResultLocation: version.outputResultLocation ?? getDefaultOutputRead(version.runtimeMode ?? "command").resultLocation,
    outputErrorSource: version.outputErrorSource ?? getDefaultOutputRead(version.runtimeMode ?? "command").errorSource,
    activePlanRefs: version.activePlanRefs ?? 0,
    inactivePlanRefs: version.inactivePlanRefs ?? Math.max((version.linkedPlanRefs ?? version.activePlanRefs ?? 0) - (version.activePlanRefs ?? 0), 0),
    linkedPlanRefs: version.linkedPlanRefs ?? ((version.activePlanRefs ?? 0) + (version.inactivePlanRefs ?? 0)),
    activePlanUsages: version.activePlanUsages ?? [],
    lastRunAt: version.lastRunAt ?? version.lastDebug,
    runCount,
    failureCount,
    createdBy: version.createdBy ?? "工具维护人",
    createdAt: version.createdAt ?? version.updatedAt ?? "2026-05-13 09:00:00",
    updatedAt: version.updatedAt ?? "2026-05-13 16:20:00",
  };
}

function getVersionPackageInfo(version: ToolVersion) {
  if (version.isDeployed === "no") {
    return {
      mode: "本地上传",
      detail: version.packageFile || version.packageName || "未上传文件包",
    };
  }

  const server = version.deployedServerAddress || "ToolHub 可用服务器";
  const directory = version.deployedDirectory || "工具包部署目录";
  return {
    mode: "已部署",
    detail: `${server} / ${directory}`,
  };
}

function getVersionRequestAddress(version: ToolVersion) {
  const base = (version.connectorBaseUrlSnapshot || version.httpServiceAddress || "").replace(/\/+$/, "");
  const path = version.httpPath ? `/${version.httpPath.replace(/^\/+/, "")}` : "";
  return base || path ? `${base}${path}` : "-";
}

function getVersionConnector(version: ToolVersion) {
  return TOOL_VERSION_CONNECTORS.find((connector) => connector.id === version.connectorId)
    ?? TOOL_VERSION_CONNECTORS.find((connector) => connector.name === version.connectorName)
    ?? TOOL_VERSION_CONNECTORS.find((connector) => connector.baseUrl === version.httpServiceAddress)
    ?? TOOL_VERSION_CONNECTORS[0];
}

function getVersionConnectorName(version: ToolVersion) {
  return version.connectorName || getVersionConnector(version)?.name || "-";
}

const MCP_SERVICE_VERSION_BINDINGS = [
  {
    serviceName: "知识工程 Agent MCP",
    status: "运行中",
    versionCodes: [
      "rag_document_parser_v1_3_0",
      "rag_chunk_splitter_v1_3_0",
      "rag_summary_v1_3_0",
      "rag_qa_extractor_v1_2_0",
    ],
  },
  {
    serviceName: "知识工程测试 MCP",
    status: "停用",
    versionCodes: [
      "rag_document_parser_v1_2_0",
      "rag_reprocess_v1_3_0",
    ],
  },
];

function getRunningMcpServiceNames(version: ToolVersion) {
  const versionCode = version.versionCode;
  if (!versionCode || version.status !== "published") return [];
  return MCP_SERVICE_VERSION_BINDINGS
    .filter((service) => service.status === "运行中" && service.versionCodes.includes(versionCode))
    .map((service) => service.serviceName);
}

function getAssociatedMcpServiceNames(version: ToolVersion) {
  const versionCode = version.versionCode;
  if (!versionCode || version.status !== "published") return [];
  return MCP_SERVICE_VERSION_BINDINGS
    .filter((service) => service.versionCodes.includes(versionCode))
    .map((service) => service.serviceName);
}

function getVersionMcpServiceRefs(version: ToolVersion) {
  return getAssociatedMcpServiceNames(version).length;
}

function isVersionUsedByRunningMcpService(version: ToolVersion) {
  return getRunningMcpServiceNames(version).length > 0;
}

function getVersionLiteflowRefs(version: ToolVersion) {
  return version.activePlanRefs ?? 0;
}

function getStandardInputName(item: RawInputParam) {
  return (item.mappedParamName || item.sourceName || "param").trim();
}

function getCallableInputParams(version: ToolVersion) {
  return (version.rawInputParams ?? []).filter((item) => item.handlingMode !== "fixed" && getStandardInputName(item));
}

function mapFieldTypeToJsonSchema(type?: RawInputType | RawResultFieldType) {
  switch (type) {
    case "数字":
      return { type: "number" };
    case "布尔":
      return { type: "boolean" };
    case "对象":
      return { type: "object", additionalProperties: true };
    case "数组":
      return { type: "array", items: { type: "object" } };
    case "文件":
    case "URL":
      return { type: "string", format: "uri" };
    case "错误信息":
    case "文本":
    default:
      return { type: "string" };
  }
}

function getFieldSampleValue(type?: RawInputType | RawResultFieldType, fallback?: string) {
  if (fallback) {
    const trimmed = fallback.trim();
    if (trimmed === "true") return true;
    if (trimmed === "false") return false;
    if (type === "数字" && !Number.isNaN(Number(trimmed))) return Number(trimmed);
    if ((type === "对象" || type === "数组") && (trimmed.startsWith("{") || trimmed.startsWith("["))) {
      try {
        return JSON.parse(trimmed);
      } catch {
        return trimmed;
      }
    }
    return trimmed;
  }
  switch (type) {
    case "数字":
      return 0;
    case "布尔":
      return true;
    case "对象":
      return {};
    case "数组":
      return [];
    case "文件":
      return "s3://knowledge-prod/input/sample.pdf";
    case "URL":
      return "https://example.com/source";
    default:
      return "示例文本";
  }
}

function buildVersionInputSchema(version: ToolVersion) {
  const properties = Object.fromEntries(getCallableInputParams(version).map((item) => {
    const name = getStandardInputName(item);
    const schema = {
      ...mapFieldTypeToJsonSchema(item.inputType),
      title: name,
      description: item.mappedParamDescription || item.description,
      ...(item.mappedDefaultValue ? { default: getFieldSampleValue(item.inputType, item.mappedDefaultValue) } : {}),
    };
    return [name, schema];
  }));
  const required = getCallableInputParams(version).filter((item) => item.required).map(getStandardInputName);
  return {
    type: "object",
    additionalProperties: false,
    properties,
    ...(required.length > 0 ? { required } : {}),
  };
}

function buildVersionOutputSchema(version: ToolVersion) {
  const resultFields = version.rawResultFields ?? [];
  const properties = Object.fromEntries(resultFields.map((item) => [
    item.sourceField,
    {
      ...mapFieldTypeToJsonSchema(item.fieldType),
      title: item.outputMapping || item.sourceField,
      description: item.description,
    },
  ]));
  const required = resultFields.filter((item) => item.requiredMode === "是").map((item) => item.sourceField);
  return {
    type: "object",
    additionalProperties: true,
    properties,
    ...(required.length > 0 ? { required } : {}),
  };
}

function buildVersionInputExample(version: ToolVersion) {
  return Object.fromEntries(getCallableInputParams(version).map((item) => [
    getStandardInputName(item),
    getFieldSampleValue(item.inputType, item.mappedDefaultValue),
  ]));
}

function buildVersionOutputExample(version: ToolVersion) {
  return Object.fromEntries((version.rawResultFields ?? []).map((item) => [
    item.sourceField,
    getFieldSampleValue(item.fieldType),
  ]));
}

function buildVersionUiSchema(version: ToolVersion) {
  const rawInputMap = new Map((version.rawInputParams ?? []).map((item) => [getStandardInputName(item), item]));
  const fields = (version.operationDisplay?.editableFields ?? [])
    .filter((field) => field.uiComponent !== "不展示")
    .slice()
    .sort((left, right) => left.order - right.order)
    .map((field) => {
      const rawInput = rawInputMap.get(field.sourceField);
      return {
        field: field.sourceField,
        label: field.displayName,
        description: field.description || rawInput?.description || "",
        component: normalizeToolUiComponent(field.uiComponent) || "单行文本",
        type: rawInput?.inputType || "文本",
        required: field.required,
        editable: field.editable,
        order: field.order,
        group: field.groupName || "接口参数",
        defaultValue: field.uiDefaultValue ?? rawInput?.mappedDefaultValue ?? "",
        options: SELECTABLE_UI_COMPONENTS.includes(normalizeToolUiComponent(field.uiComponent) as ToolUiComponent)
          ? getUiOptions(field).map((option) => ({ label: option.label, value: option.value }))
          : undefined,
        displayCondition: field.displayCondition || undefined,
      };
    });

  return {
    versionId: version.versionCode,
    generatedFrom: "operationDisplay.editableFields",
    layout: {
      mode: "form",
      groupBy: "group",
      submitMode: "toolhub_standard_input",
    },
    fields,
  };
}

function buildVersionFlowSchema(version: ToolVersion) {
  return {
    versionId: version.versionCode,
    generatedFrom: "progressNodes",
    nodes: (version.progressNodes ?? [])
      .slice()
      .sort((left, right) => left.order - right.order)
      .map((node) => ({
        nodeId: node.key,
        nodeName: node.name,
        order: node.order,
        description: node.description,
        statuses: node.statuses.map((status) => ({
          statusKey: status.key,
          statusName: status.name,
          apiField: getProgressStatusMatchMode(status),
          matchValue: getProgressStatusRule(status),
          message: status.message,
        })),
      })),
  };
}

function getVersionPlanRefInfo(version: ToolVersion) {
  const active = version.activePlanRefs ?? 0;
  const inactive = version.inactivePlanRefs ?? Math.max((version.linkedPlanRefs ?? active) - active, 0);
  return {
    active,
    inactive,
    total: version.linkedPlanRefs ?? active + inactive,
  };
}

function getVersionRuntimeInfo(version: ToolVersion) {
  const modeLabel = RUNTIME_MODE_OPTIONS.find((item) => item.key === version.runtimeMode)?.label ?? "命令行运行";
  if (version.runtimeMode === "http") {
    return {
      mode: modeLabel,
      detail: `${version.httpMethod || "POST"} ${version.httpPath || "/parse"} · ${version.httpPort || "-"} 端口`,
    };
  }
  if (version.runtimeMode === "script") {
    return {
      mode: modeLabel,
      detail: `${version.scriptEntryFile || "main.py"} / ${version.scriptEntryFunction || "run"}`,
    };
  }
  return {
    mode: modeLabel,
    detail: version.runtimeCommand || "未配置执行命令",
  };
}

function getRunResultStyle(result: RunResultStatus) {
  if (result === "成功") return { bg: "#dcfce7", color: "#166534" };
  if (result === "运行中") return { bg: "#dbeafe", color: "#1d4ed8" };
  return { bg: "#fef2f2", color: "#b91c1c" };
}

function getVersionModelInfo(version: ToolVersion) {
  const dependencies = version.modelDependencies ?? [];
  if (version.isDeployed !== "yes" || version.modelResourceRequired !== "yes" || dependencies.length === 0) {
    return {
      label: "无模型依赖",
      detail: "不需要单独连接模型资源",
    };
  }

  const names = dependencies.map((item) => item.name || "未命名模型").join("、");
  return {
    label: `${dependencies.length} 个模型`,
    detail: names,
  };
}

function getVersionStandardizationInfo(version: ToolVersion) {
  const rawInputCount = version.rawInputParams?.length ?? version.params?.length ?? 0;
  const standardInputCount = version.params?.length ?? 0;
  const resultCount = version.rawResultFields?.length ?? 0;
  const uiCount = version.operationDisplay?.editableFields.filter((field) => field.uiComponent !== "不展示").length ?? 0;
  return `原始入参 ${rawInputCount} / 标准入参 ${standardInputCount} / 返回 ${resultCount} / UI ${uiCount}`;
}

function createVersionDraft(tool: ToolItem | null) {
  const toolName = tool?.name ?? "";
  const rawInputParams: RawInputParam[] = [];
  const params = buildVersionParamsFromRawInputs(rawInputParams);
  const rawResultFields: RawResultField[] = [];
  const resultConfig = buildResultConfigFromRawResults(rawResultFields, toolName, "");
  const operationDisplay = createDefaultOperationDisplay(params, resultConfig, rawResultFields);
  const progressNodes = createInitialProgressNodes();
  const inputSubmission = getExternalHttpDefaultInputSubmission();
  const outputRead = getExternalHttpDefaultOutputRead();

  return {
    version: suggestNextVersion(tool),
    versionName: "",
    versionDesc: "",
    executionAccessMode: "external_http" as ExecutionAccessMode,
    connectorId: "conn-rag",
    connectorName: "RAG 算法服务",
    connectorBaseUrlSnapshot: RAGFLOW_API_BASE,
    connectorAuthType: "Bearer Token",
    serviceEnvironment: "dev3",
    httpContentType: "application/json",
    httpAuthConfig: "",
    asyncMode: "同步/异步均支持",
    callbackPolicy: "ToolHub 自动生成回调地址" as CallbackPolicy,
    callbackUrl: "",
    resultPathStrategy: "记录结果文件地址" as ResultPathStrategy,
    asyncTaskIdField: "",
    progressStatusField: "",
    resultFileField: "",
    functionListPath: "",
    externalServiceRemark: "",
    isDeployed: "yes" as YesNo,
    deployedServerAddress: "",
    deployedDirectory: "",
    deployedPackageVersion: "",
    deployedRemark: "",
    deliveryMethod: "local" as DeliveryMethod,
    repoUrl: "",
    repoBranch: "",
    toolPackageDirectory: "",
    accessCredential: "",
    deploymentConfigPath: "",
    deploymentWorkdir: "",
    deploymentCommand: "",
    deploymentEnv: "",
    deploymentTimeout: "300",
    deploymentRemark: "",
    deploymentSuccessRule: "命令执行成功",
    deploymentSuccessContent: "",
    modelResourceRequired: "no" as YesNo,
    modelDependencyMode: "local_dir" as ModelDependencyMode,
    modelName: "",
    modelPath: "",
    modelCredential: "",
    modelRemark: "",
    modelDependencies: [createDefaultModelDependency()],
    modelResourceSource: "local" as ModelResourceSource,
    modelFile: "",
    modelVersion: "",
    modelDesc: "",
    modelLoadPath: "",
    modelGitlabRepo: "",
    modelRepoVisibility: "Public" as RepoVisibility,
    modelVersionRefType: "Branch" as VersionRefType,
    modelVersionRef: "",
    modelDirectory: "",
    modelAccessCredential: "",
    modelServerAddress: "",
    deployedModelDirectory: "",
    runtimeMode: "http" as RuntimeMode,
    runtimeWorkdir: "",
    runtimeCommand: "",
    runtimeTimeout: "",
    runtimeConcurrency: "",
    runtimeRetryCount: "",
    runtimeEnv: "",
    runtimeRemark: "",
    httpStartCommand: "",
    httpServiceAddress: "",
    httpPort: "",
    httpHealthcheck: "",
    httpPath: "",
    httpMethod: "POST",
    httpTimeout: "600",
    scriptEntryFile: "",
    scriptEntryFunction: "",
    scriptTimeout: "",
    deliveryName: "",
    deliveryDesc: "",
    usageLimit: "",
    riskNote: "",
    sampleMaterial: "",
    maintainer: "",
    packageFile: "",
    packageName: "",
    packageVersion: "",
    packageDesc: "",
    entryNote: "",
    runtimeNote: "",
    authNote: "",
    githubRepo: "",
    repoVisibility: "Public",
    versionRefType: "Branch",
    versionRef: "",
    ossLicenseNote: "",
    gitlabRepo: "",
    gitlabType: "公共 GitLab",
    gitlabVisibility: "Public",
    maintainTeam: "",
    applicableNote: "",
    supportFileTypes: [] as string[],
    supportKnowledgeTypes: [] as string[],
    callLimitNote: "",
    recommendHint: false,
    callRule: "按版本调用配置和接口参数配置调用工具",
    inputMaterialTypes: ["文件"] as string[],
    supportSample: true,
    supportBatch: false,
    preconditionNote: "",
    failureAdvice: "",
    callConstraintNote: "",
    rawInputParams,
    inputSubmissionMode: inputSubmission.mode,
    inputSubmissionVariable: inputSubmission.variable,
    inputSubmissionRule: inputSubmission.rule,
    rawResultFields,
    outputReadStrategy: outputRead.strategy,
    outputStatusRule: outputRead.statusRule,
    outputResultLocation: outputRead.resultLocation,
    outputErrorSource: outputRead.errorSource,
    params,
    externalMappings: createDefaultExternalMappings(params),
    resultConfig,
    operationDisplay,
    progressNodes,
    sampleFile: "",
    sampleText: "",
    debugNote: "",
    debugStatus: "not_started" as DebugStatus,
    debugResultSummary: "",
    debugResultPreview: "",
    debugRawOutput: "",
    debugErrorMessage: "",
    debugAdvice: "",
    dirty: false,
    savedAt: "",
  };
}

function createVersionDraftFromVersion(tool: ToolItem | null, version: ToolVersion) {
  const normalized = normalizeVersion(version, tool?.name ?? "");
  const base = createVersionDraft(tool);
  const versionName = normalized.deliveryName || normalized.configFields.find((field) => field.name === "版本名称")?.value || "";
  const inputSubmission = getDefaultInputSubmission(normalized.runtimeMode ?? "command");
  const outputRead = getDefaultOutputRead(normalized.runtimeMode ?? "command");

  return {
    ...base,
    version: normalized.version,
    versionName: versionName === "-" ? "" : versionName,
    versionDesc: normalized.versionDesc ?? "",
    executionAccessMode: "external_http" as ExecutionAccessMode,
    connectorId: normalized.connectorId ?? base.connectorId,
    connectorName: normalized.connectorName ?? base.connectorName,
    connectorBaseUrlSnapshot: normalized.connectorBaseUrlSnapshot ?? normalized.httpServiceAddress ?? base.connectorBaseUrlSnapshot,
    connectorAuthType: normalized.connectorAuthType ?? base.connectorAuthType,
    serviceEnvironment: normalized.serviceEnvironment ?? base.serviceEnvironment,
    httpContentType: normalized.httpContentType ?? base.httpContentType,
    httpAuthConfig: normalized.httpAuthConfig ?? base.httpAuthConfig,
    asyncMode: normalized.asyncMode ?? base.asyncMode,
    callbackPolicy: normalized.callbackPolicy ?? base.callbackPolicy,
    callbackUrl: normalized.callbackUrl ?? base.callbackUrl,
    resultPathStrategy: normalized.resultPathStrategy ?? base.resultPathStrategy,
    asyncTaskIdField: normalized.asyncTaskIdField ?? base.asyncTaskIdField,
    progressStatusField: normalized.progressStatusField ?? base.progressStatusField,
    resultFileField: normalized.resultFileField ?? base.resultFileField,
    functionListPath: normalized.functionListPath ?? base.functionListPath,
    externalServiceRemark: normalized.externalServiceRemark ?? base.externalServiceRemark,
    isDeployed: "yes" as YesNo,
    deployedServerAddress: normalized.deployedServerAddress ?? "",
    deployedDirectory: normalized.deployedDirectory ?? "",
    modelResourceRequired: "no" as YesNo,
    modelDependencies: [],
    runtimeMode: "http" as RuntimeMode,
    runtimeWorkdir: normalized.runtimeWorkdir ?? "",
    runtimeCommand: normalized.runtimeCommand ?? "",
    runtimeTimeout: normalized.runtimeTimeout ?? "",
    runtimeEnv: normalized.runtimeEnv ?? "",
    httpStartCommand: normalized.httpStartCommand ?? "",
    httpServiceAddress: normalized.httpServiceAddress ?? "",
    httpPort: normalized.httpPort ?? "",
    httpHealthcheck: normalized.httpHealthcheck ?? "",
    httpPath: normalized.httpPath ?? "",
    httpMethod: normalized.httpMethod ?? "POST",
    httpTimeout: normalized.httpTimeout ?? "",
    scriptWorkdir: normalized.scriptWorkdir ?? "",
    scriptEntryFile: normalized.scriptEntryFile ?? "",
    scriptEntryFunction: normalized.scriptEntryFunction ?? "",
    scriptTimeout: normalized.scriptTimeout ?? "",
    deliveryMethod: normalized.deliveryMethod ?? "local",
    deliveryName: normalized.deliveryName ?? "",
    deliveryDesc: normalized.deliveryDesc ?? "",
    usageLimit: normalized.usageLimit ?? "",
    riskNote: normalized.riskNote ?? "",
    sampleMaterial: normalized.sampleMaterial ?? "",
    maintainer: normalized.maintainer ?? "",
    packageFile: normalized.packageFile ?? "",
    packageName: normalized.packageName ?? "",
    packageVersion: normalized.packageVersion ?? "",
    packageDesc: normalized.packageDesc ?? "",
    deploymentWorkdir: normalized.deploymentWorkdir ?? "",
    deploymentCommand: normalized.deploymentCommand ?? "",
    deploymentEnv: normalized.deploymentEnv ?? "",
    deploymentTimeout: normalized.deploymentTimeout ?? "300",
    deploymentSuccessRule: normalized.deploymentSuccessRule ?? "部署命令执行成功",
    deploymentSuccessContent: normalized.deploymentSuccessContent ?? "",
    entryNote: normalized.entryNote ?? "",
    runtimeNote: normalized.runtimeNote ?? "",
    authNote: normalized.authNote ?? "",
    githubRepo: normalized.githubRepo ?? "",
    repoVisibility: normalized.repoVisibility ?? "Public",
    versionRefType: normalized.versionRefType ?? "Branch",
    versionRef: normalized.versionRef ?? "",
    ossLicenseNote: normalized.ossLicenseNote ?? "",
    gitlabRepo: normalized.gitlabRepo ?? "",
    gitlabType: normalized.gitlabType ?? "公共 GitLab",
    gitlabVisibility: normalized.gitlabVisibility ?? "Public",
    maintainTeam: normalized.maintainTeam ?? "",
    applicableNote: normalized.applicableNote ?? "",
    supportFileTypes: normalized.supportFileTypes ?? [],
    supportKnowledgeTypes: normalized.supportKnowledgeTypes ?? [],
    callLimitNote: normalized.callLimitNote ?? "",
    recommendHint: normalized.recommendHint ?? false,
    callRule: normalized.callRule ?? "",
    inputMaterialTypes: normalized.inputMaterialTypes ?? ["文件"],
    supportSample: normalized.supportSample ?? true,
    supportBatch: normalized.supportBatch ?? false,
    preconditionNote: normalized.preconditionNote ?? "",
    failureAdvice: normalized.failureAdvice ?? "",
    callConstraintNote: normalized.callConstraintNote ?? "",
    rawInputParams: normalized.rawInputParams ?? base.rawInputParams,
    inputSubmissionMode: normalized.inputSubmissionMode ?? inputSubmission.mode,
    inputSubmissionVariable: normalized.inputSubmissionVariable ?? inputSubmission.variable,
    inputSubmissionRule: normalized.inputSubmissionRule ?? inputSubmission.rule,
    rawResultFields: normalized.rawResultFields ?? base.rawResultFields,
    outputReadStrategy: normalized.outputReadStrategy ?? outputRead.strategy,
    outputStatusRule: normalized.outputStatusRule ?? outputRead.statusRule,
    outputResultLocation: normalized.outputResultLocation ?? outputRead.resultLocation,
    outputErrorSource: normalized.outputErrorSource ?? outputRead.errorSource,
    params: normalized.params ?? base.params,
    externalMappings: normalized.externalMappings ?? base.externalMappings,
    resultConfig: normalized.resultConfig ?? base.resultConfig,
    operationDisplay: normalized.operationDisplay ?? base.operationDisplay,
    progressNodes: normalized.progressNodes ?? base.progressNodes,
    dirty: false,
    savedAt: "",
  };
}

function buildToolCodeSeed(name: string) {
  const preset: Record<string, string> = {
    "OCR 识别": "ocr_scan",
    版面解析: "layout_parser",
    文本切片: "text_slice",
    问答抽取: "qa_extract",
    术语抽取: "term_extract",
  };
  if (preset[name]) return preset[name];
  const normalized = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .replace(/_+/g, "_");
  if (normalized && /^[a-z]/.test(normalized)) return normalized;
  return `tool_${Date.now().toString(36)}`;
}

function ensureUniqueToolCode(seed: string, tools: ToolItem[], excludeToolId?: string) {
  const base = seed || `tool_${Date.now().toString(36)}`;
  const used = new Set(
    tools
      .filter((tool) => tool.id !== excludeToolId)
      .map((tool) => tool.toolCode.toLowerCase()),
  );
  if (!used.has(base.toLowerCase())) return base;
  let index = 2;
  while (used.has(`${base}_${index}`.toLowerCase())) index += 1;
  return `${base}_${index}`;
}

function buildVersionCode(toolCode: string, version: string) {
  const versionPart = version
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .replace(/_+/g, "_");
  return `${toolCode}_${versionPart || Date.now().toString(36)}`;
}

function ensureUniqueVersionCode(seed: string, versions: ToolVersion[], excludeVersionId?: string) {
  const used = new Set(
    versions
      .filter((version) => version.id !== excludeVersionId && version.versionCode)
      .map((version) => version.versionCode!.toLowerCase()),
  );
  if (!used.has(seed.toLowerCase())) return seed;
  let index = 2;
  while (used.has(`${seed}_${index}`.toLowerCase())) index += 1;
  return `${seed}_${index}`;
}

type RagflowFieldSpec = {
  name: string;
  type: RawInputType | RawResultFieldType;
  required?: boolean;
  description: string;
  defaultValue?: string;
  outputMapping?: VersionOutputMapping;
};

type RagflowComponentSpec = {
  id: string;
  toolCode: string;
  name: string;
  category: string;
  endpoint: string;
  description: string;
  detail: string;
  inputs: RagflowFieldSpec[];
  outputs: RagflowFieldSpec[];
  resultExample: string;
};

const RAGFLOW_API_BASE = "http://rag-server-dev3-admin.maip.test";

const RAGFLOW_COMPONENTS: RagflowComponentSpec[] = [
  {
    id: "document-parser",
    toolCode: "rag_document_parser",
    name: "文档解析",
    category: "文档解析",
    endpoint: "/rag_algorithm/parser",
    description: "接收文件 S3 下载地址，解析 PDF、Word 等文档内容并返回 chunk 列表。",
    detail: "适用于把原始文件转换为 RAG 标准 chunk。支持同步返回，也支持通过 callback_url 异步回调解析结果。",
    inputs: [
      { name: "file_download_url", type: "URL", required: true, description: "文件 S3 下载地址" },
      { name: "file_name", type: "文本", description: "文件名，缺省时根据下载地址推断" },
      { name: "method", type: "文本", description: "解析方式，支持 general、vlm、intelli_medical_insurance", defaultValue: "general" },
      { name: "parameters", type: "对象", description: "模型与解析策略参数" },
      { name: "callback_url", type: "URL", description: "异步回调地址，空值表示同步返回" },
      { name: "source_metadata", type: "对象", description: "文件元数据，随结果透传" },
    ],
    outputs: [
      { name: "code", type: "数字", required: true, description: "状态码，0 表示正常", outputMapping: "执行状态" },
      { name: "msg", type: "文本", description: "状态信息", outputMapping: "错误信息" },
      { name: "task_id", type: "文本", description: "异步任务 ID", outputMapping: "调用记录标识" },
      { name: "result_path", type: "文件", description: "解析结果保存路径", outputMapping: "文件或中间产物" },
      { name: "result", type: "数组", description: "解析后的 chunk 列表", outputMapping: "结构化结果" },
      { name: "error_pages", type: "数组", description: "解析失败页码集合", outputMapping: "错误信息" },
    ],
    resultExample: "result=chunk 列表；result_path=s3://rag-server/api-return/parser/task/chunk.json",
  },
  {
    id: "chunk-splitter",
    toolCode: "rag_chunk_splitter",
    name: "切片算法",
    category: "内容处理",
    endpoint: "/rag_algorithm/splitter",
    description: "传入解析后的 chunk 列表或 chunk 文件路径，输出切片后的 chunk 列表。",
    detail: "适用于把文档解析结果进一步切分为检索可用片段，支持 chunk_size、chunk_overlap、分隔符等参数。",
    inputs: [
      { name: "chunks_path", type: "URL", required: true, description: "待切片 chunk 文件 S3 路径" },
      { name: "chunks", type: "数组", required: true, description: "待切片的 chunk 列表" },
      { name: "method", type: "文本", description: "切片方式", defaultValue: "general" },
      { name: "parameters", type: "对象", description: "切片参数，如 chunk_size、chunk_overlap、seperator" },
      { name: "callback_url", type: "URL", description: "异步回调地址" },
    ],
    outputs: [
      { name: "code", type: "数字", required: true, description: "状态码，0 表示正常", outputMapping: "执行状态" },
      { name: "msg", type: "文本", description: "状态信息", outputMapping: "错误信息" },
      { name: "task_id", type: "文本", description: "异步任务 ID", outputMapping: "调用记录标识" },
      { name: "result_path", type: "文件", description: "切片结果保存路径", outputMapping: "文件或中间产物" },
      { name: "result", type: "数组", description: "切片后的 chunk 列表", outputMapping: "结构化结果" },
    ],
    resultExample: "result=切片后 chunk 列表；result_path=s3://rag-server/api-return/splitter/task/chunk.json",
  },
  {
    id: "retrieval-reprocess",
    toolCode: "rag_reprocess",
    name: "召回后处理",
    category: "内容处理",
    endpoint: "/rag_algorithm/reprocess",
    description: "在召回之后、大模型输入之前，对召回切片进行补全、合并等后处理。",
    detail: "适用于 RAG 检索链路中对召回上下文做二次整理，输入 query 和二维 chunk 列表，输出后处理结果。",
    inputs: [
      { name: "query", type: "文本", required: true, description: "本次重排或后处理对应的查询文本" },
      { name: "chunks_list", type: "数组", required: true, description: "召回 chunk 二维列表" },
      { name: "method", type: "文本", description: "后处理方法", defaultValue: "general" },
      { name: "parameters", type: "对象", description: "后处理参数" },
      { name: "callback_url", type: "URL", description: "异步回调地址" },
    ],
    outputs: [
      { name: "code", type: "数字", required: true, description: "状态码，0 表示正常", outputMapping: "执行状态" },
      { name: "msg", type: "文本", description: "状态信息", outputMapping: "错误信息" },
      { name: "task_id", type: "文本", description: "异步任务 ID", outputMapping: "调用记录标识" },
      { name: "result_path", type: "文件", description: "后处理结果保存路径", outputMapping: "文件或中间产物" },
      { name: "result", type: "数组", description: "后处理后的 chunk 列表", outputMapping: "结构化结果" },
    ],
    resultExample: "result=补全和合并后的 chunk 列表；task_id=reprocess-20260513-001",
  },
  {
    id: "summary",
    toolCode: "rag_summary",
    name: "摘要",
    category: "智能生成",
    endpoint: "/rag_algorithm/summary",
    description: "批量输入切片文本，返回每个切片的摘要总结。",
    detail: "适用于对 chunk_list 进行摘要生成，需要配置 llm_parameters，支持同步和异步返回。",
    inputs: [
      { name: "chunk_list", type: "数组", required: true, description: "切片列表，包含 chunk_id 和 content" },
      { name: "llm_parameters", type: "对象", required: true, description: "LLM 参数，包含 llm_name、llm_url、temperature、max_tokens 等" },
      { name: "request_id", type: "文本", description: "请求 ID" },
      { name: "callback_url", type: "URL", description: "异步回调地址" },
    ],
    outputs: [
      { name: "code", type: "数字", required: true, description: "状态码，0 表示正常", outputMapping: "执行状态" },
      { name: "msg", type: "文本", description: "状态信息", outputMapping: "错误信息" },
      { name: "task_id", type: "文本", description: "任务 ID", outputMapping: "调用记录标识" },
      { name: "result", type: "数组", description: "摘要结果列表，包含 chunk_id 和 summary", outputMapping: "结构化结果" },
    ],
    resultExample: "result=[{chunk_id, summary}]；msg=success",
  },
  {
    id: "qa-extractor",
    toolCode: "rag_qa_extractor",
    name: "QA 抽取",
    category: "智能生成",
    endpoint: "/rag_algorithm/qa_extractor",
    description: "批量输入切片文本，返回每个切片抽取出的问答列表。",
    detail: "适用于 FAQ 和问答草稿生成，需要 chunk_list 与 llm_parameters，输出 qa_list。",
    inputs: [
      { name: "chunk_list", type: "数组", required: true, description: "切片列表，包含 chunk_id 和 content" },
      { name: "llm_parameters", type: "对象", required: true, description: "LLM 参数，包含模型名称和模型接口地址" },
      { name: "request_id", type: "文本", description: "请求 ID" },
      { name: "callback_url", type: "URL", description: "异步回调地址" },
    ],
    outputs: [
      { name: "code", type: "数字", required: true, description: "状态码，0 表示正常", outputMapping: "执行状态" },
      { name: "msg", type: "文本", description: "状态信息", outputMapping: "错误信息" },
      { name: "task_id", type: "文本", description: "任务 ID", outputMapping: "调用记录标识" },
      { name: "result", type: "数组", description: "问答抽取结果，包含 chunk_id 和 qa_list", outputMapping: "结构化结果" },
    ],
    resultExample: "result=[{chunk_id, qa_list:[{question, answer}]}]",
  },
  {
    id: "keywords",
    toolCode: "rag_keywords",
    name: "关键词提取",
    category: "智能生成",
    endpoint: "/rag_algorithm/keywords",
    description: "批量输入切片文本，返回文本提取的关键词。",
    detail: "适用于对 chunk_list 进行关键词生成，需要 llm_parameters，输出逗号分割关键词。",
    inputs: [
      { name: "chunk_list", type: "数组", required: true, description: "切片列表，包含 chunk_id 和 content" },
      { name: "llm_parameters", type: "对象", required: true, description: "LLM 参数，包含模型名称和模型接口地址" },
      { name: "request_id", type: "文本", description: "请求 ID" },
      { name: "callback_url", type: "URL", description: "异步回调地址" },
    ],
    outputs: [
      { name: "code", type: "数字", required: true, description: "状态码，0 表示正常", outputMapping: "执行状态" },
      { name: "msg", type: "文本", description: "状态信息", outputMapping: "错误信息" },
      { name: "task_id", type: "文本", description: "任务 ID", outputMapping: "调用记录标识" },
      { name: "result", type: "数组", description: "关键词提取结果，包含 chunk_id 和 keywords", outputMapping: "结构化结果" },
    ],
    resultExample: "result=[{chunk_id, keywords:'政策,额度,还款'}]",
  },
  {
    id: "ragas-evaluate",
    toolCode: "ragas_evaluate",
    name: "RAGAS 评估",
    category: "质量评估",
    endpoint: "/rag_algorithm/ragas_evaluate",
    description: "根据文档上下文、问题、答案和人工标注计算 RAGAS 评估指标。",
    detail: "适用于评估问答结果质量，输出忠实度、答案相关性、上下文召回率等 0 到 1 分数。",
    inputs: [
      { name: "question", type: "文本", required: true, description: "评估问题" },
      { name: "contexts", type: "数组", required: true, description: "文档上下文列表" },
      { name: "answer", type: "文本", required: true, description: "待评估答案" },
      { name: "ground_truth", type: "文本", required: true, description: "人工标注标准答案" },
      { name: "metrics", type: "数组", description: "评估指标列表，默认全选" },
      { name: "llm_type", type: "文本", description: "Chat 模型名称", defaultValue: "qwen-1.5-7b" },
      { name: "embedding_type", type: "文本", description: "Embedding 模型名称", defaultValue: "PAPegEmbedding" },
    ],
    outputs: [
      { name: "code", type: "数字", required: true, description: "状态码，0 表示正常", outputMapping: "执行状态" },
      { name: "msg", type: "文本", description: "状态信息", outputMapping: "错误信息" },
      { name: "result", type: "对象", description: "各评估指标分数", outputMapping: "结构化结果" },
    ],
    resultExample: "result={faithfulness:0.86, answer_relevancy:0.94, context_recall:0.91}",
  },
  {
    id: "parse-sub-urls",
    toolCode: "parse_sub_urls",
    name: "URL 根地址解析",
    category: "文档解析",
    endpoint: "/parse/parse_sub_urls",
    description: "输入网站根地址，自动抓取静态网站关联子页面 URL。",
    detail: "适用于从站点首页批量发现可解析的子链接，默认最多返回 200 个 URL。",
    inputs: [
      { name: "websiteRootAddress", type: "URL", required: true, description: "网站根地址" },
      { name: "selector", type: "数组", description: "CSS 选择器数组，用于精准定位链接" },
      { name: "limit", type: "数字", description: "最大返回子 URL 数量", defaultValue: "200" },
    ],
    outputs: [
      { name: "code", type: "数字", required: true, description: "状态码，0 表示正常", outputMapping: "执行状态" },
      { name: "message", type: "文本", description: "状态信息", outputMapping: "错误信息" },
      { name: "data", type: "对象", description: "返回数据对象", outputMapping: "结构化结果" },
      { name: "sub_urls", type: "数组", description: "解析出的子链接列表", outputMapping: "主要结果内容" },
    ],
    resultExample: "data.sub_urls=['https://example.com/article1','https://example.com/article2']",
  },
  {
    id: "parse-url",
    toolCode: "parse_url",
    name: "URL 解析",
    category: "文档解析",
    endpoint: "/parse/parse_url",
    description: "接收 URL 地址并解析网页内容，返回网页解析 chunk。",
    detail: "适用于把网页内容转换为 RAG chunk。支持 selector、source_metadata、callback_url 和 trans_metadata。",
    inputs: [
      { name: "url", type: "URL", required: true, description: "待解析网页 URL" },
      { name: "selector", type: "数组", description: "CSS 选择器数组" },
      { name: "source_metadata", type: "对象", description: "网页元数据，随结果透传" },
      { name: "callback_url", type: "URL", description: "异步回调地址" },
    ],
    outputs: [
      { name: "code", type: "数字", required: true, description: "状态码，0 表示正常", outputMapping: "执行状态" },
      { name: "msg", type: "文本", description: "状态信息", outputMapping: "错误信息" },
      { name: "task_id", type: "文本", description: "任务 ID", outputMapping: "调用记录标识" },
      { name: "result_path", type: "文件", description: "结果保存路径", outputMapping: "文件或中间产物" },
      { name: "result", type: "数组", description: "网页解析 chunk 列表", outputMapping: "结构化结果" },
    ],
    resultExample: "result_path=s3://rag-server/api-return/url_parser/task/chunk.json",
  },
  {
    id: "parse-html",
    toolCode: "parse_html",
    name: "HTML 解析",
    category: "文档解析",
    endpoint: "/parse_html",
    description: "接收 HTML 文件下载地址并解析文件内容，返回解析 chunk。",
    detail: "适用于 HTML 文件解析，输入 file_download_url、file_name 和元数据，输出 chunk 列表和结果路径。",
    inputs: [
      { name: "file_download_url", type: "URL", required: true, description: "HTML 文件 S3 下载地址" },
      { name: "file_name", type: "文本", required: true, description: "文件名，用于判断文件格式" },
      { name: "method", type: "文本", description: "解析方式", defaultValue: "general" },
      { name: "parameters", type: "对象", description: "模型参数" },
      { name: "source_metadata", type: "对象", description: "文件元数据，随结果透传" },
      { name: "callback_url", type: "URL", description: "异步回调地址" },
    ],
    outputs: [
      { name: "code", type: "数字", required: true, description: "状态码，0 表示正常", outputMapping: "执行状态" },
      { name: "msg", type: "文本", description: "状态信息", outputMapping: "错误信息" },
      { name: "task_id", type: "文本", description: "任务 ID", outputMapping: "调用记录标识" },
      { name: "result_path", type: "文件", description: "结果保存路径", outputMapping: "文件或中间产物" },
      { name: "result", type: "数组", description: "HTML 解析 chunk 列表", outputMapping: "结构化结果" },
      { name: "error_pages", type: "数组", description: "失败页码集合", outputMapping: "错误信息" },
    ],
    resultExample: "result=HTML chunk 列表；result_path=s3://rag-server/api-return/html/task/chunk.json",
  },
];

const RAGFLOW_FIELD_META: Record<string, { label: string; uiComponent: ToolUiComponent; sample: string | string[]; options?: ToolUiOption[] }> = {
  file_download_url: { label: "文件地址", uiComponent: "单行文本", sample: "s3://knowledge-prod/input/2026/05/合同样例.pdf" },
  file_name: { label: "文件名称", uiComponent: "单行文本", sample: "合同样例.pdf" },
  method: {
    label: "处理方式",
    uiComponent: "单选",
    sample: "general",
    options: [
      { id: "method-general", label: "通用模式", value: "general" },
      { id: "method-vlm", label: "视觉模型解析", value: "vlm" },
      { id: "method-medical", label: "医保场景", value: "intelli_medical_insurance" },
    ],
  },
  parameters: { label: "高级参数", uiComponent: "多行文本", sample: "{\"parse_table\":true,\"ocr\":true}" },
  callback_url: { label: "回调地址", uiComponent: "单行文本", sample: "https://toolhub.example.com/callback/runs/RUN-20260515-001" },
  source_metadata: { label: "来源元数据", uiComponent: "多行文本", sample: "{\"source\":\"运营端上传\",\"biz_id\":\"DOC-20260515-001\"}" },
  chunks_path: { label: "切片文件地址", uiComponent: "单行文本", sample: "s3://knowledge-prod/parser/result/chunks.json" },
  chunks: { label: "解析切片", uiComponent: "多行文本", sample: "[{\"chunk_id\":\"chunk_001\",\"content\":\"示例文本段落\"}]" },
  query: { label: "查询问题", uiComponent: "多行文本", sample: "知识库搭建失败时如何排查导入任务？" },
  chunks_list: { label: "召回切片列表", uiComponent: "多行文本", sample: "[[{\"chunk_id\":\"hit_001\",\"content\":\"召回文本\"}]]" },
  chunk_list: { label: "切片列表", uiComponent: "多行文本", sample: "[{\"chunk_id\":\"chunk_001\",\"content\":\"待处理文本\"}]" },
  llm_parameters: { label: "模型参数", uiComponent: "多行文本", sample: "{\"llm_name\":\"qwen2-72b\",\"temperature\":0.2,\"max_tokens\":1024}" },
  request_id: { label: "请求编号", uiComponent: "单行文本", sample: "REQ-20260515-0001" },
  question: { label: "评估问题", uiComponent: "多行文本", sample: "平台如何判断文档解析任务已经完成？" },
  contexts: { label: "参考上下文", uiComponent: "多行文本", sample: "[\"任务完成后会写入标准返回结果和流程节点状态\"]" },
  answer: { label: "待评估答案", uiComponent: "多行文本", sample: "系统根据回调状态和返回码判断任务完成。" },
  ground_truth: { label: "标准答案", uiComponent: "多行文本", sample: "ToolHub 根据标准 API 返回 code、status 和流程回调更新任务状态。" },
  metrics: {
    label: "评估指标",
    uiComponent: "多选",
    sample: ["faithfulness", "answer_relevancy", "context_recall"],
    options: [
      { id: "metric-faithfulness", label: "忠实度", value: "faithfulness" },
      { id: "metric-answer-relevancy", label: "答案相关性", value: "answer_relevancy" },
      { id: "metric-context-recall", label: "上下文召回率", value: "context_recall" },
      { id: "metric-context-precision", label: "上下文准确率", value: "context_precision" },
    ],
  },
  llm_type: {
    label: "评估模型",
    uiComponent: "单选",
    sample: "qwen2-72b",
    options: [
      { id: "llm-qwen72b", label: "Qwen2-72B", value: "qwen2-72b" },
      { id: "llm-qwen7b", label: "Qwen2-7B", value: "qwen2-7b" },
      { id: "llm-deepseek", label: "DeepSeek-V3", value: "deepseek-v3" },
    ],
  },
  embedding_type: {
    label: "向量模型",
    uiComponent: "单选",
    sample: "bge-large-zh",
    options: [
      { id: "embedding-bge-large", label: "BGE Large 中文", value: "bge-large-zh" },
      { id: "embedding-bge-m3", label: "BGE M3", value: "bge-m3" },
    ],
  },
  websiteRootAddress: { label: "网站根地址", uiComponent: "单行文本", sample: "https://help.example.com" },
  selector: { label: "链接选择器", uiComponent: "标签输入", sample: ".article a,.doc-link" },
  limit: { label: "抓取上限", uiComponent: "数字输入", sample: "200" },
  url: { label: "网页地址", uiComponent: "单行文本", sample: "https://help.example.com/docs/import-guide" },
};

function getRagflowFieldLabel(fieldName: string) {
  return RAGFLOW_FIELD_META[fieldName]?.label ?? fieldName;
}

function getRagflowFieldSample(field: RagflowFieldSpec) {
  const sample = RAGFLOW_FIELD_META[field.name]?.sample;
  if (Array.isArray(sample)) return sample.join(",");
  if (sample) return sample;
  if (field.defaultValue) return field.defaultValue;
  if (field.type === "数组") return "[]";
  if (field.type === "对象") return "{}";
  if (field.type === "数字") return "0";
  if (field.type === "布尔") return "false";
  return "";
}

function createRagflowOperationDisplay(params: ToolParam[], resultConfig: ResultConfig, rawResultFields: RawResultField[]): OperationDisplayConfig {
  const base = createDefaultOperationDisplay(params, resultConfig, rawResultFields);
  return {
    editableFields: base.editableFields.map((field) => {
      const meta = RAGFLOW_FIELD_META[field.sourceField];
      return {
        ...field,
        displayName: meta?.label ?? field.displayName,
        description: meta?.label ? `${meta.label}，${field.description}` : field.description,
        uiComponent: meta?.uiComponent ?? field.uiComponent,
        optionItems: meta?.options,
        uiDefaultValue: undefined,
      };
    }),
    readonlyFields: base.readonlyFields,
  };
}

function createRagflowRawInput(field: RagflowFieldSpec, index: number): RawInputParam {
  return {
    id: `raw-${field.name}-${index}`,
    sourceName: field.name,
    inputType: field.type as RawInputType,
    required: Boolean(field.required),
    description: field.description,
    passingMode: "HTTP JSON Body",
    handlingMode: "mapped",
    mappedParamName: field.name,
    mappedParamDescription: `${getRagflowFieldLabel(field.name)}：${field.description}`,
    mappedDefaultValue: getRagflowFieldSample(field),
    editableInOperation: true,
    validationRule: "",
    fixedValue: "",
    fixedValueDescription: "",
  };
}

function createRagflowRawResult(field: RagflowFieldSpec, index: number): RawResultField {
  return {
    id: `result-${field.name}-${index}`,
    sourceField: field.name,
    fieldType: field.type as RawResultFieldType,
    readMode: "HTTP 响应读取",
    requiredMode: field.required ? "是" : field.outputMapping === "错误信息" ? "失败时必返" : "否",
    description: field.description,
    outputMapping: field.outputMapping ?? "主要结果内容",
  };
}

function createRagflowProgressNodes(componentName: string): ProgressNodeConfig[] {
  return ["接收请求", "调用组件 API", "处理返回结果", "完成记录"].map((name, index) => {
    const key = `${componentName}_${index + 1}`.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]+/g, "_");
    return {
      id: `progress-${componentName}-${index + 1}`,
      key,
      name,
      description: index === 0 ? "校验 ToolHub 标准入参" : index === 1 ? "调用已封装的工具 API" : index === 2 ? "解析响应并写入运行记录" : "返回标准化结果",
      order: index + 1,
      statuses: createDefaultProgressStatuses(name, key),
    };
  });
}

function createRagflowVersion(component: RagflowComponentSpec, version: string, status: VersionStatus, index: number, recommended = false): ToolVersion {
  const rawInputParams = component.inputs.map(createRagflowRawInput);
  const rawResultFields = component.outputs.map(createRagflowRawResult);
  const params = buildVersionParamsFromRawInputs(rawInputParams);
  const resultConfig = buildResultConfigFromRawResults(rawResultFields, component.name, version);
  const operationDisplay = createRagflowOperationDisplay(params, resultConfig, rawResultFields);
  const runCount = Math.max(0, 180 - index * 13 + (recommended ? 24 : 0));
  const failureCount = index % 4;
  const isPublished = status === "published";

  return {
    id: `${component.id}-${version.replace(/[^a-zA-Z0-9]+/g, "-").toLowerCase()}`,
    versionCode: buildVersionCode(component.toolCode, version),
    version,
    status,
    recommended,
    lastDebug: status === "wait_debug" ? "" : `2026-05-13 ${String(9 + (index % 9)).padStart(2, "0")}:${String(10 + (index * 7) % 50).padStart(2, "0")}:00`,
    configFields: params.map((param) => ({ name: param.paramName, type: param.paramType, value: param.defaultValue, editable: param.editableInOperation })),
    summary: `${component.endpoint}；入参 ${rawInputParams.length} 个；返回 ${rawResultFields.length} 个`,
    versionDesc: `${component.name} ${version} 标准 API 接入配置`,
    applicableNote: component.detail,
    supportFileTypes: component.category === "文档解析" ? ["PDF", "Word", "HTML", "URL"] : [],
    supportKnowledgeTypes: component.category === "文档解析" ? ["文本切片", "QA"] : component.category === "质量评估" ? ["QA"] : ["文本切片"],
    callLimitNote: "按工具 API 超时和队列能力控制；大文件或批量 chunk 建议异步回调。",
    recommendHint: recommended,
    callRule: "ToolHub 按 API 信息登记的根地址、路径、鉴权和 Content-Type 调用工具。",
    inputMaterialTypes: component.inputs.some((item) => item.type === "文件" || item.name.includes("file")) ? ["文件"] : component.inputs.some((item) => item.type === "URL") ? ["URL"] : ["文本"],
    supportSample: true,
    supportBatch: component.inputs.some((item) => item.type === "数组"),
    preconditionNote: "工具 API 已按 ToolHub 标准接口完成封装并可被管理端访问。",
    failureAdvice: "检查接口地址、鉴权配置、必填参数和异步回调地址后重新调试。",
    callConstraintNote: "同步调用适合小数据量；长任务建议配置 callback_url 使用异步模式。",
    params,
    externalMappings: createDefaultExternalMappings(params),
    resultConfig,
    operationDisplay,
    progressNodes: createRagflowProgressNodes(component.name),
    debugStatus: status === "wait_debug" || status === "stopped" ? "not_started" : "success",
    rawInputParams,
    rawResultFields,
    deliveryMethod: "local",
    deliveryName: `${component.name} API 接入`,
    deliveryDesc: `按 ToolHub 标准接口登记 ${component.endpoint}。`,
    usageLimit: "遵循组件服务当前限流和任务队列规则。",
    riskNote: "依赖外部组件服务可用性，接口异常会记录到运行监测。",
    sampleMaterial: component.resultExample,
    maintainer: "工程平台组",
    packageFile: "已部署 API 服务",
    packageName: component.toolCode,
    packageVersion: version,
    packageDesc: "存量组件 API 标准接入配置",
    executionAccessMode: "external_http",
    connectorId: "conn-rag",
    connectorName: "RAG 算法服务",
    connectorBaseUrlSnapshot: RAGFLOW_API_BASE,
    connectorAuthType: "Bearer Token",
    serviceEnvironment: "dev3",
    httpContentType: "application/json",
    httpAuthConfig: "内部服务鉴权，由网关或环境配置提供",
    asyncMode: component.inputs.some((item) => item.name === "callback_url") ? "同步/异步均支持" : "同步调用",
    callbackPolicy: component.inputs.some((item) => item.name === "callback_url") ? "ToolHub 自动生成回调地址" : "不启用回调",
    callbackUrl: "",
    resultPathStrategy: component.outputs.some((item) => item.name === "result_path") ? "记录结果文件地址" : "不读取结果文件",
    asyncTaskIdField: "$.task_id",
    progressStatusField: "$.code",
    resultFileField: component.outputs.some((item) => item.name === "result_path") ? "$.result_path" : "",
    isDeployed: "yes",
    deployedServerAddress: RAGFLOW_API_BASE,
    deployedDirectory: component.endpoint,
    runtimeMode: "http",
    httpServiceAddress: RAGFLOW_API_BASE,
    httpPath: component.endpoint,
    httpMethod: "POST",
    httpTimeout: component.category === "智能生成" ? "600" : "180",
    httpHealthcheck: "/health",
    modelResourceRequired: component.inputs.some((item) => item.name.includes("llm") || item.name.includes("embedding")) ? "yes" : "no",
    modelDependencies: component.inputs.some((item) => item.name.includes("llm"))
      ? [{ id: `model-${component.id}`, purpose: "LLM 调用", mode: "remote_service", name: "qwen2-7b-instruct", path: "由 llm_parameters.llm_url 传入", credential: "内部网关鉴权" }]
      : [],
    inputSubmissionMode: "HTTP JSON Body",
    inputSubmissionVariable: "request.body",
    inputSubmissionRule: "按第三步标准入参组装 JSON Body 后调用工具 API。",
    outputReadStrategy: "HTTP 响应读取",
    outputStatusRule: "code=0 表示成功；非 0 或 HTTP 异常表示失败。",
    outputResultLocation: component.outputs.some((item) => item.name === "result_path") ? "同步响应 result 或异步回调 result_path" : "同步响应 result",
    outputErrorSource: "msg / message / result.exc",
    activePlanRefs: isPublished ? index % 4 : 0,
    inactivePlanRefs: isPublished ? (index + 1) % 3 : 0,
    linkedPlanRefs: isPublished ? (index % 4) + ((index + 1) % 3) : 0,
    activePlanUsages: isPublished ? [`知识库构建 Liteflow / ${component.name} 默认节点 / 生效`] : [],
    runCount,
    failureCount,
    lastRunAt: `2026-05-13 ${String(10 + (index % 8)).padStart(2, "0")}:${String(20 + (index * 5) % 40).padStart(2, "0")}:00`,
    createdBy: "系统管理员",
    updatedAt: "2026-05-13 18:30:00",
  };
}

function createRagflowTool(component: RagflowComponentSpec, index: number): ToolItem {
  const versions = [
    createRagflowVersion(component, "v1.3.0", "published", index, true),
    createRagflowVersion(component, "v1.4.0-alpha", "wait_debug", index + 11, false),
    createRagflowVersion(component, "v1.2.1", "pending", index + 22, false),
    createRagflowVersion(component, "v1.2.0", "published", index + 33, false),
    createRagflowVersion(component, "v1.1.0", "stopped", index + 44, false),
  ];
  const recommended = versions.find((version) => version.recommended);
  const latest = versions[0];
  const runCount = versions.reduce((sum, version) => sum + (version.runCount ?? 0), 0);
  const failureCount = versions.reduce((sum, version) => sum + (version.failureCount ?? 0), 0);

  return {
    id: component.id,
    toolCode: component.toolCode,
    name: component.name,
    category: component.category,
    sourceType: "存量 HTTP 服务",
    owner: "工程平台组",
    createdBy: "系统管理员",
    createdAt: "2026-05-13 09:00:00",
    updatedAt: "2026-05-13 18:30:00",
    status: index % 6 === 2 ? "disabled" : "enabled",
    latestVersion: latest.version,
    lastCalledAt: latest.lastRunAt ?? "-",
    callCount24h: runCount,
    failureCount24h: failureCount,
    description: component.description,
    capabilitySummary: component.description,
    detailedDescription: component.detail,
    versions,
  };
}

const INITIAL_TOOLS: ToolItem[] = RAGFLOW_COMPONENTS.map(createRagflowTool);

function createRagflowRunRecords(): Record<string, ToolRunRecord[]> {
  const resultCycle: RunResultStatus[] = ["成功", "运行中", "失败", "成功"];
  const typeCycle: RunRecordType[] = ["Agent调用", "Flow调用", "调试运行", "Agent调用"];
  const versionCycle = ["v1.3.0", "v1.2.0", "v1.4.0-alpha", "v1.1.0"];
  return Object.fromEntries(RAGFLOW_COMPONENTS.map((component, index) => {
    const requestAddress = `${RAGFLOW_API_BASE}${component.endpoint}`;
    const callbackEnabled = component.inputs.some((item) => item.name === "callback_url");
    const requestBody = Object.fromEntries(component.inputs.slice(0, 5).map((field) => {
      const meta = RAGFLOW_FIELD_META[field.name];
      const sample = meta?.sample;
      let value: unknown = sample ?? field.defaultValue ?? "";
      if (field.type === "数组" && typeof value === "string") value = value.startsWith("[") ? JSON.parse(value) : [value];
      if (field.type === "对象" && typeof value === "string") value = value.startsWith("{") ? JSON.parse(value) : { value };
      if (field.type === "数字" && typeof value === "string") value = Number(value);
      return [field.name, value];
    }));
    const records = resultCycle.map((result, recordIndex) => {
      const hour = 9 + ((index + recordIndex) % 9);
      const minute = 8 + ((index * 7 + recordIndex * 11) % 48);
      const startedAt = `2026-05-14 ${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00`;
      const finishedAt = result === "运行中" ? "" : `2026-05-14 ${String(hour).padStart(2, "0")}:${String(Math.min(59, minute + 4 + recordIndex)).padStart(2, "0")}:32`;
      const type = typeCycle[(index + recordIndex) % typeCycle.length];
      const version = versionCycle[(index + recordIndex) % versionCycle.length];
      const taskId = `RUN-${component.toolCode.toUpperCase()}-${String(index + 1).padStart(2, "0")}${String(recordIndex + 1).padStart(2, "0")}`;
      return {
        id: `${component.id}-run-${recordIndex + 1}`,
        type,
        trigger: type === "调试运行" ? "系统管理员" : type === "Flow调用" ? `flow-knowledge-build-${String(index + 1).padStart(3, "0")}` : `agent-knowledge-${String(index + 1).padStart(3, "0")}`,
        endpoint: type === "调试运行" ? "管理端" : "运营端",
        projectSpace: type === "调试运行" ? undefined : `知识库构建 / ${component.name}接入验证 / PRJ-202605-${String(index + 1).padStart(3, "0")}`,
        version,
        result,
        startedAt,
        finishedAt,
        packageInfo: requestAddress,
        config: `method=POST；url=${requestAddress}；headers.Content-Type=application/json；timeout=${component.category === "智能生成" ? "600" : "180"}s；auth=内部服务鉴权；callback=${callbackEnabled ? "ToolHub 自动生成" : "未启用"}；task_id_field=$.task_id；status_field=$.code`,
        input: `request_body=${JSON.stringify({ request_id: taskId, ...requestBody })}`,
        output: result === "失败"
          ? `response=${JSON.stringify({ code: 7001, status: "failed", message: "组件服务返回参数校验失败", error: "invalid_request_body", request_id: taskId })}`
          : result === "运行中"
            ? `response=${JSON.stringify({ code: 0, status: "running", task_id: taskId, node_key: "call_api", message: "组件 API 已接收，等待异步回调" })}`
            : `response=${JSON.stringify({ code: 0, status: "success", task_id: taskId, message: "success", result: component.resultExample })}`,
        flowTrace: result === "成功"
          ? `1.接收请求=成功(${startedAt})；2.调用组件 API=成功(${startedAt})；3.处理返回结果=成功(${finishedAt})；4.完成记录=成功(${finishedAt})`
          : result === "运行中"
            ? `1.接收请求=成功(${startedAt})；2.调用组件 API=处理中(进行中)；3.处理返回结果=待执行(-)；4.完成记录=待执行(-)`
            : `1.接收请求=成功(${startedAt})；2.调用组件 API=失败(${finishedAt})；3.处理返回结果=待执行(-)；4.完成记录=待执行(-)`,
        executedAt: startedAt,
      } satisfies ToolRunRecord;
    });
    return [component.id, records];
  }));
}

const RUN_RECORDS: Record<string, ToolRunRecord[]> = createRagflowRunRecords();

function loadTools(): ToolItem[] {
  try {
    const saved = localStorage.getItem(TOOL_STORAGE_KEY);
    if (!saved) {
      return INITIAL_TOOLS.map((tool) => ({
        ...tool,
        toolCode: tool.toolCode || buildToolCodeSeed(tool.name),
        capabilitySummary: tool.capabilitySummary || tool.description,
        detailedDescription: tool.detailedDescription || "待补充工具能力边界。",
        versions: tool.versions.map((version) => normalizeVersion(version, tool.name, tool.toolCode)),
      }));
    }
    const parsedTools = JSON.parse(saved) as Partial<ToolItem>[];
    const hydratedTools = parsedTools.map((tool) => ({
      sourceType: "待补充",
      owner: "未设置",
      createdBy: "系统管理员",
      createdAt: "2026-05-13 00:00:00",
      updatedAt: "2026-05-13 00:00:00",
      lastCalledAt: "-",
      callCount24h: 0,
      failureCount24h: 0,
      description: "待补充工具能力描述。",
      latestVersion: "-",
      status: "disabled",
      category: "解析",
      name: "",
      id: `tool-${Date.now()}`,
      ...tool,
      deleted: tool.deleted ?? false,
      toolCode: tool.toolCode || buildToolCodeSeed(tool.name ?? ""),
      capabilitySummary: tool.capabilitySummary ?? tool.description ?? "待补充工具能力摘要。",
      detailedDescription: tool.detailedDescription ?? "待补充工具能力边界。",
      versions: (tool.versions ?? []).map((version) => normalizeVersion(version as ToolVersion, tool.name ?? "", tool.toolCode)),
    })) as ToolItem[];
    return hydratedTools.map((tool, index) => ({
      ...tool,
      toolCode: ensureUniqueToolCode(tool.toolCode, hydratedTools.slice(0, index), tool.id),
    }));
  } catch {
    return INITIAL_TOOLS.map((tool) => ({
      ...tool,
      toolCode: tool.toolCode || buildToolCodeSeed(tool.name),
      capabilitySummary: tool.capabilitySummary || tool.description,
      detailedDescription: tool.detailedDescription || "待补充工具能力边界。",
      versions: tool.versions.map((version) => normalizeVersion(version, tool.name, tool.toolCode)),
    }));
  }
}

function loadCategories(): string[] {
  try {
    const saved = localStorage.getItem(CATEGORY_STORAGE_KEY);
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  } catch {
    return INITIAL_CATEGORIES;
  }
}

function saveTools(next: ToolItem[]) {
  localStorage.setItem(TOOL_STORAGE_KEY, JSON.stringify(next));
}

function saveCategories(next: string[]) {
  localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(next));
}

function loadSelectedCategory() {
  try {
    return localStorage.getItem(CATEGORY_SELECTION_STORAGE_KEY) || "all";
  } catch {
    return "all";
  }
}

function saveSelectedCategory(category: string) {
  try {
    localStorage.setItem(CATEGORY_SELECTION_STORAGE_KEY, category);
  } catch {
    // Ignore storage errors in prototype mode.
  }
}

function StatusChip({ status }: { status: ToolStatus }) {
  const current = TOOL_STATUS[status];
  return <Chip label={current.label} size="small" sx={{ height: 22, fontSize: "11px", bgcolor: current.bg, color: current.color, border: "none", "& .MuiChip-label": { px: 1 } }} />;
}

function VersionChip({ status }: { status: VersionStatus }) {
  const current = VERSION_STATUS[status];
  return <Chip label={current.label} size="small" sx={{ height: 22, fontSize: "11px", bgcolor: current.bg, color: current.color, border: "none", "& .MuiChip-label": { px: 1 } }} />;
}

export function ToolHubPage() {
  const navigate = useNavigate();
  const [tools, setToolsState] = useState<ToolItem[]>(loadTools);
  const [categories, setCategoriesState] = useState<string[]>(loadCategories);
  const [selectedCategory, setSelectedCategory] = useState(loadSelectedCategory);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [addOpen, setAddOpen] = useState(false);
  const [editingToolId, setEditingToolId] = useState<string | null>(null);
  const [newTool, setNewTool] = useState({
    name: "",
    toolCode: "",
    category: loadCategories()[0] ?? "解析",
    capabilitySummary: "",
    detailedDescription: "",
  });
  const [categoryEditorOpen, setCategoryEditorOpen] = useState(false);
  const [categoryEditorMode, setCategoryEditorMode] = useState<CategoryEditorMode>("create");
  const [categoryDraft, setCategoryDraft] = useState("");
  const [categoryMenuAnchor, setCategoryMenuAnchor] = useState<null | HTMLElement>(null);
  const [categoryMenuTarget, setCategoryMenuTarget] = useState<string | null>(null);
  const [deleteConfirmToolId, setDeleteConfirmToolId] = useState<string | null>(null);
  const [toolPage, setToolPage] = useState(0);
  const [toolRowsPerPage, setToolRowsPerPage] = useState(20);

  const setTools = (updater: ToolItem[] | ((prev: ToolItem[]) => ToolItem[])) => {
    setToolsState((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      saveTools(next);
      return next;
    });
  };

  const setCategories = (updater: string[] | ((prev: string[]) => string[])) => {
    setCategoriesState((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      saveCategories(next);
      return next;
    });
  };

  const updateSelectedCategory = (category: string) => {
    setSelectedCategory(category);
    saveSelectedCategory(category);
  };

  const resetAddTool = () => {
    setEditingToolId(null);
    setNewTool({
      name: "",
      toolCode: "",
      category: categories[0] ?? "解析",
      capabilitySummary: "",
      detailedDescription: "",
    });
  };

  const visibleTools = useMemo(() => tools.filter((tool) => !tool.deleted), [tools]);

  const toolsInCategory = useMemo(() => (
    selectedCategory === "all" ? visibleTools : visibleTools.filter((tool) => tool.category === selectedCategory)
  ), [selectedCategory, visibleTools]);

  const filtered = useMemo(() => toolsInCategory.filter((tool) => {
    if (query && !tool.name.toLowerCase().includes(query.toLowerCase())) return false;
    if (status !== "all" && tool.status !== status) return false;
    return true;
  }), [toolsInCategory, query, status]);

  const pagedTools = useMemo(() => (
    filtered.slice(toolPage * toolRowsPerPage, toolPage * toolRowsPerPage + toolRowsPerPage)
  ), [filtered, toolPage, toolRowsPerPage]);

  const stats = useMemo(() => ({
    total: toolsInCategory.length,
    enabled: toolsInCategory.filter((tool) => tool.status === "enabled").length,
    publishedVersions: toolsInCategory.reduce((sum, tool) => sum + tool.versions.filter((version) => version.status === "published").length, 0),
    activeVersions: toolsInCategory.reduce((sum, tool) => sum + tool.versions.filter(isVersionUsedByRunningMcpService).length, 0),
  }), [toolsInCategory]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    visibleTools.forEach((tool) => {
      counts[tool.category] = (counts[tool.category] ?? 0) + 1;
    });
    return counts;
  }, [visibleTools]);

  const categoryItems = useMemo(() => [
    { key: "all", label: "全部", count: visibleTools.length },
    ...categories.map((category) => ({ key: category, label: category, count: categoryCounts[category] ?? 0 })),
  ], [categories, categoryCounts, visibleTools.length]);

  const openCreateTool = () => {
    resetAddTool();
    setAddOpen(true);
  };

  const openEditTool = (toolId: string) => {
    const target = tools.find((tool) => tool.id === toolId);
    if (!target) return;
    setEditingToolId(toolId);
    setNewTool({
      name: target.name,
      toolCode: target.toolCode,
      category: target.category,
      capabilitySummary: target.capabilitySummary || target.description,
      detailedDescription: target.detailedDescription || "待补充工具能力边界。",
    });
    setAddOpen(true);
  };

  const saveNewTool = (createVersion: boolean) => {
    const toolName = newTool.name.trim();
    const manualToolCode = newTool.toolCode.trim();
    if (!toolName) {
      toast.error("请填写工具名称");
      return;
    }
    if (tools.some((tool) => !tool.deleted && tool.id !== editingToolId && tool.name.trim().toLowerCase() === toolName.toLowerCase())) {
      toast.error("工具名称已存在，请调整后再保存");
      return;
    }
    if (!newTool.category) {
      toast.error("请选择工具分类");
      return;
    }
    if (!newTool.capabilitySummary.trim()) {
      toast.error("请填写能力摘要");
      return;
    }
    if (!newTool.detailedDescription.trim()) {
      toast.error("请填写详细描述");
      return;
    }

    if (editingToolId) {
      setTools((prev) => prev.map((tool) => (
        tool.id === editingToolId
          ? {
            ...tool,
            name: toolName,
            category: newTool.category,
            description: newTool.capabilitySummary.trim(),
            capabilitySummary: newTool.capabilitySummary.trim(),
            detailedDescription: newTool.detailedDescription.trim(),
            updatedAt: "2026-05-14 15:00:00",
          }
          : tool
      )));
      setAddOpen(false);
      resetAddTool();
      toast.success("工具基础信息已更新");
      return;
    }

    const generatedToolCode = manualToolCode || ensureUniqueToolCode(buildToolCodeSeed(toolName), tools);
    if (!TOOL_CODE_PATTERN.test(generatedToolCode)) {
      toast.error("工具ID需以小写字母开头，仅支持小写字母、数字和下划线");
      return;
    }
    if (tools.some((tool) => tool.toolCode.toLowerCase() === generatedToolCode.toLowerCase())) {
      toast.error("工具ID已存在，请调整后再保存");
      return;
    }

    const id = `tool-${Date.now()}`;
    const defaultFields = buildDefaultVersionConfig(toolName);
    const versions = createVersion ? [
      {
        id: `${id}-v1`,
        versionCode: buildVersionCode(generatedToolCode, "v1.0.0"),
        version: "v1.0.0",
        status: "wait_debug" as VersionStatus,
        recommended: false,
        lastDebug: "未调试",
        configFields: defaultFields,
        summary: buildVersionSummary(defaultFields),
      },
    ] : [];

    const tool: ToolItem = {
      id,
      toolCode: generatedToolCode,
      name: toolName,
      category: newTool.category,
      sourceType: "待补充",
      owner: "未设置",
      createdBy: "系统管理员",
      createdAt: "2026-05-13 15:00:00",
      updatedAt: "2026-05-13 15:00:00",
      status: "disabled",
      latestVersion: createVersion ? "v1.0.0" : "-",
      lastCalledAt: "-",
      callCount24h: 0,
      failureCount24h: 0,
      deleted: false,
      description: newTool.capabilitySummary.trim(),
      capabilitySummary: newTool.capabilitySummary.trim(),
      detailedDescription: newTool.detailedDescription.trim(),
      versions,
    };

    setTools((prev) => [tool, ...prev]);
    setAddOpen(false);
    resetAddTool();

    if (createVersion) {
      toast.success("工具已创建，已进入版本页");
      navigate(`/admin/tool-hub/${id}?tab=versions`);
    } else {
      toast.success("工具已创建，默认停用");
    }
  };

  const openCreateCategory = () => {
    setCategoryEditorMode("create");
    setCategoryDraft("");
    setCategoryEditorOpen(true);
  };

  const openEditCategory = (category: string) => {
    setCategoryEditorMode("edit");
    setCategoryDraft(category);
    updateSelectedCategory(category);
    setCategoryEditorOpen(true);
  };

  const saveCategory = () => {
    const nextName = categoryDraft.trim();
    if (!nextName) {
      toast.error("请填写分类名称");
      return;
    }

    if (categoryEditorMode === "create") {
      if (categories.includes(nextName)) {
        toast.error("分类名称已存在");
        return;
      }
      setCategories((prev) => [...prev, nextName]);
      toast.success("分类已新增");
      setCategoryEditorOpen(false);
      return;
    }

    const current = selectedCategory;
    if (current === "all") return;
    if (nextName !== current && categories.includes(nextName)) {
      toast.error("分类名称已存在");
      return;
    }

    setCategories((prev) => prev.map((item) => (item === current ? nextName : item)));
    setTools((prev) => prev.map((tool) => (tool.category === current ? { ...tool, category: nextName } : tool)));
    updateSelectedCategory(nextName);
    setCategoryEditorOpen(false);
    toast.success("分类已修改");
  };

  const deleteCategory = (category: string) => {
    if ((categoryCounts[category] ?? 0) > 0) {
      toast.error("该分类下仍有关联工具，不能删除");
      return;
    }
    setCategories((prev) => prev.filter((item) => item !== category));
    if (selectedCategory === category) updateSelectedCategory("all");
    toast.success("分类已删除");
  };

  const openCategoryMenu = (event: React.MouseEvent<HTMLElement>, category: string) => {
    event.stopPropagation();
    setCategoryMenuAnchor(event.currentTarget);
    setCategoryMenuTarget(category);
  };

  const closeCategoryMenu = () => {
    setCategoryMenuAnchor(null);
    setCategoryMenuTarget(null);
  };

  const toggleToolStatus = (toolId: string) => {
    const targetTool = tools.find((tool) => tool.id === toolId);
    if (!targetTool) return;

    if (targetTool.status === "enabled" && targetTool.versions.some((version) => version.status === "published")) {
      toast.error("当前工具存在已发布版本，无法停用，请先停用已发布版本后再处理");
      return;
    }

    setTools((prev) => prev.map((tool) => (
      tool.id === toolId
        ? { ...tool, status: tool.status === "enabled" ? "disabled" : "enabled" }
        : tool
    )));
    toast.success("工具状态已更新");
  };

  const confirmDeleteTool = () => {
    if (!deleteConfirmToolId) return;

    setTools((prev) => prev.map((tool) => (
      tool.id === deleteConfirmToolId
        ? { ...tool, deleted: true, deletedAt: "2026-05-13 16:40:00" }
        : tool
    )));
    setDeleteConfirmToolId(null);
    toast.success("工具已删除");
  };

  return (
    <Box sx={{ display: "flex", height: "calc(100vh - 112px)", gap: 0, overflow: "hidden" }}>
      {dialogGlobalStyles}
      <Paper sx={{ width: 220, flexShrink: 0, border: "1px solid #e8eaed", borderRadius: "10px", boxShadow: "none", display: "flex", flexDirection: "column", mr: 2, overflow: "hidden" }}>
        <Box sx={{ p: 2, borderBottom: "1px solid #f0f0f0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#374151" }}>工具分类</Typography>
          <IconButton size="small" onClick={openCreateCategory} sx={{ color: BLUE }}>
            <Add sx={{ fontSize: 16 }} />
          </IconButton>
        </Box>
        <List disablePadding sx={{ flex: 1, overflow: "auto", py: 0.5, px: 0.5 }}>
          {categoryItems.map((item) => {
            const selected = selectedCategory === item.key;
            const editable = item.key !== "all";
            return (
              <ListItem key={item.key} disablePadding sx={{ mb: 0.25 }}>
                <ListItemButton
                  selected={selected}
                  onClick={() => { updateSelectedCategory(item.key); setToolPage(0); }}
                  sx={{ borderRadius: "6px", py: 0.875, px: 1.25, minHeight: 40, "&.Mui-selected": { bgcolor: "#e8edf5" }, "&:hover": { bgcolor: "#f5f7fb" }, "&:hover .category-actions": { opacity: 1 } }}
                >
                  <ListItemText
                    primary={(
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                        <Typography sx={{ fontSize: "12px", color: selected ? "#1e40af" : "#374151", fontWeight: selected ? 600 : 400 }}>
                          {item.label}
                        </Typography>
                        <Chip label={item.count} size="small" sx={{ height: 18, fontSize: "10px", minWidth: 24, bgcolor: selected ? "#dbeafe" : "#f1f5f9", color: selected ? "#1d4ed8" : "#6b7280", border: "none", "& .MuiChip-label": { px: 0.5 } }} />
                      </Box>
                    )}
                  />
                  {editable && (
                    <IconButton size="small" className="category-actions" onClick={(event) => openCategoryMenu(event, item.key)} sx={{ opacity: 0, transition: "opacity 0.15s ease", color: "#94a3b8", mr: -0.5 }}>
                      <MoreHoriz sx={{ fontSize: 16 }} />
                    </IconButton>
                  )}
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Paper>

      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, minHeight: 0 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
          <Typography sx={{ fontSize: "18px", fontWeight: 700, color: "#111827" }}>工具库</Typography>
        </Box>

        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(140px, 1fr))", gap: 1.5, mb: 2 }}>
          {[
            { label: "工具总数", value: stats.total, icon: <Hub />, color: "#334155" },
            { label: "已启用工具", value: stats.enabled, icon: <CheckCircle />, color: "#15803d" },
            { label: "已发布版本", value: stats.publishedVersions, icon: <RocketLaunch />, color: "#7c3aed" },
            { label: "在使用版本", value: stats.activeVersions, icon: <FactCheck />, color: "#b45309" },
          ].map((item) => (
            <Paper key={item.label} sx={{ p: 2, borderRadius: "10px", border: "1px solid #e5e7eb", boxShadow: "none", display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box sx={{ width: 34, height: 34, borderRadius: "8px", bgcolor: "#eff6ff", color: BLUE, display: "flex", alignItems: "center", justifyContent: "center", "& svg": { fontSize: 18 } }}>
                {item.icon}
              </Box>
              <Box>
                <Typography sx={{ fontSize: "21px", fontWeight: 700, color: item.color, lineHeight: 1 }}>{item.value}</Typography>
                <Typography sx={{ fontSize: "12px", color: "#64748b", mt: 0.5 }}>{item.label}</Typography>
              </Box>
            </Paper>
          ))}
        </Box>

        <Box sx={{ display: "flex", gap: 1.5, mb: 1.5, flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", alignItems: "center" }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <Select value={status} onChange={(event) => { setStatus(event.target.value); setToolPage(0); }} sx={{ borderRadius: "8px", fontSize: "13px", bgcolor: "#fff", "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e8eaed" } }}>
                <MenuItem value="all" sx={{ fontSize: "13px" }}>全部状态</MenuItem>
                <MenuItem value="enabled" sx={{ fontSize: "13px" }}>启用</MenuItem>
                <MenuItem value="disabled" sx={{ fontSize: "13px" }}>停用</MenuItem>
              </Select>
            </FormControl>
            <TextField
              size="small"
              placeholder="搜索工具名称"
              value={query}
              onChange={(event) => { setQuery(event.target.value); setToolPage(0); }}
              InputProps={{
                startAdornment: <InputAdornment position="start"><Search sx={{ fontSize: 18, color: "#9ca3af" }} /></InputAdornment>,
                endAdornment: query ? (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => { setQuery(""); setToolPage(0); }}><Close sx={{ fontSize: 16 }} /></IconButton>
                  </InputAdornment>
                ) : null,
              }}
              sx={{ width: 260, "& .MuiOutlinedInput-root": { borderRadius: "8px", bgcolor: "#fff", fontSize: "13px" }, "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e8eaed" } }}
            />
          </Box>
          <Button variant="contained" startIcon={<Add sx={{ fontSize: 16 }} />} onClick={openCreateTool} sx={{ bgcolor: BLUE, textTransform: "none", borderRadius: "6px", boxShadow: "none" }}>
            新建工具
          </Button>
        </Box>

        <Paper sx={{ border: "1px solid #e8eaed", borderRadius: "10px", boxShadow: "none", overflow: "hidden", flex: 1, display: "flex", flexDirection: "column", minHeight: 0, width: "100%", maxWidth: "100%" }}>
          {filtered.length === 0 ? (
            <Box sx={{ py: 10, textAlign: "center" }}>
              <Category sx={{ fontSize: 40, color: "#e8eaed", mb: 1 }} />
              <Typography sx={{ fontSize: "14px", color: "#9ca3af" }}>当前筛选条件下暂无工具</Typography>
            </Box>
          ) : (
            <>
              <TableContainer sx={{ flex: 1, width: "100%", maxWidth: "100%", overflowX: "auto", overflowY: "auto", display: "block", WebkitOverflowScrolling: "touch", "&::-webkit-scrollbar": { height: 12 }, "&::-webkit-scrollbar-track": { bgcolor: "#f1f5f9" }, "&::-webkit-scrollbar-thumb": { bgcolor: "#cbd5e1", borderRadius: 999, border: "3px solid #f1f5f9" }, "&::-webkit-scrollbar-thumb:hover": { bgcolor: "#94a3b8" } }}>
                <Table size="small" stickyHeader sx={{ minWidth: 980, tableLayout: "fixed" }}>
                  <TableHead>
                    <TableRow sx={{ bgcolor: "#f8f9fb" }}>
                      {[
                        ["工具名称", "220px"],
                        ["分类", "120px"],
                        ["工具状态", "100px"],
                        ["已发布版本数", "120px"],
                        ["推荐版本", "120px"],
                        ["最近调用", "160px"],
                        ["操作", "220px"],
                      ].map(([head, width]) => (
                        <TableCell key={head} sx={{ width, fontSize: "12px", fontWeight: 600, color: "#6b7280", py: 1.5, bgcolor: "#f8f9fb", borderBottom: "1px solid #f0f0f0", whiteSpace: "nowrap" }}>
                          {head}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pagedTools.map((tool, index) => {
                      const recommended = tool.versions.find((version) => version.recommended);
                      const publishedCount = tool.versions.filter((version) => version.status === "published").length;
                      return (
                        <TableRow key={tool.id} sx={{ bgcolor: (toolPage * toolRowsPerPage + index) % 2 === 0 ? "#fff" : "#fafafa", "&:hover": { bgcolor: "#f6f9ff" }, "& td": { borderBottom: "1px solid #f5f5f5" } }}>
                          <TableCell sx={{ py: 1.5, minWidth: 0 }}>
                            <Typography component="button" onClick={() => navigate(`/admin/tool-hub/${tool.id}?tab=versions`)} sx={{ border: "none", p: 0, m: 0, bgcolor: "transparent", fontSize: "13px", color: "#111827", fontWeight: 500, cursor: "pointer", textAlign: "left", "&:hover": { color: BLUE, textDecoration: "underline" } }}>{tool.name}</Typography>
                          </TableCell>
                          <TableCell sx={{ py: 1.5, fontSize: "12px", color: "#374151" }}>{tool.category}</TableCell>
                          <TableCell sx={{ py: 1.5 }}><StatusChip status={tool.status} /></TableCell>
                          <TableCell sx={{ py: 1.5, fontSize: "12px", color: "#374151" }}>{publishedCount}</TableCell>
                          <TableCell sx={{ py: 1.5 }}>
                            {recommended ? (
                              <Chip label={recommended.version} size="small" sx={{ height: 22, fontSize: "11px", bgcolor: "#eff6ff", color: "#1d4ed8", border: "none" }} />
                            ) : (
                              <Typography sx={{ fontSize: "12px", color: "#9ca3af" }}>未设置</Typography>
                            )}
                          </TableCell>
                          <TableCell sx={{ py: 1.5, fontSize: "12px", color: "#64748b", whiteSpace: "nowrap" }}>{tool.lastCalledAt}</TableCell>
                          <TableCell sx={{ py: 1.5 }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
                              <Switch size="small" checked={tool.status === "enabled"} onChange={() => toggleToolStatus(tool.id)} />
                              <Typography component="button" onClick={() => navigate(`/admin/tool-hub/${tool.id}?tab=versions`)} sx={{ border: "none", p: 0, m: 0, bgcolor: "transparent", color: BLUE, fontSize: "12px", cursor: "pointer" }}>
                                详情
                              </Typography>
                              <Typography component="button" onClick={() => openEditTool(tool.id)} sx={{ border: "none", p: 0, m: 0, bgcolor: "transparent", color: BLUE, fontSize: "12px", cursor: "pointer" }}>
                                编辑
                              </Typography>
                              {tool.status === "disabled" && (
                                <Typography component="button" onClick={() => setDeleteConfirmToolId(tool.id)} sx={{ border: "none", p: 0, m: 0, bgcolor: "transparent", color: "#ef4444", fontSize: "12px", cursor: "pointer" }}>
                                  删除
                                </Typography>
                              )}
                            </Box>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                component="div"
                count={filtered.length}
                page={toolPage}
                onPageChange={(_, page) => setToolPage(page)}
                rowsPerPage={toolRowsPerPage}
                onRowsPerPageChange={(event) => { setToolRowsPerPage(Number(event.target.value)); setToolPage(0); }}
                rowsPerPageOptions={[20, 50, 100]}
                labelRowsPerPage="每页条数"
                labelDisplayedRows={({ from, to, count }) => `${from}-${to} / 共 ${count} 条`}
                sx={{ borderTop: "1px solid #eef2f7", "& .MuiTablePagination-toolbar": { minHeight: 48 }, "& p": { fontSize: "12px", color: "#64748b" } }}
              />
            </>
          )}
        </Paper>
      </Box>

      <Dialog open={categoryEditorOpen} onClose={() => setCategoryEditorOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontSize: "16px", fontWeight: 700 }}>{categoryEditorMode === "create" ? "新增工具分类" : "编辑工具分类"}</DialogTitle>
        <DialogContent>
          <TextField label="分类名称" value={categoryDraft} onChange={(event) => setCategoryDraft(event.target.value)} size="small" fullWidth sx={{ mt: 1 }} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setCategoryEditorOpen(false)} sx={{ textTransform: "none", color: "#64748b" }}>取消</Button>
          <Button onClick={saveCategory} variant="contained" sx={{ bgcolor: BLUE, textTransform: "none", boxShadow: "none" }}>保存</Button>
        </DialogActions>
      </Dialog>

      <Menu anchorEl={categoryMenuAnchor} open={Boolean(categoryMenuAnchor && categoryMenuTarget)} onClose={closeCategoryMenu} PaperProps={{ elevation: 0, sx: { mt: 1, borderRadius: "8px", border: "1px solid #e8eaed", boxShadow: "0 4px 16px rgba(0,0,0,0.06)", minWidth: 120 } }}>
        <MenuItem onClick={() => { if (categoryMenuTarget) openEditCategory(categoryMenuTarget); closeCategoryMenu(); }} sx={{ fontSize: "13px", color: "#374151", gap: 1.5, py: 1 }}>
          <Edit sx={{ fontSize: 16, color: BLUE }} />
          编辑
        </MenuItem>
        <MenuItem onClick={() => { if (categoryMenuTarget) deleteCategory(categoryMenuTarget); closeCategoryMenu(); }} sx={{ fontSize: "13px", color: "#ef4444", gap: 1.5, py: 1 }}>
          <Delete sx={{ fontSize: 16 }} />
          删除
        </MenuItem>
      </Menu>

      <Dialog
        open={addOpen}
        onClose={() => { setAddOpen(false); resetAddTool(); }}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: "12px", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" } }}
      >
        <DialogTitle sx={{ fontSize: "16px", fontWeight: 600, color: "#111827", px: 3, py: 2.5, borderBottom: "1px solid #e5e7eb" }}>
          {editingToolId ? "编辑工具" : "新建工具"}
        </DialogTitle>
        <DialogContent sx={{ px: 3, pt: 3, pb: 3 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {!editingToolId && (
              <Alert severity="info" sx={{ mb: 0.5, borderRadius: "8px", fontSize: "12px", color: "#1e40af", bgcolor: "#dbeafe", border: "1px solid #bfdbfe" }}>
                新建工具只需设置工具元信息，工具运行调用等信息，在工具版本中设置。
              </Alert>
            )}
            <TextField
              label="工具名称"
              value={newTool.name}
              onChange={(event) => setNewTool((prev) => ({ ...prev, name: event.target.value }))}
              size="small"
              fullWidth
              required
              placeholder="请输入工具名称"
              helperText="工具名称全局唯一"
              sx={{ "& .MuiInputBase-root": { borderRadius: "6px", fontSize: "14px" }, "& .MuiInputLabel-root": { fontSize: "14px" } }}
            />
            <TextField
              label="工具ID"
              value={newTool.toolCode}
              onChange={(event) => setNewTool((prev) => ({ ...prev, toolCode: event.target.value }))}
              size="small"
              fullWidth
              disabled={Boolean(editingToolId)}
              placeholder="不填则自动生成，如 ocr_scan"
              helperText={editingToolId ? "工具ID创建后不可修改" : "非必填；建议使用小写字母、数字和下划线"}
              sx={{ "& .MuiInputBase-root": { borderRadius: "6px", fontSize: "14px", fontFamily: "monospace" }, "& .MuiInputLabel-root": { fontSize: "14px" } }}
            />
            <TextField
              label="工具分类"
              value={newTool.category}
              onChange={(event) => setNewTool((prev) => ({ ...prev, category: event.target.value }))}
              size="small"
              fullWidth
              required
              select
              sx={{ "& .MuiInputBase-root": { borderRadius: "6px", fontSize: "14px" }, "& .MuiInputLabel-root": { fontSize: "14px" } }}
            >
              {categories.map((item) => <MenuItem key={item} value={item} sx={{ fontSize: "14px" }}>{item}</MenuItem>)}
            </TextField>
            <TextField
              label="能力摘要"
              value={newTool.capabilitySummary}
              onChange={(event) => setNewTool((prev) => ({ ...prev, capabilitySummary: event.target.value }))}
              size="small"
              fullWidth
              required
              multiline
              rows={2}
              placeholder="描述工具是做什么的"
              sx={{ "& .MuiInputBase-root": { borderRadius: "6px", fontSize: "14px" }, "& .MuiInputLabel-root": { fontSize: "14px" } }}
            />
            <TextField
              label="详细描述"
              value={newTool.detailedDescription}
              onChange={(event) => setNewTool((prev) => ({ ...prev, detailedDescription: event.target.value }))}
              size="small"
              fullWidth
              required
              multiline
              rows={4}
              placeholder="说明工具的能力边界"
              sx={{ "& .MuiInputBase-root": { borderRadius: "6px", fontSize: "14px" }, "& .MuiInputLabel-root": { fontSize: "14px" } }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, borderTop: "1px solid #e5e7eb", gap: 1 }}>
          <Button onClick={() => { setAddOpen(false); resetAddTool(); }} sx={{ textTransform: "none", color: "#64748b", borderRadius: "6px", fontSize: "13px", px: 2 }}>取消</Button>
          <Button onClick={() => saveNewTool(false)} variant="outlined" sx={{ textTransform: "none", borderRadius: "6px", fontSize: "13px", px: 2, color: "#374151", borderColor: "#e5e7eb", "&:hover": { borderColor: "#d1d5db", bgcolor: "#f9fafb" } }}>保存</Button>
          {!editingToolId && (
            <Button onClick={() => saveNewTool(true)} variant="contained" sx={{ bgcolor: BLUE, textTransform: "none", borderRadius: "6px", fontSize: "13px", px: 2, boxShadow: "none", "&:hover": { bgcolor: "#2563eb", boxShadow: "none" } }}>保存并创建版本</Button>
          )}
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(deleteConfirmToolId)}
        onClose={() => setDeleteConfirmToolId(null)}
        fullWidth
        maxWidth="xs"
        PaperProps={{ sx: { borderRadius: "12px", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" } }}
      >
        <DialogTitle sx={{ fontSize: "16px", fontWeight: 600, color: "#111827", px: 3, pt: 2.5, pb: 1 }}>
          确认删除？
        </DialogTitle>
        <DialogContent sx={{ px: 3, py: 3 }}>
          <Typography sx={{ fontSize: "14px", color: "#374151", lineHeight: 1.7 }}>
            删除后，该工具不再出现在工具库列表，也不可被 Agent 查询、调用或用于新 Liteflow；历史版本、调用记录和引用信息仍保留用于追溯，确定继续？
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pt: 0, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setDeleteConfirmToolId(null)} sx={{ textTransform: "none", color: "#64748b", borderRadius: "6px", fontSize: "13px", px: 2 }}>
            取消
          </Button>
          <Button onClick={confirmDeleteTool} variant="contained" sx={{ bgcolor: "#ef4444", textTransform: "none", borderRadius: "6px", fontSize: "13px", px: 2, boxShadow: "none", "&:hover": { bgcolor: "#dc2626", boxShadow: "none" } }}>
            确认删除
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export function ToolHubRunRecordsPage() {
  const [tools] = useState<ToolItem[]>(loadTools);
  const [serviceFilter, setServiceFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [toolFilter, setToolFilter] = useState("all");
  const [selectedRecordKey, setSelectedRecordKey] = useState<string | null>(null);
  const [recordPage, setRecordPage] = useState(0);
  const [recordRowsPerPage, setRecordRowsPerPage] = useState(20);

  const records = useMemo(() => {
    return tools
      .filter((tool) => !tool.deleted)
      .flatMap((tool) => {
        const toolRecords = RUN_RECORDS[tool.id] ?? [];
        return toolRecords.map((record) => ({
          tool,
          version: tool.versions.find((item) => item.version === record.version) ?? null,
          record,
        }));
      })
      .sort((a, b) => (b.record.startedAt || b.record.executedAt).localeCompare(a.record.startedAt || a.record.executedAt));
  }, [tools]);

  const toolOptions = useMemo(() => {
    return records
      .map(({ tool }) => tool)
      .filter((tool, index, list) => list.findIndex((item) => item.id === tool.id) === index)
      .filter((tool) => categoryFilter === "all" || tool.category === categoryFilter);
  }, [records, categoryFilter]);

  const categoryOptions = useMemo(() => Array.from(new Set(records.map(({ tool }) => tool.category))), [records]);
  const serviceOptions = useMemo(() => Array.from(new Set(records.map(({ record }) => getMcpServiceName(record)))), [records]);

  const scopedRecords = useMemo(() => (
    records
      .filter(({ record }) => serviceFilter === "all" || getMcpServiceName(record) === serviceFilter)
      .filter(({ tool }) => categoryFilter === "all" || tool.category === categoryFilter)
      .filter(({ tool }) => toolFilter === "all" || tool.id === toolFilter)
  ), [records, serviceFilter, categoryFilter, toolFilter]);

  const filteredRecords = scopedRecords;

  const stats = useMemo(() => ({
    total: scopedRecords.length,
    running: scopedRecords.filter(({ record }) => record.result === "运行中").length,
    success: scopedRecords.filter(({ record }) => record.result === "成功").length,
    failed: scopedRecords.filter(({ record }) => record.result === "失败").length,
  }), [scopedRecords]);

  const pagedRecords = useMemo(() => (
    filteredRecords.slice(recordPage * recordRowsPerPage, recordPage * recordRowsPerPage + recordRowsPerPage)
  ), [filteredRecords, recordPage, recordRowsPerPage]);

  const selectedRecord = useMemo(() => (
    records.find(({ tool, record }) => `${tool.id}-${record.id}` === selectedRecordKey) ?? null
  ), [records, selectedRecordKey]);

  const getRunRecordStartTime = (record: ToolRunRecord) => record.startedAt || record.executedAt;
  const getRunRecordEndTime = (record: ToolRunRecord) => record.finishedAt || (record.result === "运行中" ? "" : record.executedAt);
  const getRunRecordRequestAddress = (record: ToolRunRecord, version: ToolVersion | null) => {
    if (record.packageInfo) {
      const apiMatch = record.packageInfo.match(/API=([^；]+)/);
      return apiMatch?.[1] || record.packageInfo;
    }
    return version ? getVersionRequestAddress(version) : "未记录请求地址";
  };
  function getDuration(record: ToolRunRecord) {
    if (record.result === "运行中") return "进行中";
    const start = new Date(getRunRecordStartTime(record).replace(" ", "T")).getTime();
    const endValue = getRunRecordEndTime(record);
    const end = endValue ? new Date(endValue.replace(" ", "T")).getTime() : NaN;
    if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) return "-";
    const seconds = Math.max(1, Math.round((end - start) / 1000));
    if (seconds < 60) return `${seconds}s`;
    return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  }
  function getMcpServiceName(record: ToolRunRecord) {
    return record.type === "调试运行" ? "工具调试 MCP" : "知识工程 Agent MCP";
  }
  function getConnectorName(tool: ToolItem) {
    if (tool.category === "解析处理") return "文档解析 API";
    if (tool.category === "智能生成") return "知识生成 API";
    if (tool.category === "质量评估") return "质量评估 API";
    if (tool.category === "索引构建") return "索引构建 API";
    return "知识工程核心 API";
  }
  function formatTime(date: Date) {
    const pad = (value: number) => String(value).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  }
  function shiftTime(value: string, seconds: number) {
    const date = new Date(value.replace(" ", "T"));
    if (Number.isNaN(date.getTime())) return value;
    date.setSeconds(date.getSeconds() + seconds);
    return formatTime(date);
  }
  const CALLER_NODE_NAME = "调用方";
  const TOOL_EXECUTOR_NODE_NAME = "Tool Hub 工具执行层";
  function getApiNodeName(record: ToolRunRecord, version: ToolVersion | null) {
    const address = getRunRecordRequestAddress(record, version);
    try {
      const url = new URL(address);
      return `${url.hostname}${url.pathname}`;
    } catch {
      return address || "底层 API";
    }
  }
  function getApiPath(value: string) {
    try {
      return new URL(value).pathname;
    } catch {
      return value || "/";
    }
  }
  function getApiBaseUrl(value: string) {
    try {
      const url = new URL(value);
      return `${url.protocol}//${url.host}`;
    } catch {
      return value || "-";
    }
  }
  function compactJson(value: unknown) {
    return JSON.stringify(value);
  }
  function buildCallResponseInfo(item: { tool: ToolItem; version: ToolVersion | null; record: ToolRunRecord }) {
    const startAt = getRunRecordStartTime(item.record);
    const finishedAt = getRunRecordEndTime(item.record);
    const requestAddress = getRunRecordRequestAddress(item.record, item.version);
    const mcpRequest = compactJson({
      jsonrpc: "2.0",
      method: "tools/call",
      id: item.record.id,
      params: {
        name: item.tool.toolCode,
        arguments: {
          version: item.record.version,
          trace_id: item.record.id,
          request_payload: item.record.input,
        },
      },
    });
    const apiRequest = `${compactJson({
      method: "POST",
      url: requestAddress,
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer ****",
      },
    })}\n${item.record.input}`;
    const apiResponse = finishedAt
      ? item.record.output
      : compactJson({ status: "running", message: "底层 API 已接收请求，正在处理" });
    const mcpResponse = finishedAt
      ? compactJson({
          jsonrpc: "2.0",
          id: item.record.id,
          result: {
            content: [{ type: "json", text: item.record.output }],
            isError: item.record.result === "失败",
          },
        })
      : compactJson({ jsonrpc: "2.0", id: item.record.id, status: "pending", message: "等待底层 API 返回结果" });
    return [
      { title: "MCP 服务接收到的请求", time: startAt, content: mcpRequest },
      { title: "底层 API 收到的请求内容", time: shiftTime(startAt, 2), content: apiRequest },
      { title: "底层 API 响应结果", time: finishedAt ? shiftTime(finishedAt, -2) : "进行中", content: apiResponse },
      { title: "MCP 服务响应结果", time: finishedAt || "待返回", content: mcpResponse },
    ];
  }
  const ellipsisCell = (value: string, empty = "-", title?: string) => (
    <Tooltip title={title || value || empty} arrow placement="top">
      <Typography sx={{ fontSize: "12px", color: "#374151", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", cursor: "default" }}>
        {value || empty}
      </Typography>
    </Tooltip>
  );
  const detailSection = (title: string, children: ReactNode) => (
    <Paper sx={{ p: 2, border: "1px solid #e8eaed", borderRadius: "10px", boxShadow: "none" }}>
      <Typography sx={{ fontSize: "15px", fontWeight: 700, color: "#111827", mb: 1.5 }}>{title}</Typography>
      {children}
    </Paper>
  );
  const flowDiagram = (items: string[]) => (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap", mb: 1.5 }}>
      {items.map((item, index) => (
        <Fragment key={`${item}-${index}`}>
          <Chip label={item} size="small" sx={{ height: 26, fontSize: "12px", bgcolor: "#f1f5f9", color: "#334155" }} />
          {index < items.length - 1 ? <Typography sx={{ fontSize: "13px", color: "#94a3b8" }}>→</Typography> : null}
        </Fragment>
      ))}
    </Box>
  );
  const payloadCard = (item: { title: string; time: string; content: string }) => (
    <Paper key={item.title} sx={{ p: 1.5, border: "1px solid #eef2f7", borderRadius: "8px", boxShadow: "none", bgcolor: "#fff" }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1, mb: 1 }}>
        <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#111827" }}>{item.title}</Typography>
        <Typography sx={{ fontSize: "12px", color: "#94a3b8", flexShrink: 0 }}>{item.time}</Typography>
      </Box>
      <Box
        component="pre"
        sx={{
          m: 0,
          p: 1.25,
          minHeight: 96,
          bgcolor: "#0f172a",
          border: "1px solid #1e293b",
          borderRadius: "6px",
          color: "#dbeafe",
          fontSize: "12px",
          lineHeight: 1.6,
          whiteSpace: "pre-wrap",
          wordBreak: "break-all",
          fontFamily: 'Menlo, Monaco, Consolas, "Courier New", monospace',
        }}
      >
        {item.content}
      </Box>
    </Paper>
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0, maxWidth: "100%" }}>
      <Box>
        <Typography variant="h4" sx={{ fontSize: "22px", fontWeight: 700, color: "#111827" }}>
          调用记录
        </Typography>
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(140px, 1fr))", gap: 1.5 }}>
        {[
          { label: "调用总次数", value: stats.total, icon: <History />, color: "#334155" },
          { label: "调用中", value: stats.running, icon: <RocketLaunch />, color: "#1d4ed8" },
          { label: "成功", value: stats.success, icon: <CheckCircle />, color: "#15803d" },
          { label: "失败", value: stats.failed, icon: <FactCheck />, color: "#b91c1c" },
        ].map((item) => (
          <Paper key={item.label} sx={{ p: 2, borderRadius: "10px", border: "1px solid #e5e7eb", boxShadow: "none", display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box sx={{ width: 34, height: 34, borderRadius: "8px", bgcolor: "#eff6ff", color: BLUE, display: "flex", alignItems: "center", justifyContent: "center", "& svg": { fontSize: 18 } }}>
              {item.icon}
            </Box>
            <Box>
              <Typography sx={{ fontSize: "21px", fontWeight: 700, color: item.color, lineHeight: 1 }}>{item.value}</Typography>
              <Typography sx={{ fontSize: "12px", color: "#64748b", mt: 0.5 }}>{item.label}</Typography>
            </Box>
          </Paper>
        ))}
      </Box>

      <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", alignItems: "center" }}>
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <Select
            value={serviceFilter}
            onChange={(event) => {
              setServiceFilter(event.target.value);
              setRecordPage(0);
            }}
            sx={{ borderRadius: "8px", fontSize: "13px", bgcolor: "#fff", "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e8eaed" } }}
          >
            <MenuItem value="all" sx={{ fontSize: "13px" }}>全部 MCP 服务</MenuItem>
            {serviceOptions.map((service) => (
              <MenuItem key={service} value={service} sx={{ fontSize: "13px" }}>{service}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <Select
            value={categoryFilter}
            onChange={(event) => {
              setCategoryFilter(event.target.value);
              setToolFilter("all");
              setRecordPage(0);
            }}
            sx={{ borderRadius: "8px", fontSize: "13px", bgcolor: "#fff", "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e8eaed" } }}
          >
            <MenuItem value="all" sx={{ fontSize: "13px" }}>全部工具分类</MenuItem>
            {categoryOptions.map((category) => (
              <MenuItem key={category} value={category} sx={{ fontSize: "13px" }}>{category}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <Select
            value={toolFilter}
            onChange={(event) => {
              setToolFilter(event.target.value);
              setRecordPage(0);
            }}
            sx={{ borderRadius: "8px", fontSize: "13px", bgcolor: "#fff", "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e8eaed" } }}
          >
            <MenuItem value="all" sx={{ fontSize: "13px" }}>全部工具</MenuItem>
            {toolOptions.map((tool) => (
              <MenuItem key={tool.id} value={tool.id} sx={{ fontSize: "13px" }}>{tool.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Paper sx={{ border: "1px solid #e8eaed", borderRadius: "10px", boxShadow: "none", overflow: "hidden", width: "100%", maxWidth: "100%" }}>
        {filteredRecords.length === 0 ? (
          <Box sx={{ py: 10, textAlign: "center" }}>
            <History sx={{ fontSize: 42, color: "#e8eaed", mb: 1 }} />
            <Typography sx={{ fontSize: "14px", color: "#9ca3af" }}>当前筛选条件下暂无调用记录</Typography>
          </Box>
        ) : (
          <Box>
            <TableContainer sx={{ width: "100%", maxWidth: "100%", overflowX: "auto", overflowY: "hidden", display: "block", WebkitOverflowScrolling: "touch", "&::-webkit-scrollbar": { height: 12 }, "&::-webkit-scrollbar-track": { bgcolor: "#f1f5f9" }, "&::-webkit-scrollbar-thumb": { bgcolor: "#cbd5e1", borderRadius: 999, border: "3px solid #f1f5f9" }, "&::-webkit-scrollbar-thumb:hover": { bgcolor: "#94a3b8" } }}>
              <Table size="small" stickyHeader sx={{ minWidth: 980, tableLayout: "fixed" }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: "#f8f9fb" }}>
                    {[
                      ["调用时间", "160px"],
                      ["MCP 服务", "170px"],
                      ["工具名称", "190px"],
                      ["版本", "100px"],
                      ["调用状态", "100px"],
                      ["耗时", "90px"],
                      ["操作", "90px"],
                    ].map(([head, width]) => (
                      <TableCell key={head} sx={{ width, fontSize: "12px", fontWeight: 600, color: "#6b7280", py: 1.5, bgcolor: "#f8f9fb", borderBottom: "1px solid #f0f0f0", whiteSpace: "nowrap" }}>
                        {head}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pagedRecords.map(({ tool, version, record }, index) => {
                    const resultStyle = getRunResultStyle(record.result);
                    return (
                      <TableRow key={`${tool.id}-${record.id}`} sx={{ bgcolor: (recordPage * recordRowsPerPage + index) % 2 === 0 ? "#fff" : "#fafafa", "&:hover": { bgcolor: "#f6f9ff" }, "& td": { borderBottom: "1px solid #f5f5f5" } }}>
                        <TableCell sx={{ py: 1.5, fontSize: "12px", color: "#64748b", whiteSpace: "nowrap" }}>
                          {getRunRecordStartTime(record)}
                        </TableCell>
                        <TableCell sx={{ py: 1.5, minWidth: 0 }}>
                          {ellipsisCell(getMcpServiceName(record))}
                        </TableCell>
                        <TableCell sx={{ py: 1.5, minWidth: 0 }}>
                          {ellipsisCell(tool.name)}
                        </TableCell>
                        <TableCell sx={{ py: 1.5, fontSize: "12px", color: "#374151", whiteSpace: "nowrap" }}>
                          {record.version}
                        </TableCell>
                        <TableCell sx={{ py: 1.5 }}>
                          <Chip label={record.result} size="small" sx={{ maxWidth: "100%", height: 22, fontSize: "11px", bgcolor: resultStyle.bg, color: resultStyle.color, "& .MuiChip-label": { overflow: "hidden", textOverflow: "ellipsis" } }} />
                        </TableCell>
                        <TableCell sx={{ py: 1.5, fontSize: "12px", color: "#374151", whiteSpace: "nowrap" }}>
                          {getDuration(record)}
                        </TableCell>
                        <TableCell sx={{ py: 1.5 }}>
                          <Button size="small" variant="text" onClick={() => setSelectedRecordKey(`${tool.id}-${record.id}`)} sx={{ minWidth: 0, px: 1, fontSize: "12px" }}>
                            详情
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={filteredRecords.length}
              page={recordPage}
              onPageChange={(_, page) => setRecordPage(page)}
              rowsPerPage={recordRowsPerPage}
              onRowsPerPageChange={(event) => { setRecordRowsPerPage(Number(event.target.value)); setRecordPage(0); }}
              rowsPerPageOptions={[20, 50, 100]}
              labelRowsPerPage="每页条数"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} / 共 ${count} 条`}
              sx={{ borderTop: "1px solid #eef2f7", "& .MuiTablePagination-toolbar": { minHeight: 48 }, "& p": { fontSize: "12px", color: "#64748b" } }}
            />
          </Box>
        )}
      </Paper>

      <Drawer
        anchor="right"
        open={Boolean(selectedRecord)}
        onClose={() => setSelectedRecordKey(null)}
        PaperProps={{ sx: { width: 960, maxWidth: "92vw", p: 0, bgcolor: "#f8fafc", zIndex: 1900 } }}
        sx={{ zIndex: 1900 }}
      >
        {selectedRecord ? (
          <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
            <Box sx={{ p: 2.5, bgcolor: "#fff", borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 2 }}>
              <Box>
                <Typography sx={{ fontSize: "18px", fontWeight: 700, color: "#111827" }}>调用详情</Typography>
              </Box>
              <IconButton size="small" onClick={() => setSelectedRecordKey(null)}><Close fontSize="small" /></IconButton>
            </Box>
            <Box sx={{ p: 2.5, overflow: "auto", display: "flex", flexDirection: "column", gap: 2 }}>
              {detailSection("基本信息", (
                <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 1.5 }}>
                  {[
                    ["Trace ID", selectedRecord.record.id],
                    ["调用时间", getRunRecordStartTime(selectedRecord.record)],
                    ["MCP 服务", getMcpServiceName(selectedRecord.record)],
                    ["工具名称", selectedRecord.tool.name],
                    ["工具版本", selectedRecord.record.version],
                    ["连接器", getConnectorName(selectedRecord.tool)],
                    ["调用状态", selectedRecord.record.result],
                    ["耗时", getDuration(selectedRecord.record)],
                  ].map(([label, value]) => (
                    <Box key={label} sx={{ display: "grid", gridTemplateColumns: "88px minmax(0, 1fr)", alignItems: "start", gap: 1 }}>
                      <Typography sx={{ fontSize: "12px", color: "#94a3b8", lineHeight: "20px" }}>{label}</Typography>
                      <Typography sx={{ fontSize: "13px", color: "#111827", fontWeight: 500, lineHeight: "20px", wordBreak: "break-all" }}>{value}</Typography>
                    </Box>
                  ))}
                </Box>
              ))}

              {detailSection("调用响应信息", (
                <Box>
                  {flowDiagram([
                    CALLER_NODE_NAME,
                    getMcpServiceName(selectedRecord.record),
                    TOOL_EXECUTOR_NODE_NAME,
                    getApiNodeName(selectedRecord.record, selectedRecord.version),
                  ])}
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                    {buildCallResponseInfo(selectedRecord).map(payloadCard)}
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        ) : null}
      </Drawer>
    </Box>
  );
}

export function ToolHubDetailPage() {
  const navigate = useNavigate();
  const { toolId } = useParams();
  const [tools, setToolsState] = useState<ToolItem[]>(loadTools);
  const [categories] = useState<string[]>(loadCategories);
  const [selectedCategory, setSelectedCategory] = useState(loadSelectedCategory);
  const [versionCreateOpen, setVersionCreateOpen] = useState(false);
  const [versionDetailOpen, setVersionDetailOpen] = useState(false);
  const [debugDrawerOpen, setDebugDrawerOpen] = useState(false);
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);
  const [editingVersionId, setEditingVersionId] = useState<string | null>(null);
  const [debugVersionId, setDebugVersionId] = useState<string | null>(null);
  const [displayScene, setDisplayScene] = useState<"editable" | "readonly">("editable");
  const [displayPreviewTab, setDisplayPreviewTab] = useState<"editable" | "readonly">("editable");
  const [resultPreviewTab, setResultPreviewTab] = useState<"success" | "failed">("success");
  const [paramEditorOpen, setParamEditorOpen] = useState(false);
  const [editingParamIndex, setEditingParamIndex] = useState<number | null>(null);
  const [paramDraft, setParamDraft] = useState<RawInputParam>(createDefaultRawInputs()[0]);
  const [resultEditorOpen, setResultEditorOpen] = useState(false);
  const [editingResultIndex, setEditingResultIndex] = useState<number | null>(null);
  const [resultDraft, setResultDraft] = useState<RawResultField>(createDefaultRawResultFields()[0]);
  const [confirmCloseOpen, setConfirmCloseOpen] = useState(false);
  const [confirmDeleteParamIndex, setConfirmDeleteParamIndex] = useState<number | null>(null);
  const [confirmDeleteResultIndex, setConfirmDeleteResultIndex] = useState<number | null>(null);
  const [confirmDeleteVersionId, setConfirmDeleteVersionId] = useState<string | null>(null);
  const [confirmPublishVersionId, setConfirmPublishVersionId] = useState<string | null>(null);
  const [confirmStopVersionId, setConfirmStopVersionId] = useState<string | null>(null);
  const [blockedStopVersionId, setBlockedStopVersionId] = useState<string | null>(null);
  const [draggingUiFieldIndex, setDraggingUiFieldIndex] = useState<number | null>(null);
  const [draggingProgressNodeIndex, setDraggingProgressNodeIndex] = useState<number | null>(null);
  const [debugLoading, setDebugLoading] = useState(false);
  const [versionPage, setVersionPage] = useState(0);
  const [versionRowsPerPage, setVersionRowsPerPage] = useState(20);
  const [versionStatusFilter, setVersionStatusFilter] = useState<VersionStatus | "all">("all");
  const [runRecordsByTool, setRunRecordsByTool] = useState<Record<string, ToolRunRecord[]>>(RUN_RECORDS);
  const [versionDraft, setVersionDraft] = useState(createVersionDraft(null));
  const [operationPreviewValues, setOperationPreviewValues] = useState<OperationFieldValues>({});
  const [debugDraft, setDebugDraft] = useState({
    sampleFile: "",
    sampleText: "",
    debugNote: "",
    paramValues: {} as Record<string, string | string[] | boolean>,
    debugStatus: "not_started" as DebugStatus,
    debugResultSummary: "",
    debugResultPreview: "",
    debugRawOutput: "",
    debugErrorMessage: "",
    debugAdvice: "",
  });

  const setTools = (updater: ToolItem[] | ((prev: ToolItem[]) => ToolItem[])) => {
    setToolsState((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      saveTools(next);
      return next;
    });
  };

  const tool = useMemo(() => tools.find((item) => item.id === toolId) ?? null, [tools, toolId]);
  const versions = tool?.versions ?? [];
  const filteredVersions = useMemo(() => (
    versionStatusFilter === "all" ? versions : versions.filter((version) => version.status === versionStatusFilter)
  ), [versions, versionStatusFilter]);
  const pagedVersions = useMemo(() => (
    filteredVersions.slice(versionPage * versionRowsPerPage, versionPage * versionRowsPerPage + versionRowsPerPage)
  ), [filteredVersions, versionPage, versionRowsPerPage]);
  const selectedVersion = tool?.versions.find((version) => version.id === selectedVersionId) ?? null;
  const editingVersion = tool?.versions.find((version) => version.id === editingVersionId) ?? null;
  const debugVersion = tool?.versions.find((version) => version.id === debugVersionId) ?? null;
  const confirmPublishVersion = tool?.versions.find((version) => version.id === confirmPublishVersionId) ?? null;
  const confirmStopVersion = tool?.versions.find((version) => version.id === confirmStopVersionId) ?? null;
  const blockedStopVersion = tool?.versions.find((version) => version.id === blockedStopVersionId) ?? null;
  const categoryItems = useMemo(() => {
    const counts: Record<string, number> = {};
    tools.forEach((item) => {
      counts[item.category] = (counts[item.category] ?? 0) + 1;
    });
    return [
      { key: "all", label: "全部", count: tools.length },
      ...categories.map((category) => ({ key: category, label: category, count: counts[category] ?? 0 })),
    ];
  }, [categories, tools]);

  const setRecommended = (versionId: string) => {
    if (!tool) return;
    setTools((prev) => prev.map((item) => (
      item.id !== tool.id
        ? item
        : {
            ...item,
            versions: item.versions.map((version) => ({
              ...version,
              recommended: version.id === versionId,
            })),
          }
    )));
    toast.success("推荐版本已更新");
  };

  const resetVersionDraft = () => {
    setVersionDraft(createVersionDraft(tool));
    setOperationPreviewValues({});
    setDisplayScene("editable");
    setDisplayPreviewTab("editable");
    setResultPreviewTab("success");
  };

  const closeVersionEditor = () => {
    setVersionCreateOpen(false);
    setEditingVersionId(null);
    resetVersionDraft();
  };

  const openCreateVersion = () => {
    resetVersionDraft();
    setEditingVersionId(null);
    setVersionCreateOpen(true);
  };

  const openEditVersion = (versionId: string) => {
    const version = tool?.versions.find((item) => item.id === versionId);
    if (!version) return;
    if (version.status === "stopped") {
      toast.error("已停用版本不支持编辑");
      return;
    }
    setVersionDraft(createVersionDraftFromVersion(tool, version));
    setOperationPreviewValues({});
    setEditingVersionId(versionId);
    setDisplayScene("editable");
    setDisplayPreviewTab("editable");
    setResultPreviewTab("success");
    setVersionCreateOpen(true);
  };

  const openCopyVersion = (versionId: string) => {
    const version = tool?.versions.find((item) => item.id === versionId);
    if (!version) return;
    setVersionDraft({
      ...createVersionDraftFromVersion(tool, version),
      version: `${version.version}-副本`,
      dirty: true,
      savedAt: "",
    });
    setOperationPreviewValues({});
    setEditingVersionId(null);
    setDisplayScene("editable");
    setDisplayPreviewTab("editable");
    setResultPreviewTab("success");
    setVersionCreateOpen(true);
    toast.success("已复制版本配置，请确认版本号后创建");
  };

  const openVersionDetail = (versionId: string) => {
    setSelectedVersionId(versionId);
    setVersionDetailOpen(true);
  };

  const copyText = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label}已复制`);
    } catch {
      toast.error(`复制失败，请手动复制${label}`);
    }
  };

  const copyVersionCode = (versionCode: string) => copyText(versionCode, "版本ID");

  const openDebugDrawer = (versionId: string) => {
    const version = tool?.versions.find((item) => item.id === versionId);
    if (!version) return;
    const operationFields = (version.operationDisplay?.editableFields ?? []).filter((field) => field.uiComponent !== "不展示");
    setDebugVersionId(versionId);
    setDebugDraft({
      sampleFile: "",
      sampleText: "",
      debugNote: "",
      paramValues: Object.fromEntries(operationFields.map((field) => {
        const uiComponent = field.uiComponent || "单行文本";
        if (normalizeToolUiComponent(uiComponent) === "开关") return [field.id, true];
        if (uiComponent === "多选") return [field.id, Array.isArray(field.uiDefaultValue) ? field.uiDefaultValue : []];
        if (typeof field.uiDefaultValue === "string" && field.uiDefaultValue) return [field.id, field.uiDefaultValue];
        if (field.optionItems?.[0]?.value) return [field.id, field.optionItems[0].value];
        return [field.id, ""];
      })),
      debugStatus: version.debugStatus ?? "not_started",
      debugResultSummary: version.debugStatus === "success" ? "最近一次调试成功，版本已进入待发布。" : "",
      debugResultPreview: version.debugStatus === "success" ? JSON.stringify(version.resultConfig, null, 2) : "",
      debugRawOutput: version.debugStatus === "success" ? "mock 原始输出：执行成功，已返回结构化结果。" : "",
      debugErrorMessage: version.debugStatus === "failed" ? "mock 调试失败：样例输入与参数标准化配置不匹配" : "",
      debugAdvice: version.debugStatus === "success" ? "可返回版本列表执行发布。" : version.status === "pending" && version.debugStatus === "failed" ? "本次复测失败，版本仍保持待发布；可继续调试、编辑配置或提交发布。" : "",
    });
    setDebugDrawerOpen(true);
  };

  const updateDraft = (patch: Partial<typeof versionDraft>) => {
    setVersionDraft((prev) => ({ ...prev, ...patch, dirty: true }));
  };

  const updateModelDependency = (dependencyId: string, patch: Partial<ModelDependencyItem>) => {
    setVersionDraft((prev) => ({
      ...prev,
      modelDependencies: prev.modelDependencies.map((item) => (
        item.id === dependencyId ? { ...item, ...patch } : item
      )),
      dirty: true,
    }));
  };

  const addModelDependency = () => {
    setVersionDraft((prev) => ({
      ...prev,
      modelDependencies: [...prev.modelDependencies, createDefaultModelDependency(prev.modelDependencies.length + 1)],
      dirty: true,
    }));
  };

  const removeModelDependency = (dependencyId: string) => {
    setVersionDraft((prev) => ({
      ...prev,
      modelDependencies: prev.modelDependencies.filter((item) => item.id !== dependencyId),
      dirty: true,
    }));
  };

  const validateStep = (step: number, mode: "next" | "submit" = "next") => {
    if (!tool) return false;

    if (step === 0) {
      if (!versionDraft.version.trim()) {
        toast.error("请填写版本号");
        return false;
      }
      if (tool.versions.some((version) => version.id !== editingVersionId && version.version === versionDraft.version.trim())) {
        toast.error("版本号已存在");
        return false;
      }
    }

    if (step === 1) {
      if (!versionDraft.connectorId) {
        toast.error("请选择连接器");
        return false;
      }
      if (!versionDraft.httpPath.trim()) {
        toast.error("请填写接口路径");
        return false;
      }
      if (!versionDraft.httpMethod.trim()) {
        toast.error("请选择请求方式");
        return false;
      }
      if (!versionDraft.httpContentType.trim()) {
        toast.error("请填写 Content-Type");
        return false;
      }
      if (!versionDraft.httpTimeout.trim()) {
        toast.error("请填写调用超时");
        return false;
      }
    }

    if (step === 2) {
      if (versionDraft.rawInputParams.length === 0) {
        toast.error("请至少配置 1 个标准入参");
        return false;
      }

      for (const item of versionDraft.rawInputParams) {
        const paramName = (item.mappedParamName || item.sourceName).trim();
        if (!paramName) {
          toast.error("标准入参名称不能为空");
          return false;
        }
        if (!item.inputType) {
          toast.error("请选择入参类型");
          return false;
        }
        if (!item.description.trim()) {
          toast.error("入参说明不能为空");
          return false;
        }
      }
    }

    return true;
  };

  const applyRawInputParams = (nextRawInputs: RawInputParam[]) => {
    setVersionDraft((prev) => {
      const nextParams = buildVersionParamsFromRawInputs(nextRawInputs);
      return {
        ...prev,
        rawInputParams: nextRawInputs,
        params: nextParams,
        configFields: nextParams.map((param) => ({ name: param.paramName, type: param.paramType, value: param.defaultValue, editable: param.editableInOperation })),
        externalMappings: createDefaultExternalMappings(nextParams),
        operationDisplay: createDefaultOperationDisplay(nextParams, prev.resultConfig, prev.rawResultFields, prev.operationDisplay),
        dirty: true,
      };
    });
  };

  const addParamRow = () => {
    const nextIndex = versionDraft.rawInputParams.length + 1;
    const paramName = `param_${nextIndex}`;
    applyRawInputParams([
      ...versionDraft.rawInputParams,
      {
        id: `raw-${Date.now()}`,
        sourceName: paramName,
        inputType: "文本",
        required: false,
        description: "",
        passingMode: "HTTP JSON Body",
        handlingMode: "mapped",
        mappedParamName: paramName,
        mappedParamDescription: "",
        mappedDefaultValue: "",
        editableInOperation: true,
        validationRule: "",
        fixedValue: "",
        fixedValueDescription: "",
      },
    ]);
  };

  const updateParamRow = (paramId: string, patch: Partial<RawInputParam>) => {
    const nextRawInputs = versionDraft.rawInputParams.map((item) => {
      if (item.id !== paramId) return item;
      const nextName = patch.sourceName ?? patch.mappedParamName;
      return {
        ...item,
        ...patch,
        passingMode: "HTTP JSON Body",
        handlingMode: "mapped" as RawInputHandlingMode,
        ...(nextName !== undefined ? { sourceName: nextName, mappedParamName: nextName } : {}),
        ...(patch.description !== undefined ? { mappedParamDescription: patch.description } : {}),
        validationRule: "",
        fixedValue: "",
        fixedValueDescription: "",
      };
    });
    applyRawInputParams(nextRawInputs);
  };

  const deleteParamRow = (paramId: string) => {
    applyRawInputParams(versionDraft.rawInputParams.filter((item) => item.id !== paramId));
  };

  const openNewParam = () => {
    setEditingParamIndex(null);
    setParamDraft({
      id: `raw-${Date.now()}`,
      sourceName: "",
      inputType: "文本",
      required: false,
      description: "",
      passingMode: "HTTP JSON Body",
      handlingMode: "mapped",
      mappedParamName: "",
      mappedParamDescription: "",
      mappedDefaultValue: "",
      editableInOperation: true,
      validationRule: "",
      fixedValue: "",
      fixedValueDescription: "",
    });
    setParamEditorOpen(true);
  };

  const openEditParam = (index: number) => {
    setEditingParamIndex(index);
    setParamDraft({ ...versionDraft.rawInputParams[index] });
    setParamEditorOpen(true);
  };

  const saveParam = () => {
    const paramName = (paramDraft.mappedParamName || paramDraft.sourceName).trim();
    if (!paramName) {
      toast.error("请填写标准入参名称");
      return;
    }
    if (!paramDraft.inputType) {
      toast.error("请选择入参类型");
      return;
    }
    if (!paramDraft.description.trim()) {
      toast.error("请填写入参说明");
      return;
    }

    setVersionDraft((prev) => {
      const normalizedParamDraft: RawInputParam = {
        ...paramDraft,
        sourceName: paramName,
        passingMode: "HTTP JSON Body",
        handlingMode: "mapped",
        mappedParamName: paramName,
        mappedParamDescription: paramDraft.mappedParamDescription || paramDraft.description,
        fixedValue: "",
        fixedValueDescription: "",
      };
      const nextRawInputs = [...prev.rawInputParams];
      if (editingParamIndex === null) nextRawInputs.push(normalizedParamDraft);
      else nextRawInputs[editingParamIndex] = normalizedParamDraft;

      const nextParams = buildVersionParamsFromRawInputs(nextRawInputs);
      const nextConfigFields = nextParams.map((param) => ({ name: param.paramName, type: param.paramType, value: param.defaultValue, editable: param.editableInOperation }));
      return {
        ...prev,
        rawInputParams: nextRawInputs,
        params: nextParams,
        configFields: nextConfigFields,
        externalMappings: createDefaultExternalMappings(nextParams),
        operationDisplay: createDefaultOperationDisplay(nextParams, prev.resultConfig, prev.rawResultFields, prev.operationDisplay),
        dirty: true,
      };
    });
    setParamEditorOpen(false);
    toast.success("入参已保存");
  };

  const deleteParam = () => {
    if (confirmDeleteParamIndex === null) return;
    const nextRawInputs = versionDraft.rawInputParams.filter((_, index) => index !== confirmDeleteParamIndex);
    applyRawInputParams(nextRawInputs);
    setConfirmDeleteParamIndex(null);
    toast.success("入参已删除");
  };

  const applyRawResultFields = (nextRawResultFields: RawResultField[]) => {
    setVersionDraft((prev) => {
      const nextResultConfig = buildResultConfigFromRawResults(nextRawResultFields, tool?.name ?? "", prev.version);
      return {
        ...prev,
        rawResultFields: nextRawResultFields,
        resultConfig: nextResultConfig,
        operationDisplay: createDefaultOperationDisplay(prev.params, nextResultConfig, nextRawResultFields, prev.operationDisplay),
        dirty: true,
      };
    });
  };

  const openNewResultField = () => {
    setEditingResultIndex(null);
    setResultDraft({
      id: `result-${Date.now()}`,
      sourceField: "",
      fieldType: "文本",
      readMode: "HTTP 响应读取",
      requiredMode: "否",
      description: "",
      outputMapping: "主要结果内容",
    });
    setResultEditorOpen(true);
  };

  const addResultFieldRow = () => {
    const nextIndex = versionDraft.rawResultFields.length + 1;
    applyRawResultFields([
      ...versionDraft.rawResultFields,
      {
        id: `result-${Date.now()}`,
        sourceField: `result_${nextIndex}`,
        fieldType: "文本",
        readMode: "HTTP 响应读取",
        requiredMode: "否",
        description: "",
        outputMapping: "主要结果内容",
      },
    ]);
  };

  const updateResultFieldRow = (fieldId: string, patch: Partial<RawResultField>) => {
    applyRawResultFields(versionDraft.rawResultFields.map((item) => {
      if (item.id !== fieldId) return item;
      const nextFieldType = patch.fieldType ?? item.fieldType;
      return {
        ...item,
        ...patch,
        readMode: "HTTP 响应读取",
        outputMapping: patch.outputMapping ?? (nextFieldType === "错误信息" ? "错误信息" : nextFieldType === "文件" ? "文件或中间产物" : item.outputMapping || "主要结果内容"),
      };
    }));
  };

  const deleteResultFieldRow = (fieldId: string) => {
    applyRawResultFields(versionDraft.rawResultFields.filter((item) => item.id !== fieldId));
  };

  const openEditResultField = (index: number) => {
    setEditingResultIndex(index);
    setResultDraft({ ...versionDraft.rawResultFields[index] });
    setResultEditorOpen(true);
  };

  const saveResultField = () => {
    const sourceField = resultDraft.sourceField.trim();
    if (!sourceField) {
      toast.error("请填写标准返回字段");
      return;
    }
    if (versionDraft.rawResultFields.some((item, index) => index !== editingResultIndex && item.sourceField.trim() === sourceField)) {
      toast.error("标准返回字段名称重复");
      return;
    }
    if (!resultDraft.fieldType) {
      toast.error("请选择返回字段类型");
      return;
    }
    if (!resultDraft.requiredMode) {
      toast.error("请选择是否必返");
      return;
    }
    if (!resultDraft.description.trim()) {
      toast.error("请填写字段说明");
      return;
    }
    const normalizedDraft: RawResultField = {
      ...resultDraft,
      sourceField,
      readMode: resultDraft.readMode || "HTTP 响应读取",
      outputMapping: resultDraft.outputMapping || (resultDraft.fieldType === "错误信息" ? "错误信息" : resultDraft.fieldType === "文件" ? "文件或中间产物" : "主要结果内容"),
    };
    const nextFields = [...versionDraft.rawResultFields];
    if (editingResultIndex === null) nextFields.push(normalizedDraft);
    else nextFields[editingResultIndex] = normalizedDraft;
    applyRawResultFields(nextFields);
    setResultEditorOpen(false);
    toast.success("返回字段已保存");
  };

  const deleteResultField = () => {
    if (confirmDeleteResultIndex === null) return;
    const nextFields = versionDraft.rawResultFields.filter((_, index) => index !== confirmDeleteResultIndex);
    applyRawResultFields(nextFields);
    setConfirmDeleteResultIndex(null);
    toast.success("返回字段已删除");
  };

  const updateUiFieldComponent = (fieldId: string, uiComponent: ToolUiComponent) => {
    setVersionDraft((prev) => ({
      ...prev,
      operationDisplay: {
        ...prev.operationDisplay,
        editableFields: prev.operationDisplay.editableFields.map((field) => {
          if (field.id !== fieldId) return field;
          const isSelectable = SELECTABLE_UI_COMPONENTS.includes(uiComponent);
          const optionItems = isSelectable ? getUiOptions(field) : field.optionItems;
          const firstOptionValue = optionItems?.[0]?.value || "";
          return {
            ...field,
            uiComponent,
            optionItems,
            uiDefaultValue: isSelectable
              ? uiComponent === "多选"
                ? Array.isArray(field.uiDefaultValue)
                  ? field.uiDefaultValue
                  : firstOptionValue
                    ? [firstOptionValue]
                    : []
                : typeof field.uiDefaultValue === "string" && field.uiDefaultValue
                  ? field.uiDefaultValue
                  : firstOptionValue
              : field.uiDefaultValue,
          };
        }),
      },
      dirty: true,
    }));
  };

  const updateUiFieldDisplayName = (fieldId: string, displayName: string) => {
    setVersionDraft((prev) => ({
      ...prev,
      operationDisplay: {
        ...prev.operationDisplay,
        editableFields: prev.operationDisplay.editableFields.map((field) => (
          field.id === fieldId ? { ...field, displayName } : field
        )),
      },
      dirty: true,
    }));
  };

  const updateUiFieldOption = (fieldId: string, optionId: string, patch: Partial<ToolUiOption>) => {
    setVersionDraft((prev) => ({
      ...prev,
      operationDisplay: {
        ...prev.operationDisplay,
        editableFields: prev.operationDisplay.editableFields.map((field) => {
          if (field.id !== fieldId) return field;
          const currentOptions = getUiOptions(field);
          const oldOption = currentOptions.find((option) => option.id === optionId);
          const uiDefaultValue = patch.value && oldOption
            ? Array.isArray(field.uiDefaultValue)
              ? field.uiDefaultValue.map((value) => value === oldOption.value ? patch.value as string : value)
              : field.uiDefaultValue === oldOption.value
                ? patch.value
                : field.uiDefaultValue
            : field.uiDefaultValue;
          return {
            ...field,
            uiDefaultValue,
            optionItems: currentOptions.map((option) => (
              option.id === optionId ? { ...option, ...patch } : option
            )),
          };
        }),
      },
      dirty: true,
    }));
  };

  const addUiFieldOption = (fieldId: string) => {
    setVersionDraft((prev) => ({
      ...prev,
      operationDisplay: {
        ...prev.operationDisplay,
        editableFields: prev.operationDisplay.editableFields.map((field) => {
          if (field.id !== fieldId) return field;
          const optionItems = getUiOptions(field);
          const nextIndex = optionItems.length + 1;
          return {
            ...field,
            optionItems: [
              ...optionItems,
              {
                id: `${field.id}-opt-${Date.now()}`,
                label: `选项${nextIndex}`,
                value: `${field.sourceField}_option_${nextIndex}`,
              },
            ],
          };
        }),
      },
      dirty: true,
    }));
  };

  const deleteUiFieldOption = (fieldId: string, optionId: string) => {
    setVersionDraft((prev) => ({
      ...prev,
      operationDisplay: {
        ...prev.operationDisplay,
        editableFields: prev.operationDisplay.editableFields.map((field) => {
          if (field.id !== fieldId) return field;
          const optionItems = getUiOptions(field).filter((option) => option.id !== optionId);
          const removedValue = getUiOptions(field).find((option) => option.id === optionId)?.value;
          const uiDefaultValue = Array.isArray(field.uiDefaultValue)
            ? field.uiDefaultValue.filter((value) => value !== removedValue)
            : field.uiDefaultValue === removedValue
              ? optionItems[0]?.value || ""
              : field.uiDefaultValue;
          return { ...field, optionItems, uiDefaultValue };
        }),
      },
      dirty: true,
    }));
  };

  const moveUiField = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) return;
    setVersionDraft((prev) => {
      const nextFields = [...prev.operationDisplay.editableFields];
      const [moving] = nextFields.splice(fromIndex, 1);
      nextFields.splice(toIndex, 0, moving);
      return {
        ...prev,
        operationDisplay: {
          ...prev.operationDisplay,
          editableFields: nextFields.map((field, index) => ({ ...field, order: index + 1 })),
        },
        dirty: true,
      };
    });
  };

  const addProgressNode = () => {
    setVersionDraft((prev) => {
      const nextIndex = prev.progressNodes.length + 1;
      const nodeKey = `node_${nextIndex}`;
      return {
        ...prev,
        progressNodes: [
          ...prev.progressNodes,
          {
            id: `progress-${Date.now()}`,
            key: nodeKey,
            name: "",
            description: "",
            order: nextIndex,
            statuses: createDefaultProgressStatuses("", nodeKey),
          },
        ],
        dirty: true,
      };
    });
  };

  const updateProgressNode = (nodeId: string, patch: Partial<ProgressNodeConfig>) => {
    setVersionDraft((prev) => ({
      ...prev,
      progressNodes: prev.progressNodes.map((node) => (
        node.id === nodeId ? { ...node, ...patch } : node
      )),
      dirty: true,
    }));
  };

  const addProgressStatus = (nodeId: string) => {
    setVersionDraft((prev) => ({
      ...prev,
      progressNodes: prev.progressNodes.map((node) => {
        if (node.id !== nodeId) return node;
        const nextIndex = node.statuses.length + 1;
        return {
          ...node,
          statuses: [
            ...node.statuses,
	            {
	              id: `${node.id}-status-${Date.now()}`,
	              key: `custom_${nextIndex}`,
	              name: `自定义状态 ${nextIndex}`,
	              matchMode: "status",
	              rule: `custom_${nextIndex}`,
	              message: "",
	            },
          ],
        };
      }),
      dirty: true,
    }));
  };

  const updateProgressStatus = (nodeId: string, statusId: string, patch: Partial<ProgressStatusConfig>) => {
    setVersionDraft((prev) => ({
      ...prev,
      progressNodes: prev.progressNodes.map((node) => (
        node.id === nodeId
          ? { ...node, statuses: node.statuses.map((status) => status.id === statusId ? { ...status, ...patch } : status) }
          : node
      )),
      dirty: true,
    }));
  };

  const deleteProgressStatus = (nodeId: string, statusId: string) => {
    setVersionDraft((prev) => ({
      ...prev,
      progressNodes: prev.progressNodes.map((node) => (
        node.id === nodeId && node.statuses.length > 1
          ? { ...node, statuses: node.statuses.filter((status) => status.id !== statusId) }
          : node
      )),
      dirty: true,
    }));
  };

  const deleteProgressNode = (nodeId: string) => {
    setVersionDraft((prev) => ({
      ...prev,
      progressNodes: prev.progressNodes.length > 1
        ? prev.progressNodes
          .filter((node) => node.id !== nodeId)
          .map((node, index) => ({ ...node, order: index + 1 }))
        : prev.progressNodes,
      dirty: true,
    }));
  };

  const moveProgressNode = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) return;
    setVersionDraft((prev) => {
      const nextNodes = [...prev.progressNodes];
      const [moving] = nextNodes.splice(fromIndex, 1);
      nextNodes.splice(toIndex, 0, moving);
      return {
        ...prev,
        progressNodes: nextNodes.map((node, index) => ({ ...node, order: index + 1 })),
        dirty: true,
      };
    });
  };

  const startDebug = () => {
    if (!tool || !debugVersion) return;
    if (!debugVersion.versionDesc?.trim()) {
      toast.error("请先补全版本说明");
      return;
    }
    if (!debugVersion.params?.length) {
      toast.error("请先补全入参标准化配置");
      return;
    }
    const runId = `${tool.id}-debug-${Date.now()}`;
    const startedAt = "2026-05-13 16:18:00";
    const operationFields = (debugVersion.operationDisplay?.editableFields ?? []).filter((field) => field.uiComponent !== "不展示");
    const debugInputObject = Object.fromEntries(operationFields.map((field) => {
      const value = debugDraft.paramValues[field.id];
      const normalizedValue = Array.isArray(value) ? value : typeof value === "boolean" ? value : value || "";
      return [field.sourceField, normalizedValue];
    }));
    const requestAddress = getVersionRequestAddress(debugVersion);
    const debugInput = `mcp_request=${JSON.stringify({ method: "tools/call", params: { name: tool.toolCode, arguments: debugInputObject } })}`;
    const requestConfig = `method=${debugVersion.httpMethod || "POST"}；url=${requestAddress}；headers.Content-Type=${debugVersion.httpContentType || "application/json"}；auth=沿用连接器鉴权；timeout=${debugVersion.httpTimeout || "120"}s`;
    const isPendingBeforeDebug = debugVersion.status === "pending";

    setDebugLoading(true);
    setDebugDraft((prev) => ({ ...prev, debugStatus: "running" }));
    setRunRecordsByTool((prev) => ({
      ...prev,
      [tool.id]: [
        {
          id: runId,
          type: "调试运行",
          trigger: "当前调试用户",
          endpoint: "管理端",
          version: debugVersion.version,
          result: "运行中",
          startedAt,
          finishedAt: "",
          packageInfo: requestAddress,
          config: requestConfig,
          input: debugInput,
          output: `mcp_response=${JSON.stringify({ content: [{ type: "text", text: "工具调用测试运行中" }] })}`,
          flowTrace: getDebugFlowTrace("running"),
          executedAt: startedAt,
        },
        ...(prev[tool.id] ?? []),
      ],
    }));
    updateVersionStatus(debugVersion.id, isPendingBeforeDebug ? "pending" : "wait_debug");
    setTimeout(() => {
      const debugValuesText = Object.values(debugDraft.paramValues).map((value) => (
        Array.isArray(value) ? value.join(",") : String(value)
      )).join("；");
      const success = !debugValuesText.includes("失败") && !debugDraft.debugNote.includes("失败");
      setRunRecordsByTool((prev) => ({
        ...prev,
        [tool.id]: (prev[tool.id] ?? []).map((record) => (
          record.id === runId
            ? {
                ...record,
                result: success ? "成功" : "失败",
                finishedAt: success ? "2026-05-13 16:18:10" : "2026-05-13 16:18:08",
                flowTrace: getDebugFlowTrace(success ? "success" : "failed"),
                output: success
                  ? `mcp_response=${JSON.stringify({ content: [{ type: "text", text: "调试成功，底层 API 已返回有效结果" }], structuredContent: { status: "success", summary: "底层 API 调用成功", traceId: runId } })}`
                  : `mcp_response=${JSON.stringify({ isError: true, content: [{ type: "text", text: "样例输入与接口参数配置不匹配" }], structuredContent: { status: "failed", error: "invalid_request_body", traceId: runId } })}`,
              }
            : record
        )),
      }));
      setDebugDraft((prev) => ({
        ...prev,
        debugStatus: success ? "success" : "failed",
        debugResultSummary: success ? "调试成功，底层 API 已返回有效结果" : "",
        debugResultPreview: success ? JSON.stringify({ status: "success", summary: "底层 API 调用成功", traceId: runId }, null, 2) : "",
        debugRawOutput: success ? JSON.stringify({ code: 0, data: { summary: "底层 API 调用成功", items: [] } }, null, 2) : "",
        debugErrorMessage: success ? "" : "样例输入与接口参数配置不匹配",
        debugAdvice: success ? "版本已自动进入待发布，可返回版本列表执行发布。" : isPendingBeforeDebug ? "本次测试失败，版本仍保持待发布；可继续调整入参后重新测试。" : "建议调整调试入参或接口配置后重新测试。",
      }));
      updateVersionStatus(debugVersion.id, success || isPendingBeforeDebug ? "pending" : "wait_debug", success ? "success" : "failed");
      setDebugLoading(false);
      toast.success(success ? "调试成功，版本已进入待发布" : isPendingBeforeDebug ? "调试失败，版本仍保持待发布" : "调试失败，版本仍保持待调试");
    }, 1200);
  };

  const createVersion = () => {
    if (!tool) return;
    if (!validateStep(0) || !validateStep(1) || !validateStep(2, "submit")) return;
    const baseVersion = editingVersion;

    const selectedConnector = TOOL_VERSION_CONNECTORS.find((connector) => connector.id === versionDraft.connectorId) ?? TOOL_VERSION_CONNECTORS[0];
    const packageSummary = `连接器=${selectedConnector.name}；调用路径=${versionDraft.httpPath || ""}`;
    const runtimeSummary = `标准接口=${versionDraft.httpMethod} ${versionDraft.httpPath || "/"}；${versionDraft.asyncMode || "同步/异步均支持"}`;
    const versionNameSummary = versionDraft.versionName.trim() ? `版本名称=${versionDraft.versionName.trim()}` : `版本号=${versionDraft.version.trim()}`;
    const versionCode = baseVersion?.versionCode ?? ensureUniqueVersionCode(buildVersionCode(tool.toolCode, versionDraft.version.trim()), tool.versions, baseVersion?.id);
    const configFields = [
      { name: "版本名称", type: "文本", value: versionDraft.versionName.trim() || "-", editable: false },
      { name: "工具包获取", type: "文本", value: packageSummary, editable: false },
      { name: "运行配置", type: "文本", value: runtimeSummary, editable: false },
    ];

    const nextVersionStatus: VersionStatus = !baseVersion
      ? "wait_debug"
      : baseVersion.status === "pending"
        ? "wait_debug"
        : baseVersion.status;

    const versionItem = normalizeVersion({
      ...(baseVersion ?? {}),
      id: baseVersion?.id ?? `${tool.id}-${Date.now()}`,
      versionCode,
      version: versionDraft.version.trim(),
      status: nextVersionStatus,
      recommended: baseVersion?.recommended ?? false,
      lastDebug: baseVersion?.lastDebug ?? "",
      configFields,
      summary: [versionNameSummary, packageSummary, runtimeSummary].join("；"),
      versionDesc: versionDraft.versionDesc,
      applicableNote: versionDraft.applicableNote,
      supportFileTypes: versionDraft.supportFileTypes,
      supportKnowledgeTypes: versionDraft.supportKnowledgeTypes,
      callLimitNote: versionDraft.callLimitNote,
      recommendHint: versionDraft.recommendHint,
      callRule: versionDraft.callRule || "按版本调用配置和接口参数配置调用工具",
      inputMaterialTypes: versionDraft.inputMaterialTypes,
      supportSample: versionDraft.supportSample,
      supportBatch: versionDraft.supportBatch,
      preconditionNote: versionDraft.preconditionNote,
      failureAdvice: versionDraft.failureAdvice,
      callConstraintNote: versionDraft.callConstraintNote,
      params: versionDraft.params,
      rawInputParams: versionDraft.rawInputParams,
      inputSubmissionMode: versionDraft.inputSubmissionMode,
      inputSubmissionVariable: versionDraft.inputSubmissionVariable,
      inputSubmissionRule: versionDraft.inputSubmissionRule,
      externalMappings: versionDraft.externalMappings,
      resultConfig: versionDraft.resultConfig,
      rawResultFields: versionDraft.rawResultFields,
      outputReadStrategy: versionDraft.outputReadStrategy,
      outputStatusRule: versionDraft.outputStatusRule,
      outputResultLocation: versionDraft.outputResultLocation,
      outputErrorSource: versionDraft.outputErrorSource,
      operationDisplay: versionDraft.operationDisplay,
      progressNodes: versionDraft.progressNodes,
      debugStatus: "not_started",
      deliveryMethod: versionDraft.deliveryMethod,
      deliveryName: versionDraft.versionName.trim(),
      deliveryDesc: versionDraft.versionDesc,
      usageLimit: versionDraft.usageLimit,
      riskNote: versionDraft.riskNote,
      sampleMaterial: versionDraft.sampleMaterial,
      maintainer: versionDraft.maintainer,
      executionAccessMode: "external_http",
      connectorId: selectedConnector.id,
      connectorName: selectedConnector.name,
      connectorBaseUrlSnapshot: selectedConnector.baseUrl,
      connectorAuthType: selectedConnector.authType,
      serviceEnvironment: versionDraft.serviceEnvironment,
      httpContentType: versionDraft.httpContentType,
      httpAuthConfig: `沿用连接器鉴权：${selectedConnector.authType}`,
      asyncMode: versionDraft.asyncMode,
      callbackPolicy: versionDraft.callbackPolicy,
      callbackUrl: versionDraft.callbackUrl,
      resultPathStrategy: versionDraft.resultPathStrategy,
      asyncTaskIdField: versionDraft.asyncTaskIdField,
      progressStatusField: versionDraft.progressStatusField,
      resultFileField: versionDraft.resultFileField,
      functionListPath: versionDraft.functionListPath,
      externalServiceRemark: versionDraft.externalServiceRemark,
      packageFile: versionDraft.packageFile,
      packageName: versionDraft.packageFile || versionDraft.repoUrl,
      packageVersion: versionDraft.packageVersion,
      packageDesc: versionDraft.packageDesc,
      deploymentWorkdir: versionDraft.deploymentWorkdir,
      deploymentCommand: versionDraft.deploymentCommand,
      deploymentEnv: versionDraft.deploymentEnv,
      deploymentTimeout: versionDraft.deploymentTimeout,
      deploymentSuccessRule: versionDraft.deploymentSuccessRule,
      deploymentSuccessContent: versionDraft.deploymentSuccessContent,
      entryNote: versionDraft.entryNote,
      runtimeNote: versionDraft.runtimeNote,
      authNote: versionDraft.authNote,
      githubRepo: versionDraft.githubRepo,
      repoVisibility: versionDraft.repoVisibility,
      versionRefType: versionDraft.versionRefType,
      versionRef: versionDraft.versionRef,
      ossLicenseNote: versionDraft.ossLicenseNote,
      gitlabRepo: versionDraft.gitlabRepo,
      gitlabType: versionDraft.gitlabType,
      gitlabVisibility: versionDraft.gitlabVisibility,
      maintainTeam: versionDraft.maintainTeam,
      isDeployed: "yes",
      deployedServerAddress: versionDraft.deployedServerAddress,
      deployedDirectory: versionDraft.deployedDirectory,
      runtimeMode: "http",
      runtimeWorkdir: versionDraft.runtimeWorkdir,
      runtimeCommand: versionDraft.runtimeCommand,
      runtimeTimeout: versionDraft.runtimeTimeout,
      httpStartCommand: versionDraft.httpStartCommand,
      httpServiceAddress: selectedConnector.baseUrl,
      httpPort: versionDraft.httpPort,
      httpHealthcheck: versionDraft.httpHealthcheck,
      httpPath: versionDraft.httpPath,
      httpMethod: versionDraft.httpMethod,
      httpTimeout: versionDraft.httpTimeout,
      scriptWorkdir: versionDraft.scriptWorkdir,
      scriptEntryFile: versionDraft.scriptEntryFile,
      scriptEntryFunction: versionDraft.scriptEntryFunction,
      scriptTimeout: versionDraft.scriptTimeout,
      runtimeEnv: versionDraft.runtimeEnv,
      modelResourceRequired: "no",
      modelDependencies: [],
      lastRunAt: baseVersion?.lastRunAt ?? "",
      runCount: baseVersion?.runCount ?? 0,
      failureCount: baseVersion?.failureCount ?? 0,
      activePlanRefs: baseVersion?.activePlanRefs ?? 0,
      inactivePlanRefs: baseVersion?.inactivePlanRefs ?? 0,
      linkedPlanRefs: baseVersion?.linkedPlanRefs ?? 0,
      activePlanUsages: baseVersion?.activePlanUsages ?? [],
      createdBy: baseVersion?.createdBy ?? "工具维护人",
      createdAt: baseVersion?.createdAt ?? "2026-05-15 10:00:00",
      updatedAt: "2026-05-13 16:20:00",
    }, tool.name);

    setTools((prev) => prev.map((item) => (
      item.id !== tool.id ? item : {
        ...item,
        latestVersion: baseVersion ? item.latestVersion : versionItem.version,
        updatedAt: "2026-05-13 16:20:00",
        versions: baseVersion
          ? item.versions.map((version) => (version.id === baseVersion.id ? versionItem : version))
          : [versionItem, ...item.versions],
      }
    )));
    setVersionCreateOpen(false);
    setEditingVersionId(null);
    resetVersionDraft();
    toast.success(baseVersion ? "版本已更新" : "版本已创建");
  };

  const updateVersionStatus = (versionId: string, nextStatus: VersionStatus, nextDebugStatus?: DebugStatus) => {
    if (!tool) return;
    setTools((prev) => prev.map((item) => {
      if (item.id !== tool.id) return item;
      const nextVersions = item.versions.map((version) => (
        version.id === versionId
          ? {
              ...version,
              status: nextStatus,
              lastDebug: nextDebugStatus ? "2026-05-13 16:10:00" : version.lastDebug,
              debugStatus: nextDebugStatus ?? version.debugStatus,
            }
          : version
      ));
      return {
        ...item,
        status: nextVersions.some((version) => version.status === "published") ? "enabled" : item.status,
        versions: nextVersions,
      };
    }));
  };

  const confirmDeleteVersion = () => {
    if (!tool || !confirmDeleteVersionId) return;
    const deletingVersion = tool.versions.find((version) => version.id === confirmDeleteVersionId);
    if (!deletingVersion) return;

    setTools((prev) => prev.map((item) => {
      if (item.id !== tool.id) return item;
      const nextVersions = item.versions.filter((version) => version.id !== confirmDeleteVersionId);
      return {
        ...item,
        latestVersion: nextVersions[0]?.version ?? "-",
        versions: nextVersions,
      };
    }));
    setRunRecordsByTool((prev) => ({
      ...prev,
      [tool.id]: (prev[tool.id] ?? []).filter((record) => record.version !== deletingVersion.version),
    }));
    setConfirmDeleteVersionId(null);
    setSelectedVersionId((prev) => (prev === confirmDeleteVersionId ? null : prev));
    setDebugVersionId((prev) => (prev === confirmDeleteVersionId ? null : prev));
    setVersionPage(0);
    toast.success("版本已删除");
  };

  const confirmPublishVersionAction = () => {
    if (!confirmPublishVersion) return;
    updateVersionStatus(confirmPublishVersion.id, "published");
    setConfirmPublishVersionId(null);
    toast.success("版本已发布");
  };

  const confirmStopVersionAction = () => {
    if (!confirmStopVersion) return;
    updateVersionStatus(confirmStopVersion.id, "stopped");
    setConfirmStopVersionId(null);
    toast.success("版本已停用");
  };

  const versionActions = (version: ToolVersion) => {
    const editToDraft = () => {
      openEditVersion(version.id);
    };

    const publishVersion = () => {
      if (!tool || tool.status !== "enabled") {
        toast.error("工具未启用，暂不能发布版本");
        return;
      }
      setConfirmPublishVersionId(version.id);
    };

    const stopVersion = () => {
      if (isVersionUsedByRunningMcpService(version)) {
        setBlockedStopVersionId(version.id);
        return;
      }
      setConfirmStopVersionId(version.id);
    };

    const items: Array<{ label: string; onClick: () => void; color?: string }> = [
      { label: "详情", onClick: () => openVersionDetail(version.id) },
      { label: "复制", onClick: () => openCopyVersion(version.id) },
    ];

    if (version.status === "wait_debug") {
      items.push({ label: "编辑", onClick: editToDraft });
      items.push({ label: "调试", onClick: () => openDebugDrawer(version.id) });
    }

    if (version.status === "pending") {
      items.push({ label: "编辑", onClick: editToDraft });
      items.push({ label: "调试", onClick: () => openDebugDrawer(version.id) });
      items.push({ label: "发布", onClick: publishVersion });
    }

    if (version.status === "published" && !version.recommended) {
      items.push({ label: "推荐", onClick: () => setRecommended(version.id) });
    }

    if (version.status === "published") {
      items.push({ label: "停用", onClick: stopVersion });
    }

    if (DELETABLE_VERSION_STATUSES.includes(version.status)) {
      items.push({ label: "删除", color: "#ef4444", onClick: () => setConfirmDeleteVersionId(version.id) });
    }

    return items;
  };

  const debugOperationFields = (debugVersion?.operationDisplay?.editableFields ?? [])
    .filter((field) => field.uiComponent !== "不展示")
    .sort((a, b) => a.order - b.order);

  const getDebugDisplayValue = (field: OperationDisplayField) => {
    const value = debugDraft.paramValues[field.id];
    if (Array.isArray(value)) {
      const options = getUiOptions(field);
      const labels = options.filter((option) => value.includes(option.value)).map((option) => option.label);
      return labels.join("、") || "-";
    }
    if (typeof value === "boolean") return value ? "开启" : "关闭";
    return value || "-";
  };

  const debugProgressNodes = (debugVersion?.progressNodes ?? createDefaultProgressNodes(tool.name)).slice().sort((a, b) => a.order - b.order);

  const getDebugFlowTrace = (status: DebugStatus) => {
    const nodeStatusLabel: Record<"success" | "running" | "failed" | "pending", string> = {
      success: "成功",
      running: "处理中",
      failed: "失败",
      pending: "待执行",
    };
    return debugProgressNodes.map((node, index) => {
      const nodeState = status === "success"
        ? "success"
        : status === "failed"
          ? index < 2 ? "success" : index === 2 ? "failed" : "pending"
          : status === "running"
            ? index < 2 ? "success" : index === 2 ? "running" : "pending"
            : "pending";
      const time = nodeState === "pending" ? "-" : `16:${18 + index}:0${index}`;
      return `${node.order}.${node.name}=${nodeStatusLabel[nodeState]}(${time})`;
    }).join("；");
  };

  const getRunRecordPackageSnapshot = (version: ToolVersion) => {
    const packageInfo = getVersionPackageInfo(version);
    if (version.isDeployed === "no") {
      return `接入方式=${packageInfo.mode}；上传文件包=${version.packageFile || version.packageName || "-"}；部署目录=${version.deploymentWorkdir || "ToolHub 自动分配版本目录"}；部署命令=${version.deploymentCommand || "-"}；部署超时=${version.deploymentTimeout || "-"}秒`;
    }
    return `接入方式=${packageInfo.mode}；服务器地址=${version.deployedServerAddress || "-"}；工具包目录=${version.deployedDirectory || "-"}`;
  };

  const debugResultRows = debugDraft.debugStatus === "success"
    ? [
        ["运行结果", "成功"],
        ["结果摘要", debugDraft.debugResultSummary || "调试成功，底层 API 已返回有效结果"],
        ["耗时", "10.2 秒"],
        ["调用记录标识", `${debugVersion?.id ?? "debug"}-latest-run`],
      ]
    : debugDraft.debugStatus === "failed"
      ? [
          ["运行结果", "失败"],
          ["错误信息", debugDraft.debugErrorMessage || "样例输入与接口参数配置不匹配"],
          ["调整建议", debugDraft.debugAdvice || "建议调整调试入参或接口配置后重新测试。"],
        ]
      : [
          ["运行结果", debugDraft.debugStatus === "running" ? "运行中" : "未调试"],
          ["结果摘要", debugDraft.debugStatus === "running" ? "工具调用测试执行中，完成后展示响应结果。" : "发起测试后展示 MCP 与底层 API 的输入输出。"],
        ];

  const debugArguments = Object.fromEntries(debugOperationFields.map((field) => {
    const value = debugDraft.paramValues[field.id];
    const normalizedValue = Array.isArray(value) ? value : typeof value === "boolean" ? value : value || "";
    return [field.sourceField, normalizedValue];
  }));
  const debugApiRequest = {
    method: debugVersion?.httpMethod || "POST",
    url: debugVersion ? getVersionRequestAddress(debugVersion) : "-",
    headers: {
      "Content-Type": debugVersion?.httpContentType || "application/json",
      Authorization: "Bearer <connector-token>",
    },
    body: debugArguments,
  };
  const debugApiResponse = debugDraft.debugStatus === "failed"
    ? { code: 1, message: debugDraft.debugErrorMessage || "样例输入与接口参数配置不匹配", error: "invalid_request_body" }
    : debugDraft.debugStatus === "success"
      ? { code: 0, data: { summary: "底层 API 调用成功", items: [] } }
      : { status: debugDraft.debugStatus === "running" ? "running" : "not_started", message: debugDraft.debugStatus === "running" ? "请求已发送，等待响应" : "尚未发起测试" };
  const debugMcpResponse = debugDraft.debugStatus === "failed"
    ? { isError: true, content: [{ type: "text", text: debugDraft.debugErrorMessage || "样例输入与接口参数配置不匹配" }], structuredContent: { status: "failed", error: "invalid_request_body" } }
    : debugDraft.debugStatus === "success"
      ? { content: [{ type: "text", text: debugDraft.debugResultSummary || "调试成功，底层 API 已返回有效结果" }], structuredContent: JSON.parse(debugDraft.debugResultPreview || "{}") }
      : { content: [{ type: "text", text: debugDraft.debugStatus === "running" ? "工具调用测试运行中" : "尚未发起测试" }] };
  const debugCallDetails = [
    ["MCP 工具请求", { method: "tools/call", params: { name: tool.toolCode, arguments: debugArguments } }],
    ["底层 API 请求", debugApiRequest],
    ["底层 API 响应", debugApiResponse],
    ["MCP 响应结果", debugMcpResponse],
  ] as Array<[string, unknown]>;

  const getRunRecordVersion = (record: ToolRunRecord) => tool?.versions.find((version) => version.version === record.version);
  const getRunRecordStartTime = (record: ToolRunRecord) => record.startedAt || record.executedAt;
  const getRunRecordEndTime = (record: ToolRunRecord) => record.finishedAt || (record.result === "运行中" ? "" : record.executedAt);
  const getRunRecordRequestAddress = (record: ToolRunRecord) => {
    if (record.packageInfo) {
      const apiMatch = record.packageInfo.match(/API=([^；]+)/);
      return apiMatch?.[1] || record.packageInfo;
    }
    const recordVersion = getRunRecordVersion(record);
    return recordVersion ? getVersionRequestAddress(recordVersion) : "未记录请求地址";
  };
  const getRunRecordFlowTrace = (record: ToolRunRecord) => {
    if (record.flowTrace) return record.flowTrace;
    const recordVersion = getRunRecordVersion(record);
    const nodes = (recordVersion?.progressNodes ?? createDefaultProgressNodes(tool?.name ?? "")).slice().sort((a, b) => a.order - b.order);
    const statusText = record.result === "成功" ? "成功" : record.result === "失败" ? "失败" : "处理中";
    return nodes.map((node, index) => {
      const nodeStatus = record.result === "成功"
        ? "成功"
        : record.result === "失败"
          ? index === 0 ? "成功" : index === 1 ? "失败" : "待执行"
          : index === 0 ? "成功" : index === 1 ? "处理中" : "待执行";
      const time = nodeStatus === "待执行" ? "-" : index === 0 ? getRunRecordStartTime(record) : getRunRecordEndTime(record) || "进行中";
      return `${node.order}.${node.name}=${nodeStatus}(${time})`;
    }).join("；") || statusText;
  };

  const renderOperationCard = ({
    fields,
    versionLabel,
    values,
    onValueChange,
    emptyText,
  }: {
    fields: OperationDisplayField[];
    versionLabel: string;
    values?: OperationFieldValues;
    onValueChange?: (fieldId: string, value: OperationFieldValue) => void;
    emptyText: string;
  }) => {
    const visibleFields = fields.filter((field) => field.uiComponent !== "不展示");
    const renderFieldLabel = (field: OperationDisplayField) => (
      <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 0.25 }}>
        <Box component="span">{field.displayName}</Box>
        {field.required && <Box component="span" sx={{ color: "#ef4444" }}>*</Box>}
      </Box>
    );
    const readFieldValue = (field: OperationDisplayField, uiComponent: ToolUiComponent) => {
      const currentValue = values?.[field.id];
      if (currentValue !== undefined) return currentValue;
      if (uiComponent === "开关") return false;
      if (uiComponent === "多选") return [];
      return "";
    };

    return (
      <Box sx={{ p: 2, borderRadius: "8px", bgcolor: "#fff", border: "1px solid #e5e7eb", width: "100%" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5, flexWrap: "wrap" }}>
          <Typography sx={{ fontSize: "14px", fontWeight: 700, color: "#111827" }}>{tool?.name || "未命名工具"}</Typography>
          <Chip
            label={versionLabel || "未命名版本"}
            size="small"
            sx={{ height: 22, fontSize: "11px", bgcolor: "#eff6ff", color: BLUE, border: "1px solid #bfdbfe", "& .MuiChip-label": { px: 1 } }}
          />
        </Box>
        {visibleFields.length === 0 ? (
          <Box sx={{ p: 2, borderRadius: "8px", bgcolor: "#f8fafc", textAlign: "center" }}>
            <Typography sx={{ fontSize: "13px", color: "#64748b" }}>{emptyText}</Typography>
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {visibleFields.map((field) => {
              const uiComponent = normalizeToolUiComponent(field.uiComponent) || "单行文本";
              if (uiComponent === "开关") {
                return (
                  <FormControlLabel
                    key={field.id}
                    control={
                      <Switch
                        checked={Boolean(readFieldValue(field, uiComponent))}
                        onChange={(event) => onValueChange?.(field.id, event.target.checked)}
                        size="small"
                      />
                    }
                    label={renderFieldLabel(field)}
                  />
                );
              }
              if (uiComponent === "文件上传") {
                  const fileText = String(readFieldValue(field, uiComponent) || "选择或拖拽文件");
                return (
                  <Box key={field.id}>
                    <Typography sx={{ fontSize: "12px", color: "#64748b", mb: 0.75 }}>{renderFieldLabel(field)}</Typography>
                    <Box sx={{ border: "1px dashed #cbd5e1", borderRadius: "8px", bgcolor: "#f8fafc", p: 1.5, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1 }}>
                      <Typography sx={{ fontSize: "13px", color: "#64748b", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{fileText}</Typography>
                      <Button size="small" variant="outlined" onClick={() => onValueChange?.(field.id, "debug-sample.pdf")} sx={{ textTransform: "none", borderRadius: "6px", fontSize: "12px", flexShrink: 0 }}>上传</Button>
                    </Box>
                  </Box>
                );
              }
              if (uiComponent === "单选" || uiComponent === "多选") {
                const optionItems = getUiOptions(field);
                const rawValue = readFieldValue(field, uiComponent);
                const value = uiComponent === "多选" ? (Array.isArray(rawValue) ? rawValue : []) : String(rawValue || "");
                return (
                  <TextField
                    key={field.id}
                    select
                    required={field.required}
                    size="small"
                    label={field.displayName}
                    value={value}
                    onChange={(event) => onValueChange?.(field.id, event.target.value as string | string[])}
                    SelectProps={{
                      multiple: uiComponent === "多选",
                      renderValue: (selected) => {
                        const selectedValues = Array.isArray(selected) ? selected : [selected as string];
                        const selectedLabels = optionItems.filter((option) => selectedValues.includes(option.value)).map((option) => option.label);
                        return selectedLabels.join("、");
                      },
                      MenuProps: {
                        sx: { zIndex: SECONDARY_DRAWER_Z_INDEX + 10 },
                        PaperProps: { sx: { zIndex: SECONDARY_DRAWER_Z_INDEX + 10 } },
                      },
                    }}
                    sx={{ width: "100%", "& .MuiInputBase-root": { borderRadius: "6px", fontSize: "13px" }, "& .MuiInputLabel-root": { fontSize: "13px" } }}
                  >
                    {optionItems.map((option) => (
                      <MenuItem key={option.id} value={option.value} sx={{ fontSize: "13px" }}>{option.label}</MenuItem>
                    ))}
                  </TextField>
                );
              }
              const textValue = String(readFieldValue(field, uiComponent) ?? "");
              return (
                <TextField
                  key={field.id}
                  required={field.required}
                  size="small"
                  label={field.displayName}
                  type={uiComponent === "数字输入" ? "number" : "text"}
                  multiline={uiComponent === "多行文本" || uiComponent === "标签输入"}
                  rows={uiComponent === "多行文本" || uiComponent === "标签输入" ? 3 : 1}
                  value={textValue}
                  onChange={(event) => onValueChange?.(field.id, event.target.value)}
                  InputProps={{ readOnly: !onValueChange }}
                  sx={{ width: "100%", "& .MuiInputBase-root": { borderRadius: "6px", fontSize: "13px" }, "& .MuiInputLabel-root": { fontSize: "13px" } }}
                />
              );
            })}
          </Box>
        )}
      </Box>
    );
  };

  if (!tool) {
    return (
      <Box sx={{ display: "flex", height: "calc(100vh - 112px)", gap: 0, overflow: "hidden" }}>
        {dialogGlobalStyles}
        <Paper sx={{ width: 220, flexShrink: 0, border: "1px solid #e8eaed", borderRadius: "10px", boxShadow: "none", display: "flex", flexDirection: "column", mr: 2, overflow: "hidden" }}>
          <Box sx={{ p: 2, borderBottom: "1px solid #f0f0f0" }}>
            <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#374151" }}>工具分类</Typography>
          </Box>
          <List disablePadding sx={{ flex: 1, overflow: "auto", py: 0.5, px: 0.5 }}>
            {categoryItems.map((item) => (
              <ListItem key={item.key} disablePadding sx={{ mb: 0.25 }}>
                <ListItemButton onClick={() => navigate("/admin/tool-hub")} sx={{ borderRadius: "6px", py: 0.875, px: 1.25, minHeight: 40, "&:hover": { bgcolor: "#f5f7fb" } }}>
                  <ListItemText primary={<Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}><Typography sx={{ fontSize: "12px", color: "#374151" }}>{item.label}</Typography><Chip label={item.count} size="small" sx={{ height: 18, fontSize: "10px", minWidth: 24, bgcolor: "#f1f5f9", color: "#6b7280", border: "none", "& .MuiChip-label": { px: 0.5 } }} /></Box>} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Paper>
        <Paper sx={{ flex: 1, p: 4, border: "1px solid #e8eaed", borderRadius: "10px", boxShadow: "none" }}>
          <Typography sx={{ fontSize: "18px", fontWeight: 700, color: "#111827", mb: 1 }}>未找到工具</Typography>
          <Typography sx={{ fontSize: "13px", color: "#64748b", mb: 2 }}>当前工具可能不存在或已被移除。</Typography>
          <Button onClick={() => navigate("/admin/tool-hub")} sx={{ textTransform: "none", color: BLUE }}>
            返回工具列表
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", height: "calc(100vh - 112px)", gap: 0, overflow: "hidden" }}>
      {dialogGlobalStyles}
      <Paper sx={{ width: 220, flexShrink: 0, border: "1px solid #e8eaed", borderRadius: "10px", boxShadow: "none", display: "flex", flexDirection: "column", mr: 2, overflow: "hidden" }}>
        <Box sx={{ p: 2, borderBottom: "1px solid #f0f0f0" }}>
          <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#374151" }}>工具分类</Typography>
        </Box>
        <List disablePadding sx={{ flex: 1, overflow: "auto", py: 0.5, px: 0.5 }}>
          {categoryItems.map((item) => {
            const selected = selectedCategory === item.key;
            return (
              <ListItem key={item.key} disablePadding sx={{ mb: 0.25 }}>
                <ListItemButton
                  selected={selected}
                  onClick={() => {
                    setSelectedCategory(item.key);
                    saveSelectedCategory(item.key);
                    navigate("/admin/tool-hub");
                  }}
                  sx={{ borderRadius: "6px", py: 0.875, px: 1.25, minHeight: 40, "&.Mui-selected": { bgcolor: "#e8edf5" }, "&:hover": { bgcolor: "#f5f7fb" } }}
                >
                  <ListItemText primary={<Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}><Typography sx={{ fontSize: "12px", color: selected ? "#1e40af" : "#374151", fontWeight: selected ? 600 : 400 }}>{item.label}</Typography><Chip label={item.count} size="small" sx={{ height: 18, fontSize: "10px", minWidth: 24, bgcolor: selected ? "#dbeafe" : "#f1f5f9", color: selected ? "#1d4ed8" : "#6b7280", border: "none", "& .MuiChip-label": { px: 0.5 } }} /></Box>} />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Paper>

      <Box sx={{ flex: 1, minWidth: 0, minHeight: 0, overflow: "auto", pr: 0.5 }}>
      <Paper sx={{ mb: 2.5, border: "1px solid #e5e7eb", borderRadius: "10px", boxShadow: "none", overflow: "hidden" }}>
        <Box sx={{ p: 2.5 }}>
          <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 2 }}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.75 }}>
                <Typography sx={{ fontSize: "17px", fontWeight: 700, color: "#111827" }}>{tool.name}</Typography>
                <StatusChip status={tool.status} />
              </Box>
              <Typography sx={{ fontSize: "13px", color: "#6b7280", mb: 1 }}>{tool.capabilitySummary || tool.description}</Typography>
              <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                {[
                  { label: "工具ID", value: tool.toolCode },
                  { label: "工具分类", value: tool.category },
                  { label: "能力摘要", value: tool.capabilitySummary || tool.description },
                  { label: "详细描述", value: tool.detailedDescription || "待补充工具能力边界。" },
                ].map((item) => (
                  <Box key={item.label} sx={{ minWidth: 0, maxWidth: item.label === "详细描述" ? 420 : 220 }}>
                    <Typography sx={{ fontSize: "11px", color: "#9ca3af" }}>{item.label}</Typography>
                    <Typography sx={{ fontSize: "12px", color: "#374151", fontWeight: item.label === "工具分类" || item.label === "工具ID" ? 500 : 400, lineHeight: 1.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: item.label === "工具ID" ? "monospace" : "inherit" }} title={item.value}>{item.value}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>

          </Box>
        </Box>
      </Paper>

      <Paper sx={{ border: "1px solid #e8eaed", borderRadius: "10px", boxShadow: "none", overflow: "hidden" }}>
        <Box sx={{ px: 2, py: 1.5, borderBottom: "1px solid #eef2f7", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1.5 }}>
          <Typography sx={{ fontSize: "14px", fontWeight: 700, color: "#111827" }}>
            版本列表
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <FormControl size="small" sx={{ minWidth: 128 }}>
              <Select
                value={versionStatusFilter}
                onChange={(event) => { setVersionStatusFilter(event.target.value as VersionStatus | "all"); setVersionPage(0); }}
                sx={{ height: 34, borderRadius: "8px", fontSize: "13px", bgcolor: "#fff", "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e8eaed" } }}
              >
                <MenuItem value="all" sx={{ fontSize: "13px" }}>全部状态</MenuItem>
                <MenuItem value="wait_debug" sx={{ fontSize: "13px" }}>{VERSION_STATUS.wait_debug.label}</MenuItem>
                <MenuItem value="pending" sx={{ fontSize: "13px" }}>{VERSION_STATUS.pending.label}</MenuItem>
                <MenuItem value="published" sx={{ fontSize: "13px" }}>{VERSION_STATUS.published.label}</MenuItem>
                <MenuItem value="stopped" sx={{ fontSize: "13px" }}>{VERSION_STATUS.stopped.label}</MenuItem>
              </Select>
            </FormControl>
            <Button variant="contained" startIcon={<Add sx={{ fontSize: 14 }} />} onClick={openCreateVersion} sx={{ bgcolor: BLUE, borderRadius: "8px", textTransform: "none", fontSize: "13px", px: 2, boxShadow: "none", "&:hover": { bgcolor: "#2563eb", boxShadow: "none" } }}>
              新建版本
            </Button>
          </Box>
        </Box>

        <Box>
          <Box>
              {filteredVersions.length === 0 ? (
                <Box sx={{ py: 8, textAlign: "center" }}>
                  <History sx={{ fontSize: 40, color: "#e8eaed", mb: 1 }} />
                  <Typography sx={{ fontSize: "14px", color: "#9ca3af" }}>{tool.versions.length === 0 ? "当前工具还没有版本" : "当前筛选条件下暂无版本"}</Typography>
                </Box>
              ) : (
                <Box>
                  <TableContainer sx={{ overflowX: "hidden" }}>
                    <Table
                      size="small"
                      stickyHeader
                      sx={{
                        tableLayout: "fixed",
                        width: "100%",
                        minWidth: 0,
                        "& .MuiTableCell-root": { px: 1 },
                        "& .MuiTableCell-root:first-of-type": { pl: 2 },
                      }}
                    >
                      <TableHead>
                        <TableRow sx={{ bgcolor: "#f8f9fb" }}>
                          {[
                            ["版本号", "96px"],
                            ["状态", "82px"],
                            ["连接器", "128px"],
                            ["调用路径", "160px"],
                            ["关联MCP服务", "120px"],
                            ["最近调用", "122px"],
                            ["操作", "240px"],
                          ].map(([head, width]) => (
                            <TableCell key={head} sx={{ width, fontSize: "12px", fontWeight: 600, color: "#6b7280", py: 1.5, bgcolor: "#f8f9fb", borderBottom: "1px solid #f0f0f0", whiteSpace: "nowrap", textAlign: "left" }}>
                              {head}
                            </TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {pagedVersions.map((version, index) => {
                          const requestAddress = getVersionRequestAddress(version);
                          const associatedServiceNames = getAssociatedMcpServiceNames(version);
                          return (
                            <TableRow key={version.id} sx={{ bgcolor: (versionPage * versionRowsPerPage + index) % 2 === 0 ? "#fff" : "#fafafa", "&:hover": { bgcolor: "#f6f9ff" }, "& td": { borderBottom: "1px solid #f5f5f5" } }}>
                              <TableCell sx={{ py: 1.5, whiteSpace: "nowrap" }}>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                                  <Typography component="button" onClick={() => openVersionDetail(version.id)} sx={{ border: "none", p: 0, m: 0, bgcolor: "transparent", fontSize: "13px", color: "#111827", fontWeight: 500, cursor: "pointer", "&:hover": { color: BLUE, textDecoration: "underline" } }}>{version.version}</Typography>
                                  {version.recommended && (
                                    <Chip label="推荐" size="small" sx={{ height: 20, fontSize: "10px", bgcolor: "#eff6ff", color: "#1d4ed8", "& .MuiChip-label": { px: 0.75 } }} />
                                  )}
                                </Box>
                              </TableCell>
                              <TableCell sx={{ py: 1.5, textAlign: "left", pl: 2 }}>
                                <Box sx={{ display: "flex", justifyContent: "flex-start", alignItems: "center", width: "100%" }}>
                                  <VersionChip status={version.status} />
                                </Box>
                              </TableCell>
                              <TableCell sx={{ py: 1.5, minWidth: 0 }}>
                                <Typography sx={{ fontSize: "12px", color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={getVersionConnectorName(version)}>
                                  {getVersionConnectorName(version)}
                                </Typography>
                              </TableCell>
                              <TableCell sx={{ py: 1.5, minWidth: 0 }}>
                                <Typography sx={{ fontSize: "12px", color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: "monospace" }} title={requestAddress}>
                                  {version.httpMethod || "POST"} {version.httpPath || "-"}
                                </Typography>
                              </TableCell>
                              <Tooltip title={associatedServiceNames.length ? associatedServiceNames.join("、") : "暂无关联 MCP 服务"} arrow placement="top">
                                <TableCell sx={{ py: 1.5, fontSize: "12px", color: "#374151", whiteSpace: "nowrap", cursor: "help" }}>
                                  {associatedServiceNames.length}
                                </TableCell>
                              </Tooltip>
                              <TableCell sx={{ py: 1.5, fontSize: "12px", color: "#64748b", whiteSpace: "nowrap" }}>
                                {version.lastRunAt || "-"}
                              </TableCell>
                              <TableCell sx={{ py: 1.5 }}>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "nowrap" }}>
                                  {versionActions(version).map((action) => (
                                    <Typography key={`${version.id}-${action.label}`} component="button" onClick={action.onClick} sx={{ border: "none", p: 0, m: 0, bgcolor: "transparent", color: action.color ?? BLUE, fontSize: "12px", cursor: "pointer", whiteSpace: "nowrap" }}>
                                      {action.label}
                                    </Typography>
                                  ))}
                                </Box>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <TablePagination
                    component="div"
                    count={filteredVersions.length}
                    page={versionPage}
                    onPageChange={(_, page) => setVersionPage(page)}
                    rowsPerPage={versionRowsPerPage}
                    onRowsPerPageChange={(event) => { setVersionRowsPerPage(Number(event.target.value)); setVersionPage(0); }}
                    rowsPerPageOptions={[20, 50, 100]}
                    labelRowsPerPage="每页条数"
                    labelDisplayedRows={({ from, to, count }) => `${from}-${to} / 共 ${count} 条`}
                    sx={{ borderTop: "1px solid #eef2f7", "& .MuiTablePagination-toolbar": { minHeight: 48 }, "& p": { fontSize: "12px", color: "#64748b" } }}
                  />
                </Box>
              )}
            </Box>
        </Box>
      </Paper>

      <Dialog
        open={Boolean(confirmPublishVersionId)}
        onClose={() => setConfirmPublishVersionId(null)}
        fullWidth
        maxWidth="xs"
        PaperProps={{ sx: { borderRadius: "12px", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" } }}
      >
        <DialogTitle sx={{ fontSize: "16px", fontWeight: 600, color: "#111827", px: 3, pt: 2.5, pb: 1 }}>
          确认发布版本？
        </DialogTitle>
        <DialogContent sx={{ px: 3, py: 3 }}>
          <Typography sx={{ fontSize: "14px", color: "#374151", lineHeight: 1.7 }}>
            发布后，该版本就可被运营端正式查询和调用，确定发布？
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pt: 0, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setConfirmPublishVersionId(null)} sx={{ textTransform: "none", color: "#64748b", borderRadius: "6px", fontSize: "13px", px: 2 }}>
            取消
          </Button>
          <Button onClick={confirmPublishVersionAction} variant="contained" sx={{ bgcolor: BLUE, textTransform: "none", borderRadius: "6px", fontSize: "13px", px: 2, boxShadow: "none" }}>
            确认发布
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(confirmStopVersionId)}
        onClose={() => setConfirmStopVersionId(null)}
        fullWidth
        maxWidth="xs"
        PaperProps={{ sx: { borderRadius: "12px", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" } }}
      >
        <DialogTitle sx={{ fontSize: "16px", fontWeight: 600, color: "#111827", px: 3, pt: 2.5, pb: 1 }}>
          确认停用版本？
        </DialogTitle>
        <DialogContent sx={{ px: 3, py: 3 }}>
          <Typography sx={{ fontSize: "14px", color: "#374151", lineHeight: 1.7 }}>
            停用后该版本将不可再被运营端查询和使用，确定停用？
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pt: 0, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setConfirmStopVersionId(null)} sx={{ textTransform: "none", color: "#64748b", borderRadius: "6px", fontSize: "13px", px: 2 }}>
            取消
          </Button>
          <Button onClick={confirmStopVersionAction} variant="contained" sx={{ bgcolor: "#ef4444", textTransform: "none", borderRadius: "6px", fontSize: "13px", px: 2, boxShadow: "none", "&:hover": { bgcolor: "#dc2626", boxShadow: "none" } }}>
            确认停用
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(blockedStopVersionId)}
        onClose={() => setBlockedStopVersionId(null)}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: "12px", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" } }}
      >
        <DialogTitle sx={{ fontSize: "16px", fontWeight: 600, color: "#111827", px: 3, pt: 2.5, pb: 1 }}>
          当前版本不允许停用
        </DialogTitle>
        <DialogContent sx={{ px: 3, py: 3 }}>
          <Alert severity="warning" sx={{ borderRadius: "8px", mb: 2 }}>
            当前工具版本正在被运行中的 MCP 服务使用，请先调整相关绑定后再停用。
          </Alert>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {(blockedStopVersion ? getRunningMcpServiceNames(blockedStopVersion) : []).map((usage) => (
              <Box key={usage} sx={{ p: 1.25, borderRadius: "8px", border: "1px solid #e5e7eb", bgcolor: "#f9fafb" }}>
                <Typography sx={{ fontSize: "13px", color: "#374151" }}>{usage}</Typography>
              </Box>
            ))}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pt: 0, pb: 2.5 }}>
          <Button onClick={() => setBlockedStopVersionId(null)} variant="contained" sx={{ bgcolor: BLUE, textTransform: "none", borderRadius: "6px", fontSize: "13px", px: 2, boxShadow: "none" }}>
            我知道了
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(confirmDeleteVersionId)}
        onClose={() => setConfirmDeleteVersionId(null)}
        fullWidth
        maxWidth="xs"
        PaperProps={{ sx: { borderRadius: "12px", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" } }}
      >
        <DialogTitle sx={{ fontSize: "16px", fontWeight: 600, color: "#111827", px: 3, pt: 2.5, pb: 1 }}>
          确认删除版本？
        </DialogTitle>
        <DialogContent sx={{ px: 3, py: 3 }}>
          <Typography sx={{ fontSize: "14px", color: "#374151", lineHeight: 1.7 }}>
            删除版本将同步删除调用运行记录和处理结果，确定删除？
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pt: 0, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setConfirmDeleteVersionId(null)} sx={{ textTransform: "none", color: "#64748b", borderRadius: "6px", fontSize: "13px", px: 2 }}>
            取消
          </Button>
          <Button onClick={confirmDeleteVersion} variant="contained" sx={{ bgcolor: "#ef4444", textTransform: "none", borderRadius: "6px", fontSize: "13px", px: 2, boxShadow: "none", "&:hover": { bgcolor: "#dc2626", boxShadow: "none" } }}>
            确认删除
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={versionCreateOpen}
        onClose={() => (versionDraft.dirty ? setConfirmCloseOpen(true) : closeVersionEditor())}
        fullWidth
        maxWidth="lg"
        PaperProps={{ sx: { bgcolor: "#ffffff", borderRadius: "12px", overflow: "hidden", maxWidth: 960, boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" } }}
      >
        <DialogTitle sx={{ fontSize: "16px", fontWeight: 600, color: "#111827", px: 3, py: 2.5, borderBottom: "1px solid #e5e7eb", bgcolor: "#ffffff" }}>
          {editingVersionId ? "编辑工具版本" : "新增工具版本"}
        </DialogTitle>
        <DialogContent sx={{ px: 3, pt: 3, pb: 3, bgcolor: "#ffffff" }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Paper sx={{ p: 3, borderRadius: "8px", border: "1px solid #e5e7eb", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
              <Typography sx={{ fontSize: "16px", fontWeight: 600, color: "#111827", mb: 2 }}>基本信息</Typography>
              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
                <TextField
                  label="版本号"
                  size="small"
                  required
                  disabled={Boolean(editingVersionId)}
                  value={versionDraft.version}
                  onChange={(event) => updateDraft({ version: event.target.value })}
                  helperText={editingVersionId ? "版本号创建后不可修改" : "默认取两位版本号；首个版本默认为 1.0，后续基于最新版本号递增"}
                  sx={{ "& .MuiInputBase-root": { borderRadius: "6px", fontSize: "14px" }, "& .MuiInputLabel-root": { fontSize: "14px" } }}
                />
                <TextField
                  label="版本名称"
                  size="small"
                  value={versionDraft.versionName}
                  onChange={(event) => updateDraft({ versionName: event.target.value })}
                  sx={{ "& .MuiInputBase-root": { borderRadius: "6px", fontSize: "14px" }, "& .MuiInputLabel-root": { fontSize: "14px" } }}
                />
                <TextField
                  label="版本说明"
                  size="small"
                  multiline
                  rows={5}
                  value={versionDraft.versionDesc}
                  onChange={(event) => updateDraft({ versionDesc: event.target.value })}
                  sx={{ gridColumn: "1 / span 2", "& .MuiInputBase-root": { borderRadius: "6px", fontSize: "14px" }, "& .MuiInputLabel-root": { fontSize: "14px" } }}
                />
              </Box>
            </Paper>

            <Alert severity="info" sx={{ borderRadius: "8px", fontSize: "12px", py: 0.5 }}>
              工具版本绑定连接器并配置具体调用路径；版本发布后会冻结连接器快照，新版本发布不会影响旧版本绑定。
            </Alert>

            <Paper sx={{ p: 3, borderRadius: "8px", border: "1px solid #e5e7eb", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
              <Box sx={{ mb: 2 }}>
                <Box>
                  <Typography sx={{ fontSize: "16px", fontWeight: 600, color: "#111827" }}>调用配置</Typography>
                  <Typography sx={{ fontSize: "12px", color: "#6b7280", mt: 0.5 }}>选择已配置连接器，再设置当前版本使用的接口路径、请求方式和超时时间。</Typography>
                </Box>
              </Box>
              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
                      <TextField
                        select
                        label="连接器"
                        size="small"
                        required
                        value={versionDraft.connectorId}
                        onChange={(event) => {
                          const connector = TOOL_VERSION_CONNECTORS.find((item) => item.id === event.target.value);
                          updateDraft({
                            connectorId: event.target.value,
                            connectorName: connector?.name ?? "",
                            connectorBaseUrlSnapshot: connector?.baseUrl ?? "",
                            connectorAuthType: connector?.authType ?? "",
                            httpServiceAddress: connector?.baseUrl ?? "",
                            httpAuthConfig: connector ? `沿用连接器鉴权：${connector.authType}` : "",
                          });
                        }}
                        helperText="连接器维护 Base URL、鉴权和健康状态。"
                        sx={{ "& .MuiInputBase-root": { borderRadius: "6px", fontSize: "14px" }, "& .MuiInputLabel-root": { fontSize: "14px" } }}
                      >
                        {TOOL_VERSION_CONNECTORS.map((connector) => (
                          <MenuItem key={connector.id} value={connector.id} sx={{ fontSize: "14px" }}>{connector.name}</MenuItem>
                        ))}
                      </TextField>
                      <TextField label="工具调用接口路径" size="small" required value={versionDraft.httpPath} onChange={(event) => updateDraft({ httpPath: event.target.value })} helperText="如 /toolhub/v1/run" sx={{ "& .MuiInputBase-root": { borderRadius: "6px", fontSize: "14px" }, "& .MuiInputLabel-root": { fontSize: "14px" } }} />
                      <TextField select label="请求方式" size="small" required value={versionDraft.httpMethod} onChange={(event) => updateDraft({ httpMethod: event.target.value })} sx={{ "& .MuiInputBase-root": { borderRadius: "6px", fontSize: "14px" }, "& .MuiInputLabel-root": { fontSize: "14px" } }}>
                        {["POST", "GET"].map((item) => <MenuItem key={item} value={item} sx={{ fontSize: "14px" }}>{item}</MenuItem>)}
                      </TextField>
                      <TextField select label="Content-Type" size="small" required value={versionDraft.httpContentType} onChange={(event) => updateDraft({ httpContentType: event.target.value })} helperText="默认 application/json。" sx={{ "& .MuiInputBase-root": { borderRadius: "6px", fontSize: "14px" }, "& .MuiInputLabel-root": { fontSize: "14px" } }}>
                        {CONTENT_TYPE_OPTIONS.map((item) => <MenuItem key={item} value={item} sx={{ fontSize: "14px" }}>{item}</MenuItem>)}
                      </TextField>
                      <TextField label="调用超时" size="small" required value={versionDraft.httpTimeout} onChange={(event) => updateDraft({ httpTimeout: event.target.value })} helperText="单位：秒；超时后由 ToolHub 标记为失败。" sx={{ "& .MuiInputBase-root": { borderRadius: "6px", fontSize: "14px" }, "& .MuiInputLabel-root": { fontSize: "14px" } }} />
              </Box>
            </Paper>

            <Alert severity="info" sx={{ borderRadius: "8px", fontSize: "12px", py: 0.5 }}>
              工具 API 已按工具Hub协议完成标准化封装，本区域只配置工具对 Agent 暴露的入参；返回 Schema 由系统自动生成或在详情页只读展示。
            </Alert>
              <Paper sx={{ p: 3, borderRadius: "8px", border: "1px solid #e5e7eb", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                  <Box>
                    <Typography sx={{ fontSize: "16px", fontWeight: 600, color: "#111827" }}>标准入参</Typography>
                    <Typography sx={{ fontSize: "12px", color: "#6b7280", mt: 0.5 }}>
                      定义 Agent 或业务系统调用 ToolHub 时需要传入的标准参数。
                    </Typography>
                  </Box>
                  <Button onClick={addParamRow} variant="outlined" startIcon={<Add sx={{ fontSize: 14 }} />} sx={{ textTransform: "none", borderRadius: "6px", fontSize: "13px", px: 2, boxShadow: "none" }}>
                    新增标准入参
                  </Button>
                </Box>

                <TableContainer sx={{ border: "1px solid #e5e7eb", borderRadius: "8px", overflow: "hidden" }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: "#f8fafc" }}>
                        {["参数名称（字段名）", "类型", "是否必填", "参数说明", "默认值/示例值", "操作"].map((head) => (
                          <TableCell key={head} sx={{ fontSize: "11px", fontWeight: 600, color: "#64748b", py: 0.75, whiteSpace: "nowrap" }}>
                            {head}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {versionDraft.rawInputParams.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} sx={{ py: 3, textAlign: "center", fontSize: "13px", color: "#94a3b8" }}>
                            暂无标准入参，点击“新增标准入参”后手动配置。
                          </TableCell>
                        </TableRow>
                      )}
                      {versionDraft.rawInputParams.map((item) => {
                        const paramName = item.mappedParamName || item.sourceName;
                        return (
                          <TableRow key={item.id}>
                            <TableCell sx={{ width: "18%", py: 0.75 }}>
                              <TextField
                                size="small"
                                value={paramName}
                                onChange={(event) => updateParamRow(item.id, { sourceName: event.target.value, mappedParamName: event.target.value })}
                                sx={{ width: "100%", "& .MuiInputBase-root": { borderRadius: "6px", fontSize: "12px" } }}
                              />
                            </TableCell>
                            <TableCell sx={{ width: 120, py: 0.75 }}>
                              <TextField
                                select
                                size="small"
                                value={item.inputType}
                                onChange={(event) => updateParamRow(item.id, { inputType: event.target.value as RawInputType })}
                                sx={{ width: "100%", "& .MuiInputBase-root": { borderRadius: "6px", fontSize: "12px" } }}
                              >
                                {RAW_INPUT_TYPE_OPTIONS.map((option) => (
                                  <MenuItem key={option} value={option} sx={{ fontSize: "13px" }}>{option}</MenuItem>
                                ))}
                              </TextField>
                            </TableCell>
                            <TableCell sx={{ width: 104, py: 0.75 }}>
                              <TextField
                                select
                                size="small"
                                value={item.required ? "yes" : "no"}
                                onChange={(event) => updateParamRow(item.id, { required: event.target.value === "yes" })}
                                sx={{ width: "100%", "& .MuiInputBase-root": { borderRadius: "6px", fontSize: "12px" } }}
                              >
                                <MenuItem value="yes" sx={{ fontSize: "13px" }}>是</MenuItem>
                                <MenuItem value="no" sx={{ fontSize: "13px" }}>否</MenuItem>
                              </TextField>
                            </TableCell>
                            <TableCell sx={{ py: 0.75 }}>
                              <TextField
                                size="small"
                                value={item.description}
                                onChange={(event) => updateParamRow(item.id, { description: event.target.value })}
                                sx={{ width: "100%", "& .MuiInputBase-root": { borderRadius: "6px", fontSize: "12px" } }}
                              />
                            </TableCell>
                            <TableCell sx={{ width: "16%", py: 0.75 }}>
                              <TextField
                                size="small"
                                value={item.mappedDefaultValue}
                                onChange={(event) => updateParamRow(item.id, { mappedDefaultValue: event.target.value })}
                                sx={{ width: "100%", "& .MuiInputBase-root": { borderRadius: "6px", fontSize: "12px" } }}
                              />
                            </TableCell>
                            <TableCell sx={{ width: 56, py: 0.75 }}>
                              <IconButton size="small" onClick={() => deleteParamRow(item.id)}>
                                <Delete sx={{ fontSize: 16 }} />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>

            </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, borderTop: "1px solid #e5e7eb", justifyContent: "flex-end", gap: 1 }}>
          <Button onClick={() => (versionDraft.dirty ? setConfirmCloseOpen(true) : closeVersionEditor())} sx={{ textTransform: "none", color: "#64748b", borderRadius: "6px", fontSize: "13px", px: 2 }}>取消</Button>
          <Button onClick={createVersion} variant="contained" sx={{ bgcolor: BLUE, textTransform: "none", borderRadius: "6px", fontSize: "13px", px: 2, boxShadow: "none", "&:hover": { bgcolor: "#2563eb", boxShadow: "none" } }}>{editingVersionId ? "保存版本" : "创建版本"}</Button>
        </DialogActions>
      </Dialog>

      <Drawer
        anchor="right"
        open={versionDetailOpen}
        onClose={() => setVersionDetailOpen(false)}
        ModalProps={{ sx: { zIndex: SECONDARY_DRAWER_Z_INDEX } }}
        slotProps={{ backdrop: { sx: { position: "fixed", inset: 0, zIndex: SECONDARY_DRAWER_Z_INDEX, bgcolor: "rgba(17, 24, 39, 0.48)" } } }}
        PaperProps={{ sx: { width: 1040, maxWidth: "92vw", p: 0, bgcolor: "#f8fafc", zIndex: SECONDARY_DRAWER_Z_INDEX + 1 } }}
      >
        {selectedVersion && (() => {
	          const versionName = selectedVersion.deliveryName || selectedVersion.configFields.find((field) => field.name === "版本名称")?.value || "-";
	          const versionCode = selectedVersion.versionCode || buildVersionCode(tool.toolCode, selectedVersion.version);
	          const detailBlock = (title: string, rows: Array<[string, ReactNode]>) => (
            <Paper sx={{ p: 2, borderRadius: "8px", border: "1px solid #e5e7eb", boxShadow: "none", bgcolor: "#fff" }}>
              <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#111827", mb: 1.25 }}>{title}</Typography>
              <Box sx={{ display: "grid", gridTemplateColumns: "128px minmax(0, 1fr)", rowGap: 0.75, columnGap: 1.5 }}>
                {rows.map(([label, value]) => (
                  <Fragment key={`${title}-${label}`}>
                    <Typography sx={{ fontSize: "12px", color: "#64748b", lineHeight: 1.7 }}>{label}</Typography>
                    <Typography sx={{ fontSize: "12px", color: "#111827", lineHeight: 1.7, wordBreak: "break-all" }}>{value || "-"}</Typography>
                  </Fragment>
                ))}
              </Box>
            </Paper>
          );

          return (
            <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
              <Box sx={{ p: 2.5, bgcolor: "#fff", borderBottom: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 2 }}>
                <Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.75 }}>
                    <Typography sx={{ fontSize: "18px", fontWeight: 700, color: "#111827" }}>{selectedVersion.version}</Typography>
                    <VersionChip status={selectedVersion.status} />
                    {selectedVersion.recommended && <Chip label="推荐版本" size="small" sx={{ height: 22, fontSize: "11px", bgcolor: "#eff6ff", color: "#1d4ed8" }} />}
                  </Box>
                  <Typography sx={{ fontSize: "12px", color: "#64748b" }}>{selectedVersion.versionDesc || selectedVersion.summary}</Typography>
                </Box>
                <IconButton size="small" onClick={() => setVersionDetailOpen(false)}>
                  <Close sx={{ fontSize: 18, color: "#94a3b8" }} />
                </IconButton>
              </Box>

              <Box sx={{ p: 2.5, overflow: "auto", display: "flex", flexDirection: "column", gap: 2 }}>
              {detailBlock("基本信息", [
                ["版本ID", (
                  <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.75 }}>
                    <Box component="span" sx={{ fontFamily: "monospace", color: "#1e3a8a", fontWeight: 600 }}>{versionCode}</Box>
                    <IconButton size="small" onClick={() => copyVersionCode(versionCode)} sx={{ p: 0.25, color: BLUE }}>
                      <ContentCopy sx={{ fontSize: 14 }} />
                    </IconButton>
                  </Box>
                )],
                ["版本名称", versionName],
                ["版本状态", VERSION_STATUS[selectedVersion.status].label],
                ["推荐版本", selectedVersion.recommended ? "是" : "否"],
                ["版本描述", selectedVersion.versionDesc || selectedVersion.summary],
                ["创建人", selectedVersion.createdBy || "-"],
                ["创建时间", selectedVersion.createdAt || "-"],
              ])}

              {detailBlock("调用配置", [
                ["连接器", getVersionConnectorName(selectedVersion)],
                ["Base URL 快照", selectedVersion.connectorBaseUrlSnapshot || selectedVersion.httpServiceAddress || "-"],
                ["接口路径", selectedVersion.httpPath || "-"],
                ["请求方式", selectedVersion.httpMethod || "-"],
                ["鉴权方式", selectedVersion.connectorAuthType || "沿用连接器鉴权"],
                ["超时时间", `${selectedVersion.httpTimeout || "-"} 秒`],
              ])}

              {detailBlock("引用关系", [
                ["关联 MCP 服务", getAssociatedMcpServiceNames(selectedVersion).length > 0 ? getAssociatedMcpServiceNames(selectedVersion).join("、") : "暂无关联服务"],
              ])}

              <Paper sx={{ p: 2, borderRadius: "8px", border: "1px solid #e5e7eb", boxShadow: "none", bgcolor: "#fff" }}>
                <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#111827" }}>标准入参</Typography>
                <Typography sx={{ fontSize: "12px", color: "#6b7280", mt: 0.5, mb: 1.25 }}>
                  定义 Agent 调用 ToolHub 时需要传入的标准参数。
                </Typography>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      {["参数名称（字段名）", "类型", "是否必填", "参数说明", "默认值/示例值"].map((head) => (
                        <TableCell key={head} sx={{ fontSize: "12px", color: "#6b7280", fontWeight: 600, bgcolor: "#f9fafb" }}>{head}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(selectedVersion.rawInputParams ?? []).map((item) => (
                      <TableRow key={item.id}>
                        <TableCell sx={{ fontSize: "12px", color: "#111827" }}>{item.handlingMode === "mapped" ? item.mappedParamName || item.sourceName : item.sourceName}</TableCell>
                        <TableCell sx={{ fontSize: "12px", color: "#374151" }}>{item.inputType}</TableCell>
                        <TableCell sx={{ fontSize: "12px", color: "#374151" }}>{item.required ? "是" : "否"}</TableCell>
                        <TableCell sx={{ fontSize: "12px", color: "#374151" }}>{item.mappedParamDescription || item.description}</TableCell>
                        <TableCell sx={{ fontSize: "12px", color: "#374151", wordBreak: "break-all" }}>{item.mappedDefaultValue || "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Paper>

              <Paper sx={{ p: 2, borderRadius: "8px", border: "1px solid #e5e7eb", boxShadow: "none", bgcolor: "#fff" }}>
                <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#111827" }}>返回 Schema</Typography>
                  <Typography sx={{ fontSize: "12px", color: "#6b7280", mt: 0.5, mb: 1.25 }}>
                    由 OpenAPI 响应结构或调试结果自动生成，仅用于查看；未识别时按原始响应返回。
                  </Typography>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      {["字段路径", "类型", "生成来源", "字段说明"].map((head) => (
                        <TableCell key={head} sx={{ fontSize: "12px", color: "#6b7280", fontWeight: 600, bgcolor: "#f9fafb" }}>{head}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(selectedVersion.rawResultFields ?? []).length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} sx={{ py: 3, textAlign: "center", fontSize: "13px", color: "#94a3b8" }}>
                          暂未识别返回 Schema，工具调用结果将按原始响应返回。
                        </TableCell>
                      </TableRow>
                    ) : (
                      (selectedVersion.rawResultFields ?? []).map((item) => (
                        <TableRow key={item.id}>
                          <TableCell sx={{ fontSize: "12px", color: "#111827" }}>{item.sourceField}</TableCell>
                          <TableCell sx={{ fontSize: "12px", color: "#374151" }}>{item.fieldType}</TableCell>
                          <TableCell sx={{ fontSize: "12px", color: "#374151" }}>OpenAPI 自动生成</TableCell>
                          <TableCell sx={{ fontSize: "12px", color: "#374151" }}>{item.description}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </Paper>
              </Box>
            </Box>
          );
        })()}
      </Drawer>

      <Drawer
        anchor="right"
        open={debugDrawerOpen}
        onClose={() => setDebugDrawerOpen(false)}
        ModalProps={{ sx: { zIndex: SECONDARY_DRAWER_Z_INDEX } }}
        slotProps={{ backdrop: { sx: { position: "fixed", inset: 0, zIndex: SECONDARY_DRAWER_Z_INDEX, bgcolor: "rgba(17, 24, 39, 0.48)" } } }}
        PaperProps={{ sx: { width: 960, maxWidth: "92vw", p: 3, bgcolor: "#f8fafc", zIndex: SECONDARY_DRAWER_Z_INDEX + 1 } }}
      >
        {debugVersion && (
          <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
              <Box>
                <Typography sx={{ fontSize: "18px", fontWeight: 700, color: "#111827" }}>工具调用测试</Typography>
              </Box>
              <IconButton size="small" onClick={() => setDebugDrawerOpen(false)}>
                <Close sx={{ fontSize: 18, color: "#94a3b8" }} />
              </IconButton>
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, flex: 1, overflow: "auto" }}>
              {renderOperationCard({
                fields: debugOperationFields,
                versionLabel: debugVersion.version,
                values: debugDraft.paramValues,
                onValueChange: (fieldId, value) => setDebugDraft((prev) => ({ ...prev, paramValues: { ...prev.paramValues, [fieldId]: value } })),
                emptyText: "当前版本没有配置可调试的操作字段",
              })}

              <Paper sx={{ p: 2, borderRadius: "10px", border: "1px solid #e5e7eb", boxShadow: "none" }}>
                {debugLoading && <LinearProgress sx={{ mb: 1.5 }} />}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                  <Typography sx={{ fontSize: "14px", fontWeight: 700 }}>调试结果</Typography>
                  <Chip label={debugDraft.debugStatus === "not_started" ? "未调试" : debugDraft.debugStatus === "running" ? "运行中" : debugDraft.debugStatus === "success" ? "成功" : "失败"} size="small" sx={{ height: 22, fontSize: "11px", bgcolor: debugDraft.debugStatus === "success" ? "#dcfce7" : debugDraft.debugStatus === "failed" ? "#fef2f2" : debugDraft.debugStatus === "running" ? "#dbeafe" : "#f3f4f6", color: debugDraft.debugStatus === "success" ? "#166534" : debugDraft.debugStatus === "failed" ? "#b91c1c" : debugDraft.debugStatus === "running" ? "#1d4ed8" : "#6b7280" }} />
                </Box>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  {debugResultRows.map(([label, value]) => (
                    <Box key={label} sx={{ display: "grid", gridTemplateColumns: "110px minmax(0, 1fr)", gap: 1.5, p: 1.25, borderRadius: "8px", bgcolor: "#f8fafc" }}>
                      <Typography sx={{ fontSize: "12px", color: "#64748b" }}>{label}</Typography>
                      <Typography sx={{ fontSize: "12px", color: "#111827", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{value}</Typography>
                    </Box>
                  ))}
                </Box>
              </Paper>

              <Paper sx={{ p: 2, borderRadius: "10px", border: "1px solid #e5e7eb", boxShadow: "none" }}>
                <Typography sx={{ fontSize: "14px", fontWeight: 700, mb: 1.5 }}>调用详情</Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                  {debugCallDetails.map(([title, value]) => (
                    <Box key={title}>
                      <Typography sx={{ fontSize: "12px", color: "#64748b", mb: 0.75 }}>{title}</Typography>
                      <Box component="pre" sx={{ m: 0, p: 1.5, borderRadius: "8px", bgcolor: "#0f172a", color: "#e2e8f0", fontSize: "11px", lineHeight: 1.7, overflowX: "auto", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                        {JSON.stringify(value, null, 2)}
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Paper>
            </Box>

            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, pt: 2 }}>
              <Button onClick={() => setDebugDrawerOpen(false)} sx={{ textTransform: "none", color: "#64748b" }}>关闭</Button>
              <Button onClick={startDebug} disabled={debugLoading} variant="outlined" sx={{ textTransform: "none" }}>发起测试</Button>
            </Box>
          </Box>
        )}
      </Drawer>

      <Dialog open={paramEditorOpen} onClose={() => setParamEditorOpen(false)} fullWidth maxWidth="md">
        <DialogTitle sx={{ fontSize: "16px", fontWeight: 700, px: 3, pt: 2.5, pb: 2 }}>
          {editingParamIndex === null ? "新增标准入参" : "编辑标准入参"}
        </DialogTitle>
        <DialogContent sx={{ px: 3, pb: 2.5 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 0.5 }}>
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
              <TextField
                label="参数名称（字段名）"
                size="small"
                required
                helperText="对 Agent、业务系统和操作界面暴露的标准参数名。"
                value={paramDraft.sourceName}
                onChange={(event) => setParamDraft((prev) => ({ ...prev, sourceName: event.target.value, mappedParamName: event.target.value, handlingMode: "mapped", passingMode: "HTTP JSON Body" }))}
                sx={{ "& .MuiInputBase-root": { borderRadius: "6px", fontSize: "14px" }, "& .MuiInputLabel-root": { fontSize: "14px" } }}
              />
              <TextField
                select
                label="入参类型"
                size="small"
                required
                helperText="标准参数的数据类型。"
                value={paramDraft.inputType}
                onChange={(event) => setParamDraft((prev) => ({ ...prev, inputType: event.target.value as RawInputType }))}
                sx={{ "& .MuiInputBase-root": { borderRadius: "6px", fontSize: "14px" }, "& .MuiInputLabel-root": { fontSize: "14px" } }}
              >
                {RAW_INPUT_TYPE_OPTIONS.map((item) => (
                  <MenuItem key={item} value={item} sx={{ fontSize: "14px" }}>
                    {item}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="参数说明"
                size="small"
                required
                helperText="说明这个入参的业务含义。"
                value={paramDraft.description}
                onChange={(event) => setParamDraft((prev) => ({ ...prev, description: event.target.value, mappedParamDescription: event.target.value }))}
                sx={{ "& .MuiInputBase-root": { borderRadius: "6px", fontSize: "14px" }, "& .MuiInputLabel-root": { fontSize: "14px" } }}
              />
              <TextField
                label="默认值/示例值"
                size="small"
                helperText="可填写默认值或示例值。"
                value={paramDraft.mappedDefaultValue}
                onChange={(event) => setParamDraft((prev) => ({ ...prev, mappedDefaultValue: event.target.value }))}
                sx={{ "& .MuiInputBase-root": { borderRadius: "6px", fontSize: "14px" }, "& .MuiInputLabel-root": { fontSize: "14px" } }}
              />
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 0.25 }}>
              <FormControlLabel
                control={<Switch checked={paramDraft.required} onChange={(event) => setParamDraft((prev) => ({ ...prev, required: event.target.checked }))} />}
                label="是否必填"
              />
              <Typography sx={{ fontSize: "12px", color: "#94a3b8", ml: 4.5 }}>
                调用工具时是否必须提供。
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, pt: 0.5 }}>
          <Button onClick={() => setParamEditorOpen(false)} sx={{ textTransform: "none", color: "#64748b" }}>取消</Button>
          <Button onClick={saveParam} variant="contained" sx={{ bgcolor: BLUE, textTransform: "none", boxShadow: "none" }}>保存</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={confirmDeleteParamIndex !== null} onClose={() => setConfirmDeleteParamIndex(null)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontSize: "16px", fontWeight: 700 }}>确认删除入参？</DialogTitle>
        <DialogContent>
          <Alert severity="warning" icon={<WarningAmber />}>删除后，该入参关联的版本参数映射与配置 UI 展示配置将一并移除，确定继续？</Alert>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setConfirmDeleteParamIndex(null)} sx={{ textTransform: "none", color: "#64748b" }}>取消</Button>
          <Button onClick={deleteParam} color="error" variant="contained" sx={{ textTransform: "none", boxShadow: "none" }}>确认删除</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={resultEditorOpen} onClose={() => setResultEditorOpen(false)} fullWidth maxWidth="md">
        <DialogTitle sx={{ fontSize: "16px", fontWeight: 700, px: 3, pt: 2.5, pb: 2 }}>
          {editingResultIndex === null ? "新增标准返回" : "编辑标准返回"}
        </DialogTitle>
        <DialogContent sx={{ px: 3, pb: 2.5 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 0.5 }}>
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
              <TextField
                label="标准返回字段"
                size="small"
                required
                helperText="对 Agent 或业务系统稳定返回的字段名。"
                value={resultDraft.sourceField}
                onChange={(event) => setResultDraft((prev) => ({ ...prev, sourceField: event.target.value }))}
                sx={{ "& .MuiInputBase-root": { borderRadius: "6px", fontSize: "14px" }, "& .MuiInputLabel-root": { fontSize: "14px" } }}
              />
              <TextField
                select
                label="返回类型"
                size="small"
                required
                helperText="标准返回字段的数据类型。"
                value={resultDraft.fieldType}
                onChange={(event) => setResultDraft((prev) => ({ ...prev, fieldType: event.target.value as RawResultFieldType }))}
                sx={{ "& .MuiInputBase-root": { borderRadius: "6px", fontSize: "14px" }, "& .MuiInputLabel-root": { fontSize: "14px" } }}
              >
                {RAW_RESULT_FIELD_TYPE_OPTIONS.map((item) => (
                  <MenuItem key={item} value={item} sx={{ fontSize: "14px" }}>{item}</MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="返回要求"
                size="small"
                required
                helperText="字段是否必须返回。"
                value={resultDraft.requiredMode}
                onChange={(event) => setResultDraft((prev) => ({ ...prev, requiredMode: event.target.value as ResultRequiredMode }))}
                sx={{ "& .MuiInputBase-root": { borderRadius: "6px", fontSize: "14px" }, "& .MuiInputLabel-root": { fontSize: "14px" } }}
              >
                {RESULT_REQUIRED_MODE_OPTIONS.map((item) => (
                  <MenuItem key={item} value={item} sx={{ fontSize: "14px" }}>
                    {item === "是" ? "成功必返" : item === "否" ? "可选" : item === "失败时必返" ? "失败必返" : item}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="字段说明"
                size="small"
                required
                helperText="说明标准返回字段的含义。"
                value={resultDraft.description}
                onChange={(event) => setResultDraft((prev) => ({ ...prev, description: event.target.value }))}
                sx={{ "& .MuiInputBase-root": { borderRadius: "6px", fontSize: "14px" }, "& .MuiInputLabel-root": { fontSize: "14px" } }}
              />
            </Box>

          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, pt: 0.5 }}>
          <Button onClick={() => setResultEditorOpen(false)} sx={{ textTransform: "none", color: "#64748b" }}>取消</Button>
          <Button onClick={saveResultField} variant="contained" sx={{ bgcolor: BLUE, textTransform: "none", boxShadow: "none" }}>保存</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={confirmDeleteResultIndex !== null} onClose={() => setConfirmDeleteResultIndex(null)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontSize: "16px", fontWeight: 700 }}>确认删除返回字段？</DialogTitle>
        <DialogContent>
          <Alert severity="warning" icon={<WarningAmber />}>删除后，该返回字段关联的标准输出映射将一并移除，确定继续？</Alert>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setConfirmDeleteResultIndex(null)} sx={{ textTransform: "none", color: "#64748b" }}>取消</Button>
          <Button onClick={deleteResultField} color="error" variant="contained" sx={{ textTransform: "none", boxShadow: "none" }}>确认删除</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={confirmCloseOpen} onClose={() => setConfirmCloseOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontSize: "16px", fontWeight: 700 }}>离开未保存页面</DialogTitle>
        <DialogContent>
          <Alert severity="warning" icon={<WarningAmber />}>当前有未保存内容，确认离开后将丢失本次修改。</Alert>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setConfirmCloseOpen(false)} sx={{ textTransform: "none", color: "#64748b" }}>继续编辑</Button>
          <Button onClick={() => { setConfirmCloseOpen(false); closeVersionEditor(); }} color="error" variant="contained" sx={{ textTransform: "none", boxShadow: "none" }}>确认离开</Button>
        </DialogActions>
      </Dialog>
      </Box>
    </Box>
  );
}
