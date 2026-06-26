/**
 * DTF Station ROI Calculator — Data & Financial Model
 *
 * Pricing sourced from DTF Station Dealer Price Sheet (MAP column = retail price).
 * Last updated: March 2026
 */

// ─── Printer ────────────────────────────────────────────────────────────────

export interface PrinterModel {
  id: string;
  name: string;
  series: string;
  sku: string;
  tier: 'beginner' | 'intermediate' | 'advanced' | 'industrial';
  printWidth: string;
  dailyOutputMin: number;
  dailyOutputMax: number;
  dailyOutputDefault: number;
  speedSqFtHr: number;
  basePrice: number;
  /** Bundle prices (printer + specific shaker). When present, used instead of basePrice + shaker.basePrice. */
  shakerBundlePrices?: Record<string, number>;
  description: string;
  features: string[];
  recommendedShaker: string;
  inkCostPreset: number; // Recommended monthly ink cost ($) based on typical usage
}

export const PRINTERS: PrinterModel[] = [
  {
    id: 'r1',
    name: 'Prestige R1',
    series: 'Prestige',
    sku: 'PRESTIGE-R1',
    tier: 'beginner',
    printWidth: '13"',
    dailyOutputMin: 60,
    dailyOutputMax: 80,
    dailyOutputDefault: 70,
    speedSqFtHr: 14,
    basePrice: 4995,
    description: 'Compact entry-level DTF printer for newcomers. Easy to operate with smart automation.',
    features: ['Epson F1080 printhead', 'WIMS white ink management', 'Auto-cleaning', '13" print width'],
    recommendedShaker: 'miro13',
    inkCostPreset: 150,
  },
  {
    id: 'r2pro',
    name: 'Prestige R2 Pro',
    series: 'Prestige',
    sku: 'PRESTIGE-R2PRO-C',
    tier: 'beginner',
    printWidth: '13"',
    dailyOutputMin: 240,
    dailyOutputMax: 360,
    dailyOutputDefault: 300,
    speedSqFtHr: 43.5,
    basePrice: 8495,
    description: 'Compact professional printer with dual printheads and smart automation for growing shops.',
    features: ['Dual Epson i1600 heads', 'Active auto-cleaning', 'Head-strike sensor', 'Built-in sheet cutter'],
    recommendedShaker: 'miro13',
    inkCostPreset: 250,
  },
  {
    id: 'xl2',
    name: 'Prestige XL2',
    series: 'Prestige XL',
    sku: 'PRESTIGE-XL2-DTF',
    tier: 'advanced',
    printWidth: '24"',
    dailyOutputMin: 510,
    dailyOutputMax: 660,
    dailyOutputDefault: 580,
    speedSqFtHr: 82.9,
    basePrice: 15995,
    description: '24" advanced production printer with dual i3200 heads for high-volume shops.',
    features: ['Dual Epson i3200 heads', '24" print width', '82.9 sq ft/hr', '510–660 pcs/day'],
    recommendedShaker: 'miro24',
    inkCostPreset: 700,
  },
  {
    id: 'xl2pro',
    name: 'Prestige XL2 Pro',
    series: 'Prestige XL',
    sku: 'PRESTIGE-XL2PRO',
    tier: 'advanced',
    printWidth: '24"',
    dailyOutputMin: 350,
    dailyOutputMax: 500,
    dailyOutputDefault: 425,
    speedSqFtHr: 90,
    basePrice: 21256,
    shakerBundlePrices: { miro24: 26251, seismoL24R: 29805 },
    description: '24" professional printer with enhanced speed and dual i3200 heads for growing production shops.',
    features: ['Dual Epson i3200 heads', '24" print width', 'Enhanced automation', '350–500 pcs/day'],
    recommendedShaker: 'miro24',
    inkCostPreset: 800,
  },
  {
    id: 'xl3',
    name: 'Prestige XL3',
    series: 'Prestige XL',
    sku: 'PRESTIGE-XL3',
    tier: 'advanced',
    printWidth: '24"',
    dailyOutputMin: 700,
    dailyOutputMax: 900,
    dailyOutputDefault: 800,
    speedSqFtHr: 110,
    basePrice: 19995,
    description: '24" high-performance printer with triple i3200 heads for serious production environments.',
    features: ['Triple Epson i3200 heads', '24" print width', '110 sq ft/hr', '700–900 pcs/day'],
    recommendedShaker: 'seismoL24R',
    inkCostPreset: 950,
  },
  {
    id: 'xl4',
    name: 'Prestige XL4',
    series: 'Prestige XL',
    sku: 'PRESTIGE-XL4',
    tier: 'industrial',
    printWidth: '24"',
    dailyOutputMin: 1000,
    dailyOutputMax: 1200,
    dailyOutputDefault: 1100,
    speedSqFtHr: 150,
    basePrice: 22995,
    description: 'Fastest 24" DTF printer with quad i3200 heads for maximum production throughput.',
    features: ['Quad Epson i3200 heads', '24" print width', 'Fastest 24" available', '1000–1200 pcs/day'],
    recommendedShaker: 'seismoL24R',
    inkCostPreset: 1200,
  },
  {
    id: 'x6',
    name: 'Prestige X6',
    series: 'Prestige X',
    sku: 'PRESTIGE-X6',
    tier: 'industrial',
    printWidth: '36"',
    dailyOutputMin: 1100,
    dailyOutputMax: 1440,
    dailyOutputDefault: 1270,
    speedSqFtHr: 180,
    basePrice: 28092,
    description: 'Largest and fastest 36" printer with 9-color gamut (CMYK+W+LcLmGO) for premium output.',
    features: ['Six Epson i3200 heads', '36.6" print width', '9-color gamut', '1100–1440 pcs/day'],
    recommendedShaker: 'seismoV36R',
    inkCostPreset: 1800,
  },
];

