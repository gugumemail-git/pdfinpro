import * as pdfjsLib from "pdfjs-dist";

export async function extractTextFromPDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await (pdfjsLib as any).getDocument({ data: arrayBuffer }).promise;
  const totalPages = pdf.numPages;
  
  let fullMarkdown = `# Hasil Ekstraksi: ${file.name}\n\n`;

  for (let i = 1; i <= totalPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    
    // Gabungkan semua teks di halaman tersebut
    const pageText = textContent.items.map((item: any) => item.str).join(" ");
    
    fullMarkdown += `## Halaman ${i}\n\n${pageText}\n\n---\n\n`;
  }

  return fullMarkdown;
}