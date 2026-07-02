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

    if (!hasDatabase()) {
      const supabase = getSupabaseAdmin();
      const { data, error } = await supabase
        .from('inquiries')
        .insert({
          name: body.name,
          email: body.email || null,
          phone: body.phone || null,
          message: body.message,
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
      [body.name, body.email || null, body.phone || null, body.message]
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
