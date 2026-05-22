import { type ReactNode, useMemo, useState } from "react";
import { useParams } from "react-router";
import {
  Box,
  Button,
  Checkbox,
  Chip,
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
  Close,
  DeleteOutline,
  DragIndicator,
  EditOutlined,
  ExpandLess,
  ExpandMore,
  FactCheck,
  Send,
  UploadFile,
  WarningAmber,
} from "@mui/icons-material";
import { toast } from "sonner";
import { dataStore } from "../store/DataStore";

type ParamType = "text" | "textarea" | "number" | "select" | "multiSelect" | "switch" | "tags";
type ChainType = "sampleFile" | "documentFile" | "rawText" | "cleanText" | "qaPairs";

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
  visibleWhen?: { paramId: string; value: string | number | boolean };
  min?: number;
  max?: number;
  unit?: string;
}

interface ToolOutput {
  id: string;
  label: string;
  desc: string;
}

interface InputSource {
  type: "fixed" | "upstream";
  sourceNodeId?: string;
  outputId?: string;
}

interface McpService {
  name: string;
  version: string;
}

interface McpTool {
  id: string;
  name: string;
  category: string;
  summary: string;
  status: "可用" | "不可用";
  params: ToolParam[];
  outputs: ToolOutput[];
  input: ChainType;
  output: ChainType;
}

interface ToolNode {
  nodeId: string;
  toolId: string;
  toolName: string;
  category: string;
  serviceName: string;
  serviceVersion: string;
  status: McpTool["status"];
  summary: string;
  enabled: boolean;
  expanded: boolean;
  inputParamId: string;
  inputSource: InputSource;
  params: ToolParam[];
  outputs: ToolOutput[];
}

const mcpService: McpService = {
  name: "nacos-knowledge-tool-mcp",
  version: "V1.0.0",
};

const elevatedSelectMenuProps = {
  sx: { zIndex: 1600 },
  PaperProps: { sx: { zIndex: 1601 } },
};

const documentAddressParam: ToolParam = {
  id: "documentAddress",
  label: "文档地址信息",
  desc: "解析入口输出的文档地址信息。",
  type: "textarea",
  value: "解析入口输出的文档地址信息",
  required: true,
  editable: true,
};

const documentParseInputParam: ToolParam = {
  id: "documentParseResult",
  label: "文档解析结果",
  desc: "来自解析工具的解析结果。",
  type: "textarea",
  value: "",
  required: true,
  editable: true,
};

const textChunkInputParam: ToolParam = {
  id: "textChunkResult",
  label: "文本分片结果",
  desc: "来自分片工具的分片结果。",
  type: "textarea",
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
  documentAddressParam,
  { id: "parseStrategy", label: "解析策略", desc: "选择通用解析策略。", type: "multiSelect", value: ["文档内容提取"], editable: true, options: ["文档文字提取", "文档内容提取", "提取文档图谱", "图片内容解析", "表格深度解析"] },
  { id: "ocrService", label: "OCR服务", desc: "选择用于 OCR 的服务。", type: "select", value: "预置服务-OCR", required: true, editable: true, options: ocrServiceOptions },
  { id: "vlmModel", label: "VLM模型", desc: "选择 VLM 图片理解模型。", type: "select", value: "Qwen2.5-VL-32B-Instruct", required: true, editable: true, options: vlmModelOptions },
  { id: "systemPrompt", label: "System", desc: "图片识别与信息抽取系统提示词。", type: "textarea", value: "你是图像文字识别与信息抽取专家，精通图像预处理、OCR 及数学公式解析，能从各类票据、证件和表单中精准抽取关键信息，输出简洁、客观的 Markdown 结果。\n按照以下流程处理输入图像并输出结果：\n1. **图像预处理**  \n   - 灰度化、二值化、去噪等，提高识别率。\n2. **OCR 识别**  \n   - 提取所有文字；  \n   - 对数学公式应用公式识别算法，输出 LaTeX。\n3. **区域定位与信息抽取**  \n   - 对票据、证件、表单等，定位并抽取“姓名”“日期”“金额”等核心字段。\n4. **结果格式**  \n   - 仅输出客观识别/抽取内容，不做任何二次加工或总结；  \n   - Markdown 格式：  \n     - 普通文本直接写；  \n     - 公式使用 `$$…$$`（LaTeX）；  \n     - 结构化数据使用 Markdown 表格。\n示例：\n- **文字+公式识别**  \n  输入：`![示例](example.jpg)`  \n  输出：\n  ```markdown\n  文本：Hello, world!  \n  公式：$$E = mc^2$$\n  ```", editable: true },
  { id: "userPrompt", label: "User", desc: "图片识别与信息抽取用户提示词。", type: "textarea", value: "提取图片信息", editable: true },
];

const multimodalParseParams: ToolParam[] = [
  documentAddressParam,
  { id: "parseStrategy", label: "解析策略", desc: "选择多模态解析策略。", type: "multiSelect", value: ["文档内容解析"], editable: true, options: ["文档内容解析", "提取文档图片"] },
  { id: "vlmModel", label: "VLM模型", desc: "选择 VLM 图片理解模型。", type: "select", value: "Qwen2.5-VL-32B-Instruct", required: true, editable: true, options: vlmModelOptions },
  { id: "systemPrompt", label: "System", desc: "多模态解析系统提示词。", type: "textarea", value: "你是图像文字识别与信息抽取专家，精通图像预处理、OCR 及数学公式解析，能从各类票据、证件和表单中精准抽取关键信息，输出简洁、客观的 Markdown 结果。\n按照以下流程处理输入图像并输出结果：\n1. **图像预处理**  \n   - 灰度化、二值化、去噪等，提高识别率。\n2. **OCR 识别**  \n   - 提取所有文字；  \n   - 对数学公式应用公式识别算法，输出 LaTeX。\n3. **区域定位与信息抽取**  \n   - 对票据、证件、表单等，定位并抽取“姓名”“日期”“金额”等核心字段。\n4. **结果格式**  \n   - 仅输出客观识别/抽取内容，不做任何二次加工或总结；  \n   - Markdown 格式：  \n     - 普通文本直接写；  \n     - 公式使用 `$$…$$`（LaTeX）；  \n     - 结构化数据使用 Markdown 表格。\n示例：\n- **文字+公式识别**  \n  输入：`![示例](example.jpg)`  \n  输出：\n  ```markdown\n  文本：Hello, world!  \n  公式：$$E = mc^2$$\n  ```", editable: true },
  { id: "userPrompt", label: "User", desc: "多模态解析用户提示词。", type: "textarea", value: "提取图片信息", editable: true },
];

const policyParseParams: ToolParam[] = [documentAddressParam];

