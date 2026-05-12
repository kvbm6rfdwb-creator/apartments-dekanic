"use client";
import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, X, Search } from 'lucide-react';
import { useParams } from 'next/navigation';

interface Review {
  id: string; author: string; country: string; rating: number;
  date: string; text: string; platform: string; apartment: string;
}

const PLATFORM_MAX: Record<string, number> = { 'Booking.com': 10 };
function toFive(rating: number, platform: string): number {
  return (rating / (PLATFORM_MAX[platform] ?? 5)) * 5;
}
function halfStar(v: number) { return Math.round(v * 2) / 2; }

function Stars({ score5, size = 16 }: { score5: number; size?: number }) {
  const rounded = halfStar(Math.max(0, Math.min(5, score5)));
  return (
    <span className="flex items-center gap-px">
      {[1,2,3,4,5].map(i => {
        const full = i <= Math.floor(rounded);
        const half = !full && i - 0.5 === rounded;
        return (
          <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill="none">
            <defs>
              <linearGradient id={`hg${size}${i}`} x1="0" x2="1" y1="0" y2="0">
                <stop offset="50%" stopColor="#f59e0b"/>
                <stop offset="50%" stopColor="#e5e7eb"/>
              </linearGradient>
            </defs>
            <polygon
              fill={full ? '#f59e0b' : half ? `url(#hg${size}${i})` : '#e5e7eb'}
              points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
            />
          </svg>
        );
      })}
    </span>
  );
}

const PLATFORM_STYLE: Record<string, { bg: string; text: string; dot: string }> = {
  'Airbnb':      { bg: 'bg-rose-50',   text: 'text-rose-500',   dot: 'bg-rose-400' },
  'Booking.com': { bg: 'bg-blue-50',   text: 'text-blue-600',   dot: 'bg-blue-500' },
  'Google':      { bg: 'bg-emerald-50',text: 'text-emerald-700',dot: 'bg-emerald-500' },
  'Direct':      { bg: 'bg-stone-100', text: 'text-stone-600',  dot: 'bg-stone-400' },
};
function PlatformBadge({ platform }: { platform: string }) {
  const s = PLATFORM_STYLE[platform] || { bg: 'bg-stone-100', text: 'text-stone-500', dot: 'bg-stone-300' };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {platform}
    </span>
  );
}

const FLAG: Record<string, string> = {
  DE:'🇩🇪',AT:'🇦🇹',IT:'🇮🇹',CZ:'🇨🇿',PL:'🇵🇱',HU:'🇭🇺',SI:'🇸🇮',
  HR:'🇭🇷',GB:'🇬🇧',US:'🇺🇸',FR:'🇫🇷',ES:'🇪🇸',NL:'🇳🇱',CH:'🇨🇭',SK:'🇸🇰',RO:'🇷🇴',
};

function avgScore(reviews: Review[]) {
  if (!reviews.length) return 0;
  return reviews.reduce((s,r) => s + toFive(r.rating, r.platform), 0) / reviews.length;
}

