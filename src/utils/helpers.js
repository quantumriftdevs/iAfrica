export const formatDate = (value) => {
  if (!value) return '';
  const d = (typeof value === 'string' || typeof value === 'number') ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return '';
  // use the browser locale where available
  const locale = (typeof window !== 'undefined' && navigator?.language) ? navigator.language : 'en-GB';
  // Use full month name and include time (hours:minutes:seconds) in 12-hour format with AM/PM
  const options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true };
  let formatted = new Intl.DateTimeFormat(locale, options).format(d);
  // Normalize AM/PM variants to a consistent 'A.M.' / 'P.M.' representation
  try {
    formatted = formatted.replace(/\b(?:a\.m\.|am)\b/gi, 'A.M.').replace(/\b(?:p\.m\.|pm)\b/gi, 'P.M.');
  } catch {
    // if replace fails for any reason, ignore and return the Intl formatted string
  }
  return formatted;
};

export const toInputDate = (value) => {
  if (!value) return '';
  const d = (typeof value === 'string' || typeof value === 'number') ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
};

/**
 * Choose an active season matching a programId from the list of active seasons.
 * Returns the matched season object or null when none found.
 * The matcher is defensive and supports several backend shapes: season.program, season.programId,
 * season.program._id or season.program.id. If programId is falsy and there's a single active season,
 * that season will be returned as a sensible default.
 */
export async function selectActiveSeasonForProgram(getActiveSeasonsFn, programId) {
  if (typeof getActiveSeasonsFn !== 'function') {
    throw new Error('selectActiveSeasonForProgram requires getActiveSeasons function as first argument');
  }

  const seasons = await getActiveSeasonsFn();
  if (!Array.isArray(seasons) || seasons.length === 0) return null;

  // If no programId given but there is only one active season, return it as a default
  if (!programId && seasons.length === 1) return seasons[0];

  const prog = String(programId || '');

  const match = seasons.find(s => {
    try {
      if (!s) return false;
      if (String(s._id || s.id || '') === prog) return true;
      if (String(s.program || s.programId || '') === prog) return true;
      if (s.program && (String(s.program._id || s.program.id || '') === prog)) return true;
      return false;
    } catch {
      return false;
    }
  });

  return match || null;
}

// Derive enrolled program IDs from a user object supporting several backend shapes.
export function deriveEnrolledProgramIds(user) {
  if (!user || typeof user !== 'object') return [];
  const candidates = [user.enrolledPrograms, user.programs, user.enrollments, user.enrolled];
  const ids = new Set();

  for (const list of candidates) {
    if (!Array.isArray(list)) continue;

    for (const item of list) {
      if (!item) continue;
      // if item is string -> id
      if (typeof item === 'string') { ids.add(item); continue; }

      // try common shapes
      const maybe = item.program || item.programId || item._id || item.id || (item.program && (item.program._id || item.program.id));
      if (maybe) ids.add(String(maybe));
    }
  }

  return Array.from(ids).filter(Boolean);
}

// Derive enrolled grade IDs from a user object supporting several backend shapes.
export function deriveEnrolledGradeIds(user) {
  if (!user || typeof user !== 'object') return [];
  const candidates = [user.enrolledGrades, user.grades, user.enrollments, user.enrolled];
  const ids = new Set();

  for (const list of candidates) {
    if (!Array.isArray(list)) continue;

    for (const item of list) {
      if (!item) continue;
      // if item is string -> id
      if (typeof item === 'string') { ids.add(item); continue; }

      // try common shapes: grade, gradeId, _id, id
      const maybe = item.grade || item.gradeId || item._id || item.id || (item.grade && (item.grade._id || item.grade.id));
      if (maybe) ids.add(String(maybe));
    }
  }

  return Array.from(ids).filter(Boolean);
}

// Filter courses by programIds (defensive: supports several course shapes)
export function filterCoursesByProgramIds(courses = [], programIds = []) {
  if (!Array.isArray(courses) || programIds.length === 0) return [];
  const set = new Set(programIds.map(String));
  return courses.filter(c => {
    try {
      const prog = c.program._id;
      if (!prog) return false;
      return set.has(String(prog));
    } catch {
      return false;
    }
  });
}

// Filter classes by programIds or courseIds (defensive)
export function filterClassesByProgramOrCourseIds(classes = [], courseIds = []) {
  if (!Array.isArray(classes)) return [];
  const cset = new Set((courseIds || []).map(String));

  return classes.filter(cl => {
    try {
      const course = cl.course._id;
      if (course && cset.size > 0 && cset.has(String(course))) return true;
      return false;
    } catch {
      return false;
    }
  });
}

// ---------------- Storage helpers for enrolled program ids -----------------
// (storage of enrolled program ids in localStorage removed — enrolled programs are derived from the authenticated user)
