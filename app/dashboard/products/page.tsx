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
  Image,
  Upload,
  Switch
} from 'antd'
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined,
  UploadOutlined,
  SearchOutlined
} from '@ant-design/icons'

const { Option } = Select
const { Search } = Input

// 定义商品数据类型
interface ProductData {
  id: string
  name: string
  sku: string
  description?: string
  barcode?: string
  categoryId: string
  category?: {
    id: string
    name: string
  }
  costPrice: number
  sellingPrice: number
  memberPrice?: number
  stock: number
  minStock: number
  maxStock?: number
  status: 'ACTIVE' | 'INACTIVE' | 'DISCONTINUED'
  createdAt: string
  updatedAt: string
}

interface CategoryData {
  id: string
  name: string
  description?: string
  parentId?: string
}

export default function ProductsPage() {
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<ProductData | null>(null)
  const [products, setProducts] = useState<ProductData[]>([])
  const [categories, setCategories] = useState<CategoryData[]>([])
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  })
  const [searchKeyword, setSearchKeyword] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [form] = Form.useForm()

  // 获取商品列表
  const fetchProducts = async (page = 1, pageSize = 10) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString()
      })
      
      if (searchKeyword) params.append('keyword', searchKeyword)
      if (selectedCategory) params.append('category', selectedCategory)
      if (selectedStatus) params.append('status', selectedStatus)

      const response = await fetch(`/api/products?${params}`)
      const result = await response.json()

      if (result.success) {
        setProducts(result.data)
        setPagination({
          current: result.pagination.page,
          pageSize: result.pagination.pageSize,
          total: result.pagination.total
        })
      } else {
        message.error(result.message || '获取商品列表失败')
      }
    } catch (error) {
      console.error('获取商品列表失败:', error)
      message.error('获取商品列表失败')
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
    fetchProducts()
    fetchCategories()
  }, [])

  useEffect(() => {
    fetchProducts(1, pagination.pageSize)
  }, [searchKeyword, selectedCategory, selectedStatus])

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
      render: (categoryName: string) => categoryName || '-'
    },
    {
      title: '成本价',
      dataIndex: 'costPrice',
      key: 'costPrice',
      width: 100,
      render: (price: number) => `¥${price.toFixed(2)}`
    },
    {
      title: '销售价',
      dataIndex: 'sellingPrice',
      key: 'sellingPrice',
      width: 100,
      render: (price: number) => `¥${price.toFixed(2)}`
    },
    {
      title: '会员价',
      dataIndex: 'memberPrice',
      key: 'memberPrice',
      width: 100,
      render: (price?: number) => price ? `¥${price.toFixed(2)}` : '-'
    },
    {
      title: '库存',
      dataIndex: 'stock',
      key: 'stock',
      width: 80,
      render: (stock: number, record: ProductData) => {
        const isLowStock = stock <= record.minStock
        return (
          <span style={{ color: isLowStock ? '#ff4d4f' : undefined }}>
            {stock}
            {isLowStock && ' ⚠️'}
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
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const statusConfig = {
          'ACTIVE': { color: 'green', text: '正常' },
          'INACTIVE': { color: 'orange', text: '停用' },
          'DISCONTINUED': { color: 'red', text: '停产' }
        }
        const config = statusConfig[status as keyof typeof statusConfig]
        return <Tag color={config.color}>{config.text}</Tag>
      }
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (record: ProductData) => (
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

  const handleEdit = (record: ProductData) => {
    setSelectedProduct(record)
    form.setFieldsValue({
      ...record,
      categoryId: record.categoryId
    })
    setModalVisible(true)
  }

  const handleDelete = (record: ProductData) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除商品 "${record.name}" 吗？`,
      onOk: async () => {
        try {
          const response = await fetch(`/api/products?id=${record.id}`, {
            method: 'DELETE'
          })
          const result = await response.json()

          if (result.success) {
            message.success('商品删除成功！')
            fetchProducts(pagination.current, pagination.pageSize)
          } else {
            message.error(result.message || '删除失败')
          }
        } catch (error) {
          console.error('删除商品失败:', error)
          message.error('删除失败，请重试！')
        }
      }
    })
  }

  const handleAddProduct = () => {
    setSelectedProduct(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleSubmit = async (values: any) => {
    setLoading(true)
    try {
      const method = selectedProduct ? 'PUT' : 'POST'
      const body = selectedProduct 
        ? { ...values, id: selectedProduct.id }
        : values

      const response = await fetch('/api/products', {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      })

      const result = await response.json()

      if (result.success) {
        message.success(selectedProduct ? '商品更新成功！' : '商品创建成功！')
        setModalVisible(false)
        fetchProducts(pagination.current, pagination.pageSize)
      } else {
        message.error(result.message || '保存失败')
      }
    } catch (error) {
      console.error('保存商品失败:', error)
      message.error('保存失败，请重试！')
    } finally {
      setLoading(false)
    }
  }

  const handleTableChange = (paginationConfig: any) => {
    fetchProducts(paginationConfig.current, paginationConfig.pageSize)
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
      <Card>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">商品管理</h2>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={handleAddProduct}
          >
            新增商品
          </Button>
        </div>

        {/* 搜索和筛选 */}
        <Row gutter={[16, 16]} className="mb-4">
          <Col xs={24} sm={12} md={8}>
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
              {categories.map(cat => (
                <Option key={cat.id} value={cat.name}>{cat.name}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="商品状态"
              allowClear
              style={{ width: '100%' }}
              onChange={handleStatusChange}
            >
              <Option value="ACTIVE">正常</Option>
              <Option value="INACTIVE">停用</Option>
              <Option value="DISCONTINUED">停产</Option>
            </Select>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={products}
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

      {/* 新增/编辑商品模态框 */}
      <Modal
        title={selectedProduct ? '编辑商品' : '新增商品'}
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
                name="name"
                label="商品名称"
                rules={[{ required: true, message: '请输入商品名称' }]}
              >
                <Input placeholder="请输入商品名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="sku"
                label="SKU编码"
                rules={[{ required: true, message: '请输入SKU编码' }]}
              >
                <Input placeholder="请输入SKU编码" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="categoryId"
                label="商品分类"
                rules={[{ required: true, message: '请选择商品分类' }]}
              >
                <Select placeholder="请选择商品分类">
                  {categories.map(cat => (
                    <Option key={cat.id} value={cat.id}>{cat.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="status"
                label="商品状态"
                rules={[{ required: true, message: '请选择商品状态' }]}
              >
                <Select placeholder="请选择商品状态">
                  <Option value="ACTIVE">正常</Option>
                  <Option value="INACTIVE">停用</Option>
                  <Option value="DISCONTINUED">停产</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="barcode"
                label="条形码"
              >
                <Input placeholder="请输入条形码" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="商品描述"
          >
            <Input.TextArea placeholder="请输入商品描述" rows={3} />
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="costPrice"
                label="成本价"
                rules={[{ required: true, message: '请输入成本价' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="请输入成本价"
                  min={0}
                  precision={2}
                  addonAfter="元"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="sellingPrice"
                label="销售价"
                rules={[{ required: true, message: '请输入销售价' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="请输入销售价"
                  min={0}
                  precision={2}
                  addonAfter="元"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="memberPrice"
                label="会员价"
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="请输入会员价"
                  min={0}
                  precision={2}
                  addonAfter="元"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="stock"
                label="当前库存"
                rules={[{ required: true, message: '请输入当前库存' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="请输入当前库存"
                  min={0}
                  addonAfter="件"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="minStock"
                label="最低库存"
                rules={[{ required: true, message: '请输入最低库存' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="请输入最低库存"
                  min={0}
                  addonAfter="件"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="maxStock"
                label="最高库存"
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="请输入最高库存"
                  min={0}
                  addonAfter="件"
                />
              </Form.Item>
            </Col>
          </Row>

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