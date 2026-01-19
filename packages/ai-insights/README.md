# AI Insights

> Claude Code 性能监控插件 - 提供操作耗时分析、失败率统计、效率评分和语义化洞察

## 🌟 特性

- ✅ **非侵入式监控**：读取 `~/.claude/history.jsonl`，无需修改 Claude Code
- ✅ **语义化洞察**：不仅知道"工具调用"，更理解"做了什么"
- ✅ **实时状态栏**：可配置 1-3 行动态显示关键指标
- ✅ **详细报告**：`/perf:report` 命令生成深度分析报告
- ✅ **模块化架构**：TypeScript 实现，易扩展

## 📦 安装

```bash
# 从 marketplace 安装（未来）
/plugin install ai-insights@your-marketplace

# 本地开发
cd packages/ai-insights
npm install
npm run build
```

## ⚙️ 配置

编辑 `~/.claude/ai-insights/config.json`：

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
    }
  },
  "monitoring": {
    "mode": "hybrid",
    "pollingInterval": 5000
  }
}
```

## 🚀 使用

### StatusLine 集成

在 `~/.claude/settings.json` 中添加：

```json
{
  "statusLine": {
    "type": "command",
    "command": "node /path/to/packages/ai-insights/dist/index.js --mode=statusline",
    "padding": 0
  }
}
```

### 命令

```bash
# 生成性能报告
/perf:report

# 或自然语言触发
"显示性能报告"
"分析最近操作"
```

## 📊 监控指标

### 五大维度

1. **操作耗时分析** - TOP5 耗时操作、慢操作阈值告警
2. **失败率统计** - 按工具类型分组、失败原因聚合
3. **效率评分** - 基于成功率、速度、稳定性的综合评分 (0-100)
4. **AI 思考时间** - 通过相邻工具调用间隔推断推理时长
5. **会话级别统计** - 总操作数、失败率、效率得分趋势

### 语义化标签

- **操作分类**：config/bugfix/feature/refactor/test
- **模块分组**：自动提取 `src/api/`, `frontend/components/` 等路径
- **会话主题**：AI 生成如"实现用户认证功能"

## 🛠️ 开发

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 运行测试
npm test

# 构建
npm run build
```

## 📁 项目结构

```
ai-insights/
├── .claude-plugin/
│   └── plugin.json
├── src/
│   ├── parser/         # history.jsonl 解析
│   ├── analyzer/       # 指标计算
│   ├── semantic/       # 语义化引擎
│   ├── storage/        # 数据存储
│   ├── renderer/       # StatusLine + CLI 报告
│   └── index.ts
├── commands/           # CLI 命令
├── skills/             # AI 技能
├── dist/               # 编译输出
├── package.json
└── tsconfig.json
```

## 🔮 未来扩展

- [ ] AI 生成会话摘要（调用 LLM API）
- [ ] 项目级统计（跨会话聚合）
- [ ] 趋势分析（效率变化曲线）
- [ ] Web 仪表盘
- [ ] SQLite 存储支持

## 📄 许可证

MIT

## 🙏 致谢

灵感来源于：
- [claude-hud](https://github.com/jarrodwatts/claude-hud)
- [claude-code-statusline](https://github.com/rz1989s/claude-code-statusline)
