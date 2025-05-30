'use client'

import { useState, useEffect } from 'react'
import { 
  Card, 
  Table, 
  Button, 
  Space, 
  Tag, 
  Modal, 
  Form, 
  Input, 
  Select, 
  InputNumber,
  DatePicker,
  message,
  Row,
  Col,
  Statistic
} from 'antd'
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined,
  SearchOutlined,
  RiseOutlined,
  FallOutlined,
  DollarOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'

const { Option } = Select
const { Search } = Input
const { TextArea } = Input
const { RangePicker } = DatePicker

// 定义财务记录数据类型
interface FinanceRecordData {
  id: string
  type: 'INCOME' | 'EXPENSE'
  category: string
  amount: number
  description?: string
  recordDate: string
  orderId?: string
  createdAt: string
}

export default function FinanceRecordsPage() {
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<FinanceRecordData | null>(null)
  const [records, setRecords] = useState<FinanceRecordData[]>([])
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  })
  const [searchKeyword, setSearchKeyword] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null)
  const [form] = Form.useForm()

  // 获取财务记录列表
  const fetchRecords = async (page = 1, pageSize = 10) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString()
      })
      
      if (searchKeyword) params.append('keyword', searchKeyword)
      if (selectedType) params.append('type', selectedType)
      if (dateRange) {
        params.append('dateFrom', dateRange[0].format('YYYY-MM-DD'))
        params.append('dateTo', dateRange[1].format('YYYY-MM-DD'))
      }

      const response = await fetch(`/api/finance-records?${params}`)
      const result = await response.json()

      if (result.success) {
        setRecords(result.data)
        setPagination({
          current: result.pagination.page,
          pageSize: result.pagination.pageSize,
          total: result.pagination.total
        })
      } else {
        message.error(result.message || '获取财务记录失败')
      }
    } catch (error) {
      console.error('获取财务记录失败:', error)
      message.error('获取财务记录失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRecords()
  }, [])

  useEffect(() => {
    fetchRecords(1, pagination.pageSize)
  }, [searchKeyword, selectedType, dateRange])

  const incomeCategories = [
    { value: '商品销售', label: '商品销售' },
    { value: '会员费', label: '会员费' },
    { value: '其他收入', label: '其他收入' }
  ]

  const expenseCategories = [
    { value: '商品采购', label: '商品采购' },
    { value: '运营费用', label: '运营费用' },
    { value: '人员工资', label: '人员工资' },
    { value: '水电费', label: '水电费' },
    { value: '其他支出', label: '其他支出' }
  ]

  const columns = [
    {
      title: '记录编号',
      dataIndex: 'id',
      key: 'id',
      render: (id: string) => id.slice(-8).toUpperCase()
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color={type === 'INCOME' ? 'green' : 'red'}>
          {type === 'INCOME' ? '收入' : '支出'}
        </Tag>
      )
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: '金额',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number, record: FinanceRecordData) => (
        <span className={record.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}>
          {record.type === 'INCOME' ? '+' : '-'}¥{amount.toFixed(2)}
        </span>
      )
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      render: (description?: string) => description || '-'
    },
    {
      title: '日期',
      dataIndex: 'recordDate',
      key: 'recordDate',
      render: (date: string) => new Date(date).toLocaleDateString('zh-CN')
    },
    {
      title: '操作',
      key: 'action',
      render: (record: FinanceRecordData) => (
        <Space size="middle">
          <Button 
            type="link" 
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button 
            type="link" 
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ]

  const handleEdit = (record: FinanceRecordData) => {
    setSelectedRecord(record)
    form.setFieldsValue({
      ...record,
      recordDate: dayjs(record.recordDate)
    })
    setModalVisible(true)
  }

  const handleDelete = (record: FinanceRecordData) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除财务记录吗？`,
      onOk: async () => {
        try {
          const response = await fetch(`/api/finance-records?id=${record.id}`, {
            method: 'DELETE'
          })
          const result = await response.json()

          if (result.success) {
            message.success('财务记录删除成功！')
            fetchRecords(pagination.current, pagination.pageSize)
          } else {
            message.error(result.message || '删除失败')
          }
        } catch (error) {
          console.error('删除财务记录失败:', error)
          message.error('删除失败，请重试！')
        }
      }
    })
  }

  const handleAddRecord = () => {
    setSelectedRecord(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleSubmit = async (values: any) => {
    setLoading(true)
    try {
      const formData = {
        ...values,
        recordDate: values.recordDate.format('YYYY-MM-DD')
      }

      const method = selectedRecord ? 'PUT' : 'POST'
      const body = selectedRecord 
        ? { ...formData, id: selectedRecord.id }
        : formData

      const response = await fetch('/api/finance-records', {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      })

      const result = await response.json()

      if (result.success) {
        message.success(selectedRecord ? '财务记录更新成功！' : '财务记录添加成功！')
        setModalVisible(false)
        fetchRecords(pagination.current, pagination.pageSize)
      } else {
        message.error(result.message || '保存失败')
      }
    } catch (error) {
      console.error('保存财务记录失败:', error)
      message.error('保存失败，请重试！')
    } finally {
      setLoading(false)
    }
  }

  const handleTableChange = (paginationConfig: any) => {
    fetchRecords(paginationConfig.current, paginationConfig.pageSize)
  }

  const handleSearch = (value: string) => {
    setSearchKeyword(value)
  }

  const handleTypeChange = (value: string) => {
    setSelectedType(value)
  }

  const handleDateRangeChange = (dates: any) => {
    setDateRange(dates)
  }

  // 统计数据
  const stats = {
    totalIncome: records.filter(r => r.type === 'INCOME').reduce((sum, r) => sum + r.amount, 0),
    totalExpense: records.filter(r => r.type === 'EXPENSE').reduce((sum, r) => sum + r.amount, 0),
    profit: 0
  }
  stats.profit = stats.totalIncome - stats.totalExpense

  return (
    <div className="p-6">
      {/* 统计卡片 */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="总收入"
              value={stats.totalIncome}
              prefix={<RiseOutlined className="text-green-500" />}
              suffix="元"
              precision={2}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="总支出"
              value={stats.totalExpense}
              prefix={<FallOutlined className="text-red-500" />}
              suffix="元"
              precision={2}
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="净利润"
              value={stats.profit}
              prefix={<DollarOutlined className={stats.profit >= 0 ? 'text-green-500' : 'text-red-500'} />}
              suffix="元"
              precision={2}
              valueStyle={{ color: stats.profit >= 0 ? '#52c41a' : '#f5222d' }}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">财务记录</h2>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={handleAddRecord}
          >
            新增记录
          </Button>
        </div>

        {/* 搜索和筛选 */}
        <Row gutter={[16, 16]} className="mb-4">
          <Col xs={24} sm={12} md={6}>
            <Search
              placeholder="搜索记录编号或描述"
              allowClear
              enterButton={<SearchOutlined />}
              onSearch={handleSearch}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="记录类型"
              allowClear
              style={{ width: '100%' }}
              onChange={handleTypeChange}
            >
              <Option value="INCOME">收入</Option>
              <Option value="EXPENSE">支出</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <RangePicker
              style={{ width: '100%' }}
              placeholder={['开始日期', '结束日期']}
              onChange={handleDateRangeChange}
            />
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={records}
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total: number) => `共 ${total} 条记录`
          }}
          onChange={handleTableChange}
          rowKey="id"
        />
      </Card>

      {/* 新增/编辑财务记录模态框 */}
      <Modal
        title={selectedRecord ? '编辑财务记录' : '新增财务记录'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="type"
                label="记录类型"
                rules={[{ required: true, message: '请选择记录类型' }]}
              >
                <Select placeholder="请选择记录类型">
                  <Option value="INCOME">收入</Option>
                  <Option value="EXPENSE">支出</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="recordDate"
                label="日期"
                rules={[{ required: true, message: '请选择日期' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) => prevValues.type !== currentValues.type}
          >
            {({ getFieldValue }) => {
              const recordType = getFieldValue('type')
              const categories = recordType === 'INCOME' ? incomeCategories : expenseCategories
              return (
                <Form.Item
                  name="category"
                  label="分类"
                  rules={[{ required: true, message: '请选择分类' }]}
                >
                  <Select placeholder="请选择分类">
                    {categories.map(cat => (
                      <Option key={cat.value} value={cat.value}>{cat.label}</Option>
                    ))}
                  </Select>
                </Form.Item>
              )
            }}
          </Form.Item>

          <Form.Item
            name="amount"
            label="金额"
            rules={[{ required: true, message: '请输入金额' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="请输入金额"
              min={0}
              precision={2}
              addonAfter="元"
            />
          </Form.Item>

          <Form.Item
            name="description"
            label="描述"
            rules={[{ required: true, message: '请输入描述' }]}
          >
            <TextArea placeholder="请输入描述" rows={3} />
          </Form.Item>

          <Form.Item
            name="orderId"
            label="关联订单号"
          >
            <Input placeholder="请输入关联订单号（可选）" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                保存
              </Button>
              <Button onClick={() => setModalVisible(false)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
} 