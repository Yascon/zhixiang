'use client'

import { Card, Row, Col, Statistic, Button } from 'antd'
import { DollarOutlined, RiseOutlined, FallOutlined, BarChartOutlined } from '@ant-design/icons'
import Link from 'next/link'

export default function FinancePage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">财务管理</h1>
        <p className="text-gray-600">管理收支记录和财务报表</p>
      </div>

      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="今日收入"
              value={0}
              precision={2}
              valueStyle={{ color: '#3f8600' }}
              prefix={<RiseOutlined />}
              suffix="元"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="今日支出"
              value={0}
              precision={2}
              valueStyle={{ color: '#cf1322' }}
              prefix={<FallOutlined />}
              suffix="元"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="本月收入"
              value={0}
              precision={2}
              valueStyle={{ color: '#3f8600' }}
              prefix={<DollarOutlined />}
              suffix="元"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="本月支出"
              value={0}
              precision={2}
              valueStyle={{ color: '#cf1322' }}
              prefix={<DollarOutlined />}
              suffix="元"
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Card
            title="收支记录"
            extra={
              <Link href="/dashboard/finance/records">
                <Button type="primary">查看全部</Button>
              </Link>
            }
          >
            <p className="text-gray-600 text-center py-8">
              管理日常收支记录，包括销售收入、采购支出等
            </p>
            <div className="text-center">
              <Link href="/dashboard/finance/records">
                <Button icon={<BarChartOutlined />}>
                  进入收支记录
                </Button>
              </Link>
            </div>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card
            title="财务报表"
            extra={
              <Link href="/dashboard/finance/reports">
                <Button type="primary">查看全部</Button>
              </Link>
            }
          >
            <p className="text-gray-600 text-center py-8">
              生成各类财务报表，分析经营状况
            </p>
            <div className="text-center">
              <Link href="/dashboard/finance/reports">
                <Button icon={<BarChartOutlined />}>
                  进入财务报表
                </Button>
              </Link>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  )
} 