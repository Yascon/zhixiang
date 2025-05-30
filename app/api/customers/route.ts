import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// 获取客户列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '10')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''

    const skip = (page - 1) * pageSize

    // 构建查询条件
    const where: any = {}
    
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { contactName: { contains: search } },
        { phone: { contains: search } },
        { email: { contains: search } },
        { company: { contains: search } }
      ]
    }
    
    if (status) {
      where.status = status
    }

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.customer.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: customers,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    })
  } catch (error) {
    console.error('获取客户列表失败:', error)
    return NextResponse.json(
      { success: false, message: '获取客户列表失败' },
      { status: 500 }
    )
  }
}

// 创建客户
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      name,
      contactName,
      phone,
      email,
      address,
      company,
      taxNumber,
      creditLevel,
      status,
      notes
    } = body

    // 验证必填字段
    if (!name) {
      return NextResponse.json(
        { success: false, message: '客户名称不能为空' },
        { status: 400 }
      )
    }

    // 检查手机号是否已存在
    if (phone) {
      const existingCustomer = await prisma.customer.findFirst({
        where: { phone }
      })
      if (existingCustomer) {
        return NextResponse.json(
          { success: false, message: '该手机号已存在' },
          { status: 400 }
        )
      }
    }

    // 检查邮箱是否已存在
    if (email) {
      const existingCustomer = await prisma.customer.findFirst({
        where: { email }
      })
      if (existingCustomer) {
        return NextResponse.json(
          { success: false, message: '该邮箱已存在' },
          { status: 400 }
        )
      }
    }

    const customer = await prisma.customer.create({
      data: {
        name,
        contactName,
        phone,
        email,
        address,
        company,
        taxNumber,
        creditLevel,
        status: status || 'ACTIVE',
        notes
      }
    })

    return NextResponse.json({
      success: true,
      data: customer,
      message: '客户创建成功'
    })
  } catch (error) {
    console.error('创建客户失败:', error)
    return NextResponse.json(
      { success: false, message: '创建客户失败' },
      { status: 500 }
    )
  }
}

// 更新客户
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      id,
      name,
      contactName,
      phone,
      email,
      address,
      company,
      taxNumber,
      creditLevel,
      status,
      notes
    } = body

    if (!id) {
      return NextResponse.json(
        { success: false, message: '客户ID不能为空' },
        { status: 400 }
      )
    }

    // 验证必填字段
    if (!name) {
      return NextResponse.json(
        { success: false, message: '客户名称不能为空' },
        { status: 400 }
      )
    }

    // 检查客户是否存在
    const existingCustomer = await prisma.customer.findUnique({
      where: { id }
    })
    if (!existingCustomer) {
      return NextResponse.json(
        { success: false, message: '客户不存在' },
        { status: 404 }
      )
    }

    // 检查手机号是否已被其他客户使用
    if (phone) {
      const phoneExists = await prisma.customer.findFirst({
        where: { 
          phone,
          id: { not: id }
        }
      })
      if (phoneExists) {
        return NextResponse.json(
          { success: false, message: '该手机号已被其他客户使用' },
          { status: 400 }
        )
      }
    }

    // 检查邮箱是否已被其他客户使用
    if (email) {
      const emailExists = await prisma.customer.findFirst({
        where: { 
          email,
          id: { not: id }
        }
      })
      if (emailExists) {
        return NextResponse.json(
          { success: false, message: '该邮箱已被其他客户使用' },
          { status: 400 }
        )
      }
    }

    const customer = await prisma.customer.update({
      where: { id },
      data: {
        name,
        contactName,
        phone,
        email,
        address,
        company,
        taxNumber,
        creditLevel,
        status,
        notes
      }
    })

    return NextResponse.json({
      success: true,
      data: customer,
      message: '客户更新成功'
    })
  } catch (error) {
    console.error('更新客户失败:', error)
    return NextResponse.json(
      { success: false, message: '更新客户失败' },
      { status: 500 }
    )
  }
}

// 删除客户
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, message: '客户ID不能为空' },
        { status: 400 }
      )
    }

    // 检查客户是否存在
    const existingCustomer = await prisma.customer.findUnique({
      where: { id }
    })
    if (!existingCustomer) {
      return NextResponse.json(
        { success: false, message: '客户不存在' },
        { status: 404 }
      )
    }

    // 检查是否有关联的订单
    const orderCount = await prisma.order.count({
      where: { customerId: id }
    })
    if (orderCount > 0) {
      return NextResponse.json(
        { success: false, message: '该客户有关联的订单，无法删除' },
        { status: 400 }
      )
    }

    await prisma.customer.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: '客户删除成功'
    })
  } catch (error) {
    console.error('删除客户失败:', error)
    return NextResponse.json(
      { success: false, message: '删除客户失败' },
      { status: 500 }
    )
  }
} 