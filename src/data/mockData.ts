import { User, Account, Category, Transaction, SecurityAlert, ScamMessage, Budget } from '../types';

export const INITIAL_USER: User = {
  user_id: 1,
  name: "Shivam Yadav",
  email: "student@test.com",
  phone: "+91 98765 43210",
  created_at: new Date().toISOString()
};

export const INITIAL_ACCOUNTS: Account[] = [
  {
    account_id: 1,
    user_id: 1,
    account_name: "HDFC Primary Savings",
    account_type: "Savings",
    balance: 74250.00,
    created_at: new Date().toISOString()
  },
  {
    account_id: 2,
    user_id: 1,
    account_name: "UPI Wallet (PhonePe/GPay)",
    account_type: "Digital Wallet",
    balance: 8500.00,
    created_at: new Date().toISOString()
  }
];

export const INITIAL_CATEGORIES: Category[] = [
  { category_id: 1, category_name: "Salary & Stipend", category_type: "INCOME" },
  { category_id: 2, category_name: "Freelance & Projects", category_type: "INCOME" },
  { category_id: 3, category_name: "Food & Dining", category_type: "EXPENSE" },
  { category_id: 4, category_name: "Housing & Rent", category_type: "EXPENSE" },
  { category_id: 5, category_name: "Utilities & Bills", category_type: "EXPENSE" },
  { category_id: 6, category_name: "Travel & Fuel", category_type: "EXPENSE" },
  { category_id: 7, category_name: "Education & Courses", category_type: "EXPENSE" },
  { category_id: 8, category_name: "Shopping & Tech", category_type: "EXPENSE" },
  { category_id: 9, category_name: "Entertainment & Subs", category_type: "EXPENSE" },
  { category_id: 10, category_name: "Investment & Savings", category_type: "EXPENSE" }
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    transaction_id: 101,
    user_id: 1,
    account_id: 1,
    category_id: 1,
    transaction_type: "INCOME",
    amount: 45000,
    transaction_date: new Date(Date.now() - 86400000 * 5).toISOString().slice(0, 10),
    notes: "Monthly Stipend & Project Grant",
    category_name: "Salary & Stipend",
    account_name: "HDFC Primary Savings"
  },
  {
    transaction_id: 102,
    user_id: 1,
    account_id: 1,
    category_id: 4,
    transaction_type: "EXPENSE",
    amount: 12000,
    transaction_date: new Date(Date.now() - 86400000 * 4).toISOString().slice(0, 10),
    notes: "Hostel / Room Rent",
    category_name: "Housing & Rent",
    account_name: "HDFC Primary Savings"
  },
  {
    transaction_id: 103,
    user_id: 1,
    account_id: 2,
    category_id: 3,
    transaction_type: "EXPENSE",
    amount: 1450,
    transaction_date: new Date(Date.now() - 86400000 * 3).toISOString().slice(0, 10),
    notes: "Cafeteria & Team Lunch",
    category_name: "Food & Dining",
    account_name: "UPI Wallet (PhonePe/GPay)"
  },
  {
    transaction_id: 104,
    user_id: 1,
    account_id: 1,
    category_id: 7,
    transaction_type: "EXPENSE",
    amount: 3200,
    transaction_date: new Date(Date.now() - 86400000 * 2).toISOString().slice(0, 10),
    notes: "Cloud Certification Exam Fee",
    category_name: "Education & Courses",
    account_name: "HDFC Primary Savings"
  },
  {
    transaction_id: 105,
    user_id: 1,
    account_id: 2,
    category_id: 6,
    transaction_type: "EXPENSE",
    amount: 850,
    transaction_date: new Date(Date.now() - 86400000 * 1).toISOString().slice(0, 10),
    notes: "Metro Pass Recharge",
    category_name: "Travel & Fuel",
    account_name: "UPI Wallet (PhonePe/GPay)"
  }
];

export const INITIAL_ALERTS: SecurityAlert[] = [
  {
    alert_id: 1,
    user_id: 1,
    alert_type: "Quick Risk Check",
    severity: "HIGH",
    details: "High amount transfer (>₹50,000) with urgency pressure and unverified recipient",
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    status: "ACTIVE"
  },
  {
    alert_id: 2,
    user_id: 1,
    alert_type: "Scam Analyzer",
    severity: "HIGH",
    details: "Detected sensitive OTP / UPI PIN request keywords in incoming WhatsApp message",
    created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
    status: "ACTIVE"
  },
  {
    alert_id: 3,
    user_id: 1,
    alert_type: "Quick Risk Check",
    severity: "MEDIUM",
    details: "Payment to newly added beneficiary at unusual nocturnal hour (02:15 AM)",
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    status: "RESOLVED"
  }
];

