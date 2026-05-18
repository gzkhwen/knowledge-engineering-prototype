import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Toaster } from "sonner";
import { AppShell } from "./components/shared/app-shell";
import { DashboardPage } from "./app/pages/dashboard-page";
import { McpServicesPage } from "./app/pages/mcp-services-page";
import { ToolsPage } from "./app/pages/tools-page";
import { ConnectorsPage } from "./app/pages/connectors-page";
import { LogsPage } from "./app/pages/logs-page";
import { SettingsPage } from "./app/pages/settings-page";
import "./index.css";

const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <AppShell />,
      children: [
        { index: true, element: <DashboardPage /> },
        { path: "mcp-services", element: <McpServicesPage /> },
        { path: "tools", element: <ToolsPage /> },
        { path: "connectors", element: <ConnectorsPage /> },
        { path: "logs", element: <LogsPage /> },
        { path: "settings", element: <SettingsPage /> },
      ],
    },
  ],
  { basename: import.meta.env.BASE_URL },
);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
    <Toaster richColors position="top-right" />
  </React.StrictMode>,
);
