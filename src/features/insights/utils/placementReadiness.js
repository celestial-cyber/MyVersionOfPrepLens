export function predictPlacementReadiness({ coding = 0, aptitude = 0, technical = 0, softSkills = 0 }) {
  const score = coding * 0.4 + aptitude * 0.3 + technical * 0.2 + softSkills * 0.1;
  if (score >= 75) return { score: Math.round(score), indicator: 'Placement Ready', color: 'green' };
  if (score >= 45) return { score: Math.round(score), indicator: 'Improving', color: 'yellow' };
  return { score: Math.round(score), indicator: 'Not Ready', color: 'red' };
}

export function consistencyTier({ streakDays = 0, activityCount = 0, testAverage = 0 }) {
  const weighted = streakDays * 0.45 + activityCount * 0.25 + testAverage * 0.3;
  if (weighted >= 70) return 'Placement Ready';
  if (weighted >= 45) return 'Dedicated';
  if (weighted >= 20) return 'Regular';
  return 'Beginner';
}

export function findWeakCategory({ categoryScores = {}, fallback = 'aptitude' }) {
  const entries = Object.entries(categoryScores).filter(([, value]) => Number.isFinite(Number(value)));
  if (!entries.length) return fallback;
  entries.sort((a, b) => Number(a[1]) - Number(b[1]));
  return entries[0][0] || fallback;
}
