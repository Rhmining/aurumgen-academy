import { Navbar } from "@/components/public/navbar";
import { PublicFooter } from "@/components/public/footer";

export default function PublicLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="page-shell">
      <Navbar />
      {children}
      <PublicFooter />
    </div>
  );
}
