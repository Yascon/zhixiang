# 智享进销存管理系统

一个功能完整的现代化智享进销存管理系统，基于 Next.js 14 + React 18 + TypeScript 构建，特别注重会员收费管理功能。

## 🚀 核心功能

### 1. 基础进销存功能
- **商品管理**：完整的三级分类体系，支持商品增删改查、库存管理
- **供应商管理**：供应商信息管理，支持分类和信用等级
- **采购管理**：采购订单管理、入库管理、供应商对账
- **销售管理**：销售订单管理、出库管理、退货处理
- **库存管理**：实时库存查询、库存预警、库存调拨、盘点功能
- **财务管理**：收支记录、利润分析、财务报表

### 2. 会员管理系统 ⭐ (核心功能)
- **会员注册和信息管理**：完整的会员档案管理
- **会员等级设置**：普通会员、VIP、SVIP等多级会员体系
- **会员收费功能**：年费收取、续费管理、到期提醒
- **积分系统**：消费积分、积分兑换、会员权益
- **会员分析**：消费统计、价值分析、会员画像

### 3. 用户权限管理 🔐 (新增)
- **角色管理**：超级管理员、管理员、普通用户三级权限
- **权限控制**：基于角色的访问控制(RBAC)
- **用户管理**：用户增删改查、角色分配
- **登录认证**：JWT Token认证、安全登录

### 4. 数据库集成 💾 (新增)
- **真实数据持久化**：基于 Prisma ORM + SQLite
- **数据模型完整**：涵盖所有业务实体和关系
- **数据一致性**：事务处理、外键约束
- **自动初始化**：默认数据和用户创建

### 5. 报表导出功能 📊 (新增)
- **Excel导出**：支持 .xlsx 格式，自动列宽调整
- **PDF导出**：支持中文，表格样式美观
- **多种报表**：会员报表、商品报表、订单报表、财务报表
- **数据格式化**：自动格式化金额、日期等字段

## 🛠️ 技术栈

### 前端技术
- **框架**：Next.js 14 (App Router)
- **UI库**：React 18 + TypeScript
- **组件库**：Ant Design 5.x
- **样式**：Tailwind CSS
- **图表**：Recharts
- **日期处理**：dayjs

### 后端技术
- **API**：Next.js API Routes
- **数据库**：Prisma ORM + SQLite
- **认证**：JWT + Cookie
- **权限**：基于角色的访问控制

### 导出功能
- **Excel**：xlsx 库
- **PDF**：jsPDF + jspdf-autotable

## 📦 安装和运行

### 环境要求
- Node.js 18+
- npm 或 yarn

### 安装步骤

1. **克隆项目**
```bash
git clone <repository-url>
cd 线上进销存
```

2. **安装依赖**
```bash
npm install
```

3. **初始化数据库**
```bash
npx prisma generate
npx prisma db push
```

4. **启动开发服务器**
```bash
npm run dev
```

5. **访问系统**
- 系统地址：http://localhost:3000
- 登录页面：http://localhost:3000/login

### 默认账户
- **管理员账户**：admin@example.com / admin123

## 🎯 功能特色

### 会员收费管理亮点
- **灵活的会员等级设置**：支持自定义会员等级和年费
- **多种支付方式**：现金、支付宝、微信、银行卡
- **自动续费提醒**：到期前自动提醒续费
- **会员专享价格**：不同等级享受不同折扣
- **积分奖励机制**：消费积分、等级积分奖励
- **详细的会员分析**：消费趋势、价值分析

### 权限管理特色
- **三级权限体系**：超级管理员、管理员、普通用户
- **细粒度权限控制**：精确到功能模块的权限管理
- **安全认证机制**：JWT Token + Cookie 双重保护
- **权限可视化**：直观的权限配置界面

### 报表导出特色
- **多格式支持**：Excel、PDF 双格式导出
- **数据格式化**：自动格式化金额、日期、状态等
- **美观的样式**：专业的报表样式和布局
- **批量导出**：支持大量数据的高效导出

