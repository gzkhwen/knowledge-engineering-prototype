import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
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
  ArrowBack,
  AutoAwesome,
  Close,
  DeleteOutline,
  DragIndicator,
  ExpandLess,
  ExpandMore,
  FactCheck,
  History,
  Send,
  UploadFile,
  WarningAmber,
} from "@mui/icons-material";
import { toast } from "sonner";

type ParamType = "text" | "textarea" | "number" | "select" | "switch" | "tags";
type ChainType = "sampleFile" | "documentFile" | "rawText" | "cleanText" | "qaPairs";

interface ToolParam {
  id: string;
  label: string;
  desc: string;
  type: ParamType;
  value: string | number | boolean | string[];
  required?: boolean;
  editable?: boolean;
  options?: string[];
  min?: number;
  max?: number;
  unit?: string;
}

interface ToolVersion {
  id: string;
  version: string;
  name: string;
  latest?: boolean;
  recommended?: boolean;
  status: "已发布" | "待发布";
  summary: string;
  params: ToolParam[];
  input: ChainType;
  output: ChainType;
}

interface Tool {
  id: string;
  name: string;
  category: string;
  summary: string;
  versions: ToolVersion[];
}

interface ToolNode {
  nodeId: string;
  toolId: string;
  toolName: string;
  category: string;
  version: ToolVersion;
  enabled: boolean;
  expanded: boolean;
  params: ToolParam[];
}

