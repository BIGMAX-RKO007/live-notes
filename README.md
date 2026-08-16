# 📖 治愈手账留言墙 (Cozy Live Journaling Notes Board)

这是一个基于 **Hono + Cloudflare Workers + Cloudflare D1 + Drizzle ORM + HTMX** 构建的全栈、轻量级、温情治愈风的实时手账留言墙应用。

本项目采用了**日系手账 (Bullet Journal Aesthetic)** 设计语言，融合了**撕拉感和纸胶带 (Washi Tape)**、**奶油米白方格纸质感 (Grid Paper)**、**莫兰迪色系手账便笺** 与 **手账小印章 (Stamp Badges)**。

在此基础上，项目提供了完整的 **多租户个人空间**、**JWT 会话鉴权**、**卡片互动点赞**、**匿名动物昵称**、**朋友画板查找与历史轨迹** 等丰富的社交互动功能，并且 100% 运行在 Cloudflare 免费额度内。

---

## ⚡ 核心特色与技术亮点

1. 📖 **温馨治愈手账风设计 (Cozy Journal Theme)**：
   - **撕拉感和纸胶带 (Washi Tape)**：卡片顶部采用斜切半透明马卡龙和纸胶带固定，搭配天然撕边纹理。
   - **方格手账本底纹 (Grid Notebook Canvas)**：全屏背景选用暖调奶油米白 (`#fcfaf7`)，配合浅咖色方格纸网格纹理与暖阳微光。
   - **莫兰迪马卡龙色系**：便签卡片涵盖奶油黄、蜜桃粉、薄荷绿、薄藤紫、燕麦蓝等柔和典雅配色。
   - **手账盖章视觉 (Stamp Badges)**：点赞按钮与匿名昵称重构为软萌小手账印章（如 `🐾 匿名猫咪·印`）。
2. 🔐 **多租户个人画板与 Cookie 鉴权 (Multi-Tenant Auth)**：
   - **专属空间隔离**：每个注册用户拥有属于自己的画板地址 `/board/:username`。
   - **全自动鉴权与只读保护**：已登录用户在访问自己空间时拥有编辑/拖拽/删除权限（`isOwner = true`）；访客访问他人画板时进入**只读沉浸模式**，剥离修改权限，保留实时同步与点赞功能。
   - **HttpOnly 签名 Cookie 会话**：采用原生 `Web Crypto API` 加盐 SHA-256 哈希密码，基于 `hono/jwt` 签发 HttpOnly Session Cookie，防篡改且无需客户端 JS 繁重拦截。
3. ❤️ **社交互动与点赞 (Likes & Reactions)**：
   - **免登录无刷点赞**：卡片左下角放置 `❤️` 手账印章点赞按钮，任何人（含游客）点击即通过 HTMX 发起 `POST /api/notes/:id/like`，实现局部无刷累加。
   - **趣味匿名昵称**：基于 note ID 哈希算法生成可爱的匿名角色（如 `🐈 匿名猫咪`、`🦊 匿名狐狸`、`🐼 匿名熊猫` 等），提升留言温度。
4. 👥 **朋友的画板与历史轨迹 (Visited History)**：
   - **自动轨迹存储**：浏览器 `localStorage` 自动无感记录最近访问过的朋友画板用户名。
   - **一键快捷弹窗**：在弹窗中可以方便地查找朋友的用户名，或点击历史轨迹徽章一键秒入。
5. 🌱 **新手冷启动引导 (Cold Start Seeding)**：
   - 用户注册新画板时，系统后台自动为其预置 **2 张精心设计的手账引导卡片**（操作说明与今日话题），解决空板冷清问题。
6. 🚀 **边缘计算与极速冷启动**：
   - Hono 框架运行在 Cloudflare Workers 边缘节点上，冷启动 0ms - 10ms，具备 Edge 端强类型安全与极速响应。

---

## 📁 架构与文件目录说明