## 📁 项目结构

```
├── app/                    # Next.js App Router
│   ├── api/               # API 路由
│   │   ├── auth/          # 认证相关 API
│   │   ├── members/       # 会员管理 API
│   │   ├── users/         # 用户管理 API
│   │   └── ...
│   ├── dashboard/         # 仪表板页面
│   │   ├── members/       # 会员管理页面
│   │   ├── products/      # 商品管理页面
│   │   ├── users/         # 用户管理页面
│   │   ├── reports/       # 报表管理页面
│   │   └── ...
│   ├── login/             # 登录页面
│   └── globals.css        # 全局样式
├── lib/                   # 工具库
│   ├── auth.ts           # 权限认证工具
│   ├── export-utils.ts   # 导出功能工具
│   ├── init-db.ts        # 数据库初始化
│   └── db.ts             # 数据库连接
├── prisma/               # 数据库相关
│   └── schema.prisma     # 数据模型定义
├── types/                # TypeScript 类型定义
└── public/               # 静态资源
```

## 🔧 配置说明

### 环境变量
创建 `.env` 文件：
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key"
```

### 数据库配置
系统使用 SQLite 作为默认数据库，生产环境可切换到 PostgreSQL 或 MySQL。

## 📈 使用指南

### 1. 系统初始化
首次访问系统时，会自动创建默认管理员账户和会员等级。

### 2. 会员管理
- 进入"会员管理"页面
- 点击"新增会员"添加会员
- 使用"收费"功能收取会员费
- 导出会员数据进行分析

### 3. 权限管理
- 使用管理员账户登录
- 进入"用户管理"页面
- 创建不同角色的用户
- 分配相应权限

### 4. 报表导出
- 进入"报表管理"页面
- 选择需要导出的数据类型
- 点击"导出报表"选择格式
- 系统自动下载文件

## 🚀 部署说明

### 生产环境部署
1. 构建项目：`npm run build`
2. 启动服务：`npm start`
3. 配置反向代理（Nginx）
4. 设置 HTTPS 证书

### Docker 部署
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 📄 许可证

MIT License

## 📞 联系方式

如有问题或建议，请联系开发团队。

---

**智享进销存管理系统** - 专业、高效、易用的企业级进销存解决方案

### 用户账号管理功能
- **管理员功能**:
  - 创建用户账号（邮箱、密码、角色设置）
  - 重置用户密码（重置为默认密码123456）
  - 用户角色管理（超级管理员、管理员、普通用户）
- **用户自助功能**:
  - 个人信息管理（姓名、手机号修改）
  - 密码修改（验证当前密码后设置新密码）
  - 个人资料查看（账号信息、注册时间等）

## 📄 许可证

MIT License

## 📞 联系方式

如有问题或建议，请联系开发团队。

---

**智享进销存管理系统** - 专业、高效、易用的企业级进销存解决方案

# 智享进销存管理系统 - Vercel部署指南

## 环境变量（Vercel Settings > Environment Variables）

```
DATABASE_URL=postgresql://postgres:你的密码@你的主机:5432/postgres
JWT_SECRET=你的32位以上强密码
NODE_ENV=production
NEXT_PUBLIC_SUPABASE_URL=（如有用到 Supabase 客户端）
NEXT_PUBLIC_SUPABASE_ANON_KEY=（如有用到 Supabase 客户端）
```

## 一键初始化

1. 部署成功后访问 `/api/init-data` 或 `/api/init` 完成数据库初始化。
2. 默认管理员：admin@zhixiang.com / admin123

## 本地开发

```
npx prisma generate
npx prisma migrate deploy
npm run build
npm start
```

## 生产部署

1. 推送代码到 GitHub
2. Vercel 自动构建并上线
3. 首次访问初始化接口，修改默认密码

---

如遇问题请检查 Vercel 日志和环境变量配置。 