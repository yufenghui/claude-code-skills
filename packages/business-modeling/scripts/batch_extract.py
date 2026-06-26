# -*- coding: utf-8 -*-
"""
批量提取课程 html 为 markdown，保持原课程目录结构与文件名。

用法:
  python batch_extract.py [源根目录] [目标根目录]

默认:
  源:   E:/极客时间/198-如何落地业务建模
  目标: <仓库>/packages/business-modeling/source
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from extract_course import html_to_md  # noqa: E402

DEFAULT_SRC = r'E:/极客时间/198-如何落地业务建模'
DEFAULT_DST = os.path.normpath(os.path.join(
    os.path.dirname(os.path.abspath(__file__)), '..', 'source'))


def main():
    src_root = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_SRC
    dst_root = sys.argv[2] if len(sys.argv) > 2 else DEFAULT_DST

    print('源目录:', src_root)
    print('目标目录:', dst_root)
    print('-' * 60)

    count = 0
    total_chars = 0
    failed = []
    for dirpath, _dirs, files in os.walk(src_root):
        for fname in sorted(files):
            if not fname.lower().endswith('.html'):
                continue
            src = os.path.join(dirpath, fname)
            rel = os.path.relpath(src, src_root)
            md_name = os.path.splitext(rel)[0] + '.md'
            dst = os.path.join(dst_root, md_name)
            try:
                os.makedirs(os.path.dirname(dst), exist_ok=True)
                raw = open(src, encoding='utf-8').read()
                md = html_to_md(raw)
                open(dst, 'w', encoding='utf-8').write(md)
                count += 1
                total_chars += len(md)
                print('OK  %-55s %6d 字符' % (rel[:55], len(md)))
            except Exception as e:  # noqa: BLE001
                failed.append((rel, str(e)))
                print('FAIL %s  %s' % (rel, e))

    print('-' * 60)
    print('共提取 %d 篇，合计 %d 字符' % (count, total_chars))
    if failed:
        print('失败 %d 篇:' % len(failed))
        for rel, e in failed:
            print('  ', rel, e)


if __name__ == '__main__':
    main()
