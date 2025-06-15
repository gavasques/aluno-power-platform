import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider"
import { Home } from "./pages/Home";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { Cadastros } from "./pages/admin/Cadastros";
import { UsersPage } from "./pages/admin/UsersPage";
import { Suporte } from "./pages/admin/Suporte";
import { Configuracoes } from "./pages/admin/Configuracoes";
import { AdminLayout } from "./components/layout/AdminLayout";
import { Auth } from "./pages/Auth";
import { Toaster } from "@/components/ui/toaster"
import { QueryClient } from 'react-query';
import { ProductPage } from "./pages/ProductPage";
import { ProductProvider } from "./contexts/ProductContext";
import { Materials } from "./pages/Materials";
import { MaterialsProvider } from "./contexts/MaterialsContext";
import { Tools } from "./pages/Tools";
import { ToolsProvider } from "./contexts/ToolsContext";
import { ContentManagement } from "./pages/admin/ContentManagement";
import { PartnersProvider } from "@/contexts/PartnersContext";
import { SuppliersProvider } from "@/contexts/SuppliersContext";

function App() {
  return (
    <QueryClient>
      <BrowserRouter>
        <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
          <PartnersProvider>
            <SuppliersProvider>
              <MaterialsProvider>
                <ProductProvider>
                  <ToolsProvider>
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/auth" element={<Auth />} />

                      <Route path="/admin" element={<AdminLayout />}>
                        <Route index element={<AdminDashboard />} />
                        <Route path="cadastros/:section?" element={<Cadastros />} />
                        <Route path="usuarios" element={<UsersPage />} />
                        <Route path="suporte" element={<Suporte />} />
                        <Route path="configuracoes/:section?" element={<Configuracoes />} />
                        <Route path="conteudo/:subsection?/:id?/:action?" element={<ContentManagement />} />
                      </Route>

                    </Routes>
                    <Toaster />
                  </ToolsProvider>
                </ProductProvider>
              </MaterialsProvider>
            </SuppliersProvider>
          </PartnersProvider>
        </ThemeProvider>
      </BrowserRouter>
    </QueryClient>
  );
}

export default App;
