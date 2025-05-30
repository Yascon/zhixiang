import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const dateFrom = searchParams.get('dateFrom') || ''
    const dateTo = searchParams.get('dateTo') || ''

    // 构建日期过滤条件
    let dateFilter: any = {}
    if (dateFrom && dateTo) {
      dateFilter = {
        createdAt: {
          gte: new Date(dateFrom),
          lte: new Date(dateTo + 'T23:59:59.999Z')
        }
      }
    }

    // 获取财务记录
    const financeRecords = await prisma.financeRecord.findMany({
      where: dateFilter,
      orderBy: { createdAt: 'desc' }
    })

    // 计算总收入和总支出
    const totalIncome = financeRecords
      .filter(record => record.type === 'INCOME')
      .reduce((sum, record) => sum + record.amount, 0)

    const totalExpense = financeRecords
      .filter(record => record.type === 'EXPENSE')
      .reduce((sum, record) => sum + record.amount, 0)

    const profit = totalIncome - totalExpense
    const profitMargin = totalIncome > 0 ? (profit / totalIncome) * 100 : 0

    // 按分类统计收入
    const incomeByCategory = financeRecords
      .filter(record => record.type === 'INCOME')
      .reduce((acc: any, record) => {
        const category = record.category || '其他'
        if (!acc[category]) {
          acc[category] = 0
        }
        acc[category] += record.amount
        return acc
      }, {})

    const incomeCategories = Object.entries(incomeByCategory).map(([category, amount]) => ({
      category,
      amount: amount as number
    }))

    // 按分类统计支出
    const expenseByCategory = financeRecords
      .filter(record => record.type === 'EXPENSE')
      .reduce((acc: any, record) => {
        const category = record.category || '其他'
        if (!acc[category]) {
          acc[category] = 0
        }
        acc[category] += record.amount
        return acc
      }, {})

    const expenseCategories = Object.entries(expenseByCategory).map(([category, amount]) => ({
      category,
      amount: amount as number
    }))

    // 按月统计趋势（最近6个月）
    const monthlyTrend = []
    const now = new Date()
    
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59)
      
      const monthRecords = financeRecords.filter(record => {
        const recordDate = new Date(record.createdAt)
        return recordDate >= monthStart && recordDate <= monthEnd
      })

      const monthIncome = monthRecords
        .filter(record => record.type === 'INCOME')
        .reduce((sum, record) => sum + record.amount, 0)

      const monthExpense = monthRecords
        .filter(record => record.type === 'EXPENSE')
        .reduce((sum, record) => sum + record.amount, 0)

      monthlyTrend.push({
        month: monthStart.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit' }),
        income: monthIncome,
        expense: monthExpense,
        profit: monthIncome - monthExpense
      })
    }

    // 最近交易记录（最新20条）
    const recentTransactions = financeRecords.slice(0, 20).map(record => ({
      id: record.id,
      date: record.createdAt.toISOString(),
      type: record.type,
      category: record.category || '其他',
      amount: record.amount,
      description: record.description || ''
    }))

    const data = {
      totalIncome,
      totalExpense,
      profit,
      profitMargin,
      incomeByCategory: incomeCategories,
      expenseByCategory: expenseCategories,
      monthlyTrend,
      recentTransactions
    }

    return NextResponse.json({
      success: true,
      data
    })
  } catch (error) {
    console.error('获取财务报表失败:', error)
    return NextResponse.json(
      { success: false, message: '获取财务报表失败' },
      { status: 500 }
    )
  }
} 