'use client'

import { useState, useEffect } from 'react'
import { 
  Card, 
  Button, 
  Space, 
  DatePicker, 
  Select, 
  Row, 
  Col,
  Statistic,
  Table,
  message,
  Tabs,
  Form,
  Dropdown
} from 'antd'
import { 
  DownloadOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
  BarChartOutlined,
  PieChartOutlined,
  LineChartOutlined
} from '@ant-design/icons'
import { 
  formatMemberDataForExport,
  formatProductDataForExport,
  formatOrderDataForExport,
  formatFinanceDataForExport,
  exportData
} from '@/lib/export-utils'
import dayjs from 'dayjs'

const { RangePicker } = DatePicker
const { Option } = Select
const { TabPane } = Tabs

export default function ReportsPage() {
  const [loading, setLoading] = useState(false)
  const [reportData, setReportData] = useState<any>({
    members: [],
    products: [],
    orders: [],
    finance: []
  })
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(30, 'day'),
    dayjs()
  ])

  // 获取报表数据
  const fetchReportData = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      
      if (dateRange) {
        params.append('dateFrom', dateRange[0].format('YYYY-MM-DD'))
        params.append('dateTo', dateRange[1].format('YYYY-MM-DD'))
      }

      const response = await fetch(`/api/reports?${params}`)
      const result = await response.json()

      if (result.success) {
        setReportData(result.data)
      } else {
        message.error(result.message || '获取报表数据失败')
      }
    } catch (error) {
      console.error('获取报表数据失败:', error)
      message.error('获取报表数据失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReportData()
  }, [dateRange])

  // 导出功能
  const handleExport = (dataType: string, format: 'excel' | 'pdf') => {
    let data: any[] = []
    let filename = ''
    let title = ''
    let columns: { header: string; dataKey: string }[] = []

    switch (dataType) {
      case 'members':
        data = formatMemberDataForExport(reportData.members)
        filename = `会员报表_${dayjs().format('YYYY-MM-DD')}`
        title = '会员管理报表'
        break
      case 'products':
        data = formatProductDataForExport(reportData.products)
        filename = `商品报表_${dayjs().format('YYYY-MM-DD')}`
        title = '商品管理报表'
        break
      case 'orders':
        data = formatOrderDataForExport(reportData.orders)
        filename = `订单报表_${dayjs().format('YYYY-MM-DD')}`
        title = '订单管理报表'
        break
      case 'finance':
        data = formatFinanceDataForExport(reportData.finance)
        filename = `财务报表_${dayjs().format('YYYY-MM-DD')}`
        title = '财务管理报表'
        break
      default:
        message.error('未知的报表类型')
        return
    }

    if (data.length === 0) {
      message.warning('没有数据可导出')
      return
    }

    // 为PDF设置列配置
    if (format === 'pdf' && data.length > 0) {
      columns = Object.keys(data[0]).map(key => ({
        header: key,
        dataKey: key
      }))
    }

    const result = exportData(data, format, filename, {
      title,
      columns
    })

    if (result.success) {
      message.success(result.message)
    } else {
      message.error(result.message)
    }
  }

  // 导出菜单项
  const getExportMenuItems = (dataType: string) => [
    {
      key: 'excel',
      icon: <FileExcelOutlined />,
      label: '导出Excel',
      onClick: () => handleExport(dataType, 'excel')
    },
    {
      key: 'pdf',
      icon: <FilePdfOutlined />,
      label: '导出PDF',
      onClick: () => handleExport(dataType, 'pdf')
    }
  ]

  // 统计数据
  const stats = {
    totalMembers: reportData.members.length,
    totalProducts: reportData.products.length,
    totalOrders: reportData.orders.length,
    totalRevenue: reportData.finance
      .filter((item: any) => item.type === 'INCOME')
      .reduce((sum: number, item: any) => sum + item.amount, 0)
  }

  return (
    <div className="p-6">
      <Card>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">报表管理</h2>
          <Space>
            <RangePicker
              value={dateRange}
              onChange={(dates) => setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs])}
            />
            <Button onClick={fetchReportData} loading={loading}>
              刷新数据
            </Button>
          </Space>
        </div>

        {/* 统计概览 */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="会员总数"
                value={stats.totalMembers}
                prefix={<BarChartOutlined />}
                suffix="人"
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="商品总数"
                value={stats.totalProducts}
                prefix={<PieChartOutlined />}
                suffix="个"
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="订单总数"
                value={stats.totalOrders}
                prefix={<LineChartOutlined />}
                suffix="笔"
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="总收入"
                value={stats.totalRevenue}
                prefix="¥"
                precision={2}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
        </Row>

        <Tabs defaultActiveKey="1">
          <TabPane tab="会员报表" key="1">
            <Card 
              title="会员数据"
              extra={
                <Dropdown menu={{ items: getExportMenuItems('members') }} placement="bottomRight">
                  <Button icon={<DownloadOutlined />}>
                    导出报表
                  </Button>
                </Dropdown>
              }
            >
              <Table
                dataSource={reportData.members}
                loading={loading}
                rowKey="memberNo"
                size="small"
                columns={[
                  { title: '会员编号', dataIndex: 'memberNo', key: 'memberNo' },
                  { title: '姓名', dataIndex: 'name', key: 'name' },
                  { title: '手机号', dataIndex: 'phone', key: 'phone' },
                  { 
                    title: '会员等级', 
                    dataIndex: ['level', 'name'], 
                    key: 'level' 
                  },
                  { 
                    title: '累计消费', 
                    dataIndex: 'totalSpent', 
                    key: 'totalSpent',
                    render: (amount: number) => `¥${amount.toFixed(2)}`
                  }
                ]}
                pagination={{ pageSize: 5 }}
              />
            </Card>
          </TabPane>

          <TabPane tab="商品报表" key="2">
            <Card 
              title="商品数据"
              extra={
                <Dropdown menu={{ items: getExportMenuItems('products') }} placement="bottomRight">
                  <Button icon={<DownloadOutlined />}>
                    导出报表
                  </Button>
                </Dropdown>
              }
            >
              <Table
                dataSource={reportData.products}
                loading={loading}
                rowKey="sku"
                size="small"
                columns={[
                  { title: 'SKU', dataIndex: 'sku', key: 'sku' },
                  { title: '商品名称', dataIndex: 'name', key: 'name' },
                  { 
                    title: '分类', 
                    dataIndex: ['category', 'name'], 
                    key: 'category' 
                  },
                  { 
                    title: '销售价', 
                    dataIndex: 'sellingPrice', 
                    key: 'sellingPrice',
                    render: (price: number) => `¥${price.toFixed(2)}`
                  },
                  { title: '库存', dataIndex: 'stock', key: 'stock' }
                ]}
                pagination={{ pageSize: 5 }}
              />
            </Card>
          </TabPane>

          <TabPane tab="订单报表" key="3">
            <Card 
              title="订单数据"
              extra={
                <Dropdown menu={{ items: getExportMenuItems('orders') }} placement="bottomRight">
                  <Button icon={<DownloadOutlined />}>
                    导出报表
                  </Button>
                </Dropdown>
              }
            >
              <Table
                dataSource={reportData.orders}
                loading={loading}
                rowKey="orderNo"
                size="small"
                columns={[
                  { title: '订单编号', dataIndex: 'orderNo', key: 'orderNo' },
                  { 
                    title: '类型', 
                    dataIndex: 'type', 
                    key: 'type',
                    render: (type: string) => type === 'SALE' ? '销售' : '采购'
                  },
                  { 
                    title: '金额', 
                    dataIndex: 'totalAmount', 
                    key: 'totalAmount',
                    render: (amount: number) => `¥${amount.toFixed(2)}`
                  },
                  { 
                    title: '状态', 
                    dataIndex: 'status', 
                    key: 'status',
                    render: (status: string) => {
                      const statusMap: { [key: string]: string } = {
                        'COMPLETED': '已完成',
                        'PENDING': '待确认',
                        'CONFIRMED': '已确认'
                      }
                      return statusMap[status] || status
                    }
                  }
                ]}
                pagination={{ pageSize: 5 }}
              />
            </Card>
          </TabPane>

          <TabPane tab="财务报表" key="4">
            <Card 
              title="财务数据"
              extra={
                <Dropdown menu={{ items: getExportMenuItems('finance') }} placement="bottomRight">
                  <Button icon={<DownloadOutlined />}>
                    导出报表
                  </Button>
                </Dropdown>
              }
            >
              <Table
                dataSource={reportData.finance}
                loading={loading}
                rowKey="id"
                size="small"
                columns={[
                  { title: '记录ID', dataIndex: 'id', key: 'id' },
                  { 
                    title: '类型', 
                    dataIndex: 'type', 
                    key: 'type',
                    render: (type: string) => type === 'INCOME' ? '收入' : '支出'
                  },
                  { title: '分类', dataIndex: 'category', key: 'category' },
                  { 
                    title: '金额', 
                    dataIndex: 'amount', 
                    key: 'amount',
                    render: (amount: number) => `¥${amount.toFixed(2)}`
                  },
                  { title: '描述', dataIndex: 'description', key: 'description' }
                ]}
                pagination={{ pageSize: 5 }}
              />
            </Card>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  )
} 