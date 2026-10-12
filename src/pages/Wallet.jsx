import { useState, useEffect } from 'react';
import api from '../services/api';
import DepositModal from '../components/DepositModal';
import WithdrawModal from '../components/WithdrawModal';
import toast from 'react-hot-toast';

export default function Wallet() {
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState(null);
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [txRes, statsRes] = await Promise.all([
        api.get('/wallet/transactions'),
        api.get('/wallet/stats')
      ]);
      setTransactions(txRes.data);
      setStats(statsRes.data);
    } catch (err) {
      toast.error('Failed to load wallet');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const getStatusColor = (status) => {
    if (status === 'completed') return 'var(--success)';
    if (status === 'pending_verification') return '#ed8936';
    if (status === 'rejected') return 'var(--danger)';
    return 'var(--text-muted)';
  };

  return (
    <div style={{ padding: '16px', paddingBottom: '100px' }}>
      <div style={{
        background: 'linear-gradient(135deg, #3d2b5e, #2d1b4e)', borderRadius: '20px',
        padding: '30px', textAlign: 'center', marginBottom: '20px', border: '2px solid var(--accent)'
      }}>
        <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Available Balance</div>
        <div style={{ fontSize: '42px', fontWeight: 900, color: 'var(--accent)', margin: '10px 0' }}>ETB {stats?.balance?.toFixed(2) || '0.00'}</div>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          Total Won: ETB {stats?.totalEarnings?.toFixed(2) || '0.00'} | Games: {stats?.totalGames || 0}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
        <button onClick={() => setShowDeposit(true)} style={{
          padding: '16px', borderRadius: '14px', border: 'none', fontWeight: 700, fontSize: '15px',
          background: 'linear-gradient(135deg, #48bb78, #38a169)', color: 'white', cursor: 'pointer'
        }}>+ Deposit</button>
        <button onClick={() => setShowWithdraw(true)} style={{
          padding: '16px', borderRadius: '14px', border: 'none', fontWeight: 700, fontSize: '15px',
          background: 'linear-gradient(135deg, #ed8936, #dd6b20)', color: 'white', cursor: 'pointer'
        }}>- Withdraw</button>
      </div>

      <div style={{ background: 'var(--bg-card)', borderRadius: '16px', padding: '16px' }}>
        <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--accent)', marginBottom: '12px' }}>Recent Transactions</div>
        {loading ? <p style={{color:'var(--text-muted)'}}>Loading...</p> : transactions.map(tx => (
          <div key={tx._id} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '12px 0', borderBottom: '1px solid #3d2b5e'
          }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 600 }}>{tx.type.replace('_', ' ').toUpperCase()}</div>
              <div style={{ fontSize: '11px', color: getStatusColor(tx.status) }}>{tx.status}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{new Date(tx.createdAt).toLocaleString()}</div>
            </div>
            <div style={{
              fontWeight: 700, fontSize: '15px',
              color: tx.amount > 0 ? 'var(--success)' : 'var(--danger)'
            }}>{tx.amount > 0 ? '+' : ''}{tx.amount.toFixed(2)} ETB</div>
          </div>
        ))}
      </div>

      {showDeposit && <DepositModal onClose={() => setShowDeposit(false)} onSuccess={fetchData} />}
      {showWithdraw && <WithdrawModal onClose={() => setShowWithdraw(false)} onSuccess={fetchData} maxBalance={stats?.balance || 0} />}
    </div>
  );
}
