"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CATEGORIES, TOOLS } from "@/lib/tools";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 w-64 h-screen bg-brand-800 text-white flex flex-col justify-between shrink-0 shadow-xl transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex-1 min-h-0 flex flex-col">
          <div className="p-5 flex items-center space-x-3 border-b border-brand-700/50 shrink-0">
            <div className="bg-white text-brand-700 p-2.5 rounded-xl font-black text-xl shadow-md flex items-center justify-center w-11 h-11 shrink-0">
              <i className="fa-solid fa-file-pdf" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base font-bold tracking-tight text-white truncate">PDFin</h1>
              <p className="text-[10px] text-brand-200 font-semibold tracking-wide uppercase">
                Studio PDF
              </p>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden ml-auto p-2 text-white/70 hover:text-white"
            >
              <i className="fa-solid fa-xmark text-lg" />
            </button>
          </div>

          <nav className="p-3 space-y-1 text-xs font-semibold flex-1 overflow-y-auto">
            <Link
              href="/"
              onClick={onClose}
              className={`w-full py-2.5 px-3 rounded-lg transition flex items-center gap-3 font-bold text-left ${
                pathname === "/" ? "nav-active" : "text-brand-100 hover:bg-brand-700/50"
              }`}
            >
              <i className="fa-solid fa-house text-sm w-4 text-center" />
              <span>Beranda</span>
            </Link>

            {CATEGORIES.map((cat) => (
              <div key={cat.id} className="pt-3">
                <p className="px-3 py-1.5 text-[10px] font-bold uppercase text-brand-300 tracking-wider flex items-center gap-2">
                  <i className={`fa-solid ${cat.icon} text-[9px]`} />
                  {cat.name}
                </p>
                {TOOLS.filter((t) => t.cat === cat.id).map((tool) => {
                  const active = pathname === tool.href;
                  return (
                    <Link
                      key={tool.id}
                      href={tool.href}
                      onClick={onClose}
                      className={`w-full py-2 px-3 pl-8 rounded-lg transition flex items-center gap-3 font-bold text-left text-xs ${
                        active ? "nav-active" : "text-brand-100 hover:bg-brand-700/50"
                      }`}
                    >
                      <i className={`fa-solid ${tool.icon} text-sm w-4 text-center`} />
                      <span className="truncate">{tool.name}</span>
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        <div className="p-3 border-t border-brand-700/50 shrink-0">
          <div className="bg-brand-700/40 rounded-xl p-3.5 border border-brand-600/40">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <p className="text-[11px] font-semibold text-emerald-300">Privasi Terjaga</p>
            </div>
            <p className="text-[10px] text-brand-200 leading-relaxed">
              File tidak pernah diunggah. Semua diproses di browser.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}