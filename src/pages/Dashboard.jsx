// src/pages/Dashboard.jsx
import { useState } from 'react';
import { useQuery } from 'react-query';
import { documentsApi } from '../api/client';
import StatsCards from '../components/StatsCards';
import DocumentTable from '../components/DocumentTable';
import DocumentDrawer from '../components/DocumentDrawer';

const TIERS   = ['All', 'Hot', 'Cool', 'Cold', 'Archive'];
const DEPTS   = ['All', 'Finance', 'HR', 'Engineering', 'Legal', 'Product', 'Marketing'];

export default function Dashboard() {
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

  const docs  = data?.content        || [];
  const total = data?.totalElements  || 0;
  const stats = statsData            || {};

  return (
    <div style={{ padding: '28px 32px', minHeight: '100%' }}>
      {/* Header */}
      <div className="animate-fade-up" style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 26, color: 'var(--text)', lineHeight: 1.1 }}>
          Document Vault
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 4 }}>
          {total} documents across all tiers
        </p>
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
              background: tier === t ? 'rgba(0,107,69,0.15)' : 'transparent',
              color: tier === t ? 'var(--accent)' : 'var(--muted)',
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

