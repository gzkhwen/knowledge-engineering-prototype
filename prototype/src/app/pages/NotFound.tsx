import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router";
import { Home } from "@mui/icons-material";

export function NotFound() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        textAlign: "center",
        px: 3,
      }}
    >
      <Typography
        sx={{
          fontSize: "120px",
          fontWeight: 700,
          color: "#3b82f6",
          lineHeight: 1,
          mb: 2,
        }}
      >
        404
      </Typography>
      <Typography
        sx={{
          fontSize: "24px",
          fontWeight: 600,
          color: "#111827",
          mb: 1,
        }}
      >
        页面未找到
      </Typography>
      <Typography
        sx={{
          fontSize: "14px",
          color: "#6b7280",
          mb: 4,
          maxWidth: "400px",
        }}
      >
        抱歉，您访问的页面不存在。请检查URL是否正确，或返回首页。
      </Typography>
      <Button
        variant="contained"
        startIcon={<Home />}
        onClick={() => navigate("/")}
        sx={{
          bgcolor: "#3b82f6",
          color: "#fff",
          textTransform: "none",
          fontSize: "14px",
          px: 3,
          py: 1,
          borderRadius: "6px",
          "&:hover": {
            bgcolor: "#2563eb",
          },
        }}
      >
        返回首页
      </Button>
    </Box>
  );
}
