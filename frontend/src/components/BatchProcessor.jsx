import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import captionApi from '../services/api';

const BatchProcessor = ({ settings }) => {
    const [images, setImages] = useState([]);
    const [results, setResults] = useState([]);
    const [processing, setProcessing] = useState(false);
    const [progress, setProgress] = useState(0);

    const compressImage = (file) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const maxDim = 1280;
                    let { width, height } = img;

                    if (width > maxDim || height > maxDim) {
                        const ratio = Math.min(maxDim / width, maxDim / height);
                        width *= ratio;
                        height *= ratio;
                    }

                    canvas.width = width;
                    canvas.height = height;
                    canvas.getContext('2d').drawImage(img, 0, 0, width, height);
                    resolve(canvas.toDataURL('image/jpeg', 0.8));
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    };

    const onDrop = useCallback(async (acceptedFiles) => {
        const newImages = await Promise.all(
            acceptedFiles.map(async (file) => ({
                id: Math.random().toString(36).substr(2, 9),
                file,
                name: file.name,
                preview: URL.createObjectURL(file),
                data: await compressImage(file),
                status: 'pending',
            }))
        );
        setImages(prev => [...prev, ...newImages]);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/jpeg': ['.jpg', '.jpeg'],
            'image/png': ['.png'],
            'image/webp': ['.webp'],
        },
        disabled: processing,
    });

    const removeImage = (id) => {
        setImages(prev => prev.filter(img => img.id !== id));
        setResults(prev => prev.filter(r => r.id !== id));
    };

    const processBatch = async () => {
        if (images.length === 0) return;

        setProcessing(true);
        setProgress(0);
        setResults([]);

        const batchResults = [];

        for (let i = 0; i < images.length; i++) {
            const image = images[i];
            setImages(prev => prev.map(img =>
                img.id === image.id ? { ...img, status: 'processing' } : img
            ));

            try {
                const response = await captionApi.generateCaption(image.data, {
                    styles: settings.styles,
                    tone: settings.tone,
                    maxLength: settings.maxLength,
                });

                batchResults.push({
                    id: image.id,
                    name: image.name,
                    captions: response.captions,
                    success: true,
                });

                setImages(prev => prev.map(img =>
                    img.id === image.id ? { ...img, status: 'done' } : img
                ));
            } catch (err) {
                batchResults.push({
                    id: image.id,
                    name: image.name,
                    error: err.message,
                    success: false,
                });

                setImages(prev => prev.map(img =>
                    img.id === image.id ? { ...img, status: 'error' } : img
                ));
            }

            setProgress(((i + 1) / images.length) * 100);
        }

        setResults(batchResults);
        setProcessing(false);

        const successCount = batchResults.filter(r => r.success).length;
        toast.success(`Operations complete: ${successCount}/${images.length} resolved`);
    };

    const downloadResults = () => {
        const data = results.map(r => ({
            filename: r.name,
            ...r.captions,
        }));

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `BATCH_EXPORT_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const downloadCSV = () => {
        const headers = ['filename', 'short', 'detailed', 'alt', 'creative'];
        const rows = results.map(r => [
            r.name,
            r.captions?.short || '',
            r.captions?.detailed || '',
            r.captions?.alt || '',
            r.captions?.creative || '',
        ]);

        const csv = [headers, ...rows].map(row =>
            row.map(cell => `"${(cell || '').replace(/"/g, '""')}"`).join(',')
        ).join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `BATCH_EXPORT_${Date.now()}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-6">
            {/* Drop Zone */}
            <div
                {...getRootProps()}
                className={`
                    rounded-xl border-2 border-dashed p-8 text-center cursor-pointer
                    transition-all duration-300 relative overflow-hidden group
                    ${isDragActive
                        ? 'border-primary-500 bg-primary-500/10'
                        : 'border-dark-700 bg-dark-950/50 hover:border-primary-500/50 hover:bg-dark-900'
                    }
                    ${processing ? 'opacity-50 cursor-not-allowed' : ''}
                `}
            >
                <input {...getInputProps()} />
                <div className="absolute inset-0 opacity-10 pointer-events-none bg-grid" />
                <svg className="w-12 h-12 mx-auto mb-3 text-dark-400 group-hover:text-primary-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-dark-300 font-mono text-sm tracking-wide">BATCH_INPUT_SEQUENCE</p>
                <p className="text-xs text-dark-500 mt-1">Initialize multi-file processing grid</p>
            </div>

            {/* Image Queue */}
            {images.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h4 className="text-xs font-mono text-primary-400 tracking-widest uppercase flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
                            Processing Queue ({images.length})
                        </h4>
                        <button
                            onClick={() => { setImages([]); setResults([]); }}
                            className="text-xs text-red-400 hover:text-red-300 font-mono uppercase hover:underline"
                            disabled={processing}
                        >
                            Purge All Data
                        </button>
                    </div>

                    {/* Progress Bar */}
                    {processing && (
                        <div className="relative h-2 bg-dark-800 rounded-full overflow-hidden">
                            <div
                                className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary-600 to-primary-400 transition-all duration-300 shadow-[0_0_10px_rgba(249,115,22,0.5)]"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    )}

                    {/* Image Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                        {images.map(image => (
                            <div
                                key={image.id}
                                className={`
                                    relative rounded-lg overflow-hidden border bg-dark-900 group
                                    ${image.status === 'done' ? 'border-green-500/50 shadow-[0_0_10px_rgba(34,197,94,0.2)]' :
                                        image.status === 'error' ? 'border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.2)]' :
                                            image.status === 'processing' ? 'border-primary-500 shadow-[0_0_15px_rgba(249,115,22,0.3)]' :
                                                'border-dark-700 hover:border-dark-500'}
                                    transition-all duration-300
                                `}
                            >
                                <img
                                    src={image.preview}
                                    alt={image.name}
                                    className="w-full aspect-square object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                />

                                {/* Status Overlay */}
                                {image.status === 'processing' && (
                                    <div className="absolute inset-0 bg-dark-950/80 flex items-center justify-center backdrop-blur-sm">
                                        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                                    </div>
                                )}

                                {/* Remove Button */}
                                {!processing && (
                                    <button
                                        onClick={() => removeImage(image.id)}
                                        className="absolute top-1 right-1 w-6 h-6 bg-dark-950/80 text-dark-400 hover:text-red-400 rounded-full flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100 backdrop-blur-sm"
                                    >
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-3 pt-4 border-t border-dark-700/50">
                        <button
                            onClick={processBatch}
                            disabled={processing || images.length === 0}
                            className="btn-neon flex-1 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {processing ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    EXECUTING...
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                    WIZARD EXECUTE
                                </>
                            )}
                        </button>

                        {results.length > 0 && (
                            <>
                                <button onClick={downloadResults} className="btn-ghost-3d">
                                    JSON
                                </button>
                                <button onClick={downloadCSV} className="btn-ghost-3d">
                                    CSV
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default BatchProcessor;
