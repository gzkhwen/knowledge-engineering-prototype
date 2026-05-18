import { useState, useMemo } from "react";
import { useOutletContext, useNavigate } from "react-router";
import {
  Box, Typography, Button, Chip, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Dialog, DialogTitle, DialogContent, DialogActions,
  IconButton, Paper, Alert, Checkbox, Tabs, Tab, Tooltip, Divider, LinearProgress,
  FormControl, InputLabel, Select, MenuItem, Snackbar, Grid,
} from "@mui/material";
import {
  AutoAwesome, Visibility, PowerSettingsNew, Refresh, PlayArrow, Article, CheckCircle,
  ErrorOutline, Schedule, Close, InfoOutlined, ArrowForward, FileCopy,
  Tag, TextSnippet, Source, History as HistoryIcon,
} from "@mui/icons-material";
import { Project } from "../types";

type RawStatus = "pending" | "processing" | "completed" | "failed";
type DocStatus = "enabled" | "disabled";

interface StdDoc {
  id: string;
  summary: string;
  parsedContent: string;
  charCount: number;
  layoutType: string;
  processingMethod: string;
  processedAt: string;
  docStatus: DocStatus;
  isReferenced: boolean;
  processingLogs: { time: string; step: string; detail: string }[];
}

interface StdMat {
  id: string;
  name: string;
  format: string;
  uploader: string;
  uploadTime: string;
  rawStatus: RawStatus;
  failReason?: string;
  stdDoc?: StdDoc;
}

