import { readFile, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { SessionData, SessionSummary } from '../types.js';
import { existsSync } from 'fs';

/**
 * JSON 存储实现
 * 管理会话数据的持久化
 */
export class JSONStorage {
  private dataDir: string;
  private currentSessionPath: string;
  private sessionsDir: string;
  private indexPath: string;

  constructor(dataDir: string) {
    this.dataDir = dataDir;
    this.currentSessionPath = join(dataDir, 'current-session.json');
    this.sessionsDir = join(dataDir, 'sessions');
    this.indexPath = join(dataDir, 'index.json');
  }

  /**
   * 初始化存储目录
   */
  async init(): Promise<void> {
    // 创建不存在的目录
    if (!existsSync(this.dataDir)) {
      await mkdir(this.dataDir, { recursive: true });
    }
    if (!existsSync(this.sessionsDir)) {
      await mkdir(this.sessionsDir, { recursive: true });
    }
  }

  /**
   * 保存当前会话
   */
  async saveCurrentSession(data: SessionData): Promise<void> {
    await this.init();
    await writeFile(this.currentSessionPath, JSON.stringify(data, null, 2));
  }

  /**
   * 加载当前会话
   */
  async loadCurrentSession(): Promise<SessionData> {
    await this.init();

    if (!existsSync(this.currentSessionPath)) {
      // 返回空会话
      return {
        sessionId: this.generateSessionId(),
        startTime: new Date(),
        operations: [],
        stats: {
          total: 0,
          completed: 0,
          failed: 0,
          avgDuration: 0,
          maxDuration: 0,
          failureRate: 0
        }
      };
    }

    const content = await readFile(this.currentSessionPath, 'utf-8');
    const data = JSON.parse(content);

    // 将日期字符串转换回 Date 对象
    return this.deserializeSession(data);
  }

  /**
   * 归档会话
   */
  async archiveSession(sessionId: string): Promise<void> {
    const session = await this.loadCurrentSession();

    if (session.sessionId !== sessionId) {
      throw new Error(`当前会话ID不匹配: ${session.sessionId} != ${sessionId}`);
    }

    // 创建摘要
    const summary: SessionSummary = {
      sessionId: session.sessionId,
      date: this.formatDate(session.startTime),
      startTime: session.startTime,
      endTime: session.endTime,
      sessionTitle: `会话 ${sessionId}`,
      sessionSummary: `${session.stats.total} 个操作`,
      mainActivities: [],
      topModules: [],
      totalOperations: session.stats.total,
      failureRate: session.stats.failureRate,
      avgDuration: session.stats.avgDuration,
      efficiencyScore: 0
    };

    // 保存到归档
    const archivePath = join(this.sessionsDir, `${summary.date}_${sessionId}.json`);
    await writeFile(archivePath, JSON.stringify(session, null, 2));

    // 更新索引
    await this.updateIndex(summary);

    // 清空当前会话
    const newSession: SessionData = {
      sessionId: this.generateSessionId(),
      startTime: new Date(),
      operations: [],
      stats: {
        total: 0,
        completed: 0,
        failed: 0,
        avgDuration: 0,
        maxDuration: 0,
        failureRate: 0
      }
    };

    await this.saveCurrentSession(newSession);
  }

  /**
   * 列出所有会话
   */
  async listSessions(): Promise<SessionSummary[]> {
    if (!existsSync(this.indexPath)) {
      return [];
    }

    const content = await readFile(this.indexPath, 'utf-8');
    const index = JSON.parse(content);

    return index.sessions || [];
  }

  /**
   * 生成会话ID
   */
  private generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * 格式化日期为 YYYY-MM-DD
   */
  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  /**
   * 反序列化会话数据
   */
  private deserializeSession(data: any): SessionData {
    return {
      ...data,
      startTime: new Date(data.startTime),
      endTime: data.endTime ? new Date(data.endTime) : undefined,
      operations: data.operations.map((op: any) => ({
        ...op,
        startTime: new Date(op.startTime),
        endTime: op.endTime ? new Date(op.endTime) : undefined
      }))
    };
  }

  /**
   * 更新会话索引
   */
  private async updateIndex(summary: SessionSummary): Promise<void> {
    let index: any = { sessions: [] };

    if (existsSync(this.indexPath)) {
      const content = await readFile(this.indexPath, 'utf-8');
      index = JSON.parse(content);
    }

    index.sessions.push(summary);
    await writeFile(this.indexPath, JSON.stringify(index, null, 2));
  }
}
