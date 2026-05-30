import { type DragEvent, type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router";
import {
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Drawer,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  Add,
  AutoAwesome,
  CheckCircleOutline,
  Close,
  DeleteOutline,
  EditOutlined,
  ErrorOutline,
  FactCheck,
  Send,
  Sync,
  UploadFile,
  WarningAmber,
} from "@mui/icons-material";
import { toast } from "sonner";
import { dataStore } from "../store/DataStore";

type ParamType = "text" | "textarea" | "number" | "select" | "multiSelect" | "switch" | "tags";
type ChainType = "sampleFile" | "documentFile" | "rawText" | "cleanText" | "qaPairs";
type SampleStatus = "已上传" | "已发送" | "试跑中" | "已完成";
type AgentEventRole = "agent" | "user" | "thought";
type AgentEventStatus = "done" | "running" | "pending";
type AgentEventKind = "message" | "toolCall" | "flow";
type ConnectionStatus = "normal" | "error" | "resolving" | "resolved";
type NodeRuntimeStatus = "building" | "selectingTool" | "configuring" | "done" | "running" | "success";

interface SampleFileItem {
  id: string;
  name: string;
  type: string;
  size: string;
  status: SampleStatus;
}

interface SampleProcessResult {
  fileId: string;
  structure: string;
  parserResult: string;
  adapterResult: string;
  storageTarget: string;
}

interface AgentEvent {
  id: string;
  role: AgentEventRole;
  title: string;
  content: string;
  status?: AgentEventStatus;
  kind?: AgentEventKind;
  flowSteps?: string[];
}

interface NodeRuntimeState {
  status: NodeRuntimeStatus;
  visibleParamCount?: number;
}

interface ToolParam {
  id: string;
  label: string;
  desc: string;
  type: ParamType;
  value: string | number | boolean | string[];
  required?: boolean;
  editable?: boolean;
  showOnPage?: boolean;
  options?: string[];
  format?: string;
  visibleWhen?: { paramId: string; value: string | number | boolean };
  min?: number;
  max?: number;
  unit?: string;
}

interface ToolOutput {
  id: string;
  label: string;
  desc: string;
  path: string;
}

interface InputSource {
  type: "fixed" | "upstream";
  sourceNodeId?: string;
  outputPath?: string;
}

interface McpService {
  name: string;
  version: string;
}

interface McpTool {
  id: string;
  name: string;
  category: string;
  sourceType?: "external" | "system";
  serviceName: string;
  serviceVersion: string;
  summary: string;
  status: "可用" | "不可用";
  params: ToolParam[];
  outputs: ToolOutput[];
  input: ChainType;
  output: ChainType;
  allowMultiple?: boolean;
}

interface ToolNode {
  nodeId: string;
  toolId: string;
  toolName: string;
  category: string;
  sourceType: "external" | "system";
  serviceName: string;
  serviceVersion: string;
  status: McpTool["status"];
  summary: string;
  allowMultiple: boolean;
  enabled: boolean;
  expanded: boolean;
  adjusted: boolean;
  inputParamId: string;
  inputSource: InputSource;
  params: ToolParam[];
  outputs: ToolOutput[];
}

const systemMcpService: McpService = {
  name: "知识工程内置 MCP Server",
  version: "V1.0.0",
};

const nacosMcpService: McpService = {
  name: "Nacos 知识工程 MCP",
  version: "V1.0.0",
};

const customerMcpService: McpService = {
  name: "客户自建文档处理 MCP",
  version: "V1.1.0",
};

const demoSampleFile: SampleFileItem = {
  id: "demo-policy-sample",
  name: "医保政策样例.pdf",
  type: "PDF",
  size: "2.4 MB",
  status: "已上传",
};

const initialAgentEvents: AgentEvent[] = [
  {
    id: "welcome",
    role: "agent",
    title: "处理方案生成助手",
    content: "请上传样例文件并发送给我。我会读取样例、调研可用工具、试跑工具结果，并生成可落地为 Workflow DSL 的处理方案。",
    status: "done",
  },
];

function createSampleResult(file: SampleFileItem): SampleProcessResult {
  return {
    fileId: file.id,
    structure: "识别到政策标题、适用范围、办理条件、材料清单、问答式说明等结构。",
    parserResult: "客户自建解析工具返回 sections[].content，未声明标准 outputSchema。",
    adapterResult: "已使用代码工具将 sections[].content 适配为 data.cleanBlocks，供分片工具继续处理。",
    storageTarget: "分片结果写入 ES 索引 knowledge_chunks，返回 data.storageRef。",
  };
}

const elevatedSelectMenuProps = {
  sx: { zIndex: 1600 },
  PaperProps: { sx: { zIndex: 1601 } },
};

const parseObjectParam: ToolParam = {
  id: "parseObject",
  label: "解析对象",
  desc: "待解析的文件地址对象，常用格式：{ fileUrl, fileName, fileType }。",
  type: "textarea",
  format: "文件URL对象",
  value: '{ "fileUrl": "https://example.com/demo.pdf", "fileName": "demo.pdf", "fileType": "pdf" }',
  required: true,
  editable: true,
};

const chunkObjectParam: ToolParam = {
  id: "chunkObject",
  label: "分片对象",
  desc: "待分片的对象，常用格式：Array<json>。",
  type: "textarea",
  format: "Array<json>",
  value: "",
  required: true,
  editable: true,
};

const extractionObjectParam: ToolParam = {
  id: "extractionObject",
  label: "提取对象",
  desc: "待提取的对象，常用格式：Array<json>。",
  type: "textarea",
  format: "Array<json>",
  value: "",
  required: true,
  editable: true,
};

const codeInputParam: ToolParam = {
  id: "codeInput",
  label: "脚本输入",
  desc: "接收前置工具输出，作为代码脚本的输入对象。",
  type: "textarea",
  format: "json",
  value: "",
  required: true,
  editable: true,
};

const storageObjectParam: ToolParam = {
  id: "storageObject",
  label: "待存储对象",
  desc: "接收前置工具输出，作为本次写入的数据对象。",
  type: "textarea",
  format: "json",
  value: "",
  required: true,
  editable: true,
};

const ocrServiceOptions = ["gpt-4o", "mockai", "预置服务-OCR", "Qwen2.5-VL-32B-Instruct"];
const vlmModelOptions = ["gpt-4o", "Qwen2.5-VL-32B-Instruct"];
const extractionModelOptions = ["qwen3-8b", "qwen3-14b", "qwen-plus", "gpt-4o"];
const chunkAssociateOptions = ["关联文件名", "关联标题及子标题"];
const chunkPreprocessOptions = ["删除换行符", "删除所有URL", "替换掉连续的空格换行符和制表符", "删除所有电子邮件地址"];
const separatorPresetOptions = ["\n\n", "\n", "。", "；", "###", "---", "+++"];

const commonParseParams: ToolParam[] = [
  parseObjectParam,
  { id: "parseStrategy", label: "解析策略", desc: "选择通用解析策略。", type: "multiSelect", value: ["文档内容提取"], editable: true, options: ["文档文字提取", "文档内容提取", "提取文档图谱", "图片内容解析", "表格深度解析"] },
  { id: "ocrService", label: "OCR服务", desc: "选择用于 OCR 的服务。", type: "select", value: "预置服务-OCR", required: true, editable: true, options: ocrServiceOptions },
  { id: "vlmModel", label: "VLM模型", desc: "选择 VLM 图片理解模型。", type: "select", value: "Qwen2.5-VL-32B-Instruct", required: true, editable: true, options: vlmModelOptions },
  { id: "systemPrompt", label: "System", desc: "图片识别与信息抽取系统提示词。", type: "textarea", value: "你是图像文字识别与信息抽取专家，精通图像预处理、OCR 及数学公式解析，能从各类票据、证件和表单中精准抽取关键信息，输出简洁、客观的 Markdown 结果。\n按照以下流程处理输入图像并输出结果：\n1. **图像预处理**  \n   - 灰度化、二值化、去噪等，提高识别率。\n2. **OCR 识别**  \n   - 提取所有文字；  \n   - 对数学公式应用公式识别算法，输出 LaTeX。\n3. **区域定位与信息抽取**  \n   - 对票据、证件、表单等，定位并抽取“姓名”“日期”“金额”等核心字段。\n4. **结果格式**  \n   - 仅输出客观识别/抽取内容，不做任何二次加工或总结；  \n   - Markdown 格式：  \n     - 普通文本直接写；  \n     - 公式使用 `$$…$$`（LaTeX）；  \n     - 结构化数据使用 Markdown 表格。\n示例：\n- **文字+公式识别**  \n  输入：`![示例](example.jpg)`  \n  输出：\n  ```markdown\n  文本：Hello, world!  \n  公式：$$E = mc^2$$\n  ```", editable: true },
  { id: "userPrompt", label: "User", desc: "图片识别与信息抽取用户提示词。", type: "textarea", value: "提取图片信息", editable: true },
];

const multimodalParseParams: ToolParam[] = [
  parseObjectParam,
  { id: "parseStrategy", label: "解析策略", desc: "选择多模态解析策略。", type: "multiSelect", value: ["文档内容解析"], editable: true, options: ["文档内容解析", "提取文档图片"] },
  { id: "vlmModel", label: "VLM模型", desc: "选择 VLM 图片理解模型。", type: "select", value: "Qwen2.5-VL-32B-Instruct", required: true, editable: true, options: vlmModelOptions },
  { id: "systemPrompt", label: "System", desc: "多模态解析系统提示词。", type: "textarea", value: "你是图像文字识别与信息抽取专家，精通图像预处理、OCR 及数学公式解析，能从各类票据、证件和表单中精准抽取关键信息，输出简洁、客观的 Markdown 结果。\n按照以下流程处理输入图像并输出结果：\n1. **图像预处理**  \n   - 灰度化、二值化、去噪等，提高识别率。\n2. **OCR 识别**  \n   - 提取所有文字；  \n   - 对数学公式应用公式识别算法，输出 LaTeX。\n3. **区域定位与信息抽取**  \n   - 对票据、证件、表单等，定位并抽取“姓名”“日期”“金额”等核心字段。\n4. **结果格式**  \n   - 仅输出客观识别/抽取内容，不做任何二次加工或总结；  \n   - Markdown 格式：  \n     - 普通文本直接写；  \n     - 公式使用 `$$…$$`（LaTeX）；  \n     - 结构化数据使用 Markdown 表格。\n示例：\n- **文字+公式识别**  \n  输入：`![示例](example.jpg)`  \n  输出：\n  ```markdown\n  文本：Hello, world!  \n  公式：$$E = mc^2$$\n  ```", editable: true },
  { id: "userPrompt", label: "User", desc: "多模态解析用户提示词。", type: "textarea", value: "提取图片信息", editable: true },
];

const policyParseParams: ToolParam[] = [parseObjectParam];

const commonChunkParams: ToolParam[] = [
  chunkObjectParam,
  { id: "chunkAssociate", label: "分片关联信息", desc: "选择需要写入分片结果的关联信息。", type: "multiSelect", value: [], editable: true, options: chunkAssociateOptions },
  { id: "chunkSize", label: "理想分块长度", desc: "单个分片的目标长度。", type: "number", value: 1024, required: true, editable: true, min: 1, max: 100000, unit: "字" },
  { id: "overlap", label: "块之间重叠长度", desc: "相邻分片之间的重叠长度。", type: "number", value: 200, required: true, editable: true, min: 0, max: 100000, unit: "字" },
  { id: "preprocess", label: "分片预处理", desc: "选择分片前需要执行的文本预处理。", type: "multiSelect", value: [], editable: true, options: chunkPreprocessOptions },
];

const customSeparatorChunkParams: ToolParam[] = [
  chunkObjectParam,
  { id: "chunkAssociate", label: "分片关联信息", desc: "选择需要写入分片结果的关联信息。", type: "multiSelect", value: [], editable: true, options: chunkAssociateOptions },
  { id: "customSeparator", label: "自定义分隔符", desc: "使用分隔符进行分片。", type: "text", value: "+++", required: true, editable: true },
  { id: "chunkSize", label: "理想分块长度", desc: "单个分片的目标长度。", type: "number", value: 1024, required: true, editable: true, min: 1, max: 100000, unit: "字" },
  { id: "overlap", label: "块之间重叠长度", desc: "相邻分片之间的重叠长度。", type: "number", value: 200, required: true, editable: true, min: 0, max: 100000, unit: "字" },
  { id: "preprocess", label: "分片预处理", desc: "选择分片前需要执行的文本预处理。", type: "multiSelect", value: [], editable: true, options: chunkPreprocessOptions },
];

const recursiveSeparatorChunkParams: ToolParam[] = [
  chunkObjectParam,
  { id: "mode", label: "模式选择", desc: "选择分片关联模式。", type: "select", value: "关联文件信息", required: true, editable: true, options: ["关联文件信息", "保留父子切片结构"] },
  { id: "chunkAssociate", label: "分片关联信息", desc: "模式为关联文件信息时配置。", type: "multiSelect", value: [], editable: true, options: chunkAssociateOptions, visibleWhen: { paramId: "mode", value: "关联文件信息" } },
  { id: "chunkSize", label: "理想分块长度", desc: "递归分片目标长度。", type: "number", value: 512, required: true, editable: true, min: 1, max: 100000, unit: "字" },
  { id: "overlap", label: "块之间重叠长度", desc: "相邻分片之间的重叠长度。", type: "number", value: 50, required: true, editable: true, min: 0, max: 100000, unit: "字" },
  { id: "sliceSeparators", label: "切片分隔符", desc: "最多添加10个分隔符，支持预置分隔符和自定义分隔符。", type: "tags", value: ["\n\n", "\n"], editable: true, options: separatorPresetOptions, max: 10 },
];

const ocrChunkParams: ToolParam[] = [
  chunkObjectParam,
  { id: "mode", label: "模式选择", desc: "选择分片关联模式。", type: "select", value: "关联文件信息", required: true, editable: true, options: ["关联文件信息", "保留父子切片结构"] },
  { id: "chunkAssociate", label: "分片关联信息", desc: "模式为关联文件信息时配置。", type: "multiSelect", value: [], editable: true, options: chunkAssociateOptions, visibleWhen: { paramId: "mode", value: "关联文件信息" } },
  { id: "chunkSize", label: "理想分块长度", desc: "根据 OCR 识别标题和段落聚合的目标长度。", type: "number", value: 512, required: true, editable: true, min: 1, max: 100000, unit: "字" },
  { id: "overlap", label: "块之间重叠长度", desc: "相邻分片之间的重叠长度。", type: "number", value: 50, required: true, editable: true, min: 0, max: 100000, unit: "字" },
  { id: "preprocess", label: "分片预处理", desc: "选择分片前需要执行的文本预处理。", type: "multiSelect", value: [], editable: true, options: chunkPreprocessOptions },
];

const policyChunkParams: ToolParam[] = [chunkObjectParam];

const videoAudioSyncChunkParams: ToolParam[] = [
  chunkObjectParam,
  { id: "chunkAssociate", label: "分片关联信息", desc: "选择需要写入分片结果的关联信息。", type: "multiSelect", value: ["关联文件名"], editable: true, options: ["关联文件名"] },
  { id: "segmentCount", label: "理想分段个数", desc: "希望切分出的分段数量。", type: "number", value: 10, required: true, editable: true, min: 1, max: 1000, unit: "段" },
  { id: "preprocess", label: "分片预处理", desc: "选择分片前需要执行的文本预处理。", type: "multiSelect", value: [], editable: true, options: chunkPreprocessOptions },
];

const qaParams: ToolParam[] = [
  extractionObjectParam,
  { id: "aiModel", label: "AI模型", desc: "选择提取模型。", type: "select", value: "qwen3-8b", required: true, editable: true, options: extractionModelOptions },
  { id: "temperature", label: "温度", desc: "模型生成温度。", type: "number", value: 0.7, required: true, editable: true, min: 0, max: 2 },
  { id: "maxTokens", label: "max tokens", desc: "模型最大输出 tokens。", type: "number", value: 2048, required: true, editable: true, min: 1, max: 32768 },
  { id: "systemPrompt", label: "System Prompt", desc: "QA 提取系统提示词。", type: "textarea", value: "你是一个QA抽取专家，擅长学习和分析提供的文本信息。\n<context></context> 标记中是一段文本。\n你的任务是学习和分析<context></context>的文本，并按照以下步骤整理学习成果：\n1. 给出<context></context>的文本描述的主体(subject)\n2. 提出问题(question)\n3. 给出每个问题的答案(answer)", editable: true },
  { id: "guidePrompt", label: "引导模板提示词", desc: "用于控制问答引用和来源格式。", type: "textarea", value: "学习和分析<context></context>的文本，并整理学习成果。\n任务要求:\n- 如果<context></context>内有表格，那么提取的主体(subject)不能是\"表格\"\n- 答案需详细完整，给出相关原文描述。\n- 答案可以包含普通文字、链接、代码、表格、公示、媒体链接等 markdown 元素。\n- 可以对答案添加或者删去一些分隔符，让FAQ答案语句通顺。\n- 尽可能多地提出问题，但最多提出3个问题。\n- 记得按照要求的json格式回答。", editable: true },
];

const summaryParams: ToolParam[] = [
  extractionObjectParam,
  { id: "aiModel", label: "AI模型", desc: "选择提取模型。", type: "select", value: "qwen3-8b", required: true, editable: true, options: extractionModelOptions },
  { id: "temperature", label: "温度", desc: "模型生成温度。", type: "number", value: 0.7, required: true, editable: true, min: 0, max: 2 },
  { id: "maxTokens", label: "max tokens", desc: "模型最大输出 tokens。", type: "number", value: 2048, required: true, editable: true, min: 1, max: 32768 },
  { id: "systemPrompt", label: "System Prompt", desc: "摘要总结系统提示词。", type: "textarea", value: "你是一个摘要提取专家，能够从用户提供的文档中生成简洁准确的摘要。\n<context></context> 标记中是一段文本。\n你的任务是：学习和分析<context></context>的文本，并总结提炼摘要(Summary)。\n\n限制条件:\n1. Summary：总结提炼文档(Document)中文本段的主旨;\n2. Summary：不能含有指代词，表达通顺，意思清楚;\n3. 文档内容中没有图片，所以当摘要需要引用图片时，应该改写隐去图片引用；\n4. 总是按照JSON格式输出。", editable: true },
  { id: "guidePrompt", label: "引导模板提示词", desc: "摘要总结引导模板提示词。", type: "textarea", value: "请从上面的文档总结提炼摘要，记得按照要求的json格式回答。", editable: true },
];

const keywordParams: ToolParam[] = [
  extractionObjectParam,
  { id: "aiModel", label: "AI模型", desc: "选择提取模型。", type: "select", value: "qwen3-8b", required: true, editable: true, options: extractionModelOptions },
  { id: "temperature", label: "温度", desc: "模型生成温度。", type: "number", value: 0.7, required: true, editable: true, min: 0, max: 2 },
  { id: "maxTokens", label: "max tokens", desc: "模型最大输出 tokens。", type: "number", value: 2048, required: true, editable: true, min: 1, max: 32768 },
  { id: "systemPrompt", label: "System Prompt", desc: "关键词提取系统提示词。", type: "textarea", value: "你是一个关键词提取专家，能够从用户提供的文档(Document)中生成简洁准确的关键词（keywords）。\n<context></context> 标记中是一段文本。\n你的任务是：学习和分析<context></context>的文本，并提取出其中最重要的关键词。\n\n限制条件:\n1. 这些关键词应该能够准确反映文本的核心主题和主要内容。\n2. 请注意，最终结果请以有效的JSON格式返回。", editable: true },
  { id: "guidePrompt", label: "引导模板提示词", desc: "关键词提取引导模板提示词。", type: "textarea", value: "以上是原文信息，请理解以上信息后生成不超过5个关键词，记得按照要求的json格式回答。", editable: true },
];

const codeToolParams: ToolParam[] = [
  codeInputParam,
  {
    id: "script",
    label: "代码脚本",
    desc: "对输入对象做清洗、转换、过滤、合并，脚本返回值会作为工具输出。",
    type: "textarea",
    value: "function transform(input) {\n  return {\n    cleanBlocks: input.map(item => ({\n      text: item.text,\n      title: item.title,\n      page: item.page\n    }))\n  };\n}",
    required: true,
    editable: true,
  },
  {
    id: "outputVariables",
    label: "输出变量声明",
    desc: "声明脚本返回结果中可被后置工具引用的变量。",
    type: "textarea",
    format: "Array<{name,type,path}>",
    value: '[{ "name": "cleanBlocks", "type": "Array<json>", "path": "data.cleanBlocks" }]',
    required: true,
    editable: true,
  },
];

const storageToolParams: ToolParam[] = [
  storageObjectParam,
  {
    id: "storagePath",
    label: "取值路径",
    desc: "从输入对象中选择需要写入存储的数据路径。",
    type: "text",
    format: "path",
    value: "data.textChunkResult",
    required: true,
    editable: true,
  },
  {
    id: "storageMethod",
    label: "存储方式",
    desc: "选择结果写入的目标类型。",
    type: "select",
    value: "写入ES",
    required: true,
    editable: true,
    options: ["写入ES", "对象存储", "向量库", "中间表"],
  },
  {
    id: "storageTarget",
    label: "存储目标",
    desc: "填写索引、Bucket、Collection 或表名。",
    type: "text",
    value: "knowledge_chunks",
    required: true,
    editable: true,
  },
  {
    id: "writeMode",
    label: "写入模式",
    desc: "选择重复数据的处理方式。",
    type: "select",
    value: "upsert",
    required: true,
    editable: true,
    options: ["insert", "upsert", "overwrite"],
  },
];

function createOutput(id: string, label: string, desc: string, path: string): ToolOutput {
  return { id, label, desc, path };
}

const toolCatalog: McpTool[] = [
  { id: "document-parser", name: "通用解析", category: "文档解析", serviceName: nacosMcpService.name, serviceVersion: nacosMcpService.version, summary: "解析 Word、PDF、Excel 等主流文档，提取文本和版面布局。", status: "可用", input: "sampleFile", output: "rawText", params: commonParseParams, outputs: [createOutput("documentParseResult", "文档解析结果", "Array<json>，包含解析后的文本、版面、图片和表格信息。", "data.documentParseResult")] },
  { id: "multimodal-parser", name: "多模态解析", category: "文档解析", serviceName: nacosMcpService.name, serviceVersion: nacosMcpService.version, summary: "使用多模态大模型对文档内容进行解析，效果好、速度慢。", status: "可用", input: "sampleFile", output: "rawText", params: multimodalParseParams, outputs: [createOutput("documentParseResult", "文档解析结果", "Array<json>，包含多模态解析后的文本、图片理解和版面信息。", "data.documentParseResult")] },
  { id: "medical-policy-parser", name: "医保政策解析", category: "文档解析", serviceName: customerMcpService.name, serviceVersion: customerMcpService.version, summary: "适用于解析医保政策类文件。", status: "可用", input: "sampleFile", output: "rawText", params: policyParseParams, outputs: [createOutput("documentParseResult", "文档解析结果", "Array<json>，包含医保政策文档的条款、标题和正文结构。", "data.documentParseResult")] },
  { id: "chunk-splitter", name: "通用分片", category: "内容处理", serviceName: nacosMcpService.name, serviceVersion: nacosMcpService.version, summary: "为纯文本文档提供灵活的分块和重叠设置。", status: "可用", input: "rawText", output: "cleanText", params: commonChunkParams, outputs: [createOutput("textChunkResult", "文本分片结果", "Array<json>，包含分片文本、标题、来源和元数据。", "data.textChunkResult")] },
  { id: "custom-separator-splitter", name: "自定义分隔符分片", category: "内容处理", serviceName: nacosMcpService.name, serviceVersion: nacosMcpService.version, summary: "沿用通用分片配置，并使用指定分隔符切分文本。", status: "可用", input: "rawText", output: "cleanText", params: customSeparatorChunkParams, outputs: [createOutput("textChunkResult", "文本分片结果", "Array<json>，包含按自定义分隔符切分后的文本片段。", "data.textChunkResult")] },
  { id: "recursive-separator-splitter", name: "分隔符递归分片", category: "内容处理", serviceName: customerMcpService.name, serviceVersion: customerMcpService.version, summary: "按分隔符优先级依次切分，优先保留语义完整。", status: "可用", input: "rawText", output: "cleanText", params: recursiveSeparatorChunkParams, outputs: [createOutput("textChunkResult", "文本分片结果", "Array<json>，包含递归切分后的文本片段。", "data.textChunkResult")] },
  { id: "ocr-splitter", name: "OCR解析专用分片", category: "内容处理", serviceName: customerMcpService.name, serviceVersion: customerMcpService.version, summary: "根据 OCR 识别的标题及段落进行切分、聚合。", status: "可用", input: "rawText", output: "cleanText", params: ocrChunkParams, outputs: [createOutput("textChunkResult", "文本分片结果", "Array<json>，包含面向 OCR 结果聚合后的文本片段。", "data.textChunkResult")] },
  { id: "medical-policy-splitter", name: "医保政策解析分片", category: "内容处理", serviceName: customerMcpService.name, serviceVersion: customerMcpService.version, summary: "适合医保政策类文件分片，页面上没有可配置参数。", status: "可用", input: "rawText", output: "cleanText", params: policyChunkParams, outputs: [createOutput("textChunkResult", "文本分片结果", "Array<json>，包含医保政策文件分片结果。", "data.textChunkResult")] },
  { id: "video-audio-sync-splitter", name: "视频声画同步分片", category: "内容处理", serviceName: nacosMcpService.name, serviceVersion: nacosMcpService.version, summary: "按声画同步结果切分视频文本片段。", status: "可用", input: "rawText", output: "cleanText", params: videoAudioSyncChunkParams, outputs: [createOutput("textChunkResult", "文本分片结果", "Array<json>，包含视频声画同步分片结果。", "data.textChunkResult")] },
  { id: "qa-extractor", name: "QA提取", category: "智能生成", serviceName: nacosMcpService.name, serviceVersion: nacosMcpService.version, summary: "基于文本分片抽取问答对。", status: "可用", input: "cleanText", output: "qaPairs", params: qaParams, outputs: [createOutput("qaResult", "QA提取结果", "Array<json>，包含问题、答案和引用来源。", "data.qaResult")] },
  { id: "summary", name: "摘要总结", category: "智能生成", serviceName: nacosMcpService.name, serviceVersion: nacosMcpService.version, summary: "基于文本分片结果生成摘要总结。", status: "可用", input: "cleanText", output: "rawText", params: summaryParams, outputs: [createOutput("summaryResult", "摘要总结结果", "Array<json>，包含摘要内容和来源引用。", "data.summaryResult")] },
  { id: "keyword-extractor", name: "关键词提取", category: "智能生成", serviceName: customerMcpService.name, serviceVersion: customerMcpService.version, summary: "从文本分片中抽取关键词。", status: "可用", input: "cleanText", output: "rawText", params: keywordParams, outputs: [createOutput("keywordResult", "关键词提取结果", "Array<json>，包含关键词和权重。", "data.keywordResult")] },
  { id: "system-code", name: "代码工具", category: "系统工具", sourceType: "system", serviceName: systemMcpService.name, serviceVersion: systemMcpService.version, summary: "接收前置工具输出，通过代码脚本完成清洗、转换、合并，并声明后置工具可引用的输出变量。", status: "可用", input: "rawText", output: "cleanText", params: codeToolParams, outputs: [createOutput("scriptResult", "脚本处理结果", "json，代码脚本返回的完整结果。", "data.scriptResult"), createOutput("cleanBlocks", "标准文本块", "Array<json>，可作为后置分片或抽取工具输入。", "data.cleanBlocks")], allowMultiple: true },
  { id: "system-storage", name: "数据存储工具", category: "系统工具", sourceType: "system", serviceName: systemMcpService.name, serviceVersion: systemMcpService.version, summary: "选择前置工具输出中的指定路径，将结果写入 ES、对象存储、向量库或中间表。", status: "可用", input: "cleanText", output: "rawText", params: storageToolParams, outputs: [createOutput("storageRef", "存储引用", "storage_ref，后置节点可引用的存储结果地址。", "data.storageRef"), createOutput("storedCount", "写入数量", "number，本次成功写入的数据条数。", "data.storedCount")], allowMultiple: true },
];

const initialPlanNodes: ToolNode[] = createInitialPlanNodes();

function cloneParams(params: ToolParam[]): ToolParam[] {
  return params.map((param) => ({
    ...param,
    showOnPage: param.showOnPage ?? false,
    value: Array.isArray(param.value) ? [...param.value] : param.value,
  }));
}

function cloneOutputs(outputs: ToolOutput[]): ToolOutput[] {
  return outputs.map((output) => ({ ...output }));
}

function cloneNodes(nodes: ToolNode[]): ToolNode[] {
  return nodes.map((node) => ({
    ...node,
    inputSource: { ...node.inputSource },
    params: cloneParams(node.params),
    outputs: cloneOutputs(node.outputs),
  }));
}

function createNode(toolId: string, inputSource: InputSource = { type: "fixed" }): ToolNode {
  const tool = toolCatalog.find((item) => item.id === toolId);
  if (!tool) throw new Error("Unknown MCP tool");
  const params = cloneParams(tool.params);
  return {
    nodeId: `${tool.id}-${Math.random().toString(36).slice(2, 8)}`,
    toolId: tool.id,
    toolName: tool.name,
    category: tool.category,
    sourceType: tool.sourceType ?? "external",
    serviceName: tool.serviceName,
    serviceVersion: tool.serviceVersion,
    status: tool.status,
    summary: tool.summary,
    allowMultiple: tool.allowMultiple ?? false,
    enabled: true,
    expanded: false,
    adjusted: false,
    inputParamId: params[0]?.id ?? "",
    inputSource,
    params,
    outputs: cloneOutputs(tool.outputs),
  };
}

function createInitialPlanNodes(): ToolNode[] {
  const parser = createNode("document-parser", { type: "fixed" });
  const code = createNode("system-code", { type: "upstream", sourceNodeId: parser.nodeId, outputPath: "data.documentParseResult" });
  const splitter = createNode("chunk-splitter", { type: "upstream", sourceNodeId: code.nodeId, outputPath: "data.cleanBlocks" });
  const storage = createNode("system-storage", { type: "upstream", sourceNodeId: splitter.nodeId, outputPath: "data.textChunkResult" });
  const qa = createNode("qa-extractor", { type: "upstream", sourceNodeId: splitter.nodeId, outputPath: "content[0].text" });
  const summary = createNode("summary", { type: "upstream", sourceNodeId: splitter.nodeId, outputPath: "data.textChunkResult" });
  return [parser, code, splitter, storage, qa, summary];
}

function createAgentDemoPlanNodes(): ToolNode[] {
  const parser = createNode("medical-policy-parser", { type: "fixed" });
  const adapter = createNode("system-code", { type: "upstream", sourceNodeId: parser.nodeId, outputPath: "sections" });
  const splitter = createNode("recursive-separator-splitter", { type: "upstream", sourceNodeId: adapter.nodeId, outputPath: "data.cleanBlocks" });
  const storage = createNode("system-storage", { type: "upstream", sourceNodeId: splitter.nodeId, outputPath: "data.textChunkResult" });
  const qa = createNode("qa-extractor", { type: "upstream", sourceNodeId: splitter.nodeId, outputPath: "data.textChunkResult" });
  const summary = createNode("summary", { type: "upstream", sourceNodeId: splitter.nodeId, outputPath: "data.textChunkResult" });
  return [parser, adapter, splitter, storage, qa, summary].map((node) => ({ ...node, adjusted: true }));
}

function createAgentOptimizedPlanNodes(): ToolNode[] {
  const parser = createNode("medical-policy-parser", { type: "fixed" });
  const adapter = createNode("system-code", { type: "upstream", sourceNodeId: parser.nodeId, outputPath: "sections" });
  const splitter = createNode("medical-policy-splitter", { type: "upstream", sourceNodeId: adapter.nodeId, outputPath: "data.cleanBlocks" });
  const storage = createNode("system-storage", { type: "upstream", sourceNodeId: splitter.nodeId, outputPath: "data.textChunkResult" });
  const qa = createNode("qa-extractor", { type: "upstream", sourceNodeId: splitter.nodeId, outputPath: "data.textChunkResult" });
  const keyword = createNode("keyword-extractor", { type: "upstream", sourceNodeId: splitter.nodeId, outputPath: "data.textChunkResult" });
  return [parser, adapter, splitter, storage, qa, keyword].map((node) => ({ ...node, adjusted: true }));
}

function getParamProblems(node: ToolNode, receivesExternalInput = false) {
  if (!node.enabled) return [];
  return node.params.flatMap((param) => {
    if (!isParamVisible(node, param)) return [];
    if (!param.required) return [];
    if (param.id === node.inputParamId && (node.inputSource.type === "upstream" || receivesExternalInput)) return [];
    if (typeof param.value === "string" && !param.value.trim()) return [`${param.label} 未填写`];
    if (typeof param.value === "number" && ((param.min !== undefined && param.value < param.min) || (param.max !== undefined && param.value > param.max))) {
      return [`${param.label} 超出范围`];
    }
    if (Array.isArray(param.value) && param.value.length === 0) return [`${param.label} 未选择`];
    return [];
  });
}

function getPlanTitle(category: string) {
  return category;
}

function getPriorNodes(nodes: ToolNode[], nodeId: string) {
  const index = nodes.findIndex((node) => node.nodeId === nodeId);
  return index > 0 ? nodes.slice(0, index) : [];
}

function getToolInputParam(node: ToolNode) {
  return node.params.find((param) => param.id === node.inputParamId) ?? node.params[0];
}

function isParamVisible(node: ToolNode, param: ToolParam) {
  if (!param.visibleWhen) return true;
  const controller = node.params.find((item) => item.id === param.visibleWhen?.paramId);
  return controller?.value === param.visibleWhen.value;
}

function getInputSourceLabel(node: ToolNode, nodes: ToolNode[]) {
  const inputParam = getToolInputParam(node);
  if (!inputParam) return "未指定输入参数";
  if (node.inputSource.type !== "upstream") return `${inputParam.label} <- ${getFixedInputSourceText(node, nodes)}`;
  const sourceNode = nodes.find((item) => item.nodeId === node.inputSource.sourceNodeId);
  return `${inputParam.label} <- ${sourceNode?.toolName ?? "来源已失效"} / ${node.inputSource.outputPath || "未配置取值路径"}`;
}
function getOutputFormat(output: ToolOutput) {
  return output.desc.split(/[，,]/)[0] || "未知格式";
}

function getParamFormat(param: ToolParam) {
  return param.format ?? param.type;
}

function isValidOutputPath(path?: string) {
  const value = path?.trim();
  if (!value) return false;
  return /^[A-Za-z_$][\w$]*(\[\d+\])*(\.[A-Za-z_$][\w$]*(\[\d+\])*)*$/.test(value);
}

function isInputSourceInvalid(node: ToolNode, nodes: ToolNode[]) {
  if (isFirstCategoryFirstNode(node, nodes)) return false;
  if (node.inputSource.type !== "upstream") return false;
  const priorNodes = getPriorNodes(nodes, node.nodeId);
  const sourceNode = priorNodes.find((item) => item.nodeId === node.inputSource.sourceNodeId);
  return !sourceNode || !isValidOutputPath(node.inputSource.outputPath);
}

function getCategorySections(nodes: ToolNode[]) {
  const sections: { sectionId: string; category: string; nodes: ToolNode[] }[] = [];
  nodes.forEach((node) => {
    const lastSection = sections[sections.length - 1];
    if (lastSection?.category === node.category) {
      lastSection.nodes.push(node);
      return;
    }
    sections.push({ sectionId: `${node.category}-${node.nodeId}`, category: node.category, nodes: [node] });
  });

  return sections;
}

function getConnectionKey(fromCategory: string, toCategory: string) {
  return `${fromCategory}->${toCategory}`;
}

function getCategoryOrder(category: string) {
  const order = ["文档解析", "内容处理", "系统工具", "智能生成", "质量评估"];
  const index = order.indexOf(category);
  return index >= 0 ? index : order.length;
}

function insertNodeByCategory(nodes: ToolNode[], node: ToolNode) {
  if (node.sourceType === "system") {
    return [...nodes, node];
  }
  const lastSameCategoryIndex = nodes.reduce((lastIndex, item, index) => (item.category === node.category ? index : lastIndex), -1);
  if (lastSameCategoryIndex >= 0) {
    const next = [...nodes];
    next.splice(lastSameCategoryIndex + 1, 0, node);
    return next;
  }

  const nodeOrder = getCategoryOrder(node.category);
  const insertIndex = nodes.findIndex((item) => getCategoryOrder(item.category) > nodeOrder);
  if (insertIndex < 0) return [...nodes, node];
  const next = [...nodes];
  next.splice(insertIndex, 0, node);
  return next;
}

function getFirstCategory(nodes: ToolNode[]) {
  return getCategorySections(nodes)[0]?.category;
}

function isFirstCategoryNode(node: ToolNode, nodes: ToolNode[]) {
  return getFirstCategory(nodes) === node.category;
}

function isFirstCategoryFirstNode(node: ToolNode, nodes: ToolNode[]) {
  const firstSection = getCategorySections(nodes)[0];
  return firstSection?.nodes[0]?.nodeId === node.nodeId;
}

function getFixedInputSourceText(node: ToolNode, nodes: ToolNode[]) {
  return "待处理文件地址信息";
}

function getNodeWarnings(nodes: ToolNode[]) {
  const warnings: Record<string, string[]> = {};
  const enabledNodes = nodes.filter((node) => node.enabled);

  enabledNodes.forEach((node) => {
    const paramProblems = getParamProblems(node, node.inputSource.type !== "upstream");
    if (paramProblems.length > 0) {
      warnings[node.nodeId] = [...(warnings[node.nodeId] ?? []), ...paramProblems];
    }
    if (node.status !== "可用") {
      warnings[node.nodeId] = [...(warnings[node.nodeId] ?? []), `${node.toolName} 当前不可用于新处理方案`];
    }
    if (isInputSourceInvalid(node, nodes)) {
      warnings[node.nodeId] = [...(warnings[node.nodeId] ?? []), "输入配置异常，请检查。"];
    }
  });

  return warnings;
}

function getPlanProblems(nodes: ToolNode[]) {
  const enabledNodes = nodes.filter((node) => node.enabled);
  const countProblems = enabledNodes.length === 0 ? ["处理方案至少需要 1 个工具"] : [];
  const nodeWarnings = Object.values(getNodeWarnings(nodes)).flat();
  return [...countProblems, ...nodeWarnings];
}

export function AgentWorkbench() {
  const { projectId, categoryId, formType } = useParams<{ projectId: string; categoryId: string; formType: string }>();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const agentStreamRef = useRef<HTMLDivElement | null>(null);
  const displayFormType = formType ? decodeURIComponent(formType) : "问答库";
  const displayCategory = useMemo(() => {
    if (!projectId || !categoryId) return "常见问题";
    const solution = dataStore.getProjectSolution(projectId);
    const category = solution ? dataStore.getProjectCategories(solution.id).find((item) => item.id === categoryId) : null;
    return category?.name ?? "常见问题";
  }, [categoryId, projectId]);
  const [rightTab, setRightTab] = useState(1);
  const [planNodes, setPlanNodes] = useState<ToolNode[]>(cloneNodes(initialPlanNodes));
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("全部");
  const [selectedToolId, setSelectedToolId] = useState(toolCatalog[0].id);
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [draggingCategory, setDraggingCategory] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [sampleFiles, setSampleFiles] = useState<SampleFileItem[]>([]);
  const [sampleResults, setSampleResults] = useState<SampleProcessResult[]>([]);
  const [agentEvents, setAgentEvents] = useState<AgentEvent[]>(initialAgentEvents);
  const [agentInput, setAgentInput] = useState("");
  const [isAgentRunning, setIsAgentRunning] = useState(false);
  const [connectionStates, setConnectionStates] = useState<Record<string, ConnectionStatus>>({});
  const [nodeRuntimeStates, setNodeRuntimeStates] = useState<Record<string, NodeRuntimeState>>({});
  const [reviewScanIndex, setReviewScanIndex] = useState<number | null>(null);

  const categories = useMemo(() => ["全部", ...Array.from(new Set(toolCatalog.map((tool) => tool.category)))], []);
  const categorySections = useMemo(() => getCategorySections(planNodes), [planNodes]);
  const nodeWarnings = useMemo(() => getNodeWarnings(planNodes), [planNodes]);
  const displayedNodeWarnings = isAgentRunning ? {} : nodeWarnings;
  const allProblems = getPlanProblems(planNodes);
  const visibleProblems = isAgentRunning ? [] : allProblems;
  const canEdit = !confirmed && !isAgentRunning;
  const editingNode = planNodes.find((node) => node.nodeId === editingNodeId) ?? null;
  const addedToolIds = useMemo(() => new Set(planNodes.map((node) => node.toolId)), [planNodes]);

  const filteredTools = selectedCategory === "全部"
    ? toolCatalog
    : toolCatalog.filter((tool) => tool.category === selectedCategory);
  const currentTool = toolCatalog.find((tool) => tool.id === selectedToolId) ?? filteredTools[0] ?? null;
  const selectedToolAdded = currentTool ? addedToolIds.has(currentTool.id) && !currentTool.allowMultiple : false;
  const selectedToolCategoryConfirmed = false;
  const isNodeEditable = () => canEdit;

  useEffect(() => {
    const container = agentStreamRef.current;
    if (!container) return;
    container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
  }, [agentEvents]);

  const appendAgentEvent = (event: Omit<AgentEvent, "id">) => {
    const id = `${event.role}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setAgentEvents((current) => [...current, { ...event, id }]);
    return id;
  };

  const updateAgentEvent = (id: string, patch: Partial<AgentEvent>) => {
    setAgentEvents((current) => current.map((event) => (event.id === id ? { ...event, ...patch } : event)));
  };

  const pushAgentEvent = (event: Omit<AgentEvent, "id">) => {
    const id = `${event.role}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setAgentEvents((current) => [...current, { ...event, id }]);
    return id;
  };

  const setConnectionStatus = (fromCategory: string, toCategory: string, status: ConnectionStatus) => {
    const key = getConnectionKey(fromCategory, toCategory);
    setConnectionStates((current) => {
      if (status === "normal") {
        const next = { ...current };
        delete next[key];
        return next;
      }
      return { ...current, [key]: status };
    });
  };

  const setNodeRuntime = (node: ToolNode, state: NodeRuntimeState) => {
    setNodeRuntimeStates((current) => ({ ...current, [node.nodeId]: state }));
  };

  const setNodesRuntime = (nodes: ToolNode[], state: NodeRuntimeState) => {
    setNodeRuntimeStates((current) => ({
      ...current,
      ...Object.fromEntries(nodes.map((node) => [node.nodeId, state])),
    }));
  };

  const clearConnectionStatuses = (nodes: ToolNode[]) => {
    const sections = getCategorySections(nodes);
    setConnectionStates((current) => {
      const next = { ...current };
      sections.slice(0, -1).forEach((section, index) => {
        delete next[getConnectionKey(section.category, sections[index + 1].category)];
      });
      return next;
    });
  };

  const startReviewScan = (nodes: ToolNode[]) => {
    const count = Math.max(getCategorySections(nodes).length, 1);
    let nextIndex = 0;
    setReviewScanIndex(0);
    return window.setInterval(() => {
      nextIndex = (nextIndex + 1) % count;
      setReviewScanIndex(nextIndex);
    }, 720);
  };

  const addDemoSample = () => {
    setSampleFiles((current) => (current.some((file) => file.id === demoSampleFile.id) ? current : [demoSampleFile, ...current]));
    toast.success("已添加演示样例文件");
  };

  const handleSampleFileChange = (files: FileList | null) => {
    if (!files?.length) return;
    const nextFiles = Array.from(files).map((file) => ({
      id: `${file.name}-${file.lastModified}`,
      name: file.name,
      type: file.name.split(".").pop()?.toUpperCase() || "FILE",
      size: `${Math.max(file.size / 1024 / 1024, 0.01).toFixed(2)} MB`,
      status: "已上传" as SampleStatus,
    }));
    setSampleFiles((current) => [...nextFiles, ...current.filter((file) => !nextFiles.some((nextFile) => nextFile.id === file.id))]);
    toast.success(`已上传 ${nextFiles.length} 个样例文件`);
  };

  const sendSamplesToAgent = () => {
    if (sampleFiles.length === 0) {
      toast.error("请先上传或添加样例文件");
      return;
    }
    const filesSnapshot = [...sampleFiles];
    const [parser, adapter, splitter, storage, qa, summary] = createAgentDemoPlanNodes();
    const draftNodes = [parser, splitter, storage, qa, summary];
    const finalNodes = [parser, adapter, splitter, storage, qa, summary];
    setIsAgentRunning(true);
    setConfirmed(false);
    setRightTab(1);
    setPlanNodes([]);
    setConnectionStates({});
    setNodeRuntimeStates({});
    setSampleResults([]);
    setSampleFiles((current) => current.map((file) => ({ ...file, status: "已发送" })));
    pushAgentEvent({
      role: "user",
      title: "发送样例文件",
      content: `已发送 ${filesSnapshot.length} 个样例文件，请生成正式的知识处理方案。`,
      status: "done",
    });

    const schedule = (delay: number, action: () => void) => window.setTimeout(action, delay);
    let cursor = 0;
    const step = (delay: number, action: () => void) => {
      cursor += delay;
      schedule(cursor, action);
    };
    const visibleParams = (node: ToolNode) => node.params.filter((param) => isParamVisible(node, param)).slice(0, 4);

    const buildToolNode = (nodes: ToolNode[], allNodes: ToolNode[], title: string, toolText: string) => {
      let buildEventId = "";
      let selectEventId = "";
      let configEventId = "";
      step(1800, () => {
        setPlanNodes(allNodes);
        setNodesRuntime(nodes, { status: "building" });
        buildEventId = pushAgentEvent({
          role: "thought",
          title: `开始搭建方案：${title}`,
          content: "正在创建流程节点，并确定它在处理链路中的位置。",
          status: "running",
        });
      });
      step(2300, () => {
        updateAgentEvent(buildEventId, { status: "done", content: `${title}已创建，开始为该节点选择可执行工具。` });
        setNodesRuntime(nodes, { status: "selectingTool" });
        selectEventId = pushAgentEvent({
          role: "thought",
          title: "ToolCall · 选择工具",
          content: toolText,
          status: "running",
          kind: "toolCall",
        });
      });
      step(2300, () => {
        updateAgentEvent(selectEventId, { status: "done", content: `${nodes.map((node) => node.toolName).join("、")} 已选中。` });
        setNodesRuntime(nodes, { status: "configuring", visibleParamCount: 0 });
        configEventId = pushAgentEvent({
          role: "thought",
          title: "ToolCall · 配置工具参数",
          content: "正在根据样例试跑结果、工具 inputSchema 和上游输出路径生成本次执行参数。",
          status: "running",
          kind: "toolCall",
        });
      });
      [1, 2, 3, 4].forEach((count) => {
        step(900, () => setNodesRuntime(nodes, { status: "configuring", visibleParamCount: count }));
      });
      step(1600, () => {
        setNodesRuntime(nodes, { status: "done" });
        updateAgentEvent(configEventId, {
          status: "done",
          content: `${nodes.map((node) => node.toolName).join("、")} 参数配置完成，工具模块已收起为标准执行契约。`,
        });
      });
    };

    let analyzeEventId = "";
    let parseEventId = "";
    let queryEventId = "";
    let designEventId = "";
    let checkEventId = "";
    let resolveEventId = "";
    let recheckEventId = "";
    let executeEventId = "";
    let reviewTimer: number | null = null;
    let recheckTimer: number | null = null;

    step(800, () => {
      analyzeEventId = pushAgentEvent({
        role: "thought",
        title: "分析文档内容",
        content: "正在读取样例文件的基础信息、页数、格式和可能的内容结构。",
        status: "running",
      });
    });
    step(2800, () => {
      updateAgentEvent(analyzeEventId, { status: "done", content: "样例文件基础信息读取完成：PDF，医保政策类文档，包含条款和问答式说明。" });
      parseEventId = pushAgentEvent({
        role: "thought",
        title: "开始分析文档",
        content: "正在抽取目录层级、段落结构、表格区域和可用于分片的边界信号。",
        status: "running",
      });
    });
    step(3200, () => {
      updateAgentEvent(parseEventId, { status: "done", content: "文档分析完成：识别到政策标题、适用范围、办理条件、材料清单、问答说明。" });
      setSampleFiles((current) => current.map((file) => ({ ...file, status: "试跑中" })));
      queryEventId = pushAgentEvent({
        role: "thought",
        title: "ToolCall · 查询可用工具",
        content: "正在从管理端工具分类中查询可用于文档解析、分片、存储和智能生成的 MCP 工具。",
        status: "running",
        kind: "toolCall",
      });
    });
    step(3000, () => {
      updateAgentEvent(queryEventId, { status: "done", content: "查询到 14 个可用工具，其中 2 个系统工具、12 个外部接入工具。" });
      designEventId = pushAgentEvent({
        role: "thought",
        title: "开始设计处理方案",
        content: "正在根据用户目标、样例结构和工具能力设计文档处理链路。",
        status: "running",
      });
    });
    step(3300, () => {
      updateAgentEvent(designEventId, {
        status: "done",
        content: "方案设计完成。先搭建主链路，再检查工具输出与下游入参是否需要适配。",
        kind: "flow",
        flowSteps: ["文档解析", "文本分片", "数据存储", "智能生成"],
      });
    });

    buildToolNode([parser], [parser], "文档解析节点", "正在比对通用解析、多模态解析、医保政策解析，优先选择对政策条款结构更稳定的工具。");
    buildToolNode([splitter], [parser, splitter], "内容处理节点", "正在比对通用分片、递归分片、医保政策分片，先选择递归分片进行样例试跑。");
    buildToolNode([storage], [parser, splitter, storage], "数据存储节点", "正在选择可持久化中间结果的系统工具，目标为 ES 索引写入。");
    buildToolNode([qa, summary], draftNodes, "智能生成节点", "正在选择问答提取和摘要工具，作为同一智能生成节点下的两个处理工具。");

    step(2200, () => {
      checkEventId = pushAgentEvent({
        role: "thought",
        title: "开始检查完整链路",
        content: "正在从上到下检查每个节点的输入、输出、变量路径和存储位置。",
        status: "running",
      });
      reviewTimer = startReviewScan(draftNodes);
    });
    step(7200, () => {
      if (reviewTimer) window.clearInterval(reviewTimer);
      setReviewScanIndex(null);
      clearConnectionStatuses(draftNodes);
      setConnectionStatus(parser.category, splitter.category, "error");
      updateAgentEvent(checkEventId, {
        status: "done",
        content: "发现适配问题：医保政策解析返回 sections[].content，分片工具需要 data.cleanBlocks。",
      });
      resolveEventId = pushAgentEvent({
        role: "thought",
        title: "开始处理适配问题",
        content: "正在准备插入代码节点，把客户自建工具输出转换为平台标准变量。",
        status: "running",
      });
      setConnectionStatus(parser.category, splitter.category, "resolving");
    });

    buildToolNode([adapter], finalNodes, "代码适配节点", "正在选择系统代码工具，用于将 sections[].content 转换为 data.cleanBlocks。");

    step(2000, () => {
      setConnectionStatus(parser.category, adapter.category, "resolved");
      setConnectionStatus(adapter.category, splitter.category, "resolved");
      updateAgentEvent(resolveEventId, {
        status: "done",
        content: "适配问题已解决：代码工具输出 data.cleanBlocks，分片工具可直接引用。",
      });
    });
    step(2200, () => {
      setConnectionStatus(parser.category, adapter.category, "normal");
      setConnectionStatus(adapter.category, splitter.category, "normal");
      recheckEventId = pushAgentEvent({
        role: "thought",
        title: "检查完整方案",
        content: "正在重新检查完整方案的节点顺序、输入输出映射和执行契约。",
        status: "running",
      });
      recheckTimer = startReviewScan(finalNodes);
    });
    step(6800, () => {
      if (recheckTimer) window.clearInterval(recheckTimer);
      setReviewScanIndex(null);
      clearConnectionStatuses(finalNodes);
      updateAgentEvent(recheckEventId, {
        status: "done",
        content: "方案检查通过：节点顺序、工具参数、变量承接和存储策略均可执行。",
      });
    });
    step(1800, () => {
      executeEventId = pushAgentEvent({
        role: "thought",
        title: "执行方案处理样例文件",
        content: "正在用最终方案执行样例文件，验证每个节点的工具调用结果。",
        status: "running",
        kind: "toolCall",
      });
    });
    finalNodes.forEach((node, index) => {
      step(1700, () => {
        setNodeRuntime(node, { status: "running" });
      });
      step(1200, () => {
        setNodeRuntime(node, { status: "success" });
      });
    });
    step(2000, () => {
      clearConnectionStatuses(finalNodes);
      setNodesRuntime(finalNodes, { status: "success" });
      updateAgentEvent(executeEventId, {
        status: "done",
        content: "方案执行完成：所有节点执行成功，分片结果已写入 ES，问答和摘要结果已生成。",
      });
      setSampleFiles((current) => current.map((file) => ({ ...file, status: "已完成" })));
      setSampleResults(filesSnapshot.map(createSampleResult));
      pushAgentEvent({
        role: "agent",
        title: "方案生成与样例执行完成",
        content: "已完成方案搭建、链路检查、适配修复和样例试跑，可以保存为正式处理方案。",
        status: "done",
      });
      setIsAgentRunning(false);
      toast.success("Agent 已完成方案生成和样例执行");
    });
  };

  const sendAgentInstruction = () => {
    const instruction = agentInput.trim();
    if (!instruction) return;
    setAgentInput("");
    setIsAgentRunning(true);
    appendAgentEvent({ role: "user", title: "调整意见", content: instruction, status: "done" });
    const optimizeEventId = appendAgentEvent({
      role: "thought",
      title: "重新评估方案",
      content: "根据新的处理目标重新检查工具链、变量承接和存储位置。",
      status: "running",
    });
    setTimeout(() => {
      setPlanNodes(createAgentOptimizedPlanNodes());
      setConfirmed(false);
      setRightTab(1);
      updateAgentEvent(optimizeEventId, {
        status: "done",
        content: "已将分片工具调整为医保政策解析分片，并保留代码工具作为客户自建工具输出适配层。",
      });
      appendAgentEvent({
        role: "agent",
        title: "方案已调整",
        content: "右侧流程已同步更新。代码工具继续输出 data.cleanBlocks，分片结果写入数据存储工具指定的 ES 目标。",
        status: "done",
      });
      setIsAgentRunning(false);
      toast.success("Agent 已调整处理方案");
    }, 850);
  };

  const updateNode = (nodeId: string, updater: (node: ToolNode) => ToolNode) => {
    setPlanNodes((current) => current.map((node) => (node.nodeId === nodeId ? updater(node) : node)));
  };

  const openAddTool = () => {
    setAddDialogOpen(true);
    setSelectedCategory("全部");
    setSelectedToolId(toolCatalog[0]?.id ?? "");
  };

  const addTool = () => {
    if (!canEdit || !currentTool || selectedToolAdded || selectedToolCategoryConfirmed) return;
    const upstreamNode = planNodes[planNodes.length - 1];
    const inputSource: InputSource = currentTool.input === "sampleFile" || !upstreamNode
      ? { type: "fixed" }
      : { type: "upstream", sourceNodeId: upstreamNode.nodeId, outputPath: upstreamNode.outputs[0]?.path ?? "data.result" };
    const node = createNode(
      currentTool.id,
      inputSource,
    );
    setPlanNodes((current) => insertNodeByCategory(current, { ...node, expanded: true, adjusted: true }));
    setAddDialogOpen(false);
    toast.success(`已添加工具，已归入${getPlanTitle(node.category)}`);
  };

  const removeNode = (nodeId: string) => {
    if (!isNodeEditable(nodeId)) return;
    setPlanNodes((current) => current.filter((node) => node.nodeId !== nodeId));
    setEditingNodeId((current) => (current === nodeId ? null : current));
    toast.success("已删除工具节点");
  };

  const confirmPlan = () => {
    if (allProblems.length > 0) {
      toast.error("当前方案仍存在校验问题");
      return;
    }
    setConfirmed(true);
    toast.success("处理方案已保存");
  };

  const onDropNode = (targetId: string) => {
    if (!draggingNodeId || draggingNodeId === targetId || !isNodeEditable(draggingNodeId) || !isNodeEditable(targetId)) return;
    const from = planNodes.findIndex((node) => node.nodeId === draggingNodeId);
    const to = planNodes.findIndex((node) => node.nodeId === targetId);
    if (from < 0 || to < 0) return;
    if (planNodes[from].category !== planNodes[to].category) return;
    const next = [...planNodes];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, { ...moved, adjusted: true });
    setPlanNodes(next);
    setDraggingNodeId(null);
  };

  const changeParam = (nodeId: string, paramId: string, value: ToolParam["value"]) => {
    if (!isNodeEditable(nodeId)) return;
    updateNode(nodeId, (node) => ({
      ...node,
      adjusted: true,
      params: node.params.map((param) => (param.id === paramId ? { ...param, value } : param)),
    }));
  };

  const updateInputParam = (nodeId: string, inputParamId: string) => {
    if (!isNodeEditable(nodeId)) return;
    updateNode(nodeId, (node) => ({ ...node, adjusted: true, inputParamId }));
  };

  const updateInputSource = (nodeId: string, source: InputSource) => {
    if (!isNodeEditable(nodeId)) return;
    updateNode(nodeId, (node) => ({ ...node, adjusted: true, inputSource: source }));
  };

  const toggleParamShowOnPage = (nodeId: string, paramId: string) => {
    if (!canEdit) return;
    updateNode(nodeId, (node) => ({
      ...node,
      params: node.params.map((param) => (param.id === paramId ? { ...param, showOnPage: !param.showOnPage } : param)),
    }));
  };

  const moveCategoryTo = (sectionId: string, targetSectionId: string) => {
    if (!canEdit || sectionId === targetSectionId) return;
    const from = categorySections.findIndex((section) => section.sectionId === sectionId);
    const to = categorySections.findIndex((section) => section.sectionId === targetSectionId);
    if (from < 0 || to < 0) return;
    const nextSections = [...categorySections];
    const [moved] = nextSections.splice(from, 1);
    nextSections.splice(to, 0, moved);
    setPlanNodes(nextSections.flatMap((section) => section.nodes));
    setDraggingCategory(null);
  };

  return (
    <Box sx={{ height: "calc(100vh - 104px)", display: "flex", flexDirection: "column" }}>
      <Box sx={{ display: "grid", gridTemplateColumns: "248px minmax(360px, 1fr) 420px", gap: 2, minHeight: 0, flex: 1 }}>
        <Paper elevation={0} sx={{ border: "1px solid #E0E8F2", borderRadius: "12px", bgcolor: "#fff", p: 1.5, minHeight: 0 }}>
          <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#374151", mb: 1 }}>样例文件上传</Typography>
          <input
            ref={fileInputRef}
            hidden
            multiple
            type="file"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
            onChange={(event) => handleSampleFileChange(event.target.files)}
          />
          <Box
            onClick={() => fileInputRef.current?.click()}
            sx={{ border: "1px dashed #cbd5e1", borderRadius: "12px", bgcolor: "#FBFCFF", p: 2, textAlign: "center", cursor: "pointer", transition: "0.18s", "&:hover": { borderColor: "#801AEB", bgcolor: "#faf5ff" } }}
          >
            <UploadFile sx={{ color: "#801AEB", mb: 0.5 }} />
            <Typography sx={{ fontSize: 12, color: "#475569", fontWeight: 700 }}>点击上传样例文件</Typography>
            <Typography sx={{ fontSize: 11, color: "#94a3b8", mt: 0.5 }}>支持 PDF、Word、Excel、TXT</Typography>
          </Box>
          <Button fullWidth variant="text" onClick={addDemoSample} sx={{ mt: 0.75, fontSize: 12, color: "#801AEB", textTransform: "none" }}>导入演示样例</Button>
          <Stack spacing={0.75} sx={{ mt: 1.25, maxHeight: 190, overflow: "auto" }}>
            {sampleFiles.length === 0 ? (
              <Box sx={{ bgcolor: "#F8FAFC", borderRadius: "10px", p: 1.25, color: "#94a3b8", fontSize: 12 }}>暂无样例文件</Box>
            ) : sampleFiles.map((file) => (
              <Box key={file.id} sx={{ p: 1, border: "1px solid #E2E8F0", borderRadius: "10px", bgcolor: "#fff", display: "flex", gap: 0.8, alignItems: "center" }}>
                <Box sx={{ width: 30, height: 30, borderRadius: "8px", bgcolor: "#f1f5f9", color: "#475569", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800 }}>{file.type}</Box>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file.name}</Typography>
                  <Typography sx={{ fontSize: 11, color: "#94a3b8" }}>{file.size}</Typography>
                </Box>
                <Chip label={file.status} size="small" sx={{ height: 20, fontSize: 10, bgcolor: file.status === "已完成" ? "#f0fdf4" : file.status === "试跑中" ? "#fff7ed" : "#f8fafc", color: file.status === "已完成" ? "#16a34a" : file.status === "试跑中" ? "#c2410c" : "#64748b" }} />
              </Box>
            ))}
          </Stack>
          <Divider sx={{ my: 2 }} />
          <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#374151", mb: 1 }}>已标记问题</Typography>
          <Box sx={{ bgcolor: "#F8FAFC", borderRadius: "10px", p: 1.5, color: "#64748b", fontSize: 12, lineHeight: 1.5 }}>客户自建解析工具可能不声明输出，需要验证后置工具承接。</Box>
          <Stack spacing={1} sx={{ mt: 2 }}>
            <Button disabled={sampleFiles.length === 0 || isAgentRunning} onClick={sendSamplesToAgent} startIcon={isAgentRunning ? <CircularProgress size={14} color="inherit" /> : <Send />} variant="contained" sx={{ textTransform: "none", bgcolor: "#801AEB", "&:hover": { bgcolor: "#6D16C9" }, "&.Mui-disabled": { bgcolor: "#ede9fe", color: "#8b5cf6" } }}>发送所选文件给智能体</Button>
            <Button disabled={sampleFiles.length === 0 || isAgentRunning} onClick={sendSamplesToAgent} startIcon={<Send />} variant="outlined" sx={{ textTransform: "none", color: "#801AEB", borderColor: "#ddd6fe" }}>发送所选问题给智能体</Button>
          </Stack>
        </Paper>

        <Paper elevation={0} sx={{ border: "1px solid #E0E8F2", borderRadius: "12px", bgcolor: "#fff", minHeight: 0, display: "flex", flexDirection: "column" }}>
          <Box sx={{ p: 2, borderBottom: "1px solid #EEF2F7", display: "flex", gap: 1, alignItems: "center" }}>
            <AutoAwesome sx={{ color: "#801AEB", fontSize: 20 }} />
            <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#1f2937" }}>处理方案生成助手</Typography>
          </Box>
          <Box ref={agentStreamRef} sx={{ p: 2, flex: 1, overflow: "auto", bgcolor: "#FBFCFF" }}>
            <Stack spacing={1.1}>
              {agentEvents.map((event) => <AgentEventCard key={event.id} event={event} />)}
            </Stack>
          </Box>
          <Box sx={{ p: 1.5, borderTop: "1px solid #EEF2F7", display: "flex", gap: 1 }}>
            <TextField
              fullWidth
              size="small"
              value={agentInput}
              placeholder="输入问题或调整意见，例如：政策条款要优先保留层级…"
              onChange={(event) => setAgentInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key !== "Enter" || event.shiftKey) return;
                event.preventDefault();
                sendAgentInstruction();
              }}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px", fontSize: 13 } }}
            />
            <IconButton onClick={sendAgentInstruction} disabled={!canEdit || isAgentRunning || !agentInput.trim()} sx={{ bgcolor: "#f5f3ff", color: "#801AEB", "&:hover": { bgcolor: "#ede9fe" }, "&.Mui-disabled": { bgcolor: "#f1f5f9", color: "#94a3b8" } }}>
              {isAgentRunning ? <CircularProgress size={18} color="inherit" /> : <Send />}
            </IconButton>
          </Box>
        </Paper>

        <Paper elevation={0} sx={{ border: "1px solid #E0E8F2", borderRadius: "12px", bgcolor: "#fff", minHeight: 0, display: "flex", flexDirection: "column" }}>
          <Tabs value={rightTab} onChange={(_, value) => setRightTab(value)} sx={{ px: 1.5, minHeight: 44, borderBottom: "1px solid #EEF2F7", "& .MuiTab-root": { minHeight: 44, fontSize: 13 }, "& .Mui-selected": { color: "#801AEB !important" }, "& .MuiTabs-indicator": { bgcolor: "#801AEB" } }}>
            <Tab label="样例" />
            <Tab label="方案" />
            <Tab label="历史版本" />
          </Tabs>

          {rightTab === 0 ? (
            <SampleResultPanel files={sampleFiles} results={sampleResults} />
          ) : rightTab === 1 ? (
            <Box sx={{ minHeight: 0, display: "flex", flexDirection: "column", flex: 1 }}>
              <Box sx={{ px: 1.5, py: 1.25, borderBottom: "1px solid #EEF2F7", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontSize: 13, fontWeight: 800, color: "#111827" }}>{displayCategory} · {displayFormType}</Typography>
                  <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mt: 0.5 }}>
                    <Chip label={`${categorySections.length} 个流程节点`} size="small" sx={{ height: 20, fontSize: 10.5, bgcolor: "#f5f3ff", color: "#6d28d9" }} />
                    <Chip label={`${planNodes.length} 个工具`} size="small" sx={{ height: 20, fontSize: 10.5, bgcolor: "#eff6ff", color: "#2563eb" }} />
                    <Chip label={isAgentRunning ? "生成中" : confirmed ? "已保存" : visibleProblems.length ? "存在问题" : "待确认"} size="small" sx={{ height: 20, fontSize: 10.5, bgcolor: isAgentRunning ? "#fff7ed" : confirmed ? "#f0fdf4" : visibleProblems.length ? "#fef2f2" : "#f8fafc", color: isAgentRunning ? "#c2410c" : confirmed ? "#16a34a" : visibleProblems.length ? "#dc2626" : "#64748b" }} />
                  </Stack>
                </Box>
                <Tooltip title="添加工具">
                  <span>
                    <IconButton size="small" aria-label="添加工具" disabled={!canEdit} onClick={openAddTool} sx={{ width: 30, height: 30, bgcolor: "#801AEB", color: "#fff", borderRadius: "8px", "&:hover": { bgcolor: "#6D16C9" }, "&.Mui-disabled": { bgcolor: "#e5e7eb", color: "#9ca3af" } }}>
                      <Add fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
              </Box>
              <Box sx={{ p: 1.5, minHeight: 0, overflow: "auto", flex: 1 }}>
                <Stack spacing={0}>
                  {categorySections.map((section, index) => (
                    <WorkflowNodeCard
                      key={section.sectionId}
                      index={index}
                      total={categorySections.length}
                      section={section}
                      connectionStatus={categorySections[index + 1] ? connectionStates[getConnectionKey(section.category, categorySections[index + 1].category)] ?? "normal" : "normal"}
                      isReviewScanActive={reviewScanIndex === index}
                      runtimeStates={nodeRuntimeStates}
                      canEdit={canEdit}
                      warnings={displayedNodeWarnings}
                      onEditTool={(nodeId) => setEditingNodeId(nodeId)}
                      onRemoveTool={removeNode}
                      onNodeDragStart={() => setDraggingCategory(section.sectionId)}
                      onNodeDrop={() => draggingCategory && moveCategoryTo(draggingCategory, section.sectionId)}
                      onToolDragStart={(nodeId) => setDraggingNodeId(nodeId)}
                      onToolDrop={onDropNode}
                    />
                  ))}
                </Stack>
              </Box>
              <Box sx={{ p: 1.5, borderTop: "1px solid #EEF2F7", bgcolor: "#fff" }}>
                {visibleProblems.length > 0 && (
                  <Box sx={{ mb: 1, p: 1, borderRadius: "8px", bgcolor: "#fef2f2", border: "1px solid #fecaca" }}>
                    <Typography sx={{ fontSize: 12, color: "#b91c1c" }}>当前方案存在 {visibleProblems.length} 个校验问题，请处理后保存。</Typography>
                  </Box>
                )}
                <Button fullWidth startIcon={<FactCheck />} onClick={confirmPlan} disabled={!canEdit || isAgentRunning || visibleProblems.length > 0} variant="contained" sx={{ bgcolor: isAgentRunning || visibleProblems.length ? "#cbd5e1" : "#801AEB", borderRadius: "10px", textTransform: "none", "&:hover": { bgcolor: isAgentRunning || visibleProblems.length ? "#cbd5e1" : "#6D16C9" } }}>
                  保存为处理方案
                </Button>
              </Box>
            </Box>
          ) : (
            <Box sx={{ p: 2, color: "#94a3b8", fontSize: 13 }}>暂无历史版本。</Box>
          )}
        </Paper>
      </Box>

      <AddToolDialog
        open={addDialogOpen}
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={(category) => {
          setSelectedCategory(category);
          const nextTool = (category === "全部" ? toolCatalog : toolCatalog.filter((tool) => tool.category === category))[0];
          setSelectedToolId(nextTool?.id ?? "");
        }}
        tools={filteredTools}
        selectedToolId={selectedToolId}
        onToolChange={(toolId) => {
          setSelectedToolId(toolId);
        }}
        currentTool={currentTool}
        addedToolIds={addedToolIds}
        selectedToolAdded={selectedToolAdded}
        selectedToolCategoryConfirmed={selectedToolCategoryConfirmed}
        onClose={() => setAddDialogOpen(false)}
        onAdd={addTool}
      />
      <ToolEditDrawer
        open={Boolean(editingNode)}
        node={editingNode}
        allNodes={planNodes}
        canEdit={editingNode ? isNodeEditable(editingNode.nodeId) : false}
        onClose={() => setEditingNodeId(null)}
        onInputParamChange={updateInputParam}
        onInputSourceChange={updateInputSource}
        onParamChange={changeParam}
        onToggleShowOnPage={toggleParamShowOnPage}
      />
    </Box>
  );
}

