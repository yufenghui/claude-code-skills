# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 工作语言

**重要：本仓库所有开发工作使用中文进行。**

- 所有代码注释使用中文
- 所有文档使用中文编写
- 所有 commit message 使用中文
- 所有测试描述使用中文
- 与用户的交流使用中文

## 仓库结构

这是一个使用 npm workspaces 的 **monorepo**，用于开发 Claude Code 插件。`packages/` 中的每个插件都是独立的包，拥有自己的 `package.json`、构建流程和 TypeScript 配置。

```
packages/
├── ai-insights/          # 性能监控插件（开发中）
└── [future-plugins]/
```

## 常用命令

### 根目录命令
```bash
# 构建所有插件
npm run build

# 运行所有测试
npm test

# 清理所有构建产物
npm run clean
```

### 单个插件开发
```bash
# 进入特定插件目录
cd packages/ai-insights

# 安装依赖
npm install

# 开发模式（监听文件变化）
npm run dev

# 构建插件
npm run build

# 运行测试
npm test

# 运行测试并生成覆盖率报告
npm run test:coverage
```

### 本地测试插件
```bash
# 使用 Claude Code 测试本地插件
claude --plugin-dir ./packages/ai-insights
```

## 架构概览

### ai-insights 插件架构

**ai-insights** 是一个基于 TypeScript 的 Claude Code 性能监控插件，数据流如下：

```
history.jsonl (Claude 日志)
  → Parser (TranscriptParser 解析器)
  → Analyzer (MetricsAnalyzer 分析引擎)
  → Storage (基于 JSON，可扩展至 SQLite)
  → Renderer (StatusLine + CLI 报告)
```

**核心模块：**
- `src/parser/` - 将 `~/.claude/history.jsonl` 解析为结构化的 ToolOperation 对象
- `src/analyzer/` - 计算指标（耗时、失败率、效率评分）
- `src/semantic/` - 添加语义标签（config/bugfix/feature）和模块分组
- `src/storage/` - 管理会话数据持久化，支持可插拔的后端
- `src/renderer/` - 格式化 StatusLine 和 CLI 报告输出

**关键设计决策：**
- **非侵入式监控**：通过 `fs.watch()` 读取 Claude 日志，失败时降级为轮询
- **增量解析**：跟踪文件位置，仅解析新增行
- **JSON 存储**：MVP 使用 JSON，预留 SQLite/PostgreSQL 接口
- **语义化洞察**：自动分类操作（如 "Write *.test.ts" → "编写测试"）

**TypeScript 配置：**
- Target: ES2022
- Module: NodeNext（ESM 兼容）
- 启用严格模式
- 生成 source maps 和类型声明文件

### 构建流程

每个插件使用 `tsc` 将 TypeScript 编译到 `dist/` 目录。入口文件是 `dist/index.js`（ESM 格式）。

## 设计文档

详细设计规范请参阅 `docs/plans/`：
- `2026-01-19-ai-insights-design.md` - ai-insights 插件的完整架构和数据结构设计

## 插件开发流程

1. **创建新插件**：`mkdir packages/your-plugin && cd packages/your-plugin && npm init`
2. **必需结构**：
   ```
   .claude-plugin/plugin.json  # 插件清单
   src/                        # 源代码
   commands/                   # CLI 命令（.md 文件）
   skills/                     # AI 技能（.md 文件）
   ```
3. **构建**：`npm run build` 将 `src/` 编译到 `dist/`
4. **本地测试**：使用 Claude Code 的 `--plugin-dir` 参数

## 重要说明

- Monorepo 使用 npm workspaces
- 所有插件必须兼容 Node.js 18+
- 每个插件独立版本控制和发布
- 插件元数据定义在 `.claude-plugin/plugin.json` 中，而非 `package.json`
