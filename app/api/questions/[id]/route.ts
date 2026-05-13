import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServiceClient();
    const { id: submissionId } = await params;

    // 获取该投稿的所有题目
    const { data: questions, error } = await supabase
      .from('questions')
      .select('id, question_text, options, correct_answer')
      .eq('submission_id', submissionId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Failed to fetch questions:', error);
      return NextResponse.json(
        { error: '获取题目失败' },
        { status: 500 }
      );
    }

    if (!questions || questions.length === 0) {
      return NextResponse.json(
        { error: '该投稿没有题目' },
        { status: 404 }
      );
    }

    return NextResponse.json({ questions });
  } catch (error) {
    console.error('Questions API error:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}
