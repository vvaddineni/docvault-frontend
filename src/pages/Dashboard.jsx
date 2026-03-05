// src/pages/Dashboard.jsx
import { useState } from 'react';
import { useQuery } from 'react-query';
import { documentsApi } from '../api/client';
import StatsCards from '../components/StatsCards';
import DocumentTable from '../components/DocumentTable';
import DocumentDrawer from '../components/DocumentDrawer';

const TIERS   = ['All', 'Hot', 'Archive'];
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
      page, limit: 10,
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
      <Pagination page={page} total={total} pageSize={10} onPage={setPage} />

      {selectedDoc && <DocumentDrawer doc={selectedDoc} onClose={() => setSelected(null)} />}
    </div>
  );
}

function Pagination({ page, total, pageSize, onPage }) {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const visible = pages.filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 2);
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, marginTop: 20 }}>
      <button onClick={() => onPage(page - 1)} disabled={page === 1} style={navBtn(page === 1)}>‹</button>
      {visible.reduce((acc, p, i) => {
        if (i > 0 && p - visible[i - 1] > 1) acc.push(<span key={`gap-${p}`} style={{ color: 'var(--muted)', fontSize: 12 }}>…</span>);
        acc.push(
          <button key={p} onClick={() => onPage(p)} style={{
            width: 34, height: 34, borderRadius: 8, border: '1px solid var(--border)',
            background: page === p ? 'var(--accent)' : 'var(--surface)',
            color: page === p ? '#fff' : 'var(--muted)',
            fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}>{p}</button>
        );
        return acc;
      }, [])}
      <button onClick={() => onPage(page + 1)} disabled={page === totalPages} style={navBtn(page === totalPages)}>›</button>
    </div>
  );
}

const navBtn = (disabled) => ({
  width: 34, height: 34, borderRadius: 8, border: '1px solid var(--border)',
  background: 'var(--surface)', color: disabled ? 'var(--border-hi)' : 'var(--muted)',
  fontSize: 18, fontWeight: 600, cursor: disabled ? 'default' : 'pointer',
});

