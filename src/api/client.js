// src/api/client.js
// All API calls go through the Node.js BFF, never directly to Spring Boot.

import axios from 'axios';

const http = axios.create({
  baseURL: '/api',          // proxied to BFF on port 4000
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT from sessionStorage (set after Azure AD login)
http.interceptors.request.use(config => {
  const token = sessionStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Normalise errors
http.interceptors.response.use(
  res => res.data,
  err => {
    const msg = err.response?.data?.message || err.response?.data?.error || err.message;
    return Promise.reject(new Error(msg));
  }
);

// ── Documents ──────────────────────────────────────────────────────────────
export const documentsApi = {
  list:     (params)          => http.get('/documents', { params }),
  getById:  (id)              => http.get(`/documents/${id}`),
  upload:   (formData, onProgress) => http.post('/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 120_000,
    onUploadProgress: e => onProgress?.(Math.round((e.loaded / e.total) * 100)),
  }),
  update:   (id, body)        => http.patch(`/documents/${id}`, body),
  delete:   (id)              => http.delete(`/documents/${id}`),
  download: (id, priority)    => http.get(`/documents/${id}/download`, { params: { priority } }),
  rehydrate:(id, priority)    => http.post(`/documents/${id}/rehydrate`, { priority }),
  stats:    ()                => http.get('/documents/stats'),
};

// ── Search ─────────────────────────────────────────────────────────────────
export const searchApi = {
  search:   (params)  => http.get('/search', { params }),
  suggest:  (prefix)  => http.get('/search/suggest', { params: { q: prefix } }),
};
