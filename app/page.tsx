import Link from 'next/link';
import { isSubmissionPeriod, isVotingPeriod } from '@/lib/utils/date';

export default function HomePage() {
  const isSubmission = isSubmissionPeriod();
  const isVoting = isVotingPeriod();

  return (
    <div className="min-h-screen">
      {/* Top Status Bar */}
      <div className="border-b-2 border-black py-2 px-8 bg-gold/10">
        <div className="max-w-6xl mx-auto text-center">
          <p className="font-sans text-sm uppercase tracking-wider">
            当前状态：
            {isSubmission && <span className="font-semibold">投稿期（1-24日）</span>}
            {isVoting && <span className="font-semibold">投票期（25日-月末）</span>}
            {!isSubmission && !isVoting && <span className="font-semibold">评选中</span>}
          </p>
        </div>
      </div>

      {/* Hero Section */}
      <section className="py-16 px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-serif text-7xl md:text-8xl font-bold mb-6">
            Holy S.H.I.T
          </h1>
          <p className="font-serif text-2xl md:text-3xl mb-4 tracking-wider">
            Sciences · Humanities · Information · Technology
          </p>
          <p className="font-serif text-xl md:text-2xl italic text-gray-600">
            Truth Fades, S.H.I.T Lasts.
          </p>
        </div>
      </section>

      {/* Main Action Cards */}
      <section className="border-y-2 border-black py-16 px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Submit Card */}
            {isSubmission ? (
              <Link
                href="/submit"
                className="group border-2 border-black p-10 bg-white hover:bg-gold/5 hover:border-gold transition-all"
              >
                <h3 className="font-serif text-3xl font-bold mb-4">
                  排泄你的学术成果
                </h3>
                <p className="font-sans text-gray-700 mb-6 leading-relaxed">
                  提交PDF，AI审稿
                </p>
                <div className="font-sans text-lg font-semibold text-gold group-hover:text-gold-dark">
                  立即投稿 →
                </div>
              </Link>
            ) : (
              <div className="border-2 border-gray-300 p-10 bg-gray-50 opacity-60">
                <h3 className="font-serif text-3xl font-bold mb-4 text-gray-600">
                  排泄你的学术成果
                </h3>
                <p className="font-sans text-gray-500 mb-6 leading-relaxed">
                  提交PDF，AI审稿
                </p>
                <div className="font-sans text-lg font-semibold text-gray-400">
                  投稿期未开放
                </div>
              </div>
            )}

            {/* Latrine Card */}
            <Link
              href="/latrine"
              className="group border-2 border-black p-10 bg-white hover:bg-gold/5 hover:border-gold transition-all"
            >
              <h3 className="font-serif text-3xl font-bold mb-4">
                进入旱厕
              </h3>
              <p className="font-sans text-gray-700 mb-6 leading-relaxed">
                阅读投稿，参与投票
              </p>
              <div className="font-sans text-lg font-semibold text-gold group-hover:text-gold-dark">
                {isVoting ? '前往投票' : '查看稿件'} →
              </div>
            </Link>

            {/* Archive Card */}
            <Link
              href="/archive"
              className="group border-2 border-black p-10 bg-white hover:bg-gold/5 hover:border-gold transition-all"
            >
              <h3 className="font-serif text-3xl font-bold mb-4">
                浏览往期构石
              </h3>
              <p className="font-sans text-gray-700 mb-6 leading-relaxed">
                查看历史获奖作品
              </p>
              <div className="font-sans text-lg font-semibold text-gold group-hover:text-gold-dark">
                进入档案馆 →
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-serif text-3xl font-bold mb-6 text-center">关于本刊</h2>
          <div className="prose prose-lg max-w-none font-sans">
            <p className="text-lg leading-relaxed mb-4">
              <span className="font-serif text-2xl font-bold">Holy S.H.I.T</span>
              是一本致力于发表最具讽刺性、科学性和娱乐性学术成果的月刊。
              我们相信，在这个充满荒诞的世界里，只有 S.H.I.T 能够永恒。
            </p>
            <p className="text-lg leading-relaxed">
              每月1-24日为投稿期，25日至月末为投票期。
              月末零点，我们将从所有投稿中选出得分最高的前10篇，
              永久收录于本刊的神圣殿堂。
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t-2 border-black py-8 px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <p className="font-serif text-sm text-gray-600">
              © {new Date().getFullYear()} Holy S.H.I.T. All rights reserved.
            </p>
            <a
              href="https://github.com/Olcmyk/holyshit-journal"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-gray-600 hover:text-black transition-colors"
              aria-label="View source on GitHub"
            >
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </a>
          </div>
          <p className="font-sans text-xs text-gray-500 mt-2">
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
