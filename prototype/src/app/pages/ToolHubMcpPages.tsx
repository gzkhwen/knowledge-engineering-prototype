import { useMemo, useState } from "react";
import type { ReactNode } from "react";
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
  Edit,
  Refresh,
  Search,
  Science,
} from "@mui/icons-material";
import { toast } from "sonner";

const BLUE = "#3b82f6";

type ServiceStatus = "运行中" | "停用" | "异常";
type ConnectorStatus = "正常" | "异常" | "未检测";
type ConnectorType = "OpenAPI" | "REST API" | "自定义 HTTP";
type AuthType = "Bearer Token" | "API Key" | "Basic Auth" | "None";

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
  apiKeys: string[];
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
  owner: string;
  toolCount: number;
  lastChecked: string;
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
    apiKeys: ["th_live_1_****************", "th_live_2_****************"],
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
    apiKeys: ["th_test_1_****************"],
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
    owner: "平台研发",
    toolCount: 5,
    lastChecked: "2026-05-18 10:35",
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
    owner: "知识工程",
    toolCount: 3,
    lastChecked: "2026-05-18 10:22",
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
    owner: "算法平台",
    toolCount: 2,
    lastChecked: "2026-05-18 09:58",
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

function PageCard({ children }: { children: ReactNode }) {
  return (
    <Paper sx={{ border: "1px solid #e8eaed", borderRadius: "10px", boxShadow: "none", overflow: "hidden", bgcolor: "#fff" }}>
      {children}
    </Paper>
  );
}

