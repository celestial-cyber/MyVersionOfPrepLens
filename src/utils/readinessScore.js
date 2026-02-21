// Readiness score calculation utility
export function calculateReadinessScore(activity = {}, streak = 0) {
  const {
    codingProblemsSolved = 0,
    aptitudeHours = 0,
    coreTopicsCovered = 0,
    softSkillsPractice = 0,
  } = activity

  let score =
    codingProblemsSolved * 0.4 +
    aptitudeHours * 0.3 +
    coreTopicsCovered * 0.2 +
    softSkillsPractice * 0.1

  // Bonus for consistency
  if (streak > 5) score += 10

  // Clamp between 0 and 100
  score = Math.max(0, Math.min(100, Number(score)))
  return Math.round(score * 100) / 100
}
