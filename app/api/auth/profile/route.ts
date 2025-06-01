import { NextRequest, NextResponse } from 'next/server'
// import { PrismaClient } from '@prisma/client'
import prisma from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'

// const prisma = new PrismaClient()

// 获取当前用户信息
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Profile API - Received request');
    console.log('🔍 Profile API - JWT_SECRET (first 5 chars):', process.env.JWT_SECRET ? process.env.JWT_SECRET.substring(0, 5) + '...' : 'undefined/empty');
    const authHeader = request.headers.get('authorization');
    console.log('🔍 Profile API - Authorization header:', authHeader ? authHeader.substring(0, 15) + '...' : 'null'); // Log a portion or null
    
    const user = await getUserFromRequest(request); // Added await
    console.log('🔍 Profile API - User from getUserFromRequest:', user ? { id: user.id, email: user.email } : null);
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: '未登录或Token无效' }, // More specific message
        { status: 401 }
      );
    }

    // user object from getUserFromRequest is already the full Prisma user object if found
    // So, we can directly return the necessary fields or the whole user object as needed
    // For security, only return fields that the client needs.
    const userInfo = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      phone: user.phone,
      avatar: user.avatar,
      createdAt: user.createdAt
    };

    return NextResponse.json({
      success: true,
      data: userInfo
    });
  } catch (error) {
    console.error('获取用户信息失败:', error)
    return NextResponse.json(
      { success: false, message: '获取用户信息失败' },
      { status: 500 }
    )
  }
}

// 更新用户信息
export async function PUT(request: NextRequest) {
  try {
    console.log('🔍 Profile API (PUT) - Received request');
    const authHeader = request.headers.get('authorization');
    console.log('🔍 Profile API (PUT) - Authorization header:', authHeader ? authHeader.substring(0, 15) + '...' : 'null');

    const user = await getUserFromRequest(request); // Added await
    console.log('🔍 Profile API (PUT) - User from getUserFromRequest:', user ? { id: user.id, email: user.email } : null);
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: '未登录或Token无效' }, // More specific message
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, phone, avatar } = body;

    // 验证数据
    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: '姓名不能为空' },
        { status: 400 }
      );
    }

    // 构建更新数据
    const updateData: any = { name };
    if (phone !== undefined) updateData.phone = phone;
    if (avatar !== undefined) updateData.avatar = avatar;

    // 更新用户信息
    const updatedUser = await prisma.user.update({
      where: { id: user.id }, // Use user.id directly
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        avatar: true,
        createdAt: true
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: '个人信息更新成功'
    });
  } catch (error) {
    console.error('更新用户信息失败:', error)
    return NextResponse.json(
      { success: false, message: '更新用户信息失败' },
      { status: 500 }
    )
  }
} 