"use client";

import { useState } from "react";
import AppShell from "@/components/layout/AppShell";
import FileDropzone from "@/components/shared/FileDropzone";
import { resizePDF, PaperSize } from "@/lib/pdf/resize";

export default function ResizePage() {
  const [file, setFile] = useState<File | null>(null);
  const [size, setSize] = useState<PaperSize>("a4");
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFilesSelected = (newFiles: File[]) => {
    const pdf = newFiles.find((f) => f.type === "application/pdf");
    if (!pdf) {
      alert("Hanya file PDF yang didukung.");
      return;
    }
    setFile(pdf);
  };

  const handleResize = async () => {
    if (!file) return;

    setIsProcessing(true);
    try {
      const newBytes = await resizePDF(file, size, orientation);
      const blob = new Blob([newBytes], { type: "application/pdf" });
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `resized_${file.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      alert("Ukuran PDF berhasil diubah dan diunduh!");
      setFile(null);
    } catch (error) {
      console.error(error);
      alert("Gagal mengubah ukuran PDF.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AppShell title="Resize PDF" subtitle="Ubah ukuran halaman ke A4, Letter, A5, dll.">
      <div className="max-w-4xl mx-auto space-y-6">
        
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
          <h1 className="text-xl font-bold mb-2 flex items-center gap-2">
            <i className="fa-solid fa-expand text-brand-600" /> Resize PDF
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Seragamkan ukuran halaman PDF Anda dengan cepat dan mudah.
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
                  <label className="block text-sm font-bold mb-2">Ukuran Kertas Target</label>
                  <select
                    value={size}
                    onChange={(e) => setSize(e.target.value as PaperSize)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm font-bold focus:outline-none focus:border-brand-500"
                  >
                    <option value="a4">A4 (210 × 297 mm)</option>
                    <option value="a3">A3 (297 × 420 mm)</option>
                    <option value="a5">A5 (148 × 210 mm)</option>
                    <option value="letter">Letter (216 × 279 mm)</option>
                    <option value="legal">Legal (216 × 356 mm)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">Orientasi</label>
                  <select
                    value={orientation}
                    onChange={(e) => setOrientation(e.target.value as "portrait" | "landscape")}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm font-bold focus:outline-none focus:border-brand-500"
                  >
                    <option value="portrait">Portrait (Tegak)</option>
                    <option value="landscape">Landscape (Mendatar)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleResize}
                  disabled={isProcessing}
                  className="px-6 py-3 rounded-lg font-bold text-sm bg-brand-600 hover:bg-brand-700 text-white shadow-lg shadow-brand-600/30 disabled:opacity-50 flex items-center gap-2"
                >
                  {isProcessing ? (
                    <><i className="fa-solid fa-spinner fa-spin" /> Memproses...</>
                  ) : (
                    <><i className="fa-solid fa-expand" /> Ubah Ukuran PDF</>
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