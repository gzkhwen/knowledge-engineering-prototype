import { useState, useMemo } from "react";
import { useOutletContext } from "react-router";
import {
  Box, Typography, Button, Chip, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Dialog, DialogTitle, DialogContent, DialogActions,
  IconButton, Paper, Alert, TextField, Select, MenuItem, FormControl,
  Tooltip, Snackbar, LinearProgress, Slider, Checkbox, Tabs, Tab,
  List, ListItem, ListItemButton, ListItemText,
} from "@mui/material";
import {
  ContentCut, Add, PowerSettingsNew, Visibility, Close, CheckCircle,
  ErrorOutline, Schedule, Settings, PlayArrow, Delete, Search, FilterList,
} from "@mui/icons-material";
import { Project } from "../types";

type TaskStatus = "running" | "completed" | "failed";
type SliceStatus = "enabled" | "disabled";

interface SliceTask {
  id: string; category: string; docs: string[];
  chunkSize: number; overlapRatio: number; minChunkSize: number;
  status: TaskStatus; createdAt: string; completedAt?: string;
  sliceCount?: number; failReason?: string;
}

interface Slice {
  id: string; taskId: string; category: string; sourceDoc: string;
  content: string; charCount: number; status: SliceStatus;
  chunkIndex: number; createdAt: string;
}

const CATS = [
  { id: "all", name: "全部类目", count: 0 },
  { id: "c1", name: "产品知识 > 理财产品" },
  { id: "c2", name: "产品知识 > 信用卡产品" },
  { id: "c3", name: "业务流程 > 开户流程" },
];

const DOCS = ["金融产品使用手册.md", "产品FAQ汇总2024.xlsx", "理财业务规范v3.txt", "信用卡业务手册_202501.md"];

const SAMPLE_CONTENTS = [
  "净值型理财产品是指以基金净值方式运作、定期或不定期披露净值的理财产品。其收益随市场波动，无预期收益或保本承诺，投资者需自行承担投资风险。",
  "信用卡申请流程共分六个步骤：第一步，填写申请表；第二步，提交身份证、收入证明等材料；第三步，银行审核（通常 3–5 个工作日）；第四步，审核通过后制卡并邮寄（通常 7–10 个工作日）；第五步，持卡人收到卡后激活；第六步，开始使用并享受各项权益。",
  "账单日（结账日）是银行每月固定对信用卡账户进行结算的日期，通常为每月固定日期（如 10 日）。在账单日，银行统计自上一账单日次日至本账单日期间的所有消费、还款及调整记录，生成当期账单。",
  "个人客户开户流程：携带本人身份证原件 → 到达任一网点 → 取号等候 → 填写开户申请表 → 柜员验证身份 → 设置初始密码 → 领取银行卡 → 激活网上银行。全程约 20–30 分钟。",
  "临时额度申请条件：① 账户状态正常，无逾期记录；② 持卡满 6 个月；③ 近 6 个月内无信用卡挂失记录。申请方式：手机银行 App → 信用卡 → 额度管理 → 申请临时额度。",
  "风险承受能力评估根据投资者的年龄、收入、投资经验、风险态度等维度综合评分，结果分为五个等级：R1 保守型、R2 稳健型、R3 平衡型、R4 积极型、R5 激进型。评估有效期 1 年。",
  "还款方式说明：① 全额还款：在还款日前还清全部账单金额，享受完整免息期；② 最低还款额：须还账单金额的至少 10%；③ 分期还款：将大额消费分 3/6/12/24 期还款，须支付分期手续费。",
  "理财产品到期后，本金及收益将在到期日 T+1 个工作日自动划转至您的关联银行卡账户。如您开通了自动续期服务，系统将自动按原期限续期，届时您将收到短信通知。",
];

const INIT_TASKS: SliceTask[] = [
  { id: "task1", category: "产品知识 > 理财产品", docs: ["金融产品使用手册.md"], chunkSize: 500, overlapRatio: 10, minChunkSize: 100, status: "completed", createdAt: "2026-03-20 14:30", completedAt: "2026-03-20 14:31", sliceCount: 8 },
  { id: "task2", category: "产品知识 > 信用卡产品", docs: ["产品FAQ汇总2024.xlsx"], chunkSize: 400, overlapRatio: 15, minChunkSize: 80, status: "completed", createdAt: "2026-03-21 10:00", completedAt: "2026-03-21 10:01", sliceCount: 6 },
  { id: "task3", category: "业务流程 > 开户流程", docs: ["理财业务规范v3.txt"], chunkSize: 600, overlapRatio: 10, minChunkSize: 120, status: "failed", createdAt: "2026-03-22 09:00", failReason: "文档内容结构异常，段落分隔识别失败" },
];

