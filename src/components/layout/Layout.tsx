
import { Header } from "./Header"
import { SidebarNav } from "./SidebarNav"
import { cn } from "@/lib/utils";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative h-screen overflow-hidden flex flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <aside className={cn("hidden md:block w-72 border-r overflow-y-auto")}>
          <SidebarNav />
        </aside>
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8 pt-6">
          {children}
        </main>
      </div>
    </div>
  );
}
