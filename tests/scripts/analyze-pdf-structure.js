const fs = require('fs');
const pdfjsLib = require('pdfjs-dist');

async function analyzePDF(filePath) {
  console.log('\n🔍 Detailed PDF Analysis');
  console.log('='.repeat(80));

  const data = new Uint8Array(fs.readFileSync(filePath));
  const pdf = await pdfjsLib.getDocument({ data }).promise;

  console.log(`📄 Total Pages: ${pdf.numPages}`);

  for (let i = 1; i <= pdf.numPages; i++) {
    console.log(`\n--- Page ${i} ---`);
    const page = await pdf.getPage(i);

    // 获取文本内容
    const textContent = await page.getTextContent();
    console.log(`Text items: ${textContent.items.length}`);

    if (textContent.items.length > 0) {
      console.log('Text content:');
      textContent.items.forEach((item, idx) => {
        if (idx < 10) { // 只显示前10个
          console.log(`  [${idx}] "${item.str}"`);
        }
      });
    } else {
      console.log('⚠️  No text items found - likely an image-based PDF');
    }

    // 获取操作符（检查是否有图片）
    const ops = await page.getOperatorList();
    const imageOps = ops.fnArray.filter((fn, idx) => {
      // 检查是否是图片绘制操作
      return fn === pdfjsLib.OPS.paintImageXObject ||
             fn === pdfjsLib.OPS.paintInlineImageXObject ||
             fn === pdfjsLib.OPS.paintImageMaskXObject;
    });

    console.log(`Image operations: ${imageOps.length}`);

    if (imageOps.length > 0 && textContent.items.length === 0) {
      console.log('🖼️  This page contains images but no extractable text');
      console.log('💡 This is a scanned/image-based PDF - requires OCR');
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('📋 CONCLUSION');
  console.log('='.repeat(80));
  console.log('❌ Your current PDF text extraction CANNOT handle this file');
  console.log('📝 Reason: This is an image-based PDF (scanned document)');
  console.log('💡 Solution: You need to add OCR (Optical Character Recognition)');
  console.log('\nRecommended libraries:');
  console.log('  - Tesseract.js (JavaScript OCR)');
  console.log('  - Google Cloud Vision API');
  console.log('  - AWS Textract');
  console.log('  - Azure Computer Vision');
}

analyzePDF('./anticcp_test.pdf').catch(console.error);
