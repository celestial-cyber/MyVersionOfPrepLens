const IMPROVEMENT_LIBRARY = {
  aptitude: ['Practice percentages and ratio questions', 'Solve 20 probability problems', 'Take a timed aptitude drill'],
  technical: ['Revise DSA basics for 45 minutes daily', 'Solve 3 coding problems per day', 'Review system design fundamentals'],
  reasoning: ['Solve logical puzzle sets', 'Practice seating arrangement questions', 'Attempt mixed reasoning mock test'],
  verbal: ['Read and summarize one passage daily', 'Practice grammar error spotting', 'Attempt vocabulary quiz of 25 words'],
  softskills: ['Practice interview storytelling', 'Record a mock answer and review', 'Prepare STAR format examples'],
};

function normalizeLabel(value) {
  const key = String(value || '').toLowerCase();
  if (key === 'softskills') return 'Soft Skills';
  return key ? key.charAt(0).toUpperCase() + key.slice(1) : 'General';
}

export function buildAIReport({ uid, testId, categoryWiseScore = {}, activityCategoryHours = {}, mockInterviewAverage = 0 }) {
  const merged = { ...categoryWiseScore };

  Object.entries(activityCategoryHours || {}).forEach(([category, hours]) => {
    const current = Number(merged[category]) || 0;
    const bonus = Math.min(15, Number(hours) || 0);
    merged[category] = Math.min(100, current + bonus);
  });

  if (Number.isFinite(Number(mockInterviewAverage))) {
    const existingSoft = Number(merged.softskills) || 0;
    merged.softskills = Math.round((existingSoft + Number(mockInterviewAverage)) / (existingSoft ? 2 : 1));
  }

  const ranked = Object.entries(merged)
    .map(([category, score]) => ({ category, score: Math.max(0, Math.min(100, Number(score) || 0)) }))
    .sort((a, b) => b.score - a.score);

  const strengths = ranked.slice(0, 2).map((item) => `${normalizeLabel(item.category)} (${item.score}%)`);
  const weaknesses = ranked.slice(-2).reverse().map((item) => `${normalizeLabel(item.category)} (${item.score}%)`);

  const weakestCategory = ranked.length ? ranked[ranked.length - 1].category : 'aptitude';
  const improvementPlan = (IMPROVEMENT_LIBRARY[weakestCategory] || IMPROVEMENT_LIBRARY.aptitude).slice(0, 3);
  const detailedAnalysis = ranked.map((item) => {
    const level = item.score >= 75 ? 'Strong' : item.score >= 45 ? 'Moderate' : 'Needs Improvement';
    return {
      category: item.category,
      label: normalizeLabel(item.category),
      score: item.score,
      level,
      gapTo80: Math.max(0, 80 - item.score),
      recommendation: (IMPROVEMENT_LIBRARY[item.category] || IMPROVEMENT_LIBRARY.aptitude)[0],
    };
  });
  const lackingAreas = detailedAnalysis
    .filter((item) => item.score < 50)
    .map((item) => `${item.label}: ${item.score}% (Need +${item.gapTo80}% to reach target)`);

  return {
    uid,
    testId,
    strengths,
    weaknesses,
    improvementPlan,
    detailedAnalysis,
    lackingAreas,
    summary:
      lackingAreas.length > 0
        ? `Focus required in ${lackingAreas.map((item) => item.split(':')[0]).join(', ')}.`
        : 'Performance is balanced across categories.',
    generatedAt: Date.now(),
    weakestCategory,
  };
}

export function weakAreaMessage(category) {
  const map = {
    aptitude: 'You need to focus on Aptitude - practice percentages and probability.',
    technical: 'You need to focus on Technical - strengthen DSA and coding speed.',
    reasoning: 'You need to focus on Reasoning - solve logic and puzzle based sets.',
    verbal: 'You need to focus on Verbal - improve comprehension and grammar.',
    softskills: 'You need to focus on Soft Skills - improve interview communication.',
  };
  return map[category] || map.aptitude;
}
