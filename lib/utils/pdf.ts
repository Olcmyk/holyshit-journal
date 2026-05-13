import CryptoJS from 'crypto-js';
import Tesseract from 'tesseract.js';

// Use different PDF.js builds for client vs server
let pdfjsLib: any;

if (typeof window !== 'undefined') {
  // Client-side: use standard build with worker
  pdfjsLib = require('pdfjs-dist');
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf-worker/pdf.worker.min.mjs';
} else {
  // Server-side: use legacy build (no worker needed, works in Node.js)
  pdfjsLib = require('pdfjs-dist/legacy/build/pdf.mjs');
}

/**
 * Get PDF page count
 */
export async function getPDFPageCount(file: File): Promise<number> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  return pdf.numPages;
}

/**
 * Generate SHA-256 hash of PDF file
 */
export async function generatePDFHash(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const wordArray = CryptoJS.lib.WordArray.create(arrayBuffer as any);
  const hash = CryptoJS.SHA256(wordArray);
  return hash.toString(CryptoJS.enc.Hex);
}

/**
 * Validate PDF file size (must be < 5MB)
 */
export function validatePDFSize(file: File): boolean {
  const maxSize = 5 * 1024 * 1024; // 5MB in bytes
  return file.size <= maxSize;
}

/**
 * Validate PDF file type
 */
export function validatePDFType(file: File): boolean {
  return file.type === 'application/pdf';
}

/**
 * Extract text from PDF (for AI review)
 */
export async function extractPDFText(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  let fullText = '';

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: any) => item.str)
      .join(' ');
    fullText += pageText + '\n';
  }

  return fullText;
}

/**
 * Render PDF page to canvas for OCR
 */
export async function renderPDFPageToImage(file: File, pageNumber: number): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const page = await pdf.getPage(pageNumber);

  const viewport = page.getViewport({ scale: 2.0 }); // Higher scale for better OCR
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('Failed to get canvas context');
  }

  canvas.height = viewport.height;
  canvas.width = viewport.width;

  await page.render({
    canvasContext: context,
    viewport: viewport,
  }).promise;

  return canvas.toDataURL('image/png');
}

/**
 * Extract text from PDF using OCR (for image-based PDFs)
 */
export async function extractPDFTextWithOCR(
  file: File,
  onProgress?: (progress: number) => void
): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const totalPages = pdf.numPages;

  let ocrText = '';

  for (let i = 1; i <= totalPages; i++) {
    // Render page to image
    const imageData = await renderPDFPageToImage(file, i);

    // Perform OCR
    const result = await Tesseract.recognize(imageData, 'chi_sim+eng', {
      logger: (m) => {
        if (m.status === 'recognizing text' && onProgress) {
          const pageProgress = ((i - 1) / totalPages) + (m.progress / totalPages);
          onProgress(pageProgress * 100);
        }
      },
    });

    ocrText += result.data.text + '\n';
  }

  return ocrText;
}

/**
 * Extract text from PDF using both direct extraction and OCR
 * This ensures we capture text from both text-based and image-based PDFs
 */
export async function extractPDFTextCombined(
  file: File,
  onProgress?: (progress: number) => void
): Promise<{ directText: string; ocrText: string; combinedText: string }> {
  // Extract direct text
  const directText = await extractPDFText(file);

  // If direct text is too short (< 100 chars), likely an image-based PDF
  const needsOCR = directText.trim().length < 100;

  let ocrText = '';
  if (needsOCR) {
    ocrText = await extractPDFTextWithOCR(file, onProgress);
  }

  const combinedText = directText + '\n' + ocrText;

  return {
    directText,
    ocrText,
    combinedText: combinedText.trim(),
  };
}
