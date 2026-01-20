import { describe, it } from 'node:test';
import assert from 'node:assert';
import { StatusLineRenderer } from '../../src/renderer/StatusLineRenderer.js';
import { SessionStats, DisplayConfig } from '../../src/types.js';

describe('StatusLineRenderer 状态栏渲染器', () => {
  it('应该渲染 ops_count 组件', () => {
    const renderer = new StatusLineRenderer();
    const stats: SessionStats = {
      total: 42,
      completed: 40,
      failed: 2,
      avgDuration: 150,
      maxDuration: 5000,
      failureRate: 0.05
    };

    const output = renderer.renderComponent('ops_count', stats);
    assert.strictEqual(output, '42 ops');
  });

  it('应该渲染 success_rate 组件', () => {
    const renderer = new StatusLineRenderer();
    const stats: SessionStats = {
      total: 100,
      completed: 95,
      failed: 5,
      avgDuration: 150,
      maxDuration: 5000,
      failureRate: 0.05
    };

    const output = renderer.renderComponent('success_rate', stats);
    assert.strictEqual(output, '95% 成功');
  });

  it('应该使用分隔符渲染完整行', () => {
    const renderer = new StatusLineRenderer();
    const config: DisplayConfig = {
      lines: 1,
      line1: {
        components: ['ops_count', 'success_rate'],
        separator: ' │ '
      }
    };

    const stats: SessionStats = {
      total: 42,
      completed: 40,
      failed: 2,
      avgDuration: 150,
      maxDuration: 5000,
      failureRate: 0.05
    };

    const output = renderer.render(config, stats);
    assert.ok(output.includes('42 ops'));
    assert.ok(output.includes('95% 成功'));
    assert.ok(output.includes('│'));
  });

  it('应该正确渲染多行状态栏', () => {
    const renderer = new StatusLineRenderer();
    const config: DisplayConfig = {
      lines: 2,
      line1: {
        components: ['ops_count'],
        separator: ''
      },
      line2: {
        components: ['avg_duration', 'failures'],
        separator: ' │ '
      }
    };

    const stats: SessionStats = {
      total: 42,
      completed: 40,
      failed: 2,
      avgDuration: 150,
      maxDuration: 5000,
      failureRate: 0.05
    };

    const output = renderer.render(config, stats);
    const lines = output.split('\n');
    assert.strictEqual(lines.length, 2);
    assert.ok(lines[0].includes('42 ops'));
    assert.ok(lines[1].includes('150ms'));
    assert.ok(lines[1].includes('✗ 2'));
  });
});
