
import { Header } from "./Header"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col w-full">
      <Header />
      <main className="flex-1 p-4 bg-gray-50">
        {children}
      </main>
    </div>
  );
}
