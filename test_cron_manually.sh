#!/bin/bash

# 手动测试 Cron API
# 使用方法: ./test_cron_manually.sh

echo "🧪 手动测试 Cron 归档功能"
echo "================================"
echo ""

# 从 .env.local 读取配置
if [ -f .env.local ]; then
  export $(cat .env.local | grep -v '^#' | xargs)
fi

# 检查必需的环境变量
if [ -z "$CRON_SECRET" ]; then
  echo "❌ 错误: 缺少 CRON_SECRET"
  echo "请在 .env.local 中设置 CRON_SECRET"
  exit 1
fi

# 获取部署的 URL
if [ -z "$VERCEL_URL" ]; then
  echo "⚠️  未设置 VERCEL_URL，请手动输入你的域名:"
  read -p "域名 (例如: your-app.vercel.app): " VERCEL_URL
fi

# 构建完整 URL
CRON_URL="https://${VERCEL_URL}/api/cron/archive-monthly"

echo "📡 调用 Cron API..."
echo "URL: $CRON_URL"
echo ""

# 调用 API
response=$(curl -s -w "\n%{http_code}" -X GET "$CRON_URL" \
  -H "Authorization: Bearer $CRON_SECRET" \
  -H "Content-Type: application/json")

# 分离响应体和状态码
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

echo "📊 响应状态码: $http_code"
echo ""
echo "📄 响应内容:"
echo "$body" | jq '.' 2>/dev/null || echo "$body"
echo ""

if [ "$http_code" = "200" ]; then
  echo "✅ Cron 执行成功！"
  echo ""
  echo "🔍 现在运行验证脚本检查结果..."
  node check_archive.mjs
else
  echo "❌ Cron 执行失败！"
  echo "请检查:"
  echo "  1. CRON_SECRET 是否正确"
  echo "  2. URL 是否正确"
  echo "  3. 是否设置了日期覆盖环境变量"
fi
