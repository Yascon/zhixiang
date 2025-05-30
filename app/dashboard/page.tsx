'use client'

import { useState, useEffect } from 'react'
import { Card, Row, Col, Statistic, Typography, Progress, Table, Tag, message } from 'antd'
import { 
  ShoppingCartOutlined, 
  UserOutlined, 
  DollarOutlined, 
  WarningOutlined,
  RiseOutlined,
  TeamOutlined
} from '@ant-design/icons'

const { Title } = Typography

interface DashboardStats {
  totalProducts: number
  totalMembers: number
  todayRevenue: number
  lowStockCount: number
  monthlyMembershipRevenue: number
  monthlyGrowth: number
  lowStockItems: Array<{
    id: string
    name: string
    sku: string
    stock: number
    minStock: number
    category: string
    status: string
  }>
  recentMembers: Array<{
    id: string
    name: string
    memberNo: string
    level: string
    joinDate: string
    status: string
  }>
  memberLevelDistribution: Array<{
    name: string
    count: number
    percentage: number
  }>
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalMembers: 0,
    todayRevenue: 0,
    lowStockCount: 0,
    monthlyMembershipRevenue: 0,
    monthlyGrowth: 0,
    lowStockItems: [],
    recentMembers: [],
    memberLevelDistribution: []
  })

  // 获取仪表板统计数据
  const fetchDashboardStats = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/dashboard/stats')
      const result = await response.json()

      if (result.success) {
        setStats(result.data)
      } else {
        message.error(result.message || '获取统计数据失败')
      }
    } catch (error) {
      console.error('获取统计数据失败:', error)
      message.error('获取统计数据失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const lowStockColumns = [
    { title: '商品名称', dataIndex: 'name', key: 'name' },
    { title: '当前库存', dataIndex: 'stock', key: 'stock' },
    { title: '最低库存', dataIndex: 'minStock', key: 'minStock' },
    { title: '分类', dataIndex: 'category', key: 'category' },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'out' ? 'red' : 'orange'}>
          {status === 'out' ? '缺货' : '库存不足'}
        </Tag>
      )
    }
  ]

  const memberColumns = [
    { title: '会员姓名', dataIndex: 'name', key: 'name' },
    { title: '会员等级', dataIndex: 'level', key: 'level' },
    { title: '加入日期', dataIndex: 'joinDate', key: 'joinDate' },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? '正常' : '已过期'}
        </Tag>
      )
    }
  ]

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Title level={2} className="mb-6">系统概览</Title>
      
      {/* 统计卡片 */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="商品总数"
              value={stats.totalProducts}
              prefix={<ShoppingCartOutlined className="text-blue-500" />}
              suffix="件"
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="会员总数"
              value={stats.totalMembers}
              prefix={<UserOutlined className="text-green-500" />}
              suffix="人"
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="今日营收"
              value={stats.todayRevenue}
              prefix={<DollarOutlined className="text-yellow-500" />}
              suffix="元"
              precision={2}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="库存预警"
              value={stats.lowStockCount}
              prefix={<WarningOutlined className="text-red-500" />}
              suffix="项"
            />
          </Card>
        </Col>
      </Row>

      {/* 会员收费统计 */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} lg={12}>
          <Card title="会员收费统计" extra={<TeamOutlined />} loading={loading}>
            <Row gutter={16}>
              <Col span={12}>
                <Statistic
                  title="本月会员费收入"
                  value={stats.monthlyMembershipRevenue}
                  suffix="元"
                  precision={2}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="增长率"
                  value={stats.monthlyGrowth}
                  prefix={<RiseOutlined />}
                  suffix="%"
                  valueStyle={{ color: '#3f8600' }}
                />
              </Col>
            </Row>
            <div className="mt-4">
              <p className="text-gray-600 mb-2">会员等级分布</p>
              <div className="space-y-2">
                {stats.memberLevelDistribution.map((level, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span>{level.name}</span>
                    <Progress percent={level.percentage} size="small" className="flex-1 mx-3" />
                    <span>{level.count}人</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </Col>
        
        <Col xs={24} lg={12}>
          <Card title="最新会员" extra={<a href="/dashboard/members">查看全部</a>} loading={loading}>
            <Table
              dataSource={stats.recentMembers}
              columns={memberColumns}
              pagination={false}
              size="small"
              rowKey="id"
            />
          </Card>
        </Col>
      </Row>

      {/* 库存预警和销售统计 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="库存预警" extra={<a href="/dashboard/inventory">查看全部</a>} loading={loading}>
            <Table
              dataSource={stats.lowStockItems}
              columns={lowStockColumns}
              pagination={false}
              size="small"
              rowKey="id"
            />
          </Card>
        </Col>
        
        <Col xs={24} lg={12}>
          <Card title="快速操作">
            <div className="grid grid-cols-2 gap-4">
              <Card.Grid className="text-center cursor-pointer hover:bg-blue-50">
                <a href="/dashboard/products" className="block">
                  <ShoppingCartOutlined className="text-2xl text-blue-500 mb-2" />
                  <div>添加商品</div>
                </a>
              </Card.Grid>
              <Card.Grid className="text-center cursor-pointer hover:bg-green-50">
                <a href="/dashboard/members" className="block">
                  <UserOutlined className="text-2xl text-green-500 mb-2" />
                  <div>新增会员</div>
                </a>
              </Card.Grid>
              <Card.Grid className="text-center cursor-pointer hover:bg-purple-50">
                <a href="/dashboard/orders/sale" className="block">
                  <DollarOutlined className="text-2xl text-purple-500 mb-2" />
                  <div>销售订单</div>
                </a>
              </Card.Grid>
              <Card.Grid className="text-center cursor-pointer hover:bg-orange-50">
                <a href="/dashboard/inventory" className="block">
                  <WarningOutlined className="text-2xl text-orange-500 mb-2" />
                  <div>库存管理</div>
                </a>
              </Card.Grid>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  )
} 