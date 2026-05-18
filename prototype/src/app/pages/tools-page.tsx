import { useMemo, useState } from "react";
import { GitBranch, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { connectors, mcpServices, tools, versions } from "../data/mock-data";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Dialog } from "../../components/shared/dialog";
import { FormField } from "../../components/shared/form-field";
import { PageHeader } from "../../components/shared/page-header";
import { StatusBadge } from "../../components/shared/status-badge";

type ToolRow = (typeof tools)[number];

const defaultInputs = [
  { name: "projectId", source: "Path", type: "string", required: true, defaultValue: "", description: "项目 ID" },
  { name: "includeTemplates", source: "Query", type: "boolean", required: false, defaultValue: "true", description: "是否返回模板" },
];

const defaultOutputs = [
  { name: "projectProfile", path: "$.data.project", type: "object", description: "项目基础信息" },
  { name: "templateList", path: "$.data.templates", type: "array", description: "可用模板列表" },
];

const newToolForm = {
  name: "",
  description: "",
  category: "项目上下文",
  status: "草稿",
  version: "v1-draft",
  connectorId: connectors[0].id,
  connector: connectors[0].name,
  method: "GET",
  path: "",
  mountedServices: [] as string[],
  input: ["projectId"],
  output: ["result"],
};

export function ToolsPage() {
  const [rows, setRows] = useState<ToolRow[]>(tools);
  const [keyword, setKeyword] = useState("");
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | null>(null);
  const [editing, setEditing] = useState<ToolRow | null>(null);
  const [form, setForm] = useState(newToolForm);
  const [inputRows, setInputRows] = useState(defaultInputs);
  const [outputRows, setOutputRows] = useState(defaultOutputs);
  const [versionTool, setVersionTool] = useState<ToolRow | null>(null);

  const filtered = useMemo(
    () => rows.filter((tool) => [tool.name, tool.connector, tool.status, tool.category].some((item) => item.includes(keyword))),
    [rows, keyword],
  );

  const startCreate = () => {
    setEditing(null);
    setForm(newToolForm);
    setInputRows(defaultInputs);
    setOutputRows(defaultOutputs);
    setDialogMode("create");
  };

  const startEdit = (tool: ToolRow) => {
    setEditing(tool);
    setForm(tool);
    setInputRows(tool.input.map((name) => ({ name, source: "Body", type: "string", required: true, defaultValue: "", description: "" })));
    setOutputRows(tool.output.map((name) => ({ name, path: `$.${name}`, type: "string", description: "" })));
    setDialogMode("edit");
  };

  const saveTool = () => {
    const connector = connectors.find((item) => item.id === form.connectorId) ?? connectors[0];
    const next = {
      ...form,
      name: form.name.trim() || "未命名工具",
      connectorId: connector.id,
      connector: connector.name,
      input: inputRows.map((row) => row.name).filter(Boolean),
      output: outputRows.map((row) => row.name).filter(Boolean),
      lastRun: editing?.lastRun ?? "未调用",
    };
    if (editing) {
      setRows((current) => current.map((row) => (row.id === editing.id ? { ...row, ...next } : row)));
      toast.success("工具已更新");
    } else {
      setRows((current) => [{ id: `tool-${Date.now()}`, ...next }, ...current]);
      toast.success("工具草稿已创建");
    }
    setDialogMode(null);
  };

  const deleteTool = (id: string) => {
    setRows((current) => current.filter((row) => row.id !== id));
    toast.success("工具已删除");
  };

  const addInput = () => setInputRows((current) => [...current, { name: "", source: "Body", type: "string", required: false, defaultValue: "", description: "" }]);
  const addOutput = () => setOutputRows((current) => [...current, { name: "", path: "", type: "string", description: "" }]);

  return (
    <div className="space-y-5">
      <PageHeader
        title="工具库"
        actions={
          <Button onClick={startCreate}>
            <Plus className="h-4 w-4" />
            新建工具
          </Button>
        }
      />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>工具列表</CardTitle>
          <div className="relative w-full max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input className="pl-9" placeholder="搜索工具、分类、连接器、状态" value={keyword} onChange={(event) => setKeyword(event.target.value)} />
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full min-w-[1060px] text-left text-sm">
            <thead className="border-y border-slate-200 bg-slate-50 text-xs text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">工具名称</th>
                <th className="px-4 py-3 font-medium">分类</th>
                <th className="px-4 py-3 font-medium">状态</th>
                <th className="px-4 py-3 font-medium">版本</th>
                <th className="px-4 py-3 font-medium">连接器</th>
                <th className="px-4 py-3 font-medium">调用路径</th>
                <th className="px-4 py-3 font-medium">挂载服务</th>
                <th className="px-4 py-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((tool) => (
                <tr key={tool.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="font-medium">{tool.name}</div>
                    <div className="mt-1 max-w-md text-xs text-slate-500">{tool.description}</div>
                  </td>
                  <td className="px-4 py-3">{tool.category}</td>
                  <td className="px-4 py-3"><StatusBadge status={tool.status} /></td>
                  <td className="px-4 py-3">{tool.version}</td>
                  <td className="px-4 py-3">{tool.connector}</td>
                  <td className="px-4 py-3 text-slate-500">{tool.method} {tool.path}</td>
                  <td className="px-4 py-3">{tool.mountedServices.length || "-"}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => setVersionTool(tool)}>
                        <GitBranch className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => startEdit(tool)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteTool(tool.id)}>
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
          title={dialogMode === "create" ? "新建工具" : "编辑工具"}
          width="2xl"
          onClose={() => setDialogMode(null)}
          footer={
            <>
              <Button variant="outline" onClick={() => setDialogMode(null)}>取消</Button>
              <Button onClick={saveTool}>保存</Button>
            </>
          }
        >
          <div className="space-y-5">
            <section className="grid gap-4 md:grid-cols-2">
              <FormField label="工具名称">
                <Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
              </FormField>
              <FormField label="工具分类">
                <Input value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} />
              </FormField>
              <FormField label="连接器">
                <select className="h-9 rounded-md border border-slate-200 px-3 text-sm" value={form.connectorId} onChange={(event) => setForm({ ...form, connectorId: event.target.value })}>
                  {connectors.map((connector) => <option key={connector.id} value={connector.id}>{connector.name}</option>)}
                </select>
              </FormField>
              <FormField label="状态">
                <select className="h-9 rounded-md border border-slate-200 px-3 text-sm" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
                  <option>草稿</option>
                  <option>已发布</option>
                  <option>已废弃</option>
                </select>
              </FormField>
              <FormField label="请求方法">
                <select className="h-9 rounded-md border border-slate-200 px-3 text-sm" value={form.method} onChange={(event) => setForm({ ...form, method: event.target.value })}>
                  <option>GET</option>
                  <option>POST</option>
                  <option>PUT</option>
                  <option>DELETE</option>
                </select>
              </FormField>
              <FormField label="调用路径">
                <Input value={form.path} onChange={(event) => setForm({ ...form, path: event.target.value })} />
              </FormField>
            </section>
            <FormField label="工具描述">
              <Textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
            </FormField>

            <section className="rounded-lg border border-slate-200">
              <div className="flex items-center justify-between border-b border-slate-200 p-3">
                <h3 className="text-sm font-semibold">入参配置</h3>
                <Button variant="outline" size="sm" onClick={addInput}>添加入参</Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[840px] text-sm">
                  <thead className="bg-slate-50 text-xs text-slate-500">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium">字段名</th>
                      <th className="px-3 py-2 text-left font-medium">来源</th>
                      <th className="px-3 py-2 text-left font-medium">类型</th>
                      <th className="px-3 py-2 text-left font-medium">必填</th>
                      <th className="px-3 py-2 text-left font-medium">默认值</th>
                      <th className="px-3 py-2 text-left font-medium">说明</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {inputRows.map((row, index) => (
                      <tr key={index}>
                        <td className="p-2"><Input value={row.name} onChange={(event) => setInputRows((current) => current.map((item, i) => i === index ? { ...item, name: event.target.value } : item))} /></td>
                        <td className="p-2"><Input value={row.source} onChange={(event) => setInputRows((current) => current.map((item, i) => i === index ? { ...item, source: event.target.value } : item))} /></td>
                        <td className="p-2"><Input value={row.type} onChange={(event) => setInputRows((current) => current.map((item, i) => i === index ? { ...item, type: event.target.value } : item))} /></td>
                        <td className="p-2 text-center"><input type="checkbox" checked={row.required} onChange={(event) => setInputRows((current) => current.map((item, i) => i === index ? { ...item, required: event.target.checked } : item))} /></td>
                        <td className="p-2"><Input value={row.defaultValue} onChange={(event) => setInputRows((current) => current.map((item, i) => i === index ? { ...item, defaultValue: event.target.value } : item))} /></td>
                        <td className="p-2"><Input value={row.description} onChange={(event) => setInputRows((current) => current.map((item, i) => i === index ? { ...item, description: event.target.value } : item))} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="rounded-lg border border-slate-200">
              <div className="flex items-center justify-between border-b border-slate-200 p-3">
                <h3 className="text-sm font-semibold">返回字段配置</h3>
                <Button variant="outline" size="sm" onClick={addOutput}>添加返回字段</Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-sm">
                  <thead className="bg-slate-50 text-xs text-slate-500">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium">字段名</th>
                      <th className="px-3 py-2 text-left font-medium">JSON Path</th>
                      <th className="px-3 py-2 text-left font-medium">类型</th>
                      <th className="px-3 py-2 text-left font-medium">说明</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {outputRows.map((row, index) => (
                      <tr key={index}>
                        <td className="p-2"><Input value={row.name} onChange={(event) => setOutputRows((current) => current.map((item, i) => i === index ? { ...item, name: event.target.value } : item))} /></td>
                        <td className="p-2"><Input value={row.path} onChange={(event) => setOutputRows((current) => current.map((item, i) => i === index ? { ...item, path: event.target.value } : item))} /></td>
                        <td className="p-2"><Input value={row.type} onChange={(event) => setOutputRows((current) => current.map((item, i) => i === index ? { ...item, type: event.target.value } : item))} /></td>
                        <td className="p-2"><Input value={row.description} onChange={(event) => setOutputRows((current) => current.map((item, i) => i === index ? { ...item, description: event.target.value } : item))} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <FormField label="发布到 MCP 服务">
              <div className="grid gap-2 rounded-lg border border-slate-200 p-3">
                {mcpServices.map((service) => (
                  <label key={service.id} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={form.mountedServices.includes(service.name)}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          mountedServices: event.target.checked
                            ? [...form.mountedServices, service.name]
                            : form.mountedServices.filter((name) => name !== service.name),
                        })
                      }
                    />
                    {service.name}
                  </label>
                ))}
              </div>
            </FormField>
          </div>
        </Dialog>
      ) : null}

      {versionTool ? (
        <Dialog
          title={`${versionTool.name} 版本管理`}
          width="xl"
          onClose={() => setVersionTool(null)}
          footer={
            <>
              <Button variant="outline" onClick={() => toast.success("已从当前版本复制草稿")}>复制为新版本</Button>
              <Button onClick={() => toast.success("默认版本已切换")}>设为默认版本</Button>
            </>
          }
        >
          <table className="w-full text-left text-sm">
            <thead className="border-y border-slate-200 bg-slate-50 text-xs text-slate-500">
              <tr>
                <th className="px-3 py-2 font-medium">版本</th>
                <th className="px-3 py-2 font-medium">状态</th>
                <th className="px-3 py-2 font-medium">变更说明</th>
                <th className="px-3 py-2 font-medium">更新时间</th>
                <th className="px-3 py-2 font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {versions.map((item) => (
                <tr key={item.version}>
                  <td className="px-3 py-3 font-medium">{item.version}</td>
                  <td className="px-3 py-3"><StatusBadge status={item.status} /></td>
                  <td className="px-3 py-3 text-slate-500">{item.change}</td>
                  <td className="px-3 py-3">{item.updatedAt}</td>
                  <td className="px-3 py-3"><Button variant="outline" size="sm">查看配置</Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Dialog>
      ) : null}
    </div>
  );
}
