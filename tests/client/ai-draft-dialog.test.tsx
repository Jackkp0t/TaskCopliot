// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SmartTaskComposer } from '../../src/client/components/SmartTaskComposer';

describe('AI task confirmation dialog', () => {
  it('shows editable task fields and saves only after human confirmation', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    render(<SmartTaskComposer
      busy={false}
      onParse={vi.fn()}
      onConfirm={onConfirm}
      draft={{
        title: '购买日用品',
        description: '洗衣液和纸巾',
        priority: 'high',
        category: '生活',
        due_at: '2026-09-22T07:00:00.000Z',
        tags: ['购物'],
      }}
    />);

    expect(screen.getByRole('dialog', { name: 'AI任务草稿' })).toBeInTheDocument();
    expect(screen.getByLabelText('任务标题')).toHaveValue('购买日用品');
    expect(screen.getByLabelText('任务描述')).toHaveValue('洗衣液和纸巾');
    expect(screen.getByLabelText('优先级')).toHaveValue('high');
    expect(screen.getByLabelText('任务分类')).toHaveValue('生活');
    expect(screen.getByLabelText('截止日期')).toBeInTheDocument();
    expect(screen.getByText('常用分类')).toBeInTheDocument();

    await user.clear(screen.getByLabelText('任务标题'));
    await user.type(screen.getByLabelText('任务标题'), '确认后的日用品采购');
    expect(onConfirm).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: '确认保存任务' }));
    expect(onConfirm).toHaveBeenCalledWith(expect.objectContaining({ title: '确认后的日用品采购', category: '生活', priority: 'high' }));
  });
});
