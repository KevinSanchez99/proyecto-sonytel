import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { loginRequest, logoutRequest, verifyTokenRequest } from "../api/auth.js";
import { AuthContext } from "./AuthContext";

export const AuthProvider = ({ children }) => {
    const queryClient = useQueryClient();
    const [errors, setErrors] = useState([]);

    const { data: user, isLoading: loading } = useQuery({
        queryKey: ['authUser'],
        queryFn: async () => {
            try {
                const res = await verifyTokenRequest();
                return res.data;
            } catch (error) {
                console.log("Ocurrio un error: ", error);
                return null; 
            }
        },
        retry: false, 
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
    });

    const loginMutation = useMutation({
        mutationFn: loginRequest,
        onSuccess: (res) => {
            queryClient.setQueryData(['authUser'], res.data.user);
            setErrors([]);
        },
        onError: (error) => {
            const mensajeError = error.response?.data?.message 
                            || error.response?.data 
                            || "Error al conectar con el servidor";
            setErrors([mensajeError]);
        }
    });

    const logoutMutation = useMutation({
        mutationFn: logoutRequest,
        onSuccess: () => {
            queryClient.setQueryData(['authUser'], null);
        },
        onError: (error) => {
            console.error("Error al cerrar sesión:", error);
        }
    });

    const isAuthenticated = !!user;

    return (
        <AuthContext.Provider 
            value={{
                user: user || null,
                isAuthenticated,
                loading,
                errors,
                signin: loginMutation.mutateAsync,
                logout: logoutMutation.mutate,
                isLoginLoading: loginMutation.isPending
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};