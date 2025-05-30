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
  Divider
} from 'antd'
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined,
  SearchOutlined,
  EyeOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'

const { Option } = Select
const { Search } = Input
const { TextArea } = Input
const { RangePicker } = DatePicker

// 定义采购订单数据类型
interface PurchaseOrderData {
  id: string
  orderNo: string
  type: string
  status: 'PENDING' | 'CONFIRMED' | 'RECEIVED' | 'CANCELLED'
  supplier?: {
    id: string
    name: string
    contactName?: string
  }
  supplierId?: string
  totalAmount: number
  orderDate: string
  expectedDate?: string
  userId: string
  user?: {
    name: string
  }
  notes?: string
  orderItems?: any[]
  createdAt: string
  updatedAt: string
}

interface SupplierData {
  id: string
  name: string
  contactName?: string
  phone?: string
}

export default function PurchaseOrdersPage() {
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrderData | null>(null)
  const [orders, setOrders] = useState<PurchaseOrderData[]>([])
  const [suppliers, setSuppliers] = useState<SupplierData[]>([])
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  })
  const [searchKeyword, setSearchKeyword] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null)
  const [form] = Form.useForm()

  // 获取采购订单列表
  const fetchOrders = async (page = 1, pageSize = 10) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        type: 'PURCHASE'
      })
      
      if (searchKeyword) params.append('keyword', searchKeyword)
      if (selectedStatus) params.append('status', selectedStatus)
      if (dateRange) {
        params.append('dateFrom', dateRange[0].format('YYYY-MM-DD'))
        params.append('dateTo', dateRange[1].format('YYYY-MM-DD'))
      }

      const response = await fetch(`/api/orders?${params}`)
      const result = await response.json()

      if (result.success) {
        setOrders(result.data)
        setPagination({
          current: result.pagination.page,
          pageSize: result.pagination.pageSize,
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

  // 获取供应商列表
  const fetchSuppliers = async () => {
    try {
      const response = await fetch('/api/suppliers?pageSize=1000')
      const result = await response.json()

      if (result.success) {
        setSuppliers(result.data)
      } else {
        message.error(result.message || '获取供应商列表失败')
      }
    } catch (error) {
      console.error('获取供应商列表失败:', error)
      message.error('获取供应商列表失败')
    }
  }

  useEffect(() => {
    fetchOrders()
    fetchSuppliers()
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
      title: '供应商',
      dataIndex: ['supplier', 'name'],
      key: 'supplierName',
      render: (name: string) => name || '-'
    },
    {
      title: '订单日期',
      dataIndex: 'orderDate',
      key: 'orderDate',
      render: (date: string) => new Date(date).toLocaleDateString('zh-CN')
    },
    {
      title: '预计到货',
      dataIndex: 'expectedDate',
      key: 'expectedDate',
      render: (date?: string) => date ? new Date(date).toLocaleDateString('zh-CN') : '-'
    },
    {
      title: '订单金额',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount: number) => `¥${amount.toFixed(2)}`
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusConfig = {
          'PENDING': { color: 'orange', text: '待确认' },
          'CONFIRMED': { color: 'blue', text: '已确认' },
          'RECEIVED': { color: 'green', text: '已收货' },
          'CANCELLED': { color: 'red', text: '已取消' }
        }
        const config = statusConfig[status as keyof typeof statusConfig]
        return <Tag color={config.color}>{config.text}</Tag>
      }
    },
    {
      title: '操作',
      key: 'action',
      render: (record: PurchaseOrderData) => (
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
            disabled={record.status === 'RECEIVED' || record.status === 'CANCELLED'}
          >
            编辑
          </Button>
          <Button 
            type="link" 
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
            disabled={record.status === 'RECEIVED'}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ]

  const handleViewDetail = (record: PurchaseOrderData) => {
    setSelectedOrder(record)
    setDetailModalVisible(true)
  }

  const handleEdit = (record: PurchaseOrderData) => {
    setSelectedOrder(record)
    form.setFieldsValue({
      ...record,
      orderDate: dayjs(record.orderDate),
      expectedDate: record.expectedDate ? dayjs(record.expectedDate) : null,
      supplierId: record.supplierId
    })
    setModalVisible(true)
  }

  const handleDelete = (record: PurchaseOrderData) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除采购订单 "${record.orderNo}" 吗？`,
      onOk: async () => {
        try {
          const response = await fetch(`/api/orders?id=${record.id}`, {
            method: 'DELETE'
          })
          const result = await response.json()

          if (result.success) {
            message.success('采购订单删除成功！')
            fetchOrders(pagination.current, pagination.pageSize)
          } else {
            message.error(result.message || '删除失败')
          }
        } catch (error) {
          console.error('删除采购订单失败:', error)
          message.error('删除失败，请重试！')
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
      const orderData = {
        ...values,
        type: 'PURCHASE',
        orderDate: values.orderDate.format('YYYY-MM-DD'),
        expectedDate: values.expectedDate ? values.expectedDate.format('YYYY-MM-DD') : null,
        totalAmount: values.totalAmount || 0
      }

      const method = selectedOrder ? 'PUT' : 'POST'
      const body = selectedOrder 
        ? { ...orderData, id: selectedOrder.id }
        : orderData

      const response = await fetch('/api/orders', {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      })

      const result = await response.json()

      if (result.success) {
        message.success(selectedOrder ? '采购订单更新成功！' : '采购订单创建成功！')
        setModalVisible(false)
        fetchOrders(pagination.current, pagination.pageSize)
      } else {
        message.error(result.message || '保存失败')
      }
    } catch (error) {
      console.error('保存采购订单失败:', error)
      message.error('保存失败，请重试！')
    } finally {
      setLoading(false)
    }
  }

  const handleTableChange = (paginationConfig: any) => {
    fetchOrders(paginationConfig.current, paginationConfig.pageSize)
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
          <h2 className="text-2xl font-bold">采购订单管理</h2>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={handleAddOrder}
          >
            新增采购订单
          </Button>
        </div>

        {/* 搜索和筛选 */}
        <Row gutter={[16, 16]} className="mb-4">
          <Col xs={24} sm={12} md={6}>
            <Search
              placeholder="搜索订单编号或供应商"
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
              <Option value="RECEIVED">已收货</Option>
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

      {/* 新增/编辑采购订单模态框 */}
      <Modal
        title={selectedOrder ? '编辑采购订单' : '新增采购订单'}
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
                name="supplierId"
                label="供应商"
                rules={[{ required: true, message: '请选择供应商' }]}
              >
                <Select placeholder="请选择供应商">
                  {suppliers.map(supplier => (
                    <Option key={supplier.id} value={supplier.id}>
                      {supplier.name} {supplier.contactName && `(${supplier.contactName})`}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="orderDate"
                label="订单日期"
                rules={[{ required: true, message: '请选择订单日期' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="expectedDate"
                label="预计到货日期"
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="totalAmount"
                label="订单金额"
                rules={[{ required: true, message: '请输入订单金额' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="请输入订单金额"
                  min={0}
                  precision={2}
                  addonAfter="元"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="status"
                label="订单状态"
                rules={[{ required: true, message: '请选择订单状态' }]}
              >
                <Select placeholder="请选择订单状态">
                  <Option value="PENDING">待确认</Option>
                  <Option value="CONFIRMED">已确认</Option>
                  <Option value="RECEIVED">已收货</Option>
                  <Option value="CANCELLED">已取消</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="notes"
            label="备注"
          >
            <TextArea placeholder="请输入备注信息" rows={3} />
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

      {/* 采购订单详情模态框 */}
      <Modal
        title="采购订单详情"
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
                <p><strong>供应商：</strong>{selectedOrder.supplier?.name || '-'}</p>
                <p><strong>订单日期：</strong>{new Date(selectedOrder.orderDate).toLocaleDateString('zh-CN')}</p>
                <p><strong>预计到货：</strong>{selectedOrder.expectedDate ? new Date(selectedOrder.expectedDate).toLocaleDateString('zh-CN') : '-'}</p>
              </Col>
              <Col span={12}>
                <p><strong>订单金额：</strong>¥{selectedOrder.totalAmount.toFixed(2)}</p>
                <p><strong>订单状态：</strong>
                  <Tag color={
                    selectedOrder.status === 'RECEIVED' ? 'green' :
                    selectedOrder.status === 'CANCELLED' ? 'red' :
                    selectedOrder.status === 'CONFIRMED' ? 'blue' : 'orange'
                  }>
                    {
                      selectedOrder.status === 'PENDING' ? '待确认' :
                      selectedOrder.status === 'CONFIRMED' ? '已确认' :
                      selectedOrder.status === 'RECEIVED' ? '已收货' : '已取消'
                    }
                  </Tag>
                </p>
                <p><strong>创建时间：</strong>{new Date(selectedOrder.createdAt).toLocaleString('zh-CN')}</p>
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