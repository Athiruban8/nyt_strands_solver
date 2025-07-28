import os
import pickle   
import sys
import argparse
from typing import List, Set, Tuple, Optional
from dancing_links import DancingLinks
from trie import TrieNode
from build_trie import build_trie

Cell = Tuple[int, int]
Path = List[Cell]
WordPath = Tuple[str, Path]
Grid = List[str]

NEIGHBOURS = [
    (-1, -1), (-1, 0), (-1, 1),
    (0, -1),           (0, 1),
    (1, -1),  (1, 0),  (1, 1)
]

def contains_pair(path: Path, c1: Cell, c2: Cell) -> bool:
    for i in range(1, len(path)):
        if (path[i] == c1 and path[i-1] == c2) or (path[i] == c2 and path[i-1] == c1):
            return True
    return False

class Solver:
    """
    Solver for the NYT Strands puzzle using Dancing Links and Trie.
    """
    def __init__(self, grid: Grid, trie: TrieNode, forbidden: Optional[Set[str]] = None, findAllSolutions: bool = False):
        self.grid = grid
        self.trie = trie
        self.findAllSolutions = findAllSolutions
        self.forbidden = set(w.upper() for w in forbidden) if forbidden else set()
        self.m = len(grid)
        self.n = len(grid[0]) if self.m > 0 else 0
        self.word_paths: List[WordPath] = []

    def find_word_paths(self) -> List[WordPath]:
        visited = [[False] * self.n for _ in range(self.m)]
        self.word_paths = []
        for i in range(self.m):
            for j in range(self.n):
                self._find_word_paths(self.grid, self.m, self.n, self.trie, i, j, visited, [], self.word_paths)
        # Filter forbidden words
        return [(w, p) for (w, p) in self.word_paths if w.upper() not in self.forbidden]

    @staticmethod
    def _find_word_paths(grid: Grid, m: int, n: int, node: TrieNode, i: int, j: int,
                        visited: List[List[bool]], path: Path, word_paths: List[WordPath]):
        if i < 0 or i >= m or j < 0 or j >= n or visited[i][j]:
            return
        c = grid[i][j]
        idx = ord(c.upper()) - ord('A')
        if node.children[idx] is None:
            return
        visited[i][j] = True
        path.append((i, j))
        next_node = node.children[idx]
        if next_node is not None:
            if next_node.end:
                word = ''.join(grid[x][y] for x, y in path)
                word_paths.append((word, list(path)))
            for dx, dy in NEIGHBOURS:
                ni, nj = i + dx, j + dy
                if abs(dx) != abs(dy) or not contains_pair(path, (ni, j), (i, nj)):
                    Solver._find_word_paths(grid, m, n, next_node, ni, nj, visited, path, word_paths)
        path.pop()
        visited[i][j] = False

    def solve(self, wordcount: int = -1) -> List[dict]:
        word_paths = self.find_word_paths()
        R = len(word_paths)
        C1 = self.m * self.n
        C2 = (self.m - 1) * (self.n - 1)
        C = C1 + C2
        mat = [[0] * C for _ in range(R)]
        for i, (word, path) in enumerate(word_paths):
            for x, y in path:
                mat[i][x * self.n + y] = 1
            for k in range(1, len(path)):
                x1, y1 = path[k-1]
                x2, y2 = path[k]
                dx, dy = x2 - x1, y2 - y1
                if abs(dx) == 1 and abs(dy) == 1:
                    idx = C1 + min(x1, x2) * (self.n - 1) + min(y1, y2)
                    mat[i][idx] = 1
        dlx = DancingLinks()
        dlx.create(R, C1, C2, mat)
        all_solutions: List[List[int]] = []
        dlx.solve(all_solutions, [], self.findAllSolutions, wordcount)
        results = []
        for sol in all_solutions:
            solution_word_paths = [word_paths[i] for i in sol]
            spangram_word = self.find_spangram(solution_word_paths)
            results.append({
                'words': [w for w, _ in solution_word_paths],
                'paths': [p for _, p in solution_word_paths],
                'spangram': spangram_word
            })
        return results
    
    def find_spangram(self, word_paths: List[WordPath]) -> Optional[str]:
        for (word, path) in word_paths:
            left = False
            right = False
            top = False
            bottom = False
            for (x, y) in path:
                if x == 0 :
                    top = True
                if x == self.m - 1:
                    bottom = True
                if y == 0:
                    left = True
                if y == self.n - 1:
                    right = True
                if (left and right) or (top and bottom):
                    return word
        return None

    @staticmethod
    def print_solution(grid: Grid, m: int, n: int, word_paths: List[WordPath]):
        output = [[' ' for _ in range(2 * n - 1)] for _ in range(2 * m - 1)]
        for i in range(m):
            for j in range(n):
                output[2 * i][2 * j] = grid[i][j]
        for word, path in word_paths:
            x, y = path[0]
            print(word, end=' ')
            output[2 * x][2 * y] = output[2 * x][2 * y].upper()
            for k in range(1, len(path)):
                x1, y1 = path[k-1]
                x2, y2 = path[k]
                dx, dy = x2 - x1, y2 - y1
                if abs(dx) == 1 and dy == 0:
                    output[2 * x1 + dx][2 * y1] = '|'
                elif abs(dy) == 1 and dx == 0:
                    output[2 * x1][2 * y1 + dy] = '-'
                elif dx == dy:
                    output[2 * x1 + dx][2 * y1 + dy] = '\\'
                else:
                    output[2 * x1 + dx][2 * y1 + dy] = '/'
        print('\n')
        for line in output:
            print(''.join(line))

    @classmethod
    def from_cli(cls):
        parser = argparse.ArgumentParser(description='NYT Strands Solver ')
        parser.add_argument('wordlist', type=str, help='Word list file')
        parser.add_argument('wordcount', type=int, nargs='?', default=-1, help='Expected word count (optional)')
        parser.add_argument('forbidden', nargs='*', help='Forbidden words (optional)')
        args = parser.parse_args()

        exclude = set(args.forbidden)
        trie_path = 'trie.pkl'
        if os.path.exists(trie_path):
            with open(trie_path, 'rb') as pf:
                trie = pickle.load(pf)
        else:
            trie = build_trie(args.wordlist, trie_path)
        grid = cls.read_grid()
        if not grid:
            print('No grid provided on stdin.')
            sys.exit(1)
        solver = cls(grid, trie, exclude)
        results = solver.solve(args.wordcount)
        if not results:
            print('No solution found.')
            return
        for sol in results:
            solution_word_paths = list(zip(sol['words'], sol['paths']))
            cls.print_solution(grid, solver.m, solver.n, solution_word_paths)
            print()

    @staticmethod
    def load_dictionary(filename: str, exclude: Set[str]) -> TrieNode:
        trie = TrieNode()
        with open(filename, 'r') as f:
            for word in f:
                word = word.strip().upper()
                if len(word) >= 4 and word not in exclude and word.isalpha():
                    trie.insert(word)
        return trie

    @staticmethod
    def read_grid() -> Grid:
        grid = []
        for line in sys.stdin:
            line = line.strip().upper()
            if line:
                grid.append(line)
        return grid

__all__ = ['Solver'] 