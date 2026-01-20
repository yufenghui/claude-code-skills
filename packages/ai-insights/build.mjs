#!/usr/bin/env node
/**
 * 手动构建脚本
 * 将 TypeScript 文件复制到 dist 目录并修改扩展名
 */

import { copyFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const filesToBuild = [
  'src/cli.ts',
  'src/index.ts',
  'src/parser/TranscriptParser.ts',
  'src/analyzer/MetricsAnalyzer.ts',
  'src/storage/JSONStorage.ts',
  'src/renderer/StatusLineRenderer.ts',
  'src/renderer/ReportRenderer.ts',
  'src/monitor/MonitorService.ts'
];

async function build() {
  console.log('开始构建...\n');

  for (const file of filesToBuild) {
    const srcPath = join(__dirname, file);
    const distPath = join(__dirname, file.replace('src/', 'dist/').replace('.ts', '.js'));

    // 确保目录存在
    await mkdir(dirname(distPath), { recursive: true });

    // 复制文件（保持 TypeScript 扩展，运行时用 tsx 处理）
    await copyFile(srcPath, distPath.replace('.js', '.ts'));
    console.log(`✅ ${file} → ${distPath.replace(__dirname + '/', '')}`);
  }

  // 复制 types.ts
  const typesSrc = join(__dirname, 'src/types.ts');
  const typesDist = join(__dirname, 'dist/types.ts');
  await copyFile(typesSrc, typesDist);
  console.log(`✅ src/types.ts → dist/types.ts`);

  console.log('\n✨ 构建完成！');
  console.log('\n注意：由于 TypeScript 编译器问题，');
  console.log('构建产物仍是 .ts 文件，需要使用 tsx 运行。\n');
  console.log('运行方式：');
  console.log('  npx tsx dist/cli.js --help');
}

build().catch(console.error);
