import { useState, useMemo } from "react";
import { useOutletContext } from "react-router";
import {
  Box, Typography, Button, Chip, Paper, Alert, Snackbar, Tooltip, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Divider,
  Drawer, List, ListItem, ListItemButton, ListItemText, Tabs, Tab,
} from "@mui/material";
import {
  Inventory, PowerSettingsNew, Visibility, CheckCircle, Close, QuestionAnswer,
  Translate, ContentCut, Add, Edit, AccessTime, Person, Tag,
} from "@mui/icons-material";
import { Project } from "../types";

type PkgStatus = "enabled" | "disabled";
type ItemType = "qa" | "term" | "slice";

interface PkgItem {
  id: string; type: ItemType; content: string; category: string;
  sourceDoc?: string; status: "enabled" | "disabled";
}

interface KPkg {
  id: string; name: string; description?: string; status: PkgStatus;
  createdAt: string; updatedAt: string; creator: string;
  items: PkgItem[];
}

const CATS = ["产品知识 > 理财产品", "产品知识 > 信用卡产品", "业务流程 > 开户流程"];
const SECONDARY_DRAWER_Z_INDEX = 1600;

const INIT_PKG: KPkg = {
  id: "pkg1", name: "金融客服知识库",
  description: "金融行业客服场景知识包，包含理财产品、信用卡、开户流程三大类目的结构化问答与非结构化切片",
  status: "enabled", creator: "李静", createdAt: "2026-03-20 14:00", updatedAt: "2026-03-25 11:30",
  items: [
    { id: "pi1", type: "qa", content: "理财产品的申购起点金额是多少？", category: "产品知识 > 理财产品", sourceDoc: "产品FAQ汇总2024.xlsx", status: "enabled" },
    { id: "pi2", type: "qa", content: "信用卡额度如何申请临时提升？", category: "产品知识 > 信用卡产品", sourceDoc: "产品FAQ汇总2024.xlsx", status: "enabled" },
    { id: "pi3", type: "qa", content: "开户需要携带哪些材料？", category: "业务流程 > 开户流程", status: "enabled" },
    { id: "pi4", type: "qa", content: "理财产品到期后资金如何处理？", category: "产品知识 > 理财产品", sourceDoc: "金融产品使用手册.md", status: "enabled" },
    { id: "pi5", type: "term", content: "净值型理财", category: "产品知识 > 理财产品", sourceDoc: "金融产品使用手册.md", status: "enabled" },
    { id: "pi6", type: "term", content: "临时额度", category: "产品知识 > 信用卡产品", sourceDoc: "产品FAQ汇总2024.xlsx", status: "enabled" },
    { id: "pi7", type: "term", content: "风险承受能力", category: "产品知识 > 理财产品", status: "enabled" },
    { id: "pi8", type: "term", content: "账单日", category: "产品知识 > 信用卡产品", sourceDoc: "金融产品使用手册.md", status: "enabled" },
    { id: "pi9", type: "slice", content: "净值型理财产品是指以基金净值方式运作、定期或不定期披露净值的理财产品……", category: "产品知识 > 理财产品", sourceDoc: "金融产品使用手册.md", status: "enabled" },
    { id: "pi10", type: "slice", content: "信用卡申请流程共分六个步骤：第一步，填写申请表；第二步，提交身份证……", category: "产品知识 > 信用卡产品", sourceDoc: "产品FAQ汇总2024.xlsx", status: "enabled" },
    { id: "pi11", type: "slice", content: "账单日（结账日）是银行每月固定对信用卡账户进行结算的日期……", category: "产品知识 > 信用卡产品", sourceDoc: "金融产品使用手册.md", status: "enabled" },
    { id: "pi12", type: "slice", content: "个人客户开户流程：携带本人身份证原件 → 到达任一网点 → 取号等候……", category: "业务流程 > 开户流程", sourceDoc: "理财业务规范v3.txt", status: "enabled" },
  ],
};

