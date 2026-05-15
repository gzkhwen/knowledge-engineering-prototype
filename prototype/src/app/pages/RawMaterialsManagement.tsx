import { useState, useEffect, useMemo } from "react";
import { useOutletContext } from "react-router";
import {
  Box, Typography, Button, Chip, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Dialog, DialogTitle, DialogContent, DialogActions,
  IconButton, Paper, Alert, TextField, Select, MenuItem, FormControl,
  InputLabel, LinearProgress, Tooltip, Checkbox, Snackbar,
} from "@mui/material";
import {
  CloudUpload, Delete, InsertDriveFile, Search, Close,
  CheckCircle, ErrorOutline, HourglassEmpty, CloudDone, PowerSettingsNew,
} from "@mui/icons-material";
import { Project } from "../types";

type MatStatus = "uploading" | "uploaded" | "failed" | "disabled";

interface RawMat {
  id: string;
  name: string;
  format: string;
  sizeMB: number;
  uploader: string;
  uploadTime: string;
  status: MatStatus;
  failReason?: string;
}

const SUPPORTED_FMTS = ["md", "txt", "xlsx", "xls"];
const MAX_SIZE_MB = 10;
const MAX_FILES = 10;

const INIT_MATS: RawMat[] = [
  { id: "m1", name: "金融产品使用手册.md", format: "md", sizeMB: 1.24, uploader: "李静", uploadTime: new Date(Date.now() - 86400000 * 3).toISOString(), status: "uploaded" },
  { id: "m2", name: "产品FAQ汇总2024.xlsx", format: "xlsx", sizeMB: 0.87, uploader: "王鹏", uploadTime: new Date(Date.now() - 86400000 * 2).toISOString(), status: "uploaded" },
  { id: "m3", name: "理财业务规范v3.txt", format: "txt", sizeMB: 0.31, uploader: "李静", uploadTime: new Date(Date.now() - 86400000 * 2 + 3600000).toISOString(), status: "uploaded" },
  { id: "m4", name: "信用卡业务手册_202501.md", format: "md", sizeMB: 2.15, uploader: "陈晨", uploadTime: new Date(Date.now() - 86400000).toISOString(), status: "uploaded" },
  { id: "m5", name: "风控流程说明_最新版.md", format: "md", sizeMB: 1.08, uploader: "王鹏", uploadTime: new Date(Date.now() - 86400000 + 7200000).toISOString(), status: "uploaded" },
  { id: "m6", name: "客户投诉处理规程.xlsx", format: "xlsx", sizeMB: 0.64, uploader: "李静", uploadTime: new Date(Date.now() - 3600000 * 8).toISOString(), status: "failed", failReason: "文件解析失败：内容编码异常，无法读取" },
  { id: "m7", name: "知识库建设标准_v2.txt", format: "txt", sizeMB: 0.42, uploader: "陈晨", uploadTime: new Date(Date.now() - 3600000 * 5).toISOString(), status: "uploaded" },
  { id: "m8", name: "老版合规文件2022.md", format: "md", sizeMB: 0.93, uploader: "王鹏", uploadTime: new Date(Date.now() - 86400000 * 7).toISOString(), status: "disabled" },
  { id: "m9", name: "保险产品手册Q1.xlsx", format: "xlsx", sizeMB: 1.76, uploader: "李静", uploadTime: new Date(Date.now() - 3600000 * 2).toISOString(), status: "uploading" },
  { id: "m10", name: "贷款产品说明书.txt", format: "txt", sizeMB: 0.56, uploader: "陈晨", uploadTime: new Date(Date.now() - 3600000).toISOString(), status: "uploaded" },
];

const STATUS_META: Record<MatStatus, { label: string; bg: string; color: string; dotColor: string }> = {
  uploading: { label: "上传中",  bg: "#eff6ff", color: "#1d4ed8", dotColor: "#60a5fa" },
  uploaded:  { label: "已上传",  bg: "#f0fdf4", color: "#15803d", dotColor: "#4ade80" },
  failed:    { label: "上传失败", bg: "#fef2f2", color: "#b91c1c", dotColor: "#f87171" },
  disabled:  { label: "已停用",  bg: "#f9fafb", color: "#6b7280", dotColor: "#d1d5db" },
};

