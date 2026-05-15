"use client";
import React, { useId } from "react";

type Props = { className?: string };

function GlowDefs({ a, b, id }: { a: string; b: string; id: string }) {
  const grad = `${id}-g`;
  const glow = `${id}-glow`;
  return (
    <defs>
      <linearGradient id={grad} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor={a} />
        <stop offset="100%" stopColor={b} />
      </linearGradient>
      <filter id={glow} x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="2.1" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
  );
}

export function StatLocationGlyph({ className }: Props) {
  const id = useId();
  const grad = `${id}-g`;
  const glow = `${id}-glow`;
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <GlowDefs id={id} a="rgba(255,255,255,0.85)" b="rgba(255,255,255,0.35)" />
      <g filter={`url(#${glow})`}>
        <path
          d="M32 58s16-14.1 16-28A16 16 0 0 0 16 30c0 13.9 16 28 16 28Z"
          fill={`url(#${grad})`}
          stroke="rgba(255,255,255,0.28)"
          strokeWidth="1.2"
        />
        <circle cx="32" cy="30" r="6.5" fill="rgba(0,0,0,0.10)" />
        <circle cx="32" cy="30" r="6.5" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1" />
      </g>
    </svg>
  );
}

export function StatTempGlyph({ className }: Props) {
  const id = useId();
  const grad = `${id}-g`;
  const glow = `${id}-glow`;
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <GlowDefs id={id} a="rgba(253, 186, 116, 0.95)" b="rgba(245, 158, 11, 0.55)" />
      <g filter={`url(#${glow})`}>
        <path
          d="M30 12a6 6 0 0 1 12 0v22.5a11 11 0 1 1-12 0V12Z"
          fill="rgba(255,255,255,0.10)"
          stroke="rgba(255,255,255,0.22)"
          strokeWidth="1.2"
        />
        <path
          d="M36 14a2 2 0 0 0-4 0v24.9l-.7.4A7.5 7.5 0 1 0 40 46.5c0-3-1.8-5.7-4.7-6.8l-.7-.3V14Z"
          fill={`url(#${grad})`}
          opacity="0.95"
        />
        <circle cx="34" cy="46.5" r="5.2" fill="rgba(255,255,255,0.18)" />
      </g>
    </svg>
  );
}

export function StatHumidityGlyph({ className }: Props) {
  const id = useId();
  const grad = `${id}-g`;
  const glow = `${id}-glow`;
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <GlowDefs id={id} a="rgba(147,197,253,0.95)" b="rgba(59,130,246,0.55)" />
      <g filter={`url(#${glow})`}>
        <path
          d="M32 10S18 28.7 18 40a14 14 0 0 0 28 0C46 28.7 32 10 32 10Z"
          fill={`url(#${grad})`}
          stroke="rgba(255,255,255,0.25)"
          strokeWidth="1.2"
        />
        <path
          d="M26 40c0 5 4 9 9 9"
          fill="none"
          stroke="rgba(255,255,255,0.45)"
          strokeWidth="2.2"
          strokeLinecap="round"
          opacity="0.9"
        />
      </g>
    </svg>
  );
}

export function StatAirQualityGlyph({ className }: Props) {
  const id = useId();
  const grad = `${id}-g`;
  const glow = `${id}-glow`;
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <GlowDefs id={id} a="rgba(134,239,172,0.95)" b="rgba(34,197,94,0.55)" />
      <g filter={`url(#${glow})`}>
        <path
          d="M14 38c10-10 26-10 36 0"
          fill="none"
          stroke={`url(#${grad})`}
          strokeWidth="4.2"
          strokeLinecap="round"
          opacity="0.95"
        />
        <path
          d="M18 44c8-8 20-8 28 0"
          fill="none"
          stroke="rgba(255,255,255,0.25)"
          strokeWidth="3.2"
          strokeLinecap="round"
          opacity="0.9"
        />
        <path
          d="M22 50c6-6 14-6 20 0"
          fill="none"
          stroke="rgba(255,255,255,0.20)"
          strokeWidth="2.6"
          strokeLinecap="round"
          opacity="0.9"
        />
        <circle cx="50" cy="26" r="6.6" fill="rgba(255,255,255,0.10)" stroke="rgba(255,255,255,0.22)" strokeWidth="1.2" />
        <path
          d="M46.4 26l2.2 2.2 5-5"
          fill="none"
          stroke={`url(#${grad})`}
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}

export function StatWindGlyph({ className }: Props) {
  const id = useId();
  const grad = `${id}-g`;
  const glow = `${id}-glow`;
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <GlowDefs id={id} a="rgba(134,239,172,0.95)" b="rgba(34,197,94,0.55)" />
      <g filter={`url(#${glow})`}>
        <path
          d="M10 26h28c6 0 6-10 0-10"
          fill="none"
          stroke={`url(#${grad})`}
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M10 36h36c7 0 7-12 0-12"
          fill="none"
          stroke="rgba(255,255,255,0.25)"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        <path
          d="M10 46h24c6 0 6 10 0 10"
          fill="none"
          stroke="rgba(255,255,255,0.22)"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}

