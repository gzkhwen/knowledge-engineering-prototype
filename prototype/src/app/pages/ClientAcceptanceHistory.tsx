import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
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
  Button,
} from "@mui/material";
import { Assignment, Visibility } from "@mui/icons-material";
import { dataStore } from "../store/DataStore";
import { AcceptanceResult, AcceptanceStatus } from "../types";

export function ClientAcceptanceHistory() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [acceptanceResults, setAcceptanceResults] = useState<AcceptanceResult[]>([]);

  useEffect(() => {
    loadAcceptanceResults();
  }, [projectId]);

  const loadAcceptanceResults = () => {
    if (!projectId) return;
    const results = dataStore.getAcceptanceResults(projectId);
    // 按验收时间倒序排列
    const sorted = [...results].sort(
      (a, b) => new Date(b.acceptanceTime).getTime() - new Date(a.acceptanceTime).getTime()
    );
    setAcceptanceResults(sorted);
  };

  const getStatusColor = (status: AcceptanceStatus) => {
    switch (status) {
      case AcceptanceStatus.ACCEPTED:
        return { bg: "#d1fae5", text: "#065f46" };
      case AcceptanceStatus.PENDING:
        return { bg: "#fef3c7", text: "#92400e" };
      case AcceptanceStatus.FEEDBACK:
        return { bg: "#dbeafe", text: "#1e40af" };
      default:
        return { bg: "#e5e7eb", text: "#6b7280" };
    }
  };

  const handleViewPackage = (packageId: string) => {
    navigate(`/client/project/${projectId}/package/${packageId}`);
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography sx={{ fontSize: "20px", fontWeight: 600, color: "#111827", mb: 3 }}>
        验收记录
      </Typography>

      {acceptanceResults.length === 0 ? (
        <Paper
          sx={{
            p: 6,
            textAlign: "center",
            bgcolor: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
          }}
        >
          <Assignment sx={{ fontSize: 64, color: "#9ca3af", mb: 2 }} />
          <Typography sx={{ fontSize: "16px", color: "#6b7280", mb: 1 }}>暂无验收记录</Typography>
          <Typography sx={{ fontSize: "14px", color: "#9ca3af" }}>
            请先对知识包进行验收
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
                  知识包名称
                </TableCell>
                <TableCell sx={{ fontSize: "13px", fontWeight: 600, color: "#6b7280" }}>
                  验收时间
                </TableCell>
                <TableCell sx={{ fontSize: "13px", fontWeight: 600, color: "#6b7280" }}>
                  验收人
                </TableCell>
                <TableCell sx={{ fontSize: "13px", fontWeight: 600, color: "#6b7280" }}>
                  验收状态
                </TableCell>
                <TableCell sx={{ fontSize: "13px", fontWeight: 600, color: "#6b7280" }}>
                  验收意见
                </TableCell>
                <TableCell sx={{ fontSize: "13px", fontWeight: 600, color: "#6b7280", width: 120 }}>
                  操作
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {acceptanceResults.map((result) => {
                const pkg = dataStore.getKnowledgePackage(result.packageId);
                const statusColor = getStatusColor(result.status);
                return (
                  <TableRow key={result.id} hover>
                    <TableCell>
                      <Typography sx={{ fontSize: "13px", color: "#111827", fontWeight: 500 }}>
                        {pkg?.name || "未知知识包"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: "13px", color: "#6b7280" }}>
                        {new Date(result.acceptanceTime).toLocaleString("zh-CN")}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: "13px", color: "#6b7280" }}>
                        {result.acceptor}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={result.status}
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
                      <Typography
                        sx={{
                          fontSize: "13px",
                          color: "#6b7280",
                          maxWidth: "300px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                        title={result.comments}
                      >
                        {result.comments || "-"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        startIcon={<Visibility />}
                        onClick={() => handleViewPackage(result.packageId)}
                        sx={{
                          textTransform: "none",
                          fontSize: "12px",
                          color: "#3b82f6",
                          "&:hover": { bgcolor: "#eff6ff" },
                        }}
                      >
                        查看详情
                      </Button>
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