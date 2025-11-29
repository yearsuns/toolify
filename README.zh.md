# Toolify

一个基于 Next.js 构建的现代化、多语言实用在线工具集合。Toolify 为开发者和用户提供了一套全面的工具集，涵盖编码、加密、图像处理、文本处理等功能。

## 🌟 特性

- **16+ 实用工具**：JSON 格式化器、Base64 编码器、URL 编码器、MD5 哈希器、密码生成器、时间戳转换器、二维码生成器、图片压缩器、颜色选择器、Markdown 编辑器、字数统计、IP 查询、单位转换器等
- **多语言支持**：支持英语、中文（简体）和日语
- **现代化 UI**：使用 Tailwind CSS 构建的简洁、响应式设计
- **标签化组织**：通过标签组织工具，便于发现
- **SEO 优化**：动态生成 sitemap 和 robots.txt
- **服务端渲染**：使用 Next.js SSR 实现快速页面加载
- **无障碍访问**：使用 Headless UI 构建，提供更好的可访问性

## 🛠️ 可用工具

### 开发工具
- **JSON 格式化器**：格式化和验证 JSON 数据
- **正则表达式测试器**：测试正则表达式
- **UUID 生成器**：生成唯一标识符

### 编码与解码
- **Base64 编码器/解码器**：编码和解码 Base64 字符串
- **URL 编码器/解码器**：编码和解码 URL 字符串

### 加密与安全
- **MD5 哈希器**：从文本生成 MD5 哈希值
- **密码生成器**：生成安全的随机密码

### 时间工具
- **时间戳转换器**：在时间戳和人类可读日期之间转换

### 图像工具
- **二维码生成器**：生成可自定义颜色和大小的二维码
- **图片压缩器**：在线压缩图片，可调整质量

### 设计工具
- **颜色选择器**：选择颜色并在 HEX、RGB、HSL、HSV 格式之间转换

### 文本工具
- **Markdown 编辑器**：实时 Markdown 编辑，带实时预览
- **字数统计**：统计字符、单词、行数、段落和句子数量

### 网络工具
- **IP 查询**：查询 IP 地址信息（地理位置、ISP、时区）

### 计算工具
- **单位转换器**：在各种单位之间转换（长度、重量、温度、体积、面积、速度、时间、数据）

### 格式转换
- **VLESS 转 Clash**：将 VLESS 配置转换为 Clash 格式

## 🚀 开始使用

### 前置要求

- Node.js 18+
- pnpm

### 安装

1. 克隆仓库：
```bash
git clone https://github.com/yourusername/toolify.git
cd toolify
```

2. 安装依赖：
```bash
pnpm install
```

3. 创建 `.env.local` 文件（可选）：
```bash
cp .env.example .env.local
```

编辑 `.env.local` 并设置你的基础 URL：
```
NEXT_PUBLIC_BASE_URL=https://your-domain.com
```

4. 运行开发服务器：
```bash
pnpm dev
```

5. 在浏览器中打开 [http://localhost:3000](http://localhost:3000)。

## 📦 构建生产版本

```bash
pnpm build
pnpm start
```

## 🏗️ 技术栈

- **框架**：[Next.js 16](https://nextjs.org/) (App Router)
- **语言**：TypeScript
- **样式**：[Tailwind CSS 4](https://tailwindcss.com/)
- **UI 组件**：[Headless UI](https://headlessui.com/)
- **Markdown**：[marked](https://marked.js.org/)
- **二维码**：[qrcode](https://www.npmjs.com/package/qrcode)
- **加密**：[crypto-js](https://cryptojs.gitbook.io/)
- **排版**：[@tailwindcss/typography](https://tailwindcss.com/docs/plugins/typography)

## 📁 项目结构

```
toolify/
├── src/
│   ├── app/                    # Next.js app 目录
│   │   ├── [lang]/            # 语言路由
│   │   │   ├── page.tsx       # 首页
│   │   │   └── tools/         # 工具页面
│   │   ├── api/               # API 路由
│   │   ├── robots.ts          # 动态 robots.txt
│   │   └── sitemap.ts         # 动态 sitemap.xml
│   ├── components/            # React 组件
│   │   ├── common/           # 共享组件
│   │   └── home/             # 首页组件
│   ├── data/                 # 数据文件
│   │   └── tools.ts          # 工具和标签数据
│   ├── locales/              # 翻译文件
│   │   ├── en.ts            # 英语
│   │   ├── zh.ts            # 中文
│   │   └── ja.ts            # 日语
│   ├── types/                # TypeScript 类型
│   └── utils/                # 工具函数
├── public/                    # 静态资源
└── package.json
```

## 🌍 国际化

Toolify 通过 `[lang]` 路由参数支持多种语言：
- `/en` - 英语
- `/zh` - 中文（简体）
- `/ja` - 日语

翻译文件位于 `src/locales/`。每个工具都可以有自己的翻译键。

## 🔧 添加新工具

1. 在 `src/data/tools.ts` 中添加工具数据：
```typescript
{
  id: 17,
  name: "myTool",
  icon: "🔧",
  description: "myTool",
  path: "/tools/my-tool",
  tags: ["development"]
}
```

2. 在 `src/locales/*.ts` 中添加翻译：
```typescript
myTool: {
  name: "我的工具",
  description: "工具描述",
  // ... 其他翻译
}
```

3. 在 `src/app/[lang]/tools/my-tool/page.tsx` 创建工具页面
4. 在 `src/app/[lang]/tools/my-tool/MyToolClient.tsx` 创建客户端组件

## 📝 许可证

本项目为私有和专有项目。

## 🤝 贡献

欢迎贡献！请随时提交 Pull Request。

## 📧 联系方式

如有问题或建议，请在 GitHub 上提交 issue。

---

使用 Next.js 构建 ❤️

