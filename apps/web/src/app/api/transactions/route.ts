import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/transactions - 거래 목록 조회
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    let query = supabase
      .from('journal_entries')
      .select(`
        *,
        transaction_lines(
          *,
          account:accounts(id, name, icon, account_type)
        )
      `)
      .eq('user_id', user.id)
      .eq('is_voided', false)
      .order('entry_date', { ascending: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (from) query = query.gte('entry_date', from);
    if (to) query = query.lte('entry_date', to);

    const { data, error } = await query;

    if (error) throw error;

    // 거래 내역 정리
    const transactions = (data || []).map((entry: any) => {
      const lines = entry.transaction_lines || [];
      const expenseLine = lines.find((l: any) => l.account?.account_type === 'EXPENSE');
      const incomeLine = lines.find((l: any) => l.account?.account_type === 'INCOME');
      const assetLine = lines.find((l: any) => l.account?.account_type === 'ASSET');
      const liabilityLine = lines.find((l: any) => l.account?.account_type === 'LIABILITY');

      let type: 'income' | 'expense' | 'transfer' = 'transfer';
      let amount = 0;
      let account_name = '';
      let category_name = '';
      let icon = '💰';

      if (expenseLine) {
        type = 'expense';
        amount = -Math.abs(parseFloat(expenseLine.amount));
        category_name = expenseLine.account?.name || '';
        icon = expenseLine.account?.icon || '💸';
        const paymentLine = lines.find((l: any) => 
          l.account?.account_type === 'ASSET' || l.account?.account_type === 'LIABILITY'
        );
        account_name = paymentLine?.account?.name || '';
      } else if (incomeLine) {
        type = 'income';
        amount = Math.abs(parseFloat(incomeLine.amount));
        category_name = incomeLine.account?.name || '';
        icon = incomeLine.account?.icon || '💵';
        const depositLine = lines.find((l: any) => l.account?.account_type === 'ASSET');
        account_name = depositLine?.account?.name || '';
      } else {
        type = 'transfer';
        const positiveAsset = lines.find((l: any) => 
          l.account?.account_type === 'ASSET' && parseFloat(l.amount) > 0
        );
        amount = positiveAsset ? Math.abs(parseFloat(positiveAsset.amount)) : 0;
        account_name = assetLine?.account?.name || liabilityLine?.account?.name || '';
        icon = '🔄';
      }

      return {
        id: entry.id,
        date: entry.entry_date,
        description: entry.description || '',
        amount,
        account_name,
        category_name,
        icon,
        type,
      };
    });

    return NextResponse.json(transactions);
  } catch (error: any) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/transactions - 새 거래 생성
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { type, amount, description, date, fromAccount, toAccount, memo } = body;

    if (!amount || !description || !date || !fromAccount || !toAccount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    // 복식부기 분개 생성
    // 지출: 비용계정 차변(+), 자산/부채계정 대변(-)
    // 수입: 자산계정 차변(+), 수입계정 대변(-)
    // 이체: 입금계정 차변(+), 출금계정 대변(-)

    // 분개장 엔트리 생성
    const { data: entry, error: entryError } = await supabase
      .from('journal_entries')
      .insert({
        user_id: user.id,
        entry_date: date,
        description,
        memo,
        source: 'manual',
      })
      .select()
      .single();

    if (entryError) throw entryError;

    // 거래 라인 생성 (복식부기)
    const lines = [
      { journal_entry_id: entry.id, account_id: toAccount, amount: parsedAmount },
      { journal_entry_id: entry.id, account_id: fromAccount, amount: -parsedAmount },
    ];

    const { error: linesError } = await supabase
      .from('transaction_lines')
      .insert(lines);

    if (linesError) {
      // 롤백
      await supabase.from('journal_entries').delete().eq('id', entry.id);
      throw linesError;
    }

    return NextResponse.json({ id: entry.id, success: true });
  } catch (error: any) {
    console.error('Error creating transaction:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
