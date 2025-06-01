import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getUserFromRequest } from '@/lib/auth'

const prisma = new PrismaClient()

// 重置用户密码
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await getUserFromRequest(request)
    
    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: '未登录' },
        { status: 401 }
      )
    }

    // 检查权限：只有管理员和超级管理员可以重置密码
    if (currentUser.role !== 'ADMIN' && currentUser.role !== 'MANAGER') {
      return NextResponse.json(
        { success: false, message: '权限不足' },
        { status: 403 }
      )
    }

    const userId = params.id

    // 检查要重置密码的用户是否存在
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, role: true }
    })

    if (!targetUser) {
      return NextResponse.json(
        { success: false, message: '用户不存在' },
        { status: 404 }
      )
    }

    // 不能重置超级管理员的密码（除非自己是超级管理员）
    if (targetUser.role === 'ADMIN' && currentUser.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, message: '无法重置超级管理员密码' },
        { status: 403 }
      )
    }

    // 重置密码为默认密码123456（实际应用中应该使用bcrypt加密）
    await prisma.user.update({
      where: { id: userId },
      data: { password: '123456' }
    })

    return NextResponse.json({
      success: true,
      message: '密码重置成功，新密码为：123456'
    })
  } catch (error) {
    console.error('重置密码失败:', error)
    return NextResponse.json(
      { success: false, message: '重置密码失败' },
      { status: 500 }
    )
  }
} 