import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { getSiteUrl } from "@/lib/site-url";

export const metadata: Metadata = {
  title: "AURUMGEN Academy",
  description: "Platform pembelajaran modern dengan AI-RUM untuk siswa, orang tua, guru, dan tim internal.",
  metadataBase: new URL(getSiteUrl())
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
