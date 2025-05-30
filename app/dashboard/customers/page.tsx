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
  EnvironmentOutlined,
  BankOutlined
} from '@ant-design/icons'

const { Option } = Select
const { Search } = Input

// 定义客户数据类型
interface CustomerData {
  id: string
  name: string
  contactName?: string
  phone?: string
  email?: string
  address?: string
  company?: string
  taxNumber?: string
  creditLevel?: 'A' | 'B' | 'C' | 'D'
  status: 'ACTIVE' | 'INACTIVE'
  notes?: string
  createdAt: string
  updatedAt: string
}

export default function CustomersPage() {
  const [loading, setLoading] = useState(false)
  const [customers, setCustomers] = useState<CustomerData[]>([])
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerData | null>(null)
  const [form] = Form.useForm()
  const [searchKeyword, setSearchKeyword] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  })

  // 获取客户列表
  const fetchCustomers = async (page = 1, pageSize = 10) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString()
      })
      
      if (searchKeyword) {
        params.append('search', searchKeyword)
      }
      
      if (selectedStatus) {
        params.append('status', selectedStatus)
      }

      const response = await fetch(`/api/customers?${params}`)
      const result = await response.json()

      if (result.success) {
        setCustomers(result.data)
        setPagination({
          current: page,
          pageSize,
          total: result.pagination.total
        })
      } else {
        message.error(result.message || '获取客户列表失败')
      }
    } catch (error) {
      console.error('获取客户列表失败:', error)
      message.error('获取客户列表失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCustomers()
  }, [])

  useEffect(() => {
    fetchCustomers(1, pagination.pageSize)
  }, [searchKeyword, selectedStatus])

  const columns = [
    {
      title: '客户名称',
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
      title: '公司名称',
      dataIndex: 'company',
      key: 'company',
      render: (company?: string) => company ? (
        <span>
          <BankOutlined className="mr-1" />
          {company}
        </span>
      ) : '-'
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
      render: (record: CustomerData) => (
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

  const handleEdit = (record: CustomerData) => {
    setSelectedCustomer(record)
    form.setFieldsValue(record)
    setModalVisible(true)
  }

  const handleDelete = (record: CustomerData) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除客户"${record.name}"吗？`,
      onOk: async () => {
        try {
          const response = await fetch(`/api/customers?id=${record.id}`, {
            method: 'DELETE'
          })
          const result = await response.json()

          if (result.success) {
            message.success('客户删除成功')
            fetchCustomers(pagination.current, pagination.pageSize)
          } else {
            message.error(result.message || '删除失败')
          }
        } catch (error) {
          console.error('删除客户失败:', error)
          message.error('删除客户失败')
        }
      }
    })
  }

  const handleAddCustomer = () => {
    setSelectedCustomer(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleSubmit = async (values: any) => {
    setLoading(true)
    try {
      const url = selectedCustomer ? '/api/customers' : '/api/customers'
      const method = selectedCustomer ? 'PUT' : 'POST'
      const data = selectedCustomer ? { ...values, id: selectedCustomer.id } : values

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      const result = await response.json()

      if (result.success) {
        message.success(selectedCustomer ? '客户更新成功' : '客户创建成功')
        setModalVisible(false)
        fetchCustomers(pagination.current, pagination.pageSize)
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

  const handleSearch = (value: string) => {
    setSearchKeyword(value)
  }

  const handleStatusChange = (value: string) => {
    setSelectedStatus(value)
  }

  const handleTableChange = (paginationInfo: any) => {
    fetchCustomers(paginationInfo.current, paginationInfo.pageSize)
  }

  return (
    <div className="p-6">
      <Card>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">客户管理</h2>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={handleAddCustomer}
          >
            新增客户
          </Button>
        </div>

        {/* 搜索和筛选 */}
        <Row gutter={[16, 16]} className="mb-4">
          <Col xs={24} sm={12} md={8}>
            <Search
              placeholder="搜索客户名称、联系人、电话、邮箱或公司"
              allowClear
              enterButton={<SearchOutlined />}
              onSearch={handleSearch}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="客户状态"
              allowClear
              style={{ width: '100%' }}
              onChange={handleStatusChange}
            >
              <Option value="ACTIVE">启用</Option>
              <Option value="INACTIVE">停用</Option>
            </Select>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={customers}
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

      {/* 新增/编辑客户模态框 */}
      <Modal
        title={selectedCustomer ? '编辑客户' : '新增客户'}
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
                label="客户名称"
                rules={[{ required: true, message: '请输入客户名称' }]}
              >
                <Input placeholder="请输入客户名称" />
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
                rules={[
                  { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码' }
                ]}
              >
                <Input placeholder="请输入联系电话" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="email"
                label="邮箱"
                rules={[
                  { type: 'email', message: '请输入正确的邮箱地址' }
                ]}
              >
                <Input placeholder="请输入邮箱地址" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="company"
                label="公司名称"
              >
                <Input placeholder="请输入公司名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="taxNumber"
                label="税号"
              >
                <Input placeholder="请输入税号" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
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