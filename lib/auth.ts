import { NextRequest } from 'next/server'
import { verify, sign } from 'jsonwebtoken'
import jwt from 'jsonwebtoken'
import { User as PrismaUser } from '@prisma/client'
import prisma from './db'

// 动态获取JWT_SECRET，确保每次都是最新的环境变量值
function getJWTSecret(): string {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET环境变量未设置')
  }
  return secret
}

const DEFAULT_JWT_SECRET = 'your-default-fallback-secret' // Fallback secret

// Interface for the decoded token payload, adjust as needed
interface DecodedToken {
  userId: string; // or number, depending on your user ID type
  email: string;
  role: string;
  name: string | null;
  // Add other fields that are in your token payload
  iat: number;
  exp: number;
}

export interface User {
  userId: string
  email: string
  role: string
  name: string
}

export async function getUserFromRequest(req: NextRequest): Promise<PrismaUser | null> {
  const authHeader = req.headers.get('Authorization');
  console.log('[lib/auth.ts] getUserFromRequest - Auth Header:', authHeader);

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('[lib/auth.ts] No valid Authorization header found.');
    return null;
  }

  const token = authHeader.substring(7); // Remove "Bearer "
  console.log('[lib/auth.ts] Token extracted from header:', token ? token.substring(0, 10) + '...' : 'undefined/empty');

  const decodedToken = verifyToken(token);
  if (!decodedToken) {
    console.log('[lib/auth.ts] Token verification failed or token is invalid.');
    return null;
  }

  console.log('[lib/auth.ts] Decoded token for user lookup:', decodedToken);

  // Ensure decodedToken.userId exists and is of the correct type for Prisma query
  if (!decodedToken.userId || typeof decodedToken.userId !== 'string') {
     console.error('[lib/auth.ts] userId not found in token or is not a string.');
     return null;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: decodedToken.userId }, // Assuming Prisma User model uses `id`
    });
    if (user) {
      console.log('[lib/auth.ts] User found:', user.email);
    } else {
      console.log('[lib/auth.ts] User not found for id:', decodedToken.userId);
    }
    return user;
  } catch (error) {
    console.error('[lib/auth.ts] Error fetching user from database:', error);
    return null;
  }
}

export function generateToken(payload: object): string {
  const secret = process.env.JWT_SECRET || DEFAULT_JWT_SECRET
  if (!secret) {
    console.error('[lib/auth.ts] JWT_SECRET is not defined!');
    throw new Error('JWT_SECRET is not defined');
  }
  console.log('[lib/auth.ts] Generating token with secret:', secret ? secret.substring(0, 5) + '...' : 'undefined/empty') // Log a portion for security
  const token = jwt.sign(payload, secret, { expiresIn: '1d' })
  console.log('[lib/auth.ts] Generated token:', token ? token.substring(0, 10) + '...' : 'undefined/empty')
  return token
}

export function verifyToken(token: string): DecodedToken | null {
  const secret = process.env.JWT_SECRET || DEFAULT_JWT_SECRET
  if (!secret) {
    console.error('[lib/auth.ts] JWT_SECRET is not defined for verification!');
    return null; // Or throw an error, depending on desired behavior
  }
  console.log('[lib/auth.ts] Verifying token with secret:', secret ? secret.substring(0, 5) + '...' : 'undefined/empty') // Log a portion for security
  console.log('[lib/auth.ts] Token to verify:', token ? token.substring(0, 10) + '...' : 'undefined/empty')
  try {
    const decoded = jwt.verify(token, secret) as DecodedToken; // Type assertion
    console.log('[lib/auth.ts] Token verified successfully, decoded:', decoded)
    return decoded
  } catch (error: any) { // Explicitly type error as any or a more specific error type
    console.error('[lib/auth.ts] Token verification failed:', error.name, error.message) // Log error name and message
    if (error.name === 'JsonWebTokenError') {
      console.error('[lib/auth.ts] JWT Error details:', error)
    } else if (error.name === 'TokenExpiredError') {
      console.error('[lib/auth.ts] Token expired at:', error.expiredAt)
    }
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

// 中间件函数，用于保护需要认证的路由
export function withAuth(handler: Function) {
  return async (request: NextRequest, ...args: any[]) => {
    const user = await getUserFromRequest(request)
    
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
      const user = await getUserFromRequest(request)
      
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