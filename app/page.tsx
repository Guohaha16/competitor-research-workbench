'use client';

import {
  AlertTriangle, ArrowUpRight, Camera, Check, CheckCircle2, ChevronRight, CircleDot, Clipboard,
  FileDown, FolderKanban, GitBranch, GripVertical, Image as ImageIcon, Inbox, LayoutGrid, Menu, Mic2,
  MoreHorizontal, Plus, Search, Sparkles, Square, Target, Upload,
  UserRound, X,
} from 'lucide-react';
import { type DragEvent, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';

type View = 'overview' | 'framework' | 'journey' | 'solution';
type Priority = 'P0' | 'P1' | 'P2';
type EvidenceImage = { id?: string; src: string; caption: string };
type Feature = { id: string; name: string; category: string; description: string; competitors: string[]; priority: Priority; evidence: string; screenshots?: EvidenceImage[] };
type JourneyStep = { id: string; title: string; note: string; status: 'observed' | 'inferred'; screenshots?: EvidenceImage[] };
type FrictionPoint = { id?: string; title: string; description: string; stage?: string; severity?: 'low' | 'medium' | 'high'; productFriction?: boolean };
type RecordingSummary = { competitor?: string; recordedAt?: string; summary?: string; duration?: string; frictions?: FrictionPoint[]; frictionPoints?: FrictionPoint[] };
type Workspace = { features: Feature[]; journey: JourneyStep[]; solution: string[] };
type ReviewDraft = { features: Feature[]; journey: JourneyStep[]; recording?: RecordingSummary };

const competitorNames = ['Notion', 'Coda', 'Craft'];
const initialFeatures: Feature[] = [
  { id: 'f1', name: 'AI 内容生成', category: 'AI 助手', description: '基于上下文生成、改写与总结内容，降低从空白开始的成本。', competitors: ['Notion', 'Coda'], priority: 'P0', evidence: '官网功能页 · 2026-08-28' },
  { id: 'f2', name: '多维表格', category: '结构化数据', description: '把页面与数据库连接，支持筛选、视图和关系字段。', competitors: ['Notion', 'Coda'], priority: 'P0', evidence: '产品实测 · 3 个操作步骤' },
  { id: 'f3', name: '发布为网站', category: '分享与协作', description: '将内容页面公开发布，并提供基础权限和域名能力。', competitors: ['Notion', 'Craft'], priority: 'P1', evidence: '帮助中心 · 2026-08-27' },
  { id: 'f4', name: '自动化工作流', category: '自动化', description: '由状态、时间或数据变化触发动作与跨工具通知。', competitors: ['Coda'], priority: 'P1', evidence: '录制会话 · 5 个操作步骤' },
  { id: 'f5', name: '离线编辑', category: '编辑体验', description: '断网时继续编辑，并在恢复连接后同步变更。', competitors: ['Craft'], priority: 'P2', evidence: '应用商店说明 · 2026-08-26' },
];
const initialJourney: JourneyStep[] = [
  { id: 'j1', title: '创建工作空间', note: '选择个人使用模板，跳过团队邀请', status: 'observed' },
  { id: 'j2', title: '从模板开始', note: '浏览模板库并复制项目管理模板', status: 'observed' },
  { id: 'j3', title: '调整结构', note: '新增状态字段并切换到看板视图', status: 'observed' },
  { id: 'j4', title: '邀请协作者', note: '通过链接分享，预计在此发生价值确认', status: 'inferred' },
];
const navItems: { id: View; label: string; icon: typeof LayoutGrid }[] = [
  { id: 'overview', label: '调研概览', icon: LayoutGrid }, { id: 'framework', label: '功能框架', icon: GitBranch },
  { id: 'journey', label: '用户旅程', icon: UserRound }, { id: 'solution', label: '方案设计', icon: FolderKanban },
];
const categoryColors: Record<string, string> = { 'AI 助手': 'violet', '结构化数据': 'cyan', '分享与协作': 'blue', '自动化': 'orange', '编辑体验': 'green', '其他': 'gray' };
const makeId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;

export default function Home() {
  const [view, setView] = useState<View>('overview');
  const [workspace, setWorkspace] = useState<Workspace>({ features: initialFeatures, journey: initialJourney, solution: ['f1', 'f2', 'f3'] });
  const [quickInput, setQuickInput] = useState('');
  const [recording, setRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [awaitingResult, setAwaitingResult] = useState(false);
  const [pendingReview, setPendingReview] = useState<ReviewDraft | null>(null);
  const [reviewSelection, setReviewSelection] = useState<string[]>([]);
  const [loadingLatest, setLoadingLatest] = useState(false);
  const [toast, setToast] = useState('');
  const [mobileNav, setMobileNav] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = window.localStorage.getItem('scope-competitor-workspace');
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved) as Workspace;
      const frame = window.requestAnimationFrame(() => setWorkspace(parsed));
      return () => window.cancelAnimationFrame(frame);
    } catch {
      return;
    }
  }, []);
  useEffect(() => { window.localStorage.setItem('scope-competitor-workspace', JSON.stringify(workspace)); }, [workspace]);
  useEffect(() => { if (!recording) return; const timer = window.setInterval(() => setRecordingSeconds((value) => value + 1), 1000); return () => window.clearInterval(timer); }, [recording]);
  const categories = useMemo(() => Array.from(new Set(workspace.features.map((item) => item.category))), [workspace.features]);
  function notify(message: string) { setToast(message); window.setTimeout(() => setToast(''), 2200); }
  function addQuickFeature() {
    const text = quickInput.trim(); if (!text) return;
    const category = /AI|智能|生成|总结/i.test(text) ? 'AI 助手' : /表格|数据库|字段|筛选/.test(text) ? '结构化数据' : /分享|协作|评论|发布/.test(text) ? '分享与协作' : /自动|触发|工作流/.test(text) ? '自动化' : '其他';
    const feature: Feature = { id: makeId('f'), name: text.split(/[，。；;,.]/)[0].slice(0, 18), category, description: text, competitors: ['Notion'], priority: 'P2', evidence: '手动输入 · 待补充证据' };
    setWorkspace((current) => ({ ...current, features: [feature, ...current.features] })); setQuickInput(''); notify(`已拆解并加入「${category}」`);
  }
  function toggleRecording() {
    if (recording) {
      setRecording(false); setAwaitingResult(true); notify('计时已结束；在 Codex 发送“结束录制”，再回这里查看结果');
    } else { setRecordingSeconds(0); setAwaitingResult(false); setRecording(true); notify('记录计时已开始'); }
  }
  async function copyRecordingPrompt() { await navigator.clipboard.writeText('使用 $competitor-research-workbench 进入工作流录制模式。先说明监控范围和隐私注意事项，等我明确确认后再观察我接下来对竞品的操作；开始前无需询问“本次操作目标”，请从我的实际操作中识别任务。我说“结束录制”时立即停止。在入口、重要选择、成功、失败或付费拦截等关键步骤截图，并把截图绑定到对应功能说明和用户旅程。结束后不要直接写入现有功能框架或用户旅程；将可审阅结果保存到项目的 public/recordings/latest.json，截图放在 public/recordings/对应会话目录，并告诉我回到网页点击“查看最新录制”。'); notify('录制指令已复制，直接粘贴到 Codex 即可'); }
  function toggleSolution(id: string) { setWorkspace((current) => ({ ...current, solution: current.solution.includes(id) ? current.solution.filter((item) => item !== id) : [...current.solution, id] })); }
  function cyclePriority(id: string) { const order: Priority[] = ['P0', 'P1', 'P2']; setWorkspace((current) => ({ ...current, features: current.features.map((feature) => feature.id === id ? { ...feature, priority: order[(order.indexOf(feature.priority) + 1) % order.length] } : feature) })); }
  function setFeaturePriority(id: string, priority: Priority) { setWorkspace((current) => ({ ...current, features: current.features.map((feature) => feature.id === id ? { ...feature, priority } : feature), solution: current.solution.includes(id) ? current.solution : [...current.solution, id] })); }
  function exportWorkspace() { const blob = new Blob([JSON.stringify(workspace, null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob); const anchor = document.createElement('a'); anchor.href = url; anchor.download = `竞品调研-${new Date().toISOString().slice(0, 10)}.json`; anchor.click(); URL.revokeObjectURL(url); notify('项目数据已导出'); }
  function stageReview(parsed: unknown) {
    if (!parsed || typeof parsed !== 'object') throw new Error();
    const result = parsed as { features?: Feature[]; journey?: JourneyStep[]; recording?: RecordingSummary };
    if (!Array.isArray(result.features) || !Array.isArray(result.journey)) throw new Error();
    const draft: ReviewDraft = { features: result.features, journey: result.journey, recording: result.recording };
    setPendingReview(draft); setReviewSelection([...draft.features.map((item) => `feature:${item.id}`), ...draft.journey.map((item) => `journey:${item.id}`)]); setAwaitingResult(false);
  }
  function importWorkspace(file: File) { const reader = new FileReader(); reader.onload = () => { try { if (typeof reader.result !== 'string') throw new Error(); stageReview(JSON.parse(reader.result)); notify('录制结果已打开，请逐项审阅'); } catch { notify('没有识别出有效的录制结果'); } }; reader.readAsText(file); }
  async function loadLatestRecording() {
    setLoadingLatest(true);
    try { const response = await fetch(`/recordings/latest.json?t=${Date.now()}`, { cache: 'no-store' }); if (!response.ok) throw new Error(); stageReview(await response.json()); notify('已打开最新一次录制'); }
    catch { notify('还没有找到录制结果；也可以把结果文件拖到这里'); }
    finally { setLoadingLatest(false); }
  }
  function toggleReviewItem(key: string) { setReviewSelection((current) => current.includes(key) ? current.filter((item) => item !== key) : [...current, key]); }
  function confirmReview() {
    if (!pendingReview) return;
    const features = pendingReview.features.filter((item) => reviewSelection.includes(`feature:${item.id}`));
    const journey = pendingReview.journey.filter((item) => reviewSelection.includes(`journey:${item.id}`));
    setWorkspace((current) => ({
      ...current,
      features: [...features, ...current.features.filter((item) => !features.some((incoming) => incoming.id === item.id))],
      journey: [...current.journey.filter((item) => !journey.some((incoming) => incoming.id === item.id)), ...journey],
    }));
    setPendingReview(null); setReviewSelection([]); notify(`已保存 ${features.length} 个功能和 ${journey.length} 个旅程步骤`);
  }
  function discardReview() { setPendingReview(null); setReviewSelection([]); notify('已取消本次解析结果'); }

  return <main className="app-shell">
    <aside className={`sidebar ${mobileNav ? 'sidebar-open' : ''}`}>
      <div className="brand"><div className="brand-mark"><CircleDot size={18}/></div><div><strong>Scope</strong><span>竞品研究工作台</span></div><button className="icon-button mobile-close" onClick={() => setMobileNav(false)} aria-label="关闭导航"><X size={18}/></button></div>
      <div className="project-switcher"><span className="project-logo">N</span><div><strong>协作型文档</strong><span>3 个竞品 · 28 条证据</span></div><MoreHorizontal size={17}/></div>
      <nav className="main-nav" aria-label="主要导航"><p className="nav-label">研究空间</p>{navItems.map((item) => { const Icon = item.icon; return <button key={item.id} className={view === item.id ? 'active' : ''} onClick={() => { setView(item.id); setMobileNav(false); }}><Icon size={18}/><span>{item.label}</span>{item.id === 'framework' && <em>{workspace.features.length}</em>}</button>; })}</nav>
      <div className="sidebar-section"><div className="section-label"><span>竞品列表</span><Plus size={15}/></div>{competitorNames.map((name, index) => <button className="competitor-row" key={name}><span className={`competitor-dot dot-${index + 1}`}>{name[0]}</span><span>{name}</span><small>{[12, 9, 7][index]}</small></button>)}</div>
      <div className="sidebar-footer"><div className="avatar">研</div><div><strong>我的研究空间</strong><span>本地自动保存</span></div><Check size={16} className="saved-check"/></div>
    </aside>
    <section className="workspace"><header className="topbar"><button className="icon-button mobile-menu" onClick={() => setMobileNav(true)} aria-label="打开导航"><Menu size={19}/></button><div><p className="eyebrow">协作型文档 / {navItems.find((item) => item.id === view)?.label}</p><h1>{navItems.find((item) => item.id === view)?.label}</h1></div><div className="topbar-actions"><label className="search-box"><Search size={16}/><input aria-label="搜索" placeholder="搜索功能、证据…"/></label><input ref={fileRef} hidden type="file" accept="application/json" onChange={(event) => { const file = event.target.files?.[0]; if (file) importWorkspace(file); event.target.value = ''; }}/><button className="button ghost" onClick={() => fileRef.current?.click()}><Upload size={16}/><span>打开录制结果</span></button><button className="button primary" onClick={exportWorkspace}><FileDown size={16}/><span>导出项目</span></button></div></header>
      <div className="content">
        {view === 'overview' && <Overview quickInput={quickInput} setQuickInput={setQuickInput} addQuickFeature={addQuickFeature} recording={recording} recordingSeconds={recordingSeconds} awaitingResult={awaitingResult} toggleRecording={toggleRecording} copyRecordingPrompt={copyRecordingPrompt} openImport={() => fileRef.current?.click()} importWorkspace={importWorkspace} loadLatestRecording={loadLatestRecording} loadingLatest={loadingLatest} pendingReview={pendingReview} reviewSelection={reviewSelection} toggleReviewItem={toggleReviewItem} confirmReview={confirmReview} discardReview={discardReview}/>} 
        {view === 'framework' && <Framework categories={categories} features={workspace.features} cyclePriority={cyclePriority} toggleSolution={toggleSolution} solution={workspace.solution}/>} 
        {view === 'journey' && <Journey journey={workspace.journey} recording={recording} toggleRecording={toggleRecording} copyRecordingPrompt={copyRecordingPrompt}/>} 
        {view === 'solution' && <Solution features={workspace.features} solution={workspace.solution} toggleSolution={toggleSolution} setFeaturePriority={setFeaturePriority}/>} 
      </div></section>
    {mobileNav && <button className="nav-scrim" onClick={() => setMobileNav(false)} aria-label="关闭导航"/>}{toast && <div className="toast"><Check size={16}/>{toast}</div>}
  </main>;
}

function Overview(props: { quickInput: string; setQuickInput: (value: string) => void; addQuickFeature: () => void; recording: boolean; recordingSeconds: number; awaitingResult: boolean; toggleRecording: () => void; copyRecordingPrompt: () => void; openImport: () => void; importWorkspace: (file: File) => void; loadLatestRecording: () => void; loadingLatest: boolean; pendingReview: ReviewDraft | null; reviewSelection: string[]; toggleReviewItem: (key: string) => void; confirmReview: () => void; discardReview: () => void }) {
  const minutes = String(Math.floor(props.recordingSeconds / 60)).padStart(2, '0'); const seconds = String(props.recordingSeconds % 60).padStart(2, '0');
  const [dragging, setDragging] = useState(false);
  const frictions = props.pendingReview?.recording?.frictions ?? props.pendingReview?.recording?.frictionPoints ?? [];
  const screenshotCount = props.pendingReview ? [...props.pendingReview.features, ...props.pendingReview.journey].reduce((count, item) => count + (item.screenshots?.length ?? 0), 0) : 0;
  return <>
    <section className="research-focus">
      <div className="focus-copy"><span className="live-dot"/><div><p>当前研究问题</p><h2>协作型文档如何用 AI 缩短从想法到执行的路径？</h2><span>聚焦 Notion、Coda 与 Craft · 最近更新于今天 14:20</span></div></div>
      <button><Target size={16}/>编辑研究目标</button>
    </section>

    <section className="input-hub">
      <header><div><p className="eyebrow">采集入口</p><h2>添加新的研究证据</h2></div><span>选择一种输入方式</span></header>
      <div className="input-options">
        <article className={`workflow-input ${props.recording ? 'is-recording' : ''}`}>
          <div className="input-option-head"><span className="input-mode-icon record"><Mic2 size={20}/></span><span className="recommended">推荐</span></div>
          <div className="input-option-copy"><h3>录制产品工作流</h3><p>让 Codex 观察真实操作，在关键节点截图，并自动提取功能、旅程与摩擦点。</p></div>
          <ol className="recording-guide">
            <li><span>1</span><div><strong>复制指令到 Codex</strong><p>粘贴发送后，只需确认监控范围；不需要提前描述本次操作目标。</p></div></li>
            <li><span>2</span><div><strong>正常操作目标产品</strong><p>Codex 从实际操作识别任务，并在入口、关键选择、成功或失败时截图。</p></div></li>
            <li><span>3</span><div><strong>发送“结束录制”</strong><p>Codex 会停止观察，把步骤、功能、摩擦点及截图整理成一次录制结果。</p></div></li>
            <li><span>4</span><div><strong>回网页查看结果</strong><p>点击“查看最新录制”，像看报告一样逐项审阅；确认后才进入正式资料。</p></div></li>
          </ol>
          <div className="workflow-status"><span className="status-ring">{props.recording ? <Square size={16} fill="currentColor"/> : props.awaitingResult ? <Inbox size={17}/> : <CircleDot size={19}/>}</span><div><strong>{props.recording ? `${minutes}:${seconds}` : props.awaitingResult ? '录制结束后回到这里' : '准备开始录制'}</strong><span>{props.recording ? '网页仅记录会话进度，观察和截图由 Codex 执行' : props.awaitingResult ? '点击下方按钮即可查看，不需要处理 JSON' : '先复制指令并在 Codex 中发送'}</span></div></div>
          <div className="input-option-actions workflow-actions"><button className="secondary-input-action" onClick={props.copyRecordingPrompt}><Clipboard size={14}/>复制 Codex 指令</button>{props.awaitingResult ? <button className="record-input-action" onClick={props.loadLatestRecording}><Inbox size={14}/>查看最新录制</button> : <button className="record-input-action" onClick={props.toggleRecording}>{props.recording ? '结束计时' : '开始录制'} <ArrowUpRight size={15}/></button>}</div>
        </article>

        <article className="manual-input">
          <div className="input-option-head"><span className="input-mode-icon manual"><Sparkles size={19}/></span><span className="shortcut">⌘ + Enter</span></div>
          <div className="input-option-copy"><h3>快捷记录发现</h3><p>输入一条观察，AI 会拆解为功能并标记待补充证据。</p></div>
          <textarea value={props.quickInput} onChange={(e) => props.setQuickInput(e.target.value)} onKeyDown={(event) => { if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') props.addQuickFeature(); }} placeholder="例如：Notion AI 能总结选中的长文，但高级模型需要额外付费…"/>
          <div className="input-option-actions manual-actions"><button className="secondary-input-action" onClick={props.openImport}><Upload size={14}/>打开已有结果</button><button className="manual-input-action" onClick={props.addQuickFeature}>拆解并加入框架 <ArrowUpRight size={15}/></button></div>
        </article>
      </div>
    </section>

    <section className={`result-inbox ${props.pendingReview ? 'has-result' : ''}`}>
      {!props.pendingReview ? <div className={`result-empty ${dragging ? 'is-dragging' : ''}`} onDragEnter={() => setDragging(true)} onDragLeave={() => setDragging(false)} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); setDragging(false); const file = event.dataTransfer.files?.[0]; if (file) props.importWorkspace(file); }}>
        <span className="result-empty-icon"><Inbox size={22}/></span><div><p className="eyebrow">录制结果收件箱</p><h2>结束录制后，在这里看本次发现</h2><p>网页会把功能、操作步骤、摩擦点和关键截图整理成卡片。不需要打开或理解 JSON。</p></div><div className="result-empty-actions"><button className="button primary" onClick={props.loadLatestRecording} disabled={props.loadingLatest}><Inbox size={16}/>{props.loadingLatest ? '正在查找…' : '查看最新录制'}</button><button className="button ghost" onClick={props.openImport}><Upload size={15}/>选择结果文件</button></div><small>备用方式：也可以把 Codex 生成的结果文件直接拖到这个区域。</small>
      </div> : <>
        <header className="result-summary"><div><span className="review-icon"><CheckCircle2 size={18}/></span><div><p className="eyebrow">待你确认 · 不会自动写入</p><h2>{props.pendingReview.recording?.competitor ? `${props.pendingReview.recording.competitor} 录制结果` : '本次录制结果'}</h2><span>{props.pendingReview.recording?.summary || '逐项查看 Codex 从实际操作中识别出的内容。'}</span></div></div><div className="result-stats"><span><strong>{props.pendingReview.features.length}</strong> 个功能</span><span><strong>{props.pendingReview.journey.length}</strong> 个步骤</span><span><strong>{screenshotCount}</strong> 张截图</span></div></header>
        <div className="review-groups">
          <section><div className="review-group-head"><h3>识别出的功能</h3><span>{props.pendingReview.features.length} 项</span></div>{props.pendingReview.features.map((feature) => { const key = `feature:${feature.id}`; return <label className="review-row review-row-rich" key={key}><input type="checkbox" checked={props.reviewSelection.includes(key)} onChange={() => props.toggleReviewItem(key)}/><span className={`category-dot ${categoryColors[feature.category] || 'gray'}`}/><div><div className="review-title"><strong>{feature.name}</strong><em className={`priority ${feature.priority.toLowerCase()}`}>{feature.priority}</em></div><p>{feature.description}</p><small>{feature.category} · {feature.evidence}</small><EvidenceStrip images={feature.screenshots}/></div></label>; })}</section>
          <section><div className="review-group-head"><h3>实际操作路径</h3><span>{props.pendingReview.journey.length} 步</span></div>{props.pendingReview.journey.map((step, index) => { const key = `journey:${step.id}`; return <label className="review-row journey-review-row review-row-rich" key={key}><input type="checkbox" checked={props.reviewSelection.includes(key)} onChange={() => props.toggleReviewItem(key)}/><span className="review-step">{index + 1}</span><div><strong>{step.title}</strong><p>{step.note}</p><small>{step.status === 'observed' ? '实际观察' : 'AI 推断 · 仍需验证'}</small><EvidenceStrip images={step.screenshots}/></div></label>; })}</section>
        </div>
        {frictions.length > 0 && <section className="friction-review"><div className="review-group-head"><h3>关键摩擦点</h3><span>{frictions.length} 项</span></div><div className="friction-grid">{frictions.map((item, index) => <article key={item.id || `${item.title}-${index}`}><AlertTriangle size={16}/><div><strong>{item.title}</strong><p>{item.description}</p><small>{item.stage ? `发生在：${item.stage}` : '来自本次实际操作'}</small></div></article>)}</div></section>}
        <footer className="result-footer"><p>取消勾选不准确的内容。只有点击确认后，所选功能和步骤才会进入工作台。</p><div><button className="button ghost" onClick={props.discardReview}>暂不保存</button><button className="button primary" onClick={props.confirmReview} disabled={props.reviewSelection.length === 0}><Check size={15}/>确认保存 {props.reviewSelection.length} 项</button></div></footer>
      </>}
    </section>
  </>;
}

