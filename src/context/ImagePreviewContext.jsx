import { createContext, useContext, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import ImagePreviewLightbox from '../components/common/ImagePreviewLightbox';
import { useAuth } from './AuthContext';

const ImagePreviewContext = createContext(null);

export function ImagePreviewProvider({ children }) {
  const { hasPermission } = useAuth();
  const [previewState, setPreviewState] = useState({
    isOpen: false,
    src: null,
    title: 'Image Preview',
    alt: 'Preview Image',
    metadata: null,
    allowDownload: false,
    onDownload: null,
  });

  const openPreview = useCallback(
    ({ src, title = 'Image Preview', alt = 'Preview Image', metadata = null, allowDownload = false, onDownload = null, requiredPermission = null }) => {
      if (!src) {
        toast.error('Image source is missing or unavailable.');
        return false;
      }

      // If a specific permission is required to view this image, check it
      if (requiredPermission && !hasPermission(requiredPermission)) {
        toast.error('Access denied. You do not have permission to view this image.');
        return false;
      }

      setPreviewState({
        isOpen: true,
        src,
        title,
        alt,
        metadata,
        allowDownload,
        onDownload,
      });
      return true;
    },
    [hasPermission]
  );

  const closePreview = useCallback(() => {
    setPreviewState((prev) => ({
      ...prev,
      isOpen: false,
    }));
  }, []);

  return (
    <ImagePreviewContext.Provider value={{ openPreview, closePreview, isPreviewOpen: previewState.isOpen }}>
      {children}
      <ImagePreviewLightbox
        isOpen={previewState.isOpen}
        onClose={closePreview}
        src={previewState.src}
        title={previewState.title}
        alt={previewState.alt}
        metadata={previewState.metadata}
        allowDownload={previewState.allowDownload}
        onDownload={previewState.onDownload}
      />
    </ImagePreviewContext.Provider>
  );
}

export function useImagePreview() {
  const context = useContext(ImagePreviewContext);
  if (!context) {
    throw new Error('useImagePreview must be used within an ImagePreviewProvider');
  }
  return context;
}
