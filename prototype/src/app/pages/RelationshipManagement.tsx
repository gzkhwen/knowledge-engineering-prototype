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
  Switch,
  FormControlLabel,
  MenuItem,
  TextField,
  Alert,
} from "@mui/material";
import { Add, Edit, Delete, CheckCircle, Warning } from "@mui/icons-material";
import { dataStore } from "../store/DataStore";
import { Relationship, Industry, Domain, Scenario } from "../types";
import { toast } from "sonner";

export function RelationshipManagement() {
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingRelationship, setEditingRelationship] = useState<Relationship | null>(null);
  const [formData, setFormData] = useState({
    industryId: "",
    domainId: "",
    scenarioId: "",
    enabled: false,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setRelationships(dataStore.getRelationships());
    setIndustries(dataStore.getIndustries());
    setDomains(dataStore.getDomains());
    setScenarios(dataStore.getScenarios());
  };

  const getIndustryName = (id: string) => {
    return dataStore.getIndustry(id)?.name || "未知";
  };

  const getDomainName = (id: string) => {
    return dataStore.getDomain(id)?.name || "未知";
  };

  const getScenarioName = (id: string) => {
    return dataStore.getScenario(id)?.name || "未知";
  };

  const isRelationshipAvailable = (relationship: Relationship) => {
    const industry = dataStore.getIndustry(relationship.industryId);
    const domain = dataStore.getDomain(relationship.domainId);
    const scenario = dataStore.getScenario(relationship.scenarioId);
    
    return relationship.enabled && 
           industry?.enabled && 
           domain?.enabled && 
           scenario?.enabled;
  };

  const handleOpenDialog = (relationship?: Relationship) => {
    // 检查是否有可用的行业、领域、场景
    if (industries.length === 0 || domains.length === 0 || scenarios.length === 0) {
      toast.error("请先创建行业、领域、场景");
      return;
    }

    if (relationship) {
      setEditingRelationship(relationship);
      setFormData({
        industryId: relationship.industryId,
        domainId: relationship.domainId,
        scenarioId: relationship.scenarioId,
        enabled: relationship.enabled,
      });
    } else {
      setEditingRelationship(null);
      setFormData({
        industryId: "",
        domainId: "",
        scenarioId: "",
        enabled: false,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingRelationship(null);
    setFormData({ industryId: "", domainId: "", scenarioId: "", enabled: false });
  };

  const checkWarnings = () => {
    const warnings: string[] = [];
    
    if (formData.industryId) {
      const industry = dataStore.getIndustry(formData.industryId);
      if (industry && !industry.enabled) {
        warnings.push(`选中的行业"${industry.name}"当前为停用状态`);
      }
    }
    
    if (formData.domainId) {
      const domain = dataStore.getDomain(formData.domainId);
      if (domain && !domain.enabled) {
        warnings.push(`选中的领域"${domain.name}"当前为停用状态`);
      }
    }
    
    if (formData.scenarioId) {
      const scenario = dataStore.getScenario(formData.scenarioId);
      if (scenario && !scenario.enabled) {
        warnings.push(`选中的场景"${scenario.name}"当前为停用状态`);
      }
    }
    
    return warnings;
  };

  const handleSave = () => {
    if (!formData.industryId || !formData.domainId || !formData.scenarioId) {
      toast.error("请选择行业、领域和场景");
      return;
    }

    if (dataStore.isRelationshipExists(
      formData.industryId,
      formData.domainId,
      formData.scenarioId,
      editingRelationship?.id
    )) {
      toast.error("该组合已存在");
      return;
    }

    const warnings = checkWarnings();
    if (warnings.length > 0 && formData.enabled) {
      toast.warning("关联的行业/领域/场景中有处于停用状态的，启用后将不可用");
    }

    if (editingRelationship) {
      dataStore.updateRelationship(editingRelationship.id, formData);
      toast.success("适用关系更新成功");
    } else {
      dataStore.addRelationship(formData);
      toast.success("适用关系创建成功，状态为停用");
    }

    loadData();
    handleCloseDialog();
  };

  const handleDelete = (relationship: Relationship) => {
    const industryName = getIndustryName(relationship.industryId);
    const domainName = getDomainName(relationship.domainId);
    const scenarioName = getScenarioName(relationship.scenarioId);
    
    if (window.confirm(`确定要删除组合"${industryName} - ${domainName} - ${scenarioName}"吗？`)) {
      const success = dataStore.deleteRelationship(relationship.id);
      if (success) {
        toast.success("适用关系删除成功");
        loadData();
      } else {
        toast.error("该组合已被项目使用，不可删除");
      }
    }
  };

  const handleToggleEnabled = (relationship: Relationship) => {
    const newEnabled = !relationship.enabled;
    
    if (newEnabled) {
      // 检查关联对象是否都启用
      const industry = dataStore.getIndustry(relationship.industryId);
      const domain = dataStore.getDomain(relationship.domainId);
      const scenario = dataStore.getScenario(relationship.scenarioId);
      
      const disabledItems: string[] = [];
      if (industry && !industry.enabled) disabledItems.push(`行业"${industry.name}"`);
      if (domain && !domain.enabled) disabledItems.push(`领域"${domain.name}"`);
      if (scenario && !scenario.enabled) disabledItems.push(`场景"${scenario.name}"`);
      
      if (disabledItems.length > 0) {
        toast.warning(`${disabledItems.join("、")}当前为停用状态，启用后将不可用`);
      }
    } else {
      if (relationship.usedByProjects) {
        toast.warning("该组合已被项目使用，停用后已使用该组合的项目不受影响，但新项目不可选用");
      }
    }
    
    dataStore.updateRelationship(relationship.id, { enabled: newEnabled });
    toast.success(newEnabled ? "适用关系已启用" : "适用关系已停用");
    loadData();
  };

  const warnings = checkWarnings();

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography sx={{ fontSize: "20px", fontWeight: 600, color: "#111827" }}>适用关系管理</Typography>
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
          新增适用关系
        </Button>
      </Box>

      <Alert 
        severity="info" 
        sx={{ 
          mb: 3,
          bgcolor: "#dbeafe",
          color: "#1e40af",
          border: "1px solid #93c5fd",
          borderRadius: "6px",
          fontSize: "13px",
          py: 1,
          alignItems: "center",
          "& .MuiAlert-message": {
            fontSize: "13px",
            py: 0,
            display: "flex",
            alignItems: "center"
          },
          "& .MuiAlert-icon": {
            color: "#3b82f6",
            fontSize: "18px",
            mr: 1,
            py: 0
          }
        }}
      >
        场景组合的可用性取决于行业、领域、场景及适用关系四者启用状态的联合判定
      </Alert>

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
              <TableCell sx={{ fontSize: "12px", fontWeight: 500, color: "#6b7280", py: 1.5 }}>行业</TableCell>
              <TableCell sx={{ fontSize: "12px", fontWeight: 500, color: "#6b7280", py: 1.5 }}>领域</TableCell>
              <TableCell sx={{ fontSize: "12px", fontWeight: 500, color: "#6b7280", py: 1.5 }}>场景</TableCell>
              <TableCell sx={{ fontSize: "12px", fontWeight: 500, color: "#6b7280", py: 1.5 }}>启用状态</TableCell>
              <TableCell sx={{ fontSize: "12px", fontWeight: 500, color: "#6b7280", py: 1.5 }}>组合状态</TableCell>
              <TableCell sx={{ fontSize: "12px", fontWeight: 500, color: "#6b7280", py: 1.5 }}>创建时间</TableCell>
              <TableCell align="right" sx={{ fontSize: "12px", fontWeight: 500, color: "#6b7280", py: 1.5 }}>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {relationships.map((relationship) => {
              const isAvailable = isRelationshipAvailable(relationship);
              return (
                <TableRow 
                  key={relationship.id}
                  sx={{
                    "&:hover": {
                      bgcolor: "#fafafa"
                    },
                    "&:last-child td": {
                      borderBottom: 0
                    }
                  }}
                >
                  <TableCell sx={{ fontSize: "12px", color: "#374151", py: 1.5 }}>{getIndustryName(relationship.industryId)}</TableCell>
                  <TableCell sx={{ fontSize: "12px", color: "#374151", py: 1.5 }}>{getDomainName(relationship.domainId)}</TableCell>
                  <TableCell sx={{ fontSize: "12px", color: "#374151", py: 1.5 }}>{getScenarioName(relationship.scenarioId)}</TableCell>
                  <TableCell sx={{ py: 1.5 }}>
                    <Chip
                      label={relationship.enabled ? "已启用" : "已停用"}
                      size="small"
                      sx={{
                        height: "20px",
                        fontSize: "11px",
                        bgcolor: relationship.enabled ? "#d1fae5" : "#f3f4f6",
                        color: relationship.enabled ? "#065f46" : "#374151",
                        border: "none",
                        "& .MuiChip-label": { px: 1 }
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ py: 1.5 }}>
                    {isAvailable ? (
                      <Chip
                        icon={<CheckCircle sx={{ fontSize: "14px !important" }} />}
                        label="可用"
                        size="small"
                        sx={{
                          height: "20px",
                          fontSize: "11px",
                          bgcolor: "#d1fae5",
                          color: "#065f46",
                          border: "none",
                          "& .MuiChip-label": { px: 1 },
                          "& .MuiChip-icon": { ml: 0.5 }
                        }}
                      />
                    ) : (
                      <Chip
                        icon={<Warning sx={{ fontSize: "14px !important" }} />}
                        label="不可用"
                        size="small"
                        sx={{
                          height: "20px",
                          fontSize: "11px",
                          bgcolor: "#fef3c7",
                          color: "#92400e",
                          border: "none",
                          "& .MuiChip-label": { px: 1 },
                          "& .MuiChip-icon": { ml: 0.5 }
                        }}
                      />
                    )}
                  </TableCell>
                  <TableCell sx={{ fontSize: "12px", color: "#374151", py: 1.5 }}>{new Date(relationship.createdAt).toLocaleString("zh-CN")}</TableCell>
                  <TableCell align="right" sx={{ py: 1.5 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={relationship.enabled}
                          onChange={() => handleToggleEnabled(relationship)}
                          size="small"
                        />
                      }
                      label=""
                      sx={{ mr: 1 }}
                    />
                    <IconButton 
                      size="small" 
                      onClick={() => handleOpenDialog(relationship)}
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
                      onClick={() => handleDelete(relationship)}
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
              );
            })}
            {relationships.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ fontSize: "14px", color: "#6b7280", py: 4 }}>
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
          {editingRelationship ? "编辑适用关系" : "新增适用关系"}
        </DialogTitle>
        <DialogContent sx={{ px: 3, py: 3 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              select
              label="行业"
              value={formData.industryId}
              onChange={(e) => setFormData({ ...formData, industryId: e.target.value })}
              required
              fullWidth
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "6px"
                }
              }}
            >
              {industries.map((industry) => (
                <MenuItem key={industry.id} value={industry.id}>
                  {industry.name} ({industry.code})
                  {!industry.enabled && (
                    <Chip 
                      label="停用" 
                      size="small" 
                      sx={{ 
                        ml: 1,
                        height: "18px",
                        fontSize: "10px",
                        bgcolor: "#f3f4f6",
                        color: "#374151"
                      }} 
                    />
                  )}
                </MenuItem>
              ))}
            </TextField>
            
            <TextField
              select
              label="领域"
              value={formData.domainId}
              onChange={(e) => setFormData({ ...formData, domainId: e.target.value })}
              required
              fullWidth
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "6px"
                }
              }}
            >
              {domains.map((domain) => (
                <MenuItem key={domain.id} value={domain.id}>
                  {domain.name} ({domain.code})
                  {!domain.enabled && (
                    <Chip 
                      label="停用" 
                      size="small" 
                      sx={{ 
                        ml: 1,
                        height: "18px",
                        fontSize: "10px",
                        bgcolor: "#f3f4f6",
                        color: "#374151"
                      }} 
                    />
                  )}
                </MenuItem>
              ))}
            </TextField>
            
            <TextField
              select
              label="场景"
              value={formData.scenarioId}
              onChange={(e) => setFormData({ ...formData, scenarioId: e.target.value })}
              required
              fullWidth
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "6px"
                }
              }}
            >
              {scenarios.map((scenario) => (
                <MenuItem key={scenario.id} value={scenario.id}>
                  {scenario.name} ({scenario.code})
                  {!scenario.enabled && (
                    <Chip 
                      label="停用" 
                      size="small" 
                      sx={{ 
                        ml: 1,
                        height: "18px",
                        fontSize: "10px",
                        bgcolor: "#f3f4f6",
                        color: "#374151"
                      }} 
                    />
                  )}
                </MenuItem>
              ))}
            </TextField>
            
            <FormControlLabel
              control={
                <Switch
                  checked={formData.enabled}
                  onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                />
              }
              label="启用状态"
            />

            {warnings.length > 0 && (
              <Alert 
                severity="warning"
                sx={{
                  bgcolor: "#fef3c7",
                  color: "#92400e",
                  border: "1px solid #fde68a",
                  borderRadius: "6px",
                  "& .MuiAlert-icon": {
                    color: "#f59e0b"
                  }
                }}
              >
                {warnings.map((warning, index) => (
                  <Typography key={index} sx={{ fontSize: "12px" }}>
                    • {warning}
                  </Typography>
                ))}
              </Alert>
            )}
            
            {!editingRelationship && (
              <Typography sx={{ fontSize: "12px", color: "#6b7280" }}>
                注：新增适用关系默认为停用状态，需手动启用后才可选用
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