'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Stats } from '@/lib/game';

interface Props {
  open: boolean;
  onClose: () => void;
  stats: Stats;
}

// Buckets for total daily score (out of 300)
const BUCKETS = ['0–60', '61–120', '121–180', '181–240', '241–300'];

function bucketize(scores: number[]): number[] {
  const counts = [0, 0, 0, 0, 0];
  for (const s of scores) {
    if (s <= 60) counts[0]++;
    else if (s <= 120) counts[1]++;
    else if (s <= 180) counts[2]++;
    else if (s <= 240) counts[3]++;
    else counts[4]++;
  }
  return counts;
}

export default function StatsModal({ open, onClose, stats }: Props) {
  const avg = stats.gamesPlayed > 0 ? Math.round(stats.totalScore / stats.gamesPlayed) : 0;
  const counts = bucketize(stats.scores);
  const maxCount = Math.max(...counts, 1);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(26,26,26,0.25)',
              zIndex: 50,
            }}
          />
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.25 }}
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: '#faf8f4',
              border: '1px solid #e8e4de',
              padding: '32px 28px',
              width: '92%',
              maxWidth: 360,
              zIndex: 51,
              fontFamily: 'Georgia, serif',
            }}
          >
            {/* Close */}
            <button
              onClick={onClose}
              style={{
                position: 'absolute',
                top: 12,
                right: 14,
                background: 'none',
                border: 'none',
                fontSize: 20,
                cursor: 'pointer',
                color: '#1a1a1a',
                fontFamily: 'Georgia, serif',
              }}
              aria-label="Close"
            >
              &times;
            </button>

            <h2 style={{ fontSize: 14, letterSpacing: '0.15em', textTransform: 'uppercase', margin: '0 0 20px' }}>
              Statistics
            </h2>

            {/* Summary row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
              {[
                { label: 'Played', value: stats.gamesPlayed },
                { label: 'Streak', value: stats.streak },
                { label: 'Avg', value: avg },
                { label: 'Best', value: stats.bestScore },
              ].map((item) => (
                <div key={item.label} style={{ textAlign: 'center', flex: 1 }}>
                  <div style={{ fontSize: 28, fontWeight: 'normal', lineHeight: 1 }}>{item.value}</div>
                  <div className="small-caps" style={{ marginTop: 4, color: '#888' }}>{item.label}</div>
                </div>
              ))}
            </div>

            {/* Distribution */}
            {stats.scores.length > 0 && (
              <>
                <h3 style={{ fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', margin: '0 0 12px', color: '#888' }}>
                  Score Distribution
                </h3>
                <svg viewBox="0 0 280 120" width="100%" style={{ display: 'block' }}>
                  {counts.map((c, i) => {
                    const barW = 40;
                    const gap = 16;
                    const x = i * (barW + gap);
                    const maxH = 80;
                    const h = Math.max(2, (c / maxCount) * maxH);
                    return (
                      <g key={i}>
                        <rect
                          x={x}
                          y={maxH - h}
                          width={barW}
                          height={h}
                          fill="#1a1a1a"
                          opacity={0.75}
                        />
                        <text
                          x={x + barW / 2}
                          y={maxH - h - 6}
                          textAnchor="middle"
                          fontSize="10"
                          fill="#1a1a1a"
                          fontFamily="Georgia, serif"
                        >
                          {c}
                        </text>
                        <text
                          x={x + barW / 2}
                          y={maxH + 16}
                          textAnchor="middle"
                          fontSize="8"
                          fill="#999"
                          fontFamily="Georgia, serif"
                        >
                          {BUCKETS[i]}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
