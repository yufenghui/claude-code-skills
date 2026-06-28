# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 工作语言

**重要：本仓库所有开发工作使用中文进行。**

- 所有代码注释、文档、commit message、测试描述、与用户的交流均使用中文

## 仓库结构

`packages/` 下存放各个 Claude Code 插件；仓库根 `.claude-plugin/marketplace.json` 是 marketplace 清单，注册所有插件供远程安装。

```
claude-code-skills/
├── .claude-plugin/marketplace.json   # marketplace 清单
└── packages/
    └── business-modeling/            # 业务建模插件（参考实现）
        ├── .claude-plugin/plugin.json
        ├── skills/                   # SKILL.md（frontmatter: name, description）
        ├── reference/                # 方法论内核 + 产出规范 + live session（按需加载）
        ├── scripts/                  # live server 脚本（移植自 superpowers，MIT）
        ├── source/                   # 原始资料
        └── examples/                 # 历史样例（非必读）
```

## 插件开发流程

1. **创建插件**：`mkdir packages/your-plugin`
2. **必需清单** `packages/your-plugin/.claude-plugin/plugin.json`（**`author` 必须是对象**）：
   ```json
   {
     "name": "your-plugin",
     "description": "什么场景用、做什么（第三人称）",
     "author": { "name": "your-name" }
   }
   ```
   - 不写 `version` → 启用 commit-SHA 自动版本。
3. **内容**：`skills/<skill-name>/SKILL.md`（带 frontmatter）；`commands/` 按需。
4. **注册到 marketplace**：在仓库根 `.claude-plugin/marketplace.json` 的 `plugins` 数组加一项 `{ "name": "your-plugin", "source": "./packages/your-plugin" }`。
5. **本地测试**：`claude --plugin-dir ./packages/your-plugin`，改完 `/reload-plugins`。
6. **发布**：`git push`；用户 `claude plugin marketplace update claude-code-skills` + `claude plugin update your-plugin@claude-code-skills`。

## skill 编写约定（参考 business-modeling）

- SKILL.md 用祈使句、第三人称 description；正文 <500 行；概念 / 方法拆 `reference/` 共用，避免重复。
- 资料原文放 `source/`，提炼的判断标准 / 概念词典放 `reference/`，SKILL.md 引用而不复制。
- **建模类 skill 产出遵循 `reference/output-format.md`**：双轨——终端 ASCII（对话只给摘要，省 token）+ HTML 报告（完整方案，**手写 SVG 图，不用 Mermaid**）；必含表格 + 图 + 端到端走查 + 判别说明。
- **运行方式参照 superpowers brainstorming**（见 `reference/live-session.md`）：增量引导（一次一问、分段确认、阶段闸门）+ **live server 实时可视化**（HTML 报告随建模推进浏览器自动刷新；Windows 下 `run_in_background` 启动）。live server 脚本在 `scripts/`（移植自 superpowers，MIT）。
- **报告章节标号用 CSS counter 自动生成**（见 `templates/report.html`）：`<h2>` 直接写标题，**不手写 `<span class="num">`**；增删 section 编号自动重排。
- **方法论核心固定 / 产出结构可调**：skill 的建模方法论（步骤 / 概念 / 判别）是核心，固定遵循；报告章节序列是默认推荐，可按业务增删重排。

## 重要说明

- 每个插件独立版本控制和发布
- marketplace 发布机制：仓库根 `marketplace.json` + 各插件 `plugin.json`
- 仓库不预设技术栈，各插件按需选择
- skill 命名：插件内 `skills/<name>/`，调用时带插件前缀 `/<plugin>:<skill>`
- `examples/` 仅为历史样例，agent 不必预读（省 token）；要看完整产出效果用 live server 实时生成
