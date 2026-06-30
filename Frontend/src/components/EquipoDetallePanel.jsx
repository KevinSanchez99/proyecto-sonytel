import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { X, Calendar, User, FileText, Wrench, UploadCloud, Image as ImageIcon, Loader2, CheckCircle, Clock, ShieldCheck, Camera } from "lucide-react";
import imageCompression from 'browser-image-compression';
import { obtenerFotosRequest, subirFotoRequest, eliminarFotoRequest } from "../api/fotos.api.js";
import { ImagenProtegida } from './ImagenProtegida';

export const EquipoDetallePanel = ({ equipo, onClose }) => {
    const isOpen = !!equipo;
    const queryClient = useQueryClient();
    const fileInputRef = useRef(null);
    const cameraInputRef = useRef(null);
    
    const [isDragging, setIsDragging] = useState(false);
    const [isCompressing, setIsCompressing] = useState(false);
    const [lightboxImage, setLightboxImage] = useState(null); 

    const { data: responseFotos, isLoading: cargandoFotos } = useQuery({
        queryKey: ['fotos', equipo?.id],
        queryFn: () => obtenerFotosRequest(equipo.id),
        enabled: !!equipo?.id, 
    });

    const fotos = responseFotos?.data || [];

    const subirFotoMutacion = useMutation({
        mutationFn: ({ id, formData }) => subirFotoRequest(id, formData),
        onSuccess: () => { queryClient.invalidateQueries(['fotos', equipo.id]); },
        onError: (error) => { alert(error.response?.data?.message || "Error al subir la imagen"); }
    });

    const eliminarFotoMutacion = useMutation({
        mutationFn: (fotoId) => eliminarFotoRequest(fotoId),
        onSuccess: () => { queryClient.invalidateQueries(['fotos', equipo.id]); },
        onError: () => { alert("Error al eliminar la imagen"); }
    });

    const procesarArchivo = async (files) => {
        if (!files || files.length === 0) return;
        try {
            setIsCompressing(true);
            const formData = new FormData();
            const promesasCompresion = Array.from(files).map(async (file) => {
                const compressed = await imageCompression(file, { maxSizeMB: 0.5, maxWidthOrHeight: 1280 });
                return compressed;
            });
            const archivosComprimidos = await Promise.all(promesasCompresion);
            archivosComprimidos.forEach(file => {
                formData.append('imagenes', file, file.name);
            });
            await subirFotoMutacion.mutateAsync({ id: equipo.id, formData });
        } catch (error) {
            alert("Error al procesar las imágenes: ", error);
        } finally {
            setIsCompressing(false);
        }
    };

    const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
    const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const files = e.dataTransfer.files;
        procesarArchivo(files);
    };
    const handleFileInput = (e) => {
        const files = e.target.files;
        procesarArchivo(files);
        e.target.value = null; 
    };

    return (
        <>
            {isOpen && <div className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm z-40 transition-opacity" onClick={onClose} />}

            <div className={`fixed inset-y-0 right-0 w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out border-l border-transparent dark:border-gray-800 ${isOpen ? 'translate-x-0' : 'translate-x-full'} overflow-y-auto`}>
                
                {equipo && (
                    <div className="flex flex-col h-full">
                        <div className="flex justify-between items-start p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/90 backdrop-blur-md sticky top-0 z-10 transition-colors">
                            <div>
                                <h2 className="text-xl font-bold text-gray-800 dark:text-white">{equipo.marca} {equipo.modelo}</h2>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    <span className="text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-200 dark:bg-gray-800 px-2 py-1 rounded-md">
                                        SN: {equipo.nro_serie || 'N/A'}
                                    </span>
                                    {equipo.estado === 'REPARADO' && (
                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                            <CheckCircle className="w-3.5 h-3.5" /> Reparado
                                        </span>
                                    )}
                                    {equipo.estado === 'PENDIENTE' && (
                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                                            <Clock className="w-3.5 h-3.5" /> Pendiente
                                        </span>
                                    )}
                                    {equipo.estado === 'DEVUELTO' && (
                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                                            <X className="w-3.5 h-3.5" /> Sin Arreglo
                                        </span>
                                    )}
                                    {equipo.meses_garantia_restantes > 0 && (
                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                            <ShieldCheck className="w-3.5 h-3.5" /> {equipo.meses_garantia_restantes} Meses Gtía.
                                        </span>
                                    )}
                                </div>
                            </div>
                            <button onClick={onClose} className="p-2 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6 flex-1">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-blue-50 dark:bg-blue-900/10 p-3 rounded-xl border border-blue-100 dark:border-blue-900/30">
                                    <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-1"><User className="w-4 h-4"/> <span className="text-xs font-bold uppercase">Cliente</span></div>
                                    <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm truncate" title={equipo.cliente?.nombre_completo}>{equipo.cliente?.nombre_completo}</p>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-100 dark:border-gray-800">
                                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1"><Calendar className="w-4 h-4"/> <span className="text-xs font-bold uppercase">Ingreso</span></div>
                                    <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm">{new Date(equipo.fecha_ingreso).toLocaleDateString('es-AR')}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800 pb-2 mb-2">
                                        <FileText className="w-4 h-4" /> <h3 className="font-bold text-sm">Diagnóstico Inicial</h3>
                                    </div>
                                    <p className="text-gray-700 dark:text-gray-300 text-sm bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl italic">"{equipo.diagnostico || 'N/A'}"</p>
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800 pb-2 mb-2">
                                        <Wrench className="w-4 h-4" /> <h3 className="font-bold text-sm">Trabajo Realizado</h3>
                                    </div>
                                    <p className="text-gray-700 dark:text-gray-300 text-sm bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl">{equipo.reparacion || 'N/A'}</p>
                                </div>
                            </div>
                            
                            <div className="border-t border-gray-100 dark:border-gray-800 pt-6 mt-6">
                                <h3 className="font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                                    <ImageIcon className="w-5 h-5 text-blue-600 dark:text-blue-500" /> Galería de Fotos
                                </h3>

                                {/* Botón "Tomar Foto" — solo en celular, abre la cámara directo */}
                                <button
                                    type="button"
                                    onClick={() => !isCompressing && !subirFotoMutacion.isPending && cameraInputRef.current.click()}
                                    disabled={isCompressing || subirFotoMutacion.isPending}
                                    className="md:hidden w-full mb-3 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors"
                                >
                                    <Camera className="w-5 h-5" />
                                    Tomar Foto
                                </button>
                                <input
                                    type="file"
                                    ref={cameraInputRef}
                                    onChange={handleFileInput}
                                    accept="image/*"
                                    capture="environment"
                                    className="hidden"
                                />

                                <div 
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    onClick={() => !isCompressing && !subirFotoMutacion.isPending && fileInputRef.current.click()}
                                    className={`mb-6 border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors flex flex-col items-center justify-center gap-2
                                        ${isDragging ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30 hover:bg-gray-100 dark:hover:bg-gray-800/50'}
                                        ${(isCompressing || subirFotoMutacion.isPending) ? 'opacity-50 cursor-not-allowed' : ''}
                                    `}
                                >
                                    <input 
                                        type="file" 
                                        ref={fileInputRef} 
                                        onChange={handleFileInput} 
                                        accept="image/*" 
                                        multiple
                                        className="hidden" 
                                    />
                                    
                                    {(isCompressing || subirFotoMutacion.isPending) ? (
                                        <>
                                            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Optimizando y subiendo...</p>
                                        </>
                                    ) : (
                                        <>
                                            <UploadCloud className={`w-8 h-8 ${isDragging ? 'text-blue-500' : 'text-gray-400 dark:text-gray-500'}`} />
                                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Arrastrá una imagen aquí o <span className="text-blue-600 dark:text-blue-400">hacé clic</span>
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-500">JPG, PNG, WEBP (se optimizará auto.)</p>
                                        </>
                                    )}
                                </div>

                                {cargandoFotos ? (
                                    <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">Cargando fotos...</div>
                                ) : fotos.length > 0 ? (
                                    <div className="grid grid-cols-2 gap-3">
                                        {fotos.map(foto => (
                                            <div onClick={() => setLightboxImage(foto.path)} key={foto.id} className="relative group rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 aspect-square shadow-sm">
                                                <ImagenProtegida 
                                                    src={`/fotos/ver/${encodeURIComponent(foto.path.split(/[\\/]/).pop())}`}
                                                    alt={foto.original_name}
                                                    className="w-full h-full object-cover"
                                                />
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        eliminarFotoMutacion.mutate(foto.id);
                                                    }}
                                                    className="absolute top-2 right-2 bg-red-500/80 hover:bg-red-600 text-white p-1.5 rounded-full opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-6 text-gray-500 dark:text-gray-400 text-sm bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800">
                                        No hay fotos registradas para este equipo.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
            
            {lightboxImage && (
                <div 
                    className="fixed inset-0 bg-black/90 z-60 flex items-center justify-center p-4"
                    onClick={() => setLightboxImage(null)}
                >
                    <button className="absolute top-4 right-4 text-white p-2" onClick={() => setLightboxImage(null)}>
                        <X className="w-8 h-8" />
                    </button>
                    
                    <ImagenProtegida 
                        src={`/fotos/ver/${lightboxImage.split(/[\\/]/).pop()}`} 
                        alt="Vista completa" 
                        className="max-w-full max-h-full object-contain"
                    />
                </div>
            )}
        </>
    );
};