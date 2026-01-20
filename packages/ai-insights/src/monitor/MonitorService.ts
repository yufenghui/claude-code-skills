import { watch, existsSync } from 'fs';
import { TranscriptParser } from '../parser/TranscriptParser.js';
import { MetricsAnalyzer } from '../analyzer/MetricsAnalyzer.js';
import { JSONStorage } from '../storage/JSONStorage.js';
import { ToolOperation, SessionData } from '../types.js';

/**
 * 监控服务
 * 负责监听 history.jsonl 变化并实时更新指标
 */
export class MonitorService {
  private historyPath: string;
  private dataDir: string;
  private parser: TranscriptParser;
  private analyzer: MetricsAnalyzer;
  private storage: JSONStorage;
  private isRunning: boolean = false;
  private pollInterval?: NodeJS.Timeout;
  private filePosition: number = 0;

  constructor(historyPath: string, dataDir: string) {
    this.historyPath = historyPath;
    this.dataDir = dataDir;
    this.parser = new TranscriptParser(historyPath);
    this.analyzer = new MetricsAnalyzer();
    this.storage = new JSONStorage(dataDir);
  }

  /**
   * 启动监控
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      return;
    }

    await this.storage.init();

    // 加载或创建会话
    const session = await this.storage.loadCurrentSession();
    this.filePosition = 0; // 重置位置用于新的监控会话

    // 启动文件监听
    this.startWatching();
    this.startPolling();

    this.isRunning = true;
  }

  /**
   * 停止监控
   */
  async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    this.stopWatching();
    this.stopPolling();

    // 保存会话
    const session = this.getCurrentSessionData();
    await this.storage.saveCurrentSession(session);

    this.isRunning = false;
  }

  /**
   * 获取当前会话
   */
  async getCurrentSession(): Promise<SessionData> {
    return this.storage.loadCurrentSession();
  }

  /**
   * 获取统计数据
   */
  getStats() {
    return this.analyzer.getStats();
  }

  /**
   * 启动文件监听
   */
  private startWatching(): void {
    if (!existsSync(this.historyPath)) {
      return;
    }

    try {
      watch(this.historyPath, async (eventType) => {
        if (eventType === 'change') {
          await this.processNewLines();
        }
      });
    } catch (error) {
      console.warn(`文件监听失败: ${error}。仅使用轮询模式。`);
    }
  }

  /**
   * 停止文件监听
   */
  private stopWatching(): void {
    // 监听器会在停止引用后被垃圾回收
  }

  /**
   * 启动轮询
   */
  private startPolling(): void {
    this.pollInterval = setInterval(async () => {
      await this.processNewLines();
    }, 5000); // 5 秒轮询间隔
  }

  /**
   * 停止轮询
   */
  private stopPolling(): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = undefined;
    }
  }

  /**
   * 处理新增行
   */
  private async processNewLines(): Promise<void> {
    const operations = await this.parser.parseNewLines(this.filePosition);

    for (const op of operations) {
      this.analyzer.update(op);

      // 更新文件位置
      if (op.endTime) {
        this.filePosition = op.endTime.getTime();
      }
    }

    // 如果有新操作，保存
    if (operations.length > 0) {
      const session = this.getCurrentSessionData();
      await this.storage.saveCurrentSession(session);
    }
  }

  /**
   * 获取当前会话数据
   */
  private getCurrentSessionData(): SessionData {
    return {
      sessionId: 'current',
      startTime: new Date(),
      operations: [], // 应该从分析器填充
      stats: this.analyzer.getStats()
    };
  }
}