const commonChunkParams: ToolParam[] = [
  documentParseInputParam,
  { id: "chunkAssociate", label: "分片关联信息", desc: "选择需要写入分片结果的关联信息。", type: "multiSelect", value: [], editable: true, options: chunkAssociateOptions },
  { id: "chunkSize", label: "理想分块长度", desc: "单个分片的目标长度。", type: "number", value: 1024, required: true, editable: true, min: 1, max: 100000, unit: "字" },
  { id: "overlap", label: "块之间重叠长度", desc: "相邻分片之间的重叠长度。", type: "number", value: 200, required: true, editable: true, min: 0, max: 100000, unit: "字" },
  { id: "preprocess", label: "分片预处理", desc: "选择分片前需要执行的文本预处理。", type: "multiSelect", value: [], editable: true, options: chunkPreprocessOptions },
];

const customSeparatorChunkParams: ToolParam[] = [
  documentParseInputParam,
  { id: "chunkAssociate", label: "分片关联信息", desc: "选择需要写入分片结果的关联信息。", type: "multiSelect", value: [], editable: true, options: chunkAssociateOptions },
  { id: "customSeparator", label: "自定义分隔符", desc: "使用分隔符进行分片。", type: "text", value: "+++", required: true, editable: true },
  { id: "chunkSize", label: "理想分块长度", desc: "单个分片的目标长度。", type: "number", value: 1024, required: true, editable: true, min: 1, max: 100000, unit: "字" },
  { id: "overlap", label: "块之间重叠长度", desc: "相邻分片之间的重叠长度。", type: "number", value: 200, required: true, editable: true, min: 0, max: 100000, unit: "字" },
  { id: "preprocess", label: "分片预处理", desc: "选择分片前需要执行的文本预处理。", type: "multiSelect", value: [], editable: true, options: chunkPreprocessOptions },
];

const recursiveSeparatorChunkParams: ToolParam[] = [
  documentParseInputParam,
  { id: "mode", label: "模式选择", desc: "选择分片关联模式。", type: "select", value: "关联文件信息", required: true, editable: true, options: ["关联文件信息", "保留父子切片结构"] },
  { id: "chunkAssociate", label: "分片关联信息", desc: "模式为关联文件信息时配置。", type: "multiSelect", value: [], editable: true, options: chunkAssociateOptions, visibleWhen: { paramId: "mode", value: "关联文件信息" } },
  { id: "chunkSize", label: "理想分块长度", desc: "递归分片目标长度。", type: "number", value: 512, required: true, editable: true, min: 1, max: 100000, unit: "字" },
  { id: "overlap", label: "块之间重叠长度", desc: "相邻分片之间的重叠长度。", type: "number", value: 50, required: true, editable: true, min: 0, max: 100000, unit: "字" },
  { id: "sliceSeparators", label: "切片分隔符", desc: "最多添加10个分隔符，支持预置分隔符和自定义分隔符。", type: "tags", value: ["\n\n", "\n"], editable: true, options: separatorPresetOptions, max: 10 },
];

const ocrChunkParams: ToolParam[] = [
  documentParseInputParam,
  { id: "mode", label: "模式选择", desc: "选择分片关联模式。", type: "select", value: "关联文件信息", required: true, editable: true, options: ["关联文件信息", "保留父子切片结构"] },
  { id: "chunkAssociate", label: "分片关联信息", desc: "模式为关联文件信息时配置。", type: "multiSelect", value: [], editable: true, options: chunkAssociateOptions, visibleWhen: { paramId: "mode", value: "关联文件信息" } },
  { id: "chunkSize", label: "理想分块长度", desc: "根据 OCR 识别标题和段落聚合的目标长度。", type: "number", value: 512, required: true, editable: true, min: 1, max: 100000, unit: "字" },
  { id: "overlap", label: "块之间重叠长度", desc: "相邻分片之间的重叠长度。", type: "number", value: 50, required: true, editable: true, min: 0, max: 100000, unit: "字" },
  { id: "preprocess", label: "分片预处理", desc: "选择分片前需要执行的文本预处理。", type: "multiSelect", value: [], editable: true, options: chunkPreprocessOptions },
];

const policyChunkParams: ToolParam[] = [documentParseInputParam];

const videoAudioSyncChunkParams: ToolParam[] = [
  documentParseInputParam,
  { id: "chunkAssociate", label: "分片关联信息", desc: "选择需要写入分片结果的关联信息。", type: "multiSelect", value: ["关联文件名"], editable: true, options: ["关联文件名"] },
  { id: "segmentCount", label: "理想分段个数", desc: "希望切分出的分段数量。", type: "number", value: 10, required: true, editable: true, min: 1, max: 1000, unit: "段" },
  { id: "preprocess", label: "分片预处理", desc: "选择分片前需要执行的文本预处理。", type: "multiSelect", value: [], editable: true, options: chunkPreprocessOptions },
];

const qaParams: ToolParam[] = [
  textChunkInputParam,
  { id: "aiModel", label: "AI模型", desc: "选择提取模型。", type: "select", value: "qwen3-8b", required: true, editable: true, options: extractionModelOptions },
  { id: "temperature", label: "温度", desc: "模型生成温度。", type: "number", value: 0.7, required: true, editable: true, min: 0, max: 2 },
  { id: "maxTokens", label: "max tokens", desc: "模型最大输出 tokens。", type: "number", value: 2048, required: true, editable: true, min: 1, max: 32768 },
  { id: "systemPrompt", label: "System Prompt", desc: "QA 提取系统提示词。", type: "textarea", value: "你是一个QA抽取专家，擅长学习和分析提供的文本信息。\n<context></context> 标记中是一段文本。\n你的任务是学习和分析<context></context>的文本，并按照以下步骤整理学习成果：\n1. 给出<context></context>的文本描述的主体(subject)\n2. 提出问题(question)\n3. 给出每个问题的答案(answer)", editable: true },
  { id: "guidePrompt", label: "引导模板提示词", desc: "用于控制问答引用和来源格式。", type: "textarea", value: "学习和分析<context></context>的文本，并整理学习成果。\n任务要求:\n- 如果<context></context>内有表格，那么提取的主体(subject)不能是\"表格\"\n- 答案需详细完整，给出相关原文描述。\n- 答案可以包含普通文字、链接、代码、表格、公示、媒体链接等 markdown 元素。\n- 可以对答案添加或者删去一些分隔符，让FAQ答案语句通顺。\n- 尽可能多地提出问题，但最多提出3个问题。\n- 记得按照要求的json格式回答。", editable: true },
];

