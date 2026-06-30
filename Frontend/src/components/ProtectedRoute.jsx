import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/useAuth.js";

export const ProtectedRoute = () => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <p className="text-lg font-semibold text-gray-600">Verificando sesión...</p>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};