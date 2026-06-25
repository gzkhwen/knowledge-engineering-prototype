const SERVICES_KEY = 'knowledge-engineering-demo-higress-mcp-services-v9';
const CATALOG_KEY = 'knowledge-engineering-demo-higress-managed-tools-v9';
const CATEGORY_KEY = 'knowledge-engineering-demo-higress-managed-tool-categories-v9';
const CATALOG_EVENT = 'knowledge-engineering-managed-tool-catalog-changed';
const LEGACY_KEYS = [
  'knowledge-engineering-demo-higress-mcp-services-v4',
  'knowledge-engineering-demo-higress-managed-tools-v4',
  'knowledge-engineering-demo-higress-managed-tool-categories-v4',
  'knowledge-engineering-demo-higress-mcp-services-v5',
  'knowledge-engineering-demo-higress-managed-tools-v5',
  'knowledge-engineering-demo-higress-managed-tool-categories-v5',
  'knowledge-engineering-demo-higress-mcp-services-v6',
  'knowledge-engineering-demo-higress-managed-tools-v6',
  'knowledge-engineering-demo-higress-managed-tool-categories-v6',
  'knowledge-engineering-demo-higress-mcp-services-v7',
  'knowledge-engineering-demo-higress-managed-tools-v7',
  'knowledge-engineering-demo-higress-managed-tool-categories-v7',
  'knowledge-engineering-demo-higress-mcp-services-v8',
  'knowledge-engineering-demo-higress-managed-tools-v8',
  'knowledge-engineering-demo-higress-managed-tool-categories-v8',
];

export const defaultCategories = ['系统工具', '文档解析', '文本分片', '知识提取', '结果存储'];

function nowText() {
  return new Date().toISOString().slice(0, 16).replace('T', ' ');
}

function purgeLegacyDemoStorage() {
  try {
    LEGACY_KEYS.forEach((key) => localStorage.removeItem(key));
  } catch {
    // ignore
  }
}

purgeLegacyDemoStorage();

function createInput(name, type, required = true, description = '', defaultValue = '') {
  return { name, type, required, description, defaultValue };
}

function createOutput(name, type, description = '', path) {
  return { name, type, description, path: path || name };
}

function createStorageContract({
  enabled = false,
  outputName = '',
  artifactType = '原始结果',
  storageTargetType = 'Elasticsearch',
  esAddress = '',
  esIndex = '',
  objectStorageAddress = '',
  objectStoragePath = '',
  knowledgeBase = '-',
  database = '-',
  directory = '-',
  writeMode = 'upsert',
  indexEnabled = false,
  indexFields = '',
  recallField = '',
  filterFields = '',
  note = '',
  rules = [],
} = {}) {
  return { enabled, outputName, artifactType, storageTargetType, storageType: storageTargetType, esAddress, esIndex, objectStorageAddress, objectStoragePath, knowledgeBase, database, directory, writeMode, indexEnabled, indexFields, recallField, filterFields, note, rules };
}

function normalizeStorageContract(contract) {
  return createStorageContract(contract || {});
}

