import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getUserFromRequest } from '@/lib/auth'

const prisma = new PrismaClient()

// 获取会员列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '10')
    const search = searchParams.get('search') || ''

    let where: any = {}
    
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { phone: { contains: search } },
        { email: { contains: search } }
      ]
    }

    const [members, total] = await Promise.all([
      prisma.member.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          level: true
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.member.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: members,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    })
  } catch (error) {
    console.error('获取会员列表失败:', error)
    return NextResponse.json(
      { success: false, message: '获取会员列表失败' },
      { status: 500 }
    )
  }
}

// 创建新会员
export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: '未登录' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, phone, email, levelId } = body

    // 验证必填字段
    if (!name) {
      return NextResponse.json(
        { success: false, message: '会员姓名不能为空' },
        { status: 400 }
      )
    }

    // 检查手机号是否已存在
    if (phone) {
      const existingMember = await prisma.member.findUnique({
        where: { phone }
      })
      
      if (existingMember) {
        return NextResponse.json(
          { success: false, message: '该手机号已被注册' },
          { status: 400 }
        )
      }
    }

    // 生成会员编号
    const memberCount = await prisma.member.count()
    const memberNo = `M${String(memberCount + 1).padStart(6, '0')}`

    // 获取默认会员等级
    let finalLevelId = levelId
    if (!finalLevelId) {
      const defaultLevel = await prisma.memberLevel.findFirst({
        where: { name: '基础会员' }
      })
      
      if (!defaultLevel) {
        // 如果没有基础会员等级，创建一个
        const newLevel = await prisma.memberLevel.create({
          data: {
            name: '基础会员',
            membershipFee: 0,
            maxUsers: 1,
            maxProducts: 50,
            maxOrders: 500,
            description: '免费基础会员等级'
          }
        })
        finalLevelId = newLevel.id
      } else {
        finalLevelId = defaultLevel.id
      }
    }

    // 验证用户是否存在
    const currentUser = await prisma.user.findUnique({
      where: { id: user.userId }
    })

    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: '当前用户不存在' },
        { status: 400 }
      )
    }

    // 计算会员到期时间
    const membershipExpiry = new Date()
    membershipExpiry.setFullYear(membershipExpiry.getFullYear() + 1)

    const member = await prisma.member.create({
      data: {
        memberNo,
        name,
        phone,
        email,
        levelId: finalLevelId,
        status: 'ACTIVE',
        membershipExpiry,
        registeredBy: user.userId
      },
      include: {
        level: true
      }
    })

    return NextResponse.json({
      success: true,
      data: member,
      message: '会员创建成功'
    })
  } catch (error) {
    console.error('创建会员失败:', error)
    return NextResponse.json(
      { success: false, message: '创建会员失败' },
      { status: 500 }
    )
  }
} 