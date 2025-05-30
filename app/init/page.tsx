'use client'

import { useState } from 'react'
import { Button, Card, Typography, Alert, Spin } from 'antd'

const { Title, Paragraph } = Typography

export default function InitPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleInit = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/init-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()
      
      if (data.success) {
        setResult(data)
      } else {
        setError(data.message || '初始化失败')
      }
    } catch (err) {
      setError('网络错误，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '50px', maxWidth: '800px', margin: '0 auto' }}>
      <Card>
        <Title level={2}>🚀 智享进销存管理系统 - 数据初始化</Title>
        
        <Paragraph>
          欢迎使用智享进销存管理系统！这是一个一键初始化页面，用于设置系统的基础数据。
        </Paragraph>

        <Paragraph>
          <strong>初始化内容包括：</strong>
        </Paragraph>
        <ul>
          <li>✅ 默认管理员账户（admin@example.com / admin123）</li>
          <li>✅ 基础会员等级（基础会员、VIP会员、企业会员）</li>
          <li>✅ 默认商品分类（电子产品、服装鞋帽、食品饮料等）</li>
          <li>✅ 示例供应商数据</li>
        </ul>

        <div style={{ marginTop: '30px', marginBottom: '20px' }}>
          <Button 
            type="primary" 
            size="large" 
            onClick={handleInit}
            loading={loading}
            disabled={loading}
          >
            {loading ? '正在初始化...' : '开始初始化数据'}
          </Button>
        </div>

        {loading && (
          <div style={{ textAlign: 'center', margin: '20px 0' }}>
            <Spin size="large" />
            <Paragraph style={{ marginTop: '10px' }}>
              正在初始化数据库，请稍候...
            </Paragraph>
          </div>
        )}

        {result && (
          <Alert
            message="初始化成功！"
            description={
              <div>
                <p>{result.message}</p>
                <p><strong>管理员账户：</strong></p>
                <p>邮箱：{result.data?.adminEmail}</p>
                <p>密码：{result.data?.adminPassword}</p>
                <p style={{ marginTop: '10px' }}>
                  <a href="/dashboard" target="_blank">
                    点击这里进入管理后台 →
                  </a>
                </p>
              </div>
            }
            type="success"
            showIcon
          />
        )}

        {error && (
          <Alert
            message="初始化失败"
            description={error}
            type="error"
            showIcon
            action={
              <Button size="small" onClick={handleInit}>
                重试
              </Button>
            }
          />
        )}

        <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '6px' }}>
          <Title level={4}>📝 使用说明</Title>
          <Paragraph>
            1. 点击"开始初始化数据"按钮<br/>
            2. 等待初始化完成<br/>
            3. 使用默认管理员账户登录系统<br/>
            4. 开始使用智享进销存管理系统
          </Paragraph>
        </div>
      </Card>
    </div>
  )
} 