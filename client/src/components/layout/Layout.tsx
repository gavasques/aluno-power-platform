
import { useLocation } from "wouter";
import { Header } from "@/components/layout/Header";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { UserBreadcrumbs } from "@/components/layout/UserBreadcrumbs";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [location] = useLocation();
  const isAdminRoute = location.startsWith("/admin");

  if (isAdminRoute) {
    return <AdminLayout>{children}</AdminLayout>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <UserBreadcrumbs />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
};

export default Layout;
