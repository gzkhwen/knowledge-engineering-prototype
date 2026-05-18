import { useState } from "react";
import { Plus, RefreshCw, TestTube2 } from "lucide-react";
import { toast } from "sonner";
import { connectors } from "../data/mock-data";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { DetailPanel } from "../../components/shared/detail-panel";
import { FieldRow } from "../../components/shared/field-row";
import { PageHeader } from "../../components/shared/page-header";
import { StatusBadge } from "../../components/shared/status-badge";

export function ConnectorsPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const selected = connectors.find((connector) => connector.id === selectedId);

  return (
    <div className="space-y-5">
      <PageHeader
        title="连接器"
        description="统一管理外部 API 连接、认证方式、健康检查和接口清单。工具库基于已配置连接器选择调用路径并生成工具契约。"
        actions={
          <Button onClick={() => setCreating(true)}>
            <Plus className="h-4 w-4" />
            新建连接器
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>连接器列表</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 lg:grid-cols-3">
          {connectors.map((connector) => (
            <button
              key={connector.id}
              className="rounded-lg border border-slate-200 bg-white p-4 text-left transition-colors hover:bg-slate-50"
              onClick={() => setSelectedId(connector.id)}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold">{connector.name}</div>
                  <div className="mt-1 text-xs text-slate-500">{connector.type} / {connector.auth}</div>
                </div>
                <StatusBadge status={connector.status} />
              </div>
              <div className="mt-4 space-y-2 text-sm text-slate-500">
                <div>{connector.baseUrl}</div>
                <div>关联工具 {connector.toolCount} 个</div>
                <div>最近检测 {connector.lastChecked}</div>
              </div>
            </button>
          ))}
        </CardContent>
      </Card>

      {selected ? (
      <DetailPanel title={selected.name} subtitle="连接器详情" onClose={() => setSelectedId(null)}>
        <div className="space-y-5">
          <section>
            <h3 className="text-sm font-semibold">连接配置</h3>
            <div className="mt-2 rounded-lg border border-slate-200 p-3">
              <FieldRow label="状态" value={<StatusBadge status={selected.status} />} />
              <FieldRow label="类型" value={selected.type} />
              <FieldRow label="Base URL" value={selected.baseUrl} />
              <FieldRow label="认证方式" value={selected.auth} />
              <FieldRow label="健康检查" value={selected.health} />
              <FieldRow label="负责人" value={selected.owner} />
            </div>
          </section>
          <section>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">接口清单</h3>
              <Button variant="outline" size="sm" onClick={() => toast.info("已重新拉取 OpenAPI 文档")}>
                <RefreshCw className="h-4 w-4" />
                重新导入
              </Button>
            </div>
            <div className="mt-2 divide-y divide-slate-100 rounded-lg border border-slate-200">
              {selected.endpoints.map((endpoint) => (
                <div key={endpoint} className="p-3 text-sm">{endpoint}</div>
              ))}
            </div>
          </section>
          <Button variant="outline" onClick={() => toast.success("测试连接成功")}>
            <TestTube2 className="h-4 w-4" />
            测试连接
          </Button>
        </div>
      </DetailPanel>
      ) : null}

      {creating ? (
        <DetailPanel title="新建连接器" subtitle="一期支持 REST API、OpenAPI 导入和自定义 HTTP" onClose={() => setCreating(false)}>
          <div className="space-y-4">
            <select className="h-9 w-full rounded-md border border-slate-200 px-3 text-sm">
              <option>OpenAPI</option>
              <option>REST API</option>
              <option>自定义 HTTP</option>
            </select>
            <Input placeholder="连接器名称" />
            <Input placeholder="Base URL 或 OpenAPI 地址" />
            <select className="h-9 w-full rounded-md border border-slate-200 px-3 text-sm">
              <option>Bearer Token</option>
              <option>API Key</option>
              <option>Basic Auth</option>
            </select>
            <Input placeholder="健康检查路径，例如 /health" />
            <Button onClick={() => { setCreating(false); toast.success("连接器已保存，接口清单已生成"); }}>
              保存并测试连接
            </Button>
          </div>
        </DetailPanel>
      ) : null}
    </div>
  );
}
