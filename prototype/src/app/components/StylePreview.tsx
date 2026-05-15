import { Box, Typography, Paper, Grid } from "@mui/material";
import { Dashboard, Business, Category, Theaters, CheckCircle, Cancel } from "@mui/icons-material";

// 方案一：专业深色主题
function DarkProfessionalTheme() {
  return (
    <Box sx={{ bgcolor: "#0a0e1a", minHeight: "600px", border: "2px solid #333", borderRadius: 2, overflow: "hidden" }}>
      {/* 顶栏 */}
      <Box sx={{ bgcolor: "#1a1f36", p: 2, borderBottom: "1px solid #2a2f46" }}>
        <Typography sx={{ color: "#fff", fontWeight: 600, fontSize: "16px" }}>行业/领域/场景管理系统</Typography>
      </Box>
      
      <Box sx={{ display: "flex", height: "calc(100% - 64px)" }}>
        {/* 侧边栏 */}
        <Box sx={{ width: "200px", bgcolor: "#0f1419", borderRight: "1px solid #1e293b", p: 2 }}>
          <Box sx={{ mb: 2, p: 1.5, bgcolor: "#1e293b", borderRadius: 1, borderLeft: "3px solid #2563eb" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "#60a5fa" }}>
              <Dashboard sx={{ fontSize: 18 }} />
              <Typography sx={{ fontSize: "13px" }}>资产管理</Typography>
            </Box>
          </Box>
          
          <Box sx={{ pl: 2 }}>
            <Box sx={{ mb: 1.5, p: 1, bgcolor: "#1a2332", borderRadius: 0.5 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "#94a3b8" }}>
                <Business sx={{ fontSize: 16 }} />
                <Typography sx={{ fontSize: "12px" }}>行业管理</Typography>
              </Box>
            </Box>
            <Box sx={{ mb: 1.5, p: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "#64748b" }}>
                <Category sx={{ fontSize: 16 }} />
                <Typography sx={{ fontSize: "12px" }}>领域管理</Typography>
              </Box>
            </Box>
            <Box sx={{ mb: 1.5, p: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "#64748b" }}>
                <Theaters sx={{ fontSize: 16 }} />
                <Typography sx={{ fontSize: "12px" }}>场景管理</Typography>
              </Box>
            </Box>
          </Box>
        </Box>
        
        {/* 内容区 */}
        <Box sx={{ flex: 1, bgcolor: "#0a0e1a", p: 3 }}>
          <Typography sx={{ color: "#e2e8f0", fontSize: "20px", fontWeight: 600, mb: 3 }}>概览</Typography>
          
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Paper sx={{ p: 2, bgcolor: "#1e293b", borderRadius: 2, border: "1px solid #334155" }}>
                <Typography sx={{ color: "#94a3b8", fontSize: "12px", mb: 1 }}>总行业数</Typography>
                <Typography sx={{ color: "#60a5fa", fontSize: "24px", fontWeight: 700 }}>156</Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Paper sx={{ p: 2, bgcolor: "#1e293b", borderRadius: 2, border: "1px solid #334155" }}>
                <Typography sx={{ color: "#94a3b8", fontSize: "12px", mb: 1 }}>总领域数</Typography>
                <Typography sx={{ color: "#60a5fa", fontSize: "24px", fontWeight: 700 }}>423</Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Paper sx={{ p: 2, bgcolor: "#1e293b", borderRadius: 2, border: "1px solid #334155" }}>
                <Typography sx={{ color: "#94a3b8", fontSize: "12px", mb: 1 }}>总场景数</Typography>
                <Typography sx={{ color: "#60a5fa", fontSize: "24px", fontWeight: 700 }}>891</Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Paper sx={{ p: 2, bgcolor: "#1e293b", borderRadius: 2, border: "1px solid #334155" }}>
                <Typography sx={{ color: "#94a3b8", fontSize: "12px", mb: 1 }}>模板数</Typography>
                <Typography sx={{ color: "#60a5fa", fontSize: "24px", fontWeight: 700 }}>67</Typography>
              </Paper>
            </Grid>
          </Grid>
          
          <Paper sx={{ bgcolor: "#1e293b", borderRadius: 2, border: "1px solid #334155", overflow: "hidden" }}>
            <Box sx={{ p: 2, borderBottom: "1px solid #334155" }}>
              <Typography sx={{ color: "#e2e8f0", fontSize: "14px", fontWeight: 600 }}>行业列表</Typography>
            </Box>
            <Box>
              <Box sx={{ display: "flex", p: 1.5, borderBottom: "1px solid #1e293b", bgcolor: "#0f172a" }}>
                <Typography sx={{ flex: 1, color: "#64748b", fontSize: "12px" }}>行业名称</Typography>
                <Typography sx={{ width: "100px", color: "#64748b", fontSize: "12px" }}>状态</Typography>
              </Box>
              <Box sx={{ display: "flex", p: 1.5, borderBottom: "1px solid #1e293b" }}>
                <Typography sx={{ flex: 1, color: "#cbd5e1", fontSize: "12px" }}>金融行业</Typography>
                <Box sx={{ width: "100px" }}>
                  <CheckCircle sx={{ color: "#10b981", fontSize: 16 }} />
                </Box>
              </Box>
              <Box sx={{ display: "flex", p: 1.5, bgcolor: "#0f172a" }}>
                <Typography sx={{ flex: 1, color: "#cbd5e1", fontSize: "12px" }}>制造业</Typography>
                <Box sx={{ width: "100px" }}>
                  <Cancel sx={{ color: "#ef4444", fontSize: 16 }} />
                </Box>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}

// 方案二：清新简约主题
function LightMinimalTheme() {
  return (
    <Box sx={{ bgcolor: "#fff", minHeight: "600px", border: "2px solid #e5e7eb", borderRadius: 2, overflow: "hidden" }}>
      {/* 顶栏 */}
      <Box sx={{ bgcolor: "#fff", p: 2, borderBottom: "1px solid #e5e7eb", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
        <Typography sx={{ color: "#111827", fontWeight: 600, fontSize: "16px" }}>行业/领域/场景管理系统</Typography>
      </Box>
      
      <Box sx={{ display: "flex", height: "calc(100% - 64px)" }}>
        {/* 侧边栏 */}
        <Box sx={{ width: "200px", bgcolor: "#f8fafc", borderRight: "1px solid #e5e7eb", p: 2 }}>
          <Box sx={{ mb: 2, p: 1.5, bgcolor: "#eff6ff", borderRadius: 1, borderLeft: "3px solid #3b82f6" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "#3b82f6" }}>
              <Dashboard sx={{ fontSize: 18 }} />
              <Typography sx={{ fontSize: "13px", fontWeight: 500 }}>资产管理</Typography>
            </Box>
          </Box>
          
          <Box sx={{ pl: 2 }}>
            <Box sx={{ mb: 1.5, p: 1, borderRadius: 0.5, "&:hover": { bgcolor: "#f1f5f9" } }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "#64748b" }}>
                <Business sx={{ fontSize: 16 }} />
                <Typography sx={{ fontSize: "12px" }}>行业管理</Typography>
              </Box>
            </Box>
            <Box sx={{ mb: 1.5, p: 1, borderRadius: 0.5 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "#94a3b8" }}>
                <Category sx={{ fontSize: 16 }} />
                <Typography sx={{ fontSize: "12px" }}>领域管理</Typography>
              </Box>
            </Box>
            <Box sx={{ mb: 1.5, p: 1, borderRadius: 0.5 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "#94a3b8" }}>
                <Theaters sx={{ fontSize: 16 }} />
                <Typography sx={{ fontSize: "12px" }}>场景管理</Typography>
              </Box>
            </Box>
          </Box>
        </Box>
        
        {/* 内容区 */}
        <Box sx={{ flex: 1, bgcolor: "#fafafa", p: 3 }}>
          <Typography sx={{ color: "#111827", fontSize: "20px", fontWeight: 600, mb: 3 }}>概览</Typography>
          
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Paper sx={{ p: 2, bgcolor: "#fff", borderRadius: 2, border: "1px solid #e5e7eb", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
                <Typography sx={{ color: "#6b7280", fontSize: "12px", mb: 1 }}>总行业数</Typography>
                <Typography sx={{ color: "#3b82f6", fontSize: "24px", fontWeight: 700 }}>156</Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Paper sx={{ p: 2, bgcolor: "#fff", borderRadius: 2, border: "1px solid #e5e7eb", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
                <Typography sx={{ color: "#6b7280", fontSize: "12px", mb: 1 }}>总领域数</Typography>
                <Typography sx={{ color: "#3b82f6", fontSize: "24px", fontWeight: 700 }}>423</Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Paper sx={{ p: 2, bgcolor: "#fff", borderRadius: 2, border: "1px solid #e5e7eb", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
                <Typography sx={{ color: "#6b7280", fontSize: "12px", mb: 1 }}>总场景数</Typography>
                <Typography sx={{ color: "#3b82f6", fontSize: "24px", fontWeight: 700 }}>891</Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Paper sx={{ p: 2, bgcolor: "#fff", borderRadius: 2, border: "1px solid #e5e7eb", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
                <Typography sx={{ color: "#6b7280", fontSize: "12px", mb: 1 }}>模板数</Typography>
                <Typography sx={{ color: "#3b82f6", fontSize: "24px", fontWeight: 700 }}>67</Typography>
              </Paper>
            </Grid>
          </Grid>
          
          <Paper sx={{ bgcolor: "#fff", borderRadius: 2, border: "1px solid #e5e7eb", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", overflow: "hidden" }}>
            <Box sx={{ p: 2, borderBottom: "1px solid #e5e7eb" }}>
              <Typography sx={{ color: "#111827", fontSize: "14px", fontWeight: 600 }}>行业列表</Typography>
            </Box>
            <Box>
              <Box sx={{ display: "flex", p: 1.5, borderBottom: "1px solid #f3f4f6", bgcolor: "#f9fafb" }}>
                <Typography sx={{ flex: 1, color: "#6b7280", fontSize: "12px", fontWeight: 500 }}>行业名称</Typography>
                <Typography sx={{ width: "100px", color: "#6b7280", fontSize: "12px", fontWeight: 500 }}>状态</Typography>
              </Box>
              <Box sx={{ display: "flex", p: 1.5, borderBottom: "1px solid #f3f4f6" }}>
                <Typography sx={{ flex: 1, color: "#374151", fontSize: "12px" }}>金融行业</Typography>
                <Box sx={{ width: "100px" }}>
                  <CheckCircle sx={{ color: "#10b981", fontSize: 16 }} />
                </Box>
              </Box>
              <Box sx={{ display: "flex", p: 1.5, bgcolor: "#fafafa" }}>
                <Typography sx={{ flex: 1, color: "#374151", fontSize: "12px" }}>制造业</Typography>
                <Box sx={{ width: "100px" }}>
                  <Cancel sx={{ color: "#ef4444", fontSize: 16 }} />
                </Box>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}

// 方案三：商务经典主题
function BusinessClassicTheme() {
  return (
    <Box sx={{ bgcolor: "#f5f5f5", minHeight: "600px", border: "2px solid #ddd", borderRadius: 2, overflow: "hidden" }}>
      {/* 顶栏 */}
      <Box sx={{ 
        background: "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)", 
        p: 2, 
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)" 
      }}>
        <Typography sx={{ color: "#fff", fontWeight: 600, fontSize: "16px" }}>行业/领域/场景管理系统</Typography>
      </Box>
      
      <Box sx={{ display: "flex", height: "calc(100% - 64px)" }}>
        {/* 侧边栏 */}
        <Box sx={{ width: "200px", bgcolor: "#1e3a8a", p: 2 }}>
          <Box sx={{ mb: 2, p: 1.5, bgcolor: "rgba(59, 130, 246, 0.3)", borderRadius: 1, borderLeft: "3px solid #fbbf24" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "#fff" }}>
              <Dashboard sx={{ fontSize: 18 }} />
              <Typography sx={{ fontSize: "13px", fontWeight: 500 }}>资产管理</Typography>
            </Box>
          </Box>
          
          <Box sx={{ pl: 2 }}>
            <Box sx={{ mb: 1.5, p: 1, bgcolor: "rgba(255,255,255,0.1)", borderRadius: 0.5 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "#dbeafe" }}>
                <Business sx={{ fontSize: 16 }} />
                <Typography sx={{ fontSize: "12px" }}>行业管理</Typography>
              </Box>
            </Box>
            <Box sx={{ mb: 1.5, p: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "#93c5fd" }}>
                <Category sx={{ fontSize: 16 }} />
                <Typography sx={{ fontSize: "12px" }}>领域管理</Typography>
              </Box>
            </Box>
            <Box sx={{ mb: 1.5, p: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "#93c5fd" }}>
                <Theaters sx={{ fontSize: 16 }} />
                <Typography sx={{ fontSize: "12px" }}>场景管理</Typography>
              </Box>
            </Box>
          </Box>
        </Box>
        
        {/* 内容区 */}
        <Box sx={{ flex: 1, bgcolor: "#f5f5f5", p: 3 }}>
          <Typography sx={{ color: "#1e40af", fontSize: "20px", fontWeight: 600, mb: 3 }}>概览</Typography>
          
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Paper sx={{ p: 2, bgcolor: "#fff", borderRadius: 1, border: "1px solid #e5e7eb", boxShadow: "0 2px 4px rgba(0,0,0,0.08)" }}>
                <Typography sx={{ color: "#64748b", fontSize: "12px", mb: 1 }}>总行业数</Typography>
                <Typography sx={{ color: "#1e40af", fontSize: "24px", fontWeight: 700 }}>156</Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Paper sx={{ p: 2, bgcolor: "#fff", borderRadius: 1, border: "1px solid #e5e7eb", boxShadow: "0 2px 4px rgba(0,0,0,0.08)" }}>
                <Typography sx={{ color: "#64748b", fontSize: "12px", mb: 1 }}>总领域数</Typography>
                <Typography sx={{ color: "#1e40af", fontSize: "24px", fontWeight: 700 }}>423</Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Paper sx={{ p: 2, bgcolor: "#fff", borderRadius: 1, border: "1px solid #e5e7eb", boxShadow: "0 2px 4px rgba(0,0,0,0.08)" }}>
                <Typography sx={{ color: "#64748b", fontSize: "12px", mb: 1 }}>总场景数</Typography>
                <Typography sx={{ color: "#1e40af", fontSize: "24px", fontWeight: 700 }}>891</Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Paper sx={{ p: 2, bgcolor: "#fff", borderRadius: 1, border: "1px solid #e5e7eb", boxShadow: "0 2px 4px rgba(0,0,0,0.08)" }}>
                <Typography sx={{ color: "#64748b", fontSize: "12px", mb: 1 }}>模板数</Typography>
                <Typography sx={{ color: "#1e40af", fontSize: "24px", fontWeight: 700 }}>67</Typography>
              </Paper>
            </Grid>
          </Grid>
          
          <Paper sx={{ bgcolor: "#fff", borderRadius: 1, border: "1px solid #e5e7eb", boxShadow: "0 2px 4px rgba(0,0,0,0.08)", overflow: "hidden" }}>
            <Box sx={{ p: 2, borderBottom: "1px solid #e5e7eb", bgcolor: "#fafafa" }}>
              <Typography sx={{ color: "#1e40af", fontSize: "14px", fontWeight: 600 }}>行业列表</Typography>
            </Box>
            <Box>
              <Box sx={{ display: "flex", p: 1.5, borderBottom: "1px solid #e5e7eb", bgcolor: "#f8fafc" }}>
                <Typography sx={{ flex: 1, color: "#475569", fontSize: "12px", fontWeight: 600 }}>行业名称</Typography>
                <Typography sx={{ width: "100px", color: "#475569", fontSize: "12px", fontWeight: 600 }}>状态</Typography>
              </Box>
              <Box sx={{ display: "flex", p: 1.5, borderBottom: "1px solid #f3f4f6", bgcolor: "#fff" }}>
                <Typography sx={{ flex: 1, color: "#1e293b", fontSize: "12px" }}>金融行业</Typography>
                <Box sx={{ width: "100px" }}>
                  <CheckCircle sx={{ color: "#10b981", fontSize: 16 }} />
                </Box>
              </Box>
              <Box sx={{ display: "flex", p: 1.5, bgcolor: "#fafafa" }}>
                <Typography sx={{ flex: 1, color: "#1e293b", fontSize: "12px" }}>制造业</Typography>
                <Box sx={{ width: "100px" }}>
                  <Cancel sx={{ color: "#ef4444", fontSize: 16 }} />
                </Box>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}

// 方案四：轻量渐变主题
function LightGradientTheme() {
  return (
    <Box sx={{ bgcolor: "#fafafa", minHeight: "600px", border: "2px solid #e0e7ff", borderRadius: 2, overflow: "hidden" }}>
      {/* 顶栏 */}
      <Box sx={{ 
        background: "linear-gradient(90deg, #6366f1 0%, #8b5cf6 50%, #3b82f6 100%)", 
        p: 2,
        boxShadow: "0 4px 6px rgba(99, 102, 241, 0.1)"
      }}>
        <Typography sx={{ color: "#fff", fontWeight: 600, fontSize: "16px" }}>行业/领域/场景管理系统</Typography>
      </Box>
      
      <Box sx={{ display: "flex", height: "calc(100% - 64px)" }}>
        {/* 侧边栏 */}
        <Box sx={{ 
          width: "200px", 
          background: "linear-gradient(180deg, #f8faff 0%, #f0f4ff 100%)", 
          borderRight: "1px solid #e0e7ff", 
          p: 2 
        }}>
          <Box sx={{ 
            mb: 2, 
            p: 1.5, 
            background: "linear-gradient(135deg, #818cf8 0%, #6366f1 100%)", 
            borderRadius: 2,
            boxShadow: "0 2px 8px rgba(99, 102, 241, 0.2)"
          }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "#fff" }}>
              <Dashboard sx={{ fontSize: 18 }} />
              <Typography sx={{ fontSize: "13px", fontWeight: 500 }}>资产管理</Typography>
            </Box>
          </Box>
          
          <Box sx={{ pl: 2 }}>
            <Box sx={{ mb: 1.5, p: 1, bgcolor: "#eef2ff", borderRadius: 1.5 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "#6366f1" }}>
                <Business sx={{ fontSize: 16 }} />
                <Typography sx={{ fontSize: "12px" }}>行业管理</Typography>
              </Box>
            </Box>
            <Box sx={{ mb: 1.5, p: 1, borderRadius: 1.5 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "#94a3b8" }}>
                <Category sx={{ fontSize: 16 }} />
                <Typography sx={{ fontSize: "12px" }}>领域管理</Typography>
              </Box>
            </Box>
            <Box sx={{ mb: 1.5, p: 1, borderRadius: 1.5 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "#94a3b8" }}>
                <Theaters sx={{ fontSize: 16 }} />
                <Typography sx={{ fontSize: "12px" }}>场景管理</Typography>
              </Box>
            </Box>
          </Box>
        </Box>
        
        {/* 内容区 */}
        <Box sx={{ flex: 1, bgcolor: "#fafafa", p: 3 }}>
          <Typography sx={{ 
            background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontSize: "20px", 
            fontWeight: 700, 
            mb: 3 
          }}>概览</Typography>
          
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Paper sx={{ 
                p: 2, 
                bgcolor: "#fff", 
                borderRadius: 3, 
                border: "1px solid #e0e7ff",
                boxShadow: "0 4px 12px rgba(99, 102, 241, 0.08)",
                background: "linear-gradient(135deg, #fff 0%, #f8faff 100%)"
              }}>
                <Typography sx={{ color: "#6b7280", fontSize: "12px", mb: 1 }}>总行业数</Typography>
                <Typography sx={{ 
                  background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  fontSize: "24px", 
                  fontWeight: 700 
                }}>156</Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Paper sx={{ 
                p: 2, 
                bgcolor: "#fff", 
                borderRadius: 3, 
                border: "1px solid #e0e7ff",
                boxShadow: "0 4px 12px rgba(99, 102, 241, 0.08)",
                background: "linear-gradient(135deg, #fff 0%, #f8faff 100%)"
              }}>
                <Typography sx={{ color: "#6b7280", fontSize: "12px", mb: 1 }}>总领域数</Typography>
                <Typography sx={{ 
                  background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  fontSize: "24px", 
                  fontWeight: 700 
                }}>423</Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Paper sx={{ 
                p: 2, 
                bgcolor: "#fff", 
                borderRadius: 3, 
                border: "1px solid #e0e7ff",
                boxShadow: "0 4px 12px rgba(99, 102, 241, 0.08)",
                background: "linear-gradient(135deg, #fff 0%, #f8faff 100%)"
              }}>
                <Typography sx={{ color: "#6b7280", fontSize: "12px", mb: 1 }}>总场景数</Typography>
                <Typography sx={{ 
                  background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  fontSize: "24px", 
                  fontWeight: 700 
                }}>891</Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Paper sx={{ 
                p: 2, 
                bgcolor: "#fff", 
                borderRadius: 3, 
                border: "1px solid #e0e7ff",
                boxShadow: "0 4px 12px rgba(99, 102, 241, 0.08)",
                background: "linear-gradient(135deg, #fff 0%, #f8faff 100%)"
              }}>
                <Typography sx={{ color: "#6b7280", fontSize: "12px", mb: 1 }}>模板数</Typography>
                <Typography sx={{ 
                  background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  fontSize: "24px", 
                  fontWeight: 700 
                }}>67</Typography>
              </Paper>
            </Grid>
          </Grid>
          
          <Paper sx={{ 
            bgcolor: "#fff", 
            borderRadius: 3, 
            border: "1px solid #e0e7ff",
            boxShadow: "0 4px 12px rgba(99, 102, 241, 0.08)",
            overflow: "hidden" 
          }}>
            <Box sx={{ p: 2, borderBottom: "1px solid #e0e7ff" }}>
              <Typography sx={{ color: "#6366f1", fontSize: "14px", fontWeight: 600 }}>行业列表</Typography>
            </Box>
            <Box>
              <Box sx={{ display: "flex", p: 1.5, borderBottom: "1px solid #f3f4f6", bgcolor: "#fafbff" }}>
                <Typography sx={{ flex: 1, color: "#6b7280", fontSize: "12px", fontWeight: 500 }}>行业名称</Typography>
                <Typography sx={{ width: "100px", color: "#6b7280", fontSize: "12px", fontWeight: 500 }}>状态</Typography>
              </Box>
              <Box sx={{ display: "flex", p: 1.5, borderBottom: "1px solid #f3f4f6" }}>
                <Typography sx={{ flex: 1, color: "#374151", fontSize: "12px" }}>金融行业</Typography>
                <Box sx={{ width: "100px" }}>
                  <CheckCircle sx={{ color: "#10b981", fontSize: 16 }} />
                </Box>
              </Box>
              <Box sx={{ display: "flex", p: 1.5, bgcolor: "#fafbff" }}>
                <Typography sx={{ flex: 1, color: "#374151", fontSize: "12px" }}>制造业</Typography>
                <Box sx={{ width: "100px" }}>
                  <Cancel sx={{ color: "#ef4444", fontSize: 16 }} />
                </Box>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}

export function StylePreview() {
  return (
    <Box sx={{ p: 4, bgcolor: "#f5f5f5", minHeight: "100vh" }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 700, color: "#1a1a1a" }}>
        设计风格预览 - 选择您喜欢的方案
      </Typography>
      
      <Grid container spacing={4}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <Box>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: "#1a1a1a" }}>
              方案一：专业深色主题 🌙
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, color: "#666" }}>
              现代科技感，专业沉稳 | 适合长时间使用，数据密集型操作
            </Typography>
            <DarkProfessionalTheme />
          </Box>
        </Grid>
        
        <Grid size={{ xs: 12, lg: 6 }}>
          <Box>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: "#1a1a1a" }}>
              方案二：清新简约主题 ☀️
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, color: "#666" }}>
              轻量明快，清晰易读 | 内容展示为主，追求简洁高效
            </Typography>
            <LightMinimalTheme />
          </Box>
        </Grid>
        
        <Grid size={{ xs: 12, lg: 6 }}>
          <Box>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: "#1a1a1a" }}>
              方案三：商务经典主题 💼
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, color: "#666" }}>
              稳重大气，传统商务 | 企业级应用，传达信任感
            </Typography>
            <BusinessClassicTheme />
          </Box>
        </Grid>
        
        <Grid size={{ xs: 12, lg: 6 }}>
          <Box>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: "#1a1a1a" }}>
              方案四：轻量渐变主题 🎨
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, color: "#666" }}>
              现代活力，年轻化 | 互联网产品，传达活力感
            </Typography>
            <LightGradientTheme />
          </Box>
        </Grid>
      </Grid>
      
      <Box sx={{ mt: 4, p: 3, bgcolor: "#fff", borderRadius: 2, border: "1px solid #e5e7eb" }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>如何选择？</Typography>
        <Typography variant="body2" sx={{ color: "#666", mb: 1 }}>
          • 如果需要长时间使用、减少视觉疲劳 → 推荐<strong>方案一（深色）</strong>
        </Typography>
        <Typography variant="body2" sx={{ color: "#666", mb: 1 }}>
          • 如果追求清晰简洁、信息展示为主 → 推荐<strong>方案二（简约）</strong>
        </Typography>
        <Typography variant="body2" sx={{ color: "#666", mb: 1 }}>
          • 如果需要正式商务感、企业级应用 → 推荐<strong>方案三（商务）</strong>
        </Typography>
        <Typography variant="body2" sx={{ color: "#666" }}>
          • 如果产品年轻化、追求现代活力 → 推荐<strong>方案四（渐变）</strong>
        </Typography>
      </Box>
    </Box>
  );
}