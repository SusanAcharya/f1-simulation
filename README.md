# 🏎️ Vibe With Life - Racing Simulation Game

A multiplayer racing simulation game where players manage drivers, cars, and facilities to compete in exciting races and climb the leaderboard!

## 🎮 Game Overview

**Vibe With Life** is a strategic racing game where players:

- **Race** in 10-lap competitions every 5 minutes
- **Manage** driver skills and car performance
- **Upgrade** training facilities and warehouses
- **Compete** for points, tokens, and glory
- **Track** performance with detailed statistics

## ✨ Key Features

### 🏁 Racing System
- **Real-time races** with 10 laps lasting 45-60 seconds each
- **F1-style positioning** based on laps completed, progress, and lap times
- **Dynamic performance** influenced by driver stats, car condition, and RNG
- **Live leaderboard** with position changes and gap calculations
- **Race history** tracking wins, podiums, and points earned

### 👤 Driver Management
- **5 core stats**: Cornering, Overtaking, Defending, Aggression, Composure
- **Stat upgrades** using earned points
- **Performance impact** on race results
- **Custom naming** and personalization

### 🚗 Car Management
- **8 performance stats**: Speed, Acceleration, Braking, Aerodynamics, Fuel Efficiency, Tire Wear, Grip, Durability
- **Condition system** that degrades over time
- **Condition boosting** with tokens
- **Stat point allocation** for performance improvements

### 🏗️ Facility Upgrades
- **Training Facility**: Improves condition recovery and provides driver stat points
- **Warehouse**: Provides car stat points and reduces condition degradation
- **Token-based upgrades** with increasing costs per level

### 📊 Statistics & Leaderboards
- **Global leaderboard** ranked by total points
- **Detailed race history** with lap times and positions
- **Profile pages** showing comprehensive stats
- **Performance tracking** across all races

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Framer Motion** for smooth animations
- **SCSS** for styling with custom themes
- **React Router** for navigation
- **Zustand** for state management
- **Axios** for API communication

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **MongoDB** with Mongoose ODM
- **JWT** authentication
- **RESTful APIs** for all game operations

### Database Schema
- **Users**: Authentication, tokens, points, facility levels
- **Drivers**: Stats, available upgrade points
- **Cars**: Performance stats, condition, upgrade points
- **Races**: Results, lap times, participant data

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd vibe-with-life
   ```

2. **Install dependencies**
   ```bash
   # Install server dependencies
   cd server
   npm install
   
   # Install client dependencies
   cd ../client
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Copy environment template
   cd server
   cp env.example .env
   ```
   
   Configure your `.env` file:
   ```env
   MONGODB_URI=mongodb://localhost:27017/vibe-with-life
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRES_IN=7d
   PORT=3001
   ```

4. **Database Setup**
   ```bash
   # Start MongoDB (if not running)
   mongod
   
   # Seed the database with initial data
   cd server
   npm run seed
   ```

5. **Start the application**
   ```bash
   # Terminal 1 - Start the server
   cd server
   npm run dev
   
   # Terminal 2 - Start the client
   cd client
   npm run dev
   ```

6. **Access the game**
   - Open your browser to `http://localhost:5173`
   - Register a new account or use seeded demo accounts
   - Start racing!

## 🎯 Game Mechanics

### Race Performance Formula
```
Performance = ((Driver Score × 0.6) + (Car Score × 0.4)) × Condition Modifier × Random Factor

Driver Score = (Cornering × 0.25) + (Overtaking × 0.20) + (Defending × 0.15) + (Composure × 0.25) + (Aggression × 0.15)
Car Score = (Speed × 0.20) + (Acceleration × 0.15) + (Braking × 0.15) + (Aero × 0.15) + (Grip × 0.20) + (Fuel × 0.05) + (TireWear × 0.05) + (Durability × 0.05)
```

### Points System
- **1st Place**: 25 points
- **2nd Place**: 18 points
- **3rd Place**: 15 points
- **4th-10th**: 12, 10, 8, 6, 4, 2, 1 points
- **Tokens**: Earned based on position and performance

### DNF (Did Not Finish) System
- **Base DNF rate**: 2% per lap after lap 4
- **Condition factor**: Higher condition = lower DNF chance
- **Reliability factor**: Car durability affects DNF probability
- **Maximum DNF rate**: Capped at 20%

## 🎨 UI/UX Features

### Design Philosophy
- **Retro pixelated** game aesthetic inspired by Mario Kart
- **Smooth animations** with Framer Motion
- **Responsive design** for mobile and desktop
- **Intuitive navigation** with clear visual hierarchy

### Key UI Components
- **Live race viewer** with real-time position updates
- **Interactive stat bars** with upgrade previews
- **Confirmation dialogs** for stat upgrades
- **Podium celebrations** with gold/silver/bronze styling
- **Profile customization** with picture selection

## 📱 Mobile Support

The game is fully responsive and optimized for:
- **Mobile devices** with touch-friendly controls
- **Tablet interfaces** with larger layouts
- **Desktop browsers** with full feature access

## 🔧 Development

### Available Scripts

**Server:**
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run seed         # Seed database with demo data
```

**Client:**
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

### Project Structure
```
vibe-with-life/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API and game services
│   │   ├── store/          # State management
│   │   ├── styles/         # SCSS stylesheets
│   │   └── types/          # TypeScript definitions
├── server/                 # Node.js backend
│   ├── src/
│   │   ├── controllers/    # Route handlers
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Express middleware
│   │   └── scripts/        # Database seeding
└── README.md
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🎮 Play Now!

Ready to start your racing career? Register an account and begin your journey to become the ultimate racing champion in **Vibe With Life**!

---

*Built with ❤️ using React, Node.js, and MongoDB*