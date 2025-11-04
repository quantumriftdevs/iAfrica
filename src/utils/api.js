import axios from 'axios';

const BASE_API_URL = import.meta.env.VITE_BASE_API_URL;

const client = axios.create({
  baseURL: BASE_API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 1500000
});

// Helper to resolve bearer token based on role or current path
function resolveAuthToken() {
  return localStorage.getItem('iafrica-token');
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
      const token = resolveAuthToken();

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
    // Normalize error and prefer backend-provided messages when available
    // backend often returns { message: '...', error: '...' } in response.data
    const resp = err && err.response && err.response.data ? err.response.data : undefined;
    const backendMessage = resp && (resp.message || resp.error);
    const status = err && err.response ? err.response.status : 'network';
    const message = backendMessage || err.message || `Request failed: ${status}`;

    const e = new Error(message);
    // attach status and body for callers that inspect them
    if (err.response) {
      e.status = err.response.status;
      e.body = err.response.data;
    }
    throw e;
  }
}

// (formatApiError is implemented later in this file)

// Helper to build query strings from an object
function buildQuery(params = {}) {
  const esc = encodeURIComponent;
  const query = Object.keys(params)
    .filter(k => params[k] !== undefined && params[k] !== null)
    .map(k => `${esc(k)}=${esc(params[k])}`)
    .join('&');
  return query ? `?${query}` : '';
}

export async function getPrograms() {
  const data = await request('/api/v1/programs', { method: 'get' });
  console.log({ data });
  return data && data.data ? data.data : data;
}

export async function createProgram(payload) {
  if (!payload) throw new Error('Missing payload for createProgram');
  // Ensure default flags are present when creating a program
  let createdById = undefined;
  try {
    // attempt to include the current user's id as createdBy when available
    const me = await getCurrentUser();
    if (me && (me._id || me.id)) createdById = me._id || me.id;
  } catch {
    // ignore — createProgram will still work without createdBy
  }

  const body = {
    ...payload,
    isActive: payload.isActive === undefined ? true : payload.isActive,
    isSuspended: payload.isSuspended === undefined ? false : payload.isSuspended,
    ...(createdById ? { createdBy: createdById } : {})
  };

  const data = await request('/api/v1/programs', { method: 'post', body });
  return data && data.data ? data.data : data;
}

export async function getProgram(id) {
  if (!id) throw new Error('Missing id for getProgram');
  const data = await request(`/api/v1/programs/${encodeURIComponent(id)}`);
  return data && data.data ? data.data : data;
}

export async function updateProgram(id, payload) {
  if (!id) throw new Error('Missing id for updateProgram');
  if (!payload) throw new Error('Missing payload for updateProgram');
  const data = await request(`/api/v1/programs/${encodeURIComponent(id)}`, { method: 'put', body: payload });
  return data && data.data ? data.data : data;
}

export async function deleteProgram(id) {
  if (!id) throw new Error('Missing id for deleteProgram');
  const data = await request(`/api/v1/programs/${encodeURIComponent(id)}`, { method: 'delete' });
  return data && data.data ? data.data : data;
}

export async function toggleProgramActive(id) {
  if (!id) throw new Error('Missing id for toggleProgramActive');
  const data = await request(`/api/v1/programs/${encodeURIComponent(id)}/toggle-active`, { method: 'put' });
  return data && data.data ? data.data : data;
}

export async function toggleProgramSuspension(id) {
  if (!id) throw new Error('Missing id for toggleProgramSuspension');
  const data = await request(`/api/v1/programs/${encodeURIComponent(id)}/toggle-suspension`, { method: 'put' });
  return data && data.data ? data.data : data;
}

export async function uploadProgramImage(id, formData) {
  if (!id) throw new Error('Missing id for uploadProgramImage');
  if (!formData) throw new Error('Missing formData for uploadProgramImage');
  const data = await request(`/api/v1/programs/${encodeURIComponent(id)}/image`, { method: 'put', body: formData, headers: { 'Content-Type': 'multipart/form-data' } });
  return data && data.data ? data.data : data;
}