// ─── Shaker ──────────────────────────────────────────────────────────────────

export interface ShakerModel {
  id: string;
  name: string;
  sku: string;
  width: string;
  basePrice: number;
  description: string;
  type: 'manual' | 'automatic';
}

export const SHAKERS: ShakerModel[] = [
  {
    id: 'miro13',
    name: 'Miro 13 Max',
    sku: 'DTFS-MIRO13-MAX',
    width: '13"',
    basePrice: 1995,
    description: 'All-in-one shaker/dryer for 13" setups with bottom platen heating and built-in purifier.',
    type: 'automatic',
  },
  {
    id: 'miro16',
    name: 'Miro 16',
    sku: 'DTFS-MIRO16-SE',
    width: '16"',
    basePrice: 3950,
    description: 'Dedicated 16" shaker/dryer with patented bottom heating and built-in purifier.',
    type: 'automatic',
  },
  {
    id: 'miro24',
    name: 'Miro 24',
    sku: 'DTFS-MIRO24',
    width: '24"',
    basePrice: 4995,
    description: '24" shaker/dryer with reduced power consumption at 1,700W.',
    type: 'automatic',
  },
  {
    id: 'seismoL16R',
    name: 'Seismo L16R',
    sku: 'L16R-SHAKER',
    width: '16"',
    basePrice: 6995,
    description: 'Production 16" shaker with touch screen and automatic powder reuse.',
    type: 'automatic',
  },
  {
    id: 'seismoL24R',
    name: 'Seismo L24R',
    sku: 'L24R-SHAKER',
    width: '24"',
    basePrice: 7995,
    description: 'Production 24" shaker with touch screen and automatic powder reuse.',
    type: 'automatic',
  },
  {
    id: 'seismoV36R',
    name: 'Seismo V36R',
    sku: 'V36R-SHAKER',
    width: '36"',
    basePrice: 9528,
    description: 'High-capacity 36" production shaker for the Prestige X6 wide-format system.',
    type: 'automatic',
  },
];

// ─── Shaker compatibility map ─────────────────────────────────────────────────
// Maps printer ID → array of compatible shaker IDs (in display order)

export const PRINTER_SHAKER_COMPAT: Record<string, string[]> = {
  r1:     ['miro13'],
  r2pro:  ['miro13'],
  xl2:    ['miro24', 'seismoL24R'],
  xl2pro: ['miro24', 'seismoL24R'],
  xl3:    ['miro24', 'seismoL24R'],
  xl4:    ['seismoL24R'],
  x6:     ['seismoV36R'],
};

// ─── Heat Press ───────────────────────────────────────────────────────────────

export interface HeatPressModel {
  id: string;
  name: string;
  sku: string;
  basePrice: number;
  description: string;
  /** If set, only show this option when the selected printer is in this list */
  printerRestriction?: string[];
}

export const HEAT_PRESSES: HeatPressModel[] = [
  {
    id: 'prismaAuto',
    name: 'Prisma Auto (16"×20")',
    sku: 'PRISMA-AUTO-1620',
    basePrice: 1399,
    description: 'Industrial auto heat press for standard production environments.',
  },
  {
    id: 'prismaDual',
    name: 'Prisma Dual',
    sku: 'PRISMA-DUAL',
    basePrice: 7900,
    description: 'Dual-platen industrial heat press for XL2 and above — maximises throughput.',
    printerRestriction: ['xl2', 'xl2pro', 'xl3', 'xl4', 'x6'],
  },
  {
    id: 'none',
    name: 'I already have a heat press',
    sku: 'N/A',
    basePrice: 0,
    description: 'No heat press needed — using existing equipment.',
  },
];

