import { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Drawer,
  FormControl,
  IconButton,
  InputAdornment,
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
  Tooltip,
  Typography,
} from "@mui/material";
import {
  Add,
  Close,
  ContentCopy,
  Delete,
  ErrorOutline,
  Refresh,
  Search,
} from "@mui/icons-material";
import { toast } from "sonner";

const BLUE = "#3b82f6";
const DETAIL_DRAWER_Z_INDEX = 1800;
const DETAIL_DIALOG_Z_INDEX = DETAIL_DRAWER_Z_INDEX + 10;

type ServiceStatus = "运行中" | "停用" | "异常";
type ConnectorStatus = "正常" | "异常" | "未检测";
type ConnectorType = "OpenAPI" | "REST API" | "自定义 HTTP";
type AuthType = "Bearer Token" | "API Key" | "Basic Auth" | "None";
type DetailTab = "basic" | "tools" | "apikey";

type ServiceApiKey = {
  id: string;
  label: string;
  key: string;
  status: "启用" | "停用";
  createdAt: string;
  lastUsedAt: string;
};

type ToolOption = {
  id: string;
  name: string;
  category: string;
  connector: string;
  status: "已发布" | "待发布" | "草稿" | "已停用";
};

type McpService = {
  id: string;
  name: string;
  description: string;
  instructions: string;
  authTarget: string;
  status: ServiceStatus;
  endpoint: string;
  tools: string[];
  callsToday: number;
  apiKeys: ServiceApiKey[];
};

type Connector = {
  id: string;
  name: string;
  type: ConnectorType;
  status: ConnectorStatus;
  baseUrl: string;
  specUrl: string;
  healthPath: string;
  method: string;
  requestPath: string;
  auth: AuthType;
  toolCount: number;
  lastChecked: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  errorMessage?: string;
  endpoints: string[];
};

const initialTools: ToolOption[] = [
  { id: "tool-context", name: "查询项目上下文", category: "项目上下文", connector: "知识工程核心 API", status: "已发布" },
  { id: "tool-solution", name: "生成处理方案", category: "方案生成", connector: "知识工程核心 API", status: "已发布" },
  { id: "tool-material", name: "检索原始素材", category: "素材检索", connector: "原始素材服务", status: "草稿" },
  { id: "tool-verify", name: "校验构建结果", category: "结果校验", connector: "构建结果校验服务", status: "已停用" },
];

const initialServices: McpService[] = [
  {
    id: "svc-knowledge",
    name: "知识工程 Agent MCP",
    description: "生产环境默认服务，提供知识工程 Agent 所需工具集合。",
    instructions: "优先调用已发布工具；写操作前确认 projectId、templateId 与素材范围。",
    authTarget: "knowledge-agent-prod",
    status: "运行中",
    endpoint: "https://mcp.internal/toolhub/knowledge-agent",
    tools: ["查询项目上下文", "生成处理方案"],
    callsToday: 286,
    apiKeys: [
      { id: "key-live-agent", label: "知识工程 Agent 生产环境", key: "th_live_1_****************", status: "启用", createdAt: "2026-05-18 10:12", lastUsedAt: "2026-05-18 18:24" },
      { id: "key-live-debug", label: "联调测试", key: "th_live_2_****************", status: "启用", createdAt: "2026-05-17 16:40", lastUsedAt: "2026-05-18 11:08" },
    ],
  },
  {
    id: "svc-staging",
    name: "知识工程测试 MCP",
    description: "测试服务。",
    instructions: "仅用于测试，不处理生产项目。",
    authTarget: "knowledge-agent-staging",
    status: "停用",
    endpoint: "https://mcp.internal/toolhub/knowledge-staging",
    tools: ["查询项目上下文"],
    callsToday: 0,
    apiKeys: [
      { id: "key-test-agent", label: "测试环境", key: "th_test_1_****************", status: "启用", createdAt: "2026-05-16 14:05", lastUsedAt: "-" },
    ],
  },
];

const initialConnectors: Connector[] = [
  {
    id: "conn-knowledge",
    name: "知识工程核心 API",
    type: "OpenAPI",
    status: "正常",
    baseUrl: "https://api.knowledge.internal/v1",
    specUrl: "https://api.knowledge.internal/openapi.json",
    healthPath: "/health",
    method: "GET",
    requestPath: "",
    auth: "Bearer Token",
    toolCount: 5,
    lastChecked: "2026-05-18 10:35",
    createdBy: "平台研发",
    createdAt: "2026-05-16 10:20",
    updatedAt: "2026-05-18 09:40",
    endpoints: ["GET /projects/{id}", "POST /solutions/generate", "GET /templates"],
  },
  {
    id: "conn-material",
    name: "原始素材服务",
    type: "REST API",
    status: "正常",
    baseUrl: "https://material.internal/api",
    specUrl: "",
    healthPath: "/ping",
    method: "GET",
    requestPath: "",
    auth: "API Key",
    toolCount: 3,
    lastChecked: "2026-05-18 10:22",
    createdBy: "知识工程",
    createdAt: "2026-05-15 15:18",
    updatedAt: "2026-05-17 18:05",
    endpoints: [],
  },
  {
    id: "conn-check",
    name: "构建结果校验服务",
    type: "自定义 HTTP",
    status: "异常",
    baseUrl: "https://verify.internal/api",
    specUrl: "",
    healthPath: "/status",
    method: "POST",
    requestPath: "/verify/document",
    auth: "Basic Auth",
    toolCount: 2,
    lastChecked: "2026-05-18 09:58",
    createdBy: "算法平台",
    createdAt: "2026-05-14 11:30",
    updatedAt: "2026-05-18 09:10",
    errorMessage: "健康检查接口 /status 返回 500，最近一次连接超时 3.2s。",
    endpoints: [],
  },
];

function serviceStatusColor(status: ServiceStatus) {
  if (status === "运行中") return { bg: "#dcfce7", color: "#166534" };
  if (status === "停用") return { bg: "#f3f4f6", color: "#6b7280" };
  return { bg: "#fef2f2", color: "#b91c1c" };
}

function connectorStatusColor(status: ConnectorStatus) {
  if (status === "正常") return { bg: "#dcfce7", color: "#166534" };
  if (status === "未检测") return { bg: "#f3f4f6", color: "#6b7280" };
  return { bg: "#fef2f2", color: "#b91c1c" };
}

function toolStatusColor(status: ToolOption["status"]) {
  if (status === "已发布") return { bg: "#dcfce7", color: "#166534" };
  if (status === "待发布") return { bg: "#fff7ed", color: "#c2410c" };
  if (status === "草稿") return { bg: "#f3f4f6", color: "#4b5563" };
  return { bg: "#f3f4f6", color: "#6b7280" };
}

function StatusChip({ status, type = "service" }: { status: string; type?: "service" | "connector" | "tool" }) {
  const color =
    type === "connector"
      ? connectorStatusColor(status as ConnectorStatus)
      : type === "tool"
        ? toolStatusColor(status as ToolOption["status"])
        : serviceStatusColor(status as ServiceStatus);
  return (
    <Chip
      label={status}
      size="small"
      sx={{ height: 22, fontSize: "11px", bgcolor: color.bg, color: color.color, border: "none", "& .MuiChip-label": { px: 1 } }}
    />
  );
}

const detailTableHeadCellSx = {
  fontSize: "12px",
  fontWeight: 600,
  color: "#6b7280",
  py: 1.5,
  bgcolor: "#f8f9fb",
  borderBottom: "1px solid #f0f0f0",
  whiteSpace: "nowrap",
};

const detailTableTextCellSx = {
  py: 1.5,
  fontSize: "12px",
  color: "#374151",
};

