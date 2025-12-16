import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/budgets - 예산 목록 조회
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const month = searchParams.get('month'); // YYYY-MM format

    let query = supabase
      .from('budgets')
      .select(`
        *,
        category:accounts(id, name, icon)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (month) {
      const startDate = `${month}-01`;
      const endDate = `${month}-31`;
      query = query
        .lte('start_date', endDate)
        .gte('end_date', startDate);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error: any) {
    console.error('Error fetching budgets:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/budgets - 새 예산 생성
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { category_id, amount, period, start_date, end_date, alert_threshold } = body;

    if (!category_id || !amount || !start_date || !end_date) {
      return NextResponse.json(
        { error: 'category_id, amount, start_date, and end_date are required' },
        { status: 400 }
      );
    }

    const { data: budget, error } = await supabase
      .from('budgets')
      .insert({
        user_id: user.id,
        category_id,
        amount: parseFloat(amount),
        period: period || 'monthly',
        start_date,
        end_date,
        alert_threshold: alert_threshold || 80,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(budget);
  } catch (error: any) {
    console.error('Error creating budget:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
