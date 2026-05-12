export interface Season {
  name: string;
  from: string;   // "MM-DD"
  to:   string;   // "MM-DD"
  nightly: number;
}
export interface Fee {
  name:      string;
  amount:    number;
  type:      'per_stay' | 'per_night' | 'per_person';
  showGuest: boolean;   // if false, only shown in admin/host view
}
export interface Pricing {
  defaultNightly: number;
  cleaningFee?:   number;  // legacy, prefer fees[]
  fees:           Fee[];
  seasons:        Season[];
}

export function nightlyRateForDate(date: Date, pricing: Pricing): number {
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const md = `${mm}-${dd}`;
  for (const s of pricing.seasons) {
    const wraps = s.from > s.to;
    const inRange = wraps ? (md >= s.from || md <= s.to) : (md >= s.from && md <= s.to);
    if (inRange) return s.nightly;
  }
  return pricing.defaultNightly;
}

export interface FeeBreakdown {
  name:      string;
  amount:    number;
  showGuest: boolean;
}
export interface PriceBreakdown {
  nights:        number;
  subtotal:      number;     // nightly total
  feesGuest:     FeeBreakdown[];   // fees visible to guest
  feesHost:      FeeBreakdown[];   // all fees (host view)
  totalGuest:    number;     // what guest sees
  totalHost:     number;     // full cost incl hidden fees
  perNight:      number;
  nightGroups:   { label: string; nights: number; rate: number; subtotal: number
}[];
}

export function calcPrice(from: Date, to: Date, pricing: Pricing, guests = 1): PriceBreakdown {
  const nights = Math.round((to.getTime() - from.getTime()) / 86_400_000);
  const groups: Record<string, { label: string; nights: number; rate: number }> = {};

  for (let i = 0; i < nights; i++) {
    const d    = new Date(from.getTime() + i * 86_400_000);
    const rate = nightlyRateForDate(d, pricing);
    const key  = String(rate);
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const md = `${mm}-${dd}`;
    let label = 'Base rate';
    for (const s of pricing.seasons) {
      const wraps = s.from > s.to;
      const inRange = wraps ? (md >= s.from || md <= s.to) : (md >= s.from && md <= s.to);
      if (inRange && s.nightly === rate) { label = s.name; break; }
    }
    if (!groups[key]) groups[key] = { label, nights: 0, rate };
    groups[key].nights++;
  }

  const nightGroups = Object.values(groups).map(g => ({ ...g, subtotal: g.nights * g.rate }));
  const subtotal = nightGroups.reduce((s, g) => s + g.subtotal, 0);
  const perNight = nights > 0 ? subtotal / nights : pricing.defaultNightly;

  // Build fee breakdowns
  const fees: FeeBreakdown[] = (pricing.fees || []).map(f => {
    let amount = f.amount;
    if (f.type === 'per_night')  amount = f.amount * nights;
    if (f.type === 'per_person') amount = f.amount * guests;
    return { name: f.name, amount, showGuest: f.showGuest };
  });

  const feesGuest = fees.filter(f => f.showGuest);
  const feesHost  = fees;
  const totalGuest = subtotal + feesGuest.reduce((s, f) => s + f.amount, 0);
  const totalHost  = subtotal + feesHost.reduce((s, f) => s + f.amount, 0);

  return { nights, subtotal, feesGuest, feesHost, totalGuest, totalHost, perNight, nightGroups };
}

export function fmtEur(n: number): string {
  return `€${Math.round(n).toLocaleString('de-DE')}`;
}
