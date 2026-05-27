import { Outlet, Link, useLocation, useNavigate } from "react-router";
import {
  Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  AppBar, Toolbar, Typography, IconButton, Menu, MenuItem, Divider, Chip,
} from "@mui/material";
import {
  Category, Description, AccountCircle, Logout, ManageAccounts,
  Engineering, Settings, Hub, Extension, CloudQueue,
} from "@mui/icons-material";
import { useState, useEffect } from "react";
import { User } from "../types";

const DRAWER_WIDTH = 200;

const menuItems = [
  { path: "/admin/classification", label: "分类管理", icon: <Category sx={{ fontSize: 16 }} /> },
  { path: "/admin/template",       label: "模板管理", icon: <Description sx={{ fontSize: 16 }} /> },
  {
    path: "/admin/mcp-services",
    label: "MCP服务管理",
    icon: <CloudQueue sx={{ fontSize: 16 }} />,
  },
  {
    path: "/admin/tools",
    label: "工具管理",
    icon: <Extension sx={{ fontSize: 16 }} />,
  },
  {
    path: "/admin/tool-hub",
    label: "工具 Hub",
    icon: <Hub sx={{ fontSize: 16 }} />,
    hidden: true,
    children: [
      { path: "/admin/tool-hub/mcp-services", label: "MCP 服务" },
      { path: "/admin/tool-hub", label: "工具库" },
      { path: "/admin/tool-hub/connectors", label: "连接器" },
      { path: "/admin/tool-hub/run-records", label: "调用记录" },
    ],
  },
];

