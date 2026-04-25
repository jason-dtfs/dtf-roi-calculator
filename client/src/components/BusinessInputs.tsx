/**
 * BusinessInputs — DTF Station ROI Calculator
 * Clean minimal: white cards, Poppins, thin borders
 * Consumables split into: film & powder (per print) + ink (monthly flat)
 */

import { type ROIInputs, PRINTERS } from '@/lib/roiData';
import { ChevronLeft, ChevronRight, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface Props {
  inputs: ROIInputs;
  onChange: <K extends keyof ROIInputs>(key: K, value: ROIInputs[K]) => void;
  onBack: () => void;
  onContinue: () => void;
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

export default function BusinessInputs({ inputs, onChange, onBack, onContinue }: Props) {
  const printer = PRINTERS.find(p => p.id === inputs.printerId);

  return (
    <div className="space-y-3">
      <SectionGroup title="Production Volume">
        <SliderField
          label="Prints per day"
          tooltip={`Your selected printer (${printer?.name}) can produce ${printer?.dailyOutputMin}–${printer?.dailyOutputMax} prints/day.`}
          value={inputs.printsPerDay}
          min={10}
          max={printer?.dailyOutputMax ?? 1440}
          step={10}
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
