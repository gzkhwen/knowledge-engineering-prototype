import { useState, useMemo } from "react";
import { useOutletContext } from "react-router";
import {
  Box, Typography, Button, Chip, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Dialog, DialogContent, DialogActions,
  IconButton, Paper, TextField, Select, MenuItem, FormControl,
  Tooltip, Divider, Snackbar, Alert, LinearProgress, List, ListItem,
  ListItemButton, ListItemText, Tabs, Tab,
} from "@mui/material";
import {
  Add, Edit, Delete, AutoAwesome, CheckCircle, PowerSettingsNew, QuestionAnswer,
  Close, Source, AccessTime, Visibility, Search, Hub, Settings,
} from "@mui/icons-material";
import { Project } from "../types";

type ItemStatus = "enabled" | "disabled";
type CreateMethod = "ai" | "manual";

interface QAItem {
  id: string; question: string; answer: string; similarQuestions: string[];
  sourceDoc?: string; category: string; status: ItemStatus; method: CreateMethod;
  createdAt: string; updatedAt: string;
}

const MOCK_DOCS = ["金融产品使用手册.md", "产品FAQ汇总2024.xlsx", "理财业务规范v3.txt", "知识库建设标准_v2.txt"];

const CATEGORIES = [
  { id: "all", name: "全部类目", count: 0 },
  { id: "c1", name: "产品知识 > 理财产品", count: 0 },
  { id: "c2", name: "产品知识 > 信用卡产品", count: 0 },
  { id: "c3", name: "业务流程 > 开户流程", count: 0 },
];

const INIT_ITEMS: QAItem[] = [
  { id: "q1", question: "理财产品的申购起点金额是多少？", answer: "本行理财产品最低申购金额为 1 万元人民币，部分高端产品起点为 10 万元或 100 万元，具体以产品说明书为准。", similarQuestions: ["理财起购金额", "理财最少买多少"], sourceDoc: "产品FAQ汇总2024.xlsx", category: "产品知识 > 理财产品", status: "enabled", method: "ai", createdAt: "2026-03-19 14:30", updatedAt: "2026-03-19 14:30" },
  { id: "q2", question: "信用卡额度如何申请临时提升？", answer: "您可通过以下方式申请：① 手机银行 App → 信用卡 → 额度管理 → 申请临时额度；② 拨打客服热线；③ 到访网点柜台申请。临时额度有效期为 7–30 天，到期自动恢复。", similarQuestions: ["信用卡临时额度", "提升信用额度"], sourceDoc: "产品FAQ汇总2024.xlsx", category: "产品知识 > 信用卡产品", status: "enabled", method: "ai", createdAt: "2026-03-19 14:35", updatedAt: "2026-03-19 14:35" },
  { id: "q3", question: "开户需要携带哪些材料？", answer: "个人客户开户需携带：① 本人有效身份证原件；② 本人手机号（用于验证码）；③ 初始存款（活期无最低要求）。企业客户另需营业执照、法人授权书等，请提前致电预约。", similarQuestions: ["开户所需证件", "开银行卡要什么材料"], category: "业务流程 > 开户流程", status: "enabled", method: "manual", createdAt: "2026-03-20 09:15", updatedAt: "2026-03-20 10:02" },
  { id: "q4", question: "网上银行密码忘记如何重置？", answer: "重置网上银行密码有三种方式：① 手机银行 App → 安全中心 → 忘记密码；② 拨打 400 客服热线；③ 携带身份证到网点柜台办理。重置后新密码须包含大小写字母和数字，长度 8–16 位。", similarQuestions: ["忘记密码怎么办"], sourceDoc: "产品FAQ汇总2024.xlsx", category: "产品知识 > 信用卡产品", status: "disabled", method: "ai", createdAt: "2026-03-19 15:00", updatedAt: "2026-03-21 11:30" },
  { id: "q5", question: "理财产品到期后资金如何处理？", answer: "理财产品到期后，本金及收益将在到期日 T+1 个工作日自动划转至关联银行卡账户。如开通自动续期服务，系统将自动按原期限续期，届时您将收到短信通知。", similarQuestions: ["理财到期了怎么办"], sourceDoc: "金融产品使用手册.md", category: "产品知识 > 理财产品", status: "enabled", method: "ai", createdAt: "2026-03-20 14:20", updatedAt: "2026-03-20 14:20" },
];

