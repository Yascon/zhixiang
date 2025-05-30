'use client'

import { useState, useEffect } from 'react'
import { 
  Card, 
  Table, 
  Button, 
  Space, 
  Tag, 
  Input, 
  Select, 
  DatePicker,
  Row,
  Col,
  message
} from 'antd'
import { 
  SearchOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  SwapOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'

const { Option } = Select
const { Search } = Input
const { RangePicker } = DatePicker

// 定义库存变动数据类型
interface StockMovementData {
  id: string
  productId: string
  product: {
    id: string
    name: string
    sku: string
    category: {
      name: string
    }
  }
  type: 'PURCHASE_IN' | 'SALE_OUT' | 'RETURN_IN' | 'RETURN_OUT' | 'ADJUST' | 'TRANSFER'
  quantity: number
  reason?: string
  orderId?: string
  createdAt: string
}

export default function StockMovementPage() {
  const [loading, setLoading] = useState(false)
  const [movements, setMovements] = useState<StockMovementData[]>([])
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  })
  const [searchKeyword, setSearchKeyword] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [orderNo, setOrderNo] = useState('')
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null)

  // 获取库存变动记录
  const fetchMovements = async (page = 1, pageSize = 10) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString()
      })
      
      if (searchKeyword) params.append('keyword', searchKeyword)
      if (selectedType) params.append('type', selectedType)
      if (orderNo) params.append('orderNo', orderNo)
      if (dateRange) {
        params.append('dateFrom', dateRange[0].format('YYYY-MM-DD'))
        params.append('dateTo', dateRange[1].format('YYYY-MM-DD'))
      }

      const response = await fetch(`/api/stock-movements?${params}`)
      const result = await response.json()

      if (result.success) {
        setMovements(result.data)
        setPagination({
          current: result.pagination.page,
          pageSize: result.pagination.pageSize,
          total: result.pagination.total
        })
      } else {
        message.error(result.message || '获取库存变动记录失败')
      }
    } catch (error) {
      console.error('获取库存变动记录失败:', error)
      message.error('获取库存变动记录失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMovements()
  }, [])

  useEffect(() => {
    fetchMovements(1, pagination.pageSize)
  }, [searchKeyword, selectedType, orderNo, dateRange])

  const movementTypes = [
    { value: 'PURCHASE_IN', label: '采购入库' },
    { value: 'SALE_OUT', label: '销售出库' },
    { value: 'RETURN_IN', label: '退货入库' },
    { value: 'RETURN_OUT', label: '退货出库' },
    { value: 'ADJUST', label: '库存调整' },
    { value: 'TRANSFER', label: '库存调拨' }
  ]

  const columns = [
    {
      title: '变动编号',
      dataIndex: 'id',
      key: 'id',
      render: (id: string) => id.slice(-8).toUpperCase()
    },
    {
      title: '商品名称',
      dataIndex: ['product', 'name'],
      key: 'productName',
    },
    {
      title: 'SKU',
      dataIndex: ['product', 'sku'],
      key: 'sku',
    },
    {
      title: '分类',
      dataIndex: ['product', 'category', 'name'],
      key: 'category',
    },
    {
      title: '变动类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => {
        const typeConfig = {
          'PURCHASE_IN': { color: 'green', text: '采购入库', icon: <ArrowUpOutlined /> },
          'SALE_OUT': { color: 'red', text: '销售出库', icon: <ArrowDownOutlined /> },
          'RETURN_IN': { color: 'blue', text: '退货入库', icon: <ArrowUpOutlined /> },
          'RETURN_OUT': { color: 'orange', text: '退货出库', icon: <ArrowDownOutlined /> },
          'ADJUST': { color: 'purple', text: '库存调整', icon: <SwapOutlined /> },
          'TRANSFER': { color: 'cyan', text: '库存调拨', icon: <SwapOutlined /> }
        }
        const config = typeConfig[type as keyof typeof typeConfig]
        return (
          <Tag color={config.color} icon={config.icon}>
            {config.text}
          </Tag>
        )
      }
    },
    {
      title: '变动数量',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (quantity: number) => (
        <span className={quantity > 0 ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
          {quantity > 0 ? '+' : ''}{quantity}
        </span>
      )
    },
    {
      title: '关联订单',
      dataIndex: 'orderId',
      key: 'orderId',
      render: (orderId?: string) => orderId ? orderId.slice(-8).toUpperCase() : '-'
    },
    {
      title: '变动原因',
      dataIndex: 'reason',
      key: 'reason',
      render: (reason?: string) => reason || '-'
    },
    {
      title: '变动时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleString('zh-CN')
    }
  ]

  const handleTableChange = (paginationConfig: any) => {
    fetchMovements(paginationConfig.current, paginationConfig.pageSize)
  }

  const handleSearch = (value: string) => {
    setSearchKeyword(value)
  }

  const handleTypeChange = (value: string) => {
    setSelectedType(value)
  }

  const handleOrderNoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOrderNo(e.target.value)
  }

  const handleDateRangeChange = (dates: any) => {
    setDateRange(dates)
  }

  return (
    <div className="p-6">
      <Card>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">库存变动记录</h2>
        </div>

        {/* 搜索和筛选 */}
        <Row gutter={[16, 16]} className="mb-4">
          <Col xs={24} sm={12} md={6}>
            <Search
              placeholder="搜索商品名称或SKU"
              allowClear
              enterButton={<SearchOutlined />}
              onSearch={handleSearch}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="变动类型"
              allowClear
              style={{ width: '100%' }}
              onChange={handleTypeChange}
            >
              {movementTypes.map(type => (
                <Option key={type.value} value={type.value}>{type.label}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Input
              placeholder="关联订单号"
              allowClear
              onChange={handleOrderNoChange}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <RangePicker 
              style={{ width: '100%' }}
              placeholder={['开始日期', '结束日期']}
              onChange={handleDateRangeChange}
            />
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={movements}
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total: number) => `共 ${total} 条记录`
          }}
          onChange={handleTableChange}
          scroll={{ x: 1200 }}
          rowKey="id"
        />
      </Card>
    </div>
  )
} 