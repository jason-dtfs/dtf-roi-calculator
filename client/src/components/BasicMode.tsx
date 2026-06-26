import { PRINTERS, BUNDLE_PRESETS, CUTTERS, formatCurrency, type ROIInputs } from '@/lib/roiData';
import { type BusinessModel, BUSINESS_MODEL_OPTIONS } from '@/components/BusinessInputs';

interface Props {
  inputs: ROIInputs;
  businessModel: BusinessModel;
  onBusinessModelChange: (model: BusinessModel) => void;
  onPrinterChange: (id: string) => void;
  onBundleSelect: (bundleId: string) => void;
  onChange: <K extends keyof ROIInputs>(key: K, value: ROIInputs[K]) => void;
}

const SCHEDULES = [
  { label: 'Part-time', sub: '3 days/week', days: 13 },
  { label: 'Full-time', sub: '5 days/week', days: 22 },
  { label: 'High-volume', sub: '6 days/week', days: 26 },
] as const;

export default function BasicMode({ inputs, businessModel, onBusinessModelChange, onPrinterChange, onBundleSelect, onChange }: Props) {
  const handlePrinterSelect = (id: string) => {
    onPrinterChange(id); // handles shaker, printsPerDay, inkCost
    onChange('heatPressId', 'prismaAuto');
    const cutter = CUTTERS.find(c => c.compatiblePrinters.includes(id));
    onChange('cutterId', cutter?.id ?? null);
  };

  return (
    <div className="space-y-3">

      {/* Equipment */}
      <div className="section-card space-y-4">
        <h3 className="text-sm font-semibold text-foreground">Choose Your Printer</h3>

        <div>
          <p className="text-xs text-muted-foreground mb-2 font-medium">Quick-start bundles</p>
          <div className="flex gap-1.5 flex-wrap">
            {BUNDLE_PRESETS.map(b => (
              <button
                key={b.id}
                onClick={() => onBundleSelect(b.id)}
                className="px-3 py-1.5 text-xs rounded-lg border border-border hover:border-primary/60 hover:bg-primary/5 transition-all font-medium"
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          {PRINTERS.map(p => {
            const isSelected = inputs.printerId === p.id;
            return (
              <button
                key={p.id}
                onClick={() => handlePrinterSelect(p.id)}
                className="w-full text-left flex items-center justify-between px-3.5 py-3 rounded-lg border transition-all"
                style={
                  isSelected
                    ? { borderColor: '#45C1BF', background: 'rgba(69,193,191,0.07)' }
                    : { borderColor: 'oklch(0.91 0.004 260)', background: 'transparent' }
                }
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center"
                    style={{ borderColor: isSelected ? '#45C1BF' : 'oklch(0.7 0.004 260)' }}
                  >
                    {isSelected && (
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#45C1BF' }} />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-foreground">{p.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {p.dailyOutputMin}–{p.dailyOutputMax} pcs/day · {p.printWidth}
                    </div>
                  </div>
                </div>
                <span className="text-sm font-semibold text-foreground font-data ml-2 shrink-0">
                  {formatCurrency(p.basePrice)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Business model */}
      <div className="section-card space-y-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Business Model</h3>
          <p className="text-xs text-muted-foreground mt-0.5">How do you make money with your DTF setup?</p>
        </div>
        <div className="flex flex-col gap-2">
          {BUSINESS_MODEL_OPTIONS.map(opt => {
            const isActive = businessModel === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => onBusinessModelChange(opt.value)}
                className="w-full text-left px-3.5 py-3 rounded-lg border transition-all"
                style={
                  isActive
                    ? { borderColor: '#45C1BF', background: 'rgba(69,193,191,0.07)' }
                    : { borderColor: 'oklch(0.91 0.004 260)', background: 'transparent' }
                }
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center"
                    style={{ borderColor: isActive ? '#45C1BF' : 'oklch(0.7 0.004 260)' }}
                  >
                    {isActive && (
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#45C1BF' }} />
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-foreground">{opt.label}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{opt.description}</div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Schedule */}
      <div className="section-card space-y-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Production Schedule</h3>
          <p className="text-xs text-muted-foreground mt-0.5">How often will you run production?</p>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {SCHEDULES.map(s => {
            const isActive = inputs.operatingDaysPerMonth === s.days;
            return (
              <button
                key={s.days}
                onClick={() => onChange('operatingDaysPerMonth', s.days)}
                className="flex flex-col items-center gap-0.5 px-2 py-3 rounded-lg border transition-all"
                style={
                  isActive
                    ? { borderColor: '#45C1BF', background: 'rgba(69,193,191,0.07)' }
                    : { borderColor: 'oklch(0.91 0.004 260)', background: 'transparent' }
                }
              >
                <span className="text-sm font-semibold text-foreground">{s.label}</span>
                <span className="text-xs text-muted-foreground">{s.sub}</span>
                <span
                  className="text-xs font-medium mt-0.5"
                  style={{ color: isActive ? '#45C1BF' : 'oklch(0.55 0.016 286)' }}
                >
                  {s.days} days/mo
                </span>
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
}
