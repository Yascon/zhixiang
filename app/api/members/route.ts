import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

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
    const body = await request.json()
    const { name, phone, email, levelId } = body

    // 检查手机号是否已存在
    if (phone) {
      const existingMember = await prisma.member.findUnique({
        where: { phone }
      })

      if (existingMember) {
        return NextResponse.json(
          { success: false, message: '手机号已存在' },
          { status: 400 }
        )
      }
    }

    // 验证会员等级是否存在
    const memberLevel = await prisma.memberLevel.findUnique({
      where: { id: levelId }
    })
    
    let finalLevelId = levelId
    if (!memberLevel) {
      // 如果指定的等级不存在，创建默认等级或使用第一个等级
      let defaultLevel = await prisma.memberLevel.findFirst()
      if (!defaultLevel) {
        // 创建默认会员等级
        defaultLevel = await prisma.memberLevel.create({
          data: {
            name: '普通会员',
            description: '默认会员等级',
            membershipFee: 0
          }
        })
      }
      finalLevelId = defaultLevel.id
    }

    // 生成会员编号
    const memberCount = await prisma.member.count()
    const memberNo = `M${String(memberCount + 1).padStart(6, '0')}`

    // 获取默认用户ID（临时使用，后续会实现用户权限系统）
    let defaultUserId = 'default-user'
    const existingUser = await prisma.user.findFirst()
    if (existingUser) {
      defaultUserId = existingUser.id
    } else {
      // 创建默认用户
      const defaultUser = await prisma.user.create({
        data: {
          email: 'admin@example.com',
          password: 'admin123',
          role: 'ADMIN',
          name: '系统管理员'
        }
      })
      defaultUserId = defaultUser.id
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
        registeredBy: defaultUserId
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