import React, { useEffect, useState } from 'react';
import { Card, CardHeader } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { courses as coursesApi, students as studentsApi } from '../lib/api';
import { Plus, Search, Upload, Trash2, Users } from 'lucide-react';

export const Students = () => {
  const [courseList, setCourseList] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [studentList, setStudentList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', rollNumber: '', email: '', phone: '' });
  const [msg, setMsg] = useState('');
  const [uploadResult, setUploadResult] = useState(null);

  useEffect(() => {
    coursesApi.getAll().then(setCourseList).catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      setLoading(true);
      studentsApi.getAll(selectedCourse).then(setStudentList).catch(() => {}).finally(() => setLoading(false));
    }
  }, [selectedCourse]);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await studentsApi.add(selectedCourse, form);
      setMsg('Student added!');
      setShowAdd(false);
      setForm({ name: '', rollNumber: '', email: '', phone: '' });
      const data = await studentsApi.getAll(selectedCourse);
      setStudentList(data);
    } catch (err) { setMsg(err.message); }
  };

  const handleRemove = async (studentId) => {
    if (!confirm('Unenroll this student?')) return;
    try {
      await studentsApi.remove(selectedCourse, studentId);
      setStudentList(studentList.filter(s => s.id !== studentId));
      setMsg('Student unenrolled.');
    } catch (err) { setMsg(err.message); }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const result = await studentsApi.bulkUpload(selectedCourse, file);
      setUploadResult(result);
      const data = await studentsApi.getAll(selectedCourse);
      setStudentList(data);
    } catch (err) { setMsg(err.message); }
    e.target.value = '';
  };

  const filtered = studentList.filter(s =>
    s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.rollNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Student Management</h1>
          <p className="text-gray-500 text-sm">Add, remove, and manage students per course.</p>
        </div>
      </div>

      {/* Course Selector */}
      <Card>
        <div className="flex items-center gap-4 flex-wrap">
          <label className="text-sm font-medium text-gray-600">Select Course:</label>
          <select className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none min-w-[250px]" value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)}>
            <option value="">Choose a course...</option>
            {courseList.map(c => <option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}
          </select>
          {selectedCourse && (
            <>
              <Button className="gap-2" onClick={() => setShowAdd(!showAdd)}><Plus className="w-4 h-4" /> Add Student</Button>
              <label className="cursor-pointer">
                <Button variant="secondary" className="gap-2" as="span"><Upload className="w-4 h-4" /> Bulk Upload</Button>
                <input type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={handleUpload} />
              </label>
            </>
          )}
        </div>
      </Card>

      {msg && <div className="p-3 rounded-lg bg-indigo-50 text-indigo-700 text-sm font-medium">{msg}</div>}

      {uploadResult && (
        <Card>
          <CardHeader title="Upload Results" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="p-3 bg-gray-50 rounded-lg text-center"><p className="text-2xl font-bold text-gray-800">{uploadResult.summary.total}</p><p className="text-xs text-gray-500">Total Rows</p></div>
            <div className="p-3 bg-emerald-50 rounded-lg text-center"><p className="text-2xl font-bold text-emerald-600">{uploadResult.summary.added}</p><p className="text-xs text-gray-500">Added</p></div>
            <div className="p-3 bg-blue-50 rounded-lg text-center"><p className="text-2xl font-bold text-blue-600">{uploadResult.summary.alreadyEnrolled}</p><p className="text-xs text-gray-500">Already Enrolled</p></div>
            <div className="p-3 bg-amber-50 rounded-lg text-center"><p className="text-2xl font-bold text-amber-600">{uploadResult.summary.skipped}</p><p className="text-xs text-gray-500">Skipped</p></div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setUploadResult(null)}>Dismiss</Button>
        </Card>
      )}

      {showAdd && selectedCourse && (
        <Card>
          <CardHeader title="Add Student" />
          <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Name" placeholder="Alice Johnson" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
            <Input label="Roll Number" placeholder="CS2026001" value={form.rollNumber} onChange={e => setForm({...form, rollNumber: e.target.value})} />
            <Input label="Email (optional)" placeholder="alice@student.edu" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
            <Input label="Phone (optional)" placeholder="9876543210" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
            <div className="col-span-full flex gap-3">
              <Button type="submit">Add Student</Button>
              <Button variant="secondary" type="button" onClick={() => setShowAdd(false)}>Cancel</Button>
            </div>
          </form>
        </Card>
      )}

      {selectedCourse && (
        <Card>
          <div className="flex items-center justify-between mb-6">
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input placeholder="Search students..." containerClassName="mb-0" className="pl-10" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
            <p className="text-sm text-gray-500">{studentList.length} students enrolled</p>
          </div>

          {loading ? (
            <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>{searchTerm ? 'No students match your search.' : 'No students enrolled yet.'}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 text-sm text-gray-500">
                    <th className="pb-3 font-medium">Roll Number</th>
                    <th className="pb-3 font-medium">Name</th>
                    <th className="pb-3 font-medium">Email</th>
                    <th className="pb-3 font-medium">Phone</th>
                    <th className="pb-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {filtered.map(student => (
                    <tr key={student.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 font-medium text-indigo-600">{student.rollNumber}</td>
                      <td className="py-3 text-gray-800 font-medium">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-100 to-pink-100 flex items-center justify-center text-indigo-600 font-bold text-xs">{student.name?.charAt(0)}</div>
                          {student.name}
                        </div>
                      </td>
                      <td className="py-3 text-gray-600">{student.email || '—'}</td>
                      <td className="py-3 text-gray-600">{student.phone || '—'}</td>
                      <td className="py-3">
                        <button onClick={() => handleRemove(student.id)} className="text-gray-400 hover:text-rose-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};
