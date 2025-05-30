import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')

    // 构建日期查询条件
    const dateFilter: any = {}
    if (dateFrom && dateTo) {
      dateFilter.gte = new Date(dateFrom)
      dateFilter.lte = new Date(dateTo + 'T23:59:59.999Z')
    }

    // 获取所有会员
    const allMembers = await prisma.member.findMany({
      include: {
        level: true
      }
    })

    // 获取新增会员（在指定日期范围内）
    const newMembers = dateFrom && dateTo 
      ? await prisma.member.count({
          where: { createdAt: dateFilter }
        })
      : 0

    // 获取会员费支付记录
    const membershipPayments = await prisma.membershipPayment.findMany({
      where: dateFrom && dateTo ? { createdAt: dateFilter } : {}
    })

    // 计算会员费收入
    const membershipRevenue = membershipPayments.reduce((sum, payment) => sum + payment.amount, 0)

    // 计算会员等级分布
    const levelStats: { [key: string]: { name: string, count: number } } = {}
    
    allMembers.forEach(member => {
      const levelName = member.level?.name || '未分级'
      if (!levelStats[levelName]) {
        levelStats[levelName] = {
          name: levelName,
          count: 0
        }
      }
      levelStats[levelName].count++
    })

    const levelDistribution = Object.values(levelStats)
      .map(level => ({
        ...level,
        percentage: allMembers.length > 0 ? Math.round((level.count / allMembers.length) * 100) : 0
      }))
      .sort((a, b) => b.count - a.count)

    return NextResponse.json({
      success: true,
      data: {
        totalMembers: allMembers.length,
        newMembers,
        membershipRevenue,
        levelDistribution
      }
    })
  } catch (error) {
    console.error('获取会员分析数据失败:', error)
    return NextResponse.json(
      { success: false, message: '获取会员分析数据失败' },
      { status: 500 }
    )
  }
} 