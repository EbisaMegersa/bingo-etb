import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isRegister) {
        await register(name, phone, password);
        toast.success('Registered!');
      } else {
        await login(phone, password);
        toast.success('Welcome back!');
      }
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
    }}>
      <div style={{
        background: 'var(--bg-card)', padding: '32px', borderRadius: '24px', width: '100%', maxWidth: '360px',
        border: '2px solid #4d3b6e'
      }}>
        <h2 style={{ color: 'var(--accent)', textAlign: 'center', marginBottom: '24px', fontSize: '26px' }}>
          {isRegister ? 'Create Account' : 'ቢንጎ ጨዋታ'}
        </h2>

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <input type="text" placeholder="Your Name" required value={name} onChange={e => setName(e.target.value)}
              style={{ width: '100%', padding: '14px', marginBottom: '12px', borderRadius: '12px', border: '2px solid #3d2b5e', background: 'var(--bg-light)', color: 'white', fontSize: '16px' }}
            />
          )}
          <input type="tel" placeholder="Phone Number" required value={phone} onChange={e => setPhone(e.target.value)}
            style={{ width: '100%', padding: '14px', marginBottom: '12px', borderRadius: '12px', border: '2px solid #3d2b5e', background: 'var(--bg-light)', color: 'white', fontSize: '16px' }}
          />
          <input type="password" placeholder="Password" required value={password} onChange={e => setPassword(e.target.value)}
            style={{ width: '100%', padding: '14px', marginBottom: '20px', borderRadius: '12px', border: '2px solid #3d2b5e', background: 'var(--bg-light)', color: 'white', fontSize: '16px' }}
          />
          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '16px', borderRadius: '12px', border: 'none',
            background: 'linear-gradient(135deg, #f4c430, #e0b020)', color: '#1a0b2e',
            fontWeight: 800, fontSize: '16px', cursor: 'pointer', marginBottom: '16px'
          }}>{loading ? 'Please wait...' : (isRegister ? 'Register' : 'Login')}</button>
        </form>

        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
          {isRegister ? 'Already have account?' : 'New here?'}{' '}
          <span onClick={() => setIsRegister(!isRegister)} style={{ color: 'var(--accent)', cursor: 'pointer', fontWeight: 700 }}>
            {isRegister ? 'Login' : 'Register'}
          </span>
        </p>
      </div>
    </div>
  );
}
