import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// 获取供应商列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '10')
    const keyword = searchParams.get('keyword') || ''

    const skip = (page - 1) * pageSize

    // 构建查询条件
    const where: any = {}
    
    if (keyword) {
      where.OR = [
        { name: { contains: keyword } },
        { contactName: { contains: keyword } },
        { phone: { contains: keyword } }
      ]
    }

    const [suppliers, total] = await Promise.all([
      prisma.supplier.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.supplier.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: suppliers,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    })
  } catch (error) {
    console.error('获取供应商列表失败:', error)
    return NextResponse.json(
      { success: false, message: '获取供应商列表失败' },
      { status: 500 }
    )
  }
}

// 创建供应商
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, contactName, phone, email, address } = body

    // 检查供应商名称是否已存在
    const existingSupplier = await prisma.supplier.findFirst({
      where: { name }
    })

    if (existingSupplier) {
      return NextResponse.json(
        { success: false, message: '供应商名称已存在' },
        { status: 400 }
      )
    }

    const supplier = await prisma.supplier.create({
      data: {
        name,
        contactName,
        phone,
        email,
        address
      }
    })

    return NextResponse.json({
      success: true,
      data: supplier,
      message: '供应商创建成功'
    })
  } catch (error) {
    console.error('创建供应商失败:', error)
    return NextResponse.json(
      { success: false, message: '创建供应商失败' },
      { status: 500 }
    )
  }
}

// 更新供应商
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, contactName, phone, email, address } = body

    // 检查供应商是否存在
    const existingSupplier = await prisma.supplier.findUnique({
      where: { id }
    })

    if (!existingSupplier) {
      return NextResponse.json(
        { success: false, message: '供应商不存在' },
        { status: 404 }
      )
    }

    // 如果名称发生变化，检查新名称是否已存在
    if (name !== existingSupplier.name) {
      const nameExists = await prisma.supplier.findFirst({
        where: { name }
      })

      if (nameExists) {
        return NextResponse.json(
          { success: false, message: '供应商名称已存在' },
          { status: 400 }
        )
      }
    }

    const supplier = await prisma.supplier.update({
      where: { id },
      data: {
        name,
        contactName,
        phone,
        email,
        address
      }
    })

    return NextResponse.json({
      success: true,
      data: supplier,
      message: '供应商更新成功'
    })
  } catch (error) {
    console.error('更新供应商失败:', error)
    return NextResponse.json(
      { success: false, message: '更新供应商失败' },
      { status: 500 }
    )
  }
}

// 删除供应商
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, message: '供应商ID不能为空' },
        { status: 400 }
      )
    }

    // 检查供应商是否存在
    const existingSupplier = await prisma.supplier.findUnique({
      where: { id }
    })

    if (!existingSupplier) {
      return NextResponse.json(
        { success: false, message: '供应商不存在' },
        { status: 404 }
      )
    }

    // 检查是否有相关的订单
    const orders = await prisma.order.findFirst({
      where: { supplierId: id }
    })

    if (orders) {
      return NextResponse.json(
        { success: false, message: '该供应商已有订单记录，无法删除' },
        { status: 400 }
      )
    }

    await prisma.supplier.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: '供应商删除成功'
    })
  } catch (error) {
    console.error('删除供应商失败:', error)
    return NextResponse.json(
      { success: false, message: '删除供应商失败' },
      { status: 500 }
    )
  }
} 