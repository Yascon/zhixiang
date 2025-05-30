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
  Tabs,
  Row,
  Col,
  Statistic,
  Descriptions,
  Badge,
  Popconfirm,
  Tooltip
} from 'antd'
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined,
  UserOutlined,
  TeamOutlined,
  SafetyOutlined,
  KeyOutlined,
  LockOutlined,
  MailOutlined,
  ReloadOutlined
} from '@ant-design/icons'
import { ROLES, PERMISSIONS, ROLE_PERMISSIONS } from '@/lib/auth'

const { Option } = Select
const { TabPane } = Tabs

interface User {
  id: string
  email: string
  name: string
  role: string
  phone?: string
  createdAt: string
  lastLogin?: string
}

// 获取认证头信息
const getAuthHeaders = (): Record<string, string> => {
  const user = localStorage.getItem('user')
  console.log('🔍 localStorage中的user数据:', user)
  
  if (user) {
    try {
      const userData = JSON.parse(user)
      console.log('🔍 解析后的用户数据:', userData)
      console.log('🔍 token:', userData.token ? userData.token.substring(0, 20) + '...' : '无token')
      
      return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userData.token}`
      }
    } catch (error) {
      console.error('🔍 解析用户数据失败:', error)
      return {
        'Content-Type': 'application/json'
      }
    }
  }
  
  console.log('🔍 localStorage中没有用户数据')
  return {
    'Content-Type': 'application/json'
  }
}

export default function UsersPage() {
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [form] = Form.useForm()

  // 获取用户列表
  const fetchUsers = async () => {
    setLoading(true)
    try {
      const headers = getAuthHeaders()
      console.log('🔍 发送请求的headers:', headers)
      
      const response = await fetch('/api/users', {
        headers
      })
      
      console.log('🔍 响应状态:', response.status)
      const result = await response.json()
      console.log('🔍 响应结果:', result)
      
      if (result.success) {
        setUsers(result.data)
      } else {
        message.error(result.message)
      }
    } catch (error) {
      console.error('🔍 请求失败:', error)
      message.error('获取用户列表失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const columns = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => (
        <Space>
          <UserOutlined />
          {text || '未设置'}
        </Space>
      )
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      render: (text: string) => (
        <Space>
          <MailOutlined />
          {text}
        </Space>
      )
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      key: 'phone',
      render: (text: string) => text || '未设置'
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => {
        const roleConfig = {
          'ADMIN': { color: 'red', text: '超级管理员' },
          'MANAGER': { color: 'blue', text: '管理员' },
          'USER': { color: 'green', text: '普通用户' }
        }
        const config = roleConfig[role as keyof typeof roleConfig] || { color: 'default', text: role }
        return <Tag color={config.color}>{config.text}</Tag>
      }
    },
    {
      title: '注册时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString('zh-CN')
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: User) => (
        <Space>
          <Tooltip title="编辑用户">
            <Button 
              type="link" 
              icon={<EditOutlined />} 
              onClick={() => handleEdit(record)}
            >
              编辑
            </Button>
          </Tooltip>
          
          <Tooltip title="重置密码">
            <Popconfirm
              title="重置密码"
              description="确定要将该用户密码重置为123456吗？"
              onConfirm={() => handleResetPassword(record)}
              okText="确定"
              cancelText="取消"
            >
              <Button 
                type="link" 
                icon={<LockOutlined />}
                danger
              >
                重置密码
              </Button>
            </Popconfirm>
          </Tooltip>

          <Tooltip title="删除用户">
            <Popconfirm
              title="删除用户"
              description="确定要删除这个用户吗？此操作不可恢复。"
              onConfirm={() => handleDelete(record)}
              okText="确定"
              cancelText="取消"
            >
              <Button 
                type="link" 
                icon={<DeleteOutlined />} 
                danger
              >
                删除
              </Button>
            </Popconfirm>
          </Tooltip>
        </Space>
      )
    }
  ]

  const handleEdit = (record: User) => {
    setSelectedUser(record)
    form.setFieldsValue(record)
    setModalVisible(true)
  }

  const handleDelete = (record: User) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除用户 "${record.name}" 吗？`,
      onOk: async () => {
        try {
          const response = await fetch(`/api/users/${record.id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
          })
          const result = await response.json()
          
          if (result.success) {
            message.success('用户删除成功')
            fetchUsers()
          } else {
            message.error(result.message)
          }
        } catch (error) {
          message.error('删除失败，请重试！')
        }
      }
    })
  }

  const handleResetPassword = async (record: User) => {
    try {
      const response = await fetch(`/api/users/${record.id}/reset-password`, {
        method: 'POST',
        headers: getAuthHeaders()
      })
      
      const result = await response.json()
      
      if (result.success) {
        message.success('密码重置成功，新密码为：123456')
      } else {
        message.error(result.message)
      }
    } catch (error) {
      message.error('重置密码失败，请重试')
    }
  }

  const handleAddUser = () => {
    setSelectedUser(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleSubmit = async (values: any) => {
    setLoading(true)
    try {
      const url = selectedUser ? `/api/users/${selectedUser.id}` : '/api/users'
      const method = selectedUser ? 'PUT' : 'POST'
      
      const headers = getAuthHeaders()
      console.log('🔍 创建用户请求 - URL:', url)
      console.log('🔍 创建用户请求 - Method:', method)
      console.log('🔍 创建用户请求 - Headers:', headers)
      console.log('🔍 创建用户请求 - Body:', values)
      
      const response = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(values)
      })
      
      console.log('🔍 创建用户响应状态:', response.status)
      const result = await response.json()
      console.log('🔍 创建用户响应结果:', result)
      
      if (result.success) {
        message.success(selectedUser ? '用户更新成功' : '用户创建成功')
        setModalVisible(false)
        fetchUsers()
      } else {
        message.error(result.message)
      }
    } catch (error) {
      console.error('🔍 创建用户请求失败:', error)
      message.error('操作失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  // 角色统计
  const roleStats = users.reduce((acc, user) => {
    acc[user.role] = (acc[user.role] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="p-6">
      <Card>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">用户管理</h2>
          <Space>
            <Button 
              icon={<ReloadOutlined />} 
              onClick={fetchUsers}
              loading={loading}
            >
              刷新
            </Button>
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={handleAddUser}
            >
              新增用户
            </Button>
          </Space>
        </div>

        <Tabs defaultActiveKey="1">
          <TabPane tab="用户列表" key="1">
            <Table
              columns={columns}
              dataSource={users}
              loading={loading}
              rowKey="id"
              pagination={{
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total: number) => `共 ${total} 条记录`
              }}
            />
          </TabPane>
          
          <TabPane tab="角色权限" key="2">
            <Row gutter={[16, 16]}>
              <Col xs={24} lg={8}>
                <Card title="角色统计" size="small">
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div className="flex justify-between">
                      <span>超级管理员:</span>
                      <Badge count={roleStats.ADMIN || 0} color="red" />
                    </div>
                    <div className="flex justify-between">
                      <span>管理员:</span>
                      <Badge count={roleStats.MANAGER || 0} color="orange" />
                    </div>
                    <div className="flex justify-between">
                      <span>普通用户:</span>
                      <Badge count={roleStats.USER || 0} color="blue" />
                    </div>
                  </Space>
                </Card>
              </Col>
              
              <Col xs={24} lg={16}>
                <Card title="权限说明" size="small">
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="超级管理员">
                      拥有系统所有权限，包括用户管理、系统配置等
                    </Descriptions.Item>
                    <Descriptions.Item label="管理员">
                      拥有业务管理权限，包括会员、商品、订单、财务管理
                    </Descriptions.Item>
                    <Descriptions.Item label="普通用户">
                      只能查看基础数据，无法进行修改操作
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>
            </Row>

            <Card title="详细权限配置" className="mt-4" size="small">
              <Row gutter={[16, 16]}>
                {Object.entries(ROLE_PERMISSIONS).map(([role, permissions]) => (
                  <Col xs={24} lg={8} key={role}>
                    <Card 
                      title={
                        <span>
                          {role === 'ADMIN' && '超级管理员'}
                          {role === 'MANAGER' && '管理员'}
                          {role === 'USER' && '普通用户'}
                        </span>
                      }
                      size="small"
                    >
                      <Space direction="vertical" size="small" style={{ width: '100%' }}>
                        {permissions.map(permission => (
                          <Tag key={permission} className="text-xs">
                            {getPermissionLabel(permission)}
                          </Tag>
                        ))}
                      </Space>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Card>
          </TabPane>

          <TabPane tab="系统统计" key="3">
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} lg={6}>
                <Card>
                  <Statistic
                    title="总用户数"
                    value={users.length}
                    prefix={<UserOutlined />}
                    suffix="人"
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card>
                  <Statistic
                    title="管理员"
                    value={roleStats.ADMIN || 0}
                    prefix={<SafetyOutlined />}
                    suffix="人"
                    valueStyle={{ color: '#cf1322' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card>
                  <Statistic
                    title="普通管理员"
                    value={roleStats.MANAGER || 0}
                    prefix={<TeamOutlined />}
                    suffix="人"
                    valueStyle={{ color: '#fa8c16' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card>
                  <Statistic
                    title="普通用户"
                    value={roleStats.USER || 0}
                    prefix={<KeyOutlined />}
                    suffix="人"
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Card>
              </Col>
            </Row>
          </TabPane>
        </Tabs>
      </Card>

      {/* 新增/编辑用户模态框 */}
      <Modal
        title={selectedUser ? '编辑用户' : '新增用户'}
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
          <Form.Item
            name="name"
            label="姓名"
            rules={[{ required: true, message: '请输入姓名' }]}
          >
            <Input 
              prefix={<UserOutlined />}
              placeholder="请输入姓名" 
            />
          </Form.Item>

          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入正确的邮箱格式' }
            ]}
          >
            <Input 
              prefix={<MailOutlined />}
              placeholder="请输入邮箱"
              disabled={!!selectedUser}
            />
          </Form.Item>

          <Form.Item
            name="phone"
            label="手机号"
            rules={[
              { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }
            ]}
          >
            <Input placeholder="请输入手机号" />
          </Form.Item>

          {!selectedUser && (
            <Form.Item
              name="password"
              label="密码"
              rules={[
                { required: true, message: '请输入密码' },
                { min: 6, message: '密码至少6位' }
              ]}
            >
              <Input.Password 
                prefix={<LockOutlined />}
                placeholder="请输入密码" 
              />
            </Form.Item>
          )}

          <Form.Item
            name="role"
            label="角色"
            rules={[{ required: true, message: '请选择角色' }]}
          >
            <Select placeholder="请选择角色">
              <Option value="USER">普通用户</Option>
              <Option value="MANAGER">管理员</Option>
              <Option value="ADMIN">超级管理员</Option>
            </Select>
          </Form.Item>

          <Form.Item className="mb-0">
            <Space className="w-full justify-end">
              <Button onClick={() => setModalVisible(false)}>
                取消
              </Button>
              <Button type="primary" htmlType="submit">
                {selectedUser ? '更新' : '创建'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

// 权限标签映射
function getPermissionLabel(permission: string): string {
  const labels: Record<string, string> = {
    'MEMBER_READ': '查看会员',
    'MEMBER_WRITE': '管理会员',
    'MEMBER_DELETE': '删除会员',
    'PRODUCT_READ': '查看商品',
    'PRODUCT_WRITE': '管理商品',
    'PRODUCT_DELETE': '删除商品',
    'ORDER_READ': '查看订单',
    'ORDER_WRITE': '管理订单',
    'ORDER_DELETE': '删除订单',
    'FINANCE_READ': '查看财务',
    'FINANCE_WRITE': '管理财务',
    'SYSTEM_ADMIN': '系统管理'
  }
  return labels[permission] || permission
} 