import React, { RefObject } from 'react';
import '../styles/Board.css';

export type Highlight = {
  wordIndex: number;
  color: string;
};

interface BoardProps {
  rows: number;
  cols: number;
  board: string[][];
  onCellChange: (row: number, col: number, value: string) => void;
  onCellKeyDown?: (row: number, col: number, e: React.KeyboardEvent<HTMLInputElement>) => void;
  readOnly?: boolean;
  highlights?: Record<string, Highlight>;
  inputRefs?: RefObject<(HTMLInputElement | null)[][]>;
  paths?: Array<Array<[number, number]>>;
  pathColors?: string[];
}

const CELL_SIZE = 40;
const CELL_GAP = 10; 

const Board: React.FC<BoardProps> = ({
  rows,
  cols,
  board,
  onCellChange,
  onCellKeyDown,
  readOnly = false,
  highlights = {},
  inputRefs,
  paths = [],
  pathColors = [],
}) => {
  // calc container dimensions 
  const containerWidth = cols * CELL_SIZE + (cols - 1) * CELL_GAP;
  const containerHeight = rows * CELL_SIZE + (rows - 1) * CELL_GAP;

  // helper function to get cell center coordinates
  const getCellCenter = (row: number, col: number) => {
    return {
      x: col * (CELL_SIZE + CELL_GAP) + CELL_SIZE / 2,
      y: row * (CELL_SIZE + CELL_GAP) + CELL_SIZE / 2,
    };
  };

  return (
    <div 
      className="board-container"
      style={{
        width: containerWidth,
        height: containerHeight,
        position: 'relative',
      }}
    >
      {/* SVG overlay for path lines */}
      <svg
        className="board-svg-overlay"
        width={containerWidth}
        height={containerHeight}
        viewBox={`0 0 ${containerWidth} ${containerHeight}`}
      >
        {paths.map((path, idx) => (
          <g key={`path-${idx}`}>
            {path.map((cell, i) => {
              if (i === 0) return null;
              const prev = getCellCenter(path[i - 1][0], path[i - 1][1]);
              const curr = getCellCenter(cell[0], cell[1]);
              return (
                <line
                  key={`line-${idx}-${i}`}
                  x1={prev.x}
                  y1={prev.y}
                  x2={curr.x}
                  y2={curr.y}
                  stroke={pathColors[idx] || '#2196F3'}
                  strokeWidth="8" 
                  strokeLinecap="round"
                  opacity="0.85"
                />
              );
            })}
          </g>
        ))}
      </svg>

      {/* Board grid */}
      <div
        className="board-grid"
        style={{
          gridTemplateColumns: `repeat(${cols}, ${CELL_SIZE}px)`,
          gridTemplateRows: `repeat(${rows}, ${CELL_SIZE}px)`,
          gap: `${CELL_GAP}px`,
        }}
      >
        {Array.from({ length: rows }).map((_, row) =>
          Array.from({ length: cols }).map((_, col) => {
            const highlight = highlights[`${row},${col}`];
            let cellClass = 'board-cell';
            if (highlight) {
              cellClass += highlight.color === '#FFD600' ? ' board-cell--highlighted-yellow' : ' board-cell--highlighted-blue';
            }
            
            return (
              <input
                key={`cell-${row}-${col}`}
                type="text"
                value={board[row][col]}
                onChange={(e) => onCellChange(row, col, e.target.value)}
                onKeyDown={onCellKeyDown ? (e) => onCellKeyDown(row, col, e) : undefined}
                ref={inputRefs ? (el) => (inputRefs.current![row][col] = el) : undefined}
                className={cellClass}
                maxLength={1}
                readOnly={readOnly}
                autoComplete="off"
                inputMode="text"
                spellCheck={false}
                aria-label={`Cell ${row + 1}, ${col + 1}`}
              />
            );
          })
        )}
      </div>
    </div>
  );
};

export default Board;
