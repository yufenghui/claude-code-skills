# AI Insights - 使用指南

## 🚀 快速开始

### 运行 CLI 工具

由于 TypeScript 编译器兼容性问题，我们使用 `tsx` 直接运行 TypeScript 源代码：

```bash
# 方式 1: 使用 npm script
cd packages/ai-insights
npm run cli -- --help

# 方式 2: 直接使用 tsx
npx tsx packages/ai-insights/src/cli.ts --help

# 方式 3: 生成性能报告
npx tsx packages/ai-insights/src/cli.ts --mode report
```

### 可用模式

1. **statusline** - 显示实时状态栏
   ```bash
   npx tsx src/cli.ts --mode statusline
   ```

2. **report** - 生成详细性能报告
   ```bash
   npx tsx src/cli.ts --mode report
   ```

3. **monitor** - 启动文件监控服务
   ```bash
   npx tsx src/cli.ts --mode monitor
   ```

## 🧪 运行测试

```bash
# 运行所有单元测试
npx tsx --test test/**/*.test.ts

# 运行特定测试
npx tsx --test test/analyzer/MetricsAnalyzer.test.ts
```

## 📦 项目结构

```
packages/ai-insights/
├── src/                 # TypeScript 源代码
├── dist/                # 构建产物（目前为 .ts 文件）
├── test/                # 测试文件
├── build.mjs            # 构建脚本
├── package.json         # 包配置
└── tsconfig.json        # TypeScript 配置
```

## ⚠️ 已知问题

### TypeScript 编译器问题

**症状：** `tsc` 命令不生成 JavaScript 文件

**原因：** Windows 环境下的 TypeScript 编译器配置问题

**解决方案：** 使用 `tsx` 直接运行 TypeScript 源代码

```bash
# ❌ 不工作
node dist/cli.js --help

# ✅ 正确方式
npx tsx src/cli.ts --help
```

### 路径重复问题

如果看到类似 `packages/ai-insights\packages\ai-insights` 的错误路径，说明：

1. 您可能在错误的目录下运行命令
2. npm link 配置有问题

**解决方案：**

```bash
# 确保在项目根目录
cd D:\project\claude-code-skills

# 使用完整路径运行
npx tsx packages/ai-insights/src/cli.ts --help
```

## 🔧 开发

### 安装依赖

```bash
cd packages/ai-insights
npm install
```

### 重新构建

```bash
npm run build
```

### 监听模式（开发）

```bash
npm run dev
```

## 📝 模块说明

| 模块 | 文件 | 功能 |
|------|------|------|
| 类型定义 | `src/types.ts` | 核心数据类型 |
| 历史解析器 | `src/parser/TranscriptParser.ts` | 解析 history.jsonl |
| 指标分析器 | `src/analyzer/MetricsAnalyzer.ts` | 计算性能指标 |
| JSON 存储 | `src/storage/JSONStorage.ts` | 数据持久化 |
| 状态栏渲染器 | `src/renderer/StatusLineRenderer.ts` | 状态栏显示 |
| 报告渲染器 | `src/renderer/ReportRenderer.ts` | 生成报告 |
| 监控服务 | `src/monitor/MonitorService.ts` | 集成所有模块 |
| CLI 工具 | `src/cli.ts` | 命令行接口 |

## 🎯 示例

### 查看实时状态

```bash
npx tsx packages/ai-insights/src/cli.ts --mode statusline
# 输出: 42 ops │ 95% 成功 │ 150ms
```

### 生成性能报告

```bash
npx tsx packages/ai-insights/src/cli.ts --mode report
# 输出: Markdown 格式的详细报告
```

### 启动监控

```bash
npx tsx packages/ai-insights/src/cli.ts --mode monitor
# 持续监控 history.jsonl 文件变化
# 按 Ctrl+C 停止
```

## 🐛 故障排除

### 问题：找不到模块

```
Error: Cannot find module '...'
```

**解决：**
```bash
# 安装 tsx
npm install -D tsx

# 或使用 npx（自动下载）
npx tsx ...
```

### 问题：权限错误

```
Error: EACCES: permission denied
```

**解决：**
```bash
# Windows (以管理员身份运行)
# Linux/Mac
chmod +x packages/ai-insights/build.mjs
```

### 问题：测试失败

```
Error [ERR_MODULE_NOT_FOUND]
```

**解决：**
```bash
# 确保在正确的目录
cd packages/ai-insights

# 使用 tsx 运行测试
npx tsx --test test/**/*.test.ts
```

## 📚 更多信息

- [测试验证报告](../../docs/test-validation-report.md)
- [项目完成总结](../../docs/project-completion-summary.md)
- [MVP 实施计划](./docs/plans/2026-01-19-ai-insights-mvp-实施计划.md)
