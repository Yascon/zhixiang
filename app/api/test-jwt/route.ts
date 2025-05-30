import { NextRequest, NextResponse } from 'next/server'
import { verify } from 'jsonwebtoken'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Test JWT API - 开始测试')
    console.log('🔍 Test JWT API - JWT_SECRET:', process.env.JWT_SECRET)
    console.log('🔍 Test JWT API - JWT_SECRET length:', process.env.JWT_SECRET?.length)
    
    const authHeader = request.headers.get('authorization')
    console.log('🔍 Test JWT API - Authorization header:', authHeader)
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No Bearer token found' })
    }
    
    const token = authHeader.substring(7)
    console.log('🔍 Test JWT API - Token:', token.substring(0, 50) + '...')
    
    const JWT_SECRET = process.env.JWT_SECRET
    if (!JWT_SECRET) {
      return NextResponse.json({ error: 'JWT_SECRET not found' })
    }
    
    console.log('🔍 Test JWT API - 开始验证token...')
    const decoded = verify(token, JWT_SECRET)
    console.log('🔍 Test JWT API - Token验证成功:', decoded)
    
    return NextResponse.json({ 
      success: true, 
      decoded,
      jwtSecret: JWT_SECRET.substring(0, 10) + '...'
    })
  } catch (error: any) {
    console.error('🔍 Test JWT API - 验证失败:', error)
    return NextResponse.json({ 
      error: error.message,
      name: error.name,
      stack: error.stack
    })
  }
} 