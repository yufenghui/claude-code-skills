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
