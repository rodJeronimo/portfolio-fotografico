import { AdminNav } from "@/components/admin/admin-nav";

// Layout compartilhado para todas as rotas /admin/* autenticadas.
// /admin/login não passa por aqui (fora deste segmento — ver
// docs/ADR/0006-admin-dashboard-navigation.md e
// docs/design/admin-dashboard.md).
export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <AdminNav />
      {children}
    </div>
  );
}
