import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/recurring/:id - 반복 거래 상세 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('recurring_transactions')
      .select(`
        *,
        from_account:accounts!recurring_transactions_from_account_id_fkey(id, name, icon),
        to_account:accounts!recurring_transactions_to_account_id_fkey(id, name, icon)
      `)
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error fetching recurring transaction:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/recurring/:id - 반복 거래 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      description,
      amount,
      from_account_id,
      to_account_id,
      frequency,
      start_date,
      end_date,
      is_active,
    } = body;

    // Verify ownership
    const { data: existing, error: existingError } = await supabase
      .from('recurring_transactions')
      .select('id')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single();

    if (existingError || !existing) {
      return NextResponse.json({ error: 'Recurring transaction not found' }, { status: 404 });
    }

    const { error } = await supabase
      .from('recurring_transactions')
      .update({
        description,
        amount: parseFloat(amount),
        from_account_id,
        to_account_id,
        frequency,
        start_date,
        end_date: end_date || null,
        is_active,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating recurring transaction:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/recurring/:id - 반복 거래 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify ownership
    const { data: existing, error: existingError } = await supabase
      .from('recurring_transactions')
      .select('id')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single();

    if (existingError || !existing) {
      return NextResponse.json({ error: 'Recurring transaction not found' }, { status: 404 });
    }

    const { error } = await supabase
      .from('recurring_transactions')
      .delete()
      .eq('id', params.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting recurring transaction:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
