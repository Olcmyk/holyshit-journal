/**
 * 测试数据插入脚本
 * 用于快速创建测试投稿和问题
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// 加载环境变量
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function insertTestData() {
  console.log('🚀 开始插入测试数据...');

  const monthYear = '2026-05'; // 当前月份

  // 测试投稿数据
  const testSubmissions = [
    {
      title: '论如何用量子力学解释为什么我的代码在本地能跑',
      abstract: '本研究深入探讨了薛定谔的代码现象：代码在开发者本地环境中处于"可运行"状态，但一旦部署到生产环境，立即坍缩为"报错"状态。我们提出了"观察者效应"理论，认为开发者的注视是代码正常运行的必要条件。',
      keywords: ['量子力学', '代码玄学', '薛定谔的Bug', '观察者效应'],
      authors: [
        { name: '张三', affiliation: '摸鱼大学计算机系', email: 'zhangsan@test.com' }
      ],
      highlights: ['首次将量子力学应用于软件工程', '解释了"在我电脑上能跑"现象', '提出了新的调试方法论'],
      pdf_url: 'https://example.com/test.pdf',
      pdf_hash: 'test_hash_1',
      pdf_pages: 8,
      status: 'approved',
      month_year: monthYear,
      morality_score: 85,
      humor_score: 95,
      scientific_score: 70,
    },
    {
      title: '关于开会时如何优雅地假装在听的实证研究',
      abstract: '通过对500名职场人士的观察研究，我们总结出了12种在会议中保持"认真倾听"假象的有效策略。研究发现，适时点头、偶尔皱眉、以及每15分钟说一次"这个想法不错"可以完美掩盖走神状态。',
      keywords: ['职场生存', '会议艺术', '表演学', '社会心理学'],
      authors: [
        { name: '李四', affiliation: '划水研究所', email: 'lisi@test.com' },
        { name: '王五', affiliation: '摸鱼大学社会学系', email: 'wangwu@test.com' }
      ],
      highlights: ['提出了"点头频率最优化模型"', '发现了"假装记笔记"的最佳时机', '总结了12种实用策略'],
      pdf_url: 'https://example.com/test2.pdf',
      pdf_hash: 'test_hash_2',
      pdf_pages: 10,
      status: 'approved',
      month_year: monthYear,
      morality_score: 60,
      humor_score: 90,
      scientific_score: 75,
    },
    {
      title: '深度学习模型为什么总是在我演示时崩溃：一个Murphy定律的扩展',
      abstract: '本文通过大量实验证明，AI模型的崩溃概率与观众的重要性成正比。我们发现，当CEO在场时，模型崩溃率高达99.7%。研究还揭示了"演示诅咒"的量化指标。',
      keywords: ['Murphy定律', '演示灾难', '深度学习', '职场玄学'],
      authors: [
        { name: '赵六', affiliation: 'Bug制造大学AI实验室', email: 'zhaoliu@test.com' }
      ],
      highlights: ['首次量化了"演示诅咒"', '提出了"重要性-崩溃率"正相关理论', '建议所有演示都应该录屏'],
      pdf_url: 'https://example.com/test3.pdf',
      pdf_hash: 'test_hash_3',
      pdf_pages: 7,
      status: 'approved',
      month_year: monthYear,
      morality_score: 80,
      humor_score: 88,
      scientific_score: 82,
    }
  ];

  // 插入投稿
  const { data: submissions, error: submissionError } = await supabase
    .from('submissions')
    .insert(testSubmissions)
    .select();

  if (submissionError) {
    console.error('❌ 插入投稿失败:', submissionError);
    return;
  }

  console.log(`✅ 成功插入 ${submissions.length} 条投稿`);

  // 为每个投稿创建问题
  const questions = [];

  for (const submission of submissions) {
    if (submission.title.includes('量子力学')) {
      questions.push({
        submission_id: submission.id,
        question_text: '根据论文，代码在本地能跑但在生产环境报错的现象被称为什么？',
        options: [
          '薛定谔的代码',
          '海森堡的Bug',
          '爱因斯坦的相对论',
          '牛顿的第一定律'
        ],
        correct_answer: 0
      });
      questions.push({
        submission_id: submission.id,
        question_text: '论文提出的"观察者效应"理论认为什么是代码正常运行的必要条件？',
        options: [
          '良好的网络环境',
          '开发者的注视',
          '充足的内存',
          '最新的框架版本'
        ],
        correct_answer: 1
      });
    } else if (submission.title.includes('开会')) {
      questions.push({
        submission_id: submission.id,
        question_text: '研究发现，每隔多久说一次"这个想法不错"可以完美掩盖走神状态？',
        options: [
          '5分钟',
          '10分钟',
          '15分钟',
          '20分钟'
        ],
        correct_answer: 2
      });
      questions.push({
        submission_id: submission.id,
        question_text: '论文总结了多少种在会议中保持"认真倾听"假象的策略？',
        options: [
          '8种',
          '10种',
          '12种',
          '15种'
        ],
        correct_answer: 2
      });
    } else if (submission.title.includes('深度学习')) {
      questions.push({
        submission_id: submission.id,
        question_text: '根据研究，当CEO在场时，模型崩溃率是多少？',
        options: [
          '50.5%',
          '75.3%',
          '99.7%',
          '100%'
        ],
        correct_answer: 2
      });
      questions.push({
        submission_id: submission.id,
        question_text: '论文提出AI模型的崩溃概率与什么成正比？',
        options: [
          '模型的复杂度',
          '数据集的大小',
          '观众的重要性',
          '训练的时长'
        ],
        correct_answer: 2
      });
    }
  }

  // 插入问题
  const { error: questionError } = await supabase
    .from('questions')
    .insert(questions);

  if (questionError) {
    console.error('❌ 插入问题失败:', questionError);
    return;
  }

  console.log(`✅ 成功插入 ${questions.length} 个问题`);
  console.log('\n🎉 测试数据插入完成！');
  console.log('\n📝 投稿列表：');
  submissions.forEach((s, i) => {
    console.log(`  ${i + 1}. ${s.title}`);
  });
}

// 运行脚本
insertTestData().catch(console.error);
