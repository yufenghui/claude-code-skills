# NOTICE

## 来源

本目录的 live server 脚本复制自 **superpowers** 项目：

- 仓库：https://github.com/obra/superpowers
- 版本：6.0.3
- 原始路径：`skills/brainstorming/scripts/`（Visual Companion / brainstorming skill）

## 涉及文件

- `server.cjs` — Node 零依赖 HTTP + WebSocket live server
- `helper.js` — 浏览器端客户端（WebSocket 重连 + 收 reload 自动刷新）
- `start-server.sh` — 启动脚本（会话目录、端口、token、平台适配）
- `stop-server.sh` — 停止脚本（PID 校验 + 清理）

## 许可

MIT License

## 说明

按 MIT 许可使用，感谢原作者 **Jesse Vincent (@obra)**。

这些脚本本身是通用的 HTML live server：在一个目录下 serve HTML、watch 文件变化、
通过 WebSocket 通知浏览器自动刷新。business-modeling 插件用它来实时预览生成的
业务建模报告（`report.html`）。

> 注：原 superpowers 项目中还包含 `frame-template.html`（用于为"内容片段"包壳），
> 本插件未复制——我们始终推送完整的 HTML 文档，server 对完整文档不会包壳，
> 因此不需要 frame 模板。相应地，`server.cjs` 中读取该模板的代码已改为懒加载，
> 缺失模板也不影响 server 启动或完整文档的渲染。

脚本中保留的 `.superpowers/brainstorm` 目录名、`brainstorm` 字样等属于原作者的
硬编码命名，不影响功能（仅决定会话文件的落盘位置）；为降低移植风险予以保留，
三者（start / stop / server）使用的目录名保持一致。
