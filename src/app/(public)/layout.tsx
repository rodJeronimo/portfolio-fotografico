import { SiteSidebar } from "@/components/site-sidebar";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="lg:flex">
      <SiteSidebar />
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
