import type { Metadata } from "next";
import { QueryProvider } from "@/components/QueryProvider";
import { ThemeToggle } from "@/components/untitledui";
import { Stars01, CpuChip01 } from "@untitledui/icons";
import "./globals.css";

export const metadata: Metadata = {
  title: "Clipscutora — Animated Captions & Viral 9:16 Clips",
  description:
    "Extract high-engagement viral moments from long videos, reframe to 9:16 portrait, and burn Samsaam-grade animated captions.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#3B86FF" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Anton&family=Archivo+Black&family=Bangers&family=Bebas+Neue&family=Caveat:wght@700&family=Inter:ital,wght@0,500;0,700;0,800;1,500;1,700&family=Kanit:ital,wght@0,700;1,900&family=Montserrat:ital,wght@0,700;0,800;0,900;1,800;1,900&family=Oswald:wght@700&family=Playfair+Display:ital,wght@0,700;1,700;1,900&family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Poppins:ital,wght@0,700;0,800;1,400&display=swap"
          rel="stylesheet"
        />
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
      <body className="min-h-screen antialiased bg-[#f3f7ff] dark:bg-[#0b0c0e] text-[#0c1836] dark:text-[#f1f4f9] selection:bg-[#3b86ff]/25 selection:text-[#3b86ff] transition-colors duration-200">
        <QueryProvider>
          <div className="relative min-h-screen flex flex-col justify-between isolate">
            {/* Samsaam Atmospheric Light & Space Constellation */}
            <div aria-hidden="true" className="ls-light" />
            <div aria-hidden="true" className="lg-space" />

            {/* Samsaam-Style Clean Top Navigation */}
            <header className="sticky top-0 z-50 w-full border-b border-[#dae7ff]/80 dark:border-[#2a2d33]/70 bg-[#f3f7ff]/80 dark:bg-[#0b0c0e]/80 backdrop-blur-xl transition-colors duration-200">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[70px] md:h-[78px] grid grid-cols-[1fr_auto] md:grid-cols-[1fr_auto_1fr] items-center gap-4">
                {/* Brand Mark + Lowercase Wordmark */}
                <div className="flex items-center gap-3 justify-self-start">
                  <a href="/" className="flex items-center gap-2.5 group">
                    <div className="w-8 h-8 rounded-[10px] bg-[#3b86ff] flex items-center justify-center text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.28),0_6px_18px_-4px_rgba(59,134,255,0.65)] group-hover:scale-105 transition-transform">
                      <Stars01 className="w-4 h-4 stroke-[2.2]" />
                    </div>
                    <span className="font-bold text-[19px] tracking-[-0.03em] text-[#0c1836] dark:text-white">
                      clipscutora
                    </span>
                  </a>
                </div>

                {/* Centered Glass Navigation Pill */}
                <nav className="hidden md:flex items-center gap-1 rounded-full p-1 border border-[#dae7ff] dark:border-[#2a2d33] bg-white/80 dark:bg-[#141518]/90 shadow-xs">
                  <a
                    href="#studio-source"
                    className="px-4 py-1.5 rounded-full text-xs font-medium text-[#4d5b85] hover:text-[#0c1836] dark:text-[#9da4b0] dark:hover:text-white transition-colors"
                  >
                    Video Source
                  </a>
                  <a
                    href="#caption-styles"
                    className="px-4 py-1.5 rounded-full text-xs font-medium text-[#4d5b85] hover:text-[#0c1836] dark:text-[#9da4b0] dark:hover:text-white transition-colors"
                  >
                    12 Templates
                  </a>
                  <a
                    href="#animation-studio"
                    className="px-4 py-1.5 rounded-full text-xs font-medium text-[#4d5b85] hover:text-[#0c1836] dark:text-[#9da4b0] dark:hover:text-white transition-colors"
                  >
                    Animations
                  </a>
                </nav>

                {/* Right Utility Pills */}
                <div className="flex items-center gap-2.5 justify-self-end">
                  <div className="hidden sm:inline-flex items-center gap-2 text-[11px] font-medium text-[#4d5b85] dark:text-[#9da4b0] border border-[#dae7ff] dark:border-[#2a2d33] px-3 py-1.5 rounded-full bg-white/80 dark:bg-[#141518]/90">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#3b86ff] animate-pulse" />
                    <CpuChip01 className="w-3.5 h-3.5 text-[#3b86ff] stroke-[1.8]" />
                    <span>CUDA Ready</span>
                  </div>

                  <ThemeToggle />

                  <a
                    href="/"
                    className="btn-lit inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#3b86ff] hover:bg-[#5a9aff] text-xs font-semibold text-white border border-white/15 transition-all"
                  >
                    New Clip
                  </a>
                </div>
              </div>
            </header>

            {/* Main Studio Workspace */}
            <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
              {children}
            </main>

            {/* Samsaam-Style Editorial Footer with Oversized Faint Watermark */}
            <footer className="relative overflow-hidden border-t border-[#dae7ff] dark:border-[#2a2d33]/80 bg-white/50 dark:bg-[#0b0c0e]/70 py-10 text-xs text-[#4d5b85] dark:text-[#9da4b0]">
              <div
                aria-hidden="true"
                className="pointer-events-none select-none absolute inset-x-0 -bottom-6 text-center text-[110px] sm:text-[160px] font-extrabold tracking-[-0.05em] leading-none text-[#3b86ff]/[0.04] dark:text-white/[0.025]"
              >
                clipscutora
              </div>
              <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-[#3b86ff] flex items-center justify-center text-white shadow-xs">
                    <Stars01 className="w-3.5 h-3.5 stroke-[2.2]" />
                  </div>
                  <span className="font-semibold text-[#0c1836] dark:text-white tracking-tight">
                    clipscutora
                  </span>
                  <span className="opacity-40">·</span>
                  <span>After Effects style captions & 9:16 shorts</span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 border border-[#dae7ff] dark:border-[#2a2d33] bg-white/70 dark:bg-[#141518]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[11px] font-medium">Whisper & Gemini AI Pipeline</span>
                  </span>
                </div>
              </div>
            </footer>
          </div>
        </QueryProvider>
      </body>
    </html>
  );
}
