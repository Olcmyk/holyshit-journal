const fs = require('fs');
const pdfjsLib = require('pdfjs-dist');
const crypto = require('crypto');

// 提取 PDF 文本
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

// 模拟你的 AI 审核逻辑
async function testContentModeration(pdfText) {
  console.log('\n🤖 Content Moderation Test');
  console.log('='.repeat(80));

  // 检测违规关键词（模拟你的 AI 审核）
  const sensitiveKeywords = [
    // 政治敏感
    '反对共产党', '推翻政府', '反共', '反党',
    '习近平', '共产党', '中共',
    // 暴力/违法
    '暴力革命', '恐怖主义', '暴力', '推翻',
    // 英文
    'anti-communist', 'overthrow', 'ccp', 'xi jinping'
  ];

  const detectedKeywords = [];
  const textLower = pdfText.toLowerCase();

  for (const keyword of sensitiveKeywords) {
    const regex = new RegExp(keyword.toLowerCase(), 'gi');
    const matches = pdfText.match(regex);
    if (matches) {
      detectedKeywords.push({
        keyword: keyword,
        count: matches.length
      });
    }
  }

  console.log(`📝 Total text length: ${pdfText.length} characters`);
  console.log(`📄 Text preview (first 500 chars):`);
  console.log('-'.repeat(80));
  console.log(pdfText.substring(0, 500));
  console.log('-'.repeat(80));

  if (detectedKeywords.length > 0) {
    console.log('\n❌ VIOLATION DETECTED!');
    console.log('🚨 Sensitive keywords found:');
    detectedKeywords.forEach(item => {
      console.log(`   - "${item.keyword}": ${item.count} occurrence(s)`);
    });

    return {
      has_illegal_content: true,
      rejection_reason: `检测到敏感内容: ${detectedKeywords.map(k => k.keyword).join(', ')}`,
      detected_keywords: detectedKeywords
    };
  } else {
    console.log('\n✅ No violations detected');
    return {
      has_illegal_content: false
    };
  }
}

// 测试流程
async function testAntiCCPFile() {
  console.log('\n' + '='.repeat(80));
  console.log('🧪 Testing: anticcp_test.pdf');
  console.log('='.repeat(80));

  try {
    // 1. 检查页数
    const pageCount = await getPDFPageCount('./anticcp_test.pdf');
    console.log(`\n📊 Page Count: ${pageCount}`);

    if (pageCount > 10) {
      console.log(`❌ REJECTED: Too many pages (${pageCount} > 10)`);
      return;
    }

    // 2. 提取文本
    console.log('\n📝 Extracting text from PDF...');
    const pdfText = await extractPDFText('./anticcp_test.pdf');
    console.log(`✅ Extracted ${pdfText.length} characters`);

    // 3. 内容审核
    const moderationResult = await testContentModeration(pdfText);

    // 4. 最终结果
    console.log('\n' + '='.repeat(80));
    console.log('📋 FINAL RESULT');
    console.log('='.repeat(80));

    if (moderationResult.has_illegal_content) {
      console.log('🚫 STATUS: REJECTED');
      console.log(`📝 Reason: ${moderationResult.rejection_reason}`);
      console.log('\n✅ Your AI moderation system SHOULD reject this submission.');
    } else {
      console.log('✅ STATUS: APPROVED');
      console.log('\n⚠️  WARNING: Your AI moderation system might NOT catch this content!');
    }
    console.log('='.repeat(80));

    // 保存提取的文本用于检查
    fs.writeFileSync('./anticcp_test-extracted.txt', pdfText);
    console.log('\n💾 Extracted text saved to: anticcp_test-extracted.txt');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
  }
}

testAntiCCPFile().catch(console.error);