function AgentEventCard({ event }: { event: AgentEvent }) {
  const isUser = event.role === "user";
  const isThought = event.role === "thought";
  const isToolCall = event.kind === "toolCall";
  return (
    <Box sx={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start" }}>
      <Box sx={{ maxWidth: isUser ? 520 : 580, p: 1.35, borderRadius: "13px", bgcolor: isUser ? "#801AEB" : isThought ? "#fff7ed" : "#fff", color: isUser ? "#fff" : "#111827", border: isUser ? "none" : `1px solid ${isThought ? "#fed7aa" : "#E0E8F2"}`, boxShadow: isUser ? "0 10px 22px rgba(128, 26, 235, 0.16)" : "0 8px 20px rgba(15, 23, 42, 0.04)" }}>
        <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mb: 0.45 }}>
          {event.status === "running" ? <CircularProgress size={13} color="inherit" /> : isThought ? <AutoAwesome sx={{ fontSize: 15, color: "#c2410c" }} /> : null}
          <Typography sx={{ fontSize: 12.5, fontWeight: 800, color: isUser ? "#fff" : isThought ? "#9a3412" : "#111827" }}>{event.title}</Typography>
          {isToolCall && <Chip label="ToolCall" size="small" sx={{ height: 18, fontSize: 10, bgcolor: "#eef2ff", color: "#4338ca" }} />}
          {event.status === "done" && isThought && <Chip label="完成" size="small" sx={{ height: 18, fontSize: 10, bgcolor: "#ffedd5", color: "#c2410c" }} />}
        </Stack>
        <Typography sx={{ fontSize: 13, lineHeight: 1.7, color: isUser ? "rgba(255,255,255,0.92)" : isThought ? "#7c2d12" : "#374151" }}>{event.content}</Typography>
        {event.flowSteps?.length ? (
          <Stack direction="row" spacing={0.6} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
            {event.flowSteps.map((step, index) => (
              <Stack key={step} direction="row" spacing={0.6} alignItems="center">
                <Chip label={step} size="small" sx={{ height: 22, fontSize: 11, bgcolor: "#f5f3ff", color: "#6d28d9", fontWeight: 700 }} />
                {index < (event.flowSteps?.length ?? 0) - 1 && <Typography sx={{ fontSize: 12, color: "#a78bfa" }}>→</Typography>}
              </Stack>
            ))}
          </Stack>
        ) : null}
      </Box>
    </Box>
  );
}