function EvidenceStrip({ images }: { images?: EvidenceImage[] }) {
  if (!images?.length) return null;
  return <div className="evidence-strip">{images.map((image, index) => <figure key={image.id || `${image.src}-${index}`}><Image src={image.src} alt={image.caption || '关键步骤截图'} width={320} height={180} unoptimized/><figcaption><Camera size={11}/>{image.caption || '关键步骤截图'}</figcaption></figure>)}</div>;
}

function Framework({ categories, features, cyclePriority, toggleSolution, solution }: { categories: string[]; features: Feature[]; cyclePriority: (id: string) => void; toggleSolution: (id: string) => void; solution: string[] }) {
  return <div className="framework-view"><div className="view-intro"><div><p className="eyebrow">能力地图</p><h2>功能框架</h2><p>每个节点都与来源或实测记录关联；录制得到的关键截图会保留在对应功能说明中。</p></div><button className="button primary"><Plus size={16}/>新增功能</button></div><div className="framework-grid">{categories.map((category) => <section className="category-column" key={category}><header><span className={`category-dot ${categoryColors[category] || 'gray'}`}/><h3>{category}</h3><em>{features.filter((item) => item.category === category).length}</em></header><div className="category-items">{features.filter((item) => item.category === category).map((feature) => <article className="feature-card" key={feature.id}><div><h4>{feature.name}</h4><button className={`priority ${feature.priority.toLowerCase()}`} onClick={() => cyclePriority(feature.id)}>{feature.priority}</button></div><p>{feature.description}</p>{feature.screenshots?.length ? <div className="feature-evidence"><ImageIcon size={13}/><span>{feature.screenshots.length} 张操作截图</span><EvidenceStrip images={feature.screenshots}/></div> : null}<footer><span>{feature.evidence}</span><button className={solution.includes(feature.id) ? 'added' : ''} onClick={() => toggleSolution(feature.id)}>{solution.includes(feature.id) ? <Check size={14}/> : <Plus size={14}/>}</button></footer></article>)}</div></section>)}</div></div>;
}

