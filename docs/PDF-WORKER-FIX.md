# PDF.js Worker 修复说明

## 问题描述

上传PDF时出现错误：
```
Setting up fake worker failed: "error loading dynamically imported module: http://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.js"
```

## 原因

PDF.js需要一个worker文件来处理PDF解析。之前的配置使用CDN链接，在以下情况会失败：
- 本地开发环境
- 网络问题
- CORS限制
- 内容安全策略(CSP)限制

## 解决方案

### 1. 使用本地Worker文件

已将PDF.js的worker文件复制到 `public/pdf-worker/` 目录，并更新代码使用本地路径：

```typescript
// lib/utils/pdf.ts
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf-worker/pdf.worker.min.mjs';
```

### 2. 自动化脚本

创建了 `scripts/copy-pdf-worker.sh` 脚本，在每次 `npm install` 后自动复制worker文件。

### 3. 文件结构

```
public/
  └── pdf-worker/
      └── pdf.worker.min.mjs  (1.3MB)
```

## 使用方法

### 首次设置或更新依赖后

```bash
npm install
```

postinstall脚本会自动复制worker文件。

### 手动复制（如果需要）

```bash
bash scripts/copy-pdf-worker.sh
```

## 验证修复

1. 启动开发服务器：
   ```bash
   npm run dev
   ```

2. 访问投稿页面

3. 尝试上传PDF文件

4. 应该不再出现worker加载错误

## 注意事项

- `public/pdf-worker/` 目录已添加到项目中
- worker文件约1.3MB，已包含在版本控制中
- 如果更新 `pdfjs-dist` 版本，需要重新运行复制脚本

## 相关文件

- `lib/utils/pdf.ts` - PDF处理工具函数
- `scripts/copy-pdf-worker.sh` - Worker文件复制脚本
- `package.json` - 包含postinstall钩子
- `public/pdf-worker/pdf.worker.min.mjs` - PDF.js worker文件

## 技术细节

### 为什么需要Worker？

PDF.js使用Web Worker在后台线程处理PDF解析，避免阻塞主线程UI。Worker文件包含：
- PDF解析逻辑
- 文本提取
- 渲染计算

### 为什么不用CDN？

1. **可靠性**：本地文件不依赖外部服务
2. **性能**：减少网络请求
3. **安全性**：避免CORS和CSP问题
4. **离线支持**：可在无网络环境工作

## 故障排除

### 如果仍然出现错误

1. 检查worker文件是否存在：
   ```bash
   ls -la public/pdf-worker/
   ```

2. 清除Next.js缓存：
   ```bash
   rm -rf .next
   npm run dev
   ```

3. 检查浏览器控制台是否有其他错误

4. 确认浏览器支持Web Workers（所有现代浏览器都支持）

### 常见问题

**Q: 为什么文件这么大(1.3MB)？**  
A: PDF.js worker包含完整的PDF解析引擎，需要处理各种PDF格式和编码。

**Q: 会影响页面加载速度吗？**  
A: 不会。Worker文件只在用户上传PDF时才加载，不影响初始页面加载。

**Q: 可以使用其他PDF库吗？**  
A: 可以，但PDF.js是Mozilla开发的，功能最完善，兼容性最好。

## 更新日志

- 2024-05-04: 修复CDN加载问题，改用本地worker文件
- 添加自动复制脚本
- 更新文档