const INIT_MATS: StdMat[] = [
  {
    id: "sm1", name: "金融产品使用手册.md", format: "md", uploader: "李静",
    uploadTime: new Date(Date.now() - 86400000 * 3).toISOString(), rawStatus: "completed",
    stdDoc: {
      id: "sd1", docStatus: "enabled", isReferenced: true, layoutType: "纯文本",
      processingMethod: "Markdown解析器 + 段落清洗", charCount: 12400,
      processedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      summary: "本手册为金融产品（理财产品、信用卡、贷款等）的完整使用指引，涵盖申请条件、操作流程、常见问题解答及注意事项。手册分为产品介绍、申请与开通、日常使用、问题排查四个章节，提供详细的操作步骤和业务规则说明。适用对象为企业一线客服人员及端用户，版本 V2.3，更新日期 2026 年 1 月。",
      parsedContent: "# 金融产品使用手册 V2.3\n\n## 第一章 产品介绍\n\n### 1.1 理财产品\n\n本行理财产品涵盖固定收益类、浮动收益类及结构性产品三大类型。固定收益类产品预期年化收益率为 2.8%–4.5%，期限从 30 天至 3 年不等；浮动收益类产品净值每日更新，收益随市场波动；结构性产品与特定指标挂钩，适合风险承受能力较高的投资者。\n\n### 1.2 信用卡产品\n\n本行信用卡产品共分为基础卡、金卡、白金卡、无限卡四个等级，各等级权益及年费标准详见附件《信用卡权益对照表》。\n\n## 第二章 申请与开通\n\n申请理财产品须满足以下条件：（1）投资者须为年满 18 周岁的自然人；（2）须完成风险承受能力评估，且评估等级与产品风险等级匹配；（3）首次购买须到柜台或通过手机银行进行身份核验。",
      processingLogs: [
        { time: "10:23:01", step: "文件解析", detail: "Markdown 格式识别成功，共解析 47 个段落、3 个表格" },
        { time: "10:23:03", step: "内容清洗", detail: "去除页眉页脚 2 处、重复内容 1 处、特殊字符 8 个" },
        { time: "10:23:05", step: "格式转换", detail: "统一为标准段落格式，保留标题层级结构" },
        { time: "10:23:06", step: "来源信息写入", detail: "来源追溯信息写入完成，字符数统计：12,400 字" },
        { time: "10:23:07", step: "处理完成", detail: "标准化文档生成成功，状态设为启用" },
      ],
    },
  },
  {
    id: "sm2", name: "产品FAQ汇总2024.xlsx", format: "xlsx", uploader: "王鹏",
    uploadTime: new Date(Date.now() - 86400000 * 2).toISOString(), rawStatus: "completed",
    stdDoc: {
      id: "sd2", docStatus: "enabled", isReferenced: false, layoutType: "表格为主",
      processingMethod: "Excel结构解析 + 内容归一化", charCount: 8760,
      processedAt: new Date(Date.now() - 86400000).toISOString(),
      summary: "本文档汇总了金融产品常见问题解答共 238 条，按业务类型分类：理财类 86 条、信用卡类 94 条、贷款类 58 条。每条 FAQ 包含问题描述、标准答案和相关政策依据。文档由客服中心整理，反映过去 12 个月内用户提问频次最高的业务问题，是构建问答库的核心原始材料。",
      parsedContent: "## 产品FAQ汇总（2024版）\n\n### 理财产品类（86条）\n\n**Q001: 理财产品的申购起点金额是多少？**\n答：最低申购金额为 1 万元人民币，部分高端产品起点为 10 万元或 100 万元，具体以产品说明书为准。\n\n**Q002: 理财产品可以提前赎回吗？**\n答：封闭式理财产品不支持提前赎回；开放式净值型产品可在开放日赎回，赎回资金 T+1 到账。\n\n**Q003: 购买理财产品需要做风险评估吗？**\n答：是的，根据监管要求，投资者首次购买理财产品需进行风险承受能力评估，每年更新一次。",
      processingLogs: [
        { time: "14:05:22", step: "文件解析", detail: "Excel 文件共 3 个 Sheet，识别有效数据行 238 条" },
        { time: "14:05:24", step: "结构识别", detail: "识别到表头行、问题列、答案列，自动映射字段" },
        { time: "14:05:26", step: "内容清洗", detail: "清洗空白行 12 条、合并单元格展开 8 处" },
        { time: "14:05:28", step: "格式转换", detail: "转换为标准问答段落格式" },
        { time: "14:05:29", step: "处理完成", detail: "标准化文档生成成功，字符数：8,760 字" },
      ],
    },
  },
  {
    id: "sm3", name: "理财业务规范v3.txt", format: "txt", uploader: "李静",
    uploadTime: new Date(Date.now() - 86400000 * 2 + 3600000).toISOString(), rawStatus: "completed",
    stdDoc: {
      id: "sd3", docStatus: "enabled", isReferenced: false, layoutType: "纯文本",
      processingMethod: "纯文本解析 + 段落分割", charCount: 5230,
      processedAt: new Date(Date.now() - 86400000 + 3600000).toISOString(),
      summary: "本规范文档定义了理财业务操作的标准流程和合规要求，包括产品销售规范、客户适当性管理、风险揭示要求及违规处理程序，共 5 个章节，适用于所有理财业务操作人员。",
      parsedContent: "# 理财业务规范 V3.0\n\n## 第一章 总则\n\n本规范依据《商业银行理财业务监督管理办法》及相关法规制定，旨在规范本行理财业务操作，保护投资者合法权益。\n\n## 第二章 产品销售规范\n\n2.1 销售前，业务人员须向客户充分揭示产品风险，并确认客户已阅读并理解《理财产品风险揭示书》。",
      processingLogs: [
        { time: "09:15:00", step: "文件解析", detail: "TXT 文件编码 UTF-8，共 5,230 个字符" },
        { time: "09:15:01", step: "段落切分", detail: "按空行分割，识别段落 62 个" },
        { time: "09:15:02", step: "内容清洗", detail: "清洗多余空白字符，统一换行符" },
        { time: "09:15:03", step: "处理完成", detail: "标准化文档生成成功" },
      ],
    },
  },
  {
    id: "sm4", name: "信用卡业务手册_202501.md", format: "md", uploader: "陈晨",
    uploadTime: new Date(Date.now() - 86400000).toISOString(), rawStatus: "processing",
  },
  {
    id: "sm5", name: "风控流程说明_最新版.md", format: "md", uploader: "王鹏",
    uploadTime: new Date(Date.now() - 86400000 + 7200000).toISOString(), rawStatus: "pending",
  },
  {
    id: "sm6", name: "客户投诉处理规程.xlsx", format: "xlsx", uploader: "李静",
    uploadTime: new Date(Date.now() - 3600000 * 8).toISOString(), rawStatus: "failed",
    failReason: "文件内容解析异常：段落结构识别失败，可能存在内容损坏或不受支持的内部排版格式，建议重新导出后上传",
  },
  {
    id: "sm7", name: "知识库建设标准_v2.txt", format: "txt", uploader: "陈晨",
    uploadTime: new Date(Date.now() - 3600000 * 5).toISOString(), rawStatus: "completed",
    stdDoc: {
      id: "sd4", docStatus: "disabled", isReferenced: false, layoutType: "纯文本",
      processingMethod: "纯文本解析 + 段落分割", charCount: 3140,
      processedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      summary: "本文档为知识库建设标准（第二版），定义了知识条目的规范格式、质量要求及审核流程。已被运营人员停用，请参考最新版本。",
      parsedContent: "# 知识库建设标准 V2（已停用）\n\n## 适用范围\n本标准适用于……",
      processingLogs: [
        { time: "11:30:00", step: "文件解析", detail: "TXT 文件解析完成，共 3,140 字符" },
        { time: "11:30:01", step: "处理完成", detail: "标准化文档生成成功（现已停用）" },
      ],
    },
  },
];

const RAW_STATUS: Record<RawStatus, { label: string; bg: string; color: string; dot: string }> = {
  pending:    { label: "待处理", bg: "#f1f5f9", color: "#475569", dot: "#94a3b8" },
  processing: { label: "处理中", bg: "#eff6ff", color: "#1d4ed8", dot: "#60a5fa" },
  completed:  { label: "已完成", bg: "#f0fdf4", color: "#15803d", dot: "#4ade80" },
  failed:     { label: "失败",   bg: "#fef2f2", color: "#b91c1c", dot: "#f87171" },
};
const DOC_STATUS: Record<DocStatus, { label: string; bg: string; color: string }> = {
  enabled:  { label: "启用", bg: "#f0fdf4", color: "#15803d" },
  disabled: { label: "停用", bg: "#f9fafb", color: "#6b7280" },
};