// ─── Cutter ───────────────────────────────────────────────────────────────────

export interface CutterModel {
  id: string;
  name: string;
  sku: string;
  basePrice: number;
  description: string;
  compatiblePrinters: string[];
}

export const CUTTERS: CutterModel[] = [
  {
    id: 'arc127',
    name: 'Arc 127',
    sku: 'ARC-127',
    basePrice: 13445,
    description: 'Precision DTF film cutter for 24" production systems.',
    compatiblePrinters: ['xl2', 'xl2pro', 'xl3', 'xl4'],
  },
  {
    id: 'arc136',
    name: 'Arc 136',
    sku: 'ARC-136',
    basePrice: 16178,
    description: 'Wide-format DTF film cutter for the Prestige X6 36" system.',
    compatiblePrinters: ['x6'],
  },
];

// ─── Other Equipment (R1 / R2 Pro alternative finishing options) ──────────────

export interface OtherEquipmentModel {
  id: string;
  name: string;
  sku: string;
  basePrice: number;
  description: string;
  compatiblePrinters: string[];
}

export const OTHER_EQUIPMENT: OtherEquipmentModel[] = [
  {
    id: 'phoenixAir',
    name: 'Phoenix Air 16×20',
    sku: 'PHOENIX-AIR-1620',
    basePrice: 1099,
    description: 'Compact curing oven ideal for lower-volume sheet printing.',
    compatiblePrinters: ['r1', 'r2pro'],
  },
  {
    id: 'seismoS20',
    name: 'Seismo S20 Desktop Shaker',
    sku: 'SEISMO-S20',
    basePrice: 1195,
    description: 'Desktop powder shaker for low-volume sheet-based DTF workflows.',
    compatiblePrinters: ['r1', 'r2pro'],
  },
];

// ─── Bundle Presets ───────────────────────────────────────────────────────────

export interface BundlePreset {
  id: string;
  label: string;
  description: string;
  printerId: string;
  shakerId: string;
  heatPressId: string;
  cutterId: string | null;
  otherEquipmentIds: string[];
}

export const BUNDLE_PRESETS: BundlePreset[] = [
  {
    id: 'starter',
    label: 'Starter',
    description: 'R2 Pro + Miro 13 Max',
    printerId: 'r2pro',
    shakerId: 'miro13',
    heatPressId: 'prismaAuto',
    cutterId: null,
    otherEquipmentIds: [],
  },
  {
    id: 'intermediate',
    label: 'Intermediate',
    description: 'XL2 + Miro 24',
    printerId: 'xl2',
    shakerId: 'miro24',
    heatPressId: 'prismaAuto',
    cutterId: 'arc127',
    otherEquipmentIds: [],
  },
  {
    id: 'advanced',
    label: 'Advanced',
    description: 'X6 + Seismo V36R',
    printerId: 'x6',
    shakerId: 'seismoV36R',
    heatPressId: 'prismaAuto',
    cutterId: 'arc136',
    otherEquipmentIds: [],
  },
];

// ─── ROI Inputs / Results ─────────────────────────────────────────────────────

export interface ROIInputs {
  printerId: string;
  shakerId: string;
  heatPressId: string;
  cutterId: string | null;
  otherEquipmentIds: string[];
  // Business parameters — transfers
  printsPerDay: number;
  operatingDaysPerMonth: number;
  sellingPricePerPrint: number;
  filmAndPowderCostPerPrint: number;   // film + powder cost per print
  inkCostPerMonth: number;             // monthly ink cost (flat)
  laborHoursPerDay: number;
  laborCostPerHour: number;
  outsourcingCostPerPrint: number;
  currentMonthlyOutsourcingVolume: number;
  // Business parameters — garments
  sellingPricePerShirt: number;        // selling price per finished garment
  blankGarmentCostPerShirt: number;    // blank garment cost per shirt
  printsPerShirt: number;              // DTF transfers applied per shirt
  // Financing
  downPaymentPercent: number;
  loanInterestRate: number;
  loanTermMonths: number;
}

