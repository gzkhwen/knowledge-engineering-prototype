import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { logs } from "../data/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { DetailPanel } from "../../components/shared/detail-panel";
import { FieldRow } from "../../components/shared/field-row";
import { StatusBadge } from "../../components/shared/status-badge";

export function LogsPage() {
  const [keyword, setKeyword] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = logs.find((log) => log.id === selectedId);
  const filtered = useMemo(
    () => logs.filter((log) => [log.service, log.tool, log.connector, log.status].some((item) => item.includes(keyword))),
    [keyword],
  );

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>日志列表</CardTitle>
          <div className="relative w-full max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input className="pl-9" placeholder="搜索服务、工具、连接器、状态" value={keyword} onChange={(event) => setKeyword(event.target.value)} />
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full min-w-[960px] text-left text-sm">
            <thead className="border-y border-slate-200 bg-slate-50 text-xs text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">调用时间</th>
                <th className="px-4 py-3 font-medium">MCP 服务</th>
                <th className="px-4 py-3 font-medium">工具</th>
                <th className="px-4 py-3 font-medium">版本</th>
                <th className="px-4 py-3 font-medium">连接器</th>
                <th className="px-4 py-3 font-medium">状态</th>
                <th className="px-4 py-3 font-medium">耗时</th>
                <th className="px-4 py-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">{log.time}</td>
                  <td className="px-4 py-3">{log.service}</td>
                  <td className="px-4 py-3 font-medium">{log.tool}</td>
                  <td className="px-4 py-3">{log.version}</td>
                  <td className="px-4 py-3">{log.connector}</td>
                  <td className="px-4 py-3"><StatusBadge status={log.status} /></td>
                  <td className="px-4 py-3">{log.duration}</td>
                  <td className="px-4 py-3">
                    <button className="text-sm font-medium text-slate-950 underline-offset-4 hover:underline" onClick={() => setSelectedId(log.id)}>
                      查看详情
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {selected ? (
      <DetailPanel title={`${selected.tool} 调用详情`} subtitle={selected.time} onClose={() => setSelectedId(null)}>
        <div className="space-y-5">
          <section>
            <h3 className="text-sm font-semibold">调用概览</h3>
            <div className="mt-2 rounded-lg border border-slate-200 p-3">
              <FieldRow label="调用状态" value={<StatusBadge status={selected.status} />} />
              <FieldRow label="MCP 服务" value={selected.service} />
              <FieldRow label="工具版本" value={selected.version} />
              <FieldRow label="连接器" value={selected.connector} />
              <FieldRow label="调用方" value={selected.caller} />
              <FieldRow label="耗时" value={selected.duration} />
              {selected.error ? <FieldRow label="错误摘要" value={selected.error} /> : null}
            </div>
          </section>
          <section className="grid gap-3">
            <div>
              <h3 className="text-sm font-semibold">请求入参</h3>
              <pre className="mt-2 overflow-auto rounded-lg bg-slate-950 p-3 text-xs leading-6 text-slate-100">{selected.request}</pre>
            </div>
            <div>
              <h3 className="text-sm font-semibold">返回结果</h3>
              <pre className="mt-2 overflow-auto rounded-lg bg-slate-950 p-3 text-xs leading-6 text-slate-100">{selected.response}</pre>
            </div>
          </section>
        </div>
      </DetailPanel>
      ) : null}
    </div>
  );
}
