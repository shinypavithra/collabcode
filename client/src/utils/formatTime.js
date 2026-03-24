/**
 * Format a date/timestamp to a short time string, e.g. "02:45 PM"
 * @param {Date | string | number} date
 * @returns {string}
 */
export const formatTime = (date) =>
  new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

/**
 * Format a date to a relative string, e.g. "2 minutes ago"
 * Falls back to formatted time if > 1 hour ago.
 * @param {Date | string | number} date
 * @returns {string}
 */
export const formatRelativeTime = (date) => {
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return formatTime(date);
};
