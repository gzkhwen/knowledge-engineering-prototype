import { useMemo, useState } from "react";
import {
  Add,
  Delete,
  Edit,
  Link as LinkIcon,
  PlayArrow,
  Sync,
  Visibility,
  Close,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Drawer,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  Switch,
} from "@mui/material";
import { toast } from "sonner";

type McpServiceType = "系统内置" | "Nacos" | "标准 MCP Server";
type McpTransport = "Streamable HTTP" | "SSE";
type McpAuthType = "无鉴权" | "Bearer Token" | "API Key";
type McpServiceStatus = "连接正常" | "连接异常" | "已停用";

interface McpToolSyncItem {
  name: string;
  description: string;
  enabled: boolean;
}

interface McpServiceItem {
  id: string;
  name: string;
  serviceType: McpServiceType;
  transport: McpTransport;
  endpoint: string;
  authType: McpAuthType;
  version: string;
  description: string;
  status: McpServiceStatus;
  toolCount: number;
  toolNames: string[];
  tools: McpToolSyncItem[];
  toolCategories?: Record<string, string>;
  lastSyncedAt: string;
  locked?: boolean;
}

interface McpServiceDraft {
  name: string;
  serviceType: McpServiceType;
  transport: McpTransport;
  endpoint: string;
  authType: McpAuthType;
  authHeader: string;
  authValue: string;
  version: string;
  description: string;
}

interface ManagedToolItem {
  id: string;
  name: string;
  description: string;
  category: string;
  enabled: boolean;
  lastSyncedAt: string;
}

const BLUE = "#3b82f6";
const SECONDARY_DRAWER_Z_INDEX = 1500;

const defaultDraft: McpServiceDraft = {
  name: "",
  serviceType: "标准 MCP Server",
  transport: "Streamable HTTP",
  endpoint: "",
  authType: "Bearer Token",
  authHeader: "Authorization",
  authValue: "",
  version: "V1.0.0",
  description: "",
};

const initialServices: McpServiceItem[] = [
  {
    id: "svc-system-internal",
    name: "知识工程内置 MCP Server",
    serviceType: "系统内置",
    transport: "Streamable HTTP",
    endpoint: "system://knowledge-engineering/internal-mcp",
    authType: "无鉴权",
    version: "V1.0.0",
    description: "知识工程平台自研维护的系统工具服务，向 Agent 和流程引擎提供代码工具、数据存储工具。",
    status: "连接正常",
    toolCount: 2,
    toolNames: ["代码工具", "数据存储工具"],
    tools: [
      { name: "代码工具", description: "接收前置工具输出，执行脚本后产出可被后续工具引用的变量。", enabled: true },
      { name: "数据存储工具", description: "选择工具输出路径并写入 ES 等目标存储。", enabled: true },
    ],
    toolCategories: {
      代码工具: "系统工具",
      数据存储工具: "系统工具",
    },
    lastSyncedAt: "2026-05-29 09:30",
    locked: true,
  },
  {
    id: "svc-nacos",
    name: "Nacos 知识工程 MCP",
    serviceType: "Nacos",
    transport: "Streamable HTTP",
    endpoint: "https://nacos.customer.local/mcp/knowledge",
    authType: "API Key",
    version: "V1.0.0",
    description: "从 Nacos 暴露知识解析、分片和抽取相关工具。",
    status: "连接正常",
    toolCount: 8,
    toolNames: ["通用解析", "多模态解析", "通用分片", "自定义分隔符分片", "QA提取", "摘要总结", "文档图谱抽取", "表格深度解析"],
    tools: [
      { name: "通用解析", description: "解析常见 Office、PDF、HTML 文档并输出文本与结构信息。", enabled: true },
      { name: "多模态解析", description: "面向图片、扫描件和复杂版式文档进行 OCR 与结构化解析。", enabled: true },
      { name: "通用分片", description: "按长度、标题和段落边界生成知识片段。", enabled: true },
      { name: "自定义分隔符分片", description: "按用户指定分隔符拆分文档内容。", enabled: true },
      { name: "QA提取", description: "从文档内容中抽取问答对。", enabled: true },
      { name: "摘要总结", description: "生成文档或片段摘要。", enabled: true },
      { name: "文档图谱抽取", description: "抽取实体、关系和层级结构。", enabled: false },
      { name: "表格深度解析", description: "识别复杂表格结构并输出结构化单元格内容。", enabled: true },
    ],
    toolCategories: {
      通用解析: "文档解析",
      多模态解析: "文档解析",
      通用分片: "内容处理",
      自定义分隔符分片: "内容处理",
      QA提取: "智能生成",
      摘要总结: "智能生成",
      文档图谱抽取: "智能生成",
      表格深度解析: "文档解析",
    },
    lastSyncedAt: "2026-05-27 10:18",
  },
  {
    id: "svc-customer-doc",
    name: "客户自建文档处理 MCP",
    serviceType: "标准 MCP Server",
    transport: "SSE",
    endpoint: "https://mcp.customer.com/document/sse",
    authType: "Bearer Token",
    version: "V1.1.0",
    description: "客户侧自建 MCP Server，提供医保政策文档处理工具。",
    status: "连接正常",
    toolCount: 5,
    toolNames: ["医保政策文件解析", "分隔符递归分片", "OCR解析专用分片", "医保政策文件分片", "关键词提取"],
    tools: [
      { name: "医保政策文件解析", description: "解析医保政策文件并保留条款、章节和附件结构。", enabled: true },
      { name: "分隔符递归分片", description: "按多级分隔符递归拆分内容。", enabled: true },
      { name: "OCR解析专用分片", description: "面向 OCR 解析结果进行噪声清理和片段拆分。", enabled: true },
      { name: "医保政策文件分片", description: "按医保政策章节和条款边界生成片段。", enabled: true },
      { name: "关键词提取", description: "抽取政策主题词、机构名称和业务关键词。", enabled: true },
    ],
    toolCategories: {
      医保政策文件解析: "文档解析",
      分隔符递归分片: "内容处理",
      OCR解析专用分片: "内容处理",
      医保政策文件分片: "内容处理",
      关键词提取: "智能生成",
    },
    lastSyncedAt: "2026-05-27 09:42",
  },
  {
    id: "svc-quality",
    name: "客户质量评估 MCP",
    serviceType: "标准 MCP Server",
    transport: "Streamable HTTP",
    endpoint: "https://mcp.customer.com/quality",
    authType: "Bearer Token",
    version: "V0.9.2",
    description: "客户侧评估工具服务，当前连接异常，保留上次同步工具。",
    status: "连接异常",
    toolCount: 2,
    toolNames: ["RAG质量评估", "问答一致性检查"],
    tools: [
      { name: "RAG质量评估", description: "基于检索结果、答案和参考材料评估 RAG 质量。", enabled: true },
      { name: "问答一致性检查", description: "检查问答对与原文片段的一致性。", enabled: true },
    ],
    toolCategories: {
      RAG质量评估: "质量评估",
      问答一致性检查: "质量评估",
    },
    lastSyncedAt: "2026-05-26 17:30",
  },
];