const fmtSize = (mb: number) => mb >= 1 ? `${mb.toFixed(2)} MB` : `${(mb * 1024).toFixed(0)} KB`;
const fmtTime = (iso: string) => new Date(iso).toLocaleString("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });

export function RawMaterialsManagement() {
  const { project } = useOutletContext<{ project: Project }>();

  const key = `rawMats_${project.id}`;
  const [mats, setMats] = useState<RawMat[]>(() => {
    try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : INIT_MATS; } catch { return INIT_MATS; }
  });
  const save = (d: RawMat[]) => { setMats(d); localStorage.setItem(key, JSON.stringify(d)); };

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterQ, setFilterQ] = useState("");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<{ file: File; err?: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string[] | null>(null);
  const [toast, setToast] = useState({ open: false, msg: "", sev: "success" as "success" | "error" | "warning" });
  const showToast = (msg: string, sev: "success" | "error" | "warning" = "success") => setToast({ open: true, msg, sev });

  // Simulate uploading → uploaded
  useEffect(() => {
    const uploading = mats.filter(m => m.status === "uploading");
    if (!uploading.length) return;
    const t = setTimeout(() => save(mats.map(m => m.status === "uploading" ? { ...m, status: "uploaded" as MatStatus } : m)), 5000);
    return () => clearTimeout(t);
  }, [mats.filter(m => m.status === "uploading").length]);

  const filtered = useMemo(() => mats.filter(m => {
    if (filterStatus !== "all" && m.status !== filterStatus) return false;
    if (filterQ && !m.name.toLowerCase().includes(filterQ.toLowerCase())) return false;
    return true;
  }).sort((a, b) => new Date(b.uploadTime).getTime() - new Date(a.uploadTime).getTime()), [mats, filterStatus, filterQ]);

  const stats = useMemo(() => ({
    total: mats.length,
    uploaded: mats.filter(m => m.status === "uploaded").length,
    uploading: mats.filter(m => m.status === "uploading").length,
    failed: mats.filter(m => m.status === "failed").length,
  }), [mats]);

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
    const newMats: RawMat[] = valid.map((vf, i) => ({
      id: `m_${Date.now()}_${i}`, name: vf.file.name,
      format: vf.file.name.split(".").pop()?.toLowerCase() ?? "txt",
      sizeMB: vf.file.size / 1048576, uploader: user,
      uploadTime: new Date().toISOString(), status: "uploading" as MatStatus,
    }));
    save([...mats, ...newMats]);
    setUploading(false); setUploadOpen(false); setPendingFiles([]); setProgress(0);
    showToast(`已提交 ${newMats.length} 个文件上传任务`);
  };

  const toggleStatus = (ids: string[]) => {
    save(mats.map(m => ids.includes(m.id)
      ? { ...m, status: (m.status === "disabled" ? "uploaded" : "disabled") as MatStatus }
      : m));
    setSelected(new Set());
    showToast("状态已切换");
  };

  const doDelete = (ids: string[]) => {
    const canDelete = mats.filter(m => ids.includes(m.id) && ["uploaded", "failed", "disabled"].includes(m.status));
    if (canDelete.length < ids.length) showToast(`上传中的文件无法删除，已跳过 ${ids.length - canDelete.length} 个`, "warning");
    if (!canDelete.length) { setDeleteConfirm(null); return; }
    save(mats.filter(m => !canDelete.map(c => c.id).includes(m.id)));
    setSelected(new Set()); setDeleteConfirm(null);
    showToast(`已删除 ${canDelete.length} 条记录`);
  };

  const allSel = filtered.length > 0 && filtered.every(m => selected.has(m.id));
  const toggleAll = () => setSelected(allSel ? new Set() : new Set(filtered.map(m => m.id)));
  const toggleOne = (id: string) => setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const selArr = [...selected];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2.5 }}>
        <Box>
          <Typography sx={{ fontSize: "18px", fontWeight: 700, color: "#111827" }}>原始材料接入</Typography>
          <Typography sx={{ fontSize: "13px", color: "#94a3b8", mt: 0.25 }}>管理项目内的原始材料文件，为后续标准化处理提供输入</Typography>
        </Box>
        <Button variant="contained" startIcon={<CloudUpload sx={{ fontSize: 16 }} />} onClick={() => setUploadOpen(true)}
          sx={{ bgcolor: "#7c3aed", borderRadius: "8px", textTransform: "none", fontSize: "13px", px: 2.5, py: 0.875, boxShadow: "none", "&:hover": { bgcolor: "#6d28d9", boxShadow: "none" } }}>
          上传材料
        </Button>
      </Box>

      {/* Stats */}
      <Box sx={{ display: "flex", gap: 1.5, mb: 2.5 }}>
        {[
          { label: "文件总数", val: stats.total, color: "#374151", bg: "#fff" },
          { label: "已上传", val: stats.uploaded, color: "#15803d", bg: "#f0fdf4" },
          { label: "上传中", val: stats.uploading, color: "#1d4ed8", bg: "#eff6ff" },
          { label: "上传失败", val: stats.failed, color: "#b91c1c", bg: "#fef2f2" },
        ].map(s => (
          <Paper key={s.label} sx={{ px: 2.5, py: 1.5, border: "1px solid #e8eaed", borderRadius: "10px", boxShadow: "none", bgcolor: s.bg, minWidth: 90 }}>
            <Typography sx={{ fontSize: "22px", fontWeight: 700, color: s.color, lineHeight: 1.1 }}>{s.val}</Typography>
            <Typography sx={{ fontSize: "11px", color: "#9ca3af", mt: 0.25 }}>{s.label}</Typography>
          </Paper>
        ))}
      </Box>

      {/* Filter row */}
      <Box sx={{ display: "flex", gap: 1.5, mb: 1.75, alignItems: "center", flexWrap: "wrap" }}>
        <Box sx={{ position: "relative", flex: 1, minWidth: 180 }}>
          <Search sx={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontSize: 16, color: "#94a3b8" }} />
          <TextField size="small" placeholder="搜索文件名" value={filterQ} onChange={e => setFilterQ(e.target.value)}
            sx={{ width: "100%", "& .MuiOutlinedInput-root": { pl: "32px", borderRadius: "8px", fontSize: "13px", bgcolor: "#fff", "& fieldset": { borderColor: "#e8eaed" } } }} />
        </Box>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <Select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} displayEmpty
            sx={{ borderRadius: "8px", fontSize: "13px", bgcolor: "#fff", "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e8eaed" } }}>
            <MenuItem value="all" sx={{ fontSize: "13px" }}>全部状态</MenuItem>
            {Object.entries(STATUS_META).map(([v, m]) => <MenuItem key={v} value={v} sx={{ fontSize: "13px" }}>{m.label}</MenuItem>)}
          </Select>
        </FormControl>
        {selArr.length > 0 && (
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button size="small" startIcon={<PowerSettingsNew sx={{ fontSize: 14 }} />} onClick={() => toggleStatus(selArr)}
              sx={{ borderRadius: "7px", textTransform: "none", fontSize: "12px", color: "#374151", border: "1px solid #e8eaed", bgcolor: "#fff", px: 1.5, "&:hover": { bgcolor: "#f5f5f5" } }}>
              批量启用/停用 ({selArr.length})
            </Button>
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
            <Typography sx={{ fontSize: "14px", color: "#9ca3af" }}>暂无文件，点击「上传材料」开始</Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: "#f8f9fb" }}>
                  <TableCell padding="checkbox" sx={{ pl: 2 }}>
                    <Checkbox size="small" checked={allSel} onChange={toggleAll} sx={{ color: "#d1d5db" }} />
                  </TableCell>
                  {["文件名称", "格式", "大小", "上传人", "上传时间", "状态", "操作"].map(h => (
                    <TableCell key={h} sx={{ fontSize: "12px", fontWeight: 600, color: "#6b7280", py: 1.5, borderBottom: "1px solid #f0f0f0", whiteSpace: "nowrap" }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((m, idx) => {
                  const sm = STATUS_META[m.status];
                  const isSel = selected.has(m.id);
                  return (
                    <TableRow key={m.id} sx={{ bgcolor: isSel ? "#faf5ff" : idx % 2 === 0 ? "#fff" : "#fafafa", "&:hover": { bgcolor: "#f5f3ff20" }, "& td": { borderBottom: "1px solid #f5f5f5" } }}>
                      <TableCell padding="checkbox" sx={{ pl: 2 }}>
                        <Checkbox size="small" checked={isSel} onChange={() => toggleOne(m.id)} sx={{ color: "#d1d5db" }} />
                      </TableCell>
                      <TableCell sx={{ py: 1.5 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Box sx={{ width: 32, height: 32, borderRadius: "6px", bgcolor: "#f5f3ff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <InsertDriveFile sx={{ fontSize: 16, color: "#7c3aed" }} />
                          </Box>
                          <Box>
                            <Typography sx={{ fontSize: "13px", color: "#111827", fontWeight: 500, maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.name}</Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell><Chip label={`.${m.format.toUpperCase()}`} size="small" sx={{ height: 20, fontSize: "11px", bgcolor: "#f1f5f9", color: "#475569", border: "none", "& .MuiChip-label": { px: 0.75 } }} /></TableCell>
                      <TableCell sx={{ fontSize: "12px", color: "#6b7280" }}>{fmtSize(m.sizeMB)}</TableCell>
                      <TableCell sx={{ fontSize: "12px", color: "#6b7280" }}>{m.uploader}</TableCell>
                      <TableCell sx={{ fontSize: "12px", color: "#6b7280", whiteSpace: "nowrap" }}>{fmtTime(m.uploadTime)}</TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                          <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: sm.dotColor, flexShrink: 0 }} />
                          <Typography sx={{ fontSize: "12px", color: sm.color, fontWeight: 500 }}>{sm.label}</Typography>
                          {m.status === "failed" && m.failReason && (
                            <Tooltip title={m.failReason} arrow>
                              <ErrorOutline sx={{ fontSize: 13, color: "#ef4444", cursor: "help" }} />
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", gap: 0.5 }}>
                          {m.status !== "uploading" && (
                            <Tooltip title={m.status === "disabled" ? "启用" : "停用"} arrow>
                              <IconButton size="small" onClick={() => toggleStatus([m.id])}
                                sx={{ width: 28, height: 28, borderRadius: "6px", color: m.status === "disabled" ? "#10b981" : "#9ca3af", "&:hover": { bgcolor: m.status === "disabled" ? "#f0fdf4" : "#f9fafb" } }}>
                                <PowerSettingsNew sx={{ fontSize: 15 }} />
                              </IconButton>
                            </Tooltip>
                          )}
                          {m.status !== "uploading" && (
                            <Tooltip title="删除" arrow>
                              <IconButton size="small" onClick={() => setDeleteConfirm([m.id])}
                                sx={{ width: 28, height: 28, borderRadius: "6px", color: "#9ca3af", "&:hover": { color: "#ef4444", bgcolor: "#fef2f2" } }}>
                                <Delete sx={{ fontSize: 15 }} />
                              </IconButton>
                            </Tooltip>
                          )}
                          {m.status === "uploading" && (
                            <Box sx={{ display: "flex", alignItems: "center", px: 0.5 }}>
                              <HourglassEmpty sx={{ fontSize: 14, color: "#60a5fa" }} />
                            </Box>
                          )}
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
            onClick={() => document.getElementById("fi-raw")?.click()}
            sx={{ border: `2px dashed ${dragOver ? "#7c3aed" : "#d1d5db"}`, borderRadius: "10px", p: 4, textAlign: "center", cursor: "pointer", bgcolor: dragOver ? "#faf5ff" : "#fafafa", transition: "all 0.15s", mb: 2, "&:hover": { borderColor: "#7c3aed", bgcolor: "#faf5ff" } }}>
            <input id="fi-raw" type="file" multiple hidden accept=".md,.txt,.xlsx,.xls" onChange={e => addFiles(e.target.files)} />
            <CloudUpload sx={{ fontSize: 44, color: "#a78bfa", mb: 1.5 }} />
            <Typography sx={{ fontSize: "14px", color: "#374151", mb: 0.5 }}>拖拽文件到此处，或 <span style={{ color: "#7c3aed", fontWeight: 600 }}>点击选择</span></Typography>
            <Typography sx={{ fontSize: "12px", color: "#9ca3af" }}>支持 .md / .txt / .xlsx / .xls，单文件 ≤ {MAX_SIZE_MB}MB，单次 ≤ {MAX_FILES} 个</Typography>
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
