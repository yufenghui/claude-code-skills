#!/usr/bin/env node

import { MonitorService } from './monitor/MonitorService.js';
import { ReportRenderer } from './renderer/ReportRenderer.js';
import { StatusLineRenderer } from './renderer/StatusLineRenderer.js';
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
