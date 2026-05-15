import { useState, useEffect, useMemo } from "react";
import { useOutletContext } from "react-router";
import {
  Box, Typography, Button, Chip, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Dialog, DialogTitle, DialogContent, DialogActions,
  IconButton, Paper, Alert, TextField, Select, MenuItem, FormControl,
  LinearProgress, Tooltip, Checkbox, Snackbar, Tabs, Tab, Drawer, Divider,
} from "@mui/material";
import {
  CloudUpload, Delete, InsertDriveFile, Search, Close,
  CheckCircle, ErrorOutline, HourglassEmpty, PowerSettingsNew, Visibility,
  Refresh, Upload, Article, Tag, TextSnippet, Source, History as HistoryIcon,
  PlayArrow, FileCopy, AccountTree, Settings, Hub,
} from "@mui/icons-material";
import { Project } from "../types";

type UploadStatus = "uploading" | "uploaded" | "failed" | "disabled";
type ParseStatus = "pending" | "processing" | "completed" | "failed";

interface StdDoc {
  id: string; summary: string; parsedContent: string;
  charCount: number; layoutType: string; processingMethod: string;
  processedAt: string; docStatus: "enabled" | "disabled"; isReferenced: boolean;
  processingLogs: { time: string; step: string; detail: string }[];
}

interface FileItem {
  id: string; name: string; format: string; sizeMB: number;
  uploader: string; uploadTime: string;
  uploadStatus: UploadStatus; parseStatus: ParseStatus;
  uploadFailReason?: string; parseFailReason?: string;
  stdDoc?: StdDoc;
}

const SUPPORTED_FMTS = ["md", "txt", "xlsx", "xls"];
const MAX_SIZE_MB = 10;
const SECONDARY_DRAWER_Z_INDEX = 1600;
const MAX_FILES = 10;

const INIT_FILES: FileItem[] = [
  { id: "f1", name: "金融产品使用手册.md", format: "md", sizeMB: 1.24, uploader: "李静",
    uploadTime: new Date(Date.now() - 86400000 * 3).toISOString(),
    uploadStatus: "uploaded", parseStatus: "completed",
    stdDoc: { id: "sd1", docStatus: "enabled", isReferenced: true, layoutType: "纯文本",
      processingMethod: "Markdown解析器 + 段落清洗", charCount: 12400,
      processedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      summary: "本手册为金融产品的完整使用指引，涵盖申请条件、操作流程、常见问题解答及注意事项。",
      parsedContent: "# 金融产品使用手册 V2.3\n\n## 第一章 产品介绍\n\n本行理财产品涵盖固定收益类、浮动收益类及结构性产品三大类型。",
      processingLogs: [
        { time: "10:23:01", step: "文件解析", detail: "Markdown 格式识别成功，共解析 47 个段落、3 个表格" },
        { time: "10:23:07", step: "处理完成", detail: "标准化文档生成成功，状态设为启用" },
      ],
    },
  },
  { id: "f2", name: "产品FAQ汇总2024.xlsx", format: "xlsx", sizeMB: 0.87, uploader: "王鹏",
    uploadTime: new Date(Date.now() - 86400000 * 2).toISOString(),
    uploadStatus: "uploaded", parseStatus: "completed",
    stdDoc: { id: "sd2", docStatus: "enabled", isReferenced: false, layoutType: "表格为主",
      processingMethod: "Excel结构解析 + 内容归一化", charCount: 8760,
      processedAt: new Date(Date.now() - 86400000).toISOString(),
      summary: "本文档汇总了金融产品常见问题解答共 238 条，按业务类型分类：理财类 86 条、信用卡类 94 条、贷款类 58 条。",
      parsedContent: "## 产品FAQ汇总（2024版）\n\n### 理财产品类（86条）\n\n**Q001: 理财产品的申购起点金额是多少？**",
      processingLogs: [
        { time: "14:05:22", step: "文件解析", detail: "Excel 文件共 3 个 Sheet，识别有效数据行 238 条" },
        { time: "14:05:29", step: "处理完成", detail: "标准化文档生成成功，字符数：8,760 字" },
      ],
    },
  },
  { id: "f3", name: "理财业务规范v3.txt", format: "txt", sizeMB: 0.31, uploader: "李静",
    uploadTime: new Date(Date.now() - 86400000 * 2 + 3600000).toISOString(),
    uploadStatus: "uploaded", parseStatus: "completed",
    stdDoc: { id: "sd3", docStatus: "enabled", isReferenced: false, layoutType: "纯文本",
      processingMethod: "纯文本解析 + 段落分割", charCount: 5230,
      processedAt: new Date(Date.now() - 86400000 + 3600000).toISOString(),
      summary: "本规范定义了理财业务操作的标准流程和合规要求，共 5 个章节。",
      parsedContent: "# 理财业务规范 V3.0\n\n## 第一章 总则\n\n本规范依据《商业银行理财业务监督管理办法》制定。",
      processingLogs: [
        { time: "09:15:00", step: "文件解析", detail: "TXT 文件编码 UTF-8，共 5,230 个字符" },
        { time: "09:15:03", step: "处理完成", detail: "标准化文档生成成功" },
      ],
    },
  },
  { id: "f4", name: "信用卡业务手册_202501.md", format: "md", sizeMB: 2.15, uploader: "陈晨",
    uploadTime: new Date(Date.now() - 86400000).toISOString(),
    uploadStatus: "uploaded", parseStatus: "processing",
  },
  { id: "f5", name: "风控流程说明_最新版.md", format: "md", sizeMB: 1.08, uploader: "王鹏",
    uploadTime: new Date(Date.now() - 86400000 + 7200000).toISOString(),
    uploadStatus: "uploaded", parseStatus: "pending",
  },
  { id: "f6", name: "客户投诉处理规程.xlsx", format: "xlsx", sizeMB: 0.64, uploader: "李静",
    uploadTime: new Date(Date.now() - 3600000 * 8).toISOString(),
    uploadStatus: "uploaded", parseStatus: "failed",
    parseFailReason: "文件内容解析异常：段落结构识别失败，可能存在内容损坏或不受支持的内部排版格式，建议重新导出后上传",
  },
  { id: "f7", name: "知识库建设标准_v2.txt", format: "txt", sizeMB: 0.42, uploader: "陈晨",
    uploadTime: new Date(Date.now() - 3600000 * 5).toISOString(),
    uploadStatus: "uploaded", parseStatus: "completed",
    stdDoc: { id: "sd4", docStatus: "disabled", isReferenced: false, layoutType: "纯文本",
      processingMethod: "纯文本解析 + 段落分割", charCount: 3140,
      processedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      summary: "本文档为知识库建设标准（第二版），已被停用，请参考最新版本。",
      parsedContent: "# 知识库建设标准 V2（已停用）\n\n## 适用范围\n本标准适用于……",
      processingLogs: [
        { time: "11:30:00", step: "文件解析", detail: "TXT 文件解析完成，共 3,140 字符" },
        { time: "11:30:01", step: "处理完成", detail: "标准化文档生成成功（现已停用）" },
      ],
    },
  },
  { id: "f8", name: "老版合规文件2022.md", format: "md", sizeMB: 0.93, uploader: "王鹏",
    uploadTime: new Date(Date.now() - 86400000 * 7).toISOString(),
    uploadStatus: "disabled", parseStatus: "pending",
  },
  { id: "f9", name: "保险产品手册Q1.xlsx", format: "xlsx", sizeMB: 1.76, uploader: "李静",
    uploadTime: new Date(Date.now() - 3600000 * 2).toISOString(),
    uploadStatus: "uploading", parseStatus: "pending",
  },
  { id: "f10", name: "贷款产品说明书.txt", format: "txt", sizeMB: 0.56, uploader: "陈晨",
    uploadTime: new Date(Date.now() - 3600000).toISOString(),
    uploadStatus: "uploaded", parseStatus: "pending",
  },
];

