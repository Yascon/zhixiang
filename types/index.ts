// 用户相关类型
export interface User {
  id: string
  email: string
  name?: string
  role: 'ADMIN' | 'MANAGER' | 'USER'
  createdAt: Date
  updatedAt: Date
}

// 商品相关类型
export interface Product {
  id: string
  name: string
  description?: string
  sku: string
  barcode?: string
  categoryId: string
  category: Category
  costPrice: number
  sellingPrice: number
  memberPrice?: number
  stock: number
  minStock: number
  maxStock?: number
  status: 'ACTIVE' | 'INACTIVE' | 'DISCONTINUED'
  createdAt: Date
  updatedAt: Date
}

export interface Category {
  id: string
  name: string
  description?: string
  parentId?: string
  parent?: Category
  children?: Category[]
  createdAt: Date
  updatedAt: Date
}

// 会员相关类型
export interface Member {
  id: string
  memberNo: string
  name: string
  phone?: string
  email?: string
  gender?: 'MALE' | 'FEMALE' | 'OTHER'
  birthday?: Date
  address?: string
  levelId: string
  level: MemberLevel
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
  points: number
  totalPoints: number
  totalSpent: number
  membershipFee?: number
  membershipExpiry?: Date
  registeredBy: string
  createdAt: Date
  updatedAt: Date
}

export interface MemberLevel {
  id: string
  name: string
  description?: string
  minSpent: number
  discount: number
  pointsRate: number
  membershipFee?: number
  createdAt: Date
  updatedAt: Date
}

// 订单相关类型
export interface Order {
  id: string
  orderNo: string
  type: 'PURCHASE' | 'SALE' | 'RETURN'
  status: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'COMPLETED' | 'CANCELLED'
  supplierId?: string
  supplier?: Supplier
  memberId?: string
  member?: Member
  totalAmount: number
  paidAmount: number
  orderDate: Date
  userId: string
  user: User
  notes?: string
  createdAt: Date
  updatedAt: Date
  orderItems: OrderItem[]
  payments: Payment[]
}

export interface OrderItem {
  id: string
  orderId: string
  productId: string
  product: Product
  quantity: number
  unitPrice: number
  totalPrice: number
  createdAt: Date
}

export interface Supplier {
  id: string
  name: string
  contactName?: string
  phone?: string
  email?: string
  address?: string
  createdAt: Date
  updatedAt: Date
}

// 支付相关类型
export interface Payment {
  id: string
  orderId: string
  amount: number
  method: 'CASH' | 'CARD' | 'ALIPAY' | 'WECHAT' | 'TRANSFER' | 'OTHER'
  status: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED'
  transactionId?: string
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface MembershipPayment {
  id: string
  memberId: string
  member: Member
  amount: number
  paymentDate: Date
  method: 'CASH' | 'CARD' | 'ALIPAY' | 'WECHAT' | 'TRANSFER' | 'OTHER'
  status: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED'
  startDate: Date
  endDate: Date
  notes?: string
  createdAt: Date
  updatedAt: Date
}

// 库存相关类型
export interface StockMovement {
  id: string
  productId: string
  product: Product
  type: 'PURCHASE_IN' | 'SALE_OUT' | 'RETURN_IN' | 'RETURN_OUT' | 'ADJUST' | 'TRANSFER'
  quantity: number
  reason?: string
  orderId?: string
  createdAt: Date
}

// 积分相关类型
export interface PointsHistory {
  id: string
  memberId: string
  member: Member
  type: 'EARN' | 'REDEEM' | 'EXPIRE' | 'ADJUST'
  points: number
  reason?: string
  orderId?: string
  createdAt: Date
}

// 财务相关类型
export interface FinanceRecord {
  id: string
  type: 'INCOME' | 'EXPENSE'
  category: string
  amount: number
  description?: string
  orderId?: string
  recordDate: Date
  createdAt: Date
}

// API 响应类型
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

// 分页类型
export interface PaginationParams {
  page: number
  pageSize: number
  total?: number
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

// 搜索和筛选类型
export interface SearchParams {
  keyword?: string
  category?: string
  status?: string
  dateFrom?: string
  dateTo?: string
}

// 统计数据类型
export interface DashboardStats {
  totalProducts: number
  totalMembers: number
  todayRevenue: number
  lowStockItems: number
  monthlyGrowth: number
  membershipRevenue: number
} 