```text
/
├── .github/workflows/          # GitHub Actions 自动化 CI/CD 部署工作流
├── migrations/                 # Drizzle Kit 自动生成的 SQL 数据库建表与迁移脚本
│   ├── 0000_white_synch.sql    # 初始 notes 表结构
│   ├── 0001_cynical_ironclad.sql# 新增 users 表结构及外键关联
│   └── 0002_cynical_hemingway.sql# 新增 likes 点赞列
├── src/
│   ├── db/
│   │   └── client.ts           # Drizzle D1 数据库实例助手与 Schema 导出
│   ├── features/               # 按业务功能划分的模块目录 (Feature-Folder Architecture)
│   │   ├── auth/               # 认证模块 (登录/注册 Modal、密码哈希、JWT Session)
│   │   │   └── auth.controller.tsx
│   │   ├── board/              # 画布空间模块 (主画板、Landing 页、朋友画板查找弹窗)
│   │   │   ├── board.controller.tsx
│   │   │   └── components/
│   │   │       ├── Board.tsx
│   │   │       └── Landing.tsx
│   │   ├── notes/              # 留言卡片模块 (卡片增删改查、拖拽保存、点赞)
│   │   │   ├── notes.controller.tsx
│   │   │   ├── notes.repository.ts
│   │   │   ├── notes.schema.ts
│   │   │   ├── notes.service.ts
│   │   │   └── components/
│   │   │       ├── Note.tsx
│   │   │       ├── NoteEditForm.tsx
│   │   │       └── NoteModal.tsx
│   │   └── users/              # 用户实体 Schema 模块
│   │       └── users.schema.ts
│   ├── shared/                 # 共享组件与工具函数
│   │   ├── components/
│   │   │   └── Layout.tsx      # 手账背景 Shell (方格网格、Washi Tape CSS、柔和暖光)
│   │   └── utils/
│   │       ├── auth.ts         # Web Crypto 加盐密码哈希工具
│   │       └── nickname.ts     # 匿名动物昵称映射工具
│   └── index.tsx               # 服务端入口 (挂载各个控制器路由)
├── ARCHITECTURE.md             # 架构执行流程图与源码追踪指南
├── CICD.md                     # GitHub Actions CI/CD 自动化部署指南
├── drizzle.config.ts           # Drizzle Kit 工具链配置文件
├── tsconfig.json               # TypeScript 编译器配置
└── wrangler.jsonc              # Cloudflare Workers 本地及云端部署配置文件
```

---

## 🛠️ 本地开发与数据库操作指南

### 1. 快速启动指令

```bash
# 安装依赖
npm install

# 运行 TypeScript 类型检查
npx tsc --noEmit

# 启动本地开发服务 (托管在 Miniflare 模拟器上)
npm run dev
```

### 2. 数据库迁移与重置命令

```bash
# 1. 根据 Schema 变更生成 SQL 迁移脚本
npx drizzle-kit generate

# 2. 清理本地数据库并重新按顺序应用迁移 (针对 Schema 变更重设)
npx wrangler d1 execute live-notes-db --local --command "DROP TABLE IF EXISTS d1_migrations; DROP TABLE IF EXISTS notes; DROP TABLE IF EXISTS users;"
CI=true npx wrangler d1 migrations apply live-notes-db --local
```

---

## 🚀 部署至 Cloudflare 生产环境

### 1. 创建线上 D1 数据库
```bash
npx wrangler d1 create live-notes-db
```

### 2. 应用远程数据库迁移
```bash
npx wrangler d1 migrations apply live-notes-db --remote
```

### 3. 一键部署 Worker
```bash
npm run deploy
```

---

## 🤖 CI/CD 自动化部署 (GitHub Actions)

项目内置了完整的 GitHub Actions 工作流 [.github/workflows/deploy.yml](file:///home/fx/Develop/hono/.github/workflows/deploy.yml)。

在 GitHub 仓库设置中添加 `CLOUDFLARE_API_TOKEN` Secret 后，每次向 `main` 分支 `git push`，系统将自动完成：
`代码下载 ➜ 依赖安装 ➜ tsc 类型校验 ➜ 线上 D1 Migrations 应用 ➜ Worker 打包发布`！
