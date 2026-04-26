import Link from "next/link";
import { BrandLogo } from "@/components/public/brand-logo";

const footerGroups = [
  {
    title: "Program",
    links: [
      { href: "/programs", label: "Program Utama" },
      { href: "/pathway", label: "Academic Pathway" },
      { href: "/login", label: "Portal & Login" }
    ]
  },
  {
    title: "Informasi",
    links: [
      { href: "/contact", label: "Konsultasi Awal" },
      { href: "/privacy-policy", label: "Privacy Policy" },
      { href: "/terms", label: "Terms of Use" }
    ]
  }
];

export function PublicFooter() {
  return (
    <footer className="border-t border-black/5 bg-[rgba(var(--panel),0.55)]">
      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-10 lg:grid-cols-[1.3fr_0.7fr_0.7fr]">
        <div className="space-y-4">
          <BrandLogo />
          <p className="max-w-xl text-sm text-[rgb(var(--muted))]">
            Academy platform untuk keluarga yang ingin jalur belajar lebih jelas, pelaporan progres lebih rapi,
            dan dukungan AI-RUM yang menyatu dengan workflow guru serta knowledge base internal.
          </p>
          <div className="flex flex-wrap gap-3 text-sm text-[rgb(var(--muted))]">
            <span className="rounded-full border border-black/10 px-3 py-2">IGCSE</span>
            <span className="rounded-full border border-black/10 px-3 py-2">IB</span>
            <span className="rounded-full border border-black/10 px-3 py-2">University Readiness</span>
            <span className="rounded-full border border-black/10 px-3 py-2">AI-RUM</span>
          </div>
        </div>

        {footerGroups.map((group) => (
          <div key={group.title}>
            <p className="text-sm font-semibold">{group.title}</p>
            <div className="mt-4 space-y-3">
              {group.links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block text-sm text-[rgb(var(--muted))] transition hover:text-[rgb(var(--foreground))]"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="border-t border-black/5 px-6 py-4 text-center text-sm text-[rgb(var(--muted))]">
        © 2026 AURUMGEN Academy. Seluruh akses platform tetap tunduk pada kebijakan privasi dan penggunaan layanan.
      </div>
    </footer>
  );
}
