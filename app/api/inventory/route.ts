import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// 获取库存信息
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '10')
    const keyword = searchParams.get('keyword') || ''
    const category = searchParams.get('category') || ''
    const status = searchParams.get('status') || '' // normal, low, out, excess

    const skip = (page - 1) * pageSize

    // 构建查询条件
    const where: any = {}
    
    if (keyword) {
      where.OR = [
        { name: { contains: keyword } },
        { sku: { contains: keyword } }
      ]
    }
    
    if (category) {
      where.category = { name: category }
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
          stockMovements: {
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        },
        skip,
        take: pageSize,
        orderBy: { updatedAt: 'desc' }
      }),
      prisma.product.count({ where })
    ])

    // 处理库存状态
    const inventory = products.map(product => {
      let stockStatus = 'normal'
      if (product.stock === 0) {
        stockStatus = 'out'
      } else if (product.stock <= product.minStock) {
        stockStatus = 'low'
      } else if (product.maxStock && product.stock > product.maxStock) {
        stockStatus = 'excess'
      }

      return {
        ...product,
        stockStatus,
        totalValue: product.stock * product.costPrice,
        lastMovement: product.stockMovements[0]?.createdAt || product.updatedAt
      }
    })

    // 如果有状态筛选，过滤结果
    let filteredInventory = inventory
    if (status) {
      filteredInventory = inventory.filter(item => item.stockStatus === status)
    }

    return NextResponse.json({
      success: true,
      data: filteredInventory,
      pagination: {
        page,
        pageSize,
        total: status ? filteredInventory.length : total,
        totalPages: Math.ceil((status ? filteredInventory.length : total) / pageSize)
      }
    })
  } catch (error) {
    console.error('获取库存信息失败:', error)
    return NextResponse.json(
      { success: false, message: '获取库存信息失败' },
      { status: 500 }
    )
  }
}

// 库存调整
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { productId, adjustmentType, adjustmentQuantity, reason } = body

    // 检查商品是否存在
    const product = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!product) {
      return NextResponse.json(
        { success: false, message: '商品不存在' },
        { status: 400 }
      )
    }

    let newStock = product.stock
    let movementQuantity = 0

    // 计算新库存和变动数量
    if (adjustmentType === 'set') {
      // 设置为指定数量
      newStock = parseInt(adjustmentQuantity)
      movementQuantity = newStock - product.stock
    } else if (adjustmentType === 'add') {
      // 增加指定数量
      movementQuantity = parseInt(adjustmentQuantity)
      newStock = product.stock + movementQuantity
    } else if (adjustmentType === 'subtract') {
      // 减少指定数量
      movementQuantity = -parseInt(adjustmentQuantity)
      newStock = product.stock + movementQuantity
    }

    // 检查库存不能为负数
    if (newStock < 0) {
      return NextResponse.json(
        { success: false, message: '库存不能为负数' },
        { status: 400 }
      )
    }

    // 更新商品库存
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: { stock: newStock },
      include: {
        category: true
      }
    })

    // 创建库存变动记录
    await prisma.stockMovement.create({
      data: {
        productId,
        type: 'ADJUST',
        quantity: movementQuantity,
        reason: reason || '库存调整'
      }
    })

    return NextResponse.json({
      success: true,
      data: updatedProduct,
      message: '库存调整成功'
    })
  } catch (error) {
    console.error('库存调整失败:', error)
    return NextResponse.json(
      { success: false, message: '库存调整失败' },
      { status: 500 }
    )
  }
} 