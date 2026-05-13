// Server-side PDF utilities using legacy build (no worker needed)
import CryptoJS from 'crypto-js';

// Use legacy build for Node.js environment
const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.mjs');

/**
 * Get PDF page count (server-side)
 */
export async function getPDFPageCount(file: File): Promise<number> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  return pdf.numPages;
}

/**
 * Generate SHA-256 hash of PDF file (server-side)
 */
export async function generatePDFHash(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const wordArray = CryptoJS.lib.WordArray.create(arrayBuffer as any);
  const hash = CryptoJS.SHA256(wordArray);
  return hash.toString(CryptoJS.enc.Hex);
}
