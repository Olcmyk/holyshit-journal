#!/bin/bash

# 完整的自动打分测试流程
# 使用方法: ./test_scoring_flow.sh

echo "🧪 完整的自动打分测试流程"
echo "================================"
echo ""

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 步骤1：测试 AI 评分
echo -e "${YELLOW}📊 步骤1：测试 AI 自动评分${NC}"
echo "检查投稿时的 AI 评分是否正常..."
echo ""
node test_ai_scoring.mjs
echo ""
read -p "按 Enter 继续下一步..."
echo ""

# 步骤2：测试最终分数计算逻辑
echo -e "${YELLOW}📐 步骤2：测试最终分数计算逻辑${NC}"
echo "验证计算公式和预测排名..."
echo ""
node test_final_score_calculation.mjs
echo ""
read -p "按 Enter 继续下一步..."
echo ""

# 步骤3：选择测试方式
echo -e "${YELLOW}🎯 步骤3：选择测试方式${NC}"
echo ""
echo "请选择如何测试自动计算功能："
echo "  1) 本地测试 - 直接运行计算脚本（最快）"
echo "  2) API 测试 - 手动调用 Vercel Cron API（推荐）"
echo "  3) 等待 Cron - 等待 Vercel 自动触发（真实场景）"
echo "  4) 跳过"
echo ""
read -p "请选择 (1-4): " choice

case $choice in
  1)
    echo ""
    echo -e "${GREEN}执行本地计算...${NC}"
    node calculate_final_scores.mjs
    ;;
  2)
    echo ""
    echo -e "${GREEN}调用 Cron API...${NC}"
    ./test_cron_manually.sh
    ;;
  3)
    echo ""
    echo -e "${YELLOW}等待 Vercel Cron 自动触发...${NC}"
    echo "请在 Vercel Dashboard 查看 Cron Jobs 执行情况"
    echo "Functions → Cron Jobs"
    ;;
  4)
    echo ""
    echo "跳过测试"
    ;;
  *)
    echo ""
    echo -e "${RED}无效选择${NC}"
    exit 1
    ;;
esac

echo ""
read -p "按 Enter 继续验证结果..."
echo ""

# 步骤4：验证结果
echo -e "${YELLOW}✅ 步骤4：验证结果${NC}"
echo "检查归档是否成功..."
echo ""

if [ -f "check_archive.mjs" ]; then
  node check_archive.mjs
else
  echo "⚠️  未找到 check_archive.mjs，手动检查数据库："
  echo ""
  echo "检查项："
  echo "  1. submissions 表中所有投稿都有 final_score"
  echo "  2. selected_papers 表中有前10名记录"
  echo "  3. 前10名的状态为 'selected'"
  echo "  4. 其他投稿的 PDF 已删除"
fi

echo ""
echo -e "${GREEN}🎉 测试流程完成！${NC}"
echo ""
echo "📝 测试报告："
echo "  - AI 评分: 查看步骤1的输出"
echo "  - 计算逻辑: 查看步骤2的输出"
echo "  - 归档结果: 查看步骤4的输出"
echo ""
