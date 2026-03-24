import prisma from './config/db';
import { hashPassword } from './utils/hash';

async function main() {
  console.log('🌱 Seeding database...');

  // Create principal account
  const principalHash = await hashPassword('principal123');
  const principal = await prisma.teacher.upsert({
    where: { email: 'principal@spms.edu' },
    update: {},
    create: {
      name: 'Dr. Principal',
      email: 'principal@spms.edu',
      passwordHash: principalHash,
      role: 'principal',
      isVerified: true,
    },
  });
  console.log(`✅ Principal: ${principal.email} (password: principal123)`);

  // Create a sample teacher
  const teacherHash = await hashPassword('teacher123');
  const teacher = await prisma.teacher.upsert({
    where: { email: 'teacher@spms.edu' },
    update: {},
    create: {
      name: 'Prof. Smith',
      email: 'teacher@spms.edu',
      passwordHash: teacherHash,
      role: 'teacher',
      isVerified: true,
    },
  });
  console.log(`✅ Teacher: ${teacher.email} (password: teacher123)`);

  // Create sample courses
  const cs101 = await prisma.course.upsert({
    where: { code: 'CS101' },
    update: {},
    create: {
      name: 'Introduction to Computer Science',
      code: 'CS101',
      description: 'Fundamentals of programming and computational thinking.',
      semester: 'Fall',
      year: 2026,
    },
  });

  const mth202 = await prisma.course.upsert({
    where: { code: 'MTH202' },
    update: {},
    create: {
      name: 'Advanced Calculus',
      code: 'MTH202',
      description: 'Multivariable calculus and differential equations.',
      semester: 'Fall',
      year: 2026,
    },
  });

  console.log(`✅ Courses: ${cs101.code}, ${mth202.code}`);

  // Assign teacher to CS101
  await prisma.courseTeacher.upsert({
    where: { courseId_teacherId: { courseId: cs101.id, teacherId: teacher.id } },
    update: {},
    create: { courseId: cs101.id, teacherId: teacher.id },
  });
  console.log(`✅ Teacher assigned to ${cs101.code}`);

  // Create subjects for CS101
  const sub1 = await prisma.subject.create({
    data: { name: 'Programming Fundamentals', courseId: cs101.id },
  }).catch(() => prisma.subject.findFirst({ where: { name: 'Programming Fundamentals', courseId: cs101.id } }));

  const sub2 = await prisma.subject.create({
    data: { name: 'Data Structures Basics', courseId: cs101.id },
  }).catch(() => prisma.subject.findFirst({ where: { name: 'Data Structures Basics', courseId: cs101.id } }));

  console.log(`✅ Subjects created for ${cs101.code}`);

  // Create sample students
  const students = [
    { name: 'Alice Johnson', rollNumber: 'CS2026001', email: 'alice@student.edu' },
    { name: 'Bob Smith', rollNumber: 'CS2026002', email: 'bob@student.edu' },
    { name: 'Charlie Brown', rollNumber: 'CS2026003', email: 'charlie@student.edu' },
    { name: 'Diana Ross', rollNumber: 'CS2026004', email: 'diana@student.edu' },
    { name: 'Evan Wright', rollNumber: 'CS2026005', email: 'evan@student.edu' },
  ];

  for (const s of students) {
    const student = await prisma.student.upsert({
      where: { rollNumber: s.rollNumber },
      update: {},
      create: s,
    });
    // Enroll in CS101
    await prisma.enrollment.upsert({
      where: { studentId_courseId: { studentId: student.id, courseId: cs101.id } },
      update: {},
      create: { studentId: student.id, courseId: cs101.id },
    });
  }
  console.log(`✅ ${students.length} students enrolled in ${cs101.code}`);

  console.log('\n🎉 Seed complete! You can now log in with:');
  console.log('   Principal: principal@spms.edu / principal123');
  console.log('   Teacher:   teacher@spms.edu / teacher123');
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1); });
