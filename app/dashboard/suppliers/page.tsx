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
  message,
  Row,
  Col
} from 'antd'
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined,
  SearchOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined
} from '@ant-design/icons'

const { Option } = Select
const { Search } = Input

// 定义供应商数据类型
interface SupplierData {
  id: string
  name: string
  contactName?: string
  phone?: string
  email?: string
  address?: string
  category?: string
  status: 'ACTIVE' | 'INACTIVE'
  creditLevel?: 'A' | 'B' | 'C' | 'D'
  notes?: string
  createdAt: string
  updatedAt: string
}

export default function SuppliersPage() {
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedSupplier, setSelectedSupplier] = useState<SupplierData | null>(null)
  const [suppliers, setSuppliers] = useState<SupplierData[]>([])
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  })
  const [searchKeyword, setSearchKeyword] = useState('')
  const [form] = Form.useForm()

  // 获取供应商列表
  const fetchSuppliers = async (page = 1, pageSize = 10) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString()
      })
      
      if (searchKeyword) params.append('keyword', searchKeyword)

      const response = await fetch(`/api/suppliers?${params}`)
      const result = await response.json()

      if (result.success) {
        setSuppliers(result.data)
        setPagination({
          current: result.pagination.page,
          pageSize: result.pagination.pageSize,
          total: result.pagination.total
        })
      } else {
        message.error(result.message || '获取供应商列表失败')
      }
    } catch (error) {
      console.error('获取供应商列表失败:', error)
      message.error('获取供应商列表失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSuppliers()
  }, [])

  useEffect(() => {
    fetchSuppliers(1, pagination.pageSize)
  }, [searchKeyword])

  const categories = [
    { value: '电子产品', label: '电子产品' },
    { value: '食品', label: '食品' },
    { value: '饮料', label: '饮料' },
    { value: '酒水', label: '酒水' },
    { value: '日用百货', label: '日用百货' },
    { value: '服装鞋帽', label: '服装鞋帽' }
  ]

  const columns = [
    {
      title: '供应商名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '联系人',
      dataIndex: 'contactName',
      key: 'contactName',
      render: (contactName?: string) => contactName || '-'
    },
    {
      title: '联系电话',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone?: string) => phone ? (
        <span>
          <PhoneOutlined className="mr-1" />
          {phone}
        </span>
      ) : '-'
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      render: (email?: string) => email ? (
        <span>
          <MailOutlined className="mr-1" />
          {email}
        </span>
      ) : '-'
    },
    {
      title: '供应类别',
      dataIndex: 'category',
      key: 'category',
      render: (category?: string) => category ? <Tag color="blue">{category}</Tag> : '-'
    },
    {
      title: '信用等级',
      dataIndex: 'creditLevel',
      key: 'creditLevel',
      render: (level?: string) => {
        if (!level) return '-'
        const colors = {
          'A': 'green',
          'B': 'blue', 
          'C': 'orange',
          'D': 'red'
        }
        return <Tag color={colors[level as keyof typeof colors]}>{level}级</Tag>
      }
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'ACTIVE' ? 'green' : 'red'}>
          {status === 'ACTIVE' ? '启用' : '停用'}
        </Tag>
      )
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString('zh-CN')
    },
    {
      title: '操作',
      key: 'action',
      render: (record: SupplierData) => (
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

  const handleEdit = (record: SupplierData) => {
    setSelectedSupplier(record)
    form.setFieldsValue(record)
    setModalVisible(true)
  }

  const handleDelete = (record: SupplierData) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除供应商 "${record.name}" 吗？`,
      onOk: async () => {
        try {
          const response = await fetch(`/api/suppliers?id=${record.id}`, {
            method: 'DELETE'
          })
          const result = await response.json()

          if (result.success) {
            message.success('供应商删除成功！')
            fetchSuppliers(pagination.current, pagination.pageSize)
          } else {
            message.error(result.message || '删除失败')
          }
        } catch (error) {
          console.error('删除供应商失败:', error)
          message.error('删除失败，请重试！')
        }
      }
    })
  }

  const handleAddSupplier = () => {
    setSelectedSupplier(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleSubmit = async (values: any) => {
    setLoading(true)
    try {
      const method = selectedSupplier ? 'PUT' : 'POST'
      const body = selectedSupplier 
        ? { ...values, id: selectedSupplier.id }
        : values

      const response = await fetch('/api/suppliers', {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      })

      const result = await response.json()

      if (result.success) {
        message.success(selectedSupplier ? '供应商更新成功！' : '供应商创建成功！')
        setModalVisible(false)
        fetchSuppliers(pagination.current, pagination.pageSize)
      } else {
        message.error(result.message || '保存失败')
      }
    } catch (error) {
      console.error('保存供应商失败:', error)
      message.error('保存失败，请重试！')
    } finally {
      setLoading(false)
    }
  }

  const handleTableChange = (paginationConfig: any) => {
    fetchSuppliers(paginationConfig.current, paginationConfig.pageSize)
  }

  const handleSearch = (value: string) => {
    setSearchKeyword(value)
  }

  return (
    <div className="p-6">
      <Card>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">供应商管理</h2>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={handleAddSupplier}
          >
            新增供应商
          </Button>
        </div>

        {/* 搜索 */}
        <Row gutter={[16, 16]} className="mb-4">
          <Col xs={24} sm={12} md={8}>
            <Search
              placeholder="搜索供应商名称、联系人或电话"
              allowClear
              enterButton={<SearchOutlined />}
              onSearch={handleSearch}
            />
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={suppliers}
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

      {/* 新增/编辑供应商模态框 */}
      <Modal
        title={selectedSupplier ? '编辑供应商' : '新增供应商'}
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
                label="供应商名称"
                rules={[{ required: true, message: '请输入供应商名称' }]}
              >
                <Input placeholder="请输入供应商名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="contactName"
                label="联系人"
              >
                <Input placeholder="请输入联系人姓名" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="phone"
                label="联系电话"
              >
                <Input placeholder="请输入联系电话" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="email"
                label="邮箱"
              >
                <Input placeholder="请输入邮箱地址" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="category"
                label="供应类别"
              >
                <Select placeholder="请选择供应类别" allowClear>
                  {categories.map(cat => (
                    <Option key={cat.value} value={cat.value}>{cat.label}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="creditLevel"
                label="信用等级"
              >
                <Select placeholder="请选择信用等级" allowClear>
                  <Option value="A">A级</Option>
                  <Option value="B">B级</Option>
                  <Option value="C">C级</Option>
                  <Option value="D">D级</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="status"
                label="状态"
                rules={[{ required: true, message: '请选择状态' }]}
              >
                <Select placeholder="请选择状态">
                  <Option value="ACTIVE">启用</Option>
                  <Option value="INACTIVE">停用</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="address"
            label="地址"
          >
            <Input placeholder="请输入详细地址" />
          </Form.Item>

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
    </div>
  )
} 