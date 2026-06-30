import { useMemo, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
} from 'chart.js';
import { AWS_COSTS, EXTERNAL_COSTS, SCENARIOS, COMPANY, type CostItem } from './data/northwind';
import './Dashboard.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

type ScenarioKey = keyof typeof SCENARIOS;

function fmt(n: number): string {
  if (n === 0) return '$0';
  const abs = Math.abs(n);
  const s = abs >= 1000 ? `$${(abs / 1000).toFixed(1)}K` : `$${abs.toFixed(2)}`;
  return n < 0 ? `-${s}` : s;
}

export default function Dashboard() {
  const [scenarioKey, setScenarioKey] = useState<ScenarioKey>('now');
  const scenario = SCENARIOS[scenarioKey];

  const items: CostItem[] = useMemo(
    () => [...AWS_COSTS, ...EXTERNAL_COSTS, ...scenario.extraCosts],
    [scenario]
  );

  const totalRevenue = scenario.revenueSources.reduce((a, r) => a + r.amount, 0);
  const awsCost = items.filter((i) => i.category === 'aws').reduce((a, i) => a + i.cost, 0);
  const extCost = items.filter((i) => i.category === 'external').reduce((a, i) => a + i.cost, 0);
  const totalCost = awsCost + extCost + scenario.stripeFees;
  const net = totalRevenue - totalCost;
  const margin = totalRevenue > 0 ? Math.round((net / totalRevenue) * 100) : null;

  const visibleCostItems = items.filter((i) => i.cost > 0);
  const maxRevenue = Math.max(...scenario.revenueSources.map((r) => r.amount), 1);
  const maxWaterfall = Math.max(totalRevenue, totalCost, 1);

  const chartData = {
    labels: visibleCostItems.map((i) => i.name),
    datasets: [
      {
        label: 'Monthly cost ($)',
        data: visibleCostItems.map((i) => i.cost),
        backgroundColor: visibleCostItems.map((i) => i.color),
        borderRadius: 4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: (c: any) => ` $${c.parsed.y.toFixed(2)}` } },
    },
    scales: {
      x: { ticks: { color: '#A8A5A1', font: { size: 10, family: "'Space Mono', monospace" }, maxRotation: 35 }, grid: { display: false } },
      y: { ticks: { color: '#A8A5A1', font: { size: 10, family: "'Space Mono', monospace" }, callback: (v: any) => `$${v}` }, grid: { color: 'rgba(168,165,161,0.15)' } },
    },
  };

  const waterfallRows = [
    { label: 'Gross revenue', val: totalRevenue, color: '#1baf7a', negative: false },
    { label: 'AWS costs', val: awsCost, color: '#e34948', negative: true },
    { label: 'External tools', val: extCost, color: '#eb6834', negative: true },
    { label: 'Payment processing fees', val: scenario.stripeFees, color: '#eda100', negative: true },
  ];

  return (
    <div className="dash">
      <header className="dash-header">
        <div>
          <h1>{COMPANY.name}: Cost &amp; Revenue Dashboard</h1>
          <p className="subtitle">{scenario.label}</p>
          <p className="disclaimer">
            Fictional company &middot; synthetic data &middot; demonstrates a serverless cost-visibility architecture
          </p>
        </div>
        <div className="scenario-tabs">
          {Object.keys(SCENARIOS).map((key) => (
            <button
              key={key}
              className={key === scenarioKey ? 'tab active' : 'tab'}
              onClick={() => setScenarioKey(key as ScenarioKey)}
            >
              {key === 'now' ? 'Now' : key === '500' ? '500 subs' : key === '1k' ? '1K subs' : 'First client'}
            </button>
          ))}
        </div>
      </header>

      <section className="kpi-row">
        <div className="kpi">
          <div className="kpi-label">Total revenue</div>
          <div className="kpi-value">{fmt(totalRevenue)}</div>
          <div className="kpi-sub">{totalRevenue === 0 ? 'Pre-revenue' : 'Monthly recurring'}</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Total costs</div>
          <div className="kpi-value">{fmt(totalCost)}</div>
          <div className="kpi-sub">AWS + external + fees</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Net</div>
          <div className={`kpi-value ${net >= 0 ? 'pos' : 'neg'}`}>
            {net >= 0 ? '+' : ''}
            {fmt(net)}
          </div>
          <div className="kpi-sub">{margin !== null ? `${margin}% margin` : 'Revenue needed to break even'}</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">AWS spend</div>
          <div className="kpi-value">{fmt(awsCost)}</div>
          <div className="kpi-sub">Estimated this month</div>
        </div>
      </section>

      <section className="grid-2">
        <div className="card">
          <h2>Revenue by source</h2>
          {scenario.revenueSources.length === 0 ? (
            <p className="empty-state">No revenue in this scenario — switch tabs above to model growth.</p>
          ) : (
            scenario.revenueSources.map((r) => (
              <div className="rev-bar" key={r.name}>
                <span className="rev-label">{r.name}</span>
                <div className="rev-track">
                  <div
                    className="rev-fill"
                    style={{ width: `${(r.amount / maxRevenue) * 100}%`, background: r.color }}
                  />
                </div>
                <span className="rev-val">{fmt(r.amount)}</span>
              </div>
            ))
          )}
        </div>

        <div className="card">
          <h2>P&amp;L waterfall</h2>
          {waterfallRows.map((row) => (
            <div className="wf-row" key={row.label}>
              <span className="wf-label">{row.label}</span>
              <div className="wf-bar-wrap">
                {row.val > 0 && (
                  <div
                    className="wf-bar"
                    style={{ width: `${(row.val / maxWaterfall) * 100}%`, background: row.color }}
                  />
                )}
              </div>
              <span className="wf-val">
                {row.negative && row.val > 0 ? '-' : ''}
                {fmt(row.val)}
              </span>
            </div>
          ))}
          <div className="wf-row wf-total">
            <span className="wf-label">Net</span>
            <div className="wf-bar-wrap" />
            <span className={`wf-val ${net >= 0 ? 'pos' : 'neg'}`}>
              {net >= 0 ? '+' : ''}
              {fmt(net)}
            </span>
          </div>
        </div>
      </section>

      <section className="card">
        <h2>Cost breakdown by service</h2>
        <div className="chart-wrap">
          <Bar data={chartData} options={chartOptions} />
        </div>
      </section>

      <section className="card">
        <h2>Line-item detail</h2>
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Category</th>
              <th>Monthly</th>
              <th>Annual est.</th>
            </tr>
          </thead>
          <tbody>
            {scenario.revenueSources.map((r) => (
              <tr key={r.name}>
                <td>{r.name}</td>
                <td>
                  <span className="pill pill-rev">Revenue</span>
                </td>
                <td className="num pos">+{fmt(r.amount)}</td>
                <td className="num pos">+{fmt(r.amount * 12)}</td>
              </tr>
            ))}
            {items
              .filter((i) => i.cost > 0)
              .map((i) => (
                <tr key={i.name}>
                  <td>{i.name}</td>
                  <td>
                    <span className={`pill ${i.category === 'aws' ? 'pill-aws' : 'pill-ext'}`}>
                      {i.category === 'aws' ? 'AWS' : 'External'}
                    </span>
                  </td>
                  <td className="num neg">-{fmt(i.cost)}</td>
                  <td className="num neg">-{fmt(i.cost * 12)}</td>
                </tr>
              ))}
            {scenario.stripeFees > 0 && (
              <tr>
                <td>Payment processing fees</td>
                <td>
                  <span className="pill pill-fee">Fees</span>
                </td>
                <td className="num neg">-{fmt(scenario.stripeFees)}</td>
                <td className="num neg">-{fmt(scenario.stripeFees * 12)}</td>
              </tr>
            )}
            <tr className="total-row">
              <td>Net</td>
              <td></td>
              <td className={`num ${net >= 0 ? 'pos' : 'neg'}`}>
                {net >= 0 ? '+' : ''}
                {fmt(net)}
              </td>
              <td className={`num ${net >= 0 ? 'pos' : 'neg'}`}>
                {net >= 0 ? '+' : ''}
                {fmt(net * 12)}
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      <footer className="footer-note">
        All figures are synthetic. This dashboard demonstrates an architecture pattern — EventBridge → Lambda →
        Cost Explorer/Stripe → DynamoDB → API Gateway → React — for unifying cloud cost and revenue visibility.
        See the README for the full design write-up.
      </footer>
    </div>
  );
}
