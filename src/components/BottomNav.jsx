import { Home, Wallet, MessageCircle, User, Gift, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function BottomNav({ active, onNavigate }) {
  const { user } = useAuth();

  const items = [
    { id: 'home', icon: Home, label: 'HOME' },
    { id: 'wallet', icon: Wallet, label: 'WALLET' },
    { id: 'gift', icon: Gift, label: '', isGift: true },
    { id: 'contact', icon: MessageCircle, label: 'CONTACT' },
    { id: user?.isAdmin ? 'admin' : 'leaderboard', icon: user?.isAdmin ? Shield : User, label: user?.isAdmin ? 'ADMIN' : 'LEADERBOARD' },
  ];

  return (
    <nav style={{
      display: 'flex', justifyContent: 'space-around', alignItems: 'center',
      padding: '8px 0 20px', background: 'linear-gradient(0deg, #1a0b2e 0%, #2d1b4e 100%)',
      borderTop: '1px solid #3d2b5e', position: 'fixed', bottom: 0, left: 0, right: 0,
      maxWidth: '480px', margin: '0 auto', zIndex: 100
    }}>
      {items.map(item => (
        <div key={item.id} onClick={() => !item.isGift && onNavigate(item.id)}
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
            cursor: 'pointer', padding: '6px 12px', borderRadius: '12px',
            color: active === item.id ? 'var(--accent)' : 'var(--text-muted)',
            ...(item.isGift ? {
              background: 'linear-gradient(135deg, #f4c430, #e0b020)', color: '#1a0b2e',
              width: '56px', height: '56px', borderRadius: '50%', marginTop: '-20px',
              border: '4px solid #1a0b2e', justifyContent: 'center', boxShadow: '0 4px 15px rgba(244,196,48,0.4)'
            } : {})
          }}>
          <item.icon size={item.isGift ? 26 : 22} />
          {!item.isGift && <span style={{ fontSize: '10px', fontWeight: 600 }}>{item.label}</span>}
        </div>
      ))}
    </nav>
  );
}
