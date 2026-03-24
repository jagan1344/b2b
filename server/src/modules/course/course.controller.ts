import { Request, Response } from 'express';
import prisma from '../../config/db';

export async function getCourses(req: Request, res: Response) {
  try {
    const teacherId = req.teacher!.teacherId;
    const role = req.teacher!.role;

    let courses;
    if (role === 'principal') {
      courses = await prisma.course.findMany({
        include: { _count: { select: { enrollments: true } }, teachers: { include: { teacher: { select: { id: true, name: true, email: true } } } } },
        orderBy: { createdAt: 'desc' },
      });
    } else {
      courses = await prisma.course.findMany({
        where: { teachers: { some: { teacherId } } },
        include: { _count: { select: { enrollments: true } }, teachers: { include: { teacher: { select: { id: true, name: true, email: true } } } } },
        orderBy: { createdAt: 'desc' },
      });
    }
    res.json(courses);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function getCourseById(req: Request, res: Response) {
  try {
    const { courseId } = req.params;
    const teacherId = req.teacher!.teacherId;
    const role = req.teacher!.role;

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        subjects: true,
        _count: { select: { enrollments: true } },
        teachers: { include: { teacher: { select: { id: true, name: true, email: true } } } },
      },
    });

    if (!course) { res.status(404).json({ error: 'Course not found.' }); return; }

    if (role !== 'principal') {
      const isAssigned = course.teachers.some(t => t.teacherId === teacherId);
      if (!isAssigned) { res.status(403).json({ error: 'Not assigned to this course.' }); return; }
    }

    res.json(course);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function createCourse(req: Request, res: Response) {
  try {
    const { name, code, description, semester, year } = req.body;
    if (!name || !code || !semester || !year) {
      res.status(400).json({ error: 'Name, code, semester, and year are required.' });
      return;
    }
    const course = await prisma.course.create({
      data: { name, code, description, semester, year: parseInt(year) },
    });
    res.status(201).json(course);
  } catch (err: any) {
    if (err.code === 'P2002') {
      res.status(409).json({ error: 'A course with this code already exists.' });
      return;
    }
    res.status(500).json({ error: err.message });
  }
}

export async function assignTeacher(req: Request, res: Response) {
  try {
    const { courseId } = req.params;
    const { teacherId } = req.body;
    if (!teacherId) { res.status(400).json({ error: 'teacherId is required.' }); return; }

    await prisma.courseTeacher.create({
      data: { courseId, teacherId },
    });
    res.status(201).json({ message: 'Teacher assigned to course.' });
  } catch (err: any) {
    if (err.code === 'P2002') {
      res.status(409).json({ error: 'Teacher already assigned to this course.' });
      return;
    }
    res.status(500).json({ error: err.message });
  }
}

export async function addSubject(req: Request, res: Response) {
  try {
    const { courseId } = req.params;
    const { name } = req.body;
    if (!name) { res.status(400).json({ error: 'Subject name is required.' }); return; }

    const subject = await prisma.subject.create({
      data: { name, courseId },
    });
    res.status(201).json(subject);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
