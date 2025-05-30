import { NextRequest, NextResponse } from 'next/server'
import { verify } from 'jsonwebtoken'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 测试API - 环境变量:')
    console.log('  JWT_SECRET:', process.env.JWT_SECRET)
    console.log('  JWT_SECRET length:', process.env.JWT_SECRET?.length)
    
    const authHeader = request.headers.get('authorization')
    console.log('🔍 测试API - Authorization header:', authHeader)
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        success: false,
        message: '缺少Authorization header',
        debug: {
          authHeader,
          hasBearer: authHeader?.startsWith('Bearer ')
        }
      })
    }
    
    const token = authHeader.substring(7)
    console.log('🔍 测试API - Token:', token.substring(0, 50) + '...')
    
    if (!process.env.JWT_SECRET) {
      return NextResponse.json({
        success: false,
        message: 'JWT_SECRET未设置'
      })
    }
    
    const decoded = verify(token, process.env.JWT_SECRET)
    console.log('🔍 测试API - 解码成功:', decoded)
    
    return NextResponse.json({
      success: true,
      message: 'JWT验证成功',
      data: decoded
    })
  } catch (error: any) {
    console.error('🔍 测试API - 验证失败:', error)
    return NextResponse.json({
      success: false,
      message: 'JWT验证失败',
      error: {
        name: error.name,
        message: error.message
      }
    })
  }
} 