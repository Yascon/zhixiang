import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getUserFromRequest } from '@/lib/auth'

const prisma = new PrismaClient()

// 获取当前用户信息
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Profile API - JWT_SECRET:', process.env.JWT_SECRET)
    console.log('🔍 Profile API - Authorization header:', request.headers.get('authorization'))
    
    const user = getUserFromRequest(request)
    console.log('🔍 Profile API - 解析的用户信息:', user)
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: '未登录' },
        { status: 401 }
      )
    }

    const userInfo = await prisma.user.findUnique({
      where: { id: user.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        avatar: true,
        createdAt: true
      }
    })

    if (!userInfo) {
      return NextResponse.json(
        { success: false, message: '用户不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: userInfo
    })
  } catch (error) {
    console.error('获取用户信息失败:', error)
    return NextResponse.json(
      { success: false, message: '获取用户信息失败' },
      { status: 500 }
    )
  }
}

// 更新用户信息
export async function PUT(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: '未登录' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, phone, avatar } = body

    // 验证数据
    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: '姓名不能为空' },
        { status: 400 }
      )
    }

    // 构建更新数据
    const updateData: any = { name }
    if (phone !== undefined) updateData.phone = phone
    if (avatar !== undefined) updateData.avatar = avatar

    // 更新用户信息
    const updatedUser = await prisma.user.update({
      where: { id: user.userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        avatar: true,
        createdAt: true
      }
    })

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: '个人信息更新成功'
    })
  } catch (error) {
    console.error('更新用户信息失败:', error)
    return NextResponse.json(
      { success: false, message: '更新用户信息失败' },
      { status: 500 }
    )
  }
} 