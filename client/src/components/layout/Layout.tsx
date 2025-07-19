
import { useLocation } from "wouter";
import { Header } from "@/components/layout/Header";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { UserBreadcrumbs } from "@/components/layout/UserBreadcrumbs";
import { Footer } from "@/components/layout/Footer";

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
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <UserBreadcrumbs />
      <main className="flex-1">
        {children}
      </main>
      <Footer variant="internal" />
    </div>
  );
};

export default Layout;
