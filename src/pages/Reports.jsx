import React, { useEffect, useState } from 'react';
import { Card, CardHeader } from '../components/Card';
import { Button } from '../components/Button';
import { courses as coursesApi, marks as marksApi, reports as reportsApi } from '../lib/api';
import { FileText, FileSpreadsheet, Download } from 'lucide-react';
import { getAccessToken } from '../lib/api';

export const Reports = () => {
  const [courseList, setCourseList] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [courseDetails, setCourseDetails] = useState(null);
  const [marksList, setMarksList] = useState([]);
  const [activeTab, setActiveTab] = useState('marks');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [form, setForm] = useState({ studentId: '', subjectId: '', examType: 'midterm', score: '', maxScore: '100' });
  const [students, setStudents] = useState([]);

  useEffect(() => { coursesApi.getAll().then(setCourseList).catch(() => {}); }, []);

  useEffect(() => {
    if (selectedCourse) {
      setLoading(true);
      Promise.all([
        coursesApi.getOne(selectedCourse),
        marksApi.get(selectedCourse),
        import('../lib/api').then(m => m.students.getAll(selectedCourse)),
      ]).then(([course, marks, studs]) => {
        setCourseDetails(course);
        setMarksList(marks);
        setStudents(studs);
      }).catch(() => {}).finally(() => setLoading(false));
    }
  }, [selectedCourse]);

  const handleAddMark = async (e) => {
    e.preventDefault();
    try {
      await marksApi.add(selectedCourse, form);
      setMsg('Mark saved!');
      const marks = await marksApi.get(selectedCourse);
      setMarksList(marks);
      setForm({ ...form, score: '' });
    } catch (err) { setMsg(err.message); }
  };

  const downloadReport = (type) => {
    const url = type === 'pdf' ? reportsApi.downloadPdf(selectedCourse) : reportsApi.downloadExcel(selectedCourse);
    const token = getAccessToken();
    fetch(url, { headers: { Authorization: `Bearer ${token}` }, credentials: 'include' })
      .then(res => res.blob())
      .then(blob => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `report.${type === 'pdf' ? 'pdf' : 'xlsx'}`;
        a.click();
      })
      .catch(err => setMsg(err.message));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Marks & Reports</h1>
          <p className="text-gray-500 text-sm">Enter marks and generate reports per course.</p>
        </div>
      </div>

      <Card>
        <div className="flex items-center gap-4 flex-wrap">
          <select className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none min-w-[250px]" value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)}>
            <option value="">Select course...</option>
            {courseList.map(c => <option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}
          </select>
        </div>
      </Card>

      {selectedCourse && (
        <>
          <div className="flex gap-4 border-b border-gray-200 pb-2">
            {['marks', 'reports'].map(tab => (
              <button key={tab} className="pb-2 px-1 font-semibold text-sm transition-all capitalize" style={activeTab === tab ? { color: '#4f46e5', borderBottom: '2px solid #4f46e5' } : { color: '#6b7280' }} onClick={() => setActiveTab(tab)}>
                {tab === 'marks' ? 'Marks Entry' : 'Download Reports'}
              </button>
            ))}
          </div>

          {msg && <div className="p-3 rounded-lg bg-indigo-50 text-indigo-700 text-sm font-medium">{msg}</div>}

          {activeTab === 'marks' ? (
            <>
              <Card>
                <CardHeader title="Enter Mark" />
                <form onSubmit={handleAddMark} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <select className="px-3 py-2 border border-gray-200 rounded-lg text-sm" value={form.studentId} onChange={e => setForm({...form, studentId: e.target.value})}>
                    <option value="">Student...</option>
                    {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.rollNumber})</option>)}
                  </select>
                  <select className="px-3 py-2 border border-gray-200 rounded-lg text-sm" value={form.subjectId} onChange={e => setForm({...form, subjectId: e.target.value})}>
                    <option value="">Subject...</option>
                    {courseDetails?.subjects?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                  <select className="px-3 py-2 border border-gray-200 rounded-lg text-sm" value={form.examType} onChange={e => setForm({...form, examType: e.target.value})}>
                    <option value="midterm">Midterm</option>
                    <option value="final">Final</option>
                    <option value="assignment">Assignment</option>
                    <option value="quiz">Quiz</option>
                  </select>
                  <input type="number" placeholder="Score" className="px-3 py-2 border border-gray-200 rounded-lg text-sm" value={form.score} onChange={e => setForm({...form, score: e.target.value})} />
                  <input type="number" placeholder="Max Score" className="px-3 py-2 border border-gray-200 rounded-lg text-sm" value={form.maxScore} onChange={e => setForm({...form, maxScore: e.target.value})} />
                  <Button type="submit">Save Mark</Button>
                </form>
              </Card>

              <Card>
                <CardHeader title="Recorded Marks" />
                {loading ? <div className="flex justify-center py-8"><div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div></div> : marksList.length === 0 ? (
                  <p className="text-center py-8 text-gray-400">No marks recorded yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm">
                      <thead><tr className="border-b border-gray-200 text-gray-500">
                        <th className="pb-3 font-medium">Student</th>
                        <th className="pb-3 font-medium">Subject</th>
                        <th className="pb-3 font-medium">Exam</th>
                        <th className="pb-3 font-medium">Score</th>
                      </tr></thead>
                      <tbody>
                        {marksList.map(m => (
                          <tr key={m.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50">
                            <td className="py-3">{m.student?.name} <span className="text-gray-400">({m.student?.rollNumber})</span></td>
                            <td className="py-3">{m.subject?.name}</td>
                            <td className="py-3 capitalize">{m.examType}</td>
                            <td className="py-3 font-bold">{m.score}/{m.maxScore}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            </>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card style={{ background: 'linear-gradient(135deg, #eef2ff, #ffffff)' }}>
                <CardHeader title="PDF Report" />
                <p className="text-sm text-gray-600 mb-6">Download a comprehensive PDF with student list, attendance summary, and marks breakdown.</p>
                <Button className="gap-2 w-full" onClick={() => downloadReport('pdf')}>
                  <FileText className="w-4 h-4" /> Download PDF
                </Button>
              </Card>
              <Card style={{ background: 'linear-gradient(135deg, #f0fdf4, #ffffff)' }}>
                <CardHeader title="Excel Report" />
                <p className="text-sm text-gray-600 mb-6">Download an Excel file with separate sheets for attendance and marks data.</p>
                <Button variant="secondary" className="gap-2 w-full text-emerald-600 hover:bg-emerald-50" onClick={() => downloadReport('excel')}>
                  <FileSpreadsheet className="w-4 h-4" /> Download Excel
                </Button>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
};
