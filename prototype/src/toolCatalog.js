const SERVICES_KEY = 'knowledge-engineering-demo-higress-mcp-services-v19';
const CATALOG_KEY = 'knowledge-engineering-demo-higress-managed-tools-v19';
const CATEGORY_KEY = 'knowledge-engineering-demo-higress-managed-tool-categories-v19';
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
  'knowledge-engineering-demo-higress-mcp-services-v9',
  'knowledge-engineering-demo-higress-managed-tools-v9',
  'knowledge-engineering-demo-higress-managed-tool-categories-v9',
  'knowledge-engineering-demo-higress-mcp-services-v10',
  'knowledge-engineering-demo-higress-managed-tools-v10',
  'knowledge-engineering-demo-higress-managed-tool-categories-v10',
  'knowledge-engineering-demo-higress-mcp-services-v11',
  'knowledge-engineering-demo-higress-managed-tools-v11',
  'knowledge-engineering-demo-higress-managed-tool-categories-v11',
  'knowledge-engineering-demo-higress-mcp-services-v12',
  'knowledge-engineering-demo-higress-managed-tools-v12',
  'knowledge-engineering-demo-higress-managed-tool-categories-v12',
  'knowledge-engineering-demo-higress-mcp-services-v13',
  'knowledge-engineering-demo-higress-managed-tools-v13',
  'knowledge-engineering-demo-higress-managed-tool-categories-v13',
  'knowledge-engineering-demo-higress-mcp-services-v14',
  'knowledge-engineering-demo-higress-managed-tools-v14',
  'knowledge-engineering-demo-higress-managed-tool-categories-v14',
  'knowledge-engineering-demo-higress-mcp-services-v15',
  'knowledge-engineering-demo-higress-managed-tools-v15',
  'knowledge-engineering-demo-higress-managed-tool-categories-v15',
  'knowledge-engineering-demo-higress-mcp-services-v16',
  'knowledge-engineering-demo-higress-managed-tools-v16',
  'knowledge-engineering-demo-higress-managed-tool-categories-v16',
  'knowledge-engineering-demo-higress-mcp-services-v17',
  'knowledge-engineering-demo-higress-managed-tools-v17',
  'knowledge-engineering-demo-higress-managed-tool-categories-v17',
  'knowledge-engineering-demo-higress-mcp-services-v18',
  'knowledge-engineering-demo-higress-managed-tools-v18',
  'knowledge-engineering-demo-higress-managed-tool-categories-v18',
];

export const defaultCategories = ['文档解析', '文本分片', '知识提取', '向量处理', '质量评估'];

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

const demoFieldDisplayNames = {
  applicableUsers: '适用对象',
  badChunks: '低质切片列表',
  batch_size: '批处理大小',
  candidates: '候选召回结果',
  chunk_size: '切片长度',
  chunkQualityReport: '切片质量报告',
  chunks: '文本切片集合',
  content: '政策正文',
  embeddings: '向量结果',
  embeddingStats: '向量统计信息',
  enable_layout: '启用版面识别',
  file: '文件对象',
  input: '输入内容',
  keyRules: '关键规则',
  language: '文档语言',
  lowQualityQaPairs: '低质QA对列表',
  metadata: '文件元数据',
  metrics: '评估指标',
  mode: '解析模式',
  model: '模型标识',
  ocr_language: 'OCR语言',
  ocrMetadata: 'OCR元数据',
  ocrPages: 'OCR页结果',
  overlap: '重叠长度',
  pages: '页级内容',
  paragraphs: '标准段落',
  parse_mode: '解析模式',
  qaPairs: 'QA对集合',
  qaQualityReport: 'QA质量报告',
  qaResult: 'QA结果',
  query: '检索问题',
  rerankedResults: '重排结果',
  rerankStats: '重排统计信息',
  sections: '政策章节',
  sourceChunks: '来源切片',
  stats: '切片统计信息',
  summary: '知识点摘要',
  summary_type: '摘要类型',
  summaryResult: '知识点列表',
  system_prompt: '系统提示词',
  table_mode: '表格解析模式',
  tableMetadata: '表格元数据',
  tables: '表格集合',
  textChunkResult: '文本切片结果',
  title: '文件标题',
  top_k: '返回数量',
};

function createInput(name, type, required = true, description = '', defaultValue = '') {
  return { name, displayName: demoFieldDisplayNames[name] || name, type, required, description, defaultValue };
}

function createOutput(name, type, description = '', path) {
  return { name, displayName: demoFieldDisplayNames[name] || name, type, description, path: path || name };
}

function createStorageContract({
  enabled = false,
  outputName = '',
  artifactType = '原始结果',
  storageTargetType = 'Elasticsearch',
  esAddress = 'http://es.internal:9200',
  esIndex = '',
  objectStorageAddress = 'oss://knowledge-engineering',
  objectStoragePath = '',
  knowledgeBase = '-',
  database = '-',
  directory = '-',
  writeMode = 'upsert',
  indexEnabled = false,
  indexSource = '',
  indexField = '',
  recallSource = '',
  recallField = '',
  indexFields = '',
  filterFields = '',
  indexJoinField = '',
  recallJoinField = '',
  indexConfig = null,
  standardizationCode = '',
  note = '',
  rules = [],
} = {}) {
  return { enabled, outputName, artifactType, storageTargetType, storageType: storageTargetType, esAddress, esIndex, objectStorageAddress, objectStoragePath, knowledgeBase, database, directory, writeMode, indexEnabled, indexSource, indexField, recallSource, recallField, indexFields, filterFields, indexJoinField, recallJoinField, indexConfig, standardizationCode, note, rules };
}

