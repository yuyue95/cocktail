# 调酒笔记 CocktailNotes

一个面向「喝酒爱好者」与「卖酒经营者」的调酒记录 Web 应用。功能逻辑参考同类产品，
但视觉、文案、代码均为原创，模块化设计便于二次开发。

## 功能概览

双身份设计，可在「我的」页随时切换：

| 模块 | 喝酒模式 🍹 | 卖酒模式 🍸 |
|------|------------|------------|
| 首页配方推荐 + 搜索 | ✅ | ✅ |
| 配方详情 / 知识库 | ✅ | ✅ |
| 日历 | 品饮日记 + 口感评分 + 调酒思考 | 每日营业记账 + 月度报表 |
| 吧台 | 我的材料 → 「现在能做什么酒」推荐 | 酒单定价 + 库存预警 + 进货 |
| 收藏 / 想做清单 | ✅ | ✅ |
| 后台管理 | 管理员可录入酒谱 / 原料 / 文章（Markdown） | |

## 技术栈

- **Next.js 14**（App Router）+ TypeScript
- **Tailwind CSS**（原创配色：暖米白 + 墨黑 + 琥珀金，支持深色模式）
- **Prisma 6** + **SQLite**（开发）→ 生产可切 PostgreSQL
- **NextAuth.js**（邮箱密码 + JWT 会话，session 携带 role / mode）
- **react-hook-form + zod**（表单与校验）/ **zustand**（轻量客户端状态）
- **sonner**（toast）/ **lucide-react**（图标）/ **react-markdown**（知识库渲染）

## 目录结构

```
src/
├── app/
│   ├── (auth)/            登录 / 注册 / 身份选择 onboarding
│   ├── (main)/            主应用（底部 Tab：首页 / 日历 / 吧台 / 我的）
│   │   ├── page.tsx       首页：配方推荐 + 搜索
│   │   ├── cocktails/[slug]   配方详情
│   │   ├── knowledge/     知识库
│   │   ├── calendar/      日历（按 mode 分流喝酒 / 卖酒）
│   │   ├── bar/           吧台（按 mode 分流）
│   │   └── profile/       我的 + 身份切换
│   ├── admin/             后台管理（role=admin）
│   └── api/               所有 REST 接口（统一 { data } / { error } 信封）
├── components/            ui / layout / cocktail / calendar / bar / profile / admin
├── lib/                   prisma / auth / session / dto / serialize / constants / validations / fetcher / utils
└── types/                 next-auth 类型扩展
```

## 本地运行

```bash
pnpm install
pnpm db:push          # 按 schema 建库
pnpm db:seed          # 导入 20 款酒谱 / 30 原料 / 5 篇文章
pnpm dev              # http://localhost:3000
```

演示账号（seed 自带管理员）：`admin@cocktail.local` / `admin12345`

### 关于 Prisma 引擎（受限网络环境）

本仓库在受限代理环境下开发，Prisma 引擎的 node 下载器可能被代理重置。若 `prisma generate`
报 `ECONNRESET`，用 curl 手动获取引擎即可（普通网络 / Vercel 部署不受影响，无需此步骤）。
`package.json` 中已关闭 Prisma 的 postinstall 自动下载（`pnpm.onlyBuiltDependencies` 仅保留 esbuild）。

## 数据模型（核心）

`User`(含 mode) · `Cocktail` ↔ `CocktailIngredient` ↔ `Ingredient` · `Article`
喝酒：`DrinkLog` · `UserIngredient` · `UserCocktailList`
卖酒：`BusinessLog` ↔ `Sale` · `BarMenuItem` · `InventoryItem` · `PurchaseRecord`

> SQLite 不支持枚举 / 数组：枚举以 String 存储（取值见 `lib/constants.ts`），
> 数组以 JSON 字符串存储（经 `lib/serialize.ts` 收敛）。切 PostgreSQL 时仅改这两处。

## 部署

推送 GitHub → Vercel 导入，配置环境变量后自动部署：

```
DATABASE_URL       # 生产 PostgreSQL（将 schema.prisma 的 provider 改为 postgresql）
NEXTAUTH_SECRET    # 随机串
NEXTAUTH_URL       # 生产域名
```

生产首跑：`prisma migrate deploy` + `prisma db seed`。

## 后续二次开发（已预留）

- **智能推荐**：按心情 / 口味从已有酒单推荐。`Cocktail.flavorTags` 与
  `category` 字段已就绪，可在 `/api/recommendations` 下扩展；亦可接入 Claude API 做对话式推荐。
- 图片上传、社区分享、OAuth 登录、移动端 App 复用业务逻辑。
