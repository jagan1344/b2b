import { Request, Response } from 'express';
import prisma from '../../config/db';

export async function getAttendance(req: Request, res: Response) {
  try {
    const { courseId } = req.params;
    const { date, from, to, studentId } = req.query;

    const where: any = { courseId };
    if (date) where.date = new Date(date as string);
    if (from && to) {
      where.date = { gte: new Date(from as string), lte: new Date(to as string) };
    }
    if (studentId) where.studentId = studentId;

    const records = await prisma.attendanceRecord.findMany({
      where,
      include: { student: { select: { id: true, name: true, rollNumber: true } } },
      orderBy: [{ date: 'desc' }, { student: { name: 'asc' } }],
    });
    res.json(records);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function submitAttendance(req: Request, res: Response) {
  try {
    const { courseId } = req.params;
    const teacherId = req.teacher!.teacherId;
    const { date, records } = req.body;

    if (!date || !records || !Array.isArray(records)) {
      res.status(400).json({ error: 'Date and records array are required.' });
      return;
    }

    const dateObj = new Date(date);
    const results = [];

    for (const record of records) {
      const result = await prisma.attendanceRecord.upsert({
        where: {
          studentId_courseId_date: {
            studentId: record.studentId,
            courseId,
            date: dateObj,
          },
        },
        update: { status: record.status, teacherId },
        create: {
          studentId: record.studentId,
          courseId,
          teacherId,
          date: dateObj,
          status: record.status,
        },
      });
      results.push(result);
    }

    res.json({ message: `Attendance recorded for ${results.length} students.`, count: results.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function updateAttendance(req: Request, res: Response) {
  try {
    const { recordId } = req.params;
    const { status } = req.body;
    if (!status) { res.status(400).json({ error: 'Status is required.' }); return; }

    const record = await prisma.attendanceRecord.update({
      where: { id: recordId },
      data: { status },
    });
    res.json(record);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function getAttendanceSummary(req: Request, res: Response) {
  try {
    const { courseId } = req.params;

    const enrollments = await prisma.enrollment.findMany({
      where: { courseId },
      include: { student: true },
    });

    const summary = [];
    for (const enrollment of enrollments) {
      const records = await prisma.attendanceRecord.findMany({
        where: { courseId, studentId: enrollment.studentId },
      });
      const totalClasses = records.length;
      const present = records.filter(r => r.status === 'present').length;
      const absent = records.filter(r => r.status === 'absent').length;
      const late = records.filter(r => r.status === 'late').length;
      const percentage = totalClasses > 0 ? Math.round((present / totalClasses) * 100 * 10) / 10 : 0;

      summary.push({
        studentId: enrollment.studentId,
        name: enrollment.student.name,
        rollNumber: enrollment.student.rollNumber,
        totalClasses,
        present,
        absent,
        late,
        percentage,
      });
    }

    res.json(summary);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