function normalizeStorageContract(contract) {
  return createStorageContract(contract || {});
}

function createDemoInputArtifacts(inputs = []) {
  const mainInput = inputs.find((input) => input.required) || inputs[0];
  if (!mainInput) return [];
  const normalizedName = String(mainInput.name || '').toLowerCase();
  const normalizedType = String(mainInput.type || '').toLowerCase();
  const artifactType = normalizedName.includes('qa') ? 'qa_pairs'
    : normalizedName.includes('chunk') ? 'text_chunks'
      : normalizedName === 'input' || normalizedType.includes('array') ? 'text_blocks'
        : normalizedType === 'url' ? 'file_url'
          : normalizedType === 'string' ? 'text'
            : 'file_object';
  return [{
    id: `input-artifact-${mainInput.name}`,
    name: mainInput.name,
    displayName: mainInput.displayName || demoFieldDisplayNames[mainInput.name] || mainInput.name,
    type: mainInput.type || 'object',
    artifactType,
    sourcePath: mainInput.name,
    sourceName: mainInput.name,
    description: mainInput.description || '承接上游节点输出结果。',
  }];
}

function createDemoParameterMappingCode(inputs = []) {
  const pairs = inputs.map((input) => {
    const source = input.required ? `context.nodeInput.${input.name}` : `context.config.${input.name}`;
    const fallback = input.defaultValue !== undefined && input.defaultValue !== '' ? ` ?? ${JSON.stringify(input.defaultValue)}` : '';
    return `    ${input.name}: ${source}${fallback}`;
  });
  return `function mapParams(context) {
  return {
${pairs.join(',\n')}
  };
}`;
}

function createDemoStandardizationCode(rules = [], outputs = []) {
  const names = (rules.length ? rules.map((rule) => rule.outputName) : outputs.map((output) => output.name)).filter(Boolean);
  const pairs = names.map((name) => `    ${name}: mcpResult.${name} || mcpResult.data?.${name}`);
  return `function transform(mcpResult) {
  return {
${pairs.join(',\n')}
  };
}`;
}

