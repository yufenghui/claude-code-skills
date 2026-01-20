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
