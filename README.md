# Halo Coding Do Frontend

`halo-fe` 是 `Halo Coding Do` 的前端工程，基于 `Vue 3 + Vite + Pinia + Element Plus` 实现，负责承接落地页、登录注册、站内首页、博客、刷题、排行榜、AI 助手和管理后台等页面。

## 模块概览

- 落地页与认证：品牌首页、登录、注册、找回密码
- 站内学习：刷题首页、题库、练习页、练习记录、学习计划
- 内容社区：博客首页、文章列表、文章详情、文章发布/编辑
- AI 能力：通用对话、练题助手、智能客服、多模态解析
- 管理后台：用户管理、题目管理、分类标签、系统统计、博客统计

主要路由定义见：

- [src/router/index.js](E:/ToSchool/halo_project/halo-fe/src/router/index.js)

## 技术栈

- Vue 3
- Vite 5
- Vue Router 4
- Pinia
- Element Plus
- Axios
- ECharts
- TinyMCE
- highlight.js / marked / DOMPurify

## 目录说明

```text
halo-fe
├─ src
│  ├─ api                 # 接口请求封装
│  ├─ stores              # Pinia 状态
│  ├─ router              # 路由与守卫
│  ├─ views               # 页面级视图
│  │  ├─ modules/user     # 登录注册/个人中心
│  │  ├─ modules/blog     # 博客模块
│  │  ├─ modules/ai       # AI 模块
│  │  ├─ modules/admin    # 管理后台
│  │  ├─ modules/ranking  # 排行榜
│  │  └─ modules/questionBank / studyPlan / practiceHistory
│  └─ assets / styles     # 资源与样式
├─ favicon                # favicon 与站点图标资源
└─ package.json
```

## 本地启动

### 1. 环境要求

- Node.js 18+，建议使用较新的 LTS 版本
- npm 9+

### 2. 安装依赖

```bash
npm install
```

### 3. 启动开发环境

```bash
npm run dev
```

默认访问地址：

- `http://localhost:2444`

## 代理与联调

Vite 开发代理配置见：

- [vite.config.js](E:/ToSchool/halo_project/halo-fe/vite.config.js)

当前约定：

- 前端端口：`2444`
- 后端端口：`2004`
- `/api` 请求会代理到 `http://localhost:2004`

因此本地联调前，请先确认后端已经启动。

## 与后端对接关系

推荐先导入总 SQL：

- [../data/halo_all_in_one.sql](E:/ToSchool/halo_project/data/halo_all_in_one.sql)

当前前端已经对接的重点能力包括：

- 用户登录、注册、邮箱验证码、找回密码
- 刷题与练习记录
- 排行榜与统计卡片
- 博客列表、详情、点赞、评论、发布与编辑
- AI 会话列表、会话标题生成、消息持久化
- 管理后台真实统计数据与博客统计面板

## 开发建议

- 页面入口优先从 [src/views](E:/ToSchool/halo_project/halo-fe/src/views) 开始看
- 路由权限逻辑优先看 [src/router/index.js](E:/ToSchool/halo_project/halo-fe/src/router/index.js)
- 接口封装优先看 `src/api`
- 如果新增站内模块，建议继续沿用 `views/modules/*` 的拆分方式

## 构建说明

开发环境：

```bash
npm run dev
```

生产构建：

```bash
npm run build
```

当前已知问题：

- 现有环境下 `npm run build` 可能报错：`crypto$2.getRandomValues is not a function`
- 这个问题更偏向本地 Node / 依赖运行环境兼容性，不是当前业务页面代码语法错误
- 如果只是本地联调与功能开发，优先使用 `npm run dev`

## 推荐阅读顺序

1. 先看 [../README.md](E:/ToSchool/halo_project/README.md)
2. 再确认 [vite.config.js](E:/ToSchool/halo_project/halo-fe/vite.config.js)
3. 然后联动查看 [../halo-be/README.md](E:/ToSchool/halo_project/halo-be/README.md)
4. 最后进入具体模块页面与接口进行联调

## 说明

- 这是前后端分离项目，前端不建议写死接口地址，开发期统一走代理
- 如果要部署到生产环境，建议补充 `.env` 配置并区分不同环境
- 当前界面风格、博客阅读体验、AI 会话体验和后台统计能力都已经做过一轮项目化调整，后续可以继续在这个基础上迭代
