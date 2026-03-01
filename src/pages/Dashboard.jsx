// src/pages/Dashboard.jsx
import { useState } from 'react';
import { useQuery } from 'react-query';
import { documentsApi } from '../api/client';
import StatsCards from '../components/StatsCards';
import DocumentTable from '../components/DocumentTable';
import DocumentDrawer from '../components/DocumentDrawer';

const TIERS   = ['All', 'Hot', 'Cool', 'Cold', 'Archive'];
const DEPTS   = ['All', 'Finance', 'HR', 'Engineering', 'Legal', 'Product', 'Marketing'];

export default function Dashboard({ onUploadClick }) {
  const [tier, setTier]           = useState('All');
  const [dept, setDept]           = useState('All');
  const [page, setPage]           = useState(1);
  const [selectedDoc, setSelected] = useState(null);

  const { data: statsData } = useQuery('stats', documentsApi.stats, { suspense: false });
  const { data, isLoading, isFetching } = useQuery(
    ['documents', { tier, dept, page }],
    () => documentsApi.list({
      tier:       tier !== 'All' ? tier : undefined,
      department: dept !== 'All' ? dept : undefined,
      page, limit: 25,
    }),
    { keepPreviousData: true }
  );

  const docs  = data?.documents || MOCK_DOCS;
  const total = data?.total      || MOCK_DOCS.length;
  const stats = statsData        || MOCK_STATS;

  return (
    <div style={{ padding: '28px 32px', minHeight: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
        <div className="animate-fade-up">
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 26, color: 'var(--text)', lineHeight: 1.1 }}>
            Document Vault
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 4 }}>
            {total} documents across all tiers
          </p>
        </div>
        <button onClick={onUploadClick} style={uploadBtnStyle}>
          + New Document
        </button>
      </div>

      {/* Stats */}
      <StatsCards stats={stats} />

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, margin: '24px 0 16px', flexWrap: 'wrap' }}>
        {/* Tier filter */}
        <div style={{ display: 'flex', gap: 4, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: 4 }}>
          {TIERS.map(t => (
            <button key={t} onClick={() => { setTier(t); setPage(1); }} style={{
              padding: '5px 12px', borderRadius: 7, border: 'none', cursor: 'pointer',
              fontSize: 12, fontWeight: 600, transition: 'all 0.15s',
              background: tier === t ? 'rgba(37,99,235,0.25)' : 'transparent',
              color: tier === t ? '#93c5fd' : 'var(--muted)',
            }}>{t}</button>
          ))}
        </div>

        {/* Dept select */}
        <select value={dept} onChange={e => { setDept(e.target.value); setPage(1); }} style={{
          padding: '7px 14px', borderRadius: 9, border: '1px solid var(--border)',
          background: 'var(--surface)', color: dept !== 'All' ? 'var(--text)' : 'var(--muted)',
          fontSize: 12, fontWeight: 600, cursor: 'pointer', outline: 'none',
        }}>
          {DEPTS.map(d => <option key={d}>{d}</option>)}
        </select>

        {isFetching && <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--muted)', fontSize: 12 }}>
          <span style={{ width: 12, height: 12, border: '2px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
          Refreshing…
        </div>}
      </div>

      {/* Table */}
      <DocumentTable
        docs={docs}
        loading={isLoading}
        onSelect={setSelected}
      />

      {/* Pagination */}
      {total > 25 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20 }}>
          {Array.from({ length: Math.ceil(total / 25) }).slice(0, 7).map((_, i) => (
            <button key={i} onClick={() => setPage(i + 1)} style={{
              width: 34, height: 34, borderRadius: 8, border: '1px solid var(--border)',
              background: page === i + 1 ? 'var(--accent)' : 'var(--surface)',
              color: page === i + 1 ? '#fff' : 'var(--muted)',
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}>{i + 1}</button>
          ))}
        </div>
      )}

      {selectedDoc && <DocumentDrawer doc={selectedDoc} onClose={() => setSelected(null)} />}
    </div>
  );
}

const uploadBtnStyle = {
  padding: '9px 18px', borderRadius: 9, border: '1px solid rgba(37,99,235,0.4)',
  background: 'rgba(37,99,235,0.12)', color: '#93c5fd', fontSize: 13, fontWeight: 700,
  cursor: 'pointer', fontFamily: 'var(--font-display)', letterSpacing: '0.02em',
  transition: 'all 0.15s',
};

// ── Mock fallback data (shown without a real backend) ──────────────────────
const MOCK_DOCS = [
  { id: '1', title: 'Q4 2024 Financial Report',    author: 'Sarah Chen',      department: 'Finance',     tags: ['quarterly','finance'],    storageTier: 'Hot',     fileSizeBytes: 2048000, uploadedAt: '2024-12-15T09:00:00Z', mimeType: 'application/pdf',        description: 'Consolidated Q4 statements.' },
  { id: '2', title: 'Employee Handbook v3.2',       author: 'Marcus Thompson', department: 'HR',          tags: ['policy','hr'],             storageTier: 'Cool',    fileSizeBytes: 512000,  uploadedAt: '2024-06-01T14:00:00Z', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', description: 'Updated benefits and conduct guide.' },
  { id: '3', title: 'Azure Migration Architecture', author: 'Priya Nair',      department: 'Engineering', tags: ['azure','cloud'],           storageTier: 'Hot',     fileSizeBytes: 8192000, uploadedAt: '2025-01-20T11:30:00Z', mimeType: 'application/pdf',        description: 'Cloud migration reference architecture.' },
  { id: '4', title: '2022 Compliance Audit',        author: 'James Okafor',    department: 'Legal',       tags: ['compliance','audit'],      storageTier: 'Archive', fileSizeBytes: 3145728, uploadedAt: '2022-08-10T08:00:00Z', mimeType: 'application/pdf',        description: 'Annual regulatory compliance findings.' },
  { id: '5', title: 'Product Roadmap 2025',         author: 'Elena Vasquez',   department: 'Product',     tags: ['roadmap','strategy'],      storageTier: 'Hot',     fileSizeBytes: 1024000, uploadedAt: '2025-02-01T16:00:00Z', mimeType: 'application/vnd.ms-powerpoint', description: 'Strategic product direction FY2025.' },
  { id: '6', title: '2021 Tax Filing Documents',    author: 'Finance Team',    department: 'Finance',     tags: ['tax','2021'],              storageTier: 'Archive', fileSizeBytes: 4096000, uploadedAt: '2021-03-15T10:00:00Z', mimeType: 'application/pdf',        description: 'Annual tax filing supporting docs.' },
  { id: '7', title: 'Marketing Campaign Analytics', author: 'Zoe Park',        department: 'Marketing',   tags: ['analytics','campaigns'],   storageTier: 'Cool',    fileSizeBytes: 768000,  uploadedAt: '2024-09-30T13:00:00Z', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', description: 'H2 campaign performance metrics.' },
  { id: '8', title: 'Security Policy v2.0',         author: 'Dev Sharma',      department: 'Engineering', tags: ['security','policy'],       storageTier: 'Hot',     fileSizeBytes: 256000,  uploadedAt: '2025-01-05T09:00:00Z', mimeType: 'text/plain',             description: 'Information security policy update.' },
];
const MOCK_STATS = { total: 8, hot: 3, cool: 2, archive: 2, totalMb: 19, byDepartment: [{ dept:'Finance',count:2 },{ dept:'Engineering',count:2 },{ dept:'HR',count:1 }] };
