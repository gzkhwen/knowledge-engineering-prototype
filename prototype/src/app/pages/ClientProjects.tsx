import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Button,
  Card,
  CardContent,
  CardActions,
} from "@mui/material";
import { FolderOpen, ArrowForward } from "@mui/icons-material";
import { dataStore } from "../store/DataStore";
import { Project } from "../types";

export function ClientProjects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = () => {
    const allProjects = dataStore.getAllProjects();
    // 只显示启用的项目
    const enabledProjects = allProjects.filter((p) => p.enabled);
    setProjects(enabledProjects);
  };

  const getRelationshipDisplay = (relationshipId: string) => {
    const relationship = dataStore.getRelationship(relationshipId);
    if (!relationship) return "-";

    const industry = dataStore.getIndustry(relationship.industryId);
    const domain = dataStore.getDomain(relationship.domainId);
    const scenario = dataStore.getScenario(relationship.scenarioId);

    return `${industry?.name || "-"} / ${domain?.name || "-"} / ${scenario?.name || "-"}`;
  };

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography sx={{ fontSize: "24px", fontWeight: 600, color: "#111827", mb: 1 }}>
          我的项目
        </Typography>
        <Typography sx={{ fontSize: "14px", color: "#6b7280" }}>
          选择项目进行文件上传和知识包验收
        </Typography>
      </Box>

      {projects.length === 0 ? (
        <Paper
          sx={{
            p: 6,
            textAlign: "center",
            bgcolor: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
          }}
        >
          <FolderOpen sx={{ fontSize: 64, color: "#9ca3af", mb: 2 }} />
          <Typography sx={{ fontSize: "16px", color: "#6b7280", mb: 1 }}>
            暂无可用项目
          </Typography>
          <Typography sx={{ fontSize: "14px", color: "#9ca3af" }}>
            请联系管理员创建项目
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {projects.map((project) => (
            <Grid size={{ xs: 12, md: 6, lg: 4 }} key={project.id}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  transition: "all 0.2s",
                  "&:hover": {
                    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                    transform: "translateY(-2px)",
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, mb: 2 }}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: "8px",
                        bgcolor: "#eff6ff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <FolderOpen sx={{ fontSize: 24, color: "#3b82f6" }} />
                    </Box>
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Typography
                        sx={{
                          fontSize: "16px",
                          fontWeight: 600,
                          color: "#111827",
                          mb: 0.5,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {project.name}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: "12px",
                          color: "#9ca3af",
                        }}
                      >
                        {new Date(project.createdAt).toLocaleDateString("zh-CN")}
                      </Typography>
                    </Box>
                  </Box>

                  {project.description && (
                    <Typography
                      sx={{
                        fontSize: "13px",
                        color: "#6b7280",
                        mb: 2,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {project.description}
                    </Typography>
                  )}

                  <Box sx={{ mb: 2 }}>
                    <Typography sx={{ fontSize: "12px", color: "#9ca3af", mb: 0.5 }}>
                      场景组合
                    </Typography>
                    <Typography sx={{ fontSize: "13px", color: "#111827" }}>
                      {getRelationshipDisplay(project.relationshipId)}
                    </Typography>
                  </Box>

                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                    {project.hasContent && (
                      <Chip
                        label="已有内容"
                        size="small"
                        sx={{
                          height: "20px",
                          fontSize: "11px",
                          bgcolor: "#d1fae5",
                          color: "#065f46",
                          border: "none",
                        }}
                      />
                    )}
                    {project.hasSolution && (
                      <Chip
                        label="已配置方案"
                        size="small"
                        sx={{
                          height: "20px",
                          fontSize: "11px",
                          bgcolor: "#dbeafe",
                          color: "#1e40af",
                          border: "none",
                        }}
                      />
                    )}
                  </Box>
                </CardContent>
                <CardActions sx={{ p: 3, pt: 0 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    endIcon={<ArrowForward />}
                    onClick={() => navigate(`/client/project/${project.id}`)}
                    sx={{
                      bgcolor: "#3b82f6",
                      color: "#fff",
                      textTransform: "none",
                      fontSize: "14px",
                      fontWeight: 500,
                      py: 1,
                      borderRadius: "6px",
                      boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                      "&:hover": {
                        bgcolor: "#2563eb",
                      },
                    }}
                  >
                    进入项目
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}