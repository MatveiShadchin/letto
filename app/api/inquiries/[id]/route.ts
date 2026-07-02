import { NextRequest, NextResponse } from 'next/server';
import { hasDatabase, query } from '@/lib/db';
import { Inquiry } from '@/types/inquiry';
import { requireAdmin } from '@/lib/require-admin';
import { getSupabaseAdmin } from '@/lib/supabase-server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const denied = requireAdmin(request);
  if (denied) return denied;

  try {
    const body = await request.json();

    if (!hasDatabase()) {
      const supabase = getSupabaseAdmin();
      const { data, error } = await supabase
        .from('inquiries')
        .update({ status: body.status })
        .eq('id', params.id)
        .select('*')
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        return NextResponse.json({ error: 'Заявка не найдена' }, { status: 404 });
      }

      return NextResponse.json({ inquiry: data });
    }

    const { rows } = await query<Inquiry>(
      `UPDATE inquiries SET status = $2 WHERE id = $1 RETURNING *`,
      [params.id, body.status]
    );

    if (!rows[0]) {
      return NextResponse.json({ error: 'Заявка не найдена' }, { status: 404 });
    }

    return NextResponse.json({ inquiry: rows[0] });
  } catch (error) {
    console.error('PATCH /api/inquiries:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Не удалось обновить заявку' },
      { status: 500 }
    );
  }
}
