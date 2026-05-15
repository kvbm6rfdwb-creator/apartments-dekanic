"use client";
import React, { useId } from 'react';

type IconProps = {
  className?: string;
};

export type WeatherKind = 'sun' | 'partly' | 'cloud' | 'fog' | 'rain' | 'snow' | 'storm';

export function WeatherSunGlyph({ className }: IconProps) {
  const id = useId();
  const gradId = `${id}-sun-grad`;
  const glowId = `${id}-sun-glow`;
  const rimId = `${id}-sun-rim`;

  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <defs>
        <radialGradient id={gradId} cx="30%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="55%" stopColor="#FBBF24" />
          <stop offset="100%" stopColor="#F59E0B" />
        </radialGradient>
        <radialGradient id={rimId} cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.55)" />
          <stop offset="55%" stopColor="rgba(255,255,255,0.10)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
        <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* rays */}
      <g
        stroke="#FCD34D"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.95"
        filter={`url(#${glowId})`}
      >
        <line x1="32" y1="6" x2="32" y2="14" />
        <line x1="32" y1="50" x2="32" y2="58" />
        <line x1="6" y1="32" x2="14" y2="32" />
        <line x1="50" y1="32" x2="58" y2="32" />
        <line x1="12.2" y1="12.2" x2="18" y2="18" />
        <line x1="46" y1="46" x2="51.8" y2="51.8" />
        <line x1="12.2" y1="51.8" x2="18" y2="46" />
        <line x1="46" y1="18" x2="51.8" y2="12.2" />
      </g>

      {/* sun disc */}
      <circle cx="32" cy="32" r="12.5" fill={`url(#${gradId})`} />
      <circle cx="32" cy="32" r="12.5" fill={`url(#${rimId})`} opacity="0.9" />
      <circle cx="32" cy="32" r="12.5" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
    </svg>
  );
}

export function WeatherCloudGlyph({ className }: IconProps) {
  const id = useId();
  const gradId = `${id}-cloud-grad`;
  const shadowId = `${id}-cloud-shadow`;
  const glossId = `${id}-cloud-gloss`;

  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.85)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.35)" />
        </linearGradient>
        <linearGradient id={glossId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.45)" />
          <stop offset="45%" stopColor="rgba(255,255,255,0.10)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
        <filter id={shadowId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.2" result="blur" />
          <feColorMatrix
            in="blur"
            type="matrix"
            values="0 0 0 0 0
                    0 0 0 0 0
                    0 0 0 0 0
                    0 0 0 .45 0"
            result="shadow"
          />
          <feMerge>
            <feMergeNode in="shadow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <g filter={`url(#${shadowId})`}>
        <path
          d="M22 46h24a12 12 0 0 0 1.2-23.9A15 15 0 0 0 18.4 27.5A9.5 9.5 0 0 0 22 46Z"
          fill={`url(#${gradId})`}
          stroke="rgba(255,255,255,0.25)"
          strokeWidth="1"
        />
        <path
          d="M22.8 45.2h22.9a10.9 10.9 0 0 0 1-21.8A13.8 13.8 0 0 0 19.7 28.1a8.7 8.7 0 0 0 3.1 17.1Z"
          fill={`url(#${glossId})`}
          opacity="0.9"
        />
      </g>
    </svg>
  );
}

function WeatherRainGlyph({ className }: IconProps) {
  const id = useId();
  const dropId = `${id}-rain-drop`;
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={dropId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(147,197,253,0.95)" />
          <stop offset="100%" stopColor="rgba(59,130,246,0.55)" />
        </linearGradient>
      </defs>
      <WeatherCloudGlyph className="w-full h-full" />
      <g stroke={`url(#${dropId})`} strokeWidth="2.5" strokeLinecap="round" opacity="0.9">
        <line x1="22" y1="44" x2="18" y2="54" />
        <line x1="32" y1="44" x2="28" y2="54" />
        <line x1="42" y1="44" x2="38" y2="54" />
      </g>
    </svg>
  );
}

function WeatherSnowGlyph({ className }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <WeatherCloudGlyph className="w-full h-full" />
      <g stroke="rgba(191,219,254,0.95)" strokeWidth="2" strokeLinecap="round" opacity="0.95">
        <line x1="24" y1="46" x2="24" y2="54" />
        <line x1="20.5" y1="48.5" x2="27.5" y2="51.5" />
        <line x1="27.5" y1="48.5" x2="20.5" y2="51.5" />

        <line x1="40" y1="46" x2="40" y2="54" />
        <line x1="36.5" y1="48.5" x2="43.5" y2="51.5" />
        <line x1="43.5" y1="48.5" x2="36.5" y2="51.5" />
      </g>
    </svg>
  );
}

function WeatherFogGlyph({ className }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <WeatherCloudGlyph className="w-full h-full" />
      <g stroke="rgba(255,255,255,0.45)" strokeWidth="2.4" strokeLinecap="round" opacity="0.9">
        <line x1="18" y1="46" x2="46" y2="46" />
        <line x1="14" y1="52" x2="42" y2="52" />
        <line x1="20" y1="58" x2="50" y2="58" />
      </g>
    </svg>
  );
}

function WeatherStormGlyph({ className }: IconProps) {
  const id = useId();
  const boltId = `${id}-bolt`;
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={boltId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
      </defs>
      <WeatherCloudGlyph className="w-full h-full" />
      <path
        d="M34 42l-6 11h6l-4 9 12-15h-6l4-5z"
        fill={`url(#${boltId})`}
        stroke="rgba(255,255,255,0.18)"
        strokeWidth="1"
      />
    </svg>
  );
}

function WeatherPartlyGlyph({ className }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <g transform="translate(-6,-6) scale(0.92)">
        <WeatherSunGlyph className="w-full h-full" />
      </g>
      <g transform="translate(10,10) scale(0.92)">
        <WeatherCloudGlyph className="w-full h-full" />
      </g>
    </svg>
  );
}

export function WeatherGlyph({ kind, className }: { kind: WeatherKind; className?: string }) {
  switch (kind) {
    case 'sun':
      return <WeatherSunGlyph className={className} />;
    case 'partly':
      return <WeatherPartlyGlyph className={className} />;
    case 'fog':
      return <WeatherFogGlyph className={className} />;
    case 'rain':
      return <WeatherRainGlyph className={className} />;
    case 'snow':
      return <WeatherSnowGlyph className={className} />;
    case 'storm':
      return <WeatherStormGlyph className={className} />;
    default:
      return <WeatherCloudGlyph className={className} />;
  }
}
