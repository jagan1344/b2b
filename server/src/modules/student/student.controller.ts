import { Request, Response } from 'express';
import prisma from '../../config/db';
import { parseStudentFile } from '../../utils/fileParser';

export async function getStudents(req: Request, res: Response) {
  try {
    const { courseId } = req.params;
    const students = await prisma.enrollment.findMany({
      where: { courseId },
      include: { student: true },
      orderBy: { student: { name: 'asc' } },
    });
    res.json(students.map(e => ({ ...e.student, enrollmentId: e.id, enrolledAt: e.enrolledAt })));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function addStudent(req: Request, res: Response) {
  try {
    const { courseId } = req.params;
    const { name, rollNumber, email, phone } = req.body;
    if (!name || !rollNumber) {
      res.status(400).json({ error: 'Name and roll number are required.' });
      return;
    }

    // Upsert student
    let student = await prisma.student.findUnique({ where: { rollNumber } });
    if (!student) {
      student = await prisma.student.create({ data: { name, rollNumber, email, phone } });
    }

    // Check if already enrolled
    const existing = await prisma.enrollment.findUnique({
      where: { studentId_courseId: { studentId: student.id, courseId } },
    });
    if (existing) {
      res.status(409).json({ error: 'Student already enrolled in this course.' });
      return;
    }

    await prisma.enrollment.create({ data: { studentId: student.id, courseId } });
    res.status(201).json({ student, enrolled: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function removeStudent(req: Request, res: Response) {
  try {
    const { courseId, studentId } = req.params;
    await prisma.enrollment.deleteMany({
      where: { studentId, courseId },
    });
    res.json({ message: 'Student unenrolled from course.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function bulkUpload(req: Request, res: Response) {
  try {
    const { courseId } = req.params;
    if (!req.file) {
      res.status(400).json({ error: 'File is required.' });
      return;
    }

    const rows = parseStudentFile(req.file.buffer);
    let added = 0, alreadyEnrolled = 0, skipped = 0;
    const skippedRows: { row: number; reason: string }[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (!row.name || !row.rollNumber) {
        skipped++;
        skippedRows.push({ row: i + 2, reason: !row.name ? 'Missing name' : 'Missing roll number' });
        continue;
      }

      // Upsert student
      let student = await prisma.student.findUnique({ where: { rollNumber: String(row.rollNumber) } });
      if (!student) {
        student = await prisma.student.create({
          data: {
            name: String(row.name),
            rollNumber: String(row.rollNumber),
            email: row.email ? String(row.email) : null,
            phone: row.phone ? String(row.phone) : null,
          },
        });
      }

      // Check enrollment
      const existing = await prisma.enrollment.findUnique({
        where: { studentId_courseId: { studentId: student.id, courseId } },
      });
      if (existing) {
        alreadyEnrolled++;
      } else {
        await prisma.enrollment.create({ data: { studentId: student.id, courseId } });
        added++;
      }
    }

    res.json({
      summary: { total: rows.length, added, alreadyEnrolled, skipped },
      skippedRows,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
