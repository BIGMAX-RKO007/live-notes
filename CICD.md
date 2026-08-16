# 🤖 Cloudflare Workers + D1 Database CI/CD 自动化部署指南

本项目已配置了基于 **GitHub Actions** 的持续集成与自动部署 (CI/CD) 流程。通过该流程，团队成员只需向 GitHub 仓库的 `main` 分支推送代码，GitHub 虚拟机构建服务器就会自动完成：**代码下载 ➜ 依赖安装 ➜ 强类型安全检查 ➜ 线上数据库表结构同步 (Migrations) ➜ 全栈代码打包与发布**。

---

## 📂 工作流配置文件

工作流定义文件位于项目根目录：
👉 **[.github/workflows/deploy.yml](file:///home/fx/Develop/hono/.github/workflows/deploy.yml)**

### 工作流配置详解
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
        uses: actions/checkout@v4  # 拉取最新的 Git 代码

      - name: Set up Node.js
        uses: actions/setup-node@v4  # 安装 Node.js 运行环境
        with:
          node-version: 20
          cache: 'npm'  # 启用 npm 缓存加快后续构建速度

      - name: Install dependencies
        run: npm ci  # 安装 package-lock.json 中锁定的精准依赖

      - name: Run typecheck
        run: npx tsc --noEmit  # 核心类型校验，保障线上代码 0 编译错误

      - name: Apply D1 Migrations to Production (Remote)
        # 将 Drizzle 生成的局部 SQL 升级脚本应用至云端真实的 D1 数据库
        run: npx wrangler d1 migrations apply live-notes-db --remote
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}

      - name: Deploy to Cloudflare Workers
        # 编译压缩并上传 Worker 全栈代码
        run: npm run deploy
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
```

---

## 🔑 第一步：配置 GitHub Secrets 授权密钥

为了使 GitHub 的构建虚拟机有权操作您的 Cloudflare D1 数据库和部署 Workers，您必须在 GitHub 仓库中注入 API Token。

### 1. 申请 Cloudflare API Token
1. 访问 [Cloudflare 令牌控制面板](https://dash.cloudflare.com/profile/api-tokens)。
2. 创建一个基于 **“编辑 Cloudflare Workers”** 模板的 Token。
3. **重要安全补充**：编辑此 Token 权限，必须手动添加一条账户级权限：`帐户 (Account) -> D1 -> 编辑 (Edit)`，以便 Token 有权升级您的 D1 数据库表结构。
4. 复制生成的这一长串密钥 Token。

### 2. 注入 GitHub 仓库
1. 打开您的 GitHub 仓库网页端（如 `https://github.com/BIGMAX-RKO007/live-notes`）。
2. 点击顶部的 **Settings（设置）**。
3. 选择左侧栏的 **Secrets and variables** -> **Actions**。
4. 点击右上角的 **“New repository secret”** 按钮。
5. 填写以下表单：
   *   **Name**: `CLOUDFLARE_API_TOKEN`
   *   **Value**: 粘贴刚才从 Cloudflare 复制的 API 令牌。
6. 点击 **“Add secret”** 确认保存。

---

## 🔄 第二步：日常开发迭代与升级流

当您在本地开发完毕（如新增了页面、或是修改了数据库字段）准备发布到公网时，请遵循以下标准的 Git 发布流程：

```bash
# 1. 如果修改了 db/schema.ts 中的数据库字段，生成本地迁移 SQL
npx drizzle-kit generate

# 2. 暂存所有代码更改与本地迁移脚本
git add .

# 3. 提交本地更改
git commit -m "feat: add new tags feature for sticky notes"

# 4. 推送至 GitHub main 分支触发 CI/CD
git push origin main
```

### 💡 自动部署细节机制说明：
1.  **为什么 D1 数据库升级会先于代码部署？**
    *   在工作流中，`npx wrangler d1 migrations apply ... --remote` 被安排在代码部署步骤之前。这是为了确保数据库的表和列率先发生变更。如果先部署了代码，线上的 Worker 启动后去读写还不存在的新列，会导致服务崩溃。
2.  **CI 虚拟机中执行 D1 迁移为什么不需要输入 `y` 确认？**
    *   Wrangler 命令行工具非常智能，当检测到处于 CI/CD 非交互式终端环境时，会自动跳过 `Your database may not be available... continue? (Y/n)` 的提示，默认选择 `yes` 并自动进行备份与执行迁移。
