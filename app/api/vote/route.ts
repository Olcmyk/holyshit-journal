import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { isVotingPeriod, getCurrentMonthYear } from '@/lib/utils/date';
import { verifyAltchaPayload } from '@/lib/altcha/verify';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServiceClient();
    const body = await request.json();
    const { submission_id, fingerprint, answers, altchaPayload } = body;

    console.log('Vote API received:', {
      submission_id,
      fingerprint: fingerprint ? `${fingerprint.substring(0, 20)}...` : 'EMPTY',
      answersType: typeof answers,
      answersKeys: answers ? Object.keys(answers).length : 0
    });

    // 验证投票期
    if (!isVotingPeriod()) {
      return NextResponse.json(
        { error: '当前不在投票期（每月16日-月底）' },
        { status: 400 }
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
    if (!submission_id) {
      return NextResponse.json({ error: '缺少 submission_id' }, { status: 400 });
    }
    if (!fingerprint) {
      return NextResponse.json({ error: '缺少 fingerprint（指纹未生成）' }, { status: 400 });
    }
    if (!answers || typeof answers !== 'object') {
      return NextResponse.json({ error: '缺少 answers 或格式错误' }, { status: 400 });
    }
    if (Object.keys(answers).length === 0) {
      return NextResponse.json({ error: '请回答所有问题' }, { status: 400 });
    }

    // 获取客户端 IP
    const ip = request.headers.get('x-forwarded-for') ||
               request.headers.get('x-real-ip') ||
               'unknown';

    // 检查 IP 是否被封禁
    const { data: ipBlock } = await supabase
      .from('ip_blocks')
      .select('blocked_until')
      .eq('ip_address', ip)
      .gte('blocked_until', new Date().toISOString())
      .single();

    if (ipBlock) {
      return NextResponse.json(
        { error: 'IP 已被封禁，请稍后再试' },
        { status: 403 }
      );
    }

    // 检查冷却时间
    const { data: cooldown } = await supabase
      .from('vote_cooldowns')
      .select('cooldown_until')
      .eq('fingerprint', fingerprint)
      .gte('cooldown_until', new Date().toISOString())
      .single() as { data: { cooldown_until: string } | null };

    if (cooldown) {
      const remainingMinutes = Math.ceil(
        (new Date(cooldown.cooldown_until).getTime() - Date.now()) / 60000
      );
      return NextResponse.json(
        { error: `请等待 ${remainingMinutes} 分钟后再试` },
        { status: 429 }
      );
    }

    // 检查是否已投票（fingerprint 或 IP）
    const { data: existingVote } = await supabase
      .from('votes')
      .select('id')
      .eq('submission_id', submission_id)
      .or(`fingerprint.eq.${fingerprint},ip_address.eq.${ip}`)
      .single();

    if (existingVote) {
      return NextResponse.json(
        { error: '您已经为这篇论文投过票了' },
        { status: 400 }
      );
    }

    // 检查同一 IP 在短时间内的投票次数（防止快速切换无痕模式）
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { data: recentVotes, error: recentVotesError } = await supabase
      .from('votes')
      .select('id')
      .eq('ip_address', ip)
      .gte('voted_at', oneHourAgo) as { data: { id: string }[] | null; error: any };

    if (!recentVotesError && recentVotes && recentVotes.length >= 3) {
      // 同一 IP 1小时内投票超过3次，自动封禁
      const blockUntil = new Date(Date.now() + 24 * 60 * 60 * 1000); // 封禁24小时

      await (supabase
        .from('ip_blocks') as any)
        .upsert({
          ip_address: ip,
          reason: '短时间内多次投票',
          blocked_until: blockUntil.toISOString(),
          request_count: recentVotes.length + 1,
        });

      return NextResponse.json(
        { error: '检测到异常投票行为，IP 已被封禁24小时' },
        { status: 403 }
      );
    }

    // 获取问题和正确答案
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select('id, correct_answer')
      .eq('submission_id', submission_id) as { data: { id: string; correct_answer: number }[] | null; error: any };

    if (questionsError || !questions || questions.length === 0) {
      return NextResponse.json(
        { error: '无法获取问题' },
        { status: 500 }
      );
    }

    // 验证答案
    let correctCount = 0;
    for (const question of questions) {
      if (answers[question.id] === question.correct_answer) {
        correctCount++;
      }
    }

    const allCorrect = correctCount === questions.length;

    if (!allCorrect) {
      // 答错了，设置冷却时间
      const cooldownUntil = new Date(Date.now() + 10 * 60 * 1000); // 10分钟后

      await supabase
        .from('vote_cooldowns')
        .upsert({
          submission_id,
          fingerprint,
          ip_address: ip,
          cooldown_until: cooldownUntil.toISOString(),
        } as any);

      return NextResponse.json(
        { error: '答案错误，请10分钟后再试' },
        { status: 400 }
      );
    }

    // 答对了，记录投票
    const { error: voteError } = await supabase
      .from('votes')
      .insert({
        submission_id,
        fingerprint,
        ip_address: ip,
      } as any);

    if (voteError) {
      console.error('Vote insert error:', voteError);
      return NextResponse.json(
        { error: '投票失败' },
        { status: 500 }
      );
    }

    // 更新投稿的投票数
    const { error: updateError } = await (supabase as any).rpc('increment_vote_count', {
      submission_id_param: submission_id,
    });

    if (updateError) {
      console.error('Vote count update error:', updateError);
      // 不返回错误，因为投票已经记录了
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Vote API error:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}
