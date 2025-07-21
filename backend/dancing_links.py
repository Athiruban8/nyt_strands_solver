from typing import List, Optional

class DancingLinksCell:
    def __init__(self, row_id: int = -1):
        self.left: 'DancingLinksCell' = self
        self.right: 'DancingLinksCell' = self
        self.up: 'DancingLinksCell' = self
        self.down: 'DancingLinksCell' = self
        self.column: Optional['DancingLinksColumn'] = None
        self.row_id: int = row_id

    def remove_vertical(self):
        self.up.down = self.down
        self.down.up = self.up
        if self.column:
            self.column.size -= 1

    def restore_vertical(self):
        self.up.down = self
        self.down.up = self
        if self.column:
            self.column.size += 1

    def erase(self):
        self.remove_vertical()
        self.left.right = self.right
        self.right.left = self.left

class DancingLinksColumn:
    def __init__(self, essential: bool = True):
        self.left: 'DancingLinksColumn' = self
        self.right: 'DancingLinksColumn' = self
        self.dummycell: DancingLinksCell = DancingLinksCell()
        self.dummycell.column = self
        self.dummycell.up = self.dummycell.down = self.dummycell
        self.size: int = 0
        self.essential: bool = essential

    def remove_column(self):
        self.left.right = self.right
        self.right.left = self.left
        ptr = self.dummycell.down
        while ptr != self.dummycell:
            row_ptr = ptr.right
            while row_ptr != ptr:
                row_ptr.remove_vertical()
                row_ptr = row_ptr.right
            ptr = ptr.down

    def restore_column(self):
        ptr = self.dummycell.up
        while ptr != self.dummycell:
            row_ptr = ptr.left
            while row_ptr != ptr:
                row_ptr.restore_vertical()
                row_ptr = row_ptr.left
            ptr = ptr.up
        self.left.right = self
        self.right.left = self

class DancingLinks:
    def __init__(self):
        self.dummycolumn = DancingLinksColumn(essential=False)
        self.columns: List[DancingLinksColumn] = []
        self.cells: List[DancingLinksCell] = []

    def create(self, R: int, C1: int, C2: int, mat: List[List[int]]):
        C = C1 + C2
        self.columns = [DancingLinksColumn(essential=(i < C1)) for i in range(C)]
        # Link columns horizontally
        for i in range(C):
            self.columns[i].left = self.columns[i - 1]
            self.columns[i].right = self.columns[(i + 1) % C]
        self.dummycolumn.right = self.columns[0]
        self.dummycolumn.left = self.columns[-1]
        self.columns[0].left = self.dummycolumn
        self.columns[-1].right = self.dummycolumn
        # Create cells and link them
        for i in range(R):
            row_head: Optional[DancingLinksCell] = None
            for j in range(C):
                if mat[i][j]:
                    cell = DancingLinksCell(row_id=i)
                    cell.column = self.columns[j]
                    # Vertical links
                    col_dummy = self.columns[j].dummycell
                    cell.up = col_dummy.up
                    cell.down = col_dummy
                    col_dummy.up.down = cell
                    col_dummy.up = cell
                    self.columns[j].size += 1
                    # Horizontal links
                    if row_head is None:
                        row_head = cell
                        cell.left = cell.right = cell
                    else:
                        cell.left = row_head.left
                        cell.right = row_head
                        row_head.left.right = cell
                        row_head.left = cell
                    self.cells.append(cell)

    def solve(self, all_solutions: List[List[int]], curr_solution: List[int], allneeded: bool = False, maxsel: int = -1) -> bool:
        # Find the first essential column
        col = self.dummycolumn.right
        while col != self.dummycolumn and not col.essential:
            col = col.right
        if col == self.dummycolumn:
            all_solutions.append(list(curr_solution))
            return True
        if maxsel != -1 and len(curr_solution) >= maxsel:
            return False
        # Choose column with minimum size
        min_col = col
        ptr = col.right
        while ptr != self.dummycolumn and ptr.essential:
            if ptr.size < min_col.size:
                min_col = ptr
            ptr = ptr.right
        if min_col.size == 0:
            return False
        flag = False
        min_col.remove_column()
        ptr = min_col.dummycell.down
        while ptr != min_col.dummycell:
            curr_solution.append(ptr.row_id)
            right_ptr = ptr.right
            while right_ptr != ptr:
                if right_ptr.column is not None:
                    right_ptr.column.remove_column()
                right_ptr = right_ptr.right
            if self.solve(all_solutions, curr_solution, allneeded, maxsel):
                flag = True
            left_ptr = ptr.left
            while left_ptr != ptr:
                if left_ptr.column is not None:
                    left_ptr.column.restore_column()
                left_ptr = left_ptr.left
            curr_solution.pop()
            if flag and not allneeded:
                min_col.restore_column()
                return flag
            ptr = ptr.down
        min_col.restore_column()
        return flag 