# -*- coding: utf-8 -*-
"""
将极客时间保存页 html 提取为 markdown，保持正文原文。

定位正文容器（class 含 ArticleMobile_main），DOM 层跳过评论区，识别 Slate.js 代码行
（data-slate-type=code-line）合并为代码块，后处理截断顶部导航与底部互动区。

用法:
  python extract_course.py <input.html> <output.md>   # 写出 markdown 文件
  python extract_course.py <input.html>                # 调试：打印正文容器标签统计 + 正文样本
"""
import re
import sys
from html.parser import HTMLParser

# 自闭合标签：不改变当前父节点
VOID = {'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
        'link', 'meta', 'param', 'source', 'track', 'wbr'}
# 整棵子树忽略（脚本 / 样式 / 图标 / 交互组件）
SKIP = {'script', 'style', 'noscript', 'template', 'svg', 'head',
        'iframe', 'button', 'form', 'input', 'select', 'option'}
H_TAGS = {'h1', 'h2', 'h3', 'h4', 'h5', 'h6'}
# 行内标签：在容器的“直接文本”收集中按 inline 处理，不作为块级递归
INLINE_TAGS = {'span', 'strong', 'b', 'em', 'i', 'del', 's', 'ins', 'u',
               'a', 'code', 'br', 'img', 'sub', 'sup', 'mark', 'font',
               'bdi', 'bdo', 'small', 'time', 'abbr', 'cite', 'q', 'label'}
# 噪音容器 class（评论区等）：DOM 层整棵跳过
NOISE_CLASS_MARKERS = ('CommentItem', 'CommentList', 'CommentBox', 'comment-list')
# 正文容器特征 class（极客时间移动版文章主体）
MAIN_MARKERS = ('ArticleMobile_main', 'article-content', 'article_content', 'Post_main')

BR = object()  # 换行占位符，用于 inline 缓冲


class Node:
    __slots__ = ('tag', 'attrs', 'parent', 'children', 'data')

    def __init__(self, tag, attrs, parent):
        self.tag = tag
        self.attrs = attrs
        self.parent = parent
        self.children = []
        self.data = []  # 该节点直接包裹的文本片段


