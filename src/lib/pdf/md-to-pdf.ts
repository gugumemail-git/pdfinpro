import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export async function convertMarkdownToPDF(markdown: string): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  let page = pdfDoc.addPage([595, 842]); // Ukuran A4
  const { width, height } = page.getSize();
  
  let y = height - 50; // Margin atas
  const margin = 50;
  const maxWidth = width - (margin * 2);

  // Pecah markdown menjadi baris per baris
  const lines = markdown.split("\n");

  for (let line of lines) {
    let fontSize = 11;
    let useFont = font;
    let textToDraw = line;

    // Deteksi format Markdown (Heading, Bold, Bullet)
    if (line.startsWith("# ")) {
      fontSize = 24; useFont = boldFont; textToDraw = line.replace("# ", "");
    } else if (line.startsWith("## ")) {
      fontSize = 18; useFont = boldFont; textToDraw = line.replace("## ", "");
    } else if (line.startsWith("### ")) {
      fontSize = 14; useFont = boldFont; textToDraw = line.replace("### ", "");
    } else if (line.startsWith("- ")) {
      textToDraw = "• " + line.replace("- ", "");
    } else if (line.trim() === "") {
      y -= 15; // Spasi antar paragraf
      continue;
    }

    // Hapus format bold ganda (misal: **teks**)
    textToDraw = textToDraw.replace(/\*\*(.*?)\*\*/g, "$1");

    // Fungsi untuk membungkus teks jika terlalu panjang (Word Wrap)
    const words = textToDraw.split(" ");
    let currentLine = "";

    for (const word of words) {
      const testLine = currentLine + word + " ";
      const textWidth = useFont.widthOfTextAtSize(testLine, fontSize);

      if (textWidth > maxWidth && currentLine !== "") {
        // Gambar baris saat ini
        page.drawText(currentLine, { x: margin, y, size: fontSize, font: useFont, color: rgb(0.1, 0.1, 0.1) });
        y -= fontSize + 6; // Turun ke baris berikutnya
        
        // Jika halaman penuh, buat halaman baru
        if (y < margin) {
          page = pdfDoc.addPage([595, 842]);
          y = height - 50;
        }
        currentLine = word + " ";
      } else {
        currentLine = testLine;
      }
    }

    // Gambar sisa teks di baris terakhir
    if (currentLine.trim() !== "") {
      page.drawText(currentLine, { x: margin, y, size: fontSize, font: useFont, color: rgb(0.1, 0.1, 0.1) });
      y -= fontSize + 6;
    }
  }

  return await pdfDoc.save();
}