"use client";
import { useState, useRef } from 'react';
import { Upload, X, Loader2, AlertCircle } from 'lucide-react';

interface HeroUploaderProps {
  current: string;
  folder?: string;
  label?: string;
  onChange: (path: string) => void;
  [key: string]: any;
}

const CLOUD_NAME = 'dcypczobx';
const UPLOAD_PRESET = 'dekanic_unsigned';

export default function HeroUploader({ current, folder = 'hero', label = 'hero', onChange }: HeroUploaderProps) {
  const [dragging, setDragging]   = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError]         = useState('');
  const [preview, setPreview]     = useState(current);
  const fileRef = useRef<HTMLInputElement>(null);

  const upload = async (file: File) => {
    if (!file.type.startsWith('image/')) { setError('Only image files allowed'); return; }
    if (file.size > 9.5 * 1024 * 1024)   { setError('File too large — max 9.5MB. Please compress the image first (e.g. tinypng.com) or resize to under 4000×2500px.'); return; }

    setUploading(true); setError('');
    setPreview(URL.createObjectURL(file));

    const form = new FormData();
    form.append('file', file);
    form.append('upload_preset', UPLOAD_PRESET);

    try {
      const res  = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: form,
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error?.message || 'Upload failed'); setUploading(false); return; }
      onChange(data.secure_url);
    } catch (e: any) { setError('Network error: ' + (e?.message || 'unknown')); }
    setUploading(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) upload(file);
  };

  return (
    <div className="space-y-3">
      {preview && (
        <div className="relative rounded-2xl overflow-hidden bg-stone-200" style={{ aspectRatio: '16/6' }}>
          <img src={preview} alt="Preview"
            className="w-full h-full object-cover"
            onError={e => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=60'; }} />
          <div className="absolute inset-0 bg-black/20 flex items-end p-3">
            <span className="text-white text-xs font-semibold bg-black/40 px-2 py-1 rounded-lg">Current {label}</span>
          </div>
          <button onClick={() => { setPreview(''); onChange(''); }}
            className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow">
            <X size={14} />
          </button>
        </div>
      )}

      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => fileRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all
          ${dragging ? 'border-sand-500 bg-sand-50' : 'border-stone-200 hover:border-sand-400 hover:bg-stone-50'}`}
      >
        <input ref={fileRef} type="file" accept="image/*" className="hidden"
          onChange={e => { if (e.target.files?.[0]) upload(e.target.files[0]); e.target.value = ''; }} />
        <div className="flex items-center justify-center gap-3">
          {uploading
            ? <Loader2 size={18} className="animate-spin text-sand-600" />
            : <Upload size={18} className="text-stone-400" />}
          <p className="text-sm text-stone-600 font-medium">
            {uploading ? 'Uploading…' : dragging ? 'Drop it!' : `Upload new ${label}`}
          </p>
        </div>
        <p className="text-xs text-stone-400 mt-1">JPG, PNG, WEBP · Max 20MB</p>
      </div>

      {error && (
        <p className="text-red-500 text-xs flex items-center gap-1.5 bg-red-50 px-3 py-2 rounded-lg">
          <AlertCircle size={13} /> {error}
        </p>
      )}
    </div>
  );
}
