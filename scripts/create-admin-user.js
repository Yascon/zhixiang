const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createAdminUser() {
  try {
    console.log('🔧 开始创建管理员用户...\n')

    // 检查是否已存在管理员用户
    const existingAdmin = await prisma.user.findFirst({
      where: { email: 'admin@example.com' }
    })

    if (existingAdmin) {
      console.log('ℹ️  管理员用户已存在')
      console.log('   邮箱: admin@example.com')
      console.log('   密码: admin123')
      return
    }

    // 创建管理员用户
    const adminUser = await prisma.user.create({
      data: {
        name: '系统管理员',
        email: 'admin@example.com',
        password: 'admin123', // 实际应用中应该使用bcrypt加密
        role: 'ADMIN',
        phone: '13800138001'
      }
    })

    console.log('✅ 管理员用户创建成功！')
    console.log('   ID:', adminUser.id)
    console.log('   姓名:', adminUser.name)
    console.log('   邮箱:', adminUser.email)
    console.log('   密码: admin123')
    console.log('   角色:', adminUser.role)

    // 创建测试普通用户
    const existingUser = await prisma.user.findFirst({
      where: { email: 'user@example.com' }
    })

    if (!existingUser) {
      const testUser = await prisma.user.create({
        data: {
          name: '测试用户',
          email: 'user@example.com',
          password: 'user123',
          role: 'USER',
          phone: '13800138002'
        }
      })

      console.log('\n✅ 测试用户创建成功！')
      console.log('   ID:', testUser.id)
      console.log('   姓名:', testUser.name)
      console.log('   邮箱:', testUser.email)
      console.log('   密码: user123')
      console.log('   角色:', testUser.role)
    } else {
      console.log('\nℹ️  测试用户已存在')
      console.log('   邮箱: user@example.com')
      console.log('   密码: user123')
    }

    console.log('\n🎉 用户创建完成！')
    console.log('\n📝 登录信息:')
    console.log('管理员登录: admin@example.com / admin123')
    console.log('普通用户登录: user@example.com / user123')

  } catch (error) {
    console.error('❌ 创建用户失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdminUser() 