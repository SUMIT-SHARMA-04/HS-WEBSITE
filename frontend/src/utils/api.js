const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export async function fetchWithAuth(url, options = {}) {
    let token = localStorage.getItem('admin_access_token');
    const headers = {
        ...options.headers,
        'Authorization': `Bearer ${token}`
    };
    
    // FIXED: Auto-set Content-Type for JSON payloads to ensure DRF parses PATCH/POST properly
    if (options.body && typeof options.body === 'string' && !headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
    }

    let response = await fetch(url, { ...options, headers });

    // FIXED: JWT Interceptor. If token expired (401), use refresh token seamlessly
    if (response.status === 401) {
        const refreshToken = localStorage.getItem('admin_refresh_token');
        if (refreshToken) {
            const refreshRes = await fetch(`${API_BASE}/api/token/refresh/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refresh: refreshToken })
            });
            
            if (refreshRes.ok) {
                const data = await refreshRes.json();
                localStorage.setItem('admin_access_token', data.access);
                headers['Authorization'] = `Bearer ${data.access}`;
                
                // Retry original request
                response = await fetch(url, { ...options, headers });
            } else {
                localStorage.clear();
                window.location.href = '/admin-login';
            }
        } else {
            window.location.href = '/admin-login';
        }
    }
    return response;
}