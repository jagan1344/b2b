import React, { useEffect, useState } from 'react';
import { Card, CardHeader } from '../components/Card';
import { useAuth } from '../context/AuthContext';
import { courses as coursesApi, attendance as attendanceApi } from '../lib/api';
import { Users, BookOpen, Clock, TrendingUp } from 'lucide-react';

const statCardStyles = [
  { bg: 'linear-gradient(135deg, #3b82f6, #4f46e5)', shadow: 'rgba(59,130,246,0.3)' },
  { bg: 'linear-gradient(135deg, #34d399, #14b8a6)', shadow: 'rgba(16,185,129,0.3)' },
  { bg: 'linear-gradient(135deg, #a855f7, #ec4899)', shadow: 'rgba(168,85,247,0.3)' },
  { bg: 'linear-gradient(135deg, #fbbf24, #f97316)', shadow: 'rgba(249,115,22,0.3)' },
];

const StatCard = ({ title, value, icon: Icon, styleIdx }) => (
  <Card className="flex items-center gap-4 hover:-translate-y-1 transition-transform cursor-default">
    <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: statCardStyles[styleIdx].bg, boxShadow: `0 10px 15px -3px ${statCardStyles[styleIdx].shadow}` }}>
      <Icon className="w-7 h-7 text-white" />
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <h4 className="text-2xl font-bold">{value}</h4>
    </div>
  </Card>
);

export const Dashboard = () => {
  const { user } = useAuth();
  const [courseList, setCourseList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    coursesApi.getAll()
      .then(data => setCourseList(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totalStudents = courseList.reduce((sum, c) => sum + (c._count?.enrollments || 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Welcome, {user?.name}</h1>
        <p className="text-gray-500 text-sm">
          {user?.role === 'principal' ? 'Manage courses, teachers, and students.' : 'Here\'s an overview of your assigned courses.'}
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div></div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Your Courses" value={courseList.length} icon={BookOpen} styleIdx={0} />
            <StatCard title="Total Students" value={totalStudents} icon={Users} styleIdx={1} />
            <StatCard title="Role" value={user?.role === 'principal' ? 'Principal' : 'Teacher'} icon={TrendingUp} styleIdx={2} />
            <StatCard title="Status" value="Active" icon={Clock} styleIdx={3} />
          </div>

          <Card>
            <CardHeader title="Your Courses" />
            {courseList.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No courses yet</p>
                <p className="text-sm">{user?.role === 'principal' ? 'Create your first course from the Courses page.' : 'Wait for the principal to assign courses to you.'}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {courseList.map(course => (
                  <div key={course.id} className="p-4 rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-bold text-gray-800">{course.name}</h4>
                      <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{course.code}</span>
                    </div>
                    <p className="text-sm text-gray-500">{course.semester} {course.year}</p>
                    <div className="flex items-center gap-2 mt-3 text-sm text-gray-600">
                      <Users className="w-4 h-4" />
                      <span>{course._count?.enrollments || 0} students</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
};
