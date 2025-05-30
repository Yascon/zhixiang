import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    const reportType = searchParams.get('type') || 'all' // all, members, products, orders, finance

    // 构建日期查询条件
    const dateFilter: any = {}
    if (dateFrom && dateTo) {
      dateFilter.gte = new Date(dateFrom)
      dateFilter.lte = new Date(dateTo + 'T23:59:59.999Z')
    }

    let reportData: any = {}

    // 根据报表类型获取相应数据
    if (reportType === 'all' || reportType === 'members') {
      const members = await prisma.member.findMany({
        where: dateFrom && dateTo ? { createdAt: dateFilter } : {},
        include: {
          level: true,
          orders: {
            where: { status: 'COMPLETED' },
            select: { totalAmount: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      })

      reportData.members = members.map(member => ({
        ...member,
        totalSpent: member.orders.reduce((sum: number, order: any) => sum + order.totalAmount, 0)
      }))
    }

    if (reportType === 'all' || reportType === 'products') {
      const products = await prisma.product.findMany({
        where: dateFrom && dateTo ? { createdAt: dateFilter } : {},
        include: {
          category: true
        },
        orderBy: { createdAt: 'desc' }
      })

      // 获取商品销售统计
      const productStats = await Promise.all(
        products.map(async (product) => {
          const orderItems = await prisma.orderItem.findMany({
            where: {
              productId: product.id,
              order: { status: 'COMPLETED' }
            },
            include: { order: true }
          })

          const totalSold = orderItems.reduce((sum: number, item: any) => sum + item.quantity, 0)
          const totalRevenue = orderItems.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0)

          return {
            ...product,
            totalSold,
            totalRevenue
          }
        })
      )

      reportData.products = productStats
    }

    if (reportType === 'all' || reportType === 'orders') {
      const orders = await prisma.order.findMany({
        where: dateFrom && dateTo ? { orderDate: dateFilter } : {},
        include: {
          supplier: true,
          member: true,
          user: true,
          orderItems: {
            include: {
              product: true
            }
          }
        },
        orderBy: { orderDate: 'desc' }
      })

      reportData.orders = orders
    }

    if (reportType === 'all' || reportType === 'finance') {
      const financeRecords = await prisma.financeRecord.findMany({
        where: dateFrom && dateTo ? { recordDate: dateFilter } : {},
        orderBy: { recordDate: 'desc' }
      })

      reportData.finance = financeRecords
    }

    // 计算统计数据
    const stats = {
      totalMembers: reportData.members?.length || 0,
      totalProducts: reportData.products?.length || 0,
      totalOrders: reportData.orders?.length || 0,
      totalRevenue: reportData.finance?.filter((item: any) => item.type === 'INCOME')
        .reduce((sum: number, item: any) => sum + item.amount, 0) || 0,
      totalExpense: reportData.finance?.filter((item: any) => item.type === 'EXPENSE')
        .reduce((sum: number, item: any) => sum + item.amount, 0) || 0
    }

    return NextResponse.json({
      success: true,
      data: reportData,
      stats
    })
  } catch (error) {
    console.error('获取报表数据失败:', error)
    return NextResponse.json(
      { success: false, message: '获取报表数据失败' },
      { status: 500 }
    )
  }
}