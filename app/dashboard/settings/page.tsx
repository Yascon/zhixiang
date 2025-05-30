'use client'

import { useState, useEffect } from 'react'
import { 
  Card, 
  Form, 
  Input, 
  Button, 
  Switch, 
  Select, 
  InputNumber,
  Tabs,
  Space,
  message,
  Divider,
  Upload,
  Avatar,
  Modal,
  Progress,
  Alert
} from 'antd'
import { 
  SettingOutlined, 
  SecurityScanOutlined, 
  BellOutlined,
  DatabaseOutlined,
  UserOutlined,
  UploadOutlined,
  ExclamationCircleOutlined,
  DownloadOutlined,
  DeleteOutlined
} from '@ant-design/icons'

const { Option } = Select
const { TabPane } = Tabs
const { TextArea } = Input
const { confirm } = Modal

interface SystemSettings {
  companyName: string
  companyLogo: string
  contactEmail: string
  contactPhone: string
  address: string
  timezone: string
  currency: string
  language: string
  lowStockThreshold: number
  autoBackup: boolean
  backupFrequency: string
  emailNotifications: boolean
  smsNotifications: boolean
  systemNotifications: boolean
  maintenanceMode: boolean
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(false)
  const [settings, setSettings] = useState<SystemSettings>({
    companyName: '智享进销存管理系统',
    companyLogo: '',
    contactEmail: 'admin@example.com',
    contactPhone: '400-123-4567',
    address: '北京市朝阳区xxx街道xxx号',
    timezone: 'Asia/Shanghai',
    currency: 'CNY',
    language: 'zh-CN',
    lowStockThreshold: 10,
    autoBackup: true,
    backupFrequency: 'daily',
    emailNotifications: true,
    smsNotifications: false,
    systemNotifications: true,
    maintenanceMode: false
  })
  const [backupProgress, setBackupProgress] = useState(0)
  const [isBackingUp, setIsBackingUp] = useState(false)

  const [basicForm] = Form.useForm()
  const [securityForm] = Form.useForm()
  const [notificationForm] = Form.useForm()

  useEffect(() => {
    // 初始化表单数据
    basicForm.setFieldsValue(settings)
    securityForm.setFieldsValue(settings)
    notificationForm.setFieldsValue(settings)
  }, [settings])

  // 保存基本设置
  const handleBasicSave = async (values: any) => {
    setLoading(true)
    try {
      // 这里可以调用API保存设置
      await new Promise(resolve => setTimeout(resolve, 1000)) // 模拟API调用
      
      setSettings(prev => ({ ...prev, ...values }))
      message.success('基本设置保存成功！')
    } catch (error) {
      message.error('保存失败，请重试！')
    } finally {
      setLoading(false)
    }
  }

