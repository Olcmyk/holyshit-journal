/**
 * 开发模式日期覆盖工具
 * 用于测试投稿期和投票期的功能
 *
 * ⚠️ 重要提示：
 * - 此工具只影响客户端（浏览器）显示
 * - 不影响服务器端 API 的日期检查
 * - 要测试完整流程（包括 API），请使用环境变量：
 *   在 .env.local 中设置：
 *   NEXT_PUBLIC_DEV_DATE_OVERRIDE=10  # 覆盖为10号
 *   或
 *   NEXT_PUBLIC_DISABLE_DATE_CHECK=true  # 完全禁用日期检查
 */

// 在浏览器 localStorage 中存储覆盖的日期
const STORAGE_KEY = 'dev_date_override';

/**
 * 获取当前日期（如果有覆盖则返回覆盖的日期）
 * ⚠️ 仅客户端有效
 */
export function getDevDate(): Date {
  if (typeof window === 'undefined') {
    return new Date();
  }

  const override = localStorage.getItem(STORAGE_KEY);
  if (override) {
    return new Date(override);
  }

  return new Date();
}

/**
 * 设置日期覆盖（传入日期数字，1-31）
 * ⚠️ 仅影响客户端显示，不影响服务器端 API
 */
export function setDevDateOverride(day: number) {
  if (typeof window === 'undefined') return;

  const now = new Date();
  const overrideDate = new Date(now.getFullYear(), now.getMonth(), day);
  localStorage.setItem(STORAGE_KEY, overrideDate.toISOString());
  console.log(`✅ 客户端日期已覆盖为: ${day}日`);
  console.warn('⚠️ 注意：这只影响客户端显示，不影响服务器端 API！');
  console.warn('⚠️ 要测试完整流程，请在 .env.local 设置环境变量');
}

/**
 * 清除日期覆盖
 */
export function clearDevDateOverride() {
  if (typeof window === 'undefined') return;

  localStorage.removeItem(STORAGE_KEY);
  console.log('✅ 日期覆盖已清除');
}

/**
 * 快捷方法：设置为投稿期（第10天）
 */
export function setSubmissionPeriod() {
  setDevDateOverride(10);
}

/**
 * 快捷方法：设置为投票期（第26天）
 */
export function setVotingPeriod() {
  setDevDateOverride(26);
}

/**
 * 检查是否有日期覆盖
 */
export function hasDevDateOverride(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(STORAGE_KEY) !== null;
}

// 在开发环境下暴露到全局对象，方便在控制台调用
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).devDate = {
    setDay: setDevDateOverride,
    setSubmissionPeriod,
    setVotingPeriod,
    clear: clearDevDateOverride,
    current: getDevDate,
    hasOverride: hasDevDateOverride,
  };

  console.log('🛠️ 开发工具已加载！');
  console.log('');
  console.log('📌 客户端测试（仅UI显示）：');
  console.log('  devDate.setSubmissionPeriod() - 切换到投稿期');
  console.log('  devDate.setVotingPeriod() - 切换到投票期');
  console.log('  devDate.setDay(15) - 设置为15号');
  console.log('  devDate.clear() - 清除覆盖');
  console.log('');
  console.log('📌 完整测试（包括API）：');
  console.log('  在 .env.local 添加：');
  console.log('  NEXT_PUBLIC_DEV_DATE_OVERRIDE=10');
  console.log('  或');
  console.log('  NEXT_PUBLIC_DISABLE_DATE_CHECK=true');
  console.log('');
}
