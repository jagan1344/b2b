import { Request, Response } from 'express';
import prisma from '../../config/db';
import { comparePassword, hashPassword } from '../../utils/hash';

export async function getMe(req: Request, res: Response) {
  try {
    const teacher = await prisma.teacher.findUnique({
      where: { id: req.teacher!.teacherId },
      select: { id: true, name: true, email: true, role: true, isVerified: true, createdAt: true },
    });
    if (!teacher) { res.status(404).json({ error: 'Teacher not found.' }); return; }
    res.json(teacher);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function updateMe(req: Request, res: Response) {
  try {
    const { name, currentPassword, newPassword } = req.body;
    const data: any = {};
    if (name) data.name = name;

    if (newPassword) {
      if (!currentPassword) {
        res.status(400).json({ error: 'Current password required to change password.' });
        return;
      }
      const teacher = await prisma.teacher.findUnique({ where: { id: req.teacher!.teacherId } });
      if (!teacher) { res.status(404).json({ error: 'Teacher not found.' }); return; }
      
      const valid = await comparePassword(currentPassword, teacher.passwordHash);
      if (!valid) { res.status(400).json({ error: 'Current password is incorrect.' }); return; }
      
      data.passwordHash = await hashPassword(newPassword);
    }

    const updated = await prisma.teacher.update({
      where: { id: req.teacher!.teacherId },
      data,
      select: { id: true, name: true, email: true, role: true },
    });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function getAllTeachers(req: Request, res: Response) {
  try {
    if (req.teacher!.role !== 'principal') {
      res.status(403).json({ error: 'Only principals can list all teachers.' });
      return;
    }
    const teachers = await prisma.teacher.findMany({
      select: { id: true, name: true, email: true, role: true },
      orderBy: { name: 'asc' },
    });
    res.json(teachers);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
