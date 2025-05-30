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
  DatePicker, 
  InputNumber,
  message,
  Tabs,
  Row,
  Col,
  Statistic,
  Dropdown
} from 'antd'
import { 
  PlusOutlined, 
  EditOutlined, 
  DollarOutlined, 
  UserOutlined,
  CreditCardOutlined,
  GiftOutlined,
  DownloadOutlined,
  FileExcelOutlined,
  FilePdfOutlined
} from '@ant-design/icons'
import { formatMemberDataForExport, exportData } from '@/lib/export-utils'

const { Option } = Select
const { TabPane } = Tabs

// 定义会员数据类型
interface MemberData {
  id: string
  memberNo: string
  name: string
  phone: string
  email: string
  level: {
    id: string
    name: string
    membershipFee: number
  }
  status: string
  membershipFee: number
  membershipExpiry: string
  createdAt: string
}

interface MemberLevel {
  id: string
  name: string
  membershipFee: number
}

export default function MembersPage() {
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [paymentModalVisible, setPaymentModalVisible] = useState(false)
  const [selectedMember, setSelectedMember] = useState<MemberData | null>(null)
  const [members, setMembers] = useState<MemberData[]>([])
  const [memberLevels, setMemberLevels] = useState<MemberLevel[]>([])
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  })
  const [form] = Form.useForm()
  const [paymentForm] = Form.useForm()

  // 获取会员等级列表
  const fetchMemberLevels = async () => {
    try {
      const response = await fetch('/api/member-levels')
      const result = await response.json()
      if (result.success) {
        setMemberLevels(result.data)
      }
    } catch (error) {
      console.error('获取会员等级失败:', error)
    }
  }

  // 获取会员列表
  const fetchMembers = async (page = 1, pageSize = 10, search = '') => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        search
      })
      
      const response = await fetch(`/api/members?${params}`)
      const result = await response.json()
      
      if (result.success) {
        setMembers(result.data)
        setPagination({
          current: result.pagination.page,
          pageSize: result.pagination.pageSize,
          total: result.pagination.total
        })
      } else {
        message.error(result.message)
      }
    } catch (error) {
      message.error('获取会员列表失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMemberLevels()
    fetchMembers()
  }, [])

  const columns = [
    {
      title: '会员编号',
      dataIndex: 'memberNo',
      key: 'memberNo',
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: '会员等级',
      dataIndex: ['level', 'name'],
      key: 'level',
      render: (levelName: string) => {
        const colors = {
          '普通会员': 'default',
          'VIP会员': 'gold',
          'SVIP会员': 'purple'
        }
        return <Tag color={colors[levelName as keyof typeof colors] || 'default'}>{levelName}</Tag>
      }
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'ACTIVE' ? 'green' : 'red'}>
          {status === 'ACTIVE' ? '正常' : '已过期'}
        </Tag>
      )
    },
    {
      title: '会员费',
      dataIndex: ['level', 'membershipFee'],
      key: 'membershipFee',
      render: (fee: number) => `¥${fee.toFixed(2)}`
    },
    {
      title: '到期时间',
      dataIndex: 'membershipExpiry',
      key: 'membershipExpiry',
      render: (date: string) => date ? new Date(date).toLocaleDateString('zh-CN') : '-'
    },
    {
      title: '操作',
      key: 'action',
      render: (record: MemberData) => (
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
            icon={<DollarOutlined />}
            onClick={() => handlePayment(record)}
          >
            收费
          </Button>
        </Space>
      ),
    },
  ]

  const handleEdit = (record: MemberData) => {
    setSelectedMember(record)
    form.setFieldsValue({
      name: record.name,
      phone: record.phone,
      email: record.email,
      levelId: record.level.id
    })
    setModalVisible(true)
  }

  const handlePayment = (record: MemberData) => {
    setSelectedMember(record)
    paymentForm.setFieldsValue({
      amount: record.level.membershipFee,
      method: 'cash',
      period: '1'
    })
    setPaymentModalVisible(true)
  }

  const handleAddMember = () => {
    setSelectedMember(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleSubmit = async (values: any) => {
    setLoading(true)
    try {
      const url = selectedMember ? `/api/members/${selectedMember.id}` : '/api/members'
      const method = selectedMember ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      })
      
      const result = await response.json()
      
      if (result.success) {
        message.success(result.message)
        setModalVisible(false)
        fetchMembers(pagination.current, pagination.pageSize)
      } else {
        message.error(result.message)
      }
    } catch (error) {
      message.error('保存失败，请重试！')
    } finally {
      setLoading(false)
    }
  }

  const handlePaymentSubmit = async (values: any) => {
    setLoading(true)
    try {
      const response = await fetch('/api/membership-payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          memberId: selectedMember?.id,
          amount: values.amount,
          method: values.method,
          period: values.period,
          notes: values.notes
        }),
      })

      const result = await response.json()

      if (result.success) {
        message.success('会员费收取成功！')
        setPaymentModalVisible(false)
        fetchMembers(pagination.current, pagination.pageSize)
      } else {
        message.error(result.message || '收费失败')
      }
    } catch (error) {
      console.error('收费失败:', error)
      message.error('收费失败，请重试！')
    } finally {
      setLoading(false)
    }
  }

  // 导出功能
  const handleExport = (format: 'excel' | 'pdf') => {
    if (members.length === 0) {
      message.warning('没有数据可导出')
      return
    }

    const formattedData = formatMemberDataForExport(members)
    const filename = `会员列表_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')}`
    
    const result = exportData(formattedData, format, filename, {
      title: '会员管理报表',
      sheetName: '会员列表'
    })
    
    if (result.success) {
      message.success(result.message)
    } else {
      message.error(result.message)
    }
  }

  const exportMenuItems = [
    {
      key: 'excel',
      icon: <FileExcelOutlined />,
      label: '导出Excel',
      onClick: () => handleExport('excel')
    },
    {
      key: 'pdf',
      icon: <FilePdfOutlined />,
      label: '导出PDF',
      onClick: () => handleExport('pdf')
    }
  ]

  return (
    <div className="p-6">
      <Card>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">会员管理</h2>
          <Space>
            <Dropdown menu={{ items: exportMenuItems }} placement="bottomRight">
              <Button icon={<DownloadOutlined />}>
                导出数据
              </Button>
            </Dropdown>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={handleAddMember}
            >
              新增会员
            </Button>
          </Space>
        </div>

        <Tabs defaultActiveKey="1">
          <TabPane tab="会员列表" key="1">
            <Table
              columns={columns}
              dataSource={members}
              loading={loading}
              rowKey="id"
              pagination={{
                ...pagination,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total: number) => `共 ${total} 条记录`,
                onChange: (page, pageSize) => {
                  fetchMembers(page, pageSize)
                }
              }}
            />
          </TabPane>
          
          <TabPane tab="会员统计" key="2">
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} lg={6}>
                <Card>
                  <Statistic
                    title="总会员数"
                    value={pagination.total}
                    prefix={<UserOutlined />}
                    suffix="人"
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card>
                  <Statistic
                    title="本月新增"
                    value={45}
                    prefix={<PlusOutlined />}
                    suffix="人"
                    valueStyle={{ color: '#3f8600' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card>
                  <Statistic
                    title="会员费收入"
                    value={28900}
                    prefix={<DollarOutlined />}
                    suffix="元"
                    precision={2}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card>
                  <Statistic
                    title="即将到期"
                    value={12}
                    prefix={<CreditCardOutlined />}
                    suffix="人"
                    valueStyle={{ color: '#cf1322' }}
                  />
                </Card>
              </Col>
            </Row>
          </TabPane>
        </Tabs>
      </Card>

      {/* 新增/编辑会员模态框 */}
      <Modal
        title={selectedMember ? '编辑会员' : '新增会员'}
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
                name="name"
                label="姓名"
                rules={[{ required: true, message: '请输入姓名' }]}
              >
                <Input placeholder="请输入姓名" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="phone"
                label="手机号"
                rules={[
                  { required: true, message: '请输入手机号' },
                  { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }
                ]}
              >
                <Input placeholder="请输入手机号" />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="email"
                label="邮箱"
                rules={[{ type: 'email', message: '请输入正确的邮箱地址' }]}
              >
                <Input placeholder="请输入邮箱" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="levelId"
                label="会员等级"
                rules={[{ required: true, message: '请选择会员等级' }]}
              >
                <Select placeholder="请选择会员等级">
                  {memberLevels.map(level => (
                    <Option key={level.id} value={level.id}>
                      {level.name} {level.membershipFee && `(¥${level.membershipFee}/年)`}
                    </Option>
                  ))}
                </Select>
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

      {/* 会员费收取模态框 */}
      <Modal
        title="收取会员费"
        open={paymentModalVisible}
        onCancel={() => setPaymentModalVisible(false)}
        footer={null}
        width={500}
      >
        <Form
          form={paymentForm}
          layout="vertical"
          onFinish={handlePaymentSubmit}
        >
          <Form.Item label="会员信息">
            <div className="bg-gray-50 p-4 rounded">
              <p><strong>姓名:</strong> {selectedMember?.name}</p>
              <p><strong>会员等级:</strong> {selectedMember?.level.name}</p>
              <p><strong>当前到期时间:</strong> {selectedMember?.membershipExpiry ? new Date(selectedMember.membershipExpiry).toLocaleDateString('zh-CN') : '-'}</p>
            </div>
          </Form.Item>

          <Form.Item
            name="amount"
            label="收费金额"
            rules={[{ required: true, message: '请输入收费金额' }]}
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
            name="method"
            label="支付方式"
            rules={[{ required: true, message: '请选择支付方式' }]}
          >
            <Select placeholder="请选择支付方式">
              <Option value="cash">现金</Option>
              <Option value="alipay">支付宝</Option>
              <Option value="wechat">微信支付</Option>
              <Option value="card">银行卡</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="period"
            label="会员期限"
            rules={[{ required: true, message: '请选择会员期限' }]}
          >
            <Select placeholder="请选择会员期限">
              <Option value="1">1年</Option>
              <Option value="2">2年</Option>
              <Option value="3">3年</Option>
            </Select>
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
                确认收费
              </Button>
              <Button onClick={() => setPaymentModalVisible(false)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
} 