import type { Metadata } from "next";
import { QueryProvider } from "@/components/QueryProvider";
import { ThemeToggle } from "@/components/untitledui";
import { Film01 } from "@untitledui/icons";
import "./globals.css";

export const metadata: Metadata = {
  title: "Clipscutora",
  description: "Convert long videos and streams into 9:16 portrait clips with timed captions.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" data-mode="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Mona+Sans:wdth,wght@100,400;100,500;125,300&display=swap"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('theme');
                if (theme === 'light') {
                  document.documentElement.dataset.mode = 'light';
                  document.documentElement.classList.remove('dark');
                  document.documentElement.classList.add('light');
                } else {
                  document.documentElement.dataset.mode = 'dark';
                  document.documentElement.classList.add('dark');
                  document.documentElement.classList.remove('light');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col justify-between bg-[var(--color-paper)] text-[var(--color-ink)]">
        <QueryProvider>
          <header className="sticky top-0 z-[var(--z-sticky-nav)] border-b border-[var(--color-rule)] bg-[var(--color-paper)]">
            <div className="container h-16 flex items-center justify-between gap-4">
              <a
                href="/"
                aria-label="Clipscutora workspace home"
                className="inline-flex items-center gap-3 text-[var(--color-ink)] hover:text-[var(--color-accent)] transition-colors duration-150"
              >
                <span className="w-8 h-8 inline-flex items-center justify-center bg-[var(--color-paper-2)] border border-[var(--color-rule-2)] text-[var(--color-accent)]">
                  <Film01 className="w-4 h-4 stroke-[1.75]" />
                </span>
                <span className="hm-display text-lg">Clipscutora</span>
              </a>

              <nav aria-label="Primary" className="flex items-center gap-3">
                <a
                  href="/"
                  className="hm-btn-secondary px-4 inline-flex items-center justify-center text-sm"
                >
                  Workspace
                </a>
                <ThemeToggle />
              </nav>
            </div>
          </header>

          <main className="flex-1 container py-8 sm:py-10">
            {children}
          </main>

          <footer className="border-t border-[var(--color-rule)] bg-[var(--color-paper)] py-6 text-sm text-[var(--color-muted)]">
            <div className="container flex flex-wrap items-center justify-between gap-4">
              <span>Clipscutora</span>
              <span>Local GPU speech transcription and 9:16 portrait rendering</span>
            </div>
          </footer>
        </QueryProvider>
      </body>
    </html>
  );
}
