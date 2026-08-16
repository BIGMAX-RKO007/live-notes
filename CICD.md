# 🤖 Cloudflare Workers + D1 Database CI/CD 自动化部署指南

本项目已配置基于 **GitHub Actions** 的持续集成与自动部署 (CI/CD) 流程。团队成员只需向 GitHub 仓库的 `main` 分支推送代码，GitHub 构建服务器就会全自动执行：**代码拉取 ➜ 依赖安装 ➜ TypeScript 强类型校验 ➜ D1 线上数据库表结构同步 (Migrations) ➜ 全栈 Hono 代码打包与发布**。

---

## 📂 数据库迁移文件链 (Migrations List)

项目数据库包含以下按顺序递增的 SQL 迁移文件，CI/CD 部署时会自动扫描并按顺序应用至 Cloudflare 线上 D1 数据库：

1. `migrations/0000_white_synch.sql`：创建基础 `notes` 留言卡片表。
2. `migrations/0001_cynical_ironclad.sql`：创建 `users` 用户实体表，并添加外键关联。
3. `migrations/0002_cynical_hemingway.sql`：为 `notes` 表增加 `likes` (点赞数) 字段。

---

## ⚙️ 工作流配置文件详解

工作流定义文件位于项目根目录：
👉 **[.github/workflows/deploy.yml](file:///home/fx/Develop/hono/.github/workflows/deploy.yml)**

```yaml
name: Deploy to Cloudflare Workers

on:
  push:
    branches:
      - main  # 仅当向 main 分支推送代码时触发

jobs:
  deploy:
    name: Deploy Worker & Apply D1 Migrations
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run typecheck
        run: npx tsc --noEmit  # 保障线上代码零 TypeScript 编译错误

      - name: Apply D1 Migrations to Production (Remote)
        # 将生成的全部 SQL 升级脚本应用至云端真实的 D1 数据库
        run: npx wrangler d1 migrations apply live-notes-db --remote
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}

      - name: Deploy to Cloudflare Workers
        # 编译压缩并上传 Hono 全栈代码
        run: npm run deploy
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
```

---

## 🔑 配置 GitHub Secrets 密钥

1. 在 Cloudflare Dashboard 申请一个带有 `Workers 编辑` 和 `Account -> D1 -> Edit` 权限的 API Token。
2. 进入 GitHub 仓库页面 ➔ **Settings** ➔ **Secrets and variables** ➔ **Actions**。
3. 添加名称为 `CLOUDFLARE_API_TOKEN` 的 Secret，并将 Token 粘贴保存。

---

## 🔄 日常开发与推送流程

在本地完成开发后，按照标准 Git 流程推送代码：

```bash
# 1. 若修改了 schema，生成新的 migration 脚本
npx drizzle-kit generate

# 2. 本地测试通过后提交
git add .
git commit -m "feat: complete cozy journal theme redesign and likes feature"
git push origin main
```

推送完成后，可在 GitHub 仓库 **Actions** 页实时查看全自动构建与发布状态。
