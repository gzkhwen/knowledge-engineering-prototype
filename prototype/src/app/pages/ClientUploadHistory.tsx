import { useState, useEffect } from "react";
import { useParams } from "react-router";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
} from "@mui/material";
import { InsertDriveFile, Delete, Download } from "@mui/icons-material";
import { dataStore } from "../store/DataStore";
import { RawMaterial, UploadStatus } from "../types";

export function ClientUploadHistory() {
  const { projectId } = useParams<{ projectId: string }>();
  const [materials, setMaterials] = useState<RawMaterial[]>([]);

  useEffect(() => {
    loadMaterials();
  }, [projectId]);

  const loadMaterials = () => {
    if (!projectId) return;
    const allMaterials = dataStore.getRawMaterials(projectId);
    // 按上传时间倒序排列
    const sorted = [...allMaterials].sort(
      (a, b) => new Date(b.uploadTime).getTime() - new Date(a.uploadTime).getTime()
    );
    setMaterials(sorted);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const getStatusColor = (status: UploadStatus) => {
    switch (status) {
      case UploadStatus.SUCCESS:
        return { bg: "#d1fae5", text: "#065f46" };
      case UploadStatus.UPLOADING:
        return { bg: "#fef3c7", text: "#92400e" };
      case UploadStatus.FAILED:
        return { bg: "#fee2e2", text: "#991b1b" };
      default:
        return { bg: "#e5e7eb", text: "#6b7280" };
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("确定要删除这条上传记录吗？")) {
      dataStore.deleteRawMaterial(id);
      loadMaterials();
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography sx={{ fontSize: "20px", fontWeight: 600, color: "#111827", mb: 3 }}>
        上传记录
      </Typography>

      {materials.length === 0 ? (
        <Paper
          sx={{
            p: 6,
            textAlign: "center",
            bgcolor: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
          }}
        >
          <InsertDriveFile sx={{ fontSize: 64, color: "#9ca3af", mb: 2 }} />
          <Typography sx={{ fontSize: "16px", color: "#6b7280", mb: 1 }}>暂无上传记录</Typography>
          <Typography sx={{ fontSize: "14px", color: "#9ca3af" }}>
            请先上传文件
          </Typography>
        </Paper>
      ) : (
        <TableContainer
          component={Paper}
          sx={{
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}
        >
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "#f9fafb" }}>
                <TableCell sx={{ fontSize: "13px", fontWeight: 600, color: "#6b7280" }}>
                  文件名
                </TableCell>
                <TableCell sx={{ fontSize: "13px", fontWeight: 600, color: "#6b7280" }}>
                  文件大小
                </TableCell>
                <TableCell sx={{ fontSize: "13px", fontWeight: 600, color: "#6b7280" }}>
                  上传时间
                </TableCell>
                <TableCell sx={{ fontSize: "13px", fontWeight: 600, color: "#6b7280" }}>
                  上传人
                </TableCell>
                <TableCell sx={{ fontSize: "13px", fontWeight: 600, color: "#6b7280" }}>
                  状态
                </TableCell>
                <TableCell sx={{ fontSize: "13px", fontWeight: 600, color: "#6b7280", width: 100 }}>
                  操作
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {materials.map((material) => {
                const statusColor = getStatusColor(material.status);
                return (
                  <TableRow key={material.id} hover>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <InsertDriveFile sx={{ fontSize: 20, color: "#3b82f6" }} />
                        <Box>
                          <Typography sx={{ fontSize: "13px", color: "#111827" }}>
                            {material.fileName}
                          </Typography>
                          <Typography sx={{ fontSize: "11px", color: "#9ca3af" }}>
                            {material.fileType.toUpperCase()}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: "13px", color: "#6b7280" }}>
                        {formatFileSize(material.fileSize)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: "13px", color: "#6b7280" }}>
                        {new Date(material.uploadTime).toLocaleString("zh-CN")}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: "13px", color: "#6b7280" }}>
                        {material.uploader}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={material.status}
                        size="small"
                        sx={{
                          height: "20px",
                          fontSize: "11px",
                          bgcolor: statusColor.bg,
                          color: statusColor.text,
                          border: "none",
                          fontWeight: 500,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", gap: 0.5 }}>
                        <Tooltip title="下载">
                          <IconButton size="small" sx={{ color: "#3b82f6" }}>
                            <Download fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="删除">
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(material.id)}
                            sx={{ color: "#ef4444" }}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