function ToolbarRow({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Box sx={{ px: 2, py: 1.75, borderBottom: "1px solid #eef2f7", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
      <Typography sx={{ fontSize: "14px", fontWeight: 600, color: "#111827" }}>{title}</Typography>
      <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end" }}>{children}</Box>
    </Box>
  );
}

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
  const [detailServiceId, setDetailServiceId] = useState<string | null>(null);
  const [detailTab, setDetailTab] = useState<"basic" | "apikey">("basic");
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
      authTarget: service.authTarget,
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
    const nextKey = `th_${detailService.status === "运行中" ? "live" : "test"}_${Date.now().toString().slice(-6)}_****************`;
    setServices((prev) => prev.map((service) => (
      service.id === detailService.id ? { ...service, apiKeys: [nextKey, ...service.apiKeys] } : service
    )));
    toast.success("已生成新的 API Key");
  };

  const disableApiKey = (key: string) => {
    if (!detailService) return;
    setServices((prev) => prev.map((service) => (
      service.id === detailService.id ? { ...service, apiKeys: service.apiKeys.filter((item) => item !== key) } : service
    )));
    toast.success("API Key 已停用");
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

      <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", alignItems: "center" }}>
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
              <Table size="small" stickyHeader sx={{ minWidth: 1080, tableLayout: "fixed" }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: "#f8f9fb" }}>
                    {[
                      ["名称", "220px"],
                      ["状态", "120px"],
                      ["Endpoint", "420px"],
                      ["工具数", "100px"],
                      ["今日调用", "110px"],
                      ["操作", "160px"],
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
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
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
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
            <TextField label="服务名称" size="small" required value={serviceDraft.name} onChange={(event) => setServiceDraft((prev) => ({ ...prev, name: event.target.value }))} />
            <TextField label="授权对象" size="small" value={serviceDraft.authTarget} onChange={(event) => setServiceDraft((prev) => ({ ...prev, authTarget: event.target.value }))} />
          </Box>
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
        PaperProps={{ sx: { width: 720, p: 3, bgcolor: "#f8fafc" } }}
      >
        {detailService && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 2 }}>
              <Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.75 }}>
                  <Typography sx={{ fontSize: "18px", fontWeight: 700, color: "#111827" }}>{detailService.name}</Typography>
                  <StatusChip status={detailService.status} />
                </Box>
                <Typography sx={{ fontSize: "12px", color: "#64748b" }}>{detailService.description || "暂无服务描述"}</Typography>
              </Box>
              <IconButton size="small" onClick={() => setDetailServiceId(null)}>
                <Close sx={{ fontSize: 18, color: "#94a3b8" }} />
              </IconButton>
            </Box>

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
              <Tab value="apikey" label="API Key" />
            </Tabs>

            {detailTab === "basic" && (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Paper sx={{ p: 2, borderRadius: "8px", border: "1px solid #e5e7eb", boxShadow: "none", bgcolor: "#fff" }}>
                  <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#111827", mb: 1.25 }}>服务信息</Typography>
                  <Box sx={{ display: "grid", gridTemplateColumns: "120px minmax(0, 1fr)", rowGap: 0.9, columnGap: 1.5 }}>
                    {[
                      ["服务名称", detailService.name],
                      ["服务描述", detailService.description || "-"],
                      ["服务状态", detailService.status],
                      ["授权对象", detailService.authTarget],
                      ["Endpoint", detailService.endpoint],
                      ["今日调用", `${detailService.callsToday}`],
                      ["工具数量", `${detailService.tools.length}`],
                    ].map(([label, value]) => (
                      <Box key={label} sx={{ display: "contents" }}>
                        <Typography sx={{ fontSize: "12px", color: "#64748b", lineHeight: 1.7 }}>{label}</Typography>
                        <Typography sx={{ fontSize: "12px", color: "#111827", lineHeight: 1.7, wordBreak: "break-all" }}>{value}</Typography>
                      </Box>
                    ))}
                  </Box>
                </Paper>

                <Paper sx={{ p: 2, borderRadius: "8px", border: "1px solid #e5e7eb", boxShadow: "none", bgcolor: "#fff" }}>
                  <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#111827", mb: 1.25 }}>Instructions</Typography>
                  <Typography sx={{ fontSize: "12px", color: "#374151", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{detailService.instructions || "-"}</Typography>
                </Paper>

                <Paper sx={{ p: 2, borderRadius: "8px", border: "1px solid #e5e7eb", boxShadow: "none", bgcolor: "#fff" }}>
                  <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#111827", mb: 1.25 }}>已分配工具</Typography>
                  <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap" }}>
                    {detailService.tools.length ? detailService.tools.map((tool) => (
                      <Chip key={tool} label={tool} size="small" sx={{ height: 24, fontSize: "12px", bgcolor: "#eff6ff", color: "#1d4ed8" }} />
                    )) : (
                      <Typography sx={{ fontSize: "12px", color: "#94a3b8" }}>暂无已分配工具</Typography>
                    )}
                  </Box>
                </Paper>
              </Box>
            )}

            {detailTab === "apikey" && (
              <Paper sx={{ borderRadius: "8px", border: "1px solid #e5e7eb", boxShadow: "none", bgcolor: "#fff", overflow: "hidden" }}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 2, py: 1.5, borderBottom: "1px solid #eef2f7" }}>
                  <Box>
                    <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#111827" }}>API Key 管理</Typography>
                    <Typography sx={{ fontSize: "12px", color: "#64748b", mt: 0.25 }}>用于调用当前 MCP 服务的鉴权密钥。</Typography>
                  </Box>
                  <Button onClick={generateApiKey} variant="contained" size="small" sx={{ bgcolor: BLUE, textTransform: "none", boxShadow: "none" }}>生成新 Key</Button>
                </Box>
                <Box sx={{ p: 2 }}>
                  {detailService.apiKeys.length === 0 ? (
                    <Box sx={{ py: 5, textAlign: "center", border: "1px dashed #cbd5e1", borderRadius: "8px", bgcolor: "#f8fafc" }}>
                      <Typography sx={{ fontSize: "13px", color: "#94a3b8" }}>暂无 API Key</Typography>
                    </Box>
                  ) : detailService.apiKeys.map((key) => (
                    <Box key={key} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, border: "1px solid #eef2f7", borderRadius: "8px", p: 1.5, mb: 1 }}>
                      <Typography sx={{ fontSize: "13px", fontFamily: "monospace", color: "#374151", wordBreak: "break-all" }}>{key}</Typography>
                      <Button size="small" onClick={() => disableApiKey(key)} sx={{ textTransform: "none", color: "#ef4444", flexShrink: 0 }}>停用</Button>
                    </Box>
                  ))}
                </Box>
              </Paper>
            )}
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
  owner: "",
};

