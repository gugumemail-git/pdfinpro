"use client";

import { useState } from "react";
import AppShell from "@/components/layout/AppShell";
import FileDropzone from "@/components/shared/FileDropzone";
import { rotatePDF } from "@/lib/pdf/rotate";
import * as pdfjsLib from "pdfjs-dist";

// Setup worker pdf.js
if (typeof window !== "undefined") {
  (pdfjsLib as any).GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

interface PageItem {
  index: number;
  dataUrl: string;
  rotation: number;
}

export default function RotatePage() {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<PageItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFilesSelected = async (newFiles: File[]) => {
    const pdf = newFiles.find((f) => f.type === "application/pdf");
    if (!pdf) {
      alert("Hanya file PDF yang didukung.");
      return;
    }
    setFile(pdf);
    loadPdf(pdf);
  };

  const loadPdf = async (pdfFile: File) => {
    setIsLoading(true);
    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      
      // Gunakan as any untuk menghindari error tipe data pdfjs-dist
      const pdf = await (pdfjsLib as any).getDocument({ data: arrayBuffer }).promise;
      const totalPages = pdf.numPages;
      const loadedPages: PageItem[] = [];

      for (let i = 1; i <= totalPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 0.4 });
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        if (context) {
          // Gunakan as any untuk render
          await (page as any).render({ canvasContext: context, viewport: viewport as any }).promise;
          
          loadedPages.push({
            index: i - 1,
            dataUrl: canvas.toDataURL("image/jpeg", 0.8),
            rotation: 0,
          });
        }
      }
      setPages(loadedPages);
    } catch (error) {
      console.error(error);
      alert("Gagal memuat pratinjau PDF.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRotate = (index: number, deg: number) => {
    setPages((prev) =>
      prev.map((p) =>
        p.index === index ? { ...p, rotation: (p.rotation + deg) % 360 } : p
      )
    );
  };

  const handleRotateAll = (deg: number) => {
    setPages((prev) =>
      prev.map((p) => ({ ...p, rotation: (p.rotation + deg) % 360 }))
    );
  };

  const executeRotate = async () => {
    if (!file) return;

    setIsProcessing(true);
    try {
      const rotations: Record<number, number> = {};
      pages.forEach((p) => {
        if (p.rotation !== 0) rotations[p.index] = p.rotation;
      });

      const newBytes = await rotatePDF(file, rotations);
      const blob = new Blob([newBytes], { type: "application/pdf" });
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `rotated_${file.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      alert("PDF berhasil diputar dan diunduh!");
      setFile(null);
      setPages([]);
    } catch (error) {
      console.error(error);
      alert("Gagal memutar PDF.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AppShell title="Putar PDF" subtitle="Rotasi halaman 90°, 180°, atau 270°.">
      <div className="max-w-5xl mx-auto space-y-6">
        
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
          <h1 className="text-xl font-bold mb-2 flex items-center gap-2">
            <i className="fa-solid fa-rotate-right text-brand-600" /> Putar PDF
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Klik tombol rotasi di tiap halaman, atau gunakan tombol "Putar Semua".
          </p>
        </div>

        {!file ? (
          <FileDropzone onFilesSelected={handleFilesSelected} multiple={false} />
        ) : (
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleRotateAll(-90)}
                  className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold flex items-center gap-2 transition"
                >
                  <i className="fa-solid fa-rotate-left text-brand-600" /> Putar Semua -90°
                </button>
                <button
                  onClick={() => handleRotateAll(90)}
                  className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold flex items-center gap-2 transition"
                >
                  <i className="fa-solid fa-rotate-right text-brand-600" /> Putar Semua +90°
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setFile(null); setPages([]); }}
                  className="px-4 py-2 text-rose-600 hover:underline text-xs font-bold"
                >
                  Batal
                </button>
                <button
                  onClick={executeRotate}
                  disabled={isProcessing || isLoading}
                  className="px-6 py-2.5 rounded-lg font-bold text-sm bg-brand-600 hover:bg-brand-700 text-white shadow-lg shadow-brand-600/30 disabled:opacity-50 flex items-center gap-2"
                >
                  {isProcessing ? (
                    <><i className="fa-solid fa-spinner fa-spin" /> Memproses...</>
                  ) : (
                    <><i className="fa-solid fa-download" /> Simpan & Unduh PDF</>
                  )}
                </button>
              </div>
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                <i className="fa-solid fa-spinner fa-spin text-4xl text-brand-600 mb-4" />
                <p className="text-sm font-bold text-slate-600 dark:text-slate-400">Memuat pratinjau halaman...</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {pages.map((page) => (
                  <div key={page.index} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-sm group">
                    <div className="relative aspect-[3/4] bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden flex items-center justify-center mb-3">
                      <span className="absolute top-2 left-2 bg-brand-600 text-white text-[10px] font-bold px-2 py-0.5 rounded z-10">
                        Hal {page.index + 1}
                      </span>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={page.dataUrl}
                        alt={`Halaman ${page.index + 1}`}
                        className="max-w-full max-h-full object-contain transition-transform duration-300"
                        style={{ transform: `rotate(${page.rotation}deg)` }}
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleRotate(page.index, -90)}
                        className="flex-1 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-brand-100 dark:hover:bg-brand-900/30 text-slate-600 dark:text-slate-400 rounded-lg text-xs transition"
                        title="Putar Kiri"
                      >
                        <i className="fa-solid fa-rotate-left" />
                      </button>
                      <button
                        onClick={() => handleRotate(page.index, 90)}
                        className="flex-1 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-brand-100 dark:hover:bg-brand-900/30 text-slate-600 dark:text-slate-400 rounded-lg text-xs transition"
                        title="Putar Kanan"
                      >
                        <i className="fa-solid fa-rotate-right" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}