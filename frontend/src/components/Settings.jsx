const Settings = ({ settings, onChange }) => {
    const styleOptions = [
        { value: 'short', label: 'Short', icon: '📝' },
        { value: 'detailed', label: 'Detailed', icon: '📄' },
        { value: 'alt', label: 'Alt Text', icon: '♿' },
        { value: 'creative', label: 'Creative', icon: '✨' },
    ];

    const toneOptions = [
        { value: 'professional', label: 'Pro', icon: '💼' },
        { value: 'casual', label: 'Casual', icon: '😊' },
        { value: 'funny', label: 'Fun', icon: '😄' },
    ];

    const lengthOptions = [
        { value: 50, label: 'Minimal (50)' },
        { value: 100, label: 'Balanced (100)' },
        { value: 150, label: 'Standard (150)' },
        { value: 250, label: 'Rich (250)' },
        { value: 500, label: 'Maximum (500)' },
    ];

    const toggleStyle = (style) => {
        const current = settings.styles || [];
        const updated = current.includes(style)
            ? current.filter(s => s !== style)
            : [...current, style];

        if (updated.length > 0) {
            onChange({ ...settings, styles: updated });
        }
    };

    return (
        <div className="space-y-6">
            {/* Caption Styles */}
            <div>
                <label className="block text-xs font-mono text-primary-400 mb-3 tracking-widest uppercase">
                    OUTPUT_FORMATS
                </label>
                <div className="grid grid-cols-2 gap-2">
                    {styleOptions.map(({ value, label, icon }) => {
                        const isSelected = settings.styles?.includes(value);
                        return (
                            <button
                                key={value}
                                type="button"
                                onClick={() => toggleStyle(value)}
                                className={`
                                    px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-300
                                    flex items-center gap-2 border
                                    ${isSelected
                                        ? 'bg-primary-600/20 border-primary-500 text-white shadow-[0_0_15px_rgba(249,115,22,0.3)]'
                                        : 'bg-dark-900 border-dark-700 text-dark-400 hover:border-dark-500 hover:text-dark-200'
                                    }
                                `}
                            >
                                <span className={isSelected ? 'text-shadow-glow' : ''}>{icon}</span>
                                {label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Tone */}
            <div>
                <label className="block text-xs font-mono text-primary-400 mb-3 tracking-widest uppercase">
                    NEURAL_TONE
                </label>
                <div className="flex flex-wrap gap-2">
                    {toneOptions.map(({ value, label, icon }) => {
                        const isSelected = settings.tone === value;
                        return (
                            <button
                                key={value}
                                type="button"
                                onClick={() => onChange({ ...settings, tone: value })}
                                className={`
                                    flex-1 px-3 py-2 rounded-lg font-medium text-xs transition-all duration-300
                                    flex items-center justify-center gap-2 border
                                    ${isSelected
                                        ? 'bg-primary-600 border-primary-500 text-white shadow-lg'
                                        : 'bg-dark-900 border-dark-700 text-dark-400 hover:bg-dark-800'
                                    }
                                `}
                            >
                                <span>{icon}</span>
                                {label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Max Length */}
            <div>
                <label className="block text-xs font-mono text-primary-400 mb-3 tracking-widest uppercase">
                    TOKEN_LIMIT
                </label>
                <div className="relative">
                    <select
                        value={settings.maxLength || 150}
                        onChange={(e) => onChange({ ...settings, maxLength: parseInt(e.target.value) })}
                        className="input-3d appearance-none cursor-pointer"
                    >
                        {lengthOptions.map(({ value, label }) => (
                            <option key={value} value={value} className="bg-dark-900 text-dark-100">
                                {label} characters
                            </option>
                        ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-primary-500">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
