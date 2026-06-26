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

`packages/` 下存放各个 Claude Code 插件。每个插件都是独立的，自行决定技术栈、构建方式和依赖管理。

```
packages/
└── [your-plugin]/         # 在此创建新插件
```

## 插件开发流程

1. **创建新插件**：`mkdir packages/your-plugin`
2. **必需结构**：
   ```
   .claude-plugin/plugin.json  # 插件清单
   commands/                   # CLI 命令（.md 文件）
   skills/                     # AI 技能（.md 文件）
   ```
   源代码目录（如 `src/`）按各插件的技术栈自行组织。
3. **本地测试**：使用 Claude Code 的 `--plugin-dir` 参数
   ```bash
   claude --plugin-dir ./packages/your-plugin
   ```

## 重要说明

- 每个插件独立版本控制和发布
- 插件元数据定义在 `.claude-plugin/plugin.json` 中
- 仓库不预设技术栈，各插件按需选择自己的语言与依赖管理方式
