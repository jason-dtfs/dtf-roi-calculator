/**
 * BusinessInputs — DTF Station ROI Calculator
 * Clean minimal: white cards, Poppins, thin borders
 * Consumables split into: film & powder (per print) + ink (monthly flat)
 */

import { type ROIInputs, PRINTERS } from '@/lib/roiData';
import { ChevronLeft, ChevronRight, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export type BusinessModel = 'transfers' | 'garments' | 'hybrid';

export const BUSINESS_MODEL_OPTIONS: { value: BusinessModel; label: string; description: string }[] = [
  {
    value: 'transfers',
    label: 'Sell Transfers',
    description: 'I print DTF transfers and sell them per print',
  },
  {
    value: 'garments',
    label: 'Sell Finished Garments',
    description: 'I press transfers onto blank shirts and sell the finished product',
  },
  {
    value: 'hybrid',
    label: 'Mixed / Both',
    description: 'I do both',
  },
];

interface Props {
  inputs: ROIInputs;
  onChange: <K extends keyof ROIInputs>(key: K, value: ROIInputs[K]) => void;
  onBack: () => void;
  onContinue: () => void;
  businessModel: BusinessModel;
  onBusinessModelChange: (model: BusinessModel) => void;
}

interface SliderFieldProps {
  label: string;
  tooltip?: string;
  value: number;
  min: number;
  max: number;
  step: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  onChange: (val: number) => void;
}

function SliderField({ label, tooltip, value, min, max, step, prefix, suffix, decimals = 0, onChange }: SliderFieldProps) {
  const percent = ((value - min) / (max - min)) * 100;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-sm text-muted-foreground font-medium">{label}</span>
          {tooltip && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="text-muted-foreground/50 hover:text-muted-foreground transition-colors">
                  <Info className="w-3.5 h-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs text-xs">
                {tooltip}
              </TooltipContent>
            </Tooltip>
          )}
        </div>
        <div className="flex items-center gap-1">
          {prefix && <span className="text-sm font-semibold text-foreground">{prefix}</span>}
          <input
            type="number"
            value={decimals > 0 ? value : Math.round(value)}
            min={min}
            max={max}
            step={step}
            onChange={(e) => {
              const v = parseFloat(e.target.value);
              if (!isNaN(v)) onChange(Math.min(max, Math.max(min, v)));
            }}
            className="w-20 text-right bg-transparent border-b border-border text-foreground font-semibold text-sm focus:outline-none focus:border-primary transition-colors font-data"
          />
          {suffix && <span className="text-muted-foreground text-sm">{suffix}</span>}
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full"
        style={{
          background: `linear-gradient(to right, #45C1BF 0%, #45C1BF ${percent}%, oklch(0.91 0.004 260) ${percent}%, oklch(0.91 0.004 260) 100%)`,
        }}
      />
    </div>
  );
}

function SectionGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="section-card space-y-4">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      {children}
    </div>
  );
}

