import axios from 'axios';

const API = 'http://localhost:3000/api';

export const instance = axios.create({
    baseURL: API,
    withCredentials: true
});

export const refreshTokenRequest = () => instance.post('/auth/refresh'); 

instance.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        if (
            error.response?.status === 401 && 
            !originalRequest._retry && 
            !originalRequest.url.includes('/login') && 
            !originalRequest.url.includes('/refresh')
        ) {
            originalRequest._retry = true;

            try {
                await refreshTokenRequest();
                return instance(originalRequest);
            } catch (refreshError) {
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export const loginRequest = user => instance.post('/auth/login', user);
export const logoutRequest = () => instance.post('/auth/logout');
export const verifyTokenRequest = () => instance.post('/auth/verify');
