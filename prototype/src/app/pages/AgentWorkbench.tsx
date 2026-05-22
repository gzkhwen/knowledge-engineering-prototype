import { useMemo, useState } from "react";
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
  ExpandLess,
  ExpandMore,
  FactCheck,
  Send,
  UploadFile,
  WarningAmber,
} from "@mui/icons-material";
import { toast } from "sonner";
import { dataStore } from "../store/DataStore";

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
  outputs: { id: string; label: string; desc: string }[];
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
  params: ToolParam[];
}

const mcpService: McpService = {
  name: "nacos-knowledge-tool-mcp",
  version: "V1.0.0",
};

const toolCatalog: McpTool[] = [
  {
    id: "document-parser",
    name: "文档解析",
    category: "文档解析",
    summary: "接收文件地址，解析 PDF、Word、HTML 等材料并输出 RAG 标准 chunk。",
    status: "可用",
    input: "sampleFile",
    output: "rawText",
    params: [
      { id: "method", label: "解析方式", desc: "选择文档解析策略。", type: "select", value: "general", required: true, editable: true, options: ["general", "vlm", "intelli_medical_insurance"] },
      { id: "parseTable", label: "表格解析", desc: "开启后保留表格单元格结构。", type: "switch", value: true, editable: true },
      { id: "callback", label: "异步回调", desc: "长文档解析时自动生成 callback_url。", type: "switch", value: true, editable: true },
    ],
    outputs: [
      { id: "rawText", label: "解析文本", desc: "文档解析后的正文内容。" },
      { id: "resultPath", label: "结果地址", desc: "解析结果文件的存储路径。" },
    ],
  },
  {
    id: "chunk-splitter",
    name: "切片算法",
    category: "内容处理",
    summary: "将文档解析结果进一步切分为检索可用片段。",
    status: "可用",
    input: "rawText",
    output: "cleanText",
    params: [
      { id: "chunkSize", label: "切片长度", desc: "单个 chunk 的目标长度。", type: "number", value: 800, required: true, editable: true, min: 200, max: 2000, unit: "字" },
      { id: "overlap", label: "Overlap", desc: "相邻 chunk 的重叠长度。", type: "number", value: 120, required: true, editable: true, min: 0, max: 400, unit: "字" },
      { id: "heading", label: "按标题层级切片", desc: "开启后优先按标题层级断点切片。", type: "switch", value: true, editable: true },
    ],
    outputs: [
      { id: "chunks", label: "切片列表", desc: "面向检索和生成使用的标准化片段。" },
      { id: "metadata", label: "切片元数据", desc: "标题层级、来源页码和片段序号。" },
    ],
  },
  {
    id: "summary",
    name: "摘要",
    category: "智能生成",
    summary: "批量输入切片文本，返回每个切片的摘要总结。",
    status: "可用",
    input: "cleanText",
    output: "rawText",
    params: [
      { id: "maxTokens", label: "摘要长度", desc: "控制单段摘要最大 token 数。", type: "number", value: 300, required: true, editable: true, min: 80, max: 1000, unit: "tokens" },
      { id: "temperature", label: "生成温度", desc: "值越低输出越稳定。", type: "number", value: 0.2, required: true, editable: true, min: 0, max: 1 },
    ],
    outputs: [
      { id: "summaryText", label: "摘要文本", desc: "按切片生成的摘要内容。" },
      { id: "sourceRef", label: "来源引用", desc: "摘要对应的原始切片引用。" },
    ],
  },
  {
    id: "qa-extractor",
    name: "QA 抽取",
    category: "智能生成",
    summary: "根据切片内容生成问答对，输出结构化问题、答案和引用来源。",
    status: "可用",
    input: "cleanText",
    output: "qaPairs",
    params: [
      { id: "maxCount", label: "最多生成条数", desc: "限制单份样例最多生成的问答数量。", type: "number", value: 30, required: true, editable: true, min: 1, max: 100, unit: "条" },
      { id: "prompt", label: "抽取要求", desc: "描述问答生成的业务要求。", type: "textarea", value: "围绕知识库构建场景抽取用户高频问题，答案应简洁、准确，并保留来源片段。", required: true, editable: true },
      { id: "questionTypes", label: "问题类型", desc: "限定生成的问题类型。", type: "tags", value: ["操作步骤", "异常排查", "规则说明"], editable: true },
    ],
    outputs: [
      { id: "question", label: "问题", desc: "生成的标准问题。" },
      { id: "answer", label: "答案", desc: "与问题匹配的答案内容。" },
      { id: "citation", label: "引用来源", desc: "答案引用的来源片段。" },
    ],
  },
];

const initialPlanNodes: ToolNode[] = [
  createNode("document-parser"),
  createNode("chunk-splitter"),
  createNode("summary"),
  createNode("qa-extractor"),
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

function createNode(toolId: string): ToolNode {
  const tool = toolCatalog.find((item) => item.id === toolId);
  if (!tool) throw new Error("Unknown MCP tool");
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
    params: cloneParams(tool.params),
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
    if (node.status !== "可用") {
      warnings[node.nodeId] = [...(warnings[node.nodeId] ?? []), `${node.toolName} 当前不可用于新处理方案`];
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
  const [confirmed, setConfirmed] = useState(false);

  const categories = useMemo(() => ["全部", ...Array.from(new Set(toolCatalog.map((tool) => tool.category)))], []);
  const currentTool = toolCatalog.find((tool) => tool.id === selectedToolId) ?? toolCatalog[0];
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
  };

  const addTool = () => {
    if (!canEdit) return;
    const node = createNode(currentTool.id);
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
          const nextTool = category === "全部" ? toolCatalog[0] : toolCatalog.find((tool) => tool.category === category) ?? toolCatalog[0];
          setSelectedToolId(nextTool.id);
        }}
        tools={filteredTools}
        selectedToolId={selectedToolId}
        onToolChange={(toolId) => {
          const tool = toolCatalog.find((item) => item.id === toolId) ?? toolCatalog[0];
          setSelectedToolId(tool.id);
        }}
        currentTool={currentTool}
        service={mcpService}
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
  return (
    <Box sx={{ border: "1px solid #E0E8F2", borderRadius: "12px", overflow: "hidden" }}>
      <Box sx={{ px: 1.5, py: 1.25, bgcolor: "#FBFCFF", borderBottom: "1px solid #EEF2F7" }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#1f2937" }}>{title}</Typography>
        </Box>
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
            {node.toolName}
          </Typography>
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
  currentTool,
  service,
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
  currentTool: McpTool;
  service: McpService;
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
            {categories.map((category) => (
              <Button key={category} onClick={() => onCategoryChange(category)} sx={{ justifyContent: "space-between", color: selectedCategory === category ? "#6d28d9" : "#64748b", bgcolor: selectedCategory === category ? "#f5f3ff" : "transparent", textTransform: "none", borderRadius: "8px" }}>
                <span>{category}</span>
                <Chip label={category === "全部" ? toolCatalog.length : toolCatalog.filter((tool) => tool.category === category).length} size="small" sx={{ height: 18, fontSize: 10 }} />
              </Button>
            ))}
          </Stack>
        </Paper>

        <Paper variant="outlined" sx={{ borderColor: "#E0E8F2", borderRadius: "12px", p: 1 }}>
          <Typography sx={{ fontSize: 12, color: "#64748b", fontWeight: 700, mb: 1 }}>MCP 工具</Typography>
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
          <Typography sx={{ fontSize: 12, color: "#64748b", fontWeight: 700, mb: 1 }}>入参 / 返回参数</Typography>
          <Stack spacing={1.25}>
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
