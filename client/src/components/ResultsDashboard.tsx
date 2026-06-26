/**
 * ResultsDashboard — DTF Station ROI Calculator
 * Clean minimal: white cards, Poppins, teal (#45C1BF) accents
 * Features: KPI cards, charts, share button, How We Calculate This accordion
 */

import { useMemo, useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer, ReferenceLine, Cell
} from 'recharts';
import { type ROIResults, type ROIInputs, formatCurrency, PRINTERS, SHAKERS, HEAT_PRESSES } from '@/lib/roiData';
import { exportROIPDF } from '@/lib/exportPDF';
import { TrendingUp, DollarSign, Clock, BarChart2, Download, Share2, ChevronDown } from 'lucide-react';

interface Props {
  results: ROIResults;
  inputs: ROIInputs;
  onShare: () => void;
  businessModel: 'transfers' | 'garments' | 'hybrid';
}

// Brand teal
const BRAND_HEX = '#45C1BF';
const BRAND_DARK = '#0d3534';

function KPICard({
  label,
  value,
  sub,
  accent = false,
  icon: Icon,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
}) {
  return (
    <div
      className="section-card flex flex-col gap-2"
      style={accent ? { borderColor: 'rgba(69,193,191,0.35)', background: 'rgba(69,193,191,0.04)' } : {}}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
        <div
          className="w-7 h-7 rounded-md flex items-center justify-center"
          style={accent ? { background: 'rgba(69,193,191,0.12)' } : { background: 'oklch(0.96 0.003 260)' }}
        >
          <Icon
            className="w-3.5 h-3.5"
            style={accent ? { color: BRAND_HEX } : { color: 'oklch(0.52 0.01 260)' }}
          />
        </div>
      </div>
      <div
        className="text-2xl font-bold font-data tracking-tight"
        style={accent ? { color: BRAND_HEX } : { color: 'oklch(0.15 0.005 260)' }}
      >
        {value}
      </div>
      {sub && <div className="text-xs text-muted-foreground">{sub}</div>}
    </div>
  );
}

const TOOLTIP_STYLE = {
  backgroundColor: 'white',
  border: '1px solid oklch(0.91 0.004 260)',
  borderRadius: '8px',
  padding: '8px 12px',
  fontSize: '12px',
  color: 'oklch(0.15 0.005 260)',
  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
};

function ProfitTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={TOOLTIP_STYLE}>
      <p className="font-semibold mb-1 text-muted-foreground">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: BRAND_HEX }} className="font-semibold">
          {p.name}: {formatCurrency(p.value)}
        </p>
      ))}
    </div>
  );
}

function BarTooltip({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: { fill: string } }> }) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div style={TOOLTIP_STYLE}>
      <p className="font-semibold" style={{ color: item.payload.fill }}>{item.name}</p>
      <p className="text-foreground">{formatCurrency(item.value)}/mo</p>
    </div>
  );
}

const CHART_COLORS = {
  revenue: BRAND_HEX,
  consumables: '#F97316',
  labor: '#EAB308',
  equipment: '#8B5CF6',
  profit: '#22C55E',
};

// --- How We Calculate This accordion ---

interface AssumptionItem {
  title: string;
  content: string;
}

