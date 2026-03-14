'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AngleDisplay from '@/components/AngleDisplay';
import Protractor from '@/components/Protractor';
import StatsModal from '@/components/StatsModal';
import {
  getDayNumber,
  getTodayAngle,
  getTodayRotation,
  computeScore,
  getAngularDifference,
  loadGameState,
  saveGameState,
  loadStats,
  recordScore,
  formatDate,
  type Stats,
} from '@/lib/game';

const FLASH_DURATION = 3500; // ms the angle is visible

export default function Home() {
  const [guessAngle, setGuessAngle] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
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
  const [angleVisible, setAngleVisible] = useState(true);
  const [timeLeft, setTimeLeft] = useState(FLASH_DURATION);

  const dayNumber = getDayNumber();
  const targetAngle = getTodayAngle();
  const rotation = getTodayRotation();
  const animFrameRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setMounted(true);
    const saved = loadGameState();
    if (saved && saved.guess !== null && saved.score !== null && saved.answer !== null) {
      setGuessAngle(saved.guess);
      setScore(saved.score);
      setSubmitted(true);
      setDisplayScore(saved.score);
      setHasInteracted(true);
      setAngleVisible(true); // show angle in results
      setTimeLeft(0);
      return;
    }
    setStats(loadStats());

    // Flash timer — hide the angle after FLASH_DURATION
    const startTime = Date.now();
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, FLASH_DURATION - elapsed);
      setTimeLeft(remaining);
      if (remaining <= 0) {
        setAngleVisible(false);
        if (timerRef.current) clearInterval(timerRef.current);
      }
    }, 50);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleAngleChange = useCallback((newAngle: number) => {
    setGuessAngle(newAngle);
    if (!hasInteracted) setHasInteracted(true);
  }, [hasInteracted]);

  const handleSubmit = useCallback(() => {
    if (submitted) return;
    const s = computeScore(guessAngle, targetAngle);
    setScore(s);
    setSubmitted(true);
    setAngleVisible(true); // reveal angle again on submit

    saveGameState({ dayNumber, guess: guessAngle, score: s, answer: targetAngle });
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
  }, [guessAngle, submitted, dayNumber, targetAngle]);

  const handleShare = useCallback(async () => {
    const diff = getAngularDifference(guessAngle, targetAngle);
    const text = `ANGLE No. ${dayNumber} — ${formatDate()}\n${score}/100 — off by ${diff}°\nhttps://angle-game.vercel.app`;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [guessAngle, targetAngle, dayNumber, score]);

  const diff = getAngularDifference(guessAngle, targetAngle);
  const timerSeconds = Math.ceil(timeLeft / 1000);

  if (!mounted) {
    return (
      <main style={{ maxWidth: 400, margin: '0 auto', padding: '48px 20px', fontFamily: 'Georgia, serif' }}>
        <div style={{ textAlign: 'center' }}>
          <p className="small-caps" style={{ margin: 0, color: '#888' }}>Loading…</p>
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
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <p className="small-caps" style={{ margin: '0 0 6px', color: '#888' }}>
          No. {dayNumber}
        </p>
        <h1 style={{ fontSize: 42, fontWeight: 'normal', margin: '0 0 12px', letterSpacing: '0.04em' }}>
          Angle
        </h1>
        <hr style={{ border: 'none', borderTop: '1px solid #e8e4de', margin: '0 40px 12px' }} />
        <p className="small-caps" style={{ margin: 0, color: '#999' }}>
          How many degrees is this angle?
        </p>
      </div>

      {/* Target angle visual with flash timer */}
      <div style={{ marginBottom: 8, position: 'relative' }}>
        <AngleDisplay angle={targetAngle} rotation={rotation} visible={angleVisible} />
        {/* Timer indicator */}
        {!submitted && timeLeft > 0 && (
          <div style={{ textAlign: 'center', marginTop: 4 }}>
            <span className="small-caps" style={{ color: '#bbb' }}>
              {timerSeconds}s
            </span>
          </div>
        )}
        {!submitted && !angleVisible && (
          <div style={{ textAlign: 'center', marginTop: 4 }}>
            <span className="small-caps" style={{ color: '#bbb' }}>
              From memory
            </span>
          </div>
        )}
      </div>

      {/* Protractor for guessing */}
      <div style={{ marginBottom: 16 }}>
        <Protractor
          angle={guessAngle}
          submitted={submitted}
          answerAngle={submitted ? targetAngle : undefined}
          onAngleChange={handleAngleChange}
        />
      </div>

      {/* Live readout */}
      {!submitted && (
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <span style={{ fontSize: 36, fontWeight: 'normal' }}>
            {hasInteracted ? `${guessAngle}°` : '—'}
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
                <div style={{ fontSize: 24 }}>{guessAngle}°</div>
                <p className="small-caps" style={{ margin: '4px 0 0', color: '#888' }}>Your Guess</p>
              </div>
              <div style={{ width: 1, background: '#e8e4de' }} />
              <div style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ fontSize: 24, color: '#3ca064' }}>{targetAngle}°</div>
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
