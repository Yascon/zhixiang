'use client'

import { useState, useEffect } from 'react'
import { 
  Card, 
  Row, 
  Col, 
  Statistic, 
  DatePicker, 
  Select, 
  Button, 
  Table, 
  Space,
  Tabs,
  Progress,
  message,
  Dropdown
} from 'antd'
import { 
  DollarOutlined, 
  RiseOutlined, 
  FallOutlined,
  BarChartOutlined,
  PieChartOutlined,
  DownloadOutlined,
  FileExcelOutlined,
  FilePdfOutlined
} from '@ant-design/icons'
import dayjs, { Dayjs } from 'dayjs'

const { RangePicker } = DatePicker
const { Option } = Select
const { TabPane } = Tabs

interface FinanceData {
  totalIncome: number
  totalExpense: number
  profit: number
  profitMargin: number
  incomeByCategory: Array<{ category: string; amount: number }>
  expenseByCategory: Array<{ category: string; amount: number }>
  monthlyTrend: Array<{ month: string; income: number; expense: number; profit: number }>
  recentTransactions: Array<{
    id: string
    date: string
    type: string
    category: string
    amount: number
    description: string
  }>
}

export default function FinanceReportsPage() {
  const [loading, setLoading] = useState(false)
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([
    dayjs().subtract(30, 'day'),
    dayjs()
  ])
  const [reportType, setReportType] = useState('overview')
  const [financeData, setFinanceData] = useState<FinanceData>({
    totalIncome: 0,
    totalExpense: 0,
    profit: 0,
    profitMargin: 0,
    incomeByCategory: [],
    expenseByCategory: [],
    monthlyTrend: [],
    recentTransactions: []
  })

  // 获取财务数据
  const fetchFinanceData = async () => {
    setLoading(true)
    try {
      const [startDate, endDate] = dateRange
      const params = new URLSearchParams({
        dateFrom: startDate.format('YYYY-MM-DD'),
        dateTo: endDate.format('YYYY-MM-DD')
      })

      const response = await fetch(`/api/finance-reports?${params}`)
      const result = await response.json()

      if (result.success) {
        setFinanceData(result.data)
      } else {
        message.error(result.message)
      }
    } catch (error) {
      message.error('获取财务数据失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFinanceData()
  }, [dateRange])

  // 交易记录表格列
  const transactionColumns = [
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD')
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <span className={type === 'INCOME' ? 'text-green-600' : 'text-red-600'}>
          {type === 'INCOME' ? '收入' : '支出'}
        </span>
      )
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category'
    },
    {
      title: '金额',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number, record: any) => (
        <span className={record.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}>
          {record.type === 'INCOME' ? '+' : '-'}¥{Math.abs(amount).toFixed(2)}
        </span>
      )
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description'
    }
  ]

  // 导出功能
  const handleExport = (format: 'excel' | 'pdf') => {
    message.success(`正在导出${format.toUpperCase()}格式的财务报表...`)
    // 这里可以实现具体的导出逻辑
  }

  const exportMenuItems = [
    {
      key: 'excel',
      icon: <FileExcelOutlined />,
      label: '导出Excel',
      onClick: () => handleExport('excel')
    },
    {
      key: 'pdf',
      icon: <FilePdfOutlined />,
      label: '导出PDF',
      onClick: () => handleExport('pdf')
    }
  ]

  return (
    <div className="p-6">
      <Card>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">财务报表</h2>
          <Space>
            <RangePicker
              value={dateRange}
              onChange={(dates) => dates && setDateRange(dates as [Dayjs, Dayjs])}
              format="YYYY-MM-DD"
            />
            <Select
              value={reportType}
              onChange={setReportType}
              style={{ width: 120 }}
            >
              <Option value="overview">概览</Option>
              <Option value="detailed">详细</Option>
              <Option value="comparison">对比</Option>
            </Select>
            <Dropdown menu={{ items: exportMenuItems }} placement="bottomRight">
              <Button icon={<DownloadOutlined />}>
                导出报表
              </Button>
            </Dropdown>
          </Space>
        </div>

        <Tabs defaultActiveKey="overview">
          <TabPane tab="财务概览" key="overview">
            <Row gutter={[16, 16]} className="mb-6">
              <Col xs={24} sm={12} lg={6}>
                <Card>
                  <Statistic
                    title="总收入"
                    value={financeData.totalIncome}
                    prefix={<RiseOutlined />}
                    suffix="元"
                    precision={2}
                    valueStyle={{ color: '#3f8600' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card>
                  <Statistic
                    title="总支出"
                    value={financeData.totalExpense}
                    prefix={<FallOutlined />}
                    suffix="元"
                    precision={2}
                    valueStyle={{ color: '#cf1322' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card>
                  <Statistic
                    title="净利润"
                    value={financeData.profit}
                    prefix={<DollarOutlined />}
                    suffix="元"
                    precision={2}
                    valueStyle={{ 
                      color: financeData.profit >= 0 ? '#3f8600' : '#cf1322' 
                    }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card>
                  <Statistic
                    title="利润率"
                    value={financeData.profitMargin}
                    suffix="%"
                    precision={2}
                    valueStyle={{ 
                      color: financeData.profitMargin >= 0 ? '#3f8600' : '#cf1322' 
                    }}
                  />
                  <Progress 
                    percent={Math.abs(financeData.profitMargin)} 
                    showInfo={false}
                    strokeColor={financeData.profitMargin >= 0 ? '#52c41a' : '#ff4d4f'}
                  />
                </Card>
              </Col>
            </Row>

            <Row gutter={[16, 16]}>
              <Col xs={24} lg={12}>
                <Card title="收支趋势" extra={<BarChartOutlined />}>
                  <div className="h-80 flex items-center justify-center bg-gray-50 rounded">
                    <div className="text-center">
                      <BarChartOutlined className="text-4xl text-gray-400 mb-2" />
                      <p className="text-gray-500">收支趋势图表</p>
                      <p className="text-sm text-gray-400">数据可视化功能开发中...</p>
                    </div>
                  </div>
                </Card>
              </Col>
              <Col xs={24} lg={12}>
                <Card title="月度对比" extra={<BarChartOutlined />}>
                  <div className="h-80 flex items-center justify-center bg-gray-50 rounded">
                    <div className="text-center">
                      <BarChartOutlined className="text-4xl text-gray-400 mb-2" />
                      <p className="text-gray-500">月度对比图表</p>
                      <p className="text-sm text-gray-400">数据可视化功能开发中...</p>
                    </div>
                  </div>
                </Card>
              </Col>
            </Row>
          </TabPane>

          <TabPane tab="收入分析" key="income">
            <Row gutter={[16, 16]}>
              <Col xs={24} lg={12}>
                <Card title="收入分类分布" extra={<PieChartOutlined />}>
                  <div className="h-96 flex items-center justify-center bg-gray-50 rounded">
                    <div className="text-center">
                      <PieChartOutlined className="text-4xl text-gray-400 mb-2" />
                      <p className="text-gray-500">收入分类饼图</p>
                      <p className="text-sm text-gray-400">数据可视化功能开发中...</p>
                    </div>
                  </div>
                </Card>
              </Col>
              <Col xs={24} lg={12}>
                <Card title="收入统计">
                  <div className="space-y-4">
                    {financeData.incomeByCategory.map((item, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span>{item.category}</span>
                        <div className="flex items-center space-x-2">
                          <Progress 
                            percent={
                              financeData.totalIncome > 0 
                                ? (item.amount / financeData.totalIncome) * 100 
                                : 0
                            }
                            showInfo={false}
                            strokeColor="#52c41a"
                            style={{ width: 100 }}
                          />
                          <span className="text-green-600 font-medium">
                            ¥{item.amount.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                    {financeData.incomeByCategory.length === 0 && (
                      <div className="text-center text-gray-500 py-8">
                        暂无收入数据
                      </div>
                    )}
                  </div>
                </Card>
              </Col>
            </Row>
          </TabPane>

          <TabPane tab="支出分析" key="expense">
            <Row gutter={[16, 16]}>
              <Col xs={24} lg={12}>
                <Card title="支出分类分布" extra={<PieChartOutlined />}>
                  <div className="h-96 flex items-center justify-center bg-gray-50 rounded">
                    <div className="text-center">
                      <PieChartOutlined className="text-4xl text-gray-400 mb-2" />
                      <p className="text-gray-500">支出分类饼图</p>
                      <p className="text-sm text-gray-400">数据可视化功能开发中...</p>
                    </div>
                  </div>
                </Card>
              </Col>
              <Col xs={24} lg={12}>
                <Card title="支出统计">
                  <div className="space-y-4">
                    {financeData.expenseByCategory.map((item, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span>{item.category}</span>
                        <div className="flex items-center space-x-2">
                          <Progress 
                            percent={
                              financeData.totalExpense > 0 
                                ? (item.amount / financeData.totalExpense) * 100 
                                : 0
                            }
                            showInfo={false}
                            strokeColor="#ff4d4f"
                            style={{ width: 100 }}
                          />
                          <span className="text-red-600 font-medium">
                            ¥{item.amount.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                    {financeData.expenseByCategory.length === 0 && (
                      <div className="text-center text-gray-500 py-8">
                        暂无支出数据
                      </div>
                    )}
                  </div>
                </Card>
              </Col>
            </Row>
          </TabPane>

          <TabPane tab="交易明细" key="transactions">
            <Card title="最近交易记录">
              <Table
                columns={transactionColumns}
                dataSource={financeData.recentTransactions}
                loading={loading}
                rowKey="id"
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total: number) => `共 ${total} 条记录`
                }}
              />
            </Card>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  )
} 