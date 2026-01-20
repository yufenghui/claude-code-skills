#!/usr/bin/env node

import { MetricsAnalyzer } from './dist/analyzer/MetricsAnalyzer.js';
import { join } from 'path';
import { homedir } from 'os';

console.log('📊 性能状态栏\n');
console.log('⚠️  注意：由于 Claude Code 的 history.jsonl 格式限制，');
console.log('   当前无法从日志中提取工具调用数据。\n');
console.log('   以下是使用模拟数据生成的演示状态：\n');

const metricsAnalyzer = new MetricsAnalyzer();

// 生成模拟数据
const mockOperations = [
  { name: 'Read', target: 'src/index.ts', duration: 150, status: 'completed' },
  { name: 'Edit', target: 'src/index.ts', duration: 320, status: 'completed' },
  { name: 'Bash', target: 'npm test', duration: 2500, status: 'completed' },
  { name: 'Bash', target: 'npm install', duration: 45200, status: 'completed' },
  { name: 'Glob', target: '**/*.ts', duration: 80, status: 'completed' },
  { name: 'Bash', target: 'invalid-command', duration: 50, status: 'error', errorMessage: 'command not found' },
];

// 添加更多操作
for (let i = 0; i < 50; i++) {
  mockOperations.push({
    name: ['Read', 'Edit', 'Bash', 'Glob', 'Grep'][Math.floor(Math.random() * 5)],
    target: `file-${i}.ts`,
    duration: Math.floor(Math.random() * 3000) + 50,
    status: 'completed'
  });
}

// 添加一些失败
for (let i = 0; i < 5; i++) {
  mockOperations.push({
    name: 'Bash',
    target: `failed-command-${i}`,
    duration: 100,
    status: 'error',
    errorMessage: 'Test error'
  });
}

// 分析数据
mockOperations.forEach(op => metricsAnalyzer.update(op));
const stats = metricsAnalyzer.getStats();

// 生成状态栏
const successRate = ((1 - stats.failureRate) * 100).toFixed(1);
const avgTime = (stats.avgDuration / 1000).toFixed(1);

console.log('┌────────────────────────────────────────┐');
console.log(`│ ${stats.total} ops │ ${successRate}% 成功 │ ${avgTime}s │`);
console.log('└────────────────────────────────────────┘');

console.log('\n📌 详细指标：');
console.log(`   • 总操作数：${stats.total}`);
console.log(`   • 成功：${stats.completed}`);
console.log(`   • 失败：${stats.failed}`);
console.log(`   • 平均耗时：${stats.avgDuration}ms`);
console.log(`   • 最长耗时：${stats.maxDuration}ms`);

// 慢操作提示
const slowOps = metricsAnalyzer.getSlowOperations(5000);
if (slowOps.length > 0) {
  console.log(`\n⚠️  检测到 ${slowOps.length} 个慢操作（>5s）`);
}

// 失败操作提示
const failures = metricsAnalyzer.getFailures();
if (failures.size > 0) {
  const totalFailures = Array.from(failures.values()).reduce((sum, arr) => sum + arr.length, 0);
  console.log(`\n❌ 检测到 ${totalFailures} 个失败操作`);
}

console.log('\n---');
console.log('\n💡 提示：');
console.log('当前使用模拟数据。要实现真实监控，需要：');
console.log('1. Claude Code 添加工具调用日志记录');
console.log('2. 或提供插件 Hook 机制捕获操作');
