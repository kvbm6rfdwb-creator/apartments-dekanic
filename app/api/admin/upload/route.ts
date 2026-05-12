import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Upload is now handled directly from the browser to Cloudinary.
// This endpoint is kept for diagnostics only.
export async function GET() {
  const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || 'dcypczobx';
  const PRESET = process.env.CLOUDINARY_UPLOAD_PRESET || 'dekanic_unsigned';
  return NextResponse.json({ 
    ok: true, 
    message: 'Uploads go directly from browser to Cloudinary',
    cloud_name: CLOUD_NAME,
    preset: PRESET
  });
}
