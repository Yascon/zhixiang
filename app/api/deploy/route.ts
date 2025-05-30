import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)
const prisma = new PrismaClient()

export async function GET() {
  try {
    console.log('开始部署数据库...')
    
    // 方法1: 直接创建所有必要的表
    await createAllTables()
    
    console.log('数据库部署完成')
    
    return NextResponse.json({
      success: true,
      message: '数据库部署成功'
    })
    
  } catch (error) {
    console.error('数据库部署失败:', error)
    return NextResponse.json({
      success: false,
      message: '数据库部署失败',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

async function createAllTables() {
  // 创建所有必要的表
  const tables = [
    // Users表
    `CREATE TABLE IF NOT EXISTS "users" (
      "id" TEXT NOT NULL,
      "email" TEXT NOT NULL,
      "name" TEXT,
      "password" TEXT NOT NULL,
      "role" TEXT NOT NULL DEFAULT 'USER',
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "avatar" TEXT,
      "phone" TEXT,
      CONSTRAINT "users_pkey" PRIMARY KEY ("id")
    )`,
    
    // Categories表
    `CREATE TABLE IF NOT EXISTS "categories" (
      "id" TEXT NOT NULL,
      "name" TEXT NOT NULL,
      "description" TEXT,
      "parentId" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
    )`,
    
    // Member Levels表
    `CREATE TABLE IF NOT EXISTS "member_levels" (
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
      CONSTRAINT "member_levels_pkey" PRIMARY KEY ("id")
    )`,
    
    // Suppliers表
    `CREATE TABLE IF NOT EXISTS "suppliers" (
      "id" TEXT NOT NULL,
      "name" TEXT NOT NULL,
      "contactName" TEXT,
      "phone" TEXT,
      "email" TEXT,
      "address" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "suppliers_pkey" PRIMARY KEY ("id")
    )`,
    
    // Products表
    `CREATE TABLE IF NOT EXISTS "products" (
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
      CONSTRAINT "products_pkey" PRIMARY KEY ("id")
    )`,
    
    // Customers表
    `CREATE TABLE IF NOT EXISTS "customers" (
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
      CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
    )`,
    
    // Members表
    `CREATE TABLE IF NOT EXISTS "members" (
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
      CONSTRAINT "members_pkey" PRIMARY KEY ("id")
    )`
  ]
  
  // 执行所有表创建语句
  for (const tableSQL of tables) {
    await prisma.$executeRawUnsafe(tableSQL)
  }
  
  // 创建索引
  const indexes = [
    'CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email")',
    'CREATE UNIQUE INDEX IF NOT EXISTS "products_sku_key" ON "products"("sku")',
    'CREATE UNIQUE INDEX IF NOT EXISTS "members_memberNo_key" ON "members"("memberNo")',
    'CREATE UNIQUE INDEX IF NOT EXISTS "members_phone_key" ON "members"("phone")'
  ]
  
  for (const indexSQL of indexes) {
    try {
      await prisma.$executeRawUnsafe(indexSQL)
    } catch (error) {
      console.log('索引可能已存在:', error)
    }
  }
  
  console.log('✅ 所有表和索引创建完成')
}

export async function POST() {
  return GET() // POST和GET执行相同的操作
} 