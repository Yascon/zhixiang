'use client'

import { useState } from 'react'
import { Card, Form, Input, Button, Typography, Row, Col, Space, Divider } from 'antd'
import { UserOutlined, LockOutlined, ShopOutlined, TeamOutlined, DollarOutlined, BarChartOutlined } from '@ant-design/icons'

const { Title, Paragraph } = Typography

export default function HomePage() {
  const [loading, setLoading] = useState(false)

  const onFinish = async (values: any) => {
    setLoading(true)
    // 这里添加登录逻辑
    console.log('登录信息:', values)
    setTimeout(() => {
      setLoading(false)
      // 登录成功后跳转到仪表板
      window.location.href = '/dashboard'
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* 头部标题 */}
        <div className="text-center mb-12">
          <Title level={1} className="text-4xl font-bold text-gray-800 mb-4">
            智享进销存管理系统
          </Title>
          <Paragraph className="text-lg text-gray-600 max-w-2xl mx-auto">
            功能完整的网页版智享进销存管理系统，支持商品管理、库存管理、销售管理、会员管理和财务管理
          </Paragraph>
        </div>

        <Row gutter={[32, 32]} align="middle">
          {/* 登录表单 */}
          <Col xs={24} lg={12}>
            <Card className="shadow-lg">
              <Title level={3} className="text-center mb-6">
                系统登录
              </Title>
              <Form
                name="login"
                onFinish={onFinish}
                autoComplete="off"
                size="large"
              >
                <Form.Item
                  name="email"
                  rules={[
                    { required: true, message: '请输入邮箱地址!' },
                    { type: 'email', message: '请输入有效的邮箱地址!' }
                  ]}
                >
                  <Input
                    prefix={<UserOutlined />}
                    placeholder="邮箱地址"
                  />
                </Form.Item>

                <Form.Item
                  name="password"
                  rules={[{ required: true, message: '请输入密码!' }]}
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="密码"
                  />
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    className="w-full h-12 text-lg"
                  >
                    登录
                  </Button>
                </Form.Item>
              </Form>

              <Divider>演示账号</Divider>
              <div className="text-center text-gray-600">
                <p>管理员: admin@example.com / admin123</p>
                <p>普通用户: user@example.com / user123</p>
              </div>
            </Card>
          </Col>

          {/* 功能介绍 */}
          <Col xs={24} lg={12}>
            <div className="space-y-6">
              <Title level={3} className="text-gray-800">
                系统功能特色
              </Title>
              
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Card className="text-center h-full">
                    <ShopOutlined className="text-3xl text-blue-500 mb-3" />
                    <Title level={5}>商品管理</Title>
                    <Paragraph className="text-sm text-gray-600">
                      商品信息管理、分类管理、库存预警
                    </Paragraph>
                  </Card>
                </Col>
                
                <Col span={12}>
                  <Card className="text-center h-full">
                    <TeamOutlined className="text-3xl text-green-500 mb-3" />
                    <Title level={5}>会员系统</Title>
                    <Paragraph className="text-sm text-gray-600">
                      会员管理、等级设置、积分系统、会员收费
                    </Paragraph>
                  </Card>
                </Col>
                
                <Col span={12}>
                  <Card className="text-center h-full">
                    <DollarOutlined className="text-3xl text-yellow-500 mb-3" />
                    <Title level={5}>财务管理</Title>
                    <Paragraph className="text-sm text-gray-600">
                      收支记录、利润分析、财务报表
                    </Paragraph>
                  </Card>
                </Col>
                
                <Col span={12}>
                  <Card className="text-center h-full">
                    <BarChartOutlined className="text-3xl text-purple-500 mb-3" />
                    <Title level={5}>数据分析</Title>
                    <Paragraph className="text-sm text-gray-600">
                      销售统计、库存分析、会员分析
                    </Paragraph>
                  </Card>
                </Col>
              </Row>

              <Card className="bg-blue-50 border-blue-200">
                <Title level={5} className="text-blue-800 mb-3">
                  💡 会员收费功能亮点
                </Title>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• 灵活的会员等级设置和年费管理</li>
                  <li>• 多种支付方式支持（现金、支付宝、微信等）</li>
                  <li>• 自动续费提醒和到期管理</li>
                  <li>• 会员专享价格和积分奖励</li>
                  <li>• 详细的会员消费分析报表</li>
                </ul>
              </Card>
            </div>
          </Col>
        </Row>
      </div>
    </div>
  )
} 