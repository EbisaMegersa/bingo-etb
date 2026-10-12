import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface User {
  id: string;
  name: string;
  phone: string;
  password: string;
  balance: number;
  totalEarnings: number;
  totalGames: number;
  isAdmin: boolean;
  token: string;
}

interface Transaction {
  _id: string;
  userId: string;
  type: 'deposit' | 'withdraw' | 'game_bet' | 'game_win';
  amount: number;
  status: 'completed' | 'pending_verification' | 'rejected';
  playerTxNumber?: string;
  withdrawPhone?: string;
  playerNote?: string;
  adminNote?: string;
  createdAt: string;
}

interface GameSession {
  gameId: string;
  userId: string;
  card: (number | string)[][];
  calledNumbers: number[];
  markedCells: string[];
  won: boolean;
}

// In-memory data store
const users: Map<string, User> = new Map();
const tokens: Map<string, string> = new Map(); // token -> userId
const transactions: Transaction[] = [];
const games: Map<string, GameSession> = new Map();

// Helper to generate IDs
let nextId = 100;
const genId = () => `${Date.now()}-${nextId++}`;

// Seed initial users
const adminUser: User = {
  id: 'user-admin-1',
  name: 'Sisay',
  phone: '0965041641',
  password: 'admin123',
  balance: 1000.0,
  totalEarnings: 0,
  totalGames: 0,
  isAdmin: true,
  token: 'token-admin-sisay',
};
users.set(adminUser.id, adminUser);
tokens.set(adminUser.token, adminUser.id);

const demoPlayer: User = {
  id: 'user-player-1',
  name: 'Abebe Kebede',
  phone: '0911223344',
  password: 'pass123',
  balance: 75.0,
  totalEarnings: 50.0,
  totalGames: 3,
  isAdmin: false,
  token: 'token-player-abebe',
};
users.set(demoPlayer.id, demoPlayer);
tokens.set(demoPlayer.token, demoPlayer.id);

// Seed initial demo transactions
transactions.push(
  {
    _id: genId(),
    userId: demoPlayer.id,
    type: 'deposit',
    amount: 50.0,
    status: 'completed',
    playerTxNumber: 'TB-98234710',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    _id: genId(),
    userId: demoPlayer.id,
    type: 'deposit',
    amount: 30.0,
    status: 'pending_verification',
    playerTxNumber: 'TB-99120485',
    playerNote: 'Please approve fast',
    createdAt: new Date(Date.now() - 1800000).toISOString(),
  }
);

// Bingo Card Generator (5x5 matrix: columns B, I, N, G, O)
function generateBingoCard(): (number | string)[][] {
  const getCol = (min: number, max: number): number[] => {
    const nums: number[] = [];
    while (nums.length < 5) {
      const n = Math.floor(Math.random() * (max - min + 1)) + min;
      if (!nums.includes(n)) nums.push(n);
    }
    return nums;
  };

  const card: (number | string)[][] = [
    getCol(1, 15),
    getCol(16, 30),
    getCol(31, 45),
    getCol(46, 60),
    getCol(61, 75),
  ];
  // Center is FREE
  card[2][2] = 0; // or 0 according to client check: val === 0 || val === 'FREE'
  return card;
}

// Check Bingo Win Condition
function checkCardBingo(card: (number | string)[][], marked: Set<string>): boolean {
  // Check Columns
  for (let c = 0; c < 5; c++) {
    let colWin = true;
    for (let r = 0; r < 5; r++) {
      if (!marked.has(`${c}-${r}`) && !(c === 2 && r === 2)) {
        colWin = false;
        break;
      }
    }
    if (colWin) return true;
  }

  // Check Rows
  for (let r = 0; r < 5; r++) {
    let rowWin = true;
    for (let c = 0; c < 5; c++) {
      if (!marked.has(`${c}-${r}`) && !(c === 2 && r === 2)) {
        rowWin = false;
        break;
      }
    }
    if (rowWin) return true;
  }

  // Check Diagonals
  let diag1 = true;
  let diag2 = true;
  for (let i = 0; i < 5; i++) {
    if (!marked.has(`${i}-${i}`) && !(i === 2)) diag1 = false;
    if (!marked.has(`${i}-${4 - i}`) && !(i === 2)) diag2 = false;
  }
  return diag1 || diag2;
}

