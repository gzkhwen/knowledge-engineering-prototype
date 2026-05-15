import { Industry, Domain, Scenario, Relationship, Template, KnowledgeCategory, KnowledgeFormType, Project, ProjectSolution, ProjectCategory, RawMaterial, UploadStatus, KnowledgePackage, AcceptanceResult, FeedbackRecord, AcceptanceStatus, KnowledgeCategoryWithCount, KnowledgeObject } from "../types";

class DataStore {
  private industries: Industry[] = [];
  private domains: Domain[] = [];
  private scenarios: Scenario[] = [];
  private relationships: Relationship[] = [];
  private templates: Template[] = [];
  private knowledgeCategories: KnowledgeCategory[] = [];
  private projects: Project[] = [];
  private projectSolutions: ProjectSolution[] = [];
  private projectCategories: ProjectCategory[] = [];
  private rawMaterials: RawMaterial[] = [];
  private knowledgePackages: KnowledgePackage[] = [];
  private acceptanceResults: AcceptanceResult[] = [];
  private feedbackRecords: FeedbackRecord[] = [];

  constructor() {
    this.loadFromStorage();
    if (this.industries.length === 0) {
      this.initializeSampleData();
    }
  }

  private loadFromStorage() {
    const industriesData = localStorage.getItem("industries");
    const domainsData = localStorage.getItem("domains");
    const scenariosData = localStorage.getItem("scenarios");
    const relationshipsData = localStorage.getItem("relationships");
    const templatesData = localStorage.getItem("templates");
    const knowledgeCategoriesData = localStorage.getItem("knowledgeCategories");
    const projectsData = localStorage.getItem("projects");
    const projectSolutionsData = localStorage.getItem("projectSolutions");
    const projectCategoriesData = localStorage.getItem("projectCategories");
    const rawMaterialsData = localStorage.getItem("rawMaterials");
    const knowledgePackagesData = localStorage.getItem("knowledgePackages");
    const acceptanceResultsData = localStorage.getItem("acceptanceResults");
    const feedbackRecordsData = localStorage.getItem("feedbackRecords");

    if (industriesData) this.industries = JSON.parse(industriesData);
    if (domainsData) this.domains = JSON.parse(domainsData);
    if (scenariosData) this.scenarios = JSON.parse(scenariosData);
    if (relationshipsData) this.relationships = JSON.parse(relationshipsData);
    if (templatesData) this.templates = JSON.parse(templatesData);
    if (knowledgeCategoriesData) this.knowledgeCategories = JSON.parse(knowledgeCategoriesData);
    if (projectsData) this.projects = JSON.parse(projectsData);
    if (projectSolutionsData) this.projectSolutions = JSON.parse(projectSolutionsData);
    if (projectCategoriesData) this.projectCategories = JSON.parse(projectCategoriesData);
    if (rawMaterialsData) this.rawMaterials = JSON.parse(rawMaterialsData);
    if (knowledgePackagesData) this.knowledgePackages = JSON.parse(knowledgePackagesData);
    if (acceptanceResultsData) this.acceptanceResults = JSON.parse(acceptanceResultsData);
    if (feedbackRecordsData) this.feedbackRecords = JSON.parse(feedbackRecordsData);
  }

  private saveToStorage() {
    localStorage.setItem("industries", JSON.stringify(this.industries));
    localStorage.setItem("domains", JSON.stringify(this.domains));
    localStorage.setItem("scenarios", JSON.stringify(this.scenarios));
    localStorage.setItem("relationships", JSON.stringify(this.relationships));
    localStorage.setItem("templates", JSON.stringify(this.templates));
    localStorage.setItem("knowledgeCategories", JSON.stringify(this.knowledgeCategories));
    localStorage.setItem("projects", JSON.stringify(this.projects));
    localStorage.setItem("projectSolutions", JSON.stringify(this.projectSolutions));
    localStorage.setItem("projectCategories", JSON.stringify(this.projectCategories));
    localStorage.setItem("rawMaterials", JSON.stringify(this.rawMaterials));
    localStorage.setItem("knowledgePackages", JSON.stringify(this.knowledgePackages));
    localStorage.setItem("acceptanceResults", JSON.stringify(this.acceptanceResults));
    localStorage.setItem("feedbackRecords", JSON.stringify(this.feedbackRecords));
  }

