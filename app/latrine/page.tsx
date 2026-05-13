'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { isVotingPeriod } from '@/lib/utils/date';

interface Submission {
  id: string;
  title: string;
  abstract: string;
  keywords: string[];
  authors: Array<{ name: string; affiliation: string }>;
  highlights: string[];
  pdf_url: string;
  submitted_at: string;
  vote_count: number;
}

export default function LatrinePage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [isVoting, setIsVoting] = useState(false);

  useEffect(() => {
    setIsVoting(isVotingPeriod());
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const response = await fetch('/api/submissions');
      const data = await response.json();
      setSubmissions(data.submissions || []);
    } catch (error) {
      console.error('Failed to fetch submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-serif text-gray-900">加载中...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <Link href="/" className="inline-block mb-4 text-sm text-gray-600 hover:text-gray-900">
            ← 返回首页
          </Link>
          <h1 className="text-4xl font-serif font-bold text-gray-900 mb-2">
            旱厕 The Latrine
          </h1>
          <p className="text-gray-600">
            {isVoting ? '投票期：为您心仪的作品投票' : '投稿期：浏览已提交的作品'}
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        {submissions.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-gray-600 font-serif">
              本月暂无投稿
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {submissions.map((submission) => (
              <article
                key={submission.id}
                className="border border-gray-200 p-8 hover:border-gray-300 transition-colors"
              >
                {/* Title */}
                <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">
                  {submission.title}
                </h2>

                {/* Authors */}
                <div className="text-sm text-gray-600 mb-4">
                  {submission.authors.map((author, idx) => (
                    <span key={idx}>
                      {author.name}
                      <sup className="ml-1">{author.affiliation}</sup>
                      {idx < submission.authors.length - 1 && ', '}
                    </span>
                  ))}
                </div>

                {/* Abstract */}
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">摘要</h3>
                  <p className="text-gray-700 leading-relaxed">{submission.abstract}</p>
                </div>

                {/* Keywords */}
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">关键词</h3>
                  <div className="flex flex-wrap gap-2">
                    {submission.keywords.map((keyword, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-gray-100 text-gray-700 text-sm"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Highlights */}
                {submission.highlights.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">亮点</h3>
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                      {submission.highlights.map((highlight, idx) => (
                        <li key={idx}>{highlight}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-4 mt-6 pt-6 border-t border-gray-200">
                  <a
                    href={submission.pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-2 bg-gray-900 text-white hover:bg-gray-800 transition-colors"
                  >
                    查看 PDF
                  </a>

                  {isVoting && (
                    <Link
                      href={`/vote/${submission.id}`}
                      className="px-6 py-2 border border-gray-900 text-gray-900 hover:bg-gray-50 transition-colors"
                    >
                      投票支持
                    </Link>
                  )}

                  <div className="ml-auto text-sm text-gray-600">
                    {submission.vote_count} 票
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
