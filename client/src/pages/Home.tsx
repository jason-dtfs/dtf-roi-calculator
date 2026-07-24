/**
 * Home — DTF Station ROI Calculator
 * Design: Clean Minimal — white/off-white, Poppins, teal (#45C1BF) accent
 * Features:
 *  - URL query-param sync for shareable links
 *  - Comparison mode (side-by-side two configs)
 *  - Mobile-first: sticky "View Results" button on small screens
 *  - No "Shop Equipment" CTAs; Find a Dealer → dtfstation.com/pages/dealer-locator
 */

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import Header from '@/components/Header';
import EquipmentSelector from '@/components/EquipmentSelector';
import BusinessInputs, { type BusinessModel } from '@/components/BusinessInputs';
import BasicMode from '@/components/BasicMode';
import FinancingInputs from '@/components/FinancingInputs';
import ResultsDashboard from '@/components/ResultsDashboard';
import ComparisonMode from '@/components/ComparisonMode';
import {
  calculateROI,
  PRINTERS,
  BUNDLE_PRESETS,
  PRINTER_SHAKER_COMPAT,
  BASIC_VOLUME_STEPS,
  DEFAULT_INPUTS,
  type ROIInputs,
} from '@/lib/roiData';
import { toast } from 'sonner';
import { Share2, ArrowLeftRight, Calculator, ChevronUp } from 'lucide-react';

// ─── URL encode/decode helpers ────────────────────────────────────────────────

const NUM_KEYS: Array<keyof ROIInputs> = [
  'printsPerDay', 'operatingDaysPerMonth', 'sellingPricePerPrint',
  'filmAndPowderCostPerPrint', 'inkCostPerMonth', 'laborCostPerHour',
  'outsourcingCostPerPrint', 'currentMonthlyOutsourcingVolume',
  'sellingPricePerShirt', 'blankGarmentCostPerShirt', 'printsPerShirt',
  'downPaymentPercent', 'loanInterestRate', 'loanTermMonths',
];
const STR_KEYS: Array<keyof ROIInputs> = ['printerId', 'shakerId', 'heatPressId'];

function encodeInputsToURL(
  inputs: ROIInputs,
  businessModel: BusinessModel = 'transfers',
  uiMode: UIMode = 'advanced',
  vol: number | null = null,
): string {
  const params = new URLSearchParams();
  STR_KEYS.forEach(k => params.set(k, inputs[k] as string));
  NUM_KEYS.forEach(k => params.set(k, String(inputs[k])));
  if (inputs.cutterId) params.set('cutterId', inputs.cutterId);
  if (inputs.otherEquipmentIds.length) params.set('otherEquipmentIds', inputs.otherEquipmentIds.join(','));
  if (businessModel !== 'transfers') params.set('businessModel', businessModel);
  if (uiMode !== 'advanced') params.set('mode', uiMode);
  if (vol !== null) params.set('vol', String(vol));
  return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
}

function decodeInputsFromURL(): Partial<ROIInputs> {
  const params = new URLSearchParams(window.location.search);
  if (!params.has('printerId')) return {};
  const partial: Partial<ROIInputs> = {};
  STR_KEYS.forEach(k => {
    const v = params.get(k);
    if (v) (partial as Record<string, unknown>)[k] = v;
  });
  NUM_KEYS.forEach(k => {
    const v = params.get(k);
    if (v !== null) {
      const parsed = parseFloat(v);
      if (!isNaN(parsed)) (partial as Record<string, unknown>)[k] = parsed;
    }
  });
  const cutterId = params.get('cutterId');
  if (cutterId) partial.cutterId = cutterId;
  const otherRaw = params.get('otherEquipmentIds');
  if (otherRaw) partial.otherEquipmentIds = otherRaw.split(',').filter(Boolean);
  return partial;
}

// ─── Break-even helpers (called on printer/bundle/model switch only) ──────────

