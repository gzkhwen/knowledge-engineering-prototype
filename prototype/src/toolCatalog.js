import { readStoredJson, removeStoredItem, writeStoredJson } from './storage.js';

const SERVICES_KEY = 'knowledge-engineering-demo-higress-mcp-services-v23';
const CATALOG_KEY = 'knowledge-engineering-demo-higress-managed-tools-v23';
const CATEGORY_KEY = 'knowledge-engineering-demo-higress-managed-tool-categories-v23';
const CATALOG_EVENT = 'knowledge-engineering-managed-tool-catalog-changed';
const GRAPH_TOOL_CANONICAL_ID = 'ke-idp-extract_document_knowledge_graph';
const GRAPH_TOOL_CANONICAL_NAME = '单文档图谱抽取';
const GRAPH_TOOL_LEGACY_NAME = '知识图谱抽取';
const GRAPH_TOOL_SOURCE_TOOL_NAME = '文档知识图谱抽取';
const GRAPH_TOOL_CANONICAL_SLUG = 'extract_document_knowledge_graph';
const GRAPH_TOOL_LEGACY_IDS = new Set([
  'knowledge-graph',
  'knowledge-graph-extractor',
  'extract-document-knowledge-graph',
]);
const GRAPH_TOOL_ALIAS_NAMES = new Set([GRAPH_TOOL_CANONICAL_NAME, GRAPH_TOOL_LEGACY_NAME, GRAPH_TOOL_SOURCE_TOOL_NAME]);

function isKnowledgeGraphServiceTool(tool) {
  return tool?.slug === GRAPH_TOOL_CANONICAL_SLUG
    || GRAPH_TOOL_LEGACY_IDS.has(tool?.id)
    || GRAPH_TOOL_ALIAS_NAMES.has(tool?.name)
    || GRAPH_TOOL_ALIAS_NAMES.has(tool?.sourceToolName);
}

function isRecord(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function isRecordArray(value) {
  return Array.isArray(value) && value.every(isRecord);
}

function mergeSeedToolsWithStoredTools(storedTools, seedTools = []) {
  const normalizedStoredTools = (Array.isArray(storedTools) ? storedTools : []).filter(isRecord).map((tool) => {
    const status = tool.status || (tool.enabled === false ? '不可用' : '可用');
    return {
      ...tool,
      status,
      enabled: tool.enabled ?? status !== '不可用',
    };
  });

  const merged = [...normalizedStoredTools];
  const bySlugOrName = new Map();
  const addKeys = (tool) => {
    if (tool?.slug) bySlugOrName.set(`slug:${tool.slug}`, true);
    if (tool?.name) bySlugOrName.set(`name:${tool.name}`, true);
    if (tool?.sourceToolName) bySlugOrName.set(`name:${tool.sourceToolName}`, true);
    if (isKnowledgeGraphServiceTool(tool)) {
      GRAPH_TOOL_ALIAS_NAMES.forEach((name) => bySlugOrName.set(`name:${name}`, true));
    }
  };
  normalizedStoredTools.forEach(addKeys);

  seedTools.forEach((seedTool) => {
    if (!seedTool || typeof seedTool !== 'object') return;
    const fallbackStatus = seedTool.status || (seedTool.enabled === false ? '不可用' : '可用');
    const shouldSkip = isKnowledgeGraphServiceTool(seedTool) ? isKnowledgeGraphServiceToolExists(merged)
      : (seedTool.slug && bySlugOrName.has(`slug:${seedTool.slug}`)) || bySlugOrName.has(`name:${seedTool.name}`);
    if (shouldSkip) return;

    const mergedSeed = {
      ...seedTool,
      status: fallbackStatus,
      enabled: seedTool.enabled ?? fallbackStatus !== '不可用',
    };
    merged.push(mergedSeed);
    addKeys(mergedSeed);
  });

  const knowledgeGraphSeedTool = seedTools.find(isKnowledgeGraphServiceTool);
  const knowledgeGraphToolIndex = merged.findIndex(isKnowledgeGraphServiceTool);
  if (knowledgeGraphSeedTool && knowledgeGraphToolIndex >= 0) {
    const storedGraphTool = merged[knowledgeGraphToolIndex];
    merged[knowledgeGraphToolIndex] = {
      ...knowledgeGraphSeedTool,
      status: storedGraphTool.status || knowledgeGraphSeedTool.status || '可用',
      enabled: storedGraphTool.enabled ?? knowledgeGraphSeedTool.enabled ?? true,
    };
  }

  const toolCount = merged.length;
  return {
    tools: merged,
    toolNames: merged.map((tool) => tool.name),
    toolCategories: Object.fromEntries(merged.map((tool) => [tool.name, tool.category || '未分类'])),
    toolCount,
  };
}

function isKnowledgeGraphServiceToolExists(tools) {
  return tools.some(isKnowledgeGraphServiceTool);
}
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
  'knowledge-engineering-demo-higress-mcp-services-v20',
  'knowledge-engineering-demo-higress-managed-tools-v20',
  'knowledge-engineering-demo-higress-managed-tool-categories-v20',
  'knowledge-engineering-demo-higress-mcp-services-v21',
  'knowledge-engineering-demo-higress-managed-tools-v21',
  'knowledge-engineering-demo-higress-managed-tool-categories-v21',
  'knowledge-engineering-demo-higress-mcp-services-v22',
  'knowledge-engineering-demo-higress-managed-tools-v22',
  'knowledge-engineering-demo-higress-managed-tool-categories-v22',
];

export const defaultCategories = ['文档转换', '文档解析', '文档分块', '内容抽取', '知识打标', '知识提取'];

function nowText() {
  return new Date().toISOString().slice(0, 16).replace('T', ' ');
}

function purgeLegacyDemoStorage() {
  LEGACY_KEYS.forEach((key) => removeStoredItem(key));
}

purgeLegacyDemoStorage();

const demoFieldDisplayNames = {
  additional_requirement: '补充抽取要求',
  answer: '标准答案',
  applicableUsers: '适用对象',
  badChunks: '低质切片列表',
  batch_size: '批处理大小',
  candidates: '候选召回结果',
  chunk_size: '切片长度',
  chunkQualityReport: '切片质量报告',
  chunks: '文本切片集合',
  content: '政策正文',
  extract_requirement: '抽取要求',
  file_info: '输入内容说明',
  embeddings: '向量结果',
  embeddingStats: '向量统计信息',
  enable_layout: '启用版面识别',
  code: '状态码',
  content_url: '文件访问地址',
  data: '结果数据',
  document_request: '文档处理请求',
  duration_ms: '处理耗时',
  end_section: '结束标题',
  expanded_questions: '相似问/问法扩写',
  expansion_count: '问法扩写数量',
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
  page_count: '页数',
  paragraphs: '标准段落',
  parse_mode: '解析模式',
  prompt: '提示词',
  parser_version: '解析器版本',
  processing_options: '处理选项',
  qaPairs: 'QA对集合',
  qa_pairs: 'QA对集合',
  qaQualityReport: 'QA质量报告',
  qaResult: 'QA结果',
  query: '检索问题',
  question: '标准问题',
  rerankedResults: '重排结果',
  response: '接口返回结果',
  result: '处理结果',
  rerankStats: '重排统计信息',
  sections: '政策章节',
  sourceChunks: '来源切片',
  source_evidence: '来源依据',
  specified_section: '指定标题',
  stats: '切片统计信息',
  summary: '知识点摘要',
  summary_type: '摘要类型',
  summaryResult: '知识点列表',
  knowledge_point: '知识点',
  knowledge: '知识抽取结果',
  knowledge_schema: '知识Schema',
  keyword_count: '关键词数量',
  keywords: '关键词列表',
  tagResult: '打标结果',
  tagSummary: '标签摘要',
  tag_strategy: '打标策略',
  label_pool: '标签范围',
  system_prompt: '系统提示词',
  table_mode: '表格解析模式',
  tableMetadata: '表格元数据',
  tables: '表格集合',
  textChunkResult: '文本切片结果',
  title: '文件标题',
  top_k: '返回数量',
  user_id: '用户ID',
  payload: '请求载荷',
  target_format: '目标格式',
  extraction_schema: '图谱抽取 Schema',
  entity_types: '实体类型',
  attribute_types: '属性类型',
  relation_types: '关系类型',
  extraction_instruction: '抽取补充说明',
  include_isolated_entities: '保留孤立实体',
  entity_relation_candidates: '实体关系候选集',
  graph_fragment: '知识图谱片段',
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
  persistenceParseCode = '',
  nodeOutputParseCode = '',
  note = '',
  rules = [],
} = {}) {
  return { enabled, outputName, artifactType, storageTargetType, storageType: storageTargetType, esAddress, esIndex, objectStorageAddress, objectStoragePath, knowledgeBase, database, directory, writeMode, indexEnabled, indexSource, indexField, recallSource, recallField, indexFields, filterFields, indexJoinField, recallJoinField, indexConfig, standardizationCode, persistenceParseCode, nodeOutputParseCode, note, rules };
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
    metadata: {
      type: 'object',
      description: '文件附加元数据。',
      properties: {
        source_system: { type: 'string', description: '文件来源系统。' },
        uploaded_at: { type: 'string', description: '文件上传时间。' },
        page_count: { type: 'integer', description: '预估页数。' },
      },
    },
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

const processingOptionsSchema = {
  type: 'object',
  description: '工具处理选项。',
  properties: {
    parse_mode: { type: 'string', description: '解析模式，例如 ocr、layout、table。' },
    target_format: { type: 'string', description: '目标输出格式，例如 pdf、md。' },
    enable_layout: { type: 'boolean', description: '是否启用版面结构识别。' },
    language: { type: 'string', description: '文档语言，例如 zh-CN。' },
  },
};

const knowledgeGraphChunkSchema = {
  type: 'object',
  description: '有序文本分片项。',
  properties: {
    chunk_id: { type: 'string', description: '分片唯一 ID。' },
    page: { type: 'integer', description: '来源页码。' },
    order: { type: 'integer', description: '顺序索引。' },
    title: { type: 'string', description: '分片标题。' },
    content: { type: 'string', description: '分片文本内容。' },
    sourceDocument: { type: 'string', description: '来源文档标识。' },
  },
  required: ['chunk_id', 'content'],
};

const knowledgeGraphEvidenceSchema = {
  type: 'object',
  description: '图谱元素证据。',
  properties: {
    document: {
      type: 'object',
      properties: {
        id: { type: 'string', description: '文档ID。' },
        title: { type: 'string', description: '文档标题。' },
      },
    },
    chunk_id: { type: 'string', description: '分片ID。' },
    quote: { type: 'string', description: '分片原文。' },
    offset: {
      type: 'object',
      properties: {
        start: { type: 'integer', description: '开始偏移。' },
        end: { type: 'integer', description: '结束偏移。' },
      },
    },
  },
  required: ['document', 'chunk_id', 'quote'],
};

const knowledgeGraphEntitySchema = {
  type: 'object',
  properties: {
    id: { type: 'string', description: '实体ID。' },
    name: { type: 'string', description: '实体名称。' },
    type: { type: 'string', description: '实体类型。' },
    properties: { type: 'object', description: '实体属性。' },
    evidences: { type: 'array', items: knowledgeGraphEvidenceSchema },
  },
  required: ['id', 'name', 'type', 'evidences'],
};

const knowledgeGraphRelationSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', description: '关系ID。' },
    sourceEntityId: { type: 'string', description: '起点实体ID。' },
    sourceEntityType: { type: 'string', description: '起点实体类型。' },
    relationType: { type: 'string', description: '关系类型。' },
    targetEntityId: { type: 'string', description: '终点实体ID。' },
    targetEntityType: { type: 'string', description: '终点实体类型。' },
    confidence: { type: 'number', description: '置信度。' },
    properties: { type: 'object', description: '关系属性。' },
    evidences: { type: 'array', items: knowledgeGraphEvidenceSchema },
  },
  required: ['id', 'sourceEntityId', 'targetEntityId', 'relationType', 'evidences'],
};

