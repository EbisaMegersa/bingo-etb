const LETTERS = ['B', 'I', 'N', 'G', 'O'];

export default function BingoCard({ card, calledNumbers, markedCells, onCellClick }) {
  if (!card) return null;

  return (
    <div style={{
      background: 'var(--bg-card)', borderRadius: '16px', padding: '16px',
      marginBottom: '16px', border: '2px solid #4d3b6e'
    }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', marginBottom: '12px' }}>
        {LETTERS.map(l => (
          <div key={l} style={{ textAlign: 'center', fontSize: '20px', fontWeight: 800, color: 'var(--accent)' }}>{l}</div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
        {[0,1,2,3,4].map(row => (
          [0,1,2,3,4].map(col => {
            const val = card[col]?.[row];
            const isFree = val === 0 || val === 'FREE';
            const isCalled = calledNumbers?.includes(val) && !isFree;
            const isMarked = markedCells?.includes(`${col}-${row}`);
            const cellId = `${col}-${row}`;

            return (
              <div key={cellId} onClick={() => onCellClick(col, row)}
                style={{
                  aspectRatio: '1', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '16px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', border: '2px solid transparent',
                  background: isMarked ? 'linear-gradient(135deg, #48bb78, #38a169)' : 
                              isCalled ? 'linear-gradient(135deg, #f4c430, #e0b020)' : 'var(--bg-light)',
                  color: isMarked || isCalled ? '#1a0b2e' : 'var(--text)',
                  borderColor: isMarked ? '#68d391' : 'transparent',
                  boxShadow: isMarked ? '0 4px 12px rgba(72,187,120,0.3)' : isCalled ? '0 4px 12px rgba(244,196,48,0.3)' : 'none'
                }}>
                {isFree ? 'FREE' : val}
              </div>
            );
          })
        ))}
      </div>
    </div>
  );
}
