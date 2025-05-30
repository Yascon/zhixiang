import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// 获取库存变动记录
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '10')
    const keyword = searchParams.get('keyword') || ''
    const type = searchParams.get('type') || ''
    const orderNo = searchParams.get('orderNo') || ''
    const dateFrom = searchParams.get('dateFrom') || ''
    const dateTo = searchParams.get('dateTo') || ''

    const skip = (page - 1) * pageSize

    // 构建查询条件
    const where: any = {}
    
    if (keyword) {
      where.OR = [
        { product: { name: { contains: keyword } } },
        { product: { sku: { contains: keyword } } }
      ]
    }
    
    if (type) {
      where.type = type
    }
    
    if (orderNo) {
      where.order = { orderNo: { contains: orderNo } }
    }
    
    if (dateFrom || dateTo) {
      where.createdAt = {}
      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom)
      }
      if (dateTo) {
        where.createdAt.lte = new Date(dateTo + 'T23:59:59.999Z')
      }
    }

    const [movements, total] = await Promise.all([
      prisma.stockMovement.findMany({
        where,
        include: {
          product: {
            include: {
              category: true
            }
          }
        },
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.stockMovement.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: movements,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    })
  } catch (error) {
    console.error('获取库存变动记录失败:', error)
    return NextResponse.json(
      { success: false, message: '获取库存变动记录失败' },
      { status: 500 }
    )
  }
}

// 创建库存调整记录
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { productId, type, quantity, reason } = body

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

    // 创建库存变动记录
    const movement = await prisma.stockMovement.create({
      data: {
        productId,
        type,
        quantity: parseInt(quantity),
        reason
      },
      include: {
        product: {
          include: {
            category: true
          }
        }
      }
    })

    // 更新商品库存
    if (type === 'ADJUST') {
      await prisma.product.update({
        where: { id: productId },
        data: {
          stock: {
            increment: parseInt(quantity)
          }
        }
      })
    }

    return NextResponse.json({
      success: true,
      data: movement,
      message: '库存调整成功'
    })
  } catch (error) {
    console.error('创建库存变动记录失败:', error)
    return NextResponse.json(
      { success: false, message: '创建库存变动记录失败' },
      { status: 500 }
    )
  }
} 