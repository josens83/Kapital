import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/accounts - 계정 목록 조회
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: accounts, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('account_type')
      .order('display_order');

    if (error) throw error;

    // 유형별로 그룹화
    const grouped = {
      asset: accounts?.filter(a => a.account_type === 'ASSET') || [],
      liability: accounts?.filter(a => a.account_type === 'LIABILITY') || [],
      income: accounts?.filter(a => a.account_type === 'INCOME') || [],
      expense: accounts?.filter(a => a.account_type === 'EXPENSE') || [],
      equity: accounts?.filter(a => a.account_type === 'EQUITY') || [],
    };

    return NextResponse.json(grouped);
  } catch (error: any) {
    console.error('Error fetching accounts:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/accounts - 새 계정 생성
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, account_type, account_subtype, parent_id, icon, color } = body;

    if (!name || !account_type) {
      return NextResponse.json(
        { error: 'Name and account_type are required' },
        { status: 400 }
      );
    }

    const { data: account, error } = await supabase
      .from('accounts')
      .insert({
        user_id: user.id,
        name,
        account_type,
        account_subtype,
        parent_id,
        icon: icon || '📁',
        color: color || '#6B7280',
        currency: 'KRW',
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(account);
  } catch (error: any) {
    console.error('Error creating account:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
