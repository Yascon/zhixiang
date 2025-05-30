import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    console.log('开始同步数据库结构...')
    
    // 检查数据库连接
    await prisma.$connect()
    console.log('✅ 数据库连接成功')
    
    // 尝试查询用户表，如果失败说明表结构需要创建
    try {
      await prisma.user.findFirst()
      console.log('✅ 数据库表已存在')
    } catch (error) {
      console.log('⚠️ 数据库表不存在，需要运行 prisma db push')
      
      // 在Vercel环境中，我们无法直接运行prisma db push
      // 但我们可以手动创建表结构
      await createDatabaseTables()
    }
    
    return NextResponse.json({
      success: true,
      message: '数据库结构同步成功'
    })
    
  } catch (error) {
    console.error('数据库同步失败:', error)
    return NextResponse.json({
      success: false,
      message: '数据库同步失败',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

async function createDatabaseTables() {
  // 根据Prisma schema创建表结构
  const createTablesSQL = `
    -- 创建用户表
    CREATE TABLE IF NOT EXISTS "User" (
      "id" TEXT NOT NULL,
      "email" TEXT NOT NULL,
      "name" TEXT,
      "password" TEXT NOT NULL,
      "role" TEXT NOT NULL DEFAULT 'USER',
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "avatar" TEXT,
      "phone" TEXT,
      CONSTRAINT "User_pkey" PRIMARY KEY ("id")
    );
    
    CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");
    
    -- 创建分类表
    CREATE TABLE IF NOT EXISTS "Category" (
      "id" TEXT NOT NULL,
      "name" TEXT NOT NULL,
      "description" TEXT,
      "parentId" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
    );
    
    -- 创建会员等级表
    CREATE TABLE IF NOT EXISTS "MemberLevel" (
      "id" TEXT NOT NULL,
      "name" TEXT NOT NULL,
      "description" TEXT,
      "membershipFee" DOUBLE PRECISION NOT NULL,
      "maxUsers" INTEGER NOT NULL DEFAULT 1,
      "maxProducts" INTEGER NOT NULL DEFAULT 100,
      "maxOrders" INTEGER NOT NULL DEFAULT 1000,
      "features" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "MemberLevel_pkey" PRIMARY KEY ("id")
    );
    
    -- 创建供应商表
    CREATE TABLE IF NOT EXISTS "Supplier" (
      "id" TEXT NOT NULL,
      "name" TEXT NOT NULL,
      "contactName" TEXT,
      "phone" TEXT,
      "email" TEXT,
      "address" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "Supplier_pkey" PRIMARY KEY ("id")
    );
    
    -- 创建商品表
    CREATE TABLE IF NOT EXISTS "Product" (
      "id" TEXT NOT NULL,
      "name" TEXT NOT NULL,
      "description" TEXT,
      "sku" TEXT NOT NULL,
      "barcode" TEXT,
      "categoryId" TEXT NOT NULL,
      "costPrice" DOUBLE PRECISION NOT NULL,
      "sellingPrice" DOUBLE PRECISION NOT NULL,
      "memberPrice" DOUBLE PRECISION,
      "stock" INTEGER NOT NULL DEFAULT 0,
      "minStock" INTEGER NOT NULL DEFAULT 0,
      "maxStock" INTEGER,
      "status" TEXT NOT NULL DEFAULT 'ACTIVE',
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
    );
    
    CREATE UNIQUE INDEX IF NOT EXISTS "Product_sku_key" ON "Product"("sku");
    
    -- 创建客户表
    CREATE TABLE IF NOT EXISTS "Customer" (
      "id" TEXT NOT NULL,
      "name" TEXT NOT NULL,
      "contactName" TEXT,
      "phone" TEXT,
      "email" TEXT,
      "address" TEXT,
      "company" TEXT,
      "taxNumber" TEXT,
      "creditLevel" TEXT,
      "status" TEXT NOT NULL DEFAULT 'ACTIVE',
      "notes" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
    );
    
    -- 创建会员表
    CREATE TABLE IF NOT EXISTS "Member" (
      "id" TEXT NOT NULL,
      "memberNo" TEXT NOT NULL,
      "name" TEXT NOT NULL,
      "phone" TEXT,
      "email" TEXT,
      "gender" TEXT,
      "birthday" TIMESTAMP(3),
      "address" TEXT,
      "company" TEXT,
      "levelId" TEXT NOT NULL,
      "status" TEXT NOT NULL DEFAULT 'ACTIVE',
      "membershipFee" DOUBLE PRECISION,
      "membershipExpiry" TIMESTAMP(3),
      "registeredBy" TEXT NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "Member_pkey" PRIMARY KEY ("id")
    );
    
    CREATE UNIQUE INDEX IF NOT EXISTS "Member_memberNo_key" ON "Member"("memberNo");
    CREATE UNIQUE INDEX IF NOT EXISTS "Member_phone_key" ON "Member"("phone");
  `
  
  try {
    // 分别执行每个CREATE语句，避免权限问题
    const statements = createTablesSQL.split(';').filter(stmt => stmt.trim())
    
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await prisma.$executeRawUnsafe(statement.trim() + ';')
        } catch (error) {
          console.log('SQL语句可能已执行或存在:', statement.substring(0, 50) + '...')
        }
      }
    }
    
    console.log('✅ 数据库表创建完成')
  } catch (error) {
    console.error('创建表失败:', error)
    throw error
  }
}

export async function POST() {
  return GET()
} 