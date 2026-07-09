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
  demoPlanSeedVersion: 'ke-demo-plan-seed-version',
};

const formTypes = ['切片库', 'QA库', '知识点'];
const legacyFormTypeMap = {
  非结构化切片: '切片库',
  问答库: 'QA库',
};

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
      name: '理财产品QA库处理方案',
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

function demoNodeSets(formType, fileFormat) {
  const parserName = fileFormat === 'xlsx' ? '表格解析' : fileFormat === 'pptx' ? '页面解析' : fileFormat === 'txt' || fileFormat === 'md' ? '纯文本解析' : '文件解析';
  const parser = { toolId: 'medical-policy-parser', toolName: parserName, category: '文档解析' };
  const adapter = fileFormat === 'pdf' || fileFormat === 'docx' ? [{ toolId: 'system-code', toolName: '代码执行器', category: '系统节点' }] : [];
  const splitter = { toolId: 'medical-policy-splitter', toolName: fileFormat === 'md' ? 'Markdown结构化分块' : '文本分片', category: '文本分片' };
  const storage = { toolId: 'system-storage', toolName: '数据存储器', category: '系统节点' };
  if (formType === '切片库') return [parser, ...adapter, splitter, storage];
  if (formType === 'QA库') return [parser, ...adapter, splitter, { toolId: 'qa-extractor', toolName: 'QA提取', category: '知识提取' }, storage];
  return [parser, ...adapter, splitter, { toolId: 'summary', toolName: '知识点提取', category: '知识提取' }, { toolId: 'knowledge-tagging', toolName: '知识点打标', category: '知识提取' }, storage];
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

function demoResult(file, nodes, formType, categoryName, version) {
  const runs = nodes.map((node, index) => ({
    toolName: node.toolName,
    category: node.category,
    outputPath: index === nodes.length - 1 ? 'data.storageRef' : `data.step${index + 1}`,
    parameters: [{ name: index === 0 ? '样例文件' : '输入来源', value: index === 0 ? file.name : `data.step${index}` }],
    status: '成功',
    outputFull: JSON.stringify({
      version,
      target: `${categoryName || '兜底方案'} / ${formType}`,
      node: node.toolName,
      fileName: file.name,
      result: index === nodes.length - 1
        ? { storageRef: `es://knowledge-demo/${slugText(categoryName || 'fallback')}/${slugText(formType)}/${file.type.toLowerCase()}`, storedCount: formType === 'QA库' ? 18 : formType === '知识点' ? 24 : 42 }
        : { status: 'success', count: 3 + index, sample: ['适用对象', '办理条件', '材料要求'].slice(0, Math.min(3, index + 1)) },
    }, null, 2),
  }));
  return { fileId: file.id, fileName: file.name, toolRuns: runs };
}

function demoChatMessages({ categoryName, formType, fileFormat, versionCount }) {
  const scopeName = categoryName || '空间兜底';
  return [
    { id: `chat-${slugText(scopeName)}-${slugText(formType)}-${fileFormat}-1`, role: 'agent', title: '处理方案生成助手', content: `当前配置对象为${scopeName}的${formType} ${fileFormat}处理方案。`, status: 'done' },
    { id: `chat-${slugText(scopeName)}-${slugText(formType)}-${fileFormat}-2`, role: 'user', title: '发送样例文件', content: `已发送${demoFileMeta[fileFormat]?.name || '样例文件'}，请生成可复用处理方案。`, status: 'done' },
    { id: `chat-${slugText(scopeName)}-${slugText(formType)}-${fileFormat}-3`, role: 'thought', title: '分析样例结构', content: `已识别${fileFormat}文件结构，按${formType}目标选择解析、加工和存储节点。`, status: 'done' },
    { id: `chat-${slugText(scopeName)}-${slugText(formType)}-${fileFormat}-4`, role: 'agent', title: '方案已生成', content: `已生成${versionCount > 1 ? `${versionCount}个历史版本，最新版本可直接试跑。` : '1个可保存版本，并完成样例试跑。'}`, status: 'done' },
  ];
}

function ensureDemoPlanData() {
  const demoVersion = 'workbench-plan-demo-v1';
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
    { categoryId: 'cat-wealth-fund', formType: '切片库', fileFormat: 'pdf', versions: ['1.0'] },
    { categoryId: 'cat-wealth-fund', formType: '切片库', fileFormat: 'docx', versions: ['1.0'] },
    { categoryId: 'cat-wealth-fund', formType: 'QA库', fileFormat: 'pdf', versions: ['1.0', '1.1', '1.2'] },
    { categoryId: 'cat-wealth-fund', formType: 'QA库', fileFormat: 'xlsx', versions: ['1.0'] },
    { categoryId: 'cat-wealth-fund', formType: '知识点', fileFormat: 'pdf', versions: ['1.0'] },
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
  ].map((item) => ({ planScope: item.planScope || 'category', ...item }));

  const routeKeys = new Set(definitions.map((item) => `${item.planScope}|${item.categoryId || ''}|${item.formType}|${item.fileFormat}`));
  const currentPlans = read(keys.plans, []);
  const retainedPlans = currentPlans.filter((plan) => !routeKeys.has(`${plan.planScope}|${plan.categoryId || ''}|${plan.formType}|${plan.fileFormat}`) && !String(plan.id).startsWith('demo-plan-'));
  const retainedPlanIds = new Set(retainedPlans.map((plan) => plan.id));
  const plans = [...retainedPlans];
  const versions = read(keys.planVersions, []).filter((item) => retainedPlanIds.has(item.planId));
  const executions = read(keys.planExecutions, []).filter((item) => retainedPlanIds.has(item.planId));
  const chats = read(keys.planChats, []).filter((item) => retainedPlanIds.has(item.planId));

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
      name: `${categoryName || project.name}${definition.formType}${definition.fileFormat}处理方案`,
      createdAt: '2026-07-01 09:00',
      updatedAt: '2026-07-09 09:30',
    };
    const nodes = demoNodeSets(definition.formType, definition.fileFormat);
    const sample = demoSampleFile(definition.fileFormat);
    plans.push(plan);
    definition.versions.forEach((version, index) => {
      const versionNodes = index === 0 && definition.versions.length > 1 ? nodes.slice(0, Math.max(2, nodes.length - 1)) : nodes;
      const result = demoResult(sample, versionNodes, definition.formType, categoryName, version);
      versions.push({
        id: `demo-version-${plan.id}-${version.replace('.', '-')}`,
        planId: plan.id,
        version,
        nodes: versionNodes,
        sampleFiles: [sample],
        results: [result],
        createdAt: `2026-07-0${Math.min(index + 1, 9)} 10:00`,
      });
      if (index === definition.versions.length - 1 || index === 0) {
        executions.push({
          id: `demo-exec-${plan.id}-${version.replace('.', '-')}-${sample.id}`,
          planId: plan.id,
          planVersionId: `demo-version-${plan.id}-${version.replace('.', '-')}`,
          version,
          sampleFileId: sample.id,
          sampleFileName: sample.name,
          sampleFile: sample,
          fileFormat: definition.fileFormat,
          planNodes: versionNodes,
          result,
          status: 'completed',
          createdAt: `2026-07-0${Math.min(index + 2, 9)} 15:30`,
        });
      }
    });
    chats.push({
      id: `demo-chat-${plan.id}`,
      planId: plan.id,
      messages: demoChatMessages({ categoryName, formType: definition.formType, fileFormat: definition.fileFormat, versionCount: definition.versions.length }),
      createdAt: '2026-07-01 09:15',
      updatedAt: '2026-07-09 09:30',
    });
  });

  write(keys.plans, plans);
  write(keys.planVersions, versions);
  write(keys.planExecutions, executions);
  write(keys.planChats, chats);
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
  getPlanExecutions(planId) {
    return this.list('planExecutions').filter((item) => item.planId === planId);
  },
  createPlanExecution(payload) {
    const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
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
