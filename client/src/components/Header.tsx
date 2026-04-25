/**
 * Header — DTF Station ROI Calculator
 * Clean minimal: white background, thin border, Poppins
 * Accent: #45C1BF teal
 */
export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-border">
      <div className="container flex items-center justify-between h-14">
        {/* Logo */}
        <a href="https://dtfstation.com" target="_blank" rel="noopener noreferrer" className="flex items-center">
          <img
            src="https://d2xsxph8kpxj0f.cloudfront.net/310519663445628495/MMP3WcBzYDSLu73pbsUUVC/DTFStationLogoStandard_8ffb32ff.jpg"
            alt="DTF Station North America"
            className="h-9 w-auto object-contain"
          />
        </a>

        {/* Center label */}
        <div className="hidden sm:block text-sm font-medium text-muted-foreground">
          ROI Calculator
        </div>

        {/* CTA */}
        <a
          href="https://dtfstation.com/pages/dealer-locator"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-semibold px-4 py-1.5 rounded-md transition-opacity hover:opacity-85"
          style={{ background: '#45C1BF', color: '#0d3534' }}
        >
          Find a Dealer
        </a>
      </div>
    </header>
  );
}
