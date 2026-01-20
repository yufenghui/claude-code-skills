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
