import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
} from "@mui/material";
import { Login as LoginIcon } from "@mui/icons-material";

export function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    if (!username.trim()) {
      setError("请输入用户名");
      return;
    }

    // 保存用户信息到 localStorage
    const user = {
      id: Date.now().toString(),
      username: username.trim(),
      displayName: username.trim(),
    };
    localStorage.setItem("currentUser", JSON.stringify(user));

    navigate("/admin/tool-hub/mcp-services");
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#f8fafc",
        backgroundImage: "linear-gradient(135deg, #eff6ff 0%, #f8fafc 100%)",
      }}
    >
      <Paper
        sx={{
          width: "100%",
          maxWidth: 480,
          p: 5,
          borderRadius: "12px",
          boxShadow: "0 4px 6px rgba(0,0,0,0.05), 0 10px 20px rgba(0,0,0,0.05)",
          border: "1px solid #e5e7eb",
        }}
      >
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              bgcolor: "#eff6ff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto",
              mb: 2,
            }}
          >
            <LoginIcon sx={{ fontSize: 28, color: "#3b82f6" }} />
          </Box>
          <Typography sx={{ fontSize: "24px", fontWeight: 600, color: "#111827", mb: 1 }}>
            知识工程平台
          </Typography>
          <Typography sx={{ fontSize: "14px", color: "#6b7280" }}>
            统一登录入口
          </Typography>
        </Box>

        {error && (
          <Alert
            severity="error"
            sx={{
              mb: 3,
              fontSize: "13px",
              borderRadius: "6px",
            }}
            onClose={() => setError("")}
          >
            {error}
          </Alert>
        )}

        <TextField
          fullWidth
          label="用户名"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="请输入用户名"
          sx={{
            mb: 3,
            "& .MuiInputLabel-root": {
              fontSize: "14px",
            },
            "& .MuiInputBase-input": {
              fontSize: "14px",
            },
          }}
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              handleLogin();
            }
          }}
        />

        <Button
          fullWidth
          variant="contained"
          size="large"
          startIcon={<LoginIcon />}
          onClick={handleLogin}
          sx={{
            bgcolor: "#3b82f6",
            color: "#fff",
            textTransform: "none",
            fontSize: "15px",
            fontWeight: 500,
            py: 1.5,
            borderRadius: "8px",
            boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
            "&:hover": {
              bgcolor: "#2563eb",
            },
          }}
        >
          登录
        </Button>

        <Box sx={{ mt: 3, textAlign: "center" }}>
          <Typography sx={{ fontSize: "12px", color: "#9ca3af" }}>
            演示系统 · 无需密码，输入任意用户名即可登录
          </Typography>
          <Typography sx={{ fontSize: "12px", color: "#9ca3af", mt: 0.75 }}>
            登录后进入管理端，可在右上角头像处切换端
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}
