const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const OUTPUT_DIR = path.join(__dirname, 'public', 'screenshots');
const ROOT_OUTPUT_DIR = path.join(__dirname, '..', 'screenshots');

if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
if (!fs.existsSync(ROOT_OUTPUT_DIR)) fs.mkdirSync(ROOT_OUTPUT_DIR, { recursive: true });

async function run() {
  console.log('Launching browser via Edge...');
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,960'],
    defaultViewport: { width: 1440, height: 960 },
  });

  const page = await browser.newPage();

  console.log('Navigating to http://localhost:3000 ...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 2000));

  // 1. Overview screenshot
  const shot1 = path.join(OUTPUT_DIR, '01_dashboard_overview.png');
  await page.screenshot({ path: shot1, fullPage: false });
  fs.copyFileSync(shot1, path.join(ROOT_OUTPUT_DIR, '01_dashboard_overview.png'));
  console.log('Saved 01_dashboard_overview.png');

  // 2. Trigger micro-purchase scenario (Auto-captures < $50)
  console.log('Triggering auto-approval scenario...');
  const buttons = await page.$$('button');
  for (const btn of buttons) {
    const text = await page.evaluate((el) => el.innerText, btn);
    if (text.includes('Blue Bottle')) {
      await btn.click();
      break;
    }
  }

  // Wait for agent execution
  await new Promise((r) => setTimeout(r, 3500));
  const shot2 = path.join(OUTPUT_DIR, '02_autonomous_capture.png');
  await page.screenshot({ path: shot2, fullPage: false });
  fs.copyFileSync(shot2, path.join(ROOT_OUTPUT_DIR, '02_autonomous_capture.png'));
  console.log('Saved 02_autonomous_capture.png');

  // 3. Trigger high-value scenario (Human approval > $50)
  console.log('Triggering Human-in-the-loop escalation scenario...');
  const buttons2 = await page.$$('button');
  for (const btn of buttons2) {
    const text = await page.evaluate((el) => el.innerText, btn);
    if (text.includes('San Francisco')) {
      await btn.click();
      break;
    }
  }

  await new Promise((r) => setTimeout(r, 3500));
  const shot3 = path.join(OUTPUT_DIR, '03_human_in_the_loop_approval.png');
  await page.screenshot({ path: shot3, fullPage: false });
  fs.copyFileSync(shot3, path.join(ROOT_OUTPUT_DIR, '03_human_in_the_loop_approval.png'));
  console.log('Saved 03_human_in_the_loop_approval.png');

  await browser.close();
  console.log('All screenshots captured successfully!');
}

run().catch((err) => {
  console.error('Screenshot error:', err);
  process.exit(1);
});
