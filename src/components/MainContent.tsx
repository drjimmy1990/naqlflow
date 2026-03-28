"use client";

import { useState, useEffect } from "react";

export default function MainContent({ children }: { children: React.ReactNode }) {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return (
    <main style={{
      marginRight: isDesktop ? 260 : 0,
      minHeight: "100vh",
      transition: "margin-right 300ms cubic-bezier(0.16, 1, 0.3, 1)",
    }}>
      {children}
    </main>
  );
}