const knowledgeGraphFailedChunkSchema = {
  type: 'object',
  properties: {
    chunkId: { type: 'string', description: '失败分片ID。' },
    reason: { type: 'string', description: '失败原因。' },
    status: { type: 'string', description: '分片状态。' },
  },
  required: ['chunkId', 'reason'],
};

const knowledgeGraphSchemaSuggestionSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', description: '建议ID。' },
    type: { type: 'string', description: '建议类型。' },
    suggestedValue: { type: 'string', description: '建议值。' },
    sample: { type: 'object', description: '建议映射样例。' },
    reason: { type: 'string', description: '建议说明。' },
  },
  required: ['id', 'type', 'reason'],
};

const graphFragmentSchema = {
  type: 'object',
  properties: {
    status: { type: 'string', description: '图谱抽取状态。' },
    metadata: { type: 'object', description: '图谱片段元信息。' },
    entities: { type: 'array', items: knowledgeGraphEntitySchema },
    relations: { type: 'array', items: knowledgeGraphRelationSchema },
    isolatedEntities: { type: 'array', items: knowledgeGraphEntitySchema },
    schemaSuggestions: { type: 'array', items: knowledgeGraphSchemaSuggestionSchema },
    stats: {
      type: 'object',
      properties: {
        entityCount: { type: 'integer', description: '实体计数。' },
        relationCount: { type: 'integer', description: '关系计数。' },
        chunkCount: { type: 'integer', description: '分片总数。' },
        coveredChunkCount: { type: 'integer', description: '已覆盖分片。' },
        coverageRatio: { type: 'number', description: '覆盖率。' },
      },
      required: ['entityCount', 'relationCount', 'chunkCount', 'coveredChunkCount', 'coverageRatio'],
    },
    failedChunks: { type: 'array', items: knowledgeGraphFailedChunkSchema },
    schemaValidation: {
      type: 'object',
      description: '当前单文档抽取结果的 Schema 严格校验结果。',
      properties: {
        mode: { type: 'string', description: 'Schema 执行方式。' },
        validEntityCount: { type: 'integer', description: '通过 Schema 校验的实体数。' },
        validRelationCount: { type: 'integer', description: '通过 Schema 校验的关系数。' },
        outOfSchemaCandidates: { type: 'array', description: '未写入图谱片段、等待人工审核的超出 Schema 候选。', items: { type: 'object' } },
      },
    },
    warnings: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          code: { type: 'string', description: '告警代码。' },
          message: { type: 'string', description: '告警信息。' },
          severity: { type: 'string', description: '告警级别。' },
          sourceChunkId: { type: 'string', description: '相关分片ID。' },
        },
      },
    },
  },
  required: ['status', 'entities', 'relations', 'schemaSuggestions', 'stats'],
};

const entityRelationCandidatesSchema = {
  type: 'object',
  description: '从单份文档抽取的实体、关系与来源证据候选，不进行跨文档归一化。',
  properties: {
    entities: { type: 'array', items: knowledgeGraphEntitySchema },
    relations: { type: 'array', items: knowledgeGraphRelationSchema },
    isolatedEntities: { type: 'array', items: knowledgeGraphEntitySchema },
    stats: {
      type: 'object',
      properties: {
        entityCount: { type: 'integer', description: '候选实体数。' },
        relationCount: { type: 'integer', description: '候选关系数。' },
        coveredChunkCount: { type: 'integer', description: '已覆盖分片数。' },
      },
    },
  },
  required: ['entities', 'relations'],
};

function resultFileItemSchema(dataFileType = 'md') {
  return {
    type: 'object',
    description: '单个结果文件信息。',
    properties: {
      file_name: { type: 'string', description: '结果文件名称。' },
      file_url: { type: 'string', description: '结果文件访问地址。' },
      file_type: { type: 'string', description: `结果文件类型，示例：${dataFileType}。` },
      metadata: {
        type: 'object',
        description: '结果文件元数据。',
        properties: {
          duration_ms: { type: 'integer', description: '处理耗时，单位毫秒。' },
          page_count: { type: 'integer', description: '结果对应的文档页数。' },
          parser_version: { type: 'string', description: '解析器或模型版本。' },
        },
      },
      content_outline: {
        type: 'array',
        description: '结果内容的标题层级摘要。',
        items: {
          type: 'object',
          properties: {
            title: { type: 'string', description: '标题名称。' },
            level: { type: 'integer', description: '标题层级。' },
            page: { type: 'integer', description: '来源页码。' },
          },
          required: ['title', 'level'],
        },
      },
    },
    required: ['file_name', 'file_type'],
  };
}

function responseOutputSchema({ dataDescription = '结果文件列表。', dataFileType = 'md', dataItems = 'object' } = {}) {
  return {
    type: 'object',
    description: '接口统一返回对象。',
    properties: {
      code: { type: 'integer', description: '业务状态码。' },
      data: {
        type: 'array',
        description: dataDescription,
        items: dataItems === 'string' ? { type: 'string', description: `结果文件名称或地址，示例：${dataFileType}。` } : resultFileItemSchema(dataFileType),
      },
      message: { type: 'string', description: '接口提示信息。' },
    },
    required: ['code', 'data', 'message'],
  };
}

function createResponseOutputs(description, options = {}) {
  const schema = responseOutputSchema(options);
  return [
    createOutput('code', 'integer', '业务状态码。', 'code', schema.properties.code),
    createOutput('data', options.dataItems === 'string' ? 'array<string>' : 'array<object>', description, 'data', schema.properties.data),
    createOutput('message', 'string', '接口提示信息。', 'message', schema.properties.message),
  ];
}

function createRootedResponseOutput(rootName = 'response', description = '接口返回结果。', options = {}) {
  return createOutput(rootName, 'object', description, rootName, responseOutputSchema(options));
}

const documentRequestSchema = {
  type: 'object',
  description: '文档处理请求对象。',
  properties: {
    files: filesInputSchema,
    user_id: { type: 'string', description: '调用用户标识，用于审计、权限校验或任务追踪。' },
    processing_options: processingOptionsSchema,
  },
  required: ['files', 'user_id'],
};

function createDocumentRequestInput(description = '文档处理请求对象。') {
  return createInput('document_request', 'object', true, description, '', documentRequestSchema);
}

