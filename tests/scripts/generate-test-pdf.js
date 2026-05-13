const fs = require('fs');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');

async function createFunnyResearchPDF() {
  const pdfDoc = await PDFDocument.create();

  // Embed fonts
  const timesRoman = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const timesRomanBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  const timesRomanItalic = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);

  // Page 1
  let page = pdfDoc.addPage([595, 842]); // A4 size
  let { width, height } = page.getSize();
  let y = height - 100;

  // Title
  page.drawText('The Aerodynamic Properties of Cats:', {
    x: 50,
    y: y,
    size: 18,
    font: timesRomanBold,
  });
  y -= 25;
  page.drawText('Why They Always Land Butter-Side Down', {
    x: 50,
    y: y,
    size: 18,
    font: timesRomanBold,
  });

  y -= 40;
  // Authors
  page.drawText('Dr. Whiskers McFluffington, Prof. Mittens von Paws, Dr. Tabby Einstein', {
    x: 50,
    y: y,
    size: 11,
    font: timesRomanItalic,
  });

  y -= 20;
  page.drawText('Institute of Feline Physics, University of Meowbridge', {
    x: 50,
    y: y,
    size: 10,
    font: timesRomanItalic,
  });

  y -= 40;
  // Abstract
  page.drawText('Abstract', {
    x: 50,
    y: y,
    size: 12,
    font: timesRomanBold,
  });

  y -= 20;
  const abstractText = 'This groundbreaking study investigates the long-standing mystery of why cats, when dropped with buttered toast strapped to their backs, create a perpetual motion machine. Through rigorous experimentation involving 47 cats, 312 slices of toast, and 5 kilograms of premium butter, we demonstrate that the cat-toast paradox can be explained by the previously unknown "Murphy\'s Law of Feline Gravitation." Our findings suggest that cats possess an innate ability to manipulate spacetime curvature, ensuring they land on their feet while simultaneously ensuring toast lands butter-side down.';

  const lines = wrapText(abstractText, 80);
  for (const line of lines) {
    page.drawText(line, {
      x: 50,
      y: y,
      size: 10,
      font: timesRoman,
    });
    y -= 15;
  }

  y -= 20;
  // Keywords
  page.drawText('Keywords: feline aerodynamics, butter physics, perpetual motion, Murphy\'s Law', {
    x: 50,
    y: y,
    size: 10,
    font: timesRomanItalic,
  });

  y -= 30;
  // Introduction
  page.drawText('1. Introduction', {
    x: 50,
    y: y,
    size: 12,
    font: timesRomanBold,
  });

  y -= 20;
  const introText = 'For centuries, humanity has observed two fundamental laws of nature: (1) cats always land on their feet, and (2) buttered toast always lands butter-side down. However, the question of what happens when these two immutable forces meet has plagued scientists since the invention of both cats and toast (circa 3000 BCE and 1928, respectively). Previous attempts to study this phenomenon have been hampered by the cats\' refusal to participate in experiments, their tendency to knock equipment off tables, and their insistence on napping during critical data collection periods.';

  const introLines = wrapText(introText, 80);
  for (const line of introLines) {
    if (y < 50) {
      page = pdfDoc.addPage([595, 842]);
      y = height - 50;
    }
    page.drawText(line, {
      x: 50,
      y: y,
      size: 10,
      font: timesRoman,
    });
    y -= 15;
  }

  // Page 2
  page = pdfDoc.addPage([595, 842]);
  y = height - 50;

  // Methodology
  page.drawText('2. Methodology', {
    x: 50,
    y: y,
    size: 12,
    font: timesRomanBold,
  });

  y -= 20;
  const methodText = 'We recruited 47 cats of varying breeds, weights, and levels of grumpiness. Each cat was carefully strapped to a slice of buttered toast (butter-side up) using hypoallergenic Velcro. The cat-toast assemblies were then dropped from heights ranging from 1 meter to 10 meters in a controlled laboratory environment. High-speed cameras (10,000 fps) captured the descent, while accelerometers measured the rotational dynamics. Control variables: butter temperature (22°C), toast crispiness (medium-well), cat mood (indifferent to hostile), and gravitational constant (9.81 m/s²).';

  const methodLines = wrapText(methodText, 80);
  for (const line of methodLines) {
    page.drawText(line, {
      x: 50,
      y: y,
      size: 10,
      font: timesRoman,
    });
    y -= 15;
  }

  y -= 30;
  // Results
  page.drawText('3. Results', {
    x: 50,
    y: y,
    size: 12,
    font: timesRomanBold,
  });

  y -= 20;
  const resultsText = 'Our experiments yielded surprising results. In 94% of trials, the cat-toast assembly entered a hovering state approximately 30cm above the ground, rotating at 3.7 revolutions per second. The remaining 6% of trials resulted in the cats simply walking away mid-air, suggesting they had mastered levitation through sheer disdain for physics. Energy measurements indicated that the hovering cat-toast systems generated 47 watts of power, primarily in the form of annoyed meowing and butter splatter. Statistical analysis (p < 0.001) confirmed that the effect was real and not simply a result of the cats being uncooperative.';

  const resultsLines = wrapText(resultsText, 80);
  for (const line of resultsLines) {
    page.drawText(line, {
      x: 50,
      y: y,
      size: 10,
      font: timesRoman,
    });
    y -= 15;
  }

  y -= 30;
  // Discussion
  page.drawText('4. Discussion', {
    x: 50,
    y: y,
    size: 12,
    font: timesRomanBold,
  });

  y -= 20;
  const discussionText = 'Our findings suggest that cats possess a previously unknown quantum property we term "Schrödinger\'s Smugness," which allows them to exist in a superposition of states: simultaneously falling and not falling, caring and not caring. This property interacts with the butter\'s molecular structure to create a localized spacetime distortion. The implications are staggering. If we can harness this cat-toast energy, we could solve the global energy crisis.';

  const discussionLines = wrapText(discussionText, 80);
  for (const line of discussionLines) {
    page.drawText(line, {
      x: 50,
      y: y,
      size: 10,
      font: timesRoman,
    });
    y -= 15;
  }

  y -= 30;
  // Conclusion
  page.drawText('5. Conclusion', {
    x: 50,
    y: y,
    size: 12,
    font: timesRomanBold,
  });

  y -= 20;
  const conclusionText = 'This study definitively proves that cats are, in fact, liquid but also possess solid-state properties when convenient. The cat-toast paradox represents a new frontier in physics, one that conventional science has been too afraid to explore, primarily because cats are involved. Future research will investigate whether the effect scales with cat size and whether margarine produces similar results (spoiler: it doesn\'t, cats have standards).';

  const conclusionLines = wrapText(conclusionText, 80);
  for (const line of conclusionLines) {
    page.drawText(line, {
      x: 50,
      y: y,
      size: 10,
      font: timesRoman,
    });
    y -= 15;
  }

  // Save PDF
  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync('test-funny-paper.pdf', pdfBytes);
  console.log('✅ Created: test-funny-paper.pdf');
}

function wrapText(text, maxChars) {
  const words = text.split(' ');
  const lines = [];
  let currentLine = '';

  for (const word of words) {
    if ((currentLine + word).length <= maxChars) {
      currentLine += (currentLine ? ' ' : '') + word;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);

  return lines;
}

createFunnyResearchPDF().catch(console.error);
