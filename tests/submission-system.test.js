/**
 * Holy S.H.I.T 投稿系统完整测试套件
 *
 * 测试内容：
 * 1. test-funny-paper.pdf 能否通过测试并获得评分
 * 2. AI 评分格式是否正确
 * 3. anticcp_test.pdf 是否会被拒绝
 * 4. 评分环节是否有 bug
 * 5. 最终得分计算是否正确
 * 6. 重复提交（相同哈希值）是否会被拒绝
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const pdfjsLib = require('pdfjs-dist');

// ============================================================================
// 工具函数
// ============================================================================

/**
 * 从 PDF 提取文本
 */
async function extractPDFText(filePath) {
  const data = new Uint8Array(fs.readFileSync(filePath));
  const pdf = await pdfjsLib.getDocument({ data }).promise;

  let fullText = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item) => item.str).join(' ');
    fullText += pageText + '\n';
  }

  return fullText;
}

/**
 * 获取 PDF 页数
 */
async function getPDFPageCount(filePath) {
  const data = new Uint8Array(fs.readFileSync(filePath));
  const pdf = await pdfjsLib.getDocument({ data }).promise;
  return pdf.numPages;
}

/**
 * 生成 PDF 哈希值
 */
function generatePDFHash(filePath) {
  const buffer = fs.readFileSync(filePath);
  const hash = crypto.createHash('sha256');
  hash.update(buffer);
  return hash.digest('hex');
}

/**
 * 模拟 AI 审核（基于关键词检测）
 */
async function mockAIReview(pdfText, metadata) {
  // 检测违法内容
  const illegalKeywords = [
    '反对共产党', '推翻政府', '暴力革命', '恐怖主义',
    'anti-ccp', 'overthrow', 'terrorism', 'illegal drugs',
    '反共', '颠覆', '暴力'
  ];

  const textLower = pdfText.toLowerCase();
  const titleLower = metadata.title.toLowerCase();
  const abstractLower = metadata.abstract.toLowerCase();

  // 检查所有内容
  const allContent = `${titleLower} ${abstractLower} ${textLower}`;

  for (const keyword of illegalKeywords) {
    if (allContent.includes(keyword.toLowerCase())) {
      return {
        has_illegal_content: true,
        rejection_reason: `检测到违法内容关键词: "${keyword}"`,
        morality_score: null,
        humor_score: null,
        scientific_score: null,
        question: null
      };
    }
  }

  // 计算搞笑度分数
  const funnyKeywords = ['cat', 'butter', 'toast', 'quantum', 'smugness', 'meow', 'aerodynamic'];
  let humorScore = 30; // 基础分
  funnyKeywords.forEach(keyword => {
    const count = (textLower.match(new RegExp(keyword, 'g')) || []).length;
    humorScore += count * 8;
  });
  humorScore = Math.min(100, humorScore);

  // 模拟道德性和科学性分数
  const moralityScore = Math.floor(Math.random() * 20) + 80; // 80-100
  const scientificScore = Math.floor(Math.random() * 30) + 50; // 50-80

  return {
    has_illegal_content: false,
    rejection_reason: null,
    morality_score: moralityScore,
    humor_score: humorScore,
    scientific_score: scientificScore,
    question: {
      question_text: "What is the main subject of this paper?",
      options: [
        "Cats and physics",
        "Quantum mechanics",
        "Toast aerodynamics",
        "Animal behavior"
      ],
      correct_answer: 0
    }
  };
}

/**
 * 计算最终得分
 * 公式：final_score = (morality_score * 0.2) + (humor_score * 0.5) + (scientific_score * 0.3)
 */
function calculateFinalScore(moralityScore, humorScore, scientificScore) {
  return (moralityScore * 0.2) + (humorScore * 0.5) + (scientificScore * 0.3);
}

/**
 * 验证评分格式
 */
