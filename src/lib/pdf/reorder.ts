import { PDFDocument } from "pdf-lib";

// Fungsi ini menerima urutan indeks halaman baru, lalu menyusunnya jadi PDF
export async function reorderPDF(file: File, newOrder: number[]): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const srcDoc = await PDFDocument.load(arrayBuffer);
  
  // Buat dokumen baru
  const newDoc = await PDFDocument.create();

  // Salin halaman sesuai urutan array yang baru
  const copiedPages = await newDoc.copyPages(srcDoc, newOrder);
  
  copiedPages.forEach((page) => {
    newDoc.addPage(page);
  });

  return await newDoc.save();
}