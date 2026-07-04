"use client";
import { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, X, GripVertical, ImagePlus, Loader2, AlertCircle, Star } from 'lucide-react';

interface PhotoUploaderProps {
  folder: string;
  photos: string[];
  onChange: (photos: string[]) => void;
  [key: string]: any;
}

interface UploadingFile {
  id: string;
  name: string;
  error?: string;
  preview: string;
  [key: string]: any;
}

const CLOUD_NAME = 'dcypczobx';
const UPLOAD_PRESET = 'dekanic_unsigned';
const MAX_UPLOAD_BYTES = 9.5 * 1024 * 1024; // Cloudinary free plan limit
const MAX_DIMENSION = 4800; // px on longest side

// Compress image using canvas until it fits under MAX_UPLOAD_BYTES
async function compressImage(file: File): Promise<File> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;

      // Scale down if larger than MAX_DIMENSION
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        if (width >= height) {
          height = Math.round((height / width) * MAX_DIMENSION);
          width = MAX_DIMENSION;
        } else {
          width = Math.round((width / height) * MAX_DIMENSION);
          height = MAX_DIMENSION;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, width, height);

      // Iteratively lower quality until under limit
      let quality = 0.92;
      const tryCompress = () => {
        canvas.toBlob((blob) => {
          if (!blob) { resolve(file); return; }
          if (blob.size <= MAX_UPLOAD_BYTES || quality <= 0.5) {
            resolve(new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' }));
          } else {
            quality -= 0.08;
            tryCompress();
          }
        }, 'image/jpeg', quality);
      };
      tryCompress();
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
    img.src = url;
  });
}

