import type { ClientTask } from '../api';

type SummaryTask = Pick<ClientTask, 'id' | 'title'>;

interface Summary {
  summary: string;
  statistics: Record<string, number>;
  completedTasks?: SummaryTask[];
  unfinishedTasks?: SummaryTask[];
}

interface Props {
  summary?: Summary;
  busy: boolean;
  onSummarize: () => void;
}

const STAT_LABELS: Record<string, string> = {
  todayTotal: '今日任务',
  completedToday: '已完成',
  unfinishedToday: '还没完成',
};

function TaskTitles({ tasks, empty }: { tasks?: SummaryTask[]; empty: string }) {
  if (!tasks?.length) return <p className="summary-empty">{empty}</p>;
  return <ul className="summary-task-list">{tasks.map((task) => <li key={task.id}>{task.title}</li>)}</ul>;
}

export function SummaryPanel({ summary, busy, onSummarize }: Props) {
  return <section className="summary-panel panel">
    <div className="section-kicker">今日回望</div>
    <div className="summary-title"><h2>把一天收拢起来</h2><button onClick={onSummarize} disabled={busy}>{busy ? '生成中…' : '生成摘要'}</button></div>
    {summary ? <>
      <p>{summary.summary}</p>
      <div className="stat-grid">{Object.entries(summary.statistics).map(([key, value]) => <div key={key}><strong>{value}</strong><span>{STAT_LABELS[key] ?? key}</span></div>)}</div>
      <div className="summary-breakdown">
        <div><h3>今天做了</h3><TaskTitles tasks={summary.completedTasks} empty="今天还没有完成的任务" /></div>
        <div><h3>还没做</h3><TaskTitles tasks={summary.unfinishedTasks} empty="今天的任务都完成了" /></div>
      </div>
    </> : <p className="muted">点击“生成摘要”，看看今天做了什么、还有什么没完成。</p>}
  </section>;
}
