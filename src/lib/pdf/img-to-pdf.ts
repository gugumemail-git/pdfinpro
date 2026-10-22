import { PDFDocument } from "pdf-lib";

export async function convertImagesToPDF(files: File[]): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();

  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer();
    let image;

    // Cek tipe file, lalu masukkan ke PDF
    if (file.type === "image/jpeg" || file.type === "image/jpg") {
      image = await pdfDoc.embedJpg(arrayBuffer);
    } else if (file.type === "image/png") {
      image = await pdfDoc.embedPng(arrayBuffer);
    } else {
      // Jika format tidak didukung (misal WebP), kita lewati atau kita beri peringatan
      console.warn(`Format ${file.type} tidak didukung, melewati ${file.name}`);
      continue; 
    }

    // Buat halaman PDF baru dengan ukuran persis sama dengan gambar
    const page = pdfDoc.addPage([image.width, image.height]);
    
    // Gambar memenuhi halaman
    page.drawImage(image, {
      x: 0,
      y: 0,
      width: image.width,
      height: image.height,
    });
  }

  return await pdfDoc.save();
}