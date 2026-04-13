import { Navbar } from "@/components/public/navbar";

export default function PublicLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="page-shell">
      <Navbar />
      {children}
    </div>
  );
}
