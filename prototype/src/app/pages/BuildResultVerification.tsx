import { useState, useRef } from "react";
import { useOutletContext } from "react-router";
import {
  Box, Typography, Button, Chip, Paper, Alert, Snackbar, Tooltip, IconButton,
  TextField, InputAdornment, Divider, Tabs, Tab,
} from "@mui/material";
import {
  Search, CheckCircle, ThumbUp, ThumbDown, QuestionAnswer,
  ContentCut, Translate, Send, History as HistoryIcon, Circle,
} from "@mui/icons-material";
import { Project } from "../types";

type Relevance = "relevant" | "irrelevant" | "unmarked";
type ResultType = "qa" | "term" | "slice";

interface RecallItem {
  id: string; type: ResultType; content: string; category: string;
  sourceDoc?: string; relevance: Relevance; score?: number;
}

interface TestRecord {
  id: string; query: string; recallItems: RecallItem[]; time: string;
}

const MOCK_PKG = { name: "金融客服知识库", totalItems: 12 };

function mockSearch(query: string): RecallItem[] {
  const base: RecallItem[] = [
    { id: `r1_${Date.now()}`, type: "qa", content: "理财产品的申购起点金额为 1 万元人民币，部分高端产品起点为 10 万元或 100 万元，具体以产品说明书为准。", category: "产品知识 > 理财产品", sourceDoc: "产品FAQ汇总2024.xlsx", relevance: "unmarked", score: 0.94 },
    { id: `r2_${Date.now()}`, type: "slice", content: "净值型理财产品是指以基金净值方式运作、定期或不定期披露净值的理财产品。其收益随市场波动，无保本承诺，投资者须自行承担投资风险。", category: "产品知识 > 理财产品", sourceDoc: "金融产品使用手册.md", relevance: "unmarked", score: 0.87 },
    { id: `r3_${Date.now()}`, type: "qa", content: "理财产品到期后，本金及收益将在到期日 T+1 个工作日自动划转至关联银行卡账户。如开通自动续期，系统将自动按原期限续期。", category: "产品知识 > 理财产品", sourceDoc: "金融产品使用手册.md", relevance: "unmarked", score: 0.81 },
    { id: `r4_${Date.now()}`, type: "term", content: "净值型理财：以基金净值方式运作的理财产品，定期披露净值，收益随市场波动，无预期收益承诺。", category: "产品知识 > 理财产品", sourceDoc: "金融产品使用手册.md", relevance: "unmarked", score: 0.76 },
  ];
  const creditBase: RecallItem[] = [
    { id: `r5_${Date.now()}`, type: "qa", content: "信用卡临时额度申请条件：账户正常、持卡满6个月、近6个月无逾期。申请方式：手机银行App → 信用卡 → 额度管理 → 申请临时额度。临时额度有效期7–30天。", category: "产品知识 > 信用卡产品", sourceDoc: "产品FAQ汇总2024.xlsx", relevance: "unmarked", score: 0.93 },
    { id: `r6_${Date.now()}`, type: "slice", content: "账单日（结账日）是银行每月固定对信用卡账户进行结算的日期，通常为固定日期（如每月10日）。账单日统计上一账单日至本账单日的全部消费与还款，生成当期账单。", category: "产品知识 > 信用卡产品", sourceDoc: "金融产品使用手册.md", relevance: "unmarked", score: 0.82 },
    { id: `r7_${Date.now()}`, type: "term", content: "临时额度：银行基于持卡人需求临时授予的短期额度，有效期7–30天，到期恢复原额度，不影响长期信用记录。", category: "产品知识 > 信用卡产品", sourceDoc: "产品FAQ汇总2024.xlsx", relevance: "unmarked", score: 0.78 },
  ];
  const openAccBase: RecallItem[] = [
    { id: `r8_${Date.now()}`, type: "qa", content: "个人客户开户须携带：本人有效身份证原件、本人手机号（用于验证码）。活期账户无最低存款要求。企业客户另需营业执照和法人授权书。", category: "业务流程 > 开户流程", relevance: "unmarked", score: 0.96 },
    { id: `r9_${Date.now()}`, type: "slice", content: "个人客户开户流程：携带本人身份证 → 到达任一网点 → 取号 → 填写申请表 → 柜员验证 → 设置密码 → 领取银行卡 → 激活网上银行。全程约20–30分钟。", category: "业务流程 > 开户流程", sourceDoc: "理财业务规范v3.txt", relevance: "unmarked", score: 0.90 },
  ];
  const q = query.toLowerCase();
  if (q.includes("信用") || q.includes("额度") || q.includes("账单") || q.includes("还款")) return creditBase.slice(0, 3);
  if (q.includes("开户") || q.includes("开卡") || q.includes("证件")) return openAccBase;
  if (q.includes("理财") || q.includes("净值") || q.includes("申购") || q.includes("收益")) return base.slice(0, 3);
  return [...base.slice(0, 2), ...creditBase.slice(0, 1)];
}

