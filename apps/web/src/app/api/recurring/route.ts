import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/recurring - 반복 거래 목록 조회
export async function GET(request: NextRequest) {
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
      .eq('user_id', user.id)
      .order('next_execution', { ascending: true });

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error: any) {
    console.error('Error fetching recurring transactions:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/recurring - 새 반복 거래 생성
export async function POST(request: NextRequest) {
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
    } = body;

    if (!description || !amount || !from_account_id || !to_account_id || !frequency || !start_date) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('recurring_transactions')
      .insert({
        user_id: user.id,
        description,
        amount: parseFloat(amount),
        from_account_id,
        to_account_id,
        frequency,
        start_date,
        end_date: end_date || null,
        next_execution: start_date,
        is_active: true,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error creating recurring transaction:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
