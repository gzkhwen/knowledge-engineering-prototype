import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
} from "@mui/material";
import { Add, Edit, Delete } from "@mui/icons-material";
import { dataStore } from "../store/DataStore";
import { Industry } from "../types";
import { toast } from "sonner";

export function IndustryManagement() {
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingIndustry, setEditingIndustry] = useState<Industry | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    enabled: false,
  });

  useEffect(() => {
    loadIndustries();
  }, []);

  const loadIndustries = () => {
    setIndustries(dataStore.getIndustries());
  };

  const handleOpenDialog = (industry?: Industry) => {
    if (industry) {
      setEditingIndustry(industry);
      setFormData({
        name: industry.name,
        code: industry.code,
        enabled: industry.enabled,
      });
    } else {
      setEditingIndustry(null);
      setFormData({
        name: "",
        code: "",
        enabled: false,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingIndustry(null);
    setFormData({ name: "", code: "", enabled: false });
  };

  const handleSave = () => {
    // 验证名称不为空
    if (!formData.name.trim()) {
      toast.error("行业名称不能为空");
      return;
    }

    // 验证名称唯一性
    if (dataStore.isIndustryNameExists(formData.name, editingIndustry?.id)) {
      toast.error("行业名称已存在");
      return;
    }

    // 如果编码为空，自动生成
    const code = formData.code.trim() || `IND${Date.now().toString().slice(-6)}`;

    if (editingIndustry) {
      // 更新
      dataStore.updateIndustry(editingIndustry.id, {
        ...formData,
        code,
      });
      toast.success("行业更新成功");
    } else {
      // 新增
      dataStore.addIndustry({
        ...formData,
        code,
      });
      toast.success("行业创建成功，状态为停用");
    }

    loadIndustries();
    handleCloseDialog();
  };

  const handleDelete = (industry: Industry) => {
    if (window.confirm(`确定要删除行业"${industry.name}"吗？`)) {
      const success = dataStore.deleteIndustry(industry.id);
      if (success) {
        toast.success("行业删除成功");
        loadIndustries();
      } else {
        toast.error("该行业已被使用，不可删除");
      }
    }
  };

  const handleToggleEnabled = (industry: Industry) => {
    const newEnabled = !industry.enabled;
    dataStore.updateIndustry(industry.id, { enabled: newEnabled });
    
    if (!newEnabled) {
      toast.warning("停用后，依赖该行业的适用关系将不可用");
    } else {
      toast.success("行业已启用");
    }
    
    loadIndustries();
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography sx={{ fontSize: "20px", fontWeight: 600, color: "#111827" }}>行业管理</Typography>
        <Button 
          variant="contained" 
          startIcon={<Add />} 
          onClick={() => handleOpenDialog()}
          sx={{
            bgcolor: "#3b82f6",
            borderRadius: "6px",
            textTransform: "none",
            px: 2,
            py: 1,
            fontSize: "13px",
            boxShadow: "none",
            "&:hover": {
              bgcolor: "#2563eb",
              boxShadow: "none"
            }
          }}
        >
          新增行业
        </Button>
      </Box>

      <TableContainer 
        component={Paper}
        sx={{
          bgcolor: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: "8px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          overflow: "hidden"
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "#f9fafb" }}>
              <TableCell sx={{ fontSize: "12px", fontWeight: 500, color: "#6b7280", py: 1.5 }}>行业名称</TableCell>
              <TableCell sx={{ fontSize: "12px", fontWeight: 500, color: "#6b7280", py: 1.5 }}>行业编码</TableCell>
              <TableCell sx={{ fontSize: "12px", fontWeight: 500, color: "#6b7280", py: 1.5 }}>启用状态</TableCell>
              <TableCell sx={{ fontSize: "12px", fontWeight: 500, color: "#6b7280", py: 1.5 }}>创建时间</TableCell>
              <TableCell align="right" sx={{ fontSize: "12px", fontWeight: 500, color: "#6b7280", py: 1.5 }}>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {industries.map((industry) => (
              <TableRow 
                key={industry.id}
                sx={{
                  "&:hover": {
                    bgcolor: "#fafafa"
                  },
                  "&:last-child td": {
                    borderBottom: 0
                  }
                }}
              >
                <TableCell sx={{ fontSize: "12px", color: "#374151", py: 1.5 }}>{industry.name}</TableCell>
                <TableCell sx={{ fontSize: "12px", color: "#374151", py: 1.5 }}>{industry.code}</TableCell>
                <TableCell sx={{ py: 1.5 }}>
                  <Chip
                    label={industry.enabled ? "已启用" : "已停用"}
                    size="small"
                    sx={{
                      height: "20px",
                      fontSize: "11px",
                      bgcolor: industry.enabled ? "#d1fae5" : "#f3f4f6",
                      color: industry.enabled ? "#065f46" : "#374151",
                      border: "none",
                      "& .MuiChip-label": { px: 1 }
                    }}
                  />
                </TableCell>
                <TableCell sx={{ fontSize: "12px", color: "#374151", py: 1.5 }}>{new Date(industry.createdAt).toLocaleString("zh-CN")}</TableCell>
                <TableCell align="right" sx={{ py: 1.5 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={industry.enabled}
                        onChange={() => handleToggleEnabled(industry)}
                        size="small"
                      />
                    }
                    label=""
                    sx={{ mr: 1 }}
                  />
                  <IconButton 
                    size="small" 
                    onClick={() => handleOpenDialog(industry)}
                    sx={{
                      color: "#64748b",
                      "&:hover": {
                        bgcolor: "#f1f5f9"
                      }
                    }}
                  >
                    <Edit fontSize="small" />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    onClick={() => handleDelete(industry)}
                    sx={{
                      color: "#64748b",
                      "&:hover": {
                        bgcolor: "#f1f5f9",
                        color: "#ef4444"
                      }
                    }}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {industries.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ fontSize: "14px", color: "#6b7280", py: 4 }}>
                  暂无数据
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "12px",
            boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)"
          }
        }}
      >
        <DialogTitle sx={{ fontSize: "16px", fontWeight: 600, color: "#111827", borderBottom: "1px solid #e5e7eb", py: 2.5, px: 3 }}>
          {editingIndustry ? "编辑行业" : "新增行业"}
        </DialogTitle>
        <DialogContent sx={{ px: 3, py: 3 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="行业名称"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              fullWidth
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "6px"
                }
              }}
            />
            <TextField
              label="行业编码"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              placeholder="留空则自动生成"
              fullWidth
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "6px"
                }
              }}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.enabled}
                  onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                />
              }
              label="启用状态"
            />
            {!editingIndustry && (
              <Typography sx={{ fontSize: "12px", color: "#6b7280" }}>
                注：新增行业默认为停用状态，需手动启用后才可选用
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ borderTop: "1px solid #e5e7eb", px: 3, py: 2 }}>
          <Button 
            onClick={handleCloseDialog}
            sx={{
              textTransform: "none",
              color: "#374151",
              borderRadius: "6px",
              px: 2,
              "&:hover": {
                bgcolor: "#f9fafb"
              }
            }}
          >
            取消
          </Button>
          <Button 
            onClick={handleSave} 
            variant="contained"
            sx={{
              bgcolor: "#3b82f6",
              borderRadius: "6px",
              textTransform: "none",
              px: 2,
              boxShadow: "none",
              "&:hover": {
                bgcolor: "#2563eb",
                boxShadow: "none"
              }
            }}
          >
            保存
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}