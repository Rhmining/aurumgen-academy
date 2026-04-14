import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { getSiteUrl } from "@/lib/site-url";
import { appName } from "@/lib/constants";

export const metadata: Metadata = {
  title: {
    default: appName,
    template: `%s | ${appName}`
  },
  description: "Platform academy untuk jalur IGCSE, IB, parent support, teacher workflow, dan AI-RUM dalam satu ekosistem belajar.",
  metadataBase: new URL(getSiteUrl()),
  openGraph: {
    title: appName,
    description: "Platform academy untuk jalur IGCSE, IB, parent support, teacher workflow, dan AI-RUM dalam satu ekosistem belajar.",
    url: getSiteUrl(),
    siteName: appName,
    locale: "id_ID",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: appName,
    description: "Platform academy untuk jalur IGCSE, IB, parent support, teacher workflow, dan AI-RUM dalam satu ekosistem belajar."
  }
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
