import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import * as pdfjs from 'pdfjs-dist';
import mammoth from 'mammoth';

// This is required for pdf.js to work in Next.js.
// It sets up the worker to process PDFs in the background.
if (typeof window !== 'undefined') {
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.mjs',
    import.meta.url,
  ).toString();
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Extracts text from a given file (PDF or DOCX).
 * @param file The file to extract text from.
 * @returns A promise that resolves with the extracted text.
 */
export async function extractTextFromFile(file: File): Promise<string> {
  if (file.type === 'application/pdf') {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument(arrayBuffer).promise;
    let text = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map((item: any) => item.str).join(' ');
    }
    return text;
  } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  } else {
    throw new Error('Unsupported file type. Please upload a PDF or DOCX file.');
  }
}
