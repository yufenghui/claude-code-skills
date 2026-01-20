import { describe, it } from 'node:test';
import assert from 'node:assert';
import { join } from 'path';
import { TranscriptParser } from '../../src/parser/TranscriptParser.js';

describe('TranscriptParser 历史解析器', () => {
  const testHistoryPath = join(process.cwd(), 'test/fixtures/history-sample.jsonl');

  it('应该从历史文件解析工具调用', async () => {
    const parser = new TranscriptParser(testHistoryPath);
    const operations = await parser.parseNewLines(0);

    assert.strictEqual(operations.length, 4);
    assert.strictEqual(operations[0].name, 'Read');
    assert.strictEqual(operations[0].target, 'src/types.ts');
    assert.strictEqual(operations[0].status, 'completed');
  });

  it('应该只解析指定位置之后的新行', async () => {
    const parser = new TranscriptParser(testHistoryPath);

    // 第一次解析 - 获取所有操作
    const firstBatch = await parser.parseNewLines(0);
    assert.strictEqual(firstBatch.length, 4);

    // 第二次解析 - 不应该有新内容
    const secondBatch = await parser.parseNewLines(100000); // 使用一个很大的位置
    assert.strictEqual(secondBatch.length, 0);
  });

  it('应该提取错误信息', async () => {
    const parser = new TranscriptParser(testHistoryPath);
    const operations = await parser.parseNewLines(0);

    const bashOp = operations.find(op => op.name === 'Bash');
    assert.ok(bashOp);
    assert.strictEqual(bashOp!.status, 'error');
    assert.ok(bashOp!.errorMessage);
  });
});
