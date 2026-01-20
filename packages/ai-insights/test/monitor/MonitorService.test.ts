import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import { rm, writeFile } from 'fs/promises';
import { join } from 'path';
import { MonitorService } from '../../src/monitor/MonitorService.js';

describe('MonitorService 监控服务', () => {
  const testHistoryPath = join(process.cwd(), 'test/data/test-history.jsonl');
  const testDataDir = join(process.cwd(), 'test/data-monitor');

  beforeEach(async () => {
    await rm(testDataDir, { recursive: true, force: true });
    await writeFile(testHistoryPath, '');
  });

  afterEach(async () => {
    await rm(testDataDir, { recursive: true, force: true });
  });

  it('应该启动监控并初始化会话', async () => {
    const monitor = new MonitorService(testHistoryPath, testDataDir);
    await monitor.start();

    const session = await monitor.getCurrentSession();
    assert.ok(session.sessionId);
    assert.strictEqual(session.operations.length, 0);

    await monitor.stop();
  });

  it('应该正确初始化统计数据', async () => {
    const monitor = new MonitorService(testHistoryPath, testDataDir);
    await monitor.start();

    const stats = monitor.getStats();
    assert.strictEqual(stats.total, 0);
    assert.strictEqual(stats.completed, 0);
    assert.strictEqual(stats.failed, 0);

    await monitor.stop();
  });

  it('应该能够停止和重新启动监控', async () => {
    const monitor = new MonitorService(testHistoryPath, testDataDir);

    await monitor.start();
    assert.ok(await monitor.getCurrentSession());

    await monitor.stop();

    await monitor.start();
    const session = await monitor.getCurrentSession();
    assert.ok(session.sessionId);

    await monitor.stop();
  });
});
