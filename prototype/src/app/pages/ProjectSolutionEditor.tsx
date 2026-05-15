import { useState, useEffect, useMemo } from "react";
import { useOutletContext, useNavigate } from "react-router";
import {
  Box, Button, Paper, Typography, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, MenuItem, FormControl, InputLabel, Select, OutlinedInput,
  Chip, Alert, Switch, Tooltip, Divider, Collapse,
} from "@mui/material";
import {
  Add, Edit, Delete, AccountTree, ExpandMore, ChevronRight, WarningAmber,
  CheckCircle, InfoOutlined, FolderOutlined, LabelOutlined, UnfoldMore, UnfoldLess,
  AutoAwesome, EditNote, ArrowBack,
} from "@mui/icons-material";
import { dataStore } from "../store/DataStore";
import { Project, ProjectCategory, ProjectSolution, KnowledgeFormType } from "../types";
import { toast } from "sonner";

// ─── Constants ────────────────────────────────────────────────────────────────

const FORM_TYPE_META: Record<KnowledgeFormType, { bg: string; color: string; border: string }> = {
  [KnowledgeFormType.QA]:          { bg: "#dbeafe", color: "#1e40af", border: "#93c5fd" },
  [KnowledgeFormType.GLOSSARY]:    { bg: "#f3e8ff", color: "#6b21a8", border: "#c4b5fd" },
  [KnowledgeFormType.UNSTRUCTURED]:{ bg: "#fef3c7", color: "#92400e", border: "#fde68a" },
  [KnowledgeFormType.TABLE]:       { bg: "#d1fae5", color: "#065f46", border: "#6ee7b7" },
  [KnowledgeFormType.TREE]:        { bg: "#ffedd5", color: "#9a3412", border: "#fdba74" },
  [KnowledgeFormType.DECISION]:    { bg: "#fce7f3", color: "#9d174d", border: "#f9a8d4" },
  [KnowledgeFormType.SOP]:         { bg: "#e0f2fe", color: "#0c4a6e", border: "#7dd3fc" },
  [KnowledgeFormType.GRAPH]:       { bg: "#ecfdf5", color: "#064e3b", border: "#6ee7b7" },
};

const LEVEL_PALETTE = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444"];
const levelColor = (depth: number) => LEVEL_PALETTE[Math.min(depth, LEVEL_PALETTE.length - 1)];

// ─── Types ────────────────────────────────────────────────────────────────────

interface CatFormData {
  name: string;
  parentId: string | null;
  formTypes: KnowledgeFormType[];
}

const EMPTY_FORM: CatFormData = { name: "", parentId: null, formTypes: [] };

// ─── Component ────────────────────────────────────────────────────────────────

