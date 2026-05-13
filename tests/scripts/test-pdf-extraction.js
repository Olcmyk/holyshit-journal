const fs = require('fs');
const pdfjsLib = require('pdfjs-dist');

async function testPDFExtraction(filePath) {
  console.log(`\n📄 Testing PDF: ${filePath}`);
  console.log('='.repeat(80));

  try {
    // Read PDF file
    const data = new Uint8Array(fs.readFileSync(filePath));

    // Load PDF document
    const pdf = await pdfjsLib.getDocument({ data }).promise;
    console.log(`✅ PDF loaded successfully`);
    console.log(`📊 Total pages: ${pdf.numPages}`);

    let fullText = '';

    // Extract text from each page
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item) => item.str)
        .join(' ');
      fullText += pageText + '\n';

      console.log(`\n--- Page ${i} ---`);
      console.log(pageText.substring(0, 200) + '...');
    }

    console.log('\n' + '='.repeat(80));
    console.log(`✅ Extraction complete!`);
    console.log(`📝 Total characters extracted: ${fullText.length}`);
    console.log(`📝 Total words (approx): ${fullText.split(/\s+/).length}`);

    // Check for key content
    console.log('\n🔍 Content Analysis:');
    const keywords = ['cat', 'toast', 'butter', 'physics', 'experiment'];
    keywords.forEach(keyword => {
      const count = (fullText.toLowerCase().match(new RegExp(keyword, 'g')) || []).length;
      console.log(`  - "${keyword}": ${count} occurrences`);
    });

    // Save extracted text to file
    const outputFile = filePath.replace('.pdf', '-extracted.txt');
    fs.writeFileSync(outputFile, fullText);
    console.log(`\n💾 Extracted text saved to: ${outputFile}`);

    return fullText;
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  }
}

// Test the funny research paper
testPDFExtraction('./test-funny-paper.pdf')
  .then(() => {
    console.log('\n✅ All tests passed!');
  })
  .catch(error => {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  });