const INIT_HISTORY: TestRecord[] = [
  { id: "h1", query: "理财产品怎么买", time: "2026-03-25 14:32", recallItems: [{ id: "r_h1", type: "qa", content: "理财产品的申购起点金额为1万元…", category: "产品知识 > 理财产品", sourceDoc: "产品FAQ汇总2024.xlsx", relevance: "relevant", score: 0.94 }] },
  { id: "h2", query: "开户要什么材料", time: "2026-03-25 14:35", recallItems: [{ id: "r_h2", type: "qa", content: "个人客户开户须携带：本人有效身份证原件…", category: "业务流程 > 开户流程", relevance: "relevant", score: 0.96 }] },
  { id: "h3", query: "信用卡额度申请", time: "2026-03-24 10:15", recallItems: [{ id: "r_h3", type: "qa", content: "信用卡临时额度申请条件：账户正常…", category: "产品知识 > 信用卡产品", sourceDoc: "产品FAQ汇总2024.xlsx", relevance: "relevant", score: 0.93 }] },
];

const TYPE_META: Record<ResultType, { label: string; bg: string; color: string; icon: any }> = {
  qa:    { label: "问答", bg: "#dbeafe", color: "#1e40af", icon: <QuestionAnswer sx={{ fontSize: 13 }} /> },
  term:  { label: "术语", bg: "#e0e7ff", color: "#4338ca", icon: <Translate sx={{ fontSize: 13 }} /> },
  slice: { label: "切片", bg: "#fce7f3", color: "#9f1239", icon: <ContentCut sx={{ fontSize: 13 }} /> },
};