const toolCatalog: Tool[] = [
  {
    id: "file-reader",
    name: "文档文字读取",
    category: "解析",
    summary: "读取 PDF、Word、Excel 中的可程序读取文本，输出原始文本。",
    versions: [
      {
        id: "file-reader-v2.1",
        version: "v2.1.0",
        name: "多格式稳定版",
        latest: true,
        recommended: true,
        status: "已发布",
        summary: "支持 PDF、Word、Excel，可保留标题层级和页码。",
        input: "sampleFile",
        output: "rawText",
        params: [
          { id: "scope", label: "读取范围", desc: "指定读取全文或指定页码区间。", type: "select", value: "全文", required: true, editable: true, options: ["全文", "前 20 页", "指定页码"] },
          { id: "keepHeading", label: "保留标题层级", desc: "开启后输出会保留标题层级标记。", type: "switch", value: true, editable: true },
          { id: "encoding", label: "编码识别", desc: "工具版本内置参数，只读展示。", type: "text", value: "自动识别", editable: false },
        ],
      },
      {
        id: "file-reader-v2.0",
        version: "v2.0.0",
        name: "通用解析版",
        status: "已发布",
        summary: "稳定读取常见办公文档，适用于普通文本型材料。",
        input: "sampleFile",
        output: "rawText",
        params: [
          { id: "scope", label: "读取范围", desc: "指定读取全文或指定页码区间。", type: "select", value: "全文", required: true, editable: true, options: ["全文", "前 20 页", "指定页码"] },
          { id: "keepHeading", label: "保留标题层级", desc: "开启后输出会保留标题层级标记。", type: "switch", value: true, editable: true },
        ],
      },
    ],
  },
  {
    id: "doc-to-pdf",
    name: "doc/docx 转 PDF",
    category: "转换",
    summary: "将 Word 文件转换为统一 PDF 中间格式，便于后续 OCR 或解析。",
    versions: [
      {
        id: "doc-to-pdf-v1.2",
        version: "v1.2.0",
        name: "格式兼容版",
        latest: true,
        recommended: true,
        status: "已发布",
        summary: "兼容 doc、docx、wps 文档，保留分页和页眉页脚。",
        input: "sampleFile",
        output: "documentFile",
        params: [
          { id: "keepPage", label: "保留原始分页", desc: "按源文档分页输出。", type: "switch", value: true, editable: true },
          { id: "fontFallback", label: "缺失字体处理", desc: "缺失字体时的替代策略。", type: "select", value: "平台默认字体", required: true, editable: true, options: ["平台默认字体", "保留原字体名", "转为图片"] },
        ],
      },
      {
        id: "doc-to-pdf-v1.1",
        version: "v1.1.0",
        name: "稳定转换版",
        status: "已发布",
        summary: "适用于普通 Word 文档转换，不保留复杂批注。",
        input: "sampleFile",
        output: "documentFile",
        params: [
          { id: "keepPage", label: "保留原始分页", desc: "按源文档分页输出。", type: "switch", value: true, editable: true },
        ],
      },
    ],
  },
  {
    id: "ocr",
    name: "OCR 识别",
    category: "解析",
    summary: "识别扫描件、图片型 PDF 和图文混排文档中的文字与表格。",
    versions: [
      {
        id: "ocr-v1.4",
        version: "v1.4.0",
        name: "版面增强版",
        latest: true,
        status: "已发布",
        summary: "增强复杂版面识别，适用于多栏、图表混排材料。",
        input: "documentFile",
        output: "rawText",
        params: [
          { id: "model", label: "OCR 模型", desc: "选择本工具版本可调用的识别模型。", type: "select", value: "layoutlm-med", required: true, editable: true, options: ["layoutlm-med", "qwen3.5-plus"] },
          { id: "layout", label: "版面结构保留", desc: "保留多栏、图表和脚注结构。", type: "switch", value: true, editable: true },
          { id: "confidence", label: "最低置信度", desc: "低于阈值的识别结果进入复核提示。", type: "number", value: 0.82, required: true, editable: true, min: 0.5, max: 0.99 },
        ],
      },
      {
        id: "ocr-v1.3",
        version: "v1.3.0",
        name: "生产推荐版",
        recommended: true,
        status: "已发布",
        summary: "稳定识别扫描件与图片型 PDF，支持表格深度解析。",
        input: "documentFile",
        output: "rawText",
        params: [
          { id: "model", label: "OCR 模型", desc: "选择本工具版本可调用的识别模型。", type: "select", value: "qwen3.5-plus", required: true, editable: true, options: ["qwen3.5-plus", "paddle-ocr-pro", "layoutlm-med"] },
          { id: "table", label: "表格深度解析", desc: "识别表格结构并输出单元格关系。", type: "switch", value: true, editable: true },
          { id: "language", label: "识别语言", desc: "留空时自动识别。", type: "text", value: "中文 + 英文", required: true, editable: true },
        ],
      },
      {
        id: "ocr-v1.2",
        version: "v1.2.0",
        name: "图片识别版",
        status: "已发布",
        summary: "适用于图片型材料的基础文字识别。",
        input: "documentFile",
        output: "rawText",
        params: [
          { id: "model", label: "OCR 模型", desc: "选择识别模型。", type: "select", value: "paddle-ocr-pro", required: true, editable: true, options: ["paddle-ocr-pro", "qwen3.5-plus"] },
          { id: "language", label: "识别语言", desc: "留空时自动识别。", type: "text", value: "中文", required: true, editable: true },
        ],
      },
    ],
  },
  {
    id: "cleaner",
    name: "内容清洗",
    category: "标准化",
    summary: "清理页眉页脚、重复段落和噪声文本，输出清洗后文本。",
    versions: [
      {
        id: "cleaner-v2.0",
        version: "v2.0.0",
        name: "医疗问答清洗版",
        latest: true,
        recommended: true,
        status: "已发布",
        summary: "适配医疗咨询材料，保留问答上下文和关键引用。",
        input: "rawText",
        output: "cleanText",
        params: [
          { id: "removeHeader", label: "去除页眉页脚", desc: "识别并移除重复页眉、页脚和页码。", type: "switch", value: true, editable: true },
          { id: "dedupe", label: "重复段落阈值", desc: "超过阈值的相似段落会被合并。", type: "number", value: 0.9, required: true, editable: true, min: 0.5, max: 0.99 },
          { id: "keepTerms", label: "保留医学术语", desc: "用标签标注必须保留的术语。", type: "tags", value: ["诊疗建议", "禁忌症"], editable: true },
        ],
      },
      {
        id: "cleaner-v1.8",
        version: "v1.8.0",
        name: "通用清洗版",
        status: "已发布",
        summary: "清理重复行、页码和明显噪声，适用于普通文本。",
        input: "rawText",
        output: "cleanText",
        params: [
          { id: "removeHeader", label: "去除页眉页脚", desc: "识别并移除重复页眉、页脚和页码。", type: "switch", value: true, editable: true },
          { id: "dedupe", label: "重复段落阈值", desc: "超过阈值的相似段落会被合并。", type: "number", value: 0.85, required: true, editable: true, min: 0.5, max: 0.99 },
        ],
      },
    ],
  },
  {
    id: "qa-extract",
    name: "问答抽取",
    category: "QA抽取",
    summary: "根据知识形态生成问答对，输出结构化问题、答案和引用来源。",
    versions: [
      {
        id: "qa-extract-v3.1",
        version: "v3.1.0",
        name: "推荐生成版",
        latest: true,
        recommended: true,
        status: "已发布",
        summary: "面向问答库构建，支持控制问答粒度、答案长度和引用策略。",
        input: "cleanText",
        output: "qaPairs",
        params: [
          { id: "maxCount", label: "最多生成条数", desc: "限制单份样例最多生成的问答数量。", type: "number", value: 30, required: true, editable: true, min: 1, max: 100, unit: "条" },
          { id: "prompt", label: "抽取要求", desc: "描述问答生成的业务要求。", type: "textarea", value: "围绕医疗健康咨询场景抽取用户高频问题，答案应简洁、准确，并保留来源片段。", required: true, editable: true },
          { id: "questionTypes", label: "问题类型", desc: "限定生成的问题类型。", type: "tags", value: ["症状咨询", "用药建议", "就医判断"], editable: true },
        ],
      },
      {
        id: "qa-extract-v3.0",
        version: "v3.0.0",
        name: "稳定抽取版",
        status: "已发布",
        summary: "稳定生成问答对，适用于标准问答库构建。",
        input: "cleanText",
        output: "qaPairs",
        params: [
          { id: "maxCount", label: "最多生成条数", desc: "限制单份样例最多生成的问答数量。", type: "number", value: 20, required: true, editable: true, min: 1, max: 80, unit: "条" },
          { id: "prompt", label: "抽取要求", desc: "描述问答生成的业务要求。", type: "textarea", value: "抽取高频问题和简明答案。", required: true, editable: true },
        ],
      },
    ],
  },
];