const discoveredToolNames = ["文档解析", "文本分片", "QA提取"];

function nowText() {
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

function formatSyncTime(value: string) {
  if (!value || value === "-") return "未同步";
  const [datePart, timePart = ""] = value.split(" ");
  const [year, month, day] = datePart.split("-");
  if (!year || !month || !day) return value;
  return `${year}年${Number(month)}月${Number(day)}日 ${timePart}`;
}

function statusSx(status: McpServiceStatus) {
  if (status === "连接正常") return { bgcolor: "#f0fdf4", color: "#16a34a" };
  if (status === "连接异常") return { bgcolor: "#fef2f2", color: "#dc2626" };
  return { bgcolor: "#f1f5f9", color: "#64748b" };
}

function getServerSourceType(service: McpServiceItem) {
  return service.locked || service.serviceType === "系统内置" ? "系统内置" : "外部接入";
}

function toService(draft: McpServiceDraft, id = `svc-${Date.now()}`): McpServiceItem {
  return {
    id,
    name: draft.name.trim(),
    serviceType: draft.serviceType,
    transport: draft.transport,
    endpoint: draft.endpoint.trim(),
    authType: draft.authType,
    version: draft.version.trim() || "V1.0.0",
    description: draft.description.trim(),
    status: "连接正常",
    toolCount: id.startsWith("svc-") ? 0 : 3,
    toolNames: [],
    tools: [],
    toolCategories: {},
    lastSyncedAt: "-",
  };
}

function buildManagedTools(): ManagedToolItem[] {
  return initialServices.flatMap((service) => service.tools.map((tool) => ({
    id: `${service.id}-${tool.name}`,
    name: tool.name,
    description: tool.description,
    category: service.toolCategories?.[tool.name] ?? "未分类",
    enabled: tool.enabled && service.status !== "已停用",
    lastSyncedAt: service.lastSyncedAt,
  })));
}

function buildInitialCategories() {
  return Array.from(new Set(buildManagedTools().map((tool) => tool.category)));
}

export function McpServiceManagementPage() {
  const [services, setServices] = useState(initialServices);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<McpServiceDraft>(defaultDraft);
  const [connectionTested, setConnectionTested] = useState(false);
  const [detailService, setDetailService] = useState<McpServiceItem | null>(null);
  const [pendingDisableService, setPendingDisableService] = useState<McpServiceItem | null>(null);

  const openCreate = () => {
    setEditingId(null);
    setDraft(defaultDraft);
    setConnectionTested(false);
    setDialogOpen(true);
  };

  const openEdit = (service: McpServiceItem) => {
    if (service.locked) {
      toast.info("系统内置 MCP Server 不允许修改连接信息");
      return;
    }
    setEditingId(service.id);
    setDraft({
      name: service.name,
      serviceType: service.serviceType,
      transport: service.transport,
      endpoint: service.endpoint,
      authType: service.authType,
      authHeader: service.authType === "API Key" ? "x-api-key" : "Authorization",
      authValue: "",
      version: service.version,
      description: service.description,
    });
    setConnectionTested(true);
    setDialogOpen(true);
  };

  const openDetail = (service: McpServiceItem) => {
    setDetailService(service);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingId(null);
    setDraft(defaultDraft);
    setConnectionTested(false);
  };

  const updateDraft = (patch: Partial<McpServiceDraft>) => {
    setDraft((prev) => ({ ...prev, ...patch }));
    setConnectionTested(false);
  };

  const testConnection = () => {
    if (!draft.name.trim() || !draft.endpoint.trim()) {
      toast.error("请先填写服务名称和服务地址");
      return;
    }
    setConnectionTested(true);
    toast.success("连接测试通过，已完成 initialize 和 tools/list");
  };

  const saveService = () => {
    if (!draft.name.trim() || !draft.endpoint.trim()) {
      toast.error("服务名称和服务地址不能为空");
      return;
    }
    if (!connectionTested) {
      toast.error("请先完成连接测试");
      return;
    }
    if (editingId) {
      setServices((items) => items.map((item) => (
        item.id === editingId
          ? {
              ...item,
              ...toService(draft, editingId),
              toolCount: item.toolCount,
              toolNames: item.toolNames,
              tools: item.tools,
              toolCategories: item.toolCategories,
              lastSyncedAt: item.lastSyncedAt,
            }
          : item
      )));
      toast.success("MCP 服务已更新");
    } else {
      setServices((items) => [...items, { ...toService(draft), toolCount: 0 }]);
      toast.success("MCP 服务已接入");
    }
    closeDialog();
  };

  const syncService = (serviceId: string) => {
    const target = services.find((item) => item.id === serviceId);
    if (target?.locked) {
      toast.info("系统内置 MCP Server 由平台自动维护，无需手动同步");
      return;
    }
    if (!target || target.status === "连接异常") {
      setServices((items) => items.map((item) => (
        item.id === serviceId ? { ...item, status: "连接异常" } : item
      )));
      toast.error("MCP Server同步失败");
      return;
    }
    setServices((items) => items.map((item) => (
      item.id === serviceId
        ? {
            ...item,
            status: "连接正常",
            toolCount: Math.max(item.toolCount, discoveredToolNames.length),
            toolNames: item.toolNames.length ? item.toolNames : discoveredToolNames,
            tools: item.tools.length ? item.tools : discoveredToolNames.map((name) => ({ name, description: "从 MCP Server 同步的工具，待管理员补充分组和说明。", enabled: true })),
            lastSyncedAt: nowText(),
          }
        : item
    )));
    toast.success("MCP Server同步成功");
  };

  const toggleService = (serviceId: string, nextEnabled: boolean) => {
    const target = services.find((item) => item.id === serviceId);
    if (target?.locked) {
      toast.info("系统内置 MCP Server 不允许停用");
      return;
    }
    if (!nextEnabled && target) {
      setPendingDisableService(target);
      return;
    }
    setServices((items) => items.map((item) => (
      item.id === serviceId
        ? { ...item, status: "连接正常" }
        : item
    )));
    toast.success("MCP 服务已启用");
  };

  const confirmDisableService = () => {
    if (!pendingDisableService) return;
    setServices((items) => items.map((item) => (
      item.id === pendingDisableService.id
        ? { ...item, status: "已停用" }
        : item
    )));
    setPendingDisableService(null);
    toast.warning("MCP 服务已停用");
  };

  const deleteService = (serviceId: string) => {
    const target = services.find((item) => item.id === serviceId);
    if (target?.locked) {
      toast.info("系统内置 MCP Server 不允许删除");
      return;
    }
    setServices((items) => items.filter((item) => item.id !== serviceId));
    toast.success("MCP 服务已删除");
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "calc(100vh - 112px)", minHeight: 0 }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, mb: 1.5 }}>
        <Box>
          <Typography sx={{ fontSize: "15px", fontWeight: 700, color: "#111827" }}>MCP服务管理</Typography>
          <Typography sx={{ fontSize: "12px", color: "#64748b", mt: 0.25 }}>
            接入 Nacos 或客户自建 MCP Server，完成连接测试和工具同步；系统内置 MCP Server 可见但不允许修改。
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Add sx={{ fontSize: 16 }} />} onClick={openCreate} sx={{ height: 34, bgcolor: BLUE, borderRadius: "6px", textTransform: "none", boxShadow: "none", fontSize: "13px", "&:hover": { bgcolor: "#2563eb", boxShadow: "none" } }}>
          接入MCP服务
        </Button>
      </Box>

      <Paper sx={{ border: "1px solid #e8eaed", borderRadius: "10px", boxShadow: "none", overflow: "hidden", flex: 1, minHeight: 0, display: "flex", flexDirection: "column", width: "100%", maxWidth: "100%" }}>
        <TableContainer sx={{ flex: 1, width: "100%", maxWidth: "100%", overflowX: "auto", overflowY: "auto", display: "block", WebkitOverflowScrolling: "touch", "&::-webkit-scrollbar": { height: 12 }, "&::-webkit-scrollbar-track": { bgcolor: "#f1f5f9" }, "&::-webkit-scrollbar-thumb": { bgcolor: "#cbd5e1", borderRadius: 999, border: "3px solid #f1f5f9" }, "&::-webkit-scrollbar-thumb:hover": { bgcolor: "#94a3b8" } }}>
          <Table size="small" stickyHeader sx={{ tableLayout: "fixed", minWidth: 1020 }}>
            <TableHead>
              <TableRow sx={{ bgcolor: "#f8f9fb" }}>
                {[
                  ["服务名称", "210px"],
                  ["Server类型", "110px"],
                  ["协议", "115px"],
                  ["服务地址", "260px"],
                  ["状态", "130px"],
                  ["工具数", "90px"],
                  ["最近同步", "140px"],
                  ["操作", "170px"],
                ].map(([label, width]) => (
                  <TableCell key={label} sx={{ width, bgcolor: "#f8f9fb", fontSize: "12px", fontWeight: 600, color: "#6b7280", py: 1.5, px: 1.25, borderBottom: "1px solid #f0f0f0", whiteSpace: "nowrap" }}>{label}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {services.map((service, index) => (
                <TableRow key={service.id} sx={{ bgcolor: index % 2 === 0 ? "#fff" : "#fafafa", "&:hover": { bgcolor: "#f6f9ff" }, "& td": { borderBottom: "1px solid #f5f5f5" } }}>
                  <TableCell sx={{ py: 1.5, px: 1.25, minWidth: 0 }}>
                    <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#111827" }}>{service.name}</Typography>
                  </TableCell>
                  <TableCell sx={{ py: 1.5, px: 1.25 }}>
                    <Chip
                      label={getServerSourceType(service)}
                      size="small"
                      sx={{
                        height: 21,
                        fontSize: 10.5,
                        bgcolor: service.locked ? "#f5f3ff" : "#eff6ff",
                        color: service.locked ? "#6d28d9" : "#2563eb",
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ py: 1.5, px: 1.25 }}>
                    <Stack direction="row" spacing={0.5} alignItems="center" flexWrap="wrap" useFlexGap>
                      <Chip label={service.transport} size="small" sx={{ height: 21, fontSize: 10.5, bgcolor: "#eff6ff", color: "#2563eb" }} />
                    </Stack>
                  </TableCell>
                  <TableCell sx={{ py: 1.5, px: 1.25, fontSize: "12px", color: "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    <LinkIcon sx={{ fontSize: 13, color: "#94a3b8", mr: 0.5, verticalAlign: "-2px" }} />
                    {service.endpoint}
                  </TableCell>
                  <TableCell sx={{ py: 1.5, px: 1.25 }}>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <Chip label={service.status} size="small" sx={{ height: 21, fontSize: 10.5, ...statusSx(service.status) }} />
                      <Tooltip title={service.locked ? "系统内置服务自动维护" : "MCP Server同步"}>
                        <span>
                          <IconButton disabled={service.locked} size="small" onClick={() => syncService(service.id)} sx={{ color: BLUE, p: 0.4 }}>
                            <Sync sx={{ fontSize: 15 }} />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                  <TableCell sx={{ py: 1.5, px: 1.25 }}>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <Typography sx={{ fontSize: "12px", color: "#111827" }}>{service.toolCount} 个</Typography>
                      <Tooltip title="查看工具列表"><IconButton size="small" onClick={() => openDetail(service)} sx={{ color: BLUE, p: 0.4 }}><Visibility sx={{ fontSize: 15 }} /></IconButton></Tooltip>
                    </Stack>
                  </TableCell>
                  <TableCell sx={{ py: 1.5, px: 1.25, fontSize: "12px", color: "#64748b" }}>{service.lastSyncedAt}</TableCell>
                  <TableCell sx={{ py: 1.5, px: 1.25 }}>
                    <Stack direction="row" spacing={0.25} alignItems="center">
                      <Tooltip title={service.locked ? "系统内置服务不允许停用" : service.status === "已停用" ? "启用服务" : "停用服务"}>
                        <span>
                          <Switch
                            checked={service.status !== "已停用"}
                            disabled={service.locked}
                            size="small"
                            onChange={(event) => toggleService(service.id, event.target.checked)}
                            sx={{ "& .MuiSwitch-switchBase.Mui-checked": { color: BLUE }, "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: "#93c5fd" } }}
                          />
                        </span>
                      </Tooltip>
                      <Tooltip title={service.locked ? "系统内置服务不允许修改" : "编辑"}><span><IconButton disabled={service.locked} size="small" onClick={() => openEdit(service)} sx={{ color: "#64748b" }}><Edit sx={{ fontSize: 16 }} /></IconButton></span></Tooltip>
                      <Tooltip title={service.locked ? "系统内置服务不允许删除" : "删除"}><span><IconButton disabled={service.locked} size="small" onClick={() => deleteService(service.id)} sx={{ color: "#ef4444" }}><Delete sx={{ fontSize: 16 }} /></IconButton></span></Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontSize: "16px", fontWeight: 700, px: 3, pt: 2.25, pb: 1 }}>
          {editingId ? "编辑MCP服务" : "接入MCP服务"}
        </DialogTitle>
        <DialogContent sx={{ px: 3, pt: "8px !important", pb: 1 }}>
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
            <TextField label="服务名称" size="small" value={draft.name} onChange={(event) => updateDraft({ name: event.target.value })} fullWidth />
            <FormControl size="small" fullWidth>
                <InputLabel>协议类型</InputLabel>
                <Select label="协议类型" value={draft.transport} onChange={(event) => updateDraft({ transport: event.target.value as McpTransport })}>
                  <MenuItem value="Streamable HTTP">Streamable HTTP</MenuItem>
                  <MenuItem value="SSE">SSE</MenuItem>
                </Select>
            </FormControl>
            <TextField label="服务地址" size="small" value={draft.endpoint} onChange={(event) => updateDraft({ endpoint: event.target.value })} placeholder={draft.transport === "SSE" ? "https://example.com/mcp/sse" : "https://example.com/mcp"} fullWidth sx={{ gridColumn: "1 / -1" }} />
            <FormControl size="small" fullWidth>
                <InputLabel>鉴权方式</InputLabel>
                <Select label="鉴权方式" value={draft.authType} onChange={(event) => updateDraft({ authType: event.target.value as McpAuthType })}>
                  <MenuItem value="无鉴权">无鉴权</MenuItem>
                  <MenuItem value="Bearer Token">Bearer Token</MenuItem>
                  <MenuItem value="API Key">API Key</MenuItem>
                </Select>
            </FormControl>
            {draft.authType !== "无鉴权" ? (
              <TextField label="Header" size="small" value={draft.authHeader} onChange={(event) => updateDraft({ authHeader: event.target.value })} fullWidth />
            ) : <Box />}
            {draft.authType !== "无鉴权" ? (
              <TextField label="密钥" size="small" type="password" value={draft.authValue} onChange={(event) => updateDraft({ authValue: event.target.value })} fullWidth sx={{ gridColumn: "1 / -1" }} />
            ) : null}
            <TextField label="服务描述" size="small" value={draft.description} onChange={(event) => updateDraft({ description: event.target.value })} multiline minRows={2} fullWidth sx={{ gridColumn: "1 / -1" }} />
            <Box sx={{ p: 1.25, border: "1px solid #e5e7eb", borderRadius: "8px", bgcolor: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1.5, gridColumn: "1 / -1" }}>
              <Box>
                <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#111827" }}>连接测试</Typography>
                <Typography sx={{ fontSize: "12px", color: "#64748b", mt: 0.25 }}>测试 initialize 和 tools/list 是否可用。</Typography>
              </Box>
              <Button variant="outlined" size="small" startIcon={<PlayArrow sx={{ fontSize: 15 }} />} onClick={testConnection} sx={{ textTransform: "none", flexShrink: 0 }}>
                测试连接
              </Button>
            </Box>
            {connectionTested ? (
              <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ gridColumn: "1 / -1" }}>
                {["连接正常", "initialize 成功", "tools/list 可用", "可同步工具"].map((item) => (
                  <Chip key={item} label={item} size="small" sx={{ height: 22, fontSize: 11, bgcolor: "#f0fdf4", color: "#16a34a" }} />
                ))}
              </Stack>
            ) : null}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={closeDialog} sx={{ textTransform: "none", color: "#64748b" }}>取消</Button>
          <Button variant="contained" onClick={saveService} sx={{ textTransform: "none", bgcolor: BLUE, boxShadow: "none" }}>{editingId ? "保存" : "确认接入"}</Button>
        </DialogActions>
      </Dialog>

      <Drawer
        anchor="right"
        open={Boolean(detailService)}
        onClose={() => setDetailService(null)}
        ModalProps={{ sx: { zIndex: SECONDARY_DRAWER_Z_INDEX } }}
        slotProps={{ backdrop: { sx: { position: "fixed", inset: 0, zIndex: SECONDARY_DRAWER_Z_INDEX, bgcolor: "rgba(17, 24, 39, 0.48)" } } }}
        PaperProps={{ sx: { width: 680, maxWidth: "92vw", zIndex: SECONDARY_DRAWER_Z_INDEX + 1 } }}
      >
        {detailService ? (
          <Box sx={{ height: "100%", display: "flex", flexDirection: "column", bgcolor: "#fff" }}>
            <Box sx={{ px: 3, py: 2.5, borderBottom: "1px solid #e8eaed", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 2 }}>
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontSize: "22px", fontWeight: 700, color: "#111827" }}>工具列表</Typography>
                <Typography sx={{ mt: 0.5, fontSize: "13px", color: "#64748b" }}>
                  {detailService.name} · 共 {detailService.toolCount} 个工具 · 最近同步于 {formatSyncTime(detailService.lastSyncedAt)}
                </Typography>
              </Box>
              <IconButton onClick={() => setDetailService(null)} sx={{ color: "#64748b" }}><Close sx={{ fontSize: 20 }} /></IconButton>
            </Box>

            <Box sx={{ flex: 1, overflow: "auto", px: 3, py: 2.5, bgcolor: "#FBFCFF" }}>
              <Paper variant="outlined" sx={{ borderColor: "#e8eaed", borderRadius: "10px", overflow: "hidden", bgcolor: "#fff" }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      {["工具名称", "工具描述", "状态"].map((label) => (
                        <TableCell key={label} sx={{ bgcolor: "#f8f9fb", fontSize: "12px", fontWeight: 600, color: "#6b7280" }}>{label}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {detailService.tools.map((tool) => (
                      <TableRow key={tool.name}>
                        <TableCell sx={{ width: 160, fontSize: "12px", color: "#111827", fontWeight: 600 }}>{tool.name}</TableCell>
                        <TableCell sx={{ fontSize: "12px", color: "#64748b", lineHeight: 1.6 }}>{tool.description}</TableCell>
                        <TableCell sx={{ width: 120 }}>
                          <Chip label={tool.enabled ? "启用" : "停用"} size="small" sx={{ height: 21, fontSize: 10.5, bgcolor: tool.enabled ? "#f0fdf4" : "#f1f5f9", color: tool.enabled ? "#16a34a" : "#64748b" }} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Paper>
            </Box>
          </Box>
        ) : null}
      </Drawer>

      <Dialog open={Boolean(pendingDisableService)} onClose={() => setPendingDisableService(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontSize: "15px", fontWeight: 700, py: 2, px: 3 }}>确认停用 MCP 服务</DialogTitle>
        <DialogContent sx={{ px: 3, pt: "8px !important", pb: 1 }}>
          <Typography sx={{ fontSize: "13px", color: "#374151", lineHeight: 1.8 }}>
            停用后，Agent 和流程引擎将不能继续发现和调用「<strong>{pendingDisableService?.name}</strong>」下的工具。已发布流程如果依赖这些工具，执行时可能失败。
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setPendingDisableService(null)} sx={{ textTransform: "none", color: "#64748b" }}>取消</Button>
          <Button onClick={confirmDisableService} variant="contained" sx={{ textTransform: "none", bgcolor: "#dc2626", boxShadow: "none", "&:hover": { bgcolor: "#b91c1c", boxShadow: "none" } }}>确认停用</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export function ToolManagementPage() {
  const [tools, setTools] = useState<ManagedToolItem[]>(buildManagedTools);
  const [categories, setCategories] = useState<string[]>(buildInitialCategories);
  const [selectedCategory, setSelectedCategory] = useState("全部工具");
  const [query, setQuery] = useState("");
  const [selectedToolIds, setSelectedToolIds] = useState<string[]>([]);
  const [batchOpen, setBatchOpen] = useState(false);
  const [batchCategory, setBatchCategory] = useState(buildInitialCategories()[0] ?? "未分类");
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [categoryDraft, setCategoryDraft] = useState("");

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    tools.forEach((tool) => {
      counts[tool.category] = (counts[tool.category] ?? 0) + 1;
    });
    return counts;
  }, [tools]);

  const filteredTools = useMemo(() => tools.filter((tool) => {
    if (selectedCategory !== "全部工具" && tool.category !== selectedCategory) return false;
    if (!query.trim()) return true;
    const keyword = query.trim().toLowerCase();
    return tool.name.toLowerCase().includes(keyword) || tool.description.toLowerCase().includes(keyword);
  }), [query, selectedCategory, tools]);

  const allFilteredSelected = filteredTools.length > 0 && filteredTools.every((tool) => selectedToolIds.includes(tool.id));
  const someFilteredSelected = filteredTools.some((tool) => selectedToolIds.includes(tool.id)) && !allFilteredSelected;

  const openCreateCategory = () => {
    setEditingCategory(null);
    setCategoryDraft("");
    setCategoryDialogOpen(true);
  };

  const openEditCategory = (category: string) => {
    setEditingCategory(category);
    setCategoryDraft(category);
    setCategoryDialogOpen(true);
  };

  const saveCategory = () => {
    const nextName = categoryDraft.trim();
    if (!nextName) {
      toast.error("分类名称不能为空");
      return;
    }
    if (!editingCategory && categories.includes(nextName)) {
      toast.error("分类名称已存在");
      return;
    }
    if (editingCategory) {
      if (editingCategory !== nextName && categories.includes(nextName)) {
        toast.error("分类名称已存在");
        return;
      }
      setCategories((items) => items.map((item) => (item === editingCategory ? nextName : item)));
      setTools((items) => items.map((tool) => (tool.category === editingCategory ? { ...tool, category: nextName } : tool)));
      setSelectedCategory((current) => (current === editingCategory ? nextName : current));
      toast.success("工具分类已更新");
    } else {
      setCategories((items) => [...items, nextName]);
      toast.success("工具分类已新增");
    }
    setCategoryDialogOpen(false);
  };

  const deleteCategory = (category: string) => {
    if (!window.confirm(`确定删除分类「${category}」吗？该分类下工具将进入未分类。`)) return;
    setCategories((items) => {
      const next = items.filter((item) => item !== category);
      return next.includes("未分类") ? next : [...next, "未分类"];
    });
    setTools((items) => items.map((tool) => (tool.category === category ? { ...tool, category: "未分类" } : tool)));
    setSelectedCategory("全部工具");
    toast.success("工具分类已删除");
  };

  const toggleTool = (toolId: string) => {
    setSelectedToolIds((items) => (
      items.includes(toolId) ? items.filter((id) => id !== toolId) : [...items, toolId]
    ));
  };

  const toggleAllFiltered = () => {
    setSelectedToolIds((items) => {
      const ids = filteredTools.map((tool) => tool.id);
      if (allFilteredSelected) return items.filter((id) => !ids.includes(id));
      return Array.from(new Set([...items, ...ids]));
    });
  };

  const openBatchCategory = () => {
    if (selectedToolIds.length === 0) {
      toast.error("请先选择工具");
      return;
    }
    setBatchCategory(categories[0] ?? "未分类");
    setBatchOpen(true);
  };

  const saveBatchCategory = () => {
    if (!batchCategory) {
      toast.error("请选择分类");
      return;
    }
    setTools((items) => items.map((tool) => (
      selectedToolIds.includes(tool.id) ? { ...tool, category: batchCategory } : tool
    )));
    setSelectedToolIds([]);
    setBatchOpen(false);
    toast.success("工具分类已设置");
  };

  const toggleToolEnabled = (toolId: string) => {
    setTools((items) => items.map((tool) => (
      tool.id === toolId ? { ...tool, enabled: !tool.enabled } : tool
    )));
  };

  return (
    <Box sx={{ height: "calc(100vh - 112px)", minHeight: 0, display: "flex", flexDirection: "column" }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, mb: 1.5 }}>
        <Box>
          <Typography sx={{ fontSize: "15px", fontWeight: 700, color: "#111827" }}>工具管理</Typography>
          <Typography sx={{ fontSize: "12px", color: "#64748b", mt: 0.25 }}>
            管理从 MCP Server 同步回来的工具资产，维护业务分类和启停状态，供 Agent 与流程引擎统一使用。
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Add sx={{ fontSize: 16 }} />} onClick={openCreateCategory} sx={{ height: 34, bgcolor: BLUE, borderRadius: "6px", textTransform: "none", boxShadow: "none", fontSize: "13px", "&:hover": { bgcolor: "#2563eb", boxShadow: "none" } }}>
          新增分类
        </Button>
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: "240px minmax(0, 1fr)", gap: 1.5, flex: 1, minHeight: 0 }}>
        <Paper sx={{ border: "1px solid #e8eaed", borderRadius: "10px", boxShadow: "none", p: 1.25, minHeight: 0, overflow: "auto" }}>
          <Stack spacing={0.75}>
            <Box
              onClick={() => setSelectedCategory("全部工具")}
              sx={{ px: 1.1, py: 0.9, borderRadius: "8px", cursor: "pointer", bgcolor: selectedCategory === "全部工具" ? "#eff6ff" : "transparent", border: "1px solid", borderColor: selectedCategory === "全部工具" ? "#bfdbfe" : "transparent" }}
            >
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#111827" }}>全部工具</Typography>
                <Typography sx={{ fontSize: "12px", color: "#64748b" }}>{tools.length}</Typography>
              </Stack>
            </Box>
            {categories.map((category) => (
              <Box
                key={category}
                onClick={() => setSelectedCategory(category)}
                sx={{ px: 1.1, py: 0.85, borderRadius: "8px", cursor: "pointer", bgcolor: selectedCategory === category ? "#eff6ff" : "transparent", border: "1px solid", borderColor: selectedCategory === category ? "#bfdbfe" : "transparent", "&:hover .category-actions": { opacity: 1 } }}
              >
                <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontSize: "13px", fontWeight: 650, color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{category}</Typography>
                    <Typography sx={{ fontSize: "11px", color: "#94a3b8", mt: 0.2 }}>{categoryCounts[category] ?? 0} 个工具</Typography>
                  </Box>
                  <Stack className="category-actions" direction="row" spacing={0.1} sx={{ opacity: 0, transition: "opacity 0.16s ease" }} onClick={(event) => event.stopPropagation()}>
                    <IconButton size="small" onClick={() => openEditCategory(category)} sx={{ p: 0.35, color: "#64748b" }}><Edit sx={{ fontSize: 14 }} /></IconButton>
                    <IconButton size="small" onClick={() => deleteCategory(category)} sx={{ p: 0.35, color: "#ef4444" }}><Delete sx={{ fontSize: 14 }} /></IconButton>
                  </Stack>
                </Stack>
              </Box>
            ))}
          </Stack>
        </Paper>

        <Paper sx={{ border: "1px solid #e8eaed", borderRadius: "10px", boxShadow: "none", minHeight: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <Box sx={{ px: 1.5, py: 1.2, borderBottom: "1px solid #eef2f7", display: "flex", gap: 1, alignItems: "center", justifyContent: "space-between" }}>
            <TextField
              size="small"
              placeholder="搜索工具名称或描述"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              sx={{ width: 320, "& .MuiOutlinedInput-root": { height: 34, borderRadius: "8px", fontSize: "13px" } }}
            />
            <Stack direction="row" spacing={1} alignItems="center">
              {selectedToolIds.length > 0 ? <Typography sx={{ fontSize: "12px", color: "#64748b" }}>已选择 {selectedToolIds.length} 个工具</Typography> : null}
              <Button variant="outlined" disabled={selectedToolIds.length === 0} onClick={openBatchCategory} sx={{ height: 32, textTransform: "none", fontSize: "12px", borderRadius: "6px" }}>
                设置分类
              </Button>
            </Stack>
          </Box>

          <TableContainer sx={{ flex: 1, overflow: "auto" }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: 48, bgcolor: "#f8f9fb" }}>
                    <Checkbox size="small" checked={allFilteredSelected} indeterminate={someFilteredSelected} onChange={toggleAllFiltered} />
                  </TableCell>
                  {["工具名称", "工具描述", "工具分类", "状态", "最近同步"].map((label) => (
                    <TableCell key={label} sx={{ bgcolor: "#f8f9fb", fontSize: "12px", fontWeight: 600, color: "#6b7280" }}>{label}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTools.map((tool, index) => (
                  <TableRow key={tool.id} sx={{ bgcolor: index % 2 === 0 ? "#fff" : "#fafafa", "&:hover": { bgcolor: "#f6f9ff" }, "& td": { borderBottom: "1px solid #f5f5f5" } }}>
                    <TableCell sx={{ py: 1 }}>
                      <Checkbox size="small" checked={selectedToolIds.includes(tool.id)} onChange={() => toggleTool(tool.id)} />
                    </TableCell>
                    <TableCell sx={{ py: 1.2, fontSize: "13px", fontWeight: 650, color: "#111827" }}>{tool.name}</TableCell>
                    <TableCell sx={{ py: 1.2, fontSize: "12px", color: "#64748b", maxWidth: 360, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{tool.description}</TableCell>
                    <TableCell sx={{ py: 1.2 }}>
                      <Chip label={tool.category} size="small" sx={{ height: 22, fontSize: 10.5, bgcolor: "#f1f5f9", color: "#475569" }} />
                    </TableCell>
                    <TableCell sx={{ py: 1.2 }}>
                      <Stack direction="row" spacing={0.75} alignItems="center">
                        <Chip label={tool.enabled ? "启用" : "停用"} size="small" sx={{ height: 22, fontSize: 10.5, bgcolor: tool.enabled ? "#f0fdf4" : "#f1f5f9", color: tool.enabled ? "#16a34a" : "#64748b" }} />
                        <Switch size="small" checked={tool.enabled} onChange={() => toggleToolEnabled(tool.id)} sx={{ "& .MuiSwitch-switchBase.Mui-checked": { color: BLUE }, "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: "#93c5fd" } }} />
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ py: 1.2, fontSize: "12px", color: "#64748b" }}>{tool.lastSyncedAt}</TableCell>
                  </TableRow>
                ))}
                {filteredTools.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} sx={{ py: 4, textAlign: "center", color: "#94a3b8", fontSize: "13px" }}>暂无匹配工具</TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>

      <Dialog open={categoryDialogOpen} onClose={() => setCategoryDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontSize: "15px", fontWeight: 700, py: 2, px: 3 }}>{editingCategory ? "编辑分类" : "新增分类"}</DialogTitle>
        <DialogContent sx={{ px: 3, pt: "8px !important" }}>
          <TextField autoFocus fullWidth size="small" label="分类名称" value={categoryDraft} onChange={(event) => setCategoryDraft(event.target.value)} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setCategoryDialogOpen(false)} sx={{ textTransform: "none", color: "#64748b" }}>取消</Button>
          <Button variant="contained" onClick={saveCategory} sx={{ textTransform: "none", bgcolor: BLUE, boxShadow: "none" }}>保存</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={batchOpen} onClose={() => setBatchOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontSize: "15px", fontWeight: 700, py: 2, px: 3 }}>设置分类</DialogTitle>
        <DialogContent sx={{ px: 3, pt: "8px !important" }}>
          <Typography sx={{ fontSize: "13px", color: "#64748b", mb: 1 }}>已选择 {selectedToolIds.length} 个工具</Typography>
          <FormControl size="small" fullWidth>
            <InputLabel>目标分类</InputLabel>
            <Select label="目标分类" value={batchCategory} onChange={(event) => setBatchCategory(event.target.value)}>
              {categories.map((category) => <MenuItem key={category} value={category}>{category}</MenuItem>)}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setBatchOpen(false)} sx={{ textTransform: "none", color: "#64748b" }}>取消</Button>
          <Button variant="contained" onClick={saveBatchCategory} sx={{ textTransform: "none", bgcolor: BLUE, boxShadow: "none" }}>确认</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
