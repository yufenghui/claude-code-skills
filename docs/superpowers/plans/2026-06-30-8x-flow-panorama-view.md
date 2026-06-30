# 业务模型全景图 丰富化与防画坏 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把 `bm-8x-flow` 的「最终业务模型全视图」改名为「业务模型全景图」并升级为 8X Flow 骨架全景（治"太简"），同时给所有手写 SVG 加语法合法性纪律（治"画坏/内容变文字"）。

**Architecture:** 改 4 个 markdown 文件——`svg-layout.md`（加 SVG 合法性纪律，治 A 的根基，所有 skill 共用）、`html-report.md`（新增「全景图画法」节：必含元素 + 网格/纵向模板 + 变体判别，治 A+B 的画法单一来源）、`output-format.md`（报告结构层级改"骨架全景层"）、`SKILL.md`（全文改名 + §6 重写）。html-report.md 的「全景图画法」节作为画法权威，SKILL.md/output-format.md 引用它，避免三处重复维护。

**Tech Stack:** Markdown（skill 文档）、内联 SVG（手写，零依赖）。

**适配说明：** 本计划为文档改动，无单元测试。每个任务用「验证」步骤（grep 一致性 / 读改后文件 / 渲染检查 / 本地跑 skill）替代测试。提交步骤按项目约定——**仅在用户要求提交时执行**；当前在 `master` 默认分支，提交前需先建分支。

**对应 spec：** `docs/superpowers/specs/2026-06-30-8x-flow-panorama-view-design.md`

---

## File Structure

| 文件 | 责任 | 改动 |
| --- | --- | --- |
| `packages/business-modeling/reference/svg-layout.md` | SVG 布局 + **合法性纪律** | 新增「SVG 语法合法性纪律」节 + 「画图后自检」+ 自检清单补条目 |
| `packages/business-modeling/reference/html-report.md` | HTML 报告 + SVG 片段库 + **全景图画法** | §二改名；新增「业务模型全景图画法」节；§七检查清单加条目 |
| `packages/business-modeling/reference/output-format.md` | 产出规范（双轨/必含内容/结构层级） | 「报告结构层级」改"骨架全景层"；必含内容同步；改名 |
| `packages/business-modeling/skills/bm-8x-flow/SKILL.md` | 8X Flow skill 主体 | 全文改名；§6 重写；进度/工作流措辞同步 |

执行顺序：Task 1（svg-layout，纪律根基）→ Task 2（html-report，画法权威）→ Task 3（output-format）→ Task 4（SKILL.md）→ Task 5（全局验证）。Task 2 引用 Task 1 的纪律，Task 3/4 引用 Task 2 的画法节，故按序。

---

## Task 1: svg-layout.md — 新增 SVG 语法合法性纪律 + 画图后自检

**Files:**
- Modify: `packages/business-modeling/reference/svg-layout.md`

- [ ] **Step 1: 新增「SVG 语法合法性纪律」节**

在 `## 常见错误 → 对策` 表之后、`## 画图前自检清单` 之前，插入新节：

```markdown
## SVG 语法合法性纪律（防解析中断 / 内容变文字）

手写 SVG 一旦有语法错误，浏览器会从错误处中断解析——后续矩形不渲染（图"没画完"/留白），`<text>` 文字却流出 SVG 变成纯文本。这是"图画了一半"的最常见原因。五条铁律：

1. **`<text>` 内严禁嵌套 HTML 标签**（`span`/`div`/`br`/`b`/`i`/`em`/`strong`/`font` 等）。SVG `<text>` 不是 HTML，混入这些标签会中断解析。文字样式只用 SVG 属性（`font-size`/`font-weight`/`fill`）或 `<tspan>`；要换行就另起一个 `<text>`。
2. **特殊字符转义**：`&`→`&amp;`、`<`→`&lt;`、`>`→`&gt;`（如 `arrived_at > deadline` 须写成 `arrived_at &gt; deadline`）。
3. **所有坐标必须在 viewBox 内**：节点/连线坐标超出 viewBox 会被裁切（看不见）。内容多时**增大 viewBox 高度（或宽度）**，绝不靠缩字号到不可读或裁切来硬塞。
4. **标签闭合、属性引号成对**：每个 `<g>`/`<rect>`/`<path>`/`<text>` 都要闭合；属性值用双引号包住。每张 `<svg>` 顶部放 `<defs>`（阴影 + 箭头 marker）。
5. **SVG 内只放 SVG 元素**：富文本说明放在 SVG 外的 HTML 里，不要塞进 `<text>`。
```

