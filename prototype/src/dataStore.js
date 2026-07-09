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
