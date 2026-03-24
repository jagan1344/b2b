import { Request, Response } from 'express';
import prisma from '../../config/db';
import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';

export async function generatePdf(req: Request, res: Response) {
  try {
    const { courseId } = req.params;
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        subjects: true,
        enrollments: { include: { student: true } },
      },
    });

    if (!course) { res.status(404).json({ error: 'Course not found.' }); return; }

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="report-${course.code}.pdf"`);
    doc.pipe(res);

    // Title
    doc.fontSize(20).font('Helvetica-Bold').text('SPMS — Course Performance Report', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(14).font('Helvetica').text(`${course.name} (${course.code})`, { align: 'center' });
    doc.fontSize(10).text(`Semester: ${course.semester} ${course.year}`, { align: 'center' });
    doc.moveDown(1);

    // Student List
    doc.fontSize(14).font('Helvetica-Bold').text('Enrolled Students');
    doc.moveDown(0.3);
    doc.fontSize(10).font('Helvetica');
    course.enrollments.forEach((e, i) => {
      doc.text(`${i + 1}. ${e.student.name} — ${e.student.rollNumber}`);
    });
    doc.moveDown(1);

    // Attendance Summary
    doc.fontSize(14).font('Helvetica-Bold').text('Attendance Summary');
    doc.moveDown(0.3);
    doc.fontSize(10).font('Helvetica');
    for (const enrollment of course.enrollments) {
      const records = await prisma.attendanceRecord.findMany({
        where: { courseId, studentId: enrollment.studentId },
      });
      const total = records.length;
      const present = records.filter(r => r.status === 'present').length;
      const pct = total > 0 ? Math.round((present / total) * 100) : 0;
      doc.text(`${enrollment.student.name}: ${present}/${total} (${pct}%)`);
    }
    doc.moveDown(1);

    // Marks
    doc.fontSize(14).font('Helvetica-Bold').text('Marks Breakdown');
    doc.moveDown(0.3);
    for (const subject of course.subjects) {
      doc.fontSize(12).font('Helvetica-Bold').text(subject.name);
      const marks = await prisma.mark.findMany({
        where: { subjectId: subject.id },
        include: { student: { select: { name: true, rollNumber: true } } },
      });
      doc.fontSize(10).font('Helvetica');
      if (marks.length === 0) {
        doc.text('  No marks recorded yet.');
      } else {
        marks.forEach(m => {
          doc.text(`  ${m.student.name} (${m.student.rollNumber}): ${m.score}/${m.maxScore} [${m.examType}]`);
        });
      }
      doc.moveDown(0.5);
    }

    doc.end();
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function generateExcel(req: Request, res: Response) {
  try {
    const { courseId } = req.params;
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        subjects: true,
        enrollments: { include: { student: true } },
      },
    });

    if (!course) { res.status(404).json({ error: 'Course not found.' }); return; }

    const workbook = new ExcelJS.Workbook();

    // Attendance Sheet
    const attSheet = workbook.addWorksheet('Attendance');
    attSheet.columns = [
      { header: 'Name', key: 'name', width: 25 },
      { header: 'Roll Number', key: 'rollNumber', width: 15 },
      { header: 'Total Classes', key: 'total', width: 12 },
      { header: 'Present', key: 'present', width: 10 },
      { header: 'Absent', key: 'absent', width: 10 },
      { header: 'Late', key: 'late', width: 10 },
      { header: 'Percentage', key: 'percentage', width: 12 },
    ];

    for (const enrollment of course.enrollments) {
      const records = await prisma.attendanceRecord.findMany({
        where: { courseId, studentId: enrollment.studentId },
      });
      const total = records.length;
      const present = records.filter(r => r.status === 'present').length;
      const absent = records.filter(r => r.status === 'absent').length;
      const late = records.filter(r => r.status === 'late').length;
      attSheet.addRow({
        name: enrollment.student.name,
        rollNumber: enrollment.student.rollNumber,
        total, present, absent, late,
        percentage: total > 0 ? `${Math.round((present / total) * 100)}%` : 'N/A',
      });
    }

    // Marks Sheet
    const marksSheet = workbook.addWorksheet('Marks');
    marksSheet.columns = [
      { header: 'Student', key: 'name', width: 25 },
      { header: 'Roll Number', key: 'rollNumber', width: 15 },
      { header: 'Subject', key: 'subject', width: 20 },
      { header: 'Exam Type', key: 'examType', width: 12 },
      { header: 'Score', key: 'score', width: 10 },
      { header: 'Max Score', key: 'maxScore', width: 10 },
    ];

    const allMarks = await prisma.mark.findMany({
      where: { subject: { courseId } },
      include: {
        student: { select: { name: true, rollNumber: true } },
        subject: { select: { name: true } },
      },
    });
    allMarks.forEach(m => {
      marksSheet.addRow({
        name: m.student.name,
        rollNumber: m.student.rollNumber,
        subject: m.subject.name,
        examType: m.examType,
        score: m.score,
        maxScore: m.maxScore,
      });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="report-${course.code}.xlsx"`);
    await workbook.xlsx.write(res);
    res.end();
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
