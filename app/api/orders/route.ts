import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// 获取订单列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '10')
    const type = searchParams.get('type') || '' // PURCHASE, SALE, RETURN
    const status = searchParams.get('status') || ''
    const keyword = searchParams.get('keyword') || ''
    const dateFrom = searchParams.get('dateFrom') || ''
    const dateTo = searchParams.get('dateTo') || ''

    const skip = (page - 1) * pageSize

    // 构建查询条件
    const where: any = {}
    
    if (type) {
      where.type = type
    }
    
    if (status) {
      where.status = status
    }
    
    if (keyword) {
      where.OR = [
        { orderNo: { contains: keyword } },
        { supplier: { name: { contains: keyword } } },
        { customer: { name: { contains: keyword } } },
        { member: { name: { contains: keyword } } }
      ]
    }
    
    if (dateFrom || dateTo) {
      where.orderDate = {}
      if (dateFrom) {
        where.orderDate.gte = new Date(dateFrom)
      }
      if (dateTo) {
        where.orderDate.lte = new Date(dateTo + 'T23:59:59.999Z')
      }
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          supplier: true,
          customer: true,
          member: true,
          user: true,
          orderItems: {
            include: {
              product: true
            }
          },
          payments: true
        },
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.order.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: orders,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    })
  } catch (error) {
    console.error('获取订单列表失败:', error)
    return NextResponse.json(
      { success: false, message: '获取订单列表失败' },
      { status: 500 }
    )
  }
}

// 创建订单
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      orderNo: providedOrderNo,
      type,
      status,
      supplierId,
      customerId,
      memberId,
      totalAmount,
      paidAmount,
      orderDate,
      userId,
      notes,
      orderItems
    } = body

    // 生成订单号（如果没有提供）
    let orderNo = providedOrderNo
    if (!orderNo) {
      const prefix = type === 'PURCHASE' ? 'PO' : 'SO'
      const timestamp = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14)
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
      orderNo = `${prefix}${timestamp}${random}`
    }

    // 检查订单编号是否已存在
    const existingOrder = await prisma.order.findUnique({
      where: { orderNo }
    })

    if (existingOrder) {
      // 如果自动生成的订单号已存在，重新生成
      if (!providedOrderNo) {
        const prefix = type === 'PURCHASE' ? 'PO' : 'SO'
        const timestamp = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14)
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
        orderNo = `${prefix}${timestamp}${random}`
      } else {
        return NextResponse.json(
          { success: false, message: '订单编号已存在，请使用其他编号' },
          { status: 400 }
        )
      }
    }

    // 验证供应商或客户或会员是否存在
    if (supplierId) {
      const supplier = await prisma.supplier.findUnique({
        where: { id: supplierId }
      })
      if (!supplier) {
        return NextResponse.json(
          { success: false, message: '供应商不存在' },
          { status: 400 }
        )
      }
    }

    if (customerId) {
      const customer = await prisma.customer.findUnique({
        where: { id: customerId }
      })
      if (!customer) {
        return NextResponse.json(
          { success: false, message: '客户不存在' },
          { status: 400 }
        )
      }
    }

    if (memberId) {
      const member = await prisma.member.findUnique({
        where: { id: memberId }
      })
      if (!member) {
        return NextResponse.json(
          { success: false, message: '会员不存在' },
          { status: 400 }
        )
      }
    }

    // 验证用户是否存在，如果没有提供userId则使用默认用户
    let finalUserId = userId
    if (!finalUserId) {
      const defaultUser = await prisma.user.findFirst()
      if (!defaultUser) {
        return NextResponse.json(
          { success: false, message: '系统中没有可用用户，请先创建用户' },
          { status: 400 }
        )
      }
      finalUserId = defaultUser.id
    } else {
      const user = await prisma.user.findUnique({
        where: { id: finalUserId }
      })
      if (!user) {
        return NextResponse.json(
          { success: false, message: '用户不存在' },
          { status: 400 }
        )
      }
    }

    // 创建订单和订单项
    const order = await prisma.order.create({
      data: {
        orderNo,
        type,
        status: status || 'PENDING',
        supplierId: supplierId || null,
        customerId: customerId || null,
        memberId: memberId || null,
        totalAmount: parseFloat(totalAmount),
        paidAmount: parseFloat(paidAmount || 0),
        orderDate: new Date(orderDate),
        userId: finalUserId,
        notes,
        orderItems: {
          create: orderItems?.map((item: any) => ({
            productId: item.productId,
            quantity: parseInt(item.quantity),
            unitPrice: parseFloat(item.unitPrice),
            totalPrice: parseFloat(item.totalPrice)
          })) || []
        }
      },
      include: {
        supplier: true,
        customer: true,
        member: true,
        user: true,
        orderItems: {
          include: {
            product: true
          }
        }
      }
    })

    // 如果是采购订单且状态为已收货，更新库存
    if (type === 'PURCHASE' && status === 'RECEIVED') {
      for (const item of orderItems || []) {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              increment: parseInt(item.quantity)
            }
          }
        })

        // 创建库存变动记录
        await prisma.stockMovement.create({
          data: {
            productId: item.productId,
            type: 'PURCHASE_IN',
            quantity: parseInt(item.quantity),
            reason: `采购入库 - 订单号: ${orderNo}`,
            orderId: order.id
          }
        })
      }
    }

    // 如果是销售订单且状态为已完成，减少库存
    if (type === 'SALE' && status === 'COMPLETED') {
      for (const item of orderItems || []) {
        // 检查库存是否足够
        const product = await prisma.product.findUnique({
          where: { id: item.productId }
        })
        
        if (!product || product.stock < parseInt(item.quantity)) {
          return NextResponse.json(
            { success: false, message: `商品 ${product?.name || '未知'} 库存不足，当前库存: ${product?.stock || 0}，需要: ${item.quantity}` },
            { status: 400 }
          )
        }

        await prisma.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: parseInt(item.quantity)
            }
          }
        })

        // 创建库存变动记录
        await prisma.stockMovement.create({
          data: {
            productId: item.productId,
            type: 'SALE_OUT',
            quantity: parseInt(item.quantity),
            reason: `销售出库 - 订单号: ${orderNo}`,
            orderId: order.id
          }
        })
      }
    }

    // 更新会员积分和消费记录（仅销售订单且状态为已完成）
    if (type === 'SALE' && status === 'COMPLETED' && memberId) {
      // 移除积分相关逻辑，会员只是付费用户，不需要积分
    }

    return NextResponse.json({
      success: true,
      data: order,
      message: '订单创建成功'
    })
  } catch (error) {
    console.error('创建订单失败:', error)
    return NextResponse.json(
      { success: false, message: '创建订单失败' },
      { status: 500 }
    )
  }
}

