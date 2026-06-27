# Claude Code Plugins

> 个人 Claude Code 插件库，通过 GitHub marketplace 安装与更新。

## 📦 包含的插件

### business-modeling（业务建模助手）

基于极客时间《如何落地业务建模》课程（徐昊）构建的业务建模 skill 体系。

- **skills**：
  - `bm-four-color`：四色建模法——从收入流 / 成本结构推演凭证链（业务脊梁），产出四原型领域模型。
  - `bm-8x-flow`：8X Flow——以合同履约建模业务系统，五步法识别变化点与弹性边界。
- **reference/**：方法论内核（概念词典 + 方法地图 + 产出规范），两个 skill 共用。
- **source/**：26 篇课程原文（保真提取）。
- **examples/**：外卖平台建模实测方案（产出规范的首个实例，含 Mermaid 业务模型图）。

skill 产出默认含 **Mermaid 业务模型图 + 表格 + 端到端走查**，可视化、可核查。

详见 [packages/business-modeling/](./packages/business-modeling/)。

## 📥 安装

```bash
claude plugin marketplace add https://github.com/yufenghui/claude-code-skills
claude plugin install business-modeling@claude-code-skills
claude plugin list
```

调用：`/business-modeling:bm-four-color`、`/business-modeling:bm-8x-flow`，或直接描述业务建模需求自动触发。

## 🔄 更新

仓库推送新代码后，各机器执行：

```bash
claude plugin marketplace update claude-code-skills
claude plugin update business-modeling@claude-code-skills
```

## 🗂️ 项目结构

```
claude-code-skills/
├── .claude-plugin/marketplace.json   # marketplace 清单（注册所有插件）
├── README.md
├── CLAUDE.md
└── packages/
    └── business-modeling/            # 业务建模插件
        ├── .claude-plugin/plugin.json
        ├── skills/                   # bm-four-color, bm-8x-flow
        ├── reference/                # concepts / methods / output-format
        ├── source/                   # 课程原文
        └── examples/                 # 产出样例
```

## 🛠️ 开发新插件

1. 创建目录：`mkdir packages/your-plugin`
2. 建清单 `packages/your-plugin/.claude-plugin/plugin.json`（**`author` 必须是对象**）：
   ```json
   {
     "name": "your-plugin",
     "description": "插件描述",
     "author": { "name": "your-name" }
   }
   ```
3. 在 `skills/`（或 `commands/`）下放内容
4. 在仓库根 `.claude-plugin/marketplace.json` 的 `plugins` 数组里注册：
   ```json
   { "name": "your-plugin", "source": "./packages/your-plugin" }
   ```
5. 本地测试：`claude --plugin-dir ./packages/your-plugin`
6. 发布：`git push`，用户 `claude plugin marketplace update` + `claude plugin update`

> 版本策略：`plugin.json` 不写 `version` → 走 commit-SHA 自动版本，每次 push 自动成新版本。

## 📚 文档

- [Claude Code 插件官方文档](https://code.claude.com/docs/en/plugins)
- [插件参考](https://code.claude.com/docs/en/plugins-reference)
- [Marketplace](https://code.claude.com/docs/en/plugin-marketplaces)

## 📄 许可证

MIT
