import { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router";
import {
  Box,
  Typography,
  Paper,
  Chip,
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  TextField,
  InputAdornment,
  IconButton,
  Card,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  Breadcrumbs,
  Link as MuiLink,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import {
  Search,
  ViewList,
  ViewModule,
  CheckCircle,
  Feedback,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { dataStore } from "../store/DataStore";
import {
  KnowledgePackage,
  AcceptanceStatus,
  FeedbackType,
  KnowledgeCategoryWithCount,
  KnowledgeObject,
} from "../types";

export function ClientKnowledgePackage() {
  const { projectId, packageId } = useParams<{ projectId: string; packageId?: string }>();
  const location = useLocation();
  
  const [knowledgePackage, setKnowledgePackage] = useState<KnowledgePackage | null>(null);
  const [project, setProject] = useState<any>(null);
  const [categories, setCategories] = useState<KnowledgeCategoryWithCount[]>([]);
  const [knowledgeObjects, setKnowledgeObjects] = useState<KnowledgeObject[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [acceptanceResult, setAcceptanceResult] = useState<any>(null);
  const [feedbackRecords, setFeedbackRecords] = useState<any[]>([]);
  
  const [openAcceptanceDialog, setOpenAcceptanceDialog] = useState(false);
  const [openFeedbackDialog, setOpenFeedbackDialog] = useState(false);
  const [feedbackForm, setFeedbackForm] = useState({
    content: "",
    type: FeedbackType.CONTENT,
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  useEffect(() => {
    loadData();
  }, [projectId, packageId]);

  const loadData = () => {
    if (!projectId) return;

    const proj = dataStore.getProject(projectId);
    setProject(proj);

    const packages = dataStore.getKnowledgePackages(projectId);
    let pkg: KnowledgePackage | undefined;
    
    if (packageId) {
      pkg = dataStore.getKnowledgePackage(packageId);
    } else {
      pkg = packages.find((p) => p.enabled && p.status === "可用");
    }

    if (pkg) {
      setKnowledgePackage(pkg);
      
      // 加载知识类目
      const cats = dataStore.getPackageCategoriesWithCount(pkg.id);
      setCategories(cats);
      
      // 加载知识对象
      const objects = dataStore.getKnowledgeObjects(pkg.id);
      setKnowledgeObjects(objects);
      
      // 加载验收结果
      const results = dataStore.getAcceptanceResults(projectId);
      const result = results.find((r) => r.packageId === pkg!.id);
      setAcceptanceResult(result);
      
      // 加载反馈记录
      const feedbacks = dataStore.getFeedbackRecords(projectId);
      const pkgFeedbacks = feedbacks.filter((f) => f.packageId === pkg!.id);
      setFeedbackRecords(pkgFeedbacks);
    }
  };

  const handleCategoryClick = (categoryId: string) => {
    if (selectedCategory === categoryId) {
      setSelectedCategory(null);
      const objects = dataStore.getKnowledgeObjects(knowledgePackage!.id);
      setKnowledgeObjects(objects);
    } else {
      setSelectedCategory(categoryId);
      const objects = dataStore.getKnowledgeObjects(knowledgePackage!.id, categoryId);
      setKnowledgeObjects(objects);
    }
  };

  const handleSubmitAcceptance = () => {
    if (!knowledgePackage || !projectId) return;

    const currentUser = localStorage.getItem("currentUser");
    const userName = currentUser ? JSON.parse(currentUser).displayName : "客户";

    dataStore.addAcceptanceResult({
      projectId,
      packageId: knowledgePackage.id,
      acceptor: userName,
      acceptanceTime: new Date().toISOString(),
      status: AcceptanceStatus.ACCEPTED,
      confirmed: true,
    });

    setSnackbar({ open: true, message: "验收确认成功", severity: "success" });
    setOpenAcceptanceDialog(false);
    loadData();
  };

  const handleSubmitFeedback = () => {
    if (!knowledgePackage || !projectId) return;

    if (!feedbackForm.content.trim()) {
      setSnackbar({ open: true, message: "请填写反馈内容", severity: "error" });
      return;
    }

    const currentUser = localStorage.getItem("currentUser");
    const userName = currentUser ? JSON.parse(currentUser).displayName : "客户";

    dataStore.addFeedbackRecord({
      projectId,
      packageId: knowledgePackage.id,
      feedbacker: userName,
      feedbackTime: new Date().toISOString(),
      content: feedbackForm.content,
      type: feedbackForm.type,
    });

    setSnackbar({ open: true, message: "反馈提交成功", severity: "success" });
    setOpenFeedbackDialog(false);
    setFeedbackForm({ content: "", type: FeedbackType.CONTENT });
    loadData();
  };

  const getFormTypeColor = (type: string) => {
    const colors: Record<string, { bg: string; text: string }> = {
      问答库: { bg: "#dbeafe", text: "#1e40af" },
      术语库: { bg: "#e0e7ff", text: "#4338ca" },
      非结构化切片: { bg: "#fce7f3", text: "#9f1239" },
      二维表: { bg: "#fef3c7", text: "#92400e" },
      分类树: { bg: "#d1fae5", text: "#065f46" },
      决策表: { bg: "#fed7aa", text: "#9a3412" },
      SOP: { bg: "#fecaca", text: "#991b1b" },
      知识图谱: { bg: "#e9d5ff", text: "#6b21a8" },
    };
    return colors[type] || { bg: "#e5e7eb", text: "#6b7280" };
  };

  const filteredObjects = knowledgeObjects.filter((obj) =>
    obj.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    obj.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!knowledgePackage) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography sx={{ fontSize: "16px", color: "#6b7280" }}>
          暂无可用的知识包
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      {/* 面包屑导航 */}
      <Breadcrumbs sx={{ mb: 2, fontSize: "13px" }}>
        <MuiLink underline="hover" color="inherit" href="#">
          首页
        </MuiLink>
        <MuiLink underline="hover" color="inherit" href="#">
          智能客服知识项目组
        </MuiLink>
        <MuiLink underline="hover" color="inherit" href="#">
          知识包验收
        </MuiLink>
        <Typography sx={{ fontSize: "13px", color: "#111827" }}>
          {knowledgePackage.name}
        </Typography>
      </Breadcrumbs>

      {/* 页面头部 */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
            <Typography sx={{ fontSize: "22px", fontWeight: 600, color: "#111827" }}>
              {knowledgePackage.name}
            </Typography>
            <Chip
              label={knowledgePackage.status}
              size="small"
              sx={{
                height: "24px",
                fontSize: "12px",
                bgcolor: "#d1fae5",
                color: "#065f46",
                border: "none",
                fontWeight: 500,
              }}
            />
          </Box>
          <Typography sx={{ fontSize: "13px", color: "#6b7280" }}>
            版本号：V1.0 | 创建/更新时间：{new Date(knowledgePackage.createdAt).toLocaleString("zh-CN")} 14:30
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 2 }}>
          {!acceptanceResult && (
            <Button
              variant="contained"
              startIcon={<CheckCircle />}
              onClick={() => setOpenAcceptanceDialog(true)}
              sx={{
                bgcolor: "#3b82f6",
                color: "#fff",
                textTransform: "none",
                fontSize: "14px",
                px: 3,
                "&:hover": { bgcolor: "#2563eb" },
              }}
            >
              确认验收
            </Button>
          )}
          <Button
            variant="outlined"
            startIcon={<Feedback />}
            onClick={() => setOpenFeedbackDialog(true)}
            sx={{
              borderColor: "#d1d5db",
              color: "#6b7280",
              textTransform: "none",
              fontSize: "14px",
              px: 3,
              "&:hover": {
                borderColor: "#9ca3af",
                bgcolor: "#f9fafb",
              },
            }}
          >
            提交反馈
          </Button>
        </Box>
      </Box>

      {/* 知识包统计信息 */}
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
        <Box sx={{ display: "flex", gap: 4 }}>
          <Box>
            <Typography sx={{ fontSize: "12px", color: "#9ca3af", mb: 0.5 }}>
              知识包ID
            </Typography>
            <Typography sx={{ fontSize: "14px", fontWeight: 600, color: "#111827" }}>
              KP-20260325-001
            </Typography>
          </Box>
          <Box>
            <Typography sx={{ fontSize: "12px", color: "#9ca3af", mb: 0.5 }}>
              结构化知识对象
            </Typography>
            <Typography sx={{ fontSize: "14px", fontWeight: 600, color: "#111827" }}>
              128个
            </Typography>
          </Box>
          <Box>
            <Typography sx={{ fontSize: "12px", color: "#9ca3af", mb: 0.5 }}>
              知识切片
            </Typography>
            <Typography sx={{ fontSize: "14px", fontWeight: 600, color: "#111827" }}>
              356个
            </Typography>
          </Box>
          <Box>
            <Typography sx={{ fontSize: "12px", color: "#9ca3af", mb: 0.5 }}>
              知识类目
            </Typography>
            <Typography sx={{ fontSize: "14px", fontWeight: 600, color: "#111827" }}>
              {categories.length}个
            </Typography>
          </Box>
          <Box>
            <Typography sx={{ fontSize: "12px", color: "#9ca3af", mb: 0.5 }}>
              总大小
            </Typography>
            <Typography sx={{ fontSize: "14px", fontWeight: 600, color: "#111827" }}>
              246MB
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* 内容区域 */}
      <Box sx={{ display: "flex", gap: 3 }}>
        {/* 左侧知识类目 */}
        <Paper
          sx={{
            width: 280,
            flexShrink: 0,
            bgcolor: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            height: "fit-content",
          }}
        >
          <Box sx={{ p: 2, borderBottom: "1px solid #e5e7eb" }}>
            <Typography sx={{ fontSize: "14px", fontWeight: 600, color: "#111827" }}>
              知识类目
            </Typography>
          </Box>
          <List sx={{ p: 1 }}>
            {categories.map((category) => (
              <ListItem key={category.id} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  selected={selectedCategory === category.id}
                  onClick={() => handleCategoryClick(category.id)}
                  sx={{
                    borderRadius: "6px",
                    py: 1,
                    "&:hover": { bgcolor: "#f9fafb" },
                    "&.Mui-selected": {
                      bgcolor: "#eff6ff",
                      "&:hover": { bgcolor: "#eff6ff" },
                    },
                  }}
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Typography sx={{ fontSize: "13px", color: selectedCategory === category.id ? "#3b82f6" : "#111827" }}>
                          {category.name}
                        </Typography>
                        <Chip
                          label={`${category.count}个`}
                          size="small"
                          sx={{
                            height: "18px",
                            fontSize: "11px",
                            bgcolor: selectedCategory === category.id ? "#dbeafe" : "#f3f4f6",
                            color: selectedCategory === category.id ? "#1e40af" : "#6b7280",
                            border: "none",
                          }}
                        />
                      </Box>
                    }
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Paper>

        {/* 右侧知识对象列表 */}
        <Box sx={{ flex: 1 }}>
          {/* 搜索和视图切换 */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <TextField
              size="small"
              placeholder="搜索知识对象"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{
                width: 300,
                "& .MuiInputBase-input": { fontSize: "13px" },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ fontSize: 20, color: "#9ca3af" }} />
                  </InputAdornment>
                ),
              }}
            />
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Typography sx={{ fontSize: "13px", color: "#6b7280" }}>
                {selectedCategory
                  ? `${categories.find((c) => c.id === selectedCategory)?.name} (${filteredObjects.length}个知识对象)`
                  : `产品介绍 (${filteredObjects.length}个知识对象)`}
              </Typography>
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={(e, newView) => newView && setViewMode(newView)}
                size="small"
              >
                <ToggleButton value="list">
                  <ViewList sx={{ fontSize: 18 }} />
                </ToggleButton>
                <ToggleButton value="grid">
                  <ViewModule sx={{ fontSize: 18 }} />
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>
          </Box>

          {/* 知识对象卡片列表 */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {filteredObjects.map((obj) => {
              const typeColor = getFormTypeColor(obj.formType);
              return (
                <Card
                  key={obj.id}
                  sx={{
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    transition: "all 0.2s",
                    "&:hover": {
                      boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                      borderColor: "#cbd5e1",
                    },
                  }}
                >
                  <Box sx={{ p: 2.5 }}>
                    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, mb: 2 }}>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: "6px",
                          bgcolor: typeColor.bg,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <Typography sx={{ fontSize: "18px", fontWeight: 600, color: typeColor.text }}>
                          {obj.formType.slice(0, 1)}
                        </Typography>
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                          <Typography sx={{ fontSize: "15px", fontWeight: 600, color: "#111827" }}>
                            {obj.title}
                          </Typography>
                          <Chip
                            label={obj.formType}
                            size="small"
                            sx={{
                              height: "20px",
                              fontSize: "11px",
                              bgcolor: typeColor.bg,
                              color: typeColor.text,
                              border: "none",
                            }}
                          />
                        </Box>
                        <Typography
                          sx={{
                            fontSize: "13px",
                            color: "#6b7280",
                            lineHeight: 1.6,
                          }}
                        >
                          {obj.description}
                        </Typography>
                      </Box>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 3,
                        fontSize: "12px",
                        color: "#9ca3af",
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <Typography sx={{ fontSize: "12px", color: "#9ca3af" }}>更新时间：</Typography>
                        <Typography sx={{ fontSize: "12px", color: "#6b7280" }}>{obj.updateTime}</Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <Typography sx={{ fontSize: "12px", color: "#9ca3af" }}>来源：</Typography>
                        <Typography sx={{ fontSize: "12px", color: "#6b7280" }}>{obj.sourceFile}</Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <Typography sx={{ fontSize: "12px", color: "#9ca3af" }}>数据类型：</Typography>
                        <Typography sx={{ fontSize: "12px", color: "#6b7280" }}>{obj.dataType}</Typography>
                      </Box>
                    </Box>
                  </Box>
                </Card>
              );
            })}
          </Box>
        </Box>
      </Box>

      {/* 验收确认对话框 */}
      <Dialog
        open={openAcceptanceDialog}
        onClose={() => setOpenAcceptanceDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: "8px" } }}
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
            onClick={() => setOpenAcceptanceDialog(false)}
            sx={{ textTransform: "none", fontSize: "14px", color: "#6b7280" }}
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
              "&:hover": { bgcolor: "#059669" },
            }}
          >
            确认验收
          </Button>
        </DialogActions>
      </Dialog>

      {/* 反馈提交对话框 */}
      <Dialog
        open={openFeedbackDialog}
        onClose={() => setOpenFeedbackDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: "8px" } }}
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
                "& .MuiInputLabel-root": { fontSize: "14px" },
                "& .MuiInputBase-input": { fontSize: "14px" },
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setOpenFeedbackDialog(false)}
            sx={{ textTransform: "none", fontSize: "14px", color: "#6b7280" }}
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
              "&:hover": { bgcolor: "#2563eb" },
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
          sx={{ fontSize: "14px", borderRadius: "6px" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}