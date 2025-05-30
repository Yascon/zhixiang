'use client'

import { useState } from 'react'
import { Layout, Menu, Avatar, Dropdown, Button, Typography } from 'antd'
import { 
  DashboardOutlined,
  ShoppingOutlined,
  TagsOutlined,
  InboxOutlined,
  ShoppingCartOutlined,
  TeamOutlined,
  FileTextOutlined,
  BarChartOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined
} from '@ant-design/icons'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useRouter } from 'next/navigation'

const { Header, Sider, Content } = Layout
const { Title } = Typography

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: <Link href="/dashboard">仪表板</Link>,
    },
    {
      key: 'products',
      icon: <ShoppingCartOutlined />,
      label: '商品管理',
      children: [
        {
          key: '/dashboard/products',
          label: <Link href="/dashboard/products">商品列表</Link>,
        },
        {
          key: '/dashboard/categories',
          label: <Link href="/dashboard/categories">分类管理</Link>,
        },
      ],
    },
    {
      key: 'inventory',
      icon: <InboxOutlined />,
      label: '库存管理',
      children: [
        {
          key: '/dashboard/inventory',
          label: <Link href="/dashboard/inventory">库存查询</Link>,
        },
        {
          key: '/dashboard/stock-movement',
          label: <Link href="/dashboard/stock-movement">库存变动</Link>,
        },
      ],
    },
    {
      key: 'orders',
      icon: <ShoppingCartOutlined />,
      label: '订单管理',
      children: [
        {
          key: 'purchase-orders',
          label: '采购订单',
          onClick: () => router.push('/dashboard/orders/purchase')
        },
        {
          key: 'sale-orders', 
          label: '销售订单',
          onClick: () => router.push('/dashboard/orders/sale')
        }
      ]
    },
    {
      key: 'suppliers',
      icon: <TeamOutlined />,
      label: '供应商管理',
      onClick: () => router.push('/dashboard/suppliers')
    },
    {
      key: 'customers',
      icon: <TeamOutlined />,
      label: '客户管理',
      onClick: () => router.push('/dashboard/customers')
    },
    {
      key: '/dashboard/members',
      icon: <TeamOutlined />,
      label: <Link href="/dashboard/members">会员管理</Link>,
    },
    {
      key: 'finance',
      icon: <BarChartOutlined />,
      label: '财务管理',
      children: [
        {
          key: '/dashboard/finance/records',
          label: <Link href="/dashboard/finance/records">收支记录</Link>,
        },
        {
          key: '/dashboard/finance/reports',
          label: <Link href="/dashboard/finance/reports">财务报表</Link>,
        },
      ],
    },
    {
      key: '/dashboard/analytics',
      icon: <BarChartOutlined />,
      label: <Link href="/dashboard/analytics">数据分析</Link>,
    },
    {
      key: '/dashboard/settings',
      icon: <UserOutlined />,
      label: <Link href="/dashboard/settings">系统设置</Link>,
    },
    {
      key: 'users',
      icon: <TeamOutlined />,
      label: <Link href="/dashboard/users">用户管理</Link>,
    },
    {
      key: 'reports',
      icon: <BarChartOutlined />,
      label: <Link href="/dashboard/reports">报表管理</Link>,
    },
  ]

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人资料',
      onClick: () => router.push('/dashboard/profile')
    },
    {
      key: 'settings',
      icon: <UserOutlined />,
      label: '系统设置',
      onClick: () => router.push('/dashboard/settings')
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: () => {
        // 清除登录状态
        localStorage.removeItem('user')
        // 跳转到登录页
        router.push('/login')
      },
    },
  ]

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        width={250}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
        }}
      >
        <div className="flex items-center justify-center h-16 bg-blue-600">
          <ShoppingOutlined className="text-white text-2xl mr-2" />
          {!collapsed && (
            <Title level={4} className="text-white m-0">
              智享进销存
            </Title>
          )}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[pathname]}
          defaultOpenKeys={['products', 'inventory', 'orders', 'finance']}
          items={menuItems}
          style={{ borderRight: 0 }}
        />
      </Sider>
      
      <Layout style={{ marginLeft: collapsed ? 80 : 250, transition: 'margin-left 0.2s' }}>
        <Header 
          style={{ 
            padding: '0 24px', 
            background: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 4px rgba(0,21,41,.08)'
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: '16px',
              width: 64,
              height: 64,
            }}
          />
          
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">欢迎回来，管理员</span>
            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
              arrow
            >
              <div className="flex items-center cursor-pointer">
                <Avatar size="small" icon={<UserOutlined />} />
                <span className="ml-2">管理员</span>
              </div>
            </Dropdown>
          </div>
        </Header>
        
        <Content
          style={{
            margin: 0,
            minHeight: 280,
            background: '#f0f2f5',
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  )
} 