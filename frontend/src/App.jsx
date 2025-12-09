import { useState } from 'react';
import toast from 'react-hot-toast';
import ImageUpload from './components/ImageUpload';
import CaptionDisplay from './components/CaptionDisplay';
import Settings from './components/Settings';
import History from './components/History';
import BatchProcessor from './components/BatchProcessor';
import captionApi from './services/api';

function App() {
    const [activeTab, setActiveTab] = useState('single');
    const [image, setImage] = useState(null);
    const [captions, setCaptions] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [historyOpen, setHistoryOpen] = useState(false);
    const [settings, setSettings] = useState({
        styles: ['short', 'detailed', 'alt'],
        tone: 'professional',
        maxLength: 150,
    });

    const handleImageSelect = async (selectedImage) => {
        setImage(selectedImage);
        setCaptions(null);
        setIsLoading(true);

        try {
            let response;
            if (selectedImage.type === 'url') {
                response = await captionApi.generateCaptionFromUrl(selectedImage.data, settings);
            } else {
                response = await captionApi.generateCaption(selectedImage.data, settings);
            }
            setCaptions(response);
            toast.success('System processed successfully!', {
                icon: '🚀',
                style: {
                    background: '#18181b',
                    color: '#fff',
                    border: '1px solid #f97316'
                }
            });
        } catch (err) {
            console.error('Caption error:', err);
            toast.error(err.response?.data?.detail || 'System Failure', {
                style: {
                    background: '#450a0a',
                    color: '#fca5a5',
                    border: '1px solid #7f1d1d'
                }
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegenerate = async () => {
        if (!image) return;
        await handleImageSelect(image);
    };

    const handleHistorySelect = (item) => {
        setCaptions({ captions: item.captions });
        setImage({
            type: 'history',
            data: item.thumbnail,
            name: 'History Image',
            preview: item.thumbnail.startsWith('http') ? item.thumbnail : null,
        });
        setHistoryOpen(false);
    };

    return (
        <div className="min-h-screen font-sans selection:bg-primary-500/30">
            {/* Dynamic Background Elements */}
            <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary-500/10 rounded-full blur-[100px] animate-pulse-slow" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary-900/10 rounded-full blur-[100px] animate-pulse-slow" style={{ animationDelay: '2s' }} />
            </div>

            {/* Header */}
            <header className="fixed top-0 w-full z-50 border-b border-white/5 bg-dark-950/80 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="relative group">
                            <div className="absolute inset-0 bg-primary-500 blur-md opacity-20 group-hover:opacity-40 transition-opacity" />
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-dark-800 to-dark-950 border border-white/10 flex items-center justify-center relative z-10">
                                <svg className="w-6 h-6 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-white/90">
                                VISION<span className="text-primary-500">_CORE</span>
                            </h1>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
                                <p className="text-xs font-mono text-primary-400 tracking-wider">SYSTEM ONLINE</p>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => setHistoryOpen(true)}
                        className="btn-ghost-3d flex items-center gap-3 text-sm"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        LOGS
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
                {/* Tabs */}
                <nav className="flex justify-center mb-12">
                    <div className="p-1.5 bg-dark-900/50 backdrop-blur-sm border border-white/5 rounded-2xl flex gap-2 shadow-2xl">
                        {['single', 'batch'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`
                                    px-8 py-3 rounded-xl font-medium transition-all duration-300 relative overflow-hidden
                                    ${activeTab === tab
                                        ? 'text-white shadow-lg'
                                        : 'text-dark-400 hover:text-white hover:bg-white/5'
                                    }
                                `}
                            >
                                {activeTab === tab && (
                                    <div className="absolute inset-0 bg-gradient-to-tr from-primary-600 to-primary-500 opacity-100" />
                                )}
                                <span className="relative z-10 flex items-center gap-2">
                                    {tab === 'single' ? (
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    ) : (
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                                        </svg>
                                    )}
                                    {tab === 'single' ? 'SINGLE PROCESSOR' : 'BATCH OPERATION'}
                                </span>
                            </button>
                        ))}
                    </div>
                </nav>

                {activeTab === 'single' ? (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        {/* Left Control Panel */}
                        <div className="lg:col-span-5 space-y-6">
                            <div className="card-3d p-6 border-l-4 border-l-primary-500">
                                <h2 className="text-sm font-mono text-primary-400 mb-4 tracking-widest uppercase flex items-center gap-2">
                                    <span className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
                                    Input Module
                                </h2>
                                <ImageUpload
                                    onImageSelect={handleImageSelect}
                                    isProcessing={isLoading}
                                />
                            </div>

                            <div className="card-3d p-6 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <svg className="w-24 h-24 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                                    </svg>
                                </div>
                                <h2 className="text-sm font-mono text-dark-400 mb-4 tracking-widest uppercase">Configuration</h2>
                                <Settings
                                    settings={settings}
                                    onChange={setSettings}
                                />
                            </div>
                        </div>

                        {/* Right Output Panel */}
                        <div className="lg:col-span-7">
                            <CaptionDisplay
                                image={image}
                                captions={captions}
                                isLoading={isLoading}
                                onRegenerate={handleRegenerate}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-1">
                            <div className="card-3d p-6 h-full">
                                <h2 className="text-sm font-mono text-dark-400 mb-6 tracking-widest uppercase">Global Config</h2>
                                <Settings
                                    settings={settings}
                                    onChange={setSettings}
                                />
                            </div>
                        </div>
                        <div className="lg:col-span-2">
                            <div className="card-3d p-8 min-h-[500px]">
                                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                                    <span className="p-2 rounded-lg bg-primary-500/10 text-primary-500">
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                        </svg>
                                    </span>
                                    BATCH OPERATION CENTER
                                </h3>
                                <BatchProcessor settings={settings} />
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="border-t border-white/5 bg-dark-950/50 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-6 py-8 text-center">
                    <p className="text-sm font-mono text-dark-500">
                        VISION_CORE SYSTEMS v2.0 <span className="mx-2 text-dark-700">|</span>
                        <span className="text-primary-500/80">SECURE CONNECTION ESTABLISHED</span>
                    </p>
                </div>
            </footer>

            <History
                isOpen={historyOpen}
                onClose={() => setHistoryOpen(false)}
                onSelectItem={handleHistorySelect}
            />
        </div>
    );
}

export default App;
