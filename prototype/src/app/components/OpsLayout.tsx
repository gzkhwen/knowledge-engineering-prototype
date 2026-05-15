import { Outlet, Link, useLocation, useNavigate, useParams } from "react-router";
import {
  Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  AppBar, Toolbar, Typography, IconButton, Menu, MenuItem, Divider, Chip,
  Select, FormControl, Tooltip, Collapse,
} from "@mui/material";
import {
  AccountCircle, Logout, Settings, Engineering, ManageAccounts,
  FolderOutlined, CloudUpload, AutoAwesome, AccountTree, ContentCut,
  Inventory, CheckCircle, WorkOutline, ExpandMore, ExpandLess,
  QuestionAnswer, Translate, TableChart, AccountTreeOutlined,
  Rule, DeviceHub, Hub, InsertDriveFile,
} from "@mui/icons-material";
import { useState, useEffect } from "react";
import { User, Project } from "../types";
import { dataStore } from "../store/DataStore";

const DRAWER_WIDTH = 220;

// Simple flat items (no sub-items)
const SIMPLE_WORKSPACE_ITEMS = [
  { path: "unstructured",  label: "非结构化切片构建", icon: <ContentCut sx={{ fontSize: 16 }} />, enabled: true },
  { path: "quality-check", label: "知识质检（敬请期待）", icon: <CheckCircle sx={{ fontSize: 16 }} />, enabled: false },
  { path: "packages",      label: "知识包管理",       icon: <Inventory sx={{ fontSize: 16 }} />, enabled: true },
  { path: "verification",  label: "构建结果验证",     icon: <CheckCircle sx={{ fontSize: 16 }} />, enabled: true },
];

// Group: 原始材料接入与标准化处理
const MATERIALS_SUBITEMS = [
  { path: "materials/upload", label: "文件上传", enabled: true },
  { path: "materials/crawler", label: "爬虫采集（敬请期待）", enabled: false },
  { path: "materials/database", label: "数据库采集（敬请期待）", enabled: false },
];

// Group: 结构化知识构建
const STRUCTURED_SUBITEMS = [
  { path: "structured/qa",    label: "问答库",           enabled: true },
  { path: "structured/terms", label: "术语库",           enabled: true },
  { path: "structured/table", label: "二维表（敬请期待）",   enabled: false },
  { path: "structured/tree",  label: "分类树（敬请期待）",   enabled: false },
  { path: "structured/rule",  label: "规则库（敬请期待）",   enabled: false },
  { path: "structured/flow",  label: "流程库（敬请期待）",   enabled: false },
  { path: "structured/graph", label: "知识图谱（敬请期待）", enabled: false },
];

