// src/utils/helpers.js

/**
 * 주어진 날짜 문자열로부터 지금까지 지난 시간을
 * "몇초 전", "몇분 전", "몇시간 전", "몇일 전" 형태로 반환
 *
 * @param {string} dateString ISO 8601 형식의 날짜 문자열
 * @returns {string} 예: "5분 전", "2시간 전"
 */
export function formatTimeAgo(dateString) {
  const now = Date.now();
  const past = new Date(dateString).getTime();
  const diffSec = Math.floor((now - past) / 1000);

  if (diffSec < 60) {
    return `${diffSec}초 전`;
  }
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) {
    return `${diffMin}분 전`;
  }
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) {
    return `${diffHour}시간 전`;
  }
  const diffDay = Math.floor(diffHour / 24);
  return `${diffDay}일 전`;
}
