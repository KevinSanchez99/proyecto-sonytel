import { useState } from "react";
import { useAuth } from "../context/useAuth.js";
import { Wrench, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const LoginPage = () => {
    const { signin, errors, isLoginLoading } = useAuth();
    const navigate = useNavigate(); // 2. Inicializar esto
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await signin({ username, password });
            navigate("/");
        } catch (error) {
            console.log("Ocurrio un error: ", error)
        }
    };
    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-b from-blue-600 to-blue-800 p-4">
            
            <div className="w-full max-w-md bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-8 shadow-2xl">
                
                <div className="flex justify-center mb-6">
                    <div className="bg-white p-3 rounded-2xl shadow-lg">
                        <Wrench className="w-10 h-10 text-blue-600" />
                    </div>
                </div>
                
                <h2 className="text-2xl font-bold text-center text-white mb-8">
                    Gestión Sonytel
                </h2>

                {/* Mensajes de Error */}
                {errors.map((error, i) => (
                    <div key={i} className="bg-red-500/80 text-white p-3 rounded-lg mb-4 text-sm text-center">
                        {error}
                    </div>
                ))}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-blue-100 text-sm mb-1 ml-1">Usuario</label>
                        <input 
                            type="text" 
                            className="w-full bg-white/20 border border-white/10 text-white placeholder-blue-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/50"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-blue-100 text-sm mb-1 ml-1">Contraseña</label>
                        <div className="relative">
                            <input 
                                type={showPassword ? "text" : "password"} 
                                className="w-full bg-white/20 border border-white/10 text-white placeholder-blue-200 rounded-xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-white/50"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(prev => !prev)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-100 hover:text-white transition-colors"
                                tabIndex={-1}
                                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={isLoginLoading}
                        className="w-full bg-white text-blue-600 font-bold py-3 rounded-xl shadow-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
                    >
                        {isLoginLoading ? "Ingresando..." : "Iniciar Sesión"}
                    </button>
                </form>
            </div>
        </div>
    );
};