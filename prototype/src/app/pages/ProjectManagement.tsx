import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Snackbar,
  Alert,
  Card,
  CardContent,
  Grid,
  Menu,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import { Add, Edit, Delete, PlayArrow, Pause, MoreVert, FolderOpen, Visibility } from "@mui/icons-material";
import { useNavigate } from "react-router";
import { dataStore } from "../store/DataStore";
import { Project } from "../types";

export function ProjectManagement() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    relationshipId: "",
    templateId: "",
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" as "success" | "error" | "warning" });

  const availableRelationships = dataStore.getAvailableRelationships();
  const availableTemplates = dataStore.getAvailableTemplates();

  // Filter templates based on selected relationship
  const filteredTemplates = formData.relationshipId
    ? availableTemplates.filter(t => 
        !t.relationshipId || t.relationshipId === formData.relationshipId
      )
    : [];

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = () => {
    setProjects(dataStore.getProjects());
  };

  const handleOpenDialog = (project?: Project) => {
    if (project) {
      setEditingProject(project);
      setFormData({
        name: project.name,
        description: project.description || "",
        relationshipId: project.relationshipId,
        templateId: project.templateId || "",
      });
    } else {
      setEditingProject(null);
      setFormData({
        name: "",
        description: "",
        relationshipId: "",
        templateId: "",
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingProject(null);
    setFormData({
      name: "",
      description: "",
      relationshipId: "",
      templateId: "",
    });
  };

  const handleSave = () => {
    // 校验项目名称
    if (!formData.name.trim()) {
      setSnackbar({ open: true, message: "项目名称不能为空", severity: "error" });
      return;
    }

    // 校验场景组合
    if (!formData.relationshipId) {
      setSnackbar({ open: true, message: "请选择场景组合", severity: "error" });
      return;
    }

    // 校验场景组合是否启用
    const relationship = availableRelationships.find(r => r.id === formData.relationshipId);
    if (!relationship) {
      setSnackbar({ open: true, message: "该场景组合已停用，请选择其他组合", severity: "error" });
      return;
    }

    // 校验模板是否启用
    if (formData.templateId) {
      const template = availableTemplates.find(t => t.id === formData.templateId);
      if (!template) {
        setSnackbar({ open: true, message: "该模板已停用，请选择其他模板", severity: "error" });
        return;
      }
    }

    if (editingProject) {
      // 更新项目
      const success = dataStore.updateProject(editingProject.id, {
        name: formData.name,
        description: formData.description,
      });
      if (success) {
        setSnackbar({ open: true, message: "项目更新成功", severity: "success" });
        loadProjects();
        handleCloseDialog();
      }
    } else {
      // 创建项目
      // 校验名称唯一性
      if (dataStore.isProjectNameExists(formData.name)) {
        setSnackbar({ open: true, message: "项目名称已存在", severity: "error" });
        return;
      }

      const newProject = dataStore.addProject({
        name: formData.name,
        description: formData.description,
        relationshipId: formData.relationshipId,
        templateId: formData.templateId || undefined,
        enabled: true,
      });
      
      // Auto-initialize project solution when template is selected
      if (formData.templateId) {
        dataStore.initializeProjectSolution(newProject.id);
      }
      
      setSnackbar({ open: true, message: "项目创建成功", severity: "success" });
      loadProjects();
      handleCloseDialog();
      
      // 创建成功后自动跳转到项目方案配置页
      navigate(`/ops/project/${newProject.id}`);
    }
  };

  const handleToggleStatus = (project: Project) => {
    const newStatus = !project.enabled;
    
    // 如果启用，检查关联的场景组合是否启用
    if (newStatus) {
      const relationship = dataStore.getRelationship(project.relationshipId);
      if (!relationship || !relationship.enabled) {
        setSnackbar({ 
          open: true, 
          message: "该项目关联的场景组合当前为停用状态", 
          severity: "warning" 
        });
      }
    }

    dataStore.updateProject(project.id, { enabled: newStatus });
    setSnackbar({ 
      open: true, 
      message: newStatus ? "项目已启用" : "项目已停用", 
      severity: "success" 
    });
    loadProjects();
  };

  const handleDelete = (project: Project) => {
    // 检查项目是否有知识成果
    if (project.hasContent) {
      setSnackbar({ 
        open: true, 
        message: "该项目已有知识成果，不可删除，可停用", 
        severity: "error" 
      });
      return;
    }

    if (window.confirm(`确定要删除项目"${project.name}"吗？删除后不可恢复。`)) {
      const success = dataStore.deleteProject(project.id);
      if (success) {
        setSnackbar({ open: true, message: "项目删除成功", severity: "success" });
        loadProjects();
      }
    }
  };

  const getRelationshipDisplay = (relationshipId: string) => {
    const relationship = dataStore.getRelationship(relationshipId);
    if (!relationship) return "-";

    const industry = dataStore.getIndustry(relationship.industryId);
    const domain = dataStore.getDomain(relationship.domainId);
    const scenario = dataStore.getScenario(relationship.scenarioId);

    return `${industry?.name || "-"} / ${domain?.name || "-"} / ${scenario?.name || "-"}`;
  };

  const getTemplateDisplay = (templateId?: string) => {
    if (!templateId) return "-";
    const template = dataStore.getTemplate(templateId);
    return template?.name || "-";
  };

  const getProjectSolutionSummary = (projectId: string): string[] => {
    const solution = dataStore.getProjectSolution(projectId);
    if (!solution) return [];
    const cats = dataStore.getProjectCategories(solution.id);
    // Show leaf categories (no children)
    const leafCats = cats.filter(c => !cats.some(other => other.parentId === c.id));
    return leafCats.slice(0, 4).map(c => c.name);
  };

  const [menuAnchor, setMenuAnchor] = useState<{ element: HTMLElement; project: Project } | null>(null);

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, project: Project) => {
    setMenuAnchor({ element: event.currentTarget, project });
  };

  const handleCloseMenu = () => {
    setMenuAnchor(null);
  };

  const handleEnterProject = (project: Project) => {
    if (!project.enabled) {
      setSnackbar({ open: true, message: "项目当前为停用状态,无法进入", severity: "warning" });
      return;
    }
    // Auto-navigate to materials if solution is configured, otherwise to solution config
    if (project.hasSolution) {
      navigate(`/ops/project/${project.id}/materials/upload`);
    } else {
      navigate(`/ops/project/${project.id}`);
    }
  };

  return (
    <Box>
      {/* 页面标题和操作按钮 */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography sx={{ fontSize: "20px", fontWeight: 600, color: "#111827" }}>
          项目空间管理
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
          disabled={availableRelationships.length === 0}
          sx={{
            bgcolor: "#3b82f6",
            borderRadius: "6px",
            textTransform: "none",
            px: 2,
            py: 1,
            fontSize: "13px",
            boxShadow: "none",
            "&:hover": {
              bgcolor: "#2563eb",
              boxShadow: "none",
            },
            "&:disabled": {
              bgcolor: "#e5e7eb",
              color: "#9ca3af",
            },
          }}
        >
          新增项目
        </Button>
      </Box>

      {/* 警告提示 */}
      {availableRelationships.length === 0 && (
        <Alert 
          severity="warning" 
          sx={{ 
            mb: 3,
            bgcolor: "#fef3c7",
            color: "#92400e",
            border: "1px solid #fcd34d",
            borderRadius: "6px",
            fontSize: "13px",
            "& .MuiAlert-icon": {
              color: "#f59e0b",
            }
          }}
        >
          当前无可用场景组合，请先在资产管理中配置并启用场景组合
        </Alert>
      )}

      {/* 项目列表 */}
      {projects.length === 0 ? (
        <Paper
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            py: 8,
            bgcolor: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}
        >
          <Typography sx={{ fontSize: "13px", color: "#9ca3af" }}>
            暂无项目，点击"新增项目"开始
          </Typography>
        </Paper>
      ) : (
        <TableContainer 
          component={Paper}
          sx={{
            bgcolor: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            overflow: "hidden"
          }}
        >
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "#f9fafb" }}>
                <TableCell sx={{ fontSize: "12px", fontWeight: 500, color: "#6b7280", py: 1.5, width: "20%" }}>项目名称</TableCell>
                <TableCell sx={{ fontSize: "12px", fontWeight: 500, color: "#6b7280", py: 1.5, width: "25%" }}>场景组合</TableCell>
                <TableCell sx={{ fontSize: "12px", fontWeight: 500, color: "#6b7280", py: 1.5, width: "15%" }}>初始模板</TableCell>
                <TableCell sx={{ fontSize: "12px", fontWeight: 500, color: "#6b7280", py: 1.5, width: "10%" }}>方案状态</TableCell>
                <TableCell sx={{ fontSize: "12px", fontWeight: 500, color: "#6b7280", py: 1.5, width: "10%" }}>项目状态</TableCell>
                <TableCell sx={{ fontSize: "12px", fontWeight: 500, color: "#6b7280", py: 1.5, width: "12%" }}>创建时间</TableCell>
                <TableCell align="right" sx={{ fontSize: "12px", fontWeight: 500, color: "#6b7280", py: 1.5, width: "8%" }}>操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {projects.map((project) => (
                <TableRow 
                  key={project.id}
                  sx={{
                    "&:hover": {
                      bgcolor: "#fafafa",
                      cursor: "pointer"
                    },
                    "&:last-child td": {
                      borderBottom: 0
                    }
                  }}
                  onClick={() => handleEnterProject(project)}
                >
                  <TableCell sx={{ fontSize: "13px", color: "#374151", py: 2 }}>
                    <Box>
                      <Typography sx={{ fontSize: "13px", fontWeight: 500, color: "#111827", mb: 0.5 }}>
                        {project.name}
                      </Typography>
                      {project.description && (
                        <Typography sx={{ fontSize: "12px", color: "#6b7280", lineHeight: 1.4 }}>
                          {project.description}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell sx={{ fontSize: "12px", color: "#6b7280", py: 2 }}>
                    {getRelationshipDisplay(project.relationshipId)}
                  </TableCell>
                  <TableCell sx={{ fontSize: "12px", color: "#6b7280", py: 2 }}>
                    {getTemplateDisplay(project.templateId)}
                  </TableCell>
                  <TableCell sx={{ py: 2 }}>
                    <Chip
                      label={project.hasSolution ? "已配置" : "待配置"}
                      size="small"
                      sx={{
                        height: "20px",
                        fontSize: "11px",
                        bgcolor: project.hasSolution ? "#d1fae5" : "#fef3c7",
                        color: project.hasSolution ? "#065f46" : "#92400e",
                        border: "none",
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ py: 2 }}>
                    <Chip
                      label={project.enabled ? "启用" : "停用"}
                      size="small"
                      sx={{
                        height: "20px",
                        fontSize: "11px",
                        bgcolor: project.enabled ? "#d1fae5" : "#f3f4f6",
                        color: project.enabled ? "#065f46" : "#6b7280",
                        border: "none",
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ fontSize: "12px", color: "#6b7280", py: 2 }}>
                    {new Date(project.createdAt).toLocaleDateString("zh-CN")}
                  </TableCell>
                  <TableCell align="right" sx={{ py: 2 }} onClick={(e) => e.stopPropagation()}>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenMenu(e, project);
                      }}
                      sx={{ 
                        color: "#6b7280",
                        "&:hover": {
                          bgcolor: "#f3f4f6"
                        }
                      }}
                    >
                      <MoreVert fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* 项目操作菜单 */}
      <Menu
        anchorEl={menuAnchor?.element}
        open={Boolean(menuAnchor)}
        onClose={handleCloseMenu}
        PaperProps={{
          sx: {
            borderRadius: "6px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            minWidth: "160px",
          },
        }}
      >
        {/* 查看项目方案 - 仅在已配置时显示 */}
        {menuAnchor?.project.hasSolution && (
          <MenuItem
            onClick={() => {
              if (menuAnchor) {
                navigate(`/ops/projects/${menuAnchor.project.id}/solution/view`);
                handleCloseMenu();
              }
            }}
            sx={{ fontSize: "14px", py: 1 }}
          >
            <Visibility fontSize="small" sx={{ mr: 1, color: "#8b5cf6" }} />
            查看项目方案
          </MenuItem>
        )}
        <MenuItem
          onClick={() => {
            if (menuAnchor) {
              handleToggleStatus(menuAnchor.project);
              handleCloseMenu();
            }
          }}
          sx={{ fontSize: "14px", py: 1 }}
        >
          {menuAnchor?.project.enabled ? (
            <>
              <Pause fontSize="small" sx={{ mr: 1, color: "#f59e0b" }} />
              停用项目
            </>
          ) : (
            <>
              <PlayArrow fontSize="small" sx={{ mr: 1, color: "#10b981" }} />
              启用项目
            </>
          )}
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (menuAnchor) {
              handleOpenDialog(menuAnchor.project);
              handleCloseMenu();
            }
          }}
          sx={{ fontSize: "14px", py: 1 }}
        >
          <Edit fontSize="small" sx={{ mr: 1, color: "#3b82f6" }} />
          编辑信息
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (menuAnchor) {
              handleDelete(menuAnchor.project);
              handleCloseMenu();
            }
          }}
          sx={{ fontSize: "14px", py: 1, color: "#ef4444" }}
        >
          <Delete fontSize="small" sx={{ mr: 1 }} />
          删除项目
        </MenuItem>
      </Menu>

      {/* 创建/编辑对话框 */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "8px",
          }
        }}
      >
        <DialogTitle sx={{ fontSize: "18px", fontWeight: 600, color: "#111827", pb: 2 }}>
          {editingProject ? "编辑项目" : "创建项目"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <TextField
              label="项目名称"
              fullWidth
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={!!editingProject}
              sx={{
                "& .MuiInputLabel-root": {
                  fontSize: "14px",
                },
                "& .MuiInputBase-input": {
                  fontSize: "14px",
                },
              }}
            />
            <TextField
              label="项目描述"
              fullWidth
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              sx={{
                "& .MuiInputLabel-root": {
                  fontSize: "14px",
                },
                "& .MuiInputBase-input": {
                  fontSize: "14px",
                },
              }}
            />
            <FormControl fullWidth required disabled={!!editingProject}>
              <InputLabel sx={{ fontSize: "14px" }}>场景组合</InputLabel>
              <Select
                value={formData.relationshipId}
                label="场景组合"
                onChange={(e) => {
                  const newRelationshipId = e.target.value;
                  // When relationship changes, clear template if it doesn't match the new relationship
                  const currentTemplate = availableTemplates.find(t => t.id === formData.templateId);
                  const shouldClearTemplate = formData.templateId && currentTemplate && 
                    currentTemplate.relationshipId && currentTemplate.relationshipId !== newRelationshipId;
                  
                  setFormData({ 
                    ...formData, 
                    relationshipId: newRelationshipId,
                    templateId: shouldClearTemplate ? "" : formData.templateId
                  });
                }}
                sx={{ fontSize: "14px" }}
              >
                {availableRelationships.map((rel) => (
                  <MenuItem key={rel.id} value={rel.id} sx={{ fontSize: "14px" }}>
                    {getRelationshipDisplay(rel.id)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth disabled={!!editingProject}>
              <InputLabel sx={{ fontSize: "14px" }}>初始模板（可选）</InputLabel>
              <Select
                value={formData.templateId}
                label="初始模板（可选）"
                onChange={(e) => setFormData({ ...formData, templateId: e.target.value })}
                sx={{ fontSize: "14px" }}
              >
                <MenuItem value="" sx={{ fontSize: "14px" }}>
                  <em>不选择模板</em>
                </MenuItem>
                {filteredTemplates.map((template) => {
                  const isUniversal = !template.relationshipId;
                  return (
                    <MenuItem key={template.id} value={template.id} sx={{ fontSize: "14px" }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Typography sx={{ fontSize: "14px" }}>{template.name}</Typography>
                        {isUniversal && (
                          <Chip 
                            label="通用" 
                            size="small" 
                            sx={{ 
                              height: "18px", 
                              fontSize: "10px", 
                              bgcolor: "#f3f4f6", 
                              color: "#6b7280",
                              "& .MuiChip-label": { px: 0.75 }
                            }} 
                          />
                        )}
                      </Box>
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
            {!editingProject && !formData.templateId && (
              <Alert
                severity="info"
                sx={{
                  bgcolor: "#eff6ff", color: "#1e40af", border: "1px solid #bfdbfe",
                  borderRadius: "6px", fontSize: "13px", py: 0.75,
                  "& .MuiAlert-message": { fontSize: "13px" },
                  "& .MuiAlert-icon": { color: "#3b82f6" },
                }}
              >
                未选择模板，创建后需在<strong>项目方案配置</strong>页手动添加知识类目与知识形态
              </Alert>
            )}
            {editingProject && (
              <Alert 
                severity="info"
                sx={{ 
                  bgcolor: "#dbeafe",
                  color: "#1e40af",
                  border: "1px solid #93c5fd",
                  borderRadius: "6px",
                  fontSize: "13px",
                  py: 1,
                  "& .MuiAlert-message": {
                    fontSize: "13px",
                  },
                  "& .MuiAlert-icon": {
                    fontSize: "18px",
                  }
                }}
              >
                场景组合和模板在项目创建后不可修改
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={handleCloseDialog}
            sx={{ 
              textTransform: "none",
              fontSize: "14px",
              color: "#6b7280"
            }}
          >
            取消
          </Button>
          <Button 
            onClick={handleSave}
            variant="contained"
            sx={{
              bgcolor: "#3b82f6",
              color: "#fff",
              textTransform: "none",
              fontSize: "14px",
              "&:hover": {
                bgcolor: "#2563eb",
              },
            }}
          >
            {editingProject ? "保存" : "创建"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 提示消息 */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert 
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          sx={{
            fontSize: "14px",
            borderRadius: "6px",
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}