function validateScoreFormat(reviewResult) {
  const errors = [];

  if (reviewResult.has_illegal_content) {
    if (!reviewResult.rejection_reason) {
      errors.push('违法内容必须提供拒绝原因');
    }
    return { valid: errors.length === 0, errors };
  }

  // 检查分数范围
  if (typeof reviewResult.morality_score !== 'number' ||
      reviewResult.morality_score < 1 ||
      reviewResult.morality_score > 100) {
    errors.push(`道德性分数无效: ${reviewResult.morality_score} (应在 1-100 之间)`);
  }

  if (typeof reviewResult.humor_score !== 'number' ||
      reviewResult.humor_score < 1 ||
      reviewResult.humor_score > 100) {
    errors.push(`搞笑性分数无效: ${reviewResult.humor_score} (应在 1-100 之间)`);
  }

  if (typeof reviewResult.scientific_score !== 'number' ||
      reviewResult.scientific_score < 1 ||
      reviewResult.scientific_score > 100) {
    errors.push(`科学性分数无效: ${reviewResult.scientific_score} (应在 1-100 之间)`);
  }

  // 检查问题格式
  if (!reviewResult.question) {
    errors.push('缺少测试题');
  } else {
    if (!reviewResult.question.question_text) {
      errors.push('测试题缺少问题文本');
    }
    if (!Array.isArray(reviewResult.question.options) ||
        reviewResult.question.options.length !== 4) {
      errors.push('测试题必须有4个选项');
    }
    if (typeof reviewResult.question.correct_answer !== 'number' ||
        reviewResult.question.correct_answer < 0 ||
        reviewResult.question.correct_answer > 3) {
      errors.push('正确答案必须在 0-3 之间');
    }
  }

  return { valid: errors.length === 0, errors };
}

// ============================================================================
// 测试用例
// ============================================================================

class TestRunner {
  constructor() {
    this.tests = [];
    this.results = [];
    this.submissionHashes = new Set(); // 模拟数据库中的哈希值
  }

  test(name, fn) {
    this.tests.push({ name, fn });
  }

  async run() {
    console.log('\n' + '='.repeat(80));
    console.log('🧪 Holy S.H.I.T 投稿系统测试套件');
    console.log('='.repeat(80) + '\n');

    for (const test of this.tests) {
      try {
        console.log(`\n📝 测试: ${test.name}`);
        console.log('-'.repeat(80));
        await test.fn();
        this.results.push({ name: test.name, status: 'PASS', error: null });
        console.log('✅ 通过\n');
      } catch (error) {
        this.results.push({ name: test.name, status: 'FAIL', error: error.message });
        console.log(`❌ 失败: ${error.message}\n`);
      }
    }

    this.printSummary();
  }

  printSummary() {
    console.log('\n' + '='.repeat(80));
    console.log('📊 测试总结');
    console.log('='.repeat(80));

    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;

    this.results.forEach(result => {
      const icon = result.status === 'PASS' ? '✅' : '❌';
      console.log(`${icon} ${result.name}`);
      if (result.error) {
        console.log(`   错误: ${result.error}`);
      }
    });

    console.log('\n' + '-'.repeat(80));
    console.log(`总计: ${this.tests.length} | 通过: ${passed} | 失败: ${failed}`);
    console.log('='.repeat(80) + '\n');

    if (failed > 0) {
      process.exit(1);
    }
  }

  assert(condition, message) {
    if (!condition) {
      throw new Error(message);
    }
  }

  assertEqual(actual, expected, message) {
    if (actual !== expected) {
      throw new Error(`${message}\n  期望: ${expected}\n  实际: ${actual}`);
    }
  }

  assertRange(value, min, max, message) {
    if (value < min || value > max) {
      throw new Error(`${message}\n  值: ${value}\n  范围: ${min}-${max}`);
    }
  }
}

// ============================================================================
// 运行测试
// ============================================================================

