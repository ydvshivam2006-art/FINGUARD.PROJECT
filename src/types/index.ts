export interface User {
  user_id: number;
  name: string;
  email: string;
  phone: string;
  password?: string;
  created_at?: string;
}

export interface Account {
  account_id: number;
  user_id: number;
  account_name: string;
  account_type: string;
  balance: number;
  created_at?: string;
}

export interface Category {
  category_id: number;
  category_name: string;
  category_type: 'INCOME' | 'EXPENSE';
}

export interface Transaction {
  transaction_id: number;
  user_id: number;
  account_id: number;
  category_id: number;
  transaction_type: 'INCOME' | 'EXPENSE';
  amount: number;
  transaction_date: string;
  notes: string;
  category_name?: string;
  account_name?: string;
}

export interface SecurityAlert {
  alert_id: number;
  user_id: number;
  alert_type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  details: string;
  created_at: string;
  status?: 'ACTIVE' | 'RESOLVED';
}

export interface ScamMessage {
  message_id: number;
  user_id: number;
  message_text: string;
  risk_score: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
  indicators: string[];
  created_at: string;
}

export interface BudgetAllocation {
  allocation_id: number;
  budget_id: number;
  category_id: number;
  allocated_amount: number;
  category_name?: string;
  spent_amount?: number;
}

export interface Budget {
  budget_id: number;
  user_id: number;
  month_name: string; // YYYY-MM
  total_limit: number;
  created_at?: string;
  allocations?: BudgetAllocation[];
}

export interface RiskFactor {
  id: string;
  name: string;
  description: string;
  points: number;
  active: boolean;
  category: 'amount' | 'recipient' | 'velocity' | 'context' | 'behavior';
}

export interface RiskAnalysisResult {
  score: number;
  level: 'LOW' | 'MEDIUM' | 'HIGH';
  indicators: string[];
  recommendations: string[];
  factorBreakdown: { name: string; points: number }[];
}

export interface UPIInspectionResult {
  rawInput: string;
  parsedParams: {
    pa?: string; // payee address (VPA)
    pn?: string; // payee name
    am?: string; // amount
    cu?: string; // currency
    tn?: string; // note
    mc?: string; // merchant code
  };
  riskScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  flags: string[];
  explanations: string[];
  recommendedAction: string;
  isCollectTrap: boolean;
}

export interface PhishingScenario {
  id: string;
  title: string;
  category: string;
  channel: 'SMS' | 'WhatsApp' | 'Telegram' | 'OLX' | 'Call';
  sender: string;
  timestamp: string;
  message: string;
  threatVector: string;
  psychologicalTrigger: string;
  redFlags: string[];
  dangerLevel: 'HIGH' | 'CRITICAL' | 'MEDIUM';
  safeAction: string;
}

export interface CyberComplaintDraft {
  victimName: string;
  victimPhone: string;
  victimEmail: string;
  incidentDate: string;
  incidentChannel: string;
  suspectDetails: string;
  financialLoss: number;
  transactionRef: string;
  briefNarration: string;
  applicableSections: string[];
}
