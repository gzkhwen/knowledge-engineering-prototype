import { useEffect, useState } from "react";
import { Box, Card, CardContent, Typography, Chip } from "@mui/material";
import { Business, Category, Theaters, AccountTree } from "@mui/icons-material";
import { dataStore } from "../store/DataStore";

export function Dashboard() {
  const [stats, setStats] = useState({
    industries: { total: 0, enabled: 0 },
    domains: { total: 0, enabled: 0 },
    scenarios: { total: 0, enabled: 0 },
    relationships: { total: 0, enabled: 0, available: 0 },
  });

  useEffect(() => {
    const industries = dataStore.getIndustries();
    const domains = dataStore.getDomains();
    const scenarios = dataStore.getScenarios();
    const relationships = dataStore.getRelationships();
    const availableRelationships = dataStore.getAvailableRelationships();

    setStats({
      industries: {
        total: industries.length,
        enabled: industries.filter(i => i.enabled).length,
      },
      domains: {
        total: domains.length,
        enabled: domains.filter(d => d.enabled).length,
      },
      scenarios: {
        total: scenarios.length,
        enabled: scenarios.filter(s => s.enabled).length,
      },
      relationships: {
        total: relationships.length,
        enabled: relationships.filter(r => r.enabled).length,
        available: availableRelationships.length,
      },
    });
  }, []);

  const cards = [
    {
      title: "行业",
      icon: <Business sx={{ fontSize: 28, color: "#3b82f6" }} />,
      total: stats.industries.total,
      enabled: stats.industries.enabled,
    },
    {
      title: "领域",
      icon: <Category sx={{ fontSize: 28, color: "#3b82f6" }} />,
      total: stats.domains.total,
      enabled: stats.domains.enabled,
    },
    {
      title: "场景",
      icon: <Theaters sx={{ fontSize: 28, color: "#3b82f6" }} />,
      total: stats.scenarios.total,
      enabled: stats.scenarios.enabled,
    },
    {
      title: "适用关系",
      icon: <AccountTree sx={{ fontSize: 28, color: "#3b82f6" }} />,
      total: stats.relationships.total,
      enabled: stats.relationships.enabled,
      extra: `可用组合: ${stats.relationships.available}`,
    },
  ];

  return (
    <Box>
      <Typography sx={{ fontSize: "20px", fontWeight: 600, color: "#111827", mb: 1 }}>
        系统概览
      </Typography>
      <Typography sx={{ fontSize: "14px", color: "#6b7280", mb: 3 }}>
        管理行业、领域、场景三套独立枚举及适用关系，为项目知识空间提供可选的场景组合。
      </Typography>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }, gap: 2, mb: 2 }}>
        {cards.map((card) => (
          <Card 
            key={card.title} 
            sx={{ 
              bgcolor: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              "&:hover": {
                boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
              }
            }}
          >
            <CardContent sx={{ p: 2, pb: "16px !important" }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
                <Typography sx={{ fontSize: "12px", color: "#6b7280", fontWeight: 500 }}>
                  {card.title}
                </Typography>
                {card.icon}
              </Box>
              <Typography sx={{ fontSize: "22px", fontWeight: 700, color: "#3b82f6", mb: 1.5, lineHeight: 1 }}>
                {card.total}
              </Typography>
              <Box>
                <Chip 
                  label={`已启用: ${card.enabled}`} 
                  size="small"
                  sx={{
                    height: "20px",
                    fontSize: "11px",
                    bgcolor: "#d1fae5",
                    color: "#065f46",
                    border: "none",
                    "& .MuiChip-label": { px: 1 }
                  }}
                />
              </Box>
              {card.extra && (
                <Typography sx={{ fontSize: "11px", color: "#6b7280", mt: 1 }}>
                  {card.extra}
                </Typography>
              )}
            </CardContent>
          </Card>
        ))}
      </Box>

      <Card sx={{ 
        bgcolor: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: "8px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
      }}>
        <CardContent sx={{ p: 2 }}>
          <Typography sx={{ fontSize: "16px", fontWeight: 600, color: "#111827", mb: 2 }}>
            系统说明
          </Typography>
          <Typography sx={{ fontSize: "14px", color: "#374151", mb: 1 }}>
            • 本系统用于管理行业、领域、场景三套独立枚举及其适用关系
          </Typography>
          <Typography sx={{ fontSize: "14px", color: "#374151", mb: 1 }}>
            • 新增对象默认状态为"停用"，需手动启用后才可被项目选用
          </Typography>
          <Typography sx={{ fontSize: "14px", color: "#374151", mb: 1 }}>
            • 场景组合的可用性取决于行业、领域、场景及适用关系四者启用状态的联合判定
          </Typography>
          <Typography sx={{ fontSize: "14px", color: "#374151", mb: 1 }}>
            • 已被适用关系引用的行业/领域/场景不可删除
          </Typography>
          <Typography sx={{ fontSize: "14px", color: "#374151" }}>
            • 已被项目使用的适用关系不可删除，但可停用
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}