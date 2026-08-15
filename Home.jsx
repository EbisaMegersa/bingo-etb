import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: '16px', paddingBottom: '100px' }}>
      <div style={{
        background: 'linear-gradient(135deg, #3d2b5e 0%, #2d1b4e 100%)', borderRadius: '24px',
        padding: '40px 24px', textAlign: 'center', marginBottom: '20px', border: '1px solid #4d3b6e',
        position: 'relative', overflow: 'hidden'
      }}>
        <div style={{
          width: '100px', height: '100px', background: 'linear-gradient(135deg, #4a5568, #2d3748)',
          borderRadius: '50%', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 10px 30px rgba(0,0,0,0.4)', fontSize: '48px', fontWeight: 900, color: 'white'
        }}>
          <div style={{ width: '50px', height: '50px', background: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1a0b2e', fontSize: '28px' }}>B</div>
        </div>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--accent)', marginBottom: '8px', textShadow: '0 2px 10px rgba(244,196,48,0.3)' }}>ቢንጎ ጨዋታ</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '28px' }}>አሸናፊውን ይሆኑ! ቁጥሮችን ይከተሉ!</p>
        <button onClick={() => navigate('/game')} style={{
          width: '100%', maxWidth: '220px', padding: '16px 32px',
          background: 'linear-gradient(135deg, #f4c430, #e0b020)', color: '#1a0b2e',
          border: 'none', borderRadius: '50px', fontSize: '20px', fontWeight: 800,
          cursor: 'pointer', boxShadow: '0 8px 25px rgba(244,196,48,0.3)'
        }}>▶ Play</button>
      </div>

      <div style={{ background: 'var(--bg-card)', borderRadius: '16px', padding: '20px', border: '1px solid #3d2b5e' }}>
        <h3 style={{ color: 'var(--accent)', marginBottom: '12px', fontSize: '18px' }}>እንዴት መጫወት ይቻላል?</h3>
        {['Play ይጫኑ', 'የሚጠሩ ቁጥሮችን ይከተሉ', 'በካርድዎ ላይ ያሉ ቁጥሮችን ይምረጡ', '5 ተከታታይ ቁጥሮች ሲያገኙ BINGO ይበሉ!'].map((step, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', color: 'var(--text-muted)', fontSize: '14px' }}>
            <span style={{ color: 'var(--accent)', fontWeight: 800 }}>{i + 1}.</span>{step}
          </div>
        ))}
      </div>
    </div>
  );
}
