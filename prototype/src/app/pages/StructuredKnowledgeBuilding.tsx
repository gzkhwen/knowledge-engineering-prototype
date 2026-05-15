import { useState, useMemo } from "react";
import { useOutletContext } from "react-router";
import {
  Box, Typography, Button, Chip, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Dialog, DialogTitle, DialogContent, DialogActions,
  IconButton, Paper, Alert, TextField, Checkbox, Tooltip, Divider, Snackbar,
  LinearProgress, FormControl, InputLabel, Select, MenuItem, Tabs, Tab, Grid,
} from "@mui/material";
import {
  Add, Edit, Delete, AutoAwesome, CheckCircle, PowerSettingsNew, QuestionAnswer,
  Translate, Close, PlayArrow, Source, AccessTime, Create, Tag, Visibility,
} from "@mui/icons-material";
import { Project } from "../types";

type FormType = "qa" | "term";
type ItemStatus = "enabled" | "disabled";
type CreateMethod = "ai" | "manual";

interface QAItem { id: string; type: "qa"; question: string; answer: string; similarQuestions: string[]; sourceDoc?: string; category: string; status: ItemStatus; method: CreateMethod; createdAt: string; updatedAt: string; }
interface TermItem { id: string; type: "term"; term: string; definition: string; aliases: string[]; sourceDoc?: string; category: string; status: ItemStatus; method: CreateMethod; createdAt: string; updatedAt: string; }
type KItem = QAItem | TermItem;

const INIT_ITEMS: KItem[] = [
  { id: "q1", type: "qa", question: "理财产品的申购起点金额是多少？", answer: "本行理财产品最低申购金额为 1 万元人民币，部分高端产品起点为 10 万元或 100 万元，具体以产品说明书为准。低于起点金额的申购申请将被系统自动拒绝。", similarQuestions: ["理财起购金额", "理财最少买多少", "购买理财的门槛"], sourceDoc: "产品FAQ汇总2024.xlsx", category: "产品知识 > 理财产品", status: "enabled", method: "ai", createdAt: "2026-03-19 14:30", updatedAt: "2026-03-19 14:30" },
  { id: "q2", type: "qa", question: "信用卡额度如何申请临时提升？", answer: "您可通过以下方式申请临时额度提升：① 手机银行 App → 信用卡 → 额度管理 → 申请临时额度；② 拨打客服热线 400-xxx-xxxx；③ 到访网点柜台申请。临时额度有效期为 7–30 天，到期自动恢复。", similarQuestions: ["信用卡临时额度", "提升信用额度", "信用卡额度不够怎么办"], sourceDoc: "产品FAQ汇总2024.xlsx", category: "产品知识 > 信用卡产品", status: "enabled", method: "ai", createdAt: "2026-03-19 14:35", updatedAt: "2026-03-19 14:35" },
  { id: "q3", type: "qa", question: "开户需要携带哪些材料？", answer: "个人客户开户需携带：① 本人有效身份证原件（身份证、护照或港澳通行证）；② 本人手机号（用于验证码认证）；③ 初始存款（活期账户无最低要求）。企业客户另需提供营业执照、法人授权书等材料，请提前致电预约。", similarQuestions: ["开户所需证件", "开银行卡要什么材料", "开账户流程"], category: "业务流程 > 开户流程", status: "enabled", method: "manual", createdAt: "2026-03-20 09:15", updatedAt: "2026-03-20 10:02" },
  { id: "q4", type: "qa", question: "网上银行密码忘记如何重置？", answer: "重置网上银行密码有以下三种方式：① 手机银行 App → 安全中心 → 忘记密码 → 人脸识别验证后重置；② 拨打 400 客服热线，通过语音验证重置；③ 携带身份证到任一网点柜台办理。重置后新密码须包含大小写字母和数字，长度 8–16 位。", similarQuestions: ["忘记密码怎么办", "密码重置流程"], sourceDoc: "产品FAQ汇总2024.xlsx", category: "产品知识 > 信用卡产品", status: "disabled", method: "ai", createdAt: "2026-03-19 15:00", updatedAt: "2026-03-21 11:30" },
  { id: "q5", type: "qa", question: "理财产品到期后资金如何处理？", answer: "理财产品到期后，本金及收益将在到期日 T+1 个工作日自动划转至您的关联银行卡账户。如您开通了自动续期服务，系统将自动按原期限续期，届时您将收到短信通知。", similarQuestions: ["理财到期了怎么办", "理财资金到账时间"], sourceDoc: "金融产品使用手册.md", category: "产品知识 > 理财产品", status: "enabled", method: "ai", createdAt: "2026-03-20 14:20", updatedAt: "2026-03-20 14:20" },
  { id: "t1", type: "term", term: "净值型理财", definition: "净值型理财产品是指以基金净值方式运作、定期或不定期披露净值的理财产品。其收益随市场波动，无预期收益或保本承诺，投资者需自行承担投资风险。区别于预期收益型产品，净值型产品更加透明，但收益不确定性更高。", aliases: ["净值类理财", "开放式净值理财", "浮动净值产品"], sourceDoc: "金融产品使用手册.md", category: "产品知识 > 理财产品", status: "enabled", method: "ai", createdAt: "2026-03-19 14:32", updatedAt: "2026-03-19 14:32" },
  { id: "t2", type: "term", term: "临时额度", definition: "临时额度是银行在持卡人本人信用额度基础上，根据特定需求（如节假日消费、大额医疗支出等）临时授予的短期使用额度。有效期通常为 7–30 天，到期后自动失效并恢复原有固定额度。临时额度不影响持卡人的长期信用记录，也不计入年化利率计算基数。", aliases: ["临额", "短期额度", "临时信用额度"], sourceDoc: "产品FAQ汇总2024.xlsx", category: "产品知识 > 信用卡产品", status: "enabled", method: "ai", createdAt: "2026-03-19 14:38", updatedAt: "2026-03-19 14:38" },
  { id: "t3", type: "term", term: "风险承受能力", definition: "风险承受能力是指投资者在进行金融投资时，能够承受投资损失的心理和经济能力综合评估结果。通常分为保守型（R1）、稳健型（R2）、平衡型（R3）、积极型（R4）和激进型（R5）五个等级，各等级对应不同风险等级的可投产品范围。评估结果有效期为 1 年，到期需重新评测。", aliases: ["风险等级", "风险偏好", "投资风险等级"], category: "产品知识 > 理财产品", status: "enabled", method: "manual", createdAt: "2026-03-20 10:00", updatedAt: "2026-03-20 10:00" },
  { id: "t4", type: "term", term: "账单日", definition: "账单日（也称结账日）是银行每月固定对信用卡账户进行结算的日期。在账单日，银行统计自上一账单日次日至本账单日期间的所有消费、还款及调整记录，生成当期账单并发送给持卡人。账单日通常固定（如每月 10 日），部分银行支持申请修改。", aliases: ["结账日", "账单生成日"], sourceDoc: "金融产品使用手册.md", category: "产品知识 > 信用卡产品", status: "enabled", method: "ai", createdAt: "2026-03-20 14:25", updatedAt: "2026-03-20 14:25" },
];