export function BuildResultVerification() {
  const { project } = useOutletContext<{ project: Project }>();

  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [recallItems, setRecallItems] = useState<RecallItem[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [history, setHistory] = useState<TestRecord[]>(INIT_HISTORY);
  const [tab, setTab] = useState(0); // 0=搜索测试, 1=历史记录
  const [toast, setToast] = useState({ open: false, msg: "", sev: "success" as "success" | "error" | "warning" });
  const showToast = (msg: string, sev: "success" | "error" | "warning" = "success") => setToast({ open: true, msg, sev });

  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setSearching(true);
    setHasSearched(false);
    await new Promise(r => setTimeout(r, 800));
    const results = mockSearch(query.trim());
    setRecallItems(results);
    setHasSearched(true);
    setSearching(false);
    // Add to history
    const now = new Date().toLocaleString("zh-CN").replace(/\//g, "-");
    const record: TestRecord = { id: `h_${Date.now()}`, query: query.trim(), recallItems: results, time: now };
    setHistory(prev => [record, ...prev]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  const toggleRelevance = (itemId: string, relevance: Relevance) => {
    setRecallItems(prev => prev.map(it =>
      it.id === itemId ? { ...it, relevance: it.relevance === relevance ? "unmarked" : relevance } : it
    ));
  };

  const relevantCount = recallItems.filter(it => it.relevance === "relevant").length;
  const irrelevantCount = recallItems.filter(it => it.relevance === "irrelevant").length;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2.5 }}>
        <Box>
          <Typography sx={{ fontSize: "18px", fontWeight: 700, color: "#111827" }}>构建结果验证</Typography>
          <Typography sx={{ fontSize: "13px", color: "#94a3b8", mt: 0.25 }}>通过搜索测试验证知识包的召回质量，标注结果相关性</Typography>
        </Box>
      </Box>

      {/* Package info */}
      <Paper sx={{ px: 3, py: 2, mb: 2.5, border: "1px solid #e8eaed", borderRadius: "10px", boxShadow: "none", display: "flex", alignItems: "center", gap: 2 }}>
        <Box sx={{ width: 36, height: 36, borderRadius: "8px", bgcolor: "#f5f3ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <CheckCircle sx={{ fontSize: 18, color: "#7c3aed" }} />
        </Box>
        <Box>
          <Typography sx={{ fontSize: "14px", fontWeight: 600, color: "#111827" }}>{MOCK_PKG.name}</Typography>
          <Typography sx={{ fontSize: "12px", color: "#9ca3af" }}>共 {MOCK_PKG.totalItems} 条知识 · 已启用</Typography>
        </Box>
        <Box sx={{ ml: "auto", display: "flex", gap: 1 }}>
          <Chip label="已启用" size="small" sx={{ height: 22, fontSize: "11px", bgcolor: "#d1fae5", color: "#065f46", border: "none" }} />
        </Box>
      </Paper>

      {/* Tabs */}
      <Box sx={{ borderBottom: "1px solid #e8eaed", mb: 2.5 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}
          sx={{ "& .MuiTab-root": { fontSize: "13px", textTransform: "none", minHeight: 40 }, "& .MuiTabs-indicator": { bgcolor: "#7c3aed" } }}>
          <Tab label="搜索测试" />
          <Tab label={`历史记录 (${history.length})`} icon={<HistoryIcon sx={{ fontSize: 14 }} />} iconPosition="start" />
        </Tabs>
      </Box>

      {/* Search Test Tab */}
      {tab === 0 && (
        <Box>
          {/* Search Box */}
          <Paper sx={{ px: 3, py: 3, mb: 2.5, border: "1px solid #e8eaed", borderRadius: "12px", boxShadow: "none" }}>
            <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#374151", mb: 1.5 }}>输入搜索词进行测试</Typography>
            <Box sx={{ display: "flex", gap: 1.5 }}>
              <TextField
                ref={inputRef}
                fullWidth
                placeholder="请输入用户可能提问的内容，如：理财产品怎么买、开户要什么证件…"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={searching}
                sx={{
                  "& .MuiOutlinedInput-root": { borderRadius: "10px", fontSize: "14px", bgcolor: "#fafafa", "& fieldset": { borderColor: "#e8eaed" }, "&:hover fieldset": { borderColor: "#7c3aed" }, "&.Mui-focused fieldset": { borderColor: "#7c3aed", borderWidth: "1px" } },
                }}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><Search sx={{ fontSize: 20, color: "#9ca3af" }} /></InputAdornment>,
                }}
              />
              <Button variant="contained" onClick={handleSearch} disabled={!query.trim() || searching}
                startIcon={<Send sx={{ fontSize: 16 }} />}
                sx={{ bgcolor: "#7c3aed", borderRadius: "10px", textTransform: "none", fontSize: "14px", px: 3, boxShadow: "none", whiteSpace: "nowrap", "&:hover": { bgcolor: "#6d28d9", boxShadow: "none" } }}>
                {searching ? "召回中…" : "发起测试"}
              </Button>
            </Box>
            <Box sx={{ display: "flex", gap: 0.75, mt: 1.5, flexWrap: "wrap" }}>
              {["理财产品怎么买", "信用卡临时额度", "开户需要什么证件", "净值型理财是什么"].map(tip => (
                <Chip key={tip} label={tip} size="small" onClick={() => { setQuery(tip); }} sx={{ height: 26, fontSize: "12px", cursor: "pointer", bgcolor: "#f5f3ff", color: "#5b21b6", border: "none", "&:hover": { bgcolor: "#ede9fe" } }} />
              ))}
            </Box>
          </Paper>

          {/* Results */}
          {searching && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {[1, 2, 3].map(i => (
                <Paper key={i} sx={{ p: 2.5, border: "1px solid #e8eaed", borderRadius: "10px", boxShadow: "none" }}>
                  <Box sx={{ display: "flex", gap: 2, mb: 1 }}>
                    <Box sx={{ width: 40, height: 18, bgcolor: "#e8eaed", borderRadius: 4 }} />
                    <Box sx={{ flex: 1, height: 18, bgcolor: "#e8eaed", borderRadius: 4 }} />
                  </Box>
                  <Box sx={{ height: 40, bgcolor: "#f5f5f5", borderRadius: 4 }} />
                </Paper>
              ))}
            </Box>
          )}

          {hasSearched && !searching && (
            <Box>
              {/* Result summary */}
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
                <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#374151" }}>
                  召回结果 <span style={{ color: "#9ca3af", fontWeight: 400 }}>({recallItems.length} 条)</span>
                </Typography>
                {(relevantCount + irrelevantCount) > 0 && (
                  <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
                    <Typography sx={{ fontSize: "12px", color: "#15803d" }}>✓ 相关 {relevantCount}</Typography>
                    <Typography sx={{ fontSize: "12px", color: "#ef4444" }}>✗ 不相关 {irrelevantCount}</Typography>
                    <Typography sx={{ fontSize: "12px", color: "#9ca3af" }}>精准率 {recallItems.length > 0 ? Math.round(relevantCount / (relevantCount + irrelevantCount || 1) * 100) : 0}%</Typography>
                  </Box>
                )}
              </Box>

              {recallItems.length === 0 ? (
                <Paper sx={{ py: 8, border: "1px solid #e8eaed", borderRadius: "10px", boxShadow: "none", textAlign: "center" }}>
                  <Search sx={{ fontSize: 40, color: "#e8eaed", mb: 1 }} />
                  <Typography sx={{ fontSize: "14px", color: "#9ca3af" }}>未召回任何结果，请尝试其他搜索词</Typography>
                </Paper>
              ) : (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                  {recallItems.map((item, i) => {
                    const tm = TYPE_META[item.type];
                    return (
                      <Paper key={item.id} sx={{ p: 2.5, border: `1px solid ${item.relevance === "relevant" ? "#bbf7d0" : item.relevance === "irrelevant" ? "#fecaca" : "#e8eaed"}`, borderRadius: "10px", boxShadow: "none", transition: "all 0.15s" }}>
                        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
                          {/* Rank */}
                          <Box sx={{ width: 28, height: 28, borderRadius: "50%", bgcolor: i < 3 ? "#f5f3ff" : "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <Typography sx={{ fontSize: "12px", fontWeight: 700, color: i < 3 ? "#7c3aed" : "#94a3b8" }}>{i + 1}</Typography>
                          </Box>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                              <Chip label={tm.label} size="small" icon={<span style={{ color: tm.color, display: "flex" }}>{tm.icon}</span>}
                                sx={{ height: 22, fontSize: "11px", bgcolor: tm.bg, color: tm.color, border: "none" }} />
                              <Chip label={item.category} size="small" sx={{ height: 22, fontSize: "11px", bgcolor: "#f1f5f9", color: "#475569", border: "none" }} />
                              {item.score != null && (
                                <Typography sx={{ fontSize: "11px", color: "#9ca3af", ml: "auto" }}>相关度 {(item.score * 100).toFixed(0)}%</Typography>
                              )}
                            </Box>
                            <Typography sx={{ fontSize: "13px", color: "#111827", lineHeight: 1.7, mb: 1 }}>{item.content}</Typography>
                            {item.sourceDoc && <Typography sx={{ fontSize: "11px", color: "#9ca3af" }}>来源：{item.sourceDoc}</Typography>}
                          </Box>
                          {/* Relevance buttons */}
                          <Box sx={{ display: "flex", gap: 0.5, flexShrink: 0 }}>
                            <Tooltip title="标注相关" arrow>
                              <IconButton size="small" onClick={() => toggleRelevance(item.id, "relevant")}
                                sx={{ width: 30, height: 30, borderRadius: "6px", bgcolor: item.relevance === "relevant" ? "#d1fae5" : "transparent", color: item.relevance === "relevant" ? "#10b981" : "#d1d5db", "&:hover": { bgcolor: "#d1fae5", color: "#10b981" } }}>
                                <ThumbUp sx={{ fontSize: 15 }} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="标注不相关" arrow>
                              <IconButton size="small" onClick={() => toggleRelevance(item.id, "irrelevant")}
                                sx={{ width: 30, height: 30, borderRadius: "6px", bgcolor: item.relevance === "irrelevant" ? "#fee2e2" : "transparent", color: item.relevance === "irrelevant" ? "#ef4444" : "#d1d5db", "&:hover": { bgcolor: "#fee2e2", color: "#ef4444" } }}>
                                <ThumbDown sx={{ fontSize: 15 }} />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </Box>
                      </Paper>
                    );
                  })}
                </Box>
              )}
            </Box>
          )}

          {!hasSearched && !searching && (
            <Paper sx={{ py: 10, border: "2px dashed #e8eaed", borderRadius: "12px", boxShadow: "none", textAlign: "center" }}>
              <Search sx={{ fontSize: 48, color: "#e8eaed", mb: 1.5 }} />
              <Typography sx={{ fontSize: "14px", color: "#9ca3af", mb: 0.5 }}>在上方输入搜索词，测试知识包的召回效果</Typography>
              <Typography sx={{ fontSize: "12px", color: "#d1d5db" }}>支持自然语言查询，结果实时展示</Typography>
            </Paper>
          )}
        </Box>
      )}

      {/* History Tab */}
      {tab === 1 && (
        <Box>
          {history.length === 0 ? (
            <Paper sx={{ py: 8, border: "1px solid #e8eaed", borderRadius: "10px", boxShadow: "none", textAlign: "center" }}>
              <HistoryIcon sx={{ fontSize: 40, color: "#e8eaed", mb: 1 }} />
              <Typography sx={{ fontSize: "14px", color: "#9ca3af" }}>暂无历史测试记录</Typography>
            </Paper>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {history.map(record => {
                const relevant = record.recallItems.filter(it => it.relevance === "relevant").length;
                return (
                  <Paper key={record.id} sx={{ p: 2.5, border: "1px solid #e8eaed", borderRadius: "10px", boxShadow: "none" }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1.5 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <Search sx={{ fontSize: 16, color: "#7c3aed" }} />
                        <Typography sx={{ fontSize: "14px", fontWeight: 600, color: "#111827" }}>"{record.query}"</Typography>
                      </Box>
                      <Typography sx={{ fontSize: "11px", color: "#9ca3af" }}>{record.time}</Typography>
                    </Box>
                    <Box sx={{ display: "flex", gap: 1.5, alignItems: "center", mb: 1 }}>
                      <Typography sx={{ fontSize: "12px", color: "#6b7280" }}>召回 {record.recallItems.length} 条</Typography>
                      {relevant > 0 && <Typography sx={{ fontSize: "12px", color: "#15803d" }}>相关 {relevant} 条</Typography>}
                    </Box>
                    {record.recallItems.slice(0, 2).map(it => {
                      const tm = TYPE_META[it.type];
                      return (
                        <Box key={it.id} sx={{ display: "flex", gap: 1, mb: 0.75, p: 1.5, bgcolor: "#f8f9fb", borderRadius: "8px" }}>
                          <Chip label={tm.label} size="small" sx={{ height: 18, fontSize: "10px", bgcolor: tm.bg, color: tm.color, border: "none", flexShrink: 0, "& .MuiChip-label": { px: 0.75 } }} />
                          <Typography sx={{ fontSize: "12px", color: "#374151", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{it.content.slice(0, 80)}…</Typography>
                        </Box>
                      );
                    })}
                    {record.recallItems.length > 2 && (
                      <Typography sx={{ fontSize: "11px", color: "#9ca3af", mt: 0.5 }}>…还有 {record.recallItems.length - 2} 条</Typography>
                    )}
                    <Box sx={{ mt: 1.5, pt: 1.5, borderTop: "1px solid #f0f0f0" }}>
                      <Button size="small" onClick={() => { setQuery(record.query); setTab(0); setTimeout(() => handleSearch(), 100); }}
                        sx={{ textTransform: "none", fontSize: "12px", color: "#7c3aed", px: 1.5, borderRadius: "6px", "&:hover": { bgcolor: "#f5f3ff" } }}>
                        重新测试
                      </Button>
                    </Box>
                  </Paper>
                );
              })}
            </Box>
          )}
        </Box>
      )}

      <Snackbar open={toast.open} autoHideDuration={3000} onClose={() => setToast(t => ({ ...t, open: false }))} anchorOrigin={{ vertical: "top", horizontal: "center" }}>
        <Alert severity={toast.sev} onClose={() => setToast(t => ({ ...t, open: false }))} sx={{ borderRadius: "8px", fontSize: "13px" }}>{toast.msg}</Alert>
      </Snackbar>
    </Box>
  );
}
