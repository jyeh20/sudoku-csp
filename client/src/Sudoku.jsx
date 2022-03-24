import React, { useState, useRef, useEffect } from "react";
import { getFirestore, collection, getDocs } from "firebase/firestore/lite";

import "./App.css";

import { getBoardFromString, safeToAdd } from "./utils/utils";

import Board from "./components/Board/Board";
import SpeedSelector from "./components/SpeedSelector/SpeedSelector";
import Button from "./components/Button/Button";

import app from "./firebase";

const Sudoku = () => {
  const db = getFirestore(app);
  const [board, setBoard] = useState([
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
  ]);
  const [speed, setSpeed] = useState(5);

  useEffect(() => {
    async function setBoardAsAsync(newBoard) {
      return setBoard(newBoard);
    }
    // Thanks to Geeks for geeks: https://www.geeksforgeeks.org/sudoku-backtracking-7/
    async function solveBoard(r, c) {
      let row = r;
      let col = c;
      if (row === board.length - 1 && col === board.length) {
        return true;
      }

      if (col === board.length) {
        row++;
        col = 0;
      }

      if (board[row][col] > 0) {
        return solveBoard(row, col + 1);
      }
      for (let val = 1; val <= board.length; val++) {
        if (safeToAdd(board, row, col, val)) {
          let boardCopy = board;
          boardCopy[row][col] = val;
          console.log(boardCopy);
          setBoardAsAsync(boardCopy);
          // setBoardAsAsync(boardCopy).then(() => {
          //   if (solveBoard(row, col + 1)) {
          //     return true;
          //   }
          // });
        }
        //   let boardCopy = board;
        //   boardCopy[row][col] = 0;
        //   setBoardAsAsync(boardCopy);
      }
      return false;
    }

    solveBoard(0, 0);

    const updateBoard = (oldBoard) => {
      let boardCopy = oldBoard;
      boardCopy[1][1] = 8;
      setBoard(boardCopy);
    };
    setTimeout(() => {
      updateBoard(board);
    }, 5000);
  }, []);

  const flattenBoard = () => {
    const flattenedBoard = [];
    for (let r = 0; r < board.length; r++) {
      let row = board[r];
      for (let col = 0; col < row.length; col++) {
        let val = row[col];
        flattenedBoard.push({ val, col: col + 1, row: r + 1 });
      }
    }
    return flattenedBoard;
  };

  return (
    <div className="Sudoku">
      <SpeedSelector />
      <Board board={flattenBoard()} />
      <div className="Sudoku-get-regular-board">
        <Button>Get Regular</Button>
      </div>
      <div className="Sudoku-get-miracle-board">
        <Button>Get Miracle</Button>
      </div>
      <div className="Sudoku-solve-regular-board">
        <Button>Solve Regular</Button>
      </div>
      <div className="Sudoku-solve-miracle-board">
        <Button>Solve Miracle</Button>
      </div>
    </div>
  );
};

export default Sudoku;
