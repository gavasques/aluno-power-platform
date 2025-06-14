
import { Header } from "./Header"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="w-full px-4 py-6">
        {children}
      </main>
    </div>
  );
}
