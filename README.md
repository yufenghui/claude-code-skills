# Claude Code Plugins

> 个人 Claude Code 插件库

## 📦 包含的插件

_暂无已发布的插件。新插件将放在 `packages/` 下开发，各插件独立选择技术栈。_

---

## 🗂️ 项目结构

```
claude-plugins/              # 仓库根目录
├── README.md                # 仓库总览
├── CLAUDE.md                # Claude Code 工作指引
└── packages/                # 插件目录
    └── [your-plugin]/       # 在此创建新插件
```

每个插件都是独立的，按需选择自己的语言、构建工具和依赖管理方式。

## 🛠️ 开发工作流

### 创建新插件

1. 创建插件目录：`mkdir packages/your-plugin`
2. 创建插件清单 `.claude-plugin/plugin.json`：
   ```json
   {
     "name": "your-plugin",
     "version": "0.1.0",
     "description": "Your plugin description"
   }
   ```
3. 按需创建目录：`commands/`（CLI 命令）、`skills/`（AI 技能），以及源代码目录
4. 选择适合的技术栈与依赖管理方式（如需）

### 测试插件

```bash
# 使用 --plugin-dir 测试本地插件
claude --plugin-dir ./packages/your-plugin
```

## 📚 文档

- [Claude Code 插件官方文档](https://code.claude.com/docs/en/plugins)
- [插件参考](https://code.claude.com/docs/en/plugins-reference)

## 🤝 贡献

欢迎贡献！如果你有改进建议或发现了 bug，请：

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 开启 Pull Request

## 📄 许可证

除非插件单独声明，本仓库所有代码均采用 MIT 许可证。

## 🙏 致谢

感谢 Anthropic 团队开发了 Claude Code 这个强大的工具！
