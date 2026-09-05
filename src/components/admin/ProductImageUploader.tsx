import React, { useState, useRef, useCallback } from 'react';
import {
  UploadCloud,
  Image as ImageIcon,
  Plus,
  Trash2,
  Star,
  Link,
  Check,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

interface ProductImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  disabled?: boolean;
}

const PRESET_ROYAL_GARMENT_IMAGES = [
  {
    name: 'Silk Kurta',
    url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&q=80',
  },
  {
    name: 'Indo-Western',
    url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80',
  },
  {
    name: 'Jacket Set',
    url: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?w=800&q=80',
  },
  {
    name: 'Royal Jodhpuri',
    url: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&q=80',
  },
];

/**
 * Optimizes and resizes an uploaded image file on the client using HTML5 Canvas
 * to keep base64 storage fast, lightweight and high fidelity.
 */
async function processImageFile(file: File, maxDimension = 1200, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Selected file is not an image.'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to parse image data.'));
      img.onload = () => {
        let { width, height } = img;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          // Fallback to raw data url if canvas context unavailable
          resolve(reader.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Export as webp/jpeg data url
        try {
          const optimized = canvas.toDataURL('image/jpeg', quality);
          resolve(optimized);
        } catch {
          resolve(reader.result as string);
        }
      };
      img.src = reader.result as string;
    };

    reader.readAsDataURL(file);
  });
}

