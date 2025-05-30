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
      where: { isDefault: true }
    })

    if (!existingLevel) {
      await prisma.memberLevel.create({
        data: {
          name: '普通会员',
          discount: 0.95,
          pointsRatio: 1,
          isDefault: true,
          description: '默认会员等级，享受5%折扣'
        }
      })

      await prisma.memberLevel.create({
        data: {
          name: 'VIP会员',
          discount: 0.9,
          pointsRatio: 2,
          isDefault: false,
          description: 'VIP会员等级，享受10%折扣，双倍积分'
        }
      })
    }

    // 3. 创建默认商品分类
    const existingCategory = await prisma.category.findFirst()
    if (!existingCategory) {
      const categories = [
        { name: '电子产品', description: '手机、电脑、数码产品等' },
        { name: '服装鞋帽', description: '男装、女装、鞋子、配饰等' },
        { name: '食品饮料', description: '零食、饮料、生鲜食品等' },
        { name: '家居用品', description: '家具、装饰、日用品等' },
        { name: '图书文具', description: '图书、文具、办公用品等' }
      ]

      for (const category of categories) {
        await prisma.category.create({ data: category })
      }
    }

    // 4. 创建示例供应商
    const existingSupplier = await prisma.supplier.findFirst()
    if (!existingSupplier) {
      const suppliers = [
        {
          name: '华为技术有限公司',
          contactName: '张经理',
          phone: '13800138001',
          email: 'zhang@huawei.com',
          address: '深圳市龙岗区华为基地'
        },
        {
          name: '小米科技有限公司',
          contactName: '李经理',
          phone: '13800138002',
          email: 'li@xiaomi.com',
          address: '北京市海淀区小米科技园'
        }
      ]

      for (const supplier of suppliers) {
        await prisma.supplier.create({ data: supplier })
      }
    }

    return NextResponse.json({
      success: true,
      message: '数据初始化完成',
      data: {
        adminEmail: 'admin@example.com',
        adminPassword: 'admin123'
      }
    })

  } catch (error) {
    console.error('❌ 初始化失败:', error)
    return NextResponse.json(
      { success: false, message: '数据初始化失败', error: String(error) },
      { status: 500 }
    )
  }
} 