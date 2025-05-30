import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    console.log('开始执行数据库迁移...');
    
    // 执行 Prisma 迁移部署
    const { stdout, stderr } = await execAsync('npx prisma migrate deploy');
    
    console.log('迁移输出:', stdout);
    if (stderr) {
      console.error('迁移错误:', stderr);
    }
    
    return NextResponse.json({
      success: true,
      message: '数据库迁移执行成功',
      output: stdout,
      error: stderr || null
    });
    
  } catch (error: any) {
    console.error('迁移执行失败:', error);
    
    return NextResponse.json({
      success: false,
      message: '数据库迁移执行失败',
      error: error.message,
      output: error.stdout || null,
      stderr: error.stderr || null
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: '使用 POST 方法执行数据库迁移',
    endpoint: '/api/migrate-deploy',
    method: 'POST'
  });
} 