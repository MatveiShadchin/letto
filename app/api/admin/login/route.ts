import { NextRequest, NextResponse } from 'next/server';
import {
  ADMIN_COOKIE,
  createAdminSessionValue,
  isAdminPasswordValid,
  verifyAdminSession,
} from '@/lib/admin-auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const password = typeof body.password === 'string' ? body.password : '';

    if (!isAdminPasswordValid(password)) {
      return NextResponse.json({ error: 'Неверный пароль' }, { status: 401 });
    }

    const isSecure = request.nextUrl.protocol === 'https:';
    const response = NextResponse.json({ ok: true });
    response.cookies.set(ADMIN_COOKIE, createAdminSessionValue(), {
      httpOnly: true,
      sameSite: 'lax',
      secure: isSecure,
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });
    return response;
  } catch (error) {
    console.error('POST /api/admin/login:', error);
    return NextResponse.json({ error: 'Ошибка входа' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const token = request.cookies.get(ADMIN_COOKIE)?.value;
  return NextResponse.json({ authenticated: verifyAdminSession(token) });
}

export async function DELETE(request: NextRequest) {
  const isSecure = request.nextUrl.protocol === 'https:';
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: isSecure,
    path: '/',
    maxAge: 0,
  });
  return response;
}