const higressDemoTools = [
  {
    name: '文件解析',
    description: '解析政策文件，输出章节、段落和文件元数据。',
    category: '未分类',
    enabled: true,
    inputs: [
      createInput('file', 'object', true, '待解析文件信息。'),
      createInput('parse_mode', 'string', false, '解析模式，默认 policy_clause。'),
      createInput('language', 'string', false, '文档语言，默认 zh-CN。'),
      createInput('content', 'string', false, '直接传入的政策正文。'),
    ],
    outputs: [
      createOutput('title', 'string', '解析得到的政策文件标题。'),
      createOutput('sections', 'array<object>', '解析后的政策章节结构，包含 title、content、page。'),
      createOutput('paragraphs', 'array<object>', '标准化段落列表，包含 id、heading、text。'),
      createOutput('metadata', 'object', '页数、文件名、解析耗时等元信息。'),
    ],
  },
  {
    name: '文本分片',
    description: '将政策文本按章节、语义边界和长度上限切分为知识片段。',
    category: '未分类',
    enabled: true,
    inputs: [
      createInput('input', 'array', true, '待切片段落列表。'),
      createInput('chunk_size', 'integer', false, '单个片段目标长度。'),
      createInput('overlap', 'integer', false, '相邻片段重叠长度。'),
    ],
    outputs: [
      createOutput('textChunkResult', 'array<object>', '分片后的文本片段集合。'),
      createOutput('stats', 'object', '分片数量、目标长度和重叠配置。'),
    ],
  },
  {
    name: '知识点提取',
    description: '从政策知识片段中提取知识点、适用对象和关键规则。',
    category: '未分类',
    enabled: true,
    inputs: [
      createInput('input', 'array', true, '知识片段列表。'),
      createInput('summary_type', 'string', false, '摘要类型。'),
      createInput('model', 'string', false, '模型标识。'),
    ],
    outputs: [
      createOutput('summary', 'string', '政策知识点摘要正文。'),
      createOutput('summaryResult', 'array<object>', '知识点条目和来源引用，包含 title、content、sourceChunkIds。'),
      createOutput('applicableUsers', 'array<string>', '适用对象列表。'),
      createOutput('keyRules', 'array<string>', '关键规则列表。'),
    ],
  },
  {
    name: 'QA提取',
    description: '从政策知识片段中提取问答对。',
    category: '未分类',
    enabled: true,
    inputs: [
      createInput('input', 'array', true, '知识片段列表。'),
      createInput('model', 'string', false, '模型标识。'),
      createInput('system_prompt', 'string', false, '问答提取提示词。'),
    ],
    outputs: [
      createOutput('qaResult', 'array<object>', '问题、答案和来源分片，包含 question、answer、sourceChunkId。'),
    ],
  },
];

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
  if (toolName.includes('知识点') || toolName.includes('摘要')) return [createOutput('summaryResult', 'array<object>', '生成的知识点条目及来源引用。')];
  return [createOutput('result', 'object', '工具执行返回结果。')];
}

function normalizeToolInputs(tool) {
  const defaults = defaultToolInputs(tool.name);
  const defaultByName = new Map(defaults.map((input) => [input.name, input]));
  const source = tool.inputs?.length ? tool.inputs : defaults;
  return source.filter((input) => input.name !== 'documentId').map((input, index) => {
    const fallback = defaultByName.get(input.name) || defaults[index] || {};
    return {
      ...input,
      type: input.type || fallback.type || 'object',
      required: input.required ?? fallback.required ?? true,
      description: input.description || fallback.description || '',
      defaultValue: input.defaultValue ?? fallback.defaultValue ?? '',
    };
  });
}

