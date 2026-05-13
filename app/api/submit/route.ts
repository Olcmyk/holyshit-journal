import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { getCurrentMonthYear, isSubmissionPeriod } from '@/lib/utils/date';
import { reviewSubmission } from '@/lib/ai/silicon-flow';
import { verifyAltchaPayload } from '@/lib/altcha/verify';

export async function POST(request: NextRequest) {
  try {
    console.log('[Submit] Starting submission process');

    // 检查是否在投稿期
    if (!isSubmissionPeriod()) {
      return NextResponse.json(
        { error: '当前不在投稿期（1-24日）' },
        { status: 400 }
      );
    }

    // 获取客户端 IP
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
               request.headers.get('x-real-ip') ||
               'unknown';

    // 创建 Supabase 客户端用于 IP 检查
    const supabase = await createServiceClient();

    // 检查 IP 是否被封禁
    const { data: ipBlock } = await (supabase
      .from('ip_blocks')
      .select('blocked_until, reason')
      .eq('ip_address', ip)
      .gte('blocked_until', new Date().toISOString())
      .maybeSingle() as any);

    if (ipBlock) {
      const remainingHours = Math.ceil(
        (new Date(ipBlock.blocked_until).getTime() - Date.now()) / 3600000
      );
      return NextResponse.json(
        { error: `IP 已被封禁，请 ${remainingHours} 小时后再试。原因：${ipBlock.reason}` },
        { status: 403 }
      );
    }

    // 检查同一 IP 当天的投稿次数（一天最多3篇）
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayStartISO = todayStart.toISOString();

    const { data: todaySubmissions, error: todaySubmissionsError } = await supabase
      .from('submissions')
      .select('id, created_at')
      .eq('ip_address', ip)
      .gte('created_at', todayStartISO) as { data: { id: string; created_at: string }[] | null; error: any };

    if (!todaySubmissionsError && todaySubmissions && todaySubmissions.length >= 3) {
      return NextResponse.json(
        { error: '每个 IP 每天最多只能投稿 3 篇，请明天再试' },
        { status: 403 }
      );
    }

    // 解析表单数据
    const formData = await request.formData();
    const title = formData.get('title') as string;
    const abstract = formData.get('abstract') as string;
    const keywords = formData.get('keywords') as string;
    const highlights = formData.get('highlights') as string;
    const authorsJson = formData.get('authors') as string;
    const pdfFile = formData.get('pdf') as File;
    const extractedText = formData.get('extractedText') as string;
    const pdfHash = formData.get('pdfHash') as string; // 从客户端接收哈希值
    const pageCountStr = formData.get('pageCount') as string; // 从客户端接收页数
    const altchaPayload = formData.get('altchaPayload') as string;
    const fingerprint = formData.get('fingerprint') as string;

    // 验证指纹
    if (!fingerprint) {
      return NextResponse.json(
        { error: '缺少设备指纹，请刷新页面重试' },
        { status: 400 }
      );
    }

    // 检查同一指纹当天的投稿次数（一天最多3篇）
    const { data: fingerprintSubmissions, error: fingerprintSubmissionsError } = await supabase
      .from('submissions')
      .select('id, created_at')
      .eq('fingerprint', fingerprint)
      .gte('created_at', todayStartISO) as { data: { id: string; created_at: string }[] | null; error: any };

    if (!fingerprintSubmissionsError && fingerprintSubmissions && fingerprintSubmissions.length >= 3) {
      return NextResponse.json(
        { error: '每个设备每天最多只能投稿 3 篇，请明天再试' },
        { status: 403 }
      );
    }

    // 验证 ALTCHA
    if (!altchaPayload) {
      return NextResponse.json(
        { error: '缺少验证码' },
        { status: 400 }
      );
    }

    const isAltchaValid = await verifyAltchaPayload(altchaPayload);
    if (!isAltchaValid) {
      return NextResponse.json(
        { error: '验证码验证失败，请重试' },
        { status: 400 }
      );
    }

    // 验证必填字段
    if (!title || !abstract || !keywords || !authorsJson || !pdfFile || !extractedText || !pdfHash || !pageCountStr) {
      return NextResponse.json(
        { error: '缺少必填字段' },
        { status: 400 }
      );
    }

    const authors = JSON.parse(authorsJson);
    const pageCount = parseInt(pageCountStr, 10);
    const keywordsArray = keywords.split(',').map(k => k.trim()).filter(k => k);
    const highlightsArray = highlights
      ? highlights.split('\n').map(h => h.trim()).filter(h => h)
      : [];

    // 验证 PDF
    if (pdfFile.size > 2 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'PDF 文件不能超过 2MB' },
        { status: 400 }
      );
    }

    // 验证页数（客户端已检查，这里再次验证防止篡改）
    if (pageCount > 10) {
      return NextResponse.json(
        { error: `PDF 页数超过限制（${pageCount} 页，最多 10 页）` },
        { status: 400 }
      );
    }

    // 检查是否重复提交
    const { data: existingSubmission } = await supabase
      .from('submissions')
      .select('id')
      .eq('pdf_hash', pdfHash)
      .single();

    if (existingSubmission) {
      return NextResponse.json(
        { error: '该 PDF 已经提交过了' },
        { status: 400 }
      );
    }

    // 上传 PDF 到 Supabase Storage
    const fileName = `${Date.now()}-${pdfHash}.pdf`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('submissions-pdfs')
      .upload(fileName, pdfFile, {
        contentType: 'application/pdf',
        cacheControl: '3600',
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json(
        { error: '文件上传失败' },
        { status: 500 }
      );
    }

    // 获取公开 URL
    const { data: urlData } = supabase.storage
      .from('submissions-pdfs')
      .getPublicUrl(fileName);

    const pdfUrl = urlData.publicUrl;

    // 创建投稿记录
    const monthYear = getCurrentMonthYear();
    const { data: submission, error: insertError } = await supabase
      .from('submissions')
      .insert({
        title,
        abstract,
        keywords: keywordsArray,
        authors,
        highlights: highlightsArray,
        pdf_url: pdfUrl,
        pdf_hash: pdfHash,
        pdf_pages: pageCount,
        month_year: monthYear,
        status: 'pending',
        ip_address: ip,
        fingerprint: fingerprint,
      } as any)
      .select()
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      return NextResponse.json(
        { error: '提交失败' },
        { status: 500 }
      );
    }

    const submissionId = (submission as any)?.id;

    // 异步触发 AI 审核（不阻塞响应）
    triggerAIReview(submissionId, extractedText, {
      title,
      abstract,
      authors,
      keywords: keywordsArray,
    }).catch(err => {
      console.error('AI review error:', err);
    });

    return NextResponse.json({
      success: true,
      submissionId: submissionId,
      message: '投稿成功！AI 正在审核中...',
    });
  } catch (error) {
    console.error('Submit error:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined,
    });
    return NextResponse.json(
      {
        error: '服务器错误',
        details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined
      },
      { status: 500 }
    );
  }
}

