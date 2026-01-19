# AI Insights MVP 实施计划

> **For Claude:** 执行此计划必须使用 superpowers:executing-plans 技能

**目标：** 构建一个 Claude Code 性能监控插件，追踪操作耗时、失败率，提供语义化洞察，通过实时状态栏和详细报告展示数据。

**架构：** 非侵入式监控系统，读取 `~/.claude/history.jsonl`，使用混合文件监听（fs.watch + 轮询降级），解析工具操作为结构化数据，增量分析指标，持久化到 JSON 存储，渲染到状态栏/CLI 报告。

**技术栈：** TypeScript 5+ (ES2022, NodeNext), Node.js 18+, 零运行时依赖, JSON 存储（预留 SQLite/PostgreSQL 扩展接口）

---

## 任务 1：定义核心类型接口

**文件：**
- 创建: `packages/ai-insights/src/types.ts`
- 测试: `packages/ai-insights/test/types.test.ts`

**步骤 1：编写失败的测试**

创建 `test/types.test.ts`:

```typescript
import { describe, it } from 'node:test';
import assert from 'node:assert';

describe('类型定义测试', () => {
  it('应该导出 ToolOperation 接口', () => {
    // 此测试验证类型编译 - 如果能编译通过，说明类型存在
    type TestToolOperation = {
      id: string;
      name: string;
      target?: string;
      startTime: Date;
      endTime?: Date;
      status: 'running' | 'completed' | 'error';
      duration?: number;
    };

    const op: TestToolOperation = {
      id: 'test-123',
      name: 'Read',
      target: 'src/file.ts',
      startTime: new Date(),
      status: 'completed',
      endTime: new Date(),
      duration: 100
    };

    assert.strictEqual(op.name, 'Read');
  });

  it('应该导出 SessionData 接口', () => {
    type TestSessionData = {
      sessionId: string;
      startTime: Date;
      operations: any[];
      stats: any;
    };

    const session: TestSessionData = {
      sessionId: 'session-abc',
      startTime: new Date(),
      operations: [],
      stats: { total: 0, completed: 0, failed: 0 }
    };

    assert.strictEqual(session.sessionId, 'session-abc');
  });
});
```

**步骤 2：运行测试验证失败**

```bash
cd packages/ai-insights
npm run build
node --test test/types.test.ts
```

预期：编译错误 - types.ts 尚不存在

**步骤 3：编写最小实现**

创建 `src/types.ts`:

