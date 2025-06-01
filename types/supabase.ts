export type UserRole = 'ADMIN' | 'USER';
export type OrderType = 'PURCHASE' | 'SALE';
export type OrderStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED';
export type MovementType = 'IN' | 'OUT';
export type PaymentStatus = 'PENDING' | 'PAID' | 'REFUNDED' | 'CANCELLED';
export type PaymentMethod = 'CASH' | 'CARD' | 'TRANSFER' | 'OTHER';
export type RecordType = 'INCOME' | 'EXPENSE';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface MemberLevel {
  id: string;
  name: string;
  discount: number;
  points_multiplier: number;
  created_at: string;
  updated_at: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact?: string;
  phone?: string;
  address?: string;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  category_id?: string;
  description?: string;
  price: number;
  cost: number;
  stock: number;
  created_at: string;
  updated_at: string;
}

export interface Member {
  id: string;
  name: string;
  phone: string;
  level_id?: string;
  points: number;
  total_spend: number;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  type: OrderType;
  status: OrderStatus;
  user_id?: string;
  member_id?: string;
  supplier_id?: string;
  total_amount: number;
  paid_amount: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  created_at: string;
}

export interface InventoryMovement {
  id: string;
  type: MovementType;
  product_id: string;
  quantity: number;
  order_id?: string;
  notes?: string;
  created_at: string;
}

export interface Payment {
  id: string;
  order_id: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface FinancialRecord {
  id: string;
  type: RecordType;
  amount: number;
  payment_id?: string;
  notes?: string;
  created_at: string;
} 