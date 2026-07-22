const keys = {
  industries: 'ke-industries',
  domains: 'ke-domains',
  scenarios: 'ke-scenarios',
  relationships: 'ke-relationships',
  templates: 'ke-templates',
  projects: 'ke-projects-v2',
  projectSolutions: 'ke-project-solutions-v2',
  projectCategories: 'ke-project-categories-v2',
  categoryPlans: 'ke-category-plans-v2',
  plans: 'ke-plans-v1',
  planVersions: 'ke-plan-versions-v1',
  planExecutions: 'ke-plan-executions-v1',
  planChats: 'ke-plan-chats-v1',
  planIssues: 'ke-plan-issues-v1',
  demoPlanSeedVersion: 'ke-demo-plan-seed-version',
};

const formTypes = ['切片库', 'QA库', '知识点', '知识图谱'];
const formTypeDisplayNames = {
  切片库: '文本切片',
  QA库: '问答库',
};
const legacyFormTypeMap = {
  非结构化切片: '切片库',
  文本切片: '切片库',
  问答库: 'QA库',
};

export function getKnowledgeFormTypeLabel(formType = '') {
  return formTypeDisplayNames[formType] || formType;
}

function read(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function id(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function compareVersionAsc(a, b) {
  const [aMajor = '0', aMinor = '0'] = `${a}`.split('.');
  const [bMajor = '0', bMinor = '0'] = `${b}`.split('.');
  return (Number(aMajor) || 0) - (Number(bMajor) || 0) || (Number(aMinor) || 0) - (Number(bMinor) || 0);
}

function getLatestVersion(versions) {
  return [...versions].sort((a, b) => compareVersionAsc(a.version, b.version)).at(-1) || null;
}

const seed = {
  industries: [
    { id: 'ind-bank', name: '银行', enabled: true },
    { id: 'ind-insurance', name: '保险', enabled: true },
    { id: 'ind-test', name: '测试', enabled: true },
    { id: 'ind-food', name: '餐饮', enabled: true },
  ],
  domains: [
    { id: 'dom-marketing', name: '营销', enabled: true },
    { id: 'dom-training', name: '陪练', enabled: true },
    { id: 'dom-test-one', name: '1', enabled: true },
    { id: 'dom-milk-tea', name: '奶茶', enabled: true },
  ],
  scenarios: [
    { id: 'sce-qa', name: '问答', enabled: true },
    { id: 'sce-test-one', name: '1', enabled: true },
    { id: 'sce-brand', name: '品牌加盟', enabled: true },
  ],
  relationships: [
    { id: 'rel-bank-marketing-qa', industryId: 'ind-bank', domainId: 'dom-marketing', scenarioId: 'sce-qa', enabled: true },
    { id: 'rel-insurance-training-qa', industryId: 'ind-insurance', domainId: 'dom-training', scenarioId: 'sce-qa', enabled: true },
    { id: 'rel-test-one-one', industryId: 'ind-test', domainId: 'dom-test-one', scenarioId: 'sce-test-one', enabled: true },
    { id: 'rel-food-milk-brand', industryId: 'ind-food', domainId: 'dom-milk-tea', scenarioId: 'sce-brand', enabled: true },
  ],
  templates: [
    { id: 'tpl-bank-marketing', name: '银行营销场景的问答模板', description: '适用于银行营销问答场景的知识空间模板', relationshipId: 'rel-bank-marketing-qa', enabled: true },
    { id: 'tpl-general', name: '通用模板', description: '通用的知识管理模板，适用于各种场景', relationshipId: '', enabled: true },
    { id: 'tpl-mixue', name: '蜜雪冰城', description: '蜜雪冰城品牌加盟知识空间模板', relationshipId: 'rel-food-milk-brand', enabled: true },
  ],
  projects: [
    { id: 'proj-main', name: '长安银行知识空间', description: '银行营销、产品和流程知识的统一知识空间。', relationshipId: 'rel-bank-marketing-qa', templateId: 'tpl-bank-marketing', vectorModel: 'maip2.0_pa-multilingual-e5-large', completion: '1/7', projectStatus: '配置中', enabled: true, hasContent: true, hasSolution: true, createdAt: '2026-06-02 10:20' },
  ],
  projectSolutions: [
    { id: 'sol-main', projectId: 'proj-main', status: 'draft', enabled: true, templateId: 'tpl-bank-marketing', createdAt: '2026-06-02 10:22', updatedAt: '2026-06-02 17:11' },
  ],
  projectCategories: [
    { id: 'cat-product', solutionId: 'sol-main', parentId: null, name: '产品知识', level: 1, formTypes: [], hasContent: false },
    { id: 'cat-wealth', solutionId: 'sol-main', parentId: 'cat-product', name: '财富管理', level: 2, formTypes: [], hasContent: false },
    { id: 'cat-wealth-fund', solutionId: 'sol-main', parentId: 'cat-wealth', name: '理财产品', level: 3, formTypes, hasContent: true },
    { id: 'cat-wealth-fund-risk', solutionId: 'sol-main', parentId: 'cat-wealth', name: '风险揭示', level: 3, formTypes, hasContent: false },
    { id: 'cat-credit', solutionId: 'sol-main', parentId: 'cat-product', name: '信贷产品', level: 2, formTypes: [], hasContent: false },
    { id: 'cat-credit-personal', solutionId: 'sol-main', parentId: 'cat-credit', name: '个人贷款', level: 3, formTypes, hasContent: false },
    { id: 'cat-process', solutionId: 'sol-main', parentId: null, name: '业务流程', level: 1, formTypes: [], hasContent: false },
    { id: 'cat-customer-service', solutionId: 'sol-main', parentId: 'cat-process', name: '客户服务', level: 2, formTypes: [], hasContent: false },
    { id: 'cat-open-account', solutionId: 'sol-main', parentId: 'cat-customer-service', name: '开户流程', level: 3, formTypes, hasContent: false },
    { id: 'cat-complaint', solutionId: 'sol-main', parentId: 'cat-customer-service', name: '投诉处理', level: 3, formTypes, hasContent: false },
    { id: 'cat-compliance', solutionId: 'sol-main', parentId: null, name: '合规制度', level: 1, formTypes: [], hasContent: false },
    { id: 'cat-marketing-compliance', solutionId: 'sol-main', parentId: 'cat-compliance', name: '营销合规', level: 2, formTypes: [], hasContent: false },
    { id: 'cat-copy-review', solutionId: 'sol-main', parentId: 'cat-marketing-compliance', name: '宣传话术审核', level: 3, formTypes, hasContent: false },
  ],
  categoryPlans: [
    {
      id: 'plan-wealth-fund-qa',
      projectId: 'proj-main',
      solutionId: 'sol-main',
      categoryId: 'cat-wealth-fund',
      formType: 'QA库',
      status: 'active',
      name: '理财产品问答库处理方案',
      nodes: [
        { toolId: 'ke-standard-file-parse', toolName: '通用解析' },
        { toolId: 'ke-standard-parent-child-chunk', toolName: '父子切片' },
        { toolId: 'ke-standard-qa-extract', toolName: 'QA抽取' },
      ],
      updatedAt: '2026-06-02 17:11',
    },
  ],
};

function fallbackCategoriesForProject(solution, project) {
  const baseId = solution.id.replace(/^sol-/, '');
  if (project.templateId === 'tpl-mixue') {
    return [
      { id: `cat-${baseId}-product`, solutionId: solution.id, parentId: null, name: '产品知识', level: 1, formTypes: [], hasContent: false },
      { id: `cat-${baseId}-franchise`, solutionId: solution.id, parentId: `cat-${baseId}-product`, name: '加盟政策', level: 2, formTypes, hasContent: project.hasContent },
    ];
  }
  if (project.relationshipId === 'rel-bank-marketing-qa') {
    return [
      { id: `cat-${baseId}-product`, solutionId: solution.id, parentId: null, name: '产品知识', level: 1, formTypes: [], hasContent: false },
      { id: `cat-${baseId}-finance`, solutionId: solution.id, parentId: `cat-${baseId}-product`, name: '理财产品', level: 2, formTypes, hasContent: project.hasContent },
      { id: `cat-${baseId}-process`, solutionId: solution.id, parentId: null, name: '业务流程', level: 1, formTypes: [], hasContent: false },
      { id: `cat-${baseId}-account`, solutionId: solution.id, parentId: `cat-${baseId}-process`, name: '开户流程', level: 2, formTypes, hasContent: false },
    ];
  }
  if (project.relationshipId === 'rel-insurance-training-qa') {
    return [
      { id: `cat-${baseId}-rules`, solutionId: solution.id, parentId: null, name: project.projectStatus === '草稿' ? '风控规则' : '保险知识', level: 1, formTypes, hasContent: project.hasContent },
    ];
  }
  return [
    { id: `cat-${baseId}-root`, solutionId: solution.id, parentId: null, name: '测试类目', level: 1, formTypes, hasContent: project.hasContent },
  ];
}

function ensureProjectCategories() {
  const projects = read(keys.projects, []);
  const solutions = read(keys.projectSolutions, []);
  const categories = read(keys.projectCategories, []);
  const next = [...categories];
  let changed = false;

  projects.forEach((project) => {
    const solution = solutions.find((item) => item.projectId === project.id);
    if (!solution) return;
    const hasCategory = next.some((item) => item.solutionId === solution.id);
    if (hasCategory) return;
    next.push(...fallbackCategoriesForProject(solution, project));
    changed = true;
  });

  if (changed) write(keys.projectCategories, next);
}

function normalizeProjectCategories() {
  const categories = read(keys.projectCategories, []);
  let changed = false;
  const next = categories.map((category) => {
    if (!category.formTypes?.length) return category;
    const normalized = category.formTypes.map((item) => legacyFormTypeMap[item] || item).filter((item) => formTypes.includes(item));
    const nextFormTypes = normalized.length ? Array.from(new Set(normalized)) : formTypes;
    const shouldUseFullSet = nextFormTypes.length > 0;
    const effectiveFormTypes = shouldUseFullSet ? formTypes : nextFormTypes;
    if (effectiveFormTypes.length !== category.formTypes.length || effectiveFormTypes.some((item, index) => item !== category.formTypes[index])) {
      changed = true;
      return { ...category, formTypes: effectiveFormTypes };
    }
    return category;
  });
  if (changed) write(keys.projectCategories, next);
}

function normalizeCategoryPlans() {
  const plans = read(keys.categoryPlans, []);
  let changed = false;
  const next = plans.map((plan) => {
    const formType = legacyFormTypeMap[plan.formType] || plan.formType;
    const effectiveFormType = formTypes.includes(formType) ? formType : '切片库';
    const fileFormat = plan.fileFormat || 'pdf';
    if (effectiveFormType !== plan.formType || fileFormat !== plan.fileFormat) {
      changed = true;
      return { ...plan, formType: effectiveFormType, fileFormat };
    }
    return plan;
  });
  if (changed) write(keys.categoryPlans, next);
}

function getLegacyPlanScope(plan) {
  return plan.planScope === 'fallback' || `${plan.categoryId || ''}`.startsWith('fallback-plan-') ? 'fallback' : 'category';
}

function migrateLegacyCategoryPlans() {
  const legacyPlans = read(keys.categoryPlans, []);
  if (!legacyPlans.length) return;

  const plans = read(keys.plans, []);
  const versions = read(keys.planVersions, []);
  let nextPlans = [...plans];
  let nextVersions = [...versions];
  let changed = false;

  legacyPlans.forEach((legacyPlan) => {
    const planScope = getLegacyPlanScope(legacyPlan);
    const categoryId = planScope === 'category' ? legacyPlan.categoryId : null;
    const formType = legacyFormTypeMap[legacyPlan.formType] || legacyPlan.formType || '切片库';
    const fileFormat = legacyPlan.fileFormat || 'pdf';
    const existingPlan = nextPlans.find((item) => (
      item.projectId === legacyPlan.projectId
      && item.planScope === planScope
      && (item.categoryId || null) === categoryId
      && item.formType === formType
      && item.fileFormat === fileFormat
    ));
    const plan = existingPlan || {
      id: legacyPlan.id?.startsWith('plan-') ? legacyPlan.id : id('plan'),
      projectId: legacyPlan.projectId,
      solutionId: legacyPlan.solutionId,
      planScope,
      categoryId,
      formType,
      fileFormat,
      status: legacyPlan.status || 'active',
      name: legacyPlan.name,
      createdAt: legacyPlan.createdAt || legacyPlan.updatedAt || new Date().toISOString().slice(0, 16).replace('T', ' '),
      updatedAt: legacyPlan.updatedAt || new Date().toISOString().slice(0, 16).replace('T', ' '),
    };
    if (!existingPlan) {
      nextPlans.push(plan);
      changed = true;
    }
    const version = legacyPlan.version || '1.0';
    const hasVersion = nextVersions.some((item) => item.planId === plan.id && item.version === version);
    if (!hasVersion) {
      nextVersions.push({
        id: id('plan-version'),
        planId: plan.id,
        version,
        nodes: legacyPlan.nodes || [],
        sampleFiles: [],
        results: [],
        createdAt: legacyPlan.createdAt || legacyPlan.updatedAt || new Date().toISOString().slice(0, 16).replace('T', ' '),
      });
      changed = true;
    }
  });

  if (changed) {
    write(keys.plans, nextPlans);
    write(keys.planVersions, nextVersions);
  }
}

const demoFileMeta = {
  pdf: { name: '医保政策样例.pdf', type: 'PDF', size: '2.40 MB' },
  docx: { name: '开户流程手册.docx', type: 'DOCX', size: '1.86 MB' },
  xlsx: { name: '客户问答清单.xlsx', type: 'XLSX', size: '1.32 MB' },
  pptx: { name: '理财产品培训课件.pptx', type: 'PPTX', size: '3.16 MB' },
  txt: { name: '投诉工单导出.txt', type: 'TXT', size: '0.42 MB' },
  md: { name: '宣传话术清单.md', type: 'MD', size: '0.36 MB' },
};

function slugText(value) {
  return String(value || '')
    .replace(/[^\w\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}

function demoPlanId({ planScope, categoryId, formType, fileFormat }) {
  return `demo-plan-${planScope}-${categoryId || 'space'}-${slugText(formType)}-${fileFormat}`;
}

function demoNodeSets(formType, fileFormat, categoryId = '') {
  const parserNodes = {
    pdf: { toolId: 'ke-idp-mineru-ocr', toolName: 'MinerU版面解析', category: '文档解析' },
    docx: { toolId: 'ke-idp-mx-ocr', toolName: '通用OCR解析', category: '文档解析' },
    xlsx: { toolId: 'ke-idp-glm-ocr', toolName: 'GLM文档解析', category: '文档解析' },
    pptx: { toolId: 'ke-idp-hunyuan-ocr', toolName: 'Hunyuan文档解析', category: '文档解析' },
    txt: { toolId: 'ke-idp-mx-ocr', toolName: '通用OCR解析', category: '文档解析' },
    md: { toolId: 'ke-idp-deepseek-ocr', toolName: 'DeepSeek文档解析', category: '文档解析' },
  };
  const parser = parserNodes[fileFormat] || parserNodes.pdf;
  const splitter = { toolId: 'ke-idp-markdown-chunk', toolName: 'Markdown结构化分块', category: '文本分片' };
  const iteration = { toolId: 'system-iteration', toolName: '迭代执行', category: '系统节点' };
  if (categoryId === 'cat-wealth-fund' && formType === '知识点' && fileFormat === 'pdf') {
    return [parser, splitter, { toolId: 'summary', toolName: '知识点提取', category: '知识提取' }, iteration];
  }
  if (formType === '知识图谱') return [parser, splitter, { toolId: 'ke-idp-extract_document_knowledge_graph', toolName: '单文档图谱抽取', category: '知识提取' }];
  if (formType === '切片库') return [parser, splitter];
  if (formType === 'QA库') return [parser, splitter, { toolId: 'qa-extractor', toolName: 'QA提取', category: '知识提取' }];
  return [parser, splitter, { toolId: 'summary', toolName: '知识点提取', category: '知识提取' }, iteration];
}

function demoSampleFile(fileFormat, seedName) {
  const meta = demoFileMeta[fileFormat] || demoFileMeta.pdf;
  const name = seedName || meta.name;
  return {
    id: `demo-sample-${slugText(name)}`,
    name,
    type: meta.type,
    size: meta.size,
    status: '已完成',
  };
}

function demoResult(file, nodes, formType, categoryName, version, categoryId = '') {
  const isFundKnowledgePdf = categoryId === 'cat-wealth-fund' && formType === '知识点' && file.type === 'PDF';
  const isKnowledgeGraph = formType === '知识图谱' && file.type === 'PDF';
  const sliceItems = isFundKnowledgePdf ? [
    { chunkId: 'fund-chunk-001', title: '基金概况与投资目标', content: '本基金主要投资于符合基金合同约定的资产，投资者应结合自身风险承受能力审慎决策。', page: 2 },
    { chunkId: 'fund-chunk-002', title: '风险收益特征', content: '基金净值可能波动，过往业绩不代表未来表现，投资者需关注产品风险等级和投资范围。', page: 6 },
    { chunkId: 'fund-chunk-003', title: '申购赎回规则', content: '申购、赎回申请按交易日规则确认，到账时间以基金合同和销售机构公告为准。', page: 14 },
  ] : [
    { chunkId: 'chunk-001', title: '适用范围', content: '本政策适用于本市基本医疗保险参保人员异地就医备案与费用结算。', page: 1 },
    { chunkId: 'chunk-002', title: '办理条件', content: '长期居住、转诊转院或急诊抢救需要异地就医时，可以申请备案。', page: 2 },
  ];

  const graphVariant = isKnowledgeGraph ? (
    version === '1.0' ? 'partial_success' : 'success'
  ) : 'success';

  const graphEvidence = {
    document: { id: file.fileId || 'doc-insurance-001', title: `${file.name} 段落来源证据` },
    chunkId: 'chunk-001',
    quote: '本市基本医疗保险参保人员因长期居住、转诊转院或急诊抢救需要异地就医时，可申请备案。',
    offset: { start: 40, end: 112 },
  };

  const graphSuccess = {
    status: 'success',
    metadata: {
      fileName: file.name,
      language: 'zh-CN',
      documentMetadata: {
        document_id: file.fileId || 'doc-insurance-001',
        document_type: 'pdf',
      },
    },
    entities: [
      { id: 'ent-person-001', name: '李芳', type: '人物', properties: { 职务: '政策管理员', 标签: ['异地就医', '政策发布'] }, evidences: [graphEvidence] },
      { id: 'ent-org-001', name: '市医保局', type: '组织', properties: { 机构类型: '医保管理机构', 所在国家: '中国' }, evidences: [graphEvidence] },
      { id: 'ent-policy-001', name: '异地就医备案指引', type: '政策文件', properties: { 适用范围: '异地就医备案', 版本: '2026' }, evidences: [graphEvidence] },
      { id: 'ent-person-002', name: '赵磊', type: '人物', properties: { 职务: '报销审查', 标签: ['费用结算', '审核员'] }, evidences: [graphEvidence] },
    ],
    relations: [
      { id: 'rel-001', sourceEntityId: 'ent-person-001', sourceEntityType: '人物', relationType: '任职于', targetEntityId: 'ent-org-001', targetEntityType: '组织', confidence: 0.97, properties: { 开始时间: '2024-01-01', 职责范围: '政策管理' }, evidences: [graphEvidence] },
      { id: 'rel-002', sourceEntityId: 'ent-org-001', sourceEntityType: '组织', relationType: '制定', targetEntityId: 'ent-policy-001', targetEntityType: '政策文件', confidence: 0.93, properties: { 政策范围: '异地就医备案', 证据等级: '高' }, evidences: [graphEvidence] },
      { id: 'rel-003', sourceEntityId: 'ent-policy-001', sourceEntityType: '政策文件', relationType: '支持', targetEntityId: 'ent-person-002', targetEntityType: '人物', confidence: 0.9, properties: { 流程类型: '备案与费用结算', 触发周期: '按就医场景触发' }, evidences: [graphEvidence] },
    ],
    isolatedEntities: [{ id: 'ent-person-003', name: '外部报销顾问', type: '人物', reason: '仅出现一次，缺少关系支撑', evidences: [graphEvidence] }],
    schemaSuggestions: [],
    schemaValidation: { mode: '严格校验', validEntityCount: 4, validRelationCount: 3, outOfSchemaCandidates: [{ type: '属性', value: '报销材料', action: '进入待审核' }] },
    stats: { entityCount: 4, relationCount: 3, chunkCount: 18, coveredChunkCount: 18, coverageRatio: 1 },
    failedChunks: [],
    warnings: [{ code: 'MISSING_OPTIONAL_FIELD', message: '存在“报销材料”与“结算标准”未落入实体/关系结构化抽取。', severity: 'warn' }],
  };

  const graphPartial = {
    status: 'partial_success',
    metadata: {
      fileName: file.name,
      language: 'zh-CN',
      documentMetadata: {
        document_id: file.fileId || 'doc-insurance-001',
        document_type: 'pdf',
      },
    },
    entities: [
      { id: 'ent-person-001', name: '李芳', type: '人物', properties: { 职务: '政策管理员' }, evidences: [graphEvidence] },
      { id: 'ent-org-001', name: '市医保局', type: '组织', properties: { 机构类型: '医保管理机构' }, evidences: [graphEvidence] },
      { id: 'ent-policy-001', name: '异地就医备案指引', type: '政策文件', properties: { 适用范围: '异地就医备案' }, evidences: [graphEvidence] },
    ],
    relations: [
      { id: 'rel-001', sourceEntityId: 'ent-person-001', sourceEntityType: '人物', relationType: '任职于', targetEntityId: 'ent-org-001', targetEntityType: '组织', confidence: 0.9, properties: { 开始时间: '2024-01-01' }, evidences: [graphEvidence] },
    ],
    isolatedEntities: [{ id: 'ent-person-002', name: '赵磊', type: '人物', reason: '仅出现“费用核验”段，缺少关系上下文。', evidences: [graphEvidence] }],
    schemaSuggestions: [
      { id: 'suggest-001', type: '新增关系', suggestedValue: 'POLICY_CONDITION', sample: { source: 'PolicyDocument', relation: 'POLICY_CONDITION', target: 'Organization' }, reason: '文本中存在“备案条件/材料范围”表达，可兼容新增关系类型。' },
    ],
    schemaValidation: { mode: '严格校验', validEntityCount: 3, validRelationCount: 1, outOfSchemaCandidates: [{ type: '关系', value: 'POLICY_CONDITION', action: '进入待审核' }] },
    stats: { entityCount: 3, relationCount: 1, chunkCount: 18, coveredChunkCount: 14, coverageRatio: 0.78 },
    failedChunks: [{ chunkId: 'chunk-017', reason: 'OCR 质量异常，无法稳定识别关键政策边界。', status: 'failed', retryAvailable: true }],
    warnings: [{ code: 'INCOMPLETE_DOCUMENT_COVERAGE', message: '部分文档章节未覆盖到图谱抽取，建议补充 OCR 结果后重试。', severity: 'warn', sourceChunkId: 'chunk-017' }],
  };

  const graphEmpty = {
    status: 'success',
    metadata: {
      fileName: file.name,
      language: 'zh-CN',
      documentMetadata: {
        document_id: file.fileId || 'doc-insurance-001',
        document_type: 'pdf',
      },
    },
    entities: [],
    relations: [],
    isolatedEntities: [],
    schemaSuggestions: [],
    schemaValidation: { mode: '严格校验', validEntityCount: 0, validRelationCount: 0, outOfSchemaCandidates: [] },
    stats: { entityCount: 0, relationCount: 0, chunkCount: 18, coveredChunkCount: 0, coverageRatio: 0 },
    failedChunks: [],
    warnings: [{ code: 'NO_GRAPH_FACTS_FOUND', message: '当前文档未检测到可入图实体或关系表达。', severity: 'info' }],
  };

  const graphOutputMap = {
    success: graphSuccess,
    partial_success: graphPartial,
    empty: graphEmpty,
  };
  const graphResult = graphOutputMap[graphVariant];

  const qaItems = [
    { qaId: 'qa-001', question: '哪些人员可以办理异地就医备案？', answer: '本市基本医疗保险参保人员因长期居住、转诊转院或急诊抢救需要异地就医的，可以申请备案。', sourceChunkId: 'chunk-002' },
    { qaId: 'qa-002', question: '异地就医政策适用于哪些对象？', answer: '本政策适用于本市基本医疗保险参保人员异地就医备案与费用结算。', sourceChunkId: 'chunk-001' },
  ];
  const knowledgeItems = isFundKnowledgePdf ? [
    { knowledgePointId: 'fund-kp-001', title: '基金适当性要求', content: '投资者应根据自身风险承受能力选择与产品风险等级相匹配的基金产品。', tags: ['适当性', '风险等级'], sourceChunkIds: ['fund-chunk-001'] },
    { knowledgePointId: 'fund-kp-002', title: '申购确认时间', content: '申购申请通常按交易日确认规则处理，具体确认时间以基金合同和销售机构规则为准。', tags: ['申购规则', '交易确认'], sourceChunkIds: ['fund-chunk-003'] },
    { knowledgePointId: 'fund-kp-003', title: '基金投资风险', content: '基金净值可能波动，过往业绩不代表未来表现，投资前应充分了解产品风险。', tags: ['风险提示', '投资风险'], sourceChunkIds: ['fund-chunk-002'] },
  ] : [
    { knowledgePointId: 'kp-001', title: '适用对象', content: '本政策面向本市医保参保人员。', tags: ['适用对象'], sourceChunkIds: ['chunk-001'] },
    { knowledgePointId: 'kp-002', title: '备案条件', content: '长期居住、转诊转院或急诊抢救需要异地就医时，可以申请备案。', tags: ['办理条件', '备案流程'], sourceChunkIds: ['chunk-002'] },
  ];
  const getRunPayload = (node, index) => {
    if (isFundKnowledgePdf && node.toolName === 'MinerU版面解析') return { outputPath: 'documentParseResult', outputFull: { documentParseResult: { pageCount: 26, titleCount: 38, tableCount: 6, markdownReady: true } } };
    if (node.toolName === 'Markdown结构化分块') return { outputPath: 'textChunkResult', outputFull: { textChunkResult: sliceItems, stats: { chunkCount: isFundKnowledgePdf ? 18 : sliceItems.length } } };
    if (node.toolName === 'QA提取') return { outputPath: 'qaResult', outputFull: { qaResult: qaItems, stats: { qaCount: qaItems.length } } };
    if (node.toolName === '知识点提取') return { outputPath: 'summaryResult', outputFull: { summary: isFundKnowledgePdf ? '已识别基金适当性、申购赎回、费用与风险提示等知识点。' : '该政策说明医保参保人员异地就医备案与费用结算要求。', summaryResult: knowledgeItems } };
    if (node.toolName === '实体关系抽取') return {
      outputPath: 'entity_relation_candidates',
      outputFull: {
        entity_relation_candidates: {
          entities: graphResult.entities,
          relations: graphResult.relations,
          isolatedEntities: graphResult.isolatedEntities,
          stats: graphResult.stats,
        },
      },
    };
    if (node.toolName === '单文档图谱抽取' || node.toolName === '知识图谱抽取') return { outputPath: 'graph_fragment', outputFull: { graph_fragment: graphResult } };
    if (node.toolName === '迭代执行') {
      if (formType === 'QA库') return { outputPath: 'iterationResult', outputFull: { iterationResult: qaItems.map((item) => ({ ...item, verified: true })) } };
      if (formType === '知识点') return { outputPath: 'iterationResult', outputFull: { iterationResult: knowledgeItems } };
      return { outputPath: 'iterationResult', outputFull: { iterationResult: sliceItems } };
    }
    return { outputPath: `data.step${index + 1}`, outputFull: { result: { status: 'success', count: 3 + index, sample: ['适用对象', '办理条件', '材料要求'].slice(0, Math.min(3, index + 1)) } } };
  };
  const runs = nodes.map((node, index) => {
    const payload = getRunPayload(node, index);
    return {
      toolName: node.toolName,
      category: node.category,
      outputPath: payload.outputPath,
      parameters: [{ name: index === 0 ? '样例文件' : '输入来源', value: index === 0 ? file.name : `data.step${index}` }],
      status: '成功',
      outputFull: JSON.stringify({
        version,
        target: `${categoryName || '兜底方案'} / ${getKnowledgeFormTypeLabel(formType)}`,
        node: node.toolName,
        fileName: file.name,
        ...payload.outputFull,
      }, null, 2),
    };
  });
  return { fileId: file.id, fileName: file.name, toolRuns: runs };
}

function demoChatMessages({ categoryName, formType, fileFormat, versionCount, sampleName, categoryId }) {
  const scopeName = categoryName || '空间兜底';
  const fileName = sampleName || demoFileMeta[fileFormat]?.name || '样例文件';
  const formatNames = {
    pdf: 'PDF版式文档',
    docx: 'Word结构化文档',
    xlsx: 'Excel表格文件',
    pptx: 'PPT课件文件',
    txt: '纯文本导出文件',
    md: 'Markdown文档',
  };
  const targetNames = {
    切片库: '生成稳定文本切片结果',
    QA库: '抽取标准问答结果',
    知识点: '提取并打标知识点结果',
    知识图谱: '抽取结构化知识图谱结果',
  };
  const finalNodeNames = {
    切片库: '文本切片结果',
    QA库: '问答结果',
    知识点: '知识点结果',
    知识图谱: '知识图谱结果',
  };
  const fileConcerns = {
    pdf: '需要保留页码、标题层级和跨页段落，避免把页眉页脚写入正文。',
    docx: '需要识别标题样式、列表层级和表格段落，避免目录文字干扰正文。',
    xlsx: '需要把多列字段映射为问答候选，并过滤空行、合并单元格和说明行。',
    pptx: '需要按页面抽取标题、正文和备注，避免把装饰性文字当成知识内容。',
    txt: '需要按工单边界和自然段落切分，避免把多条记录混在一个处理单元里。',
    md: '需要保留Markdown标题层级、列表和代码块边界，避免破坏原始结构。',
  };
  const baseId = `chat-${slugText(scopeName)}-${slugText(formType)}-${fileFormat}`;
  if (categoryId === 'cat-wealth-fund' && formType === '知识点' && fileFormat === 'pdf') {
    const messages = [
      { role: 'agent', title: '处理方案生成助手', content: '请发送基金产品说明书样例，我会识别文档版式与章节结构，并生成可复用的知识点处理方案。' },
      { role: 'user', title: '发送样例文件', content: `已发送${fileName}，请提取基金产品相关知识点并保留来源信息。` },
      { role: 'thought', title: '分析样例文件', content: '该文件为基金产品说明书，包含基金概况、投资范围、风险收益特征、申购赎回与费用等章节。' },
      { role: 'thought', title: '节点目录查询', content: '已匹配 MinerU 版面解析、Markdown结构化分块、知识点提取、迭代执行和知识点打标。', kind: 'toolCall' },
      { role: 'thought', title: '开始设计处理方案', content: '方案采用 MinerU版面解析 -> Markdown结构化分块 -> 知识点提取 -> 迭代执行的处理链路。' },
      { role: 'thought', title: '配置迭代执行', content: '迭代体逐条对知识点执行知识点打标。', kind: 'toolCall' },
      { role: 'thought', title: '检查节点承接', content: '已确认分块结果、知识点数组与迭代打标结果可以稳定承接。' },
      { role: 'user', title: '试跑样例', content: '请使用当前样例试跑，重点检查风险提示、申购赎回规则和适当性要求是否完整。' },
      { role: 'thought', title: '样例试跑', content: '已完成 26 页版面解析、18 个结构化分块、24 条知识点的提取与打标。', kind: 'toolCall' },
      { role: 'agent', title: '方案生成完成', content: '已完成方案搭建、参数配置和样例试跑，可保存为 1.0 正式版本。' },
    ];
    return messages.map((message, index) => ({ id: `${baseId}-${index + 1}`, status: 'done', ...message }));
  }
  const messages = [
    { role: 'agent', title: '处理方案生成助手', content: `当前配置对象为${scopeName}的${getKnowledgeFormTypeLabel(formType)} ${fileFormat}处理方案。你可以发送样例文件，我会先分析文件结构，再生成可保存的处理方案。` },
    { role: 'user', title: '发送样例文件', content: `已发送${fileName}，这类文件后续会批量进入${scopeName}，请生成可复用的${getKnowledgeFormTypeLabel(formType)}处理方案。` },
    { role: 'thought', title: '分析样例文件', content: `样例类型识别为${formatNames[fileFormat] || fileFormat}。${fileConcerns[fileFormat] || '需要先判断文件结构和正文边界。'}` },
    { role: 'thought', title: '识别处理目标', content: `目标是${targetNames[formType]}，因此方案不能只完成解析，还需要保证后续节点输出能被${finalNodeNames[formType]}稳定消费。` },
    { role: 'thought', title: '查询可用节点', content: `已按${fileFormat}文件解析、文本分片${formType === '知识图谱' ? '、单文档图谱抽取' : '、知识提取和系统节点'}进行匹配，准备生成第一版流程。`, kind: 'toolCall' },
    { role: 'agent', title: '初步方案建议', content: `我建议先建立“解析 -> 分片 -> ${formType === '切片库' ? '文本切片结果' : formType === 'QA库' ? '问答抽取' : formType === '知识图谱' ? '单文档图谱抽取' : '知识点提取 -> 知识点打标'}”的主链路。` },
    { role: 'user', title: '补充处理要求', content: `不要直接套固定流程。${fileFormat === 'xlsx' ? '表格里有些字段为空，需要先做字段标准化。' : fileFormat === 'pptx' ? '课件里有很多页标题，页面顺序要保留。' : fileFormat === 'md' ? '标题层级要保留，代码块不要拆散。' : '需要保留来源位置，后续方便追溯。'}` },
    { role: 'thought', title: '调整流程设计', content: '已根据补充要求调整解析与分片参数，后续节点可直接承接结构化结果。', kind: 'toolCall' },
    { role: 'thought', title: '配置节点参数', content: formType === '知识图谱'
      ? '已补齐关键参数：样例文件输入、图谱抽取 Schema、抽取规则与关系约束，确保可复用图谱抽取输出。'
      : `已补齐关键参数：样例文件输入、上游输出路径、分片策略、${formType === 'QA库' ? '问答抽取规则' : formType === '知识点' ? '知识点提取和打标策略' : '切片规则'}。`,
      kind: 'toolCall' },
    { role: 'thought', title: '检查节点承接', content: `已检查每个节点的输入输出承接关系，当前链路可以从${fileName}执行到${finalNodeNames[formType]}。` },
    { role: 'user', title: '试跑样例', content: `用这个样例先试跑一次，重点看是否能稳定生成${formType === '切片库' ? '文本切片结果' : formType === 'QA库' ? '问答结果' : formType === '知识图谱' ? '知识图谱结果' : '知识点和标签结果'}。` },
    { role: 'thought', title: '样例试跑', content: `已执行样例试跑：解析、分片和后置节点均执行成功，已生成${finalNodeNames[formType]}。`, kind: 'toolCall' },
    { role: 'agent', title: '方案生成完成', content: `已完成方案搭建、参数配置、链路检查和样例试跑。${versionCount > 1 ? `当前已有${versionCount}个历史版本，最新版本可继续编辑后保存为新版本。` : '当前已有1个可保存版本，后续修改会保存为新版本。'}` },
  ];
  return messages.map((message, index) => ({
    id: `${baseId}-${index + 1}`,
    status: 'done',
    ...message,
  }));
}

function ensureDemoPlanData() {
  const demoVersion = 'workbench-plan-demo-v18';
  if (read(keys.demoPlanSeedVersion, '') === demoVersion) return;

  const projects = read(keys.projects, []);
  const solutions = read(keys.projectSolutions, []);
  const categories = read(keys.projectCategories, []);
  const project = projects.find((item) => item.id === 'proj-main') || projects[0];
  if (!project) return;
  const solution = solutions.find((item) => item.projectId === project.id);
  if (!solution) return;
  const categoryById = new Map(categories.map((item) => [item.id, item]));

  const definitions = [
    { planScope: 'fallback', formType: '切片库', fileFormat: 'pdf', versions: ['1.0', '1.1'] },
    { planScope: 'fallback', formType: '切片库', fileFormat: 'docx', versions: ['1.0'] },
    { planScope: 'fallback', formType: 'QA库', fileFormat: 'pdf', versions: ['1.0', '1.1'] },
    { planScope: 'fallback', formType: 'QA库', fileFormat: 'txt', versions: ['1.0'] },
    { planScope: 'fallback', formType: '知识点', fileFormat: 'pdf', versions: ['1.0'] },
    { planScope: 'fallback', formType: '知识点', fileFormat: 'md', versions: ['1.0'] },
    { planScope: 'fallback', formType: '知识图谱', fileFormat: 'pdf', versions: ['1.0', '1.1', '1.2'] },
    { categoryId: 'cat-wealth-fund', formType: '切片库', fileFormat: 'pdf', versions: ['1.0'] },
    { categoryId: 'cat-wealth-fund', formType: '切片库', fileFormat: 'docx', versions: ['1.0'] },
    { categoryId: 'cat-wealth-fund', formType: 'QA库', fileFormat: 'pdf', versions: ['1.0', '1.1', '1.2'] },
    { categoryId: 'cat-wealth-fund', formType: 'QA库', fileFormat: 'xlsx', versions: ['1.0'] },
    { categoryId: 'cat-wealth-fund', formType: '知识点', fileFormat: 'pdf', versions: ['1.0'] },
    { categoryId: 'cat-wealth-fund', formType: '知识图谱', fileFormat: 'pdf', versions: ['1.0', '1.1', '1.2'] },
    { categoryId: 'cat-wealth-fund-risk', formType: '切片库', fileFormat: 'pdf', versions: ['1.0'] },
    { categoryId: 'cat-wealth-fund-risk', formType: 'QA库', fileFormat: 'pdf', versions: ['1.0'] },
    { categoryId: 'cat-wealth-fund-risk', formType: '知识点', fileFormat: 'md', versions: ['1.0'] },
    { categoryId: 'cat-credit-personal', formType: '切片库', fileFormat: 'pdf', versions: ['1.0'] },
    { categoryId: 'cat-credit-personal', formType: '切片库', fileFormat: 'docx', versions: ['1.0'] },
    { categoryId: 'cat-credit-personal', formType: 'QA库', fileFormat: 'pdf', versions: ['1.0'] },
    { categoryId: 'cat-credit-personal', formType: '知识点', fileFormat: 'txt', versions: ['1.0'] },
    { categoryId: 'cat-open-account', formType: '切片库', fileFormat: 'pdf', versions: ['1.8', '1.9', '2.0'] },
    { categoryId: 'cat-open-account', formType: '切片库', fileFormat: 'pptx', versions: ['1.0'] },
    { categoryId: 'cat-open-account', formType: 'QA库', fileFormat: 'docx', versions: ['1.0'] },
    { categoryId: 'cat-open-account', formType: '知识点', fileFormat: 'md', versions: ['1.0'] },
    { categoryId: 'cat-complaint', formType: 'QA库', fileFormat: 'pdf', versions: ['1.0'] },
    { categoryId: 'cat-complaint', formType: 'QA库', fileFormat: 'txt', versions: ['1.0'] },
    { categoryId: 'cat-complaint', formType: '知识点', fileFormat: 'pdf', versions: ['1.0'] },
    { categoryId: 'cat-copy-review', formType: '切片库', fileFormat: 'docx', versions: ['1.0'] },
    { categoryId: 'cat-copy-review', formType: 'QA库', fileFormat: 'md', versions: ['1.0'] },
    { categoryId: 'cat-copy-review', formType: '知识点', fileFormat: 'pdf', versions: ['1.0'] },
    { categoryId: 'cat-copy-review', formType: '知识点', fileFormat: 'docx', versions: ['1.0'] },
  ]
    .filter((item) => !(item.formType === '知识点' && item.fileFormat === 'pdf' && item.categoryId !== 'cat-wealth-fund'))
    .map((item) => ({ planScope: item.planScope || 'category', creationMode: 'agent', ...item }));

  const routeKeys = new Set(definitions.map((item) => `${item.planScope}|${item.categoryId || ''}|${item.formType}|${item.fileFormat}`));
  const currentPlans = read(keys.plans, []);
  const retainedPlans = currentPlans.filter((plan) => !routeKeys.has(`${plan.planScope}|${plan.categoryId || ''}|${plan.formType}|${plan.fileFormat}`) && !String(plan.id).startsWith('demo-plan-'));
  const retainedPlanIds = new Set(retainedPlans.map((plan) => plan.id));
  const plans = [...retainedPlans];
  const versions = read(keys.planVersions, []).filter((item) => retainedPlanIds.has(item.planId));
  const executions = read(keys.planExecutions, []).filter((item) => retainedPlanIds.has(item.planId));
  const chats = read(keys.planChats, []).filter((item) => retainedPlanIds.has(item.planId));
  const planIssues = read(keys.planIssues, []).filter((item) => !String(item.id).startsWith('demo-plan-issue-'));

  definitions.forEach((definition) => {
    const category = definition.categoryId ? categoryById.get(definition.categoryId) : null;
    if (definition.planScope === 'category' && !category) return;
    const categoryName = category?.name || '';
    const plan = {
      id: demoPlanId(definition),
      projectId: project.id,
      solutionId: solution.id,
      planScope: definition.planScope,
      categoryId: definition.planScope === 'category' ? definition.categoryId : null,
      formType: definition.formType,
      fileFormat: definition.fileFormat,
      status: 'active',
      name: `${categoryName || project.name}${getKnowledgeFormTypeLabel(definition.formType)}${definition.fileFormat}处理方案`,
      createdAt: '2026-07-01 09:00',
      updatedAt: '2026-07-09 09:30',
    };
    const nodes = demoNodeSets(definition.formType, definition.fileFormat, definition.categoryId);
    const sample = demoSampleFile(definition.fileFormat, definition.categoryId === 'cat-wealth-fund' && definition.formType === '知识点' && definition.fileFormat === 'pdf' ? '基金产品说明书.pdf' : undefined);
    plans.push(plan);
    const issueTemplates = definition.formType === '切片库'
      ? [
        ['上下文完整性', '部分切片缺少章节标题，阅读时无法判断原文所属段落。', 'unresolved'],
        ['表格内容保留', '表格中的条件与说明被拆分到不同切片，建议保留同一行内容。', 'unresolved'],
        ['切片粒度', '过短的标题切片已与后续正文合并。', 'resolved'],
      ]
      : definition.formType === 'QA库'
        ? [
          ['答案约束', '部分问答答案未保留办理条件和例外说明。', 'unresolved'],
          ['问题表达', '部分问题表达与用户常见提问方式不一致。', 'unresolved'],
          ['来源引用', '已补充问答结果中的原文来源定位。', 'resolved'],
        ]
        : definition.formType === '知识图谱'
          ? [
            ['覆盖完整性', '文档部分章节抽取后图谱关系覆盖率不足。', 'unresolved'],
            ['关系粒度', '关系类型与标准 Schema 对齐建议加强边类型治理。', 'unresolved'],
            ['实体补全', '孤立实体建议返回到 Schema 建议流程复核。', 'resolved'],
          ]
        : [
          ['适用对象', '部分知识点未保留适用对象与适用范围。', 'unresolved'],
          ['内容去重', '相近知识点在结果中重复出现，需要合并。', 'unresolved'],
          ['标签完整性', '已补充知识点的主题标签。', 'resolved'],
        ];
    issueTemplates.forEach(([title, content, status], issueIndex) => {
      planIssues.push({
        id: `demo-plan-issue-${plan.id}-${issueIndex + 1}`,
        planId: plan.id,
        title,
        content,
        status,
        createdAt: `2026-07-0${issueIndex + 3} 11:00`,
        resolvedAt: status === 'resolved' ? `2026-07-0${issueIndex + 4} 16:20` : null,
      });
    });
    const seedExecution = ({ version, versionNodes, result, index, versionStatus }) => {
      const isDraft = versionStatus === 'draft';
      const runDay = Math.min(index + (isDraft ? 1 : 2), 9);
      const runTime = isDraft ? '09:30:00' : '15:30:00';
      const compactRunTime = isDraft ? '093000' : '153000';
      const statusSlug = isDraft ? 'draft' : 'formal';
      executions.push({
        id: `demo-exec-${plan.id}-${version.replace('.', '-')}-${statusSlug}-${sample.id}`,
        runId: `demo-run-${plan.id}-${version.replace('.', '-')}-${statusSlug}-${sample.id}`,
        runLabel: `${version}${isDraft ? '草稿' : ''}-2026070${runDay}${compactRunTime}`,
        runAt: `2026-07-0${runDay} ${runTime}`,
        versionStatus,
        planId: plan.id,
        planVersionId: isDraft ? null : `demo-version-${plan.id}-${version.replace('.', '-')}`,
        version,
        sampleFileId: sample.id,
        sampleFileName: sample.name,
        sampleFile: sample,
        fileFormat: definition.fileFormat,
        planSnapshot: versionNodes,
        planNodes: versionNodes,
        result,
        status: 'completed',
        createdAt: `2026-07-0${runDay} ${runTime}`,
      });
    };
    definition.versions.forEach((version, index) => {
      const versionNodes = nodes.map((node) => ({ ...node }));
      const result = demoResult(sample, versionNodes, definition.formType, categoryName, version, definition.categoryId);
      versions.push({
        id: `demo-version-${plan.id}-${version.replace('.', '-')}`,
        planId: plan.id,
        version,
        nodes: versionNodes,
        sampleFiles: [sample],
        results: [result],
        createdAt: `2026-07-0${Math.min(index + 1, 9)} 10:00`,
      });
      if (definition.creationMode === 'agent' && index === 0) {
        seedExecution({ version, versionNodes, result, index, versionStatus: 'draft' });
      }
      if (definition.versions.length > 1 && index === definition.versions.length - 1) {
        seedExecution({ version, versionNodes, result, index, versionStatus: 'formal' });
      }
    });
    chats.push({
      id: `demo-chat-${plan.id}`,
      planId: plan.id,
      messages: demoChatMessages({ categoryName, formType: definition.formType, fileFormat: definition.fileFormat, versionCount: definition.versions.length, sampleName: sample.name, categoryId: definition.categoryId }),
      createdAt: '2026-07-01 09:15',
      updatedAt: '2026-07-09 09:30',
    });
  });

  write(keys.plans, plans);
  write(keys.planVersions, versions);
  write(keys.planExecutions, executions);
  write(keys.planChats, chats);
  write(keys.planIssues, planIssues);
  write(keys.demoPlanSeedVersion, demoVersion);
}

function ensureSeeded() {
  const existingProjects = read(keys.projects, null);
  if (existingProjects) {
    const previousSeedIds = new Set(['proj-finance', 'proj-risk', 'proj-medical', 'proj-insurance']);
    const isPreviousSeed = existingProjects.length <= 4 && existingProjects.every((project) => previousSeedIds.has(project.id));
    const hasOnlineSample = existingProjects.some((project) => project.name === '未末银行');
    const hasPreviousMigrationSample = existingProjects.some((project) => ['金融客服知识库项目', 'HR招聘助手'].includes(project.name));
    if (hasOnlineSample || (!isPreviousSeed && !hasPreviousMigrationSample)) return;
  }
  Object.entries(seed).forEach(([name, value]) => write(keys[name], value));
}

ensureSeeded();
ensureProjectCategories();
normalizeProjectCategories();
normalizeCategoryPlans();
migrateLegacyCategoryPlans();
ensureDemoPlanData();

export const knowledgeFormTypes = formTypes;

export const dataStore = {
  list(name) {
    return read(keys[name], []);
  },
  save(name, value) {
    write(keys[name], value);
  },
  getIndustries() { return this.list('industries'); },
  getDomains() { return this.list('domains'); },
  getScenarios() { return this.list('scenarios'); },
  getRelationships() { return this.list('relationships'); },
  getTemplates() { return this.list('templates'); },
  getProjects() { return this.list('projects'); },
  getCategoryPlans(solutionId) {
    const versionPlanIds = new Set(this.list('planVersions').map((item) => item.planId));
    const plans = this.list('plans').filter((item) => versionPlanIds.has(item.id));
    return solutionId ? plans.filter((item) => item.solutionId === solutionId) : plans;
  },
  getRelationship(relationshipId) {
    return this.getRelationships().find((item) => item.id === relationshipId) || null;
  },
  getTemplate(templateId) {
    return this.getTemplates().find((item) => item.id === templateId) || null;
  },
  getAvailableRelationships() {
    return this.getRelationships().filter((item) => item.enabled).map((item) => ({
      ...item,
      industry: this.getIndustries().find((row) => row.id === item.industryId),
      domain: this.getDomains().find((row) => row.id === item.domainId),
      scenario: this.getScenarios().find((row) => row.id === item.scenarioId),
    }));
  },
  getAvailableTemplates() {
    return this.getTemplates().filter((item) => {
      if (!item.enabled) return false;
      if (!item.relationshipId) return true;
      return this.getAvailableRelationships().some((relationship) => relationship.id === item.relationshipId);
    });
  },
  relationshipText(relationshipId) {
    const rel = this.getAvailableRelationships().find((item) => item.id === relationshipId)
      || this.getRelationships().map((item) => ({
        ...item,
        industry: this.getIndustries().find((row) => row.id === item.industryId),
        domain: this.getDomains().find((row) => row.id === item.domainId),
        scenario: this.getScenarios().find((row) => row.id === item.scenarioId),
      })).find((item) => item.id === relationshipId);
    return rel ? `${rel.industry?.name || '-'} / ${rel.domain?.name || '-'} / ${rel.scenario?.name || '-'}` : '-';
  },
  templateText(templateId) {
    return this.getTemplates().find((item) => item.id === templateId)?.name || '-';
  },
  getProject(projectId) {
    return this.getProjects().find((item) => item.id === projectId) || null;
  },
  isProjectNameExists(name, excludeId) {
    return this.getProjects().some((item) => item.name === name && item.id !== excludeId);
  },
  addProject(payload) {
    const next = { id: id('proj'), enabled: true, hasContent: false, hasSolution: false, createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '), ...payload };
    this.save('projects', [next, ...this.getProjects()]);
    return next;
  },
  updateProject(projectId, patch) {
    const next = this.getProjects().map((item) => (item.id === projectId ? { ...item, ...patch } : item));
    this.save('projects', next);
    return next.find((item) => item.id === projectId);
  },
  deleteProject(projectId) {
    this.save('projects', this.getProjects().filter((item) => item.id !== projectId));
    const solution = this.getProjectSolution(projectId);
    if (solution) {
      this.save('projectSolutions', this.list('projectSolutions').filter((item) => item.projectId !== projectId));
      this.save('projectCategories', this.list('projectCategories').filter((item) => item.solutionId !== solution.id));
    }
  },
  getProjectSolution(projectId) {
    return this.list('projectSolutions').find((item) => item.projectId === projectId) || null;
  },
  initializeProjectSolution(projectId, templateId) {
    const project = this.getProject(projectId);
    const effectiveTemplateId = templateId ?? project?.templateId ?? '';
    const existing = this.getProjectSolution(projectId);
    if (existing) return existing;
    const solution = { id: id('sol'), projectId, status: 'draft', enabled: false, templateId: effectiveTemplateId, createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '), updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' ') };
    this.save('projectSolutions', [solution, ...this.list('projectSolutions')]);
    const baseCategories = [
      { name: '产品知识', parentName: null, level: 1, formTypes: [] },
      { name: '理财产品', parentName: '产品知识', level: 2, formTypes },
      { name: '信用卡产品', parentName: '产品知识', level: 2, formTypes },
      { name: '业务流程', parentName: null, level: 1, formTypes: [] },
      { name: '开户流程', parentName: '业务流程', level: 2, formTypes },
    ];
    const idMap = new Map();
    const categories = baseCategories.map((item) => {
      const rowId = id('cat');
      idMap.set(item.name, rowId);
      return { id: rowId, solutionId: solution.id, parentId: item.parentName ? idMap.get(item.parentName) : null, name: item.name, level: item.level, formTypes: item.formTypes, hasContent: false };
    });
    this.save('projectCategories', [...categories, ...this.list('projectCategories')]);
    this.updateProject(projectId, { hasSolution: true, templateId: effectiveTemplateId });
    return solution;
  },
  updateProjectSolution(solutionId, patch) {
    this.save('projectSolutions', this.list('projectSolutions').map((item) => (item.id === solutionId ? { ...item, ...patch, updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' ') } : item)));
  },
  getProjectCategories(solutionId) {
    return this.list('projectCategories').filter((item) => item.solutionId === solutionId);
  },
  getPlanByRoute(route) {
    const planScope = route.planScope || (route.categoryId ? 'category' : 'fallback');
    const categoryId = planScope === 'category' ? route.categoryId : null;
    return this.list('plans').find((item) => (
      item.projectId === route.projectId
      && item.planScope === planScope
      && (item.categoryId || null) === categoryId
      && item.formType === route.formType
      && item.fileFormat === route.fileFormat
    )) || null;
  },
  ensurePlan(route) {
    const existing = this.getPlanByRoute(route);
    if (existing) return existing;
    const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
    const planScope = route.planScope || (route.categoryId ? 'category' : 'fallback');
    const next = {
      id: id('plan'),
      projectId: route.projectId,
      solutionId: route.solutionId,
      planScope,
      categoryId: planScope === 'category' ? route.categoryId : null,
      formType: route.formType,
      fileFormat: route.fileFormat,
      status: 'active',
      name: route.name,
      createdAt: now,
      updatedAt: now,
    };
    this.save('plans', [...this.list('plans'), next]);
    return next;
  },
  getPlanVersions(planId) {
    return this.list('planVersions').filter((item) => item.planId === planId);
  },
  getPlanVersion(planId, version) {
    return this.getPlanVersions(planId).find((item) => item.version === version) || null;
  },
  createPlanVersion(payload) {
    const existing = this.getPlanVersion(payload.planId, payload.version);
    if (existing) return existing;
    const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
    const next = {
      id: id('plan-version'),
      createdAt: now,
      ...payload,
    };
    this.save('planVersions', [...this.list('planVersions'), next]);
    this.save('plans', this.list('plans').map((item) => (item.id === payload.planId ? { ...item, updatedAt: now } : item)));
    return next;
  },
  getPlanWithVersionsByRoute(route) {
    const plan = this.getPlanByRoute(route);
    if (!plan) return { plan: null, versions: [] };
    return { plan, versions: this.getPlanVersions(plan.id) };
  },
  discardUnsavedPlan(planId) {
    if (!planId || this.getPlanVersions(planId).length) return false;
    this.save('plans', this.list('plans').filter((item) => item.id !== planId));
    this.save('planExecutions', this.list('planExecutions').filter((item) => item.planId !== planId));
    this.save('planChats', this.list('planChats').filter((item) => item.planId !== planId));
    this.save('planIssues', this.list('planIssues').filter((item) => item.planId !== planId));
    return true;
  },
  getPlanIssues(planId) {
    return this.list('planIssues').filter((item) => item.planId === planId);
  },
  savePlanIssues(planId, issues) {
    if (!planId) return [];
    const current = this.list('planIssues').filter((item) => item.planId !== planId);
    const next = issues.map((item) => ({ ...item, planId }));
    this.save('planIssues', [...current, ...next]);
    return next;
  },
  getPlanExecutions(planId) {
    return this.list('planExecutions').filter((item) => item.planId === planId);
  },
  createPlanExecution(payload) {
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const next = { id: id('plan-exec'), status: 'completed', createdAt: now, ...payload };
    this.save('planExecutions', [...this.list('planExecutions'), next]);
    return next;
  },
  getPlanChat(planId) {
    return this.list('planChats').find((item) => item.planId === planId)?.messages || null;
  },
  savePlanChat(planId, messages) {
    if (!planId) return null;
    const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
    const chats = this.list('planChats');
    const existing = chats.find((item) => item.planId === planId);
    const next = existing ? { ...existing, messages, updatedAt: now } : { id: id('plan-chat'), planId, messages, createdAt: now, updatedAt: now };
    this.save('planChats', existing ? chats.map((item) => (item.id === existing.id ? next : item)) : [...chats, next]);
    return next;
  },
  getCategoryPlan(categoryId, formType, fileFormat) {
    const plan = this.list('plans').find((item) => (
      item.categoryId === categoryId
      && item.formType === formType
      && (fileFormat ? item.fileFormat === fileFormat : true)
    ));
    if (!plan) return null;
    const versions = this.getPlanVersions(plan.id);
    return { ...plan, versions, nodes: getLatestVersion(versions)?.nodes || [] };
  },
  upsertCategoryPlan(payload) {
    const plan = this.ensurePlan({
      projectId: payload.projectId,
      solutionId: payload.solutionId,
      planScope: payload.planScope || 'category',
      categoryId: payload.categoryId,
      formType: payload.formType,
      fileFormat: payload.fileFormat || 'pdf',
      name: payload.name,
    });
    return this.createPlanVersion({
      planId: plan.id,
      version: payload.version || '1.0',
      nodes: payload.nodes || [],
      sampleFiles: payload.sampleFiles || [],
      results: payload.results || [],
    });
  },
  getFormalPlanReferencesByToolId(toolId) {
    const projects = this.getProjects();
    const solutions = this.list('projectSolutions');
    const categories = this.list('projectCategories');
    const versions = this.list('planVersions');
    const activePlans = this.list('plans').filter((plan) => {
      const latestVersion = getLatestVersion(versions.filter((item) => item.planId === plan.id));
      return plan.status === 'active' && latestVersion?.nodes?.some((node) => node.toolId === toolId);
    });
    const spaces = new Map();
    const references = activePlans.map((plan) => {
      const project = projects.find((item) => item.id === plan.projectId);
      const solution = solutions.find((item) => item.id === plan.solutionId);
      const category = categories.find((item) => item.id === plan.categoryId);
      const latestVersion = getLatestVersion(versions.filter((item) => item.planId === plan.id));
      if (project) spaces.set(project.id, project);
      return { ...plan, nodes: latestVersion?.nodes || [], version: latestVersion?.version, project, solution, category };
    });
    return {
      spaceCount: spaces.size,
      spaces: Array.from(spaces.values()),
      plans: references,
    };
  },
  isProjectCategoryNameExists(solutionId, parentId, name, excludeId) {
    return this.getProjectCategories(solutionId).some((item) => item.parentId === parentId && item.name === name && item.id !== excludeId);
  },
  addProjectCategory(solutionId, payload) {
    const next = { id: id('cat'), solutionId, hasContent: false, ...payload };
    this.save('projectCategories', [...this.list('projectCategories'), next]);
    return next;
  },
  updateProjectCategory(categoryId, patch) {
    this.save('projectCategories', this.list('projectCategories').map((item) => (item.id === categoryId ? { ...item, ...patch } : item)));
  },
  deleteProjectCategory(categoryId) {
    const all = this.list('projectCategories');
    const children = new Set();
    const walk = (parentId) => {
      all.filter((item) => item.parentId === parentId).forEach((item) => {
        children.add(item.id);
        walk(item.id);
      });
    };
    walk(categoryId);
    this.save('projectCategories', all.filter((item) => item.id !== categoryId && !children.has(item.id)));
  },
};