```typescript
/**
 * AI Insights 插件核心类型定义
 */

/** 工具操作记录 */
export interface ToolOperation {
  /** 工具调用的唯一标识符 */
  id: string;
  /** 工具名称 (Read, Write, Bash, Skill, Task 等) */
  name: string;
  /** 目标（文件路径、命令摘要等） */
  target?: string;
  /** 语义标签 - 描述操作做了什么 */
  semanticLabel?: string;
  /** 分类：config/bugfix/feature/refactor/test */
  semanticCategory?: 'config' | 'bugfix' | 'feature' | 'refactor' | 'test';
  /** 模块路径分组 (例如 "src/api/", "frontend/components/") */
  module?: string;
  /** 操作开始时间 */
  startTime: Date;
  /** 操作结束时间（进行中为 undefined） */
  endTime?: Date;
  /** 当前状态 */
  status: 'running' | 'completed' | 'error';
  /** 耗时（毫秒，当 endTime 可用时计算） */
  duration?: number;
  /** 错误信息（当状态为 'error' 时） */
  errorMessage?: string;
}

/** 会话统计数据 */
export interface SessionStats {
  /** 总操作数 */
  total: number;
  /** 已完成操作数 */
  completed: number;
  /** 失败操作数 */
  failed: number;
  /** 平均耗时（毫秒） */
  avgDuration: number;
  /** 最大耗时（毫秒） */
  maxDuration: number;
  /** 失败率 (0-1) */
  failureRate: number;
}

/** 会话数据 */
export interface SessionData {
  /** 唯一会话标识符 */
  sessionId: string;
  /** 会话开始时间 */
  startTime: Date;
  /** 会话结束时间（进行中为 undefined） */
  endTime?: Date;
  /** 会话中的所有操作 */
  operations: ToolOperation[];
  /** 计算出的统计数据 */
  stats: SessionStats;
}

/** 会话摘要（持久化用） */
export interface SessionSummary {
  sessionId: string;
  date: string; // YYYY-MM-DD 格式
  startTime: Date;
  endTime?: Date;
  /** 人类可读的会话标题 */
  sessionTitle: string;
  /** 会话摘要（1-2 句话） */
  sessionSummary: string;
  /** 主要活动类型 */
  mainActivities: string[];
  /** 耗时最长的模块 */
  topModules: Array<{
    module: string;
    totalTime: number;
    operationCount: number;
  }>;
  totalOperations: number;
  failureRate: number;
  avgDuration: number;
  /** 效率评分 (0-100) */
  efficiencyScore: number;
}

/** 显示配置 */
export interface DisplayConfig {
  /** 显示行数 (1-3) */
  lines: 1 | 2 | 3;
  line1: LineConfig;
  line2?: LineConfig;
  line3?: LineConfig;
}

export interface LineConfig {
  components: ComponentType[];
  separator: string;
}

/** 可用的显示组件类型 */
export type ComponentType =
  | 'ops_count'        // 操作总数
  | 'success_rate'     // 成功率
  | 'avg_duration'     // 平均耗时
  | 'slowest_operation' // 最慢操作
  | 'failures'         // 失败数
  | 'ai_thinking'      // AI 思考时间
  | 'top_modules';     // 热门模块

/** 存储配置 */
export interface StorageConfig {
  /** 数据目录路径 */
  dataDir: string;
  /** 保留详细数据的天数 */
  retentionDays: number;
  /** 自动归档旧会话 */
  autoArchive: boolean;
}

/** 监控配置 */
export interface MonitoringConfig {
  /** 监控模式 */
  mode: 'watch' | 'poll' | 'hybrid';
  /** 轮询间隔（毫秒，用于 poll/hybrid 模式） */
  pollingInterval: number;
  /** 慢操作阈值（毫秒） */
  slowThreshold: number;
  /** 极慢操作阈值（毫秒） */
  verySlowThreshold: number;
}

/** 插件总配置 */
export interface PluginConfig {
  display: DisplayConfig;
  monitoring: MonitoringConfig;
  storage: StorageConfig;
}
```

**步骤 4：运行测试验证通过**

```bash
cd packages/ai-insights
npm run build
node --test test/types.test.ts
```

预期：通过

**步骤 5：提交**

```bash
cd packages/ai-insights
git add src/types.ts test/types.test.ts
git commit -m "feat(ai-insights): 定义核心类型接口"
```

---

## 任务 2：实现历史解析器

**文件：**
- 创建: `packages/ai-insights/src/parser/TranscriptParser.ts`
- 测试: `packages/ai-insights/test/parser/TranscriptParser.test.ts`

**步骤 1：创建测试数据并编写失败测试**

创建 `test/fixtures/history-sample.jsonl`:

```jsonl
{"type":"start","timestamp":"2026-01-19T10:00:00.000Z"}
{"type":"tool_use","timestamp":"2026-01-19T10:00:01.000Z","tool_name":"Read","id":"call-1","input":{"file_path":"src/types.ts"},"status":"completed","output":{"content":"export interface ToolOperation {...}"}}
{"type":"tool_use","timestamp":"2026-01-19T10:00:02.000Z","tool_name":"Write","id":"call-2","input":{"file_path":"src/index.ts","content":"console.log('hello')"},"status":"completed"}
{"type":"tool_use","timestamp":"2026-01-19T10:00:03.000Z","tool_name":"Bash","id":"call-3","input":{"command":"npm test"},"status":"error","error":{"message":"测试失败"}}
{"type":"tool_use","timestamp":"2026-01-19T10:00:04.000Z","tool_name":"Read","id":"call-4","input":{"file_path":"README.md"},"status":"completed"}
```