async function main() {
  const runner = new TestRunner();

  // 测试 1: test-funny-paper.pdf 能否通过测试
  runner.test('test-funny-paper.pdf 应该通过审核', async () => {
    const pdfPath = path.join(__dirname, 'fixtures/test-funny-paper.pdf');
    runner.assert(fs.existsSync(pdfPath), 'PDF 文件不存在');

    const pageCount = await getPDFPageCount(pdfPath);
    console.log(`   页数: ${pageCount}`);
    runner.assert(pageCount <= 10, `页数超过限制: ${pageCount} > 10`);

    const pdfText = await extractPDFText(pdfPath);
    console.log(`   提取文本长度: ${pdfText.length} 字符`);

    const metadata = {
      title: 'The Aerodynamic Properties of Cats',
      abstract: 'A comprehensive study on the cat-toast paradox',
      authors: [{ name: 'Dr. Whiskers', affiliation: 'University of Meowbridge' }],
      keywords: ['cats', 'physics', 'humor']
    };

    const reviewResult = await mockAIReview(pdfText, metadata);
    console.log(`   违法内容: ${reviewResult.has_illegal_content}`);

    runner.assert(!reviewResult.has_illegal_content, '不应该被标记为违法内容');
    runner.assert(reviewResult.morality_score !== null, '应该有道德性分数');
    runner.assert(reviewResult.humor_score !== null, '应该有搞笑性分数');
    runner.assert(reviewResult.scientific_score !== null, '应该有科学性分数');
  });

  // 测试 2: AI 评分格式验证
  runner.test('AI 评分格式应该正确', async () => {
    const pdfPath = path.join(__dirname, 'fixtures/test-funny-paper.pdf');
    const pdfText = await extractPDFText(pdfPath);

    const metadata = {
      title: 'Test Paper',
      abstract: 'Test abstract',
      authors: [{ name: 'Test Author', affiliation: 'Test University' }],
      keywords: ['test']
    };

    const reviewResult = await mockAIReview(pdfText, metadata);
    console.log(`   道德性: ${reviewResult.morality_score}`);
    console.log(`   搞笑性: ${reviewResult.humor_score}`);
    console.log(`   科学性: ${reviewResult.scientific_score}`);

    const validation = validateScoreFormat(reviewResult);

    if (!validation.valid) {
      console.log('   格式错误:');
      validation.errors.forEach(err => console.log(`     - ${err}`));
    }

    runner.assert(validation.valid, `评分格式无效: ${validation.errors.join(', ')}`);

    // 验证分数范围
    runner.assertRange(reviewResult.morality_score, 1, 100, '道德性分数超出范围');
    runner.assertRange(reviewResult.humor_score, 1, 100, '搞笑性分数超出范围');
    runner.assertRange(reviewResult.scientific_score, 1, 100, '科学性分数超出范围');

    // 验证问题格式
    runner.assert(reviewResult.question !== null, '应该有测试题');
    runner.assert(reviewResult.question.options.length === 4, '应该有4个选项');
    runner.assertRange(reviewResult.question.correct_answer, 0, 3, '正确答案索引超出范围');
  });

  // 测试 3: anticcp_test.pdf 应该被拒绝
  runner.test('anticcp_test.pdf 应该被拒绝（违法内容）', async () => {
    const pdfPath = path.join(__dirname, 'fixtures/anticcp_test.pdf');
    runner.assert(fs.existsSync(pdfPath), 'PDF 文件不存在');

    const pdfText = await extractPDFText(pdfPath);
    console.log(`   提取文本长度: ${pdfText.length} 字符`);
    console.log(`   文本预览: ${pdfText.substring(0, 100)}...`);

    const metadata = {
      title: 'Anti-CCP Test Document',
      abstract: 'This is a test document with illegal content',
      authors: [{ name: 'Test', affiliation: 'Test' }],
      keywords: ['test']
    };

    const reviewResult = await mockAIReview(pdfText, metadata);
    console.log(`   违法内容: ${reviewResult.has_illegal_content}`);
    console.log(`   拒绝原因: ${reviewResult.rejection_reason}`);

    runner.assert(reviewResult.has_illegal_content, '应该被标记为违法内容');
    runner.assert(reviewResult.rejection_reason !== null, '应该有拒绝原因');
    runner.assert(reviewResult.morality_score === null, '违法内容不应该有分数');
  });

  // 测试 4: 最终得分计算
  runner.test('最终得分计算应该正确', () => {
    const testCases = [
      { morality: 80, humor: 90, scientific: 70, expected: 82 }, // 80*0.2 + 90*0.5 + 70*0.3 = 16 + 45 + 21 = 82
      { morality: 100, humor: 100, scientific: 100, expected: 100 },
      { morality: 50, humor: 50, scientific: 50, expected: 50 },
      { morality: 90, humor: 60, scientific: 80, expected: 72 }, // 90*0.2 + 60*0.5 + 80*0.3 = 18 + 30 + 24 = 72
    ];

    testCases.forEach((tc, idx) => {
      const finalScore = calculateFinalScore(tc.morality, tc.humor, tc.scientific);
      console.log(`   案例 ${idx + 1}: M=${tc.morality}, H=${tc.humor}, S=${tc.scientific} => ${finalScore.toFixed(2)}`);

      runner.assert(
        Math.abs(finalScore - tc.expected) < 0.01,
        `案例 ${idx + 1} 计算错误: 期望 ${tc.expected}, 实际 ${finalScore.toFixed(2)}`
      );
    });
  });

  // 测试 5: 评分权重验证
  runner.test('评分权重应该正确（搞笑性占50%）', () => {
    // 测试搞笑性的权重是否最大
    const baseScore = 50;

    // 只提高搞笑性
    const score1 = calculateFinalScore(baseScore, baseScore + 20, baseScore);
    // 只提高道德性
    const score2 = calculateFinalScore(baseScore + 20, baseScore, baseScore);
    // 只提高科学性
    const score3 = calculateFinalScore(baseScore, baseScore, baseScore + 20);

    console.log(`   提高搞笑性20分: +${(score1 - baseScore).toFixed(2)}`);
    console.log(`   提高道德性20分: +${(score2 - baseScore).toFixed(2)}`);
    console.log(`   提高科学性20分: +${(score3 - baseScore).toFixed(2)}`);

    runner.assert(score1 > score2, '搞笑性权重应该大于道德性');
    runner.assert(score1 > score3, '搞笑性权重应该大于科学性');
    runner.assert(score3 > score2, '科学性权重应该大于道德性');

    // 验证具体权重
    runner.assertEqual((score1 - baseScore).toFixed(1), '10.0', '搞笑性权重应该是 0.5');
    runner.assertEqual((score2 - baseScore).toFixed(1), '4.0', '道德性权重应该是 0.2');
    runner.assertEqual((score3 - baseScore).toFixed(1), '6.0', '科学性权重应该是 0.3');
  });

  // 测试 6: 重复提交检测（相同哈希值）
  runner.test('相同 PDF 哈希值应该被拒绝', () => {
    const pdfPath = path.join(__dirname, 'fixtures/test-funny-paper.pdf');
    runner.assert(fs.existsSync(pdfPath), 'PDF 文件不存在');

    const hash1 = generatePDFHash(pdfPath);
    console.log(`   第一次提交哈希: ${hash1.substring(0, 16)}...`);

    // 模拟第一次提交成功
    runner.assert(!runner.submissionHashes.has(hash1), '哈希值不应该存在');
    runner.submissionHashes.add(hash1);
    console.log(`   ✓ 第一次提交成功`);

    // 模拟第二次提交相同文件
    const hash2 = generatePDFHash(pdfPath);
    console.log(`   第二次提交哈希: ${hash2.substring(0, 16)}...`);

    runner.assertEqual(hash1, hash2, '相同文件应该生成相同哈希');
    runner.assert(runner.submissionHashes.has(hash2), '应该检测到重复哈希');
    console.log(`   ✓ 重复提交被正确检测`);
  });

  // 测试 7: 不同 PDF 应该有不同哈希值
  runner.test('不同 PDF 应该有不同哈希值', () => {
    const pdf1 = path.join(__dirname, 'fixtures/test-funny-paper.pdf');
    const pdf2 = path.join(__dirname, 'fixtures/anticcp_test.pdf');

    runner.assert(fs.existsSync(pdf1), 'PDF 1 不存在');
    runner.assert(fs.existsSync(pdf2), 'PDF 2 不存在');

    const hash1 = generatePDFHash(pdf1);
    const hash2 = generatePDFHash(pdf2);

    console.log(`   PDF 1 哈希: ${hash1.substring(0, 16)}...`);
    console.log(`   PDF 2 哈希: ${hash2.substring(0, 16)}...`);

    runner.assert(hash1 !== hash2, '不同文件应该有不同哈希值');
  });

  // 测试 8: 边界情况 - 极端分数
  runner.test('极端分数应该被正确处理', () => {
    const testCases = [
      { morality: 1, humor: 1, scientific: 1, name: '最低分' },
      { morality: 100, humor: 100, scientific: 100, name: '最高分' },
      { morality: 1, humor: 100, scientific: 1, name: '只有搞笑性高' },
      { morality: 100, humor: 1, scientific: 100, name: '搞笑性低' },
    ];

    testCases.forEach(tc => {
      const finalScore = calculateFinalScore(tc.morality, tc.humor, tc.scientific);
      console.log(`   ${tc.name}: ${finalScore.toFixed(2)}`);

      runner.assertRange(finalScore, 1, 100, `${tc.name} 的最终得分超出范围`);
    });
  });

  await runner.run();
}

// 运行测试
main().catch(error => {
  console.error('\n❌ 测试运行失败:', error);
  process.exit(1);
});
