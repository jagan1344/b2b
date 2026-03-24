import React, { useEffect, useState } from 'react';
import { Card, CardHeader } from '../components/Card';
import { Button } from '../components/Button';
import { courses as coursesApi, students as studentsApi, attendance as attendanceApi } from '../lib/api';
import { Calendar, Check, X, Clock } from 'lucide-react';

const statusStyles = {
  present: { active: { backgroundColor: '#10b981', color: '#fff', boxShadow: '0 4px 6px rgba(16,185,129,0.3)' }, inactive: { backgroundColor: '#fff', color: '#6b7280', border: '1px solid #e5e7eb' } },
  late: { active: { backgroundColor: '#f59e0b', color: '#fff', boxShadow: '0 4px 6px rgba(245,158,11,0.3)' }, inactive: { backgroundColor: '#fff', color: '#6b7280', border: '1px solid #e5e7eb' } },
  absent: { active: { backgroundColor: '#f43f5e', color: '#fff', boxShadow: '0 4px 6px rgba(244,63,94,0.3)' }, inactive: { backgroundColor: '#fff', color: '#6b7280', border: '1px solid #e5e7eb' } },
};

export const Attendance = () => {
  const [courseList, setCourseList] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [studentList, setStudentList] = useState([]);
  const [records, setRecords] = useState({});
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => { coursesApi.getAll().then(setCourseList).catch(() => {}); }, []);

  useEffect(() => {
    if (selectedCourse) {
      setLoading(true);
      Promise.all([
        studentsApi.getAll(selectedCourse),
        attendanceApi.get(selectedCourse, `date=${date}`)
      ]).then(([students, existing]) => {
        setStudentList(students);
        const rec = {};
        students.forEach(s => { rec[s.id] = 'present'; });
        existing.forEach(r => { rec[r.studentId] = r.status; });
        setRecords(rec);
      }).catch(() => {}).finally(() => setLoading(false));
    }
  }, [selectedCourse, date]);

  const setStatus = (studentId, status) => {
    setRecords({ ...records, [studentId]: status });
  };

  const handleSubmit = async () => {
    try {
      const body = {
        date,
        records: Object.entries(records).map(([studentId, status]) => ({ studentId, status })),
      };
      await attendanceApi.submit(selectedCourse, body);
      setMsg(`Attendance saved for ${Object.keys(records).length} students!`);
    } catch (err) { setMsg(err.message); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Attendance Recording</h1>
          <p className="text-gray-500 text-sm">Mark attendance by course and date.</p>
        </div>
      </div>

      <Card>
        <div className="flex items-center gap-4 flex-wrap">
          <select className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none min-w-[250px]" value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)}>
            <option value="">Select course...</option>
            {courseList.map(c => <option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}
          </select>
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-gray-200">
            <Calendar className="w-5 h-5 text-indigo-500" />
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="text-sm font-medium text-gray-700 focus:outline-none" />
          </div>
          {selectedCourse && <Button onClick={handleSubmit}>Submit Attendance</Button>}
        </div>
      </Card>

      {msg && <div className="p-3 rounded-lg bg-indigo-50 text-indigo-700 text-sm font-medium">{msg}</div>}

      {selectedCourse && (
        <Card>
          {loading ? (
            <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div></div>
          ) : studentList.length === 0 ? (
            <div className="text-center py-12 text-gray-400"><p>No students enrolled in this course.</p></div>
          ) : (
            <div className="space-y-3">
              {studentList.map(student => (
                <div key={student.id} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl hover:bg-white border border-transparent hover:border-gray-200 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-pink-100 flex items-center justify-center text-indigo-600 font-bold text-lg">{student.name?.charAt(0)}</div>
                    <div>
                      <h4 className="font-semibold text-gray-800">{student.name}</h4>
                      <p className="text-xs text-gray-500 font-mono">{student.rollNumber}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 bg-gray-100/80 p-1.5 rounded-lg">
                    {['present', 'late', 'absent'].map(status => {
                      const icons = { present: Check, late: Clock, absent: X };
                      const Icon = icons[status];
                      return (
                        <button key={status} onClick={() => setStatus(student.id, status)} className="flex items-center gap-1.5 px-4 py-1.5 rounded-md font-medium text-sm transition-all capitalize" style={records[student.id] === status ? statusStyles[status].active : statusStyles[status].inactive}>
                          <Icon className="w-4 h-4" /> {status}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
};
