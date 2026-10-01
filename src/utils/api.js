export function getApiErrorMessage(err, fallback = 'Request failed.') {
  const status = err?.response?.status;
  const message = err?.response?.data?.message;

  if (typeof message === 'string' && message.trim()) {
    return message;
  }

  if (status === 400) return 'The request was invalid. Check required fields and try again.';
  if (status === 401) return 'Authentication required. A valid JWT is needed for API access.';
  if (status === 404) return 'The requested record was not found.';
  if (status === 409) return 'This record conflicts with existing data.';
  if (status >= 500) return 'The server encountered an error. Please try again.';
  if (!err?.response) return 'Unable to reach the API. Confirm the backend is running on the configured URL.';

  return fallback;
}

export function unwrapList(data, key) {
  if (Array.isArray(data)) return data;
  if (data && key && Array.isArray(data[key])) return data[key];
  return [];
}

export function unwrapRecord(data, key) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return data;
  if (key && data[key] && typeof data[key] === 'object') return data[key];
  return data;
}

export function toIntId(value) {
  if (value === '' || value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : null;
}

export function toDateInputValue(value) {
  if (!value) return '';
  return String(value).slice(0, 10);
}

export function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Number(value || 0));
}

export function projectName(project, fallback = '—') {
  if (!project) return fallback;
  if (project.name) return project.name;
  if (project.id != null) return `Project #${project.id}`;
  return fallback;
}
