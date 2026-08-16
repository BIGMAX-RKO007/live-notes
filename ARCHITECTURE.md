# 📐 项目架构与源码追踪指南 (Architecture & Execution Tracking Guide)

本文档旨在梳理系统在 **温馨治愈手账风 (Cozy Journal Theme)** 演进后的最新架构设计、多租户鉴权模型、数据流路线图以及源码文件的职责划分。

---

## 🗺️ 全局架构模块分层 (Feature-Folder CSR)

应用采用了清晰的 **按业务功能模块划分 (Feature-Folder Architecture)**，结合服务端的 **三层架构 (Controller ➔ Service ➔ Repository)**：

```mermaid
graph TD
    Client["浏览器客户端 (Client Browser)"]
    
    subgraph 路由网关层 (Gateways & Entry)
        Entry["src/index.tsx (根入口)"]
        AuthCtrl["auth.controller.tsx (/api/auth)"]
        BoardCtrl["board.controller.tsx (/)"]
        NotesCtrl["notes.controller.tsx (/api/notes)"]
    end

    subgraph 核心业务逻辑与仓储层 (Services & Repos)
        AuthUtil["shared/utils/auth.ts (Web Crypto)"]
        NickUtil["shared/utils/nickname.ts (Animal Persona)"]
        NotesService["notes.service.ts (业务逻辑)"]
        NotesRepo["notes.repository.ts (Drizzle D1)"]
    end

    subgraph 数据库实体层 (D1 SQLite Schemas)
        UserSchema["users.schema.ts (用户实体)"]
        NoteSchema["notes.schema.ts (便签实体+likes)"]
    end

    subgraph 手账风视图渲染层 (Journal Views)
        LayoutView["Layout.tsx (奶油手账纸张Shell)"]
        BoardView["Board.tsx (手账卡片夹画布)"]
        NoteView["Note.tsx (和纸胶带便签卡片)"]
        LandingView["Landing.tsx (治愈落地页)"]
      ModalView["NoteModal.tsx / NoteEditForm.tsx"]
    end

    Client --> Entry
    Entry --> AuthCtrl & BoardCtrl & NotesCtrl
    AuthCtrl --> AuthUtil & UserSchema
    NotesCtrl --> NotesService & NickUtil
    NotesService --> NotesRepo
    NotesRepo --> NoteSchema
    BoardCtrl --> LayoutView & BoardView & LandingView
    NotesCtrl --> NoteView & ModalView
```

---

## 🔄 核心业务场景与数据流向

### 场景一：多租户看板鉴权与只读渲染 (`GET /board/:username`)

1. **请求到达**：请求进入 [board.controller.tsx](file:///home/fx/Develop/hono/src/features/board/board.controller.tsx)。
2. **所有者判定 (`isOwner`)**：
   - 提取请求中的 HttpOnly Session Cookie。
   - 利用 `hono/jwt` 的 `verify()` 解密 Token。
   - 比对当前登录用户名与路径参数 `:username`。若一致则 `isOwner = true`；否则为 `false`（游客只读模式）。
3. **数据读取与填充**：
   - 调用 `notesService.getNotesByUserId(boardOwner.id)` 查询目标画板的全量手账便签（包含 `likes` 点赞数）。
4. **组件渲染**：
   - 渲染 [Board.tsx](file:///home/fx/Develop/hono/src/features/board/components/Board.tsx) 并传入 `isOwner` 与 `notes` 列表。
   - 若 `isOwner === false`，[Board.tsx](file:///home/fx/Develop/hono/src/features/board/components/Board.tsx) 与 [Note.tsx](file:///home/fx/Develop/hono/src/features/notes/components/Note.tsx) 自动锁定拖拽事件监听、隐藏编辑与删除按钮，并提供 **`🏠 我的画板`** 导航快捷项。
5. **历史访问轨迹记录**：
   - [Board.tsx](file:///home/fx/Develop/hono/src/features/board/components/Board.tsx) 自动运行前端脚本，将 `:username` 写入 `localStorage` 历史记录列表，为后续朋友画板快速弹窗提供数据。

---

### 场景二：便签点赞与局部无刷更新 (`POST /api/notes/:id/like`)

1. **触达事件**：任何人（含未登录访客）在 [Note.tsx](file:///home/fx/Develop/hono/src/features/notes/components/Note.tsx) 中点击卡片左下角的 **`❤️ 点赞`** 印章按钮。
2. **HTMX 拦截**：HTMX 拦截该点击事件，向后端发送 `POST /api/notes/:id/like`。
3. **原子累加**：
   - [notes.controller.tsx](file:///home/fx/Develop/hono/src/features/notes/notes.controller.tsx) 接收请求并调用 `notesService.incrementLikes(id)`。
   - [notes.repository.ts](file:///home/fx/Develop/hono/src/features/notes/notes.repository.ts) 执行 Drizzle SQL：
     `UPDATE notes SET likes = likes + 1 WHERE id = ? RETURNING *;`
4. **局部 HTML 替换**：
   - 控制器仅返回最新计数的 `<button>` HTML 字符串。
   - HTMX 利用 `hx-swap="outerHTML"` 局部置换点赞按钮，无需刷新整张卡片或重新载入画布。

---

### 场景三：和纸胶带与手账风样式渲染 (`Layout.tsx` & `Note.tsx`)

- **撕拉感和纸胶带 (Washi Tape)**：
  - [Layout.tsx](file:///home/fx/Develop/hono/src/shared/components/Layout.tsx) 中定义了 `.washi-tape-yellow/pink/blue/green/purple` 类，结合多点 `clip-path` 裁剪出真实的撕边凹凸效果。
  - [Note.tsx](file:///home/fx/Develop/hono/src/features/notes/components/Note.tsx) 依据便签配色选择对应的胶带样式与微倾角，覆盖在卡片顶部正中央。
- **手账印章 (Stamps)**：
  - 卡片底部利用 [nickname.ts](file:///home/fx/Develop/hono/src/shared/utils/nickname.ts) 计算唯一动物代号，并附上印章边框（如 `🐈 匿名猫咪` + `印`）。

---

## 🛠️ 代码结构速查与维护指南

| 文件路径 | 核心职责与维护说明 |
| :--- | :--- |
| [src/features/notes/notes.schema.ts](file:///home/fx/Develop/hono/src/features/notes/notes.schema.ts) | 留言便签 D1 表结构，包含 `id`, `content`, `color`, `xPos`, `yPos`, `userId`, `likes`, `createdAt` |
| [src/features/users/users.schema.ts](file:///home/fx/Develop/hono/src/features/users/users.schema.ts) | 用户 D1 表结构，包含 `id`, `username`, `passwordHash`, `createdAt` |
| [src/shared/utils/auth.ts](file:///home/fx/Develop/hono/src/shared/utils/auth.ts) | Web Crypto Subtle (PBKDF2/SHA-256) 无依赖加盐密码加密验证 |
| [src/shared/utils/nickname.ts](file:///home/fx/Develop/hono/src/shared/utils/nickname.ts) | 基于便签 ID 哈希映射可爱匿名动物代号的工具 |
| [src/features/auth/auth.controller.tsx](file:///home/fx/Develop/hono/src/features/auth/auth.controller.tsx) | 登录/注册 Handler、HttpOnly JWT Cookie 签署、新手引导便签预置逻辑 |
| [src/features/board/board.controller.tsx](file:///home/fx/Develop/hono/src/features/board/board.controller.tsx) | `/board/:username` 主路由、`isOwner` 权限计算、`friends-modal` 与 `my-redirect` 路由 |
