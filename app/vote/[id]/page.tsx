'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import FingerprintJS from '@fingerprintjs/fingerprintjs';
import { isVotingPeriod } from '@/lib/utils/date';
import AltchaWidget from '@/app/components/AltchaWidget';

interface Question {
  id: string;
  question_text: string;
  options: string[];
  correct_answer: number;
}

interface Submission {
  id: string;
  title: string;
  abstract: string;
  authors: Array<{ name: string; affiliation: string }>;
}

export default function VotePage() {
  const params = useParams();
  const router = useRouter();
  const submissionId = params.id as string;

  const [submission, setSubmission] = useState<Submission | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fingerprint, setFingerprint] = useState('');
  const [altchaPayload, setAltchaPayload] = useState<string>('');
  const [altchaVerified, setAltchaVerified] = useState(false);

  useEffect(() => {
    if (!isVotingPeriod()) {
      router.push('/latrine');
      return;
    }

    initFingerprint();
    fetchData();
  }, [submissionId]);

  const initFingerprint = async () => {
    const fp = await FingerprintJS.load();
    const result = await fp.get();
    setFingerprint(result.visitorId);
  };

  const fetchData = async () => {
    try {
      const [submissionRes, questionsRes] = await Promise.all([
        fetch(`/api/submissions/${submissionId}`),
        fetch(`/api/questions/${submissionId}`),
      ]);

      const submissionData = await submissionRes.json();
      const questionsData = await questionsRes.json();

      if (submissionData.submission) {
        setSubmission(submissionData.submission);
      }

      if (questionsData.questions) {
        setQuestions(questionsData.questions);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setError('加载失败，请刷新重试');
    } finally {
      setLoading(false);
    }
  };

  const handleAltchaVerified = (payload: string) => {
    setAltchaPayload(payload);
    setAltchaVerified(true);
    setError('');
  };

  const handleAltchaStateChange = (state: string) => {
    if (state !== 'verified') {
      setAltchaVerified(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 检查是否所有题目都已回答
    if (Object.keys(answers).length !== questions.length) {
      setError('请回答所有问题');
      return;
    }

    // 检查指纹是否已生成
    if (!fingerprint) {
      setError('正在初始化，请稍后再试');
      return;
    }

    // 验证 ALTCHA
    if (!altchaVerified || !altchaPayload) {
      setError('请完成验证码验证');
      return;
    }

    setSubmitting(true);

    try {
      console.log('Submitting vote:', {
        submission_id: submissionId,
        fingerprint: fingerprint ? `${fingerprint.substring(0, 20)}...` : 'EMPTY',
        answersCount: Object.keys(answers).length,
        answers
      });

      const response = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submission_id: submissionId,
          fingerprint,
          answers,
          altchaPayload,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || '投票失败');
        return;
      }

      // 投票成功，返回旱厕列表
      router.push('/latrine?voted=true');
    } catch (error) {
      console.error('Vote error:', error);
      setError('网络错误，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-2xl font-serif text-gray-900">加载中...</div>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">投稿不存在</p>
          <Link href="/latrine" className="text-gray-900 underline">
            返回旱厕
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <Link href="/latrine" className="inline-block mb-4 text-sm text-gray-600 hover:text-gray-900">
            ← 返回旱厕
          </Link>
          <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">
            投票支持
          </h1>
          <p className="text-gray-600">
            回答问题以证明您已阅读论文
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Submission Info */}
        <div className="mb-12 pb-8 border-b border-gray-200">
          <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">
            {submission.title}
          </h2>
          <div className="text-sm text-gray-600 mb-4">
            {submission.authors.map((author, idx) => (
              <span key={idx}>
                {author.name}
                <sup className="ml-1">{author.affiliation}</sup>
                {idx < submission.authors.length - 1 && ', '}
              </span>
            ))}
          </div>
          <p className="text-gray-700 leading-relaxed">{submission.abstract}</p>
        </div>

        {/* Quiz Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {questions.map((question, qIdx) => (
            <div key={question.id} className="border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                问题 {qIdx + 1}: {question.question_text}
              </h3>
              <div className="space-y-3">
                {question.options.map((option, oIdx) => (
                  <label
                    key={oIdx}
                    className="flex items-start gap-3 cursor-pointer hover:bg-gray-50 p-3 transition-colors"
                  >
                    <input
                      type="radio"
                      name={question.id}
                      value={oIdx}
                      checked={answers[question.id] === oIdx}
                      onChange={() =>
                        setAnswers({ ...answers, [question.id]: oIdx })
                      }
                      className="mt-1"
                    />
                    <span className="text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700">
              {error}
            </div>
          )}

          {/* ALTCHA Widget */}
          <div className="border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              验证码验证
            </h3>
            <AltchaWidget
              onVerified={handleAltchaVerified}
              onStateChange={handleAltchaStateChange}
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={submitting || Object.keys(answers).length !== questions.length || !altchaVerified}
              className="px-8 py-3 bg-gray-900 text-white hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? '提交中...' : '提交投票'}
            </button>
            <Link
              href="/latrine"
              className="px-8 py-3 border border-gray-900 text-gray-900 hover:bg-gray-50 transition-colors"
            >
              取消
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}
