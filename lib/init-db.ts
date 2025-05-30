import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function initializeDatabase() {
  try {
    // 检查是否已经初始化
    const userCount = await prisma.user.count()
    const levelCount = await prisma.memberLevel.count()

    if (userCount === 0) {
      // 创建默认管理员用户
      await prisma.user.create({
        data: {
          id: 'default-admin',
          email: 'admin@example.com',
          name: '系统管理员',
          password: 'admin123', // 实际应用中应该加密
          role: 'ADMIN'
        }
      })
      console.log('✅ 默认管理员用户创建成功')
    }

    if (levelCount === 0) {
      // 创建默认会员等级
      const levels = [
        {
          name: '普通会员',
          description: '注册即可成为普通会员',
          membershipFee: 0
        },
        {
          name: 'VIP会员',
          description: 'VIP会员享受更多优惠',
          membershipFee: 299
        },
        {
          name: 'SVIP会员',
          description: 'SVIP会员享受最高优惠',
          membershipFee: 599
        }
      ]

      for (const level of levels) {
        await prisma.memberLevel.create({
          data: level
        })
      }
      console.log('✅ 默认会员等级创建成功')
    }

    console.log('✅ 数据库初始化完成')
  } catch (error) {
    console.error('❌ 数据库初始化失败:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
} 