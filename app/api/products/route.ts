import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// 获取商品列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '10')
    const keyword = searchParams.get('keyword') || ''
    const category = searchParams.get('category') || ''
    const status = searchParams.get('status') || ''

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
    
    if (status) {
      where.status = status
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true
        },
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.product.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: products,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    })
  } catch (error) {
    console.error('获取商品列表失败:', error)
    return NextResponse.json(
      { success: false, message: '获取商品列表失败' },
      { status: 500 }
    )
  }
}

// 创建商品
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      name, 
      description, 
      sku, 
      barcode, 
      categoryId, 
      costPrice, 
      sellingPrice, 
      memberPrice, 
      stock, 
      minStock, 
      maxStock, 
      status 
    } = body

    // 检查SKU是否已存在
    const existingProduct = await prisma.product.findUnique({
      where: { sku }
    })

    if (existingProduct) {
      return NextResponse.json(
        { success: false, message: 'SKU已存在，请使用其他SKU' },
        { status: 400 }
      )
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        sku,
        barcode,
        categoryId,
        costPrice: parseFloat(costPrice),
        sellingPrice: parseFloat(sellingPrice),
        memberPrice: memberPrice ? parseFloat(memberPrice) : null,
        stock: parseInt(stock),
        minStock: parseInt(minStock),
        maxStock: maxStock ? parseInt(maxStock) : null,
        status: status || 'ACTIVE'
      },
      include: {
        category: true
      }
    })

    return NextResponse.json({
      success: true,
      data: product,
      message: '商品创建成功'
    })
  } catch (error) {
    console.error('创建商品失败:', error)
    return NextResponse.json(
      { success: false, message: '创建商品失败' },
      { status: 500 }
    )
  }
}

// 更新商品
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      id,
      name, 
      description, 
      sku, 
      barcode, 
      categoryId, 
      costPrice, 
      sellingPrice, 
      memberPrice, 
      stock, 
      minStock, 
      maxStock, 
      status 
    } = body

    // 检查商品是否存在
    const existingProduct = await prisma.product.findUnique({
      where: { id }
    })

    if (!existingProduct) {
      return NextResponse.json(
        { success: false, message: '商品不存在' },
        { status: 404 }
      )
    }

    // 如果SKU发生变化，检查新SKU是否已存在
    if (sku !== existingProduct.sku) {
      const skuExists = await prisma.product.findUnique({
        where: { sku }
      })

      if (skuExists) {
        return NextResponse.json(
          { success: false, message: 'SKU已存在，请使用其他SKU' },
          { status: 400 }
        )
      }
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        description,
        sku,
        barcode,
        categoryId,
        costPrice: parseFloat(costPrice),
        sellingPrice: parseFloat(sellingPrice),
        memberPrice: memberPrice ? parseFloat(memberPrice) : null,
        stock: parseInt(stock),
        minStock: parseInt(minStock),
        maxStock: maxStock ? parseInt(maxStock) : null,
        status
      },
      include: {
        category: true
      }
    })

    return NextResponse.json({
      success: true,
      data: product,
      message: '商品更新成功'
    })
  } catch (error) {
    console.error('更新商品失败:', error)
    return NextResponse.json(
      { success: false, message: '更新商品失败' },
      { status: 500 }
    )
  }
}

// 删除商品
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, message: '商品ID不能为空' },
        { status: 400 }
      )
    }

    // 检查商品是否存在
    const existingProduct = await prisma.product.findUnique({
      where: { id }
    })

    if (!existingProduct) {
      return NextResponse.json(
        { success: false, message: '商品不存在' },
        { status: 404 }
      )
    }

    // 检查是否有相关的订单项
    const orderItems = await prisma.orderItem.findFirst({
      where: { productId: id }
    })

    if (orderItems) {
      return NextResponse.json(
        { success: false, message: '该商品已有订单记录，无法删除' },
        { status: 400 }
      )
    }

    await prisma.product.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: '商品删除成功'
    })
  } catch (error) {
    console.error('删除商品失败:', error)
    return NextResponse.json(
      { success: false, message: '删除商品失败' },
      { status: 500 }
    )
  }
} 