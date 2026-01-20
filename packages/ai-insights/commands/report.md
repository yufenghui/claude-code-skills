---
name: perf-report
description: 生成 Claude Code 性能分析报告，包含操作耗时、失败率、效率评分等指标
---

## 使用场景

当用户需要了解当前会话的性能表现时，可以：

1. **直接调用**：使用 `/perf-report` 命令
2. **自然语言**：询问"显示性能报告"、"分析最近操作"、"查看效率评分"

## 输出内容

### 会话概览
- 会话时间和时长
- 总操作数

### 效率指标
- 成功率百分比
- 平均耗时
- 效率评分（0-100）

### 慢操作 TOP5
- 最耗时的 5 个操作列表
- 包含工具名、目标、耗时

### 失败分析
- 失败操作列表
- 失败原因聚合

### 模块耗时分布
- 各模块的耗时统计
- 操作数量分布

## 实现说明

此命令调用 `ai-insights` 插件的 CLI 报告生成器。

在开发环境中，使用以下命令测试：

```bash
# 从项目根目录
npx tsx packages/ai-insights/src/cli.ts --mode report

# 从插件目录
cd packages/ai-insights
npm run cli -- --mode report
```

在生产环境中（安装到 Claude Code 插件目录后）：

```bash
ai-insights --mode report
```

## 示例输出

```markdown
# 📊 性能报告 - 实现用户认证功能

## 会话信息

- **日期：** 2026-01-19
- **时长：** 45 分钟
- **总操作数：** 127

## 效率指标

- **成功率：** 94.5%
- **平均耗时：** 1.8s
- **最大耗时：** 45.2s
- **失败操作：** 3

## 慢操作 TOP5

1. Bash "npm install" - 45.2s 🔥
2. Read node_modules/... - 12.3s 🐌
3. Write src/auth/login.ts - 8.7s 🐌
4. Bash "git clone" - 6.5s 🐌
5. Edit package.json - 5.2s 🐌

## 统计数据

```
总计：        127
已完成：      124
失败：        3
平均耗时：    1800ms
最大耗时：    45200ms
```

---
*由 AI Insights 生成*
```
