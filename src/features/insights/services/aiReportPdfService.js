import { jsPDF } from 'jspdf';

function line(doc, text, y, size = 11, x = 14) {
  doc.setFontSize(size);
  doc.text(String(text), x, y);
}

function ensurePage(doc, y, gap = 8) {
  if (y <= 280 - gap) return y;
  doc.addPage();
  return 16;
}

function writeWrapped(doc, text, y, { size = 10, x = 14, maxWidth = 182 } = {}) {
  const nextY = ensurePage(doc, y, 10);
  doc.setFontSize(size);
  const lines = doc.splitTextToSize(String(text || ''), maxWidth);
  doc.text(lines, x, nextY);
  return nextY + Math.max(6, lines.length * 5);
}

function writeSectionTitle(doc, title, y) {
  const nextY = ensurePage(doc, y, 10);
  doc.setTextColor(33, 33, 33);
  line(doc, title, nextY, 13);
  return nextY + 6;
}

function writeList(doc, rows, y, emptyLabel = 'No data available.') {
  if (!rows?.length) return writeWrapped(doc, emptyLabel, y);
  let cursor = y;
  rows.forEach((item, index) => {
    cursor = writeWrapped(doc, `${index + 1}. ${item}`, cursor, { size: 10 });
  });
  return cursor;
}

function categoryColorHexToRgb(hex) {
  const value = String(hex || '').replace('#', '');
  if (value.length !== 6) return [92, 77, 153];
  return [parseInt(value.slice(0, 2), 16), parseInt(value.slice(2, 4), 16), parseInt(value.slice(4, 6), 16)];
}

export function downloadAiReportPdf(report, title = 'PrepLens AI Report') {
  if (!report) return;
  const doc = new jsPDF();
  let y = 16;

  line(doc, title, y, 16);
  y += 8;
  line(doc, `Student UID: ${report.uid || 'N/A'}`, y);
  y += 6;
  line(doc, `Test ID: ${report.testId || 'N/A'}`, y);
  y += 6;
  line(doc, `Generated: ${new Date(report.generatedAt || Date.now()).toLocaleString()}`, y);
  y += 8;

  y = writeSectionTitle(doc, 'Summary', y);
  y = writeWrapped(doc, report.summary || 'No summary available.', y, { size: 10 });
  y += 2;

  y = writeSectionTitle(doc, 'Performance Metrics', y);
  const metrics = report.performanceMetrics || {};
  y = writeList(
    doc,
    [
      `Total Questions: ${metrics.totalQuestions ?? '-'}`,
      `Attempted: ${metrics.attemptedCount ?? '-'}`,
      `Unattempted: ${metrics.unattemptedCount ?? '-'}`,
      `Correct: ${metrics.correctCount ?? '-'}`,
      `Wrong: ${metrics.wrongCount ?? '-'}`,
      `Accuracy: ${metrics.accuracy ?? '-'}%`,
      `Completion Rate: ${metrics.completionRate ?? '-'}%`,
    ],
    y
  );
  y += 2;

  y = writeSectionTitle(doc, 'Category Specific Marks', y);
  if (Array.isArray(report.categorySpecificMarks) && report.categorySpecificMarks.length) {
    report.categorySpecificMarks.forEach((item) => {
      y = ensurePage(doc, y, 8);
      const [r, g, b] = categoryColorHexToRgb(item.color);
      doc.setTextColor(r, g, b);
      line(doc, `${item.label || item.category}: ${item.marks}%`, y, 11);
      y += 5;
    });
    doc.setTextColor(33, 33, 33);
  } else {
    y = writeWrapped(doc, 'No category marks available.', y);
  }
  y += 2;

  y = writeSectionTitle(doc, 'Strengths', y);
  y = writeList(doc, report.strengths || [], y);
  y += 2;

  y = writeSectionTitle(doc, 'Weaknesses', y);
  y = writeList(doc, report.weaknesses || [], y);
  y += 2;

  y = writeSectionTitle(doc, 'Topics Attempted', y);
  y = writeList(doc, report.attemptedTopics || [], y, 'No attempted topics captured.');
  y += 2;

  y = writeSectionTitle(doc, 'Questions Not Attempted', y);
  y = writeList(
    doc,
    (report.unattemptedQuestions || []).map(
      (item) => `[${item.category || 'General'}] ${item.question || item.questionId || 'Question'}`
    ),
    y,
    'No unattempted questions.'
  );
  y += 2;

  y = writeSectionTitle(doc, 'Wrong Answered Questions', y);
  y = writeList(
    doc,
    (report.wrongAnsweredQuestions || []).map(
      (item) =>
        `[${item.category || 'General'}] ${item.question || item.questionId || 'Question'} | Your answer: ${item.selectedAnswer || 'N/A'} | Correct: ${item.correctAnswer || 'N/A'}`
    ),
    y,
    'No wrong answers. Great work.'
  );
  y += 2;

  y = writeSectionTitle(doc, 'Category-Level Detailed Analysis', y);
  y = writeList(
    doc,
    (report.detailedAnalysis || []).map(
      (item) =>
        `${item.label}: ${item.score}% (${item.level}) | Gap to target: ${item.gapTo80}% | Action: ${item.recommendation}`
    ),
    y,
    'No detailed category analysis available.'
  );
  y += 2;

  y = writeSectionTitle(doc, 'Improvement Plan', y);
  y = writeList(doc, report.improvementPlan || [], y);

  doc.save(`preplens-ai-report-${report.testId || 'test'}.pdf`);
}
