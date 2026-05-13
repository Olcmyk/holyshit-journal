# 项目文件结构

```
holyshit/
├── app/                          # Next.js 应用目录
│   ├── api/                      # API 路由
│   │   ├── submit/              # 投稿 API
│   │   ├── vote/                # 投票 API
│   │   └── archive/             # 归档 API
│   ├── latrine/                 # 茅坑页面（投票）
│   ├── submit/                  # 投稿页面
│   ├── globals.css              # 全局样式
│   ├── layout.tsx               # 根布局
│   └── page.tsx                 # 首页
│
├── lib/                          # 工具库
│   ├── ai/                      # AI 相关
│   │   └── silicon-flow.ts     # Silicon Flow API 集成
│   ├── supabase/                # Supabase 客户端
│   │   ├── client.ts           # 客户端
│   │   └── server.ts           # 服务端
│   └── utils/                   # 工具函数
│       ├── pdf.ts              # PDF 处理
│       └── date.ts             # 日期工具
│
├── types/                        # TypeScript 类型定义
│   └── submission.ts            # 投稿相关类型
│
├── tests/                        # 测试文件
│   ├── fixtures/                # 测试数据
│   │   ├── test-funny-paper.pdf           # 正常论文样本
│   │   ├── anticcp_test.pdf               # 违法内容样本
│   │   ├── test-funny-paper-extracted.txt # 提取的文本
│   │   └── anticcp_test-extracted.txt     # 提取的文本
│   ├── scripts/                 # 测试脚本
│   │   ├── analyze-pdf-structure.js      # PDF 结构分析
│   │   ├── generate-test-pdf.js          # 生成测试 PDF
│   │   ├── test-anticcp.js               # 违法内容测试
│   │   ├── test-pdf-extraction.js        # PDF 提取测试
│   │   └── test-submission-flow.js       # 投稿流程测试
│   ├── submission-system.test.js # 主测试套件
│   └── README.md                # 测试说明文档
│
├── docs/                         # 文档
│   ├── database/                # 数据库相关
│   │   ├── supabase-schema.sql           # 完整数据库架构
│   │   ├── supabase-schema-simple.sql    # 简化架构
│   │   ├── supabase-functions.sql        # 数据库函数
│   │   └── supabase-cleanup.sql          # 清理脚本
│   ├── OCR-IMPLEMENTATION.md    # OCR 实现文档
│   ├── TEST-REPORT.md           # 测试报告
│   └── TEST-RESULTS.md          # 测试结果详情
│
├── .env.local                    # 环境变量（不提交到 Git）
├── .mcp.json                     # MCP 配置
├── next.config.js               # Next.js 配置
├── tailwind.config.ts           # Tailwind CSS 配置
├── tsconfig.json                # TypeScript 配置
├── package.json                 # 项目依赖
└── package-lock.json            # 依赖锁定文件
```

## 目录说明

### 📁 核心应用目录

- **`app/`** - Next.js 15 应用目录，包含所有页面和 API 路由
- **`lib/`** - 可复用的工具函数和服务
- **`types/`** - TypeScript 类型定义

### 🧪 测试相关

- **`tests/`** - 所有测试文件的集中目录
  - `fixtures/` - 测试数据（PDF 文件、提取的文本）
  - `scripts/` - 独立的测试脚本
  - `submission-system.test.js` - 主测试套件

### 📚 文档

- **`docs/`** - 项目文档
  - `database/` - 数据库架构和脚本
  - 各种实现文档和测试报告

### ⚙️ 配置文件

- `.env.local` - 环境变量（API 密钥等）
- `next.config.js` - Next.js 配置
- `tailwind.config.ts` - Tailwind CSS 配置
- `tsconfig.json` - TypeScript 配置

## 快速命令

```bash
# 开发
npm run dev              # 启动开发服务器

# 测试
npm test                 # 运行测试套件
npm run test:summary     # 查看测试摘要

# 构建
npm run build            # 构建生产版本
npm start                # 启动生产服务器

# 代码检查
npm run lint             # 运行 ESLint
```

## 文件整理记录

### 已移动的文件

1. **PDF 文件** → `tests/fixtures/`
   - `test-funny-paper.pdf`
   - `anticcp_test.pdf`

2. **提取的文本** → `tests/fixtures/`
   - `test-funny-paper-extracted.txt`
   - `anticcp_test-extracted.txt`

3. **测试脚本** → `tests/scripts/`
   - `test-anticcp.js`
   - `test-pdf-extraction.js`
   - `test-submission-flow.js`
   - `analyze-pdf-structure.js`
   - `generate-test-pdf.js`

4. **数据库文件** → `docs/database/`
   - `supabase-schema.sql`
   - `supabase-schema-simple.sql`
   - `supabase-functions.sql`
   - `supabase-cleanup.sql`

5. **文档** → `docs/`
   - `OCR-IMPLEMENTATION.md`
   - `TEST-REPORT.md`
   - `TEST-RESULTS.md`

### 已删除的文件

- ❌ `test-funny-paper.html` - 不需要的 HTML 文件

## 注意事项

- 所有测试路径已更新为使用 `path.join(__dirname, 'fixtures/...')`
- 测试仍然全部通过（8/8）
- 文件结构更加清晰，便于维护