const summaryParams: ToolParam[] = [
  textChunkInputParam,
  { id: "aiModel", label: "AI模型", desc: "选择提取模型。", type: "select", value: "qwen3-8b", required: true, editable: true, options: extractionModelOptions },
  { id: "temperature", label: "温度", desc: "模型生成温度。", type: "number", value: 0.7, required: true, editable: true, min: 0, max: 2 },
  { id: "maxTokens", label: "max tokens", desc: "模型最大输出 tokens。", type: "number", value: 2048, required: true, editable: true, min: 1, max: 32768 },
  { id: "systemPrompt", label: "System Prompt", desc: "摘要总结系统提示词。", type: "textarea", value: "你是一个摘要提取专家，能够从用户提供的文档中生成简洁准确的摘要。\n<context></context> 标记中是一段文本。\n你的任务是：学习和分析<context></context>的文本，并总结提炼摘要(Summary)。\n\n限制条件:\n1. Summary：总结提炼文档(Document)中文本段的主旨;\n2. Summary：不能含有指代词，表达通顺，意思清楚;\n3. 文档内容中没有图片，所以当摘要需要引用图片时，应该改写隐去图片引用；\n4. 总是按照JSON格式输出。", editable: true },
  { id: "guidePrompt", label: "引导模板提示词", desc: "摘要总结引导模板提示词。", type: "textarea", value: "请从上面的文档总结提炼摘要，记得按照要求的json格式回答。", editable: true },
];

const keywordParams: ToolParam[] = [
  textChunkInputParam,
  { id: "aiModel", label: "AI模型", desc: "选择提取模型。", type: "select", value: "qwen3-8b", required: true, editable: true, options: extractionModelOptions },
  { id: "temperature", label: "温度", desc: "模型生成温度。", type: "number", value: 0.7, required: true, editable: true, min: 0, max: 2 },
  { id: "maxTokens", label: "max tokens", desc: "模型最大输出 tokens。", type: "number", value: 2048, required: true, editable: true, min: 1, max: 32768 },
  { id: "systemPrompt", label: "System Prompt", desc: "关键词提取系统提示词。", type: "textarea", value: "你是一个关键词提取专家，能够从用户提供的文档(Document)中生成简洁准确的关键词（keywords）。\n<context></context> 标记中是一段文本。\n你的任务是：学习和分析<context></context>的文本，并提取出其中最重要的关键词。\n\n限制条件:\n1. 这些关键词应该能够准确反映文本的核心主题和主要内容。\n2. 请注意，最终结果请以有效的JSON格式返回。", editable: true },
  { id: "guidePrompt", label: "引导模板提示词", desc: "关键词提取引导模板提示词。", type: "textarea", value: "以上是原文信息，请理解以上信息后生成不超过5个关键词，记得按照要求的json格式回答。", editable: true },
];

const toolCatalog: McpTool[] = [
  { id: "document-parser", name: "通用解析", category: "解析", summary: "解析 Word、PDF、Excel 等主流文档，提取文本和版面布局。", status: "可用", input: "sampleFile", output: "rawText", params: commonParseParams, outputs: [{ id: "documentParseResult", label: "文档解析结果", desc: "Array<json>，包含解析后的文本、版面、图片和表格信息。" }] },
  { id: "multimodal-parser", name: "多模态解析", category: "解析", summary: "使用多模态大模型对文档内容进行解析，效果好、速度慢。", status: "可用", input: "sampleFile", output: "rawText", params: multimodalParseParams, outputs: [{ id: "documentParseResult", label: "文档解析结果", desc: "Array<json>，包含多模态解析后的文本、图片理解和版面信息。" }] },
  { id: "medical-policy-parser", name: "医保政策解析", category: "解析", summary: "适用于解析医保政策类文件。", status: "可用", input: "sampleFile", output: "rawText", params: policyParseParams, outputs: [{ id: "documentParseResult", label: "文档解析结果", desc: "Array<json>，包含医保政策文档的条款、标题和正文结构。" }] },
  { id: "chunk-splitter", name: "通用分片", category: "分片", summary: "为纯文本文档提供灵活的分块和重叠设置。", status: "可用", input: "rawText", output: "cleanText", params: commonChunkParams, outputs: [{ id: "textChunkResult", label: "文本分片结果", desc: "Array<json>，包含分片文本、标题、来源和元数据。" }] },
  { id: "custom-separator-splitter", name: "自定义分隔符分片", category: "分片", summary: "沿用通用分片配置，并使用指定分隔符切分文本。", status: "可用", input: "rawText", output: "cleanText", params: customSeparatorChunkParams, outputs: [{ id: "textChunkResult", label: "文本分片结果", desc: "Array<json>，包含按自定义分隔符切分后的文本片段。" }] },
  { id: "recursive-separator-splitter", name: "分隔符递归分片", category: "分片", summary: "按分隔符优先级依次切分，优先保留语义完整。", status: "可用", input: "rawText", output: "cleanText", params: recursiveSeparatorChunkParams, outputs: [{ id: "textChunkResult", label: "文本分片结果", desc: "Array<json>，包含递归切分后的文本片段。" }] },
  { id: "ocr-splitter", name: "OCR解析专用分片", category: "分片", summary: "根据 OCR 识别的标题及段落进行切分、聚合。", status: "可用", input: "rawText", output: "cleanText", params: ocrChunkParams, outputs: [{ id: "textChunkResult", label: "文本分片结果", desc: "Array<json>，包含面向 OCR 结果聚合后的文本片段。" }] },
  { id: "medical-policy-splitter", name: "医保政策解析分片", category: "分片", summary: "适合医保政策类文件分片，页面上没有可配置参数。", status: "可用", input: "rawText", output: "cleanText", params: policyChunkParams, outputs: [{ id: "textChunkResult", label: "文本分片结果", desc: "Array<json>，包含医保政策文件分片结果。" }] },
  { id: "video-audio-sync-splitter", name: "视频声画同步分片", category: "分片", summary: "按声画同步结果切分视频文本片段。", status: "可用", input: "rawText", output: "cleanText", params: videoAudioSyncChunkParams, outputs: [{ id: "textChunkResult", label: "文本分片结果", desc: "Array<json>，包含视频声画同步分片结果。" }] },
  { id: "qa-extractor", name: "QA提取", category: "抽取", summary: "基于文本分片抽取问答对。", status: "可用", input: "cleanText", output: "qaPairs", params: qaParams, outputs: [{ id: "qaResult", label: "QA提取结果", desc: "Array<json>，包含问题、答案和引用来源。" }] },
  { id: "summary", name: "摘要总结", category: "抽取", summary: "基于文本分片结果生成摘要总结。", status: "可用", input: "cleanText", output: "rawText", params: summaryParams, outputs: [{ id: "summaryResult", label: "摘要总结结果", desc: "Array<json>，包含摘要内容和来源引用。" }] },
  { id: "keyword-extractor", name: "关键词提取", category: "抽取", summary: "从文本分片中抽取关键词。", status: "可用", input: "cleanText", output: "rawText", params: keywordParams, outputs: [{ id: "keywordResult", label: "关键词提取结果", desc: "Array<json>，包含关键词和权重。" }] },
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
    serviceName: mcpService.name,
    serviceVersion: mcpService.version,
    status: tool.status,
    summary: tool.summary,
    enabled: true,
    expanded: false,
    inputParamId: params[0]?.id ?? "",
    inputSource,
    params,
    outputs: cloneOutputs(tool.outputs),
  };
}

