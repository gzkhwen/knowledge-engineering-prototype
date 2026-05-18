import { useState, useMemo } from "react";
import { useOutletContext } from "react-router";
import {
  Box, Typography, Button, Chip, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Dialog, DialogContent, DialogActions,
  IconButton, Paper, TextField, Select, MenuItem, FormControl,
  Tooltip, Divider, Snackbar, Alert, LinearProgress, List, ListItem,
  ListItemButton, ListItemText,
} from "@mui/material";
import {
  Add, Edit, Delete, AutoAwesome, PowerSettingsNew, Translate,
  Close, Visibility, Search,
} from "@mui/icons-material";
import { Project } from "../types";

type ItemStatus = "enabled" | "disabled";
type CreateMethod = "ai" | "manual";

interface TermItem {
  id: string; term: string; definition: string; aliases: string[];
  sourceDoc?: string; category: string; status: ItemStatus; method: CreateMethod;
  createdAt: string; updatedAt: string;
}

const MOCK_DOCS = ["金融产品使用手册.md", "产品FAQ汇总2024.xlsx", "理财业务规范v3.txt", "知识库建设标准_v2.txt"];

const CATEGORIES = [
  { id: "all", name: "全部类目" },
  { id: "c1", name: "产品知识 > 理财产品" },
  { id: "c2", name: "产品知识 > 信用卡产品" },
  { id: "c3", name: "风控规则" },
];

const INIT_ITEMS: TermItem[] = [
  { id: "t1", term: "净值型理财", definition: "净值型理财产品是指以基金净值方式运作、定期或不定期披露净值的理财产品。其收益随市场波动，无预期收益或保本承诺，投资者需自行承担投资风险。", aliases: ["净值类理财", "开放式净值理财", "浮动净值产品"], sourceDoc: "金融产品使用手册.md", category: "产品知识 > 理财产品", status: "enabled", method: "ai", createdAt: "2026-03-19 14:32", updatedAt: "2026-03-19 14:32" },
  { id: "t2", term: "临时额度", definition: "临时额度是银行在持卡人本人信用额度基础上，根据特定需求临时授予的短期使用额度。有效期通常为 7–30 天，到期后自动失效并恢复原有固定额度。", aliases: ["临额", "短期额度", "临时信用额度"], sourceDoc: "产品FAQ汇总2024.xlsx", category: "产品知识 > 信用卡产品", status: "enabled", method: "ai", createdAt: "2026-03-19 14:38", updatedAt: "2026-03-19 14:38" },
  { id: "t3", term: "风险承受能力", definition: "风险承受能力是指投资者在进行金融投资时，能够承受投资损失的心理和经济能力综合评估结果。通常分为保守型（R1）至激进型（R5）五个等级，评估结果有效期为 1 年。", aliases: ["风险等级", "风险偏好", "投资风险等级"], category: "产品知识 > 理财产品", status: "enabled", method: "manual", createdAt: "2026-03-20 10:00", updatedAt: "2026-03-20 10:00" },
  { id: "t4", term: "账单日", definition: "账单日（结账日）是银行每月固定对信用卡账户进行结算的日期。在账单日，银行统计所有消费和还款记录，生成当期账单并发送给持卡人。账单日通常固定（如每月 10 日）。", aliases: ["结账日", "账单生成日"], sourceDoc: "金融产品使用手册.md", category: "产品知识 > 信用卡产品", status: "enabled", method: "ai", createdAt: "2026-03-20 14:25", updatedAt: "2026-03-20 14:25" },
  { id: "t5", term: "逾期还款", definition: "逾期还款是指持卡人在信用卡最终还款日（即宽限期结束日）之后仍未还清当期最低还款额的行为。逾期将产生滞纳金（欠款额 × 5%，最低 10 元），并影响征信记录。", aliases: ["逾期", "还款逾期"], sourceDoc: "金融产品使用手册.md", category: "风控规则", status: "enabled", method: "ai", createdAt: "2026-03-21 10:00", updatedAt: "2026-03-21 10:00" },
];

