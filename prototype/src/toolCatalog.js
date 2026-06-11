const CATALOG_KEY = 'knowledge-engineering-managed-tools';
const CATEGORY_KEY = 'knowledge-engineering-managed-tool-categories';
const CATALOG_EVENT = 'knowledge-engineering-managed-tool-catalog-changed';

export const defaultCategories = ['文档解析', '文本分片', '知识提取', '质量评估', '系统工具', '未分类'];

function nowText() {
  return new Date().toISOString().slice(0, 16).replace('T', ' ');
}

function createInput(name, type, required = true, description = '') {
  return { name, type, required, description };
}

function createOutput(name, type, description = '') {
  return { name, type, description };
}

const discoveredToolNames = ['文档解析', '文本分片', 'QA提取'];

function defaultToolInputs(toolName) {
  if (toolName.includes('解析')) {
    return [
      createInput('file', 'object', true, '待解析文件对象，包含文件地址、文件名和文件类型。'),
      createInput('parse_mode', 'string', false, '解析模式，例如通用解析、政策条款解析或 OCR 解析。'),
      createInput('language', 'string', false, '文档语言，默认 zh-CN。'),
    ];
  }
  if (toolName.includes('分片')) {
    return [
      createInput('input', 'array<object>', true, '待分片的结构化文本块。'),
      createInput('chunk_size', 'number', false, '单个片段的最大长度。'),
      createInput('overlap', 'number', false, '相邻片段重叠长度。'),
    ];
  }
  if (toolName.includes('存储')) {
    return [
      createInput('存储对象', 'array<object>', true, '需要写入存储的对象集合。'),
      createInput('存储方式', 'string', true, '选择结果写入方式，例如写入 ES。'),
      createInput('写入模式', 'string', true, '写入模式，例如 upsert。'),
    ];
  }
  return [
    createInput('input', 'array<object>', true, '上游工具输出或标准化文本块。'),
    createInput('output_path', 'string', false, '工具结果写入的输出路径。'),
  ];
}

function defaultToolOutputs(toolName) {
  if (toolName.includes('解析')) {
    return [
      createOutput('documentParseResult', 'array<object>', '解析后的文本、版面、图片和表格结构。'),
      createOutput('metadata', 'object', '页数、解析器版本、耗时等元信息。'),
    ];
  }
  if (toolName.includes('分片')) {
    return [
      createOutput('textChunkResult', 'array<object>', '分片后的文本片段集合。'),
      createOutput('stats', 'object', '分片数量、平均长度和重叠配置等统计信息。'),
    ];
  }
  if (toolName.includes('存储')) {
    return [
      createOutput('storageRef', 'string', '写入后的存储引用地址。'),
      createOutput('storedCount', 'number', '本次成功写入的数据条数。'),
      createOutput('writeResult', 'object', '写入确认状态、失败数量和写入模式。'),
    ];
  }
  if (toolName.includes('代码')) {
    return [
      createOutput('scriptResult', 'object', '脚本执行后的完整返回结果。'),
      createOutput('outputVariables', 'array<object>', '用户在代码工具中声明的可引用输出变量。'),
    ];
  }
  if (toolName.includes('QA')) return [createOutput('qaResult', 'array<object>', '抽取出的问答对及来源片段。')];
  if (toolName.includes('摘要')) return [createOutput('summaryResult', 'array<object>', '生成的摘要条目及来源引用。')];
  return [createOutput('result', 'object', '工具执行返回结果。')];
}

function normalizeToolInputs(tool) {
  const defaults = defaultToolInputs(tool.name);
  const defaultByName = new Map(defaults.map((input) => [input.name, input]));
  const source = tool.inputs?.length ? tool.inputs : defaults;
  return source.map((input, index) => {
    const fallback = defaultByName.get(input.name) || defaults[index] || {};
    return {
      ...input,
      type: input.type || fallback.type || 'object',
      required: input.required ?? fallback.required ?? true,
      description: input.description || fallback.description || '',
    };
  });
}

function normalizeToolOutputs(tool) {
  const defaults = defaultToolOutputs(tool.name);
  const defaultByName = new Map(defaults.map((output) => [output.name, output]));
  const source = tool.outputs?.length ? tool.outputs : defaults;
  return source.map((output, index) => {
    const fallback = defaultByName.get(output.name) || defaults[index] || {};
    return {
      ...output,
      type: output.type || fallback.type || 'object',
      description: output.description || fallback.description || '',
    };
  });
}

