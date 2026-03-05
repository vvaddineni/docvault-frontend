// src/pages/SearchPage.jsx
import { useState, useRef } from 'react';
import { useQuery } from 'react-query';
import { searchApi } from '../api/client';
import DocumentTable from '../components/DocumentTable';
import DocumentDrawer from '../components/DocumentDrawer';

export default function SearchPage() {
  const [mode, setMode]           = useState('ai');   // 'ai' | 'standard'
  const [query, setQuery]         = useState('');
  const [submitted, setSubmitted] = useState('');
  const [dept, setDept]           = useState('');
  const [tier, setTier]           = useState('');
  const [dateFrom, setDateFrom]   = useState('');
  const [dateTo, setDateTo]       = useState('');
  const [selectedDoc, setSelected] = useState(null);
  const [searchPage, setSearchPage] = useState(1);
  const inputRef = useRef(null);
  const PAGE_SIZE = 10;

  const switchMode = (next) => {
    setMode(next);
    setSubmitted('');
    setSearchPage(1);
  };

  // AI Search query
  const aiQuery = useQuery(
    ['search-ai', submitted, dept, tier, dateFrom, dateTo, searchPage],
    () => searchApi.search({ q: submitted, department: dept || undefined, tier: tier || undefined, dateFrom: dateFrom || undefined, dateTo: dateTo || undefined, size: PAGE_SIZE, from: (searchPage - 1) * PAGE_SIZE }),
    { enabled: mode === 'ai' && !!submitted, keepPreviousData: true }
  );

  // Standard (Cosmos) search query
  const stdQuery = useQuery(
    ['search-std', submitted, searchPage],
    () => searchApi.standardSearch({ q: submitted, page: searchPage, limit: PAGE_SIZE }),
    { enabled: mode === 'standard' && !!submitted, keepPreviousData: true }
  );

  const active   = mode === 'ai' ? aiQuery : stdQuery;
  const { isLoading, isFetching, data } = active;

  const submit = () => { if (query.trim()) { setSubmitted(query.trim()); setSearchPage(1); } };

  const results = data?.results || [];
  const facets  = data?.facets  || {};
  const count   = data?.count   || 0;
  const answers = data?.answers || [];

  const isAI = mode === 'ai';

  return (
    <div style={{ padding: '28px 32px', minHeight: '100%' }}>

      {/* Header + mode toggle */}
      <div className="animate-fade-up" style={{ marginBottom: 22, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 26, color: 'var(--text)', lineHeight: 1.1, marginBottom: 4 }}>
            Search Documents
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: 13 }}>
            {isAI
              ? 'Powered by Azure AI Search — full-text, semantic ranking, and faceted filters'
              : 'Standard search — queries title, author, department, tags, and description in Cosmos DB'}
          </p>
        </div>

        {/* Radio toggle */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 2,
          padding: '4px', borderRadius: 10,
          background: 'rgba(27,63,107,0.07)', border: '1px solid var(--border)',
          flexShrink: 0,
        }}>
          {[
            { value: 'ai',       label: 'AI Search',       desc: 'Azure AI Search index' },
            { value: 'standard', label: 'Standard Search', desc: 'Cosmos DB metadata' },
          ].map(({ value, label, desc }) => {
            const active = mode === value;
            return (
              <label key={value} title={desc} style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '7px 14px', borderRadius: 7, cursor: 'pointer',
                background: active ? 'var(--surface)' : 'transparent',
                boxShadow: active ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.15s',
              }}>
                <input
                  type="radio"
                  name="search-mode"
                  value={value}
                  checked={active}
                  onChange={() => switchMode(value)}
                  style={{ display: 'none' }}
                />
                <span style={{
                  width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                  background: active
                    ? (value === 'ai' ? 'var(--cyan)' : 'var(--green)')
                    : 'var(--border-hi)',
                  transition: 'background 0.15s',
                }} />
                <span style={{
                  fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-display)',
                  color: active ? 'var(--text)' : 'var(--muted)',
                  letterSpacing: '0.01em', userSelect: 'none',
                }}>
                  {label}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Search input */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', pointerEvents: 'none' }}>
            <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          </span>
          <input ref={inputRef} value={query} onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && submit()}
            placeholder={isAI ? 'Search by keyword, phrase, author, tag…' : 'Search title, author, department, tags, description…'}
            style={{ width: '100%', padding: '12px 14px 12px 42px', borderRadius: 11,
              background: 'var(--surface)', border: '1px solid var(--border-hi)',
              color: 'var(--text)', fontSize: 14, outline: 'none',
              boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.04)' }} />
        </div>
        <button onClick={submit} style={{
          padding: '12px 24px', borderRadius: 11, border: 'none', cursor: 'pointer',
          background: isAI
            ? 'linear-gradient(135deg, var(--accent), var(--cyan))'
            : 'linear-gradient(135deg, var(--accent), var(--green))',
          color: '#fff', fontWeight: 700, fontSize: 13, fontFamily: 'var(--font-display)',
          opacity: isFetching ? 0.7 : 1,
        }}>
          {isFetching ? 'Searching…' : 'Search'}
        </button>
      </div>

      {/* Filters row — AI Search only */}
      {isAI && (
        <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
          {[
            { label: 'Department', value: dept, set: setDept, opts: ['', 'Finance','HR','Engineering','Legal','Product','Marketing'] },
            { label: 'Tier',       value: tier, set: setTier, opts: ['', 'Hot','Archive'] },
          ].map(({ label, value, set, opts }) => (
            <select key={label} value={value} onChange={e => set(e.target.value)} style={{
              padding: '7px 13px', borderRadius: 8, border: '1px solid var(--border)',
              background: 'var(--surface)', color: value ? 'var(--text)' : 'var(--muted)',
              fontSize: 12, fontWeight: 600, cursor: 'pointer', outline: 'none',
            }}>
              <option value="">{label}: All</option>
              {opts.filter(Boolean).map(o => <option key={o}>{o}</option>)}
            </select>
          ))}
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
            title="From date" style={{ ...dateInput, color: dateFrom ? 'var(--text)' : 'var(--muted)' }} />
          <span style={{ color: 'var(--muted)', alignSelf: 'center', fontSize: 12 }}>to</span>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
            title="To date" style={{ ...dateInput, color: dateTo ? 'var(--text)' : 'var(--muted)' }} />
          {(dept || tier || dateFrom || dateTo) && (
            <button onClick={() => { setDept(''); setTier(''); setDateFrom(''); setDateTo(''); }}
              style={{ padding: '7px 12px', borderRadius: 8, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)', color: '#f87171', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* AI Answers — AI Search only */}
      {isAI && answers.length > 0 && (
        <div style={{ padding: '16px 18px', borderRadius: 10, background: 'rgba(0,107,69,0.05)', border: '1px solid rgba(0,107,69,0.2)', marginBottom: 20 }}>
          <div style={{ fontSize: 10, color: 'var(--accent-hi)', fontWeight: 700, letterSpacing: '0.1em', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', marginBottom: 8 }}>Azure AI Extracted Answer</div>
          {answers.map((a, i) => (
            <p key={i} style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 }}>{a.text?.replace(/<[^>]*>/g, '')}</p>
          ))}
        </div>
      )}

      {/* Facets — AI Search only */}
      {isAI && submitted && Object.keys(facets).length > 0 && (
        <div style={{ display: 'flex', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
          {Object.entries(facets).slice(0, 3).map(([facet, values]) => (
            <div key={facet} style={{ fontSize: 12 }}>
              <span style={{ color: 'var(--muted)', fontWeight: 600, marginRight: 6, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', fontSize: 10, letterSpacing: '0.07em' }}>{facet}:</span>
              {values?.slice(0, 4).map(v => (
                <span key={v.value} style={{ marginRight: 6, color: '#64748b' }}>
                  {v.value} <span style={{ color: 'var(--muted)' }}>({v.count})</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Results */}
      {submitted ? (
        <>
          <div style={{ marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>
              {count > 0 ? `${count} result${count !== 1 ? 's' : ''} for` : 'No results for'}
              {' '}<span style={{ color: 'var(--accent-hi)', fontFamily: 'var(--font-mono)' }}>&ldquo;{submitted}&rdquo;</span>
            </h2>
            {isFetching && <span style={{ width: 14, height: 14, border: '2px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />}
          </div>
          <DocumentTable docs={results} loading={isLoading} onSelect={setSelected} />
          <SearchPagination page={searchPage} total={count} pageSize={PAGE_SIZE} onPage={setSearchPage} />
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--muted)' }}>
          <div style={{ fontSize: 48, opacity: 0.15, marginBottom: 14, lineHeight: 1 }}>⊚</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: '#4b5563' }}>Start searching</div>
          <div style={{ fontSize: 13, marginTop: 6 }}>
            {isAI
              ? 'Full-text search across all document content, metadata, and tags'
              : 'Search by title, author, department, tags, or description'}
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 20, flexWrap: 'wrap' }}>
            {['quarterly report', 'compliance 2022', 'azure migration', 'HR policy'].map(s => (
              <button key={s} onClick={() => { setQuery(s); setSubmitted(s); }}
                style={{ padding: '6px 12px', borderRadius: 20, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--muted)', fontSize: 12, cursor: 'pointer' }}>
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedDoc && <DocumentDrawer doc={selectedDoc} onClose={() => setSelected(null)} readOnly />}
    </div>
  );
}

function SearchPagination({ page, total, pageSize, onPage }) {
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

const dateInput = {
  padding: '7px 11px', borderRadius: 8, border: '1px solid var(--border)',
  background: 'var(--surface)', fontSize: 12, fontWeight: 600, cursor: 'pointer',
  outline: 'none', fontFamily: 'inherit',
};
