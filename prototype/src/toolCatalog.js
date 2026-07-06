const SERVICES_KEY = 'knowledge-engineering-demo-higress-mcp-services-v20';
const CATALOG_KEY = 'knowledge-engineering-demo-higress-managed-tools-v20';
const CATEGORY_KEY = 'knowledge-engineering-demo-higress-managed-tool-categories-v20';
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
  'knowledge-engineering-demo-higress-mcp-services-v19',
  'knowledge-engineering-demo-higress-managed-tools-v19',
  'knowledge-engineering-demo-higress-managed-tool-categories-v19',
];

export const defaultCategories = ['文档转换', '文档解析', '内容处理'];

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
  code: '状态码',
  content_url: '文件访问地址',
  data: '结果数据',
  end_section: '结束标题',
  file: '文件对象',
  file_name: '文件名称',
  file_size: '文件大小',
  file_type: '文件类型',
  files: '文件列表',
  input: '输入内容',
  keyRules: '关键规则',
  language: '文档语言',
  lowQualityQaPairs: '低质QA对列表',
  metadata: '文件元数据',
  metrics: '评估指标',
  message: '提示信息',
  mime_type: 'MIME类型',
  mode: '解析模式',
  model: '模型标识',
  ocr_language: 'OCR语言',
  ocrMetadata: 'OCR元数据',
  ocrPages: 'OCR页结果',
  overlap: '重叠长度',
  pages: '页级内容',
  paragraphs: '标准段落',
  parse_mode: '解析模式',
  prompt: '提示词',
  qaPairs: 'QA对集合',
  qaQualityReport: 'QA质量报告',
  qaResult: 'QA结果',
  query: '检索问题',
  rerankedResults: '重排结果',
  response: '接口返回结果',
  rerankStats: '重排统计信息',
  sections: '政策章节',
  sourceChunks: '来源切片',
  specified_section: '指定标题',
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
  user_id: '用户ID',
};

function createInput(name, type, required = true, description = '', defaultValue = '', schema = null) {
  return { name, displayName: demoFieldDisplayNames[name] || name, type, required, description, defaultValue, ...(schema ? { schema } : {}) };
}

