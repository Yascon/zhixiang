import { NextRequest } from 'next/server'
import { verify } from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export interface UserPayload {
  userId: string
  email: string
  role: string
  name: string
}

// 从请求中获取用户信息
export function getUserFromRequest(request: NextRequest): UserPayload | null {
  try {
    // 从cookie或Authorization header获取token
    const token = request.cookies.get('auth-token')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '')

    if (!token) {
      return null
    }

    const payload = verify(token, JWT_SECRET) as UserPayload
    return payload
  } catch (error) {
    console.error('Token验证失败:', error)
    return null
  }
}

// 检查用户权限
export function hasPermission(userRole: string, requiredRole: string): boolean {
  const roleHierarchy = {
    'USER': 1,
    'MANAGER': 2,
    'ADMIN': 3
  }

  const userLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] || 0
  const requiredLevel = roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 0

  return userLevel >= requiredLevel
}

// 权限装饰器
export function requireAuth(requiredRole: string = 'USER') {
  return function(handler: Function) {
    return async function(request: NextRequest, ...args: any[]) {
      const user = getUserFromRequest(request)
      
      if (!user) {
        return new Response(
          JSON.stringify({ success: false, message: '未登录' }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        )
      }

      if (!hasPermission(user.role, requiredRole)) {
        return new Response(
          JSON.stringify({ success: false, message: '权限不足' }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        )
      }

      // 将用户信息添加到请求中
      (request as any).user = user
      return handler(request, ...args)
    }
  }
}

// 角色定义
export const ROLES = {
  USER: 'USER',       // 普通用户
  MANAGER: 'MANAGER', // 管理员
  ADMIN: 'ADMIN'      // 超级管理员
} as const

// 权限定义
export const PERMISSIONS = {
  // 会员管理
  MEMBER_READ: 'MEMBER_READ',
  MEMBER_WRITE: 'MEMBER_WRITE',
  MEMBER_DELETE: 'MEMBER_DELETE',
  
  // 商品管理
  PRODUCT_READ: 'PRODUCT_READ',
  PRODUCT_WRITE: 'PRODUCT_WRITE',
  PRODUCT_DELETE: 'PRODUCT_DELETE',
  
  // 订单管理
  ORDER_READ: 'ORDER_READ',
  ORDER_WRITE: 'ORDER_WRITE',
  ORDER_DELETE: 'ORDER_DELETE',
  
  // 财务管理
  FINANCE_READ: 'FINANCE_READ',
  FINANCE_WRITE: 'FINANCE_WRITE',
  
  // 系统管理
  SYSTEM_ADMIN: 'SYSTEM_ADMIN'
} as const

// 角色权限映射
export const ROLE_PERMISSIONS = {
  [ROLES.USER]: [
    PERMISSIONS.MEMBER_READ,
    PERMISSIONS.PRODUCT_READ,
    PERMISSIONS.ORDER_READ
  ],
  [ROLES.MANAGER]: [
    PERMISSIONS.MEMBER_READ,
    PERMISSIONS.MEMBER_WRITE,
    PERMISSIONS.PRODUCT_READ,
    PERMISSIONS.PRODUCT_WRITE,
    PERMISSIONS.ORDER_READ,
    PERMISSIONS.ORDER_WRITE,
    PERMISSIONS.FINANCE_READ
  ],
  [ROLES.ADMIN]: Object.values(PERMISSIONS)
} 