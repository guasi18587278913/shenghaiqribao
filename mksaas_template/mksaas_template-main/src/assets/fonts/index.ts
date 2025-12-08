// Google Fonts removed to prevent connection timeouts in China
// Using system fonts as fallbacks

const fontNotoSans = {
  style: { fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'" },
  className: 'font-sans',
  variable: '--font-noto-sans',
};

const fontNotoSerif = {
  style: { fontFamily: "Georgia, Cambria, 'Times New Roman', Times, serif" },
  className: 'font-serif',
  variable: '--font-noto-serif',
};

const fontNotoSansMono = {
  style: { fontFamily: "Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace" },
  className: 'font-mono',
  variable: '--font-noto-sans-mono',
};

const fontBricolageGrotesque = {
  style: { fontFamily: "system-ui, -apple-system, sans-serif" },
  className: 'font-sans',
  variable: '--font-bricolage-grotesque',
};

export { fontNotoSans, fontNotoSerif, fontNotoSansMono, fontBricolageGrotesque };