export function ProjectSolutionEditor() {
  const { project } = useOutletContext<{ project: Project }>();
  const navigate = useNavigate();

  const [solution, setSolution] = useState<ProjectSolution | null>(null);
  const [categories, setCategories] = useState<ProjectCategory[]>([]);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  // Category dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<ProjectCategory | null>(null);
  const [form, setForm] = useState<CatFormData>(EMPTY_FORM);
  const [formError, setFormError] = useState("");

  // Parent-has-formTypes warning before adding child
  const [addChildWarn, setAddChildWarn] = useState<{ parentId: string; parentName: string } | null>(null);

  // Warn about existing content when changing form types
  const [formTypeWarnPending, setFormTypeWarnPending] = useState<CatFormData | null>(null);

  // Delete confirm
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<ProjectCategory | null>(null);

  // Template selection for initialization (when no solution exists)
  const [templateSelectOpen, setTemplateSelectOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");

  // Complete solution confirmation
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);

  // ─── Data loading ───────────────────────────────────────────────────────────

  useEffect(() => { loadData(); }, [project.id]);

  const loadData = () => {
    const sol = dataStore.getProjectSolution(project.id);
    setSolution(sol ?? null);
    if (sol) {
      const cats = dataStore.getProjectCategories(sol.id);
      setCategories(cats);
      setExpanded(new Set(cats.filter(c => c.parentId === null).map(c => c.id)));
    } else {
      setCategories([]);
    }
  };

  // ─── Initialize solution ────────────────────────────────────────────────────

  const handleInit = () => {
    const sol = dataStore.initializeProjectSolution(project.id);
    if (sol) {
      toast.success(project.templateId
        ? `已从模板「${dataStore.getTemplate(project.templateId)?.name}」初始化项目方案`
        : "项目方案已创建，请手动配置知识类目与知识形态"
      );
      loadData();
    } else {
      toast.error("初始化失败");
    }
  };

  const handleInitFromTemplate = () => {
    if (!selectedTemplateId) {
      toast.error("请选择一个模板");
      return;
    }
    // Temporarily set the project's templateId, then initialize
    const originalTemplateId = project.templateId;
    dataStore.updateProject(project.id, { templateId: selectedTemplateId });
    const sol = dataStore.initializeProjectSolution(project.id);
    if (sol) {
      const template = dataStore.getTemplate(selectedTemplateId);
      toast.success(`已从模板「${template?.name}」初始化项目方案`);
      loadData();
      setTemplateSelectOpen(false);
    } else {
      // Restore original templateId on failure
      dataStore.updateProject(project.id, { templateId: originalTemplateId });
      toast.error("初始化失败");
    }
  };

  // ─── Tree helpers ───────────────────────────────────────────────────────────

  const rootCats = useMemo(
    () => categories.filter(c => c.parentId === null).sort((a, b) => a.order - b.order),
    [categories]
  );

  const childrenOf = (parentId: string) =>
    categories.filter(c => c.parentId === parentId).sort((a, b) => a.order - b.order);

  const isLeaf = (catId: string) => !categories.some(c => c.parentId === catId);

  const allDescendantIds = (catId: string): Set<string> => {
    const ids = new Set<string>([catId]);
    const walk = (id: string) => childrenOf(id).forEach(c => { ids.add(c.id); walk(c.id); });
    walk(catId);
    return ids;
  };

  // ─── Expand / collapse ──────────────────────────────────────────────────────

  const toggle = (id: string) =>
    setExpanded(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const expandAll = () =>
    setExpanded(new Set(categories.filter(c => childrenOf(c.id).length > 0).map(c => c.id)));

  const collapseAll = () => setExpanded(new Set());

  // ─── Open create dialog ─────────────────────────────────────────────────────

  const openCreate = (parentId: string | null) => {
    if (parentId) {
      const parent = categories.find(c => c.id === parentId);
      // If parent already has form types, warn first
      if (parent && parent.formTypes.length > 0) {
        setAddChildWarn({ parentId, parentName: parent.name });
        return;
      }
    }
    setEditingCat(null);
    setForm({ ...EMPTY_FORM, parentId });
    setFormError("");
    setDialogOpen(true);
  };

  // After user confirms clearing parent's form types
  const confirmAddChildAfterWarn = () => {
    if (!addChildWarn) return;
    const { parentId } = addChildWarn;
    // Clear parent's form types
    dataStore.updateProjectCategory(parentId, { formTypes: [] });
    loadData();
    setAddChildWarn(null);
    // Open create dialog
    setEditingCat(null);
    setForm({ ...EMPTY_FORM, parentId });
    setFormError("");
    setDialogOpen(true);
  };

  const openEdit = (cat: ProjectCategory) => {
    setEditingCat(cat);
    const leaf = isLeaf(cat.id);
    setForm({ name: cat.name, parentId: cat.parentId, formTypes: leaf ? [...cat.formTypes] : [] });
    setFormError("");
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingCat(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setFormTypeWarnPending(null);
  };

  // ─── Save category ────────────────────────────────────────────────────────

  const handleSave = (overriddenForm?: CatFormData) => {
    const f = overriddenForm ?? form;
    setFormError("");
    const trimName = f.name.trim();

    if (!trimName) { setFormError("类目名称不能为空"); return; }

    // Same-level uniqueness
    const dupExists = categories.some(
      c => c.name === trimName && c.parentId === f.parentId && c.id !== editingCat?.id
    );
    if (dupExists) { setFormError("该类目不唯一：同级下已存在同名类目"); return; }

    // Level check
    let level = 1;
    if (f.parentId) {
      const parent = categories.find(c => c.id === f.parentId);
      if (parent) {
        level = parent.level + 1;
        if (level > 5) { setFormError("类目层级不得超过 5 层"); return; }
      }
    }

    // Determine if this node is (or will be) a leaf
    const willBeLeaf = editingCat ? isLeaf(editingCat.id) : true;

    // Non-leaf nodes cannot have form types
    if (!willBeLeaf && f.formTypes.length > 0) {
      setFormError("非末级类目（有子类目的节点）不可指定知识形态");
      return;
    }

    // Leaf must have form types
    if (willBeLeaf && f.formTypes.length === 0) {
      setFormError("末级类目必须指定至少一个知识形态");
      return;
    }

    // If editing a leaf with hasContent and form types changed, warn first
    if (!overriddenForm && editingCat && editingCat.hasContent && willBeLeaf) {
      const origTypes = JSON.stringify([...editingCat.formTypes].sort());
      const newTypes = JSON.stringify([...f.formTypes].sort());
      if (origTypes !== newTypes) {
        setFormTypeWarnPending(f);
        return;
      }
    }

    doSave(f, level, willBeLeaf);
  };

  const doSave = (f: CatFormData, level: number, willBeLeaf: boolean) => {
    if (!solution) return;

    if (editingCat) {
      dataStore.updateProjectCategory(editingCat.id, {
        name: f.name.trim(),
        parentId: f.parentId,
        formTypes: willBeLeaf ? f.formTypes : [],
        level,
      });
      toast.success("知识类目已更新");
    } else {
      const siblings = categories.filter(c => c.parentId === f.parentId);
      const maxOrder = siblings.length > 0 ? Math.max(...siblings.map(s => s.order)) : 0;
      dataStore.addProjectCategory({
        solutionId: solution.id,
        name: f.name.trim(),
        parentId: f.parentId,
        formTypes: willBeLeaf ? f.formTypes : [],
        order: maxOrder + 1,
        level,
      });
      if (f.parentId) setExpanded(prev => new Set(prev).add(f.parentId!));
    }

    loadData();
    closeDialog();
  };

  const confirmFormTypeChange = () => {
    if (!formTypeWarnPending || !editingCat) return;
    const f = formTypeWarnPending;
    const leaf = isLeaf(editingCat.id);
    let level = editingCat.level;
    if (f.parentId) {
      const parent = categories.find(c => c.id === f.parentId);
      if (parent) level = parent.level + 1;
    }
    doSave(f, level, leaf);
    setFormTypeWarnPending(null);
  };

  // ─── Delete category ────────────────────────────────────────────────────────

  const requestDelete = (cat: ProjectCategory) => {
    if (!isLeaf(cat.id)) {
      toast.error("该类目下有子类目，不可删除");
      return;
    }
    setPendingDelete(cat);
    setDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (!pendingDelete) return;
    const ok = dataStore.deleteProjectCategory(pendingDelete.id);
    if (ok) {
      toast.success("知识类目已删除");
      // After delete, parent may become a leaf again — reload
      loadData();
    } else {
      toast.error("删除失败：该类目下有子类目");
    }
    setDeleteOpen(false);
    setPendingDelete(null);
  };

  // ─── Solution toggle ────────────────────────────────────────────────────────

  const handleToggleSolution = () => {
    if (!solution) return;
    const enabling = !solution.enabled;
    if (!enabling) toast.warning("停用后，进行中的任务将被中断");
    if (enabling && !project.enabled) toast.warning("该项目知识空间当前为停用状态");
    dataStore.updateProjectSolution(solution.id, { enabled: enabling });
    toast.success(enabling ? "项目方案已启用" : "项目方案已停用");
    loadData();
  };

  // ─── Stats ──────────────────────────────────────────────────────────────────

  const stats = useMemo(() => {
    const total = categories.length;
    const leaves = categories.filter(c => isLeaf(c.id));
    const leafTotal = leaves.length;
    const incomplete = leaves.filter(c => c.formTypes.length === 0).length;
    const maxLevel = total > 0 ? Math.max(...categories.map(c => c.level)) : 0;
    return { total, leafTotal, incomplete, maxLevel };
  }, [categories]);

  const availableParents = useMemo((): ProjectCategory[] => {
    if (editingCat) {
      const excluded = allDescendantIds(editingCat.id);
      return categories.filter(c => !excluded.has(c.id) && c.level < 5);
    }
    return categories.filter(c => c.level < 5);
  }, [editingCat, categories]);

  const templateName = project.templateId ? dataStore.getTemplate(project.templateId)?.name : null;

  // For the dialog: is current node a leaf (or will be a leaf if creating new)?
  const dialogNodeIsLeaf = editingCat ? isLeaf(editingCat.id) : true;

  // Ensure form.parentId is valid for the select component
  const selectParentValue = useMemo(() => {
    if (!form.parentId) return "";
    // Check if the current parentId exists in availableParents
    const exists = availableParents.some(p => p.id === form.parentId);
    return exists ? form.parentId : "";
  }, [form.parentId, availableParents]);

  // ─── Render node ────────────────────────────────────────────────────────────

  const renderNode = (cat: ProjectCategory, depth: number) => {
    const children = childrenOf(cat.id);
    const leaf = isLeaf(cat.id);
    const hasTypes = cat.formTypes.length > 0;
    const warn = leaf && !hasTypes;
    const isOpen = expanded.has(cat.id);
    const lc = levelColor(depth);

    return (
      <Box key={cat.id}>
        <Box sx={{ display: "flex", alignItems: "flex-start", ml: `${depth * 28}px`, mb: 0.75, position: "relative" }}>
          {depth > 0 && <Box sx={{ position: "absolute", left: -20, top: 0, bottom: 0, width: "1px", bgcolor: "#e5e7eb" }} />}
          {depth > 0 && <Box sx={{ position: "absolute", left: -20, top: "18px", width: "16px", height: "1px", bgcolor: "#e5e7eb" }} />}

          <Box sx={{ width: 24, flexShrink: 0, mt: "10px" }}>
            {!leaf ? (
              <IconButton size="small" onClick={() => toggle(cat.id)} sx={{ p: 0, color: "#9ca3af", "&:hover": { color: "#374151" } }}>
                {isOpen ? <ExpandMore sx={{ fontSize: 18 }} /> : <ChevronRight sx={{ fontSize: 18 }} />}
              </IconButton>
            ) : (
              <LabelOutlined sx={{ fontSize: 14, color: lc, mt: "3px", ml: "5px" }} />
            )}
          </Box>

          <Box sx={{
            flex: 1, border: `1px solid ${warn ? "#fde68a" : "#e5e7eb"}`,
            borderLeft: `3px solid ${warn ? "#f59e0b" : lc}`,
            borderRadius: "8px", bgcolor: warn ? "#fffbeb" : "#fff", p: 1.5,
            transition: "box-shadow 0.15s",
            "&:hover": { boxShadow: "0 2px 8px rgba(0,0,0,0.07)", "& .node-actions": { opacity: 1 } },
          }}>
            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
              <Box sx={{ mt: 0.25, flexShrink: 0 }}>
                {leaf
                  ? <LabelOutlined sx={{ fontSize: 18, color: lc }} />
                  : <FolderOutlined sx={{ fontSize: 18, color: lc }} />}
              </Box>

              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, flexWrap: "wrap" }}>
                  <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#111827" }}>{cat.name}</Typography>
                  <Chip label={`第 ${cat.level} 层`} size="small"
                    sx={{ height: 18, fontSize: "10px", bgcolor: "#f3f4f6", color: "#6b7280", border: "none", "& .MuiChip-label": { px: 0.75 } }} />
                  {leaf && (
                    <Chip label="末级" size="small"
                      sx={{ height: 18, fontSize: "10px", bgcolor: `${lc}18`, color: lc, border: `1px solid ${lc}40`, "& .MuiChip-label": { px: 0.75 } }} />
                  )}
                  {!leaf && (
                    <Chip label="中间节点" size="small"
                      sx={{ height: 18, fontSize: "10px", bgcolor: "#f3f4f6", color: "#94a3b8", border: "none", "& .MuiChip-label": { px: 0.75 } }} />
                  )}
                  {cat.hasContent && (
                    <Chip label="有构建结果" size="small"
                      sx={{ height: 18, fontSize: "10px", bgcolor: "#ede9fe", color: "#5b21b6", border: "1px solid #c4b5fd", "& .MuiChip-label": { px: 0.75 } }} />
                  )}
                  {!leaf && <Typography sx={{ fontSize: "11px", color: "#9ca3af" }}>{children.length} 个子类目</Typography>}
                </Box>

                {hasTypes && (
                  <Box sx={{ mt: 0.75, display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                    {cat.formTypes.map(ft => {
                      const m = FORM_TYPE_META[ft];
                      return (
                        <Chip key={ft} label={ft} size="small"
                          sx={{ height: 20, fontSize: "11px", bgcolor: m.bg, color: m.color, border: `1px solid ${m.border}`, "& .MuiChip-label": { px: 0.75 } }} />
                      );
                    })}
                  </Box>
                )}
                {!leaf && (
                  <Typography sx={{ fontSize: "11px", color: "#9ca3af", mt: 0.5 }}>
                    中间节点，知识形态由末级子类目指定
                  </Typography>
                )}
                {warn && (
                  <Box sx={{ mt: 0.5, display: "flex", alignItems: "center", gap: 0.5 }}>
                    <WarningAmber sx={{ fontSize: 13, color: "#f59e0b" }} />
                    <Typography sx={{ fontSize: "11px", color: "#92400e" }}>末级类目尚未指定知识形态</Typography>
                  </Box>
                )}
              </Box>

              <Box className="node-actions" sx={{ display: "flex", gap: 0.25, flexShrink: 0, opacity: 0, transition: "opacity 0.15s" }}>
                {cat.level < 5 && (
                  <Tooltip title="新增子类目">
                    <IconButton size="small" onClick={() => openCreate(cat.id)}
                      sx={{ color: "#9ca3af", "&:hover": { color: "#3b82f6", bgcolor: "#eff6ff" } }}>
                      <Add sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Tooltip>
                )}
                <Tooltip title="编辑类目">
                  <IconButton size="small" onClick={() => openEdit(cat)}
                    sx={{ color: "#9ca3af", "&:hover": { color: "#374151", bgcolor: "#f9fafb" } }}>
                    <Edit sx={{ fontSize: 16 }} />
                  </IconButton>
                </Tooltip>
                <Tooltip title={!leaf ? "有子类目，不可删除" : "删除类目"}>
                  <span>
                    <IconButton size="small" disabled={!leaf} onClick={() => requestDelete(cat)}
                      sx={{ color: "#9ca3af", "&:hover": { color: "#ef4444", bgcolor: "#fef2f2" }, "&.Mui-disabled": { color: "#e5e7eb" } }}>
                      <Delete sx={{ fontSize: 16 }} />
                    </IconButton>
                  </span>
                </Tooltip>
              </Box>
            </Box>
          </Box>
        </Box>

        <Collapse in={isOpen && !leaf} unmountOnExit>
          {children.map(child => renderNode(child, depth + 1))}
        </Collapse>
      </Box>
    );
  };

  // ─── No solution state ──────────────────────────────────────────────────────

  if (!solution) {
    // Get available templates for this project's relationship
    const relationship = dataStore.getRelationship(project.relationshipId);
    const availableTemplates = dataStore.getAvailableTemplates().filter(t => {
      // Include templates without relationshipId (universal templates) or matching the project's relationship
      return !t.relationshipId || t.relationshipId === project.relationshipId;
    });

    return (
      <Box>
        {/* 返回按钮 */}
        <Box sx={{ mb: 2 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate("/ops/projects")}
            sx={{
              textTransform: "none",
              color: "#6b7280",
              fontSize: "13px",
              "&:hover": { bgcolor: "#f3f4f6" },
            }}
          >
            返回项目列表
          </Button>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography sx={{ fontSize: "18px", fontWeight: 700, color: "#111827" }}>项目方案配置</Typography>
          <Typography sx={{ fontSize: "13px", color: "#6b7280", mt: 0.5 }}>
            定义项目知识类目与知识形态，为后续知识构建提供前置依据
          </Typography>
        </Box>
        <Paper sx={{ border: "1px solid #e5e7eb", borderRadius: "12px", boxShadow: "none" }}>
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 10, gap: 3 }}>
            <AccountTree sx={{ fontSize: 56, color: "#e5e7eb" }} />
            <Box sx={{ textAlign: "center" }}>
              <Typography sx={{ fontSize: "16px", fontWeight: 600, color: "#374151", mb: 1 }}>
                该项目尚未配置项目方案
              </Typography>
              <Typography sx={{ fontSize: "13px", color: "#6b7280" }}>
                可以手动创建空白项目方案，或选择从已有模板初始化
              </Typography>
            </Box>
            
            {/* 总是显示两个按钮 */}
            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              <Button variant="outlined" startIcon={<EditNote />} onClick={handleInit}
                sx={{ borderColor: "#3b82f6", color: "#3b82f6", borderRadius: "8px", textTransform: "none", fontSize: "14px", px: 3, py: 1.25, "&:hover": { bgcolor: "#eff6ff", borderColor: "#2563eb" } }}>
                手动创建项目方案
              </Button>
              
              <Box sx={{ position: "relative" }}>
                <Button 
                  variant="contained" 
                  startIcon={<AutoAwesome />} 
                  onClick={() => setTemplateSelectOpen(!templateSelectOpen)}
                  disabled={availableTemplates.length === 0}
                  sx={{ 
                    bgcolor: "#8b5cf6", 
                    borderRadius: "8px", 
                    textTransform: "none", 
                    fontSize: "14px", 
                    px: 3, 
                    py: 1.25, 
                    boxShadow: "none", 
                    "&:hover": { bgcolor: "#7c3aed", boxShadow: "none" },
                    "&:disabled": { bgcolor: "#e5e7eb", color: "#9ca3af" },
                  }}>
                  从模板初始化项目方案
                </Button>
                
                {/* Template selection dropdown */}
                {templateSelectOpen && availableTemplates.length > 0 && (
                  <Paper sx={{ 
                    position: "absolute", 
                    top: "100%", 
                    left: 0, 
                    mt: 1, 
                    minWidth: 300, 
                    maxHeight: 400, 
                    overflow: "auto",
                    zIndex: 10, 
                    border: "1px solid #e5e7eb", 
                    borderRadius: "8px", 
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)" 
                  }}>
                    <Box sx={{ p: 2 }}>
                      <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#111827", mb: 1.5 }}>
                        选择模板
                      </Typography>
                      
                      <FormControl fullWidth size="small">
                        <Select
                          value={selectedTemplateId}
                          onChange={(e) => setSelectedTemplateId(e.target.value)}
                          displayEmpty
                          sx={{ mb: 2, borderRadius: "6px" }}
                        >
                          <MenuItem value="" disabled>
                            <em>请选择模板...</em>
                          </MenuItem>
                          {availableTemplates.map((template) => {
                            const isUniversal = !template.relationshipId;
                            return (
                              <MenuItem key={template.id} value={template.id}>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                  <Typography sx={{ fontSize: "13px" }}>{template.name}</Typography>
                                  {isUniversal && (
                                    <Chip 
                                      label="通用" 
                                      size="small" 
                                      sx={{ height: 18, fontSize: "10px", bgcolor: "#f3f4f6", color: "#6b7280" }} 
                                    />
                                  )}
                                </Box>
                              </MenuItem>
                            );
                          })}
                        </Select>
                      </FormControl>
                      
                      <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
                        <Button 
                          size="small" 
                          onClick={() => { setTemplateSelectOpen(false); setSelectedTemplateId(project.templateId || ""); }}
                          sx={{ textTransform: "none", color: "#6b7280", fontSize: "13px" }}
                        >
                          取消
                        </Button>
                        <Button 
                          size="small" 
                          variant="contained" 
                          onClick={handleInitFromTemplate}
                          disabled={!selectedTemplateId}
                          sx={{ 
                            textTransform: "none", 
                            bgcolor: "#8b5cf6", 
                            fontSize: "13px",
                            boxShadow: "none",
                            "&:hover": { bgcolor: "#7c3aed", boxShadow: "none" },
                            "&:disabled": { bgcolor: "#e5e7eb", color: "#9ca3af" },
                          }}
                        >
                          确认初始化
                        </Button>
                      </Box>
                    </Box>
                  </Paper>
                )}
              </Box>
            </Box>
            
            {availableTemplates.length === 0 && (
              <Alert severity="info" sx={{ maxWidth: 600, bgcolor: "#eff6ff", color: "#1e40af", border: "1px solid #bfdbfe", borderRadius: "6px" }}>
                当前没有可用的模板。模板需要与项目的行业/领域/场景相匹配，或为通用模板。
              </Alert>
            )}
          </Box>
        </Paper>
      </Box>
    );
  }

  // ─── Main render ───────────────────────────────────────────────────────────

  return (
    <Box>
      {/* ── Page title ── */}
      <Box sx={{ mb: 2.5 }}>
        <Typography sx={{ fontSize: "18px", fontWeight: 700, color: "#111827" }}>项目方案配置</Typography>
        <Typography sx={{ fontSize: "13px", color: "#6b7280", mt: 0.5 }}>
          定义项目知识类目与知识形态，为后续知识构建提供前置依据
        </Typography>
      </Box>

      {/* ── Solution info card ── */}
      <Paper sx={{ mb: 2.5, border: "1px solid #e5e7eb", borderRadius: "10px", boxShadow: "none", overflow: "hidden" }}>
        <Box sx={{ p: 2.5 }}>
          <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
                <AccountTree sx={{ fontSize: 18, color: "#3b82f6" }} />
                <Typography sx={{ fontSize: "15px", fontWeight: 700, color: "#111827" }}>项目方案</Typography>
                <Chip label={solution.enabled ? "已启用" : "已停用"} size="small"
                  sx={{ height: 22, fontSize: "11px", bgcolor: solution.enabled ? "#d1fae5" : "#f3f4f6", color: solution.enabled ? "#065f46" : "#6b7280", border: "none", "& .MuiChip-label": { px: 1 } }} />
              </Box>
              <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                {templateName ? (
                  <Box>
                    <Typography sx={{ fontSize: "11px", color: "#9ca3af" }}>初始化来源</Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <AutoAwesome sx={{ fontSize: 13, color: "#8b5cf6" }} />
                      <Typography sx={{ fontSize: "12px", color: "#374151", fontWeight: 500 }}>模板：{templateName}</Typography>
                    </Box>
                  </Box>
                ) : (
                  <Box>
                    <Typography sx={{ fontSize: "11px", color: "#9ca3af" }}>配置方式</Typography>
                    <Typography sx={{ fontSize: "12px", color: "#374151", fontWeight: 500 }}>手动配置</Typography>
                  </Box>
                )}
                <Box>
                  <Typography sx={{ fontSize: "11px", color: "#9ca3af" }}>创建时间</Typography>
                  <Typography sx={{ fontSize: "12px", color: "#374151" }}>{new Date(solution.createdAt).toLocaleString("zh-CN")}</Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: "11px", color: "#9ca3af" }}>最后更新</Typography>
                  <Typography sx={{ fontSize: "12px", color: "#374151" }}>{new Date(solution.updatedAt).toLocaleString("zh-CN")}</Typography>
                </Box>
              </Box>
            </Box>

            {/* Stats */}
            <Box sx={{ display: "flex", gap: 1.5, flexShrink: 0 }}>
              {[
                { label: "类目总数", value: stats.total, color: "#3b82f6" },
                { label: "末级类目", value: stats.leafTotal, color: "#8b5cf6" },
                { label: "最大层级", value: stats.maxLevel || "—", color: "#10b981" },
                { label: "待配置", value: stats.incomplete, color: stats.incomplete > 0 ? "#f59e0b" : "#10b981" },
              ].map(s => (
                <Box key={s.label} sx={{ textAlign: "center", px: 1.75, py: 1.25, bgcolor: "#f9fafb", borderRadius: "8px", border: "1px solid #e5e7eb", minWidth: 64 }}>
                  <Typography sx={{ fontSize: "20px", fontWeight: 700, color: s.color, lineHeight: 1.2 }}>{s.value}</Typography>
                  <Typography sx={{ fontSize: "11px", color: "#9ca3af" }}>{s.label}</Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>

        <Divider sx={{ borderColor: "#f3f4f6" }} />

        {/* Action bar */}
        <Box sx={{ px: 2.5, py: 1.75, display: "flex", alignItems: "center", justifyContent: "space-between", bgcolor: "#fafafa" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Typography sx={{ fontSize: "12px", color: "#6b7280" }}>方案状态：</Typography>
            <Chip 
              label={solution.status === "active" ? "已完成" : "草稿"} 
              size="small"
              sx={{ 
                height: 22, 
                fontSize: "11px", 
                bgcolor: solution.status === "active" ? "#d1fae5" : "#fef3c7", 
                color: solution.status === "active" ? "#065f46" : "#92400e", 
                border: "none",
                fontWeight: 500,
                "& .MuiChip-label": { px: 1 }
              }} 
            />
            {solution.status === "draft" && stats.incomplete === 0 && stats.total > 0 && (
              <Button 
                size="small" 
                variant="contained"
                onClick={() => setCompleteDialogOpen(true)}
                sx={{ 
                  bgcolor: "#10b981", 
                  color: "#fff",
                  textTransform: "none", 
                  fontSize: "12px", 
                  borderRadius: "6px", 
                  px: 2, 
                  py: 0.5,
                  ml: 1,
                  boxShadow: "none",
                  "&:hover": { 
                    bgcolor: "#059669",
                    boxShadow: "none"
                  } 
                }}
              >
                完成项目方案
              </Button>
            )}
          </Box>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Tooltip title="展开所有类目">
              <Button size="small" startIcon={<UnfoldMore sx={{ fontSize: "15px !important" }} />} onClick={expandAll}
                sx={{ textTransform: "none", fontSize: "12px", color: "#374151", border: "1px solid #e5e7eb", borderRadius: "6px", px: 1.5, py: 0.5, bgcolor: "#fff", "&:hover": { bgcolor: "#f9fafb" } }}>
                展开全部
              </Button>
            </Tooltip>
            <Tooltip title="折叠所有类目">
              <Button size="small" startIcon={<UnfoldLess sx={{ fontSize: "15px !important" }} />} onClick={collapseAll}
                sx={{ textTransform: "none", fontSize: "12px", color: "#374151", border: "1px solid #e5e7eb", borderRadius: "6px", px: 1.5, py: 0.5, bgcolor: "#fff", "&:hover": { bgcolor: "#f9fafb" } }}>
                折叠全部
              </Button>
            </Tooltip>
          </Box>
        </Box>
      </Paper>

      {/* ── Rules hint ── */}
      <Alert severity="info" icon={<InfoOutlined sx={{ fontSize: 16 }} />}
        sx={{ mb: 2, bgcolor: "#eff6ff", color: "#1e40af", border: "1px solid #bfdbfe", borderRadius: "8px", py: 0.5, "& .MuiAlert-message": { fontSize: "12px", py: 0.25 }, "& .MuiAlert-icon": { color: "#3b82f6", alignItems: "center" } }}>
        最多 <strong>5 层</strong>树形结构 &nbsp;·&nbsp; 末级类目（叶子节点）<strong>必须</strong>指定知识形态 &nbsp;·&nbsp; 非末级类目（中间节点）<strong>不可</strong>指定知识形态 &nbsp;·&nbsp; 同一末级类目可指定<strong>多个</strong>知识形态
      </Alert>

      {/* ── Banners ── */}
      {stats.total > 0 && stats.incomplete > 0 && (
        <Alert severity="warning" icon={<WarningAmber sx={{ fontSize: 16 }} />}
          sx={{ mb: 2, bgcolor: "#fffbeb", color: "#92400e", border: "1px solid #fde68a", borderRadius: "8px", py: 0.5, "& .MuiAlert-message": { fontSize: "12px", py: 0.25 }, "& .MuiAlert-icon": { color: "#f59e0b", alignItems: "center" } }}>
          有 <strong>{stats.incomplete}</strong> 个末级类目尚未指定知识形态，完整配置后可开始知识构建
        </Alert>
      )}
      {stats.total > 0 && stats.incomplete === 0 && (
        <Alert severity="success" icon={<CheckCircle sx={{ fontSize: 16 }} />}
          sx={{ mb: 2, bgcolor: "#f0fdf4", color: "#065f46", border: "1px solid #bbf7d0", borderRadius: "8px", py: 0.5, "& .MuiAlert-message": { fontSize: "12px", py: 0.25 }, "& .MuiAlert-icon": { color: "#10b981", alignItems: "center" } }}>
          所有末级类目均已配置知识形态，可开始知识构建
        </Alert>
      )}
      {templateName && (
        <Alert severity="info" icon={<AutoAwesome sx={{ fontSize: 16 }} />}
          sx={{ mb: 2, bgcolor: "#faf5ff", color: "#6b21a8", border: "1px solid #e9d5ff", borderRadius: "8px", py: 0.5, "& .MuiAlert-message": { fontSize: "12px", py: 0.25 }, "& .MuiAlert-icon": { color: "#8b5cf6", alignItems: "center" } }}>
          本方案已从模板「<strong>{templateName}</strong>」初始化，可根据项目实际情况自由调整，修改不影响原模板
        </Alert>
      )}

      {/* ── Tree panel ── */}
      <Paper sx={{ p: 2.5, border: "1px solid #e5e7eb", borderRadius: "10px", boxShadow: "none", minHeight: 300 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
          <Typography sx={{ fontSize: "14px", fontWeight: 600, color: "#374151" }}>知识类目树</Typography>
          <Typography sx={{ fontSize: "12px", color: "#9ca3af" }}>{rootCats.length} 个根类目 · 共 {stats.total} 个类目</Typography>
        </Box>

        {rootCats.length === 0 ? (
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 10, gap: 2 }}>
            <AccountTree sx={{ fontSize: 52, color: "#e5e7eb" }} />
            <Typography sx={{ fontSize: "14px", color: "#9ca3af" }}>暂无知识类目，点击下方按钮开始配置</Typography>
            <Button variant="outlined" startIcon={<Add />} onClick={() => openCreate(null)}
              sx={{ textTransform: "none", borderColor: "#3b82f6", color: "#3b82f6", borderRadius: "6px", "&:hover": { bgcolor: "#eff6ff" } }}>
              新增根类目
            </Button>
          </Box>
        ) : (
          <Box>{rootCats.map(cat => renderNode(cat, 0))}</Box>
        )}
      </Paper>

      {/* ── Add / Edit Dialog ── */}
      <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" } }}>
        <DialogTitle sx={{ fontSize: "16px", fontWeight: 600, color: "#111827", py: 2.5, px: 3 }}>
          {editingCat ? "编辑知识类目" : form.parentId
            ? `新增子类目（父级：${categories.find(c => c.id === form.parentId)?.name}）`
            : "新增根类目"}
        </DialogTitle>
        <DialogContent sx={{ px: 3, pt: 1.5, pb: 2 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            {editingCat?.hasContent && (
              <Alert severity="warning"
                sx={{ bgcolor: "#fffbeb", color: "#92400e", border: "1px solid #fde68a", borderRadius: "6px", py: 0.5, "& .MuiAlert-message": { fontSize: "12px", py: 0 }, "& .MuiAlert-icon": { color: "#f59e0b" } }}>
                该类目已有知识构建结果，调整后将仅影响后续构建，已有结果不自动改写
              </Alert>
            )}

            {form.parentId && (
              <Box sx={{ display: "flex", gap: 0.75, alignItems: "center", p: 1.25, bgcolor: "#f9fafb", borderRadius: "6px", border: "1px solid #e5e7eb" }}>
                <ChevronRight sx={{ fontSize: 15, color: "#9ca3af" }} />
                <Typography sx={{ fontSize: "12px", color: "#6b7280" }}>父级类目：</Typography>
                <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "#374151" }}>
                  {categories.find(c => c.id === form.parentId)?.name}
                </Typography>
                <Chip label={`第 ${(categories.find(c => c.id === form.parentId)?.level ?? 0) + 1} 层`} size="small"
                  sx={{ height: 18, fontSize: "10px", bgcolor: "#e5e7eb", color: "#374151", border: "none", "& .MuiChip-label": { px: 0.75 } }} />
              </Box>
            )}

            <TextField label="类目名称" required size="small" fullWidth autoFocus
              value={form.name}
              onChange={e => { setForm({ ...form, name: e.target.value }); setFormError(""); }}
              placeholder="请输入知识类目名称（同级下唯一）"
              error={!!formError}
              sx={{ 
                "& .MuiOutlinedInput-root": { 
                  borderRadius: "6px",
                  fontSize: "13px",
                  "& input": { py: 1 }
                },
                "& .MuiInputLabel-root": { fontSize: "13px" },
                "& .MuiInputLabel-root.MuiInputLabel-shrink": { fontSize: "14px" }
              }}
            />

            <TextField select size="small" fullWidth label="父级类目"
              value={selectParentValue}
              onChange={e => setForm({ ...form, parentId: e.target.value || null })}
              helperText="留空则创建为根类目（第 1 层）"
              sx={{ 
                "& .MuiOutlinedInput-root": { 
                  borderRadius: "6px",
                  fontSize: "13px"
                },
                "& .MuiInputLabel-root": { fontSize: "13px" },
                "& .MuiInputLabel-root.MuiInputLabel-shrink": { fontSize: "14px" },
                "& .MuiFormHelperText-root": { fontSize: "11px" }
              }}>
              <MenuItem value="" sx={{ fontSize: "13px" }}>无（根类目）</MenuItem>
              {availableParents.map(c => (
                <MenuItem key={c.id} value={c.id} sx={{ fontSize: "13px" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                    <Typography sx={{ fontSize: "13px" }}>{"　".repeat(c.level - 1)}{c.name}</Typography>
                    <Typography sx={{ fontSize: "11px", color: "#9ca3af" }}>· 第 {c.level} 层</Typography>
                  </Box>
                </MenuItem>
              ))}
            </TextField>

            {/* Knowledge form types — only available for leaf nodes */}
            {dialogNodeIsLeaf ? (
              <FormControl fullWidth size="small">
                <InputLabel sx={{ fontSize: "13px", "&.MuiInputLabel-shrink": { fontSize: "14px" } }}>知识形态（末级必选）</InputLabel>
                <Select multiple value={form.formTypes}
                  onChange={e => setForm({ ...form, formTypes: e.target.value as KnowledgeFormType[] })}
                  input={<OutlinedInput label="知识形态（末级必选）" sx={{ borderRadius: "6px", fontSize: "13px" }} />}
                  renderValue={selected => (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {selected.map(v => {
                        const m = FORM_TYPE_META[v];
                        return <Chip key={v} label={v} size="small" sx={{ height: 20, fontSize: "11px", bgcolor: m.bg, color: m.color, border: `1px solid ${m.border}`, "& .MuiChip-label": { px: 0.75 } }} />;
                      })}
                    </Box>
                  )}>
                  {Object.values(KnowledgeFormType).map(ft => {
                    const m = FORM_TYPE_META[ft];
                    const sel = form.formTypes.includes(ft);
                    return (
                      <MenuItem key={ft} value={ft} sx={{ fontSize: "13px" }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, width: "100%" }}>
                          <Box sx={{ width: 10, height: 10, borderRadius: "2px", bgcolor: sel ? m.bg : "transparent", border: `1.5px solid ${m.border}`, flexShrink: 0 }} />
                          <Chip label={ft} size="small" sx={{ height: 20, fontSize: "11px", bgcolor: m.bg, color: m.color, border: `1px solid ${m.border}`, "& .MuiChip-label": { px: 0.75 } }} />
                        </Box>
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            ) : (
              <Box sx={{ p: 1.5, bgcolor: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: "6px" }}>
                <Typography sx={{ fontSize: "12px", color: "#94a3b8" }}>
                  该节点为中间节点（有子类目），不可指定知识形态。知识形态由末级子类目指定。
                </Typography>
              </Box>
            )}

            {formError && (
              <Alert severity="error"
                sx={{ bgcolor: "#fef2f2", color: "#991b1b", border: "1px solid #fecaca", borderRadius: "6px", py: 0.5, "& .MuiAlert-message": { fontSize: "12px", py: 0 }, "& .MuiAlert-icon": { color: "#ef4444" } }}>
                {formError}
              </Alert>
            )}

            {!editingCat && dialogNodeIsLeaf && (
              <Box sx={{ p: 1.25, bgcolor: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "6px" }}>
                <Typography sx={{ fontSize: "12px", color: "#065f46" }}>
                  末级类目必须指定至少一个知识形态；添加子类目后，此节点将变为中间节点，识形态将被自动清除。
                </Typography>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, pt: 1, gap: 1.5, justifyContent: "flex-end" }}>
          <Button onClick={closeDialog} sx={{ textTransform: "none", color: "#6b7280", borderRadius: "6px", px: 2.5, py: 0.75, fontSize: "13px" }}>取消</Button>
          <Button onClick={() => handleSave()} variant="contained"
            sx={{ bgcolor: "#3b82f6", borderRadius: "6px", textTransform: "none", px: 2.5, py: 0.75, fontSize: "13px", boxShadow: "none", "&:hover": { bgcolor: "#2563eb", boxShadow: "none" } }}>
            {editingCat ? "保存修改" : "创建类目"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Add-child intercept: parent has form types → warn ── */}
      <Dialog open={!!addChildWarn} onClose={() => setAddChildWarn(null)} maxWidth="xs" fullWidth
        PaperProps={{ sx: { borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" } }}>
        <DialogTitle sx={{ fontSize: "16px", fontWeight: 600, color: "#111827", py: 2.5, px: 3 }}>
          添加子类目
        </DialogTitle>
        <DialogContent sx={{ px: 3, pt: 1.5, pb: 2 }}>
          <Alert severity="warning"
            sx={{ bgcolor: "#fffbeb", color: "#92400e", border: "1px solid #fde68a", borderRadius: "6px", "& .MuiAlert-icon": { color: "#f59e0b" }, "& .MuiAlert-message": { fontSize: "13px", lineHeight: 1.7 } }}>
            节点「<strong>{addChildWarn?.parentName}</strong>」已配置知识形态。<br />
            添加子类目后，该节点将变为中间节点，<strong>已配置的知识形态将被自动清除</strong>，知识形态需在末级子类目上重新指定。<br />
            是否继续？
          </Alert>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, pt: 1, gap: 1.5, justifyContent: "flex-end" }}>
          <Button onClick={() => setAddChildWarn(null)} sx={{ textTransform: "none", color: "#6b7280", borderRadius: "6px", px: 2.5, py: 0.75, fontSize: "13px" }}>取消</Button>
          <Button onClick={confirmAddChildAfterWarn} variant="contained"
            sx={{ bgcolor: "#f59e0b", borderRadius: "6px", textTransform: "none", px: 2.5, py: 0.75, fontSize: "13px", boxShadow: "none", "&:hover": { bgcolor: "#d97706", boxShadow: "none" } }}>
            确认，清除并继续
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Form type change warn dialog ── */}
      <Dialog open={!!formTypeWarnPending} onClose={() => setFormTypeWarnPending(null)} maxWidth="xs" fullWidth
        PaperProps={{ sx: { borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" } }}>
        <DialogTitle sx={{ fontSize: "16px", fontWeight: 600, color: "#111827", py: 2.5, px: 3 }}>调整知识形态</DialogTitle>
        <DialogContent sx={{ px: 3, pt: 1.5, pb: 2 }}>
          <Alert severity="warning"
            sx={{ bgcolor: "#fffbeb", color: "#92400e", border: "1px solid #fde68a", borderRadius: "6px", "& .MuiAlert-icon": { color: "#f59e0b" }, "& .MuiAlert-message": { fontSize: "13px", lineHeight: 1.7 } }}>
            该类目已有知识构建结果，调整后将<strong>仅影响后续构建</strong>，已生成的结果不会自动改写。是否继续？
          </Alert>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, pt: 1, gap: 1.5, justifyContent: "flex-end" }}>
          <Button onClick={() => setFormTypeWarnPending(null)} sx={{ textTransform: "none", color: "#6b7280", borderRadius: "6px", px: 2.5, py: 0.75, fontSize: "13px" }}>取消</Button>
          <Button onClick={confirmFormTypeChange} variant="contained"
            sx={{ bgcolor: "#f59e0b", borderRadius: "6px", textTransform: "none", px: 2.5, py: 0.75, fontSize: "13px", boxShadow: "none", "&:hover": { bgcolor: "#d97706", boxShadow: "none" } }}>
            确认调整
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Delete confirm dialog ── */}
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} maxWidth="xs" fullWidth
        PaperProps={{ sx: { borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" } }}>
        <DialogTitle sx={{ fontSize: "16px", fontWeight: 600, color: "#111827", py: 2.5, px: 3 }}>删除知识类目</DialogTitle>
        <DialogContent sx={{ px: 3, pt: 1.5, pb: 2 }}>
          <Alert severity={pendingDelete?.hasContent ? "warning" : "error"}
            sx={{
              bgcolor: pendingDelete?.hasContent ? "#fffbeb" : "#fef2f2",
              color: pendingDelete?.hasContent ? "#92400e" : "#991b1b",
              border: `1px solid ${pendingDelete?.hasContent ? "#fde68a" : "#fecaca"}`,
              borderRadius: "6px",
              "& .MuiAlert-icon": { color: pendingDelete?.hasContent ? "#f59e0b" : "#ef4444" },
              "& .MuiAlert-message": { fontSize: "13px", lineHeight: 1.7 },
            }}>
            {pendingDelete?.hasContent
              ? <>该类目「<strong>{pendingDelete?.name}</strong>」下已有知识构建结果，删除后已生成结果将变为孤立数据，是否继续？</>
              : <>确认删除类目「<strong>{pendingDelete?.name}</strong>」？此操作不可撤销。</>}
          </Alert>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, pt: 1, gap: 1.5, justifyContent: "flex-end" }}>
          <Button onClick={() => setDeleteOpen(false)} sx={{ textTransform: "none", color: "#6b7280", borderRadius: "6px", px: 2.5, py: 0.75, fontSize: "13px" }}>取消</Button>
          <Button onClick={confirmDelete} variant="contained"
            sx={{ bgcolor: "#ef4444", borderRadius: "6px", textTransform: "none", px: 2.5, py: 0.75, fontSize: "13px", boxShadow: "none", "&:hover": { bgcolor: "#dc2626", boxShadow: "none" } }}>
            确认删除
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Complete solution confirmation dialog ── */}
      <Dialog open={completeDialogOpen} onClose={() => setCompleteDialogOpen(false)} maxWidth="xs" fullWidth
        PaperProps={{ sx: { borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" } }}>
        <DialogTitle sx={{ fontSize: "16px", fontWeight: 600, color: "#111827", py: 2.5, px: 3 }}>完成项目方案</DialogTitle>
        <DialogContent sx={{ px: 3, pt: 1.5, pb: 2 }}>
          <Alert severity="info"
            sx={{
              bgcolor: "#eff6ff",
              color: "#1e40af",
              border: "1px solid #bfdbfe",
              borderRadius: "6px",
              "& .MuiAlert-icon": { color: "#3b82f6" },
              "& .MuiAlert-message": { fontSize: "13px", lineHeight: 1.7 },
            }}>
            项目方案完成后，将标记为「已完成」状态。<br />
            确认要完成此项目方案吗？
          </Alert>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, pt: 1, gap: 1.5, justifyContent: "flex-end" }}>
          <Button onClick={() => setCompleteDialogOpen(false)} sx={{ textTransform: "none", color: "#6b7280", borderRadius: "6px", px: 2.5, py: 0.75, fontSize: "13px" }}>取消</Button>
          <Button onClick={() => {
            if (!solution) return;
            dataStore.updateProjectSolution(solution.id, { status: "active" });
            toast.success("项目方案已完成");
            loadData();
            setCompleteDialogOpen(false);
          }} variant="contained"
            sx={{ bgcolor: "#10b981", borderRadius: "6px", textTransform: "none", px: 2.5, py: 0.75, fontSize: "13px", boxShadow: "none", "&:hover": { bgcolor: "#059669", boxShadow: "none" } }}>
            确认完成
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}