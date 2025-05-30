import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  return NextResponse.json({
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_SECRET_length: process.env.JWT_SECRET?.length,
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL
  })
} 