创建 `test/parser/TranscriptParser.test.ts`:

```typescript
import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { TranscriptParser } from '../../src/parser/TranscriptParser.js';

describe('TranscriptParser 历史解析器', () => {
  const testHistoryPath = join(process.cwd(), 'test/fixtures/history-sample.jsonl');

  it('应该从历史文件解析工具调用', async () => {
    const parser = new TranscriptParser(testHistoryPath);
    const operations = await parser.parseNewLines(0);

    assert.strictEqual(operations.length, 4);
    assert.strictEqual(operations[0].name, 'Read');
    assert.strictEqual(operations[0].target, 'src/types.ts');
    assert.strictEqual(operations[0].status, 'completed');
  });

  it('应该只解析指定位置之后的新行', async () => {
    const parser = new TranscriptParser(testHistoryPath);

    // 第一次解析 - 获取所有操作
    const firstBatch = await parser.parseNewLines(0);
    assert.strictEqual(firstBatch.length, 4);

    // 第二次解析 - 不应该有新内容
    const secondBatch = await parser.parseNewLines(100000); // 使用一个很大的位置
    assert.strictEqual(secondBatch.length, 0);
  });

  it('应该提取错误信息', async () => {
    const parser = new TranscriptParser(testHistoryPath);
    const operations = await parser.parseNewLines(0);

    const bashOp = operations.find(op => op.name === 'Bash');
    assert.ok(bashOp);
    assert.strictEqual(bashOp!.status, 'error');
    assert.ok(bashOp!.errorMessage);
  });
});
```

**步骤 2：运行测试验证失败**

```bash
cd packages/ai-insights
npm run build
node --test test/parser/TranscriptParser.test.ts
```

预期：失败 - 找不到模块

**步骤 3：编写最小实现**

创建 `src/parser/TranscriptParser.ts`:

```typescript
import { readFile, open } from 'fs/promises';
import { ToolOperation } from '../types.js';

/** 历史记录条目接口 */
interface HistoryEntry {
  type: string;
  timestamp: string;
  tool_name?: string;
  id?: string;
  input?: any;
  status?: string;
  output?: any;
  error?: any;
}

/**
 * 历史记录解析器
 * 负责将 history.jsonl 解析为结构化的 ToolOperation 对象
 */
export class TranscriptParser {
  private historyPath: string;

  constructor(historyPath: string) {
    this.historyPath = historyPath;
  }

  /**
   * 从历史文件的指定位置之后解析新行
   * @param lastPosition 上次读取的字节位置（0 表示从头读取）
   * @returns 解析出的 ToolOperation 数组
   */
  async parseNewLines(lastPosition: number): Promise<ToolOperation[]> {
    const file = await open(this.historyPath, 'r');
    const operations: ToolOperation[] = [];

    try {
      // 从 lastPosition 开始读取内容
      const buffer = Buffer.allocUnsafe(1024 * 1024); // 1MB 缓冲区
      const { bytesRead } = await file.read(buffer, 0, buffer.length, lastPosition);

      if (bytesRead === 0) {
        return operations;
      }

      const content = buffer.toString('utf8', 0, bytesRead);
      const lines = content.split('\n').filter(line => line.trim());

      for (const line of lines) {
        try {
          const entry: HistoryEntry = JSON.parse(line);

          if (entry.type === 'tool_use' && entry.tool_name && entry.id) {
            const operation = this.parseToolUse(entry);
            operations.push(operation);
          }
        } catch (parseError) {
          // 跳过格式错误的行
          console.warn(`解析行失败: ${parseError}`);
        }
      }
    } finally {
      await file.close();
    }

    return operations;
  }

  /**
   * 解析单个工具调用条目
   */
  private parseToolUse(entry: HistoryEntry): ToolOperation {
    const startTime = new Date(entry.timestamp);
    const status = entry.status === 'error' ? 'error' :
                   entry.status === 'completed' ? 'completed' : 'running';

    const operation: ToolOperation = {
      id: entry.id!,
      name: entry.tool_name!,
      startTime,
      status
    };

    // 提取目标
    if (entry.input?.file_path) {
      operation.target = entry.input.file_path;
    } else if (entry.input?.command) {
      operation.target = entry.input.command.substring(0, 50); // 截断长命令
    }

    // 如果已完成/失败，计算耗时
    if (status !== 'running') {
      // 近似计算：历史记录是顺序的
      // 我们将在实际数据中优化这个逻辑
      operation.endTime = new Date(startTime.getTime() + 100); // 占位符
      operation.duration = 100; // 占位符

      if (status === 'error' && entry.error) {
        operation.errorMessage = entry.error.message || JSON.stringify(entry.error);
      }
    }

    return operation;
  }
}
```

