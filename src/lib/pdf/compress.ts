import { PDFDocument } from "pdf-lib";

export type CompressLevel = "light" | "balanced" | "strong" | "custom";

// Kita muat pdfjs secara dinamis hanya saat dibutuhkan
export async function compressPDF(file: File, level: CompressLevel, customPercent: number = 50): Promise<Uint8Array> {
  // 1. Tentukan kualitas dan skala
  let scale = 1.5;
  let quality = 0.7;

  if (level === "light") { scale = 1.8; quality = 0.85; }
  else if (level === "balanced") { scale = 1.2; quality = 0.6; }
  else if (level === "strong") { scale = 0.8; quality = 0.35; }
  else if (level === "custom") {
    const factor = customPercent / 100; 
    scale = 1.8 - (factor * 1.0); 
    quality = 0.85 - (factor * 0.5); 
  }

  // 2. Load pdfjs secara dinamis
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const totalPages = pdf.numPages;

  const newPdfDoc = await PDFDocument.create();

  for (let i = 1; i <= totalPages; i++) {
    const page = await pdf.getPage(i);
    const origViewport = page.getViewport({ scale: 1.0 });
    const renderViewport = page.getViewport({ scale });

    // Buat canvas baru untuk setiap halaman
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d", { alpha: false });
    
    if (!context) throw new Error("Gagal membuat canvas context");

    canvas.height = renderViewport.height;
    canvas.width = renderViewport.width;

    // Render halaman ke canvas
    await page.render({ canvasContext: context, viewport: renderViewport }).promise;
    
    // Ambil data gambar dengan kualitas yang ditentukan
    const imgDataUrl = canvas.toDataURL("image/jpeg", quality);
    
    // Konversi ke bytes
    const base64Data = imgDataUrl.split(",")[1];
    const binaryString = window.atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let j = 0; j < binaryString.length; j++) {
      bytes[j] = binaryString.charCodeAt(j);
    }

    // Masukkan gambar ke dokumen pdf-lib
    const embeddedImage = await newPdfDoc.embedJpg(bytes);
    const newPage = newPdfDoc.addPage([origViewport.width, origViewport.height]);
    
    newPage.drawImage(embeddedImage, {
      x: 0, y: 0,
      width: origViewport.width, height: origViewport.height,
    });

    // Hapus canvas dari memori agar tidak crash
    canvas.width = 0;
    canvas.height = 0;
  }

  return await newPdfDoc.save();
}