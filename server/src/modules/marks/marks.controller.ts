import { Request, Response } from 'express';
import prisma from '../../config/db';

export async function getMarks(req: Request, res: Response) {
  try {
    const { courseId } = req.params;
    const { studentId, subjectId, examType } = req.query;

    const where: any = { subject: { courseId } };
    if (studentId) where.studentId = studentId;
    if (subjectId) where.subjectId = subjectId;
    if (examType) where.examType = examType;

    const marks = await prisma.mark.findMany({
      where,
      include: {
        student: { select: { id: true, name: true, rollNumber: true } },
        subject: { select: { id: true, name: true } },
      },
      orderBy: { enteredAt: 'desc' },
    });
    res.json(marks);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function addMark(req: Request, res: Response) {
  try {
    const teacherId = req.teacher!.teacherId;
    const { studentId, subjectId, examType, score, maxScore } = req.body;

    if (!studentId || !subjectId || !examType || score === undefined || !maxScore) {
      res.status(400).json({ error: 'studentId, subjectId, examType, score, and maxScore are required.' });
      return;
    }

    const mark = await prisma.mark.create({
      data: { studentId, subjectId, teacherId, examType, score: parseFloat(score), maxScore: parseFloat(maxScore) },
    });
    res.status(201).json(mark);
  } catch (err: any) {
    if (err.code === 'P2002') {
      res.status(409).json({ error: 'Mark already exists for this student/subject/exam combination.' });
      return;
    }
    res.status(500).json({ error: err.message });
  }
}

export async function updateMark(req: Request, res: Response) {
  try {
    const { markId } = req.params;
    const { score, maxScore } = req.body;
    const data: any = {};
    if (score !== undefined) data.score = parseFloat(score);
    if (maxScore !== undefined) data.maxScore = parseFloat(maxScore);

    const mark = await prisma.mark.update({ where: { id: markId }, data });
    res.json(mark);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function deleteMark(req: Request, res: Response) {
  try {
    const { markId } = req.params;
    await prisma.mark.delete({ where: { id: markId } });
    res.json({ message: 'Mark deleted.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
