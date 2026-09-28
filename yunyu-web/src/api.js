import { API_BASE } from './config';

export async function request(path, options = {}) {
  const token = localStorage.getItem('yunyu_token');
  const headers = { ...(options.headers || {}) };
  if (options.body && !headers['Content-Type']) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const type = response.headers.get('content-type') || '';
  const data = type.includes('application/json') ? await response.json() : await response.text();
  if (!response.ok) throw new Error(typeof data === 'string' ? data : (data.message || '请求失败'));
  return data;
}

export const unwrap = data => Array.isArray(data) ? data : (data?.data || data?.items || []);
