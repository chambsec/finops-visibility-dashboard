// Northwind Signal — fictional company, synthetic data
// Shaped to mirror real AWS Cost Explorer + Stripe API responses,
// but every figure here is invented for demonstration purposes.

export interface CostItem {
  name: string;
  cost: number;
  color: string;
  category: 'aws' | 'external';
  note: string;
}

export interface RevenueSource {
  name: string;
  amount: number;
  color: string;
}

export interface Scenario {
  label: string;
  revenueSources: RevenueSource[];
  stripeFees: number;
  extraCosts: CostItem[];
}

export const AWS_COSTS: CostItem[] = [
  { name: 'WAF', cost: 15.0, color: '#4a3aa7', category: 'aws', note: 'Base fee + Bot Control add-on' },
  { name: 'Bedrock', cost: 9.6, color: '#2a78d6', category: 'aws', note: 'LLM content generation, ~12 jobs/mo' },
  { name: 'GuardDuty', cost: 4.0, color: '#e34948', category: 'aws', note: 'Threat detection, single account' },
  { name: 'CloudTrail', cost: 2.0, color: '#eb6834', category: 'aws', note: 'Audit trail, all regions' },
  { name: 'CloudWatch', cost: 1.6, color: '#eda100', category: 'aws', note: 'Alarms + log groups' },
  { name: 'Secrets Manager', cost: 1.2, color: '#e87ba4', category: 'aws', note: '3 secrets stored' },
  { name: 'SES', cost: 0.6, color: '#633806', category: 'aws', note: 'Transactional + newsletter sends' },
  { name: 'CloudFront', cost: 0.5, color: '#1baf7a', category: 'aws', note: 'CDN for site + static assets' },
  { name: 'S3', cost: 0.1, color: '#27500a', category: 'aws', note: 'Static hosting + media storage' },
  { name: 'SNS', cost: 0.07, color: '#412402', category: 'aws', note: 'Alert delivery' },
  { name: 'Lambda', cost: 0.0, color: '#888780', category: 'aws', note: 'Free tier covers current volume' },
  { name: 'DynamoDB', cost: 0.0, color: '#3d9acc', category: 'aws', note: 'Free tier — on-demand mode' },
  { name: 'API Gateway', cost: 0.0, color: '#26215c', category: 'aws', note: 'Free tier covers current requests' },
];

export const EXTERNAL_COSTS: CostItem[] = [
  { name: 'Text-to-Speech API', cost: 22.0, color: '#888780', category: 'external', note: 'Creator tier, narrated content' },
  { name: 'DNS / Registrar', cost: 0.0, color: '#555555', category: 'external', note: 'Free tier' },
];

export const SCENARIOS: Record<string, Scenario> = {
  now: {
    label: 'Current state · pre-revenue baseline',
    revenueSources: [],
    stripeFees: 0,
    extraCosts: [],
  },
  '500': {
    label: '500 newsletter subscribers · 10% Pro conversion',
    revenueSources: [{ name: 'Pro subscriptions', amount: 50 * 15, color: '#2a78d6' }],
    stripeFees: 50 * 15 * 0.029 + 50 * 0.3,
    extraCosts: [],
  },
  '1k': {
    label: '1,000 newsletter subscribers · 10% Pro conversion',
    revenueSources: [{ name: 'Pro subscriptions', amount: 100 * 15, color: '#2a78d6' }],
    stripeFees: 100 * 15 * 0.029 + 100 * 0.3,
    extraCosts: [],
  },
  client1: {
    label: 'First managed-service client onboarded',
    revenueSources: [
      { name: 'Pro subscriptions', amount: 100 * 15, color: '#2a78d6' },
      { name: 'Managed service fee', amount: 2000, color: '#4a3aa7' },
    ],
    stripeFees: 100 * 15 * 0.029 + 100 * 0.3,
    extraCosts: [{ name: 'Client sub-account infra', cost: 40, color: '#2a78d6', category: 'aws', note: 'Isolated AWS sub-account' }],
  },
};

export const COMPANY = {
  name: 'Northwind Signal',
  parent: 'Northwind Labs',
  description: 'A fictional independent newsletter and media company, used here purely to demonstrate a serverless cost & revenue visibility architecture.',
  accountId: '111111111111',
  region: 'us-east-1',
};