const detailTableRowSx = (index: number) => ({
  bgcolor: index % 2 === 0 ? "#fff" : "#fafafa",
  "&:hover": { bgcolor: "#f6f9ff" },
  "& td": { borderBottom: "1px solid #f5f5f5" },
});

const emptyService: Omit<McpService, "id" | "endpoint" | "status" | "callsToday" | "apiKeys"> = {
  name: "",
  description: "",
  instructions: "",
  authTarget: "knowledge-agent-prod",
  tools: [],
};

export function ToolHubMcpServicesPage() {
  const [services, setServices] = useState<McpService[]>(initialServices);
  const [query, setQuery] = useState("");
  const [toolQuery, setToolQuery] = useState("");
  const [toolCategory, setToolCategory] = useState("all");
  const [toolConnector, setToolConnector] = useState("all");
  const [editingService, setEditingService] = useState<McpService | null>(null);
  const [serviceDraft, setServiceDraft] = useState(emptyService);
  const [deleteTarget, setDeleteTarget] = useState<McpService | null>(null);
  const [stopTarget, setStopTarget] = useState<McpService | null>(null);
  const [apiKeyDeleteTarget, setApiKeyDeleteTarget] = useState<ServiceApiKey | null>(null);
  const [createdApiKey, setCreatedApiKey] = useState<ServiceApiKey | null>(null);
  const [detailServiceId, setDetailServiceId] = useState<string | null>(null);
  const [detailTab, setDetailTab] = useState<DetailTab>("basic");
  const [keyLabel, setKeyLabel] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  const publishedTools = useMemo(() => initialTools.filter((tool) => tool.status === "已发布"), []);
  const categories = useMemo(() => Array.from(new Set(publishedTools.map((tool) => tool.category))), [publishedTools]);
  const connectors = useMemo(() => Array.from(new Set(publishedTools.map((tool) => tool.connector))), [publishedTools]);

  const visibleServices = useMemo(() => (
    services.filter((service) => `${service.name}${service.endpoint}`.toLowerCase().includes(query.toLowerCase()))
  ), [services, query]);

  const pagedServices = useMemo(() => (
    visibleServices.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
  ), [visibleServices, page, rowsPerPage]);

  const detailService = useMemo(() => (
    services.find((service) => service.id === detailServiceId) ?? null
  ), [services, detailServiceId]);

  const detailTools = useMemo(() => (
    detailService ? initialTools.filter((tool) => detailService.tools.includes(tool.name)) : []
  ), [detailService]);

  const visibleTools = useMemo(() => (
    publishedTools.filter((tool) => {
      if (toolQuery && !`${tool.name}${tool.connector}`.toLowerCase().includes(toolQuery.toLowerCase())) return false;
      if (toolCategory !== "all" && tool.category !== toolCategory) return false;
      if (toolConnector !== "all" && tool.connector !== toolConnector) return false;
      return true;
    })
  ), [publishedTools, toolCategory, toolConnector, toolQuery]);

  const openCreate = () => {
    setEditingService(null);
    setServiceDraft({ ...emptyService });
  };

  const openEdit = (service: McpService) => {
    setEditingService(service);
    setServiceDraft({
      name: service.name,
      description: service.description,
      instructions: service.instructions,
      tools: service.tools,
    });
  };

  const openDetail = (service: McpService) => {
    setDetailServiceId(service.id);
    setDetailTab("basic");
  };

  const closeEditor = () => {
    setEditingService(null);
    setServiceDraft(emptyService);
  };

  const saveService = () => {
    const name = serviceDraft.name.trim();
    if (!name) {
      toast.error("请填写服务名称");
      return;
    }
    if (editingService) {
      setServices((prev) => prev.map((service) => (service.id === editingService.id ? { ...service, ...serviceDraft, name } : service)));
      toast.success("MCP 服务已更新");
    } else {
      setServices((prev) => [
        {
          id: `svc-${Date.now()}`,
          ...serviceDraft,
          name,
          status: "停用",
          endpoint: `https://mcp.internal/toolhub/${Date.now().toString().slice(-6)}`,
          callsToday: 0,
          apiKeys: [],
        },
        ...prev,
      ]);
      toast.success("MCP 服务已创建");
    }
    closeEditor();
  };

  const toggleTool = (toolName: string) => {
    setServiceDraft((prev) => ({
      ...prev,
      tools: prev.tools.includes(toolName) ? prev.tools.filter((item) => item !== toolName) : [...prev.tools, toolName],
    }));
  };

  const generateApiKey = () => {
    if (!detailService) return;
    const label = keyLabel.trim();
    if (!label) {
      toast.error("请填写名称");
      return;
    }
    const now = "2026-05-18 20:10";
    const fullKey = `th_${detailService.status === "运行中" ? "live" : "test"}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 18)}`;
    const nextKey: ServiceApiKey = {
      id: `key-${Date.now()}`,
      label,
      key: fullKey,
      status: "启用",
      createdAt: now,
      lastUsedAt: "-",
    };
    setServices((prev) => prev.map((service) => (
      service.id === detailService.id ? { ...service, apiKeys: [nextKey, ...service.apiKeys] } : service
    )));
    setKeyLabel("");
    setCreatedApiKey(nextKey);
    toast.success("已生成新的 API Key");
  };

  const deleteApiKey = () => {
    if (!detailService || !apiKeyDeleteTarget) return;
    setServices((prev) => prev.map((service) => (
      service.id === detailService.id
        ? { ...service, apiKeys: service.apiKeys.filter((item) => item.id !== apiKeyDeleteTarget.id) }
        : service
    )));
    setApiKeyDeleteTarget(null);
    toast.success("API Key 已删除");
  };

  const enableService = (service: McpService) => {
    setServices((prev) => prev.map((item) => (item.id === service.id ? { ...item, status: "运行中" } : item)));
    toast.success("服务已启用");
  };

  const confirmStopService = () => {
    if (!stopTarget) return;
    setServices((prev) => prev.map((service) => (
      service.id === stopTarget.id ? { ...service, status: "停用" } : service
    )));
    setStopTarget(null);
    toast.success("服务已停用");
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    setServices((prev) => prev.filter((service) => service.id !== deleteTarget.id));
    setDeleteTarget(null);
    toast.success("MCP 服务已删除");
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0, maxWidth: "100%" }}>
      <Box>
        <Typography variant="h4" sx={{ fontSize: "22px", fontWeight: 700, color: "#111827" }}>
          MCP 服务
        </Typography>
      </Box>

      <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
        <TextField
          size="small"
          placeholder="搜索服务名称 / Endpoint"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setPage(0);
          }}
          InputProps={{ startAdornment: <InputAdornment position="start"><Search sx={{ fontSize: 18, color: "#9ca3af" }} /></InputAdornment> }}
          sx={{ width: 300, "& .MuiOutlinedInput-root": { borderRadius: "8px", bgcolor: "#fff", fontSize: "13px" }, "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e8eaed" } }}
        />
        <Button variant="contained" startIcon={<Add sx={{ fontSize: 16 }} />} onClick={openCreate} sx={{ bgcolor: BLUE, textTransform: "none", borderRadius: "6px", boxShadow: "none" }}>
          新建 MCP 服务
        </Button>
      </Box>

      <Paper sx={{ border: "1px solid #e8eaed", borderRadius: "10px", boxShadow: "none", overflow: "hidden", width: "100%", maxWidth: "100%" }}>
        {visibleServices.length === 0 ? (
          <Box sx={{ py: 10, textAlign: "center" }}>
            <Typography sx={{ fontSize: "14px", color: "#9ca3af" }}>当前筛选条件下暂无 MCP 服务</Typography>
          </Box>
        ) : (
          <Box>
            <TableContainer sx={{ width: "100%", maxWidth: "100%", overflowX: "auto", overflowY: "hidden", display: "block", WebkitOverflowScrolling: "touch", "&::-webkit-scrollbar": { height: 12 }, "&::-webkit-scrollbar-track": { bgcolor: "#f1f5f9" }, "&::-webkit-scrollbar-thumb": { bgcolor: "#cbd5e1", borderRadius: 999, border: "3px solid #f1f5f9" }, "&::-webkit-scrollbar-thumb:hover": { bgcolor: "#94a3b8" } }}>
              <Table size="small" stickyHeader sx={{ minWidth: 1160, tableLayout: "fixed" }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: "#f8f9fb" }}>
                    {[
                      ["名称", "220px"],
                      ["状态", "120px"],
                      ["Endpoint", "420px"],
                      ["工具数", "100px"],
                      ["今日调用", "110px"],
                      ["操作", "240px"],
                    ].map(([head, width]) => (
                      <TableCell key={head} sx={{ width, fontSize: "12px", fontWeight: 600, color: "#6b7280", py: 1.5, bgcolor: "#f8f9fb", borderBottom: "1px solid #f0f0f0", whiteSpace: "nowrap" }}>
                        {head}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pagedServices.map((service, index) => (
                    <TableRow key={service.id} sx={{ bgcolor: (page * rowsPerPage + index) % 2 === 0 ? "#fff" : "#fafafa", "&:hover": { bgcolor: "#f6f9ff" }, "& td": { borderBottom: "1px solid #f5f5f5" } }}>
                      <TableCell sx={{ py: 1.5, fontSize: "12px", color: "#111827", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {service.name}
                      </TableCell>
                      <TableCell sx={{ py: 1.5 }}><StatusChip status={service.status} /></TableCell>
                      <TableCell sx={{ py: 1.5, minWidth: 0 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
                          <Tooltip title={service.endpoint} arrow placement="top">
                            <Typography sx={{ fontSize: "12px", color: "#475569", fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{service.endpoint}</Typography>
                          </Tooltip>
                          <Tooltip title="复制 Endpoint" arrow>
                            <IconButton size="small" onClick={() => navigator.clipboard.writeText(service.endpoint).then(() => toast.success("Endpoint 已复制"))}>
                              <ContentCopy sx={{ fontSize: 15 }} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ py: 1.5, fontSize: "12px", color: "#374151" }}>{service.tools.length}</TableCell>
                      <TableCell sx={{ py: 1.5, fontSize: "12px", color: "#374151" }}>{service.callsToday}</TableCell>
                      <TableCell sx={{ py: 1.5 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
                          <Switch
                            size="small"
                            checked={service.status === "运行中"}
                            onChange={(event) => {
                              if (event.target.checked) {
                                enableService(service);
                              } else {
                                setStopTarget(service);
                              }
                            }}
                            inputProps={{ "aria-label": `${service.name} 启用状态` }}
                          />
                          <Typography component="button" onClick={() => openDetail(service)} sx={{ border: "none", p: 0, bgcolor: "transparent", color: BLUE, fontSize: "12px", cursor: "pointer" }}>详情</Typography>
                          <Typography component="button" onClick={() => openEdit(service)} sx={{ border: "none", p: 0, bgcolor: "transparent", color: BLUE, fontSize: "12px", cursor: "pointer" }}>编辑</Typography>
                          {service.status !== "运行中" && (
                            <Typography component="button" onClick={() => setDeleteTarget(service)} sx={{ border: "none", p: 0, bgcolor: "transparent", color: "#ef4444", fontSize: "12px", cursor: "pointer" }}>删除</Typography>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={visibleServices.length}
              page={page}
              onPageChange={(_, nextPage) => setPage(nextPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(event) => { setRowsPerPage(Number(event.target.value)); setPage(0); }}
              rowsPerPageOptions={[20, 50, 100]}
              labelRowsPerPage="每页条数"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} / 共 ${count} 条`}
              sx={{ borderTop: "1px solid #eef2f7", "& .MuiTablePagination-toolbar": { minHeight: 48 }, "& p": { fontSize: "12px", color: "#64748b" } }}
            />
          </Box>
        )}
      </Paper>

      <Dialog open={Boolean(editingService) || serviceDraft !== emptyService} onClose={closeEditor} fullWidth maxWidth="md" PaperProps={{ sx: { borderRadius: "12px" } }}>
        <DialogTitle sx={{ fontSize: "16px", fontWeight: 700 }}>{editingService ? "编辑 MCP 服务" : "新建 MCP 服务"}</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: "12px !important" }}>
          <TextField label="服务名称" size="small" required value={serviceDraft.name} onChange={(event) => setServiceDraft((prev) => ({ ...prev, name: event.target.value }))} />
          <TextField
            label="服务描述"
            size="small"
            multiline
            rows={2}
            value={serviceDraft.description}
            onChange={(event) => setServiceDraft((prev) => ({ ...prev, description: event.target.value }))}
            helperText="给运营和研发查看的服务说明，用于识别这个 MCP 服务的用途和适用范围。"
          />
          <TextField
            label="服务指令"
            size="small"
            multiline
            rows={3}
            value={serviceDraft.instructions}
            onChange={(event) => setServiceDraft((prev) => ({ ...prev, instructions: event.target.value }))}
            helperText="发送给接入该 MCP 服务的 Agent，用于说明工具调用规则、业务约束和安全边界。"
          />
          <Paper sx={{ border: "1px solid #e5e7eb", borderRadius: "8px", boxShadow: "none", overflow: "hidden" }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, p: 1.5, borderBottom: "1px solid #eef2f7", flexWrap: "wrap" }}>
              <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#111827" }}>服务可用工具</Typography>
              <Box sx={{ display: "flex", gap: 1, alignItems: "center", justifyContent: "flex-end", flexWrap: "wrap" }}>
                <TextField size="small" placeholder="搜索工具名称 / 连接器" value={toolQuery} onChange={(event) => setToolQuery(event.target.value)} sx={{ width: 220 }} />
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <Select value={toolCategory} onChange={(event) => setToolCategory(event.target.value)} displayEmpty>
                    <MenuItem value="all">全部分类</MenuItem>
                    {categories.map((category) => <MenuItem key={category} value={category}>{category}</MenuItem>)}
                  </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 170 }}>
                  <Select value={toolConnector} onChange={(event) => setToolConnector(event.target.value)} displayEmpty>
                    <MenuItem value="all">全部连接器</MenuItem>
                    {connectors.map((connector) => <MenuItem key={connector} value={connector}>{connector}</MenuItem>)}
                  </Select>
                </FormControl>
              </Box>
            </Box>
            <TableContainer sx={{ maxHeight: 300 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    {["选择", "工具名称", "分类", "连接器", "状态"].map((head) => (
                      <TableCell key={head} sx={{ fontSize: "12px", fontWeight: 600, color: "#6b7280", bgcolor: "#f8f9fb" }}>{head}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {visibleTools.map((tool) => (
                    <TableRow key={tool.id}>
                      <TableCell><input type="checkbox" checked={serviceDraft.tools.includes(tool.name)} onChange={() => toggleTool(tool.name)} /></TableCell>
                      <TableCell sx={{ fontSize: "13px", fontWeight: 500 }}>{tool.name}</TableCell>
                      <TableCell sx={{ fontSize: "12px" }}>{tool.category}</TableCell>
                      <TableCell sx={{ fontSize: "12px" }}>{tool.connector}</TableCell>
                      <TableCell><StatusChip status={tool.status} type="tool" /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={closeEditor} sx={{ textTransform: "none", color: "#64748b" }}>取消</Button>
          <Button onClick={saveService} variant="contained" sx={{ bgcolor: BLUE, textTransform: "none", boxShadow: "none" }}>保存</Button>
        </DialogActions>
      </Dialog>

      <Drawer
        anchor="right"
        open={Boolean(detailService)}
        onClose={() => setDetailServiceId(null)}
        ModalProps={{ sx: { zIndex: DETAIL_DRAWER_Z_INDEX } }}
        slotProps={{ backdrop: { sx: { position: "fixed", inset: 0, zIndex: DETAIL_DRAWER_Z_INDEX, bgcolor: "rgba(17, 24, 39, 0.48)" } } }}
        PaperProps={{ sx: { width: 960, maxWidth: "92vw", p: 0, bgcolor: "#f8fafc", zIndex: DETAIL_DRAWER_Z_INDEX + 1 } }}
      >
        {detailService && (
          <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
            <Box sx={{ p: 2.5, bgcolor: "#fff", borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 2 }}>
              <Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.75 }}>
                  <Typography sx={{ fontSize: "18px", fontWeight: 700, color: "#111827" }}>{detailService.name}</Typography>
                  <StatusChip status={detailService.status} />
                </Box>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <IconButton size="small" onClick={() => setDetailServiceId(null)}>
                  <Close sx={{ fontSize: 18, color: "#94a3b8" }} />
                </IconButton>
              </Box>
            </Box>

            <Box sx={{ p: 2.5, overflow: "auto", display: "flex", flexDirection: "column", gap: 2 }}>
              <Tabs
                value={detailTab}
                onChange={(_, value) => setDetailTab(value)}
                sx={{
                  minHeight: 36,
                  borderBottom: "1px solid #e5e7eb",
                  "& .MuiTab-root": { minHeight: 36, px: 1.5, textTransform: "none", fontSize: "13px", color: "#64748b" },
                  "& .Mui-selected": { color: BLUE, fontWeight: 700 },
                  "& .MuiTabs-indicator": { bgcolor: BLUE },
                }}
              >
                <Tab value="basic" label="基本信息" />
                <Tab value="tools" label="已绑定工具" />
                <Tab value="apikey" label="API Key" />
              </Tabs>

            {detailTab === "basic" && (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Paper sx={{ p: 2, borderRadius: "8px", border: "1px solid #e5e7eb", boxShadow: "none", bgcolor: "#fff" }}>
                  <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#111827", mb: 1.25 }}>基本信息</Typography>
                  <Box sx={{ display: "grid", gridTemplateColumns: "120px minmax(0, 1fr)", rowGap: 0.9, columnGap: 1.5 }}>
                    {[
                      ["服务名称", detailService.name],
                      ["服务描述", detailService.description || "-"],
                      ["服务状态", detailService.status],
                      ["服务指令", detailService.instructions || "-"],
                    ].map(([label, value]) => (
                      <Box key={label} sx={{ display: "contents" }}>
                        <Typography sx={{ fontSize: "12px", color: "#64748b", lineHeight: 1.7 }}>{label}</Typography>
                        <Typography sx={{ fontSize: "12px", color: "#111827", lineHeight: 1.7, wordBreak: "break-all" }}>{value}</Typography>
                      </Box>
                    ))}
                  </Box>
                </Paper>

                <Paper sx={{ p: 2, borderRadius: "8px", border: "1px solid #e5e7eb", boxShadow: "none", bgcolor: "#fff" }}>
                  <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#111827", mb: 1.25 }}>MCP Endpoint</Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, p: 1.25, borderRadius: "8px", bgcolor: "#f8fafc", border: "1px solid #eef2f7" }}>
                    <Typography sx={{ flex: 1, fontSize: "12px", color: "#1e3a8a", fontFamily: "monospace", wordBreak: "break-all" }}>{detailService.endpoint}</Typography>
                    <Button size="small" startIcon={<ContentCopy sx={{ fontSize: 14 }} />} onClick={() => navigator.clipboard.writeText(detailService.endpoint).then(() => toast.success("Endpoint 已复制"))} sx={{ textTransform: "none", color: BLUE, flexShrink: 0 }}>
                      复制
                    </Button>
                  </Box>
                </Paper>

                <Paper sx={{ p: 2, borderRadius: "8px", border: "1px solid #e5e7eb", boxShadow: "none", bgcolor: "#fff" }}>
                  <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#111827", mb: 1.25 }}>接入配置示例</Typography>
                  <Box component="pre" sx={{ m: 0, p: 1.5, borderRadius: "8px", bgcolor: "#0f172a", color: "#e2e8f0", fontSize: "11px", lineHeight: 1.7, overflowX: "auto" }}>
{JSON.stringify({ transport: "http", url: detailService.endpoint, auth: "Bearer <API_KEY>" }, null, 2)}
                  </Box>
                </Paper>
              </Box>
            )}

            {detailTab === "tools" && (
              <Paper sx={{ borderRadius: "8px", border: "1px solid #e5e7eb", boxShadow: "none", bgcolor: "#fff", overflow: "hidden" }}>
                <Box sx={{ px: 2, py: 1.5, borderBottom: "1px solid #eef2f7" }}>
                  <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#111827" }}>已绑定工具</Typography>
                </Box>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: "#f8f9fb" }}>
                        {["工具名称", "分类", "连接器", "状态"].map((head) => (
                          <TableCell key={head} sx={detailTableHeadCellSx}>{head}</TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {detailTools.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} sx={{ py: 5, textAlign: "center", color: "#94a3b8", fontSize: "13px", borderBottom: "1px solid #f5f5f5" }}>暂无已绑定工具</TableCell>
                        </TableRow>
                      ) : detailTools.map((tool, index) => (
                        <TableRow key={tool.id} sx={detailTableRowSx(index)}>
                          <TableCell sx={{ ...detailTableTextCellSx, color: "#111827", fontWeight: 600 }}>{tool.name}</TableCell>
                          <TableCell sx={detailTableTextCellSx}>{tool.category}</TableCell>
                          <TableCell sx={detailTableTextCellSx}>{tool.connector}</TableCell>
                          <TableCell sx={{ py: 1.5 }}><StatusChip status={tool.status} type="tool" /></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            )}

            {detailTab === "apikey" && (
              <Paper sx={{ borderRadius: "8px", border: "1px solid #e5e7eb", boxShadow: "none", bgcolor: "#fff", overflow: "hidden" }}>
                <Box sx={{ px: 2, py: 1.5, borderBottom: "1px solid #eef2f7" }}>
                  <Box>
                    <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#111827" }}>API Key 管理</Typography>
                    <Typography sx={{ fontSize: "12px", color: "#64748b", mt: 0.25 }}>用于调用当前 MCP 服务的鉴权密钥。</Typography>
                  </Box>
                  <Box sx={{ display: "flex", gap: 1, mt: 1.5 }}>
                    <TextField size="small" label="名称" value={keyLabel} onChange={(event) => setKeyLabel(event.target.value)} placeholder="例如：知识工程 Agent 生产环境" sx={{ flex: 1 }} />
                    <Button onClick={generateApiKey} variant="contained" size="small" sx={{ bgcolor: BLUE, textTransform: "none", boxShadow: "none", flexShrink: 0 }}>生成新 Key</Button>
                  </Box>
                </Box>
                <Box sx={{ p: 2 }}>
                  {detailService.apiKeys.length === 0 ? (
                    <Box sx={{ py: 5, textAlign: "center", border: "1px dashed #cbd5e1", borderRadius: "8px", bgcolor: "#f8fafc" }}>
                      <Typography sx={{ fontSize: "13px", color: "#94a3b8" }}>暂无 API Key</Typography>
                    </Box>
                  ) : (
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ bgcolor: "#f8f9fb" }}>
                          {["名称", "API Key", "创建时间", "最后使用", "操作"].map((head) => (
                            <TableCell key={head} sx={detailTableHeadCellSx}>{head}</TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {detailService.apiKeys.map((apiKey, index) => (
                          <TableRow key={apiKey.id} sx={detailTableRowSx(index)}>
                            <TableCell sx={{ ...detailTableTextCellSx, color: "#111827", fontWeight: 600 }}>{apiKey.label}</TableCell>
                            <TableCell sx={{ ...detailTableTextCellSx, minWidth: 0 }}>
                              <Typography sx={{ fontSize: "12px", fontFamily: "monospace", color: "#374151", wordBreak: "break-all" }}>{apiKey.key}</Typography>
                            </TableCell>
                            <TableCell sx={detailTableTextCellSx}>{apiKey.createdAt}</TableCell>
                            <TableCell sx={detailTableTextCellSx}>{apiKey.lastUsedAt}</TableCell>
                            <TableCell sx={{ py: 1.5 }}>
                              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                                <Tooltip title="复制 API Key" arrow>
                                  <IconButton size="small" onClick={() => navigator.clipboard.writeText(apiKey.key).then(() => toast.success("API Key 已复制"))}>
                                    <ContentCopy sx={{ fontSize: 16, color: BLUE }} />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="删除 API Key" arrow>
                                  <IconButton size="small" onClick={() => setApiKeyDeleteTarget(apiKey)}>
                                    <Delete sx={{ fontSize: 16, color: "#ef4444" }} />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </Box>
              </Paper>
            )}
            </Box>
          </Box>
        )}
      </Drawer>

      <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: "12px" } }}>
        <DialogTitle sx={{ fontSize: "16px", fontWeight: 700 }}>确认删除 MCP 服务？</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ fontSize: "13px" }}>
            删除后会影响 Agent 通过该服务调用工具，确定继续？
          </Alert>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteTarget(null)} sx={{ textTransform: "none", color: "#64748b" }}>取消</Button>
          <Button onClick={confirmDelete} variant="contained" sx={{ bgcolor: "#ef4444", textTransform: "none", boxShadow: "none" }}>确认删除</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(stopTarget)} onClose={() => setStopTarget(null)} fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: "12px" } }}>
        <DialogTitle sx={{ fontSize: "16px", fontWeight: 700 }}>确认停用 MCP 服务？</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ fontSize: "13px" }}>
            停用后，Agent 将无法通过该 MCP 服务调用已绑定工具。确定停用？
          </Alert>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setStopTarget(null)} sx={{ textTransform: "none", color: "#64748b" }}>取消</Button>
          <Button onClick={confirmStopService} variant="contained" sx={{ bgcolor: "#ef4444", textTransform: "none", boxShadow: "none" }}>确认停用</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(apiKeyDeleteTarget)}
        onClose={() => setApiKeyDeleteTarget(null)}
        fullWidth
        maxWidth="sm"
        slotProps={{ backdrop: { sx: { zIndex: DETAIL_DIALOG_Z_INDEX, bgcolor: "rgba(17, 24, 39, 0.48)" } } }}
        PaperProps={{ sx: { borderRadius: "12px", zIndex: DETAIL_DIALOG_Z_INDEX + 1 } }}
        sx={{ zIndex: DETAIL_DIALOG_Z_INDEX }}
      >
        <DialogTitle sx={{ fontSize: "16px", fontWeight: 700 }}>删除 API key</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ fontSize: "13px", lineHeight: 1.8 }}>
            该 API key 将立即被禁用。使用此密钥发出的 API 请求将被拒绝，这可能会导致仍然依赖它的任何系统崩溃。 一旦删除，你将无法再查看或修改此 API key。
          </Alert>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setApiKeyDeleteTarget(null)} sx={{ textTransform: "none", color: "#64748b" }}>取消</Button>
          <Button onClick={deleteApiKey} variant="contained" sx={{ bgcolor: "#ef4444", textTransform: "none", boxShadow: "none" }}>删除</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(createdApiKey)}
        onClose={() => setCreatedApiKey(null)}
        fullWidth
        maxWidth="sm"
        slotProps={{ backdrop: { sx: { zIndex: DETAIL_DIALOG_Z_INDEX, bgcolor: "rgba(17, 24, 39, 0.48)" } } }}
        PaperProps={{ sx: { borderRadius: "12px", zIndex: DETAIL_DIALOG_Z_INDEX + 1 } }}
        sx={{ zIndex: DETAIL_DIALOG_Z_INDEX }}
      >
        <DialogTitle sx={{ fontSize: "16px", fontWeight: 700 }}>API Key 已生成</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          <Alert severity="info" sx={{ fontSize: "13px" }}>
            请立即复制并保存。关闭后仍可在列表中复制当前原型生成的 API Key。
          </Alert>
          <Box sx={{ p: 1.5, borderRadius: "8px", bgcolor: "#f8fafc", border: "1px solid #eef2f7", display: "flex", gap: 1, alignItems: "center" }}>
            <Typography sx={{ flex: 1, minWidth: 0, fontSize: "12px", color: "#111827", fontFamily: "monospace", wordBreak: "break-all" }}>{createdApiKey?.key}</Typography>
            <Button
              size="small"
              startIcon={<ContentCopy sx={{ fontSize: 14 }} />}
              onClick={() => createdApiKey && navigator.clipboard.writeText(createdApiKey.key).then(() => toast.success("API Key 已复制"))}
              sx={{ textTransform: "none", color: BLUE, flexShrink: 0 }}
            >
              复制
            </Button>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setCreatedApiKey(null)} variant="contained" sx={{ bgcolor: BLUE, textTransform: "none", boxShadow: "none" }}>完成</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

const emptyConnector: Omit<Connector, "id" | "status" | "toolCount" | "lastChecked" | "endpoints"> = {
  name: "",
  type: "OpenAPI",
  baseUrl: "",
  specUrl: "",
  healthPath: "/health",
  method: "POST",
  requestPath: "/custom/action",
  auth: "Bearer Token",
};

export function ToolHubConnectorsPage() {
  const [connectors, setConnectors] = useState<Connector[]>(initialConnectors);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editingConnector, setEditingConnector] = useState<Connector | null>(null);
  const [connectorDraft, setConnectorDraft] = useState(emptyConnector);
  const [deleteTarget, setDeleteTarget] = useState<Connector | null>(null);
  const [detailConnectorId, setDetailConnectorId] = useState<string | null>(null);
  const [autoCheckEnabled, setAutoCheckEnabled] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  const visibleConnectors = useMemo(() => (
    connectors.filter((connector) => {
      if (query && !connector.name.toLowerCase().includes(query.toLowerCase())) return false;
      if (typeFilter !== "all" && connector.type !== typeFilter) return false;
      if (statusFilter !== "all" && connector.status !== statusFilter) return false;
      return true;
    })
  ), [connectors, query, statusFilter, typeFilter]);

  const pagedConnectors = useMemo(() => (
    visibleConnectors.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
  ), [visibleConnectors, page, rowsPerPage]);

  const detailConnector = useMemo(() => (
    connectors.find((connector) => connector.id === detailConnectorId) ?? null
  ), [connectors, detailConnectorId]);

  const detailConnectorTools = useMemo(() => (
    detailConnector ? initialTools.filter((tool) => tool.connector === detailConnector.name) : []
  ), [detailConnector]);

  const openCreate = () => {
    setEditingConnector(null);
    setConnectorDraft({ ...emptyConnector });
  };

  const openEdit = (connector: Connector) => {
    setEditingConnector(connector);
    setConnectorDraft({
      name: connector.name,
      type: connector.type,
      baseUrl: connector.baseUrl,
      specUrl: connector.specUrl,
      healthPath: connector.healthPath,
      method: connector.method,
      requestPath: connector.requestPath,
      auth: connector.auth,
    });
  };

  const closeEditor = () => {
    setEditingConnector(null);
    setConnectorDraft(emptyConnector);
  };

  const testConnector = (connector?: Connector) => {
    if (!connector) {
      toast.success("测试连接成功，保存后记录检测结果");
      return;
    }
    const nextStatus: ConnectorStatus = connector.id === "conn-check" ? "异常" : "正常";
    setConnectors((prev) => prev.map((item) => (
      item.id === connector.id ? { ...item, status: nextStatus, lastChecked: "刚刚", errorMessage: nextStatus === "异常" ? "健康检查接口返回异常，请检查 Base URL、鉴权配置或服务状态。" : undefined } : item
    )));
    if (nextStatus === "异常") {
      toast.error("连接检测失败：健康检查接口返回异常");
    } else {
      toast.success("测试连接成功");
    }
  };

  const saveConnector = () => {
    const name = connectorDraft.name.trim();
    if (!name) {
      toast.error("请填写连接器名称");
      return;
    }
    const next: Connector = {
      id: editingConnector?.id ?? `conn-${Date.now()}`,
      ...connectorDraft,
      name,
      status: editingConnector?.status ?? "未检测",
      toolCount: editingConnector?.toolCount ?? 0,
      lastChecked: editingConnector?.lastChecked ?? "未检测",
      createdBy: editingConnector?.createdBy ?? "当前用户",
      createdAt: editingConnector?.createdAt ?? "2026-05-18 21:40",
      updatedAt: editingConnector ? "2026-05-18 21:40" : "2026-05-18 21:40",
      errorMessage: editingConnector?.errorMessage,
      endpoints: connectorDraft.type === "OpenAPI" ? ["GET /projects/{id}", "POST /solutions/generate", "GET /templates"] : [],
    };
    if (editingConnector) {
      setConnectors((prev) => prev.map((connector) => (connector.id === editingConnector.id ? next : connector)));
      toast.success("连接器已更新");
    } else {
      setConnectors((prev) => [next, ...prev]);
      toast.success("连接器已保存");
    }
    closeEditor();
  };

  const checkAll = () => {
    setConnectors((prev) => prev.map((connector, index) => ({
      ...connector,
      status: index === prev.length - 1 ? "异常" : "正常",
      lastChecked: "刚刚",
      errorMessage: index === prev.length - 1 ? "批量检测失败：健康检查接口返回异常，请稍后重试。" : undefined,
    })));
    toast.success("已完成全部连接器检查");
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    setConnectors((prev) => prev.filter((connector) => connector.id !== deleteTarget.id));
    setDeleteTarget(null);
    toast.success("连接器已删除");
  };

  const renderTypeFields = () => {
    if (connectorDraft.type === "OpenAPI") {
      return (
        <>
          <TextField label="Base URL" size="small" value={connectorDraft.baseUrl} onChange={(event) => setConnectorDraft((prev) => ({ ...prev, baseUrl: event.target.value }))} />
          <TextField label="OpenAPI Spec URL" size="small" value={connectorDraft.specUrl} onChange={(event) => setConnectorDraft((prev) => ({ ...prev, specUrl: event.target.value }))} />
        </>
      );
    }
    if (connectorDraft.type === "REST API") {
      return (
        <>
          <TextField label="Base URL" size="small" value={connectorDraft.baseUrl} onChange={(event) => setConnectorDraft((prev) => ({ ...prev, baseUrl: event.target.value }))} />
          <TextField label="Health Check Path" size="small" value={connectorDraft.healthPath} onChange={(event) => setConnectorDraft((prev) => ({ ...prev, healthPath: event.target.value }))} />
        </>
      );
    }
    return (
      <>
        <TextField label="Base URL" size="small" value={connectorDraft.baseUrl} onChange={(event) => setConnectorDraft((prev) => ({ ...prev, baseUrl: event.target.value }))} />
        <TextField select label="请求方法" size="small" value={connectorDraft.method} onChange={(event) => setConnectorDraft((prev) => ({ ...prev, method: event.target.value }))}>
          {["GET", "POST", "PUT", "DELETE"].map((method) => <MenuItem key={method} value={method}>{method}</MenuItem>)}
        </TextField>
        <TextField label="请求路径" size="small" value={connectorDraft.requestPath} onChange={(event) => setConnectorDraft((prev) => ({ ...prev, requestPath: event.target.value }))} />
        <TextField label="Health Check Path" size="small" value={connectorDraft.healthPath} onChange={(event) => setConnectorDraft((prev) => ({ ...prev, healthPath: event.target.value }))} />
      </>
    );
  };

  const renderAuthFields = () => {
    if (connectorDraft.auth === "Bearer Token") return <TextField label="Token" size="small" fullWidth value="••••••••••••••••" />;
    if (connectorDraft.auth === "API Key") {
      return (
        <>
          <TextField label="Header 名称" size="small" defaultValue="X-API-Key" />
          <TextField label="API Key" size="small" value="••••••••••••••••" />
        </>
      );
    }
    if (connectorDraft.auth === "Basic Auth") {
      return (
        <>
          <TextField label="用户名" size="small" defaultValue="toolhub" />
          <TextField label="密码" size="small" value="••••••••••••" />
        </>
      );
    }
    return null;
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0, maxWidth: "100%" }}>
      <Box>
        <Typography variant="h4" sx={{ fontSize: "22px", fontWeight: 700, color: "#111827" }}>
          连接器
        </Typography>
      </Box>

      <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end" }}>
          <FormControl size="small" sx={{ minWidth: 130 }}>
            <Select value={typeFilter} onChange={(event) => { setTypeFilter(event.target.value); setPage(0); }} displayEmpty sx={{ borderRadius: "8px", bgcolor: "#fff", fontSize: "13px" }}>
              <MenuItem value="all">全部类型</MenuItem>
              {["OpenAPI", "REST API", "自定义 HTTP"].map((type) => <MenuItem key={type} value={type}>{type}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <Select value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value); setPage(0); }} displayEmpty sx={{ borderRadius: "8px", bgcolor: "#fff", fontSize: "13px" }}>
              <MenuItem value="all">全部状态</MenuItem>
              {["正常", "异常", "未检测"].map((status) => <MenuItem key={status} value={status}>{status}</MenuItem>)}
            </Select>
          </FormControl>
          <TextField
            size="small"
            placeholder="搜索连接器名称"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(0);
            }}
            InputProps={{ startAdornment: <InputAdornment position="start"><Search sx={{ fontSize: 18, color: "#9ca3af" }} /></InputAdornment> }}
            sx={{ width: 300, "& .MuiOutlinedInput-root": { borderRadius: "8px", bgcolor: "#fff", fontSize: "13px" }, "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e8eaed" } }}
          />
        </Box>
        <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, px: 1, height: 32, border: "1px solid #dbe2ea", borderRadius: "6px", bgcolor: "#fff" }}>
            <Typography sx={{ fontSize: "12px", color: "#374151" }}>自动检测</Typography>
            <Switch
              size="small"
              checked={autoCheckEnabled}
              onChange={(event) => {
                setAutoCheckEnabled(event.target.checked);
                toast.success(`自动检测已${event.target.checked ? "开启" : "关闭"}`);
              }}
              inputProps={{ "aria-label": "自动检测" }}
            />
            <Typography sx={{ fontSize: "12px", color: "#64748b" }}>{autoCheckEnabled ? "5分钟" : "关闭"}</Typography>
          </Box>
          <Button variant="outlined" startIcon={<Refresh sx={{ fontSize: 16 }} />} onClick={checkAll} sx={{ textTransform: "none", borderRadius: "6px", borderColor: "#dbe2ea", color: "#374151" }}>
            检查全部连接器
          </Button>
          <Button variant="contained" startIcon={<Add sx={{ fontSize: 16 }} />} onClick={openCreate} sx={{ bgcolor: BLUE, textTransform: "none", borderRadius: "6px", boxShadow: "none" }}>
            新建连接器
          </Button>
        </Box>
      </Box>

      <Paper sx={{ border: "1px solid #e8eaed", borderRadius: "10px", boxShadow: "none", overflow: "hidden", width: "100%", maxWidth: "100%" }}>
        {visibleConnectors.length === 0 ? (
          <Box sx={{ py: 10, textAlign: "center" }}>
            <Typography sx={{ fontSize: "14px", color: "#9ca3af" }}>当前筛选条件下暂无连接器</Typography>
          </Box>
        ) : (
          <Box>
            <TableContainer sx={{ width: "100%", maxWidth: "100%", overflowX: "auto", overflowY: "hidden", display: "block", WebkitOverflowScrolling: "touch", "&::-webkit-scrollbar": { height: 12 }, "&::-webkit-scrollbar-track": { bgcolor: "#f1f5f9" }, "&::-webkit-scrollbar-thumb": { bgcolor: "#cbd5e1", borderRadius: 999, border: "3px solid #f1f5f9" }, "&::-webkit-scrollbar-thumb:hover": { bgcolor: "#94a3b8" } }}>
              <Table size="small" stickyHeader sx={{ minWidth: 1220, tableLayout: "fixed" }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: "#f8f9fb" }}>
                    {[
                      ["连接器名称", "260px"],
                      ["类型", "140px"],
                      ["状态", "120px"],
                      ["关联工具", "120px"],
                      ["最近检测", "180px"],
                      ["创建人", "120px"],
                      ["创建时间", "150px"],
                      ["操作", "200px"],
                    ].map(([head, width]) => (
                      <TableCell key={head} sx={{ width, fontSize: "12px", fontWeight: 600, color: "#6b7280", py: 1.5, bgcolor: "#f8f9fb", borderBottom: "1px solid #f0f0f0", whiteSpace: "nowrap" }}>{head}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pagedConnectors.map((connector, index) => (
                    <TableRow key={connector.id} sx={{ bgcolor: (page * rowsPerPage + index) % 2 === 0 ? "#fff" : "#fafafa", "&:hover": { bgcolor: "#f6f9ff" }, "& td": { borderBottom: "1px solid #f5f5f5" } }}>
                      <TableCell sx={{ py: 1.5, minWidth: 0 }}>
                        <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{connector.name}</Typography>
                      </TableCell>
                      <TableCell sx={{ py: 1.5, fontSize: "12px", color: "#374151" }}>{connector.type}</TableCell>
                      <Tooltip title={connector.status === "异常" ? connector.errorMessage || "连接检测异常，请检查连接配置。" : ""} arrow disableHoverListener={connector.status !== "异常"} placement="top">
                        <TableCell sx={{ py: 1.5 }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                            <StatusChip status={connector.status} type="connector" />
                            {connector.status === "异常" && <ErrorOutline sx={{ fontSize: 14, color: "#ef4444", cursor: "help" }} />}
                          </Box>
                        </TableCell>
                      </Tooltip>
                      <TableCell sx={{ py: 1.5, fontSize: "12px", color: "#374151" }}>{connector.toolCount}</TableCell>
                      <TableCell sx={{ py: 1.5 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                          <Typography sx={{ fontSize: "12px", color: "#64748b", whiteSpace: "nowrap" }}>{connector.lastChecked}</Typography>
                          <Tooltip title="测试连接" arrow>
                            <IconButton size="small" onClick={() => testConnector(connector)}>
                              <Refresh sx={{ fontSize: 16, color: BLUE }} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ py: 1.5, fontSize: "12px", color: "#374151", whiteSpace: "nowrap" }}>{connector.createdBy}</TableCell>
                      <TableCell sx={{ py: 1.5, fontSize: "12px", color: "#64748b", whiteSpace: "nowrap" }}>{connector.createdAt}</TableCell>
                      <TableCell sx={{ py: 1.5 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
                          <Typography component="button" onClick={() => setDetailConnectorId(connector.id)} sx={{ border: "none", p: 0, bgcolor: "transparent", color: BLUE, fontSize: "12px", cursor: "pointer" }}>详情</Typography>
                          <Typography component="button" onClick={() => openEdit(connector)} sx={{ border: "none", p: 0, bgcolor: "transparent", color: BLUE, fontSize: "12px", cursor: "pointer" }}>编辑</Typography>
                          <Typography component="button" onClick={() => setDeleteTarget(connector)} sx={{ border: "none", p: 0, bgcolor: "transparent", color: "#ef4444", fontSize: "12px", cursor: "pointer" }}>删除</Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={visibleConnectors.length}
              page={page}
              onPageChange={(_, nextPage) => setPage(nextPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(event) => { setRowsPerPage(Number(event.target.value)); setPage(0); }}
              rowsPerPageOptions={[20, 50, 100]}
              labelRowsPerPage="每页条数"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} / 共 ${count} 条`}
              sx={{ borderTop: "1px solid #eef2f7", "& .MuiTablePagination-toolbar": { minHeight: 48 }, "& p": { fontSize: "12px", color: "#64748b" } }}
            />
          </Box>
        )}
      </Paper>

      <Dialog open={Boolean(editingConnector) || connectorDraft !== emptyConnector} onClose={closeEditor} fullWidth maxWidth="md" PaperProps={{ sx: { borderRadius: "12px" } }}>
        <DialogTitle sx={{ fontSize: "16px", fontWeight: 700 }}>{editingConnector ? "编辑连接器" : "新建连接器"}</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: "12px !important" }}>
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
            <TextField label="连接器名称" size="small" required value={connectorDraft.name} onChange={(event) => setConnectorDraft((prev) => ({ ...prev, name: event.target.value }))} />
            <TextField select label="连接器类型" size="small" value={connectorDraft.type} onChange={(event) => setConnectorDraft((prev) => ({ ...prev, type: event.target.value as ConnectorType }))}>
              {["OpenAPI", "REST API", "自定义 HTTP"].map((type) => <MenuItem key={type} value={type}>{type}</MenuItem>)}
            </TextField>
            {renderTypeFields()}
            <TextField select label="Authentication" size="small" value={connectorDraft.auth} onChange={(event) => setConnectorDraft((prev) => ({ ...prev, auth: event.target.value as AuthType }))}>
              {["Bearer Token", "API Key", "Basic Auth", "None"].map((auth) => <MenuItem key={auth} value={auth}>{auth}</MenuItem>)}
            </TextField>
            {renderAuthFields()}
          </Box>
          {connectorDraft.type === "OpenAPI" && (
            <Paper sx={{ border: "1px solid #e5e7eb", borderRadius: "8px", boxShadow: "none", overflow: "hidden" }}>
              <Box sx={{ p: 1.5, borderBottom: "1px solid #eef2f7" }}>
                <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#374151" }}>接口清单</Typography>
              </Box>
              {(editingConnector?.endpoints.length ? editingConnector.endpoints : ["OpenAPI，保存或测试连接后自动获取接口清单"]).map((endpoint) => (
                <Box key={endpoint} sx={{ px: 1.5, py: 1, borderBottom: "1px solid #f3f4f6" }}>
                  <Typography sx={{ fontSize: "12px", color: "#475569", fontFamily: endpoint.includes("/") ? "monospace" : "inherit" }}>{endpoint}</Typography>
                </Box>
              ))}
            </Paper>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => testConnector(editingConnector ?? undefined)} variant="outlined" sx={{ textTransform: "none", borderRadius: "6px", color: "#374151", borderColor: "#dbe2ea" }}>测试连接</Button>
          <Box sx={{ flex: 1 }} />
          <Button onClick={closeEditor} sx={{ textTransform: "none", color: "#64748b" }}>取消</Button>
          <Button onClick={saveConnector} variant="contained" sx={{ bgcolor: BLUE, textTransform: "none", boxShadow: "none" }}>保存</Button>
        </DialogActions>
      </Dialog>

      <Drawer
        anchor="right"
        open={Boolean(detailConnector)}
        onClose={() => setDetailConnectorId(null)}
        ModalProps={{ sx: { zIndex: DETAIL_DRAWER_Z_INDEX } }}
        slotProps={{ backdrop: { sx: { position: "fixed", inset: 0, zIndex: DETAIL_DRAWER_Z_INDEX, bgcolor: "rgba(17, 24, 39, 0.48)" } } }}
        PaperProps={{ sx: { width: 960, maxWidth: "92vw", p: 0, bgcolor: "#f8fafc", zIndex: DETAIL_DRAWER_Z_INDEX + 1 } }}
      >
        {detailConnector && (
          <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
            <Box sx={{ p: 2.5, bgcolor: "#fff", borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 2 }}>
              <Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.75 }}>
                  <Typography sx={{ fontSize: "18px", fontWeight: 700, color: "#111827" }}>{detailConnector.name}</Typography>
                  <StatusChip status={detailConnector.status} type="connector" />
                </Box>
              </Box>
              <IconButton size="small" onClick={() => setDetailConnectorId(null)}>
                <Close sx={{ fontSize: 18, color: "#94a3b8" }} />
              </IconButton>
            </Box>

            <Box sx={{ p: 2.5, overflow: "auto", display: "flex", flexDirection: "column", gap: 2 }}>
            <Paper sx={{ p: 2, borderRadius: "8px", border: "1px solid #e5e7eb", boxShadow: "none", bgcolor: "#fff" }}>
              <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#111827", mb: 1.25 }}>基本信息</Typography>
              <Box sx={{ display: "grid", gridTemplateColumns: "120px minmax(0, 1fr)", rowGap: 0.9, columnGap: 1.5 }}>
                {[
                  ["连接器名称", detailConnector.name],
                  ["连接器类型", detailConnector.type],
                  ["连接状态", detailConnector.status],
                  ["最近检测", detailConnector.lastChecked],
                  ["创建人", detailConnector.createdBy],
                  ["创建时间", detailConnector.createdAt],
                  ["最近编辑时间", detailConnector.updatedAt],
                ].map(([label, value]) => (
                  <Box key={label} sx={{ display: "contents" }}>
                    <Typography sx={{ fontSize: "12px", color: "#64748b", lineHeight: 1.7 }}>{label}</Typography>
                    <Typography sx={{ fontSize: "12px", color: "#111827", lineHeight: 1.7, wordBreak: "break-all" }}>{value}</Typography>
                  </Box>
                ))}
              </Box>
            </Paper>

            <Paper sx={{ p: 2, borderRadius: "8px", border: "1px solid #e5e7eb", boxShadow: "none", bgcolor: "#fff" }}>
              <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#111827", mb: 1.25 }}>连接配置</Typography>
              <Box sx={{ display: "grid", gridTemplateColumns: "120px minmax(0, 1fr)", rowGap: 0.9, columnGap: 1.5 }}>
                {[
                  ["Base URL", detailConnector.baseUrl || "-"],
                  ["OpenAPI Spec URL", detailConnector.type === "OpenAPI" ? detailConnector.specUrl || "-" : "-"],
                  ["Health Check Path", detailConnector.healthPath || "-"],
                  ["请求方法", detailConnector.type === "自定义 HTTP" ? detailConnector.method : "-"],
                  ["请求路径", detailConnector.type === "自定义 HTTP" ? detailConnector.requestPath || "-" : "-"],
                ].map(([label, value]) => (
                  <Box key={label} sx={{ display: "contents" }}>
                    <Typography sx={{ fontSize: "12px", color: "#64748b", lineHeight: 1.7 }}>{label}</Typography>
                    <Typography sx={{ fontSize: "12px", color: "#111827", lineHeight: 1.7, wordBreak: "break-all", fontFamily: label.includes("URL") || label.includes("Path") || label.includes("路径") ? "monospace" : "inherit" }}>{value}</Typography>
                  </Box>
                ))}
              </Box>
            </Paper>

            <Paper sx={{ p: 2, borderRadius: "8px", border: "1px solid #e5e7eb", boxShadow: "none", bgcolor: "#fff" }}>
              <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#111827", mb: 1.25 }}>鉴权方式</Typography>
              <Box sx={{ display: "grid", gridTemplateColumns: "120px minmax(0, 1fr)", rowGap: 0.9, columnGap: 1.5 }}>
                {[
                  ["Authentication", detailConnector.auth],
                  ["鉴权配置", detailConnector.auth === "None" ? "无需鉴权" : "已配置，敏感信息已脱敏"],
                ].map(([label, value]) => (
                  <Box key={label} sx={{ display: "contents" }}>
                    <Typography sx={{ fontSize: "12px", color: "#64748b", lineHeight: 1.7 }}>{label}</Typography>
                    <Typography sx={{ fontSize: "12px", color: "#111827", lineHeight: 1.7 }}>{value}</Typography>
                  </Box>
                ))}
              </Box>
            </Paper>

            <Paper sx={{ borderRadius: "8px", border: "1px solid #e5e7eb", boxShadow: "none", bgcolor: "#fff", overflow: "hidden" }}>
              <Box sx={{ px: 2, py: 1.5, borderBottom: "1px solid #eef2f7" }}>
                <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#111827" }}>已关联工具</Typography>
              </Box>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: "#f8f9fb" }}>
                      {["工具名称", "分类", "状态"].map((head) => (
                        <TableCell key={head} sx={detailTableHeadCellSx}>{head}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {detailConnectorTools.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} sx={{ py: 5, textAlign: "center", color: "#94a3b8", fontSize: "13px", borderBottom: "1px solid #f5f5f5" }}>暂无已关联工具</TableCell>
                      </TableRow>
                    ) : detailConnectorTools.map((tool, index) => (
                      <TableRow key={tool.id} sx={detailTableRowSx(index)}>
                        <TableCell sx={{ ...detailTableTextCellSx, color: "#111827", fontWeight: 600 }}>{tool.name}</TableCell>
                        <TableCell sx={detailTableTextCellSx}>{tool.category}</TableCell>
                        <TableCell sx={{ py: 1.5 }}><StatusChip status={tool.status} type="tool" /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
            </Box>
          </Box>
        )}
      </Drawer>

      <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: "12px" } }}>
        <DialogTitle sx={{ fontSize: "16px", fontWeight: 700 }}>确认删除连接器？</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ fontSize: "13px", lineHeight: 1.8 }}>
            当前连接器已关联 {deleteTarget?.toolCount ?? 0} 个工具。删除后，这些工具将无法继续通过该连接器调用外部 API，可能影响 Agent 执行结果。确定继续？
          </Alert>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteTarget(null)} sx={{ textTransform: "none", color: "#64748b" }}>取消</Button>
          <Button onClick={confirmDelete} variant="contained" sx={{ bgcolor: "#ef4444", textTransform: "none", boxShadow: "none" }}>确认删除</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
