# Live Session：增量引导 + 实时可视化

业务建模 skill 的运行方式 = 参照 superpowers brainstorming 的**增量引导**（一次一问、分段确认）+ **live server 实时可视化**（HTML 报告随建模推进动态更新，浏览器边设计边显示）。

`bm-four-color` 与 `bm-8x-flow` 都按本文件运行；各自的建模步骤（四色 7 步 / 8X 五步）映射到下文「章节序列」。

> live server 脚本在插件根的 `scripts/`（与本 reference 同级，即 `../scripts/`；从 skill 目录算是 `../../scripts/`）。插件根 = 含 `.claude-plugin/plugin.json` 的 `packages/business-modeling/`。下文命令里的 `scripts/...` 均相对插件根。

## 1. 何时启动 live server（just-in-time）

**不要默认启动**。等到"show 比 tell 更清楚"的时刻（要展示凭证链图、合同关系图、违约流转图等），再**单独发一条消息**提议：

> "这部分用图看可能更清楚，要不要我开一个实时预览？我会在浏览器里把模型一步步画出来。"

用户同意后，才启动 server。这是 superpowers brainstorming 的 just-in-time 原则。

## 2. 启动 server

```bash
# Windows（Git Bash）：必须 run_in_background，否则 shell 会阻塞挂死
scripts/start-server.sh --project-dir <仓库或工作目录> --open --idle-timeout-minutes 120
```

- `--project-dir <dir>`：会话目录落在 `<dir>/.superpowers/brainstorm/<id>/`（持久化，事后可查报告）。
- `--open`：首个画面就绪后自动开浏览器。
- `--idle-timeout-minutes 120`：空闲 2 小时自动关（**Windows 下是唯一自动关闭途径**，因 owner-PID 看门狗在 MSYS2 不可用）。
- Linux/macOS 可直接前台调用拿 stdout JSON。

**读启动结果**：从返回的 JSON（或 `<session_dir>/state/server.log` grep `server-started`）取三项，记住备用：
- `url`（含 `?key=`，**把这个完整 URL 给用户**作兜底入口）
- `screen_dir`（= `<session_dir>/content`，**agent 把 report.html 写到这里**）
- `state_dir`（运行时元数据：`server-info`/`events`/`server-stopped` 等）

## 3. 增量引导模式（参照 brainstorming）

1. **一次一问**：每条消息只问一个关键问题，多选优先。
2. **按章节序列推进**（见 §4），每章 = 一个阶段。
3. **每阶段双轨产出**：终端轨 ASCII（对话里直接给，画法见 `./terminal-diagrams.md`）+ 报告轨 HTML/SVG section（写进 report.html，画法见 `./html-report.md`）。
4. **更新 report.html**：把该章 `<section class="card">` 追加到 report.html 的 `<main class="content">` 末尾，整体覆写到 `<screen_dir>/report.html` → server 的 `fs.watch` 检测到变化 → 浏览器自动刷新。
5. **阶段闸门**：每章更新后问"这部分对吗？继续下一章？"——得到确认再推进。
6. **YAGNI**：砍掉非核心假设。
7. **收尾**：把最终 `report.html`（报告轨）+ `方案.md`（终端轨）落到用户工作目录，并 commit。

## 4. 章节序列（报告骨架，按此顺序逐章增量产出）

1. 场景假设（参与方、标的物、关键假设）
2. 端到端时序
3. 入口识别（现金往来 / KPI）
4. **业务脊梁**（凭证链图 + 凭证表）★ 核心
5. 异常 / 逆向凭证
6. KPI 凭证链（若有 KPI 入口）
7. 四原型分类（四色）/ 合同·履约·变化点（8X Flow）
8. 关键判别应用
9. 端到端走查（正常 + 异常）
10. 结论 + 待确认假设

> 两个 skill 的步骤映射：`bm-four-color` 的 7 步对应 3–7 章（凭证链为主）；`bm-8x-flow` 的五步法把第 4 章换成"合同上下文图 + 主要履约项表"、第 5 章换成"违约流转图"、并加"弹性边界/服务图"与"变化点清单"。具体见各自 SKILL.md。

## 5. report.html 画布维护

- **首次**：把 `./templates/report.html` 复制到 `<screen_dir>/report.html`，填好 hero（标题 / 方法 / 场景），`<main class="content">` 先留一个"正在建模…"占位 section。
- **每章**：构造 `<section class="card" id="sN">...</section>`，追加到 `<main class="content">` 末尾（紧贴上一个 `</section>` 之后）；同步在 `<nav class="toc">` 的 `<ol>` 加 `<li><a href="#sN">章名</a></li>`。
- **SVG 图**：放 `<div class="figure"><svg viewBox="0 0 1040 540">...</svg></div>`，按 `./html-report.md` 的网格法画；多张 SVG 的 `<defs>` id 要唯一（加序号，如 `#sh2`、`#arrB`）。
- **复用既有 CSS class**（`.card`/`.badge`/`.figure`/`.table-wrap` 等）即获样式，**新 section 不要带 `<style>`**。
- **不要手动加 helper.js**——server 在 `GET /` 时自动注入到 `</body>` 前，浏览器收到 `{type:'reload'}` 即 `location.reload()`。
- 每次整体覆写 `<screen_dir>/report.html`（完整文档）。

## 6. 停止 server

收尾（commit 后）：

```bash
scripts/stop-server.sh <session_dir>
```

返回 `{"status":"stopped"}`。`--project-dir` 模式下会话目录保留（报告可复查）。

## 7. 异常处理

- **server 挂了**：用相同 `--project-dir` 重启 → 复用端口 → 浏览器 tab 自动重连（期间显示 paused 遮罩）。
- **浏览器没刷新**：确认 report.html 写到了 `screen_dir`（不是别处）；确认 server 还活着（`state/server-stopped` 不存在）。
- **端口/token 丢失**：读 `<session_dir>/state/server-info`（含 url+key，权限 600）。

## 参照

- live server 机制移植自 superpowers 6.0.3 的 brainstorming skill（Visual Companion），MIT，见 `../scripts/NOTICE.md`。
- 增量引导原则（一次一问、分段确认、YAGNI、阶段闸门）参照 superpowers brainstorming。
