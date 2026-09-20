import { useEffect, useMemo, useState } from 'react';
import { api, type ClientTask } from './api';
import { SmartTaskComposer } from './components/SmartTaskComposer';
import { SummaryPanel } from './components/SummaryPanel';
import { TaskList } from './components/TaskList';
import { TaskDecomposer } from './components/TaskDecomposer';
import './styles.css';

export function App() {
  const [tasks, setTasks] = useState<ClientTask[]>([]);
  const [search, setSearch] = useState('');
  const [draft, setDraft] = useState<Partial<ClientTask> & { title: string }>();
  const [summary, setSummary] = useState<{ summary: string; statistics: Record<string, number> }>();
  const [decomposition, setDecomposition] = useState<Array<Partial<ClientTask> & { title: string }>>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const loadTasks = async () => { try { setTasks((await api.listTasks(search)).items); setError(''); } catch (err) { setError(err instanceof Error ? err.message : '任务加载失败'); } };
  useEffect(() => { void loadTasks(); }, [search]);
  const openTasks = useMemo(() => tasks.filter((task) => task.status !== 'completed').length, [tasks]);

  const parse = async (input: string) => { setBusy(true); try { const result = await api.aiRun({ mode: 'parse_task', input, timezone: 'Asia/Shanghai' }); setDraft(result.result?.data as Partial<ClientTask> & { title: string }); } catch (err) { setError(err instanceof Error ? err.message : '智能整理失败'); } finally { setBusy(false); } };
  const confirmDraft = async (value: Partial<ClientTask> & { title: string }) => { setBusy(true); try { await api.createTask(value); setDraft(undefined); await loadTasks(); } catch (err) { setError(err instanceof Error ? err.message : '保存任务失败'); } finally { setBusy(false); } };
  const toggle = async (task: ClientTask) => { const previous = tasks; setTasks(tasks.map((item) => item.id === task.id ? { ...item, status: item.status === 'completed' ? 'pending' : 'completed' } : item)); try { await api.updateTask(task.id, { status: task.status === 'completed' ? 'pending' : 'completed' }); } catch { setTasks(previous); setError('状态更新失败，已恢复原任务'); } };
  const remove = async (task: ClientTask) => { const previous = tasks; setTasks(tasks.filter((item) => item.id !== task.id)); try { await api.deleteTask(task.id); } catch { setTasks(previous); setError('删除失败，已恢复原任务'); } };
  const decompose = async (task: ClientTask) => { setBusy(true); try { const result = await api.aiRun({ mode: 'decompose_task', taskId: task.id, input: task.title }); const data = result.result?.data as { subtasks?: Array<Partial<ClientTask> & { title: string }> }; setDecomposition((data.subtasks ?? []).map((item) => ({ ...item, parent_id: task.id }))); } catch (err) { setError(err instanceof Error ? err.message : '任务拆解失败'); } finally { setBusy(false); } };
  const confirmDecomposition = async () => { setBusy(true); try { await Promise.all(decomposition.map((item) => api.createTask(item))); setDecomposition([]); await loadTasks(); } catch (err) { setError(err instanceof Error ? err.message : '子任务创建失败'); } finally { setBusy(false); } };
  const editTask = async (task: ClientTask, title: string) => { if (!title.trim() || title === task.title) return; try { await api.updateTask(task.id, { title }); await loadTasks(); } catch (err) { setError(err instanceof Error ? err.message : '任务更新失败'); } };
  const summarize = async () => { setBusy(true); try { const result = await api.aiRun({ mode: 'summarize' }); setSummary(result.result?.data as typeof summary); } catch (err) { setError(err instanceof Error ? err.message : '摘要生成失败'); } finally { setBusy(false); } };

  return <div className="app-shell"><aside className="sidebar"><div className="brand-mark">作</div><div className="brand-name">作息簿<span>smart planner</span></div><nav><a className="active">任务总览 <b>{openTasks}</b></a><a>本周节奏</a><a>已完成</a></nav><div className="sidebar-note"><span>今日留白</span><strong>{Math.max(0, 8 - openTasks)}</strong><p>给真正重要的事留一点空间。</p></div></aside><main className="workspace"><header className="topbar"><div><div className="section-kicker">星期一 · 9月21日</div><h1>把今天安排好，<em>再出发。</em></h1></div><div className="avatar">J</div></header><SmartTaskComposer draft={draft} busy={busy} onParse={parse} onConfirm={confirmDraft} /><section className="content-grid"><div className="tasks-column"><div className="list-header"><div><div className="section-kicker">当前清单</div><h2>待办任务 <span>{tasks.length}</span></h2></div><input className="search-input" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="搜索任务" /></div>{error && <div className="error-banner">{error}</div>}<TaskDecomposer tasks={decomposition} busy={busy} onChange={(index, title) => setDecomposition(decomposition.map((item, itemIndex) => itemIndex === index ? { ...item, title } : item))} onConfirm={confirmDecomposition} onCancel={() => setDecomposition([])} /><TaskList tasks={tasks} onToggle={toggle} onDelete={remove} onDecompose={decompose} onEdit={editTask} /></div><div className="insight-column"><SummaryPanel summary={summary} busy={busy} onSummarize={summarize} /><div className="tip-card"><span>小提示</span><p>把模糊的想法交给智能输入，再由你确认最后的安排。</p></div></div></section></main></div>;
}