export interface ROIResults {
  totalEquipmentCost: number;
  downPayment: number;
  loanAmount: number;
  monthlyLoanPayment: number;
  monthlyPrints: number;
  monthlyRevenue: number;
  monthlyFilmPowderCost: number;
  monthlyInkCost: number;
  monthlyTotalConsumableCost: number;
  monthlyLaborCost: number;
  monthlyGrossProfit: number;
  monthlyNetProfit: number;
  monthlyOutsourcingSavings: number;
  annualRevenue: number;
  annualNetProfit: number;
  paybackPeriodMonths: number;
  threeYearROI: number;
  threeYearNetProfit: number;
  costPerPrint: number;
  profitPerPrint: number;
  profitMargin: number;
  monthlyChartData: Array<{
    month: number;
    label: string;
    cumulativeProfit: number;
    cumulativeRevenue: number;
    monthlyProfit: number;
  }>;
  costBreakdown: Array<{ name: string; value: number; color: string }>;
}

/** Returns the combined printer + shaker price, using bundle pricing when available. */
export function getPrinterShakerTotal(printer: PrinterModel, shaker: ShakerModel): number {
  if (printer.shakerBundlePrices?.[shaker.id] !== undefined) {
    return printer.shakerBundlePrices[shaker.id];
  }
  return printer.basePrice + shaker.basePrice;
}

