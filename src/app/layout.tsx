import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CRM Seguro - AI Native",
  description: "Next Generation CRM for Insurance Agents",
};

import { AppLayout } from "@/components/layout/AppLayout";
import { InsforgeProvider } from "./providers";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>
        <InsforgeProvider>
          <AppLayout fontClasses={`${geistSans.variable} ${geistMono.variable}`}>
            {children}
          </AppLayout>
        </InsforgeProvider>
      </body>
    </html>
  );
}