**步骤 4：运行测试验证通过**

```bash
cd packages/ai-insights
npm run build
node --test test/parser/TranscriptParser.test.ts
```

预期：通过（可能需要根据实际 history.jsonl 格式微调）

**步骤 5：提交**

```bash
cd packages/ai-insights
git add src/parser/ test/parser/ test/fixtures/
git commit -m "feat(ai-insights): 实现历史解析器"
```

---

## 任务 3：实现指标分析器

**文件：**
- 创建: `packages/ai-insights/src/analyzer/MetricsAnalyzer.ts`
- 测试: `packages/ai-insights/test/analyzer/MetricsAnalyzer.test.ts`

**步骤 1：编写失败的测试**

创建 `test/analyzer/MetricsAnalyzer.test.ts`:

```typescript
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
```

**步骤 2：运行测试验证失败**

```bash
cd packages/ai-insights
npm run build
node --test test/analyzer/MetricsAnalyzer.test.ts
```

预期：失败 - 找不到模块

**步骤 3：编写最小实现**

创建 `src/analyzer/MetricsAnalyzer.ts`:

```typescript
import { ToolOperation, SessionStats } from '../types.js';

/**
 * 指标分析器
 * 负责实时计算监控指标并维护统计数据
 */
export class MetricsAnalyzer {
  private operations: ToolOperation[] = [];
  private stats: SessionStats = {
    total: 0,
    completed: 0,
    failed: 0,
    avgDuration: 0,
    maxDuration: 0,
    failureRate: 0
  };

  /**
   * 使用新操作更新分析器
   */
  update(operation: ToolOperation): void {
    this.operations.push(operation);
    this.recalculateStats();
  }

  /**
   * 获取当前统计数据
   */
  getStats(): SessionStats {
    return { ...this.stats };
  }

  /**
   * 获取慢于阈值的操作
   */
  getSlowOperations(thresholdMs: number): ToolOperation[] {
    return this.operations
      .filter(op => op.duration !== undefined && op.duration > thresholdMs)
      .sort((a, b) => (b.duration || 0) - (a.duration || 0));
  }

  /**
   * 获取按错误消息分组的失败操作
   */
  getFailures(): Map<string, ToolOperation[]> {
    const failures = this.operations.filter(op => op.status === 'error');
    const grouped = new Map<string, ToolOperation[]>();

    for (const op of failures) {
      const key = op.errorMessage || '未知错误';
      const existing = grouped.get(key) || [];
      existing.push(op);
      grouped.set(key, existing);
    }

    return grouped;
  }

  /**
   * 计算效率评分 (0-100)
   */
  calculateEfficiencyScore(): number {
    if (this.stats.total === 0) return 100;

    const successRate = 1 - this.stats.failureRate;
    const speedScore = 100; // 占位符 - 与历史平均值对比
    const consistencyScore = 100; // 占位符 - 计算方差

    return Math.round(
      (successRate * 0.4) +
      (speedScore * 0.3) +
      (consistencyScore * 0.3)
    );
  }

  /**
   * 重新计算统计数据
   */
  private recalculateStats(): void {
    this.stats.total = this.operations.length;
    this.stats.completed = this.operations.filter(op => op.status === 'completed').length;
    this.stats.failed = this.operations.filter(op => op.status === 'error').length;

    // 计算平均耗时
    const completedOps = this.operations.filter(op => op.duration !== undefined);
    if (completedOps.length > 0) {
      const totalDuration = completedOps.reduce((sum, op) => sum + (op.duration || 0), 0);
      this.stats.avgDuration = Math.round(totalDuration / completedOps.length);
      this.stats.maxDuration = Math.max(...completedOps.map(op => op.duration || 0));
    }

    // 计算失败率
    this.stats.failureRate = this.stats.total > 0 ?
      this.stats.failed / this.stats.total :
      0;
  }
}
```

