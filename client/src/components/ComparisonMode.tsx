/**
 * ComparisonMode — DTF Station ROI Calculator
 * Side-by-side comparison of two equipment configurations.
 * Design: Clean minimal, Poppins, teal (#45C1BF) accent
 */

import { useState, useCallback, useMemo } from 'react';
import {
  calculateROI,
  getPrinterShakerTotal,
  PRINTERS,
  SHAKERS,
  HEAT_PRESSES,
  CUTTERS,
  PRINTER_SHAKER_COMPAT,
  BUNDLE_PRESETS,
  DEFAULT_INPUTS,
  formatCurrency,
  type ROIInputs,
  type ROIResults,
} from '@/lib/roiData';
import { ArrowLeftRight, ChevronDown, TrendingUp, Clock, DollarSign, BarChart2 } from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';

// ─── Preset quick-fill ────────────────────────────────────────────────────────

const COMPARISON_PRESETS = [
  { label: 'Starter vs Intermediate', a: 'starter', b: 'intermediate' },
  { label: 'Intermediate vs Advanced', a: 'intermediate', b: 'advanced' },
  { label: 'Starter vs Advanced', a: 'starter', b: 'advanced' },
];

function applyBundle(bundleId: string): ROIInputs {
  const bundle = BUNDLE_PRESETS.find(b => b.id === bundleId);
  if (!bundle) return DEFAULT_INPUTS;
  const printer = PRINTERS.find(p => p.id === bundle.printerId);
  return {
    ...DEFAULT_INPUTS,
    printerId: bundle.printerId,
    shakerId: bundle.shakerId,
    heatPressId: bundle.heatPressId,
    cutterId: bundle.cutterId,
    otherEquipmentIds: bundle.otherEquipmentIds,
    printsPerDay: printer?.dailyOutputDefault ?? DEFAULT_INPUTS.printsPerDay,
  };
}

// ─── Machine images ───────────────────────────────────────────────────────────

const MACHINE_IMAGES: Record<string, string> = {
  'r1:miro13':          'r1-miro13max.png',
  'r2pro:miro13':       'r2pro-miro13max.png',
  'xl2:miro24':         'xl2-miro24.webp',
  'xl2:seismoL24R':     'xl2-l24r.png',
  'xl2pro:miro24':      'xl2pro-miro24.png',
  'xl2pro:seismoL24R':  'xl2pro-seismol24r.webp',
  'xl3:miro24':         'xl3-miro24.webp',
  'xl3:seismoL24R':     'xl3-seismol24r.png',
  'xl4:seismoL24R':     'xl4-l24r.png',
  'x6:seismoV36R':      'x6-seismov36r.png',
};

const MACHINE_FALLBACK: Record<string, string> = {
  r1:    'r1-miro13max.png',
  r2pro: 'r2pro-miro13max.png',
  xl4:   'xl4-l24r.png',
  x6:    'x6-seismov36r.png',
};

const HEAT_PRESS_IMAGES: Record<string, string> = {
  prismaAuto:  'prisma-auto.png',
  prismaDual:  'prisma-dual.png',
};

function getMachineImageSrc(printerId: string, shakerId: string): string | null {
  const combo = MACHINE_IMAGES[`${printerId}:${shakerId}`];
  if (combo) return `/machines/${combo}`;
  const fallback = MACHINE_FALLBACK[printerId];
  if (fallback) return `/machines/${fallback}`;
  return null;
}

function MachineHeroImage({ printerId, shakerId, alt }: { printerId: string; shakerId: string; alt: string }) {
  const [failed, setFailed] = useState(false);
  const src = getMachineImageSrc(printerId, shakerId);

  if (!src || failed) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted/40 rounded-t-xl">
        <span className="text-xs text-muted-foreground font-medium">{alt}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setFailed(true)}
      className="w-full h-full object-contain p-3"
    />
  );
}

function HeatPressThumb({ heatPressId }: { heatPressId: string }) {
  const [failed, setFailed] = useState(false);
  const file = HEAT_PRESS_IMAGES[heatPressId];
  if (!file || failed) return null;

  return (
    <img
      src={`/machines/${file}`}
      alt=""
      onError={() => setFailed(true)}
      className="absolute bottom-2 right-2 w-12 h-12 object-contain opacity-80"
    />
  );
}

