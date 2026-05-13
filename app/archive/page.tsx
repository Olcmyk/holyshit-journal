import { Metadata } from 'next';
import Link from 'next/link';
import { createServiceClient } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: '归档 - Holy S.H.I.T',
  description: '查看历史月份的入选论文',
};

async function getArchiveMonths() {
  const supabase = await createServiceClient();

  const { data, error } = await supabase
    .from('selected_papers')
    .select('month_year')
    .order('month_year', { ascending: false });

  if (error) {
    console.error('Fetch archive months error:', error);
    return [];
  }

  // 去重
  const uniqueMonths = Array.from(new Set((data as any)?.map((d: any) => d.month_year) || []));
  return uniqueMonths;
}

async function getSelectedPapers(monthYear: string) {
  const supabase = await createServiceClient();

  const { data, error } = await supabase
    .from('selected_papers')
    .select(`
      rank,
      submission:submissions (
        id,
        title,
        abstract,
        authors,
        keywords,
        highlights,
        morality_score,
        humor_score,
        scientific_score,
        vote_count,
        final_score,
        created_at,
        pdf_url
      )
    `)
    .eq('month_year', monthYear)
    .order('rank', { ascending: true });

  if (error) {
    console.error('Fetch selected papers error:', error);
    return [];
  }

  return data || [];
}

export default async function ArchivePage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const months = await getArchiveMonths();
  const { month } = await searchParams;
  const selectedMonth = (month || months[0]) as string;
  const papers = selectedMonth ? await getSelectedPapers(selectedMonth) : [];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b-4 border-black py-8">
        <div className="container mx-auto px-4">
          <Link href="/" className="inline-block mb-4 text-sm hover:text-primary">
            ← 返回首页
          </Link>
          <h1 className="font-serif text-5xl font-bold text-center mb-2">
            归档
          </h1>
          <p className="text-center text-gray-600">
            Historical Archives of Selected Papers
          </p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        {/* Month Selector */}
        {months.length > 0 && (
          <div className="mb-12">
            <h2 className="font-serif text-2xl font-bold mb-4">选择月份</h2>
            <div className="flex flex-wrap gap-3">
              {months.map((month: any) => (
                <Link
                  key={month}
                  href={`/archive?month=${month}`}
                  className={`px-6 py-3 border-2 border-black transition-colors ${
                    month === selectedMonth
                      ? 'bg-gold text-white'
                      : 'bg-white hover:bg-gray-50'
                  }`}
                >
                  {month}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Selected Papers */}
        {papers.length > 0 ? (
          <div className="space-y-8">
            <h2 className="font-serif text-3xl font-bold mb-6">
              {selectedMonth} 入选论文
            </h2>
            {papers.map((paper: any) => {
              const submission = paper.submission as any;
              return (
                <article
                  key={submission.id}
                  className="border-2 border-black p-8 bg-white hover:shadow-lg transition-shadow"
                >
                  {/* Rank Badge */}
                  <div className="inline-block bg-gold text-white px-4 py-2 mb-4 font-bold">
                    第 {paper.rank} 名
                  </div>

                  {/* Title */}
                  <h3 className="font-serif text-2xl font-bold mb-3">
                    {submission.title}
                  </h3>

                  {/* Authors */}
                  <p className="text-gray-600 mb-4">
                    {submission.authors.map((a: any) => a.name).join(', ')}
                  </p>

                  {/* Abstract */}
                  <div className="prose max-w-none mb-4">
                    <p className="text-gray-700">{submission.abstract}</p>
                  </div>

                  {/* Keywords */}
                  {submission.keywords && submission.keywords.length > 0 && (
                    <div className="mb-4">
                      <span className="font-semibold">关键词：</span>
                      {submission.keywords.map((keyword: string, idx: number) => (
                        <span key={idx} className="text-gray-600">
                          {keyword}
                          {idx < submission.keywords.length - 1 ? ', ' : ''}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Highlights */}
                  {submission.highlights && (
                    <div className="mb-4 p-4 bg-yellow-50 border-l-4 border-primary">
                      <p className="font-semibold mb-2">亮点：</p>
                      <p className="text-gray-700">{submission.highlights}</p>
                    </div>
                  )}

                  {/* Scores */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4 p-4 bg-gray-50">
                    <div>
                      <p className="text-sm text-gray-600">道德性</p>
                      <p className="text-xl font-bold">{submission.morality_score}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">搞笑性</p>
                      <p className="text-xl font-bold">{submission.humor_score}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">科学性</p>
                      <p className="text-xl font-bold">{submission.scientific_score}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">投票数</p>
                      <p className="text-xl font-bold">{submission.vote_count}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">最终得分</p>
                      <p className="text-xl font-bold text-primary">
                        {submission.final_score.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* View Button */}
                  <a
                    href={submission.pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-6 py-3 bg-black text-white hover:bg-gray-800 transition-colors"
                  >
                    查看 PDF
                  </a>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">
              {months.length === 0
                ? '暂无归档内容'
                : '该月份暂无入选论文'}
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t-4 border-black mt-16 py-8">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>© 2024 Holy S.H.I.T. All rights reserved.</p>
          <p className="text-xs mt-2">
            本站内容仅供娱乐，不代表任何学术机构观点。
          </p>
          <a
            href="https://afdian.com/a/holyshitjournal/plan"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-4 px-4 py-2 border border-gray-400 text-gray-600 hover:border-black hover:text-black transition-colors text-sm"
          >
            赞助项目
          </a>
        </div>
      </footer>
    </div>
  );
}