const TYPE_META: Record<ItemType, { label: string; bg: string; color: string; icon: any }> = {
  qa:    { label: "问答", bg: "#dbeafe", color: "#1e40af", icon: <QuestionAnswer sx={{ fontSize: 14 }} /> },
  term:  { label: "术语", bg: "#e0e7ff", color: "#4338ca", icon: <Translate sx={{ fontSize: 14 }} /> },
  slice: { label: "切片", bg: "#fce7f3", color: "#9f1239", icon: <ContentCut sx={{ fontSize: 14 }} /> },
};

export function KnowledgePackageManagement() {
  const { project } = useOutletContext<{ project: Project }>();
  const key = `knowledgePkg_${project.id}`;
  const [pkg, setPkg] = useState<KPkg>(() => {
    try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : INIT_PKG; } catch { return INIT_PKG; }
  });
  const save = (d: KPkg) => { setPkg(d); localStorage.setItem(key, JSON.stringify(d)); };

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selCat, setSelCat] = useState(CATS[0]);
  const [selType, setSelType] = useState<"all" | ItemType>("all");
  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState(pkg.name);
  const [editDesc, setEditDesc] = useState(pkg.description ?? "");
  const [toast, setToast] = useState({ open: false, msg: "", sev: "success" as "success" | "error" | "warning" });
  const showToast = (msg: string, sev: "success" | "error" | "warning" = "success") => setToast({ open: true, msg, sev });

  const catCounts = useMemo(() => {
    const m: Record<string, number> = {};
    CATS.forEach(c => { m[c] = pkg.items.filter(it => it.category === c && it.status === "enabled").length; });
    return m;
  }, [pkg]);

  const totalEnabled = useMemo(() => pkg.items.filter(it => it.status === "enabled").length, [pkg]);

  const drawerItems = useMemo(() => pkg.items.filter(it => {
    if (it.category !== selCat) return false;
    if (selType !== "all" && it.type !== selType) return false;
    return true;
  }), [pkg, selCat, selType]);

  const catItemCounts = useMemo(() => {
    const m: Record<string, { qa: number; term: number; slice: number }> = {};
    CATS.forEach(c => {
      const catItems = pkg.items.filter(it => it.category === c);
      m[c] = { qa: catItems.filter(i => i.type === "qa").length, term: catItems.filter(i => i.type === "term").length, slice: catItems.filter(i => i.type === "slice").length };
    });
    return m;
  }, [pkg]);

  const togglePkgStatus = () => {
    save({ ...pkg, status: pkg.status === "enabled" ? "disabled" : "enabled" });
    showToast("知识包状态已切换");
  };

  const saveEdit = () => {
    save({ ...pkg, name: editName.trim() || pkg.name, description: editDesc.trim() });
    setEditOpen(false); showToast("知识包信息已更新");
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2.5 }}>
        <Box>
          <Typography sx={{ fontSize: "18px", fontWeight: 700, color: "#111827" }}>知识包管理</Typography>
          <Typography sx={{ fontSize: "13px", color: "#94a3b8", mt: 0.25 }}>管理当前项目的知识包，查看知识内容详情</Typography>
        </Box>
      </Box>

      {/* Package Card */}
      <Paper sx={{ border: "1px solid #e8eaed", borderRadius: "12px", boxShadow: "none", overflow: "hidden" }}>
        {/* Status bar */}
        <Box sx={{ bgcolor: pkg.status === "enabled" ? "#f0fdf4" : "#f9fafb", borderBottom: "1px solid #e8eaed", px: 3, py: 1.25, display: "flex", alignItems: "center", gap: 1 }}>
          <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: pkg.status === "enabled" ? "#22c55e" : "#d1d5db" }} />
          <Typography sx={{ fontSize: "12px", color: pkg.status === "enabled" ? "#15803d" : "#6b7280", fontWeight: 500 }}>
            {pkg.status === "enabled" ? "当前知识包已启用，可供 Agent 调用" : "当前知识包已停用"}
          </Typography>
        </Box>

        <Box sx={{ p: 3 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2.5 }}>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
                <Box sx={{ width: 40, height: 40, borderRadius: "10px", bgcolor: "#f5f3ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Inventory sx={{ fontSize: 20, color: "#7c3aed" }} />
                </Box>
                <Box>
                  <Typography sx={{ fontSize: "18px", fontWeight: 700, color: "#111827" }}>{pkg.name}</Typography>
                  <Typography sx={{ fontSize: "12px", color: "#9ca3af" }}>由 {pkg.creator} 创建于 {pkg.createdAt}</Typography>
                </Box>
              </Box>
              {pkg.description && (
                <Typography sx={{ fontSize: "13px", color: "#6b7280", lineHeight: 1.7, maxWidth: 600 }}>{pkg.description}</Typography>
              )}
            </Box>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button variant="outlined" startIcon={<Edit sx={{ fontSize: 14 }} />} onClick={() => { setEditName(pkg.name); setEditDesc(pkg.description ?? ""); setEditOpen(true); }}
                sx={{ borderColor: "#d1d5db", color: "#6b7280", borderRadius: "8px", textTransform: "none", fontSize: "13px", px: 2, "&:hover": { borderColor: "#9ca3af", bgcolor: "#f9fafb" } }}>
                编辑信息
              </Button>
              <Button variant="outlined" startIcon={<PowerSettingsNew sx={{ fontSize: 14 }} />} onClick={togglePkgStatus}
                sx={{ borderColor: pkg.status === "enabled" ? "#fcd34d" : "#86efac", color: pkg.status === "enabled" ? "#92400e" : "#15803d", borderRadius: "8px", textTransform: "none", fontSize: "13px", px: 2 }}>
                {pkg.status === "enabled" ? "停用" : "启用"}
              </Button>
              <Button variant="contained" startIcon={<Visibility sx={{ fontSize: 14 }} />} onClick={() => { setSelCat(CATS[0]); setSelType("all"); setDrawerOpen(true); }}
                sx={{ bgcolor: "#7c3aed", borderRadius: "8px", textTransform: "none", fontSize: "13px", px: 2, boxShadow: "none", "&:hover": { bgcolor: "#6d28d9", boxShadow: "none" } }}>
                查看详情
              </Button>
            </Box>
          </Box>

          {/* Stats */}
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <Box sx={{ flex: 1, minWidth: 120, p: 2, bgcolor: "#f8f9fb", border: "1px solid #e8eaed", borderRadius: "10px" }}>
              <Typography sx={{ fontSize: "24px", fontWeight: 700, color: "#111827", lineHeight: 1.1 }}>{totalEnabled}</Typography>
              <Typography sx={{ fontSize: "11px", color: "#9ca3af", mt: 0.25 }}>启用知识条目</Typography>
            </Box>
            {CATS.map(c => (
              <Box key={c} sx={{ flex: 1, minWidth: 160, p: 2, bgcolor: "#f8f9fb", border: "1px solid #e8eaed", borderRadius: "10px" }}>
                <Typography sx={{ fontSize: "14px", fontWeight: 700, color: "#374151", mb: 0.5 }}>{c.split(" > ").pop()}</Typography>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                  {catItemCounts[c] && (
                    <>
                      <Typography sx={{ fontSize: "11px", color: "#1e40af", bgcolor: "#dbeafe", px: 0.75, py: 0.25, borderRadius: "4px" }}>问答 {catItemCounts[c].qa}</Typography>
                      <Typography sx={{ fontSize: "11px", color: "#4338ca", bgcolor: "#e0e7ff", px: 0.75, py: 0.25, borderRadius: "4px" }}>术语 {catItemCounts[c].term}</Typography>
                      <Typography sx={{ fontSize: "11px", color: "#9f1239", bgcolor: "#fce7f3", px: 0.75, py: 0.25, borderRadius: "4px" }}>切片 {catItemCounts[c].slice}</Typography>
                    </>
                  )}
                </Box>
              </Box>
            ))}
          </Box>

          {/* Metadata */}
          <Box sx={{ display: "flex", gap: 3, mt: 2, pt: 2, borderTop: "1px solid #f0f0f0" }}>
            {[
              { icon: <Person sx={{ fontSize: 13, color: "#9ca3af" }} />, label: "创建人", value: pkg.creator },
              { icon: <AccessTime sx={{ fontSize: 13, color: "#9ca3af" }} />, label: "创建时间", value: pkg.createdAt },
              { icon: <AccessTime sx={{ fontSize: 13, color: "#9ca3af" }} />, label: "更新时间", value: pkg.updatedAt },
              { icon: <Tag sx={{ fontSize: 13, color: "#9ca3af" }} />, label: "知识类目", value: `${CATS.length} 个` },
            ].map(f => (
              <Box key={f.label} sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                {f.icon}
                <Typography sx={{ fontSize: "11px", color: "#9ca3af" }}>{f.label}：</Typography>
                <Typography sx={{ fontSize: "11px", color: "#6b7280" }}>{f.value}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Paper>

      {/* Drawer: Detail View */}
      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}
        ModalProps={{ sx: { zIndex: SECONDARY_DRAWER_Z_INDEX } }}
        slotProps={{ backdrop: { sx: { position: "fixed", inset: 0, zIndex: SECONDARY_DRAWER_Z_INDEX, bgcolor: "rgba(17, 24, 39, 0.48)" } } }}
        PaperProps={{ sx: { width: "72vw", maxWidth: 900, boxShadow: "-4px 0 24px rgba(0,0,0,0.1)", zIndex: SECONDARY_DRAWER_Z_INDEX + 1 } }}>
        <Box sx={{ display: "flex", height: "100%" }}>
          {/* Left: Category list */}
          <Box sx={{ width: 220, flexShrink: 0, borderRight: "1px solid #e8eaed", display: "flex", flexDirection: "column", bgcolor: "#f8f9fb" }}>
            <Box sx={{ px: 2.5, py: 2, borderBottom: "1px solid #e8eaed" }}>
              <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#111827" }}>知识类目</Typography>
              <Typography sx={{ fontSize: "11px", color: "#9ca3af", mt: 0.25 }}>{pkg.name}</Typography>
            </Box>
            <List disablePadding sx={{ flex: 1, overflow: "auto", py: 0.5, px: 0.5 }}>
              {CATS.map(cat => (
                <ListItem key={cat} disablePadding sx={{ mb: 0.25 }}>
                  <ListItemButton selected={selCat === cat} onClick={() => { setSelCat(cat); setSelType("all"); }}
                    sx={{ borderRadius: "6px", py: 0.875, px: 1.25, minHeight: 36, "&.Mui-selected": { bgcolor: "#ede9fe" }, "&:hover": { bgcolor: "#f0ebff" } }}>
                    <ListItemText primary={
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Typography sx={{ fontSize: "12px", color: selCat === cat ? "#5b21b6" : "#374151", fontWeight: selCat === cat ? 600 : 400, lineHeight: 1.4 }}>
                          {cat.split(" > ").map((part, i) => (
                            <span key={i}>
                              {i > 0 && <span style={{ color: "#c4b5fd", marginRight: 2, marginLeft: 2 }}>›</span>}
                              {part}
                            </span>
                          ))}
                        </Typography>
                        <Chip label={catCounts[cat]} size="small" sx={{ height: 18, fontSize: "10px", minWidth: 24, bgcolor: selCat === cat ? "#ddd6fe" : "#e8eaed", color: selCat === cat ? "#5b21b6" : "#6b7280", border: "none", "& .MuiChip-label": { px: 0.5 } }} />
                      </Box>
                    } />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Box>

          {/* Right: Content */}
          <Box sx={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            {/* Header */}
            <Box sx={{ px: 3, py: 2, borderBottom: "1px solid #e8eaed", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Box>
                <Typography sx={{ fontSize: "14px", fontWeight: 700, color: "#111827" }}>{selCat}</Typography>
                <Typography sx={{ fontSize: "11px", color: "#9ca3af", mt: 0.25 }}>共 {catCounts[selCat] || 0} 条启用知识</Typography>
              </Box>
              <IconButton onClick={() => setDrawerOpen(false)} sx={{ color: "#9ca3af" }}><Close sx={{ fontSize: 18 }} /></IconButton>
            </Box>

            {/* Form type tabs */}
            <Box sx={{ px: 3, borderBottom: "1px solid #f0f0f0" }}>
              <Tabs value={selType} onChange={(_, v) => setSelType(v)}
                sx={{ "& .MuiTab-root": { fontSize: "12px", textTransform: "none", minHeight: 40, px: 0, mr: 2 }, "& .MuiTabs-indicator": { bgcolor: "#7c3aed" } }}>
                <Tab label={`全部 (${pkg.items.filter(it => it.category === selCat).length})`} value="all" />
                <Tab label={`问答库 (${pkg.items.filter(it => it.category === selCat && it.type === "qa").length})`} value="qa" />
                <Tab label={`术语库 (${pkg.items.filter(it => it.category === selCat && it.type === "term").length})`} value="term" />
                <Tab label={`非结构化切片 (${pkg.items.filter(it => it.category === selCat && it.type === "slice").length})`} value="slice" />
              </Tabs>
            </Box>

            {/* Items */}
            <Box sx={{ flex: 1, overflow: "auto", p: 2 }}>
              {drawerItems.length === 0 ? (
                <Box sx={{ py: 8, textAlign: "center" }}>
                  <Inventory sx={{ fontSize: 40, color: "#e8eaed", mb: 1 }} />
                  <Typography sx={{ fontSize: "13px", color: "#9ca3af" }}>该类目暂无知识条目</Typography>
                </Box>
              ) : (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                  {drawerItems.map(item => {
                    const tm = TYPE_META[item.type];
                    return (
                      <Box key={item.id} sx={{ p: 2, border: "1px solid #e8eaed", borderRadius: "10px", bgcolor: item.status === "enabled" ? "#fff" : "#f9fafb", opacity: item.status === "enabled" ? 1 : 0.6, transition: "all 0.15s", "&:hover": { borderColor: "#c4b5fd", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" } }}>
                        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
                          <Box sx={{ width: 32, height: 32, borderRadius: "8px", bgcolor: tm.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: tm.color }}>
                            {tm.icon}
                          </Box>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                              <Chip label={tm.label} size="small" sx={{ height: 18, fontSize: "10px", bgcolor: tm.bg, color: tm.color, border: "none", "& .MuiChip-label": { px: 0.75 } }} />
                              {item.status === "disabled" && <Chip label="已停用" size="small" sx={{ height: 18, fontSize: "10px", bgcolor: "#f1f5f9", color: "#94a3b8", border: "none", "& .MuiChip-label": { px: 0.75 } }} />}
                            </Box>
                            <Typography sx={{ fontSize: "13px", color: "#111827", fontWeight: 500, lineHeight: 1.6 }}>
                              {item.content.length > 120 ? item.content.slice(0, 120) + "…" : item.content}
                            </Typography>
                            {item.sourceDoc && (
                              <Typography sx={{ fontSize: "11px", color: "#9ca3af", mt: 0.5 }}>来源：{item.sourceDoc}</Typography>
                            )}
                          </Box>
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </Drawer>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: "12px" } }}>
        <DialogTitle sx={{ fontSize: "15px", fontWeight: 700, color: "#111827", pb: 2 }}>编辑知识包信息</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <TextField label="知识包名称 *" fullWidth value={editName} onChange={e => setEditName(e.target.value)}
              sx={{ "& .MuiInputBase-input": { fontSize: "14px" }, "& .MuiInputLabel-root": { fontSize: "14px" } }} />
            <TextField label="描述" fullWidth multiline rows={3} value={editDesc} onChange={e => setEditDesc(e.target.value)}
              sx={{ "& .MuiInputBase-input": { fontSize: "14px" }, "& .MuiInputLabel-root": { fontSize: "14px" } }} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setEditOpen(false)} sx={{ textTransform: "none", color: "#6b7280", fontSize: "14px" }}>取消</Button>
          <Button variant="contained" onClick={saveEdit} sx={{ bgcolor: "#7c3aed", textTransform: "none", fontSize: "14px", boxShadow: "none", "&:hover": { bgcolor: "#6d28d9" } }}>保存</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={toast.open} autoHideDuration={3000} onClose={() => setToast(t => ({ ...t, open: false }))} anchorOrigin={{ vertical: "top", horizontal: "center" }}>
        <Alert severity={toast.sev} onClose={() => setToast(t => ({ ...t, open: false }))} sx={{ borderRadius: "8px", fontSize: "13px" }}>{toast.msg}</Alert>
      </Snackbar>
    </Box>
  );
}