// 异步 AI 审核函数
async function triggerAIReview(
  submissionId: string,
  pdfText: string,
  metadata: {
    title: string;
    abstract: string;
    authors: any[];
    keywords: string[];
  }
) {
  try {
    const supabase = await createServiceClient();

    // 调用 AI 审核（文本已经从客户端提取）
    const reviewResult = await reviewSubmission(pdfText, metadata);

    // 更新投稿状态
    if (reviewResult.has_illegal_content) {
      // 违法内容，拒绝
      await (supabase
        .from('submissions') as any)
        .update({
          status: 'rejected',
          rejection_reason: reviewResult.rejection_reason,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', submissionId);
    } else {
      // 通过审核
      await (supabase
        .from('submissions') as any)
        .update({
          status: 'approved',
          morality_score: reviewResult.morality_score,
          humor_score: reviewResult.humor_score,
          scientific_score: reviewResult.scientific_score,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', submissionId);

      // 保存测试题
      await supabase.from('questions').insert({
        submission_id: submissionId,
        question_text: reviewResult.question.question_text,
        options: reviewResult.question.options,
        correct_answer: reviewResult.question.correct_answer,
      } as any);
    }
  } catch (error) {
    console.error('AI review failed:', error);
    // AI 审核失败，保持 pending 状态
  }
}
