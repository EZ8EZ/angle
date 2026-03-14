'use client';

import React from 'react';

interface Props {
  angle: number;
}

const SIZE = 200;
const CX = SIZE / 2;
const CY = SIZE / 2;
const LINE_LEN = 80;

function polarToXY(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(cx: number, cy: number, r: number, startDeg: number, endDeg: number): string {
  let sweep = endDeg - startDeg;
  if (sweep < 0) sweep += 360;
  const largeArc = sweep > 180 ? 1 : 0;
  const start = polarToXY(cx, cy, r, startDeg);
  const end = polarToXY(cx, cy, r, endDeg);
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}

/**
 * Shows the target angle as a clean geometric figure:
 * two lines radiating from center with a small arc between them.
 * No numbers, no markings — pure visual.
 */
export default function AngleDisplay({ angle }: Props) {
  const refEnd = polarToXY(CX, CY, LINE_LEN, 0);
  const angleEnd = polarToXY(CX, CY, LINE_LEN, angle);
  const arcR = 28;

  return (
    <svg
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      width="100%"
      style={{ maxWidth: 180, display: 'block', margin: '0 auto' }}
    >
      {/* Subtle arc between the two lines */}
      <path
        d={arcPath(CX, CY, arcR, 0, angle)}
        fill="none"
        stroke="#1a1a1a"
        strokeWidth="1.5"
        opacity={0.5}
      />

      {/* Arc fill */}
      {angle > 0 && (
        <path
          d={`M ${CX} ${CY} L ${polarToXY(CX, CY, arcR, 0).x} ${polarToXY(CX, CY, arcR, 0).y} A ${arcR} ${arcR} 0 ${angle > 180 ? 1 : 0} 1 ${polarToXY(CX, CY, arcR, angle).x} ${polarToXY(CX, CY, arcR, angle).y} Z`}
          fill="#1a1a1a"
          opacity={0.06}
        />
      )}

      {/* Reference line (0° — straight up) */}
      <line
        x1={CX}
        y1={CY}
        x2={refEnd.x}
        y2={refEnd.y}
        stroke="#1a1a1a"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Target angle line */}
      <line
        x1={CX}
        y1={CY}
        x2={angleEnd.x}
        y2={angleEnd.y}
        stroke="#1a1a1a"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Center dot */}
      <circle cx={CX} cy={CY} r={3.5} fill="#1a1a1a" />
    </svg>
  );
}