function createInitialPlanNodes(): ToolNode[] {
  const parser = createNode("document-parser", { type: "fixed" });
  const splitter = createNode("chunk-splitter", { type: "upstream", sourceNodeId: parser.nodeId, outputId: "documentParseResult" });
  const qa = createNode("qa-extractor", { type: "upstream", sourceNodeId: splitter.nodeId, outputId: "textChunkResult" });
  return [parser, splitter, qa];
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
  return `${category}方案`;
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
  if (nodes[0]?.nodeId === node.nodeId) return `${inputParam.label} <- 文档地址信息`;
  if (node.inputSource.type !== "upstream") return `${inputParam.label} <- 固定值`;
  const sourceNode = nodes.find((item) => item.nodeId === node.inputSource.sourceNodeId);
  const output = sourceNode?.outputs.find((item) => item.id === node.inputSource.outputId);
  return `${inputParam.label} <- ${sourceNode?.toolName ?? "来源已失效"}.${output?.label ?? "输出已失效"}`;
}

function isInputSourceInvalid(node: ToolNode, nodes: ToolNode[]) {
  if (nodes[0]?.nodeId === node.nodeId) return false;
  if (node.inputSource.type !== "upstream") return false;
  const priorNodes = getPriorNodes(nodes, node.nodeId);
  const sourceNode = priorNodes.find((item) => item.nodeId === node.inputSource.sourceNodeId);
  return !sourceNode || !sourceNode.outputs.some((output) => output.id === node.inputSource.outputId);
}

function getCategorySections(nodes: ToolNode[]) {
  const sections: { category: string; nodes: ToolNode[] }[] = [];
  const sectionMap = new Map<string, ToolNode[]>();

  nodes.forEach((node) => {
    if (!sectionMap.has(node.category)) {
      sectionMap.set(node.category, []);
      sections.push({ category: node.category, nodes: sectionMap.get(node.category)! });
    }
    sectionMap.get(node.category)!.push(node);
  });

  return sections;
}

