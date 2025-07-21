from typing import Optional, List

class TrieNode:
    def __init__(self):
        self.children: List[Optional['TrieNode']] = [None] * 26
        self.end = False

    def insert(self, word: str):
        node = self
        for c in word:
            if not c.isalpha() or not c.isupper():
                continue  # Skip non-uppercase letters
            idx = ord(c) - ord('A')
            if node.children[idx] is None:
                node.children[idx] = TrieNode()
            child = node.children[idx]
            if child is None:
                raise RuntimeError('TrieNode child should not be None after assignment')
            node = child
        node.end = True

    def search(self, word: str) -> bool:
        node = self
        for c in word:
            if not c.isalpha() or not c.isupper():
                return False  # Non-uppercase letters are not in the trie
            idx = ord(c) - ord('A')
            child = node.children[idx]
            if child is None:
                return False
            node = child
        return node.end 