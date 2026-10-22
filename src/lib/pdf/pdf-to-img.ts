import * as pdfjsLib from "pdfjs-dist";

// Gunakan worker dari folder public agar tidak diblokir CORS
if (typeof window !== "undefined") {
  (pdfjsLib as any).GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;
}

export async function convertPDFToImages(
  file: File, 
  format: "jpeg" | "png", 
  scale: number
): Promise<{ name: string; dataUrl: string }[]> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await (pdfjsLib as any).getDocument({ data: arrayBuffer }).promise;
  const totalPages = pdf.numPages;
  const results: { name: string; dataUrl: string }[] = [];

  for (let i = 1; i <= totalPages; i++) {
    const page = await pdf.getPage(i);
    const safeScale = Math.min(scale, 2.0); 
    const viewport = page.getViewport({ scale: safeScale });

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    if (context) {
      if (format === "jpeg") {
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, canvas.width, canvas.height);
      }

      await (page as any).render({ canvasContext: context, viewport: viewport as any }).promise;
      
      const mimeType = format === "png" ? "image/png" : "image/jpeg";
      const dataUrl = canvas.toDataURL(mimeType, 0.9);
      
      results.push({
        name: `halaman_${i}.${format === "png" ? "png" : "jpg"}`,
        dataUrl: dataUrl,
      });

      canvas.width = 0;
      canvas.height = 0;
    }
  }

  return results;
}