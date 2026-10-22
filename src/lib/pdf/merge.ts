import { PDFDocument } from "pdf-lib";

export async function mergePDFs(files: File[]): Promise<Uint8Array> {
  // Buat dokumen PDF baru yang kosong
  const mergedPdf = await PDFDocument.create();

  for (const file of files) {
    // Baca file sebagai ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    
    // Muat PDF
    const pdf = await PDFDocument.load(arrayBuffer);
    
    // Salin semua halaman dari PDF sumber
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    
    // Tambahkan ke dokumen baru
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }

  // Simpan dan kembalikan sebagai Uint8Array
  return await mergedPdf.save();
}