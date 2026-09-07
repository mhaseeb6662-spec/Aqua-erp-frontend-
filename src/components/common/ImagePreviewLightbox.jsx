import { useState, useEffect, useRef } from 'react';
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Download,
  AlertCircle,
  Loader2,
  Maximize2,
  Shield,
  FileText
} from 'lucide-react';

export default function ImagePreviewLightbox({
  isOpen,
  onClose,
  src,
  title = 'Image Preview',
  alt = 'Preview Image',
  metadata = null,
  allowDownload = false,
  onDownload = null,
}) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef(null);

  // Reset state whenever a new image opens
  useEffect(() => {
    if (isOpen) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
      setIsLoading(true);
      setHasError(false);

      // Lock body scroll
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          onClose();
        } else if (e.key === '+' || e.key === '=') {
          handleZoomIn();
        } else if (e.key === '-' || e.key === '_') {
          handleZoomOut();
        } else if (e.key === '0') {
          handleResetZoom();
        }
      };

      window.addEventListener('keydown', handleKeyDown);

      return () => {
        document.body.style.overflow = originalOverflow;
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, src]);

  if (!isOpen) return null;

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.25, 4));
  };

  const handleZoomOut = () => {
    setScale((prev) => {
      const nextScale = Math.max(prev - 0.25, 0.5);
      if (nextScale <= 1) setPosition({ x: 0, y: 0 });
      return nextScale;
    });
  };

  const handleResetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  // Mouse wheel zoom support
  const handleWheel = (e) => {
    e.stopPropagation();
    if (e.deltaY < 0) {
      handleZoomIn();
    } else {
      handleZoomOut();
    }
  };

  // Dragging support when zoomed in
  const handleMouseDown = (e) => {
    if (scale > 1) {
      e.preventDefault();
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && scale > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleDefaultDownload = () => {
    if (onDownload) {
      onDownload();
      return;
    }
    if (!src) return;
    try {
      const a = document.createElement('a');
      a.href = src;
      a.download = (title || 'image').toLowerCase().replace(/[^a-z0-9]/g, '_') + '.jpg';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.warn('Download trigger failed:', err);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-between bg-slate-950/90 backdrop-blur-md select-none transition-opacity duration-200"
      onClick={onClose}
    >
      {/* Top Action Bar */}
      <div
        className="w-full flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 bg-slate-900/60 border-b border-white/10 z-10 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2 rounded-xl bg-white/10 text-tide-light">
            <Maximize2 className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm sm:text-base font-bold text-white truncate">{title}</h2>
            {metadata && typeof metadata === 'object' && (
              <div className="flex flex-wrap items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                {Object.entries(metadata).map(([key, val]) =>
                  val ? (
                    <span key={key} className="inline-flex items-center gap-1">
                      <span className="text-slate-500 font-medium">{key}:</span>
                      <span className="text-slate-300 font-semibold">{String(val)}</span>
                    </span>
                  ) : null
                )}
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Zoom In */}
          <button
            type="button"
            onClick={handleZoomIn}
            disabled={scale >= 4}
            className="p-2 rounded-xl bg-white/10 text-white hover:bg-white/20 disabled:opacity-30 transition"
            title="Zoom In (+)"
            aria-label="Zoom In"
          >
            <ZoomIn className="h-4 w-4" />
          </button>

          {/* Zoom Out */}
          <button
            type="button"
            onClick={handleZoomOut}
            disabled={scale <= 0.5}
            className="p-2 rounded-xl bg-white/10 text-white hover:bg-white/20 disabled:opacity-30 transition"
            title="Zoom Out (-)"
            aria-label="Zoom Out"
          >
            <ZoomOut className="h-4 w-4" />
          </button>

          {/* Reset Zoom */}
          <button
            type="button"
            onClick={handleResetZoom}
            className="p-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition text-xs font-mono"
            title="Reset Zoom (0)"
            aria-label="Reset Zoom"
          >
            <RotateCcw className="h-4 w-4" />
          </button>

          {/* Download (If allowed) */}
          {allowDownload && (
            <button
              type="button"
              onClick={handleDefaultDownload}
              className="p-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition"
              title="Download Image"
              aria-label="Download Image"
            >
              <Download className="h-4 w-4" />
            </button>
          )}

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="ml-1 sm:ml-2 p-2 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-white transition shadow-sm"
            title="Close (Escape)"
            aria-label="Close Preview"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Main Viewport */}
      <div
        className="relative flex-1 w-full h-full flex items-center justify-center p-4 sm:p-6 overflow-hidden"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {/* Loading Spinner */}
        {isLoading && !hasError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white/80 z-0">
            <Loader2 className="h-10 w-10 animate-spin text-tide mb-3" />
            <p className="text-xs font-medium text-slate-300">Loading full image...</p>
          </div>
        )}

        {/* Error State */}
        {hasError ? (
          <div
            className="max-w-sm rounded-2xl bg-slate-900/90 border border-white/10 p-6 text-center text-white shadow-2xl z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/20 text-rose-400 mb-3">
              <AlertCircle className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-bold text-white">Image Unavailable</h3>
            <p className="mt-1 text-xs text-slate-400">
              The requested file could not be loaded or is in an unsupported format.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-4 rounded-xl bg-white/10 px-4 py-2 text-xs font-semibold text-white hover:bg-white/20 transition"
            >
              Close
            </button>
          </div>
        ) : (
          <div
            className="flex items-center justify-center transition-transform duration-75 max-w-full max-h-full"
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
              cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              ref={imgRef}
              src={src}
              alt={alt}
              onLoad={() => setIsLoading(false)}
              onError={() => {
                setIsLoading(false);
                setHasError(true);
              }}
              className="max-w-[90vw] max-h-[80vh] sm:max-h-[82vh] object-contain rounded-lg shadow-2xl transition-opacity duration-200"
              style={{ opacity: isLoading ? 0 : 1 }}
              draggable={false}
            />
          </div>
        )}
      </div>

      {/* Bottom Information & Hint Bar */}
      <div
        className="w-full px-4 py-2 bg-slate-900/40 border-t border-white/5 text-center text-[11px] text-slate-400 flex items-center justify-between z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-1 text-slate-400">
          <Shield className="h-3 w-3 text-emerald-400" />
          <span>Secure ERP Encrypted Preview</span>
        </div>
        <div className="hidden sm:flex items-center gap-3 text-slate-400">
          <span>Zoom: <strong className="text-white font-mono">{Math.round(scale * 100)}%</strong></span>
          <span>•</span>
          <span>Scroll to Zoom</span>
          <span>•</span>
          <span>Esc to Close</span>
        </div>
        <div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-300 hover:text-white font-medium text-xs underline"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
