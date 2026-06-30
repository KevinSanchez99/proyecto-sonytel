/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';
import { instance } from '../api/auth'; 

export const ImagenProtegida = ({ src, alt, className }) => {
    const [imageSrc, setImageSrc] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        const fetchImage = async () => {
            try {
                const response = await instance.get(src, { responseType: 'blob' });
                
                if (isMounted) {
                    const url = URL.createObjectURL(response.data);
                    setImageSrc(url);
                }
            } catch (error) {
                console.error("Error cargando imagen protegida:", error.response?.status, error);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchImage();
        return () => {
            isMounted = false;
            if (imageSrc) URL.revokeObjectURL(imageSrc);
        };
    }, [src]);

    if (loading) return <div className={`animate-pulse bg-gray-200 ${className}`}></div>;
    if (!imageSrc) return <div className={`bg-red-50 flex items-center justify-center ${className} text-red-500`}>X</div>;

    return <img src={imageSrc} alt={alt} className={className} />;
};