export default function BusinessInputs({ inputs, onChange, onBack, onContinue, businessModel, onBusinessModelChange }: Props) {
  const printer = PRINTERS.find(p => p.id === inputs.printerId);

  return (
    <div className="space-y-3">
      {/* Business model selector */}
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

      <SectionGroup title="Production Volume">
        <SliderField
          label={businessModel === 'garments' ? 'Shirts pressed per day' : 'Prints per day'}
          tooltip={
            businessModel === 'garments'
              ? 'Number of finished garments you can heat-press per day. Pressing is slower than printing — 15–40 shirts/day is typical.'
              : `Your selected printer (${printer?.name}) can produce ${printer?.dailyOutputMin}–${printer?.dailyOutputMax} prints/day.`
          }
          value={inputs.printsPerDay}
          min={businessModel === 'garments' ? 1 : 10}
          max={businessModel === 'garments' ? 100 : (printer?.dailyOutputMax ?? 1440)}
          step={businessModel === 'garments' ? 1 : 10}
          suffix="pcs"
          onChange={(v) => onChange('printsPerDay', v)}
        />
        <SliderField
          label="Operating days per month"
          tooltip="Number of days per month your shop will be running production."
          value={inputs.operatingDaysPerMonth}
          min={5}
          max={30}
          step={1}
          suffix="days"
          onChange={(v) => onChange('operatingDaysPerMonth', v)}
        />
      </SectionGroup>

      {/* Transfer revenue — hidden in garments-only mode */}
      {businessModel !== 'garments' && (
        <SectionGroup title="Revenue & Pricing">
          <SliderField
            label="Selling price per print"
            tooltip="Your average selling price per DTF transfer. Industry average is $3–$6 for standard transfers."
            value={inputs.sellingPricePerPrint}
            min={1}
            max={15}
            step={0.25}
            prefix="$"
            decimals={2}
            onChange={(v) => onChange('sellingPricePerPrint', v)}
          />
        </SectionGroup>
      )}

      {/* Garment revenue — shown for garments and hybrid */}
      {businessModel !== 'transfers' && (
        <SectionGroup title={businessModel === 'hybrid' ? 'Garment Revenue & Pricing' : 'Revenue & Pricing'}>
          <SliderField
            label="Selling price per finished shirt"
            tooltip="Your average selling price per completed garment (blank + pressed transfer)."
            value={inputs.sellingPricePerShirt ?? 18}
            min={10}
            max={50}
            step={0.5}
            prefix="$"
            decimals={2}
            onChange={(v) => onChange('sellingPricePerShirt', v)}
          />
          <SliderField
            label="Blank garment cost per shirt"
            tooltip="Your landed cost for a blank shirt before printing. Gildan Softstyle runs ~$3–$5; premium blanks run higher."
            value={inputs.blankGarmentCostPerShirt ?? 4.5}
            min={0}
            max={Math.min(20, Math.max(1, (inputs.sellingPricePerShirt ?? 18) - 1))}
            step={0.25}
            prefix="$"
            decimals={2}
            onChange={(v) => onChange('blankGarmentCostPerShirt', v)}
          />
          <SliderField
            label="Prints per shirt"
            tooltip="How many DTF transfers you apply per garment. Most shirts use 1 (front only); front + back = 2."
            value={inputs.printsPerShirt ?? 1}
            min={1}
            max={4}
            step={1}
            suffix="prints"
            onChange={(v) => onChange('printsPerShirt', v)}
          />
        </SectionGroup>
      )}

      <SectionGroup title="Consumable Costs">
        <p className="text-xs text-muted-foreground -mt-2">
          Separate film/powder (variable per print) from ink (fixed monthly cost).
        </p>
        <SliderField
          label="Film & powder cost per print"
          tooltip="Cost of DTF film and powder per print. Typical range is $0.30–$0.80 depending on film size and powder usage."
          value={inputs.filmAndPowderCostPerPrint}
          min={0.10}
          max={3}
          step={0.05}
          prefix="$"
          decimals={2}
          onChange={(v) => onChange('filmAndPowderCostPerPrint', v)}
        />
        <SliderField
          label="Monthly ink cost"
          tooltip="Your total monthly spend on DTF ink (CMYK + White). This is a flat monthly cost regardless of volume."
          value={inputs.inkCostPerMonth}
          min={0}
          max={5000}
          step={50}
          prefix="$"
          suffix="/mo"
          onChange={(v) => onChange('inkCostPerMonth', v)}
        />
        {(() => {
          const printer = PRINTERS.find(p => p.id === inputs.printerId);
          if (!printer) return null;
          return (
            <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-muted/40 border border-border">
              <span className="text-xs text-muted-foreground">
                Recommended for <span className="font-semibold text-foreground">{printer.name}</span>
              </span>
              <button
                onClick={() => onChange('inkCostPerMonth', printer.inkCostPreset)}
                className="text-xs font-semibold transition-colors hover:opacity-80"
                style={{ color: '#45C1BF' }}
              >
                Use ${printer.inkCostPreset.toLocaleString()}/mo
              </button>
            </div>
          );
        })()}
      </SectionGroup>

      <SectionGroup title="Labor Costs">
        <SliderField
          label="Labor hours per day"
          tooltip="Hours of operator time required per production day."
          value={inputs.laborHoursPerDay}
          min={0.5}
          max={12}
          step={0.5}
          suffix="hrs"
          decimals={1}
          onChange={(v) => onChange('laborHoursPerDay', v)}
        />
        <SliderField
          label="Labor cost per hour"
          tooltip="Hourly wage for your DTF operator."
          value={inputs.laborCostPerHour}
          min={10}
          max={60}
          step={1}
          prefix="$"
          suffix="/hr"
          onChange={(v) => onChange('laborCostPerHour', v)}
        />
      </SectionGroup>

      <SectionGroup title="Outsourcing Comparison">
        <p className="text-xs text-muted-foreground -mt-2">Compare in-house production vs. buying transfers from a supplier.</p>
        <SliderField
          label="Current outsourcing cost per print"
          tooltip="What you currently pay per transfer when outsourcing. Typical range is $2.50–$5.00."
          value={inputs.outsourcingCostPerPrint}
          min={0.50}
          max={10}
          step={0.25}
          prefix="$"
          decimals={2}
          onChange={(v) => onChange('outsourcingCostPerPrint', v)}
        />
        <SliderField
          label="Monthly outsourced volume"
          tooltip="How many transfers per month you currently outsource."
          value={inputs.currentMonthlyOutsourcingVolume}
          min={0}
          max={10000}
          step={50}
          suffix="pcs"
          onChange={(v) => onChange('currentMonthlyOutsourcingVolume', v)}
        />
      </SectionGroup>

      {/* Navigation */}
      <div className="flex gap-2">
        <button
          onClick={onBack}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
          Equipment
        </button>
        <button
          onClick={onContinue}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
          style={{ background: '#45C1BF', color: '#0d3534' }}
        >
          Financing Options
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
