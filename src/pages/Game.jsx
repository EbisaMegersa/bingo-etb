import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import BingoCard from '../components/BingoCard';
import toast from 'react-hot-toast';

export default function Game() {
  const navigate = useNavigate();
  const [gameId, setGameId] = useState(null);
  const [card, setCard] = useState(null);
  const [calledNumbers, setCalledNumbers] = useState([]);
  const [markedCells, setMarkedCells] = useState([]);
  const [currentBall, setCurrentBall] = useState('?');
  const [autoPlay, setAutoPlay] = useState(false);
  const [balance, setBalance] = useState(0);
  const [timer, setTimer] = useState(5);
  const [loading, setLoading] = useState(false);

  useEffect(() => { startNewGame(); }, []);

  const startNewGame = async () => {
    try {
      setLoading(true);
      const { data } = await api.post('/game/start');
      setGameId(data.gameId);
      setCard(data.card);
      setCalledNumbers([]);
      setMarkedCells([]);
      setCurrentBall('?');
      setBalance(data.balance);
      toast.success('Game started! ETB 5 deducted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to start game');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const callNumber = useCallback(async () => {
    if (!gameId) return;
    try {
      const { data } = await api.post(`/game/${gameId}/call`);
      setCalledNumbers(prev => [...prev, data.number]);
      setCurrentBall(`${data.letter}${data.number}`);
      for (let c = 0; c < 5; c++) {
        for (let r = 0; r < 5; r++) {
          if (card?.[c]?.[r] === data.number) {
            setMarkedCells(prev => [...new Set([...prev, `${c}-${r}`])]);
          }
        }
      }
    } catch (err) { console.error(err); }
  }, [gameId, card]);

  useEffect(() => {
    let interval;
    if (autoPlay) interval = setInterval(callNumber, 2000);
    return () => clearInterval(interval);
  }, [autoPlay, callNumber]);

  useEffect(() => {
    const t = setInterval(() => setTimer(prev => prev <= 0 ? 5 : prev - 1), 1000);
    return () => clearInterval(t);
  }, []);

  const handleCellClick = async (col, row) => {
    const val = card[col][row];
    if (val === 0 || val === 'FREE') return;
    if (!calledNumbers.includes(val)) {
      toast.error(`Number ${val} not called yet!`);
      return;
    }
    try {
      const { data } = await api.post(`/game/${gameId}/mark`, { col, row });
      setMarkedCells(data.markedCells);
    } catch (err) {
      toast.error('Error marking cell');
    }
  };

  const checkBingo = async () => {
    try {
      const { data } = await api.post(`/game/${gameId}/bingo`);
      if (data.bingo) {
        toast.success(`🎉 BINGO! You won ETB ${data.winAmount}!`);
        setBalance(data.balance);
        setTimeout(() => navigate('/'), 2000);
      } else {
        toast.error('No BINGO yet! Keep playing!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error');
    }
  };

  return (
    <div style={{ padding: '16px', paddingBottom: '100px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{
          width: '70px', height: '70px', background: 'linear-gradient(135deg, #e53e3e, #c53030)',
          borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '24px', fontWeight: 900, color: 'white', boxShadow: '0 6px 20px rgba(229,62,62,0.4)'
        }}>{currentBall}</div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Next Call</div>
          <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--accent)' }}>{timer}s</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Bet: ETB 5</div>
        </div>
      </div>

      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>Called Numbers:</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px', maxHeight: '80px', overflowY: 'auto' }}>
        {calledNumbers.slice(-15).map((n, i) => (
          <div key={n} style={{
            width: '36px', height: '36px', background: i === calledNumbers.slice(-15).length - 1 ? 'var(--accent)' : 'var(--bg-light)',
            borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '13px', fontWeight: 700, border: `1px solid ${i === calledNumbers.slice(-15).length - 1 ? 'var(--accent)' : '#4d3b6e'}`,
            color: i === calledNumbers.slice(-15).length - 1 ? '#1a0b2e' : 'var(--text)'
          }}>{n}</div>
        ))}
      </div>

      {card && <BingoCard card={card} calledNumbers={calledNumbers} markedCells={markedCells} onCellClick={handleCellClick} />}

      <div style={{ display: 'flex', gap: '10px' }}>
        <button onClick={callNumber} disabled={loading} style={{ flex: 1, padding: '14px', borderRadius: '12px', border: 'none', fontWeight: 700, fontSize: '15px', background: 'linear-gradient(135deg, #e53e3e, #c53030)', color: 'white', cursor: 'pointer' }}>📢 Call Now</button>
        <button onClick={checkBingo} style={{ flex: 1, padding: '14px', borderRadius: '12px', border: 'none', fontWeight: 700, fontSize: '15px', background: 'linear-gradient(135deg, #48bb78, #38a169)', color: 'white', cursor: 'pointer' }}>🎉 BINGO!</button>
        <button onClick={() => setAutoPlay(!autoPlay)} style={{ flex: 1, padding: '14px', borderRadius: '12px', border: '2px solid var(--accent)', background: 'var(--bg-light)', color: 'var(--text)', fontWeight: 700, cursor: 'pointer' }}>Auto: {autoPlay ? 'ON' : 'OFF'}</button>
      </div>
    </div>
  );
}