export function ToolHubConnectorsPage() {
  const [connectors, setConnectors] = useState<Connector[]>(initialConnectors);
  const [query, setQuery] = useState("");
  const [editingConnector, setEditingConnector] = useState<Connector | null>(null);
  const [connectorDraft, setConnectorDraft] = useState(emptyConnector);
  const [deleteTarget, setDeleteTarget] = useState<Connector | null>(null);

  const visibleConnectors = useMemo(() => (
    connectors.filter((connector) => `${connector.name}${connector.type}${connector.status}`.toLowerCase().includes(query.toLowerCase()))
  ), [connectors, query]);

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
      owner: connector.owner,
    });
  };

  const closeEditor = () => {
    setEditingConnector(null);
    setConnectorDraft(emptyConnector);
  };

  const testConnector = () => toast.success("测试连接成功");

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
    setConnectors((prev) => prev.map((connector, index) => ({ ...connector, status: index === prev.length - 1 ? "异常" : "正常", lastChecked: "刚刚" })));
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
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
          <TextField label="Base URL" size="small" value={connectorDraft.baseUrl} onChange={(event) => setConnectorDraft((prev) => ({ ...prev, baseUrl: event.target.value }))} />
          <TextField label="OpenAPI Spec URL" size="small" value={connectorDraft.specUrl} onChange={(event) => setConnectorDraft((prev) => ({ ...prev, specUrl: event.target.value }))} />
        </Box>
      );
    }
    if (connectorDraft.type === "REST API") {
      return (
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
          <TextField label="Base URL" size="small" value={connectorDraft.baseUrl} onChange={(event) => setConnectorDraft((prev) => ({ ...prev, baseUrl: event.target.value }))} />
          <TextField label="Health Check Path" size="small" value={connectorDraft.healthPath} onChange={(event) => setConnectorDraft((prev) => ({ ...prev, healthPath: event.target.value }))} />
        </Box>
      );
    }
    return (
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 140px 1fr", gap: 2 }}>
        <TextField label="Base URL" size="small" value={connectorDraft.baseUrl} onChange={(event) => setConnectorDraft((prev) => ({ ...prev, baseUrl: event.target.value }))} />
        <TextField select label="请求方法" size="small" value={connectorDraft.method} onChange={(event) => setConnectorDraft((prev) => ({ ...prev, method: event.target.value }))}>
          {["GET", "POST", "PUT", "DELETE"].map((method) => <MenuItem key={method} value={method}>{method}</MenuItem>)}
        </TextField>
        <TextField label="请求路径" size="small" value={connectorDraft.requestPath} onChange={(event) => setConnectorDraft((prev) => ({ ...prev, requestPath: event.target.value }))} />
      </Box>
    );
  };

  const renderAuthFields = () => {
    if (connectorDraft.auth === "Bearer Token") return <TextField label="Token" size="small" fullWidth value="••••••••••••••••" />;
    if (connectorDraft.auth === "API Key") {
      return (
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
          <TextField label="Header 名称" size="small" defaultValue="X-API-Key" />
          <TextField label="API Key" size="small" value="••••••••••••••••" />
        </Box>
      );
    }
    if (connectorDraft.auth === "Basic Auth") {
      return (
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
          <TextField label="用户名" size="small" defaultValue="toolhub" />
          <TextField label="密码" size="small" value="••••••••••••" />
        </Box>
      );
    }
    return null;
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
      <PageCard>
        <ToolbarRow title="连接器">
          <TextField
            size="small"
            placeholder="搜索连接器 / 类型 / 状态"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><Search sx={{ fontSize: 18, color: "#9ca3af" }} /></InputAdornment> }}
            sx={{ width: 240, "& .MuiOutlinedInput-root": { borderRadius: "6px", bgcolor: "#fff" } }}
          />
          <Button variant="outlined" startIcon={<Refresh sx={{ fontSize: 16 }} />} onClick={checkAll} sx={{ textTransform: "none", borderRadius: "6px", borderColor: "#dbe2ea", color: "#374151" }}>
            检查全部连接器
          </Button>
          <Button variant="contained" startIcon={<Add sx={{ fontSize: 16 }} />} onClick={openCreate} sx={{ bgcolor: BLUE, textTransform: "none", borderRadius: "6px", boxShadow: "none" }}>
            新建连接器
          </Button>
        </ToolbarRow>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: "#f8f9fb" }}>
                {["连接器名称", "类型", "状态", "关联工具", "操作"].map((head) => (
                  <TableCell key={head} sx={{ fontSize: "12px", fontWeight: 600, color: "#6b7280", py: 1.5, borderBottom: "1px solid #f0f0f0" }}>{head}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {visibleConnectors.map((connector) => (
                <TableRow key={connector.id} sx={{ "&:hover": { bgcolor: "#f6f9ff" }, "& td": { borderBottom: "1px solid #f5f5f5" } }}>
                  <TableCell sx={{ py: 1.5 }}>
                    <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#111827" }}>{connector.name}</Typography>
                    <Typography sx={{ fontSize: "12px", color: "#64748b", mt: 0.5 }}>最近检测 {connector.lastChecked}</Typography>
                  </TableCell>
                  <TableCell sx={{ fontSize: "13px", color: "#374151" }}>{connector.type}</TableCell>
                  <TableCell><StatusChip status={connector.status} type="connector" /></TableCell>
                  <TableCell sx={{ fontSize: "13px", color: "#374151" }}>{connector.toolCount}</TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <Tooltip title="测试连接" arrow><IconButton size="small" onClick={testConnector}><Science sx={{ fontSize: 17, color: BLUE }} /></IconButton></Tooltip>
                      <Typography component="button" onClick={() => openEdit(connector)} sx={{ border: "none", p: 0, bgcolor: "transparent", color: BLUE, fontSize: "12px", cursor: "pointer" }}>编辑</Typography>
                      <Typography component="button" onClick={() => setDeleteTarget(connector)} sx={{ border: "none", p: 0, bgcolor: "transparent", color: "#ef4444", fontSize: "12px", cursor: "pointer" }}>删除</Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </PageCard>

      <Dialog open={Boolean(editingConnector) || connectorDraft !== emptyConnector} onClose={closeEditor} fullWidth maxWidth="md" PaperProps={{ sx: { borderRadius: "12px" } }}>
        <DialogTitle sx={{ fontSize: "16px", fontWeight: 700 }}>{editingConnector ? "编辑连接器" : "新建连接器"}</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: "12px !important" }}>
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 180px", gap: 2 }}>
            <TextField label="连接器名称" size="small" required value={connectorDraft.name} onChange={(event) => setConnectorDraft((prev) => ({ ...prev, name: event.target.value }))} />
            <TextField select label="连接器类型" size="small" value={connectorDraft.type} onChange={(event) => setConnectorDraft((prev) => ({ ...prev, type: event.target.value as ConnectorType }))}>
              {["OpenAPI", "REST API", "自定义 HTTP"].map((type) => <MenuItem key={type} value={type}>{type}</MenuItem>)}
            </TextField>
          </Box>
          {renderTypeFields()}
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
            <TextField select label="Authentication" size="small" value={connectorDraft.auth} onChange={(event) => setConnectorDraft((prev) => ({ ...prev, auth: event.target.value as AuthType }))}>
              {["Bearer Token", "API Key", "Basic Auth", "None"].map((auth) => <MenuItem key={auth} value={auth}>{auth}</MenuItem>)}
            </TextField>
            <TextField label="负责人" size="small" value={connectorDraft.owner} onChange={(event) => setConnectorDraft((prev) => ({ ...prev, owner: event.target.value }))} />
          </Box>
          {renderAuthFields()}
          {connectorDraft.type === "OpenAPI" && (
            <Paper sx={{ border: "1px solid #e5e7eb", borderRadius: "8px", boxShadow: "none", overflow: "hidden" }}>
              <Box sx={{ p: 1.5, borderBottom: "1px solid #eef2f7" }}>
                <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#374151" }}>接口清单</Typography>
              </Box>
              {(editingConnector?.endpoints.length ? editingConnector.endpoints : ["保存或测试连接后自动获取"]).map((endpoint) => (
                <Box key={endpoint} sx={{ px: 1.5, py: 1, borderBottom: "1px solid #f3f4f6" }}>
                  <Typography sx={{ fontSize: "12px", color: "#475569", fontFamily: endpoint.includes("/") ? "monospace" : "inherit" }}>{endpoint}</Typography>
                </Box>
              ))}
            </Paper>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={testConnector} variant="outlined" sx={{ textTransform: "none", borderRadius: "6px", color: "#374151", borderColor: "#dbe2ea" }}>测试连接</Button>
          <Box sx={{ flex: 1 }} />
          <Button onClick={closeEditor} sx={{ textTransform: "none", color: "#64748b" }}>取消</Button>
          <Button onClick={saveConnector} variant="contained" sx={{ bgcolor: BLUE, textTransform: "none", boxShadow: "none" }}>保存</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: "12px" } }}>
        <DialogTitle sx={{ fontSize: "16px", fontWeight: 700 }}>确认删除连接器？</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ fontSize: "13px" }}>
            删除连接器会影响已关联工具的调用配置，确定继续？
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
