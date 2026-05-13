import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentMonthYear } from '@/lib/utils/date';

export async function GET() {
  try {
    const supabase = await createClient();
    const monthYear = getCurrentMonthYear();

    // 获取当前月份所有已批准的投稿
    const { data: submissions, error } = await supabase
      .from('submissions')
      .select('id, title, abstract, keywords, authors, highlights, pdf_url, submitted_at, vote_count')
      .eq('month_year', monthYear)
      .eq('status', 'approved')
      .order('submitted_at', { ascending: false })
      .returns<Array<{
        id: string;
        title: string;
        abstract: string;
        keywords: string[];
        authors: any;
        highlights: string[];
        pdf_url: string;
        submitted_at: string;
        vote_count: number;
      }>>();

    if (error) {
      console.error('Fetch submissions error:', error);
      return NextResponse.json(
        { error: '获取投稿列表失败' },
        { status: 500 }
      );
    }

    // 随机排序（每30分钟更新一次种子）
    const now = new Date();
    const seed = Math.floor(now.getTime() / (30 * 60 * 1000));

    // 使用种子进行伪随机排序
    const shuffled = (submissions || []).sort((a, b) => {
      const hashA = simpleHash(a.id + seed.toString());
      const hashB = simpleHash(b.id + seed.toString());
      return hashA - hashB;
    });

    return NextResponse.json({
      submissions: shuffled,
      count: shuffled.length,
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}

// 简单哈希函数用于伪随机排序
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}
