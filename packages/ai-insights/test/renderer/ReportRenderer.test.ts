import { describe, it } from 'node:test';
import assert from 'node:assert';
import { ReportRenderer } from '../../src/renderer/ReportRenderer.js';
import { SessionData } from '../../src/types.js';

describe('ReportRenderer 报告渲染器', () => {
  it('应该生成 markdown 报告', () => {
    const renderer = new ReportRenderer();
    const session: SessionData = {
      sessionId: 'test-123',
      startTime: new Date('2026-01-19T10:00:00Z'),
      endTime: new Date('2026-01-19T11:00:00Z'),
      operations: [],
      stats: {
        total: 42,
        completed: 40,
        failed: 2,
        avgDuration: 150,
        maxDuration: 5000,
        failureRate: 0.05
      }
    };

    const report = renderer.generateReport(session);

    assert.ok(report.includes('# 📊'));
    assert.ok(report.includes('42'));
    assert.ok(report.includes('95%'));
  });

  it('应该正确计算会话时长', () => {
    const renderer = new ReportRenderer();
    const session: SessionData = {
      sessionId: 'test-456',
      startTime: new Date('2026-01-19T10:00:00Z'),
      endTime: new Date('2026-01-19T10:30:00Z'),
      operations: [],
      stats: {
        total: 10,
        completed: 10,
        failed: 0,
        avgDuration: 100,
        maxDuration: 500,
        failureRate: 0
      }
    };

    const report = renderer.generateReport(session);
    assert.ok(report.includes('30 分钟'));
  });

  it('应该处理没有结束时间的会话', () => {
    const renderer = new ReportRenderer();
    const session: SessionData = {
      sessionId: 'test-789',
      startTime: new Date('2026-01-19T10:00:00Z'),
      endTime: undefined,
      operations: [],
      stats: {
        total: 5,
        completed: 5,
        failed: 0,
        avgDuration: 80,
        maxDuration: 200,
        failureRate: 0
      }
    };

    const report = renderer.generateReport(session);
    assert.ok(report.includes('0 分钟'));
  });

  it('应该正确格式化时长单位', () => {
    const renderer = new ReportRenderer();
    const session: SessionData = {
      sessionId: 'test-duration',
      startTime: new Date('2026-01-19T10:00:00Z'),
      endTime: new Date('2026-01-19T10:05:00Z'),
      operations: [],
      stats: {
        total: 1,
        completed: 1,
        failed: 0,
        avgDuration: 5000,
        maxDuration: 90000,
        failureRate: 0
      }
    };

    const report = renderer.generateReport(session);
    assert.ok(report.includes('5.0s'));  // 平均耗时
    assert.ok(report.includes('1.5m'));  // 最大耗时
  });
});
