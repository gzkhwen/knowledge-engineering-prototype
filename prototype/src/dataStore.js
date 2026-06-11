const keys = {
  industries: 'ke-industries',
  domains: 'ke-domains',
  scenarios: 'ke-scenarios',
  relationships: 'ke-relationships',
  templates: 'ke-templates',
  projects: 'ke-projects',
  projectSolutions: 'ke-project-solutions',
  projectCategories: 'ke-project-categories',
};

const formTypes = ['问答库', '术语库', '非结构化切片', '二维表', '分类树', '决策表', 'SOP', '知识图谱'];

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
    { id: 'proj-finance', name: '未末银行', description: '无', relationshipId: 'rel-bank-marketing-qa', templateId: 'tpl-bank-marketing', vectorModel: 'maip2.0_pa-multilingual-e5-large', completion: '0/1', projectStatus: '已完成', enabled: true, hasContent: true, hasSolution: true, createdAt: '2026-06-02 10:20' },
    { id: 'proj-risk', name: '重庆银行', description: '测试', relationshipId: 'rel-insurance-training-qa', templateId: '', vectorModel: 'maip2.0_pa-multilingual-e5-large', completion: '0/2', projectStatus: '草稿', enabled: true, hasContent: false, hasSolution: true, createdAt: '2026-06-02 10:20' },
    { id: 'proj-test', name: 'test', description: '-', relationshipId: 'rel-insurance-training-qa', templateId: 'tpl-general', vectorModel: 'maip_bge-m3-v1', completion: '1/2', projectStatus: '已完成', enabled: true, hasContent: true, hasSolution: true, createdAt: '2026-05-29 10:20' },
    { id: 'proj-529-full', name: '529集合集合', description: '1', relationshipId: 'rel-test-one-one', templateId: 'tpl-general', vectorModel: 'maip_embedding-peg', completion: '2/2', projectStatus: '已完成', enabled: true, hasContent: true, hasSolution: true, createdAt: '2026-05-29 10:20' },
    { id: 'proj-529', name: '529集合', description: '529last day', relationshipId: 'rel-test-one-one', templateId: 'tpl-general', vectorModel: 'maip_embedding-peg', completion: '1/1', projectStatus: '已完成', enabled: true, hasContent: true, hasSolution: true, createdAt: '2026-05-29 10:20' },
    { id: 'proj-mixue', name: '蜜雪冰城', description: '-', relationshipId: 'rel-food-milk-brand', templateId: 'tpl-mixue', vectorModel: 'maip_qwen3-embedding-0.6b', completion: '1/2', projectStatus: '已完成', enabled: true, hasContent: true, hasSolution: true, createdAt: '2026-05-29 10:20' },
    { id: 'proj-script', name: '<script>alert(1)</script>', description: '<script>alert(1)</script>', relationshipId: 'rel-test-one-one', templateId: '', vectorModel: 'maip_bge-m3-v1', completion: '0/1', projectStatus: '草稿', enabled: true, hasContent: false, hasSolution: true, createdAt: '2026-05-29 10:20' },
  ],
  projectSolutions: [
    { id: 'sol-finance', projectId: 'proj-finance', status: 'active', enabled: true, templateId: 'tpl-bank-marketing', createdAt: '2026-06-02 10:22', updatedAt: '2026-06-02 17:11' },
    { id: 'sol-risk', projectId: 'proj-risk', status: 'draft', enabled: true, templateId: '', createdAt: '2026-06-02 10:22', updatedAt: '2026-06-02 17:11' },
    { id: 'sol-test', projectId: 'proj-test', status: 'active', enabled: true, templateId: 'tpl-general', createdAt: '2026-05-29 10:22', updatedAt: '2026-05-29 17:11' },
    { id: 'sol-529-full', projectId: 'proj-529-full', status: 'active', enabled: true, templateId: 'tpl-general', createdAt: '2026-05-29 10:22', updatedAt: '2026-05-29 17:11' },
    { id: 'sol-529', projectId: 'proj-529', status: 'active', enabled: true, templateId: 'tpl-general', createdAt: '2026-05-29 10:22', updatedAt: '2026-05-29 17:11' },
    { id: 'sol-mixue', projectId: 'proj-mixue', status: 'active', enabled: true, templateId: 'tpl-mixue', createdAt: '2026-05-29 10:22', updatedAt: '2026-05-29 17:11' },
    { id: 'sol-script', projectId: 'proj-script', status: 'draft', enabled: true, templateId: '', createdAt: '2026-05-29 10:22', updatedAt: '2026-05-29 17:11' },
  ],
  projectCategories: [
    { id: 'cat-product', solutionId: 'sol-finance', parentId: null, name: '产品知识', level: 1, formTypes: [], hasContent: false },
    { id: 'cat-finance-product', solutionId: 'sol-finance', parentId: 'cat-product', name: '理财产品', level: 2, formTypes: ['问答库', '非结构化切片'], hasContent: true },
    { id: 'cat-card-product', solutionId: 'sol-finance', parentId: 'cat-product', name: '信用卡产品', level: 2, formTypes: ['问答库'], hasContent: false },
    { id: 'cat-process', solutionId: 'sol-finance', parentId: null, name: '业务流程', level: 1, formTypes: [], hasContent: false },
    { id: 'cat-open-account', solutionId: 'sol-finance', parentId: 'cat-process', name: '开户流程', level: 2, formTypes: ['SOP', '问答库'], hasContent: false },
    { id: 'cat-risk-rule', solutionId: 'sol-risk', parentId: null, name: '风控规则', level: 1, formTypes: ['决策表', '非结构化切片'], hasContent: false },
  ],
};

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
      { name: '理财产品', parentName: '产品知识', level: 2, formTypes: ['问答库', '非结构化切片'] },
      { name: '信用卡产品', parentName: '产品知识', level: 2, formTypes: ['问答库'] },
      { name: '业务流程', parentName: null, level: 1, formTypes: [] },
      { name: '开户流程', parentName: '业务流程', level: 2, formTypes: ['SOP', '问答库'] },
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
