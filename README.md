# FinGuard — Financial Fraud & UPI Anomaly Defense System

FinGuard is a full-stack financial safety application engineered to detect zero-amount UPI reverse charges (`am=0`), lexical phishing triggers, and abnormal transaction velocities with automated 1930 Cyber Cell complaint generation and 3NF relational MySQL ledgers.

---

## 🚀 How to Run in VS Code (Exact Same Interface as Web Preview)

You have two powerful ways to run this project on your computer:

---

### Method 1: The Modern React Application (Exact Preview Look)
This runs the modern, reactive interface with the live animated speedometer gauge, interactive UPI Threat Lab, Scam Analyzer, and Code Station.

1. **Open the extracted `FINGUARD` folder in VS Code**:
   `File` -> `Open Folder...` -> Select `FINGUARD`.
2. **Open the Integrated Terminal** (`Ctrl + \`` or `Cmd + \``).
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Start the local development server**:
   ```bash
   npm run dev
   ```
5. **Open in your browser**:
   Click the link in terminal or open:
   👉 **`http://localhost:5173`** (or `http://localhost:3000`)

---

### Method 2: The Full-Stack Node.js + MySQL Backend
This runs the Express API server with database connectivity or offline in-memory fallback.

1. **Open a new terminal tab in VS Code**.
2. **Navigate into the backend folder**:
   ```bash
   cd backend
   ```
3. **Install backend dependencies**:
   ```bash
   npm install
   ```
4. **Configure MySQL (Optional - works with or without MySQL)**:
   - If using MySQL: Open `backend/database.sql` in MySQL Workbench and execute it. Then set your password in `backend/.env`.
   - If MySQL is offline: The server automatically falls back to an in-memory database with pre-seeded demo accounts!
5. **Start the server**:
   ```bash
   node server.js
   ```
6. **Access in browser**:
   👉 **`http://localhost:3000/pages/home.html`** or **`http://localhost:3000/pages/login.html`**

---

## 🔑 Demo Account Credentials
- **Email:** `student@test.com`
- **Password:** `password123`

---

## 📁 Repository Structure
```text
FINGUARD/
├── package.json               # Root dependencies (React 19, Vite, Tailwind CSS, Lucide)
├── vite.config.ts             # Vite dev server configuration
├── tsconfig.json              # TypeScript compiler configuration
├── index.html                 # React Single Page App entry point
├── README.md                  # This setup guide
│
├── src/                       # Complete React Source Code
│   ├── main.tsx               # Root DOM mounting
│   ├── App.tsx                # Master state router & navigation manager
│   ├── index.css              # Cyber-dark Tailwind styles
│   ├── types/                 # TypeScript data contracts & schemas
│   ├── data/                  # Initial transactions, mock data & code files
│   └── components/            # High-fidelity React Views
│       ├── Navbar.tsx         # Responsive header & auth status
│       ├── LandingPageView.tsx# Cybersecurity overview & sandbox scanner
│       ├── DashboardView.tsx  # Animated risk gauge & balance metrics
│       ├── ThreatLabView.tsx  # UPI protocol reverse-charge & 1930 FIR tool
│       ├── RiskCheckView.tsx  # Multi-factor transaction risk evaluator
│       ├── ScamAnalyzerView.tsx # Heuristic NLP message analyzer
│       ├── TransactionsView.tsx # Live ledger & account balance updates
│       ├── BudgetView.tsx     # Monthly budget allocations & progress bars
│       ├── AnalyticsView.tsx  # Spending velocity & category breakdown
│       ├── SecurityAlertsView.tsx # Security incident response log
│       ├── SchemaAnalyzerView.tsx # 3NF ER diagram & Viva prep station
│       ├── ProfileView.tsx    # User settings & security credentials
│       ├── AuthModal.tsx      # Sign In, Sign Up, and 6-digit OTP reset
│       └── CodeStationModal.tsx # Full code viewer & ZIP exporter
│
├── backend/                   # Node.js + Express + MySQL Server
│   ├── server.js              # REST API with automated resilient fallback
│   ├── database.sql           # 8 normalized 3NF MySQL tables & seed data
│   ├── package.json           # Express, mysql2, cors, dotenv
│   └── .env.example           # MySQL credentials template
│
└── pages/                     # Standalone vanilla HTML pages (alternative mode)
    ├── home.html
    ├── login.html
    ├── signup.html
    ├── forgot-password.html
    └── defense-lab.html
```

---

## 🛡️ Key Features
- **Zero-Amount UPI Trap Simulator:** Exposes `am=0` reverse-charge requests.
- **Lexical Scam Detector:** Identifies urgency keywords, fake lottery wins, and APK delivery vectors.
- **1930 Cyber Crime FIR Formatter:** Formats fraud incident reports ready for police or cyber portal submission.
- **3NF Relational Persistence:** Enforces referential integrity with cascading updates across accounts, transactions, and budgets.
- **Self-Service Password Reset Authority:** Allows any user to generate a 6-digit OTP and reset credentials securely.
