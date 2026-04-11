const relativeTimeFormatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

export function formatRelativeTime(isoDateTime) {
  if (!isoDateTime) {
    return '';
  }

  const date = new Date(isoDateTime);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const seconds = Math.round((date.getTime() - Date.now()) / 1000);
  const ranges = [
    { unit: 'year', seconds: 31536000 },
    { unit: 'month', seconds: 2592000 },
    { unit: 'week', seconds: 604800 },
    { unit: 'day', seconds: 86400 },
    { unit: 'hour', seconds: 3600 },
    { unit: 'minute', seconds: 60 },
  ];

  for (const range of ranges) {
    if (Math.abs(seconds) >= range.seconds) {
      const value = Math.round(seconds / range.seconds);
      return relativeTimeFormatter.format(value, range.unit);
    }
  }

  return 'just now';
}