const fmtTime = (iso: string | undefined) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleString("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
};

export function StandardizationProcessing() {
  const { project } = useOutletContext<{ project: Project }>();
  const navigate = useNavigate();

  const key = `stdMats_${project.id}`;
  const [mats, setMats] = useState<StdMat[]>(() => {
    try {
      const s = localStorage.getItem(key);
      if (!s) return INIT_MATS;
      const parsed: StdMat[] = JSON.parse(s);
      // Validate and migrate old data - reset to defaults if core fields missing
      const isValid = parsed.every(m =>
        typeof m.id === "string" && typeof m.name === "string" &&
        (!m.stdDoc || typeof m.stdDoc.charCount === "number")
      );
      if (!isValid) {
        localStorage.removeItem(key);
        return INIT_MATS;
      }
      // Migrate: ensure stdDoc has processingLogs and parsedContent
      return parsed.map(m => {
        if (m.stdDoc && !m.stdDoc.processingLogs) {
          return { ...m, stdDoc: { ...m.stdDoc, processingLogs: [], parsedContent: m.stdDoc.parsedContent ?? "" } };
        }
        return m;
      });
    } catch { return INIT_MATS; }
  });
  const save = (d: StdMat[]) => { setMats(d); localStorage.setItem(key, JSON.stringify(d)); };

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [tabVal, setTabVal] = useState(0);
  const [detailMat, setDetailMat] = useState<StdMat | null>(null);
  const [detailTab, setDetailTab] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [buildOpen, setBuildOpen] = useState(false);
  const [buildCat, setBuildCat] = useState(""); const [buildForm, setBuildForm] = useState("");
  const [reprocessConfirm, setReprocessConfirm] = useState<StdMat | null>(null);
  const [toast, setToast] = useState({ open: false, msg: "", sev: "success" as "success" | "error" | "warning" });
  const showToast = (msg: string, sev: "success" | "error" | "warning" = "success") => setToast({ open: true, msg, sev });

  const filtered = useMemo(() => {
    const base = mats.sort((a, b) => new Date(b.uploadTime).getTime() - new Date(a.uploadTime).getTime());
    if (tabVal === 1) return base.filter(m => m.rawStatus === "pending");
    if (tabVal === 2) return base.filter(m => m.rawStatus === "completed");
    return base;
  }, [mats, tabVal]);

  const stats = useMemo(() => ({
    total: mats.length, pending: mats.filter(m => m.rawStatus === "pending").length,
    processing: mats.filter(m => m.rawStatus === "processing").length,
    completed: mats.filter(m => m.rawStatus === "completed").length,
    enabledDocs: mats.filter(m => m.stdDoc?.docStatus === "enabled").length,
  }), [mats]);

  const canProcess = filtered.filter(m => selected.has(m.id) && m.rawStatus !== "processing");
  const selectedEnabled = [...selected].filter(id => mats.find(m => m.id === id)?.stdDoc?.docStatus === "enabled");

  const toggleAll = () => {
    if (filtered.every(m => selected.has(m.id))) setSelected(new Set());
    else setSelected(new Set(filtered.map(m => m.id)));
  };
  const toggleOne = (id: string) => setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const doProcess = async (ids: string[]) => {
    const toProc = mats.filter(m => ids.includes(m.id) && m.rawStatus !== "processing");
    if (!toProc.length) return;
    setProcessing(true);
    save(mats.map(m => toProc.find(t => t.id === m.id) ? { ...m, rawStatus: "processing" as RawStatus } : m));
    await new Promise(r => setTimeout(r, 1800));
    const now = new Date().toISOString();
    const logTime = new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    save(mats.map(m => {
      const t = toProc.find(t => t.id === m.id);
      if (!t) return m;
      const methods: Record<string, string> = { md: "Markdown解析器 + 段落清洗", txt: "纯文本解析 + 段落分割", xlsx: "Excel结构解析 + 内容归一化", xls: "Excel结构解析 + 内容归一化" };
      const layouts: Record<string, string> = { md: "图文混排", txt: "纯文本", xlsx: "表格为主", xls: "表格为主" };
      const charCounts: Record<string, number> = { md: 9800, txt: 4200, xlsx: 6300, xls: 6300 };
      const cc = charCounts[t.format] ?? 5000;
      return {
        ...m, rawStatus: "completed" as RawStatus,
        stdDoc: {
          id: `sd_${m.id}`, docStatus: "enabled" as DocStatus, isReferenced: false,
          processingMethod: methods[t.format] ?? "通用文本解析", layoutType: layouts[t.format] ?? "纯文本",
          charCount: cc, processedAt: now,
          summary: `本文档「${t.name}」经标准化处理后生成。已完成文字提取、段落清洗、格式转换及来源追溯信息写入，共 ${cc.toLocaleString()} 字，可用于后续知识构建。`,
          parsedContent: `# ${t.name}\n\n（已完成标准化处理）\n\n本文档完整内容已解析并清洗，以下为内容示例：\n\n## 第一节 概述\n\n本文档由「${t.uploader}」上传，已通过标准化处理转换为统一格式，内容完整可用。\n\n## 第二节 主要内容\n\n文档原始内容经 Markdown/Excel/TXT 解析后，已统一为标准段落格式，保留了原有的章节层级结构和表格信息。`,
          processingLogs: [
            { time: logTime, step: "文件解析", detail: `${t.format.toUpperCase()} 格式识别成功，开始内容提取` },
            { time: logTime, step: "内容清洗", detail: "清洗页眉页脚、去除重复内容、处理特殊字符" },
            { time: logTime, step: "格式转换", detail: "统一转换为标准文档格式，保留结构层级" },
            { time: logTime, step: "来源信息写入", detail: `来源追溯完成，字符数：${cc.toLocaleString()} 字` },
            { time: logTime, step: "处理完成", detail: "标准化文档生成成功，状态设为启用" },
          ],
        },
      };
    }));
    setProcessing(false); setSelected(new Set());
    showToast(`${toProc.length} 份材料标准化处理完成`);
  };

  const toggleDocStatus = (mat: StdMat) => {
    save(mats.map(m => m.id === mat.id && m.stdDoc
      ? { ...m, stdDoc: { ...m.stdDoc, docStatus: m.stdDoc.docStatus === "enabled" ? "disabled" : "enabled" } }
      : m));
    if (detailMat?.id === mat.id && detailMat.stdDoc) {
      setDetailMat({ ...mat, stdDoc: { ...mat.stdDoc, docStatus: mat.stdDoc.docStatus === "enabled" ? "disabled" : "enabled" } });
    }
    showToast("文档状态已切换");
  };

  const handleBuild = () => {
    setBuildOpen(false);
    navigate(buildForm === "非结构化切片" ? `/ops/project/${project.id}/unstructured` : `/ops/project/${project.id}/structured`);
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2.5 }}>
        <Box>
          <Typography sx={{ fontSize: "18px", fontWeight: 700, color: "#111827" }}>标准化处理</Typography>
          <Typography sx={{ fontSize: "13px", color: "#94a3b8", mt: 0.25 }}>对原始材料执行解析、清洗、转换，生成标准化文档候选集</Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          {selectedEnabled.length > 0 && (
            <Button variant="outlined" startIcon={<ArrowForward sx={{ fontSize: 14 }} />} onClick={() => setBuildOpen(true)}
              sx={{ borderColor: "#8b5cf6", color: "#5b21b6", borderRadius: "8px", textTransform: "none", fontSize: "13px", px: 2, "&:hover": { bgcolor: "#f5f3ff" } }}>
              发起知识构建（{selectedEnabled.length}）
            </Button>
          )}
          {canProcess.length > 0 && (
            <Button variant="contained" startIcon={<PlayArrow sx={{ fontSize: 15 }} />} onClick={() => doProcess([...selected])} disabled={processing}
              sx={{ bgcolor: "#7c3aed", borderRadius: "8px", textTransform: "none", fontSize: "13px", px: 2, boxShadow: "none", "&:hover": { bgcolor: "#6d28d9", boxShadow: "none" } }}>
              触发处理（{canProcess.length}）
            </Button>
          )}
        </Box>
      </Box>

      {/* Stats */}
      <Box sx={{ display: "flex", gap: 1.5, mb: 2.5, flexWrap: "wrap" }}>
        {[
          { label: "原始材料", val: stats.total, color: "#374151", bg: "#fff" },
          { label: "待处理", val: stats.pending, color: "#92400e", bg: "#fffbeb" },
          { label: "处理中", val: stats.processing, color: "#1d4ed8", bg: "#eff6ff" },
          { label: "已完成", val: stats.completed, color: "#15803d", bg: "#f0fdf4" },
          { label: "启用文档", val: stats.enabledDocs, color: "#5b21b6", bg: "#f5f3ff" },
        ].map(s => (
          <Paper key={s.label} sx={{ px: 2.5, py: 1.5, border: "1px solid #e8eaed", borderRadius: "10px", boxShadow: "none", bgcolor: s.bg, minWidth: 88 }}>
            <Typography sx={{ fontSize: "22px", fontWeight: 700, color: s.color, lineHeight: 1.1 }}>{s.val}</Typography>
            <Typography sx={{ fontSize: "11px", color: "#9ca3af", mt: 0.25 }}>{s.label}</Typography>
          </Paper>
        ))}
      </Box>

      {processing && (
        <Alert severity="info" icon={<AutoAwesome sx={{ fontSize: 15 }} />}
          sx={{ mb: 2, bgcolor: "#eff6ff", color: "#1e40af", border: "1px solid #bfdbfe", borderRadius: "8px", py: 0.75, "& .MuiAlert-message": { width: "100%", fontSize: "12px" } }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography sx={{ fontSize: "12px" }}>正在执行标准化处理，请稍候…</Typography>
            <LinearProgress sx={{ flex: 1, borderRadius: "4px", "& .MuiLinearProgress-bar": { bgcolor: "#3b82f6" } }} />
          </Box>
        </Alert>
      )}

      <Paper sx={{ border: "1px solid #e8eaed", borderRadius: "10px", boxShadow: "none", overflow: "hidden" }}>
        <Box sx={{ borderBottom: "1px solid #f0f0f0", px: 2 }}>
          <Tabs value={tabVal} onChange={(_, v) => setTabVal(v)}
            sx={{ "& .MuiTab-root": { fontSize: "13px", textTransform: "none", minHeight: 44, py: 1 }, "& .MuiTabs-indicator": { bgcolor: "#7c3aed" } }}>
            <Tab label={`全部 (${mats.length})`} />
            <Tab label={`待处理 (${stats.pending})`} />
            <Tab label={`已完成 (${stats.completed})`} />
          </Tabs>
        </Box>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: "#f8f9fb" }}>
                <TableCell padding="checkbox" sx={{ pl: 2 }}>
                  <Checkbox size="small" checked={filtered.length > 0 && filtered.every(m => selected.has(m.id))} onChange={toggleAll} sx={{ color: "#d1d5db" }} />
                </TableCell>
                {["原始材料", "格式", "处理状态", "标准化文档摘要", "文档状态 / 字数", "处理时间", "操作"].map(h => (
                  <TableCell key={h} sx={{ fontSize: "12px", fontWeight: 600, color: "#6b7280", py: 1.5, borderBottom: "1px solid #f0f0f0", whiteSpace: "nowrap" }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((m, i) => {
                const rs = RAW_STATUS[m.rawStatus];
                const ds = m.stdDoc ? DOC_STATUS[m.stdDoc.docStatus] : null;
                const isSel = selected.has(m.id);
                return (
                  <TableRow key={m.id} sx={{ bgcolor: isSel ? "#faf5ff" : i % 2 === 0 ? "#fff" : "#fafafa", "&:hover": { bgcolor: "#f5f3ff20" }, "& td": { borderBottom: "1px solid #f5f5f5" } }}>
                    <TableCell padding="checkbox" sx={{ pl: 2 }}>
                      <Checkbox size="small" checked={isSel} onChange={() => toggleOne(m.id)} sx={{ color: "#d1d5db" }} />
                    </TableCell>
                    <TableCell sx={{ py: 1.5 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Box sx={{ width: 30, height: 30, borderRadius: "6px", bgcolor: "#f5f3ff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <Article sx={{ fontSize: 15, color: "#7c3aed" }} />
                        </Box>
                        <Box>
                          <Typography sx={{ fontSize: "13px", color: "#111827", fontWeight: 500, maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.name}</Typography>
                          <Typography sx={{ fontSize: "11px", color: "#9ca3af" }}>{m.uploader} · {fmtTime(m.uploadTime)}</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell><Chip label={`.${m.format.toUpperCase()}`} size="small" sx={{ height: 20, fontSize: "11px", bgcolor: "#f1f5f9", color: "#475569", border: "none", "& .MuiChip-label": { px: 0.75 } }} /></TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: rs.dot, flexShrink: 0 }} />
                        <Typography sx={{ fontSize: "12px", color: rs.color, fontWeight: 500 }}>{rs.label}</Typography>
                        {m.failReason && <Tooltip title={m.failReason} arrow><ErrorOutline sx={{ fontSize: 13, color: "#ef4444", cursor: "help" }} /></Tooltip>}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ maxWidth: 200 }}>
                      {m.stdDoc ? (
                        <Typography sx={{ fontSize: "12px", color: "#374151", overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", lineHeight: 1.5 }}>
                          {m.stdDoc.summary.slice(0, 60)}…
                        </Typography>
                      ) : <Typography sx={{ fontSize: "12px", color: "#d1d5db" }}>—</Typography>}
                    </TableCell>
                    <TableCell>
                      {ds && (
                        <Box>
                          <Chip label={ds.label} size="small" sx={{ height: 20, fontSize: "11px", bgcolor: ds.bg, color: ds.color, border: "none", "& .MuiChip-label": { px: 0.75 }, mb: 0.5, display: "block" }} />
                          {m.stdDoc && <Typography sx={{ fontSize: "11px", color: "#9ca3af" }}>约 {m.stdDoc.charCount.toLocaleString()} 字</Typography>}
                        </Box>
                      )}
                    </TableCell>
                    <TableCell sx={{ fontSize: "12px", color: "#9ca3af", whiteSpace: "nowrap" }}>{m.stdDoc ? fmtTime(m.stdDoc.processedAt) : "—"}</TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", gap: 0.5 }}>
                        {m.stdDoc && (
                          <Tooltip title="查看文档详情" arrow>
                            <IconButton size="small" onClick={() => { setDetailMat(m); setDetailTab(0); }}
                              sx={{ width: 28, height: 28, borderRadius: "6px", color: "#9ca3af", "&:hover": { color: "#7c3aed", bgcolor: "#f5f3ff" } }}>
                              <Visibility sx={{ fontSize: 15 }} />
                            </IconButton>
                          </Tooltip>
                        )}
                        {m.stdDoc && (
                          <Tooltip title={m.stdDoc.docStatus === "enabled" ? "停用文档" : "启用文档"} arrow>
                            <IconButton size="small" onClick={() => toggleDocStatus(m)}
                              sx={{ width: 28, height: 28, borderRadius: "6px", color: m.stdDoc.docStatus === "enabled" ? "#9ca3af" : "#10b981", "&:hover": { color: m.stdDoc.docStatus === "enabled" ? "#f59e0b" : "#059669", bgcolor: m.stdDoc.docStatus === "enabled" ? "#fef3c7" : "#f0fdf4" } }}>
                              <PowerSettingsNew sx={{ fontSize: 15 }} />
                            </IconButton>
                          </Tooltip>
                        )}
                        {(m.rawStatus === "failed" || (m.rawStatus === "completed" && !m.stdDoc?.isReferenced)) && (
                          <Tooltip title={m.stdDoc?.isReferenced ? "已被引用，无法重新处理" : "重新处理"} arrow>
                            <span>
                              <IconButton size="small" disabled={m.stdDoc?.isReferenced}
                                onClick={() => m.stdDoc ? setReprocessConfirm(m) : doProcess([m.id])}
                                sx={{ width: 28, height: 28, borderRadius: "6px", color: "#9ca3af", "&:hover": { color: "#10b981", bgcolor: "#f0fdf4" }, "&.Mui-disabled": { color: "#e5e7eb" } }}>
                                <Refresh sx={{ fontSize: 15 }} />
                              </IconButton>
                            </span>
                          </Tooltip>
                        )}
                        {m.rawStatus === "pending" && (
                          <Tooltip title="触发处理" arrow>
                            <IconButton size="small" onClick={() => doProcess([m.id])}
                              sx={{ width: 28, height: 28, borderRadius: "6px", color: "#9ca3af", "&:hover": { color: "#7c3aed", bgcolor: "#f5f3ff" } }}>
                              <PlayArrow sx={{ fontSize: 15 }} />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
        <Box sx={{ px: 2.5, py: 1.25, borderTop: "1px solid #f5f5f5", bgcolor: "#fafafa" }}>
          <Typography sx={{ fontSize: "12px", color: "#9ca3af" }}>共 {filtered.length} 条 · 已选 {selected.size} 条</Typography>
        </Box>
      </Paper>

      {/* ── Rich Detail Dialog ── */}
      <Dialog open={!!detailMat} onClose={() => setDetailMat(null)} maxWidth="md" fullWidth
        PaperProps={{ sx: { borderRadius: "14px", boxShadow: "0 24px 60px rgba(0,0,0,0.15)" } }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 3, py: 2, borderBottom: "1px solid #f3f4f6" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <FileCopy sx={{ fontSize: 18, color: "#7c3aed" }} />
            <Typography sx={{ fontSize: "15px", fontWeight: 700, color: "#111827" }}>{detailMat?.name}</Typography>
            {detailMat?.stdDoc && (
              <Chip label={DOC_STATUS[detailMat.stdDoc.docStatus].label} size="small"
                sx={{ height: 20, fontSize: "11px", bgcolor: DOC_STATUS[detailMat.stdDoc.docStatus].bg, color: DOC_STATUS[detailMat.stdDoc.docStatus].color, border: "none", "& .MuiChip-label": { px: 0.75 } }} />
            )}
          </Box>
          <IconButton size="small" onClick={() => setDetailMat(null)} sx={{ color: "#9ca3af" }}><Close sx={{ fontSize: 18 }} /></IconButton>
        </Box>

        {detailMat?.stdDoc && (
          <>
            <Box sx={{ borderBottom: "1px solid #f3f4f6", px: 3 }}>
              <Tabs value={detailTab} onChange={(_, v) => setDetailTab(v)}
                sx={{ "& .MuiTab-root": { fontSize: "13px", textTransform: "none", minHeight: 44, px: 0, mr: 3 }, "& .MuiTabs-indicator": { bgcolor: "#7c3aed" } }}>
                <Tab label="内容摘要" icon={<TextSnippet sx={{ fontSize: 14, mr: 0.5 }} />} iconPosition="start" />
                <Tab label="解析内容" icon={<Article sx={{ fontSize: 14, mr: 0.5 }} />} iconPosition="start" />
                <Tab label="来源追溯" icon={<Source sx={{ fontSize: 14, mr: 0.5 }} />} iconPosition="start" />
                <Tab label="处理记录" icon={<HistoryIcon sx={{ fontSize: 14, mr: 0.5 }} />} iconPosition="start" />
              </Tabs>
            </Box>
            <DialogContent sx={{ px: 3, py: 2.5, minHeight: 340 }}>
              {detailTab === 0 && (
                <Box>
                  {/* Summary text */}
                  <Typography sx={{ fontSize: "12px", color: "#9ca3af", mb: 1 }}>内容摘要</Typography>
                  <Box sx={{ bgcolor: "#f8f9fb", border: "1px solid #e8eaed", borderRadius: "8px", p: 2, mb: 2.5 }}>
                    <Typography sx={{ fontSize: "13px", color: "#374151", lineHeight: 1.9 }}>{detailMat.stdDoc.summary}</Typography>
                  </Box>
                  {/* Metadata grid */}
                  <Grid container spacing={1.5}>
                    {[
                      { icon: <Tag sx={{ fontSize: 13, color: "#7c3aed" }} />, label: "处理方式", value: detailMat.stdDoc.processingMethod },
                      { icon: <FileCopy sx={{ fontSize: 13, color: "#7c3aed" }} />, label: "版面类型", value: detailMat.stdDoc.layoutType },
                      { icon: <TextSnippet sx={{ fontSize: 13, color: "#7c3aed" }} />, label: "文字量", value: `约 ${detailMat.stdDoc.charCount.toLocaleString()} 字` },
                      { icon: <CheckCircle sx={{ fontSize: 13, color: "#7c3aed" }} />, label: "文档状态", value: DOC_STATUS[detailMat.stdDoc.docStatus].label },
                    ].map(f => (
                      <Grid size={{ xs: 6 }} key={f.label}>
                        <Box sx={{ p: 1.5, bgcolor: "#f8f9fb", border: "1px solid #e8eaed", borderRadius: "8px" }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.5 }}>{f.icon}<Typography sx={{ fontSize: "11px", color: "#9ca3af" }}>{f.label}</Typography></Box>
                          <Typography sx={{ fontSize: "13px", color: "#374151", fontWeight: 500 }}>{f.value}</Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}
              {detailTab === 1 && (
                <Box>
                  <Typography sx={{ fontSize: "12px", color: "#9ca3af", mb: 1 }}>全文解析内容</Typography>
                  <Box sx={{ bgcolor: "#1e293b", borderRadius: "8px", p: 2.5, maxHeight: 400, overflow: "auto" }}>
                    <Typography component="pre" sx={{ fontSize: "12px", color: "#e2e8f0", fontFamily: "'Fira Code', 'Consolas', monospace", whiteSpace: "pre-wrap", lineHeight: 1.8, m: 0 }}>
                      {detailMat.stdDoc.parsedContent}
                    </Typography>
                  </Box>
                </Box>
              )}
              {detailTab === 2 && (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                  <Typography sx={{ fontSize: "12px", color: "#9ca3af", mb: 0.5 }}>来源追溯信息</Typography>
                  {[
                    { label: "来源原始材料", value: detailMat.name },
                    { label: "上传人", value: detailMat.uploader },
                    { label: "上传时间", value: fmtTime(detailMat.uploadTime) },
                    { label: "处理时间", value: fmtTime(detailMat.stdDoc.processedAt) },
                    { label: "处理方式", value: detailMat.stdDoc.processingMethod },
                    { label: "是否被下游引用", value: detailMat.stdDoc.isReferenced ? "是（已被知识构建引用）" : "否" },
                  ].map(f => (
                    <Box key={f.label} sx={{ display: "flex", gap: 2, py: 1, borderBottom: "1px solid #f5f5f5" }}>
                      <Typography sx={{ fontSize: "12px", color: "#9ca3af", minWidth: 120, flexShrink: 0 }}>{f.label}</Typography>
                      <Typography sx={{ fontSize: "13px", color: "#374151", fontWeight: 500 }}>{f.value}</Typography>
                    </Box>
                  ))}
                  {detailMat.stdDoc.isReferenced && (
                    <Alert severity="info" sx={{ bgcolor: "#eff6ff", color: "#1e40af", border: "1px solid #bfdbfe", borderRadius: "8px", "& .MuiAlert-message": { fontSize: "12px" }, "& .MuiAlert-icon": { color: "#3b82f6" } }}>
                      该文档已被下游知识结果引用，不可重新处理
                    </Alert>
                  )}
                </Box>
              )}
              {detailTab === 3 && (
                <Box>
                  <Typography sx={{ fontSize: "12px", color: "#9ca3af", mb: 1.5 }}>处理执行记录</Typography>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 0 }}>
                    {detailMat.stdDoc.processingLogs.map((log, i) => (
                      <Box key={i} sx={{ display: "flex", gap: 2, py: 1.25, borderBottom: i < detailMat.stdDoc!.processingLogs.length - 1 ? "1px solid #f5f5f5" : "none", alignItems: "flex-start" }}>
                        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                          <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: i === detailMat.stdDoc!.processingLogs.length - 1 ? "#10b981" : "#7c3aed", mt: 0.25 }} />
                          {i < detailMat.stdDoc!.processingLogs.length - 1 && <Box sx={{ width: 1, flex: 1, bgcolor: "#e8eaed", mt: 0.5, mb: -1 }} />}
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.25 }}>
                            <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "#374151" }}>{log.step}</Typography>
                            <Typography sx={{ fontSize: "11px", color: "#9ca3af" }}>{log.time}</Typography>
                          </Box>
                          <Typography sx={{ fontSize: "12px", color: "#6b7280" }}>{log.detail}</Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}
            </DialogContent>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", px: 3, py: 2, borderTop: "1px solid #f3f4f6" }}>
              <Button size="small" startIcon={<PowerSettingsNew sx={{ fontSize: 14 }} />} onClick={() => detailMat && toggleDocStatus(detailMat)}
                sx={{ textTransform: "none", fontSize: "12px", color: detailMat.stdDoc.docStatus === "enabled" ? "#f59e0b" : "#10b981", border: `1px solid ${detailMat.stdDoc.docStatus === "enabled" ? "#fde68a" : "#bbf7d0"}`, borderRadius: "7px", px: 1.5, "&:hover": { bgcolor: detailMat.stdDoc.docStatus === "enabled" ? "#fef3c7" : "#f0fdf4" } }}>
                {detailMat.stdDoc.docStatus === "enabled" ? "停用此文档" : "重新启用"}
              </Button>
              <Button onClick={() => setDetailMat(null)} sx={{ textTransform: "none", color: "#374151", borderRadius: "7px", fontSize: "13px" }}>关闭</Button>
            </Box>
          </>
        )}
      </Dialog>

      {/* Reprocess confirm */}
      <Dialog open={!!reprocessConfirm} onClose={() => setReprocessConfirm(null)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: "12px" } }}>
        <DialogTitle sx={{ fontSize: "15px", fontWeight: 700, py: 2, px: 3 }}>确认重新处理</DialogTitle>
        <DialogContent sx={{ px: 3 }}>
          <Alert severity="warning" sx={{ bgcolor: "#fffbeb", color: "#92400e", border: "1px solid #fde68a", borderRadius: "8px", "& .MuiAlert-message": { fontSize: "13px", lineHeight: 1.7 }, "& .MuiAlert-icon": { color: "#f59e0b" } }}>
            重新处理后，原有标准化文档将被覆盖且不可恢复，是否继续？
          </Alert>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button onClick={() => setReprocessConfirm(null)} sx={{ textTransform: "none", color: "#374151", borderRadius: "7px", px: 2, fontSize: "13px" }}>取消</Button>
          <Button variant="contained" onClick={() => { doProcess([reprocessConfirm!.id]); setReprocessConfirm(null); }}
            sx={{ bgcolor: "#f59e0b", borderRadius: "7px", textTransform: "none", px: 2.5, fontSize: "13px", boxShadow: "none", "&:hover": { bgcolor: "#d97706", boxShadow: "none" } }}>
            确认覆盖并处理
          </Button>
        </DialogActions>
      </Dialog>

      {/* Build dialog */}
      <Dialog open={buildOpen} onClose={() => setBuildOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: "14px" } }}>
        <DialogTitle sx={{ fontSize: "15px", fontWeight: 700, borderBottom: "1px solid #f3f4f6", py: 2, px: 3 }}>发起知识构建</DialogTitle>
        <DialogContent sx={{ px: 3, pt: 2.5, pb: 1 }}>
          <Alert severity="info" icon={<InfoOutlined sx={{ fontSize: 15 }} />}
            sx={{ mb: 2, bgcolor: "#eff6ff", color: "#1e40af", border: "1px solid #bfdbfe", borderRadius: "8px", "& .MuiAlert-message": { fontSize: "12px" }, "& .MuiAlert-icon": { color: "#3b82f6" } }}>
            请先选择知识类目，再选择知识形态，顺序不可颠倒
          </Alert>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel sx={{ fontSize: "13px" }}>知识类目</InputLabel>
              <Select value={buildCat} onChange={e => { setBuildCat(e.target.value); setBuildForm(""); }} label="知识类目"
                sx={{ borderRadius: "8px", fontSize: "13px", "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e8eaed" } }}>
                {["产品知识 > 理财产品", "产品知识 > 信用卡产品", "业务流程 > 开户流程", "风控规则"].map(c => (
                  <MenuItem key={c} value={c} sx={{ fontSize: "13px" }}>{c}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth size="small" disabled={!buildCat}>
              <InputLabel sx={{ fontSize: "13px" }}>知识形态</InputLabel>
              <Select value={buildForm} onChange={e => setBuildForm(e.target.value)} label="知识形态"
                sx={{ borderRadius: "8px", fontSize: "13px", "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e8eaed" } }}>
                <MenuItem value="问答库" sx={{ fontSize: "13px" }}>问答库（QA）</MenuItem>
                <MenuItem value="术语" sx={{ fontSize: "13px" }}>术语</MenuItem>
                <MenuItem value="非结构化切片" sx={{ fontSize: "13px" }}>非结构化切片</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ borderTop: "1px solid #f3f4f6", px: 3, py: 2, gap: 1 }}>
          <Button onClick={() => setBuildOpen(false)} sx={{ textTransform: "none", color: "#374151", borderRadius: "7px", px: 2, fontSize: "13px" }}>取消</Button>
          <Button variant="contained" onClick={handleBuild} disabled={!buildCat || !buildForm}
            sx={{ bgcolor: "#7c3aed", borderRadius: "7px", textTransform: "none", px: 2.5, fontSize: "13px", boxShadow: "none", "&:hover": { bgcolor: "#6d28d9", boxShadow: "none" } }}>
            前往构建
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={toast.open} autoHideDuration={3000} onClose={() => setToast(t => ({ ...t, open: false }))} anchorOrigin={{ vertical: "top", horizontal: "center" }}>
        <Alert severity={toast.sev} onClose={() => setToast(t => ({ ...t, open: false }))} sx={{ borderRadius: "8px", boxShadow: "0 4px 12px rgba(0,0,0,0.15)", fontSize: "13px" }}>{toast.msg}</Alert>
      </Snackbar>
    </Box>
  );
}