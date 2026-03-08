import React, { useState } from 'react';
import Hero from '../components/Hero';
import Features from '../components/Features';
import HowItWorks from '../components/HowItWorks';
import Testimonials from '../components/Testimonials';
import Pricing from '../components/Pricing';
import ResultView from '../components/ResultView';

const Home = () => {
    const [images, setImages] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);

    const resizeImage = (url, maxWidth = 800) => { // Aggressive resizing for speed
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = url;
            img.onerror = () => reject(new Error("Failed to load image for resizing"));
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > maxWidth) {
                        height *= maxWidth / width;
                        width = maxWidth;
                    }
                } else {
                    if (height > maxWidth) {
                        width *= maxWidth / height;
                        height = maxWidth;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'low';
                ctx.drawImage(img, 0, 0, width, height);
                canvas.toBlob((blob) => {
                    if (blob) {
                        resolve(URL.createObjectURL(blob));
                    } else {
                        reject(new Error("Internal resize error: No blob created"));
                    }
                }, 'image/png');
            };
        });
    };

    const handleFileUpload = async (files) => {
        if (!files || files.length === 0) return;

        const fileArray = Array.from(files).map(file => ({
            file,
            url: URL.createObjectURL(file),
            originalName: file.name
        }));

        setImages(fileArray);
        setIsProcessing(true);
        setProgress(0);

        try {
            const { removeBackground } = await import('@imgly/background-removal');
            const processedImages = [];

            // Process sequentially for stable progress tracking
            for (let i = 0; i < fileArray.length; i++) {
                const imgObj = fileArray[i];

                // Resize for performance before sending to AI
                // We use the resized version for BOTH original and result so the slider matches
                const resizedUrl = await resizeImage(imgObj.url);

                const blob = await removeBackground(resizedUrl, {
                    model: "isnet_fp16", // Reliable performance model
                    device: "gpu", // Attempt to use GPU if available
                    progress: (key, current, total) => {
                        const p = Math.round((current / total) * 100);
                        const totalProgress = Math.round(((i * 100) + p) / fileArray.length);
                        setProgress(totalProgress);
                    }
                });

                const resultUrl = URL.createObjectURL(blob);
                processedImages.push({
                    ...imgObj,
                    url: resizedUrl, // Update to resized URL so slider matches
                    resultUrl
                });

                // Done with one image, update progress to next step
                setProgress(Math.round(((i + 1) * 100) / fileArray.length));
                // We don't revoke resizedUrl here anymore because it's being used in state
            }

            setImages(processedImages);
        } catch (error) {
            console.error("AI Background Removal Error:", error);
            alert(`AI Processing Error: ${error.message || "Failed to remove background"}. \n\nTip: Try a smaller image or refresh the page.`);
        } finally {
            setIsProcessing(false);
            setProgress(0);
        }
    };

    const handleReset = () => {
        images.forEach(img => URL.revokeObjectURL(img.url));
        setImages([]);
        setProgress(0);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="w-full">
            {images.length === 0 ? (
                <>
                    <Hero onFileUpload={handleFileUpload} />
                    <Features />
                    <HowItWorks />
                    <Pricing />
                </>
            ) : (
                <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
                    {isProcessing ? (
                        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(10, 10, 15, 0.9)', backdropFilter: 'blur(10px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
                            <div style={{ position: 'relative', width: '15rem', height: '15rem', marginBottom: '3rem' }}>
                                {/* Progress Ring */}
                                <svg style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)', filter: 'drop-shadow(0 0 10px rgba(99, 102, 241, 0.5))' }} width="100%" height="100%" viewBox="0 0 100 100">
                                    <circle cx="50" cy="50" r="45" fill="transparent" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="4" />
                                    <circle
                                        cx="50" cy="50" r="45" fill="transparent" stroke="#6366f1" strokeWidth="4"
                                        strokeDasharray="283"
                                        strokeDashoffset={283 - (283 * progress) / 100}
                                        style={{ transition: 'stroke-dashoffset 0.4s cubic-bezier(0.4, 0, 0.2, 1)' }}
                                        strokeLinecap="round"
                                    />
                                </svg>
                                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                    <span className="text-5xl font-bold text-gradient" style={{ letterSpacing: '-0.05em' }}>
                                        {progress}%
                                    </span>
                                    <span style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.5)', fontWeight: '600', marginTop: '0.5rem', letterSpacing: '0.2em' }}>
                                        AI MASKING
                                    </span>
                                </div>
                            </div>

                            <h2 className="text-4xl font-bold text-primary mb-6" style={{ background: 'linear-gradient(to bottom, #fff, #9ca3af)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                Removing Background...
                            </h2>
                            <p className="text-xl text-secondary" style={{ marginBottom: '3rem', textAlign: 'center', maxWidth: '32rem', color: '#9ca3af' }}>
                                Using neural networks to detect edges and separate subjects from the background.
                            </p>

                            <div className="glass-panel" style={{ padding: '1.25rem 3rem', borderRadius: '100px', fontSize: '1rem', border: '1px solid rgba(255, 255, 255, 0.1)', background: 'rgba(255, 255, 255, 0.05)', boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)' }}>
                                <span className="text-indigo font-bold">Important:</span> Keep this tab open while processing! ✨
                            </div>
                        </div>
                    ) : (
                        <ResultView images={images} onReset={handleReset} />
                    )}
                </div>
            )}
        </div>
    );
};

export default Home;
