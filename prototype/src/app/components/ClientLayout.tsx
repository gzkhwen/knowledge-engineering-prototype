import { Outlet, Link, useNavigate, useLocation, useParams } from "react-router";
import {
  Box, Drawer, AppBar, Toolbar, Typography, IconButton, Menu, MenuItem,
  Divider, Chip, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Select, FormControl,
} from "@mui/material";
import {
  Logout, AccountCircle, Settings, ManageAccounts, Engineering,
  UploadFile, History, CheckCircle, Assignment, FolderOutlined,
} from "@mui/icons-material";
import { useState, useEffect } from "react";
import { User, Project } from "../types";
import { dataStore } from "../store/DataStore";

const DRAWER_WIDTH = 200;

const sidebarItems = [
  { path: "upload",              label: "文件上传",   icon: <UploadFile sx={{ fontSize: 16 }} /> },
  { path: "history",             label: "上传记录",   icon: <History sx={{ fontSize: 16 }} /> },
  { path: "package",             label: "知识包验收", icon: <CheckCircle sx={{ fontSize: 16 }} /> },
  { path: "acceptance-history",  label: "验收记录",   icon: <Assignment sx={{ fontSize: 16 }} /> },
];

export function ClientLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [projects, setProjects] = useState<Project[]>([]);

  // Extract projectId from params (available when nested under /project/:projectId)
  const currentProjectId = params.projectId ?? "";

  useEffect(() => {
    const str = localStorage.getItem("currentUser");
    if (str) setCurrentUser(JSON.parse(str));
    setProjects(dataStore.getProjects().filter(p => p.enabled));
  }, []);

  const open = Boolean(anchorEl);
  const handleAvatarClick = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const handleLogout = () => { localStorage.removeItem("currentUser"); navigate("/"); };

  const handleProjectChange = (newId: string) => {
    if (!newId) { navigate("/client"); return; }
    // Keep current section when switching projects
    const parts = location.pathname.split("/").filter(Boolean);
    const pidx = parts.indexOf("project");
    const section = pidx >= 0 && parts.length > pidx + 2 ? parts[pidx + 2] : "";
    const validSections = sidebarItems.map(s => s.path);
    if (section && validSections.includes(section)) {
      navigate(`/client/project/${newId}/${section}`);
    } else {
      navigate(`/client/project/${newId}/upload`);
    }
  };

  const getItemPath = (path: string) =>
    currentProjectId ? `/client/project/${currentProjectId}/${path}` : "";

  const isItemActive = (path: string) => {
    if (!currentProjectId) return false;
    return location.pathname === `/client/project/${currentProjectId}/${path}` ||
      (path === "upload" && (
        location.pathname === `/client/project/${currentProjectId}` ||
        location.pathname === `/client/project/${currentProjectId}/`
      ));
  };

  return (
    <Box sx={{ display: "flex", height: "100vh", bgcolor: "#f5f7fa" }}>
      {/* ── Top bar ── */}
      <AppBar position="fixed" elevation={0}
        sx={{ zIndex: (t) => t.zIndex.drawer + 1, bgcolor: "#ffffff", color: "#111827", borderBottom: "1px solid #e8eaed", boxShadow: "none" }}>
        <Toolbar sx={{ minHeight: "56px !important", px: "20px !important", gap: 2 }}>
          {/* Brand */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, flexShrink: 0 }}>
            <Engineering sx={{ fontSize: 20, color: "#059669" }} />
            <Typography sx={{ fontSize: "15px", fontWeight: 600, color: "#1e293b", letterSpacing: "-0.01em" }}>
              知识工程平台
            </Typography>
            <Chip label="客户端" size="small"
              sx={{ height: 18, fontSize: "10px", bgcolor: "#ecfdf5", color: "#065f46", border: "none", "& .MuiChip-label": { px: 0.75 } }} />
          </Box>

          {/* Project selector */}
          <FormControl size="small" sx={{ minWidth: 200, maxWidth: 280 }}>
            <Select value={currentProjectId} onChange={(e) => handleProjectChange(e.target.value)} displayEmpty
              sx={{
                fontSize: "13px", bgcolor: "#f8f9fb", borderRadius: "6px",
                "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e8eaed" },
                "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#6ee7b7" },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#059669", borderWidth: "1px" },
                "& .MuiSelect-select": { py: 0.75 },
              }}>
              <MenuItem value="" sx={{ fontSize: "13px", color: "#94a3b8" }}><em>选择项目空间</em></MenuItem>
              {projects.map((p) => (
                <MenuItem key={p.id} value={p.id} sx={{ fontSize: "13px" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                    <FolderOutlined sx={{ fontSize: 14, color: "#94a3b8" }} />
                    <Typography sx={{ fontSize: "13px", color: "#374151" }}>{p.name}</Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box sx={{ flexGrow: 1 }} />

          {/* Avatar */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
            <Typography sx={{ fontSize: "13px", color: "#94a3b8" }}>{currentUser?.displayName || "客户"}</Typography>
            <IconButton onClick={handleAvatarClick} size="small"
              sx={{ color: "#94a3b8", width: 32, height: 32, "&:hover": { bgcolor: "#f1f5f9", color: "#64748b" } }}>
              <AccountCircle sx={{ fontSize: 20 }} />
            </IconButton>
            <Menu anchorEl={anchorEl} open={open} onClose={handleClose}
              PaperProps={{ elevation: 0, sx: { mt: 1, borderRadius: "8px", border: "1px solid #e8eaed", boxShadow: "0 4px 16px rgba(0,0,0,0.06)", minWidth: 176 } }}>
              <Box sx={{ px: 2, py: 1, borderBottom: "1px solid #f3f4f6" }}>
                <Typography sx={{ fontSize: "11px", color: "#94a3b8", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>切换端</Typography>
              </Box>
              <MenuItem onClick={() => { navigate("/admin"); handleClose(); }}
                sx={{ fontSize: "13px", color: "#374151", gap: 1.5, py: 1, "&:hover": { bgcolor: "#f8f9fb" } }}>
                <Settings sx={{ fontSize: 16, color: "#3b82f6" }} /> 管理端
              </MenuItem>
              <MenuItem onClick={() => { navigate("/ops"); handleClose(); }}
                sx={{ fontSize: "13px", color: "#374151", gap: 1.5, py: 1, "&:hover": { bgcolor: "#f8f9fb" } }}>
                <ManageAccounts sx={{ fontSize: 16, color: "#8b5cf6" }} /> 运营端
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
            {sidebarItems.map((item) => {
              const active = isItemActive(item.path);
              const itemPath = getItemPath(item.path);
              const hasProject = Boolean(currentProjectId);
              return (
                <ListItem key={item.path} disablePadding sx={{ mb: 0.25 }}>
                  <ListItemButton
                    component={hasProject ? Link : "div"}
                    to={hasProject ? itemPath : undefined}
                    selected={active}
                    sx={{
                      borderRadius: "6px", py: 0.75, px: 1.25, minHeight: 36,
                      borderLeft: active ? "2px solid #059669" : "2px solid transparent",
                      opacity: hasProject ? 1 : 0.4,
                      cursor: hasProject ? "pointer" : "default",
                      "&:hover": { bgcolor: hasProject ? "#eef0f4" : "transparent" },
                      "&.Mui-selected": { bgcolor: "#ecfdf5", "&:hover": { bgcolor: "#ecfdf5" } },
                    }}>
                    <ListItemIcon sx={{ minWidth: 28, color: active ? "#059669" : "#94a3b8" }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText primary={item.label}
                      primaryTypographyProps={{ fontSize: "13px", fontWeight: active ? 500 : 400, color: active ? "#065f46" : "#64748b" }} />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>

          {!currentProjectId && (
            <Box sx={{ mt: 1.5, mx: 0.5, p: 1.25, bgcolor: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "6px" }}>
              <Typography sx={{ fontSize: "11px", color: "#065f46", lineHeight: 1.6 }}>
                从顶部选择项目空间，即可访问各功能模块
              </Typography>
            </Box>
          )}
        </Box>
      </Drawer>

      {/* ── Main ── */}
      <Box component="main" sx={{ flexGrow: 1, overflow: "auto", bgcolor: "#f5f7fa", pt: "56px" }}>
        <Outlet />
      </Box>
    </Box>
  );
}
