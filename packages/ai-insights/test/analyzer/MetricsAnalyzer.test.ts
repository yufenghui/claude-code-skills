import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { MetricsAnalyzer } from '../../src/analyzer/MetricsAnalyzer.js';
import { ToolOperation } from '../../src/types.js';

describe('MetricsAnalyzer 指标分析器', () => {
  let analyzer: MetricsAnalyzer;

  beforeEach(() => {
    analyzer = new MetricsAnalyzer();
  });

  it('应该初始化为零统计数据', () => {
    const stats = analyzer.getStats();
    assert.strictEqual(stats.total, 0);
    assert.strictEqual(stats.completed, 0);
    assert.strictEqual(stats.failed, 0);
  });

  it('添加操作时应该更新统计', () => {
    const op: ToolOperation = {
      id: '1',
      name: 'Read',
      startTime: new Date(),
      endTime: new Date(),
      status: 'completed',
      duration: 100
    };

    analyzer.update(op);
    const stats = analyzer.getStats();

    assert.strictEqual(stats.total, 1);
    assert.strictEqual(stats.completed, 1);
  });

  it('应该正确计算平均耗时', () => {
    analyzer.update({
      id: '1',
      name: 'Read',
      startTime: new Date(),
      endTime: new Date(),
      status: 'completed',
      duration: 100
    });
    analyzer.update({
      id: '2',
      name: 'Write',
      startTime: new Date(),
      endTime: new Date(),
      status: 'completed',
      duration: 200
    });

    const stats = analyzer.getStats();
    assert.strictEqual(stats.avgDuration, 150);
  });

  it('应该正确计算失败率', () => {
    analyzer.update({
      id: '1',
      name: 'Read',
      startTime: new Date(),
      endTime: new Date(),
      status: 'completed',
      duration: 100
    });
    analyzer.update({
      id: '2',
      name: 'Bash',
      startTime: new Date(),
      endTime: new Date(),
      status: 'error',
      duration: 50,
      errorMessage: '失败'
    });

    const stats = analyzer.getStats();
    assert.strictEqual(stats.failureRate, 0.5);
  });

  it('应该识别慢操作', () => {
    const slowOp: ToolOperation = {
      id: '1',
      name: 'Read',
      startTime: new Date(),
      endTime: new Date(),
      status: 'completed',
      duration: 6000 // > 5000ms 阈值
    };

    analyzer.update(slowOp);
    const slowOps = analyzer.getSlowOperations(5000);

    assert.strictEqual(slowOps.length, 1);
    assert.strictEqual(slowOps[0].id, '1');
  });
});
