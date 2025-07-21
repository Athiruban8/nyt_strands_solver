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
}

const Board: React.FC<BoardProps> = ({
  rows,
  cols,
  board,
  onCellChange,
  onCellKeyDown,
  readOnly = false,
  highlights = {},
  inputRefs,
}) => {
  return (
    <div
      className="board-grid"
    >
      {Array.from({ length: rows }).map((_, i) =>
        Array.from({ length: cols }).map((_, j) => {
          const highlight = highlights[`${i},${j}`];
          let cellClass = 'cell';
          if (highlight) {
            cellClass +=
              ' ' + (highlight.color === '#FFD600' ? 'cell-yellow' : 'cell-blue');
          }
          return (
            <input
              key={`${i},${j}`}
              type="text"
              value={board[i][j]}
              onChange={e => onCellChange(i, j, e.target.value)}
              maxLength={1}
              ref={inputRefs ? el => (inputRefs.current![i][j] = el) : undefined}
              onKeyDown={onCellKeyDown ? e => onCellKeyDown(i, j, e) : undefined}
              className={cellClass}
              readOnly={readOnly}
              autoComplete="off"
              inputMode="text"
            />
          );
        })
      )}
    </div>
  );
};

export default Board; 