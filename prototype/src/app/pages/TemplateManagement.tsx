import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Switch,
  Tooltip,
  InputAdornment,
  Divider,
  Alert,
} from "@mui/material";
import {
  Add,
  Edit,
  Delete,
  ContentCopy,
  Settings,
  Search,
  LayersOutlined,
  CheckCircleOutline,
  RadioButtonUnchecked,
  WarningAmberOutlined,
  AccountTree,
  Close,
} from "@mui/icons-material";
import { dataStore } from "../store/DataStore";
import { Template } from "../types";
import { toast } from "sonner";

type DialogMode = "create" | "edit" | "copy" | null;

const EMPTY_FORM = { name: "", description: "", relationshipId: "" };

export function TemplateManagement() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [relationships, setRelationships] = useState<any[]>([]);
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [activeTemplate, setActiveTemplate] = useState<Template | null>(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [copyName, setCopyName] = useState("");
  const [copyRelationshipId, setCopyRelationshipId] = useState("");
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "enabled" | "disabled">("all");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [pendingDeleteTemplate, setPendingDeleteTemplate] = useState<Template | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setTemplates(dataStore.getTemplates());
    setRelationships(dataStore.getRelationships());
  };

  // ─── Computed helpers ────────────────────────────────────────────────────────

  const getRelationshipLabel = (relId?: string) => {
    if (!relId) return "通用模板";
    const rel = dataStore.getRelationship(relId);
    if (!rel) return "未知";
    const industry = dataStore.getIndustry(rel.industryId);
    const domain = dataStore.getDomain(rel.domainId);
    const scenario = dataStore.getScenario(rel.scenarioId);
    return `${industry?.name || "?"} · ${domain?.name || "?"} · ${scenario?.name || "?"}`;
  };

  const isScenarioCombinationEnabled = (relId?: string) => {
    if (!relId) return true;
    const rel = dataStore.getRelationship(relId);
    if (!rel || !rel.enabled) return false;
    const industry = dataStore.getIndustry(rel.industryId);
    const domain = dataStore.getDomain(rel.domainId);
    const scenario = dataStore.getScenario(rel.scenarioId);
    return !!(industry?.enabled && domain?.enabled && scenario?.enabled);
  };

  const isTemplateAvailable = (t: Template) => t.enabled && isScenarioCombinationEnabled(t.relationshipId);

  const getCategoryCount = (templateId: string) =>
    dataStore.getKnowledgeCategories(templateId).length;

  const getLeafCount = (templateId: string) => {
    const cats = dataStore.getKnowledgeCategories(templateId);
    return cats.filter(c => !cats.some(x => x.parentId === c.id)).length;
  };

  const getIncompleteLeafCount = (templateId: string) => {
    const cats = dataStore.getKnowledgeCategories(templateId);
    return cats.filter(c => !cats.some(x => x.parentId === c.id) && c.formTypes.length === 0).length;
  };

  // ─── Stats ───────────────────────────────────────────────────────────────────

  const stats = useMemo(() => {
    const total = templates.length;
    const enabled = templates.filter(t => t.enabled).length;
    const available = templates.filter(t => isTemplateAvailable(t)).length;
    return { total, enabled, available };
  }, [templates]);

  // ─── Filtered list ────────────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    return templates.filter(t => {
      const matchText = !searchText || t.name.toLowerCase().includes(searchText.toLowerCase());
      const matchStatus =
        filterStatus === "all" ||
        (filterStatus === "enabled" && t.enabled) ||
        (filterStatus === "disabled" && !t.enabled);
      return matchText && matchStatus;
    });
  }, [templates, searchText, filterStatus]);

  // ─── Dialog handlers ─────────────────────────────────────────────────────────

  const openCreate = () => {
    setActiveTemplate(null);
    setFormData(EMPTY_FORM);
    setDialogMode("create");
  };

  const openEdit = (t: Template) => {
    setActiveTemplate(t);
    setFormData({ name: t.name, description: t.description || "", relationshipId: t.relationshipId || "" });
    setDialogMode("edit");
  };

  const openCopy = (t: Template) => {
    setActiveTemplate(t);
    setCopyName(`${t.name} - 副本`);
    setCopyRelationshipId(t.relationshipId || "");
    setDialogMode("copy");
  };

  const closeDialog = () => {
    setDialogMode(null);
    setActiveTemplate(null);
    setFormData(EMPTY_FORM);
    setCopyName("");
    setCopyRelationshipId("");
  };

  // ─── CRUD actions ─────────────────────────────────────────────────────────────

  const handleSaveCreate = () => {
    if (!formData.name.trim()) { toast.error("模板名称不能为空"); return; }
    if (dataStore.isTemplateNameExists(formData.name.trim())) { toast.error("模板名称已存在"); return; }
    dataStore.addTemplate({
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      relationshipId: formData.relationshipId || undefined,
      enabled: false,
    });
    toast.success("模板创建成功，状态为停用，需手动启用后才可选用");
    loadData();
    closeDialog();
  };

  const handleSaveEdit = () => {
    if (!activeTemplate) return;
    if (!formData.name.trim()) { toast.error("模板名称不能为空"); return; }
    if (dataStore.isTemplateNameExists(formData.name.trim(), activeTemplate.id)) { toast.error("模板名称已存在"); return; }
    dataStore.updateTemplate(activeTemplate.id, {
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      relationshipId: formData.relationshipId || undefined,
    });
    toast.success("模板信息更新成功");
    loadData();
    closeDialog();
  };

  const handleSaveCopy = () => {
    if (!activeTemplate) return;
    if (!copyName.trim()) { toast.error("新模板名称不能为空"); return; }
    if (dataStore.isTemplateNameExists(copyName.trim())) { toast.error("模板名称已存在"); return; }
    const result = dataStore.duplicateTemplate(activeTemplate.id, copyName.trim(), copyRelationshipId || undefined);
    if (result) {
      toast.success("模板复制成功，新模板状态为停用");
      loadData();
      closeDialog();
    } else {
      toast.error("源模板不存在");
    }
  };

  const handleToggleEnabled = (t: Template) => {
    const enabling = !t.enabled;
    if (enabling && t.relationshipId && !isScenarioCombinationEnabled(t.relationshipId)) {
      toast.warning("该模板关联的场景组合当前为停用状态，启用后将不可用");
    }
    if (!enabling && t.usedByProjects) {
      toast.warning("停用后，新项目不可选用该模板，已使用的项目不受影响");
    }
    dataStore.updateTemplate(t.id, { enabled: enabling });
    toast.success(enabling ? "模板已启用" : "模板已停用");
    loadData();
  };

  const handleDelete = (t: Template) => {
    if (t.usedByProjects) { toast.error("该模板已被项目使用，不可删除"); return; }
    setPendingDeleteTemplate(t);
    setDeleteConfirmOpen(true);
  };

  const confirmDeleteTemplate = () => {
    if (!pendingDeleteTemplate) return;
    const ok = dataStore.deleteTemplate(pendingDeleteTemplate.id);
    if (ok) { toast.success("模板已删除"); loadData(); }
    else { toast.error("该模板已被项目使用，不可删除"); }
    setDeleteConfirmOpen(false);
    setPendingDeleteTemplate(null);
  };

  const handleConfigure = (t: Template) => {
    navigate(`/admin/template/${t.id}/edit`);
  };

  // ─── Relationship selector items ──────────────────────────────────────────────

  const RelSelector = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
    <TextField
      select fullWidth size="small" label="关联场景组合"
      value={value}
      onChange={e => onChange(e.target.value)}
      helperText="留空则为通用模板，可被所有项目选用"
      sx={{ "& .MuiOutlinedInput-root": { borderRadius: "6px" } }}
    >
      <MenuItem value="">不关联（通用模板）</MenuItem>
      {relationships.map(rel => (
        <MenuItem key={rel.id} value={rel.id}>
          {getRelationshipLabel(rel.id)}
        </MenuItem>
      ))}
    </TextField>
  );

  // ─── Render ───────────────────────────────────────────────────────────────────

  return (
    <Box>
      {/* ── Page header ── */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 3 }}>
        <Box>
          <Typography sx={{ fontSize: "20px", fontWeight: 700, color: "#111827" }}>
            知识构建方案模板管理
          </Typography>
          <Typography sx={{ fontSize: "13px", color: "#6b7280", mt: 0.5 }}>
            定义场景下应构建的知识类目与知识形态，为项目知识空间提供可复用的构建目标参考
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={openCreate}
          sx={{
            bgcolor: "#3b82f6", borderRadius: "6px", textTransform: "none",
            px: 2.5, py: 1, fontSize: "13px", boxShadow: "none",
            "&:hover": { bgcolor: "#2563eb", boxShadow: "none" },
          }}
        >
          新增模板
        </Button>
      </Box>

      {/* ── Stats bar ── */}
      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        {[
          { label: "全部模板", value: stats.total, icon: <LayersOutlined sx={{ fontSize: 20, color: "#6b7280" }} />, color: "#374151" },
          { label: "已启用", value: stats.enabled, icon: <CheckCircleOutline sx={{ fontSize: 20, color: "#10b981" }} />, color: "#065f46" },
          { label: "可用模板", value: stats.available, icon: <CheckCircleOutline sx={{ fontSize: 20, color: "#3b82f6" }} />, color: "#1d4ed8" },
        ].map(s => (
          <Paper
            key={s.label}
            sx={{
              flex: 1, px: 2.5, py: 2, display: "flex", alignItems: "center", gap: 2,
              border: "1px solid #e5e7eb", borderRadius: "10px", boxShadow: "none",
            }}
          >
            {s.icon}
            <Box>
              <Typography sx={{ fontSize: "22px", fontWeight: 700, color: s.color, lineHeight: 1.2 }}>
                {s.value}
              </Typography>
              <Typography sx={{ fontSize: "12px", color: "#9ca3af" }}>{s.label}</Typography>
            </Box>
          </Paper>
        ))}
      </Box>

      {/* ── Filter bar ── */}
      <Box sx={{ display: "flex", gap: 1.5, mb: 2, alignItems: "center" }}>
        <TextField
          size="small"
          placeholder="搜索模板名称…"
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          InputProps={{
            startAdornment: <InputAdornment position="start"><Search sx={{ fontSize: 18, color: "#9ca3af" }} /></InputAdornment>,
            endAdornment: searchText ? (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setSearchText("")}><Close sx={{ fontSize: 16 }} /></IconButton>
              </InputAdornment>
            ) : null,
          }}
          sx={{ width: 240, "& .MuiOutlinedInput-root": { borderRadius: "6px", bgcolor: "#fff" } }}
        />
        <Box sx={{ display: "flex", gap: 0.5 }}>
          {(["all", "enabled", "disabled"] as const).map(s => (
            <Button
              key={s}
              size="small"
              variant={filterStatus === s ? "contained" : "outlined"}
              onClick={() => setFilterStatus(s)}
              sx={{
                textTransform: "none", fontSize: "12px", borderRadius: "6px", px: 1.5,
                ...(filterStatus === s
                  ? { bgcolor: "#3b82f6", boxShadow: "none", "&:hover": { bgcolor: "#2563eb", boxShadow: "none" } }
                  : { borderColor: "#e5e7eb", color: "#374151", "&:hover": { borderColor: "#3b82f6", bgcolor: "#eff6ff" } }),
              }}
            >
              {{ all: "全部", enabled: "已启用", disabled: "已停用" }[s]}
            </Button>
          ))}
        </Box>
        <Typography sx={{ fontSize: "12px", color: "#9ca3af", ml: "auto" }}>
          共 {filtered.length} 条
        </Typography>
      </Box>

      {/* ── Table ── */}
      <TableContainer
        component={Paper}
        sx={{
          border: "1px solid #e5e7eb", borderRadius: "10px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)", overflow: "hidden",
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "#f9fafb" }}>
              {[
                "模板名称", "关联场景组合", "知识类目", "启用状态", "可用状态", "创建时间", "操作"
              ].map((h, i) => (
                <TableCell
                  key={h}
                  align={i === 6 ? "right" : "left"}
                  sx={{ fontSize: "12px", fontWeight: 600, color: "#6b7280", py: 1.5, whiteSpace: "nowrap" }}
                >
                  {h}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map(t => {
              const available = isTemplateAvailable(t);
              const catCount = getCategoryCount(t.id);
              const incompleteLeaf = getIncompleteLeafCount(t.id);
              const scenarioOk = isScenarioCombinationEnabled(t.relationshipId);

              return (
                <TableRow
                  key={t.id}
                  sx={{
                    "&:hover": { bgcolor: "#fafafa" },
                    "&:last-child td": { borderBottom: 0 },
                  }}
                >
                  {/* 模板名称 */}
                  <TableCell sx={{ py: 1.5, maxWidth: 240 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <AccountTree sx={{ fontSize: 16, color: "#9ca3af", flexShrink: 0 }} />
                      <Box>
                        <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#111827" }}>
                          {t.name}
                        </Typography>
                        {t.description && (
                          <Typography
                            sx={{ fontSize: "11px", color: "#9ca3af", mt: 0.25, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 200 }}
                          >
                            {t.description}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </TableCell>

                  {/* 关联场景组合 */}
                  <TableCell sx={{ py: 1.5 }}>
                    <Box>
                      <Typography sx={{ fontSize: "12px", color: "#374151" }}>
                        {getRelationshipLabel(t.relationshipId)}
                      </Typography>
                      {t.relationshipId && !scenarioOk && (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.25 }}>
                          <WarningAmberOutlined sx={{ fontSize: 12, color: "#f59e0b" }} />
                          <Typography sx={{ fontSize: "10px", color: "#92400e" }}>场景组合已停用</Typography>
                        </Box>
                      )}
                    </Box>
                  </TableCell>

                  {/* 知识类目 */}
                  <TableCell sx={{ py: 1.5 }}>
                    {catCount === 0 ? (
                      <Typography sx={{ fontSize: "12px", color: "#d1d5db" }}>未配置</Typography>
                    ) : (
                      <Box>
                        <Typography sx={{ fontSize: "12px", color: "#374151", fontWeight: 500 }}>
                          {catCount} 个类目
                        </Typography>
                        {incompleteLeaf > 0 && (
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.25 }}>
                            <WarningAmberOutlined sx={{ fontSize: 11, color: "#f59e0b" }} />
                            <Typography sx={{ fontSize: "10px", color: "#92400e" }}>
                              {incompleteLeaf} 个末级未配形态
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    )}
                  </TableCell>

                  {/* 启用状态 */}
                  <TableCell sx={{ py: 1.5 }}>
                    <Chip
                      icon={t.enabled
                        ? <CheckCircleOutline sx={{ fontSize: "14px !important", color: "#059669 !important" }} />
                        : <RadioButtonUnchecked sx={{ fontSize: "14px !important", color: "#9ca3af !important" }} />
                      }
                      label={t.enabled ? "已启用" : "已停用"}
                      size="small"
                      sx={{
                        height: "22px", fontSize: "11px",
                        bgcolor: t.enabled ? "#d1fae5" : "#f3f4f6",
                        color: t.enabled ? "#065f46" : "#6b7280",
                        border: "none",
                        "& .MuiChip-label": { px: 0.75 },
                        "& .MuiChip-icon": { ml: 0.5 },
                      }}
                    />
                  </TableCell>

                  {/* 可用状态 */}
                  <TableCell sx={{ py: 1.5 }}>
                    <Chip
                      label={available ? "可用" : "不可用"}
                      size="small"
                      sx={{
                        height: "22px", fontSize: "11px",
                        bgcolor: available ? "#dbeafe" : "#fef3c7",
                        color: available ? "#1d4ed8" : "#92400e",
                        border: "none",
                        "& .MuiChip-label": { px: 0.75 },
                      }}
                    />
                  </TableCell>

                  {/* 创建时间 */}
                  <TableCell sx={{ py: 1.5, whiteSpace: "nowrap" }}>
                    <Typography sx={{ fontSize: "12px", color: "#6b7280" }}>
                      {new Date(t.createdAt).toLocaleDateString("zh-CN")}
                    </Typography>
                    <Typography sx={{ fontSize: "11px", color: "#9ca3af" }}>
                      {new Date(t.createdAt).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}
                    </Typography>
                  </TableCell>

                  {/* 操作 */}
                  <TableCell align="right" sx={{ py: 1.5 }}>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 0.5 }}>
                      <Tooltip title="配置知识类目">
                        <IconButton
                          size="small"
                          onClick={() => handleConfigure(t)}
                          sx={{ color: "#9ca3af", "&:hover": { color: "#3b82f6", bgcolor: "#eff6ff" } }}
                        >
                          <Settings sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="编辑模板信息">
                        <IconButton size="small" onClick={() => openEdit(t)} sx={{ color: "#9ca3af", "&:hover": { color: "#374151", bgcolor: "#f9fafb" } }}>
                          <Edit sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="复制模板">
                        <IconButton size="small" onClick={() => openCopy(t)} sx={{ color: "#9ca3af", "&:hover": { color: "#374151", bgcolor: "#f9fafb" } }}>
                          <ContentCopy sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={t.enabled ? "停用模板" : "启用模板"}>
                        <Switch
                          checked={t.enabled}
                          onChange={() => handleToggleEnabled(t)}
                          size="small"
                          sx={{
                            "& .MuiSwitch-switchBase.Mui-checked": { color: "#3b82f6" },
                            "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: "#93c5fd" },
                          }}
                        />
                      </Tooltip>
                      <Tooltip title={t.usedByProjects ? "已被项目使用，不可删除" : "删除模板"}>
                        <span>
                          <IconButton
                            size="small"
                            disabled={!!t.usedByProjects}
                            onClick={() => handleDelete(t)}
                            sx={{ color: "#9ca3af", "&:hover": { color: "#ef4444", bgcolor: "#fef2f2" }, "&.Mui-disabled": { color: "#e5e7eb" } }}
                          >
                            <Delete sx={{ fontSize: 16 }} />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}

            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                  <AccountTree sx={{ fontSize: 40, color: "#e5e7eb", mb: 1.5, display: "block", mx: "auto" }} />
                  <Typography sx={{ fontSize: "14px", color: "#9ca3af" }}>
                    {searchText || filterStatus !== "all" ? "没有符合条件的模板" : "暂无模板，点击「新增模板」开始创建"}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ── Create Dialog ── */}
      <Dialog
        open={dialogMode === "create"}
        onClose={closeDialog}
        maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: "12px", boxShadow: "0 20px 40px rgba(0,0,0,0.12)" } }}
      >
        <DialogTitle sx={{ fontSize: "15px", fontWeight: 700, color: "#111827", borderBottom: "1px solid #f3f4f6", py: 2, px: 3 }}>
          新增知识构建方案模板
        </DialogTitle>
        <DialogContent sx={{ px: 3, pt: 2.5, pb: 1 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            <TextField
              label="模板名称" required size="small" fullWidth autoFocus
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="请输入模板名称（平台内唯一）"
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "6px" } }}
            />
            <TextField
              label="模板描述" size="small" fullWidth multiline rows={2}
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="可选，描述该模板适用的业务场景"
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "6px" } }}
            />
            <RelSelector value={formData.relationshipId} onChange={v => setFormData({ ...formData, relationshipId: v })} />
            <Alert
              severity="info"
              sx={{ bgcolor: "#eff6ff", color: "#1e40af", border: "1px solid #bfdbfe", borderRadius: "6px", py: 0.5, "& .MuiAlert-message": { fontSize: "12px", py: 0 }, "& .MuiAlert-icon": { color: "#3b82f6", alignItems: "center" } }}
            >
              新增模板默认为<strong>停用</strong>状态，创建后需进入「配置」页面定义知识类目，完善后再手动启用
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions sx={{ borderTop: "1px solid #f3f4f6", px: 3, py: 2, gap: 1 }}>
          <Button onClick={closeDialog} sx={{ textTransform: "none", color: "#374151", borderRadius: "6px", px: 2 }}>取消</Button>
          <Button onClick={handleSaveCreate} variant="contained"
            sx={{ bgcolor: "#3b82f6", borderRadius: "6px", textTransform: "none", px: 2.5, boxShadow: "none", "&:hover": { bgcolor: "#2563eb", boxShadow: "none" } }}
          >
            创建模板
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Edit Dialog ── */}
      <Dialog
        open={dialogMode === "edit"}
        onClose={closeDialog}
        maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: "12px", boxShadow: "0 20px 40px rgba(0,0,0,0.12)" } }}
      >
        <DialogTitle sx={{ fontSize: "15px", fontWeight: 700, color: "#111827", borderBottom: "1px solid #f3f4f6", py: 2, px: 3 }}>
          编辑模板信息
        </DialogTitle>
        <DialogContent sx={{ px: 3, pt: 2.5, pb: 1 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            <TextField
              label="模板名称" required size="small" fullWidth autoFocus
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "6px" } }}
            />
            <TextField
              label="模板描述" size="small" fullWidth multiline rows={2}
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "6px" } }}
            />
            <RelSelector value={formData.relationshipId} onChange={v => setFormData({ ...formData, relationshipId: v })} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ borderTop: "1px solid #f3f4f6", px: 3, py: 2, gap: 1 }}>
          <Button onClick={closeDialog} sx={{ textTransform: "none", color: "#374151", borderRadius: "6px", px: 2 }}>取消</Button>
          <Button onClick={handleSaveEdit} variant="contained"
            sx={{ bgcolor: "#3b82f6", borderRadius: "6px", textTransform: "none", px: 2.5, boxShadow: "none", "&:hover": { bgcolor: "#2563eb", boxShadow: "none" } }}
          >
            保存
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Copy Dialog ── */}
      <Dialog
        open={dialogMode === "copy"}
        onClose={closeDialog}
        maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: "12px", boxShadow: "0 20px 40px rgba(0,0,0,0.12)" } }}
      >
        <DialogTitle sx={{ fontSize: "15px", fontWeight: 700, color: "#111827", borderBottom: "1px solid #f3f4f6", py: 2, px: 3 }}>
          复制模板
        </DialogTitle>
        <DialogContent sx={{ px: 3, pt: 2.5, pb: 1 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            <Box sx={{ p: 1.5, bgcolor: "#f9fafb", borderRadius: "6px", border: "1px solid #e5e7eb" }}>
              <Typography sx={{ fontSize: "11px", color: "#9ca3af", mb: 0.25 }}>源模板</Typography>
              <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#374151" }}>{activeTemplate?.name}</Typography>
            </Box>
            <Divider />
            <TextField
              label="新模板名称" required size="small" fullWidth autoFocus
              value={copyName}
              onChange={e => setCopyName(e.target.value)}
              placeholder="请为复制后的模板命名"
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "6px" } }}
            />
            <RelSelector value={copyRelationshipId} onChange={setCopyRelationshipId} />
            <Alert
              severity="info"
              sx={{ bgcolor: "#eff6ff", color: "#1e40af", border: "1px solid #bfdbfe", borderRadius: "6px", py: 0.5, "& .MuiAlert-message": { fontSize: "12px", py: 0 }, "& .MuiAlert-icon": { color: "#3b82f6", alignItems: "center" } }}
            >
              复制操作将继承源模板的知识类目与知识形态定义，新模板状态默认为<strong>停用</strong>，复制后与源模板相互独立
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions sx={{ borderTop: "1px solid #f3f4f6", px: 3, py: 2, gap: 1 }}>
          <Button onClick={closeDialog} sx={{ textTransform: "none", color: "#374151", borderRadius: "6px", px: 2 }}>取消</Button>
          <Button onClick={handleSaveCopy} variant="contained"
            sx={{ bgcolor: "#3b82f6", borderRadius: "6px", textTransform: "none", px: 2.5, boxShadow: "none", "&:hover": { bgcolor: "#2563eb", boxShadow: "none" } }}
          >
            确认复制
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Delete Template Confirm Dialog ── */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        maxWidth="xs" fullWidth
        PaperProps={{ sx: { borderRadius: "12px", boxShadow: "0 20px 40px rgba(0,0,0,0.12)" } }}
      >
        <DialogTitle sx={{ fontSize: "15px", fontWeight: 700, color: "#111827", py: 2, px: 3 }}>
          删除模板
        </DialogTitle>
        <DialogContent sx={{ px: 3, pb: 1 }}>
          <Alert severity="error"
            sx={{ bgcolor: "#fef2f2", color: "#991b1b", border: "1px solid #fecaca", borderRadius: "6px", "& .MuiAlert-icon": { color: "#ef4444" }, "& .MuiAlert-message": { fontSize: "13px" } }}
          >
            确认删除模板「<strong>{pendingDeleteTemplate?.name}</strong>」？<br />
            删除后不可恢复，模板内的知识类目配置将一并清除。
          </Alert>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button
            onClick={() => setDeleteConfirmOpen(false)}
            sx={{ textTransform: "none", color: "#374151", borderRadius: "6px", px: 2, fontSize: "13px" }}
          >
            取消
          </Button>
          <Button
            onClick={confirmDeleteTemplate}
            variant="contained"
            sx={{ bgcolor: "#ef4444", borderRadius: "6px", textTransform: "none", px: 2.5, fontSize: "13px", boxShadow: "none", "&:hover": { bgcolor: "#dc2626", boxShadow: "none" } }}
          >
            确认删除
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
}