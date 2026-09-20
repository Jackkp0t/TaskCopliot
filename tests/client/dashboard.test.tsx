// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { App } from '../../src/client/App';

describe('planner dashboard', () => {
  it('renders the task workspace and empty state', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ items: [], total: 0, page: 1, pageSize: 20 }) }));

    render(<App />);

    expect(screen.getByText('作息簿')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('把想法写下来，例如：明天下午 3 点买日用品')).toBeInTheDocument();
    expect(await screen.findByText('还没有任务')).toBeInTheDocument();
  });
});
