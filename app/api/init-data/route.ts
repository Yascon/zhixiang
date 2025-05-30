import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    console.log('开始初始化生产环境数据...')

    // 1. 创建默认管理员用户
    const existingAdmin = await prisma.user.findFirst({
      where: { email: 'admin@example.com' }
    })

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('admin123', 10)
      const admin = await prisma.user.create({
        data: {
          email: 'admin@example.com',
          password: hashedPassword,
          name: '系统管理员',
          role: 'ADMIN'
        }
      })
      console.log('✅ 创建默认管理员用户:', admin.email)
    }

    // 2. 创建默认会员等级
    const existingLevel = await prisma.memberLevel.findFirst({
      where: { name: '基础会员' }
    })

    if (!existingLevel) {
      await prisma.memberLevel.create({
        data: {
          name: '基础会员',
          membershipFee: 0,
          maxUsers: 1,
          maxProducts: 50,
          maxOrders: 500,
          description: '免费基础会员等级'
        }
      })

      await prisma.memberLevel.create({
        data: {
          name: 'VIP会员',
          membershipFee: 299,
          maxUsers: 3,
          maxProducts: 200,
          maxOrders: 2000,
          description: 'VIP会员等级，享受更多权益'
        }
      })

      await prisma.memberLevel.create({
        data: {
          name: '企业会员',
          membershipFee: 999,
          maxUsers: 10,
          maxProducts: 1000,
          maxOrders: 10000,
          description: '企业级会员，无限制使用'
        }
      })
      console.log('✅ 创建默认会员等级')
    }

    // 3. 创建默认商品分类
    const existingCategory = await prisma.category.findFirst()
    if (!existingCategory) {
      await prisma.category.createMany({
        data: [
          { name: '电子产品', description: '手机、电脑、数码产品等' },
          { name: '服装鞋帽', description: '男装、女装、童装、鞋类等' },
          { name: '食品饮料', description: '零食、饮料、生鲜食品等' },
          { name: '家居用品', description: '家具、装饰、日用品等' },
          { name: '图书文具', description: '图书、文具、办公用品等' }
        ]
      })
      console.log('✅ 创建默认商品分类')
    }

    // 4. 创建默认供应商
    const existingSupplier = await prisma.supplier.findFirst()
    if (!existingSupplier) {
      await prisma.supplier.createMany({
        data: [
          {
            name: '华为科技有限公司',
            contactName: '张经理',
            phone: '13800138001',
            email: 'zhang@huawei.com',
            address: '深圳市南山区华为总部'
          },
          {
            name: '小米科技有限公司',
            contactName: '李经理',
            phone: '13800138002',
            email: 'li@xiaomi.com',
            address: '北京市海淀区小米科技园'
          }
        ]
      })
      console.log('✅ 创建默认供应商')
    }

    return NextResponse.json({
      success: true,
      message: '生产环境数据初始化成功',
      data: {
        adminEmail: 'admin@example.com',
        adminPassword: 'admin123'
      }
    })
  } catch (error) {
    console.error('数据初始化失败:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: '数据初始化失败',
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
} 