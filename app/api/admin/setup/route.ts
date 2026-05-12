
import { NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';
import { cookies } from 'next/headers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const setupPath = () => path.join(process.cwd(), 'data', 'setup.json');

// GET — check if setup has been completed
export async function GET() {
  try {
    const raw = await readFile(setupPath(), 'utf-8');
    const setup = JSON.parse(raw);
    return NextResponse.json({ completed: !!setup.completed });
  } catch {
    // File doesn't exist = first run
    return NextResponse.json({ completed: false });
  }
}

// POST — complete setup: set password + save initial data
export async function POST(req: Request) {
  try {
    // Verify setup hasn't already been completed
    try {
      const raw = await readFile(setupPath(), 'utf-8');
      const setup = JSON.parse(raw);
      if (setup.completed) {
        return NextResponse.json({ error: 'Setup already completed' }, { status: 403 });
      }
    } catch {}

    const { password, data } = await req.json();
    if (!password || password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    // Save password to setup.json (in production use bcrypt — for simplicity stored as-is here)
    await writeFile(setupPath(), JSON.stringify({ completed: true, password }), 'utf-8');

    // Save apartments data
    const dataPath = path.join(process.cwd(), 'data', 'apartments.json');
    await writeFile(dataPath, JSON.stringify(data, null, 2), 'utf-8');

    // Set session cookie
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
  } catch (e) {
    return NextResponse.json({ error: 'Setup failed' }, { status: 500 });
  }
}
