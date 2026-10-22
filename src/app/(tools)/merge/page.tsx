"use client";

import { useState } from "react";
import AppShell from "@/components/layout/AppShell";
import FileDropzone from "@/components/shared/FileDropzone";
import { mergePDFs } from "@/lib/pdf/merge";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Komponen untuk setiap baris file yang bisa di-drag
function SortableFileItem({
  file,
  index,
  onRemove,
}: {
  file: File;
  index: number;
  onRemove: (index: number) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: file.name + index });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
        isDragging
          ? "bg-brand-50 border-brand-300 shadow-lg dark:bg-brand-900/30 dark:border-brand-700"
          : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
      }`}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
      >
        <i className="fa-solid fa-grip-vertical" />
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
      <button
        onClick={() => onRemove(index)}
        className="p-2 rounded text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-900/40"
      >
        <i className="fa-solid fa-trash text-xs" />
      </button>
    </li>
  );
}

export default function MergePage() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleFilesSelected = (newFiles: File[]) => {
    const pdfs = newFiles.filter((f) => f.type === "application/pdf");
    if (pdfs.length === 0) {
      alert("Hanya file PDF yang didukung.");
      return;
    }
    setFiles((prev) => [...prev, ...pdfs]);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setFiles((items) => {
        const oldIndex = items.findIndex((f, i) => f.name + i === active.id);
        const newIndex = items.findIndex((f, i) => f.name + i === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleMerge = async () => {
    if (files.length < 2) {
      alert("Minimal butuh 2 file PDF untuk digabungkan.");
      return;
    }

    setIsProcessing(true);
    try {
      const mergedPdfBytes = await mergePDFs(files);
      const blob = new Blob([mergedPdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "hasil_gabungan.pdf";
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      
      alert("PDF berhasil digabungkan dan diunduh!");
      setFiles([]);
    } catch (error) {
      console.error(error);
      alert("Gagal menggabungkan PDF.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AppShell title="Gabung PDF" subtitle="Gabungkan beberapa file PDF menjadi satu dokumen.">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
          <h1 className="text-xl font-bold mb-2 flex items-center gap-2">
            <i className="fa-solid fa-link text-brand-600" /> Gabung PDF
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Pilih file PDF yang ingin digabungkan. Tarik ikon <i className="fa-solid fa-grip-vertical mx-1" /> untuk mengubah urutan.
          </p>
        </div>

        {files.length === 0 ? (
          <FileDropzone onFilesSelected={handleFilesSelected} />
        ) : (
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                <span className="text-sm font-bold">{files.length} File Dipilih</span>
                <button
                  onClick={() => setFiles([])}
                  className="text-xs font-bold text-rose-600 hover:underline"
                >
                  Hapus Semua
                </button>
              </div>

              {/* Bungkus dengan DndContext untuk Drag & Drop */}
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={files.map((f, i) => f.name + i)}
                  strategy={verticalListSortingStrategy}
                >
                  <ul className="space-y-2">
                    {files.map((file, index) => (
                      <SortableFileItem
                        key={file.name + index}
                        file={file}
                        index={index}
                        onRemove={removeFile}
                      />
                    ))}
                  </ul>
                </SortableContext>
              </DndContext>

            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => document.getElementById("addMoreInput")?.click()}
                className="px-4 py-2.5 rounded-lg font-bold text-sm bg-slate-100 hover:bg-slate-200 text-slate-700"
              >
                <i className="fa-solid fa-plus mr-2" /> Tambah File
              </button>
              <input
                id="addMoreInput"
                type="file"
                className="hidden"
                accept=".pdf"
                multiple
                onChange={(e) => {
                  if (e.target.files) handleFilesSelected(Array.from(e.target.files));
                  e.target.value = "";
                }}
              />
              <button
                onClick={handleMerge}
                disabled={isProcessing || files.length < 2}
                className="px-6 py-2.5 rounded-lg font-bold text-sm bg-brand-600 hover:bg-brand-700 text-white shadow-lg shadow-brand-600/30 disabled:opacity-50 flex items-center gap-2"
              >
                {isProcessing ? (
                  <><i className="fa-solid fa-spinner fa-spin" /> Memproses...</>
                ) : (
                  <><i className="fa-solid fa-bolt" /> Gabungkan PDF</>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}