
import { AdminHeader } from "@/components/layout/AdminHeader";
import { AdminBreadcrumbs } from "@/components/admin/AdminBreadcrumbs";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-900 dark">
      <AdminHeader />
      <AdminBreadcrumbs />
      <main className="flex-1 bg-slate-800 min-h-[calc(100vh-120px)] p-6">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

