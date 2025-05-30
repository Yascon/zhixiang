import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// 获取单个会员信息
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const member = await prisma.member.findUnique({
      where: { id: params.id },
      include: {
        level: true,
        membershipPayments: {
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        orders: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            orderItems: {
              include: {
                product: true
              }
            }
          }
        }
      }
    })

    if (!member) {
      return NextResponse.json(
        { success: false, message: '会员不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: member
    })
  } catch (error) {
    console.error('获取会员信息失败:', error)
    return NextResponse.json(
      { success: false, message: '获取会员信息失败' },
      { status: 500 }
    )
  }
}

// 更新会员信息
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { name, phone, email, levelId, gender, birthday, address } = body

    // 检查会员是否存在
    const existingMember = await prisma.member.findUnique({
      where: { id: params.id }
    })

    if (!existingMember) {
      return NextResponse.json(
        { success: false, message: '会员不存在' },
        { status: 404 }
      )
    }

    // 检查手机号是否被其他会员使用
    if (phone && phone !== existingMember.phone) {
      const phoneExists = await prisma.member.findUnique({
        where: { phone }
      })

      if (phoneExists) {
        return NextResponse.json(
          { success: false, message: '手机号已被其他会员使用' },
          { status: 400 }
        )
      }
    }

    const member = await prisma.member.update({
      where: { id: params.id },
      data: {
        name,
        phone,
        email,
        levelId,
        gender,
        birthday: birthday ? new Date(birthday) : undefined,
        address
      },
      include: {
        level: true
      }
    })

    return NextResponse.json({
      success: true,
      data: member,
      message: '会员信息更新成功'
    })
  } catch (error) {
    console.error('更新会员信息失败:', error)
    return NextResponse.json(
      { success: false, message: '更新会员信息失败' },
      { status: 500 }
    )
  }
}

// 删除会员
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 检查会员是否存在
    const member = await prisma.member.findUnique({
      where: { id: params.id }
    })

    if (!member) {
      return NextResponse.json(
        { success: false, message: '会员不存在' },
        { status: 404 }
      )
    }

    // 检查会员是否有关联的订单
    const orderCount = await prisma.order.count({
      where: { memberId: params.id }
    })

    if (orderCount > 0) {
      return NextResponse.json(
        { success: false, message: '该会员有关联订单，无法删除' },
        { status: 400 }
      )
    }

    // 删除会员相关数据
    await prisma.$transaction([
      // 删除会员费支付记录
      prisma.membershipPayment.deleteMany({
        where: { memberId: params.id }
      }),
      // 删除会员
      prisma.member.delete({
        where: { id: params.id }
      })
    ])

    return NextResponse.json({
      success: true,
      message: '会员删除成功'
    })
  } catch (error) {
    console.error('删除会员失败:', error)
    return NextResponse.json(
      { success: false, message: '删除会员失败' },
      { status: 500 }
    )
  }
} 