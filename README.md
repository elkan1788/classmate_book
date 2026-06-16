# 上海班 9.0 同学录

一个基于 React + Vite + TypeScript 构建的同学录网页应用，用于展示上海班 9.0 同学信息。项目支持密码访问、同学搜索、个人资料卡片、响应式布局以及幻灯片播放模式。

## 功能特性

- 密码访问保护，避免同学信息被直接公开访问
- 首页展示上海城市视觉元素和同学录入口
- 支持按姓名、花名、行业、3C 方向搜索同学
- 每位同学包含照片、姓名、花名、行业、籍贯、属相、星座、兴趣爱好、3C 方向、花名出处和想说的话
- 支持多种个人资料展示模板
- 支持移动端和桌面端响应式显示
- 支持幻灯片播放模式，并可调整播放速度和切换动画
- 同学数据集中维护，方便后续增删改查

## 技术栈

- React 19
- TypeScript
- Vite
- Tailwind CSS
- lucide-react

## 快速开始

安装依赖：

```bash
npm install
```

启动开发环境：

```bash
npm run dev
```

构建生产版本：

```bash
npm run build
```

本地预览生产构建：

```bash
npm run preview
```

## 环境变量

项目通过 `VITE_ACCESS_CODE` 设置访问密码。可以参考 `.env.example` 创建本地环境变量文件：

```bash
cp .env.example .env
```

然后在 `.env` 中配置：

```env
VITE_ACCESS_CODE=202606066
```

如果未配置该变量，应用会使用空密码校验逻辑；正式部署前请务必配置访问密码。

## 目录结构

```text
.
├── src
│   ├── assets
│   │   ├── avatar          # 同学头像图片
│   │   └── shanghai-skyline.jpg
│   ├── data
│   │   └── classmates.ts   # 同学录数据
│   ├── App.tsx             # 主应用界面
│   ├── main.tsx            # 应用入口
│   ├── styles.css          # 全局样式
│   └── types.ts            # 类型定义
├── index.html
├── package.json
└── vite.config.ts
```

## 数据维护

同学数据位于 `src/data/classmates.ts`，每条数据遵循 `Classmate` 类型定义。新增同学时，需要补充以下字段：

```ts
{
  id: "shanghai-class-9-001",
  name: "姓名",
  title: "花名",
  avatar: "avatar/name.jpg",
  industry: "行业",
  hometown: "籍贯",
  zodiac: "属相",
  constellation: "星座",
  hobbies: ["兴趣爱好"],
  direction3c: "CEO",
  story: "花名出处",
  message: "想说的话",
  template: "classic"
}
```

头像文件放在 `src/assets/avatar/` 目录下，`avatar` 字段建议使用 `avatar/文件名.jpg` 的形式。

## 幻灯片模式

应用支持播放模式，可通过 URL 参数进入：

```text
?play=1
```

在播放模式中，可以调整播放间隔、切换动画，并手动切换上一位或下一位同学。

## 部署

执行构建命令后，生产文件会输出到 `dist/`：

```bash
npm run build
```

将 `dist/` 目录部署到静态网站托管服务即可，例如 GitHub Pages、Vercel、Netlify 或其他静态资源服务器。
