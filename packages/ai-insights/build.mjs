#!/usr/bin/env node
/**
 * 构建脚本 - 使用 tsc 编译 TypeScript
 */

import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

async function build() {
  console.log('🔨 开始构建...\n');

  try {
    // 使用 tsc 编译（npx 会自动查找 node_modules）
    console.log('📦 编译 TypeScript...\n');
    execSync('npx tsc', {
      cwd: __dirname,
      stdio: 'inherit',
      env: { ...process.env, FORCE_COLOR: '1' }
    });

    console.log('\n✨ 构建完成！');
    console.log('📁 构建产物位于 dist/ 目录\n');

  } catch (error) {
    console.error('\n❌ 构建失败');
    console.error('提示: 请确保已在项目根目录运行 npm install\n');
    process.exit(1);
  }
}

build().catch(console.error);