export function OpsLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [materialsOpen, setMaterialsOpen] = useState(true);
  const [structuredOpen, setStructuredOpen] = useState(true);

  const currentProjectId = params.projectId ?? "";

  useEffect(() => {
    const str = localStorage.getItem("currentUser");
    if (str) setCurrentUser(JSON.parse(str));
    setProjects(dataStore.getProjects().filter(p => p.enabled));
  }, []);

  // Auto-expand groups when in relevant section
  useEffect(() => {
    if (location.pathname.includes("/materials/")) setMaterialsOpen(true);
    if (location.pathname.includes("/structured/")) setStructuredOpen(true);
  }, [location.pathname]);

  const open = Boolean(anchorEl);
  const handleAvatarClick = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const handleLogout = () => { localStorage.removeItem("currentUser"); navigate("/"); };

  const handleProjectChange = (newId: string) => {
    if (!newId) { navigate("/ops"); return; }
    const project = projects.find(p => p.id === newId);
    if (project?.hasSolution) {
      navigate(`/ops/project/${newId}/materials/upload`);
    } else {
      navigate(`/ops/project/${newId}`);
    }
  };

  const handleNav = (subPath: string) => {
    if (currentProjectId) navigate(`/ops/project/${currentProjectId}/${subPath}`);
  };

  const isProjectList = !currentProjectId &&
    (location.pathname === "/ops" || location.pathname === "/ops/" || location.pathname === "/ops/projects");

  const isPathActive = (subPath: string) => {
    if (!currentProjectId) return false;
    return location.pathname.includes(`/project/${currentProjectId}/${subPath}`);
  };

  const isGroupActive = (subItems: { path: string }[]) => {
    return subItems.some(item => isPathActive(item.path));
  };

  const subItemStyle = (isActive: boolean, enabled: boolean) => ({
    borderRadius: "6px", py: 0.6, px: 1.25, pl: 2.5, minHeight: 32,
    borderLeft: isActive ? "2px solid #7c3aed" : "2px solid transparent",
    opacity: enabled ? 1 : 0.45,
    cursor: enabled ? "pointer" : "not-allowed",
    "&:hover": { bgcolor: enabled ? "#eef0f4" : "transparent" },
    "&.Mui-selected": { bgcolor: "#ede9fe", "&:hover": { bgcolor: "#ede9fe" } },
  });

  const parentItemStyle = (isGroupAct: boolean) => ({
    borderRadius: "6px", py: 0.75, px: 1.25, minHeight: 36,
    borderLeft: isGroupAct ? "2px solid #7c3aed" : "2px solid transparent",
    opacity: currentProjectId ? 1 : 0.45,
    cursor: currentProjectId ? "pointer" : "default",
    "&:hover": { bgcolor: currentProjectId ? "#eef0f4" : "transparent" },
    "&.Mui-selected": { bgcolor: "#ede9fe", "&:hover": { bgcolor: "#ede9fe" } },
  });

  return (
    <Box sx={{ display: "flex", height: "100vh", bgcolor: "#f5f7fa" }}>
      {/* ── Top bar ── */}
      <AppBar position="fixed" elevation={0}
        sx={{ zIndex: (t) => t.zIndex.drawer + 1, bgcolor: "#ffffff", color: "#111827", borderBottom: "1px solid #e8eaed", boxShadow: "none" }}>
        <Toolbar sx={{ minHeight: "56px !important", px: "20px !important", gap: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, flexShrink: 0 }}>
            <Engineering sx={{ fontSize: 20, color: "#7c3aed" }} />
            <Typography sx={{ fontSize: "15px", fontWeight: 600, color: "#1e293b", letterSpacing: "-0.01em" }}>
              知识工程平台
            </Typography>
            <Chip label="运营端" size="small"
              sx={{ height: 18, fontSize: "10px", bgcolor: "#f5f3ff", color: "#6d28d9", border: "none", "& .MuiChip-label": { px: 0.75 } }} />
          </Box>

          <FormControl size="small" sx={{ minWidth: 200, maxWidth: 280 }}>
            <Select value={currentProjectId} onChange={(e) => handleProjectChange(e.target.value)} displayEmpty
              sx={{
                fontSize: "13px", bgcolor: "#f8f9fb", borderRadius: "6px",
                "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e8eaed" },
                "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#a78bfa" },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#7c3aed", borderWidth: "1px" },
                "& .MuiSelect-select": { py: 0.75 },
              }}>
              <MenuItem value="" sx={{ fontSize: "13px", color: "#94a3b8" }}><em>选择项目空间</em></MenuItem>
              {projects.map((p) => (
                <MenuItem key={p.id} value={p.id} sx={{ fontSize: "13px" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                    <FolderOutlined sx={{ fontSize: 14, color: "#94a3b8" }} />
                    <Typography sx={{ fontSize: "13px", color: "#374151" }}>{p.name}</Typography>
                    {!p.hasSolution && (
                      <Chip label="待配置" size="small"
                        sx={{ height: 16, fontSize: "10px", bgcolor: "#fef3c7", color: "#92400e", border: "none", "& .MuiChip-label": { px: 0.5 } }} />
                    )}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box sx={{ flexGrow: 1 }} />

          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
            <Typography sx={{ fontSize: "13px", color: "#94a3b8" }}>{currentUser?.displayName || "运营员"}</Typography>
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
        <Box sx={{ py: 1.5, px: 1.25, display: "flex", flexDirection: "column", height: "100%", overflow: "auto" }}>
          <List disablePadding>
            {/* 项目空间管理 */}
            <ListItem disablePadding sx={{ mb: 0.25 }}>
              <ListItemButton component={Link} to="/ops" selected={isProjectList}
                sx={{
                  borderRadius: "6px", py: 0.75, px: 1.25, minHeight: 36,
                  borderLeft: isProjectList ? "2px solid #7c3aed" : "2px solid transparent",
                  "&:hover": { bgcolor: "#eef0f4" },
                  "&.Mui-selected": { bgcolor: "#ede9fe", "&:hover": { bgcolor: "#ede9fe" } },
                }}>
                <ListItemIcon sx={{ minWidth: 28, color: isProjectList ? "#7c3aed" : "#94a3b8" }}>
                  <WorkOutline sx={{ fontSize: 16 }} />
                </ListItemIcon>
                <ListItemText primary="项目空间管理"
                  primaryTypographyProps={{ fontSize: "13px", fontWeight: isProjectList ? 500 : 400, color: isProjectList ? "#5b21b6" : "#64748b" }} />
              </ListItemButton>
            </ListItem>

            <Box sx={{ my: 0.75, mx: 1, borderBottom: "1px solid #e8eaed" }} />

            {/* ── Group: 原始材料接入与标准化处理 ── */}
            <ListItem disablePadding sx={{ mb: 0.25 }}>
              <Tooltip title={!currentProjectId ? "请先选择项目空间" : ""} placement="right" arrow>
                <ListItemButton
                  selected={isGroupActive(MATERIALS_SUBITEMS)}
                  onClick={() => {
                    if (!currentProjectId) return;
                    setMaterialsOpen(o => !o);
                  }}
                  sx={parentItemStyle(isGroupActive(MATERIALS_SUBITEMS))}>
                  <ListItemIcon sx={{ minWidth: 28, color: isGroupActive(MATERIALS_SUBITEMS) ? "#7c3aed" : "#94a3b8" }}>
                    <CloudUpload sx={{ fontSize: 16 }} />
                  </ListItemIcon>
                  <ListItemText primary="原始材料与标准化"
                    primaryTypographyProps={{ fontSize: "12px", fontWeight: isGroupActive(MATERIALS_SUBITEMS) ? 500 : 400, color: isGroupActive(MATERIALS_SUBITEMS) ? "#5b21b6" : "#64748b" }} />
                  {currentProjectId && (materialsOpen ? <ExpandLess sx={{ fontSize: 16, color: "#94a3b8" }} /> : <ExpandMore sx={{ fontSize: 16, color: "#94a3b8" }} />)}
                </ListItemButton>
              </Tooltip>
            </ListItem>

            <Collapse in={materialsOpen && Boolean(currentProjectId)} timeout="auto" unmountOnExit>
              {MATERIALS_SUBITEMS.map(item => {
                const isActive = isPathActive(item.path);
                return (
                  <ListItem key={item.path} disablePadding sx={{ mb: 0.2 }}>
                    <Tooltip title={!item.enabled ? "功能开发中，敬请期待" : ""} placement="right" arrow>
                      <ListItemButton
                        selected={isActive}
                        onClick={() => item.enabled && handleNav(item.path)}
                        sx={subItemStyle(isActive, item.enabled)}>
                        <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: isActive ? "#7c3aed" : "#d1d5db", mr: 1.25, flexShrink: 0 }} />
                        <ListItemText primary={item.label}
                          primaryTypographyProps={{ fontSize: "12px", fontWeight: isActive ? 500 : 400, color: isActive ? "#5b21b6" : item.enabled ? "#64748b" : "#94a3b8", lineHeight: 1.4 }} />
                      </ListItemButton>
                    </Tooltip>
                  </ListItem>
                );
              })}
            </Collapse>

            {/* ── Group: 结构化知识构建 ── */}
            <ListItem disablePadding sx={{ mb: 0.25, mt: 0.25 }}>
              <Tooltip title={!currentProjectId ? "请先选择项目空间" : ""} placement="right" arrow>
                <ListItemButton
                  selected={isGroupActive(STRUCTURED_SUBITEMS)}
                  onClick={() => {
                    if (!currentProjectId) return;
                    setStructuredOpen(o => !o);
                  }}
                  sx={parentItemStyle(isGroupActive(STRUCTURED_SUBITEMS))}>
                  <ListItemIcon sx={{ minWidth: 28, color: isGroupActive(STRUCTURED_SUBITEMS) ? "#7c3aed" : "#94a3b8" }}>
                    <AccountTree sx={{ fontSize: 16 }} />
                  </ListItemIcon>
                  <ListItemText primary="结构化知识构建"
                    primaryTypographyProps={{ fontSize: "12px", fontWeight: isGroupActive(STRUCTURED_SUBITEMS) ? 500 : 400, color: isGroupActive(STRUCTURED_SUBITEMS) ? "#5b21b6" : "#64748b" }} />
                  {currentProjectId && (structuredOpen ? <ExpandLess sx={{ fontSize: 16, color: "#94a3b8" }} /> : <ExpandMore sx={{ fontSize: 16, color: "#94a3b8" }} />)}
                </ListItemButton>
              </Tooltip>
            </ListItem>

            <Collapse in={structuredOpen && Boolean(currentProjectId)} timeout="auto" unmountOnExit>
              {STRUCTURED_SUBITEMS.map(item => {
                const isActive = isPathActive(item.path);
                return (
                  <ListItem key={item.path} disablePadding sx={{ mb: 0.2 }}>
                    <Tooltip title={!item.enabled ? "功能开发中，敬请期待" : ""} placement="right" arrow>
                      <ListItemButton
                        selected={isActive}
                        onClick={() => item.enabled && handleNav(item.path)}
                        sx={subItemStyle(isActive, item.enabled)}>
                        <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: isActive ? "#7c3aed" : "#d1d5db", mr: 1.25, flexShrink: 0 }} />
                        <ListItemText primary={item.label}
                          primaryTypographyProps={{ fontSize: "12px", fontWeight: isActive ? 500 : 400, color: isActive ? "#5b21b6" : item.enabled ? "#64748b" : "#94a3b8", lineHeight: 1.4 }} />
                      </ListItemButton>
                    </Tooltip>
                  </ListItem>
                );
              })}
            </Collapse>

            {/* ── Simple items ── */}
            {SIMPLE_WORKSPACE_ITEMS.map((item) => {
              const isActive = isPathActive(item.path);
              const hasProject = Boolean(currentProjectId);
              return (
                <ListItem key={item.path} disablePadding sx={{ mb: 0.25, mt: 0.25 }}>
                  <Tooltip title={!hasProject ? "请先选择项目空间" : (!item.enabled ? "功能开发中，敬请期待" : "")} placement="right" arrow>
                    <ListItemButton
                      onClick={() => item.enabled && handleNav(item.path)}
                      selected={isActive}
                      disabled={!item.enabled}
                      sx={{
                        borderRadius: "6px", py: 0.75, px: 1.25, minHeight: 36,
                        borderLeft: isActive ? "2px solid #7c3aed" : "2px solid transparent",
                        opacity: (hasProject && item.enabled) ? 1 : 0.45,
                        cursor: (hasProject && item.enabled) ? "pointer" : "default",
                        "&:hover": { bgcolor: (hasProject && item.enabled) ? "#eef0f4" : "transparent" },
                        "&.Mui-selected": { bgcolor: "#ede9fe", "&:hover": { bgcolor: "#ede9fe" } },
                      }}>
                      <ListItemIcon sx={{ minWidth: 28, color: isActive ? "#7c3aed" : "#94a3b8" }}>
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText primary={item.label}
                        primaryTypographyProps={{ fontSize: "13px", fontWeight: isActive ? 500 : 400, color: isActive ? "#5b21b6" : (item.enabled ? "#64748b" : "#94a3b8") }} />
                    </ListItemButton>
                  </Tooltip>
                </ListItem>
              );
            })}
          </List>

          {!currentProjectId && (
            <Box sx={{ mt: "auto", mx: 0.5, mb: 1, p: 1.25, bgcolor: "#f0ebff", border: "1px solid #ddd6fe", borderRadius: "6px" }}>
              <Typography sx={{ fontSize: "11px", color: "#6d28d9", lineHeight: 1.6 }}>
                从顶部选择项目空间，以使用知识工程各模块
              </Typography>
            </Box>
          )}
        </Box>
      </Drawer>

      {/* ── Main ── */}
      <Box component="main" sx={{ flexGrow: 1, overflow: "auto", bgcolor: "#f5f7fa", pt: "56px" }}>
        <Box sx={{ p: 3 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}