# Vercel部署指南

## 环境变量
DATABASE_URL=postgresql://postgres:你的密码@你的主机:5432/postgres
JWT_SECRET=你的32位以上强密码
NODE_ENV=production
NEXT_PUBLIC_SUPABASE_URL=（如有用到 Supabase 客户端）
NEXT_PUBLIC_SUPABASE_ANON_KEY=（如有用到 Supabase 客户端）

## 初始化
- 部署后访问 `/api/init-data` 或 `/api/init` 初始化数据库
- 默认管理员：admin@zhixiang.com / admin123

## 本地开发
npx prisma generate
npx prisma migrate deploy
npm run build
npm start

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

# 智享进销存管理系统 - 线上数据初始化指南

## 🚀 快速初始化线上数据库

### 方法一：通过浏览器访问初始化页面

1. **访问初始化页面**：
   ```
   https://zhixiang-yascons-projects.vercel.app/init.html
   ```

2. **点击"开始初始化数据"按钮**

3. **等待初始化完成**

### 方法二：通过API直接初始化

使用以下命令直接调用初始化API：

```bash
# 方法1：POST请求
curl -X POST https://zhixiang-yascons-projects.vercel.app/api/init-data \
  -H "Content-Type: application/json"

# 方法2：GET请求
curl -X GET https://zhixiang-yascons-projects.vercel.app/api/init-data
```

### 方法三：通过浏览器直接访问API

在浏览器地址栏输入：
```
https://zhixiang-yascons-projects.vercel.app/api/init-data
```

## 📋 初始化内容

数据初始化将创建以下基础数据：

### 1. 默认管理员账户
- **邮箱**：admin@example.com
- **密码**：admin123
- **角色**：系统管理员

### 2. 会员等级
- **基础会员**：免费，最多1个用户，50个商品，500个订单
- **VIP会员**：299元，最多3个用户，200个商品，2000个订单
- **企业会员**：999元，最多10个用户，1000个商品，10000个订单

### 3. 商品分类
- 电子产品（手机、电脑、数码产品等）
- 服装鞋帽（男装、女装、童装、鞋类等）
- 食品饮料（零食、饮料、生鲜食品等）
- 家居用品（家具、装饰、日用品等）
- 图书文具（图书、文具、办公用品等）

### 4. 示例供应商
- 华为科技有限公司
- 小米科技有限公司

## 🎯 初始化完成后的操作

1. **登录管理后台**：
   ```
   https://zhixiang-yascons-projects.vercel.app/dashboard
   ```

2. **使用默认管理员账户登录**：
   - 邮箱：admin@example.com
   - 密码：admin123

3. **开始使用系统**：
   - 添加商品
   - 管理库存
   - 处理订单
   - 管理会员

## 🔧 故障排除

### 如果初始化失败

1. **检查网络连接**
2. **等待几分钟后重试**（可能是数据库连接问题）
3. **清除浏览器缓存后重试**

### 如果无法访问初始化页面

1. **直接使用API方法**
2. **等待Vercel部署完成**（通常需要1-3分钟）
3. **检查URL是否正确**

### 如果登录失败

1. **确认初始化已成功完成**
2. **使用正确的管理员账户信息**
3. **清除浏览器缓存和Cookie**

## 📞 技术支持

如果遇到问题，请检查：

1. **浏览器控制台错误信息**
2. **网络连接状态**
3. **Vercel部署状态**

## 🌟 系统特性

- ✅ 完整的进销存管理功能
- ✅ 现代化的用户界面
- ✅ 响应式设计，支持移动端
- ✅ 实时数据更新
- ✅ 安全的用户认证
- ✅ 详细的数据分析报表

---

**智享进销存管理系统** - 让库存管理更简单、更高效！ 