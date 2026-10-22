"use client";

import { useState } from "react";
import AppShell from "@/components/layout/AppShell";
import FileDropzone from "@/components/shared/FileDropzone";
import { extractTextFromPDF } from "@/lib/pdf/extract";
import * as pdfjsLib from "pdfjs-dist";

// Setup worker pdf.js
if (typeof window !== "undefined") {
  (pdfjsLib as any).GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

export default function PdfToMdPage() {
  const [file, setFile] = useState<File | null>(null);
  const [markdown, setMarkdown] = useState<string>("");
  const [isExtracting, setIsExtracting] = useState(false);

  const handleFilesSelected = async (newFiles: File[]) => {
    const pdf = newFiles.find((f) => f.type === "application/pdf");
    if (!pdf) {
      alert("Hanya file PDF yang didukung.");
      return;
    }
    setFile(pdf);
    setIsExtracting(true);
    setMarkdown("");

    try {
      const result = await extractTextFromPDF(pdf);
      setMarkdown(result);
    } catch (error) {
      console.error(error);
      alert("Gagal mengekstrak teks dari PDF.");
      setFile(null);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleDownloadMd = () => {
    if (!markdown || !file) return;
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${file.name.replace(".pdf", "")}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <AppShell title="PDF ke Markdown" subtitle="Ekstrak teks dari PDF ke format Markdown.">
      <div className="max-w-5xl mx-auto space-y-6">
        
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
          <h1 className="text-xl font-bold mb-2 flex items-center gap-2">
            <i className="fa-solid fa-file-code text-brand-600" /> PDF ke Markdown
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Ekstrak seluruh teks dari PDF dan format secara otomatis menjadi Markdown.
          </p>
        </div>

        {!file ? (
          <FileDropzone onFilesSelected={handleFilesSelected} multiple={false} />
        ) : (
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-md bg-brand-100 text-brand-700 flex items-center justify-center text-lg">
                  <i className="fa-solid fa-file-pdf" />
                </span>
                <div>
                  <p className="text-sm font-bold">{file.name}</p>
                  <p className="text-[11px] text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setFile(null); setMarkdown(""); }}
                  className="px-4 py-2 text-rose-600 hover:underline text-xs font-bold"
                >
                  Batal
                </button>
                <button
                  onClick={handleDownloadMd}
                  disabled={isExtracting || !markdown}
                  className="px-6 py-2.5 rounded-lg font-bold text-sm bg-brand-600 hover:bg-brand-700 text-white shadow-lg shadow-brand-600/30 disabled:opacity-50 flex items-center gap-2"
                >
                  <i className="fa-solid fa-download" /> Unduh File .md
                </button>
              </div>
            </div>

            {/* Area Hasil Ekstraksi */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="bg-slate-50 dark:bg-slate-800/50 px-4 py-2 border-b border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-500 flex items-center gap-2">
                <i className="fa-solid fa-file-lines" /> Hasil Ekstraksi Teks (Bisa Diedit)
              </div>
              
              {isExtracting ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <i className="fa-solid fa-spinner fa-spin text-4xl text-brand-600 mb-4" />
                  <p className="text-sm font-bold text-slate-600 dark:text-slate-400">Membaca teks dari PDF...</p>
                </div>
              ) : (
                <textarea
                  value={markdown}
                  onChange={(e) => setMarkdown(e.target.value)}
                  className="w-full h-[500px] p-6 bg-transparent resize-none focus:outline-none font-mono text-sm text-slate-800 dark:text-slate-200 custom-scrollbar"
                  placeholder="Teks hasil ekstraksi akan muncul di sini..."
                />
              )}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}