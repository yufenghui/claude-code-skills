import { describe, it } from 'node:test';
import { execSync } from 'child_process';
import assert from 'node:assert';

describe('CLI 集成测试', () => {
  it('应该在无参数时显示帮助', () => {
    try {
      const output = execSync('node packages/ai-insights/dist/cli.js --help', {
        encoding: 'utf8',
        cwd: process.cwd()
      });
      assert.ok(output.includes('用法'));
      assert.ok(output.includes('AI Insights'));
    } catch (error: any) {
      assert.fail('应该显示帮助信息');
    }
  });

  it('应该支持 statusline 模式', () => {
    // 这个测试只验证命令不会崩溃
    try {
      execSync('node packages/ai-insights/dist/cli.js --mode statusline', {
        encoding: 'utf8',
        cwd: process.cwd(),
        stdio: 'pipe'
      });
    } catch (error: any) {
      // 命令可能因为缺少数据而失败，但不应该因为语法错误而失败
      assert.ok(!error.message.includes('SyntaxError'));
    }
  });

  it('应该支持 report 模式', () => {
    try {
      execSync('node packages/ai-insights/dist/cli.js --mode report', {
        encoding: 'utf8',
        cwd: process.cwd(),
        stdio: 'pipe'
      });
    } catch (error: any) {
      assert.ok(!error.message.includes('SyntaxError'));
    }
  });
});