- [ ] **Step 2: 「画图前自检清单」补一条合法性条目**

在 `## 画图前自检清单` 列表末尾追加：

```markdown
- [ ] SVG 语法合法（见上「SVG 语法合法性纪律」：`<text>` 无 HTML 标签、特殊字符转义、坐标在 viewBox 内）
```

- [ ] **Step 3: 新增「画图后自检」节**

在 `## 画图前自检清单` 之后，追加新节：

```markdown
## 画图后自检（渲染完整性）

- [ ] 图在浏览器**完整渲染**：所有矩形/节点/连线都显示，无"画了一半"
- [ ] **无文字流出 SVG**：没有任何 `<text>` 内容变成 SVG 外的纯文本
- [ ] grep 自检：SVG 代码内无 `<span`/`<div`/`<br`/`<b>`/`<i>` 等 HTML 标签
- [ ] 所有 `&`/`<`/`>` 均已转义（`&amp;`/`&lt;`/`&gt;`）
- [ ] 节点/连线坐标均在 viewBox 范围内
```

- [ ] **Step 4: 验证**

读改后的 `svg-layout.md`，确认：① 新「SVG 语法合法性纪律」节存在且 5 条齐全；② 「画图前自检清单」含新条目；③ 「画图后自检」节存在且 5 条齐全；④ 无占位符。

- [ ] **Step 5: 提交（仅当用户要求；在 master 则先建分支）**

```bash
git checkout -b feat/panorama-view-rich-and-safe
git add packages/business-modeling/reference/svg-layout.md
git commit -m "feat(business-modeling): svg-layout 加 SVG 语法合法性纪律 + 画图后自检"
```

---

## Task 2: html-report.md — 改名 + 新增「业务模型全景图画法」节 + §七检查清单

**Files:**
- Modify: `packages/business-modeling/reference/html-report.md`

- [ ] **Step 1: §二 报告结构里 §6 改名**

把 §二 代码块中的：
```
    <section class="card">      §6 最终业务模型全视图（SVG 摘要全景）
```
改为：
```
    <section class="card">      §6 业务模型全景图（SVG 骨架全景，画法见下「业务模型全景图画法」）
```

- [ ] **Step 2: 新增「业务模型全景图画法」节**

在 `## 六、各类图的画法要点` 之后、`## 七、检查清单` 之前，插入新节（注意：插入后 `## 七` 编号可保持不变，或实现时统一重排中文序号，不影响 CSS counter）：

````markdown
## 业务模型全景图画法（8X Flow 骨架全景）

业务模型全景图（第三段 §6）是整个系统的整合视图，按 **8X Flow 骨架**画全（不是摘要级简化）。必含元素、布局模板与变体如下。

### 必含元素（缺一不可）

| # | 元素 | 画法 |
| --- | --- | --- |
| 1 | 合同上下文 + 两方角色 | 每个上下文一张卡片/分区，标两个角色 |
| 2 | 履约请求(时段) → 履约确认(时点) | 每个主要履约项画请求→确认 + 权利方/义务方（8X Flow 灵魂，粉·时标型节点） |
| 3 | 凭证节点 | 请求=发起依据、确认=履约证明，节点露出（非仅一条线） |
| 4 | 标的物归领域上下文 | 标的物（绿·参与者型）置于领域区，经凭证引用参与业务 |
| 5 | 变化点 | 角色化履约确认（◆ 黄）+ 虚线连到扮演它的合同凭证（反转依赖） |
| 6 | 四类边界分区 | 合同上下文=卡片框（服务边界）；履约上下文=卡片内分区（弹性边界）；领域上下文=独立区（弹性边界）；渠道上下文=独立区或标注 |

**仍留给第二段详细层**（全景不画，保留分工）：凭证关键字段（金额/时点具体值）、凭证追溯链、违约分叉完整路径。

### 布局模板（按上下文数量选）

- **网格型（多合同上下文，≥2）**：顶部领域区（标的物）+ 合同上下文卡片网格（2–3 个：单行或 2×2；4+ 个：多行网格）+ 跨卡片变化点连线 + 底部图例。核心合同用粗边框、对手方结算用粗线。
- **纵向型（单合同上下文）**：单个合同上下文纵向展开（主要履约项纵向排列：请求→确认 一组组向下）+ 领域区（标的物）+ 变化点标注（若有）。