function computeBreakEvenVolume(inputs: ROIInputs, businessModel: BusinessModel): number {
  const { monthlyLoanPayment } = calculateROI({ ...inputs, printsPerDay: 0 }, businessModel);
  const fixedCost = monthlyLoanPayment + inputs.inkCostPerMonth;

  const printsPerShirt = (Number.isFinite(inputs.printsPerShirt) && inputs.printsPerShirt >= 1)
    ? inputs.printsPerShirt : 1;
  const sellingPricePerShirt = Number.isFinite(inputs.sellingPricePerShirt) ? inputs.sellingPricePerShirt : 16;
  const blankGarmentCostPerShirt = Number.isFinite(inputs.blankGarmentCostPerShirt) ? inputs.blankGarmentCostPerShirt : 4.5;
  const laborPerTransfer = inputs.laborCostPerHour / 300;
  const laborPerShirt = inputs.laborCostPerHour / 60;

  let marginPerUnit: number;
  if (businessModel === 'garments') {
    marginPerUnit = sellingPricePerShirt
      - blankGarmentCostPerShirt
      - inputs.filmAndPowderCostPerPrint * printsPerShirt
      - laborPerShirt;
  } else if (businessModel === 'hybrid') {
    const revenuePerPrint = 0.5 * inputs.sellingPricePerPrint + (0.5 / printsPerShirt) * sellingPricePerShirt;
    const costsPerPrint = inputs.filmAndPowderCostPerPrint
      + (0.5 / printsPerShirt) * blankGarmentCostPerShirt
      + 0.5 * laborPerTransfer
      + (0.5 / printsPerShirt) * laborPerShirt;
    marginPerUnit = revenuePerPrint - costsPerPrint;
  } else {
    marginPerUnit = inputs.sellingPricePerPrint - inputs.filmAndPowderCostPerPrint - laborPerTransfer;
  }

  if (marginPerUnit <= 0) return 99999;
  return Math.ceil(fixedCost / marginPerUnit);
}

function defaultVolumeStep(breakEven: number): number {
  return BASIC_VOLUME_STEPS.find(v => v >= breakEven) ?? BASIC_VOLUME_STEPS[BASIC_VOLUME_STEPS.length - 1];
}

// ─── Component ────────────────────────────────────────────────────────────────

type Section = 'equipment' | 'business' | 'financing';
type Mode = 'calculator' | 'comparison';
type UIMode = 'basic' | 'advanced';

const STEPS: { id: Section; label: string; num: number }[] = [
  { id: 'equipment', label: 'Equipment', num: 1 },
  { id: 'business', label: 'Business', num: 2 },
  { id: 'financing', label: 'Financing', num: 3 },
];

