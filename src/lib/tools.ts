export type ToolCategory = "organize" | "optimize" | "convert";

export interface Tool {
  id: string;
  cat: ToolCategory;
  name: string;
  desc: string;
  icon: string;
  color: string;
  href: string;
}

export interface Category {
  id: ToolCategory;
  name: string;
  icon: string;
  desc: string;
}

export const CATEGORIES: Category[] = [
  { id: "organize", name: "Organize PDF", icon: "fa-folder-tree", desc: "Susun dan atur halaman" },
  { id: "optimize", name: "Optimize PDF", icon: "fa-bolt", desc: "Kecilkan ukuran file" },
  { id: "convert", name: "Convert PDF", icon: "fa-right-left", desc: "Konversi format" },
];

export const TOOLS: Tool[] = [
  // ORGANIZE
  {
    id: "merge",
    cat: "organize",
    name: "Gabung PDF",
    desc: "Gabungkan beberapa file PDF menjadi satu dokumen.",
    icon: "fa-link",
    color: "text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-700",
    href: "/merge",
  },
  {
    id: "split",
    cat: "organize",
    name: "Pisah PDF",
    desc: "Pecah PDF jadi beberapa file atau ekstrak halaman.",
    icon: "fa-scissors",
    color: "text-pink-600 bg-pink-50 border-pink-200 dark:bg-pink-900/30 dark:text-pink-400 dark:border-pink-700",
    href: "/split",
  },
  {
    id: "rotate",
    cat: "organize",
    name: "Putar PDF",
    desc: "Rotasi halaman 90°, 180°, atau 270°.",
    icon: "fa-rotate-right",
    color: "text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-700",
    href: "/rotate",
  },
  {
    id: "reorder",
    cat: "organize",
    name: "Susun Ulang",
    desc: "Ubah urutan halaman dengan seret-lepas visual.",
    icon: "fa-shuffle",
    color: "text-violet-600 bg-violet-50 border-violet-200 dark:bg-violet-900/30 dark:text-violet-400 dark:border-violet-700",
    href: "/reorder",
  },
  {
    id: "resize",
    cat: "organize",
    name: "Resize PDF",
    desc: "Ubah ukuran halaman ke A4, Letter, A5, dll.",
    icon: "fa-expand",
    color: "text-indigo-600 bg-indigo-50 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-700",
    href: "/resize",
  },

  // OPTIMIZE
  {
    id: "compress",
    cat: "optimize",
    name: "Kompres PDF",
    desc: "Perkecil ukuran file tanpa kehilangan kualitas.",
    icon: "fa-compress",
    color: "text-rose-600 bg-rose-50 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-700",
    href: "/compress",
  },

  // CONVERT
  {
    id: "img2pdf",
    cat: "convert",
    name: "Gambar ke PDF",
    desc: "Konversi JPG, PNG, atau WebP menjadi PDF.",
    icon: "fa-image",
    color: "text-teal-600 bg-teal-50 border-teal-200 dark:bg-teal-900/30 dark:text-teal-400 dark:border-teal-700",
    href: "/img-to-pdf",
  },
  {
    id: "pdf2img",
    cat: "convert",
    name: "PDF ke Gambar",
    desc: "Ekspor tiap halaman jadi PNG atau JPEG.",
    icon: "fa-camera-retro",
    color: "text-cyan-600 bg-cyan-50 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-400 dark:border-cyan-700",
    href: "/pdf-to-img",
  },
  {
    id: "md2pdf",
    cat: "convert",
    name: "Markdown ke PDF",
    desc: "Tulis Markdown, ekspor sebagai PDF rapi.",
    icon: "fa-code",
    color: "text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-700",
    href: "/md-to-pdf",
  },
  { 
    id: "pdf2md", 
    cat: "convert", 
    name: "PDF ke Markdown", 
    desc: "Ekstrak teks dari PDF ke format Markdown.", 
    icon: "fa-file-code", 
    color: "text-orange-600 bg-orange-50 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-700", 
    href: "/pdf-to-md" 
  },
];