import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import Login from './pages/Login';
import Home from './pages/Home';
import Game from './pages/Game';
import Wallet from './pages/Wallet';
import Admin from './pages/Admin';

function MainLayout() {
  const { user, logout } = useAuth();
  const [screen, setScreen] = useState('home');
  const [refresh, setRefresh] = useState(0);

  if (!user) return <Navigate to="/login" />;
  if (user?.isAdmin && screen === 'admin') return <Admin />;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header onDeposit={() => setScreen('wallet')} onRefresh={() => setRefresh(r => r + 1)} />
      <main style={{ flex: 1, overflowY: 'auto' }}>
        {screen === 'home' && <Home />}
        {screen === 'wallet' && <Wallet key={refresh} />}
        {screen === 'leaderboard' && <div style={{padding:40,color:'var(--text-muted)',textAlign:'center'}}>Leaderboard coming soon</div>}
        {screen === 'contact' && <div style={{padding:40,color:'var(--text-muted)',textAlign:'center'}}>Contact: @BingoSupport</div>}
      </main>
      <BottomNav active={screen} onNavigate={setScreen} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/game" element={<Game />} />
          <Route path="/*" element={<MainLayout />} />
        </Routes>
        <Toaster position="top-center" toastOptions={{
          style: { background: '#2d1b4e', color: '#fff', border: '2px solid #f4c430' }
        }} />
      </BrowserRouter>
    </AuthProvider>
  );
}
