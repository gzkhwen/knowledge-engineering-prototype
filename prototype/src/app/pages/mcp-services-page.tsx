import { useMemo, useState } from "react";
import { Copy, KeyRound, Pencil, Plus, Power, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { connectors, mcpServices, tools } from "../data/mock-data";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Dialog } from "../../components/shared/dialog";
import { FormField } from "../../components/shared/form-field";
import { StatusBadge } from "../../components/shared/status-badge";

type ServiceRow = (typeof mcpServices)[number];

const emptyForm = {
  name: "",
  description: "",
  instructions: "",
  authTarget: "知识工程 Agent",
  status: "停用",
  endpoint: "",
  tools: [] as string[],
  keyStatus: "未创建",
  apiKeys: 0,
};

export function McpServicesPage() {
  const [rows, setRows] = useState<ServiceRow[]>(mcpServices);
  const [keyword, setKeyword] = useState("");
  const [toolKeyword, setToolKeyword] = useState("");
  const [toolConnector, setToolConnector] = useState("全部连接器");
  const [toolCategory, setToolCategory] = useState("全部分类");
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | null>(null);
  const [editing, setEditing] = useState<ServiceRow | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [keyService, setKeyService] = useState<ServiceRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ServiceRow | null>(null);

  const filteredRows = useMemo(
    () => rows.filter((item) => [item.name, item.endpoint, item.authTarget, item.status].some((value) => value.includes(keyword))),
    [rows, keyword],
  );

  const toolOptions = useMemo(
    () =>
      tools.filter((tool) => {
        const matchKeyword = !toolKeyword || tool.name.includes(toolKeyword) || tool.connector.includes(toolKeyword);
        const matchConnector = toolConnector === "全部连接器" || tool.connector === toolConnector;
        const matchCategory = toolCategory === "全部分类" || tool.category === toolCategory;
        return tool.status === "已发布" && matchKeyword && matchConnector && matchCategory;
      }),
    [toolCategory, toolConnector, toolKeyword],
  );

  const startCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogMode("create");
  };

  const startEdit = (row: ServiceRow) => {
    setEditing(row);
    setForm({
      name: row.name,
      description: row.description,
      instructions: row.instructions,
      authTarget: row.authTarget,
      status: row.status,
      endpoint: row.endpoint,
      tools: row.tools,
      keyStatus: row.keyStatus,
      apiKeys: row.apiKeys,
    });
    setDialogMode("edit");
  };

  const saveService = () => {
    const name = form.name.trim() || "未命名 MCP 服务";
    const endpoint = editing?.endpoint ?? `https://mcp.internal/toolhub/${Date.now().toString().slice(-5)}`;
    if (editing) {
      setRows((current) => current.map((row) => (row.id === editing.id ? { ...row, ...form, name, endpoint, status: row.status } : row)));
      toast.success("MCP 服务已更新");
    } else {
      setRows((current) => [
        {
          id: `svc-${Date.now()}`,
          ...form,
          name,
          endpoint,
          callsToday: 0,
          lastCall: "未调用",
        },
        ...current,
      ]);
      toast.success("MCP 服务已创建");
    }
    setEditing(null);
    setDialogMode(null);
  };

  const toggleTool = (toolName: string) => {
    setForm((current) => ({
      ...current,
      tools: current.tools.includes(toolName)
        ? current.tools.filter((item) => item !== toolName)
        : [...current.tools, toolName],
    }));
  };

  const deleteService = () => {
    if (!deleteTarget) return;
    setRows((current) => current.filter((row) => row.id !== deleteTarget.id));
    setDeleteTarget(null);
    toast.success("MCP 服务已删除");
  };

  const toggleServiceStatus = (service: ServiceRow) => {
    const nextStatus = service.status === "运行中" ? "停用" : "运行中";
    setRows((current) => current.map((row) => (row.id === service.id ? { ...row, status: nextStatus } : row)));
    toast.success(`服务已${nextStatus === "运行中" ? "启用" : "停用"}`);
  };

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>服务列表</CardTitle>
          <div className="flex w-full max-w-xl items-center justify-end gap-2">
            <div className="relative w-full max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input className="pl-9" placeholder="搜索服务、Endpoint、授权对象" value={keyword} onChange={(event) => setKeyword(event.target.value)} />
            </div>
            <Button onClick={startCreate}>
              <Plus className="h-4 w-4" />
              新建 MCP 服务
            </Button>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="border-y border-slate-200 bg-slate-50 text-xs text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">服务名称</th>
                <th className="px-4 py-3 font-medium">状态</th>
                <th className="px-4 py-3 font-medium">Endpoint</th>
                <th className="px-4 py-3 font-medium">工具数</th>
                <th className="px-4 py-3 font-medium">今日调用</th>
                <th className="px-4 py-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRows.map((service) => (
                <tr key={service.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="font-medium">{service.name}</div>
                    <div className="mt-1 max-w-xs text-xs text-slate-500">{service.description || "-"}</div>
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={service.status} /></td>
                  <td className="px-4 py-3 text-slate-500">
                    <div className="flex items-center gap-2">
                      <span>{service.endpoint}</span>
                      <Button variant="ghost" size="icon" onClick={() => navigator.clipboard.writeText(service.endpoint).then(() => toast.success("Endpoint 已复制"))}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                  <td className="px-4 py-3">{service.tools.length}</td>
                  <td className="px-4 py-3">{service.callsToday}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => setKeyService(service)}>
                        <KeyRound className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => toggleServiceStatus(service)}>
                        <Power className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => startEdit(service)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(service)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {dialogMode ? (
        <Dialog
          title={dialogMode === "edit" ? "编辑 MCP 服务" : "新建 MCP 服务"}
          width="2xl"
          onClose={() => setDialogMode(null)}
          footer={
            <>
              <Button variant="outline" onClick={() => setDialogMode(null)}>取消</Button>
              <Button onClick={saveService}>保存</Button>
            </>
          }
        >
          <div className="grid gap-5">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField label="服务名称">
                <Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
              </FormField>
              <FormField label="授权对象">
                <Input value={form.authTarget} onChange={(event) => setForm({ ...form, authTarget: event.target.value })} />
              </FormField>
            </div>
            <FormField label="服务描述">
              <Textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
            </FormField>
            <FormField label="Instructions">
              <Textarea value={form.instructions} onChange={(event) => setForm({ ...form, instructions: event.target.value })} />
            </FormField>

            <div className="rounded-lg border border-slate-200">
              <div className="grid gap-3 border-b border-slate-200 p-3 md:grid-cols-[1fr_180px_160px]">
                <Input placeholder="搜索工具名称或连接器" value={toolKeyword} onChange={(event) => setToolKeyword(event.target.value)} />
                <select className="h-9 rounded-md border border-slate-200 px-3 text-sm" value={toolConnector} onChange={(event) => setToolConnector(event.target.value)}>
                  <option>全部连接器</option>
                  {connectors.map((connector) => <option key={connector.id}>{connector.name}</option>)}
                </select>
                <select className="h-9 rounded-md border border-slate-200 px-3 text-sm" value={toolCategory} onChange={(event) => setToolCategory(event.target.value)}>
                  <option>全部分类</option>
                  {[...new Set(tools.map((tool) => tool.category))].map((category) => <option key={category}>{category}</option>)}
                </select>
              </div>
              <div className="max-h-72 overflow-auto divide-y divide-slate-100">
                {toolOptions.map((tool) => {
                  return (
                    <label key={tool.id} className="grid gap-2 p-3 text-sm md:grid-cols-[24px_1fr_120px_160px]">
                      <input type="checkbox" checked={form.tools.includes(tool.name)} onChange={() => toggleTool(tool.name)} />
                      <span className="font-medium">{tool.name}</span>
                      <StatusBadge status={tool.status} />
                      <span>{tool.connector}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        </Dialog>
      ) : null}

      {deleteTarget ? (
        <Dialog
          title="确认删除 MCP 服务"
          width="md"
          onClose={() => setDeleteTarget(null)}
          footer={
            <>
              <Button variant="outline" onClick={() => setDeleteTarget(null)}>取消</Button>
              <Button variant="destructive" onClick={deleteService}>确认删除</Button>
            </>
          }
        >
          <div className="space-y-3 text-sm text-slate-700">
            <p>删除后，已授权 Agent 将无法继续通过该 MCP 服务调用挂载工具。</p>
            <div className="rounded-lg border border-slate-200 p-3 font-medium text-slate-950">{deleteTarget.name}</div>
          </div>
        </Dialog>
      ) : null}

      {keyService ? (
        <Dialog
          title="API Keys"
          width="md"
          onClose={() => setKeyService(null)}
          footer={<Button onClick={() => toast.success("已生成新的 API Key")}>生成新 Key</Button>}
        >
          <div className="space-y-3 text-sm">
            <div className="rounded-lg border border-slate-200 p-3">
              <div className="flex items-center gap-2 font-medium"><KeyRound className="h-4 w-4" /> {keyService.name}</div>
              <div className="mt-2 text-slate-500">当前密钥状态：{keyService.keyStatus}</div>
            </div>
            {Array.from({ length: Math.max(keyService.apiKeys, 1) }).map((_, index) => (
              <div key={index} className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
                <span>th_live_{index + 1}_****************</span>
                <Button variant="outline" size="sm" onClick={() => toast.info("Key 已停用")}>停用</Button>
              </div>
            ))}
          </div>
        </Dialog>
      ) : null}
    </div>
  );
}
