# AI Insights 插件 - 已知问题

## 🔴 关键问题：缺少数据源

### 问题描述

**当前无法实现完整的性能监控功能**，因为 Claude Code 的 `history.jsonl` 日志格式不包含工具调用数据。

### 详细说明

#### 当前日志格式

`~/.claude/history.jsonl` 仅记录用户消息：

```json
{
  "display": "用户输入的文本消息",
  "timestamp": 1768919798131,
  "project": "D:\\project\\path",
  "sessionId": "session-id"
}
```

#### 缺失的关键信息

性能监控需要的以下数据在日志中**完全缺失**：

- ❌ 工具名称（Read、Edit、Bash、Glob、Grep 等）
- ❌ 工具参数（file_path、command、pattern 等）
- ❌ 执行时间（startTime、endTime）
- ❌ 执行时长（duration）
- ❌ 执行结果（success、error）
- ❌ 错误信息（error message）

### 影响

虽然插件的**核心框架已完全实现**：
- ✅ `TranscriptParser` - 解析器
- ✅ `MetricsAnalyzer` - 指标分析器
- ✅ `JSONStorage` - 数据存储
- ✅ `ReportRenderer` - 报告生成器
- ✅ `MonitorService` - 监控服务
- ✅ `performance-monitor` 技能

但由于缺少数据源，插件**无法从实际运行中提取性能数据**。

## 🔧 可能的解决方案

### 方案 1：扩展 history.jsonl 格式

**需要：** Claude Code 团队在日志中记录工具调用详情

**优先级：** 高（影响所有性能监控类插件）

**实现建议：**
```json
{
  "type": "tool_use",
  "tool_name": "Read",
  "input": { "file_path": "src/index.ts" },
  "status": "completed",
  "timestamp": 1768919798131,
  "duration": 150
}
```

### 方案 2：插件 Hook 机制

**需要：** Claude Code 提供插件 hook 系统

**优先级：** 中（更通用，适用于多种插件类型）

**示例 API：**
```javascript
// 在插件中注册 hooks
hooks.on('tool_start', (tool, params) => {
  // 记录开始时间
});

hooks.on('tool_end', (tool, params, result, duration) => {
  // 记录结束时间和结果
});
```

### 方案 3：Agent 事件发射器

**需要：** 在 Agent 层面添加 EventEmitter

**优先级：** 中（内部实现，不需要公开 API）

**示例：**
```javascript
agent.emit('tool_invocation', {
  tool: 'Read',
  params: { file_path: 'src/index.ts' },
  startTime: Date.now()
});
```

## 📊 当前状态

### 可用功能

- ✅ 完整的代码框架和架构
- ✅ 使用模拟数据的演示功能
- ✅ 命令文档和技能定义
- ✅ 报告生成逻辑

### 不可用功能

- ❌ 从实际日志提取性能数据
- ❌ 实时性能监控
- ❌ 历史会话分析
- ❌ 效率趋势追踪

## 🧪 演示模式

为展示功能，提供了两个演示脚本：

### 1. 性能报告

```bash
cd packages/ai-insights
node demo-report.mjs
```

生成包含以下内容的完整报告：
- 会话统计（操作数、成功率、平均耗时）
- 慢操作 TOP5
- 失败操作分析
- 效率评分

### 2. 性能状态栏

```bash
cd packages/ai-insights
node demo-status.mjs
```

显示单行性能摘要：
```
61 ops │ 90.2% 成功 │ 2.0s
```

## 🎯 后续计划

### 短期（等待 Claude Code 支持）

1. 持续跟踪 Claude Code 更新
2. 关注插件系统开发进展
3. 准备功能请求文档

### 中期（如果有 Hook 机制）

1. 适配新的 Hook API
2. 实现实时数据采集
3. 添加会话持久化

### 长期（完整功能）

1. 历史趋势分析
2. 多会话对比
3. 性能优化建议
4. 可视化仪表板

## 📝 更新日志

- **2026-01-20**: 发现 history.jsonl 格式限制，创建此文档记录问题和解决方案
- **2026-01-19**: 完成核心框架实现

## 🤝 贡献

如果你有解决方案或建议，欢迎：
1. 提交 Issue
2. 发起 Pull Request
3. 在 Claude Code 社区讨论

---

**相关文档：**
- [PLUGIN_USAGE.md](./PLUGIN_USAGE.md) - 插件使用指南
- [INSTALL.md](./INSTALL.md) - 安装说明
- [design.md](../docs/plans/2026-01-19-ai-insights-design.md) - 设计文档
