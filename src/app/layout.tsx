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
      <body className="antialiased">
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1" style={{ marginRight: "var(--sidebar-width)" }}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
