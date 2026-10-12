import { useAuth } from '../context/AuthContext';
import { Menu, RefreshCw } from 'lucide-react';

export default function Header({ onDeposit, onRefresh }) {
  const { user } = useAuth();

  return (
    <header style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '12px 16px', background: 'linear-gradient(180deg, #2d1b4e 0%, #1a0b2e 100%)',
      borderBottom: '1px solid #3d2b5e', position: 'sticky', top: 0, zIndex: 50
    }}>
      <div style={{ cursor: 'pointer', color: 'var(--accent)' }}>
        <Menu size={24} />
      </div>
      <button onClick={onDeposit} style={{
        padding: '8px 16px', borderRadius: '20px', border: '2px solid var(--accent)',
        background: 'transparent', color: 'var(--accent)', fontWeight: 600, cursor: 'pointer', fontSize: '13px'
      }}>+ Deposit</button>
      <button onClick={onRefresh} style={{
        padding: '8px 16px', borderRadius: '20px', border: 'none',
        background: 'var(--accent)', color: '#1a0b2e', fontWeight: 600, cursor: 'pointer', fontSize: '13px'
      }}><RefreshCw size={14} style={{display:'inline', marginRight:4}}/> Refresh</button>
      <div style={{
        background: 'linear-gradient(135deg, #f4c430, #e0b020)', color: '#1a0b2e',
        padding: '8px 16px', borderRadius: '20px', fontWeight: 700, fontSize: '14px'
      }}>💰 ETB {user?.balance?.toFixed(2) || '0.00'}</div>
    </header>
  );
}
