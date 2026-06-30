import { Outlet, Link, useLocation } from "react-router-dom";
import { Users, Wrench, LogOut, LayoutDashboard, Moon, Sun } from "lucide-react";
import { useAuth } from "../context/useAuth.js";
import { useState, useEffect } from "react";

export const MainLayout = () => {
    const { logout, user } = useAuth();
    const location = useLocation();
    
    const [isDarkMode, setIsDarkMode] = useState(() => {
        return localStorage.getItem("theme") === "dark";
    });

    useEffect(() => {
        document.documentElement.classList.toggle("dark", isDarkMode);
    }, [isDarkMode]);

    const toggleTheme = () => {
        const nuevoModo = !isDarkMode;

        setIsDarkMode(nuevoModo);

        localStorage.setItem(
            "theme",
            nuevoModo ? "dark" : "light"
        );
    };

    const isActive = (path) => location.pathname === path;

    const navItems = [
        { name: "Dashboard", path: "/", icon: LayoutDashboard },
        { name: "Clientes", path: "/clientes", icon: Users },
        { name: "Equipos", path: "/equipos", icon: Wrench },
    ];

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-950 text-gray-800 dark:text-gray-100 transition-colors duration-200">
            {/* Sidebar (Desktop) */}
            <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 shadow-sm transition-colors duration-200">
                <div className="p-6 flex items-center gap-3">
                    <div className="bg-blue-600 p-2 rounded-lg">
                        <Wrench className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xl font-bold text-gray-800 dark:text-white">Sonytel</span>
                </div>
                
                <nav className="flex-1 px-4 space-y-2 mt-4">
                    {navItems.map((item) => (
                        <Link 
                            key={item.path} 
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                                isActive(item.path) 
                                ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold" 
                                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                            }`}
                        >
                            <item.icon className="w-5 h-5" />
                            {item.name}
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-2">
                    {/* BOTÓN MODO OSCURO (Desktop) */}
                    <button 
                        onClick={toggleTheme}
                        className="flex w-full items-center gap-3 px-4 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                    >
                        {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        {isDarkMode ? "Modo Claro" : "Modo Oscuro"}
                    </button>

                    <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-500">
                        Usuario: <span className="font-semibold text-gray-700 dark:text-gray-300">{user?.username}</span>
                    </div>
                    
                    <button 
                        onClick={logout}
                        className="flex w-full items-center gap-3 px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        Cerrar Sesión
                    </button>
                </div>
            </aside>

            {/* Contenido Principal */}
            <main className="flex-1 flex flex-col h-screen overflow-y-auto">
                {/* Header Móvil */}
                <header className="md:hidden bg-blue-600 dark:bg-gray-900 text-white p-4 flex justify-between items-center shadow-md transition-colors duration-200 border-b dark:border-gray-800">
                    <div className="font-bold flex items-center gap-2">
                        <Wrench className="w-5 h-5 text-white dark:text-blue-500" /> Sonytel
                    </div>
                    <div className="flex items-center gap-3">
                        {/* BOTÓN MODO OSCURO (Móvil) */}
                        <button onClick={toggleTheme} className="p-2 bg-blue-700 dark:bg-gray-800 rounded-full">
                            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </button>
                        <button onClick={logout} className="p-2"><LogOut className="w-5 h-5" /></button>
                    </div>
                </header>

                <div className="p-4 md:p-8 pb-24 md:pb-8">
                    <Outlet /> 
                </div>
            </main>

            {/* Bottom Nav (Móvil) */}
            <nav className="md:hidden fixed bottom-0 w-full bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 flex justify-around p-3 pb-safe z-40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] transition-colors duration-200">
                {navItems.map((item) => (
                    <Link 
                        key={item.path} 
                        to={item.path}
                        className={`flex flex-col items-center p-2 rounded-lg min-w-16 ${
                            isActive(item.path) 
                            ? "text-blue-600 dark:text-blue-400" 
                            : "text-gray-500 dark:text-gray-400"
                        }`}
                    >
                        <item.icon className="w-6 h-6 mb-1" />
                        <span className="text-xs font-medium">{item.name}</span>
                    </Link>
                ))}
            </nav>
        </div>
    );
};