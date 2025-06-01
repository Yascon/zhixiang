import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { generateToken } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    console.log('🔍 登录API - 开始登录流程')

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, message: '用户不存在' },
        { status: 401 }
      )
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: '密码错误' },
        { status: 401 }
      )
    }

    // 生成JWT token - 使用auth库的generateToken函数
    const userForToken = {
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name || ''
    }
    console.log('🔍 登录API - User data for token generation:', userForToken);
    
    const token = generateToken(userForToken)
    console.log('🔍 登录API - Generated token (first 50 chars):', token ? token.substring(0, 50) + '...' : 'undefined/empty');

    // 设置cookie
    const response = NextResponse.json({
      success: true,
      message: '登录成功',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        },
        token
      }
    })

    // 设置HTTP-only cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 // 24小时
    })

    return response
  } catch (error) {
    console.error('登录失败:', error)
    return NextResponse.json(
      { success: false, message: '登录失败' },
      { status: 500 }
    )
  }
} 