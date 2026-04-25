/**
 * EquipmentSelector — DTF Station ROI Calculator
 * Clean minimal: white cards, thin borders, Poppins, teal accent
 *
 * Features:
 * - Bundle preset bar (Starter / Intermediate / Advanced)
 * - Compatible shaker filtering per printer
 * - Cutter section (only for XL2/XL3/XL4/X6)
 * - Other Equipment multi-select (only for R1/R2 Pro — alternative to Miro 13 Max)
 * - Heat Press: Prisma Dual only visible for XL2+
 */

import {
  PRINTERS, SHAKERS, HEAT_PRESSES, CUTTERS, OTHER_EQUIPMENT, BUNDLE_PRESETS,
  PRINTER_SHAKER_COMPAT,
  type ROIInputs,
} from '@/lib/roiData';
import { ChevronRight, Printer, Zap, Layers, Scissors, Package, Sparkles } from 'lucide-react';

interface Props {
  inputs: ROIInputs;
  onPrinterChange: (id: string) => void;
  onShakerChange: (id: string) => void;
  onHeatPressChange: (id: string) => void;
  onCutterChange: (id: string | null) => void;
  onOtherEquipmentChange: (ids: string[]) => void;
  onBundleSelect: (bundleId: string) => void;
  onContinue: () => void;
}

const TIER_LABELS: Record<string, string> = {
  beginner: 'Starter',
  intermediate: 'Growth',
  advanced: 'Advanced',
  industrial: 'Industrial',
};

const TIER_COLORS: Record<string, string> = {
  beginner: 'bg-sky-50 text-sky-600 border-sky-200',
  intermediate: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  advanced: 'bg-violet-50 text-violet-600 border-violet-200',
  industrial: 'bg-orange-50 text-orange-600 border-orange-200',
};

function SectionLabel({
  icon: Icon,
  label,
  sub,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  sub?: string;
}) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className="w-7 h-7 rounded-md bg-muted flex items-center justify-center">
        <Icon className="w-3.5 h-3.5 text-muted-foreground" />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-foreground">{label}</span>
        {sub && <span className="text-xs text-muted-foreground">{sub}</span>}
      </div>
    </div>
  );
}

function RadioRow({
  selected,
  onClick,
  name,
  sub,
  price,
  badge,
  badgeColor,
  disabled,
}: {
  selected: boolean;
  onClick: () => void;
  name: string;
  sub?: string;
  price: string;
  badge?: string;
  badgeColor?: string;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full text-left rounded-lg border px-3.5 py-3 transition-all ${
        disabled
          ? 'opacity-40 cursor-not-allowed border-border bg-muted/20'
          : selected
          ? 'border-primary bg-primary/5'
          : 'border-border bg-white hover:border-primary/40 hover:bg-muted/30'
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${
              selected ? 'border-primary' : 'border-border'
            }`}
          >
            {selected && <div className="w-2 h-2 rounded-full bg-primary" />}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-foreground">{name}</span>
              {badge && (
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${badgeColor}`}>
                  {badge}
                </span>
              )}
            </div>
            {sub && <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>}
          </div>
        </div>
        <span className="text-sm font-semibold text-foreground shrink-0 font-data">{price}</span>
      </div>
    </button>
  );
}

