const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 开始初始化Vercel数据库...');
  
  try {
    // 1. 创建默认会员等级
    console.log('📊 创建会员等级...');
    const existingLevels = await prisma.memberLevel.count();
    if (existingLevels === 0) {
      await prisma.memberLevel.createMany({
        data: [
          {
            name: '普通会员',
            discount: 0,
            minSpent: 0,
            benefits: '基础会员权益'
          },
          {
            name: '银卡会员',
            discount: 5,
            minSpent: 1000,
            benefits: '5%折扣，生日优惠'
          },
          {
            name: '金卡会员',
            discount: 10,
            minSpent: 5000,
            benefits: '10%折扣，生日优惠，专属客服'
          },
          {
            name: '钻石会员',
            discount: 15,
            minSpent: 10000,
            benefits: '15%折扣，生日优惠，专属客服，优先配送'
          }
        ]
      });
      console.log('✅ 会员等级创建成功');
    }

    // 2. 创建默认管理员用户
    console.log('👤 创建管理员用户...');
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });
    
    if (!existingAdmin) {
      const adminUser = await prisma.user.create({
        data: {
          name: '系统管理员',
          email: 'admin@example.com',
          password: await bcrypt.hash('admin123', 10),
          role: 'ADMIN',
          phone: '13800138001'
        }
      });
      console.log('✅ 管理员用户创建成功');
    }

    // 3. 创建默认商品分类
    console.log('📦 创建商品分类...');
    const existingCategories = await prisma.category.count();
    if (existingCategories === 0) {
      await prisma.category.createMany({
        data: [
          { name: '电子产品', description: '手机、电脑、数码配件等' },
          { name: '服装鞋帽', description: '男装、女装、童装、鞋类等' },
          { name: '食品饮料', description: '零食、饮料、生鲜食品等' },
          { name: '家居用品', description: '家具、装饰品、日用品等' },
          { name: '图书文具', description: '图书、文具、办公用品等' }
        ]
      });
      console.log('✅ 商品分类创建成功');
    }

    // 4. 验证数据库状态
    const stats = {
      memberLevels: await prisma.memberLevel.count(),
      users: await prisma.user.count(),
      categories: await prisma.category.count()
    };
    
    console.log('📈 数据库状态:', stats);
    console.log('🎉 数据库初始化完成！');
    
  } catch (error) {
    console.error('❌ 数据库初始化失败:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  }); 