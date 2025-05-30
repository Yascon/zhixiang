import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    // 获取所有商品及其分类信息
    const products = await prisma.product.findMany({
      include: {
        category: true
      }
    })

    // 计算总商品数
    const totalProducts = products.length

    // 计算库存预警数量（库存低于10的商品）
    const lowStockCount = products.filter(product => product.stock < 10).length

    // 计算库存总价值
    const totalValue = products.reduce((sum, product) => {
      return sum + (product.stock * product.costPrice)
    }, 0)

    // 计算分类分布
    const categoryStats: { [key: string]: { name: string, count: number } } = {}
    
    products.forEach(product => {
      const categoryName = product.category?.name || '未分类'
      if (!categoryStats[categoryName]) {
        categoryStats[categoryName] = {
          name: categoryName,
          count: 0
        }
      }
      categoryStats[categoryName].count++
    })

    const categoryDistribution = Object.values(categoryStats)
      .map(category => ({
        ...category,
        percentage: totalProducts > 0 ? Math.round((category.count / totalProducts) * 100) : 0
      }))
      .sort((a, b) => b.count - a.count)

    return NextResponse.json({
      success: true,
      data: {
        totalProducts,
        lowStockCount,
        totalValue,
        categoryDistribution
      }
    })
  } catch (error) {
    console.error('获取库存分析数据失败:', error)
    return NextResponse.json(
      { success: false, message: '获取库存分析数据失败' },
      { status: 500 }
    )
  }
} 