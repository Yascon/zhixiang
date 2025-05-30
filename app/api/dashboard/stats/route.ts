import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    // 获取今天的开始和结束时间
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)

    // 获取本月的开始时间
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

    // 并行获取各种统计数据
    const [
      totalProducts,
      totalMembers,
      todayOrders,
      lowStockProducts,
      membershipPayments,
      recentMembers,
      memberLevelStats
    ] = await Promise.all([
      // 商品总数
      prisma.product.count(),
      
      // 会员总数
      prisma.member.count(),
      
      // 今日订单统计
      prisma.order.findMany({
        where: {
          createdAt: {
            gte: startOfDay,
            lt: endOfDay
          },
          status: 'COMPLETED'
        },
        select: {
          totalAmount: true
        }
      }),
      
      // 库存不足的商品
      prisma.product.findMany({
        where: {
          stock: {
            lte: 10 // 简化查询，直接使用数字而不是字段引用
          }
        },
        include: {
          category: true
        },
        take: 10,
        orderBy: { stock: 'asc' }
      }),
      
      // 本月会员费收入
      prisma.membershipPayment.findMany({
        where: {
          createdAt: {
            gte: startOfMonth
          }
        },
        select: {
          amount: true
        }
      }),
      
      // 最新会员
      prisma.member.findMany({
        include: {
          level: true
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      }),
      
      // 会员等级统计
      prisma.member.groupBy({
        by: ['levelId'],
        _count: {
          id: true
        }
      })
    ])

    // 计算今日营收
    const todayRevenue = todayOrders.reduce((sum, order) => sum + order.totalAmount, 0)

    // 计算本月会员费收入
    const monthlyMembershipRevenue = membershipPayments.reduce((sum, payment) => sum + payment.amount, 0)

    // 处理库存不足商品数据
    const lowStockItems = lowStockProducts.map(product => ({
      id: product.id,
      name: product.name,
      sku: product.sku,
      stock: product.stock,
      minStock: product.minStock,
      category: product.category.name,
      status: product.stock === 0 ? 'out' : 'low'
    }))

    // 处理最新会员数据
    const recentMembersData = recentMembers.map(member => ({
      id: member.id,
      name: member.name,
      memberNo: member.memberNo,
      level: member.level.name,
      joinDate: member.createdAt.toISOString().split('T')[0],
      status: member.status.toLowerCase()
    }))

    // 获取会员等级详细信息并计算统计
    const memberLevels = await prisma.memberLevel.findMany()
    const memberLevelDistribution = memberLevels.map(level => {
      const count = memberLevelStats.find(stat => stat.levelId === level.id)?._count.id || 0
      const percentage = totalMembers > 0 ? (count / totalMembers) * 100 : 0
      return {
        name: level.name,
        count,
        percentage: Math.round(percentage)
      }
    })

    // 计算增长率（这里简化处理，实际应该对比上月数据）
    const monthlyGrowth = 12.5 // 模拟数据，实际应该计算

    const stats = {
      totalProducts,
      totalMembers,
      todayRevenue,
      lowStockCount: lowStockProducts.length,
      monthlyMembershipRevenue,
      monthlyGrowth,
      lowStockItems,
      recentMembers: recentMembersData,
      memberLevelDistribution
    }

    return NextResponse.json({
      success: true,
      data: stats
    })
  } catch (error) {
    console.error('获取仪表板统计数据失败:', error)
    return NextResponse.json(
      { success: false, message: '获取统计数据失败' },
      { status: 500 }
    )
  }
} 