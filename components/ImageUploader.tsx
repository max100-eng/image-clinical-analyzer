
import React, { useRef, useState, useEffect, WheelEvent, MouseEvent } from 'react';
import { UploadCloudIcon, XCircleIcon, CameraIcon, FileUpIcon, ZoomInIcon, ZoomOutIcon, RefreshCwIcon, TargetIcon, RotateCcwIcon } from './icons/Icons';

interface ImageUploaderProps {
  onImageUpload: (file: File) => void;
  previewUrl: string | null | undefined;
  onClear: () => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload, previewUrl, onClear }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  
  // Viewport State
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef({ x: 0, y: 0 });

  // Annotation State
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [isArrowMode, setIsArrowMode] = useState(false);
  const [hasAnnotations, setHasAnnotations] = useState(false);

  useEffect(() => {
    // Reset state when image is cleared
    if (!previewUrl) {
      resetZoom();
      setIsArrowMode(false);
      setHasAnnotations(false);
      setOriginalFile(null);
    }
  }, [previewUrl]);

  const updateScale = (newScale: number) => {
    const clampedScale = Math.max(1, Math.min(newScale, 8));
    setScale(clampedScale);
    if (clampedScale === 1) {
      setPan({ x: 0, y: 0 });
    }
  };

  const handleWheel = (e: WheelEvent<HTMLDivElement>) => {
    if (isArrowMode) return; // Disable zoom on wheel when in arrow mode to prevent confusion
    e.preventDefault();
    updateScale(scale - e.deltaY * 0.005);
  };

  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    // If in Arrow Mode, we don't pan, we prepare to click
    if (isArrowMode) return;
    
    if (scale <= 1 || (e.target as HTMLElement).closest('button')) return;
    e.preventDefault();
    setIsPanning(true);
    panStartRef.current = {
      x: e.clientX - pan.x,
      y: e.clientY - pan.y,
    };
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (isArrowMode) return;
    if (!isPanning) return;
    e.preventDefault();
    setPan({
      x: e.clientX - panStartRef.current.x,
      y: e.clientY - panStartRef.current.y,
    });
  };

  const handleMouseUpOrLeave = () => {
    setIsPanning(false);
  };

  const resetZoom = () => {
    setScale(1);
    setPan({ x: 0, y: 0 });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setOriginalFile(file); // Store original for Undo
      onImageUpload(file);
    }
     if (event.target) {
        event.target.value = '';
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const file = event.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setOriginalFile(file);
      onImageUpload(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const triggerFileUpload = () => {
    if (fileInputRef.current) {
        fileInputRef.current.removeAttribute('capture');
        fileInputRef.current.click();
    }
  };

  const triggerCamera = () => {
    if (fileInputRef.current) {
        fileInputRef.current.setAttribute('capture', 'environment');
        fileInputRef.current.click();
    }
  };

  const clearImage = (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();
      setOriginalFile(null);
      setHasAnnotations(false);
      onClear();
  };

  // --- ANNOTATION LOGIC ---

  const handleImageClick = (e: MouseEvent<HTMLDivElement>) => {
    if (!isArrowMode || !imageRef.current) return;
    
    const rect = imageRef.current.getBoundingClientRect();
    
    // Calculate click position relative to the displayed image element
    const x = (e.clientX - rect.left) / scale; // Account for CSS scale
    const y = (e.clientY - rect.top) / scale;

    // Convert to natural image coordinates (the actual file pixels)
    const naturalX = (x / rect.width) * imageRef.current.naturalWidth * scale; // Undo scale in width calc
    const naturalY = (y / rect.height) * imageRef.current.naturalHeight * scale;

    addArrowToImage(naturalX, naturalY);
  };

  const addArrowToImage = (targetX: number, targetY: number) => {
    if (!imageRef.current) return;

    const img = imageRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    // 1. Draw the current image (could be the original or already annotated)
    ctx.drawImage(img, 0, 0);

    // 2. Draw Arrow
    const arrowLength = Math.max(img.naturalWidth, img.naturalHeight) * 0.15; // 15% of image size
    const arrowWidth = arrowLength * 0.3; // Proportionate width
    const angle = Math.PI / 4; // 45 degrees relative angle (pointing from top-left to bottom-right target)

    // Calculate start point (arrow tail) so tip lands on targetX, targetY
    // Let's make a standard red arrow pointing TO the target
    // We'll offset the tail to the top-left of the target for visibility
    const startX = targetX - arrowLength * 0.7;
    const startY = targetY - arrowLength * 0.7;

    ctx.save();
    ctx.strokeStyle = 'red';
    ctx.fillStyle = 'red';
    ctx.lineWidth = Math.max(5, img.naturalWidth * 0.01);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // Draw Line
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(targetX, targetY);
    ctx.stroke();

    // Draw Arrowhead at target
    const headLen = arrowLength * 0.3; 
    // Calculate angle of the line
    const dx = targetX - startX;
    const dy = targetY - startY;
    const rad = Math.atan2(dy, dx);

    ctx.beginPath();
    ctx.moveTo(targetX, targetY);
    ctx.lineTo(targetX - headLen * Math.cos(rad - Math.PI / 6), targetY - headLen * Math.sin(rad - Math.PI / 6));
    ctx.lineTo(targetX - headLen * Math.cos(rad + Math.PI / 6), targetY - headLen * Math.sin(rad + Math.PI / 6));
    ctx.lineTo(targetX, targetY);
    ctx.fill();
    ctx.restore();

    // 3. Convert back to File/Blob
    canvas.toBlob((blob) => {
        if (blob && originalFile) {
            const newFile = new File([blob], originalFile.name, { type: originalFile.type });
            onImageUpload(newFile); // Update parent with new Annotated Image
            setHasAnnotations(true);
            setIsArrowMode(false); // Turn off mode after placing one (optional UX choice, keeps it clean)
        }
    }, originalFile?.type || 'image/png');
  };

  const undoAnnotations = () => {
      if (originalFile) {
          onImageUpload(originalFile);
          setHasAnnotations(false);
          setIsArrowMode(false);
      }
  };

  const toggleArrowMode = () => {
      setIsArrowMode(!isArrowMode);
      if (!isArrowMode) {
          // If turning ON, reset zoom to ensure accurate clicking easily
          resetZoom();
      }
  };


  return (
    <div className="w-full">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
      />
      
      {previewUrl ? (
        <div className="relative group w-full">
            <div
            className={`relative w-full aspect-video rounded-lg overflow-hidden border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 touch-none ${isArrowMode ? 'cursor-crosshair' : ''}`}
            onWheel={handleWheel}
            onMouseDown={isArrowMode ? undefined : handleMouseDown}
            onClick={isArrowMode ? handleImageClick : undefined}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUpOrLeave}
            onMouseLeave={handleMouseUpOrLeave}
            >
            <img
                ref={imageRef}
                src={previewUrl}
                alt="Preview"
                className="w-full h-full object-contain select-none pointer-events-none"
                style={{
                transform: `scale(${scale}) translate(${pan.x}px, ${pan.y}px)`,
                cursor: isArrowMode ? 'crosshair' : (scale > 1 ? (isPanning ? 'grabbing' : 'grab') : 'default'),
                willChange: 'transform',
                }}
            />
            
            {/* Hover Controls (Change/Remove) */}
            <div className={`absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center ${isArrowMode || isPanning ? 'pointer-events-none opacity-0' : ''}`}>
                <button
                onClick={triggerFileUpload}
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/80 dark:bg-gray-900/80 text-gray-800 dark:text-white px-4 py-2 rounded-md font-semibold text-sm z-10 pointer-events-auto"
                >
                Change Image
                </button>
            </div>
            
            <button 
                onClick={clearImage}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-1 bg-black/50 rounded-full text-white hover:bg-black/75 focus:outline-none focus:ring-2 focus:ring-white z-20 pointer-events-auto"
                aria-label="Remove image"
            >
                <XCircleIcon className="h-6 w-6" />
            </button>
            
            {/* Bottom Bar: Zoom & Annotate Tools */}
            <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/60 backdrop-blur-md p-1.5 rounded-lg z-20 pointer-events-auto shadow-lg border border-white/10">
                {/* Arrow Tool */}
                <button 
                    onClick={toggleArrowMode}
                    className={`p-1.5 rounded-md transition-all ${isArrowMode ? 'bg-red-500 text-white' : 'text-white hover:bg-white/20'}`}
                    title="Point with Arrow (Burns into image)"
                >
                    <TargetIcon className="h-5 w-5" />
                </button>

                {/* Undo Annotations */}
                {hasAnnotations && (
                    <button 
                        onClick={undoAnnotations}
                        className="p-1.5 text-white hover:bg-white/20 rounded-md transition-colors"
                        title="Remove Arrows / Reset to Original"
                    >
                        <RotateCcwIcon className="h-5 w-5" />
                    </button>
                )}

                <div className="w-px h-5 bg-white/30 mx-1"></div>

                <button 
                    onClick={() => updateScale(scale + 0.25)}
                    className="p-1.5 text-white hover:bg-white/20 rounded-md transition-colors"
                    aria-label="Zoom in"
                    disabled={isArrowMode}
                >
                    <ZoomInIcon className="h-5 w-5" />
                </button>
                <button 
                    onClick={() => updateScale(scale - 0.25)}
                    className="p-1.5 text-white hover:bg-white/20 rounded-md transition-colors"
                    aria-label="Zoom out"
                    disabled={isArrowMode}
                >
                    <ZoomOutIcon className="h-5 w-5" />
                </button>
                <div className="w-px h-5 bg-white/30 mx-1"></div>
                <button 
                    onClick={resetZoom}
                    className="p-1.5 text-white hover:bg-white/20 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Reset zoom"
                    disabled={scale === 1 && pan.x === 0 && pan.y === 0}
                >
                    <RefreshCwIcon className="h-5 w-5" />
                </button>
                </div>
            </div>
            
            {/* Arrow Mode Instruction Banner */}
            {isArrowMode && (
                <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-30 pointer-events-none">
                    <div className="bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg animate-fade-in flex items-center gap-2">
                        <TargetIcon className="h-3 w-3" />
                        Click on image to place arrow
                    </div>
                </div>
            )}
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="flex flex-col justify-center items-center w-full aspect-video px-6 py-10 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg bg-gray-50 dark:bg-gray-800"
        >
          <div className="text-center">
            <UploadCloudIcon className="mx-auto h-12 w-12 text-gray-400" />
             <p className="mt-4 text-base text-gray-700 dark:text-gray-200">
              <span className="font-semibold">Upload your clinical image</span>
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 mb-6">Drag & drop or use the buttons below</p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                 <button
                    type="button"
                    onClick={triggerFileUpload}
                    className="inline-flex w-full sm:w-auto items-center justify-center gap-2 px-4 py-2 bg-brand-secondary text-white rounded-lg hover:bg-opacity-90 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-accent shadow"
                    >
                    <FileUpIcon className="h-5 w-5" />
                    <span>Upload File</span>
                </button>
            
                <div className="relative flex py-1 sm:py-0 items-center w-20 sm:w-auto">
                    <div className="flex-grow border-t border-gray-300 dark:border-gray-600 sm:hidden"></div>
                    <span className="flex-shrink mx-4 text-gray-400 text-xs font-sans">OR</span>
                    <div className="flex-grow border-t border-gray-300 dark:border-gray-600 sm:hidden"></div>
                </div>

                <button
                type="button"
                onClick={triggerCamera}
                className="inline-flex w-full sm:w-auto items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-accent"
                >
                    <CameraIcon className="h-5 w-5" />
                    <span>Use Camera</span>
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
