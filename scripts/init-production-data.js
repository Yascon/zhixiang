const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function initProductionData() {
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
    } else {
      console.log('✅ 管理员用户已存在')
    }

    // 2. 创建默认会员等级
    const existingLevel = await prisma.memberLevel.findFirst({
      where: { isDefault: true }
    })

    if (!existingLevel) {
      const defaultLevel = await prisma.memberLevel.create({
        data: {
          name: '普通会员',
          discount: 0.95,
          pointsRatio: 1,
          isDefault: true,
          description: '默认会员等级，享受5%折扣'
        }
      })
      console.log('✅ 创建默认会员等级:', defaultLevel.name)

      // 创建VIP会员等级
      const vipLevel = await prisma.memberLevel.create({
        data: {
          name: 'VIP会员',
          discount: 0.9,
          pointsRatio: 2,
          isDefault: false,
          description: 'VIP会员等级，享受10%折扣，双倍积分'
        }
      })
      console.log('✅ 创建VIP会员等级:', vipLevel.name)
    } else {
      console.log('✅ 会员等级已存在')
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
        console.log('✅ 创建商品分类:', category.name)
      }
    } else {
      console.log('✅ 商品分类已存在')
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
        console.log('✅ 创建供应商:', supplier.name)
      }
    } else {
      console.log('✅ 供应商已存在')
    }

    console.log('🎉 生产环境数据初始化完成！')
    console.log('')
    console.log('默认登录信息：')
    console.log('邮箱: admin@example.com')
    console.log('密码: admin123')

  } catch (error) {
    console.error('❌ 初始化失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

initProductionData() 