export default function PhotoUploader({ folder, photos: initialPhotos, onChange }: PhotoUploaderProps) {
  const [photos, setPhotos]             = useState<string[]>(initialPhotos);
  const [draggingOver, setDraggingOver] = useState(false);
  const [uploading, setUploading]       = useState<UploadingFile[]>([]);
  const [dragItem, setDragItem]         = useState<number | null>(null);
  const [dragOver, setDragOver]         = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { onChange(photos); }, [photos]); // eslint-disable-line react-hooks/exhaustive-deps

  const uploadFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) return;
    if (file.size > 50 * 1024 * 1024) {
      const id = Math.random().toString(36).slice(2);
      setUploading(prev => [...prev, { id, name: file.name, error: 'File too large \u2014 max 50MB.', preview: URL.createObjectURL(file) }]);
      return;
    }

    const id = Math.random().toString(36).slice(2);
    const preview = URL.createObjectURL(file);
    setUploading(prev => [...prev, { id, name: file.name, preview }]);

    // Auto-compress if over Cloudinary limit
    let uploadFile = file;
    if (file.size > MAX_UPLOAD_BYTES) {
      setUploading(prev => prev.map(u => u.id === id ? { ...u, compressing: true } : u));
      uploadFile = await compressImage(file);
    }

    const formData = new FormData();
    formData.append('file', uploadFile);
    formData.append('upload_preset', UPLOAD_PRESET);

    try {
      const res  = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        setUploading(prev => prev.map(u => u.id === id ? { ...u, error: data.error?.message || 'Upload failed' } : u));
        return;
      }

      setPhotos(prev => [...prev, data.secure_url]);
      setTimeout(() => {
        setUploading(prev => prev.filter(u => u.id !== id));
        URL.revokeObjectURL(preview);
      }, 600);
    } catch (e: any) {
      setUploading(prev => prev.map(u => u.id === id ? { ...u, error: 'Network error: ' + (e?.message || 'unknown') } : u));
    }
  }, []);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach(uploadFile);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDraggingOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const removePhoto = (idx: number) => setPhotos(prev => prev.filter((_, i) => i !== idx));

  const onDragStart = (idx: number) => setDragItem(idx);
  const onDragEnter = (idx: number) => setDragOver(idx);
  const onDragEnd   = () => {
    if (dragItem !== null && dragOver !== null && dragItem !== dragOver) {
      setPhotos(prev => {
        const next = [...prev];
        const [moved] = next.splice(dragItem, 1);
        next.splice(dragOver, 0, moved);
        return next;
      });
    }
    setDragItem(null);
    setDragOver(null);
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={e => { e.preventDefault(); setDraggingOver(true); }}
        onDragLeave={() => setDraggingOver(false)}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 select-none
          ${draggingOver
            ? 'border-sand-500 bg-sand-50 scale-[1.01]'
            : 'border-stone-200 hover:border-sand-400 hover:bg-stone-50 bg-white'}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={e => { handleFiles(e.target.files); e.target.value = ''; }}
        />
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 transition-colors ${draggingOver ? 'bg-sand-100' : 'bg-stone-100'}`}>
          {draggingOver
            ? <ImagePlus size={26} className="text-sand-600" />
            : <Upload size={26} className="text-stone-400" />}
        </div>
        <p className="font-semibold text-stone-700 text-sm">
          {draggingOver ? 'Drop photos here!' : 'Drag & drop photos here'}
        </p>
        <p className="text-stone-400 text-xs mt-1">
          or <span className="text-sand-600 font-semibold underline underline-offset-2">click to browse files</span>
        </p>
        <p className="text-stone-300 text-xs mt-2">JPG, PNG, WEBP \u00b7 Up to 50MB \u00b7 Large files auto-compressed \u00b7 Multiple allowed</p>
      </div>

      {uploading.length > 0 && (
        <div className="space-y-2">
          {uploading.map((u: any) => (
            <div key={u.id} className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm
              ${u.error ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-100'}`}>
              <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-stone-200">
                <img src={u.preview} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate text-stone-700 text-xs">{u.name}</p>
                {u.error
                  ? <p className="text-red-500 text-xs flex items-center gap-1 mt-0.5"><AlertCircle size={11} />{u.error}</p>
                  : u.compressing
                    ? <p className="text-amber-600 text-xs flex items-center gap-1 mt-0.5"><Loader2 size={11} className="animate-spin" />Compressing image\u2026</p>
                    : <p className="text-blue-600 text-xs flex items-center gap-1 mt-0.5"><Loader2 size={11} className="animate-spin" />Uploading to Cloudinary\u2026</p>}
              </div>
              {u.error && (
                <button onClick={() => setUploading(prev => prev.filter(p => p.id !== u.id))}
                  className="text-stone-400 hover:text-stone-600 flex-shrink-0">
                  <X size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {photos.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {photos.map((src, idx) => (
            <div
              key={src}
              draggable
              onDragStart={() => onDragStart(idx)}
              onDragEnter={() => onDragEnter(idx)}
              onDragEnd={onDragEnd}
              onDragOver={e => e.preventDefault()}
              className={`relative group rounded-xl overflow-hidden bg-stone-200 cursor-grab active:cursor-grabbing transition-all
                ${dragOver === idx ? 'ring-2 ring-sand-400 scale-105' : ''}
                ${dragItem === idx ? 'opacity-50' : ''}`}
              style={{ aspectRatio: '4/3' }}
            >
              <img src={src} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                <div className="bg-black/50 rounded-full p-1.5 cursor-grab"><GripVertical size={14} className="text-white" /></div>
                <button onClick={() => removePhoto(idx)} className="bg-red-500 hover:bg-red-600 rounded-full p-1.5 shadow">
                  <X size={14} className="text-white" />
                </button>
              </div>
              {idx === 0 && (
                <div className="absolute top-2 left-2 bg-sand-500 text-white text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Star size={10} fill="currentColor" /> Cover
                </div>
              )}
              <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-1.5 py-0.5 rounded">{idx + 1}</div>
            </div>
          ))}
        </div>
      )}

      {photos.length === 0 && uploading.length === 0 && (
        <p className="text-center text-stone-400 text-sm py-4">No photos yet \u2014 upload some above</p>
      )}
    </div>
  );
}