function applyDemoNodeOutputRefs(contract, outputs = []) {
  const outputByName = new Map(outputs.map((output) => [output.name, output]));
  const rules = (contract.rules || []).map((rule, index) => {
    const matchedOutput = outputByName.get(rule.outputName);
    return {
      ...rule,
      fieldType: rule.fieldType || matchedOutput?.type || 'object',
      nodeOutputRef: rule.nodeOutputRef ?? index === 0,
    };
  });
  const enrichedOutputs = outputs.map((output) => {
    const linkedRule = rules.find((rule) => rule.nodeOutputRef && rule.outputName === output.name);
    return {
      ...output,
      displayName: output.displayName || demoFieldDisplayNames[output.name] || output.name,
      codeOutput: output.codeOutput || output.path || output.name,
      ...(linkedRule ? { storageRuleId: linkedRule.id } : {}),
    };
  });
  rules.forEach((rule) => {
    if (!rule.nodeOutputRef || outputByName.has(rule.outputName)) return;
    enrichedOutputs.push({
      name: rule.outputName,
      displayName: demoFieldDisplayNames[rule.outputName] || rule.outputName,
      type: rule.fieldType || 'object',
      codeOutput: rule.outputName,
      description: `${rule.artifactType || '结果'}输出。`,
      storageRuleId: rule.id,
    });
  });
  return [{ ...contract, rules }, enrichedOutputs];
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
    name: '遗留解析工具',
    description: '客户侧旧版解析接口，仅返回运行时结果，未声明 Output Schema。',
    category: '未分类',
    enabled: true,
    inputs: [
      createInput('file', 'object', true, '待解析文件信息。'),
      createInput('mode', 'string', false, '解析模式。'),
    ],
    outputs: [],
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

const mineruDemoTools = [
  {
    name: 'OCR解析',
    description: '对扫描件、图片型 PDF 进行 OCR 识别，输出页级文本、坐标和置信度。',
    category: '未分类',
    enabled: true,
    inputs: [
      createInput('file', 'object', true, '待 OCR 的文件对象。'),
      createInput('ocr_language', 'string', false, 'OCR 语言，默认 zh-CN。'),
      createInput('enable_layout', 'boolean', false, '是否同时识别版面坐标。'),
    ],
    outputs: [
      createOutput('ocrPages', 'array<object>', '页级 OCR 结果，包含 text、bbox、confidence。'),
      createOutput('ocrMetadata', 'object', 'OCR 语言、页数、平均置信度和耗时。'),
    ],
  },
  {
    name: '表格解析',
    description: '识别文档中的表格区域，输出表格结构、单元格文本和来源页码。',
    category: '未分类',
    enabled: true,
    inputs: [
      createInput('file', 'object', true, '待解析文件对象。'),
      createInput('pages', 'array<object>', false, '可选的页级文本或版面块。'),
      createInput('table_mode', 'string', false, '表格解析模式。'),
    ],
    outputs: [
      createOutput('tables', 'array<object>', '表格集合，包含行列结构、单元格内容和页码。'),
      createOutput('tableMetadata', 'object', '表格数量、失败页码和解析耗时。'),
    ],
  },
];

const vectorDemoTools = [
  {
    name: '文本向量化',
    description: '对文本片段批量生成向量，输出 embedding 和向量生成统计信息。',
    category: '未分类',
    enabled: true,
    inputs: [
      createInput('chunks', 'array<object>', true, '待向量化的文本片段集合。'),
      createInput('model', 'string', false, '向量模型名称。'),
      createInput('batch_size', 'integer', false, '批处理大小。'),
    ],
    outputs: [
      createOutput('embeddings', 'array<object>', '每个文本片段对应的向量结果。'),
      createOutput('embeddingStats', 'object', '向量维度、成功数量和失败数量。'),
    ],
  },
  {
    name: '召回重排',
    description: '对候选召回结果进行相关性重排，输出排序后的候选片段。',
    category: '未分类',
    enabled: true,
    inputs: [
      createInput('query', 'string', true, '用户问题或检索 query。'),
      createInput('candidates', 'array<object>', true, '候选召回结果。'),
      createInput('top_k', 'integer', false, '返回数量。'),
    ],
    outputs: [
      createOutput('rerankedResults', 'array<object>', '重排后的候选结果。'),
      createOutput('rerankStats', 'object', '候选数量、返回数量和模型耗时。'),
    ],
  },
];

const qualityDemoTools = [
  {
    name: '切片质量评估',
    description: '评估文本切片的长度、完整性、重复率和边界质量。',
    category: '未分类',
    enabled: true,
    inputs: [
      createInput('chunks', 'array<object>', true, '待评估的文本切片集合。'),
      createInput('metrics', 'array<string>', false, '评估指标列表。'),
    ],
    outputs: [
      createOutput('chunkQualityReport', 'object', '切片质量评分、问题明细和改进建议。'),
      createOutput('badChunks', 'array<object>', '质量较低的切片列表。'),
    ],
  },
  {
    name: 'QA质量评估',
    description: '评估 QA 对的问题清晰度、答案完整性和来源一致性。',
    category: '未分类',
    enabled: true,
    inputs: [
      createInput('qaPairs', 'array<object>', true, '待评估的 QA 对集合。'),
      createInput('sourceChunks', 'array<object>', false, 'QA 对对应的来源片段。'),
    ],
    outputs: [
      createOutput('qaQualityReport', 'object', 'QA 质量评分、问题类型和审核建议。'),
      createOutput('lowQualityQaPairs', 'array<object>', '低质量 QA 对列表。'),
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
      displayName: input.displayName || fallback.displayName || demoFieldDisplayNames[input.name] || input.name,
      type: input.type || fallback.type || 'object',
      required: input.required ?? fallback.required ?? true,
      description: input.description || fallback.description || '',
      defaultValue: input.defaultValue ?? fallback.defaultValue ?? '',
    };
  });
}

function normalizeToolOutputs(tool) {
  if (Array.isArray(tool.outputs) && tool.outputs.length === 0) return [];
  const defaults = defaultToolOutputs(tool.name);
  const defaultByName = new Map(defaults.map((output) => [output.name, output]));
  const source = tool.outputs?.length ? tool.outputs : defaults;
  return source.filter((output) => output.name !== 'documentId').map((output, index) => {
    const fallback = defaultByName.get(output.name) || defaults[index] || {};
    return {
      ...output,
      displayName: output.displayName || fallback.displayName || demoFieldDisplayNames[output.name] || output.name,
      type: output.type || fallback.type || 'object',
      description: output.description || fallback.description || '',
      path: output.path || fallback.path || output.name || fallback.name || 'result',
      codeOutput: output.codeOutput || output.path || fallback.path || output.name || fallback.name || 'result',
    };
  });
}

