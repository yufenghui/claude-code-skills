# HTML 报告 + 手写 SVG 指南

报告轨产出一份**精美 HTML 文件**交付业务方，图用**手写 SVG**（PPT 级、离线矢量、零 JS 依赖），**不用 Mermaid**。本指南给：报告结构、四原型配色、可复用 SVG 片段库、坐标规划方法。

> 直接套骨架：[`./templates/report.html`](./templates/report.html)（含 CSS、四色徽章、章节占位）。本指南聚焦"怎么画图"。

## 一、为什么手写 SVG

- **可控**：坐标、配色、字号完全自己定，Mermaid 的自动布局做不到。
- **美观**：彩色色帽 + 阴影卡片 + 贝塞尔连线，达到 PPT 模型图质感。
- **离线 / 矢量**：单文件、无外部依赖（无需 CDN）、任意缩放不糊。
- **语义对应终端轨**：实线 / 虚线 / 粗线 与 ASCII 图（见 [`./terminal-diagrams.md`](./terminal-diagrams.md)）一一对应。

## 二、报告结构（套 templates/report.html）

```
<header class="hero">     标题 + 方法 + 场景 + 四色图例
<nav class="toc">          侧栏目录（锚点）
<main>
  <section class="card">   场景假设（表格）
  <section class="card">   端到端时序（SVG 时序图 或 有序列表）
  <section class="card">   入口识别（表格）
  <section class="card">   业务脊梁（SVG 凭证链 + 凭证表）
  <section class="card">   异常 / 逆向（SVG 或 表格）
  <section class="card">   KPI 链（SVG）
  <section class="card">   四原型分布（表格 + 颜色徽章）
  <section class="card">   关键判别（编号列表）
  <section class="card">   端到端走查（正常 + 异常）
  <section class="card">   自洽性结论
  <section class="card">   待确认假设
<footer>
```

**章节标号自动**：由 CSS counter 生成（与左侧目录一致），`<h2>` 直接写标题，**不要手写 `<span class="num">N</span>`**——增删 section 后编号自动重排，不会与目录错位。

每张图放在 `<div class="figure"><svg ...>...</svg></div>` 里。

## 三、四原型配色（贯穿全篇的视觉锚点）

| 原型 | 色帽 / 强调 | 标题深色 | 浅边框 | 徽章 class |
| --- | --- | --- | --- | --- |
| 时标型 Moment-Interval | `#ec4899` | `#be185d` | `#fbcfe8` | `b-moment` |
| 描述型 Description | `#3b82f6` | `#1d4ed8` | `#dbeafe` | `b-desc` |
| 角色型 Role | `#f9a825` | `#b45309` | `#fde68a` | `b-role` |
| 参与者型 Party-Place-Thing | `#2e7d32` | `#1b5e20` | `#bbf7d0` | `b-ppt` |

正文通用色：卡片白底 `#fff`、副文字 `#64748b`、淡文字 `#94a3b8`、连线 `#94a3b8`（实）/ `#7aa3d6`（虚）。

## 四、SVG 片段库（可直接复制）

### 4.1 defs：阴影 + 两种箭头

每张 `<svg>` 顶部放一次：

```xml
<defs>
  <filter id="sh" x="-20%" y="-20%" width="140%" height="140%">
    <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#1e293b" flood-opacity="0.10"/>
  </filter>
  <marker id="arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
    <path d="M0,1 L9,5 L0,9 Z" fill="#94a3b8"/>
  </marker>
  <marker id="arrB" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
    <path d="M0,1 L9,5 L0,9 Z" fill="#7aa3d6"/>
  </marker>
</defs>
```

- `#sh` 阴影；`#arr` 实线箭头（灰）；`#arrB` 虚线箭头（蓝灰，规则来源）。

### 4.2 时标型节点（粉，主链凭证）

参数：左上角 `(x,y)`，宽 `168`，高 `70`，圆角 `12`，色帽高 `8`，中心 `cx = x+84`。

```xml
<g>
  <rect x="{x}" y="{y}" width="168" height="70" rx="12" fill="#fff" stroke="#fbcfe8" filter="url(#sh)"/>
  <path d="M{x},{y+8} L{x+168},{y+8} L{x+168},{y+12} Q{x+168},{y} {x+156},{y} L{x+12},{y} Q{x},{y} {x},{y+12} Z" fill="#ec4899"/>
  <text x="{cx}" y="{y+28}" text-anchor="middle" font-size="13.5" font-weight="700" fill="#be185d">{中文名}</text>
  <text x="{cx}" y="{y+47}" text-anchor="middle" font-size="10" fill="#64748b">{英文标识}</text>
  <text x="{cx}" y="{y+61}" text-anchor="middle" font-size="9.5" fill="#94a3b8">{关键数据项}</text>
</g>
```

> 色帽 `path` 画的是「顶部 8px、带上圆角(r=12)」的色块，与卡片圆角完美贴合。

### 4.3 描述型节点（蓝，规则 / 目录）

参数：左上角 `(x,y)`，宽 `140`，高 `54`，圆角 `10`，色帽高 `7`，中心 `cx = x+70`。

```xml
<g>
  <rect x="{x}" y="{y}" width="140" height="54" rx="10" fill="#fff" stroke="#dbeafe" filter="url(#sh)"/>
  <path d="M{x},{y+7} L{x+140},{y+7} L{x+140},{y+10} Q{x+140},{y} {x+130},{y} L{x+10},{y} Q{x},{y} {x},{y+10} Z" fill="#3b82f6"/>
  <text x="{cx}" y="{y+26}" text-anchor="middle" font-size="13" font-weight="700" fill="#1d4ed8">{中文名}</text>
  <text x="{cx}" y="{y+43}" text-anchor="middle" font-size="10" fill="#64748b">{字段}</text>
</g>
```