export async function getProgramStats(id) {
  if (!id) throw new Error('Missing id for getProgramStats');
  const data = await request(`/api/v1/programs/${encodeURIComponent(id)}/stats`);
  return data && data.data ? data.data : data;
}

export async function searchPrograms(params) {
  const q = typeof params === 'string' ? { q: params } : (params || {});
  const data = await request(`/api/v1/programs/search${buildQuery(q)}`);
  return data && data.data ? data.data : data;
}

export async function getActivePrograms() {
  const data = await request('/api/v1/programs/active');
  return data && data.data ? data.data : data;
}

export async function bulkUpdateProgramStatus(payload) {
  if (!payload) throw new Error('Missing payload for bulkUpdateProgramStatus');
  const data = await request('/api/v1/programs/bulk-status', { method: 'put', body: payload });
  return data && data.data ? data.data : data;
}

export async function bulkDeletePrograms(payload) {
  if (!payload) throw new Error('Missing payload for bulkDeletePrograms');
  const data = await request('/api/v1/programs/bulk', { method: 'delete', body: payload });
  return data && data.data ? data.data : data;
}

export async function getCourses() {
  const data = await request('/api/v1/courses');
  return data && data.data ? data.data : data;
}

export async function createCourse(payload) {
  if (!payload) throw new Error('Missing payload for createCourse');
  const data = await request('/api/v1/courses', { method: 'post', body: payload });
  return data && data.data ? data.data : data;
}

export async function getCourse(id) {
  if (!id) throw new Error('Missing id for getCourse');
  const data = await request(`/api/v1/courses/${encodeURIComponent(id)}`);
  return data && data.data ? data.data : data;
}

export async function updateCourse(id, payload) {
  if (!id) throw new Error('Missing id for updateCourse');
  if (!payload) throw new Error('Missing payload for updateCourse');
  const data = await request(`/api/v1/courses/${encodeURIComponent(id)}`, { method: 'put', body: payload });
  return data && data.data ? data.data : data;
}

export async function deleteCourse(id) {
  if (!id) throw new Error('Missing id for deleteCourse');
  const data = await request(`/api/v1/courses/${encodeURIComponent(id)}`, { method: 'delete' });
  return data && data.data ? data.data : data;
}

export async function getResources() {
  const data = await request('/api/v1/resources');
  return data && data.data ? data.data : data;
}

export async function createResource(payload) {
  if (!payload) throw new Error('Missing payload for createResource');
  const data = await request('/api/v1/resources', { method: 'post', body: payload });
  return data && data.data ? data.data : data;
}

export async function getResource(id) {
  if (!id) throw new Error('Missing id for getResource');
  const data = await request(`/api/v1/resources/${encodeURIComponent(id)}`);
  return data && data.data ? data.data : data;
}

export async function updateResource(id, payload) {
  if (!id) throw new Error('Missing id for updateResource');
  if (!payload) throw new Error('Missing payload for updateResource');
  const data = await request(`/api/v1/resources/${encodeURIComponent(id)}`, { method: 'put', body: payload });
  return data && data.data ? data.data : data;
}

export async function deleteResource(id) {
  if (!id) throw new Error('Missing id for deleteResource');
  const data = await request(`/api/v1/resources/${encodeURIComponent(id)}`, { method: 'delete' });
  return data && data.data ? data.data : data;
}

