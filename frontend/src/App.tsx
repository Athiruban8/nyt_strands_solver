import React, { useState, useRef } from 'react';
import axios from 'axios';
import Board from './components/Board';
import './styles/App.css';

const COLS = 6;
const ROWS = 8;

const App: React.FC = () => {
  const [board, setBoard] = useState<string[][]>(
    Array.from({ length: ROWS }, () => Array(COLS).fill(''))
  );
  const [wordCount, setWordCount] = useState<number>(7);
  const [forbidden, setForbidden] = useState<string>('');
  const [findAllSolutions, setFindAllSolutions] = useState<boolean>(false);
  const [solutions, setSolutions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    // Validate grid
    for (let i = 0; i < ROWS; i++) {
      for (let j = 0; j < COLS; j++) {
        if (!board[i][j]) {
          setError('Please fill all cells in the grid');
          return;
        }
      }
    }
    
    setLoading(true);
    setError(null);
    setSolutions([]);
    
    try {
      const grid = board.map(row => row.join(''));
      const response = await axios.post('/solve', {
        grid,
        wordcount: wordCount,
        forbidden: forbidden.split(/\s+/).filter(Boolean),
        findAllSolutions: findAllSolutions
      });
      setSolutions(response.data.solutions);
    } catch (err: any) {
      setError(err.response?.data?.error || 'An error occurred while solving');
    } finally {
      setLoading(false);
    }
  };

  const getHighlights = (solution: any) => {
    const highlights: Record<string, { wordIndex: number; color: string }> = {};
    if (!solution) return highlights;
    
    const spangram = solution.spangram;
    solution.words.forEach((word: string, idx: number) => {
      const path = solution.paths[idx];
      const isSpangram = spangram && word === spangram;
      const color = isSpangram ? '#FFD600' : '#2196F3';
      path.forEach(([row, col]: [number, number]) => {
        highlights[`${row},${col}`] = { wordIndex: idx, color };
      });
    });
    return highlights;
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">NYT Strands Solver</h1>
      </header>

      <main className="app-main">
        <section className="input-section">
          <div className="board-section">
            <h2 className="section-title">Enter Board</h2>
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

          <div className="controls-section">
            <h2 className="section-title">Options</h2>
            <div className="control-group">
              <label htmlFor="word-count-input" className="control-label">
                Number of Theme Words:
              </label>
              <input
                id="word-count-input"
                type="number"
                value={wordCount}
                min={-1}
                max={12}
                onChange={(e) => setWordCount(Number(e.target.value))}
                className="number-input"
              />
            </div>
            
            <div className="control-group">
              <label htmlFor="forbidden-input" className="control-label">
                Forbidden Words (words that are not in the solution):
              </label>
              <input
                id="forbidden-input"
                type="text"
                value={forbidden}
                onChange={(e) => setForbidden(e.target.value)}
                placeholder="Enter space-separated words"
                className="text-input"
              />
            </div>
            <div className="control-group">
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={findAllSolutions}
                  onChange={(e) => setFindAllSolutions(e.target.checked)}
                  className="toggle-input"
                />
                <span className="toggle-slider"></span>
                <span className="toggle-text">Find all solutions</span>
              </label>
              <p className="control-hint">
                {findAllSolutions 
                  ? "Will find all possible solutions (may take longer)" 
                  : "Will find the first valid solution"
                }
              </p>
            </div>
            <button 
              onClick={handleSubmit} 
              disabled={loading} 
              className="solve-button"
            >
              {loading ? 'Solving...' : 'Solve Puzzle'}
            </button>
            
            {error && (
              <div className="error-message" role="alert">
                {error}
              </div>
            )}
          </div>
        </section>

        {solutions.length > 0 && (
          <section className="solutions-section">
            <h2 className="section-title">
              Solutions ({solutions.length} found)
            </h2>
            <div className="solutions-grid">
              {solutions.map((solution, idx) => {
                const spangram = solution.spangram;
                const pathColors = solution.words.map((word: string) =>
                  spangram && word === spangram ? '#FFD600' : '#2196F3'
                );

                return (
                  <div key={`solution-${idx}`} className="solution-card">
                    <div className="solution-header">
                      <h3 className="solution-title">Solution {idx + 1}</h3>
                    </div>
                    
                    <div className="solution-board">
                      <Board
                        rows={ROWS}
                        cols={COLS}
                        board={board}
                        onCellChange={() => {}}
                        readOnly={true}
                        highlights={getHighlights(solution)}
                        paths={solution.paths}
                        pathColors={pathColors}
                      />
                    </div>
                    
                    <div className="solution-words">
                      {solution.words.map((word: string, widx: number) => (
                        <span
                          key={`word-${widx}`}
                          className={`word-badge ${
                            spangram && word === spangram ? 'word-badge--spangram' : 'word-badge--regular'
                          }`}
                        >
                          {word}
                        </span>
                      ))}
                    </div>
                    
                    {spangram && (
                      <div className="spangram-info">
                        <strong>Spangram:</strong> {spangram}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {!loading && !error && solutions.length === 0 && (
          <div className="error-message" role="status">
            No solutions found.
          </div>
        )}
      </main>
       <footer className="app-footer">
      <div className="footer-content">
        <p className="footer-text">
          Made with ❤️ by{' '}
          <a 
            href="https://github.com/Athiruban8" 
            target="_blank" 
            rel="noopener noreferrer"
            className="footer-link"
          >
            Athiruban
          </a>
        </p>
        <div className="footer-links">
          <a 
            href="https://github.com/Athiruban8/nyt_strands_solver" 
            target="_blank" 
            rel="noopener noreferrer"
            className="footer-link footer-link--github"
          >
            <svg className="github-icon" viewBox="0 0 24 24" width="20" height="20">
              <path fill="currentColor" d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            View on GitHub
          </a>
        </div>
      </div>
    </footer>
    </div>
  );
};

export default App;
