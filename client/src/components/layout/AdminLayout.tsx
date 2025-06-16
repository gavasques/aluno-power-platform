
import { AdminHeader } from "@/components/layout/AdminHeader";
import { AdminBreadcrumbs } from "@/components/admin/AdminBreadcrumbs";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />
      <AdminBreadcrumbs />
      <main className="flex-1 bg-background min-h-[calc(100vh-120px)] p-6">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
