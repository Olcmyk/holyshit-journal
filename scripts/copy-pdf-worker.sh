#!/bin/bash
# 复制 PDF.js worker 文件到 public 目录

echo "正在复制 PDF.js worker 文件..."

# 创建目录
mkdir -p public/pdf-worker

# 复制 worker 文件
if [ -f "node_modules/pdfjs-dist/build/pdf.worker.min.mjs" ]; then
  cp node_modules/pdfjs-dist/build/pdf.worker.min.mjs public/pdf-worker/pdf.worker.min.mjs
  echo "✓ 已复制 pdf.worker.min.mjs"
elif [ -f "node_modules/pdfjs-dist/build/pdf.worker.min.js" ]; then
  cp node_modules/pdfjs-dist/build/pdf.worker.min.js public/pdf-worker/pdf.worker.min.js
  echo "✓ 已复制 pdf.worker.min.js"
else
  echo "✗ 找不到 PDF.js worker 文件"
  exit 1
fi

echo "完成！"
