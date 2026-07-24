import { PRINTERS, BUNDLE_PRESETS, CUTTERS, BASIC_VOLUME_STEPS, formatCurrency, type ROIInputs } from '@/lib/roiData';
import { type BusinessModel, BUSINESS_MODEL_OPTIONS } from '@/components/BusinessInputs';

function formatVol(v: number): string {
  if (v >= 1000) {
    const k = v / 1000;
    return `${k % 1 === 0 ? k : k.toFixed(1)}k`;
  }
  return String(v);
}

interface Props {
  inputs: ROIInputs;
  businessModel: BusinessModel;
  onBusinessModelChange: (model: BusinessModel) => void;
  onPrinterChange: (id: string) => void;
  onBundleSelect: (bundleId: string) => void;
  onChange: <K extends keyof ROIInputs>(key: K, value: ROIInputs[K]) => void;
  basicModeVolume: number;
  breakEvenMonthlyVolume: number;
  onVolumeChange: (vol: number) => void;
}

export default function BasicMode({
  inputs,
  businessModel,
  onBusinessModelChange,
  onPrinterChange,
  onBundleSelect,
  onChange,
  basicModeVolume,
  breakEvenMonthlyVolume,
  onVolumeChange,
}: Props) {
  const handlePrinterSelect = (id: string) => {
    onPrinterChange(id);
    onChange('heatPressId', 'prismaAuto');
    const cutter = CUTTERS.find(c => c.compatiblePrinters.includes(id));
    onChange('cutterId', cutter?.id ?? null);
  };

  const printer = PRINTERS.find(p => p.id === inputs.printerId);
  const machineCapacity = (printer?.dailyOutputFullTime ?? 0) * 22;

  const beText = breakEvenMonthlyVolume >= 99999
    ? 'N/A at current pricing'
    : `~${breakEvenMonthlyVolume.toLocaleString()}/mo`;

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
                    ? { borderColor: '#49C1BE', background: 'rgba(73,193,190,0.07)' }
                    : { borderColor: 'oklch(0.91 0.004 260)', background: 'transparent' }
                }
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center"
                    style={{ borderColor: isSelected ? '#49C1BE' : 'oklch(0.7 0.004 260)' }}
                  >
                    {isSelected && (
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#49C1BE' }} />
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
                    ? { borderColor: '#49C1BE', background: 'rgba(73,193,190,0.07)' }
                    : { borderColor: 'oklch(0.91 0.004 260)', background: 'transparent' }
                }
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center"
                    style={{ borderColor: isActive ? '#49C1BE' : 'oklch(0.7 0.004 260)' }}
                  >
                    {isActive && (
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#49C1BE' }} />
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

      {/* Volume ladder */}
      <div className="section-card space-y-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Expected Monthly Volume</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Select a production level — results update instantly.
          </p>
        </div>
        <div className="grid grid-cols-5 gap-1.5">
          {BASIC_VOLUME_STEPS.map(vol => {
            const isActive = basicModeVolume === vol;
            const isDisabled = vol > machineCapacity;
            return (
              <button
                key={vol}
                disabled={isDisabled}
                title={isDisabled ? "Exceeds this machine's capacity — consider an upgraded model." : undefined}
                onClick={() => onVolumeChange(vol)}
                className="flex flex-col items-center py-2 px-1 rounded-lg border transition-all"
                style={
                  isDisabled
                    ? { borderColor: 'oklch(0.91 0.004 260)', background: 'transparent', opacity: 0.35, cursor: 'not-allowed' }
                    : isActive
                    ? { borderColor: '#49C1BE', background: 'rgba(73,193,190,0.07)' }
                    : { borderColor: 'oklch(0.91 0.004 260)', background: 'transparent' }
                }
              >
                <span
                  className="text-xs font-semibold font-data"
                  style={{ color: isActive && !isDisabled ? '#49C1BE' : 'oklch(0.25 0.005 260)' }}
                >
                  {formatVol(vol)}
                </span>
                <span className="text-[10px] text-muted-foreground">/mo</span>
              </button>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground text-center">
          Break Even: <span className="font-semibold text-foreground">{beText}</span>
        </p>
      </div>

    </div>
  );
}
