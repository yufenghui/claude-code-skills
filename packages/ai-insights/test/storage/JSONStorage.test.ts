import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import { rm, mkdir } from 'fs/promises';
import { join } from 'path';
import { JSONStorage } from '../../src/storage/JSONStorage.js';
import { SessionData } from '../../src/types.js';

describe('JSONStorage JSON存储', () => {
  const testDataDir = join(process.cwd(), 'test/data-storage');
  let storage: JSONStorage;

  beforeEach(async () => {
    await rm(testDataDir, { recursive: true, force: true });
    await mkdir(testDataDir, { recursive: true });
    storage = new JSONStorage(testDataDir);
  });

  afterEach(async () => {
    await rm(testDataDir, { recursive: true, force: true });
  });

  it('应该保存和加载当前会话', async () => {
    const session: SessionData = {
      sessionId: 'test-session',
      startTime: new Date(),
      operations: [],
      stats: { total: 0, completed: 0, failed: 0, avgDuration: 0, maxDuration: 0, failureRate: 0 }
    };

    await storage.saveCurrentSession(session);
    const loaded = await storage.loadCurrentSession();

    assert.strictEqual(loaded.sessionId, 'test-session');
  });

  it('应该归档会话', async () => {
    const session: SessionData = {
      sessionId: 'test-session',
      startTime: new Date(),
      endTime: new Date(),
      operations: [],
      stats: { total: 0, completed: 0, failed: 0, avgDuration: 0, maxDuration: 0, failureRate: 0 }
    };

    await storage.saveCurrentSession(session);
    await storage.archiveSession('test-session');

    const loaded = await storage.loadCurrentSession();
    assert.strictEqual(loaded.sessionId, 'test-session'); // 归档后创建新会话
    assert.notStrictEqual(loaded.sessionId, 'test-session'); // 确保是新会话
  });

  it('应该列出所有会话', async () => {
    const sessions = await storage.listSessions();
    assert.strictEqual(sessions.length, 0);
  });
});
