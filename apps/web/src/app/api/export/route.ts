import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const format = searchParams.get('format') || 'csv';
  const type = searchParams.get('type') || 'transactions';
  const startDate = searchParams.get('start');
  const endDate = searchParams.get('end');

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let data: any[] = [];

    if (type === 'transactions') {
      let query = supabase
        .from('journal_entries')
        .select(`
          id,
          date:entry_date,
          description,
          memo,
          created_at,
          journal_lines:transaction_lines (
            amount,
            accounts (
              name,
              type:account_type
            )
          )
        `)
        .eq('user_id', user.id)
        .eq('is_voided', false)
        .order('entry_date', { ascending: false });

      if (startDate) query = query.gte('entry_date', startDate);
      if (endDate) query = query.lte('entry_date', endDate);

      const { data: entries, error } = await query;
      if (error) throw error;

      // Format transactions
      data = (entries || []).map((entry: any) => {
        const lines = entry.journal_lines || [];
        const debitLine = lines.find((l: any) => l.amount > 0);
        const creditLine = lines.find((l: any) => l.amount < 0);

        let transactionType = '이체';
        if (debitLine?.accounts?.type === 'EXPENSE') transactionType = '지출';
        else if (creditLine?.accounts?.type === 'INCOME') transactionType = '수입';

        return {
          날짜: entry.date,
          설명: entry.description,
          유형: transactionType,
          금액: Math.abs(debitLine?.amount || 0),
          출금계좌: creditLine?.accounts?.name || '',
          입금계좌: debitLine?.accounts?.name || '',
          메모: entry.memo || '',
        };
      });
    } else if (type === 'accounts') {
      const { data: accounts, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('display_order');

      if (error) throw error;

      data = (accounts || []).map((acc: any) => ({
        이름: acc.name,
        유형: acc.account_type,
        하위유형: acc.account_subtype || '',
        통화: acc.currency,
      }));
    } else if (type === 'budgets') {
      const { data: budgets, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (error) throw error;

      data = (budgets || []).map((b: any) => ({
        이름: b.name,
        금액: b.amount,
        기간: b.period_type,
        시작일: b.start_date,
        종료일: b.end_date || '',
      }));
    }

    if (format === 'csv') {
      // Generate CSV
      if (data.length === 0) {
        return new NextResponse('데이터가 없습니다', {
          headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        });
      }

      const headers = Object.keys(data[0]);
      const csvRows = [
        headers.join(','),
        ...data.map(row =>
          headers.map(h => {
            const value = row[h];
            // Escape quotes and wrap in quotes if contains comma
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          }).join(',')
        ),
      ];

      const csvContent = csvRows.join('\n');
      const bom = '\uFEFF'; // UTF-8 BOM for Excel compatibility

      return new NextResponse(bom + csvContent, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="kapital-${type}-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    } else if (format === 'json') {
      return NextResponse.json(data);
    }

    return NextResponse.json({ error: 'Invalid format' }, { status: 400 });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}