function createOutput(name, type, description = '', path, schema = null) {
  return { name, displayName: demoFieldDisplayNames[name] || name, type, description, path: path || name, ...(schema ? { schema } : {}) };
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

const fileUploadItemSchema = {
  type: 'object',
  description: '上传文件对象。',
  properties: {
    file_name: { type: 'string', description: '文件名称。' },
    file_type: { type: 'string', description: '文件扩展名，如 pdf、docx、ofd、md。' },
    file_size: { type: 'integer', description: '文件大小，单位 Byte。' },
    content_url: { type: 'string', description: '文件下载或临时访问地址。' },
    mime_type: { type: 'string', description: '文件 MIME 类型。' },
  },
  required: ['file_name', 'content_url'],
};

const filesInputSchema = {
  type: 'array',
  description: '待处理文件列表。',
  items: fileUploadItemSchema,
};

function createFilesInput(description = '待处理文件列表。') {
  return createInput('files', 'array<object>', true, description, '', filesInputSchema);
}

function createUserIdInput() {
  return createInput('user_id', 'string', true, '调用用户标识，用于审计、权限校验或任务追踪。');
}

function createModeInput(required = true) {
  return createInput('mode', 'string', required, '处理模式。markdown_chunk 支持 level1、level2、adaptive、level3；标题内容抽取支持 self、after、mid。');
}

function createPromptInput(description = '可选提示词，用于补充 OCR 或多模态理解任务要求。') {
  return createInput('prompt', 'string', false, description);
}

function responseOutputSchema({ dataDescription = '结果文件列表。', dataFileType = 'md' } = {}) {
  return {
    type: 'object',
    description: '接口统一返回对象。',
    properties: {
      code: { type: 'integer', description: '业务状态码。' },
      data: {
        type: 'array',
        description: dataDescription,
        items: {
          type: 'object',
          description: '单个结果文件信息。',
          properties: {
            file_name: { type: 'string', description: '结果文件名称。' },
            file_url: { type: 'string', description: '结果文件访问地址。' },
            file_type: { type: 'string', description: `结果文件类型，示例：${dataFileType}。` },
          },
          required: ['file_name', 'file_type'],
        },
      },
      message: { type: 'string', description: '接口提示信息。' },
    },
    required: ['code', 'data', 'message'],
  };
}

function createResponseOutput(description, options = {}) {
  return createOutput('response', 'object', description, 'response', responseOutputSchema(options));
}

const idpDocumentTools = [
  {
    slug: 'document-to-pdf',
    name: '转pdf接口',
    description: '将 Word、图片或其他文档批量转换为 PDF 文件。',
    category: '文档转换',
    enabled: true,
    endpoint: 'api/general/document_to_pdf',
    method: 'POST',
    inputs: [createFilesInput('待转换的文档文件列表。'), createUserIdInput()],
    outputs: [createResponseOutput('PDF 转换结果。', { dataDescription: '转换后的 PDF 文件列表。', dataFileType: 'pdf' })],
  },
  {
    slug: 'mx-ocr',
    name: '公司自研OCR解析接口',
    description: '使用公司自研 OCR 能力解析文件，输出 Markdown 结果。',
    category: '文档解析',
    enabled: true,
    endpoint: 'api/document_parser/mx_ocr',
    method: 'POST',
    inputs: [createFilesInput('待 OCR 解析的文件列表。'), createUserIdInput()],
    outputs: [createResponseOutput('OCR 解析后的 Markdown 文件列表。', { dataDescription: 'OCR 解析后的 Markdown 文件列表。', dataFileType: 'md' })],
  },
  {
    slug: 'dots-ocr',
    name: '小红书多模态OCR接口',
    description: '调用小红书多模态 OCR 能力解析文件，输出 Markdown 结果。',
    category: '文档解析',
    enabled: true,
    endpoint: 'api/document_parser/dots_ocr',
    method: 'POST',
    inputs: [createFilesInput('待多模态 OCR 解析的文件列表。'), createUserIdInput()],
    outputs: [createResponseOutput('多模态 OCR 解析后的 Markdown 文件列表。', { dataDescription: '多模态 OCR 解析后的 Markdown 文件列表。', dataFileType: 'md' })],
  },
  {
    slug: 'mineru-ocr',
    name: 'minnerU解析接口',
    description: '调用 MinerU 文档解析能力，输出 Markdown 结果。',
    category: '文档解析',
    enabled: true,
    endpoint: 'api/document_parser/mineru_ocr',
    method: 'POST',
    inputs: [createFilesInput('待 MinerU 解析的文件列表。'), createUserIdInput()],
    outputs: [createResponseOutput('MinerU 解析后的 Markdown 文件列表。', { dataDescription: 'MinerU 解析后的 Markdown 文件列表。', dataFileType: 'md' })],
  },
  {
    slug: 'markdown-chunk',
    name: 'makdown结构化分块接口',
    description: '将 Markdown 文档按指定模式进行结构化分块。',
    category: '内容处理',
    enabled: true,
    endpoint: 'api/general/markdown_chunk',
    method: 'POST',
    inputs: [createFilesInput('待结构化分块的 Markdown 文件列表。'), createModeInput(true), createUserIdInput()],
    outputs: [createResponseOutput('结构化分块后的 Markdown 文件列表。', { dataDescription: '结构化分块后的 Markdown 文件列表。', dataFileType: 'md' })],
  },
  {
    slug: 'extract-md-content-by-title',
    name: 'makdown根据输入标题抽取内容接口',
    description: '根据输入标题从 Markdown 文档中抽取指定段落内容。',
    category: '内容处理',
    enabled: true,
    endpoint: 'api/document_content_analysis/extract_md_content_by_titile',
    method: 'POST',
    inputs: [
      createFilesInput('待抽取内容的 Markdown 文件列表。'),
      createInput('specified_section', 'string', true, '开始抽取的标题。'),
      createModeInput(false),
      createInput('end_section', 'string', false, '结束标题，mode 为 mid 时需要填写。'),
      createUserIdInput(),
    ],
    outputs: [createResponseOutput('按标题抽取后的 Markdown 文件列表。', { dataDescription: '按标题抽取后的 Markdown 文件列表。', dataFileType: 'md' })],
  },
  {
    slug: 'paddle-ocr',
    name: '百度paddle多模态OCR接口',
    description: '调用百度 Paddle 多模态 OCR 能力解析文件，支持传入可选提示词。',
    category: '文档解析',
    enabled: true,
    endpoint: 'api/document_parser/paddle_ocr',
    method: 'POST',
    inputs: [createFilesInput('待 Paddle OCR 解析的文件列表。'), createPromptInput(), createUserIdInput()],
    outputs: [createResponseOutput('Paddle 多模态 OCR 解析后的 Markdown 文件列表。', { dataDescription: 'Paddle OCR 解析后的 Markdown 文件列表。', dataFileType: 'md' })],
  },
  {
    slug: 'deepseek-ocr',
    name: 'DeepSeek多模态OCR接口(已更新v2版本)',
    description: '调用 DeepSeek v2 多模态 OCR 能力解析文件，支持传入可选提示词。',
    category: '文档解析',
    enabled: true,
    endpoint: 'api/document_parser/deepseek_ocr',
    method: 'POST',
    inputs: [createFilesInput('待 DeepSeek 多模态 OCR 解析的文件列表。'), createPromptInput(), createUserIdInput()],
    outputs: [createResponseOutput('DeepSeek 多模态 OCR 解析后的 Markdown 文件列表。', { dataDescription: 'DeepSeek OCR 解析后的 Markdown 文件列表。', dataFileType: 'md' })],
  },
  {
    slug: 'ofd-to-pdf',
    name: 'OFD文档转PDF文档接口',
    description: '将 OFD 文档批量转换为 PDF 文档。',
    category: '文档转换',
    enabled: true,
    endpoint: 'api/general/ofd_to_pdf',
    method: 'POST',
    inputs: [createFilesInput('待转换的 OFD 文件列表。'), createUserIdInput()],
    outputs: [createResponseOutput('OFD 转 PDF 结果。', { dataDescription: '转换后的 PDF 文件列表。', dataFileType: 'pdf' })],
  },
  {
    slug: 'extract-footnote',
    name: '保险类条款文档脚注提取api',
    description: '提取保险类条款文档中的脚注内容，输出 Markdown 结果。',
    category: '内容处理',
    enabled: true,
    endpoint: 'api/document_content_analysis/extract_footnote',
    method: 'POST',
    inputs: [createFilesInput('待提取脚注的保险条款文件列表。'), createUserIdInput()],
    outputs: [createResponseOutput('脚注提取后的 Markdown 文件列表。', { dataDescription: '脚注提取后的 Markdown 文件列表。', dataFileType: 'md' })],
  },
  {
    slug: 'hunyuan-ocr',
    name: '腾讯hunyuan多模态ocr接口',
    description: '调用腾讯 Hunyuan 多模态 OCR 能力解析文件，prompt 可用于指定定位、解析、信息抽取或翻译任务。',
    category: '文档解析',
    enabled: true,
    endpoint: 'api/document_parser/hunyuan_ocr',
    method: 'POST',
    inputs: [createFilesInput('待 Hunyuan 多模态 OCR 解析的文件列表。'), createUserIdInput(), createPromptInput('建议暴露的提示词参数，可用于定位、解析、信息抽取或翻译任务。')],
    outputs: [createResponseOutput('Hunyuan 多模态 OCR 解析后的 Markdown 文件列表。', { dataDescription: 'Hunyuan OCR 解析后的 Markdown 文件列表。', dataFileType: 'md' })],
  },
  {
    slug: 'glm-ocr',
    name: '智谱GLM多模态ocr接口',
    description: '调用智谱 GLM 多模态 OCR 能力解析文件，输出 Markdown 结果。',
    category: '文档解析',
    enabled: true,
    endpoint: 'api/document_parser/glm_ocr',
    method: 'POST',
    inputs: [createFilesInput('待 GLM 多模态 OCR 解析的文件列表。'), createUserIdInput()],
    outputs: [createResponseOutput('GLM 多模态 OCR 解析后的 Markdown 文件列表。', { dataDescription: 'GLM OCR 解析后的 Markdown 文件列表。', dataFileType: 'md' })],
  },
  {
    slug: 'qianfan-ocr',
    name: 'qianfan多模态OCR接口（已下架）',
    description: '千帆多模态 OCR 接口，文档标记为已下架，仅作为历史工具样例展示。',
    category: '文档解析',
    enabled: false,
    status: '不可用',
    endpoint: 'api/document_parser/qianfan_ocr',
    method: 'POST',
    inputs: [createFilesInput('待千帆多模态 OCR 解析的文件列表。'), createPromptInput(), createUserIdInput()],
    outputs: [createResponseOutput('千帆多模态 OCR 解析后的 Markdown 文件列表。', { dataDescription: '千帆 OCR 解析后的 Markdown 文件列表。', dataFileType: 'md' })],
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
    id: 'svc-idp-document-processing',
    name: 'IDP 文档处理 MCP',
    serviceType: '标准 MCP Server',
    endpoint: 'https://mcp.internal.com/idp-document/sse',
    transport: 'SSE',
    authType: 'Bearer Token',
    version: 'V1.0.0',
    status: '连接正常',
    toolCount: idpDocumentTools.length,
    toolNames: idpDocumentTools.map((tool) => tool.name),
    lastSyncedAt: '2026-07-06 16:20',
    description: '基于飞书工具配置整理的 IDP 文档转换、OCR 解析和内容处理 MCP 工具样例。',
    toolCategories: Object.fromEntries(idpDocumentTools.map((tool) => [tool.name, tool.category || '未分类'])),
    tools: idpDocumentTools,
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
  const fallbackTools = idpDocumentTools;
  const rawTool = service?.tools?.find((tool) => tool.name === toolName) || fallbackTools.find((tool) => tool.name === toolName);
  return {
    serviceId: service?.id || 'svc-idp-document-processing',
    serviceName: service?.name || 'IDP 文档处理 MCP',
    sourceToolName: rawTool?.name || toolName,
    lastSyncedAt: service?.lastSyncedAt || '2026-07-06 16:20',
    rawTool,
  };
}

function managedToolStorageFor(rawTool, index) {
  const isConverter = rawTool.category === '文档转换';
  if (isConverter) return createStorageContract({ enabled: false, rules: [] });
  const artifactType = rawTool.name.includes('脚注') ? '知识点' : '文本切片';
  return createStorageContract({
    enabled: true,
    outputName: 'response',
    artifactType,
    storageTargetType: '对象存储',
    objectStorageAddress: 'oss://knowledge-engineering',
    objectStoragePath: `idp-tools/${rawTool.slug || index + 1}/{run_id}/response.json`,
    writeMode: '覆盖',
    rules: [
      {
        id: `storage-${rawTool.slug || index + 1}`,
        outputName: 'response',
        artifactType,
        storageTargetType: '对象存储',
        esAddress: 'http://es.internal:9200',
        esIndex: `ke_idp_${String(rawTool.slug || index + 1).replace(/-/g, '_')}`,
        targetField: 'content',
        objectStorageAddress: 'oss://knowledge-engineering',
        objectStoragePath: `idp-tools/${rawTool.slug || index + 1}/{run_id}/response.json`,
        writeMode: '覆盖',
      },
    ],
    note: '对 MCP 工具返回结果做标准化提取后，按所选知识形态完成存储落库。',
  });
}

function initialManagedTools(services = initialServices) {
  const rawTools = services
    .filter((service) => !service.locked && service.status !== '停用')
    .flatMap((service) => (service.tools || []).map((tool) => ({ service, tool })))
    .filter(({ tool }) => tool.enabled !== false && tool.status !== '不可用');

  return rawTools.map(({ service, tool }, index) => makeManagedTool({
    id: `ke-idp-${tool.slug || index + 1}`,
    name: tool.name.replace(/接口$/, ''),
    description: tool.description,
    category: tool.category || '未分类',
    sourceServiceId: service.id,
    sourceServiceName: service.name,
    sourceToolName: tool.name,
    inputs: normalizeToolInputs(tool),
    outputs: normalizeToolOutputs(tool),
    storageContract: managedToolStorageFor(tool, index),
    lastSyncedAt: service.lastSyncedAt,
  }));
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
