'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle } from 'lucide-react';

export default function SubmitSuccessPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/latrine');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="max-w-2xl mx-auto px-4 text-center">
        {/* Success Icon */}
        <div className="mb-8 flex justify-center">
          <CheckCircle size={120} className="text-green-600" />
        </div>

        {/* Success Message */}
        <h1 className="font-serif text-5xl font-bold mb-4">
          提交成功！
        </h1>
        
        <p className="text-xl text-gray-700 mb-8">
          您的论文已成功提交到 Holy S.H.I.T 平台
        </p>

        {/* Info Box */}
        <div className="border-4 border-black p-8 mb-8 text-left">
          <h2 className="font-bold text-2xl mb-4">接下来会发生什么？</h2>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start gap-3">
              <span className="text-2xl">🤖</span>
              <span>
                <strong>AI 审核：</strong>我们的 AI 系统正在评估您的论文的道德性、搞笑程度和科学性
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-2xl">❓</span>
              <span>
                <strong>生成题目：</strong>AI 会根据论文内容生成验证题目，确保投票者真正阅读了您的作品
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-2xl">🚽</span>
              <span>
                <strong>进入旱厕：</strong>审核通过后，您的论文将出现在旱厕列表中，接受公众投票
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-2xl">🏆</span>
              <span>
                <strong>角逐奖项：</strong>获得足够票数的论文将有机会赢得年度最佳讽刺论文奖
              </span>
            </li>
          </ul>
        </div>

        {/* Countdown */}
        <p className="text-gray-600 mb-6">
          {countdown} 秒后自动跳转到旱厕页面...
        </p>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => router.push('/latrine')}
            className="px-8 py-3 bg-black text-white font-bold hover:bg-gray-800 transition-colors"
          >
            立即前往旱厕
          </button>
          <button
            onClick={() => router.push('/')}
            className="px-8 py-3 border-2 border-black font-bold hover:bg-gray-100 transition-colors"
          >
            返回首页
          </button>
        </div>
      </div>
    </div>
  );
}
