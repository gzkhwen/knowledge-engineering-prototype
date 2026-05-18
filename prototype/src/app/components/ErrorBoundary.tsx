import { Box, Typography, Button } from "@mui/material";
import { useRouteError, useNavigate } from "react-router";
import { Home, Refresh } from "@mui/icons-material";

export function ErrorBoundary() {
  const error = useRouteError() as { statusText?: string; message?: string };
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        textAlign: "center",
        px: 3,
        bgcolor: "#fafafa",
      }}
    >
      <Typography
        sx={{
          fontSize: "80px",
          fontWeight: 700,
          color: "#ef4444",
          lineHeight: 1,
          mb: 2,
        }}
      >
        Oops!
      </Typography>
      <Typography
        sx={{
          fontSize: "24px",
          fontWeight: 600,
          color: "#111827",
          mb: 1,
        }}
      >
        应用程序错误
      </Typography>
      <Typography
        sx={{
          fontSize: "14px",
          color: "#6b7280",
          mb: 4,
          maxWidth: "500px",
        }}
      >
        {error?.statusText || error?.message || "发生了未知错误，请刷新页面重试"}
      </Typography>
      <Box sx={{ display: "flex", gap: 2 }}>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={() => window.location.reload()}
          sx={{
            color: "#3b82f6",
            borderColor: "#3b82f6",
            textTransform: "none",
            fontSize: "14px",
            px: 3,
            py: 1,
            borderRadius: "6px",
            "&:hover": {
              borderColor: "#2563eb",
              bgcolor: "#eff6ff",
            },
          }}
        >
          刷新页面
        </Button>
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
    </Box>
  );
}
