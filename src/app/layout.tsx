import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import { connection } from "next/server";
import { Suspense, type ReactNode } from "react";
import { t } from "@/i18n";
import "@/styles/globals.css";
import { Providers } from "@/providers";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: { default: "DevDash", template: "%s · DevDash" },
  description: "See where every project stands, at a glance.",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  // Opting into per-request rendering is what lets Next apply the CSP nonce to
  // its own scripts (see docs/adr/ADR-006-csp-nonce.md).
  await connection();
  return (
    <html lang="en" data-theme="light" className={inter.variable} suppressHydrationWarning>
      <head>
        <Script src="/theme-init.js" strategy="beforeInteractive" />
      </head>
      <body>
        <Suspense fallback={<p className="sr-only">{t("common.loading")}</p>}>
          <Providers>{children}</Providers>
        </Suspense>
      </body>
    </html>
  );
}
