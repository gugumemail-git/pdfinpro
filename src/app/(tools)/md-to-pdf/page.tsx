"use client";

import { useState } from "react";
import AppShell from "@/components/layout/AppShell";
import { convertMarkdownToPDF } from "@/lib/pdf/md-to-pdf";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function MdToPdfPage() {
  const [markdown, setMarkdown] = useState<string>(
    "# Dokumen Saya\n\nIni adalah **contoh** Markdown.\n\n## Fitur\n- Mudah\n- Cepat\n- Aman\n\n> Blockquote contoh."
  );
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConvert = async () => {
    if (!markdown.trim()) {
      alert("Teks Markdown tidak boleh kosong.");
      return;
    }

    setIsProcessing(true);
    try {
      const pdfBytes = await convertMarkdownToPDF(markdown);
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "dokumen_markdown.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      alert("PDF berhasil dibuat dan diunduh!");
    } catch (error) {
      console.error(error);
      alert("Gagal mengonversi Markdown ke PDF.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AppShell title="Markdown ke PDF" subtitle="Tulis Markdown, ekspor sebagai PDF rapi.">
      <div className="max-w-6xl mx-auto space-y-6">
        
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold mb-1 flex items-center gap-2">
              <i className="fa-solid fa-code text-brand-600" /> Markdown ke PDF
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Ketik markdown di kiri, lihat pratinjau di kanan, lalu ekspor.
            </p>
          </div>
          <button
            onClick={handleConvert}
            disabled={isProcessing}
            className="px-6 py-2.5 rounded-lg font-bold text-sm bg-brand-600 hover:bg-brand-700 text-white shadow-lg shadow-brand-600/30 disabled:opacity-50 flex items-center gap-2"
          >
            {isProcessing ? (
              <><i className="fa-solid fa-spinner fa-spin" /> Memproses...</>
            ) : (
              <><i className="fa-solid fa-file-pdf" /> Ekspor ke PDF</>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Editor Markdown */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
            <div className="bg-slate-50 dark:bg-slate-800/50 px-4 py-2 border-b border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-500 flex items-center gap-2">
              <i className="fa-solid fa-pen-nib" /> Editor Markdown
            </div>
            <textarea
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              className="w-full h-[500px] p-4 bg-transparent resize-none focus:outline-none font-mono text-sm text-slate-800 dark:text-slate-200 custom-scrollbar"
              placeholder="Tulis markdown di sini..."
            />
          </div>

          {/* Pratinjau Markdown */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
            <div className="bg-slate-50 dark:bg-slate-800/50 px-4 py-2 border-b border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-500 flex items-center gap-2">
              <i className="fa-regular fa-eye" /> Pratinjau
            </div>
            <div className="p-6 h-[500px] overflow-y-auto prose prose-sm dark:prose-invert max-w-none custom-scrollbar">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {markdown}
              </ReactMarkdown>
            </div>
          </div>
        </div>

      </div>
    </AppShell>
  );
}