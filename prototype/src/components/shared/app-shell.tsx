import { NavLink, Outlet } from "react-router-dom";
import {
  Activity,
  Boxes,
  DatabaseZap,
  LayoutDashboard,
  PlugZap,
  ScrollText,
  Server,
  Settings,
} from "lucide-react";
import { cn } from "../../lib/utils";

const navItems = [
  { to: "/", label: "工作台", icon: LayoutDashboard },
  { to: "/mcp-services", label: "MCP 服务", icon: Server },
  { to: "/tools", label: "工具库", icon: Boxes },
  { to: "/connectors", label: "连接器", icon: PlugZap },
  { to: "/logs", label: "调用日志", icon: ScrollText },
  { to: "/settings", label: "系统设置", icon: Settings },
];

export function AppShell() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-slate-200 bg-white lg:block">
        <div className="flex h-14 items-center gap-2 border-b border-slate-200 px-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-950 text-white">
            <DatabaseZap className="h-4 w-4" />
          </div>
          <div>
            <div className="text-sm font-semibold">Tool Hub</div>
            <div className="text-xs text-slate-500">MCP Gateway Prototype</div>
          </div>
        </div>
        <nav className="space-y-1 p-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive ? "bg-slate-950 text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
                  )
                }
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 border-t border-slate-200 p-4">
          <div className="rounded-lg bg-slate-50 p-3">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
              <Activity className="h-3.5 w-3.5 text-emerald-600" />
              知识工程 Agent
            </div>
            <p className="mt-1 text-xs leading-5 text-slate-500">当前一期默认授权对象，可在 MCP 服务中查看绑定状态。</p>
          </div>
        </div>
      </aside>
      <main className="lg:pl-64">
        <div className="border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
          <div className="flex items-center gap-2">
            <DatabaseZap className="h-5 w-5" />
            <span className="text-sm font-semibold">Tool Hub</span>
          </div>
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  cn(
                    "whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium",
                    isActive ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-700",
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
