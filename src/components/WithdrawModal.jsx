import { useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function WithdrawModal({ onClose, onSuccess, maxBalance }) {
  const [amount, setAmount] = useState('');
  const [phone, setPhone] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!amount || amount < 10) return toast.error('Minimum withdrawal ETB 10');
    if (amount > maxBalance) return toast.error('Insufficient balance');
    if (!phone.trim() || phone.length < 9) return toast.error('Enter valid phone number');

    setLoading(true);
    try {
      const { data } = await api.post('/payments/withdraw', {
        amount: parseFloat(amount),
        withdrawPhone: phone,
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
        border: '2px solid #ed8936'
      }}>
        <h2 style={{ color: '#ed8936', marginBottom: '8px', fontSize: '22px' }}>💸 Withdraw</h2>

        <div style={{ background: 'var(--bg-light)', padding: '12px', borderRadius: '12px', marginBottom: '16px', fontSize: '13px', color: 'var(--text-muted)' }}>
          <strong style={{ color: '#ed8936' }}>Steps:</strong><br/>
          1. Enter amount and your Telebirr phone<br/>
          2. Admin will send money to your phone<br/>
          3. Usually processed within 1 hour
        </div>

        <input type="number" placeholder={`Amount (ETB) - Max: ${maxBalance}`} value={amount} onChange={e => setAmount(e.target.value)}
          style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '2px solid #3d2b5e', background: 'var(--bg-light)', color: 'white', fontSize: '16px', marginBottom: '12px' }}
        />
        <input type="tel" placeholder="Your Telebirr Phone Number" value={phone} onChange={e => setPhone(e.target.value)}
          style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '2px solid #3d2b5e', background: 'var(--bg-light)', color: 'white', fontSize: '16px', marginBottom: '12px' }}
        />
        <input type="text" placeholder="Note (optional)" value={note} onChange={e => setNote(e.target.value)}
          style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '2px solid #3d2b5e', background: 'var(--bg-light)', color: 'white', fontSize: '16px', marginBottom: '16px' }}
        />

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={onClose} style={{ flex: 1, padding: '14px', borderRadius: '12px', border: 'none', fontWeight: 700, background: 'var(--bg-light)', color: 'var(--text)', cursor: 'pointer' }}>Cancel</button>
          <button onClick={handleSubmit} disabled={loading} style={{ flex: 1, padding: '14px', borderRadius: '12px', border: 'none', fontWeight: 700, background: 'linear-gradient(135deg, #ed8936, #dd6b20)', color: 'white', cursor: 'pointer', opacity: loading ? 0.6 : 1 }}>{loading ? 'Submitting...' : 'Request'}</button>
        </div>
      </div>
    </div>
  );
}
