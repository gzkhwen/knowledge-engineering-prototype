import { useMemo, useState } from "react";
import {
  Add,
  Category,
  CloudQueue,
  Delete,
  Edit,
  Extension,
  Link as LinkIcon,
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
  Divider,
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
  Typography,
} from "@mui/material";
import { toast } from "sonner";
import { ToolHubPage } from "./ToolHubPage";

type ServiceStatus = "已接入" | "待同步" | "已停用";
type McpTransport = "streamable" | "sse" | "stdio";

interface McpServiceItem {
  id: string;
  name: string;
  desc: string;
  transport: McpTransport;
  endpoint?: string;
  command?: string;
  authType: "无鉴权" | "API Key" | "Bearer Token";
  status: ServiceStatus;
  toolCount: number;
  lastSyncedAt: string;
}

interface ToolCategoryItem {
  id: string;
  name: string;
  code: string;
}

interface ManagedToolItem {
  id: string;
  name: string;
  serviceId: string;
  categoryId: string;
  inputCount: number;
  syncedAt: string;
}

const initialServices: McpServiceItem[] = [
  {
    id: "svc-nacos",
    name: "nacos-knowledge-tool-mcp",
    desc: "提供知识解析、分片和抽取相关 MCP 工具。",
    transport: "streamable",
    endpoint: "https://mcp.example.com/knowledge",
    authType: "API Key",
    status: "已接入",
    toolCount: 6,
    lastSyncedAt: "2026-05-25 18:20",
  },
  {
    id: "svc-standard",
    name: "standard-document-mcp",
    desc: "提供文档处理相关 MCP 工具。",
    transport: "sse",
    endpoint: "https://mcp.example.com/document/sse",
    authType: "Bearer Token",
    status: "已接入",
    toolCount: 5,
    lastSyncedAt: "2026-05-25 17:46",
  },
];

const initialCategories: ToolCategoryItem[] = [
  { id: "parse", name: "解析", code: "parse" },
  { id: "chunk", name: "分片", code: "chunk" },
  { id: "extract", name: "抽取", code: "extract" },
];

const initialTools: ManagedToolItem[] = [
  { id: "document-parser", name: "通用解析", serviceId: "svc-nacos", categoryId: "parse", inputCount: 1, syncedAt: "2026-05-25 18:20" },
  { id: "multimodal-parser", name: "多模态解析", serviceId: "svc-nacos", categoryId: "parse", inputCount: 1, syncedAt: "2026-05-25 18:20" },
  { id: "medical-policy-parser", name: "医保政策文件解析", serviceId: "svc-standard", categoryId: "parse", inputCount: 1, syncedAt: "2026-05-25 17:46" },
  { id: "chunk-splitter", name: "通用分片", serviceId: "svc-nacos", categoryId: "chunk", inputCount: 1, syncedAt: "2026-05-25 18:20" },
  { id: "custom-delimiter-splitter", name: "自定义分隔符分片", serviceId: "svc-nacos", categoryId: "chunk", inputCount: 1, syncedAt: "2026-05-25 18:20" },
  { id: "recursive-delimiter-splitter", name: "分隔符递归分片", serviceId: "svc-standard", categoryId: "chunk", inputCount: 1, syncedAt: "2026-05-25 17:46" },
  { id: "ocr-splitter", name: "OCR解析专用分片", serviceId: "svc-standard", categoryId: "chunk", inputCount: 1, syncedAt: "2026-05-25 17:46" },
  { id: "medical-policy-splitter", name: "医保政策文件分片", serviceId: "svc-standard", categoryId: "chunk", inputCount: 1, syncedAt: "2026-05-25 17:46" },
  { id: "qa-extractor", name: "QA提取", serviceId: "svc-nacos", categoryId: "extract", inputCount: 1, syncedAt: "2026-05-25 18:20" },
  { id: "summary-extractor", name: "摘要总结", serviceId: "svc-nacos", categoryId: "extract", inputCount: 1, syncedAt: "2026-05-25 18:20" },
  { id: "keyword-extractor", name: "关键词提取", serviceId: "svc-standard", categoryId: "extract", inputCount: 1, syncedAt: "2026-05-25 17:46" },
];

