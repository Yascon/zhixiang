import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getUserFromRequest, requireAuth } from '@/lib/auth'

const prisma = new PrismaClient()

// 获取用户列表 - 需要管理员权限
export const GET = requireAuth('ADMIN')(async function(request: NextRequest) {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      data: users
    })
  } catch (error) {
    console.error('获取用户列表失败:', error)
    return NextResponse.json(
      { success: false, message: '获取用户列表失败' },
      { status: 500 }
    )
  }
})

// 创建用户 - 需要管理员权限
export const POST = requireAuth('ADMIN')(async function(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password, role } = body

    // 检查邮箱是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: '邮箱已存在' },
        { status: 400 }
      )
    }

    // 创建用户（实际应用中应该加密密码）
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password, // 实际应用中应该使用bcrypt等加密
        role
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    })

    return NextResponse.json({
      success: true,
      message: '用户创建成功',
      data: user
    })
  } catch (error) {
    console.error('创建用户失败:', error)
    return NextResponse.json(
      { success: false, message: '创建用户失败' },
      { status: 500 }
    )
  }
}) 