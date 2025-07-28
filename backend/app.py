from flask import Flask, request, jsonify
from build_trie import build_trie
from solver import Solver
import pickle
import os

app = Flask(__name__)

TRIE_PATH = 'trie.pkl'
WORDLIST_PATH = 'english3.txt'


def load_trie_from_pickle(pickle_path):
    with open(pickle_path, 'rb') as pf:
        trie = pickle.load(pf)
    return trie

if os.path.exists(TRIE_PATH):
    TRIE = load_trie_from_pickle(TRIE_PATH)
else:
    TRIE = build_trie(WORDLIST_PATH, TRIE_PATH)
@app.route('/', methods=['GET'])
def home():
    return jsonify({'message': 'Send a POST request to /solve with a grid to solve the NYT Strands puzzle!'})

@app.route('/solve', methods=['POST'])
def solve():
    data = request.get_json()
    grid = data.get('grid')
    wordcount = data.get('wordcount', -1)
    findAllSolutions = data.get('findAllSolutions', False)
    forbidden = set(w.upper() for w in data.get('forbidden', []))
    if not grid:
        return jsonify({'error': 'Missing grid'}), 400
    solver = Solver(grid, TRIE, forbidden, findAllSolutions)
    results = solver.solve(wordcount)
    return jsonify({'solutions': results})

if __name__ == '__main__':
    app.run(debug=True) 