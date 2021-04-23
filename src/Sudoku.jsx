import React, { useState, useEffect, useRef } from 'react'

import { makeStyles } from '@material-ui/core/styles'

import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'

export default function Sudoku() {
  const classes = useStyles()

  // Refs
  const originalBoard = useRef([[0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0]])
  const puzzle = useRef(originalBoard.current)
  const nodes = useRef([])
  const coordinates = useRef([-1,-1])

  // States
  const [loading, setLoading] = useState(false)
  const [miracleSolving, setMiracleSolving] = useState(false)
  const [solving, setSolving] = useState(false)
  const [numberMap, setNumberMap] = useState(null)
  const [boardState, setBoardState] = useState(0)
  const [statesArray, setStatesArray] = useState([])

  /**
   * Node class for holding values in our sudoku structure
   */
  class NumberTuple {
    constructor(row, col, value) {
      this.row = row
      this.col = col
      this.value = value
    }
  }

  useEffect(() => {
    initializeDisplay()
  }, [puzzle])

  useEffect(() => {
    if (solving) {
      if (boardState === statesArray.length) {
        setSolving(!solving)
        return
      }
      let row = statesArray[boardState][0]
      let col = statesArray[boardState][1]
      let value = statesArray[boardState][2]
      coordinates.current = [row, col]
      puzzle.current = (adjustNode(row, col, value))
      sleep(5)
      setBoardState(boardState + 1)
    }
  }, [coordinates, boardState, solving])

  const sleep = (milliseconds) => {
    const date = Date.now()
    let currentDate = null
    do {
      currentDate = Date.now()
    } while (currentDate - date < milliseconds)
  }

  // Constraints when adding a value
  const rowConstraint = (board, row, value) => {
    for (let col = 0; col < board[row].length; col++) {
      if (board[row][col] === 0) {
        continue
      }
      if (board[row][col] === value) {
        return false
      }
    }
    return true
  }

  const colConstraint = (board, col, value) => {
    for (let row = 0; row < board.length; row++) {
      if (board[row][col] === 0) {
        continue
      }
      if (board[row][col] === value) {
        return false
      }
    }
    return true
  }

  const boxConstraint = (board, row, col, value) => {
    let posRow = 0
    let posCol = 0
    if (row <= 2) {
      posRow = 1
    } else if (row >= 6) {
      posRow = 7
    } else {
      posRow = 4
    }

    if (col <= 2) {
      posCol = 1
    } else if (col >= 6) {
      posCol = 7
    } else {
      posCol = 4
    }

    for (let r = -1; r <= 1; r++) {
      for (let c = -1; c <= 1; c++) {
        if (board[posRow + r][posCol + c] === 0) {
          continue
        }
        if (board[posRow + r][posCol + c] === value) {
          return false
        }
      }
    }
    return true
  }

  const checkConstraints = (board, row, col, value) => {
    const rc = rowConstraint(board, row, value)
    const cc = colConstraint(board, col, value)
    const bc = boxConstraint(board, row, col, value)
    // No errors
    if (rc && cc && bc) {
          return true
    }
    // At least one error
    return false
  }

  // Miracle Sudoku constraints when adding a value
  const knightsMoveConstraint = (board, row, col, value) => {
    let positions = [1, 2]
    for (let i = 0; i < 8; i++) {
      if (i === 4) {
        positions = [2,1]
      }
      if ((row + positions[0] < 0) || (col + positions[1] < 0)
          || (row + positions[0] > 8) || (col + positions[1]) > 8) {
        if (i % 2 === 0) {
          positions = [positions[0], (-1 * positions[1])]
        } else {
          positions = [(-1 * positions[0]), positions[1]]
        }
        continue
      }
      let position = board[row+positions[0]][col+positions[1]]
      if (position === 0) {
        if (i % 2 === 0) {
          positions = [positions[0], (-1 * positions[1])]
        } else {
          positions = [(-1 * positions[0]), positions[1]]
        }
        continue
      }
      if (position === value) {
        return false
      }
      if (i % 2 === 0) {
        positions = [positions[0], (-1 * positions[1])]
      } else {
        positions = [(-1 * positions[0]), positions[1]]
      }
    }
    return true
  }

  const kingsMoveConstraint = (board, row, col, value) => {
    for (let r = -1; r <= 1; r++) {
      for (let c = -1; c <= 1; c++) {
        if ((row + r) < 0 || (col + c) < 0
            || (row + r) > 8 || (col + c) > 8) {
          continue
        }
        let position = board[row+r][col+c]
        if (position === 0) {
          continue
        }
        if (position === value) {
          return false
        }
      }
    }

    return true
  }

  const checkMiracleConstraints = (board, row, col, value) => {
    let cc = checkConstraints(board, row, col, value)
    let knights = knightsMoveConstraint(board, row, col, value)
    let kings = kingsMoveConstraint(board, row, col, value)

    if (cc && knights && kings) {
      return true
    }

    return false
  }

  // Constraints for the visualizer
  const rowVisualizerConstraint = (board, row) => {
    let visited = new Set()
    for (let col = 0; col < board[row].length; col++) {
      let value = board[row][col]
      if (value === 0) {
        continue
      }
      if (visited.has(value)) {
        return false
      }
      visited.add(value)
    }
    return true
  }

  const colVisualizerConstraint = (board, col) => {
    let visited = new Set()
    for (let row = 0; row < board.length; row++) {
      let value = board[row][col]
      if (value === 0) {
        continue
      }
      if (visited.has(value)) {
        return false
      }
      visited.add(value)
    }
    return true
  }

  const boxVisualizerConstraint = (board, row, col) => {
    let visited = new Set()
    let posRow = 0
    let posCol = 0
    if (row <= 2) {
      posRow = 1
    } else if (row >= 6) {
      posRow = 7
    } else {
      posRow = 4
    }

    if (col <= 2) {
      posCol = 1
    } else if (col >= 6) {
      posCol = 7
    } else {
      posCol = 4
    }

    for (let r = -1; r <= 1; r++) {
      for (let c = -1; c <= 1; c++) {
        let value = board[posRow + r][posCol + c]
        if (value === 0) {
          continue
        }
        if (visited.has(value)) {
          return false
        }
        visited.add(value)
      }
    }
    return true
  }

  const checkVisualizerConstraints = (board, row, col) => {
    const rc = rowVisualizerConstraint(board, row)
    const cc = colVisualizerConstraint(board, col)
    const bc = boxVisualizerConstraint(board, row, col)
    // No errors
    if (rc && cc && bc) {
          return true
    }
    // At least one error
    return false
  }

  // Miracle constraints for visualizer
  const knightsMoveVisualizerConstraint = (board, row, col) => {
    let value = board[row][col]
    let positions = [1, 2] // positions array for checking

    for (let i = 0; i < 8; i++) {
      if (i === 4) { // swap rows/cols at 4th iteration
        positions = [2,1]
      }
      if ((row + positions[0] < 0) || (col + positions[1] < 0)
          || (row + positions[0] > 8) || (col + positions[1]) > 8) {
        if (i % 2 === 0) {
          positions = [positions[0], (-1 * positions[1])]
        } else {
          positions = [(-1 * positions[0]), positions[1]]
        }
        continue
      }
      let positionValue = board[row+positions[0]][col+positions[1]]
      if (positionValue === 0) {
        if (i % 2 === 0) {
          positions = [positions[0], (-1 * positions[1])]
        } else {
          positions = [(-1 * positions[0]), positions[1]]
        }
        continue
      }
      if (positionValue === value) {
        // error
        console.log(row, col, "knight")
        return false
      }
      if (i % 2 === 0) {
        positions[1] *= -1
      } else {
        positions[0] *= -1
      }
    }

    // no errors
    return true
  }

  const kingsMoveVisualizerConstraint = (board, row, col) => {
    let value = board[row][col]
    for (let r = -1; r <= 1; r++) {
      for (let c = -1; c <= 1; c++) {
        if ((row + r) < 0 || (col + c) < 0
            || (row + r) > 8 || (col + c) > 8) {
          continue
        }
        if (r == 0 && c == 0) {
          continue
        }
        let position = board[row+r][col+c]
        if (position === 0) {
          continue
        }
        if (position === value) {
          // error
          return false
        }
      }
    }

    // no errors
    return true
  }

  const checkMiracleVisualizerConstraints = (board, row, col) => {
    let cc = checkVisualizerConstraints(board, row, col)
    let knights = knightsMoveVisualizerConstraint(board, row, col)
    let kings = kingsMoveVisualizerConstraint(board, row, col)

    if (cc && knights && kings) {
      return true
    }

    return false
  }

  const getNextEmptySpot = (board) => {
    for (let row = 0; row < board.length; row++) {
      for (let col = 0; col < board[row].length; col++) {
        if (board[row][col] === 0) {
          coordinates.current = [row, col]
          return [row, col]
        }
      }
    }
    return [-1, -1]
  }

  let stateArray = []

  function getSolution (board) {
    setLoading(true)
    let coords = getNextEmptySpot(board)
    let row = coords[0]
    let col = coords[1]

    // Base Case, no empty spots so we return the completeted board
    if (row === -1) {
      setStatesArray(stateArray)
      setSolving(true)
      setLoading(false)
      return
    }

    // Try every value that fits constraints
    for (let value = 1; value <= 9; value++) {
      if (checkConstraints(board, row, col, value)) {
        board[row][col] = value
        stateArray[stateArray.length] = [row, col, value]
        getSolution(board)
      }
    }

    // Unsolvable
    if (getNextEmptySpot(board)[0] !== -1) {
      board[row][col] = 0
    }
    setLoading(false)
    return
  }

  function getMiracleSolution () {
    setLoading(true)
    let coords = getNextEmptySpot(originalBoard.current)
    let row = coords[0]
    let col = coords[1]

    // Base Case, no empty spots so we return the completeted board
    if (row === -1) {
      setStatesArray(stateArray)
      setSolving(true)
      setLoading(false)
      return
    }

    // Try every value that fits constraints
    for (let value = 1; value <= 9; value++) {
      if (checkMiracleConstraints(originalBoard.current, row, col, value)) {
        originalBoard.current[row][col] = value
        stateArray[stateArray.length] = [row, col, value]
        getMiracleSolution()
      }
    }

    // Unsolvable
    if (getNextEmptySpot(originalBoard.current)[0] !== -1) {
      stateArray[stateArray.length] = [row, col, 0]
      originalBoard.current[row][col] = 0
    }
    setLoading(false)
    return
  }

  function solve () {
    getSolution(originalBoard.current)
  }

  function miracleSolve () {
    setMiracleSolving(true)
    getMiracleSolution()
  }

  const initializeDisplay = () => {
    let nums = []
    for (let row = 0; row < originalBoard.current.length; row++) {
      for (let col = 0; col < originalBoard.current[row].length; col++) {
        nums.push(new NumberTuple(row, col, puzzle.current[row][col]))
      }
    }

    nodes.current = nums
    displayNodes(nums)

    return nums
  }

  const displayNodes = (nums) => {
    const numMap = nums.map((num) =>
      <SmallBox solving={solving} constraints={(miracleSolving) ? checkMiracleVisualizerConstraints : checkVisualizerConstraints} puzzle={puzzle.current}
      coords={coordinates.current} value={num.value} row={num.row} col={num.col} handleClick={handleClick}/>
    )

    setNumberMap(numMap)
  }

  const adjustNode = (row, col, value) => {
    const index = (row * 9) + col
    nodes.current[index].value = value
    originalBoard.current[row][col] = value
    puzzle.current=originalBoard.current
    displayNodes(nodes.current)
    return puzzle.current
  }

  const handleClick = (row, col) => {
    let val = originalBoard.current[row][col]
    if (val === 9) {
      val = 0
    } else {
      val++
    }
    coordinates.current = [row, col]
    originalBoard.current = adjustNode(row, col, val)
    puzzle.current = originalBoard
  }

  return (
    <div className={classes.wrapper}>
      <div className={classes.box}>
        <>{numberMap}</>
      </div>
      <button disabled={solving || loading} onClick={solve}>solve</button>
      <button disabled={solving || loading} onClick={miracleSolve}>Miracle solve</button>
    </div>
  )
}

