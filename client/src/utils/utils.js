const getBoardFromString = (string) => {
  let board = [];
  let currentRow = [];
  for (let i = 0; i < string.length; i++) {
    let letter = parseInt(string[i]);
    if (currentRow.length === 9) {
      board.push(currentRow);
      currentRow = [];
    }
    currentRow.push(letter);
  }
  return board;
};

/**
 * @param {Board} board 2D Array representing a board
 * @param {Number} rowIndex Index of row to check
 * @param {Number} val The value to add
 * @return Whether it is safe to add the given val to a row
 */
const safeToAddToRow = (board, rowIndex, val) => {
  const row = board[rowIndex];
  for (let i = 0; i < row.length; i++) {
    if (row[i] === val) {
      return false;
    }
  }
  return true;
};

/**
 * @param {Board} board 2D Array representing a board
 * @param {Number} colIndex Index of row to check
 * @param {Number} val The value to add
 * @return Whether it is safe to add the given val to a column
 */
const safeToAddToCol = (board, colIndex, val) => {
  for (let row = 0; row < board.length; row++) {
    if (board[row][colIndex] === val) {
      return false;
    }
  }
  return true;
};

/**
 *
 * @param {Board} board 2D Array representing a board
 * @param {Number} centerRow Index of a row
 * @param {Number} centerCol Index of a col
 * @param {Number} val The value to add
 * @returns Whether it is safe to add the given val to a 3x3 box
 */
const safeToAddToBox = (board, centerRow, centerCol, val) => {
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      if (board[centerRow + i][centerCol + j] === val) {
        return false;
      }
    }
  }
  return true;
};

const safeToAdd = (board, row, col, val) => {
  if (!safeToAddToRow(board, row, val)) {
    return false;
  }
  if (!safeToAddToCol(board, col, val)) {
    return false;
  }
  if (row === 1 || row === 4 || row === 7) {
    if (col === 1 || col === 4 || col === 7) {
      if (!safeToAddToBox(board, row, col, val)) {
        return false;
      }
    }
  }

  return true;
};

export { getBoardFromString, safeToAdd };