> **选择判别**：1 个上下文 → 纵向型；≥2 个上下文 → 网格型。

### 网格型骨架（可填充，复用 §四节点片段库）

布局（`viewBox="0 0 1280 H"`，H 按行数增大）：

- **领域区**：顶部横条（浅绿底 `#f0fdf4`），放标的物节点（绿·参与者型，§4.3 换色）。
- **合同上下文卡片**：圆角白卡 + 顶部标题条；核心合同 `stroke` 加粗（如 `#be185d` 2.5）。卡片内每组履约项 = 履约请求节点（粉，§4.2）→ 实线箭头 → 履约确认节点（粉），节点下标「权利方/义务方」。
- **变化点**：被角色化的履约确认节点加 `◆` + 黄边（`#f9a825`）；黄虚线（`stroke="#f9a825" stroke-dasharray="6 4"`）连到扮演它的合同凭证节点。
- **标的物引用**：交付/提供类确认 → 领域区标的物，绿虚线（`#2e7d32`）。
- **对手方结算**：卡片内或卡片间用粗线（`stroke-width="3"`，`#be185d`）。
- **图例**：底部一行，列节点色（粉=凭证/绿=标的物/黄◆=变化点）+ 线型（实=请求→确认/粗=对手方结算/黄虚=变化点扮演/绿虚=标的物引用）+ 四类边界说明。

> **参考实例**（合法、渲染正确）：四上下文 2×2 的外卖平台全景图。填充时替换业务内容，坐标按「内容多则增大 viewBox、节点不重叠、连线走通道」调整（布局原则见 `svg-layout.md`，合法性见其「SVG 语法合法性纪律」，渲染自检见其「画图后自检」）。
````

- [ ] **Step 3: §七 检查清单加全景图 + 合法性条目**

在 `## 七、检查清单` 列表中，追加：

```markdown
- [ ] 全景图含必含元素 6 项（履约请求/确认+权责方 + 凭证 + 标的物归领域 + 变化点 + 四类边界），不是摘要级简化
- [ ] 全景图按上下文数量选对布局（1→纵向、≥2→网格）
- [ ] SVG 语法合法、全景图完整渲染无文字流出（见 `svg-layout.md`「SVG 语法合法性纪律」「画图后自检」）
```

- [ ] **Step 4: 验证**

读改后的 `html-report.md`，确认：① §二 §6 已改名；② 「业务模型全景图画法」节存在，含必含元素表(6) + 两布局模板 + 选择判别 + 网格骨架；③ §七含新 3 条；④ 全文无「最终业务模型全视图」残留（grep）。

```bash
grep -n "最终业务模型全视图" packages/business-modeling/reference/html-report.md
# 期望：无输出
```

- [ ] **Step 5: 提交（仅当用户要求）**

```bash
git add packages/business-modeling/reference/html-report.md
git commit -m "feat(business-modeling): html-report 新增业务模型全景图画法（骨架全景+模板+变体）+ §6 改名"
```

---

## Task 3: output-format.md — 报告结构层级改"骨架全景层" + 必含内容同步 + 改名

**Files:**
- Modify: `packages/business-modeling/reference/output-format.md`

- [ ] **Step 1: 「报告结构层级」节改摘要全景层为骨架全景层**

定位 `## 报告结构层级：摘要全景 vs 详细局部` 下的「摘要全景层」条目（约第 57 行），把：

```markdown
- **摘要全景层**：系统的全局视图（合同上下文清单、最终业务模型全视图）——只露每个上下文的核心结构（参与方 / 核心履约项 / 跨上下文凭证串联），**不堆凭证字段、违约分叉等细节**。目的是一眼看全业务如何把领域系统转化为可盈利产品。
```

改为：

```markdown
- **骨架全景层**：系统的全局视图（合同上下文清单、业务模型全景图）——画出每个上下文的 **8X Flow 骨架**（履约请求→确认 + 权责方 + 凭证 + 标的物归领域 + 变化点 + 四类边界分区）。凭证关键字段、凭证追溯链、违约分叉等细节仍在「详细局部层」（第二段），全景不重复。目的是一眼看全业务如何把领域系统转化为可盈利产品。
```

并把该节标题 `## 报告结构层级：摘要全景 vs 详细局部` 改为 `## 报告结构层级：骨架全景 vs 详细局部`。

