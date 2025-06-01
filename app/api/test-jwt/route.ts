import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Test JWT API - Start test')
    const secretFromEnv = process.env.JWT_SECRET
    console.log('🔍 Test JWT API - JWT_SECRET from env (first 5 chars):', secretFromEnv ? secretFromEnv.substring(0, 5) + '...' : 'undefined/empty')
    
    const authHeader = request.headers.get('authorization')
    console.log('🔍 Test JWT API - Authorization header:', authHeader ? authHeader.substring(0, 15) + '...' : 'null')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, message: 'No Bearer token found' }, { status: 401 })
    }
    
    const token = authHeader.substring(7)
    console.log('🔍 Test JWT API - Token extracted (first 10 chars):', token ? token.substring(0, 10) + '...' : 'undefined/empty')
    
    console.log('🔍 Test JWT API - Attempting to verify token using lib/auth/verifyToken...')
    const decoded = verifyToken(token)
    
    if (decoded) {
      console.log('🔍 Test JWT API - Token verified successfully by lib/auth/verifyToken:', decoded)
      return NextResponse.json({ 
        success: true, 
        decoded,
        message: 'Token verified successfully using lib/auth/verifyToken.'
      })
    } else {
      console.log('🔍 Test JWT API - Token verification failed by lib/auth/verifyToken.')
      return NextResponse.json({ 
        success: false, 
        message: 'Token verification failed by lib/auth/verifyToken. Check server logs for details from lib/auth.ts.',
      }, { status: 401 })
    }
  } catch (error: any) {
    console.error('🔍 Test JWT API - Unexpected error during test:', error)
    return NextResponse.json({ 
      success: false,
      message: 'An unexpected error occurred during token test.',
      errorName: error.name,
      errorMessage: error.message 
    }, { status: 500 })
  }
} 