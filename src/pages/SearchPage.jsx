// src/pages/SearchPage.jsx
import { useState, useRef } from 'react';
import { useQuery } from 'react-query';
import { searchApi } from '../api/client';
import DocumentTable from '../components/DocumentTable';
import DocumentDrawer from '../components/DocumentDrawer';

export default function SearchPage() {
  const [query, setQuery]         = useState('');
  const [submitted, setSubmitted] = useState('');
  const [dept, setDept]           = useState('');
  const [tier, setTier]           = useState('');
  const [dateFrom, setDateFrom]   = useState('');
  const [dateTo, setDateTo]       = useState('');
  const [selectedDoc, setSelected] = useState(null);
  const inputRef = useRef(null);

  const { data, isLoading, isFetching } = useQuery(
    ['search', submitted, dept, tier, dateFrom, dateTo],
    () => searchApi.search({ q: submitted, department: dept || undefined, tier: tier || undefined, dateFrom: dateFrom || undefined, dateTo: dateTo || undefined }),
    { enabled: !!submitted, keepPreviousData: true }
  );

  const submit = () => { if (query.trim()) setSubmitted(query.trim()); };

  const results  = data?.results  || [];
  const facets   = data?.facets   || {};
  const count    = data?.count    || 0;
  const answers  = data?.answers  || [];

  return (
    <div style={{ padding: '28px 32px', minHeight: '100%' }}>
      <div className="animate-fade-up" style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 26, color: 'var(--text)', lineHeight: 1.1, marginBottom: 4 }}>
          Search Documents
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: 13 }}>
          Powered by Azure AI Search — full-text, semantic ranking, and faceted filters
        </p>
      </div>

      {/* Search input */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', pointerEvents: 'none' }}>
            <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          </span>
          <input ref={inputRef} value={query} onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && submit()}
            placeholder="Search by keyword, phrase, author, tag…"
            style={{ width: '100%', padding: '12px 14px 12px 42px', borderRadius: 11,
              background: 'var(--surface)', border: '1px solid var(--border-hi)',
              color: 'var(--text)', fontSize: 14, outline: 'none',
              boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.04)' }} />
        </div>
        <button onClick={submit} style={{
          padding: '12px 24px', borderRadius: 11, border: 'none', cursor: 'pointer',
          background: 'linear-gradient(135deg, var(--accent), var(--cyan))',
          color: '#fff', fontWeight: 700, fontSize: 13, fontFamily: 'var(--font-display)',
          opacity: isFetching ? 0.7 : 1,
        }}>
          {isFetching ? 'Searching…' : 'Search'}
        </button>
      </div>

      {/* Filters row */}
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

      {/* AI Answers */}
      {answers.length > 0 && (
        <div style={{ padding: '16px 18px', borderRadius: 10, background: 'rgba(0,107,69,0.05)', border: '1px solid rgba(0,107,69,0.2)', marginBottom: 20 }}>
          <div style={{ fontSize: 10, color: 'var(--accent-hi)', fontWeight: 700, letterSpacing: '0.1em', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', marginBottom: 8 }}>Azure AI Extracted Answer</div>
          {answers.map((a, i) => (
            <p key={i} style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: a.text }} />
          ))}
        </div>
      )}

      {/* Facets */}
      {submitted && Object.keys(facets).length > 0 && (
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
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--muted)' }}>
          <div style={{ fontSize: 48, opacity: 0.15, marginBottom: 14, lineHeight: 1 }}>⊚</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: '#4b5563' }}>Start searching</div>
          <div style={{ fontSize: 13, marginTop: 6 }}>Full-text search across all document content, metadata, and tags</div>
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

      {selectedDoc && <DocumentDrawer doc={selectedDoc} onClose={() => setSelected(null)} />}
    </div>
  );
}

const dateInput = {
  padding: '7px 11px', borderRadius: 8, border: '1px solid var(--border)',
  background: 'var(--surface)', fontSize: 12, fontWeight: 600, cursor: 'pointer',
  outline: 'none', fontFamily: 'inherit',
};
