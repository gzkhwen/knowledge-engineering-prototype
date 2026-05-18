import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router";
import {
  Box, Paper, Typography, Chip, Alert, Divider, Collapse, IconButton, Button,
} from "@mui/material";
import {
  AccountTree, ExpandMore, ChevronRight, CheckCircle, InfoOutlined, 
  FolderOutlined, LabelOutlined, UnfoldMore, UnfoldLess, AutoAwesome, ArrowBack,
} from "@mui/icons-material";
import { dataStore } from "../store/DataStore";
import { Project, ProjectCategory, ProjectSolution, KnowledgeFormType } from "../types";

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

// ─── Component ────────────────────────────────────────────────────────────────

export function ProjectSolutionViewer() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [solution, setSolution] = useState<ProjectSolution | null>(null);
  const [categories, setCategories] = useState<ProjectCategory[]>([]);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  // ─── Data loading ───────────────────────────────────────────────────────────

  useEffect(() => { 
    if (projectId) {
      loadData(); 
    }
  }, [projectId]);

  const loadData = () => {
    if (!projectId) return;
    
    const proj = dataStore.getProject(projectId);
    setProject(proj ?? null);
    
    if (proj) {
      const sol = dataStore.getProjectSolution(proj.id);
      setSolution(sol ?? null);
      if (sol) {
        const cats = dataStore.getProjectCategories(sol.id);
        setCategories(cats);
        setExpanded(new Set(cats.filter(c => c.parentId === null).map(c => c.id)));
      } else {
        setCategories([]);
      }
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

  // ─── Expand / collapse ──────────────────────────────────────────────────────

  const toggle = (id: string) =>
    setExpanded(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const expandAll = () =>
    setExpanded(new Set(categories.filter(c => childrenOf(c.id).length > 0).map(c => c.id)));

  const collapseAll = () => setExpanded(new Set());

  // ─── Stats ──────────────────────────────────────────────────────────────────

  const stats = useMemo(() => {
    const total = categories.length;
    const leaves = categories.filter(c => isLeaf(c.id));
    const leafTotal = leaves.length;
    const incomplete = leaves.filter(c => c.formTypes.length === 0).length;
    const maxLevel = total > 0 ? Math.max(...categories.map(c => c.level)) : 0;
    return { total, leafTotal, incomplete, maxLevel };
  }, [categories]);

  const templateName = project?.templateId ? dataStore.getTemplate(project.templateId)?.name : null;

  // ─── Render node ────────────────────────────────────────────────────────────

  const renderNode = (cat: ProjectCategory, depth: number) => {
    const children = childrenOf(cat.id);
    const leaf = isLeaf(cat.id);
    const hasTypes = cat.formTypes.length > 0;
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
            flex: 1, border: `1px solid #e5e7eb`,
            borderLeft: `3px solid ${lc}`,
            borderRadius: "8px", bgcolor: "#fff", p: 1.5,
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

  // ─── No solution / project state ────────────────────────────────────────────

  if (!project) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography sx={{ fontSize: "14px", color: "#9ca3af" }}>项目不存在</Typography>
        <Button onClick={() => navigate("/ops/projects")} sx={{ mt: 2, textTransform: "none" }}>
          返回项目列表
        </Button>
      </Box>
    );
  }

  if (!solution) {
    return (
      <Box>
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
          <Typography sx={{ fontSize: "18px", fontWeight: 700, color: "#111827" }}>项目方案详情</Typography>
          <Typography sx={{ fontSize: "13px", color: "#6b7280", mt: 0.5 }}>
            查看项目知识类目与知识形态配置
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
                请前往项目方案配置页面进行配置
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    );
  }

  // ─── Main render ───────────────────────────────────────────────────────────

  return (
    <Box>
      {/* ── Page title ── */}
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

      <Box sx={{ mb: 2.5 }}>
        <Typography sx={{ fontSize: "18px", fontWeight: 700, color: "#111827" }}>项目方案详情（只读）</Typography>
        <Typography sx={{ fontSize: "13px", color: "#6b7280", mt: 0.5 }}>
          查看项目知识类目与知识形态配置
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
          </Box>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button size="small" startIcon={<UnfoldMore sx={{ fontSize: "15px !important" }} />} onClick={expandAll}
              sx={{ textTransform: "none", fontSize: "12px", color: "#374151", border: "1px solid #e5e7eb", borderRadius: "6px", px: 1.5, py: 0.5, bgcolor: "#fff", "&:hover": { bgcolor: "#f9fafb" } }}>
              展开全部
            </Button>
            <Button size="small" startIcon={<UnfoldLess sx={{ fontSize: "15px !important" }} />} onClick={collapseAll}
              sx={{ textTransform: "none", fontSize: "12px", color: "#374151", border: "1px solid #e5e7eb", borderRadius: "6px", px: 1.5, py: 0.5, bgcolor: "#fff", "&:hover": { bgcolor: "#f9fafb" } }}>
              折叠全部
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* ── Rules hint ── */}
      <Alert severity="info" icon={<InfoOutlined sx={{ fontSize: 16 }} />}
        sx={{ mb: 2, bgcolor: "#eff6ff", color: "#1e40af", border: "1px solid #bfdbfe", borderRadius: "8px", py: 0.5, "& .MuiAlert-message": { fontSize: "12px", py: 0.25 }, "& .MuiAlert-icon": { color: "#3b82f6", alignItems: "center" } }}>
        最多 <strong>5 层</strong>树形结构 &nbsp;·&nbsp; 末级类目（叶子节点）<strong>必须</strong>指定知识形态 &nbsp;·&nbsp; 非末级类目（中间节点）<strong>不可</strong>指定知识形态 &nbsp;·&nbsp; 同一末级类目可指定<strong>多个</strong>知识形态
      </Alert>

      {/* ── Banners ── */}
      {stats.total > 0 && stats.incomplete === 0 && (
        <Alert severity="success" icon={<CheckCircle sx={{ fontSize: 16 }} />}
          sx={{ mb: 2, bgcolor: "#f0fdf4", color: "#065f46", border: "1px solid #bbf7d0", borderRadius: "8px", py: 0.5, "& .MuiAlert-message": { fontSize: "12px", py: 0.25 }, "& .MuiAlert-icon": { color: "#10b981", alignItems: "center" } }}>
          所有末级类目均已配置知识形态，可开始知识构建
        </Alert>
      )}
      {templateName && (
        <Alert severity="info" icon={<AutoAwesome sx={{ fontSize: 16 }} />}
          sx={{ mb: 2, bgcolor: "#faf5ff", color: "#6b21a8", border: "1px solid #e9d5ff", borderRadius: "8px", py: 0.5, "& .MuiAlert-message": { fontSize: "12px", py: 0.25 }, "& .MuiAlert-icon": { color: "#8b5cf6", alignItems: "center" } }}>
          本方案已从模板「<strong>{templateName}</strong>」初始化
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
            <Typography sx={{ fontSize: "14px", color: "#9ca3af" }}>暂无知识类目</Typography>
          </Box>
        ) : (
          <Box>{rootCats.map(cat => renderNode(cat, 0))}</Box>
        )}
      </Paper>
    </Box>
  );
}