function getNodeWarnings(nodes: ToolNode[]) {
  const warnings: Record<string, string[]> = {};
  const enabledNodes = nodes.filter((node) => node.enabled);

  enabledNodes.forEach((node) => {
    const paramProblems = getParamProblems(node, nodes[0]?.nodeId === node.nodeId);
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
  const [hasManualEdits, setHasManualEdits] = useState(false);

  const categories = useMemo(() => ["全部", ...Array.from(new Set(toolCatalog.map((tool) => tool.category)))], []);
  const categorySections = useMemo(() => getCategorySections(planNodes), [planNodes]);
  const nodeWarnings = useMemo(() => getNodeWarnings(planNodes), [planNodes]);
  const allProblems = getPlanProblems(planNodes);
  const canEdit = !confirmed;
  const editingNode = planNodes.find((node) => node.nodeId === editingNodeId) ?? null;
  const addedToolIds = useMemo(() => new Set(planNodes.map((node) => node.toolId)), [planNodes]);

  const filteredTools = selectedCategory === "全部"
    ? toolCatalog
    : toolCatalog.filter((tool) => tool.category === selectedCategory);
  const currentTool = toolCatalog.find((tool) => tool.id === selectedToolId) ?? filteredTools[0] ?? null;
  const selectedToolAdded = currentTool ? addedToolIds.has(currentTool.id) : false;

  const updateNode = (nodeId: string, updater: (node: ToolNode) => ToolNode) => {
    setPlanNodes((current) => current.map((node) => (node.nodeId === nodeId ? updater(node) : node)));
  };

  const openAddTool = () => {
    setAddDialogOpen(true);
    setSelectedCategory("全部");
    setSelectedToolId(toolCatalog[0]?.id ?? "");
  };

  const addTool = () => {
    if (!canEdit || !currentTool || selectedToolAdded) return;
    const node = createNode(currentTool.id);
    setPlanNodes((current) => [...current, { ...node, expanded: true }]);
    setHasManualEdits(true);
    setAddDialogOpen(false);
    toast.success(`已添加工具，已归入${getPlanTitle(node.category)}`);
  };

  const removeNode = (nodeId: string) => {
    if (!canEdit) return;
    setPlanNodes((current) => current.filter((node) => node.nodeId !== nodeId));
    setEditingNodeId((current) => (current === nodeId ? null : current));
    setHasManualEdits(true);
    toast.success("已删除工具节点");
  };

  const regenerateByAgent = () => {
    if (!canEdit) return;
    setPlanNodes(cloneNodes(initialPlanNodes));
    setEditingNodeId(null);
    setHasManualEdits(false);
    toast.success("已使用 Agent 最新生成方案覆盖当前编辑内容");
  };

  const confirmPlan = () => {
    if (allProblems.length > 0) {
      toast.error("当前方案仍存在校验问题");
      return;
    }
    setConfirmed(true);
    toast.success("处理方案已确认");
  };

  const onDropNode = (targetId: string) => {
    if (!draggingNodeId || draggingNodeId === targetId || !canEdit) return;
    const from = planNodes.findIndex((node) => node.nodeId === draggingNodeId);
    const to = planNodes.findIndex((node) => node.nodeId === targetId);
    if (from < 0 || to < 0) return;
    if (planNodes[from].category !== planNodes[to].category) return;
    const next = [...planNodes];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setPlanNodes(next);
    setHasManualEdits(true);
    setDraggingNodeId(null);
  };

  const changeParam = (nodeId: string, paramId: string, value: ToolParam["value"]) => {
    if (!canEdit) return;
    updateNode(nodeId, (node) => ({
      ...node,
      params: node.params.map((param) => (param.id === paramId ? { ...param, value } : param)),
    }));
    setHasManualEdits(true);
  };

  const updateInputParam = (nodeId: string, inputParamId: string) => {
    if (!canEdit) return;
    updateNode(nodeId, (node) => ({ ...node, inputParamId, inputSource: { type: "fixed" } }));
    setHasManualEdits(true);
  };

  const updateInputSource = (nodeId: string, source: InputSource) => {
    if (!canEdit) return;
    updateNode(nodeId, (node) => ({ ...node, inputSource: source }));
    setHasManualEdits(true);
  };

  const toggleParamShowOnPage = (nodeId: string, paramId: string) => {
    if (!canEdit) return;
    updateNode(nodeId, (node) => ({
      ...node,
      params: node.params.map((param) => (param.id === paramId ? { ...param, showOnPage: !param.showOnPage } : param)),
    }));
    setHasManualEdits(true);
  };

  const moveCategoryTo = (category: string, targetCategory: string) => {
    if (!canEdit || category === targetCategory) return;
    const categoriesInOrder = categorySections.map((section) => section.category);
    const from = categoriesInOrder.indexOf(category);
    const to = categoriesInOrder.indexOf(targetCategory);
    if (from < 0 || to < 0) return;
    const nextCategories = [...categoriesInOrder];
    const [moved] = nextCategories.splice(from, 1);
    nextCategories.splice(to, 0, moved);
    const grouped = new Map(categorySections.map((section) => [section.category, section.nodes]));
    setPlanNodes(nextCategories.flatMap((item) => grouped.get(item) ?? []));
    setHasManualEdits(true);
    setDraggingCategory(null);
  };

  return (
    <Box sx={{ height: "calc(100vh - 104px)", display: "flex", flexDirection: "column" }}>
      <Box sx={{ display: "grid", gridTemplateColumns: "248px minmax(360px, 1fr) 420px", gap: 2, minHeight: 0, flex: 1 }}>
        <Paper elevation={0} sx={{ border: "1px solid #E0E8F2", borderRadius: "12px", bgcolor: "#fff", p: 1.5, minHeight: 0 }}>
          <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#374151", mb: 1 }}>样例文件上传</Typography>
          <Box sx={{ border: "1px dashed #d8dce5", borderRadius: "10px", bgcolor: "#FBFCFF", p: 2, textAlign: "center" }}>
            <UploadFile sx={{ color: "#9ca3af", mb: 0.5 }} />
            <Typography sx={{ fontSize: 12, color: "#64748b" }}>点击上传或拖拽文件</Typography>
            <Typography sx={{ fontSize: 11, color: "#9ca3af", mt: 0.5 }}>支持 PDF、Word、Excel</Typography>
          </Box>
          <Divider sx={{ my: 2 }} />
          <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#374151", mb: 1 }}>已标记问题</Typography>
          <Box sx={{ bgcolor: "#F8FAFC", borderRadius: "10px", p: 1.5, color: "#94a3b8", fontSize: 12 }}>当前暂无可发送问题</Box>
          <Stack spacing={1} sx={{ mt: 2 }}>
            <Button disabled startIcon={<Send />} variant="contained" sx={{ textTransform: "none", bgcolor: "#ede9fe", color: "#8b5cf6" }}>发送所选文件给智能体</Button>
            <Button disabled startIcon={<Send />} variant="outlined" sx={{ textTransform: "none" }}>发送所选问题给智能体</Button>
          </Stack>
        </Paper>

        <Paper elevation={0} sx={{ border: "1px solid #E0E8F2", borderRadius: "12px", bgcolor: "#fff", minHeight: 0, display: "flex", flexDirection: "column" }}>
          <Box sx={{ p: 2, borderBottom: "1px solid #EEF2F7", display: "flex", gap: 1, alignItems: "center" }}>
            <AutoAwesome sx={{ color: "#801AEB", fontSize: 20 }} />
            <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#1f2937" }}>处理方案生成助手</Typography>
          </Box>
          <Box sx={{ p: 2, flex: 1, overflow: "auto", bgcolor: "#FBFCFF" }}>
            <Box sx={{ maxWidth: 560, bgcolor: "#fff", border: "1px solid #E0E8F2", borderRadius: "12px", p: 2 }}>
              <Typography sx={{ fontSize: 13, color: "#374151", lineHeight: 1.7 }}>
                已基于样例文件生成处理方案。右侧方案区会按已添加的 MCP 工具分类自动生成对应方案框，请确认工具可用性、参数和执行顺序。
              </Typography>
            </Box>
          </Box>
          <Box sx={{ p: 1.5, borderTop: "1px solid #EEF2F7", display: "flex", gap: 1 }}>
            <TextField fullWidth size="small" placeholder="输入问题或调整意见…" sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px", fontSize: 13 } }} />
            <IconButton onClick={regenerateByAgent} disabled={!canEdit} sx={{ bgcolor: "#f5f3ff", color: "#801AEB", "&:hover": { bgcolor: "#ede9fe" } }}><Send /></IconButton>
          </Box>
        </Paper>

        <Paper elevation={0} sx={{ border: "1px solid #E0E8F2", borderRadius: "12px", bgcolor: "#fff", minHeight: 0, display: "flex", flexDirection: "column" }}>
          <Tabs value={rightTab} onChange={(_, value) => setRightTab(value)} sx={{ px: 1.5, minHeight: 44, borderBottom: "1px solid #EEF2F7", "& .MuiTab-root": { minHeight: 44, fontSize: 13 }, "& .Mui-selected": { color: "#801AEB !important" }, "& .MuiTabs-indicator": { bgcolor: "#801AEB" } }}>
            <Tab label="样例" />
            <Tab label="方案" />
            <Tab label="历史版本" />
          </Tabs>

          {rightTab === 1 ? (
            <Box sx={{ p: 1.5, minHeight: 0, overflow: "auto", flex: 1 }}>
              <Stack spacing={1.2}>
	                <Box>
	                  <Stack direction="row" spacing={1} alignItems="flex-start" justifyContent="space-between">
	                    <Box sx={{ minWidth: 0 }}>
	                      <Typography sx={{ fontSize: 12, color: "#64748b" }}>末级类目：{displayCategory} · {displayFormType}</Typography>
                        <Chip label={hasManualEdits ? "智能+人工" : "智能方案"} size="small" sx={{ mt: 0.75, height: 22, fontSize: 11, bgcolor: hasManualEdits ? "#fff7ed" : "#eff6ff", color: hasManualEdits ? "#c2410c" : "#2563eb", fontWeight: 700 }} />
	                    </Box>
                    <Tooltip title="添加工具">
                      <span>
                        <IconButton size="small" aria-label="添加工具" disabled={!canEdit} onClick={openAddTool} sx={{ width: 30, height: 30, bgcolor: "#801AEB", color: "#fff", borderRadius: "8px", "&:hover": { bgcolor: "#6D16C9" }, "&.Mui-disabled": { bgcolor: "#e5e7eb", color: "#9ca3af" } }}>
                          <Add fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </Stack>
                </Box>

                {categorySections.map((section) => (
                  <PlanSection
                    key={section.category}
                    category={section.category}
                    nodes={section.nodes}
                    allNodes={planNodes}
                    canEdit={canEdit}
                    warnings={nodeWarnings}
                    canDragCategory={canEdit && categorySections.length > 1}
                    onCategoryDragStart={() => setDraggingCategory(section.category)}
                    onCategoryDrop={() => {
                      if (draggingCategory) moveCategoryTo(draggingCategory, section.category);
                    }}
                    onRemove={removeNode}
                    onToggle={(nodeId) => {
                      updateNode(nodeId, (node) => ({ ...node, enabled: !node.enabled }));
                      setHasManualEdits(true);
                    }}
                    onExpand={(nodeId) => updateNode(nodeId, (node) => ({ ...node, expanded: !node.expanded }))}
                    onEdit={(nodeId) => setEditingNodeId(nodeId)}
                    onDragStart={setDraggingNodeId}
                    onDrop={onDropNode}
                  />
                ))}

                <Button startIcon={<FactCheck />} onClick={confirmPlan} disabled={!canEdit} variant="contained" sx={{ mt: 1, bgcolor: allProblems.length ? "#cbd5e1" : "#801AEB", borderRadius: "10px", textTransform: "none", "&:hover": { bgcolor: allProblems.length ? "#cbd5e1" : "#6D16C9" } }}>
                  保存为处理方案
                </Button>
              </Stack>
            </Box>
          ) : (
            <Box sx={{ p: 2, color: "#94a3b8", fontSize: 13 }}>暂无待展示内容。</Box>
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
        service={mcpService}
        addedToolIds={addedToolIds}
        selectedToolAdded={selectedToolAdded}
        onClose={() => setAddDialogOpen(false)}
        onAdd={addTool}
      />
      <ToolEditDrawer
        open={Boolean(editingNode)}
        node={editingNode}
        allNodes={planNodes}
        canEdit={canEdit}
        onClose={() => setEditingNodeId(null)}
        onInputParamChange={updateInputParam}
        onInputSourceChange={updateInputSource}
        onParamChange={changeParam}
        onToggleShowOnPage={toggleParamShowOnPage}
      />
    </Box>
  );
}

function PlanSection({
  category,
  nodes,
  allNodes,
  canEdit,
  warnings,
  canDragCategory,
  onCategoryDragStart,
  onCategoryDrop,
  onRemove,
  onToggle,
  onExpand,
  onEdit,
  onDragStart,
  onDrop,
}: {
  category: string;
  nodes: ToolNode[];
  allNodes: ToolNode[];
  canEdit: boolean;
  warnings: Record<string, string[]>;
  canDragCategory: boolean;
  onCategoryDragStart: () => void;
  onCategoryDrop: () => void;
  onRemove: (nodeId: string) => void;
  onToggle: (nodeId: string) => void;
  onExpand: (nodeId: string) => void;
  onEdit: (nodeId: string) => void;
  onDragStart: (nodeId: string) => void;
  onDrop: (nodeId: string) => void;
}) {
  const title = getPlanTitle(category);
  return (
    <Box
      draggable={canDragCategory}
      onDragStart={canDragCategory ? onCategoryDragStart : undefined}
      onDragOver={canDragCategory ? (event) => event.preventDefault() : undefined}
      onDrop={canDragCategory ? onCategoryDrop : undefined}
      sx={{ border: "1px solid #E0E8F2", borderRadius: "12px", overflow: "hidden" }}
    >
      <Box sx={{ px: 1.5, py: 1.25, bgcolor: "#FBFCFF", borderBottom: "1px solid #EEF2F7", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
        <Box sx={{ minWidth: 0, display: "flex", alignItems: "center", gap: 0.75 }}>
          {canDragCategory && <DragIndicator sx={{ color: "#9ca3af", cursor: "grab", fontSize: 18 }} />}
          <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#1f2937" }}>{title}</Typography>
        </Box>
      </Box>
      <Stack spacing={1} sx={{ p: 1 }}>
        {nodes.map((node) => (
          <ToolNodeCard
            key={node.nodeId}
            node={node}
            allNodes={allNodes}
            canEdit={canEdit}
            canDrag={canEdit && nodes.length > 1}
            warnings={warnings[node.nodeId] ?? []}
            onRemove={() => onRemove(node.nodeId)}
            onToggle={() => onToggle(node.nodeId)}
            onExpand={() => onExpand(node.nodeId)}
            onEdit={() => onEdit(node.nodeId)}
            onDragStart={() => onDragStart(node.nodeId)}
            onDrop={() => onDrop(node.nodeId)}
          />
        ))}
      </Stack>
    </Box>
  );
}

function ToolNodeCard({
  node,
  allNodes,
  canEdit,
  canDrag,
  warnings,
  onRemove,
  onToggle,
  onExpand,
  onEdit,
  onDragStart,
  onDrop,
}: {
  node: ToolNode;
  allNodes: ToolNode[];
  canEdit: boolean;
  canDrag: boolean;
  warnings: string[];
  onRemove: () => void;
  onToggle: () => void;
  onExpand: () => void;
  onEdit: () => void;
  onDragStart: () => void;
  onDrop: () => void;
}) {
  const hasWarning = warnings.length > 0;
  const hasInputWarning = warnings.includes("输入配置异常，请检查。");
  const configParams = node.params.filter((param) => param.id !== node.inputParamId && isParamVisible(node, param));
  return (
    <Box
      draggable={canDrag}
      onDragStart={canDrag ? onDragStart : undefined}
      onDragOver={canDrag ? (event) => event.preventDefault() : undefined}
      onDrop={canDrag ? onDrop : undefined}
      sx={{
        border: "1px solid",
        borderColor: hasInputWarning ? "#ef4444" : hasWarning ? "#fed7aa" : "#E0E8F2",
        borderRadius: "10px",
        bgcolor: hasWarning ? "#fffaf0" : node.enabled ? "#fff" : "#F8FAFC",
        opacity: node.enabled ? 1 : 0.7,
        overflow: "hidden",
      }}
    >
      <Box sx={{ px: 1, py: 1, display: "flex", alignItems: "center", gap: 0.75 }}>
        {canDrag && <DragIndicator sx={{ color: "#9ca3af", cursor: "grab", fontSize: 18 }} />}
        <Checkbox size="small" checked={node.enabled} disabled={!canEdit} onChange={onToggle} sx={{ p: 0.25, color: "#801AEB", "&.Mui-checked": { color: "#801AEB" } }} />
        <Box sx={{ minWidth: 0, flex: 1, display: "flex", alignItems: "center", gap: 0.35 }}>
          <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#1f2937", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {node.toolName}
          </Typography>
          <IconButton aria-label={node.expanded ? "收起工具配置" : "展开工具配置"} onClick={onExpand} size="small" sx={{ color: "#64748b", width: 24, height: 24, flex: "0 0 auto" }}>{node.expanded ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}</IconButton>
        </Box>
        {canEdit && <IconButton aria-label="编辑工具" onClick={onEdit} size="small" sx={{ color: "#801AEB" }}><EditOutlined fontSize="small" /></IconButton>}
        {canEdit && <IconButton onClick={onRemove} size="small" sx={{ color: "#ef4444", "&:hover": { bgcolor: "#fef2f2" } }}><DeleteOutline fontSize="small" /></IconButton>}
      </Box>
      {warnings.length > 0 && (
        <Box sx={{ mx: 1, mb: 1, p: 1, borderRadius: "8px", bgcolor: hasInputWarning ? "#fef2f2" : "#fff7ed", border: `1px solid ${hasInputWarning ? "#fecaca" : "#fed7aa"}` }}>
          {warnings.map((warning) => (
            <Stack key={warning} direction="row" spacing={0.75} alignItems="flex-start">
              <WarningAmber sx={{ fontSize: 15, color: hasInputWarning ? "#dc2626" : "#c2410c", mt: "1px" }} />
              <Typography sx={{ fontSize: 11, color: hasInputWarning ? "#b91c1c" : "#9a3412", lineHeight: 1.5 }}>{warning}</Typography>
            </Stack>
          ))}
        </Box>
      )}
      {node.expanded && (
        <Box sx={{ borderTop: "1px solid #EEF2F7", p: 1.25, bgcolor: "#FBFCFF" }}>
          <Stack spacing={1.1}>
            <ReadonlyConfigRow label="输入" value={getInputSourceLabel(node, allNodes)} warning={isInputSourceInvalid(node, allNodes)} />
            <ReadonlyConfigRow label="参数配置" value={`${configParams.length} 个参数，${configParams.filter((param) => param.required).length} 个必填`} />
            <ReadonlyConfigRow label="输出" value={node.outputs.map((output) => output.label).join("、")} />
          </Stack>
        </Box>
      )}
    </Box>
  );
}

function ReadonlyConfigRow({ label, value, warning = false }: { label: string; value: string; warning?: boolean }) {
  return (
    <Box sx={{ display: "grid", gridTemplateColumns: "64px minmax(0, 1fr)", gap: 1, alignItems: "start" }}>
      <Typography sx={{ fontSize: 11, color: "#94a3b8", fontWeight: 700 }}>{label}</Typography>
      <Typography sx={{ fontSize: 12, color: warning ? "#c2410c" : "#374151", lineHeight: 1.55, wordBreak: "break-word" }}>{value}</Typography>
    </Box>
  );
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
  if (param.type === "textarea") return <TextField size="small" fullWidth multiline minRows={4} label={param.label} value={String(param.value)} disabled={!canEdit} onChange={(event) => onChange(event.target.value)} helperText={param.desc} sx={commonSx} />;
  if (param.type === "number") return <TextField size="small" fullWidth type="number" label={param.label} value={Number(param.value)} disabled={!canEdit} onChange={(event) => onChange(Number(event.target.value))} helperText={`${param.desc}${param.unit ? `，单位：${param.unit}` : ""}`} sx={commonSx} />;
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
        <Typography sx={{ fontSize: 11, color: "#94a3b8", mt: 0.75 }}>{param.desc} 当前 {tags.length}/{limit}</Typography>
      </Box>
    );
  }
  return <TextField size="small" fullWidth label={param.label} value={String(param.value)} disabled={!canEdit} onChange={(event) => onChange(event.target.value)} helperText={param.desc} sx={commonSx} />;
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
  const selectedSourceNode = priorNodes.find((item) => item.nodeId === node.inputSource.sourceNodeId) ?? priorNodes[0];
  const selectedOutput = selectedSourceNode?.outputs.find((output) => output.id === node.inputSource.outputId) ?? selectedSourceNode?.outputs[0];
  const sourceInvalid = isInputSourceInvalid(node, allNodes);
  const isFirstNode = allNodes[0]?.nodeId === node.nodeId;

  const setSourceType = (type: InputSource["type"]) => {
    if (type === "fixed") {
      onInputSourceChange(node.nodeId, { type: "fixed" });
      return;
    }
    if (!selectedSourceNode || !selectedOutput) return;
    onInputSourceChange(node.nodeId, { type: "upstream", sourceNodeId: selectedSourceNode.nodeId, outputId: selectedOutput.id });
  };

  const setSourceNode = (sourceNodeId: string) => {
    const sourceNode = priorNodes.find((item) => item.nodeId === sourceNodeId);
    const output = sourceNode?.outputs[0];
    if (!sourceNode || !output) return;
    onInputSourceChange(node.nodeId, { type: "upstream", sourceNodeId: sourceNode.nodeId, outputId: output.id });
  };

  const setSourceOutput = (outputId: string) => {
    if (!selectedSourceNode) return;
    onInputSourceChange(node.nodeId, { type: "upstream", sourceNodeId: selectedSourceNode.nodeId, outputId });
  };

  return (
    <Drawer open={open} onClose={onClose} anchor="right" sx={{ zIndex: (theme) => theme.zIndex.modal + 20 }} PaperProps={{ sx: { width: 480, borderTopLeftRadius: "14px", borderBottomLeftRadius: "14px" } }}>
      <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <Box sx={{ px: 2, py: 1.5, borderBottom: "1px solid #EEF2F7", display: "flex", alignItems: "center", gap: 1 }}>
          <Box sx={{ width: 30, height: 30, borderRadius: "9px", bgcolor: "#f5f3ff", color: "#801AEB", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <EditOutlined fontSize="small" />
          </Box>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography sx={{ fontSize: 16, fontWeight: 800, color: "#111827" }}>{node.toolName}</Typography>
            <Typography sx={{ fontSize: 12, color: "#64748b" }}>{getPlanTitle(node.category)}</Typography>
          </Box>
          <IconButton onClick={onClose}><Close /></IconButton>
        </Box>

        <Box sx={{ p: 2, overflow: "auto", flex: 1, bgcolor: "#FBFCFF" }}>
          <Stack spacing={1.5}>
            <ConfigBlock title="输入">
              <Stack spacing={1.25}>
                <FormControl fullWidth size="small">
                  <InputLabel>输入参数</InputLabel>
                  <Select label="输入参数" value={node.inputParamId} disabled={!canEdit} MenuProps={elevatedSelectMenuProps} onChange={(event) => onInputParamChange(node.nodeId, event.target.value)}>
                    {node.params.map((param) => <MenuItem key={param.id} value={param.id}>{param.label}</MenuItem>)}
                  </Select>
                </FormControl>
                {isFirstNode ? (
                  <TextField size="small" fullWidth label="取值方式" value="文档地址信息" disabled sx={{ "& .MuiOutlinedInput-root": { borderRadius: "9px", fontSize: 12 }, "& .MuiInputLabel-root": { fontSize: 12 } }} />
                ) : (
                  <FormControl fullWidth size="small">
                    <InputLabel>取值方式</InputLabel>
                    <Select label="取值方式" value={node.inputSource.type} disabled={!canEdit || priorNodes.length === 0} MenuProps={elevatedSelectMenuProps} onChange={(event) => setSourceType(event.target.value as InputSource["type"])}>
                      <MenuItem value="fixed">固定值</MenuItem>
                      <MenuItem value="upstream">上游工具输出</MenuItem>
                    </Select>
                  </FormControl>
                )}
                {!isFirstNode && node.inputSource.type === "upstream" ? (
                  <Stack spacing={1}>
                    <FormControl fullWidth size="small">
                      <InputLabel>来源工具</InputLabel>
                      <Select label="来源工具" value={selectedSourceNode?.nodeId ?? ""} disabled={!canEdit} MenuProps={elevatedSelectMenuProps} onChange={(event) => setSourceNode(event.target.value)}>
                        {priorNodes.map((item) => <MenuItem key={item.nodeId} value={item.nodeId}>{item.toolName}</MenuItem>)}
                      </Select>
                    </FormControl>
                    <FormControl fullWidth size="small">
                      <InputLabel>输出字段</InputLabel>
                      <Select label="输出字段" value={selectedOutput?.id ?? ""} disabled={!canEdit || !selectedSourceNode} MenuProps={elevatedSelectMenuProps} onChange={(event) => setSourceOutput(event.target.value)}>
                        {(selectedSourceNode?.outputs ?? []).map((output) => <MenuItem key={output.id} value={output.id}>{output.label}</MenuItem>)}
                      </Select>
                    </FormControl>
                    {sourceInvalid && <Typography sx={{ fontSize: 12, color: "#c2410c" }}>输入配置异常，请检查。</Typography>}
                  </Stack>
                ) : !isFirstNode && inputParam ? (
                  <ParamField param={inputParam} canEdit={canEdit && inputParam.editable !== false} onChange={(value) => onParamChange(node.nodeId, inputParam.id, value)} />
                ) : null}
              </Stack>
            </ConfigBlock>

            <ConfigBlock title="参数配置">
              <Stack spacing={1.25}>
                {configurableParams.map((param) => (
                  <Box key={param.id} sx={{ border: "1px solid #E0E8F2", borderRadius: "10px", bgcolor: "#fff", p: 1.25 }}>
                    <ParamField param={param} canEdit={canEdit && param.editable !== false && node.enabled} onChange={(value) => onParamChange(node.nodeId, param.id, value)} />
                  </Box>
                ))}
              </Stack>
            </ConfigBlock>

            <ConfigBlock title="输出">
              <Stack spacing={0.75}>
                {node.outputs.map((output) => (
                  <Box key={output.id} sx={{ p: 1, borderRadius: "9px", bgcolor: "#fff", border: "1px solid #EEF2F7" }}>
                    <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#1f2937" }}>{output.label}</Typography>
                    <Typography sx={{ fontSize: 11.5, color: "#64748b", mt: 0.35, lineHeight: 1.5 }}>{output.desc}</Typography>
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
  service,
  addedToolIds,
  selectedToolAdded,
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
  service: McpService;
  addedToolIds: Set<string>;
  selectedToolAdded: boolean;
  onClose: () => void;
  onAdd: () => void;
}) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: "14px" } }}>
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box>
            <Typography sx={{ fontSize: 18, fontWeight: 700 }}>添加工具</Typography>
            <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mt: 1 }}>
              <Chip label={`MCP 服务：${service.name}`} size="small" sx={{ height: 22, fontSize: 11, bgcolor: "#f5f3ff", color: "#6d28d9" }} />
              <Chip label={service.version} size="small" sx={{ height: 22, fontSize: 11, bgcolor: "#eff6ff", color: "#2563eb" }} />
            </Stack>
          </Box>
          <IconButton onClick={onClose}><Close /></IconButton>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ display: "grid", gridTemplateColumns: "168px minmax(260px, 1fr) 260px", gap: 1.5, minHeight: 420 }}>
        <Paper variant="outlined" sx={{ borderColor: "#E0E8F2", borderRadius: "12px", p: 1 }}>
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

        <Paper variant="outlined" sx={{ borderColor: "#E0E8F2", borderRadius: "12px", p: 1 }}>
          <Typography sx={{ fontSize: 12, color: "#64748b", fontWeight: 700, mb: 1 }}>MCP 工具</Typography>
          <Stack spacing={0.75}>
            {tools.length === 0 && <Typography sx={{ fontSize: 12, color: "#94a3b8", p: 1 }}>当前分类下没有工具。</Typography>}
            {tools.map((tool) => {
              const isAdded = addedToolIds.has(tool.id);
              return (
              <Box key={tool.id} onClick={() => onToolChange(tool.id)} sx={{ p: 1, borderRadius: "10px", border: "1px solid", borderColor: selectedToolId === tool.id ? "#c4b5fd" : "#EEF2F7", bgcolor: selectedToolId === tool.id ? "#faf5ff" : "#fff", cursor: "pointer", opacity: isAdded ? 0.62 : 1 }}>
                <Stack direction="row" spacing={0.75} alignItems="center" justifyContent="space-between">
                  <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#1f2937" }}>{tool.name}</Typography>
                  {isAdded && <Chip label="已添加" size="small" sx={{ height: 18, fontSize: 10, bgcolor: "#f1f5f9", color: "#64748b" }} />}
                </Stack>
                <Typography sx={{ fontSize: 11, color: "#64748b", lineHeight: 1.5, mt: 0.5 }}>{tool.summary}</Typography>
              </Box>
            );})}
          </Stack>
        </Paper>

        <Paper variant="outlined" sx={{ borderColor: "#E0E8F2", borderRadius: "12px", p: 1.25 }}>
          <Typography sx={{ fontSize: 12, color: "#64748b", fontWeight: 700, mb: 1 }}>入参 / 返回参数</Typography>
          {currentTool ? <Stack spacing={1.25}>
            <Box>
              <Typography sx={{ fontSize: 11, color: "#94a3b8", mb: 0.75 }}>入参</Typography>
              <Stack spacing={0.75}>
                {currentTool.params.map((param) => (
                  <Box key={param.id} sx={{ p: 0.85, borderRadius: "8px", bgcolor: "#F8FAFC", border: "1px solid #EEF2F7" }}>
                    <Stack direction="row" spacing={0.5} alignItems="center" flexWrap="wrap" useFlexGap>
                      <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#1f2937" }}>{param.label}</Typography>
                      <Chip label={param.type} size="small" sx={{ height: 17, fontSize: 10, bgcolor: "#f5f3ff", color: "#6d28d9" }} />
                      {param.required && <Chip label="必填" size="small" sx={{ height: 17, fontSize: 10, bgcolor: "#fff7ed", color: "#c2410c" }} />}
                    </Stack>
                    <Typography sx={{ fontSize: 10.5, color: "#64748b", lineHeight: 1.5, mt: 0.35 }}>{param.desc}</Typography>
                  </Box>
                ))}
              </Stack>
            </Box>
            <Divider />
            <Box>
              <Typography sx={{ fontSize: 11, color: "#94a3b8", mb: 0.75 }}>返回参数</Typography>
              <Stack spacing={0.75}>
                {currentTool.outputs.map((output) => (
                  <Box key={output.id} sx={{ p: 0.85, borderRadius: "8px", bgcolor: "#FBFCFF", border: "1px solid #EEF2F7" }}>
                    <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#1f2937" }}>{output.label}</Typography>
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
        <Button disabled={!currentTool || selectedToolAdded} onClick={onAdd} variant="contained" sx={{ textTransform: "none", bgcolor: "#801AEB", borderRadius: "10px", "&:hover": { bgcolor: "#6D16C9" } }}>{selectedToolAdded ? "工具已添加" : "确认添加"}</Button>
      </DialogActions>
    </Dialog>
  );
}