// ── Modal ──────────────────────────────────────────────────────
function Modal({ r, onClose, onPrev, onNext, hasPrev, hasNext }: {
  r: Review; onClose: () => void;
  onPrev: () => void; onNext: () => void;
  hasPrev: boolean; hasNext: boolean;
}) {
  const score5 = toFive(r.rating, r.platform);
  const isBooking = PLATFORM_MAX[r.platform] === 10;

  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && hasPrev) onPrev();
      if (e.key === 'ArrowRight' && hasNext) onNext();
    };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [hasPrev, hasNext]);

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-md" />
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full z-10 overflow-hidden"
        style={{ boxShadow: '0 32px 80px rgba(0,0,0,0.22)' }}
        onClick={e => e.stopPropagation()}>
        {/* Header strip */}
        <div className="bg-stone-50 border-b border-stone-100 px-6 pt-6 pb-5">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-sand-200 to-sand-300 flex items-center justify-center text-lg font-bold text-sand-800 flex-shrink-0">
              {r.author.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-stone-900">{r.author}</p>
              <p className="text-xs text-stone-400 mt-0.5">
                {FLAG[r.country] ?? ''}{r.country ? ` ${r.country} · ` : ''}{new Date(r.date).toLocaleDateString('en',{month:'long',year:'numeric'})}
              </p>
            </div>
            <PlatformBadge platform={r.platform} />
            <button onClick={onClose}
              className="w-7 h-7 rounded-full bg-stone-200 hover:bg-stone-300 flex items-center justify-center transition-colors ml-1 flex-shrink-0">
              <X size={13} className="text-stone-600" />
            </button>
          </div>
          <div className="flex items-center gap-2.5 mt-4">
            <Stars score5={score5} size={20} />
            <span className="text-2xl font-black text-stone-900 tabular-nums leading-none">{score5.toFixed(1)}</span>
            <span className="text-stone-300">/5</span>
            {isBooking && (
              <span className="text-xs text-stone-400 bg-white border border-stone-200 rounded-lg px-2 py-0.5">
                {r.rating}/10 on Booking.com
              </span>
            )}
          </div>
        </div>
        {/* Body */}
        <div className="px-6 py-5 max-h-64 overflow-y-auto">
          <p className="text-stone-700 leading-relaxed text-sm italic">&ldquo;{r.text}&rdquo;</p>
        </div>
        {/* Nav footer */}
        <div className="border-t border-stone-100 px-6 py-3 flex items-center justify-between bg-stone-50">
          <button onClick={onPrev} disabled={!hasPrev}
            className="flex items-center gap-1.5 text-xs font-semibold text-stone-500 disabled:opacity-30 hover:text-stone-800 transition-colors">
            <ChevronLeft size={14} /> Previous
          </button>
          <span className="text-[11px] text-stone-400">← → to navigate · Esc to close</span>
          <button onClick={onNext} disabled={!hasNext}
            className="flex items-center gap-1.5 text-xs font-semibold text-stone-500 disabled:opacity-30 hover:text-stone-800 transition-colors">
            Next <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Review Card ────────────────────────────────────────────────
function ReviewCard({ r, onOpen, index }: { r: Review; onOpen: (i: number) => void; index: number }) {
  const score5 = toFive(r.rating, r.platform);
  const isBooking = PLATFORM_MAX[r.platform] === 10;
  const TRUNCATE = 130;
  const isLong = r.text.length > TRUNCATE;

  return (
    <article
      onClick={() => isLong && onOpen(index)}
      className={`group bg-white rounded-2xl border border-stone-100 p-5 flex flex-col gap-3.5
        hover:shadow-[0_8px_32px_rgba(0,0,0,0.09)] hover:-translate-y-0.5 transition-all duration-300
        ${isLong ? 'cursor-pointer' : ''}`}
      style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
      {/* Author */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sand-100 to-sand-200 flex items-center justify-center font-bold text-sand-700 text-sm flex-shrink-0">
            {r.author.charAt(0)}
          </div>
          <div>
            <p className="font-semibold text-stone-800 text-sm leading-tight">{r.author}</p>
            <p className="text-[11px] text-stone-400 mt-px">
              {FLAG[r.country] ?? ''} {new Date(r.date).toLocaleDateString('en',{month:'short',year:'numeric'})}
            </p>
          </div>
        </div>
        <PlatformBadge platform={r.platform} />
      </div>
      {/* Stars */}
      <div className="flex items-center gap-2">
        <Stars score5={score5} size={13} />
        <span className="text-xs font-bold text-stone-800 tabular-nums">{score5.toFixed(1)}</span>
        <span className="text-[11px] text-stone-300">/5</span>
        {isBooking && <span className="text-[10px] text-stone-400">({r.rating}/10)</span>}
      </div>
      {/* Text */}
      <p className="text-stone-500 text-[13px] leading-relaxed italic flex-1">
        &ldquo;{r.text.length > TRUNCATE ? r.text.slice(0, TRUNCATE) + '…' : r.text}&rdquo;
      </p>
      {isLong && (
        <p className="text-[11px] font-semibold text-sand-600 group-hover:text-sand-800 transition-colors">
          Read more →
        </p>
      )}
    </article>
  );
}

// ── Score bar ──────────────────────────────────────────────────
function ScoreBar({ label, count, total, active, onClick }: {
  label: number; count: number; total: number; active: boolean; onClick: () => void;
}) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <button onClick={onClick} className="w-full flex items-center gap-2.5 group">
      <span className="flex items-center gap-1 w-10 flex-shrink-0 justify-end">
        <span className={`text-xs font-semibold tabular-nums ${active ? 'text-stone-900' : 'text-stone-400'}`}>{label}</span>
        <svg className="w-3 h-3 flex-shrink-0" viewBox="0 0 24 24">
          <polygon fill="#f59e0b" points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
        </svg>
      </span>
      <div className="flex-1 h-1.5 bg-stone-100 rounded-full overflow-hidden">
        <div className={`h-1.5 rounded-full transition-all duration-500 ${active ? 'bg-amber-400' : 'bg-stone-300 group-hover:bg-stone-400'}`}
          style={{ width: `${pct}%`, minWidth: pct > 0 ? '4px' : '0' }} />
      </div>
      <span className={`text-[11px] tabular-nums w-4 text-right flex-shrink-0 ${count === 0 ? 'text-stone-300' : active ? 'text-stone-900 font-bold' : 'text-stone-400'}`}>
        {count}
      </span>
    </button>
  );
}