// ─── Mini equipment selector ──────────────────────────────────────────────────

interface MiniSelectorProps {
  inputs: ROIInputs;
  label: string;
  color: string;
  onChange: (inputs: ROIInputs) => void;
}

function MiniSelector({ inputs, label, color, onChange }: MiniSelectorProps) {
  const [open, setOpen] = useState(false);
  const printer = PRINTERS.find(p => p.id === inputs.printerId);
  const shaker = SHAKERS.find(s => s.id === inputs.shakerId);
  const heatPress = HEAT_PRESSES.find(h => h.id === inputs.heatPressId);
  const cutter = inputs.cutterId ? CUTTERS.find(c => c.id === inputs.cutterId) : null;

  const compatibleShakers = PRINTER_SHAKER_COMPAT[inputs.printerId] ?? [];

  const handlePrinterChange = (id: string) => {
    const p = PRINTERS.find(pr => pr.id === id);
    const compat = PRINTER_SHAKER_COMPAT[id] ?? [];
    onChange({
      ...inputs,
      printerId: id,
      shakerId: compat[0] ?? '',
      printsPerDay: p?.dailyOutputDefault ?? inputs.printsPerDay,
      cutterId: null,
      otherEquipmentIds: [],
    });
  };

  const totalCost =
    (printer && shaker ? getPrinterShakerTotal(printer, shaker) : 0) +
    (heatPress?.basePrice ?? 0) +
    (cutter?.basePrice ?? 0);

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      {/* Machine hero image */}
      <div className="relative h-40 bg-muted/30">
        <MachineHeroImage
          printerId={inputs.printerId}
          shakerId={inputs.shakerId}
          alt={printer ? `${printer.name}${shaker ? ` + ${shaker.name}` : ''}` : 'Machine'}
        />
        {heatPress && heatPress.id !== 'none' && (
          <HeatPressThumb heatPressId={heatPress.id} />
        )}
      </div>

      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer select-none"
        style={{ borderLeft: `3px solid ${color}` }}
        onClick={() => setOpen(o => !o)}
      >
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide" style={{ color }}>
              {label}
            </span>
          </div>
          <p className="text-sm font-semibold text-foreground mt-0.5">
            {printer?.name ?? '—'}{shaker ? ` + ${shaker.name}` : ''}
          </p>
          <p className="text-xs text-muted-foreground">{formatCurrency(totalCost)} total investment</p>
        </div>
        <ChevronDown
          className="w-4 h-4 text-muted-foreground transition-transform"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        />
      </div>

      {/* Collapsible config */}
      {open && (
        <div className="px-4 pb-4 space-y-3 border-t border-border bg-muted/20">
          {/* Bundle quick-fill */}
          <div className="pt-3">
            <p className="text-xs text-muted-foreground mb-2 font-medium">Quick-fill with bundle preset:</p>
            <div className="flex gap-1.5 flex-wrap">
              {BUNDLE_PRESETS.map(b => (
                <button
                  key={b.id}
                  onClick={() => onChange(applyBundle(b.id))}
                  className="px-2.5 py-1 text-xs rounded-md border border-border hover:border-primary/60 hover:bg-primary/5 transition-all font-medium"
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>

          {/* Printer */}
          <div>
            <p className="text-xs text-muted-foreground mb-1.5 font-medium">Printer</p>
            <div className="grid grid-cols-1 gap-1">
              {PRINTERS.map(p => (
                <button
                  key={p.id}
                  onClick={() => handlePrinterChange(p.id)}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg border text-left text-xs transition-all ${
                    inputs.printerId === p.id
                      ? 'border-primary/60 bg-primary/5 font-semibold'
                      : 'border-border hover:border-border/80 hover:bg-muted/30'
                  }`}
                >
                  <span>{p.name}</span>
                  <span className="text-muted-foreground font-data">{formatCurrency(p.basePrice)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Shaker */}
          {compatibleShakers.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-1.5 font-medium">Shaker</p>
              <div className="grid grid-cols-1 gap-1">
                {compatibleShakers.map(sid => {
                  const s = SHAKERS.find(sh => sh.id === sid);
                  if (!s) return null;
                  return (
                    <button
                      key={s.id}
                      onClick={() => onChange({ ...inputs, shakerId: s.id })}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg border text-left text-xs transition-all ${
                        inputs.shakerId === s.id
                          ? 'border-primary/60 bg-primary/5 font-semibold'
                          : 'border-border hover:border-border/80 hover:bg-muted/30'
                      }`}
                    >
                      <span>{s.name}</span>
                      <span className="text-muted-foreground font-data">{formatCurrency(s.basePrice)}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Heat Press */}
          <div>
            <p className="text-xs text-muted-foreground mb-1.5 font-medium">Heat Press</p>
            <div className="grid grid-cols-1 gap-1">
              {HEAT_PRESSES.filter(h => !h.printerRestriction || h.printerRestriction.includes(inputs.printerId)).map(h => (
                <button
                  key={h.id}
                  onClick={() => onChange({ ...inputs, heatPressId: h.id })}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg border text-left text-xs transition-all ${
                    inputs.heatPressId === h.id
                      ? 'border-primary/60 bg-primary/5 font-semibold'
                      : 'border-border hover:border-border/80 hover:bg-muted/30'
                  }`}
                >
                  <span>{h.name}</span>
                  <span className="text-muted-foreground font-data">{h.basePrice > 0 ? formatCurrency(h.basePrice) : 'Free'}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Prints per day */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-muted-foreground font-medium">Prints per day</p>
              <span className="text-xs font-semibold font-data">{inputs.printsPerDay} pcs</span>
            </div>
            <input
              type="range"
              min={10}
              max={PRINTERS.find(p => p.id === inputs.printerId)?.dailyOutputMax ?? 1440}
              step={10}
              value={inputs.printsPerDay}
              onChange={e => onChange({ ...inputs, printsPerDay: parseInt(e.target.value) })}
              className="w-full"
              style={{
                background: `linear-gradient(to right, ${color} 0%, ${color} ${((inputs.printsPerDay - 10) / ((PRINTERS.find(p => p.id === inputs.printerId)?.dailyOutputMax ?? 1440) - 10)) * 100}%, oklch(0.91 0.004 260) ${((inputs.printsPerDay - 10) / ((PRINTERS.find(p => p.id === inputs.printerId)?.dailyOutputMax ?? 1440) - 10)) * 100}%, oklch(0.91 0.004 260) 100%)`,
              }}
            />
          </div>

          {/* Selling price */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-muted-foreground font-medium">Selling price / print</p>
              <span className="text-xs font-semibold font-data">${inputs.sellingPricePerPrint.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={1}
              max={15}
              step={0.25}
              value={inputs.sellingPricePerPrint}
              onChange={e => onChange({ ...inputs, sellingPricePerPrint: parseFloat(e.target.value) })}
              className="w-full"
              style={{
                background: `linear-gradient(to right, ${color} 0%, ${color} ${((inputs.sellingPricePerPrint - 1) / 14) * 100}%, oklch(0.91 0.004 260) ${((inputs.sellingPricePerPrint - 1) / 14) * 100}%, oklch(0.91 0.004 260) 100%)`,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── KPI comparison row ───────────────────────────────────────────────────────

interface KPIRowProps {
  label: string;
  valueA: string;
  valueB: string;
  rawA: number;
  rawB: number;
  colorA: string;
  colorB: string;
  higherIsBetter?: boolean;
  icon: React.ReactNode;
}

function KPIRow({ label, valueA, valueB, rawA, rawB, colorA, colorB, higherIsBetter = true, icon }: KPIRowProps) {
  const aWins = higherIsBetter ? rawA > rawB : rawA < rawB;
  const bWins = higherIsBetter ? rawB > rawA : rawB < rawA;
  const diff = Math.abs(rawA - rawB);
  const base = Math.max(Math.abs(rawA), Math.abs(rawB), 1);
  const pct = Math.round((diff / base) * 100);

  return (
    <div className="py-3 border-b border-border last:border-0">
      <div className="flex items-center gap-1.5 mb-2">
        <span className="text-muted-foreground">{icon}</span>
        <span className="text-xs font-semibold text-foreground">{label}</span>
        {pct > 0 && (
          <span className="ml-auto text-xs text-muted-foreground">{pct}% difference</span>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div
          className={`px-3 py-2 rounded-lg text-center ${aWins ? 'ring-1' : ''}`}
          style={{ backgroundColor: `${colorA}15`, ...(aWins ? { ringColor: colorA } : {}) }}
        >
          <p className="text-sm font-bold font-data" style={{ color: colorA }}>{valueA}</p>
          {aWins && <p className="text-xs text-muted-foreground mt-0.5">Better ↑</p>}
        </div>
        <div
          className={`px-3 py-2 rounded-lg text-center ${bWins ? 'ring-1' : ''}`}
          style={{ backgroundColor: `${colorB}15`, ...(bWins ? { ringColor: colorB } : {}) }}
        >
          <p className="text-sm font-bold font-data" style={{ color: colorB }}>{valueB}</p>
          {bWins && <p className="text-xs text-muted-foreground mt-0.5">Better ↑</p>}
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

const COLOR_A = '#45C1BF';
const COLOR_B = '#6366F1';

export default function ComparisonMode() {
  const [inputsA, setInputsA] = useState<ROIInputs>(applyBundle('starter'));
  const [inputsB, setInputsB] = useState<ROIInputs>(applyBundle('intermediate'));

  const resultsA = useMemo(() => calculateROI(inputsA), [inputsA]);
  const resultsB = useMemo(() => calculateROI(inputsB), [inputsB]);

  const handlePreset = useCallback((presetIdx: number) => {
    const p = COMPARISON_PRESETS[presetIdx];
    setInputsA(applyBundle(p.a));
    setInputsB(applyBundle(p.b));
  }, []);

  // Merge chart data
  const chartData = useMemo(() => {
    return resultsA.monthlyChartData.map((d, i) => ({
      month: d.month,
      label: d.month % 6 === 0 || d.month === 1 ? `Mo ${d.month}` : '',
      profitA: d.cumulativeProfit,
      profitB: resultsB.monthlyChartData[i]?.cumulativeProfit ?? 0,
    }));
  }, [resultsA, resultsB]);

  const printerA = PRINTERS.find(p => p.id === inputsA.printerId);
  const printerB = PRINTERS.find(p => p.id === inputsB.printerId);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <ArrowLeftRight className="w-4 h-4" style={{ color: COLOR_A }} />
        <h2 className="text-base font-bold text-foreground">Comparison Mode</h2>
      </div>

      {/* Quick presets */}
      <div className="section-card">
        <p className="text-xs text-muted-foreground mb-2 font-medium">Quick comparison presets:</p>
        <div className="flex gap-2 flex-wrap">
          {COMPARISON_PRESETS.map((p, i) => (
            <button
              key={i}
              onClick={() => handlePreset(i)}
              className="px-3 py-1.5 text-xs rounded-lg border border-border hover:border-primary/60 hover:bg-primary/5 transition-all font-medium"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Config A & B */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <MiniSelector inputs={inputsA} label="Configuration A" color={COLOR_A} onChange={setInputsA} />
        <MiniSelector inputs={inputsB} label="Configuration B" color={COLOR_B} onChange={setInputsB} />
      </div>

      {/* Column headers */}
      <div className="grid grid-cols-2 gap-3 px-1">
        <div className="text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: `${COLOR_A}20`, color: COLOR_A }}>
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLOR_A }} />
            Config A — {printerA?.name}
          </div>
        </div>
        <div className="text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: `${COLOR_B}20`, color: COLOR_B }}>
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLOR_B }} />
            Config B — {printerB?.name}
          </div>
        </div>
      </div>

      {/* KPI comparison */}
      <div className="section-card">
        <h3 className="text-sm font-semibold text-foreground mb-1">Key Metrics Comparison</h3>
        <KPIRow
          label="Monthly Net Profit"
          valueA={formatCurrency(resultsA.monthlyNetProfit)}
          valueB={formatCurrency(resultsB.monthlyNetProfit)}
          rawA={resultsA.monthlyNetProfit}
          rawB={resultsB.monthlyNetProfit}
          colorA={COLOR_A}
          colorB={COLOR_B}
          icon={<DollarSign className="w-3.5 h-3.5" />}
        />
        <KPIRow
          label="Payback Period"
          valueA={resultsA.paybackPeriodMonths >= 999 ? 'N/A' : `${resultsA.paybackPeriodMonths} mo`}
          valueB={resultsB.paybackPeriodMonths >= 999 ? 'N/A' : `${resultsB.paybackPeriodMonths} mo`}
          rawA={resultsA.paybackPeriodMonths}
          rawB={resultsB.paybackPeriodMonths}
          colorA={COLOR_A}
          colorB={COLOR_B}
          higherIsBetter={false}
          icon={<Clock className="w-3.5 h-3.5" />}
        />
        <KPIRow
          label="Annual Net Profit"
          valueA={formatCurrency(resultsA.annualNetProfit)}
          valueB={formatCurrency(resultsB.annualNetProfit)}
          rawA={resultsA.annualNetProfit}
          rawB={resultsB.annualNetProfit}
          colorA={COLOR_A}
          colorB={COLOR_B}
          icon={<TrendingUp className="w-3.5 h-3.5" />}
        />
        <KPIRow
          label="3-Year ROI"
          valueA={`${Math.round(resultsA.threeYearROI)}%`}
          valueB={`${Math.round(resultsB.threeYearROI)}%`}
          rawA={resultsA.threeYearROI}
          rawB={resultsB.threeYearROI}
          colorA={COLOR_A}
          colorB={COLOR_B}
          icon={<BarChart2 className="w-3.5 h-3.5" />}
        />
        <KPIRow
          label="Total Investment"
          valueA={formatCurrency(resultsA.totalEquipmentCost)}
          valueB={formatCurrency(resultsB.totalEquipmentCost)}
          rawA={resultsA.totalEquipmentCost}
          rawB={resultsB.totalEquipmentCost}
          colorA={COLOR_A}
          colorB={COLOR_B}
          higherIsBetter={false}
          icon={<DollarSign className="w-3.5 h-3.5" />}
        />
        <KPIRow
          label="Profit per Print"
          valueA={`$${resultsA.profitPerPrint.toFixed(2)}`}
          valueB={`$${resultsB.profitPerPrint.toFixed(2)}`}
          rawA={resultsA.profitPerPrint}
          rawB={resultsB.profitPerPrint}
          colorA={COLOR_A}
          colorB={COLOR_B}
          icon={<TrendingUp className="w-3.5 h-3.5" />}
        />
      </div>

      {/* 36-month trajectory chart */}
      <div className="section-card">
        <h3 className="text-sm font-semibold text-foreground mb-3">36-Month Profit Trajectory</h3>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.91 0.004 260)" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: 'oklch(0.55 0.016 286)' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`}
              tick={{ fontSize: 10, fill: 'oklch(0.55 0.016 286)' }}
              axisLine={false}
              tickLine={false}
              width={48}
            />
            <Tooltip
              formatter={(value: number, name: string) => [formatCurrency(value), name === 'profitA' ? `Config A (${printerA?.name})` : `Config B (${printerB?.name})`]}
              labelFormatter={(l) => l}
              contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid oklch(0.92 0.004 286)' }}
            />
            <ReferenceLine y={0} stroke="oklch(0.7 0.016 286)" strokeDasharray="4 2" />
            <Line type="monotone" dataKey="profitA" stroke={COLOR_A} strokeWidth={2} dot={false} name="profitA" />
            <Line type="monotone" dataKey="profitB" stroke={COLOR_B} strokeWidth={2} dot={false} name="profitB" />
            <Legend
              formatter={(value) => value === 'profitA' ? `Config A — ${printerA?.name}` : `Config B — ${printerB?.name}`}
              wrapperStyle={{ fontSize: 11 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* CTA */}
      <div className="section-card text-center space-y-2">
        <p className="text-sm font-semibold text-foreground">Ready to move forward?</p>
        <p className="text-xs text-muted-foreground">Contact a DTF Station dealer for a personalized quote and financing options.</p>
        <a
          href="https://dtfstation.com/pages/dealer-locator"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-opacity hover:opacity-90"
          style={{ background: '#45C1BF', color: '#0d3534' }}
        >
          Find a Dealer
        </a>
      </div>
    </div>
  );
}
