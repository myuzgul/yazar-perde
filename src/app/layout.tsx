import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Yazar Perde - Özel Ölçülü Perde Sistemleri",
  description: "Evinize özel ölçülü tül, stor, zebra, plise ve fon perde sistemleri.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased font-sans">
        {children}
      </body>
    </html>
  );
}