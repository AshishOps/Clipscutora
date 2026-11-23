import type { Metadata } from "next";
import { QueryProvider } from "@/components/QueryProvider";
import { Badge, ThemeToggle } from "@/components/untitledui";
import { Stars01, CpuChip01, LayersThree01, Lightning01 } from "@untitledui/icons";
import "./globals.css";

export const metadata: Metadata = {
  title: "ViralClipper — AI 9:16 Shorts & Reels Generator",
  description: "Extract high-engagement viral moments from long videos, reframe to 9:16 portrait, and burn animated captions.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('theme');
                if (theme === 'light') {
                  document.documentElement.classList.remove('dark');
                } else {
                  document.documentElement.classList.add('dark');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="min-h-screen antialiased bg-[#fcfcfd] dark:bg-[#09090b] text-gray-900 dark:text-zinc-100 selection:bg-brand-500/20 selection:text-brand-700 dark:selection:bg-brand-500/30 dark:selection:text-brand-200 transition-colors duration-200">
        <QueryProvider>
          <div className="relative min-h-screen flex flex-col justify-between">
            {/* Ambient Background Gradient Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[350px] bg-gradient-to-b from-brand-500/10 dark:from-brand-600/15 via-purple-500/5 dark:via-purple-600/10 to-transparent blur-[140px] pointer-events-none -z-10" />

            {/* Untitled UI Top Navigation Bar */}
            <header className="border-b border-gray-200/80 dark:border-zinc-800/80 backdrop-blur-md sticky top-0 z-50 bg-white/80 dark:bg-[#09090b]/85 transition-all">
              <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                {/* Logo & Brand Identity */}
                <div className="flex items-center gap-3">
                  <a href="/" className="flex items-center gap-2.5 group">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white shadow-sm shadow-brand-500/25 group-hover:scale-105 transition-transform">
                      <Stars01 className="w-5 h-5 stroke-[2]" />
                    </div>
                    <span className="font-bold text-lg tracking-tight text-gray-900 dark:text-zinc-100">
                      Viral<span className="text-brand-600 dark:text-brand-400">Clipper</span>
                    </span>
                  </a>

                  <Badge variant="brand" size="sm" dot>
                    AI Engine v2.5
                  </Badge>
                </div>

                {/* Status, Theme Switcher & Actions */}
                <div className="flex items-center gap-3">
                  <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-gray-600 dark:text-zinc-400 border border-gray-200 dark:border-zinc-800/80 px-3 py-1.5 rounded-full bg-white dark:bg-zinc-950/60 shadow-xs">
                    <CpuChip01 className="w-4 h-4 text-brand-600 dark:text-brand-400 stroke-[1.75]" />
                    <span>CUDA GPU Accelerated</span>
                  </div>

                  <ThemeToggle />

                  <a
                    href="/"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 text-xs font-semibold text-gray-700 dark:border-zinc-800 dark:hover:border-zinc-700 dark:bg-zinc-900/60 dark:hover:bg-zinc-800/80 dark:text-zinc-200 transition shadow-xs"
                  >
                    <LayersThree01 className="w-4 h-4 text-gray-500 dark:text-zinc-400 stroke-[1.75]" />
                    <span>Workspace</span>
                  </a>
                </div>
              </div>
            </header>

            {/* Main Workspace Content with Refined Spatial Hierarchy */}
            <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-12">
              {children}
            </main>

            {/* Untitled UI Clean SaaS Footer */}
            <footer className="border-t border-gray-200/80 dark:border-zinc-900/90 bg-gray-50/60 dark:bg-zinc-950/40 py-8 text-xs text-gray-500 dark:text-zinc-500 transition-colors">
              <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 flex items-center justify-center text-brand-600 dark:text-brand-400 shadow-xs">
                    <Lightning01 className="w-3.5 h-3.5 stroke-[2]" />
                  </div>
                  <span className="font-semibold text-gray-800 dark:text-zinc-300">ViralClipper</span>
                  <span className="text-gray-400 dark:text-zinc-600">·</span>
                  <span>Autonomous 9:16 Shorts Generation</span>
                </div>

                <div className="flex items-center gap-4 text-gray-500 dark:text-zinc-400">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                    <span className="text-[11px] font-medium text-gray-600 dark:text-zinc-400">Local Engine Ready</span>
                  </span>
                  <span className="text-gray-300 dark:text-zinc-700">|</span>
                  <span className="text-[11px] text-gray-500 dark:text-zinc-500">Whisper & Gemini AI Pipeline</span>
                </div>
              </div>
            </footer>
          </div>
        </QueryProvider>
      </body>
    </html>
  );
}
