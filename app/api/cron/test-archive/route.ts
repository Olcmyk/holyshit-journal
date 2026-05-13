import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * 测试端点 - 用于测试归档逻辑，不检查日期
 * 生产环境请使用 /api/cron/archive-monthly
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 测试模式：不检查日期，直接执行
    const now = new Date();
    const monthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    console.log(`[Test Archive] Starting test archive for ${monthYear}`);

    // 1. Get all approved submissions for this month
    const { data: submissions, error: fetchError } = await supabase
      .from('submissions')
      .select('*')
      .eq('month_year', monthYear)
      .eq('status', 'approved');

    if (fetchError) {
      console.error('[Test Archive] Error fetching submissions:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch submissions' }, { status: 500 });
    }

    if (!submissions || submissions.length === 0) {
      console.log('[Test Archive] No approved submissions found for this month');
      return NextResponse.json({
        message: 'No submissions to archive',
        monthYear
      });
    }

    console.log(`[Test Archive] Found ${submissions.length} approved submissions`);

    // 2. Calculate final scores
    const scoredSubmissions = submissions.map(sub => {
      const scientificNorm = (sub.scientific_score || 0) / 100;
      const humorNorm = (sub.humor_score || 0) / 100;
      const moralityNorm = (sub.morality_score || 0) / 100;
      const voteBonus = (sub.vote_count || 0) + 1;

      const finalScore = scientificNorm * humorNorm * moralityNorm * voteBonus;

      return {
        ...sub,
        calculated_final_score: finalScore
      };
    });

    // 3. Sort by score and select top 10
    scoredSubmissions.sort((a, b) => b.calculated_final_score - a.calculated_final_score);
    const top10 = scoredSubmissions.slice(0, 10);
    const notSelected = scoredSubmissions.slice(10);

    console.log(`[Test Archive] Top 10 submissions selected`);

    // 4. Update final_score in submissions table for all papers
    const scoreUpdates = scoredSubmissions.map(sub =>
      supabase
        .from('submissions')
        .update({ final_score: sub.calculated_final_score })
        .eq('id', sub.id)
    );
    await Promise.all(scoreUpdates);

    // 5. Insert top 10 into selected_papers table
    const selectedPapersData = top10.map((sub, index) => ({
      submission_id: sub.id,
      month_year: monthYear,
      rank: index + 1,
      final_score: sub.calculated_final_score
    }));

    const { error: insertError } = await supabase
      .from('selected_papers')
      .insert(selectedPapersData);

    if (insertError) {
      console.error('[Test Archive] Error inserting selected papers:', insertError);
      return NextResponse.json({ error: 'Failed to insert selected papers' }, { status: 500 });
    }

    console.log(`[Test Archive] Inserted ${top10.length} papers into selected_papers table`);

    // 6. Update status to 'selected' for top 10
    const { error: updateError } = await supabase
      .from('submissions')
      .update({ status: 'selected' })
      .in('id', top10.map(s => s.id));

    if (updateError) {
      console.error('[Test Archive] Error updating submission status:', updateError);
      return NextResponse.json({ error: 'Failed to update submission status' }, { status: 500 });
    }

    // 7. Delete PDFs from Storage for non-selected papers
    if (notSelected.length > 0) {
      const filesToDelete = notSelected.map(sub => {
        const url = new URL(sub.pdf_url);
        const pathParts = url.pathname.split('/');
        return pathParts[pathParts.length - 1];
      });

      console.log(`[Test Archive] Deleting ${filesToDelete.length} PDF files from Storage`);

      const { error: deleteError } = await supabase.storage
        .from('submissions-pdfs')
        .remove(filesToDelete);

      if (deleteError) {
        console.error('[Test Archive] Error deleting PDFs:', deleteError);
      } else {
        console.log(`[Test Archive] Successfully deleted ${filesToDelete.length} PDF files`);
      }
    }

    // 8. Return summary
    return NextResponse.json({
      success: true,
      testMode: true,
      monthYear,
      totalSubmissions: submissions.length,
      selectedCount: top10.length,
      deletedPdfs: notSelected.length,
      top10: top10.map((s, i) => ({
        rank: i + 1,
        title: s.title,
        finalScore: s.calculated_final_score,
        votes: s.vote_count
      }))
    });

  } catch (error) {
    console.error('[Test Archive] Unexpected error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
