"use client";

import { useState } from "react";
import AppShell from "@/components/layout/AppShell";
import FileDropzone from "@/components/shared/FileDropzone";
import { reorderPDF } from "@/lib/pdf/reorder";
import * as pdfjsLib from "pdfjs-dist";
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
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Setup worker pdf.js
if (typeof window !== "undefined") {
  (pdfjsLib as any).GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

interface PageThumb {
  id: string; // ID unik untuk dnd-kit
  originalIndex: number; // Indeks asli halaman di PDF
  dataUrl: string; // Gambar thumbnail
}

// Komponen Gambar yang bisa di-drag
function SortablePageItem({ page }: { page: PageThumb }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: page.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`relative bg-white dark:bg-slate-900 border-2 rounded-xl p-2 cursor-grab active:cursor-grabbing transition-colors ${
        isDragging
          ? "border-brand-500 shadow-2xl opacity-90 scale-105"
          : "border-slate-200 dark:border-slate-700 hover:border-brand-300"
      }`}
    >
      <div className="aspect-[3/4] bg-slate-100 dark:bg-slate-800 rounded overflow-hidden flex items-center justify-center relative pointer-events-none">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={page.dataUrl}
          alt="Halaman"
          className="max-w-full max-h-full object-contain"
        />
      </div>
      <div className="mt-2 text-center pointer-events-none">
        <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded">
          Hal {page.originalIndex + 1}
        </span>
      </div>
    </div>
  );
}

export default function ReorderPage() {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<PageThumb[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

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
      const pdf = await (pdfjsLib as any).getDocument({ data: arrayBuffer }).promise;
      const totalPages = pdf.numPages;
      const loadedPages: PageThumb[] = [];

      for (let i = 1; i <= totalPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 0.4 });
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        if (context) {
          await (page as any).render({ canvasContext: context, viewport: viewport as any }).promise;
          loadedPages.push({
            id: `page-${i}-${Math.random().toString(36).substr(2, 9)}`,
            originalIndex: i - 1,
            dataUrl: canvas.toDataURL("image/jpeg", 0.8),
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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setPages((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const executeReorder = async () => {
    if (!file || pages.length === 0) return;

    setIsProcessing(true);
    try {
      // Kumpulkan urutan indeks halaman yang baru
      const newOrder = pages.map((p) => p.originalIndex);

      const newBytes = await reorderPDF(file, newOrder);
      const blob = new Blob([newBytes], { type: "application/pdf" });
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `reordered_${file.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      alert("Urutan halaman berhasil disimpan dan diunduh!");
      setFile(null);
      setPages([]);
    } catch (error) {
      console.error(error);
      alert("Gagal menyusun ulang PDF.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AppShell title="Susun Ulang PDF" subtitle="Ubah urutan halaman dengan seret-lepas visual.">
      <div className="max-w-6xl mx-auto space-y-6">
        
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
          <h1 className="text-xl font-bold mb-2 flex items-center gap-2">
            <i className="fa-solid fa-shuffle text-brand-600" /> Susun Ulang PDF
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Seret (drag) gambar halaman untuk mengubah urutannya. Halaman paling kiri akan menjadi halaman pertama.
          </p>
        </div>

        {!file ? (
          <FileDropzone onFilesSelected={handleFilesSelected} multiple={false} />
        ) : (
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm font-bold">
                <i className="fa-solid fa-file-pdf text-brand-600" />
                {file.name} ({pages.length} Halaman)
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setFile(null); setPages([]); }}
                  className="px-4 py-2 text-rose-600 hover:underline text-xs font-bold"
                >
                  Batal
                </button>
                <button
                  onClick={executeReorder}
                  disabled={isProcessing || isLoading}
                  className="px-6 py-2.5 rounded-lg font-bold text-sm bg-brand-600 hover:bg-brand-700 text-white shadow-lg shadow-brand-600/30 disabled:opacity-50 flex items-center gap-2"
                >
                  {isProcessing ? (
                    <><i className="fa-solid fa-spinner fa-spin" /> Menyimpan...</>
                  ) : (
                    <><i className="fa-solid fa-download" /> Simpan Urutan</>
                  )}
                </button>
              </div>
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                <i className="fa-solid fa-spinner fa-spin text-4xl text-brand-600 mb-4" />
                <p className="text-sm font-bold text-slate-600 dark:text-slate-400">Memuat halaman...</p>
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={pages.map((p) => p.id)}
                  strategy={rectSortingStrategy}
                >
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {pages.map((page) => (
                      <SortablePageItem key={page.id} page={page} />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}