import type { Metadata } from "next";
import { Heebo } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const heebo = Heebo({
  variable: "--font-heebo",
  subsets: ["latin", "hebrew"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "ניפגשה | Nipagesha",
  description: "פלטפורמה לחיבור מחדש בין הורים לילדים",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl" className="light" suppressHydrationWarning>
      <body className={`${heebo.variable} font-sans antialiased overflow-x-hidden`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
