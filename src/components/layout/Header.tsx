"use client";

import { useThemeStore } from "@/store/useThemeStore";
import { useEffect } from "react";

interface HeaderProps {
  title: string;
  subtitle: string;
  onMenuClick: () => void;
}

export default function Header({ title, subtitle, onMenuClick }: HeaderProps) {
  const { theme, toggle, init } = useThemeStore();

  useEffect(() => {
    init();
  }, [init]);

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-20 px-4 md:px-6 py-3 flex items-center justify-between gap-3 shadow-sm flex-wrap">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
        >
          <i className="fa-solid fa-bars text-lg" />
        </button>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-base md:text-lg font-bold text-slate-900 dark:text-white tracking-tight truncate">
              {title}
            </h2>
            <span className="hidden sm:inline-flex items-center gap-1 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
              <i className="fa-solid fa-shield-halved text-[9px]" /> 100% Client-Side
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium hidden sm:block truncate">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={toggle}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition"
        >
          <i className={`fa-solid ${theme === "dark" ? "fa-sun" : "fa-moon"}`} />
        </button>
      </div>
    </header>
  );
}