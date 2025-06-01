# 智享进销存系统 - Vercel部署说明

## 1. 环境变量

- DATABASE_URL
- JWT_SECRET
- NODE_ENV
- NEXT_PUBLIC_SUPABASE_URL（如有用到）
- NEXT_PUBLIC_SUPABASE_ANON_KEY（如有用到）

## 2. 初始化

- 部署后访问 `/api/init-data` 或 `/api/init` 初始化数据库
- 默认管理员：admin@zhixiang.com / admin123

## 3. 常见问题

- 检查环境变量是否齐全
- 检查数据库表结构与 schema 一致
- 检查 Vercel 日志 