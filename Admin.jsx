import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function Admin() {
  const [stats, setStats] = useState(null);
  const [pending, setPending] = useState([]);
  const [allTx, setAllTx] = useState([]);
  const [tab, setTab] = useState('pending');
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [statsRes, pendingRes, allRes] = await Promise.all([
        api.get('/payments/admin/stats'),
        api.get('/payments/admin/pending'),
        api.get('/payments/admin/all')
      ]);
      setStats(statsRes.data);
      setPending(pendingRes.data);
      setAllTx(allRes.data.transactions);
    } catch (err) {
      toast.error('Admin data failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleVerify = async (txId, action, type) => {
    try {
      const endpoint = type === 'deposit' ? 'verify-deposit' : 'verify-withdraw';
      await api.post(`/payments/admin/${endpoint}/${txId}`, { action, adminNote: 'Verified via admin panel' });
      toast.success(`${action === 'approve' ? 'Approved' : 'Rejected'} successfully`);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  if (loading) return <div style={{padding:40, textAlign:'center', color:'var(--text-muted)'}}>Loading admin...</div>;

  return (
    <div style={{ padding: '16px', paddingBottom: '100px' }}>
      <h2 style={{ color: 'var(--accent)', marginBottom: '16px', fontSize: '24px' }}>🔧 Admin Panel</h2>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
        {[
          { label: 'Total Users', value: stats?.totalUsers },
          { label: 'Total Games', value: stats?.totalGames },
          { label: 'Pending Deposits', value: stats?.pendingDeposits, color: '#ed8936' },
          { label: 'Pending Withdraws', value: stats?.pendingWithdrawals, color: 'var(--danger)' },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--bg-card)', padding: '16px', borderRadius: '12px', border: '1px solid #3d2b5e', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 800, color: s.color || 'var(--accent)' }}>{s.value}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        {['pending', 'all'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '10px 20px', borderRadius: '10px', border: 'none', fontWeight: 700,
            background: tab === t ? 'var(--accent)' : 'var(--bg-light)', color: tab === t ? '#1a0b2e' : 'var(--text)',
            cursor: 'pointer'
          }}>{t === 'pending' ? 'Pending Requests' : 'All Transactions'}</button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {(tab === 'pending' ? pending : allTx).map(tx => (
          <div key={tx._id} style={{
            background: 'var(--bg-card)', padding: '16px', borderRadius: '14px',
            border: '1px solid #3d2b5e'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontWeight: 700, color: tx.type === 'deposit' ? 'var(--success)' : 'var(--danger)' }}>
                {tx.type.toUpperCase()}: ETB {Math.abs(tx.amount).toFixed(2)}
              </span>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{tx.status}</span>
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px' }}>
              User: {tx.userId?.name} ({tx.userId?.phone})
            </div>
            {tx.playerTxNumber && (
              <div style={{ fontSize: '13px', color: 'var(--accent)', marginBottom: '4px' }}>
                Tx Number: {tx.playerTxNumber}
              </div>
            )}
            {tx.withdrawPhone && (
              <div style={{ fontSize: '13px', color: 'var(--accent)', marginBottom: '4px' }}>
                Withdraw To: {tx.withdrawPhone}
              </div>
            )}
            {tx.playerNote && (
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                Note: {tx.playerNote}
              </div>
            )}
            {tx.status === 'pending_verification' && (
              <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                <button onClick={() => handleVerify(tx._id, 'approve', tx.type)} style={{
                  flex: 1, padding: '10px', borderRadius: '8px', border: 'none',
                  background: 'linear-gradient(135deg, #48bb78, #38a169)', color: 'white', fontWeight: 700, cursor: 'pointer'
                }}>✅ Approve</button>
                <button onClick={() => handleVerify(tx._id, 'reject', tx.type)} style={{
                  flex: 1, padding: '10px', borderRadius: '8px', border: 'none',
                  background: 'linear-gradient(135deg, #e53e3e, #c53030)', color: 'white', fontWeight: 700, cursor: 'pointer'
                }}>❌ Reject</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
