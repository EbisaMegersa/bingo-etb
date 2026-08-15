import { useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function DepositModal({ onClose, onSuccess }) {
  const [amount, setAmount] = useState('');
  const [txNumber, setTxNumber] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!amount || amount < 10) return toast.error('Minimum deposit ETB 10');
    if (!txNumber.trim()) return toast.error('Enter Telebirr transaction number');

    setLoading(true);
    try {
      const { data } = await api.post('/payments/deposit', {
        amount: parseFloat(amount),
        playerTxNumber: txNumber,
        playerNote: note
      });
      toast.success(data.message);
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 200, padding: '20px'
    }}>
      <div style={{
        background: 'var(--bg-card)', borderRadius: '24px', padding: '28px', width: '100%', maxWidth: '360px',
        border: '2px solid var(--accent)'
      }}>
        <h2 style={{ color: 'var(--accent)', marginBottom: '8px', fontSize: '22px' }}>💰 Deposit</h2>

        <div style={{ background: 'var(--bg-light)', padding: '12px', borderRadius: '12px', marginBottom: '16px', fontSize: '13px', color: 'var(--text-muted)' }}>
          <strong style={{ color: 'var(--accent)' }}>Steps:</strong><br/>
          1. Send money via Telebirr to: <strong style={{color:'var(--text)'}}>0965041641</strong> (Sisay)<br/>
          2. Enter the transaction number below<br/>
          3. Admin will verify and add balance
        </div>

        <input type="number" placeholder="Amount (ETB)" value={amount} onChange={e => setAmount(e.target.value)}
          style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '2px solid #3d2b5e', background: 'var(--bg-light)', color: 'white', fontSize: '16px', marginBottom: '12px' }}
        />
        <input type="text" placeholder="Telebirr Transaction Number" value={txNumber} onChange={e => setTxNumber(e.target.value)}
          style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '2px solid #3d2b5e', background: 'var(--bg-light)', color: 'white', fontSize: '16px', marginBottom: '12px' }}
        />
        <input type="text" placeholder="Note (optional)" value={note} onChange={e => setNote(e.target.value)}
          style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '2px solid #3d2b5e', background: 'var(--bg-light)', color: 'white', fontSize: '16px', marginBottom: '16px' }}
        />

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={onClose} style={{ flex: 1, padding: '14px', borderRadius: '12px', border: 'none', fontWeight: 700, background: 'var(--bg-light)', color: 'var(--text)', cursor: 'pointer' }}>Cancel</button>
          <button onClick={handleSubmit} disabled={loading} style={{ flex: 1, padding: '14px', borderRadius: '12px', border: 'none', fontWeight: 700, background: 'var(--accent)', color: '#1a0b2e', cursor: 'pointer', opacity: loading ? 0.6 : 1 }}>{loading ? 'Submitting...' : 'Submit'}</button>
        </div>
      </div>
    </div>
  );
}
