import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import MainContent from "@/components/MainContent";

export const metadata: Metadata = {
  title: "نقل فلو — NaqlFlow",
  description: "نظام إدارة وتتبع عمليات النقليات",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body className="antialiased">
        <Sidebar />
        <MainContent>{children}</MainContent>
      </body>
    </html>
  );
}
