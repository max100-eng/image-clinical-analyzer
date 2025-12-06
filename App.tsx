
import React, { useState, useCallback, useEffect } from 'react';
import { ImageType, AnalysisResult } from './types';
import { analyzeImage } from './services/geminiService';
import { AuthProvider, useAuth } from './contexts/AuthContext';

import Header from './components/Header';
import ImageTypeSelector from './components/ImageTypeSelector';
import ImageUploader from './components/ImageUploader';
import AnalysisDisplay from './components/AnalysisDisplay';
import PerformanceModal from './components/PerformanceModal';
import Login from './components/Login';
import SplashScreen from './components/SplashScreen';
import InstallPrompt from './components/InstallPrompt';
import { ArrowRightIcon, SparklesIcon, BarChartIcon, DownloadIcon, XCircleIcon } from './components/icons/Icons';

interface ImageData {
  base64: string;
  mimeType: string;
  previewUrl: string;
}

const ClinicalApp: React.FC = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);

  const [selectedType, setSelectedType] = useState<ImageType>(ImageType.ECG);
  const [imageData, setImageData] = useState<ImageData | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [isPerformanceModalOpen, setPerformanceModalOpen] = useState<boolean>(false);

  // Install Prompt State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallInstructions, setShowInstallInstructions] = useState(false);
  const [isAppInstalled, setIsAppInstalled] = useState(false);
  const [showInstallBanner, setShowInstallBanner] = useState(true);

  // Check if app is already installed (Standalone mode)
  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
    if (isStandalone) {
        setIsAppInstalled(true);
        setShowInstallBanner(false);
    }
  }, []);

  // Handle Splash Screen Timer
  useEffect(() => {
    const timer = setTimeout(() => {
        setShowSplash(false);
    }, 2500); // Show splash for 2.5 seconds
    return () => clearTimeout(timer);
  }, []);

  // Handle Install Prompt Event (Chrome/Android)
  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      console.log('Install prompt captured');
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = useCallback(() => {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult: any) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('User accepted the install prompt');
                setDeferredPrompt(null);
                setShowInstallBanner(false);
            }
        });
    } else {
        // Fallback for iOS or if prompt not available (but user clicked button)
        setShowInstallInstructions(true);
    }
  }, [deferredPrompt]);

  const handleDismissBanner = () => {
      setShowInstallBanner(false);
  };

  const getPlatformInstructions = () => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(userAgent);
    
    if (isIOS) {
        return (
            <ol className="text-left text-sm text-gray-600 dark:text-gray-300 space-y-3 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg w-full border border-gray-200 dark:border-gray-600">
                <li className="flex items-start gap-2">
                    <span className="font-bold bg-gray-200 dark:bg-gray-600 rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">1</span> 
                    <span>Tap the <span className="font-bold">Share</span> icon <span className="inline-block border border-gray-300 px-1 rounded mx-1">⎋</span> (usually at the bottom).</span>
                </li>
                <li className="flex items-start gap-2">
                    <span className="font-bold bg-gray-200 dark:bg-gray-600 rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">2</span> 
                    <span>Scroll down and select <span className="font-bold">"Add to Home Screen"</span>.</span>
                </li>
                <li className="flex items-start gap-2">
                    <span className="font-bold bg-gray-200 dark:bg-gray-600 rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">3</span> 
                    <span>Tap <span className="font-bold">Add</span> in the top right corner.</span>
                </li>
            </ol>
        );
    }

    // Android / Desktop Fallback
    return (
        <ol className="text-left text-sm text-gray-600 dark:text-gray-300 space-y-3 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg w-full border border-gray-200 dark:border-gray-600">
            <li className="flex items-start gap-2">
                <span className="font-bold bg-gray-200 dark:bg-gray-600 rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">1</span> 
                <span>Tap the browser menu (three dots <strong>⋮</strong> or lines).</span>
            </li>
            <li className="flex items-start gap-2">
                <span className="font-bold bg-gray-200 dark:bg-gray-600 rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">2</span> 
                <span>Select <span className="font-bold">"Install App"</span> or <span className="font-bold">"Add to Home Screen"</span>.</span>
            </li>
            <li className="flex items-start gap-2">
                <span className="font-bold bg-gray-200 dark:bg-gray-600 rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">3</span> 
                <span>Follow the on-screen prompts to confirm.</span>
            </li>
        </ol>
    );
  };

  // Clear data when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
        setImageData(null);
        setAnalysisResult(null);
        setError('');
    }
  }, [isAuthenticated]);

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const base64Data = base64String.split(',')[1];
      setImageData({
        base64: base64Data,
        mimeType: file.type,
        previewUrl: base64String,
      });
      setAnalysisResult(null);
      setError('');
    };
    reader.onerror = () => {
        setError("Failed to read the image file.");
    }
    reader.readAsDataURL(file);
  };

  const handleImageClear = useCallback(() => {
    setImageData(null);
    setAnalysisResult(null);
    setError('');
  }, []);

  const handleAnalyzeClick = useCallback(async () => {
    if (!imageData) {
      setError('Please upload an image first.');
      return;
    }
    setLoading(true);
    setError('');
    setAnalysisResult(null);

    try {
      const result = await analyzeImage(imageData.base64, imageData.mimeType, selectedType);
      setAnalysisResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred during analysis.');
    } finally {
      setLoading(false);
    }
  }, [imageData, selectedType]);

  if (authLoading && !showSplash) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-brand-dark gap-4">
            <SparklesIcon className="animate-spin h-10 w-10 text-brand-secondary" />
            <p className="text-gray-500 dark:text-gray-400 font-medium">Loading Secure Session...</p>
        </div>
      );
  }

  return (
    <>
      <SplashScreen isVisible={showSplash} />
      
      {/* Install Banner at bottom. Show if NOT installed AND banner is enabled. */}
      {showInstallBanner && !isAppInstalled && (
          <InstallPrompt 
            onInstall={handleInstallClick} 
            onDismiss={handleDismissBanner}
          />
      )}
      
      {/* Manual Install Instructions Modal */}
      {showInstallInstructions && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setShowInstallInstructions(false)}>
            <div className="bg-white dark:bg-gray-800 rounded-xl max-w-sm w-full p-6 shadow-2xl relative border border-gray-200 dark:border-gray-700" onClick={e => e.stopPropagation()}>
                <button onClick={() => setShowInstallInstructions(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                    <XCircleIcon className="h-6 w-6" />
                </button>
                <div className="flex flex-col items-center text-center">
                    <div className="bg-brand-secondary/10 p-4 rounded-full mb-4 ring-4 ring-brand-secondary/5">
                        <DownloadIcon className="h-8 w-8 text-brand-secondary" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Install App</h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-6 text-sm">
                        This is a web application. You can install it directly from your browser without a store download.
                    </p>
                    
                    {getPlatformInstructions()}

                    <button 
                        onClick={() => setShowInstallInstructions(false)}
                        className="mt-6 w-full py-2.5 bg-brand-primary text-white rounded-lg font-medium hover:bg-opacity-90 transition-colors"
                    >
                        Got it
                    </button>
                </div>
            </div>
        </div>
      )}

      {!isAuthenticated ? (
        <Login onInstallClick={handleInstallClick} isAppInstalled={isAppInstalled} />
      ) : (
        <div className="min-h-screen bg-slate-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans">
          <Header onInstallClick={handleInstallClick} isAppInstalled={isAppInstalled} />
          <main className="container mx-auto p-4 md:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Left Column: Controls & Image Preview */}
              <div className="flex flex-col space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-brand-primary dark:text-brand-accent mb-3">1. Select Image Type</h2>
                  <ImageTypeSelector selectedType={selectedType} onTypeChange={setSelectedType} />
                </div>
                
                <div>
                  <h2 className="text-xl font-semibold text-brand-primary dark:text-brand-accent mb-3">2. Upload Image</h2>
                  <ImageUploader onImageUpload={handleImageUpload} previewUrl={imageData?.previewUrl} onClear={handleImageClear} />
                </div>

                <div className="pt-4">
                  <button
                      onClick={handleAnalyzeClick}
                      disabled={!imageData || loading}
                      className="w-full flex items-center justify-center text-lg font-bold bg-brand-secondary hover:bg-opacity-90 disabled:bg-gray-400 dark:disabled:bg-gray-600 text-white rounded-lg shadow-md px-6 py-4 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                      {loading ? (
                        <>
                          <SparklesIcon className="animate-spin h-6 w-6 mr-3" />
                          Analyzing Clinical Data...
                        </>
                      ) : (
                        <>
                          Analyze Image <ArrowRightIcon className="ml-2 h-6 w-6" />
                        </>
                      )}
                  </button>
                </div>
                
                <div className="text-center mt-2">
                    <button 
                        onClick={() => setPerformanceModalOpen(true)}
                        className="text-sm text-gray-500 hover:text-brand-secondary underline flex items-center justify-center mx-auto"
                    >
                        <BarChartIcon className="h-4 w-4 mr-1" />
                        View Model Performance Metrics
                    </button>
                </div>
              </div>

              {/* Right Column: Analysis Results */}
              <div className="flex flex-col h-full min-h-[500px]">
                <h2 className="text-xl font-semibold text-brand-primary dark:text-brand-accent mb-3">3. Clinical Interpretation</h2>
                <AnalysisDisplay 
                    loading={loading} 
                    error={error} 
                    result={analysisResult} 
                    previewUrl={imageData?.previewUrl}
                />
              </div>

            </div>
          </main>

          <PerformanceModal 
            isOpen={isPerformanceModalOpen} 
            onClose={() => setPerformanceModalOpen(false)} 
          />
        </div>
      )}
    </>
  );
};

const App: React.FC = () => {
    return (
        <AuthProvider>
            <ClinicalApp />
        </AuthProvider>
    );
};

export default App;
