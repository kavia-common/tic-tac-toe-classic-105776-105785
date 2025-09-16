import React, { useEffect, useMemo, useState } from 'react';
import './App.css';

/**
 * Ocean Professional Theme Tokens (Blue & Amber accents)
 * background: #f9fafb
 * surface: #ffffff
 * text: #111827
 * primary: #2563EB (blue)
 * secondary: #F59E0B (amber)
 * error: #EF4444
 */

// Helpers for game state
const EMPTY_BOARD = Array(9).fill(null);
const LINES = [
  [0,1,2],[3,4,5],[6,7,8], // rows
  [0,3,6],[1,4,7],[2,5,8], // cols
  [0,4,8],[2,4,6]          // diags
];

function calculateWinner(board) {
  for (const [a,b,c] of LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line: [a,b,c] };
    }
  }
  return null;
}

function boardIsFull(board) {
  return board.every(cell => cell !== null);
}

// Naive AI: try winning move, then blocking move, otherwise pick center, corner, or random
function computeAIMove(board, aiSymbol, humanSymbol) {
  // 1) winning move
  for (let i = 0; i < 9; i++) {
    if (!board[i]) {
      const copy = board.slice();
      copy[i] = aiSymbol;
      if (calculateWinner(copy)) return i;
    }
  }
  // 2) block human
  for (let i = 0; i < 9; i++) {
    if (!board[i]) {
      const copy = board.slice();
      copy[i] = humanSymbol;
      if (calculateWinner(copy)) return i;
    }
  }
  // 3) center
  if (!board[4]) return 4;
  // 4) corners
  const corners = [0,2,6,8].filter(i => !board[i]);
  if (corners.length) return corners[Math.floor(Math.random()*corners.length)];
  // 5) remaining
  const empties = board.map((v, i) => (v ? null : i)).filter(v => v !== null);
  if (empties.length) return empties[Math.floor(Math.random()*empties.length)];
  return null;
}