function Journey({ journey, recording, toggleRecording, copyRecordingPrompt }: { journey: JourneyStep[]; recording: boolean; toggleRecording: () => void; copyRecordingPrompt: () => void }) {
  return <div className="journey-view"><div className="view-intro"><div><p className="eyebrow">操作证据</p><h2>用户旅程</h2><p>把实际操作、界面反馈和推断分开记录，避免把猜测当作事实。</p></div><div className="inline-actions"><button className="button ghost" onClick={copyRecordingPrompt}><Clipboard size={16}/>复制录制指令</button><button className={`button ${recording ? 'danger' : 'primary'}`} onClick={toggleRecording}>{recording ? <Square size={15}/> : <Mic2 size={16}/>}{recording ? '结束录制' : '开始录制'}</button></div></div><section className="journey-canvas">{journey.map((step, index) => <article className="journey-step" key={step.id}><div className="step-number">{index + 1}</div><div className="step-card"><span className={step.status}>{step.status === 'observed' ? '已观察' : '待验证'}</span><h3>{step.title}</h3><p>{step.note}</p><footer><Target size={15}/>关键行为节点</footer></div>{index < journey.length - 1 && <ChevronRight className="journey-arrow" size={20}/>}</article>)}</section><section className="journey-note"><Sparkles size={19}/><div><strong>AI 观察建议</strong><p>下一轮重点记录“邀请协作者”之后的权限设置、成功反馈与返回路径，用于确认协作激活节点。</p></div></section></div>;
}

