'use client'

import { useState, useEffect } from 'react'
import { 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Select, 
  DatePicker, 
  Button,
  Table,
  Progress,
  message,
  Tabs,
  Space
} from 'antd'
import { 
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
  RiseOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  DollarOutlined,
  InboxOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'

const { Option } = Select
const { RangePicker } = DatePicker
const { TabPane } = Tabs

interface AnalyticsData {
  salesAnalysis: {
    totalSales: number
    totalOrders: number
    averageOrderValue: number
    topProducts: any[]
    salesTrend: any[]
  }
  inventoryAnalysis: {
    totalProducts: number
    lowStockCount: number
    totalValue: number
    categoryDistribution: any[]
  }
  memberAnalysis: {
    totalMembers: number
    newMembers: number
    membershipRevenue: number
    levelDistribution: any[]
  }
}

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(false)
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    salesAnalysis: {
      totalSales: 0,
      totalOrders: 0,
      averageOrderValue: 0,
      topProducts: [],
      salesTrend: []
    },
    inventoryAnalysis: {
      totalProducts: 0,
      lowStockCount: 0,
      totalValue: 0,
      categoryDistribution: []
    },
    memberAnalysis: {
      totalMembers: 0,
      newMembers: 0,
      membershipRevenue: 0,
      levelDistribution: []
    }
  })
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(30, 'day'),
    dayjs()
  ])

  // 获取分析数据
  const fetchAnalyticsData = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        dateFrom: dateRange[0].format('YYYY-MM-DD'),
        dateTo: dateRange[1].format('YYYY-MM-DD')
      })

      // 并行获取各种分析数据
      const [salesResponse, inventoryResponse, memberResponse] = await Promise.all([
        fetch(`/api/analytics/sales?${params}`),
        fetch(`/api/analytics/inventory?${params}`),
        fetch(`/api/analytics/members?${params}`)
      ])

      const [salesResult, inventoryResult, memberResult] = await Promise.all([
        salesResponse.json(),
        inventoryResponse.json(),
        memberResponse.json()
      ])

      if (salesResult.success && inventoryResult.success && memberResult.success) {
        setAnalyticsData({
          salesAnalysis: salesResult.data,
          inventoryAnalysis: inventoryResult.data,
          memberAnalysis: memberResult.data
        })
      } else {
        message.error('获取分析数据失败')
      }
    } catch (error) {
      console.error('获取分析数据失败:', error)
      message.error('获取分析数据失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalyticsData()
  }, [dateRange])

  const topProductColumns = [
    { title: '商品名称', dataIndex: 'name', key: 'name' },
    { title: 'SKU', dataIndex: 'sku', key: 'sku' },
    { title: '销售数量', dataIndex: 'totalSold', key: 'totalSold' },
    { 
      title: '销售金额', 
      dataIndex: 'totalRevenue', 
      key: 'totalRevenue',
      render: (amount: number) => `¥${amount.toFixed(2)}`
    }
  ]

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">数据分析</h2>
        <Space>
          <RangePicker
            value={dateRange}
            onChange={(dates) => setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs])}
          />
          <Button onClick={fetchAnalyticsData} loading={loading}>
            刷新数据
          </Button>
        </Space>
      </div>

      <Tabs defaultActiveKey="1">
        <TabPane tab="销售分析" key="1">
          {/* 销售概览 */}
          <Row gutter={[16, 16]} className="mb-6">
            <Col xs={24} sm={8}>
              <Card loading={loading}>
                <Statistic
                  title="总销售额"
                  value={analyticsData.salesAnalysis.totalSales}
                  prefix={<DollarOutlined className="text-green-500" />}
                  suffix="元"
                  precision={2}
                  valueStyle={{ color: '#3f8600' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card loading={loading}>
                <Statistic
                  title="订单总数"
                  value={analyticsData.salesAnalysis.totalOrders}
                  prefix={<ShoppingCartOutlined className="text-blue-500" />}
                  suffix="笔"
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card loading={loading}>
                <Statistic
                  title="平均订单价值"
                  value={analyticsData.salesAnalysis.averageOrderValue}
                  prefix={<RiseOutlined className="text-purple-500" />}
                  suffix="元"
                  precision={2}
                />
              </Card>
            </Col>
          </Row>

          {/* 热销商品 */}
          <Card title="热销商品排行" loading={loading}>
            <Table
              dataSource={analyticsData.salesAnalysis.topProducts}
              columns={topProductColumns}
              pagination={{ pageSize: 10 }}
              rowKey="id"
            />
          </Card>
        </TabPane>

        <TabPane tab="库存分析" key="2">
          {/* 库存概览 */}
          <Row gutter={[16, 16]} className="mb-6">
            <Col xs={24} sm={8}>
              <Card loading={loading}>
                <Statistic
                  title="商品总数"
                  value={analyticsData.inventoryAnalysis.totalProducts}
                  prefix={<InboxOutlined className="text-blue-500" />}
                  suffix="件"
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card loading={loading}>
                <Statistic
                  title="库存预警"
                  value={analyticsData.inventoryAnalysis.lowStockCount}
                  prefix={<BarChartOutlined className="text-red-500" />}
                  suffix="项"
                  valueStyle={{ color: '#cf1322' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card loading={loading}>
                <Statistic
                  title="库存总价值"
                  value={analyticsData.inventoryAnalysis.totalValue}
                  prefix={<DollarOutlined className="text-green-500" />}
                  suffix="元"
                  precision={2}
                />
              </Card>
            </Col>
          </Row>

          {/* 分类分布 */}
          <Card title="商品分类分布" loading={loading}>
            <div className="space-y-4">
              {analyticsData.inventoryAnalysis.categoryDistribution.map((category, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="font-medium">{category.name}</span>
                  <div className="flex items-center space-x-4 flex-1 mx-4">
                    <Progress 
                      percent={category.percentage} 
                      size="small" 
                      className="flex-1"
                      strokeColor="#1890ff"
                    />
                    <span className="text-sm text-gray-600">{category.count}件</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabPane>

        <TabPane tab="会员分析" key="3">
          {/* 会员概览 */}
          <Row gutter={[16, 16]} className="mb-6">
            <Col xs={24} sm={8}>
              <Card loading={loading}>
                <Statistic
                  title="会员总数"
                  value={analyticsData.memberAnalysis.totalMembers}
                  prefix={<UserOutlined className="text-blue-500" />}
                  suffix="人"
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card loading={loading}>
                <Statistic
                  title="新增会员"
                  value={analyticsData.memberAnalysis.newMembers}
                  prefix={<RiseOutlined className="text-green-500" />}
                  suffix="人"
                  valueStyle={{ color: '#3f8600' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card loading={loading}>
                <Statistic
                  title="会员费收入"
                  value={analyticsData.memberAnalysis.membershipRevenue}
                  prefix={<DollarOutlined className="text-purple-500" />}
                  suffix="元"
                  precision={2}
                />
              </Card>
            </Col>
          </Row>

          {/* 会员等级分布 */}
          <Card title="会员等级分布" loading={loading}>
            <div className="space-y-4">
              {analyticsData.memberAnalysis.levelDistribution.map((level, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="font-medium">{level.name}</span>
                  <div className="flex items-center space-x-4 flex-1 mx-4">
                    <Progress 
                      percent={level.percentage} 
                      size="small" 
                      className="flex-1"
                      strokeColor="#52c41a"
                    />
                    <span className="text-sm text-gray-600">{level.count}人</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabPane>
      </Tabs>
    </div>
  )
} 