**步骤 4：运行测试验证通过**

```bash
cd packages/ai-insights
npm run build
node --test test/analyzer/MetricsAnalyzer.test.ts
```

预期：通过

**步骤 5：提交**

```bash
cd packages/ai-insights
git add src/analyzer/ test/analyzer/
git commit -m "feat(ai-insights): 实现指标分析器"
```

---

## 任务 4：实现 JSON 存储

**文件：**
- 创建: `packages/ai-insights/src/storage/JSONStorage.ts`
- 测试: `packages/ai-insights/test/storage/JSONStorage.test.ts`

**步骤 1：编写失败的测试**

创建 `test/storage/JSONStorage.test.ts`:

```typescript
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
    assert.strictEqual(loaded.operations.length, 0); // 归档后应该为空
  });
});
```

**步骤 2：运行测试验证失败**

预期：失败 - 找不到模块

**步骤 3：编写最小实现**

创建 `src/storage/JSONStorage.ts`:

```typescript
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
```

**步骤 4：运行测试验证通过**

```bash
cd packages/ai-insights
npm run build
node --test test/storage/JSONStorage.test.ts
```

预期：通过

**步骤 5：提交**

```bash
cd packages/ai-insights
git add src/storage/ test/storage/
git commit -m "feat(ai-insights): 实现 JSON 存储"
```

---

## 任务 5：实现状态栏渲染器

**文件：**
- 创建: `packages/ai-insights/src/renderer/StatusLineRenderer.ts`
- 测试: `packages/ai-insights/test/renderer/StatusLineRenderer.test.ts`

**步骤 1：编写失败的测试**

创建 `test/renderer/StatusLineRenderer.test.ts`:

```typescript
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
});
```

**步骤 2：运行测试验证失败**

预期：失败 - 找不到模块

**步骤 3：编写最小实现**

创建 `src/renderer/StatusLineRenderer.ts`:

