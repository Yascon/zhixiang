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
  Col
} from 'antd'
import { 
  PlusOutlined, 
  EditOutlined, 
  EyeOutlined,
  DeleteOutlined,
  SearchOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'

const { Option } = Select
const { Search } = Input
const { RangePicker } = DatePicker

// 定义销售订单数据类型
interface SaleOrderData {
  id: string
  orderNo: string
  type: string
  status: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'COMPLETED' | 'CANCELLED'
  member?: {
    id: string
    name: string
    level?: {
      name: string
    }
  }
  customer?: {
    id: string
    name: string
    company?: string
  }
  totalAmount: number
  paidAmount: number
  orderDate: string
  userId: string
  user?: {
    name: string
  }
  notes?: string
  orderItems?: any[]
  createdAt: string
  updatedAt: string
}

interface MemberData {
  id: string
  name: string
  phone: string
  level?: {
    name: string
  }
}

interface CustomerData {
  id: string
  name: string
  phone?: string
  company?: string
}

export default function SaleOrdersPage() {
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<SaleOrderData | null>(null)
  const [orders, setOrders] = useState<SaleOrderData[]>([])
  const [members, setMembers] = useState<MemberData[]>([])
  const [customers, setCustomers] = useState<CustomerData[]>([])
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  })
  const [searchKeyword, setSearchKeyword] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [dateRange, setDateRange] = useState<any[]>([])
  const [form] = Form.useForm()

  // 获取销售订单列表
  const fetchOrders = async (page = 1, pageSize = 10) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        type: 'SALE'
      })
      
      if (searchKeyword) {
        params.append('keyword', searchKeyword)
      }
      
      if (selectedStatus) {
        params.append('status', selectedStatus)
      }
      
      if (dateRange && dateRange.length === 2) {
        params.append('dateFrom', dateRange[0].format('YYYY-MM-DD'))
        params.append('dateTo', dateRange[1].format('YYYY-MM-DD'))
      }

      const response = await fetch(`/api/orders?${params}`)
      const result = await response.json()

      if (result.success) {
        setOrders(result.data)
        setPagination({
          current: page,
          pageSize,
          total: result.pagination.total
        })
      } else {
        message.error(result.message || '获取订单列表失败')
      }
    } catch (error) {
      console.error('获取订单列表失败:', error)
      message.error('获取订单列表失败')
    } finally {
      setLoading(false)
    }
  }

  // 获取会员列表
  const fetchMembers = async () => {
    try {
      const response = await fetch('/api/members?pageSize=1000')
      const result = await response.json()

      if (result.success) {
        setMembers(result.data)
      } else {
        message.error(result.message || '获取会员列表失败')
      }
    } catch (error) {
      console.error('获取会员列表失败:', error)
      message.error('获取会员列表失败')
    }
  }

  // 获取客户列表
  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/customers?pageSize=1000')
      const result = await response.json()

      if (result.success) {
        setCustomers(result.data)
      } else {
        message.error(result.message || '获取客户列表失败')
      }
    } catch (error) {
      console.error('获取客户列表失败:', error)
      message.error('获取客户列表失败')
    }
  }

  useEffect(() => {
    fetchOrders()
    fetchMembers()
    fetchCustomers()
  }, [])

  useEffect(() => {
    fetchOrders(1, pagination.pageSize)
  }, [searchKeyword, selectedStatus, dateRange])

  const columns = [
    {
      title: '订单编号',
      dataIndex: 'orderNo',
      key: 'orderNo',
    },
    {
      title: '客户信息',
      key: 'customerInfo',
      render: (record: SaleOrderData) => {
        if (record.member) {
          return (
            <div>
              <div>{record.member.name}</div>
              <div className="text-xs text-gray-500">会员</div>
            </div>
          )
        } else if (record.customer) {
          return (
            <div>
              <div>{record.customer.name}</div>
              <div className="text-xs text-gray-500">
                {record.customer.company ? `${record.customer.company} - 客户` : '客户'}
              </div>
            </div>
          )
        } else {
          return '散客'
        }
      }
    },
    {
      title: '客户类型',
      key: 'customerType',
      render: (record: SaleOrderData) => {
        if (record.member) {
          const level = record.member.level?.name
          const colors = {
            '普通会员': 'default',
            'VIP': 'gold',
            'SVIP': 'purple'
          }
          return <Tag color={colors[level as keyof typeof colors] || 'default'}>{level || '会员'}</Tag>
        } else if (record.customer) {
          return <Tag color="blue">客户</Tag>
        } else {
          return <Tag color="gray">散客</Tag>
        }
      }
    },
    {
      title: '订单日期',
      dataIndex: 'orderDate',
      key: 'orderDate',
      render: (date: string) => new Date(date).toLocaleDateString('zh-CN')
    },
    {
      title: '商品数量',
      dataIndex: 'orderItems',
      key: 'items',
      render: (items: any[]) => `${items?.length || 0} 件`
    },
    {
      title: '订单金额',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount: number) => `¥${amount.toFixed(2)}`
    },
    {
      title: '已付金额',
      dataIndex: 'paidAmount',
      key: 'paidAmount',
      render: (amount: number) => `¥${amount.toFixed(2)}`
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusMap = {
          'PENDING': { text: '待确认', color: 'orange' },
          'CONFIRMED': { text: '已确认', color: 'blue' },
          'SHIPPED': { text: '已发货', color: 'purple' },
          'COMPLETED': { text: '已完成', color: 'green' },
          'CANCELLED': { text: '已取消', color: 'red' }
        }
        const statusInfo = statusMap[status as keyof typeof statusMap] || { text: status, color: 'default' }
        return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>
      }
    },
    {
      title: '操作',
      key: 'action',
      render: (record: SaleOrderData) => (
        <Space size="middle">
          <Button 
            type="link" 
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            查看
          </Button>
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

  const handleViewDetail = (record: SaleOrderData) => {
    setSelectedOrder(record)
    setDetailModalVisible(true)
  }

  const handleEdit = (record: SaleOrderData) => {
    setSelectedOrder(record)
    form.setFieldsValue({
      ...record,
      orderDate: dayjs(record.orderDate)
    })
    setModalVisible(true)
  }

  const handleDelete = (record: SaleOrderData) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除订单"${record.orderNo}"吗？`,
      onOk: async () => {
        try {
          const response = await fetch(`/api/orders?id=${record.id}`, {
            method: 'DELETE'
          })
          const result = await response.json()

          if (result.success) {
            message.success('订单删除成功')
            fetchOrders(pagination.current, pagination.pageSize)
          } else {
            message.error(result.message || '删除失败')
          }
        } catch (error) {
          console.error('删除订单失败:', error)
          message.error('删除订单失败')
        }
      }
    })
  }

  const handleAddOrder = () => {
    setSelectedOrder(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleSubmit = async (values: any) => {
    setLoading(true)
    try {
      const url = selectedOrder ? '/api/orders' : '/api/orders'
      const method = selectedOrder ? 'PUT' : 'POST'
      const data = selectedOrder ? { ...values, id: selectedOrder.id } : values

      // 确保订单类型为销售订单
      data.type = 'SALE'
      
      // 格式化日期
      if (data.orderDate) {
        data.orderDate = data.orderDate.format('YYYY-MM-DD')
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      const result = await response.json()

      if (result.success) {
        message.success(selectedOrder ? '订单更新成功' : '订单创建成功')
        setModalVisible(false)
        fetchOrders(pagination.current, pagination.pageSize)
      } else {
        message.error(result.message || '操作失败')
      }
    } catch (error) {
      console.error('提交失败:', error)
      message.error('操作失败')
    } finally {
      setLoading(false)
    }
  }

  const handleTableChange = (paginationInfo: any) => {
    fetchOrders(paginationInfo.current, paginationInfo.pageSize)
  }

  const handleSearch = (value: string) => {
    setSearchKeyword(value)
  }

  const handleStatusChange = (value: string) => {
    setSelectedStatus(value)
  }

  const handleDateRangeChange = (dates: any) => {
    setDateRange(dates)
  }

  return (
    <div className="p-6">
      <Card>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">销售订单管理</h2>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={handleAddOrder}
          >
            新增销售订单
          </Button>
        </div>

        {/* 搜索和筛选 */}
        <Row gutter={[16, 16]} className="mb-4">
          <Col xs={24} sm={12} md={6}>
            <Search
              placeholder="搜索订单编号或客户"
              allowClear
              enterButton={<SearchOutlined />}
              onSearch={handleSearch}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="订单状态"
              allowClear
              style={{ width: '100%' }}
              onChange={handleStatusChange}
            >
              <Option value="PENDING">待确认</Option>
              <Option value="CONFIRMED">已确认</Option>
              <Option value="SHIPPED">已发货</Option>
              <Option value="COMPLETED">已完成</Option>
              <Option value="CANCELLED">已取消</Option>
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
          dataSource={orders}
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

      {/* 新增/编辑销售订单模态框 */}
      <Modal
        title={selectedOrder ? '编辑销售订单' : '新增销售订单'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="memberId"
                label="会员客户"
              >
                <Select placeholder="请选择会员（可选）" allowClear>
                  {members.map(member => (
                    <Option key={member.id} value={member.id}>
                      {member.name} ({member.phone}) - {member.level?.name || '会员'}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="customerId"
                label="普通客户"
              >
                <Select placeholder="请选择客户（可选）" allowClear>
                  {customers.map(customer => (
                    <Option key={customer.id} value={customer.id}>
                      {customer.name} {customer.company && `(${customer.company})`} {customer.phone && `- ${customer.phone}`}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="orderDate"
                label="订单日期"
                rules={[{ required: true, message: '请选择订单日期' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="status"
                label="订单状态"
                rules={[{ required: true, message: '请选择订单状态' }]}
              >
                <Select placeholder="请选择订单状态">
                  <Option value="PENDING">待确认</Option>
                  <Option value="CONFIRMED">已确认</Option>
                  <Option value="SHIPPED">已发货</Option>
                  <Option value="COMPLETED">已完成</Option>
                  <Option value="CANCELLED">已取消</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="totalAmount"
                label="订单总额"
                rules={[{ required: true, message: '请输入订单总额' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="请输入订单总额"
                  min={0}
                  precision={2}
                  addonAfter="元"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="paidAmount"
                label="已付金额"
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="请输入已付金额"
                  min={0}
                  precision={2}
                  addonAfter="元"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="notes"
            label="备注"
          >
            <Input.TextArea placeholder="请输入备注信息" rows={3} />
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

      {/* 订单详情模态框 */}
      <Modal
        title="订单详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>
        ]}
        width={800}
      >
        {selectedOrder && (
          <div>
            <Row gutter={16}>
              <Col span={12}>
                <p><strong>订单编号：</strong>{selectedOrder.orderNo}</p>
                <p><strong>客户姓名：</strong>{selectedOrder.member?.name || '散客'}</p>
                <p><strong>订单日期：</strong>{new Date(selectedOrder.orderDate).toLocaleDateString('zh-CN')}</p>
              </Col>
              <Col span={12}>
                <p><strong>订单金额：</strong>¥{selectedOrder.totalAmount.toFixed(2)}</p>
                <p><strong>已付金额：</strong>¥{selectedOrder.paidAmount.toFixed(2)}</p>
                <p><strong>订单状态：</strong>
                  <Tag color={
                    selectedOrder.status === 'COMPLETED' ? 'green' :
                    selectedOrder.status === 'CANCELLED' ? 'red' :
                    selectedOrder.status === 'SHIPPED' ? 'purple' :
                    selectedOrder.status === 'CONFIRMED' ? 'blue' : 'orange'
                  }>
                    {
                      selectedOrder.status === 'PENDING' ? '待确认' :
                      selectedOrder.status === 'CONFIRMED' ? '已确认' :
                      selectedOrder.status === 'SHIPPED' ? '已发货' :
                      selectedOrder.status === 'COMPLETED' ? '已完成' : '已取消'
                    }
                  </Tag>
                </p>
              </Col>
            </Row>
            {selectedOrder.notes && (
              <Row>
                <Col span={24}>
                  <p><strong>备注：</strong>{selectedOrder.notes}</p>
                </Col>
              </Row>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
} 