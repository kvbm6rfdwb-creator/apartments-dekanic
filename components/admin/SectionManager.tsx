"use client";
import { useState } from 'react';
import { GripVertical, Eye, EyeOff, Lock, ChevronUp, ChevronDown } from 'lucide-react';

interface PageSection {
  id: string;
  label: string;
  enabled: boolean;
  locked?: boolean;
  [key: string]: any;
}

interface SectionManagerProps {
  sections: PageSection[];
  onChange: (sections: PageSection[]) => void;
  [key: string]: any;
}

const SECTION_ICONS: Record<string, string> = {
  hero:       '🖼️',
  whyBook:    '✅',
  apartments: '🏠',
  reviews:    '⭐',
  location:   '📍',
  contact:    '📞',
};

const SECTION_DESC: Record<string, string> = {
  hero:       'Full-screen photo with headline and button',
  whyBook:    '"No fees · Best price · Direct contact" strip',
  apartments: 'Cards for all your apartments',
  reviews:    'Guest review cards from Airbnb / Booking.com',
  location:   'Google Maps embed + directions',
  contact:    'Phone, email and WhatsApp buttons',
};

export default function SectionManager({ sections, onChange }: SectionManagerProps) {
  const [dragIdx, setDragIdx]   = useState<number | null>(null);
  const [overIdx, setOverIdx]   = useState<number | null>(null);

  const toggle = (idx: number) => {
    if (sections[idx].locked) return;
    const next = [...sections];
    next[idx] = { ...next[idx], enabled: !next[idx].enabled };
    onChange(next);
  };

  const move = (from: number, dir: -1 | 1) => {
    const to = from + dir;
    if (to < 0 || to >= sections.length) return;
    // Don't move locked items or move past locked items
    if (sections[from].locked || sections[to].locked) return;
    const next = [...sections];
    [next[from], next[to]] = [next[to], next[from]];
    onChange(next);
  };

  const rename = (idx: number, label: string) => {
    const next = [...sections];
    next[idx] = { ...next[idx], label };
    onChange(next);
  };

  // Drag handlers
  const onDragStart = (idx: number) => setDragIdx(idx);
  const onDragEnter = (idx: number) => setOverIdx(idx);
  const onDragEnd   = () => {
    if (dragIdx !== null && overIdx !== null && dragIdx !== overIdx) {
      const s = sections[dragIdx];
      const t = sections[overIdx];
      if (!s.locked && !t.locked) {
        const next = [...sections];
        next.splice(dragIdx, 1);
        next.splice(overIdx, 0, s);
        onChange(next);
      }
    }
    setDragIdx(null);
    setOverIdx(null);
  };

  return (
    <div className="space-y-2">
      <p className="text-xs text-stone-400 mb-3 flex items-center gap-1.5">
        <GripVertical size={12} />
        Drag rows to reorder · Toggle eye to show/hide · Click name to rename
        · <Lock size={11} /> = required section
      </p>

      {sections.map((sec, idx) => (
        <div
          key={sec.id}
          draggable={!sec.locked}
          onDragStart={() => !sec.locked && onDragStart(idx)}
          onDragEnter={() => onDragEnter(idx)}
          onDragEnd={onDragEnd}
          onDragOver={e => e.preventDefault()}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-150
            ${!sec.enabled ? 'opacity-40 bg-stone-50 border-stone-200' : 'bg-white border-stone-200 hover:border-stone-300 hover:shadow-sm'}
            ${overIdx === idx && dragIdx !== idx ? 'border-sand-400 bg-sand-50 scale-[1.01]' : ''}
            ${dragIdx === idx ? 'opacity-30 scale-95' : ''}
            ${sec.locked ? '' : 'cursor-grab active:cursor-grabbing'}`}
        >
          {/* Drag handle */}
          <div className={`flex-shrink-0 ${sec.locked ? 'text-stone-200' : 'text-stone-400'}`}>
            {sec.locked ? <Lock size={14} className="text-stone-300" /> : <GripVertical size={16} />}
          </div>

          {/* Position badge */}
          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-stone-100 text-stone-500 text-xs font-bold flex items-center justify-center">
            {idx + 1}
          </span>

          {/* Icon */}
          <span className="text-xl leading-none flex-shrink-0">{SECTION_ICONS[sec.id] || '📄'}</span>

          {/* Editable label */}
          <div className="flex-1 min-w-0">
            <input
              value={sec.label}
              onChange={e => rename(idx, e.target.value)}
              className="w-full bg-transparent text-sm font-semibold text-stone-800 focus:outline-none focus:bg-stone-50 focus:px-2 focus:py-0.5 focus:rounded-lg transition-all"
            />
            <p className="text-xs text-stone-400 mt-0.5 truncate">{SECTION_DESC[sec.id] || ''}</p>
          </div>

          {/* Up/down arrows */}
          <div className="flex flex-col gap-0.5 flex-shrink-0">
            <button type="button" onClick={() => move(idx, -1)}
              disabled={idx === 0 || sec.locked || sections[idx-1]?.locked}
              className="p-0.5 text-stone-300 hover:text-stone-600 disabled:opacity-0 transition-colors">
              <ChevronUp size={14} />
            </button>
            <button type="button" onClick={() => move(idx, 1)}
              disabled={idx === sections.length - 1 || sec.locked || sections[idx+1]?.locked}
              className="p-0.5 text-stone-300 hover:text-stone-600 disabled:opacity-0 transition-colors">
              <ChevronDown size={14} />
            </button>
          </div>

          {/* Toggle eye */}
          <button type="button" onClick={() => toggle(idx)}
            disabled={!!sec.locked}
            title={sec.locked ? 'Required — cannot hide' : sec.enabled ? 'Hide this section' : 'Show this section'}
            className={`flex-shrink-0 p-2 rounded-lg transition-all
              ${sec.locked ? 'text-stone-200 cursor-default' : sec.enabled ? 'text-stone-500 hover:text-stone-800 hover:bg-stone-100' : 'text-red-400 hover:text-red-600 hover:bg-red-50'}`}>
            {sec.enabled ? <Eye size={16} /> : <EyeOff size={16} />}
          </button>
        </div>
      ))}

      <div className="bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-xs text-stone-400 mt-2">
        🔒 <strong>Hero</strong> and <strong>Apartments</strong> are required and cannot be hidden or moved — every rental website needs them.
        All other sections are optional and freely reorderable.
      </div>
    </div>
  );
}
