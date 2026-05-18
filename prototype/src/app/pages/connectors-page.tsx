import { useMemo, useState } from "react";
import { Pencil, Plus, Search, TestTube2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { connectors } from "../data/mock-data";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Dialog } from "../../components/shared/dialog";
import { FormField } from "../../components/shared/form-field";
import { PageHeader } from "../../components/shared/page-header";
import { StatusBadge } from "../../components/shared/status-badge";

type ConnectorRow = (typeof connectors)[number];

const newConnector = {
  name: "",
  type: "OpenAPI",
  status: "正常",
  baseUrl: "",
  specUrl: "",
  auth: "Bearer Token",
  health: "/health",
  toolCount: 0,
  lastChecked: "未检测",
  owner: "",
  endpoints: [] as string[],
};

export function ConnectorsPage() {
  const [rows, setRows] = useState<ConnectorRow[]>(connectors);
  const [keyword, setKeyword] = useState("");
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | null>(null);
  const [editing, setEditing] = useState<ConnectorRow | null>(null);
  const [form, setForm] = useState(newConnector);

  const filtered = useMemo(
    () => rows.filter((connector) => [connector.name, connector.type, connector.status, connector.baseUrl].some((item) => item.includes(keyword))),
    [rows, keyword],
  );

  const startCreate = () => {
    setEditing(null);
    setForm(newConnector);
    setDialogMode("create");
  };

  const startEdit = (row: ConnectorRow) => {
    setEditing(row);
    setForm(row);
    setDialogMode("edit");
  };

  const saveConnector = () => {
    const next = {
      ...form,
      name: form.name.trim() || "未命名连接器",
      baseUrl: form.baseUrl.trim() || "https://api.example.internal",
      endpoints: form.endpoints.length ? form.endpoints : ["GET /health", "POST /example/search"],
      lastChecked: form.lastChecked === "未检测" ? "刚刚" : form.lastChecked,
    };
    if (editing) {
      setRows((current) => current.map((row) => (row.id === editing.id ? { ...row, ...next } : row)));
      toast.success("连接器已更新");
    } else {
      setRows((current) => [{ id: `conn-${Date.now()}`, ...next }, ...current]);
      toast.success("连接器已保存");
    }
    setDialogMode(null);
  };

  const deleteConnector = (id: string) => {
    setRows((current) => current.filter((row) => row.id !== id));
    toast.success("连接器已删除");
  };

  const renderAuthFields = () => {
    if (form.auth === "Bearer Token") {
      return <FormField label="Token"><Input value="••••••••••••••••" readOnly /></FormField>;
    }
    if (form.auth === "API Key") {
      return (
        <div className="grid gap-4 md:grid-cols-2">
          <FormField label="Header 名称"><Input defaultValue="X-API-Key" /></FormField>
          <FormField label="API Key"><Input value="••••••••••••••••" readOnly /></FormField>
        </div>
      );
    }
    if (form.auth === "Basic Auth") {
      return (
        <div className="grid gap-4 md:grid-cols-2">
          <FormField label="用户名"><Input defaultValue="toolhub" /></FormField>
          <FormField label="密码"><Input value="••••••••••••" readOnly /></FormField>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="连接器"
        actions={
          <Button onClick={startCreate}>
            <Plus className="h-4 w-4" />
            新建连接器
          </Button>
        }
      />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>连接器列表</CardTitle>
          <div className="relative w-full max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input className="pl-9" placeholder="搜索连接器、类型、状态、地址" value={keyword} onChange={(event) => setKeyword(event.target.value)} />
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full min-w-[1000px] text-left text-sm">
            <thead className="border-y border-slate-200 bg-slate-50 text-xs text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">连接器名称</th>
                <th className="px-4 py-3 font-medium">类型</th>
                <th className="px-4 py-3 font-medium">状态</th>
                <th className="px-4 py-3 font-medium">Base URL</th>
                <th className="px-4 py-3 font-medium">OpenAPI Spec URL</th>
                <th className="px-4 py-3 font-medium">Authentication</th>
                <th className="px-4 py-3 font-medium">关联工具</th>
                <th className="px-4 py-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((connector) => (
                <tr key={connector.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="font-medium">{connector.name}</div>
                    <div className="mt-1 text-xs text-slate-500">最近检测 {connector.lastChecked}</div>
                  </td>
                  <td className="px-4 py-3">{connector.type}</td>
                  <td className="px-4 py-3"><StatusBadge status={connector.status} /></td>
                  <td className="px-4 py-3 text-slate-500">{connector.baseUrl}</td>
                  <td className="px-4 py-3 text-slate-500">{connector.specUrl || "-"}</td>
                  <td className="px-4 py-3">{connector.auth}</td>
                  <td className="px-4 py-3">{connector.toolCount}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => toast.success("测试连接成功")}>
                        <TestTube2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => startEdit(connector)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteConnector(connector.id)}>
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
          title={dialogMode === "create" ? "新建连接器" : "编辑连接器"}
          width="xl"
          onClose={() => setDialogMode(null)}
          footer={
            <>
              <Button variant="outline" onClick={() => toast.success("测试连接成功")}>
                <TestTube2 className="h-4 w-4" />
                测试连接
              </Button>
              <Button onClick={saveConnector}>保存</Button>
            </>
          }
        >
          <div className="space-y-5">
            <section className="grid gap-4 md:grid-cols-2">
              <FormField label="连接器名称">
                <Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
              </FormField>
              <FormField label="连接器类型">
                <select className="h-9 rounded-md border border-slate-200 px-3 text-sm" value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })}>
                  <option>OpenAPI</option>
                  <option>REST API</option>
                  <option>自定义 HTTP</option>
                </select>
              </FormField>
              <FormField label="Base URL">
                <Input value={form.baseUrl} onChange={(event) => setForm({ ...form, baseUrl: event.target.value })} />
              </FormField>
              <FormField label="OpenAPI Spec URL">
                <Input value={form.specUrl} onChange={(event) => setForm({ ...form, specUrl: event.target.value })} />
              </FormField>
              <FormField label="Health Check Path">
                <Input value={form.health} onChange={(event) => setForm({ ...form, health: event.target.value })} />
              </FormField>
              <FormField label="负责人">
                <Input value={form.owner} onChange={(event) => setForm({ ...form, owner: event.target.value })} />
              </FormField>
              <FormField label="Authentication">
                <select className="h-9 rounded-md border border-slate-200 px-3 text-sm" value={form.auth} onChange={(event) => setForm({ ...form, auth: event.target.value })}>
                  <option>Bearer Token</option>
                  <option>API Key</option>
                  <option>Basic Auth</option>
                  <option>None</option>
                </select>
              </FormField>
              <FormField label="状态">
                <select className="h-9 rounded-md border border-slate-200 px-3 text-sm" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
                  <option>正常</option>
                  <option>异常</option>
                </select>
              </FormField>
            </section>
            {renderAuthFields()}
            <section className="rounded-lg border border-slate-200">
              <div className="border-b border-slate-200 p-3 text-sm font-semibold">接口清单预览</div>
              <div className="divide-y divide-slate-100">
                {(form.endpoints.length ? form.endpoints : ["GET /health", "POST /example/search"]).map((endpoint) => (
                  <div key={endpoint} className="px-3 py-2 text-sm">{endpoint}</div>
                ))}
              </div>
            </section>
          </div>
        </Dialog>
      ) : null}
    </div>
  );
}
