# Halo刷题网 - 前端项目

一个现代化的在线刷题与面试练习平台，采用Vue3 + Vite + Element Plus构建。

## ✨ 特性

- 🎯 **现代化UI设计** - 仿照LeetCode风格，简洁科技感
- 🔐 **完整用户系统** - 登录注册、个人中心、权限管理
- 📚 **丰富题库功能** - 题目筛选、搜索、分类管理
- 💻 **在线代码编辑** - 支持多种编程语言
- 📊 **学习统计分析** - 进度跟踪、成就系统
- 📱 **响应式布局** - 完美适配各种设备

## 🚀 快速开始

### 环境要求

- Node.js >= 16.0.0
- npm >= 8.0.0

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

项目将在 http://localhost:2444 启动

### 构建生产版本

```bash
npm run build
```

## 🏗️ 技术栈

- **前端框架**: Vue 3.4+
- **构建工具**: Vite 5.0+
- **状态管理**: Pinia 2.1+
- **路由管理**: Vue Router 4.2+
- **UI组件库**: Element Plus 2.4+
- **HTTP客户端**: Axios 1.6+
- **图标库**: @element-plus/icons-vue

## 📁 项目结构

```
src/
├── api/                # API接口封装
│   ├── auth.js        # 认证相关接口
│   └── request.js     # Axios配置和拦截器
├── components/        # 公共组件
├── router/           # 路由配置
│   └── index.js      # 路由定义和守卫
├── stores/           # Pinia状态管理
│   └── user.js       # 用户状态管理
├── styles/           # 全局样式
│   └── global.css    # 全局CSS变量和样式
├── views/            # 页面组件
│   ├── Landing.vue   # 首页（未登录）
│   ├── Login.vue     # 登录页面
│   ├── Register.vue  # 注册页面
│   ├── Home.vue      # 刷题主页
│   ├── Practice.vue  # 练习页面
│   └── Profile.vue   # 个人中心
├── App.vue           # 根组件
└── main.js           # 应用入口
```

## 🔗 API接口

项目配置了代理，所有以 `/api` 开头的请求会被代理到后端服务器。

### 主要接口

- `POST /api/auth/user/login` - 用户登录
- `POST /api/auth/user/register` - 用户注册
- `GET /api/auth/user/queryById/{id}` - 获取用户信息
- `POST /api/auth/user/logout` - 退出登录

## 🎨 设计规范

### 色彩系统

- **主色调**: #409EFF (科技蓝)
- **背景色**: #F5F7FA
- **文字色**: #303133 (主要文字) / #606266 (常规文字) / #909399 (次要文字)

### 组件规范

- **圆角**: 16px (卡片) / 8px (按钮)
- **阴影**: 0 2px 12px 0 rgba(0, 0, 0, 0.1)
- **字体**: PingFang SC / Helvetica Neue / Microsoft YaHei

## 🔐 路由守卫

项目实现了完整的路由守卫机制：

- 未登录用户访问需要认证的页面会自动跳转到登录页
- 已登录用户访问登录/注册页会重定向到首页
- Token过期会自动清除登录状态并跳转到登录页

## 📱 响应式设计

- **桌面端**: >= 1024px - 完整布局
- **平板端**: 768px - 1023px - 简化布局
- **移动端**: < 768px - 移动优化布局

## 🛠️ 开发指南

### 状态管理

使用Pinia进行状态管理，主要包括：

- 用户信息存储
- 登录状态管理
- Token管理

### API调用

所有API调用都通过统一的request实例，自动处理：

- Token添加
- 错误处理
- 响应拦截

### 样式开发

- 使用CSS变量定义主题色彩
- 遵循BEM命名规范
- 优先使用Element Plus组件

## 🚀 部署

### 环境变量

创建 `.env.production` 文件：

```env
VITE_API_BASE_URL=https://your-api-domain.com
```

### 构建部署

```bash
# 构建
npm run build

# 预览构建结果
npm run preview
```

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交Issue和Pull Request！

---

© 2025 Halo刷题网 | 用代码点亮未来 💡