const initialPlanNodes: ToolNode[] = [
  createNode("doc-to-pdf", "doc-to-pdf-v1.2"),
  createNode("ocr", "ocr-v1.3"),
  createNode("cleaner", "cleaner-v2.0"),
  createNode("qa-extract", "qa-extract-v3.1"),
];

function cloneParams(params: ToolParam[]): ToolParam[] {
  return params.map((param) => ({
    ...param,
    value: Array.isArray(param.value) ? [...param.value] : param.value,
  }));
}

function cloneNodes(nodes: ToolNode[]): ToolNode[] {
  return nodes.map((node) => ({
    ...node,
    params: cloneParams(node.params),
  }));
}

function createNode(toolId: string, versionId: string): ToolNode {
  const tool = toolCatalog.find((item) => item.id === toolId);
  const version = tool?.versions.find((item) => item.id === versionId);
  if (!tool || !version) throw new Error("Unknown tool or version");
  return {
    nodeId: `${tool.id}-${version.id}-${Math.random().toString(36).slice(2, 8)}`,
    toolId: tool.id,
    toolName: tool.name,
    category: tool.category,
    version,
    enabled: true,
    expanded: false,
    params: cloneParams(version.params),
  };
}

function getParamProblems(node: ToolNode) {
  if (!node.enabled) return [];
  return node.params.flatMap((param) => {
    if (!param.required) return [];
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
    const paramProblems = getParamProblems(node);
    if (paramProblems.length > 0) {
      warnings[node.nodeId] = [...(warnings[node.nodeId] ?? []), ...paramProblems];
    }
    if (node.version.status !== "已发布") {
      warnings[node.nodeId] = [...(warnings[node.nodeId] ?? []), `${node.version.version} 当前不可用于新处理方案`];
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
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();
  const [rightTab, setRightTab] = useState(1);
  const [planNodes, setPlanNodes] = useState<ToolNode[]>(cloneNodes(initialPlanNodes));
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("全部");
  const [selectedToolId, setSelectedToolId] = useState(toolCatalog[0].id);
  const [selectedVersionId, setSelectedVersionId] = useState(toolCatalog[0].versions[0].id);
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const categories = useMemo(() => ["全部", ...Array.from(new Set(toolCatalog.map((tool) => tool.category)))], []);
  const currentTool = toolCatalog.find((tool) => tool.id === selectedToolId) ?? toolCatalog[0];
  const selectedVersion = currentTool.versions.find((version) => version.id === selectedVersionId) ?? currentTool.versions[0];
  const categorySections = useMemo(() => getCategorySections(planNodes), [planNodes]);
  const nodeWarnings = useMemo(() => getNodeWarnings(planNodes), [planNodes]);
  const allProblems = getPlanProblems(planNodes);
  const canEdit = !confirmed;

  const filteredTools = selectedCategory === "全部"
    ? toolCatalog
    : toolCatalog.filter((tool) => tool.category === selectedCategory);

  const updateNode = (nodeId: string, updater: (node: ToolNode) => ToolNode) => {
    setPlanNodes((current) => current.map((node) => (node.nodeId === nodeId ? updater(node) : node)));
  };

  const openAddTool = () => {
    setAddDialogOpen(true);
    setSelectedCategory("全部");
    setSelectedToolId(toolCatalog[0].id);
    setSelectedVersionId(toolCatalog[0].versions[0].id);
  };

  const addTool = () => {
    if (!canEdit) return;
    const node = createNode(currentTool.id, selectedVersion.id);
    setPlanNodes((current) => [...current, { ...node, expanded: true }]);
    setAddDialogOpen(false);
    toast.success(`已添加工具，已归入${getPlanTitle(node.category)}`);
  };

  const removeNode = (nodeId: string) => {
    if (!canEdit) return;
    setPlanNodes((current) => current.filter((node) => node.nodeId !== nodeId));
    toast.success("已删除工具节点");
  };

  const regenerateByAgent = () => {
    if (!canEdit) return;
    setPlanNodes(cloneNodes(initialPlanNodes));
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
    const next = [...planNodes];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setPlanNodes(next);
    setDraggingNodeId(null);
  };

  const changeParam = (nodeId: string, paramId: string, value: ToolParam["value"]) => {
    if (!canEdit) return;
    updateNode(nodeId, (node) => ({
      ...node,
      params: node.params.map((param) => (param.id === paramId ? { ...param, value } : param)),
    }));
  };

  return (
    <Box sx={{ height: "calc(100vh - 104px)", display: "flex", flexDirection: "column", gap: 2 }}>
      <Paper elevation={0} sx={{ border: "1px solid #E0E8F2", borderRadius: "12px", bgcolor: "#fff", px: 2, py: 1.5 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Button startIcon={<ArrowBack />} onClick={() => navigate(projectId ? `/ops/project/${projectId}` : "/ops")} sx={{ color: "#6b7280", fontSize: 13, textTransform: "none" }}>
            返回
          </Button>
          <Divider orientation="vertical" flexItem />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: 20, fontWeight: 700, color: "#111827" }}>处理方案协作工作台</Typography>
            <Typography sx={{ fontSize: 12, color: "#6b7280", mt: 0.25 }}>医疗健康咨询平台 · 问答库 · 末级类目：常见疾病咨询</Typography>
          </Box>
          <Chip label={confirmed ? "已确认" : "新建草稿"} size="small" sx={{ bgcolor: confirmed ? "#dcfce7" : "#f5f3ff", color: confirmed ? "#15803d" : "#6d28d9", fontWeight: 600 }} />
          <Button startIcon={<History />} variant="outlined" sx={{ textTransform: "none", borderColor: "#E0E8F2", color: "#374151" }}>历史版本</Button>
        </Box>
      </Paper>

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
                已基于样例文件生成处理方案。右侧方案区会按已添加工具的工具分类自动生成对应方案框，请确认工具版本、参数和执行顺序。
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 1.5, flexWrap: "wrap" }} useFlexGap>
                {categorySections.map((section) => (
                  <Chip key={section.category} label={`${getPlanTitle(section.category)}已生成`} size="small" sx={{ bgcolor: "#ecfdf5", color: "#047857" }} />
                ))}
              </Stack>
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
                      <Typography sx={{ fontSize: 12, color: "#64748b" }}>末级类目：常见疾病咨询 · 问答库</Typography>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                        <Chip label={confirmed ? "已确认" : "草稿"} size="small" sx={{ bgcolor: confirmed ? "#dcfce7" : "#f5f3ff", color: confirmed ? "#15803d" : "#6d28d9" }} />
                        <Chip label={allProblems.length ? `${allProblems.length} 项待处理` : "方案校验通过"} size="small" sx={{ bgcolor: allProblems.length ? "#fff7ed" : "#ecfdf5", color: allProblems.length ? "#c2410c" : "#047857" }} />
                        <Chip label={`${categorySections.length} 类方案`} size="small" sx={{ bgcolor: "#eff6ff", color: "#2563eb" }} />
                      </Stack>
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
                  <PlanSection key={section.category} category={section.category} nodes={section.nodes} canEdit={canEdit} warnings={nodeWarnings} onRemove={removeNode} onToggle={(nodeId) => updateNode(nodeId, (node) => ({ ...node, enabled: !node.enabled }))} onExpand={(nodeId) => updateNode(nodeId, (node) => ({ ...node, expanded: !node.expanded }))} onParamChange={changeParam} onDragStart={setDraggingNodeId} onDrop={onDropNode} />
                ))}

                <Button startIcon={<FactCheck />} onClick={confirmPlan} disabled={!canEdit} variant="contained" sx={{ mt: 1, bgcolor: allProblems.length ? "#cbd5e1" : "#801AEB", borderRadius: "10px", textTransform: "none", "&:hover": { bgcolor: allProblems.length ? "#cbd5e1" : "#6D16C9" } }}>
                  保存为处理方案
                </Button>
              </Stack>
            </Box>
          ) : (
            <Box sx={{ p: 2, color: "#94a3b8", fontSize: 13 }}>当前页签用于承接原有工作台信息，本次原型重点展示“方案”页签。</Box>
          )}
        </Paper>
      </Box>

      <AddToolDialog
        open={addDialogOpen}
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={(category) => {
          setSelectedCategory(category);
          const nextTool = category === "全部" ? toolCatalog[0] : toolCatalog.find((tool) => tool.category === category) ?? toolCatalog[0];
          setSelectedToolId(nextTool.id);
          setSelectedVersionId(nextTool.versions[0].id);
        }}
        tools={filteredTools}
        selectedToolId={selectedToolId}
        onToolChange={(toolId) => {
          const tool = toolCatalog.find((item) => item.id === toolId) ?? toolCatalog[0];
          setSelectedToolId(tool.id);
          setSelectedVersionId(tool.versions[0].id);
        }}
        selectedVersionId={selectedVersionId}
        onVersionChange={setSelectedVersionId}
        currentTool={currentTool}
        onClose={() => setAddDialogOpen(false)}
        onAdd={addTool}
      />
    </Box>
  );
}

