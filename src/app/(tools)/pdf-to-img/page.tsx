"use client";

import { useState } from "react";
import AppShell from "@/components/layout/AppShell";
import FileDropzone from "@/components/shared/FileDropzone";
import { convertPDFToImages } from "@/lib/pdf/pdf-to-img";
import JSZip from "jszip";

export default function PdfToImgPage() {
  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState<"jpeg" | "png">("jpeg");
  const [quality, setQuality] = useState<number>(1.2);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFilesSelected = (newFiles: File[]) => {
    const pdf = newFiles.find((f) => f.type === "application/pdf");
    if (!pdf) {
      alert("Hanya file PDF yang didukung.");
      return;
    }
    setFile(pdf);
  };

  const handleConvert = async () => {
    if (!file) return;

    setIsProcessing(true);
    try {
      const images = await convertPDFToImages(file, format, quality);
      
      if (images.length === 0) {
        throw new Error("Tidak ada gambar yang dihasilkan.");
      }

      // Jika hanya 1 halaman, unduh langsung sebagai gambar
      if (images.length === 1) {
        const link = document.createElement("a");
        link.href = images[0].dataUrl;
        link.download = images[0].name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // Jika lebih dari 1, bungkus jadi ZIP
        const zip = new JSZip();
        images.forEach((img) => {
          const base64Data = img.dataUrl.split(",")[1];
          zip.file(img.name, base64Data, { base64: true });
        });
        const zipBlob = await zip.generateAsync({ type: "blob" });
        
        const url = URL.createObjectURL(zipBlob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `gambar_dari_${file.name.replace(".pdf", "")}.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }

      alert(`Berhasil mengekstrak ${images.length} gambar!`);
      setFile(null);
    } catch (error) {
      console.error(error);
      alert("Gagal mengonversi PDF ke Gambar.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AppShell title="PDF ke Gambar" subtitle="Ekspor tiap halaman jadi PNG atau JPEG.">
      <div className="max-w-4xl mx-auto space-y-6">
        
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
          <h1 className="text-xl font-bold mb-2 flex items-center gap-2">
            <i className="fa-solid fa-camera-retro text-brand-600" /> PDF ke Gambar
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Ubah setiap halaman PDF menjadi file gambar. Hasil lebih dari 1 file akan diunduh sebagai .zip
          </p>
        </div>

        {!file ? (
          <FileDropzone onFilesSelected={handleFilesSelected} multiple={false} />
        ) : (
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-6">
              
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-md bg-brand-100 text-brand-700 flex items-center justify-center text-lg">
                    <i className="fa-solid fa-file-pdf" />
                  </span>
                  <div>
                    <p className="text-sm font-bold">{file.name}</p>
                    <p className="text-[11px] text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <button onClick={() => setFile(null)} className="text-xs font-bold text-rose-600 hover:underline">
                  Batal
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-2">Format Output</label>
                  <select
                    value={format}
                    onChange={(e) => setFormat(e.target.value as "jpeg" | "png")}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm font-bold focus:outline-none focus:border-brand-500"
                  >
                    <option value="jpeg">JPG (Lebih kecil)</option>
                    <option value="png">PNG (Kualitas tinggi)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">Resolusi (Kualitas)</label>
                  <select
                    value={quality}
                    onChange={(e) => setQuality(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm font-bold focus:outline-none focus:border-brand-500"
                  >
                    <option value={0.8}>Standar (72 DPI)</option>
                    <option value={1.2}>Tinggi (150 DPI)</option>
                    <option value={1.8}>Sangat Tinggi (300 DPI)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleConvert}
                  disabled={isProcessing}
                  className="px-6 py-3 rounded-lg font-bold text-sm bg-brand-600 hover:bg-brand-700 text-white shadow-lg shadow-brand-600/30 disabled:opacity-50 flex items-center gap-2"
                >
                  {isProcessing ? (
                    <><i className="fa-solid fa-spinner fa-spin" /> Mengekstrak...</>
                  ) : (
                    <><i className="fa-solid fa-bolt" /> Ekspor ke Gambar</>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}