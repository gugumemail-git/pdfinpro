"use client";

import { useState, useMemo } from "react";
import AppShell from "@/components/layout/AppShell";
import FileDropzone from "@/components/shared/FileDropzone";
import { compressPDF, CompressLevel } from "@/lib/pdf/compress";

export default function CompressPage() {
  const [file, setFile] = useState<File | null>(null);
  const [level, setLevel] = useState<CompressLevel>("balanced");
  const [customPercent, setCustomPercent] = useState(50); // Nilai default slider
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFilesSelected = (newFiles: File[]) => {
    const pdf = newFiles.find((f) => f.type === "application/pdf");
    if (!pdf) {
      alert("Hanya file PDF yang didukung.");
      return;
    }
    setFile(pdf);
  };

  // Hitung estimasi ukuran file secara real-time
  const estimatedSize = useMemo(() => {
    if (!file) return 0;
    let reductionFactor = 0.8; // Default balanced
    if (level === "light") reductionFactor = 0.8;
    else if (level === "balanced") reductionFactor = 0.5;
    else if (level === "strong") reductionFactor = 0.25;
    else if (level === "custom") {
      // Estimasi kasar berdasarkan persentase slider
      reductionFactor = 1 - (customPercent / 100);
    }
    return file.size * reductionFactor;
  }, [file, level, customPercent]);

  const handleCompress = async () => {
    if (!file) return;

    setIsProcessing(true);
    try {
      const newBytes = await compressPDF(file, level, customPercent);
      const blob = new Blob([newBytes], { type: "application/pdf" });
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `compressed_${file.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      const oldSize = file.size;
      const newSize = blob.size;
      const saved = ((oldSize - newSize) / oldSize) * 100;

      alert(`Kompresi Berhasil!\nUkuran lama: ${(oldSize/1024/1024).toFixed(2)} MB\nUkuran baru: ${(newSize/1024/1024).toFixed(2)} MB\nHemat: ${saved.toFixed(1)}%`);
      setFile(null);
    } catch (error) {
      console.error(error);
      alert("Gagal mengompres PDF.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AppShell title="Kompres PDF" subtitle="Perkecil ukuran file tanpa kehilangan kualitas.">
      <div className="max-w-4xl mx-auto space-y-6">
        
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
          <h1 className="text-xl font-bold mb-2 flex items-center gap-2">
            <i className="fa-solid fa-compress text-brand-600" /> Kompres PDF
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Perkecil ukuran file secara drastis langsung di browser Anda.
          </p>
        </div>

        {!file ? (
          <FileDropzone onFilesSelected={handleFilesSelected} multiple={false} />
        ) : (
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-6">
              
              {/* Info File */}
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-md bg-brand-100 text-brand-700 flex items-center justify-center text-lg">
                    <i className="fa-solid fa-file-pdf" />
                  </span>
                  <div>
                    <p className="text-sm font-bold">{file.name}</p>
                    <p className="text-[11px] text-slate-500">
                      Ukuran Asli: {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button onClick={() => setFile(null)} className="text-xs font-bold text-rose-600 hover:underline">
                  Batal
                </button>
              </div>

              {/* Pilihan Preset */}
              <div>
                <label className="block text-sm font-bold mb-3">Pilih Tingkat Kompresi</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: "light", title: "Ringan", desc: "Kualitas 90%", icon: "fa-feather" },
                    { id: "balanced", title: "Seimbang", desc: "Kualitas 75%", icon: "fa-scale-balanced" },
                    { id: "strong", title: "Kuat", desc: "Kualitas 50%", icon: "fa-bomb" },
                  ].map((opt) => (
                    <label
                      key={opt.id}
                      onClick={() => setLevel(opt.id as CompressLevel)}
                      className={`border-2 rounded-xl p-3 flex flex-col items-center justify-center cursor-pointer transition text-center ${
                        level === opt.id
                          ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20"
                          : "border-slate-200 dark:border-slate-700 hover:border-brand-300"
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${level === opt.id ? "bg-brand-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500"}`}>
                        <i className={`fa-solid ${opt.icon} text-xs`} />
                      </div>
                      <p className="text-sm font-bold">{opt.title}</p>
                      <p className="text-[10px] text-slate-500">{opt.desc}</p>
                    </label>
                  ))}
                </div>
              </div>

              {/* Slider Kustom */}
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-bold flex items-center gap-2">
                    <i className="fa-solid fa-sliders text-brand-600" /> Kustomisasi Kompresi
                  </label>
                  <span className={`text-xs font-bold px-2 py-1 rounded ${level === "custom" ? "bg-brand-100 text-brand-700" : "bg-slate-200 text-slate-500"}`}>
                    {level === "custom" ? `${customPercent}% Kompresi` : "Pilih Manual"}
                  </span>
                </div>
                
                <input
                  type="range"
                  min="10"
                  max="90"
                  step="5"
                  value={customPercent}
                  onChange={(e) => {
                    setCustomPercent(parseInt(e.target.value));
                    setLevel("custom"); // Otomatis pindah ke mode kustom saat digeser
                  }}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-2 font-semibold">
                  <span>Kualitas Tinggi (10%)</span>
                  <span>Ukuran Terkecil (90%)</span>
                </div>

                {/* Info Estimasi */}
                {file && (
                  <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                    <span className="text-slate-500">Estimasi ukuran hasil:</span>
                    <span className="font-bold text-brand-600 dark:text-brand-400">
                      ~ {(estimatedSize / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleCompress}
                  disabled={isProcessing}
                  className="px-6 py-3 rounded-lg font-bold text-sm bg-brand-600 hover:bg-brand-700 text-white shadow-lg shadow-brand-600/30 disabled:opacity-50 flex items-center gap-2"
                >
                  {isProcessing ? (
                    <><i className="fa-solid fa-spinner fa-spin" /> Memproses...</>
                  ) : (
                    <><i className="fa-solid fa-bolt" /> Kompres PDF Sekarang</>
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