export function TermsLibraryPage() {
  const { project } = useOutletContext<{ project: Project }>();
  const key = `termItems_${project.id}`;
  const [items, setItems] = useState<TermItem[]>(() => {
    try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : INIT_ITEMS; } catch { return INIT_ITEMS; }
  });
  const save = (d: TermItem[]) => { setItems(d); localStorage.setItem(key, JSON.stringify(d)); };

  const [selCat, setSelCat] = useState("all");
  const [filterQ, setFilterQ] = useState("");
  const [filterDoc, setFilterDoc] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [editOpen, setEditOpen] = useState(false);
  const [editItem, setEditItem] = useState<TermItem | null>(null);
  const [detailItem, setDetailItem] = useState<TermItem | null>(null);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiDocs, setAiDocs] = useState<string[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiDrafts, setAiDrafts] = useState<TermItem[]>([]);
  const [aiDraftSel, setAiDraftSel] = useState<Set<string>>(new Set());
  const [fTerm, setFTerm] = useState(""); const [fDef, setFDef] = useState(""); const [fAlias, setFAlias] = useState("");
  const [fDoc, setFDoc] = useState(""); const [fCat, setFCat] = useState("");
  const [toast, setToast] = useState({ open: false, msg: "", sev: "success" as "success" | "error" | "warning" });
  const showToast = (msg: string, sev: "success" | "error" | "warning" = "success") => setToast({ open: true, msg, sev });

  const catCounts = useMemo(() => {
    const m: Record<string, number> = {};
    items.forEach(it => { m[it.category] = (m[it.category] || 0) + 1; });
    return m;
  }, [items]);

  const filtered = useMemo(() => items.filter(it => {
    if (selCat !== "all" && it.category !== selCat) return false;
    if (filterDoc !== "all" && it.sourceDoc !== filterDoc) return false;
    if (filterStatus !== "all" && it.status !== filterStatus) return false;
    if (filterQ) {
      const q = filterQ.toLowerCase();
      return it.term.toLowerCase().includes(q) || it.definition.toLowerCase().includes(q);
    }
    return true;
  }), [items, selCat, filterDoc, filterStatus, filterQ]);

  const toggleStatus = (id: string) => {
    save(items.map(it => it.id === id ? { ...it, status: it.status === "enabled" ? "disabled" : "enabled" } as TermItem : it));
    showToast("状态已切换");
  };
  const doDelete = (id: string) => { save(items.filter(it => it.id !== id)); showToast("已删除"); };

  const openEdit = (item?: TermItem) => {
    setEditItem(item ?? null);
    if (item) { setFTerm(item.term); setFDef(item.definition); setFAlias(item.aliases.join("；")); setFDoc(item.sourceDoc ?? ""); setFCat(item.category); }
    else { setFTerm(""); setFDef(""); setFAlias(""); setFDoc(""); setFCat(selCat !== "all" ? selCat : CATEGORIES[1].name); }
    setEditOpen(true);
  };

  const saveEdit = () => {
    if (!fTerm.trim() || !fDef.trim()) { showToast("术语名称和释义不能为空", "error"); return; }
    const now = new Date().toLocaleString("zh-CN").replace(/\//g, "-");
    if (editItem) {
      save(items.map(it => it.id === editItem.id ? { ...it, term: fTerm.trim(), definition: fDef.trim(), aliases: fAlias ? fAlias.split("；").map(s => s.trim()).filter(Boolean) : [], sourceDoc: fDoc || undefined, category: fCat, updatedAt: now } : it));
      showToast("修改已保存");
    } else {
      save([...items, { id: `t_${Date.now()}`, term: fTerm.trim(), definition: fDef.trim(), aliases: fAlias ? fAlias.split("；").map(s => s.trim()).filter(Boolean) : [], sourceDoc: fDoc || undefined, category: fCat, status: "enabled", method: "manual", createdAt: now, updatedAt: now }]);
      showToast("术语已创建");
    }
    setEditOpen(false);
  };

  const startAI = async () => {
    if (!aiDocs.length) { showToast("请至少选择一份标准化文档", "warning"); return; }
    setAiLoading(true);
    await new Promise(r => setTimeout(r, 2000));
    const now = new Date().toLocaleString("zh-CN").replace(/\//g, "-");
    setAiDrafts([
      { id: `ai_t_1_${Date.now()}`, term: "开放日", definition: "开放日是指开放式基金或净值型理财产品允许投资者申购、赎回份额的特定交易日，通常为每周一至周五的工作日。", aliases: ["申赎日", "交易日"], sourceDoc: aiDocs[0], category: "产品知识 > 理财产品", status: "disabled", method: "ai", createdAt: now, updatedAt: now },
      { id: `ai_t_2_${Date.now()}`, term: "封闭期", definition: "封闭期指理财产品从申购成功至产品到期的整个存续期间。在封闭期内，投资者无法对本金进行申购或赎回操作，资金被锁定。", aliases: ["锁定期", "存续期"], sourceDoc: aiDocs[0], category: "产品知识 > 理财产品", status: "disabled", method: "ai", createdAt: now, updatedAt: now },
    ]);
    setAiLoading(false); setAiDraftSel(new Set());
  };

  const confirmDrafts = () => {
    const toAdd = aiDrafts.filter(d => aiDraftSel.has(d.id)).map(d => ({ ...d, status: "enabled" as ItemStatus }));
    save([...items, ...toAdd]); setAiOpen(false); setAiDrafts([]); setAiDraftSel(new Set());
    showToast(`已确认 ${toAdd.length} 条 AI 抽取结果`);
  };

  const cats = [
    { id: "all", name: "全部类目", count: items.length },
    ...CATEGORIES.slice(1).map(c => ({ ...c, count: catCounts[c.name] || 0 })),
  ];

  return (
    <Box sx={{ display: "flex", height: "calc(100vh - 112px)", gap: 0 }}>
      {/* Left: Category Panel */}
      <Paper sx={{ width: 220, flexShrink: 0, border: "1px solid #e8eaed", borderRadius: "10px", boxShadow: "none", display: "flex", flexDirection: "column", mr: 2, overflow: "hidden" }}>
        <Box sx={{ p: 2, borderBottom: "1px solid #f0f0f0" }}>
          <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#374151" }}>知识类目</Typography>
        </Box>
        <List disablePadding sx={{ flex: 1, overflow: "auto", py: 0.5, px: 0.5 }}>
          {cats.map(cat => (
            <ListItem key={cat.id} disablePadding sx={{ mb: 0.25 }}>
              <ListItemButton selected={selCat === (cat.id === "all" ? "all" : cat.name)}
                onClick={() => setSelCat(cat.id === "all" ? "all" : cat.name)}
                sx={{ borderRadius: "6px", py: 0.875, px: 1.25, minHeight: 36, "&.Mui-selected": { bgcolor: "#ede9fe" }, "&:hover": { bgcolor: "#f5f3ff" } }}>
                <ListItemText primary={
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography sx={{ fontSize: "12px", color: selCat === (cat.id === "all" ? "all" : cat.name) ? "#5b21b6" : "#374151", fontWeight: selCat === (cat.id === "all" ? "all" : cat.name) ? 600 : 400, lineHeight: 1.4 }}>
                      {cat.name}
                    </Typography>
                    <Chip label={cat.count} size="small" sx={{ height: 18, fontSize: "10px", minWidth: 24, bgcolor: selCat === (cat.id === "all" ? "all" : cat.name) ? "#ddd6fe" : "#f1f5f9", color: selCat === (cat.id === "all" ? "all" : cat.name) ? "#5b21b6" : "#6b7280", border: "none", "& .MuiChip-label": { px: 0.5 } }} />
                  </Box>
                } />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Paper>

      {/* Right: Content */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
          <Box>
            <Typography sx={{ fontSize: "18px", fontWeight: 700, color: "#111827" }}>术语库</Typography>
            <Typography sx={{ fontSize: "13px", color: "#94a3b8", mt: 0.25 }}>构建和管理术语知识对象，支持 AI 辅助抽取和人工创建</Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button variant="outlined" startIcon={<AutoAwesome sx={{ fontSize: 14 }} />} onClick={() => { setAiDocs([]); setAiDrafts([]); setAiOpen(true); }}
              sx={{ borderColor: "#7c3aed", color: "#5b21b6", borderRadius: "8px", textTransform: "none", fontSize: "13px", px: 2, "&:hover": { bgcolor: "#f5f3ff" } }}>
              AI 抽取
            </Button>
            <Button variant="contained" startIcon={<Add sx={{ fontSize: 14 }} />} onClick={() => openEdit()}
              sx={{ bgcolor: "#7c3aed", borderRadius: "8px", textTransform: "none", fontSize: "13px", px: 2, boxShadow: "none", "&:hover": { bgcolor: "#6d28d9", boxShadow: "none" } }}>
              手动新建
            </Button>
          </Box>
        </Box>

        <Box sx={{ display: "flex", gap: 1.5, mb: 1.5, flexWrap: "wrap", alignItems: "center" }}>
          <Box sx={{ position: "relative", flex: 1, minWidth: 160 }}>
            <Search sx={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontSize: 16, color: "#94a3b8" }} />
            <TextField size="small" placeholder="搜索术语/释义" value={filterQ} onChange={e => setFilterQ(e.target.value)}
              sx={{ width: "100%", "& .MuiOutlinedInput-root": { pl: "32px", borderRadius: "8px", fontSize: "13px", bgcolor: "#fff", "& fieldset": { borderColor: "#e8eaed" } } }} />
          </Box>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <Select value={filterDoc} onChange={e => setFilterDoc(e.target.value)}
              sx={{ borderRadius: "8px", fontSize: "13px", bgcolor: "#fff", "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e8eaed" } }}>
              <MenuItem value="all" sx={{ fontSize: "13px" }}>来源：全部文档</MenuItem>
              {MOCK_DOCS.map(d => <MenuItem key={d} value={d} sx={{ fontSize: "13px" }}>{d}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 110 }}>
            <Select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              sx={{ borderRadius: "8px", fontSize: "13px", bgcolor: "#fff", "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e8eaed" } }}>
              <MenuItem value="all" sx={{ fontSize: "13px" }}>全部状态</MenuItem>
              <MenuItem value="enabled" sx={{ fontSize: "13px" }}>已启用</MenuItem>
              <MenuItem value="disabled" sx={{ fontSize: "13px" }}>已停用</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Paper sx={{ border: "1px solid #e8eaed", borderRadius: "10px", boxShadow: "none", overflow: "hidden", flex: 1, display: "flex", flexDirection: "column" }}>
          <Box sx={{ px: 2, py: 1.25, borderBottom: "1px solid #f0f0f0", bgcolor: "#fafafa" }}>
            <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#374151" }}>
              {selCat === "all" ? "全部类目" : selCat}
              <span style={{ color: "#9ca3af", fontWeight: 400 }}> ({filtered.length})</span>
            </Typography>
          </Box>
          {filtered.length === 0 ? (
            <Box sx={{ py: 10, textAlign: "center" }}>
              <Translate sx={{ fontSize: 40, color: "#e8eaed", mb: 1 }} />
              <Typography sx={{ fontSize: "14px", color: "#9ca3af" }}>暂无术语，可通过 AI 抽取或手动创建</Typography>
            </Box>
          ) : (
            <TableContainer sx={{ flex: 1, overflow: "auto" }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    {["术语名称", "释义", "别名/同义词", "知识类目", "来源文档", "状态", "操作"].map(h => (
                      <TableCell key={h} sx={{ fontSize: "12px", fontWeight: 600, color: "#6b7280", py: 1.5, borderBottom: "1px solid #f0f0f0", whiteSpace: "nowrap", bgcolor: "#f8f9fb" }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtered.map((item, i) => (
                    <TableRow key={item.id} sx={{ bgcolor: i % 2 === 0 ? "#fff" : "#fafafa", "&:hover": { bgcolor: "#faf5ff" }, "& td": { borderBottom: "1px solid #f5f5f5" } }}>
                      <TableCell sx={{ py: 1.5 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                          <Translate sx={{ fontSize: 14, color: "#7c3aed" }} />
                          <Typography sx={{ fontSize: "13px", color: "#111827", fontWeight: 600 }}>{item.term}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ maxWidth: 220 }}>
                        <Typography sx={{ fontSize: "12px", color: "#374151", overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", lineHeight: 1.6 }}>{item.definition}</Typography>
                      </TableCell>
                      <TableCell>
                        {item.aliases.length > 0
                          ? <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                              {item.aliases.slice(0, 2).map(a => <Chip key={a} label={a} size="small" sx={{ height: 18, fontSize: "10px", bgcolor: "#f1f5f9", color: "#475569", border: "none", "& .MuiChip-label": { px: 0.5 } }} />)}
                              {item.aliases.length > 2 && <Chip label={`+${item.aliases.length - 2}`} size="small" sx={{ height: 18, fontSize: "10px", bgcolor: "#f1f5f9", color: "#9ca3af", border: "none", "& .MuiChip-label": { px: 0.5 } }} />}
                            </Box>
                          : <Typography sx={{ fontSize: "11px", color: "#d1d5db" }}>—</Typography>}
                      </TableCell>
                      <TableCell><Typography sx={{ fontSize: "11px", color: "#6b7280" }}>{item.category}</Typography></TableCell>
                      <TableCell><Typography sx={{ fontSize: "11px", color: "#9ca3af", maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.sourceDoc ?? "手动创建"}</Typography></TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                          <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: item.status === "enabled" ? "#4ade80" : "#d1d5db" }} />
                          <Typography sx={{ fontSize: "12px", color: item.status === "enabled" ? "#15803d" : "#6b7280" }}>{item.status === "enabled" ? "启用" : "停用"}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", gap: 0.5 }}>
                          <Tooltip title="查看详情" arrow><IconButton size="small" onClick={() => setDetailItem(item)} sx={{ width: 28, height: 28, borderRadius: "6px", color: "#9ca3af", "&:hover": { color: "#7c3aed", bgcolor: "#f5f3ff" } }}><Visibility sx={{ fontSize: 15 }} /></IconButton></Tooltip>
                          <Tooltip title="编辑" arrow><IconButton size="small" onClick={() => openEdit(item)} sx={{ width: 28, height: 28, borderRadius: "6px", color: "#9ca3af", "&:hover": { color: "#374151", bgcolor: "#f9fafb" } }}><Edit sx={{ fontSize: 15 }} /></IconButton></Tooltip>
                          <Tooltip title={item.status === "enabled" ? "停用" : "启用"} arrow><IconButton size="small" onClick={() => toggleStatus(item.id)} sx={{ width: 28, height: 28, borderRadius: "6px", color: item.status === "enabled" ? "#9ca3af" : "#10b981", "&:hover": { bgcolor: "#f9fafb" } }}><PowerSettingsNew sx={{ fontSize: 15 }} /></IconButton></Tooltip>
                          <Tooltip title="删除" arrow><IconButton size="small" onClick={() => doDelete(item.id)} sx={{ width: 28, height: 28, borderRadius: "6px", color: "#9ca3af", "&:hover": { color: "#ef4444", bgcolor: "#fef2f2" } }}><Delete sx={{ fontSize: 15 }} /></IconButton></Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Box>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: "12px" } }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 3, py: 2, borderBottom: "1px solid #f3f4f6" }}>
          <Typography sx={{ fontSize: "15px", fontWeight: 700, color: "#111827" }}>{editItem ? "编辑术语" : "新建术语"}</Typography>
          <IconButton size="small" onClick={() => setEditOpen(false)} sx={{ color: "#9ca3af" }}><Close sx={{ fontSize: 18 }} /></IconButton>
        </Box>
        <DialogContent sx={{ px: 3, py: 2.5 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField label="术语名称（首选词）*" fullWidth value={fTerm} onChange={e => setFTerm(e.target.value)} sx={{ "& .MuiInputBase-input": { fontSize: "13px" }, "& .MuiInputLabel-root": { fontSize: "13px" } }} />
            <TextField label="释义 *" fullWidth value={fDef} onChange={e => setFDef(e.target.value)} multiline rows={4} sx={{ "& .MuiInputBase-input": { fontSize: "13px" }, "& .MuiInputLabel-root": { fontSize: "13px" } }} />
            <TextField label="别名/同义词（用；分隔）" fullWidth value={fAlias} onChange={e => setFAlias(e.target.value)} sx={{ "& .MuiInputBase-input": { fontSize: "13px" }, "& .MuiInputLabel-root": { fontSize: "13px" } }} />
            <FormControl fullWidth size="small">
              <Select value={fCat} onChange={e => setFCat(e.target.value)} displayEmpty sx={{ fontSize: "13px" }}>
                {CATEGORIES.slice(1).map(c => <MenuItem key={c.id} value={c.name} sx={{ fontSize: "13px" }}>{c.name}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl fullWidth size="small">
              <Select value={fDoc} onChange={e => setFDoc(e.target.value)} displayEmpty sx={{ fontSize: "13px" }}>
                <MenuItem value="" sx={{ fontSize: "13px" }}><em>来源文档（可选）</em></MenuItem>
                {MOCK_DOCS.map(d => <MenuItem key={d} value={d} sx={{ fontSize: "13px" }}>{d}</MenuItem>)}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, gap: 1, borderTop: "1px solid #f3f4f6" }}>
          <Button onClick={() => setEditOpen(false)} sx={{ textTransform: "none", color: "#374151", borderRadius: "7px", fontSize: "13px" }}>取消</Button>
          <Button variant="contained" onClick={saveEdit} sx={{ bgcolor: "#7c3aed", borderRadius: "7px", textTransform: "none", fontSize: "13px", boxShadow: "none", "&:hover": { bgcolor: "#6d28d9", boxShadow: "none" } }}>保存</Button>
        </DialogActions>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={!!detailItem} onClose={() => setDetailItem(null)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: "12px" } }}>
        {detailItem && (
          <>
            <Box sx={{ display: "flex", justifyContent: "space-between", px: 3, py: 2, borderBottom: "1px solid #f3f4f6" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Translate sx={{ fontSize: 18, color: "#7c3aed" }} />
                <Typography sx={{ fontSize: "15px", fontWeight: 700, color: "#111827" }}>{detailItem.term}</Typography>
              </Box>
              <IconButton size="small" onClick={() => setDetailItem(null)} sx={{ color: "#9ca3af" }}><Close sx={{ fontSize: 18 }} /></IconButton>
            </Box>
            <DialogContent sx={{ px: 3, py: 2.5 }}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Box>
                  <Typography sx={{ fontSize: "11px", color: "#9ca3af", mb: 0.5 }}>释义</Typography>
                  <Box sx={{ bgcolor: "#f8f9fb", borderRadius: "8px", p: 1.5 }}>
                    <Typography sx={{ fontSize: "13px", color: "#374151", lineHeight: 1.8 }}>{detailItem.definition}</Typography>
                  </Box>
                </Box>
                {detailItem.aliases.length > 0 && (
                  <Box>
                    <Typography sx={{ fontSize: "11px", color: "#9ca3af", mb: 0.75 }}>别名/同义词</Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
                      {detailItem.aliases.map(a => <Chip key={a} label={a} size="small" sx={{ height: 24, fontSize: "12px", bgcolor: "#f5f3ff", color: "#5b21b6", border: "none" }} />)}
                    </Box>
                  </Box>
                )}
                <Divider sx={{ borderColor: "#f3f4f6" }} />
                {[
                  { label: "来源文档", value: detailItem.sourceDoc ?? "手动创建" },
                  { label: "知识类目", value: detailItem.category },
                  { label: "创建方式", value: detailItem.method === "ai" ? "AI 抽取" : "人工创建" },
                  { label: "创建时间", value: detailItem.createdAt },
                ].map(f => (
                  <Box key={f.label} sx={{ display: "flex", gap: 2, py: 0.75, borderBottom: "1px solid #f5f5f5" }}>
                    <Typography sx={{ fontSize: "12px", color: "#9ca3af", minWidth: 80, flexShrink: 0 }}>{f.label}</Typography>
                    <Typography sx={{ fontSize: "13px", color: "#374151" }}>{f.value}</Typography>
                  </Box>
                ))}
              </Box>
            </DialogContent>
          </>
        )}
      </Dialog>

      {/* AI Dialog */}
      <Dialog open={aiOpen} onClose={() => { setAiOpen(false); setAiDrafts([]); }} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: "12px" } }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 3, py: 2, borderBottom: "1px solid #f3f4f6" }}>
          <Typography sx={{ fontSize: "15px", fontWeight: 700, color: "#111827" }}>AI 辅助抽取</Typography>
          <IconButton size="small" onClick={() => { setAiOpen(false); setAiDrafts([]); }} sx={{ color: "#9ca3af" }}><Close sx={{ fontSize: 18 }} /></IconButton>
        </Box>
        <DialogContent sx={{ px: 3, py: 2.5 }}>
          <Typography sx={{ fontSize: "12px", color: "#9ca3af", mb: 1 }}>选择标准化文档</Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, mb: 2 }}>
            {MOCK_DOCS.map(d => (
              <Chip key={d} label={d} size="small" onClick={() => setAiDocs(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d])}
                sx={{ height: 28, fontSize: "12px", cursor: "pointer", bgcolor: aiDocs.includes(d) ? "#7c3aed" : "#f1f5f9", color: aiDocs.includes(d) ? "#fff" : "#475569", border: "none" }} />
            ))}
          </Box>
          {aiLoading && <LinearProgress sx={{ borderRadius: "4px", mb: 2, "& .MuiLinearProgress-bar": { bgcolor: "#7c3aed" } }} />}
          {aiDrafts.length > 0 && (
            <Box>
              <Typography sx={{ fontSize: "12px", color: "#9ca3af", mb: 1 }}>AI 抽取结果（勾选后确认加入）</Typography>
              {aiDrafts.map(d => (
                <Box key={d.id} onClick={() => setAiDraftSel(prev => { const n = new Set(prev); n.has(d.id) ? n.delete(d.id) : n.add(d.id); return n; })}
                  sx={{ p: 1.5, mb: 1, border: `1px solid ${aiDraftSel.has(d.id) ? "#7c3aed" : "#e8eaed"}`, borderRadius: "8px", cursor: "pointer", bgcolor: aiDraftSel.has(d.id) ? "#faf5ff" : "#fafafa" }}>
                  <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "#374151", mb: 0.5 }}>{d.term}</Typography>
                  <Typography sx={{ fontSize: "12px", color: "#6b7280" }}>{d.definition.slice(0, 60)}…</Typography>
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, gap: 1, borderTop: "1px solid #f3f4f6" }}>
          <Button onClick={() => { setAiOpen(false); setAiDrafts([]); }} sx={{ textTransform: "none", color: "#374151", borderRadius: "7px", fontSize: "13px" }}>取消</Button>
          {aiDrafts.length === 0
            ? <Button variant="contained" onClick={startAI} disabled={aiLoading || !aiDocs.length} sx={{ bgcolor: "#7c3aed", borderRadius: "7px", textTransform: "none", fontSize: "13px", boxShadow: "none", "&:hover": { bgcolor: "#6d28d9" } }}>开始抽取</Button>
            : <Button variant="contained" onClick={confirmDrafts} disabled={!aiDraftSel.size} sx={{ bgcolor: "#7c3aed", borderRadius: "7px", textTransform: "none", fontSize: "13px", boxShadow: "none", "&:hover": { bgcolor: "#6d28d9" } }}>确认加入 ({aiDraftSel.size})</Button>
          }
        </DialogActions>
      </Dialog>

      <Snackbar open={toast.open} autoHideDuration={3000} onClose={() => setToast(t => ({ ...t, open: false }))} anchorOrigin={{ vertical: "top", horizontal: "center" }}>
        <Alert severity={toast.sev} onClose={() => setToast(t => ({ ...t, open: false }))} sx={{ borderRadius: "8px", fontSize: "13px" }}>{toast.msg}</Alert>
      </Snackbar>
    </Box>
  );
}