const ASSUMPTIONS: AssumptionItem[] = [
  {
    title: 'Monthly Revenue',
    content: 'Monthly Revenue = Prints Per Day × Operating Days Per Month × Selling Price Per Print. This represents gross income before any costs are deducted.',
  },
  {
    title: 'Consumable Costs',
    content: 'Monthly Consumable Cost = Prints Per Day × Operating Days Per Month × Consumable Cost Per Print. This covers DTF film, ink (CMYK + White), and hot-melt adhesive powder. Typical Color Prime consumable cost is $0.80–$1.50 per print depending on print size and ink coverage.',
  },
  {
    title: 'Labor Costs',
    content: 'Monthly Labor Cost = Labor Hours Per Day × Operating Days Per Month × Hourly Labor Rate. This reflects the operator time required to load film, monitor print quality, and manage the shaker/curing unit.',
  },
  {
    title: 'Equipment Payment',
    content: 'Monthly loan payment is calculated using standard amortization: Payment = P × r(1+r)^n / ((1+r)^n − 1), where P = loan principal, r = monthly interest rate (APR ÷ 12), and n = loan term in months. Setting down payment to 100% eliminates the loan payment entirely.',
  },
  {
    title: 'Monthly Net Profit',
    content: 'Net Profit = Revenue − Consumable Costs − Labor Costs − Monthly Equipment Payment. This is the amount left over each month after all direct operating costs and financing are paid.',
  },
  {
    title: 'Payback Period',
    content: 'Payback Period (months) = Total Equipment Cost ÷ Monthly Net Profit. This is the time required to recover the full purchase price of the equipment from net operating profit. A shorter payback period indicates a faster return on investment.',
  },
  {
    title: '3-Year ROI',
    content: '3-Year ROI % = (36-Month Net Profit − Down Payment) ÷ Down Payment × 100. This measures the return on your initial cash outlay (down payment) over a 3-year horizon. If you paid cash in full, the down payment equals the total equipment cost.',
  },
  {
    title: 'Outsourcing Savings',
    content: 'Monthly Outsourcing Savings = Monthly Outsourced Volume × (Outsourcing Cost Per Print − Your Consumable Cost Per Print). This shows how much you save by producing in-house versus buying transfers from a third-party supplier at your current outsourcing rate.',
  },
  {
    title: 'Default Assumptions',
    content: 'Default inputs assume: 22 operating days/month (standard business month), $4.50 selling price (mid-market retail transfer price), $1.25 consumable cost (Color Prime consumables), 4 labor hours/day at $18/hr, 20% down payment at 7.9% APR over 36 months. These are illustrative starting points — adjust all inputs to match your specific business.',
  },
];

