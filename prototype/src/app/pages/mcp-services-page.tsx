import { useState } from "react";
import { Copy, Plus, Power, Server } from "lucide-react";
import { toast } from "sonner";
import { mcpServices, logs } from "../data/mock-data";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { DetailPanel } from "../../components/shared/detail-panel";
import { FieldRow } from "../../components/shared/field-row";
import { PageHeader } from "../../components/shared/page-header";
import { StatusBadge } from "../../components/shared/status-badge";

export function McpServicesPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const selected = mcpServices.find((service) => service.id === selectedId);

  return (
    <div className="space-y-5">
      <PageHeader
        title="MCP 服务"
        description="管理对 Agent 暴露的 MCP Endpoint。一个 MCP 服务可以挂载多个已发布工具，并配置授权对象、访问凭证和运行状态。"
        actions={
          <Button onClick={() => setCreating(true)}>
            <Plus className="h-4 w-4" />
            新建 MCP 服务
          </Button>
        }
      />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>服务列表</CardTitle>
          <Input className="max-w-xs" placeholder="搜索服务名称或 Endpoint" />
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full min-w-[920px] text-left text-sm">
            <thead className="border-y border-slate-200 bg-slate-50 text-xs text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">服务名称</th>
                <th className="px-4 py-3 font-medium">状态</th>
                <th className="px-4 py-3 font-medium">Endpoint</th>
                <th className="px-4 py-3 font-medium">授权对象</th>
                <th className="px-4 py-3 font-medium">工具数</th>
                <th className="px-4 py-3 font-medium">今日调用</th>
                <th className="px-4 py-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mcpServices.map((service) => (
                <tr key={service.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium">{service.name}</td>
                  <td className="px-4 py-3"><StatusBadge status={service.status} /></td>
                  <td className="px-4 py-3 text-slate-500">{service.endpoint}</td>
                  <td className="px-4 py-3">{service.authTarget}</td>
                  <td className="px-4 py-3">{service.tools.length}</td>
                  <td className="px-4 py-3">{service.callsToday}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setSelectedId(service.id)}>查看</Button>
                      <Button variant="ghost" size="icon" onClick={() => toast.success("Endpoint 已复制")}>
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => toast.info("服务状态已切换")}>
                        <Power className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {selected ? (
      <DetailPanel title={selected.name} subtitle="MCP 服务详情" onClose={() => setSelectedId(null)}>
        <div className="space-y-5">
          <section>
            <h3 className="text-sm font-semibold">基础信息</h3>
            <div className="mt-2 rounded-lg border border-slate-200 p-3">
              <FieldRow label="服务状态" value={<StatusBadge status={selected.status} />} />
              <FieldRow label="Endpoint" value={selected.endpoint} />
              <FieldRow label="授权对象" value={selected.authTarget} />
              <FieldRow label="访问密钥" value={selected.keyStatus} />
              <FieldRow label="最近调用" value={selected.lastCall} />
            </div>
          </section>
          <section>
            <h3 className="text-sm font-semibold">已挂载工具</h3>
            <div className="mt-2 space-y-2">
              {selected.tools.map((tool) => (
                <div key={tool} className="rounded-lg border border-slate-200 p-3 text-sm">{tool}</div>
              ))}
            </div>
          </section>
          <section>
            <h3 className="text-sm font-semibold">最近日志</h3>
            <div className="mt-2 divide-y divide-slate-100 rounded-lg border border-slate-200">
              {logs.filter((log) => log.service === selected.name).map((log) => (
                <div key={log.id} className="p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{log.tool}</span>
                    <StatusBadge status={log.status} />
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{log.time} / {log.duration}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </DetailPanel>
      ) : null}

      {creating ? (
        <DetailPanel title="新建 MCP 服务" subtitle="一期默认授权知识工程 Agent" onClose={() => setCreating(false)}>
          <div className="space-y-4">
            <Input placeholder="服务名称，例如 知识工程 Agent MCP" />
            <Input value="知识工程 Agent" readOnly />
            <div className="rounded-lg border border-slate-200 p-3">
              <div className="text-sm font-medium">选择挂载工具</div>
              <div className="mt-3 space-y-2 text-sm">
                <label className="flex items-center gap-2"><input type="checkbox" defaultChecked /> 查询项目上下文</label>
                <label className="flex items-center gap-2"><input type="checkbox" defaultChecked /> 生成处理方案</label>
                <label className="flex items-center gap-2"><input type="checkbox" /> 检索原始素材</label>
              </div>
            </div>
            <Button onClick={() => { setCreating(false); toast.success("MCP 服务草稿已创建"); }}>
              <Server className="h-4 w-4" />
              生成服务草稿
            </Button>
          </div>
        </DetailPanel>
      ) : null}
    </div>
  );
}