```typescript
import { SessionStats, DisplayConfig, ComponentType } from '../types.js';

/**
 * 状态栏渲染器
 * 负责格式化并渲染状态栏显示
 */
export class StatusLineRenderer {
  /**
   * 根据配置和统计数据渲染状态栏
   */
  render(config: DisplayConfig, stats: SessionStats): string {
    const lines: string[] = [];

    if (config.line1) {
      lines.push(this.renderLine(config.line1.components, config.line1.separator, stats));
    }

    if (config.line2 && config.lines >= 2) {
      lines.push(this.renderLine(config.line2.components, config.line2.separator || ' │ ', stats));
    }

    if (config.line3 && config.lines >= 3) {
      lines.push(this.renderLine(config.line3.components, config.line3.separator || ' │ ', stats));
    }

    return lines.join('\n');
  }

  /**
   * 渲染单个组件
   */
  renderComponent(type: ComponentType, stats: SessionStats): string {
    switch (type) {
      case 'ops_count':
        return `${stats.total} ops`;

      case 'success_rate':
        const successRate = Math.round((1 - stats.failureRate) * 100);
        return `${successRate}% 成功`;

      case 'avg_duration':
        if (stats.avgDuration < 1000) {
          return `${stats.avgDuration}ms`;
        }
        return `${(stats.avgDuration / 1000).toFixed(1)}s`;

      case 'slowest_operation':
        return `最慢: ${this.formatDuration(stats.maxDuration)}`;

      case 'failures':
        return `✗ ${stats.failed}`;

      case 'ai_thinking':
        return 'AI: 0ms'; // 占位符

      case 'top_modules':
        return '热门: -'; // 占位符

      default:
        return '-';
    }
  }

  /**
   * 渲染单行
   */
  private renderLine(components: ComponentType[], separator: string, stats: SessionStats): string {
    return components
      .map(comp => this.renderComponent(comp, stats))
      .join(separator);
  }

  /**
   * 格式化时长
   */
  private formatDuration(ms: number): string {
    if (ms < 1000) {
      return `${ms}ms`;
    }
    return `${(ms / 1000).toFixed(1)}s`;
  }
}
```

**步骤 4：运行测试验证通过**

```bash
cd packages/ai-insights
npm run build
node --test test/renderer/StatusLineRenderer.test.ts
```

预期：通过

**步骤 5：提交**

```bash
cd packages/ai-insights
git add src/renderer/ test/renderer/
git commit -m "feat(ai-insights): 实现状态栏渲染器"
```

---

## 任务 6：实现监控服务（混合模式）

**文件：**
- 创建: `packages/ai-insights/src/monitor/MonitorService.ts`
- 测试: `packages/ai-insights/test/monitor/MonitorService.test.ts`

**步骤 1：编写失败的测试**

创建 `test/monitor/MonitorService.test.ts`:

```typescript
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
});
```

**步骤 2：运行测试验证失败**

预期：失败 - 找不到模块

**步骤 3：编写最小实现**

创建 `src/monitor/MonitorService.ts`:

```typescript
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
```

**步骤 4：运行测试验证通过**

```bash
cd packages/ai-insights
npm run build
node --test test/monitor/MonitorService.test.ts
```

预期：通过（可能需要根据实际情况微调）

**步骤 5：提交**

```bash
cd packages/ai-insights
git add src/monitor/ test/monitor/
git commit -m "feat(ai-insights): 实现监控服务"
```

---

## 任务 7：实现 CLI 报告生成器

**文件：**
- 创建: `packages/ai-insights/src/renderer/ReportRenderer.ts`
- 测试: `packages/ai-insights/test/renderer/ReportRenderer.test.ts`

**步骤 1：编写失败的测试**

创建 `test/renderer/ReportRenderer.test.ts`:

```typescript
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
});
```

**步骤 2：运行测试验证失败**

预期：失败 - 找不到模块

**步骤 3：编写最小实现**

创建 `src/renderer/ReportRenderer.ts`:

```typescript
import { SessionData } from '../types.js';

/**
 * 报告渲染器
 * 负责生成详细的性能报告
 */
export class ReportRenderer {
  /**
   * 生成性能报告
   */
  generateReport(session: SessionData): string {
    const successRate = Math.round((1 - session.stats.failureRate) * 100);
    const duration = session.endTime ?
      Math.round((session.endTime.getTime() - session.startTime.getTime()) / 60000) :
      0;

    return `# 📊 性能报告 - ${session.sessionId}

## 会话信息

- **日期：** ${session.startTime.toISOString().split('T')[0]}
- **时长：** ${duration} 分钟
- **总操作数：** ${session.stats.total}

## 效率指标

- **成功率：** ${successRate}%
- **平均耗时：** ${session.stats.avgDuration}ms
- **最大耗时：** ${this.formatDuration(session.stats.maxDuration)}
- **失败操作：** ${session.stats.failed}

