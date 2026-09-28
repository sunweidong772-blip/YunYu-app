export const API_BASE = localStorage.getItem('yunyu_api')
  || import.meta.env.VITE_API_BASE
  || 'http://localhost:3000';
