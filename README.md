# HolyShit 期刊

> SHIT期刊的精神继承者

## 项目背景

在2026年3月份的时候，《SHIT期刊》火爆了全网。笔者被其巧妙的创意所震撼，也被里面一些有趣的文章所吸引。但遗憾的是，不久之后 SHIT期刊就关闭了投稿界面。本人遂产生了一个想要"复活"SHIT期刊的想法。于是制作了现在这个开源的 HolyShit 期刊项目。

## 项目特色

- **高度开源** —— 所有代码均以 MIT License 在 GitHub 开源
- **去中心化** —— 本项目没有评审，只有 AI 打分和其他网友的投票会决定你的稿件能否入选
- **无需注册** —— 不需要繁琐的注册登录，打开网站即可投稿投票

## 核心功能

- **投稿期** —— 每个月的 1-24 日是投稿日，任何人都可以上传自己的论文，也可以阅读其他人的论文
- **投票期** —— 每个月的 25 号到月末，可以给你喜欢的论文投票
- **AI 打分** —— 每月 1 号零点，会给上个月的所有文章进行汇总，综合 AI 打分和网友投票，得分最高的前十篇论文会进入"构石"区

## 技术栈

**后端：** Supabase

**前端：** Next.js 15 + React 19 + Tailwind CSS

**其他：** Tesseract.js、pdf-lib、pdfjs-dist、ALTCHA

## 快速开始

```bash
# 克隆项目
git clone https://github.com/your-username/holyshit.git
cd holyshit

# 安装依赖
npm install

# 配置环境变量
cp .env.local.example .env.local
# 编辑 .env.local 填入你的 Supabase 和其他 API 密钥

# 启动开发服务器
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看项目。

## 项目结构

```
holyshit/
├── app/              # Next.js 应用目录
│   ├── api/         # API 路由
│   ├── latrine/     # 茅坑页面（投票）
│   └── submit/      # 投稿页面
├── lib/              # 工具库
├── types/            # TypeScript 类型定义
├── tests/            # 测试文件
└── docs/             # 项目文档
```

## 贡献

欢迎提交 Issue 和 Pull Request！

## 赞助

[赞助地址](https://afdian.com/a/holyshitjournal/plan)

您赞助的每一分钱，都会变成 token 帮助本项目的长期运营，感谢您的支持。

## 开源协议

本项目采用 [MIT License](LICENSE) 开源协议。
