'use client';

import React from 'react';

interface Props {
  angle: number;
  rotation: number; // random offset so the angle isn't always from 12 o'clock
  visible: boolean; // false = hidden after flash timer expires
}

const SIZE = 200;
const CX = SIZE / 2;
const CY = SIZE / 2;
const LINE_LEN = 80;

function polarToXY(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

/**
 * Shows the target angle as a clean geometric figure:
 * two lines radiating from center with a small arc between them.
 * Rotated by a random offset so it's not always measured from 12 o'clock.
 * Flashes briefly then hides.
 */
export default function AngleDisplay({ angle, rotation, visible }: Props) {
  const startDeg = rotation;
  const endDeg = rotation + angle;
  const refEnd = polarToXY(CX, CY, LINE_LEN, startDeg);
  const angleEnd = polarToXY(CX, CY, LINE_LEN, endDeg);
  const arcR = 28;

  // Arc fill path
  const arcStart = polarToXY(CX, CY, arcR, startDeg);
  const arcEnd = polarToXY(CX, CY, arcR, endDeg);
  const largeArc = angle > 180 ? 1 : 0;

  return (
    <svg
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      width="100%"
      style={{
        maxWidth: 180,
        display: 'block',
        margin: '0 auto',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.3s ease',
      }}
    >
      {/* Arc stroke */}
      <path
        d={`M ${arcStart.x} ${arcStart.y} A ${arcR} ${arcR} 0 ${largeArc} 1 ${arcEnd.x} ${arcEnd.y}`}
        fill="none"
        stroke="#1a1a1a"
        strokeWidth="1.5"
        opacity={0.5}
      />

      {/* Arc fill */}
      <path
        d={`M ${CX} ${CY} L ${arcStart.x} ${arcStart.y} A ${arcR} ${arcR} 0 ${largeArc} 1 ${arcEnd.x} ${arcEnd.y} Z`}
        fill="#1a1a1a"
        opacity={0.06}
      />

      {/* First line */}
      <line
        x1={CX} y1={CY}
        x2={refEnd.x} y2={refEnd.y}
        stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round"
      />

      {/* Second line */}
      <line
        x1={CX} y1={CY}
        x2={angleEnd.x} y2={angleEnd.y}
        stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round"
      />

      {/* Center dot */}
      <circle cx={CX} cy={CY} r={3.5} fill="#1a1a1a" />
    </svg>
  );
}