const SmallBox = ({solving, constraints, puzzle, coords, value, row, col, handleClick}) => {
  const classes = useStyles()
  const red = '#FFAAAA'
  const white = '#FFFFFF'
  const blue = '#AADDFF'
  const green = '#BBFFCC'
  let val = value
  if (val === 0) {
    val = ""
  }
  function getColor() {
    if (coords[0] !== -1) {
      if (!constraints(puzzle, row, col)) {
        return red
      }
    }
    if (row === coords[0] && col === coords[1]) {
      return blue
    }
    if (coords[0] !== -1 && solving) {
      if (!constraints(puzzle, row, col)) {
        return red
      }
    }
    if (value === 0) {
      return green
    }
    return white
  }
  return(
    <div className={classes.smallBox} style={{background: `${getColor()}`}} onClick={() => {handleClick(row, col)}}>
      {val}
    </div>
  )
}

const useStyles = makeStyles(() => ({
  wrapper: {
    display: 'flex',
    height: '100vh',
    width: '100vw',
    background: '#EEEEEE',
    flexDirection: 'column',
  },

  box: {
    margin: 'auto',
    marginTop: 'auto',
    marginBottom: 'auto',
    background: '#EEEEEE',
    width: '576px',
    height: '576px',
    display: 'flex',
    flexWrap: 'wrap'
  },

  smallBox: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '62px',
    height: '62px',
    border: '1px solid black',
    '&:hover': {
      background: '#00DDFF'
    }
  }
}))