export function calculateROI(inputs: ROIInputs, businessModel: 'transfers' | 'garments' | 'hybrid' = 'transfers'): ROIResults {
  const printer = PRINTERS.find(p => p.id === inputs.printerId) ?? PRINTERS[1];
  const shaker = SHAKERS.find(s => s.id === inputs.shakerId) ?? SHAKERS[0];
  const heatPress = HEAT_PRESSES.find(h => h.id === inputs.heatPressId) ?? HEAT_PRESSES[0];
  const cutter = inputs.cutterId ? CUTTERS.find(c => c.id === inputs.cutterId) : null;
  const otherItems = inputs.otherEquipmentIds.map(id => OTHER_EQUIPMENT.find(e => e.id === id)).filter(Boolean);

  const cutterCost = cutter?.basePrice ?? 0;
  const otherCost = otherItems.reduce((sum, e) => sum + (e?.basePrice ?? 0), 0);
  const totalEquipmentCost = getPrinterShakerTotal(printer, shaker) + heatPress.basePrice + cutterCost + otherCost;

  const downPayment = totalEquipmentCost * (inputs.downPaymentPercent / 100);
  const loanAmount = totalEquipmentCost - downPayment;

  let monthlyLoanPayment = 0;
  if (loanAmount > 0 && inputs.loanTermMonths > 0) {
    const monthlyRate = inputs.loanInterestRate / 100 / 12;
    if (monthlyRate === 0) {
      monthlyLoanPayment = loanAmount / inputs.loanTermMonths;
    } else {
      monthlyLoanPayment =
        (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, inputs.loanTermMonths)) /
        (Math.pow(1 + monthlyRate, inputs.loanTermMonths) - 1);
    }
  }

  const monthlyPrints = inputs.printsPerDay * inputs.operatingDaysPerMonth;

  // Revenue varies by business model
  const printsPerShirt = (Number.isFinite(inputs.printsPerShirt) && inputs.printsPerShirt >= 1) ? inputs.printsPerShirt : 1;
  const shirtsPerDay = inputs.printsPerDay / printsPerShirt;
  const monthlyShirts = shirtsPerDay * inputs.operatingDaysPerMonth;

  let monthlyRevenue: number;
  let monthlyBlankGarmentCost = 0;

  const sellingPricePerShirt = Number.isFinite(inputs.sellingPricePerShirt) ? inputs.sellingPricePerShirt : 18;
  const blankGarmentCostPerShirt = Number.isFinite(inputs.blankGarmentCostPerShirt) ? inputs.blankGarmentCostPerShirt : 4.5;

  if (businessModel === 'garments') {
    monthlyRevenue = monthlyShirts * sellingPricePerShirt;
    monthlyBlankGarmentCost = monthlyShirts * blankGarmentCostPerShirt;
  } else if (businessModel === 'hybrid') {
    monthlyRevenue =
      monthlyPrints * inputs.sellingPricePerPrint +
      monthlyShirts * sellingPricePerShirt;
    monthlyBlankGarmentCost = monthlyShirts * blankGarmentCostPerShirt;
  } else {
    monthlyRevenue = monthlyPrints * inputs.sellingPricePerPrint;
  }

  const monthlyFilmPowderCost = monthlyPrints * inputs.filmAndPowderCostPerPrint;
  const monthlyInkCost = inputs.inkCostPerMonth;
  const monthlyTotalConsumableCost = monthlyFilmPowderCost + monthlyInkCost + monthlyBlankGarmentCost;
  const monthlyLaborCost = inputs.laborHoursPerDay * inputs.operatingDaysPerMonth * inputs.laborCostPerHour;
  const monthlyGrossProfit = monthlyRevenue - monthlyTotalConsumableCost - monthlyLaborCost;
  const monthlyNetProfit = monthlyGrossProfit - monthlyLoanPayment;

  const monthlyOutsourcingSavings =
    businessModel === 'transfers' || businessModel === 'hybrid'
      ? inputs.currentMonthlyOutsourcingVolume *
        (inputs.outsourcingCostPerPrint - (inputs.filmAndPowderCostPerPrint + (monthlyPrints > 0 ? inputs.inkCostPerMonth / monthlyPrints : 0)))
      : 0;

  const annualRevenue = monthlyRevenue * 12;
  const annualNetProfit = monthlyNetProfit * 12;

  const paybackPeriodMonths =
    monthlyNetProfit > 0 ? Math.ceil(totalEquipmentCost / monthlyNetProfit) : 999;

  const threeYearNetProfit = monthlyNetProfit * 36 - downPayment;
  const threeYearROI = downPayment > 0 ? (threeYearNetProfit / downPayment) * 100 : 0;

  const costPerPrint = monthlyPrints > 0 ? (monthlyTotalConsumableCost + monthlyLaborCost + monthlyLoanPayment) / monthlyPrints : 0;
  const profitPerPrint = monthlyPrints > 0 ? monthlyNetProfit / monthlyPrints : 0;
  const profitMargin = monthlyRevenue > 0 ? (monthlyNetProfit / monthlyRevenue) * 100 : 0;

  const monthlyChartData = [];
  let cumulativeProfit = -downPayment;
  let cumulativeRevenue = 0;

  for (let m = 1; m <= 36; m++) {
    cumulativeProfit += monthlyNetProfit;
    cumulativeRevenue += monthlyRevenue;
    monthlyChartData.push({
      month: m,
      label: m % 6 === 0 || m === 1 ? `Mo ${m}` : '',
      cumulativeProfit: Math.round(cumulativeProfit),
      cumulativeRevenue: Math.round(cumulativeRevenue),
      monthlyProfit: Math.round(monthlyNetProfit),
    });
  }

  const costBreakdown = [
    { name: 'Film & Powder', value: Math.round(monthlyFilmPowderCost), color: '#FF6B4A' },
    { name: 'Ink', value: Math.round(monthlyInkCost), color: '#F59E0B' },
    ...(monthlyBlankGarmentCost > 0 ? [{ name: 'Blank Garments', value: Math.round(monthlyBlankGarmentCost), color: '#EC4899' }] : []),
    { name: 'Labor', value: Math.round(monthlyLaborCost), color: '#8B5CF6' },
    { name: 'Equipment Pmt', value: Math.round(monthlyLoanPayment), color: '#6B7280' },
    { name: 'Net Profit', value: Math.max(0, Math.round(monthlyNetProfit)), color: '#45C1BF' },
  ];

  return {
    totalEquipmentCost,
    downPayment,
    loanAmount,
    monthlyLoanPayment,
    monthlyPrints,
    monthlyRevenue,
    monthlyFilmPowderCost,
    monthlyInkCost,
    monthlyTotalConsumableCost,
    monthlyLaborCost,
    monthlyGrossProfit,
    monthlyNetProfit,
    monthlyOutsourcingSavings,
    annualRevenue,
    annualNetProfit,
    paybackPeriodMonths,
    threeYearROI,
    threeYearNetProfit,
    costPerPrint,
    profitPerPrint,
    profitMargin,
    monthlyChartData,
    costBreakdown,
  };
}

export function formatCurrency(value: number): string {
  if (Math.abs(value) >= 1000000) {
    return `$${(value / 1000000).toFixed(2)}M`;
  }
  if (Math.abs(value) >= 1000) {
    return `$${(value / 1000).toFixed(1)}K`;
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(Math.round(value));
}

export const DEFAULT_INPUTS: ROIInputs = {
  printerId: 'r2pro',
  shakerId: 'miro13',
  heatPressId: 'prismaAuto',
  cutterId: null,
  otherEquipmentIds: [],
  printsPerDay: 200,
  operatingDaysPerMonth: 22,
  sellingPricePerPrint: 4.50,
  filmAndPowderCostPerPrint: 0.75,
  inkCostPerMonth: 400,
  laborHoursPerDay: 4,
  laborCostPerHour: 18,
  outsourcingCostPerPrint: 3.50,
  currentMonthlyOutsourcingVolume: 500,
  sellingPricePerShirt: 18,
  blankGarmentCostPerShirt: 4.50,
  printsPerShirt: 1,
  downPaymentPercent: 20,
  loanInterestRate: 7.9,
  loanTermMonths: 36,
};
