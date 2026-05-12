
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { readFile } from 'fs/promises';
import path from 'path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function getPassword(): Promise<string | null> {
  // 1. Try setup.json first (set during onboarding)
  try {
    const raw = await readFile(path.join(process.cwd(), 'data', 'setup.json'), 'utf-8');
    const setup = JSON.parse(raw);
    if (setup.password) return setup.password;
  } catch {}
  // 2. Fall back to env var
  return process.env.ADMIN_PASSWORD || null;
}

export async function POST(req: Request) {
  const { password } = await req.json();
  const adminPassword = await getPassword();
  if (!adminPassword) return NextResponse.json({ error: 'No password configured. Complete setup first.' }, { status: 401 });
  if (password !== adminPassword) return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });

  const secret = process.env.ADMIN_SESSION_SECRET || 'dekanic_admin_2024';
  const cookieStore = await cookies();
  cookieStore.set('admin_session', `${password}_${secret}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  });
  return NextResponse.json({ success: true });
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete('admin_session');
  return NextResponse.json({ success: true });
}
