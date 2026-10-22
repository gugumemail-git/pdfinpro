"use client";

import { useState } from "react";
import AppShell from "@/components/layout/AppShell";
import FileDropzone from "@/components/shared/FileDropzone";
import { splitPDF } from "@/lib/pdf/split";
import JSZip from "jszip";

export default function SplitPage() {
  const [file, setFile] = useState<File | null>(null);
  const [ranges, setRanges] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFilesSelected = (newFiles: File[]) => {
    const pdf = newFiles.find((f) => f.type === "application/pdf");
    if (!pdf) {
      alert("Hanya file PDF yang didukung.");
      return;
    }
    setFile(pdf);
  };

  const handleSplit = async () => {
    if (!file) return;

    setIsProcessing(true);
    try {
      const results = await splitPDF(file, ranges);
      
      if (results.length === 0) {
        alert("Tidak ada halaman valid yang ditemukan. Periksa kembali format rentang Anda.");
        setIsProcessing(false);
        return;
      }

      // Jika hasilnya hanya 1 file, unduh langsung sebagai PDF
      if (results.length === 1) {
        const blob = new Blob([results[0].bytes], { type: "application/pdf" });
        downloadBlob(blob, results[0].name);
      } else {
        // Jika lebih dari 1, bungkus jadi ZIP
        const zip = new JSZip();
        results.forEach((res) => {
          zip.file(res.name, res.bytes);
        });
        const zipBlob = await zip.generateAsync({ type: "blob" });
        downloadBlob(zipBlob, "hasil_pisah_pdf.zip");
      }

      alert(`Berhasil memisah PDF menjadi ${results.length} file!`);
      setFile(null);
      setRanges("");
    } catch (error) {
      console.error(error);
      alert("Gagal memisah PDF.");
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadBlob = (blob: Blob, name: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <AppShell title="Pisah PDF" subtitle="Pecah PDF jadi beberapa file atau ekstrak halaman.">
      <div className="max-w-4xl mx-auto space-y-6">
        
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
          <h1 className="text-xl font-bold mb-2 flex items-center gap-2">
            <i className="fa-solid fa-scissors text-brand-600" /> Pisah PDF
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Ekstrak halaman tertentu atau pecah seluruh dokumen.
          </p>
        </div>

        {!file ? (
          <FileDropzone onFilesSelected={handleFilesSelected} multiple={false} />
        ) : (
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 space-y-5">
              
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-md bg-brand-100 text-brand-700 flex items-center justify-center text-lg">
                    <i className="fa-solid fa-file-pdf" />
                  </span>
                  <div>
                    <p className="text-sm font-bold">{file.name}</p>
                    <p className="text-[11px] text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <button
                  onClick={() => setFile(null)}
                  className="text-xs font-bold text-rose-600 hover:underline"
                >
                  Batal
                </button>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Rentang Halaman</label>
                <input
                  type="text"
                  value={ranges}
                  onChange={(e) => setRanges(e.target.value)}
                  placeholder="Contoh: 1-3, 5, 7-9 (Kosongkan untuk memisah semua halaman)"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-brand-500"
                />
                <p className="text-[11px] text-slate-500 mt-2">
                  Gunakan tanda minus (-) untuk rentang, dan koma (,) untuk memisahkan grup. Hasil lebih dari 1 file akan diunduh sebagai .zip
                </p>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleSplit}
                  disabled={isProcessing}
                  className="px-6 py-2.5 rounded-lg font-bold text-sm bg-brand-600 hover:bg-brand-700 text-white shadow-lg shadow-brand-600/30 disabled:opacity-50 flex items-center gap-2"
                >
                  {isProcessing ? (
                    <><i className="fa-solid fa-spinner fa-spin" /> Memproses...</>
                  ) : (
                    <><i className="fa-solid fa-bolt" /> Pisah PDF</>
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