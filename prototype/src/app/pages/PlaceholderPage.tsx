import { Box, Typography, Paper } from "@mui/material";
import { Construction } from "@mui/icons-material";

interface PlaceholderPageProps {
  title: string;
  description?: string;
}

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <Box sx={{ p: 3 }}>
      <Paper
        sx={{
          p: 6,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 400,
          border: "1px solid #e5e7eb",
          borderRadius: "8px",
          bgcolor: "#fff",
        }}
      >
        <Construction sx={{ fontSize: 64, color: "#9ca3af", mb: 2 }} />
        <Typography sx={{ fontSize: "20px", fontWeight: 600, color: "#111827", mb: 1 }}>
          {title}
        </Typography>
        {description && (
          <Typography sx={{ fontSize: "14px", color: "#6b7280", textAlign: "center", maxWidth: 400 }}>
            {description}
          </Typography>
        )}
      </Paper>
    </Box>
  );
}
