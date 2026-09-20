// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SummaryPanel } from '../../src/client/components/SummaryPanel';

describe('today summary panel', () => {
  it('shows what was done and what remains, and refreshes on click', async () => {
    const user = userEvent.setup();
    const onSummarize = vi.fn();

    render(<SummaryPanel
      busy={false}
      onSummarize={onSummarize}
      summary={{
        summary: '今天做了：完成报告。还没做：回复客户。',
        statistics: { todayTotal: 2, completedToday: 1, unfinishedToday: 1 },
        completedTasks: [{ id: '1', title: '完成报告' }],
        unfinishedTasks: [{ id: '2', title: '回复客户' }],
      }}
    />);

    expect(screen.getByText('今天做了')).toBeInTheDocument();
    expect(screen.getByText('完成报告')).toBeInTheDocument();
    expect(screen.getByText('还没做')).toBeInTheDocument();
    expect(screen.getByText('回复客户')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '生成摘要' }));
    expect(onSummarize).toHaveBeenCalledTimes(1);
  });
});
