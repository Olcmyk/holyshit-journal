'use client';

import { useEffect, useState } from 'react';
import {
  setSubmissionPeriod,
  setVotingPeriod,
  clearDevDateOverride,
  hasDevDateOverride,
  getDevDate
} from '@/lib/utils/dev-date-override';

export default function DevDateControl() {
  const [isOverridden, setIsOverridden] = useState(false);
  const [currentDay, setCurrentDay] = useState<number>(0);

  useEffect(() => {
    updateStatus();
  }, []);

  const updateStatus = () => {
    setIsOverridden(hasDevDateOverride());
    setCurrentDay(getDevDate().getDate());
  };

  const handleSetSubmission = () => {
    setSubmissionPeriod();
    updateStatus();
    window.location.reload();
  };

  const handleSetVoting = () => {
    setVotingPeriod();
    updateStatus();
    window.location.reload();
  };

  const handleClear = () => {
    clearDevDateOverride();
    updateStatus();
    window.location.reload();
  };

  // 只在开发环境显示
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg shadow-lg z-50 border-2 border-yellow-400">
      <div className="text-xs font-bold mb-2 text-yellow-400">
        🛠️ 开发工具
      </div>

      <div className="text-xs mb-3">
        当前日期: <span className="font-bold">{currentDay}日</span>
        {isOverridden && <span className="text-yellow-400 ml-2">(已覆盖)</span>}
      </div>

      <div className="flex flex-col gap-2">
        <button
          onClick={handleSetSubmission}
          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
        >
          切换到投稿期 (10日)
        </button>

        <button
          onClick={handleSetVoting}
          className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition-colors"
        >
          切换到投票期 (26日)
        </button>

        {isOverridden && (
          <button
            onClick={handleClear}
            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors"
          >
            恢复真实日期
          </button>
        )}
      </div>
    </div>
  );
}
