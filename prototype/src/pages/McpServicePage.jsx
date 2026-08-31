import { useRef, useState } from 'react';
import { PlusOutlined, SearchOutlined, SyncOutlined } from '@ant-design/icons';
import {
  App,
  Button,
  Card,
  Drawer,
  Empty,
  Form,
  Popconfirm,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import {
  ModalForm,
  ProFormDigit,
  ProFormDependency,
  ProFormGroup,
  ProFormList,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import {
  createEmptyServiceDraft,
  loadServices,
  saveServices,
  syncService,
} from '../toolCatalog.js';

const serviceNamePattern = /^(?!_)[\u4e00-\u9fa5A-Za-z0-9 _]+$/;

const serviceStatusMeta = {
  连接正常: { color: 'success', label: '连接正常' },
  连接失败: { color: 'error', label: '连接失败' },
  连接中: { color: 'processing', label: '连接中' },
  停用: { color: 'default', label: '停用' },
};

function toFormValues(draft) {
  return {
    ...draft,
    headers: draft.headers || [],
    connectionTimeout: Number(draft.connectionTimeout || 60),
  };
}

function formFingerprint(values = {}) {
  return JSON.stringify({
    name: values.name || '',
    description: values.description || '',
    transport: values.transport || '',
    endpoint: values.endpoint || '',
    headers: (values.headers || []).map((header) => ({
      key: header?.key || '',
      value: header?.value || '',
    })),
    connectionTimeout: Number(values.connectionTimeout || 60),
  });
}

export function McpServicePage() {
  const [form] = Form.useForm();
  const initialFormFingerprint = useRef('');
  const { message, modal } = App.useApp();
  const [services, setServices] = useState(loadServices);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailService, setDetailService] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [draftBase, setDraftBase] = useState(null);

  const notify = (content, type = 'info') => message[type](content);

  const persist = (next) => {
    setServices(next);
    saveServices(next);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingId(null);
    setDraftBase(null);
    initialFormFingerprint.current = '';
    form.resetFields();
  };

  const requestCloseDialog = () => {
    const currentFingerprint = formFingerprint(form.getFieldsValue(true));
    if (currentFingerprint === initialFormFingerprint.current) {
      closeDialog();
      return;
    }
    modal.confirm({
      title: '放弃未保存的修改？',
      content: '关闭后，本次填写的 MCP 服务信息不会保留。',
      okText: '放弃修改',
      cancelText: '继续编辑',
      okButtonProps: { danger: true },
      onOk: closeDialog,
    });
  };

  const openCreate = () => {
    const nextDraft = createEmptyServiceDraft();
    setEditingId(null);
    setDraftBase(nextDraft);
    form.resetFields();
    const nextValues = toFormValues(nextDraft);
    form.setFieldsValue(nextValues);
    initialFormFingerprint.current = formFingerprint(nextValues);
    setDialogOpen(true);
  };

  const openEdit = (service) => {
    if (service.locked) {
      notify('系统内置 MCP Server 不允许修改连接信息', 'warning');
      return;
    }
    const nextDraft = {
      name: service.name,
      serviceType: service.serviceType,
      transport: service.transport,
      endpoint: service.endpoint,
      authType: service.authType,
      authHeader: service.authType === 'API Key' ? 'x-api-key' : 'Authorization',
      authValue: '',
      version: service.version,
      description: service.description,
      headers: service.authType === '无鉴权'
        ? []
        : [{ id: 'header-1', key: service.authType === 'API Key' ? 'x-api-key' : 'Authorization', value: '' }],
      connectionTimeout: '60',
    };
    setEditingId(service.id);
    setDraftBase(nextDraft);
    form.resetFields();
    const nextValues = toFormValues(nextDraft);
    form.setFieldsValue(nextValues);
    initialFormFingerprint.current = formFingerprint(nextValues);
    setDialogOpen(true);
  };

  const toService = (serviceDraft, id = `svc-${Date.now()}`) => ({
    id,
    name: serviceDraft.name.trim(),
    serviceType: serviceDraft.serviceType,
    transport: serviceDraft.transport,
    endpoint: serviceDraft.endpoint.trim(),
    authType: serviceDraft.authType,
    version: serviceDraft.version.trim() || 'V1.0.0',
    description: serviceDraft.description.trim(),
    status: '连接中',
    toolCount: id.startsWith('svc-') ? 0 : 3,
    toolNames: [],
    tools: [],
    toolCategories: {},
    lastSyncedAt: '-',
  });

  const saveService = async (values) => {
    if (!draftBase) return false;
    const serviceDraft = {
      ...draftBase,
      ...values,
      headers: values.headers || [],
      connectionTimeout: String(values.connectionTimeout || 60),
    };

    if (editingId) {
      persist(services.map((item) => (
        item.id === editingId
          ? {
              ...item,
              ...toService(serviceDraft, editingId),
              toolCount: item.toolCount,
              toolNames: item.toolNames,
              tools: item.tools,
              toolCategories: item.toolCategories,
              lastSyncedAt: item.lastSyncedAt,
              status: '连接中',
            }
          : item
      )));
      notify('MCP 服务已更新', 'success');
    } else {
      persist([...services, { ...toService(serviceDraft), toolCount: 0 }]);
      notify('MCP 服务已接入', 'success');
    }

    closeDialog();
    return false;
  };

  const syncOneService = (service) => {
    if (service.locked) {
      notify('系统内置 MCP Server 由平台自动维护，无需手动同步', 'info');
      return;
    }
    if (service.status === '停用') {
      notify('请先启用 MCP 服务，再刷新连接', 'warning');
      return;
    }
    const nextService = syncService(service);
    persist(services.map((item) => (item.id === service.id ? nextService : item)));
    notify(
      nextService.status === '连接失败' ? 'MCP Server同步失败' : 'MCP Server同步成功',
      nextService.status === '连接失败' ? 'error' : 'success',
    );
  };

  const enableService = (service) => {
    if (service.locked) {
      notify('系统内置 MCP Server 不允许停用', 'warning');
      return;
    }
    persist(services.map((item) => (item.id === service.id ? { ...item, status: '连接中' } : item)));
    notify('MCP 服务已启用，正在检查连接', 'success');
  };

  const disableService = (service) => {
    persist(services.map((item) => (item.id === service.id ? { ...item, status: '停用' } : item)));
    notify('MCP 服务已停用', 'warning');
  };

  const deleteService = (service) => {
    if (service.locked) {
      notify('系统内置 MCP Server 不允许删除', 'warning');
      return;
    }
    persist(services.filter((item) => item.id !== service.id));
    notify('MCP 服务已删除', 'success');
  };

  const formatSyncTime = (value) => {
    if (!value || value === '-') return '未同步';
    const [datePart, timePart = ''] = value.split(' ');
    const [year, month, day] = datePart.split('-');
    if (!year || !month || !day) return value;
    return `${year}年${Number(month)}月${Number(day)}日 ${timePart}`;
  };

  const columns = [
    {
      title: '服务名称',
      dataIndex: 'name',
      render: (_, service) => <Typography.Text strong>{service.name}</Typography.Text>,
    },
    {
      title: '协议',
      dataIndex: 'transport',
      render: (_, service) => <Tag color="blue">{service.transport}</Tag>,
    },
    {
      title: '服务地址',
      dataIndex: 'endpoint',
      ellipsis: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      render: (_, service) => {
        const status = serviceStatusMeta[service.status] || serviceStatusMeta.停用;
        return (
          <Space size="small">
            <Tag color={status.color}>{status.label}</Tag>
            {service.status !== '停用' ? (
              <Tooltip title={service.locked ? '系统内置服务自动维护' : '检查并同步 MCP 服务'}>
                <Button
                  type="text"
                  size="small"
                  icon={<SyncOutlined />}
                  disabled={service.locked}
                  aria-label={`同步 ${service.name}`}
                  onClick={() => syncOneService(service)}
                />
              </Tooltip>
            ) : null}
          </Space>
        );
      },
    },
    {
      title: '工具数',
      dataIndex: 'toolCount',
      render: (_, service) => (
        <Space size="small">
          <Typography.Text>{service.toolCount} 个</Typography.Text>
          <Tooltip title="查看工具列表">
            <Button
              type="text"
              size="small"
              icon={<SearchOutlined />}
              aria-label={`查看 ${service.name} 的工具列表`}
              onClick={() => setDetailService(service)}
            />
          </Tooltip>
        </Space>
      ),
    },
    {
      title: '最近检查/同步',
      dataIndex: 'lastSyncedAt',
      render: (_, service) => (service.status === '连接中' ? '检查中' : service.lastSyncedAt),
    },
    {
      title: '操作',
      valueType: 'option',
      fixed: 'right',
      render: (_, service) => {
        const toggleButton = (
          <Button
            key="toggle"
            type="link"
            size="small"
            disabled={service.locked}
            onClick={service.status === '停用' ? () => enableService(service) : undefined}
          >
            {service.status === '停用' ? '启用' : '停用'}
          </Button>
        );

        return [
          service.status === '停用' || service.locked ? toggleButton : (
            <Popconfirm
              key="disable"
              title="确认停用 MCP 服务？"
              description={`停用后，Agent 和流程引擎将不能继续调用「${service.name}」下的工具。`}
              okText="确认停用"
              cancelText="取消"
              okButtonProps={{ danger: true }}
              onConfirm={() => disableService(service)}
            >
              {toggleButton}
            </Popconfirm>
          ),
          <Button key="edit" type="link" size="small" disabled={service.locked} onClick={() => openEdit(service)}>
            编辑
          </Button>,
          service.locked ? (
            <Button key="delete" type="link" size="small" danger disabled>
              删除
            </Button>
          ) : (
            <Popconfirm
              key="delete"
              title="确认删除 MCP 服务？"
              description={`删除后将无法继续使用「${service.name}」及其工具配置。`}
              okText="确认删除"
              cancelText="取消"
              okButtonProps={{ danger: true }}
              onConfirm={() => deleteService(service)}
            >
              <Button type="link" size="small" danger>删除</Button>
            </Popconfirm>
          ),
        ];
      },
    },
  ];

  const toolColumns = [
    {
      title: '工具名称',
      dataIndex: 'name',
      render: (_, tool) => <Typography.Text strong>{tool.name}</Typography.Text>,
    },
    { title: '工具描述', dataIndex: 'description' },
  ];

  return (
    <>
      <Card
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 600 }}>MCP服务管理</div>
              <div style={{ fontSize: 13, color: '#8c8c8c', marginTop: 4 }}>集中接入、检查和管理平台可用的 MCP 服务。</div>
            </div>
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>接入MCP服务</Button>
          </div>
        }
        style={{ margin: 24 }}
      >
        <Table
          columns={columns}
          dataSource={services}
          rowKey="id"
          pagination={false}
          scroll={{ x: 1080 }}
          locale={{ emptyText: <Empty description="暂无 MCP 服务，请先接入一个服务。" /> }}
        />
      </Card>

      <ModalForm
        form={form}
        open={dialogOpen}
        title={editingId ? '编辑MCP服务' : '接入MCP服务'}
        onOpenChange={(open) => {
          if (!open && dialogOpen) requestCloseDialog();
        }}
        onFinish={saveService}
        submitter={{
          searchConfig: {
            submitText: editingId ? '保存' : '确认接入',
            resetText: '取消',
          },
          resetButtonProps: {
            onClick: requestCloseDialog,
          },
        }}
        modalProps={{
          forceRender: true,
          maskClosable: false,
        }}
      >
        <ProFormText
          name="name"
          label="服务名称"
          placeholder="请输入服务名称"
          rules={[
            { required: true, message: '请输入服务名称' },
            { pattern: serviceNamePattern, message: '支持中英文、数字、空格和下划线，不能以下划线开头' },
          ]}
        />
        <ProFormTextArea
          name="description"
          label="服务描述"
          placeholder="请说明该 MCP 服务提供的能力"
          fieldProps={{ maxLength: 200, showCount: true }}
        />
        <ProFormSelect
          name="transport"
          label="MCP连接协议类型"
          options={[
            { value: 'SSE', label: 'SSE' },
            { value: 'Streamable HTTP', label: 'Streamable HTTP' },
          ]}
          rules={[{ required: true, message: '请选择 MCP 连接协议类型' }]}
        />
        <ProFormDependency name={['transport']}>
          {({ transport }) => (
            <ProFormText
              name="endpoint"
              label="MCP服务地址"
              placeholder={transport === 'Streamable HTTP'
                ? 'https://example.com/mcp'
                : 'https://example.com/mcp/sse'}
              rules={[{ required: true, message: '请输入 MCP 服务地址' }]}
            />
          )}
        </ProFormDependency>
        <ProFormList
          name="headers"
          label="Headers"
          creatorButtonProps={{ creatorButtonText: '添加 Header', type: 'dashed' }}
          itemRender={({ listDom, action }) => (
            <Space align="start">
              {listDom}
              {action}
            </Space>
          )}
        >
          <ProFormGroup>
            <ProFormText name="key" label="变量 Key" placeholder="例如 Authorization" />
            <ProFormText name="value" label="变量 Value" placeholder="请输入变量值" />
          </ProFormGroup>
        </ProFormList>
        <ProFormDigit
          name="connectionTimeout"
          label="最大连接时长（秒）"
          min={1}
          max={3600}
          fieldProps={{ precision: 0 }}
          rules={[{ required: true, message: '请输入最大连接时长' }]}
        />
      </ModalForm>

      <Drawer
        title="工具列表"
        open={Boolean(detailService)}
        size="large"
        destroyOnHidden
        onClose={() => setDetailService(null)}
      >
        {detailService ? (
          <>
            <Typography.Paragraph type="secondary">
              {detailService.name} · 共 {detailService.toolCount} 个工具 · 最近同步于 {formatSyncTime(detailService.lastSyncedAt)}
            </Typography.Paragraph>
            <Table
              rowKey="name"
              size="small"
              columns={toolColumns}
              dataSource={detailService.tools}
              pagination={false}
              locale={{ emptyText: <Empty description="该服务暂未同步到工具。" /> }}
            />
          </>
        ) : null}
      </Drawer>
    </>
  );
}
