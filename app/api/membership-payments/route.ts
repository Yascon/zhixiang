import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// 获取会员费支付记录
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '10')
    const memberId = searchParams.get('memberId') || ''

    let where: any = {}
    
    if (memberId) {
      where.memberId = memberId
    }

    const [payments, total] = await Promise.all([
      prisma.membershipPayment.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          member: true
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.membershipPayment.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: payments,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    })
  } catch (error) {
    console.error('获取会员费支付记录失败:', error)
    return NextResponse.json(
      { success: false, message: '获取会员费支付记录失败' },
      { status: 500 }
    )
  }
}

// 创建会员费支付记录
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { memberId, amount, method, period, startDate, endDate, notes } = body

    // 检查会员是否存在
    const member = await prisma.member.findUnique({
      where: { id: memberId }
    })

    if (!member) {
      return NextResponse.json(
        { success: false, message: '会员不存在' },
        { status: 400 }
      )
    }

    // 计算会员期限
    let finalStartDate: Date
    let finalEndDate: Date

    if (startDate && endDate) {
      // 如果直接提供了开始和结束日期
      finalStartDate = new Date(startDate)
      finalEndDate = new Date(endDate)
    } else {
      // 使用period计算
      finalStartDate = member.membershipExpiry && member.membershipExpiry > new Date() 
        ? member.membershipExpiry 
        : new Date()
      
      finalEndDate = new Date(finalStartDate)
      finalEndDate.setFullYear(finalEndDate.getFullYear() + parseInt(period || '1'))
    }

    // 创建支付记录
    const payment = await prisma.membershipPayment.create({
      data: {
        memberId,
        amount: parseFloat(amount),
        method,
        status: 'PAID',
        startDate: finalStartDate,
        endDate: finalEndDate,
        notes
      },
      include: {
        member: true
      }
    })

    // 更新会员信息
    await prisma.member.update({
      where: { id: memberId },
      data: {
        membershipFee: parseFloat(amount),
        membershipExpiry: finalEndDate,
        status: 'ACTIVE'
      }
    })

    return NextResponse.json({
      success: true,
      data: payment,
      message: '会员费收取成功'
    })
  } catch (error) {
    console.error('创建会员费支付记录失败:', error)
    return NextResponse.json(
      { success: false, message: '创建会员费支付记录失败' },
      { status: 500 }
    )
  }
} 