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
  Tree,
  Row,
  Col
} from 'antd'
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined,
  FolderOutlined,
  FolderOpenOutlined
} from '@ant-design/icons'

const { Option } = Select

// 定义分类数据类型
interface CategoryData {
  id: string
  name: string
  description?: string
  parentId?: string
  parent?: CategoryData
  children?: CategoryData[]
  _count?: {
    products: number
  }
  createdAt: string
  updatedAt: string
}

export default function CategoriesPage() {
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<CategoryData | null>(null)
  const [categories, setCategories] = useState<CategoryData[]>([])
  const [form] = Form.useForm()

  // 获取分类列表
  const fetchCategories = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/categories')
      const result = await response.json()

      if (result.success) {
        setCategories(result.data)
      } else {
        message.error(result.message || '获取分类列表失败')
      }
    } catch (error) {
      console.error('获取分类列表失败:', error)
      message.error('获取分类列表失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  // 将分类数据转换为树形结构
  const buildCategoryTree = (categories: CategoryData[]): CategoryData[] => {
    const categoryMap = new Map<string, CategoryData>()
    const rootCategories: CategoryData[] = []

    // 创建映射
    categories.forEach(category => {
      categoryMap.set(category.id, { ...category, children: [] })
    })

    // 构建树形结构
    categories.forEach(category => {
      const categoryNode = categoryMap.get(category.id)!
      if (category.parentId) {
        const parent = categoryMap.get(category.parentId)
        if (parent) {
          parent.children = parent.children || []
          parent.children.push(categoryNode)
        }
      } else {
        rootCategories.push(categoryNode)
      }
    })

    return rootCategories
  }

  // 将树形数据扁平化用于表格显示
  const flattenCategories = (cats: CategoryData[], level = 0): any[] => {
    const result: any[] = []
    
    cats.forEach(cat => {
      result.push({
        ...cat,
        key: cat.id,
        level,
        hasChildren: cat.children && cat.children.length > 0
      })
      
      if (cat.children && cat.children.length > 0) {
        result.push(...flattenCategories(cat.children, level + 1))
      }
    })
    
    return result
  }

  const treeData = buildCategoryTree(categories)
  const flatData = flattenCategories(treeData)

  const columns = [
    {
      title: '分类名称',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: any) => (
        <div style={{ paddingLeft: record.level * 20 }}>
          {record.hasChildren ? <FolderOpenOutlined className="mr-2" /> : <FolderOutlined className="mr-2" />}
          {name}
        </div>
      )
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      render: (description?: string) => description || '-'
    },
    {
      title: '父级分类',
      dataIndex: ['parent', 'name'],
      key: 'parent',
      render: (parentName?: string) => parentName || '顶级分类'
    },
    {
      title: '商品数量',
      dataIndex: ['_count', 'products'],
      key: 'productCount',
      render: (count: number) => count || 0
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
      render: (record: CategoryData) => (
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

  const handleEdit = (record: CategoryData) => {
    setSelectedCategory(record)
    form.setFieldsValue({
      name: record.name,
      description: record.description,
      parentId: record.parentId
    })
    setModalVisible(true)
  }

  const handleDelete = (record: CategoryData) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除分类 "${record.name}" 吗？`,
      onOk: async () => {
        try {
          const response = await fetch(`/api/categories?id=${record.id}`, {
            method: 'DELETE'
          })
          const result = await response.json()

          if (result.success) {
            message.success('分类删除成功！')
            fetchCategories()
          } else {
            message.error(result.message || '删除失败')
          }
        } catch (error) {
          console.error('删除分类失败:', error)
          message.error('删除失败，请重试！')
        }
      }
    })
  }

  const handleAddCategory = () => {
    setSelectedCategory(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleSubmit = async (values: any) => {
    setLoading(true)
    try {
      const method = selectedCategory ? 'PUT' : 'POST'
      const body = selectedCategory 
        ? { ...values, id: selectedCategory.id }
        : values

      const response = await fetch('/api/categories', {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      })

      const result = await response.json()

      if (result.success) {
        message.success(selectedCategory ? '分类更新成功！' : '分类创建成功！')
        setModalVisible(false)
        fetchCategories()
      } else {
        message.error(result.message || '保存失败')
      }
    } catch (error) {
      console.error('保存分类失败:', error)
      message.error('保存失败，请重试！')
    } finally {
      setLoading(false)
    }
  }

  // 获取可选的父级分类（排除自己和子级）
  const getAvailableParentCategories = (currentId?: string): CategoryData[] => {
    const filterCategories = (cats: CategoryData[]): CategoryData[] => {
      return cats.filter(cat => {
        if (currentId && cat.id === currentId) return false
        // 简化处理，这里不做深度检查子级关系
        return true
      })
    }
    
    return filterCategories(categories.filter(cat => !cat.parentId))
  }

  return (
    <div className="p-6">
      <Row gutter={24}>
        {/* 左侧：分类树 */}
        <Col xs={24} lg={8}>
          <Card title="分类树结构" className="mb-6">
            <Tree
              showIcon
              defaultExpandAll
              treeData={treeData.map(cat => ({
                title: cat.name,
                key: cat.id,
                icon: <FolderOutlined />,
                children: cat.children?.map(child => ({
                  title: child.name,
                  key: child.id,
                  icon: <FolderOutlined />,
                  children: child.children?.map(grandChild => ({
                    title: grandChild.name,
                    key: grandChild.id,
                    icon: <FolderOutlined />
                  }))
                }))
              }))}
            />
          </Card>
        </Col>

        {/* 右侧：分类列表 */}
        <Col xs={24} lg={16}>
          <Card>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">分类管理</h2>
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={handleAddCategory}
              >
                新增分类
              </Button>
            </div>

            <Table
              columns={columns}
              dataSource={flatData}
              loading={loading}
              pagination={false}
              rowKey="id"
            />
          </Card>
        </Col>
      </Row>

      {/* 新增/编辑分类模态框 */}
      <Modal
        title={selectedCategory ? '编辑分类' : '新增分类'}
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
            label="分类名称"
            rules={[{ required: true, message: '请输入分类名称' }]}
          >
            <Input placeholder="请输入分类名称" />
          </Form.Item>

          <Form.Item
            name="parentId"
            label="父级分类"
          >
            <Select placeholder="请选择父级分类（不选择则为顶级分类）" allowClear>
              {getAvailableParentCategories(selectedCategory?.id).map(cat => (
                <Option key={cat.id} value={cat.id}>{cat.name}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="description"
            label="分类描述"
          >
            <Input.TextArea placeholder="请输入分类描述" rows={3} />
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