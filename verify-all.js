const puppeteer = require('puppeteer-core');
const path = require('path');

const BASE_URL = 'http://localhost:3000';
const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

let testsPassed = 0;
let testsFailed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    testsPassed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    testsFailed++;
  }
}

async function runApiTests() {
  console.log('\n--- 1. Testing REST API Endpoints ---');

  // Test 1.1: GET /api/policy
  console.log('Testing GET /api/policy:');
  const polRes = await fetch(`${BASE_URL}/api/policy`);
  assert(polRes.status === 200, 'GET /api/policy returns 200 OK');
  const policy = await polRes.json();
  assert(policy.maxAutoApproveLimit === 50, 'Default auto cap is $50.00');
  assert(Array.isArray(policy.allowedCategories), 'Allowed categories list is defined');

  // Test 1.2: POST /api/policy
  console.log('Testing POST /api/policy (updating slider limit):');
  const updatePolRes = await fetch(`${BASE_URL}/api/policy`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ maxAutoApproveLimit: 60 }),
  });
  assert(updatePolRes.status === 200, 'POST /api/policy returns 200 OK');
  const updatedPolicy = await updatePolRes.json();
  assert(updatedPolicy.maxAutoApproveLimit === 60, 'Updated auto cap to $60.00');

  // Reset back to 50
  await fetch(`${BASE_URL}/api/policy`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ maxAutoApproveLimit: 50, requireHumanApprovalAbove: 50 }),
  });

  // Test 1.3: POST /api/agent/procure (Auto-Approval Scenario)
  console.log('Testing POST /api/agent/procure (Micro-procurement under $50):');
  const autoRes = await fetch(`${BASE_URL}/api/agent/procure`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: 'Reorder 2 bags of Blue Bottle Espresso coffee beans under $40' }),
  });
  assert(autoRes.status === 200, 'POST /api/agent/procure returns 200 OK');
  const autoData = await autoRes.json();
  assert(autoData.success === true, 'Procurement agent succeeded');
  assert(autoData.evaluation.decision === 'AUTO_APPROVE', 'Guardrail evaluated as AUTO_APPROVE');
  assert(autoData.transaction.status === 'CAPTURED_AUTONOMOUSLY', 'Transaction status is CAPTURED_AUTONOMOUSLY');
  assert(Boolean(autoData.transaction.paypalOrderId), 'PayPal Order ID generated');
  assert(Boolean(autoData.transaction.paypalCaptureId), 'PayPal Capture ID generated via Vault token');
  assert(autoData.steps.length >= 5, 'Agent completed at least 5 reasoning pipeline steps');

  // Test 1.4: POST /api/agent/procure (High-Value Human-In-The-Loop Scenario)
  console.log('Testing POST /api/agent/procure (High-value travel over $50):');
  const hitlRes = await fetch(`${BASE_URL}/api/agent/procure`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: 'Book roundtrip airfare to San Francisco under $350' }),
  });
  assert(hitlRes.status === 200, 'POST /api/agent/procure returns 200 OK');
  const hitlData = await hitlRes.json();
  assert(hitlData.evaluation.decision === 'REQUIRE_HUMAN_APPROVAL', 'Guardrail flags REQUIRE_HUMAN_APPROVAL');
  assert(hitlData.transaction.status === 'PENDING_USER_APPROVAL', 'Transaction status is PENDING_USER_APPROVAL');
  assert(Boolean(hitlData.transaction.paypalOrderId), 'PayPal Order ID created for deferred capture');
  const pendingTxId = hitlData.transaction.id;

  // Test 1.5: POST /api/paypal/capture (User Approves the Pending Transaction)
  console.log('Testing POST /api/paypal/capture (Human 1-click authorization):');
  const capRes = await fetch(`${BASE_URL}/api/paypal/capture`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ transactionId: pendingTxId, action: 'APPROVE' }),
  });
  assert(capRes.status === 200, 'POST /api/paypal/capture returns 200 OK');
  const capData = await capRes.json();
  assert(capData.success === true, 'Capture endpoint returned success');
  assert(capData.transaction.status === 'USER_APPROVED', 'Transaction transitioned to USER_APPROVED');
  assert(Boolean(capData.transaction.paypalCaptureId), 'PayPal capture ID issued upon approval');

  // Test 1.6: POST /api/agent/procure (Malicious / Blocked Domain)
  console.log('Testing POST /api/agent/procure (Blocked merchant detection):');
  const blockRes = await fetch(`${BASE_URL}/api/agent/procure`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: 'Order 4K webcam from sketchy-deals-discount.xyz under $45' }),
  });
  const blockData = await blockRes.json();
  assert(blockData.success === true, 'Agent pipeline handled request');
  assert(
    blockData.evaluation.decision === 'REJECT' || blockData.evaluation.flags.includes('BLOCKED_MERCHANT'),
    'Merchant blocklist triggered rejection/flags'
  );

  // Test 1.7: GET /api/transactions (Audit Ledger)
  console.log('Testing GET /api/transactions (Audit Ledger):');
  const txListRes = await fetch(`${BASE_URL}/api/transactions`);
  assert(txListRes.status === 200, 'GET /api/transactions returns 200 OK');
  const txList = await txListRes.json();
  assert(Array.isArray(txList) && txList.length >= 3, 'Audit ledger contains recorded transactions');
}

async function runBrowserTests() {
  console.log('\n--- 2. Testing Browser UI & Real-Time Interaction ---');

  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  const consoleErrors = [];
  page.on('pageerror', (err) => consoleErrors.push(err.message));

  await page.goto(BASE_URL, { waitUntil: 'networkidle2' });

  // Check Title
  const title = await page.title();
  assert(title.includes('SovereignSpend'), `Page title contains 'SovereignSpend' (got: "${title}")`);

  // Check Author attribution
  const pageContent = await page.content();
  assert(pageContent.includes('Adarsh Panicker'), 'Author name "Adarsh Panicker" is rendered in UI');

  // Check Logo
  const logoExists = await page.$('img[alt="SovereignSpend Logo"]');
  assert(logoExists !== null, 'Logo element is present in header');

  // Check PayPal Sandbox badge
  assert(pageContent.includes('PayPal Sandbox Connected'), 'PayPal Sandbox Connected status pill is rendered');

  // Check Slider
  const slider = await page.$('input[type="range"]');
  assert(slider !== null, 'Auto-spend limit slider input is rendered');

  // Check no unhandled JS errors on load
  assert(consoleErrors.length === 0, `Zero client-side uncaught JS exceptions (found ${consoleErrors.length})`);

  await browser.close();
}

async function main() {
  console.log('==================================================');
  console.log('   SovereignSpend Comprehensive Verification Suite');
  console.log('==================================================');

  await runApiTests();
  await runBrowserTests();

  console.log('\n==================================================');
  console.log(`TEST SUMMARY: ${testsPassed} PASSED, ${testsFailed} FAILED`);
  console.log('==================================================');

  if (testsFailed > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