const MOCK_DOCS = ["金融产品使用手册.md", "产品FAQ汇总2024.xlsx", "理财业务规范v3.txt", "知识库建设标准_v2.txt"];
const CATS_QA  = ["产品知识 > 理财产品", "产品知识 > 信用卡产品", "业务流程 > 开户流程"];
const CATS_TERM = ["产品知识 > 理财产品", "产品知识 > 信用卡产品", "风控规则"];

const fmtTime = (s: string) => s;

export function StructuredKnowledgeBuilding() {
  const { project } = useOutletContext<{ project: Project }>();
  const key = `structItems_${project.id}`;
  const [items, setItems] = useState<KItem[]>(() => {
    try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : INIT_ITEMS; } catch { return INIT_ITEMS; }
  });
  const save = (d: KItem[]) => { setItems(d); localStorage.setItem(key, JSON.stringify(d)); };

  // Step 1: form type selection. Step 2: category selection
  const [selFormType, setSelFormType] = useState<FormType | null>(null);
  const [selCategory, setSelCategory] = useState<string>("");

  const [filterStatus, setFilterStatus] = useState<"all" | "enabled" | "disabled">("all");
  const [filterQ, setFilterQ] = useState("");

  const [editOpen, setEditOpen] = useState(false);
  const [editItem, setEditItem] = useState<KItem | null>(null);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiDocs, setAiDocs] = useState<string[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiDrafts, setAiDrafts] = useState<KItem[]>([]);
  const [aiDraftSel, setAiDraftSel] = useState<Set<string>>(new Set());
  const [detailItem, setDetailItem] = useState<KItem | null>(null);
  const [detailTab, setDetailTab] = useState(0);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const [fQ, setFQ] = useState(""); const [fA, setFA] = useState(""); const [fSim, setFSim] = useState("");
  const [fTerm, setFTerm] = useState(""); const [fDef, setFDef] = useState(""); const [fAlias, setFAlias] = useState("");
  const [fCat, setFCat] = useState(""); const [fDoc, setFDoc] = useState("");

  const [toast, setToast] = useState({ open: false, msg: "", sev: "success" as "success" | "error" | "warning" });
  const showToast = (msg: string, sev: "success" | "error" | "warning" = "success") => setToast({ open: true, msg, sev });

  const availableCats = selFormType === "qa" ? CATS_QA : selFormType === "term" ? CATS_TERM : [];

  const filtered = useMemo(() => {
    if (!selFormType) return [];
    return items.filter(it => {
      if (it.type !== selFormType) return false;
      if (selCategory && it.category !== selCategory) return false;
      if (filterStatus !== "all" && it.status !== filterStatus) return false;
      if (filterQ) {
        const q = filterQ.toLowerCase();
        if (it.type === "qa") return it.question.toLowerCase().includes(q) || it.answer.toLowerCase().includes(q);
        return it.term.toLowerCase().includes(q) || it.definition.toLowerCase().includes(q);
      }
      return true;
    });
  }, [items, selFormType, selCategory, filterStatus, filterQ]);

  const stats = useMemo(() => ({
    qa: items.filter(i => i.type === "qa").length, qaEn: items.filter(i => i.type === "qa" && i.status === "enabled").length,
    term: items.filter(i => i.type === "term").length, termEn: items.filter(i => i.type === "term" && i.status === "enabled").length,
  }), [items]);

  const toggleStatus = (id: string) => {
    save(items.map(it => it.id === id ? { ...it, status: it.status === "enabled" ? "disabled" : "enabled" } as KItem : it));
    if (detailItem?.id === id) setDetailItem(prev => prev ? { ...prev, status: prev.status === "enabled" ? "disabled" : "enabled" } as KItem : prev);
    showToast("状态已切换");
  };

  const doDelete = (id: string) => { save(items.filter(it => it.id !== id)); setDeleteConfirm(null); showToast("已删除"); };

  const openEdit = (item?: KItem) => {
    setEditItem(item ?? null);
    if (item) {
      if (item.type === "qa") { setFQ(item.question); setFA(item.answer); setFSim(item.similarQuestions.join("；")); setFDoc(item.sourceDoc ?? ""); setFCat(item.category); }
      else { setFTerm(item.term); setFDef(item.definition); setFAlias(item.aliases.join("；")); setFDoc(item.sourceDoc ?? ""); setFCat(item.category); }
    } else {
      setFQ(""); setFA(""); setFSim(""); setFTerm(""); setFDef(""); setFAlias(""); setFDoc("");
      setFCat(selCategory || (selFormType === "qa" ? CATS_QA[0] : CATS_TERM[0]));
    }
    setEditOpen(true);
  };

  const saveEdit = () => {
    const now = new Date().toLocaleString("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }).replace(/\//g, "-");
    if (selFormType === "qa" && (!fQ.trim() || !fA.trim())) { showToast("主问题和标准答案不能为空", "error"); return; }
    if (selFormType === "term" && (!fTerm.trim() || !fDef.trim())) { showToast("术语名称和释义不能为空", "error"); return; }
    if (editItem) {
      save(items.map(it => {
        if (it.id !== editItem.id) return it;
        if (it.type === "qa") return { ...it, question: fQ.trim(), answer: fA.trim(), similarQuestions: fSim ? fSim.split("；").map(s => s.trim()).filter(Boolean) : [], sourceDoc: fDoc || undefined, category: fCat, updatedAt: now };
        return { ...it, term: fTerm.trim(), definition: fDef.trim(), aliases: fAlias ? fAlias.split("；").map(s => s.trim()).filter(Boolean) : [], sourceDoc: fDoc || undefined, category: fCat, updatedAt: now };
      }));
      showToast("修改已保存");
    } else {
      const base = { id: `k_${Date.now()}`, status: "enabled" as ItemStatus, method: "manual" as CreateMethod, category: fCat, sourceDoc: fDoc || undefined, createdAt: now, updatedAt: now };
      const newIt: KItem = selFormType === "qa"
        ? { ...base, type: "qa", question: fQ.trim(), answer: fA.trim(), similarQuestions: fSim ? fSim.split("；").map(s => s.trim()).filter(Boolean) : [] }
        : { ...base, type: "term", term: fTerm.trim(), definition: fDef.trim(), aliases: fAlias ? fAlias.split("；").map(s => s.trim()).filter(Boolean) : [] };
      save([...items, newIt]);
      showToast("知识对象已创建");
    }
    setEditOpen(false);
  };

  const startAI = async () => {
    if (!aiDocs.length) { showToast("请至少选择一份标准化文档", "warning"); return; }
    setAiLoading(true);
    await new Promise(r => setTimeout(r, 2000));
    const cat = selCategory || (selFormType === "qa" ? CATS_QA[0] : CATS_TERM[0]);
    const now = new Date().toLocaleString("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }).replace(/\//g, "-");
    const base = { status: "disabled" as ItemStatus, method: "ai" as CreateMethod, category: cat, sourceDoc: aiDocs[0], createdAt: now, updatedAt: now };
    const drafts: KItem[] = selFormType === "qa"
      ? [
        { ...base, id: `ai_q_1_${Date.now()}`, type: "qa", question: "理财产品提前赎回是否有手续费？", answer: "封闭式理财产品不支持提前赎回；开放式净值型产品可在开放日赎回，无手续费，赎回资金 T+1 到账，持有不足 7 天的部分不享受免息优惠。", similarQuestions: ["提前取出理财", "理财可以提前退出吗"] },
        { ...base, id: `ai_q_2_${Date.now()}`, type: "qa", question: "信用卡账单日与还款日之间的关系？", answer: "账单日为银行生成账单的固定日期（如每月 10 日），还款日通常为账单日后第 20 天。在还款日前全额还款可享受完整免息期（约 20–50 天），仅还最低还款额则需支付未还部分的日息 0.05%。", similarQuestions: ["账单日和还款日区别", "信用卡还款截止日期"] },
        { ...base, id: `ai_q_3_${Date.now()}`, type: "qa", question: "如何查看理财产品的持仓收益？", answer: "您可通过以下方式查看持仓收益：① 手机银行 App → 理财 → 我的持仓；② 网上银行 → 理财中心 → 持仓明细；③ 到网点柜台查询。持仓收益每日更新，净值型产品收益以最新净值为准。", similarQuestions: ["查理财收益", "查持仓"] },
      ]
      : [
        { ...base, id: `ai_t_1_${Date.now()}`, type: "term", term: "开放日", definition: "开放日是指开放式基金或净值型理财产品允许投资者申购、赎回份额的特定交易日，通常为每周一至周五的工作日，法定节假日顺延，时间一般为 9:00–15:00。", aliases: ["申赎日", "交易日", "开放申赎日"] },
        { ...base, id: `ai_t_2_${Date.now()}`, type: "term", term: "封闭期", definition: "封闭期指理财产品从申购成功至产品到期的整个存续期间。在封闭期内，投资者无法对本金进行申购或赎回操作，资金被锁定，产品将按既定策略运作至到期日。", aliases: ["锁定期", "存续期"] },
      ];
    setAiDrafts(drafts); setAiLoading(false); setAiDraftSel(new Set());
  };

  const confirmDrafts = () => {
    const toAdd = aiDrafts.filter(d => aiDraftSel.has(d.id)).map(d => ({ ...d, status: "enabled" as ItemStatus }));
    save([...items, ...toAdd]); setAiOpen(false); setAiDrafts([]); setAiDraftSel(new Set());
    showToast(`已确认 ${toAdd.length} 条 AI 抽取结果`);
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2.5 }}>
        <Box>
          <Typography sx={{ fontSize: "18px", fontWeight: 700, color: "#111827" }}>结构化知识构建</Typography>
          <Typography sx={{ fontSize: "13px", color: "#94a3b8", mt: 0.25 }}>构建问答库与术语知识对象，支持 AI 辅助抽取和人工创建</Typography>
        </Box>
        {selFormType && (
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button variant="outlined" startIcon={<AutoAwesome sx={{ fontSize: 14 }} />} onClick={() => { setAiDocs([]); setAiDrafts([]); setAiOpen(true); }}
              sx={{ borderColor: "#7c3aed", color: "#5b21b6", borderRadius: "8px", textTransform: "none", fontSize: "13px", px: 2, "&:hover": { bgcolor: "#f5f3ff" } }}>
              AI 辅助抽取
            </Button>
            <Button variant="contained" startIcon={<Add sx={{ fontSize: 14 }} />} onClick={() => openEdit()}
              sx={{ bgcolor: "#7c3aed", borderRadius: "8px", textTransform: "none", fontSize: "13px", px: 2, boxShadow: "none", "&:hover": { bgcolor: "#6d28d9", boxShadow: "none" } }}>
              手动新建
            </Button>
          </Box>
        )}
      </Box>

      {/* Step 1: Form type selection */}
      <Paper sx={{ border: "1px solid #e8eaed", borderRadius: "10px", boxShadow: "none", p: 2.5, mb: 2 }}>
        <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "#374151", mb: 1.5 }}>第一步：选择知识形态</Typography>
        <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
          {([
            { type: "qa" as FormType, label: "问答库", sub: `${stats.qa} 条 · ${stats.qaEn} 启用`, icon: <QuestionAnswer sx={{ fontSize: 22 }} />, color: "#1d4ed8", bg: "#eff6ff", border: "#bfdbfe" },
            { type: "term" as FormType, label: "术语", sub: `${stats.term} 条 · ${stats.termEn} 启用`, icon: <Translate sx={{ fontSize: 22 }} />, color: "#5b21b6", bg: "#f5f3ff", border: "#ddd6fe" },
          ]).map(opt => (
            <Box key={opt.type} onClick={() => { setSelFormType(opt.type); setSelCategory(""); }}
              sx={{
                flex: 1, minWidth: 180, p: 2, borderRadius: "10px", cursor: "pointer",
                border: `2px solid ${selFormType === opt.type ? opt.color : "#e8eaed"}`,
                bgcolor: selFormType === opt.type ? opt.bg : "#fff",
                transition: "all 0.15s", "&:hover": { border: `2px solid ${opt.color}`, bgcolor: opt.bg },
              }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Box sx={{ color: opt.color }}>{opt.icon}</Box>
                <Box>
                  <Typography sx={{ fontSize: "14px", fontWeight: 600, color: "#111827" }}>{opt.label}</Typography>
                  <Typography sx={{ fontSize: "12px", color: "#9ca3af" }}>{opt.sub}</Typography>
                </Box>
                {selFormType === opt.type && <CheckCircle sx={{ ml: "auto", fontSize: 18, color: opt.color }} />}
              </Box>
            </Box>
          ))}
        </Box>
      </Paper>

      {/* Step 2: Category selection */}
      {selFormType && (
        <Paper sx={{ border: "1px solid #e8eaed", borderRadius: "10px", boxShadow: "none", p: 2.5, mb: 2 }}>
          <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "#374151", mb: 1.5 }}>第二步：选择知识类目</Typography>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Chip label="全部类目" onClick={() => setSelCategory("")}
              sx={{ borderRadius: "8px", cursor: "pointer", bgcolor: !selCategory ? "#7c3aed" : "#f1f5f9", color: !selCategory ? "#fff" : "#475569", border: "none", fontWeight: !selCategory ? 600 : 400, fontSize: "12px", height: 32 }} />
            {availableCats.map(cat => (
              <Chip key={cat} label={cat} onClick={() => setSelCategory(cat)}
                sx={{ borderRadius: "8px", cursor: "pointer", bgcolor: selCategory === cat ? "#7c3aed" : "#f1f5f9", color: selCategory === cat ? "#fff" : "#475569", border: "none", fontWeight: selCategory === cat ? 600 : 400, fontSize: "12px", height: 32 }} />
            ))}
          </Box>
        </Paper>
      )}

      {/* Results list */}
      {selFormType && (
        <Paper sx={{ border: "1px solid #e8eaed", borderRadius: "10px", boxShadow: "none", overflow: "hidden" }}>
          {/* Filter bar */}
          <Box sx={{ display: "flex", gap: 1.5, px: 2, py: 1.5, borderBottom: "1px solid #f0f0f0", bgcolor: "#fafafa", flexWrap: "wrap", alignItems: "center" }}>
            <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#374151" }}>
              {selFormType === "qa" ? "问答库" : "术语"}
              {selCategory && <span style={{ color: "#9ca3af", fontWeight: 400 }}> · {selCategory}</span>}
              <span style={{ color: "#9ca3af", fontWeight: 400 }}> ({filtered.length})</span>
            </Typography>
            <Box sx={{ flex: 1 }} />
            <FormControl size="small" sx={{ minWidth: 100 }}>
              <Select value={filterStatus} onChange={e => setFilterStatus(e.target.value as any)} displayEmpty
                sx={{ borderRadius: "8px", fontSize: "12px", "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e8eaed" }, "& .MuiSelect-select": { py: 0.625 } }}>
                <MenuItem value="all" sx={{ fontSize: "12px" }}>全部状态</MenuItem>
                <MenuItem value="enabled" sx={{ fontSize: "12px" }}>已启用</MenuItem>
                <MenuItem value="disabled" sx={{ fontSize: "12px" }}>已停用</MenuItem>
              </Select>
            </FormControl>
            <TextField size="small" placeholder="关键字搜索" value={filterQ} onChange={e => setFilterQ(e.target.value)}
              sx={{ width: 160, "& .MuiOutlinedInput-root": { borderRadius: "8px", fontSize: "12px" }, "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e8eaed" } }} />
          </Box>

          {filtered.length === 0 ? (
            <Box sx={{ py: 12, textAlign: "center" }}>
              <Typography sx={{ fontSize: "14px", color: "#9ca3af" }}>
                {selCategory ? `「${selCategory}」下暂无${selFormType === "qa" ? "问答对" : "术语"}` : `暂无${selFormType === "qa" ? "问答对" : "术语"}，可通过 AI 抽取或手动创建`}
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: "#f8f9fb" }}>
                    {(selFormType === "qa"
                      ? ["主问题", "标准答案", "相似问题", "知识类目", "来源", "创建方式", "状态", "操作"]
                      : ["术语名称（首选词）", "释义", "别名 / 同义词", "知识类目", "来源", "创建方式", "状态", "操作"]
                    ).map(h => (
                      <TableCell key={h} sx={{ fontSize: "12px", fontWeight: 600, color: "#6b7280", py: 1.5, borderBottom: "1px solid #f0f0f0", whiteSpace: "nowrap" }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtered.map((item, i) => (
                    <TableRow key={item.id} sx={{ bgcolor: i % 2 === 0 ? "#fff" : "#fafafa", "&:hover": { bgcolor: "#faf5ff" }, "& td": { borderBottom: "1px solid #f5f5f5" } }}>
                      {item.type === "qa" ? <>
                        <TableCell sx={{ py: 1.5, maxWidth: 200 }}>
                          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 0.75 }}>
                            <QuestionAnswer sx={{ fontSize: 14, color: "#7c3aed", mt: "2px", flexShrink: 0 }} />
                            <Typography sx={{ fontSize: "13px", color: "#111827", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{item.question}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ maxWidth: 200 }}><Typography sx={{ fontSize: "12px", color: "#374151", overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", lineHeight: 1.6 }}>{item.answer}</Typography></TableCell>
                        <TableCell><Typography sx={{ fontSize: "11px", color: "#9ca3af" }}>{item.similarQuestions.length > 0 ? `${item.similarQuestions.length} 条` : "—"}</Typography></TableCell>
                      </> : <>
                        <TableCell sx={{ py: 1.5 }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                            <Translate sx={{ fontSize: 14, color: "#7c3aed" }} />
                            <Typography sx={{ fontSize: "13px", color: "#111827", fontWeight: 600 }}>{item.term}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ maxWidth: 220 }}><Typography sx={{ fontSize: "12px", color: "#374151", overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", lineHeight: 1.6 }}>{item.definition}</Typography></TableCell>
                        <TableCell>
                          {item.aliases.length > 0
                            ? <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>{item.aliases.slice(0, 2).map(a => <Chip key={a} label={a} size="small" sx={{ height: 18, fontSize: "10px", bgcolor: "#f1f5f9", color: "#475569", border: "none", "& .MuiChip-label": { px: 0.5 } }} />)}{item.aliases.length > 2 && <Chip label={`+${item.aliases.length - 2}`} size="small" sx={{ height: 18, fontSize: "10px", bgcolor: "#f1f5f9", color: "#9ca3af", border: "none", "& .MuiChip-label": { px: 0.5 } }} />}</Box>
                            : <Typography sx={{ fontSize: "11px", color: "#d1d5db" }}>—</Typography>}
                        </TableCell>
                      </>}
                      <TableCell><Typography sx={{ fontSize: "11px", color: "#6b7280" }}>{item.category}</Typography></TableCell>
                      <TableCell><Typography sx={{ fontSize: "11px", color: "#9ca3af", maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.sourceDoc ?? "手动创建"}</Typography></TableCell>
                      <TableCell>
                        <Chip label={item.method === "ai" ? "AI 抽取" : "人工"} size="small"
                          sx={{ height: 20, fontSize: "11px", bgcolor: item.method === "ai" ? "#f5f3ff" : "#f0fdf4", color: item.method === "ai" ? "#5b21b6" : "#15803d", border: "none", "& .MuiChip-label": { px: 0.75 } }} />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                          <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: item.status === "enabled" ? "#4ade80" : "#d1d5db" }} />
                          <Typography sx={{ fontSize: "12px", color: item.status === "enabled" ? "#15803d" : "#6b7280", fontWeight: 500 }}>{item.status === "enabled" ? "启用" : "停用"}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", gap: 0.5 }}>
                          <Tooltip title="查看详情" arrow><IconButton size="small" onClick={() => { setDetailItem(item); setDetailTab(0); }} sx={{ width: 28, height: 28, borderRadius: "6px", color: "#9ca3af", "&:hover": { color: "#7c3aed", bgcolor: "#f5f3ff" } }}><Visibility sx={{ fontSize: 15 }} /></IconButton></Tooltip>
                          <Tooltip title="编辑" arrow><IconButton size="small" onClick={() => openEdit(item)} sx={{ width: 28, height: 28, borderRadius: "6px", color: "#9ca3af", "&:hover": { color: "#374151", bgcolor: "#f9fafb" } }}><Edit sx={{ fontSize: 15 }} /></IconButton></Tooltip>
                          <Tooltip title={item.status === "enabled" ? "停用" : "启用"} arrow><IconButton size="small" onClick={() => toggleStatus(item.id)} sx={{ width: 28, height: 28, borderRadius: "6px", color: item.status === "enabled" ? "#9ca3af" : "#10b981", "&:hover": { color: item.status === "enabled" ? "#f59e0b" : "#059669", bgcolor: item.status === "enabled" ? "#fef3c7" : "#f0fdf4" } }}><PowerSettingsNew sx={{ fontSize: 15 }} /></IconButton></Tooltip>
                          <Tooltip title="删除" arrow><IconButton size="small" onClick={() => setDeleteConfirm(item.id)} sx={{ width: 28, height: 28, borderRadius: "6px", color: "#9ca3af", "&:hover": { color: "#ef4444", bgcolor: "#fef2f2" } }}><Delete sx={{ fontSize: 15 }} /></IconButton></Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          <Box sx={{ px: 2.5, py: 1.25, borderTop: "1px solid #f5f5f5", bgcolor: "#fafafa" }}>
            <Typography sx={{ fontSize: "12px", color: "#9ca3af" }}>共 {filtered.length} 条</Typography>
          </Box>
        </Paper>
      )}

      {!selFormType && (
        <Paper sx={{ border: "2px dashed #e8eaed", borderRadius: "10px", boxShadow: "none", py: 12, textAlign: "center" }}>
          <Typography sx={{ fontSize: "14px", color: "#9ca3af" }}>请先选择知识形态，再选择知识类目，然后开始构建</Typography>
        </Paper>
      )}

      {/* Detail dialog - rich like the screenshot */}
      <Dialog open={!!detailItem} onClose={() => setDetailItem(null)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: "14px", boxShadow: "0 24px 60px rgba(0,0,0,0.15)" } }}>
        {detailItem && (
          <>
            <Box sx={{ px: 3, pt: 2.5, pb: 0 }}>
              <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 1.5 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
                  <Box sx={{ color: "#7c3aed" }}>{detailItem.type === "qa" ? <QuestionAnswer sx={{ fontSize: 20 }} /> : <Translate sx={{ fontSize: 20 }} />}</Box>
                  <Typography sx={{ fontSize: "15px", fontWeight: 700, color: "#111827", maxWidth: 340, overflow: "hidden", textOverflow: "ellipsis" }}>
                    {detailItem.type === "qa" ? detailItem.question : detailItem.term}
                  </Typography>
                </Box>
                <IconButton size="small" onClick={() => setDetailItem(null)} sx={{ color: "#9ca3af" }}><Close sx={{ fontSize: 18 }} /></IconButton>
              </Box>
              <Box sx={{ display: "flex", gap: 0.75, mb: 0 }}>
                <Chip label={detailItem.type === "qa" ? "问答库" : "术语"} size="small" sx={{ height: 22, fontSize: "11px", bgcolor: "#f5f3ff", color: "#5b21b6", border: "none", "& .MuiChip-label": { px: 0.75 } }} />
                <Chip label={detailItem.status === "enabled" ? "启用" : "停用"} size="small" sx={{ height: 22, fontSize: "11px", bgcolor: detailItem.status === "enabled" ? "#f0fdf4" : "#f9fafb", color: detailItem.status === "enabled" ? "#15803d" : "#6b7280", border: "none", "& .MuiChip-label": { px: 0.75 } }} />
                <Chip label={detailItem.method === "ai" ? "AI 抽取" : "人工"} size="small" sx={{ height: 22, fontSize: "11px", bgcolor: "#fef3c7", color: "#92400e", border: "none", "& .MuiChip-label": { px: 0.75 } }} />
              </Box>
              <Tabs value={detailTab} onChange={(_, v) => setDetailTab(v)}
                sx={{ mt: 1.5, "& .MuiTab-root": { fontSize: "13px", textTransform: "none", minHeight: 40, px: 0, mr: 3 }, "& .MuiTabs-indicator": { bgcolor: "#7c3aed" } }}>
                <Tab label={detailItem.type === "qa" ? "问答内容" : "术语内容"} />
                <Tab label="来源追溯" />
              </Tabs>
            </Box>
            <Divider sx={{ borderColor: "#f3f4f6" }} />
            <DialogContent sx={{ px: 3, py: 2.5, minHeight: 260 }}>
              {detailTab === 0 && detailItem.type === "qa" && (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 0.75 }}><QuestionAnswer sx={{ fontSize: 13, color: "#9ca3af" }} /><Typography sx={{ fontSize: "11px", color: "#9ca3af" }}>主问题</Typography></Box>
                    <Box sx={{ bgcolor: "#eff6ff", borderRadius: "8px", p: 1.5 }}>
                      <Typography sx={{ fontSize: "13px", color: "#1d4ed8", fontWeight: 500 }}>{detailItem.question}</Typography>
                    </Box>
                  </Box>
                  <Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 0.75 }}><Tag sx={{ fontSize: 13, color: "#9ca3af" }} /><Typography sx={{ fontSize: "11px", color: "#9ca3af" }}>标准答案</Typography></Box>
                    <Box sx={{ bgcolor: "#f8f9fb", border: "1px solid #e8eaed", borderRadius: "8px", p: 1.5 }}>
                      <Typography sx={{ fontSize: "13px", color: "#374151", lineHeight: 1.8 }}>{detailItem.answer}</Typography>
                    </Box>
                  </Box>
                  {detailItem.similarQuestions.length > 0 && (
                    <Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 0.75 }}><Tag sx={{ fontSize: 13, color: "#9ca3af" }} /><Typography sx={{ fontSize: "11px", color: "#9ca3af" }}>相似问题（{detailItem.similarQuestions.length} 条）</Typography></Box>
                      <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap" }}>
                        {detailItem.similarQuestions.map(q => <Chip key={q} label={q} size="small" sx={{ height: 26, fontSize: "12px", bgcolor: "#f1f5f9", color: "#374151", border: "none", "& .MuiChip-label": { px: 1 } }} />)}
                      </Box>
                    </Box>
                  )}
                  <Box sx={{ p: 1.5, bgcolor: "#f8f9fb", border: "1px solid #e8eaed", borderRadius: "8px" }}>
                    <Typography sx={{ fontSize: "11px", fontWeight: 600, color: "#374151", mb: 1 }}>基本信息</Typography>
                    <Grid container spacing={1}>
                      {[{ label: "创建方式", val: detailItem.method === "ai" ? "AI 辅助抽取" : "人工创建" }, { label: "创建时间", val: detailItem.createdAt }, { label: "最后修改", val: detailItem.updatedAt }].map(f => (
                        <Grid size={{ xs: 6 }} key={f.label}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                            {f.label === "创建方式" ? <Create sx={{ fontSize: 11, color: "#9ca3af" }} /> : <AccessTime sx={{ fontSize: 11, color: "#9ca3af" }} />}
                            <Typography sx={{ fontSize: "11px", color: "#9ca3af" }}>{f.label}</Typography>
                          </Box>
                          <Typography sx={{ fontSize: "12px", color: "#374151" }}>{f.val}</Typography>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                </Box>
              )}
              {detailTab === 0 && detailItem.type === "term" && (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 0.75 }}><Translate sx={{ fontSize: 13, color: "#9ca3af" }} /><Typography sx={{ fontSize: "11px", color: "#9ca3af" }}>术语名称（首选词）</Typography></Box>
                    <Box sx={{ bgcolor: "#f5f3ff", borderRadius: "8px", p: 1.5 }}>
                      <Typography sx={{ fontSize: "15px", color: "#5b21b6", fontWeight: 700 }}>{detailItem.term}</Typography>
                    </Box>
                  </Box>
                  <Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 0.75 }}><Tag sx={{ fontSize: 13, color: "#9ca3af" }} /><Typography sx={{ fontSize: "11px", color: "#9ca3af" }}>释义</Typography></Box>
                    <Box sx={{ bgcolor: "#f8f9fb", border: "1px solid #e8eaed", borderRadius: "8px", p: 1.5 }}>
                      <Typography sx={{ fontSize: "13px", color: "#374151", lineHeight: 1.9 }}>{detailItem.definition}</Typography>
                    </Box>
                  </Box>
                  {detailItem.aliases.length > 0 && (
                    <Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 0.75 }}><Tag sx={{ fontSize: 13, color: "#9ca3af" }} /><Typography sx={{ fontSize: "11px", color: "#9ca3af" }}>别名 / 同义词（{detailItem.aliases.length} 条）</Typography></Box>
                      <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap" }}>
                        {detailItem.aliases.map(a => <Chip key={a} label={a} size="small" sx={{ height: 26, fontSize: "12px", bgcolor: "#f1f5f9", color: "#374151", border: "1px solid #e8eaed", "& .MuiChip-label": { px: 1 } }} />)}
                      </Box>
                    </Box>
                  )}
                  <Box sx={{ p: 1.5, bgcolor: "#f8f9fb", border: "1px solid #e8eaed", borderRadius: "8px" }}>
                    <Typography sx={{ fontSize: "11px", fontWeight: 600, color: "#374151", mb: 1 }}>基本信息</Typography>
                    <Grid container spacing={1}>
                      {[{ label: "创建方式", val: detailItem.method === "ai" ? "AI 辅助抽取" : "人工创建" }, { label: "创建时间", val: detailItem.createdAt }, { label: "最后修改", val: detailItem.updatedAt }].map(f => (
                        <Grid size={{ xs: 6 }} key={f.label}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                            {f.label === "创建方式" ? <Create sx={{ fontSize: 11, color: "#9ca3af" }} /> : <AccessTime sx={{ fontSize: 11, color: "#9ca3af" }} />}
                            <Typography sx={{ fontSize: "11px", color: "#9ca3af" }}>{f.label}</Typography>
                          </Box>
                          <Typography sx={{ fontSize: "12px", color: "#374151" }}>{f.val}</Typography>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                </Box>
              )}
              {detailTab === 1 && (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                  <Typography sx={{ fontSize: "12px", color: "#9ca3af", mb: 0.5 }}>来源追溯信息</Typography>
                  {[
                    { icon: <Source sx={{ fontSize: 13 }} />, label: "来源标准化文档", val: detailItem.sourceDoc ?? "手动创建（无来源文档）" },
                    { icon: <Tag sx={{ fontSize: 13 }} />, label: "所属知识类目", val: detailItem.category },
                    { icon: <Create sx={{ fontSize: 13 }} />, label: "创建方式", val: detailItem.method === "ai" ? "AI 辅助抽取" : "人工创建" },
                    { icon: <AccessTime sx={{ fontSize: 13 }} />, label: "创建时间", val: detailItem.createdAt },
                    { icon: <AccessTime sx={{ fontSize: 13 }} />, label: "最后修改", val: detailItem.updatedAt },
                  ].map(f => (
                    <Box key={f.label} sx={{ display: "flex", gap: 2, py: 1, borderBottom: "1px solid #f5f5f5", alignItems: "flex-start" }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, minWidth: 130, flexShrink: 0, color: "#9ca3af" }}>{f.icon}<Typography sx={{ fontSize: "12px", color: "#9ca3af" }}>{f.label}</Typography></Box>
                      <Typography sx={{ fontSize: "13px", color: "#374151", fontWeight: 500 }}>{f.val}</Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </DialogContent>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", px: 3, py: 2, borderTop: "1px solid #f3f4f6" }}>
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button size="small" startIcon={<PowerSettingsNew sx={{ fontSize: 14 }} />} onClick={() => { toggleStatus(detailItem.id); }}
                  sx={{ textTransform: "none", fontSize: "12px", color: detailItem.status === "enabled" ? "#f59e0b" : "#10b981", border: `1px solid ${detailItem.status === "enabled" ? "#fde68a" : "#bbf7d0"}`, borderRadius: "7px", px: 1.5, "&:hover": { bgcolor: detailItem.status === "enabled" ? "#fef3c7" : "#f0fdf4" } }}>
                  {detailItem.status === "enabled" ? "停用" : "启用"}
                </Button>
                <Button size="small" startIcon={<Edit sx={{ fontSize: 14 }} />} onClick={() => { setDetailItem(null); openEdit(detailItem); }}
                  sx={{ textTransform: "none", fontSize: "12px", color: "#374151", border: "1px solid #e8eaed", borderRadius: "7px", px: 1.5, "&:hover": { bgcolor: "#f9fafb" } }}>
                  编辑
                </Button>
              </Box>
              <Button onClick={() => setDetailItem(null)} sx={{ textTransform: "none", color: "#374151", borderRadius: "7px", fontSize: "13px" }}>关闭</Button>
            </Box>
          </>
        )}
      </Dialog>

      {/* Edit/Create dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: "14px" } }}>
        <DialogTitle sx={{ fontSize: "15px", fontWeight: 700, borderBottom: "1px solid #f3f4f6", py: 2, px: 3 }}>
          {editItem ? "编辑知识对象" : `新建${selFormType === "qa" ? "问答对" : "术语条目"}`}
        </DialogTitle>
        <DialogContent sx={{ px: 3, pt: 2.5, pb: 1 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel sx={{ fontSize: "13px" }}>所属知识类目 *</InputLabel>
              <Select value={fCat} onChange={e => setFCat(e.target.value)} label="所属知识类目 *"
                sx={{ borderRadius: "8px", fontSize: "13px", "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e8eaed" } }}>
                {(selFormType === "qa" ? CATS_QA : CATS_TERM).map(c => <MenuItem key={c} value={c} sx={{ fontSize: "13px" }}>{c}</MenuItem>)}
              </Select>
            </FormControl>
            {selFormType === "qa" ? <>
              <TextField fullWidth size="small" label="主问题 *" value={fQ} onChange={e => setFQ(e.target.value)} placeholder="请输入问题表述" sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px", fontSize: "13px" }, "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e8eaed" } }} />
              <TextField fullWidth multiline rows={4} size="small" label="标准答案 *" value={fA} onChange={e => setFA(e.target.value)} placeholder="请输入标准答案" sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px", fontSize: "13px" }, "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e8eaed" } }} />
              <TextField fullWidth size="small" label="相似问题（多个用；隔开，可选）" value={fSim} onChange={e => setFSim(e.target.value)} sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px", fontSize: "13px" }, "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e8eaed" } }} />
            </> : <>
              <TextField fullWidth size="small" label="术语名称（首选词）*" value={fTerm} onChange={e => setFTerm(e.target.value)} sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px", fontSize: "13px" }, "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e8eaed" } }} />
              <TextField fullWidth multiline rows={3} size="small" label="释义 *" value={fDef} onChange={e => setFDef(e.target.value)} sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px", fontSize: "13px" }, "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e8eaed" } }} />
              <TextField fullWidth size="small" label="别名 / 同义词（多个用；隔开，可选）" value={fAlias} onChange={e => setFAlias(e.target.value)} sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px", fontSize: "13px" }, "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e8eaed" } }} />
            </>}
            <FormControl fullWidth size="small">
              <InputLabel sx={{ fontSize: "13px" }}>来源标准化文档（可选）</InputLabel>
              <Select value={fDoc} onChange={e => setFDoc(e.target.value)} label="来源标准化文档（可选）"
                sx={{ borderRadius: "8px", fontSize: "13px", "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e8eaed" } }}>
                <MenuItem value="" sx={{ fontSize: "13px" }}>不指定来源</MenuItem>
                {MOCK_DOCS.map(d => <MenuItem key={d} value={d} sx={{ fontSize: "13px" }}>{d}</MenuItem>)}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ borderTop: "1px solid #f3f4f6", px: 3, py: 2, gap: 1 }}>
          <Button onClick={() => setEditOpen(false)} sx={{ textTransform: "none", color: "#374151", borderRadius: "7px", px: 2, fontSize: "13px" }}>取消</Button>
          <Button variant="contained" onClick={saveEdit} sx={{ bgcolor: "#7c3aed", borderRadius: "7px", textTransform: "none", px: 2.5, fontSize: "13px", boxShadow: "none", "&:hover": { bgcolor: "#6d28d9", boxShadow: "none" } }}>
            {editItem ? "保存修改" : "创建"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* AI dialog */}
      <Dialog open={aiOpen} onClose={() => !aiLoading && setAiOpen(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: "14px" } }}>
        <DialogTitle sx={{ fontSize: "15px", fontWeight: 700, borderBottom: "1px solid #f3f4f6", py: 2, px: 3 }}>
          AI 辅助抽取 — {selFormType === "qa" ? "问答对" : "术语条目"}
        </DialogTitle>
        <DialogContent sx={{ px: 3, pt: 2, pb: 1 }}>
          {aiDrafts.length === 0 ? (
            <Box>
              <Alert severity="info" sx={{ mb: 2, bgcolor: "#eff6ff", color: "#1e40af", border: "1px solid #bfdbfe", borderRadius: "8px", "& .MuiAlert-message": { fontSize: "12px" }, "& .MuiAlert-icon": { color: "#3b82f6" } }}>
                AI 将从选中的标准化文档中自动抽取{selFormType === "qa" ? "问答对" : "术语"}草稿，审核确认后方可启用
              </Alert>
              <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#374151", mb: 1.5 }}>选择标准化文档（可多选）</Typography>
              {MOCK_DOCS.map(doc => (
                <Box key={doc} onClick={() => setAiDocs(prev => prev.includes(doc) ? prev.filter(d => d !== doc) : [...prev, doc])}
                  sx={{ display: "flex", alignItems: "center", gap: 1.25, p: 1.5, mb: 1, bgcolor: aiDocs.includes(doc) ? "#eff6ff" : "#f8f9fb", border: `1px solid ${aiDocs.includes(doc) ? "#93c5fd" : "#e8eaed"}`, borderRadius: "8px", cursor: "pointer" }}>
                  <Checkbox size="small" checked={aiDocs.includes(doc)} sx={{ p: 0, color: "#d1d5db" }} />
                  <Typography sx={{ fontSize: "13px", color: "#374151" }}>{doc}</Typography>
                </Box>
              ))}
              {aiLoading && <Box sx={{ mt: 2 }}><LinearProgress sx={{ borderRadius: "4px", "& .MuiLinearProgress-bar": { bgcolor: "#7c3aed" } }} /><Typography sx={{ fontSize: "12px", color: "#6b7280", mt: 0.75 }}>AI 正在从文档中抽取{selFormType === "qa" ? "问答对" : "术语"}，请稍候…</Typography></Box>}
            </Box>
          ) : (
            <Box>
              <Alert severity="success" sx={{ mb: 2, bgcolor: "#f0fdf4", color: "#15803d", border: "1px solid #bbf7d0", borderRadius: "8px", "& .MuiAlert-message": { fontSize: "12px" }, "& .MuiAlert-icon": { color: "#10b981" } }}>
                抽取完成，共 {aiDrafts.length} 条草稿（默认停用），勾选后点击「确认启用」
              </Alert>
              {aiDrafts.map(d => (
                <Box key={d.id} onClick={() => setAiDraftSel(prev => { const n = new Set(prev); n.has(d.id) ? n.delete(d.id) : n.add(d.id); return n; })}
                  sx={{ display: "flex", gap: 1.5, p: 2, mb: 1, border: `1px solid ${aiDraftSel.has(d.id) ? "#a78bfa" : "#e8eaed"}`, borderRadius: "10px", bgcolor: aiDraftSel.has(d.id) ? "#faf5ff" : "#fafafa", cursor: "pointer" }}>
                  <Checkbox size="small" checked={aiDraftSel.has(d.id)} sx={{ p: 0, mt: 0.25, color: "#d1d5db", flexShrink: 0 }} />
                  <Box sx={{ flex: 1 }}>
                    {d.type === "qa" ? (
                      <>
                        <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#1d4ed8", mb: 0.5 }}>Q: {d.question}</Typography>
                        <Typography sx={{ fontSize: "12px", color: "#374151", lineHeight: 1.7 }}>A: {d.answer}</Typography>
                        {d.similarQuestions.length > 0 && <Typography sx={{ fontSize: "11px", color: "#9ca3af", mt: 0.5 }}>相似问：{d.similarQuestions.join("、")}</Typography>}
                      </>
                    ) : (
                      <>
                        <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#5b21b6", mb: 0.5 }}>{(d as TermItem).term}</Typography>
                        <Typography sx={{ fontSize: "12px", color: "#374151", lineHeight: 1.7 }}>{(d as TermItem).definition}</Typography>
                        {(d as TermItem).aliases.length > 0 && <Typography sx={{ fontSize: "11px", color: "#9ca3af", mt: 0.5 }}>别名：{(d as TermItem).aliases.join("、")}</Typography>}
                      </>
                    )}
                    <Typography sx={{ fontSize: "11px", color: "#9ca3af", mt: 0.5 }}>来源：{d.sourceDoc}</Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ borderTop: "1px solid #f3f4f6", px: 3, py: 2, gap: 1 }}>
          <Button onClick={() => { setAiOpen(false); setAiDrafts([]); }} disabled={aiLoading} sx={{ textTransform: "none", color: "#374151", borderRadius: "7px", px: 2, fontSize: "13px" }}>取消</Button>
          {aiDrafts.length === 0
            ? <Button variant="contained" onClick={startAI} disabled={!aiDocs.length || aiLoading} startIcon={<PlayArrow sx={{ fontSize: 15 }} />}
                sx={{ bgcolor: "#7c3aed", borderRadius: "7px", textTransform: "none", px: 2.5, fontSize: "13px", boxShadow: "none", "&:hover": { bgcolor: "#6d28d9", boxShadow: "none" } }}>开始抽取</Button>
            : <Button variant="contained" onClick={confirmDrafts} disabled={!aiDraftSel.size} startIcon={<CheckCircle sx={{ fontSize: 15 }} />}
                sx={{ bgcolor: "#10b981", borderRadius: "7px", textTransform: "none", px: 2.5, fontSize: "13px", boxShadow: "none", "&:hover": { bgcolor: "#059669", boxShadow: "none" } }}>确认启用（{aiDraftSel.size}）</Button>
          }
        </DialogActions>
      </Dialog>

      <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: "12px" } }}>
        <DialogTitle sx={{ fontSize: "15px", fontWeight: 700, py: 2, px: 3 }}>确认删除</DialogTitle>
        <DialogContent sx={{ px: 3 }}><Alert severity="error" sx={{ bgcolor: "#fef2f2", color: "#991b1b", border: "1px solid #fecaca", borderRadius: "8px", "& .MuiAlert-message": { fontSize: "13px" }, "& .MuiAlert-icon": { color: "#ef4444" } }}>删除后不可恢复，是否确认？</Alert></DialogContent>
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button onClick={() => setDeleteConfirm(null)} sx={{ textTransform: "none", color: "#374151", borderRadius: "7px", px: 2, fontSize: "13px" }}>取消</Button>
          <Button variant="contained" onClick={() => doDelete(deleteConfirm!)} sx={{ bgcolor: "#ef4444", borderRadius: "7px", textTransform: "none", px: 2.5, fontSize: "13px", boxShadow: "none", "&:hover": { bgcolor: "#dc2626", boxShadow: "none" } }}>确认删除</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={toast.open} autoHideDuration={3000} onClose={() => setToast(t => ({ ...t, open: false }))} anchorOrigin={{ vertical: "top", horizontal: "center" }}>
        <Alert severity={toast.sev} onClose={() => setToast(t => ({ ...t, open: false }))} sx={{ borderRadius: "8px", boxShadow: "0 4px 12px rgba(0,0,0,0.15)", fontSize: "13px" }}>{toast.msg}</Alert>
      </Snackbar>
    </Box>
  );
}
