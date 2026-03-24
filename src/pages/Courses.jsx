import React, { useEffect, useState } from 'react';
import { Card, CardHeader } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { useAuth } from '../context/AuthContext';
import { courses as coursesApi, teacher as teacherApi } from '../lib/api';
import { BookOpen, Users, Plus, UserPlus } from 'lucide-react';

export const Courses = () => {
  const { user } = useAuth();
  const [courseList, setCourseList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showAssign, setShowAssign] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [form, setForm] = useState({ name: '', code: '', description: '', semester: 'Fall', year: new Date().getFullYear() });
  const [assignTeacherId, setAssignTeacherId] = useState('');
  const [msg, setMsg] = useState('');

  const loadCourses = () => {
    coursesApi.getAll().then(setCourseList).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { loadCourses(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await coursesApi.create(form);
      setMsg('Course created!');
      setShowCreate(false);
      setForm({ name: '', code: '', description: '', semester: 'Fall', year: new Date().getFullYear() });
      loadCourses();
    } catch (err) { setMsg(err.message); }
  };

  const handleAssign = async (courseId) => {
    try {
      await coursesApi.assignTeacher(courseId, assignTeacherId);
      setMsg('Teacher assigned!');
      setShowAssign(null);
      loadCourses();
    } catch (err) { setMsg(err.message); }
  };

  const openAssign = async (courseId) => {
    setShowAssign(courseId);
    if (teachers.length === 0) {
      try { const t = await teacherApi.getAll(); setTeachers(t); } catch {}
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Courses</h1>
          <p className="text-gray-500 text-sm">{user?.role === 'principal' ? 'Create and manage courses.' : 'View your assigned courses.'}</p>
        </div>
        {user?.role === 'principal' && (
          <Button className="gap-2" onClick={() => setShowCreate(!showCreate)}>
            <Plus className="w-5 h-5" /> New Course
          </Button>
        )}
      </div>

      {msg && <div className="p-3 rounded-lg bg-indigo-50 text-indigo-700 text-sm font-medium">{msg}</div>}

      {showCreate && (
        <Card>
          <CardHeader title="Create New Course" />
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Course Name" placeholder="Introduction to CS" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
            <Input label="Course Code" placeholder="CS101" value={form.code} onChange={e => setForm({...form, code: e.target.value})} />
            <Input label="Semester" placeholder="Fall" value={form.semester} onChange={e => setForm({...form, semester: e.target.value})} />
            <Input label="Year" type="number" value={form.year} onChange={e => setForm({...form, year: e.target.value})} />
            <div className="col-span-full">
              <Input label="Description (optional)" placeholder="Brief course description..." value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
            </div>
            <div className="col-span-full flex gap-3">
              <Button type="submit">Create Course</Button>
              <Button variant="secondary" type="button" onClick={() => setShowCreate(false)}>Cancel</Button>
            </div>
          </form>
        </Card>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div></div>
      ) : courseList.length === 0 ? (
        <Card>
          <div className="text-center py-12 text-gray-400">
            <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No courses yet</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courseList.map(course => (
            <Card key={course.id} className="hover:-translate-y-1 transition-transform group cursor-pointer" style={{ borderTop: '4px solid #4f46e5' }}>
              <div className="flex justify-between items-start mb-3">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <BookOpen className="w-6 h-6" />
                </div>
                <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-lg">{course.code}</span>
              </div>
              <h3 className="font-bold text-lg text-gray-800 mb-1">{course.name}</h3>
              <p className="text-sm text-gray-500 mb-3">{course.semester} {course.year}</p>
              <div className="pt-3 border-t border-gray-100 flex justify-between items-center text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Users className="w-4 h-4" />
                  <span>{course._count?.enrollments || 0} students</span>
                </div>
                {user?.role === 'principal' && (
                  <button onClick={() => openAssign(course.id)} className="text-indigo-600 hover:text-indigo-800 text-xs font-medium flex items-center gap-1">
                    <UserPlus className="w-4 h-4" /> Assign Teacher
                  </button>
                )}
              </div>
              {course.teachers?.length > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-100">
                  <p className="text-xs text-gray-400">Teachers:</p>
                  {course.teachers.map(ct => (
                    <p key={ct.id} className="text-xs text-gray-600">{ct.teacher?.name}</p>
                  ))}
                </div>
              )}
              {showAssign === course.id && (
                <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
                  <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" value={assignTeacherId} onChange={e => setAssignTeacherId(e.target.value)}>
                    <option value="">Select teacher...</option>
                    {teachers.filter(t => t.role === 'teacher').map(t => (
                      <option key={t.id} value={t.id}>{t.name} ({t.email})</option>
                    ))}
                  </select>
                  <Button size="sm" onClick={() => handleAssign(course.id)} className="w-full">Assign</Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
