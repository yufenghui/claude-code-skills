// 编译时类型验证测试
import { ToolOperation, SessionData } from '../src/types.js';

// 如果这个文件能够成功编译，说明所有类型都正确定义了
// 这些变量只是用于类型检查，不会在运行时执行

const _testToolOperation: ToolOperation = {
  id: 'test-123',
  name: 'Read',
  target: 'src/file.ts',
  startTime: new Date(),
  status: 'completed',
  endTime: new Date(),
  duration: 100
};

const _testSessionData: SessionData = {
  sessionId: 'session-abc',
  startTime: new Date(),
  operations: [],
  stats: {
    total: 0,
    completed: 0,
    failed: 0,
    avgDuration: 0,
    maxDuration: 0,
    failureRate: 0
  }
};

// 导出一个标记表示测试存在
export const typeDefinitionsExist = true;
