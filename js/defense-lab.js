document.addEventListener("DOMContentLoaded", () => {
    const user = requireUser();
    if (!user) return;

    // Tabs
    const btnTabUpi = document.getElementById("btnTabUpi");
    const btnTabSim = document.getElementById("btnTabSim");
    const btnTabFir = document.getElementById("btnTabFir");
    const btnTabMule = document.getElementById("btnTabMule");

    const sectionUpi = document.getElementById("sectionUpi");
    const sectionSim = document.getElementById("sectionSim");
    const sectionFir = document.getElementById("sectionFir");
    const sectionMule = document.getElementById("sectionMule");

    function switchTab(activeBtn, activeSection) {
        [btnTabUpi, btnTabSim, btnTabFir, btnTabMule].filter(Boolean).forEach(b => {
            b.style.background = "#1e293b";
            b.style.color = "#94a3b8";
            b.style.fontWeight = "normal";
        });
        [sectionUpi, sectionSim, sectionFir, sectionMule].filter(Boolean).forEach(s => s.style.display = "none");

        activeBtn.style.background = "#0284c7";
        activeBtn.style.color = "#fff";
        activeBtn.style.fontWeight = "bold";
        activeSection.style.display = activeSection === sectionMule ? "flex" : "grid";
    }

    if (btnTabUpi) btnTabUpi.addEventListener("click", () => switchTab(btnTabUpi, sectionUpi));
    if (btnTabSim) btnTabSim.addEventListener("click", () => switchTab(btnTabSim, sectionSim));
    if (btnTabFir) btnTabFir.addEventListener("click", () => switchTab(btnTabFir, sectionFir));
    if (btnTabMule) btnTabMule.addEventListener("click", () => switchTab(btnTabMule, sectionMule));

    // Mule Section: Inter-Bank Lien Freeze Simulation
    const btnTriggerLien = document.getElementById("btnTriggerLien");
    const hop1Status = document.getElementById("hop1Status");
    const hop2Status = document.getElementById("hop2Status");
    const hop3Amount = document.getElementById("hop3Amount");
    const hop3Status = document.getElementById("hop3Status");
    const muleHop1 = document.getElementById("muleHop1");
    const muleHop2 = document.getElementById("muleHop2");

    let isLienActive = false;
    if (btnTriggerLien) {
        btnTriggerLien.addEventListener("click", () => {
            isLienActive = !isLienActive;
            if (isLienActive) {
                btnTriggerLien.textContent = "Lien Active: ₹65,000 Preserved";
                btnTriggerLien.style.background = "#10b981";
                if (hop1Status) hop1Status.innerHTML = "<strong style='color:#10b981;'>● FROZEN VIA 1930 LIEN</strong>";
                if (hop2Status) hop2Status.innerHTML = "<strong style='color:#10b981;'>● SECONDARY LIEN APPLIED</strong>";
                if (hop3Amount) { hop3Amount.textContent = "PREVENTED"; hop3Amount.style.color = "#10b981"; }
                if (hop3Status) hop3Status.textContent = "Withdrawal blocked by inter-bank freeze";
                if (muleHop1) muleHop1.style.borderColor = "#10b981";
                if (muleHop2) muleHop2.style.borderColor = "#10b981";
            } else {
                btnTriggerLien.textContent = "Simulate 1930 Inter-Bank Lien Freeze";
                btnTriggerLien.style.background = "#e11d48";
                if (hop1Status) hop1Status.textContent = "Held 4m before split";
                if (hop2Status) hop2Status.textContent = "Fake GST shell account";
                if (hop3Amount) { hop3Amount.textContent = "CASHED OUT"; hop3Amount.style.color = "#f43f5e"; }
                if (hop3Status) hop3Status.textContent = "Cardless cashout nexus";
                if (muleHop1) muleHop1.style.borderColor = "#eab308";
                if (muleHop2) muleHop2.style.borderColor = "#e11d48";
            }
        });
    }

    // --- Section 1: UPI Inspector ---
    const upiInput = document.getElementById("upiInput");
    const btnInspectUpi = document.getElementById("btnInspectUpi");
    const upiOutcome = document.getElementById("upiOutcome");
    const upiAlertAction = document.getElementById("upiAlertAction");
    const btnSaveUpiAlert = document.getElementById("btnSaveUpiAlert");
    const upiAlertNotice = document.getElementById("upiAlertNotice");

    let lastInspectionData = null;

    function runInspection(text) {
        const input = (text || upiInput.value).trim();
        if (!input) return;

        let pa = "", pn = "", am = "", tn = "", mc = "";
        if (input.startsWith("upi://") || input.includes("?")) {
            try {
                const queryIndex = input.indexOf("?");
                const queryString = queryIndex !== -1 ? input.slice(queryIndex + 1) : input;
                const params = new URLSearchParams(queryString);
                pa = params.get("pa") || "";
                pn = params.get("pn") || "";
                am = params.get("am") || "";
                tn = params.get("tn") || "";
                mc = params.get("mc") || "";
            } catch (e) {
                pa = input;
            }
        } else {
            pa = input;
        }

        const flags = [];
        let riskScore = 15;
        const lower = (input + " " + tn + " " + pn + " " + pa).toLowerCase();

        if (lower.includes("enter pin") || lower.includes("receive") || lower.includes("pin to receive")) {
            flags.push("CRITICAL: Reversed UPI PIN Collect Request Trap (PIN never needed to receive money)");
            riskScore += 50;
        }

        const susWords = ["refund", "lottery", "cashback", "kyc", "bijli", "fine", "bonus", "officer"];
        const found = susWords.filter(w => lower.includes(w));
        if (found.length > 0) {
            flags.push(`Suspicious Trigger Term(s): ${found.join(", ").toUpperCase()}`);
            riskScore += 25;
        }

        const consumerPSPs = ["@ybl", "@paytm", "@okaxis", "@okhdfcbank", "@oksbi"];
        const isOfficial = ["msedcl", "power", "amazon", "flipkart", "police", "customs"].some(n => lower.includes(n));
        const isConsumer = consumerPSPs.some(psp => pa.toLowerCase().endsWith(psp));

        if (isOfficial && isConsumer) {
            flags.push("Consumer VPA masquerading as Corporate / Utility Entity");
            riskScore += 30;
        }

        const level = riskScore >= 60 ? "HIGH" : riskScore >= 35 ? "MEDIUM" : "LOW";
        const levelColor = level === "HIGH" ? "#f43f5e" : level === "MEDIUM" ? "#f59e0b" : "#10b981";

        lastInspectionData = { pa, pn, am, tn, mc, riskScore: Math.min(riskScore, 100), level, flags };

        upiOutcome.innerHTML = `
            <div style="padding:12px;border-radius:8px;background:#0f172a;border:1px solid #334155;margin-bottom:12px;">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <span style="font-weight:bold;color:${levelColor};font-size:14px;">Risk Threat Score: ${lastInspectionData.riskScore} / 100 (${level})</span>
                </div>
                <div style="font-size:12px;margin-top:8px;font-family:monospace;color:#94a3b8;">
                    <div><strong>Payee Address (pa):</strong> <span style="color:#38bdf8;">${pa || "N/A"}</span></div>
                    <div><strong>Payee Name (pn):</strong> ${pn || "N/A"}</div>
                    <div><strong>Amount (am):</strong> ${am ? "₹" + am : "Open"}</div>
                    <div><strong>Note (tn):</strong> ${tn || "N/A"}</div>
                </div>
            </div>
            <div>
                <strong style="color:#f8fafc;font-size:12px;">Identified Flags:</strong>
                <ul style="padding-left:18px;margin:6px 0;font-size:12px;color:#fca5a5;">
                    ${flags.length > 0 ? flags.map(f => `<li>${f}</li>`).join("") : `<li style="color:#34d399;">No malicious heuristic patterns detected.</li>`}
                </ul>
            </div>
        `;

        upiAlertAction.style.display = "block";
    }

    btnInspectUpi.addEventListener("click", () => runInspection());

    document.querySelectorAll(".presetBtn").forEach(btn => {
        btn.addEventListener("click", () => {
            const val = btn.dataset.val;
            upiInput.value = val;
            runInspection(val);
        });
    });

    btnSaveUpiAlert.addEventListener("click", async () => {
        if (!lastInspectionData) return;
        try {
            await api("/api/security-alerts", {
                method: "POST",
                body: JSON.stringify({
                    user_id: user.user_id,
                    alert_type: "UPI_PAYLOAD_WARNING",
                    severity: lastInspectionData.level,
                    details: `Scanned Payee: ${lastInspectionData.pa} | Risk Score: ${lastInspectionData.riskScore}/100 | Flags: ${lastInspectionData.flags.join("; ")}`
                })
            });
            upiAlertNotice.textContent = "✓ Logged to security alerts!";
            setTimeout(() => { upiAlertNotice.textContent = ""; }, 3000);
        } catch (e) {
            upiAlertNotice.textContent = e.message;
        }
    });

    // Run first inspection
    runInspection();

    // --- Section 2: Simulator ---
    const SIM_DATA = {
        electricity: {
            title: "Urgent Electricity Power Disconnection (.APK Drop)",
            sender: "VM-BIJLI",
            text: "Dear Consumer, Your Electricity power will be disconnected tonight at 9:30 PM from the electricity office because your previous month bill was not updated. Immediately contact our electricity officer Mr. Sharma at 98765-43210 and install official update helper: http://bijli-bill-update.online/msedcl_v3.apk",
            vector: "Malicious Remote Access Trojan (.apk) + Artificial Urgency (45 min deadline)",
            action: "Discoms provide 15-day statutory notices before disconnection. Never install .apk files received outside Google Play Store."
        },
        telegram: {
            title: "Telegram Work-From-Home Task Scam",
            sender: "+91 88392 10928",
            text: "Hello! I am Priya from Global Digital Media HR. We have part-time remote work. Just like 3 YouTube videos and screenshot to earn ₹150 instantly. Daily payout up to ₹3,500! Join our Telegram VIP Task Group: t.me/VIP_Global_Tasks",
            vector: "Advance Fee Ponzi Scheme. Pays initial ₹150 to gain trust, then locks funds behind ₹10,000 'VIP Task' deposits.",
            action: "Never transfer money to unlock employment salaries or commissions."
        },
        kyc: {
            title: "Bank Account Suspension / PAN-KYC Phishing",
            sender: "CP-SBIBNK",
            text: "Dear Customer, Your SBI Bank account has been BLOCKED due to non-update of mandatory PAN card. To unblock immediately within 24 hours, click to verify your Aadhaar: https://sbi-pan-kyc-verification.top/auth",
            vector: "Web Credential Harvesting. Steals NetBanking Username, Password, and real-time SMS OTP.",
            action: "Banks never request credentials via SMS. Visit your local branch or official bank app directly."
        },
        olx: {
            title: "Marketplace 'Scan QR to Receive Money' Fraud",
            sender: "Col. Rajesh Kumar (Buyer)",
            text: "I am an Army officer buying your item for ₹12,000. I have generated an official Army UPI Merchant QR code. Scan this QR on Google Pay and enter your 6-digit UPI PIN to credit ₹12,000 immediately.",
            vector: "UPI Reverse Collect Deceit. Entering your PIN approves an outgoing payment of ₹12,000.",
            action: "Golden Rule: UPI PIN is ONLY entered to SEND money, NEVER to receive money."
        }
    };

    const simDetailCard = document.getElementById("simDetailCard");

    function renderSim(key) {
        const item = SIM_DATA[key];
        simDetailCard.innerHTML = `
            <h3>${item.title}</h3>
            <div style="background:#0f172a;border:1px solid #334155;border-radius:8px;padding:14px;margin:14px 0;">
                <div style="font-size:11px;color:#94a3b8;margin-bottom:6px;">Sender: <strong>${item.sender}</strong></div>
                <div style="font-size:13px;color:#f8fafc;line-height:1.5;">${item.text}</div>
            </div>
            <div style="font-size:12px;color:#cbd5e1;line-height:1.6;">
                <div><strong style="color:#f43f5e;">Threat Vector:</strong> ${item.vector}</div>
                <div style="margin-top:8px;"><strong style="color:#38bdf8;">Safe Defense Rule:</strong> ${item.action}</div>
            </div>
        `;
    }

    document.querySelectorAll(".simBtn").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".simBtn").forEach(b => {
                b.style.background = "#0f172a";
                b.style.color = "#94a3b8";
                b.style.border = "1px solid #334155";
            });
            btn.style.background = "#0284c7";
            btn.style.color = "#fff";
            btn.style.border = "none";
            renderSim(btn.dataset.id);
        });
    });

    renderSim("electricity");

    // --- Section 3: FIR Generator ---
    const firName = document.getElementById("firName");
    const firPhone = document.getElementById("firPhone");
    const firLoss = document.getElementById("firLoss");
    const firSuspect = document.getElementById("firSuspect");
    const firNotes = document.getElementById("firNotes");
    const firDraft = document.getElementById("firDraft");
    const btnGenerateFir = document.getElementById("btnGenerateFir");
    const btnCopyFir = document.getElementById("btnCopyFir");

    if (user) {
        firName.value = user.name;
        firPhone.value = user.phone;
    }

    function buildFirText() {
        return `FORMAL CYBER CRIME COMPLAINT (NATIONAL HELPLINE 1930 / CYBERCRIME.GOV.IN)
DATE: ${new Date().toLocaleDateString('en-IN', { dateStyle: 'full' })}

TO:
The Officer-in-Charge, Cyber Crime Police Station / I4C National Portal
Reference: Information Technology Act, 2000 (Section 66D) & IPC Section 420.

1. COMPLAINANT:
- Name: ${firName.value}
- Phone: ${firPhone.value}

2. INCIDENT PARTICULARS:
- Disputed Loss: INR ${firLoss.value}
- Suspect Identifiers: ${firSuspect.value}

3. STATEMENT OF FACTS:
${firNotes.value}

4. LEGAL PROVISIONS APPLICABLE:
- Section 66D, IT Act 2000 (Cheating by personation using computer resource)
- Section 420, Indian Penal Code (Cheating & dishonest inducement)

5. PRAYER:
Kindly trigger an emergency lien on the recipient bank/UPI handle via the 1930 nodal network and register an FIR.

Sincerely,
${firName.value}
Generated via FinGuard Defense Engine`;
    }

    function updateFir() {
        firDraft.textContent = buildFirText();
    }

    btnGenerateFir.addEventListener("click", updateFir);
    btnCopyFir.addEventListener("click", () => {
        navigator.clipboard.writeText(firDraft.textContent);
        btnCopyFir.textContent = "Copied!";
        setTimeout(() => { btnCopyFir.textContent = "Copy Text"; }, 2000);
    });

    updateFir();
});
