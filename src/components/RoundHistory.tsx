'use client';

import React from 'react';
import type { RoundResult } from '@/lib/game';

interface Props {
  rounds: RoundResult[];
}

/** Tiny inline SVG showing an angle */
function MiniAngle({
  angle,
  rotation,
  color,
}: {
  angle: number;
  rotation: number;
  color: string;
}) {
  const size = 40;
  const cx = size / 2;
  const cy = size / 2;
  const r = 15;

  function polar(deg: number) {
    const rad = ((deg - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }

  const startDeg = rotation;
  const endDeg = rotation + angle;
  const p1 = polar(startDeg);
  const p2 = polar(endDeg);
  const arcR = 7;
  const arcStart = {
    x: cx + arcR * Math.cos(((startDeg - 90) * Math.PI) / 180),
    y: cy + arcR * Math.sin(((startDeg - 90) * Math.PI) / 180),
  };
  const arcEnd = {
    x: cx + arcR * Math.cos(((endDeg - 90) * Math.PI) / 180),
    y: cy + arcR * Math.sin(((endDeg - 90) * Math.PI) / 180),
  };
  const largeArc = angle > 180 ? 1 : 0;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={r + 2} fill="#f2f0ec" />
      <path
        d={`M ${cx} ${cy} L ${arcStart.x} ${arcStart.y} A ${arcR} ${arcR} 0 ${largeArc} 1 ${arcEnd.x} ${arcEnd.y} Z`}
        fill={color}
        opacity={0.15}
      />
      <line x1={cx} y1={cy} x2={p1.x} y2={p1.y} stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <line x1={cx} y1={cy} x2={p2.x} y2={p2.y} stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <circle cx={cx} cy={cy} r={1.5} fill={color} />
    </svg>
  );
}

export default function RoundHistory({ rounds }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {rounds.map((r, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            alignItems: 'center',
            background: '#f5f3ef',
            borderRadius: 10,
            padding: '10px 16px',
            gap: 10,
          }}
        >
          {/* Round number */}
          <span style={{ fontSize: 14, color: '#bbb', width: 16, textAlign: 'center', flexShrink: 0 }}>
            {i + 1}
          </span>

          {/* Guess angle mini */}
          <MiniAngle angle={r.guess} rotation={0} color="#c8a050" />

          {/* Arrow */}
          <span style={{ color: '#ccc', fontSize: 14, flexShrink: 0 }}>→</span>

          {/* Answer angle mini */}
          <MiniAngle angle={r.answer} rotation={0} color="#3ca064" />

          {/* Score */}
          <span
            style={{
              marginLeft: 'auto',
              fontSize: 16,
              fontWeight: 'normal',
              fontFamily: 'Georgia, serif',
              flexShrink: 0,
            }}
          >
            {r.score}/100
          </span>
        </div>
      ))}
    </div>
  );
}
