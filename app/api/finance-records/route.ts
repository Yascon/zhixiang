import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// 获取财务记录列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '10')
    const keyword = searchParams.get('keyword') || ''
    const type = searchParams.get('type') || ''
    const category = searchParams.get('category') || ''
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')

    const skip = (page - 1) * pageSize

    // 构建查询条件
    const where: any = {}
    
    if (keyword) {
      where.OR = [
        { description: { contains: keyword } },
        { category: { contains: keyword } }
      ]
    }

    if (type) {
      where.type = type
    }

    if (category) {
      where.category = category
    }

    if (dateFrom && dateTo) {
      where.recordDate = {
        gte: new Date(dateFrom),
        lte: new Date(dateTo)
      }
    }

    const [records, total] = await Promise.all([
      prisma.financeRecord.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { recordDate: 'desc' }
      }),
      prisma.financeRecord.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: records,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    })
  } catch (error) {
    console.error('获取财务记录失败:', error)
    return NextResponse.json(
      { success: false, message: '获取财务记录失败' },
      { status: 500 }
    )
  }
}

// 创建财务记录
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      type, 
      category, 
      amount, 
      description, 
      recordDate, 
      orderId 
    } = body

    const record = await prisma.financeRecord.create({
      data: {
        type,
        category,
        amount: parseFloat(amount),
        description,
        recordDate: recordDate ? new Date(recordDate) : new Date(),
        orderId
      }
    })

    return NextResponse.json({
      success: true,
      data: record,
      message: '财务记录创建成功'
    })
  } catch (error) {
    console.error('创建财务记录失败:', error)
    return NextResponse.json(
      { success: false, message: '创建财务记录失败' },
      { status: 500 }
    )
  }
}

// 更新财务记录
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      id, 
      type, 
      category, 
      amount, 
      description, 
      recordDate, 
      orderId 
    } = body

    // 检查记录是否存在
    const existingRecord = await prisma.financeRecord.findUnique({
      where: { id }
    })

    if (!existingRecord) {
      return NextResponse.json(
        { success: false, message: '财务记录不存在' },
        { status: 404 }
      )
    }

    const record = await prisma.financeRecord.update({
      where: { id },
      data: {
        type,
        category,
        amount: parseFloat(amount),
        description,
        recordDate: recordDate ? new Date(recordDate) : undefined,
        orderId
      }
    })

    return NextResponse.json({
      success: true,
      data: record,
      message: '财务记录更新成功'
    })
  } catch (error) {
    console.error('更新财务记录失败:', error)
    return NextResponse.json(
      { success: false, message: '更新财务记录失败' },
      { status: 500 }
    )
  }
}

// 删除财务记录
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, message: '记录ID不能为空' },
        { status: 400 }
      )
    }

    // 检查记录是否存在
    const existingRecord = await prisma.financeRecord.findUnique({
      where: { id }
    })

    if (!existingRecord) {
      return NextResponse.json(
        { success: false, message: '财务记录不存在' },
        { status: 404 }
      )
    }

    await prisma.financeRecord.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: '财务记录删除成功'
    })
  } catch (error) {
    console.error('删除财务记录失败:', error)
    return NextResponse.json(
      { success: false, message: '删除财务记录失败' },
      { status: 500 }
    )
  }
} 