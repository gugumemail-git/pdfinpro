"use client";

import AppShell from "@/components/layout/AppShell";
import { CATEGORIES, TOOLS } from "@/lib/tools";

export default function HomePage() {
  return (
    <AppShell title="Beranda" subtitle="Studio PDF — semua alat dalam satu tempat">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Hero Section (Tampilan HP disesuaikan) */}
        <div className="bg-gradient-to-br from-brand-600 to-brand-800 rounded-2xl p-6 md:p-12 text-white shadow-lg relative overflow-hidden text-center sm:text-left">
          <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/10 blur-3xl" />
          <div className="relative max-w-2xl mx-auto sm:mx-0">
            <div className="flex flex-wrap justify-center sm:justify-start gap-2 mb-4">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest bg-white/15 border border-white/20 px-3 py-1 rounded-full">
                <i className="fa-solid fa-shield-halved text-emerald-300" /> 100% Privat
              </span>
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest bg-white/15 border border-white/20 px-3 py-1 rounded-full">
                <i className="fa-solid fa-bolt text-amber-300" /> Super Cepat
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold leading-tight mb-3">
              Studio PDF profesional
              <br className="hidden sm:block" />
              yang berjalan di browser Anda.
            </h1>
            <p className="text-brand-100 text-xs md:text-base leading-relaxed mb-5 max-w-xl mx-auto sm:mx-0">
              Gabung, pisah, putar, resize, kompres, dan konversi PDF tanpa mengunggah file.
            </p>
            <a
              href="/merge"
              className="inline-flex items-center gap-2 bg-white text-brand-700 hover:bg-brand-50 px-4 py-2.5 rounded-lg font-bold text-xs md:text-sm transition shadow-sm"
            >
              <i className="fa-solid fa-link" /> Mulai Gabung PDF
            </a>
          </div>
        </div>

        {/* Grid Kategori & Tool */}
        {CATEGORIES.map((cat) => {
          const tools = TOOLS.filter((t) => t.cat === cat.id);
          return (
            <div key={cat.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 md:p-6">
              {/* Header Kategori */}
              <div className="flex items-center gap-3 mb-5 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="w-10 h-10 rounded-xl bg-brand-100 dark:bg-brand-900/40 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0">
                  <i className={`fa-solid ${cat.icon} text-lg`} />
                </div>
                <div>
                  <h2 className="text-base md:text-lg font-bold text-slate-900 dark:text-white">
                    {cat.name}
                  </h2>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">{cat.desc}</p>
                </div>
              </div>

              {/* Grid Tool: 2 Kolom di HP, 3-4 Kolom di Desktop */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                {tools.map((tool) => (
                  <a
                    key={tool.id}
                    href={tool.href}
                    className="group bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 p-3 md:p-4 hover:shadow-md hover:border-brand-300 dark:hover:border-brand-600 transition flex flex-col items-center text-center md:items-start md:text-left h-full"
                  >
                    {/* Ikon */}
                    <div
                      className={`w-11 h-11 md:w-12 md:h-12 rounded-xl ${tool.color} border flex items-center justify-center text-lg md:text-xl mb-3 group-hover:scale-110 transition shrink-0`}
                    >
                      <i className={`fa-solid ${tool.icon}`} />
                    </div>
                    
                    {/* Teks */}
                    <h3 className="font-bold text-xs md:text-sm text-slate-900 dark:text-white mb-1 group-hover:text-brand-700 dark:group-hover:text-brand-400 transition">
                      {tool.name}
                    </h3>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-snug line-clamp-2 md:line-clamp-none">
                      {tool.desc}
                    </p>
                  </a>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </AppShell>
  );
}