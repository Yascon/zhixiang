import { NextRequest, NextResponse } from 'next/server'
import { sign, verify } from 'jsonwebtoken'

export async function GET(request: NextRequest) {
  try {
    const JWT_SECRET = process.env.JWT_SECRET
    
    if (!JWT_SECRET) {
      return NextResponse.json({
        success: false,
        message: 'JWT_SECRET未设置'
      })
    }

    // 生成测试token
    const testPayload = {
      userId: 'test-user-id',
      email: 'test@example.com',
      role: 'ADMIN',
      name: '测试用户'
    }

    const token = sign(testPayload, JWT_SECRET, { expiresIn: '24h' })
    console.log('🔍 测试API - 生成的token:', token)

    // 立即验证token
    const decoded = verify(token, JWT_SECRET) as any
    console.log('🔍 测试API - 验证成功:', decoded)

    return NextResponse.json({
      success: true,
      message: 'JWT测试成功',
      data: {
        original: testPayload,
        decoded: decoded,
        token: token.substring(0, 50) + '...',
        JWT_SECRET_length: JWT_SECRET.length
      }
    })
  } catch (error: any) {
    console.error('🔍 测试API - JWT测试失败:', error)
    return NextResponse.json({
      success: false,
      message: 'JWT测试失败',
      error: {
        name: error.name,
        message: error.message
      }
    })
  }
} 