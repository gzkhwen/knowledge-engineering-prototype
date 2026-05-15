import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  Divider,
  Card,
  CardContent,
  Grid,
} from "@mui/material";
import {
  CheckCircle,
  Feedback,
  ArrowBack,
  Description,
  Category as CategoryIcon,
} from "@mui/icons-material";
import { useParams, useNavigate } from "react-router";
import { dataStore } from "../store/DataStore";
import { KnowledgePackage, AcceptanceStatus, FeedbackType, KnowledgeFormType } from "../types";

export function KnowledgePackageView() {
  const { projectId, packageId } = useParams<{ projectId: string; packageId?: string }>();
  const navigate = useNavigate();
  
  const [knowledgePackage, setKnowledgePackage] = useState<KnowledgePackage | null>(null);
  const [project, setProject] = useState<any>(null);
  const [acceptanceResult, setAcceptanceResult] = useState<any>(null);
  const [feedbackRecords, setFeedbackRecords] = useState<any[]>([]);
  
  const [openAcceptanceDialog, setOpenAcceptanceDialog] = useState(false);
  const [openFeedbackDialog, setOpenFeedbackDialog] = useState(false);
  const [feedbackForm, setFeedbackForm] = useState({
    content: "",
    type: FeedbackType.CONTENT,
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" as "success" | "error" | "warning" });

  useEffect(() => {
    loadData();
  }, [projectId, packageId]);

  const loadData = () => {
    if (!projectId) return;

    // 加载项目信息
    const proj = dataStore.getProject(projectId);
    setProject(proj);

    // 加载知识包
    const packages = dataStore.getKnowledgePackages(projectId);
    let pkg: KnowledgePackage | undefined;
    
    if (packageId) {
      pkg = dataStore.getKnowledgePackage(packageId);
    } else {
      // 默认获取启用的知识包
      pkg = packages.find(p => p.enabled && p.status === "可用");
    }

    if (pkg) {
      setKnowledgePackage(pkg);
      
      // 加载验收结果
      const results = dataStore.getAcceptanceResults(projectId);
      const result = results.find(r => r.packageId === pkg!.id);
      setAcceptanceResult(result);
      
      // 加载反馈记录
      const feedbacks = dataStore.getFeedbackRecords(projectId);
      const pkgFeedbacks = feedbacks.filter(f => f.packageId === pkg!.id);
      setFeedbackRecords(pkgFeedbacks);
    } else {
      setKnowledgePackage(null);
    }
  };

  const handleOpenAcceptanceDialog = () => {
    setOpenAcceptanceDialog(true);
  };

  const handleCloseAcceptanceDialog = () => {
    setOpenAcceptanceDialog(false);
  };

  const handleSubmitAcceptance = () => {
    if (!knowledgePackage || !projectId) return;

    // 创建验收结果
    dataStore.addAcceptanceResult({
      projectId,
      packageId: knowledgePackage.id,
      acceptor: "企业客户 A", // 模拟当前用户
      acceptanceTime: new Date().toISOString(),
      status: AcceptanceStatus.ACCEPTED,
      confirmed: true,
    });

    setSnackbar({ open: true, message: "验收确认成功", severity: "success" });
    handleCloseAcceptanceDialog();
    loadData();
  };

  const handleOpenFeedbackDialog = () => {
    setFeedbackForm({ content: "", type: FeedbackType.CONTENT });
    setOpenFeedbackDialog(true);
  };

  const handleCloseFeedbackDialog = () => {
    setOpenFeedbackDialog(false);
    setFeedbackForm({ content: "", type: FeedbackType.CONTENT });
  };

  const handleSubmitFeedback = () => {
    if (!knowledgePackage || !projectId) return;

    if (!feedbackForm.content.trim()) {
      setSnackbar({ open: true, message: "请填写反馈内容", severity: "error" });
      return;
    }

    // 创建反馈记录
    dataStore.addFeedbackRecord({
      projectId,
      packageId: knowledgePackage.id,
      feedbacker: "企业客户 A", // 模拟当前用户
      feedbackTime: new Date().toISOString(),
      content: feedbackForm.content,
      type: feedbackForm.type,
    });

    setSnackbar({ open: true, message: "反馈提交成功", severity: "success" });
    handleCloseFeedbackDialog();
    loadData();
  };

  const getKnowledgeObjectTypeLabel = (type: KnowledgeFormType) => {
    return type;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "可用":
        return "#d1fae5";
      case "构建中":
        return "#fef3c7";
      case "已停用":
        return "#fee2e2";
      default:
        return "#e5e7eb";
    }
  };

  const getStatusTextColor = (status: string) => {
    switch (status) {
      case "可用":
        return "#065f46";
      case "构建中":
        return "#92400e";
      case "已停用":
        return "#991b1b";
      default:
        return "#6b7280";
    }
  };

  if (!projectId || !project) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">项目不存在或已被删除</Alert>
      </Box>
    );
  }

  if (!knowledgePackage) {
    return (
      <Box sx={{ p: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(`/ops/projects`)}
          sx={{ mb: 3, textTransform: "none", color: "#3b82f6" }}
        >
          返回项目列表
        </Button>
        <Alert severity="warning">
          该项目暂无可用的知识包，知识包可能正在构建中或尚未创建
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      {/* 页面头部 */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <Button
              startIcon={<ArrowBack />}
              onClick={() => navigate(`/ops/projects`)}
              sx={{ textTransform: "none", color: "#3b82f6", mr: 2 }}
            >
              返回项目列表
            </Button>
            <Typography sx={{ fontSize: "20px", fontWeight: 600, color: "#111827" }}>
              {knowledgePackage.name}
            </Typography>
            <Chip
              label={knowledgePackage.status}
              size="small"
              sx={{
                height: "24px",
                fontSize: "12px",
                bgcolor: getStatusColor(knowledgePackage.status),
                color: getStatusTextColor(knowledgePackage.status),
                border: "none",
                fontWeight: 500,
              }}
            />
          </Box>
          <Typography sx={{ fontSize: "14px", color: "#6b7280" }}>
            {project.name} - 查看知识包内容并进行验收确认
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Feedback />}
            onClick={handleOpenFeedbackDialog}
            disabled={knowledgePackage.status !== "可用"}
            sx={{
              borderColor: "#3b82f6",
              color: "#3b82f6",
              textTransform: "none",
              fontSize: "14px",
              borderRadius: "6px",
              "&:hover": {
                borderColor: "#2563eb",
                bgcolor: "#eff6ff",
              },
              "&:disabled": {
                borderColor: "#e5e7eb",
                color: "#9ca3af",
              },
            }}
          >
            提交反馈
          </Button>
          <Button
            variant="contained"
            startIcon={<CheckCircle />}
            onClick={handleOpenAcceptanceDialog}
            disabled={knowledgePackage.status !== "可用" || !!acceptanceResult}
            sx={{
              bgcolor: "#10b981",
              color: "#fff",
              textTransform: "none",
              fontSize: "14px",
              borderRadius: "6px",
              boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
              "&:hover": {
                bgcolor: "#059669",
              },
              "&:disabled": {
                bgcolor: "#e5e7eb",
                color: "#9ca3af",
              },
            }}
          >
            {acceptanceResult ? "已验收" : "验收确认"}
          </Button>
        </Box>
      </Box>

      {/* 验收状态提示 */}
      {acceptanceResult && (
        <Alert
          severity="success"
          sx={{
            mb: 3,
            bgcolor: "#d1fae5",
            color: "#065f46",
            border: "1px solid #6ee7b7",
            borderRadius: "6px",
            fontSize: "13px",
          }}
        >
          已于 {new Date(acceptanceResult.acceptanceTime).toLocaleString("zh-CN")} 完成验收确认
        </Alert>
      )}

      {/* 知识包概要信息 */}
      <Paper
        sx={{
          p: 3,
          mb: 3,
          bgcolor: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: "8px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        }}
      >
        <Typography sx={{ fontSize: "16px", fontWeight: 600, color: "#111827", mb: 2 }}>
          知识包概要
        </Typography>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box>
              <Typography sx={{ fontSize: "12px", color: "#9ca3af", mb: 0.5 }}>
                创建时间
              </Typography>
              <Typography sx={{ fontSize: "14px", color: "#111827" }}>
                {new Date(knowledgePackage.createdAt).toLocaleDateString("zh-CN")}
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box>
              <Typography sx={{ fontSize: "12px", color: "#9ca3af", mb: 0.5 }}>
                知识条目总数
              </Typography>
              <Typography sx={{ fontSize: "14px", color: "#111827" }}>
                {knowledgePackage.totalItems || 0} 条
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box>
              <Typography sx={{ fontSize: "12px", color: "#9ca3af", mb: 0.5 }}>
                包含的知识形态
              </Typography>
              <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", mt: 0.5 }}>
                {knowledgePackage.knowledgeObjectTypes.map((type) => (
                  <Chip
                    key={type}
                    label={getKnowledgeObjectTypeLabel(type)}
                    size="small"
                    sx={{
                      height: "20px",
                      fontSize: "11px",
                      bgcolor: "#eff6ff",
                      color: "#1e40af",
                      border: "none",
                    }}
                  />
                ))}
              </Box>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box>
              <Typography sx={{ fontSize: "12px", color: "#9ca3af", mb: 0.5 }}>
                验收状态
              </Typography>
              <Chip
                label={acceptanceResult ? "已验收" : "待验收"}
                size="small"
                sx={{
                  height: "20px",
                  fontSize: "11px",
                  bgcolor: acceptanceResult ? "#d1fae5" : "#fef3c7",
                  color: acceptanceResult ? "#065f46" : "#92400e",
                  border: "none",
                  fontWeight: 500,
                }}
              />
            </Box>
          </Grid>
          {knowledgePackage.description && (
            <Grid size={{ xs: 12 }}>
              <Box>
                <Typography sx={{ fontSize: "12px", color: "#9ca3af", mb: 0.5 }}>
                  描
                </Typography>
                <Typography sx={{ fontSize: "14px", color: "#111827" }}>
                  {knowledgePackage.description}
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      </Paper>

      {/* 知识包内容预览 */}
      <Paper
        sx={{
          p: 3,
          mb: 3,
          bgcolor: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: "8px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        }}
      >
        <Typography sx={{ fontSize: "16px", fontWeight: 600, color: "#111827", mb: 2 }}>
          知识包内容
        </Typography>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            py: 6,
            border: "2px dashed #e5e7eb",
            borderRadius: "6px",
            bgcolor: "#f9fafb",
          }}
        >
          <Description sx={{ fontSize: 48, color: "#9ca3af", mb: 2 }} />
          <Typography sx={{ fontSize: "14px", color: "#6b7280", mb: 1 }}>
            知识包内容预览
          </Typography>
          <Typography sx={{ fontSize: "12px", color: "#9ca3af" }}>
            这里将展示知识包中的结构化知识对象和知识切片内容
          </Typography>
        </Box>
      </Paper>

      {/* 反馈记录 */}
      {feedbackRecords.length > 0 && (
        <Paper
          sx={{
            p: 3,
            bgcolor: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}
        >
          <Typography sx={{ fontSize: "16px", fontWeight: 600, color: "#111827", mb: 2 }}>
            反馈记录
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {feedbackRecords.map((feedback) => (
              <Card
                key={feedback.id}
                sx={{
                  border: "1px solid #e5e7eb",
                  borderRadius: "6px",
                  boxShadow: "none",
                }}
              >
                <CardContent>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
                    <Box>
                      <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#111827" }}>
                        {feedback.feedbacker}
                      </Typography>
                      <Typography sx={{ fontSize: "12px", color: "#9ca3af" }}>
                        {new Date(feedback.feedbackTime).toLocaleString("zh-CN")}
                      </Typography>
                    </Box>
                    {feedback.type && (
                      <Chip
                        label={feedback.type}
                        size="small"
                        sx={{
                          height: "20px",
                          fontSize: "11px",
                          bgcolor: "#fef3c7",
                          color: "#92400e",
                          border: "none",
                        }}
                      />
                    )}
                  </Box>
                  <Typography sx={{ fontSize: "13px", color: "#111827", whiteSpace: "pre-wrap" }}>
                    {feedback.content}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Paper>
      )}

      {/* 验收确认对话框 */}
      <Dialog
        open={openAcceptanceDialog}
        onClose={handleCloseAcceptanceDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "8px",
          },
        }}
      >
        <DialogTitle sx={{ fontSize: "18px", fontWeight: 600, color: "#111827", pb: 2 }}>
          验收确认
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: "14px", color: "#6b7280", mb: 2 }}>
            确认您已查看并验收该知识包内容吗？
          </Typography>
          <Alert
            severity="info"
            sx={{
              bgcolor: "#dbeafe",
              color: "#1e40af",
              border: "1px solid #93c5fd",
              borderRadius: "6px",
              fontSize: "13px",
            }}
          >
            验收确认后将记录验收时间和验收人信息，作为项目交付依据
          </Alert>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={handleCloseAcceptanceDialog}
            sx={{
              textTransform: "none",
              fontSize: "14px",
              color: "#6b7280",
            }}
          >
            取消
          </Button>
          <Button
            onClick={handleSubmitAcceptance}
            variant="contained"
            sx={{
              bgcolor: "#10b981",
              color: "#fff",
              textTransform: "none",
              fontSize: "14px",
              "&:hover": {
                bgcolor: "#059669",
              },
            }}
          >
            确认验收
          </Button>
        </DialogActions>
      </Dialog>

      {/* 反馈提交对话框 */}
      <Dialog
        open={openFeedbackDialog}
        onClose={handleCloseFeedbackDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "8px",
          },
        }}
      >
        <DialogTitle sx={{ fontSize: "18px", fontWeight: 600, color: "#111827", pb: 2 }}>
          提交反馈
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <FormControl fullWidth>
              <InputLabel sx={{ fontSize: "14px" }}>反馈类型</InputLabel>
              <Select
                value={feedbackForm.type}
                label="反馈类型"
                onChange={(e) => setFeedbackForm({ ...feedbackForm, type: e.target.value as FeedbackType })}
                sx={{ fontSize: "14px" }}
              >
                <MenuItem value={FeedbackType.CONTENT} sx={{ fontSize: "14px" }}>
                  {FeedbackType.CONTENT}
                </MenuItem>
                <MenuItem value={FeedbackType.FORMAT} sx={{ fontSize: "14px" }}>
                  {FeedbackType.FORMAT}
                </MenuItem>
                <MenuItem value={FeedbackType.OTHER} sx={{ fontSize: "14px" }}>
                  {FeedbackType.OTHER}
                </MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="反馈内容"
              fullWidth
              required
              multiline
              rows={4}
              value={feedbackForm.content}
              onChange={(e) => setFeedbackForm({ ...feedbackForm, content: e.target.value })}
              placeholder="请详细描述您对知识包的反馈意见或建议"
              sx={{
                "& .MuiInputLabel-root": {
                  fontSize: "14px",
                },
                "& .MuiInputBase-input": {
                  fontSize: "14px",
                },
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={handleCloseFeedbackDialog}
            sx={{
              textTransform: "none",
              fontSize: "14px",
              color: "#6b7280",
            }}
          >
            取消
          </Button>
          <Button
            onClick={handleSubmitFeedback}
            variant="contained"
            sx={{
              bgcolor: "#3b82f6",
              color: "#fff",
              textTransform: "none",
              fontSize: "14px",
              "&:hover": {
                bgcolor: "#2563eb",
              },
            }}
          >
            提交反馈
          </Button>
        </DialogActions>
      </Dialog>

      {/* 提示消息 */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          sx={{
            fontSize: "14px",
            borderRadius: "6px",
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}