// 更新订单
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      id,
      orderNo,
      type,
      status,
      supplierId,
      customerId,
      memberId,
      totalAmount,
      paidAmount,
      orderDate,
      notes,
      orderItems
    } = body

    // 检查订单是否存在
    const existingOrder = await prisma.order.findUnique({
      where: { id },
      include: {
        orderItems: true
      }
    })

    if (!existingOrder) {
      return NextResponse.json(
        { success: false, message: '订单不存在' },
        { status: 404 }
      )
    }

    // 如果订单编号发生变化，检查新编号是否已存在
    if (orderNo !== existingOrder.orderNo) {
      const orderNoExists = await prisma.order.findUnique({
        where: { orderNo }
      })

      if (orderNoExists) {
        return NextResponse.json(
          { success: false, message: '订单编号已存在，请使用其他编号' },
          { status: 400 }
        )
      }
    }

    // 检查状态变更是否需要更新库存
    const oldStatus = existingOrder.status
    const newStatus = status

    // 处理库存变动逻辑
    if (oldStatus !== newStatus) {
      // 采购订单状态变更处理
      if (type === 'PURCHASE') {
        // 从非已收货状态变为已收货状态 - 增加库存
        if (oldStatus !== 'RECEIVED' && newStatus === 'RECEIVED') {
          for (const item of existingOrder.orderItems) {
            await prisma.product.update({
              where: { id: item.productId },
              data: {
                stock: {
                  increment: item.quantity
                }
              }
            })

            // 创建库存变动记录
            await prisma.stockMovement.create({
              data: {
                productId: item.productId,
                type: 'PURCHASE_IN',
                quantity: item.quantity,
                reason: `采购入库 - 订单号: ${existingOrder.orderNo}`,
                orderId: id
              }
            })
          }
        }
        // 从已收货状态变为其他状态 - 减少库存（撤销入库）
        else if (oldStatus === 'RECEIVED' && newStatus !== 'RECEIVED') {
          for (const item of existingOrder.orderItems) {
            await prisma.product.update({
              where: { id: item.productId },
              data: {
                stock: {
                  decrement: item.quantity
                }
              }
            })

            // 创建库存变动记录
            await prisma.stockMovement.create({
              data: {
                productId: item.productId,
                type: 'PURCHASE_IN',
                quantity: -item.quantity,
                reason: `撤销采购入库 - 订单号: ${existingOrder.orderNo}`,
                orderId: id
              }
            })
          }
        }
      }
      
      // 销售订单状态变更处理
      if (type === 'SALE') {
        // 从非已完成状态变为已完成状态 - 减少库存
        if (oldStatus !== 'COMPLETED' && newStatus === 'COMPLETED') {
          for (const item of existingOrder.orderItems) {
            // 检查库存是否足够
            const product = await prisma.product.findUnique({
              where: { id: item.productId }
            })
            
            if (!product || product.stock < item.quantity) {
              return NextResponse.json(
                { success: false, message: `商品 ${product?.name || '未知'} 库存不足，无法完成订单` },
                { status: 400 }
              )
            }

            await prisma.product.update({
              where: { id: item.productId },
              data: {
                stock: {
                  decrement: item.quantity
                }
              }
            })

            // 创建库存变动记录
            await prisma.stockMovement.create({
              data: {
                productId: item.productId,
                type: 'SALE_OUT',
                quantity: item.quantity,
                reason: `销售出库 - 订单号: ${existingOrder.orderNo}`,
                orderId: id
              }
            })
          }
        }
        // 从已完成状态变为其他状态 - 增加库存（撤销出库）
        else if (oldStatus === 'COMPLETED' && newStatus !== 'COMPLETED') {
          for (const item of existingOrder.orderItems) {
            await prisma.product.update({
              where: { id: item.productId },
              data: {
                stock: {
                  increment: item.quantity
                }
              }
            })

            // 创建库存变动记录
            await prisma.stockMovement.create({
              data: {
                productId: item.productId,
                type: 'SALE_OUT',
                quantity: -item.quantity,
                reason: `撤销销售出库 - 订单号: ${existingOrder.orderNo}`,
                orderId: id
              }
            })
          }
        }
      }
    }

    // 更新会员积分和消费记录（仅销售订单且状态为已完成）
    if (type === 'SALE' && status === 'COMPLETED' && memberId) {
      // 移除积分相关逻辑，会员只是付费用户，不需要积分
    }

    // 更新订单
    const order = await prisma.order.update({
      where: { id },
      data: {
        orderNo,
        type,
        status,
        supplierId: supplierId || null,
        customerId: customerId || null,
        memberId: memberId || null,
        totalAmount: parseFloat(totalAmount),
        paidAmount: parseFloat(paidAmount || 0),
        orderDate: new Date(orderDate),
        notes
      },
      include: {
        supplier: true,
        customer: true,
        member: true,
        user: true,
        orderItems: {
          include: {
            product: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: order,
      message: '订单更新成功'
    })
  } catch (error) {
    console.error('更新订单失败:', error)
    return NextResponse.json(
      { success: false, message: '更新订单失败' },
      { status: 500 }
    )
  }
}

// 删除订单
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, message: '订单ID不能为空' },
        { status: 400 }
      )
    }

    // 检查订单是否存在
    const existingOrder = await prisma.order.findUnique({
      where: { id },
      include: {
        orderItems: true,
        payments: true
      }
    })

    if (!existingOrder) {
      return NextResponse.json(
        { success: false, message: '订单不存在' },
        { status: 404 }
      )
    }

    // 检查订单状态，已完成的订单不能删除
    if (existingOrder.status === 'COMPLETED' || existingOrder.status === 'RECEIVED') {
      return NextResponse.json(
        { success: false, message: '已完成的订单无法删除' },
        { status: 400 }
      )
    }

    // 检查是否有关联的客户订单
    const customerOrderCount = await prisma.order.count({
      where: { customerId: id }
    })

    // 删除相关的库存变动记录
    await prisma.stockMovement.deleteMany({
      where: { orderId: id }
    })

    // 删除订单（订单项会因为级联删除自动删除）
    await prisma.order.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: '订单删除成功'
    })
  } catch (error) {
    console.error('删除订单失败:', error)
    return NextResponse.json(
      { success: false, message: '删除订单失败' },
      { status: 500 }
    )
  }
} 