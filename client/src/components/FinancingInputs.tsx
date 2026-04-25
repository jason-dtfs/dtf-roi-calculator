/**
 * FinancingInputs — DTF Station ROI Calculator
 * Clean minimal: white cards, Poppins, thin borders
 */

import { type ROIInputs, type ROIResults, formatCurrency } from '@/lib/roiData';
import { ChevronLeft, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface Props {
  inputs: ROIInputs;
  results: ROIResults;
  onChange: <K extends keyof ROIInputs>(key: K, value: ROIInputs[K]) => void;
  onBack: () => void;
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
            value={value}
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
          background: `linear-gradient(to right, oklch(0.46 0.22 262) 0%, oklch(0.46 0.22 262) ${percent}%, oklch(0.91 0.004 260) ${percent}%, oklch(0.91 0.004 260) 100%)`,
        }}
      />
    </div>
  );
}

const LOAN_TERMS = [12, 24, 36, 48, 60];

export default function FinancingInputs({ inputs, results, onChange, onBack }: Props) {
  return (
    <div className="space-y-3">
      {/* Financing Parameters */}
      <div className="section-card space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Financing Parameters</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Set 100% down payment to calculate a cash purchase.</p>
        </div>

        <SliderField
          label="Down payment"
          tooltip="Percentage of total equipment cost paid upfront."
          value={inputs.downPaymentPercent}
          min={0}
          max={100}
          step={5}
          suffix="%"
          onChange={(v) => onChange('downPaymentPercent', v)}
        />

        <SliderField
          label="Annual interest rate"
          tooltip="Annual interest rate on your equipment financing. Typical range: 5–15% APR."
          value={inputs.loanInterestRate}
          min={0}
          max={25}
          step={0.1}
          suffix="% APR"
          decimals={1}
          onChange={(v) => onChange('loanInterestRate', v)}
        />

        {/* Loan term */}
        <div className="space-y-2">
          <span className="text-sm text-muted-foreground font-medium">Loan term</span>
          <div className="grid grid-cols-5 gap-1.5">
            {LOAN_TERMS.map((term) => (
              <button
                key={term}
                onClick={() => onChange('loanTermMonths', term)}
                className={`py-2 rounded-md text-xs font-semibold transition-all border ${
                  inputs.loanTermMonths === term
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white text-muted-foreground border-border hover:border-primary/40 hover:text-foreground'
                }`}
              >
                {term}mo
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Financing Summary */}
      <div className="section-card">
        <h3 className="text-sm font-semibold text-foreground mb-3">Financing Summary</h3>
        <div className="space-y-0">
          {[
            { label: 'Total Equipment Cost', value: formatCurrency(results.totalEquipmentCost) },
            { label: 'Down Payment', value: formatCurrency(results.downPayment) },
            { label: 'Loan Amount', value: formatCurrency(results.loanAmount) },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between items-center py-2 border-b border-border last:border-0">
              <span className="text-sm text-muted-foreground">{label}</span>
              <span className="text-sm font-semibold text-foreground font-data">{value}</span>
            </div>
          ))}
          <div className="flex justify-between items-center pt-3">
            <span className="text-sm font-semibold text-foreground">Monthly Payment</span>
            <span className="text-base font-bold text-primary font-data">{formatCurrency(results.monthlyLoanPayment)}</span>
          </div>
        </div>
      </div>

      {/* Cash purchase nudge */}
      {inputs.downPaymentPercent < 100 && (
        <div className="section-card border-primary/20 bg-primary/3">
          <p className="text-sm font-medium text-foreground mb-1">Cash Purchase Option</p>
          <p className="text-xs text-muted-foreground">
            Paying cash eliminates the {formatCurrency(results.monthlyLoanPayment)}/mo loan payment, improving monthly net profit and shortening payback.
          </p>
          <button
            onClick={() => onChange('downPaymentPercent', 100)}
            className="mt-2 text-xs font-semibold text-primary hover:underline"
          >
            Switch to cash purchase →
          </button>
        </div>
      )}

      {/* Back */}
      <button
        onClick={onBack}
        className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-all"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Business Parameters
      </button>
    </div>
  );
}
