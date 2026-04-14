import type { Metadata } from "next";
import { appName } from "@/lib/constants";
import { getSiteUrl } from "@/lib/site-url";

const defaultDescription =
  "Platform academy untuk jalur IGCSE, IB, parent support, teacher workflow, dan AI-RUM dalam satu ekosistem belajar.";

export function buildMetadata(input?: {
  title?: string;
  description?: string;
  path?: string;
  keywords?: string[];
}) {
  const title = input?.title ?? appName;
  const description = input?.description ?? defaultDescription;
  const path = input?.path ?? "/";
  const url = new URL(path, getSiteUrl()).toString();

  const metadata: Metadata = {
    title,
    description,
    keywords: input?.keywords ?? [
      "AURUMGEN Academy",
      "IGCSE",
      "IB",
      "AI tutor",
      "parent dashboard",
      "teacher workflow",
      "academy Indonesia"
    ],
    alternates: {
      canonical: url
    },
    openGraph: {
      title,
      description,
      url,
      siteName: appName,
      locale: "id_ID",
      type: "website"
    },
    twitter: {
      card: "summary_large_image",
      title,
      description
    }
  };

  return metadata;
}
