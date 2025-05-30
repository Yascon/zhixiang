# 智享进销存管理系统 - 部署配置指南

## 🌐 部署准备清单

### 1. 环境变量配置

创建 `.env.production` 文件：

```bash
# 生产环境配置
NODE_ENV=production

# 数据库配置（生产环境建议使用PostgreSQL或MySQL）
DATABASE_URL="postgresql://username:password@localhost:5432/zhixiang_inventory"

# JWT密钥（请使用强密码）
JWT_SECRET="your-super-secure-jwt-secret-key-for-production"

# NextAuth配置
NEXTAUTH_SECRET="your-nextauth-secret-key"
NEXTAUTH_URL="https://yourdomain.com"

# 应用配置
APP_URL="https://yourdomain.com"
APP_NAME="智享进销存管理系统"
```

### 2. 数据库迁移

```bash
# 生产环境数据库迁移
npx prisma migrate deploy
npx prisma generate
```

### 3. 构建配置

```bash
# 安装依赖
npm ci --production

# 构建应用
npm run build

# 启动生产服务
npm start
```

## 🚀 部署方案选择

### 方案一：Vercel部署（推荐）
- ✅ 零配置部署
- ✅ 自动HTTPS
- ✅ 全球CDN
- ✅ 自动扩展

### 方案二：Docker部署
- ✅ 环境一致性
- ✅ 易于管理
- ✅ 可移植性

### 方案三：传统服务器部署
- ✅ 完全控制
- ✅ 成本可控
- ✅ 自定义配置

## 📋 部署前检查清单

- [ ] 环境变量配置完成
- [ ] 数据库连接测试通过
- [ ] 生产环境构建成功
- [ ] SSL证书配置
- [ ] 域名解析配置
- [ ] 备份策略制定
- [ ] 监控系统配置
- [ ] 安全策略实施

## 🔒 安全配置建议

1. **密码安全**：使用bcrypt加密用户密码
2. **JWT安全**：使用强密钥，设置合理过期时间
3. **HTTPS**：强制使用HTTPS
4. **CORS**：配置正确的跨域策略
5. **速率限制**：防止API滥用
6. **输入验证**：严格验证用户输入

## 📊 性能优化建议

1. **数据库优化**：添加索引，优化查询
2. **缓存策略**：Redis缓存热点数据
3. **图片优化**：使用CDN，压缩图片
4. **代码分割**：按需加载组件
5. **监控告警**：实时监控系统状态 