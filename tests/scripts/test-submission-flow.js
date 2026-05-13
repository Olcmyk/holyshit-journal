const fs = require('fs');
const pdfjsLib = require('pdfjs-dist');
const crypto = require('crypto');

// 模拟你的 PDF 工具函数
async function extractPDFText(filePath) {
  const data = new Uint8Array(fs.readFileSync(filePath));
  const pdf = await pdfjsLib.getDocument({ data }).promise;

  let fullText = '';

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item) => item.str)
      .join(' ');
    fullText += pageText + '\n';
  }

  return fullText;
}

async function getPDFPageCount(filePath) {
  const data = new Uint8Array(fs.readFileSync(filePath));
  const pdf = await pdfjsLib.getDocument({ data }).promise;
  return pdf.numPages;
}

async function generatePDFHash(filePath) {
  const buffer = fs.readFileSync(filePath);
  const hash = crypto.createHash('sha256');
  hash.update(buffer);
  return hash.digest('hex');
}

// 模拟 AI 审核（简化版）
async function mockAIReview(pdfText, metadata) {
  console.log('\n🤖 AI Review Simulation');
  console.log('='.repeat(80));

  // 检查违法内容的关键词
  const illegalKeywords = [
    '反对共产党', '推翻政府', '暴力革命', '恐怖主义',
    'overthrow', 'terrorism', 'illegal drugs'
  ];

  const textLower = pdfText.toLowerCase();
  let hasIllegalContent = false;
  let rejectionReason = '';

  for (const keyword of illegalKeywords) {
    if (textLower.includes(keyword.toLowerCase())) {
      hasIllegalContent = true;
      rejectionReason = `检测到违法内容关键词: "${keyword}"`;
      break;
    }
  }

  if (hasIllegalContent) {
    console.log('❌ Status: REJECTED');
    console.log(`📋 Reason: ${rejectionReason}`);
    return {
      has_illegal_content: true,
      rejection_reason: rejectionReason,
    };
  }

  // 计算搞笑度分数（基于关键词）
  const funnyKeywords = ['cat', 'butter', 'toast', 'quantum', 'smugness', 'meow'];
  let humorScore = 0;
  funnyKeywords.forEach(keyword => {
    const count = (textLower.match(new RegExp(keyword, 'g')) || []).length;
    humorScore += count * 5;
  });
  humorScore = Math.min(100, humorScore);

  // 模拟其他分数
  const moralityScore = Math.floor(Math.random() * 30) + 70; // 70-100
  const scientificScore = Math.floor(Math.random() * 40) + 40; // 40-80

  console.log('✅ Status: APPROVED');
  console.log(`📊 Morality Score: ${moralityScore}/100`);
  console.log(`😂 Humor Score: ${humorScore}/100`);
  console.log(`🔬 Scientific Score: ${scientificScore}/100`);

  return {
    has_illegal_content: false,
    morality_score: moralityScore,
    humor_score: humorScore,
    scientific_score: scientificScore,
    question: {
      question_text: "What did the cats do in 6% of the trials?",
      options: [
        "Landed on their feet",
        "Walked away mid-air",
        "Ate the toast",
        "Refused to participate"
      ],
      correct_answer: 1
    }
  };
}

// 测试完整流程
async function testSubmissionFlow(pdfPath, metadata) {
  console.log('\n' + '='.repeat(80));
  console.log(`📄 Testing Submission: ${metadata.title}`);
  console.log('='.repeat(80));

  try {
    // 1. 检查页数
    const pageCount = await getPDFPageCount(pdfPath);
    console.log(`\n📊 Page Count: ${pageCount}`);

    if (pageCount > 10) {
      console.log(`❌ REJECTED: Too many pages (${pageCount} > 10)`);
      return;
    }

    // 2. 生成哈希
    const pdfHash = await generatePDFHash(pdfPath);
    console.log(`🔐 PDF Hash: ${pdfHash.substring(0, 16)}...`);

    // 3. 提取文本
    console.log('\n📝 Extracting text...');
    const pdfText = await extractPDFText(pdfPath);
    console.log(`✅ Extracted ${pdfText.length} characters`);
    console.log(`📄 Preview: ${pdfText.substring(0, 150)}...`);

    // 4. AI 审核
    const reviewResult = await mockAIReview(pdfText, metadata);

    // 5. 显示最终结果
    console.log('\n' + '='.repeat(80));
    if (reviewResult.has_illegal_content) {
      console.log('🚫 FINAL STATUS: REJECTED');
      console.log(`📋 Rejection Reason: ${reviewResult.rejection_reason}`);
    } else {
      console.log('✅ FINAL STATUS: APPROVED');
      console.log('📊 Scores:');
      console.log(`   - Morality: ${reviewResult.morality_score}/100`);
      console.log(`   - Humor: ${reviewResult.humor_score}/100`);
      console.log(`   - Scientific: ${reviewResult.scientific_score}/100`);
      console.log('\n❓ Generated Question:');
      console.log(`   Q: ${reviewResult.question.question_text}`);
      reviewResult.question.options.forEach((opt, idx) => {
        const marker = idx === reviewResult.question.correct_answer ? '✓' : ' ';
        console.log(`   ${marker} ${idx}. ${opt}`);
      });
    }
    console.log('='.repeat(80));

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    throw error;
  }
}

// 运行测试
async function runTests() {
  console.log('\n🧪 Holy S.H.I.T PDF Processing Test Suite');
  console.log('='.repeat(80));

  // 测试搞笑论文
  await testSubmissionFlow('./test-funny-paper.pdf', {
    title: 'The Aerodynamic Properties of Cats',
    abstract: 'A study on cat-toast paradox',
    authors: [
      { name: 'Dr. Whiskers McFluffington', affiliation: 'University of Meowbridge' }
    ],
    keywords: ['cats', 'physics', 'humor']
  });

  console.log('\n\n✅ All tests completed!');
}

runTests().catch(console.error);
