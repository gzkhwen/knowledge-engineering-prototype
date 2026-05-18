// Design System - Light Minimal Theme (清新简约主题)
// 本文件定义了统一的样式配置，确保所有页面组件保持一致的设计风格

export const designSystem = {
  // 颜色系统
  colors: {
    primary: {
      main: "#3b82f6",
      light: "#eff6ff",
      dark: "#2563eb",
    },
    neutral: {
      900: "#111827",
      700: "#374151",
      500: "#6b7280",
      400: "#94a3b8",
      300: "#64748b",
    },
    background: {
      page: "#fafafa",
      card: "#ffffff",
      sidebar: "#f8fafc",
      hover: "#f1f5f9",
      tableHeader: "#f9fafb",
      tableStripe: "#fafafa",
    },
    border: {
      main: "#e5e7eb",
      secondary: "#f3f4f6",
    },
    status: {
      success: "#10b981",
      successBg: "#d1fae5",
      successText: "#065f46",
      error: "#ef4444",
      errorBg: "#fee2e2",
      errorText: "#991b1b",
      warning: "#f59e0b",
      warningBg: "#fef3c7",
      warningText: "#92400e",
    },
  },

  // 字体系统
  typography: {
    pageTitle: {
      fontSize: "20px",
      fontWeight: 600,
      color: "#111827",
    },
    cardTitle: {
      fontSize: "16px",
      fontWeight: 600,
      color: "#111827",
    },
    label: {
      fontSize: "12px",
      fontWeight: 400,
      color: "#6b7280",
    },
    body: {
      fontSize: "14px",
      fontWeight: 400,
      color: "#374151",
    },
    dataLarge: {
      fontSize: "24px",
      fontWeight: 700,
      color: "#3b82f6",
    },
    caption: {
      fontSize: "11px",
      fontWeight: 400,
      color: "#6b7280",
    },
    tableHeader: {
      fontSize: "12px",
      fontWeight: 500,
      color: "#6b7280",
    },
    tableCell: {
      fontSize: "12px",
      fontWeight: 400,
      color: "#374151",
    },
  },

  // 间距系统
  spacing: {
    xs: "4px",
    sm: "8px",
    md: "12px",
    base: "16px",
    lg: "24px",
    xl: "32px",
  },

  // 圆角系统
  borderRadius: {
    tag: "4px",
    button: "6px",
    card: "8px",
    dialog: "12px",
  },

  // 阴影系统
  shadows: {
    card: "0 1px 3px rgba(0,0,0,0.1)",
    cardHover: "0 4px 6px rgba(0,0,0,0.1)",
    header: "0 1px 2px rgba(0,0,0,0.05)",
    dialog: "0 20px 25px -5px rgba(0,0,0,0.1)",
    dropdown: "0 4px 12px rgba(0,0,0,0.08)",
  },

  // 组件样式
  components: {
    button: {
      primary: {
        bgcolor: "#3b82f6",
        color: "#ffffff",
        borderRadius: "6px",
        textTransform: "none",
        px: 2,
        py: 1,
        fontSize: "13px",
        boxShadow: "none",
        "&:hover": {
          bgcolor: "#2563eb",
          boxShadow: "none",
        },
      },
      secondary: {
        bgcolor: "#ffffff",
        color: "#374151",
        border: "1px solid #e5e7eb",
        borderRadius: "6px",
        textTransform: "none",
        px: 2,
        py: 1,
        fontSize: "13px",
        "&:hover": {
          bgcolor: "#f9fafb",
        },
      },
      text: {
        textTransform: "none",
        color: "#374151",
        borderRadius: "6px",
        px: 2,
        "&:hover": {
          bgcolor: "#f9fafb",
        },
      },
    },
    card: {
      bgcolor: "#fff",
      border: "1px solid #e5e7eb",
      borderRadius: "8px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
      "&:hover": {
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
      },
    },
    dataCard: {
      bgcolor: "#fff",
      border: "1px solid #e5e7eb",
      borderRadius: "8px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
      p: 2,
      "&:hover": {
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
      },
    },
    table: {
      container: {
        bgcolor: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: "8px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        overflow: "hidden",
      },
      headerRow: {
        bgcolor: "#f9fafb",
      },
      headerCell: {
        fontSize: "12px",
        fontWeight: 500,
        color: "#6b7280",
        py: 1.5,
      },
      row: {
        "&:hover": {
          bgcolor: "#fafafa",
        },
        "&:last-child td": {
          borderBottom: 0,
        },
      },
      cell: {
        fontSize: "12px",
        color: "#374151",
        py: 1.5,
      },
    },
    chip: {
      enabled: {
        height: "20px",
        fontSize: "11px",
        bgcolor: "#d1fae5",
        color: "#065f46",
        border: "none",
        "& .MuiChip-label": { px: 1 },
      },
      disabled: {
        height: "20px",
        fontSize: "11px",
        bgcolor: "#f3f4f6",
        color: "#374151",
        border: "none",
        "& .MuiChip-label": { px: 1 },
      },
    },
    dialog: {
      paper: {
        borderRadius: "12px",
        boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
      },
      title: {
        fontSize: "16px",
        fontWeight: 600,
        color: "#111827",
        borderBottom: "1px solid #e5e7eb",
        py: 2.5,
        px: 3,
      },
      content: {
        px: 3,
        py: 3,
      },
      actions: {
        borderTop: "1px solid #e5e7eb",
        px: 3,
        py: 2,
      },
    },
    input: {
      "& .MuiOutlinedInput-root": {
        borderRadius: "6px",
      },
    },
    iconButton: {
      default: {
        color: "#64748b",
        "&:hover": {
          bgcolor: "#f1f5f9",
        },
      },
      danger: {
        color: "#64748b",
        "&:hover": {
          bgcolor: "#f1f5f9",
          color: "#ef4444",
        },
      },
    },
  },
};
