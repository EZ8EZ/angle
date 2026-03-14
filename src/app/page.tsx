'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AngleDisplay from '@/components/AngleDisplay';
import Protractor from '@/components/Protractor';
import RoundHistory from '@/components/RoundHistory';
import StatsModal from '@/components/StatsModal';
import {
  getDayNumber,
  getNumRounds,
  getRoundAngle,
  getRoundRotation,
  computeScore,
  getAngularDifference,
  loadGameState,
  saveGameState,
  loadStats,
  recordDayScore,
  formatDate,
  type GameState,
  type Stats,
  emptyGameState,
} from '@/lib/game';

const FLASH_DURATION = 3500;

export default function Home() {
  const [game, setGame] = useState<GameState>(emptyGameState());
  const [guessAngle, setGuessAngle] = useState(0);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Per-round reveal state
  const [roundRevealed, setRoundRevealed] = useState(false);
  const [displayRoundScore, setDisplayRoundScore] = useState(0);

  // Flash timer
  const [angleVisible, setAngleVisible] = useState(true);
  const [timeLeft, setTimeLeft] = useState(FLASH_DURATION);

  // Final results
  const [displayTotalScore, setDisplayTotalScore] = useState(0);

  // Stats
  const [statsOpen, setStatsOpen] = useState(false);
  const [stats, setStats] = useState<Stats>({
    gamesPlayed: 0, streak: 0, lastDay: 0, bestScore: 0, totalScore: 0, scores: [],
  });
  const [copied, setCopied] = useState(false);

  const dayNumber = getDayNumber();
  const numRounds = getNumRounds();
  const animRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentRound = game.currentRound;
  const isComplete = game.complete;
  const targetAngle = !isComplete ? getRoundAngle(currentRound) : 0;
  const rotation = !isComplete ? getRoundRotation(currentRound) : 0;

  // Load saved state on mount
  useEffect(() => {
    setMounted(true);
    const saved = loadGameState();
    setGame(saved);
    setStats(loadStats());

    if (saved.complete) {
      const total = saved.rounds.reduce((s, r) => s + r.score, 0);
      setDisplayTotalScore(total);
    }
  }, []);

  // Flash timer — reset on each new round
  useEffect(() => {
    if (!mounted || isComplete || roundRevealed) return;

    setAngleVisible(true);
    setTimeLeft(FLASH_DURATION);

    const startTime = Date.now();
    timerRef.current = setInterval(() => {
      const remaining = Math.max(0, FLASH_DURATION - (Date.now() - startTime));
      setTimeLeft(remaining);
      if (remaining <= 0) {
        setAngleVisible(false);
        if (timerRef.current) clearInterval(timerRef.current);
      }
    }, 50);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [mounted, currentRound, isComplete, roundRevealed]);

  const handleAngleChange = useCallback((a: number) => {
    setGuessAngle(a);
    if (!hasInteracted) setHasInteracted(true);
  }, [hasInteracted]);

  // Submit a single round
  const handleSubmit = useCallback(() => {
    if (roundRevealed || isComplete) return;
    const answer = getRoundAngle(currentRound);
    const rot = getRoundRotation(currentRound);
    const score = computeScore(guessAngle, answer);

    setRoundRevealed(true);
    setAngleVisible(true); // show angle again

    // Animate round score
    const start = performance.now();
    const animate = (now: number) => {
      const p = Math.min((now - start) / 400, 1);
      setDisplayRoundScore(Math.round(score * p));
      if (p < 1) animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);

    // Save round result
    const newRounds = [...game.rounds, { guess: guessAngle, answer, rotation: rot, score }];
    const nextRound = currentRound + 1;
    const complete = nextRound >= numRounds;

    const newGame: GameState = {
      dayNumber,
      currentRound: nextRound,
      rounds: newRounds,
      complete,
    };
    setGame(newGame);
    saveGameState(newGame);

    if (complete) {
      const total = newRounds.reduce((s, r) => s + r.score, 0);
      const newStats = recordDayScore(total);
      setStats(newStats);

      // Animate total after a short delay
      setTimeout(() => {
        const s2 = performance.now();
        const animTotal = (now: number) => {
          const p = Math.min((now - s2) / 600, 1);
          setDisplayTotalScore(Math.round(total * p));
          if (p < 1) requestAnimationFrame(animTotal);
        };
        requestAnimationFrame(animTotal);
      }, 500);
    }
  }, [guessAngle, currentRound, game, roundRevealed, isComplete, dayNumber, numRounds]);

  // Advance to next round
  const handleNextRound = useCallback(() => {
    setRoundRevealed(false);
    setGuessAngle(0);
    setHasInteracted(false);
    setDisplayRoundScore(0);
  }, []);

  const handleShare = useCallback(async () => {
    const total = game.rounds.reduce((s, r) => s + r.score, 0);
    const lines = game.rounds.map((r, i) => {
      const diff = getAngularDifference(r.guess, r.answer);
      return `R${i + 1}: ${r.score}/100 (off by ${diff}°)`;
    });
    const text = `ANGLE No. ${dayNumber} — ${formatDate()}\n${total}/${numRounds * 100}\n${lines.join('\n')}\nhttps://angle-game.vercel.app`;
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
  }, [game.rounds, dayNumber, numRounds]);

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
    <main style={{ maxWidth: 400, margin: '0 auto', padding: '48px 20px 64px', fontFamily: 'Georgia, serif' }}>
      {/* Stats icon */}
      <button
        onClick={() => setStatsOpen(true)}
        aria-label="Statistics"
        style={{
          position: 'fixed', top: 16, right: 16, background: 'none',
          border: 'none', cursor: 'pointer', padding: 6, zIndex: 40,
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

        {!isComplete && (
          <p className="small-caps" style={{ margin: 0, color: '#999' }}>
            Round {currentRound + 1} of {numRounds} — How many degrees?
          </p>
        )}
      </div>

      {/* ==================== ACTIVE ROUND ==================== */}
      {!isComplete && !roundRevealed && (
        <>
          {/* Target angle visual with flash */}
          <div style={{ marginBottom: 8, position: 'relative' }}>
            <AngleDisplay angle={targetAngle} rotation={rotation} visible={angleVisible} />
            <div style={{ textAlign: 'center', marginTop: 4 }}>
              {timeLeft > 0 ? (
                <span className="small-caps" style={{ color: '#bbb' }}>{timerSeconds}s</span>
              ) : (
                <span className="small-caps" style={{ color: '#bbb' }}>From memory</span>
              )}
            </div>
          </div>

          {/* Protractor */}
          <div style={{ marginBottom: 16 }}>
            <Protractor
              angle={guessAngle}
              submitted={false}
              onAngleChange={handleAngleChange}
            />
          </div>

          {/* Live readout */}
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <span style={{ fontSize: 36, fontWeight: 'normal' }}>
              {hasInteracted ? `${guessAngle}°` : '—'}
            </span>
          </div>

          {/* Submit */}
          <button className="submit-btn" onClick={handleSubmit} disabled={!hasInteracted}>
            Submit
          </button>
        </>
      )}

      {/* ==================== ROUND RESULT (between rounds) ==================== */}
      {!isComplete && roundRevealed && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            {/* Show both angles on protractor */}
            <div style={{ marginBottom: 8 }}>
              <AngleDisplay angle={targetAngle} rotation={rotation} visible={true} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <Protractor
                angle={guessAngle}
                submitted={true}
                answerAngle={game.rounds[game.rounds.length - 1]?.answer}
                onAngleChange={() => {}}
              />
            </div>

            {/* Round score */}
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <div style={{ fontSize: 48, lineHeight: 1 }}>{displayRoundScore}</div>
              <p className="small-caps" style={{ margin: '4px 0 0', color: '#888' }}>
                Round {game.rounds.length} of {numRounds}
              </p>
            </div>

            {/* Breakdown */}
            <div
              style={{
                display: 'flex',
                borderTop: '1px solid #e8e4de',
                borderBottom: '1px solid #e8e4de',
                padding: '14px 0',
                marginBottom: 16,
              }}
            >
              <div style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ fontSize: 22 }}>{guessAngle}°</div>
                <p className="small-caps" style={{ margin: '4px 0 0', color: '#888' }}>Guess</p>
              </div>
              <div style={{ width: 1, background: '#e8e4de' }} />
              <div style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ fontSize: 22, color: '#3ca064' }}>{game.rounds[game.rounds.length - 1]?.answer}°</div>
                <p className="small-caps" style={{ margin: '4px 0 0', color: '#888' }}>Answer</p>
              </div>
              <div style={{ width: 1, background: '#e8e4de' }} />
              <div style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ fontSize: 22 }}>
                  {getAngularDifference(guessAngle, game.rounds[game.rounds.length - 1]?.answer ?? 0)}°
                </div>
                <p className="small-caps" style={{ margin: '4px 0 0', color: '#888' }}>Off By</p>
              </div>
            </div>

            <button className="submit-btn" onClick={handleNextRound}>
              Next Round
            </button>
          </motion.div>
        </AnimatePresence>
      )}

      {/* ==================== FINAL RESULTS ==================== */}
      {isComplete && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Total score */}
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ fontSize: 72, fontWeight: 'normal', lineHeight: 1 }}>
              {displayTotalScore}
              <span style={{ fontSize: 28, color: '#bbb' }}> /{numRounds * 100}</span>
            </div>
            <p className="small-caps" style={{ margin: '8px 0 0', color: '#888' }}>
              Today&apos;s Score
            </p>
          </div>

          {/* Share */}
          <button className="submit-btn" onClick={handleShare} style={{ borderRadius: 12 }}>
            {copied ? 'Copied!' : 'Share Results'}
          </button>

          {/* Round history */}
          <div style={{ marginTop: 28 }}>
            <p className="small-caps" style={{ textAlign: 'center', color: '#bbb', marginBottom: 12 }}>
              Round History
            </p>
            <RoundHistory rounds={game.rounds} />
          </div>
        </motion.div>
      )}

      {/* Stats modal */}
      <StatsModal open={statsOpen} onClose={() => setStatsOpen(false)} stats={stats} />
    </main>
  );
}
