const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:5000/api');

let accessToken = localStorage.getItem('spms_access_token') || '';

export function setAccessToken(token) {
  accessToken = token;
  localStorage.setItem('spms_access_token', token);
}

export function clearAccessToken() {
  accessToken = '';
  localStorage.removeItem('spms_access_token');
}

export function getAccessToken() {
  return accessToken;
}

async function request(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  // Remove Content-Type for FormData (file uploads)
  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  // Try to refresh token on 401
  if (res.status === 401 && !options._retry) {
    const refreshed = await refreshToken();
    if (refreshed) {
      return request(path, { ...options, _retry: true });
    }
    // Redirect to login
    clearAccessToken();
    window.location.href = '/login';
    throw new Error('Session expired');
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Request failed: ${res.status}`);
  }
  return data;
}

async function refreshToken() {
  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });
    if (!res.ok) return false;
    const data = await res.json();
    setAccessToken(data.accessToken);
    return true;
  } catch {
    return false;
  }
}

// ===== AUTH =====
export const auth = {
  registerInit: (body) => request('/auth/register/init', { method: 'POST', body: JSON.stringify(body) }),
  registerVerify: (body) => request('/auth/register/verify', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  logout: () => request('/auth/logout', { method: 'POST' }),
};

// ===== TEACHER =====
export const teacher = {
  getMe: () => request('/teacher/me'),
  updateMe: (body) => request('/teacher/me', { method: 'PATCH', body: JSON.stringify(body) }),
  getAll: () => request('/teacher/all'),
};

// ===== COURSES =====
export const courses = {
  getAll: () => request('/courses'),
  getOne: (id) => request(`/courses/${id}`),
  create: (body) => request('/courses', { method: 'POST', body: JSON.stringify(body) }),
  assignTeacher: (courseId, teacherId) => request(`/courses/${courseId}/assign-teacher`, { method: 'POST', body: JSON.stringify({ teacherId }) }),
  addSubject: (courseId, name) => request(`/courses/${courseId}/subjects`, { method: 'POST', body: JSON.stringify({ name }) }),
};

// ===== STUDENTS =====
export const students = {
  getAll: (courseId) => request(`/courses/${courseId}/students`),
  add: (courseId, body) => request(`/courses/${courseId}/students`, { method: 'POST', body: JSON.stringify(body) }),
  remove: (courseId, studentId) => request(`/courses/${courseId}/students/${studentId}`, { method: 'DELETE' }),
  bulkUpload: (courseId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return request(`/courses/${courseId}/students/upload`, { method: 'POST', body: formData });
  },
};

// ===== ATTENDANCE =====
export const attendance = {
  get: (courseId, params = '') => request(`/courses/${courseId}/attendance${params ? '?' + params : ''}`),
  submit: (courseId, body) => request(`/courses/${courseId}/attendance`, { method: 'POST', body: JSON.stringify(body) }),
  update: (courseId, recordId, body) => request(`/courses/${courseId}/attendance/${recordId}`, { method: 'PATCH', body: JSON.stringify(body) }),
  summary: (courseId) => request(`/courses/${courseId}/attendance/summary`),
};

// ===== MARKS =====
export const marks = {
  get: (courseId, params = '') => request(`/courses/${courseId}/marks${params ? '?' + params : ''}`),
  add: (courseId, body) => request(`/courses/${courseId}/marks`, { method: 'POST', body: JSON.stringify(body) }),
  update: (courseId, markId, body) => request(`/courses/${courseId}/marks/${markId}`, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (courseId, markId) => request(`/courses/${courseId}/marks/${markId}`, { method: 'DELETE' }),
};

// ===== REPORTS =====
export const reports = {
  downloadPdf: (courseId) => `${API_BASE}/courses/${courseId}/reports/pdf`,
  downloadExcel: (courseId) => `${API_BASE}/courses/${courseId}/reports/excel`,
};