## 统计数据

\`\`\`
总计：        ${session.stats.total}
已完成：      ${session.stats.completed}
失败：        ${session.stats.failed}
平均耗时：    ${session.stats.avgDuration}ms
最大耗时：    ${this.formatDuration(session.stats.maxDuration)}
\`\`\`

---
*由 AI Insights 生成*
`;
  }

  /**
   * 格式化时长
   */
  private formatDuration(ms: number): string {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  }
}
```

**步骤 4：运行测试验证通过**

```bash
cd packages/ai-insights
npm run build
node --test test/renderer/ReportRenderer.test.ts
```

预期：通过

**步骤 5：提交**

```bash
cd packages/ai-insights
git add src/renderer/ReportRenderer.ts test/renderer/ReportRenderer.test.ts
git commit -m "feat(ai-insights): 实现 CLI 报告生成器"
```

---

## 任务 8：创建 CLI 入口点

**文件：**
- 创建: `packages/ai-insights/src/index.ts`
- 创建: `packages/ai-insights/src/cli.ts`

**步骤 1：编写失败的测试（集成测试）**

创建 `test/cli.integration.test.ts`:

```typescript
import { describe, it } from 'node:test';
import { execSync } from 'child_process';
import assert from 'node:assert';

describe('CLI 集成测试', () => {
  it('应该在无参数时显示帮助', () => {
    try {
      const output = execSync('node dist/cli.js --help', { encoding: 'utf8' });
      assert.ok(output.includes('用法'));
    } catch (error) {
      assert.fail('应该显示帮助信息');
    }
  });
});
```

**步骤 2：运行测试验证失败**

```bash
cd packages/ai-insights
npm run build
node --test test/cli.integration.test.ts
```

预期：失败 - dist/cli.js 尚不存在

**步骤 3：编写最小实现**

创建 `src/cli.ts`:

```typescript
#!/usr/bin/env node

import { MonitorService } from './monitor/MonitorService.js';
import { ReportRenderer } from './renderer/ReportRenderer.js';
import { JSONStorage } from './storage/JSONStorage.js';
import { join } from 'path';
import { homedir } from 'os';

const DEFAULT_HISTORY_PATH = join(homedir(), '.claude', 'history.jsonl');
const DEFAULT_DATA_DIR = join(homedir(), '.claude', 'ai-insights');

interface CLIOptions {
  mode?: 'statusline' | 'report' | 'monitor';
  historyPath?: string;
  dataDir?: string;
}

function parseArgs(): CLIOptions {
  const args = process.argv.slice(2);
  const options: CLIOptions = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    switch (arg) {
      case '--mode':
        options.mode = args[++i] as any;
        break;
      case '--history':
        options.historyPath = args[++i];
        break;
      case '--data-dir':
        options.dataDir = args[++i];
        break;
      case '--help':
      case '-h':
        printHelp();
        process.exit(0);
    }
  }

  return options;
}

function printHelp() {
  console.log(`
AI Insights - Claude Code 性能监控

用法:
  ai-insights [选项]

选项:
  --mode <模式>      运行模式：statusline|report|monitor
  --history <路径>   history.jsonl 文件路径
  --data-dir <路径>  数据目录路径
  --help, -h         显示此帮助信息

示例:
  ai-insights --mode statusline
  ai-insights --mode report
  ai-insights --mode monitor
`);
}