export const initialServices = [
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
  {
    id: 'svc-mineru-parse',
    name: 'MinerU 文档解析 MCP',
    serviceType: '标准 MCP Server',
    endpoint: 'https://mcp.internal.com/mineru/sse',
    transport: 'SSE',
    authType: 'Bearer Token',
    version: 'V1.0.3',
    status: '连接正常',
    toolCount: mineruDemoTools.length,
    toolNames: mineruDemoTools.map((tool) => tool.name),
    lastSyncedAt: '2026-05-28 14:16',
    description: '封装 MinerU 类文档解析能力，提供 OCR、表格和版面结构识别工具。',
    toolCategories: Object.fromEntries(mineruDemoTools.map((tool) => [tool.name, tool.category || '未分类'])),
    tools: mineruDemoTools,
  },
  {
    id: 'svc-vector-retrieval',
    name: '向量检索能力 MCP',
    serviceType: '标准 MCP Server',
    endpoint: 'https://mcp.internal.com/vector/sse',
    transport: 'SSE',
    authType: 'Bearer Token',
    version: 'V2.1.0',
    status: '连接正常',
    toolCount: vectorDemoTools.length,
    toolNames: vectorDemoTools.map((tool) => tool.name),
    lastSyncedAt: '2026-05-29 10:08',
    description: '提供文本向量化、候选结果重排等检索增强工具。',
    toolCategories: Object.fromEntries(vectorDemoTools.map((tool) => [tool.name, tool.category || '未分类'])),
    tools: vectorDemoTools,
  },
  {
    id: 'svc-quality-eval',
    name: '知识质量评估 MCP',
    serviceType: '标准 MCP Server',
    endpoint: 'https://mcp.internal.com/quality/sse',
    transport: 'Streamable HTTP',
    authType: '无鉴权',
    version: 'V1.2.0',
    status: '连接正常',
    toolCount: qualityDemoTools.length,
    toolNames: qualityDemoTools.map((tool) => tool.name),
    lastSyncedAt: '2026-05-30 16:24',
    description: '提供切片质量、QA 质量等知识加工结果评估工具。',
    toolCategories: Object.fromEntries(qualityDemoTools.map((tool) => [tool.name, tool.category || '未分类'])),
    tools: qualityDemoTools,
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
  inputArtifacts,
  parameterMappingCode = '',
  storageContract,
  lastSyncedAt = '-',
  version = 'v1',
}) {
  const normalizedInputs = normalizeToolInputs({ name, inputs });
  const normalizedOutputs = normalizeToolOutputs({ name, outputs });
  const baseStorageContract = normalizeStorageContract(storageContract);
  const storageWithCode = {
    ...baseStorageContract,
    standardizationCode: baseStorageContract.standardizationCode || createDemoStandardizationCode(baseStorageContract.rules, normalizedOutputs),
  };
  const [linkedStorageContract, linkedOutputs] = applyDemoNodeOutputRefs(storageWithCode, normalizedOutputs);
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
    inputArtifacts: inputArtifacts || createDemoInputArtifacts(normalizedInputs),
    inputs: normalizedInputs,
    outputs: linkedOutputs,
    parameterMappingCode: parameterMappingCode || createDemoParameterMappingCode(normalizedInputs),
    storageContract: linkedStorageContract,
  };
}

