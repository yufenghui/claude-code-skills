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