export function QALibraryPage() {
  const { project } = useOutletContext<{ project: Project }>();
  const key = `qaItems_${project.id}`;
  const [items, setItems] = useState<QAItem[]>(() => {
    try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : INIT_ITEMS; } catch { return INIT_ITEMS; }
  });
  const save = (d: QAItem[]) => { setItems(d); localStorage.setItem(key, JSON.stringify(d)); };

  const [selCat, setSelCat] = useState("all");
  const [filterQ, setFilterQ] = useState("");
  const [filterDoc, setFilterDoc] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [editOpen, setEditOpen] = useState(false);
  const [editItem, setEditItem] = useState<QAItem | null>(null);
  const [detailItem, setDetailItem] = useState<QAItem | null>(null);
  const [detailTab, setDetailTab] = useState(0);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiDocs, setAiDocs] = useState<string[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiDrafts, setAiDrafts] = useState<QAItem[]>([]);
  const [aiDraftSel, setAiDraftSel] = useState<Set<string>>(new Set());
  const [fQ, setFQ] = useState(""); const [fA, setFA] = useState(""); const [fSim, setFSim] = useState("");
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
      return it.question.toLowerCase().includes(q) || it.answer.toLowerCase().includes(q);
    }
    return true;
  }), [items, selCat, filterDoc, filterStatus, filterQ]);

  const toggleStatus = (id: string) => {
    save(items.map(it => it.id === id ? { ...it, status: it.status === "enabled" ? "disabled" : "enabled" } as QAItem : it));
    showToast("状态已切换");
  };
  const doDelete = (id: string) => { save(items.filter(it => it.id !== id)); showToast("已删除"); };

  const openEdit = (item?: QAItem) => {
    setEditItem(item ?? null);
    if (item) { setFQ(item.question); setFA(item.answer); setFSim(item.similarQuestions.join("；")); setFDoc(item.sourceDoc ?? ""); setFCat(item.category); }
    else { setFQ(""); setFA(""); setFSim(""); setFDoc(""); setFCat(selCat !== "all" ? selCat : CATEGORIES[1].name); }
    setEditOpen(true);
  };

  const saveEdit = () => {
    if (!fQ.trim() || !fA.trim()) { showToast("主问题和标准答案不能为空", "error"); return; }
    const now = new Date().toLocaleString("zh-CN").replace(/\//g, "-");
    if (editItem) {
      save(items.map(it => it.id === editItem.id ? { ...it, question: fQ.trim(), answer: fA.trim(), similarQuestions: fSim ? fSim.split("；").map(s => s.trim()).filter(Boolean) : [], sourceDoc: fDoc || undefined, category: fCat, updatedAt: now } : it));
      showToast("修改已保存");
    } else {
      save([...items, { id: `q_${Date.now()}`, question: fQ.trim(), answer: fA.trim(), similarQuestions: fSim ? fSim.split("；").map(s => s.trim()).filter(Boolean) : [], sourceDoc: fDoc || undefined, category: fCat, status: "enabled", method: "manual", createdAt: now, updatedAt: now }]);
      showToast("问答已创建");
    }
    setEditOpen(false);
  };

  const startAI = async () => {
    if (!aiDocs.length) { showToast("请至少选择一份标准化文档", "warning"); return; }
    setAiLoading(true);
    await new Promise(r => setTimeout(r, 2000));
    const now = new Date().toLocaleString("zh-CN").replace(/\//g, "-");
    const drafts: QAItem[] = [
      { id: `ai_q_1_${Date.now()}`, question: "理财产品提前赎回是否有手续费？", answer: "封闭式理财产品不支持提前赎回；开放式净值型产品可在开放日赎回，无手续费，赎回资金 T+1 到账。", similarQuestions: ["提前取出理财", "理财可以提前退出吗"], sourceDoc: aiDocs[0], category: "产品知识 > 理财产品", status: "disabled", method: "ai", createdAt: now, updatedAt: now },
      { id: `ai_q_2_${Date.now()}`, question: "信用卡账单日与还款日之间的关系？", answer: "账单日为银行生成账单的固定日期（如每月 10 日），还款日通常为账单日后第 20 天。在还款日前全额还款可享受完整免息期（约 20–50 天）。", similarQuestions: ["账单日和还款日区别"], sourceDoc: aiDocs[0], category: "产品知识 > 信用卡产品", status: "disabled", method: "ai", createdAt: now, updatedAt: now },
    ];
    setAiDrafts(drafts); setAiLoading(false); setAiDraftSel(new Set());
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
        {/* Top bar */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
          <Box>
            <Typography sx={{ fontSize: "18px", fontWeight: 700, color: "#111827" }}>问答库</Typography>
            <Typography sx={{ fontSize: "13px", color: "#94a3b8", mt: 0.25 }}>构建和管理问答知识对象，支持 AI 辅助抽取和人工创建</Typography>
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

        {/* Filter bar */}
        <Box sx={{ display: "flex", gap: 1.5, mb: 1.5, flexWrap: "wrap", alignItems: "center" }}>
          <Box sx={{ position: "relative", flex: 1, minWidth: 160 }}>
            <Search sx={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontSize: 16, color: "#94a3b8" }} />
            <TextField size="small" placeholder="搜索问题/答案" value={filterQ} onChange={e => setFilterQ(e.target.value)}
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

        {/* Table */}
        <Paper sx={{ border: "1px solid #e8eaed", borderRadius: "10px", boxShadow: "none", overflow: "hidden", flex: 1, display: "flex", flexDirection: "column" }}>
          <Box sx={{ px: 2, py: 1.25, borderBottom: "1px solid #f0f0f0", bgcolor: "#fafafa", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#374151" }}>
              {selCat === "all" ? "全部类目" : selCat}
              <span style={{ color: "#9ca3af", fontWeight: 400 }}> ({filtered.length})</span>
            </Typography>
          </Box>
          {filtered.length === 0 ? (
            <Box sx={{ py: 10, textAlign: "center" }}>
              <QuestionAnswer sx={{ fontSize: 40, color: "#e8eaed", mb: 1 }} />
              <Typography sx={{ fontSize: "14px", color: "#9ca3af" }}>暂无问答，可通过 AI 抽取或手动创建</Typography>
            </Box>
          ) : (
            <TableContainer sx={{ flex: 1, overflow: "auto" }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow sx={{ bgcolor: "#f8f9fb" }}>
                    {["主问题", "标准答案", "相似问题数", "知识类目", "来源文档", "状态", "操作"].map(h => (
                      <TableCell key={h} sx={{ fontSize: "12px", fontWeight: 600, color: "#6b7280", py: 1.5, borderBottom: "1px solid #f0f0f0", whiteSpace: "nowrap", bgcolor: "#f8f9fb" }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtered.map((item, i) => (
                    <TableRow key={item.id} sx={{ bgcolor: i % 2 === 0 ? "#fff" : "#fafafa", "&:hover": { bgcolor: "#faf5ff" }, "& td": { borderBottom: "1px solid #f5f5f5" } }}>
                      <TableCell sx={{ py: 1.5, maxWidth: 200 }}>
                        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 0.75 }}>
                          <QuestionAnswer sx={{ fontSize: 14, color: "#7c3aed", mt: "2px", flexShrink: 0 }} />
                          <Typography sx={{ fontSize: "13px", color: "#111827", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{item.question}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ maxWidth: 220 }}>
                        <Typography sx={{ fontSize: "12px", color: "#374151", overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", lineHeight: 1.6 }}>{item.answer}</Typography>
                      </TableCell>
                      <TableCell><Typography sx={{ fontSize: "11px", color: "#9ca3af" }}>{item.similarQuestions.length > 0 ? `${item.similarQuestions.length} 条` : "—"}</Typography></TableCell>
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
                          <Tooltip title="查看详情" arrow><IconButton size="small" onClick={() => { setDetailItem(item); setDetailTab(0); }} sx={{ width: 28, height: 28, borderRadius: "6px", color: "#9ca3af", "&:hover": { color: "#7c3aed", bgcolor: "#f5f3ff" } }}><Visibility sx={{ fontSize: 15 }} /></IconButton></Tooltip>
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
          <Typography sx={{ fontSize: "15px", fontWeight: 700, color: "#111827" }}>{editItem ? "编辑问答" : "新建问答"}</Typography>
          <IconButton size="small" onClick={() => setEditOpen(false)} sx={{ color: "#9ca3af" }}><Close sx={{ fontSize: 18 }} /></IconButton>
        </Box>
        <DialogContent sx={{ px: 3, py: 2.5 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField label="主问题 *" fullWidth value={fQ} onChange={e => setFQ(e.target.value)} multiline rows={2} sx={{ "& .MuiInputBase-input": { fontSize: "13px" }, "& .MuiInputLabel-root": { fontSize: "13px" } }} />
            <TextField label="标准答案 *" fullWidth value={fA} onChange={e => setFA(e.target.value)} multiline rows={4} sx={{ "& .MuiInputBase-input": { fontSize: "13px" }, "& .MuiInputLabel-root": { fontSize: "13px" } }} />
            <TextField label="相似问题（用；分隔）" fullWidth value={fSim} onChange={e => setFSim(e.target.value)} sx={{ "& .MuiInputBase-input": { fontSize: "13px" }, "& .MuiInputLabel-root": { fontSize: "13px" } }} />
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
            <Box sx={{ px: 3, pt: 2.5, pb: 0 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <QuestionAnswer sx={{ fontSize: 18, color: "#7c3aed" }} />
                  <Typography sx={{ fontSize: "14px", fontWeight: 700, color: "#111827" }}>问答详情</Typography>
                </Box>
                <IconButton size="small" onClick={() => setDetailItem(null)} sx={{ color: "#9ca3af" }}><Close sx={{ fontSize: 18 }} /></IconButton>
              </Box>
              <Tabs value={detailTab} onChange={(_, v) => setDetailTab(v)}
                sx={{ "& .MuiTab-root": { fontSize: "13px", textTransform: "none", minHeight: 40, px: 0, mr: 3 }, "& .MuiTabs-indicator": { bgcolor: "#7c3aed" } }}>
                <Tab label="问答内容" />
                <Tab label="来源追溯" />
                <Tab label="构建方案" />
              </Tabs>
            </Box>
            <Divider sx={{ borderColor: "#f3f4f6" }} />
            <DialogContent sx={{ px: 3, py: 2.5 }}>
              {detailTab === 0 && (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <Box>
                    <Typography sx={{ fontSize: "11px", color: "#9ca3af", mb: 0.5 }}>主问题</Typography>
                    <Box sx={{ bgcolor: "#eff6ff", borderRadius: "8px", p: 1.5 }}>
                      <Typography sx={{ fontSize: "13px", color: "#1d4ed8", fontWeight: 500 }}>{detailItem.question}</Typography>
                    </Box>
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: "11px", color: "#9ca3af", mb: 0.5 }}>标准答案</Typography>
                    <Box sx={{ bgcolor: "#f8f9fb", borderRadius: "8px", p: 1.5 }}>
                      <Typography sx={{ fontSize: "13px", color: "#374151", lineHeight: 1.8 }}>{detailItem.answer}</Typography>
                    </Box>
                  </Box>
                  {detailItem.similarQuestions.length > 0 && (
                    <Box>
                      <Typography sx={{ fontSize: "11px", color: "#9ca3af", mb: 0.75 }}>相似问题</Typography>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
                        {detailItem.similarQuestions.map(q => <Chip key={q} label={q} size="small" sx={{ height: 24, fontSize: "12px", bgcolor: "#f5f3ff", color: "#5b21b6", border: "none" }} />)}
                      </Box>
                    </Box>
                  )}
                </Box>
              )}
              {detailTab === 1 && (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                  {[
                    { label: "来源文档", value: detailItem.sourceDoc ?? "手动创建" },
                    { label: "知识类目", value: detailItem.category },
                    { label: "创建方式", value: detailItem.method === "ai" ? "AI 抽取" : "人工创建" },
                    { label: "创建时间", value: detailItem.createdAt },
                    { label: "更新时间", value: detailItem.updatedAt },
                  ].map(f => (
                    <Box key={f.label} sx={{ display: "flex", gap: 2, py: 1, borderBottom: "1px solid #f5f5f5" }}>
                      <Typography sx={{ fontSize: "12px", color: "#9ca3af", minWidth: 80, flexShrink: 0 }}>{f.label}</Typography>
                      <Typography sx={{ fontSize: "13px", color: "#374151" }}>{f.value}</Typography>
                    </Box>
                  ))}
                </Box>
              )}
              {detailTab === 2 && (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Settings sx={{ fontSize: 16, color: "#7c3aed" }} />
                    <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#111827" }}>查看构建方案</Typography>
                    <Chip label="只读" size="small" sx={{ height: 20, fontSize: "10px", bgcolor: "#f1f5f9", color: "#64748b" }} />
                  </Box>
                  {[
                    { tool: "OCR 识别", version: "v1.3.0", params: [["使用模型", "qwen3.5-plus"], ["文档内容提取", "开启"], ["表格深度解析", "开启"]] },
                    { tool: "问答抽取", version: "v1.0.0", params: [["置信度阈值", "0.75（低于此置信度不纳入结果）"], ["最大抽取数量", "50 对/文档"], ["提示词描述", "从文档中识别标准问答对，要求答案完整、上下文充分"]] },
                  ].map(group => (
                    <Box key={group.tool} sx={{ border: "1px solid #e8eaed", borderRadius: "10px", overflow: "hidden" }}>
                      <Box sx={{ px: 1.5, py: 1.1, bgcolor: "#fafafa", display: "flex", alignItems: "center", gap: 1, borderBottom: "1px solid #f3f4f6" }}>
                        <Hub sx={{ fontSize: 15, color: "#7c3aed" }} />
                        <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#111827" }}>{group.tool}</Typography>
                        <Chip label={group.version} size="small" sx={{ ml: "auto", height: 20, fontSize: "10px", bgcolor: "#ede9fe", color: "#5b21b6" }} />
                      </Box>
                      <Box sx={{ p: 1.5, display: "flex", flexDirection: "column", gap: 1 }}>
                        {group.params.map(([label, value]) => (
                          <Box key={label} sx={{ display: "flex", gap: 2, p: 1.1, bgcolor: "#f8f9fb", borderRadius: "8px" }}>
                            <Typography sx={{ width: 92, flexShrink: 0, fontSize: "12px", color: "#94a3b8" }}>{label}</Typography>
                            <Typography sx={{ fontSize: "13px", color: "#374151", lineHeight: 1.6 }}>{value}</Typography>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  ))}
                  <Box sx={{ p: 1.5, bgcolor: "#f8f9fb", borderRadius: "8px", border: "1px solid #e8eaed" }}>
                    {[
                      ["方案版本", "v1.0"],
                      ["最近执行时间", "2026-03-18 10:00:00"],
                      ["来源对象", detailItem.sourceDoc ?? "手动创建"],
                    ].map(([label, value]) => (
                      <Box key={label} sx={{ display: "flex", py: 0.5 }}>
                        <Typography sx={{ width: 92, flexShrink: 0, fontSize: "12px", color: "#94a3b8" }}>{label}</Typography>
                        <Typography sx={{ fontSize: "13px", color: "#374151" }}>{value}</Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}
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
          <Typography sx={{ fontSize: "12px", color: "#9ca3af", mb: 1 }}>选择标准化文档（可多选）</Typography>
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
                  <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "#374151", mb: 0.5 }}>{d.question}</Typography>
                  <Typography sx={{ fontSize: "12px", color: "#6b7280" }}>{d.answer.slice(0, 60)}…</Typography>
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