function SampleResultPanel({ files, results }: { files: SampleFileItem[]; results: SampleProcessResult[] }) {
  return (
    <Box sx={{ p: 1.5, minHeight: 0, overflow: "auto", flex: 1 }}>
      {files.length === 0 ? (
        <Box sx={{ height: "100%", minHeight: 220, border: "1px dashed #d8dce5", borderRadius: "12px", bgcolor: "#FBFCFF", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", px: 3 }}>
          <Box>
            <UploadFile sx={{ color: "#94a3b8", mb: 1 }} />
            <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#475569" }}>还没有样例文件</Typography>
            <Typography sx={{ mt: 0.5, fontSize: 12, color: "#94a3b8" }}>上传并发送给 Agent 后，这里会展示试跑结果。</Typography>
          </Box>
        </Box>
      ) : (
        <Stack spacing={1}>
          {files.map((file) => {
            const result = results.find((item) => item.fileId === file.id);
            return (
              <Box key={file.id} sx={{ border: "1px solid #E0E8F2", borderRadius: "12px", bgcolor: "#fff", overflow: "hidden" }}>
                <Box sx={{ px: 1.25, py: 1, bgcolor: "#FBFCFF", borderBottom: "1px solid #EEF2F7", display: "flex", alignItems: "center", gap: 0.8 }}>
                  <Box sx={{ width: 28, height: 28, borderRadius: "8px", bgcolor: "#f1f5f9", color: "#475569", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800 }}>{file.type}</Box>
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography sx={{ fontSize: 13, fontWeight: 800, color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file.name}</Typography>
                    <Typography sx={{ fontSize: 11, color: "#94a3b8" }}>{file.size}</Typography>
                  </Box>
                  <Chip label={file.status} size="small" sx={{ height: 20, fontSize: 10, bgcolor: file.status === "已完成" ? "#f0fdf4" : file.status === "试跑中" ? "#fff7ed" : "#f8fafc", color: file.status === "已完成" ? "#16a34a" : file.status === "试跑中" ? "#c2410c" : "#64748b" }} />
                </Box>
                <Stack spacing={0.8} sx={{ p: 1.25 }}>
                  <ResultLine label="结构识别" value={result?.structure ?? "等待 Agent 试跑样例文件。"} />
                  <ResultLine label="解析结果" value={result?.parserResult ?? "待生成"} />
                  <ResultLine label="连接适配" value={result?.adapterResult ?? "待判断是否需要适配"} highlight={Boolean(result?.adapterResult)} />
                  <ResultLine label="存储策略" value={result?.storageTarget ?? "待生成"} />
                </Stack>
              </Box>
            );
          })}
        </Stack>
      )}
    </Box>
  );
}

function ResultLine({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <Box sx={{ display: "grid", gridTemplateColumns: "64px minmax(0, 1fr)", columnGap: 1, alignItems: "start" }}>
      <Typography sx={{ fontSize: 11.5, color: "#94a3b8", fontWeight: 800 }}>{label}</Typography>
      <Typography sx={{ fontSize: 12.5, color: highlight ? "#6d28d9" : "#374151", lineHeight: 1.55 }}>{value}</Typography>
    </Box>
  );
}

function ConnectionStatusBadge({ status }: { status: ConnectionStatus }) {
  const config = {
    error: { title: "衔接异常", color: "#f97316", bgcolor: "#fff7ed", border: "#fed7aa", icon: <ErrorOutline sx={{ fontSize: 15 }} /> },
    resolving: { title: "解决中", color: "#7c3aed", bgcolor: "#f5f3ff", border: "#ddd6fe", icon: <Sync sx={{ fontSize: 15, animation: "spin 1.1s linear infinite" }} /> },
    resolved: { title: "已解决", color: "#16a34a", bgcolor: "#f0fdf4", border: "#bbf7d0", icon: <CheckCircleOutline sx={{ fontSize: 15 }} /> },
    normal: { title: "", color: "#64748b", bgcolor: "#fff", border: "#e2e8f0", icon: null },
  }[status];

  return (
    <Tooltip title={config.title}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 26,
          height: 26,
          borderRadius: "9px",
          bgcolor: config.bgcolor,
          border: `1px solid ${config.border}`,
          color: config.color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 8px 18px rgba(15, 23, 42, 0.12)",
          "@keyframes spin": {
            from: { transform: "rotate(0deg)" },
            to: { transform: "rotate(360deg)" },
          },
        }}
      >
        {config.icon}
      </Box>
    </Tooltip>
  );
}

function WorkflowNodeCard({
  index,
  total,
  section,
  connectionStatus,
  isReviewScanActive,
  runtimeStates,
  canEdit,
  warnings,
  onEditTool,
  onRemoveTool,
  onNodeDragStart,
  onNodeDrop,
  onToolDragStart,
  onToolDrop,
}: {
  index: number;
  total: number;
  section: { sectionId: string; category: string; nodes: ToolNode[] };
  connectionStatus: ConnectionStatus;
  isReviewScanActive: boolean;
  runtimeStates: Record<string, NodeRuntimeState>;
  canEdit: boolean;
  warnings: Record<string, string[]>;
  onEditTool: (nodeId: string) => void;
  onRemoveTool: (nodeId: string) => void;
  onNodeDragStart: () => void;
  onNodeDrop: () => void;
  onToolDragStart: (nodeId: string) => void;
  onToolDrop: (nodeId: string) => void;
}) {
  const nodeProblems = section.nodes.flatMap((node) => warnings[node.nodeId] ?? []);
  const hasWarning = nodeProblems.length > 0;
  const isCardBuilding = section.nodes.some((node) => ["building", "selectingTool", "configuring"].includes(runtimeStates[node.nodeId]?.status ?? ""));
  const isReviewing = isReviewScanActive;
  const isSectionRunning = section.nodes.some((node) => runtimeStates[node.nodeId]?.status === "running");
  const sequenceBg = hasWarning ? "#f97316" : isSectionRunning ? "#7c3aed" : isReviewing ? "#801AEB" : "#111827";

  return (
    <Box sx={{ display: "grid", gridTemplateColumns: "36px minmax(0, 1fr)", columnGap: 1.1 }}>
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Box
          sx={{
            width: 30,
            height: 30,
            borderRadius: "12px",
            bgcolor: sequenceBg,
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
            fontWeight: 800,
            boxShadow: isReviewing ? "0 0 0 8px rgba(128, 26, 235, 0.2), 0 12px 26px rgba(128, 26, 235, 0.28)" : "0 8px 18px rgba(17, 24, 39, 0.16)",
            animation: isReviewing ? "reviewNodeScan 1.8s ease-in-out infinite" : "none",
            animationDelay: `${index * 180}ms`,
            "@keyframes reviewNodeScan": {
              "0%, 100%": { boxShadow: "0 0 0 2px rgba(128, 26, 235, 0.08), 0 8px 18px rgba(17, 24, 39, 0.12)" },
              "45%": { boxShadow: "0 0 0 10px rgba(128, 26, 235, 0.24), 0 14px 28px rgba(128, 26, 235, 0.28)" },
            },
          }}
        >
          {isSectionRunning ? <CircularProgress size={14} color="inherit" /> : String(index + 1).padStart(2, "0")}
        </Box>
        {index < total - 1 && (
          <Box sx={{ position: "relative", width: 24, flex: 1, minHeight: 32, my: 0.5, display: "flex", justifyContent: "center" }}>
            <Box
              sx={{
                width: 2,
                height: "100%",
                bgcolor: connectionStatus === "error" ? "#f97316" : connectionStatus === "resolving" ? "#a855f7" : connectionStatus === "resolved" ? "#22c55e" : isReviewScanActive ? "#801AEB" : "#e2e8f0",
                borderRadius: 999,
                boxShadow: isReviewScanActive ? "0 0 0 6px rgba(128, 26, 235, 0.16)" : "none",
                animation: isReviewScanActive ? "scanLine 1.2s ease-in-out infinite" : "none",
                animationDelay: `${index * 180 + 100}ms`,
                "@keyframes scanLine": {
                  "0%, 100%": { opacity: 0.25, boxShadow: "none" },
                  "45%": { opacity: 1, boxShadow: "0 0 0 8px rgba(128, 26, 235, 0.2)" },
                },
              }}
            />
            {connectionStatus !== "normal" && <ConnectionStatusBadge status={connectionStatus} />}
          </Box>
        )}
      </Box>

      <Box
        draggable={canEdit}
        onDragStart={canEdit ? onNodeDragStart : undefined}
        onDragOver={canEdit ? (event) => event.preventDefault() : undefined}
        onDrop={canEdit ? onNodeDrop : undefined}
        sx={{
          mb: index < total - 1 ? 1.25 : 0,
          border: "1px solid",
          borderColor: hasWarning ? "#fed7aa" : isCardBuilding ? "#c4b5fd" : "#e2e8f0",
          borderRadius: "14px",
          bgcolor: "#fff",
          overflow: "hidden",
          boxShadow: isCardBuilding ? "0 0 0 5px rgba(128, 26, 235, 0.1), 0 14px 30px rgba(128, 26, 235, 0.12)" : "0 10px 28px rgba(15, 23, 42, 0.06)",
          animation: isCardBuilding ? "pulseCard 1.6s ease-in-out infinite" : "none",
          "@keyframes pulseCard": {
            "0%, 100%": { transform: "translateY(0)", boxShadow: "0 0 0 4px rgba(128, 26, 235, 0.08), 0 12px 26px rgba(128, 26, 235, 0.1)" },
            "50%": { transform: "translateY(-1px)", boxShadow: "0 0 0 8px rgba(128, 26, 235, 0.14), 0 18px 34px rgba(128, 26, 235, 0.16)" },
          },
        }}
      >
        <Box sx={{ px: 1.4, py: 1.15, display: "flex", alignItems: "center", gap: 0.75, background: "linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)", borderBottom: "1px solid #EEF2F7" }}>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography sx={{ fontSize: 14, fontWeight: 900, color: "#0f172a", lineHeight: 1.3 }}>{section.category}节点</Typography>
          </Box>
          {hasWarning && <Chip label="需处理" size="small" sx={{ height: 20, fontSize: 10.5, bgcolor: "#fff7ed", color: "#c2410c" }} />}
        </Box>

        <Stack spacing={0.8} sx={{ p: 1.2 }}>
          {nodeProblems.length > 0 && (
            <Stack spacing={0.5}>
              {nodeProblems.map((warning) => (
                <Stack key={warning} direction="row" spacing={0.6} alignItems="flex-start">
                  <WarningAmber sx={{ fontSize: 14, color: "#c2410c", mt: "2px" }} />
                  <Typography sx={{ fontSize: 11.5, color: "#9a3412", lineHeight: 1.5 }}>{warning}</Typography>
                </Stack>
              ))}
            </Stack>
          )}

          {section.nodes.map((node, toolIndex) => {
            const toolWarnings = warnings[node.nodeId] ?? [];
            const runtimeState = runtimeStates[node.nodeId];
            if (runtimeState?.status === "building" || runtimeState?.status === "selectingTool") {
              return <ToolPendingRow key={node.nodeId} status={runtimeState.status} />;
            }
            return (
              <ToolRuntimeRow
                key={node.nodeId}
                node={node}
                index={toolIndex}
                canEdit={canEdit}
                canDrag={canEdit && section.nodes.length > 1}
                warnings={toolWarnings}
                runtimeState={runtimeState}
                onEdit={() => onEditTool(node.nodeId)}
                onRemove={() => onRemoveTool(node.nodeId)}
                onDragStart={(event) => { event.stopPropagation(); onToolDragStart(node.nodeId); }}
                onDragOver={(event) => { event.preventDefault(); event.stopPropagation(); }}
                onDrop={(event) => { event.stopPropagation(); onToolDrop(node.nodeId); }}
              />
            );
          })}
        </Stack>
      </Box>
    </Box>
  );
}

function ToolPendingRow({ status }: { status: "building" | "selectingTool" }) {
  return (
    <Box
      sx={{
        px: 1,
        py: 0.95,
        borderRadius: "10px",
        bgcolor: "#fbf7ff",
        border: "1px dashed #c4b5fd",
        display: "flex",
        alignItems: "center",
        gap: 0.8,
        animation: "fadeInTool 0.28s ease-out both",
        "@keyframes fadeInTool": {
          from: { opacity: 0, transform: "translateY(4px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
      }}
    >
      <CircularProgress size={14} sx={{ color: "#801AEB" }} />
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ fontSize: 13, fontWeight: 800, color: "#111827" }}>
          {status === "building" ? "正在创建节点..." : "正在选择工具..."}
        </Typography>
        <Typography sx={{ mt: 0.15, fontSize: 11, color: "#7c3aed" }}>
          {status === "building" ? "Agent 正在确定节点位置" : "工具选择完成后显示工具模块"}
        </Typography>
      </Box>
    </Box>
  );
}

function ToolRuntimeRow({
  node,
  index,
  canEdit,
  canDrag,
  warnings,
  runtimeState,
  onEdit,
  onRemove,
  onDragStart,
  onDragOver,
  onDrop,
}: {
  node: ToolNode;
  index: number;
  canEdit: boolean;
  canDrag: boolean;
  warnings: string[];
  runtimeState?: NodeRuntimeState;
  onEdit: () => void;
  onRemove: () => void;
  onDragStart: (event: DragEvent<HTMLDivElement>) => void;
  onDragOver: (event: DragEvent<HTMLDivElement>) => void;
  onDrop: (event: DragEvent<HTMLDivElement>) => void;
}) {
  const status = runtimeState?.status ?? "done";
  const isExpanded = status === "configuring";
  const isActive = ["configuring", "running"].includes(status);
  const visibleParamCount = runtimeState?.visibleParamCount ?? 0;
  const visibleParams = node.params.filter((param) => isParamVisible(node, param)).slice(0, Math.max(visibleParamCount, 0));
  const statusText = {
    building: "创建节点中",
    selectingTool: "选择工具中",
    configuring: "配置参数中",
    done: "",
    running: "",
    success: "",
  }[status];
  const statusColor = {
    building: "#801AEB",
    selectingTool: "#2563eb",
    configuring: "#c2410c",
    done: "#64748b",
    running: "#7c3aed",
    success: "#16a34a",
  }[status];

  return (
    <Box
      draggable={canDrag}
      onDragStart={canDrag ? onDragStart : undefined}
      onDragOver={canDrag ? onDragOver : undefined}
      onDrop={canDrag ? onDrop : undefined}
      sx={{
        px: 1,
        py: 0.9,
        borderRadius: "10px",
        bgcolor: warnings.length ? "#fff7ed" : isActive ? "#fbf7ff" : status === "success" ? "#f0fdf4" : "#f8fafc",
        border: `1px solid ${warnings.length ? "#fed7aa" : isActive ? "#ddd6fe" : status === "success" ? "#bbf7d0" : "#e2e8f0"}`,
        boxShadow: isActive ? "0 8px 20px rgba(128, 26, 235, 0.08)" : "none",
        animation: "fadeInTool 0.32s ease-out both",
        transition: "background-color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease",
        "&:hover .tool-actions": { opacity: 1, pointerEvents: "auto" },
        "@keyframes fadeInTool": {
          from: { opacity: 0, transform: "translateY(5px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
        <Box sx={{ width: 22, height: 22, borderRadius: "8px", bgcolor: "#fff", color: statusColor, border: `1px solid ${isActive ? "#ddd6fe" : "#e2e8f0"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, flexShrink: 0 }}>
          {status === "running" ? <CircularProgress size={12} color="inherit" /> : status === "success" ? <CheckCircleOutline sx={{ fontSize: 14 }} /> : index + 1}
        </Box>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography sx={{ fontSize: 13, fontWeight: 800, color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {status === "building" ? "正在创建工具模块..." : status === "selectingTool" ? "正在选择工具..." : node.toolName}
          </Typography>
          {statusText && <Typography sx={{ mt: 0.15, fontSize: 11, color: statusColor }}>{statusText}</Typography>}
        </Box>
        {status === "configuring" && <CircularProgress size={16} sx={{ color: "#c2410c" }} />}
        {canEdit && (
          <Stack className="tool-actions" direction="row" spacing={0.25} sx={{ opacity: 0, pointerEvents: "none", transition: "opacity 0.16s ease" }}>
            <Tooltip title="编辑工具配置"><span><IconButton disabled={!canEdit} size="small" onClick={onEdit} sx={{ color: "#801AEB", width: 24, height: 24 }}><EditOutlined sx={{ fontSize: 15 }} /></IconButton></span></Tooltip>
            <Tooltip title="删除工具"><span><IconButton disabled={!canEdit} size="small" onClick={onRemove} sx={{ color: "#ef4444", width: 24, height: 24 }}><DeleteOutline sx={{ fontSize: 15 }} /></IconButton></span></Tooltip>
          </Stack>
        )}
      </Box>
      <Box
        sx={{
          maxHeight: isExpanded ? 220 : 0,
          opacity: isExpanded ? 1 : 0,
          overflow: "hidden",
          mt: isExpanded ? 1 : 0,
          transition: "max-height 0.34s ease, opacity 0.22s ease, margin-top 0.34s ease",
        }}
      >
        <Box sx={{ p: 1, borderRadius: "9px", bgcolor: "#fff", border: "1px solid #fed7aa" }}>
          <Typography sx={{ fontSize: 11.5, fontWeight: 800, color: "#9a3412", mb: 0.75 }}>正在写入工具参数</Typography>
          <Stack spacing={0.55}>
            {visibleParams.length === 0 ? (
              <Typography sx={{ fontSize: 12, color: "#94a3b8" }}>等待 Agent 生成参数...</Typography>
            ) : visibleParams.map((param) => (
              <Box key={param.id} sx={{ display: "grid", gridTemplateColumns: "92px minmax(0, 1fr)", gap: 0.75, alignItems: "start" }}>
                <Typography sx={{ fontSize: 11.5, color: "#64748b", fontWeight: 700 }}>{param.label}</Typography>
                <Typography sx={{ fontSize: 11.5, color: "#111827", lineHeight: 1.45, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{getParamPreview(param)}</Typography>
              </Box>
            ))}
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}

function getParamPreview(param: ToolParam) {
  if (Array.isArray(param.value)) return param.value.length ? param.value.join("、") : "按样例结果自动生成";
  if (typeof param.value === "boolean") return param.value ? "开启" : "关闭";
  if (typeof param.value === "number") return `${param.value}${param.unit ?? ""}`;
  const value = param.value.trim();
  if (!value) return "引用上游工具输出";
  return value.length > 42 ? `${value.slice(0, 42)}...` : value;
}

function ParamField({ param, canEdit, onChange }: { param: ToolParam; canEdit: boolean; onChange: (value: ToolParam["value"]) => void }) {
  const commonSx = { "& .MuiOutlinedInput-root": { borderRadius: "9px", fontSize: 12 }, "& .MuiInputLabel-root": { fontSize: 12 } };
  if (param.type === "switch") {
    return (
      <FormControlLabel
        control={<Checkbox checked={Boolean(param.value)} disabled={!canEdit} onChange={(event) => onChange(event.target.checked)} sx={{ color: "#801AEB", "&.Mui-checked": { color: "#801AEB" } }} />}
        label={<Typography sx={{ fontSize: 12, color: "#374151" }}>{param.label}</Typography>}
      />
    );
  }
  if (param.type === "select") {
    return (
      <FormControl fullWidth size="small" sx={commonSx}>
        <InputLabel>{param.label}</InputLabel>
        <Select label={param.label} value={String(param.value)} disabled={!canEdit} MenuProps={elevatedSelectMenuProps} onChange={(event) => onChange(event.target.value)}>
          {(param.options ?? []).map((option) => <MenuItem key={option} value={option}>{option}</MenuItem>)}
        </Select>
      </FormControl>
    );
  }
  if (param.type === "multiSelect") {
    const selected = Array.isArray(param.value) ? param.value : [];
    return (
      <FormControl fullWidth size="small" sx={commonSx}>
        <InputLabel>{param.label}</InputLabel>
        <Select
          multiple
          label={param.label}
          value={selected}
          disabled={!canEdit}
          MenuProps={elevatedSelectMenuProps}
          renderValue={(value) => (value as string[]).join("、") || "未选择"}
          onChange={(event) => onChange(typeof event.target.value === "string" ? event.target.value.split(",") : event.target.value)}
        >
          {(param.options ?? []).map((option) => (
            <MenuItem key={option} value={option}>
              <Checkbox size="small" checked={selected.includes(option)} sx={{ p: 0.5, mr: 0.5, color: "#801AEB", "&.Mui-checked": { color: "#801AEB" } }} />
              {option}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    );
  }
  if (param.type === "textarea") return <TextField size="small" fullWidth multiline minRows={4} label={param.label} value={String(param.value)} disabled={!canEdit} onChange={(event) => onChange(event.target.value)} sx={commonSx} />;
  if (param.type === "number") return <TextField size="small" fullWidth type="number" label={param.label} value={Number(param.value)} disabled={!canEdit} onChange={(event) => onChange(Number(event.target.value))} sx={commonSx} />;
  if (param.type === "tags") {
    const tags = Array.isArray(param.value) ? param.value : [];
    const limit = param.max ?? 10;
    const addTag = (tag: string) => {
      const normalized = tag.trim();
      if (!normalized || tags.includes(normalized) || tags.length >= limit) return;
      onChange([...tags, normalized]);
    };
    const removeTag = (tag: string) => onChange(tags.filter((item) => item !== tag));
    return (
      <Box>
        <Typography sx={{ fontSize: 12, color: "#374151", mb: 0.75 }}>{param.label}</Typography>
        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mb: 1 }}>
          {tags.map((tag) => <Chip key={tag} label={tag} size="small" onDelete={canEdit ? () => removeTag(tag) : undefined} sx={{ bgcolor: "#f5f3ff", color: "#6d28d9" }} />)}
        </Stack>
        {canEdit && tags.length < limit && (
          <Stack spacing={1}>
            <FormControl fullWidth size="small" sx={commonSx}>
              <InputLabel>添加预置分隔符</InputLabel>
              <Select label="添加预置分隔符" value="" MenuProps={elevatedSelectMenuProps} onChange={(event) => addTag(event.target.value)}>
                {(param.options ?? []).map((option) => <MenuItem key={option} value={option}>{option}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField
              size="small"
              fullWidth
              label="自定义分隔符"
              placeholder="输入后按 Enter 添加"
              onKeyDown={(event) => {
                if (event.key !== "Enter") return;
                event.preventDefault();
                addTag((event.currentTarget as HTMLInputElement).value);
                (event.currentTarget as HTMLInputElement).value = "";
              }}
              sx={commonSx}
            />
          </Stack>
        )}
      </Box>
    );
  }
  return <TextField size="small" fullWidth label={param.label} value={String(param.value)} disabled={!canEdit} onChange={(event) => onChange(event.target.value)} sx={commonSx} />;
}

function ToolEditDrawer({
  open,
  node,
  allNodes,
  canEdit,
  onClose,
  onInputParamChange,
  onInputSourceChange,
  onParamChange,
  onToggleShowOnPage,
}: {
  open: boolean;
  node: ToolNode | null;
  allNodes: ToolNode[];
  canEdit: boolean;
  onClose: () => void;
  onInputParamChange: (nodeId: string, inputParamId: string) => void;
  onInputSourceChange: (nodeId: string, source: InputSource) => void;
  onParamChange: (nodeId: string, paramId: string, value: ToolParam["value"]) => void;
  onToggleShowOnPage: (nodeId: string, paramId: string) => void;
}) {
  if (!node) return null;
  const priorNodes = getPriorNodes(allNodes, node.nodeId);
  const inputParam = getToolInputParam(node);
  const configurableParams = node.params.filter((param) => param.id !== node.inputParamId && isParamVisible(node, param));
  const selectedSourceNode = node.inputSource.type === "upstream"
    ? priorNodes.find((item) => item.nodeId === node.inputSource.sourceNodeId) ?? null
    : null;
  const sourceInvalid = isInputSourceInvalid(node, allNodes);
  const isFirstInputLocked = isFirstCategoryFirstNode(node, allNodes);
  const fixedInputText = getFixedInputSourceText(node, allNodes);
  const inputFieldSx = { "& .MuiOutlinedInput-root": { borderRadius: "9px", fontSize: 12 }, "& .MuiInputLabel-root": { fontSize: 12 } };

  const setSourceType = (type: InputSource["type"]) => {
    if (type === "fixed") {
      onInputSourceChange(node.nodeId, { type: "fixed" });
      return;
    }
    const sourceNode = selectedSourceNode ?? priorNodes[0];
    if (!sourceNode) return;
    onInputSourceChange(node.nodeId, { type: "upstream", sourceNodeId: sourceNode.nodeId, outputPath: node.inputSource.outputPath || "content[0].text" });
  };

  const setSourceNode = (sourceNodeId: string) => {
    const sourceNode = priorNodes.find((item) => item.nodeId === sourceNodeId);
    if (!sourceNode) return;
    onInputSourceChange(node.nodeId, { type: "upstream", sourceNodeId: sourceNode.nodeId, outputPath: node.inputSource.outputPath || "content[0].text" });
  };

  const setOutputPath = (outputPath: string) => {
    if (!selectedSourceNode) return;
    onInputSourceChange(node.nodeId, { type: "upstream", sourceNodeId: selectedSourceNode.nodeId, outputPath });
  };


  return (
    <Drawer open={open} onClose={onClose} anchor="right" sx={{ zIndex: (theme) => theme.zIndex.modal + 20 }} PaperProps={{ sx: { width: 480, borderRadius: 0 } }}>
      <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <Box sx={{ px: 2, py: 1.5, borderBottom: "1px solid #EEF2F7", display: "flex", alignItems: "center", gap: 1 }}>
          <Box sx={{ width: 30, height: 30, borderRadius: "9px", bgcolor: "#f5f3ff", color: "#801AEB", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <EditOutlined fontSize="small" />
          </Box>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography sx={{ fontSize: 16, fontWeight: 800, color: "#111827" }}>{node.toolName}</Typography>
            <Typography sx={{ fontSize: 12, color: "#64748b" }}>
              {getPlanTitle(node.category)} · {node.status}
            </Typography>
          </Box>
          <IconButton onClick={onClose}><Close /></IconButton>
        </Box>

        <Box sx={{ p: 2, overflow: "auto", flex: 1, bgcolor: "#FBFCFF" }}>
          <Stack spacing={1.5}>
            <ConfigBlock title="工具输入">
              <Stack spacing={1.25}>
                {isFirstInputLocked ? (
                  <TextField size="small" fullWidth label="取值方式" value="待处理文件地址信息" disabled sx={{ "& .MuiOutlinedInput-root": { borderRadius: "9px", fontSize: 12 }, "& .MuiInputLabel-root": { fontSize: 12 } }} />
                ) : (
                  <FormControl fullWidth size="small" sx={inputFieldSx}>
                    <InputLabel>取值方式</InputLabel>
                    <Select label="取值方式" value={node.inputSource.type} disabled={!canEdit || priorNodes.length === 0} MenuProps={elevatedSelectMenuProps} onChange={(event) => setSourceType(event.target.value as InputSource["type"])}>
                      <MenuItem value="upstream">上游工具输出</MenuItem>
                      <MenuItem value="fixed">{fixedInputText}</MenuItem>
                    </Select>
                  </FormControl>
                )}
                {!isFirstInputLocked && node.inputSource.type === "upstream" ? (
                  <Stack spacing={1}>
                    <FormControl fullWidth size="small" sx={inputFieldSx}>
                      <InputLabel>选择上游工具</InputLabel>
                      <Select label="选择上游工具" value={selectedSourceNode?.nodeId ?? ""} disabled={!canEdit} MenuProps={elevatedSelectMenuProps} onChange={(event) => setSourceNode(event.target.value)}>
                        {priorNodes.map((item) => <MenuItem key={item.nodeId} value={item.nodeId}>{item.toolName}</MenuItem>)}
                      </Select>
                    </FormControl>
                    <TextField
                      size="small"
                      fullWidth
                      label="取值路径"
                      value={node.inputSource.outputPath ?? ""}
                      disabled={!canEdit || !selectedSourceNode}
                      onChange={(event) => setOutputPath(event.target.value)}
                      sx={inputFieldSx}
                    />
                    <Typography sx={{ fontSize: 12, color: "#64748b", lineHeight: 1.5 }}>
                      系统将从上游工具的原始输出中按该路径取值，并写入当前工具的输入参数。
                    </Typography>
                    {sourceInvalid && <Typography sx={{ fontSize: 12, color: "#c2410c" }}>输入配置异常，请检查。</Typography>}
                  </Stack>
                ) : null}
                <Box>
                  <FormControl fullWidth size="small" sx={inputFieldSx}>
                    <InputLabel>选择当前工具的输入参数</InputLabel>
                    <Select label="选择当前工具的输入参数" value={node.inputParamId} disabled={!canEdit} MenuProps={elevatedSelectMenuProps} onChange={(event) => onInputParamChange(node.nodeId, event.target.value)}>
                      {node.params.map((param) => <MenuItem key={param.id} value={param.id}>{param.label}</MenuItem>)}
                    </Select>
                  </FormControl>
                  <Typography sx={{ mt: 0.5, fontSize: 12, color: "#64748b", lineHeight: 1.5 }}>
                    从当前工具的入参中选择一个参数，用于接收前面配置的输入值。
                  </Typography>
                </Box>
              </Stack>
            </ConfigBlock>

            <ConfigBlock title={node.sourceType === "system" ? "系统工具配置" : "工具配置"}>
              <Stack spacing={1.25}>
                {configurableParams.map((param) => (
                  <ParamField key={param.id} param={param} canEdit={canEdit && param.editable !== false && node.enabled} onChange={(value) => onParamChange(node.nodeId, param.id, value)} />
                ))}
              </Stack>
            </ConfigBlock>

            <ConfigBlock title="工具输出">
              <Stack spacing={0.75}>
                {node.outputs.map((output) => (
                  <Box key={output.id} sx={{ p: 1, borderRadius: "9px", bgcolor: "#fff", border: "1px solid #EEF2F7" }}>
                    <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#1f2937" }}>{output.label}</Typography>
                    <Typography sx={{ fontSize: 11.5, color: "#64748b", mt: 0.35, lineHeight: 1.5 }}>{output.desc}</Typography>
                    <Typography sx={{ fontSize: 11.5, color: "#475569", mt: 0.35, lineHeight: 1.5 }}>变量路径：{output.path}</Typography>
                  </Box>
                ))}
              </Stack>
            </ConfigBlock>
          </Stack>
        </Box>
      </Box>
    </Drawer>
  );
}

function ConfigBlock({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Box sx={{ border: "1px solid #E0E8F2", borderRadius: "12px", bgcolor: "#fff", p: 1.5 }}>
      <Typography sx={{ fontSize: 14, fontWeight: 800, color: "#111827", mb: 1.25 }}>{title}</Typography>
      {children}
    </Box>
  );
}

function AddToolDialog({
  open,
  categories,
  selectedCategory,
  onCategoryChange,
  tools,
  selectedToolId,
  onToolChange,
  currentTool,
  addedToolIds,
  selectedToolAdded,
  selectedToolCategoryConfirmed,
  onClose,
  onAdd,
}: {
  open: boolean;
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  tools: McpTool[];
  selectedToolId: string;
  onToolChange: (toolId: string) => void;
  currentTool: McpTool | null;
  addedToolIds: Set<string>;
  selectedToolAdded: boolean;
  selectedToolCategoryConfirmed: boolean;
  onClose: () => void;
  onAdd: () => void;
}) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: "14px" } }}>
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box>
            <Typography sx={{ fontSize: 18, fontWeight: 700 }}>添加工具</Typography>
            <Typography sx={{ fontSize: 12, color: "#64748b", mt: 0.75 }}>从管理端维护的工具分类中选择可用工具</Typography>
          </Box>
          <IconButton onClick={onClose}><Close /></IconButton>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ display: "grid", gridTemplateColumns: "168px minmax(260px, 1fr) 280px", gap: 1.5, height: 460, overflow: "hidden" }}>
        <Paper variant="outlined" sx={{ borderColor: "#E0E8F2", borderRadius: "12px", p: 1, minHeight: 0, overflow: "auto" }}>
          <Typography sx={{ fontSize: 12, color: "#64748b", fontWeight: 700, mb: 1 }}>分类</Typography>
          <Stack spacing={0.5}>
            {categories.map((category) => {
              const count = (category === "全部" ? toolCatalog : toolCatalog.filter((tool) => tool.category === category)).length;
              return (
              <Button key={category} onClick={() => onCategoryChange(category)} sx={{ justifyContent: "space-between", color: selectedCategory === category ? "#6d28d9" : "#64748b", bgcolor: selectedCategory === category ? "#f5f3ff" : "transparent", textTransform: "none", borderRadius: "8px" }}>
                <span>{category}</span>
                <Chip label={count} size="small" sx={{ height: 18, fontSize: 10 }} />
              </Button>
            );})}
          </Stack>
        </Paper>

        <Paper variant="outlined" sx={{ borderColor: "#E0E8F2", borderRadius: "12px", p: 1, minHeight: 0, overflow: "auto" }}>
          <Typography sx={{ fontSize: 12, color: "#64748b", fontWeight: 700, mb: 1 }}>工具列表</Typography>
          <Stack spacing={0.75}>
            {tools.length === 0 && <Typography sx={{ fontSize: 12, color: "#94a3b8", p: 1 }}>当前分类下没有工具。</Typography>}
            {tools.map((tool) => {
              const isAdded = addedToolIds.has(tool.id) && !tool.allowMultiple;
              return (
              <Box key={tool.id} onClick={() => onToolChange(tool.id)} sx={{ p: 1, borderRadius: "10px", border: "1px solid", borderColor: selectedToolId === tool.id ? "#c4b5fd" : "#EEF2F7", bgcolor: selectedToolId === tool.id ? "#faf5ff" : "#fff", cursor: "pointer", opacity: isAdded ? 0.62 : 1 }}>
                <Stack direction="row" spacing={0.75} alignItems="center" justifyContent="space-between">
                  <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#1f2937" }}>{tool.name}</Typography>
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <Chip label={tool.status} size="small" sx={{ height: 18, fontSize: 10, bgcolor: "#f0fdf4", color: "#16a34a" }} />
                    {isAdded && <Chip label="已添加" size="small" sx={{ height: 18, fontSize: 10, bgcolor: "#f1f5f9", color: "#64748b" }} />}
                  </Stack>
                </Stack>
                <Typography sx={{ fontSize: 11, color: "#64748b", lineHeight: 1.5, mt: 0.5 }}>{tool.summary}</Typography>
              </Box>
            );})}
          </Stack>
        </Paper>

        <Paper variant="outlined" sx={{ borderColor: "#E0E8F2", borderRadius: "12px", p: 1.25, minHeight: 0, overflow: "auto" }}>
          {currentTool ? <Stack spacing={1.25}>
            <Box sx={{ p: 1, borderRadius: "9px", bgcolor: "#F8FAFC", border: "1px solid #EEF2F7" }}>
              <Typography sx={{ fontSize: 11, color: "#64748b", fontWeight: 700, mb: 0.4 }}>工具状态</Typography>
              <Typography sx={{ fontSize: 12, color: "#111827", lineHeight: 1.5 }}>{currentTool.status}</Typography>
            </Box>
            <Box>
              <Typography sx={{ fontSize: 13, color: "#111827", fontWeight: 800, mb: 0.75 }}>入参</Typography>
              <Stack spacing={0.75}>
                {currentTool.params.map((param) => (
                  <Box key={param.id} sx={{ p: 0.85, borderRadius: "8px", bgcolor: "#F8FAFC", border: "1px solid #EEF2F7" }}>
                    <Stack direction="row" spacing={0.5} alignItems="center" flexWrap="wrap" useFlexGap>
                      <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#1f2937" }}>{param.label}</Typography>
                      <Chip label={getParamFormat(param)} size="small" sx={{ height: 17, fontSize: 10, bgcolor: "#f5f3ff", color: "#6d28d9" }} />
                      {param.required && <Chip label="必填" size="small" sx={{ height: 17, fontSize: 10, bgcolor: "#fff7ed", color: "#c2410c" }} />}
                    </Stack>
                    <Typography sx={{ fontSize: 10.5, color: "#64748b", lineHeight: 1.5, mt: 0.35 }}>{param.desc}</Typography>
                  </Box>
                ))}
              </Stack>
            </Box>
            <Divider />
            <Box>
              <Typography sx={{ fontSize: 13, color: "#111827", fontWeight: 800, mb: 0.75 }}>出参</Typography>
              <Stack spacing={0.75}>
                {currentTool.outputs.map((output) => (
                  <Box key={output.id} sx={{ p: 0.85, borderRadius: "8px", bgcolor: "#FBFCFF", border: "1px solid #EEF2F7" }}>
                    <Stack direction="row" spacing={0.5} alignItems="center" flexWrap="wrap" useFlexGap>
                      <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#1f2937" }}>{output.label}</Typography>
                      <Chip label={getOutputFormat(output)} size="small" sx={{ height: 17, fontSize: 10, bgcolor: "#eef2ff", color: "#4338ca" }} />
                    </Stack>
                    <Typography sx={{ fontSize: 10.5, color: "#64748b", lineHeight: 1.5, mt: 0.35 }}>{output.desc}</Typography>
                  </Box>
                ))}
              </Stack>
            </Box>
          </Stack> : <Typography sx={{ fontSize: 12, color: "#94a3b8", p: 1 }}>请选择一个工具。</Typography>}
        </Paper>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} sx={{ textTransform: "none", color: "#64748b" }}>取消</Button>
        <Button disabled={!currentTool || selectedToolAdded || selectedToolCategoryConfirmed} onClick={onAdd} variant="contained" sx={{ textTransform: "none", bgcolor: "#801AEB", borderRadius: "10px", "&:hover": { bgcolor: "#6D16C9" } }}>{selectedToolAdded ? "工具已添加" : selectedToolCategoryConfirmed ? "方案已确认" : "确认添加"}</Button>
      </DialogActions>
    </Dialog>
  );
}