> 角色型（黄）/ 参与者型（绿）节点同理，换色帽 `fill` 与标题 `fill` 即可（见配色表）。参与者型节点常用于"标的物"。

### 4.4 连线

```xml
<!-- 实线：数值 / 时标来源（横向） -->
<path d="M{x1},{y} L{x2},{y}" fill="none" stroke="#94a3b8" stroke-width="2.2" marker-end="url(#arr)"/>

<!-- 虚线：规则来源（加 dasharray，换 arrB） -->
<path d="M{x1},{y1} C{x1},{y2} {x2},{y1} {x2},{y2}" fill="none" stroke="#7aa3d6" stroke-width="1.8" stroke-dasharray="5 4" marker-end="url(#arrB)"/>

<!-- 粗线：核心对手方结算（合同图） -->
<path d="..." fill="none" stroke="#be185d" stroke-width="3" marker-end="url(#arr)"/>
```

- 横向直连用 `L`；斜向 / 转折用三次贝塞尔 `C`（控制点取中段，曲线柔和）。
- 箭头方向由 path 起止决定，`orient="auto"` 自动对齐。

### 4.5 图例（每张图底部或报告 hero）

```xml
<g transform="translate(30,500)">
  <rect x="0" y="0" width="14" height="14" rx="3" fill="#ec4899"/><text x="20" y="11" font-size="11.5" fill="#475569">时标型（凭证）</text>
  <rect x="150" y="0" width="14" height="14" rx="3" fill="#3b82f6"/><text x="170" y="11" font-size="11.5" fill="#475569">描述型（规则/目录）</text>
  <line x1="320" y1="7" x2="356" y2="7" stroke="#94a3b8" stroke-width="2.2" marker-end="url(#arr)"/><text x="362" y="11" font-size="11.5" fill="#475569">数值/时标来源</text>
  <line x1="500" y1="7" x2="536" y2="7" stroke="#7aa3d6" stroke-width="1.8" stroke-dasharray="5 4" marker-end="url(#arrB)"/><text x="542" y="11" font-size="11.5" fill="#475569">规则来源</text>
</g>
```

## 五、坐标规划方法（网格法）

用 `viewBox`（推荐 `0 0 1040 540`），按"行"布局，节点尺寸固定 → 中心坐标易算、连线好对齐：

| 行 | 内容 | y（节点顶） | 备注 |
| --- | --- | --- | --- |
| 规则行 | 描述型规则卡（蓝） | 70 | 虚线下指主链 |
| 主链行 | 时标型凭证（粉） | 240 | 横向主链 |
| 旁支行 | 旁支凭证 + 规则 | 400 | 分叉 / 引用 |
| 图例 | 色块 + 线型 | 500 | 底部 |

主链 5 节点横排速查（宽 168，间距 200）：

| 节点序 | x（左） | cx（中心） | 右边 |
| --- | --- | --- | --- |
| 1 | 30 | 114 | 198 |
| 2 | 230 | 314 | 398 |
| 3 | 430 | 514 | 598 |
| 4 | 630 | 714 | 798 |
| 5 | 830 | 914 | 998 |

- 横向连线：`M{左节点右边},275 L{右节点左边-2},275`（中线 y=275）。
- 纵向分叉：`M{cx},{节点底} L{cx},{下节点顶-2}`。
- 规则→凭证：贝塞尔 `M{规则下中} C{…} {凭证顶}`。

## 六、各类图的画法要点

| 图 | 节点 | 连线 | 提示 |
| --- | --- | --- | --- |
| 凭证链 | 时标型横排主链 + 描述型规则行 | 实线主链 / 虚线规则 | 主链用网格速查坐标；规则来源可单独成图避免拥挤 |
| 时序图 | 参与方纵向成列（文字 + 竖线） | 横向消息 `-->` / 粗线结算 `==>` | `Note` 用 `<text>` 标在列间；可也用 HTML 有序列表替代 |
| 合同图 | 参与方（圆/椭圆 `ellipse`） | 粗线 `===` 对手方结算 / 普通线撮合 | 平台枢纽方用粗线连两份结算合同 |
| 违约流转 | 履约项（圆角矩形） | 分叉箭头，标「独立履约项 / 自动作废」 | 终止节点（打官司）用灰色 |
| KPI 链 | 目标 / 实际 / 罚扣三节点 | 对比 + 偏差触发箭头 | `> deadline` 判定标在箭头上 |

> **不必每张都用 SVG**：时序图、违约流转在 HTML 里也可用"有序列表 + 缩进 + 徽章"表达，更省事且可读。SVG 重点用于**凭证链 / 合同关系**这类结构性模型图。

## 七、检查清单

- [ ] 没有 Mermaid，图都是手写 `<svg>`。
- [ ] 每张 `<svg>` 顶部有 `defs`（阴影 + 箭头）。
- [ ] 四原型配色一致（粉 / 蓝 / 黄 / 绿），与正文徽章呼应。
- [ ] 实线 / 虚线 / 粗线语义与终端轨 ASCII 图一致。
- [ ] `viewBox` + `width:100%`，响应式不溢出（容器 `overflow-x:auto`）。
- [ ] 无外部 CDN 依赖（离线可开）。
- [ ] 章节标号由 CSS counter 自动生成，`<h2>` 未手写 `<span class="num">`（与目录一致）。

完整实战范例见 `../examples/B2C商城-建模方案/报告.html`。
