import { useState, useEffect } from "react";
import { useParams } from "react-router";
import {
  Box,
  Typography,
  Button,
  Paper,
  LinearProgress,
  Alert,
  Snackbar,
  IconButton,
} from "@mui/material";
import { CloudUpload, Close, InsertDriveFile } from "@mui/icons-material";
import { dataStore } from "../store/DataStore";
import { UploadStatus, RawMaterial } from "../types";

export function ClientFileUpload() {
  const { projectId } = useParams<{ projectId: string }>();
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });
  const [currentUser, setCurrentUser] = useState<string>("客户");

  useEffect(() => {
    const userStr = localStorage.getItem("currentUser");
    if (userStr) {
      const user = JSON.parse(userStr);
      setCurrentUser(user.displayName || "客户");
    }
  }, []);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const files = Array.from(event.target.files);
      setSelectedFiles(files);
    }
  };

  const handleUpload = async () => {
    if (!projectId || selectedFiles.length === 0) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      // 模拟上传过程
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        
        // 模拟上传延迟
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // 创建上传记录
        const material: Omit<RawMaterial, "id"> = {
          projectId,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.name.split(".").pop() || "unknown",
          uploadTime: new Date().toISOString(),
          uploader: currentUser,
          sourceType: "客户端上传",
          status: UploadStatus.SUCCESS,
          fileUrl: `mock://files/${file.name}`,
        };

        dataStore.addRawMaterial(material);
        setUploadProgress(((i + 1) / selectedFiles.length) * 100);
      }

      setSnackbar({
        open: true,
        message: `成功上传 ${selectedFiles.length} 个文件`,
        severity: "success",
      });
      setSelectedFiles([]);
      setUploadProgress(0);
    } catch (error) {
      setSnackbar({
        open: true,
        message: "上传失败，请重试",
        severity: "error",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography sx={{ fontSize: "20px", fontWeight: 600, color: "#111827", mb: 3 }}>
        文件上传
      </Typography>

      <Paper
        sx={{
          p: 4,
          bgcolor: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: "8px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        }}
      >
        {/* 上传区域 */}
        <Box
          sx={{
            border: "2px dashed #cbd5e1",
            borderRadius: "8px",
            p: 6,
            textAlign: "center",
            bgcolor: "#f9fafb",
            mb: 3,
            transition: "all 0.2s",
            "&:hover": {
              borderColor: "#3b82f6",
              bgcolor: "#eff6ff",
            },
          }}
        >
          <CloudUpload sx={{ fontSize: 64, color: "#94a3b8", mb: 2 }} />
          <Typography sx={{ fontSize: "16px", color: "#1e293b", mb: 1, fontWeight: 500 }}>
            选择文件上传
          </Typography>
          <Typography sx={{ fontSize: "13px", color: "#64748b", mb: 3 }}>
            支持 PDF、Word、Excel、TXT 等多种格式
          </Typography>
          <input
            accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.md"
            style={{ display: "none" }}
            id="file-upload"
            type="file"
            multiple
            onChange={handleFileSelect}
            disabled={uploading}
          />
          <label htmlFor="file-upload">
            <Button
              variant="contained"
              component="span"
              disabled={uploading}
              sx={{
                bgcolor: "#3b82f6",
                color: "#fff",
                textTransform: "none",
                fontSize: "14px",
                px: 4,
                py: 1.5,
                borderRadius: "6px",
                "&:hover": { bgcolor: "#2563eb" },
              }}
            >
              选择文件
            </Button>
          </label>
        </Box>

        {/* 已选文件列表 */}
        {selectedFiles.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography sx={{ fontSize: "14px", fontWeight: 600, color: "#111827", mb: 2 }}>
              已选文件 ({selectedFiles.length})
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {selectedFiles.map((file, index) => (
                <Paper
                  key={index}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    p: 2,
                    border: "1px solid #e5e7eb",
                    borderRadius: "6px",
                    bgcolor: "#fff",
                  }}
                >
                  <InsertDriveFile sx={{ fontSize: 24, color: "#3b82f6", mr: 2 }} />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      sx={{
                        fontSize: "13px",
                        fontWeight: 500,
                        color: "#111827",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {file.name}
                    </Typography>
                    <Typography sx={{ fontSize: "12px", color: "#6b7280" }}>
                      {formatFileSize(file.size)}
                    </Typography>
                  </Box>
                  {!uploading && (
                    <IconButton
                      size="small"
                      onClick={() => handleRemoveFile(index)}
                      sx={{ color: "#64748b" }}
                    >
                      <Close fontSize="small" />
                    </IconButton>
                  )}
                </Paper>
              ))}
            </Box>
          </Box>
        )}

        {/* 上传进度 */}
        {uploading && (
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
              <Typography sx={{ fontSize: "13px", color: "#6b7280" }}>上传中...</Typography>
              <Typography sx={{ fontSize: "13px", color: "#6b7280" }}>
                {uploadProgress.toFixed(0)}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={uploadProgress}
              sx={{
                height: 6,
                borderRadius: 3,
                bgcolor: "#e5e7eb",
                "& .MuiLinearProgress-bar": { bgcolor: "#3b82f6" },
              }}
            />
          </Box>
        )}

        {/* 上传按钮 */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
          <Button
            variant="outlined"
            onClick={() => setSelectedFiles([])}
            disabled={uploading || selectedFiles.length === 0}
            sx={{
              borderColor: "#d1d5db",
              color: "#6b7280",
              textTransform: "none",
              fontSize: "14px",
              px: 3,
              "&:hover": { borderColor: "#9ca3af", bgcolor: "#f9fafb" },
            }}
          >
            清空
          </Button>
          <Button
            variant="contained"
            onClick={handleUpload}
            disabled={uploading || selectedFiles.length === 0}
            startIcon={<CloudUpload />}
            sx={{
              bgcolor: "#10b981",
              color: "#fff",
              textTransform: "none",
              fontSize: "14px",
              px: 3,
              "&:hover": { bgcolor: "#059669" },
            }}
          >
            {uploading ? "上传中..." : "开始上传"}
          </Button>
        </Box>

        {/* 提示信息 */}
        <Alert
          severity="info"
          sx={{
            mt: 3,
            bgcolor: "#eff6ff",
            color: "#1e40af",
            border: "1px solid #bfdbfe",
            borderRadius: "6px",
            fontSize: "13px",
          }}
        >
          上传的文件将用于知识包构建，请确保文件内容准确完整
        </Alert>
      </Paper>

      {/* 提示消息 */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          sx={{ fontSize: "14px", borderRadius: "6px" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