function statusColor(status: ServiceStatus) {
  if (status === "已接入") return { bgcolor: "#f0fdf4", color: "#16a34a" };
  if (status === "待同步") return { bgcolor: "#fff7ed", color: "#c2410c" };
  return { bgcolor: "#f1f5f9", color: "#64748b" };
}

function createNowText() {
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

const transportLabels: Record<McpTransport, string> = {
  streamable: "streamable",
  sse: "sse",
  stdio: "stdio",
};

const discoveredToolPreview = [
  { name: "document_parse", title: "文档解析", input: "inputSchema", status: "新增" },
  { name: "chunk_split", title: "文本分片", input: "inputSchema", status: "新增" },
  { name: "qa_extract", title: "QA提取", input: "inputSchema", status: "更新" },
];

const defaultServiceDraft = {
  name: "",
  desc: "",
  transport: "streamable" as McpTransport,
  endpoint: "",
  command: "",
  args: "",
  env: "",
  authType: "API Key" as McpServiceItem["authType"],
  apiKeyHeader: "Authorization",
  apiKeyValue: "",
  bearerToken: "",
};

function getServiceAccessText(service: McpServiceItem) {
  if (service.transport === "stdio") return service.command || "-";
  return service.endpoint || "-";
}

export function McpAccessManagementPage() {
  const [services, setServices] = useState(initialServices);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [connectionTested, setConnectionTested] = useState(false);
  const [serviceDraft, setServiceDraft] = useState(defaultServiceDraft);

  const updateDraft = (patch: Partial<typeof defaultServiceDraft>) => {
    setConnectionTested(false);
    setServiceDraft((draft) => ({ ...draft, ...patch }));
  };

  const saveService = () => {
    const missingRemoteEndpoint = serviceDraft.transport !== "stdio" && !serviceDraft.endpoint.trim();
    const missingStdioCommand = serviceDraft.transport === "stdio" && !serviceDraft.command.trim();
    if (!serviceDraft.name.trim() || missingRemoteEndpoint || missingStdioCommand) {
      toast.error("服务名称和连接配置不能为空");
      return;
    }
    const newService: McpServiceItem = {
      id: `svc-${Date.now()}`,
      name: serviceDraft.name.trim(),
      desc: serviceDraft.desc.trim(),
      transport: serviceDraft.transport,
      endpoint: serviceDraft.transport === "stdio" ? undefined : serviceDraft.endpoint.trim(),
      command: serviceDraft.transport === "stdio" ? serviceDraft.command.trim() : undefined,
      authType: serviceDraft.authType,
      status: "待同步",
      toolCount: discoveredToolPreview.length,
      lastSyncedAt: "-",
    };
    setServices((items) => [...items, newService]);
    setDialogOpen(false);
    setConnectionTested(false);
    setServiceDraft(defaultServiceDraft);
    toast.success("MCP 服务已接入，工具信息已进入同步队列");
  };

  const testConnection = () => {
    if (serviceDraft.transport === "stdio" && !serviceDraft.command.trim()) {
      toast.error("请先填写启动命令");
      return;
    }
    if (serviceDraft.transport !== "stdio" && !serviceDraft.endpoint.trim()) {
      toast.error("请先填写 Endpoint");
      return;
    }
    setConnectionTested(true);
    toast.success("连接测试通过，已发现可同步工具");
  };

  const syncService = (serviceId: string) => {
    setServices((items) => items.map((item) => (
      item.id === serviceId ? { ...item, status: "已接入", lastSyncedAt: createNowText() } : item
    )));
    toast.success("已触发工具信息同步");
  };

  const toggleService = (serviceId: string) => {
    setServices((items) => items.map((item) => (
      item.id === serviceId ? { ...item, status: item.status === "已停用" ? "已接入" : "已停用" } : item
    )));
  };

  const openAccessDialog = () => {
    setServiceDraft(defaultServiceDraft);
    setConnectionTested(false);
    setDialogOpen(true);
  };

  const closeAccessDialog = () => {
    setDialogOpen(false);
    setConnectionTested(false);
    setServiceDraft(defaultServiceDraft);
  };

  const remoteEndpointLabel = serviceDraft.transport === "sse" ? "SSE Endpoint" : "MCP Endpoint";

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
        <Box>
          <Typography sx={{ fontSize: 20, fontWeight: 700, color: "#111827" }}>MCP 接入</Typography>
          <Typography sx={{ fontSize: 13, color: "#64748b", mt: 0.75 }}>
            接入 MCP Server，完成协议初始化、能力识别和工具发现。这里只管理服务接入关系，不修改工具自身配置。
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<CloudQueue />} onClick={openAccessDialog} sx={{ bgcolor: "#3b82f6", borderRadius: "6px", textTransform: "none", boxShadow: "none", "&:hover": { bgcolor: "#2563eb", boxShadow: "none" } }}>
          接入 MCP 服务
        </Button>
      </Box>

      <Stack direction="row" spacing={1.5} sx={{ mb: 2 }}>
        <Paper sx={{ flex: 1, p: 2, border: "1px solid #e5e7eb", borderRadius: "8px", boxShadow: "none" }}>
          <Typography sx={{ fontSize: 12, color: "#64748b" }}>已接入服务</Typography>
          <Typography sx={{ fontSize: 24, fontWeight: 800, color: "#111827", mt: 0.5 }}>{services.length}</Typography>
        </Paper>
        <Paper sx={{ flex: 1, p: 2, border: "1px solid #e5e7eb", borderRadius: "8px", boxShadow: "none" }}>
          <Typography sx={{ fontSize: 12, color: "#64748b" }}>启用服务</Typography>
          <Typography sx={{ fontSize: 24, fontWeight: 800, color: "#111827", mt: 0.5 }}>{services.filter((service) => service.status !== "已停用").length}</Typography>
        </Paper>
        <Paper sx={{ flex: 1, p: 2, border: "1px solid #e5e7eb", borderRadius: "8px", boxShadow: "none" }}>
          <Typography sx={{ fontSize: 12, color: "#64748b" }}>同步工具数</Typography>
          <Typography sx={{ fontSize: 24, fontWeight: 800, color: "#111827", mt: 0.5 }}>{services.reduce((sum, service) => sum + service.toolCount, 0)}</Typography>
        </Paper>
      </Stack>

      <Paper sx={{ border: "1px solid #e5e7eb", borderRadius: "8px", boxShadow: "none", overflow: "hidden" }}>
        <Box sx={{ px: 2, py: 1.5, display: "flex", alignItems: "center", gap: 1 }}>
          <CloudQueue sx={{ fontSize: 18, color: "#3b82f6" }} />
          <Typography sx={{ fontSize: 15, fontWeight: 700, color: "#111827" }}>服务列表</Typography>
        </Box>
        <Divider />
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                {["服务名称", "协议", "连接信息", "鉴权", "状态", "工具数", "最近同步", "操作"].map((head) => (
                  <TableCell key={head} sx={{ bgcolor: "#f8fafc", fontSize: 12, fontWeight: 700, color: "#64748b", whiteSpace: "nowrap" }}>{head}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {services.map((service) => (
                <TableRow key={service.id} hover>
                  <TableCell sx={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{service.name}</TableCell>
                  <TableCell sx={{ fontSize: 12, color: "#64748b" }}>{transportLabels[service.transport]}</TableCell>
                  <TableCell sx={{ fontSize: 12, color: "#64748b" }}>
                    <Stack direction="row" alignItems="center" spacing={0.75}>
                      <LinkIcon sx={{ fontSize: 14, color: "#94a3b8" }} />
                      <Typography sx={{ fontSize: 12, color: "#64748b" }}>{getServiceAccessText(service)}</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell sx={{ fontSize: 12, color: "#64748b" }}>{service.authType}</TableCell>
                  <TableCell><Chip label={service.status} size="small" sx={{ height: 20, fontSize: 10.5, ...statusColor(service.status) }} /></TableCell>
                  <TableCell><Chip label={`${service.toolCount} 个`} size="small" sx={{ height: 20, fontSize: 10.5, bgcolor: "#eff6ff", color: "#2563eb" }} /></TableCell>
                  <TableCell sx={{ fontSize: 12, color: "#64748b" }}>{service.lastSyncedAt}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={0.75}>
                      <Button size="small" startIcon={<Sync sx={{ fontSize: 14 }} />} onClick={() => syncService(service.id)} sx={{ textTransform: "none", fontSize: 12 }}>同步</Button>
                      <Button size="small" onClick={() => toggleService(service.id)} sx={{ textTransform: "none", fontSize: 12, color: service.status === "已停用" ? "#16a34a" : "#64748b" }}>
                        {service.status === "已停用" ? "启用" : "停用"}
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={dialogOpen} onClose={closeAccessDialog} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontSize: 16, fontWeight: 700 }}>接入 MCP 服务</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField label="服务名称" size="small" value={serviceDraft.name} onChange={(event) => updateDraft({ name: event.target.value })} />
            <TextField label="服务描述" size="small" multiline minRows={2} value={serviceDraft.desc} onChange={(event) => updateDraft({ desc: event.target.value })} />
            <FormControl size="small">
              <InputLabel>协议类型</InputLabel>
              <Select
                label="协议类型"
                value={serviceDraft.transport}
                onChange={(event) => {
                  const transport = event.target.value as McpTransport;
                  updateDraft({
                    transport,
                    authType: transport === "stdio" ? "无鉴权" : serviceDraft.authType,
                  });
                }}
              >
                <MenuItem value="streamable">streamable</MenuItem>
                <MenuItem value="sse">sse</MenuItem>
                <MenuItem value="stdio">stdio</MenuItem>
              </Select>
            </FormControl>
            {serviceDraft.transport === "stdio" ? (
              <Stack spacing={2}>
                <TextField label="启动命令" size="small" value={serviceDraft.command} onChange={(event) => updateDraft({ command: event.target.value })} placeholder="例如：npx -y @modelcontextprotocol/server-filesystem" />
                <TextField label="启动参数" size="small" value={serviceDraft.args} onChange={(event) => updateDraft({ args: event.target.value })} placeholder="例如：/data/docs" />
                <TextField label="环境变量" size="small" multiline minRows={3} value={serviceDraft.env} onChange={(event) => updateDraft({ env: event.target.value })} placeholder="每行一个 KEY=VALUE" />
              </Stack>
            ) : null}
            {serviceDraft.transport !== "stdio" ? (
              <>
                <TextField label={remoteEndpointLabel} size="small" value={serviceDraft.endpoint} onChange={(event) => updateDraft({ endpoint: event.target.value })} placeholder={serviceDraft.transport === "sse" ? "https://example.com/mcp/sse" : "https://example.com/mcp"} />
                <FormControl size="small">
                  <InputLabel>鉴权方式</InputLabel>
                  <Select label="鉴权方式" value={serviceDraft.authType} onChange={(event) => updateDraft({ authType: event.target.value as McpServiceItem["authType"] })}>
                    <MenuItem value="无鉴权">无鉴权</MenuItem>
                    <MenuItem value="Bearer Token">Bearer Token</MenuItem>
                    <MenuItem value="API Key">API Key</MenuItem>
                  </Select>
                </FormControl>
                {serviceDraft.authType === "Bearer Token" ? (
                  <TextField label="Bearer Token" size="small" type="password" value={serviceDraft.bearerToken} onChange={(event) => updateDraft({ bearerToken: event.target.value })} />
                ) : null}
                {serviceDraft.authType === "API Key" ? (
                  <Stack direction="row" spacing={1}>
                    <TextField label="Header 名称" size="small" value={serviceDraft.apiKeyHeader} onChange={(event) => updateDraft({ apiKeyHeader: event.target.value })} sx={{ flex: 1 }} />
                    <TextField label="Key 值" size="small" type="password" value={serviceDraft.apiKeyValue} onChange={(event) => updateDraft({ apiKeyValue: event.target.value })} sx={{ flex: 1 }} />
                  </Stack>
                ) : null}
              </>
            ) : null}
            <Box sx={{ p: 1.5, borderRadius: "8px", border: "1px solid #e5e7eb", bgcolor: "#f8fafc" }}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
                <Box>
                  <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>连接测试</Typography>
                  <Typography sx={{ fontSize: 12, color: "#64748b", mt: 0.5 }}>
                    {serviceDraft.transport === "stdio"
                      ? "系统将启动本地进程，完成 initialize、能力识别和 tools/list。"
                      : "系统将连接 Endpoint，完成 initialize、能力识别和 tools/list。"}
                  </Typography>
                </Box>
                <Button variant="outlined" size="small" onClick={testConnection} sx={{ textTransform: "none", flexShrink: 0 }}>
                  测试连接
                </Button>
              </Box>
              {connectionTested ? (
                <Stack spacing={1.25} sx={{ mt: 1.25 }}>
                  <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                    {[
                      serviceDraft.transport === "stdio" ? "进程启动成功" : "连接成功",
                      "initialize 成功",
                      "支持 tools/list",
                      `发现 ${discoveredToolPreview.length} 个工具`,
                    ].map((item) => (
                      <Chip key={item} label={item} size="small" sx={{ height: 22, fontSize: 11, bgcolor: "#f0fdf4", color: "#16a34a" }} />
                    ))}
                  </Stack>
                  <Box sx={{ p: 1.25, borderRadius: "6px", bgcolor: "#fff", border: "1px solid #e5e7eb" }}>
                    <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#111827", mb: 0.75 }}>能力识别</Typography>
                    <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                      <Chip label="tools：可用" size="small" sx={{ height: 22, fontSize: 11, bgcolor: "#eff6ff", color: "#2563eb" }} />
                      <Chip label="resources：未声明" size="small" sx={{ height: 22, fontSize: 11, bgcolor: "#f1f5f9", color: "#64748b" }} />
                      <Chip label="prompts：未声明" size="small" sx={{ height: 22, fontSize: 11, bgcolor: "#f1f5f9", color: "#64748b" }} />
                    </Stack>
                  </Box>
                  <Box sx={{ p: 1.25, borderRadius: "6px", bgcolor: "#fff", border: "1px solid #e5e7eb" }}>
                    <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#111827", mb: 0.75 }}>本次发现工具</Typography>
                    <Stack spacing={0.75}>
                      {discoveredToolPreview.map((tool) => (
                        <Box key={tool.name} sx={{ display: "grid", gridTemplateColumns: "1fr 88px 58px", alignItems: "center", gap: 1 }}>
                          <Box>
                            <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#111827" }}>{tool.title}</Typography>
                            <Typography sx={{ fontSize: 11, color: "#64748b" }}>{tool.name}</Typography>
                          </Box>
                          <Chip label={tool.input} size="small" sx={{ height: 20, fontSize: 10.5, bgcolor: "#f8fafc", color: "#64748b" }} />
                          <Chip label={tool.status} size="small" sx={{ height: 20, fontSize: 10.5, bgcolor: tool.status === "新增" ? "#eff6ff" : "#fff7ed", color: tool.status === "新增" ? "#2563eb" : "#c2410c" }} />
                        </Box>
                      ))}
                    </Stack>
                  </Box>
                </Stack>
              ) : null}
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={closeAccessDialog} sx={{ textTransform: "none" }}>取消</Button>
          <Button variant="contained" disabled={!connectionTested} onClick={saveService} sx={{ textTransform: "none", bgcolor: "#3b82f6" }}>确认接入</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export function ToolManagementPage() {
  return <ToolHubPage />;
}
