import React, { useState } from 'react';
import { 
  ShieldAlert, 
  QrCode, 
  Smartphone, 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  Copy, 
  Download, 
  ExternalLink, 
  Info, 
  PhoneCall, 
  Zap, 
  ArrowRight,
  Eye,
  EyeOff,
  Flame,
  Radio,
  Lock,
  GitBranch,
  Clock,
  Coins
} from 'lucide-react';
import { User, SecurityAlert, UPIInspectionResult, PhishingScenario } from '../types';

interface ThreatLabViewProps {
  user: User | null;
  onAlertLogged: (alert: SecurityAlert) => void;
}

export const ThreatLabView: React.FC<ThreatLabViewProps> = ({ user, onAlertLogged }) => {
  const [activeSubTab, setActiveSubTab] = useState<'upi-inspector' | 'scam-simulator' | 'fir-generator' | 'mule-matrix'>('upi-inspector');
  const [isLienTriggered, setIsLienTriggered] = useState<boolean>(false);

  // --- SUBTAB 1: UPI & QR Code Payload Inspector ---
  const [upiInput, setUpiInput] = useState<string>('upi://pay?pa=msedcl.bijli.bill@ybl&pn=MSEDCL%20Power%20Officer&am=1450.00&tn=Electricity%20cut%20fine%20enter%20pin');
  const [inspectionResult, setInspectionResult] = useState<UPIInspectionResult | null>(null);
  const [alertLoggedNotice, setAlertLoggedNotice] = useState<string | null>(null);

  const PRESET_UPI_TESTS = [
    {
      title: 'Fake Electricity Disconnection UPI',
      payload: 'upi://pay?pa=msedcl.bijli.bill@ybl&pn=MSEDCL%20Power%20Officer&am=1450.00&tn=Electricity%20cut%20fine%20enter%20pin',
      tag: 'CRITICAL THREAT'
    },
    {
      title: 'OLX "Scan to Receive Money" Trap',
      payload: 'upi://pay?pa=buyer.advance.payment@okhdfcbank&pn=Army%20Officer%20Buyer&am=15000.00&tn=Scan%20QR%20and%20enter%20UPI%20PIN%20to%20RECEIVE%20advance',
      tag: 'COLLECT TRAP'
    },
    {
      title: 'Amazon Fake Refund Link',
      payload: 'upi://pay?pa=amazon.refunds.desk@paytm&pn=Amazon%20Customer%20Care&am=4999.00&tn=Instant%20Refund%20Verification',
      tag: 'PHISHING'
    },
    {
      title: 'Legitimate Merchant (IRCTC)',
      payload: 'upi://pay?pa=irctc.pay@icici&pn=IRCTC%20Official%20Ticketing&am=750.00&tn=Train%20Booking%20PNR%202839102831&mc=4112',
      tag: 'SAFE'
    }
  ];

  const handleInspectUPI = (textToTest?: string) => {
    const input = (textToTest || upiInput).trim();
    if (!input) return;

    let pa = '';
    let pn = '';
    let am = '';
    let cu = 'INR';
    let tn = '';
    let mc = '';

    if (input.startsWith('upi://') || input.includes('?')) {
      try {
        const queryIndex = input.indexOf('?');
        const queryString = queryIndex !== -1 ? input.slice(queryIndex + 1) : input;
        const params = new URLSearchParams(queryString);
        pa = params.get('pa') || '';
        pn = params.get('pn') || '';
        am = params.get('am') || '';
        cu = params.get('cu') || 'INR';
        tn = params.get('tn') || '';
        mc = params.get('mc') || '';
      } catch {
        pa = input;
      }
    } else {
      pa = input;
    }

    const flags: string[] = [];
    const explanations: string[] = [];
    let riskScore = 10;
    let isCollectTrap = false;

    const lowerInput = (input + ' ' + tn + ' ' + pn + ' ' + pa).toLowerCase();

    // Check 1: UPI PIN reversed collection deceit
    if (lowerInput.includes('enter pin') || lowerInput.includes('pin to receive') || lowerInput.includes('receive advance') || lowerInput.includes('scan to receive')) {
      flags.push('FATAL: UPI PIN "Receive Money" Trap Detected');
      explanations.push('Fraudsters try to trick victims into believing they are receiving money. UPI architecture NEVER requires you to enter a PIN to receive money. Entering your PIN always DEBITS your account!');
      riskScore += 50;
      isCollectTrap = true;
    }

    // Check 2: Deceptive keywords
    const suspiciousKeywords = ['refund', 'lottery', 'bonus', 'cashback', 'kyc', 'support', 'officer', 'bijli', 'fine', 'penalty', 'verify'];
    const foundKeywords = suspiciousKeywords.filter(w => lowerInput.includes(w));
    if (foundKeywords.length > 0) {
      flags.push(`Suspicious Trigger Terms: ${foundKeywords.join(', ').toUpperCase()}`);
      explanations.push(`The UPI address or note uses high-pressure words (${foundKeywords.join(', ')}) typical of social engineering scams.`);
      riskScore += 25;
    }

    // Check 3: Free Consumer PSP Handle masquerading as an Official Entity
    const consumerPSPs = ['@ybl', '@paytm', '@okaxis', '@okhdfcbank', '@oksbi', '@apl', '@axl', '@ibl'];
    const officialNames = ['msedcl', 'electricity', 'power', 'amazon', 'flipkart', 'police', 'sbi', 'hdfc', 'customs', 'income tax'];
    const isImpersonating = officialNames.some(name => lowerInput.includes(name));
    const isConsumerHandle = consumerPSPs.some(psp => pa.toLowerCase().endsWith(psp));

    if (isImpersonating && isConsumerHandle) {
      flags.push('Consumer VPA Impersonating Official Corporate / Utility Brand');
      explanations.push(`The payee claims to be an institution (${pn || 'Official'}), but the UPI ID ends in a free individual consumer handle (${pa}). Legitimate corporations use verified merchant VPAs with MCC codes, not personal consumer handles.`);
      riskScore += 30;
    }

    // Check 4: Missing Merchant Category Code on Corporate claims
    if (isImpersonating && !mc) {
      flags.push('Missing Verified Merchant Category Code (MCC)');
      explanations.push('Verified corporate billers on UPI have an assigned 4-digit Merchant Category Code (MCC). This payload lacks merchant identification.');
      riskScore += 15;
    }

    // Determine level
    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
    if (riskScore >= 60) riskLevel = 'HIGH';
    else if (riskScore >= 35) riskLevel = 'MEDIUM';

    let recommendedAction = 'Legitimate payment format. Ensure you verify the payee name on your banking app before authorizing.';
    if (riskLevel === 'HIGH') {
      recommendedAction = 'ABORT IMMEDIATELY. Do not scan this QR code or authorize this UPI handle. Entering your UPI PIN will result in permanent debit loss.';
    } else if (riskLevel === 'MEDIUM') {
      recommendedAction = 'PROCEED WITH HIGH CAUTION. Independently verify the recipient through official directory numbers before transferring.';
    }

    setInspectionResult({
      rawInput: input,
      parsedParams: { pa, pn, am, cu, tn, mc },
      riskScore: Math.min(riskScore, 100),
      riskLevel,
      flags,
      explanations,
      recommendedAction,
      isCollectTrap
    });
  };

  const handleLogUPIAlert = () => {
    if (!inspectionResult || !user) return;
    const newAlert: SecurityAlert = {
      alert_id: Date.now(),
      user_id: user.user_id,
      alert_type: 'UPI_PAYLOAD_FRAUD_TRIGGER',
      severity: inspectionResult.riskLevel,
      details: `Scanned Payee: ${inspectionResult.parsedParams.pa || 'Unknown'} | Risk: ${inspectionResult.riskScore}/100. Flags: ${inspectionResult.flags.join('; ')}`,
      created_at: new Date().toISOString(),
      status: 'ACTIVE'
    };

    onAlertLogged(newAlert);
    setAlertLoggedNotice('Security alert successfully recorded to your live FinGuard ledger!');
    setTimeout(() => setAlertLoggedNotice(null), 4000);
  };

  // --- SUBTAB 2: Interactive Phishing Scenarios ---
  const PHISHING_SCENARIOS: PhishingScenario[] = [
    {
      id: 'scen-electricity',
      title: 'Urgent Electricity Disconnection Warning',
      category: 'Utility Pretexting & Malicious APK Drop',
      channel: 'SMS',
      sender: 'VM-BIJLI',
      timestamp: 'Today, 8:45 PM',
      message: 'Dear Consumer, Your Electricity power will be disconnected tonight at 9:30 PM from the electricity office because your previous month bill was not updated. Immediately contact our electricity officer Mr. Sharma at 98765-43210 and install official update helper: http://bijli-bill-update.online/msedcl_v3.apk',
      threatVector: 'Malicious Android APK (Remote Access Trojan / SMS Spy) + Extreme Urgency Pretext',
      psychologicalTrigger: 'Panic, Urgency (Disconnection in 45 mins), Fear of losing basic utility',
      redFlags: [
        'Disconnection threat within 45 minutes violates mandatory 15-day statutory notice laws',
        'Direct mobile phone number provided instead of standard toll-free DISCOM helpline',
        'Prompts download of an .apk file outside the official Google Play Store',
        'Suspicious non-governmental domain (.online instead of .gov.in or .co.in)'
      ],
      dangerLevel: 'CRITICAL',
      safeAction: 'Never install an APK file received over SMS/WhatsApp. Discoms never disconnect power on the same night. Verify bills only via the official state electricity portal.'
    },
    {
      id: 'scen-telegram',
      title: 'Telegram Part-Time "Video Like" Task Scam',
      category: 'Advance Fee & Ponzi Task Trap',
      channel: 'WhatsApp',
      sender: '+91 88392 10928',
      timestamp: 'Yesterday, 11:20 AM',
      message: 'Hello! I am Priya from Global Digital Media HR. We have part-time remote work for students and professionals. Just like 3 YouTube videos and screenshot to earn ₹150 instantly. Daily payout up to ₹3,500! Join our Telegram VIP Task Group: t.me/VIP_Global_Tasks_Official',
      threatVector: 'Advance-fee task fraud. Pays ₹150 initially to build trust, then lures victim into "Prepaid Tasks" demanding ₹5,000 to ₹50,000 investment before withholding funds.',
      psychologicalTrigger: 'Easy money, low barrier to entry, false trust through initial micro-payout',
      redFlags: [
        'Unsolicited HR contact on WhatsApp with no job application on record',
        'Disproportionate reward (₹50 per YouTube like is economically impossible)',
        'Migration from WhatsApp to Telegram channels to evade phone number tracing',
        'Subsequent requirement to transfer money for "VIP level clearance"'
      ],
      dangerLevel: 'HIGH',
      safeAction: 'Block the sender immediately. Legitimate enterprises never recruit for generic "YouTube video liking" or ask workers to deposit money to unlock salaries.'
    },
    {
      id: 'scen-kyc',
      title: 'Bank Account Suspension / PAN-Aadhaar KYC',
      channel: 'SMS',
      sender: 'CP-SBIBNK',
      category: 'Credential Phishing & Banking Impersonation',
      timestamp: 'Today, 10:15 AM',
      message: 'Dear Customer, Your SBI Bank account has been BLOCKED due to non-update of mandatory PAN card. To unblock immediately within 24 hours, click to verify your Aadhaar: https://sbi-pan-kyc-verification.top/auth',
      threatVector: 'Deceptive Web Phishing Portal designed to harvest NetBanking User ID, Password, Profile Password, and real-time OTP.',
      psychologicalTrigger: 'Authority (State Bank), Fear of losing account access, strict deadline',
      redFlags: [
        'Fake spoofed sender ID and unofficial URL (.top domain instead of onlinesbi.sbi)',
        'Banks never ask for full PAN/Aadhaar/Passwords through an SMS link',
        'Grammatical anomalies and high-pressure threats of immediate freezing'
      ],
      dangerLevel: 'CRITICAL',
      safeAction: 'Do not click the link. Visit your official bank branch or open the official banking app directly from your phone.'
    },
    {
      id: 'scen-olx',
      title: 'Marketplace "Scan QR to Receive Money" Fraud',
      channel: 'OLX',
      sender: 'Col. Rajesh Kumar (Buyer)',
      category: 'UPI Reverse Collect Deceit',
      timestamp: 'Today, 2:30 PM',
      message: 'I am an Army officer stationed at Pune Cantt. I am buying your sofa for ₹12,000 without bargaining. I have generated an official Indian Army UPI Merchant QR code. Please scan this QR code on Google Pay and enter your 6-digit UPI PIN to credit ₹12,000 to your bank account immediately.',
      threatVector: 'UPI Collect Request disguised as a credit transfer. Entering the PIN approves an outgoing debit of ₹12,000.',
      psychologicalTrigger: 'Authority & Respect (Army Officer pretext), Greed (zero negotiation), Urgency',
      redFlags: [
        'Buyer agrees to purchase high-value goods without inspecting condition',
        'Claims that scanning a QR code or entering a UPI PIN is required to RECEIVE money',
        'Use of patriotic pretext (Army/Defence officer ID card) as a trust mask'
      ],
      dangerLevel: 'CRITICAL',
      safeAction: 'Remember the golden rule of UPI: You NEVER enter your UPI PIN to receive money. Entering a PIN only authorizes money leaving your account.'
    },
    {
      id: 'scen-customs',
      title: 'Customs Officer Parcel Extortion Scam',
      channel: 'WhatsApp',
      sender: '+91 97182 39012',
      category: 'Impersonation & Blackmail',
      timestamp: '3 days ago',
      message: 'This is Officer Mehta from Delhi International Customs Courier Cell. A luxury parcel containing 5,000 British Pounds and iPhones in your name has been intercepted. You must immediately pay ₹35,000 as Customs Clearance Certificate fee to UPI id customs.clearance@okaxis within 2 hours, or an arrest warrant will be issued under Anti-Money Laundering Act.',
      threatVector: 'Legal Coercion & Fake Law Enforcement Extortion. Threatens victims with imminent police arrest unless ransom is paid to private accounts.',
      psychologicalTrigger: 'Severe terror of police arrest, criminal charges, and legal ruin',
      redFlags: [
        'Customs departments do not contact individuals via personal WhatsApp numbers',
        'Government duties are NEVER paid to personal UPI handles (@okaxis)',
        'Customs duties are assessed only with official detention memos with tracking numbers'
      ],
      dangerLevel: 'CRITICAL',
      safeAction: 'Do not transfer any money. Report the incident directly to National Cyber Crime Portal (1930) or local police station.'
    }
  ];

  const [selectedScenario, setSelectedScenario] = useState<PhishingScenario>(PHISHING_SCENARIOS[0]);
  const [showRedFlags, setShowRedFlags] = useState<boolean>(true);

  // --- SUBTAB 3: Cyber Incident & FIR Generator ---
  const [complaintForm, setComplaintForm] = useState({
    victimName: user ? user.name : 'Shivam Sharma',
    victimPhone: user ? user.phone : '9876543210',
    victimEmail: user ? user.email : 'shivam@example.com',
    incidentDate: new Date().toISOString().slice(0, 10),
    incidentChannel: 'UPI Fraud / Fake QR Code',
    suspectDetails: 'UPI: msedcl.bijli.bill@ybl / Mobile: +91 98765 43210',
    financialLoss: '1450',
    transactionRef: 'UPI-REF-2026-98120391283',
    briefNarration: 'I was contacted under the pretext of electricity disconnection. The fraudster sent a malicious link/QR code claiming it was a bill clearance portal. Upon scanning, my account was debited without authorization.'
  });

  const [copiedDraft, setCopiedDraft] = useState<boolean>(false);

  const generateComplaintText = () => {
    return `FORMAL CYBER CRIME COMPLAINT / INCIDENT REPORT
TO:
The Station House Officer / Cyber Crime Police Station / National Cyber Crime Portal (1930)
Portal Reference: https://cybercrime.gov.in

SUBJECT: Complaint regarding Financial Cyber Fraud, Online Cheating, and Identity Impersonation under Section 66D of Information Technology Act, 2000 & Section 420 IPC.

1. COMPLAINANT PARTICULARS:
- Full Name: ${complaintForm.victimName}
- Contact Phone: ${complaintForm.victimPhone}
- Email Address: ${complaintForm.victimEmail}
- Date of Complaint: ${new Date().toLocaleDateString('en-IN', { dateStyle: 'full' })}

2. INCIDENT DETAILS:
- Date & Time of Incident: ${complaintForm.incidentDate}
- Fraud Channel / Medium: ${complaintForm.incidentChannel}
- Suspect Identifiers (Mobile/UPI/URL): ${complaintForm.suspectDetails}
- Financial Loss Incurred: INR ${complaintForm.financialLoss}
- Bank / Transaction Reference (UTR/RRN): ${complaintForm.transactionRef}

3. CHRONOLOGICAL NARRATION OF FACTS:
${complaintForm.briefNarration}

4. LEGAL PROVISIONS APPLICABLE:
- Section 66D, Information Technology Act, 2000: Punishment for cheating by personation by using computer resource (Imprisonment up to 3 years and fine).
- Section 43, Information Technology Act, 2000: Unauthorized access and extraction of data.
- Section 420, Indian Penal Code: Cheating and dishonestly inducing delivery of property.

5. PRAYER / RELIEF SOUGHT:
It is respectfully prayed that:
a) The suspect UPI handle / bank account and mobile number be frozen on an emergency basis via the I4C / 1930 nodal network to prevent dissipation of funds.
b) An FIR may kindly be registered under relevant sections of the IT Act and IPC.
c) Directives be issued to the intermediary bank/PSP to lien the disputed funds and initiate chargeback recovery.

Sincerely,
${complaintForm.victimName}
Contact: ${complaintForm.victimPhone}
Generated by FinGuard Forensic Defense Engine
`;
  };

  const handleCopyComplaint = () => {
    navigator.clipboard.writeText(generateComplaintText());
    setCopiedDraft(true);
    setTimeout(() => setCopiedDraft(false), 3000);
  };

  const handleDownloadComplaint = () => {
    const text = generateComplaintText();
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Cybercrime_Complaint_${complaintForm.victimName.replace(/\s+/g, '_')}_${complaintForm.incidentDate}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 p-6 md:p-8">
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-2">
            <span>DEFENSE LABORATORY & FORENSIC INTELLIGENCE</span>
            <span>·</span>
            <span>REAL-TIME THREAT SIMULATOR</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white mb-2">
            Defense Lab & Incident Hub
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Advanced forensic tools to inspect raw UPI/QR code payment strings, simulate realistic cybercrime attacks, and instantly generate legally formatted FIR incident complaints.
          </p>

          {/* Sub Navigation Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveSubTab('upi-inspector')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                activeSubTab === 'upi-inspector'
                  ? 'bg-cyan-500 text-slate-950 font-semibold'
                  : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              <QrCode className="w-4 h-4" />
              <span>UPI & QR Payload Inspector</span>
            </button>

            <button
              onClick={() => setActiveSubTab('scam-simulator')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                activeSubTab === 'scam-simulator'
                  ? 'bg-cyan-500 text-slate-950 font-semibold'
                  : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>Phishing Simulation Lab</span>
            </button>

            <button
              onClick={() => setActiveSubTab('fir-generator')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                activeSubTab === 'fir-generator'
                  ? 'bg-cyan-500 text-slate-950 font-semibold'
                  : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Cyber FIR Generator (1930)</span>
            </button>

            <button
              onClick={() => setActiveSubTab('mule-matrix')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                activeSubTab === 'mule-matrix'
                  ? 'bg-cyan-500 text-slate-950 font-semibold'
                  : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              <GitBranch className="w-4 h-4" />
              <span>Mule Account Matrix & 1930 Golden Hour</span>
            </button>
          </div>
        </div>
      </div>

      {/* SUBTAB 4: Mule Account Flow Matrix & 1930 Golden Hour Protocol */}
      {activeSubTab === 'mule-matrix' && (
        <div className="space-y-6">
          {/* Overview Card */}
          <div className="rounded-xl bg-slate-900 border border-slate-800 p-6 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <GitBranch className="w-5 h-5 text-cyan-400" />
                  <h2 className="text-lg font-bold text-white">Mule Account Layering Matrix & 1930 Golden Hour Forensic Model</h2>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Trace the multi-hop exfiltration path of stolen funds across digital wallets, mule bank accounts, and ATM cashout nexuses.
                </p>
              </div>

              {/* Golden Hour Countdown Widget */}
              <div className="p-3 bg-slate-950 border border-amber-500/40 rounded-xl flex items-center gap-3 shrink-0">
                <Clock className="w-5 h-5 text-amber-400 animate-pulse" />
                <div>
                  <div className="text-[10px] font-mono text-amber-300 uppercase font-semibold">1930 "Golden Hour" Window</div>
                  <div className="text-sm font-bold font-mono text-white">01h 42m 18s Remaining</div>
                </div>
              </div>
            </div>

            <div className="p-3.5 bg-cyan-950/20 border border-cyan-800/40 rounded-lg text-xs text-cyan-200 leading-relaxed">
              <strong>I4C CFCFRMS Protocol:</strong> In India, financial cyber fraud reported within 2 hours to helpline 1930 allows the Indian Cyber Crime Coordination Centre (I4C) to trigger automated API liens across participating banks (State Bank, HDFC, ICICI, Paytm) under Section 91 CrPC before fraudsters withdraw cash from ATMs or convert to crypto P2P.
            </div>
          </div>

          {/* Multi-Hop Interactive Flow Diagram */}
          <div className="rounded-xl bg-slate-900 border border-slate-800 p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span>Multi-Hop Layering Diagram (Simulated Incident #CYB-74891)</span>
              </h3>
              <button
                onClick={() => setIsLienTriggered(!isLienTriggered)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  isLienTriggered
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-900/40'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>{isLienTriggered ? 'Lien Active: ₹65,000 Preserved' : 'Simulate 1930 Inter-Bank Lien Freeze'}</span>
              </button>
            </div>

            {/* Nodes Chain */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
              {/* Hop 0: Victim Account */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 relative">
                <div className="flex justify-between items-center text-[10px] font-mono">
                  <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-bold">HOP 0: ORIGIN</span>
                  <span className="text-slate-500">T + 00:00</span>
                </div>
                <div className="text-xs font-bold text-white">Victim Primary Account</div>
                <div className="text-[11px] font-mono text-cyan-400">HDFC Bank ··· 9821</div>
                <div className="text-sm font-extrabold font-mono text-rose-400">-₹65,000.00</div>
                <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-900">
                  Vector: Deceptive Zero-Amount UPI collect trap authorized
                </div>
              </div>

              {/* Hop 1: Level 1 Mule Wallet */}
              <div className={`p-4 rounded-xl bg-slate-950 border transition-all space-y-2 relative ${
                isLienTriggered ? 'border-emerald-500/80 shadow-lg shadow-emerald-950/40' : 'border-amber-500/40'
              }`}>
                <div className="flex justify-between items-center text-[10px] font-mono">
                  <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">HOP 1: L1 MULE</span>
                  <span className="text-slate-500">T + 04:12</span>
                </div>
                <div className="text-xs font-bold text-white">Digital Prepaid Wallet</div>
                <div className="text-[11px] font-mono text-cyan-400">Paytm Wallet ··· 4029</div>
                <div className="text-sm font-extrabold font-mono text-amber-400">₹65,000.00</div>
                <div className="text-[10px] pt-1 border-t border-slate-900">
                  {isLienTriggered ? (
                    <span className="text-emerald-400 font-bold">● FROZEN VIA 1930 LIEN (₹65,000 SECURED)</span>
                  ) : (
                    <span className="text-amber-400">Held 4m before automated split into 2 streams</span>
                  )}
                </div>
              </div>

              {/* Hop 2: Level 2 Mule MSME Accounts */}
              <div className={`p-4 rounded-xl bg-slate-950 border transition-all space-y-2 relative ${
                isLienTriggered ? 'border-emerald-500/80 shadow-lg shadow-emerald-950/40' : 'border-rose-500/40'
              }`}>
                <div className="flex justify-between items-center text-[10px] font-mono">
                  <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold">HOP 2: L2 MULE</span>
                  <span className="text-slate-500">T + 12:45</span>
                </div>
                <div className="text-xs font-bold text-white">Shell Current Account</div>
                <div className="text-[11px] font-mono text-cyan-400">Canara Bank ··· 6192</div>
                <div className="text-sm font-extrabold font-mono text-slate-200">₹40,000 + ₹25,000</div>
                <div className="text-[10px] pt-1 border-t border-slate-900">
                  {isLienTriggered ? (
                    <span className="text-emerald-400 font-bold">● SECONDARY LIEN APPLIED</span>
                  ) : (
                    <span className="text-rose-400">Fraudulent MSME current account created with fake GST</span>
                  )}
                </div>
              </div>

              {/* Hop 3: Exfiltration Nexus */}
              <div className={`p-4 rounded-xl bg-slate-950 border transition-all space-y-2 relative ${
                isLienTriggered ? 'border-slate-800 opacity-60' : 'border-rose-600 bg-rose-950/20'
              }`}>
                <div className="flex justify-between items-center text-[10px] font-mono">
                  <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold">HOP 3: EXFILTRATION</span>
                  <span className="text-slate-500">T + 28:00</span>
                </div>
                <div className="text-xs font-bold text-white">Cardless ATM / P2P Crypto</div>
                <div className="text-[11px] font-mono text-cyan-400">Jamtara ATM Hub / Telegram</div>
                <div className="text-sm font-extrabold font-mono text-rose-400">
                  {isLienTriggered ? 'PREVENTED' : 'CASHED OUT'}
                </div>
                <div className="text-[10px] pt-1 border-t border-slate-900">
                  {isLienTriggered ? (
                    <span className="text-emerald-400">Withdrawal blocked by inter-bank freeze</span>
                  ) : (
                    <span className="text-rose-400">Converted to cash via roving mule networks</span>
                  )}
                </div>
              </div>
            </div>

            {/* Forensic Detail Breakdown */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <div className="font-bold text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                <span>Forensic Anatomy of the Attack: Zero-Amount Mandate Trap</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                In this simulated incident, the victim was tricked into scanning a QR code with parameter <code className="text-cyan-400 font-mono">am=0</code> under the false promise of receiving a power bill refund. The scammer masqueraded as an MSEDCL officer. Because the raw string contained an embedded mandate ID (<code className="text-cyan-400 font-mono">mode=02&recurrence=monthly</code>), entering the UPI PIN authorized an immediate first installment debit of ₹65,000, which instantly moved through the L1 and L2 mule accounts shown above.
              </p>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'upi-inspector' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Input & Presets */}
            <div className="lg:col-span-6 space-y-4">
              <div className="rounded-xl bg-slate-900 border border-slate-800 p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-semibold text-white flex items-center gap-2">
                    <QrCode className="w-4 h-4 text-cyan-400" />
                    <span>Raw UPI String / QR Payload Input</span>
                  </h3>
                  <span className="text-xs font-mono text-slate-400">URI Heuristic Engine</span>
                </div>

                <p className="text-xs text-slate-400 mb-3">
                  Paste any UPI payment link, QR code text (<code className="text-cyan-300">upi://pay?pa=...</code>), or direct VPA handle to detect deceptive collection traps and spoofed handles.
                </p>

                <textarea
                  value={upiInput}
                  onChange={(e) => setUpiInput(e.target.value)}
                  placeholder="e.g. upi://pay?pa=recipient@bank&pn=Merchant&am=500.00..."
                  rows={4}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
                />

                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    Supports NPCI UPI 2.0 specifications
                  </span>
                  <button
                    onClick={() => handleInspectUPI()}
                    className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-sm font-semibold rounded-lg transition-colors cursor-pointer"
                  >
                    Inspect Payload
                  </button>
                </div>
              </div>

              {/* Presets */}
              <div className="rounded-xl bg-slate-900/60 border border-slate-800/80 p-5">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                  1-Click Test Scenarios (Preset Attacks)
                </h4>
                <div className="space-y-2">
                  {PRESET_UPI_TESTS.map((test, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setUpiInput(test.payload);
                        handleInspectUPI(test.payload);
                      }}
                      className="w-full text-left p-3 rounded-lg bg-slate-950 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-900/90 transition-all flex items-center justify-between cursor-pointer group"
                    >
                      <div>
                        <div className="text-sm font-medium text-slate-200 group-hover:text-cyan-400 transition-colors">
                          {test.title}
                        </div>
                        <div className="text-xs font-mono text-slate-500 truncate max-w-md">
                          {test.payload}
                        </div>
                      </div>
                      <span className={`text-[11px] font-mono px-2 py-0.5 rounded border ${
                        test.tag === 'CRITICAL THREAT' || test.tag === 'COLLECT TRAP'
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                          : test.tag === 'PHISHING'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      }`}>
                        {test.tag}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Inspection Results */}
            <div className="lg:col-span-6 space-y-4">
              {inspectionResult ? (
                <div className="rounded-xl bg-slate-900 border border-slate-800 p-5 space-y-5">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                    <div>
                      <div className="text-xs font-mono text-slate-400 uppercase">Analysis Outcome</div>
                      <div className="text-lg font-bold text-white flex items-center gap-2">
                        <span>Risk Threat Score:</span>
                        <span className={`font-mono ${
                          inspectionResult.riskLevel === 'HIGH' ? 'text-rose-400' :
                          inspectionResult.riskLevel === 'MEDIUM' ? 'text-amber-400' : 'text-emerald-400'
                        }`}>
                          {inspectionResult.riskScore} / 100
                        </span>
                      </div>
                    </div>

                    <span className={`px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider border ${
                      inspectionResult.riskLevel === 'HIGH'
                        ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                        : inspectionResult.riskLevel === 'MEDIUM'
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                        : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                    }`}>
                      {inspectionResult.riskLevel} DANGER
                    </span>
                  </div>

                  {/* Collect Trap Warning Banner */}
                  {inspectionResult.isCollectTrap && (
                    <div className="p-4 rounded-lg bg-rose-950/60 border border-rose-600/60 flex items-start gap-3">
                      <Flame className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                      <div className="text-xs text-rose-200">
                        <div className="font-bold text-sm text-rose-300 mb-1">
                          COLLECT REQUEST TRAP DETECTED
                        </div>
                        This payload instructs the user to enter their UPI PIN to "receive" money. 
                        <strong> Golden Rule: You NEVER enter a PIN to receive funds.</strong>
                      </div>
                    </div>
                  )}

                  {/* Parsed UPI Parameters Grid */}
                  <div>
                    <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Parsed NPCI Parameters
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                      <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                        <span className="text-slate-500 block">Payee Address (pa):</span>
                        <span className="text-cyan-300 break-all">{inspectionResult.parsedParams.pa || 'N/A'}</span>
                      </div>
                      <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                        <span className="text-slate-500 block">Payee Name (pn):</span>
                        <span className="text-slate-200">{inspectionResult.parsedParams.pn || 'N/A'}</span>
                      </div>
                      <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                        <span className="text-slate-500 block">Requested Amount (am):</span>
                        <span className="text-slate-200">{inspectionResult.parsedParams.am ? `₹${inspectionResult.parsedParams.am}` : 'User Specified'}</span>
                      </div>
                      <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                        <span className="text-slate-500 block">Merchant Code (mc):</span>
                        <span className="text-slate-200">{inspectionResult.parsedParams.mc || 'None (Consumer Account)'}</span>
                      </div>
                    </div>
                    {inspectionResult.parsedParams.tn && (
                      <div className="mt-2 bg-slate-950 p-2.5 rounded border border-slate-800 text-xs font-mono">
                        <span className="text-slate-500 block">Transaction Note (tn):</span>
                        <span className="text-amber-300">{inspectionResult.parsedParams.tn}</span>
                      </div>
                    )}
                  </div>

                  {/* Flags list */}
                  <div>
                    <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Heuristic Red Flags ({inspectionResult.flags.length})
                    </h4>
                    {inspectionResult.flags.length > 0 ? (
                      <div className="space-y-2">
                        {inspectionResult.flags.map((flag, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-xs text-rose-300 bg-rose-950/20 border border-rose-900/40 p-2.5 rounded">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                            <span>{flag}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-emerald-400 bg-emerald-950/20 border border-emerald-900/40 p-2.5 rounded flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>No known heuristic fraud patterns detected in this payload.</span>
                      </div>
                    )}
                  </div>

                  {/* Recommendation & Log Alert button */}
                  <div className="p-4 rounded-lg bg-slate-950 border border-slate-800">
                    <div className="text-xs font-semibold text-slate-300 mb-1">Recommended Action:</div>
                    <p className="text-xs text-slate-400 leading-relaxed mb-3">
                      {inspectionResult.recommendedAction}
                    </p>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleLogUPIAlert}
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <ShieldAlert className="w-3.5 h-3.5" />
                        <span>Log to FinGuard Security Alerts</span>
                      </button>

                      {alertLoggedNotice && (
                        <span className="text-xs text-emerald-400 font-medium">
                          {alertLoggedNotice}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl bg-slate-900/40 border border-slate-800 p-8 text-center text-slate-500">
                  <QrCode className="w-12 h-12 mx-auto text-slate-700 mb-3" />
                  <p className="text-sm font-medium text-slate-400">No UPI Payload Inspected Yet</p>
                  <p className="text-xs mt-1">Select one of the 1-click test scenarios or paste a custom UPI URI above to inspect.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: Phishing & Social Engineering Simulation Lab */}
      {activeSubTab === 'scam-simulator' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Scenario Picker Sidebar */}
            <div className="lg:col-span-4 space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Active Threat Case Studies ({PHISHING_SCENARIOS.length})
              </h3>
              {PHISHING_SCENARIOS.map((scenario) => {
                const isSelected = selectedScenario.id === scenario.id;
                return (
                  <button
                    key={scenario.id}
                    onClick={() => setSelectedScenario(scenario)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-900 border-cyan-500/80 shadow-md shadow-cyan-950/20'
                        : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-mono text-cyan-400">{scenario.channel}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                        scenario.dangerLevel === 'CRITICAL'
                          ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                      }`}>
                        {scenario.dangerLevel}
                      </span>
                    </div>
                    <div className="text-sm font-semibold text-white mb-1">
                      {scenario.title}
                    </div>
                    <div className="text-xs text-slate-400 truncate">
                      {scenario.category}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Simulated Phone Display & Forensic Breakdown */}
            <div className="lg:col-span-8 space-y-4">
              {/* Phone Frame Simulator */}
              <div className="rounded-2xl bg-slate-950 border-2 border-slate-800 overflow-hidden shadow-2xl">
                {/* Phone Top Bar */}
                <div className="bg-slate-900 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
                      {selectedScenario.channel[0]}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>{selectedScenario.sender}</span>
                        <span className="text-[10px] font-normal px-1 rounded bg-slate-800 text-slate-400">
                          {selectedScenario.channel}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400">{selectedScenario.timestamp}</div>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowRedFlags(!showRedFlags)}
                    className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 px-2.5 py-1 rounded bg-cyan-950/60 border border-cyan-800/40 cursor-pointer"
                  >
                    {showRedFlags ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showRedFlags ? 'Hide Red Flags' : 'Reveal Red Flags'}</span>
                  </button>
                </div>

                {/* Message Bubble */}
                <div className="p-6 bg-gradient-to-b from-slate-950 to-slate-900/80 min-h-[160px] flex items-center justify-center">
                  <div className="max-w-lg w-full bg-slate-900 border border-slate-800 rounded-2xl rounded-tl-sm p-4 text-sm text-slate-200 leading-relaxed shadow-lg">
                    {selectedScenario.message}
                  </div>
                </div>

                {/* Forensic Analysis Details */}
                <div className="p-5 bg-slate-900/90 border-t border-slate-800 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                      <span className="text-slate-400 font-semibold block mb-1">Threat Classification:</span>
                      <span className="text-rose-400 font-mono">{selectedScenario.threatVector}</span>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                      <span className="text-slate-400 font-semibold block mb-1">Psychological Vector:</span>
                      <span className="text-amber-400">{selectedScenario.psychologicalTrigger}</span>
                    </div>
                  </div>

                  {showRedFlags && (
                    <div>
                      <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                        Forensic Red Flags Identified:
                      </h4>
                      <ul className="space-y-1.5 text-xs text-slate-300">
                        {selectedScenario.redFlags.map((flag, idx) => (
                          <li key={idx} className="flex items-start gap-2 bg-slate-950/60 p-2 rounded border border-slate-800/80">
                            <span className="text-rose-400 font-bold">⚠️</span>
                            <span>{flag}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="p-3 rounded-lg bg-cyan-950/40 border border-cyan-800/40 text-xs text-cyan-200">
                    <strong className="text-cyan-300">Safe Defense Protocol: </strong>
                    {selectedScenario.safeAction}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 3: Cyber FIR & Emergency Incident Generator */}
      {activeSubTab === 'fir-generator' && (
        <div className="space-y-6">
          {/* Emergency 1930 Callout */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-rose-950/80 via-slate-900 to-slate-900 border border-rose-600/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
                <PhoneCall className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>Golden Hour Rule: Call National Cyber Helpline 1930</span>
                </h3>
                <p className="text-xs text-slate-300">
                  Reporting financial fraud within 2 hours to <strong>1930</strong> allows the Indian Cyber Crime Coordination Centre (I4C) to trigger the emergency banking lien to freeze money before the scammer withdraws it at ATMs.
                </p>
              </div>
            </div>

            <a
              href="https://cybercrime.gov.in"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5 shrink-0"
            >
              <span>Visit cybercrime.gov.in</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Form & Live Generated Draft */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Form */}
            <div className="lg:col-span-5 rounded-xl bg-slate-900 border border-slate-800 p-5 space-y-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                <span>Incident Parameters</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">Complainant Full Name</label>
                  <input
                    type="text"
                    value={complaintForm.victimName}
                    onChange={(e) => setComplaintForm({ ...complaintForm, victimName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-slate-400 block mb-1">Contact Phone</label>
                    <input
                      type="text"
                      value={complaintForm.victimPhone}
                      onChange={(e) => setComplaintForm({ ...complaintForm, victimPhone: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Loss Amount (INR)</label>
                    <input
                      type="number"
                      value={complaintForm.financialLoss}
                      onChange={(e) => setComplaintForm({ ...complaintForm, financialLoss: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Fraud Channel / Platform</label>
                  <select
                    value={complaintForm.incidentChannel}
                    onChange={(e) => setComplaintForm({ ...complaintForm, incidentChannel: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200"
                  >
                    <option value="UPI Fraud / Fake QR Code">UPI Fraud / Fake QR Code</option>
                    <option value="Electricity Bill Disconnection APK Scam">Electricity Bill Disconnection APK Scam</option>
                    <option value="Telegram Work-from-Home Task Scam">Telegram Work-from-Home Task Scam</option>
                    <option value="NetBanking Phishing SMS">NetBanking Phishing SMS</option>
                    <option value="OLX / Marketplace QR Deceit">OLX / Marketplace QR Deceit</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Suspect Phone / UPI / Website</label>
                  <input
                    type="text"
                    value={complaintForm.suspectDetails}
                    onChange={(e) => setComplaintForm({ ...complaintForm, suspectDetails: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Transaction Ref (UTR / RRN)</label>
                  <input
                    type="text"
                    value={complaintForm.transactionRef}
                    onChange={(e) => setComplaintForm({ ...complaintForm, transactionRef: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Brief Description of What Happened</label>
                  <textarea
                    rows={3}
                    value={complaintForm.briefNarration}
                    onChange={(e) => setComplaintForm({ ...complaintForm, briefNarration: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200"
                  />
                </div>
              </div>

              {/* Emergency Bank SMS Codes Card */}
              <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400">
                <span className="font-semibold text-slate-300 block mb-1">Bank Emergency Card/Account Freeze Codes:</span>
                <p>• <strong>SBI:</strong> SMS <code>BLOCK</code> to 567676</p>
                <p>• <strong>HDFC:</strong> Call 1800 1600 or via NetBanking Insta-Block</p>
                <p>• <strong>ICICI:</strong> SMS <code>BLOCK [last 4 digits]</code> to 9215676766</p>
              </div>
            </div>

            {/* Generated Draft Preview */}
            <div className="lg:col-span-7 rounded-xl bg-slate-900 border border-slate-800 p-5 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-400" />
                    <span>Formatted Legal FIR Draft Preview (IT Act & IPC)</span>
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyComplaint}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{copiedDraft ? 'Copied!' : 'Copy'}</span>
                    </button>
                    <button
                      onClick={handleDownloadComplaint}
                      className="px-2.5 py-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-semibold rounded flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Download className="w-3 h-3" />
                      <span>Download .txt</span>
                    </button>
                  </div>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 font-mono text-[11px] leading-relaxed text-slate-300 max-h-[460px] overflow-y-auto whitespace-pre-wrap select-all">
                  {generateComplaintText()}
                </div>
              </div>

              <div className="text-xs text-slate-500 italic">
                * You can print this document directly or upload it to <strong>cybercrime.gov.in</strong> under the "Report Financial Fraud" category.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
