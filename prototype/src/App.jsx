import { Children, isValidElement, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  ApiOutlined,
  CheckCircleOutlined,
  DownOutlined as AntDownOutlined,
  LeftOutlined,
  CloseOutlined,
  CloudServerOutlined,
  CodeOutlined,
  DeleteOutlined,
  DownOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  FolderOpenOutlined,
  HomeOutlined,
  MenuFoldOutlined,
  MoreOutlined,
  PlusOutlined,
  RobotOutlined,
  SearchOutlined,
  SendOutlined,
  SettingOutlined,
  StarOutlined,
  SyncOutlined,
  ThunderboltOutlined,
  ToolOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { dataStore, knowledgeFormTypes } from './dataStore.js';
import {
  createKnowledgeToolFromRaw,
  createEmptyServiceDraft,
  defaultCategories,
  listRawMcpTools,
  loadServices,
  readCatalog,
  saveCatalog,
  saveServices,
  subscribeCatalog,
  syncService,
} from './toolCatalog.js';

const allToolsCategory = '全部';

function makeId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function nowText() {
  return new Date().toISOString().slice(0, 16).replace('T', ' ');
}

function Badge({ children, tone = 'neutral' }) {
  return <span className={`badge ${tone}`}>{children}</span>;
}

function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(onClose, 2600);
    return () => window.clearTimeout(timer);
  }, [toast, onClose]);
  if (!toast) return null;
  return <div className={`toast ${toast.type || 'info'}`}>{toast.message}</div>;
}

function Toolbar({ children, className = '' }) {
  return <div className={`toolbar ${className}`.trim()}>{children}</div>;
}

function SearchBox({ value, onChange, placeholder }) {
  return (
    <label className="search-box">
      <SearchOutlined />
      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
    </label>
  );
}

