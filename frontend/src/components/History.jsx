import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import captionApi from '../services/api';

const History = ({ isOpen, onClose, onSelectItem }) => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            loadHistory();
        }
    }, [isOpen]);

    const loadHistory = async () => {
        setLoading(true);
        try {
            const data = await captionApi.getHistory(50, 0);
            setHistory(data.items || []);
        } catch (err) {
            toast.error('Failed to access neural archives');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleFavorite = async (imageId, e) => {
        e.stopPropagation();
        try {
            await captionApi.toggleFavorite(imageId);
            setHistory(prev => prev.map(item =>
                item.image_id === imageId
                    ? { ...item, is_favorite: !item.is_favorite }
                    : item
            ));
        } catch (err) {
            toast.error('Protocol failed');
        }
    };

    const handleDelete = async (imageId, e) => {
        e.stopPropagation();
        try {
            await captionApi.deleteHistoryItem(imageId);
            setHistory(prev => prev.filter(item => item.image_id !== imageId));
            toast.success('Record purged');
        } catch (err) {
            toast.error('Purge failed');
        }
    };

    const handleClearAll = async () => {
        if (!confirm('EXECUTE FULL ARCHIVE PURGE?')) return;
        try {
            await captionApi.clearHistory();
            setHistory([]);
            toast.success('Archives formatted');
        } catch (err) {
            toast.error('Format failed');
        }
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            month: 'numeric',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).replace(',', '');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-end">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-dark-950/90 backdrop-blur-md"
                onClick={onClose}
            />

            {/* Panel */}
            <div className="relative w-full max-w-md h-full bg-dark-950 border-l border-primary-500/20 shadow-[0_0_50px_rgba(249,115,22,0.1)] flex flex-col animate-slide-left overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full blur-3xl -z-10" />
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-500/5 rounded-full blur-3xl -z-10" />

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/5 relative">
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary-500/50 to-transparent" />

                    <h2 className="text-xl font-bold text-white flex items-center gap-3 tracking-wider">
                        <span className="text-primary-500">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </span>
                        LOG_ARCHIVES
                    </h2>
                    <div className="flex items-center gap-2">
                        {history.length > 0 && (
                            <button
                                onClick={handleClearAll}
                                className="btn-ghost-3d text-xs text-red-400 hover:text-red-300 uppercase font-mono px-3 py-1"
                            >
                                PURGE_ALL
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg hover:bg-white/5 text-dark-400 hover:text-white transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-primary-900 scrollbar-track-transparent">
                    {loading ? (
                        <div className="space-y-4">
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className="h-24 rounded-xl bg-dark-900/50 animate-pulse border border-white/5" />
                            ))}
                        </div>
                    ) : history.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-50">
                            <div className="w-20 h-20 rounded-full bg-dark-900 border-2 border-dashed border-dark-700 flex items-center justify-center mb-6">
                                <svg className="w-8 h-8 text-dark-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                            </div>
                            <p className="text-dark-300 font-mono tracking-widest text-sm">ARCHIVES_EMPTY</p>
                            <p className="text-dark-500 text-xs mt-2">No neural data recorded</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {history.map(item => (
                                <div
                                    key={item.image_id}
                                    onClick={() => onSelectItem(item)}
                                    className="group relative p-3 rounded-xl bg-dark-900/40 hover:bg-dark-800 border-l-2 border-transparent hover:border-primary-500 cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-black/20"
                                >
                                    <div className="flex gap-4">
                                        {/* Thumbnail */}
                                        <div className="relative w-20 h-20 rounded-lg bg-dark-950 overflow-hidden flex-shrink-0 border border-white/5 group-hover:border-primary-500/30 transition-colors">
                                            {item.thumbnail.startsWith('http') ? (
                                                <img
                                                    src={item.thumbnail}
                                                    alt=""
                                                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-dark-500">
                                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                                            <div>
                                                <p className="text-sm font-medium text-dark-200 truncate group-hover:text-primary-200 transition-colors font-sans">
                                                    {item.captions?.short || item.captions?.alt || 'Processing Error'}
                                                </p>
                                                <p className="text-xs text-dark-500 font-mono mt-1">
                                                    ID: {item.image_id.substring(0, 8)}...
                                                </p>
                                            </div>
                                            <div className="flex items-center justify-between mt-2">
                                                <span className="text-[10px] text-dark-500 font-mono bg-dark-800/50 px-2 py-0.5 rounded">
                                                    {formatDate(item.timestamp)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0">
                                            <button
                                                onClick={(e) => handleToggleFavorite(item.image_id, e)}
                                                className={`p-1.5 rounded-lg transition-colors ${item.is_favorite
                                                    ? 'text-yellow-400 bg-yellow-400/10'
                                                    : 'text-dark-400 hover:text-yellow-400 hover:bg-dark-800'
                                                    }`}
                                                title="Favorite"
                                            >
                                                <svg className="w-4 h-4" fill={item.is_favorite ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={(e) => handleDelete(item.image_id, e)}
                                                className="p-1.5 rounded-lg text-dark-400 hover:text-red-400 hover:bg-dark-800 transition-colors"
                                                title="Delete"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                @keyframes slide-left {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                .animate-slide-left {
                    animation: slide-left 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                }
            `}</style>
        </div>
    );
};

export default History;
