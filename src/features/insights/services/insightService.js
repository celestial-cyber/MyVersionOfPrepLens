import { listResultsForAdmin } from '../../testing/services/testEngineService';
import { predictPlacementReadiness, consistencyTier, findWeakCategory } from '../utils/placementReadiness';
import { weakAreaMessage } from '../utils/aiAnalyzer';

function avg(values = []) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + Number(value || 0), 0) / values.length;
}

export async function buildStudentInsights(students = []) {
  const results = await listResultsForAdmin();
  const groupedResults = results.reduce((acc, item) => {
    if (!acc[item.uid]) acc[item.uid] = [];
    acc[item.uid].push(item);
    return acc;
  }, {});

  return students.map((student) => {
    const studentResults = groupedResults[student.uid] || [];
    const avgTestScore = Math.round(avg(studentResults.map((item) => item.score)));
    const mergedCategory = {};

    studentResults.forEach((result) => {
      Object.entries(result.categoryWiseScore || {}).forEach(([category, value]) => {
        if (!mergedCategory[category]) mergedCategory[category] = [];
        mergedCategory[category].push(Number(value) || 0);
      });
    });

    const categoryScores = Object.entries(mergedCategory).reduce((acc, [category, values]) => {
      acc[category] = Math.round(avg(values));
      return acc;
    }, {
      aptitude: Number(student?.categoryTotals?.aptitude) || 0,
      technical: Number(student?.categoryTotals?.technical) || 0,
      verbal: Number(student?.categoryTotals?.verbal) || 0,
      softskills: Number(student?.categoryTotals?.softskills) || 0,
    });

    const weakestCategory = findWeakCategory({ categoryScores, fallback: 'aptitude' });
    const consistency = consistencyTier({
      streakDays: Number(student.streakDays) || 0,
      activityCount: Number(student.totalActivities) || 0,
      testAverage: avgTestScore,
    });

    const readiness = predictPlacementReadiness({
      coding: categoryScores.technical || avgTestScore,
      aptitude: categoryScores.aptitude || avgTestScore,
      technical: categoryScores.reasoning || categoryScores.technical || avgTestScore,
      softSkills: categoryScores.softskills || categoryScores.verbal || avgTestScore,
    });

    const riskReasons = [];
    const threeDaysAgo = Date.now() - 3 * 24 * 60 * 60 * 1000;
    if ((student.lastActiveAt || 0) < threeDaysAgo) riskReasons.push('No activity in last 3 days');
    if ((Number(student.readinessScore) || 0) < 40) riskReasons.push('Readiness below 40');
    if ((Number(categoryScores[weakestCategory]) || 0) < 30) riskReasons.push(`${weakestCategory} below 30`);

    return {
      uid: student.uid,
      name: student.name,
      avgTestScore,
      totalTests: studentResults.length,
      categoryScores,
      weakestCategory,
      weakAreaHint: weakAreaMessage(weakestCategory),
      consistency,
      readiness,
      riskReasons,
      isAtRisk: riskReasons.length > 0,
    };
  });
}

export function buildLeaderboard(students = [], insights = []) {
  const map = new Map(insights.map((row) => [row.uid, row]));
  return students
    .map((student) => {
      const insight = map.get(student.uid) || {};
      const readiness = Number(student.readinessScore) || 0;
      const consistencyScore =
        insight.consistency === 'Placement Ready'
          ? 100
          : insight.consistency === 'Dedicated'
            ? 75
            : insight.consistency === 'Regular'
              ? 50
              : 25;
      const testsCompleted = Number(insight.totalTests) || 0;
      const score = Math.round(readiness * 0.5 + consistencyScore * 0.3 + testsCompleted * 4);
      return {
        uid: student.uid,
        name: student.name,
        readiness,
        consistency: insight.consistency || 'Beginner',
        testsCompleted,
        score,
      };
    })
    .sort((a, b) => b.score - a.score)
    .map((item, index) => ({ ...item, rank: index + 1 }));
}
