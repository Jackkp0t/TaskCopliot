// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from '../../src/client/App';

function task(id: string, title: string, status: 'pending' | 'completed', date: Date) {
  const timestamp = date.toISOString();
  return { id, title, status, priority: 'medium' as const, tags: [], created_at: timestamp, updated_at: timestamp, due_at: timestamp };
}

describe('planner navigation', () => {
  it('switches between all tasks, this week, and completed tasks', async () => {
    const user = userEvent.setup();
    const today = new Date();
    const thisWeek = new Date(today);
    thisWeek.setDate(today.getDate() + 1);
    const lastWeek = new Date(today);
    lastWeek.setDate(today.getDate() - 10);
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        items: [
          task('1', '本周待处理任务', 'pending', thisWeek),
          task('2', '已经完成任务', 'completed', today),
          task('3', '上周遗留任务', 'pending', lastWeek),
        ],
        total: 3,
        page: 1,
        pageSize: 20,
      }),
    }));

    render(<App />);

    expect(await screen.findByText('本周待处理任务')).toBeInTheDocument();
    expect(screen.getByText('上周遗留任务')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '已完成' }));
    expect(screen.getByRole('heading', { name: /已完成任务/ })).toBeInTheDocument();
    expect(screen.getByText('已经完成任务')).toBeInTheDocument();
    expect(screen.queryByText('本周待处理任务')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '本周节奏' }));
    expect(screen.getByRole('heading', { name: /本周节奏/ })).toBeInTheDocument();
    expect(screen.getByText('本周待处理任务')).toBeInTheDocument();
    expect(screen.queryByText('上周遗留任务')).not.toBeInTheDocument();
  });
});
