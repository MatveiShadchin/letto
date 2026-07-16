import { NextRequest, NextResponse } from 'next/server';
import { hasDatabase, query } from '@/lib/db';
import { Inquiry } from '@/types/inquiry';
import { requireAdmin } from '@/lib/require-admin';
import { getSupabaseAdmin } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  const denied = requireAdmin(request);
  if (denied) return denied;

  try {
    if (!hasDatabase()) {
      const supabase = getSupabaseAdmin();
      const { data, error } = await supabase
        .from('inquiries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return NextResponse.json({ inquiries: data ?? [] });
    }

    const { rows } = await query<Inquiry>(
      'SELECT * FROM inquiries ORDER BY created_at DESC'
    );
    return NextResponse.json({ inquiries: rows });
  } catch (error) {
    console.error('GET /api/inquiries:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Не удалось загрузить заявки' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const message = typeof body.message === 'string' ? body.message.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim() : '';
    const phone = typeof body.phone === 'string' ? body.phone.trim() : '';

    if (!name) {
      return NextResponse.json({ error: 'Укажите имя' }, { status: 400 });
    }
    if (!message) {
      return NextResponse.json({ error: 'Укажите сообщение' }, { status: 400 });
    }
    if (!email && !phone) {
      return NextResponse.json(
        { error: 'Укажите телефон или email для связи' },
        { status: 400 }
      );
    }

    if (!hasDatabase()) {
      const supabase = getSupabaseAdmin();
      const { data, error } = await supabase
        .from('inquiries')
        .insert({
          name,
          email: email || null,
          phone: phone || null,
          message,
          status: 'new',
        })
        .select('*')
        .single();

      if (error) throw error;
      return NextResponse.json({ inquiry: data });
    }

    const { rows } = await query<Inquiry>(
      `INSERT INTO inquiries (name, email, phone, message, status)
       VALUES ($1, $2, $3, $4, 'new')
       RETURNING *`,
      [name, email || null, phone || null, message]
    );
    return NextResponse.json({ inquiry: rows[0] });
  } catch (error) {
    console.error('POST /api/inquiries:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Не удалось отправить заявку' },
      { status: 500 }
    );
  }
}
