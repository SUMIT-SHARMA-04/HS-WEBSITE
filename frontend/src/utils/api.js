const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const fetchWithAuth = async (url, options = {}) => {
  let token = localStorage.getItem('admin_access_token');
  
  const getHeaders = (t) => ({
    ...options.headers,
    'Authorization': `Bearer ${t}`,
    'Content-Type': 'application/json',
  });

  let response = await fetch(url, { ...options, headers: getHeaders(token) });

  if (response.status === 401) {
    const refreshToken = localStorage.getItem('admin_refresh_token');
    if (!refreshToken) {
      window.location.href = '/admin-login';
      return response;
    }

    try {
      const refreshRes = await fetch(`${API_BASE}/api/token/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (refreshRes.ok) {
        const data = await refreshRes.json();
        localStorage.setItem('admin_access_token', data.access);
        response = await fetch(url, { ...options, headers: getHeaders(data.access) });
      } else {
        localStorage.clear();
        window.location.href = '/admin-login';
      }
    } catch (e) {
      localStorage.clear();
      window.location.href = '/admin-login';
    }
  }
  return response;
};