export const initialServices = [
  {
    id: 'svc-system-internal',
    name: '知识工程内置 MCP Server',
    serviceType: '系统内置',
    endpoint: 'system://knowledge-engineering/internal-mcp',
    transport: 'Streamable HTTP',
    authType: '无鉴权',
    version: 'V1.0.0',
    status: '连接正常',
    locked: true,
    toolCount: 2,
    toolNames: ['代码工具', '数据存储工具'],
    lastSyncedAt: '2026-05-29 09:30',
    description: '知识工程平台自研维护的系统工具服务，向 Agent 和流程引擎提供代码工具、数据存储工具。',
    toolCategories: {
      代码工具: '系统工具',
      数据存储工具: '系统工具',
    },
    tools: [
      { name: '代码工具', description: '接收前置工具输出，执行脚本后产出可被后续工具引用的变量。', enabled: true },
      { name: '数据存储工具', description: '选择工具输出路径并写入 ES 等目标存储。', enabled: true },
    ],
  },
  {
    id: 'svc-nacos',
    name: 'Nacos 知识工程 MCP',
    serviceType: 'Nacos',
    endpoint: 'https://nacos.customer.local/mcp/knowledge',
    transport: 'Streamable HTTP',
    authType: 'API Key',
    version: 'V1.0.0',
    status: '连接正常',
    toolCount: 8,
    toolNames: ['通用解析', '多模态解析', '通用分片', '自定义分隔符分片', 'QA提取', '摘要总结', '文档图谱抽取', '表格深度解析'],
    lastSyncedAt: '2026-05-27 10:18',
    description: '从 Nacos 暴露知识解析、分片和抽取相关工具。',
    toolCategories: {
      通用解析: '文档解析',
      多模态解析: '文档解析',
      通用分片: '内容处理',
      自定义分隔符分片: '内容处理',
      QA提取: '智能生成',
      摘要总结: '智能生成',
      文档图谱抽取: '智能生成',
      表格深度解析: '文档解析',
    },
    tools: [
      { name: '通用解析', description: '解析常见 Office、PDF、HTML 文档并输出文本与结构信息。', enabled: true },
      { name: '多模态解析', description: '面向图片、扫描件和复杂版式文档进行 OCR 与结构化解析。', enabled: true },
      { name: '通用分片', description: '按长度、标题和段落边界生成知识片段。', enabled: true },
      { name: '自定义分隔符分片', description: '按用户指定分隔符拆分文档内容。', enabled: true },
      { name: 'QA提取', description: '从文档内容中抽取问答对。', enabled: true },
      { name: '摘要总结', description: '生成文档或片段摘要。', enabled: true },
      { name: '文档图谱抽取', description: '抽取实体、关系和层级结构。', enabled: false },
      { name: '表格深度解析', description: '识别复杂表格结构并输出结构化单元格内容。', enabled: true },
    ],
  },
  {
    id: 'svc-customer-doc',
    name: '客户自建文档处理 MCP',
    serviceType: '标准 MCP Server',
    endpoint: 'https://mcp.customer.com/document/sse',
    transport: 'SSE',
    authType: 'Bearer Token',
    version: 'V1.1.0',
    status: '连接正常',
    toolCount: 5,
    toolNames: ['医保政策文件解析', '分隔符递归分片', 'OCR解析专用分片', '医保政策文件分片', '关键词提取'],
    lastSyncedAt: '2026-05-27 09:42',
    description: '客户侧自建 MCP Server，提供医保政策文档处理工具。',
    toolCategories: {
      医保政策文件解析: '文档解析',
      分隔符递归分片: '内容处理',
      OCR解析专用分片: '内容处理',
      医保政策文件分片: '内容处理',
      关键词提取: '智能生成',
    },
    tools: [
      { name: '医保政策文件解析', description: '解析医保政策文件并保留条款、章节和附件结构。', enabled: true },
      { name: '分隔符递归分片', description: '按多级分隔符递归拆分内容。', enabled: true },
      { name: 'OCR解析专用分片', description: '面向 OCR 解析结果进行噪声清理和片段拆分。', enabled: true },
      { name: '医保政策文件分片', description: '按医保政策章节和条款边界生成片段。', enabled: true },
      { name: '关键词提取', description: '抽取政策主题词、机构名称和业务关键词。', enabled: true },
    ],
  },
  {
    id: 'svc-quality',
    name: '客户质量评估 MCP',
    serviceType: '标准 MCP Server',
    endpoint: 'https://mcp.customer.com/quality',
    transport: 'Streamable HTTP',
    authType: 'Bearer Token',
    version: 'V0.9.2',
    status: '连接失败',
    toolCount: 2,
    toolNames: ['RAG质量评估', '问答一致性检查'],
    lastSyncedAt: '2026-05-26 17:30',
    description: '客户侧评估工具服务，当前连接失败，保留上次同步工具。',
    toolCategories: {
      RAG质量评估: '质量评估',
      问答一致性检查: '质量评估',
    },
    tools: [
      { name: 'RAG质量评估', description: '基于检索结果、答案和参考材料评估 RAG 质量。', enabled: true },
      { name: '问答一致性检查', description: '检查问答对与原文片段的一致性。', enabled: true },
    ],
  },
];

function flattenTools(services) {
  return services.flatMap((service) => service.tools.map((tool) => ({
    id: `${service.id}-${tool.name}`,
    name: tool.name,
    description: tool.description,
    category: tool.category || service.toolCategories?.[tool.name] || '未分类',
    status: service.status !== '已停用' && tool.enabled !== false ? '可用' : '不可用',
    enabled: service.status !== '已停用' && tool.enabled !== false,
    lastSyncedAt: service.lastSyncedAt || '-',
    serviceId: service.id,
    serviceName: service.name,
    inputs: normalizeToolInputs(tool),
    outputs: normalizeToolOutputs(tool),
  })));
}