function normalizeToolOutputs(tool) {
  const defaults = defaultToolOutputs(tool.name);
  const defaultByName = new Map(defaults.map((output) => [output.name, output]));
  const source = tool.outputs?.length ? tool.outputs : defaults;
  return source.filter((output) => output.name !== 'documentId').map((output, index) => {
    const fallback = defaultByName.get(output.name) || defaults[index] || {};
    return {
      ...output,
      type: output.type || fallback.type || 'object',
      description: output.description || fallback.description || '',
      path: output.path || fallback.path || output.name || fallback.name || 'result',
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
    id: 'svc-customer-doc',
    name: '客户自建文档处理 MCP',
    serviceType: '标准 MCP Server',
    endpoint: 'https://mcp.customer.com/document/sse',
    transport: 'SSE',
    authType: 'Bearer Token',
    version: 'V1.1.0',
    status: '连接正常',
    toolCount: higressDemoTools.length,
    toolNames: higressDemoTools.map((tool) => tool.name),
    lastSyncedAt: '2026-05-27 09:42',
    description: '客户侧自建 MCP Server，提供文档解析、切片和 QA 抽取等原始工具。',
    toolCategories: Object.fromEntries(higressDemoTools.map((tool) => [tool.name, tool.category || '未分类'])),
    tools: higressDemoTools,
  },
];

function makeManagedTool({
  id,
  name,
  description,
  category,
  kind = '外部工具',
  sourceType = 'MCP工具创建',
  sourceServiceId = '',
  sourceServiceName = '',
  sourceToolName = '',
  inputs = [],
  outputs = [],
  storageContract,
  lastSyncedAt = '-',
  version = 'v1',
}) {
  return {
    id,
    name,
    description,
    category,
    kind,
    sourceType,
    sourceServiceId,
    sourceServiceName,
    sourceToolName,
    serviceId: sourceServiceId,
    serviceName: sourceServiceName || '知识工程平台',
    status: '可用',
    lifecycleStatus: '已发布',
    enabled: true,
    version,
    lastSyncedAt,
    inputs: normalizeToolInputs({ name, inputs }),
    outputs: normalizeToolOutputs({ name, outputs }),
    storageContract: normalizeStorageContract(storageContract),
  };
}

function getRawSource(services, toolName) {
  const service = services.find((item) => !item.locked && item.tools?.some((tool) => tool.name === toolName));
  const rawTool = service?.tools?.find((tool) => tool.name === toolName) || higressDemoTools.find((tool) => tool.name === toolName);
  return {
    serviceId: service?.id || 'svc-demo-mcp',
    serviceName: service?.name || '示例 MCP Server',
    sourceToolName: rawTool?.name || toolName,
    lastSyncedAt: service?.lastSyncedAt || '-',
    rawTool,
  };
}

function initialManagedTools(services = initialServices) {
  const fileParse = getRawSource(services, '文件解析');
  const chunking = getRawSource(services, '文本分片');
  const qaExtract = getRawSource(services, 'QA提取');
  return [
    makeManagedTool({
      id: 'ke-builtin-code-tool',
      name: '代码工具',
      description: '知识工程内置工具，用于在流程中执行少量参数转换、结果清洗和变量生成。',
      category: '系统工具',
      kind: '内置工具',
      sourceType: '平台内置',
      sourceServiceId: 'svc-system-internal',
      sourceServiceName: '知识工程内置 MCP Server',
      sourceToolName: '代码工具',
      inputs: defaultToolInputs('代码工具'),
      outputs: defaultToolOutputs('代码工具'),
      storageContract: createStorageContract({ note: '执行结果默认作为流程变量传递，不强制存储。' }),
      lastSyncedAt: '2026-05-29 09:30',
    }),
    makeManagedTool({
      id: 'ke-builtin-storage-tool',
      name: '数据存储工具',
      description: '知识工程内置工具，用于把上游结果写入指定知识库、目录和存储结构，并返回存储引用。',
      category: '结果存储',
      kind: '内置工具',
      sourceType: '平台内置',
      sourceServiceId: 'svc-system-internal',
      sourceServiceName: '知识工程内置 MCP Server',
      sourceToolName: '数据存储工具',
      inputs: defaultToolInputs('数据存储工具'),
      outputs: defaultToolOutputs('数据存储工具'),
      storageContract: createStorageContract({
        enabled: true,
        outputName: 'storageRef',
        artifactType: '存储引用',
        storageType: '按流程节点配置',
        knowledgeBase: '运行时选择',
        database: '运行时选择',
        directory: '运行时选择',
        writeMode: '运行时选择',
        note: '作为通用存储动作节点使用，具体存储目标在流程节点中配置。',
      }),
      lastSyncedAt: '2026-05-29 09:30',
    }),
    makeManagedTool({
      id: 'ke-standard-file-parse',
      name: '政策文件解析工具',
      description: '基于 MCP 原始工具“文件解析”创建的知识工程工具，统一输出文档章节、段落和元数据。',
      category: '文档解析',
      sourceServiceId: fileParse.serviceId,
      sourceServiceName: fileParse.serviceName,
      sourceToolName: fileParse.sourceToolName,
      inputs: normalizeToolInputs(fileParse.rawTool || { name: '文件解析' }),
      outputs: [
        createOutput('documentSections', 'array<object>', '标准化章节结构，包含标题、正文、页码和层级。'),
        createOutput('paragraphs', 'array<object>', '标准化段落列表，作为后续切片输入。'),
        createOutput('metadata', 'object', '文件名、页数、解析方式和解析耗时。'),
      ],
      storageContract: createStorageContract({ note: '解析结果默认传递给下游切片节点，是否落库由流程决定。' }),
      lastSyncedAt: fileParse.lastSyncedAt,
    }),
    makeManagedTool({
      id: 'ke-standard-parent-child-chunk',
      name: '父子切片工具',
      description: '基于 MCP 原始工具“文本分片”创建的知识工程工具，输出父片、子片和父子关系。',
      category: '文本分片',
      sourceServiceId: chunking.serviceId,
      sourceServiceName: chunking.serviceName,
      sourceToolName: chunking.sourceToolName,
      inputs: normalizeToolInputs(chunking.rawTool || { name: '文本分片' }),
      outputs: [
        createOutput('parentChunks', 'array<object>', '父片集合，用于进入最终上下文。'),
        createOutput('childChunks', 'array<object>', '子片集合，用于向量召回。'),
        createOutput('chunkRelations', 'array<object>', '父片与子片的映射关系。'),
      ],
      storageContract: createStorageContract({
        enabled: true,
        outputName: 'childChunks',
        artifactType: '父子切片',
        storageType: '向量库 + 文档库',
        knowledgeBase: '政策知识库',
        database: 'knowledge_chunks',
        directory: '/{knowledge_space}/chunks/{pipeline_run_id}',
        writeMode: 'upsert',
        indexEnabled: true,
        indexType: '父子切片索引',
        note: '子片进入召回索引，父片和父子关系写入文档库供上下文回填。',
      }),
      lastSyncedAt: chunking.lastSyncedAt,
    }),
    makeManagedTool({
      id: 'ke-standard-qa-extract',
      name: 'QA 对抽取工具',
      description: '基于 MCP 原始工具“QA提取”创建的知识工程工具，统一输出问题、答案和来源引用。',
      category: '知识提取',
      sourceServiceId: qaExtract.serviceId,
      sourceServiceName: qaExtract.serviceName,
      sourceToolName: qaExtract.sourceToolName,
      inputs: normalizeToolInputs(qaExtract.rawTool || { name: 'QA提取' }),
      outputs: [
        createOutput('qaPairs', 'array<object>', '标准 QA 对，包含 question、answer、sourceChunkId 和置信度。'),
        createOutput('qaStats', 'object', 'QA 数量、过滤数量和模型版本。'),
      ],
      storageContract: createStorageContract({
        enabled: true,
        outputName: 'qaPairs',
        artifactType: 'QA对',
        storageType: '文档库',
        knowledgeBase: '政策知识库',
        database: 'knowledge_qa',
        directory: '/{knowledge_space}/qa/{pipeline_run_id}',
        writeMode: 'upsert',
        note: 'QA 对作为独立知识结果存储，可被检索、评测和人工审核模块引用。',
      }),
      lastSyncedAt: qaExtract.lastSyncedAt,
    }),
  ];
}

function normalizeStoredTools(tools) {
  return tools.map((tool) => ({
    ...tool,
    id: tool.id || `${tool.serviceId || 'svc'}-${tool.name}`,
    category: tool.category || '未分类',
    status: tool.status || (tool.enabled === false ? '不可用' : '可用'),
    lifecycleStatus: tool.lifecycleStatus || '已发布',
    kind: tool.kind || (tool.sourceType === '平台内置' ? '内置工具' : '外部工具'),
    sourceType: tool.sourceType || 'MCP工具创建',
    sourceServiceId: tool.sourceServiceId || tool.serviceId || '',
    sourceServiceName: tool.sourceServiceName || tool.serviceName || '',
    sourceToolName: tool.sourceToolName || tool.name,
    version: tool.version || 'v1',
    enabled: tool.enabled ?? tool.status !== '不可用',
    lastSyncedAt: tool.lastSyncedAt || '-',
    inputs: normalizeToolInputs(tool),
    outputs: normalizeToolOutputs(tool),
    storageContract: normalizeStorageContract(tool.storageContract),
  }));
}

export function loadServices() {
  purgeLegacyDemoStorage();
  try {
    const saved = localStorage.getItem(SERVICES_KEY);
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
  localStorage.setItem(SERVICES_KEY, JSON.stringify(services));
  const existing = readCatalog();
  const customCategories = readCategories();
  saveCatalog(existing.tools, mergeCategories(defaultCategories, customCategories));
}

function readCategories() {
  try {
    const value = localStorage.getItem(CATEGORY_KEY);
    return value ? JSON.parse(value) : defaultCategories;
  } catch {
    return defaultCategories;
  }
}

function mergeCategories(...categoryGroups) {
  return Array.from(new Set(categoryGroups.flat().filter(Boolean)));
}

export function readCatalog() {
  try {
    const tools = JSON.parse(localStorage.getItem(CATALOG_KEY) || 'null');
    const categories = readCategories();
    if (tools) return { tools: normalizeStoredTools(tools), categories };
  } catch {
    // ignore
  }
  const tools = initialManagedTools(loadServices());
  const categories = mergeCategories(defaultCategories);
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

export function listRawMcpTools(services = loadServices()) {
  return services
    .filter((service) => !service.locked)
    .flatMap((service) => (service.tools || []).map((tool) => ({
      id: `${service.id}-${tool.name}`,
      serviceId: service.id,
      serviceName: service.name,
      lastSyncedAt: service.lastSyncedAt || '-',
      tool: {
        ...tool,
        inputs: normalizeToolInputs(tool),
        outputs: normalizeToolOutputs(tool),
      },
    })));
}

export function createKnowledgeToolFromRaw(source, overrides = {}) {
  const rawTool = source?.tool || {};
  const name = overrides.name?.trim() || `${rawTool.name || 'MCP工具'}标准化工具`;
  return makeManagedTool({
    id: `ke-standard-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name,
    description: overrides.description?.trim() || rawTool.description || '由 MCP 原始工具创建的知识工程工具。',
    category: overrides.category || rawTool.category || '未分类',
    sourceServiceId: source?.serviceId || '',
    sourceServiceName: source?.serviceName || '',
    sourceToolName: rawTool.name || '',
    inputs: overrides.inputs || rawTool.inputs || defaultToolInputs(rawTool.name || ''),
    outputs: overrides.outputs || rawTool.outputs || defaultToolOutputs(rawTool.name || ''),
    storageContract: createStorageContract({
      enabled: Boolean(overrides.storageRules?.length),
      outputName: overrides.storageRules?.[0]?.outputName || rawTool.outputs?.[0]?.name || '',
      artifactType: overrides.storageRules?.[0]?.artifactType || '原始结果',
      storageTargetType: overrides.storageRules?.[0]?.storageTargetType || 'Elasticsearch',
      esAddress: overrides.storageRules?.[0]?.esAddress || '',
      esIndex: overrides.storageRules?.[0]?.esIndex || '',
      objectStorageAddress: overrides.storageRules?.[0]?.objectStorageAddress || '',
      objectStoragePath: overrides.storageRules?.[0]?.objectStoragePath || '',
      knowledgeBase: overrides.storageRules?.[0]?.knowledgeBase || '-',
      database: overrides.storageRules?.[0]?.database || '-',
      directory: overrides.storageRules?.[0]?.directory || '-',
      writeMode: overrides.storageRules?.[0]?.writeMode || 'upsert',
      indexEnabled: overrides.storageRules?.some((rule) => rule.indexEnabled) || false,
      indexFields: overrides.storageRules?.[0]?.indexFields || '',
      recallField: overrides.storageRules?.[0]?.recallField || '',
      filterFields: overrides.storageRules?.[0]?.filterFields || '',
      rules: overrides.storageRules || [],
      note: overrides.storageNote || '创建后可在工具详情中继续完善结果存储设置。',
    }),
    lastSyncedAt: source?.lastSyncedAt || '-',
  });
}

export function createEmptyServiceDraft() {
  return {
    name: '',
    serviceType: '标准 MCP Server',
    transport: 'SSE',
    endpoint: '',
    authType: '无鉴权',
    authHeader: 'Authorization',
    authValue: '',
    version: 'V1.0.0',
    description: '',
    configMode: 'simple',
    headers: [],
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
  const tools = service.tools?.length ? service.tools : higressDemoTools;
  const toolNames = tools.map((tool) => tool.name);
  const toolCategories = Object.fromEntries(tools.map((tool) => [tool.name, tool.category || '未分类']));
  return {
    ...service,
    tools,
    status: '连接正常',
    toolCount: tools.length,
    toolNames,
    toolCategories,
    lastSyncedAt: nowText(),
  };
}
