# 🎰 Bingo ETB - Ethiopian Birr Bingo Game

Full-stack Bingo game built with React + Node.js + MongoDB, supporting ETB (Ethiopian Birr) payments via Telebirr manual verification.

## 📁 Project Structure

```
bingo-etb/
├── client/          # React frontend (Vite)
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Page components
│   │   ├── context/      # React context (Auth)
│   │   └── services/     # API service
│   └── package.json
├── server/          # Node.js/Express backend
│   ├── controllers/      # Route handlers
│   ├── models/           # MongoDB schemas
│   ├── routes/           # API routes
│   ├── middleware/       # Auth & rate limiting
│   └── server.js
└── render.yaml      # Render.com deployment config
```

## 🚀 Quick Start

### 1. Clone & Install
```bash
git clone <repo-url>
cd bingo-etb

# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

### 2. Environment Variables

**Server (`server/.env`):**
```env
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/bingo_etb
JWT_SECRET=your_super_secret_key_min_32_chars
ADMIN_PHONE=0965041641
ADMIN_NAME=Sisay
ADMIN_PASSWORD=your_secure_password
CLIENT_URL=http://localhost:3000
```

**Client (`client/.env`):**
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Run Development
```bash
# Terminal 1 - Backend
cd server && npm run dev

# Terminal 2 - Frontend
cd client && npm run dev
```

## 💰 Telebirr Payment Flow

### Deposit (Player → Admin)
1. Player sends ETB via Telebirr to **0965041641** (Sisay)
2. Player enters transaction number in app
3. Admin sees pending request in Admin Panel
4. Admin verifies on Telebirr and clicks **✅ Approve**
5. Balance instantly added to player

### Withdraw (Player ← Admin)
1. Player requests withdrawal + enters phone number
2. Admin sees pending request in Admin Panel
3. Admin sends money via Telebirr to player phone
4. Admin clicks **✅ Approve**
5. If rejected, balance refunded to player

## 👤 Admin Access
- Phone: `0965041641`
- Password: Set in `ADMIN_PASSWORD` env var
- Admin panel auto-created on first server start

## 🌍 Deployment (Render.com)
1. Push code to GitHub
2. Connect repo to Render.com
3. Use `render.yaml` for Blueprint deployment
4. Set environment variables in Render dashboard
5. Deploy!

## 🔐 Security Features
- JWT authentication
- Rate limiting on auth & payments
- Helmet.js security headers
- Input validation
- MongoDB connection pooling (500 max)
- Admin-only routes protected

## 📱 Features
- ✅ User registration/login
- ✅ Bingo game with auto-play
- ✅ ETB wallet with transaction history
- ✅ Telebirr deposit/withdrawal
- ✅ Admin verification dashboard
- ✅ Leaderboard
- ✅ Responsive mobile design

## 🛠 Tech Stack
- **Frontend:** React 18, Vite, react-hot-toast, lucide-react
- **Backend:** Node.js, Express, MongoDB (Mongoose)
- **Security:** bcryptjs, JWT, helmet, express-rate-limit
- **Deployment:** Render.com

## 📞 Support
Telegram: @BingoSupport
Admin: Sisay (0965041641)
