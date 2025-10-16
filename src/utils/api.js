import axios from 'axios';

const BASE_API_URL = import.meta.env.VITE_BASE_API_URL;

const client = axios.create({
  baseURL: BASE_API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 15000
});

// Helper to resolve bearer token based on role or current path
function resolveAuthToken(role) {
  try {
    // explicit role passed via opts.role
    if (role === 'admin') return localStorage.getItem('admin-token');
    if (role === 'lecturer') return localStorage.getItem('lecturer-token');
    if (role === 'student') return localStorage.getItem('student-token');

    // infer from pathname, e.g., /admin, /lecturer, /student
    if (typeof window !== 'undefined' && window.location && window.location.pathname) {
      const p = window.location.pathname.toLowerCase();
      if (p.startsWith('/admin')) return localStorage.getItem('admin-token');
      if (p.startsWith('/lecturer')) return localStorage.getItem('lecturer-token');
      if (p.startsWith('/student')) return localStorage.getItem('student-token');
    }
  } catch {
    // ignore localStorage errors (SSR or restricted environments)
  }
  return null;
}

async function request(path, opts = {}) {
  try {
    const method = (opts.method || 'get').toLowerCase();
    const config = {
      url: path,
      method,
      headers: opts.headers || {},
    };

    if (opts.body) {
      // fetch used string bodies; axios expects data
      config.data = opts.body;
    }

    // attach Authorization header when token is resolvable for admin/lecturer/student
    try {
      const token = resolveAuthToken(opts.role);
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // ignore token resolution errors
    }

    const res = await client.request(config);
    return res.data;
  } catch (err) {
    // Normalize error similar to fetch-based implementation
    const e = new Error(`Request failed: ${err.response ? err.response.status : 'network'} ${err.message}`);
    if (err.response) {
      e.status = err.response.status;
      e.body = err.response.data;
    }
    throw e;
  }
}

export async function getPrograms() {
  const data = await request('/api/v1/programs');
  return data && data.data ? data.data : data;
}

export async function getCourses() {
  const data = await request('/api/v1/courses');
  return data && data.data ? data.data : data;
}

export async function getResources() {
  const data = await request('/api/v1/resources');
  return data && data.data ? data.data : data;
}

export async function getLecturers() {
  const data = await request('/api/v1/users/lecturers');
  return data && data.data ? data.data : data;
}

export async function getCertificates() {
  const data = await request('/api/v1/certificates');
  return data && data.data ? data.data : data;
}

export async function getUsers() {
  const data = await request('/api/v1/users');
  return data && data.data ? data.data : data;
}

// Create a new user (admin)
export async function createUser(payload) {
  if (!payload) throw new Error('Missing payload for createUser');
  const data = await request('/api/v1/users', { method: 'post', body: payload });
  return data && data.data ? data.data : data;
}

export async function getClasses() {
  const data = await request('/api/v1/classes');
  return data && data.data ? data.data : data;
}

// Create a new class (lecturer)
export async function createClass(payload) {
  if (!payload) throw new Error('Missing payload for createClass');
  const data = await request('/api/v1/classes', { method: 'post', body: payload });
  return data && data.data ? data.data : data;
}

export async function getPayments() {
  const data = await request('/api/v1/payments');
  return data && data.data ? data.data : data;
}

// Initialize a payment for enrollment or other checkout flows.
// payload should include programId, gradeId, amount, currency, returnUrl, metadata, etc.
export async function initializePayment(payload) {
  const data = await request('/api/v1/payments/initialize', { method: 'post', body: payload });
  return data && data.data ? data.data : data;
}

// Verify a payment after the gateway redirects back with a reference or transaction id.
// Common query param names: reference, trxref
export async function verifyPayment(reference) {
  if (!reference) throw new Error('Missing payment reference');
  // backend should verify with gateway and return payment status
  const data = await request(`/api/v1/payments/verify?reference=${encodeURIComponent(reference)}`);
  return data && data.data ? data.data : data;
}

export async function getSeasons() {
  const data = await request('/api/v1/seasons');
  return data && data.data ? data.data : data;
}

export async function getNotifications() {
  const data = await request('/api/v1/notifications');
  return data && data.data ? data.data : data;
}

export default {
  getPrograms,
  getCourses,
  getResources,
  getLecturers,
  getCertificates,
  getUsers,
  getClasses,
  getPayments,
  initializePayment,
  verifyPayment,
  getSeasons,
  getNotifications,
  BASE_API_URL
};
