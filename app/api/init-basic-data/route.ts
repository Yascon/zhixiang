import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    console.log('开始初始化基础数据...');
    
    // 1. 创建默认会员等级
    const existingLevels = await prisma.memberLevel.count();
    if (existingLevels === 0) {
      await prisma.memberLevel.createMany({
        data: [
          {
            name: '普通会员',
            description: '基础会员权益',
            membershipFee: 0,
            maxUsers: 1,
            maxProducts: 100,
            maxOrders: 1000,
            features: '基础会员权益'
          },
          {
            name: '银卡会员',
            description: '5%折扣，生日优惠',
            membershipFee: 299,
            maxUsers: 3,
            maxProducts: 200,
            maxOrders: 2000,
            features: '5%折扣，生日优惠'
          },
          {
            name: '金卡会员',
            description: '10%折扣，生日优惠，专属客服',
            membershipFee: 599,
            maxUsers: 5,
            maxProducts: 500,
            maxOrders: 5000,
            features: '10%折扣，生日优惠，专属客服'
          },
          {
            name: '钻石会员',
            description: '15%折扣，生日优惠，专属客服，优先配送',
            membershipFee: 1299,
            maxUsers: 10,
            maxProducts: 1000,
            maxOrders: 10000,
            features: '15%折扣，生日优惠，专属客服，优先配送'
          }
        ]
      });
      console.log('会员等级创建成功');
    }
    
    // 2. 创建默认管理员用户（如果不存在）
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });
    
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await prisma.user.create({
        data: {
          email: 'admin@zhixiang.com',
          password: hashedPassword,
          name: '系统管理员',
          role: 'ADMIN'
        }
      });
      console.log('默认管理员用户创建成功');
    }
    
    // 3. 创建默认商品分类
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
      console.log('默认商品分类创建成功');
    }
    
    return NextResponse.json({
      success: true,
      message: '基础数据初始化成功',
      data: {
        memberLevels: await prisma.memberLevel.count(),
        users: await prisma.user.count(),
        categories: await prisma.category.count()
      }
    });
    
  } catch (error: any) {
    console.error('基础数据初始化失败:', error);
    
    return NextResponse.json({
      success: false,
      message: '基础数据初始化失败',
      error: error.message
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // 检查数据库状态
    const stats = {
      memberLevels: await prisma.memberLevel.count(),
      users: await prisma.user.count(),
      categories: await prisma.category.count(),
      products: await prisma.product.count(),
      orders: await prisma.order.count()
    };
    
    return NextResponse.json({
      message: '数据库状态检查',
      stats,
      initialized: stats.memberLevels > 0 && stats.users > 0 && stats.categories > 0
    });
    
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: '数据库连接失败',
      error: error.message
    }, { status: 500 });
  }
} 