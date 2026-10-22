import { PDFDocument, degrees } from "pdf-lib";

export async function rotatePDF(file: File, rotations: Record<number, number>): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const pages = pdfDoc.getPages();

  pages.forEach((page, index) => {
    const angle = rotations[index];
    if (angle) {
      const currentRotation = page.getRotation().angle;
      // Pastikan hasil rotasi berada di rentang 0-360
      let newRotation = (currentRotation + angle) % 360;
      if (newRotation < 0) newRotation += 360;
      
      page.setRotation(degrees(newRotation));
    }
  });

  return await pdfDoc.save();
}