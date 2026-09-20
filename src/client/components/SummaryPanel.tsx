interface Props { summary?: { summary: string; statistics: Record<string, number> }; busy: boolean; onSummarize: () => void; }

export function SummaryPanel({ summary, busy, onSummarize }: Props) {
  return <section className="summary-panel panel"><div className="section-kicker">今日回望</div><div className="summary-title"><h2>把一天收拢起来</h2><button onClick={onSummarize} disabled={busy}>{busy ? '生成中…' : '生成摘要'}</button></div>{summary ? <><p>{summary.summary}</p><div className="stat-grid">{Object.entries(summary.statistics).map(([key, value]) => <div key={key}><strong>{value}</strong><span>{({ total: '全部', completed: '完成', inProgress: '进行中', pending: '待办', highPriority: '高优先级' } as Record<string, string>)[key] ?? key}</span></div>)}</div></> : <p className="muted">用一段摘要，看见今天真正重要的事。</p>}</section>;
}
