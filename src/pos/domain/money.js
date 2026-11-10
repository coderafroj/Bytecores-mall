// Money is stored as integer paise everywhere to avoid floating-point bugs.
// Rs 99.50  ->  9950 paise.
export class Money {
  static toPaise(rupees) {
    const n = Number(rupees);
    if (!Number.isFinite(n)) return 0;
    return Math.round(n * 100);
  }
  static toRupees(paise) {
    return (paise || 0) / 100;
  }
  static format(paise, { symbol = '₹', compact = false } = {}) {
    const r = Money.toRupees(paise);
    if (compact && Math.abs(r) >= 1000) {
      if (Math.abs(r) >= 10000000) return `${symbol}${(r / 10000000).toFixed(2)}Cr`;
      if (Math.abs(r) >= 100000) return `${symbol}${(r / 100000).toFixed(2)}L`;
      return `${symbol}${(r / 1000).toFixed(1)}k`;
    }
    return `${symbol}${r.toLocaleString('en-IN', {
      minimumFractionDigits: Number.isInteger(r) ? 0 : 2,
      maximumFractionDigits: 2,
    })}`;
  }
}