function genSlices(tasks: SliceTask[]): Slice[] {
  const res: Slice[] = [];
  tasks.filter(t => t.status === "completed").forEach(task => {
    const cnt = Math.min(task.sliceCount ?? 4, 4);
    const docSplit = SAMPLE_CONTENTS.slice(0, cnt);
    docSplit.forEach((content, i) => {
      res.push({
        id: `sl_${task.id}_${i}`, taskId: task.id, category: task.category,
        sourceDoc: task.docs[0] ?? "未知文档", content, charCount: content.length,
        status: "enabled", chunkIndex: i, createdAt: task.completedAt ?? task.createdAt,
      });
    });
  });
  return res;
}

export function UnstructuredSliceBuilding() {
  const { project } = useOutletContext<{ project: Project }>();
  const key = `sliceTasks_${project.id}`;

  const [tasks, setTasks] = useState<SliceTask[]>(() => {
    try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : INIT_TASKS; } catch { return INIT_TASKS; }
  });
  const saveTasks = (d: SliceTask[]) => { setTasks(d); localStorage.setItem(key, JSON.stringify(d)); };

  const allSlices = useMemo(() => genSlices(tasks), [tasks]);

  const [selCat, setSelCat] = useState("all");
  const [tab, setTab] = useState(0); // 0=任务, 1=结果
  const [filterDoc, setFilterDoc] = useState("all");
  const [buildOpen, setBuildOpen] = useState(false);
  const [building, setBuilding] = useState(false);
  const [sliceDetail, setSliceDetail] = useState<Slice | null>(null);

  // Build form
  const [bDocs, setBDocs] = useState<string[]>([]);
  const [bCat, setBCat] = useState(CATS[1].name);
  const [bChunkSize, setBChunkSize] = useState(500);
  const [bOverlap, setBOverlap] = useState(10);
  const [bMinChunk, setBMinChunk] = useState(100);

  const [toast, setToast] = useState({ open: false, msg: "", sev: "success" as "success" | "error" | "warning" });
  const showToast = (msg: string, sev: "success" | "error" | "warning" = "success") => setToast({ open: true, msg, sev });

  const filteredTasks = useMemo(() => tasks.filter(t => selCat === "all" || t.category === selCat), [tasks, selCat]);

  const filteredSlices = useMemo(() => allSlices.filter(s => {
    if (selCat !== "all" && s.category !== selCat) return false;
    if (filterDoc !== "all" && s.sourceDoc !== filterDoc) return false;
    return true;
  }), [allSlices, selCat, filterDoc]);

  const catCounts = useMemo(() => {
    const m: Record<string, number> = {};
    allSlices.forEach(s => { m[s.category] = (m[s.category] || 0) + 1; });
    return m;
  }, [allSlices]);

  const handleBuild = async () => {
    if (!bDocs.length) { showToast("请至少选择一份标准化文档", "warning"); return; }
    setBuilding(true);
    const newTask: SliceTask = {
      id: `task_${Date.now()}`, category: bCat, docs: [...bDocs],
      chunkSize: bChunkSize, overlapRatio: bOverlap, minChunkSize: bMinChunk,
      status: "running", createdAt: new Date().toLocaleString("zh-CN").replace(/\//g, "-"),
    };

    // If re-running for same doc+cat, mark it as replacement
    const existingForSameDoc = tasks.filter(t => t.category === bCat && t.docs.some(d => bDocs.includes(d)) && t.status === "completed");
    const idsToReplace = new Set(existingForSameDoc.map(t => t.id));

    const updatedTasks = tasks.filter(t => !idsToReplace.has(t.id));
    saveTasks([...updatedTasks, newTask]);
    setBuildOpen(false);

    await new Promise(r => setTimeout(r, 2000));
    saveTasks(prev => prev.map(t => t.id === newTask.id
      ? { ...t, status: "completed" as TaskStatus, completedAt: new Date().toLocaleString("zh-CN").replace(/\//g, "-"), sliceCount: Math.floor(Math.random() * 6) + 4 }
      : t
    ));
    setBuilding(false);
    showToast(existingForSameDoc.length > 0 ? `切片构建完成，已覆盖 ${existingForSameDoc.length} 个旧任务的结果` : "切片构建完成");
  };

  const toggleSliceStatus = (sliceId: string) => {
    // Since slices are generated from tasks, we need a separate store for overrides
    showToast("状态已切换");
  };

  const TASK_STATUS = {
    running:   { label: "运行中", bg: "#eff6ff", color: "#1d4ed8", dot: "#60a5fa" },
    completed: { label: "已完成", bg: "#f0fdf4", color: "#15803d", dot: "#4ade80" },
    failed:    { label: "失败",   bg: "#fef2f2", color: "#b91c1c", dot: "#f87171" },
  };

  const cats = [
    { id: "all", name: "全部类目", count: allSlices.length },
    ...CATS.slice(1).map(c => ({ ...c, count: catCounts[c.name] || 0 })),
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
        {/* Header */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
          <Box>
            <Typography sx={{ fontSize: "18px", fontWeight: 700, color: "#111827" }}>非结构化切片构建</Typography>
            <Typography sx={{ fontSize: "13px", color: "#94a3b8", mt: 0.25 }}>对标准化文档进行切片处理，生成可检索的非结构化知识切片</Typography>
          </Box>
          <Button variant="contained" startIcon={<Add sx={{ fontSize: 15 }} />} onClick={() => { setBDocs([]); setBCat(CATS[selCat !== "all" ? cats.findIndex(c => c.name === selCat) : 1]?.name ?? CATS[1].name); setBuildOpen(true); }}
            sx={{ bgcolor: "#7c3aed", borderRadius: "8px", textTransform: "none", fontSize: "13px", px: 2.5, boxShadow: "none", "&:hover": { bgcolor: "#6d28d9", boxShadow: "none" } }}>
            发起切片构建
          </Button>
        </Box>

        {building && (
          <Alert severity="info" icon={<ContentCut sx={{ fontSize: 15 }} />}
            sx={{ mb: 2, bgcolor: "#eff6ff", color: "#1e40af", border: "1px solid #bfdbfe", borderRadius: "8px", py: 0.75, "& .MuiAlert-message": { width: "100%", fontSize: "12px" } }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography sx={{ fontSize: "12px" }}>正在执行切片构建，请稍候…</Typography>
              <LinearProgress sx={{ flex: 1, borderRadius: "4px", "& .MuiLinearProgress-bar": { bgcolor: "#7c3aed" } }} />
            </Box>
          </Alert>
        )}

        {/* Tabs */}
        <Box sx={{ borderBottom: "1px solid #e8eaed", mb: 2 }}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)}
            sx={{ "& .MuiTab-root": { fontSize: "13px", textTransform: "none", minHeight: 40, py: 0.5 }, "& .MuiTabs-indicator": { bgcolor: "#7c3aed" } }}>
            <Tab label={`任务 (${filteredTasks.length})`} />
            <Tab label={`结果 (${filteredSlices.length})`} />
          </Tabs>
        </Box>

        {/* Tasks Tab */}
        {tab === 0 && (
          <Paper sx={{ border: "1px solid #e8eaed", borderRadius: "10px", boxShadow: "none", overflow: "hidden", flex: 1 }}>
            {filteredTasks.length === 0 ? (
              <Box sx={{ py: 10, textAlign: "center" }}>
                <ContentCut sx={{ fontSize: 40, color: "#e8eaed", mb: 1 }} />
                <Typography sx={{ fontSize: "14px", color: "#9ca3af" }}>暂无切片任务，点击「发起切片构建」开始</Typography>
              </Box>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: "#f8f9fb" }}>
                      {["任务ID", "知识类目", "来源文档", "切片参数", "状态", "创建时间", "完成时间", "切片数"].map(h => (
                        <TableCell key={h} sx={{ fontSize: "12px", fontWeight: 600, color: "#6b7280", py: 1.5, borderBottom: "1px solid #f0f0f0", whiteSpace: "nowrap" }}>{h}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredTasks.map((task, i) => {
                      const ts = TASK_STATUS[task.status];
                      return (
                        <TableRow key={task.id} sx={{ bgcolor: i % 2 === 0 ? "#fff" : "#fafafa", "&:hover": { bgcolor: "#faf5ff" }, "& td": { borderBottom: "1px solid #f5f5f5" } }}>
                          <TableCell><Typography sx={{ fontSize: "11px", color: "#9ca3af", fontFamily: "monospace" }}>{task.id.slice(0, 12)}…</Typography></TableCell>
                          <TableCell><Typography sx={{ fontSize: "12px", color: "#374151" }}>{task.category}</Typography></TableCell>
                          <TableCell>
                            {task.docs.map(d => <Chip key={d} label={d} size="small" sx={{ height: 20, fontSize: "10px", bgcolor: "#f5f3ff", color: "#5b21b6", border: "none", mb: 0.25, "& .MuiChip-label": { px: 0.75 } }} />)}
                          </TableCell>
                          <TableCell>
                            <Typography sx={{ fontSize: "11px", color: "#6b7280" }}>
                              块大小:{task.chunkSize} / 重叠:{task.overlapRatio}% / 最小:{task.minChunkSize}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                              <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: ts.dot }} />
                              <Typography sx={{ fontSize: "12px", color: ts.color, fontWeight: 500 }}>{ts.label}</Typography>
                              {task.status === "failed" && task.failReason && (
                                <Tooltip title={task.failReason} arrow><ErrorOutline sx={{ fontSize: 13, color: "#ef4444", cursor: "help" }} /></Tooltip>
                              )}
                            </Box>
                          </TableCell>
                          <TableCell sx={{ fontSize: "11px", color: "#9ca3af", whiteSpace: "nowrap" }}>{task.createdAt}</TableCell>
                          <TableCell sx={{ fontSize: "11px", color: "#9ca3af", whiteSpace: "nowrap" }}>{task.completedAt ?? "—"}</TableCell>
                          <TableCell>
                            {task.sliceCount != null
                              ? <Chip label={`${task.sliceCount} 片`} size="small" sx={{ height: 20, fontSize: "11px", bgcolor: "#f0fdf4", color: "#15803d", border: "none", "& .MuiChip-label": { px: 0.75 } }} />
                              : <Typography sx={{ fontSize: "11px", color: "#d1d5db" }}>—</Typography>}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        )}

        {/* Results Tab */}
        {tab === 1 && (
          <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <Box sx={{ display: "flex", gap: 1.5, mb: 1.5, alignItems: "center" }}>
              <FormControl size="small" sx={{ minWidth: 180 }}>
                <Select value={filterDoc} onChange={e => setFilterDoc(e.target.value)}
                  sx={{ borderRadius: "8px", fontSize: "13px", bgcolor: "#fff", "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e8eaed" } }}>
                  <MenuItem value="all" sx={{ fontSize: "13px" }}>来源：全部文档</MenuItem>
                  {DOCS.map(d => <MenuItem key={d} value={d} sx={{ fontSize: "13px" }}>{d}</MenuItem>)}
                </Select>
              </FormControl>
              <Typography sx={{ fontSize: "12px", color: "#9ca3af" }}>共 {filteredSlices.length} 个切片</Typography>
            </Box>
            <Paper sx={{ border: "1px solid #e8eaed", borderRadius: "10px", boxShadow: "none", overflow: "hidden", flex: 1 }}>
              {filteredSlices.length === 0 ? (
                <Box sx={{ py: 10, textAlign: "center" }}>
                  <ContentCut sx={{ fontSize: 40, color: "#e8eaed", mb: 1 }} />
                  <Typography sx={{ fontSize: "14px", color: "#9ca3af" }}>暂无切片结果</Typography>
                </Box>
              ) : (
                <TableContainer sx={{ maxHeight: "calc(100vh - 340px)" }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        {["序号", "知识类目", "来源文档", "来源任务", "内容预览", "字符数", "状态", "操作"].map(h => (
                          <TableCell key={h} sx={{ fontSize: "12px", fontWeight: 600, color: "#6b7280", py: 1.5, borderBottom: "1px solid #f0f0f0", whiteSpace: "nowrap", bgcolor: "#f8f9fb" }}>{h}</TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredSlices.map((s, i) => (
                        <TableRow key={s.id} sx={{ bgcolor: i % 2 === 0 ? "#fff" : "#fafafa", "&:hover": { bgcolor: "#faf5ff" }, "& td": { borderBottom: "1px solid #f5f5f5" } }}>
                          <TableCell sx={{ py: 1.5 }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                              <Box sx={{ width: 28, height: 28, borderRadius: "6px", bgcolor: "#f5f3ff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                <Typography sx={{ fontSize: "11px", color: "#7c3aed", fontWeight: 700 }}>{i + 1}</Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell><Typography sx={{ fontSize: "11px", color: "#6b7280" }}>{s.category}</Typography></TableCell>
                          <TableCell><Typography sx={{ fontSize: "11px", color: "#9ca3af", maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.sourceDoc}</Typography></TableCell>
                          <TableCell><Typography sx={{ fontSize: "10px", color: "#9ca3af", fontFamily: "monospace" }}>{s.taskId.slice(0, 10)}…</Typography></TableCell>
                          <TableCell sx={{ maxWidth: 280 }}>
                            <Typography sx={{ fontSize: "12px", color: "#374151", overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", lineHeight: 1.6 }}>{s.content}</Typography>
                          </TableCell>
                          <TableCell><Typography sx={{ fontSize: "11px", color: "#6b7280" }}>{s.charCount}</Typography></TableCell>
                          <TableCell>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                              <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: s.status === "enabled" ? "#4ade80" : "#d1d5db" }} />
                              <Typography sx={{ fontSize: "12px", color: s.status === "enabled" ? "#15803d" : "#6b7280" }}>{s.status === "enabled" ? "启用" : "停用"}</Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Tooltip title="查看详情" arrow>
                              <IconButton size="small" onClick={() => setSliceDetail(s)} sx={{ width: 28, height: 28, borderRadius: "6px", color: "#9ca3af", "&:hover": { color: "#7c3aed", bgcolor: "#f5f3ff" } }}>
                                <Visibility sx={{ fontSize: 15 }} />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Paper>
          </Box>
        )}
      </Box>

      {/* Build Dialog */}
      <Dialog open={buildOpen} onClose={() => setBuildOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: "14px" } }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 3, py: 2, borderBottom: "1px solid #f3f4f6" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <ContentCut sx={{ fontSize: 18, color: "#7c3aed" }} />
            <Typography sx={{ fontSize: "15px", fontWeight: 700, color: "#111827" }}>发起切片构建</Typography>
          </Box>
          <IconButton size="small" onClick={() => setBuildOpen(false)} sx={{ color: "#9ca3af" }}><Close sx={{ fontSize: 18 }} /></IconButton>
        </Box>
        <DialogContent sx={{ px: 3, py: 2.5 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            {/* Category */}
            <Box>
              <Typography sx={{ fontSize: "12px", color: "#6b7280", mb: 1, fontWeight: 600 }}>目标知识类目</Typography>
              <FormControl fullWidth size="small">
                <Select value={bCat} onChange={e => setBCat(e.target.value)} sx={{ fontSize: "13px" }}>
                  {CATS.slice(1).map(c => <MenuItem key={c.id} value={c.name} sx={{ fontSize: "13px" }}>{c.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Box>
            {/* Docs */}
            <Box>
              <Typography sx={{ fontSize: "12px", color: "#6b7280", mb: 1, fontWeight: 600 }}>选择标准化文档（可多选）</Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
                {DOCS.map(d => (
                  <Chip key={d} label={d} size="small" onClick={() => setBDocs(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d])}
                    sx={{ height: 28, fontSize: "12px", cursor: "pointer", bgcolor: bDocs.includes(d) ? "#7c3aed" : "#f1f5f9", color: bDocs.includes(d) ? "#fff" : "#475569", border: "none" }} />
                ))}
              </Box>
              {!bDocs.length && <Typography sx={{ fontSize: "11px", color: "#ef4444", mt: 0.5 }}>请至少选择一份文档</Typography>}
            </Box>
            {/* Params */}
            <Box sx={{ p: 2, bgcolor: "#f8f9fb", border: "1px solid #e8eaed", borderRadius: "8px" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 2 }}>
                <Settings sx={{ fontSize: 14, color: "#7c3aed" }} />
                <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "#374151" }}>切片参数配置</Typography>
              </Box>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                    <Typography sx={{ fontSize: "12px", color: "#6b7280" }}>目标块大小（字符）</Typography>
                    <Typography sx={{ fontSize: "12px", color: "#7c3aed", fontWeight: 600 }}>{bChunkSize}</Typography>
                  </Box>
                  <Slider value={bChunkSize} onChange={(_, v) => setBChunkSize(v as number)} min={100} max={2000} step={50}
                    sx={{ color: "#7c3aed", height: 4, "& .MuiSlider-thumb": { width: 14, height: 14 } }} />
                </Box>
                <Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                    <Typography sx={{ fontSize: "12px", color: "#6b7280" }}>重叠比例</Typography>
                    <Typography sx={{ fontSize: "12px", color: "#7c3aed", fontWeight: 600 }}>{bOverlap}%</Typography>
                  </Box>
                  <Slider value={bOverlap} onChange={(_, v) => setBOverlap(v as number)} min={0} max={50} step={5}
                    sx={{ color: "#7c3aed", height: 4, "& .MuiSlider-thumb": { width: 14, height: 14 } }} />
                </Box>
                <Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                    <Typography sx={{ fontSize: "12px", color: "#6b7280" }}>最小块大小（字符）</Typography>
                    <Typography sx={{ fontSize: "12px", color: "#7c3aed", fontWeight: 600 }}>{bMinChunk}</Typography>
                  </Box>
                  <Slider value={bMinChunk} onChange={(_, v) => setBMinChunk(v as number)} min={20} max={500} step={20}
                    sx={{ color: "#7c3aed", height: 4, "& .MuiSlider-thumb": { width: 14, height: 14 } }} />
                </Box>
              </Box>
            </Box>
            {tasks.some(t => t.category === bCat && t.docs.some(d => bDocs.includes(d)) && t.status === "completed") && (
              <Alert severity="warning" sx={{ bgcolor: "#fffbeb", color: "#92400e", border: "1px solid #fde68a", borderRadius: "8px", "& .MuiAlert-message": { fontSize: "12px" } }}>
                检测到当前类目下已有对应文档的切片结果，重新构建将覆盖旧的切片结果
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, gap: 1, borderTop: "1px solid #f3f4f6" }}>
          <Button onClick={() => setBuildOpen(false)} sx={{ textTransform: "none", color: "#374151", borderRadius: "7px", fontSize: "13px" }}>取消</Button>
          <Button variant="contained" onClick={handleBuild} disabled={!bDocs.length}
            sx={{ bgcolor: "#7c3aed", borderRadius: "7px", textTransform: "none", fontSize: "13px", boxShadow: "none", "&:hover": { bgcolor: "#6d28d9", boxShadow: "none" } }}>
            开始构建
          </Button>
        </DialogActions>
      </Dialog>

      {/* Slice Detail Dialog */}
      <Dialog open={!!sliceDetail} onClose={() => setSliceDetail(null)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: "12px" } }}>
        {sliceDetail && (
          <>
            <Box sx={{ display: "flex", justifyContent: "space-between", px: 3, py: 2, borderBottom: "1px solid #f3f4f6" }}>
              <Typography sx={{ fontSize: "15px", fontWeight: 700, color: "#111827" }}>切片详情</Typography>
              <IconButton size="small" onClick={() => setSliceDetail(null)} sx={{ color: "#9ca3af" }}><Close sx={{ fontSize: 18 }} /></IconButton>
            </Box>
            <DialogContent sx={{ px: 3, py: 2.5 }}>
              <Box sx={{ bgcolor: "#1e293b", borderRadius: "8px", p: 2.5, mb: 2 }}>
                <Typography component="pre" sx={{ fontSize: "13px", color: "#e2e8f0", fontFamily: "monospace", whiteSpace: "pre-wrap", lineHeight: 1.8, m: 0 }}>
                  {sliceDetail.content}
                </Typography>
              </Box>
              {[
                { label: "字符数", value: `${sliceDetail.charCount} 字符` },
                { label: "知识类目", value: sliceDetail.category },
                { label: "来源文档", value: sliceDetail.sourceDoc },
                { label: "来源任务", value: sliceDetail.taskId },
                { label: "创建时间", value: sliceDetail.createdAt },
              ].map(f => (
                <Box key={f.label} sx={{ display: "flex", gap: 2, py: 0.75, borderBottom: "1px solid #f5f5f5" }}>
                  <Typography sx={{ fontSize: "12px", color: "#9ca3af", minWidth: 80, flexShrink: 0 }}>{f.label}</Typography>
                  <Typography sx={{ fontSize: "13px", color: "#374151" }}>{f.value}</Typography>
                </Box>
              ))}
            </DialogContent>
          </>
        )}
      </Dialog>

      <Snackbar open={toast.open} autoHideDuration={3000} onClose={() => setToast(t => ({ ...t, open: false }))} anchorOrigin={{ vertical: "top", horizontal: "center" }}>
        <Alert severity={toast.sev} onClose={() => setToast(t => ({ ...t, open: false }))} sx={{ borderRadius: "8px", fontSize: "13px" }}>{toast.msg}</Alert>
      </Snackbar>
    </Box>
  );
}
