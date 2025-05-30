import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    console.log('开始数据库迁移...')
    
    // 执行数据库推送（创建表结构）
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "name" TEXT,
        "password" TEXT NOT NULL,
        "role" TEXT NOT NULL DEFAULT 'USER',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        "avatar" TEXT,
        "phone" TEXT,
        CONSTRAINT "users_pkey" PRIMARY KEY ("id")
      );
    `
    
    await prisma.$executeRaw`
      CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email");
    `
    
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "categories" (
        "id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "description" TEXT,
        "parentId" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
      );
    `
    
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "member_levels" (
        "id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "description" TEXT,
        "membershipFee" DOUBLE PRECISION NOT NULL,
        "maxUsers" INTEGER NOT NULL DEFAULT 1,
        "maxProducts" INTEGER NOT NULL DEFAULT 100,
        "maxOrders" INTEGER NOT NULL DEFAULT 1000,
        "features" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "member_levels_pkey" PRIMARY KEY ("id")
      );
    `
    
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "suppliers" (
        "id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "contactName" TEXT,
        "phone" TEXT,
        "email" TEXT,
        "address" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "suppliers_pkey" PRIMARY KEY ("id")
      );
    `
    
    console.log('数据库迁移完成')
    
    return NextResponse.json({
      success: true,
      message: '数据库迁移成功'
    })
    
  } catch (error) {
    console.error('数据库迁移失败:', error)
    return NextResponse.json({
      success: false,
      message: '数据库迁移失败',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

export async function POST() {
  return GET() // POST和GET执行相同的操作
} 