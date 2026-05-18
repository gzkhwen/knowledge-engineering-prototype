import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router";
import {
  Box,
  Button,
  Paper,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  OutlinedInput,
  Chip,
  Breadcrumbs,
  Link,
  Alert,
  Switch,
  Tooltip,
  Divider,
  Collapse,
} from "@mui/material";
import {
  Add,
  Edit,
  Delete,
  ArrowBack,
  NavigateNext,
  AccountTree,
  ExpandMore,
  ChevronRight,
  WarningAmber,
  CheckCircle,
  InfoOutlined,
  FolderOutlined,
  LabelOutlined,
  UnfoldMore,
  UnfoldLess,
} from "@mui/icons-material";
import { dataStore } from "../store/DataStore";
import { KnowledgeCategory, KnowledgeFormType, Template } from "../types";
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

interface CategoryFormData {
  name: string;
  parentId: string | null;
  formTypes: KnowledgeFormType[];
}

const EMPTY_FORM: CategoryFormData = { name: "", parentId: null, formTypes: [] };

// ─── Component ────────────────────────────────────────────────────────────────

export function TemplateEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [template, setTemplate] = useState<Template | null>(null);
  const [categories, setCategories] = useState<KnowledgeCategory[]>([]);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  // Category dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<KnowledgeCategory | null>(null);
  const [form, setForm] = useState<CategoryFormData>(EMPTY_FORM);
  const [formError, setFormError] = useState("");

  // Confirm dialog state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<KnowledgeCategory | null>(null);

  // Parent-has-formTypes confirm state (adding child to a node that already has form types)
  const [parentClearConfirmOpen, setParentClearConfirmOpen] = useState(false);
  const [pendingCreateParentId, setPendingCreateParentId] = useState<string | null>(null);

  // ─── Data loading ──────────────────────────────────────────────────────────

  useEffect(() => { if (id) loadData(); }, [id]);

  const loadData = () => {
    if (!id) return;
    const tmpl = dataStore.getTemplate(id);
    if (!tmpl) {
      toast.error("模板不存在");
      navigate("/admin/template");
      return;
    }
    setTemplate(tmpl);
    const cats = dataStore.getKnowledgeCategories(id);
    setCategories(cats);
    // auto-expand root nodes
    setExpanded(new Set(cats.filter(c => c.parentId === null).map(c => c.id)));
  };

  // ─── Tree helpers ──────────────────────────────────────────────────────────

  const rootCats = useMemo(
    () => categories.filter(c => c.parentId === null).sort((a, b) => a.order - b.order),
    [categories]
  );

  const childrenOf = (parentId: string) =>
    categories.filter(c => c.parentId === parentId).sort((a, b) => a.order - b.order);

  const isLeaf = (catId: string) => !categories.some(c => c.parentId === catId);

  const depthOf = (cat: KnowledgeCategory): number => {
    let d = 0, cur: KnowledgeCategory | undefined = cat;
    while (cur?.parentId) { d++; cur = categories.find(c => c.id === cur!.parentId); }
    return d;
  };

  const allDescendantIds = (catId: string): Set<string> => {
    const ids = new Set<string>([catId]);
    const walk = (id: string) => childrenOf(id).forEach(c => { ids.add(c.id); walk(c.id); });
    walk(catId);
    return ids;
  };

  // ─── Expand / collapse ─────────────────────────────────────────────────────

  const toggle = (id: string) =>
    setExpanded(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const expandAll = () =>
    setExpanded(new Set(categories.filter(c => childrenOf(c.id).length > 0).map(c => c.id)));

  const collapseAll = () => setExpanded(new Set());

  // ─── Dialog helpers ────────────────────────────────────────────────────────

  const openCreate = (parentId: string | null) => {
    // If parent already has form types configured, warn: adding child will clear them
    if (parentId) {
      const parent = categories.find(c => c.id === parentId);
      if (parent && parent.formTypes.length > 0) {
        setPendingCreateParentId(parentId);
        setParentClearConfirmOpen(true);
        return;
      }
    }
    setEditingCat(null);
    setForm({ ...EMPTY_FORM, parentId });
    setFormError("");
    setDialogOpen(true);
  };

  const openEdit = (cat: KnowledgeCategory) => {
    setEditingCat(cat);
    setForm({ name: cat.name, parentId: cat.parentId, formTypes: [...cat.formTypes] });
    setFormError("");
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingCat(null);
    setForm(EMPTY_FORM);
    setFormError("");
  };

  const confirmParentClear = () => {
    setParentClearConfirmOpen(false);
    setEditingCat(null);
    setForm({ ...EMPTY_FORM, parentId: pendingCreateParentId });
    setFormError("");
    setDialogOpen(true);
    setPendingCreateParentId(null);
  };

  // ─── Save category ─────────────────────────────────────────────────────────

  const handleSave = () => {
    setFormError("");
    const trimName = form.name.trim();

    if (!trimName) { setFormError("类目名称不能为空"); return; }

    // Uniqueness within template (global)
    const dupExists = categories.some(
      c => c.name === trimName && c.id !== editingCat?.id
    );
    if (dupExists) { setFormError("该类目不唯一：模板内已存在同名类目"); return; }

    // Level check
    let level = 1;
    if (form.parentId) {
      const parent = categories.find(c => c.id === form.parentId);
      if (parent) {
        level = parent.level + 1;
        if (level > 5) { setFormError("类目层级不得超过 5 层"); return; }
      }
    }

    // Non-leaf categories cannot have form types — derive whether this category will be a leaf
    const willBeLeaf = editingCat ? isLeaf(editingCat.id) : true; // new categories always start as leaf

    // Leaf must have form types (only when editing an existing leaf)
    if (editingCat && isLeaf(editingCat.id) && form.formTypes.length === 0) {
      setFormError("末级类目必须指定至少一个知识形态");
      return;
    }

    // Determine actual formTypes to save: non-leaf categories get empty formTypes
    const formTypesToSave = willBeLeaf ? form.formTypes : [];

    if (editingCat) {
      dataStore.updateKnowledgeCategory(editingCat.id, {
        name: trimName,
        parentId: form.parentId,
        formTypes: formTypesToSave,
        level,
      });
      toast.success("知识类目已更新");
    } else {
      const siblings = categories.filter(c => c.parentId === form.parentId);
      const maxOrder = siblings.length > 0 ? Math.max(...siblings.map(s => s.order)) : 0;
      dataStore.addKnowledgeCategory({
        name: trimName,
        parentId: form.parentId,
        formTypes: formTypesToSave,
        templateId: id!,
        order: maxOrder + 1,
        level,
      });
      // After creating a child, clear parent's form types (parent is now non-leaf)
      if (form.parentId) {
        const parent = categories.find(c => c.id === form.parentId);
        if (parent && parent.formTypes.length > 0) {
          dataStore.updateKnowledgeCategory(form.parentId, { formTypes: [] });
        }
        setExpanded(prev => new Set(prev).add(form.parentId!));
      }
    }

    loadData();
    closeDialog();
  };

  // ─── Delete category ───────────────────────────────────────────────────────

  const requestDelete = (cat: KnowledgeCategory) => {
    if (!isLeaf(cat.id)) {
      toast.error("该类目下有子类目，不可删除");
      return;
    }
    setPendingDelete(cat);
    setConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (!pendingDelete) return;
    const ok = dataStore.deleteKnowledgeCategory(pendingDelete.id);
    if (ok) { toast.success("知识类目已删除"); loadData(); }
    else { toast.error("删除失败：该类目下有子类目"); }
    setConfirmOpen(false);
    setPendingDelete(null);
  };

  // ─── Template toggle ───────────────────────────────────────────────────────

  const handleToggleTemplate = () => {
    if (!template) return;
    const enabling = !template.enabled;
    if (enabling && template.relationshipId) {
      const rel = dataStore.getRelationship(template.relationshipId);
      const ind = rel && dataStore.getIndustry(rel.industryId);
      const dom = rel && dataStore.getDomain(rel.domainId);
      const scn = rel && dataStore.getScenario(rel.scenarioId);
      if (!rel?.enabled || !ind?.enabled || !dom?.enabled || !scn?.enabled) {
        toast.warning("该模板关联的场景组合当前为停用状态，启用后将不可用");
      }
    }
    if (!enabling && template.usedByProjects) {
      toast.warning("停用后，新项目不可选用该模板，已使用的项目不受影响");
    }
    dataStore.updateTemplate(template.id, { enabled: enabling });
    toast.success(enabling ? "模板已启用" : "模板已停用");
    loadData();
  };

  // ─── Stats ────────────────────────────────────────────────────────────────

  const stats = useMemo(() => {
    const total = categories.length;
    const leaves = categories.filter(c => isLeaf(c.id));
    const leafTotal = leaves.length;
    const incomplete = leaves.filter(c => c.formTypes.length === 0).length;
    const maxLevel = total > 0 ? Math.max(...categories.map(c => c.level)) : 0;
    return { total, leafTotal, incomplete, maxLevel };
  }, [categories]);

  // ─── Available parents for the form ───────────────────────────────────────

  const availableParents = useMemo((): KnowledgeCategory[] => {
    if (editingCat) {
      const excluded = allDescendantIds(editingCat.id);
      return categories.filter(c => !excluded.has(c.id) && c.level < 5);
    }
    return categories.filter(c => c.level < 5);
  }, [editingCat, categories]);

  // ─── Relationship label ────────────────────────────────────────────────────

  const scenarioLabel = useMemo(() => {
    if (!template?.relationshipId) return "通用模板";
    const rel = dataStore.getRelationship(template.relationshipId);
    if (!rel) return "未知";
    const ind = dataStore.getIndustry(rel.industryId);
    const dom = dataStore.getDomain(rel.domainId);
    const scn = dataStore.getScenario(rel.scenarioId);
    return `${ind?.name || "?"} · ${dom?.name || "?"} · ${scn?.name || "?"}`;
  }, [template]);

  // ─── Render tree node ─────────────────────────────────────────────────────

  const renderNode = (cat: KnowledgeCategory, depth: number) => {
    const children = childrenOf(cat.id);
    const leaf = isLeaf(cat.id);
    const hasTypes = cat.formTypes.length > 0;
    const warn = leaf && !hasTypes;
    const isOpen = expanded.has(cat.id);
    const lc = levelColor(depth);

    return (
      <Box key={cat.id}>
        {/* Node row */}
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            ml: `${depth * 28}px`,
            mb: 0.75,
            position: "relative",
          }}
        >
          {/* Vertical connector line from parent */}
          {depth > 0 && (
            <Box
              sx={{
                position: "absolute",
                left: -20,
                top: 0,
                bottom: 0,
                width: "1px",
                bgcolor: "#e5e7eb",
              }}
            />
          )}
          {/* Horizontal connector */}
          {depth > 0 && (
            <Box
              sx={{
                position: "absolute",
                left: -20,
                top: "18px",
                width: "16px",
                height: "1px",
                bgcolor: "#e5e7eb",
              }}
            />
          )}

          {/* Expand toggle */}
          <Box sx={{ width: 24, flexShrink: 0, mt: "10px" }}>
            {!leaf ? (
              <IconButton
                size="small"
                onClick={() => toggle(cat.id)}
                sx={{ p: 0, color: "#9ca3af", "&:hover": { color: "#374151" } }}
              >
                {isOpen
                  ? <ExpandMore sx={{ fontSize: 18 }} />
                  : <ChevronRight sx={{ fontSize: 18 }} />
                }
              </IconButton>
            ) : (
              <LabelOutlined sx={{ fontSize: 14, color: lc, mt: "3px", ml: "5px" }} />
            )}
          </Box>

          {/* Card */}
          <Box
            sx={{
              flex: 1,
              border: `1px solid ${warn ? "#fde68a" : "#e5e7eb"}`,
              borderLeft: `3px solid ${warn ? "#f59e0b" : lc}`,
              borderRadius: "8px",
              bgcolor: warn ? "#fffbeb" : "#fff",
              p: 1.5,
              transition: "box-shadow 0.15s, border-color 0.15s",
              "&:hover": {
                boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
                borderColor: warn ? "#f59e0b" : lc,
                "& .cat-actions": { opacity: 1 },
              },
            }}
          >
            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
              {/* Icon */}
              <Box sx={{ mt: 0.25, flexShrink: 0 }}>
                {leaf
                  ? <LabelOutlined sx={{ fontSize: 18, color: lc }} />
                  : <FolderOutlined sx={{ fontSize: 18, color: lc }} />
                }
              </Box>

              {/* Content */}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                {/* Name row */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, flexWrap: "wrap" }}>
                  <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#111827" }}>
                    {cat.name}
                  </Typography>
                  <Chip
                    label={`第 ${cat.level} 层`}
                    size="small"
                    sx={{ height: 18, fontSize: "10px", bgcolor: "#f3f4f6", color: "#6b7280", border: "none", "& .MuiChip-label": { px: 0.75 } }}
                  />
                  {leaf && (
                    <Chip
                      label="末级"
                      size="small"
                      sx={{ height: 18, fontSize: "10px", bgcolor: `${lc}18`, color: lc, border: `1px solid ${lc}40`, "& .MuiChip-label": { px: 0.75 } }}
                    />
                  )}
                  {!leaf && (
                    <Typography sx={{ fontSize: "11px", color: "#9ca3af" }}>
                      {children.length} 个子类目
                    </Typography>
                  )}
                </Box>

                {/* Form types */}
                {hasTypes && (
                  <Box sx={{ mt: 0.75, display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                    {cat.formTypes.map(ft => {
                      const m = FORM_TYPE_META[ft];
                      return (
                        <Chip
                          key={ft} label={ft} size="small"
                          sx={{ height: 20, fontSize: "11px", bgcolor: m.bg, color: m.color, border: `1px solid ${m.border}`, "& .MuiChip-label": { px: 0.75 } }}
                        />
                      );
                    })}
                  </Box>
                )}

                {/* Warning */}
                {warn && (
                  <Box sx={{ mt: 0.5, display: "flex", alignItems: "center", gap: 0.5 }}>
                    <WarningAmber sx={{ fontSize: 13, color: "#f59e0b" }} />
                    <Typography sx={{ fontSize: "11px", color: "#92400e" }}>末级类目尚未指定知识形态</Typography>
                  </Box>
                )}
              </Box>

              {/* Actions */}
              <Box
                className="cat-actions"
                sx={{ display: "flex", gap: 0.25, flexShrink: 0, opacity: 0, transition: "opacity 0.15s" }}
              >
                {cat.level < 5 && (
                  <Tooltip title="新增子类目">
                    <IconButton
                      size="small"
                      onClick={() => openCreate(cat.id)}
                      sx={{ color: "#9ca3af", "&:hover": { color: "#3b82f6", bgcolor: "#eff6ff" } }}
                    >
                      <Add sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Tooltip>
                )}
                <Tooltip title="编辑类目">
                  <IconButton
                    size="small"
                    onClick={() => openEdit(cat)}
                    sx={{ color: "#9ca3af", "&:hover": { color: "#374151", bgcolor: "#f9fafb" } }}
                  >
                    <Edit sx={{ fontSize: 16 }} />
                  </IconButton>
                </Tooltip>
                <Tooltip title={!leaf ? "有子类目，不可删除" : "删除类目"}>
                  <span>
                    <IconButton
                      size="small"
                      disabled={!leaf}
                      onClick={() => requestDelete(cat)}
                      sx={{ color: "#9ca3af", "&:hover": { color: "#ef4444", bgcolor: "#fef2f2" }, "&.Mui-disabled": { color: "#e5e7eb" } }}
                    >
                      <Delete sx={{ fontSize: 16 }} />
                    </IconButton>
                  </span>
                </Tooltip>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Children */}
        <Collapse in={isOpen && !leaf} unmountOnExit>
          {children.map(child => renderNode(child, depth + 1))}
        </Collapse>
      </Box>
    );
  };

  // ─── Guard ────────────────────────────────────────────────────────────────

  if (!template) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
        <Typography sx={{ color: "#9ca3af" }}>加载中…</Typography>
      </Box>
    );
  }

  // ─── Main render ──────────────────────────────────────────────────────────

  return (
    <Box>
      {/* ── Breadcrumb ── */}
      <Breadcrumbs
        separator={<NavigateNext sx={{ fontSize: 16, color: "#d1d5db" }} />}
        sx={{ mb: 2.5 }}
      >
        <Link
          component="button"
          onClick={() => navigate("/admin/template")}
          sx={{ fontSize: "13px", color: "#6b7280", textDecoration: "none", background: "none", border: "none", cursor: "pointer", "&:hover": { color: "#3b82f6" } }}
        >
          知识构建方案模板管理
        </Link>
        <Typography sx={{ fontSize: "13px", color: "#374151" }}>{template.name}</Typography>
        <Typography sx={{ fontSize: "13px", color: "#111827", fontWeight: 600 }}>知识类目配置</Typography>
      </Breadcrumbs>

      {/* ── Template info card ── */}
      <Paper sx={{ mb: 2.5, border: "1px solid #e5e7eb", borderRadius: "10px", boxShadow: "none", overflow: "hidden" }}>
        {/* Top section */}
        <Box sx={{ p: 2.5 }}>
          <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 2 }}>
            {/* Left: name + meta */}
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.75 }}>
                <AccountTree sx={{ fontSize: 20, color: "#3b82f6" }} />
                <Typography sx={{ fontSize: "17px", fontWeight: 700, color: "#111827" }}>
                  {template.name}
                </Typography>
                <Chip
                  label={template.enabled ? "已启用" : "已停用"}
                  size="small"
                  sx={{
                    height: 22, fontSize: "11px",
                    bgcolor: template.enabled ? "#d1fae5" : "#f3f4f6",
                    color: template.enabled ? "#065f46" : "#6b7280",
                    border: "none", "& .MuiChip-label": { px: 1 },
                  }}
                />
              </Box>
              {template.description && (
                <Typography sx={{ fontSize: "13px", color: "#6b7280", mb: 1 }}>{template.description}</Typography>
              )}
              <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                <Box>
                  <Typography sx={{ fontSize: "11px", color: "#9ca3af" }}>关联场景</Typography>
                  <Typography sx={{ fontSize: "12px", color: "#374151", fontWeight: 500 }}>{scenarioLabel}</Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: "11px", color: "#9ca3af" }}>创建时间</Typography>
                  <Typography sx={{ fontSize: "12px", color: "#374151" }}>
                    {new Date(template.createdAt).toLocaleString("zh-CN")}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Right: stats */}
            <Box sx={{ display: "flex", gap: 1.5, flexShrink: 0 }}>
              {[
                { label: "类目总数", value: stats.total, color: "#3b82f6" },
                { label: "末级类目", value: stats.leafTotal, color: "#8b5cf6" },
                { label: "最大层级", value: stats.maxLevel || "—", color: "#10b981" },
                {
                  label: "待配置",
                  value: stats.incomplete,
                  color: stats.incomplete > 0 ? "#f59e0b" : "#10b981",
                },
              ].map(s => (
                <Box
                  key={s.label}
                  sx={{ textAlign: "center", px: 1.75, py: 1.25, bgcolor: "#f9fafb", borderRadius: "8px", border: "1px solid #e5e7eb", minWidth: 64 }}
                >
                  <Typography sx={{ fontSize: "20px", fontWeight: 700, color: s.color, lineHeight: 1.2 }}>
                    {s.value}
                  </Typography>
                  <Typography sx={{ fontSize: "11px", color: "#9ca3af" }}>{s.label}</Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>

        <Divider sx={{ borderColor: "#f3f4f6" }} />

        {/* Bottom: actions */}
        <Box sx={{ px: 2.5, py: 1.75, display: "flex", alignItems: "center", justifyContent: "space-between", bgcolor: "#fafafa" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Button
              startIcon={<ArrowBack />}
              onClick={() => navigate("/admin/template")}
              size="small"
              sx={{ textTransform: "none", fontSize: "13px", color: "#374151", border: "1px solid #e5e7eb", borderRadius: "6px", px: 1.5, py: 0.625, bgcolor: "#fff", "&:hover": { bgcolor: "#f9fafb" } }}
            >
              返回列表
            </Button>

            {/* Status toggle */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
              <Typography sx={{ fontSize: "12px", color: "#6b7280" }}>启用状态：</Typography>
              <Switch
                checked={template.enabled}
                onChange={handleToggleTemplate}
                size="small"
                sx={{ "& .MuiSwitch-switchBase.Mui-checked": { color: "#3b82f6" }, "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: "#93c5fd" } }}
              />
              <Typography sx={{ fontSize: "12px", fontWeight: 500, color: template.enabled ? "#059669" : "#9ca3af" }}>
                {template.enabled ? "已启用" : "已停用"}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: "flex", gap: 1 }}>
            <Tooltip title="展开所有类目">
              <Button
                size="small" startIcon={<UnfoldMore sx={{ fontSize: "15px !important" }} />}
                onClick={expandAll}
                sx={{ textTransform: "none", fontSize: "12px", color: "#374151", border: "1px solid #e5e7eb", borderRadius: "6px", px: 1.5, py: 0.5, bgcolor: "#fff", "&:hover": { bgcolor: "#f9fafb" } }}
              >
                展开全部
              </Button>
            </Tooltip>
            <Tooltip title="折叠所有类目">
              <Button
                size="small" startIcon={<UnfoldLess sx={{ fontSize: "15px !important" }} />}
                onClick={collapseAll}
                sx={{ textTransform: "none", fontSize: "12px", color: "#374151", border: "1px solid #e5e7eb", borderRadius: "6px", px: 1.5, py: 0.5, bgcolor: "#fff", "&:hover": { bgcolor: "#f9fafb" } }}
              >
                折叠全部
              </Button>
            </Tooltip>
          </Box>
        </Box>
      </Paper>

      {/* ── Rules hint ── */}
      <Alert
        severity="info"
        icon={<InfoOutlined sx={{ fontSize: 16 }} />}
        sx={{ mb: 2, bgcolor: "#eff6ff", color: "#1e40af", border: "1px solid #bfdbfe", borderRadius: "8px", py: 0.5, "& .MuiAlert-message": { fontSize: "12px", py: 0.25 }, "& .MuiAlert-icon": { color: "#3b82f6", alignItems: "center" } }}
      >
        知识类目支持最多 <strong>5 层</strong>树形结构 &nbsp;·&nbsp; 末级类目（叶子节点）必须指定至少一个<strong>知识形态</strong> &nbsp;·&nbsp; 非末级类目<strong>不可</strong>指定知识形态，仅用作分类节点 &nbsp;·&nbsp; 同一类目可指定<strong>多个</strong>知识形态
      </Alert>

      {/* ── Completeness banner ── */}
      {stats.total > 0 && stats.incomplete > 0 && (
        <Alert
          severity="warning"
          icon={<WarningAmber sx={{ fontSize: 16 }} />}
          sx={{ mb: 2, bgcolor: "#fffbeb", color: "#92400e", border: "1px solid #fde68a", borderRadius: "8px", py: 0.5, "& .MuiAlert-message": { fontSize: "12px", py: 0.25 }, "& .MuiAlert-icon": { color: "#f59e0b", alignItems: "center" } }}
        >
          有 <strong>{stats.incomplete}</strong> 个末级类目尚未指定知识形态，请配置完整后再启用模板
        </Alert>
      )}
      {stats.total > 0 && stats.incomplete === 0 && (
        <Alert
          severity="success"
          icon={<CheckCircle sx={{ fontSize: 16 }} />}
          sx={{ mb: 2, bgcolor: "#f0fdf4", color: "#065f46", border: "1px solid #bbf7d0", borderRadius: "8px", py: 0.5, "& .MuiAlert-message": { fontSize: "12px", py: 0.25 }, "& .MuiAlert-icon": { color: "#10b981", alignItems: "center" } }}
        >
          所有末级类目均已配置知识形态，模板配置完整
        </Alert>
      )}

      {/* ── Tree panel ── */}
      <Paper sx={{ p: 2.5, border: "1px solid #e5e7eb", borderRadius: "10px", boxShadow: "none", minHeight: 300 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
          <Typography sx={{ fontSize: "14px", fontWeight: 600, color: "#374151" }}>
            知识类目树
          </Typography>
          <Typography sx={{ fontSize: "12px", color: "#9ca3af" }}>
            {rootCats.length} 个根类目 · 共 {stats.total} 个类目
          </Typography>
        </Box>

        {rootCats.length === 0 ? (
          /* Empty state */
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 10, gap: 2 }}>
            <AccountTree sx={{ fontSize: 52, color: "#e5e7eb" }} />
            <Typography sx={{ fontSize: "14px", color: "#9ca3af" }}>
              暂无知识类目，点击「新增根类目」开始配置
            </Typography>
            <Button
              variant="outlined" startIcon={<Add />}
              onClick={() => openCreate(null)}
              sx={{ textTransform: "none", borderColor: "#3b82f6", color: "#3b82f6", borderRadius: "6px", "&:hover": { bgcolor: "#eff6ff" } }}
            >
              新增根类目
            </Button>
          </Box>
        ) : (
          <Box sx={{ "& .cat-actions": { opacity: 0 } }}>
            {rootCats.map(cat => renderNode(cat, 0))}
          </Box>
        )}
      </Paper>

      {/* ── Add / Edit Dialog ── */}
      <Dialog
        open={dialogOpen}
        onClose={closeDialog}
        maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: "12px", boxShadow: "0 24px 48px rgba(0,0,0,0.14)" } }}
      >
        <DialogTitle sx={{ fontSize: "15px", fontWeight: 700, color: "#111827", borderBottom: "1px solid #f3f4f6", py: 2, px: 3 }}>
          {editingCat
            ? "编辑知识类目"
            : form.parentId
              ? `新增子类目（父级：${categories.find(c => c.id === form.parentId)?.name}）`
              : "新增根类目"
          }
        </DialogTitle>
        <DialogContent sx={{ px: 3, pt: 2.5, pb: 1 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>

            {/* Parent hint */}
            {form.parentId && (
              <Box sx={{ display: "flex", gap: 0.75, alignItems: "center", p: 1.25, bgcolor: "#f9fafb", borderRadius: "6px", border: "1px solid #e5e7eb" }}>
                <ChevronRight sx={{ fontSize: 15, color: "#9ca3af" }} />
                <Typography sx={{ fontSize: "12px", color: "#6b7280" }}>父级类目：</Typography>
                <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "#374151" }}>
                  {categories.find(c => c.id === form.parentId)?.name}
                </Typography>
                <Chip
                  label={`第 ${(categories.find(c => c.id === form.parentId)?.level ?? 0) + 1} 层`}
                  size="small"
                  sx={{ height: 18, fontSize: "10px", bgcolor: "#e5e7eb", color: "#374151", border: "none", "& .MuiChip-label": { px: 0.75 } }}
                />
              </Box>
            )}

            {/* Name */}
            <TextField
              label="类目名称" required size="small" fullWidth autoFocus
              value={form.name}
              onChange={e => { setForm({ ...form, name: e.target.value }); setFormError(""); }}
              placeholder="请输入知识类目名称（模板内唯一）"
              error={!!formError && formError.includes("类目")}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "6px" } }}
            />

            {/* Parent selector */}
            <TextField
              select size="small" fullWidth
              label="父级类目"
              value={form.parentId ?? ""}
              onChange={e => setForm({ ...form, parentId: e.target.value || null })}
              helperText="留空则创建为根类目（第 1 层）"
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "6px" } }}
            >
              <MenuItem value="">无（根类目）</MenuItem>
              {availableParents.map(c => (
                <MenuItem key={c.id} value={c.id}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                    <Typography sx={{ fontSize: "13px" }}>
                      {"　".repeat(c.level - 1)}{c.name}
                    </Typography>
                    <Typography sx={{ fontSize: "11px", color: "#9ca3af" }}>· 第 {c.level} 层</Typography>
                  </Box>
                </MenuItem>
              ))}
            </TextField>

            {/* Form types — only for leaf categories */}
            {editingCat && !isLeaf(editingCat.id) ? (
              /* Non-leaf: cannot specify form types */
              <Box sx={{ p: 1.5, bgcolor: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: "6px", display: "flex", alignItems: "flex-start", gap: 1 }}>
                <InfoOutlined sx={{ fontSize: 16, color: "#9ca3af", mt: "1px", flexShrink: 0 }} />
                <Typography sx={{ fontSize: "12px", color: "#6b7280", lineHeight: 1.6 }}>
                  该类目下有子类目，属于<strong>非末级节点</strong>，不可指定知识形态。<br />
                  知识形态仅允许在末级类目（叶子节点）上配置。
                </Typography>
              </Box>
            ) : (
              <FormControl fullWidth size="small">
                <InputLabel>知识形态</InputLabel>
                <Select
                  multiple
                  value={form.formTypes}
                  onChange={e => setForm({ ...form, formTypes: e.target.value as KnowledgeFormType[] })}
                  input={<OutlinedInput label="知识形态" sx={{ borderRadius: "6px" }} />}
                  renderValue={selected => (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {selected.map(v => {
                        const m = FORM_TYPE_META[v];
                        return (
                          <Chip key={v} label={v} size="small"
                            sx={{ height: 20, fontSize: "11px", bgcolor: m.bg, color: m.color, border: `1px solid ${m.border}`, "& .MuiChip-label": { px: 0.75 } }}
                          />
                        );
                      })}
                    </Box>
                  )}
                >
                  {Object.values(KnowledgeFormType).map(ft => {
                    const m = FORM_TYPE_META[ft];
                    const sel = form.formTypes.includes(ft);
                    return (
                      <MenuItem key={ft} value={ft}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, width: "100%" }}>
                          <Box sx={{ width: 10, height: 10, borderRadius: "2px", bgcolor: sel ? m.bg : "transparent", border: `1.5px solid ${m.border}`, flexShrink: 0 }} />
                          <Chip label={ft} size="small"
                            sx={{ height: 20, fontSize: "11px", bgcolor: m.bg, color: m.color, border: `1px solid ${m.border}`, "& .MuiChip-label": { px: 0.75 } }}
                          />
                        </Box>
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            )}

            {/* Leaf warning when editing */}
            {editingCat && isLeaf(editingCat.id) && (
              <Alert severity="warning"
                sx={{ bgcolor: "#fffbeb", color: "#92400e", border: "1px solid #fde68a", borderRadius: "6px", py: 0.5, "& .MuiAlert-message": { fontSize: "12px", py: 0 }, "& .MuiAlert-icon": { color: "#f59e0b" } }}
              >
                该类目为末级类目（叶子节点），必须指定至少一个知识形态
              </Alert>
            )}

            {/* Error message */}
            {formError && (
              <Alert severity="error"
                sx={{ bgcolor: "#fef2f2", color: "#991b1b", border: "1px solid #fecaca", borderRadius: "6px", py: 0.5, "& .MuiAlert-message": { fontSize: "12px", py: 0 }, "& .MuiAlert-icon": { color: "#ef4444" } }}
              >
                {formError}
              </Alert>
            )}

            {/* Help hint */}
            {!editingCat && (
              <Box sx={{ p: 1.25, bgcolor: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "6px" }}>
                <Typography sx={{ fontSize: "12px", color: "#065f46" }}>
                  提示：末级类目（叶子节点）必须指定知识形态；非末级类目<strong>不可</strong>指定知识形态，仅作为分类节点。同一类目可指定多个知识形态。
                </Typography>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ borderTop: "1px solid #f3f4f6", px: 3, py: 2, gap: 1 }}>
          <Button onClick={closeDialog} sx={{ textTransform: "none", color: "#374151", borderRadius: "6px", px: 2, fontSize: "13px" }}>
            取消
          </Button>
          <Button onClick={handleSave} variant="contained"
            sx={{ bgcolor: "#3b82f6", borderRadius: "6px", textTransform: "none", px: 2.5, fontSize: "13px", boxShadow: "none", "&:hover": { bgcolor: "#2563eb", boxShadow: "none" } }}
          >
            {editingCat ? "保存修改" : "创建类目"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Parent-has-formTypes Confirm Dialog ── */}
      <Dialog
        open={parentClearConfirmOpen}
        onClose={() => { setParentClearConfirmOpen(false); setPendingCreateParentId(null); }}
        maxWidth="xs" fullWidth
        PaperProps={{ sx: { borderRadius: "12px", boxShadow: "0 20px 40px rgba(0,0,0,0.12)" } }}
      >
        <DialogTitle sx={{ fontSize: "15px", fontWeight: 700, color: "#111827", py: 2, px: 3 }}>
          添加子类目
        </DialogTitle>
        <DialogContent sx={{ px: 3, pb: 1 }}>
          <Alert severity="warning"
            sx={{ bgcolor: "#fffbeb", color: "#92400e", border: "1px solid #fde68a", borderRadius: "6px", "& .MuiAlert-icon": { color: "#f59e0b" }, "& .MuiAlert-message": { fontSize: "13px", lineHeight: 1.7 } }}
          >
            类目「<strong>{categories.find(c => c.id === pendingCreateParentId)?.name}</strong>」已配置了以下知识形态：
            <Box sx={{ mt: 0.75, display: "flex", gap: 0.5, flexWrap: "wrap" }}>
              {(categories.find(c => c.id === pendingCreateParentId)?.formTypes ?? []).map(ft => {
                const m = FORM_TYPE_META[ft];
                return (
                  <Chip key={ft} label={ft} size="small"
                    sx={{ height: 20, fontSize: "11px", bgcolor: m.bg, color: m.color, border: `1px solid ${m.border}`, "& .MuiChip-label": { px: 0.75 } }}
                  />
                );
              })}
            </Box>
            <Box sx={{ mt: 1 }}>
              添加子类目后，该类目将成为<strong>非末级节点</strong>，其已配置的知识形态将被<strong>自动清除</strong>。是否继续？
            </Box>
          </Alert>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button
            onClick={() => { setParentClearConfirmOpen(false); setPendingCreateParentId(null); }}
            sx={{ textTransform: "none", color: "#374151", borderRadius: "6px", px: 2, fontSize: "13px" }}
          >
            取消
          </Button>
          <Button
            onClick={confirmParentClear}
            variant="contained"
            sx={{ bgcolor: "#f59e0b", borderRadius: "6px", textTransform: "none", px: 2.5, fontSize: "13px", boxShadow: "none", "&:hover": { bgcolor: "#d97706", boxShadow: "none" } }}
          >
            确认继续
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Delete Confirm Dialog ── */}
      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        maxWidth="xs" fullWidth
        PaperProps={{ sx: { borderRadius: "12px", boxShadow: "0 20px 40px rgba(0,0,0,0.12)" } }}
      >
        <DialogTitle sx={{ fontSize: "15px", fontWeight: 700, color: "#111827", py: 2, px: 3 }}>
          删除知识类目
        </DialogTitle>
        <DialogContent sx={{ px: 3, pb: 1 }}>
          <Alert severity="warning"
            sx={{ bgcolor: "#fffbeb", color: "#92400e", border: "1px solid #fde68a", borderRadius: "6px", "& .MuiAlert-icon": { color: "#f59e0b" }, "& .MuiAlert-message": { fontSize: "13px" } }}
          >
            确认删除类目「<strong>{pendingDelete?.name}</strong>」？此操作不可撤销。
          </Alert>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button onClick={() => setConfirmOpen(false)} sx={{ textTransform: "none", color: "#374151", borderRadius: "6px", px: 2, fontSize: "13px" }}>
            取消
          </Button>
          <Button onClick={confirmDelete} variant="contained"
            sx={{ bgcolor: "#ef4444", borderRadius: "6px", textTransform: "none", px: 2.5, fontSize: "13px", boxShadow: "none", "&:hover": { bgcolor: "#dc2626", boxShadow: "none" } }}
          >
            确认删除
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}