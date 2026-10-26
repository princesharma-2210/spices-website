import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { signSession, AUTH_COOKIE_NAME } from '@/lib/auth';
import { Role } from '@/types';

export async function POST(req: Request) {
  try {
    const { targetRole } = await req.json() as { targetRole: Role };

    if (!['USER', 'ADMIN', 'SUPERADMIN'].includes(targetRole)) {
      return NextResponse.json({ error: 'Invalid role specified' }, { status: 400 });
    }

    const db = getDb();
    
    // Find matching demo account for the requested role
    let user = db.users.find(u => u.role === targetRole && u.status === 'ACTIVE');
    
    // If not found, use default demo emails
    if (!user) {
      if (targetRole === 'SUPERADMIN') {
        user = db.users.find(u => u.email === 'superadmin@spices.com');
      } else if (targetRole === 'ADMIN') {
        user = db.users.find(u => u.email === 'admin@spices.com');
      } else {
        user = db.users.find(u => u.email === 'user@spices.com');
      }
    }

    if (!user) {
      return NextResponse.json({ error: 'Demo account not found for this role' }, { status: 404 });
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...safeUser } = user;

    const token = signSession({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    const response = NextResponse.json({
      success: true,
      user: safeUser,
      message: `Switched demo identity to ${user.role} (${user.name})`,
    });

    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error('Switch role error:', error);
    return NextResponse.json({ error: 'Failed to switch role' }, { status: 500 });
  }
}
