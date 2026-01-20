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