function PlanSection({
  category,
  nodes,
  canEdit,
  warnings,
  onRemove,
  onToggle,
  onExpand,
  onParamChange,
  onDragStart,
  onDrop,
}: {
  category: string;
  nodes: ToolNode[];
  canEdit: boolean;
  warnings: Record<string, string[]>;
  onRemove: (nodeId: string) => void;
  onToggle: (nodeId: string) => void;
  onExpand: (nodeId: string) => void;
  onParamChange: (nodeId: string, paramId: string, value: ToolParam["value"]) => void;
  onDragStart: (nodeId: string) => void;
  onDrop: (nodeId: string) => void;
}) {
  const title = getPlanTitle(category);
  const hasWarnings = nodes.some((node) => warnings[node.nodeId]?.length);
  return (
    <Box sx={{ border: "1px solid #E0E8F2", borderRadius: "12px", overflow: "hidden" }}>
      <Box sx={{ px: 1.5, py: 1.25, bgcolor: "#FBFCFF", borderBottom: "1px solid #EEF2F7", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#1f2937" }}>{title}</Typography>
          <Typography sx={{ fontSize: 11, color: "#94a3b8", mt: 0.25 }}>由已添加工具的“{category}”分类自动生成</Typography>
        </Box>
        <Stack direction="row" spacing={0.5} alignItems="center">
          <Chip label={hasWarnings ? "待处理" : "已生成"} size="small" sx={{ bgcolor: hasWarnings ? "#fff7ed" : "#ecfdf5", color: hasWarnings ? "#c2410c" : "#047857" }} />
        </Stack>
      </Box>
      <Stack spacing={1} sx={{ p: 1 }}>
        {nodes.map((node, index) => (
          <ToolNodeCard key={node.nodeId} node={node} index={index} canEdit={canEdit} warnings={warnings[node.nodeId] ?? []} onRemove={() => onRemove(node.nodeId)} onToggle={() => onToggle(node.nodeId)} onExpand={() => onExpand(node.nodeId)} onParamChange={(paramId, value) => onParamChange(node.nodeId, paramId, value)} onDragStart={() => onDragStart(node.nodeId)} onDrop={() => onDrop(node.nodeId)} />
        ))}
      </Stack>
    </Box>
  );
}

function ToolNodeCard({
  node,
  index,
  canEdit,
  warnings,
  onRemove,
  onToggle,
  onExpand,
  onParamChange,
  onDragStart,
  onDrop,
}: {
  node: ToolNode;
  index: number;
  canEdit: boolean;
  warnings: string[];
  onRemove: () => void;
  onToggle: () => void;
  onExpand: () => void;
  onParamChange: (paramId: string, value: ToolParam["value"]) => void;
  onDragStart: () => void;
  onDrop: () => void;
}) {
  const paramProblems = getParamProblems(node);
  const hasWarning = warnings.length > 0;
  return (
    <Box
      draggable={canEdit}
      onDragStart={onDragStart}
      onDragOver={(event) => event.preventDefault()}
      onDrop={onDrop}
      sx={{
        border: "1px solid",
        borderColor: hasWarning ? "#fed7aa" : "#E0E8F2",
        borderRadius: "10px",
        bgcolor: hasWarning ? "#fffaf0" : node.enabled ? "#fff" : "#F8FAFC",
        opacity: node.enabled ? 1 : 0.7,
        overflow: "hidden",
      }}
    >
      <Box sx={{ px: 1, py: 1, display: "flex", alignItems: "center", gap: 0.75 }}>
        <DragIndicator sx={{ color: canEdit ? "#9ca3af" : "#d1d5db", cursor: canEdit ? "grab" : "default", fontSize: 18 }} />
        <Box sx={{ width: 22, height: 22, borderRadius: "50%", bgcolor: hasWarning ? "#ffedd5" : "#f5f3ff", color: hasWarning ? "#c2410c" : "#801AEB", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>
          {index + 1}
        </Box>
        <Checkbox size="small" checked={node.enabled} disabled={!canEdit} onChange={onToggle} sx={{ p: 0.25, color: "#801AEB", "&.Mui-checked": { color: "#801AEB" } }} />
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#1f2937", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {node.toolName} <Box component="span" sx={{ color: "#6b7280", fontWeight: 600 }}>{node.version.version}</Box>
          </Typography>
          <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.5, flexWrap: "wrap" }}>
            {node.version.recommended && <Chip label="推荐" size="small" sx={{ height: 18, fontSize: 10, bgcolor: "#f5f3ff", color: "#6d28d9" }} />}
            {node.version.latest && <Chip label="最新" size="small" sx={{ height: 18, fontSize: 10, bgcolor: "#eff6ff", color: "#2563eb" }} />}
            <Chip label={hasWarning ? "需处理" : paramProblems.length ? "参数缺失" : "已配置"} size="small" sx={{ height: 18, fontSize: 10, bgcolor: hasWarning || paramProblems.length ? "#fff7ed" : "#ecfdf5", color: hasWarning || paramProblems.length ? "#c2410c" : "#047857" }} />
          </Stack>
        </Box>
        <IconButton onClick={onExpand} size="small" sx={{ color: "#64748b" }}>{node.expanded ? <ExpandLess /> : <ExpandMore />}</IconButton>
        {canEdit && <IconButton onClick={onRemove} size="small" sx={{ color: "#ef4444", "&:hover": { bgcolor: "#fef2f2" } }}><DeleteOutline fontSize="small" /></IconButton>}
      </Box>
      {warnings.length > 0 && (
        <Box sx={{ mx: 1, mb: 1, p: 1, borderRadius: "8px", bgcolor: "#fff7ed", border: "1px solid #fed7aa" }}>
          {warnings.map((warning) => (
            <Stack key={warning} direction="row" spacing={0.75} alignItems="flex-start">
              <WarningAmber sx={{ fontSize: 15, color: "#c2410c", mt: "1px" }} />
              <Typography sx={{ fontSize: 11, color: "#9a3412", lineHeight: 1.5 }}>{warning}</Typography>
            </Stack>
          ))}
        </Box>
      )}
      {node.expanded && (
        <Box sx={{ borderTop: "1px solid #EEF2F7", p: 1.25, bgcolor: "#FBFCFF" }}>
          <Typography sx={{ fontSize: 11, color: "#64748b", mb: 1 }}>{node.version.summary}</Typography>
          <Stack spacing={1}>
            {node.params.map((param) => <ParamField key={param.id} param={param} canEdit={canEdit && param.editable !== false && node.enabled} onChange={(value) => onParamChange(param.id, value)} />)}
          </Stack>
        </Box>
      )}
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
        <Select label={param.label} value={String(param.value)} disabled={!canEdit} onChange={(event) => onChange(event.target.value)}>
          {(param.options ?? []).map((option) => <MenuItem key={option} value={option}>{option}</MenuItem>)}
        </Select>
      </FormControl>
    );
  }
  if (param.type === "textarea") return <TextField size="small" fullWidth multiline minRows={3} label={param.label} value={String(param.value)} disabled={!canEdit} onChange={(event) => onChange(event.target.value)} helperText={param.desc} sx={commonSx} />;
  if (param.type === "number") return <TextField size="small" fullWidth type="number" label={param.label} value={Number(param.value)} disabled={!canEdit} onChange={(event) => onChange(Number(event.target.value))} helperText={`${param.desc}${param.unit ? `，单位：${param.unit}` : ""}`} sx={commonSx} />;
  if (param.type === "tags") {
    const tags = Array.isArray(param.value) ? param.value : [];
    return (
      <Box>
        <Typography sx={{ fontSize: 12, color: "#374151", mb: 0.75 }}>{param.label}</Typography>
        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
          {tags.map((tag) => <Chip key={tag} label={tag} size="small" sx={{ bgcolor: "#f5f3ff", color: "#6d28d9" }} />)}
          {canEdit && <Chip label="新增" size="small" onClick={() => onChange([...tags, "新增标签"])} sx={{ borderStyle: "dashed" }} variant="outlined" />}
        </Stack>
      </Box>
    );
  }
  return <TextField size="small" fullWidth label={param.label} value={String(param.value)} disabled={!canEdit} onChange={(event) => onChange(event.target.value)} helperText={param.desc} sx={commonSx} />;
}

function AddToolDialog({
  open,
  categories,
  selectedCategory,
  onCategoryChange,
  tools,
  selectedToolId,
  onToolChange,
  selectedVersionId,
  onVersionChange,
  currentTool,
  onClose,
  onAdd,
}: {
  open: boolean;
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  tools: Tool[];
  selectedToolId: string;
  onToolChange: (toolId: string) => void;
  selectedVersionId: string;
  onVersionChange: (versionId: string) => void;
  currentTool: Tool;
  onClose: () => void;
  onAdd: () => void;
}) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: "14px" } }}>
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box>
            <Typography sx={{ fontSize: 18, fontWeight: 700 }}>添加工具</Typography>
            <Typography sx={{ fontSize: 12, color: "#6b7280", mt: 0.5 }}>
              选择工具版本后追加到工具链末尾，系统会按工具分类自动归入对应方案框
            </Typography>
          </Box>
          <IconButton onClick={onClose}><Close /></IconButton>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ display: "grid", gridTemplateColumns: "160px 260px 1fr", gap: 1.5, minHeight: 420 }}>
        <Paper variant="outlined" sx={{ borderColor: "#E0E8F2", borderRadius: "12px", p: 1 }}>
          <Typography sx={{ fontSize: 12, color: "#64748b", fontWeight: 700, mb: 1 }}>分类</Typography>
          <Stack spacing={0.5}>
            {categories.map((category) => (
              <Button key={category} onClick={() => onCategoryChange(category)} sx={{ justifyContent: "space-between", color: selectedCategory === category ? "#6d28d9" : "#64748b", bgcolor: selectedCategory === category ? "#f5f3ff" : "transparent", textTransform: "none", borderRadius: "8px" }}>
                <span>{category}</span>
                <Chip label={category === "全部" ? toolCatalog.length : toolCatalog.filter((tool) => tool.category === category).length} size="small" sx={{ height: 18, fontSize: 10 }} />
              </Button>
            ))}
          </Stack>
        </Paper>

        <Paper variant="outlined" sx={{ borderColor: "#E0E8F2", borderRadius: "12px", p: 1 }}>
          <Typography sx={{ fontSize: 12, color: "#64748b", fontWeight: 700, mb: 1 }}>工具</Typography>
          <Stack spacing={0.75}>
            {tools.map((tool) => (
              <Box key={tool.id} onClick={() => onToolChange(tool.id)} sx={{ p: 1, borderRadius: "10px", border: "1px solid", borderColor: selectedToolId === tool.id ? "#c4b5fd" : "#EEF2F7", bgcolor: selectedToolId === tool.id ? "#faf5ff" : "#fff", cursor: "pointer" }}>
                <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#1f2937" }}>{tool.name}</Typography>
                <Typography sx={{ fontSize: 11, color: "#64748b", lineHeight: 1.5, mt: 0.5 }}>{tool.summary}</Typography>
              </Box>
            ))}
          </Stack>
        </Paper>

        <Paper variant="outlined" sx={{ borderColor: "#E0E8F2", borderRadius: "12px", p: 1.25 }}>
          <Typography sx={{ fontSize: 12, color: "#64748b", fontWeight: 700, mb: 1 }}>版本</Typography>
          <Stack spacing={0.75}>
            {currentTool.versions.map((version) => (
              <Box key={version.id} onClick={() => onVersionChange(version.id)} sx={{ p: 1, borderRadius: "10px", border: "1px solid", borderColor: selectedVersionId === version.id ? "#c4b5fd" : "#EEF2F7", bgcolor: selectedVersionId === version.id ? "#faf5ff" : "#fff", cursor: "pointer" }}>
                <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap" useFlexGap>
                  <Typography sx={{ fontSize: 13, fontWeight: 700 }}>{version.version} {version.name}</Typography>
                  {version.latest && <Chip label="最新" size="small" sx={{ height: 18, fontSize: 10, bgcolor: "#eff6ff", color: "#2563eb" }} />}
                  {version.recommended && <Chip label="推荐" size="small" sx={{ height: 18, fontSize: 10, bgcolor: "#f5f3ff", color: "#6d28d9" }} />}
                </Stack>
                <Typography sx={{ fontSize: 11, color: "#64748b", lineHeight: 1.5, mt: 0.5 }}>{version.summary}</Typography>
              </Box>
            ))}
          </Stack>
        </Paper>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} sx={{ textTransform: "none", color: "#64748b" }}>取消</Button>
        <Button onClick={onAdd} variant="contained" sx={{ textTransform: "none", bgcolor: "#801AEB", borderRadius: "10px", "&:hover": { bgcolor: "#6D16C9" } }}>确认添加</Button>
      </DialogActions>
    </Dialog>
  );
}
