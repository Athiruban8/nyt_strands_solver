import pickle
from trie import TrieNode

def build_trie(wordlist_path, pickle_path):
    trie = TrieNode()
    with open(wordlist_path, 'r') as f:
        for word in f:
            word = word.strip().upper()
            if len(word) >= 4 and word.isalpha():
                trie.insert(word)
    with open(pickle_path, 'wb') as pf:
        pickle.dump(trie, pf)

build_trie('english3.txt', 'trie.pkl')