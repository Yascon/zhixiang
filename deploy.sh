#!/bin/bash

# 智享进销存管理系统 - 自动化部署脚本

set -e

echo "🚀 开始部署智享进销存管理系统..."

# 检查环境
echo "📋 检查部署环境..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装，请先安装 Node.js 18+"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm 未安装"
    exit 1
fi

# 检查环境变量文件
if [ ! -f ".env.production" ]; then
    echo "❌ .env.production 文件不存在，请先创建环境配置文件"
    exit 1
fi

# 安装依赖
echo "📦 安装生产依赖..."
npm ci --production

# 生成Prisma客户端
echo "🔧 生成数据库客户端..."
npx prisma generate

# 运行数据库迁移
echo "🗄️ 执行数据库迁移..."
npx prisma migrate deploy

# 构建应用
echo "🏗️ 构建应用..."
npm run build

# 检查构建结果
if [ ! -d ".next" ]; then
    echo "❌ 构建失败，.next 目录不存在"
    exit 1
fi

# 启动应用
echo "🎉 部署完成！启动应用..."
echo "📍 应用将在 http://localhost:3000 运行"
echo "🔑 默认管理员账户: admin@example.com / admin123"

# 可选：使用PM2管理进程
if command -v pm2 &> /dev/null; then
    echo "🔄 使用PM2启动应用..."
    pm2 start npm --name "zhixiang-inventory" -- start
    pm2 save
    pm2 startup
else
    echo "💡 建议安装PM2进行进程管理: npm install -g pm2"
    npm start
fi 