function Solution({ features, solution, toggleSolution, setFeaturePriority }: { features: Feature[]; solution: string[]; toggleSolution: (id: string) => void; setFeaturePriority: (id: string, priority: Priority) => void }) {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dropPriority, setDropPriority] = useState<Priority | null>(null);
  const selected = features.filter((item) => solution.includes(item.id)).sort((a, b) => a.priority.localeCompare(b.priority)); const available = features.filter((item) => !solution.includes(item.id));
  function beginDrag(event: DragEvent, id: string) { event.dataTransfer.effectAllowed = 'move'; event.dataTransfer.setData('text/plain', id); setDraggedId(id); }
  function endDrag() { setDraggedId(null); setDropPriority(null); }
  function dropFeature(event: DragEvent, priority: Priority) { event.preventDefault(); const id = event.dataTransfer.getData('text/plain') || draggedId; if (id && features.some((feature) => feature.id === id)) setFeaturePriority(id, priority); endDrag(); }
  // Native drag-and-drop has no equivalent semantic container; every feature also keeps a keyboard-accessible click action.
  // oxlint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
  return <div className="solution-view"><div className="view-intro"><div><p className="eyebrow">方案画布</p><h2>首版能力规划</h2><p>把左侧功能拖到右侧优先级；右侧卡片也可继续拖动调整。</p></div><button className="button primary"><FileDown size={16}/>导出方案</button></div><div className="solution-layout"><aside className="feature-library"><header><div><h3>功能库</h3><small>拖动卡片到右侧</small></div><span>{available.length} 项可选</span></header>{available.map((feature) => <button className={draggedId === feature.id ? 'is-dragging' : ''} draggable key={feature.id} onDragStart={(event) => beginDrag(event, feature.id)} onDragEnd={endDrag} onClick={() => setFeaturePriority(feature.id, feature.priority)}><GripVertical className="drag-handle" size={15}/><span className={`category-dot ${categoryColors[feature.category] || 'gray'}`}/><div><strong>{feature.name}</strong><small>{feature.category} · 拖到 P0/P1/P2</small></div><Plus size={16}/></button>)}</aside><section className={`priority-board ${draggedId ? 'is-receiving' : ''}`}>{(['P0', 'P1', 'P2'] as Priority[]).map((priority) => <div className={`priority-lane ${dropPriority === priority ? 'is-drop-target' : ''}`} key={priority} aria-label={`${priority} 优先级`} onDragOver={(event) => { event.preventDefault(); event.dataTransfer.dropEffect = 'move'; setDropPriority(priority); }} onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setDropPriority(null); }} onDrop={(event) => dropFeature(event, priority)}><header><div><span className={`priority ${priority.toLowerCase()}`}>{priority}</span><h3>{priority === 'P0' ? '核心闭环' : priority === 'P1' ? '体验增强' : '后续探索'}</h3></div><em>{selected.filter((item) => item.priority === priority).length}</em></header><div className="lane-items">{selected.filter((item) => item.priority === priority).map((feature) => <article className={draggedId === feature.id ? 'is-dragging' : ''} draggable key={feature.id} aria-label={`${feature.name}，可拖动调整优先级`} onDragStart={(event) => beginDrag(event, feature.id)} onDragEnd={endDrag}><GripVertical className="drag-handle" size={15}/><span className={`category-dot ${categoryColors[feature.category] || 'gray'}`}/><div><strong>{feature.name}</strong><small>{feature.category} · {feature.competitors.join(' / ')}</small></div><button onClick={() => toggleSolution(feature.id)} aria-label="移出方案"><X size={15}/></button></article>)}{!selected.some((item) => item.priority === priority) && <div className="empty-lane">拖放功能到这里，设为 {priority}</div>}</div></div>)}</section></div></div>;
}
