'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Protractor from '@/components/Protractor';
import StatsModal from '@/components/StatsModal';
import {
  getDayNumber,
  getTodayAngle,
  computeScore,
  getAngularDifference,
  loadGameState,
  saveGameState,
  loadStats,
  recordScore,
  formatDate,
  type Stats,
} from '@/lib/game';

export default function Home() {
  const [angle, setAngle] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [answerAngle, setAnswerAngle] = useState<number | null>(null);
  const [displayScore, setDisplayScore] = useState(0);
  const [statsOpen, setStatsOpen] = useState(false);
  const [stats, setStats] = useState<Stats>({
    gamesPlayed: 0,
    streak: 0,
    lastDay: 0,
    bestScore: 0,
    totalScore: 0,
    scores: [],
  });
  const [copied, setCopied] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [mounted, setMounted] = useState(false);

  const dayNumber = getDayNumber();
  const animFrameRef = useRef<number>(0);

  useEffect(() => {
    setMounted(true);
    const saved = loadGameState();
    if (saved && saved.guess !== null && saved.score !== null && saved.answer !== null) {
      setAngle(saved.guess);
      setScore(saved.score);
      setAnswerAngle(saved.answer);
      setSubmitted(true);
      setDisplayScore(saved.score);
      setHasInteracted(true);
    }
    setStats(loadStats());
  }, []);

  const handleAngleChange = useCallback((newAngle: number) => {
    setAngle(newAngle);
    if (!hasInteracted) setHasInteracted(true);
  }, [hasInteracted]);

  const handleSubmit = useCallback(() => {
    if (submitted) return;
    const answer = getTodayAngle();
    const s = computeScore(angle, answer);
    setAnswerAngle(answer);
    setScore(s);
    setSubmitted(true);

    saveGameState({ dayNumber, guess: angle, score: s, answer });
    const newStats = recordScore(s);
    setStats(newStats);

    const start = performance.now();
    const duration = 500;
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      setDisplayScore(Math.round(s * progress));
      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      }
    };
    animFrameRef.current = requestAnimationFrame(animate);
  }, [angle, submitted, dayNumber]);

  const handleShare = useCallback(async () => {
    const diff = answerAngle !== null ? getAngularDifference(angle, answerAngle) : 0;
    const text = `ANGLE No. ${dayNumber} — ${formatDate()}\n${score}/100 — off by ${diff}°\nhttps://angle-game.vercel.app`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [angle, answerAngle, dayNumber, score]);

  const diff = answerAngle !== null ? getAngularDifference(angle, answerAngle) : 0;

  if (!mounted) {
    return (
      <main style={{ maxWidth: 400, margin: '0 auto', padding: '48px 20px', fontFamily: 'Georgia, serif' }}>
        <div style={{ textAlign: 'center' }}>
          <p className="small-caps" style={{ margin: '0 0 4px', color: '#888' }}>
            Loading…
          </p>
        </div>
      </main>
    );
  }

  return (
    <main
      style={{
        maxWidth: 400,
        margin: '0 auto',
        padding: '48px 20px 64px',
        fontFamily: 'Georgia, serif',
      }}
    >
      {/* Stats icon */}
      <button
        onClick={() => setStatsOpen(true)}
        aria-label="Statistics"
        style={{
          position: 'fixed',
          top: 16,
          right: 16,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 6,
          zIndex: 40,
        }}
      >
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round">
          <rect x="2" y="12" width="4" height="8" rx="0.5" />
          <rect x="9" y="6" width="4" height="14" rx="0.5" />
          <rect x="16" y="2" width="4" height="18" rx="0.5" />
        </svg>
      </button>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <p className="small-caps" style={{ margin: '0 0 6px', color: '#888' }}>
          No. {dayNumber}
        </p>
        <h1 style={{ fontSize: 42, fontWeight: 'normal', margin: '0 0 12px', letterSpacing: '0.04em' }}>
          Angle
        </h1>
        <hr style={{ border: 'none', borderTop: '1px solid #e8e4de', margin: '0 40px 12px' }} />
        <p className="small-caps" style={{ margin: 0, color: '#999' }}>
          Set the line to match the hidden angle
        </p>
      </div>

      {/* Protractor */}
      <div style={{ marginBottom: 16 }}>
        <Protractor
          angle={angle}
          submitted={submitted}
          answerAngle={answerAngle ?? undefined}
          onAngleChange={handleAngleChange}
        />
      </div>

      {/* Live readout */}
      {!submitted && (
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <span style={{ fontSize: 36, fontWeight: 'normal' }}>
            {hasInteracted ? `${angle}°` : '—'}
          </span>
        </div>
      )}

      {/* Submit button */}
      {!submitted && (
        <button
          className="submit-btn"
          onClick={handleSubmit}
          disabled={!hasInteracted}
        >
          Submit
        </button>
      )}

      {/* Results */}
      <AnimatePresence>
        {submitted && score !== null && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            style={{ marginTop: 20 }}
          >
            {/* Score */}
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 56, fontWeight: 'normal', lineHeight: 1 }}>
                {displayScore}
              </div>
              <p className="small-caps" style={{ margin: '6px 0 0', color: '#888' }}>
                Points
              </p>
            </div>

            {/* Three-column breakdown */}
            <div
              style={{
                display: 'flex',
                borderTop: '1px solid #e8e4de',
                borderBottom: '1px solid #e8e4de',
                padding: '16px 0',
              }}
            >
              <div style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ fontSize: 24 }}>{angle}°</div>
                <p className="small-caps" style={{ margin: '4px 0 0', color: '#888' }}>Your Guess</p>
              </div>
              <div style={{ width: 1, background: '#e8e4de' }} />
              <div style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ fontSize: 24, color: '#3ca064' }}>{answerAngle}°</div>
                <p className="small-caps" style={{ margin: '4px 0 0', color: '#888' }}>Answer</p>
              </div>
              <div style={{ width: 1, background: '#e8e4de' }} />
              <div style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ fontSize: 24 }}>{diff}°</div>
                <p className="small-caps" style={{ margin: '4px 0 0', color: '#888' }}>Off By</p>
              </div>
            </div>

            {/* Share */}
            <button className="share-btn" onClick={handleShare}>
              {copied ? 'Copied!' : 'Share Result'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats modal */}
      <StatsModal open={statsOpen} onClose={() => setStatsOpen(false)} stats={stats} />
    </main>
  );
}
