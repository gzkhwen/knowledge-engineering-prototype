import React, { Component } from "react";
import { createRoot } from "react-dom/client";
import { App as AntdApp, Button, Result, Space } from "antd";
import { clearPrototypeStorage } from "./storage.js";
import "./styles.css";

const root = createRoot(document.getElementById("root"));

function RecoveryActions() {
  const reload = () => window.location.reload();
  const resetAndReload = () => {
    const confirmed = window.confirm("仅清除当前原型保存在此浏览器中的本地数据，然后重新加载。是否继续？");
    if (!confirmed) return;
    clearPrototypeStorage();
    window.location.reload();
  };

  return (
    <Space>
      <Button type="primary" onClick={reload}>重新加载</Button>
      <Button danger onClick={resetAndReload}>重置本地数据并重试</Button>
    </Space>
  );
}

function RecoveryPanel() {
  return (
    <Result
      status="error"
      title="原型加载失败"
      subTitle="浏览器中的旧版原型数据可能与当前版本不兼容。可以先重新加载；如仍失败，可重置当前原型的本地数据。"
      extra={<RecoveryActions />}
    />
  );
}

class RuntimeBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Prototype runtime error", error, errorInfo);
  }

  render() {
    return this.state.failed ? <RecoveryPanel /> : this.props.children;
  }
}

function renderApplication(App) {
  root.render(
    <React.StrictMode>
      <RuntimeBoundary>
        <AntdApp>
          <App />
        </AntdApp>
      </RuntimeBoundary>
    </React.StrictMode>,
  );
}

import("./App.jsx")
  .then(({ App }) => renderApplication(App))
  .catch((error) => {
    console.error("Prototype startup error", error);
    root.render(<RecoveryPanel />);
  });