async function startServer() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  // Auth Middleware
  const requireAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const token = authHeader.split(' ')[1];
    const userId = tokens.get(token);
    if (!userId) {
      return res.status(401).json({ message: 'Session expired' });
    }
    const user = users.get(userId);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    (req as any).user = user;
    next();
  };

  // --- API Routes ---

  // Auth: Register
  app.post('/api/auth/register', (req, res) => {
    const { name, phone, password } = req.body;
    if (!phone || !password) {
      return res.status(400).json({ message: 'Phone and password are required' });
    }
    for (const u of users.values()) {
      if (u.phone === phone) {
        return res.status(400).json({ message: 'Phone number already registered' });
      }
    }

    const isAdmin = phone === (process.env.ADMIN_PHONE || '0965041641');
    const newUser: User = {
      id: genId(),
      name: name || 'Player',
      phone,
      password,
      balance: 50.0, // Welcome bonus of 50 ETB
      totalEarnings: 0,
      totalGames: 0,
      isAdmin,
      token: `token-${genId()}`,
    };
    users.set(newUser.id, newUser);
    tokens.set(newUser.token, newUser.id);

    res.json({
      token: newUser.token,
      _id: newUser.id,
      id: newUser.id,
      name: newUser.name,
      phone: newUser.phone,
      balance: newUser.balance,
      isAdmin: newUser.isAdmin,
    });
  });

  // Auth: Login
  app.post('/api/auth/login', (req, res) => {
    const { phone, password } = req.body;
    if (!phone || !password) {
      return res.status(400).json({ message: 'Phone and password are required' });
    }

    let user: User | undefined;
    for (const u of users.values()) {
      if (u.phone === phone) {
        user = u;
        break;
      }
    }

    // Default admin fallback if requested
    if (!user && phone === (process.env.ADMIN_PHONE || '0965041641')) {
      user = adminUser;
    }

    if (!user || user.password !== password) {
      return res.status(400).json({ message: 'Invalid phone or password' });
    }

    // Generate or return token
    if (!user.token) {
      user.token = `token-${genId()}`;
      tokens.set(user.token, user.id);
    }

    res.json({
      token: user.token,
      _id: user.id,
      id: user.id,
      name: user.name,
      phone: user.phone,
      balance: user.balance,
      isAdmin: user.isAdmin,
    });
  });

  // Auth: Me
  app.get('/api/auth/me', requireAuth, (req, res) => {
    const user: User = (req as any).user;
    res.json({
      _id: user.id,
      id: user.id,
      name: user.name,
      phone: user.phone,
      balance: user.balance,
      isAdmin: user.isAdmin,
    });
  });

  // Game: Start
  app.post('/api/game/start', requireAuth, (req, res) => {
    const user: User = (req as any).user;
    if (user.balance < 5) {
      return res.status(400).json({ message: 'Insufficient balance! You need ETB 5 to play.' });
    }

    user.balance -= 5;
    user.totalGames = (user.totalGames || 0) + 1;

    transactions.push({
      _id: genId(),
      userId: user.id,
      type: 'game_bet',
      amount: -5.0,
      status: 'completed',
      createdAt: new Date().toISOString(),
    });

    const card = generateBingoCard();
    const gameId = genId();
    const game: GameSession = {
      gameId,
      userId: user.id,
      card,
      calledNumbers: [],
      markedCells: ['2-2'],
      won: false,
    };
    games.set(gameId, game);

    res.json({
      gameId,
      card,
      balance: user.balance,
    });
  });

  // Game: Call Number
  app.post('/api/game/:gameId/call', requireAuth, (req, res) => {
    const { gameId } = req.params;
    const game = games.get(gameId);
    if (!game) {
      return res.status(404).json({ message: 'Game session not found' });
    }

    if (game.calledNumbers.length >= 75) {
      return res.status(400).json({ message: 'All numbers called!' });
    }

    // Pick a number not yet called
    let num: number;
    do {
      num = Math.floor(Math.random() * 75) + 1;
    } while (game.calledNumbers.includes(num));

    game.calledNumbers.push(num);

    let letter = 'B';
    if (num <= 15) letter = 'B';
    else if (num <= 30) letter = 'I';
    else if (num <= 45) letter = 'N';
    else if (num <= 60) letter = 'G';
    else letter = 'O';

    // Auto mark matching cells
    for (let c = 0; c < 5; c++) {
      for (let r = 0; r < 5; r++) {
        if (game.card[c][r] === num) {
          const key = `${c}-${r}`;
          if (!game.markedCells.includes(key)) {
            game.markedCells.push(key);
          }
        }
      }
    }

    res.json({
      number: num,
      letter,
      calledNumbers: game.calledNumbers,
    });
  });

  // Game: Mark Cell
  app.post('/api/game/:gameId/mark', requireAuth, (req, res) => {
    const { gameId } = req.params;
    const { col, row } = req.body;
    const game = games.get(gameId);
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    const key = `${col}-${row}`;
    if (!game.markedCells.includes(key)) {
      game.markedCells.push(key);
    }

    res.json({
      markedCells: game.markedCells,
    });
  });

  // Game: Check Bingo
  app.post('/api/game/:gameId/bingo', requireAuth, (req, res) => {
    const { gameId } = req.params;
    const user: User = (req as any).user;
    const game = games.get(gameId);
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    if (game.won) {
      return res.json({ bingo: true, winAmount: 50, balance: user.balance });
    }

    const markedSet = new Set(game.markedCells);
    markedSet.add('2-2');

    const hasBingo = checkCardBingo(game.card, markedSet);

    if (hasBingo) {
      game.won = true;
      const winAmount = 50.0;
      user.balance += winAmount;
      user.totalEarnings = (user.totalEarnings || 0) + winAmount;

      transactions.push({
        _id: genId(),
        userId: user.id,
        type: 'game_win',
        amount: winAmount,
        status: 'completed',
        createdAt: new Date().toISOString(),
      });

      return res.json({
        bingo: true,
        winAmount,
        balance: user.balance,
      });
    }

    res.json({ bingo: false });
  });

  // Wallet: Transactions
  app.get('/api/wallet/transactions', requireAuth, (req, res) => {
    const user: User = (req as any).user;
    const userTx = transactions
      .filter((t) => t.userId === user.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json(userTx);
  });

  // Wallet: Stats
  app.get('/api/wallet/stats', requireAuth, (req, res) => {
    const user: User = (req as any).user;
    res.json({
      balance: user.balance,
      totalEarnings: user.totalEarnings || 0,
      totalGames: user.totalGames || 0,
    });
  });

  // Payments: Deposit
  app.post('/api/payments/deposit', requireAuth, (req, res) => {
    const user: User = (req as any).user;
    const { amount, playerTxNumber, playerNote } = req.body;

    if (!amount || amount < 10) {
      return res.status(400).json({ message: 'Minimum deposit ETB 10' });
    }
    if (!playerTxNumber?.trim()) {
      return res.status(400).json({ message: 'Enter Telebirr transaction number' });
    }

    const tx: Transaction = {
      _id: genId(),
      userId: user.id,
      type: 'deposit',
      amount: parseFloat(amount),
      playerTxNumber: playerTxNumber.trim(),
      playerNote: playerNote || '',
      status: 'pending_verification',
      createdAt: new Date().toISOString(),
    };
    transactions.push(tx);

    res.json({
      message: 'Deposit submitted! Telebirr transaction pending admin verification.',
      transaction: tx,
    });
  });

  // Payments: Withdraw
  app.post('/api/payments/withdraw', requireAuth, (req, res) => {
    const user: User = (req as any).user;
    const { amount, withdrawPhone, playerNote } = req.body;

    const withdrawAmt = parseFloat(amount);
    if (!withdrawAmt || withdrawAmt < 10) {
      return res.status(400).json({ message: 'Minimum withdrawal ETB 10' });
    }
    if (withdrawAmt > user.balance) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }
    if (!withdrawPhone?.trim() || withdrawPhone.length < 9) {
      return res.status(400).json({ message: 'Enter valid phone number' });
    }

    // Deduct held balance
    user.balance -= withdrawAmt;

    const tx: Transaction = {
      _id: genId(),
      userId: user.id,
      type: 'withdraw',
      amount: -withdrawAmt,
      withdrawPhone: withdrawPhone.trim(),
      playerNote: playerNote || '',
      status: 'pending_verification',
      createdAt: new Date().toISOString(),
    };
    transactions.push(tx);

    res.json({
      message: 'Withdrawal requested! Telebirr transfer pending admin dispatch.',
      transaction: tx,
    });
  });

  // Payments Admin: Stats
  app.get('/api/payments/admin/stats', requireAuth, (req, res) => {
    const pendingDeposits = transactions.filter(
      (t) => t.type === 'deposit' && t.status === 'pending_verification'
    ).length;
    const pendingWithdrawals = transactions.filter(
      (t) => t.type === 'withdraw' && t.status === 'pending_verification'
    ).length;
    let totalGames = 0;
    for (const u of users.values()) {
      totalGames += u.totalGames || 0;
    }

    res.json({
      totalUsers: users.size,
      totalGames,
      pendingDeposits,
      pendingWithdrawals,
    });
  });

  // Payments Admin: Pending
  app.get('/api/payments/admin/pending', requireAuth, (req, res) => {
    const pending = transactions
      .filter((t) => t.status === 'pending_verification')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .map((t) => {
        const u = users.get(t.userId);
        return {
          ...t,
          userId: {
            name: u?.name || 'Unknown',
            phone: u?.phone || 'N/A',
          },
        };
      });
    res.json(pending);
  });

  // Payments Admin: All
  app.get('/api/payments/admin/all', requireAuth, (req, res) => {
    const all = transactions
      .slice()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .map((t) => {
        const u = users.get(t.userId);
        return {
          ...t,
          userId: {
            name: u?.name || 'Unknown',
            phone: u?.phone || 'N/A',
          },
        };
      });
    res.json({ transactions: all });
  });

  // Payments Admin: Verify Deposit
  app.post('/api/payments/admin/verify-deposit/:id', requireAuth, (req, res) => {
    const { id } = req.params;
    const { action, adminNote } = req.body;
    const tx = transactions.find((t) => t._id === id);
    if (!tx || tx.type !== 'deposit') {
      return res.status(404).json({ message: 'Deposit transaction not found' });
    }

    if (action === 'approve') {
      tx.status = 'completed';
      tx.adminNote = adminNote || 'Approved';
      const targetUser = users.get(tx.userId);
      if (targetUser) {
        targetUser.balance += tx.amount;
      }
    } else {
      tx.status = 'rejected';
      tx.adminNote = adminNote || 'Rejected';
    }

    res.json({ message: `Deposit ${action === 'approve' ? 'approved' : 'rejected'}` });
  });

  // Payments Admin: Verify Withdraw
  app.post('/api/payments/admin/verify-withdraw/:id', requireAuth, (req, res) => {
    const { id } = req.params;
    const { action, adminNote } = req.body;
    const tx = transactions.find((t) => t._id === id);
    if (!tx || tx.type !== 'withdraw') {
      return res.status(404).json({ message: 'Withdraw transaction not found' });
    }

    if (action === 'approve') {
      tx.status = 'completed';
      tx.adminNote = adminNote || 'Approved';
    } else {
      tx.status = 'rejected';
      tx.adminNote = adminNote || 'Rejected';
      // Refund balance if rejected
      const targetUser = users.get(tx.userId);
      if (targetUser) {
        targetUser.balance += Math.abs(tx.amount);
      }
    }

    res.json({ message: `Withdrawal ${action === 'approve' ? 'approved' : 'rejected'}` });
  });

  // --- Frontend Integration (Vite in Dev / Static in Prod) ---
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0', port: 3000 },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  const PORT = Number(process.env.PORT) || 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server started on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