export async function uploadResourceFile(id, formData) {
  if (!id) throw new Error('Missing id for uploadResourceFile');
  if (!formData) throw new Error('Missing formData for uploadResourceFile');
  const data = await request(`/api/v1/resources/${encodeURIComponent(id)}/upload`, { method: 'put', body: formData, headers: { 'Content-Type': 'multipart/form-data' } });
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

export async function verifyCertificate(payload) {
  if (!payload) throw new Error('Missing payload for verifyCertificate');
  const data = await request('/api/v1/certificates/verify', { method: 'post', body: payload });
  return data && data.data ? data.data : data;
}

export async function generateCertificate(payload) {
  if (!payload) throw new Error('Missing payload for generateCertificate');
  const data = await request('/api/v1/certificates/generate', { method: 'post', body: payload });
  return data && data.data ? data.data : data;
}

export async function uploadCertificatePdf(id, formData) {
  if (!id) throw new Error('Missing id for uploadCertificatePdf');
  if (!formData) throw new Error('Missing formData for uploadCertificatePdf');
  const data = await request(`/api/v1/certificates/${encodeURIComponent(id)}/upload`, { method: 'put', body: formData, headers: { 'Content-Type': 'multipart/form-data' } });
  return data && data.data ? data.data : data;
}

export async function getUsers() {
  const data = await request('/api/v1/users');
  return data && data.data ? data.data : data;
}

// Create a new user (admin)
export async function createUser(payload) {
  if (!payload) throw new Error('Missing payload for createUser');
  try {
    const data = await request('/api/v1/users', { method: 'post', body: payload });
    console.log({ data });
    return data && data.data ? data.data : data;
  } catch (error) {
    // Re-throw so callers can handle/display the error consistently
    console.error('createUser error', error);
    throw error;
  }
}

export async function updateUser(id, payload) {
  if (!id) throw new Error('Missing id for updateUser');
  if (!payload) throw new Error('Missing payload for updateUser');
  const data = await request(`/api/v1/users/${encodeURIComponent(id)}`, { method: 'put', body: payload });
  return data && data.data ? data.data : data;
}

export async function getClasses() {
  const data = await request('/api/v1/classes');
  return data && data.data ? data.data : data;
}

export async function getLecturerClasses(lecturerId) {
  if (!lecturerId) throw new Error('Missing lecturerId for getLecturerClasses');
  const data = await request(`/api/v1/classes/lecturer/${encodeURIComponent(lecturerId)}`);
  return data && data.data ? data.data : data;
}

// Create a new class (lecturer)
export async function createClass(payload) {
  if (!payload) throw new Error('Missing payload for createClass');

  const body = {
    title: payload.title || payload.name || payload.name || payload.courseName || '',
    description: payload.description || payload.desc || payload.summary || '',
    course: payload.course || payload.programId || payload.courseId || undefined,
    season: payload.season || payload.seasonId || undefined,
    lecturer: payload.lecturer || payload.lecturerId || payload.teacher || undefined,
    scheduledDate: payload.scheduledDate || payload.schedule || payload.scheduled || undefined,
    duration: typeof payload.duration === 'number' ? payload.duration : (payload.duration ? Number(payload.duration) : 0)
  };

  const data = await request('/api/v1/classes', { method: 'post', body });
  return data && data.data ? data.data : data;
}

export async function getClass(id) {
  if (!id) throw new Error('Missing id for getClass');
  const data = await request(`/api/v1/classes/${encodeURIComponent(id)}`);
  return data && data.data ? data.data : data;
}

export async function getClassToken(id) {
  if (!id) throw new Error('Missing id for getClassToken');
  const data = await request(`/api/v1/classes/${encodeURIComponent(id)}/token`);
  return data && data.data ? data.data : data;
}

export async function updateClass(id, payload) {
  if (!id) throw new Error('Missing id for updateClass');
  if (!payload) throw new Error('Missing payload for updateClass');
  const data = await request(`/api/v1/classes/${encodeURIComponent(id)}`, { method: 'put', body: payload });
  return data && data.data ? data.data : data;
}

export async function updateClassRecording(id, payload) {
  try {
    if (!id) throw new Error('Missing id for updateClassRecording');
    const data = await request(`/api/v1/classes/${encodeURIComponent(id)}/recording`, { method: 'put', body: payload });
    return data && data.data ? data.data : data;
  } catch (error) {
    console.log({ recordingError: error });
  }
}

export async function updateClassStatus(id, payload) {
  if (!id) throw new Error('Missing id for updateClassStatus');
  const data = await request(`/api/v1/classes/${encodeURIComponent(id)}/status`, { method: 'put', body: payload });
  return data && data.data ? data.data : data;
}

export async function deleteClass(id) {
  if (!id) throw new Error('Missing id for deleteClass');
  const data = await request(`/api/v1/classes/${encodeURIComponent(id)}`, { method: 'delete' });
  return data && data.data ? data.data : data;
}

// Grades (basic helpers - backend may vary)
export async function updateGrade(id, payload) {
  if (!id) throw new Error('Missing id for updateGrade');
  if (!payload) throw new Error('Missing payload for updateGrade');
  const data = await request(`/api/v1/grades/${encodeURIComponent(id)}`, { method: 'put', body: payload });
  return data && data.data ? data.data : data;
}

export async function getGrade(id) {
  if (!id) throw new Error('Missing id for getGrade');
  const data = await request(`/api/v1/grades/${encodeURIComponent(id)}`);
  return data && data.data ? data.data : data;
}

export async function getGrades() {
  const data = await request('/api/v1/grades');
  return data && data.data ? data.data : data;
}

export async function createGrade(payload) {
  if (!payload) throw new Error('Missing payload for creating Grade');

  const data = await request('/api/v1/grades', { method: 'post', body: payload });
  return data && data.data ? data.data : data;
}


export async function getPayments() {
  const data = await request('/api/v1/payments');
  return data && data.data ? data.data : data;
}

export async function getUserPayments() {
  const data = await request('/api/v1/payments/user');
  return data && data.data ? data.data : data;
}

export async function initializePayment(payload) {
  const data = await request('/api/v1/payments/initialize', { method: 'post', body: payload });
  return data && data.data ? data.data : data;
}

export async function verifyPayment(reference) {
  if (!reference) throw new Error('Missing payment reference');

  const data = await request(`/api/v1/payments/verify?reference=${encodeURIComponent(reference)}`);
  return data && data.data ? data.data : data;
}

export async function getSeasons() {
  const data = await request('/api/v1/seasons');
  return data && data.data ? data.data : data;
}

export async function createSeason(payload) {
  if (!payload) throw new Error('Missing payload for createSeason');
  const data = await request('/api/v1/seasons', { method: 'post', body: payload });
  return data && data.data ? data.data : data;
}

export async function getSeason(id) {
  if (!id) throw new Error('Missing id for getSeason');
  const data = await request(`/api/v1/seasons/${encodeURIComponent(id)}`);
  return data && data.data ? data.data : data;
}

export async function updateSeason(id, payload) {
  if (!id) throw new Error('Missing id for updateSeason');
  if (!payload) throw new Error('Missing payload for updateSeason');
  const data = await request(`/api/v1/seasons/${encodeURIComponent(id)}`, { method: 'put', body: payload });
  return data && data.data ? data.data : data;
}

export async function deleteSeason(id) {
  if (!id) throw new Error('Missing id for deleteSeason');
  const data = await request(`/api/v1/seasons/${encodeURIComponent(id)}`, { method: 'delete' });
  return data && data.data ? data.data : data;
}

export async function getActiveSeasons() {
  const data = await request('/api/v1/seasons/active');
  return data && data.data ? data.data : data;
}

export async function getAvailableSeasons() {
  const data = await request('/api/v1/seasons/available');
  return data && data.data ? data.data : data;
}

export async function getCurrentSeasons() {
  const data = await request('/api/v1/seasons/current');
  return data && data.data ? data.data : data;
}

export async function getUpcomingSeasons() {
  const data = await request('/api/v1/seasons/upcoming');
  return data && data.data ? data.data : data;
}

export async function getNotifications() {
  const data = await request('/api/v1/notifications');
  return data && data.data ? data.data : data;
}

export async function testNotification() {
  const data = await request('/api/v1/notifications/test', { method: 'get' });
  return data && data.data ? data.data : data;
}

export async function sendClassReminders(payload) {
  if (!payload) throw new Error('Missing payload for sendClassReminders');
  const data = await request('/api/v1/notifications/send-class-reminders', { method: 'post', body: payload });
  return data && data.data ? data.data : data;
}

export async function loginUser(payload) {
  if (!payload) throw new Error('Missing payload for loginUser');
  const data = await request('/api/v1/auth/login', { method: 'post', body: payload });
  return data && data.data ? data.data : data;
}

export async function registerUser(payload) {
  if (!payload) throw new Error('Missing payload for registerUser');
  const data = await request('/api/v1/auth/register', { method: 'post', body: payload });
  return data && data.data ? data.data : data;
}

export async function updateAuthDetails(payload) {
  if (!payload) throw new Error('Missing payload for updateAuthDetails');
  const data = await request('/api/v1/auth/updatedetails', { method: 'put', body: payload });
  return data && data.data ? data.data : data;
}

export async function updateAuthPassword(payload) {
  if (!payload) throw new Error('Missing payload for updateAuthPassword');
  const data = await request('/api/v1/auth/updatepassword', { method: 'put', body: payload });
  return data && data.data ? data.data : data;
}

export async function forgotPassword(payload) {
  if (!payload) throw new Error('Missing payload for forgotPassword');
  const data = await request('/api/v1/auth/forgotpassword', { method: 'post', body: payload });
  return data && data.data ? data.data : data;
}

export async function resetPassword(resettoken, payload) {
  if (!resettoken) throw new Error('Missing resettoken for resetPassword');
  if (!payload) throw new Error('Missing payload for resetPassword');
  const data = await request(`/api/v1/auth/resetpassword/${encodeURIComponent(resettoken)}`, { method: 'put', body: payload });
  return data && data.data ? data.data : data;
}

export async function getCurrentUser() {
  const data = await request('/api/v1/auth/me');
  return data && data.data ? data.data : data;
}

export async function logoutUser() {
  const data = await request('/api/v1/auth/logout');
  return data;
}

// Helper to format API errors into friendly messages
export function formatApiError(err) {
  if (!err) return 'An unknown error occurred';
  // If our normalized error has a body with message
  try {
    if (err.body && typeof err.body === 'object') {
      if (err.body.message) return String(err.body.message);
      if (err.body.error) return String(err.body.error);
    }
  } catch {
    // ignore
  }

  // Axios response payload
  if (err.response && err.response.data) {
    const d = err.response.data;
    if (d.message) return String(d.message);
    if (d.error) return String(d.error);
  }

  // Generic message
  if (err.message) return String(err.message);
  try { return JSON.stringify(err); } catch { return 'An unknown error occurred'; }
}

export default {
  // Programs
  getPrograms,
  createProgram,
  getProgram,
  updateProgram,
  deleteProgram,
  toggleProgramActive,
  toggleProgramSuspension,
  uploadProgramImage,
  getProgramStats,
  searchPrograms,
  getActivePrograms,
  bulkUpdateProgramStatus,
  bulkDeletePrograms,

  // Courses
  getCourses,
  createCourse,
  getCourse,
  updateCourse,
  deleteCourse,

  // Resources
  getResources,
  createResource,
  getResource,
  updateResource,
  deleteResource,
  uploadResourceFile,

  // Certificates
  getCertificates,
  verifyCertificate,
  generateCertificate,
  uploadCertificatePdf,

  // Users / Lecturers
  getUsers,
  createUser,
  updateUser,
  getLecturers,

  // Classes
  getClasses,
  getLecturerClasses,
  createClass,
  getClass,
  getClassToken,
  updateClass,
  updateClassRecording,
  updateClassStatus,
  deleteClass,

  // Payments
  getPayments,
  initializePayment,
  verifyPayment,

  // Seasons
  getSeasons,
  createSeason,
  getSeason,
  updateSeason,
  deleteSeason,
  getActiveSeasons,
  getAvailableSeasons,
  getCurrentSeasons,
  getUpcomingSeasons,

  // Notifications
  getNotifications,
  testNotification,
  sendClassReminders,

  // Auth
  loginUser,
  registerUser,
  getCurrentUser,
  logoutUser,
  updateAuthDetails,
  updateAuthPassword,
  forgotPassword,
  resetPassword,

  BASE_API_URL
};
