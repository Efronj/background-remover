import React, { useState } from 'react';
import ReactBeforeSliderComponent from 'react-before-after-slider-component';
import 'react-before-after-slider-component/dist/build.css';
import { Download, Edit3, Image as ImageIcon, X } from 'lucide-react';

const ResultView = ({ images, onReset }) => {
    const [selectedBg, setSelectedBg] = useState('transparent');

    const originalImageUrl = images[0]?.url;
    const resultImageUrl = images[0]?.resultUrl || images[0]?.url;

    const backgrounds = [
        { id: 'transparent', name: 'Transparent', style: { background: 'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAMUlEQVQ4T2NkYNgfQEhD/oMBQxkYGGYgMwiMw4hQDEyHwYvR1TAyYNSNwwbDiEA1AAACpS4vI9o/bQAAAABJRU5ErkJggg==") repeat' }, value: 'transparent' },
        { id: 'white', name: 'White', style: { backgroundColor: '#ffffff' }, value: '#ffffff' },
        { id: 'black', name: 'Black', style: { backgroundColor: '#000000' }, value: '#000000' },
        { id: 'blue', name: 'Blue', style: { backgroundColor: '#3b82f6' }, value: '#3b82f6' },
        { id: 'pink', name: 'Pink', style: { backgroundColor: '#ec4899' }, value: '#ec4899' },
        { id: 'gradient', name: 'Gradient', style: { background: 'linear-gradient(135deg, #6366f1 0%, #f472b6 100%)' }, value: 'linear-gradient(135deg, #6366f1 0%, #f472b6 100%)' },
    ];

    const handleDownload = async (format) => {
        if (!resultImageUrl) return;

        try {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.src = resultImageUrl;

            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
            });

            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');

            const activeBg = backgrounds.find(b => b.id === selectedBg);

            if (format === 'jpg' || (format === 'png' && selectedBg !== 'transparent')) {
                if (selectedBg === 'gradient') {
                    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
                    gradient.addColorStop(0, '#6366f1');
                    gradient.addColorStop(1, '#f472b6');
                    ctx.fillStyle = gradient;
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                } else if (activeBg && activeBg.value !== 'transparent') {
                    ctx.fillStyle = activeBg.value;
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                } else if (format === 'jpg') {
                    // Default white background for JPG if transparent is selected
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                }
            }

            ctx.drawImage(img, 0, 0);

            const dataUrl = canvas.toDataURL(`image/${format}`, format === 'jpg' ? 0.9 : 1.0);
            const link = document.createElement('a');
            link.download = `background-removed-${Date.now()}.${format}`;
            link.href = dataUrl;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

        } catch (error) {
            console.error("Download failed:", error);
            alert("Failed to download image.");
        }
    };

    return (
        <div className="container" style={{ padding: '2rem 1rem' }}>
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-primary">Your Result</h2>
                <button onClick={onReset} className="btn btn-secondary" style={{ width: '2.5rem', height: '2.5rem', padding: 0, borderRadius: '50%' }}>
                    <X size={20} />
                </button>
            </div>

            <div className="result-layout">

                {/* Main Image Area */}
                <div className="glass-panel result-image-pane" style={{ position: 'relative', overflow: 'hidden', minHeight: '70vh', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255, 255, 255, 0.03)' }}>
                    {/* Background Layer (applies to the result) */}
                    <div style={{ position: 'absolute', inset: 0, zIndex: 0, transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)', ...backgrounds.find(b => b.id === selectedBg)?.style }}></div>

                    <div className="before-after-wrapper" style={{ position: 'relative', zIndex: 10, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
                        <div style={{ width: '100%', maxWidth: '800px', maxHeight: '100%', borderRadius: '1rem', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                            <ReactBeforeSliderComponent
                                firstImage={{ imageUrl: originalImageUrl }}
                                secondImage={{ imageUrl: resultImageUrl }}
                                style={{ width: '100%', height: 'auto', display: 'block' }}
                            />
                        </div>
                    </div>
                </div>

                {/* Sidebar Controls */}
                <div className="flex flex-col gap-6">
                    <div className="glass-panel" style={{ padding: '1.5rem' }}>
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-primary">
                            <Download size={20} className="text-indigo" /> Download
                        </h3>
                        <div className="flex flex-col gap-4">
                            <button onClick={() => handleDownload('png')} className="btn btn-primary w-full justify-between gap-4">
                                <span className="flex items-center gap-2">PNG <span style={{ fontSize: '0.75rem', opacity: 0.7, fontWeight: 'normal' }}>Transparent</span></span>
                                <Download size={16} />
                            </button>
                            <button onClick={() => handleDownload('jpeg')} className="btn btn-secondary w-full justify-between gap-4">
                                <span className="flex items-center gap-2">JPG <span style={{ fontSize: '0.75rem', opacity: 0.7, fontWeight: 'normal' }}>White Bg</span></span>
                                <Download size={16} />
                            </button>
                        </div>
                    </div>

                    <div className="glass-panel" style={{ padding: '1.5rem' }}>
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-primary">
                            <Edit3 size={20} className="text-pink" /> Background
                        </h3>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
                            {backgrounds.map(bg => (
                                <button
                                    key={bg.id}
                                    onClick={() => setSelectedBg(bg.id)}
                                    title={bg.name}
                                    style={{
                                        width: '100%', aspectRatio: '1/1', borderRadius: '0.5rem', border: '2px solid', transition: 'all 0.2s',
                                        borderColor: selectedBg === bg.id ? '#6366f1' : 'var(--card-border)',
                                        transform: selectedBg === bg.id ? 'scale(1.1)' : 'scale(1)',
                                        ...bg.style
                                    }}
                                />
                            ))}
                            <button
                                title="Custom Image"
                                style={{ width: '100%', aspectRatio: '1/1', borderRadius: '0.5rem', border: '2px dashed var(--card-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', transition: 'colors 0.2s', ...backgrounds[0].style, cursor: 'pointer' }}
                            >
                                <ImageIcon size={20} />
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ResultView;
