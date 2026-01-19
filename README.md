# Claude Code Plugins

> 个人 Claude Code 插件库 - 未来发布到 Claude Code Marketplace

## 📦 包含的插件

### [ai-insights](./packages/ai-insights/) - 性能监控插件

**Claude Code 性能监控插件** - 提供操作耗时分析、失败率统计、效率评分和语义化洞察。

**核心特性：**
- ✅ 非侵入式监控
- ✅ 语义化洞察
- ✅ 实时状态栏
- ✅ 详细报告
- ✅ 模块化架构

**技术栈：** TypeScript + Node.js

**状态：** 🚧 设计阶段

---

## 🗂️ 项目结构

```
claude-plugins/              # 个人插件仓库根目录
├── README.md                # 仓库总览
├── package.json             # 根 package.json（monorepo 管理）
├── packages/                # 插件目录
│   ├── ai-insights/         # 性能监控插件
│   │   ├── src/
│   │   ├── commands/
│   │   ├── skills/
│   │   └── package.json
│   │
│   └── [future-plugins]/    # 未来其他插件
│
├── docs/                    # 全局文档
│   └── plans/
│       └── 2026-01-19-ai-insights-design.md
│
├── scripts/                 # 构建脚本
│   ├── build-all.sh
│   └── test-all.sh
│
└── shared/                  # 共享工具/库（可选）
    └── utils/
```

## 🚀 快速开始

### 安装依赖

```bash
# 安装所有插件依赖
npm install

# 或安装单个插件
cd packages/ai-insights
npm install
```

### 构建所有插件

```bash
npm run build
```

### 运行测试

```bash
npm test
```

## 🛠️ 开发工作流

### 创建新插件

```bash
# 1. 创建插件目录
mkdir packages/your-plugin
cd packages/your-plugin

# 2. 初始化
npm init

# 3. 创建必需文件
mkdir -p .claude-plugin src commands skills

# 4. 编写插件清单
cat > .claude-plugin/plugin.json << EOF
{
  "name": "your-plugin",
  "version": "0.1.0",
  "description": "Your plugin description"
}
EOF
```

### 测试插件

```bash
# 使用 --plugin-dir 测试本地插件
claude --plugin-dir ./packages/your-plugin
```

### 发布到 Marketplace

```bash
# 1. 更新版本号
npm version patch

# 2. 构建
npm run build

# 3. 提交到 Git
git add .
git commit -m "chore: release v0.1.0"
git tag v0.1.0

# 4. 推送到远程
git push origin main --tags

# 5. 注册到 marketplace（待官方支持）
```

## 📚 文档

- [设计文档](./docs/plans/) - 各插件的设计方案
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

---

**最后更新：** 2026-01-19
