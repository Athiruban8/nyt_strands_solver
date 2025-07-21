import React, { useState, useRef } from 'react';
import axios from 'axios';
import Board from './components/Board';

const COLS = 6;
const ROWS = 8;

const App: React.FC = () => {
  const [board, setBoard] = useState<string[][]>(
    Array.from({ length: ROWS }, () => Array(COLS).fill(''))
  );
  const [wordCount, setWordCount] = useState<number>(7);
  const [forbidden, setForbidden] = useState<string>('');
  const [solutions, setSolutions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeSolution, setActiveSolution] = useState<number>(0);

  const inputRefs = useRef<(HTMLInputElement | null)[][]>(
    Array.from({ length: ROWS }, () => Array(COLS).fill(null))
  );

  const handleCellChange = (row: number, col: number, value: string) => {
    const newBoard = board.map(r => [...r]);
    const letter = value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 1);
    newBoard[row][col] = letter;
    setBoard(newBoard);
    if (letter && inputRefs.current) {
      let nextRow = row, nextCol = col + 1;
      if (nextCol >= COLS) {
        nextCol = 0;
        nextRow = row + 1;
      }
      if (nextRow < ROWS && inputRefs.current[nextRow][nextCol]) {
        inputRefs.current[nextRow][nextCol]?.focus();
      }
    }
  };

  const handleCellKeyDown = (row: number, col: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!board[row][col] && (row > 0 || col > 0)) {
        let prevRow = row, prevCol = col - 1;
        if (prevCol < 0) {
          prevCol = COLS - 1;
          prevRow = row - 1;
        }
        if (prevRow >= 0 && inputRefs.current[prevRow][prevCol]) {
          inputRefs.current[prevRow][prevCol]?.focus();
        }
      }
    }
  };

  const handleSubmit = async () => {
    // Validate grid before submitting
    for (let i = 0; i < ROWS; i++) {
      for (let j = 0; j < COLS; j++) {
        if (!board[i][j]) {
          setError('Fill the grid');
          return;
        }
      }
    }
    setLoading(true);
    setError(null);
    setSolutions([]);
    setActiveSolution(0);
    try {
      const grid = board.map(row => row.join(''));
      const response = await axios.post('/solve', {
        grid,
        wordcount: wordCount,
        forbidden: forbidden.split(/\s+/).filter(Boolean)
      });
      setSolutions(response.data.solutions);
    } catch (err: any) {
      setError(err.response?.data?.error || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const activeSol = solutions[activeSolution];

  return (
    <div className="app">
      <h1>NYT Strands Solver</h1>
      <div>
        <h2>Enter Board</h2>
        <Board
          rows={ROWS}
          cols={COLS}
          board={board}
          onCellChange={handleCellChange}
          onCellKeyDown={handleCellKeyDown}
          readOnly={false}
          inputRefs={inputRefs}
        />
      </div>
      <div style={{ margin: '1rem 0' }}>
        <label>Word Count: </label>
        <input
          type="number"
          value={wordCount}
          min={1}
          onChange={e => setWordCount(Number(e.target.value))}
          style={{ width: 60 }}
        />
      </div>
      <div style={{ margin: '1rem 0' }}>
        <label>Forbidden Words (space-separated): </label>
        <input
          type="text"
          value={forbidden}
          onChange={e => setForbidden(e.target.value)}
          style={{ width: 300 }}
        />
      </div>
      <button onClick={handleSubmit} disabled={loading} style={{ padding: '0.5rem 1.5rem', fontSize: 16 }}>
        {loading ? 'Solving...' : 'Solve'}
      </button>
      {error && <div style={{ color: 'red', marginTop: 16 }}>{error}</div>}
      <div style={{ marginTop: 32 }}>
        {solutions.length > 0 && (
          <div>
            {solutions.map((sol, idx) => (
              <div key={idx} style={{ marginBottom: 24, padding: 12, border: '1px solid #ccc', borderRadius: 8 }}>
                <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
                  Solution {idx + 1}
                </div>
                <div>
                  {sol.words.map((word: string, widx: number) => (
                    <span
                      key={widx}
                      style={{
                        background: '#eee',
                        color: '#222',
                        padding: '2px 8px',
                        borderRadius: 4,
                        marginRight: 8,
                        fontWeight: 600,
                      }}
                    >
                      {word}
                    </span>
                  ))}
                </div>
                {sol.spangram && (
                  <div style={{ marginTop: 8, fontSize: 14, color: '#666' }}>
                    Spangram: {sol.spangram}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default App; 