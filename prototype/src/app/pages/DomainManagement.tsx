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
import { Domain } from "../types";
import { toast } from "sonner";

export function DomainManagement() {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingDomain, setEditingDomain] = useState<Domain | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    enabled: false,
  });

  useEffect(() => {
    loadDomains();
  }, []);

  const loadDomains = () => {
    setDomains(dataStore.getDomains());
  };

  const handleOpenDialog = (domain?: Domain) => {
    if (domain) {
      setEditingDomain(domain);
      setFormData({
        name: domain.name,
        code: domain.code,
        enabled: domain.enabled,
      });
    } else {
      setEditingDomain(null);
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
    setEditingDomain(null);
    setFormData({ name: "", code: "", enabled: false });
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast.error("领域名称不能为空");
      return;
    }

    if (dataStore.isDomainNameExists(formData.name, editingDomain?.id)) {
      toast.error("领域名称已存在");
      return;
    }

    const code = formData.code.trim() || `DOM${Date.now().toString().slice(-6)}`;

    if (editingDomain) {
      dataStore.updateDomain(editingDomain.id, {
        ...formData,
        code,
      });
      toast.success("领域更新成功");
    } else {
      dataStore.addDomain({
        ...formData,
        code,
      });
      toast.success("领域创建成功，状态为停用");
    }

    loadDomains();
    handleCloseDialog();
  };

  const handleDelete = (domain: Domain) => {
    if (window.confirm(`确定要删除领域"${domain.name}"吗？`)) {
      const success = dataStore.deleteDomain(domain.id);
      if (success) {
        toast.success("领域删除成功");
        loadDomains();
      } else {
        toast.error("该领域已被使用，不可删除");
      }
    }
  };

  const handleToggleEnabled = (domain: Domain) => {
    const newEnabled = !domain.enabled;
    dataStore.updateDomain(domain.id, { enabled: newEnabled });
    
    if (!newEnabled) {
      toast.warning("停用后，依赖该领域的适用关系将不可用");
    } else {
      toast.success("领域已启用");
    }
    
    loadDomains();
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography sx={{ fontSize: "20px", fontWeight: 600, color: "#111827" }}>领域管理</Typography>
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
          新增领域
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
              <TableCell sx={{ fontSize: "12px", fontWeight: 500, color: "#6b7280", py: 1.5 }}>领域名称</TableCell>
              <TableCell sx={{ fontSize: "12px", fontWeight: 500, color: "#6b7280", py: 1.5 }}>领域编码</TableCell>
              <TableCell sx={{ fontSize: "12px", fontWeight: 500, color: "#6b7280", py: 1.5 }}>启用状态</TableCell>
              <TableCell sx={{ fontSize: "12px", fontWeight: 500, color: "#6b7280", py: 1.5 }}>创建时间</TableCell>
              <TableCell align="right" sx={{ fontSize: "12px", fontWeight: 500, color: "#6b7280", py: 1.5 }}>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {domains.map((domain) => (
              <TableRow 
                key={domain.id}
                sx={{
                  "&:hover": {
                    bgcolor: "#fafafa"
                  },
                  "&:last-child td": {
                    borderBottom: 0
                  }
                }}
              >
                <TableCell sx={{ fontSize: "12px", color: "#374151", py: 1.5 }}>{domain.name}</TableCell>
                <TableCell sx={{ fontSize: "12px", color: "#374151", py: 1.5 }}>{domain.code}</TableCell>
                <TableCell sx={{ py: 1.5 }}>
                  <Chip
                    label={domain.enabled ? "已启用" : "已停用"}
                    size="small"
                    sx={{
                      height: "20px",
                      fontSize: "11px",
                      bgcolor: domain.enabled ? "#d1fae5" : "#f3f4f6",
                      color: domain.enabled ? "#065f46" : "#374151",
                      border: "none",
                      "& .MuiChip-label": { px: 1 }
                    }}
                  />
                </TableCell>
                <TableCell sx={{ fontSize: "12px", color: "#374151", py: 1.5 }}>{new Date(domain.createdAt).toLocaleString("zh-CN")}</TableCell>
                <TableCell align="right" sx={{ py: 1.5 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={domain.enabled}
                        onChange={() => handleToggleEnabled(domain)}
                        size="small"
                      />
                    }
                    label=""
                    sx={{ mr: 1 }}
                  />
                  <IconButton 
                    size="small" 
                    onClick={() => handleOpenDialog(domain)}
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
                    onClick={() => handleDelete(domain)}
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
            {domains.length === 0 && (
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
          {editingDomain ? "编辑领域" : "新增领域"}
        </DialogTitle>
        <DialogContent sx={{ px: 3, py: 3 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="领域名称"
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
              label="领域编码"
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
            {!editingDomain && (
              <Typography sx={{ fontSize: "12px", color: "#6b7280" }}>
                注：新增领域默认为停用状态，需手动启用后才可选用
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