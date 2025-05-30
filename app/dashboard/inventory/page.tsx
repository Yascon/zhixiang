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
  message,
  Row,
  Col,
  Statistic,
  Progress
} from 'antd'
import { 
  SearchOutlined,
  WarningOutlined,
  InboxOutlined,
  RiseOutlined,
  FallOutlined
} from '@ant-design/icons'

const { Option } = Select
const { Search } = Input

// 定义库存数据类型
interface InventoryData {
  id: string
  name: string
  sku: string
  category: {
    name: string
  }
  stock: number
  minStock: number
  maxStock?: number
  costPrice: number
  stockStatus: 'normal' | 'low' | 'out' | 'excess'
  totalValue: number
  lastMovement: string
}

export default function InventoryPage() {
  const [loading, setLoading] = useState(false)
  const [adjustModalVisible, setAdjustModalVisible] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<InventoryData | null>(null)
  const [inventory, setInventory] = useState<InventoryData[]>([])
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  })
  const [searchKeyword, setSearchKeyword] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [categories, setCategories] = useState<any[]>([])
  const [form] = Form.useForm()

  // 获取库存数据
  const fetchInventory = async (page = 1, pageSize = 10) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString()
      })
      
      if (searchKeyword) params.append('keyword', searchKeyword)
      if (selectedCategory) params.append('category', selectedCategory)
      if (selectedStatus) params.append('status', selectedStatus)

      const response = await fetch(`/api/inventory?${params}`)
      const result = await response.json()

      if (result.success) {
        setInventory(result.data)
        setPagination({
          current: result.pagination.page,
          pageSize: result.pagination.pageSize,
          total: result.pagination.total
        })
      } else {
        message.error(result.message || '获取库存数据失败')
      }
    } catch (error) {
      console.error('获取库存数据失败:', error)
      message.error('获取库存数据失败')
    } finally {
      setLoading(false)
    }
  }

  // 获取分类列表
  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      const result = await response.json()

      if (result.success) {
        setCategories(result.data)
      } else {
        message.error(result.message || '获取分类列表失败')
      }
    } catch (error) {
      console.error('获取分类列表失败:', error)
      message.error('获取分类列表失败')
    }
  }

  useEffect(() => {
    fetchInventory()
    fetchCategories()
  }, [])

  useEffect(() => {
    fetchInventory(1, pagination.pageSize)
  }, [searchKeyword, selectedCategory, selectedStatus])

  // 计算统计数据
  const stats = {
    totalProducts: inventory.length,
    lowStockCount: inventory.filter(item => item.stockStatus === 'low').length,
    outOfStockCount: inventory.filter(item => item.stockStatus === 'out').length,
    totalValue: inventory.reduce((sum, item) => sum + item.totalValue, 0)
  }

  const columns = [
    {
      title: 'SKU',
      dataIndex: 'sku',
      key: 'sku',
      width: 120,
    },
    {
      title: '商品名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
    },
    {
      title: '分类',
      dataIndex: ['category', 'name'],
      key: 'category',
      width: 120,
    },
    {
      title: '当前库存',
      dataIndex: 'stock',
      key: 'stock',
      width: 100,
      render: (stock: number, record: InventoryData) => {
        const isLowStock = record.stockStatus === 'low'
        const isOutOfStock = record.stockStatus === 'out'
        return (
          <span style={{ 
            color: isOutOfStock ? '#ff4d4f' : isLowStock ? '#faad14' : undefined,
            fontWeight: (isLowStock || isOutOfStock) ? 'bold' : 'normal'
          }}>
            {stock}
            {isLowStock && ' ⚠️'}
            {isOutOfStock && ' ❌'}
          </span>
        )
      }
    },
    {
      title: '最低库存',
      dataIndex: 'minStock',
      key: 'minStock',
      width: 100,
    },
    {
      title: '最高库存',
      dataIndex: 'maxStock',
      key: 'maxStock',
      width: 100,
      render: (maxStock?: number) => maxStock || '-'
    },
    {
      title: '状态',
      dataIndex: 'stockStatus',
      key: 'stockStatus',
      width: 100,
      render: (status: string) => {
        const statusConfig = {
          'normal': { color: 'green', text: '正常' },
          'low': { color: 'orange', text: '库存不足' },
          'out': { color: 'red', text: '缺货' },
          'excess': { color: 'purple', text: '库存过多' }
        }
        const config = statusConfig[status as keyof typeof statusConfig]
        return <Tag color={config.color}>{config.text}</Tag>
      }
    },
    {
      title: '成本价',
      dataIndex: 'costPrice',
      key: 'costPrice',
      width: 100,
      render: (price: number) => `¥${price.toFixed(2)}`
    },
    {
      title: '库存价值',
      dataIndex: 'totalValue',
      key: 'totalValue',
      width: 120,
      render: (value: number) => `¥${value.toFixed(2)}`
    },
    {
      title: '最后变动',
      dataIndex: 'lastMovement',
      key: 'lastMovement',
      width: 150,
      render: (date: string) => new Date(date).toLocaleDateString('zh-CN')
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (record: InventoryData) => (
        <Space size="middle">
          <Button 
            type="link" 
            onClick={() => handleStockAdjust(record)}
          >
            库存调整
          </Button>
        </Space>
      ),
    },
  ]

  const handleStockAdjust = (record: InventoryData) => {
    setSelectedProduct(record)
    form.setFieldsValue({
      currentStock: record.stock,
      adjustmentType: 'set',
      adjustmentQuantity: record.stock,
      reason: ''
    })
    setAdjustModalVisible(true)
  }

  const handleAdjustSubmit = async (values: any) => {
    if (!selectedProduct) return

    setLoading(true)
    try {
      const response = await fetch('/api/inventory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: selectedProduct.id,
          adjustmentType: values.adjustmentType,
          adjustmentQuantity: values.adjustmentQuantity,
          reason: values.reason
        }),
      })

      const result = await response.json()

      if (result.success) {
        message.success('库存调整成功！')
        setAdjustModalVisible(false)
        fetchInventory(pagination.current, pagination.pageSize)
      } else {
        message.error(result.message || '库存调整失败')
      }
    } catch (error) {
      console.error('库存调整失败:', error)
      message.error('调整失败，请重试！')
    } finally {
      setLoading(false)
    }
  }

  const handleTableChange = (paginationConfig: any) => {
    fetchInventory(paginationConfig.current, paginationConfig.pageSize)
  }

  const handleSearch = (value: string) => {
    setSearchKeyword(value)
  }

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value)
  }

  const handleStatusChange = (value: string) => {
    setSelectedStatus(value)
  }

  return (
    <div className="p-6">
      {/* 统计卡片 */}
      <Row gutter={16} className="mb-6">
        <Col span={6}>
          <Card>
            <Statistic
              title="商品总数"
              value={stats.totalProducts}
              prefix={<InboxOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="库存不足"
              value={stats.lowStockCount}
              prefix={<WarningOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="缺货商品"
              value={stats.outOfStockCount}
              prefix={<FallOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="库存总价值"
              value={stats.totalValue}
              prefix="¥"
              precision={2}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">库存管理</h2>
        </div>

        {/* 搜索和筛选 */}
        <Row gutter={[16, 16]} className="mb-4">
          <Col xs={24} sm={12} md={6}>
            <Search
              placeholder="搜索商品名称或SKU"
              allowClear
              enterButton={<SearchOutlined />}
              onSearch={handleSearch}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="选择分类"
              allowClear
              style={{ width: '100%' }}
              onChange={handleCategoryChange}
            >
              {categories.map(category => (
                <Option key={category.id} value={category.name}>{category.name}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="库存状态"
              allowClear
              style={{ width: '100%' }}
              onChange={handleStatusChange}
            >
              <Option value="normal">正常</Option>
              <Option value="low">库存不足</Option>
              <Option value="out">缺货</Option>
              <Option value="excess">库存过多</Option>
            </Select>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={inventory}
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total: number) => `共 ${total} 条记录`
          }}
          onChange={handleTableChange}
          scroll={{ x: 1200 }}
          rowKey="id"
        />
      </Card>

      {/* 库存调整弹窗 */}
      <Modal
        title="库存调整"
        open={adjustModalVisible}
        onCancel={() => setAdjustModalVisible(false)}
        footer={null}
        width={500}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAdjustSubmit}
        >
          <Form.Item label="商品信息">
            <div className="p-3 bg-gray-50 rounded">
              <div><strong>商品名称：</strong>{selectedProduct?.name}</div>
              <div><strong>SKU：</strong>{selectedProduct?.sku}</div>
              <div><strong>当前库存：</strong>{selectedProduct?.stock}</div>
            </div>
          </Form.Item>

          <Form.Item
            name="adjustmentType"
            label="调整方式"
            rules={[{ required: true, message: '请选择调整方式' }]}
          >
            <Select placeholder="请选择调整方式">
              <Option value="set">设置为</Option>
              <Option value="add">增加</Option>
              <Option value="subtract">减少</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="adjustmentQuantity"
            label="调整数量"
            rules={[{ required: true, message: '请输入调整数量' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="请输入调整数量"
              min={0}
            />
          </Form.Item>

          <Form.Item
            name="reason"
            label="调整原因"
            rules={[{ required: true, message: '请输入调整原因' }]}
          >
            <Input.TextArea
              placeholder="请输入调整原因"
              rows={3}
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                确认调整
              </Button>
              <Button onClick={() => setAdjustModalVisible(false)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
} 