import { PDFDocument } from "pdf-lib";

// Fungsi untuk memisah PDF berdasarkan rentang (misal: "1-3, 5")
export async function splitPDF(file: File, rangesStr: string): Promise<{ name: string; bytes: Uint8Array }[]> {
  const arrayBuffer = await file.arrayBuffer();
  const srcDoc = await PDFDocument.load(arrayBuffer);
  const totalPages = srcDoc.getPageCount();
  
  // Pisahkan input berdasarkan koma
  const parts = rangesStr.split(",").map((s) => s.trim()).filter(Boolean);
  const results: { name: string; bytes: Uint8Array }[] = [];

  if (parts.length === 0) {
    // Jika kosong, pisah semua halaman (1 file per halaman)
    for (let i = 0; i < totalPages; i++) {
      const newDoc = await PDFDocument.create();
      const [copiedPage] = await newDoc.copyPages(srcDoc, [i]);
      newDoc.addPage(copiedPage);
      const bytes = await newDoc.save();
      results.push({ name: `halaman_${i + 1}.pdf`, bytes });
    }
    return results;
  }

  // Looping setiap rentang yang diminta
  for (const part of parts) {
    const newDoc = await PDFDocument.create();
    
    if (part.includes("-")) {
      const [startStr, endStr] = part.split("-");
      const start = parseInt(startStr.trim());
      const end = parseInt(endStr.trim());
      
      if (!isNaN(start) && !isNaN(end) && start <= end) {
        const validStart = Math.max(1, start);
        const validEnd = Math.min(totalPages, end);
        const indices = [];
        for (let i = validStart; i <= validEnd; i++) indices.push(i - 1);
        
        if (indices.length > 0) {
          const copiedPages = await newDoc.copyPages(srcDoc, indices);
          copiedPages.forEach((p) => newDoc.addPage(p));
          const bytes = await newDoc.save();
          results.push({ name: `halaman_${validStart}-${validEnd}.pdf`, bytes });
        }
      }
    } else {
      const pageNum = parseInt(part);
      if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
        const [copiedPage] = await newDoc.copyPages(srcDoc, [pageNum - 1]);
        newDoc.addPage(copiedPage);
        const bytes = await newDoc.save();
        results.push({ name: `halaman_${pageNum}.pdf`, bytes });
      }
    }
  }

  return results;
}