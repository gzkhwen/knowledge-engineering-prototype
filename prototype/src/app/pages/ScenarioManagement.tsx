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
import { Scenario } from "../types";
import { toast } from "sonner";

export function ScenarioManagement() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingScenario, setEditingScenario] = useState<Scenario | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    enabled: false,
  });

  useEffect(() => {
    loadScenarios();
  }, []);

  const loadScenarios = () => {
    setScenarios(dataStore.getScenarios());
  };

  const handleOpenDialog = (scenario?: Scenario) => {
    if (scenario) {
      setEditingScenario(scenario);
      setFormData({
        name: scenario.name,
        code: scenario.code,
        enabled: scenario.enabled,
      });
    } else {
      setEditingScenario(null);
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
    setEditingScenario(null);
    setFormData({ name: "", code: "", enabled: false });
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast.error("场景名称不能为空");
      return;
    }

    if (dataStore.isScenarioNameExists(formData.name, editingScenario?.id)) {
      toast.error("场景名称已存在");
      return;
    }

    const code = formData.code.trim() || `SCN${Date.now().toString().slice(-6)}`;

    if (editingScenario) {
      dataStore.updateScenario(editingScenario.id, {
        ...formData,
        code,
      });
      toast.success("场景更新成功");
    } else {
      dataStore.addScenario({
        ...formData,
        code,
      });
      toast.success("场景创建成功，状态为停用");
    }

    loadScenarios();
    handleCloseDialog();
  };

  const handleDelete = (scenario: Scenario) => {
    if (window.confirm(`确定要删除场景"${scenario.name}"吗？`)) {
      const success = dataStore.deleteScenario(scenario.id);
      if (success) {
        toast.success("场景删除成功");
        loadScenarios();
      } else {
        toast.error("该场景已被使用，不可删除");
      }
    }
  };

  const handleToggleEnabled = (scenario: Scenario) => {
    const newEnabled = !scenario.enabled;
    dataStore.updateScenario(scenario.id, { enabled: newEnabled });
    
    if (!newEnabled) {
      toast.warning("停用后，依赖该场景的适用关系将不可用");
    } else {
      toast.success("场景已启用");
    }
    
    loadScenarios();
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography sx={{ fontSize: "20px", fontWeight: 600, color: "#111827" }}>场景管理</Typography>
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
          新增场景
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
              <TableCell sx={{ fontSize: "12px", fontWeight: 500, color: "#6b7280", py: 1.5 }}>场景名称</TableCell>
              <TableCell sx={{ fontSize: "12px", fontWeight: 500, color: "#6b7280", py: 1.5 }}>场景编码</TableCell>
              <TableCell sx={{ fontSize: "12px", fontWeight: 500, color: "#6b7280", py: 1.5 }}>启用状态</TableCell>
              <TableCell sx={{ fontSize: "12px", fontWeight: 500, color: "#6b7280", py: 1.5 }}>创建时间</TableCell>
              <TableCell align="right" sx={{ fontSize: "12px", fontWeight: 500, color: "#6b7280", py: 1.5 }}>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {scenarios.map((scenario) => (
              <TableRow 
                key={scenario.id}
                sx={{
                  "&:hover": {
                    bgcolor: "#fafafa"
                  },
                  "&:last-child td": {
                    borderBottom: 0
                  }
                }}
              >
                <TableCell sx={{ fontSize: "12px", color: "#374151", py: 1.5 }}>{scenario.name}</TableCell>
                <TableCell sx={{ fontSize: "12px", color: "#374151", py: 1.5 }}>{scenario.code}</TableCell>
                <TableCell sx={{ py: 1.5 }}>
                  <Chip
                    label={scenario.enabled ? "已启用" : "已停用"}
                    size="small"
                    sx={{
                      height: "20px",
                      fontSize: "11px",
                      bgcolor: scenario.enabled ? "#d1fae5" : "#f3f4f6",
                      color: scenario.enabled ? "#065f46" : "#374151",
                      border: "none",
                      "& .MuiChip-label": { px: 1 }
                    }}
                  />
                </TableCell>
                <TableCell sx={{ fontSize: "12px", color: "#374151", py: 1.5 }}>{new Date(scenario.createdAt).toLocaleString("zh-CN")}</TableCell>
                <TableCell align="right" sx={{ py: 1.5 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={scenario.enabled}
                        onChange={() => handleToggleEnabled(scenario)}
                        size="small"
                      />
                    }
                    label=""
                    sx={{ mr: 1 }}
                  />
                  <IconButton 
                    size="small" 
                    onClick={() => handleOpenDialog(scenario)}
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
                    onClick={() => handleDelete(scenario)}
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
            {scenarios.length === 0 && (
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
          {editingScenario ? "编辑场景" : "新增场景"}
        </DialogTitle>
        <DialogContent sx={{ px: 3, py: 3 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="场景名称"
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
              label="场景编码"
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
            {!editingScenario && (
              <Typography sx={{ fontSize: "12px", color: "#6b7280" }}>
                注：新增场景默认为停用状态，需手动启用后才可选用
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