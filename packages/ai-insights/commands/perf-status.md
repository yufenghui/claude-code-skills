---
name: perf-status
description: 显示实时性能状态栏，展示当前会话的关键指标
---

# 性能状态

显示当前会话的关键性能指标。

## 使用方法

运行以下命令生成状态栏：

```bash
npx tsx packages/ai-insights/src/cli.ts --mode statusline
```

## 示例输出

```
127 ops │ 94.5% 成功 │ 1.8s
```

## 备用方案

如果 CLI 不可用，可以手动读取缓存数据：

```bash
cat ~/.claude/ai-insights/current-session.json
```
