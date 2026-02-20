import type { Metadata } from "next";
import { Heebo } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Toaster } from "@/components/ui/sonner";
import { I18nProvider } from "@/components/providers/I18nProvider";
import { cn } from "@/lib/utils";
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
      <body className={cn(heebo.variable, "font-sans antialiased overflow-x-hidden")}>
        <I18nProvider>
          {children}
          <Toaster />
        </I18nProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
