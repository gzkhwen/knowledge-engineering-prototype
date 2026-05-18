import { useMemo, useState } from "react";
import { GitBranch, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { connectors, tools, toolCategories } from "../data/mock-data";
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

const versionRows = [
  { version: "v3", status: "草稿", change: "新增素材范围参数，未发布", updatedAt: "2026-05-18 09:30" },
  { version: "v2", status: "已发布", change: "兼容 OpenAPI 重导入后的字段映射", updatedAt: "2026-05-17 16:15" },
  { version: "v1", status: "已停用", change: "首个可用版本", updatedAt: "2026-05-14 11:20" },
];

export function ToolsPage() {
  const [rows, setRows] = useState<ToolRow[]>(tools);
  const [keyword, setKeyword] = useState("");
  const [activeCategory, setActiveCategory] = useState("全部工具");
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | null>(null);
  const [editing, setEditing] = useState<ToolRow | null>(null);
  const [form, setForm] = useState(newToolForm);
  const [inputRows, setInputRows] = useState(defaultInputs);
  const [outputRows, setOutputRows] = useState(defaultOutputs);
  const [versionTool, setVersionTool] = useState<ToolRow | null>(null);

  const filtered = useMemo(
    () =>
      rows.filter((tool) => {
        const matchCategory = activeCategory === "全部工具" || tool.category === activeCategory;
        const matchKeyword = [tool.name, tool.connector, tool.status, tool.category].some((item) => item.includes(keyword));
        return matchCategory && matchKeyword;
      }),
    [rows, keyword, activeCategory],
  );

  const categoryCounts = useMemo(
    () =>
      toolCategories.map((category) => ({
        ...category,
        count: category.name === "全部工具" ? rows.length : rows.filter((tool) => tool.category === category.name).length,
      })),
    [rows],
  );

  const startCreate = () => {
    setEditing(null);
    setForm({ ...newToolForm, category: activeCategory === "全部工具" ? "项目上下文" : activeCategory });
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
      status: editing?.status ?? "草稿",
      input: inputRows.map((row) => row.name).filter(Boolean),
      output: outputRows.map((row) => row.name).filter(Boolean),
      lastRun: editing?.lastRun ?? "未调用",
      mountedServices: editing?.mountedServices ?? [],
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

  const versionActions = (status: string) => {
    if (status === "草稿") return ["编辑", "调试", "删除"];
    if (status === "待发布") return ["编辑", "发布", "删除"];
    if (status === "已发布") return ["停用", "复制"];
    return ["复制", "查看"];
  };

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

      <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>分类管理</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {categoryCounts.map((category) => (
              <button
                key={category.id}
                className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm ${activeCategory === category.name ? "bg-slate-950 text-white" : "hover:bg-slate-100"}`}
                onClick={() => setActiveCategory(category.name)}
              >
                <span>{category.name}</span>
                <span className={activeCategory === category.name ? "text-white" : "text-slate-500"}>{category.count}</span>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>工具列表</CardTitle>
            <div className="relative w-full max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input className="pl-9" placeholder="搜索工具、连接器、状态" value={keyword} onChange={(event) => setKeyword(event.target.value)} />
            </div>
          </CardHeader>
          <CardContent className="overflow-x-auto p-0">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead className="border-y border-slate-200 bg-slate-50 text-xs text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">工具名称</th>
                  <th className="px-4 py-3 font-medium">分类</th>
                  <th className="px-4 py-3 font-medium">状态</th>
                  <th className="px-4 py-3 font-medium">版本</th>
                  <th className="px-4 py-3 font-medium">连接器</th>
                  <th className="px-4 py-3 font-medium">调用路径</th>
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
      </div>

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
          </div>
        </Dialog>
      ) : null}

      {versionTool ? (
        <div className="fixed inset-0 z-40 bg-slate-950/20">
          <aside className="ml-auto flex h-full w-full max-w-3xl flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 p-5">
              <div>
                <h2 className="text-lg font-semibold">{versionTool.name}</h2>
                <p className="mt-1 text-sm text-slate-500">版本列表</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setVersionTool(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1 overflow-auto p-5">
              <div className="mb-4 flex justify-end">
                <Button onClick={() => toast.success("已从当前版本复制草稿")}>
                  <Plus className="h-4 w-4" />
                  新建版本
                </Button>
              </div>
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
                  {versionRows.map((item) => (
                    <tr key={item.version}>
                      <td className="px-3 py-3 font-medium">{item.version}</td>
                      <td className="px-3 py-3"><StatusBadge status={item.status} /></td>
                      <td className="px-3 py-3 text-slate-500">{item.change}</td>
                      <td className="px-3 py-3">{item.updatedAt}</td>
                      <td className="px-3 py-3">
                        <div className="flex flex-wrap gap-1">
                          {versionActions(item.status).map((action) => (
                            <Button key={action} variant="outline" size="sm" onClick={() => toast.success(`${action}操作已提交`)}>
                              {action}
                            </Button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </aside>
        </div>
      ) : null}
    </div>
  );
}