  private initializeSampleData() {
    this.industries = [
      { id: "1", name: "金融", code: "FIN", enabled: true, createdAt: new Date().toISOString() },
      { id: "2", name: "医疗", code: "MED", enabled: true, createdAt: new Date().toISOString() },
      { id: "3", name: "电商", code: "EC", enabled: false, createdAt: new Date().toISOString() },
    ];

    this.domains = [
      { id: "1", name: "客户服务", code: "CS", enabled: true, createdAt: new Date().toISOString() },
      { id: "2", name: "风险控制", code: "RC", enabled: true, createdAt: new Date().toISOString() },
      { id: "3", name: "营销推广", code: "MKT", enabled: false, createdAt: new Date().toISOString() },
    ];

    this.scenarios = [
      { id: "1", name: "智能问答", code: "QA", enabled: true, createdAt: new Date().toISOString() },
      { id: "2", name: "文档审核", code: "DA", enabled: true, createdAt: new Date().toISOString() },
      { id: "3", name: "内容生成", code: "CG", enabled: false, createdAt: new Date().toISOString() },
    ];

    this.relationships = [
      { id: "1", industryId: "1", domainId: "1", scenarioId: "1", enabled: true, createdAt: new Date().toISOString() },
      { id: "2", industryId: "1", domainId: "2", scenarioId: "2", enabled: true, createdAt: new Date().toISOString() },
    ];

    this.templates = [
      { 
        id: "1", 
        name: "金融客服智能问答模板", 
        description: "适用于金融行业客户服务场景的智能问答知识构建",
        relationshipId: "1",
        enabled: true, 
        createdAt: new Date().toISOString() 
      },
      { 
        id: "2", 
        name: "通用知识管理模板", 
        description: "通用的知识管理模板，适用于各种场景",
        enabled: false, 
        createdAt: new Date().toISOString() 
      },
    ];

    this.knowledgeCategories = [
      { id: "1", name: "产品知识", parentId: null, formTypes: [], templateId: "1", order: 1, level: 1 },
      { id: "2", name: "理财产品", parentId: "1", formTypes: [KnowledgeFormType.QA, KnowledgeFormType.GLOSSARY], templateId: "1", order: 1, level: 2 },
      { id: "3", name: "信用卡产品", parentId: "1", formTypes: [KnowledgeFormType.QA], templateId: "1", order: 2, level: 2 },
      { id: "4", name: "业务流程", parentId: null, formTypes: [], templateId: "1", order: 2, level: 1 },
      { id: "5", name: "开户流程", parentId: "4", formTypes: [KnowledgeFormType.SOP], templateId: "1", order: 1, level: 2 },
    ];

    this.projects = [
      { 
        id: "1", 
        name: "金融客服知识库项目", 
        description: "金融行业客户服务智能问答知识库建设项目", 
        relationshipId: "1",
        templateId: "1", 
        enabled: true,
        hasContent: true,
        hasSolution: true,
        createdAt: new Date(Date.now() - 7 * 86400000).toISOString() 
      },
      { 
        id: "2", 
        name: "风控文档审核项目", 
        description: "金融风险控制文档审核知识库建设项目",
        relationshipId: "2",
        templateId: undefined,
        enabled: true,
        hasContent: true,
        hasSolution: true,
        createdAt: new Date(Date.now() - 6 * 86400000).toISOString() 
      },
      { 
        id: "3", 
        name: "医疗健康咨询平台", 
        description: "医疗健康领域智能问答和咨询服务知识库",
        relationshipId: "1",
        templateId: "1",
        enabled: true,
        hasContent: true,
        hasSolution: false,
        createdAt: new Date(Date.now() - 5 * 86400000).toISOString() 
      },
      { 
        id: "4", 
        name: "智能保险顾问", 
        description: "保险产品推荐和理赔咨询智能助手",
        relationshipId: "1",
        templateId: "1",
        enabled: true,
        hasContent: false,
        hasSolution: true,
        createdAt: new Date(Date.now() - 4 * 86400000).toISOString() 
      },
      { 
        id: "5", 
        name: "企业内部知识库", 
        description: "企业内部规章制度、流程文档知识管理平台",
        relationshipId: "2",
        templateId: undefined,
        enabled: true,
        hasContent: true,
        hasSolution: true,
        createdAt: new Date(Date.now() - 3 * 86400000).toISOString() 
      },
      { 
        id: "6", 
        name: "产品说明书智能助手", 
        description: "产品使用手册和常见问题智能查询系统",
        relationshipId: "1",
        templateId: "1",
        enabled: true,
        hasContent: true,
        hasSolution: false,
        createdAt: new Date(Date.now() - 2 * 86400000).toISOString() 
      },
      { 
        id: "7", 
        name: "HR招聘助手", 
        description: "人力资源招聘流程和职位信息智能管理",
        relationshipId: "2",
        templateId: undefined,
        enabled: true,
        hasContent: false,
        hasSolution: false,
        createdAt: new Date(Date.now() - 1 * 86400000).toISOString() 
      },
      { 
        id: "8", 
        name: "法律咨询知识库", 
        description: "法律法规查询和案例分析智能服务平台",
        relationshipId: "1",
        templateId: "1",
        enabled: true,
        hasContent: true,
        hasSolution: true,
        createdAt: new Date(Date.now() - 12 * 3600000).toISOString() 
      },
    ];

    this.projectSolutions = [
      { 
        id: "1", 
        projectId: "1",
        enabled: true,
        status: "active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      { 
        id: "2", 
        projectId: "2",
        enabled: true,
        status: "active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    this.projectCategories = [
      { 
        id: "1", 
        solutionId: "1",
        name: "产品知识", 
        parentId: null,
        formTypes: [],
        order: 1,
        level: 1,
      },
      { 
        id: "2", 
        solutionId: "2",
        name: "风控规则",
        parentId: null,
        formTypes: [],
        order: 1,
        level: 1,
      },
    ];

    this.rawMaterials = [
      { 
        id: "1", 
        projectId: "1",
        fileName: "金融产品手册.pdf",
        fileSize: 2048576,
        fileType: ".pdf",
        uploadTime: new Date(Date.now() - 86400000).toISOString(),
        uploader: "企业客户 A",
        sourceType: "客户端上传",
        status: UploadStatus.SUCCESS,
        fileUrl: "mock://files/金融产品手册.pdf",
      },
      { 
        id: "2", 
        projectId: "1",
        fileName: "产品FAQ.docx",
        fileSize: 524288,
        fileType: ".docx",
        uploadTime: new Date(Date.now() - 43200000).toISOString(),
        uploader: "企业客户 A",
        sourceType: "客户端上传",
        status: UploadStatus.SUCCESS,
        fileUrl: "mock://files/产品FAQ.docx",
      },
    ];

    // 添加示例知识包数据
    this.knowledgePackages = [
      {
        id: "1",
        projectId: "1",
        name: "金融客服知识库 V1.0",
        description: "基于客户上传的产品手册和FAQ文档构建的金融客服知识库",
        knowledgeObjectTypes: [KnowledgeFormType.QA, KnowledgeFormType.GLOSSARY, KnowledgeFormType.SOP],
        totalItems: 156,
        enabled: true,
        status: "可用",
        createdAt: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: "2",
        projectId: "1",
        name: "金融客服知识库 V1.1",
        description: "更新版本，增加了更多业务流程和产品知识",
        knowledgeObjectTypes: [KnowledgeFormType.QA, KnowledgeFormType.GLOSSARY, KnowledgeFormType.SOP],
        totalItems: 189,
        enabled: true,
        status: "可用",
        createdAt: new Date(Date.now() - 7200000).toISOString(),
      },
      {
        id: "3",
        projectId: "2",
        name: "风控规则知识库 V1.0",
        description: "风险控制相关的规则和审核流程知识库",
        knowledgeObjectTypes: [KnowledgeFormType.TABLE, KnowledgeFormType.SOP],
        totalItems: 78,
        enabled: true,
        status: "可用",
        createdAt: new Date(Date.now() - 10800000).toISOString(),
      },
    ];

    // 添加示例验收记录数据
    this.acceptanceResults = [
      {
        id: "ar-1",
        projectId: "1",
        packageId: "1",
        status: AcceptanceStatus.ACCEPTED,
        acceptanceTime: new Date(Date.now() - 1800000).toISOString(), // 30分钟前
        acceptor: "张经理",
        comments: "知识库质量符合要求，内容完整，可以投入使用。",
      },
      {
        id: "ar-2",
        projectId: "1",
        packageId: "2",
        status: AcceptanceStatus.FEEDBACK,
        acceptanceTime: new Date(Date.now() - 5400000).toISOString(), // 1.5小时前
        acceptor: "李主管",
        comments: "整体不错，但部分产品知识类目需要补充更多案例说明，建议优化后再次提交。",
      },
      {
        id: "ar-3",
        projectId: "2",
        packageId: "3",
        status: AcceptanceStatus.ACCEPTED,
        acceptanceTime: new Date(Date.now() - 86400000).toISOString(), // 1天前
        acceptor: "王总监",
        comments: "风控规则清晰准确，流程描述详细，通过验收。",
      },
      {
        id: "ar-4",
        projectId: "1",
        packageId: "1",
        status: AcceptanceStatus.PENDING,
        acceptanceTime: new Date(Date.now() - 172800000).toISOString(), // 2天前
        acceptor: "陈部长",
        comments: "正在进行详细审核中，预计本周内完成验收。",
      },
      {
        id: "ar-5",
        projectId: "1",
        packageId: "2",
        status: AcceptanceStatus.ACCEPTED,
        acceptanceTime: new Date(Date.now() - 259200000).toISOString(), // 3天前
        acceptor: "赵总",
        comments: "知识库内容丰富，结构清晰，质量达标，准予通过。",
      },
    ];

    this.saveToStorage();
  }

  // Industries
  getIndustries(): Industry[] {
    return [...this.industries];
  }

  getIndustry(id: string): Industry | undefined {
    return this.industries.find(i => i.id === id);
  }

  addIndustry(industry: Omit<Industry, "id" | "createdAt">): Industry {
    const newIndustry: Industry = {
      ...industry,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    this.industries.push(newIndustry);
    this.saveToStorage();
    return newIndustry;
  }

  updateIndustry(id: string, data: Partial<Industry>): Industry | null {
    const index = this.industries.findIndex(i => i.id === id);
    if (index === -1) return null;
    
    this.industries[index] = { ...this.industries[index], ...data };
    this.saveToStorage();
    return this.industries[index];
  }

  deleteIndustry(id: string): boolean {
    const isUsed = this.relationships.some(r => r.industryId === id);
    if (isUsed) return false;

    const index = this.industries.findIndex(i => i.id === id);
    if (index === -1) return false;

    this.industries.splice(index, 1);
    this.saveToStorage();
    return true;
  }

  isIndustryNameExists(name: string, excludeId?: string): boolean {
    return this.industries.some(i => i.name === name && i.id !== excludeId);
  }

  // Domains
  getDomains(): Domain[] {
    return [...this.domains];
  }

  getDomain(id: string): Domain | undefined {
    return this.domains.find(d => d.id === id);
  }

  addDomain(domain: Omit<Domain, "id" | "createdAt">): Domain {
    const newDomain: Domain = {
      ...domain,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    this.domains.push(newDomain);
    this.saveToStorage();
    return newDomain;
  }

  updateDomain(id: string, data: Partial<Domain>): Domain | null {
    const index = this.domains.findIndex(d => d.id === id);
    if (index === -1) return null;
    
    this.domains[index] = { ...this.domains[index], ...data };
    this.saveToStorage();
    return this.domains[index];
  }

  deleteDomain(id: string): boolean {
    const isUsed = this.relationships.some(r => r.domainId === id);
    if (isUsed) return false;

    const index = this.domains.findIndex(d => d.id === id);
    if (index === -1) return false;

    this.domains.splice(index, 1);
    this.saveToStorage();
    return true;
  }

  isDomainNameExists(name: string, excludeId?: string): boolean {
    return this.domains.some(d => d.name === name && d.id !== excludeId);
  }

  // Scenarios
  getScenarios(): Scenario[] {
    return [...this.scenarios];
  }

  getScenario(id: string): Scenario | undefined {
    return this.scenarios.find(s => s.id === id);
  }

  addScenario(scenario: Omit<Scenario, "id" | "createdAt">): Scenario {
    const newScenario: Scenario = {
      ...scenario,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    this.scenarios.push(newScenario);
    this.saveToStorage();
    return newScenario;
  }

  updateScenario(id: string, data: Partial<Scenario>): Scenario | null {
    const index = this.scenarios.findIndex(s => s.id === id);
    if (index === -1) return null;
    
    this.scenarios[index] = { ...this.scenarios[index], ...data };
    this.saveToStorage();
    return this.scenarios[index];
  }

  deleteScenario(id: string): boolean {
    const isUsed = this.relationships.some(r => r.scenarioId === id);
    if (isUsed) return false;

    const index = this.scenarios.findIndex(s => s.id === id);
    if (index === -1) return false;

    this.scenarios.splice(index, 1);
    this.saveToStorage();
    return true;
  }

  isScenarioNameExists(name: string, excludeId?: string): boolean {
    return this.scenarios.some(s => s.name === name && s.id !== excludeId);
  }

  // Relationships
  getRelationships(): Relationship[] {
    return [...this.relationships];
  }

  getRelationship(id: string): Relationship | undefined {
    return this.relationships.find(r => r.id === id);
  }

  addRelationship(relationship: Omit<Relationship, "id" | "createdAt">): Relationship {
    const newRelationship: Relationship = {
      ...relationship,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    this.relationships.push(newRelationship);
    this.saveToStorage();
    return newRelationship;
  }

  updateRelationship(id: string, data: Partial<Relationship>): Relationship | null {
    const index = this.relationships.findIndex(r => r.id === id);
    if (index === -1) return null;
    
    this.relationships[index] = { ...this.relationships[index], ...data };
    this.saveToStorage();
    return this.relationships[index];
  }

  deleteRelationship(id: string): boolean {
    const relationship = this.relationships.find(r => r.id === id);
    if (!relationship) return false;
    
    if (relationship.usedByProjects) return false;

    const index = this.relationships.findIndex(r => r.id === id);
    this.relationships.splice(index, 1);
    this.saveToStorage();
    return true;
  }

  isRelationshipExists(industryId: string, domainId: string, scenarioId: string, excludeId?: string): boolean {
    return this.relationships.some(
      r => r.industryId === industryId && 
           r.domainId === domainId && 
           r.scenarioId === scenarioId && 
           r.id !== excludeId
    );
  }

  getAvailableRelationships(): Relationship[] {
    return this.relationships.filter(r => {
      const industry = this.getIndustry(r.industryId);
      const domain = this.getDomain(r.domainId);
      const scenario = this.getScenario(r.scenarioId);
      
      return r.enabled && 
             industry?.enabled && 
             domain?.enabled && 
             scenario?.enabled;
    });
  }

  // Templates
  getTemplates(): Template[] {
    return [...this.templates];
  }

  getTemplate(id: string): Template | undefined {
    return this.templates.find(t => t.id === id);
  }

  addTemplate(template: Omit<Template, "id" | "createdAt">): Template {
    const newTemplate: Template = {
      ...template,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    this.templates.push(newTemplate);
    this.saveToStorage();
    return newTemplate;
  }

  updateTemplate(id: string, data: Partial<Template>): Template | null {
    const index = this.templates.findIndex(t => t.id === id);
    if (index === -1) return null;
    
    this.templates[index] = { ...this.templates[index], ...data };
    this.saveToStorage();
    return this.templates[index];
  }

  deleteTemplate(id: string): boolean {
    const template = this.templates.find(t => t.id === id);
    if (!template) return false;
    
    if (template.usedByProjects) return false;

    const index = this.templates.findIndex(t => t.id === id);
    this.templates.splice(index, 1);
    
    this.knowledgeCategories = this.knowledgeCategories.filter(c => c.templateId !== id);
    
    this.saveToStorage();
    return true;
  }

  isTemplateNameExists(name: string, excludeId?: string): boolean {
    return this.templates.some(t => t.name === name && t.id !== excludeId);
  }

  duplicateTemplate(sourceId: string, newName: string, newRelationshipId?: string): Template | null {
    const sourceTemplate = this.getTemplate(sourceId);
    if (!sourceTemplate) return null;

    const newTemplate = this.addTemplate({
      name: newName,
      description: sourceTemplate.description,
      relationshipId: newRelationshipId,
      enabled: false,
    });

    const sourceCategories = this.knowledgeCategories.filter(c => c.templateId === sourceId);
    const idMap = new Map<string, string>();

    sourceCategories.forEach(category => {
      const newId = `${Date.now()}-${Math.random()}`;
      idMap.set(category.id, newId);
      
      const newCategory: KnowledgeCategory = {
        ...category,
        id: newId,
        templateId: newTemplate.id,
        parentId: null,
      };
      this.knowledgeCategories.push(newCategory);
    });

    this.knowledgeCategories.forEach(category => {
      if (category.templateId === newTemplate.id) {
        const sourceCategory = sourceCategories.find(c => idMap.get(c.id) === category.id);
        if (sourceCategory && sourceCategory.parentId) {
          category.parentId = idMap.get(sourceCategory.parentId) || null;
        }
      }
    });

    this.saveToStorage();
    return newTemplate;
  }

  getAvailableTemplates(): Template[] {
    return this.templates.filter(t => {
      if (!t.enabled) return false;
      
      if (!t.relationshipId) return true;
      
      const availableRelationships = this.getAvailableRelationships();
      return availableRelationships.some(r => r.id === t.relationshipId);
    });
  }

  // Knowledge Categories
  getKnowledgeCategories(templateId: string): KnowledgeCategory[] {
    return this.knowledgeCategories
      .filter(c => c.templateId === templateId)
      .sort((a, b) => a.order - b.order);
  }

  getKnowledgeCategory(id: string): KnowledgeCategory | undefined {
    return this.knowledgeCategories.find(c => c.id === id);
  }

  addKnowledgeCategory(category: Omit<KnowledgeCategory, "id">): KnowledgeCategory {
    const newCategory: KnowledgeCategory = {
      ...category,
      id: `${Date.now()}-${Math.random()}`,
    };
    this.knowledgeCategories.push(newCategory);
    this.saveToStorage();
    return newCategory;
  }

  updateKnowledgeCategory(id: string, data: Partial<KnowledgeCategory>): KnowledgeCategory | null {
    const index = this.knowledgeCategories.findIndex(c => c.id === id);
    if (index === -1) return null;
    
    this.knowledgeCategories[index] = { ...this.knowledgeCategories[index], ...data };
    this.saveToStorage();
    return this.knowledgeCategories[index];
  }

  deleteKnowledgeCategory(id: string): boolean {
    const hasChildren = this.knowledgeCategories.some(c => c.parentId === id);
    if (hasChildren) return false;

    const index = this.knowledgeCategories.findIndex(c => c.id === id);
    if (index === -1) return false;

    this.knowledgeCategories.splice(index, 1);
    this.saveToStorage();
    return true;
  }

  isCategoryNameExistsInTemplate(templateId: string, name: string, excludeId?: string): boolean {
    return this.knowledgeCategories.some(
      c => c.templateId === templateId && c.name === name && c.id !== excludeId
    );
  }

  getChildCategories(parentId: string): KnowledgeCategory[] {
    return this.knowledgeCategories
      .filter(c => c.parentId === parentId)
      .sort((a, b) => a.order - b.order);
  }

  isLeafCategory(id: string): boolean {
    return !this.knowledgeCategories.some(c => c.parentId === id);
  }

  // Projects
  getProjects(): Project[] {
    return [...this.projects];
  }

  getProject(id: string): Project | undefined {
    return this.projects.find(p => p.id === id);
  }

  addProject(project: Omit<Project, "id" | "createdAt">): Project {
    const newProject: Project = {
      ...project,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    this.projects.push(newProject);
    this.saveToStorage();
    return newProject;
  }

  updateProject(id: string, data: Partial<Project>): Project | null {
    const index = this.projects.findIndex(p => p.id === id);
    if (index === -1) return null;
    
    this.projects[index] = { ...this.projects[index], ...data };
    this.saveToStorage();
    return this.projects[index];
  }

  deleteProject(id: string): boolean {
    const index = this.projects.findIndex(p => p.id === id);
    if (index === -1) return false;

    this.projects.splice(index, 1);
    this.saveToStorage();
    return true;
  }

  isProjectNameExists(name: string, excludeId?: string): boolean {
    return this.projects.some(p => p.name === name && p.id !== excludeId);
  }

  // Project Solutions (M-PRD-4)
  getProjectSolution(projectId: string): ProjectSolution | undefined {
    return this.projectSolutions.find(ps => ps.projectId === projectId);
  }

  initializeProjectSolution(projectId: string): ProjectSolution | null {
    const project = this.getProject(projectId);
    if (!project) return null;

    // 检查是否已存在项目方案
    const existing = this.getProjectSolution(projectId);
    if (existing) return existing;

    // 创建项目方案，初始状态为草稿
    const now = new Date().toISOString();
    const solution: ProjectSolution = {
      id: `sol-${Date.now()}`,
      projectId,
      enabled: false, // 草稿状态下为false
      status: "draft", // 初始为草稿状态
      createdAt: now,
      updatedAt: now,
    };
    this.projectSolutions.push(solution);

    // 如果项目有模板，从模板复制知识类目
    if (project.templateId) {
      const templateCategories = this.getKnowledgeCategories(project.templateId);
      const idMap = new Map<string, string>();

      // 第一遍：创建所有类目但暂不设置父级关系
      templateCategories.forEach(category => {
        const newId = `cat-${Date.now()}-${Math.random()}`;
        idMap.set(category.id, newId);
        
        const newCategory: ProjectCategory = {
          id: newId,
          solutionId: solution.id,
          name: category.name,
          parentId: null, // 先设为null
          formTypes: [...category.formTypes],
          order: category.order,
          level: category.level,
        };
        this.projectCategories.push(newCategory);
      });

      // 第二遍：设置父级关系
      this.projectCategories.forEach(category => {
        if (category.solutionId === solution.id) {
          const sourceCategory = templateCategories.find(c => idMap.get(c.id) === category.id);
          if (sourceCategory && sourceCategory.parentId) {
            category.parentId = idMap.get(sourceCategory.parentId) || null;
          }
        }
      });
    }

    // 更新项目的hasSolution标记
    this.updateProject(projectId, { hasSolution: true });

    this.saveToStorage();
    return solution;
  }

  getProjectCategories(solutionId: string): ProjectCategory[] {
    return this.projectCategories
      .filter(c => c.solutionId === solutionId)
      .sort((a, b) => a.order - b.order);
  }

  addProjectCategory(category: Omit<ProjectCategory, "id">): ProjectCategory {
    const newCategory: ProjectCategory = {
      ...category,
      id: `cat-${Date.now()}-${Math.random()}`,
    };
    this.projectCategories.push(newCategory);
    this.saveToStorage();
    return newCategory;
  }

  updateProjectCategory(id: string, data: Partial<ProjectCategory>): ProjectCategory | null {
    const index = this.projectCategories.findIndex(c => c.id === id);
    if (index === -1) return null;
    
    this.projectCategories[index] = { ...this.projectCategories[index], ...data };
    this.saveToStorage();
    return this.projectCategories[index];
  }

  deleteProjectCategory(id: string): boolean {
    const hasChildren = this.projectCategories.some(c => c.parentId === id);
    if (hasChildren) return false;

    const index = this.projectCategories.findIndex(c => c.id === id);
    if (index === -1) return false;

    this.projectCategories.splice(index, 1);
    this.saveToStorage();
    return true;
  }

  isProjectCategoryNameExists(solutionId: string, name: string, parentId: string | null, excludeId?: string): boolean {
    return this.projectCategories.some(
      c => c.solutionId === solutionId && c.name === name && c.parentId === parentId && c.id !== excludeId
    );
  }

  updateProjectSolution(id: string, data: Partial<ProjectSolution>): ProjectSolution | null {
    const index = this.projectSolutions.findIndex(ps => ps.id === id);
    if (index === -1) return null;
    
    this.projectSolutions[index] = {
      ...this.projectSolutions[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    this.saveToStorage();
    return this.projectSolutions[index];
  }

  // 完成项目方案（从草稿状态激活）
  activateProjectSolution(id: string): ProjectSolution | null {
    return this.updateProjectSolution(id, {
      status: "active",
      enabled: true,
    });
  }

  // Raw Materials (C-PRD-1)
  getRawMaterials(projectId?: string, uploader?: string): RawMaterial[] {
    let materials = [...this.rawMaterials];
    
    if (projectId) {
      materials = materials.filter(m => m.projectId === projectId);
    }
    
    if (uploader) {
      materials = materials.filter(m => m.uploader === uploader);
    }
    
    // 按上传时间倒序排列
    return materials.sort((a, b) => new Date(b.uploadTime).getTime() - new Date(a.uploadTime).getTime());
  }

  getRawMaterial(id: string): RawMaterial | undefined {
    return this.rawMaterials.find(m => m.id === id);
  }

  addRawMaterial(material: Omit<RawMaterial, "id">): RawMaterial {
    const newMaterial: RawMaterial = {
      ...material,
      id: `rm-${Date.now()}-${Math.random()}`,
    };
    this.rawMaterials.push(newMaterial);
    
    // 更新项目的hasContent标记
    this.updateProject(material.projectId, { hasContent: true });
    
    this.saveToStorage();
    return newMaterial;
  }

  updateRawMaterial(id: string, data: Partial<RawMaterial>): RawMaterial | null {
    const index = this.rawMaterials.findIndex(m => m.id === id);
    if (index === -1) return null;
    
    this.rawMaterials[index] = { ...this.rawMaterials[index], ...data };
    this.saveToStorage();
    return this.rawMaterials[index];
  }

  deleteRawMaterial(id: string): boolean {
    const index = this.rawMaterials.findIndex(m => m.id === id);
    if (index === -1) return false;

    this.rawMaterials.splice(index, 1);
    this.saveToStorage();
    return true;
  }

  getRawMaterialStats(projectId: string): { total: number; success: number; failed: number } {
    const materials = this.getRawMaterials(projectId);
    return {
      total: materials.length,
      success: materials.filter(m => m.status === UploadStatus.SUCCESS).length,
      failed: materials.filter(m => m.status === UploadStatus.FAILED).length,
    };
  }

  // Knowledge Packages (C-PRD-2)
  getKnowledgePackages(projectId?: string): KnowledgePackage[] {
    let packages = [...this.knowledgePackages];
    
    if (projectId) {
      packages = packages.filter(p => p.projectId === projectId);
    }
    
    return packages;
  }

  getKnowledgePackage(id: string): KnowledgePackage | undefined {
    return this.knowledgePackages.find(p => p.id === id);
  }

  addKnowledgePackage(packageData: Omit<KnowledgePackage, "id">): KnowledgePackage {
    const newPackage: KnowledgePackage = {
      ...packageData,
      id: `kp-${Date.now()}-${Math.random()}`,
    };
    this.knowledgePackages.push(newPackage);
    
    this.saveToStorage();
    return newPackage;
  }

  updateKnowledgePackage(id: string, data: Partial<KnowledgePackage>): KnowledgePackage | null {
    const index = this.knowledgePackages.findIndex(p => p.id === id);
    if (index === -1) return null;
    
    this.knowledgePackages[index] = { ...this.knowledgePackages[index], ...data };
    this.saveToStorage();
    return this.knowledgePackages[index];
  }

  deleteKnowledgePackage(id: string): boolean {
    const index = this.knowledgePackages.findIndex(p => p.id === id);
    if (index === -1) return false;

    this.knowledgePackages.splice(index, 1);
    this.saveToStorage();
    return true;
  }

  // Acceptance Results (C-PRD-2)
  getAcceptanceResults(projectId?: string): AcceptanceResult[] {
    let results = [...this.acceptanceResults];
    
    if (projectId) {
      results = results.filter(r => r.projectId === projectId);
    }
    
    return results;
  }

  getAcceptanceResult(id: string): AcceptanceResult | undefined {
    return this.acceptanceResults.find(r => r.id === id);
  }

  addAcceptanceResult(resultData: Omit<AcceptanceResult, "id">): AcceptanceResult {
    const newResult: AcceptanceResult = {
      ...resultData,
      id: `ar-${Date.now()}-${Math.random()}`,
    };
    this.acceptanceResults.push(newResult);
    
    this.saveToStorage();
    return newResult;
  }

  updateAcceptanceResult(id: string, data: Partial<AcceptanceResult>): AcceptanceResult | null {
    const index = this.acceptanceResults.findIndex(r => r.id === id);
    if (index === -1) return null;
    
    this.acceptanceResults[index] = { ...this.acceptanceResults[index], ...data };
    this.saveToStorage();
    return this.acceptanceResults[index];
  }

  deleteAcceptanceResult(id: string): boolean {
    const index = this.acceptanceResults.findIndex(r => r.id === id);
    if (index === -1) return false;

    this.acceptanceResults.splice(index, 1);
    this.saveToStorage();
    return true;
  }

  // Feedback Records (C-PRD-2)
  getFeedbackRecords(projectId?: string): FeedbackRecord[] {
    let records = [...this.feedbackRecords];
    
    if (projectId) {
      records = records.filter(r => r.projectId === projectId);
    }
    
    return records;
  }

  getFeedbackRecord(id: string): FeedbackRecord | undefined {
    return this.feedbackRecords.find(r => r.id === id);
  }

  addFeedbackRecord(recordData: Omit<FeedbackRecord, "id">): FeedbackRecord {
    const newRecord: FeedbackRecord = {
      ...recordData,
      id: `fr-${Date.now()}-${Math.random()}`,
    };
    this.feedbackRecords.push(newRecord);
    
    this.saveToStorage();
    return newRecord;
  }

  updateFeedbackRecord(id: string, data: Partial<FeedbackRecord>): FeedbackRecord | null {
    const index = this.feedbackRecords.findIndex(r => r.id === id);
    if (index === -1) return null;
    
    this.feedbackRecords[index] = { ...this.feedbackRecords[index], ...data };
    this.saveToStorage();
    return this.feedbackRecords[index];
  }

  deleteFeedbackRecord(id: string): boolean {
    const index = this.feedbackRecords.findIndex(r => r.id === id);
    if (index === -1) return false;

    this.feedbackRecords.splice(index, 1);
    this.saveToStorage();
    return true;
  }

  // Knowledge Objects & Categories for Package View (Mock data)
  getPackageCategoriesWithCount(packageId: string): KnowledgeCategoryWithCount[] {
    // 模拟知识类目树数据
    return [
      {
        id: "cat-1",
        name: "产品介绍",
        count: 12,
        children: [],
      },
      {
        id: "cat-2",
        name: "常见问题",
        count: 48,
        children: [],
      },
      {
        id: "cat-3",
        name: "售后服务政策",
        count: 24,
        children: [],
      },
      {
        id: "cat-4",
        name: "退款流程",
        count: 8,
        children: [],
      },
      {
        id: "cat-5",
        name: "隐私条款",
        count: 6,
        children: [],
      },
      {
        id: "cat-6",
        name: "维修政策",
        count: 10,
        children: [],
      },
      {
        id: "cat-7",
        name: "物流查询",
        count: 5,
        children: [],
      },
      {
        id: "cat-8",
        name: "服务相关",
        count: 15,
        children: [],
      },
    ];
  }

  getKnowledgeObjects(packageId: string, categoryId?: string): KnowledgeObject[] {
    // 模拟知识对象数据
    const allObjects: KnowledgeObject[] = [
      {
        id: "ko-1",
        title: "产品核心功能介绍",
        description: "包含产品主要功能特性，技术优势，应用场景等的介绍内容，其涵盖了2个方面功能摘要。",
        categoryId: "cat-1",
        categoryName: "产品介绍",
        formType: KnowledgeFormType.UNSTRUCTURED,
        updateTime: "2026-03-25",
        sourceFile: "产品手册.pdf",
        dataType: "包含图片/12张",
        wordCount: 12,
      },
      {
        id: "ko-2",
        title: "产品版本对比表",
        description: "详细对比了7个基础版，专业版，企业版三个不同产品版本之间的功能差异，价格对比等详尽信息。",
        categoryId: "cat-1",
        categoryName: "产品介绍",
        formType: KnowledgeFormType.TABLE,
        updateTime: "2026-03-25",
        sourceFile: "产品简介.docx",
        dataType: "数据类型/18行",
      },
      {
        id: "ko-3",
        title: "产品家族分类树",
        description: "展示了全系列产品的结构分类关系，包含产品线、产品系列、具体型号等 3 级分类结构。",
        categoryId: "cat-1",
        categoryName: "产品介绍",
        formType: KnowledgeFormType.TREE,
        updateTime: "2026-03-25",
        sourceFile: "产品架构.docx",
        dataType: "分类数/42个",
      },
      {
        id: "ko-4",
        title: "产品使用流程说明",
        description: "详细描述了产品从注册，初始化配置到日常使用的详细流程说明文档，共包含主流程6个关键步骤。",
        categoryId: "cat-1",
        categoryName: "产品介绍",
        formType: KnowledgeFormType.SOP,
        updateTime: "2026-03-25",
        sourceFile: "产品操作手册.pdf",
        dataType: "流程步骤/24步",
      },
      {
        id: "ko-5",
        title: "账号注册与登录问题",
        description: "包含用户注册、登录、找回密码等常见问题解答，涵盖15个高频问题。",
        categoryId: "cat-2",
        categoryName: "常见问题",
        formType: KnowledgeFormType.QA,
        updateTime: "2026-03-24",
        sourceFile: "FAQ.docx",
        dataType: "问答对/15个",
      },
      {
        id: "ko-6",
        title: "支付相关问题",
        description: "解答支付方式、支付失败、退款等问题，包含12个常见问题。",
        categoryId: "cat-2",
        categoryName: "常见问题",
        formType: KnowledgeFormType.QA,
        updateTime: "2026-03-24",
        sourceFile: "FAQ.docx",
        dataType: "问答对/12个",
      },
      {
        id: "ko-7",
        title: "功能使用问题",
        description: "针对产品各个功能模块的使用问题解答，涵盖21个高频使用问题。",
        categoryId: "cat-2",
        categoryName: "常见问题",
        formType: KnowledgeFormType.QA,
        updateTime: "2026-03-24",
        sourceFile: "FAQ.docx",
        dataType: "问答对/21个",
      },
      {
        id: "ko-8",
        title: "退款政策说明",
        description: "详细说明各类产品的退款政策、退款条件、退款流程等内容。",
        categoryId: "cat-4",
        categoryName: "退款流程",
        formType: KnowledgeFormType.SOP,
        updateTime: "2026-03-23",
        sourceFile: "服务政策.pdf",
        dataType: "流程步骤/8步",
      },
    ];

    if (categoryId) {
      return allObjects.filter(obj => obj.categoryId === categoryId);
    }
    return allObjects;
  }

  getAllProjects(): Project[] {
    return this.getProjects();
  }
}

export const dataStore = new DataStore();