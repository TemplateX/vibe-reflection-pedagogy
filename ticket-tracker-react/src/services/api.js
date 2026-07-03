const BASE_URL = '/api/v1';

async function request(url, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${url}`, { ...options, headers });

  if (response.status === 401) {
    localStorage.removeItem('token');
    window.location.href = '/login';
    return null;
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Ошибка сети' }));
    throw new Error(error.detail || 'Ошибка');
  }

  return response.json();
}

export const api = {
  // Auth – без изменений (маршруты без слеша)
  getTeachers: () => request('/auth/teachers'),
  register: (data) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data) => request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  getMe: () => request('/auth/me'),

  // Tickets – добавляем завершающие слеши, где нужно
  getTickets: (status) => {
    const query = status ? `?status=${status}` : '';
    return request(`/tickets/${query}`);  // ← GET /tickets/
  },
  createTicket: (data) => request('/tickets/', { method: 'POST', body: JSON.stringify(data) }), // ← POST /tickets/
  getTicket: (id) => request(`/tickets/${id}`), // ← GET /tickets/{id}
  addFeedback: (id, content) =>
    request(`/tickets/${id}/feedback`, { method: 'POST', body: JSON.stringify({ content }) }),
  addRevision: (id, content) =>
    request(`/tickets/${id}/revision`, { method: 'POST', body: JSON.stringify({ content }) }),
  acceptTicket: (id, comment = '') =>
    request(`/tickets/${id}/accept`, { method: 'POST', body: JSON.stringify({ comment }) }),
};