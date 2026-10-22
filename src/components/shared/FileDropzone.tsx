"use client";

import { useRef, useState } from "react";

interface FileDropzoneProps {
  accept?: string;
  multiple?: boolean;
  onFilesSelected: (files: File[]) => void;
}

export default function FileDropzone({
  accept = "application/pdf",
  multiple = true,
  onFilesSelected,
}: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragActive, setIsDragActive] = useState(false);

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList);
    onFilesSelected(files);
  };

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setIsDragActive(true); }}
      onDragLeave={(e) => { e.preventDefault(); setIsDragActive(false); }}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragActive(false);
        handleFiles(e.dataTransfer.files);
      }}
      className={`border-2 border-dashed rounded-xl bg-slate-50 dark:bg-slate-800/50 p-8 md:p-14 text-center cursor-pointer transition ${
        isDragActive
          ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20"
          : "border-slate-300 dark:border-slate-700 hover:border-brand-400 hover:bg-brand-50/40"
      }`}
    >
      <div className="w-16 h-16 mx-auto rounded-2xl bg-brand-100 dark:bg-brand-900/40 text-brand-600 dark:text-brand-400 flex items-center justify-center mb-4">
        <i className="fa-solid fa-cloud-arrow-up text-2xl" />
      </div>
      <p className="font-bold text-slate-900 dark:text-white mb-1">
        Seret file ke sini, atau <span className="text-brand-600 dark:text-brand-400">klik untuk memilih</span>
      </p>
      <p className="text-xs text-slate-500 dark:text-slate-400">
        PDF · Bisa pilih lebih dari satu
      </p>
      <input
        type="file"
        ref={inputRef}
        className="hidden"
        accept={accept}
        multiple={multiple}
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}