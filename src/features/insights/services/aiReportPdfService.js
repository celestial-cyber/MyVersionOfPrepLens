import { jsPDF } from 'jspdf';

function line(doc, text, y, size = 11, x = 14) {
  doc.setFontSize(size);
  doc.text(String(text), x, y);
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

  line(doc, 'Summary', y, 13);
  y += 6;
  line(doc, report.summary || 'No summary available.', y, 10);
  y += 8;

  line(doc, 'Strengths', y, 13);
  y += 6;
  (report.strengths || []).forEach((item, index) => {
    line(doc, `${index + 1}. ${item}`, y, 10);
    y += 5;
  });

  y += 2;
  line(doc, 'Weaknesses', y, 13);
  y += 6;
  (report.weaknesses || []).forEach((item, index) => {
    line(doc, `${index + 1}. ${item}`, y, 10);
    y += 5;
  });

  y += 2;
  line(doc, 'Category-Level Detailed Analysis', y, 13);
  y += 6;
  (report.detailedAnalysis || []).forEach((item, index) => {
    line(doc, `${index + 1}. ${item.label}: ${item.score}% (${item.level})`, y, 10);
    y += 5;
    line(doc, `   Gap to target: ${item.gapTo80}% | Action: ${item.recommendation}`, y, 9, 18);
    y += 5;
    if (y > 272) {
      doc.addPage();
      y = 16;
    }
  });

  y += 2;
  line(doc, 'Improvement Plan', y, 13);
  y += 6;
  (report.improvementPlan || []).forEach((item, index) => {
    line(doc, `${index + 1}. ${item}`, y, 10);
    y += 5;
  });

  doc.save(`preplens-ai-report-${report.testId || 'test'}.pdf`);
}
