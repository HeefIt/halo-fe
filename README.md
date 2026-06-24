# Halo Coding Do Frontend

`halo-fe` 是 Halo Coding Do 的前端工程，负责落地页、认证页、站内首页、题库刷题、练习记录、排行榜、博客、社区、AI 助手和管理后台页面。

本轮文档只说明当前项目实际配置和联调入口。登录页、落地页、注册页属于外部入口页面；站内页面样式后续会另行统一。

## 技术栈

Vue 3、Vite 5、Vue Router 4、Pinia、Element Plus、Axios、TinyMCE、ECharts、marked、highlight.js、DOMPurify。

## 目录结构

```text
halo-fe
├─ src
│  ├─ api              # Axios 实例和接口模块
│  ├─ assets           # 图片和品牌资源
│  ├─ components       # 通用组件
│  ├─ composables      # 组合式逻辑
│  ├─ layouts          # 布局组件
│  ├─ pages            # 页面级组件
│  ├─ router           # 路由和守卫
│  ├─ stores           # Pinia 状态
│  ├─ styles           # 全局样式
│  ├─ App.vue
│  └─ main.js
├─ favicon             # Vite publicDir
├─ package.json
└─ vite.config.js
```

页面目录包括 `landing`、`auth`、`home`、`question-bank`、`practice`、`practice-history`、`ranking`、`blog`、`community`、`ai`、`admin`、`profile`。

## 本地启动

环境要求：Node.js 18+、npm 9+。

安装依赖：

```bash
npm install
```

启动开发服务：

```bash
npm run dev
```

默认访问：`http://localhost:2444`。

生产构建：

```bash
npm run build
```

当前 README 曾记录部分本地环境可能出现 `crypto$2.getRandomValues is not a function` 的构建兼容问题。后续以当前 Node 版本和依赖实测为准；只做功能联调时优先使用 `npm run dev`。

## 代理配置

配置文件：`vite.config.js`。

当前配置：

```js
server: {
  port: 2444,
  open: true,
  proxy: {
    '/api': {
      target: 'http://localhost:2004',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, '/api')
    }
  }
}
```

说明：

- 前端 Axios `baseURL` 是 `/api`。
- API 模块中写 `/auth/user/login`，实际请求为 `/api/auth/user/login`。
- Vite 代理保持 `/api` 前缀转发给后端。
- 后端 Controller 也挂 `/api/**`，所以当前配置是匹配的。

## 请求封装

Axios 实例：`src/api/http.js`。

当前行为：

- 请求头自动带 `satoken`。
- 非 FormData 请求默认 `Content-Type: application/json`。
- `responseType === 'blob'` 时直接返回原始 response。
- 普通接口直接返回后端 `Result`。

后端返回结构：`success/message/code/data`。当前后端部分业务失败可能仍是 HTTP 200，只在响应体里体现 `success=false`，前端业务代码需要同时判断 `success` 和 `code`。

## 路由入口

路由文件：`src/router/index.js`。

主要路由：

- `/`、`/login`、`/register`、`/forgot-password`
- `/home`、`/home/questions`、`/practice/:id?`
- `/practice-history`、`/practice-history/:id`
- `/ranking`
- `/blog`、`/blog/list`、`/blog/article/:id`、`/blog/write`
- `/community`、`/community/:id`
- `/ai/chatbot`、`/ai/role-chat`、`/ai/customer-service`、`/ai/learning-coach`、`/ai/halo-study-agent`、`/ai/multimodal`
- `/admin`、`/profile`

路由守卫：需要登录的页面依赖 `userStore.isLoggedIn`；本地 token key 是 `halo_token`；用户信息 key 是 `halo_user_info`；管理后台基于 `roleKeys` 是否包含 `admin_user` 判断。

## API 模块

```text
src/api/modules
├─ auth.js
├─ blog.js
├─ file.js
├─ notice.js
├─ share.js
├─ shareAdmin.js
├─ ai
│  ├─ agent.js
│  ├─ chat.js
│  ├─ haloStudyAgent.js
│  ├─ knowledgeAdmin.js
│  ├─ practice.js
│  ├─ role.js
│  └─ roleAdmin.js
└─ question
   ├─ category.js
   ├─ label.js
   ├─ practiceSession.js
   └─ subject.js
```

核心链路：登录注册 -> `/api/auth/**`；题库 -> `/api/subject/**`；练习会话 -> `/api/practice/session/**`；博客 -> `/api/blog/**`；社区 -> `/api/share/**`；AI -> `/api/ai/**`。

## 状态管理

- `stores/modules/user.js`：登录态、用户信息、管理员判断。
- `stores/modules/practice.js`：刷题上下文、练习会话和题目列表。
- `stores/modules/customerService.js`：客服会话状态。
- `stores/modules/theme.js`：主题状态。

登录和退出时会清理练题上下文，避免不同账号之间串练习状态。

## 联调建议

1. 后端启动在 `http://localhost:2004`。
2. 前端启动在 `http://localhost:2444`。
3. 使用 `haloAdmin / 123456` 或 `haloNomal / 123456` 登录。
4. 先验证 `/home/questions -> /practice -> /practice-history`。
5. 再验证博客、社区、后台。
6. 最后验证 AI 和知识库，因为这些依赖外部模型或向量服务。

## 当前已知风险

- 构建是否通过受本机 Node 和依赖环境影响，需要实测。
- 前端对后端业务失败需要按 `success/code/message` 判断。
- 后端全局异常和前端 401/403 拦截口径后续可以统一。
- 站内页面样式目前存在多个历史风格，后续计划以题库组件页的方正规整风格作为内部页面基准。
