import { useState } from "react";
import {
  Add,
  Delete,
  Edit,
  Link as LinkIcon,
  PlayArrow,
  Sync,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
} from "@mui/material";
import { toast } from "sonner";
import { ToolHubPage } from "./ToolHubPage";

type McpServiceType = "Nacos" | "标准 MCP Server";
type McpTransport = "Streamable HTTP" | "SSE";
type McpAuthType = "无鉴权" | "Bearer Token" | "API Key";
type McpServiceStatus = "连接正常" | "连接异常" | "已停用";

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
  lastSyncedAt: string;
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

const BLUE = "#3b82f6";

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
    lastSyncedAt: "2026-05-26 17:30",
  },
];

function nowText() {
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

function statusSx(status: McpServiceStatus) {
  if (status === "连接正常") return { bgcolor: "#f0fdf4", color: "#16a34a" };
  if (status === "连接异常") return { bgcolor: "#fef2f2", color: "#dc2626" };
  return { bgcolor: "#f1f5f9", color: "#64748b" };
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
    lastSyncedAt: "-",
  };
}

export function McpServiceManagementPage() {
  const [services, setServices] = useState(initialServices);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<McpServiceDraft>(defaultDraft);
  const [connectionTested, setConnectionTested] = useState(false);

  const openCreate = () => {
    setEditingId(null);
    setDraft(defaultDraft);
    setConnectionTested(false);
    setDialogOpen(true);
  };

  const openEdit = (service: McpServiceItem) => {
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
          ? { ...item, ...toService(draft, editingId), toolCount: item.toolCount, lastSyncedAt: item.lastSyncedAt }
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
    setServices((items) => items.map((item) => (
      item.id === serviceId
        ? { ...item, status: "连接正常", toolCount: Math.max(item.toolCount, 3), lastSyncedAt: nowText() }
        : item
    )));
    toast.success("已触发工具同步");
  };

  const toggleService = (serviceId: string) => {
    setServices((items) => items.map((item) => (
      item.id === serviceId
        ? { ...item, status: item.status === "已停用" ? "连接正常" : "已停用" }
        : item
    )));
  };

  const deleteService = (serviceId: string) => {
    setServices((items) => items.filter((item) => item.id !== serviceId));
    toast.success("MCP 服务已删除");
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "calc(100vh - 112px)", minHeight: 0 }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, mb: 1.5 }}>
        <Box>
          <Typography sx={{ fontSize: "15px", fontWeight: 700, color: "#111827" }}>MCP服务管理</Typography>
          <Typography sx={{ fontSize: "12px", color: "#64748b", mt: 0.25 }}>
            接入 Nacos 或客户自建 MCP Server，完成连接测试和工具同步；这里只维护服务接入关系，不编辑工具定义。
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Add sx={{ fontSize: 16 }} />} onClick={openCreate} sx={{ height: 34, bgcolor: BLUE, borderRadius: "6px", textTransform: "none", boxShadow: "none", fontSize: "13px", "&:hover": { bgcolor: "#2563eb", boxShadow: "none" } }}>
          接入MCP服务
        </Button>
      </Box>

      <Paper sx={{ border: "1px solid #e8eaed", borderRadius: "10px", boxShadow: "none", overflow: "hidden", flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
        <Box sx={{ px: 2, py: 1.5, borderBottom: "1px solid #f0f0f0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box>
            <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#111827" }}>服务列表</Typography>
            <Typography sx={{ fontSize: "12px", color: "#64748b", mt: 0.25 }}>共 {services.length} 个服务</Typography>
          </Box>
        </Box>
        <TableContainer sx={{ flex: 1, overflow: "auto" }}>
          <Table size="small" sx={{ tableLayout: "fixed", minWidth: 960 }}>
            <TableHead>
              <TableRow>
                {[
                  ["服务名称", "190px"],
                  ["类型", "110px"],
                  ["协议", "120px"],
                  ["服务地址", "280px"],
                  ["版本", "90px"],
                  ["状态", "100px"],
                  ["工具数", "80px"],
                  ["最近同步", "140px"],
                  ["操作", "180px"],
                ].map(([label, width]) => (
                  <TableCell key={label} sx={{ width, bgcolor: "#f8f9fb", fontSize: "12px", fontWeight: 600, color: "#6b7280", py: 1.5, borderBottom: "1px solid #f0f0f0" }}>{label}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {services.map((service, index) => (
                <TableRow key={service.id} sx={{ bgcolor: index % 2 === 0 ? "#fff" : "#fafafa", "&:hover": { bgcolor: "#f6f9ff" }, "& td": { borderBottom: "1px solid #f5f5f5" } }}>
                  <TableCell sx={{ py: 1.5 }}>
                    <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#111827" }}>{service.name}</Typography>
                    <Typography sx={{ fontSize: "11px", color: "#64748b", mt: 0.25, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{service.description}</Typography>
                  </TableCell>
                  <TableCell sx={{ fontSize: "12px", color: "#374151" }}>{service.serviceType}</TableCell>
                  <TableCell><Chip label={service.transport} size="small" sx={{ height: 21, fontSize: 10.5, bgcolor: "#eff6ff", color: "#2563eb" }} /></TableCell>
                  <TableCell sx={{ fontSize: "12px", color: "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    <LinkIcon sx={{ fontSize: 13, color: "#94a3b8", mr: 0.5, verticalAlign: "-2px" }} />
                    {service.endpoint}
                  </TableCell>
                  <TableCell><Chip label={service.version} size="small" sx={{ height: 21, fontSize: 10.5, bgcolor: "#f8fafc", color: "#64748b" }} /></TableCell>
                  <TableCell><Chip label={service.status} size="small" sx={{ height: 21, fontSize: 10.5, ...statusSx(service.status) }} /></TableCell>
                  <TableCell sx={{ fontSize: "12px", color: "#374151" }}>{service.toolCount}</TableCell>
                  <TableCell sx={{ fontSize: "12px", color: "#64748b" }}>{service.lastSyncedAt}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={0.25}>
                      <Tooltip title="同步工具"><IconButton size="small" onClick={() => syncService(service.id)} sx={{ color: BLUE }}><Sync sx={{ fontSize: 16 }} /></IconButton></Tooltip>
                      <Tooltip title="编辑"><IconButton size="small" onClick={() => openEdit(service)} sx={{ color: "#64748b" }}><Edit sx={{ fontSize: 16 }} /></IconButton></Tooltip>
                      <Button size="small" onClick={() => toggleService(service.id)} sx={{ minWidth: 44, px: 0.75, fontSize: 12, textTransform: "none", color: service.status === "已停用" ? "#16a34a" : "#64748b" }}>
                        {service.status === "已停用" ? "启用" : "停用"}
                      </Button>
                      <Tooltip title="删除"><IconButton size="small" onClick={() => deleteService(service.id)} sx={{ color: "#ef4444" }}><Delete sx={{ fontSize: 16 }} /></IconButton></Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontSize: "16px", fontWeight: 700, px: 3, pt: 2.25, pb: 1 }}>
          {editingId ? "编辑MCP服务" : "接入MCP服务"}
        </DialogTitle>
        <DialogContent sx={{ px: 3, pt: "8px !important", pb: 1 }}>
          <Stack spacing={1.5}>
            <TextField label="服务名称" size="small" value={draft.name} onChange={(event) => updateDraft({ name: event.target.value })} fullWidth />
            <Stack direction="row" spacing={1}>
              <FormControl size="small" fullWidth>
                <InputLabel>服务类型</InputLabel>
                <Select label="服务类型" value={draft.serviceType} onChange={(event) => updateDraft({ serviceType: event.target.value as McpServiceType })}>
                  <MenuItem value="Nacos">Nacos</MenuItem>
                  <MenuItem value="标准 MCP Server">标准 MCP Server</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" fullWidth>
                <InputLabel>协议类型</InputLabel>
                <Select label="协议类型" value={draft.transport} onChange={(event) => updateDraft({ transport: event.target.value as McpTransport })}>
                  <MenuItem value="Streamable HTTP">Streamable HTTP</MenuItem>
                  <MenuItem value="SSE">SSE</MenuItem>
                </Select>
              </FormControl>
            </Stack>
            <TextField label="服务地址" size="small" value={draft.endpoint} onChange={(event) => updateDraft({ endpoint: event.target.value })} placeholder={draft.transport === "SSE" ? "https://example.com/mcp/sse" : "https://example.com/mcp"} fullWidth />
            <Stack direction="row" spacing={1}>
              <FormControl size="small" sx={{ width: 180 }}>
                <InputLabel>鉴权方式</InputLabel>
                <Select label="鉴权方式" value={draft.authType} onChange={(event) => updateDraft({ authType: event.target.value as McpAuthType })}>
                  <MenuItem value="无鉴权">无鉴权</MenuItem>
                  <MenuItem value="Bearer Token">Bearer Token</MenuItem>
                  <MenuItem value="API Key">API Key</MenuItem>
                </Select>
              </FormControl>
              {draft.authType !== "无鉴权" ? (
                <>
                  <TextField label="Header" size="small" value={draft.authHeader} onChange={(event) => updateDraft({ authHeader: event.target.value })} sx={{ width: 160 }} />
                  <TextField label="密钥" size="small" type="password" value={draft.authValue} onChange={(event) => updateDraft({ authValue: event.target.value })} sx={{ flex: 1 }} />
                </>
              ) : null}
            </Stack>
            <TextField label="服务版本" size="small" value={draft.version} onChange={(event) => updateDraft({ version: event.target.value })} fullWidth />
            <TextField label="服务描述" size="small" value={draft.description} onChange={(event) => updateDraft({ description: event.target.value })} multiline minRows={2} fullWidth />
            <Box sx={{ p: 1.25, border: "1px solid #e5e7eb", borderRadius: "8px", bgcolor: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1.5 }}>
              <Box>
                <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#111827" }}>连接测试</Typography>
                <Typography sx={{ fontSize: "12px", color: "#64748b", mt: 0.25 }}>测试 initialize 和 tools/list 是否可用。</Typography>
              </Box>
              <Button variant="outlined" size="small" startIcon={<PlayArrow sx={{ fontSize: 15 }} />} onClick={testConnection} sx={{ textTransform: "none", flexShrink: 0 }}>
                测试连接
              </Button>
            </Box>
            {connectionTested ? (
              <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                {["连接正常", "initialize 成功", "tools/list 可用", "可同步工具"].map((item) => (
                  <Chip key={item} label={item} size="small" sx={{ height: 22, fontSize: 11, bgcolor: "#f0fdf4", color: "#16a34a" }} />
                ))}
              </Stack>
            ) : null}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={closeDialog} sx={{ textTransform: "none", color: "#64748b" }}>取消</Button>
          <Button variant="contained" onClick={saveService} sx={{ textTransform: "none", bgcolor: BLUE, boxShadow: "none" }}>{editingId ? "保存" : "确认接入"}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export function ToolManagementPage() {
  return <ToolHubPage />;
}
