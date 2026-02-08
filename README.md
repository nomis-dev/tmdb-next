# TMDB Next

本项目是一个使用 Nx 管理的 Monorepo 工作空间，包含一个基于 TMDB API 的 Next.js 电影应用。

## 在线演示

[https://tmdb-next.huandoy.dpdns.org/zh/movies](https://tmdb-next.huandoy.dpdns.org/zh/movies)

## 项目结构

本 Nx 工作空间包含以下项目：

- **apps/movie-app**: 一个 Next.js 15 应用程序。这是主要的电影浏览应用。
- **libs/ui**: 一个共享的 UI 库，包含可重用的组件（例如：骨架屏 Skeleton、加载动画 Spinner）。

## 关于 Movie App

**Movie App** 是一个现代化的响应式 Web 应用，允许用户浏览、搜索和发现电影。

主要功能：

- **发现电影**: 浏览热门和流行电影。
- **搜索**: 按标题搜索电影。
- **电影详情**: 查看详细信息，包括演员阵容、预告片、导演等。
- **收藏夹**: 将电影添加到个人收藏列表（需要登录）。
- **国际化 (i18n)**: 支持多语言切换（英语、中文）。
- **无限滚动**: 流畅的无限滚动浏览体验。
- **响应式设计 (RWD)**: 完美适配移动端、平板和桌面端。

## 技术栈

- **框架**: [Next.js 15](https://nextjs.org/) (App Router)
- **Monorepo 工具**: [Nx](https://nx.dev/)
- **样式**: [Tailwind CSS](https://tailwindcss.com/)
- **数据获取**: [TanStack Query](https://tanstack.com/query/latest) (React Query)
- **API**: [The Movie Database (TMDB) API](https://www.themoviedb.org/documentation/api)
- **认证**: [Supabase Auth](https://supabase.com/auth)
- **数据库**: [Supabase](https://supabase.com/database) (PostgreSQL)
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
- **国际化**: [next-intl](https://next-intl-docs.vercel.app/)
- **部署**: [Cloudflare Pages](https://pages.cloudflare.com/) (使用 `@opennextjs/cloudflare`)

## 快速开始

1.  **克隆仓库:**

    ```bash
    git clone <repository-url>
    cd tmdb-next
    ```

2.  **安装依赖:**

    ```bash
    npm install
    # 或者
    yarn install
    # 或者
    pnpm install
    ```

3.  **设置环境变量:**

    复制 `.env.local.example` 到 `.env.local` 并填入必要的 API 密钥（TMDB, Supabase 等）。

4.  **运行开发服务器:**

    ```bash
    npx nx run @tmdb/movie-app:dev
    ```

    打开浏览器访问 [http://localhost:3000](http://localhost:3000) 查看结果。

## 部署

本项目部署在 Cloudflare Pages 上。

如需手动构建和部署：

```bash
cd apps/movie-app
npm run deploy
```

(注意: `deploy` 脚本使用 `@opennextjs/cloudflare` 处理构建流程，并通过 `wrangler` 进行部署。)
