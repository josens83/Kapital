import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/accounts/:id - 계정 상세 조회
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
      .from('accounts')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single();

    if (error) throw error;

    // 잔액 계산
    const { data: lines } = await supabase
      .from('transaction_lines')
      .select('amount')
      .eq('account_id', params.id);

    const balance = lines?.reduce((sum, line) => sum + parseFloat(line.amount || '0'), 0) || 0;

    return NextResponse.json({ ...data, balance });
  } catch (error: any) {
    console.error('Error fetching account:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/accounts/:id - 계정 수정
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
    const { name, account_subtype, icon, color, is_active } = body;

    // Verify ownership
    const { data: existing, error: existingError } = await supabase
      .from('accounts')
      .select('id')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single();

    if (existingError || !existing) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    const { error } = await supabase
      .from('accounts')
      .update({
        name,
        account_subtype,
        icon,
        color,
        is_active,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating account:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/accounts/:id - 계정 삭제 (soft delete)
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
      .from('accounts')
      .select('id')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single();

    if (existingError || !existing) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    // Soft delete - mark as inactive
    const { error } = await supabase
      .from('accounts')
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting account:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
