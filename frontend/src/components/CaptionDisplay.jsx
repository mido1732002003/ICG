import { useState } from 'react';
import toast from 'react-hot-toast';

const CaptionDisplay = ({ image, captions, isLoading, onRegenerate }) => {
    const [copiedField, setCopiedField] = useState(null);

    const copyToClipboard = async (text, field) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedField(field);
            toast.success('Copied to system clipboard');
            setTimeout(() => setCopiedField(null), 2000);
        } catch (err) {
            toast.error('Copy failed');
        }
    };

    const captionTypes = [
        {
            key: 'short',
            label: 'SOCIAL_SHORT',
            icon: '⚡',
            description: 'Optimized for feed velocity'
        },
        {
            key: 'detailed',
            label: 'FULL_ANALYSIS',
            icon: '🔍',
            description: 'Comprehensive visual decode'
        },
        {
            key: 'alt',
            label: 'ACCESSIBILITY',
            icon: '👁️',
            description: 'Screen reader optimized'
        },
        {
            key: 'creative',
            label: 'CREATIVE_MODE',
            icon: '✨',
            description: 'Abstract interpretation'
        },
    ];

    const SkeletonLoader = () => (
        <div className="space-y-4 animate-pulse">
            <div className="h-4 bg-primary-500/20 rounded w-3/4"></div>
            <div className="h-4 bg-primary-500/10 rounded w-full"></div>
            <div className="h-4 bg-primary-500/10 rounded w-2/3"></div>
        </div>
    );

    if (!image && !isLoading) {
        return (
            <div className="card-3d h-full flex flex-col items-center justify-center p-16 text-center border-dashed border-2 border-dark-700/50">
                <div className="w-24 h-24 rounded-full bg-dark-900 border border-dark-700 flex items-center justify-center mb-6 shadow-inner">
                    <svg className="w-10 h-10 text-dark-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                </div>
                <h3 className="text-xl font-mono text-dark-300 mb-2 tracking-wider">AWAITING INPUT</h3>
                <p className="text-dark-500 font-mono text-sm max-w-xs mx-auto">Upload visuals to initiate neural processing sequence</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-8">
            {/* Image Preview & Stats Header */}
            <div className="card-3d p-6 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500 via-purple-500 to-primary-500 opacity-50" />

                <div className="flex flex-col md:flex-row gap-6">
                    {/* Image */}
                    <div className="w-full md:w-1/3 relative rounded-xl overflow-hidden bg-dark-950 border border-white/10 shadow-lg">
                        {isLoading && !image ? (
                            <div className="aspect-video skeleton"></div>
                        ) : image ? (
                            <>
                                <img
                                    src={image.preview}
                                    alt="Analysis Target"
                                    className="w-full h-full object-cover min-h-[200px]"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-dark-950/90 to-transparent flex flex-col justify-end p-4">
                                    <span className="text-xs font-mono text-primary-400 mb-1">TARGET_ID</span>
                                    <span className="text-sm font-bold text-white truncate">{image.name}</span>
                                </div>
                            </>
                        ) : null}
                    </div>

                    {/* Meta & Actions */}
                    <div className="flex-1 flex flex-col justify-between">
                        <div>
                            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                ANALYSIS RESULT
                                {isLoading && <span className="inline-block w-2 h-2 rounded-full bg-primary-500 animate-pulse" />}
                            </h3>

                            {captions?.metadata && (
                                <div className="grid grid-cols-2 gap-3 mb-6">
                                    <div className="p-3 rounded-lg bg-dark-900/50 border border-dark-700/50">
                                        <div className="text-xs text-dark-400 font-mono mb-1">LATENCY</div>
                                        <div className="text-primary-400 font-mono text-lg">{captions.metadata.processing_time?.toFixed(3)}s</div>
                                    </div>
                                    <div className="p-3 rounded-lg bg-dark-900/50 border border-dark-700/50">
                                        <div className="text-xs text-dark-400 font-mono mb-1">MODEL</div>
                                        <div className="text-primary-400 font-mono text-lg">{captions.metadata.model_used?.split('/').pop() || 'BLIP_V2'}</div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {image && !isLoading && (
                            <button
                                onClick={onRegenerate}
                                className="btn-secondary w-full flex items-center justify-center gap-2 group/btn relative overflow-hidden"
                            >
                                <span className="relative z-10 flex items-center gap-2">
                                    <svg className="w-4 h-4 group-hover/btn:rotate-180 transition-transform duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    RE-INITIALIZE SCAN
                                </span>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Captions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {captionTypes.map(({ key, label, icon, description }, index) => {
                    const captionText = captions?.captions?.[key];
                    const hasCaptioned = captionText !== undefined && captionText !== null;

                    return (
                        <div
                            key={key}
                            className="card-3d p-6 hover:-translate-y-1 transition-transform duration-300"
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl filter drop-shadow-glow">{icon}</span>
                                    <div>
                                        <h4 className="font-bold text-white font-mono tracking-wide text-sm">{label}</h4>
                                        <span className="text-xs text-dark-400 font-mono block mt-0.5">{description}</span>
                                    </div>
                                </div>
                                {hasCaptioned && !isLoading && (
                                    <button
                                        onClick={() => copyToClipboard(captionText, key)}
                                        className={`
                                            p-2 rounded-lg transition-all duration-200
                                            ${copiedField === key
                                                ? 'bg-green-500/20 text-green-400'
                                                : 'hover:bg-primary-500/20 text-dark-400 hover:text-primary-400'
                                            }
                                        `}
                                    >
                                        {copiedField === key ? (
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        ) : (
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                            </svg>
                                        )}
                                    </button>
                                )}
                            </div>

                            <div className="relative min-h-[80px]">
                                {isLoading ? (
                                    <SkeletonLoader />
                                ) : hasCaptioned ? (
                                    <p className="text-dark-200 leading-relaxed font-sans text-sm border-l-2 border-primary-500/30 pl-3">
                                        {captionText}
                                    </p>
                                ) : (
                                    <div className="flex items-center justify-center h-full opacity-30">
                                        <span className="text-xs font-mono">NO_DATA</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default CaptionDisplay;
