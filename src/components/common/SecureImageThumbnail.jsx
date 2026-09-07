import { useState } from 'react';
import { Eye, FileText, Image as ImageIcon, AlertCircle, Lock } from 'lucide-react';
import { useImagePreview } from '../../context/ImagePreviewContext';
import { useAuth } from '../../context/AuthContext';

/**
 * Helper to check if a source or MIME type represents an image.
 */
export function isImageResource(src, mimeType, fileName) {
  if (mimeType && typeof mimeType === 'string') {
    if (mimeType.startsWith('image/')) return true;
    if (mimeType === 'application/pdf') return false;
  }

  const str = String(src || fileName || '').toLowerCase();
  if (str.startsWith('data:image/')) return true;
  if (str.endsWith('.pdf')) return false;
  if (/\.(jpg|jpeg|png|webp|gif|svg|bmp|avif)(\?.*)?$/i.test(str)) return true;

  // Default to true if starts with data: and not explicitly pdf
  if (str.startsWith('data:') && !str.startsWith('data:application/pdf')) return true;

  return false;
}

export default function SecureImageThumbnail({
  src,
  alt = 'Thumbnail',
  title = 'Image Preview',
  metadata = null,
  requiredPermission = null,
  className = '',
  iconOnly = false,
  mimeType = '',
  fileName = '',
  allowDownload = false,
  label = 'View Image',
}) {
  const { openPreview } = useImagePreview();
  const { hasPermission } = useAuth();
  const [loadError, setLoadError] = useState(false);

  const hasAccess = !requiredPermission || hasPermission(requiredPermission);
  const isImage = isImageResource(src, mimeType, fileName);

  const handleClick = (e) => {
    e.stopPropagation();
    if (!hasAccess) {
      return;
    }
    if (isImage) {
      openPreview({
        src,
        title,
        alt,
        metadata,
        allowDownload,
        requiredPermission,
      });
    } else if (src) {
      window.open(src, '_blank', 'noreferrer');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick(e);
    }
  };

  // If user lacks permission, show lock indicator
  if (!hasAccess) {
    return (
      <div
        className={`inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2 py-1 text-xs text-slate-400 cursor-not-allowed ${className}`}
        title="Access restricted"
      >
        <Lock className="h-3.5 w-3.5" />
        <span className="text-[11px] font-medium">Restricted</span>
      </div>
    );
  }

  // If resource is not an image (e.g. PDF)
  if (!isImage) {
    return (
      <a
        href={src || '#'}
        target="_blank"
        rel="noreferrer"
        onClick={(e) => e.stopPropagation()}
        className={`inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition ${className}`}
        title={title || 'View Document'}
      >
        <FileText className="h-4 w-4 text-tide" />
        <span className="truncate max-w-[120px]">{fileName || 'View Document'}</span>
      </a>
    );
  }

  // If icon-only presentation mode is requested
  if (iconOnly) {
    return (
      <button
        type="button"
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className={`inline-flex items-center gap-1.5 rounded-lg bg-marine/10 px-2.5 py-1 text-xs font-semibold text-marine hover:bg-marine/20 transition focus:outline-none focus:ring-2 focus:ring-marine/30 ${className}`}
        title={title}
        aria-label={label || title}
      >
        <Eye className="h-3.5 w-3.5" />
        <span>{label}</span>
      </button>
    );
  }

  // Standard Thumbnail representation
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      title={`${title} (Click to preview)`}
      aria-label={`Preview ${title}`}
      className={`group relative inline-block overflow-hidden rounded-xl border border-slate-200 bg-slate-50 cursor-pointer transition focus:outline-none focus:ring-2 focus:ring-tide ${className}`}
    >
      {loadError || !src ? (
        <div className="flex h-full w-full min-h-[40px] min-w-[40px] items-center justify-center bg-slate-100 p-2 text-slate-400">
          <AlertCircle className="h-4 w-4" />
        </div>
      ) : (
        <>
          <img
            src={src}
            alt={alt}
            onError={() => setLoadError(true)}
            className="h-full w-full object-cover transition duration-200 group-hover:scale-105"
          />
          {/* Hover Overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-marine-dark/40 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <div className="rounded-full bg-white/90 p-1 text-marine shadow-sm">
              <Eye className="h-3.5 w-3.5" />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
