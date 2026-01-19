# AI Insights - Claude Code 性能监控插件设计文档

**日期：** 2026-01-19
**版本：** 0.1.0
**状态：** 设计阶段

---

## 📋 目录

- [1. 项目概述](#1-项目概述)
- [2. 核心价值](#2-核心价值)
- [3. 架构设计](#3-架构设计)
- [4. 数据结构](#4-数据结构)
- [5. 监控指标体系](#5-监控指标体系)
- [6. 核心模块设计](#6-核心模块设计)
- [7. 展示层设计](#7-展示层设计)
- [8. 配置系统](#8-配置系统)
- [9. 测试策略](#9-测试策略)
- [10. 实施计划](#10-实施计划)

---

## 1. 项目概述

### 1.1 核心目标

开发一个 **Claude Code 插件**，用于监控和分析 AI 在编程过程中的操作耗时，识别低效和无效操作，提供语义化的洞察，帮助开发者优化 AI 辅助编程的工作流程。

### 1.2 核心特性

- ✅ **非侵入式监控**：读取 `~/.claude/history.jsonl`，无需修改 Claude Code 源码
- ✅ **语义化洞察**：不仅监控"工具调用"，更理解"做了什么"
- ✅ **实时状态栏**：可配置 1-3 行动态显示关键指标
- ✅ **详细报告**：命令生成深度分析报告
- ✅ **模块化架构**：TypeScript 实现，易扩展

### 1.3 技术栈

- **语言**：TypeScript 5+
- **运行时**：Node.js 18+
- **依赖**：零运行时依赖
- **存储**：JSON（预留 SQLite/PostgreSQL 接口）
- **编译**：单文件可执行

---

## 2. 核心价值

### 2.1 识别瓶颈

找出哪些操作最耗时、最常失败：
- 慢操作检测（> 5s, > 30s）
- 失败原因聚合分析
- 模块级耗时分布

### 2.2 语义洞察

知道"做了什么"而非仅"工具名"：
- 操作语义标签（config/bugfix/feature/test）
- 模块路径分组（`src/api/`, `frontend/components/`）
- 会话主题自动生成

### 2.3 数据驱动

基于实际数据优化工作流程：
- 效率评分（0-100）
- 成功率、平均耗时统计
- AI 思考时间占比分析

### 2.4 长期追踪

监控个人/团队的 AI 使用习惯变化：
- 会话存档与检索
- 历史数据对比
- 未来：跨会话趋势分析

---

## 3. 架构设计

### 3.1 整体架构

```
history.jsonl (Claude Code 日志)
       ↓
   Parser (解析器)
       ↓
 Analyzer (分析引擎) → Memory Cache (实时数据)
       ↓                      ↓
   Storage (持久化)      StatusLine (实时显示)
       ↓
 CLI Report (按需报告)
```

### 3.2 数据流

**实时监控流：**
```
fs.watch() 监听 history.jsonl 变化
  → 检测新增行
  → Parser 解析为 ToolOperation
  → Analyzer 计算指标
  → 更新 Memory Cache
  → 触发 StatusLine 刷新
```

**报告生成流：**
```
用户触发 /perf:report
  → 读取当前会话数据
  → 生成统计摘要
  → 格式化为 Markdown 报告
  → 输出到终端
```

### 3.3 监控模式

**混合模式（推荐）：**
- 优先使用 `fs.watch()` 实时监听文件变化
- 失败时降级为轮询（5 秒间隔）
- 维护内存缓存（当前会话操作数据）

---

## 4. 数据结构

### 4.1 操作记录

```typescript
interface ToolOperation {
  id: string;                  // 工具调用 ID
  name: string;                // 工具名称 (Read, Write, Bash 等)
  target?: string;             // 目标 (文件路径、命令摘要)
  semanticLabel?: string;      // 语义标签："读取配置文件"、"修复 API bug"
  semanticCategory?: string;   // 分类：config/bugfix/feature/refactor/test
  module?: string;             // 模块路径："src/api/", "frontend/components/"
  startTime: Date;             // 开始时间
  endTime?: Date;              // 结束时间（进行中为 undefined）
  status: 'running' | 'completed' | 'error';
  duration?: number;           // 耗时（毫秒）
  errorMessage?: string;       // 错误信息
}
```

### 4.2 会话数据

```typescript
interface SessionData {
  sessionId: string;           // 会话 ID
  startTime: Date;
  operations: ToolOperation[];
  stats: SessionStats;
}

interface SessionStats {
  total: number;               // 总操作数
  completed: number;           // 完成数
  failed: number;              // 失败数
  avgDuration: number;         // 平均耗时
  maxDuration: number;         // 最大耗时
  failureRate: number;         // 失败率 (0-1)
}
```

### 4.3 会话摘要（持久化）

```typescript
interface SessionSummary {
  sessionId: string;
  date: string;                // YYYY-MM-DD
  startTime: Date;
  endTime?: Date;
  sessionTitle: string;        // 会话主题："实现用户认证功能"
  sessionSummary: string;      // 会话摘要（1-2 句话）
  mainActivities: string[];    // 主要活动：["bugfix", "feature", "test"]
  topModules: Array<{          // 耗时最长的模块
    module: string;
    totalTime: number;
    operationCount: number;
  }>;
  totalOperations: number;
  failureRate: number;
  avgDuration: number;
  efficiencyScore: number;     // 效率评分 (0-100)
}
```

---

## 5. 监控指标体系

### 5.1 操作耗时分析

**实时指标：**
- 当前操作耗时
- 平均耗时（按工具类型分组）
- 最大耗时及操作详情

**慢操作标记：**
- 🐌 Slow: > 5s
- 🔥 Very Slow: > 30s

**TOP5 耗时操作：** 在报告中展示

### 5.2 失败率统计

**实时失败率：**
```typescript
failureRate = failedOperations / totalOperations
```

**按工具类型分组：**
- Read 失败率
- Write 失败率
- Bash 失败率
- Skill/Task 失败率

**失败原因聚合：**
- `file_not_found × 3`
- `timeout × 1`
- `permission_denied × 2`

### 5.3 效率评分

**评分公式：**
```typescript
score = (
  (successRate * 40) +         // 成功率权重 40%
  (speedScore * 30) +          // 速度评分 30%（对比历史平均）
  (consistencyScore * 30)      // 稳定性 30%（方差）
)
```

**评分等级：**
- 90-100: 优秀 ⭐⭐⭐⭐⭐
- 75-89: 良好 ⭐⭐⭐⭐
- 60-74: 一般 ⭐⭐⭐
- < 60: 需改进 ⭐⭐

### 5.4 AI 思考时间

**推断方法：**
通过相邻工具调用的时间间隔推断 AI 推理时长。

**计算逻辑：**
- 过滤掉 < 2s 的间隔（视为工具执行时间）
- 计算平均思考时间
- 识别"卡顿"点（间隔 > 10s）

**展示指标：**
- 总思考时间
- 平均思考时长
- 思考时间占比

### 5.5 会话级别统计

**基础指标：**
- 总操作数
- 成功/失败数
- 平均耗时
- 会话时长
- 效率得分

**高级指标：**
- 主要活动类型分布
- 模块耗时排行
- 失败原因分析

---

## 6. 核心模块设计

### 6.1 Parser（解析器）

**职责：** 将 `history.jsonl` 的原始 JSON 转换为结构化的 `ToolOperation` 对象。

**核心方法：**
```typescript
class TranscriptParser {
  async parseNewLines(lastPosition: number): Promise<ToolOperation[]>;
  private extractToolUses(entry: any): Partial<ToolOperation>[];
  private pairToolUses(operations: Partial<ToolOperation>[]): ToolOperation[];
}
```

**增量解析策略：**
- 记录已解析的文件位置（`lastPosition`）
- 每次只读取新增内容
- 维护 `running` 状态的操作

### 6.2 Analyzer（分析引擎）

**职责：** 实时计算监控指标，维护统计数据。

**核心方法：**
```typescript
class MetricsAnalyzer {
  update(operation: ToolOperation): void;
  private recalculateStats(): void;
  private detectSlowOperations(op: ToolOperation): void;
  calculateEfficiencyScore(): number;
  inferAIThinkingTime(): number;
}
```

**优化策略：**
- 增量计算（只重新计算变化的指标）
- 缓存统计结果
- 防抖处理（1 秒内多次更新合并）

### 6.3 SemanticEngine（语义化引擎）

**职责：** 为操作添加语义标签和分类。

**语义识别规则：**
```typescript
const SEMANTIC_RULES = {
  'Read package.json': { label: '读取依赖配置', category: 'config' },
  'Write *.test.ts': { label: '编写测试', category: 'test' },
  'Edit src/api/*': { label: '修改 API', module: 'src/api/' },
  'Bash git commit': { label: '提交代码', category: 'refactor' },
};
```

**模块分组策略：**
```typescript
src/api/user.ts     → "src/api/user/"
src/components/     → "frontend/components/"
tests/unit/         → "tests/"
```

**会话主题生成（MVP 简化版）：**
- 统计高频操作类型
- 提取高频模块路径
- 生成标题：`"主要工作：${模块} - ${主要活动}"`

### 6.4 Storage（存储层）

**职责：** 管理监控数据的存储和查询。

**存储接口（预留扩展）：**
```typescript
interface IStorage {
  saveCurrentSession(data: SessionData): Promise<void>;
  loadCurrentSession(): Promise<SessionData>;
  archiveSession(sessionId: string): Promise<void>;
  listSessions(filters?: SessionFilters): Promise<SessionSummary[]>;
  getSession(sessionId: string): Promise<SessionSummary | null>;
}
```

**数据文件结构：**
```bash
~/.claude/ai-insights/
├── current-session.json
├── sessions/
│   ├── 2026-01-19_session-abc123.json
│   └── 2026-01-19_session-def456.json
├── index.json
└── config.json
```

**归档策略：**
- 会话结束时自动归档
- 保留最近 30 天详细数据
- 超过 30 天只保留摘要

---

## 7. 展示层设计

### 7.1 StatusLine 渲染

**配置文件（`~/.claude/ai-insights/config.json`）：**
```json
{
  "display": {
    "lines": 2,
    "line1": {
      "components": ["ops_count", "success_rate", "avg_duration"],
      "separator": " │ "
    },
    "line2": {
      "components": ["slowest_operation", "failures"],
      "separator": " │ "
    },
    "line3": {
      "components": ["ai_thinking", "top_modules"],
      "separator": " │ "
    }
  }
}
```

**渲染器：**
```typescript
class StatusLineRenderer {
  render(config: DisplayConfig, stats: SessionStats): string;
  private renderComponent(type: string, stats: SessionStats): string;
}
```

**组件库：**
- `ops_count`: 操作总数
- `success_rate`: 成功率百分比
- `avg_duration`: 平均耗时
- `slowest_operation`: 最慢操作
- `failures`: 失败摘要
- `ai_thinking`: AI 思考时间占比
- `top_modules`: 耗时最长模块

### 7.2 CLI 报告

**报告模板：**
```markdown
## 📊 性能报告 - ${sessionTitle}

### 会话信息
- 时间: ${date}
- 时长: ${duration}
- 总操作: ${totalOperations}

### 效率指标
- 成功率: ${successRate}%
- 平均耗时: ${avgDuration}ms
- 效率评分: ${efficiencyScore}/100

### 慢操作 TOP5
${slowOpsTable}

### 失败分析
${failuresTable}

### 模块耗时分布
${moduleStatsTable}
```

---

## 8. 配置系统

### 8.1 配置文件

**位置：** `~/.claude/ai-insights/config.json`

**默认配置：**
```json
{
  "display": {
    "lines": 2,
    "line1": {
      "components": ["ops_count", "success_rate", "avg_duration"],
      "separator": " │ "
    },
    "line2": {
      "components": ["slowest_operation", "failures"],
      "separator": " │ "
    },
    "line3": {
      "components": ["ai_thinking", "top_modules"],
      "separator": " │ "
    }
  },
  "monitoring": {
    "mode": "hybrid",
    "pollingInterval": 5000,
    "slowThreshold": 5000,
    "verySlowThreshold": 30000
  },
  "storage": {
    "dataDir": "~/.claude/ai-insights",
    "retentionDays": 30,
    "autoArchive": true
  },
  "semantic": {
    "enabled": true,
    "moduleGrouping": true,
    "autoTitle": true
  }
}
```

### 8.2 环境变量

```bash
PERF_MONITOR_LINES=3
PERF_MONITOR_POLLING_INTERVAL=10000
```

---

## 9. 测试策略

### 9.1 测试金字塔

**单元测试：**
- Parser 解析逻辑
- Analyzer 指标计算
- SemanticEngine 语义识别
- Storage 数据存取

**集成测试：**
- MonitorService 端到端流程
- 模块协作测试

**端到端测试：**
- StatusLine 输出验证
- CLI 报告生成

### 9.2 测试覆盖率

- 核心模块：≥ 80%
- 整体：≥ 70%

### 9.3 Mock 数据

使用固定的 `history.jsonl` 样例进行测试。

---

## 10. 实施计划

### Phase 1: MVP 核心功能（1-2周）

- ✅ Parser：基础 history.jsonl 解析
- ✅ Analyzer：核心指标计算
- ✅ Storage：JSON 存储
- ✅ StatusLine：1-2 行显示
- ✅ `/perf:report` 命令
- ✅ 混合监控模式

**验收标准：**
- 能正确解析 history.jsonl
- StatusLine 实时显示
- 生成可读报告

### Phase 2: 语义化增强（1周）

- ✅ 操作语义标签
- ✅ 模块路径提取
- ✅ 会话主题简化版
- ✅ 慢操作分类

### Phase 3: 高级功能（1-2周）

- ✅ CLI 报告增强
- ✅ StatusLine 3 行显示
- ✅ 配置热重载
- ✅ 自然语言触发

### Phase 4: 未来扩展

- 🚧 AI 生成会话摘要
- 🚧 项目级统计
- 🚧 趋势分析
- 🚧 Web 仪表盘
- 🚧 SQLite 存储

---

## 附录

### A. 技术选型理由

**TypeScript vs Python vs Bash：**
- TypeScript：类型安全、生态丰富、类似 claude-hud
- 社区主流：90% 的 Claude Code 插件使用 TypeScript

**JSON vs SQLite：**
- JSON：MVP 简单、零依赖
- SQLite：预留接口、未来升级

**混合监控模式：**
- 实时性：fs.watch()
- 可靠性：轮询降级

### B. 参考项目

- [jarrodwatts/claude-hud](https://github.com/jarrodwatts/claude-hud) - StatusLine 实现
- [rz1989s/claude-code-statusline](https://github.com/rz1989s/claude-code-statusline) - 模块化设计
- [anthropics/claude-plugins-official](https://github.com/anthropics/claude-plugins-official) - 官方插件

### C. 相关资源

- [Claude Code 插件文档](https://code.claude.com/docs/en/plugins)
- [Claude Code 插件参考](https://code.claude.com/docs/en/plugins-reference)

---

**文档版本：** 0.1.0
**最后更新：** 2026-01-19
**作者：** Your Name
**许可证：** MIT