function SelectField({ value, onChange, children, className = '', disabled = false }) {
  const [open, setOpen] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState(null);
  const rootRef = useRef(null);
  const dropdownRef = useRef(null);
  const options = Children.toArray(children)
    .filter(isValidElement)
    .map((child, index) => ({
      id: `${child.props.value ?? ''}-${index}`,
      value: child.props.value ?? '',
      label: child.props.children,
      disabled: Boolean(child.props.disabled),
    }));
  const selected = options.find((option) => `${option.value}` === `${value}`) || options[0];

  useEffect(() => {
    if (!open) return undefined;
    const handlePointerDown = (event) => {
      if (!rootRef.current?.contains(event.target) && !dropdownRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const updatePosition = () => {
      const rect = rootRef.current?.getBoundingClientRect();
      if (!rect) return;
      const gap = 6;
      const viewportPadding = 16;
      const minHeight = 120;
      const preferredHeight = 260;
      const below = window.innerHeight - rect.bottom - viewportPadding - gap;
      const above = rect.top - viewportPadding - gap;
      const openUpward = below < minHeight && above > below;
      const maxHeight = Math.max(minHeight, Math.min(preferredHeight, openUpward ? above : below));
      const top = openUpward ? Math.max(viewportPadding, rect.top - maxHeight - gap) : rect.bottom + gap;
      const width = Math.max(rect.width, 180);
      const left = Math.min(Math.max(viewportPadding, rect.left), window.innerWidth - width - viewportPadding);
      setDropdownStyle({ position: 'fixed', top, left, width, maxHeight, zIndex: 300 });
    };
    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [open]);

  const chooseOption = (option) => {
    if (disabled || option.disabled) return;
    onChange(option.value);
    setOpen(false);
  };

  return (
    <span ref={rootRef} className={`select-field-wrap ${open ? 'open' : ''} ${disabled ? 'disabled' : ''} ${className}`.trim()}>
      <button type="button" className={`select-field ${disabled ? 'readonly' : ''} ${className}`.trim()} disabled={disabled} onClick={() => setOpen((current) => !current)}>
        <span>{selected?.label}</span>
        <DownOutlined />
      </button>
      {open && dropdownStyle ? createPortal(
        <span ref={dropdownRef} className="select-dropdown" style={dropdownStyle}>
          {options.map((option) => (
            <button
              type="button"
              key={option.id}
              className={`select-option ${`${option.value}` === `${value}` ? 'selected' : ''} ${option.disabled ? 'disabled' : ''}`.trim()}
              aria-disabled={option.disabled}
              disabled={option.disabled}
              onClick={() => chooseOption(option)}
            >
              {option.label}
            </button>
          ))}
        </span>,
        document.body,
      ) : null}
    </span>
  );
}

function PrefixedSelectField({ label, value, onChange, children }) {
  const prefixWidth = Math.max(56, label.length * 14 + 28);
  return (
    <div className="prefixed-field" style={{ '--prefix-width': `${prefixWidth}px` }}>
      <span className="prefixed-label">{label}</span>
      <span className="prefixed-body">
        <SelectField value={value} onChange={onChange} className="embedded-select">
          {children}
        </SelectField>
      </span>
    </div>
  );
}

function PrefixedInput({ label, value, onChange, readOnly = false }) {
  const prefixWidth = Math.max(56, label.length * 14 + 28);
  return (
    <label className="prefixed-field" style={{ '--prefix-width': `${prefixWidth}px` }}>
      <span className="prefixed-label">{label}</span>
      <input value={value} readOnly={readOnly} onChange={onChange} />
    </label>
  );
}

function Modal({ title, children, footer, onClose, wide = false, className = '' }) {
  return (
    <div className="modal-layer">
      <div className={`modal-card ${wide ? 'wide' : ''} ${className}`.trim()}>
        <div className="modal-head">
          <h2>{title}</h2>
          <button type="button" className="icon-button" onClick={onClose}><CloseOutlined /></button>
        </div>
        <div className="modal-body">{children}</div>
        <div className="modal-actions">{footer}</div>
      </div>
    </div>
  );
}

function Drawer({ title, children, onClose, wide = false, className = '' }) {
  return (
    <div className="drawer-layer">
      <div className="drawer-mask" onClick={onClose} />
      <aside className={`drawer ${wide ? 'wide' : ''} ${className}`.trim()}>
        <div className="drawer-head">
          <h2>{title}</h2>
          <button type="button" className="icon-button" onClick={onClose}><CloseOutlined /></button>
        </div>
        <div className="drawer-body">{children}</div>
      </aside>
    </div>
  );
}

function ConfirmDialog({ title, message, danger, cancelText = '取消', confirmText = '确认', onCancel, onConfirm }) {
  return (
    <Modal
      title={title}
      onClose={onCancel}
      footer={(
        <>
          {cancelText ? <button type="button" className="secondary" onClick={onCancel}>{cancelText}</button> : null}
          <button type="button" className={danger ? 'danger-button' : 'primary'} onClick={onConfirm}>{confirmText}</button>
        </>
      )}
    >
      <p className="confirm-copy">{message}</p>
    </Modal>
  );
}

function HelpTip({ text }) {
  if (!text) return null;
  return (
    <span className="field-help-tip" data-tip={text} tabIndex={0} aria-label={text}>
      ?
    </span>
  );
}

function Field({ label, children, required, help }) {
  return (
    <label className="form-field">
      <span className="field-label-text">{required ? <em>*</em> : null}{label}<HelpTip text={help} /></span>
      {children}
    </label>
  );
}

function Shell({ active, onNavigate, children }) {
  const navGroups = [
    {
      title: '运营端',
      items: [
        ['ops-projects', '知识空间管理'],
        ['ops-category', '查看知识空间类目'],
        ['ops-workbench', '方案工作台'],
        ['ops-access', '知识接入'],
        ['ops-result', '知识加工结果', [
          ['ops-slice-library', '切片库'],
          ['ops-qa-library', 'QA库'],
          ['ops-knowledge-points', '知识点'],
        ]],
        ['ops-package', '知识包管理'],
      ],
    },
    {
      title: '管理端',
      items: [
        ['admin-mcp', '接入MCP服务'],
        ['admin-tools', '流程节点管理'],
        ['admin-template', '模板管理'],
      ],
    },
  ];
  return (
    <div className="pa-app">
      <header className="topbar">
        <div className="brand"><CloudServerOutlined className="brand-icon" /><span>PowerAgent</span></div>
        <nav className="topnav">
          <button type="button"><HomeOutlined /> 首页</button>
          <button type="button" className="active">知识工程</button>
        </nav>
        <div className="top-actions">
          <button type="button" className="tenant-select"><span>项</span> default <DownOutlined /></button>
          <button type="button">文档</button>
          <button type="button">反馈</button>
          <button type="button" className="avatar">U</button>
        </div>
      </header>
      <aside className="sidebar">
        {navGroups.map((group) => (
          <section className="nav-group" key={group.title}>
            <div className="nav-title">{group.title}</div>
            {group.items.map(([key, label, children]) => {
              const childActive = children?.some(([childKey]) => active === childKey);
              return (
                <div className={`nav-block ${childActive ? 'active' : ''}`} key={key}>
                  <button type="button" className={`nav-item ${active === key || childActive ? 'active' : ''}`} onClick={() => onNavigate(key)}>
                    <span>{label}</span>
                  </button>
                  {children?.length ? (
                    <div className="nav-submenu">
                      {children.map(([childKey, childLabel]) => (
                        <button
                          type="button"
                          key={childKey}
                          className={`nav-subitem ${active === childKey ? 'active' : ''}`}
                          onClick={() => onNavigate(childKey)}
                        >
                          {childLabel}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </section>
        ))}
        <button type="button" className="collapse-button"><MenuFoldOutlined /></button>
      </aside>
      <main className={`workspace ${active === 'ops-workbench' ? 'workbench-workspace' : ''}`}>{children}</main>
      <button type="button" className="assistant-dot"><RobotOutlined /></button>
    </div>
  );
}

function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="page-header">
      <div>
        <h1>{title}</h1>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
      {actions ? <div className="page-actions">{actions}</div> : null}
    </div>
  );
}

function EmptyPage({ title }) {
  return (
    <section className="panel empty-panel">
      <CloudServerOutlined />
      <h1>{title}</h1>
      <p>该菜单仅保留导航入口，本轮原型不迁移具体功能。</p>
    </section>
  );
}

const knowledgePointCategories = [
  { id: 'all', name: '全部类目', count: '99+' },
  { id: 'mixue-ruixing', name: '奶茶 > 瑞幸', count: '99+' },
];

const knowledgePointRows = [
  {
    id: 'kp-1',
    title: '喜茶门店标准服务',
    content: '围绕门店接待、点单、出杯与客诉处理沉淀...',
    source: '喜茶.docx',
    tag: '产品',
    status: '启用',
    updatedAt: '2026-05-27 10:18',
  },
  {
    id: 'kp-2',
    title: '瑞幸咖啡产品卖点',
    content: '提炼生椰拿铁、轻乳茶等产品的核心卖点...',
    source: '瑞幸.docx',
    tag: '营销',
    status: '启用',
    updatedAt: '2026-05-26 18:42',
  },
  {
    id: 'kp-3',
    title: '奶茶品牌合规话术',
    content: '用于培训员工识别营销宣传中的合规风险...',
    source: '合规手册.md',
    tag: '风控',
    status: '停用',
    updatedAt: '2026-05-25 16:30',
  },
];

function KnowledgePointsPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('全部状态');
  const [sourceFilter, setSourceFilter] = useState('来源文件');
  const [tagFilter, setTagFilter] = useState('标签');
  const [taggingDialog, setTaggingDialog] = useState(null);
  const [taggingStatus, setTaggingStatus] = useState('idle');
  const [taggingStats, setTaggingStats] = useState({ success: 0, failed: 0, remaining: 0 });
  const [taggingCompletedAt, setTaggingCompletedAt] = useState('');
  const taggingTimerRef = useRef(null);
  const [taggingConfig, setTaggingConfig] = useState({
    range: '全部知识点',
    labelPool: ['产品', '营销', '风控', '服务', '门店', '合规'],
    structureAware: '开启',
  });
  const filteredRows = knowledgePointRows.filter((row) => {
    const keyword = query.trim().toLowerCase();
    const queryMatched = !keyword
      || row.title.toLowerCase().includes(keyword)
      || row.content.toLowerCase().includes(keyword)
      || row.source.toLowerCase().includes(keyword)
      || row.tag.toLowerCase().includes(keyword);
    if (!queryMatched) return false;
    if (statusFilter !== '全部状态' && row.status !== statusFilter) return false;
    if (sourceFilter !== '来源文件' && row.source !== sourceFilter) return false;
    if (tagFilter !== '标签' && row.tag !== tagFilter) return false;
    return true;
  });
  useEffect(() => () => {
    if (taggingTimerRef.current) window.clearTimeout(taggingTimerRef.current);
  }, []);
  const finishTagging = (stats) => {
    setTaggingStats(stats);
    setTaggingCompletedAt(formatTaggingTime(new Date()));
    setTaggingStatus('completed');
  };
  const startTagging = (nextConfig, stats, completeStats) => {
    if (taggingTimerRef.current) window.clearTimeout(taggingTimerRef.current);
    setTaggingConfig(nextConfig);
    setTaggingStats(stats);
    setTaggingCompletedAt('');
    setTaggingStatus('running');
    taggingTimerRef.current = window.setTimeout(() => finishTagging(completeStats), 4200);
  };
  const openTaggingDialog = () => {
    if (taggingStatus === 'running') setTaggingDialog('status');
    else if (taggingStatus === 'completed') setTaggingDialog('completed');
    else setTaggingDialog('settings');
  };
  const submitTagging = (nextConfig) => {
    startTagging(nextConfig, { success: 0, failed: 0, remaining: 3 }, { success: 2, failed: 1, remaining: 0 });
    setTaggingDialog(null);
  };
  const stopTagging = () => {
    if (taggingTimerRef.current) window.clearTimeout(taggingTimerRef.current);
    setTaggingStatus('idle');
    setTaggingStats({ success: 0, failed: 0, remaining: 0 });
    setTaggingCompletedAt('');
    setTaggingDialog(null);
  };
  const reopenTaggingSettings = () => setTaggingDialog('settings');

  return (
    <>
      <div className="knowledge-result-page">
        <aside className="knowledge-category-panel panel">
          <div className="knowledge-category-title">知识类目</div>
          {knowledgePointCategories.map((category) => (
            <button
              type="button"
              key={category.id}
              className={`knowledge-category-item ${selectedCategory === category.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category.id)}
            >
              <span>{category.name}</span>
              <strong>{category.count}</strong>
            </button>
          ))}
        </aside>
        <section className="knowledge-main">
          <PageHeader
            title="知识点"
            actions={<span className="project-space-label">项目空间：奶茶品牌</span>}
          />
          <Toolbar className="knowledge-toolbar">
            <button type="button" className="primary"><PlusOutlined /> 新增知识点</button>
            <button
              type="button"
              className={`tagging-button ${taggingStatus === 'running' ? 'running' : ''} ${taggingStatus === 'completed' ? 'completed' : ''}`.trim()}
              onClick={openTaggingDialog}
            >
              {taggingStatus === 'running' ? <SyncOutlined /> : taggingStatus === 'completed' ? <CheckCircleOutlined /> : <StarOutlined />}
              {taggingStatus === 'running' ? (
                <>
                  <span>打标中</span>
                  <em>成功{taggingStats.success}、失败{taggingStats.failed}、剩余{taggingStats.remaining}</em>
                </>
              ) : taggingStatus === 'completed' ? (
                <>
                  <span>打标完成</span>
                  <em>成功{taggingStats.success}、失败{taggingStats.failed}</em>
                </>
              ) : <span>知识点打标</span>}
            </button>
            <SearchBox value={query} onChange={setQuery} placeholder="搜索知识点名称/内容" />
            <SelectField value={statusFilter} onChange={setStatusFilter}>
              <option>全部状态</option>
              <option>启用</option>
              <option>停用</option>
            </SelectField>
            <SelectField value={sourceFilter} onChange={setSourceFilter}>
              <option>来源文件</option>
              <option>喜茶.docx</option>
              <option>瑞幸.docx</option>
              <option>合规手册.md</option>
            </SelectField>
            <SelectField value={tagFilter} onChange={setTagFilter}>
              <option>标签</option>
              <option>产品</option>
              <option>营销</option>
              <option>风控</option>
            </SelectField>
          </Toolbar>
          <section className="panel knowledge-table-panel">
            <table className="data-table knowledge-table">
              <colgroup>
                <col className="knowledge-col-expand" />
                <col className="knowledge-col-title" />
                <col className="knowledge-col-content" />
                <col className="knowledge-col-source" />
                <col className="knowledge-col-tag" />
                <col className="knowledge-col-status" />
                <col className="knowledge-col-time" />
                <col className="knowledge-col-action" />
              </colgroup>
              <thead>
                <tr>
                  <th />
                  <th>知识点名称/标题</th>
                  <th>知识点内容</th>
                  <th>来源文件</th>
                  <th>标签</th>
                  <th>状态</th>
                  <th>更新时间</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row) => (
                  <tr key={row.id}>
                    <td className="knowledge-expand-cell"><RightChevron /></td>
                    <td className="strong">{row.title}</td>
                    <td>{row.content}</td>
                    <td>{row.source}</td>
                    <td>{row.tag}</td>
                    <td><Badge tone={row.status === '启用' ? 'success' : 'neutral'}>{row.status}</Badge></td>
                    <td>{row.updatedAt}</td>
                    <td className="actions knowledge-actions">
                      <button type="button">编辑</button>
                      <button type="button">{row.status === '启用' ? '停用' : '启用'}</button>
                      <button type="button" title="更多"><MoreOutlined /></button>
                    </td>
                  </tr>
                ))}
                {filteredRows.length === 0 ? <tr><td colSpan={8} className="empty-table-cell">暂无匹配知识点</td></tr> : null}
              </tbody>
            </table>
            <div className="knowledge-pagination">
              <span>共 38 条</span>
              <button type="button">&lt;</button>
              <button type="button" className="active">1</button>
              <button type="button">2</button>
              <button type="button">3</button>
              <button type="button">4</button>
              <button type="button">&gt;</button>
              <button type="button" className="page-size">10 条/页</button>
            </div>
          </section>
        </section>
      </div>
      {taggingDialog === 'settings' ? (
        <KnowledgeTaggingSettingsModal
          config={taggingConfig}
          onClose={() => setTaggingDialog(null)}
          onSubmit={submitTagging}
        />
      ) : null}
      {taggingDialog === 'status' ? (
        <KnowledgeTaggingStatusModal
          config={taggingConfig}
          onClose={() => setTaggingDialog(null)}
          onStop={stopTagging}
          stats={taggingStats}
        />
      ) : null}
      {taggingDialog === 'completed' ? (
        <KnowledgeTaggingCompletedModal
          config={taggingConfig}
          stats={taggingStats}
          completedAt={taggingCompletedAt}
          onClose={() => setTaggingDialog(null)}
          onRetag={reopenTaggingSettings}
        />
      ) : null}
    </>
  );
}

function formatTaggingTime(date) {
  const pad = (value) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function KnowledgeTaggingSettingsModal({ config, onClose, onSubmit }) {
  const [draft, setDraft] = useState(config);
  const updateDraft = (patch) => setDraft((current) => ({ ...current, ...patch }));
  return (
    <Modal
      title="知识点批量打标设置"
      onClose={onClose}
      wide
      className="knowledge-tagging-modal"
      footer={(
        <>
          <button type="button" className="secondary" onClick={onClose}>取消</button>
          <button type="button" className="primary" onClick={() => onSubmit(draft)}>提交</button>
        </>
      )}
    >
      <p className="tagging-tip">选择要打标的知识点范围，确认打标规则，提交后系统会离线给知识点完成打标工作。</p>
      <section className="tagging-section">
        <h3>知识点范围</h3>
        <div className="tagging-option-grid">
          {['全部知识点', '标签为空的知识点', '标签为空的知识点+标签未更新的知识点'].map((item) => (
            <label key={item} className={`tagging-option ${draft.range === item ? 'active' : ''}`}>
              <input type="radio" checked={draft.range === item} onChange={() => updateDraft({ range: item })} />
              <span>{item}</span>
            </label>
          ))}
        </div>
      </section>
      <section className="tagging-section">
        <h3>打标设置</h3>
        <div className="tagging-form-row">
          <label>标签池</label>
          <div className="tagging-label-pool">
            {draft.labelPool.map((label) => <span key={label}>{label}</span>)}
          </div>
        </div>
        <div className="tagging-form-row">
          <label>结构感知打标</label>
          <div className="tagging-segment compact">
            {['开启', '关闭'].map((item) => (
              <button
                type="button"
                key={item}
                className={draft.structureAware === item ? 'active' : ''}
                onClick={() => updateDraft({ structureAware: item })}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </section>
    </Modal>
  );
}

function KnowledgeTaggingStatusModal({ config, stats, onClose, onStop }) {
  return (
    <Modal
      title="知识点打标状态"
      onClose={onClose}
      wide
      className="knowledge-tagging-modal"
      footer={(
        <>
          <button type="button" className="secondary" onClick={onClose}>关闭弹窗</button>
          <button type="button" className="danger-button" onClick={onStop}>停止打标</button>
        </>
      )}
    >
      <section className="tagging-status-card">
        <div>
          <label>打标状态</label>
          <strong><SyncOutlined /> 打标中</strong>
        </div>
        <div>
          <label>执行进度</label>
          <span>成功 {stats.success} · 失败 {stats.failed} · 剩余 {stats.remaining}</span>
        </div>
      </section>
      <section className="tagging-section readonly">
        <h3>打标配置</h3>
        <div className="tagging-readonly-grid">
          <div><label>知识点范围</label><strong>{config.range}</strong></div>
          <div><label>结构感知打标</label><strong>{config.structureAware}</strong></div>
          <div className="wide"><label>标签池</label><div className="tagging-label-pool">{config.labelPool.map((label) => <span key={label}>{label}</span>)}</div></div>
        </div>
      </section>
    </Modal>
  );
}

function KnowledgeTaggingCompletedModal({ config, stats, completedAt, onClose, onRetag }) {
  return (
    <Modal
      title="知识点打标状态"
      onClose={onClose}
      wide
      className="knowledge-tagging-modal"
      footer={(
        <>
          <button type="button" className="secondary" onClick={onClose}>关闭弹窗</button>
          <button type="button" className="secondary" onClick={onRetag}>继续打标</button>
        </>
      )}
    >
      <section className="tagging-status-card completed">
        <div>
          <label>打标状态</label>
          <strong><CheckCircleOutlined /> 打标完成</strong>
        </div>
        <div>
          <label>执行结果</label>
          <span>成功 {stats.success} · 失败 {stats.failed}</span>
        </div>
        <div>
          <label>完成时间</label>
          <span>{completedAt || '-'}</span>
        </div>
      </section>
      <section className="tagging-section readonly">
        <h3>打标配置</h3>
        <div className="tagging-readonly-grid">
          <div><label>知识点范围</label><strong>{config.range}</strong></div>
          <div><label>结构感知打标</label><strong>{config.structureAware}</strong></div>
          <div className="wide"><label>标签池</label><div className="tagging-label-pool">{config.labelPool.map((label) => <span key={label}>{label}</span>)}</div></div>
        </div>
      </section>
    </Modal>
  );
}

function McpServicePage({ notify }) {
  const [services, setServices] = useState(loadServices);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailService, setDetailService] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState(null);
  const [pendingDisable, setPendingDisable] = useState(null);

  const persist = (next) => {
    setServices(next);
    saveServices(next);
  };

  const openCreate = () => {
    setEditingId(null);
    setDraft(createEmptyServiceDraft());
    setDialogOpen(true);
  };

  const openEdit = (service) => {
    if (service.locked) {
      notify('系统内置 MCP Server 不允许修改连接信息', 'warning');
      return;
    }
    setEditingId(service.id);
    setDraft({
      name: service.name,
      serviceType: service.serviceType,
      transport: service.transport,
      endpoint: service.endpoint,
      authType: service.authType,
      authHeader: service.authType === 'API Key' ? 'x-api-key' : 'Authorization',
      authValue: '',
      version: service.version,
      description: service.description,
      configMode: 'simple',
      headers: service.authType === '无鉴权' ? [] : [{ id: 'header-1', key: service.authType === 'API Key' ? 'x-api-key' : 'Authorization', value: '' }],
      connectionTimeout: '60',
      sseReadTimeout: service.transport === 'SSE' ? '60' : '',
      jsonConfig: createEmptyServiceDraft().jsonConfig,
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingId(null);
    setDraft(null);
  };

  const updateDraft = (patch) => setDraft((current) => ({ ...current, ...patch }));
  const addHeader = () => updateDraft({ headers: [...draft.headers, { id: `header-${Date.now()}`, key: '', value: '' }] });
  const updateHeader = (id, patch) => updateDraft({ headers: draft.headers.map((header) => (header.id === id ? { ...header, ...patch } : header)) });
  const removeHeader = (id) => updateDraft({ headers: draft.headers.filter((header) => header.id !== id) });

  const toService = (serviceDraft, id = `svc-${Date.now()}`) => ({
    id,
    name: serviceDraft.name.trim(),
    serviceType: serviceDraft.serviceType,
    transport: serviceDraft.transport,
    endpoint: serviceDraft.endpoint.trim(),
    authType: serviceDraft.authType,
    version: serviceDraft.version.trim() || 'V1.0.0',
    description: serviceDraft.description.trim(),
    status: '连接中',
    toolCount: id.startsWith('svc-') ? 0 : 3,
    toolNames: [],
    tools: [],
    toolCategories: {},
    lastSyncedAt: '-',
  });

  const saveService = () => {
    if (!draft.name.trim()) {
      notify('服务名称不能为空', 'error');
      return;
    }
    if (draft.configMode === 'simple' && !draft.endpoint.trim()) {
      notify('MCP服务地址不能为空', 'error');
      return;
    }
    if (draft.configMode === 'json' && !draft.jsonConfig.trim()) {
      notify('JSON配置不能为空', 'error');
      return;
    }
    if (editingId) {
      persist(services.map((item) => (
        item.id === editingId
          ? {
              ...item,
              ...toService(draft, editingId),
              toolCount: item.toolCount,
              toolNames: item.toolNames,
              tools: item.tools,
              toolCategories: item.toolCategories,
              lastSyncedAt: item.lastSyncedAt,
              status: '连接中',
            }
          : item
      )));
      notify('MCP 服务已更新', 'success');
    } else {
      persist([...services, { ...toService(draft), toolCount: 0 }]);
      notify('MCP 服务已接入', 'success');
    }
    closeDialog();
  };

  const syncOneService = (service) => {
    if (service.locked) {
      notify('系统内置 MCP Server 由平台自动维护，无需手动同步', 'info');
      return;
    }
    if (service.status === '停用') {
      notify('请先启用 MCP 服务，再刷新连接', 'warning');
      return;
    }
    const nextService = syncService(service);
    persist(services.map((item) => (item.id === service.id ? nextService : item)));
    notify(nextService.status === '连接失败' ? 'MCP Server同步失败' : 'MCP Server同步成功', nextService.status === '连接失败' ? 'error' : 'success');
  };

  const handleToggle = (service) => {
    if (service.locked) {
      notify('系统内置 MCP Server 不允许停用', 'warning');
      return;
    }
    if (service.status !== '停用') {
      setPendingDisable(service);
      return;
    }
    persist(services.map((item) => (item.id === service.id ? { ...item, status: '连接中' } : item)));
    notify('MCP 服务已启用，正在检查连接', 'success');
  };

  const handleDelete = (service) => {
    if (service.locked) {
      notify('系统内置 MCP Server 不允许删除', 'warning');
      return;
    }
    persist(services.filter((item) => item.id !== service.id));
    notify('MCP 服务已删除', 'success');
  };

  const formatSyncTime = (value) => {
    if (!value || value === '-') return '未同步';
    const [datePart, timePart = ''] = value.split(' ');
    const [year, month, day] = datePart.split('-');
    if (!year || !month || !day) return value;
    return `${year}年${Number(month)}月${Number(day)}日 ${timePart}`;
  };

  return (
    <>
      <PageHeader
        title="MCP服务管理"
        subtitle="接入 Nacos 或客户自建 MCP Server，只要符合标准MCP协议，就支持接入和使用。"
        actions={<button type="button" className="primary" onClick={openCreate}><PlusOutlined /> 接入MCP服务</button>}
      />
      <section className="panel table-panel">
        <table className="data-table">
          <thead>
            <tr><th>服务名称</th><th>协议</th><th>服务地址</th><th>状态</th><th>工具数</th><th>最近检查/同步</th><th>操作</th></tr>
          </thead>
          <tbody>
            {services.map((service) => (
              <tr key={service.id}>
                <td className="strong">{service.name}</td>
                <td><Badge tone="blue">{service.transport}</Badge></td>
                <td title={service.endpoint}>{service.endpoint}</td>
                <td>
                  <span className="status-inline">
                    <Badge tone={service.status === '连接正常' ? 'success' : service.status === '连接失败' ? 'danger' : service.status === '连接中' ? 'warning' : 'neutral'}>{service.status}</Badge>
                    {service.status !== '停用' ? (
                      <button type="button" className="mini-icon" disabled={service.locked} onClick={() => syncOneService(service)} title={service.locked ? '系统内置服务自动维护' : 'MCP Server同步'}><SyncOutlined /></button>
                    ) : null}
                  </span>
                </td>
                <td><span>{service.toolCount} 个</span><button type="button" className="mini-icon" onClick={() => setDetailService(service)} title="查看工具列表"><SearchOutlined /></button></td>
                <td>{service.status === '连接中' ? '检查中' : service.lastSyncedAt}</td>
                <td className="actions">
                  <button type="button" onClick={() => handleToggle(service)} disabled={service.locked}>{service.status === '停用' ? '启用' : '停用'}</button>
                  <button type="button" disabled={service.locked} onClick={() => openEdit(service)}>编辑</button>
                  <button type="button" disabled={service.locked} className="danger-link" onClick={() => handleDelete(service)}>删除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      {dialogOpen && draft ? (
        <Modal
          title={editingId ? '编辑MCP服务' : '接入MCP服务'}
          onClose={closeDialog}
          wide
          footer={(
            <>
              <button type="button" className="secondary" onClick={closeDialog}>取消</button>
              <button type="button" className="primary" onClick={saveService}>{editingId ? '保存' : '确认接入'}</button>
            </>
          )}
        >
          <Field label="服务名称" required><input value={draft.name} onChange={(event) => updateDraft({ name: event.target.value })} /></Field>
          <p className="field-help">支持中英文、数字、空格和下划线，不能以下划线开头。</p>
          <Field label="服务描述"><textarea maxLength={200} value={draft.description} onChange={(event) => updateDraft({ description: event.target.value })} /></Field>
          <p className="field-help">{draft.description.length}/200</p>
          <div className="config-tabs">
            <button type="button" className={draft.configMode === 'simple' ? 'active' : ''} onClick={() => updateDraft({ configMode: 'simple' })}>简易配置</button>
            <button type="button" className={draft.configMode === 'json' ? 'active' : ''} onClick={() => updateDraft({ configMode: 'json' })}>JSON配置</button>
          </div>
          {draft.configMode === 'simple' ? (
            <div className="dialog-stack">
              <Field label="MCP连接协议类型">
                <SelectField value={draft.transport} onChange={(value) => updateDraft({ transport: value })}>
                  <option>SSE</option>
                  <option>Streamable HTTP</option>
                </SelectField>
              </Field>
              <Field label="MCP服务地址" required>
                <input value={draft.endpoint} placeholder={draft.transport === 'SSE' ? 'https://example.com/mcp/sse' : 'https://example.com/mcp'} onChange={(event) => updateDraft({ endpoint: event.target.value })} />
              </Field>
              <section className="headers-box">
                <div className="headers-head"><strong>Headers</strong><button type="button" onClick={addHeader}><PlusOutlined /> 添加</button></div>
                {draft.headers.length === 0 ? <p>暂无 Headers，可按需添加变量 Key 和变量 Value。</p> : draft.headers.map((header) => (
                  <div className="header-row" key={header.id}>
                    <input placeholder="变量Key" value={header.key} onChange={(event) => updateHeader(header.id, { key: event.target.value })} />
                    <input placeholder="变量Value" value={header.value} onChange={(event) => updateHeader(header.id, { value: event.target.value })} />
                    <button type="button" className="danger-link" onClick={() => removeHeader(header.id)}><DeleteOutlined /></button>
                  </div>
                ))}
              </section>
              <div className={draft.transport === 'SSE' ? 'form-grid' : ''}>
                <Field label="最大连接时长(s)"><input value={draft.connectionTimeout} onChange={(event) => updateDraft({ connectionTimeout: event.target.value })} /></Field>
                {draft.transport === 'SSE' ? <Field label="SSE超时时长(s)"><input value={draft.sseReadTimeout} onChange={(event) => updateDraft({ sseReadTimeout: event.target.value })} /></Field> : null}
              </div>
            </div>
          ) : (
            <Field label="JSON" required><textarea className="code-textarea" value={draft.jsonConfig} onChange={(event) => updateDraft({ jsonConfig: event.target.value })} /></Field>
          )}
        </Modal>
      ) : null}
      {detailService ? (
        <Drawer title="工具列表" onClose={() => setDetailService(null)} wide>
          <p className="drawer-subtitle">{detailService.name} · 共 {detailService.toolCount} 个工具 · 最近同步于 {formatSyncTime(detailService.lastSyncedAt)}</p>
          <section className="panel table-panel drawer-table">
            <table className="data-table compact-table">
              <thead><tr><th>工具名称</th><th>工具描述</th></tr></thead>
              <tbody>
                {detailService.tools.map((tool) => (
                  <tr key={tool.name}>
                    <td className="strong">{tool.name}</td>
                    <td>{tool.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </Drawer>
      ) : null}
      {pendingDisable ? (
        <ConfirmDialog
          danger
          title="确认停用 MCP 服务"
          message={`停用后，Agent 和流程引擎将不能继续发现和调用「${pendingDisable.name}」下的工具。已发布流程如果依赖这些工具，执行时可能失败。`}
          onCancel={() => setPendingDisable(null)}
          onConfirm={() => {
            persist(services.map((item) => (item.id === pendingDisable.id ? { ...item, status: '停用' } : item)));
            setPendingDisable(null);
            notify('MCP 服务已停用', 'warning');
          }}
        />
      ) : null}
    </>
  );
}

function ToolSchemaCard({ tool }) {
  const inputRows = tool.inputs || [];
  const outputRows = tool.outputs || [];
  return (
    <section className="schema-card">
      <div className="schema-head">
        <strong>{tool.name}</strong>
        <Badge tone={tool.status === '可用' ? 'success' : 'neutral'}>{tool.category || '未分类'}</Badge>
      </div>
      <p>{tool.description}</p>
      <div className="schema-columns">
        <div>
          <label>入参</label>
          {inputRows.length ? inputRows.map((item) => (
            <span className="schema-item" key={item.name}>
              <strong>{item.name}</strong>
              <em>{item.type || 'text'}</em>
              {item.required ? <b>必填</b> : null}
              {item.desc || item.description ? <small>{item.desc || item.description}</small> : null}
            </span>
          )) : <span className="empty-schema">暂无入参</span>}
        </div>
        <div>
          <label>出参</label>
          {outputRows.length ? outputRows.map((item) => (
            <span className="schema-item" key={item.name}>
              <strong>{item.name}</strong>
              <em>{item.type || item.path || 'object'}</em>
              {item.desc || item.description ? <small>{item.desc || item.description}</small> : null}
            </span>
          )) : <span className="empty-schema">暂无出参</span>}
        </div>
      </div>
    </section>
  );
}

function ToolManagementPage({ notify }) {
  const [snapshot, setSnapshot] = useState(() => normalizeToolSnapshot(readCatalog()));
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(allToolsCategory);
  const [categoryDraft, setCategoryDraft] = useState(null);
  const [categoryDeleteDialog, setCategoryDeleteDialog] = useState(null);
  const [toolDisableDialog, setToolDisableDialog] = useState(null);
  const [detailTool, setDetailTool] = useState(null);
  const [createDraft, setCreateDraft] = useState(null);

  useEffect(() => subscribeCatalog(() => setSnapshot(normalizeToolSnapshot(readCatalog()))), []);

  useEffect(() => {
    setDetailTool((current) => (current ? snapshot.tools.find((tool) => tool.id === current.id) || null : null));
  }, [snapshot.tools]);

  const persist = (tools, categories = snapshot.categories) => {
    const next = { tools, categories };
    setSnapshot(next);
    saveCatalog(tools, categories);
  };

  const categoryCounts = useMemo(() => {
    const counts = {};
    snapshot.tools.forEach((tool) => {
      counts[tool.category] = (counts[tool.category] || 0) + 1;
    });
    return counts;
  }, [snapshot.tools]);

  const filteredTools = useMemo(() => snapshot.tools.filter((tool) => {
    if (selectedCategory !== allToolsCategory && tool.category !== selectedCategory) return false;
    if (!query.trim()) return true;
    const keyword = query.trim().toLowerCase();
    return tool.name.toLowerCase().includes(keyword)
      || tool.description.toLowerCase().includes(keyword)
      || tool.sourceToolName?.toLowerCase().includes(keyword)
      || tool.sourceServiceName?.toLowerCase().includes(keyword);
  }), [query, selectedCategory, snapshot.tools]);

  const rawSources = useMemo(() => listRawMcpTools(loadServices()), [snapshot.tools.length]);
  const detailRawSource = detailTool ? rawSources.find((source) => (
    source.serviceId === detailTool.sourceServiceId
    && source.tool?.name === detailTool.sourceToolName
  )) : null;

  const openCreateCategory = () => setCategoryDraft({ name: '', oldName: null });
  const openEditCategory = (category) => setCategoryDraft({ name: category, oldName: category });

  const saveCategory = () => {
    const name = categoryDraft?.name?.trim();
    if (!name) {
      notify('节点类型名称不能为空', 'error');
      return;
    }
    if (categoryDraft.oldName) {
      if (categoryDraft.oldName !== name && snapshot.categories.includes(name)) {
        notify('节点类型名称已存在', 'error');
        return;
      }
      const categoriesNext = snapshot.categories.map((item) => (item === categoryDraft.oldName ? name : item));
      const toolsNext = snapshot.tools.map((tool) => (tool.category === categoryDraft.oldName ? { ...tool, category: name } : tool));
      persist(toolsNext, categoriesNext);
      setSelectedCategory((current) => (current === categoryDraft.oldName ? name : current));
      notify('节点类型已更新', 'success');
    } else if (snapshot.categories.includes(name)) {
      notify('节点类型名称已存在', 'error');
      return;
    } else {
      persist(snapshot.tools, [...snapshot.categories, name]);
      notify('节点类型已新增', 'success');
    }
    setCategoryDraft(null);
  };

  const deleteCategory = (category) => {
    if ((categoryCounts[category] || 0) > 0) {
      setCategoryDeleteDialog({ type: 'blocked', category });
      return;
    }
    setCategoryDeleteDialog({ type: 'confirm', category });
  };

  const confirmDeleteCategory = (category) => {
    const categoriesNext = snapshot.categories.filter((item) => item !== category);
    persist(snapshot.tools, categoriesNext);
    setSelectedCategory(allToolsCategory);
    setCategoryDeleteDialog(null);
    notify('节点类型已删除', 'success');
  };

  const openCreateTool = () => {
    const firstSource = rawSources.find(hasOutputSchema);
    setCreateDraft(makeKnowledgeToolDraft(firstSource, snapshot.categories[1] || snapshot.categories[0] || '未分类'));
  };

  const openEditTool = (tool) => {
    if (tool.enabled) {
      notify('请先停用流程节点，再编辑', 'warning');
      return;
    }
    setCreateDraft(makeKnowledgeToolEditDraft(tool));
  };

  const deleteTool = (tool) => {
    if (tool.enabled) {
      notify('请先停用流程节点，再删除', 'warning');
      return;
    }
    if (tool.kind === '内置工具') {
      notify('内置工具不允许删除', 'warning');
      return;
    }
    if (!window.confirm(`确定删除流程节点「${tool.name}」吗？`)) return;
    persist(snapshot.tools.filter((item) => item.id !== tool.id));
    notify('流程节点已删除', 'success');
  };

  const toggleToolEnabled = (tool) => {
    if (tool.enabled) {
      const references = dataStore.getFormalPlanReferencesByToolId(tool.id);
      if (references.spaceCount > 0) {
        setToolDisableDialog({ type: 'blocked', tool, references });
        return;
      }
      setToolDisableDialog({ type: 'confirm', tool });
      return;
    }
    persist(snapshot.tools.map((item) => (item.id === tool.id ? {
      ...item,
      enabled: true,
      status: '可用',
      updatedAt: nowText(),
    } : item)));
    notify('流程节点已启用', 'success');
  };

  const confirmDisableTool = (tool) => {
    persist(snapshot.tools.map((item) => (item.id === tool.id ? {
      ...item,
      enabled: false,
      status: '不可用',
      updatedAt: nowText(),
    } : item)));
    setToolDisableDialog(null);
    notify('流程节点已停用', 'success');
  };

  const saveKnowledgeTool = () => {
    for (let step = 0; step < 3; step += 1) {
      const errorMessage = getKnowledgeToolDraftStepError(createDraft, step);
      if (errorMessage) {
        notify(errorMessage, 'error');
        return;
      }
    }
    const overrides = {
      name: createDraft.name,
      description: createDraft.description,
      category: createDraft.category,
      inputArtifacts: createDraft.inputArtifacts,
      inputs: createDraft.inputs,
      outputs: createDraft.outputs,
      parameterMappingCode: createDraft.parameterMappingCode,
      storageRules: createDraft.storageRules,
      standardizationCode: createDraft.standardizationCode,
      indexConfig: createDraft.indexConfig,
      exceptionRules: createDraft.exceptionRules,
    };
    if (createDraft.id) {
      persist(snapshot.tools.map((tool) => (tool.id === createDraft.id ? applyKnowledgeToolDraft(tool, overrides) : tool)));
      notify('流程节点已更新', 'success');
    } else {
      const source = rawSources.find((item) => item.id === createDraft.sourceId);
      if (!source) {
        notify('来源 MCP 工具不存在，请重新同步后再试', 'error');
        return;
      }
      if (!hasOutputSchema(source)) {
        notify('该 MCP 原始工具缺失 Output Schema，暂不支持注册为流程节点', 'error');
        return;
      }
      const nextTool = {
        ...createKnowledgeToolFromRaw(source, overrides),
        inputArtifacts: overrides.inputArtifacts || [],
        exceptionRules: overrides.exceptionRules || [],
        createdBy: '系统管理员',
        updatedAt: nowText(),
      };
      persist([...snapshot.tools, nextTool]);
      notify('流程节点已创建', 'success');
    }
    setCreateDraft(null);
  };

  return (
    <>
      <PageHeader title="流程节点管理" subtitle="把原始 MCP 工具标准化为知识处理流程节点，用于 Pipeline 编排和 Agent 选用。" />
      <div className="split-layout">
        <aside className="category-sidebar panel">
          <div className="side-head"><strong>节点类型</strong><button type="button" title="新增节点类型" onClick={openCreateCategory}><PlusOutlined /></button></div>
          <button type="button" className={`category-button ${selectedCategory === allToolsCategory ? 'active' : ''}`} onClick={() => setSelectedCategory(allToolsCategory)}>
            <span>全部</span><Badge>{snapshot.tools.length}</Badge>
          </button>
          {snapshot.categories.map((category) => (
            <button type="button" key={category} className={`category-button category-row ${selectedCategory === category ? 'active' : ''}`} onClick={() => setSelectedCategory(category)}>
              <span className="category-name">{category}</span>
              <Badge>{categoryCounts[category] || 0}</Badge>
              <span className="category-inline-actions" onClick={(event) => event.stopPropagation()}>
                <span role="button" tabIndex={0} title="编辑节点类型" onClick={() => openEditCategory(category)}><EditOutlined /></span>
                <span role="button" tabIndex={0} title="删除节点类型" className="danger-link" onClick={() => deleteCategory(category)}><DeleteOutlined /></span>
              </span>
            </button>
          ))}
        </aside>
        <section className="panel table-panel standard-tool-panel">
          <Toolbar className="standard-tool-toolbar">
            <SearchBox value={query} onChange={setQuery} placeholder="节点名、描述、原始MCP工具的名称、描述" />
            <button type="button" className="primary" onClick={openCreateTool}><PlusOutlined /> 新建流程节点</button>
          </Toolbar>
          <table className="data-table standard-tool-table">
            <colgroup>
              <col className="standard-tool-col-name" />
              <col className="standard-tool-col-source" />
              <col className="standard-tool-col-status" />
              <col className="standard-tool-col-owner" />
              <col className="standard-tool-col-updated" />
              <col className="standard-tool-col-action" />
            </colgroup>
            <thead>
              <tr>
                <th>节点名称</th>
                <th>来源工具</th>
                <th>状态</th>
                <th>创建人</th>
                <th>最近更新</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredTools.map((tool) => (
                <tr key={tool.id}>
                  <td>
                    <div className="standard-tool-name-cell">
                      <strong>{tool.name}</strong>
                    </div>
                  </td>
                  <td title={`${tool.sourceServiceName || tool.serviceName || '-'} / ${tool.sourceToolName || '-'}`}>{tool.sourceServiceName || tool.serviceName || '-'} / {tool.sourceToolName || '-'}</td>
                  <td><Badge tone={tool.enabled ? 'success' : 'neutral'}>{tool.enabled ? '启用' : '停用'}</Badge></td>
                  <td>{tool.createdBy || '系统管理员'}</td>
                  <td>{tool.updatedAt || tool.lastModifiedAt || tool.lastSyncedAt || '-'}</td>
                  <td className="actions standard-tool-actions">
                    <button type="button" onClick={() => setDetailTool(tool)}>详情</button>
                    <button type="button" onClick={() => toggleToolEnabled(tool)}>{tool.enabled ? '停用' : '启用'}</button>
                    <button type="button" disabled={tool.enabled} onClick={() => openEditTool(tool)}>编辑</button>
                    <button type="button" disabled={tool.enabled} className="danger-link" onClick={() => deleteTool(tool)}>删除</button>
                  </td>
                </tr>
              ))}
              {filteredTools.length === 0 ? <tr><td colSpan={6} className="empty-table-cell">暂无匹配工具</td></tr> : null}
            </tbody>
          </table>
        </section>
      </div>
      {categoryDraft ? (
        <Modal
          title={categoryDraft.oldName ? '编辑节点类型' : '新增节点类型'}
          onClose={() => setCategoryDraft(null)}
          footer={<><button type="button" className="secondary" onClick={() => setCategoryDraft(null)}>取消</button><button type="button" className="primary" onClick={saveCategory}>保存</button></>}
        >
          <Field label="节点类型名称" required><input value={categoryDraft.name} onChange={(event) => setCategoryDraft({ ...categoryDraft, name: event.target.value })} /></Field>
        </Modal>
      ) : null}
      {categoryDeleteDialog?.type === 'blocked' ? (
        <ConfirmDialog
          title="无法删除节点类型"
          message="当前节点类型下存在流程节点，请先迁移或删除分类下节点后再删除分类"
          cancelText=""
          confirmText="知道了"
          onCancel={() => setCategoryDeleteDialog(null)}
          onConfirm={() => setCategoryDeleteDialog(null)}
        />
      ) : null}
      {categoryDeleteDialog?.type === 'confirm' ? (
        <ConfirmDialog
          danger
          title="删除节点类型"
          message={`确定删除节点类型「${categoryDeleteDialog.category}」吗？`}
          confirmText="确定删除"
          onCancel={() => setCategoryDeleteDialog(null)}
          onConfirm={() => confirmDeleteCategory(categoryDeleteDialog.category)}
        />
      ) : null}
      {toolDisableDialog?.type === 'blocked' ? (
        <ConfirmDialog
          title="无法停用流程节点"
          message={`当前节点已被${toolDisableDialog.references.spaceCount}个知识空间的处理方案引用，禁止停用。`}
          cancelText=""
          confirmText="知道了"
          onCancel={() => setToolDisableDialog(null)}
          onConfirm={() => setToolDisableDialog(null)}
        />
      ) : null}
      {toolDisableDialog?.type === 'confirm' ? (
        <ConfirmDialog
          title="停用流程节点"
          message="节点停用后，运营端配置处理方案将无法使用此节点，确定停用？"
          confirmText="确定停用"
          onCancel={() => setToolDisableDialog(null)}
          onConfirm={() => confirmDisableTool(toolDisableDialog.tool)}
        />
      ) : null}
      {createDraft ? (
        <KnowledgeToolCreateModal
          draft={createDraft}
          setDraft={setCreateDraft}
          sources={rawSources}
          categories={snapshot.categories}
          onClose={() => setCreateDraft(null)}
          onSave={saveKnowledgeTool}
          notify={notify}
        />
      ) : null}
      {detailTool ? (
        <Drawer title="节点详情" onClose={() => setDetailTool(null)} className="node-detail-drawer">
          <NodeDetailBasicInfo tool={detailTool} rawSource={detailRawSource} />
          <NodeInputMappingDetail tool={detailTool} rawSource={detailRawSource} />
          <NodeOutputMappingDetail tool={detailTool} rawSource={detailRawSource} />
        </Drawer>
      ) : null}
    </>
  );
}

function makeKnowledgeToolDraft(source, category) {
  const firstOutputName = source?.tool?.outputs?.[0]?.name || '';
  return {
    id: null,
    sourceId: source?.id || '',
    selectedMcpId: source?.serviceId || '',
    mode: 'create',
    step: 0,
    name: source?.tool?.name || '',
    description: source?.tool?.description || '',
    category,
    inputArtifacts: createDefaultInputArtifacts(source?.tool?.inputs || []),
    inputs: normalizeDraftInputs(source?.tool?.inputs || []),
    outputs: normalizeDraftOutputs(source?.tool?.outputs || []),
    storageRules: [createOutputRule(firstOutputName)],
    standardizationCode: createDefaultStandardizationCode(firstOutputName),
    parameterMappingCode: createDefaultParameterMappingCode(source?.tool?.inputs || []),
    indexConfig: createIndexConfig(firstOutputName),
    exceptionRules: createDefaultExceptionRules(),
  };
}

function hasOutputSchema(source) {
  return Boolean(source?.tool?.outputs?.length);
}

function makeKnowledgeToolEditDraft(tool) {
  const hasStorageRule = tool.storageContract?.enabled === false
    ? false
    : Boolean(
      tool.storageContract?.enabled
      || tool.storageContract?.rules?.length
      || tool.storageContract?.outputName
      || tool.storageContract?.artifactType
    );
  return {
    id: tool.id,
    sourceId: `${tool.sourceServiceId || tool.serviceId}-${tool.sourceToolName || tool.name}`,
    selectedMcpId: tool.sourceServiceId || tool.serviceId || '',
    mode: 'edit',
    step: 0,
    sourceLabel: `${tool.sourceServiceName || tool.serviceName || '-'} / ${tool.sourceToolName || '-'}`,
    name: tool.name || '',
    description: tool.description || '',
    category: tool.category || '未分类',
    inputArtifacts: normalizeInputArtifacts(tool.inputArtifacts || [], tool.inputs || []),
    inputs: normalizeDraftInputs(tool.inputs || []),
    outputs: normalizeDraftOutputs(tool.outputs || []),
    storageRules: hasStorageRule ? normalizeStorageRules(tool.storageContract, tool.outputs || []).slice(0, 1) : [],
    standardizationCode: tool.storageContract?.standardizationCode || createDefaultStandardizationCode(tool.storageContract?.outputName || tool.outputs?.[0]?.name || ''),
    parameterMappingCode: tool.parameterMappingCode || createDefaultParameterMappingCode(tool.inputs || []),
    indexConfig: normalizeIndexConfig(tool.storageContract, tool.outputs || []),
    exceptionRules: normalizeExceptionRules(tool.exceptionRules || []),
  };
}

function applyKnowledgeToolDraft(tool, draft) {
  return {
    ...tool,
    name: draft.name?.trim() || tool.name,
    description: draft.description?.trim() || tool.description,
    category: draft.category || tool.category,
    inputArtifacts: draft.inputArtifacts || tool.inputArtifacts || [],
    inputs: draft.inputs || tool.inputs,
    outputs: draft.outputs || tool.outputs,
    parameterMappingCode: draft.parameterMappingCode || tool.parameterMappingCode || '',
    storageContract: buildStorageContractFromRules(draft.storageRules || [], draft.indexConfig, tool.storageContract, draft.standardizationCode),
    exceptionRules: draft.exceptionRules || tool.exceptionRules || [],
    updatedAt: nowText(),
  };
}

function createInputArtifact(input) {
  return {
    id: makeId('input-artifact'),
    name: input?.name || 'input',
    displayName: input?.displayName || input?.name || '输入',
    type: input?.type || 'object',
    artifactType: inferInputArtifactType(input?.type),
    sourcePath: input?.name || '',
    sourceName: input?.name || '',
    description: input?.description || '',
  };
}

function createEmptyInputArtifact() {
  return {
    id: makeId('input-artifact'),
    name: '',
    displayName: '',
    type: 'string',
    artifactType: '',
    sourcePath: '',
    sourceName: '',
    description: '',
  };
}

function inferInputArtifactType(type = 'object') {
  const normalized = normalizeDataType(type);
  return inputArtifactTypeOptions.find((option) => normalizeDataType(option.type) === normalized)?.value || 'object';
}

function createDefaultInputArtifacts(inputs = []) {
  const selected = inputs.find((input) => input.required) || inputs[0];
  return selected ? [createInputArtifact(selected)] : [];
}

function normalizeInputArtifacts(artifacts = [], inputs = []) {
  if (artifacts.length) return artifacts.map((artifact) => {
    const sourceInput = inputs.find((input) => input.name === artifact.sourceName);
    return {
      ...createInputArtifact(sourceInput),
      ...artifact,
      displayName: artifact.displayName || artifact.label || artifact.name || sourceInput?.name || '',
      type: artifact.type || sourceInput?.type || inputArtifactTypeOptions.find((option) => option.value === artifact.artifactType)?.type || 'string',
      artifactType: artifact.artifactType || inferInputArtifactType(sourceInput?.type),
      id: artifact.id || makeId('input-artifact'),
    };
  });
  return createDefaultInputArtifacts(inputs);
}

function createDefaultExceptionRules() {
  return [
    { id: makeId('exception-timeout'), type: '超时', timeoutSeconds: 60, errorPath: '', errorMessage: '', action: '终止流程' },
    { id: makeId('exception-error'), type: '工具报错', timeoutSeconds: '', errorPath: 'error.message', errorMessage: '工具返回错误', action: '终止流程' },
  ];
}

function normalizeExceptionRules(rules = []) {
  return rules.length ? rules.map((rule) => ({ ...rule, id: rule.id || makeId('exception-rule') })) : createDefaultExceptionRules();
}

function normalizeDraftInputs(inputs = []) {
  return inputs.map((input) => ({
    ...input,
    displayName: input.displayName || input.label || input.name || '',
    sourceName: input.sourceName || input.source || input.name || '',
    exposed: input.exposed ?? true,
  }));
}

function normalizeDraftOutputs(outputs = []) {
  return outputs.map((output) => ({
    ...output,
    displayName: output.displayName || output.label || output.name || '',
    type: output.type || 'string',
    codeOutput: output.codeOutput || output.path || output.name || '',
    artifactType: output.artifactType || inferInputArtifactType(output.type),
    sourceType: output.sourceType || 'mcpReturn',
  }));
}

function inferArtifactType(outputName = '') {
  const value = outputName.toLowerCase();
  if (value.includes('parent') || value.includes('child') || value.includes('chunk')) return value.includes('parent') || value.includes('child') ? '父子切片' : '文本切片';
  if (value.includes('qa')) return 'QA对';
  if (value.includes('section') || value.includes('paragraph')) return '解析文档';
  if (value.includes('summary') || value.includes('knowledge')) return '知识点';
  if (value.includes('metadata') || value.includes('stats')) return '元数据';
  return '原始结果';
}

function createFieldExample(outputName = '') {
  const value = outputName.toLowerCase();
  if (value.includes('qa')) return { indexField: 'question', recallField: 'answer', filterFields: 'sourceChunkId' };
  if (value.includes('parent')) return { indexField: 'text', recallField: 'text', filterFields: 'documentId,parentChunkId' };
  if (value.includes('child') || value.includes('chunk')) return { indexField: 'text', recallField: 'text', filterFields: 'documentId,page,parentChunkId' };
  if (value.includes('section') || value.includes('paragraph')) return { indexField: 'content', recallField: 'content', filterFields: 'documentId,page' };
  return { indexField: 'content', recallField: 'content', filterFields: 'documentId' };
}

function createDefaultStandardizationCode(outputName = 'result') {
  const target = outputName || 'result';
  return `function transform(mcpResult) {
  return {
    ${target}: mcpResult.${target} || mcpResult
  };
}`;
}

function createDefaultParameterMappingCode(inputs = []) {
  const firstInput = inputs[0]?.name || 'input';
  return `function mapParams(context) {
  return {
    ${firstInput}: context.${firstInput} || context.input
  };
}`;
}

const knowledgeShapeOptions = ['文本切片', '父子切片', 'QA对', '知识点'];

function createOutputRule(outputName = '') {
  return {
    id: makeId('output-rule'),
    outputName,
    fieldType: 'string',
    artifactType: inferArtifactType(outputName),
    storageTargetType: 'Elasticsearch',
    esAddress: 'http://es.internal:9200',
    esIndex: outputName ? `ke_${outputName.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`).replace(/^_/, '').toLowerCase()}` : 'ke_tool_output',
    targetField: inferStorageTargetField(outputName),
    objectStorageAddress: 'oss://knowledge-engineering',
    objectStoragePath: outputName ? `tool-output/{run_id}/${outputName}.json` : 'tool-output/{run_id}/result.json',
    writeMode: 'upsert',
  };
}

function createEmptyOutputRule() {
  return {
    id: makeId('output-rule'),
    outputName: '',
    fieldType: 'string',
    artifactType: '',
    storageTargetType: '',
    esAddress: '',
    esIndex: '',
    targetField: '',
    objectStorageAddress: '',
    objectStoragePath: '',
    writeMode: '',
  };
}

function inferStorageTargetField(outputName = '') {
  const value = outputName.toLowerCase();
  if (value.includes('embedding') || value.includes('vector')) return 'vector';
  if (value.includes('metadata') || value.includes('stats')) return 'metadata';
  if (value.includes('qa')) return 'answer';
  if (value.includes('chunk') || value.includes('text') || value.includes('content')) return 'content';
  return 'content';
}

function createIndexConfig(outputName = '') {
  const fields = createFieldExample(outputName);
  return {
    indexEnabled: false,
    indexSource: outputName,
    indexField: fields.indexField,
    recallSource: outputName,
    recallField: fields.recallField,
    filterFields: fields.filterFields,
  };
}

function normalizeStorageRules(contract, outputs = []) {
  if (contract?.enabled === false) return [];
  if (contract?.rules?.length) return contract.rules.slice(0, 1).map((rule) => ({ ...createOutputRule(rule.outputName), ...rule, id: rule.id || makeId('output-rule') }));
  const outputName = contract?.outputName || outputs[0]?.name || '';
  if (!outputName) return [];
  const actions = [];
  if (contract?.enabled) actions.push('保存');
  if (contract?.indexEnabled) actions.push('建索引');
  return [{
    ...createOutputRule(outputName),
    actions: actions.length ? actions : ['保存'],
    artifactType: contract?.artifactType || '原始结果',
    storageTargetType: contract?.storageTargetType || contract?.storageType || 'Elasticsearch',
    esAddress: contract?.esAddress || '',
    esIndex: contract?.esIndex || contract?.storageTarget || '',
    targetField: contract?.targetField || inferStorageTargetField(outputName),
    objectStorageAddress: contract?.objectStorageAddress || '',
    objectStoragePath: contract?.objectStoragePath || '',
    writeMode: contract?.writeMode || 'upsert',
  }];
}

function normalizeIndexConfig(contract, outputs = []) {
  const outputName = contract?.indexSource || contract?.outputName || outputs[0]?.name || '';
  return {
    ...createIndexConfig(outputName),
    indexEnabled: Boolean(contract?.indexConfig?.indexEnabled ?? contract?.indexEnabled),
    indexSource: contract?.indexConfig?.indexSource || contract?.indexSource || outputName,
    indexField: contract?.indexConfig?.indexField || contract?.indexField || contract?.indexFields || '',
    recallSource: contract?.indexConfig?.recallSource || contract?.recallSource || outputName,
    recallField: contract?.indexConfig?.recallField || contract?.recallField || '',
    filterFields: contract?.indexConfig?.filterFields || contract?.filterFields || '',
    indexJoinField: contract?.indexConfig?.indexJoinField || contract?.indexJoinField || '',
    recallJoinField: contract?.indexConfig?.recallJoinField || contract?.recallJoinField || '',
  };
}

function buildStorageContractFromRules(rules = [], indexConfig = createIndexConfig(), fallback = {}, standardizationCode = '') {
  const normalizedRules = rules.slice(0, 1);
  const firstRule = normalizedRules[0] || {};
  return {
    ...(fallback || {}),
    enabled: normalizedRules.length > 0,
    outputName: firstRule.outputName || '',
    artifactType: firstRule.artifactType || '原始结果',
    storageTargetType: firstRule.storageTargetType || 'Elasticsearch',
    storageType: firstRule.storageTargetType || 'Elasticsearch',
    esAddress: firstRule.esAddress || '',
    esIndex: firstRule.esIndex || '',
    targetField: firstRule.targetField || '',
    objectStorageAddress: firstRule.objectStorageAddress || '',
    objectStoragePath: firstRule.objectStoragePath || '',
    writeMode: firstRule.writeMode || 'upsert',
    indexEnabled: Boolean(indexConfig?.indexEnabled),
    indexSource: indexConfig?.indexSource || '',
    indexField: indexConfig?.indexField || '',
    recallSource: indexConfig?.recallSource || '',
    recallField: indexConfig?.recallField || '',
    filterFields: indexConfig?.filterFields || '',
    indexJoinField: indexConfig?.indexJoinField || '',
    recallJoinField: indexConfig?.recallJoinField || '',
    indexConfig: indexConfig || createIndexConfig(),
    standardizationCode,
    rules: normalizedRules,
  };
}

const hasText = (value) => String(value ?? '').trim().length > 0;

function getDraftConfigRows(draft) {
  const selectedArtifactSources = new Set((draft.inputArtifacts || []).map((artifact) => artifact.sourcePath || artifact.sourceName).filter(Boolean));
  return (draft.inputs || [])
    .map((input, index) => ({ ...input, __draftIndex: index }))
    .filter((input) => !selectedArtifactSources.has(input.sourceName || input.name));
}

function getKnowledgeToolDraftStepError(draft, step) {
  if (!draft) return '请选择MCP工具';
  if (step === 0) {
    if (!hasText(draft.selectedMcpId)) return '请选择MCP服务';
    if (!hasText(draft.sourceId)) return '请选择MCP工具';
    if (!hasText(draft.name)) return '节点名称不能为空';
    if (!hasText(draft.category)) return '节点类型不能为空';
    if (!hasText(draft.description)) return '节点描述不能为空';
    return '';
  }
  if (step === 1) {
    const artifacts = draft.inputArtifacts || [];
    const configRows = getDraftConfigRows(draft);
    if (artifacts.length === 0) return '至少需要添加一个节点输入';
    for (const artifact of artifacts) {
      if (!hasText(artifact.name)) return '节点输入字段名称不能为空';
      if (!hasText(artifact.displayName)) return '节点输入显示名称不能为空';
      if (!hasText(artifact.type)) return '节点输入类型不能为空';
      if (!hasText(artifact.description)) return '节点输入说明不能为空';
    }
    for (const row of configRows) {
      if (!hasText(row.name)) return '参数名称不能为空';
      if (!hasText(row.displayName)) return '参数显示名称不能为空';
      if (!hasText(row.description)) return '参数说明不能为空';
    }
    if (!hasText(draft.parameterMappingCode)) return '参数映射代码不能为空';
    return '';
  }
  if (step === 2) {
    const rules = draft.storageRules || [];
    const outputs = draft.outputs || [];
    if (!hasText(draft.standardizationCode)) return 'MCP工具结果解析代码不能为空';
    for (const rule of rules) {
      if (!hasText(rule.outputName)) return '存储规则代码返回不能为空';
      if (!hasText(rule.artifactType)) return '存储规则知识形态不能为空';
    }
    if (outputs.length === 0) return '至少需要添加一个节点输出';
    for (const output of outputs) {
      if (!hasText(output.name)) return '节点输出字段名称不能为空';
      if (!hasText(output.displayName)) return '节点输出显示名称不能为空';
      if (!hasText(output.codeOutput || output.path)) return '节点输出代码返回不能为空';
      if (!hasText(output.description)) return '节点输出说明不能为空';
    }
    return '';
  }
  return '';
}

function KnowledgeToolCreateModal({ draft, setDraft, sources, categories, onClose, onSave, notify }) {
  const selectedSource = sources.find((item) => item.id === draft.sourceId);
  const mcpOptions = Array.from(new Map(sources.map((source) => [source.serviceId, { id: source.serviceId, name: source.serviceName }])).values());
  const selectedMcpId = draft.selectedMcpId || selectedSource?.serviceId || mcpOptions[0]?.id || '';
  const filteredSources = sources.filter((source) => source.serviceId === selectedMcpId);
  const configInputRows = getDraftConfigRows(draft);
  const steps = ['流程节点绑定MCP工具', 'MCP工具入参映射', 'MCP工具返回映射'];
  const activeStep = Math.min(draft.step || 0, steps.length - 1);
  const showValidationError = (message) => notify?.(message, 'error');
  const validateStepsBefore = (targetStep) => {
    for (let step = 0; step < targetStep; step += 1) {
      const errorMessage = getKnowledgeToolDraftStepError(draft, step);
      if (errorMessage) {
        showValidationError(errorMessage);
        return false;
      }
    }
    return true;
  };
  const setStep = (step) => {
    if (step <= activeStep || validateStepsBefore(step)) {
      setDraft((current) => ({ ...current, step }));
    }
  };
  const goNext = () => {
    const errorMessage = getKnowledgeToolDraftStepError(draft, activeStep);
    if (errorMessage) {
      showValidationError(errorMessage);
      return;
    }
    setDraft((current) => ({ ...current, step: activeStep + 1 }));
  };
  const submit = () => {
    if (!validateStepsBefore(steps.length)) return;
    onSave();
  };
  const selectSource = (sourceId) => {
    const source = sources.find((item) => item.id === sourceId);
    if (!hasOutputSchema(source)) return;
    setDraft({ ...makeKnowledgeToolDraft(source, draft.category || categories[0] || '未分类'), selectedMcpId: source?.serviceId || '', step: 0 });
  };
  const selectMcp = (serviceId) => {
    const source = sources.find((item) => item.serviceId === serviceId && hasOutputSchema(item));
    setDraft({ ...makeKnowledgeToolDraft(source, draft.category || categories[0] || '未分类'), selectedMcpId: serviceId, step: 0 });
  };
  const updateParam = (kind, index, key, value) => {
    setDraft((current) => ({
      ...current,
      [kind]: current[kind].map((item, itemIndex) => (itemIndex === index ? { ...item, [key]: value } : item)),
    }));
  };
  const updateInputArtifact = (artifactId, patch) => {
    setDraft((current) => ({
      ...current,
      inputArtifacts: (current.inputArtifacts || []).map((artifact) => (artifact.id === artifactId ? { ...artifact, ...patch } : artifact)),
    }));
  };
  const addInputArtifact = () => {
    setDraft((current) => ({
      ...current,
      inputArtifacts: [...(current.inputArtifacts || []), createEmptyInputArtifact()],
    }));
  };
  const removeInputArtifact = (artifactId) => {
    setDraft((current) => ({
      ...current,
      inputArtifacts: (current.inputArtifacts || []).filter((artifact) => artifact.id !== artifactId),
    }));
  };
  const addConfigParam = () => setDraft((current) => ({
    ...current,
    inputs: [...(current.inputs || []), { name: '', displayName: '', type: 'string', required: false, defaultValue: '', description: '', exposed: true }],
  }));
  const removeConfigParam = (index) => setDraft((current) => ({
    ...current,
    inputs: (current.inputs || []).filter((_, itemIndex) => itemIndex !== index),
  }));
  const addOutput = () => setDraft((current) => ({
    ...current,
    outputs: [...current.outputs, { name: '', displayName: '', type: 'string', codeOutput: '', description: '' }],
  }));
  const removeOutput = (index) => {
    setDraft((current) => ({
      ...current,
      outputs: current.outputs.filter((_, itemIndex) => itemIndex !== index),
      storageRules: current.outputs[index]?.storageRuleId
        ? (current.storageRules || []).map((rule) => (rule.id === current.outputs[index].storageRuleId ? { ...rule, nodeOutputRef: false } : rule))
        : current.storageRules,
    }));
  };
  const updateStorageRule = (ruleId, patch) => {
    setDraft((current) => ({
      ...current,
      storageRules: (current.storageRules || []).map((rule) => (rule.id === ruleId ? { ...rule, ...patch } : rule)),
      outputs: (current.outputs || []).map((output) => (
        output.storageRuleId === ruleId
          ? {
            ...output,
            ...(patch.fieldType ? { type: patch.fieldType } : {}),
            ...(Object.prototype.hasOwnProperty.call(patch, 'outputName') ? { codeOutput: patch.outputName } : {}),
          }
          : output
      )),
    }));
  };
  const toggleStorageRuleOutputRef = (ruleId) => {
    setDraft((current) => {
      const rule = (current.storageRules || []).find((item) => item.id === ruleId);
      if (!rule) return current;
      const nextEnabled = !rule.nodeOutputRef;
      return {
        ...current,
        storageRules: (current.storageRules || []).map((item) => (item.id === ruleId ? { ...item, nodeOutputRef: nextEnabled } : item)),
        outputs: nextEnabled
          ? [
            ...(current.outputs || []).filter((output) => output.storageRuleId !== ruleId),
            {
              name: '',
              displayName: '',
              type: rule.fieldType || 'string',
              codeOutput: rule.outputName || '',
              description: '',
              storageRuleId: ruleId,
            },
          ]
          : (current.outputs || []).filter((output) => output.storageRuleId !== ruleId),
      };
    });
  };
  const updateStandardizationCode = (standardizationCode) => {
    setDraft((current) => ({ ...current, standardizationCode }));
  };
  const updateParameterMappingCode = (parameterMappingCode) => {
    setDraft((current) => ({ ...current, parameterMappingCode }));
  };
  const updateIndexConfig = (patch) => {
    setDraft((current) => ({
      ...current,
      indexConfig: { ...createIndexConfig(current.storageRules?.[0]?.outputName || ''), ...(current.indexConfig || {}), ...patch },
    }));
  };
  const addStorageRule = () => setDraft((current) => ({
    ...current,
    storageRules: (current.storageRules || []).length ? current.storageRules.slice(0, 1) : [createEmptyOutputRule()],
  }));
  const removeStorageRule = (ruleId) => setDraft((current) => ({
    ...current,
    storageRules: (current.storageRules || []).filter((rule) => rule.id !== ruleId),
    outputs: (current.outputs || []).filter((output) => output.storageRuleId !== ruleId),
  }));
  return (
    <Modal
      title={draft.mode === 'edit' ? '编辑流程节点' : '新建流程节点'}
      wide
      className="standard-tool-modal"
      onClose={onClose}
      footer={(
        <>
          <button type="button" className="secondary" onClick={onClose}>取消</button>
          {activeStep > 0 ? <button type="button" className="secondary" onClick={() => setStep(activeStep - 1)}>上一步</button> : null}
          {activeStep < steps.length - 1 ? (
            <button type="button" className="primary" onClick={goNext}>下一步</button>
          ) : (
            <button type="button" className="primary" onClick={submit}>{draft.mode === 'edit' ? '保存' : '创建'}</button>
          )}
        </>
      )}
    >
      <div className="standard-tool-form">
        <div className="standard-tool-steps" style={{ '--step-count': steps.length }}>
          {steps.map((step, index) => (
            <button
              type="button"
              key={step}
              className={`step-item ${index === activeStep ? 'active' : ''} ${index < activeStep ? 'done' : ''}`}
              aria-current={index === activeStep ? 'step' : undefined}
              onClick={() => setStep(index)}
            >
              <span className="step-dot">{index + 1}</span>
              <span className="step-label">{step}</span>
            </button>
          ))}
        </div>
        {activeStep === 0 ? (
          <NodeBindingStep
            draft={draft}
            setDraft={setDraft}
            sources={sources}
            selectedSource={selectedSource}
            selectedMcpId={selectedMcpId}
            mcpOptions={mcpOptions}
            filteredSources={filteredSources}
            categories={categories}
            onSelectMcp={selectMcp}
            onSelectSource={selectSource}
          />
        ) : null}
        {activeStep === 1 ? (
          <InputMappingPanel
            source={selectedSource}
            code={draft.parameterMappingCode || ''}
            artifacts={draft.inputArtifacts || []}
            configRows={configInputRows}
            onCodeChange={updateParameterMappingCode}
            onArtifactAdd={addInputArtifact}
            onArtifactRemove={removeInputArtifact}
            onArtifactChange={updateInputArtifact}
            onParamChange={updateParam}
            onParamAdd={addConfigParam}
            onParamRemove={removeConfigParam}
          />
        ) : null}
        {activeStep === 2 ? (
          <OutputStandardizationPanel
            source={selectedSource}
            rules={draft.storageRules || []}
            code={draft.standardizationCode || ''}
            outputs={draft.outputs || []}
            onCodeChange={updateStandardizationCode}
            onAdd={addStorageRule}
            onRemove={removeStorageRule}
            onChange={updateStorageRule}
            onToggleOutputRef={toggleStorageRuleOutputRef}
            onOutputChange={updateParam}
            onOutputAdd={addOutput}
            onOutputRemove={removeOutput}
          />
        ) : null}
      </div>
    </Modal>
  );
}

function NodeBindingStep({ draft, setDraft, sources, selectedSource, selectedMcpId, mcpOptions, filteredSources, categories, onSelectMcp, onSelectSource }) {
  const toolDescription = selectedSource?.tool?.description || '选择原始 MCP 工具后展示工具描述。';
  return (
    <section className="node-binding-grid">
      <div className="binding-column">
        <h3>请选择原始MCP工具</h3>
        <div className="schema-card binding-box">
          {draft.mode === 'edit' ? (
            <>
              <Field label="MCP服务"><input value={draft.sourceLabel?.split(' / ')[0] || ''} readOnly /></Field>
              <Field label="原始MCP工具"><input value={draft.sourceLabel?.split(' / ')[1] || ''} readOnly /></Field>
            </>
          ) : sources.length ? (
            <>
              <Field label="MCP服务" required>
                <SelectField value={selectedMcpId} onChange={onSelectMcp}>
                  {mcpOptions.map((mcp) => <option key={mcp.id} value={mcp.id}>{mcp.name}</option>)}
                </SelectField>
              </Field>
              <Field label="原始MCP工具" required>
                <SelectField value={draft.sourceId} onChange={onSelectSource}>
                  <option value="" disabled>请选择原始MCP工具</option>
                  {filteredSources.map((source) => {
                    const missingOutputSchema = !hasOutputSchema(source);
                    return (
                      <option key={source.id} value={source.id} disabled={missingOutputSchema}>
                        <span className="mcp-tool-option">
                          <span>{source.tool.name}</span>
                          {missingOutputSchema ? <span className="missing-output-schema">缺失Output Schema</span> : null}
                        </span>
                      </option>
                    );
                  })}
                </SelectField>
              </Field>
            </>
          ) : <p className="empty-hint">暂无已启用 MCP 服务，请先在“MCP服务管理”中启用服务。</p>}
          <Field label="原始名称工具描述信息">
            <div className="mcp-description-box">{toolDescription}</div>
          </Field>
        </div>
      </div>
      <div className="binding-arrow" aria-hidden="true" />
      <div className="binding-column">
        <h3>请设置流程节点信息</h3>
        <div className="schema-card binding-box">
          <Field label="节点名称" required><input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} /></Field>
          <Field label="节点类型" required><SelectField value={draft.category} onChange={(category) => setDraft({ ...draft, category })}>{categories.map((category) => <option key={category} value={category}>{category}</option>)}</SelectField></Field>
          <Field label="节点描述" required><textarea value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} /></Field>
        </div>
      </div>
    </section>
  );
}

function NodeInputArtifactTable({ artifacts, onAdd, onRemove, onChange }) {
  return (
    <section className="schema-card editable-schema-card">
      <div className="schema-head">
        <strong>节点输入</strong>
        <button type="button" className="text-link" onClick={onAdd}><PlusOutlined /> 添加节点输入</button>
      </div>
      <p className="plain-step-tip">定义当前流程节点用于接收上游节点输出结果的参数。</p>
      {artifacts.length ? (
        <table className="data-table compact-table editable-schema-table input-artifact-table">
          <thead>
            <tr>
              <th>字段名称</th>
              <th>显示名称</th>
              <th>类型</th>
              <th>说明</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {artifacts.map((artifact) => (
              <tr key={artifact.id}>
                <td><input value={artifact.name || ''} onChange={(event) => onChange(artifact.id, { name: event.target.value })} /></td>
                <td><input value={artifact.displayName || ''} onChange={(event) => onChange(artifact.id, { displayName: event.target.value })} /></td>
                <td>
                  <SelectField value={artifact.type || 'string'} onChange={(type) => onChange(artifact.id, { type, artifactType: inferInputArtifactType(type) })}>
                    {outputFieldTypeOptions.map((type) => <option key={type} value={type}>{type}</option>)}
                  </SelectField>
                </td>
                <td><input value={artifact.description || ''} onChange={(event) => onChange(artifact.id, { description: event.target.value })} /></td>
                <td><button type="button" className="table-delete-button" title="删除" aria-label="删除" onClick={() => onRemove(artifact.id)}><DeleteOutlined /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : <p className="empty-hint">暂无节点输入。可添加后配置字段名称、显示名称、类型和说明。</p>}
    </section>
  );
}

function InputMappingPanel({ source, code, artifacts, configRows, onCodeChange, onArtifactAdd, onArtifactRemove, onArtifactChange, onParamChange, onParamAdd, onParamRemove }) {
  const inputSchema = buildRawInputJsonSchema(source?.tool?.inputs || []);
  return (
    <section className="standardization-grid mapping-grid">
      <div className="standardization-right-stack">
        <div className="input-config-stack">
          <NodeInputArtifactTable
            artifacts={artifacts}
            onAdd={onArtifactAdd}
            onRemove={onArtifactRemove}
            onChange={onArtifactChange}
          />
          <ConfigParamTable
            rows={configRows}
            onChange={onParamChange}
            onAdd={onParamAdd}
            onRemove={onParamRemove}
          />
        </div>
        <div className="schema-card standardization-panel code-editor-panel">
          <div className="schema-head"><strong>参数映射代码</strong></div>
          <p className="plain-step-tip">通过代码将流程节点的输入和配置参数映射到MCP工具的Input Schema。</p>
          <textarea
            className="standardization-code-editor"
            spellCheck={false}
            value={code}
            onChange={(event) => onCodeChange(event.target.value)}
          />
        </div>
      </div>
      <div className="schema-card standardization-panel schema-fill-panel">
        <div className="schema-head"><strong>原始MCP input schema</strong></div>
        <pre className="json-schema-preview">{JSON.stringify(inputSchema, null, 2)}</pre>
      </div>
    </section>
  );
}

function ConfigParamTable({ rows, onChange, onAdd, onRemove }) {
  return (
    <section className="schema-card editable-schema-card">
      <div className="schema-head">
        <strong>节点配置参数</strong>
        <button type="button" className="text-link" onClick={onAdd}><PlusOutlined /> 添加配置参数</button>
      </div>
      <p className="plain-step-tip">定义当前流程节点对Agent和人暴露的配置项。</p>
      <table className="data-table compact-table editable-schema-table input-schema-table">
        <thead>
          <tr>
            <th>参数名称</th>
            <th>显示名称</th>
            <th>类型</th>
            <th>必填</th>
            <th>默认值</th>
            <th>说明</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => {
            const rowIndex = row.__draftIndex ?? index;
            return (
              <tr key={`config-${rowIndex}`}>
                <td><input value={row.name || ''} onChange={(event) => onChange('inputs', rowIndex, 'name', event.target.value)} /></td>
                <td><input value={row.displayName || ''} onChange={(event) => onChange('inputs', rowIndex, 'displayName', event.target.value)} /></td>
                <td>
                  <SelectField value={row.type || 'string'} onChange={(type) => onChange('inputs', rowIndex, 'type', type)}>
                    {outputFieldTypeOptions.map((type) => <option key={type} value={type}>{type}</option>)}
                  </SelectField>
                </td>
                <td>
                  <button type="button" className={`switch-control ${row.required ? 'active' : ''}`} onClick={() => onChange('inputs', rowIndex, 'required', !row.required)} aria-pressed={Boolean(row.required)}>
                    <span />
                  </button>
                </td>
                <td><input value={row.defaultValue || ''} onChange={(event) => onChange('inputs', rowIndex, 'defaultValue', event.target.value)} /></td>
                <td><input value={row.description || ''} onChange={(event) => onChange('inputs', rowIndex, 'description', event.target.value)} /></td>
                <td><button type="button" className="table-delete-button" title="删除" aria-label="删除" onClick={() => onRemove(rowIndex)}><DeleteOutlined /></button></td>
              </tr>
            );
          })}
          {rows.length === 0 ? <tr><td colSpan={7} className="empty-table-cell">暂无配置参数</td></tr> : null}
        </tbody>
      </table>
    </section>
  );
}

function RawMcpToolPreview({ source }) {
  const tool = source.tool || {};
  const inputs = tool.inputs || [];
  const outputs = tool.outputs || [];
  const inputSchema = buildRawInputJsonSchema(inputs);
  const outputSchema = buildRawOutputJsonSchema(outputs);
  return (
    <div className="raw-tool-preview">
      <div className="schema-head"><strong>原始MCP工具信息</strong></div>
      <div className="raw-tool-summary">
        <div>
          <label>工具名称</label>
          <strong>{tool.name || '-'}</strong>
        </div>
        <div>
          <label>工具描述</label>
          <p>{tool.description || '-'}</p>
        </div>
      </div>
      <div className="raw-schema-block">
        <div className="raw-schema-title">input schema</div>
        <pre className="json-schema-preview">{JSON.stringify(inputSchema, null, 2)}</pre>
      </div>
      {outputs.length ? (
        <div className="raw-schema-block">
          <div className="raw-schema-title">output schema</div>
          <pre className="json-schema-preview">{JSON.stringify(outputSchema, null, 2)}</pre>
        </div>
      ) : null}
    </div>
  );
}

function OutputStandardizationPanel({ source, rules, code, outputs, onCodeChange, onAdd, onRemove, onChange, onToggleOutputRef, onOutputChange, onOutputAdd, onOutputRemove }) {
  const outputSchema = buildRawOutputJsonSchema(source?.tool?.outputs || []);
  return (
    <section className="standardization-grid">
      <div className="schema-card standardization-panel schema-fill-panel">
        <div className="schema-head"><strong>原始MCP output schema</strong></div>
        <pre className="json-schema-preview">{JSON.stringify(outputSchema, null, 2)}</pre>
      </div>
      <div className="standardization-right-stack">
        <div className="schema-card standardization-panel code-editor-panel">
          <div className="schema-head"><strong>MCP工具结果解析提取代码</strong></div>
          <p className="plain-step-tip">通过代码对MCP工具的返回结果做标准化解析和提取，再做持久化存储和节点输出映射。</p>
          <textarea
            className="standardization-code-editor"
            spellCheck={false}
            value={code}
            onChange={(event) => onCodeChange(event.target.value)}
          />
        </div>
        <div className="schema-card standardization-panel binding-panel">
          <div className="schema-head">
            <strong>MCP工具结果持久化存储</strong>
            {rules.length === 0 ? <button type="button" className="text-link" onClick={onAdd}><PlusOutlined /> 添加绑定</button> : null}
          </div>
          <p className="plain-step-tip">通过代码对MCP工具的返回结果做标准化提取和处理，并绑定知识形态，系统会按所选知识形态完成存储落库。</p>
          <div className="binding-list">
            {rules.length ? (
              <table className="data-table compact-table editable-schema-table output-binding-table">
                <thead>
                  <tr>
                    <th>代码返回</th>
                    <th>类型</th>
                    <th>知识形态</th>
                    <th>节点输出引用</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {rules.map((rule) => (
                    <tr key={rule.id}>
                      <td><input value={rule.outputName || ''} placeholder="例如 chunks 或 result.qaPairs" onChange={(event) => onChange(rule.id, { outputName: event.target.value })} /></td>
                      <td>
                        <SelectField value={rule.fieldType || 'string'} onChange={(fieldType) => onChange(rule.id, { fieldType })}>
                          {outputFieldTypeOptions.map((type) => <option key={type} value={type}>{type}</option>)}
                        </SelectField>
                      </td>
                      <td>
                        <SelectField value={rule.artifactType || ''} onChange={(artifactType) => onChange(rule.id, { artifactType })}>
                          <option value="">请选择</option>
                          {knowledgeShapeOptions.map((item) => <option key={item} value={item}>{item}</option>)}
                        </SelectField>
                      </td>
                      <td>
                        <button type="button" className={`switch-control ${rule.nodeOutputRef ? 'active' : ''}`} onClick={() => onToggleOutputRef(rule.id)} aria-pressed={Boolean(rule.nodeOutputRef)}>
                          <span />
                        </button>
                      </td>
                      <td><button type="button" className="table-delete-button" title="删除" aria-label="删除" onClick={() => onRemove(rule.id)}><DeleteOutlined /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : null}
            {rules.length === 0 ? <p className="empty-hint">暂无绑定。请添加代码输出，并选择对应知识形态。</p> : null}
          </div>
        </div>
        <NodeOutputTable
          outputs={outputs}
          onChange={onOutputChange}
          onAdd={onOutputAdd}
          onRemove={onOutputRemove}
        />
      </div>
    </section>
  );
}

function NodeOutputTable({ outputs, onChange, onAdd, onRemove }) {
  return (
    <section className="schema-card standardization-panel node-output-panel">
      <div className="schema-head">
        <strong>节点输出</strong>
        <button type="button" className="text-link" onClick={onAdd}><PlusOutlined /> 添加节点输出</button>
      </div>
      <p className="plain-step-tip">将提取代码处理后的结果作为节点输出给下游节点使用。</p>
      <table className="data-table compact-table editable-schema-table node-output-table">
        <thead>
          <tr>
            <th>字段名称</th>
            <th>显示名称</th>
            <th>类型</th>
            <th>代码返回</th>
            <th>说明</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {outputs.map((output, index) => (
            <tr key={`output-${index}`}>
              <td><input value={output.name || ''} onChange={(event) => onChange('outputs', index, 'name', event.target.value)} /></td>
              <td><input value={output.displayName || ''} onChange={(event) => onChange('outputs', index, 'displayName', event.target.value)} /></td>
              <td>
                <SelectField value={output.type || 'string'} onChange={(type) => onChange('outputs', index, 'type', type)} disabled={Boolean(output.storageRuleId)}>
                  {outputFieldTypeOptions.map((type) => <option key={type} value={type}>{type}</option>)}
                </SelectField>
              </td>
              <td><input value={output.codeOutput || output.path || ''} placeholder="例如 chunks 或 result.qaPairs" disabled={Boolean(output.storageRuleId)} onChange={(event) => onChange('outputs', index, 'codeOutput', event.target.value)} /></td>
              <td><input value={output.description || ''} onChange={(event) => onChange('outputs', index, 'description', event.target.value)} /></td>
              <td><button type="button" className="table-delete-button" title="删除" aria-label="删除" onClick={() => onRemove(index)}><DeleteOutlined /></button></td>
            </tr>
          ))}
          {outputs.length === 0 ? <tr><td colSpan={6} className="empty-table-cell">暂无节点输出</td></tr> : null}
        </tbody>
      </table>
    </section>
  );
}

function buildRawInputJsonSchema(inputs = []) {
  const properties = {};
  const required = [];
  inputs.forEach((input) => {
    if (!input.name) return;
    properties[input.name] = {
      ...toJsonSchemaType(input.type),
      ...(input.description ? { description: input.description } : {}),
      ...(input.defaultValue ? { default: input.defaultValue } : {}),
    };
    if (input.required) required.push(input.name);
  });
  return {
    type: 'object',
    properties,
    ...(required.length ? { required } : {}),
  };
}

function buildRawOutputJsonSchema(outputs = []) {
  const properties = {};
  outputs.forEach((output) => {
    if (!output.name) return;
    properties[output.name] = {
      ...toJsonSchemaType(output.type),
      ...(output.description ? { description: output.description } : {}),
      ...(output.path && output.path !== output.name ? { sourcePath: output.path } : {}),
    };
  });
  return {
    type: 'object',
    properties,
  };
}

function toJsonSchemaType(type = 'object') {
  const value = String(type).toLowerCase();
  if (value.includes('array')) {
    const itemType = value.includes('string') ? 'string' : value.includes('number') ? 'number' : value.includes('integer') ? 'integer' : 'object';
    return { type: 'array', items: { type: itemType } };
  }
  if (value.includes('integer')) return { type: 'integer' };
  if (value.includes('number')) return { type: 'number' };
  if (value.includes('boolean')) return { type: 'boolean' };
  if (value.includes('string')) return { type: 'string' };
  if (value.includes('object')) return { type: 'object' };
  return { type: 'object', originalType: type };
}

const inputTypeOptions = ['string', 'number', 'integer', 'boolean', 'object', 'array<object>', 'array<string>'];
const outputFieldTypeOptions = ['string', 'number', 'integer', 'boolean', 'object', 'array<object>', 'array<string>', 'file', 'url'];
const inputArtifactTypeOptions = [
  { value: 'file_object', label: '文件对象', type: 'object' },
  { value: 'file_url', label: '文件地址', type: 'url' },
  { value: 'text', label: '文本内容', type: 'string' },
  { value: 'parsed_document', label: '解析后文档', type: 'object' },
  { value: 'text_blocks', label: '文本块集合', type: 'array<object>' },
  { value: 'text_chunks', label: '文本切片集', type: 'array<object>' },
  { value: 'parent_child_chunks', label: '父子切片集', type: 'array<object>' },
  { value: 'qa_pairs', label: 'QA对集合', type: 'array<object>' },
  { value: 'knowledge_points', label: '知识点集合', type: 'array<object>' },
];

function normalizeDataType(type = '') {
  const value = String(type).toLowerCase();
  if (value.includes('array')) return 'array';
  if (value.includes('url')) return 'url';
  if (value.includes('string')) return 'string';
  if (value.includes('integer')) return 'number';
  if (value.includes('number')) return 'number';
  if (value.includes('boolean')) return 'boolean';
  if (value.includes('object')) return 'object';
  return value || 'object';
}

function isArtifactInputTypeMatched(artifactType, inputType) {
  const artifactOption = inputArtifactTypeOptions.find((option) => option.value === artifactType);
  if (!artifactOption || !inputType) return true;
  const artifactNormalized = normalizeDataType(artifactOption.type);
  const inputNormalized = normalizeDataType(inputType);
  if (artifactNormalized === inputNormalized) return true;
  return artifactNormalized === 'url' && inputNormalized === 'string';
}

function OptionWithType({ name, type }) {
  return <span className="select-option-with-type"><span>{name}</span><small>{type}</small></span>;
}

function EditableParamTable({ title, tip, rows, kind, columns, sourceInputs = [], storageRules = [], onChange, onAdd, onRemove }) {
  const visibleColumns = onRemove ? [...columns, '操作'] : columns;
  return (
    <section className="schema-card editable-schema-card">
      {title ? (
        <div className="schema-head">
          <strong>{title}</strong>
          {onAdd ? <button type="button" className="text-link" onClick={onAdd}><PlusOutlined /> 添加节点输出</button> : null}
        </div>
      ) : null}
      {tip ? <p className="plain-step-tip">{tip}</p> : null}
      <table className={`data-table compact-table editable-schema-table ${kind === 'inputs' ? 'input-schema-table' : 'output-schema-table'}`}>
        <thead><tr>{visibleColumns.map((column) => <th key={column}>{column}</th>)}</tr></thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={`${kind}-${index}`}>
              <td><input value={row.name} onChange={(event) => onChange(kind, row.__draftIndex ?? index, 'name', event.target.value)} /></td>
              {kind === 'inputs' ? (
                <>
                  <td>
                    <SelectField value={row.type || 'object'} onChange={(type) => onChange(kind, row.__draftIndex ?? index, 'type', type)}>
                      {inputTypeOptions.map((type) => <option key={type} value={type}>{type}</option>)}
                    </SelectField>
                  </td>
                  <td>
                    <button type="button" className={`switch-control ${row.required ? 'active' : ''}`} onClick={() => onChange(kind, row.__draftIndex ?? index, 'required', !row.required)} aria-pressed={Boolean(row.required)}>
                      <span />
                    </button>
                  </td>
                  <td><input value={row.defaultValue || ''} onChange={(event) => onChange(kind, row.__draftIndex ?? index, 'defaultValue', event.target.value)} /></td>
                  <td><input value={row.description || ''} onChange={(event) => onChange(kind, row.__draftIndex ?? index, 'description', event.target.value)} /></td>
                  <td>
                    <button type="button" className={`switch-control ${row.exposed ?? true ? 'active' : ''}`} onClick={() => onChange(kind, row.__draftIndex ?? index, 'exposed', !(row.exposed ?? true))} aria-pressed={row.exposed ?? true}>
                      <span />
                    </button>
                  </td>
                </>
              ) : (
                <>
                  <td>
                    <SelectField value={row.artifactType || ''} onChange={(artifactType) => onChange(kind, row.__draftIndex ?? index, 'artifactType', artifactType)}>
                      <option value="">请选择</option>
                      {inputArtifactTypeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                    </SelectField>
                  </td>
                  <td>
                    <SelectField value={row.sourceType || ''} onChange={(sourceType) => onChange(kind, row.__draftIndex ?? index, 'sourceType', sourceType)}>
                      <option value="">请选择</option>
                      <option value="mcpReturn">MCP工具返回值</option>
                      <option value="storageRef">存储引用</option>
                    </SelectField>
                  </td>
                  <td>
                    {row.sourceType === 'storageRef' ? (
                      <SelectField value={row.storageRuleId || ''} onChange={(storageRuleId) => onChange(kind, row.__draftIndex ?? index, 'storageRuleId', storageRuleId)}>
                        <option value="">请选择</option>
                        {storageRules.map((rule, ruleIndex) => <option key={rule.id} value={rule.id}>{`存储引用${ruleIndex + 1}：${rule.outputName || '未设置路径'}`}</option>)}
                      </SelectField>
                    ) : (
                      <input value={row.path || row.sourcePath || ''} placeholder="例如 data.result" onChange={(event) => onChange(kind, row.__draftIndex ?? index, 'path', event.target.value)} />
                    )}
                  </td>
                  <td><input value={row.description || ''} onChange={(event) => onChange(kind, row.__draftIndex ?? index, 'description', event.target.value)} /></td>
                </>
              )}
              {onRemove ? <td><button type="button" className="danger-link" onClick={() => onRemove(index)}>删除</button></td> : null}
            </tr>
          ))}
          {rows.length === 0 ? <tr><td colSpan={visibleColumns.length} className="empty-table-cell">暂无需要配置的参数</td></tr> : null}
        </tbody>
      </table>
    </section>
  );
}

function StorageContractCard({ contract }) {
  if (contract?.rules?.length) {
    const indexConfig = contract.indexConfig || normalizeIndexConfig(contract);
    const needsRelation = Boolean(indexConfig.indexEnabled && indexConfig.indexSource && indexConfig.recallSource && indexConfig.indexSource !== indexConfig.recallSource);
    return (
      <section className="schema-card">
        <div className="schema-head"><strong>结果存储与索引</strong><Badge tone="blue">{contract.rules.length} 条存储配置</Badge></div>
        <div className="storage-rule-detail-list">
          {contract.rules.map((rule, index) => (
            <div className="storage-rule-detail" key={rule.id || `${rule.outputName}-${index}`}>
              <div><label>工具输出</label><strong>{rule.outputName || '-'}</strong></div>
              <div><label>知识形态</label><strong>{rule.artifactType || '-'}</strong></div>
              <div><label>存储目标</label><strong>{rule.storageTargetType || '-'}</strong></div>
              {rule.storageTargetType === '对象存储' ? <div><label>Bucket 地址</label><strong>{rule.objectStorageAddress || '-'}</strong></div> : <div><label>ES 地址</label><strong>{rule.esAddress || '-'}</strong></div>}
              {rule.storageTargetType === '对象存储' ? <div><label>路径规则</label><strong>{rule.objectStoragePath || '-'}</strong></div> : <div><label>Index 名称</label><strong>{rule.esIndex || '-'}</strong></div>}
              <div><label>写入方式</label><strong>{rule.writeMode || '-'}</strong></div>
            </div>
          ))}
          <div className="storage-rule-detail">
            <div><label>配置到检索索引</label><strong>{indexConfig.indexEnabled ? '是' : '否'}</strong></div>
            {indexConfig.indexEnabled ? <div><label>索引来源</label><strong>{indexConfig.indexSource || '-'}</strong></div> : null}
            {indexConfig.indexEnabled ? <div><label>进索引字段</label><strong>{indexConfig.indexField || '-'}</strong></div> : null}
            {indexConfig.indexEnabled ? <div><label>召回来源</label><strong>{indexConfig.recallSource || '-'}</strong></div> : null}
            {indexConfig.indexEnabled ? <div><label>召回字段</label><strong>{indexConfig.recallField || '-'}</strong></div> : null}
            {indexConfig.indexEnabled && indexConfig.filterFields ? <div><label>过滤字段</label><strong>{indexConfig.filterFields}</strong></div> : null}
            {needsRelation ? <div><label>索引结果关联字段</label><strong>{indexConfig.indexJoinField || '-'}</strong></div> : null}
            {needsRelation ? <div><label>召回结果匹配字段</label><strong>{indexConfig.recallJoinField || '-'}</strong></div> : null}
          </div>
        </div>
      </section>
    );
  }
  if (!contract?.enabled) {
    return (
      <section className="schema-card">
        <div className="schema-head"><strong>结果存储</strong><Badge>不强制存储</Badge></div>
        <p>{contract?.note || '工具输出默认作为流程变量传递，是否存储由流程节点决定。'}</p>
      </section>
    );
  }
  return (
    <section className="schema-card">
      <div className="schema-head"><strong>结果存储</strong><Badge tone="blue">{contract.artifactType}</Badge></div>
      <div className="detail-grid">
        <div><label>绑定输出</label><strong>{contract.outputName}</strong></div>
        <div><label>结果类型</label><strong>{contract.artifactType}</strong></div>
        <div><label>保存方式</label><strong>{contract.storageType}</strong></div>
        <div><label>知识库</label><strong>{contract.knowledgeBase}</strong></div>
        <div><label>存储对象</label><strong>{contract.database}</strong></div>
        <div><label>目录结构</label><strong>{contract.directory}</strong></div>
        <div><label>写入方式</label><strong>{contract.writeMode}</strong></div>
        {contract.indexEnabled ? <div><label>索引方式</label><strong>{contract.indexType}</strong></div> : null}
      </div>
      <p>{contract.note}</p>
      {contract.indexEnabled ? <Badge tone="blue">保存后进入检索索引</Badge> : null}
    </section>
  );
}

function NodeDetailBasicInfo({ tool, rawSource }) {
  const rawTool = rawSource?.tool || {};
  const rows = [
    ['节点名称', tool.name || '-'],
    ['节点类型', tool.category || '-'],
    ['节点描述', tool.description || '-'],
    ['MCP服务', tool.sourceServiceName || rawSource?.serviceName || tool.serviceName || '-'],
    ['原始MCP工具', tool.sourceToolName || rawTool.name || '-'],
    ['原始MCP工具描述', rawTool.description || '-'],
  ];
  return (
    <section className="node-detail-section">
      <h3>基本信息</h3>
      <NodeDetailInfoCard rows={rows} />
    </section>
  );
}

function NodeDetailInfoCard({ title, rows }) {
  return (
    <div className="schema-card node-detail-info-card">
      {title ? <h4>{title}</h4> : null}
      <div className="node-basic-fields">
        {rows.map(([label, value]) => (
          <div key={label} className="node-basic-field">
            <label>{label}</label>
            <span>{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function NodeStorageDetailTable({ contract }) {
  const rules = normalizeStorageRules(contract, []);
  return (
    <section className="node-detail-section">
      <h3>工具结果存储</h3>
      <table className="data-table compact-table node-detail-table">
        <thead>
          <tr>
            <th>MCP工具返回路径</th>
            <th>存储的知识形态</th>
            <th>存储目标</th>
            <th>存储地址</th>
            <th>存储位置</th>
            <th>目标字段</th>
            <th>写入方式</th>
          </tr>
        </thead>
        <tbody>
          {rules.length ? rules.map((rule, index) => {
            const storageTargetType = rule.storageTargetType || rule.storageType || 'Elasticsearch';
            const storageAddress = storageTargetType === '对象存储' ? rule.objectStorageAddress : rule.esAddress;
            const storageLocation = storageTargetType === '对象存储' ? rule.objectStoragePath : rule.esIndex;
            return (
              <tr key={rule.id || `${rule.outputName}-${index}`}>
                <td>{rule.outputName || '-'}</td>
                <td>{rule.artifactType || '-'}</td>
                <td>{storageTargetType || '-'}</td>
                <td>{storageAddress || '-'}</td>
                <td>{storageLocation || '-'}</td>
                <td>{rule.targetField || '-'}</td>
                <td>{rule.writeMode || '-'}</td>
              </tr>
            );
          }) : <tr><td colSpan={7} className="empty-table-cell">暂未配置工具结果存储</td></tr>}
        </tbody>
      </table>
    </section>
  );
}

function getArtifactTypeLabel(value, fallbackType = '') {
  const option = inputArtifactTypeOptions.find((item) => item.value === value);
  if (option) return `${option.label}（${option.type}）`;
  return fallbackType || value || '-';
}

function getStorageRuleLabel(storageRules, storageRuleId) {
  const index = storageRules.findIndex((rule) => rule.id === storageRuleId);
  if (index < 0) return storageRuleId || '-';
  const rule = storageRules[index];
  return `存储引用${index + 1}：${rule.outputName || '-'}`;
}

function NodeMappingDetailTable({ tool }) {
  const storageRules = normalizeStorageRules(tool.storageContract, tool.outputs || []);
  const artifactPaths = new Set((tool.inputArtifacts || []).map((artifact) => artifact.sourcePath || artifact.sourceName).filter(Boolean));
  const inputRows = (tool.inputArtifacts || []).map((artifact) => [
    artifact.name || '-',
    getArtifactTypeLabel(artifact.artifactType, artifact.type),
    artifact.sourcePath || artifact.sourceName || '-',
    artifact.description || '-',
  ]);
  const configRows = (tool.inputs || [])
    .filter((input) => !artifactPaths.has(input.name))
    .map((input) => [
      input.name || '-',
      input.type || '-',
      input.sourceName || input.name || '-',
      input.required ? '是' : '否',
      input.defaultValue || '-',
      input.description || '-',
    ]);
  const outputRows = (tool.outputs || []).map((output) => [
    output.name || '-',
    getArtifactTypeLabel(output.artifactType, output.type),
    output.sourceType === 'storageRef' ? '存储引用' : 'MCP工具返回值',
    output.sourceType === 'storageRef' ? getStorageRuleLabel(storageRules, output.storageRuleId) : output.path || output.name || '-',
    output.description || '-',
  ]);
  return (
    <section className="node-detail-section">
      <h3>参数映射</h3>
      <NodeMappingSubTable title="节点输入" columns={['输入名称', '输入类型', 'MCP工具入参路径', '输入描述']} rows={inputRows} />
      <NodeMappingSubTable title="配置参数" columns={['配置名称', '类型', 'MCP工具入参路径', '必填', '默认值', '说明']} rows={configRows} />
      <NodeMappingSubTable title="节点输出" columns={['输出名称', '输出类型', '输出来源', 'MCP工具返回路径/存储引用', '说明']} rows={outputRows} />
    </section>
  );
}

function NodeInputMappingDetail({ tool, rawSource }) {
  const artifactPaths = new Set((tool.inputArtifacts || []).map((artifact) => artifact.sourcePath || artifact.sourceName).filter(Boolean));
  const inputRows = (tool.inputArtifacts || []).map((artifact) => [
    artifact.name || '-',
    artifact.displayName || '-',
    artifact.type || '-',
    artifact.description || '-',
  ]);
  const configRows = (tool.inputs || [])
    .filter((input) => !artifactPaths.has(input.name))
    .map((input) => [
      input.name || '-',
      input.displayName || '-',
      input.type || '-',
      input.required ? '是' : '否',
      input.defaultValue || '-',
      input.description || '-',
    ]);
  const inputSchema = buildRawInputJsonSchema(rawSource?.tool?.inputs || tool.inputs || []);
  return (
    <section className="node-detail-section">
      <h3>MCP工具入参映射</h3>
      <div className="node-detail-linear">
        <NodeMappingSubTable
          title="节点输入"
          tip="定义当前流程节点用于接收上游节点输出结果的参数。"
          columns={['字段名称', '显示名称', '类型', '说明']}
          rows={inputRows}
        />
        <NodeMappingSubTable
          title="节点配置参数"
          tip="定义当前流程节点对Agent和人暴露的配置项。"
          columns={['参数名称', '显示名称', '类型', '必填', '默认值', '说明']}
          rows={configRows}
        />
        <NodeDetailCodeBlock
          title="参数映射代码"
          tip="通过代码将流程节点的输入和配置参数映射到MCP工具的Input Schema。"
          code={tool.parameterMappingCode || ''}
        />
        <NodeDetailSchemaBlock title="原始MCP input schema" schema={inputSchema} />
      </div>
    </section>
  );
}

function NodeOutputMappingDetail({ tool, rawSource }) {
  const storageRules = normalizeStorageRules(tool.storageContract, tool.outputs || []);
  const outputRows = (tool.outputs || []).map((output) => [
    output.name || '-',
    output.displayName || '-',
    output.type || '-',
    output.codeOutput || output.path || output.name || '-',
    output.description || '-',
  ]);
  const storageRows = storageRules.map((rule) => [
    rule.outputName || '-',
    rule.fieldType || 'string',
    rule.artifactType || '-',
    rule.nodeOutputRef ? '是' : '否',
  ]);
  const outputSchema = buildRawOutputJsonSchema(rawSource?.tool?.outputs || []);
  return (
    <section className="node-detail-section">
      <h3>MCP工具返回映射</h3>
      <div className="node-detail-linear">
        <NodeDetailSchemaBlock title="原始MCP output schema" schema={outputSchema} />
        <NodeDetailCodeBlock
          title="MCP工具结果解析提取代码"
          tip="通过代码对MCP工具的返回结果做标准化解析和提取，再做持久化存储和节点输出映射。"
          code={tool.storageContract?.standardizationCode || ''}
        />
        <NodeMappingSubTable
          title="MCP工具结果持久化存储"
          tip="通过代码对MCP工具的返回结果做标准化提取和处理，并绑定知识形态，系统会按所选知识形态完成存储落库。"
          columns={['代码返回', '类型', '知识形态', '节点输出引用']}
          rows={storageRows}
        />
        <NodeMappingSubTable
          title="节点输出"
          tip="将提取代码处理后的结果作为节点输出给下游节点使用。"
          columns={['字段名称', '显示名称', '类型', '代码返回', '说明']}
          rows={outputRows}
        />
      </div>
    </section>
  );
}

function NodeDetailCodeBlock({ title, tip, code }) {
  return (
    <div className="node-mapping-group">
      <h4>{title}</h4>
      {tip ? <p className="plain-step-tip node-detail-tip">{tip}</p> : null}
      <pre className="node-detail-code-preview">{code || '-'}</pre>
    </div>
  );
}

function NodeDetailSchemaBlock({ title, schema }) {
  return (
    <div className="schema-card standardization-panel schema-fill-panel node-detail-schema-card">
      <div className="schema-head"><strong>{title}</strong></div>
      <pre className="json-schema-preview">{JSON.stringify(schema, null, 2)}</pre>
    </div>
  );
}

function NodeMappingSubTable({ title, tip, columns, rows }) {
  return (
    <div className="node-mapping-group">
      <h4>{title}</h4>
      {tip ? <p className="plain-step-tip node-detail-tip">{tip}</p> : null}
      <table className="data-table compact-table node-detail-table node-mapping-table">
        <thead><tr>{columns.map((column) => <th key={column}>{column}</th>)}</tr></thead>
        <tbody>
          {rows.length ? rows.map((row, index) => (
            <tr key={`${title}-${index}`}>{row.map((cell, cellIndex) => <td key={`${title}-${index}-${cellIndex}`}>{cell}</td>)}</tr>
          )) : <tr><td colSpan={columns.length} className="empty-table-cell">暂无{title}</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

function normalizeToolSnapshot(snapshot) {
  return {
    categories: snapshot.categories || [],
    tools: (snapshot.tools || []).map((tool) => ({
      ...tool,
      enabled: tool.enabled ?? tool.status === '可用',
      inputs: tool.inputs || [],
      outputs: tool.outputs || [],
      lastSyncedAt: tool.lastSyncedAt || '-',
    })),
  };
}

function ToolParamTable({ title, columns, rows }) {
  return (
    <section className="panel tool-param-panel">
      <div className="tool-param-title">{title}</div>
      <table className="data-table compact-table">
        <thead><tr>{columns.map((column) => <th key={column}>{column}</th>)}</tr></thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={`${title}-${index}`}>{row.map((cell, cellIndex) => <td key={`${title}-${index}-${cellIndex}`}>{cell}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

function ProjectManagementPage({ notify, onOpenSolution, onOpenWorkbench }) {
  const [version, setVersion] = useState(0);
  const [query, setQuery] = useState('');
  const [sceneFilter, setSceneFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dialog, setDialog] = useState(null);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const projects = dataStore.getProjects();
  const relationships = dataStore.getAvailableRelationships();
  const templates = dataStore.getAvailableTemplates();
  const refresh = () => setVersion((item) => item + 1);

  const openCreate = () => setDialog({ mode: 'create', name: '', description: '', relationshipId: '', templateId: '' });
  const openEdit = (project) => setDialog({ mode: 'edit', id: project.id, name: project.name, description: project.description, relationshipId: project.relationshipId, templateId: project.templateId });
  const closeMenu = () => setMenuAnchor(null);

  const filteredTemplates = dialog?.relationshipId
    ? templates.filter((template) => !template.relationshipId || template.relationshipId === dialog.relationshipId)
    : [];
  const sceneOptions = Array.from(new Set(projects.map((project) => dataStore.relationshipText(project.relationshipId))));
  const statusOptions = Array.from(new Set(projects.map((project) => project.projectStatus || (project.hasSolution ? '已完成' : '草稿'))));
  const filteredProjects = projects.filter((project) => {
    const scene = dataStore.relationshipText(project.relationshipId);
    const status = project.projectStatus || (project.hasSolution ? '已完成' : '草稿');
    if (query.trim() && !project.name.toLowerCase().includes(query.trim().toLowerCase())) return false;
    if (sceneFilter && scene !== sceneFilter) return false;
    if (statusFilter && status !== statusFilter) return false;
    return true;
  });
  const menuProject = menuAnchor ? projects.find((project) => project.id === menuAnchor.projectId) : null;

  const updateDialogRelationship = (relationshipId) => {
    const currentTemplate = templates.find((template) => template.id === dialog.templateId);
    const shouldClearTemplate = dialog.templateId && currentTemplate?.relationshipId && currentTemplate.relationshipId !== relationshipId;
    setDialog({ ...dialog, relationshipId, templateId: shouldClearTemplate ? '' : dialog.templateId });
  };

  const saveProject = () => {
    if (!dialog.name.trim()) {
      notify('项目名称不能为空', 'error');
      return;
    }
    if (!dialog.relationshipId) {
      notify('请选择场景组合', 'error');
      return;
    }
    const relationship = dataStore.getRelationship(dialog.relationshipId);
    if (!relationship?.enabled) {
      notify('该场景组合已停用，请选择其他组合', 'error');
      return;
    }
    if (dialog.templateId) {
      const template = dataStore.getTemplate(dialog.templateId);
      if (!template?.enabled) {
        notify('该模板已停用，请选择其他模板', 'error');
        return;
      }
    }
    if (dialog.mode === 'create' && dataStore.isProjectNameExists(dialog.name)) {
      notify('项目名称已存在', 'error');
      return;
    }
    if (dialog.mode === 'edit') {
      dataStore.updateProject(dialog.id, { name: dialog.name, description: dialog.description });
      notify('项目更新成功', 'success');
    } else {
      const project = dataStore.addProject({
        name: dialog.name,
        description: dialog.description,
        relationshipId: dialog.relationshipId,
        templateId: dialog.templateId || undefined,
        vectorModel: 'maip_bge-m3-v1',
        completion: dialog.templateId ? '0/1' : '0/0',
        projectStatus: '草稿',
        enabled: true,
      });
      if (dialog.templateId) dataStore.initializeProjectSolution(project.id);
      notify('项目创建成功', 'success');
      onOpenSolution(project.id);
    }
    setDialog(null);
    refresh();
  };

  const toggleStatus = (project) => {
    const nextEnabled = !project.enabled;
    if (nextEnabled) {
      const relationship = dataStore.getRelationship(project.relationshipId);
      if (!relationship?.enabled) {
        notify('该项目关联的场景组合当前为停用状态', 'warning');
      }
    }
    dataStore.updateProject(project.id, { enabled: nextEnabled });
    refresh();
    closeMenu();
    notify(nextEnabled ? '项目已启用' : '项目已停用', 'success');
  };

  const deleteProject = (project) => {
    if (project.hasContent) {
      notify('该项目已有知识成果，不可删除，可停用', 'error');
      return;
    }
    if (window.confirm(`确定要删除项目"${project.name}"吗？删除后不可恢复。`)) {
      dataStore.deleteProject(project.id);
      refresh();
      closeMenu();
      notify('项目删除成功', 'success');
    }
  };

  const enterProject = (project) => {
    if (!project.enabled) {
      notify('项目当前为停用状态,无法进入', 'warning');
      return;
    }
    onOpenSolution(project.id);
  };

  return (
    <div className="project-page">
      <PageHeader
        title="知识空间管理"
      />
      <Toolbar className="project-toolbar">
        <button type="button" className="primary" disabled={!relationships.length} onClick={openCreate}><PlusOutlined /> 新增项目</button>
        <SearchBox value={query} onChange={setQuery} placeholder="搜索项目空间名称" />
        <SelectField value={sceneFilter} onChange={setSceneFilter}>
          <option value="">筛选场景</option>
          {sceneOptions.map((scene) => <option value={scene} key={scene}>{scene}</option>)}
        </SelectField>
        <SelectField value={statusFilter} onChange={setStatusFilter}>
          <option value="">项目状态</option>
          {statusOptions.map((status) => <option value={status} key={status}>{status}</option>)}
        </SelectField>
      </Toolbar>
      {!relationships.length ? (
        <div className="warning-line"><ExclamationCircleOutlined /> 当前无可用场景组合，请先在资产管理中配置并启用场景组合</div>
      ) : null}
      {projects.length === 0 ? (
        <section className="panel empty-state">
          <FolderOpenOutlined />
          <p>暂无项目，点击“新增知识空间”开始</p>
        </section>
      ) : (
        <section className="panel table-panel project-table-panel">
          <div className="project-table-scroll">
            <table className="data-table project-management-table">
              <colgroup>
                <col className="project-col-name" />
                <col className="project-col-desc" />
                <col className="project-col-relationship" />
                <col className="project-col-template" />
                <col className="project-col-vector" />
                <col className="project-col-solution" />
                <col className="project-col-status" />
                <col className="project-col-created" />
                <col className="project-col-action" />
              </colgroup>
              <thead><tr><th>项目名称</th><th>项目描述</th><th>场景组合</th><th>初始模板</th><th>向量模型</th><th>方案状态</th><th>项目状态</th><th>创建时间</th><th>操作</th></tr></thead>
              <tbody>
                {filteredProjects.map((project) => {
                  const status = project.projectStatus || (project.hasSolution ? '已完成' : '草稿');
                  const canEdit = status !== '已完成';
                  return (
                    <tr key={project.id}>
                      <td className="strong sticky-project-name">{project.name}</td>
                      <td>{project.description || '-'}</td>
                      <td>{dataStore.relationshipText(project.relationshipId)}</td>
                      <td>{dataStore.templateText(project.templateId)}</td>
                      <td>{project.vectorModel || 'maip_bge-m3-v1'}</td>
                      <td className="completion-cell"><span>完成总数:</span><strong>{project.completion || '0/0'}</strong></td>
                      <td><Badge tone={status === '已完成' ? 'success' : 'warning'}>{status}</Badge></td>
                      <td>{new Date(project.createdAt).toLocaleDateString('zh-CN')}</td>
                      <td className="actions project-actions menu-cell">
                        <button type="button" disabled={!canEdit} onClick={() => openEdit(project)}>编辑</button>
                        <button type="button" onClick={() => enterProject(project)}>详情</button>
                        <button
                          type="button"
                          className="more-button"
                          title="更多操作"
                          onClick={(event) => {
                            const rect = event.currentTarget.getBoundingClientRect();
                            setMenuAnchor((current) => (current?.projectId === project.id ? null : {
                              projectId: project.id,
                              top: rect.bottom + 6,
                              left: Math.max(12, rect.right - 160),
                            }));
                          }}
                        >
                          <MoreOutlined />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filteredProjects.length === 0 ? (
                  <tr><td colSpan={9} className="empty-table-cell">暂无匹配项目</td></tr>
                ) : null}
              </tbody>
            </table>
          </div>
          <div className="project-pagination">
            <span>共 {filteredProjects.length} 条</span>
            <button type="button" disabled>&lt;</button>
            <button type="button" className="active">1</button>
            <button type="button" disabled>&gt;</button>
            <button type="button" className="page-size">10条/页</button>
          </div>
          {menuProject ? (
            <div className="floating-menu project-menu project-menu-fixed" style={{ top: menuAnchor.top, left: menuAnchor.left }}>
              {menuProject.hasSolution ? <button type="button" onClick={() => { onOpenSolution(menuProject.id); closeMenu(); }}>查看项目方案</button> : null}
              <button type="button" onClick={() => toggleStatus(menuProject)}>{menuProject.enabled ? '停用项目' : '启用项目'}</button>
              <button type="button" onClick={() => { openEdit(menuProject); closeMenu(); }}>编辑信息</button>
              <button type="button" className="danger-link" onClick={() => deleteProject(menuProject)}>删除项目</button>
            </div>
          ) : null}
        </section>
      )}
      {dialog ? (
        <Modal
          title={dialog.mode === 'edit' ? '编辑知识空间' : '新增知识空间'}
          onClose={() => setDialog(null)}
          wide
          footer={<><button type="button" className="secondary" onClick={() => setDialog(null)}>取消</button><button type="button" className="primary" onClick={saveProject}>{dialog.mode === 'edit' ? '保存' : '创建'}</button></>}
        >
          <div className="form-grid">
            <Field label="项目名称" required><input value={dialog.name} disabled={dialog.mode === 'edit'} onChange={(event) => setDialog({ ...dialog, name: event.target.value })} /></Field>
            <Field label="场景组合" required><SelectField value={dialog.relationshipId} onChange={updateDialogRelationship} className={dialog.mode === 'edit' ? 'readonly' : ''}><option value="">请选择场景组合</option>{relationships.map((item) => <option value={item.id} key={item.id}>{dataStore.relationshipText(item.id)}</option>)}</SelectField></Field>
            <Field label="初始模板（可选）"><SelectField value={dialog.templateId || ''} onChange={(value) => setDialog({ ...dialog, templateId: value })} className={dialog.mode === 'edit' ? 'readonly' : ''}><option value="">不选择模板</option>{filteredTemplates.map((item) => <option value={item.id} key={item.id}>{item.relationshipId ? item.name : `${item.name}（通用）`}</option>)}</SelectField></Field>
          </div>
          <Field label="项目描述"><textarea value={dialog.description} onChange={(event) => setDialog({ ...dialog, description: event.target.value })} /></Field>
          {dialog.mode === 'create' && !dialog.templateId ? (
            <p className="info-line">未选择模板，创建后需在项目方案配置页手动添加知识类目与知识形态</p>
          ) : null}
          {dialog.mode === 'edit' ? (
            <p className="info-line">场景组合和模板在项目创建后不可修改</p>
          ) : null}
        </Modal>
      ) : null}
    </div>
  );
}

function ProjectSolutionPage({ projectId, notify, onBack, onWorkbench }) {
  const [version, setVersion] = useState(0);
  const [expanded, setExpanded] = useState(new Set());
  const [selectedTemplate, setSelectedTemplate] = useState(dataStore.getProject(projectId)?.templateId || '');
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [categoryForm, setCategoryForm] = useState({ name: '', parentId: '', formTypes: ['问答库'] });
  const [categoryError, setCategoryError] = useState('');
  const project = dataStore.getProject(projectId) || dataStore.getProjects()[0];
  const solution = dataStore.getProjectSolution(project.id);
  const categories = solution ? dataStore.getProjectCategories(solution.id).sort((a, b) => (a.level - b.level) || a.name.localeCompare(b.name, 'zh-CN')) : [];
  const categoryPlans = solution ? dataStore.getCategoryPlans(solution.id) : [];
  const refresh = () => setVersion((item) => item + 1);
  const childrenOf = (parentId) => categories.filter((item) => item.parentId === parentId).sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'));
  const isLeaf = (cat) => childrenOf(cat.id).length === 0;
  const leafCategories = categories.filter((cat) => isLeaf(cat));
  const hasActiveCategoryPlan = (categoryId, formType) => categoryPlans.some((plan) => plan.categoryId === categoryId && plan.formType === formType && plan.status === 'active');
  const unconfirmedPlanCount = leafCategories.reduce((sum, cat) => sum + cat.formTypes.filter((formType) => !hasActiveCategoryPlan(cat.id, formType)).length, 0);
  const rootCategories = childrenOf(null);
  const availableParents = categories.filter((cat) => cat.level < 5);
  const stats = {
    total: categories.length,
    leaves: leafCategories.length,
    maxLevel: Math.max(...categories.map((item) => item.level), 0),
    incomplete: unconfirmedPlanCount,
  };

  useEffect(() => {
    if (!solution) return;
    setExpanded(new Set(categories.filter((item) => item.parentId === null).map((item) => item.id)));
  }, [solution?.id, categories.length]);

  const initSolution = (templateId = '') => {
    dataStore.initializeProjectSolution(project.id, templateId);
    refresh();
    notify(templateId ? '已从模板初始化项目方案' : '已手动创建项目方案', 'success');
  };

  const publishSolution = () => {
    if (unconfirmedPlanCount > 0) {
      notify(`有 ${unconfirmedPlanCount} 个处理方案尚未确认`, 'error');
      return;
    }
    dataStore.updateProjectSolution(solution.id, { status: 'active', enabled: true });
    refresh();
    notify('项目空间已发布', 'success');
  };

  const openCreateCategory = () => {
    setCategoryForm({ name: '', parentId: '', formTypes: ['问答库'] });
    setCategoryError('');
    setCategoryDialogOpen(true);
  };

  const toggleCategoryFormType = (formType) => {
    setCategoryForm((current) => {
      const hasValue = current.formTypes.includes(formType);
      return {
        ...current,
        formTypes: hasValue ? current.formTypes.filter((item) => item !== formType) : [...current.formTypes, formType],
      };
    });
    setCategoryError('');
  };

  const createCategory = () => {
    if (!solution) return;
    const name = categoryForm.name.trim();
    const parentId = categoryForm.parentId || null;
    const parent = parentId ? categories.find((cat) => cat.id === parentId) : null;
    const level = parent ? parent.level + 1 : 1;

    if (!name) {
      setCategoryError('类目名称不能为空');
      return;
    }
    if (dataStore.isProjectCategoryNameExists(solution.id, parentId, name)) {
      setCategoryError('同级下已存在同名类目');
      return;
    }
    if (level > 5) {
      setCategoryError('类目层级不得超过 5 层');
      return;
    }
    if (!categoryForm.formTypes.length) {
      setCategoryError('末级类目必须指定至少一个知识形态');
      return;
    }

    if (parent?.formTypes?.length) {
      dataStore.updateProjectCategory(parent.id, { formTypes: [] });
    }
    const next = dataStore.addProjectCategory(solution.id, {
      name,
      parentId,
      level,
      formTypes: categoryForm.formTypes,
      hasContent: false,
    });
    if (parentId) {
      setExpanded((current) => new Set(current).add(parentId));
    } else {
      setExpanded((current) => new Set(current).add(next.id));
    }
    setCategoryDialogOpen(false);
    refresh();
    notify(parent?.formTypes?.length ? '已创建类目，父级已转为分类节点' : '已创建知识类目', 'success');
  };

  const renderNode = (cat) => {
    const children = childrenOf(cat.id);
    const open = expanded.has(cat.id);
    const leaf = children.length === 0;
    return (
      <div className="tree-node" key={cat.id} style={{ marginLeft: (cat.level - 1) * 24 }}>
        <div className={`category-card viewer-category-card ${children.length ? 'branch' : 'leaf'}`}>
          <div className="category-main viewer-category-main">
            <button
              type="button"
              className="expand-button"
              disabled={!children.length}
              onClick={() => setExpanded((current) => {
                const next = new Set(current);
                next.has(cat.id) ? next.delete(cat.id) : next.add(cat.id);
                return next;
              })}
            >
              {children.length ? (open ? <AntDownOutlined /> : <RightChevron />) : null}
            </button>
            <FolderOpenOutlined />
            <strong>{cat.name}</strong>
            <Badge>第 {cat.level} 层</Badge>
            <Badge tone={leaf ? 'success' : 'neutral'}>{leaf ? '末级' : `${children.length} 个子类目`}</Badge>
            {cat.hasContent ? <Badge tone="warning">有构建结果</Badge> : null}
            {leaf ? <Badge tone={cat.formTypes.some((formType) => hasActiveCategoryPlan(cat.id, formType)) ? 'success' : 'warning'}>{cat.formTypes.some((formType) => hasActiveCategoryPlan(cat.id, formType)) ? '已生成处理方案' : '未确认'}</Badge> : null}
          </div>
          <div className="category-actions viewer-category-actions">
            {leaf ? cat.formTypes.map((form) => (
              <div className="form-action" key={form}>
                <Badge tone={hasActiveCategoryPlan(cat.id, form) ? 'success' : form === '非结构化切片' ? 'warning' : 'blue'}>{hasActiveCategoryPlan(cat.id, form) ? `${form} · 已确认` : form}</Badge>
                <button type="button" onClick={() => onWorkbench(project.id, cat.id, form)}>生成处理方案</button>
              </div>
            )) : <span className="category-note">知识形态由末级类目指定</span>}
          </div>
        </div>
        {children.length && open ? children.map(renderNode) : null}
      </div>
    );
  };

  if (!solution) {
    return (
      <>
        <PageHeader title={project.name} subtitle="尚未初始化项目方案" actions={<button type="button" className="secondary" onClick={onBack}><LeftOutlined /> 返回列表</button>} />
        <section className="panel empty-state">
          <FolderOpenOutlined />
          <h2>尚未配置项目方案</h2>
          <p>可以手动创建，也可以按旧原型逻辑从初始模板复制类目结构。</p>
          <div className="empty-actions">
            <button type="button" className="primary" onClick={() => initSolution('')}>手动创建项目方案</button>
            <SelectField value={selectedTemplate} onChange={setSelectedTemplate}><option value="">选择模板</option>{dataStore.getAvailableTemplates().map((tpl) => <option key={tpl.id} value={tpl.id}>{tpl.name}</option>)}</SelectField>
            <button type="button" className="secondary" onClick={() => initSolution(selectedTemplate)}>从模板初始化</button>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={project.name}
        subtitle="查看项目知识类目与处理方案确认状态"
        actions={<><button type="button" className="secondary" onClick={onBack}><LeftOutlined /> 返回列表</button><button type="button" className="primary" disabled={unconfirmedPlanCount > 0} onClick={publishSolution}>发布项目空间</button></>}
      />
      <section className="panel solution-info-panel">
        <div className="section-head compact"><h2>基本信息</h2></div>
        <div className="solution-info-grid">
          <div><label>项目名称</label><strong>{project.name}</strong></div>
          <div><label>项目描述</label><strong>{project.description || '-'}</strong></div>
          <div><label>状态</label><Badge tone={solution.status === 'active' ? 'success' : 'warning'}>{solution.status === 'active' ? '已完成' : '草稿'}</Badge></div>
          <div><label>创建时间</label><strong>{solution.createdAt}</strong></div>
        </div>
      </section>
      <section className="panel tree-panel">
        <div className="section-head">
          <h2>知识类目</h2>
          <div><button type="button" className="secondary" onClick={() => setExpanded(new Set(categories.map((item) => item.id)))}>展开全部</button><button type="button" className="secondary" onClick={() => setExpanded(new Set())}>折叠全部</button><button type="button" className="primary" onClick={openCreateCategory}><PlusOutlined /> 新增类目</button></div>
        </div>
        <div className="tree-summary">{rootCategories.length} 个根类目 · 共 {stats.total} 个类目 · 最多支持 5 层树形结构</div>
        <div className="tree-list">{rootCategories.length ? rootCategories.map(renderNode) : (
          <div className="empty-mini large category-empty-content">
            <FolderOpenOutlined />
            <strong>暂无知识类目</strong>
            <span>创建末级类目并指定知识形态后，可从类目进入方案工作台。</span>
            <button type="button" className="primary" onClick={openCreateCategory}><PlusOutlined /> 新增根类目</button>
          </div>
        )}</div>
      </section>
      {categoryDialogOpen ? (
        <Modal
          title="新增知识类目"
          onClose={() => setCategoryDialogOpen(false)}
          footer={(
            <>
              <button type="button" className="secondary" onClick={() => setCategoryDialogOpen(false)}>取消</button>
              <button type="button" className="primary" onClick={createCategory}>创建类目</button>
            </>
          )}
        >
          <div className="dialog-stack">
            <Field label="类目名称" required>
              <input
                autoFocus
                value={categoryForm.name}
                onChange={(event) => {
                  setCategoryForm((current) => ({ ...current, name: event.target.value }));
                  setCategoryError('');
                }}
                placeholder="请输入知识类目名称（同级下唯一）"
              />
            </Field>
            <Field label="父级类目">
              <SelectField
                value={categoryForm.parentId}
                onChange={(value) => {
                  setCategoryForm((current) => ({ ...current, parentId: value }));
                  setCategoryError('');
                }}
              >
                <option value="">无（根类目）</option>
                {availableParents.map((cat) => (
                  <option key={cat.id} value={cat.id}>{`${'　'.repeat(cat.level - 1)}${cat.name} · 第 ${cat.level} 层`}</option>
                ))}
              </SelectField>
              <p className="field-help visible">留空则创建为根类目；最多支持 5 层树形结构。</p>
            </Field>
            <div className="form-field">
              <span>知识形态（末级必选）<em>*</em></span>
              <div className="checkbox-grid category-form-grid">
                {knowledgeFormTypes.map((formType) => (
                  <label key={formType} className="checkbox-option">
                    <input
                      type="checkbox"
                      checked={categoryForm.formTypes.includes(formType)}
                      onChange={() => toggleCategoryFormType(formType)}
                    />
                    <span>{formType}</span>
                  </label>
                ))}
              </div>
            </div>
            <p className="category-dialog-hint">末级类目必须指定至少一个知识形态；如果选择已有知识形态的类目作为父级，该父级会转为分类节点，知识形态由新建末级类目承载。</p>
            {categoryError ? <p className="form-error">{categoryError}</p> : null}
          </div>
        </Modal>
      ) : null}
    </>
  );
}

function RightChevron() {
  return <span className="right-chevron">›</span>;
}

const workflowCategoryOrder = ['文档解析', '文本分片', '系统节点', '知识提取', '质量评估'];
const toolDialogCategoryOrder = ['文档解析', '文本分片', '知识提取', '质量评估', '系统节点', '未分类'];
const categoryAliases = { 内容处理: '文本分片', 智能生成: '知识提取', 系统工具: '系统节点' };
const sampleDemoFile = { id: 'demo-policy-sample', name: '医保政策样例.pdf', type: 'PDF', size: '2.40 MB', status: '已上传' };
const initialAgentEvents = [{
  id: 'welcome',
  role: 'agent',
  title: '处理方案生成助手',
  content: '请上传样例文件并发送给我。我会读取样例、调研可用工具、试跑工具结果，并生成可落地为 Workflow DSL 的处理方案。',
  status: 'done',
}];
const generatedAgentEvents = [
  { id: 'qa-parse', role: 'thought', title: '分析样例文件', content: '样例是 PDF 格式的医保政策文档，核心内容包含政策条款、办理条件、材料清单和问答说明。', status: 'done' },
  { id: 'qa-query', role: 'thought', title: '工具目录查询', content: '查询结果：命中可用工具，其中包含系统节点和外部接入节点。', status: 'done', kind: 'toolCall' },
  { id: 'qa-design', role: 'thought', title: '开始设计处理方案', content: '方案设计完成。先搭建文档解析和文本分片主链路，再检查工具输出与下游入参是否需要适配。', status: 'done', flowSteps: ['文档解析', '文本分片'] },
  { id: 'qa-check-edge', role: 'thought', title: '检查节点承接', content: '发现适配问题：文件解析返回 sections[].content，分片工具需要 data.cleanBlocks。', status: 'done' },
  { id: 'qa-fix-edge', role: 'thought', title: '修复节点承接', content: '已插入代码执行器，将解析结果转换为 data.cleanBlocks，然后继续添加后置存储和 QA 提取节点。', status: 'done', kind: 'toolCall' },
  { id: 'qa-config-storage', role: 'thought', title: '参数配置：数据存储器', content: '参数配置完成：数据存储器 已形成当前方案中的 Step 执行契约。', status: 'done', kind: 'toolCall' },
  { id: 'qa-config-knowledge', role: 'thought', title: '参数配置：QA提取', content: '参数配置完成：QA提取 已形成当前方案中的 Step 执行契约。', status: 'done', kind: 'toolCall' },
  { id: 'qa-check', role: 'thought', title: '检查完整方案', content: '方案检查通过：节点顺序、工具参数、变量承接和存储策略均可执行。', status: 'done' },
  { id: 'qa-run', role: 'thought', title: '样例试跑', content: '试跑结果：所有工具执行成功；分片结果已写入 ES；问答结果已生成。', status: 'done', kind: 'toolCall' },
  { id: 'qa-done', role: 'agent', title: '方案生成与样例执行完成', content: '已完成方案搭建、链路检查、适配修复和样例试跑，可以保存为正式处理方案。', status: 'done' },
];
const runningAgentEvents = [
  { id: 'run-parse', role: 'thought', title: '分析样例文件', content: '样例是 PDF 格式的医保政策文档，核心内容包含政策条款、办理条件、材料清单和问答说明。', status: 'done' },
  { id: 'run-query', role: 'thought', title: '工具目录查询', content: '查询结果：命中可用工具，其中包含系统节点和外部接入节点。', status: 'done', kind: 'toolCall' },
  { id: 'run-design', role: 'thought', title: '开始设计处理方案', content: '方案设计完成。先搭建主链路，再检查工具输出与下游入参是否需要适配。', status: 'done', flowSteps: ['文档解析', '文本分片', '系统节点', '知识提取'] },
  { id: 'run-config-storage', role: 'thought', title: '参数配置：数据存储器', content: '配置依据：节点参数定义、样例分析结果、上游输出路径。配置项：存储对象、存储方式、写入模式。', status: 'running', kind: 'toolCall' },
];

function normalizeWorkbenchCategory(category) {
  return categoryAliases[category] || category || '未分类';
}

function categorySortIndex(category, order = workflowCategoryOrder) {
  const index = order.indexOf(normalizeWorkbenchCategory(category));
  return index >= 0 ? index : order.length;
}

function sortWorkbenchCategories(categories, order = toolDialogCategoryOrder) {
  return [...categories].sort((a, b) => categorySortIndex(a, order) - categorySortIndex(b, order) || a.localeCompare(b, 'zh-CN'));
}

function makeOutput(idValue, label, desc, path, type) {
  return { id: idValue, name: label, label, desc, path, type };
}

const defaultParamDescriptions = {
  parseObject: '样例文件对象，包含文件地址、文件名和文件类型，通常由上传文件自动带入。',
  parseStrategy: '选择解析能力组合，用于控制是否提取正文、版面、图片或表格内容。',
  chunkObject: '待分片的上游文本或结构化内容，可引用文档解析或代码执行器输出。',
  chunkSize: '每个文本片段的目标长度，用于控制切片粒度。',
  mode: '选择分片时是否关联原始文件信息或保留父子切片结构。',
  sliceSeparators: '按优先级使用的切片分隔符，用于优先保留段落、条款等语义边界。',
  codeInput: '传入代码脚本的上游数据，通常用于清洗、转换或字段补齐。',
  script: '数据转换脚本，读取输入对象并返回后置节点可引用的结构化结果。',
  outputVariables: '声明脚本输出变量名称、类型和路径，供后续工具节点选择引用。',
  storageObject: '需要写入知识存储的结构化数据，可引用前置分片或抽取结果。',
  storageMethod: '选择存储目标和写入方式，当前演示链路使用 ES 写入。',
  writeMode: '控制数据写入策略，例如新增、更新或覆盖已有记录。',
  file: '待解析文件对象，包含 fileUrl、fileName、fileType。',
  input: '工具输入数据，按当前工具契约传入段落列表或知识片段列表。',
  parse_mode: '解析模式，默认 policy_clause。',
  language: '文档语言，默认 zh-CN。',
  content: '直接传入的政策正文。',
  chunk_size: '单个片段目标长度，默认 800。',
  overlap: '相邻片段重叠长度，默认 80。',
  model: '模型标识。',
  system_prompt: '问答提取提示词。',
  summary_type: '摘要类型。',
  topK: '需要返回的关键词数量上限。',
};

const workbenchParamLabels = {
  file: '文件对象',
  parse_mode: '解析模式',
  language: '文档语言',
  content: '政策正文',
  input: '输入内容',
  chunk_size: '切片长度',
  overlap: '重叠长度',
  model: '模型',
  system_prompt: '提示词',
  summary_type: '摘要类型',
  ocr_language: 'OCR语言',
  enable_layout: '识别版面',
  pages: '页级内容',
  table_mode: '表格解析模式',
  chunks: '文本切片',
  batch_size: '批处理大小',
  query: '检索问题',
  candidates: '候选结果',
  top_k: '返回数量',
  metrics: '评估指标',
  qaPairs: 'QA对',
  sourceChunks: '来源切片',
};

const workbenchOutputLabels = {
  title: '文档标题',
  sections: '章节结构',
  paragraphs: '段落列表',
  metadata: '元数据',
  documentSections: '文档章节',
  documentBlocks: '文档块',
  documentParseResult: '文档解析结果',
  tables: '表格结果',
  figures: '图片结果',
  layout: '版面结构',
  ocrPages: 'OCR页结果',
  ocrMetadata: 'OCR元数据',
  tableMetadata: '表格元数据',
  textChunkResult: '文本分片结果',
  textChunks: '文本切片',
  parentChunks: '父切片',
  childChunks: '子切片',
  chunkRelations: '切片关系',
  stats: '统计信息',
  chunkStats: '切片统计',
  summary: '知识摘要',
  summaryResult: '知识点结果',
  knowledgePoints: '知识点',
  applicableUsers: '适用对象',
  keyRules: '关键规则',
  qaResult: 'QA结果',
  qaPairs: 'QA对',
  qaStats: 'QA统计',
  embeddings: '向量结果',
  embeddingStats: '向量统计',
  chunkQualityReport: '切片质量报告',
  badChunks: '问题切片',
  keywordResult: '关键词结果',
};

const workbenchParamSelects = {
  parse_mode: ['通用解析', '政策条款解析', 'OCR解析'],
  language: ['zh-CN', 'en-US'],
  ocr_language: ['zh-CN', 'en-US', 'ja-JP'],
  table_mode: ['自动识别', '强表格模式', '版面优先'],
  model: ['qwen3-8b', 'qwen3-32b', 'bge-m3', 'text-embedding-v3'],
  summary_type: ['政策摘要', '办理条件', '材料清单', '风险提示'],
  enable_layout: ['开启', '关闭'],
};

function getWorkbenchParamLabel(name) {
  return workbenchParamLabels[name] || name;
}

function getWorkbenchOutputLabel(name) {
  return workbenchOutputLabels[name] || name;
}

function getWorkbenchParamOptions(name) {
  return workbenchParamSelects[name] || null;
}

function makeParam(idValue, label, value, options = {}) {
  return {
    id: idValue,
    label,
    desc: options.desc || defaultParamDescriptions[idValue] || defaultParamDescriptions[label] || '',
    type: options.type || 'text',
    schemaType: options.schemaType || options.type || 'text',
    value,
    required: options.required ?? false,
    editable: options.editable ?? true,
    source: options.source || { type: 'manual' },
    options: options.options || [],
    min: options.min,
    max: options.max,
    unit: options.unit,
    visibleWhen: options.visibleWhen,
  };
}

const baseTools = [
  {
    id: 'document-parser',
    name: '通用解析',
    category: '文档解析',
    serviceName: 'Nacos 知识工程 MCP',
    summary: '解析 Word、PDF、Excel 等主流文档，提取文本和版面布局。',
    status: '可用',
    input: 'sampleFile',
    output: 'rawText',
    inputParamId: 'parseObject',
    params: [
      makeParam('parseObject', '解析对象', '{ "fileUrl": "${sample.fileUrl}", "fileName": "${sample.fileName}", "fileType": "pdf" }', { type: 'textarea', required: true, source: { type: 'file' } }),
      makeParam('parseStrategy', '解析策略', ['文档内容提取'], { type: 'multiSelect', options: ['文档文字提取', '文档内容提取', '图片内容解析', '表格深度解析'] }),
      makeParam('language', '文档语言', 'zh-CN'),
    ],
    outputs: [makeOutput('documentParseResult', '文档解析结果', 'Array<json>，包含解析后的文本、版面、图片和表格信息。', 'data.documentParseResult')],
  },
  {
    id: 'medical-policy-parser',
    name: '文件解析',
    category: '文档解析',
    serviceName: '客户自建文档处理 MCP',
    summary: '适用于解析政策类文件，保留政策条款、章节和正文结构。',
    status: '可用',
    input: 'sampleFile',
    output: 'rawText',
    inputParamId: 'file',
    params: [
      makeParam('file', 'file', '{ "fileUrl": "${sample.fileUrl}", "fileName": "${sample.fileName}", "fileType": "pdf" }', { type: 'textarea', required: true, source: { type: 'file' } }),
      makeParam('parse_mode', 'parse_mode', 'policy_clause'),
      makeParam('language', 'language', 'zh-CN'),
      makeParam('content', 'content', '', { type: 'textarea' }),
    ],
    outputs: [makeOutput('sections', '政策章节结构', 'Array<json>，包含医保政策章节、标题和正文。', 'sections')],
  },
  {
    id: 'chunk-splitter',
    name: '通用分片',
    category: '文本分片',
    serviceName: 'Nacos 知识工程 MCP',
    summary: '为纯文本文档提供灵活的分块和重叠设置。',
    status: '可用',
    input: 'rawText',
    output: 'cleanText',
    inputParamId: 'chunkObject',
    params: [
      makeParam('chunkObject', '分片对象', '', { type: 'textarea', required: true }),
      makeParam('chunkSize', '理想分块长度', 1024, { type: 'number', required: true, min: 1, max: 100000, unit: '字' }),
      makeParam('overlap', '块之间重叠长度', 200, { type: 'number', required: true, min: 0, unit: '字' }),
    ],
    outputs: [makeOutput('textChunkResult', '文本分片结果', 'Array<json>，包含分片文本、标题、来源和元数据。', 'data.textChunkResult')],
  },
  {
    id: 'recursive-separator-splitter',
    name: '分隔符递归分片',
    category: '文本分片',
    serviceName: '客户自建文档处理 MCP',
    summary: '按分隔符优先级依次切分，优先保留语义完整。',
    status: '可用',
    input: 'rawText',
    output: 'cleanText',
    inputParamId: 'chunkObject',
    params: [
      makeParam('chunkObject', '分片对象', '', { type: 'textarea', required: true }),
      makeParam('mode', '模式选择', '关联文件信息', { type: 'select', options: ['关联文件信息', '保留父子切片结构'] }),
      makeParam('chunkSize', '理想分块长度', 512, { type: 'number', required: true, min: 1, unit: '字' }),
      makeParam('overlap', '块之间重叠长度', 50, { type: 'number', required: true, min: 0, unit: '字' }),
      makeParam('sliceSeparators', '切片分隔符', ['空行', '换行'], { type: 'tags', options: ['空行', '换行', '。', '；', '###', '---'] }),
    ],
    outputs: [makeOutput('textChunkResult', '文本分片结果', 'Array<json>，包含递归切分后的文本片段。', 'data.textChunkResult')],
  },
  {
    id: 'medical-policy-splitter',
    name: '文本分片',
    category: '文本分片',
    serviceName: '客户自建文档处理 MCP',
    summary: '适合政策类文本分片，按章节和条款边界生成片段。',
    status: '可用',
    input: 'rawText',
    output: 'cleanText',
    inputParamId: 'input',
    params: [
      makeParam('input', 'input', '', { type: 'textarea', required: true }),
      makeParam('chunk_size', 'chunk_size', 800, { type: 'number', min: 1, unit: '字' }),
      makeParam('overlap', 'overlap', 80, { type: 'number', min: 0, unit: '字' }),
    ],
    outputs: [makeOutput('textChunkResult', 'textChunkResult', 'array<object>，分片后的文本片段集合。', 'textChunkResult', 'array<object>'), makeOutput('stats', 'stats', 'object，分片数量、目标长度和重叠配置。', 'stats', 'object')],
  },
  {
    id: 'system-code',
    name: '代码执行器',
    category: '系统节点',
    sourceType: 'system',
    serviceName: '流程引擎默认节点',
    summary: '接收前置工具输出，通过代码脚本完成清洗、转换、合并，并声明后置工具可引用的输出变量。',
    status: '可用',
    input: 'rawText',
    output: 'cleanText',
    inputParamId: 'codeInput',
    allowMultiple: true,
    params: [
      makeParam('codeInput', '脚本输入', '', { type: 'textarea', required: true }),
      makeParam('script', '代码脚本', 'function transform(input) {\n  return {\n    cleanBlocks: input.map(item => ({\n      title: item.title,\n      text: item.content || item.text,\n      page: item.page\n    }))\n  };\n}', { type: 'textarea', required: true }),
      makeParam('outputVariables', '输出变量声明', '[{ "name": "cleanBlocks", "type": "Array<json>", "path": "data.cleanBlocks" }]', { type: 'textarea', required: true }),
    ],
    outputs: [makeOutput('scriptResult', '脚本处理结果', '代码脚本返回的完整结果。', 'data.scriptResult', 'json'), makeOutput('cleanBlocks', '标准文本块', '可作为后置分片或抽取工具输入。', 'data.cleanBlocks', 'Array<json>')],
  },
  {
    id: 'system-storage',
    name: '数据存储器',
    category: '系统节点',
    sourceType: 'system',
    serviceName: '流程引擎默认节点',
    summary: '选择前置工具输出中的指定路径，将结果写入 ES。',
    status: '可用',
    input: 'cleanText',
    output: 'rawText',
    inputParamId: 'storageObject',
    allowMultiple: true,
    params: [
      makeParam('storageObject', '存储对象', '', { type: 'textarea', required: true }),
      makeParam('storageMethod', '存储方式', '写入ES', { type: 'select', required: true, options: ['写入ES'] }),
      makeParam('writeMode', '写入模式', 'upsert', { type: 'select', required: true, options: ['insert', 'upsert', 'overwrite'] }),
    ],
    outputs: [makeOutput('storageRef', '存储引用', 'storage_ref，后置节点可引用的存储结果地址。', 'data.storageRef'), makeOutput('storedCount', '写入数量', 'number，本次成功写入的数据条数。', 'data.storedCount')],
  },
  {
    id: 'qa-extractor',
    name: 'QA提取',
    category: '知识提取',
    serviceName: 'Nacos 知识工程 MCP',
    summary: '基于文本分片抽取问答对。',
    status: '可用',
    input: 'cleanText',
    output: 'qaPairs',
    inputParamId: 'input',
    params: [
      makeParam('input', 'input', '', { type: 'textarea', required: true }),
      makeParam('model', 'model', 'qwen3-8b'),
      makeParam('system_prompt', 'system_prompt', '请基于医保政策原文生成问答对，答案必须来自原文，并保留来源片段。', { type: 'textarea' }),
    ],
    outputs: [makeOutput('qaResult', 'qaResult', 'array<object>，问题、答案和来源分片，包含 question、answer、sourceChunkId。', 'qaResult', 'array<object>')],
  },
  {
    id: 'summary',
    name: '知识点提取',
    category: '知识提取',
    serviceName: 'Nacos 知识工程 MCP',
    summary: '基于文本分片结果提取知识点、适用对象和关键规则。',
    status: '可用',
    input: 'cleanText',
    output: 'rawText',
    inputParamId: 'input',
    params: [
      makeParam('input', 'input', '', { type: 'textarea', required: true }),
      makeParam('summary_type', 'summary_type', '政策摘要'),
      makeParam('model', 'model', 'qwen3-8b'),
    ],
    outputs: [makeOutput('summary', 'summary', 'string，政策知识点摘要正文。', 'summary', 'string'), makeOutput('summaryResult', 'summaryResult', 'array<object>，知识点条目和来源引用，包含 title、content、sourceChunkIds。', 'summaryResult', 'array<object>'), makeOutput('applicableUsers', 'applicableUsers', 'array<string>，适用对象列表。', 'applicableUsers', 'array<string>'), makeOutput('keyRules', 'keyRules', 'array<string>，关键规则列表。', 'keyRules', 'array<string>')],
  },
  {
    id: 'keyword-extractor',
    name: '关键词提取',
    category: '知识提取',
    serviceName: '客户自建文档处理 MCP',
    summary: '从文本分片中抽取关键词。',
    status: '可用',
    input: 'cleanText',
    output: 'rawText',
    inputParamId: 'extractionObject',
    params: [
      makeParam('extractionObject', '提取对象', '', { type: 'textarea', required: true }),
      makeParam('topK', '关键词数量', 8, { type: 'number', min: 1, max: 20 }),
    ],
    outputs: [makeOutput('keywordResult', '关键词提取结果', 'Array<json>，包含关键词和权重。', 'data.keywordResult')],
  },
];

const higressWorkbenchToolIds = {
  文件解析: 'medical-policy-parser',
  文本分片: 'medical-policy-splitter',
  知识点提取: 'summary',
  QA提取: 'qa-extractor',
};

const higressWorkbenchToolFlow = {
  文件解析: { input: 'sampleFile', output: 'rawText' },
  文本分片: { input: 'rawText', output: 'cleanText' },
  知识点提取: { input: 'cleanText', output: 'rawText' },
  QA提取: { input: 'cleanText', output: 'qaPairs' },
};

function toolInputToParam(input, index) {
  const type = String(input.type || '').toLowerCase();
  const name = input.name || `input_${index + 1}`;
  const selectOptions = getWorkbenchParamOptions(name);
  const paramType = selectOptions ? 'select' : type.includes('number') || type.includes('int') ? 'number' : type.includes('array') || type.includes('object') ? 'textarea' : 'text';
  return makeParam(name, getWorkbenchParamLabel(name), defaultToolParamValue(name, paramType), {
    type: paramType,
    schemaType: input.type || paramType,
    required: input.required ?? true,
    desc: input.description || '',
    options: selectOptions || [],
  });
}

function defaultToolParamValue(name, paramType) {
  if (name === 'file') return '{ "fileUrl": "${sample.fileUrl}", "fileName": "${sample.fileName}", "fileType": "pdf" }';
  if (name === 'parse_mode') return '政策条款解析';
  if (name === 'language') return 'zh-CN';
  if (name === 'ocr_language') return 'zh-CN';
  if (name === 'enable_layout') return '开启';
  if (name === 'table_mode') return '自动识别';
  if (name === 'content') return '';
  if (name === 'chunk_size') return 800;
  if (name === 'overlap') return 80;
  if (name === 'model') return 'qwen3-8b';
  if (name === 'system_prompt') return '请基于医保政策原文生成问答对，答案必须来自原文，并保留来源片段。';
  if (name === 'summary_type') return '政策摘要';
  if (name === 'batch_size') return 32;
  if (name === 'top_k') return 10;
  if (paramType === 'number') return 0;
  return '';
}

function getInputParamIdForTool(tool, base) {
  if (tool.name.includes('解析')) return 'file';
  if (tool.inputs?.some((input) => input.name === 'input')) return 'input';
  return base?.inputParamId || tool.inputs?.[0]?.name || '';
}

function managedToolToWorkbenchTool(tool) {
  const category = normalizeWorkbenchCategory(tool.category);
  const base = baseTools.find((item) => item.name === tool.name);
  if (base?.sourceType === 'system') return { ...base, category, serviceName: tool.serviceName || base.serviceName, summary: tool.description || base.summary, status: tool.status || base.status };
  const flow = higressWorkbenchToolFlow[tool.name];
  const params = (tool.inputs || []).map(toolInputToParam);
  const outputs = (tool.outputs || []).map((output, index) => {
    const name = output.name || `output_${index + 1}`;
    return makeOutput(name, getWorkbenchOutputLabel(name), output.description || '节点输出结果。', output.path || name, output.type || 'object');
  });
  return {
    id: higressWorkbenchToolIds[tool.name] || tool.id,
    name: tool.name,
    category,
    serviceName: tool.serviceName || '-',
    summary: tool.description || '',
    status: tool.status || (tool.enabled === false ? '不可用' : '可用'),
    input: flow?.input || (category === '文档解析' ? 'sampleFile' : category === '文本分片' ? 'rawText' : 'cleanText'),
    output: flow?.output || (category === '文档解析' ? 'rawText' : category === '文本分片' ? 'cleanText' : 'rawText'),
    inputParamId: getInputParamIdForTool(tool, null),
    params,
    outputs: outputs.length ? outputs : [makeOutput('result', '工具结果', '工具执行返回结果。', 'data.result')],
  };
}

function readWorkbenchCatalog() {
  const managed = readCatalog().tools.filter((tool) => tool.status === '可用' || tool.enabled);
  const managedTools = managed.map(managedToolToWorkbenchTool);
  const systemTools = baseTools.filter((tool) => tool.sourceType === 'system');
  const byId = new Map([...managedTools, ...systemTools].map((tool) => [tool.id, tool]));
  return Array.from(byId.values()).map((tool) => ({
    ...tool,
    category: normalizeWorkbenchCategory(tool.category),
  }));
}

function cloneWorkbenchParam(param) {
  return { ...param, value: Array.isArray(param.value) ? [...param.value] : param.value, source: param.source ? { ...param.source } : { type: 'manual' } };
}

function cloneWorkbenchNode(node) {
  return {
    ...node,
    inputSource: node.inputSource ? { ...node.inputSource } : { type: 'fixed' },
    params: node.params.map(cloneWorkbenchParam),
    outputs: node.outputs.map((output) => ({ ...output })),
    codeInputs: node.codeInputs?.map((input) => ({ ...input, source: { ...input.source } })),
    codeOutputs: node.codeOutputs?.map((output) => ({ ...output })),
  };
}

function cloneWorkbenchNodes(nodes) {
  return nodes.map(cloneWorkbenchNode);
}

function emptyParamValue(param) {
  if (param.type === 'multiSelect' || param.type === 'tags') return [];
  if (param.type === 'switch') return false;
  if (param.type === 'number') return '';
  return '';
}

function clearManualNodeConfig(node) {
  return {
    ...node,
    inputSource: { type: 'fixed' },
    params: node.params.map((param) => ({ ...param, value: emptyParamValue(param), source: { type: 'manual' } })),
    codeInputs: node.toolId === 'system-code' ? [] : node.codeInputs,
    codeOutputs: node.toolId === 'system-code' ? [] : node.codeOutputs,
  };
}

function createWorkbenchNode(tool, inputSource = { type: 'fixed' }) {
  const params = tool.params.map(cloneWorkbenchParam);
  const paramSource = inputSource.type === 'upstream' ? { type: 'upstream', sourceNodeId: inputSource.sourceNodeId, outputPath: inputSource.outputPath } : { type: 'file' };
  const inputParamIndex = Math.max(0, params.findIndex((param) => param.id === tool.inputParamId));
  if (params[inputParamIndex]) params[inputParamIndex] = { ...params[inputParamIndex], source: paramSource };
  const nodeId = makeId(tool.id);
  return {
    ...tool,
    nodeId,
    flowNodeId: nodeId,
    toolId: tool.id,
    toolName: tool.name,
    category: normalizeWorkbenchCategory(tool.category),
    enabled: true,
    expanded: false,
    adjusted: false,
    inputSource,
    params,
    outputs: tool.outputs.map((output) => ({ ...output })),
    codeInputs: tool.id === 'system-code' ? [{ id: `${nodeId}-input`, name: 'input', source: paramSource, value: '' }] : undefined,
    codeOutputs: tool.id === 'system-code' ? [{ id: `${nodeId}-output`, type: 'Array<json>', name: 'cleanBlocks', value: 'data.cleanBlocks' }] : undefined,
  };
}

function createAgentDemoNodes(catalog = readWorkbenchCatalog()) {
  const byId = new Map(catalog.map((tool) => [tool.id, tool]));
  const parserTool = byId.get('medical-policy-parser') || byId.get('document-parser') || catalog.find((tool) => normalizeWorkbenchCategory(tool.category) === '文档解析');
  const adapterTool = byId.get('system-code');
  const splitterTool = byId.get('medical-policy-splitter') || byId.get('recursive-separator-splitter') || byId.get('chunk-splitter') || catalog.find((tool) => normalizeWorkbenchCategory(tool.category) === '文本分片');
  const storageTool = byId.get('system-storage');
  const qaTool = byId.get('qa-extractor');
  const parser = parserTool ? createWorkbenchNode(parserTool, { type: 'fixed' }) : null;
  const adapter = parser && adapterTool ? createWorkbenchNode(adapterTool, { type: 'upstream', sourceNodeId: parser.nodeId, outputPath: 'sections' }) : null;
  const splitterSource = adapter || parser;
  const splitter = splitterTool && splitterSource ? createWorkbenchNode(splitterTool, { type: 'upstream', sourceNodeId: splitterSource.nodeId, outputPath: adapter ? 'data.cleanBlocks' : 'sections' }) : null;
  const storage = storageTool && splitter ? createWorkbenchNode(storageTool, { type: 'upstream', sourceNodeId: splitter.nodeId, outputPath: 'textChunkResult' }) : null;
  const qa = qaTool && splitter ? createWorkbenchNode(qaTool, { type: 'upstream', sourceNodeId: splitter.nodeId, outputPath: 'textChunkResult' }) : null;
  return [parser, adapter, splitter, storage, qa].filter(Boolean).map((node) => ({
    ...node,
    expanded: false,
    adjusted: true,
  }));
}

function createDraftNodesWithoutAdapter(catalog = readWorkbenchCatalog()) {
  const nodes = createAgentDemoNodes(catalog);
  const parser = nodes[0];
  const splitter = nodes[2];
  return [parser, { ...splitter, inputSource: { type: 'upstream', sourceNodeId: parser.nodeId, outputPath: 'sections' }, params: splitter.params.map((param) => param.id === splitter.inputParamId ? { ...param, source: { type: 'upstream', sourceNodeId: parser.nodeId, outputPath: 'sections' } } : param) }, ...nodes.slice(3)];
}

function createOptimizedNodes(currentNodes, catalog = readWorkbenchCatalog()) {
  const byId = new Map(catalog.map((tool) => [tool.id, tool]));
  const next = currentNodes.length ? currentNodes.map(cloneWorkbenchNode) : createAgentDemoNodes(catalog);
  const splitterIndex = next.findIndex((node) => normalizeWorkbenchCategory(node.category) === '文本分片');
  const currentSplitter = next[splitterIndex];
  const adapter = next.find((node) => node.toolId === 'system-code');
  const parser = next.find((node) => normalizeWorkbenchCategory(node.category) === '文档解析');
  const optimizedSplitter = createWorkbenchNode(byId.get('medical-policy-splitter') || byId.get('recursive-separator-splitter') || byId.get('chunk-splitter'), adapter ? { type: 'upstream', sourceNodeId: adapter.nodeId, outputPath: 'data.cleanBlocks' } : { type: 'upstream', sourceNodeId: parser?.nodeId, outputPath: 'sections' });
  if (currentSplitter) {
    optimizedSplitter.nodeId = currentSplitter.nodeId;
    optimizedSplitter.flowNodeId = currentSplitter.flowNodeId;
  }
  if (splitterIndex >= 0) next[splitterIndex] = { ...optimizedSplitter, adjusted: true };
  const splitter = next[splitterIndex >= 0 ? splitterIndex : next.findIndex((node) => normalizeWorkbenchCategory(node.category) === '文本分片')];
  next.forEach((node, index) => {
    if (index <= splitterIndex || node.nodeId === splitter?.nodeId) return;
    if (node.toolId === 'system-storage' || normalizeWorkbenchCategory(node.category) === '知识提取') {
      next[index] = applyInputSource(node, { type: 'upstream', sourceNodeId: splitter.nodeId, outputPath: 'textChunkResult' });
    }
  });
  return next;
}

function replaceToolKeepingStep(currentNode, tool, inputSource) {
  const replacement = createWorkbenchNode(tool, inputSource);
  if (!currentNode) return { ...replacement, adjusted: true };
  return {
    ...replacement,
    nodeId: currentNode.nodeId,
    flowNodeId: currentNode.flowNodeId,
    expanded: currentNode.expanded,
    enabled: currentNode.enabled,
    adjusted: true,
  };
}

function applyInputSource(node, inputSource) {
  const paramSource = inputSource.type === 'upstream' ? { type: 'upstream', sourceNodeId: inputSource.sourceNodeId, outputPath: inputSource.outputPath } : { type: 'file' };
  return {
    ...node,
    adjusted: true,
    inputSource,
    params: node.params.map((param, index) => (param.id === node.inputParamId || (!node.inputParamId && index === 0) ? { ...param, source: paramSource } : param)),
    codeInputs: node.codeInputs?.map((input, index) => (index === 0 ? { ...input, source: paramSource } : input)),
  };
}

function getCategorySections(nodes) {
  const sections = [];
  nodes.forEach((node) => {
    const sectionId = node.flowNodeId || node.nodeId;
    const last = sections[sections.length - 1];
    if (last?.sectionId === sectionId) last.nodes.push(node);
    else sections.push({ sectionId, category: normalizeWorkbenchCategory(node.category), nodes: [node] });
  });
  return sections;
}

function getPriorNodes(nodes, nodeId) {
  const index = nodes.findIndex((node) => node.nodeId === nodeId);
  return index > 0 ? nodes.slice(0, index) : [];
}

function getPreviousEnabledNode(nodes, nodeId) {
  const prior = getPriorNodes(nodes, nodeId).filter((node) => node.enabled);
  return prior[prior.length - 1] || null;
}

function isValidOutputPath(path) {
  return Boolean(path?.trim()) && /^[A-Za-z_$][\w$]*(\[\d+\])*(\.[A-Za-z_$][\w$]*(\[\d+\])*)*$/.test(path.trim());
}

function isSideEffectNode(node) {
  if (!node) return false;
  return node.toolId === 'system-storage' || node.outputs?.some((output) => output.path?.includes('storageRef') || output.path?.includes('writeResult'));
}

function getToolChainType(node, field) {
  if (!node) return field === 'input' ? 'cleanText' : 'rawText';
  return node[field] || (field === 'input' ? 'cleanText' : 'rawText');
}

function canNodeFeedNext(previousNode, node) {
  if (!previousNode || !node) return false;
  if (normalizeWorkbenchCategory(previousNode.category) === normalizeWorkbenchCategory(node.category)) return false;
  const previousOutput = getToolChainType(previousNode, 'output');
  const nodeInput = getToolChainType(node, 'input');
  if (previousOutput === nodeInput) return true;
  if (normalizeWorkbenchCategory(previousNode.category) === '文档解析' && normalizeWorkbenchCategory(node.category) === '文本分片') return true;
  if (normalizeWorkbenchCategory(previousNode.category) === '文本分片' && (normalizeWorkbenchCategory(node.category) === '知识提取' || node.toolId === 'system-storage')) return true;
  if (previousNode.outputs?.some((output) => output.path.includes('cleanBlocks')) && normalizeWorkbenchCategory(node.category) === '文本分片') return true;
  return false;
}

function getFirstCategory(nodes) {
  return getCategorySections(nodes)[0]?.category;
}

function isFirstCategoryFirstNode(node, nodes) {
  const firstSection = getCategorySections(nodes)[0];
  return firstSection?.nodes[0]?.nodeId === node.nodeId;
}

function isParamVisible(node, param) {
  if (!param.visibleWhen) return true;
  const controller = node.params.find((item) => item.id === param.visibleWhen.paramId);
  return controller?.value === param.visibleWhen.value;
}

function isEmptyParamValue(value) {
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'string') return !value.trim();
  return false;
}

function hasUnsetVisibleConfig(node) {
  if (node.toolId === 'system-code' && (!node.codeInputs?.length || !node.codeOutputs?.length)) return true;
  return node.params.some((param) => (
    isParamVisible(node, param)
    && param.required
    && param.source?.type !== 'file'
    && param.source?.type !== 'upstream'
    && isEmptyParamValue(param.value)
  ));
}

function isParamConfigWarning(warning) {
  return /未填写|未选择|超出范围/.test(warning);
}

function isConnectionIssueWarning(warning) {
  return /还未接入上游工具|输入来源节点已不存在|位于当前节点之后|输入路径未配置|仍引用/.test(warning);
}

function needsSmartToolHandling(node, rawWarnings) {
  return rawWarnings.some((warning) => isParamConfigWarning(warning) || isConnectionIssueWarning(warning)) || hasUnsetVisibleConfig(node);
}

function getParamProblems(node, receivesExternalInput = false) {
  if (!node.enabled) return [];
  return node.params.flatMap((param) => {
    if (!isParamVisible(node, param)) return [];
    if (!param.required || param.source?.type === 'file' || param.source?.type === 'upstream') return [];
    if (param.id === node.inputParamId && (node.inputSource.type === 'upstream' || receivesExternalInput)) return [];
    if (typeof param.value === 'string' && !param.value.trim()) return [`${param.label} 未填写`];
    if (typeof param.value === 'number' && ((param.min !== undefined && param.value < param.min) || (param.max !== undefined && param.value > param.max))) return [`${param.label} 超出范围`];
    if (Array.isArray(param.value) && param.value.length === 0) return [`${param.label} 未选择`];
    return [];
  });
}

function getConnectionIssueForNode(node, nodes) {
  if (!node.enabled || isFirstCategoryFirstNode(node, nodes)) return null;
  const previous = getPreviousEnabledNode(nodes, node.nodeId);
  const hasParamConfigIssue = getParamProblems(node, node.inputSource?.type !== 'upstream').some(isParamConfigWarning);
  if (node.inputSource?.type !== 'upstream') {
    if (!previous || hasParamConfigIssue || getToolChainType(node, 'input') === 'sampleFile') return null;
    return { kind: 'missing-upstream', nodeId: node.nodeId, previousNodeId: previous.nodeId, reason: `${node.toolName} 已完成参数配置，但还未接入上游工具「${previous.toolName}」的输出。` };
  }
  const source = nodes.find((item) => item.nodeId === node.inputSource.sourceNodeId);
  if (!source) return { kind: 'source-missing', nodeId: node.nodeId, previousNodeId: previous?.nodeId, reason: `${node.toolName} 的输入来源节点已不存在。` };
  const priorNodes = getPriorNodes(nodes, node.nodeId);
  if (!priorNodes.some((item) => item.nodeId === source.nodeId)) return { kind: 'source-after', nodeId: node.nodeId, sourceNodeId: source.nodeId, previousNodeId: previous?.nodeId, reason: `${node.toolName} 引用的上游工具「${source.toolName}」位于当前节点之后。` };
  if (!isValidOutputPath(node.inputSource.outputPath)) return { kind: 'invalid-path', nodeId: node.nodeId, sourceNodeId: source.nodeId, previousNodeId: previous?.nodeId, reason: `${node.toolName} 的输入路径未配置或格式不合法。` };
  if (previous && canNodeFeedNext(previous, node) && source.nodeId !== previous.nodeId) {
    return { kind: 'bypass-inserted-node', nodeId: node.nodeId, sourceNodeId: source.nodeId, previousNodeId: previous.nodeId, reason: `${node.toolName} 当前仍引用「${source.toolName}」，但前面新增/调整了「${previous.toolName}」，需要改为承接最新上游输出。` };
  }
  return null;
}

const inputSourceWarningText = '输入配置异常，请检查。';

function getNodeWarnings(nodes) {
  const warnings = {};
  nodes.forEach((node) => {
    const nodeWarnings = [...getParamProblems(node, node.inputSource?.type !== 'upstream')];
    const issue = getConnectionIssueForNode(node, nodes);
    if (issue) nodeWarnings.push(issue.reason || inputSourceWarningText);
    if (node.status !== '可用') nodeWarnings.push(`${node.toolName} 当前不可用于新处理方案`);
    if (nodeWarnings.length) warnings[node.nodeId] = nodeWarnings;
  });
  return warnings;
}

function getNodeDisplayWarnings(warnings) {
  return Object.fromEntries(
    Object.entries(warnings)
      .map(([nodeId, nodeWarnings]) => [nodeId, nodeWarnings.filter((warning) => warning !== inputSourceWarningText && !isParamConfigWarning(warning))])
      .filter(([, nodeWarnings]) => nodeWarnings.length),
  );
}

function getNodeInputIssueMap(nodes) {
  return Object.fromEntries(nodes.map((node) => [node.nodeId, Boolean(getConnectionIssueForNode(node, nodes))]));
}

function sectionHasInputIssue(section, inputIssueMap) {
  return section.nodes.some((node) => inputIssueMap[node.nodeId]);
}

function getConnectionKey(fromCategory, toCategory) {
  return `${fromCategory}->${toCategory}`;
}

function getSectionConnectionFailureReason(section, nodes) {
  const issueNode = section.nodes.find((node) => getConnectionIssueForNode(node, nodes));
  return issueNode ? getConnectionIssueForNode(issueNode, nodes)?.reason || '' : '';
}

function getFirstPlanFailure(nodes) {
  const sections = getCategorySections(nodes);
  for (let index = 0; index < sections.length; index += 1) {
    const section = sections[index];
    const issue = section.nodes.map((node) => getConnectionIssueForNode(node, nodes)).find(Boolean);
    if (!issue) continue;
    const fromSection = sections[Math.max(index - 1, 0)];
    const toSection = sections[index === 0 ? Math.min(index + 1, sections.length - 1) : index];
    if (!fromSection || !toSection || fromSection.sectionId === toSection.sectionId) return issue;
    return { ...issue, fromCategory: fromSection.category, toCategory: toSection.category, connectionKey: getConnectionKey(fromSection.category, toSection.category) };
  }
  return null;
}

function getBestOutputPathForTarget(upstream, target) {
  if (normalizeWorkbenchCategory(upstream.category) === '文本分片') {
    return upstream.outputs.find((output) => output.path.includes('textChunkResult'))?.path || upstream.outputs[0]?.path || 'textChunkResult';
  }
  if (upstream.outputs.some((output) => output.path.includes('cleanBlocks')) && normalizeWorkbenchCategory(target.category) === '文本分片') {
    return upstream.outputs.find((output) => output.path.includes('cleanBlocks'))?.path || 'data.cleanBlocks';
  }
  return upstream.outputs[0]?.path || 'data.result';
}

function moveNodeAfter(nodes, targetNodeId, sourceNodeId) {
  const next = cloneWorkbenchNodes(nodes);
  const targetIndex = next.findIndex((node) => node.nodeId === targetNodeId);
  const sourceIndex = next.findIndex((node) => node.nodeId === sourceNodeId);
  if (targetIndex < 0 || sourceIndex < 0 || targetIndex === sourceIndex) return next;
  const [target] = next.splice(targetIndex, 1);
  const nextSourceIndex = next.findIndex((node) => node.nodeId === sourceNodeId);
  next.splice(nextSourceIndex + 1, 0, { ...target, adjusted: true });
  return next;
}

function repairConnectionIssue(nodes, issue) {
  if (issue.kind === 'source-after' && issue.sourceNodeId) {
    return {
      nodes: moveNodeAfter(nodes, issue.nodeId, issue.sourceNodeId),
      targetIds: [issue.nodeId],
      actionText: '修复动作：将引用后置上游的节点移动到来源节点之后，并保持原有参数引用不变。',
    };
  }
  const next = cloneWorkbenchNodes(nodes);
  const targetIndex = next.findIndex((node) => node.nodeId === issue.nodeId);
  if (targetIndex < 0) return { nodes: next, targetIds: [], actionText: '修复动作：未找到需要修复的目标节点。' };
  const target = next[targetIndex];
  const upstream = issue.kind === 'invalid-path' && issue.sourceNodeId
    ? next.find((node) => node.nodeId === issue.sourceNodeId)
    : issue.previousNodeId ? next.find((node) => node.nodeId === issue.previousNodeId) : getPreviousEnabledNode(next, target.nodeId);
  if (!upstream) {
    next[targetIndex] = applyInputSource(target, { type: 'fixed' });
    return { nodes: next, targetIds: [target.nodeId], actionText: `修复动作：将「${target.toolName}」输入来源恢复为样例文件/手动输入。` };
  }
  const preferredPath = getBestOutputPathForTarget(upstream, target);
  next[targetIndex] = applyInputSource(target, { type: 'upstream', sourceNodeId: upstream.nodeId, outputPath: preferredPath });
  return { nodes: next, targetIds: [target.nodeId], actionText: `修复动作：将「${target.toolName}」改为承接「${upstream.toolName}」输出 ${preferredPath}。` };
}

function getPlanProblems(nodes) {
  const nodeWarnings = Object.values(getNodeWarnings(nodes)).flat();
  return nodes.filter((node) => node.enabled).length ? nodeWarnings : ['处理方案至少需要 1 个工具'];
}

function getSmartPromptValue(param, node, instruction) {
  const lowerId = param.id.toLowerCase();
  if (normalizeWorkbenchCategory(node.category) === '文档解析') {
    if (lowerId.includes('system')) return '你是知识工程文档解析专家。请从输入文件中提取正文、标题层级、表格、图片说明和页码来源，保持原文事实，不做总结改写，输出结构化 Markdown/JSON 结果。';
    if (lowerId.includes('user')) return '请解析当前上传的业务文档，保留标题层级、段落、表格和页码信息，输出可供后续分片与问答抽取使用的结构化文本。';
  }
  if (node.toolId === 'qa-extractor') {
    if (lowerId.includes('system')) return '你是知识库问答抽取专家。请基于输入片段生成可用于客服问答的高质量 QA，问题表达自然，答案必须来自原文，并保留来源片段引用。';
    if (lowerId.includes('guide')) return '请围绕用户可能咨询的问题生成问答对。每个答案需完整、可独立理解，并返回 question、answer、sourceChunkId 字段。';
  }
  if (node.toolId === 'summary') {
    if (lowerId.includes('system')) return '你是知识工程知识点提取专家。请基于输入片段提炼关键知识点，保持事实准确，避免引入原文没有的信息，并输出结构化知识点。';
    if (lowerId.includes('guide')) return '请按主题生成知识点条目，每条包含 title、content、sourceChunkIds，优先覆盖适用范围、办理条件和材料要求。';
  }
  if (node.toolId === 'keyword-extractor') {
    if (lowerId.includes('system')) return '你是业务关键词抽取专家。请从输入片段中抽取能代表业务主题、对象、条件和流程的关键词，并给出权重。';
    if (lowerId.includes('guide')) return '请输出不超过 8 个关键词，返回 keyword、weight、sourceChunkId 字段，避免抽取泛化词。';
  }
  return instruction || '请根据当前知识处理目标生成结构化配置。';
}

function getSmartParamValue(param, instruction, node) {
  if (param.id === 'parseObject' || param.id === 'file') return '{ "fileUrl": "${sample.fileUrl}", "fileName": "${sample.fileName}", "fileType": "${sample.fileType}" }';
  if (param.id === 'parse_mode') return 'policy_clause';
  if (param.id === 'language') return 'zh-CN';
  if (param.id === 'chunkObject') return '${upstream.data.documentParseResult}';
  if (param.id === 'input') return normalizeWorkbenchCategory(node.category) === '文本分片' ? '${upstream.paragraphs}' : '${upstream.textChunkResult}';
  if (param.id === 'extractionObject') return '${upstream.textChunkResult}';
  if (param.id === 'storageObject') return '${upstream.textChunkResult}';
  if (param.id === 'codeInput') return '${upstream.data.documentParseResult}';
  if (param.id === 'script') return 'function transform(input) {\n  return {\n    cleanBlocks: input.map(item => ({\n      title: item.title || item.heading,\n      text: item.text || item.content,\n      page: item.page,\n      source: item.source || item.fileName\n    })).filter(item => item.text)\n  };\n}';
  if (param.id === 'outputVariables') return '[{ "name": "cleanBlocks", "type": "Array<json>", "path": "data.cleanBlocks" }]';
  if (param.id === 'systemPrompt' || param.id === 'system_prompt' || param.id === 'userPrompt' || param.id === 'guidePrompt') return getSmartPromptValue(param, node, instruction);
  if (param.id === 'parseStrategy') return ['文档内容提取'];
  if (param.id === 'content') return '';
  if (param.id === 'ocrService') return '预置服务-OCR';
  if (param.id === 'vlmModel') return 'Qwen2.5-VL-32B-Instruct';
  if (param.id === 'aiModel' || param.id === 'model') return 'qwen3-8b';
  if (param.id === 'temperature') return 0.3;
  if (param.id === 'maxTokens') return 2048;
  if (param.id === 'chunkAssociate') return ['关联文件名', '关联标题及子标题'].filter((item) => param.options?.includes(item));
  if (param.id === 'preprocess') return ['删除换行符', '替换掉连续的空格换行符和制表符'].filter((item) => param.options?.includes(item));
  if (param.id === 'customSeparator') return '\n\n';
  if (param.id === 'sliceSeparators') return ['空行', '换行', '。'].filter((item) => param.options?.includes(item));
  if (param.id === 'mode') return param.options?.includes('关联文件信息') ? '关联文件信息' : param.options?.[0] || '';
  if (param.id === 'storageMethod') return '写入ES';
  if (param.id === 'writeMode') return 'upsert';
  if (param.type === 'number') {
    if (param.id === 'chunkSize') return 512;
    if (param.id === 'chunk_size') return 800;
    if (param.id === 'overlap') return 80;
    if (param.id === 'segmentCount') return 10;
    return param.min ?? 1;
  }
  if (param.type === 'switch') return true;
  if (param.type === 'select') return param.options?.[0] || '';
  if (param.type === 'multiSelect' || param.type === 'tags') return param.options?.length ? param.options.slice(0, Math.min(2, param.options.length)) : [];
  if (param.id.includes('language') || param.label.includes('语言')) return 'zh-CN';
  if (param.id.includes('output') || param.label.includes('输出')) return node.outputs[0]?.path || 'data.result';
  return instruction || getSmartConfigureInstruction(node);
}

function getSmartConfigureInstruction(node) {
  if (node.toolId === 'medical-policy-parser') return '使用当前上传的医保政策样例文件，按政策条款模式解析正文、章节和段落。';
  if (node.toolId === 'medical-policy-splitter') return '承接上游标准文本块，按章节边界生成 800 字左右的知识片段。';
  if (node.toolId === 'qa-extractor') return '承接分片结果，生成可用于客服问答的政策问答对。';
  if (node.toolId === 'summary') return '承接分片结果，生成政策知识点、适用对象和关键规则。';
  if (node.toolId === 'system-storage') return '承接分片结果并以 upsert 方式写入 ES。';
  if (node.toolId === 'system-code') return '把解析输出转换为后续分片工具可消费的标准文本块。';
  return `补齐「${node.toolName}」在当前处理方案中的输入来源和必填参数。`;
}

function createSmartConfiguredNode(node, nodes, instruction) {
  const priorNodes = getPriorNodes(nodes, node.nodeId);
  const upstream = priorNodes[priorNodes.length - 1];
  const nextInputSource = upstream && node.input !== 'sampleFile'
    ? { type: 'upstream', sourceNodeId: upstream.nodeId, outputPath: getBestOutputPathForTarget(upstream, node) }
    : { type: 'fixed' };
  const paramSource = nextInputSource.type === 'upstream'
    ? { type: 'upstream', sourceNodeId: nextInputSource.sourceNodeId, outputPath: nextInputSource.outputPath }
    : { type: 'file' };
  return {
    ...node,
    adjusted: true,
    expanded: true,
    inputSource: nextInputSource,
    params: node.params.map((param) => {
      if (!isParamVisible(node, param)) return param;
      if (param.id === node.inputParamId) return { ...param, source: paramSource };
      if (!param.required && !isEmptyParamValue(param.value)) return param;
      if (param.source?.type === 'upstream' || param.source?.type === 'file') return param;
      return { ...param, source: { type: 'manual' }, value: getSmartParamValue(param, instruction, node) };
    }),
    codeInputs: node.toolId === 'system-code'
      ? (node.codeInputs?.length ? node.codeInputs : [{ id: `${node.nodeId}-input-smart`, name: 'input', source: paramSource, value: '' }])
      : node.codeInputs,
    codeOutputs: node.toolId === 'system-code'
      ? (node.codeOutputs?.length ? node.codeOutputs : [{ id: `${node.nodeId}-output-smart`, type: 'Array<json>', name: 'cleanBlocks', value: node.outputs.find((output) => output.path.includes('cleanBlocks'))?.path || 'data.cleanBlocks' }])
      : node.codeOutputs,
  };
}

function createSampleResult(file, options = {}) {
  const baseRuns = [
      {
        toolName: '文件解析',
        category: '文档解析',
        outputPath: 'sections',
        parameters: [
          { name: 'file', value: `${file.name} · ${file.size}` },
          { name: 'parse_mode', value: 'policy_clause' },
          { name: 'language', value: 'zh-CN' },
        ],
        status: '成功',
        outputFull: JSON.stringify({ title: '医保政策样例', sections: [{ title: '适用范围', page: 1, content: '本政策适用于本市基本医疗保险参保人员异地就医备案与费用结算。' }, { title: '办理条件', page: 2, content: '参保人员因长期居住、转诊转院或急诊抢救需要异地就医的，可申请备案。' }], paragraphs: [{ id: 'p1', heading: '适用范围', text: '本政策适用于本市基本医疗保险参保人员异地就医备案与费用结算。' }], metadata: { fileName: file.name, pageCount: 4, parserVersion: 'policy-parser-1.0', elapsedMs: 128 } }, null, 2),
      },
      {
        toolName: '代码执行器',
        category: '系统节点',
        outputPath: 'data.cleanBlocks',
        parameters: [{ name: 'input', value: 'sections' }, { name: 'script', value: 'return { cleanBlocks: sections.map(...) }' }],
        status: '成功',
        outputFull: JSON.stringify({ data: { cleanBlocks: [{ title: '适用范围', text: '本政策适用于本市基本医疗保险参保人员异地就医备案与费用结算。', page: 1 }, { title: '办理条件', text: '长期居住、转诊转院或急诊抢救需要异地就医时，可以申请备案。', page: 2 }] }, scriptResult: { normalizedCount: 2 } }, null, 2),
      },
      {
        toolName: '文本分片',
        category: '文本分片',
        outputPath: 'textChunkResult',
        parameters: [{ name: 'input', value: 'data.cleanBlocks' }, { name: 'chunk_size', value: '800' }, { name: 'overlap', value: '80' }],
        status: '成功',
        outputFull: JSON.stringify({ textChunkResult: [{ chunkId: 'chunk-001', title: '适用范围', text: '本政策适用于本市基本医疗保险参保人员异地就医备案与费用结算。', content: '本政策适用于本市基本医疗保险参保人员异地就医备案与费用结算。', page: 1 }, { chunkId: 'chunk-002', title: '办理条件', text: '长期居住、转诊转院或急诊抢救需要异地就医时，可以申请备案。', content: '长期居住、转诊转院或急诊抢救需要异地就医时，可以申请备案。', page: 2 }], stats: { chunkCount: 2, chunkSize: 800, overlap: 80 } }, null, 2),
      },
      {
        toolName: '数据存储器',
        category: '系统节点',
        outputPath: 'data.storageRef',
        parameters: [{ name: '存储对象', value: 'textChunkResult' }, { name: '存储方式', value: '写入ES' }, { name: '写入模式', value: 'upsert' }],
        status: '成功',
        outputFull: JSON.stringify({ data: { storageRef: 'es://knowledge_chunks/demo-policy-sample', storedCount: 2 }, writeResult: { acknowledged: true, failedCount: 0 } }, null, 2),
      },
      ...(options.includeKnowledge ? [{
        toolName: '知识点提取',
        category: '知识提取',
        outputPath: 'summaryResult',
        parameters: [{ name: 'input', value: 'textChunkResult' }, { name: 'summary_type', value: '政策摘要' }, { name: 'model', value: 'qwen3-8b' }],
        status: '成功',
        outputFull: JSON.stringify({ summary: '该政策说明医保参保人员异地就医备案与费用结算要求。', summaryResult: [{ title: '适用对象', content: '本政策面向本市医保参保人员。', sourceChunkIds: ['chunk-001'] }], applicableUsers: ['城镇职工基本医保参保人', '城乡居民基本医保参保人'], keyRules: ['异地就医需先备案', '结算结果需支持人工复核'] }, null, 2),
      }] : []),
      {
        toolName: 'QA提取',
        category: '知识提取',
        outputPath: 'qaResult',
        parameters: [{ name: 'input', value: 'textChunkResult' }, { name: 'model', value: 'qwen3-8b' }, { name: 'system_prompt', value: '请基于医保政策原文生成问答对，答案必须来自原文，并保留来源片段。' }],
        status: '成功',
        outputFull: JSON.stringify({ qaResult: [{ question: '异地就医备案政策适用于哪些人？', answer: '适用于本市基本医疗保险参保人员。', sourceChunkId: 'chunk-001' }] }, null, 2),
      },
    ];
  return {
    fileId: file.id,
    fileName: file.name,
    toolRuns: baseRuns,
  };
}

function createSampleResultForPlan(file, nodes) {
  const defaultRuns = createSampleResult(file, { includeKnowledge: true }).toolRuns;
  return {
    fileId: file.id,
    fileName: file.name,
    toolRuns: nodes.filter((node) => node.enabled).map((node, index) => {
      const matched = defaultRuns.find((run) => run.toolName === node.toolName);
      if (matched) return matched;
      const outputPath = node.outputs[0]?.path || `data.step${index + 1}Result`;
      return {
        toolName: node.toolName,
        category: node.category,
        outputPath,
        status: '成功',
        parameters: node.params.slice(0, 5).map((param) => ({ name: param.id, value: getParamPreview(param, nodes) })),
        outputFull: JSON.stringify({ data: { [outputPath.split('.').pop()]: { sourceFile: file.name, nodeId: node.nodeId, status: 'completed' } } }, null, 2),
      };
    }),
  };
}

function getParamPreview(param, nodes = []) {
  if (param.source?.type === 'file') return '原始文件的地址信息';
  if (param.source?.type === 'upstream') {
    const source = nodes.find((node) => node.nodeId === param.source.sourceNodeId);
    return `上游节点 · ${source?.toolName || '来源已失效'} · ${param.source.outputPath || '未选择输出'}`;
  }
  if (Array.isArray(param.value)) return param.value.length ? param.value.join('、') : '';
  if (typeof param.value === 'boolean') return param.value ? '开启' : '关闭';
  if (typeof param.value === 'number') return `${param.value}${param.unit || ''}`;
  return String(param.value || '').trim();
}

function getToolPreviewParams(node) {
  return node.params.filter((param) => param.id !== node.inputParamId);
}

function getSelectableNodeOutputs(sourceNode, currentPath = '') {
  const outputs = (sourceNode?.outputs || []).map((output) => ({
    value: output.path || output.id || output.name,
    label: output.label || output.name || output.path,
  })).filter((output) => output.value);
  if (currentPath && !outputs.some((output) => output.value === currentPath)) {
    outputs.push({ value: currentPath, label: currentPath });
  }
  return outputs;
}

function getRuntimeLabel(status) {
  return {
    building: '创建节点中',
    selectingTool: '选择工具中',
    configuring: '配置参数中',
    configured: '配置完成',
    running: '运行中',
    success: '运行成功',
    done: '',
  }[status] || '';
}

function WorkbenchPage({ projectId, categoryId, formType, notify, onBack }) {
  const qaParams = new URLSearchParams(window.location.search);
  const qaMode = qaParams.get('qa') === '1';
  const qaGeneratedState = qaMode && qaParams.get('demoState') === 'generated';
  const qaRunningState = qaMode && qaParams.get('demoState') === 'running';
  const qaEditToolId = qaMode ? qaParams.get('editTool') : null;
  const qaRightTab = qaMode ? qaParams.get('tab') : null;
  const qaAddToolOpen = qaMode && qaParams.get('addTool') === '1';
  const qaConnectionStatus = qaMode ? qaParams.get('connection') : null;
  const qaAgentTask = qaMode ? qaParams.get('agentTask') : null;
  const savedCategoryPlan = dataStore.getCategoryPlan(categoryId, formType);
  const hasSavedCategoryPlan = savedCategoryPlan?.status === 'active';
  const [catalog, setCatalog] = useState(() => readWorkbenchCatalog());
  const [sampleFiles, setSampleFiles] = useState(() => (qaGeneratedState || qaRunningState || hasSavedCategoryPlan ? [{ ...sampleDemoFile, status: qaGeneratedState || hasSavedCategoryPlan ? '已完成' : '试跑中' }] : []));
  const [events, setEvents] = useState(() => (qaGeneratedState || hasSavedCategoryPlan ? generatedAgentEvents : qaRunningState ? runningAgentEvents : initialAgentEvents));
  const [planNodes, setPlanNodes] = useState(() => {
    if (qaGeneratedState || hasSavedCategoryPlan) return createAgentDemoNodes(readWorkbenchCatalog());
    if (qaRunningState) return createAgentDemoNodes(readWorkbenchCatalog()).slice(0, 4);
    return [];
  });
  const [rightTab, setRightTab] = useState(() => (['样例', '方案', '结果预览', '历史版本'].includes(qaRightTab) ? qaRightTab : '方案'));
  const [running, setRunning] = useState(qaRunningState);
  const [testing, setTesting] = useState(false);
  const [confirmed, setConfirmed] = useState(hasSavedCategoryPlan);
  const [results, setResults] = useState(() => (qaGeneratedState || hasSavedCategoryPlan ? [createSampleResult({ ...sampleDemoFile, status: '已完成' })] : []));
  const [connectionStates, setConnectionStates] = useState(() => {
    if (!['error', 'resolving', 'resolved'].includes(qaConnectionStatus)) return {};
    const [fromSection, toSection] = getCategorySections(planNodes);
    if (!fromSection || !toSection) return {};
    return {
      [getConnectionKey(fromSection.category, toSection.category)]: {
        status: qaConnectionStatus,
        reason: qaConnectionStatus === 'error'
          ? '文件解析返回 sections[].content，后续工具需要 data.cleanBlocks，节点之间缺少结构适配。'
          : '正在处理节点之间的输入输出承接关系。',
      },
    };
  });
  const [nodeRuntime, setNodeRuntime] = useState(() => {
    if (!qaRunningState) return {};
    const storage = planNodes.find((node) => node.toolId === 'system-storage');
    return storage ? { [storage.nodeId]: { status: 'configuring', visibleParamCount: 2 } } : {};
  });
  const [agentInput, setAgentInput] = useState('');
  const [agentTask, setAgentTask] = useState(() => {
    if (qaAgentTask === 'tool-config') {
      const target = planNodes.find((node) => node.toolId === 'system-storage') || planNodes[0];
      return target ? { type: 'tool-config', nodeId: target.nodeId, toolName: target.toolName } : null;
    }
    if (qaAgentTask === 'connection-fix') {
      const [fromSection, toSection] = getCategorySections(planNodes);
      return { type: 'connection-fix', reason: '节点之间参数承接失败，需要智能修复。', fromCategory: fromSection?.category, toCategory: toSection?.category };
    }
    return null;
  });
  const [addOpen, setAddOpen] = useState(qaAddToolOpen);
  const [editingNode, setEditingNode] = useState(() => (
    qaEditToolId ? planNodes.find((node) => node.toolId === qaEditToolId || node.toolName === qaEditToolId) || null : null
  ));
  const [draggingNodeId, setDraggingNodeId] = useState(null);
  const [draggingSectionId, setDraggingSectionId] = useState(null);
  const [dragInsertTarget, setDragInsertTarget] = useState(null);
  const streamRef = useRef(null);
  const fileRef = useRef(null);
  const project = dataStore.getProject(projectId) || dataStore.getProjects()[0];
  const solution = dataStore.getProjectSolution(project.id);
  const category = solution ? dataStore.getProjectCategories(solution.id).find((item) => item.id === categoryId) : null;
  const categorySections = getCategorySections(planNodes);
  const nodeWarnings = getNodeWarnings(planNodes);
  const inputIssueMap = getNodeInputIssueMap(planNodes);
  const displayedNodeWarnings = running ? {} : getNodeDisplayWarnings(nodeWarnings);
  const planProblems = getPlanProblems(planNodes);
  const visibleProblems = running || !planNodes.length ? [] : planProblems;
  const canEdit = !confirmed && !running && !testing;
  const canSave = canEdit && planNodes.length > 0 && visibleProblems.length === 0;
  const hasAgentTask = Boolean(agentTask);
  const canSendAgentMessage = !running && !testing && (Boolean(agentInput.trim()) || hasAgentTask) && (hasAgentTask || planNodes.length > 0 || sampleFiles.length > 0);
  const [toolCategories, setToolCategories] = useState(() => readCatalog().categories || defaultCategories);

  useEffect(() => subscribeCatalog(() => {
    const snapshot = readCatalog();
    setCatalog(readWorkbenchCatalog());
    setToolCategories(snapshot.categories || defaultCategories);
  }), []);
  useEffect(() => {
    streamRef.current?.scrollTo({ top: streamRef.current.scrollHeight, behavior: 'smooth' });
  }, [events]);

  const pushEvent = (event) => {
    const row = { ...event, id: makeId(event.role) };
    setEvents((current) => [...current, row]);
    return row.id;
  };
  const updateEvent = (idValue, patch) => setEvents((current) => current.map((item) => (item.id === idValue ? { ...item, ...patch } : item)));
  const setRuntimeForNodes = (nodes, state) => setNodeRuntime((current) => ({ ...current, ...Object.fromEntries(nodes.map((node) => [node.nodeId, state])) }));
  const toggleNodeExpanded = (nodeId) => {
    if (running) return;
    setPlanNodes((current) => current.map((node) => (node.nodeId === nodeId ? { ...node, expanded: !node.expanded } : node)));
  };

  const addDemoSample = () => {
    setSampleFiles((current) => current.some((item) => item.id === sampleDemoFile.id) ? current : [sampleDemoFile, ...current]);
    notify('已添加演示样例文件', 'success');
  };

  const uploadFiles = (files) => {
    if (!files?.length) return;
    const next = Array.from(files).map((file) => ({ id: `${file.name}-${file.lastModified}`, name: file.name, type: file.name.split('.').pop().toUpperCase(), size: `${Math.max(file.size / 1024 / 1024, 0.01).toFixed(2)} MB`, status: '已上传' }));
    setSampleFiles((current) => [...next, ...current.filter((item) => !next.some((row) => row.id === item.id))]);
    notify(`已上传 ${next.length} 个样例文件`, 'success');
  };

  const runAgent = () => {
    if (!sampleFiles.length) {
      notify('请先上传或添加样例文件', 'error');
      return;
    }
    const [parser, adapter, splitter, storage, qa] = createAgentDemoNodes(catalog);
    const preFixNodes = [parser, splitter].filter(Boolean);
    const adaptedNodes = [parser, adapter, splitter].filter(Boolean);
    const storageNodes = [parser, adapter, splitter, storage].filter(Boolean);
    const finalNodes = [parser, adapter, splitter, storage, qa].filter(Boolean);
    const filesSnapshot = [...sampleFiles];
    setRunning(true);
    setConfirmed(false);
    setRightTab('方案');
    setPlanNodes([]);
    setResults([]);
    setConnectionStates({});
    setNodeRuntime({});
    setSampleFiles((current) => current.map((file) => ({ ...file, status: '已发送' })));
    pushEvent({ role: 'user', title: '发送样例文件', content: `已发送 ${filesSnapshot.length} 个样例文件，并附带已标记问题，请生成正式的知识处理方案。`, status: 'done' });

    let cursor = 0;
    const agentDelay = (delay) => (delay <= 0 ? 0 : Math.max(350, Math.round(delay * 0.58)));
    const step = (delay, action) => {
      cursor += agentDelay(delay);
      window.setTimeout(action, cursor);
    };

    const visibleParams = (node) => node.params.filter((param) => isParamVisible(node, param)).slice(0, 4);
    const collapseRuntimeNodes = (nodes) => {
      const ids = new Set(nodes.map((node) => node.nodeId));
      setPlanNodes((current) => current.map((node) => (ids.has(node.nodeId) ? { ...node, expanded: false } : node)));
    };
    const buildAndSelectToolNode = (nodes, allNodes, title, toolText) => {
      if (!nodes.length) return;
      let buildEventId = '';
      let selectEventId = '';
      const nodeTitle = title.replace('节点', '');
      const toolNames = nodes.map((node) => node.toolName).join('、');
      step(1800, () => {
        setPlanNodes(allNodes);
        setRuntimeForNodes(nodes, { status: 'building' });
        buildEventId = pushEvent({ role: 'thought', title: `设计流程节点：${nodeTitle}`, content: `我会把${nodeTitle}放在当前处理链路中，并确认它与前后节点的职责边界。`, status: 'running' });
      });
      step(2300, () => {
        updateEvent(buildEventId, { status: 'done', content: `${nodeTitle}节点已加入方案。下一步需要为这个节点选择具体 MCP 工具。` });
        setRuntimeForNodes(nodes, { status: 'selectingTool' });
        selectEventId = pushEvent({ role: 'thought', title: `工具选择：${nodeTitle}`, content: `候选依据：${toolText} 选择结果：${toolNames}。`, status: 'running', kind: 'toolCall' });
      });
      step(2300, () => {
        updateEvent(selectEventId, { status: 'done', content: `已选择工具：${toolNames}；所属流程节点：${nodeTitle}。` });
        setRuntimeForNodes(nodes, { status: 'done' });
      });
    };
    const configureToolNode = (nodes, initialDelay = 0) => {
      if (!nodes.length) return;
      let configEventId = '';
      const toolNames = nodes.map((node) => node.toolName).join('、');
      const paramSummary = nodes.flatMap((node) => visibleParams(node).map((param) => param.label)).slice(0, 5).join('、');
      step(initialDelay, () => {
        setRuntimeForNodes(nodes, { status: 'configuring', visibleParamCount: 0 });
        configEventId = pushEvent({ role: 'thought', title: `参数配置：${toolNames}`, content: `配置依据：工具参数定义、样例分析结果、上游输出路径。配置项：${paramSummary}。`, status: 'running', kind: 'toolCall' });
      });
      [1, 2, 3, 4].forEach((count) => {
        step(900, () => setRuntimeForNodes(nodes, { status: 'configuring', visibleParamCount: count }));
      });
      step(900, () => {
        setRuntimeForNodes(nodes, { status: 'configured', visibleParamCount: 4 });
        updateEvent(configEventId, { status: 'done', content: `参数配置完成：${toolNames} 已形成当前方案中的 Step 执行契约。` });
      });
      step(1100, () => {
        setRuntimeForNodes(nodes, { status: 'done' });
        collapseRuntimeNodes(nodes);
      });
    };
    const buildToolNode = (nodes, allNodes, title, toolText) => {
      buildAndSelectToolNode(nodes, allNodes, title, toolText);
      configureToolNode(nodes);
    };

    let analyzeEventId = '';
    let parseEventId = '';
    let queryEventId = '';
    let designEventId = '';
    let checkEventId = '';
    let issueAnalysisEventId = '';
    let resolveEventId = '';
    let recheckEventId = '';
    let executeEventId = '';

    step(800, () => {
      analyzeEventId = pushEvent({ role: 'thought', title: '分析样例文件', content: '我先判断样例文件的类型、内容结构和处理目标，避免直接套用固定流程。', status: 'running' });
    });
    step(2800, () => {
      updateEvent(analyzeEventId, { status: 'done', content: '样例是 PDF 格式的医保政策文档，核心内容包含政策条款、办理条件、材料清单和问答说明。' });
      parseEventId = pushEvent({ role: 'thought', title: '识别文档结构', content: '我会优先保留政策标题、条款层级和来源页码，因为后续分片和问答都依赖这些结构信息。', status: 'running' });
    });
    step(3200, () => {
      updateEvent(parseEventId, { status: 'done', content: '结构识别完成：需要先解析文档，再做结构适配、分片、存储，并基于分片结果生成问答。' });
      setSampleFiles((current) => current.map((file) => ({ ...file, status: '试跑中' })));
      queryEventId = pushEvent({ role: 'thought', title: '工具目录查询', content: '输入：工具状态=可用，分类=文档解析/文本分片/知识提取/系统节点；输出：候选节点清单。', status: 'running', kind: 'toolCall' });
    });
    step(3000, () => {
      updateEvent(queryEventId, { status: 'done', content: `查询结果：命中 ${catalog.filter((tool) => tool.status === '可用').length} 个可用节点，其中包含系统节点和外部接入节点。` });
      designEventId = pushEvent({ role: 'thought', title: '开始设计处理方案', content: '我会先生成主链路，再检查工具返回能否被后置工具直接消费。', status: 'running' });
    });
    step(3300, () => {
      updateEvent(designEventId, { status: 'done', content: '方案设计完成。先搭建主链路，再检查工具输出与下游入参是否需要适配。', kind: 'flow', flowSteps: ['文档解析', '文本分片', '系统节点', '知识提取'] });
    });

    buildAndSelectToolNode([parser], [parser], '文档解析节点', '候选工具=文件解析；选择原因=该工具与 Higress 已发布的文件解析能力一致。');
    buildAndSelectToolNode([splitter], [parser, splitter], '文本分片节点', '候选工具=文本分片；选择原因=该工具与 Higress 已发布的文本分片能力一致。');

    step(2200, () => {
      checkEventId = pushEvent({ role: 'thought', title: '检查节点承接', content: '文本分片工具已选定，我会检查文档解析输出能否被分片工具直接消费，再决定是否继续添加后置节点。', status: 'running' });
    });
    step(7200, () => {
      setPlanNodes(preFixNodes);
      setConnectionStates({ [getConnectionKey(parser.category, splitter.category)]: { status: 'error', reason: '文件解析返回 sections[].content，分片工具需要 data.cleanBlocks，节点之间缺少结构适配。' } });
      updateEvent(checkEventId, { status: 'done', content: '发现适配问题：文件解析返回 sections[].content，分片工具需要 data.cleanBlocks。' });
      issueAnalysisEventId = pushEvent({ role: 'thought', title: '正在分析适配问题', content: '我需要对比解析工具的实际返回和分片工具的参数要求，确认问题是字段命名不一致，还是缺少结构转换。', status: 'running' });
    });
    step(2800, () => {
      updateEvent(issueAnalysisEventId, { status: 'done', content: '问题原因已确认：上游工具未声明稳定 outputSchema，实际返回字段需要先转换成平台可识别的 cleanBlocks。' });
      pushEvent({ role: 'thought', title: '输出解决方案', content: '解决方案：在文档解析节点和文本分片节点之间插入代码执行器，生成 data.cleanBlocks 作为分片工具输入。', status: 'done' });
    });
    step(1600, () => {
      resolveEventId = pushEvent({ role: 'thought', title: '开始解决适配问题', content: '我会在文档解析和文本分片之间插入代码执行器，把解析结果转换成分片工具可识别的数据结构。', status: 'running' });
      setConnectionStates({ [getConnectionKey(parser.category, splitter.category)]: { status: 'resolving', reason: '正在插入代码执行器解决结构适配问题。' } });
    });

    buildToolNode([adapter].filter(Boolean), adaptedNodes, '系统节点', '候选节点=代码执行器；选择原因=需要把 sections[].content 转换为 data.cleanBlocks。');
    configureToolNode([splitter]);

    step(2000, () => {
      setConnectionStates({
        [getConnectionKey(parser.category, adapter.category)]: { status: 'resolved', reason: '代码执行器输出 data.cleanBlocks，分片工具可直接引用。' },
        [getConnectionKey(adapter.category, splitter.category)]: { status: 'resolved', reason: '分片工具输入已改为 data.cleanBlocks。' },
      });
      updateEvent(resolveEventId, { status: 'done', content: '适配问题已解决：代码执行器输出 data.cleanBlocks，分片工具可直接引用。' });
    });
    step(2200, () => {
      setConnectionStates({});
    });

    buildToolNode([storage], storageNodes, '系统节点', '候选节点=数据存储器；选择原因=需要把分片结果写入 ES 供后续检索使用。');
    buildToolNode([qa].filter(Boolean), finalNodes, '知识提取节点', '候选工具=QA提取；选择原因=自动方案先完成问答抽取，知识点提取可在后续手动添加。');

    step(2200, () => {
      setConnectionStates({});
      recheckEventId = pushEvent({ role: 'thought', title: '检查完整方案', content: '我会重新检查修复后的节点顺序、输入输出映射和 Step 执行契约。', status: 'running' });
    });
    step(6800, () => {
      updateEvent(recheckEventId, { status: 'done', content: '方案检查通过：节点顺序、工具参数、变量承接和存储策略均可执行。' });
    });
    step(1800, () => {
      executeEventId = pushEvent({ role: 'thought', title: '样例试跑', content: '输入：医保政策样例.pdf；执行对象：最终 Workflow Step；输出：每个工具的输入、输出和执行状态。', status: 'running', kind: 'toolCall' });
    });
    finalNodes.forEach((node) => {
      step(1700, () => setRuntimeForNodes([node], { status: 'running' }));
      step(1200, () => setRuntimeForNodes([node], { status: 'success' }));
    });
    step(2000, () => {
      setRuntimeForNodes(finalNodes, { status: 'success' });
      updateEvent(executeEventId, { status: 'done', content: '试跑结果：所有工具执行成功；分片结果已写入 ES；问答结果已生成。' });
    });
    step(1200, () => {
      setRuntimeForNodes(finalNodes, { status: 'done' });
      setSampleFiles((current) => current.map((file) => ({ ...file, status: '已完成' })));
      setResults(filesSnapshot.map(createSampleResult));
      pushEvent({ role: 'agent', title: '方案生成与样例执行完成', content: '已完成方案搭建、链路检查、适配修复和样例试跑，可以保存为正式处理方案。', status: 'done' });
      setRunning(false);
      notify('Agent 已完成方案生成和样例执行', 'success');
    });
  };

  const runSmartRepair = (task) => {
    const failure = getFirstPlanFailure(planNodes);
    if (!failure) {
      notify('当前没有检测到需要修复的连接问题', 'info');
      return;
    }
    setRunning(true);
    pushEvent({ role: 'user', title: '处理流程连接问题', content: task.reason, status: 'done' });
    const eventId = pushEvent({ role: 'thought', title: '修复节点承接', content: '正在读取当前流程节点顺序、输入来源和工具输出路径。', status: 'running', kind: 'toolCall' });
    window.setTimeout(() => {
    const repairResult = repairConnectionIssue(planNodes, failure);
    const repaired = repairResult.nodes;
    const repairTargets = repaired.filter((node) => repairResult.targetIds.includes(node.nodeId));
    setPlanNodes(repaired);
    setRuntimeForNodes(repairTargets, { status: 'configuring', visibleParamCount: 2 });
    updateEvent(eventId, { content: repairResult.actionText, status: 'running' });
    setConnectionStates(task.fromCategory && task.toCategory ? { [`${task.fromCategory}->${task.toCategory}`]: { status: 'resolving', reason: failure.reason } } : {});
    window.setTimeout(() => {
      setRuntimeForNodes(repairTargets, { status: 'configured', visibleParamCount: 4 });
      setConnectionStates(task.fromCategory && task.toCategory ? { [`${task.fromCategory}->${task.toCategory}`]: { status: 'resolved', reason: failure.reason } } : {});
      updateEvent(eventId, { content: '节点承接已修复：仅更新受影响节点，未重写其他节点参数。', status: 'done' });
    }, 900);
    window.setTimeout(() => {
      setConnectionStates({});
      setRuntimeForNodes(repairTargets, { status: 'done' });
      pushEvent({ role: 'agent', title: '智能修复完成', content: '当前方案已完成局部修复，可以点击测试重新试跑样例文件。', status: 'done' });
      setRunning(false);
      notify('智能修复完成', 'success');
    }, 1800);
  }, 900);
  };

  const smartConfigureNode = (node, instruction = '') => {
    const configureInstruction = instruction || getSmartConfigureInstruction(node);
    const configured = createSmartConfiguredNode(node, planNodes, configureInstruction);
    const nextNodes = planNodes.map((item) => item.nodeId === node.nodeId ? configured : item);
    const failure = getFirstPlanFailure(nextNodes);
    setRunning(true);
    setConfirmed(false);
    setRightTab('方案');
    setConnectionStates({});
    pushEvent({ role: 'user', title: `设置${node.toolName}参数`, content: configureInstruction, status: 'done' });
    const understandEventId = pushEvent({ role: 'thought', title: `理解${node.toolName}参数需求`, content: '正在读取当前节点位置、上游输出和工具必填参数，准备写入可执行配置。', status: 'running' });
    window.setTimeout(() => {
      updateEvent(understandEventId, { content: `已确认本次只处理「${node.toolName}」的参数配置，不重建其他工具节点。`, status: 'done' });
      setRuntimeForNodes([configured], { status: 'configuring', visibleParamCount: 2 });
    }, 700);
    let configEventId = '';
    window.setTimeout(() => {
      configEventId = pushEvent({ role: 'thought', title: `配置${node.toolName}参数`, content: '根据用户需求补齐输入来源、必填参数和取值路径，并写回当前工具节点。', status: 'running', kind: 'toolCall' });
      setPlanNodes(nextNodes);
      setRuntimeForNodes([configured], { status: 'configuring', visibleParamCount: 4 });
    }, 1300);
    window.setTimeout(() => {
      updateEvent(configEventId, { content: `${node.toolName} 参数已写入，开始校验前后节点连通性。`, status: 'done' });
      setRuntimeForNodes([configured], { status: 'configured', visibleParamCount: 4 });
      if (failure?.fromCategory && failure.toCategory) {
        setConnectionStates({ [`${failure.fromCategory}->${failure.toCategory}`]: { status: 'error', reason: failure.reason } });
      }
    }, 2300);
    window.setTimeout(() => {
      setRuntimeForNodes([configured], { status: 'done' });
      pushEvent({ role: 'agent', title: failure ? '参数已配置，连通性待处理' : '参数配置完成', content: failure ? `已完成「${node.toolName}」参数配置，但方案仍存在连通性问题：${failure.reason}` : `已完成「${node.toolName}」参数配置，并校验通过前后节点的输入输出承接关系。`, status: 'done' });
      setRunning(false);
      notify(failure ? '参数已配置，仍需处理连通性' : 'Agent 已完成工具参数配置', failure ? 'warning' : 'success');
    }, 3200);
  };

  const sendAgentInstruction = () => {
    const instruction = agentInput.trim();
    const task = agentTask;
    setAgentInput('');
    setAgentTask(null);
    if (task?.type === 'connection-fix') {
      runSmartRepair(task);
      return;
    }
    if (task?.type === 'tool-config') {
      const node = planNodes.find((item) => item.nodeId === task.nodeId);
      if (node) smartConfigureNode(node, instruction);
      return;
    }
    if (!instruction) return;
    pushEvent({ role: 'user', title: '调整意见', content: instruction, status: 'done' });
    if (!planNodes.length) {
      pushEvent({ role: 'agent', title: '等待样例处理', content: '当前还没有可调整的处理方案。请先发送样例文件。', status: 'done' });
      return;
    }
    setRunning(true);
    const eventId = pushEvent({ role: 'thought', title: '局部更新方案', content: '正在基于当前方案识别需要调整的节点，不重新生成完整链路。', status: 'running', kind: 'toolCall' });
    window.setTimeout(() => {
      const next = createOptimizedNodes(planNodes, catalog);
      setPlanNodes(next);
      updateEvent(eventId, { content: '更新结果：按当前 Higress 工具链调整节点承接；当前方案中的工具保持不变。', status: 'done' });
      pushEvent({ role: 'agent', title: '方案已调整', content: '右侧流程已按现有方案局部更新，后续节点引用已同步到新的分片结果。', status: 'done' });
      setRunning(false);
      notify('Agent 已调整处理方案', 'success');
    }, 1600);
  };

  const addTool = (tool) => {
    if (!tool) return;
    if (planNodes.some((node) => node.toolId === tool.id) && !tool.allowMultiple) {
      notify('该节点已添加', 'warning');
      return;
    }
    const prev = planNodes[planNodes.length - 1];
    const node = clearManualNodeConfig(createWorkbenchNode(tool, prev && tool.input !== 'sampleFile' ? { type: 'upstream', sourceNodeId: prev.nodeId, outputPath: prev.outputs[0]?.path || 'data.result' } : { type: 'fixed' }));
    setConnectionStates({});
    setPlanNodes((current) => [...current, { ...node, expanded: true, adjusted: true }]);
    setAddOpen(false);
    setConfirmed(false);
    notify(`已添加节点，已归入${node.category}`, 'success');
  };

  const testPlan = () => {
    if (!planNodes.length || !sampleFiles.length) {
      notify('请先准备方案和样例文件', 'error');
      return;
    }
    const failure = getFirstPlanFailure(planNodes);
    if (failure) {
      setConnectionStates({ [`${failure.fromCategory || '上游'}->${failure.toCategory || '当前'}`]: { status: 'error', reason: failure.reason } });
      pushEvent({ role: 'agent', title: '方案测试未通过', content: `试跑已停止：${failure.reason}`, status: 'done' });
      notify('方案测试未通过，失败原因已标记在流程连线上', 'error');
      return;
    }
    setTesting(true);
    setRightTab('方案');
    setResults([]);
    setNodeRuntime({});
    setConfirmed(false);
    setSampleFiles((current) => current.map((file) => ({ ...file, status: '试跑中' })));
    pushEvent({ role: 'user', title: '测试当前方案', content: `使用 ${sampleFiles[0].name} 试跑当前处理方案。`, status: 'done' });
    const executeEventId = pushEvent({ role: 'thought', title: '测试当前方案', content: '按当前方案节点顺序执行样例文件，逐个校验工具输入、输出和下游承接。', status: 'running', kind: 'toolCall' });
    const runnableNodes = planNodes.filter((node) => node.enabled);
    runnableNodes.forEach((node, index) => {
      window.setTimeout(() => setNodeRuntime((current) => ({ ...current, [node.nodeId]: { status: 'running' } })), 300 + index * 450);
      window.setTimeout(() => setNodeRuntime((current) => ({ ...current, [node.nodeId]: { status: 'success' } })), 650 + index * 450);
    });
    window.setTimeout(() => {
      setResults(sampleFiles.map((file) => createSampleResultForPlan(file, runnableNodes)));
      setSampleFiles((current) => current.map((file) => ({ ...file, status: '已完成' })));
      setRuntimeForNodes(runnableNodes, { status: 'done' });
      updateEvent(executeEventId, { content: '测试通过：样例文件已按当前方案完整跑通，结果预览已更新。', status: 'done' });
      setRightTab('结果预览');
      setTesting(false);
      notify('方案测试通过', 'success');
    }, 900 + runnableNodes.length * 450);
  };

  const savePlan = () => {
    if (!canSave) {
      notify('当前方案仍存在校验问题', 'error');
      return;
    }
    if (solution && category) {
      dataStore.upsertCategoryPlan({
        projectId: project.id,
        solutionId: solution.id,
        categoryId: category.id,
        formType: decodeURIComponent(formType || '问答库'),
        status: 'active',
        name: `${category.name}${decodeURIComponent(formType || '问答库')}处理方案`,
        nodes: planNodes.filter((node) => node.toolId && !node.toolId.startsWith('system-')).map((node) => ({
          toolId: node.toolId,
          toolName: node.toolName,
        })),
      });
    }
    setConfirmed(true);
    notify('处理方案已保存', 'success');
  };

  const updateNode = (node) => {
    setPlanNodes((current) => current.map((item) => item.nodeId === node.nodeId ? node : item));
    setEditingNode(null);
    setConfirmed(false);
  };

  const clearManualConnectionStates = () => setConnectionStates({});

  const clearSectionDragState = () => {
    setDraggingSectionId(null);
    setDragInsertTarget(null);
  };

  const moveSectionTo = (sectionId, targetSectionId, position) => {
    if (!canEdit || sectionId === targetSectionId) {
      clearSectionDragState();
      return;
    }
    const sections = getCategorySections(planNodes);
    const from = sections.findIndex((section) => section.sectionId === sectionId);
    if (from < 0) {
      clearSectionDragState();
      return;
    }
    const nextSections = [...sections];
    const [moved] = nextSections.splice(from, 1);
    const targetIndex = nextSections.findIndex((section) => section.sectionId === targetSectionId);
    if (targetIndex < 0) {
      clearSectionDragState();
      return;
    }
    nextSections.splice(position === 'after' ? targetIndex + 1 : targetIndex, 0, moved);
    clearManualConnectionStates();
    setPlanNodes(nextSections.flatMap((section) => section.nodes.map((node) => ({ ...node, adjusted: section.sectionId === sectionId ? true : node.adjusted }))));
    setConfirmed(false);
    clearSectionDragState();
  };

  const getSectionInsertTarget = (event, section) => {
    if (!draggingSectionId || draggingSectionId === section.sectionId) {
      return null;
    }
    const rect = event.currentTarget.getBoundingClientRect();
    const position = event.clientY < rect.top + rect.height / 2 ? 'before' : 'after';
    return { sectionId: section.sectionId, position };
  };

  const updateSectionInsertTarget = (event, section) => {
    const target = getSectionInsertTarget(event, section);
    setDragInsertTarget(target);
  };

  const dropSectionAtInsertTarget = (target = dragInsertTarget) => {
    if (!draggingSectionId || !target) {
      clearSectionDragState();
      return;
    }
    moveSectionTo(draggingSectionId, target.sectionId, target.position);
  };

  const dropToolOnNode = (targetNodeId) => {
    if (!draggingNodeId || draggingNodeId === targetNodeId || !canEdit) return;
    const from = planNodes.findIndex((node) => node.nodeId === draggingNodeId);
    const to = planNodes.findIndex((node) => node.nodeId === targetNodeId);
    if (from < 0 || to < 0) return;
    if (planNodes[from].flowNodeId !== planNodes[to].flowNodeId) return;
    const next = [...planNodes];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, { ...moved, adjusted: true });
    clearManualConnectionStates();
    setPlanNodes(next);
    setConfirmed(false);
    setDraggingNodeId(null);
  };

  return (
    <div className="workbench-page">
      <PageHeader title="方案工作台" subtitle={`${project.name} / ${category?.name || '常见问题'} / ${decodeURIComponent(formType || '问答库')}`} actions={<button type="button" className="secondary" onClick={onBack}><LeftOutlined /> 返回类目</button>} />
      <div className="workbench-grid">
        <aside className="panel sample-column">
          <h3>样例文件上传</h3>
          <input ref={fileRef} type="file" hidden multiple accept=".pdf,.doc,.docx,.xls,.xlsx,.txt" onChange={(event) => uploadFiles(event.target.files)} />
          <button type="button" className="upload-box" onClick={() => fileRef.current?.click()}><UploadOutlined /><strong>点击上传样例文件</strong><span>支持 PDF、Word、Excel、TXT</span></button>
          <button type="button" className="text-link" onClick={addDemoSample}>导入演示样例</button>
          <div className="file-list">
            {sampleFiles.length ? sampleFiles.map((file) => (
              <div className="file-item" key={file.id}>
                <span className="file-type-badge">{file.type || 'FILE'}</span>
                <div className="file-meta"><strong>{file.name}</strong><span>{file.size}</span></div>
                <Badge tone={file.status === '已完成' ? 'success' : file.status === '试跑中' ? 'warning' : 'neutral'}>{file.status}</Badge>
              </div>
            )) : <div className="empty-mini">暂无样例文件</div>}
          </div>
          <h3>已标记问题</h3>
          <div className="issue-box">客户自建解析工具可能不声明输出，需要验证后置工具承接。</div>
          <button type="button" className="primary full" disabled={!sampleFiles.length || running || testing} onClick={runAgent}>{running ? <SyncOutlined spin /> : <SendOutlined />} 发送样例和问题给智能体</button>
          <p className="sample-action-hint">智能体将同时读取样例文件和左侧已标记问题，生成可保存的处理方案。</p>
        </aside>
        <section className="panel agent-column">
          <div className="panel-title"><StarOutlined className="agent-title-icon" /> 处理方案生成助手</div>
          <div className="agent-stream" ref={streamRef}>{events.map((event) => <AgentEvent key={event.id} event={event} />)}</div>
          <div className="agent-input">
            <label className="agent-input-box">
              {agentTask ? <button type="button" className="agent-task-chip" onClick={() => setAgentTask(null)}>{agentTask.type === 'connection-fix' ? '处理流程连接问题' : `设置${agentTask.toolName}参数`} ×</button> : null}
              <input disabled={running || testing} value={agentInput} onChange={(event) => setAgentInput(event.target.value)} placeholder="输入问题或调整意见，例如：政策条款要优先保留层级..." onKeyDown={(event) => { if (event.key === 'Enter' && canSendAgentMessage) sendAgentInstruction(); }} />
            </label>
            <button type="button" disabled={!canSendAgentMessage} onClick={sendAgentInstruction}>{running || testing ? <SyncOutlined spin /> : <SendOutlined />}</button>
          </div>
        </section>
        <aside className="panel plan-column">
          <div className="tabs">{['样例', '方案', '结果预览', '历史版本'].map((tab) => <button type="button" key={tab} className={rightTab === tab ? 'active' : ''} onClick={() => setRightTab(tab)}>{tab}</button>)}</div>
          {rightTab === '方案' ? (
            <div className="plan-tab">
              <div className="plan-summary">
                <strong>{category?.name || '常见问题'} · {decodeURIComponent(formType || '问答库')}</strong>
                <button type="button" className="icon-button primary-mini" disabled={!canEdit} onClick={() => setAddOpen(true)}><PlusOutlined /></button>
              </div>
              <div className="workflow-list">
                {categorySections.length ? categorySections.map((section, index) => {
                  const insertPosition = dragInsertTarget?.sectionId === section.sectionId ? dragInsertTarget.position : null;
                  return (
                    <div
                      className="workflow-section-wrap"
                      key={`${section.sectionId}-${index}`}
                      onDragOver={canEdit ? (event) => {
                        event.preventDefault();
                        updateSectionInsertTarget(event, section);
                      } : undefined}
                      onDrop={canEdit ? (event) => {
                        event.preventDefault();
                        dropSectionAtInsertTarget(getSectionInsertTarget(event, section));
                      } : undefined}
                    >
                      {insertPosition === 'before' ? <div className="workflow-drop-indicator" /> : null}
                      <WorkflowSection
                        section={section}
                        index={index}
                        total={categorySections.length}
                        nodes={planNodes}
                        nodeWarnings={displayedNodeWarnings}
                        rawWarnings={nodeWarnings}
                        nodeRuntime={nodeRuntime}
                        canEdit={canEdit}
                        draggingSectionId={draggingSectionId}
                        draggingNodeId={draggingNodeId}
                        onSectionDragStart={() => setDraggingSectionId(section.sectionId)}
                        onSectionDragEnd={clearSectionDragState}
                        onToolDragStart={setDraggingNodeId}
                        onToolDrop={dropToolOnNode}
                        onEdit={setEditingNode}
                        onToggle={toggleNodeExpanded}
                        onDelete={(node) => { setPlanNodes((current) => current.filter((item) => item.nodeId !== node.nodeId)); setConfirmed(false); }}
                        onSmartConfigure={(node) => setAgentTask({ type: 'tool-config', nodeId: node.nodeId, toolName: node.toolName })}
                      />
                      {insertPosition === 'after' ? <div className="workflow-drop-indicator" /> : null}
                    </div>
                  );
                }) : (
                  <div className="empty-mini large plan-empty">
                    <ThunderboltOutlined />
                    <strong>等待生成知识处理方案</strong>
                    <span>发送样例文件和处理要求，智能体会自动理解文件和需求，生成知识处理方案。</span>
                  </div>
                )}
              </div>
            </div>
          ) : rightTab === '结果预览' ? <ResultPreview results={results} files={sampleFiles} /> : rightTab === '样例' ? <SamplePreview files={sampleFiles} results={results} /> : <div className="empty-mini large">暂无历史版本。</div>}
          <div className="plan-actions">
            {visibleProblems.length && planNodes.length ? <div className="error-line">当前方案存在 {visibleProblems.length} 个校验问题，请处理后保存。</div> : null}
            <button type="button" className="secondary" disabled={!planNodes.length || running || testing} onClick={testPlan}>{testing ? '测试中' : '测试'}</button>
            <button type="button" className="primary" disabled={!canSave} onClick={savePlan}>保存为处理方案</button>
          </div>
        </aside>
      </div>
      {addOpen ? <AddToolDialog tools={catalog} categories={toolCategories} nodes={planNodes} confirmed={confirmed} onClose={() => setAddOpen(false)} onAdd={addTool} /> : null}
      {editingNode ? <EditNodeDialog node={editingNode} nodes={planNodes} onClose={() => setEditingNode(null)} onSave={updateNode} /> : null}
    </div>
  );
}

function AgentEvent({ event }) {
  return (
    <div className={`agent-event ${event.role} ${event.kind === 'toolCall' ? 'tool-call' : ''}`}>
      <strong>{event.status === 'running' ? <SyncOutlined spin /> : event.kind === 'toolCall' ? <StarOutlined /> : null}{event.title}</strong>
      <p>{event.content}</p>
      {event.flowSteps?.length ? <div className="flow-steps">{event.flowSteps.map((step, index) => <span key={step}>{step}{index < event.flowSteps.length - 1 ? ' →' : ''}</span>)}</div> : null}
    </div>
  );
}

function WorkflowSection({
  section,
  index,
  total,
  nodes,
  nodeWarnings,
  rawWarnings,
  nodeRuntime,
  canEdit,
  draggingSectionId,
  draggingNodeId,
  onSectionDragStart,
  onSectionDragEnd,
  onToolDragStart,
  onToolDrop,
  onEdit,
  onToggle,
  onDelete,
  onSmartConfigure,
}) {
  const isBuilding = section.nodes.some((node) => ['building', 'selectingTool', 'configuring'].includes(nodeRuntime[node.nodeId]?.status || ''));
  return (
    <div className={`workflow-section ${isBuilding ? 'building' : ''} ${draggingSectionId === section.sectionId ? 'dragging' : ''}`}>
      <div className="workflow-step">
        <div className={`step-number ${nodeRuntime[section.nodes[0]?.nodeId]?.status === 'running' ? 'running' : ''}`}>{String(index + 1).padStart(2, '0')}</div>
        {index < total - 1 ? (
          <div className="workflow-line" />
        ) : null}
      </div>
      <div
        className="workflow-body"
        draggable={canEdit}
        onDragStart={canEdit ? (event) => {
          event.dataTransfer.effectAllowed = 'move';
          onSectionDragStart();
        } : undefined}
        onDragOver={canEdit ? (event) => {
          event.preventDefault();
        } : undefined}
        onDrop={canEdit ? (event) => {
          event.preventDefault();
        } : undefined}
        onDragEnd={canEdit ? onSectionDragEnd : undefined}
      >
        <div className="workflow-head">
          <strong>{section.category}</strong>
          <div />
        </div>
        <div className="workflow-tools">
          {section.nodes.map((node) => {
            const rawToolWarnings = rawWarnings[node.nodeId] || [];
            return <ToolRuntimeRow key={node.nodeId} node={node} nodes={nodes} warnings={nodeWarnings[node.nodeId] || []} needsSmartHandling={needsSmartToolHandling(node, rawToolWarnings)} runtime={nodeRuntime[node.nodeId]} canEdit={canEdit} canDrag={canEdit && section.nodes.length > 1} isDragging={draggingNodeId === node.nodeId} onDragStart={() => onToolDragStart(node.nodeId)} onDrop={() => onToolDrop(node.nodeId)} onEdit={() => onEdit(node)} onToggle={() => onToggle(node.nodeId)} onDelete={() => onDelete(node)} onSmartConfigure={() => onSmartConfigure(node)} />;
          })}
        </div>
      </div>
    </div>
  );
}

function ToolPendingRow({ status }) {
  return (
    <div className="tool-pending-row">
      <SyncOutlined spin />
      <div>
        <strong>{status === 'building' ? '正在创建节点...' : '正在选择工具...'}</strong>
        <span>{status === 'building' ? 'Agent 正在确定节点位置' : '工具选择完成后显示工具模块'}</span>
      </div>
    </div>
  );
}

function ToolRuntimeRow({ node, nodes, warnings, needsSmartHandling, runtime, canEdit, canDrag, isDragging, onDragStart, onDrop, onEdit, onToggle, onDelete, onSmartConfigure }) {
  const status = runtime?.status || 'done';
  const configured = status === 'configured' || status === 'success';
  if (status === 'building' || status === 'selectingTool') return <ToolPendingRow status={status} />;
  const runtimeExpanded = status === 'configuring';
  const expanded = runtimeExpanded || node.expanded;
  const previewParams = getToolPreviewParams(node);
  const visibleParamCount = runtimeExpanded ? Math.max(runtime?.visibleParamCount || 0, configured ? 4 : 0) : previewParams.length;
  const visibleParams = previewParams.slice(0, visibleParamCount);
  const runtimeLabel = getRuntimeLabel(status);
  return (
    <div
      className={`tool-runtime-row ${warnings.length || needsSmartHandling ? 'warning' : ''} ${configured ? 'success' : ''} ${expanded ? 'expanded' : ''} ${isDragging ? 'dragging' : ''}`}
      draggable={canDrag}
      onDragStart={canDrag ? (event) => {
        event.stopPropagation();
        onDragStart();
      } : undefined}
      onDragOver={canDrag ? (event) => {
        event.preventDefault();
        event.stopPropagation();
      } : undefined}
      onDrop={canDrag ? (event) => {
        event.preventDefault();
        event.stopPropagation();
        onDrop();
      } : undefined}
    >
      <div
        className="tool-runtime-main"
        role="button"
        tabIndex={0}
        onClick={onToggle}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') onToggle();
        }}
      >
        <span className="tool-runtime-icon">{status === 'running' || status === 'configuring' ? <SyncOutlined spin /> : configured ? <CheckCircleOutlined /> : <ToolOutlined />}</span>
        <span className="tool-runtime-name">{node.toolName}</span>
        {needsSmartHandling && canEdit ? (
          <button
            type="button"
            className="smart-button"
            disabled={!canEdit}
            onClick={(event) => {
              event.stopPropagation();
              onSmartConfigure();
            }}
          >
            <StarOutlined />
            <span>智能配置</span>
          </button>
        ) : null}
        {runtimeLabel ? <em>{runtimeLabel}</em> : null}
      </div>
      <div className="tool-runtime-actions">
        <button type="button" disabled={!canEdit} onClick={onEdit}><EditOutlined /></button>
        <button type="button" disabled={!canEdit} className="danger-link" onClick={onDelete}><DeleteOutlined /></button>
      </div>
      {expanded ? (
        <div className="tool-param-preview">
          {visibleParams.length ? visibleParams.map((param) => <span key={param.id}>{param.label}: {getParamPreview(param, nodes)}</span>) : <span>暂无参数</span>}
        </div>
      ) : null}
    </div>
  );
}

function AddToolDialog({ tools, categories, nodes, confirmed, onClose, onAdd }) {
  const [category, setCategory] = useState(allToolsCategory);
  const [selectedId, setSelectedId] = useState(tools[0]?.id || '');
  const cats = [allToolsCategory, ...sortWorkbenchCategories(Array.from(new Set([...(categories || []), ...tools.map((tool) => normalizeWorkbenchCategory(tool.category))].filter(Boolean))))];
  const filtered = category === allToolsCategory ? tools : tools.filter((tool) => tool.category === category);
  const current = tools.find((tool) => tool.id === selectedId) || filtered[0];
  const addedToolIds = new Set(nodes.map((node) => node.toolId));
  const selectedToolAdded = Boolean(current && addedToolIds.has(current.id) && !current.allowMultiple);
  return (
    <Modal
      title="添加节点"
      wide
      className="add-tool-modal"
      onClose={onClose}
      footer={<><button type="button" className="secondary" onClick={onClose}>取消</button><button type="button" className="primary" disabled={!current || selectedToolAdded || confirmed} onClick={() => onAdd(current)}>{selectedToolAdded ? '节点已添加' : confirmed ? '方案已确认' : '确认添加'}</button></>}
    >
      <div className="add-tool-grid">
        <div className="tool-picker-list category-picker"><div className="tool-picker-title">节点分类</div>{cats.map((cat) => <button type="button" key={cat} className={category === cat ? 'active' : ''} onClick={() => { setCategory(cat); setSelectedId((cat === allToolsCategory ? tools : tools.filter((tool) => tool.category === cat))[0]?.id || ''); }}><span>{cat}</span><Badge>{cat === allToolsCategory ? tools.length : tools.filter((tool) => tool.category === cat).length}</Badge></button>)}</div>
        <div className="tool-picker-list tool-list-picker"><div className="tool-picker-title">节点列表</div>{filtered.map((tool) => {
          const isAdded = addedToolIds.has(tool.id) && !tool.allowMultiple;
          return <button type="button" key={tool.id} className={`${selectedId === tool.id ? 'active' : ''} ${isAdded ? 'added' : ''}`.trim()} onClick={() => setSelectedId(tool.id)}><strong>{tool.name}{isAdded ? <Badge>已添加</Badge> : null}</strong><span>{tool.category} · {tool.summary}</span></button>;
        })}</div>
        <div className="tool-detail-mini">{current ? <AddNodeDetail tool={current} /> : null}</div>
      </div>
    </Modal>
  );
}

function AddNodeDetail({ tool }) {
  const inputParamId = tool.inputParamId || tool.params?.find((param) => param.source?.type === 'file' || param.source?.type === 'upstream')?.id;
  const nodeInputs = (tool.params || []).filter((param) => param.id === inputParamId || param.source?.type === 'file' || param.source?.type === 'upstream');
  const inputIds = new Set(nodeInputs.map((param) => param.id));
  const configParams = (tool.params || []).filter((param) => !inputIds.has(param.id));
  const outputRows = (tool.outputs || []).map((output) => ({
    name: output.label || output.name,
    description: output.desc || output.description || output.path || '',
    type: output.type || 'object',
  }));
  return (
    <div className="add-node-detail">
      <AddNodeParamGroup title="节点输入" rows={nodeInputs.map((param) => paramToNodeDetailRow(param))} emptyText="暂无节点输入" showRequired />
      <AddNodeParamGroup title="配置参数" rows={configParams.map((param) => paramToNodeDetailRow(param))} emptyText="暂无配置参数" showRequired />
      <AddNodeParamGroup title="节点输出" rows={outputRows} emptyText="暂无节点输出" />
    </div>
  );
}

function paramToNodeDetailRow(param) {
  return {
    name: param.label || param.name || param.id,
    description: param.desc || param.description || '',
    type: param.schemaType || param.type || 'text',
    required: Boolean(param.required),
  };
}

function AddNodeParamGroup({ title, rows, emptyText, showRequired = false }) {
  return (
    <div className="add-node-param-group">
      <h4>{title}</h4>
      {rows.length ? rows.map((row, index) => (
        <div className="add-node-param-item" key={`${title}-${row.name}-${index}`}>
          <div>
            <span className="add-node-param-title">
              <strong>{row.name}</strong>
              {row.type ? <em>{row.type}</em> : null}
              {showRequired && row.required ? <b>必填</b> : null}
            </span>
            {row.description ? <span>{row.description}</span> : null}
          </div>
        </div>
      )) : <p className="empty-mini">{emptyText}</p>}
    </div>
  );
}

function SimpleNodeConfigParam({ param, onChange }) {
  const updateValue = (value) => onChange({ ...param, value, source: { type: 'manual' } });
  const value = Array.isArray(param.value) ? param.value.join('、') : param.value;
  return (
    <label className="simple-node-param-row">
      <span>{param.label}{param.required ? <em>*</em> : null}</span>
      {param.type === 'select' ? (
        <SelectField value={param.value} onChange={updateValue}>
          {param.options.map((option) => <option key={option} value={option}>{option}</option>)}
        </SelectField>
      ) : param.type === 'multiSelect' || param.type === 'tags' ? (
        <input value={value ?? ''} onChange={(event) => updateValue(event.target.value.split(/[、,]/).filter(Boolean))} />
      ) : param.type === 'textarea' ? (
        <textarea value={value ?? ''} onChange={(event) => updateValue(event.target.value)} />
      ) : (
        <input type={param.type === 'number' ? 'number' : 'text'} value={value ?? ''} onChange={(event) => updateValue(param.type === 'number' ? Number(event.target.value) : event.target.value)} />
      )}
    </label>
  );
}

function NodeOutputReadonlyTable({ outputs }) {
  return (
    <div className="output-schema">
      {outputs.length ? outputs.map((output) => {
        const display = getOutputDisplay(output);
        return (
          <span className="output-item" key={output.path || output.id || output.name}>
            <span className="output-item-title">
              <code>{output.label || output.name || '-'}</code>
              {display.type ? <strong>{display.type}</strong> : null}
            </span>
            <small>{display.description || '-'}</small>
          </span>
        );
      }) : <div className="empty-mini">暂无节点输出</div>}
    </div>
  );
}

function getOutputDisplay(output) {
  const description = output.desc || output.description || '';
  const [typePrefix, ...rest] = description.split('，');
  const inferredType = typePrefix && /^[A-Za-z][A-Za-z0-9_<>{}[\]().|,-]*$/.test(typePrefix.trim()) ? typePrefix.trim() : '';
  const type = output.type || inferredType;
  const cleanedDescription = type && inferredType === type ? rest.join('，') : description;
  return { type, description: cleanedDescription };
}

function ParamEditor({ param, nodes, priorNodes, onChange, singleLine = false, inlineSource = false, showHeader = true, showFx = true }) {
  const active = param.source?.type === 'file' || param.source?.type === 'upstream';
  const sourceType = param.source?.type === 'upstream' ? 'upstream' : param.source?.type === 'file' ? 'file' : 'manual';
  const upstreamNode = priorNodes.find((item) => item.nodeId === param.source?.sourceNodeId) || priorNodes[0];
  const upstreamOutputs = getSelectableNodeOutputs(upstreamNode, param.source?.outputPath);
  const updateSourceType = (type) => {
    if (type === 'manual') onChange({ ...param, source: { type: 'manual' } });
    else if (type === 'file') onChange({ ...param, source: { type: 'file' } });
    else {
      const source = priorNodes.find((node) => node.nodeId === param.source?.sourceNodeId) || priorNodes[0];
      onChange({ ...param, source: source ? { type: 'upstream', sourceNodeId: source.nodeId, outputPath: source.outputs[0]?.path || 'data.result' } : { type: 'file' } });
    }
  };
  const renderManualField = () => param.type === 'textarea' && !singleLine && !inlineSource
    ? <textarea value={Array.isArray(param.value) ? param.value.join('\n') : param.value} onChange={(event) => onChange({ ...param, value: event.target.value })} />
    : param.type === 'select'
      ? <SelectField value={param.value} onChange={(value) => onChange({ ...param, value })}>{param.options.map((option) => <option key={option} value={option}>{option}</option>)}</SelectField>
      : param.type === 'multiSelect' || param.type === 'tags'
        ? <input value={Array.isArray(param.value) ? param.value.join('、') : ''} onChange={(event) => onChange({ ...param, value: event.target.value.split(/[、,]/).filter(Boolean) })} />
        : <input type={param.type === 'number' ? 'number' : 'text'} value={Array.isArray(param.value) ? param.value.join('、') : param.value} onChange={(event) => onChange({ ...param, value: param.type === 'number' ? Number(event.target.value) : event.target.value })} />;

  if (inlineSource) {
    const inlineSourceType = sourceType === 'upstream' ? 'upstream' : 'file';
    return (
      <div className="param-editor-row inline-source">
        <label className="param-name-column">
          <span>{showHeader ? '参数名称' : ''}</span>
          <div className="param-name-display">{param.label}{param.required ? <em>*</em> : null}</div>
        </label>
        <label className="source-field">
          <span>{showHeader ? '取值方式' : ''}</span>
          <SelectField value={inlineSourceType} onChange={updateSourceType}>
            <option value="file">引用原始文件</option>
            <option value="upstream" disabled={priorNodes.length === 0}>引用上游节点输出</option>
          </SelectField>
        </label>
        <div className="param-value-column">
          <span>{showHeader ? '参数值' : ''}</span>
          {inlineSourceType === 'file' ? <input readOnly value="原始文件的地址信息" /> : null}
          {inlineSourceType === 'upstream' ? (
            <div className="param-upstream-setting">
              <PrefixedSelectField label="上游节点" value={param.source?.sourceNodeId || ''} onChange={(value) => {
                  const source = priorNodes.find((item) => item.nodeId === value);
                  onChange({ ...param, source: { type: 'upstream', sourceNodeId: value, outputPath: source?.outputs[0]?.path || 'data.result' } });
                }}>{priorNodes.map((item) => <option key={item.nodeId} value={item.nodeId}>{item.toolName}</option>)}</PrefixedSelectField>
              <PrefixedSelectField label="选择输出" value={param.source?.outputPath || upstreamOutputs[0]?.value || ''} onChange={(outputPath) => onChange({ ...param, source: { ...param.source, type: 'upstream', outputPath } })}>
                {upstreamOutputs.map((output) => <option key={output.value} value={output.value}>{output.label}</option>)}
              </PrefixedSelectField>
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="param-editor-row">
      <label>{param.label}{param.required ? <em>*</em> : null}</label>
      <div className={`param-editor-field ${showFx ? '' : 'no-fx'}`.trim()}>
        {active ? <input readOnly value={getParamPreview(param, nodes)} /> : renderManualField()}
        {showFx ? (
          <button type="button" title="配置参数来源" className={active ? 'fx-button active' : 'fx-button'} onClick={() => {
            if (active) onChange({ ...param, source: { type: 'manual' } });
            else {
              const source = priorNodes[0];
              onChange({ ...param, source: source ? { type: 'upstream', sourceNodeId: source.nodeId, outputPath: source.outputs[0]?.path || 'data.result' } : { type: 'file' } });
            }
          }}>fx</button>
        ) : null}
      </div>
      {active ? (
        <div className="param-source-row">
          <label className="source-field">
            <span>取值方式</span>
            <SelectField value={param.source?.type === 'upstream' ? 'upstream' : 'file'} onChange={updateSourceType}>
              <option value="upstream" disabled={priorNodes.length === 0}>引用上游节点输出</option>
              <option value="file">引用原始文件</option>
            </SelectField>
          </label>
          {param.source?.type === 'upstream' ? (
            <>
              <label className="source-field">
                <span>上游节点</span>
                <SelectField value={param.source.sourceNodeId || ''} onChange={(value) => {
                  const source = priorNodes.find((item) => item.nodeId === value);
                  onChange({ ...param, source: { type: 'upstream', sourceNodeId: value, outputPath: source?.outputs[0]?.path || 'data.result' } });
                }}>{priorNodes.map((item) => <option key={item.nodeId} value={item.nodeId}>{item.toolName}</option>)}</SelectField>
              </label>
              <label className="source-field">
                <span>选择输出</span>
                <SelectField value={param.source.outputPath || upstreamOutputs[0]?.value || ''} onChange={(outputPath) => onChange({ ...param, source: { ...param.source, outputPath } })}>
                  {upstreamOutputs.map((output) => <option key={output.value} value={output.value}>{output.label}</option>)}
                </SelectField>
              </label>
            </>
          ) : (
            <label className="source-field source-field-wide">
              <span>取值内容</span>
              <input readOnly value="文件地址" />
            </label>
          )}
        </div>
      ) : null}
    </div>
  );
}

function EditNodeDialog({ node, nodes, onClose, onSave }) {
  const [draft, setDraft] = useState(cloneWorkbenchNode(node));
  const priorNodes = getPriorNodes(nodes, node.nodeId);
  const scriptParam = draft.params.find((param) => param.id === 'script');
  const normalParams = draft.toolId === 'system-code' ? draft.params.filter((param) => param.id === 'outputVariables') : draft.params;
  const nodeInputParamId = draft.inputParamId || normalParams[0]?.id || '';
  const nodeInputParams = normalParams.filter((param) => param.id === nodeInputParamId);
  const configParams = normalParams.filter((param) => param.id !== nodeInputParamId);
  const updateParam = (nextParam) => setDraft((current) => {
    const isNodeInput = nextParam.id === current.inputParamId;
    const inputSource = isNodeInput
      ? nextParam.source?.type === 'upstream'
        ? { type: 'upstream', sourceNodeId: nextParam.source.sourceNodeId, outputPath: nextParam.source.outputPath }
        : { type: 'fixed' }
      : current.inputSource;
    return { ...current, inputSource, params: current.params.map((param) => param.id === nextParam.id ? nextParam : param) };
  });
  const updateCodeInput = (idValue, patch) => setDraft((current) => ({
    ...current,
    codeInputs: (current.codeInputs || []).map((input) => input.id === idValue ? { ...input, ...patch } : input),
  }));
  const updateCodeInputSource = (idValue, nextParam) => setDraft((current) => {
    const codeInputs = (current.codeInputs || []).map((input) => input.id === idValue ? { ...input, source: nextParam.source, value: nextParam.value } : input);
    const params = current.params.map((param) => param.id === 'codeInput' ? { ...param, source: nextParam.source, value: nextParam.value } : param);
    return { ...current, inputSource: nextParam.source?.type === 'upstream' ? { type: 'upstream', sourceNodeId: nextParam.source.sourceNodeId, outputPath: nextParam.source.outputPath } : current.inputSource, codeInputs, params };
  });
  const addCodeInput = () => setDraft((current) => ({
    ...current,
    codeInputs: [...(current.codeInputs || []), { id: makeId('code-input'), name: `input${(current.codeInputs || []).length + 1}`, source: { type: 'manual' }, value: '' }],
  }));
  const removeCodeInput = (idValue) => setDraft((current) => ({ ...current, codeInputs: (current.codeInputs || []).filter((input) => input.id !== idValue) }));
  const updateCodeOutput = (idValue, patch) => setDraft((current) => {
    const codeOutputs = (current.codeOutputs || []).map((output) => output.id === idValue ? { ...output, ...patch } : output);
    return syncCodeOutputs(current, codeOutputs);
  });
  const addCodeOutput = () => setDraft((current) => syncCodeOutputs(current, [...(current.codeOutputs || []), { id: makeId('code-output'), name: `output${(current.codeOutputs || []).length + 1}`, type: 'json', value: 'data.output' }]));
  const removeCodeOutput = (idValue) => setDraft((current) => syncCodeOutputs(current, (current.codeOutputs || []).filter((output) => output.id !== idValue)));
  return (
    <Modal
      title={(
        <span className="config-modal-title">
          <span className="config-modal-icon"><ToolOutlined /></span>
          <span className="config-modal-title-copy">
            <strong>编辑节点配置</strong>
            <small>{node.toolName} · {node.category}</small>
          </span>
        </span>
      )}
      onClose={onClose}
      wide
      className="config-modal"
      footer={<><button type="button" className="secondary" onClick={onClose}>取消</button><button type="button" className="primary" onClick={() => onSave(draft)}>保存</button></>}
    >
      {draft.toolId === 'system-code' ? (
        <>
          <section className="config-section">
            <div className="config-section-head"><h3>定义入参</h3><button type="button" className="text-link" onClick={addCodeInput}><PlusOutlined /> 添加入参</button></div>
            <div className="code-input-list">
              {(draft.codeInputs || []).map((input, index) => {
                const source = input.source || { type: 'manual' };
                const sourceType = source.type === 'upstream' ? 'upstream' : source.type === 'file' ? 'file' : 'manual';
                const sourceNode = priorNodes.find((item) => item.nodeId === source.sourceNodeId) || priorNodes[0];
                const sourceOutputs = getSelectableNodeOutputs(sourceNode, source.outputPath);
                const updateInputSource = (nextSource) => updateCodeInputSource(input.id, { source: nextSource, value: input.value || '' });
                const updateSourceType = (type) => {
                  if (type === 'manual') updateInputSource({ type: 'manual' });
                  if (type === 'file') updateInputSource({ type: 'file' });
                  if (type === 'upstream') {
                    const nextSourceNode = priorNodes.find((item) => item.nodeId === source.sourceNodeId) || priorNodes[0];
                    updateInputSource(nextSourceNode ? { type: 'upstream', sourceNodeId: nextSourceNode.nodeId, outputPath: source.outputPath || nextSourceNode.outputs[0]?.path || 'data.result' } : { type: 'file' });
                  }
                };
                return (
                  <div className={`code-input-row ${index === 0 ? 'has-header' : ''}`} key={input.id}>
                    <label className="code-input-name-field">
                      <span>{index === 0 ? '参数名称' : ''}</span>
                      <input value={input.name} onChange={(event) => updateCodeInput(input.id, { name: event.target.value })} />
                    </label>
                    <label className="source-field">
                      <span>{index === 0 ? '取值方式' : ''}</span>
                      <SelectField value={sourceType} onChange={updateSourceType}>
                        <option value="manual">手动输入</option>
                        <option value="file">引用原始文件</option>
                        <option value="upstream" disabled={priorNodes.length === 0}>引用上游节点输出</option>
                      </SelectField>
                    </label>
                    <div className="code-input-value-setting">
                      <span>{index === 0 ? '参数值' : ''}</span>
                      {sourceType === 'manual' ? <input value={input.value || ''} onChange={(event) => updateCodeInput(input.id, { value: event.target.value })} /> : null}
                      {sourceType === 'file' ? <input readOnly value="原始文件的地址信息" /> : null}
                      {sourceType === 'upstream' ? (
                        <div className="param-upstream-setting">
                          <PrefixedSelectField label="上游节点" value={source.sourceNodeId || ''} onChange={(value) => {
                              const nextSourceNode = priorNodes.find((item) => item.nodeId === value);
                              updateInputSource({ type: 'upstream', sourceNodeId: value, outputPath: nextSourceNode?.outputs[0]?.path || 'data.result' });
                            }}>{priorNodes.map((item) => <option key={item.nodeId} value={item.nodeId}>{item.toolName}</option>)}</PrefixedSelectField>
                          <PrefixedSelectField label="选择输出" value={source.outputPath || sourceOutputs[0]?.value || ''} onChange={(outputPath) => updateInputSource({ ...source, type: 'upstream', outputPath })}>
                            {sourceOutputs.map((output) => <option key={output.value} value={output.value}>{output.label}</option>)}
                          </PrefixedSelectField>
                        </div>
                      ) : null}
                    </div>
                    <button type="button" className="code-row-delete-button" onClick={() => removeCodeInput(input.id)}><DeleteOutlined /></button>
                  </div>
                );
              })}
            </div>
          </section>
          <section className="config-section">
            <div className="config-section-head"><h3>代码脚本 <span className="code-lang-chip">Python</span></h3></div>
            {scriptParam ? <ParamEditor param={scriptParam} nodes={nodes} priorNodes={priorNodes} onChange={updateParam} showFx={false} /> : null}
          </section>
          <section className="config-section">
            <div className="config-section-head"><h3>定义脚本输出参数</h3><button type="button" className="text-link" onClick={addCodeOutput}><PlusOutlined /> 添加出参</button></div>
            <div className="code-output-list">
              {(draft.codeOutputs || []).length ? (draft.codeOutputs || []).map((output, index) => (
                <div className={`code-output-row ${index === 0 ? 'has-header' : ''}`} key={output.id}>
                  <label className="code-output-field">
                    <span>{index === 0 ? '参数名称' : ''}</span>
                    <input value={output.name} onChange={(event) => updateCodeOutput(output.id, { name: event.target.value })} />
                  </label>
                  <label className="code-output-field">
                    <span>{index === 0 ? '参数类型' : ''}</span>
                    <SelectField value={output.type} onChange={(value) => updateCodeOutput(output.id, { type: value })}>{['string', 'number', 'boolean', 'object', 'json', 'Array<json>'].map((type) => <option key={type} value={type}>{type}</option>)}</SelectField>
                  </label>
                  <label className="code-output-field">
                    <span>{index === 0 ? '脚本返回' : ''}</span>
                    <input value={output.value} onChange={(event) => updateCodeOutput(output.id, { value: event.target.value })} />
                  </label>
                  <button type="button" onClick={() => removeCodeOutput(output.id)}><DeleteOutlined /></button>
                </div>
              )) : <div className="empty-mini">暂无脚本出参</div>}
            </div>
          </section>
        </>
      ) : (
        <>
          <section className="config-section">
            <div className="config-section-head"><h3>节点输入</h3></div>
            <div className="param-list">
              {nodeInputParams.length ? nodeInputParams.map((param, index) => <ParamEditor key={param.id} param={param} nodes={nodes} priorNodes={priorNodes} onChange={updateParam} singleLine={index === 0} inlineSource showHeader={index === 0} />) : <div className="empty-mini">暂无节点输入</div>}
            </div>
          </section>
          <section className="config-section">
            <div className="config-section-head"><h3>配置参数</h3></div>
            <div className="simple-node-param-list">
              {configParams.length ? configParams.map((param) => <SimpleNodeConfigParam key={param.id} param={param} onChange={updateParam} />) : <div className="empty-mini">暂无配置参数</div>}
            </div>
          </section>
        </>
      )}
      <section className="config-section">
        <div className="config-section-head"><h3>节点输出</h3></div>
        <NodeOutputReadonlyTable outputs={draft.outputs || []} />
      </section>
    </Modal>
  );
}

function syncCodeOutputs(node, codeOutputs) {
  const outputs = [makeOutput('scriptResult', '脚本处理结果', '代码脚本返回的完整结果。', 'data.scriptResult', 'json'), ...codeOutputs.map((output) => makeOutput(output.id, output.name, '代码执行器输出变量。', output.value, output.type))];
  const outputVariables = JSON.stringify(codeOutputs.map((output) => ({ name: output.name, type: output.type, path: output.value })), null, 2);
  return {
    ...node,
    codeOutputs,
    outputs,
    params: node.params.map((param) => param.id === 'outputVariables' ? { ...param, value: outputVariables } : param),
  };
}

function ResultPreview({ results, files = [] }) {
  if (!files.length) return <div className="empty-mini large">还没有样例文件，上传并执行后展示结果。</div>;
  if (!results.length) return <div className="empty-mini large">Agent 执行方案后，将按工具展示本次调用参数和完整输出。</div>;
  const visibleRuns = (toolRuns = []) => {
    const failedIndex = toolRuns.findIndex((run) => run.status === '失败');
    return failedIndex >= 0 ? toolRuns.slice(0, failedIndex + 1) : toolRuns;
  };
  return (
    <div className="result-list">
      {files.map((file) => {
            const result = results.find((item) => item.fileId === file.id);
            return (
              <section className="sample-result-group" key={file.id}>
                <div className="sample-result-head">
                  <span className="file-type-badge">{file.type || 'FILE'}</span>
                  <div>
                    <strong>{file.name}</strong>
                    <span>{file.size}</span>
                  </div>
                  <Badge tone={file.status === '已完成' ? 'success' : file.status === '试跑中' ? 'warning' : 'neutral'}>{file.status}</Badge>
            </div>
            {result ? visibleRuns(result.toolRuns).map((run) => <ToolRunResultCard key={`${result.fileId}-${run.toolName}`} run={run} />) : <div className="empty-mini">等待执行结果</div>}
          </section>
        );
      })}
    </div>
  );
}

function ToolRunResultCard({ run }) {
  const success = run.status === '成功';
  return (
    <section className="run-card">
      <div className="run-card-head">
        <div>
          <strong>{run.toolName}</strong>
          <span>{run.category}</span>
        </div>
      </div>
      <div className="run-block">
        <h4>参数配置</h4>
        <div className="run-params">{run.parameters.map((param) => <span key={`${run.toolName}-${param.name}`}><em>{param.name}</em><b>{param.value}</b></span>)}</div>
      </div>
      {success && run.outputFull ? (
        <div className="run-block">
          <h4>完整输出 <code>{run.outputPath}</code></h4>
          <pre>{run.outputFull}</pre>
        </div>
      ) : null}
    </section>
  );
}

function SamplePreview({ files, results = [] }) {
  const processed = files.filter((file) => file.status === '已完成' || results.some((result) => result.fileId === file.id));
  if (!processed.length) return <div className="empty-mini large">还没有已处理样例。</div>;
  return <div className="file-list processed-list">{processed.map((file) => (
    <div className="file-item" key={file.id}>
      <span className="file-type-badge">{file.type || 'FILE'}</span>
      <div className="file-meta"><strong>{file.name}</strong><span>{file.size}</span></div>
      <Badge tone="success">已处理</Badge>
    </div>
  ))}</div>;
}

export function App() {
  const params = new URLSearchParams(window.location.search);
  const [active, setActive] = useState(params.get('screen') || 'ops-projects');
  const [projectId, setProjectId] = useState(dataStore.getProjects()[0]?.id);
  const [workbenchTarget, setWorkbenchTarget] = useState({ projectId: dataStore.getProjects()[0]?.id, categoryId: 'cat-wealth-fund', formType: '问答库' });
  const [toast, setToast] = useState(null);
  const notify = (message, type = 'info') => setToast({ message, type });
  const openSolution = (id) => { setProjectId(id); setActive('ops-category'); };
  const openWorkbench = (id, categoryId = 'cat-wealth-fund', formType = '问答库') => { setWorkbenchTarget({ projectId: id, categoryId, formType }); setActive('ops-workbench'); };

  let content;
  if (active === 'admin-mcp') content = <McpServicePage notify={notify} />;
  else if (active === 'admin-tools') content = <ToolManagementPage notify={notify} />;
  else if (active === 'ops-projects') content = <ProjectManagementPage notify={notify} onOpenSolution={openSolution} onOpenWorkbench={openWorkbench} />;
  else if (active === 'ops-category') content = <ProjectSolutionPage projectId={projectId} notify={notify} onBack={() => setActive('ops-projects')} onWorkbench={openWorkbench} />;
  else if (active === 'ops-workbench') content = <WorkbenchPage {...workbenchTarget} notify={notify} onBack={() => setActive('ops-category')} />;
  else if (active === 'ops-result' || active === 'ops-knowledge-points') content = <KnowledgePointsPage />;
  else if (active === 'ops-slice-library') content = <EmptyPage title="切片库" />;
  else if (active === 'ops-qa-library') content = <EmptyPage title="QA库" />;
  else content = <EmptyPage title={active} />;

  return (
    <Shell active={active} onNavigate={(key) => {
      if (key === 'ops-category') setProjectId(projectId || dataStore.getProjects()[0]?.id);
      if (key === 'ops-workbench') setWorkbenchTarget((current) => ({ projectId: current.projectId || dataStore.getProjects()[0]?.id, categoryId: current.categoryId || 'cat-wealth-fund', formType: current.formType || '问答库' }));
      setActive(key === 'ops-result' ? 'ops-knowledge-points' : key);
    }}>
      {content}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </Shell>
  );
}
