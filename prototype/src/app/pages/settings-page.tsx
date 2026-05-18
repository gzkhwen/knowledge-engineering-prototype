import { KeyRound, ShieldCheck, SlidersHorizontal } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { PageHeader } from "../../components/shared/page-header";
import { StatusBadge } from "../../components/shared/status-badge";

export function SettingsPage() {
  return (
    <div className="space-y-5">
      <PageHeader
        title="系统设置"
        description="一期只展示访问密钥、角色权限和环境配置入口，用于说明 Tool Hub 的治理边界。"
      />
      <section className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><KeyRound className="h-4 w-4" /> 访问密钥</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input value="th_live_**********************" readOnly />
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">知识工程 Agent</span>
              <StatusBadge status="正常" />
            </div>
            <Button variant="outline">轮换密钥</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> 角色权限</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between"><span>平台管理员</span><span className="text-slate-500">全部权限</span></div>
            <div className="flex justify-between"><span>工具配置员</span><span className="text-slate-500">连接器 / 工具</span></div>
            <div className="flex justify-between"><span>日志审计员</span><span className="text-slate-500">只读日志</span></div>
            <Button variant="outline">配置角色</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><SlidersHorizontal className="h-4 w-4" /> 环境配置</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between"><span>当前环境</span><span className="font-medium">prod</span></div>
            <div className="flex justify-between"><span>默认超时</span><span className="font-medium">30s</span></div>
            <div className="flex justify-between"><span>日志保留</span><span className="font-medium">180 天</span></div>
            <Button variant="outline">调整配置</Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
