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

## 3. 增量引导模式（参照 brainstorming，省 token）

1. **一次一问**：每条消息只问一个关键问题，多选优先。
2. **按章节序列推进**（见 §4），每章 = 一个阶段。
3. **详细内容只写 HTML**：每阶段把该章 `<section>`（完整图、表、判别）追加进 report.html，浏览器实时显示。
4. **终端只输出最简摘要**（省 token）：每阶段在终端给一两句——做了什么 + 关键判别 / 决策点 + 要用户确认的问题。**不在终端重画 ASCII 图、不重列完整表**（那些只在 HTML）。例如："✓ 第 4 章业务脊梁已加入报告：5 个凭证 Order→Payment→Settlement，餐品归参与者型。浏览器查看完整图，确认后继续？"
5. **更新 report.html**：把该章 `<section class="card">` 追加到 report.html 的 `<main class="content">` 末尾，整体覆写到 `<screen_dir>/report.html` → server 的 `fs.watch` 检测到变化 → 浏览器自动刷新。
6. **阶段闸门**：每章更新后问"这部分对吗？继续下一章？"——得到确认再推进。
7. **YAGNI**：砍掉非核心假设。
8. **收尾**：把最终 `report.html` 落到用户工作目录并 commit。终端 `.md`（ASCII 图）仅在**无 server**或用户明确要求时才产出（兜底，画法见 `./terminal-diagrams.md`）。

## 4. 章节序列（默认推荐，可按业务/用户调整）

> 这是默认骨架，**不是强制**——建模方法论（步骤 / 概念 / 判别）是 skill 核心，固定遵循；产出结构（章节）可按业务与用户头脑风暴增删、重排。标号由 CSS counter 自动重排，无需手动维护。

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
11. 业务组件设计（8X Flow 可选延伸）

> 两个 skill 的章节序列：
> - **`bm-four-color`**：用上方 1–11 通用骨架（凭证链为主，7 步对应 3–7 章）。
> - **`bm-8x-flow`**：用「**总-分-总**」三段式（替换通用骨架）：
>   - **第一段·总**：§1 业务定位与经营形态（含生命周期四阶段）、§2 合同上下文清单（含无合同闸门）；
>   - **第二段·分**：§3.N 每个合同上下文一组卡片（合同图 + 主要履约项表 + 凭证追溯图 + 违约流转图）——**多上下文时增量追加多组**；
>   - **第三段·总**：§4 变化点（两类）、§5 弹性边界（三类）、§6 业务模型全景图（骨架全景）、§7 端到端走查；可选延伸 §8 业务组件设计、§9 中台化。
>
>   具体见 `bm-8x-flow` SKILL.md；产出遵循 `output-format.md`「穷尽纪律（MECE）」与「报告结构层级」。

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