// ── Main ───────────────────────────────────────────────────────
const PAGE_SIZE = 8;

export default function Reviews() {
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading]   = useState(true);
  const [filterStar, setFilterStar]         = useState<number | null>(null);
  const [filterPlatform, setFilterPlatform] = useState('all');
  const [modalIdx, setModalIdx] = useState<number | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/site-data?locale=${locale}`, { cache: 'no-store' })
      .then((r): Promise<any> => r.ok ? r.json() : Promise.resolve({}))
      .then((d: any) => {
        const clean: Review[] = (d.reviews || [])
          .filter((r: any) => r?.id)
          .map((r: any) => ({
            id: r.id, author: r.author || 'Guest', country: r.country || '',
            rating: Number(r.rating) || 5, date: r.date || '',
            text: r.text || '', platform: r.platform || 'Direct', apartment: r.apartment || '',
          }))
          .sort((a: Review, b: Review) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setReviews(clean);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [locale]);

  // Reset visible count when filters change (must be before early return — Rules of Hooks)
  useEffect(() => { setVisibleCount(PAGE_SIZE); }, [filterStar, filterPlatform]);

  if (loading || reviews.length === 0) return null;

  const avg = avgScore(reviews);
  const buckets: Record<number,number> = {5:0,4:0,3:0,2:0,1:0};
  reviews.forEach(r => { const b = Math.max(1,Math.min(5,Math.round(toFive(r.rating,r.platform)))); buckets[b]++; });
  const platforms = Array.from(new Set(reviews.map(r => r.platform)));

  // Filtered for preview grid
  const filtered = reviews.filter(r => {
    const starOk = filterStar === null || Math.round(toFive(r.rating,r.platform)) === filterStar;
    const platOk = filterPlatform === 'all' || r.platform === filterPlatform;
    return starOk && platOk;
  });

  const visibleReviews = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  function setFilter(star: number|null, plat: string) {
    setFilterStar(star); setFilterPlatform(plat);
  }

  const modalList = reviews; // modal navigates full unfiltered list
  const modalReview = modalIdx !== null ? modalList[modalIdx] : null;

  return (
    <section id="reviews" className="py-24 bg-[#faf9f7]">
      {modalReview && (
        <Modal r={modalReview} onClose={() => setModalIdx(null)}
          onPrev={() => setModalIdx(i => i !== null ? Math.max(0, i-1) : null)}
          onNext={() => setModalIdx(i => i !== null ? Math.min(modalList.length-1, i+1) : null)}
          hasPrev={(modalIdx ?? 0) > 0}
          hasNext={(modalIdx ?? 0) < modalList.length - 1} />
      )}


      <div className="max-w-7xl mx-auto px-6">
        {/* ── Header ── */}
        <div className="mb-12 reveal">
          <p className="text-sand-600 text-xs tracking-[.3em] uppercase font-semibold mb-3 text-center">Guest Reviews</p>
          <h2 className="font-serif text-4xl md:text-5xl text-stone-900 font-light mb-10 text-center">What Our Guests Say</h2>

          {/* Score card */}
          <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-stone-100 p-6 flex gap-6 items-center"
            style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
            <div className="flex flex-col items-center gap-2 flex-shrink-0 w-28">
              <span className="text-5xl font-black text-stone-900 tabular-nums leading-none">{avg.toFixed(1)}</span>
              <Stars score5={avg} size={18} />
              <span className="text-[11px] text-stone-400 text-center">{reviews.length} verified review{reviews.length!==1?'s':''}</span>
            </div>
            <div className="w-px self-stretch bg-stone-100" />
            <div className="flex-1 flex flex-col gap-2 min-w-0">
              {[5,4,3,2,1].map(s => (
                <ScoreBar key={s} label={s} count={buckets[s]} total={reviews.length}
                  active={filterStar===s}
                  onClick={() => setFilter(filterStar===s ? null : s, filterPlatform)} />
              ))}
            </div>
          </div>
        </div>

        {/* ── Filter pills ── */}
        <div className="flex flex-wrap items-center gap-2 mb-8 reveal">
          {['all',...platforms].map(p => (
            <button key={p} onClick={() => setFilter(filterStar, filterPlatform===p&&p!=='all' ? 'all' : p)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                filterPlatform===p ? 'bg-stone-900 text-white border-stone-900' : 'bg-white text-stone-500 border-stone-200 hover:border-stone-400'
              }`}>{p==='all'?'All platforms':p}</button>
          ))}
          <span className="text-stone-200 mx-1 text-lg">·</span>
          <button onClick={() => setFilter(null, filterPlatform)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              filterStar===null ? 'bg-stone-900 text-white border-stone-900' : 'bg-white text-stone-500 border-stone-200 hover:border-stone-400'
            }`}>All stars</button>
          {[5,4,3,2,1].map(s => {
            const count = buckets[s]; const active = filterStar===s;
            return (
              <button key={s} onClick={() => setFilter(active?null:s, filterPlatform)} disabled={count===0&&!active}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  active ? 'bg-amber-400 text-white border-amber-400'
                  : count===0 ? 'bg-white text-stone-300 border-stone-100 cursor-default'
                  : 'bg-white text-stone-500 border-stone-200 hover:border-amber-300'
                }`}>
                <svg className="w-3 h-3" viewBox="0 0 24 24">
                  <polygon fill={active?'white':count===0?'#d1d5db':'#f59e0b'} points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
                </svg>
                {s}★ <span className="opacity-60">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Active filter summary */}
        {(filterStar!==null||filterPlatform!=='all') && (
          <div className="flex items-center gap-2 mb-6">
            <p className="text-xs text-stone-400">{filtered.length} review{filtered.length!==1?'s':''}{filterStar?` · ${filterStar}★`:''}{filterPlatform!=='all'?` · ${filterPlatform}`:''}</p>
            <button onClick={() => setFilter(null,'all')} className="text-[11px] text-stone-400 hover:text-stone-700 underline underline-offset-2">Clear</button>
          </div>
        )}

        {/* ── Preview grid ── */}
        {visibleReviews.length === 0 ? (
          <p className="text-center text-stone-400 py-12 text-sm">No reviews match the selected filters.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8" id="reviews-grid">
            {visibleReviews.map((r) => (
              <ReviewCard key={r.id} r={r} index={reviews.indexOf(r)} onOpen={idx => setModalIdx(idx)} />
            ))}
          </div>
        )}

        {/* ── Show more ── */}
        {hasMore && (
          <div className="flex flex-col items-center gap-3 mt-2">
            <div className="flex items-center justify-center gap-4 w-full">
              <div className="flex-1 h-px bg-stone-200" />
              <button
                onClick={() => setVisibleCount(c => c + PAGE_SIZE)}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white border border-stone-200 text-sm font-semibold text-stone-700 hover:bg-stone-50 hover:border-stone-300 hover:shadow-md transition-all duration-200"
                style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-stone-400"><polyline points="6 9 12 15 18 9"/></svg>
                Show more · {filtered.length - visibleCount} remaining
              </button>
              <div className="flex-1 h-px bg-stone-200" />
            </div>
            <p className="text-xs text-stone-400">{visibleCount} of {filtered.length} reviews</p>
          </div>
        )}
        {!hasMore && visibleCount > PAGE_SIZE && (
          <div className="flex items-center justify-center gap-4 mt-2">
            <div className="flex-1 h-px bg-stone-200" />
            <button onClick={() => setVisibleCount(PAGE_SIZE)}
              className="text-xs text-stone-400 hover:text-stone-600 transition-colors px-4 py-2">
              ↑ Show less
            </button>
            <div className="flex-1 h-px bg-stone-200" />
          </div>
        )}
      </div>
    </section>
  );
}