const idpDocumentTools = [
  {
    slug: 'knowledge_extract_text',
    name: 'knowledge_extract_text',
    capability: 'agent.knowledge_extract.text',
    description: '根据输入文本、抽取要求和知识 Schema 返回结构化知识内容。',
    category: '知识提取',
    enabled: true,
    inputs: [
      createInput('content', 'string', true, '需要执行知识抽取的文本内容。'),
      createInput('extract_requirement', 'string', false, '抽取任务类型或自定义抽取要求。'),
      createInput('knowledge_schema', 'object', false, '用于约束 knowledge 数组中每一项的数据结构。', '', {
        type: 'object',
        description: 'knowledge 数组单项的 JSON Schema。',
        additionalProperties: true,
      }),
    ],
    outputs: [
      createOutput('file_info', 'string', '本次输入内容的来源信息或文本说明。'),
      createOutput('knowledge', 'array<object>', '结构化抽取结果列表，数组单项结构由 knowledge_schema 决定。', 'knowledge', {
        type: 'array',
        items: {
          type: 'object',
          description: '符合 knowledge_schema 的知识条目。',
          additionalProperties: true,
        },
      }),
    ],
  },
  {
    slug: 'extract_document_knowledge_graph',
    name: '文档知识图谱抽取',
    description: '基于文本分片抽取实体/关系图谱片段，返回带证据与覆盖统计。',
    category: '知识提取',
    enabled: true,
    endpoint: 'api/knowledge_graph/extract_document_knowledge_graph',
    method: 'POST',
    inputs: [
      createInput('chunks', 'array<object>', true, '有序文本分片列表。', '', { type: 'array', items: knowledgeGraphChunkSchema }),
      createInput('extraction_schema', 'object', true, '当前单文档图谱抽取使用的实体、关系和属性 Schema。'),
      createInput('extraction_instruction', 'string', false, '可选的抽取补充说明。'),
      createInput('include_isolated_entities', 'boolean', false, '是否保留孤立实体。', true),
    ],
    outputs: [createOutput('graph_fragment', 'object', '唯一业务输出：知识图谱片段。', 'graph_fragment', graphFragmentSchema)],
  },
  {
    slug: 'document-to-pdf',
    name: '转pdf接口',
    description: '将 Word、图片或其他文档批量转换为 PDF 文件。',
    category: '文档转换',
    enabled: true,
    endpoint: 'api/general/document_to_pdf',
    method: 'POST',
    inputs: [createFilesInput('待转换的文档文件列表。'), createUserIdInput()],
    outputs: createResponseOutputs('转换后的 PDF 文件列表。', { dataDescription: '转换后的 PDF 文件列表。', dataFileType: 'pdf', dataItems: 'string' }),
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
    outputs: createResponseOutputs('OCR 解析后的 Markdown 文件列表。', { dataDescription: 'OCR 解析后的 Markdown 文件列表。', dataFileType: 'md' }),
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
    outputs: [createRootedResponseOutput('response', '多模态 OCR 解析后的 Markdown 文件列表。', { dataDescription: '多模态 OCR 解析后的 Markdown 文件列表。', dataFileType: 'md' })],
  },
  {
    slug: 'mineru-ocr',
    name: 'minnerU解析接口',
    description: '调用 MinerU 文档解析能力，输出 Markdown 结果。',
    category: '文档解析',
    enabled: true,
    endpoint: 'api/document_parser/mineru_ocr',
    method: 'POST',
    inputs: [createDocumentRequestInput('待 MinerU 解析的文档处理请求。')],
    outputs: createResponseOutputs('MinerU 解析后的 Markdown 文件列表。', { dataDescription: 'MinerU 解析后的 Markdown 文件列表。', dataFileType: 'md' }),
  },
  {
    slug: 'markdown-chunk',
    name: 'makdown结构化分块接口',
    description: '将 Markdown 文档按指定模式进行结构化分块。',
    category: '文档分块',
    enabled: true,
    endpoint: 'api/general/markdown_chunk',
    method: 'POST',
    inputs: [createFilesInput('待结构化分块的 Markdown 文件列表。'), createModeInput(true), createUserIdInput()],
    outputs: [
      createOutput('textChunkResult', 'array<object>', '分片后的文本片段集合，包含 chunkId、title、content 和 source。', 'textChunkResult'),
      createOutput('stats', 'object', '分片数量、平均长度和重叠配置等统计信息。', 'stats'),
    ],
  },
  {
    slug: 'extract-md-content-by-title',
    name: 'makdown根据输入标题抽取内容接口',
    description: '根据输入标题从 Markdown 文档中抽取指定段落内容。',
    category: '内容抽取',
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
    outputs: createResponseOutputs('按标题抽取后的 Markdown 文件列表。', { dataDescription: '按标题抽取后的 Markdown 文件列表。', dataFileType: 'md' }),
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
    outputs: createResponseOutputs('Paddle OCR 解析后的 Markdown 文件列表。', { dataDescription: 'Paddle OCR 解析后的 Markdown 文件列表。', dataFileType: 'md' }),
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
    outputs: [createRootedResponseOutput('response', 'DeepSeek OCR 解析后的 Markdown 文件列表。', { dataDescription: 'DeepSeek OCR 解析后的 Markdown 文件列表。', dataFileType: 'md' })],
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
    outputs: createResponseOutputs('转换后的 PDF 文件列表。', { dataDescription: '转换后的 PDF 文件列表。', dataFileType: 'pdf', dataItems: 'string' }),
  },
  {
    slug: 'extract-footnote',
    name: '保险类条款文档脚注提取api',
    description: '提取保险类条款文档中的脚注内容，输出 Markdown 结果。',
    category: '内容抽取',
    enabled: true,
    endpoint: 'api/document_content_analysis/extract_footnote',
    method: 'POST',
    inputs: [createFilesInput('待提取脚注的保险条款文件列表。'), createUserIdInput()],
    outputs: [createRootedResponseOutput('response', '脚注提取后的 Markdown 文件列表。', { dataDescription: '脚注提取后的 Markdown 文件列表。', dataFileType: 'md' })],
  },
  {
    slug: 'knowledge-point-extraction',
    name: '知识点提取接口',
    description: '基于文本分片提取结构化知识点，输出知识点标题、正文和来源分片引用。',
    category: '内容抽取',
    enabled: true,
    endpoint: 'api/knowledge/point_extract',
    method: 'POST',
    inputs: [
      createInput('chunks', 'array<object>', true, '待提取知识点的文本分片列表。'),
      createInput('summary_type', 'string', false, '知识点提取类型。', '政策摘要'),
      createInput('model', 'string', false, '使用的模型。', 'qwen3-8b'),
    ],
    outputs: [
      createOutput('summary', 'string', '知识点摘要正文。', 'summary'),
      createOutput('summaryResult', 'array<object>', '知识点条目和来源引用，包含 title、content、sourceChunkIds。', 'summaryResult'),
      createOutput('applicableUsers', 'array<string>', '适用对象列表。', 'applicableUsers'),
      createOutput('keyRules', 'array<string>', '关键规则列表。', 'keyRules'),
    ],
  },
  {
    slug: 'qa-extraction',
    name: 'QA提取接口',
    description: '基于文本分片抽取标准问答对，输出问题、答案和来源片段引用。',
    category: '内容抽取',
    enabled: true,
    endpoint: 'api/knowledge/qa_extract',
    method: 'POST',
    inputs: [
      createInput('chunks', 'array<object>', true, '待抽取问答的文本分片列表。'),
      createInput('system_prompt', 'string', false, '问答抽取提示词。', '请基于原文生成问答对，答案必须来自原文，并保留来源片段。'),
      createInput('model', 'string', false, '使用的模型。', 'qwen3-8b'),
    ],
    outputs: [
      createOutput('qaResult', 'array<object>', '抽取出的问答对及来源片段，包含 question、answer、sourceChunkId。', 'qaResult'),
      createOutput('qaStats', 'object', '问答抽取数量、低质问答数量和处理耗时。', 'qaStats'),
    ],
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
    outputs: createResponseOutputs('Hunyuan OCR 解析后的 Markdown 文件列表。', { dataDescription: 'Hunyuan OCR 解析后的 Markdown 文件列表。', dataFileType: 'md' }),
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
    outputs: createResponseOutputs('GLM OCR 解析后的 Markdown 文件列表。', { dataDescription: 'GLM OCR 解析后的 Markdown 文件列表。', dataFileType: 'md' }),
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
    outputs: [createRootedResponseOutput('response', '千帆 OCR 解析后的 Markdown 文件列表。', { dataDescription: '千帆 OCR 解析后的 Markdown 文件列表。', dataFileType: 'md' })],
  },
];

const knowledgeGraphExtractionTools = idpDocumentTools.filter(isKnowledgeGraphServiceTool);
const documentProcessingTools = idpDocumentTools.filter((tool) => !isKnowledgeGraphServiceTool(tool));