// PUBLIC_INTERFACE
export default function App() {
  const [mode, setMode] = useState('computer'); // 'computer' | 'player'
  const [board, setBoard] = useState(EMPTY_BOARD);
  const [xIsNext, setXIsNext] = useState(true);
  const [theme, setTheme] = useState('light'); // keep existing theme toggle behavior

  const winnerInfo = useMemo(() => calculateWinner(board), [board]);
  const isDraw = !winnerInfo && boardIsFull(board);
  const currentPlayer = xIsNext ? 'X' : 'O';

  // Apply theme to document root for compatibility with existing CSS variables
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Computer move effect
  useEffect(() => {
    if (mode !== 'computer') return;
    if (winnerInfo || isDraw) return;
    // AI plays 'O' when it's O's turn
    if (!xIsNext) {
      const aiMoveIdx = computeAIMove(board, 'O', 'X');
      if (aiMoveIdx !== null) {
        const t = setTimeout(() => {
          setBoard(prev => {
            if (prev[aiMoveIdx]) return prev; // guard against race
            const next = prev.slice();
            next[aiMoveIdx] = 'O';
            return next;
          });
          setXIsNext(true);
        }, 350);
        return () => clearTimeout(t);
      }
    }
  }, [mode, xIsNext, board, winnerInfo, isDraw]);

  // Handlers
  const handleCellClick = (idx) => {
    if (winnerInfo || isDraw) return;
    if (board[idx]) return;

    // If vs computer and it's AI's turn, ignore clicks
    if (mode === 'computer' && !xIsNext) return;

    const next = board.slice();
    next[idx] = currentPlayer;
    setBoard(next);
    setXIsNext(!xIsNext);
  };

  // PUBLIC_INTERFACE
  const newGame = (keepMode = true) => {
    setBoard(EMPTY_BOARD);
    setXIsNext(true);
    if (!keepMode) {
      setMode('computer');
    }
  };

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const statusMessage = (() => {
    if (winnerInfo) return `Winner: ${winnerInfo.winner}`;
    if (isDraw) return 'Draw game';
    return `Turn: ${currentPlayer}`;
  })();

  // Styles (inline for small app). Colors match Ocean Professional.
  const styles = {
    app: {
      minHeight: '100vh',
      backgroundColor: '#f9fafb',
      color: '#111827',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
    },
    card: {
      backgroundColor: '#ffffff',
      width: 'min(92vw, 520px)',
      borderRadius: '16px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
      padding: '24px',
      border: '1px solid #e5e7eb'
    },
    header: {
      marginBottom: '16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    title: {
      margin: 0,
      fontSize: '20px',
      fontWeight: 700,
      color: '#111827',
      letterSpacing: '0.2px'
    },
    subtitle: {
      margin: '4px 0 0',
      fontSize: '13px',
      color: '#6b7280',
      fontWeight: 500
    },
    status: {
      marginTop: '8px',
      padding: '10px 12px',
      background: 'linear-gradient(135deg, rgba(37,99,235,0.08), rgba(249,250,251,1))',
      border: '1px solid rgba(37,99,235,0.2)',
      color: '#1f2937',
      borderRadius: '12px',
      fontWeight: 600,
      display: 'inline-block'
    },
    board: {
      margin: '18px auto',
      width: 'min(84vw, 360px)',
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '10px'
    },
    cell: {
      aspectRatio: '1 / 1',
      backgroundColor: '#ffffff',
      border: '1px solid #e5e7eb',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 800,
      fontSize: 'clamp(36px, 8vw, 44px)',
      cursor: 'pointer',
      transition: 'transform 140ms ease, box-shadow 140ms ease, background 200ms ease',
      color: '#111827',
      userSelect: 'none',
      boxShadow: '0 4px 16px rgba(0,0,0,0.04)'
    },
    cellHover: {
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 24px rgba(0,0,0,0.08)'
    },
    cellX: { color: '#2563EB' },
    cellO: { color: '#F59E0B' },
    controls: {
      marginTop: '16px',
      display: 'flex',
      flexWrap: 'wrap',
      gap: '10px',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    modeGroup: {
      display: 'flex',
      gap: '10px',
      alignItems: 'center',
      flexWrap: 'wrap'
    },
    radioBtn: (active, color) => ({
      border: `1px solid ${active ? color : '#e5e7eb'}`,
      color: active ? '#111827' : '#374151',
      background: active ? 'linear-gradient(180deg, #ffffff, #f9fafb)' : '#ffffff',
      borderRadius: '999px',
      padding: '8px 12px',
      fontWeight: 600,
      fontSize: '14px',
      cursor: 'pointer',
      transition: 'all 160ms ease',
      boxShadow: active ? '0 6px 20px rgba(37,99,235,0.12)' : '0 2px 8px rgba(0,0,0,0.04)'
    }),
    newGameBtn: {
      borderRadius: '10px',
      padding: '10px 14px',
      fontSize: '14px',
      fontWeight: 700,
      border: '1px solid #2563EB',
      backgroundColor: '#2563EB',
      color: '#ffffff',
      cursor: 'pointer',
      transition: 'transform 120ms ease, box-shadow 120ms ease, opacity 160ms ease',
      boxShadow: '0 10px 20px rgba(37,99,235,0.20)'
    },
    themeToggle: {
      borderRadius: '10px',
      padding: '8px 12px',
      fontSize: '13px',
      fontWeight: 700,
      border: '1px solid #e5e7eb',
      backgroundColor: '#ffffff',
      color: '#111827',
      cursor: 'pointer',
      transition: 'transform 120ms ease, box-shadow 120ms ease',
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      marginLeft: '8px'
    },
    footer: {
      marginTop: '12px',
      color: '#6b7280',
      fontSize: '12px'
    }
  };

  const [hoverIdx, setHoverIdx] = useState(null);

  return (
    <div className="App" style={styles.app}>
      <div style={styles.card} role="region" aria-label="Tic Tac Toe game">
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Tic Tac Toe</h1>
            <p style={styles.subtitle}>Ocean Professional — Blue & Amber</p>
          </div>
          <div>
            <button
              type="button"
              onClick={toggleTheme}
              style={styles.themeToggle}
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
            </button>
          </div>
        </div>

        <div style={styles.status} aria-live="polite">{statusMessage}</div>

        <div style={styles.board} role="grid" aria-label="Board">
          {board.map((val, idx) => {
            const isWinningCell = winnerInfo?.line?.includes(idx);
            const baseStyle = {
              ...styles.cell,
              ...(val === 'X' ? styles.cellX : {}),
              ...(val === 'O' ? styles.cellO : {}),
              ...(hoverIdx === idx && !val && !winnerInfo ? styles.cellHover : {}),
              outline: isWinningCell ? '3px solid rgba(245,158,11,0.45)' : 'none',
              background: isWinningCell ? 'linear-gradient(180deg, #fff7ed, #ffffff)' : styles.cell.backgroundColor
            };
            return (
              <button
                key={idx}
                role="gridcell"
                aria-label={`Cell ${idx + 1}, ${val ? val : 'empty'}`}
                onClick={() => handleCellClick(idx)}
                onMouseEnter={() => setHoverIdx(idx)}
                onMouseLeave={() => setHoverIdx(null)}
                style={baseStyle}
              >
                {val}
              </button>
            );
          })}
        </div>

        <div style={styles.controls}>
          <div style={styles.modeGroup} role="group" aria-label="Mode selection">
            <button
              type="button"
              onClick={() => { setMode('player'); newGame(true); }}
              style={styles.radioBtn(mode === 'player', '#2563EB')}
              aria-pressed={mode === 'player'}
            >
              👥 Vs Player
            </button>
            <button
              type="button"
              onClick={() => { setMode('computer'); newGame(true); }}
              style={styles.radioBtn(mode === 'computer', '#F59E0B')}
              aria-pressed={mode === 'computer'}
            >
              🤖 Vs Computer
            </button>
          </div>

          <div>
            <button
              type="button"
              onClick={() => newGame(true)}
              style={styles.newGameBtn}
            >
              ⟳ New Game
            </button>
          </div>
        </div>

        <div style={styles.footer}>
          X is blue · O is amber · First move: X
        </div>
      </div>
    </div>
  );
}
