import { jsPDF } from 'jspdf';

export function generateCoordinatorPdfReport({ readyStudents = [], atRiskStudents = [], avgReadiness = 0 }) {
  const doc = new jsPDF();
  let y = 16;

  doc.setFontSize(16);
  doc.text('PrepLens Placement Coordinator Report', 14, y);
  y += 10;

  doc.setFontSize(11);
  doc.text(`Average readiness: ${avgReadiness}%`, 14, y);
  y += 8;

  doc.setFontSize(13);
  doc.text('Top 10 Placement Ready Students', 14, y);
  y += 7;

  doc.setFontSize(10);
  readyStudents.slice(0, 10).forEach((student, index) => {
    doc.text(`${index + 1}. ${student.name} - readiness ${student.readinessScore}%`, 16, y);
    y += 6;
  });

  y += 4;
  doc.setFontSize(13);
  doc.text('Students Needing Intervention', 14, y);
  y += 7;

  doc.setFontSize(10);
  atRiskStudents.slice(0, 20).forEach((student, index) => {
    doc.text(`${index + 1}. ${student.name} - readiness ${student.readinessScore}%`, 16, y);
    y += 6;
    if (y > 280) {
      doc.addPage();
      y = 16;
    }
  });

  doc.save('preplens-coordinator-report.pdf');
}