export const ProductImageUploader: React.FC<ProductImageUploaderProps> = ({
  images = [],
  onChange,
  disabled = false,
}) => {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [inputUrl, setInputUrl] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);

  // Handle file uploads (from file picker or drop)
  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      if (!files || files.length === 0) return;

      const validFiles: File[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type.startsWith('image/')) {
          if (file.size > 15 * 1024 * 1024) {
            showToast(`File "${file.name}" exceeds 15MB size limit`, 'error');
          } else {
            validFiles.push(file);
          }
        } else {
          showToast(`File "${file.name}" is not an image`, 'error');
        }
      }

      if (validFiles.length === 0) return;

      setIsProcessing(true);
      try {
        const processedUrls: string[] = [];
        for (const file of validFiles) {
          const dataUrl = await processImageFile(file);
          processedUrls.push(dataUrl);
        }

        const updated = [...images, ...processedUrls];
        onChange(updated);
        showToast(
          `Uploaded ${validFiles.length} ${validFiles.length === 1 ? 'image' : 'images'} successfully!`,
          'success'
        );
      } catch (err: any) {
        showToast(err?.message || 'Failed to process selected image', 'error');
      } finally {
        setIsProcessing(false);
      }
    },
    [images, onChange, showToast]
  );

  // Drag & drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleManualUrlAdd = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = inputUrl.trim();
    if (!clean) {
      showToast('Please enter an image URL', 'error');
      return;
    }
    if (!clean.startsWith('http://') && !clean.startsWith('https://') && !clean.startsWith('data:image')) {
      showToast('Please enter a valid HTTP(S) image URL', 'error');
      return;
    }

    onChange([...images, clean]);
    setInputUrl('');
    setShowUrlInput(false);
    showToast('Image URL added to gallery', 'success');
  };

  const handleRemoveImage = (indexToRemove: number) => {
    const updated = images.filter((_, idx) => idx !== indexToRemove);
    onChange(updated);
  };

  const handleSetPrimary = (indexToPrimary: number) => {
    if (indexToPrimary === 0) return;
    const target = images[indexToPrimary];
    const rest = images.filter((_, idx) => idx !== indexToPrimary);
    onChange([target, ...rest]);
    showToast('Primary garment cover image updated', 'success');
  };

  const handleAddPreset = (url: string, name: string) => {
    onChange([...images, url]);
    showToast(`Added sample photo for ${name}`, 'success');
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-gray-700 font-semibold text-xs flex items-center gap-1.5">
          <ImageIcon className="w-3.5 h-3.5 text-[#C9A227]" />
          <span>Garment Photos ({images.length})</span>
          <span className="text-[10px] text-gray-400 font-normal">
            (First photo acts as primary cover)
          </span>
        </label>

        <div className="flex items-center gap-2">
          <button
            type="button"
            id="toggle-url-input-btn"
            onClick={() => setShowUrlInput(!showUrlInput)}
            className="text-[11px] text-[#5A1A1A] hover:underline flex items-center gap-1"
          >
            <Link className="w-3 h-3" />
            <span>{showUrlInput ? 'Hide URL input' : 'Paste Image URL'}</span>
          </button>
        </div>
      </div>

      {/* Hidden native file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/png,image/jpeg,image/webp,image/jpg"
        className="hidden"
        id="product-image-file-input"
        disabled={disabled || isProcessing}
        onChange={(e) => {
          if (e.target.files) {
            handleFiles(e.target.files);
            e.target.value = ''; // Reset so the same file can be re-selected if removed
          }
        }}
      />

      {/* Drag & Drop Upload Zone */}
      <div
        id="product-image-dropzone"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => {
          if (!disabled && !isProcessing) {
            fileInputRef.current?.click();
          }
        }}
        className={`relative border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-[#C9A227] bg-[#FAF5E8] scale-[1.01]'
            : 'border-gray-300 hover:border-[#5A1A1A] bg-[#FAF7F2]/60 hover:bg-[#FAF7F2]'
        } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
      >
        <div className="flex flex-col items-center justify-center gap-2">
          {isProcessing ? (
            <div className="flex items-center gap-2 text-[#5A1A1A] py-3 font-medium text-xs">
              <Loader2 className="w-5 h-5 animate-spin text-[#C9A227]" />
              <span>Optimizing and uploading garment photo...</span>
            </div>
          ) : (
            <>
              <div className="w-10 h-10 rounded-full bg-white shadow-xs border border-gray-200 flex items-center justify-center text-[#5A1A1A] group-hover:scale-105 transition-transform">
                <UploadCloud className="w-5 h-5 text-[#5A1A1A]" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-800">
                  Click to browse or drag & drop garment photo here
                </p>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Supports PNG, JPG, JPEG, WEBP up to 15MB • Upload multiple files
                </p>
              </div>
              <button
                type="button"
                id="browse-images-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="mt-1 px-3 py-1.5 bg-white border border-[#5A1A1A] text-[#5A1A1A] hover:bg-[#5A1A1A] hover:text-white rounded text-[11px] font-semibold transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Upload From Device</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Manual URL Input Bar (Collapsible) */}
      {showUrlInput && (
        <div className="p-3 bg-[#FAF7F2] rounded-lg border border-gray-200 animate-in fade-in space-y-2">
          <label className="block text-[11px] font-medium text-gray-700">
            Paste Web Image URL (e.g. Unsplash, CDN, or Cloud Storage):
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              id="manual-image-url-input"
              placeholder="https://images.unsplash.com/..."
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleManualUrlAdd();
                }
              }}
              className="flex-1 p-2 text-xs rounded bg-white border border-gray-300 font-mono"
            />
            <button
              type="button"
              id="add-image-url-btn"
              onClick={() => handleManualUrlAdd()}
              className="px-3 py-2 bg-[#5A1A1A] text-white rounded text-xs font-medium hover:bg-[#3D1010] shrink-0"
            >
              Add URL
            </button>
          </div>
        </div>
      )}

      {/* Quick Sample Presets */}
      <div className="flex items-center gap-1.5 text-[11px] text-gray-500 overflow-x-auto py-1">
        <Sparkles className="w-3 h-3 text-[#C9A227] shrink-0" />
        <span className="shrink-0 font-medium">Quick Royal Presets:</span>
        <div className="flex items-center gap-1.5 flex-wrap">
          {PRESET_ROYAL_GARMENT_IMAGES.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => handleAddPreset(preset.url, preset.name)}
              className="px-2 py-0.5 bg-white hover:bg-gray-100 border border-gray-200 rounded text-[10px] text-gray-700 font-medium hover:border-[#5A1A1A] transition-colors"
            >
              + {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Image Previews Gallery */}
      {images.length > 0 ? (
        <div className="space-y-1.5">
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 pt-1">
            {images.map((imgUrl, index) => {
              const isPrimary = index === 0;
              return (
                <div
                  key={`${imgUrl.slice(0, 30)}-${index}`}
                  className={`group relative rounded-lg overflow-hidden border bg-white shadow-2xs aspect-3/4 flex flex-col justify-between ${
                    isPrimary ? 'border-[#C9A227] ring-2 ring-[#C9A227]/40' : 'border-gray-200'
                  }`}
                >
                  <img
                    src={imgUrl}
                    alt={`Garment view ${index + 1}`}
                    className="w-full h-full object-cover object-top transition-transform group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />

                  {/* Primary Badge */}
                  {isPrimary ? (
                    <div className="absolute top-1.5 left-1.5 bg-[#5A1A1A] text-[#C9A227] px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-xs z-10">
                      <Star className="w-2.5 h-2.5 fill-[#C9A227]" />
                      <span>Cover</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      title="Set as primary cover image"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSetPrimary(index);
                      }}
                      className="absolute top-1.5 left-1.5 bg-black/60 hover:bg-[#5A1A1A] text-white px-1.5 py-0.5 rounded text-[9px] font-medium opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-center gap-1"
                    >
                      <Star className="w-2.5 h-2.5" />
                      <span>Make Cover</span>
                    </button>
                  )}

                  {/* Delete Button */}
                  <button
                    type="button"
                    title="Remove image"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveImage(index);
                    }}
                    className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-600/90 hover:bg-red-700 text-white rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-xs"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>

                  {/* Bottom info bar */}
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-1.5 text-[9px] text-white flex items-center justify-between">
                    <span>Photo #{index + 1}</span>
                    {isPrimary && <span className="text-[#C9A227] font-semibold">Primary</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg text-amber-800 text-[11px] flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            No garment photos added yet. Click above to upload photos from your device, drag &amp; drop, or pick a sample preset.
          </span>
        </div>
      )}
    </div>
  );
};
