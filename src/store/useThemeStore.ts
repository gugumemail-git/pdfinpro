"use client";

import { create } from "zustand";

interface ThemeState {
  theme: "light" | "dark";
  toggle: () => void;
  setTheme: (theme: "light" | "dark") => void;
  init: () => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: "light",
  toggle: () => {
    const next = get().theme === "light" ? "dark" : "light";
    get().setTheme(next);
  },
  setTheme: (theme) => {
    if (typeof window === "undefined") return;
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("pdfin-theme", theme);
    set({ theme });
  },
  init: () => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem("pdfin-theme") as "light" | "dark" | null;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const theme = saved || (prefersDark ? "dark" : "light");
    document.documentElement.classList.toggle("dark", theme === "dark");
    set({ theme });
  },
}));