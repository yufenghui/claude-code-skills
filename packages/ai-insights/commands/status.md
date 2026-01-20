---
name: perf-status
description: 显示实时性能状态栏，展示当前会话的关键指标
---

## 使用场景

需要快速查看当前会话的性能状态时使用。

## 输出格式

单行状态栏显示，包含：

1. **操作总数** - 当前会话执行的工具操作数量
2. **成功率** - 成功操作的百分比
3. **平均耗时** - 所有操作的平均执行时间

示例：
```
42 ops │ 95% 成功 │ 150ms
```

## 使用方法

### 开发环境测试

```bash
# 从项目根目录
npx tsx packages/ai-insights/src/cli.ts --mode statusline

# 从插件目录
cd packages/ai-insights
npm run cli -- --mode statusline
```

### 生产环境

安装插件后：

```bash
ai-insights --mode statusline
```

## 配置

状态栏的显示内容可以通过修改 `DisplayConfig` 来自定义：

- 改变显示组件
- 调整分隔符
- 添加多行显示

支持的组件：
- `ops_count` - 操作总数
- `success_rate` - 成功率
- `avg_duration` - 平均耗时
- `slowest_operation` - 最慢操作
- `failures` - 失败数
- `ai_thinking` - AI 思考时间
- `top_modules` - 热门模块

## 示例

### 基础状态栏
```
127 ops │ 94.5% 成功 │ 1.8s
```

### 详细状态栏
```
127 ops │ 94.5% 成功 │ 1.8s │ 最慢: 45.2s │ ✗ 3
```

### 多行状态栏
```
127 ops │ 94.5% 成功 │ 1.8s
最慢: 45.2s │ 热门: src/auth/ (42 ops)
失败: 3 │ 效率: 82/100
```
