/**
 * exportPDF — DTF Station ROI Calculator
 * Generates a branded print-ready HTML page in a new window and triggers the browser print dialog.
 * No external PDF library required — uses browser's built-in print-to-PDF.
 */

import { type ROIInputs, type ROIResults, PRINTERS, SHAKERS, HEAT_PRESSES, CUTTERS, OTHER_EQUIPMENT, formatCurrency } from './roiData';

function fmt(n: number) { return formatCurrency(n); }
function pct(n: number) { return `${Math.round(n)}%`; }

export function exportROIPDF(inputs: ROIInputs, results: ROIResults) {
  const printer = PRINTERS.find(p => p.id === inputs.printerId);
  const shaker = SHAKERS.find(s => s.id === inputs.shakerId);
  const heatPress = HEAT_PRESSES.find(h => h.id === inputs.heatPressId);
  const cutter = inputs.cutterId ? CUTTERS.find(c => c.id === inputs.cutterId) : null;
  const otherItems = inputs.otherEquipmentIds.map(id => OTHER_EQUIPMENT.find(e => e.id === id)).filter(Boolean);

  const equipmentList = [
    printer ? `${printer.name} — ${fmt(printer.basePrice)}` : null,
    shaker ? `${shaker.name} — ${fmt(shaker.basePrice)}` : null,
    heatPress && heatPress.basePrice > 0 ? `${heatPress.name} — ${fmt(heatPress.basePrice)}` : heatPress ? `${heatPress.name} — (existing)` : null,
    cutter ? `${cutter.name} — ${fmt(cutter.basePrice)}` : null,
    ...otherItems.map(e => e ? `${e.name} — ${fmt(e.basePrice)}` : null),
  ].filter(Boolean);

  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const paybackText = results.paybackPeriodMonths >= 999
    ? 'N/A (adjust volume or pricing)'
    : `${results.paybackPeriodMonths} month${results.paybackPeriodMonths === 1 ? '' : 's'}`;

  // Build SVG sparkline for 36-month trajectory
  const chartData = results.monthlyChartData;
  const minVal = Math.min(...chartData.map(d => d.cumulativeProfit));
  const maxVal = Math.max(...chartData.map(d => d.cumulativeProfit));
  const range = maxVal - minVal || 1;
  const W = 540, H = 100;
  const points = chartData.map((d, i) => {
    const x = (i / (chartData.length - 1)) * W;
    const y = H - ((d.cumulativeProfit - minVal) / range) * H;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  const zeroY = H - ((0 - minVal) / range) * H;
  const zeroLine = zeroY >= 0 && zeroY <= H
    ? `<line x1="0" y1="${zeroY.toFixed(1)}" x2="${W}" y2="${zeroY.toFixed(1)}" stroke="#e5e7eb" stroke-width="1" stroke-dasharray="4,3"/>`
    : '';

  // Find breakeven month
  const breakevenMonth = chartData.find(d => d.cumulativeProfit >= 0)?.month;
  const breakevenLabel = breakevenMonth ? `Breakeven at month ${breakevenMonth}` : 'Breakeven not reached in 36 months';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>DTF Station ROI Report — ${printer?.name ?? 'Custom Configuration'}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Poppins', sans-serif;
      color: #111827;
      background: #fff;
      font-size: 11px;
      line-height: 1.5;
    }
    @page { size: A4; margin: 0; }
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
    .page {
      width: 210mm;
      min-height: 297mm;
      padding: 10mm 12mm 8mm;
      display: flex;
      flex-direction: column;
      gap: 6mm;
    }
    /* Header */
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-bottom: 4mm;
      border-bottom: 2px solid #45C1BF;
    }
    .header-left { display: flex; flex-direction: column; gap: 2px; }
    .brand-label { font-size: 8px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #45C1BF; }
    .report-title { font-size: 18px; font-weight: 800; color: #111827; line-height: 1.1; }
    .report-sub { font-size: 10px; color: #6b7280; margin-top: 1px; }
    .header-right { text-align: right; }
    .header-date { font-size: 9px; color: #9ca3af; }
    .logo-text { font-size: 14px; font-weight: 800; color: #111827; letter-spacing: -0.02em; }
    .logo-accent { color: #45C1BF; }
    /* Section title */
    .section-title {
      font-size: 8px;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: #9ca3af;
      margin-bottom: 3mm;
    }
    /* KPI grid */
    .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 3mm; }
    .kpi-card {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      padding: 3mm 4mm;
    }
    .kpi-label { font-size: 8px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 1mm; }
    .kpi-value { font-size: 18px; font-weight: 800; color: #45C1BF; line-height: 1; }
    .kpi-sub { font-size: 8px; color: #9ca3af; margin-top: 1mm; }
    /* Two column layout */
    .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 4mm; }
    /* Equipment list */
    .eq-card {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      padding: 3mm 4mm;
    }
    .eq-item {
      display: flex;
      justify-content: space-between;
      padding: 1.5mm 0;
      border-bottom: 1px solid #f3f4f6;
      font-size: 10px;
    }
    .eq-item:last-child { border-bottom: none; }
    .eq-name { color: #374151; font-weight: 500; }
    .eq-price { color: #111827; font-weight: 700; font-variant-numeric: tabular-nums; }
    .eq-total {
      display: flex;
      justify-content: space-between;
      padding: 2mm 0 0;
      font-size: 11px;
      font-weight: 700;
      color: #111827;
    }
    /* Monthly breakdown */
    .breakdown-table { width: 100%; border-collapse: collapse; }
    .breakdown-table td { padding: 1.5mm 2mm; font-size: 10px; border-bottom: 1px solid #f3f4f6; }
    .breakdown-table tr:last-child td { border-bottom: none; }
    .breakdown-table .label { color: #6b7280; }
    .breakdown-table .value { text-align: right; font-weight: 600; font-variant-numeric: tabular-nums; }
    .breakdown-table .value.positive { color: #45C1BF; }
    .breakdown-table .value.negative { color: #ef4444; }
    .breakdown-table .total-row td { font-weight: 700; font-size: 11px; padding-top: 2mm; border-top: 2px solid #e5e7eb; }
    /* Chart */
    .chart-card {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      padding: 3mm 4mm;
    }
    .chart-label { font-size: 8px; color: #9ca3af; margin-top: 1mm; text-align: center; }
    /* Assumptions */
    .assumptions-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2mm; }
    .assumption-item { font-size: 9px; color: #6b7280; }
    .assumption-item strong { color: #374151; display: block; }
    /* Footer */
    .footer {
      margin-top: auto;
      padding-top: 4mm;
      border-top: 1px solid #e5e7eb;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .footer-note { font-size: 8px; color: #9ca3af; max-width: 140mm; }
    .footer-cta {
      background: #45C1BF;
      color: #0d3534;
      font-weight: 700;
      font-size: 9px;
      padding: 2mm 5mm;
      border-radius: 4px;
      text-decoration: none;
      white-space: nowrap;
    }
  </style>
</head>
<body>
<div class="page">

  <!-- Header -->
  <div class="header">
    <div class="header-left">
      <span class="brand-label">DTF Station North America</span>
      <h1 class="report-title">Equipment ROI Report</h1>
      <p class="report-sub">${equipmentList[0] ?? 'Custom Configuration'}</p>
    </div>
    <div class="header-right">
      <div class="logo-text">DTF<span class="logo-accent"> STATION</span></div>
      <div class="header-date">Generated ${today}</div>
    </div>
  </div>

  <!-- KPI Row -->
  <div>
    <div class="section-title">Key Performance Indicators</div>
    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-label">Monthly Net Profit</div>
        <div class="kpi-value">${fmt(results.monthlyNetProfit)}</div>
        <div class="kpi-sub">${fmt(results.monthlyRevenue)} revenue</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Payback Period</div>
        <div class="kpi-value">${paybackText}</div>
        <div class="kpi-sub">to recover investment</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Annual Net Profit</div>
        <div class="kpi-value">${fmt(results.annualNetProfit)}</div>
        <div class="kpi-sub">Year 1 projection</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">3-Year ROI</div>
        <div class="kpi-value">${pct(results.threeYearROI)}</div>
        <div class="kpi-sub">${fmt(results.threeYearNetProfit)} net</div>
      </div>
    </div>
  </div>

  <!-- Equipment + Monthly Breakdown -->
  <div class="two-col">
    <!-- Equipment -->
    <div>
      <div class="section-title">Equipment Configuration</div>
      <div class="eq-card">
        ${equipmentList.map(item => `
        <div class="eq-item">
          <span class="eq-name">${item?.split(' — ')[0]}</span>
          <span class="eq-price">${item?.split(' — ')[1]}</span>
        </div>`).join('')}
        <div class="eq-total">
          <span>Total Investment</span>
          <span>${fmt(results.totalEquipmentCost)}</span>
        </div>
      </div>
    </div>

    <!-- Monthly Breakdown -->
    <div>
      <div class="section-title">Monthly Financial Breakdown</div>
      <div class="eq-card">
        <table class="breakdown-table">
          <tr>
            <td class="label">Monthly Revenue</td>
            <td class="value positive">${fmt(results.monthlyRevenue)}</td>
          </tr>
          <tr>
            <td class="label">Film & Powder Cost</td>
            <td class="value negative">−${fmt(results.monthlyFilmPowderCost)}</td>
          </tr>
          <tr>
            <td class="label">Monthly Ink Cost</td>
            <td class="value negative">−${fmt(results.monthlyInkCost)}</td>
          </tr>
          <tr>
            <td class="label">Labor Cost</td>
            <td class="value negative">−${fmt(results.monthlyLaborCost)}</td>
          </tr>
          <tr>
            <td class="label">Equipment Payment</td>
            <td class="value negative">−${fmt(results.monthlyLoanPayment)}</td>
          </tr>
          <tr class="total-row">
            <td class="label">Net Profit</td>
            <td class="value positive">${fmt(results.monthlyNetProfit)}</td>
          </tr>
        </table>
      </div>
    </div>
  </div>

  <!-- 36-Month Chart -->
  <div>
    <div class="section-title">36-Month Cumulative Profit Trajectory</div>
    <div class="chart-card">
      <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" style="width:100%;height:auto;display:block;">
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#45C1BF" stop-opacity="0.18"/>
            <stop offset="100%" stop-color="#45C1BF" stop-opacity="0"/>
          </linearGradient>
        </defs>
        ${zeroLine}
        <polyline points="${points}" fill="none" stroke="#45C1BF" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
      </svg>
      <div class="chart-label">${breakevenLabel} · Months 1–36</div>
    </div>
  </div>

  <!-- Assumptions -->
  <div>
    <div class="section-title">Input Assumptions</div>
    <div class="assumptions-grid">
      <div class="assumption-item"><strong>Prints per Day</strong>${Math.round(inputs.printsPerDay).toLocaleString()} pcs</div>
      <div class="assumption-item"><strong>Operating Days/Month</strong>${inputs.operatingDaysPerMonth} days</div>
      <div class="assumption-item"><strong>Monthly Prints</strong>${results.monthlyPrints.toLocaleString()} pcs</div>
      <div class="assumption-item"><strong>Selling Price / Print</strong>$${inputs.sellingPricePerPrint.toFixed(2)}</div>
      <div class="assumption-item"><strong>Film & Powder / Print</strong>$${inputs.filmAndPowderCostPerPrint.toFixed(2)}</div>
      <div class="assumption-item"><strong>Monthly Ink Cost</strong>${fmt(inputs.inkCostPerMonth)}</div>
      <div class="assumption-item"><strong>Labor Cost / Hour</strong>$${inputs.laborCostPerHour.toFixed(0)}</div>
      <div class="assumption-item"><strong>Profit Margin</strong>${pct(results.profitMargin)}</div>
      <div class="assumption-item"><strong>Down Payment</strong>${pct(inputs.downPaymentPercent)} (${fmt(results.downPayment)})</div>
      <div class="assumption-item"><strong>Loan Amount</strong>${fmt(results.loanAmount)}</div>
      <div class="assumption-item"><strong>APR / Term</strong>${inputs.loanInterestRate}% / ${inputs.loanTermMonths} mo</div>
    </div>
  </div>

  <!-- Footer -->
  <div class="footer">
    <p class="footer-note">
      This report is a projection based solely on the inputs provided. Actual results will vary based on market conditions, print sizes, ink coverage, and operational efficiency. DTF Station North America makes no guarantees of specific financial outcomes.
    </p>
    <a href="https://dtfstation.com/pages/dealer-locator" class="footer-cta">Find a Dealer</a>
  </div>

</div>
<script>
  window.onload = function() {
    // Small delay to allow fonts to load
    setTimeout(function() { window.print(); }, 600);
  };
</script>
</body>
</html>`;

  const win = window.open('', '_blank');
  if (win) {
    win.document.write(html);
    win.document.close();
  }
}
