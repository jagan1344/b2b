import * as XLSX from 'xlsx';

export interface StudentRow {
  name?: string;
  rollNumber?: string;
  email?: string;
  phone?: string;
}

export function parseStudentFile(buffer: Buffer): StudentRow[] {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<StudentRow>(sheet, { defval: '' });
  return rows;
}
