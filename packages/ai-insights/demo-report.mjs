#!/usr/bin/env node

import { MetricsAnalyzer } from './dist/analyzer/MetricsAnalyzer.js';
import { JSONStorage } from './dist/storage/JSONStorage.js';
import { join } from 'path';
import { homedir } from 'os';

const dataDir = join(homedir(), '.claude', 'ai-insights');

console.log('📊 正在生成演示性能报告...\n');
console.log('⚠️  注意：由于 Claude Code 的 history.jsonl 格式限制，');
console.log('   当前无法从日志中提取工具调用数据。\n');
console.log('   以下是使用模拟数据生成的演示报告：\n');

const metricsAnalyzer = new MetricsAnalyzer();

// 生成模拟数据
const mockOperations = [
  // 正常操作
  { name: 'Read', target: 'src/index.ts', startTime: new Date(), endTime: new Date(), duration: 150, status: 'completed' },
  { name: 'Edit', target: 'src/index.ts', startTime: new Date(), endTime: new Date(), duration: 320, status: 'completed' },
  { name: 'Bash', target: 'npm test', startTime: new Date(), endTime: new Date(), duration: 2500, status: 'completed' },

  // 慢操作
  { name: 'Bash', target: 'npm install', startTime: new Date(), endTime: new Date(), duration: 45200, status: 'completed' },
  { name: 'Bash', target: 'npm run build', startTime: new Date(), endTime: new Date(), duration: 12300, status: 'completed' },
  { name: 'Read', target: 'node_modules/large-package/index.js', startTime: new Date(), endTime: new Date(), duration: 8500, status: 'completed' },

  // 快速操作
  { name: 'Glob', target: '**/*.ts', startTime: new Date(), endTime: new Date(), duration: 80, status: 'completed' },
  { name: 'Grep', target: 'function test', startTime: new Date(), endTime: new Date(), duration: 120, status: 'completed' },
  { name: 'Write', target: 'src/test.ts', startTime: new Date(), endTime: new Date(), duration: 200, status: 'completed' },

  // 失败操作
  { name: 'Bash', target: 'invalid-command', startTime: new Date(), endTime: new Date(), duration: 50, status: 'error', errorMessage: 'command not found: invalid-command' },
  { name: 'Read', target: 'nonexistent.ts', startTime: new Date(), endTime: new Date(), duration: 30, status: 'error', errorMessage: 'File not found: nonexistent.ts' },
  { name: 'Edit', target: 'readonly.ts', startTime: new Date(), endTime: new Date(), duration: 100, status: 'error', errorMessage: 'Permission denied: readonly.ts' },
];

// 添加更多操作以达到统计意义
for (let i = 0; i < 50; i++) {
  mockOperations.push({
    name: ['Read', 'Edit', 'Bash', 'Glob', 'Grep'][Math.floor(Math.random() * 5)],
    target: `file-${i}.ts`,
    startTime: new Date(),
    endTime: new Date(),
    duration: Math.floor(Math.random() * 3000) + 50,
    status: 'completed'
  });
}

// 添加一些失败
for (let i = 0; i < 5; i++) {
  mockOperations.push({
    name: 'Bash',
    target: `failed-command-${i}`,
    startTime: new Date(),
    endTime: new Date(),
    duration: 100,
    status: 'error',
    errorMessage: 'Test error'
  });
}

// 分析数据
mockOperations.forEach(op => metricsAnalyzer.update(op));
const metrics = metricsAnalyzer.getStats();
metrics.success = metrics.completed;

// 生成报告
console.log('📊 性能报告\n');
console.log('## 会话信息');
console.log(`- 总操作数: ${metrics.total}`);
console.log(`- 成功: ${metrics.success}`);
console.log(`- 失败: ${metrics.failed}`);
console.log(`- 失败率: ${(metrics.failureRate * 100).toFixed(1)}%\n`);

console.log('## 耗时统计');
console.log(`- 平均耗时: ${metrics.avgDuration.toFixed(0)}ms`);
console.log(`- 最长耗时: ${metrics.maxDuration}ms`);
console.log(`- 最短耗时: N/A\n`);

// 找出慢操作
const slowOps = metricsAnalyzer.getSlowOperations(5000).slice(0, 5);

if (slowOps.length > 0) {
  console.log('## 慢操作 TOP5 🔥');
  slowOps.forEach((op, i) => {
    const duration = ((op.duration || 0) / 1000).toFixed(1);
    const emoji = op.duration && op.duration > 30000 ? '🔥' : '🐌';
    const toolName = op.name || 'Unknown';
    const target = op.target ? ` (${op.target.substring(0, 30)}...)` : '';
    console.log(`${i + 1}. ${toolName}${target} - ${duration}s ${emoji}`);
  });
  console.log('');
}

// 找出失败操作
const failures = metricsAnalyzer.getFailures();
if (failures.size > 0) {
  console.log('## 失败操作 ❌');
  const totalFailures = Array.from(failures.values()).reduce((sum, arr) => sum + arr.length, 0);
  console.log(`共 ${totalFailures} 个操作失败\n`);

  failures.forEach((ops, error) => {
    console.log(`- ${error}: ${ops.length} 次`);
  });
  console.log('');
}

// 计算效率评分
const score = metricsAnalyzer.calculateEfficiencyScore();
console.log('## 效率评分');
console.log(`综合评分: ${score}/100 ${score >= 80 ? '⭐⭐⭐⭐⭐' : score >= 60 ? '⭐⭐⭐' : '⭐⭐'}`);

console.log('\n---');
console.log('\n📌 说明：');
console.log('当前 Claude Code 的 history.jsonl 格式仅记录用户消息，');
console.log('不包含工具调用的详细信息（工具名、参数、结果等）。');
console.log('\n要实现完整的性能监控功能，需要：');
console.log('1. Claude Code 添加工具调用日志记录功能');
console.log('2. 或使用 Agent 级别的 hook 机制捕获工具调用');
console.log('3. 或在插件层面通过事件监听捕获操作');
