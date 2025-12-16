import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/transactions/:id - 거래 상세 조회
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
      .from('journal_entries')
      .select(`
        *,
        transaction_lines(
          *,
          account:accounts(id, name, icon, account_type)
        )
      `)
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error fetching transaction:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/transactions/:id - 거래 수정
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
    const { description, date, memo, fromAccount, toAccount, amount } = body;

    // Verify ownership
    const { data: existing, error: existingError } = await supabase
      .from('journal_entries')
      .select('id')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single();

    if (existingError || !existing) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    // Update journal entry
    const { error: entryError } = await supabase
      .from('journal_entries')
      .update({
        description,
        entry_date: date,
        memo: memo || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id);

    if (entryError) throw entryError;

    // Update transaction lines if accounts changed
    if (fromAccount && toAccount && amount) {
      // Delete existing lines
      await supabase
        .from('transaction_lines')
        .delete()
        .eq('journal_entry_id', params.id);

      // Create new lines
      const parsedAmount = parseFloat(amount);
      const lines = [
        { journal_entry_id: params.id, account_id: toAccount, amount: parsedAmount },
        { journal_entry_id: params.id, account_id: fromAccount, amount: -parsedAmount },
      ];

      const { error: linesError } = await supabase
        .from('transaction_lines')
        .insert(lines);

      if (linesError) throw linesError;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating transaction:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/transactions/:id - 거래 삭제
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
      .from('journal_entries')
      .select('id')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single();

    if (existingError || !existing) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    // Delete transaction lines first
    await supabase
      .from('transaction_lines')
      .delete()
      .eq('journal_entry_id', params.id);

    // Delete journal entry
    const { error: deleteError } = await supabase
      .from('journal_entries')
      .delete()
      .eq('id', params.id);

    if (deleteError) throw deleteError;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting transaction:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