function getRawSource(services, toolName) {
  const service = services.find((item) => !item.locked && item.tools?.some((tool) => tool.name === toolName));
  const fallbackTools = [...higressDemoTools, ...mineruDemoTools, ...vectorDemoTools, ...qualityDemoTools];
  const rawTool = service?.tools?.find((tool) => tool.name === toolName) || fallbackTools.find((tool) => tool.name === toolName);
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
  const ocrParse = getRawSource(services, 'OCR解析');
  const tableParse = getRawSource(services, '表格解析');
  const chunking = getRawSource(services, '文本分片');
  const knowledgeExtract = getRawSource(services, '知识点提取');
  const qaExtract = getRawSource(services, 'QA提取');
  const vectorize = getRawSource(services, '文本向量化');
  const chunkQuality = getRawSource(services, '切片质量评估');
  return [
    makeManagedTool({
      id: 'ke-standard-file-parse',
      name: '通用解析',
      description: '解析常见 PDF、Word、图片文件，统一输出章节、段落和文件元数据。',
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
      storageContract: createStorageContract({
        enabled: true,
        outputName: 'documentSections',
        artifactType: '解析文档',
        storageTargetType: '对象存储',
        objectStorageAddress: 'oss://knowledge-engineering',
        objectStoragePath: 'parsed-documents/{run_id}/document_sections.json',
        writeMode: '覆盖',
        rules: [
          {
            id: 'storage-document-sections',
            outputName: 'documentSections',
            artifactType: '解析文档',
            storageTargetType: '对象存储',
            esAddress: 'http://es.internal:9200',
            esIndex: 'ke_policy_document_sections',
            targetField: 'content',
            objectStorageAddress: 'oss://knowledge-engineering',
            objectStoragePath: 'parsed-documents/{run_id}/document_sections.json',
            writeMode: '覆盖',
          },
          {
            id: 'storage-parse-metadata',
            outputName: 'metadata',
            artifactType: '元数据',
            storageTargetType: 'Elasticsearch',
            esAddress: 'http://es.internal:9200',
            esIndex: 'ke_policy_document_metadata',
            targetField: 'metadata',
            objectStorageAddress: 'oss://knowledge-engineering',
            objectStoragePath: 'parsed-documents/{run_id}/metadata.json',
            writeMode: 'upsert',
          },
        ],
        note: '解析结果按章节写入对象存储，元数据写入 ES，供后续分片和追溯使用。',
      }),
      lastSyncedAt: fileParse.lastSyncedAt,
    }),
    makeManagedTool({
      id: 'ke-standard-multimodal-parse',
      name: '多模态解析',
      description: '面向图文混排、表格、版面信息较多的文件，输出文本、表格、图片说明和版面结构。',
      category: '文档解析',
      sourceServiceId: fileParse.serviceId,
      sourceServiceName: fileParse.serviceName,
      sourceToolName: fileParse.sourceToolName,
      inputs: normalizeToolInputs(fileParse.rawTool || { name: '文件解析' }),
      outputs: [
        createOutput('documentBlocks', 'array<object>', '按阅读顺序输出的文本、表格、图片和标题块。'),
        createOutput('tables', 'array<object>', '抽取出的表格结构和单元格内容。'),
        createOutput('figures', 'array<object>', '图片、图注和所在页码。'),
        createOutput('layout', 'object', '页面版面、区域坐标和阅读顺序信息。'),
      ],
      storageContract: createStorageContract({
        enabled: true,
        outputName: 'documentBlocks',
        artifactType: '解析文档',
        storageTargetType: '对象存储',
        objectStorageAddress: 'oss://knowledge-engineering',
        objectStoragePath: 'parsed-documents/{run_id}/document_blocks.json',
        writeMode: '覆盖',
        rules: [
          {
            id: 'storage-document-blocks',
            outputName: 'documentBlocks',
            artifactType: '解析文档',
            storageTargetType: '对象存储',
            esAddress: 'http://es.internal:9200',
            esIndex: 'ke_policy_document_blocks',
            targetField: 'content',
            objectStorageAddress: 'oss://knowledge-engineering',
            objectStoragePath: 'parsed-documents/{run_id}/document_blocks.json',
            writeMode: '覆盖',
          },
          {
            id: 'storage-document-tables',
            outputName: 'tables',
            artifactType: '解析文档',
            storageTargetType: 'Elasticsearch',
            esAddress: 'http://es.internal:9200',
            esIndex: 'ke_policy_document_tables',
            targetField: 'table_json',
            objectStorageAddress: 'oss://knowledge-engineering',
            objectStoragePath: 'parsed-documents/{run_id}/tables.json',
            writeMode: 'upsert',
          },
        ],
        note: '多模态解析结果按文本块和表格分别持久化，便于后续清洗、切片和人工核验。',
      }),
      lastSyncedAt: fileParse.lastSyncedAt,
    }),
    makeManagedTool({
      id: 'ke-standard-ocr-parse',
      name: '扫描件OCR解析',
      description: '面向扫描件和图片型 PDF，输出页级 OCR 文本、坐标和识别置信度。',
      category: '文档解析',
      sourceServiceId: ocrParse.serviceId,
      sourceServiceName: ocrParse.serviceName,
      sourceToolName: ocrParse.sourceToolName,
      inputs: normalizeToolInputs(ocrParse.rawTool || { name: 'OCR解析' }),
      outputs: [
        createOutput('ocrPages', 'array<object>', '页级 OCR 结果，包含文本、坐标和置信度。'),
        createOutput('ocrMetadata', 'object', 'OCR 页数、语言、平均置信度和耗时。'),
      ],
      storageContract: createStorageContract({
        enabled: true,
        outputName: 'ocrPages',
        artifactType: '解析文档',
        storageTargetType: '对象存储',
        objectStorageAddress: 'oss://knowledge-engineering',
        objectStoragePath: 'ocr/{run_id}/ocr_pages.json',
        writeMode: '覆盖',
        rules: [
          {
            id: 'storage-ocr-pages',
            outputName: 'ocrPages',
            artifactType: '解析文档',
            storageTargetType: '对象存储',
            esAddress: 'http://es.internal:9200',
            esIndex: 'ke_policy_ocr_pages',
            targetField: 'content',
            objectStorageAddress: 'oss://knowledge-engineering',
            objectStoragePath: 'ocr/{run_id}/ocr_pages.json',
            writeMode: '覆盖',
          },
          {
            id: 'storage-ocr-metadata',
            outputName: 'ocrMetadata',
            artifactType: '元数据',
            storageTargetType: 'Elasticsearch',
            esAddress: 'http://es.internal:9200',
            esIndex: 'ke_policy_ocr_metadata',
            targetField: 'metadata',
            objectStorageAddress: 'oss://knowledge-engineering',
            objectStoragePath: 'ocr/{run_id}/metadata.json',
            writeMode: 'upsert',
          },
        ],
        note: 'OCR 文本写入对象存储，识别元数据写入 ES，便于后续追溯和抽检。',
      }),
      lastSyncedAt: ocrParse.lastSyncedAt,
    }),
    makeManagedTool({
      id: 'ke-standard-table-parse',
      name: '表格抽取',
      description: '抽取文档中的表格结构、单元格内容和来源页码，供结构化知识加工使用。',
      category: '文档解析',
      sourceServiceId: tableParse.serviceId,
      sourceServiceName: tableParse.serviceName,
      sourceToolName: tableParse.sourceToolName,
      inputs: normalizeToolInputs(tableParse.rawTool || { name: '表格解析' }),
      outputs: [
        createOutput('tables', 'array<object>', '表格集合，包含行列结构、单元格内容和来源页码。'),
        createOutput('tableMetadata', 'object', '表格数量、失败页码和解析耗时。'),
      ],
      storageContract: createStorageContract({
        enabled: true,
        outputName: 'tables',
        artifactType: '解析文档',
        storageTargetType: 'Elasticsearch',
        esAddress: 'http://es.internal:9200',
        esIndex: 'ke_policy_tables',
        writeMode: 'upsert',
        rules: [
          {
            id: 'storage-tables',
            outputName: 'tables',
            artifactType: '解析文档',
            storageTargetType: 'Elasticsearch',
            esAddress: 'http://es.internal:9200',
            esIndex: 'ke_policy_tables',
            targetField: 'table_json',
            objectStorageAddress: 'oss://knowledge-engineering',
            objectStoragePath: 'tables/{run_id}/tables.json',
            writeMode: 'upsert',
          },
          {
            id: 'storage-table-metadata',
            outputName: 'tableMetadata',
            artifactType: '元数据',
            storageTargetType: 'Elasticsearch',
            esAddress: 'http://es.internal:9200',
            esIndex: 'ke_policy_table_metadata',
            targetField: 'metadata',
            objectStorageAddress: 'oss://knowledge-engineering',
            objectStoragePath: 'tables/{run_id}/metadata.json',
            writeMode: 'upsert',
          },
        ],
        note: '表格结构和解析元数据分别写入 ES，便于后续结构化检索和人工核验。',
      }),
      lastSyncedAt: tableParse.lastSyncedAt,
    }),
    makeManagedTool({
      id: 'ke-standard-normal-chunk',
      name: '普通切片',
      description: '按长度和语义边界生成普通文本切片，适合常规文档检索场景。',
      category: '文本分片',
      sourceServiceId: chunking.serviceId,
      sourceServiceName: chunking.serviceName,
      sourceToolName: chunking.sourceToolName,
      inputs: normalizeToolInputs(chunking.rawTool || { name: '文本分片' }),
      outputs: [
        createOutput('textChunks', 'array<object>', '普通文本切片集合，包含 text、page、source。'),
        createOutput('chunkStats', 'object', '切片数量、平均长度和重叠配置。'),
      ],
      storageContract: createStorageContract({
        enabled: true,
        outputName: 'textChunks',
        artifactType: '文本切片',
        storageTargetType: 'Elasticsearch',
        esAddress: 'http://es.internal:9200',
        esIndex: 'ke_policy_text_chunks',
        writeMode: 'upsert',
        rules: [
          {
            id: 'storage-text-chunks',
            outputName: 'textChunks',
            artifactType: '文本切片',
            storageTargetType: 'Elasticsearch',
            esAddress: 'http://es.internal:9200',
            esIndex: 'ke_policy_text_chunks',
            targetField: 'content',
            objectStorageAddress: 'oss://knowledge-engineering',
            objectStoragePath: 'chunks/{run_id}/text_chunks.json',
            writeMode: 'upsert',
          },
          {
            id: 'storage-chunk-stats',
            outputName: 'chunkStats',
            artifactType: '元数据',
            storageTargetType: 'Elasticsearch',
            esAddress: 'http://es.internal:9200',
            esIndex: 'ke_policy_chunk_stats',
            targetField: 'metadata',
            objectStorageAddress: 'oss://knowledge-engineering',
            objectStoragePath: 'chunks/{run_id}/stats.json',
            writeMode: 'upsert',
          },
        ],
        note: '普通切片写入 ES，统计信息写入元数据索引。',
      }),
      lastSyncedAt: chunking.lastSyncedAt,
    }),
    makeManagedTool({
      id: 'ke-standard-parent-child-chunk',
      name: '父子切片',
      description: '输出父片、子片和父子关系，支持子片召回、父片进入上下文。',
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
        storageTargetType: 'Elasticsearch',
        esAddress: 'http://es.internal:9200',
        esIndex: 'ke_policy_child_chunks',
        writeMode: 'upsert',
        indexEnabled: true,
        indexSource: 'childChunks',
        indexField: 'text',
        recallSource: 'parentChunks',
        recallField: 'text',
        filterFields: 'documentId,page,parentChunkId',
        indexJoinField: 'parentChunkId',
        recallJoinField: 'parentChunkId',
        indexConfig: {
          indexEnabled: true,
          indexSource: 'childChunks',
          indexField: 'text',
          recallSource: 'parentChunks',
          recallField: 'text',
          filterFields: 'documentId,page,parentChunkId',
          indexJoinField: 'parentChunkId',
          recallJoinField: 'parentChunkId',
        },
        rules: [
          {
            id: 'storage-child-chunks',
            outputName: 'childChunks',
            artifactType: '文本切片',
            storageTargetType: 'Elasticsearch',
            esAddress: 'http://es.internal:9200',
            esIndex: 'ke_policy_child_chunks',
            targetField: 'content',
            objectStorageAddress: 'oss://knowledge-engineering',
            objectStoragePath: 'chunks/{run_id}/child_chunks.json',
            writeMode: 'upsert',
          },
          {
            id: 'storage-parent-chunks',
            outputName: 'parentChunks',
            artifactType: '文本切片',
            storageTargetType: '对象存储',
            esAddress: 'http://es.internal:9200',
            esIndex: 'ke_policy_parent_chunks',
            targetField: 'content',
            objectStorageAddress: 'oss://knowledge-engineering',
            objectStoragePath: 'chunks/{run_id}/parent_chunks.json',
            writeMode: '覆盖',
          },
        ],
        note: '子片进入索引，命中后通过 parentChunkId 找到父片并返回父片正文。',
      }),
      lastSyncedAt: chunking.lastSyncedAt,
    }),
    makeManagedTool({
      id: 'ke-standard-knowledge-extract',
      name: '知识点抽取',
      description: '从文本切片中抽取政策知识点、适用对象和关键规则。',
      category: '知识提取',
      sourceServiceId: knowledgeExtract.serviceId,
      sourceServiceName: knowledgeExtract.serviceName,
      sourceToolName: knowledgeExtract.sourceToolName,
      inputs: normalizeToolInputs(knowledgeExtract.rawTool || { name: '知识点提取' }),
      outputs: [
        createOutput('knowledgePoints', 'array<object>', '知识点条目，包含标题、正文、来源切片和适用对象。'),
        createOutput('keyRules', 'array<string>', '关键规则列表。'),
        createOutput('extractStats', 'object', '抽取数量、模型版本和过滤数量。'),
      ],
      storageContract: createStorageContract({
        enabled: true,
        outputName: 'knowledgePoints',
        artifactType: '知识点',
        storageTargetType: 'Elasticsearch',
        esAddress: 'http://es.internal:9200',
        esIndex: 'ke_policy_knowledge_points',
        writeMode: 'upsert',
        rules: [
          {
            id: 'storage-knowledge-points',
            outputName: 'knowledgePoints',
            artifactType: '知识点',
            storageTargetType: 'Elasticsearch',
            esAddress: 'http://es.internal:9200',
            esIndex: 'ke_policy_knowledge_points',
            targetField: 'content',
            objectStorageAddress: 'oss://knowledge-engineering',
            objectStoragePath: 'knowledge-points/{run_id}/items.json',
            writeMode: 'upsert',
          },
          {
            id: 'storage-key-rules',
            outputName: 'keyRules',
            artifactType: '知识点',
            storageTargetType: '对象存储',
            esAddress: 'http://es.internal:9200',
            esIndex: 'ke_policy_key_rules',
            targetField: 'content',
            objectStorageAddress: 'oss://knowledge-engineering',
            objectStoragePath: 'knowledge-points/{run_id}/key_rules.json',
            writeMode: '覆盖',
          },
        ],
        note: '知识点写入 ES，关键规则列表同步归档到对象存储。',
      }),
      lastSyncedAt: knowledgeExtract.lastSyncedAt,
    }),
    makeManagedTool({
      id: 'ke-standard-qa-extract',
      name: 'QA抽取',
      description: '从文本片段中抽取问题、答案和来源引用，形成可检索的 QA 对。',
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
        storageTargetType: 'Elasticsearch',
        esAddress: 'http://es.internal:9200',
        esIndex: 'ke_policy_qa_pairs',
        writeMode: 'upsert',
        indexEnabled: true,
        indexSource: 'qaPairs',
        indexField: 'question',
        recallSource: 'qaPairs',
        recallField: 'answer',
        filterFields: 'sourceChunkId,documentId',
        indexConfig: {
          indexEnabled: true,
          indexSource: 'qaPairs',
          indexField: 'question',
          recallSource: 'qaPairs',
          recallField: 'answer',
          filterFields: 'sourceChunkId,documentId',
        },
        rules: [
          {
            id: 'storage-qa-pairs',
            outputName: 'qaPairs',
            artifactType: 'QA对',
            storageTargetType: 'Elasticsearch',
            esAddress: 'http://es.internal:9200',
            esIndex: 'ke_policy_qa_pairs',
            targetField: 'question',
            objectStorageAddress: 'oss://knowledge-engineering',
            objectStoragePath: 'qa/{run_id}/qa_pairs.json',
            writeMode: 'upsert',
          },
        ],
        note: 'QA 对作为独立知识结果存储，可被检索、评测和人工审核模块引用。',
      }),
      lastSyncedAt: qaExtract.lastSyncedAt,
    }),
    makeManagedTool({
      id: 'ke-standard-vectorize',
      name: '文本向量生成',
      description: '对文本切片批量生成向量，输出 embedding 结果和生成统计。',
      category: '向量处理',
      sourceServiceId: vectorize.serviceId,
      sourceServiceName: vectorize.serviceName,
      sourceToolName: vectorize.sourceToolName,
      inputs: normalizeToolInputs(vectorize.rawTool || { name: '文本向量化' }),
      outputs: [
        createOutput('embeddings', 'array<object>', '文本切片对应的向量结果。'),
        createOutput('embeddingStats', 'object', '向量维度、成功数量和失败数量。'),
      ],
      storageContract: createStorageContract({
        enabled: true,
        outputName: 'embeddings',
        artifactType: '向量结果',
        storageTargetType: 'Elasticsearch',
        esAddress: 'http://es.internal:9200',
        esIndex: 'ke_policy_embeddings',
        writeMode: 'upsert',
        rules: [
          {
            id: 'storage-embeddings',
            outputName: 'embeddings',
            artifactType: '向量结果',
            storageTargetType: 'Elasticsearch',
            esAddress: 'http://es.internal:9200',
            esIndex: 'ke_policy_embeddings',
            targetField: 'vector',
            objectStorageAddress: 'oss://knowledge-engineering',
            objectStoragePath: 'embeddings/{run_id}/vectors.json',
            writeMode: 'upsert',
          },
          {
            id: 'storage-embedding-stats',
            outputName: 'embeddingStats',
            artifactType: '元数据',
            storageTargetType: 'Elasticsearch',
            esAddress: 'http://es.internal:9200',
            esIndex: 'ke_policy_embedding_stats',
            targetField: 'metadata',
            objectStorageAddress: 'oss://knowledge-engineering',
            objectStoragePath: 'embeddings/{run_id}/stats.json',
            writeMode: 'upsert',
          },
        ],
        note: '向量结果写入 ES 的向量字段，生成统计进入元数据索引。',
      }),
      lastSyncedAt: vectorize.lastSyncedAt,
    }),
    makeManagedTool({
      id: 'ke-standard-chunk-quality',
      name: '切片质量评估',
      description: '评估切片长度、完整性、重复率和边界质量，输出质量报告和问题切片。',
      category: '质量评估',
      sourceServiceId: chunkQuality.serviceId,
      sourceServiceName: chunkQuality.serviceName,
      sourceToolName: chunkQuality.sourceToolName,
      inputs: normalizeToolInputs(chunkQuality.rawTool || { name: '切片质量评估' }),
      outputs: [
        createOutput('chunkQualityReport', 'object', '切片质量评分、问题明细和改进建议。'),
        createOutput('badChunks', 'array<object>', '质量较低的切片列表。'),
      ],
      storageContract: createStorageContract({
        enabled: true,
        outputName: 'chunkQualityReport',
        artifactType: '质量报告',
        storageTargetType: 'Elasticsearch',
        esAddress: 'http://es.internal:9200',
        esIndex: 'ke_policy_chunk_quality_reports',
        writeMode: 'upsert',
        rules: [
          {
            id: 'storage-chunk-quality-report',
            outputName: 'chunkQualityReport',
            artifactType: '质量报告',
            storageTargetType: 'Elasticsearch',
            esAddress: 'http://es.internal:9200',
            esIndex: 'ke_policy_chunk_quality_reports',
            targetField: 'report',
            objectStorageAddress: 'oss://knowledge-engineering',
            objectStoragePath: 'quality/{run_id}/chunk_quality_report.json',
            writeMode: 'upsert',
          },
          {
            id: 'storage-bad-chunks',
            outputName: 'badChunks',
            artifactType: '质量报告',
            storageTargetType: '对象存储',
            esAddress: 'http://es.internal:9200',
            esIndex: 'ke_policy_bad_chunks',
            targetField: 'content',
            objectStorageAddress: 'oss://knowledge-engineering',
            objectStoragePath: 'quality/{run_id}/bad_chunks.json',
            writeMode: '覆盖',
          },
        ],
        note: '质量报告写入 ES，问题切片明细归档到对象存储。',
      }),
      lastSyncedAt: chunkQuality.lastSyncedAt,
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
    return { ...seed, status: service.status === '已停用' ? '停用' : service.status || seed.status };
  }
  const serviceType = service.serviceType || service.type || '标准 MCP Server';
  const tools = service.tools || [];
  const status = service.enabled === false ? '停用' : service.status === '已停用' ? '停用' : service.status || '连接中';
  return {
    ...service,
    serviceType,
    version: service.version || 'V1.0.0',
    status,
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
    .filter((service) => !service.locked && service.status !== '停用')
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
  const name = overrides.name?.trim() || rawTool.name || '新建流程节点';
  return makeManagedTool({
    id: `ke-standard-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name,
    description: overrides.description?.trim() || rawTool.description || '由 MCP 原始工具创建的流程节点。',
    category: overrides.category || rawTool.category || '未分类',
    sourceServiceId: source?.serviceId || '',
    sourceServiceName: source?.serviceName || '',
    sourceToolName: rawTool.name || '',
    inputs: overrides.inputs || rawTool.inputs || defaultToolInputs(rawTool.name || ''),
    outputs: overrides.outputs || rawTool.outputs || defaultToolOutputs(rawTool.name || ''),
    parameterMappingCode: overrides.parameterMappingCode || '',
    storageContract: createStorageContract({
      enabled: Boolean(overrides.storageRules?.length),
      outputName: overrides.storageRules?.[0]?.outputName || rawTool.outputs?.[0]?.name || '',
      artifactType: overrides.storageRules?.[0]?.artifactType || '原始结果',
      storageTargetType: overrides.storageRules?.[0]?.storageTargetType || 'Elasticsearch',
      esAddress: overrides.storageRules?.[0]?.esAddress || 'http://es.internal:9200',
      esIndex: overrides.storageRules?.[0]?.esIndex || '',
      objectStorageAddress: overrides.storageRules?.[0]?.objectStorageAddress || 'oss://knowledge-engineering',
      objectStoragePath: overrides.storageRules?.[0]?.objectStoragePath || '',
      knowledgeBase: overrides.storageRules?.[0]?.knowledgeBase || '-',
      database: overrides.storageRules?.[0]?.database || '-',
      directory: overrides.storageRules?.[0]?.directory || '-',
      writeMode: overrides.storageRules?.[0]?.writeMode || 'upsert',
      indexEnabled: Boolean(overrides.indexConfig?.indexEnabled),
      indexSource: overrides.indexConfig?.indexSource || '',
      indexField: overrides.indexConfig?.indexField || '',
      recallSource: overrides.indexConfig?.recallSource || '',
      recallField: overrides.indexConfig?.recallField || '',
      filterFields: overrides.indexConfig?.filterFields || '',
      indexJoinField: overrides.indexConfig?.indexJoinField || '',
      recallJoinField: overrides.indexConfig?.recallJoinField || '',
      indexConfig: overrides.indexConfig || null,
      standardizationCode: overrides.standardizationCode || '',
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
  if (!service || service.status === '停用') return service;
  const endpoint = String(service.endpoint || '').toLowerCase();
  if (!endpoint || endpoint.includes('fail') || endpoint.includes('invalid') || endpoint.includes('timeout')) {
    return {
      ...service,
      status: '连接失败',
      lastSyncedAt: nowText(),
    };
  }
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