function CheckRow({
  checked,
  onClick,
  name,
  sub,
  price,
}: {
  checked: boolean;
  onClick: () => void;
  name: string;
  sub?: string;
  price: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-lg border px-3.5 py-3 transition-all ${
        checked
          ? 'border-primary bg-primary/5'
          : 'border-border bg-white hover:border-primary/40 hover:bg-muted/30'
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Checkbox */}
          <div
            className={`w-4 h-4 rounded border-2 shrink-0 flex items-center justify-center transition-colors ${
              checked ? 'border-primary bg-primary' : 'border-border bg-white'
            }`}
          >
            {checked && (
              <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 10" fill="none">
                <path d="M1.5 5L4 7.5L8.5 2.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-foreground">{name}</div>
            {sub && <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>}
          </div>
        </div>
        <span className="text-sm font-semibold text-foreground shrink-0 font-data">{price}</span>
      </div>
    </button>
  );
}

export default function EquipmentSelector({
  inputs,
  onPrinterChange,
  onShakerChange,
  onHeatPressChange,
  onCutterChange,
  onOtherEquipmentChange,
  onBundleSelect,
  onContinue,
}: Props) {
  const selectedPrinter = PRINTERS.find(p => p.id === inputs.printerId);

  // Compatible shakers for the selected printer
  const compatibleShakerIds = PRINTER_SHAKER_COMPAT[inputs.printerId] ?? [];
  const compatibleShakers = compatibleShakerIds
    .map(id => SHAKERS.find(s => s.id === id))
    .filter(Boolean) as typeof SHAKERS;

  // Cutter for selected printer (if any)
  const compatibleCutter = CUTTERS.find(c => c.compatiblePrinters.includes(inputs.printerId));

  // Other equipment for R1/R2 Pro
  const isSmallFormat = inputs.printerId === 'r1' || inputs.printerId === 'r2pro';
  const compatibleOtherEquipment = OTHER_EQUIPMENT.filter(e =>
    e.compatiblePrinters.includes(inputs.printerId)
  );

  // When R1/R2 Pro is selected and user has chosen other equipment, shaker section
  // shows as "alternative" — Miro 13 Max is the default but user can bypass it
  const usingAlternativeFinishing =
    isSmallFormat && inputs.otherEquipmentIds.length > 0;

  // Heat presses visible for selected printer
  const visibleHeatPresses = HEAT_PRESSES.filter(hp => {
    if (!hp.printerRestriction) return true;
    return hp.printerRestriction.includes(inputs.printerId);
  });

  // Total cost
  const cutter = inputs.cutterId ? CUTTERS.find(c => c.id === inputs.cutterId) : null;
  const otherItems = inputs.otherEquipmentIds.map(id => OTHER_EQUIPMENT.find(e => e.id === id));
  const totalCost =
    (selectedPrinter?.basePrice ?? 0) +
    (SHAKERS.find(s => s.id === inputs.shakerId)?.basePrice ?? 0) +
    (HEAT_PRESSES.find(h => h.id === inputs.heatPressId)?.basePrice ?? 0) +
    (cutter?.basePrice ?? 0) +
    otherItems.reduce((sum, e) => sum + (e?.basePrice ?? 0), 0);

  // Detect active bundle preset
  const activeBundleId = BUNDLE_PRESETS.find(
    b =>
      b.printerId === inputs.printerId &&
      b.shakerId === inputs.shakerId &&
      b.heatPressId === inputs.heatPressId
  )?.id ?? null;

  // Toggle other equipment (multi-select)
  const toggleOtherEquipment = (id: string) => {
    const current = inputs.otherEquipmentIds;
    if (current.includes(id)) {
      onOtherEquipmentChange(current.filter(x => x !== id));
    } else {
      onOtherEquipmentChange([...current, id]);
    }
  };

  return (
    <div className="space-y-3">

      {/* ── Bundle Presets ── */}
      <div className="section-card">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: 'rgba(69,193,191,0.1)' }}>
            <Sparkles className="w-3.5 h-3.5" style={{ color: '#45C1BF' }} />
          </div>
          <span className="text-sm font-semibold text-foreground">Bundle Presets</span>
          <span className="text-xs text-muted-foreground">· Quick-start configurations</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {BUNDLE_PRESETS.map(bundle => {
            const isActive = activeBundleId === bundle.id;
            return (
              <button
                key={bundle.id}
                onClick={() => onBundleSelect(bundle.id)}
                className="rounded-lg border px-2.5 py-2.5 text-left transition-all"
                style={
                  isActive
                    ? { borderColor: '#45C1BF', background: 'rgba(69,193,191,0.07)' }
                    : { borderColor: 'oklch(0.91 0.004 260)', background: 'white' }
                }
              >
                <div
                  className="text-xs font-bold mb-0.5"
                  style={isActive ? { color: '#1a7a78' } : { color: 'oklch(0.15 0.005 260)' }}
                >
                  {bundle.label}
                </div>
                <div className="text-[10px] text-muted-foreground leading-tight">{bundle.description}</div>
              </button>
            );
          })}
        </div>
        <p className="text-[10px] text-muted-foreground mt-2.5">
          Presets auto-fill equipment below. You can still change any item individually.
        </p>
      </div>

      {/* ── DTF Printer ── */}
      <div className="section-card">
        <SectionLabel icon={Printer} label="DTF Printer" />
        <div className="space-y-1.5">
          {PRINTERS.map(printer => (
            <RadioRow
              key={printer.id}
              selected={inputs.printerId === printer.id}
              onClick={() => onPrinterChange(printer.id)}
              name={printer.name}
              sub={`${printer.printWidth} · ${printer.dailyOutputMin}–${printer.dailyOutputMax} pcs/day`}
              price={`$${printer.basePrice.toLocaleString()}`}
              badge={TIER_LABELS[printer.tier]}
              badgeColor={TIER_COLORS[printer.tier]}
            />
          ))}
        </div>
      </div>

      {/* ── Powder Shaker & Curing ── */}
      <div className="section-card">
        <SectionLabel
          icon={Zap}
          label="Powder Shaker & Curing"
          sub={usingAlternativeFinishing ? '· Optional (using alternative finishing)' : '· Compatible with selected printer'}
        />
        {isSmallFormat && (
          <div className="mb-3 px-3 py-2 rounded-lg text-xs" style={{ background: 'rgba(69,193,191,0.06)', borderLeft: '3px solid #45C1BF', color: '#1a7a78' }}>
            <strong>Miro 13 Max</strong> is the recommended all-in-one shaker for R1/R2 Pro. If you prefer a lower-cost sheet-based workflow, skip this and select options in <strong>Other Equipment</strong> below.
          </div>
        )}
        <div className="space-y-1.5">
          {compatibleShakers.map(shaker => (
            <RadioRow
              key={shaker.id}
              selected={inputs.shakerId === shaker.id}
              onClick={() => onShakerChange(shaker.id)}
              name={shaker.name}
              sub={`${shaker.width} · automatic`}
              price={`$${shaker.basePrice.toLocaleString()}`}
            />
          ))}
        </div>
      </div>

      {/* ── Other Equipment (R1 / R2 Pro only) ── */}
      {isSmallFormat && compatibleOtherEquipment.length > 0 && (
        <div className="section-card">
          <SectionLabel
            icon={Package}
            label="Other Equipment"
            sub="· Alternative finishing for sheet-based workflows"
          />
          <div className="mb-3 px-3 py-2 rounded-lg text-xs text-muted-foreground" style={{ background: 'oklch(0.96 0.003 260)', borderRadius: '8px' }}>
            Select one or both if you prefer a sheet-based workflow over the Miro 13 Max. These can be used alongside or instead of the shaker above.
          </div>
          <div className="space-y-1.5">
            {compatibleOtherEquipment.map(item => (
              <CheckRow
                key={item.id}
                checked={inputs.otherEquipmentIds.includes(item.id)}
                onClick={() => toggleOtherEquipment(item.id)}
                name={item.name}
                sub={item.description}
                price={`$${item.basePrice.toLocaleString()}`}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Cutter (XL2, XL3, XL4, X6 only) ── */}
      {compatibleCutter && (
        <div className="section-card">
          <SectionLabel icon={Scissors} label="Film Cutter" sub="· Optional add-on" />
          <div className="space-y-1.5">
            <CheckRow
              checked={inputs.cutterId === compatibleCutter.id}
              onClick={() =>
                onCutterChange(inputs.cutterId === compatibleCutter.id ? null : compatibleCutter.id)
              }
              name={compatibleCutter.name}
              sub={compatibleCutter.description}
              price={compatibleCutter.basePrice > 0 ? `$${compatibleCutter.basePrice.toLocaleString()}` : 'Contact for pricing'}
            />
          </div>
        </div>
      )}

      {/* ── Heat Press ── */}
      <div className="section-card">
        <SectionLabel icon={Layers} label="Heat Press" sub="· Prisma Series" />
        <div className="space-y-1.5">
          {visibleHeatPresses.map(press => (
            <RadioRow
              key={press.id}
              selected={inputs.heatPressId === press.id}
              onClick={() => onHeatPressChange(press.id)}
              name={press.name}
              sub={press.description}
              price={press.basePrice > 0 ? `$${press.basePrice.toLocaleString()}` : 'Free'}
            />
          ))}
        </div>
      </div>

      {/* ── Total + CTA ── */}
      <div className="section-card">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-muted-foreground">Total Equipment Investment</span>
          <span className="text-xl font-bold text-foreground font-data">${totalCost.toLocaleString()}</span>
        </div>
        <button
          onClick={onContinue}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
          style={{ background: '#45C1BF', color: '#0d3534' }}
        >
          Configure Business Parameters
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
