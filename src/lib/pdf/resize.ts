import { PDFDocument, PageSizes } from "pdf-lib";

export type PaperSize = "a4" | "a3" | "a5" | "letter" | "legal";

export async function resizePDF(
  file: File, 
  size: PaperSize, 
  orientation: "portrait" | "landscape"
): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const pages = pdfDoc.getPages();

  // Tentukan ukuran kertas target dalam points (1 pt = 1/72 inci)
  let targetWidth = PageSizes.A4[0];
  let targetHeight = PageSizes.A4[1];

  switch (size) {
    case "a3": targetWidth = PageSizes.A3[0]; targetHeight = PageSizes.A3[1]; break;
    case "a4": targetWidth = PageSizes.A4[0]; targetHeight = PageSizes.A4[1]; break;
    case "a5": targetWidth = PageSizes.A5[0]; targetHeight = PageSizes.A5[1]; break;
    case "letter": targetWidth = PageSizes.Letter[0]; targetHeight = PageSizes.Letter[1]; break;
    case "legal": targetWidth = PageSizes.Legal[0]; targetHeight = PageSizes.Legal[1]; break;
  }

  if (orientation === "landscape") {
    [targetWidth, targetHeight] = [targetHeight, targetWidth];
  }

  pages.forEach((page) => {
    // 1. Ambil ukuran halaman asli
    const { width: origWidth, height: origHeight } = page.getSize();

    // 2. Hitung skala (mana yang paling kecil antara skala lebar atau tinggi)
    // Ini memastikan seluruh konten muat di kertas baru tanpa terpotong
    const scale = Math.min(targetWidth / origWidth, targetHeight / origHeight);

    // 3. Kecilkan/besarkan isi halaman sesuai skala
    page.scaleContent(scale, scale);

    // 4. Ubah ukuran kertas ke ukuran target
    page.setSize(targetWidth, targetHeight);

    // 5. Opsional: Posisikan konten di tengah kertas
    // Hitung offset untuk menaruh di tengah
    const offsetX = (targetWidth - (origWidth * scale)) / 2;
    const offsetY = (targetHeight - (origHeight * scale)) / 2;
    
    // Pindahkan posisi konten agar ke tengah
    page.translateContent(offsetX, offsetY);
  });

  return await pdfDoc.save();
}