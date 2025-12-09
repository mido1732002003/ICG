import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

const ImageUpload = ({ onImageSelect, isProcessing }) => {
    const [urlInput, setUrlInput] = useState('');
    const [showUrlInput, setShowUrlInput] = useState(false);

    const compressImage = (file, maxSizeKB = 2048) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let { width, height } = img;

                    const maxDim = 1920;
                    if (width > maxDim || height > maxDim) {
                        const ratio = Math.min(maxDim / width, maxDim / height);
                        width *= ratio;
                        height *= ratio;
                    }

                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    let quality = 0.9;
                    let result = canvas.toDataURL('image/jpeg', quality);

                    while (result.length > maxSizeKB * 1024 && quality > 0.1) {
                        quality -= 0.1;
                        result = canvas.toDataURL('image/jpeg', quality);
                    }

                    resolve(result);
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    };

    const onDrop = useCallback(async (acceptedFiles) => {
        if (acceptedFiles.length === 0) return;

        const file = acceptedFiles[0];
        const compressed = await compressImage(file);

        onImageSelect({
            type: 'file',
            data: compressed,
            name: file.name,
            preview: compressed,
        });
    }, [onImageSelect]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/jpeg': ['.jpg', '.jpeg'],
            'image/png': ['.png'],
            'image/webp': ['.webp'],
            'image/gif': ['.gif'],
        },
        maxFiles: 1,
        disabled: isProcessing,
    });

    const handleUrlSubmit = (e) => {
        e.preventDefault();
        if (!urlInput.trim()) return;

        onImageSelect({
            type: 'url',
            data: urlInput.trim(),
            name: 'URL Image',
            preview: urlInput.trim(),
        });
        setUrlInput('');
        setShowUrlInput(false);
    };

    const handlePaste = useCallback(async (e) => {
        const items = e.clipboardData?.items;
        if (!items) return;

        for (const item of items) {
            if (item.type.startsWith('image/')) {
                const file = item.getAsFile();
                if (file) {
                    const compressed = await compressImage(file);
                    onImageSelect({
                        type: 'clipboard',
                        data: compressed,
                        name: 'Pasted Image',
                        preview: compressed,
                    });
                }
                break;
            }
        }
    }, [onImageSelect]);

    return (
        <div className="space-y-4">
            {/* Drop Zone */}
            <div
                {...getRootProps()}
                onPaste={handlePaste}
                className={`
                    relative overflow-hidden rounded-2xl border-2 border-dashed p-10
                    transition-all duration-300 cursor-pointer group
                    ${isDragActive
                        ? 'border-primary-500 bg-primary-500/10 dropzone-active'
                        : 'border-dark-700 bg-dark-950/30 hover:border-primary-500/50 hover:bg-dark-900'
                    }
                    ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
                `}
            >
                <input {...getInputProps()} />

                {/* Scan Line Animation */}
                {isProcessing && (
                    <div className="absolute inset-0 pointer-events-none z-0">
                        <div className="w-full h-1 bg-gradient-to-r from-transparent via-primary-500 to-transparent animate-scan blur-sm opacity-70" />
                    </div>
                )}

                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none group-hover:opacity-[0.05] transition-opacity">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
                        backgroundSize: '20px 20px',
                    }} />
                </div>

                <div className="relative text-center z-10">
                    {/* Upload Icon */}
                    <div className={`
                        inline-flex items-center justify-center w-20 h-20 rounded-full mb-6
                        ${isDragActive ? 'bg-primary-500/20' : 'bg-dark-800 border border-dark-700'}
                        group-hover:scale-110 group-hover:shadow-neon
                        transition-all duration-300
                    `}>
                        <svg
                            className={`w-10 h-10 ${isDragActive || isProcessing ? 'text-primary-500' : 'text-dark-400 group-hover:text-primary-400'}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            {isProcessing ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" className="animate-spin origin-center" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            )}
                        </svg>
                    </div>

                    <h3 className="text-lg font-bold text-white mb-2 tracking-wide">
                        {isDragActive ? 'INITIATE UPLOAD' : 'INPUT SOURCE'}
                    </h3>
                    <p className="text-dark-400 text-sm mb-4 font-mono">
                        [DRAG DROP] • [CLICK] • [PASTE]
                    </p>
                    <div className="flex justify-center gap-2">
                        <span className="px-2 py-1 rounded bg-dark-800 text-xs font-mono text-dark-500 border border-dark-700">JPG</span>
                        <span className="px-2 py-1 rounded bg-dark-800 text-xs font-mono text-dark-500 border border-dark-700">PNG</span>
                    </div>
                </div>
            </div>

            {/* URL Input Toggle */}
            <div className="flex justify-center">
                <button
                    type="button"
                    onClick={() => setShowUrlInput(!showUrlInput)}
                    className="text-xs font-mono text-primary-500 hover:text-primary-400 flex items-center gap-2 tracking-wider uppercase transition-colors"
                    disabled={isProcessing}
                >
                    <span className="w-1.5 h-1.5 bg-primary-500 rounded-full" />
                    {showUrlInput ? 'ABORT URL INPUT' : 'SWITCH TO URL INPUT'}
                </button>
            </div>

            {/* URL Input Form */}
            {showUrlInput && (
                <form onSubmit={handleUrlSubmit} className="flex gap-2 animate-in fade-in slide-in-from-top-2">
                    <input
                        type="url"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        placeholder="https://source.com/image.jpg"
                        className="input-3d flex-1 font-mono text-sm"
                        disabled={isProcessing}
                    />
                    <button
                        type="submit"
                        className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!urlInput.trim() || isProcessing}
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </button>
                </form>
            )}
        </div>
    );
};

export default ImageUpload;
