'use client';

import React, { useRef, useCallback } from 'react';

interface Props {
  angle: number;
  submitted: boolean;
  answerAngle?: number;
  onAngleChange: (angle: number) => void;
}

const SIZE = 320;
const CX = SIZE / 2;
const CY = SIZE / 2;
const R = 130;
const TICK_OUTER = R + 2;
const TICK_MINOR = 8;
const TICK_MAJOR = 14;

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
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y} Z`;
}

export default function Protractor({ angle, submitted, answerAngle, onAngleChange }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const dragging = useRef(false);

  const getAngleFromEvent = useCallback(
    (clientX: number, clientY: number) => {
      const svg = svgRef.current;
      if (!svg) return 0;
      const rect = svg.getBoundingClientRect();
      const scaleX = SIZE / rect.width;
      const scaleY = SIZE / rect.height;
      const x = (clientX - rect.left) * scaleX - CX;
      const y = (clientY - rect.top) * scaleY - CY;
      let deg = (Math.atan2(x, -y) * 180) / Math.PI;
      if (deg < 0) deg += 360;
      return Math.round(deg);
    },
    []
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (submitted) return;
      dragging.current = true;
      (e.target as Element).setPointerCapture?.(e.pointerId);
      onAngleChange(getAngleFromEvent(e.clientX, e.clientY));
    },
    [submitted, getAngleFromEvent, onAngleChange]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging.current || submitted) return;
      onAngleChange(getAngleFromEvent(e.clientX, e.clientY));
    },
    [submitted, getAngleFromEvent, onAngleChange]
  );

  const handlePointerUp = useCallback(() => {
    dragging.current = false;
  }, []);

  // Tick marks — no labels, pure perception
  const ticks: React.ReactNode[] = [];
  for (let d = 0; d < 360; d += 5) {
    const isMajor = d % 30 === 0;
    const len = isMajor ? TICK_MAJOR : TICK_MINOR;
    const outer = polarToXY(CX, CY, TICK_OUTER, d);
    const inner = polarToXY(CX, CY, TICK_OUTER - len, d);
    ticks.push(
      <line
        key={`tick-${d}`}
        x1={outer.x}
        y1={outer.y}
        x2={inner.x}
        y2={inner.y}
        stroke="#1a1a1a"
        strokeWidth={isMajor ? 1.5 : 0.75}
        strokeLinecap="round"
      />
    );
  }

  const guessEnd = polarToXY(CX, CY, R, angle);
  const refEnd = polarToXY(CX, CY, R, 0);
  const guessColor = submitted ? '#c8a050' : '#3366cc';

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      width="100%"
      style={{ maxWidth: SIZE, touchAction: 'none', display: 'block', margin: '0 auto' }}
      className={`protractor-interactive${submitted ? ' submitted' : ''}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {/* White backing circle — clips out dot grid */}
      <circle cx={CX} cy={CY} r={R + 18} fill="#faf8f4" />
      {/* Inner circle */}
      <circle cx={CX} cy={CY} r={R} fill="#ffffff" stroke="#e8e4de" strokeWidth="1" />

      {/* Guess arc fill */}
      {angle > 0 && (
        <path d={arcPath(CX, CY, R, 0, angle)} fill={guessColor} opacity={0.11} />
      )}

      {/* Answer arc fill (after submit) */}
      {submitted && answerAngle !== undefined && answerAngle > 0 && (
        <path d={arcPath(CX, CY, R, 0, answerAngle)} fill="#3ca064" opacity={0.11} />
      )}

      {/* Ticks */}
      {ticks}

      {/* Reference line (0° dashed) */}
      <line
        x1={CX}
        y1={CY}
        x2={refEnd.x}
        y2={refEnd.y}
        stroke="#ddd"
        strokeWidth="1.5"
        strokeDasharray="5 4"
      />

      {/* Guess line */}
      <line
        x1={CX}
        y1={CY}
        x2={guessEnd.x}
        y2={guessEnd.y}
        stroke={guessColor}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx={guessEnd.x} cy={guessEnd.y} r={5} fill={guessColor} />

      {/* Answer line (after submit) */}
      {submitted && answerAngle !== undefined && (() => {
        const end = polarToXY(CX, CY, R, answerAngle);
        return (
          <>
            <line
              x1={CX}
              y1={CY}
              x2={end.x}
              y2={end.y}
              stroke="#3ca064"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <circle cx={end.x} cy={end.y} r={5} fill="#3ca064" />
          </>
        );
      })()}

      {/* Center pivot */}
      <circle cx={CX} cy={CY} r={5} fill={guessColor} />
    </svg>
  );
}
