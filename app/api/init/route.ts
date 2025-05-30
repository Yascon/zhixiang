import { NextResponse } from 'next/server'
import { initializeDatabase } from '@/lib/init-db'

export async function POST() {
  try {
    await initializeDatabase()
    return NextResponse.json({
      success: true,
      message: '数据库初始化成功'
    })
  } catch (error) {
    console.error('数据库初始化失败:', error)
    return NextResponse.json(
      { success: false, message: '数据库初始化失败' },
      { status: 500 }
    )
  }
} 