import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// 获取分类列表
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        parent: true,
        children: {
          include: {
            children: true
          }
        },
        _count: {
          select: {
            products: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      data: categories
    })
  } catch (error) {
    console.error('获取分类列表失败:', error)
    return NextResponse.json(
      { success: false, message: '获取分类列表失败' },
      { status: 500 }
    )
  }
}

// 创建分类
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, parentId } = body

    // 检查分类名称是否已存在（在同一父级下）
    const existingCategory = await prisma.category.findFirst({
      where: {
        name,
        parentId: parentId || null
      }
    })

    if (existingCategory) {
      return NextResponse.json(
        { success: false, message: '该分类名称已存在' },
        { status: 400 }
      )
    }

    // 如果有父级分类，检查父级分类是否存在
    if (parentId) {
      const parentCategory = await prisma.category.findUnique({
        where: { id: parentId }
      })

      if (!parentCategory) {
        return NextResponse.json(
          { success: false, message: '父级分类不存在' },
          { status: 400 }
        )
      }
    }

    const category = await prisma.category.create({
      data: {
        name,
        description,
        parentId: parentId || null
      },
      include: {
        parent: true,
        children: true
      }
    })

    return NextResponse.json({
      success: true,
      data: category,
      message: '分类创建成功'
    })
  } catch (error) {
    console.error('创建分类失败:', error)
    return NextResponse.json(
      { success: false, message: '创建分类失败' },
      { status: 500 }
    )
  }
}

// 更新分类
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, description, parentId } = body

    // 检查分类是否存在
    const existingCategory = await prisma.category.findUnique({
      where: { id }
    })

    if (!existingCategory) {
      return NextResponse.json(
        { success: false, message: '分类不存在' },
        { status: 404 }
      )
    }

    // 检查分类名称是否已存在（在同一父级下，排除自己）
    const duplicateCategory = await prisma.category.findFirst({
      where: {
        name,
        parentId: parentId || null,
        id: { not: id }
      }
    })

    if (duplicateCategory) {
      return NextResponse.json(
        { success: false, message: '该分类名称已存在' },
        { status: 400 }
      )
    }

    // 如果有父级分类，检查父级分类是否存在，并且不能设置自己为父级
    if (parentId) {
      if (parentId === id) {
        return NextResponse.json(
          { success: false, message: '不能将自己设置为父级分类' },
          { status: 400 }
        )
      }

      const parentCategory = await prisma.category.findUnique({
        where: { id: parentId }
      })

      if (!parentCategory) {
        return NextResponse.json(
          { success: false, message: '父级分类不存在' },
          { status: 400 }
        )
      }
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        name,
        description,
        parentId: parentId || null
      },
      include: {
        parent: true,
        children: true
      }
    })

    return NextResponse.json({
      success: true,
      data: category,
      message: '分类更新成功'
    })
  } catch (error) {
    console.error('更新分类失败:', error)
    return NextResponse.json(
      { success: false, message: '更新分类失败' },
      { status: 500 }
    )
  }
}

// 删除分类
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, message: '分类ID不能为空' },
        { status: 400 }
      )
    }

    // 检查分类是否存在
    const existingCategory = await prisma.category.findUnique({
      where: { id },
      include: {
        children: true,
        products: true
      }
    })

    if (!existingCategory) {
      return NextResponse.json(
        { success: false, message: '分类不存在' },
        { status: 404 }
      )
    }

    // 检查是否有子分类
    if (existingCategory.children.length > 0) {
      return NextResponse.json(
        { success: false, message: '该分类下还有子分类，无法删除' },
        { status: 400 }
      )
    }

    // 检查是否有商品使用该分类
    if (existingCategory.products.length > 0) {
      return NextResponse.json(
        { success: false, message: '该分类下还有商品，无法删除' },
        { status: 400 }
      )
    }

    await prisma.category.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: '分类删除成功'
    })
  } catch (error) {
    console.error('删除分类失败:', error)
    return NextResponse.json(
      { success: false, message: '删除分类失败' },
      { status: 500 }
    )
  }
} 