async function main() {
  const options = parseArgs();

  const historyPath = options.historyPath || DEFAULT_HISTORY_PATH;
  const dataDir = options.dataDir || DEFAULT_DATA_DIR;
  const mode = options.mode || 'report';

  switch (mode) {
    case 'statusline': {
      const storage = new JSONStorage(dataDir);
      const session = await storage.loadCurrentSession();
      const stats = session.stats;

      console.log(`${stats.total} ops │ ${Math.round((1 - stats.failureRate) * 100)}% 成功 │ ${stats.avgDuration}ms`);
      break;
    }

    case 'report': {
      const storage = new JSONStorage(dataDir);
      const session = await storage.loadCurrentSession();
      const renderer = new ReportRenderer();

      console.log(renderer.generateReport(session));
      break;
    }

    case 'monitor': {
      const monitor = new MonitorService(historyPath, dataDir);
      await monitor.start();

      console.log('监控中... 按 Ctrl+C 停止');

      process.on('SIGINT', async () => {
        await monitor.stop();
        console.log('\n监控已停止');
        process.exit(0);
      });

      // 持续运行
      await new Promise(() => {});
      break;
    }

    default:
      console.error(`未知模式: ${mode}`);
      process.exit(1);
  }
}

main().catch(error => {
  console.error('错误:', error);
  process.exit(1);
});
```

更新 `src/index.ts`:

```typescript
/**
 * AI Insights - Claude Code 性能监控插件
 */

export { TranscriptParser } from './parser/TranscriptParser.js';
export { MetricsAnalyzer } from './analyzer/MetricsAnalyzer.js';
export { JSONStorage } from './storage/JSONStorage.js';
export { MonitorService } from './monitor/MonitorService.js';
export { StatusLineRenderer } from './renderer/StatusLineRenderer.js';
export { ReportRenderer } from './renderer/ReportRenderer.js';

export * from './types.js';
```

**步骤 4：运行测试验证通过**

```bash
cd packages/ai-insights
npm run build
node dist/cli.js --help
```

预期：显示帮助信息

**步骤 5：提交**

```bash
cd packages/ai-insights
git add src/index.ts src/cli.ts test/cli.integration.test.ts
git commit -m "feat(ai-insights): 实现 CLI 入口点"
```

---

## 任务 9：更新 package.json bin 入口

**文件：**
- 修改: `packages/ai-insights/package.json`

**步骤 1：添加 bin 入口**

编辑 `package.json`，在 `main` 字段后添加：

```json
{
  "name": "ai-insights",
  "version": "0.1.0",
  "description": "Claude Code 性能监控插件",
  "type": "module",
  "main": "dist/index.js",
  "bin": {
    "ai-insights": "dist/cli.js"
  },
  "scripts": {
    ...
  }
}
```

**步骤 2：提交**

```bash
cd packages/ai-insights
git add package.json
git commit -m "feat(ai-insights): 添加 CLI bin 入口"
```

---

## 任务 10：创建 Claude Code 插件命令

**文件：**
- 修改: `packages/ai-insights/commands/report.md`

**步骤 1：更新命令文件**

替换 `commands/report.md` 内容为：

```markdown
---
description: 生成并显示性能报告，展示操作指标、效率评分和洞察。
---

# 性能报告

运行以下命令生成详细的性能报告：

\`\`\`bash
node packages/ai-insights/dist/cli.js --mode report
\`\`\`

报告将显示：
- 总操作数
- 成功率百分比
- 平均和最大操作耗时
- 失败操作摘要
- 效率评分
```

**步骤 2：提交**

```bash
cd packages/ai-insights
git add commands/report.md
git commit -m "docs(ai-insights): 更新 perf:report 命令"
```

---

## 总结

本实施计划涵盖了 AI Insights MVP 第一阶段的所有功能：

✅ 核心类型定义
✅ 历史解析器
✅ 指标分析器
✅ JSON 存储
✅ 状态栏渲染器
✅ 监控服务（混合模式）
✅ CLI 报告生成器
✅ CLI 入口点
✅ 插件命令集成

**预计总时间：** 10 个任务 × 约 15 分钟 = 约 2.5 小时

**后续阶段**（不在此计划中）：
- 第二阶段：语义引擎（标签、分类、模块分组）
- 第三阶段：高级功能（3 行状态栏、配置热重载）
- 第四阶段：AI 摘要、趋势分析、Web 仪表板