const knowledgeTaggingTools = [
  {
    slug: 'knowledge-point-tagging',
    name: '知识点打标接口',
    description: '针对单个知识点生成标签、分类和置信度，保留来源分片引用。',
    category: '知识打标',
    enabled: true,
    endpoint: 'api/knowledge/point_tagging',
    method: 'POST',
    inputs: [
      createInput('knowledge_point', 'object', true, '待打标的单个知识点对象。'),
      createInput('tag_strategy', 'string', false, '打标策略。', '结构感知打标'),
      createInput('label_pool', 'array<string>', false, '可用标签范围。'),
    ],
    outputs: [
      createOutput('tagResult', 'object', '当前知识点的标签、分类、置信度和来源引用。', 'tagResult'),
      createOutput('tagSummary', 'string', '当前知识点的标签摘要。', 'tagSummary'),
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
      uiSchema: normalizeManagedNodeUiSchema(input.name, input.uiSchema || fallback.uiSchema),
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
    toolCount: documentProcessingTools.length,
    toolNames: documentProcessingTools.map((tool) => tool.name),
    lastSyncedAt: '2026-07-06 16:20',
    description: '基于飞书工具配置整理的 IDP 文档转换、OCR 解析和内容处理 MCP 工具样例。',
    toolCategories: Object.fromEntries(documentProcessingTools.map((tool) => [tool.name, tool.category || '未分类'])),
    tools: documentProcessingTools,
  },
  {
    id: 'svc-knowledge-graph-extraction',
    name: '知识图谱抽取 MCP',
    serviceType: '标准 MCP Server',
    endpoint: 'https://mcp.internal.com/knowledge-graph/sse',
    transport: 'SSE',
    authType: 'Bearer Token',
    version: 'V1.0.0',
    status: '连接正常',
    toolCount: knowledgeGraphExtractionTools.length,
    toolNames: knowledgeGraphExtractionTools.map((tool) => tool.name),
    lastSyncedAt: '2026-07-21 15:20',
    description: '面向文档分片的知识图谱抽取 MCP 服务，仅提供知识图谱抽取工具。',
    toolCategories: Object.fromEntries(knowledgeGraphExtractionTools.map((tool) => [tool.name, tool.category || '未分类'])),
    tools: knowledgeGraphExtractionTools,
  },
  {
    id: 'svc-knowledge-tagging',
    name: '知识加工 MCP',
    serviceType: '标准 MCP Server',
    endpoint: 'https://mcp.internal.com/knowledge-processing/sse',
    transport: 'SSE',
    authType: 'Bearer Token',
    version: 'V1.0.0',
    status: '连接正常',
    toolCount: knowledgeTaggingTools.length,
    toolNames: knowledgeTaggingTools.map((tool) => tool.name),
    lastSyncedAt: '2026-07-08 10:20',
    description: '面向知识点标签、分类和规则命中的知识加工 MCP 工具样例。',
    toolCategories: Object.fromEntries(knowledgeTaggingTools.map((tool) => [tool.name, tool.category || '未分类'])),
    tools: knowledgeTaggingTools,
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
  parameterMappingCode,
  storageContract,
  demoSample,
  lastSyncedAt = '-',
  version = 'v1',
  autoGenerateDemoMappings = true,
}) {
  const normalizedInputs = !autoGenerateDemoMappings && Array.isArray(inputs) && inputs.length === 0 ? [] : normalizeToolInputs({ name, inputs });
  const normalizedOutputs = !autoGenerateDemoMappings && Array.isArray(outputs) && outputs.length === 0 ? [] : normalizeToolOutputs({ name, outputs });
  const baseStorageContract = normalizeStorageContract(storageContract);
  const storageWithCode = {
    ...baseStorageContract,
    standardizationCode: baseStorageContract.standardizationCode || (autoGenerateDemoMappings ? createDemoStandardizationCode(baseStorageContract.rules, normalizedOutputs) : ''),
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
    inputArtifacts: inputArtifacts ?? (autoGenerateDemoMappings ? createDemoInputArtifacts(normalizedInputs) : []),
    inputs: normalizedInputs,
    outputs: linkedOutputs,
    parameterMappingCode: parameterMappingCode ?? (autoGenerateDemoMappings ? createDemoParameterMappingCode(normalizedInputs) : ''),
    storageContract: linkedStorageContract,
    ...(demoSample ? { demoSample } : {}),
  };
}

function getRawSource(services, toolName) {
  const service = services.find((item) => !item.locked && item.tools?.some((tool) => tool.name === toolName));
  const fallbackTools = [...idpDocumentTools, ...knowledgeGraphExtractionTools];
  const rawTool = service?.tools?.find((tool) => tool.name === toolName) || fallbackTools.find((tool) => tool.name === toolName);
  return {
    serviceId: service?.id || (isKnowledgeGraphServiceTool(rawTool) ? 'svc-knowledge-graph-extraction' : 'svc-idp-document-processing'),
    serviceName: service?.name || (isKnowledgeGraphServiceTool(rawTool) ? '知识图谱抽取 MCP' : 'IDP 文档处理 MCP'),
    sourceToolName: rawTool?.name || toolName,
    lastSyncedAt: service?.lastSyncedAt || '2026-07-06 16:20',
    rawTool,
  };
}

const managedToolDefinitions = {
  'knowledge_extract_text': { name: '分片关键词提取', category: '知识提取', description: '对单个文本分片提取指定数量的关键词，并将关键词返回给下游节点或写入当前文本切片。' },
  'extract_document_knowledge_graph': { name: '单文档图谱抽取', category: '知识提取', description: '基于单份文档的分片和 Schema 抽取可追溯图谱片段。' },
  'document-to-pdf': { name: '文档转PDF', category: '文档转换', description: '将常见办公文档、图片等材料转换为 PDF 文件，便于后续解析、归档和人工核验。' },
  'mx-ocr': { name: '通用OCR解析', category: '文档解析', description: '对扫描件、图片型 PDF 等文件进行通用 OCR 识别，输出可用于后续加工的 Markdown 文本。' },
  'dots-ocr': { name: '多模态OCR解析', category: '文档解析', description: '面向图文混排、版面复杂的文件进行多模态 OCR 解析，输出结构化 Markdown 文本。' },
  'mineru-ocr': { name: 'MinerU版面解析', category: '文档解析', description: '使用 MinerU 能力解析文档版面与文本内容，适合复杂 PDF 的结构化解析。' },
  'markdown-chunk': { name: 'Markdown结构化分块', category: '文档分块', description: '按标题层级或自适应策略对 Markdown 文档进行结构化分块。' },
  'extract-md-content-by-title': { name: '按标题抽取内容', category: '内容抽取', description: '根据指定标题从 Markdown 文档中抽取对应章节或区间内容。' },
  'knowledge-point-extraction': { name: '知识点提取', category: '内容抽取', description: '基于文本分片结果提取知识点、适用对象和关键规则。' },
  'qa-extraction': { name: 'QA提取', category: '内容抽取', description: '基于文本分片结果抽取标准问答对，并保留答案来源片段。' },
  'knowledge-point-tagging': { name: '知识点打标', category: '知识打标', description: '针对单个知识点生成标签、分类和规则命中结果。' },
  'paddle-ocr': { name: 'PaddleOCR解析', category: '文档解析', description: '使用 Paddle 多模态 OCR 能力解析文档，适合多版式文件的文本抽取。' },
  'deepseek-ocr': { name: 'DeepSeek文档解析', category: '文档解析', description: '使用 DeepSeek 多模态能力解析文档内容，支持通过提示词补充解析要求。' },
  'ofd-to-pdf': { name: 'OFD转PDF', category: '文档转换', description: '将 OFD 文档转换为 PDF，便于进入统一解析和存储流程。' },
  'extract-footnote': { name: '条款脚注提取', category: '内容抽取', description: '从保险条款类文档中提取脚注内容，形成可进一步加工的文本结果。' },
  'hunyuan-ocr': { name: 'Hunyuan文档解析', category: '文档解析', description: '使用 Hunyuan 多模态 OCR 能力解析文档，适合定位、解析和信息抽取类任务。' },
  'glm-ocr': { name: 'GLM文档解析', category: '文档解析', description: '使用智谱 GLM 多模态 OCR 能力解析文档，输出 Markdown 文本结果。' },
};

function getManagedToolDefinition(rawTool) {
  return managedToolDefinitions[rawTool.slug] || {
    name: rawTool.name,
    category: rawTool.category || '未分类',
    description: rawTool.description,
  };
}

function getPrimaryStorageOutputName(rawTool) {
  const outputs = normalizeToolOutputs(rawTool);
  if (!outputs.length) return '';
  const rootedOutput = outputs.find((output) => output.name === 'response' || output.name === 'result');
  if (rootedOutput) return rootedOutput.name;
  const dataOutput = outputs.find((output) => output.name === 'data');
  return dataOutput?.name || outputs[0].name;
}

function managedToolStorageFor(rawTool, index) {
  const isConverter = rawTool.category === '文档转换';
  if (rawTool.slug === 'knowledge_extract_text') {
    const persistenceParseCode = `function parsePersistenceResult(mcpResult, context) {
  const limit = Math.min(Math.max(Number(context.config.keyword_count) || 5, 1), 30);
  const keywords = [...new Set((mcpResult.knowledge || [])
    .map((item) => item.keyword)
    .filter(Boolean))]
    .slice(0, limit);

  return [{
    content: context.nodeInput.chunk,
    keywords,
  }];
}`;
    const nodeOutputParseCode = `function parseNodeOutput(mcpResult, context) {
  const limit = Math.min(Math.max(Number(context.config.keyword_count) || 5, 1), 30);
  const keywords = [...new Set((mcpResult.knowledge || [])
    .map((item) => item.keyword)
    .filter(Boolean))]
    .slice(0, limit);

  return { keywords };
}`;
    return createStorageContract({
      enabled: true,
      outputName: 'persistentResult',
      artifactType: '文本切片',
      storageTargetType: 'Elasticsearch',
      esAddress: 'http://es.internal:9200',
      esIndex: '',
      writeMode: 'upsert',
      standardizationCode: persistenceParseCode,
      persistenceParseCode,
      nodeOutputParseCode,
      rules: [
        {
          id: 'storage-knowledge-extract-text',
          outputName: 'persistentResult',
          fieldType: 'array<object>',
          artifactType: '文本切片',
          storageTargetType: 'Elasticsearch',
          esAddress: 'http://es.internal:9200',
          esIndex: '',
          targetField: 'keywords',
          writeMode: 'upsert',
          nodeOutputRef: true,
        },
      ],
      note: '将关键词列表写入当前文本切片的 keywords 属性，不创建独立知识。',
    });
  }
  if (rawTool.slug === 'extract_document_knowledge_graph') {
    return createStorageContract({
      enabled: false,
      outputName: 'graph_fragment',
      artifactType: '单文档图谱片段',
      storageTargetType: 'Elasticsearch',
      esAddress: 'http://es.internal:9200',
      esIndex: '',
      writeMode: 'upsert',
      note: '保留单文档来源证据；跨文档实体归一化由知识图谱管理侧在文档处理完成后执行。',
    });
  }
  if (isConverter) return createStorageContract({ enabled: false, rules: [] });
  const outputName = getPrimaryStorageOutputName(rawTool);
  const artifactType = rawTool.name.includes('知识点') || rawTool.name.includes('脚注') ? '知识点' : '文本切片';
  return createStorageContract({
    enabled: true,
    outputName,
    artifactType,
    storageTargetType: '对象存储',
    objectStorageAddress: 'oss://knowledge-engineering',
    objectStoragePath: `idp-tools/${rawTool.slug || index + 1}/{run_id}/response.json`,
    writeMode: '覆盖',
    rules: [
      {
        id: `storage-${rawTool.slug || index + 1}`,
        outputName,
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

function createManagedNodeArtifact(name, displayName, type, artifactType, description) {
  return {
    id: `input-artifact-${name}`,
    name,
    displayName,
    type,
    artifactType,
    sourcePath: name,
    sourceName: name,
    description,
  };
}

function createManagedNodeInputArtifacts(rawTool, definition) {
  if (rawTool.slug === 'knowledge_extract_text') {
    return [createManagedNodeArtifact('chunk', '分片', 'string', 'text', '当前需要提取关键词的文本分片。')];
  }
  if (definition.category === '文档转换') {
    return [createManagedNodeArtifact('source_files', '待转换文件', 'array<object>', 'file_object', '待转换的原始文件，可来自人工上传或上游节点输出。')];
  }
  if (definition.category === '知识提取' && rawTool.slug === 'extract_document_knowledge_graph') {
    return [
      createManagedNodeArtifact('chunks', '文本分片', 'array<object>', 'text_chunks', '有序文本分片，用于图谱抽取。'),
    ];
  }
  if (definition.category === '文档分块') {
    return [createManagedNodeArtifact('markdown_documents', 'Markdown文档', 'array<object>', 'text_blocks', '待分块的 Markdown 文档或解析后的结构化文本。')];
  }
  if (definition.category === '内容抽取') {
    return [createManagedNodeArtifact('source_documents', '待抽取内容', 'array<object>', 'text_blocks', '待抽取的 Markdown 文档、文本切片或结构化章节内容。')];
  }
  if (definition.category === '知识打标') {
    return [createManagedNodeArtifact('knowledge_point', '待打标知识点', 'object', 'knowledge_point', '待打标的单个知识点，可来自迭代执行的当前元素。')];
  }
  const isFootnote = rawTool.slug === 'extract-footnote';
  return [createManagedNodeArtifact(isFootnote ? 'policy_documents' : 'document_files', isFootnote ? '条款文档' : '待解析文件', 'array<object>', 'file_object', isFootnote ? '待提取脚注的保险条款或政策文档。' : '待 OCR 或版面解析的文件列表。')];
}

const managedNodeUiSchemaPresets = {
  keyword_count: { widget: 'number' },
  target_format: { widget: 'select', options: [['pdf', 'PDF'], ['markdown', 'Markdown'], ['txt', '纯文本']] },
  retain_layout: { widget: 'switch' },
  output_naming_rule: { widget: 'text' },
  entity_types: { widget: 'checkboxGroup', options: [['人物', '人物'], ['组织', '组织'], ['政策文件', '政策文件'], ['产品', '产品']] },
  attribute_types: { widget: 'checkboxGroup', options: [['名称', '名称'], ['时间', '时间'], ['地点', '地点'], ['编号', '编号']] },
  relation_types: { widget: 'checkboxGroup', options: [['任职于', '任职于'], ['制定', '制定'], ['适用于', '适用于'], ['包含', '包含']] },
  graph_schema: { widget: 'select', optionSource: 'dynamic', dynamicSource: { type: 'knowledgeGraphSchema', displayField: 'name', valueField: 'content' } },
  include_isolated_entities: { widget: 'switch' },
  extraction_instruction: { widget: 'textarea' },
  chunk_strategy: { widget: 'select', options: [['heading', '按标题'], ['paragraph', '按段落'], ['semantic', '按语义']] },
  max_chunk_size: { widget: 'number' },
  overlap_size: { widget: 'number' },
  summary_type: { widget: 'select', options: [['政策摘要', '政策摘要'], ['办理条件', '办理条件'], ['材料清单', '材料清单'], ['风险提示', '风险提示']] },
  model: { widget: 'select', options: [['qwen3-8b', 'Qwen3 8B'], ['qwen3-32b', 'Qwen3 32B'], ['deepseek-v3', 'DeepSeek V3']] },
  extract_scope: { widget: 'select', options: [['full', '全文'], ['title_section', '标题章节'], ['footnote', '脚注']] },
  title_match_mode: { widget: 'radio', options: [['exact', '精确匹配'], ['contains', '包含匹配'], ['regex', '正则匹配']] },
  include_context: { widget: 'switch' },
  tag_strategy: { widget: 'radio', options: [['规则标签优先', '规则标签优先'], ['结构感知打标', '结构感知打标'], ['模型自动打标', '模型自动打标']] },
  label_pool: { widget: 'checkboxGroup', options: [['适用对象', '适用对象'], ['办理条件', '办理条件'], ['材料要求', '材料要求'], ['费用结算', '费用结算'], ['风险提示', '风险提示']] },
  parse_mode: { widget: 'select', options: [['general', '通用解析'], ['layout_ocr', '版面解析'], ['ocr', 'OCR 解析'], ['clause', '条款解析']] },
  language: { widget: 'select', options: [['zh-CN', '简体中文'], ['en-US', '英文'], ['ja-JP', '日文']] },
  table_mode: { widget: 'radio', options: [['structured', '结构化表格'], ['image', '保留图片'], ['ignore', '忽略表格']] },
  enable_image_caption: { widget: 'switch' },
  require_evidence: { widget: 'switch' },
  expansion_count: { widget: 'number' },
  additional_requirement: { widget: 'textarea' },
};

function createManagedNodeUiSchema(name) {
  const preset = managedNodeUiSchemaPresets[name] || { widget: 'auto', options: [] };
  return {
    widget: preset.widget,
    placeholder: '',
    helpText: '',
    options: (preset.options || []).map(([value, label], index) => ({
      id: `ui-option-${name}-${index + 1}`,
      value,
      label,
    })),
    optionSource: preset.optionSource || 'static',
    dynamicSource: preset.dynamicSource || null,
  };
}

function normalizeManagedNodeUiSchema(name, uiSchema) {
  const preset = createManagedNodeUiSchema(name);
  const source = uiSchema && typeof uiSchema === 'object' ? uiSchema : preset;
  const dynamicSource = source.dynamicSource && source.dynamicSource.type === 'knowledgeGraphSchema'
    ? { type: 'knowledgeGraphSchema', displayField: 'name', valueField: 'content' }
    : source.dynamicSource;
  return {
    widget: source.widget || preset.widget || 'auto',
    placeholder: String(source.placeholder || ''),
    helpText: String(source.helpText || ''),
    options: Array.isArray(source.options) ? source.options.map((option, index) => (
      option && typeof option === 'object'
        ? {
            id: option.id || `ui-option-${name}-${index + 1}`,
            value: String(option.value ?? ''),
            label: String(option.label ?? option.value ?? ''),
          }
        : {
            id: `ui-option-${name}-${index + 1}`,
            value: String(option ?? ''),
            label: String(option ?? ''),
          }
    )) : [],
    optionSource: source.optionSource || 'static',
    dynamicSource,
  };
}

function createManagedNodeParam(name, displayName, type, required, description, defaultValue = '', options = {}) {
  return { name, displayName, type, required, description, defaultValue, uiSchema: createManagedNodeUiSchema(name), ...options };
}

function createManagedNodeConfigParams(rawTool, definition) {
  if (rawTool.slug === 'knowledge_extract_text') {
    return [
      createManagedNodeParam('keyword_count', '关键词数量', 'integer', true, '希望从当前分片中提取的关键词数量上限，取值范围 1～30。', 5, { min: 1, max: 30 }),
    ];
  }
  if (definition.category === '文档转换') {
    return [
      createManagedNodeParam('target_format', '目标格式', 'string', true, '转换后的目标文件格式。', 'pdf'),
      createManagedNodeParam('retain_layout', '保留版式', 'boolean', false, '是否尽量保留原文件版式。', true),
      createManagedNodeParam('output_naming_rule', '输出命名规则', 'string', false, '转换结果文件的命名规则。', '{original_name}.pdf'),
    ];
  }
  if (definition.category === '知识提取' && rawTool.slug === 'extract_document_knowledge_graph') {
    return [
      createManagedNodeParam('graph_schema', '图谱结构定义', 'string', true, '选择当前知识空间下已创建的三元组管理 Schema；抽取时按该 Schema 定义实体、属性与关系类型。', ''),
      createManagedNodeParam('include_isolated_entities', '保留孤立实体', 'boolean', false, '是否保留无关系实体。', true),
      createManagedNodeParam('extraction_instruction', '补充抽取说明', 'string', false, '可选的抽取提示词。', ''),
    ];
  }
  if (definition.category === '文档分块') {
    return [
      createManagedNodeParam('chunk_strategy', '分块策略', 'string', true, '按标题、段落或语义边界进行分块。', 'heading'),
      createManagedNodeParam('max_chunk_size', '最大切片长度', 'number', true, '单个切片允许的最大字符数。', 1200),
      createManagedNodeParam('overlap_size', '重叠长度', 'number', false, '相邻切片之间保留的重叠字符数。', 120),
    ];
  }
  if (definition.category === '内容抽取') {
    if (rawTool.slug === 'knowledge-point-extraction') {
      return [
        createManagedNodeParam('summary_type', '提取类型', 'string', true, '控制知识点提取的目标类型。', '政策摘要'),
        createManagedNodeParam('model', '模型', 'string', false, '用于知识点提取的模型。', 'qwen3-8b'),
      ];
    }
    return [
      createManagedNodeParam('extract_scope', '抽取范围', 'string', true, '指定抽取全文、标题章节或特定内容类型。', rawTool.slug === 'extract-footnote' ? 'footnote' : 'title_section'),
      createManagedNodeParam('title_match_mode', '标题匹配方式', 'string', false, '按精确匹配、包含匹配或正则匹配定位标题。', 'contains'),
      createManagedNodeParam('include_context', '包含上下文', 'boolean', false, '是否在抽取结果中保留前后文。', true),
    ];
  }
  if (definition.category === '知识打标') {
    return [
      createManagedNodeParam('tag_strategy', '打标策略', 'string', true, '控制知识点打标时采用的标签生成策略。', '结构感知打标'),
      createManagedNodeParam('label_pool', '标签范围', 'array<string>', false, '本次打标可使用的标签范围。', ['适用对象', '办理条件', '材料要求']),
    ];
  }
  return [
    createManagedNodeParam('parse_mode', '解析模式', 'string', true, '指定通用解析、版面解析、OCR解析或条款解析模式。', 'layout_ocr'),
    createManagedNodeParam('language', '文档语言', 'string', false, '文档主要语言。', 'zh-CN'),
    createManagedNodeParam('table_mode', '表格处理模式', 'string', false, '表格区域的识别和输出方式。', 'structured'),
    createManagedNodeParam('enable_image_caption', '图片说明生成', 'boolean', false, '是否为图片区域生成文字说明。', false),
  ];
}

function createManagedNodeParameterMappingCode(rawTool, definition, artifacts, params) {
  if (rawTool.slug === 'knowledge_extract_text') {
    return `function mapParams(context) {
  const keywordCount = Math.min(Math.max(Number(context.config.keyword_count) || 5, 1), 30);

  return {
    content: context.nodeInput.chunk,
    extract_requirement: '从当前文本分片中提取不超过' + keywordCount + '个关键词或关键词短语。关键词必须能够从分片正文中得到依据，优先提取核心主题、专业术语、专有名词、重要实体、关键行为和关键约束。关键词保持原文语言并去重；有效内容不足时允许少于指定数量，不为凑数补齐。',
    knowledge_schema: {
      type: 'object',
      required: ['keyword'],
      properties: {
        keyword: {
          type: 'string',
          description: '关键词或关键词短语',
        },
        source_evidence: {
          type: 'array',
          items: { type: 'string' },
          description: '支撑该关键词的原文内容',
        },
      },
    },
  };
}`;
  }
  if (definition.category === '知识提取' && rawTool.slug === 'extract_document_knowledge_graph') {
    return `function mapParams(context) {
  const graphSchema = context.config.graph_schema || {};
  const schemaStructure = graphSchema && typeof graphSchema === 'object' && graphSchema.structure
    ? graphSchema.structure
    : {
        entityTypes: context.config.entity_types || [],
        attributeTypes: context.config.attribute_types || [],
        relationTypes: context.config.relation_types || [],
      };
  return {
    chunks: context.nodeInput.chunks,
    extraction_schema: {
      Entities: schemaStructure.entityTypes,
      Attributes: schemaStructure.attributeTypes,
      Relations: schemaStructure.relationTypes,
    },
    include_isolated_entities: context.config.include_isolated_entities,
    extraction_instruction: context.config.extraction_instruction,
  };
}`;
  }
  const rawInputs = normalizeToolInputs(rawTool);
  const artifactName = artifacts[0]?.name || 'input';
  const configNames = new Set(params.map((param) => param.name));
  const lines = rawInputs.map((input) => {
    if (input.name === 'user_id') return `    ${input.name}: context.system.userId`;
    if (input.name === 'chunks') return `    ${input.name}: context.nodeInput.chunks`;
    if (configNames.has(input.name)) return `    ${input.name}: context.config.${input.name}`;
    if (['files', 'file', 'input', 'content', 'markdown', 'md_file', 'chunk', 'knowledge'].some((key) => input.name.toLowerCase().includes(key))) {
      return `    ${input.name}: context.nodeInput.${artifactName}`;
    }
    if (input.name === 'prompt') {
      const fallbackConfig = definition.category === '内容抽取' ? 'extract_scope' : 'parse_mode';
      return `    ${input.name}: context.config.${fallbackConfig}`;
    }
    const fallback = input.defaultValue !== undefined && input.defaultValue !== '' ? ` ?? ${JSON.stringify(input.defaultValue)}` : '';
    return `    ${input.name}: context.config.${input.name}${fallback}`;
  });
  return `function mapParams(context) {
  return {
${lines.join(',\n')}
  };
}`;
}

function createEntityRelationExtractionManagedTool() {
  const inputArtifacts = [
    createManagedNodeArtifact('chunks', '文本分片', 'array<object>', 'text_chunks', '单份文档的有序文本分片，用于识别实体、关系和来源证据。'),
  ];
  const inputs = [
    createManagedNodeParam('extraction_instruction', '抽取补充说明', 'string', false, '可选的实体、关系抽取提示词。', ''),
    createManagedNodeParam('require_evidence', '来源证据必填', 'boolean', true, '每个候选实体和关系必须保留来源证据。', true),
    createManagedNodeParam('include_isolated_entities', '保留孤立实体', 'boolean', false, '是否保留无关系的实体候选。', true),
  ];
  return makeManagedTool({
    id: 'ke-platform-entity-relation-extraction',
    name: '实体关系抽取',
    description: '从单份文档中识别实体、关系与来源证据，输出待建图候选；不进行跨文档归一化。',
    category: '知识提取',
    kind: '内置工具',
    sourceType: '平台内置',
    sourceServiceId: 'knowledge-engineering-platform',
    sourceServiceName: '知识工程平台',
    sourceToolName: '实体关系抽取',
    inputArtifacts,
    inputs,
    outputs: [createOutput('entity_relation_candidates', 'object', '单文档实体、关系及来源证据候选。', 'entity_relation_candidates', entityRelationCandidatesSchema)],
    parameterMappingCode: `function mapParams(context) {
  return {
    chunks: context.nodeInput.chunks,
    extraction_instruction: context.config.extraction_instruction,
    require_evidence: context.config.require_evidence,
    include_isolated_entities: context.config.include_isolated_entities,
  };
}`,
    storageContract: createStorageContract({
      enabled: false,
      outputName: 'entity_relation_candidates',
      artifactType: '实体关系候选',
      note: '候选结果仅服务于当前单文档的后续建图，不写入跨文档全局图谱。',
    }),
    lastSyncedAt: '平台内置',
  });
}

const selfDevGraphExtractionDemoChunks = [
  {
    chunk_id: 'chunk-001',
    title: '保险责任',
    content: '示例保险公司承保本保险产品，对被保险人提供重大疾病保障、住院医疗费用补偿等保障责任。',
  },
  {
    chunk_id: 'chunk-002',
    title: '保障范围',
    content: '本保险产品的保障责任适用于符合投保年龄要求的适用人群，等待期后按约定赔付比例给付。',
  },
];

const selfDevGraphExtractionDemoSchema = {
  schemaId: 'kschema-demo-insurance-001',
  schemaName: '保险业务图谱 Schema',
  structure: {
    entityTypes: ['保险产品', '保险公司', '保险条款', '保障责任', '适用人群', '疾病', '医疗机构'],
    attributeTypes: ['投保年龄', '保险期间', '等待期', '保额', '保费', '免赔额', '赔付比例', '生效日期'],
    relationTypes: ['承保', '包含', '保障', '适用于', '约定', '除外', '就诊于'],
    constraints: [
      { source: '保险公司', relation: '承保', target: '保险产品' },
      { source: '保险产品', relation: '包含', target: '保险条款' },
      { source: '保险条款', relation: '包含', target: '保障责任' },
      { source: '保险产品', relation: '适用于', target: '适用人群' },
      { source: '保险产品', relation: '保障', target: '疾病' },
      { source: '保险条款', relation: '约定', target: '保障责任' },
      { source: '保险条款', relation: '除外', target: '疾病' },
      { source: '被保险人', relation: '就诊于', target: '医疗机构' },
    ],
  },
};

const selfDevGraphExtractionDemoConfig = {
  include_isolated_entities: true,
  require_evidence: true,
  extraction_instruction: '抽取保险合同中的保险产品、保险公司、保险条款、保障责任与疾病等对象；保留来源分片与原文证据，仅输出当前文档的图谱片段。',
};

const selfDevGraphExtractionDemoGraphFragment = {
  status: 'success',
  metadata: {
    fileName: '示例保险条款.pdf',
    language: 'zh-CN',
    documentMetadata: { document_id: 'doc-insurance-001', document_type: 'pdf' },
  },
  entities: [
    {
      id: 'ent-ins-001',
      name: '示例保险公司',
      type: '保险公司',
      properties: { 机构类型: '保险机构' },
      evidences: [{ document: { id: 'doc-insurance-001', title: '示例保险条款' }, chunk_id: 'chunk-001', quote: '示例保险公司承保本保险产品' }],
    },
    {
      id: 'ent-prod-001',
      name: '示例重疾保险产品',
      type: '保险产品',
      properties: { 保额: '50万', 等待期: '90天' },
      evidences: [{ document: { id: 'doc-insurance-001', title: '示例保险条款' }, chunk_id: 'chunk-001', quote: '示例保险公司承保本保险产品' }],
    },
    {
      id: 'ent-benefit-001',
      name: '重大疾病保障',
      type: '保障责任',
      properties: { 赔付比例: '100%' },
      evidences: [{ document: { id: 'doc-insurance-001', title: '示例保险条款' }, chunk_id: 'chunk-001', quote: '重大疾病保障' }],
    },
  ],
  relations: [
    {
      id: 'rel-001',
      sourceEntityId: 'ent-ins-001',
      sourceEntityType: '保险公司',
      relationType: '承保',
      targetEntityId: 'ent-prod-001',
      targetEntityType: '保险产品',
      confidence: 0.98,
      properties: { 承保范围: '示例重疾保险产品' },
      evidences: [{ document: { id: 'doc-insurance-001', title: '示例保险条款' }, chunk_id: 'chunk-001', quote: '示例保险公司承保本保险产品' }],
    },
    {
      id: 'rel-002',
      sourceEntityId: 'ent-prod-001',
      sourceEntityType: '保险产品',
      relationType: '包含',
      targetEntityId: 'ent-benefit-001',
      targetEntityType: '保障责任',
      confidence: 0.96,
      properties: { 保障范围: '重大疾病' },
      evidences: [{ document: { id: 'doc-insurance-001', title: '示例保险条款' }, chunk_id: 'chunk-001', quote: '重大疾病保障' }],
    },
  ],
  isolatedEntities: [],
  schemaSuggestions: [],
  schemaValidation: { mode: '严格校验', validEntityCount: 3, validRelationCount: 2, outOfSchemaCandidates: [] },
  stats: { entityCount: 3, relationCount: 2, chunkCount: 2, coveredChunkCount: 2, coverageRatio: 1 },
  failedChunks: [],
  warnings: [],
};

const selfDevelopedGraphExtractionDemoSample = {
  inputTip: '节点接收上游文本分片与配置参数；「图谱结构定义」通过动态引用选择知识空间下已创建的 Schema，配置值回填完整结构，抽取时按该 Schema 约束实体、属性与关系类型。',
  input: {
    chunks: selfDevGraphExtractionDemoChunks,
    graph_schema: selfDevGraphExtractionDemoSchema,
    ...selfDevGraphExtractionDemoConfig,
  },
  mcpInput: {
    chunks: selfDevGraphExtractionDemoChunks,
    extraction_schema: {
      entities: selfDevGraphExtractionDemoSchema.structure.entityTypes,
      attributes: selfDevGraphExtractionDemoSchema.structure.attributeTypes,
      relations: selfDevGraphExtractionDemoSchema.structure.relationTypes,
      constraints: selfDevGraphExtractionDemoSchema.structure.constraints,
    },
    include_isolated_entities: selfDevGraphExtractionDemoConfig.include_isolated_entities,
    require_evidence: selfDevGraphExtractionDemoConfig.require_evidence,
    extraction_instruction: selfDevGraphExtractionDemoConfig.extraction_instruction,
  },
  mcpResult: selfDevGraphExtractionDemoGraphFragment,
  nodeOutput: { graph_fragment: selfDevGraphExtractionDemoGraphFragment },
};

function createSelfDevelopedGraphExtractionManagedTool() {
  const inputArtifacts = [
    createManagedNodeArtifact('chunks', '文本分片', 'array<object>', 'text_chunks', '单份文档的有序文本分片，用于抽取实体、属性、关系与来源证据。'),
  ];
  const inputs = [
    createManagedNodeParam('graph_schema', '图谱结构定义', 'string', true, '选择当前知识空间下已创建的三元组管理 Schema；抽取时按该 Schema 定义实体、属性与关系类型，配置值回填完整结构。', ''),
    createManagedNodeParam('include_isolated_entities', '保留孤立实体', 'boolean', false, '是否保留无关系的实体候选。', true),
    createManagedNodeParam('require_evidence', '来源证据必填', 'boolean', true, '每个抽取到的实体和关系必须保留来源证据。', true),
    createManagedNodeParam('extraction_instruction', '补充抽取说明', 'string', false, '可选的抽取提示词。', ''),
  ];
  return {
    ...makeManagedTool({
      id: 'ke-platform-self-dev-graph-extraction',
      name: '自研图谱抽取',
      description: '自研的单文档图谱抽取节点：按所选 Schema 抽取实体、属性与关系，输出可建图的图谱片段。当前为停用状态的示例节点，仅用于讲解节点注册与 Schema 动态引用逻辑。',
      category: '知识提取',
      kind: '内置工具',
      sourceType: '平台内置',
      sourceServiceId: 'knowledge-engineering-platform',
      sourceServiceName: '知识工程平台',
      sourceToolName: '自研图谱抽取',
      inputArtifacts,
      inputs,
      outputs: [createOutput('graph_fragment', 'object', '唯一业务输出：当前文档的知识图谱片段。', 'graph_fragment', graphFragmentSchema)],
      parameterMappingCode: `function mapParams(context) {
  const schema = context.config.graph_schema;
  return {
    chunks: context.nodeInput.chunks,
    extraction_schema: schema && schema.structure ? {
      entities: schema.structure.entityTypes,
      attributes: schema.structure.attributeTypes,
      relations: schema.structure.relationTypes,
      constraints: schema.structure.constraints,
    } : null,
    include_isolated_entities: context.config.include_isolated_entities,
    require_evidence: context.config.require_evidence,
    extraction_instruction: context.config.extraction_instruction,
  };
}`,
      storageContract: createStorageContract({
        enabled: false,
        outputName: 'graph_fragment',
        artifactType: '知识图谱片段',
        note: '图谱片段仅作为节点输出供下游建图使用，不直接写入知识库。',
      }),
      demoSample: selfDevelopedGraphExtractionDemoSample,
      lastSyncedAt: '平台内置',
    }),
    enabled: false,
    status: '不可用',
  };
}

function createKeywordExtractionManagedOutputs() {
  return [
    {
      name: 'persistentResult',
      displayName: '持久化存储结果',
      type: 'array<object>',
      path: 'persistentResult',
      codeOutput: 'persistenceResult',
      description: '包含原分片正文及关键词列表的文本切片结果。',
      artifactType: '文本切片',
      sourceType: 'persistence',
      isPersistenceOutput: true,
    },
    {
      ...createOutput('keywords', 'array<string>', '当前分片提取到的关键词列表。', 'keywords'),
      displayName: '关键词列表',
      codeOutput: 'result.keywords',
    },
  ];
}

const keywordExtractionDemoContent = '参保人员在定点医疗机构发生的符合基本医疗保险药品目录、诊疗项目和医疗服务设施标准的医疗费用，按规定由基本医疗保险基金支付。';
const keywordExtractionDemoKeywords = ['参保人员', '定点医疗机构', '基本医疗保险', '医疗费用', '基本医疗保险基金'];

const keywordExtractionDemoSample = {
  inputTip: '单次处理一个文本分片，不需要传入分片 ID。',
  input: {
    chunk: keywordExtractionDemoContent,
    keyword_count: 5,
  },
  mcpResult: {
    file_info: '当前文本分片',
    knowledge: [
      { keyword: '参保人员', source_evidence: ['参保人员'] },
      { keyword: '定点医疗机构', source_evidence: ['定点医疗机构'] },
      { keyword: '基本医疗保险', source_evidence: ['基本医疗保险药品目录'] },
      { keyword: '医疗费用', source_evidence: ['医疗费用'] },
      { keyword: '基本医疗保险基金', source_evidence: ['基本医疗保险基金支付'] },
    ],
  },
  nodeOutput: {
    keywords: keywordExtractionDemoKeywords,
  },
  persistenceResult: [{
    content: keywordExtractionDemoContent,
    keywords: keywordExtractionDemoKeywords,
  }],
  persistenceTip: '关键词写入当前文本切片的 keywords 属性，不创建独立知识。',
};

const qaExpansionDemoContent = `本政策适用于本市基本医疗保险参保人员异地就医备案与费用结算。

参保人员因长期居住、转诊转院或急诊抢救需要异地就医的，可以申请备案。`;

const qaExpansionDemoItems = [
  {
    question: '哪些情况可以办理异地就医备案？',
    answer: '参保人员因长期居住、转诊转院或急诊抢救需要异地就医的，可以申请备案。',
    expanded_questions: [
      '什么情况下可以申请异地就医备案？',
      '异地就医备案适用于哪些情形？',
      '长期居住、转诊或急诊人员能办理异地就医备案吗？',
    ],
    source_evidence: ['参保人员因长期居住、转诊转院或急诊抢救需要异地就医的，可以申请备案。'],
  },
  {
    question: '异地就医政策适用于哪些人员？',
    answer: '本政策适用于本市基本医疗保险参保人员。',
    expanded_questions: [
      '哪些人适用异地就医政策？',
      '异地就医备案面向哪些参保人员？',
      '本市医保参保人员是否适用异地就医政策？',
    ],
    source_evidence: ['本政策适用于本市基本医疗保险参保人员异地就医备案与费用结算。'],
  },
];

const qaExpansionKnowledgeSchema = {
  type: 'object',
  required: ['question', 'answer', 'expanded_questions', 'source_evidence'],
  properties: {
    question: {
      type: 'string',
      description: '基于原文提炼的标准问题。',
    },
    answer: {
      type: 'string',
      description: '严格基于原文生成的标准答案。',
    },
    expanded_questions: {
      type: 'array',
      items: { type: 'string' },
      description: '与标准问题语义一致的相似问或问法扩写。',
    },
    source_evidence: {
      type: 'array',
      items: { type: 'string' },
      description: '支撑该问答对的原文内容。',
    },
  },
};

const qaExpansionDemoSample = {
  input: {
    content: qaExpansionDemoContent,
    expansion_count: 3,
    additional_requirement: '使用医保客服常用表达，答案严格基于原文。',
  },
  mcpInput: {
    content: qaExpansionDemoContent,
    extract_requirement: '从输入内容中提取可独立使用的QA对；答案必须严格基于原文，不得补充原文没有的信息。每个标准问题生成3条语义一致、表达自然且不重复的相似问。使用医保客服常用表达，答案严格基于原文。',
    knowledge_schema: qaExpansionKnowledgeSchema,
  },
  mcpResult: {
    file_info: '异地就医备案政策文本',
    knowledge: qaExpansionDemoItems,
  },
  nodeOutput: {
    qa_pairs: qaExpansionDemoItems,
  },
  persistenceResult: qaExpansionDemoItems,
  persistenceTip: '每条QA对连同相似问和来源依据写入QA知识，持久化结果同时作为节点输出提供给下游。',
};

function createQaExpansionManagedTool(service, rawTool) {
  const inputArtifacts = [
    createManagedNodeArtifact('content', '待提取文本', 'string', 'text', '当前需要提取QA对并生成相似问的文本内容。'),
  ];
  const inputs = [
    createManagedNodeParam('expansion_count', '问法扩写数量', 'integer', true, '每个标准问题生成的相似问数量，取值范围 0～10。', 5, { min: 0, max: 10 }),
    createManagedNodeParam('additional_requirement', '补充抽取要求', 'string', false, '可补充业务语气、答案边界或问法风格要求。', ''),
  ];
  return makeManagedTool({
    id: 'ke-idp-knowledge_extract_text-qa-expansion',
    name: 'QA提取-支持问法扩写',
    description: '基于输入文本提取标准问答对，并为每个标准问题生成指定数量的相似问。',
    category: '知识提取',
    sourceServiceId: service.id,
    sourceServiceName: service.name,
    sourceToolName: rawTool.name,
    inputArtifacts,
    inputs,
    outputs: [
      {
        ...createOutput('qa_pairs', 'array<object>', '标准问答对、问法扩写及来源依据。', 'qa_pairs', {
          type: 'array',
          items: qaExpansionKnowledgeSchema,
        }),
        codeOutput: 'result.qa_pairs',
        artifactType: 'QA对',
      },
    ],
    parameterMappingCode: `function mapParams(context) {
  const configuredCount = Number(context.config.expansion_count);
  const expansionCount = Number.isFinite(configuredCount)
    ? Math.min(Math.max(configuredCount, 0), 10)
    : 5;
  const additionalRequirement = String(context.config.additional_requirement || '').trim();
  const baseRequirement = '从输入内容中提取可独立使用的QA对；答案必须严格基于原文，不得补充原文没有的信息。每个标准问题生成'
    + expansionCount
    + '条语义一致、表达自然且不重复的相似问。';

  return {
    content: context.nodeInput.content,
    extract_requirement: additionalRequirement
      ? baseRequirement + additionalRequirement
      : baseRequirement,
    knowledge_schema: ${JSON.stringify(qaExpansionKnowledgeSchema, null, 2)},
  };
}`,
    storageContract: createStorageContract({
      enabled: true,
      outputName: 'qa_pairs',
      artifactType: 'QA对',
      storageTargetType: 'Elasticsearch',
      esAddress: 'http://es.internal:9200',
      esIndex: '',
      writeMode: 'upsert',
      persistenceParseCode: `function parsePersistenceResult(mcpResult) {
  const qaPairs = Array.isArray(mcpResult.knowledge) ? mcpResult.knowledge : [];
  return qaPairs.map((item) => ({
    question: item.question || '',
    answer: item.answer || '',
    expanded_questions: Array.isArray(item.expanded_questions) ? item.expanded_questions : [],
    source_evidence: Array.isArray(item.source_evidence) ? item.source_evidence : [],
  }));
}`,
      nodeOutputParseCode: `function parseNodeOutput(mcpResult) {
  const qaPairs = Array.isArray(mcpResult.knowledge) ? mcpResult.knowledge : [];
  return {
    qa_pairs: qaPairs.map((item) => ({
      question: item.question || '',
      answer: item.answer || '',
      expanded_questions: Array.isArray(item.expanded_questions) ? item.expanded_questions : [],
      source_evidence: Array.isArray(item.source_evidence) ? item.source_evidence : [],
    })),
      };
}`,
      rules: [
        {
          id: 'storage-qa-expansion',
          outputName: 'qa_pairs',
          fieldType: 'array<object>',
          artifactType: 'QA对',
          storageTargetType: 'Elasticsearch',
          esAddress: 'http://es.internal:9200',
          esIndex: '',
          targetField: 'qa_pairs',
          writeMode: 'upsert',
          nodeOutputRef: true,
        },
      ],
      note: '将标准问题、答案、相似问和来源依据作为QA对持久化，结果自动提供给下游节点。',
    }),
    demoSample: qaExpansionDemoSample,
    lastSyncedAt: service.lastSyncedAt,
  });
}

function initialManagedTools(services = initialServices) {
  const rawTools = services
    .filter((service) => !service.locked && service.status !== '停用')
    .flatMap((service) => (service.tools || []).map((tool) => ({ service, tool })))
    .filter(({ tool }) => tool.enabled !== false && tool.status !== '不可用');

  const mcpTools = rawTools.map(({ service, tool }, index) => {
    const definition = getManagedToolDefinition(tool);
    const inputArtifacts = createManagedNodeInputArtifacts(tool, definition);
    const inputs = createManagedNodeConfigParams(tool, definition);
    return makeManagedTool({
      id: `ke-idp-${tool.slug || index + 1}`,
      name: definition.name,
      description: definition.description,
      category: definition.category,
      sourceServiceId: service.id,
      sourceServiceName: service.name,
      sourceToolName: tool.name,
      inputArtifacts,
      inputs,
      outputs: tool.slug === 'knowledge_extract_text' ? createKeywordExtractionManagedOutputs() : normalizeToolOutputs(tool),
      parameterMappingCode: createManagedNodeParameterMappingCode(tool, definition, inputArtifacts, inputs),
      storageContract: managedToolStorageFor(tool, index),
      demoSample: tool.slug === 'knowledge_extract_text' ? keywordExtractionDemoSample : null,
      lastSyncedAt: service.lastSyncedAt,
    });
  });
  const qaExpansionTools = rawTools
    .filter(({ tool }) => tool.slug === 'knowledge_extract_text')
    .map(({ service, tool }) => createQaExpansionManagedTool(service, tool));
  return [...mcpTools, ...qaExpansionTools, createEntityRelationExtractionManagedTool(), createSelfDevelopedGraphExtractionManagedTool()];
}

function migrateManagedGraphToolInputs(tool) {
  const inputs = Array.isArray(tool?.inputs) ? tool.inputs : [];
  const hasLegacyTypeParams = inputs.some((input) => ['entity_types', 'attribute_types', 'relation_types'].includes(input.name));
  if (!hasLegacyTypeParams) return tool;
  const legacyParams = new Set(['entity_types', 'attribute_types', 'relation_types']);
  const graphSchemaInput = createManagedNodeParam('graph_schema', '图谱结构定义', 'string', true, '选择当前知识空间下已创建的三元组管理 Schema；抽取时按该 Schema 定义实体、属性与关系类型。', '');
  return {
    ...tool,
    inputs: [graphSchemaInput, ...inputs.filter((input) => !legacyParams.has(input.name))],
  };
}

function normalizeStoredTools(tools) {
  const graphToolNameOrSource = GRAPH_TOOL_ALIAS_NAMES;
  const byId = new Map();

  tools.forEach((rawTool) => {
    const isLegacyKnowledgeGraph = rawTool?.id === GRAPH_TOOL_CANONICAL_ID
      || GRAPH_TOOL_LEGACY_IDS.has(rawTool?.id)
      || rawTool?.slug === 'extract_document_knowledge_graph'
      || graphToolNameOrSource.has(rawTool?.name)
      || graphToolNameOrSource.has(rawTool?.sourceToolName);
    const normalizedSourceName = isLegacyKnowledgeGraph
      ? GRAPH_TOOL_SOURCE_TOOL_NAME
      : rawTool?.sourceToolName || rawTool?.name;
    const normalizedName = isLegacyKnowledgeGraph
      ? GRAPH_TOOL_CANONICAL_NAME
      : rawTool?.name || '未命名节点';
    const normalizedId = isLegacyKnowledgeGraph
      ? GRAPH_TOOL_CANONICAL_ID
      : rawTool?.id || `${rawTool?.serviceId || 'svc'}-${rawTool?.name || rawTool?.sourceToolName || 'tool'}`;
    const migratedRaw = isLegacyKnowledgeGraph ? migrateManagedGraphToolInputs(rawTool) : rawTool;
    const tool = {
      ...rawTool,
      id: normalizedId,
      name: normalizedName,
      category: rawTool.category || (isLegacyKnowledgeGraph ? '知识提取' : '未分类'),
      status: isLegacyKnowledgeGraph ? '可用' : rawTool.status || (rawTool.enabled === false ? '不可用' : '可用'),
      lifecycleStatus: isLegacyKnowledgeGraph ? '已发布' : rawTool.lifecycleStatus || '已发布',
      kind: rawTool.kind || (rawTool.sourceType === '平台内置' ? '内置工具' : '外部工具'),
      sourceType: rawTool.sourceType || 'MCP工具创建',
      sourceServiceId: rawTool.sourceServiceId || rawTool.serviceId || '',
      sourceServiceName: rawTool.sourceServiceName || rawTool.serviceName || '',
      sourceToolName: normalizedSourceName,
      version: rawTool.version || 'v1',
      enabled: isLegacyKnowledgeGraph ? true : (rawTool.enabled ?? rawTool.status !== '不可用'),
      lastSyncedAt: rawTool.lastSyncedAt || '-',
      inputs: normalizeToolInputs(migratedRaw),
      outputs: normalizeToolOutputs(migratedRaw),
      storageContract: normalizeStorageContract(migratedRaw.storageContract),
    };
    const previous = byId.get(tool.id);
    byId.set(tool.id, previous ? { ...previous, ...tool } : tool);
  });

  return [...byId.values()];
}

function mergeStoredToolsWithSeed(storedTools, seedTools) {
  const seedByName = new Map(seedTools.map((tool) => [tool.name, tool]));
  const storedNames = new Set(storedTools.map((tool) => tool.name));
  const refreshedTools = storedTools.map((tool) => {
    const seed = seedByName.get(tool.name);
    if (!seed) return tool;
    const seedInputsByName = new Map((seed.inputs || []).map((input) => [input.name, input]));
    const inputs = (tool.inputs || []).map((input) => {
      const seedInput = seedInputsByName.get(input.name);
      const uiSchema = input.uiSchema;
      const hasConfiguredUiSchema = Boolean(
        uiSchema
        && (
          (uiSchema.widget && uiSchema.widget !== 'auto')
          || String(uiSchema.placeholder || '').trim()
          || String(uiSchema.helpText || '').trim()
          || (Array.isArray(uiSchema.options) && uiSchema.options.length)
        )
      );
      return hasConfiguredUiSchema || !seedInput?.uiSchema ? input : { ...input, uiSchema: seedInput.uiSchema };
    });
    return {
      ...seed,
      ...tool,
      inputs,
      id: tool.id || seed.id,
      status: tool.status || seed.status,
      enabled: tool.enabled ?? seed.enabled,
      lifecycleStatus: tool.lifecycleStatus || seed.lifecycleStatus,
      version: tool.version || seed.version,
      lastSyncedAt: tool.lastSyncedAt || seed.lastSyncedAt,
    };
  });
  const missingSeedTools = seedTools.filter((tool) => !storedNames.has(tool.name));
  return {
    tools: [...refreshedTools, ...missingSeedTools],
    changed: missingSeedTools.length > 0 || refreshedTools.some((tool, index) => JSON.stringify(tool) !== JSON.stringify(storedTools[index])),
  };
}

export function loadServices() {
  purgeLegacyDemoStorage();
  return mergeStoredServicesWithSeed(readStoredJson(SERVICES_KEY, initialServices, isRecordArray));
}

function mergeStoredServicesWithSeed(services) {
  const normalizedServices = (Array.isArray(services) ? services : []).filter(isRecord).map(normalizeService);
  const storedIds = new Set(normalizedServices.map((service) => service.id));
  return [
    ...normalizedServices,
    ...initialServices.filter((service) => !storedIds.has(service.id)),
  ];
}

function normalizeService(service) {
  const seed = initialServices.find((item) => item.id === service.id);
  const seedTools = seed?.tools || [];
  const serviceTools = Array.isArray(service?.tools) ? service.tools : [];
  const storedTools = service?.id === 'svc-idp-document-processing'
    ? serviceTools.filter((tool) => !isKnowledgeGraphServiceTool(tool))
    : serviceTools;
  const mergedTools = mergeSeedToolsWithStoredTools(storedTools, seedTools);
  if (seed && (!service.serviceType || service.type || service.endpoint !== seed.endpoint)) {
    return {
      ...seed,
      ...service,
      status: service.status === '已停用' ? '停用' : service.status || seed.status,
      toolCount: mergedTools.toolCount,
      toolNames: mergedTools.toolNames,
      toolCategories: mergedTools.toolCategories,
      tools: mergedTools.tools.map((tool) => ({ ...tool, enabled: tool.enabled ?? tool.status !== '不可用' })),
    };
  }
  const serviceType = service.serviceType || service.type || '标准 MCP Server';
  const status = service.enabled === false ? '停用' : service.status === '已停用' ? '停用' : service.status || '连接中';
  return {
    ...service,
    serviceType,
    version: service.version || 'V1.0.0',
    status,
    toolCount: mergedTools.toolCount,
    toolNames: mergedTools.toolNames,
    toolCategories: mergedTools.toolCategories,
    tools: mergedTools.tools.map((tool) => ({ ...tool, enabled: tool.enabled ?? tool.status !== '不可用' })),
  };
}

export function saveServices(services) {
  writeStoredJson(SERVICES_KEY, services);
  const existing = readCatalog();
  const customCategories = readCategories();
  saveCatalog(existing.tools, mergeCategories(defaultCategories, customCategories));
}

function readCategories() {
  return readStoredJson(CATEGORY_KEY, defaultCategories, (value) => Array.isArray(value) && value.every((item) => typeof item === 'string'));
}

function mergeCategories(...categoryGroups) {
  return Array.from(new Set(categoryGroups.flat().filter(Boolean)));
}

export function readCatalog() {
  try {
    const tools = readStoredJson(CATALOG_KEY, null, (value) => value === null || isRecordArray(value));
    const categories = readCategories();
    if (tools) {
      const storedTools = normalizeStoredTools(tools);
      const seedTools = initialManagedTools(initialServices);
      const merged = mergeStoredToolsWithSeed(storedTools, seedTools);
      const nextTools = merged.tools;
      const nextCategories = mergeCategories(defaultCategories, categories, nextTools.map((tool) => tool.category));
      if (merged.changed || nextCategories.length !== categories.length) saveCatalog(nextTools, nextCategories);
      return { tools: nextTools, categories: nextCategories };
    }
  } catch {
    // ignore
  }
  const tools = initialManagedTools(loadServices());
  const categories = mergeCategories(defaultCategories);
  saveCatalog(tools, categories);
  return { tools, categories };
}

export function saveCatalog(tools, categories) {
  writeStoredJson(CATALOG_KEY, tools);
  writeStoredJson(CATEGORY_KEY, categories);
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
  const hasOverride = (key) => Object.prototype.hasOwnProperty.call(overrides, key);
  return makeManagedTool({
    id: `ke-standard-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name,
    description: overrides.description?.trim() || rawTool.description || '由 MCP 原始工具创建的流程节点。',
    category: overrides.category || rawTool.category || '未分类',
    sourceServiceId: source?.serviceId || '',
    sourceServiceName: source?.serviceName || '',
    sourceToolName: rawTool.name || '',
    inputArtifacts: hasOverride('inputArtifacts') ? overrides.inputArtifacts : undefined,
    inputs: hasOverride('inputs') ? overrides.inputs : (rawTool.inputs || defaultToolInputs(rawTool.name || '')),
    outputs: hasOverride('outputs') ? overrides.outputs : (rawTool.outputs || defaultToolOutputs(rawTool.name || '')),
    parameterMappingCode: hasOverride('parameterMappingCode') ? overrides.parameterMappingCode : '',
    storageContract: createStorageContract({
      enabled: Boolean(overrides.persistenceEnabled),
      outputName: overrides.storageRules?.[0]?.outputName || '',
      artifactType: overrides.persistenceArtifactType || '原始结果',
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
      standardizationCode: overrides.persistenceParseCode || '',
      persistenceParseCode: overrides.persistenceParseCode || '',
      nodeOutputParseCode: overrides.nodeOutputParseCode || '',
      rules: overrides.storageRules || [],
      note: overrides.storageNote || '创建后可在工具详情中继续完善结果存储设置。',
    }),
    lastSyncedAt: source?.lastSyncedAt || '-',
    autoGenerateDemoMappings: false,
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
    headers: [],
    connectionTimeout: '60',
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
