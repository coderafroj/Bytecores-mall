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
    const value = Money.toRupees(paise);
    const sign = value < 0 ? '-' : '';     // minus goes before the rupee sign: -₹250, not ₹-250
    const r = Math.abs(value);
    if (compact && r >= 1000) {
      if (r >= 10000000) return `${sign}${symbol}${(r / 10000000).toFixed(2)}Cr`;
      if (r >= 100000) return `${sign}${symbol}${(r / 100000).toFixed(2)}L`;
      return `${sign}${symbol}${(r / 1000).toFixed(1)}k`;
    }
    return `${sign}${symbol}${r.toLocaleString('en-IN', {
      minimumFractionDigits: Number.isInteger(r) ? 0 : 2,
      maximumFractionDigits: 2,
    })}`;
  }
}