function normalizeStoredTools(tools) {
  return tools.map((tool) => ({
    ...tool,
    id: tool.id || `${tool.serviceId || 'svc'}-${tool.name}`,
    category: tool.category || '未分类',
    status: tool.status || (tool.enabled === false ? '不可用' : '可用'),
    enabled: tool.enabled ?? tool.status !== '不可用',
    lastSyncedAt: tool.lastSyncedAt || '-',
    inputs: normalizeToolInputs(tool),
    outputs: normalizeToolOutputs(tool),
  }));
}

export function loadServices() {
  try {
    const saved = localStorage.getItem('knowledge-engineering-mcp-services');
    return saved ? JSON.parse(saved).map(normalizeService) : initialServices;
  } catch {
    return initialServices;
  }
}

function normalizeService(service) {
  const seed = initialServices.find((item) => item.id === service.id);
  if (seed && (!service.serviceType || service.type || service.endpoint !== seed.endpoint)) {
    return { ...seed, status: service.status || seed.status };
  }
  const serviceType = service.serviceType || service.type || '标准 MCP Server';
  const tools = service.tools || [];
  return {
    ...service,
    serviceType,
    version: service.version || 'V1.0.0',
    status: service.enabled === false ? '已停用' : service.status || '连接中',
    toolCount: service.toolCount ?? tools.length,
    toolNames: service.toolNames || tools.map((tool) => tool.name),
    toolCategories: service.toolCategories || Object.fromEntries(tools.map((tool) => [tool.name, tool.category || '未分类'])),
    tools: tools.map((tool) => ({ ...tool, enabled: tool.enabled ?? tool.status !== '不可用' })),
  };
}

export function saveServices(services) {
  localStorage.setItem('knowledge-engineering-mcp-services', JSON.stringify(services));
  const existing = readCatalog();
  const customCategories = readCategories();
  const nextTools = flattenTools(services).map((tool) => {
    const current = existing.tools.find((item) => item.name === tool.name && item.serviceName === tool.serviceName);
    return current ? { ...tool, category: current.category } : tool;
  });
  saveCatalog(nextTools, customCategories);
}

function readCategories() {
  try {
    const value = localStorage.getItem(CATEGORY_KEY);
    return value ? JSON.parse(value) : defaultCategories;
  } catch {
    return defaultCategories;
  }
}

export function readCatalog() {
  try {
    const tools = JSON.parse(localStorage.getItem(CATALOG_KEY) || 'null');
    const categories = readCategories();
    if (tools) return { tools: normalizeStoredTools(tools), categories };
  } catch {
    // ignore
  }
  const tools = flattenTools(loadServices());
  const categories = Array.from(new Set(tools.map((tool) => tool.category)));
  saveCatalog(tools, categories);
  return { tools, categories };
}

export function saveCatalog(tools, categories) {
  localStorage.setItem(CATALOG_KEY, JSON.stringify(tools));
  localStorage.setItem(CATEGORY_KEY, JSON.stringify(categories));
  window.dispatchEvent(new CustomEvent(CATALOG_EVENT, { detail: { updatedAt: nowText() } }));
}

export function subscribeCatalog(listener) {
  const onStorage = (event) => {
    if (event.key === CATALOG_KEY || event.key === CATEGORY_KEY) listener();
  };
  window.addEventListener(CATALOG_EVENT, listener);
  window.addEventListener('storage', onStorage);
  return () => {
    window.removeEventListener(CATALOG_EVENT, listener);
    window.removeEventListener('storage', onStorage);
  };
}

export function createEmptyServiceDraft() {
  return {
    name: '',
    serviceType: '标准 MCP Server',
    transport: 'Streamable HTTP',
    endpoint: '',
    authType: 'Bearer Token',
    authHeader: 'Authorization',
    authValue: '',
    version: 'V1.0.0',
    description: '',
    configMode: 'simple',
    headers: [{ id: 'header-1', key: 'Authorization', value: 'Bearer ${token}' }],
    connectionTimeout: '60',
    sseReadTimeout: '60',
    jsonConfig: `{
  "mcpServers": {
    "serverName": {
      "transport": "streamable_http",
      "url": "https://example.com/mcp",
      "headers": {
        "Authorization": "Bearer \${token}"
      },
      "timeout": 60
    }
  }
}`,
  };
}

export function syncService(service) {
  if (service.locked) return service;
  if (!service || service.status === '连接失败') return { ...service, status: '连接失败' };
  const tools = service.tools?.length ? service.tools : [
    ...discoveredToolNames.map((name) => ({ name, description: '从 MCP Server 同步的工具，待管理员补充分组和说明。', enabled: true })),
  ];
  return {
    ...service,
    tools,
    status: '连接正常',
    toolCount: Math.max(service.toolCount || 0, discoveredToolNames.length),
    toolNames: service.toolNames?.length ? service.toolNames : discoveredToolNames,
    lastSyncedAt: nowText(),
  };
}
