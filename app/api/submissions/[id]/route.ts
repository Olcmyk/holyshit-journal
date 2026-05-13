import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    const { data: submission, error } = await supabase
      .from('submissions')
      .select('id, title, abstract, authors, keywords, highlights, pdf_url, vote_count')
      .eq('id', id)
      .eq('status', 'approved')
      .single();

    if (error || !submission) {
      return NextResponse.json(
        { error: '投稿不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({ submission });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}
