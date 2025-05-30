'use client'

import { useState, useEffect } from 'react'
import { 
  Card, 
  Form, 
  Input, 
  Button, 
  message, 
  Tabs, 
  Avatar, 
  Descriptions, 
  Space,
  Divider,
  Alert
} from 'antd'
import { 
  UserOutlined, 
  MailOutlined, 
  PhoneOutlined, 
  LockOutlined,
  SafetyOutlined,
  CalendarOutlined
} from '@ant-design/icons'

const { TabPane } = Tabs

interface UserProfile {
  id: string
  email: string
  name: string
  role: string
  phone?: string
  avatar?: string
  createdAt: string
}

export default function ProfilePage() {
  const [loading, setLoading] = useState(false)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [profileForm] = Form.useForm()
  const [passwordForm] = Form.useForm()

  // 获取用户信息
  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/auth/profile')
      const result = await response.json()
      
      if (result.success) {
        setUserProfile(result.data)
        profileForm.setFieldsValue(result.data)
      } else {
        message.error(result.message)
      }
    } catch (error) {
      message.error('获取用户信息失败')
    }
  }

  useEffect(() => {
    fetchUserProfile()
  }, [])

  // 更新个人信息
  const handleUpdateProfile = async (values: any) => {
    setLoading(true)
    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      })
      
      const result = await response.json()
      
      if (result.success) {
        message.success('个人信息更新成功')
        setUserProfile(result.data)
      } else {
        message.error(result.message)
      }
    } catch (error) {
      message.error('更新失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  // 修改密码
  const handleChangePassword = async (values: any) => {
    setLoading(true)
    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      })
      
      const result = await response.json()
      
      if (result.success) {
        message.success('密码修改成功，请重新登录')
        passwordForm.resetFields()
        // 3秒后跳转到登录页
        setTimeout(() => {
          localStorage.removeItem('user')
          window.location.href = '/login'
        }, 3000)
      } else {
        message.error(result.message)
      }
    } catch (error) {
      message.error('修改密码失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const getRoleText = (role: string) => {
    const roleMap = {
      'ADMIN': '超级管理员',
      'MANAGER': '管理员',
      'USER': '普通用户'
    }
    return roleMap[role as keyof typeof roleMap] || role
  }

  const getRoleColor = (role: string) => {
    const colorMap = {
      'ADMIN': '#f50',
      'MANAGER': '#2db7f5',
      'USER': '#87d068'
    }
    return colorMap[role as keyof typeof colorMap] || '#666'
  }

  if (!userProfile) {
    return (
      <div className="p-6">
        <Card loading={true}>
          <div className="h-64"></div>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6">
      <Card>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">个人资料</h2>
        </div>

        <Tabs defaultActiveKey="1">
          <TabPane tab="基本信息" key="1">
            <div className="max-w-4xl">
              <div className="flex items-start space-x-8 mb-8">
                <div className="flex flex-col items-center">
                  <Avatar 
                    size={120} 
                    icon={<UserOutlined />}
                    src={userProfile.avatar}
                    className="mb-4"
                  />
                  <Button type="link" size="small">
                    更换头像
                  </Button>
                </div>
                
                <div className="flex-1">
                  <Descriptions column={2} bordered>
                    <Descriptions.Item label="用户ID" span={2}>
                      <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                        {userProfile.id}
                      </code>
                    </Descriptions.Item>
                    <Descriptions.Item label="邮箱地址">
                      <Space>
                        <MailOutlined />
                        {userProfile.email}
                      </Space>
                    </Descriptions.Item>
                    <Descriptions.Item label="用户角色">
                      <Space>
                        <SafetyOutlined style={{ color: getRoleColor(userProfile.role) }} />
                        <span style={{ color: getRoleColor(userProfile.role) }}>
                          {getRoleText(userProfile.role)}
                        </span>
                      </Space>
                    </Descriptions.Item>
                    <Descriptions.Item label="注册时间" span={2}>
                      <Space>
                        <CalendarOutlined />
                        {new Date(userProfile.createdAt).toLocaleString('zh-CN')}
                      </Space>
                    </Descriptions.Item>
                  </Descriptions>
                </div>
              </div>

              <Divider />

              <div className="max-w-md">
                <h3 className="text-lg font-semibold mb-4">编辑资料</h3>
                <Form
                  form={profileForm}
                  layout="vertical"
                  onFinish={handleUpdateProfile}
                >
                  <Form.Item
                    name="name"
                    label="姓名"
                    rules={[
                      { required: true, message: '请输入姓名' },
                      { max: 50, message: '姓名不能超过50个字符' }
                    ]}
                  >
                    <Input 
                      prefix={<UserOutlined />}
                      placeholder="请输入姓名" 
                    />
                  </Form.Item>

                  <Form.Item
                    name="phone"
                    label="手机号"
                    rules={[
                      { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }
                    ]}
                  >
                    <Input 
                      prefix={<PhoneOutlined />}
                      placeholder="请输入手机号" 
                    />
                  </Form.Item>

                  <Form.Item>
                    <Button 
                      type="primary" 
                      htmlType="submit" 
                      loading={loading}
                    >
                      保存修改
                    </Button>
                  </Form.Item>
                </Form>
              </div>
            </div>
          </TabPane>

          <TabPane tab="修改密码" key="2">
            <div className="max-w-md">
              <Alert
                message="密码安全提示"
                description="为了您的账户安全，建议定期更换密码。密码应包含字母、数字，长度至少6位。"
                type="info"
                showIcon
                className="mb-6"
              />

              <Form
                form={passwordForm}
                layout="vertical"
                onFinish={handleChangePassword}
              >
                <Form.Item
                  name="currentPassword"
                  label="当前密码"
                  rules={[
                    { required: true, message: '请输入当前密码' }
                  ]}
                >
                  <Input.Password 
                    prefix={<LockOutlined />}
                    placeholder="请输入当前密码" 
                  />
                </Form.Item>

                <Form.Item
                  name="newPassword"
                  label="新密码"
                  rules={[
                    { required: true, message: '请输入新密码' },
                    { min: 6, message: '密码至少6位' }
                  ]}
                >
                  <Input.Password 
                    prefix={<LockOutlined />}
                    placeholder="请输入新密码" 
                  />
                </Form.Item>

                <Form.Item
                  name="confirmPassword"
                  label="确认新密码"
                  dependencies={['newPassword']}
                  rules={[
                    { required: true, message: '请确认新密码' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('newPassword') === value) {
                          return Promise.resolve()
                        }
                        return Promise.reject(new Error('两次输入的密码不一致'))
                      },
                    }),
                  ]}
                >
                  <Input.Password 
                    prefix={<LockOutlined />}
                    placeholder="请再次输入新密码" 
                  />
                </Form.Item>

                <Form.Item>
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    loading={loading}
                    danger
                  >
                    修改密码
                  </Button>
                </Form.Item>
              </Form>

              <Alert
                message="注意"
                description="修改密码后需要重新登录。"
                type="warning"
                showIcon
                className="mt-4"
              />
            </div>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  )
} 