- [ ] **Step 2: 「必含内容」第 2 点业务模型图同步**

定位 `## 必含内容（两轨都要有）` 第 2 点（约第 47 行），把：

```markdown
2. **业务模型图**（至少一张全景图 + 关键关系图）：
```

改为：

```markdown
2. **业务模型图**（至少一张全景图 + 关键关系图）：全景图须含 8X Flow 骨架（履约请求→确认 + 凭证 + 标的物归领域 + 变化点 + 四类边界），画法见 `html-report.md`「业务模型全景图画法」。
```

- [ ] **Step 3: 全文改名 + 残留检查**

```bash
grep -n "最终业务模型全视图\|摘要全景层\|摘要全景" packages/business-modeling/reference/output-format.md
# 期望：无「最终业务模型全视图」、无「摘要全景层」残留；「摘要全景」若作为通用词可保留，但层级名须为「骨架全景层」
```

逐处把「最终业务模型全视图」替换为「业务模型全景图」。

- [ ] **Step 4: 验证**

读改后的 `output-format.md`，确认：① 「骨架全景层」定义含骨架元素清单；② 标题已改；③ 必含内容第 2 点已同步；④ 无旧名残留。

- [ ] **Step 5: 提交（仅当用户要求）**

```bash
git add packages/business-modeling/reference/output-format.md
git commit -m "refactor(business-modeling): output-format 报告结构层级改骨架全景层 + 全景图改名"
```

---

## Task 4: SKILL.md — 全文改名 + §6 重写 + 进度/工作流措辞同步

**Files:**
- Modify: `packages/business-modeling/skills/bm-8x-flow/SKILL.md`

- [ ] **Step 1: 全文改名**

```bash
grep -n "最终业务模型全视图" packages/business-modeling/skills/bm-8x-flow/SKILL.md
# 记录所有出现行，逐一替换为「业务模型全景图」
```

逐一替换（出现处至少：第 17、70、137 行附近，以 grep 实际为准）。

- [ ] **Step 2: 第 17 行（运行方式段）措辞同步**

把：
```
**第三段·总**＝全局整合（变化点 + 弹性边界 + 最终业务模型全视图 + 走查）
```
改为：
```
**第三段·总**＝全局整合（变化点 + 弹性边界 + 业务模型全景图 + 走查）
```

- [ ] **Step 3: 进度清单（约第 70 行）同步**

把：
```
- [ ] 6. 整合所有上下文 + 凭证跨上下文串联 + 领域上下文 → §6 最终业务模型全视图
```
改为：
```
- [ ] 6. 整合所有上下文 + 凭证跨上下文串联 + 领域上下文 → §6 业务模型全景图（8X Flow 骨架全景，按上下文数量选纵向/网格布局）
```

- [ ] **Step 4: §6 重写（约第 137 行，核心）**

把：
```
6. **最终业务模型全视图**：摘要全景——多合同上下文框 + **每个上下文只露核心履约项** + 凭证跨上下文串联线 + 领域上下文（标的物归领域，经凭证引用参与业务）；**不堆凭证字段 / 违约分叉**（那些在第二段）。呈现业务如何将领域上下文转化为可盈利产品。落实 `../../reference/output-format.md`「业务模型图（全景图）」。
```
改为：
```
6. **业务模型全景图**：**8X Flow 骨架全景**——每个合同上下文画出**履约请求(时段)→履约确认(时点) + 权利方/义务方**、**凭证节点**（请求=发起依据、确认=履约证明）、**标的物归领域上下文**（经凭证引用参与业务）、**变化点**（角色化履约确认 ◆ + 由哪些合同凭证扮演）、**四类边界分区**（合同上下文=服务边界；履约/领域/渠道上下文=弹性边界）。凭证关键字段 / 凭证追溯链 / 违约分叉仍在第二段详细层（全景不重复）。**按上下文数量选布局**：单上下文→纵向型、≥2→网格型。画法（必含元素 + 模板 + 变体）见 `../../reference/html-report.md`「业务模型全景图画法」；SVG 合法性纪律见 `../../reference/svg-layout.md`「SVG 语法合法性纪律」。落实 `../../reference/output-format.md`「骨架全景层」。
```

- [ ] **Step 5: "摘要全景层"措辞同步（约第 118 行）**

