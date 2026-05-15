import { useParams, useNavigate, Outlet } from "react-router";
import { Box, Typography, Button } from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { dataStore } from "../store/DataStore";

// ProjectWorkspace is now a simple passthrough - the project identifier
// is shown in the top navbar (OpsLayout project selector).
// We just provide the outlet context so children can access the project.
export function ProjectWorkspace() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const project = projectId ? dataStore.getProject(projectId) : null;

  if (!project) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", py: 12, gap: 2 }}>
        <Typography sx={{ fontSize: "15px", color: "#6b7280" }}>项目不存在或已被删除</Typography>
        <Button startIcon={<ArrowBack />} onClick={() => navigate("/ops")}
          sx={{ textTransform: "none", color: "#8b5cf6", "&:hover": { bgcolor: "#f5f3ff" } }}>
          返回项目列表
        </Button>
      </Box>
    );
  }

  return <Outlet context={{ project }} />;
}
