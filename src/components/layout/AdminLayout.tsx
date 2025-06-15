
import { AdminHeader } from "@/components/layout/AdminHeader";
import { AdminBreadcrumbs } from "@/components/admin/AdminBreadcrumbs";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-900">
      <AdminHeader />
      <AdminBreadcrumbs />
      <main className="flex-1 bg-slate-50 dark:bg-slate-900 min-h-[calc(100vh-120px)]">
        {children}
      </main>
    </div>
  );
}
