"use client";

import { useState } from "react";
import AppShell from "@/components/layout/AppShell";
import FileDropzone from "@/components/shared/FileDropzone";
import { convertImagesToPDF } from "@/lib/pdf/img-to-pdf";

export default function ImgToPdfPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFilesSelected = (newFiles: File[]) => {
    // Hanya terima file gambar
    const images = newFiles.filter((f) => f.type.startsWith("image/"));
    if (images.length === 0) {
      alert("Hanya file gambar (JPG/PNG) yang didukung.");
      return;
    }
    setFiles((prev) => [...prev, ...images]);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const moveFile = (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= files.length) return;
    const newFiles = [...files];
    [newFiles[index], newFiles[newIndex]] = [newFiles[newIndex], newFiles[index]];
    setFiles(newFiles);
  };

  const handleConvert = async () => {
    if (files.length === 0) return;

    setIsProcessing(true);
    try {
      const pdfBytes = await convertImagesToPDF(files);
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "gambar_ke_pdf.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      alert("Gambar berhasil diubah ke PDF dan diunduh!");
      setFiles([]);
    } catch (error) {
      console.error(error);
      alert("Gagal mengonversi gambar ke PDF.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AppShell title="Gambar ke PDF" subtitle="Konversi JPG, PNG, atau WebP menjadi PDF.">
      <div className="max-w-4xl mx-auto space-y-6">
        
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
          <h1 className="text-xl font-bold mb-2 flex items-center gap-2">
            <i className="fa-solid fa-image text-brand-600" /> Gambar ke PDF
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Ubah sekumpulan foto atau gambar menjadi satu dokumen PDF yang rapi.
          </p>
        </div>

        {files.length === 0 ? (
          <FileDropzone 
            accept="image/*" 
            onFilesSelected={handleFilesSelected} 
            multiple={true} 
          />
        ) : (
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                <span className="text-sm font-bold">{files.length} Gambar Dipilih</span>
                <button
                  onClick={() => setFiles([])}
                  className="text-xs font-bold text-rose-600 hover:underline"
                >
                  Hapus Semua
                </button>
              </div>
              <ul className="space-y-2">
                {files.map((file, index) => (
                  <li
                    key={index}
                    className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700"
                  >
                    {/* Pratinjau Mini */}
                    <div className="w-10 h-10 rounded bg-white dark:bg-slate-900 flex items-center justify-center overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={URL.createObjectURL(file)} alt="preview" className="w-full h-full object-cover" />
                    </div>
                    <span className="w-8 h-8 rounded-md bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-xs shrink-0">
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate">{file.name}</p>
                      <p className="text-[11px] text-slate-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => moveFile(index, -1)}
                        disabled={index === 0}
                        className="p-1.5 rounded hover:bg-slate-200 disabled:opacity-30"
                      >
                        <i className="fa-solid fa-arrow-up text-xs" />
                      </button>
                      <button
                        onClick={() => moveFile(index, 1)}
                        disabled={index === files.length - 1}
                        className="p-1.5 rounded hover:bg-slate-200 disabled:opacity-30"
                      >
                        <i className="fa-solid fa-arrow-down text-xs" />
                      </button>
                      <button
                        onClick={() => removeFile(index)}
                        className="p-1.5 rounded text-rose-600 hover:bg-rose-100"
                      >
                        <i className="fa-solid fa-trash text-xs" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => document.getElementById("addMoreInput")?.click()}
                className="px-4 py-2.5 rounded-lg font-bold text-sm bg-slate-100 hover:bg-slate-200 text-slate-700"
              >
                <i className="fa-solid fa-plus mr-2" /> Tambah Gambar
              </button>
              <input
                id="addMoreInput"
                type="file"
                className="hidden"
                accept="image/*"
                multiple
                onChange={(e) => {
                  if (e.target.files) handleFilesSelected(Array.from(e.target.files));
                  e.target.value = "";
                }}
              />
              <button
                onClick={handleConvert}
                disabled={isProcessing}
                className="px-6 py-2.5 rounded-lg font-bold text-sm bg-brand-600 hover:bg-brand-700 text-white shadow-lg shadow-brand-600/30 disabled:opacity-50 flex items-center gap-2"
              >
                {isProcessing ? (
                  <><i className="fa-solid fa-spinner fa-spin" /> Memproses...</>
                ) : (
                  <><i className="fa-solid fa-bolt" /> Buat PDF</>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}