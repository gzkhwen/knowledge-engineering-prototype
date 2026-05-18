import { Activity, AlertTriangle, Boxes, PlugZap, Server, Timer } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { PageHeader } from "../../components/shared/page-header";
import { StatusBadge } from "../../components/shared/status-badge";
import { connectors, logs, mcpServices, tools } from "../data/mock-data";

const metrics = [
  { label: "运行中 MCP 服务", value: "1", note: "共 3 个服务", icon: Server },
  { label: "已发布工具", value: "2", note: "1 个草稿待发布", icon: Boxes },
  { label: "健康连接器", value: "2/3", note: "1 个连接器异常", icon: PlugZap },
  { label: "今日调用量", value: "294", note: "平均耗时 742ms", icon: Activity },
];

export function DashboardPage() {
  return (
    <div className="space-y-5">
      <PageHeader
        title="工作台"
      />

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.label}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm text-slate-500">{metric.label}</CardTitle>
                <Icon className="h-4 w-4 text-slate-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold">{metric.value}</div>
                <p className="mt-1 text-sm text-slate-500">{metric.note}</p>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader>
            <CardTitle>核心链路</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-4">
              {[
                ["连接器", connectors.length],
                ["工具库", tools.length],
                ["MCP 服务", mcpServices.length],
                ["调用日志", logs.length],
              ].map(([title, count]) => (
                <div key={title} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <div className="text-sm font-semibold text-slate-950">{title}</div>
                  <div className="mt-1 text-2xl font-semibold">{count}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>待关注事项</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-3 rounded-lg border border-red-100 bg-red-50 p-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 text-red-600" />
              <div>
                <div className="text-sm font-medium text-red-900">构建结果校验服务异常</div>
                <p className="mt-1 text-xs leading-5 text-red-700">最近一次调用返回 504。</p>
              </div>
            </div>
            <div className="flex gap-3 rounded-lg border border-amber-100 bg-amber-50 p-3">
              <Timer className="mt-0.5 h-4 w-4 text-amber-600" />
              <div>
                <div className="text-sm font-medium text-amber-900">知识工程测试 MCP 密钥待轮换</div>
                <p className="mt-1 text-xs leading-5 text-amber-700">服务当前停用。</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>MCP 服务状态</CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-slate-100">
            {mcpServices.map((service) => (
              <div key={service.id} className="flex items-center justify-between gap-3 py-3">
                <div>
                  <div className="text-sm font-medium">{service.name}</div>
                  <div className="mt-1 text-xs text-slate-500">{service.endpoint}</div>
                </div>
                <StatusBadge status={service.status} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>最近调用</CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-slate-100">
            {logs.map((log) => (
              <div key={log.id} className="grid gap-2 py-3 sm:grid-cols-[1fr_80px_80px]">
                <div>
                  <div className="text-sm font-medium">{log.tool}</div>
                  <div className="mt-1 text-xs text-slate-500">{log.time} / {log.version}</div>
                </div>
                <StatusBadge status={log.status} />
                <div className="text-sm text-slate-500">{log.duration}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