function AssumptionsAccordion() {
  const [sectionOpen, setSectionOpen] = useState(false);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="section-card">
      <button
        onClick={() => setSectionOpen(o => !o)}
        className="w-full flex items-center justify-between text-left"
      >
        <h3 className="text-sm font-semibold text-foreground">How We Calculate This</h3>
        <ChevronDown
          className="w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-200"
          style={{ transform: sectionOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
        />
      </button>
      {sectionOpen && (
        <>
          <p className="text-xs text-muted-foreground mt-3 mb-4">
            All projections are based solely on the inputs you provide. Actual results will vary based on your market, print sizes, ink coverage, and operational efficiency.
          </p>
          <div className="space-y-1">
            {ASSUMPTIONS.map((item, i) => {
              const isOpen = openIndex === i;
              return (
                <div key={i} className="border border-border rounded-lg overflow-hidden">
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : i)}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 text-left hover:bg-muted/30 transition-colors"
                  >
                    <span className="text-sm font-medium text-foreground">{item.title}</span>
                    <ChevronDown
                      className="w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-200"
                      style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-3.5 pb-3 pt-1 border-t border-border bg-muted/20">
                      <p className="text-xs text-muted-foreground leading-relaxed">{item.content}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

// --- Main component ---

export default function ResultsDashboard({ results, inputs, onShare, businessModel }: Props) {
  const printer = PRINTERS.find(p => p.id === inputs.printerId);
  const shaker = SHAKERS.find(s => s.id === inputs.shakerId);
  const heatPress = HEAT_PRESSES.find(h => h.id === inputs.heatPressId);

  const paybackLabel = useMemo(() => {
    if (results.paybackPeriodMonths >= 999) return 'N/A';
    if (results.paybackPeriodMonths > 60) return `${Math.ceil(results.paybackPeriodMonths / 12)} yrs`;
    return `${results.paybackPeriodMonths} mo`;
  }, [results.paybackPeriodMonths]);

  const isProfit = results.monthlyNetProfit > 0;

  const chartData = results.monthlyChartData.map(d => ({
    ...d,
    label: d.month % 6 === 0 || d.month === 1 ? `Mo ${d.month}` : '',
  }));

  const breakevenMonth = results.monthlyChartData.find(d => d.cumulativeProfit >= 0)?.month;

  const barData = [
    { name: 'Revenue', value: results.monthlyRevenue, fill: CHART_COLORS.revenue },
    { name: 'Film & Powder', value: results.monthlyFilmPowderCost, fill: CHART_COLORS.consumables },
    { name: 'Ink', value: results.monthlyInkCost, fill: '#F59E0B' },
    { name: 'Labor', value: results.monthlyLaborCost, fill: CHART_COLORS.labor },
    { name: 'Equipment', value: results.monthlyLoanPayment, fill: CHART_COLORS.equipment },
    { name: 'Net Profit', value: Math.max(0, results.monthlyNetProfit), fill: CHART_COLORS.profit },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground">ROI Analysis</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {printer?.name}{shaker ? ` + ${shaker.name}` : ''}{heatPress?.basePrice ? ` + ${heatPress.name}` : ''}
          </p>
        </div>
        <div className="flex items-center gap-2 no-print">
          <button
            onClick={onShare}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-all"
          >
            <Share2 className="w-3.5 h-3.5" />
            Share
          </button>
          <button
            onClick={() => exportROIPDF(inputs, results)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            Export PDF
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 gap-3">
        <KPICard
          label="Monthly Net Profit"
          value={formatCurrency(results.monthlyNetProfit)}
          sub={`${formatCurrency(results.monthlyRevenue)} revenue`}
          accent={isProfit}
          icon={DollarSign}
        />
        <KPICard
          label="Payback Period"
          value={paybackLabel}
          sub={isProfit ? 'to recover investment' : 'Adjust inputs'}
          icon={Clock}
        />
        <KPICard
          label="Annual Net Profit"
          value={formatCurrency(results.annualNetProfit)}
          sub="Year 1 projection"
          icon={TrendingUp}
        />
        <KPICard
          label="3-Year ROI"
          value={results.threeYearROI > 0 ? `${Math.round(results.threeYearROI)}%` : 'N/A'}
          sub={`${formatCurrency(results.threeYearNetProfit)} net`}
          icon={BarChart2}
        />
      </div>

      {/* Outsourcing savings */}
      {results.monthlyOutsourcingSavings > 0 && (
        <div className="section-card flex items-center justify-between" style={{ borderColor: '#bbede9', background: '#f0fafa' }}>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#1a7a78' }}>Monthly Outsourcing Savings</p>
            <p className="text-xs mt-0.5" style={{ color: '#2a9a96' }}>
              vs. buying {inputs.currentMonthlyOutsourcingVolume.toLocaleString()} transfers at ${inputs.outsourcingCostPerPrint}/ea
            </p>
          </div>
          <span className="text-xl font-bold font-data" style={{ color: '#1a7a78' }}>
            {formatCurrency(results.monthlyOutsourcingSavings)}
          </span>
        </div>
      )}

      {/* Profit Trajectory */}
      <div className="section-card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-foreground">36-Month Profit Trajectory</h3>
            {breakevenMonth && (
              <p className="text-xs text-muted-foreground mt-0.5">Breakeven at month {breakevenMonth}</p>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: BRAND_HEX }} />
            Cumulative Profit
          </div>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={BRAND_HEX} stopOpacity={0.15} />
                <stop offset="95%" stopColor={BRAND_HEX} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.91 0.004 260)" />
            <XAxis
              dataKey="label"
              tick={{ fill: 'oklch(0.52 0.01 260)', fontSize: 10, fontFamily: 'Poppins, sans-serif' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: 'oklch(0.52 0.01 260)', fontSize: 10, fontFamily: 'Poppins, sans-serif' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => formatCurrency(v)}
              width={62}
            />
            <RechartsTooltip content={<ProfitTooltip />} />
            <ReferenceLine y={0} stroke="oklch(0.91 0.004 260)" strokeDasharray="4 4" />
            {breakevenMonth && (
              <ReferenceLine
                x={`Mo ${breakevenMonth}`}
                stroke="#22C55E"
                strokeDasharray="4 4"
                label={{ value: 'Breakeven', fill: '#22C55E', fontSize: 10, position: 'top', fontFamily: 'Poppins, sans-serif' }}
              />
            )}
            <Area
              type="monotone"
              dataKey="cumulativeProfit"
              name="Cumulative Profit"
              stroke={BRAND_HEX}
              strokeWidth={2}
              fill="url(#profitGrad)"
              dot={false}
              activeDot={{ r: 4, fill: BRAND_HEX, stroke: 'white', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Monthly Breakdown */}
      <div className="section-card">
        <h3 className="text-sm font-semibold text-foreground mb-4">Monthly Revenue Breakdown</h3>
        <div className="grid grid-cols-2 gap-4">
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={barData} margin={{ top: 5, right: 5, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.91 0.004 260)" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fill: 'oklch(0.52 0.01 260)', fontSize: 9, fontFamily: 'Poppins, sans-serif' }}
                axisLine={false}
                tickLine={false}
                angle={-30}
                textAnchor="end"
              />
              <YAxis
                tick={{ fill: 'oklch(0.52 0.01 260)', fontSize: 9, fontFamily: 'Poppins, sans-serif' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`}
                width={36}
              />
              <RechartsTooltip content={<BarTooltip />} />
              <Bar dataKey="value" radius={[3, 3, 0, 0]}>
                {barData.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          <div className="space-y-1.5 flex flex-col justify-center">
            {[
              { label: 'Revenue', value: results.monthlyRevenue, color: CHART_COLORS.revenue, sign: '' },
              { label: 'Film & Powder', value: results.monthlyFilmPowderCost, color: CHART_COLORS.consumables, sign: '-' },
              { label: 'Ink', value: results.monthlyInkCost, color: '#F59E0B', sign: '-' },
              { label: 'Labor', value: results.monthlyLaborCost, color: CHART_COLORS.labor, sign: '-' },
              { label: 'Equipment Pmt', value: results.monthlyLoanPayment, color: CHART_COLORS.equipment, sign: '-' },
              { label: 'Net Profit', value: results.monthlyNetProfit, color: CHART_COLORS.profit, sign: '', bold: true },
            ].map(({ label, value, color, sign, bold }) => (
              <div key={label} className={`flex justify-between items-center py-1 ${bold ? 'border-t border-border mt-1 pt-2' : ''}`}>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                  <span className={`text-xs ${bold ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>{label}</span>
                </div>
                <span className={`text-xs font-semibold font-data ${bold ? 'text-sm' : ''}`} style={{ color }}>
                  {sign}{formatCurrency(Math.abs(value))}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Production Summary */}
      <div className="section-card">
        <h3 className="text-sm font-semibold text-foreground mb-3">Monthly Production Summary</h3>
        <div className="grid grid-cols-2 gap-x-6">
          {[
            { label: businessModel === 'garments' ? 'Total Shirts Pressed' : businessModel === 'hybrid' ? 'Total Units' : 'Total Prints', value: `${results.monthlyPrints.toLocaleString()} pcs` },
            { label: 'Gross Profit', value: formatCurrency(results.monthlyGrossProfit) },
            { label: 'Revenue', value: formatCurrency(results.monthlyRevenue) },
            { label: 'Profit Margin', value: results.monthlyRevenue > 0 ? `${Math.round((results.monthlyNetProfit / results.monthlyRevenue) * 100)}%` : 'N/A' },
            { label: 'Cost / Print', value: results.monthlyPrints > 0 ? `$${results.costPerPrint.toFixed(2)}` : 'N/A' },
            { label: 'Profit / Print', value: results.monthlyPrints > 0 ? `$${results.profitPerPrint.toFixed(2)}` : 'N/A' },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between items-center py-2 border-b border-border last:border-0">
              <span className="text-xs text-muted-foreground">{label}</span>
              <span className="text-xs font-semibold text-foreground font-data">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* How We Calculate This */}
      <AssumptionsAccordion />

      {/* CTA */}
      <div className="section-card" style={{ borderColor: 'rgba(69,193,191,0.25)', background: 'rgba(69,193,191,0.03)' }}>
        <h3 className="text-sm font-bold text-foreground mb-1">Ready to get started?</h3>
        <p className="text-xs text-muted-foreground mb-4">
          Contact a DTF Station dealer for a personalized quote and financing options.
        </p>
        <div className="flex gap-2">
          <a
            href="https://dtfstation.com/pages/dealer-locator"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-center py-2.5 rounded-lg text-sm font-semibold hover:opacity-85 transition-opacity"
            style={{ background: '#45C1BF', color: BRAND_DARK }}
          >
            Find a Dealer
          </a>
        </div>
      </div>
    </div>
  );
}