class TreeBuilder(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.root = Node('root', {}, None)
        self.cur = self.root

    def handle_starttag(self, tag, attrs):
        n = Node(tag, dict(attrs), self.cur)
        self.cur.children.append(n)
        if tag not in VOID:
            self.cur = n

    def handle_startendtag(self, tag, attrs):
        self.cur.children.append(Node(tag, dict(attrs), self.cur))

    def handle_endtag(self, tag):
        # 容错：向上回溯到最近的同名标签
        p = self.cur
        while p is not None and p.tag != tag:
            p = p.parent
        if p is not None and p.parent is not None:
            self.cur = p.parent

    def handle_data(self, data):
        # 保留所有 data（含纯空白）：代码 token 间的空格 / 缩进不能丢
        if data:
            self.cur.data.append(data)


def is_noise(node):
    cls = node.attrs.get('class', '')
    return any(m in cls for m in NOISE_CLASS_MARKERS)


def is_code_line(node):
    return node.attrs.get('data-slate-type') == 'code-line'


def text_of(node):
    """收集节点内所有纯文本（含子孙），跳过 SKIP / 噪音子树。原样保留空白。"""
    if node.tag in SKIP or is_noise(node):
        return ''
    out = ''.join(node.data)
    for c in node.children:
        out += text_of(c)
    return out


def normalize_para(s):
    """正文段落空白归并：连续空白（含换行）压成单空格。"""
    return re.sub(r'\s+', ' ', s).strip()


def find_main(node):
    cls = node.attrs.get('class', '')
    if any(m in cls for m in MAIN_MARKERS):
        return node
    for c in node.children:
        r = find_main(c)
        if r is not None:
            return r
    return None


def inline_md(node):
    """渲染行内内容（文本 + strong/em/code/a/img/span），递归全部子节点。"""
    if node.tag in SKIP or is_noise(node):
        return ''
    s = ''.join(node.data)
    for c in node.children:
        ct = c.tag
        if ct == 'br':
            s += ' '
        elif ct in ('strong', 'b'):
            s += '**' + inline_md(c).strip() + '**'
        elif ct in ('em', 'i'):
            s += '*' + inline_md(c).strip() + '*'
        elif ct in ('del', 's'):
            s += '~~' + inline_md(c).strip() + '~~'
        elif ct == 'code':
            s += '`' + text_of(c) + '`'
        elif ct == 'a':
            href = c.attrs.get('href', '')
            txt = inline_md(c).strip()
            if href and txt and not href.startswith('javascript'):
                s += '[' + txt + '](' + href + ')'
            else:
                s += txt
        elif ct == 'img':
            src = c.attrs.get('src', '')
            if src and not src.startswith('data:'):
                s += '![' + c.attrs.get('alt', '') + '](' + src + ')'
        elif ct in SKIP or is_noise(c):
            continue
        else:
            s += inline_md(c)
    return s


def render_table(node):
    trs = []

    def collect(n):
        if n.tag == 'tr':
            trs.append(n)
        for c in n.children:
            collect(c)

    collect(node)
    if not trs:
        return ''

    def cells(tr):
        return [normalize_para(inline_md(c)) for c in tr.children if c.tag in ('td', 'th')]

    rows = [cells(tr) for tr in trs]
    rows = [r for r in rows if r]
    if not rows:
        return ''
    width = max(len(r) for r in rows)
    rows = [r + [''] * (width - len(r)) for r in rows]
    out = ['\n\n', '| ' + ' | '.join(rows[0]) + ' |',
           '| ' + ' | '.join(['---'] * width) + ' |']
    for r in rows[1:]:
        out.append('| ' + ' | '.join(r) + ' |')
    out.append('\n')
    return '\n'.join(out)


def render_children(node):
    """对每个子节点调 render_block（用于 figure / blockquote 内部等）。"""
    return ''.join(render_block(c) for c in node.children)


def render_mixed(node):
    """容器渲染：按文档顺序分组——连续代码行合并为代码块，inline 内容合并为段落，
    其余块级子节点递归。"""
    parts = []
    inline_buf = []
    code_buf = []

    def flush_inline():
        nonlocal inline_buf
        if not inline_buf:
            return
        txt = ''.join(x if x is not BR else '\n' for x in inline_buf)
        txt = normalize_para(txt)
        if txt:
            parts.append('\n\n' + txt + '\n')
        inline_buf = []

    def flush_code():
        nonlocal code_buf
        if code_buf:
            code = '\n'.join(line.rstrip() for line in code_buf).rstrip()
            if code:
                parts.append('\n\n```\n' + code + '\n```\n')
            code_buf = []

    # 容器自身的直接文本（一般用于裸文本容器）放在最前
    direct = ''.join(node.data)
    if direct.strip():
        inline_buf.append(direct)

    for c in node.children:
        if c.tag in SKIP or is_noise(c):
            continue
        if is_code_line(c):
            flush_inline()
            code_buf.append(text_of(c))
            continue
        flush_code()
        if c.tag == 'br':
            inline_buf.append(BR)
        elif c.tag in INLINE_TAGS:
            inline_buf.append(inline_md(c))
        else:
            flush_inline()
            parts.append(render_block(c))
    flush_inline()
    flush_code()
    return ''.join(parts)


def render_block(node):
    """渲染块级元素为 markdown 片段。"""
    t = node.tag
    if t in SKIP or is_noise(node):
        return ''
    if is_code_line(node):
        # 单独遇到的 code-line（不在 render_mixed 分组流程中）：按一行代码处理
        line = text_of(node).rstrip()
        return '\n\n```\n' + line + '\n```\n' if line else ''
    if t in H_TAGS:
        return '\n\n' + '#' * int(t[1]) + ' ' + normalize_para(inline_md(node)) + '\n'
    if t == 'p':
        txt = normalize_para(inline_md(node))
        return '\n\n' + txt + '\n' if txt else ''
    if t == 'pre':
        code = text_of(node).rstrip()
        return '\n\n```\n' + code + '\n```\n' if code else ''
    if t == 'ul':
        items = []
        for c in node.children:
            if c.tag == 'li':
                txt = normalize_para(inline_md(c))
                if txt:
                    items.append('\n- ' + txt)
        return (''.join(items) + '\n') if items else ''
    if t == 'ol':
        items = []
        i = 0
        for c in node.children:
            if c.tag == 'li':
                i += 1
                txt = normalize_para(inline_md(c))
                if txt:
                    items.append('\n%d. %s' % (i, txt))
        return (''.join(items) + '\n') if items else ''
    if t == 'blockquote':
        inner = render_children(node).strip()
        if not inner:
            return ''
        return '\n\n' + '\n'.join('> ' + l if l else '>' for l in inner.split('\n')) + '\n'
    if t == 'table':
        return render_table(node)
    if t == 'figure':
        return render_children(node)
    if t == 'img':
        src = node.attrs.get('src', '')
        if not src or src.startswith('data:'):
            return ''
        return '\n\n![' + node.attrs.get('alt', '') + '](' + src + ')\n'
    if t == 'br':
        return ''
    if t == 'hr':
        return '\n\n---\n'
    # 普通容器（div / section / article / span / main / header 等）
    return render_mixed(node)


# 底部噪音关键词（出现即截断其及之后内容）
BOTTOM_MARKERS = [
    '精选留言', '分享给需要的人', '版权归极客邦', '未经许可不得传播',
    '防盗追踪', '页面已增加防盗', 'Ta订阅后你可得', '相关推荐',
]
BOTTOM_LINE_PATS = [
    r'(?m)^赞[\s 　]*\d',
    r'(?m)^提建议',
    r'(?m)^上一篇',
    r'(?m)^下一篇',
    r'(?m)^展开',
]


def clean_md(md):
    """后处理：截掉顶部导航、底部互动区与评论区残余，合并多余空行。"""
    md = md.replace('\r', '')
    # 顶部导航：保留从第一个一级标题（文章标题）开始的内容
    m = re.search(r'(?m)^#\s', md)
    if m:
        md = md[m.start():]
    # 底部噪音：取所有标记里最早出现的位置截断
    cut = len(md)
    for kw in BOTTOM_MARKERS:
        mm = re.search(kw, md)
        if mm:
            cut = min(cut, mm.start())
    for pat in BOTTOM_LINE_PATS:
        mm = re.search(pat, md)
        if mm:
            cut = min(cut, mm.start())
    md = md[:cut]
    md = re.sub(r'\n{3,}', '\n\n', md)
    return md.strip() + '\n'


def html_to_md(raw):
    b = TreeBuilder()
    b.feed(raw)
    b.close()
    main = find_main(b.root)
    if main is None:
        body = [None]

        def find_body(n):
            if n.tag == 'body':
                body[0] = n
                return True
            for c in n.children:
                if find_body(c):
                    return True
            return False

        html_node = next((c for c in b.root.children if c.tag == 'html'), b.root)
        find_body(html_node)
        main = body[0] or html_node
    md = render_children(main)
    return clean_md(md)


def debug(raw):
    b = TreeBuilder()
    b.feed(raw)
    b.close()
    main = find_main(b.root)
    print('正文容器命中:', main is not None,
          ('class=' + main.attrs.get('class', '')) if main else '')
    from collections import Counter
    cnt = Counter()

    def walk(n):
        cnt[n.tag] += 1
        for c in n.children:
            walk(c)
    if main:
        walk(main)
    print('\n=== 正文容器内标签统计（前 25）===')
    for tag, n in cnt.most_common(25):
        print('%5d  <%s>' % (n, tag))
    sample = text_of(main).strip()[:1200] if main else ''
    print('\n=== 正文纯文本样本（前 1200 字）===')
    print(sample)


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)
    src = sys.argv[1]
    raw = open(src, encoding='utf-8').read()
    if len(sys.argv) >= 3:
        md = html_to_md(raw)
        open(sys.argv[2], 'w', encoding='utf-8').write(md)
        print('已写出:', sys.argv[2], '(%d 字符)' % len(md))
    else:
        debug(raw)


if __name__ == '__main__':
    main()
