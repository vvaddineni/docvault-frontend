// src/components/UploadModal.jsx
import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { useDropzone } from 'react-dropzone';
import { documentsApi } from '../api/client';

const DEPTS = ['Finance','HR','Engineering','Legal','Product','Marketing','General'];
const FIELD = (label, key, type = 'text', meta, setMeta) => (
  <div key={key} style={{ marginBottom: 14 }}>
    <label style={labelStyle}>{label}</label>
    <input type={type} value={meta[key] || ''} onChange={e => setMeta(m => ({ ...m, [key]: e.target.value }))}
      style={inputStyle} placeholder={`Enter ${label.toLowerCase()}…`} />
  </div>
);

export default function UploadModal({ onClose }) {
  const qc = useQueryClient();
  const [file, setFile]  = useState(null);
  const [meta, setMeta]  = useState({ title: '', author: '', department: 'General', tags: '', description: '' });
  const [progress, setProgress] = useState(0);

  const onDrop = useCallback(accepted => {
    const f = accepted[0];
    if (!f) return;
    setFile(f);
    setMeta(m => ({ ...m, title: f.name.replace(/\.[^/.]+$/, '') }));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, multiple: false, maxSize: 100 * 1024 * 1024,
    accept: { 'application/pdf': [], 'application/msword': [], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [], 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [], 'text/plain': [], 'text/csv': [] },
  });

  const mutation = useMutation(
    () => {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('metadata', JSON.stringify({
        ...meta,
        tags: meta.tags.split(',').map(t => t.trim()).filter(Boolean),
      }));
      return documentsApi.upload(fd, setProgress);
    },
    {
      onSuccess: () => { qc.invalidateQueries('documents'); qc.invalidateQueries('stats'); onClose(); },
    }
  );

  const mimeLabel = file?.type?.includes('pdf') ? 'PDF' : file?.type?.includes('word') ? 'DOCX' : file?.type?.includes('sheet') ? 'XLSX' : file?.name?.split('.').pop()?.toUpperCase() || 'FILE';

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'var(--surface)', border: '1px solid var(--border-hi)',
        borderRadius: 18, padding: '32px 32px 28px', width: '100%', maxWidth: 540,
        maxHeight: '90vh', overflowY: 'auto',
        boxShadow: '0 40px 100px rgba(0,0,0,0.7)',
        animation: 'fadeUp 0.25s ease',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, color: 'var(--text)' }}>Upload Document</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: 22, cursor: 'pointer', lineHeight: 1 }}>×</button>
        </div>

        {/* Drop zone */}
        <div {...getRootProps()} style={{
          border: `2px dashed ${isDragActive ? 'var(--accent)' : file ? 'rgba(16,185,129,0.4)' : 'var(--border-hi)'}`,
          borderRadius: 12, padding: '28px 20px', textAlign: 'center', cursor: 'pointer',
          background: isDragActive ? 'rgba(37,99,235,0.06)' : file ? 'rgba(16,185,129,0.04)' : 'rgba(255,255,255,0.02)',
          marginBottom: 22, transition: 'all 0.2s',
        }}>
          <input {...getInputProps()} />
          {file ? (
            <>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--accent-hi)', fontWeight: 700, marginBottom: 4, background: 'rgba(37,99,235,0.15)', display: 'inline-block', padding: '3px 10px', borderRadius: 6 }}>{mimeLabel}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginTop: 8 }}>{file.name}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3 }}>{(file.size / 1024 / 1024).toFixed(2)} MB</div>
            </>
          ) : (
            <>
              <div style={{ fontSize: 28, marginBottom: 8, color: 'var(--muted)', lineHeight: 1 }}>⊞</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>
                {isDragActive ? 'Drop it here' : 'Drop file or click to browse'}
              </div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>PDF · DOCX · XLSX · TXT — max 100 MB</div>
            </>
          )}
        </div>

        {/* Metadata form */}
        {FIELD('Title', 'title', 'text', meta, setMeta)}
        {FIELD('Author', 'author', 'text', meta, setMeta)}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
          <div>
            <label style={labelStyle}>Department</label>
            <select value={meta.department} onChange={e => setMeta(m => ({ ...m, department: e.target.value }))} style={inputStyle}>
              {DEPTS.map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Tags (comma-separated)</label>
            <input value={meta.tags} onChange={e => setMeta(m => ({ ...m, tags: e.target.value }))} style={inputStyle} placeholder="e.g. annual, 2025" />
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle}>Description</label>
          <textarea rows={2} value={meta.description} onChange={e => setMeta(m => ({ ...m, description: e.target.value }))}
            style={{ ...inputStyle, resize: 'vertical' }} placeholder="Brief description…" />
        </div>

        {/* Progress */}
        {mutation.isLoading && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--muted)', marginBottom: 6 }}>
              <span>Uploading via BFF → APIM → Document Service → Blob Storage…</span>
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-hi)', fontWeight: 700 }}>{progress}%</span>
            </div>
            <div style={{ height: 5, borderRadius: 3, background: 'var(--border)', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg, var(--accent), var(--cyan))', borderRadius: 3, transition: 'width 0.2s' }} />
            </div>
          </div>
        )}

        {mutation.error && (
          <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171', fontSize: 13, marginBottom: 14 }}>
            {mutation.error.message}
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '10px 18px', borderRadius: 9, border: '1px solid var(--border)', background: 'transparent', color: 'var(--muted)', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
            Cancel
          </button>
          <button onClick={() => mutation.mutate()} disabled={!file || mutation.isLoading}
            style={{ padding: '10px 22px', borderRadius: 9, border: 'none', cursor: !file || mutation.isLoading ? 'not-allowed' : 'pointer',
              background: 'linear-gradient(135deg, var(--accent), var(--cyan))',
              color: '#fff', fontWeight: 700, fontSize: 13, fontFamily: 'var(--font-display)',
              opacity: !file || mutation.isLoading ? 0.5 : 1 }}>
            {mutation.isLoading ? 'Uploading…' : 'Upload'}
          </button>
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%', padding: '9px 13px', borderRadius: 8,
  background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)',
  color: 'var(--text)', fontSize: 13, outline: 'none', fontFamily: 'inherit',
};
const labelStyle = {
  display: 'block', fontSize: 10, color: 'var(--muted)', fontWeight: 700,
  letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6,
  fontFamily: 'var(--font-mono)',
};
