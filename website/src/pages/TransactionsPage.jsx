import React, { useState, useEffect } from 'react';
import api from '../services/api';

const CATEGORIES = ['all', 'transfer', 'payment', 'topup', 'roundup', 'investment', 'other'];

const CATEGORY_META = {
  transfer:    { icon:'↔️', color:'#3B82F6', bg:'#DBEAFE' },
  payment:     { icon:'💳', color:'#F4A261', bg:'#FEF3C7' },
  topup:       { icon:'⬆️', color:'#10B981', bg:'#D1FAE5' },
  roundup:     { icon:'🔄', color:'#00D4A1', bg:'#D1FAE5' },
  investment:  { icon:'📈', color:'#A855F7', bg:'#EDE9FE' },
  other:       { icon:'📋', color:'#64748B', bg:'#F1F5F9' },
};

function TxRow({ tx }) {
  const isCredit = tx.type === 'credit';
  const meta = CATEGORY_META[tx.category] || CATEGORY_META.other;

  return (
    <tr style={{ borderBottom:'1px solid #F5F7FA' }}
      onMouseEnter={e => e.currentTarget.style.background='#FAFBFC'}
      onMouseLeave={e => e.currentTarget.style.background='transparent'}>
      <td style={{ padding:'15px 16px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ width:42, height:42, borderRadius:13, background: isCredit ? '#D1FAE5' : '#FEE2E2', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>
            {isCredit ? '📥' : '📤'}
          </div>
          <div>
            <p style={{ fontWeight:700, fontSize:14, color:'#0A1628', marginBottom:2 }}>{tx.title || tx.description}</p>
            <p style={{ fontSize:12, color:'#94A3B8' }}>{tx.subtitle || tx.description || '—'}</p>
          </div>
        </div>
      </td>
      <td style={{ padding:'15px 16px' }}>
        <span style={{ display:'inline-flex', alignItems:'center', gap:5, background:meta.bg, color:meta.color, padding:'4px 10px', borderRadius:20, fontSize:12, fontWeight:700 }}>
          <span>{meta.icon}</span>
          <span style={{ textTransform:'capitalize' }}>{tx.category || 'other'}</span>
        </span>
      </td>
      <td style={{ padding:'15px 16px', fontSize:13, color:'#64748B' }}>
        {new Date(tx.createdAt).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' })}
      </td>
      <td style={{ padding:'15px 16px', fontSize:13, color:'#64748B' }}>
        {new Date(tx.createdAt).toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit' })}
      </td>
      <td style={{ padding:'15px 16px', textAlign:'right' }}>
        <p style={{ fontWeight:800, fontSize:15, color: isCredit ? '#10B981' : '#0A1628' }}>
          {isCredit ? '+' : '-'}£{Number(tx.amount ?? 0).toFixed(2)}
        </p>
        <p style={{ fontSize:11, color: isCredit ? '#10B981' : '#EF4444', fontWeight:600 }}>
          {tx.type}
        </p>
      </td>
    </tr>
  );
}

function ExportModal({ transactions, onClose }) {
  const handleExportCSV = () => {
    const headers = ['Date', 'Title', 'Category', 'Type', 'Amount'];
    const rows = transactions.map(tx => [
      new Date(tx.createdAt).toLocaleDateString('en-GB'),
      `"${(tx.title || tx.description || '').replace(/"/g, '""')}"`,
      tx.category || 'other',
      tx.type,
      tx.type === 'credit' ? `+${tx.amount}` : `-${tx.amount}`,
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type:'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'haym-transactions.csv'; a.click();
    URL.revokeObjectURL(url);
    onClose();
  };

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.5)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
      <div style={{ background:'#fff', borderRadius:24, padding:32, width:'100%', maxWidth:380 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
          <h2 style={{ fontSize:20, fontWeight:900, color:'#0A1628' }}>Export Transactions</h2>
          <button onClick={onClose} style={{ background:'#F5F7FA', border:'none', width:36, height:36, borderRadius:10, cursor:'pointer', fontSize:18, color:'#64748B' }}>✕</button>
        </div>
        <p style={{ color:'#64748B', fontSize:14, marginBottom:24 }}>
          Export {transactions.length} transaction{transactions.length !== 1 ? 's' : ''} to a CSV file.
        </p>
        <button onClick={handleExportCSV} className="btn btn-primary w-full" style={{ height:50, fontWeight:700, borderRadius:14, marginBottom:10 }}>
          📥 Download CSV
        </button>
        <button onClick={onClose} style={{ width:'100%', height:44, borderRadius:14, background:'#F5F7FA', border:'none', color:'#64748B', fontWeight:600, cursor:'pointer' }}>
          Cancel
        </button>
      </div>
    </div>
  );
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState('');
  const [category,     setCategory]     = useState('all');
  const [typeFilter,   setTypeFilter]   = useState('all');
  const [sortBy,       setSortBy]       = useState('newest');
  const [dateFrom,     setDateFrom]     = useState('');
  const [dateTo,       setDateTo]       = useState('');
  const [minAmt,       setMinAmt]       = useState('');
  const [maxAmt,       setMaxAmt]       = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [page,         setPage]         = useState(1);
  const [showExport,   setShowExport]   = useState(false);

  const PER_PAGE = 15;

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/transactions');
        const txs = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.transactions)
          ? res.data.transactions
          : [];
        setTransactions(txs);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Derived stats
  const totalCredit  = transactions.filter(t => t.type === 'credit').reduce((s,t) => s + Number(t.amount??0), 0);
  const totalDebit   = transactions.filter(t => t.type === 'debit').reduce((s,t)  => s + Number(t.amount??0), 0);
  const thisMonth    = transactions.filter(t => {
    const d = new Date(t.createdAt);
    const n = new Date();
    return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear();
  });

  // Filter + search
  const filtered = transactions
    .filter(tx => {
      const q = search.toLowerCase();
      if (q && !(tx.title||tx.description||'').toLowerCase().includes(q) && !(tx.subtitle||'').toLowerCase().includes(q)) return false;
      if (category !== 'all' && tx.category !== category) return false;
      if (typeFilter !== 'all' && tx.type !== typeFilter) return false;
      if (dateFrom && new Date(tx.createdAt) < new Date(dateFrom)) return false;
      if (dateTo   && new Date(tx.createdAt) > new Date(new Date(dateTo).setHours(23,59,59,999))) return false;
      if (minAmt && Number(tx.amount) < Number(minAmt)) return false;
      if (maxAmt && Number(tx.amount) > Number(maxAmt)) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'newest')  return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === 'oldest')  return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === 'highest') return Number(b.amount) - Number(a.amount);
      if (sortBy === 'lowest')  return Number(a.amount) - Number(b.amount);
      return 0;
    });

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const resetPage = () => setPage(1);

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;

  return (
    <div>
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:28 }}>
        <div>
          <h1 style={{ fontSize:26, fontWeight:900, color:'#0A1628' }}>Transactions</h1>
          <p style={{ color:'#64748B', fontSize:14, marginTop:2 }}>Your full payment and transfer history</p>
        </div>
        <button onClick={() => setShowExport(true)}
          style={{ background:'#F5F7FA', border:'1.5px solid #E2E8F0', color:'#0A1628', padding:'0 18px', height:44, borderRadius:14, fontWeight:700, fontSize:13, cursor:'pointer', display:'flex', alignItems:'center', gap:8 }}>
          📥 Export
        </button>
      </div>

      {/* Summary stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(170px,1fr))', gap:16, marginBottom:28 }}>
        {[
          { icon:'📋', label:'Total',       val: transactions.length,          color:'#3B82F6' },
          { icon:'📅', label:'This Month',  val: thisMonth.length,             color:'#A855F7' },
          { icon:'📥', label:'Total In',    val:`+£${totalCredit.toFixed(2)}`, color:'#10B981' },
          { icon:'📤', label:'Total Out',   val:`-£${totalDebit.toFixed(2)}`,  color:'#EF4444' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div style={{ width:44, height:44, borderRadius:14, background:s.color+'18', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, marginBottom:12 }}>{s.icon}</div>
            <p style={{ fontSize:12, color:'#64748B', fontWeight:500, marginBottom:4 }}>{s.label}</p>
            <p style={{ fontSize:20, fontWeight:900, color: s.label.includes('In') ? '#10B981' : s.label.includes('Out') ? '#EF4444' : '#0A1628' }}>{s.val}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom:24, padding:18 }}>
        <div style={{ display:'flex', flexWrap:'wrap', gap:12, alignItems:'center' }}>
          {/* Search */}
          <div style={{ position:'relative', flex:'1 1 200px' }}>
            <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'#94A3B8', fontSize:16 }}>🔍</span>
            <input type="text" className="form-input" placeholder="Search transactions…"
              value={search} onChange={e => { setSearch(e.target.value); resetPage(); }}
              style={{ paddingLeft:36, margin:0 }} />
          </div>

          {/* Type */}
          <select className="form-input" value={typeFilter} onChange={e => { setTypeFilter(e.target.value); resetPage(); }}
            style={{ flex:'0 1 120px', margin:0 }}>
            <option value="all">All Types</option>
            <option value="credit">Credit</option>
            <option value="debit">Debit</option>
          </select>

          {/* Category */}
          <select className="form-input" value={category} onChange={e => { setCategory(e.target.value); resetPage(); }}
            style={{ flex:'0 1 140px', margin:0 }}>
            {CATEGORIES.map(c => (
              <option key={c} value={c} style={{ textTransform:'capitalize' }}>
                {c === 'all' ? 'All Categories' : c.charAt(0).toUpperCase() + c.slice(1)}
              </option>
            ))}
          </select>

          {/* Sort */}
          <select className="form-input" value={sortBy} onChange={e => { setSortBy(e.target.value); resetPage(); }}
            style={{ flex:'0 1 140px', margin:0 }}>
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="highest">Highest Amount</option>
            <option value="lowest">Lowest Amount</option>
          </select>

          <button
            onClick={() => setShowAdvanced(v => !v)}
            style={{ background: showAdvanced ? '#EDE9FE' : '#F1F5F9', color: showAdvanced ? '#7C3AED' : '#475569', border:'none', padding:'0 16px', height:44, borderRadius:12, fontWeight:700, fontSize:13, cursor:'pointer' }}>
            {showAdvanced ? '▲ Less' : '▼ More Filters'}
          </button>

          {(search || category !== 'all' || typeFilter !== 'all' || dateFrom || dateTo || minAmt || maxAmt) && (
            <button onClick={() => { setSearch(''); setCategory('all'); setTypeFilter('all'); setSortBy('newest'); setDateFrom(''); setDateTo(''); setMinAmt(''); setMaxAmt(''); resetPage(); }}
              style={{ background:'#FEE2E2', color:'#EF4444', border:'none', padding:'0 16px', height:44, borderRadius:12, fontWeight:700, fontSize:13, cursor:'pointer' }}>
              ✕ Clear All
            </button>
          )}
        </div>

        {/* Advanced filters */}
        {showAdvanced && (
          <div style={{ display:'flex', flexWrap:'wrap', gap:12, alignItems:'center', marginTop:14, paddingTop:14, borderTop:'1px solid #F1F5F9' }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, flex:'1 1 280px' }}>
              <span style={{ fontSize:12, fontWeight:700, color:'#94A3B8', whiteSpace:'nowrap' }}>Date from</span>
              <input type="date" className="form-input" value={dateFrom} onChange={e => { setDateFrom(e.target.value); resetPage(); }} style={{ margin:0, flex:1 }} />
              <span style={{ fontSize:12, fontWeight:700, color:'#94A3B8' }}>to</span>
              <input type="date" className="form-input" value={dateTo} onChange={e => { setDateTo(e.target.value); resetPage(); }} style={{ margin:0, flex:1 }} />
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:8, flex:'1 1 220px' }}>
              <span style={{ fontSize:12, fontWeight:700, color:'#94A3B8', whiteSpace:'nowrap' }}>£ min</span>
              <input type="number" className="form-input" placeholder="0" value={minAmt} onChange={e => { setMinAmt(e.target.value); resetPage(); }} style={{ margin:0, flex:1 }} />
              <span style={{ fontSize:12, fontWeight:700, color:'#94A3B8' }}>max</span>
              <input type="number" className="form-input" placeholder="Any" value={maxAmt} onChange={e => { setMaxAmt(e.target.value); resetPage(); }} style={{ margin:0, flex:1 }} />
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="card" style={{ padding:0 }}>
        <div style={{ padding:'20px 20px 0', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <h3 className="section-title">Transaction History</h3>
            <p className="section-subtitle" style={{ marginBottom:16 }}>
              Showing {paginated.length} of {filtered.length} transaction{filtered.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div style={{ textAlign:'center', padding:'60px 0' }}>
            <div style={{ fontSize:48, marginBottom:16 }}>📋</div>
            <p style={{ fontSize:18, fontWeight:700, color:'#0A1628', marginBottom:8 }}>No transactions found</p>
            <p style={{ color:'#64748B', fontSize:14 }}>
              {search || category !== 'all' || typeFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Transactions will appear here once you start using HAY-M'}
            </p>
          </div>
        ) : (
          <>
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead>
                  <tr style={{ borderBottom:'2px solid #F1F5F9', borderTop:'1px solid #F1F5F9' }}>
                    {['Transaction', 'Category', 'Date', 'Time', 'Amount'].map((h, i) => (
                      <th key={h} style={{ textAlign: i === 4 ? 'right' : 'left', padding:'10px 16px', fontSize:11, fontWeight:700, color:'#94A3B8', textTransform:'uppercase', letterSpacing:.5 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((tx, i) => <TxRow key={tx._id ?? i} tx={tx} />)}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display:'flex', justifyContent:'center', alignItems:'center', gap:8, padding:'20px 16px' }}>
                <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}
                  style={{ padding:'8px 16px', borderRadius:10, border:'1.5px solid #E2E8F0', background:'#fff', color: page === 1 ? '#CBD5E1' : '#0A1628', fontWeight:700, cursor: page === 1 ? 'not-allowed' : 'pointer', fontSize:13 }}>
                  ← Prev
                </button>
                {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                  let p;
                  if (totalPages <= 7) {
                    p = i + 1;
                  } else if (page <= 4) {
                    p = i + 1;
                  } else if (page >= totalPages - 3) {
                    p = totalPages - 6 + i;
                  } else {
                    p = page - 3 + i;
                  }
                  return (
                    <button key={p} onClick={() => setPage(p)}
                      style={{ width:36, height:36, borderRadius:10, border:'1.5px solid #E2E8F0',
                        background: page === p ? '#0A1628' : '#fff',
                        color: page === p ? '#fff' : '#0A1628',
                        fontWeight:700, cursor:'pointer', fontSize:13 }}>
                      {p}
                    </button>
                  );
                })}
                <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page === totalPages}
                  style={{ padding:'8px 16px', borderRadius:10, border:'1.5px solid #E2E8F0', background:'#fff', color: page === totalPages ? '#CBD5E1' : '#0A1628', fontWeight:700, cursor: page === totalPages ? 'not-allowed' : 'pointer', fontSize:13 }}>
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {showExport && <ExportModal transactions={filtered} onClose={() => setShowExport(false)} />}
    </div>
  );
}
