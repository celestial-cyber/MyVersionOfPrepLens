export function calculateReadinessScore(progress = {}) {
  return Math.max(0, Math.min(100, Number(progress.readinessScore) || 0));
}
