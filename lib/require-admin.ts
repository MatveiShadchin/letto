import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession, ADMIN_COOKIE } from '@/lib/admin-auth';

export function requireAdmin(request: NextRequest): NextResponse | null {
  const token = request.cookies.get(ADMIN_COOKIE)?.value;
  if (!verifyAdminSession(token)) {
    return NextResponse.json({ error: 'Нужна авторизация администратора' }, { status: 401 });
  }
  return null;
}
