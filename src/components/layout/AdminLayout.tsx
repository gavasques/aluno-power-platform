
import { AdminHeader } from "@/components/layout/AdminHeader";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