  // 保存安全设置
  const handleSecuritySave = async (values: any) => {
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setSettings(prev => ({ ...prev, ...values }))
      message.success('安全设置保存成功！')
    } catch (error) {
      message.error('保存失败，请重试！')
    } finally {
      setLoading(false)
    }
  }

  // 保存通知设置
  const handleNotificationSave = async (values: any) => {
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setSettings(prev => ({ ...prev, ...values }))
      message.success('通知设置保存成功！')
    } catch (error) {
      message.error('保存失败，请重试！')
    } finally {
      setLoading(false)
    }
  }

  // 数据备份
  const handleBackup = async () => {
    setIsBackingUp(true)
    setBackupProgress(0)

    try {
      // 模拟备份进度
      for (let i = 0; i <= 100; i += 10) {
        setBackupProgress(i)
        await new Promise(resolve => setTimeout(resolve, 200))
      }
      
      message.success('数据备份完成！')
    } catch (error) {
      message.error('备份失败，请重试！')
    } finally {
      setIsBackingUp(false)
      setBackupProgress(0)
    }
  }

  // 数据导出
  const handleExport = () => {
    message.success('数据导出功能开发中...')
  }

  // 清理缓存
  const handleClearCache = () => {
    confirm({
      title: '确认清理缓存',
      icon: <ExclamationCircleOutlined />,
      content: '清理缓存可能会影响系统性能，确定要继续吗？',
      onOk() {
        message.success('缓存清理完成！')
      }
    })
  }

  // 重置系统
  const handleReset = () => {
    confirm({
      title: '确认重置系统',
      icon: <ExclamationCircleOutlined />,
      content: '重置系统将清除所有数据，此操作不可恢复，确定要继续吗？',
      okType: 'danger',
      onOk() {
        message.warning('系统重置功能需要管理员权限！')
      }
    })
  }

  return (
    <div className="p-6">
      <Card>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">系统设置</h2>
        </div>

        <Tabs defaultActiveKey="basic">
          <TabPane tab={<span><SettingOutlined />基本设置</span>} key="basic">
            <Card title="公司信息">
              <Form
                form={basicForm}
                layout="vertical"
                onFinish={handleBasicSave}
                initialValues={settings}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Form.Item
                    name="companyName"
                    label="公司名称"
                    rules={[{ required: true, message: '请输入公司名称' }]}
                  >
                    <Input placeholder="请输入公司名称" />
                  </Form.Item>

                  <Form.Item
                    name="contactEmail"
                    label="联系邮箱"
                    rules={[
                      { required: true, message: '请输入联系邮箱' },
                      { type: 'email', message: '请输入正确的邮箱格式' }
                    ]}
                  >
                    <Input placeholder="请输入联系邮箱" />
                  </Form.Item>

                  <Form.Item
                    name="contactPhone"
                    label="联系电话"
                    rules={[{ required: true, message: '请输入联系电话' }]}
                  >
                    <Input placeholder="请输入联系电话" />
                  </Form.Item>

                  <Form.Item
                    name="timezone"
                    label="时区"
                    rules={[{ required: true, message: '请选择时区' }]}
                  >
                    <Select placeholder="请选择时区">
                      <Option value="Asia/Shanghai">Asia/Shanghai (UTC+8)</Option>
                      <Option value="Asia/Tokyo">Asia/Tokyo (UTC+9)</Option>
                      <Option value="America/New_York">America/New_York (UTC-5)</Option>
                      <Option value="Europe/London">Europe/London (UTC+0)</Option>
                    </Select>
                  </Form.Item>

                  <Form.Item
                    name="currency"
                    label="默认货币"
                    rules={[{ required: true, message: '请选择默认货币' }]}
                  >
                    <Select placeholder="请选择默认货币">
                      <Option value="CNY">人民币 (CNY)</Option>
                      <Option value="USD">美元 (USD)</Option>
                      <Option value="EUR">欧元 (EUR)</Option>
                      <Option value="JPY">日元 (JPY)</Option>
                    </Select>
                  </Form.Item>

                  <Form.Item
                    name="language"
                    label="系统语言"
                    rules={[{ required: true, message: '请选择系统语言' }]}
                  >
                    <Select placeholder="请选择系统语言">
                      <Option value="zh-CN">简体中文</Option>
                      <Option value="zh-TW">繁体中文</Option>
                      <Option value="en-US">English</Option>
                    </Select>
                  </Form.Item>
                </div>

                <Form.Item
                  name="address"
                  label="公司地址"
                >
                  <TextArea rows={3} placeholder="请输入公司地址" />
                </Form.Item>

                <Form.Item
                  name="lowStockThreshold"
                  label="库存预警阈值"
                  rules={[{ required: true, message: '请输入库存预警阈值' }]}
                >
                  <InputNumber
                    min={1}
                    max={1000}
                    placeholder="当库存低于此数值时发出预警"
                    style={{ width: '100%' }}
                  />
                </Form.Item>

                <Form.Item>
                  <Button type="primary" htmlType="submit" loading={loading}>
                    保存基本设置
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </TabPane>

          <TabPane tab={<span><SecurityScanOutlined />安全设置</span>} key="security">
            <Card title="安全配置">
              <Form
                form={securityForm}
                layout="vertical"
                onFinish={handleSecuritySave}
                initialValues={settings}
              >
                <Form.Item
                  name="maintenanceMode"
                  label="维护模式"
                  valuePropName="checked"
                >
                  <Switch 
                    checkedChildren="开启" 
                    unCheckedChildren="关闭"
                  />
                  <div className="text-sm text-gray-500 mt-1">
                    开启后，系统将进入维护模式，普通用户无法访问
                  </div>
                </Form.Item>

                <Divider />

                <div className="space-y-4">
                  <h4 className="text-lg font-medium">密码策略</h4>
                  
                  <Form.Item
                    name="passwordMinLength"
                    label="密码最小长度"
                    initialValue={8}
                  >
                    <InputNumber min={6} max={20} />
                  </Form.Item>

                  <Form.Item
                    name="requireSpecialChar"
                    label="要求特殊字符"
                    valuePropName="checked"
                    initialValue={true}
                  >
                    <Switch checkedChildren="是" unCheckedChildren="否" />
                  </Form.Item>

                  <Form.Item
                    name="passwordExpireDays"
                    label="密码过期天数"
                    initialValue={90}
                  >
                    <InputNumber min={30} max={365} />
                  </Form.Item>
                </div>

                <Divider />

                <div className="space-y-4">
                  <h4 className="text-lg font-medium">登录安全</h4>
                  
                  <Form.Item
                    name="maxLoginAttempts"
                    label="最大登录尝试次数"
                    initialValue={5}
                  >
                    <InputNumber min={3} max={10} />
                  </Form.Item>

                  <Form.Item
                    name="lockoutDuration"
                    label="锁定时长（分钟）"
                    initialValue={30}
                  >
                    <InputNumber min={5} max={120} />
                  </Form.Item>

                  <Form.Item
                    name="sessionTimeout"
                    label="会话超时（小时）"
                    initialValue={24}
                  >
                    <InputNumber min={1} max={72} />
                  </Form.Item>
                </div>

                <Form.Item>
                  <Button type="primary" htmlType="submit" loading={loading}>
                    保存安全设置
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </TabPane>

          <TabPane tab={<span><BellOutlined />通知设置</span>} key="notifications">
            <Card title="通知配置">
              <Form
                form={notificationForm}
                layout="vertical"
                onFinish={handleNotificationSave}
                initialValues={settings}
              >
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-medium mb-4">通知方式</h4>
                    
                    <Form.Item
                      name="emailNotifications"
                      label="邮件通知"
                      valuePropName="checked"
                    >
                      <Switch checkedChildren="开启" unCheckedChildren="关闭" />
                    </Form.Item>

                    <Form.Item
                      name="smsNotifications"
                      label="短信通知"
                      valuePropName="checked"
                    >
                      <Switch checkedChildren="开启" unCheckedChildren="关闭" />
                    </Form.Item>

                    <Form.Item
                      name="systemNotifications"
                      label="系统通知"
                      valuePropName="checked"
                    >
                      <Switch checkedChildren="开启" unCheckedChildren="关闭" />
                    </Form.Item>
                  </div>

                  <Divider />

                  <div>
                    <h4 className="text-lg font-medium mb-4">通知内容</h4>
                    
                    <Form.Item
                      name="lowStockNotification"
                      label="库存预警通知"
                      valuePropName="checked"
                      initialValue={true}
                    >
                      <Switch checkedChildren="开启" unCheckedChildren="关闭" />
                    </Form.Item>

                    <Form.Item
                      name="orderNotification"
                      label="订单状态通知"
                      valuePropName="checked"
                      initialValue={true}
                    >
                      <Switch checkedChildren="开启" unCheckedChildren="关闭" />
                    </Form.Item>

                    <Form.Item
                      name="membershipNotification"
                      label="会员到期通知"
                      valuePropName="checked"
                      initialValue={true}
                    >
                      <Switch checkedChildren="开启" unCheckedChildren="关闭" />
                    </Form.Item>

                    <Form.Item
                      name="systemUpdateNotification"
                      label="系统更新通知"
                      valuePropName="checked"
                      initialValue={true}
                    >
                      <Switch checkedChildren="开启" unCheckedChildren="关闭" />
                    </Form.Item>
                  </div>
                </div>

                <Form.Item>
                  <Button type="primary" htmlType="submit" loading={loading}>
                    保存通知设置
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </TabPane>

          <TabPane tab={<span><DatabaseOutlined />数据管理</span>} key="data">
            <div className="space-y-6">
              <Card title="数据备份">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">自动备份</h4>
                      <p className="text-sm text-gray-500">定期自动备份系统数据</p>
                    </div>
                    <Switch 
                      checked={settings.autoBackup}
                      onChange={(checked) => setSettings(prev => ({ ...prev, autoBackup: checked }))}
                    />
                  </div>

                  {settings.autoBackup && (
                    <div>
                      <label className="block text-sm font-medium mb-2">备份频率</label>
                      <Select
                        value={settings.backupFrequency}
                        onChange={(value) => setSettings(prev => ({ ...prev, backupFrequency: value }))}
                        style={{ width: 200 }}
                      >
                        <Option value="daily">每日</Option>
                        <Option value="weekly">每周</Option>
                        <Option value="monthly">每月</Option>
                      </Select>
                    </div>
                  )}

                  <div>
                    <Button 
                      type="primary" 
                      icon={<DownloadOutlined />}
                      onClick={handleBackup}
                      loading={isBackingUp}
                    >
                      立即备份
                    </Button>
                    
                    {isBackingUp && (
                      <div className="mt-4">
                        <Progress percent={backupProgress} />
                      </div>
                    )}
                  </div>
                </div>
              </Card>

              <Card title="数据导出">
                <div className="space-y-4">
                  <p className="text-gray-600">导出系统数据用于分析或迁移</p>
                  
                  <Space>
                    <Button icon={<DownloadOutlined />} onClick={handleExport}>
                      导出所有数据
                    </Button>
                    <Button icon={<DownloadOutlined />} onClick={handleExport}>
                      导出商品数据
                    </Button>
                    <Button icon={<DownloadOutlined />} onClick={handleExport}>
                      导出订单数据
                    </Button>
                  </Space>
                </div>
              </Card>

              <Card title="系统维护">
                <Alert
                  message="危险操作"
                  description="以下操作可能会影响系统正常运行，请谨慎操作"
                  type="warning"
                  showIcon
                  className="mb-4"
                />
                
                <div className="space-y-4">
                  <div>
                    <Button onClick={handleClearCache}>
                      清理系统缓存
                    </Button>
                    <p className="text-sm text-gray-500 mt-1">
                      清理系统缓存可以释放存储空间，但可能会暂时影响系统性能
                    </p>
                  </div>

                  <div>
                    <Button danger icon={<DeleteOutlined />} onClick={handleReset}>
                      重置系统
                    </Button>
                    <p className="text-sm text-gray-500 mt-1">
                      重置系统将清除所有数据，此操作不可恢复
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  )
} 