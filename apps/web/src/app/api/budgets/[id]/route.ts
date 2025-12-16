import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/budgets/:id - 예산 상세 조회
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

    const { data: budget, error } = await supabase
      .from('budgets')
      .select(`
        *,
        category:accounts(id, name, icon, account_type)
      `)
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single();

    if (error) throw error;

    // 해당 카테고리의 지출 계산
    if (budget?.category_id) {
      const { data: lines } = await supabase
        .from('transaction_lines')
        .select(`
          amount,
          journal_entries!inner(entry_date, user_id, is_voided)
        `)
        .eq('account_id', budget.category_id)
        .eq('journal_entries.user_id', user.id)
        .eq('journal_entries.is_voided', false)
        .gte('journal_entries.entry_date', budget.start_date)
        .lte('journal_entries.entry_date', budget.end_date);

      const spent = lines?.reduce((sum, line) => sum + Math.abs(parseFloat(line.amount || '0')), 0) || 0;
      return NextResponse.json({ ...budget, spent });
    }

    return NextResponse.json(budget);
  } catch (error: any) {
    console.error('Error fetching budget:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/budgets/:id - 예산 수정
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
    const { category_id, amount, period, start_date, end_date, alert_threshold } = body;

    // Verify ownership
    const { data: existing, error: existingError } = await supabase
      .from('budgets')
      .select('id')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single();

    if (existingError || !existing) {
      return NextResponse.json({ error: 'Budget not found' }, { status: 404 });
    }

    const { error } = await supabase
      .from('budgets')
      .update({
        category_id,
        amount: parseFloat(amount),
        period,
        start_date,
        end_date,
        alert_threshold,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating budget:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/budgets/:id - 예산 삭제
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
      .from('budgets')
      .select('id')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single();

    if (existingError || !existing) {
      return NextResponse.json({ error: 'Budget not found' }, { status: 404 });
    }

    const { error } = await supabase
      .from('budgets')
      .delete()
      .eq('id', params.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting budget:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
