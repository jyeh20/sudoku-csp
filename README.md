# Sudoku Solver Visualizer using Backtracking
### Author: Jonathan Yeh

## Project Site:
https://main.dpooqqaq63xk8.amplifyapp.com/

## Description:
A Sudoku Solver using a simple backtracking algorithm wrapped with ReactJS
Can visualize regular Sudoku, and Miracle Sudoku

## Sudoku Rules:
Using the numbers 1-9, fill out the board
Constraints for number placement are
* A number cannot be in the same row more than once
* A number cannot be in the same column more than once
* A number cannot be in the same 3x3 box more than once
  * The 9x9 board is divided evenly in 3x3 sections

## Miracle Sudoku Rules:
Same rules as regular Sudoku apply with 2 added constraints:
* A number cannot be a knight's move away from a number identical to itself
  * In chess, a knight's move is an "L" shape away made up of 3 tiles total
* A number cannot be a king's move away from a number identical to itself
  * In chess, a king's move is just 1 tile away in any direction
