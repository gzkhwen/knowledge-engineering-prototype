import { Outlet } from "react-router";

// Project detail is now handled by ClientLayout (sidebar + project selector in navbar).
// This component is a simple passthrough.
export function ClientProjectDetail() {
  return <Outlet />;
}