const UPLOAD_META: Record<UploadStatus, { label: string; bg: string; color: string; dot: string }> = {
  uploading: { label: "上传中", bg: "#eff6ff", color: "#1d4ed8", dot: "#60a5fa" },
  uploaded:  { label: "已上传", bg: "#f0fdf4", color: "#15803d", dot: "#4ade80" },
  failed:    { label: "上传失败", bg: "#fef2f2", color: "#b91c1c", dot: "#f87171" },
  disabled:  { label: "已停用", bg: "#f9fafb", color: "#6b7280", dot: "#d1d5db" },
};
const PARSE_META: Record<ParseStatus, { label: string; bg: string; color: string; dot: string }> = {
  pending:    { label: "待解析", bg: "#f1f5f9", color: "#475569", dot: "#94a3b8" },
  processing: { label: "解析中", bg: "#eff6ff", color: "#1d4ed8", dot: "#60a5fa" },
  completed:  { label: "已解析", bg: "#f0fdf4", color: "#15803d", dot: "#4ade80" },
  failed:     { label: "解析失败", bg: "#fef2f2", color: "#b91c1c", dot: "#f87171" },
};

const fmtSize = (mb: number) => mb >= 1 ? `${mb.toFixed(2)} MB` : `${(mb * 1024).toFixed(0)} KB`;
const fmtTime = (iso: string) => {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleString("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
};

export function FileUploadPage() {
  const { project } = useOutletContext<{ project: Project }>();
  const key = `fileItems_${project.id}`;

  const [files, setFiles] = useState<FileItem[]>(() => {
    try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : INIT_FILES; } catch { return INIT_FILES; }
  });
  const save = (d: FileItem[]) => { setFiles(d); localStorage.setItem(key, JSON.stringify(d)); };

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [filterQ, setFilterQ] = useState("");
  const [filterUpload, setFilterUpload] = useState("all");
  const [filterParse, setFilterParse] = useState("all");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<{ file: File; err?: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string[] | null>(null);
  const [detailFile, setDetailFile] = useState<FileItem | null>(null);
  const [chainFile, setChainFile] = useState<FileItem | null>(null);
  const [chainTab, setChainTab] = useState(0);
  const [detailTab, setDetailTab] = useState(0);
  const [parsing, setParsing] = useState(false);
  const [toast, setToast] = useState({ open: false, msg: "", sev: "success" as "success" | "error" | "warning" });
  const showToast = (msg: string, sev: "success" | "error" | "warning" = "success") => setToast({ open: true, msg, sev });

  // Simulate uploading → uploaded
  useEffect(() => {
    const uploadingItems = files.filter(f => f.uploadStatus === "uploading");
    if (!uploadingItems.length) return;
    const t = setTimeout(() => save(files.map(f =>
      f.uploadStatus === "uploading" ? { ...f, uploadStatus: "uploaded" as UploadStatus } : f
    )), 4000);
    return () => clearTimeout(t);
  }, [files.filter(f => f.uploadStatus === "uploading").length]);

  const filtered = useMemo(() => files.filter(f => {
    if (filterUpload !== "all" && f.uploadStatus !== filterUpload) return false;
    if (filterParse !== "all" && f.parseStatus !== filterParse) return false;
    if (filterQ && !f.name.toLowerCase().includes(filterQ.toLowerCase())) return false;
    return true;
  }).sort((a, b) => new Date(b.uploadTime).getTime() - new Date(a.uploadTime).getTime()), [files, filterUpload, filterParse, filterQ]);

  const stats = useMemo(() => ({
    total: files.length,
    uploaded: files.filter(f => f.uploadStatus === "uploaded").length,
    parsedDone: files.filter(f => f.parseStatus === "completed").length,
    parseEnabled: files.filter(f => f.stdDoc?.docStatus === "enabled").length,
  }), [files]);

  const validateFile = (f: File): string | undefined => {
    const ext = f.name.split(".").pop()?.toLowerCase() ?? "";
    if (!SUPPORTED_FMTS.includes(ext)) return `不支持 .${ext}，仅支持 ${SUPPORTED_FMTS.join(" / ")}`;
    if (f.size > MAX_SIZE_MB * 1048576) return `超过 ${MAX_SIZE_MB}MB 限制`;
    if (f.size === 0) return "文件内容为空";
    return undefined;
  };

  const addFiles = (fl: FileList | null) => {
    if (!fl) return;
    const arr = Array.from(fl);
    if (pendingFiles.length + arr.length > MAX_FILES) { showToast(`单次最多 ${MAX_FILES} 个文件`, "warning"); return; }
    setPendingFiles(prev => [...prev, ...arr.map(f => ({ file: f, err: validateFile(f) }))]);
  };

  const handleUpload = async () => {
    const valid = pendingFiles.filter(f => !f.err);
    if (!valid.length) return;
    setUploading(true);
    const user = (() => { try { return JSON.parse(localStorage.getItem("currentUser") ?? "{}").displayName || "运营员"; } catch { return "运营员"; } })();
    for (let i = 0; i < valid.length; i++) {
      await new Promise(r => setTimeout(r, 300));
      setProgress(Math.round((i + 1) / valid.length * 100));
    }
    const newFiles: FileItem[] = valid.map((vf, i) => ({
      id: `f_${Date.now()}_${i}`, name: vf.file.name,
      format: vf.file.name.split(".").pop()?.toLowerCase() ?? "txt",
      sizeMB: vf.file.size / 1048576, uploader: user,
      uploadTime: new Date().toISOString(),
      uploadStatus: "uploading" as UploadStatus,
      parseStatus: "pending" as ParseStatus,
    }));
    save([...files, ...newFiles]);
    setUploading(false); setUploadOpen(false); setPendingFiles([]); setProgress(0);
    showToast(`已提交 ${newFiles.length} 个文件上传任务`);
  };

  const doParse = async (ids: string[]) => {
    const toParse = files.filter(f => ids.includes(f.id) && f.parseStatus !== "processing" && f.uploadStatus === "uploaded");
    if (!toParse.length) return;
    setParsing(true);
    save(files.map(f => toParse.find(t => t.id === f.id) ? { ...f, parseStatus: "processing" as ParseStatus } : f));
    await new Promise(r => setTimeout(r, 1800));
    const now = new Date().toISOString();
    const logTime = new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    save(files.map(f => {
      const t = toParse.find(t => t.id === f.id);
      if (!t) return f;
      const methods: Record<string, string> = { md: "Markdown解析器 + 段落清洗", txt: "纯文本解析 + 段落分割", xlsx: "Excel结构解析 + 内容归一化", xls: "Excel结构解析 + 内容归一化" };
      const layouts: Record<string, string> = { md: "图文混排", txt: "纯文本", xlsx: "表格为主", xls: "表格为主" };
      const charCounts: Record<string, number> = { md: 9800, txt: 4200, xlsx: 6300, xls: 6300 };
      const cc = charCounts[t.format] ?? 5000;
      return {
        ...f, parseStatus: "completed" as ParseStatus,
        stdDoc: {
          id: `sd_${f.id}`, docStatus: "enabled" as "enabled" | "disabled", isReferenced: false,
          processingMethod: methods[t.format] ?? "通用文本解析", layoutType: layouts[t.format] ?? "纯文本",
          charCount: cc, processedAt: now,
          summary: `本文档「${t.name}」经标准化处理后生成，共 ${cc.toLocaleString()} 字，可用于后续知识构建。`,
          parsedContent: `# ${t.name}\n\n（已完成标准化处理）\n\n## 第一节 概述\n\n本文档由「${t.uploader}」上传，已通过标准化处理。`,
          processingLogs: [
            { time: logTime, step: "文件解析", detail: `${t.format.toUpperCase()} 格式识别成功，开始内容提取` },
            { time: logTime, step: "内容清洗", detail: "清洗页眉页脚、去除重复内容、处理特殊字符" },
            { time: logTime, step: "格式转换", detail: "统一转换为标准文档格式，保留结构层级" },
            { time: logTime, step: "处理完成", detail: `标准化文档生成成功，字符数：${cc.toLocaleString()} 字` },
          ],
        },
      };
    }));
    setParsing(false); setSelected(new Set());
    showToast(`${toParse.length} 份文件解析处理完成`);
  };

  const doReUpload = (id: string) => {
    save(files.map(f => f.id === id ? { ...f, uploadStatus: "uploading" as UploadStatus, parseStatus: "pending" as ParseStatus, stdDoc: undefined } : f));
    showToast("已重新提交上传任务");
  };

  const toggleDocStatus = (id: string) => {
    save(files.map(f => f.id === id && f.stdDoc ? { ...f, stdDoc: { ...f.stdDoc, docStatus: f.stdDoc.docStatus === "enabled" ? "disabled" : "enabled" } } : f));
    showToast("文档状态已切换");
  };

  const doDelete = (ids: string[]) => {
    const canDelete = files.filter(f => ids.includes(f.id) && f.uploadStatus !== "uploading");
    if (canDelete.length < ids.length) showToast(`上传中的文件无法删除，已跳过 ${ids.length - canDelete.length} 个`, "warning");
    if (!canDelete.length) { setDeleteConfirm(null); return; }
    save(files.filter(f => !canDelete.map(c => c.id).includes(f.id)));
    setSelected(new Set()); setDeleteConfirm(null);
    showToast(`已删除 ${canDelete.length} 条记录`);
  };

  const allSel = filtered.length > 0 && filtered.every(f => selected.has(f.id));
  const toggleAll = () => setSelected(allSel ? new Set() : new Set(filtered.map(f => f.id)));
  const toggleOne = (id: string) => setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const selArr = [...selected];

  const canParseSelected = selArr.filter(id => {
    const f = files.find(f => f.id === id);
    return f && f.uploadStatus === "uploaded" && f.parseStatus !== "processing";
  });

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2.5 }}>
        <Box>
          <Typography sx={{ fontSize: "18px", fontWeight: 700, color: "#111827" }}>文件上传</Typography>
          <Typography sx={{ fontSize: "13px", color: "#94a3b8", mt: 0.25 }}>上传原始材料文件，并自动进行标准化解析处理，为知识构建提供输入</Typography>
        </Box>
        <Button variant="contained" startIcon={<CloudUpload sx={{ fontSize: 16 }} />} onClick={() => setUploadOpen(true)}
          sx={{ bgcolor: "#7c3aed", borderRadius: "8px", textTransform: "none", fontSize: "13px", px: 2.5, py: 0.875, boxShadow: "none", "&:hover": { bgcolor: "#6d28d9", boxShadow: "none" } }}>
          上传文件
        </Button>
      </Box>

      {/* Stats */}
      <Box sx={{ display: "flex", gap: 1.5, mb: 2.5, flexWrap: "wrap" }}>
        {[
          { label: "文件总数", val: stats.total, color: "#374151", bg: "#fff" },
          { label: "已上传", val: stats.uploaded, color: "#15803d", bg: "#f0fdf4" },
          { label: "解析完成", val: stats.parsedDone, color: "#5b21b6", bg: "#f5f3ff" },
          { label: "启用文档", val: stats.parseEnabled, color: "#1d4ed8", bg: "#eff6ff" },
        ].map(s => (
          <Paper key={s.label} sx={{ px: 2.5, py: 1.5, border: "1px solid #e8eaed", borderRadius: "10px", boxShadow: "none", bgcolor: s.bg, minWidth: 90 }}>
            <Typography sx={{ fontSize: "22px", fontWeight: 700, color: s.color, lineHeight: 1.1 }}>{s.val}</Typography>
            <Typography sx={{ fontSize: "11px", color: "#9ca3af", mt: 0.25 }}>{s.label}</Typography>
          </Paper>
        ))}
      </Box>

      {parsing && (
        <Alert severity="info" icon={<Article sx={{ fontSize: 15 }} />}
          sx={{ mb: 2, bgcolor: "#eff6ff", color: "#1e40af", border: "1px solid #bfdbfe", borderRadius: "8px", py: 0.75, "& .MuiAlert-message": { width: "100%", fontSize: "12px" } }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography sx={{ fontSize: "12px" }}>正在执行标准化解析，请稍候…</Typography>
            <LinearProgress sx={{ flex: 1, borderRadius: "4px", "& .MuiLinearProgress-bar": { bgcolor: "#7c3aed" } }} />
          </Box>
        </Alert>
      )}

      {/* Filter row */}
      <Box sx={{ display: "flex", gap: 1.5, mb: 1.75, alignItems: "center", flexWrap: "wrap" }}>
        <Box sx={{ position: "relative", flex: 1, minWidth: 180 }}>
          <Search sx={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontSize: 16, color: "#94a3b8" }} />
          <TextField size="small" placeholder="搜索文件名" value={filterQ} onChange={e => setFilterQ(e.target.value)}
            sx={{ width: "100%", "& .MuiOutlinedInput-root": { pl: "32px", borderRadius: "8px", fontSize: "13px", bgcolor: "#fff", "& fieldset": { borderColor: "#e8eaed" } } }} />
        </Box>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <Select value={filterUpload} onChange={e => setFilterUpload(e.target.value)} displayEmpty
            sx={{ borderRadius: "8px", fontSize: "13px", bgcolor: "#fff", "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e8eaed" } }}>
            <MenuItem value="all" sx={{ fontSize: "13px" }}>上传状态：全部</MenuItem>
            {Object.entries(UPLOAD_META).map(([v, m]) => <MenuItem key={v} value={v} sx={{ fontSize: "13px" }}>{m.label}</MenuItem>)}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <Select value={filterParse} onChange={e => setFilterParse(e.target.value)} displayEmpty
            sx={{ borderRadius: "8px", fontSize: "13px", bgcolor: "#fff", "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e8eaed" } }}>
            <MenuItem value="all" sx={{ fontSize: "13px" }}>解析状态：全部</MenuItem>
            {Object.entries(PARSE_META).map(([v, m]) => <MenuItem key={v} value={v} sx={{ fontSize: "13px" }}>{m.label}</MenuItem>)}
          </Select>
        </FormControl>
        {selArr.length > 0 && (
          <Box sx={{ display: "flex", gap: 1 }}>
            {canParseSelected.length > 0 && (
              <Button size="small" startIcon={<PlayArrow sx={{ fontSize: 14 }} />} onClick={() => doParse(canParseSelected)} disabled={parsing}
                sx={{ borderRadius: "7px", textTransform: "none", fontSize: "12px", color: "#5b21b6", border: "1px solid #ddd6fe", bgcolor: "#f5f3ff", px: 1.5, "&:hover": { bgcolor: "#ede9fe" } }}>
                批量解析 ({canParseSelected.length})
              </Button>
            )}
            <Button size="small" startIcon={<Delete sx={{ fontSize: 14 }} />} onClick={() => setDeleteConfirm(selArr)}
              sx={{ borderRadius: "7px", textTransform: "none", fontSize: "12px", color: "#ef4444", border: "1px solid #fecaca", bgcolor: "#fef2f2", px: 1.5, "&:hover": { bgcolor: "#fee2e2" } }}>
              批量删除 ({selArr.length})
            </Button>
          </Box>
        )}
      </Box>

      {/* Table */}
      <Paper sx={{ border: "1px solid #e8eaed", borderRadius: "10px", boxShadow: "none", overflow: "hidden" }}>
        {filtered.length === 0 ? (
          <Box sx={{ py: 12, textAlign: "center" }}>
            <InsertDriveFile sx={{ fontSize: 48, color: "#e8eaed", mb: 1.5 }} />
            <Typography sx={{ fontSize: "14px", color: "#9ca3af" }}>暂无文件，点击「上传文件」开始</Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: "#f8f9fb" }}>
                  <TableCell padding="checkbox" sx={{ pl: 2 }}>
                    <Checkbox size="small" checked={allSel} onChange={toggleAll} sx={{ color: "#d1d5db" }} />
                  </TableCell>
                  {["文件名称", "格式", "大小", "上传人", "上传时间", "上传状态", "解析状态", "操作"].map(h => (
                    <TableCell key={h} sx={{ fontSize: "12px", fontWeight: 600, color: "#6b7280", py: 1.5, borderBottom: "1px solid #f0f0f0", whiteSpace: "nowrap" }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((f, idx) => {
                  const um = UPLOAD_META[f.uploadStatus];
                  const pm = PARSE_META[f.parseStatus];
                  const isSel = selected.has(f.id);
                  return (
                    <TableRow key={f.id} sx={{ bgcolor: isSel ? "#faf5ff" : idx % 2 === 0 ? "#fff" : "#fafafa", "&:hover": { bgcolor: "#f5f3ff20" }, "& td": { borderBottom: "1px solid #f5f5f5" } }}>
                      <TableCell padding="checkbox" sx={{ pl: 2 }}>
                        <Checkbox size="small" checked={isSel} onChange={() => toggleOne(f.id)} sx={{ color: "#d1d5db" }} />
                      </TableCell>
                      <TableCell sx={{ py: 1.5 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Box sx={{ width: 32, height: 32, borderRadius: "6px", bgcolor: "#f5f3ff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <InsertDriveFile sx={{ fontSize: 16, color: "#7c3aed" }} />
                          </Box>
                          <Typography sx={{ fontSize: "13px", color: "#111827", fontWeight: 500, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell><Chip label={`.${f.format.toUpperCase()}`} size="small" sx={{ height: 20, fontSize: "11px", bgcolor: "#f1f5f9", color: "#475569", border: "none", "& .MuiChip-label": { px: 0.75 } }} /></TableCell>
                      <TableCell sx={{ fontSize: "12px", color: "#6b7280" }}>{fmtSize(f.sizeMB)}</TableCell>
                      <TableCell sx={{ fontSize: "12px", color: "#6b7280" }}>{f.uploader}</TableCell>
                      <TableCell sx={{ fontSize: "12px", color: "#6b7280", whiteSpace: "nowrap" }}>{fmtTime(f.uploadTime)}</TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                          <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: um.dot }} />
                          <Typography sx={{ fontSize: "12px", color: um.color, fontWeight: 500 }}>{um.label}</Typography>
                          {f.uploadFailReason && <Tooltip title={f.uploadFailReason} arrow><ErrorOutline sx={{ fontSize: 13, color: "#ef4444", cursor: "help" }} /></Tooltip>}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                          <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: pm.dot }} />
                          <Typography sx={{ fontSize: "12px", color: pm.color, fontWeight: 500 }}>{pm.label}</Typography>
                          {f.parseFailReason && <Tooltip title={f.parseFailReason} arrow><ErrorOutline sx={{ fontSize: 13, color: "#ef4444", cursor: "help" }} /></Tooltip>}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", gap: 0.5 }}>
                          {/* 查看详情 */}
                          {f.stdDoc && (
                            <Tooltip title="查看详情" arrow>
                              <IconButton size="small" onClick={() => { setDetailFile(f); setDetailTab(0); }}
                                sx={{ width: 26, height: 26, borderRadius: "6px", color: "#9ca3af", "&:hover": { color: "#7c3aed", bgcolor: "#f5f3ff" } }}>
                                <Visibility sx={{ fontSize: 14 }} />
                              </IconButton>
                            </Tooltip>
                          )}
                          <Tooltip title="处理链路" arrow>
                            <IconButton size="small" onClick={() => { setChainFile(f); setChainTab(0); }}
                              sx={{ width: 26, height: 26, borderRadius: "6px", color: "#9ca3af", "&:hover": { color: "#7c3aed", bgcolor: "#f5f3ff" } }}>
                              <AccountTree sx={{ fontSize: 14 }} />
                            </IconButton>
                          </Tooltip>
                          {/* 启用/停用 */}
                          {f.uploadStatus !== "uploading" && (
                            <Tooltip title={f.uploadStatus === "disabled" ? "启用" : "停用"} arrow>
                              <IconButton size="small" onClick={() => {
                                save(files.map(fi => fi.id === f.id ? { ...fi, uploadStatus: fi.uploadStatus === "disabled" ? "uploaded" : "disabled" as UploadStatus } : fi));
                                showToast("状态已切换");
                              }} sx={{ width: 26, height: 26, borderRadius: "6px", color: f.uploadStatus === "disabled" ? "#10b981" : "#9ca3af", "&:hover": { bgcolor: "#f9fafb" } }}>
                                <PowerSettingsNew sx={{ fontSize: 14 }} />
                              </IconButton>
                            </Tooltip>
                          )}
                          {/* 重新上传 */}
                          {f.uploadStatus !== "uploading" && (
                            <Tooltip title="重新上传" arrow>
                              <IconButton size="small" onClick={() => doReUpload(f.id)}
                                sx={{ width: 26, height: 26, borderRadius: "6px", color: "#9ca3af", "&:hover": { color: "#7c3aed", bgcolor: "#f5f3ff" } }}>
                                <Upload sx={{ fontSize: 14 }} />
                              </IconButton>
                            </Tooltip>
                          )}
                          {/* 重新解析 */}
                          {f.uploadStatus === "uploaded" && f.parseStatus !== "processing" && (
                            <Tooltip title={f.stdDoc?.isReferenced ? "已被引用，无法重新解析" : "重新解析"} arrow>
                              <span>
                                <IconButton size="small" disabled={f.stdDoc?.isReferenced} onClick={() => doParse([f.id])}
                                  sx={{ width: 26, height: 26, borderRadius: "6px", color: "#9ca3af", "&:hover": { color: "#10b981", bgcolor: "#f0fdf4" }, "&.Mui-disabled": { color: "#e5e7eb" } }}>
                                  <Refresh sx={{ fontSize: 14 }} />
                                </IconButton>
                              </span>
                            </Tooltip>
                          )}
                          {/* 删除 */}
                          {f.uploadStatus !== "uploading" && (
                            <Tooltip title="删除" arrow>
                              <IconButton size="small" onClick={() => setDeleteConfirm([f.id])}
                                sx={{ width: 26, height: 26, borderRadius: "6px", color: "#9ca3af", "&:hover": { color: "#ef4444", bgcolor: "#fef2f2" } }}>
                                <Delete sx={{ fontSize: 14 }} />
                              </IconButton>
                            </Tooltip>
                          )}
                          {f.uploadStatus === "uploading" && <HourglassEmpty sx={{ fontSize: 14, color: "#60a5fa" }} />}
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        <Box sx={{ px: 2.5, py: 1.25, borderTop: "1px solid #f5f5f5", bgcolor: "#fafafa", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography sx={{ fontSize: "12px", color: "#9ca3af" }}>共 {filtered.length} 条 · 已选 {selected.size} 条</Typography>
        </Box>
      </Paper>

      {/* Upload Dialog */}
      <Dialog open={uploadOpen} onClose={() => !uploading && setUploadOpen(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: "14px", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" } }}>
        <DialogTitle sx={{ fontSize: "15px", fontWeight: 700, color: "#111827", borderBottom: "1px solid #f3f4f6", py: 2, px: 3 }}>
          上传原始材料
        </DialogTitle>
        <DialogContent sx={{ px: 3, pt: 2.5, pb: 1 }}>
          <Box onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
            onClick={() => document.getElementById("fi-upload")?.click()}
            sx={{ border: `2px dashed ${dragOver ? "#7c3aed" : "#d1d5db"}`, borderRadius: "10px", p: 4, textAlign: "center", cursor: "pointer", bgcolor: dragOver ? "#faf5ff" : "#fafafa", transition: "all 0.15s", mb: 2, "&:hover": { borderColor: "#7c3aed", bgcolor: "#faf5ff" } }}>
            <input id="fi-upload" type="file" multiple hidden accept=".md,.txt,.xlsx,.xls" onChange={e => addFiles(e.target.files)} />
            <CloudUpload sx={{ fontSize: 44, color: "#a78bfa", mb: 1.5 }} />
            <Typography sx={{ fontSize: "14px", color: "#374151", mb: 0.5 }}>拖拽文件到此处，或 <span style={{ color: "#7c3aed", fontWeight: 600 }}>点击选择</span></Typography>
            <Typography sx={{ fontSize: "12px", color: "#9ca3af" }}>支持 .md / .txt / .xlsx / .xls，单文件 ≤ {MAX_SIZE_MB}MB</Typography>
          </Box>
          {pendingFiles.length > 0 && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75, mb: 1.5 }}>
              {pendingFiles.map((pf, i) => (
                <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 1, px: 1.25, py: 0.875, bgcolor: pf.err ? "#fef2f2" : "#f8f9fb", border: `1px solid ${pf.err ? "#fecaca" : "#e8eaed"}`, borderRadius: "8px" }}>
                  <InsertDriveFile sx={{ fontSize: 15, color: pf.err ? "#ef4444" : "#7c3aed", flexShrink: 0 }} />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontSize: "12px", color: "#374151", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{pf.file.name}</Typography>
                    {pf.err ? <Typography sx={{ fontSize: "11px", color: "#ef4444" }}>{pf.err}</Typography>
                      : <Typography sx={{ fontSize: "11px", color: "#9ca3af" }}>{fmtSize(pf.file.size / 1048576)}</Typography>}
                  </Box>
                  <IconButton size="small" onClick={() => setPendingFiles(prev => prev.filter((_, j) => j !== i))} sx={{ color: "#9ca3af", "&:hover": { color: "#ef4444" } }}>
                    <Close sx={{ fontSize: 14 }} />
                  </IconButton>
                </Box>
              ))}
            </Box>
          )}
          {uploading && <Box sx={{ mt: 1 }}><LinearProgress variant="determinate" value={progress} sx={{ borderRadius: "4px", "& .MuiLinearProgress-bar": { bgcolor: "#7c3aed" } }} /><Typography sx={{ fontSize: "11px", color: "#6b7280", mt: 0.5 }}>上传中 {progress}%</Typography></Box>}
        </DialogContent>
        <DialogActions sx={{ borderTop: "1px solid #f3f4f6", px: 3, py: 2, gap: 1 }}>
          <Button onClick={() => { setUploadOpen(false); setPendingFiles([]); }} disabled={uploading}
            sx={{ textTransform: "none", color: "#374151", borderRadius: "7px", px: 2, fontSize: "13px" }}>取消</Button>
          <Button variant="contained" onClick={handleUpload} disabled={!pendingFiles.filter(f => !f.err).length || uploading}
            sx={{ bgcolor: "#7c3aed", borderRadius: "7px", textTransform: "none", px: 2.5, fontSize: "13px", boxShadow: "none", "&:hover": { bgcolor: "#6d28d9", boxShadow: "none" } }}>
            确认上传（{pendingFiles.filter(f => !f.err).length}）
          </Button>
        </DialogActions>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={!!detailFile} onClose={() => setDetailFile(null)} maxWidth="md" fullWidth
        PaperProps={{ sx: { borderRadius: "14px", boxShadow: "0 24px 60px rgba(0,0,0,0.15)" } }}>
        {detailFile && (
          <>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 3, py: 2, borderBottom: "1px solid #f3f4f6" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <FileCopy sx={{ fontSize: 18, color: "#7c3aed" }} />
                <Typography sx={{ fontSize: "15px", fontWeight: 700, color: "#111827" }}>{detailFile.name}</Typography>
                {detailFile.stdDoc && (
                  <Chip label={detailFile.stdDoc.docStatus === "enabled" ? "启用" : "停用"} size="small"
                    sx={{ height: 20, fontSize: "11px", bgcolor: detailFile.stdDoc.docStatus === "enabled" ? "#f0fdf4" : "#f9fafb", color: detailFile.stdDoc.docStatus === "enabled" ? "#15803d" : "#6b7280", border: "none", "& .MuiChip-label": { px: 0.75 } }} />
                )}
              </Box>
              <IconButton size="small" onClick={() => setDetailFile(null)} sx={{ color: "#9ca3af" }}><Close sx={{ fontSize: 18 }} /></IconButton>
            </Box>
            <Box sx={{ borderBottom: "1px solid #f3f4f6", px: 3 }}>
              <Tabs value={detailTab} onChange={(_, v) => setDetailTab(v)}
                sx={{ "& .MuiTab-root": { fontSize: "13px", textTransform: "none", minHeight: 44, px: 0, mr: 3 }, "& .MuiTabs-indicator": { bgcolor: "#7c3aed" } }}>
                <Tab label="内容摘要" icon={<TextSnippet sx={{ fontSize: 14, mr: 0.5 }} />} iconPosition="start" />
                <Tab label="解析内容" icon={<Article sx={{ fontSize: 14, mr: 0.5 }} />} iconPosition="start" />
                <Tab label="来源追溯" icon={<Source sx={{ fontSize: 14, mr: 0.5 }} />} iconPosition="start" />
                <Tab label="处理记录" icon={<HistoryIcon sx={{ fontSize: 14, mr: 0.5 }} />} iconPosition="start" />
              </Tabs>
            </Box>
            <DialogContent sx={{ px: 3, py: 2.5, minHeight: 320 }}>
              {detailFile.stdDoc && detailTab === 0 && (
                <Box>
                  <Typography sx={{ fontSize: "12px", color: "#9ca3af", mb: 1 }}>内容摘要</Typography>
                  <Box sx={{ bgcolor: "#f8f9fb", border: "1px solid #e8eaed", borderRadius: "8px", p: 2, mb: 2 }}>
                    <Typography sx={{ fontSize: "13px", color: "#374151", lineHeight: 1.9 }}>{detailFile.stdDoc.summary}</Typography>
                  </Box>
                  <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
                    {[
                      { label: "处理方式", value: detailFile.stdDoc.processingMethod },
                      { label: "版面类型", value: detailFile.stdDoc.layoutType },
                      { label: "文字量", value: `约 ${detailFile.stdDoc.charCount.toLocaleString()} 字` },
                    ].map(f => (
                      <Box key={f.label} sx={{ flex: 1, minWidth: 140, p: 1.5, bgcolor: "#f8f9fb", border: "1px solid #e8eaed", borderRadius: "8px" }}>
                        <Typography sx={{ fontSize: "11px", color: "#9ca3af", mb: 0.5 }}>{f.label}</Typography>
                        <Typography sx={{ fontSize: "13px", color: "#374151", fontWeight: 500 }}>{f.value}</Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}
              {detailFile.stdDoc && detailTab === 1 && (
                <Box sx={{ bgcolor: "#1e293b", borderRadius: "8px", p: 2.5, maxHeight: 400, overflow: "auto" }}>
                  <Typography component="pre" sx={{ fontSize: "12px", color: "#e2e8f0", fontFamily: "monospace", whiteSpace: "pre-wrap", lineHeight: 1.8, m: 0 }}>
                    {detailFile.stdDoc.parsedContent}
                  </Typography>
                </Box>
              )}
              {detailTab === 2 && (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                  {[
                    { label: "文件名称", value: detailFile.name },
                    { label: "上传人", value: detailFile.uploader },
                    { label: "上传时间", value: fmtTime(detailFile.uploadTime) },
                    { label: "上传状态", value: UPLOAD_META[detailFile.uploadStatus].label },
                    { label: "解析状态", value: PARSE_META[detailFile.parseStatus].label },
                    ...(detailFile.stdDoc ? [{ label: "处理时间", value: fmtTime(detailFile.stdDoc.processedAt) }] : []),
                    ...(detailFile.stdDoc ? [{ label: "是否被引用", value: detailFile.stdDoc.isReferenced ? "是" : "否" }] : []),
                  ].map(f => (
                    <Box key={f.label} sx={{ display: "flex", gap: 2, py: 1, borderBottom: "1px solid #f5f5f5" }}>
                      <Typography sx={{ fontSize: "12px", color: "#9ca3af", minWidth: 100, flexShrink: 0 }}>{f.label}</Typography>
                      <Typography sx={{ fontSize: "13px", color: "#374151", fontWeight: 500 }}>{f.value}</Typography>
                    </Box>
                  ))}
                </Box>
              )}
              {detailFile.stdDoc && detailTab === 3 && (
                <Box>
                  <Typography sx={{ fontSize: "12px", color: "#9ca3af", mb: 1.5 }}>处理执行记录</Typography>
                  {detailFile.stdDoc.processingLogs.map((log, i) => (
                    <Box key={i} sx={{ display: "flex", gap: 2, py: 1.25, borderBottom: i < detailFile.stdDoc!.processingLogs.length - 1 ? "1px solid #f5f5f5" : "none" }}>
                      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                        <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: i === detailFile.stdDoc!.processingLogs.length - 1 ? "#10b981" : "#7c3aed", mt: 0.25 }} />
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.25 }}>
                          <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "#374151" }}>{log.step}</Typography>
                          <Typography sx={{ fontSize: "11px", color: "#9ca3af" }}>{log.time}</Typography>
                        </Box>
                        <Typography sx={{ fontSize: "12px", color: "#6b7280" }}>{log.detail}</Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}
            </DialogContent>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", px: 3, py: 2, borderTop: "1px solid #f3f4f6" }}>
              {detailFile.stdDoc && (
                <Button size="small" startIcon={<PowerSettingsNew sx={{ fontSize: 14 }} />}
                  onClick={() => { toggleDocStatus(detailFile.id); setDetailFile({ ...detailFile, stdDoc: { ...detailFile.stdDoc!, docStatus: detailFile.stdDoc!.docStatus === "enabled" ? "disabled" : "enabled" } }); }}
                  sx={{ textTransform: "none", fontSize: "12px", color: detailFile.stdDoc.docStatus === "enabled" ? "#f59e0b" : "#10b981", border: `1px solid ${detailFile.stdDoc.docStatus === "enabled" ? "#fde68a" : "#bbf7d0"}`, borderRadius: "7px", px: 1.5 }}>
                  {detailFile.stdDoc.docStatus === "enabled" ? "停用此文档" : "重新启用"}
                </Button>
              )}
              <Box sx={{ ml: "auto" }}>
                <Button onClick={() => setDetailFile(null)} sx={{ textTransform: "none", color: "#374151", borderRadius: "7px", fontSize: "13px" }}>关闭</Button>
              </Box>
            </Box>
          </>
        )}
      </Dialog>

      <Drawer anchor="right" open={!!chainFile} onClose={() => setChainFile(null)}
        ModalProps={{ sx: { zIndex: SECONDARY_DRAWER_Z_INDEX } }}
        slotProps={{ backdrop: { sx: { position: "fixed", inset: 0, zIndex: SECONDARY_DRAWER_Z_INDEX, bgcolor: "rgba(17, 24, 39, 0.48)" } } }}
        PaperProps={{ sx: { width: 620, maxWidth: "92vw", zIndex: SECONDARY_DRAWER_Z_INDEX + 1 } }}>
        {chainFile && (
          <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
            <Box sx={{ px: 3, py: 2.5, borderBottom: "1px solid #e8eaed", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <Box>
                <Typography sx={{ fontSize: "22px", fontWeight: 700, color: "#111827" }}>处理链路 · 过程追踪</Typography>
                <Typography sx={{ fontSize: "13px", color: "#64748b", mt: 0.5 }}>{chainFile.name}</Typography>
              </Box>
              <IconButton onClick={() => setChainFile(null)} sx={{ color: "#64748b" }}><Close sx={{ fontSize: 20 }} /></IconButton>
            </Box>

            <Box sx={{ px: 3, py: 2 }}>
              <Box sx={{ p: 2, border: "1px solid #dbe5f0", borderRadius: "12px", bgcolor: "#fbfdff", display: "flex", gap: 2, flexWrap: "wrap" }}>
                {[
                  ["文件格式", chainFile.format.toUpperCase()],
                  ["文件大小", fmtSize(chainFile.sizeMB)],
                  ["上传状态", UPLOAD_META[chainFile.uploadStatus].label],
                  ["处理状态", PARSE_META[chainFile.parseStatus].label],
                  ["上传时间", fmtTime(chainFile.uploadTime)],
                ].map(([label, value]) => (
                  <Box key={label} sx={{ minWidth: 90 }}>
                    <Typography sx={{ fontSize: "11px", color: "#94a3b8", mb: 0.3 }}>{label}</Typography>
                    <Typography sx={{ fontSize: "13px", color: "#334155", fontWeight: 600 }}>{value}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>

            <Box sx={{ px: 3, borderBottom: "1px solid #eef2f7" }}>
              <Tabs value={chainTab} onChange={(_, v) => setChainTab(v)}
                sx={{ "& .MuiTab-root": { textTransform: "none", fontSize: "13px", minHeight: 42 }, "& .MuiTabs-indicator": { bgcolor: "#7c3aed" } }}>
                <Tab label="文本切片" />
                <Tab label="问答库" />
                <Tab label="术语库" />
              </Tabs>
            </Box>

            <Box sx={{ flex: 1, overflow: "auto", px: 3, py: 2.5 }}>
              <Typography sx={{ fontSize: "13px", color: "#64748b", mb: 2 }}>
                当前显示：{chainTab === 0 ? "文本切片知识的标准化处理链路" : chainTab === 1 ? "问答库构建的工具执行链路" : "术语库构建的工具执行链路"}
              </Typography>
              {[
                { name: "原始文件接入", tool: "文档文字读取 v1.0.0", params: "无参数", state: "success", time: "10:23", result: "文件校验通过，进入标准化队列" },
                { name: chainTab === 0 ? "表格解析" : "内容解析", tool: "OCR 识别 v1.3.0", params: "模型 qwen3.5-plus，表格深度解析开启", state: chainFile.parseStatus === "failed" ? "failed" : chainFile.parseStatus === "pending" ? "pending" : "success", time: "10:24", result: chainFile.parseStatus === "failed" ? chainFile.parseFailReason ?? "解析异常" : "识别标题层级、文本段落和表格结构" },
                { name: chainTab === 0 ? "内容清洗" : chainTab === 1 ? "问答抽取" : "术语识别", tool: chainTab === 0 ? "内容清洗工具 v2.1.0" : chainTab === 1 ? "问答抽取 v1.0.0" : "术语识别 v0.9.0", params: chainTab === 0 ? "去重、去页眉页脚、保留层级" : "置信度阈值 0.75，最大抽取 50 对/文档", state: chainFile.parseStatus === "completed" ? "success" : chainFile.parseStatus === "processing" ? "running" : "pending", time: "10:25", result: chainTab === 0 ? "完成文本标准化" : "等待上游标准化内容" },
                { name: chainTab === 0 ? "文本切片结果生成" : chainTab === 1 ? "问答结果生成" : "术语结果生成", tool: chainTab === 0 ? "文本切片 v2.1.0" : chainTab === 1 ? "问答入库工具 v1.0.0" : "术语入库工具 v0.9.0", params: "按处理方案绑定版本执行", state: chainFile.parseStatus === "completed" && chainTab === 0 ? "success" : "pending", time: "10:26", result: chainTab === 0 && chainFile.stdDoc ? `生成标准化内容，约 ${chainFile.stdDoc.charCount.toLocaleString()} 字` : "待执行" },
              ].map((node, index) => {
                const meta = node.state === "success" ? { label: "成功", bg: "#dcfce7", color: "#166534", dot: "#22c55e" }
                  : node.state === "failed" ? { label: "失败", bg: "#fef2f2", color: "#b91c1c", dot: "#ef4444" }
                  : node.state === "running" ? { label: "执行中", bg: "#dbeafe", color: "#1d4ed8", dot: "#3b82f6" }
                  : { label: "待执行", bg: "#f1f5f9", color: "#64748b", dot: "#cbd5e1" };
                return (
                  <Box key={node.name} sx={{ display: "flex", gap: 1.5, pb: 1.5 }}>
                    <Box sx={{ width: 34, flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <Box sx={{ width: 30, height: 30, borderRadius: "50%", bgcolor: meta.dot, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: 700 }}>{index + 1}</Box>
                      {index < 3 && <Box sx={{ width: 1, flex: 1, bgcolor: "#e2e8f0", mt: 0.5 }} />}
                    </Box>
                    <Paper sx={{ flex: 1, p: 1.6, borderRadius: "10px", border: node.state === "failed" ? "1px solid #fecaca" : "1px solid #e2e8f0", boxShadow: "none", bgcolor: node.state === "failed" ? "#fff7f7" : "#fff" }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.6 }}>
                        <Typography sx={{ fontSize: "15px", fontWeight: 700, color: "#111827" }}>{node.name}</Typography>
                        <Chip label={meta.label} size="small" sx={{ height: 22, fontSize: "11px", bgcolor: meta.bg, color: meta.color, border: "none" }} />
                      </Box>
                      <Box sx={{ display: "flex", gap: 1, alignItems: "center", mb: 0.7 }}>
                        <Hub sx={{ fontSize: 14, color: "#7c3aed" }} />
                        <Typography sx={{ fontSize: "12px", color: "#475569" }}>{node.tool}</Typography>
                        <Typography sx={{ fontSize: "11px", color: "#94a3b8", marginLeft: "auto" }}>{node.time}</Typography>
                      </Box>
                      <Box sx={{ p: 1.1, bgcolor: "#f8fafc", borderRadius: "8px", border: "1px solid #eef2f7" }}>
                        <Typography sx={{ fontSize: "12px", color: "#64748b", lineHeight: 1.7 }}>参数：{node.params}</Typography>
                        <Typography sx={{ fontSize: "12px", color: node.state === "failed" ? "#b91c1c" : "#334155", lineHeight: 1.7 }}>结果：{node.result}</Typography>
                      </Box>
                    </Paper>
                  </Box>
                );
              })}
            </Box>

            <Box sx={{ p: 2, borderTop: "1px solid #e8eaed" }}>
              <Button variant="outlined" onClick={() => setChainFile(null)} sx={{ textTransform: "none", borderRadius: "8px", fontSize: "13px" }}>关闭</Button>
            </Box>
          </Box>
        )}
      </Drawer>

      {/* Delete confirm */}
      <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: "12px" } }}>
        <DialogTitle sx={{ fontSize: "15px", fontWeight: 700, py: 2, px: 3 }}>确认删除</DialogTitle>
        <DialogContent sx={{ px: 3 }}>
          <Alert severity="error" sx={{ bgcolor: "#fef2f2", color: "#991b1b", border: "1px solid #fecaca", borderRadius: "8px", "& .MuiAlert-message": { fontSize: "13px" }, "& .MuiAlert-icon": { color: "#ef4444" } }}>
            将删除 {deleteConfirm?.length} 条记录，删除后不可恢复，是否确认？
          </Alert>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button onClick={() => setDeleteConfirm(null)} sx={{ textTransform: "none", color: "#374151", borderRadius: "7px", px: 2, fontSize: "13px" }}>取消</Button>
          <Button variant="contained" onClick={() => doDelete(deleteConfirm!)}
            sx={{ bgcolor: "#ef4444", borderRadius: "7px", textTransform: "none", px: 2.5, fontSize: "13px", boxShadow: "none", "&:hover": { bgcolor: "#dc2626", boxShadow: "none" } }}>
            确认删除
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={toast.open} autoHideDuration={3000} onClose={() => setToast(t => ({ ...t, open: false }))} anchorOrigin={{ vertical: "top", horizontal: "center" }}>
        <Alert severity={toast.sev} onClose={() => setToast(t => ({ ...t, open: false }))} sx={{ borderRadius: "8px", boxShadow: "0 4px 12px rgba(0,0,0,0.15)", fontSize: "13px" }}>{toast.msg}</Alert>
      </Snackbar>
    </Box>
  );
}
