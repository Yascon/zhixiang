import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// 获取会员等级列表
export async function GET() {
  try {
    const levels = await prisma.memberLevel.findMany({
      orderBy: { membershipFee: 'asc' }
    })

    return NextResponse.json({
      success: true,
      data: levels
    })
  } catch (error) {
    console.error('获取会员等级失败:', error)
    return NextResponse.json(
      { success: false, message: '获取会员等级失败' },
      { status: 500 }
    )
  }
}

// 创建会员等级
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, membershipFee, maxUsers, maxProducts, maxOrders, features } = body

    const level = await prisma.memberLevel.create({
      data: {
        name,
        description,
        membershipFee: parseFloat(membershipFee),
        maxUsers: parseInt(maxUsers) || 1,
        maxProducts: parseInt(maxProducts) || 100,
        maxOrders: parseInt(maxOrders) || 1000,
        features
      }
    })

    return NextResponse.json({
      success: true,
      data: level,
      message: '会员等级创建成功'
    })
  } catch (error) {
    console.error('创建会员等级失败:', error)
    return NextResponse.json(
      { success: false, message: '创建会员等级失败' },
      { status: 500 }
    )
  }
} 