export function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  useEffect(() => {
    const str = localStorage.getItem("currentUser");
    if (str) setCurrentUser(JSON.parse(str));
  }, []);

  const open = Boolean(anchorEl);
  const handleAvatarClick = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const handleLogout = () => { localStorage.removeItem("currentUser"); navigate("/"); };

  return (
    <Box sx={{ display: "flex", height: "100vh", bgcolor: "#f5f7fa" }}>
      {/* ── Top bar ── */}
      <AppBar position="fixed" elevation={0}
        sx={{ zIndex: (t) => t.zIndex.drawer + 1, bgcolor: "#ffffff", color: "#111827", borderBottom: "1px solid #e8eaed", boxShadow: "none" }}>
        <Toolbar sx={{ minHeight: "56px !important", px: "20px !important" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, mr: 3 }}>
            <Engineering sx={{ fontSize: 20, color: "#3b82f6" }} />
            <Typography sx={{ fontSize: "15px", fontWeight: 600, color: "#1e293b", letterSpacing: "-0.01em" }}>
              知识工程平台
            </Typography>
            <Chip label="管理端" size="small"
              sx={{ height: 18, fontSize: "10px", bgcolor: "#eff6ff", color: "#2563eb", border: "none", "& .MuiChip-label": { px: 0.75 } }} />
          </Box>
          <Box sx={{ flexGrow: 1 }} />
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography sx={{ fontSize: "13px", color: "#94a3b8" }}>
              {currentUser?.displayName || "管理员"}
            </Typography>
            <IconButton onClick={handleAvatarClick} size="small"
              sx={{ color: "#94a3b8", width: 32, height: 32, "&:hover": { bgcolor: "#f1f5f9", color: "#64748b" } }}>
              <AccountCircle sx={{ fontSize: 20 }} />
            </IconButton>
            <Menu anchorEl={anchorEl} open={open} onClose={handleClose}
              PaperProps={{ elevation: 0, sx: { mt: 1, borderRadius: "8px", border: "1px solid #e8eaed", boxShadow: "0 4px 16px rgba(0,0,0,0.06)", minWidth: 176 } }}>
              <Box sx={{ px: 2, py: 1, borderBottom: "1px solid #f3f4f6" }}>
                <Typography sx={{ fontSize: "11px", color: "#94a3b8", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>切换端</Typography>
              </Box>
              <MenuItem onClick={() => { navigate("/ops"); handleClose(); }}
                sx={{ fontSize: "13px", color: "#374151", gap: 1.5, py: 1, "&:hover": { bgcolor: "#f8f9fb" } }}>
                <ManageAccounts sx={{ fontSize: 16, color: "#8b5cf6" }} /> 运营端
              </MenuItem>
              <MenuItem onClick={() => { navigate("/client"); handleClose(); }}
                sx={{ fontSize: "13px", color: "#374151", gap: 1.5, py: 1, "&:hover": { bgcolor: "#f8f9fb" } }}>
                <Settings sx={{ fontSize: 16, color: "#10b981" }} /> 客户端
              </MenuItem>
              <Divider sx={{ borderColor: "#f3f4f6", my: 0.5 }} />
              <MenuItem onClick={() => { handleLogout(); handleClose(); }}
                sx={{ fontSize: "13px", color: "#ef4444", gap: 1.5, py: 1, "&:hover": { bgcolor: "#fef2f2" } }}>
                <Logout sx={{ fontSize: 16 }} /> 退出登录
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* ── Sidebar ── */}
      <Drawer variant="permanent"
        sx={{ width: DRAWER_WIDTH, flexShrink: 0, "& .MuiDrawer-paper": { width: DRAWER_WIDTH, boxSizing: "border-box", bgcolor: "#f8f9fb", borderRight: "1px solid #e8eaed", pt: "56px" } }}>
        <Box sx={{ py: 1.5, px: 1.25 }}>
          <List disablePadding>
            {menuItems.filter((item) => !item.hidden).map((item) => {
              const selected = item.children
                ? item.children.some((child) => child.path === location.pathname || (child.path === "/admin/tool-hub" && /^\/admin\/tool-hub\/(?!run-records|mcp-services|connectors)/.test(location.pathname)))
                : location.pathname.startsWith(item.path);
              return (
                <Box key={item.path} sx={{ mb: 0.25 }}>
                  <ListItem disablePadding>
                    <ListItemButton component={item.children ? "div" : Link} to={item.children ? undefined : item.path} selected={selected}
                      sx={{
                        borderRadius: "6px", py: 0.75, px: 1.25, minHeight: 36,
                        borderLeft: selected ? "2px solid #3b82f6" : "2px solid transparent",
                        cursor: item.children ? "default" : "pointer",
                        "&:hover": { bgcolor: item.children ? "transparent" : "#eef0f4" },
                        "&.Mui-selected": { bgcolor: item.children ? "transparent" : "#e8edf5", "&:hover": { bgcolor: item.children ? "transparent" : "#e8edf5" } },
                      }}>
                      <ListItemIcon sx={{ minWidth: 28, color: selected ? "#3b82f6" : "#94a3b8" }}>
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText primary={item.label}
                        primaryTypographyProps={{ fontSize: "13px", fontWeight: selected ? 600 : 400, color: selected ? "#1e40af" : "#64748b" }} />
                    </ListItemButton>
                  </ListItem>
                  {item.children?.map((child) => {
                    const childSelected = child.path === "/admin/tool-hub"
                      ? location.pathname === "/admin/tool-hub" || /^\/admin\/tool-hub\/(?!run-records|mcp-services|connectors)/.test(location.pathname)
                      : location.pathname.startsWith(child.path);
                    return (
                      <ListItem key={child.path} disablePadding sx={{ pl: 3.5, mt: 0.25 }}>
                        <ListItemButton component={Link} to={child.path} selected={childSelected}
                          sx={{
                            borderRadius: "6px", py: 0.625, px: 1, minHeight: 32,
                            "&:hover": { bgcolor: "#eef0f4" },
                            "&.Mui-selected": { bgcolor: "#e8edf5", "&:hover": { bgcolor: "#e8edf5" } },
                          }}>
                          <ListItemText primary={child.label}
                            primaryTypographyProps={{ fontSize: "12px", fontWeight: childSelected ? 600 : 400, color: childSelected ? "#1e40af" : "#64748b" }} />
                        </ListItemButton>
                      </ListItem>
                    );
                  })}
                </Box>
              );
            })}
          </List>
        </Box>
      </Drawer>

      {/* ── Main content ── */}
      <Box component="main" sx={{ flexGrow: 1, overflow: "auto", bgcolor: "#f5f7fa", pt: "56px" }}>
        <Box sx={{ p: 3 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
