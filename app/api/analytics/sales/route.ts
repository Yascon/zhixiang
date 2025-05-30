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

    // 获取销售订单数据
    const orders = await prisma.order.findMany({
      where: {
        type: 'SALE',
        status: 'COMPLETED',
        ...(dateFrom && dateTo ? { orderDate: dateFilter } : {})
      },
      include: {
        orderItems: {
          include: {
            product: true
          }
        }
      }
    })

    // 计算总销售额
    const totalSales = orders.reduce((sum, order) => sum + order.totalAmount, 0)
    
    // 计算总订单数
    const totalOrders = orders.length
    
    // 计算平均订单价值
    const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0

    // 计算热销商品
    const productSales: { [key: string]: { product: any, totalSold: number, totalRevenue: number } } = {}
    
    orders.forEach(order => {
      order.orderItems.forEach(item => {
        const productId = item.productId
        if (!productSales[productId]) {
          productSales[productId] = {
            product: item.product,
            totalSold: 0,
            totalRevenue: 0
          }
        }
        productSales[productId].totalSold += item.quantity
        productSales[productId].totalRevenue += (item.unitPrice || item.product.sellingPrice) * item.quantity
      })
    })

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.totalSold - a.totalSold)
      .slice(0, 10)
      .map(item => ({
        id: item.product.id,
        name: item.product.name,
        sku: item.product.sku,
        totalSold: item.totalSold,
        totalRevenue: item.totalRevenue
      }))

    // 计算销售趋势（按天统计）
    const salesTrend: { [key: string]: number } = {}
    orders.forEach(order => {
      const date = new Date(order.orderDate).toISOString().split('T')[0]
      salesTrend[date] = (salesTrend[date] || 0) + order.totalAmount
    })

    const salesTrendArray = Object.entries(salesTrend)
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => a.date.localeCompare(b.date))

    return NextResponse.json({
      success: true,
      data: {
        totalSales,
        totalOrders,
        averageOrderValue,
        topProducts,
        salesTrend: salesTrendArray
      }
    })
  } catch (error) {
    console.error('获取销售分析数据失败:', error)
    return NextResponse.json(
      { success: false, message: '获取销售分析数据失败' },
      { status: 500 }
    )
  }
} 