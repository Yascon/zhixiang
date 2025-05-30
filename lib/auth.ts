import { NextRequest } from 'next/server'
import { verify, sign } from 'jsonwebtoken'

// 动态获取JWT_SECRET，确保每次都是最新的环境变量值
function getJWTSecret(): string {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET环境变量未设置')
  }
  return secret
}

export interface User {
  userId: string
  email: string
  role: string
  name: string
}

export function getUserFromRequest(request: NextRequest): User | null {
  try {
    const JWT_SECRET = getJWTSecret()
    console.log('🔍 Auth库 - JWT_SECRET:', JWT_SECRET)
    console.log('🔍 Auth库 - JWT_SECRET length:', JWT_SECRET.length)
    
    // 从Authorization header获取token
    const authHeader = request.headers.get('authorization')
    console.log('🔍 Auth库 - Authorization header:', authHeader)
    
    let token: string | null = null
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7)
      console.log('🔍 Auth库 - 从Bearer header提取token:', token?.substring(0, 50) + '...')
    }
    
    // 如果没有Bearer token，尝试从cookie获取
    if (!token) {
      const cookieHeader = request.headers.get('cookie')
      console.log('🔍 Auth库 - Cookie header:', cookieHeader)
      
      if (cookieHeader) {
        const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
          const [key, value] = cookie.trim().split('=')
          acc[key] = value
          return acc
        }, {} as Record<string, string>)
        
        token = cookies['auth-token']
        console.log('🔍 Auth库 - 从cookie提取token:', token?.substring(0, 50) + '...')
      }
    }
    
    if (!token) {
      console.log('🔍 Auth库 - 没有找到token')
      return null
    }
    
    // 验证token
    console.log('🔍 Auth库 - 开始验证token...')
    console.log('🔍 Auth库 - 使用的JWT_SECRET:', JWT_SECRET)
    const decoded = verify(token, JWT_SECRET) as any
    console.log('🔍 Auth库 - Token验证成功:', decoded)
    
    return {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      name: decoded.name
    }
  } catch (error: any) {
    console.error('🔍 Auth库 - Token验证失败:', error)
    console.error('🔍 Auth库 - Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    })
    return null
  }
}

export function generateToken(user: User): string {
  const JWT_SECRET = getJWTSecret()
  console.log('🔍 生成Token - 使用的JWT_SECRET:', JWT_SECRET)
  return sign(
    {
      userId: user.userId,
      email: user.email,
      role: user.role,
      name: user.name
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  )
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

// 中间件函数，用于保护需要认证的路由
export function withAuth(handler: Function) {
  return async (request: NextRequest, ...args: any[]) => {
    const user = getUserFromRequest(request)
    
    if (!user) {
      return new Response(
        JSON.stringify({ success: false, message: '未登录' }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // 将用户信息添加到请求中
    ;(request as any).user = user
    
    return handler(request, ...args)
  }
}

// 角色权限中间件
export function withRole(requiredRole: string) {
  return function(handler: Function) {
    return async (request: NextRequest, ...args: any[]) => {
      const user = getUserFromRequest(request)
      
      if (!user) {
        return new Response(
          JSON.stringify({ success: false, message: '未登录' }),
          { 
            status: 401,
            headers: { 'Content-Type': 'application/json' }
          }
        )
      }

      if (!hasPermission(user.role, requiredRole)) {
        return new Response(
          JSON.stringify({ success: false, message: '权限不足' }),
          { 
            status: 403,
            headers: { 'Content-Type': 'application/json' }
          }
        )
      }

      // 将用户信息添加到请求中
      ;(request as any).user = user
      
      return handler(request, ...args)
    }
  }
}

// 添加requireAuth函数，这是withRole的别名
export const requireAuth = withRole

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