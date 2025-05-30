# 智享进销存管理系统 - Vercel部署指南

## 🚀 部署状态

**当前状态：** 需要重新部署  
**原因：** 系统已完成重大修复，包括JWT认证、数据库Schema同步、Profile API等核心功能

## 📋 部署前检查清单

### ✅ 已完成的修复
- [x] JWT认证问题（auth库动态获取密钥）
- [x] 数据库Schema同步（User模型phone和avatar字段）
- [x] Profile API修复（支持完整用户信息）
- [x] 会员创建功能（外键约束修复）
- [x] 环境变量配置（.env文件格式）
- [x] 登录功能（bcrypt密码验证）

### ✅ 本地测试通过
- [x] 用户登录：正常生成JWT token
- [x] Profile API：正确返回用户信息
- [x] 会员管理：成功创建会员
- [x] 商品管理：CRUD操作正常
- [x] 订单管理：采购/销售订单正常
- [x] 数据分析：统计数据正常

## 🔄 部署方式

### 方式1：Git推送自动部署（推荐）

```bash
# 1. 检查Git状态
git status

# 2. 添加所有修改
git add .

# 3. 提交修改
git commit -m "修复系统核心问题：JWT认证、数据库Schema同步、Profile API等功能已全部正常工作"

# 4. 推送到GitHub（将触发Vercel自动部署）
git push origin main
```

**注意：** 如果网络连接有问题，可以尝试以下方法：
- 使用VPN或更换网络
- 使用SSH方式推送
- 使用Vercel CLI直接部署

### 方式2：SSH推送（网络问题时使用）

```bash
# 1. 配置SSH（如果还没有）
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"

# 2. 添加SSH密钥到GitHub
cat ~/.ssh/id_rsa.pub
# 复制输出内容到GitHub Settings > SSH Keys

# 3. 更改远程仓库为SSH
git remote set-url origin git@github.com:Yascon/zhixiang.git

# 4. 推送代码
git push origin main
```

### 方式3：Vercel CLI直接部署

```bash
# 1. 安装Vercel CLI
npm i -g vercel

# 2. 登录Vercel
vercel login

# 3. 直接部署
vercel --prod
```

### 方式4：手动上传（最后选择）

1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 找到你的项目
3. 点击 "Settings" > "Git"
4. 手动触发重新部署

## 🔧 Vercel环境变量配置

确保在Vercel项目设置中配置以下环境变量：

```env
# 数据库
DATABASE_URL="file:./prod.db"

# JWT密钥
JWT_SECRET="mySuperSecretJWTKey1234567890abcdef"

# NextAuth
NEXTAUTH_SECRET="myNextAuthSecretKey1234567890abcdef"
NEXTAUTH_URL="https://your-app-name.vercel.app"

# 环境
NODE_ENV="production"
```

## 📊 部署后验证步骤

### 1. 基础功能测试
```bash
# 测试登录API
curl -X POST https://your-app.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'

# 测试Profile API
curl -X GET https://your-app.vercel.app/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 2. 前端功能验证
- [ ] 登录页面正常加载
- [ ] 用户能成功登录
- [ ] 仪表板数据正常显示
- [ ] 会员管理功能正常
- [ ] 商品管理功能正常
- [ ] 订单管理功能正常

### 3. 数据库验证
- [ ] 数据库连接正常
- [ ] 基础数据已初始化
- [ ] CRUD操作正常工作

## 🚨 常见部署问题及解决方案

### 问题1：数据库文件丢失
**解决方案：** 访问 `/api/init-data` 重新初始化数据

### 问题2：JWT验证失败
**解决方案：** 检查Vercel环境变量中的JWT_SECRET是否正确设置

### 问题3：Profile API返回字段错误
**解决方案：** 确保Prisma客户端已正确生成，数据库Schema同步

### 问题4：会员创建失败
**解决方案：** 检查会员等级数据是否已初始化

## 📝 部署后的下一步

1. **监控部署状态**
   - 查看Vercel部署日志
   - 检查是否有构建错误

2. **测试核心功能**
   - 登录/注册
   - 数据CRUD操作
   - 报表生成

3. **性能优化**
   - 检查页面加载速度
   - 优化数据库查询
   - 配置CDN缓存

4. **用户反馈收集**
   - 收集用户使用反馈
   - 修复发现的新问题

## 🔗 相关链接

- **线上应用：** https://zhixiang-yascons-projects.vercel.app
- **GitHub仓库：** https://github.com/Yascon/zhixiang
- **Vercel项目：** [Vercel Dashboard](https://vercel.com/dashboard)

---

**最后更新：** 2025年5月30日  
**状态：** 准备部署 ✅ 