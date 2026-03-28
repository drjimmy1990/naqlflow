import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "نقل فلو — NaqlFlow",
  description: "نظام إدارة وتتبع عمليات النقليات",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        {/* 
          CRITICAL: Inline responsive styles for main layout.
          This ensures mobile layout works on FIRST paint, 
          before any external CSS loads.
        */}
        <style dangerouslySetInnerHTML={{ __html: `
          .nf-main {
            margin-right: 260px;
            min-height: 100vh;
          }
          @media (max-width: 1023px) {
            .nf-main {
              margin-right: 0 !important;
            }
          }
        `}} />
      </head>
      <body className="antialiased">
        <Sidebar />
        <main className="nf-main">
          {children}
        </main>
      </body>
    </html>
  );
}
