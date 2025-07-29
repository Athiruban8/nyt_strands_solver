# NYT Strands Solver

A web application that solves the [New York Times Strands](https://www.nytimes.com/games/strands) puzzle using Knuth's Algorithm X with Dancing Links data structure for exact cover problem solving.

## Features

- **Interactive Grid Input**: Click-and-type interface for entering puzzle letters
- **Visual Solution Display**: Highlighted paths showing word connections with distinct colors
- **Multiple Solutions**: Toggle to find all possible solutions or just the first one
- **Spangram Detection**: Automatically identifies and highlights theme-spanning words
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

### Frontend

- **React** with TypeScript
- **CSS**
- **Axios** for API communication

### Backend

- **Python Flask** REST API

## Installation

### Prerequisites

- Python 3.8+
- Node.js 16+
- npm

### Backend Setup

- Clone the repository
  ```
  git clone https://github.com/Athiruban8/nyt-strands-solver.git
  cd nyt-strands-solver
  ```
- Install Python dependencies
  `pip install -r requirements.txt`

- Run the Flask server
  `python app.py`

### Frontend Setup

- Install dependencies
  `npm install`

- Start the development server
  `npm start`

## API Endpoints

### POST `/solve`

Solves a Strands puzzle using the provided grid and constraints.

**Request Body:**

```
{
   "grid": ["ABCDEF", "GHIJKL", ...],
   "wordcount": 7,
   "forbidden": ["word1", "word2"],
   "findAllSolutions": false
}
```

**Response:**

```
{
   "solutions": [
      {
         "words": ["WORD1", "WORD2", ...],
         "paths": [[, , ...], ...],
         "spangram": "THEMESPANNINGWORD"
      }
   ]
}
```

## Algorithm Details

The solver implements **Knuth's Algorithm X** with **Dancing Links** to solve the exact cover problem:

1. **Grid Modeling**: Each cell in the 6×8 grid becomes a constraint that must be covered exactly once
2. **Word Finding**: Generate all possible words from the grid using backtracking on a trie built with 190k+ English words.
3. **Exact Cover**: Use Algorithm X imlpemented with Dancing Links data structure to find combinations of words that cover every grid cell exactly once
4. **Spangram Detection**: Identify words that span from one side of the grid to the opposite side

## Usage

1. **Enter the puzzle**: Fill in the 6×8 grid with letters from the NYT Strands puzzle
2. **Set parameters**:
   - Word count (typically 6-8 words)
   - Forbidden words (optional)
   - Toggle "Find all solutions" for comprehensive results
3. **Solve**: Click "Solve Puzzle" to get visual solutions with highlighted word paths
4. **Analyze**: Review found words with spangrams highlighted in yellow. If the solution consists of words not in the correct solution add it to the forbidden words list and click "Solve Puzzle" again.

## Acknowledgments

- **Donald Knuth** for [Algorithm X](https://en.wikipedia.org/wiki/Knuth%27s_Algorithm_X) and [Dancing Links](https://en.wikipedia.org/wiki/Dancing_Links)
- **New York Times** for the [Strands](https://www.nytimes.com/games/strands) puzzle

---