把：
```
报告按「**总-分-总**」三段式组织（章节标号 CSS counter 自动；摘要全景层 vs 详细局部层见 `../../reference/output-format.md`「报告结构层级」）：
```
改为：
```
报告按「**总-分-总**」三段式组织（章节标号 CSS counter 自动；骨架全景层 vs 详细局部层见 `../../reference/output-format.md`「报告结构层级」）：
```

- [ ] **Step 6: 单上下文说明补布局选择**

定位「单合同上下文系统也走三段式」说明（约第 156 行），在末尾补：
```
；其全景图用纵向型布局（见 `../../reference/html-report.md`「业务模型全景图画法」）。
```

- [ ] **Step 7: 验证**

```bash
grep -n "最终业务模型全视图\|摘要全景层\|摘要全景——\|只露核心履约项" packages/business-modeling/skills/bm-8x-flow/SKILL.md
# 期望：无输出（旧名/旧措辞全部清除）
grep -n "业务模型全景图" packages/business-modeling/skills/bm-8x-flow/SKILL.md
# 期望：多处一致出现
```

读改后的 §6，确认含骨架全景 + 必含元素 + 布局选择 + 两处 reference 指向。

- [ ] **Step 8: 提交（仅当用户要求）**

```bash
git add packages/business-modeling/skills/bm-8x-flow/SKILL.md
git commit -m "feat(business-modeling): bm-8x-flow §6 升级为业务模型全景图（骨架全景）+ 全文改名"
```

---

## Task 5: 全局验证

**Files:** 无（只读 + 跑命令）

- [ ] **Step 1: 改名全局一致性**

```bash
grep -rn "最终业务模型全视图" packages/business-modeling/
# 期望：无输出
grep -rn "摘要全景层" packages/business-modeling/
# 期望：无输出（已改骨架全景层）
grep -rn "业务模型全景图" packages/business-modeling/
# 期望：SKILL.md / output-format.md / html-report.md 一致出现
```

- [ ] **Step 2: 纪律与画法节落地确认**

```bash
grep -n "SVG 语法合法性纪律\|画图后自检" packages/business-modeling/reference/svg-layout.md
grep -n "业务模型全景图画法" packages/business-modeling/reference/html-report.md
# 期望：均命中
```

- [ ] **Step 3: 模板 SVG 渲染自检（治 A 回归）**

把 `html-report.md`「网格型骨架」按外卖平台示例填充出一张全景图，浏览器打开确认：完整渲染、四张卡片 + 图例齐全、无文字流出、无 `<span>` 等 HTML 标签混入 `<text>`。（可复用本次 brainstorm 已验证的 `.superpowers/brainstorm/.../panorama-rich-v2.html` 作对照基准。）

- [ ] **Step 4: 本地跑 skill（治 B 回归）**

由用户执行（交互式登录/插件加载）：
```
claude --plugin-dir ./packages/business-modeling
# 然后 /reload-plugins，跑一遍 bm-8x-flow，检查产出的业务模型全景图含必含元素 6 项、SVG 完整渲染
```

- [ ] **Step 5: 终态提交（仅当用户要求）**

全部任务完成后，若用户要求提交，汇总提交或在功能分支上合并。

---

## Self-Review

**1. Spec 覆盖**：
- §3.1 改名 → Task 1–4 各含改名 + Task 5 Step 1 全局验证 ✓
- §3.2 必含元素清单 → Task 2（画法节权威）+ Task 3（结构层级）+ Task 4（§6）✓
- §3.3 SVG 纪律 → Task 1（svg-layout）+ Task 2 §七 + Task 4 §6 指向 ✓
- §3.4 模板+变体 → Task 2 画法节（网格/纵向 + 判别）+ Task 4 §6/单上下文说明 ✓
- §四文件清单 → Task 1–4 一一对应 ✓
- §六验证 → Task 5 ✓
- 无遗漏。

**2. 占位符扫描**：无 TBD/TODO；每个改动步骤含完整 markdown 文本或精确 grep/替换对 ✓

**3. 一致性**：
- 「业务模型全景图」「骨架全景层」「SVG 语法合法性纪律」「画图后自检」「业务模型全景图画法」五个新词在各 Task 间用字一致 ✓
- §6 引用的两个 reference 节名（「业务模型全景图画法」「SVG 语法合法性纪律」「骨架全景层」）与 Task 1/2/3 实际创建的节名一致 ✓
- 必含元素 6 项在 Task 2 表、Task 4 §6、Task 3 骨架全景层描述中一致 ✓

无问题，计划可执行。