export const INITIAL_SCAM_MESSAGES: ScamMessage[] = [
  {
    message_id: 1,
    user_id: 1,
    message_text: "URGENT: Your electricity connection will be disconnected tonight at 9:30 PM due to unpaid bill. Immediately click https://power-bill-update.in/pay and enter your UPI PIN to avoid cut-off.",
    risk_score: 85,
    risk_level: "HIGH",
    indicators: [
      "Requests sensitive banking information (UPI PIN)",
      "Creates artificial urgency and threat of service disconnection",
      "Contains unverified external link",
      "Impersonates public utility department"
    ],
    created_at: new Date(Date.now() - 86400000 * 1).toISOString()
  },
  {
    message_id: 2,
    user_id: 1,
    message_text: "Congratulations! Your mobile number won 25,00,000 INR in Kaun Banega Crorepati Lottery. Call Manager at +919800012345 to claim refund registration fee.",
    risk_score: 75,
    risk_level: "HIGH",
    indicators: [
      "Contains unsolicited prize or lottery claim",
      "Advance-fee fraud pattern (asks for registration fee)",
      "Creates emotional excitement"
    ],
    created_at: new Date(Date.now() - 86400000 * 3).toISOString()
  }
];

export const INITIAL_BUDGETS: Budget[] = [
  {
    budget_id: 1,
    user_id: 1,
    month_name: new Date().toISOString().slice(0, 7),
    total_limit: 35000,
    created_at: new Date().toISOString(),
    allocations: [
      { allocation_id: 1, budget_id: 1, category_id: 3, category_name: "Food & Dining", allocated_amount: 8000, spent_amount: 5450 },
      { allocation_id: 2, budget_id: 1, category_id: 4, category_name: "Housing & Rent", allocated_amount: 12000, spent_amount: 12000 },
      { allocation_id: 3, budget_id: 1, category_id: 5, category_name: "Utilities & Bills", allocated_amount: 3000, spent_amount: 2100 },
      { allocation_id: 4, budget_id: 1, category_id: 6, category_name: "Travel & Fuel", allocated_amount: 4000, spent_amount: 2850 },
      { allocation_id: 5, budget_id: 1, category_id: 8, category_name: "Shopping & Tech", allocated_amount: 5000, spent_amount: 4200 },
      { allocation_id: 6, budget_id: 1, category_id: 9, category_name: "Entertainment & Subs", allocated_amount: 3000, spent_amount: 1950 }
    ]
  }
];

export const SAMPLE_SCAMS = [
  {
    title: "Electricity Disconnection Threat",
    sender: "VK-POWER",
    text: "Dear Consumer, your electricity power will be disconnected today at 9:30 PM because previous month bill was not updated. Please immediately contact our officer at 9876543210 or click http://bit.ly/pay-bill-now to verify your UPI PIN.",
    category: "Utility Impersonation"
  },
  {
    title: "Bank KYC & Account Freeze Warning",
    sender: "SBI-ALERT",
    text: "Dear customer, your State Bank account has been temporarily suspended due to pending PAN card verification. Update your KYC within 24 hours at http://sbi-kyc-portal.xyz or share OTP to verify identity.",
    category: "Banking Phishing"
  },
  {
    title: "KBC Lottery / Cash Prize Claim",
    sender: "KBC-WIN",
    text: "Congratulations! You have been selected for ₹25 Lakhs cash prize in Lucky Draw. To credit your reward immediately, send ₹2,500 processing charges to manager and share transaction screenshot.",
    category: "Advance-Fee Fraud"
  },
  {
    title: "Part-Time Task & Telegram Job Scam",
    sender: "HR-GLOBAL",
    text: "Earn ₹3,000 - ₹8,000 daily from home just by liking YouTube videos and rating Google Maps places. No experience required. Join Telegram channel @earn_daily_cash and claim ₹500 joining bonus.",
    category: "Job / Task Scam"
  },
  {
    title: "CBI / Police Digital Arrest Intimidation",
    sender: "POLICE-HQ",
    text: "Notice from Cyber Crime Department: A parcel containing illegal narcotics has been seized with your Aadhaar ID. A non-bailable arrest warrant has been issued. You are placed under digital house arrest. Connect via Skype immediately.",
    category: "Extortion / Digital Arrest"
  }
];