export default function Home() {
  const [inputs, setInputs] = useState<ROIInputs>(() => ({
    ...DEFAULT_INPUTS,
    ...decodeInputsFromURL(),
  }));
  const [businessModel, setBusinessModel] = useState<BusinessModel>(() => {
    const val = new URLSearchParams(window.location.search).get('businessModel');
    return val === 'garments' || val === 'hybrid' ? val : 'transfers';
  });
  const [uiMode, setUIMode] = useState<UIMode>(() => {
    const val = new URLSearchParams(window.location.search).get('mode');
    return val === 'basic' ? 'basic' : 'advanced';
  });
  const [basicModeVolume, setBasicModeVolume] = useState<number>(() => {
    const params = new URLSearchParams(window.location.search);
    const volStr = params.get('vol');
    if (volStr) {
      const parsed = parseInt(volStr, 10);
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
    const initInputs: ROIInputs = { ...DEFAULT_INPUTS, ...decodeInputsFromURL() };
    const initBM: BusinessModel = (() => {
      const v = params.get('businessModel');
      return v === 'garments' || v === 'hybrid' ? v : 'transfers';
    })();
    return defaultVolumeStep(computeBreakEvenVolume(initInputs, initBM));
  });
  const [breakEvenMonthlyVolume, setBreakEvenMonthlyVolume] = useState<number>(() => {
    const params = new URLSearchParams(window.location.search);
    const initInputs: ROIInputs = { ...DEFAULT_INPUTS, ...decodeInputsFromURL() };
    const initBM: BusinessModel = (() => {
      const v = params.get('businessModel');
      return v === 'garments' || v === 'hybrid' ? v : 'transfers';
    })();
    return computeBreakEvenVolume(initInputs, initBM);
  });
  const [activeSection, setActiveSection] = useState<Section>('equipment');
  const [mode, setMode] = useState<Mode>('calculator');
  const [mobileResultsOpen, setMobileResultsOpen] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => calculateROI(inputs, businessModel), [inputs, businessModel]);

  const completedSteps = useMemo(() => {
    const steps: Section[] = [];
    if (activeSection === 'business' || activeSection === 'financing') steps.push('equipment');
    if (activeSection === 'financing') steps.push('business');
    return steps;
  }, [activeSection]);

  // Sync URL
  useEffect(() => {
    if (mode === 'calculator') {
      const url = encodeInputsToURL(inputs, businessModel, uiMode, uiMode === 'basic' ? basicModeVolume : null);
      window.history.replaceState(null, '', url);
    }
  }, [inputs, mode, businessModel, uiMode, basicModeVolume]);

  const updateInput = useCallback(<K extends keyof ROIInputs>(key: K, value: ROIInputs[K]) => {
    setInputs(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleVolumeChange = useCallback((vol: number) => {
    setBasicModeVolume(vol);
    setInputs(prev => ({
      ...prev,
      printsPerDay: Math.max(1, Math.round(vol / prev.operatingDaysPerMonth)),
    }));
  }, []);

  const handlePrinterChange = useCallback((id: string) => {
    const printer = PRINTERS.find(p => p.id === id);
    const compatibleIds = PRINTER_SHAKER_COMPAT[id] ?? [];
    const defaultShaker = compatibleIds[0] ?? printer?.recommendedShaker ?? '';

    setInputs(prev => {
      const tentativeInputs: ROIInputs = {
        ...prev,
        printerId: id,
        shakerId: defaultShaker,
        inkCostPerMonth: printer?.inkCostPreset ?? prev.inkCostPerMonth,
        cutterId: null,
        otherEquipmentIds: [],
      };
      const be = computeBreakEvenVolume(tentativeInputs, businessModel);
      setBreakEvenMonthlyVolume(be);
      const vol = defaultVolumeStep(be);
      setBasicModeVolume(vol);
      return {
        ...tentativeInputs,
        printsPerDay: Math.max(1, Math.round(vol / prev.operatingDaysPerMonth)),
      };
    });
  }, [businessModel]);

  const handleBundleSelect = useCallback((bundleId: string) => {
    const bundle = BUNDLE_PRESETS.find(b => b.id === bundleId);
    if (!bundle) return;
    const printer = PRINTERS.find(p => p.id === bundle.printerId);

    setInputs(prev => {
      const bundleInputs: ROIInputs = {
        ...prev,
        printerId: bundle.printerId,
        shakerId: bundle.shakerId,
        heatPressId: bundle.heatPressId,
        cutterId: bundle.cutterId,
        otherEquipmentIds: bundle.otherEquipmentIds,
        inkCostPerMonth: printer?.inkCostPreset ?? prev.inkCostPerMonth,
      };
      const be = computeBreakEvenVolume(bundleInputs, businessModel);
      setBreakEvenMonthlyVolume(be);
      const vol = defaultVolumeStep(be);
      setBasicModeVolume(vol);
      return {
        ...bundleInputs,
        printsPerDay: Math.max(1, Math.round(vol / prev.operatingDaysPerMonth)),
      };
    });
  }, [businessModel]);

  const handleBusinessModelChange = useCallback((model: BusinessModel) => {
    setBusinessModel(model);
    setInputs(prev => {
      const be = computeBreakEvenVolume(prev, model);
      setBreakEvenMonthlyVolume(be);
      if (uiMode === 'basic') {
        const vol = defaultVolumeStep(be);
        setBasicModeVolume(vol);
        return { ...prev, printsPerDay: Math.max(1, Math.round(vol / prev.operatingDaysPerMonth)) };
      } else {
        return model === 'garments' && prev.printsPerDay > 100
          ? { ...prev, printsPerDay: 100 }
          : prev;
      }
    });
  }, [uiMode]);

  const handleShare = useCallback(() => {
    const url = encodeInputsToURL(inputs, businessModel, uiMode, uiMode === 'basic' ? basicModeVolume : null);
    navigator.clipboard.writeText(url).then(() => {
      toast.success('Link copied!', {
        description: 'Share this URL to pre-fill the calculator with your current configuration.',
        duration: 3500,
      });
    }).catch(() => {
      window.prompt('Copy this link to share your configuration:', url);
    });
  }, [inputs, businessModel, uiMode, basicModeVolume]);

  const scrollToResults = () => {
    setMobileResultsOpen(true);
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Page header */}
      <div className="border-b border-border bg-white">
        <div className="container py-6 sm:py-8">
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#45C1BF' }}>
            DTF Station North America
          </p>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                Equipment ROI Calculator
              </h1>
              <p className="mt-1.5 text-muted-foreground text-sm max-w-lg">
                Configure your production setup and see exactly how fast your investment pays for itself.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0 self-start mt-1">
              {mode === 'calculator' && (
                <button
                  onClick={handleShare}
                  className="no-print flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-all"
                >
                  <Share2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Share Results</span>
                </button>
              )}
            </div>
          </div>

          {/* Mode toggle */}
          <div className="flex items-center gap-1 mt-4 bg-muted/50 rounded-lg p-1 w-fit">
            <button
              onClick={() => setMode('calculator')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                mode === 'calculator'
                  ? 'bg-white shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Calculator className="w-3.5 h-3.5" />
              Calculator
            </button>
            <button
              onClick={() => setMode('comparison')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                mode === 'comparison'
                  ? 'bg-white shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              Compare
            </button>
          </div>
        </div>
      </div>

      {/* Main layout */}
      <div className="container py-6 sm:py-8">
        {mode === 'comparison' ? (
          <ComparisonMode />
        ) : (
          <div className="space-y-5">

            {/* Basic / Advanced mode toggle */}
            <div className="space-y-1.5">
              <div className="flex rounded-lg border border-border bg-white overflow-hidden w-fit">
                <button
                  onClick={() => setUIMode('basic')}
                  className={`flex items-center gap-1.5 px-5 py-2.5 text-sm font-medium transition-colors ${
                    uiMode !== 'basic' ? 'text-muted-foreground hover:text-foreground hover:bg-muted/40' : ''
                  }`}
                  style={uiMode === 'basic' ? { background: '#45C1BF', color: '#0d3534' } : {}}
                >
                  Basic
                </button>
                <button
                  onClick={() => setUIMode('advanced')}
                  className={`flex items-center gap-1.5 px-5 py-2.5 text-sm font-medium transition-colors border-l border-border ${
                    uiMode !== 'advanced' ? 'text-muted-foreground hover:text-foreground hover:bg-muted/40' : ''
                  }`}
                  style={uiMode === 'advanced' ? { background: '#45C1BF', color: '#0d3534' } : {}}
                >
                  Advanced
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                {uiMode === 'basic'
                  ? 'Estimate your monthly profit in under a minute — no experience needed.'
                  : 'Fine-tune every input for a precise break-even and ROI projection.'}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[440px_1fr] gap-6 lg:gap-8 items-start">

              {/* LEFT — Inputs */}
              <div className="space-y-4">
                {uiMode === 'basic' ? (
                  <>
                    <BasicMode
                      inputs={inputs}
                      businessModel={businessModel}
                      onBusinessModelChange={handleBusinessModelChange}
                      onPrinterChange={handlePrinterChange}
                      onBundleSelect={handleBundleSelect}
                      onChange={updateInput}
                      basicModeVolume={basicModeVolume}
                      breakEvenMonthlyVolume={breakEvenMonthlyVolume}
                      onVolumeChange={handleVolumeChange}
                    />
                    <div className="lg:hidden">
                      <button
                        onClick={scrollToResults}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90"
                        style={{ background: '#45C1BF', color: '#0d3534' }}
                      >
                        <ChevronUp className="w-4 h-4" />
                        View ROI Results
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Step tabs */}
                    <div className="flex rounded-lg border border-border bg-white overflow-hidden">
                      {STEPS.map((step, i) => {
                        const isActive = activeSection === step.id;
                        const isDone = completedSteps.includes(step.id);
                        return (
                          <button
                            key={step.id}
                            onClick={() => setActiveSection(step.id)}
                            className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 text-xs sm:text-sm font-medium transition-colors ${
                              i > 0 ? 'border-l border-border' : ''
                            } ${
                              !isActive && !isDone ? 'text-muted-foreground hover:text-foreground hover:bg-muted/40' : ''
                            }`}
                            style={
                              isActive
                                ? { background: '#45C1BF', color: '#0d3534' }
                                : isDone
                                ? { color: '#45C1BF' }
                                : {}
                            }
                          >
                            <span
                              className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full text-xs font-semibold flex items-center justify-center shrink-0 ${
                                !isActive && !isDone ? 'bg-muted text-muted-foreground' : ''
                              }`}
                              style={
                                isActive
                                  ? { background: 'rgba(0,0,0,0.1)', color: '#0d3534' }
                                  : isDone
                                  ? { background: 'rgba(69,193,191,0.12)', color: '#45C1BF' }
                                  : {}
                              }
                            >
                              {isDone ? '✓' : step.num}
                            </span>
                            {step.label}
                          </button>
                        );
                      })}
                    </div>

                    {/* Step content */}
                    {activeSection === 'equipment' && (
                      <EquipmentSelector
                        inputs={inputs}
                        onPrinterChange={handlePrinterChange}
                        onShakerChange={(id: string) => updateInput('shakerId', id)}
                        onHeatPressChange={(id: string) => updateInput('heatPressId', id)}
                        onCutterChange={(id) => updateInput('cutterId', id)}
                        onOtherEquipmentChange={(ids) => updateInput('otherEquipmentIds', ids)}
                        onBundleSelect={handleBundleSelect}
                        onContinue={() => setActiveSection('business')}
                      />
                    )}
                    {activeSection === 'business' && (
                      <BusinessInputs
                        inputs={inputs}
                        onChange={updateInput}
                        onBack={() => setActiveSection('equipment')}
                        onContinue={() => setActiveSection('financing')}
                        businessModel={businessModel}
                        onBusinessModelChange={handleBusinessModelChange}
                      />
                    )}
                    {activeSection === 'financing' && (
                      <FinancingInputs
                        inputs={inputs}
                        results={results}
                        onChange={updateInput}
                        onBack={() => setActiveSection('business')}
                      />
                    )}

                    {/* Mobile: "View Results" sticky button */}
                    <div className="lg:hidden">
                      <button
                        onClick={scrollToResults}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90"
                        style={{ background: '#45C1BF', color: '#0d3534' }}
                      >
                        <ChevronUp className="w-4 h-4" />
                        View ROI Results
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* RIGHT — Live Results */}
              <div ref={resultsRef} className="lg:sticky lg:top-[72px]">
                <div className="lg:hidden mb-2">
                  <button
                    onClick={() => setMobileResultsOpen(o => !o)}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-border bg-white text-sm font-semibold text-foreground"
                  >
                    <span>ROI Results — {results.monthlyNetProfit > 0 ? `$${Math.round(results.monthlyNetProfit / 1000 * 10) / 10}K/mo profit` : 'Configure above'}</span>
                    <ChevronUp
                      className="w-4 h-4 text-muted-foreground transition-transform"
                      style={{ transform: mobileResultsOpen ? 'rotate(0deg)' : 'rotate(180deg)' }}
                    />
                  </button>
                </div>

                <div className={`${mobileResultsOpen ? 'block' : 'hidden'} lg:block`}>
                  <ResultsDashboard
                    results={results}
                    inputs={inputs}
                    onShare={handleShare}
                    businessModel={businessModel}
                    uiMode={uiMode}
                    breakEvenMonthlyVolume={breakEvenMonthlyVolume}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-border mt-12">
        <div className="container py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} DTF Station North America. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Results are projections based on your inputs. Actual results may vary.
          </p>
          <p className="text-xs text-muted-foreground">
            Equipment prices are estimates and subject to change. Contact a dealer for current pricing.
          </p>
        </div>
      </footer>
    </div>
  );
}
