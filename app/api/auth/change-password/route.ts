import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getUserFromRequest } from '@/lib/auth'

const prisma = new PrismaClient()

// 修改密码
export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: '未登录' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { currentPassword, newPassword } = body

    // 验证必填字段
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, message: '当前密码和新密码不能为空' },
        { status: 400 }
      )
    }

    // 验证新密码长度
    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, message: '新密码长度至少6位' },
        { status: 400 }
      )
    }

    // 获取用户当前密码
    const currentUser = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { password: true }
    })

    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: '用户不存在' },
        { status: 404 }
      )
    }

    // 验证当前密码（实际应用中应该使用bcrypt比较）
    if (currentUser.password !== currentPassword) {
      return NextResponse.json(
        { success: false, message: '当前密码错误' },
        { status: 400 }
      )
    }

    // 检查新密码是否与当前密码相同
    if (currentPassword === newPassword) {
      return NextResponse.json(
        { success: false, message: '新密码不能与当前密码相同' },
        { status: 400 }
      )
    }

    // 更新密码（实际应用中应该使用bcrypt加密）
    await prisma.user.update({
      where: { id: user.userId },
      data: { password: newPassword }
    })

    return NextResponse.json({
      success: true,
      message: '密码修改成功'
    })
  } catch (error) {
    console.error('修改密码失败:', error)
    return NextResponse.json(
      { success: false, message: '修改密码失败' },
      { status: 500 }
    )
  }
} 