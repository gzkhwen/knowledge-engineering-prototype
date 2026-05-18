import { useState } from "react";
import { Box, Tabs, Tab } from "@mui/material";
import { RelationshipManagement } from "./RelationshipManagement";
import { IndustryManagement } from "./IndustryManagement";
import { DomainManagement } from "./DomainManagement";
import { ScenarioManagement } from "./ScenarioManagement";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`classification-tabpanel-${index}`}
      aria-labelledby={`classification-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export function ClassificationManagement() {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Box>
      <Box sx={{ borderBottom: 1, borderColor: "#e5e7eb" }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          sx={{
            "& .MuiTabs-indicator": {
              backgroundColor: "#3b82f6",
              height: "2px",
            },
            "& .MuiTab-root": {
              textTransform: "none",
              fontSize: "14px",
              fontWeight: 500,
              color: "#6b7280",
              minHeight: "48px",
              px: 3,
              "&.Mui-selected": {
                color: "#3b82f6",
              },
              "&:hover": {
                color: "#3b82f6",
                backgroundColor: "#f9fafb",
              },
            },
          }}
        >
          <Tab label="适用关系管理" />
          <Tab label="行业管理" />
          <Tab label="领域管理" />
          <Tab label="场景管理" />
        </Tabs>
      </Box>

      <TabPanel value={activeTab} index={0}>
        <RelationshipManagement />
      </TabPanel>
      <TabPanel value={activeTab} index={1}>
        <IndustryManagement />
      </TabPanel>
      <TabPanel value={activeTab} index={2}>
        <DomainManagement />
      </TabPanel>
      <TabPanel value={activeTab} index={3}>
        <ScenarioManagement />
      </TabPanel>
    </Box>
  );
}
