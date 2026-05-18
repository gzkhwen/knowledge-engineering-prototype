import { useMemo, useState } from "react";
import { Plus, Rocket, Search } from "lucide-react";
import { toast } from "sonner";
import { connectors, tools, versions } from "../data/mock-data";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { DetailPanel } from "../../components/shared/detail-panel";
import { FieldRow } from "../../components/shared/field-row";
import { PageHeader } from "../../components/shared/page-header";
import { StatusBadge } from "../../components/shared/status-badge";

export function ToolsPage() {
  const [keyword, setKeyword] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const selected = tools.find((tool) => tool.id === selectedId);
  const filtered = useMemo(
    () => tools.filter((tool) => [tool.name, tool.connector, tool.status].some((item) => item.includes(keyword))),
    [keyword],
  );

  return (
    <div className="space-y-5">
      <PageHeader
        title="工具库"
        description="把连接器中的接口能力包装为 Agent 可理解的工具契约，管理参数映射、返回结果、版本状态和 MCP 服务挂载关系。"
        actions={
          <Button onClick={() => setCreating(true)}>
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
            <Input className="pl-9" placeholder="搜索工具、连接器、状态" value={keyword} onChange={(event) => setKeyword(event.target.value)} />
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="border-y border-slate-200 bg-slate-50 text-xs text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">工具名称</th>
                <th className="px-4 py-3 font-medium">状态</th>
                <th className="px-4 py-3 font-medium">当前版本</th>
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
                  <td className="px-4 py-3"><StatusBadge status={tool.status} /></td>
                  <td className="px-4 py-3">{tool.version}</td>
                  <td className="px-4 py-3">{tool.connector}</td>
                  <td className="px-4 py-3 text-slate-500">{tool.method} {tool.path}</td>
                  <td className="px-4 py-3">{tool.mountedServices.length || "-"}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setSelectedId(tool.id)}>查看</Button>
                      <Button variant="ghost" size="sm" onClick={() => toast.success("已复制当前版本为新草稿")}>新建版本</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {selected ? (
      <DetailPanel title={selected.name} subtitle="工具契约与版本详情" onClose={() => setSelectedId(null)}>
        <div className="space-y-5">
          <section>
            <h3 className="text-sm font-semibold">工具配置</h3>
            <div className="mt-2 rounded-lg border border-slate-200 p-3">
              <FieldRow label="状态" value={<StatusBadge status={selected.status} />} />
              <FieldRow label="当前版本" value={selected.version} />
              <FieldRow label="所属连接器" value={selected.connector} />
              <FieldRow label="调用路径" value={`${selected.method} ${selected.path}`} />
              <FieldRow label="挂载服务" value={selected.mountedServices.join("、") || "-"} />
            </div>
          </section>
          <section className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-slate-200 p-3">
              <div className="text-sm font-semibold">入参 schema</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {selected.input.map((item) => <span key={item} className="rounded-md bg-slate-100 px-2 py-1 text-xs">{item}</span>)}
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 p-3">
              <div className="text-sm font-semibold">返回结果 schema</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {selected.output.map((item) => <span key={item} className="rounded-md bg-slate-100 px-2 py-1 text-xs">{item}</span>)}
              </div>
            </div>
          </section>
          <section>
            <h3 className="text-sm font-semibold">版本记录</h3>
            <div className="mt-2 divide-y divide-slate-100 rounded-lg border border-slate-200">
              {versions.map((version) => (
                <div key={version.version} className="grid gap-2 p-3 sm:grid-cols-[80px_80px_1fr]">
                  <div className="font-medium">{version.version}</div>
                  <StatusBadge status={version.status} />
                  <div className="text-sm text-slate-500">{version.change} / {version.updatedAt}</div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </DetailPanel>
      ) : null}

      {creating ? (
        <DetailPanel title="新建工具" subtitle="四步流：基本信息 / 连接器与调用方式 / 参数与返回结果 / 发布配置" onClose={() => setCreating(false)}>
          <div className="space-y-5">
            {["1. 基本信息", "2. 选择连接器与调用路径", "3. 参数与返回结果配置", "4. 发布到 MCP 服务"].map((step, index) => (
              <section key={step} className="rounded-lg border border-slate-200 p-4">
                <h3 className="text-sm font-semibold">{step}</h3>
                {index === 0 ? <div className="mt-3 grid gap-3"><Input placeholder="工具名称" /><Input placeholder="工具描述" /></div> : null}
                {index === 1 ? (
                  <div className="mt-3 grid gap-3">
                    <select className="h-9 rounded-md border border-slate-200 px-3 text-sm">
                      {connectors.map((connector) => <option key={connector.id}>{connector.name}</option>)}
                    </select>
                    <Input placeholder="GET /projects/{projectId}" />
                  </div>
                ) : null}
                {index === 2 ? <div className="mt-3 grid gap-3 sm:grid-cols-2"><Input placeholder="入参字段 projectId" /><Input placeholder="返回字段 projectProfile" /></div> : null}
                {index === 3 ? <label className="mt-3 flex items-center gap-2 text-sm"><input type="checkbox" defaultChecked /> 发布到知识工程 Agent MCP</label> : null}
              </section>
            ))}
            <Button onClick={() => { setCreating(false); toast.success("工具草稿已创建"); }}>
              <Rocket className="h-4 w-4" />
              保存工具草稿
            </Button>
          </div>
        </DetailPanel>
      ) : null}
    </div>
  );
}
