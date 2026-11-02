import { PurchaseIntent, AgentStep } from '@/types';

interface AgentExecutionResult {
  intent: PurchaseIntent;
  steps: AgentStep[];
}

/**
 * Parses user prompt and generates realistic purchase intent and reasoning steps.
 */
export async function executeProcurementAgent(prompt: string): Promise<AgentExecutionResult> {
  const steps: AgentStep[] = [];
  const startTime = Date.now();

  // Step 1: Parse Intent & Extract Requirements
  steps.push({
    id: 'step-1',
    title: 'Deconstructing Natural Language Intent',
    description: `Analyzed prompt: "${prompt}". Extracted product semantics, constraints, and budget expectations.`,
    status: 'completed',
    timestamp: new Date(startTime).toLocaleTimeString(),
  });

  // Step 2: Multi-vendor Search & Price Optimization
  steps.push({
    id: 'step-2',
    title: 'Autonomous Merchant & Price Discovery',
    description: 'Queried verified merchant catalogs (Amazon Business, Best Buy, Direct Brand, Delta, Newegg) for matching specifications.',
    status: 'completed',
    timestamp: new Date(startTime + 600).toLocaleTimeString(),
  });

  const lower = prompt.toLowerCase();
  let itemTitle = 'Product Procurement';
  let category: PurchaseIntent['category'] = 'supplies';
  let merchant = 'Amazon Business';
  let unitPrice = 24.99;
  let quantity = 1;
  let shipping = 0;
  let estimatedTax = 2.0;
  let riskScore = 15;
  let reasoning = 'Selected best-rated vendor offering competitive pricing with verified PayPal Merchant status.';

  if (lower.includes('coffee') || lower.includes('beans') || lower.includes('snack')) {
    itemTitle = 'Organic Whole Bean Espresso Roast (2 lbs)';
    category = 'supplies';
    merchant = 'Blue Bottle Coffee Co.';
    unitPrice = 18.5;
    quantity = lower.includes('2') ? 2 : 1;
    shipping = 0.0;
    estimatedTax = 2.59;
    riskScore = 12;
    reasoning = 'Matched requested coffee roast from verified direct supplier. Free 2-day delivery applied.';
  } else if (lower.includes('flight') || lower.includes('travel') || lower.includes('ticket') || lower.includes('hotel') || lower.includes('sf') || lower.includes('san francisco')) {
    itemTitle = 'Roundtrip Airfare: Austin (AUS) to San Francisco (SFO)';
    category = 'travel';
    merchant = 'United Airlines via TravelDesk';
    unitPrice = 328.4;
    quantity = 1;
    shipping = 0.0;
    estimatedTax = 24.6;
    riskScore = 48; // Higher value trigger
    reasoning = 'Located lowest non-stop economy itinerary within requested Friday arrival constraints.';
  } else if (lower.includes('webcam') || lower.includes('camera') || lower.includes('headphone') || lower.includes('cable') || lower.includes('keyboard') || lower.includes('monitor')) {
    itemTitle = lower.includes('webcam') ? 'Logitech Brio 4K Ultra HD Pro Webcam' : 'Anker Braided High-Speed HDMI 2.1 Cable (Pack of 2)';
    category = 'electronics';
    merchant = 'Best Buy Enterprise';
    unitPrice = lower.includes('webcam') ? 129.99 : 16.99;
    quantity = 1;
    shipping = 0.0;
    estimatedTax = unitPrice * 0.0825;
    riskScore = lower.includes('webcam') ? 35 : 10;
    reasoning = 'Verified official manufacturer warranty, high merchant trust rating, and immediate dispatch availability.';
  } else if (lower.includes('cloud') || lower.includes('api') || lower.includes('compute') || lower.includes('server') || lower.includes('aws')) {
    itemTitle = 'Cloud GPU Compute Credits (40 hrs On-Demand H100)';
    category = 'cloud';
    merchant = 'Lambda Labs / Cloud Marketplace';
    unitPrice = 44.0;
    quantity = 1;
    shipping = 0.0;
    estimatedTax = 0.0;
    riskScore = 20;
    reasoning = 'On-demand API compute budget allocation for autonomous development environment.';
  } else {
    // General match from prompt
    const priceMatch = prompt.match(/\$(\d+(\.\d{1,2})?)/);
    if (priceMatch) {
      unitPrice = parseFloat(priceMatch[1]) * 0.85; // discount deal
    }
    itemTitle = prompt.slice(0, 48) || 'Office Supplies Reorder';
    merchant = 'Enterprise Supply Direct';
    estimatedTax = Number((unitPrice * 0.08).toFixed(2));
    riskScore = 25;
  }

  // Calculate totals
  const totalAmount = Number((unitPrice * quantity + shipping + estimatedTax).toFixed(2));

  // Step 3: Guardrail verification preparation
  steps.push({
    id: 'step-3',
    title: 'Formulating Structured Purchase Intent',
    description: `Constructed PurchaseIntent #PI-${Math.floor(1000 + Math.random() * 9000)}: Total $${totalAmount.toFixed(2)} with itemized tax and shipping.`,
    status: 'completed',
    timestamp: new Date(startTime + 1200).toLocaleTimeString(),
    metadata: { totalAmount, merchant, category },
  });

  const intent: PurchaseIntent = {
    id: `PI-${Date.now().toString(36).toUpperCase()}`,
    itemTitle,
    category,
    merchant,
    merchantVerified: true,
    unitPrice,
    quantity,
    estimatedTax,
    shipping,
    totalAmount,
    currency: 'USD',
    reasoning,
    riskScore,
    sourceUrl: `https://${merchant.toLowerCase().replace(/[^a-z0-9]/g, '')}.com/items/${encodeURIComponent(itemTitle)}`,
  };

  return { intent, steps };
}
