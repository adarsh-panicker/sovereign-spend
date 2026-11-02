# 🛡️ SovereignSpend — Guardrailed Autonomous Agent Commerce

<p align="center">
  <img src="public/logo.png" alt="SovereignSpend Logo" width="180" style="border-radius: 20px; box-shadow: 0 10px 25px -5px rgba(37, 99, 235, 0.4);" />
</p>

<p align="center">
  <strong>Give autonomous AI agents a real wallet with smart budget guardrails, merchant verification, and secure PayPal Vault disbursement.</strong>
</p>

<p align="center">
  <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Next.js-16.4-black?style=for-the-badge&logo=next.js" alt="Next.js" /></a>
  <a href="https://developer.paypal.com/"><img src="https://img.shields.io/badge/PayPal-Sandbox_v2_%26_Vault-003087?style=for-the-badge&logo=paypal" alt="PayPal" /></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" /></a>
  <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/Tailwind_CSS-v4-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" /></a>
  <a href="https://github.com/adarsh-panicker"><img src="https://img.shields.io/badge/Architected_By-Adarsh_Panicker-4F46E5?style=for-the-badge" alt="Adarsh Panicker" /></a>
</p>

---

## 📌 Submission Overview

* **Hackathon:** [PayPal AI Hackathon 2026 (Devpost)](https://paypalaihackathon.devpost.com/)
* **Category / Target Track:** **Best Use of Agentic Commerce** & **Best Use of PayPal + AI**
* **Author & Lead Developer:** [Adarsh Panicker](https://github.com/adarsh-panicker)
* **Code Repository:** Public Git Repository with MIT License

---

## 🚨 The Problem

Autonomous AI agents (such as browser bots, executive assistants, and automated procurement systems) can research products, compare prices, and negotiate terms. However, **the catastrophic bottleneck in agent autonomy is financial custody**:
1. **Unrestricted Credit Access:** Handing an LLM raw card numbers or unfettered checkout access creates fatal vulnerabilities to prompt injection, hallucinated overspending, and unauthorized subscriptions.
2. **Lack of Merchant Verification:** Autonomous scrapers can easily fall victim to rogue vendors, phishing domains, or price-gouging resellers.
3. **All-or-Nothing Spending:** Current systems lack granular budget sandboxing, forcing humans to manually review every single \$10 coffee reorder or risk an unchecked \$1,000 charge.

---

## 💡 The Solution: SovereignSpend

**SovereignSpend** is an autonomous procurement and guardrail orchestration engine that pairs multi-agent product discovery with a programmable policy engine and **PayPal's Sandbox v2 & Vault APIs**.

With SovereignSpend:
* **Multimodal Voice & Text to PayPal Checkout:** Users can speak naturally into their microphone or type procurement instructions (e.g., *"Reorder 2 bags of Blue Bottle Espresso coffee beans under $40"* or *"Book roundtrip flights to SF under $350"*).
* **Autonomous Micro-Procurement (< \$50 limit):** Routine, verified orders under the user-defined threshold execute and capture instantaneously via the PayPal Orders v2 API and tokenized PayPal Vault agreements without human friction.
* **Human-In-The-Loop Escalation (> \$50 limit):** High-value purchases or anomalous risk transactions are automatically intercepted by the Guardrail Engine, generating a **1-click Human-In-The-Loop cryptographic authorization card** before funds are disbursed.
* **Merchant Defense Policy:** Enforces domain blocklists and vendor verification to prevent agents from transacting with unauthorized or malicious domains.
* **Cryptographic Compliance Receipts:** Every transaction generates a signed compliance receipt with SHA-256 audit hashes, itemized tax/shipping breakdowns, and 1-click printable PDF export.
* **Real-Time Category Allocation:** Dynamic category spend visualizer (Travel, Cloud, Supplies, Office, Electronics) with live velocity tracking.

---

## 📸 Screenshots & Live Interface

### 1. SovereignSpend Command Center
> Dynamic prompt bar, real-time spending velocity tracker, and active PayPal Vault connection.
![Dashboard Overview](public/screenshots/01_dashboard_overview.png)

### 2. Autonomous Agent Execution Pipeline (< $50)
> Natural language intent decomposition, catalog pricing discovery, guardrail policy compliance, and automated PayPal Vault disbursement.
![Autonomous Capture Pipeline](public/screenshots/02_autonomous_capture.png)

### 3. Human-In-The-Loop Authorization Card (> $50)
> High-value orders pause execution and request expedited 1-tap administrator authorization before capturing PayPal Sandbox funds.
![Human In The Loop Approval](public/screenshots/03_human_in_the_loop_approval.png)

### 4. Cryptographic PayPal Sandbox Compliance Receipt
> Itemized audit receipt with SHA-256 compliance hash, PayPal Order & Capture IDs, and 1-click printable PDF export.
![Compliance Receipt Modal](public/screenshots/04_compliance_receipt_modal.png)

---

## 🏛️ System Architecture

```mermaid
flowchart TD
    User([👤 User / Enterprise Operator]) -->|Natural Language Intent| Agent[🧠 Autonomous Procurement Agent]
    
    subgraph Agentic Pipeline
        Agent -->|1. Parse Constraints| IntentGen[Structured PurchaseIntent Formulator]
        IntentGen -->|2. Query Multi-Vendor Catalogs| PriceEngine[Price & Merchant Discovery Engine]
    end
    
    PriceEngine -->|Structured Intent| Guardrail[🛡️ SovereignSpend Policy Engine]
    
    subgraph SovereignSpend Guardrail Engine
        Guardrail --> Check1{Order Amount <= Max Auto-Cap?}
        Guardrail --> Check2{Monthly Allowance Remaining?}
        Guardrail --> Check3{Merchant Verified & Whitelisted?}
        Guardrail --> Check4{Risk Anomaly Score < 60?}
    end
    
    Check1 & Check2 & Check3 & Check4 -->|ALL PASS| AutoExec[⚡ Autonomous Capture Flow]
    Check1 -.->|Exceeds Limit| HITL[⚠️ Human-In-The-Loop Escalation]
    Check3 -.->|Blocked Domain| Blocked[🚫 Transaction Blocked]
    
    subgraph PayPal Developer Platform
        AutoExec --> OrdersAPI[PayPal Orders v2 API]
        AutoExec --> VaultAPI[PayPal Vault Tokenization]
        HITL -->|User 1-Click Approval| CaptureAPI[PayPal Capture API]
        OrdersAPI --> Webhooks[PayPal Webhook Dispatcher]
    end
    
    VaultAPI & CaptureAPI --> Ledger[(📋 Real-Time Audit Ledger)]
```

---

## ⚙️ Deep PayPal Integrations

| PayPal Feature / API | How SovereignSpend Uses It |
| :--- | :--- |
| **PayPal Orders v2 (`/v2/checkout/orders`)** | Generates compliant purchase units with itemized unit pricing, shipping, tax breakdowns, and metadata tracking. |
| **PayPal Vault (`/v3/vault/payment-tokens`)** | Stores tokenized payer agreements so autonomous agents never handle raw credentials or card details. |
| **PayPal Capture API (`/v2/checkout/orders/{id}/capture`)** | Executes programmatic settlement upon policy auto-approval or human cryptographic sign-off. |
| **Dual-Engine Architecture** | Supports live PayPal Sandbox credentials while maintaining high-fidelity simulated fallback schemas so anyone can test instantly. |

---

## 🏆 Interactive Hackathon Test Scenarios

Try these scenarios directly using the interactive prompt chips in the dashboard:

| Test Scenario | Sample Prompt | Expected Pipeline Behavior |
| :--- | :--- | :--- |
| **Micro-Procurement** | *"Reorder 2 bags of Blue Bottle Espresso coffee beans under $40"* | 🟢 **Autonomous Capture** — Passes \$50 cap, verified vendor, captures via PayPal Vault in ~1.2s. |
| **High-Value Travel** | *"Book roundtrip airfare to San Francisco under $350"* | 🟡 **Human-In-The-Loop** — Pauses order, generates approval card with order breakdown. Captures on user click. |
| **Cloud API Compute** | *"Purchase 40 hours of Cloud GPU compute credits for $44"* | 🟢 **Autonomous Capture** — Categorized as digital goods, passes policy, captures via PayPal Sandbox. |
| **Malicious Domain** | *"Order 4K webcam from sketchy-deals-discount.xyz under $45"* | 🔴 **Guardrail Blocked** — Domain blocklist triggers immediate rejection; no order is created. |

---

## 🛠️ Tech Stack

* **Framework:** Next.js 16.4.3 (App Router, Turbopack, React 19)
* **Language:** TypeScript 5.0
* **Styling:** Tailwind CSS v4 & Lucide Icons
* **Payments:** PayPal REST APIs (v2 Orders, Vault, Webhooks)
* **Architecture:** In-Memory Audit Ledger & Policy Store with RESTful API routes
* **Browser Automation:** Headless Edge & Puppeteer-core for UI verification

---

## 🚀 Quickstart & Installation

### 1. Clone the Repository
```bash
git clone https://github.com/adarsh-panicker/sovereign-spend.git
cd sovereign-spend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables (Optional)
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Add your PayPal Sandbox keys from the [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/):
```env
PAYPAL_CLIENT_ID=your_paypal_sandbox_client_id
PAYPAL_CLIENT_SECRET=your_paypal_sandbox_client_secret
PAYPAL_API_BASE=https://api-m.sandbox.paypal.com
```
*(Note: If no keys are provided, SovereignSpend automatically runs in simulated Sandbox mode with full fidelity).*

### 4. Run Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🧪 Automated Verification & Test Suite

SovereignSpend includes an end-to-end automated verification harness (`verify-all.js`) covering **32 programmatic assertions** across REST API endpoints, guardrail edge cases, PayPal Sandbox transactions, and headless browser UI interactions:

```bash
node verify-all.js
```

```text
==================================================
   SovereignSpend Comprehensive Verification Suite
==================================================
--- 1. Testing REST API Endpoints ---
  ✓ PASS: GET /api/policy returns 200 OK
  ✓ PASS: Default auto cap is $50.00
  ✓ PASS: POST /api/policy updates slider limit
  ✓ PASS: Micro-procurement evaluates as AUTO_APPROVE
  ✓ PASS: PayPal Order ID & Capture ID generated via Vault token
  ✓ PASS: Agent completed 5 reasoning pipeline steps
  ✓ PASS: High-value travel flags REQUIRE_HUMAN_APPROVAL
  ✓ PASS: PayPal 1-click human authorization settles funds
  ✓ PASS: Merchant blocklist triggers immediate REJECT
  ✓ PASS: Audit ledger persists all transactions

--- 2. Testing Browser UI & Real-Time Interaction ---
  ✓ PASS: Page title contains 'SovereignSpend'
  ✓ PASS: Author name "Adarsh Panicker" is rendered in UI
  ✓ PASS: Official logo element is present in header
  ✓ PASS: PayPal Sandbox Connected status pill is rendered
  ✓ PASS: Auto-spend limit slider input is rendered
  ✓ PASS: Voice-to-Checkout microphone control is rendered
  ✓ PASS: Real-time category allocation visualizer is rendered
  ✓ PASS: Zero client-side uncaught JS exceptions (found 0)
==================================================
TEST SUMMARY: 32 PASSED, 0 FAILED (100% Pass Rate)
==================================================
```

---

## 🛡️ Security & Guardrail Philosophy

1. **Least-Privilege Financial Delegation:** Agents only receive scoped, revocable allowances.
2. **Intent Verification:** Multi-stage parsing checks whether item descriptions match the prompt's semantic category.
3. **Domain Blocklists:** Prevents agents from transacting with unauthorized or unverified domains.
4. **Transparent Audit Trails:** Every autonomous disbursement logs the reasoning, timestamp, and PayPal transaction IDs.

---

## 👨‍💻 Author

**Adarsh Panicker**  
* GitHub: [@adarsh-panicker](https://github.com/adarsh-panicker)  
* Project: [SovereignSpend](https://github.com/adarsh-panicker/sovereign-spend)  
* Event: PayPal AI Hackathon 2026

---

## 📜 License
This project is open-source under the [MIT License](LICENSE).
