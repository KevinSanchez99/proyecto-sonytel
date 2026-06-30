import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { LoginPage } from "./pages/LoginPage";
import { MainLayout } from "./layouts/MainLayout";
import { ClientesPage } from "./pages/ClientesPage";
import { EquiposPage } from "./pages/EquiposPage";
import { DashboardPage } from "./pages/DashboardPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas Públicas */}
        <Route path="/login" element={<LoginPage />} />

        {/* Rutas Protegidas */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/clientes" element={<ClientesPage />} />
            <Route path="/equipos" element={<EquiposPage />} />
          </Route>
        </Route>

        {/* Ruta 404 para URLs inexistentes */}
        <Route path="*" element={
          <div className="p-10 text-center text-2xl font-bold text-gray-600">
            404 - Página no encontrada
          </div>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;